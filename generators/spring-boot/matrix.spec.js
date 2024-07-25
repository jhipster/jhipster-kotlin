import { beforeAll, describe, expect, it } from 'vitest';
import { isMatch } from 'lodash-es';

import { defaultHelpers as helpers, result, buildServerMatrix, entitiesServerSamples } from 'generator-jhipster/testing';

describe('Matrix test of SubGenerator kotlin of kotlin JHipster blueprint', () => {
    Object.entries(buildServerMatrix({ databaseType: ['sql', 'mongodb', 'cassandra', 'couchbase', 'neo4j'] })).forEach(([name, config]) => {
        if (
            isMatch(config, { websocket: true, applicationType: 'gateway' }) ||
            isMatch(config, { websocket: true, applicationType: 'microservice' })
        ) {
            config.websocket = false;
        }
        if (isMatch(config, { skipUserManagement: false, applicationType: 'microservice' })) {
            config.skipUserManagement = true;
        }
        // if (name !== 'microservice-jwt-reactive(false)-maven-enableTranslation(false)-tech.jhipster-jhi-Entity-DTO-skipCommitHook(false)-cucumber-websocket(false)-skipUserManagement(false)-serviceDiscoveryType(no)') return;
        describe(name, () => {
            beforeAll(async function () {
                await helpers
                    .run('jhipster:spring-boot')
                    .withJHipsterConfig(config, entitiesServerSamples)
                    .withOptions({
                        ignoreNeedlesError: true,
                        blueprints: 'kotlin',
                        skipKtlintFormat: true,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint']);
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });
});
