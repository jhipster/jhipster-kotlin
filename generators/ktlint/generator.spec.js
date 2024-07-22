import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'ktlint';
const SUB_GENERATOR_NAMESPACE = `jhipster-kotlin:${SUB_GENERATOR}`;

describe('SubGenerator kotlin of kotlin JHipster blueprint', () => {
    describe('run', () => {
        beforeAll(async function () {
            await helpers
                .run(SUB_GENERATOR_NAMESPACE)
                .withJHipsterConfig()
                .withOptions({
                    ignoreNeedlesError: true,
                    skipKtlintFormat: true,
                })
                .withJHipsterLookup()
                .withParentBlueprintLookup(['generators', 'generators/*/generators']);
        });

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });
    });
});
