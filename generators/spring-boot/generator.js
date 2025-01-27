import { join } from 'path';
import { existsSync } from 'fs';
// Use spring-boot as parent due to this context in generators
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';

import { convertToKotlinFile } from '../kotlin/support/files.js';
import { SERVER_MAIN_SRC_KOTLIN_DIR } from '../kotlin/support/constants.js';
import { KOTLIN_TEST_SRC_DIR } from './kotlin-constants.js';

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
        });
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // syncUserWithIdp disabled is not supported by kotlin blueprint
                    syncUserWithIdp: application.authenticationType === 'oauth2',
                });

                application.customizeTemplatePaths.unshift(
                    // Remove package-info.java files
                    file => (file.sourceFile.includes('package-info.java') ? undefined : file),
                    // Kotling blueprint does not implements these files
                    file => {
                        // We don't want to handle spring-boot-v2 templates here
                        if (file.namespace === 'jhipster-kotlin:spring-boot-v2') return file;
                        const { resolvedSourceFile: javaResolvedSourceFile, namespace: ns } = file;
                        let { sourceFile, destinationFile } = file;
                        // Already resolved kotlin files
                        if (javaResolvedSourceFile && (javaResolvedSourceFile.endsWith('.kt') || javaResolvedSourceFile.includes('.kt.'))) {
                            return file;
                        }

                        if (sourceFile.includes('.java')) {
                            // Kotlint User template does not implements Persistable api. Ignore for now.
                            if (application.user && destinationFile.endsWith('UserCallback.java')) {
                                return undefined;
                            }

                            sourceFile = convertToKotlinFile(sourceFile);
                            destinationFile = convertToKotlinFile(destinationFile);
                        }

                        const prefix = ns === 'jhipster:spring-boot' ? '' : ns.split(':').pop();
                        sourceFile = join(prefix, sourceFile);
                        let resolvedSourceFile = this.templatePath(sourceFile);
                        if (!existsSync(`${resolvedSourceFile}.ejs`)) {
                            if (resolvedSourceFile.includes('.kt')) {
                                // Ignore v8 file if it does not exist
                                return undefined;
                            }
                            resolvedSourceFile = javaResolvedSourceFile;
                        }

                        return { ...file, sourceFile, javaResolvedSourceFile, resolvedSourceFile, destinationFile };
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
                    if (application.cacheProviderEhcache) {
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

    get [BaseApplicationGenerator.WRITING_ENTITIES]() {
        return this.asWritingEntitiesTaskGroup({
            // Can be dropped for jhipster 8.7.0
            async writeEnumFiles({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer)) {
                    for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
                        const enumInfo = {
                            ...application,
                            ...getEnumInfo(field, entity.clientRootFolder),
                            frontendAppName: entity.frontendAppName,
                            packageName: application.packageName,
                            javaPackageSrcDir: application.javaPackageSrcDir,
                            entityJavaPackageFolder: entity.entityJavaPackageFolder,
                            entityAbsolutePackage: entity.entityAbsolutePackage || application.packageName,
                        };
                        await this.writeFiles({
                            blocks: [
                                {
                                    templates: [
                                        {
                                            file: `${SERVER_MAIN_SRC_KOTLIN_DIR}_package_/_entityPackage_/domain/enumeration/_enumName_.kt`,
                                            renameTo: () =>
                                                `${SERVER_MAIN_SRC_KOTLIN_DIR}${entity.entityAbsoluteFolder}/domain/enumeration/${field.fieldType}.kt`,
                                        },
                                    ],
                                },
                            ],
                            rootTemplatesPath: ['../../spring-boot/templates/domain/'],
                            context: enumInfo,
                        });
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
