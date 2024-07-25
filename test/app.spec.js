import { expect, beforeAll, describe, it } from 'vitest';
import { defaultHelpers as helpers, runResult } from 'generator-jhipster/testing';
import { JAVA_DOCKER_DIR } from 'generator-jhipster';

import {
    applicationTypes,
    authenticationTypes,
    cacheTypes,
    serviceDiscoveryTypes,
    testFrameworkTypes,
    clientFrameworkTypes,
    buildToolTypes,
    databaseTypes,
} from 'generator-jhipster/jdl';
import migration from '../generators/spring-boot/migration.cjs';

import expectedFiles from './utils/expected-files.js';

const { jhipsterConstants: constants } = migration;

const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { CASSANDRA, H2_DISK, H2_MEMORY, MARIADB, MSSQL, MONGODB, MYSQL, NEO4J, POSTGRESQL, SQL } = databaseTypes;
const { SESSION } = authenticationTypes;
const { EHCACHE, HAZELCAST } = cacheTypes;
const cacheProviders = cacheTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { JWT } = authenticationTypes;
const { CUCUMBER } = testFrameworkTypes;
const { ANGULAR, REACT } = clientFrameworkTypes;
const { GRADLE, MAVEN } = buildToolTypes;

const { MAIN_DIR } = constants;
const NO_CACHE_PROVIDER = cacheProviders.NO;
const SERVER_MAIN_KOTLIN_SRC_DIR = `${MAIN_DIR}kotlin/`;

function shouldBeV3DockerfileCompatible(databaseType) {
    it('creates compose file without container_name, external_links, links', () => {
        runResult.assertNoFileContent(`${JAVA_DOCKER_DIR}app.yml`, /container_name:/);
        runResult.assertNoFileContent(`${JAVA_DOCKER_DIR}app.yml`, /external_links:/);
        runResult.assertNoFileContent(`${JAVA_DOCKER_DIR}app.yml`, /links:/);
        // runResult.assertNoFileContent(`${JAVA_DOCKER_DIR + databaseType}.yml`, /container_name:/);
        runResult.assertNoFileContent(`${JAVA_DOCKER_DIR + databaseType}.yml`, /external_links:/);
        runResult.assertNoFileContent(`${JAVA_DOCKER_DIR + databaseType}.yml`, /links:/);
    });
}

