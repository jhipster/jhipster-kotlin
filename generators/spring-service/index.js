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
const _ = require('lodash');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const constants = require('generator-jhipster/generators/generator-constants');
const statistics = require('generator-jhipster/generators/statistics');

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts });
        this.argument('name', { type: String, required: true });
        this.name = this.options.name;

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });
        this.option('default', {
            type: Boolean,
            default: false,
            description: 'default option',
        });
        this.defaultOption = this.options.default;
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            initializing() {
                this.log(`The service ${this.name} is being created.`);
                const configuration = this.config;
                this.baseName = configuration.get('baseName');
                this.packageName = configuration.get('packageName');
                this.packageFolder = configuration.get('packageFolder');
                this.databaseType = configuration.get('databaseType');
            },
        };
    }

    get initializing() {
        return this._initializing();
    }

    _prompting() {
        return {
            prompting() {
                const prompts = [
                    {
                        type: 'confirm',
                        name: 'useInterface',
                        message: '(1/1) Do you want to use an interface for your service?',
                        default: false,
                    },
                ];
                if (!this.defaultOption) {
                    const done = this.async();
                    this.prompt(prompts).then(props => {
                        this.useInterface = props.useInterface;
                        done();
                    });
                } else {
                    this.useInterface = true;
                }
            },
        };
    }

    get prompting() {
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'service-kotlin', { interface: this.useInterface });
            },
        };
    }

    get default() {
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            write() {
                this.serviceClass = _.upperFirst(this.name) + (this.name.endsWith('Service') ? '' : 'Service');
                this.serviceInstance = _.lowerCase(this.serviceClass);

                this.template(
                    `${SERVER_MAIN_SRC_DIR}package/service/Service.kt.ejs`,
                    `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/${this.serviceClass}.kt`
                );

                if (this.useInterface) {
                    this.template(
                        `${SERVER_MAIN_SRC_DIR}package/service/impl/ServiceImpl.kt.ejs`,
                        `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/impl/${this.serviceClass}Impl.kt`
                    );
                }
            },
        };
    }

    get writing() {
        return this._writing();
    }
};
