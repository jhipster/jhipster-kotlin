const path = require('path');
const { expect } = require('expect');
const assert = require('yeoman-assert');

const { GATEWAY, MICROSERVICE, MONOLITH } = require('generator-jhipster/jdl/jhipster/application-types');
const {
    CASSANDRA,
    COUCHBASE,
    H2_DISK,
    H2_MEMORY,
    MARIADB,
    MSSQL,
    MONGODB,
    MYSQL,
    NEO4J,
    POSTGRESQL,
    SQL,
} = require('generator-jhipster/jdl/jhipster/database-types');
const { SESSION } = require('generator-jhipster/jdl/jhipster/authentication-types');
const { EHCACHE, HAZELCAST } = require('generator-jhipster/jdl/jhipster/cache-types');
const cacheProviders = require('generator-jhipster/jdl/jhipster/cache-types');
const { CONSUL, EUREKA } = require('generator-jhipster/jdl/jhipster/service-discovery-types');
const { JWT } = require('generator-jhipster/jdl/jhipster/authentication-types');
const { CUCUMBER, PROTRACTOR } = require('generator-jhipster/jdl/jhipster/test-framework-types');
const { ANGULAR_X, REACT } = require('generator-jhipster/jdl/jhipster/client-framework-types');
const { GRADLE, MAVEN } = require('generator-jhipster/jdl/jhipster/build-tool-types');

const constants = require('generator-jhipster/generators/generator-constants');
const { skipPrettierHelpers: helpers, shouldBeV3DockerfileCompatible } = require('./utils/utils');

const expectedFiles = require('./utils/expected-files');

const { CLIENT_MAIN_SRC_DIR, MAIN_DIR, SERVER_MAIN_RES_DIR } = constants;
const NO_CACHE_PROVIDER = cacheProviders.NO;
const SERVER_MAIN_KOTLIN_SRC_DIR = `${MAIN_DIR}kotlin/`;

