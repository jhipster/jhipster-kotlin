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
import { KOTLIN_TEST_SRC_DIR } from './kotlin-constants.js';

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
        return this.asComposingTaskGroup({
            async composeDetekt() {
                await this.composeWithJHipster('jhipster-kotlin:detekt');
            },
            ...super.composing,
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
                        // Passthrough non liquibase files
                        if (!file.sourceFile.includes('src/main/resources/config/liquibase')) return file;
                        // Use master.xml from jhipster 7 templates
                        if (file.sourceFile.includes('master.xml')) return file.namespace === 'jhipster:liquibase' ? undefined : file;
                        // Use liquibase templates from liquibase generator
                        return file.namespace === 'jhipster:liquibase' ? file : undefined;
                    },
                    // Ignore files from generators
                    file =>
                        [
                            'jhipster:spring-cloud:gateway',
                            'jhipster:spring-cloud-stream:kafka',
                            'jhipster:spring-cloud-stream:pulsar',
                        ].includes(file.namespace) && !file.sourceFile.includes('buildSrc')
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
                            '_entityClass_GatlingTest.java',
                        ].includes(sourceBasename)
                            ? undefined
                            : file;
                    },
                    // Updated templates from v8
                    file => {
                        if (!['jhipster-kotlin:spring-boot'].includes(file.namespace)) return file;
                        if (
                            // Use v8 files due to needles
                            file.sourceFile.includes('resources/logback') ||
                            // Updated gradle stack
                            file.sourceFile.endsWith('.gradle') ||
                            ['gradle.properties'].includes(basename(file.sourceFile))
                        ) {
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
                    gradleVersion: '8.9',
                });

                Object.assign(application.javaDependencies, {
                    'spring-boot': SPRING_BOOT_VERSION,
                    'spring-boot-dependencies': SPRING_BOOT_VERSION,
                    'archunit-junit5': '0.22.0',
                    liquibase: '4.15.0',
                    hibernate: '5.6.10.Final',
                    'feign-reactor-bom': '3.3.0',
                    'spring-cloud-dependencies': '2021.0.3',
                    'neo4j-migrations-spring-boot-starter': '1.10.1',
                });
                Object.assign(application.springBootDependencies, {
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
                            // jhipster:java:jib
                            'docker.gradle',
                            // jhipster:java:code-quality
                            'sonar.gradle',
                            // jhipster:java:openapi-generator v7.6.1
                            'swagger.gradle',
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
            addJHipsterBomDependencies({ application, source }) {
                const { applicationTypeGateway, applicationTypeMicroservice, serviceDiscoveryAny, messageBrokerAny, javaDependencies } =
                    application;
                if (applicationTypeGateway || applicationTypeMicroservice || serviceDiscoveryAny || messageBrokerAny) {
                    source.addJavaDependencies?.([
                        {
                            groupId: 'org.springframework.cloud',
                            artifactId: 'spring-cloud-dependencies',
                            type: 'pom',
                            scope: 'import',
                            version: javaDependencies['spring-cloud-dependencies'],
                        },
                    ]);
                }
            },
            addSpringdoc({ application, source }) {
                const springdocDependency = `springdoc-openapi-${application.reactive ? 'webflux' : 'webmvc'}-core`;
                source.addJavaDependencies?.([{ groupId: 'org.springdoc', artifactId: springdocDependency, version: '1.6.11' }]);
            },
            async customizeDependencies({ application, source }) {
                source.addJavaDefinition({
                    dependencies: [
                        { groupId: 'io.dropwizard.metrics', artifactId: 'metrics-core' },
                        { groupId: 'org.zalando', artifactId: `problem-spring-${application.reactive ? 'webflux' : 'web'}` },
                        {
                            groupId: 'tech.jhipster',
                            artifactId: 'jhipster-dependencies',
                            version: application.jhipsterDependenciesVersion,
                            type: 'pom',
                            scope: 'import',
                        },
                    ],
                });

                if (application.authenticationTypeJwt) {
                    source.addJavaDefinition({
                        dependencies: [
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-api' },
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-impl', scope: 'runtime' },
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-jackson', scope: 'compile' },
                        ],
                    });
                } else if (application.authenticationTypeOauth2) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-oauth2-resource-server' }],
                    });
                }

                if (application.applicationTypeGateway || application.applicationTypeMicroservice) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-openfeign' }],
                    });
                }
                if (application.databaseTypeMongodb) {
                    source.addJavaDefinition({
                        dependencies: [
                            { groupId: 'org.mongodb', artifactId: 'mongodb-driver-sync' },
                            ...(application.reactive ? [{ groupId: 'org.mongodb', artifactId: 'mongodb-driver-reactivestreams' }] : []),
                        ],
                    });
                }
                if (application.databaseTypeCassandra) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.cassandraunit', artifactId: 'cassandra-unit-spring' }],
                    });
                }
                if (application.databaseTypeSql && application.reactive) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.apache.commons', artifactId: 'commons-collections4' }],
                    });
                }
            },
            customizeGradle({ application, source }) {
                if (application.buildToolGradle) {
                    source.addGradleProperty({ property: 'mapstructVersion', value: application.javaDependencies.mapstruct });
                    source.addGradleProperty({ property: 'springBootVersion', value: application.javaDependencies['spring-boot'] });
                    if (application.databaseTypeSql) {
                        source.addGradleProperty({ property: 'liquibase.version', value: application.javaDependencies.liquibase });
                        source.addGradleProperty({ property: 'hibernateVersion', value: application.javaDependencies.hibernate });
                        source.addGradleProperty({ property: 'jaxbRuntimeVersion', value: '4.0.0' });
                    }
                    if (application.databaseTypeCassandra) {
                        source.addGradleProperty({ property: 'cassandraDriverVersion', value: '4.14.1' });
                    }
                    source.addGradleDependencies([{ groupId: 'tech.jhipster', artifactId: 'jhipster-framework', scope: 'implementation' }]);
                }
            },
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [
                            { property: 'modernizer-maven-plugin.version', value: application.javaDependencies['modernizer-maven-plugin'] },
                            { property: 'modernizer.failOnViolations', value: 'false' },
                            { property: 'jaxb-runtime.version', value: '4.0.0' },
                            { property: 'spring-boot.version', value: application.javaDependencies['spring-boot'] },
                            { property: 'liquibase-hibernate5.version', value: application.javaDependencies.liquibase },
                            { property: 'liquibase.version', value: application.javaDependencies.liquibase },
                            { property: 'hibernate.version', value: application.javaDependencies.hibernate },
                        ],
                        dependencies: [
                            {
                                groupId: 'tech.jhipster',
                                artifactId: 'jhipster-framework',
                                additionalContent: application.reactive
                                    ? `
            <exclusions>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-webmvc</artifactId>
                </exclusion>
            </exclusions>`
                                    : '',
                            },
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
