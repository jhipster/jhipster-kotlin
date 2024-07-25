import { beforeAll, describe, expect, it } from 'vitest';

import { fromMatrix, defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'detekt';
const SUB_GENERATOR_NAMESPACE = `jhipster-kotlin:${SUB_GENERATOR}`;

describe('SubGenerator detekt of kotlin JHipster blueprint', () => {
    Object.entries(fromMatrix({ buildTool: ['maven', 'gradle'] })).forEach(([name, config]) => {
        describe(name, () => {
            beforeAll(async function () {
                await helpers
                    .run(SUB_GENERATOR_NAMESPACE)
                    .withJHipsterConfig(config)
                    .withOptions({
                        ignoreNeedlesError: true,
                        skipKtlintFormat: true,
                    })
                    .withJHipsterLookup()
                    .withMockedSource()
                    .withParentBlueprintLookup(['generators', 'generators/*/generators']);
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });

            it('should match source calls', () => {
                expect(result.sourceCallsArg).toMatchSnapshot();
            });
        });
    });
});
