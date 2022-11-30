/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const os = require('os');

const constants = require('generator-jhipster/generators/generator-constants');
const prompts = require('generator-jhipster/generators/server/prompts');
const shelljs = require('shelljs');
const ServerGenerator = require('generator-jhipster/generators/server');
const writeFiles = require('./files').writeFiles;
const kotlinConstants = require('../generator-kotlin-constants');
const { askForKotlinServerSideOpts } = require('./prompts');

module.exports = class extends ServerGenerator {
    constructor(args, opts, features) {
        super(args, { fromBlueprint: true, ...opts }, features); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const khipsterCustomSteps = {
            setupConstants() {
                this.MOCKITO_KOTLIN_VERSION = kotlinConstants.MOCKITO_KOTLIN_VERSION;
                this.DETEKT_CONFIG_FILE = kotlinConstants.DETEKT_CONFIG_FILE;
            },
        };
        return Object.assign(phaseFromJHipster, khipsterCustomSteps);
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return {
            askForModuleName: prompts.askForModuleName,
            askForServerSideOpts: askForKotlinServerSideOpts,
            askForOptionalItems: prompts.askForOptionalItems,

            setSharedConfigOptions() {
                // Make dist dir available in templates
                this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool);
                this.CLIENT_DIST_DIR =
                    this.getResourceBuildDirectoryForBuildTool(this.jhipsterConfig.buildTool) + constants.CLIENT_DIST_DIR;
            },
        };
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get composing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._composing();
    }

    get loading() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._loading();
    }

    get preparing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._preparing();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is completely overridden
        return writeFiles();
    }

    get install() {
        const phaseFromJHipster = super._install();
        const myCustomPhaseSteps = {
            lintFiles() {
                if (this.options.skipKtlintFormat) {
                    this.log('Skipping ktlint format...');
                    return;
                }

                // Execute the ktlint format command through either Maven or gradle
                let command;
                const prefix = os.platform() === 'win32' ? '' : './';
                if (this.buildTool === 'gradle') {
                    command = `${prefix}gradlew :ktlintFormat`;
                } else if (this.buildTool === 'maven') {
                    command = `${prefix}mvnw ktlint:format`;
                }
                if (command) {
                    const startTime = new Date();
                    this.info('Running ktlint...');
                    const exitCode = shelljs.exec(command, { silent: this.silent }).code;
                    if (exitCode === 0) {
                        this.info(`Finished formatting Kotlin files in : ${new Date() - startTime}ms`);
                    } else {
                        this.warning('Something went wrong while running ktlint formatter...');
                    }
                }
            },
        };
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
    }

    get postWriting() {
        return super._postWriting();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
