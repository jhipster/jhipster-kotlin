import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, fromMatrix, result } from 'generator-jhipster/testing';

const SUB_GENERATOR = 'kotlin';
const SUB_GENERATOR_NAMESPACE = `jhipster-kotlin:${SUB_GENERATOR}`;

describe('SubGenerator kotlin of kotlin JHipster blueprint', () => {
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

            it('should match source calls', () => {
                expect(result.sourceCallsArg).toMatchSnapshot();
            });
        });
    });
});

// Check the generated build files as well as mocked source calls: coroutine
// dependencies must be usable at runtime, while runTest belongs on the test classpath.
describe('Kotlin coroutine dependencies', () => {
    for (const buildTool of ['maven', 'gradle']) {
        for (const reactive of [false, true]) {
            describe(`${buildTool}, reactive=${reactive}`, () => {
                beforeAll(async () => {
                    await helpers
                        .run(SUB_GENERATOR_NAMESPACE)
                        .withJHipsterConfig({ buildTool, reactive })
                        .withOptions({ ignoreNeedlesError: true, skipKtlintFormat: true })
                        .withJHipsterGenerators()
                        .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] });
                });

                it('adds runtime and test dependencies only for reactive applications', () => {
                    const runtime = [
                        'kotlinx-coroutines-core',
                        'kotlinx-coroutines-reactor',
                        'kotlinx-coroutines-debug',
                        'reactor-kotlin-extensions',
                    ];
                    if (buildTool === 'gradle') {
                        const build = result.fs.read('build.gradle');
                        for (const library of [...runtime, 'kotlinx-coroutines-test']) {
                            const scope = library === 'kotlinx-coroutines-test' ? 'testImplementation' : 'implementation';
                            const dependency = `${scope} libs.${library.replaceAll('-', '.')}`;
                            expect(
                                build
                                    .split('\n')
                                    .map(line => line.trim())
                                    .includes(dependency),
                                dependency,
                            ).toBe(reactive);
                        }
                        if (reactive) {
                            expect(result.fs.read('gradle/libs.versions.toml')).toContain('org.jetbrains.kotlinx:kotlinx-coroutines-test');
                        }
                    } else {
                        const pom = result.fs.read('pom.xml');
                        for (const library of [...runtime, 'kotlinx-coroutines-test']) {
                            const dependency = (pom.match(/<dependency>[\s\S]*?<\/dependency>/g) ?? []).find(block =>
                                block.includes(`<artifactId>${library}</artifactId>`),
                            );
                            expect(Boolean(dependency)).toBe(reactive);
                            if (reactive) {
                                expect(dependency.includes('<scope>test</scope>')).toBe(library === 'kotlinx-coroutines-test');
                            }
                        }
                    }
                });
            });
        }
    }
});
