const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_DIR_JAVA = constants.SERVER_MAIN_SRC_DIR;

const SERVER_MAIN_SRC_DIR_KOTLIN = `${constants.MAIN_DIR}kotlin/`;

describe('JHipster generator service', () => {
    describe('creates service without interface', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../node_modules/generator-jhipster/test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: false
                })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([`${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/FooService.kt`]);
        });

        it('doesnt create interface', () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/impl/FooServiceImpl.kt`]);
        });

        it('doesnt create java service file', () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR_JAVA}`]);
        });
    });

    describe('creates service with interface', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../node_modules/generator-jhipster/test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: true
                })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/FooService.kt`,
                `${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/impl/FooServiceImpl.kt`
            ]);
        });

        it('doesnt create java files', () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR_JAVA}`]);
        });
    });

    describe('creates service with --default flag', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../node_modules/generator-jhipster/test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ default: true })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/FooService.kt`,
                `${SERVER_MAIN_SRC_DIR_KOTLIN}com/mycompany/myapp/service/impl/FooServiceImpl.kt`
            ]);
        });

        it('doesnt create java files', () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR_JAVA}`]);
        });
    });
});
