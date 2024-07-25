import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'migration';
const SUB_GENERATOR_NAMESPACE = `jhipster-kotlin:${SUB_GENERATOR}`;

describe('SubGenerator migration of kotlin JHipster blueprint', () => {
    describe('run', () => {
        beforeAll(async function () {
            await helpers
                .run(SUB_GENERATOR_NAMESPACE)
                .withJHipsterConfig()
                .withOptions({
                    ignoreNeedlesError: true,
                })
                .withJHipsterLookup()
                .withParentBlueprintLookup();
        });

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });
    });
});
