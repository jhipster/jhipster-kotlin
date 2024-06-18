/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { getSamples } from './get-samples.mjs';
import { entitiesByType } from './support/index.mjs';
import { existsSync, readdirSync } from 'node:fs';

const updateSampleName = sample =>
    sample.replace('ngx', 'ng').replace('ms-ng-eureka-oauth2-mongodb-caffeine', 'ms-ng-oauth2-mongodb-caffeine');

/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
    arguments: {
        sampleName: {
            type: String,
        },
    },
    configs: {
        sampleName: {
            prompt: gen => ({
                when: !gen.all && existsSync(gen.templatePath(gen.samplesFolder)),
                type: 'list',
                message: 'which sample do you want to generate?',
                choices: async () => getSamples(gen.templatePath(gen.samplesFolder)),
            }),
            scope: 'generator',
        },
        all: {
            description: 'Generate every sample in a workspace',
            cli: {
                type: Boolean,
            },
            configure: gen => {
                if (gen.all) {
                    gen.generatorArgs = readdirSync(this.templatePath('samples'));
                }
            },
            scope: 'generator',
        },
        samplesFolder: {
            description: 'Path to the samples folder',
            cli: {
                type: String,
            },
            default: 'samples',
            scope: 'generator',
        },
        entrypointGenerator: {
            description: 'The generator to use as the entrypoint',
            cli: {
                type: String,
            },
            default: 'jdl',
            scope: 'generator',
        },
        appSample: {
            description: 'Sample name to generate',
            cli: {
                type: String,
                env: 'JHI_APP',
            },
            configure: gen => {
                if (gen.appSample && gen.appSample !== 'jdl') {
                    gen.samplesFolder = `json-samples/${updateSampleName(gen.appSample)}`;
                    gen.entrypointGenerator = 'app';
                }
            },
            scope: 'generator',
        },
        jdlSamples: {
            description: 'Generate JDL samples',
            cli: {
                type: String,
                env: 'JHI_JDL_APP',
            },
            configure: gen => {
                if (gen.jdlSamples) {
                    const [app, ...entities] = gen.jdlSamples.split(',');
                    gen.samplesFolder = `jdl-samples/${updateSampleName(app)}`;
                    gen.generatorArgs = '*.jdl';
                    if (entities && entities.length > 0) {
                        gen.supportingSamples.push(...entities.map(entity => `${entity}.jdl`));
                    }
                }
            },
            scope: 'generator',
        },
        entityType: {
            description: 'Entity type to generate',
            cli: {
                env: 'JHI_ENTITY',
                type: String,
            },
            configure: gen => {
                const { entityType } = gen;
                if (entityType && entityType !== 'none') {
                    gen.supportingSamples.push(...entitiesByType[entityType].map(entity => `.jhipster/${entity}.json`));
                }
            },
            choices: [...Object.keys(entitiesByType), 'none'],
            scope: 'generator',
        },
        jdlEntities: {
            description: 'Generate JDL entities samples',
            cli: {
                type: String,
                env: 'JHI_JDL_ENTITY',
            },
            configure: gen => {
                if (gen.jdlEntities) {
                    const entities = gen.jdlEntities.split(',');
                    gen.generatorArgs = '*.jdl';
                    gen.entrypointGenerator = 'jdl';
                    if (entities && entities.length > 0) {
                        gen.supportingSamples.push(...entities.map(entity => `${entity}.jdl`));
                    }
                }
            },
            scope: 'generator',
        },
    },
    options: {},
    import: ['app', 'workspaces'],
};

export default command;
