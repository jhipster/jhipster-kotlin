import { existsSync } from 'fs';
import { join } from 'path';

// Use spring-boot as parent due to this context in generators
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base-core/support';

import { convertToKotlinFile } from '../kotlin/support/files.js';

import { KOTLIN_TEST_SRC_DIR } from './kotlin-constants.js';

// generator-jhipster's `jhipster:spring-boot:*` sub-generator namespaces don't always match
// the flattened directory names under generators/spring-boot/templates used by the Kotlin
// blueprint (e.g. namespace segment `cache` vs template directory `spring-cache`). Only
// namespaces whose last segment differs from its template directory need an entry here;
// everything else falls back to the last namespace segment (see `prefix` below).
const NAMESPACE_TO_TEMPLATE_PREFIX = {
    'jhipster:spring-boot': '',
    // jwt and oauth2 templates live directly under templates/src, not a dedicated subfolder
    'jhipster:spring-boot:jwt': '',
    'jhipster:spring-boot:oauth2': '',
    'jhipster:spring-boot:cache': 'spring-cache',
    'jhipster:spring-boot:websocket': 'spring-websocket',
    'jhipster:spring-boot:data-cassandra': 'spring-data-cassandra',
    'jhipster:spring-boot:data-couchbase': 'spring-data-couchbase',
    'jhipster:spring-boot:data-elasticsearch': 'spring-data-elasticsearch',
    'jhipster:spring-boot:data-mongodb': 'spring-data-mongodb',
    'jhipster:spring-boot:data-neo4j': 'spring-data-neo4j',
    'jhipster:spring-boot:data-relational': 'spring-data-relational',
};

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, {
            ...features,
            sbsBlueprint: true,
            jhipster7Migration: true,
            checkBlueprint: true,
            inheritTasks: true,
            queueCommandTasks: true,
        });
    }

    async _postConstruct() {
        await this.dependsOnJHipster('jhipster-kotlin:migration');
        // Use _postConstruct so kotlin will be queued before jhipster:spring-boot dependencies
        await this.dependsOnJHipster('jhipster:java:bootstrap');
        await this.dependsOnJHipster('jhipster-kotlin:kotlin');
    }

    async beforeQueue() {
        await this.dependsOnJHipster('jhipster-kotlin:ktlint');
    }

    get [BaseApplicationGenerator.COMPOSING]() {
        return this.asComposingTaskGroup({
            async composeDetekt() {
                await this.composeWithJHipster('jhipster-kotlin:detekt');
            },
            async composeSpringBootV2() {
                await this.composeWithJHipster('jhipster-kotlin:spring-boot-v2');
            },
        });
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // syncUserWithIdp disabled is not supported by kotlin blueprint
                    syncUserWithIdp: application.authenticationType === 'oauth2',
                });

                (application.customizeTemplatePaths ??= []).unshift(
                    // Remove package-info.java files
                    file => (file.sourceFile.includes('package-info.java') ? undefined : file),
                    // Kotling blueprint does not implements these files
                    file => {
                        // We don't want to handle spring-boot-v2 templates here
                        if (file.namespace === 'jhipster-kotlin:spring-boot-v2') return file;
                        const { resolvedSourceFile: javaResolvedSourceFile, namespace: ns } = file;
                        const { sourceFile, destinationFile } = file;
                        // Already resolved kotlin files
                        if (javaResolvedSourceFile && (javaResolvedSourceFile.endsWith('.kt') || javaResolvedSourceFile.includes('.kt.'))) {
                            return file;
                        }

                        // Kotlint User template does not implements Persistable api. Ignore for now.
                        if (application.user && destinationFile.endsWith('UserCallback.java')) {
                            return undefined;
                        }

                        const prefix = ns in NAMESPACE_TO_TEMPLATE_PREFIX ? NAMESPACE_TO_TEMPLATE_PREFIX[ns] : ns.split(':').pop();
                        const kotlinSourceFile = join(prefix, convertToKotlinFile(sourceFile));
                        const resolvedSourceFile = this.templatePath(kotlinSourceFile);

                        if (!sourceFile.includes('.java')) {
                            return existsSync(`${resolvedSourceFile}.ejs`) ? { ...file, resolvedSourceFile } : file;
                        }

                        if (existsSync(`${resolvedSourceFile}.ejs`)) {
                            return {
                                ...file,
                                sourceFile: kotlinSourceFile,
                                resolvedSourceFile,
                                javaResolvedSourceFile,
                                destinationFile: convertToKotlinFile(destinationFile),
                            };
                        }

                        if (resolvedSourceFile.includes('.kt')) {
                            if (resolvedSourceFile.includes('src/test/')) {
                                // Ignore test files that are not converted to kotlin
                                return undefined;
                            }
                        }

                        return {
                            ...file,
                            javaResolvedSourceFile,
                            resolvedSourceFile: javaResolvedSourceFile,
                            destinationFile: convertToKotlinFile(destinationFile, false),
                        };
                    },
                );
            },
        });
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            addApplicationPropertiesNeedles({ source }) {
                source.addApplicationPropertiesContent = () => undefined;
                source.addApplicationPropertiesProperty = () => undefined;
            },
            addSpringIntegrationTest({ source }) {
                source.addIntegrationTestAnnotation = () => undefined;
                // generator-jhipster 9.x's spring-boot sub-generators (data-relational, data-couchbase,
                // data-cassandra, data-neo4j, data-mongodb, data-elasticsearch, cache, oauth2, graalvm)
                // call source.editJavaFile directly on hardcoded *.java paths to inject annotations/imports
                // (e.g. IntegrationTest.java), bypassing addIntegrationTestAnnotation above. Those files are
                // Kotlin here, and the Kotlin templates (see spring-boot/templates/src/test/kotlin/_package_/
                // IntegrationTest.kt.ejs) already bake the equivalent annotations in statically, so no-op it.
                source.editJavaFile = () => undefined;
            },
            // Overrides jhipster:spring-boot's own updateLanguages task (same name, same priority group,
            // sbsBlueprint composition): the upstream version hardcodes a *.java path for MailServiceIT,
            // which doesn't exist here (Kotlin blueprint generates MailServiceIT.kt, which has the same
            // "jhipster-needle-i18n-language-constant" needle) and crashes the build. Point it at the .kt file.
            updateLanguages({ application }) {
                if (!application.enableTranslation || !application.generateUserManagement) return;
                application.addLanguageCallbacks.push((_newLanguages, allLanguages) => {
                    this.editFile(
                        `${KOTLIN_TEST_SRC_DIR}${application.packageFolder}service/MailServiceIT.kt`,
                        { ignoreNonExisting: this.ignoreNeedlesError },
                        createNeedleCallback({
                            contentToAdd: allLanguages.map(language => `"${language.languageTag}"`).join(',\n'),
                            needle: 'jhipster-needle-i18n-language-constant',
                        }),
                    );
                });
            },
            blockhound({ application, source }) {
                source.addAllowBlockingCallsInside = ({ classPath, method }) => {
                    if (!application.reactive) throw new Error('Blockhound is only supported by reactive applications');

                    this.editFile(
                        `${KOTLIN_TEST_SRC_DIR}${application.packageFolder}config/JHipsterBlockHoundIntegration.kt`,
                        createNeedleCallback({
                            needle: 'blockhound-integration',
                            contentToAdd: `builder.allowBlockingCallsInside("${classPath}", "${method}")`,
                        }),
                    );
                };
            },
            async kotlinDefaults({ applicationDefaults }) {
                applicationDefaults({
                    __override__: true,
                    // Enabled by default if backendTypeJavaAny, apply for Kotlin as well
                    useNpmWrapper: ({ clientFrameworkAny }) => clientFrameworkAny,
                });
            },
            addCacheNeedles({ source, application }) {
                // Needle added in jhipster:spring-cache, delay to override it.
                this.delayTask(() => {
                    if (application.cacheProviderEhcache || application.cacheProviderCaffeine || application.cacheProviderRedis) {
                        // The per-provider CacheConfiguration_<provider>.kt.ejs templates are only used to pick
                        // which body gets rendered: upstream strips the `_<provider>` suffix from the destination
                        // file (see replaceEntityFilePathVariables), so the generated file is always named
                        // CacheConfiguration.kt regardless of the selected cacheProvider.
                        const cacheConfigurationFile = `src/main/kotlin/${application.packageFolder}config/CacheConfiguration.kt`;
                        const needle = `${application.cacheProvider}-add-entry`;
                        const useJcacheConfiguration = application.cacheProviderRedis;
                        const addEntryToCacheCallback = entry =>
                            createNeedleCallback({
                                needle,
                                contentToAdd: `createCache(cm, ${entry}${useJcacheConfiguration ? ', jcacheConfiguration' : ''})`,
                            });

                        source.addEntryToCache = ({ entry }) => this.editFile(cacheConfigurationFile, addEntryToCacheCallback(entry));
                        source.addEntityToCache = ({ entityAbsoluteClass, relationships }) => {
                            const entry = `${entityAbsoluteClass}::class.java.name`;
                            this.editFile(
                                cacheConfigurationFile,
                                addEntryToCacheCallback(entry),
                                ...(relationships ?? [])
                                    .filter(rel => rel.collection)
                                    .map(rel => addEntryToCacheCallback(`${entry} + ".${rel.propertyName}"`)),
                            );
                        };
                    } else {
                        // Add noop
                        source.addEntryToCache = () => {};
                        // Add noop
                        source.addEntityToCache = () => {};
                    }
                });
            },
        });
    }

    get [BaseApplicationGenerator.LOADING_ENTITIES]() {
        return this.asLoadingEntitiesTaskGroup({
            migration({ application }) {
                if (application.authority) {
                    // V8 rest api is not compatible with current authority api.
                    application.authority.skipClient = true;
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
        return this.asPostPreparingEachEntityTaskGroup({
            migration({ entity }) {
                // V7 templates expects false instead of 'no'
                entity.searchEngine = entity.searchEngine === 'no' ? false : entity.searchEngine;
                // V7 templates are not compatible with jpaMetamodelFiltering for reactive
                if (this.jhipsterConfig.reactive && entity.jpaMetamodelFiltering) {
                    entity.jpaMetamodelFiltering = false;
                }
            },
            prepareEntityForKotlin({ entity }) {
                const { primaryKey } = entity;
                if (primaryKey && primaryKey.name === 'id') {
                    // Kotlin does not support string ids specifications.
                    primaryKey.javaBuildSpecification = 'buildRangeSpecification';
                    for (const field of primaryKey.fields) {
                        field.fieldJavaBuildSpecification = 'buildRangeSpecification';
                    }
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [{ property: 'modernizer.failOnViolations', value: 'false' }],
                    });
                }
            },
            customizeGradleJib({ application }) {
                if (!application.buildToolGradle) return;
                // Workaround java.lang.NoClassDefFoundError: kotlin/jvm/internal/Intrinsics in generated image
                this.editFile('buildSrc/src/main/groovy/jhipster.docker-conventions.gradle', content =>
                    content.replace(
                        'configurationName = "productionRuntimeClasspath"',
                        '// configurationName = "productionRuntimeClasspath"',
                    ),
                );
            },
            customizeGradle({ application }) {
                if (!application.buildToolGradle || !application.devDatabaseTypeH2Any) return;
                let dbConfigPrefix;
                if (application.prodDatabaseTypeMariadb) {
                    dbConfigPrefix = 'Mariadb';
                } else if (application.prodDatabaseTypeMssql) {
                    dbConfigPrefix = 'MsSql';
                } else if (application.prodDatabaseTypeMysql) {
                    dbConfigPrefix = 'Mysql';
                } else if (application.prodDatabaseTypePostgresql) {
                    dbConfigPrefix = 'PostgreSql';
                }
                if (dbConfigPrefix) {
                    this.editFile(
                        'gradle/profile_dev.gradle',
                        content => `${content}
sourceSets {
    test {
        kotlin {
            exclude("**/${dbConfigPrefix}TestContainer.kt")
        }
    }
}
`,
                    );
                }
            },
        });
    }

    delayTask(method) {
        this.queueTask({
            method,
            taskName: `${this.runningState.methodName}(delayed)`,
            queueName: this.runningState.queueName,
        });
    }
}