describe('JHipster generator for App generator', () => {
    describe('Default configuration with', () => {
        describe(ANGULAR, () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        withGeneratedFlag: true,
                        blueprints: 'kotlin',
                        jhiPrefix: 'test',
                        skipKtlintFormat: true,
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        clientFramework: ANGULAR,
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files for angular', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with angular value', () => {
                runResult.assertFileContent('.yo-rc.json', /"clientFramework": "angular"/);
            });
            it('generates a README with no undefined value', () => {
                runResult.assertNoFileContent('README.md', /undefined/);
            });
        });

        describe(REACT, () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        clientFramework: REACT,
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files for react', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with react value', () => {
                runResult.assertFileContent('.yo-rc.json', /"clientFramework": "react"/);
            });
        });

        describe.skip('using npm flag', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientPackageManager with npm value', () => {
                runResult.assertFileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
            });
            it('contains install-node-and-npm in pom.xml', () => {
                runResult.assertFileContent('pom.xml', /install-node-and-npm/);
            });
        });

        describe('Gradle', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: GRADLE,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files for gradle', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('Maven with ktlint-format', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        clientFramework: ANGULAR,
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: MYSQL,
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files for angular', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with angular value', () => {
                runResult.assertFileContent('.yo-rc.json', /"clientFramework": "angular"/);
            });
            it('generates a README with no undefined value', () => {
                runResult.assertNoFileContent('README.md', /undefined/);
            });
        });

        describe('Gradle with ktlint-format', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: MYSQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: GRADLE,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files for gradle', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    describe('Application with DB option', () => {
        describe('mariadb', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_DISK,
                        prodDatabaseType: MARIADB,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            shouldBeV3DockerfileCompatible('mariadb');
        });

        describe('couchbase', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        databaseType: 'couchbase',
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected default files', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe(MONGODB, () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: MONGODB,
                        devDatabaseType: MONGODB,
                        prodDatabaseType: MONGODB,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "MongoDB"', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it("doesn't setup liquibase", () => {
                runResult.assertNoFileContent('pom.xml', 'liquibase');
                runResult.assertNoFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(MONGODB);
        });

        describe(NEO4J, () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: NEO4J,
                        devDatabaseType: NEO4J,
                        prodDatabaseType: NEO4J,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "Neo4j"', () => {
                runResult.assertFile(expectedFiles.neo4j);
            });
            it("doesn't setup liquibase", () => {
                runResult.assertNoFileContent('pom.xml', 'liquibase');
                runResult.assertNoFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(NEO4J);
        });

        describe(MSSQL, () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: SQL,
                        devDatabaseType: MSSQL,
                        prodDatabaseType: MSSQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "Microsoft SQL Server"', () => {
                runResult.assertFile(expectedFiles.mssql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
                runResult.assertFileContent('pom.xml', /mssql-jdbc/);
            });
            shouldBeV3DockerfileCompatible(MSSQL);
        });

        describe(CASSANDRA, () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: CASSANDRA,
                        devDatabaseType: CASSANDRA,
                        prodDatabaseType: CASSANDRA,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "Cassandra"', () => {
                runResult.assertFile(expectedFiles.cassandra);
            });
            it("doesn't setup liquibase", () => {
                runResult.assertNoFileContent('pom.xml', 'liquibase');
                runResult.assertNoFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(CASSANDRA);
        });

        describe('cassandra no i18n', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: CASSANDRA,
                        devDatabaseType: CASSANDRA,
                        prodDatabaseType: CASSANDRA,
                        enableTranslation: false,
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "Cassandra"', () => {
                runResult.assertFile(expectedFiles.cassandra);
            });
        });

        describe('MySQL and elasticsearch', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: SQL,
                        devDatabaseType: 'mysql',
                        prodDatabaseType: MYSQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        searchEngine: 'elasticsearch',
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with "MySQL" and "Elasticsearch"', () => {
                runResult.assertFile(expectedFiles.mysql);
                runResult.assertFile(expectedFiles.elasticsearch);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
            shouldBeV3DockerfileCompatible('mysql');
        });

        describe('no database', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MICROSERVICE,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: 'no',
                        devDatabaseType: 'no',
                        prodDatabaseType: 'no',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.microservice);
                runResult.assertFile(expectedFiles.feignConfig);
                runResult.assertFile(expectedFiles.dockerServices);
                runResult.assertNoFile(expectedFiles.userManagementServer);
            });
            it("doesn't setup liquibase", () => {
                runResult.assertNoFileContent('pom.xml', 'liquibase');
                runResult.assertNoFile(expectedFiles.liquibase);
            });
        });
    });

    describe('Application with other options', () => {
        describe('oauth2', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with authenticationType "oauth2"', () => {
                runResult.assertFile(expectedFiles.oauth2);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('oauth2 + elasticsearch', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        searchEngine: 'elasticsearch',
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with authenticationType "oauth2" and elasticsearch', () => {
                runResult.assertFile(expectedFiles.oauth2);
                runResult.assertFile(expectedFiles.elasticsearch);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
                runResult.assertFile(expectedFiles.postgresql);
            });
        });

        describe('oauth2 + mongodb', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: 'oauth2',
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: MONGODB,
                        devDatabaseType: MONGODB,
                        prodDatabaseType: MONGODB,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with authenticationType "oauth2" and mongodb', () => {
                runResult.assertFile(expectedFiles.oauth2);
                runResult.assertFile(expectedFiles.mongodb);
            });
        });

        describe('oauth2 + react, no db, no service discovery & no admin ui', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: 'gateway',
                        authenticationType: 'oauth2',
                        baseName: 'reacttest',
                        blueprints: [],
                        buildTool: 'maven',
                        cacheProvider: 'no',
                        clientFramework: 'react',
                        clientPackageManager: 'npm',
                        clientTheme: 'darkly',
                        clientThemeVariant: 'dark',
                        databaseType: 'no',
                        devDatabaseType: 'no',
                        enableHibernateCache: false,
                        enableSwaggerCodegen: false,
                        enableTranslation: false,
                        entitySuffix: '',
                        jhiPrefix: 'jhi',
                        jwtSecretKey: 'somerandomkey',
                        languages: ['en'],
                        nativeLanguage: 'en',
                        otherModules: [],
                        packageName: 'com.test.reactui',
                        pages: [],
                        prodDatabaseType: 'no',
                        searchEngine: false,
                        serverSideOptions: [],
                        serviceDiscoveryType: 'no',
                        skipCommitHook: true,
                        skipFakeData: false,
                        skipUserManagement: true,
                        testFrameworks: [],
                        withAdminUi: false,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files for the oauth2 + react custom options', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('hazelcast', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });
            it('creates expected files with "Hazelcast"', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);
                runResult.assertFile(expectedFiles.hazelcast);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: 'infinispan',
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });
            it('creates expected files with "Infinispan"', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);

                runResult.assertFile(expectedFiles.infinispan);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan and Eureka', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: EUREKA,
                        clientFramework: ANGULAR,
                        authenticationType: JWT,
                        cacheProvider: 'infinispan',
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });
            it('creates expected files with "Infinispan and Eureka"', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);

                runResult.assertFile(expectedFiles.eureka);
                runResult.assertFile(expectedFiles.infinispan);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Memcached', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: 'memcached',
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });
            it('creates expected files with "Memcached"', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);

                runResult.assertFile(expectedFiles.memcached);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Redis', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: 'redis',
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });
            it('creates expected files with "Redis"', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);

                runResult.assertFile(expectedFiles.redis);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Messaging with Kafka configuration', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: SQL,
                        devDatabaseType: H2_DISK,
                        prodDatabaseType: POSTGRESQL,
                        searchEngine: false,
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: MONOLITH,
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        messageBroker: 'kafka',
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with Kafka message broker enabled', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.gatling);
                runResult.assertFile(expectedFiles.messageBroker);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('API first using OpenAPI-generator (maven)', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: SQL,
                        devDatabaseType: H2_DISK,
                        prodDatabaseType: POSTGRESQL,
                        searchEngine: false,
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: MONOLITH,
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        enableSwaggerCodegen: true,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with OpenAPI first enabled', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
                runResult.assertFile(expectedFiles.gatling);
                runResult.assertFile(expectedFiles.swaggerCodegen);
            });
        });

        describe('API first using OpenAPI-generator (gradle)', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: SQL,
                        devDatabaseType: H2_DISK,
                        prodDatabaseType: POSTGRESQL,
                        searchEngine: false,
                        buildTool: GRADLE,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: MONOLITH,
                        testFrameworks: ['gatling'],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                        enableSwaggerCodegen: true,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with OpenAPI first enabled', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);
                runResult.assertFile(expectedFiles.gradle);
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);
                runResult.assertFile(expectedFiles.gatling);
                runResult.assertFile(expectedFiles.swaggerCodegen);
                runResult.assertFile(expectedFiles.swaggerCodegenGradle);
            });
        });
    });

    describe('Application names', () => {
        describe('package names', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with correct package names', () => {
                runResult.assertFile([`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`]);
                runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`, /package com\.otherpackage/);
                runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`, /class JhipsterApp/);
            });
        });

        describe('bad application name for java', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: '21Points',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with default application name', () => {
                runResult.assertFile([
                    `${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/Application.kt`,
                    `${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/ApplicationWebXml.kt`,
                ]);
                runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/Application.kt`, /class Application/);
            });
        });
    });

    describe('Auth options', () => {
        describe('JWT authentication', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with JWT authentication', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('HTTP session authentication', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: SESSION,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with HTTP session authentication', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    describe('Testing options', () => {
        describe('Cucumber tests', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serverPort: '8080',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        websocket: false,
                        databaseType: SQL,
                        devDatabaseType: H2_DISK,
                        prodDatabaseType: POSTGRESQL,
                        searchEngine: false,
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        applicationType: MONOLITH,
                        testFrameworks: [CUCUMBER],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with Cucumber enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    describe('App with skip client', () => {
        describe('Maven', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        skipClient: true,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        buildTool: MAVEN,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('generates a README with no undefined value', () => {
                runResult.assertNoFileContent('README.md', /undefined/);
            });
            it('generates a pom.xml with no reference to client', () => {
                runResult.assertNoFileContent('pom.xml', 'node.version');
                runResult.assertNoFileContent('pom.xml', 'npm.version');
                runResult.assertNoFileContent('pom.xml', 'frontend-maven-plugin');
            });
            it('generates a .prettierrc with no reference to webpack', () => {
                runResult.assertNoFileContent('.prettierrc', 'webpack');
            });
            it('generates a .prettierrc with no reference to client extensions', () => {
                runResult.assertNoFileContent('.prettierrc', ',js');
                runResult.assertNoFileContent('.prettierrc', ',ts');
                runResult.assertNoFileContent('.prettierrc', ',tsx');
                runResult.assertNoFileContent('.prettierrc', ',css');
                runResult.assertNoFileContent('.prettierrc', ',scss');
            });
        });

        describe('Gradle', () => {
            let runResult;
            beforeAll(async () => {
                runResult = await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                        skipClient: true,
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        buildTool: GRADLE,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    describe('App with skip client and skip user management', () => {
        describe('Maven', () => {
            // let runResult;
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                        skipClient: true,
                        skipUserManagement: true,
                    })
                    .withJHipsterConfig({
                        baseName: 'jhipster',
                        applicationType: MONOLITH,
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        buildTool: MAVEN,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected server files', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertNoFile(expectedFiles.userManagementServer);
            });
            it('creates SecurityConfiguration for default configuration with skip client and skip user management option enabled', () => {
                runResult.assertFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.kt`);
            });
        });
    });

    describe('Eureka', () => {
        describe('gateway with eureka', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: EUREKA,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                runResult.assertFile(expectedFiles.jwtServerGateway);
                runResult.assertFile(expectedFiles.gateway);
                runResult.assertFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });

        describe('gateway with eureka and rate limiting', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: EUREKA,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                runResult.assertFile(expectedFiles.jwtServerGateway);
                runResult.assertFile(expectedFiles.gateway);
                runResult.assertFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });

        describe('microservice with eureka', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MICROSERVICE,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: EUREKA,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: POSTGRESQL,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.microservice);
                runResult.assertFile(expectedFiles.feignConfig);
                runResult.assertFile(expectedFiles.dockerServices);
                runResult.assertFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });

        describe('monolith with eureka', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MONOLITH,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serviceDiscoveryType: 'eureka',
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the monolith application type', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.userManagementServer);
                runResult.assertFile(expectedFiles.postgresql);
                runResult.assertFile(expectedFiles.hibernateTimeZoneConfig);

                runResult.assertFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });

        describe('microservice with gradle and eureka', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MICROSERVICE,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: EUREKA,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: GRADLE,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                        skipClient: true,
                        skipUserManagement: true,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.microservice);
                runResult.assertFile(expectedFiles.feignConfig);
                runResult.assertFile(expectedFiles.microserviceGradle);
                runResult.assertFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
                runResult.assertNoFile(expectedFiles.userManagementServer);
            });
        });
    });

    describe('Consul', () => {
        describe('gateway with consul', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: CONSUL,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                runResult.assertFile(expectedFiles.jwtServerGateway);
                runResult.assertFile(expectedFiles.gateway);
                runResult.assertNoFile(expectedFiles.eureka);
                runResult.assertFile(expectedFiles.consul);
            });
        });

        describe('gateway with consul and rate limiting', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: CONSUL,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                runResult.assertFile(expectedFiles.jwtServerGateway);
                runResult.assertFile(expectedFiles.gateway);
                runResult.assertNoFile(expectedFiles.eureka);
                runResult.assertFile(expectedFiles.consul);
            });
        });

        describe('microservice with consul', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MICROSERVICE,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: CONSUL,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: POSTGRESQL,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.microservice);
                runResult.assertFile(expectedFiles.dockerServices);
                runResult.assertNoFile(expectedFiles.eureka);
                runResult.assertFile(expectedFiles.consul);
            });
        });
    });

    describe('No Service Discovery', () => {
        describe('gateway with no service discovery', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                runResult.assertFile(expectedFiles.jwtServerGateway);
                runResult.assertNoFile(expectedFiles.gateway);
                runResult.assertNoFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });

        describe('microservice with no service discovery', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:server')
                    .withOptions({
                        ignoreNeedlesError: true,
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        skipKtlintFormat: true,
                        blueprints: 'kotlin',
                    })
                    .withJHipsterConfig({
                        applicationType: MICROSERVICE,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: EHCACHE,
                        enableHibernateCache: true,
                        devDatabaseType: POSTGRESQL,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster:languages'])
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                runResult.assertFile(expectedFiles.jwtServer);
                runResult.assertFile(expectedFiles.microservice);
                runResult.assertFile(expectedFiles.dockerServices);
                runResult.assertNoFile(expectedFiles.eureka);
                runResult.assertNoFile(expectedFiles.consul);
            });
        });
    });
});
