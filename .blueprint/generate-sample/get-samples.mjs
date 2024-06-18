import { readdir, stat } from 'node:fs/promises';
import { extname } from 'path';

export const getSamples = async samplesFolder => {
    const filenames = await readdir(samplesFolder);
    const entries = await Promise.all(filenames.map(async filename => [filename, await stat(`${samplesFolder}/${filename}`)]));
    return entries
        .filter(([filename, statResult]) => extname(filename) === '.jdl' || statResult.isDirectory())
        .map(([filename]) => filename)
        .filter(filename => !filename.includes('disabled'));
};
