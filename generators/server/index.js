/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const chalk = require('chalk');
const shelljs = require('shelljs');
const ServerGenerator = require('generator-jhipster/generators/server');
const writeFiles = require('./files').writeFiles;
const kotlinConstants = require('../generator-kotlin-constants');

module.exports = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error(`This is a JHipster blueprint and should be used only like ${chalk.yellow('jhipster --blueprint kotlin')}`);
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const myCustomPhaseSteps = {
            setupConstants() {
                this.MOCKITO_KOTLIN_VERSION = kotlinConstants.MOCKITO_KOTLIN_VERSION;
                this.KTLINT_VERSION = kotlinConstants.KTLINT_VERSION;
            }
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

    get install() {
        const phaseFromJHipster = super._install();
        const myCustomPhaseSteps = {
            lintFiles() {
                // Execute the ktlint format command through either Maven or gradle
                let command;
                if (this.buildTool === 'gradle') {
                    command = './gradlew ktlintFormat';
                } else if (this.buildTool === 'maven') {
                    command = './mvnw antrun:run@ktlint-format';
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
            }
        };
        return Object.assign(phaseFromJHipster, myCustomPhaseSteps);
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};
