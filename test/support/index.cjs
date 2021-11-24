const expect = require('expect');
// const path = require('path');
// const sinon = require('sinon');
// const { existsSync } = require('fs');

const { GENERATOR_JHIPSTER } = require('generator-jhipster/generators/generator-constants');
// const { PRIORITY_NAMES } = require('generator-jhipster/lib/constants/priorities.cjs');
const { skipPrettierHelpers: helpers } = require('../utils/utils');

const testOptions = data => {
    const { generatorPath, customOptions, contextBuilder = () => helpers.create(generatorPath) } = data;
    let runResult;
    before(async () => {
        runResult = await contextBuilder()
            .withOptions({ ...customOptions })
            .run();
    });
    it('should write options to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customOptions });
    });
};

const basicTests = data => {
    const {
        generatorPath,
        customPrompts,
        requiredConfig,
        defaultConfig,
        templateContext = 'application',
        contextBuilder = () => helpers.create(generatorPath),
    } = data;
    const getContext = generator => {
        return templateContext ? generator[templateContext] : generator;
    };
    describe('with default options', () => {
        let runResult;
        before(async () => {
            runResult = await contextBuilder().withOptions({ skipPrompts: true, configure: true }).run();
        });
        it('should write default config to .yo-rc.json', () => {
            runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
        });
        it('should load default config into the context', () => {
            expect(getContext(runResult.generator)).toEqual(expect.objectContaining(defaultConfig));
        });
    });
    describe('with defaults option', () => {
        let runResult;
        before(async () => {
            runResult = await contextBuilder().withOptions({ defaults: true, configure: true }).run();
        });
        it('should write default config to .yo-rc.json', () => {
            runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
        });
        it('should load default config into the context', () => {
            expect(getContext(runResult.generator)).toEqual(expect.objectContaining(requiredConfig));
        });
    });
    describe('with configure option', () => {
        let runResult;
        before(async () => {
            runResult = await contextBuilder().withOptions({ configure: true }).run();
        });
        it('should write .yo-rc.json only', () => {
            expect(runResult.getStateSnapshot()).toEqual({
                '.yo-rc.json': {
                    stateCleared: 'modified',
                },
            });
        });
    });
    describe('with custom prompt values', () => {
        let runResult;
        describe('and default options', () => {
            before(async () => {
                runResult = await contextBuilder().withOptions({ configure: true }).withPrompts(customPrompts).run();
            });
            it('should show prompts and write prompt values to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
            });
            it('should load default config with prompt values into the context', () => {
                expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
            });
        });
        describe('and defaults option', () => {
            before(async () => {
                runResult = await contextBuilder().withOptions({ defaults: true }).withPrompts(customPrompts).run();
            });
            it('should not show prompts and write default config to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
            });
            it('should load default config into the context', () => {
                expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
            });
        });
        describe('and skipPrompts option', () => {
            let runResult;
            before(async () => {
                runResult = await contextBuilder().withOptions({ skipPrompts: true, configure: true }).withPrompts(customPrompts).run();
            });
            it('should not show prompts and write required config to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
            });
            it('should load default config and required config into the context', () => {
                expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
            });
        });
        describe('and existing config', () => {
            let runResult;
            const existing = { baseName: 'existing' };
            before(async () => {
                runResult = await contextBuilder().withOptions({ localConfig: existing, configure: true }).withPrompts(customPrompts).run();
            });
            it('should not show prompts and write required config to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...requiredConfig, ...existing } });
            });
            it('should load default config and required config into the context', () => {
                expect(getContext(runResult.generator)).toEqual(
                    expect.objectContaining({ ...defaultConfig, ...requiredConfig, ...existing })
                );
            });
        });
        describe('and askAnswered option on an existing project', () => {
            let runResult;
            before(async () => {
                runResult = await contextBuilder()
                    .withOptions({ askAnswered: true, configure: true, localConfig: { baseName: 'existing' } })
                    .withPrompts(customPrompts)
                    .run();
            });
            it('should show prompts and write prompt values to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
            });
            it('should load default config and prompt values into the context', () => {
                expect(getContext(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
            });
        });
        describe('and add option on an existing project', () => {
            let runResult;
            const existingConfig = { baseName: 'existing' };
            before(async () => {
                runResult = await contextBuilder()
                    .withOptions({ add: true, configure: true, localConfig: existingConfig })
                    .withPrompts(customPrompts)
                    .run();
            });
            it('should show prompts and write prompt values to .yo-rc.json', () => {
                runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...customPrompts, ...existingConfig } });
            });
            it('should load default config and prompt values into the context', () => {
                expect(getContext(runResult.generator)).toEqual(
                    expect.objectContaining({ ...defaultConfig, ...customPrompts, ...existingConfig })
                );
            });
        });
    });
};

module.exports = {
    basicTests,
    // testBlueprintSupport,
    testOptions,
};