describe('JHipster generator for App generator', () => {
    context('Default configuration with', () => {
        describe(ANGULAR_X, () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        withGeneratedFlag: true,
                        blueprints: 'kotlin',
                        jhiPrefix: 'test',
                        'skip-ktlint-format': true,
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files for angularX', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with angularX value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
            });
            it('contains correct custom prefix when specified', () => {
                assert.fileContent('angular.json', /"prefix": "test"/);
            });
            it('generates a README with no undefined value', () => {
                assert.noFileContent('README.md', /undefined/);
            });
        });

        describe(REACT, () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected default files for react', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with react value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
            });
        });

        describe.skip('using npm flag', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientPackageManager with npm value', () => {
                assert.fileContent('.yo-rc.json', /"clientPackageManager": "npm"/);
            });
            it('contains install-node-and-npm in pom.xml', () => {
                assert.fileContent('pom.xml', /install-node-and-npm/);
            });
        });

        describe('Gradle', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files for gradle', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('Maven with ktlint-format', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files for angularX', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains clientFramework with angularX value', () => {
                assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
            });
            it('contains correct custom prefix when specified', () => {
                assert.fileContent('angular.json', /"prefix": "test"/);
            });
            it('generates a README with no undefined value', () => {
                assert.noFileContent('README.md', /undefined/);
            });
        });

        describe('Gradle with ktlint-format', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files for gradle', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    context('Application with DB option', () => {
        describe('mariadb', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected default files', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            shouldBeV3DockerfileCompatible('mariadb');
        });

        describe(MONGODB, () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with "MongoDB"', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(MONGODB);
        });

        describe(COUCHBASE, () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: COUCHBASE,
                        devDatabaseType: COUCHBASE,
                        prodDatabaseType: COUCHBASE,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .run();
            });

            it('creates expected files with "Couchbase"', () => {
                assert.file(expectedFiles.couchbase);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(COUCHBASE);
        });

        describe(NEO4J, () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with "Neo4j"', () => {
                assert.file(expectedFiles.neo4j);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(NEO4J);
        });

        describe(MSSQL, () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with "Microsoft SQL Server"', () => {
                assert.file(expectedFiles.mssql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.fileContent('pom.xml', /mssql-jdbc/);
            });
            shouldBeV3DockerfileCompatible(MSSQL);
        });

        describe(CASSANDRA, () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with "Cassandra"', () => {
                assert.file(expectedFiles.cassandra);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
            shouldBeV3DockerfileCompatible(CASSANDRA);
        });

        describe('cassandra no i18n', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with "Cassandra"', () => {
                assert.file(expectedFiles.cassandra);
                assert.noFile(expectedFiles.i18n);
                assert.file([`${SERVER_MAIN_RES_DIR}i18n/messages.properties`]);
            });
        });

        describe('MySQL and elasticsearch', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['searchEngine:elasticsearch'],
                    })
                    .run();
            });

            it('creates expected files with "MySQL" and "Elasticsearch"', () => {
                assert.file(expectedFiles.mysql);
                assert.file(expectedFiles.elasticsearch);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
            shouldBeV3DockerfileCompatible('mysql');
        });

        describe('couchbase FTS', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: 'angularX',
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: NO_CACHE_PROVIDER,
                        enableHibernateCache: false,
                        databaseType: COUCHBASE,
                        devDatabaseType: COUCHBASE,
                        prodDatabaseType: COUCHBASE,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: ['searchEngine:couchbase'],
                    })
                    .run();
            });

            it('creates expected files with "Couchbbase FTS"', () => {
                assert.file(expectedFiles.couchbase);
                assert.file(expectedFiles.couchbaseSearch);
            });
            shouldBeV3DockerfileCompatible(COUCHBASE);
        });

        describe('no database', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.userManagementServer);
            });
            it("doesn't setup liquibase", () => {
                assert.noFileContent('pom.xml', 'liquibase');
                assert.noFile(expectedFiles.liquibase);
            });
        });
    });

    context('Application with other options', () => {
        describe('oauth2', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with authenticationType "oauth2"', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.oauth2Client);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
            it('generates README with instructions for OAuth', () => {
                assert.fileContent('README.md', 'OAuth 2.0');
            });
        });

        describe('oauth2 + elasticsearch', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['searchEngine:elasticsearch'],
                    })
                    .run();
            });

            it('creates expected files with authenticationType "oauth2" and elasticsearch', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.oauth2Client);
                assert.file(expectedFiles.elasticsearch);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.postgresql);
            });
        });

        describe('oauth2 + mongodb', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with authenticationType "oauth2" and mongodb', () => {
                assert.file(expectedFiles.oauth2);
                assert.file(expectedFiles.oauth2Client);
                assert.file(expectedFiles.mongodb);
            });
        });

        describe('oauth2 + react, no db, no service discovery & no admin ui', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files for the oauth2 + react custom options', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('uses correct prettier formatting', () => {
                // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
                assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
                assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
            });
        });

        describe('hazelcast', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });
            it('creates expected files with "Hazelcast"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.hazelcast);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });
            it('creates expected files with "Infinispan"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.infinispan);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Infinispan and Eureka', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: EUREKA,
                        clientFramework: ANGULAR_X,
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
                    .run();
            });
            it('creates expected files with "Infinispan and Eureka"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.file(expectedFiles.infinispan);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Memcached', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });
            it('creates expected files with "Memcached"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.memcached);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Redis', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });
            it('creates expected files with "Redis"', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.redis);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('Messaging with Kafka configuration', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['messageBroker:kafka'],
                    })
                    .run();
            });

            it('creates expected files with Kafka message broker enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.messageBroker);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
            });
        });

        describe('API first using OpenAPI-generator (maven)', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['enableSwaggerCodegen:true'],
                    })
                    .run();
            });

            it('creates expected files with OpenAPI first enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
            });
            it('generates README with instructions for OpenAPI generator', () => {
                assert.fileContent('README.md', 'OpenAPI-Generator');
            });
        });

        describe('API first using OpenAPI-generator (gradle)', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['enableSwaggerCodegen:true'],
                    })
                    .run();
            });

            it('creates expected files with OpenAPI first enabled', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.gradle);
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.gatling);
                assert.file(expectedFiles.swaggerCodegen);
                assert.file(expectedFiles.swaggerCodegenGradle);
            });
        });
    });

    context('Application names', () => {
        describe('package names', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with correct package names', () => {
                assert.file([`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`]);
                assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`, /package com\.otherpackage/);
                assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/JhipsterApp.kt`, /class JhipsterApp/);
            });
        });

        describe('bad application name for java', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: '21Points',
                        packageName: 'com.otherpackage',
                        packageFolder: 'com/otherpackage',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with default application name', () => {
                assert.file([
                    `${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/Application.kt`,
                    `${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/ApplicationWebXml.kt`,
                ]);
                assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/otherpackage/Application.kt`, /class Application/);
            });
        });

        describe('application names', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'myapplication',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with correct application name', () => {
                assert.file([`${CLIENT_MAIN_SRC_DIR}app/home/home.route.ts`]);
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/app.module.ts`, /AppModule/);
            });
        });
    });

    context('i18n', () => {
        describe('no i18n', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
                        serviceDiscoveryType: false,
                        authenticationType: JWT,
                        cacheProvider: HAZELCAST,
                        enableHibernateCache: true,
                        databaseType: SQL,
                        devDatabaseType: H2_MEMORY,
                        prodDatabaseType: POSTGRESQL,
                        enableTranslation: false,
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        serverSideOptions: [],
                    })
                    .run();
            });

            it('does not create i18n files if i18n is disabled', () => {
                assert.noFile(expectedFiles.i18n);
                assert.file([`${SERVER_MAIN_RES_DIR}i18n/messages.properties`]);
            });
        });

        describe('with RTL support', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: ANGULAR_X,
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
                        languages: ['ar-ly', 'en'],
                        buildTool: MAVEN,
                        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                        skipClient: false,
                        skipUserManagement: false,
                        serverSideOptions: [],
                    })
                    .run();
            });

            it('creates expected default files for i18n with RTL support', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('contains updatePageDirection in main component', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/main/main.component.ts`, /private updatePageDirection/);
            });
        });
    });

    context('Auth options', () => {
        describe('JWT authentication', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with JWT authentication', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('HTTP session authentication', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with HTTP session authentication', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    context('Testing options', () => {
        describe('Protractor tests', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
                        serverPort: '8080',
                        authenticationType: JWT,
                        serviceDiscoveryType: false,
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
                        testFrameworks: [PROTRACTOR],
                        jhiPrefix: 'jhi',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['en'],
                    })
                    .run();
            });

            it('creates expected files with Protractor enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });

        describe('Cucumber tests', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with Cucumber enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });

    context('App with skip server', () => {
        let runResult;
        before(async () => {
            runResult = await helpers
                .create(path.join(__dirname, '../generators/app'))
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                    skipServer: true,
                    db: 'postgresql',
                    auth: 'jwt',
                    'skip-ktlint-format': true,
                })
                .withPrompts({
                    baseName: 'jhipster',
                    clientFramework: ANGULAR_X,
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: JWT,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr', 'en'],
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                })
                .run();
        });

        it('creates expected files for default configuration with skip server option enabled', () => {
            expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });
        it('generates a README with no undefined value', () => {
            assert.noFileContent('README.md', /undefined/);
        });
        it('generates a .prettierrc with no reference to kt extension', () => {
            assert.noFileContent('.prettierrc', ',kt');
        });
    });

    context('App with skip client', () => {
        describe('Maven', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                        skipClient: true,
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('generates a README with no undefined value', () => {
                assert.noFileContent('README.md', /undefined/);
            });
            it('generates a pom.xml with no reference to client', () => {
                assert.noFileContent('pom.xml', 'node.version');
                assert.noFileContent('pom.xml', 'npm.version');
                assert.noFileContent('pom.xml', 'frontend-maven-plugin');
            });
            it('generates a .prettierrc with no reference to webpack', () => {
                assert.noFileContent('.prettierrc', 'webpack');
            });
            it('generates a .prettierrc with no reference to client extensions', () => {
                assert.noFileContent('.prettierrc', ',js');
                assert.noFileContent('.prettierrc', ',ts');
                assert.noFileContent('.prettierrc', ',tsx');
                assert.noFileContent('.prettierrc', ',css');
                assert.noFileContent('.prettierrc', ',scss');
            });
        });

        describe('Gradle', () => {
            let runResult;
            before(async () => {
                runResult = await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                        skipClient: true,
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files for default configuration with skip client option enabled', () => {
                expect(runResult.getStateSnapshot()).toMatchSnapshot();
            });
            it('generates README with instructions for Gradle', () => {
                assert.fileContent('README.md', './gradlew');
            });
        });
    });

    context('App with skip client and skip user management', () => {
        describe('Maven', () => {
            // let runResult;
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiPrefix: 'test',
                        withGeneratedFlag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                        skipClient: true,
                        skipUserManagement: true,
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected server files', () => {
                assert.file(expectedFiles.server);
                assert.noFile(expectedFiles.userManagementServer);
            });
            it('creates SecurityConfiguration for default configuration with skip client and skip user management option enabled', () => {
                assert.file(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.kt`);
            });
        });
    });

    context('Eureka', () => {
        describe('gateway with eureka', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServerGateway);
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('gateway with eureka and rate limiting', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServerGateway);
                assert.file(expectedFiles.gateway);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with eureka', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.dockerServices);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('monolith with eureka', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: MONOLITH,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                        serverSideOptions: ['serviceDiscoveryType:eureka'],
                    })
                    .run();
            });

            it('creates expected files with the monolith application type', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.userManagementServer);
                assert.file(expectedFiles.postgresql);
                assert.file(expectedFiles.hibernateTimeZoneConfig);
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with gradle and eureka', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.feignConfig);
                assert.file(expectedFiles.microserviceGradle);
                assert.file(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
                assert.noFile(expectedFiles.userManagementServer);
            });
        });
    });

    context('Consul', () => {
        describe('gateway with consul', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServerGateway);
                assert.file(expectedFiles.gateway);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });

        describe('gateway with consul and rate limiting', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServerGateway);
                assert.file(expectedFiles.gateway);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });

        describe('microservice with consul', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.eureka);
                assert.file(expectedFiles.consul);
            });
        });
    });

    context('No Service Discovery', () => {
        describe('gateway with no service discovery', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
                        applicationType: GATEWAY,
                        baseName: 'jhipster',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        clientFramework: ANGULAR_X,
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
                    .run();
            });

            it('creates expected files with the gateway application type', () => {
                assert.file(expectedFiles.jwtServerGateway);
                assert.noFile(expectedFiles.gateway);
                assert.noFile(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });

        describe('microservice with no service discovery', () => {
            before(async () => {
                await helpers
                    .create(path.join(__dirname, '../generators/app'))
                    .withOptions({
                        jhiprefix: 'test',
                        withgeneratedflag: true,
                        'skip-ktlint-format': true,
                        blueprints: 'kotlin',
                    })
                    .withPrompts({
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
                    .run();
            });

            it('creates expected files with the microservice application type', () => {
                assert.file(expectedFiles.jwtServer);
                assert.file(expectedFiles.microservice);
                assert.file(expectedFiles.dockerServices);
                assert.noFile(expectedFiles.eureka);
                assert.noFile(expectedFiles.consul);
            });
        });
    });
});
