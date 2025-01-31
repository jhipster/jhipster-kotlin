/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import { readdirSync } from 'node:fs';
import { entitiesByType, workflowSamples } from '../generate-sample/support/index.mjs';

/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
    configs: {
        sampleName: {
            argument: {
                type: String,
            },
            prompt: gen => ({
                when: !gen.jdlSamples && !gen.appSample && !gen.all,
                type: 'list',
                message: 'which sample do you want to generate?',
            }),
            choices: Object.keys(workflowSamples),
            configure: gen => {
                const sample = workflowSamples[gen.sampleName];
                if (!sample) {
                    throw new Error(`Sample ${gen.sampleName} not found`);
                }

                gen.sampleName = undefined;
                gen.appSample = sample['app-sample'];
                gen.jdlSamples = sample['jdl-samples'];
                gen.jdlEntities = sample['jdl-entity'];
                gen.entityType = sample.entity;
            },
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
                    let { appSample } = gen;
                    appSample = workflowSamples[appSample]?.['app-sample'] ?? appSample;
                    gen.samplesFolder = `_json-samples/${appSample}`;
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
                let { jdlSamples } = gen;
                if (!jdlSamples && gen.appSample) {
                    jdlSamples = workflowSamples[gen.appSample]?.['jdl-samples'];
                }
                if (jdlSamples) {
                    const [app, ...entities] = jdlSamples.split(',');
                    gen.samplesFolder = `_jdl-samples/${app}`;
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
                let { entityType } = gen;
                if (!entityType && gen.appSample) {
                    entityType = workflowSamples[gen.appSample]?.entity;
                }
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
                let { jdlEntities } = gen;
                if (!jdlEntities && gen.appSample) {
                    jdlEntities = workflowSamples[gen.appSample]?.['jdl-entity'];
                }
                if (jdlEntities) {
                    const entities = jdlEntities.split(',');
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
