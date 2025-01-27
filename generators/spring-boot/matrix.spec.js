import { beforeAll, describe, expect, it } from 'vitest';
import { isMatch } from 'lodash-es';
import {
    buildServerMatrix,
    entitiesServerSamples,
    extendFilteredMatrix,
    extendMatrix,
    defaultHelpers as helpers,
    result,
} from 'generator-jhipster/testing';

import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

const databaseType = ['sql', 'mongodb', 'cassandra', 'couchbase', 'neo4j'];

let matrix = buildServerMatrix({ databaseType });
matrix = extendMatrix(matrix, { messageBroker: ['no', 'kafka'] });
matrix = extendFilteredMatrix(matrix, config => config.applicationType === 'microservice' && !config.reactive, { feignClient: [true] });

describe('Matrix test of SubGenerator kotlin of kotlin JHipster blueprint', () => {
    Object.entries(matrix).forEach(([name, config], _idx) => {
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
                    .withJHipsterConfig(config, [
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
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });
});
