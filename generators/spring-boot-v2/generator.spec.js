import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'spring-boot-v2';
const SUB_GENERATOR_NAMESPACE = `jhipster-kotlin:${SUB_GENERATOR}`;

describe('SubGenerator spring-boot-v2 of kotlin JHipster blueprint', () => {
    describe('run', () => {
        beforeAll(async function () {
            await helpers
                .run(SUB_GENERATOR_NAMESPACE)
                .withJHipsterConfig()
                .withOptions({
                    ignoreNeedlesError: true,
                    skipPriorities: ['writing', 'writingEntities'],
                })
                .withSharedApplication({
                    dockerContainers: {},
                    javaDependencies: {},
                    springBootDependencies: {},
                })
                .withMockedSource()
                .withJHipsterLookup()
                .withParentBlueprintLookup();
        });

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });
    });
});
