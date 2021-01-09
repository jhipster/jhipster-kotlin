const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('generator-jhipster/generators/generator-constants');
const expectedFiles = require('./utils/expected-files').entity;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = `${constants.TEST_DIR}kotlin/`;

describe('JHipster generator for entity', () => {
    context('creation from CLI', () => {
        context('monolith with elasticsearch', () => {
            describe('search, no dto, no service, no pagination', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });
        });

        context('monolith with couchbase FTS', () => {
            describe('Couchbase search, no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-couchbase-search'), dir);
                        })
                        .withOptions({ creationTimestamp: '2016-01-20', withEntities: true })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V20160120000100__foo.fts`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });
        });

        context('monolith with entity and dto suffixes', () => {
            describe('with entity and dto suffixes', () => {
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'mapstruct',
                            service: 'serviceImpl',
                        })
                        .on('end', done);
                });

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });

                it('correctly writes the repository', () => {
                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository : '
                    );
                });

                it('correctly writes the entity', () => {
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, /.+^data class FooXXX\(/gms);
                });

                it('correctly writes the dto file', () => {
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`, /.+^data class FooYYY\($.*/gms);
                });
            });

            describe('with entity suffix and no dto', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'serviceImpl',
                        })
                        .on('end', done);
                });

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);

                    assert.noFile([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                    ]);

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
                        'interface FooRepository : '
                    );

                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.kt`, /.+^data class FooXXX\(/gms);
                });
            });
        });

        context('monolith with angularX', () => {
            describe('no dto, no service, no pagination', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, no service, with pagination', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'pagination',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, no service, with infinite-scroll', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, with serviceImpl, no pagination', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'serviceImpl',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`,
                    ]);
                });
            });

            describe('with dto, service, no pagination', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'mapstruct',
                            service: 'serviceClass',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
            });

            describe('with angular suffix', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ angularSuffix: 'management' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
                });
            });

            describe('with client-root-folder', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ clientRootFolder: 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });

            describe('with client-root-folder and angular-suffix', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ clientRootFolder: 'test-root', angularSuffix: 'management' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolderAndSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });
        });

        context('no i18n', () => {
            describe('with dto, serviceImpl, with hazelcast, elasticsearch', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/noi18n'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
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
                beforeEach(done => {
                    helpers
                        .run(require.resolve('generator-jhipster/generators/entity'))
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no',
                        })
                        .on('end', done);
                });

                it('creates expected languages files', () => {
                    constants.LANGUAGES.forEach(language => {
                        assert.file([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
                    });
                });
            });

            describe('no dto, no service, no pagination with client-root-folder', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ clientRootFolder: 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no',
                        })
                        .on('end', done);
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
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ clientRootFolder: 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll',
                        })
                        .on('end', done);
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2WithRootFolder);
                });
            });

            describe('with default microservice', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'pagination',
                        })
                        .on('end', done);
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
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/mongodb-with-relations'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'pagination',
                        })
                        .on('end', done);
                });

                it('sets expected custom databaseType', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { databaseType: 'mongodb' });
                });
            });
        });

        context('gateway', () => {
            describe('with entity from microservice', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        })
                        .withArguments(['bar'])
                        .on('end', done);
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
                    assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.kt`);
                });
            });

            describe('with entity from microservice and custom client-root-folder', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        })
                        .on('end', done);
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
                it('generates expected files', () => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/testRootFoo.json`);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.noFile(expectedFiles.gatling);
                    assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`);
                });
            });

            describe('with entity from mongodb microservice', () => {
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withArguments(['baz'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: 'microservice1',
                        })
                        .on('end', done);
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
        });

        describe('with creation timestamp', () => {
            before(done => {
                helpers
                    .run('generator-jhipster/generators/entity')
                    .withOptions({
                        fromCli: true,
                        skipInstall: true,
                        blueprint: 'kotlin',
                        skipChecks: true,
                        'skip-ktlint-format': true,
                        creationTimestamp: '2016-01-20',
                        withEntities: true,
                    })
                    .withGenerators([
                        [
                            require('../generators/entity-server'), // eslint-disable-line global-require
                            'jhipster-kotlin:entity-server',
                            path.join(__dirname, '../generators/entity-server/index.js'),
                        ],
                    ])
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'pagination',
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });

        describe('with formated creation timestamp', () => {
            before(done => {
                helpers
                    .run('generator-jhipster/generators/entity')
                    .withOptions({
                        fromCli: true,
                        skipInstall: true,
                        blueprint: 'kotlin',
                        skipChecks: true,
                        'skip-ktlint-format': true,
                        creationTimestamp: '2016-01-20T00:00:00.000Z',
                        withEntities: true,
                    })
                    .withGenerators([
                        [
                            require('../generators/entity-server'), // eslint-disable-line global-require
                            'jhipster-kotlin:entity-server',
                            path.join(__dirname, '../generators/entity-server/index.js'),
                        ],
                    ])
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'pagination',
                    })
                    .on('end', done);
            });

            it('creates expected default files', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.serverLiquibase);
                assert.file(expectedFiles.clientNg2);
                assert.file(expectedFiles.gatling);
            });
        });

        describe('with wrong base changelog date', () => {
            before(done => {
                helpers
                    .run('generator-jhipster/generators/entity')
                    .withOptions({
                        fromCli: true,
                        skipInstall: true,
                        blueprint: 'kotlin',
                        skipChecks: true,
                        'skip-ktlint-format': true,
                        baseChangelogDate: '20-01-2016',
                    })
                    .withGenerators([
                        [
                            require('../generators/entity-server'), // eslint-disable-line global-require
                            'jhipster-kotlin:entity-server',
                            path.join(__dirname, '../generators/entity-server/index.js'),
                        ],
                    ])
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                    })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'pagination',
                    })
                    .on('end', done);
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
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../node_modules/generator-jhipster/test/templates/default-ng2'), dir);
                            fse.copySync(
                                path.join(__dirname, '../node_modules/generator-jhipster/test/templates/.jhipster/Simple.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
                it('generates OpenAPI annotations on domain model', () => {
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@ApiModelProperty/);
                });
            });
        });

        describe('with --skip-db-changelog', () => {
            describe('SQL database', () => {
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../node_modules/generator-jhipster/test/templates/default-ng2'), dir);
                            fse.copySync(
                                path.join(__dirname, '../node_modules/generator-jhipster/test/templates/.jhipster/Simple.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, skipDbChangelog: true })
                        .on('end', done);
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
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(
                                path.join(__dirname, '../node_modules/generator-jhipster/test/templates/compose/05-cassandra'),
                                dir
                            );
                            fse.copySync(
                                path.join(__dirname, '../node_modules/generator-jhipster/test/templates/.jhipster/Simple.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, skipDbChangelog: true })
                        .on('end', done);
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
                beforeEach(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                            fse.copySync(
                                path.join(
                                    __dirname,
                                    '../node_modules/generator-jhipster/test/templates/.jhipster/DtoServicePagination.json'
                                ),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.kt`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                    ]);
                });
                it('generates OpenAPI annotations on DTO', () => {
                    assert.noFileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`, /@ApiModelProperty/);
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.kt`, /@ApiModelProperty/);
                });
            });
        });

        context('reproducible build', () => {
            describe('no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run('generator-jhipster/generators/entity')
                        .withOptions({
                            fromCli: true,
                            skipInstall: true,
                            blueprint: 'kotlin',
                            skipChecks: true,
                            'skip-ktlint-format': true,
                        })
                        .withGenerators([
                            [
                                require('../generators/entity-server'), // eslint-disable-line global-require
                                'jhipster-kotlin:entity-server',
                                path.join(__dirname, '../generators/entity-server/index.js'),
                            ],
                        ])
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/reproducible'), dir);
                        })
                        .withArguments(['foo'])
                        .on('end', done);
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
                        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /DEFAULT_NUMBER_PATTERN_REQUIRED = "4244"/
                    );
                    assert.fileContent(
                        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
                        /UPDATED_NUMBER_PATTERN_REQUIRED = "257856"/
                    );
                });
            });
        });
    });
});
