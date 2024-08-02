import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import BaseApplicationGenerator from 'generator-jhipster/generators/spring-boot';
import { prepareSqlApplicationProperties } from 'generator-jhipster/generators/spring-data-relational/support';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';
import { files as entityServerFiles } from 'jhipster-7-templates/esm/generators/entity-server';
import { files as serverFiles } from 'jhipster-7-templates/esm/generators/server';

import { convertToKotlinFile } from '../kotlin/support/files.js';
import migration from './migration.cjs';

const { jhipsterConstants, jhipster7DockerContainers } = migration;
const {
    DOCKER_COMPOSE_FORMAT_VERSION,
    SPRING_BOOT_VERSION,
    LIQUIBASE_VERSION,
    HIBERNATE_VERSION,
    JACOCO_VERSION,
    JIB_VERSION,
    GRADLE_VERSION,
    JHIPSTER_DEPENDENCIES_VERSION,
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
    MAIN_DIR,
} = jhipsterConstants;

const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));

const SERVER_MAIN_SRC_KOTLIN_DIR = `${MAIN_DIR}kotlin/`;

const JAVA_VERSION = '17';
const JAVA_COMPATIBLE_VERSIONS = ['17'];

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, { ...features, jhipster7Migration: true, checkBlueprint: true, inheritTasks: true, queueCommandTasks: true });

        this.jhipsterTemplatesFolders = [
            this.templatePath(),
            join(jhipster7TemplatesPackage, 'generators/server/templates/'),
            join(jhipster7TemplatesPackage, 'generators/entity-server/templates/'),
        ];
    }

    async beforeQueue() {
        await this.dependsOnJHipster('jhipster-kotlin:migration');
        await this.dependsOnJHipster('jhipster-kotlin:kotlin');
        await this.dependsOnJHipster('server');
        await this.dependsOnJHipster('jhipster:java:domain');
        await this.dependsOnJHipster('jhipster-kotlin:ktlint');
    }

    get [BaseApplicationGenerator.COMPOSING]() {
        const mainComposing = super.composing;
        return this.asComposingTaskGroup({
            async composeDetekt() {
                await this.composeWithJHipster('jhipster-kotlin:detekt');
            },
            async composeWithPostWriting() {
                await this.composeWithJHipster('docker');

                if (this.jhipsterConfigWithDefaults.applicationType === 'gateway') {
                    // Use gateway package.json scripts.
                    await this.composeWithJHipster('jhipster:spring-cloud:gateway');
                }
            },
            ...mainComposing,
            async composing(...args) {
                const { skipPriorities } = this.options;
                this.options.skipPriorities = ['postWriting'];
                await mainComposing.composing.call(this, ...args);
                this.options.skipPriorities = skipPriorities;
            },
        });
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            ...super.loading,
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // syncUserWithIdp disabled is not supported by kotlin blueprint
                    syncUserWithIdp: application.authenticationType === 'oauth2',
                });

                application.customizeTemplatePaths.unshift(
                    // Remove package-info.java files
                    file => (file.sourceFile.includes('package-info.java') ? undefined : file),
                    file => {
                        // Don't use liquibase.gradle from liquibase generator
                        if (['gradle/liquibase.gradle'].includes(file.sourceFile)) return undefined;
                        // Passthrough non liquibase files
                        if (!file.sourceFile.includes('src/main/resources/config/liquibase')) return file;
                        // Use master.xml from jhipster 7 templates
                        if (file.sourceFile.includes('master.xml')) return file.namespace === 'jhipster:liquibase' ? undefined : file;
                        // Use liquibase templates from liquibase generator
                        return file.namespace === 'jhipster:liquibase' ? file : undefined;
                    },
                    // Ignore gradle convention plugins
                    file => (file.sourceFile.includes('buildSrc/src/main/groovy/') ? undefined : file),
                    // Ignore files from generators
                    file =>
                        [
                            'jhipster:spring-cloud:gateway',
                            'jhipster:spring-cloud-stream:kafka',
                            'jhipster:spring-cloud-stream:pulsar',
                            'jhipster:gatling',
                        ].includes(file.namespace) && !file.sourceFile.includes('_entityPackage_')
                            ? undefined
                            : file,
                    // Kotling blueprint does not implements these files
                    file => {
                        const sourceBasename = basename(file.sourceFile);
                        return [
                            '_persistClass_Asserts.java',
                            '_persistClass_TestSamples.java',
                            'AssertUtils.java',
                            '_entityClass_Repository_r2dbc.java',
                            'ElasticsearchExceptionMapper.java',
                            'ElasticsearchExceptionMapperTest.java',
                            'QuerySyntaxException.java',
                            '_enumName_.java',
                            '_persistClass_.java.jhi.jackson_identity_info',
                        ].includes(sourceBasename)
                            ? undefined
                            : file;
                    },
                    file => {
                        // Use v8 files due to needles
                        if (file.sourceFile.includes('resources/logback')) {
                            return {
                                ...file,
                                resolvedSourceFile: this.fetchFromInstalledJHipster('server/templates/', file.sourceFile),
                            };
                        }
                        return file;
                    },
                    file => {
                        let { resolvedSourceFile, sourceFile, destinationFile, namespace } = file;
                        // Already resolved kotlin files
                        if (resolvedSourceFile.endsWith('.kt') || resolvedSourceFile.includes('.kt.')) {
                            return file;
                        }

                        if (
                            sourceFile.includes('.java') ||
                            // Use local files with updated jhipster 7 templates for these files
                            ['application-testprod.yml', 'application-testdev.yml'].includes(basename(file.sourceFile))
                        ) {
                            // Kotlint User template does not implements Persistable api. Ignore for now.
                            if (application.user && destinationFile.endsWith('UserCallback.java')) {
                                return undefined;
                            }

                            const sourceBasename = basename(sourceFile);
                            if (
                                file.namespace === 'jhipster:spring-data-relational' &&
                                ['UserSqlHelper_reactive.java', 'ColumnConverter_reactive.java', 'EntityManager_reactive.java'].includes(
                                    sourceBasename,
                                )
                            ) {
                                sourceFile = sourceFile.replace('_reactive', '');
                            }

                            const isCommonFile = filename => {
                                const sourceBasename = basename(filename);
                                if (['_entityClass_Repository.java', '_entityClass_Repository_reactive.java'].includes(sourceBasename)) {
                                    return file.namespace !== 'spring-data-couchbase';
                                }
                                return ['TestContainersSpringContextCustomizerFactory.java'].includes(sourceBasename);
                            };

                            // TestContainersSpringContextCustomizerFactory uses a single template for modularized (dbs) and non-modularized (kafka, etc) templates
                            if (sourceFile.endsWith('TestContainersSpringContextCustomizerFactory.java')) {
                                if (isCommonFile(sourceFile)) {
                                    // Use updated path
                                    sourceFile = sourceFile.replace('/package/', '/_package_/');
                                }
                                // Convert *TestContainersSpringContextCustomizerFactory to TestContainersSpringContextCustomizerFactory
                                const adjustTestContainersSpringContextCustomizerFactoryFile = filename =>
                                    filename.replace(
                                        /(\w*)TestContainersSpringContextCustomizerFactory.java/,
                                        'TestContainersSpringContextCustomizerFactory.java',
                                    );
                                sourceFile = adjustTestContainersSpringContextCustomizerFactoryFile(sourceFile);
                                destinationFile = adjustTestContainersSpringContextCustomizerFactoryFile(destinationFile);
                            }

                            sourceFile =
                                file.namespace === 'jhipster-kotlin:spring-boot' || isCommonFile(sourceFile)
                                    ? convertToKotlinFile(sourceFile)
                                    : join(namespace.split(':').pop(), convertToKotlinFile(sourceFile));

                            return {
                                ...file,
                                sourceFile,
                                javaResolvedSourceFile: resolvedSourceFile,
                                resolvedSourceFile: this.templatePath(sourceFile),
                                destinationFile: convertToKotlinFile(destinationFile),
                            };
                        }
                        return file;
                    },
                );
            },
            async migration({ application, applicationDefaults }) {
                // Downgrade elasticsearch to 7.17.4
                Object.assign(application.dockerContainers, {
                    elasticsearchTag: '7.17.4',
                    elasticsearch: `${DOCKER_ELASTICSEARCH_CONTAINER}:7.17.4`,
                });
                const dockerContainersVersions = Object.fromEntries(
                    Object.entries({ ...application.dockerContainers, ...jhipster7DockerContainers }).map(([containerName, container]) => [
                        `DOCKER_${this._.snakeCase(containerName).toUpperCase().replace('_4_', '4')}`,
                        container,
                    ]),
                );

                // Add variables required by V7 templates
                applicationDefaults({
                    ...dockerContainersVersions,
                    testDir: application.packageFolder,
                    javaDir: application.packageFolder,

                    DOCKER_COMPOSE_FORMAT_VERSION,
                    GRADLE_VERSION,
                    SPRING_BOOT_VERSION,
                    LIQUIBASE_VERSION,
                    HIBERNATE_VERSION,
                    JACOCO_VERSION,
                    JIB_VERSION,
                    JACKSON_DATABIND_NULLABLE_VERSION,
                    DOCKER_ELASTICSEARCH_CONTAINER,
                    ELASTICSEARCH_VERSION,
                    otherModules: [],
                    protractorTests: false,
                });

                Object.assign(application, {
                    jhipsterDependenciesVersion: JHIPSTER_DEPENDENCIES_VERSION,
                    JHIPSTER_DEPENDENCIES_VERSION,
                    JAVA_COMPATIBLE_VERSIONS,
                    javaCompatibleVersions: JAVA_COMPATIBLE_VERSIONS,
                    JAVA_VERSION,
                    javaVersion: JAVA_VERSION,
                    SPRING_BOOT_VERSION,
                });
            },
        });
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            ...super.preparing,
            async preparingTemplateTask({ applicationDefaults }) {
                applicationDefaults({
                    __override__: true,
                    // Enabled by default if backendTypeJavaAny, apply for Kotlin as well
                    useNpmWrapper: ({ clientFrameworkAny }) => clientFrameworkAny,
                });
            },
            async migration({ application, applicationDefaults }) {
                // Kotlin templates uses devDatabaseType* without sql filtering.
                prepareSqlApplicationProperties({ application });

                applicationDefaults({
                    __override__: true,
                    gradleVersion: '7.6.4',
                });

                Object.assign(application.javaDependencies, {
                    'spring-boot': SPRING_BOOT_VERSION,
                    'spring-boot-dependencies': SPRING_BOOT_VERSION,
                });

                applicationDefaults({
                    __override__: true,
                    // V7 templates expects prodDatabaseType to be set for non SQL databases
                    prodDatabaseType: ({ prodDatabaseType, databaseType }) => prodDatabaseType ?? databaseType,
                    // V7 templates expects false instead of 'no'
                    searchEngine: ({ searchEngine }) => (searchEngine === 'no' ? false : searchEngine),
                });
            },
            addCacheNeedles({ source, application }) {
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
            ...super.loadingEntities,
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
            ...super.postPreparingEachEntity,
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

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            ...super.default,
            migration({ application }) {
                Object.assign(application, {
                    serviceDiscoveryType: application.serviceDiscoveryType === 'no' ? false : application.serviceDiscoveryType,
                });
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            ...super.writing,
            async writeFiles({ application }) {
                await this.writeFiles({
                    sections: serverFiles,
                    context: application,
                    customizeTemplatePath: file => {
                        const { sourceFile } = file;
                        // Use docker-compose files from docker generator
                        if (
                            sourceFile.includes('src/main/docker') &&
                            !sourceFile.includes('src/main/docker/jhipster-control-center.yml') &&
                            !sourceFile.includes('src/main/docker/jib') &&
                            !sourceFile.includes('src/main/docker/grafana') &&
                            !sourceFile.includes('src/main/docker/monitoring.yml')
                        ) {
                            return undefined;
                        }

                        // Use wrappers scripts from maven/gradle generators
                        if (file.sourceFile.includes('.mvnw') || file.sourceFile.includes('gradle/wrapper/')) {
                            return undefined;
                        }

                        const sourceBasename = basename(sourceFile);

                        // Ignore files migrated to modularized templates
                        return [
                            // jhipster:java:node
                            'npmw',
                            'npmw.cmd',
                            // jhipster:maven
                            'mvnw',
                            'mvnw.cmd',
                            // jhipster:gradle
                            'gradlew',
                            'gradlew.bat',
                            // jhipster:spring-data-couchbase
                            'DatabaseConfiguration_couchbase.java',
                            // jhipster:spring-data-cassandra
                            'DatabaseConfiguration_cassandra.java',
                            'EmbeddedCassandra.java',
                            'CassandraTestContainer.java',
                            'CassandraKeyspaceIT.java',
                            // jhipster:spring-data-mongodb
                            'DatabaseConfiguration_mongodb.java',
                            'EmbeddedMongo.java',
                            'MongoDbTestContainer.java',
                            'InitialSetupMigration.java',
                            // jhipster:spring-data-neo4j
                            'DatabaseConfiguration_neo4j.java',
                            'EmbeddedNeo4j.java',
                            'Neo4jTestContainer.java',
                            'Neo4jMigrations.java',
                            // jhipster:spring-data-elasticsearch
                            'ElasticsearchConfiguration.java',
                            'EmbeddedElasticsearch.java',
                            'ElasticsearchTestContainer.java',
                            'ElasticsearchTestConfiguration.java',
                            'UserSearchRepository.java',
                            // jhipster:spring-data-relational
                            'DatabaseConfiguration_sql.java',
                            // jhipster:cucumber
                            'CucumberIT.java',
                            'StepDefs.java',
                            'UserStepDefs.java',
                            'CucumberTestContextConfiguration.java',
                            'user.feature',
                            'gitkeep',
                            // jhipster:spring-cache
                            'CacheConfiguration.java',
                            'CacheFactoryConfiguration.java',
                            'EmbeddedRedis.java',
                            'RedisTestContainer.java',
                            // jhipster:spring-websocket
                            'WebsocketConfiguration.java',
                            'WebsocketSecurityConfiguration.java',
                            'ActivityService.java',
                            'ActivityDTO.java',
                        ].includes(sourceBasename)
                            ? undefined
                            : file;
                    },
                });
            },
        });
    }

    get [BaseApplicationGenerator.WRITING_ENTITIES]() {
        return this.asWritingEntitiesTaskGroup({
            async writingEntitiesTemplateTask({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtInUser && !entity.builtInAuthority)) {
                    await this.writeFiles({
                        sections: entityServerFiles,
                        context: { ...application, ...entity, entity },
                        rootTemplatesPath: application.reactive ? ['reactive', ''] : [''],
                        customizeTemplatePath: file => {
                            const sourceBasename = basename(file.sourceFile);
                            // Files migrated to modularized templates
                            return [
                                'EntityTest.java',
                                'EntityRepository.java',
                                'EntityRepository_reactive.java',
                                'EntityRowMapper.java',
                                'EntitySqlHelper_reactive.java',
                                'EntityRepositoryInternalImpl_reactive.java',
                                'EntityCallback.java',
                                'EntitySqlHelper_reactive.java',
                                'EntityRepositoryWithBagRelationships.java',
                                'EntityRepositoryWithBagRelationshipsImpl.java',
                                'EntityRepositoryInternalImpl_reactive.java',
                                'EntitySearchRepository.java',
                            ].includes(sourceBasename) || sourceBasename.startsWith('Entity.java.jhi')
                                ? undefined
                                : file;
                        },
                    });
                }
            },

            async writeEnumFiles({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer)) {
                    for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
                        const enumInfo = {
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
                                            file: `${SERVER_MAIN_SRC_KOTLIN_DIR}package/domain/enumeration/Enum.kt`,
                                            renameTo: () =>
                                                `${SERVER_MAIN_SRC_KOTLIN_DIR}${entity.entityAbsoluteFolder}/domain/enumeration/${field.fieldType}.kt`,
                                        },
                                    ],
                                },
                            ],
                            context: enumInfo,
                        });
                    }
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            ...super.postWriting,
            addJHipsterBomDependencies: undefined,
            addSpringdoc: undefined,
            addSpringBootPlugin: undefined,
            addFeignReactor: undefined,
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    if (application.reactive) {
                        this.editFile('pom.xml', contents =>
                            contents.replace(
                                '<arg value="--include-engine"/>',
                                '<jvmarg value="-XX:+AllowRedefinitionToAddDeleteMethods"/><arg value="--include-engine"/>',
                            ),
                        );
                    }

                    source.addMavenDefinition({
                        properties: [
                            { property: 'modernizer-maven-plugin.version', value: application.javaDependencies['modernizer-maven-plugin'] },
                            { property: 'modernizer.failOnViolations', value: 'false' },
                        ],
                    });
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
