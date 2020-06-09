const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;

describe('JHipster generator service', () => {
    describe('creates service without interface', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: false,
                })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`]);
        });

        it('doesnt create interface', () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`]);
        });
    });

    describe('creates service with interface', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useInterface: true,
                })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`,
            ]);
        });
    });

    describe('creates service with --default flag', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ default: true })
                .on('end', done);
        });

        it('creates service file', () => {
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.kt`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.kt`,
            ]);
        });
    });
});
