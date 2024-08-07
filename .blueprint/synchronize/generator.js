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
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { basename, dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import BaseGenerator from 'generator-jhipster/generators/base';
import { globby } from 'globby';
import { passthrough } from '@yeoman/transform';
import { convertToKotlinFile } from '../../generators/kotlin/support/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jhipster8Generators = join(__dirname, '../../node_modules/generator-jhipster/dist/generators');

export default class SynchronizeGenerator extends BaseGenerator {
    constructor(args, options, features) {
        super(args, options, { queueCommandTasks: true, ...features });
    }

    get [BaseGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            default() {
                if (this.options.convert === false) {
                    return;
                }
                this.queueTransformStream(
                    {
                        name: 'convert to kt file',
                        filter: file => file.path.endsWith('.kt.ejs'),
                    },
                    passthrough(file => {
                        file.contents = Buffer.from(
                            file.contents
                                .toString()
                                .replaceAll(';\n', '\n')
                                .replaceAll('\nimport static ', '\nimport ')
                                .replaceAll('public class ', 'class ')
                                .replaceAll('.class', '::class')
                                .replaceAll(/ (?:extends|implements) (\w+)/g, ' : $1')
                                .replaceAll(/ (?:extends|implements) /g, ' : ')
                                .replaceAll(/@Override\n(\s*)/g, 'override ')
                                .replaceAll(/\n( {4})(private |)?(?:final )?(\w+) (\w+)(\n| = )/g, '\n$1$2lateinit var $4: $3$5')
                                .replaceAll(/private static final (\w+) /g, 'private val ')
                                .replaceAll(/(?:public |protected )?(\w+) (\w+)\((.*)\) {/g, 'fun $2($3): $1 {')
                                .replaceAll(': void', ''),
                        );
                    }),
                );
            },
        });
    }

    get [BaseGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async writing() {
                const files = await globby(`${jhipster8Generators}/**/*.java.ejs`);
                const ktTemplatesPath = this.destinationPath('generators/spring-boot/templates');
                for (const file of files.filter(
                    file => !file.includes('/spring-data-couchbase/') && !['GeneratedByJHipster.java.ejs'].includes(basename(file)),
                )) {
                    const relativeDestinationFile = convertToKotlinFile(relative(jhipster8Generators, file))
                        .replace('spring-boot/templates/', '')
                        .replace('server/templates/', '')
                        .replace(/(?:(?:.*)\/generators\/)?(.*)\/templates/, '$1');
                    const destinationFile = join(ktTemplatesPath, relativeDestinationFile);
                    if (this.options.newFiles !== true || !existsSync(destinationFile)) {
                        this.copyTemplate(file, destinationFile);
                    }
                }
            },
        });
    }
}
