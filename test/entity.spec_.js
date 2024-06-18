import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, beforeAll, it } from 'vitest';
import fse from 'fs-extra';
import { skipPrettierHelpers as helpers, runResult } from 'generator-jhipster/testing';

import { createMockedConfig } from './support/mock-config.cjs';

import { entityOptions } from '../generators/jdl.mjs';
import khipsterconstants from '../generators/generator-kotlin-constants.cjs';
import expectedFiles2 from './utils/expected-files.mjs';

const { jhipsterConstants: constants } = khipsterconstants;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { MapperTypes, ServiceTypes, PaginationTypes } = entityOptions;

const expectedFiles = expectedFiles2.entity;

const { PAGINATION, INFINITE_SCROLL } = PaginationTypes;
const { MAPSTRUCT } = MapperTypes;
const { SERVICE_IMPL, SERVICE_CLASS } = ServiceTypes;
const NO_SERVICE = ServiceTypes.NO;
const NO_PAGINATION = PaginationTypes.NO;
const NO_DTO = MapperTypes.NO;

const { CLIENT_MAIN_SRC_DIR, MAIN_DIR, SERVER_MAIN_RES_DIR, TEST_DIR } = constants;

const SERVER_MAIN_KOTLIN_SRC_DIR = `${MAIN_DIR}kotlin/`;
const SERVER_TEST_KOTLIN_SRC_DIR = `${TEST_DIR}kotlin/`;

