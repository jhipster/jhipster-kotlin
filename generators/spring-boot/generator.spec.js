import { beforeAll, describe, expect, it } from 'vitest';

import { entitiesServerSamples, defaultHelpers as helpers, result } from 'generator-jhipster/testing';
import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

describe('SubGenerator kotlin of kotlin JHipster blueprint', () => {
    describe('run', () => {
        beforeAll(async function () {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig({}, [...entitiesServerSamples, entityWithCriteriaAndDto, entityWithEnum, entityWithBagRelationship])
                .withOptions({
                    ignoreNeedlesError: true,
                    blueprints: 'kotlin',
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
