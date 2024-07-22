import { createWriteStream, existsSync } from 'node:fs';
import { chmod, mkdir, rm } from 'node:fs/promises';
import { platform } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import axios from 'axios';
import { createKtlintTransform, filterKtlintTransformFiles } from './internal/ktlint-transform.js';

export default class extends BaseApplicationGenerator {
    ktlintFolder;
    ktlintExecutable;

    constructor(args, opts, features) {
        super(args, opts, {
            ...features,
            queueCommandTasks: true,
        });
    }

    async beforeQueue() {
        await this.dependsOnBootstrapApplicationServer();
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async loading({ application }) {
                this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies);
                this.ktlintFolder = this.destinationPath('.ktlint', application.javaDependencies['ktlint-cli']);
                this.ktlintExecutable = join(this.ktlintFolder, platform() === 'win32' ? 'ktlint.bat' : 'ktlint');
            },
        });
    }

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            async downloadKtlint({ application }) {
                if (!this.options.skipKtlintFormat && !existsSync(this.ktlintExecutable)) {
                    await this.env.adapter.progress(
                        async () => {
                            try {
                                const ktlintVersion = application.javaDependencies['ktlint-cli'];
                                const ktlintUrl = 'https://github.com/pinterest/ktlint/releases/download/';

                                await mkdir(this.ktlintFolder, { recursive: true });

                                const response = await axios.get(`${ktlintUrl}${ktlintVersion}/ktlint`, { responseType: 'stream' });
                                const ktlintFile = join(this.ktlintFolder, 'ktlint');
                                await pipeline(response.data, createWriteStream(ktlintFile));
                                await chmod(ktlintFile, 0o755);

                                const batResponse = await axios.get(`${ktlintUrl}/${ktlintVersion}/ktlint.bat`, { responseType: 'stream' });
                                await pipeline(batResponse.data, createWriteStream(join(this.ktlintFolder, 'ktlint.bat')));
                            } catch (error) {
                                this.log.error('Failed to download ktlint');
                                await rm(this.ktlintFolder, { recursive: true });
                                throw error;
                            }
                        },
                        { name: 'downloading ktlint' },
                    );
                }
            },
            async defaultTemplateTask({ control }) {
                if (!this.options.skipKtlintFormat) {
                    const destinationPath = this.destinationPath();
                    this.queueTransformStream(
                        {
                            name: 'formating using ktlint',
                            filter: file => filterKtlintTransformFiles(file) && file.path.startsWith(destinationPath),
                            refresh: false,
                        },
                        createKtlintTransform.call(this, {
                            ktlintExecutable: this.ktlintExecutable,
                            cwd: destinationPath,
                            ignoreErrors: control.ignoreNeedlesError,
                        }),
                    );
                }
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async writing({ application }) {
                await this.writeFiles({
                    blocks: [{ templates: ['.gitignore.jhi.ktlint'] }],
                    context: application,
                });
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async postWriting({ application }) {
                const command = application.buildToolGradle ? './gradlew :ktlintFormat' : './mvnw ktlint:format';
                this.packageJson.merge({
                    scripts: {
                        'ktlint:format': command,
                    },
                });
            },
        });
    }
}
