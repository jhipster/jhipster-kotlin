const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const angularfiles = require('generator-jhipster/generators/client/files-angular').files;
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');

describe('JHipster server generator', () => {
    describe('generate server with ehcache', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/server')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                    'skip-ktlint-format': true,
                })
                .withGenerators([
                    [
                        require('../generators/server'), // eslint-disable-line global-require
                        'jhipster-kotlin:server',
                        path.join(__dirname, '../generators/server/index.js'),
                    ],
                ])
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'ehcache',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'postgresql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: [],
                })
                .on('end', done);
        });

        it('creates expected files for default configuration for server generator', () => {
            assert.noFile(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.userManagementServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.postgresql);
            assert.file(expectedFiles.hibernateTimeZoneConfig);
            assert.noFile(
                getFilesForOptions(
                    angularfiles,
                    {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: [],
                    },
                    null,
                    ['package.json']
                )
            );
        });
    });

    describe('generate server with caffeine', () => {
        before(done => {
            helpers
                .run('generator-jhipster/generators/server')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'kotlin',
                    skipChecks: true,
                    'skip-ktlint-format': true,
                })
                .withGenerators([
                    [
                        require('../generators/server/index.js'), // eslint-disable-line global-require
                        'jhipster-kotlin:server',
                        path.join(__dirname, '../generators/server/index.js'),
                    ],
                ])
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    cacheProvider: 'caffeine',
                    enableHibernateCache: true,
                    databaseType: 'sql',
                    devDatabaseType: 'h2Memory',
                    prodDatabaseType: 'postgresql',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: 'maven',
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: [],
                })
                .on('end', done);
        });

        it('creates expected files for caffeine cache configuration for server generator', () => {
            assert.noFile(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.jwtServer);
            assert.file(expectedFiles.userManagementServer);
            assert.file(expectedFiles.maven);
            assert.file(expectedFiles.postgresql);
            assert.file(expectedFiles.hibernateTimeZoneConfig);
            assert.noFile(
                getFilesForOptions(
                    angularfiles,
                    {
                        enableTranslation: true,
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        testFrameworks: [],
                    },
                    null,
                    ['package.json']
                )
            );
        });
    });
});
