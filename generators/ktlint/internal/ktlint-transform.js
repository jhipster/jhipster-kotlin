import os from 'node:os';
import { extname } from 'node:path';

import { isFileStateDeleted, isFileStateModified } from 'mem-fs-editor/state';
import { OutOfOrder } from 'p-transform';

import ktlintWorker from './ktlint-worker.js';

export const filterKtlintTransformFiles = file =>
    isFileStateModified(file) && !isFileStateDeleted(file) && ['.kt', '.kts'].includes(extname(file.path));

export const createKtlintTransform = function ({ ktlintExecutable, cwd } = {}) {
    return new OutOfOrder(
        async file => {
            if (!filterKtlintTransformFiles(file)) {
                return file;
            }
            const { result, error } = await ktlintWorker({
                ktlintExecutable,
                cwd,
                filePath: file.path,
                fileContents: file.contents.toString('utf8'),
            });
            if (result !== undefined) {
                file.contents = Buffer.from(result);
            }
            if (error) {
                throw new Error(`ktlint failed for ${file.relative}: ${error}`);
            }
            return file;
        },
        {
            concurrency: Math.min(4, os.availableParallelism()),
        },
    ).duplex();
};
