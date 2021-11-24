#!/usr/bin/env node
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
const semver = require('semver');
const path = require('path');
const { logger } = require('generator-jhipster/cli/utils');
const packageJson = require('../package.json');

const currentNodeVersion = process.versions.node;
const minimumNodeVersion = packageJson.engines.node;

if (!semver.satisfies(currentNodeVersion, minimumNodeVersion)) {
    /* eslint-disable no-console */
    logger.error(
        `You are running Node version ${currentNodeVersion}\nKHipster requires Node version ${minimumNodeVersion}\nPlease update your version of Node.`
    );
    /* eslint-enable  */
}

let preferLocal = true;

// Don't use commander for parsing command line to avoid polluting it in cli.js
// --prefer-local: Always resolve node modules locally (useful when using linked module)
if ((process.argv.includes('upgrade') && !process.argv.includes('--prefer-local')) || process.argv.includes('--prefer-global')) {
    // Prefer global version for `jhipster upgrade` to get most recent code
    preferLocal = false;
}

// Pass in kotlin as a blueprint module.
// User passes in blueprints flag but without Kotlin :> append Kotlin
if (!process.argv.includes('kotlin') && process.argv.includes('--blueprints')) {
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--blueprints') {
            process.argv[i + 1] = `${process.argv[i + 1].split(',')},kotlin`;
        }
    }
    // User passes in blueprint flag but without Kotlin :> append Kotlin
} else if (!process.argv.includes('kotlin') && process.argv.includes('--blueprint')) {
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--blueprint') {
            process.argv[i] = '--blueprints';
            process.argv[i + 1] = `${process.argv[i + 1]},kotlin`;
        }
    }
    // User donot pass in blueprints or blueprint flag but without Kotlin :> append Kotlin
} else if (!process.argv.includes('kotlin') && !process.argv.includes('--blueprint') && !process.argv.includes('--blueprints')) {
    process.argv.push('--blueprints');
    process.argv.push('kotlin');
}

requireCLI(preferLocal);

/*
 * Require cli.js giving priority to local version over global one if it exists.
 */
function requireCLI(preferLocal) {
    /* eslint-disable global-require */
    if (preferLocal) {
        try {
            const localCLI = require.resolve(path.join(process.cwd(), 'node_modules', 'generator-jhipster', 'cli', 'cli.js'));
            if (__dirname !== path.dirname(localCLI)) {
                // load local version
                /* eslint-disable import/no-dynamic-require */
                logger.info("Using KHipster version installed locally in current project's node_modules");
                require(localCLI);
                return;
            }
        } catch (e) {
            // Unable to find local version, so global one will be loaded anyway
        }
    }
    // load global version
    logger.info('Using JHipster version installed globally');
    require('generator-jhipster/cli/cli');
    /* eslint-enable  */
}
