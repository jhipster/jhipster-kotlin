import { passthrough } from 'p-transform';
import { Piscina } from 'piscina';
import { filterKtlintTransformFiles } from './ktlint-transform.js';

export { filterKtlintTransformFiles };

/**
 * Experimental transform using piscina to check performance.
 */
export const createKtlintTransform = function ({ ktlintExecutable, cwd, ignoreErrors } = {}) {
    const pool = new Piscina({
        filename: new URL('../internal/ktlint-worker.js', import.meta.url).href,
    });

    return passthrough(
        async file => {
            if (!filterKtlintTransformFiles(file)) {
                return;
            }
            const { result, error, info } = await pool.run({ ktlintExecutable, cwd, fileContents: file.contents.toString('utf8') });
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
        },
        () => {
            pool.destroy();
        },
    );
};
