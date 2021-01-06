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
const _ = require('lodash');
const chalk = require('chalk');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const constants = require('generator-jhipster/generators/generator-constants');
const statistics = require('generator-jhipster/generators/statistics');
const prompts = require('./prompts');

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = `${constants.TEST_DIR}kotlin/`;

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

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            initializing() {
                this.log(`The spring-controller ${this.name} is being created.`);
                const configuration = this.config;
                this.baseName = configuration.get('baseName');
                this.packageName = configuration.get('packageName');
                this.packageFolder = configuration.get('packageFolder');
                this.databaseType = configuration.get('databaseType');
                this.messageBroker = configuration.get('messageBroker') === 'no' ? false : configuration.get('messageBroker');
                if (this.messageBroker === undefined) {
                    this.messageBroker = false;
                }
                this.reactiveController = false;
                this.applicationType = configuration.get('applicationType');
                this.reactive = configuration.get('reactive');
                this.reactiveController = this.reactive;
                this.controllerActions = [];
            },
        };
    }

    get initializing() {
        return this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _prompting() {
        return {
            askForControllerActions: prompts.askForControllerActions,
        };
    }

    get prompting() {
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'spring-controller-kotlin');
            },
        };
    }

    get default() {
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            writing() {
                this.controllerClass = _.upperFirst(this.name) + (this.name.endsWith('Resource') ? '' : 'Resource');
                this.controllerInstance = _.lowerFirst(this.controllerClass);
                this.apiPrefix = _.kebabCase(this.name);

                if (this.controllerActions.length === 0) {
                    this.log(chalk.green('No controller actions found, adding a default action'));
                    this.controllerActions.push({
                        actionName: 'defaultAction',
                        actionMethod: 'Get',
                    });
                }

                // helper for Java imports
                this.usedMethods = _.uniq(this.controllerActions.map(action => action.actionMethod));
                this.usedMethods = this.usedMethods.sort();

                this.mappingImports = this.usedMethods.map(method => `org.springframework.web.bind.annotation.${method}Mapping`);
                this.mockRequestImports = this.usedMethods.map(
                    method => `org.springframework.test.web.servlet.request.MockMvcRequestBuilders.${method.toLowerCase()}`
                );

                this.mockRequestImports =
                    this.mockRequestImports.length > 3
                        ? ['org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*']
                        : this.mockRequestImports;

                this.mainClass = this.getMainClassName();

                this.controllerActions.forEach(action => {
                    action.actionPath = _.kebabCase(action.actionName);
                    action.actionNameUF = _.upperFirst(action.actionName);
                    this.log(
                        chalk.green(
                            `adding ${action.actionMethod} action '${action.actionName}' for /api/${this.apiPrefix}/${action.actionPath}`
                        )
                    );
                });

                this.template(
                    `${SERVER_TEST_SRC_DIR}package/web/rest/ResourceIT.kt.ejs`,
                    `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}IT.kt`
                );
                this.template(
                    `${SERVER_MAIN_SRC_DIR}package/web/rest/Resource.kt.ejs`,
                    `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}.kt`
                );
            },
        };
    }

    get writing() {
        return this._writing();
    }
};