describe.skip('JHipster generator for entity', () => {
    describe('creation from CLI', () => {
        describe('monolith with elasticsearch', () => {
            describe('search, no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });

                it('search shall provide methods for query and for string and asychronous indexing', () => {
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`,
                        'fun search(query: String)',
                    );
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`,
                        'fun search(query: Query)',
                    );
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`,
                        'fun index(entity: Foo)',
                    );
                });
            });

            describe('search, no dto, no service, pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
            });

            describe('search, no dto, no service, infinite-scroll', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
            });
        });

        describe('monolith with couchbase FTS', () => {
            describe('Couchbase search, no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V20160120000110__foo.fts`);
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
            });
        });

        describe('monolith with entity and dto suffixes', () => {
            describe('with entity and dto suffixes', () => {
                beforeAll(() =>
                    helpers
                        .create('jhipster:entity')
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
                        .run(),
                );

                it('creates expected files with suffix', () => {
                    runResult.assertFile([
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
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository',
                    );
                });

                it('correctly writes the entity', () => {
                    runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, 'data class FooXXX');
                });

                it('correctly writes the dto file', () => {
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        'data class FooYYY',
                    );
                });
            });

            describe('with entity suffix and no dto', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);

                    runResult.assertNoFile([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                    ]);

                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository',
                    );

                    runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, 'data class FooXXX');
                });
            });
        });

        describe('monolith with angular', () => {
            describe('no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertFile(expectedFiles.fakeData);
                });
            });

            describe('no dto, no service, with pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
            });

            describe('no dto, no service, with infinite-scroll', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
            });

            describe('no dto, with serviceImpl, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertFile([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`,
                    ]);
                });
            });

            describe('with dto, service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertFile([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
            });

            describe('with angular suffix', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertFileContent('.jhipster/Foo.json', 'angularJSSuffix');
                });
            });

            describe('with client-root-folder', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });

            describe('with client-root-folder and angular-suffix', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });
        });

        describe('fake data', () => {
            describe('sql database with fake data disabled', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertNoFile(expectedFiles.fakeData);
                });
            });
        });

        describe('no i18n', () => {
            describe('with dto, serviceImpl, with hazelcast, elasticsearch', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertNoFile([`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`]);
                });
            });
        });

        describe('all languages', () => {
            describe('no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                        runResult.assertFile([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
                    });
                });
            });

            describe('no dto, no service, no pagination with client-root-folder', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                        runResult.assertFile(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/testRootFoo.json`);
                    });
                });
            });
        });

        describe('microservice', () => {
            describe('with client-root-folder microservice', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                    runResult.assertFile(expectedFiles.server);
                });
            });

            describe('with default microservice', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertNoFile(expectedFiles.gatling);
                });
            });

            describe('with mongodb microservice', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { databaseType: 'mongodb' });
                });
            });
        });

        describe('gateway', () => {
            describe('with entity from microservice', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Bar.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    runResult.assertFile(`${CLIENT_MAIN_SRC_DIR}i18n/en/sampleMicroserviceBar.json`);
                    runResult.assertNoFile(expectedFiles.gatling);
                    runResult.assertFileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/service/bar.service.ts`,
                        'samplemicroservice',
                    );
                    runResult.assertFileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.module.ts`,
                        'SampleMicroserviceBarModule',
                    );
                    runResult.assertNoFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.kt`);
                });
                it('generates search specific content for template', () => {
                    runResult.assertFileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/list/bar.component.html`,
                        'form name="searchForm"',
                    );
                });
                it('generates pagination specific content for template', () => {
                    runResult.assertFileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/list/bar.component.html`,
                        'ngb-pagination',
                    );
                });
            });

            describe('with entity from microservice and custom client-root-folder', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
                it('generates expected files', () => {
                    runResult.assertFile(`${CLIENT_MAIN_SRC_DIR}i18n/en/testRootFoo.json`);
                    runResult.assertNoFile(expectedFiles.gatling);
                    runResult.assertNoFile(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`);
                });
            });

            describe('with entity from mongodb microservice', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertJsonFileContent('.jhipster/Baz.json', { databaseType: 'mongodb' });
                });
                it('generates a string id for the mongodb entity', () => {
                    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/baz/baz.model.ts`, 'id: string');
                });
            });
            describe('without database and paginated entity', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/foo/list/foo.component.html`,
                        'ngb-pagination',
                    );
                });
            });
        });

        describe('with creation timestamp', () => {
            beforeAll(async () => {
                await helpers
                    .run('jhipster:entity')
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
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.serverLiquibase);
                runResult.assertFile(expectedFiles.gatling);
            });
        });

        describe('with formated creation timestamp', () => {
            beforeAll(async () => {
                await helpers
                    .run('jhipster:entity')
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
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.serverLiquibase);
                runResult.assertFile(expectedFiles.gatling);
            });
        });

        describe('with wrong base changelog date', () => {
            beforeAll(async () => {
                await helpers
                    .run('jhipster:entity')
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
                runResult.assertFile(expectedFiles.server);
                runResult.assertNoFile(expectedFiles.serverLiquibase);
                runResult.assertFile(expectedFiles.gatling);
            });
        });
    });

    describe('regeneration from json file', () => {
        describe('monolith with angular', () => {
            describe('no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, './templates/default-ng2'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, 'skip-ktlint-format': true });
                });

                it('creates expected default files', () => {
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
                it('generates OpenAPI annotations on domain model', () => {
                    runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@Schema/);
                });
            });
        });

        describe('with --skip-db-changelog', () => {
            describe('SQL database', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    runResult.assertNoFile([
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
                    ]);
                });
            });

            describe('Cassandra database', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .doInDir(dir => {
                            createMockedConfig('05-cassandra', dir, { appDir: '', config: { testFrameworks: ['gatling'] } });
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
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    runResult.assertNoFile([`${constants.SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
                });
            });
        });

        describe('microservice', () => {
            describe('with dto, service, pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                            fse.copySync(
                                path.join(__dirname, 'templates/.jhipster/DtoServicePagination.json'),
                                path.join(dir, '.jhipster/Foo.json'),
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, 'skip-ktlint-format': true });
                });

                it('creates expected default files', () => {
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile([
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
                it('generates OpenAPI annotations on DTO', () => {
                    runResult.assertNoFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@Schema/);
                    runResult.assertFileContent(`${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`, /@Schema/);
                });
                it('shall not generate search specific artifacts because elastic search is false on top level', () => {
                    runResult.assertNoFile(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    runResult.assertNoFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/,
                    );
                    runResult.assertNoFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                        /FooSearchRepository/,
                    );
                });
            });
        });
        describe('microservice with elasticsearch', () => {
            describe('entity not enabled for search', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/elasticsearch-microservice'), dir);
                            fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true });
                });
                it('shall not generate search specific artifacts because entity has no search enabled', () => {
                    runResult.assertNoFile(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    runResult.assertNoFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/,
                    );
                });
            });
            describe('entity enabled for search', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/elasticsearch-microservice'), dir);
                            fse.copySync(
                                path.join(__dirname, 'templates/.jhipster/DtoServicePagination.json'),
                                path.join(dir, '.jhipster/Foo.json'),
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true });
                });
                it('shall generate search specific artifacts because entity has search enabled', () => {
                    runResult.assertFile(expectedFiles.entitySearchSpecific);
                    // and no annotation in the domain class
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
                        /@org.springframework.data.elasticsearch.annotations.Document/,
                    );
                    // and repository shall be also used in service
                    runResult.assertFileContent(
                        `${SERVER_MAIN_KOTLIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                        /FooSearchRepository/,
                    );
                });
            });
        });

        describe('reproducible build', () => {
            describe('no dto, no service, no pagination', () => {
                beforeAll(async () => {
                    await helpers
                        .run('jhipster:entity')
                        .doInDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/reproducible'), dir);
                        })
                        .withOptions({ 'skip-ktlint-format': true })
                        .withArguments(['foo']);
                });

                it('creates expected default files', () => {
                    runResult.assertFile(expectedFiles.server);
                    runResult.assertFile(expectedFiles.gatling);
                    runResult.assertFile(expectedFiles.fakeData);
                });

                it('creates reproducible liquibase data', () => {
                    runResult.assertFileContent(
                        `${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/foo.csv`,
                        /1;Qatari salmon Monitored;65526;"6"/,
                    );
                });

                it('creates reproducible backend test', () => {
                    runResult.assertFileContent(
                        `${SERVER_TEST_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /DEFAULT_NUMBER_PATTERN_REQUIRED = "1504"/,
                    );
                    runResult.assertFileContent(
                        `${SERVER_TEST_KOTLIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /UPDATED_NUMBER_PATTERN_REQUIRED = "2841"/,
                    );
                });
            });
        });
    });

    describe('regeneration from app generator', () => {
        describe('with creation timestamp', () => {
            beforeAll(async () => {
                await helpers
                    .create('jhipster:app')
                    .doInDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        const jhipsterFolder = path.join(dir, '.jhipster');
                        fse.ensureDirSync(jhipsterFolder);
                        fse.writeJsonSync(path.join(jhipsterFolder, 'Foo.json'), {});
                    })
                    .withOptions({ creationTimestamp: '2016-01-20', withEntities: true, 'skip-ktlint-format': true })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .run();
            });

            it('creates expected default files', () => {
                runResult.assertFile(expectedFiles.server);
                runResult.assertFile(expectedFiles.serverLiquibase);
                runResult.assertFile(expectedFiles.gatling);
            });
        });
    });
});
