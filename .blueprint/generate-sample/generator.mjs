import { readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import BaseGenerator from 'generator-jhipster/generators/base';
import { entitiesByType } from './support/entities-by-type.mjs';

export default class extends BaseGenerator {
    sampleName;
    all;
    samplesFolder;
    entrypointGenerator;
    generatorArgs;
    appSample;
    entityType;
    jdlSamples;
    supportingSamples = [];

    constructor(args, opts, features) {
        super(args, opts, { ...features, jhipsterBootstrap: false });
    }

    get [BaseGenerator.INITIALIZING]() {
        return this.asInitializingTaskGroup({
            async parseCommand() {
                await this.parseCurrentJHipsterCommand();
            },
        });
    }

    get [BaseGenerator.PROMPTING]() {
        return this.asPromptingTaskGroup({
            async askForSample() {
                await this.promptCurrentJHipsterCommand();
            },
        });
    }

    get [BaseGenerator.CONFIGURING]() {
        return this.asConfiguringTaskGroup({
            async configureCommand() {
                await this.configureCurrentJHipsterCommandConfig();
            },
        });
    }

    get [BaseGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async loadCommand() {
                await this.loadCurrentJHipsterCommandConfig(this);
            },
        });
    }

    get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async copySample() {
                if (this.all) {
                    this.log.info(`Copying all samples from ${this.samplesFolder}`);
                    this.copyTemplate(`${this.samplesFolder}/*.jdl`, '');
                } else if (this.sampleName) {
                    this.log.info(`Copying sample from ${this.samplesFolder}/${this.sampleName}`);
                    this.copyTemplate(`${this.samplesFolder}/${this.sampleName}`, this.sampleName, { noGlob: true });
                } else {
                    this.log.info(`Copying all files from ${this.samplesFolder}`);
                    this.copyTemplate('*', '', { fromBasePath: this.templatePath(this.samplesFolder), globOptions: { dot: true } });
                }
            },
            async copySupportingSamples() {
                const { supportingSamples } = this;
                if (supportingSamples && supportingSamples.length > 0) {
                    this.log.info(`Copying support samples ${supportingSamples}`);
                    this.copyTemplate(supportingSamples, '', {
                        fromBasePath: this.templatePath('supporting-samples'),
                        globOptions: { dot: true },
                    });
                }
            },
        });
    }

    get [BaseGenerator.END]() {
        return this.asEndTaskGroup({
            async generateSample() {
                const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)));
                const projectVersion = `${packageJson.version}-git`;

                if (this.generatorArgs === '*.jdl') {
                    this.generatorArgs = (await readdir(this.destinationPath())).filter(file => file.endsWith('.jdl'));
                }
                await this.composeWithJHipster(this.entrypointGenerator, {
                    generatorArgs: this.generatorArgs ?? [this.sampleName],
                    generatorOptions: {
                        skipJhipsterDependencies: true,
                        insight: false,
                        skipChecks: true,
                        projectVersion,
                        ignoreApplication: false,
                        ...(this.all ? { workspaces: true, monorepository: true } : { skipInstall: true }),
                    },
                });
            },
            async jhipsterInfo() {
                await this.composeWithJHipster('info');
            },
        });
    }
}
