import { extname } from 'node:path';
import os from 'node:os';
import { OutOfOrder } from 'p-transform';
import { isFileStateDeleted, isFileStateModified } from 'mem-fs-editor/state';
import ktlintWorker from './ktlint-worker.js';

export const filterKtlintTransformFiles = file => isFileStateModified(file) && !isFileStateDeleted(file) && extname(file.path) === '.kt';

export const createKtlintTransform = function ({ ktlintExecutable, cwd, ignoreErrors } = {}) {
    return new OutOfOrder(
        async file => {
            if (!filterKtlintTransformFiles(file)) {
                return file;
            }
            const { result, error, info } = await ktlintWorker({ ktlintExecutable, cwd, fileContents: file.contents.toString('utf8') });
            if (result) {
                file.contents = Buffer.from(result);
            }
            if (info) {
                this?.log?.info?.(info.replaceAll('<stdin>', file.relative));
            }
            if (error) {
                if (!ignoreErrors) {
                    throw new Error(error);
                }
                this?.log?.warn?.(error);
            }
            return file;
        },
        {
            concurrency: os.availableParallelism(),
        },
    ).duplex();
};
