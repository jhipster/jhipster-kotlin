import { expect, beforeAll, describe, it } from 'vitest';
import { skipPrettierHelpers as helpers, runResult } from 'generator-jhipster/testing';
import { applicationTypes, authenticationTypes, cacheTypes, buildToolTypes, databaseTypes } from 'generator-jhipster/jdl';

const { JWT, OAUTH2 } = authenticationTypes;
const { MICROSERVICE } = applicationTypes;
const { CAFFEINE, EHCACHE } = cacheTypes;
const { SQL, H2_MEMORY, POSTGRESQL } = databaseTypes;
const { MAVEN } = buildToolTypes;

describe('JHipster server generator', () => {
    describe('generate server with ehcache', () => {
        beforeAll(async () => {
            await helpers
                .create('jhipster:app')
                .withOptions({
                    ignoreNeedlesError: true,
                    withGeneratedFlag: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
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
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr'],
                    buildTool: MAVEN,
                    rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
                    serverSideOptions: [],
                })
                .withJHipsterLookup()
                .withParentBlueprintLookup()
                .run();
        });

        it('creates expected files for default configuration for server generator', () => {
            expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });
    });
    describe('generate server with caffeine', () => {
        let runResult;
        beforeAll(async () => {
            runResult = await helpers
                .create('jhipster:app')
                .withOptions({
                    ignoreNeedlesError: true,
                    withGeneratedFlag: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
                })
                .withPrompts({
                    baseName: 'jhipster',
                    packageName: 'com.mycompany.myapp',
                    packageFolder: 'com/mycompany/myapp',
                    serviceDiscoveryType: false,
                    authenticationType: JWT,
                    cacheProvider: CAFFEINE,
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
                .run();
        });

        it('creates expected files for caffeine cache configuration for server generator', () => {
            expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });
    });
    describe('microfrontend', () => {
        let runResult;
        beforeAll(async () => {
            runResult = await helpers
                .create('jhipster:app')
                .withOptions({
                    ignoreNeedlesError: true,
                    withGeneratedFlag: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
                    skipClient: true,
                    applicationType: MICROSERVICE,
                    feignClient: true,
                })
                .withJHipsterConfig({
                    baseName: 'jhipster',
                    auth: OAUTH2,
                    microfrontend: true,
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr', 'en'],
                    withGeneratedFlag: true,
                })
                .withJHipsterLookup()
                .withParentBlueprintLookup()
                .run();
        });
        it('should match generated files snapshot', () => {
            expect(runResult.getStateSnapshot()).toMatchSnapshot();
        });
    });
});
