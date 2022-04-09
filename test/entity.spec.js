const path = require('path');
const assert = require('yeoman-assert');
const fse = require('fs-extra');

const constants = require('generator-jhipster/generators/generator-constants');
const { MapperTypes, ServiceTypes, PaginationTypes } = require('generator-jhipster/jdl/jhipster/entity-options');
const { skipPrettierHelpers: helpers } = require('./utils/utils');

const expectedFiles = require('./utils/expected-files').entity;

const { PAGINATION, INFINITE_SCROLL } = PaginationTypes;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_IMPL, SERVICE_CLASS } = ServiceTypes;
const NO_SERVICE = ServiceTypes.NO;
const NO_PAGINATION = PaginationTypes.NO;
const NO_DTO = MapperTypes.NO;

const { CLIENT_MAIN_SRC_DIR, MAIN_DIR, SERVER_MAIN_RES_DIR, TEST_DIR } = constants;

const SERVER_MAIN_KOTLIN_SRC_DIR = `${MAIN_DIR}kotlin/`;
const SERVER_TEST_KOTLIN_SRC_DIR = `${TEST_DIR}kotlin/`;

describe('JHipster generator for entity', () => {
    context('creation from CLI', () => {
        context('monolith with elasticsearch', () => {
            describe('search, no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('search, no dto, no service, pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: PAGINATION,
                        });
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('search, no dto, no service, infinite-scroll', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });
        });

        context('monolith with couchbase FTS', () => {
            describe('Couchbase search, no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-couchbase-search'), dir);
                        })
                        .withOptions({
                            creationTimestamp: '2016-01-20',
                            withEntities: true,
                            'skip-ktlint-format': true,
                            blueprints: 'kotlin',
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V20160120000110__foo.fts`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });
        });

        context('monolith with entity and dto suffixes', () => {
            describe('with entity and dto suffixes', () => {
                before(() =>
                    helpers
                        .create(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                            blueprints: 'kotlin',
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                        })
                        .run()
                );

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });

                it('correctly writes the repository', () => {
                    assert.fileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository'
                    );
                });

                it('correctly writes the entity', () => {
                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, 'data class FooXXX');
                });

                it('correctly writes the dto file', () => {
                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`, 'data class FooYYY');
                });
            });

            describe('with entity suffix and no dto', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                            blueprints: 'kotlin',
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: SERVICE_IMPL,
                        });
                });

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);

                    assert.noFile([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                    ]);

                    assert.fileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository'
                    );

                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, 'data class FooXXX');
                });
            });
        });

        context('monolith with angularX', () => {
            describe('no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file(expectedFiles.fakeData);
                });
            });

            describe('no dto, no service, with pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, no service, with infinite-scroll', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: 'infinite-scroll',
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, with serviceImpl, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: 'serviceImpl',
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`,
                    ]);
                });
            });

            describe('with dto, service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_CLASS,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
            });

            describe('with angular suffix', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({
                            angularSuffix: 'management',

                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
                });
            });

            describe('with client-root-folder', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({
                            clientRootFolder: 'test-root',

                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });

            describe('with client-root-folder and angular-suffix', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({
                            clientRootFolder: 'test-root',
                            angularSuffix: 'management',

                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolderAndSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });
        });

        context('fake data', () => {
            describe('sql database with fake data disabled', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/psql-with-no-fake-data'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected default files', () => {
                    assert.noFile(expectedFiles.fakeData);
                });
            });
        });

        context('no i18n', () => {
            describe('with dto, serviceImpl, with hazelcast, elasticsearch', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/noi18n'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`]);
                });
            });
        });

        context('all languages', () => {
            describe('no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected languages files', () => {
                    constants.LANGUAGES.forEach(language => {
                        assert.file([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
                    });
                });
            });

            describe('no dto, no service, no pagination with client-root-folder', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({
                            clientRootFolder: 'test-root',

                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: NO_DTO,
                            service: NO_SERVICE,
                            pagination: NO_PAGINATION,
                        });
                });

                it('creates expected languages files', () => {
                    constants.LANGUAGES.forEach(language => {
                        assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/testRootFoo.json`);
                    });
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                });
            });
        });

        context('microservice', () => {
            describe('with client-root-folder microservice', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({
                            clientRootFolder: 'test-root',

                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: INFINITE_SCROLL,
                        });
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2WithRootFolder);
                });
            });

            describe('with default microservice', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: NO_PAGINATION,
                        });
                });

                it('sets expected default clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.gatling);
                    assert.noFile(expectedFiles.clientNg2WithRootFolder);
                });
            });

            describe('with mongodb microservice', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/mongodb-with-relations'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: MAPSTRUCT,
                            service: SERVICE_IMPL,
                            pagination: PAGINATION,
                        });
                });

                it('sets expected custom databaseType', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { databaseType: 'mongodb' });
                });
            });
        });

        context('gateway', () => {
            describe('with entity from microservice', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        })
                        .withArguments(['bar']);
                });

                it('sets expected default clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Bar.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/sampleMicroserviceBar.json`);
                    assert.file(expectedFiles.clientNg2GatewayMicroserviceEntity);
                    assert.noFile(expectedFiles.gatling);
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/service/bar.service.ts`,
                        'samplemicroservice'
                    );
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.module.ts`,
                        'SampleMicroserviceBarModule'
                    );
                    assert.noFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.kt`);
                });
                it('generates search specific content for template', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/list/bar.component.html`,
                        'form name="searchForm"'
                    );
                });
                it('generates pagination specific content for template', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/list/bar.component.html`,
                        'ngb-pagination'
                    );
                });
            });

            describe('with entity from microservice and custom client-root-folder', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        });
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
                it('generates expected files', () => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/testRootFoo.json`);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.noFile(expectedFiles.gatling);
                    assert.noFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`);
                });
            });

            describe('with entity from mongodb microservice', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withOptions({
                            'skip-ktlint-format': true,
                        })
                        .withArguments(['baz'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        });
                });

                it('sets expected custom databaseType from the microservice', () => {
                    assert.jsonFileContent('.jhipster/Baz.json', { databaseType: 'mongodb' });
                });
                it('generates expected files', () => {
                    assert.file(expectedFiles.clientBazGatewayMicroserviceEntity);
                });
                it('generates a string id for the mongodb entity', () => {
                    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/baz/baz.model.ts`, 'id?: string');
                });
            });
            describe('without database and paginated entity', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/gateway-nodb'), dir);
                        })
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        })
                        .withArguments(['foo']);
                });
                it('generates pagination specific content for the template', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/foo/list/foo.component.html`,
                        'ngb-pagination'
                    );
                });
            });
        });

        describe('with creation timestamp', () => {
            before(async () => {
                await helpers
                    .run(require.resolve('generator-jhipster/generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withOptions({ creationTimestamp: '2016-01-20', withEntities: true, 'skip-ktlint-format': true })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: NO_DTO,
                        service: NO_SERVICE,
                        pagination: NO_PAGINATION,
                    });
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });

        describe('with formated creation timestamp', () => {
            before(async () => {
                await helpers
                    .run(require.resolve('generator-jhipster/generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withOptions({
                        creationTimestamp: '2016-01-20T00:00:00.000Z',
                        withEntities: true,

                        'skip-ktlint-format': true,
                    })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: NO_DTO,
                        service: NO_SERVICE,
                        pagination: NO_PAGINATION,
                    });
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });

        describe('with wrong base changelog date', () => {
            before(async () => {
                await helpers
                    .run(require.resolve('generator-jhipster/generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withOptions({ baseChangelogDate: '20-01-2016', 'skip-ktlint-format': true })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: NO_DTO,
                        service: NO_SERVICE,
                        pagination: NO_PAGINATION,
                    });
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.noFile(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });
    });

    context('regeneration from json file', () => {
        context('monolith with angularX', () => {
            describe('no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, './templates/default-ng2'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, 'skip-ktlint-format': true });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
                it('generates OpenAPI annotations on domain model', () => {
                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@Schema/);
                });
            });
        });

        describe('with --skip-db-changelog', () => {
            describe('SQL database', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({
                            regenerate: true,
                            force: true,
                            skipDbChangelog: true,
                            'skip-ktlint-format': true,
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    assert.noFile([
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
                    ]);
                });
            });

            describe('Cassandra database', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/compose/05-cassandra'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({
                            regenerate: true,
                            force: true,
                            skipDbChangelog: true,
                            'skip-ktlint-format': true,
                            blueprints: 'kotlin',
                        });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    assert.noFile([`${constants.SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
                });
            });
        });

        context('microservice', () => {
            describe('with dto, service, pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                            fse.copySync(
                                path.join(__dirname, 'templates/.jhipster/DtoServicePagination.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, 'skip-ktlint-format': true });
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2);
                    assert.file([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
                it('generates OpenAPI annotations on DTO', () => {
                    assert.noFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@Schema/);
                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`, /@Schema/);
                });
                it('shall not generate search specific artifacts because elastic search is false on top level', () => {
                    assert.noFile(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    assert.noFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/
                    );
                    assert.noFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`, /FooSearchRepository/);
                });
            });
        });
        context('microservice with elasticsearch', () => {
            describe('entity not enabled for search', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/elasticsearch-microservice'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true });
                });
                it('shall not generate search specific artifacts because entity has no search enabled', () => {
                    assert.noFile(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    assert.noFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/
                    );
                });
            });
            describe('entity enabled for search', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/elasticsearch-microservice'), dir);
                            fse.copySync(
                                path.join(__dirname, 'templates/.jhipster/DtoServicePagination.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true });
                });
                it('shall generate search specific artifacts because entity has search enabled', () => {
                    assert.file(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    assert.fileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/
                    );
                    // and repository shall be also used in service
                    assert.fileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`, /FooSearchRepository/);
                });
            });
        });

        context('reproducible build', () => {
            describe('no dto, no service, no pagination', () => {
                before(async () => {
                    await helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/reproducible'), dir);
                        })
                        .withOptions({ 'skip-ktlint-format': true })
                        .withArguments(['foo']);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file(expectedFiles.fakeData);
                });

                it('creates reproducible liquibase data', () => {
                    assert.fileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/foo.csv`, /1;Qatari salmon Monitored;65526;"6"/);
                });

                it('creates reproducible backend test', () => {
                    assert.fileContent(
                        `${SERVER_TEST_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /DEFAULT_NUMBER_PATTERN_REQUIRED = "1504"/
                    );
                    assert.fileContent(
                        `${SERVER_TEST_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /UPDATED_NUMBER_PATTERN_REQUIRED = "2841"/
                    );
                });
            });
        });
    });

    describe('regeneration from app generator', () => {
        describe('with creation timestamp', () => {
            before(async () => {
                await helpers
                    .create(require.resolve('../generators/app'))
                    .doInDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        const jhipsterFolder = path.join(dir, '.jhipster');
                        fse.ensureDirSync(jhipsterFolder);
                        fse.writeJsonSync(path.join(jhipsterFolder, 'Foo.json'), {});
                    })
                    .withOptions({ creationTimestamp: '2016-01-20', withEntities: true, 'skip-ktlint-format': true })
                    .run();
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });
    });
});
