const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = `${constants.TEST_DIR}kotlin/`;

describe('JHipster generator spring-controller', () => {
    describe('creates spring controller', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/spring-controller'))
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
                    actionAdd: false,
                })
                .on('end', done);
        });

        it('creates controller files', () => {
            assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`]);

            assert.file([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`]);
        });
    });

    describe('creates spring controller with --default flag', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/spring-controller'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                    default: true,
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .on('end', done);
        });

        it('creates controller files', () => {
            assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`]);

            assert.file([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`]);
        });
    });
});
