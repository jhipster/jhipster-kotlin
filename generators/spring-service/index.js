/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR; // TODO: Yet to change this  `${constants.TEST_DIR}kotlin/`;

let useBlueprint;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts));
        this.argument('name', { type: String, required: true });
        this.name = this.options.name;
    }

    initializing() {
        this.log(`The service ${this.name} is being created.`);
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.databaseType = this.config.get('databaseType');
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            initializing() {
                this.log(`The spring-service ${this.name} is being created.`);
                const configuration = this.getAllJhipsterConfig(this, true);
                const blueprintConfiguration = this.getJhipsterAppConfig('generator-jhipster-kotlin');
                this.baseName = blueprintConfiguration.baseName || configuration.get('baseName');
                this.packageName = blueprintConfiguration.packageName || configuration.get('packageName');
                this.packageFolder = blueprintConfiguration.packageFolder || configuration.get('packageFolder');
                this.databaseType = blueprintConfiguration.databaseType || configuration.get('databaseType');

            }
        };
    }

    get initializing() {
        if (useBlueprint) return;
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            prompting() {
                const done = this.async();
                const prompts = [
                    {
                        type: 'confirm',
                        name: 'useInterface',
                        message: '(1/1) Do you want to use an interface for your service?',
                        default: false
                    }
                ];
                this.prompt(prompts).then((props) => {
                    this.useInterface = props.useInterface;
                done();
                });
            }
        };
    }

    get prompting() {
        if (useBlueprint) return;
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'service');
                insight.track('service/interface', this.useInterface);
            }
        };
    }

    get default() {
        if (useBlueprint) return;
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
            }
        };
    }

    get writing() {
        return this._writing();
    }
};
