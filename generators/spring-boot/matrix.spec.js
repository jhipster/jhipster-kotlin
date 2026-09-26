import { beforeAll, describe, expect, it } from 'vitest';

import {
    buildServerMatrix,
    defaultHelpers as helpers,
    entitiesServerSamples,
    extendFilteredMatrix,
    extendMatrix,
    result,
} from 'generator-jhipster/testing';
import { isMatch } from 'lodash-es';

import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

const databaseType = ['sql', 'mongodb', 'cassandra', 'couchbase', 'neo4j'];

let matrix = buildServerMatrix({ databaseType });
matrix = extendMatrix(matrix, { messageBroker: ['no', 'kafka'] });
matrix = extendFilteredMatrix(matrix, config => config.applicationType === 'microservice' && !config.reactive, { feignClient: [true] });

describe('Matrix test of SubGenerator kotlin of kotlin JHipster blueprint', () => {
    Object.entries(matrix).forEach(([name, config], _idx) => {
        // if (_idx !== 0) return;
        // generator-jhipster 9.x's own matrix builder produces the real 'spring-websocket' string
        // value directly (not a `true` placeholder), and its own validation now rejects websocket
        // support on gateway/microservice applications outright.
        if (
            config.websocket &&
            config.websocket !== 'no' &&
            (config.applicationType === 'gateway' || config.applicationType === 'microservice')
        ) {
            config.websocket = false;
        }
        if (config.websocket === true) {
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
                        // Imperative (non-reactive) gateways use Spring Cloud Gateway MVC, which
                        // generator-jhipster 9.x flags as experimental and refuses without this.
                        experimental: true,
                    })
                    .withJHipsterGenerators()
                    .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });
        });
    });
});
