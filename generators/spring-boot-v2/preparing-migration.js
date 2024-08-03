import { asWritingTask } from 'generator-jhipster/generators/base-application/support';

import migration from '../spring-boot-v2/migration.cjs';

const { jhipsterConstants, jhipster7DockerContainers } = migration;
const {
    DOCKER_COMPOSE_FORMAT_VERSION,
    SPRING_BOOT_VERSION,
    LIQUIBASE_VERSION,
    HIBERNATE_VERSION,
    JHIPSTER_DEPENDENCIES_VERSION,
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
} = jhipsterConstants;

const JAVA_VERSION = '17';
const JAVA_COMPATIBLE_VERSIONS = ['17'];

const migrationApplicationOverrides = {
    jhipsterDependenciesVersion: JHIPSTER_DEPENDENCIES_VERSION,
    JHIPSTER_DEPENDENCIES_VERSION,
    JAVA_COMPATIBLE_VERSIONS,
    javaCompatibleVersions: JAVA_COMPATIBLE_VERSIONS,
    JAVA_VERSION,
    javaVersion: JAVA_VERSION,
    SPRING_BOOT_VERSION,
    // V7 templates expects prodDatabaseType to be set for non SQL databases
    prodDatabaseType: ({ prodDatabaseType, databaseType }) => prodDatabaseType ?? databaseType,
    // V7 templates expects false instead of 'no'
    searchEngine: ({ searchEngine }) => (searchEngine === 'no' ? false : searchEngine),
    testDir: ({ packageFolder }) => packageFolder,
    javaDir: ({ packageFolder }) => packageFolder,
};

const migrationApplicationDefaults = {
    DOCKER_COMPOSE_FORMAT_VERSION,
    GRADLE_VERSION: ctx => ctx.gradleVersion,
    SPRING_BOOT_VERSION: ctx => ctx.javaDependencies['spring-boot'],
    LIQUIBASE_VERSION: ctx => ctx.javaDependencies.liquibase,
    HIBERNATE_VERSION: ctx => ctx.javaDependencies['hibernate'],
    JACOCO_VERSION: ctx => ctx.javaDependencies['jacoco'],
    JIB_VERSION: ctx => ctx.javaDependencies['lib'],
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
    otherModules: [],
    protractorTests: false,
    devDatabaseTypeMysql: undefined,
    devDatabaseTypeMariadb: undefined,
    devDatabaseTypePostgres: undefined,
    devDatabaseTypeMssql: undefined,
    devDatabaseTypeOracle: undefined,
    devDatabaseTypeH2Disk: undefined,
    devDatabaseTypeH2Memory: undefined,
    devDatabaseTypeH2Any: undefined,
    prodDatabaseTypeMysql: undefined,
    prodDatabaseTypeMariadb: undefined,
    prodDatabaseTypeMssql: undefined,
    prodDatabaseTypePostgresql: undefined,
    prodDatabaseTypeOracle: undefined,
};

const javaDependenciesOverrides = {
    'spring-boot': SPRING_BOOT_VERSION,
    'spring-boot-dependencies': SPRING_BOOT_VERSION,
    'archunit-junit5': '0.22.0',
    liquibase: LIQUIBASE_VERSION,
    hibernate: HIBERNATE_VERSION,
    'feign-reactor-bom': '3.3.0',
    'spring-cloud-dependencies': '2021.0.3',
    'neo4j-migrations-spring-boot-starter': '1.10.1',
    'gradle-openapi-generator': '6.0.1',
    'openapi-generator-maven-plugin': '6.0.1',
    springdoc: '1.6.11',
};

export const migrateApplicationTask = asWritingTask(async function ({ application, applicationDefaults }) {
    // Downgrade elasticsearch to 7.17.4
    Object.assign(application.dockerContainers, {
        elasticsearchTag: ELASTICSEARCH_VERSION,
        elasticsearch: `${DOCKER_ELASTICSEARCH_CONTAINER}:${ELASTICSEARCH_VERSION}`,
    });

    Object.assign(application.javaDependencies, javaDependenciesOverrides);
    Object.assign(application.springBootDependencies, {
        'spring-boot-dependencies': javaDependenciesOverrides['spring-boot'],
    });

    const dockerContainersVersions = Object.fromEntries(
        Object.entries({ ...application.dockerContainers, ...jhipster7DockerContainers }).map(([containerName, container]) => [
            `DOCKER_${this._.snakeCase(containerName).toUpperCase().replace('_4_', '4')}`,
            container,
        ]),
    );

    applicationDefaults({
        __override__: true,
        ...dockerContainersVersions,
        ...migrationApplicationOverrides,
    });

    applicationDefaults(migrationApplicationDefaults);
});
