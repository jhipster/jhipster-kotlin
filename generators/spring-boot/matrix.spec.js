import { beforeAll, describe, expect, it } from 'vitest';
import { isMatch } from 'lodash-es';
import { defaultHelpers as helpers, result, buildServerMatrix, entitiesServerSamples } from 'generator-jhipster/testing';

import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

const databaseType = ['sql', 'mongodb', 'cassandra', 'couchbase', 'neo4j'];

describe('Matrix test of SubGenerator kotlin of kotlin JHipster blueprint', () => {
    Object.entries(buildServerMatrix({ databaseType })).forEach(([name, config], _idx) => {
        // if (_idx !== 0) return;
        if (
            isMatch(config, { websocket: true, applicationType: 'gateway' }) ||
            isMatch(config, { websocket: true, applicationType: 'microservice' })
        ) {
            config.websocket = false;
        }
        if (isMatch(config, { websocket: true })) {
            config.websocket = 'spring-websocket';
        }
        if (isMatch(config, { skipUserManagement: false, applicationType: 'microservice' })) {
            config.skipUserManagement = true;
        }
        if (isMatch(config, { databaseType: 'couchbase', searchEngine: 'elasticsearch' })) {
            config.searchEngine = 'couchbase';
        }
        describe(name, () => {
            beforeAll(async function () {
                await helpers
                    .run('jhipster:spring-boot')
                    .withJHipsterConfig({ ...config, skipClient: true }, [
                        ...entitiesServerSamples,
                        entityWithCriteriaAndDto,
                        entityWithEnum,
                        entityWithBagRelationship,
                    ])
                    .withOptions({
                        ignoreNeedlesError: true,
                        blueprints: 'kotlin',
                        skipKtlintFormat: true,
                    })
                    .withJHipsterLookup()
                    .withParentBlueprintLookup()
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt']);
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });
});
