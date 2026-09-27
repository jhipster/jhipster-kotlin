import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, fromMatrix, result } from 'generator-jhipster/testing';

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
                    .withJHipsterGenerators()
                    .withMockedSource()
                    .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] });
            });

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });

            it('should allow supported package names with underscores', () => {
                const config = result.fs.read('detekt-config.yml');
                const packagePattern = new RegExp(config.match(/packagePattern: '([^']+)'/)[1]);
                expect(packagePattern.test('com.okta.developer.monolith_session')).toBe(true);
                expect(packagePattern.test('tech.jhipster.sample')).toBe(true);
                expect(packagePattern.test('com.invalid-name')).toBe(false);
            });

            it('should match source calls', () => {
                expect(result.sourceCallsArg).toMatchSnapshot();
            });
        });
    });
});
