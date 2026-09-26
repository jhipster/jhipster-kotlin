import { existsSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';

// Use spring-boot as parent due to this context in generators
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base-core/support';

import { convertToKotlinFile } from '../kotlin/support/files.js';

import { KOTLIN_MAIN_SRC_DIR, KOTLIN_TEST_SRC_DIR } from './kotlin-constants.js';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

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

const templateExistsMemo = new Map();
const templateExists = path => {
    let exists = templateExistsMemo.get(path);
    if (exists === undefined) {
        exists = existsSync(path);
        templateExistsMemo.set(path, exists);
    }
    return exists;
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
        if (this.options.skipPriorities?.includes('writing') && this.options.skipPriorities?.includes('postWriting')) {
            return;
        }
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
                    syncUserWithIdp: application.authenticationType === 'oauth2' && application.databaseType !== 'no',
                });

                (application.customizeTemplatePaths ??= []).unshift(
                    // Remove package-info.java files
                    file => (file.sourceFile.includes('package-info.java') ? undefined : file),
                    // Kotling blueprint does not implements these files
                    file => {
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
                            return templateExists(`${resolvedSourceFile}.ejs`) ? { ...file, resolvedSourceFile } : file;
                        }

                        if (templateExists(`${resolvedSourceFile}.ejs`)) {
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
            springPulsarVersion({ application }) {
                // spring-cloud:pulsar writes <spring-pulsar.version> from javaDependencies['spring-pulsar'], which upstream
                // never sets; the resulting empty property overrides Spring Boot's managed version and breaks the pom.
                const managed = application.javaManagedProperties?.['spring-pulsar.version'];
                if (application.javaDependencies && managed && !application.javaDependencies['spring-pulsar']) {
                    application.javaDependencies['spring-pulsar'] = managed;
                }
            },
            addApplicationPropertiesNeedles({ application, source }) {
                source.addApplicationPropertiesContent = () => undefined;
                source.addApplicationPropertiesProperty = () => undefined;
                // Kotlin port of jhipster:spring-boot addApplicationPropertiesClass, used for example by data-cassandra
                // to bind `application.cassandra.*`.
                source.addApplicationPropertiesClass = ({
                    propertyType,
                    propertyName = propertyType.charAt(0).toLowerCase() + propertyType.slice(1),
                    classStructure,
                }) => {
                    const classProperties = Object.entries(classStructure)
                        .map(([name, type]) => {
                            const [kotlinType, defaultValue] = Array.isArray(type) ? type : [type];
                            return `    var ${name}: ${kotlinType}${defaultValue === undefined ? '? = null' : ` = ${defaultValue}`}`;
                        })
                        .join('\n');
                    this.editFile(
                        `${KOTLIN_MAIN_SRC_DIR}${application.packageFolder}config/ApplicationProperties.kt`,
                        createNeedleCallback({
                            needle: 'application-properties-property',
                            contentToAdd: `val ${propertyName} = ${propertyType}()`,
                        }),
                        createNeedleCallback({
                            needle: 'application-properties-property-class',
                            contentToAdd: `class ${propertyType} {\n${classProperties}\n}`,
                        }),
                    );
                };
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
                application.addLanguageCallbacks = application.addLanguageCallbacks.filter(
                    callback => !callback.toString().includes('MailServiceIT.java'),
                );
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

                    // Kotlin string templates interpolate `$`, synthetic lambda names such as `lambda$query$2` must escape it.
                    const escapeKotlinString = value => value.replaceAll('$', '\\$');
                    this.editFile(
                        `${KOTLIN_TEST_SRC_DIR}${application.packageFolder}config/JHipsterBlockHoundIntegration.kt`,
                        createNeedleCallback({
                            needle: 'blockhound-integration',
                            contentToAdd: [method]
                                .flat()
                                .map(m => `builder.allowBlockingCallsInside("${classPath}", "${escapeKotlinString(m)}")`),
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
            applyKotlinProjectVersion({ application }) {
                if (application.projectVersion === '0.0.1-SNAPSHOT') {
                    application.projectVersion = packageJson.version;
                }
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
            keepNullDefaultsForReactiveSql({ application, entity }) {
                // Spring Data R2DBC leaves null properties out of the INSERT. Liquibase's dropDefaultValue on optional
                // Instant/ZonedDateTime columns leaves MySQL without a default, so those inserts fail with
                // "Field '...' doesn't have a default value". Required columns never had a default to drop.
                if (!application.reactive || !application.databaseTypeSql) return;
                for (const field of entity.fields ?? []) {
                    if (field.shouldDropDefaultValue && !field.fieldValidationRequired) {
                        field.shouldDropDefaultValue = false;
                    }
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
                if (entity.uniqueEnums) {
                    const uniqueEnumsObj = {};
                    for (const enumField of entity.uniqueEnums) {
                        const fieldType = enumField.fieldType || enumField;
                        uniqueEnumsObj[fieldType] = typeof enumField === 'object' ? enumField : { fieldType };
                    }
                    Object.defineProperty(uniqueEnumsObj, Symbol.iterator, {
                        enumerable: false,
                        *value() {
                            yield* Object.values(this);
                        },
                    });
                    entity.uniqueEnums = uniqueEnumsObj;
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            blockhoundMongodb({ application, source }) {
                if (application.reactive && application.databaseTypeMongodb) {
                    // The MongoDB driver managed by Spring Boot 2.7 generates new server session ids with
                    // UUID.randomUUID() (SecureRandom reading /dev/urandom) on the Netty event loop.
                    source.addAllowBlockingCallsInside?.({
                        classPath: 'com.mongodb.internal.session.ServerSessionPool\\$ServerSessionItemFactory',
                        method: 'createNewServerSessionIdentifier',
                    });
                }
            },
            kafkaServiceConnection({ application, source }) {
                // KafkaTestContainer uses @ServiceConnection, but upstream only adds spring-boot-testcontainers
                // through the database generators, so reactive SQL + Kafka apps miss it.
                if (application.messageBrokerKafka) {
                    source.addSpringBootModule?.('spring-boot-testcontainers');
                }
            },
            angularJwtStorage() {
                const authJwtServiceSpec = 'src/main/webapp/app/core/auth/auth-jwt.service.spec.ts';

                if (existsSync(this.destinationPath(authJwtServiceSpec))) {
                    this.editFile(authJwtServiceSpec, content =>
                        content
                            .replace(
                                "import { beforeEach, describe, expect, it, vi } from 'vitest';",
                                "import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';",
                            )
                            .replace(
                                "describe('Auth JWT', () => {",
                                `const createStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: key => store.get(key) ?? null,
    key: index => Array.from(store.keys())[index] ?? null,
    removeItem: key => store.delete(key),
    setItem: (key, value) => store.set(key, value),
  };
};

describe('Auth JWT', () => {`,
                            )
                            .replace(
                                '  beforeEach(() => {',
                                `  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: window.localStorage ?? createStorage() });
    Object.defineProperty(window, 'sessionStorage', { value: window.sessionStorage ?? createStorage() });
  });

  beforeEach(() => {`,
                            ),
                    );
                }
            },
            mysqlTestConnections({ application }) {
                // The MySQL test container allows 20 connections. Test classes that need their own Spring context
                // (e.g. KafkaResourceIT) open a second R2DBC pool and Liquibase connection while the cached context
                // still holds its pool, so Liquibase fails with "Too many connections".
                if (!application.prodDatabaseTypeMysql) return;
                this.editFile(`${application.srcTestResources}conf/mysql/my.cnf`, { ignoreNonExisting: true }, content =>
                    content.replace(/^max_connections=20$/m, 'max_connections=100'),
                );
            },
            dropEmptyConstants({ application }) {
                // Without a built-in user, OAuth2 or Couchbase the Constants.kt template renders only its package line,
                // which ktlint rejects (standard:no-empty-file).
                const constantsFile = `src/main/kotlin/${application.packageFolder}config/Constants.kt`;
                const content = this.readDestination(constantsFile, { defaults: null });
                if (content !== null && !/\bconst val\b/.test(content)) {
                    this.deleteDestination(constantsFile);
                }
            },
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [{ property: 'modernizer.failOnViolations', value: 'false' }],
                    });
                }
            },
            customizeGradleProjectVersion({ application, source }) {
                if (!application.buildToolGradle) return;
                source.addGradleProperty({ property: 'projectVersion', value: application.projectVersion });
                this.editFile('build.gradle', content => content.replace('version = "0.0.1-SNAPSHOT"', 'version = projectVersion'));
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
            exclude("**/DatabaseTestcontainer.kt")
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
