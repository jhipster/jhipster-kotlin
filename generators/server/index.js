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

const shelljs = require('shelljs');
const ServerGenerator = require('generator-jhipster/generators/server');
const writeFiles = require('./files').writeFiles;
const kotlinConstants = require('../generator-kotlin-constants');

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
        }
        // This adds support for a `--skip-ktlint-format` flag
        this.option('skip-ktlint-format', {
            desc: 'Indicates to skip formatting using ktlint',
            type: Boolean,
            defaults: false,
        });
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const myCustomPhaseSteps = {
            setupConstants() {
                this.MOCKITO_KOTLIN_VERSION = kotlinConstants.MOCKITO_KOTLIN_VERSION;
                this.DETEKT_CONFIG_FILE = kotlinConstants.DETEKT_CONFIG_FILE;
            },
        };
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        // The writing phase is completely overridden
        return writeFiles();
    }

    get postWriting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._postWriting();
    }

    get install() {
        const phaseFromJHipster = super._install();
        const myCustomPhaseSteps = {
            lintFiles() {
                if (this.options['skip-ktlint-format']) {
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

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
