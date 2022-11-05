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

    describe('creates spring controller without packageFolder & non-default packageName in yo-rc.json', () => {
        let runResult;
        before(async () => {
            runResult = await helpers
                .run(require.resolve('../generators/spring-controller'))
                .inTmpDir(dir => {
                    const config = {
                        ...fse.readJSONSync(path.join(__dirname, '../test/templates/default/.yo-rc.json'))[constants.GENERATOR_JHIPSTER],
                        packageFolder: undefined,
                        packageName: 'com.test',
                    };
                    fse.writeJsonSync(path.join(dir, '.yo-rc.json'), { [constants.GENERATOR_JHIPSTER]: config });
                })
                .withArguments(['fooBar'])
                .withPrompts({
                    actionAdd: false,
                });
        });

        it('creates fooBar controller files', () => {
            runResult.assertFile([`${SERVER_MAIN_SRC_DIR}com/test/web/rest/FooBarResource.kt`]);
            runResult.assertFile([`${SERVER_TEST_SRC_DIR}com/test/web/rest/FooBarResourceIT.kt`]);
        });
    });
});
