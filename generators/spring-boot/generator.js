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
import { serverFiles as sqlFiles } from './files-sql.js';

const { jhipsterConstants, jhipster7DockerContainers } = migration;
const {
    DOCKER_COMPOSE_FORMAT_VERSION,
    SPRING_BOOT_VERSION,
    LIQUIBASE_VERSION,
    HIBERNATE_VERSION,
    JACOCO_VERSION,
    JIB_VERSION,
    GRADLE_VERSION,
    JAVA_COMPATIBLE_VERSIONS,
    JHIPSTER_DEPENDENCIES_VERSION,
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
    MAIN_DIR,
} = jhipsterConstants;

const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));

const SERVER_MAIN_SRC_KOTLIN_DIR = `${MAIN_DIR}kotlin/`;

const JAVA_VERSION = '11';

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, { ...features, jhipster7Migration: true, checkBlueprint: true, inheritTasks: true });

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
            async composingTemplateTask() {
                await this.composeCurrentJHipsterCommand();
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

                const isKotlinGeneratorFile = file => file.namespace === 'jhipster-kotlin:spring-boot';

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
                    // Use docker-compose files from docker generator
                    file =>
                        isKotlinGeneratorFile(file) &&
                        file.sourceFile.includes('src/main/docker') &&
                        !file.sourceFile.includes('src/main/docker/jhipster-control-center.yml') &&
                        !file.sourceFile.includes('src/main/docker/jib') &&
                        !file.sourceFile.includes('src/main/docker/grafana') &&
                        !file.sourceFile.includes('src/main/docker/monitoring.yml')
                            ? undefined
                            : file,
                    // Use wrappers scripts from maven/gradle generators
                    file =>
                        isKotlinGeneratorFile(file) &&
                        ([('mvnw', 'mvnw.cmd', 'gradlew', 'gradlew.bat')].includes(file.sourceFile) ||
                            file.sourceFile.includes('.mvnw') ||
                            file.sourceFile.includes('gradle/wrapper/'))
                            ? undefined
                            : file,
                    // Ignore gradle convention plugins
                    file => (file.sourceFile.includes('buildSrc/src/main/groovy/') ? undefined : file),
                    // Ignore files from generators
                    file =>
                        [
                            'jhipster:spring-cloud:gateway',
                            'jhipster:spring-data-cassandra',
                            'jhipster:spring-data-mongodb',
                            'jhipster:spring-data-neo4j',
                            'jhipster:spring-data-relational',
                            'jhipster:spring-data-elasticsearch',
                            'jhipster:spring-cloud-stream:kafka',
                            'jhipster:spring-cloud-stream:pulsar',
                            'jhipster:gatling',
                            'jhipster:cucumber',
                            'jhipster:spring-cache',
                            'jhipster:spring-websocket',
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

                        if (sourceFile.includes('.java')) {
                            const isCommonFile = filename => {
                                const sourceBasename = basename(filename);
                                return (
                                    file.namespace !== 'spring-data-couchbase' &&
                                    ['_entityClass_Repository.java', '_entityClass_Repository_reactive.java'].includes(sourceBasename)
                                );
                            };

                            sourceFile =
                                isKotlinGeneratorFile(file) || isCommonFile(sourceFile)
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
                    'spring-boot': '2.7.3',
                    'spring-boot-dependencies': '2.7.3',
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
                this.queueTask({
                    method: () => {
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
                    },
                    taskName: `${this.runningState.methodName}(delayed)`,
                    queueName: this.runningState.queueName,
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
        const { resetFakeDataSeed, generateKeyStore } = super.writing;
        return this.asWritingTaskGroup({
            resetFakeDataSeed,
            generateKeyStore,
            async writingTemplateTask({ application }) {
                await this.writeFiles({
                    sections: serverFiles,
                    context: application,
                    customizeTemplatePath: file => {
                        const sourceBasename = basename(file.sourceFile);
                        // Files migrated to modularized templates
                        return ['DatabaseConfiguration_couchbase.java'].includes(sourceBasename) ? undefined : file;
                    },
                });
            },
            async writeSqlFiles({ application }) {
                if (!application.databaseTypeSql) return;

                await this.writeFiles({
                    sections: sqlFiles,
                    rootTemplatesPath: application.reactive ? ['sql/reactive', 'sql/common'] : ['sql/common'],
                    context: application,
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
}
