import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import BaseApplicationGenerator from 'generator-jhipster/generators/spring-boot';
import { prepareSqlApplicationProperties } from 'generator-jhipster/generators/spring-data-relational/support';
import { files as entityServerFiles } from 'jhipster-7-templates/esm/generators/entity-server';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';
import { files as serverFiles } from 'jhipster-7-templates/esm/generators/server';

import migration from './migration.cjs';
import { serverFiles as sqlFiles } from './files-sql.js';
import { entityCouchbaseFiles } from './entity-files-couchbase.js';

const { jhipsterConstants, jhipster7DockerContainers } = migration;
const {
    DOCKER_COMPOSE_FORMAT_VERSION,
    SPRING_BOOT_VERSION,
    LIQUIBASE_VERSION,
    HIBERNATE_VERSION,
    JACOCO_VERSION,
    JIB_VERSION,
    JAVA_COMPATIBLE_VERSIONS,
    JHIPSTER_DEPENDENCIES_VERSION,
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
    MAIN_DIR,
    SERVER_MAIN_SRC_DIR,
    SERVER_TEST_SRC_DIR,
    TEST_DIR,
} = jhipsterConstants;

const { couchbaseFiles } = migration;

const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));

const SERVER_MAIN_SRC_KOTLIN_DIR = `${MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_KOTLIN_DIR = `${TEST_DIR}kotlin/`;

const convertToKotlinFile = file =>
    file
        .replace('.java', '.kt')
        .replace(SERVER_MAIN_SRC_DIR, SERVER_MAIN_SRC_KOTLIN_DIR)
        .replace(SERVER_TEST_SRC_DIR, SERVER_TEST_SRC_KOTLIN_DIR);

const customizeSpringBootFiles = file => {
    const { destinationFile } = file;
    // Ignore docker files, use updated docker files from v8 jhipster:docker generator
    if (
        destinationFile.includes('src/main/docker') &&
        !destinationFile.includes('src/main/docker/jhipster-control-center.yml') &&
        !destinationFile.includes('src/main/docker/jib') &&
        !destinationFile.includes('src/main/docker/grafana') &&
        !destinationFile.includes('src/main/docker/monitoring.yml')
    ) {
        return undefined;
    }
    return file;
};

const JAVA_VERSION = '11';
const GRADLE_VERSION = '8.9';

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
        await this.dependsOnJHipster('jhipster:java:build-tool', {
            // We want to use v7 build-tool templates
            generatorOptions: { skipPriorities: ['writing', 'postWriting'] },
        });
        await this.dependsOnJHipster('jhipster-kotlin:migration');
        await this.dependsOnJHipster('jhipster-kotlin:kotlin');
        await this.dependsOnJHipster('server');
        await this.dependsOnJHipster('jhipster-kotlin:ktlint');
    }

    get [BaseApplicationGenerator.COMPOSING]() {
        return this.asComposingTaskGroup({
            async composingTemplateTask() {
                await this.composeCurrentJHipsterCommand();
            },
            async liquibase() {
                if (
                    this.jhipsterConfigWithDefaults.databaseType === 'sql' ||
                    this.jhipsterConfigWithDefaults.databaseMigration === 'liquibase'
                ) {
                    await this.composeWithJHipster('liquibase', {
                        // We want to use v7 liquibase templates.
                        generatorOptions: { skipPriorities: ['writing', 'postWriting'] },
                    });
                }
            },
            async composing() {
                const { applicationType, databaseType } = this.jhipsterConfigWithDefaults;

                await this.composeWithJHipster('docker');

                const generatorOptions = { skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'] };
                if (applicationType === 'gateway') {
                    // Use gateway package.json scripts.
                    await this.composeWithJHipster('jhipster:spring-cloud:gateway', { generatorOptions: { skipPriorities: ['writing'] } });
                }

                if (databaseType === 'sql') {
                    await this.composeWithJHipster('jhipster:spring-data-relational', { generatorOptions });
                } else if (databaseType === 'cassandra') {
                    await this.composeWithJHipster('jhipster:spring-data-cassandra', { generatorOptions });
                } else if (databaseType === 'couchbase') {
                    await this.composeWithJHipster('jhipster:spring-data-couchbase', { generatorOptions });
                } else if (databaseType === 'mongodb') {
                    await this.composeWithJHipster('jhipster:spring-data-mongodb', { generatorOptions });
                } else if (databaseType === 'neo4j') {
                    await this.composeWithJHipster('jhipster:spring-data-neo4j', { generatorOptions });
                }
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

                application.customizeTemplatePaths.push(file => {
                    const { resolvedSourceFile, sourceFile, destinationFile } = file;
                    if (sourceFile.includes('package-info.java')) {
                        return undefined;
                    }
                    if (resolvedSourceFile.includes('.java')) {
                        return {
                            ...file,
                            resolvedSourceFile: this.templatePath(convertToKotlinFile(sourceFile)),
                            destinationFile: convertToKotlinFile(destinationFile),
                        };
                    }
                    return file;
                });
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
                    gradleVersion: GRADLE_VERSION,
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
                    // V7 templates expects prodDatabaseType to be set for non SQL databases
                    prodDatabaseType: ({ prodDatabaseType, databaseType }) => prodDatabaseType ?? databaseType,
                    // V7 templates expects false instead of 'no'
                    searchEngine: ({ searchEngine }) => (searchEngine === 'no' ? false : searchEngine),
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
                    customizeTemplatePath: customizeSpringBootFiles,
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
            cleanupCouchbaseFiles({ application }) {
                if (!application.databaseTypeCouchbase) return;

                if (this.isJhipsterVersionLessThan('7.1.1')) {
                    this.removeFile(
                        `${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/CustomReactiveCouchbaseRepository.kt`,
                    );
                    this.removeFile(`${SERVER_TEST_SRC_KOTLIN_DIR}${application.packageFolder}config/DatabaseConfigurationIT.kt`);
                    this.removeFile(`${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/N1qlCouchbaseRepository.kt`);
                    this.removeFile(
                        `${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/ReactiveN1qlCouchbaseRepository.kt`,
                    );
                    this.removeFile(`${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/CustomN1qlCouchbaseRepository.kt`);
                    this.removeFile(`${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/CustomCouchbaseRepository.kt`);
                    this.removeFile(`${SERVER_MAIN_SRC_KOTLIN_DIR}${application.packageFolder}repository/SearchCouchbaseRepository.kt`);
                    this.removeFile(`${SERVER_TEST_SRC_KOTLIN_DIR}${application.packageFolder}repository/CustomCouchbaseRepositoryTest.kt`);
                }
            },
            async writeCouchbaseFiles({ application }) {
                if (!application.databaseTypeCouchbase) return;

                await this.writeFiles({
                    sections: couchbaseFiles,
                    context: application,
                    rootTemplatesPath: ['couchbase'],
                    customizeTemplatePath: file =>
                        file.sourceFile.includes('.java')
                            ? {
                                  resolvedSourceFile: this.templatePath(`couchbase/${convertToKotlinFile(file.sourceFile)}`),
                                  destinationFile: convertToKotlinFile(file.destinationFile),
                              }
                            : file,
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
                    });

                    if (application.databaseTypeCouchbase) {
                        await this.writeFiles({
                            sections: entityCouchbaseFiles,
                            context: { ...application, ...entity, entity },
                            rootTemplatesPath: 'couchbase',
                        });
                    }
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
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [{ property: 'modernizer.failOnViolations', value: 'false' }],
                    });
                }
            },
        });
    }
}
