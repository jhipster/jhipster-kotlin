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
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import chalk from 'chalk';
import packagejs from './package-json.mjs';

export function displayLogo() {
    this.log('\n');
    this.log(`${chalk.blue(' ██╗  ██╗')}${chalk.green(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}`);
    this.log(`${chalk.blue(' ██║ ██╔╝')}${chalk.green(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}`);
    this.log(`${chalk.blue(' █████╔╝ ')}${chalk.green(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}`);
    this.log(`${chalk.blue(' ██╔═██╗ ')}${chalk.green(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}`);
    this.log(`${chalk.blue(' ██║  ██╗')}${chalk.green(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}`);
    this.log(`${chalk.blue(' ╚═╝  ╚═╝')}${chalk.green(' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝')}\n`);
    this.log(chalk.white('Welcome to KHipster ') + chalk.yellow(`v${packagejs.version}`));
    this.log(chalk.white(`Application files will be generated in folder: ${chalk.yellow(process.cwd())}`));
    if (process.cwd() === this.getUserHome()) {
        this.log(chalk.red.bold('\n️⚠️  WARNING ⚠️  You are in your HOME folder!'));
        this.log(chalk.red('This can cause problems, you should always create a new directory and run the khipster command from here.'));
        this.log(chalk.white(`See the troubleshooting section at ${chalk.yellow('https://www.jhipster.tech/installation/')}`));
    }
    this.log(
        chalk.blue(' _______________________________________________________________________________________________________________\n')
    );
    this.log(
        chalk.white(`  Documentation for creating an application is at ${chalk.yellow('https://www.jhipster.tech/creating-an-app/')}`)
    );
    this.log(
        chalk.white(
            `  If you find KHipster useful, consider sponsoring the our parent project at ${chalk.yellow(
                'https://opencollective.com/generator-jhipster'
            )}`
        )
    );
    this.log(
        chalk.blue(' _______________________________________________________________________________________________________________\n')
    );
}
