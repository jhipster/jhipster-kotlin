import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const isReactiveSample = (sample, templatesFolder) => {
    if (sample['app-sample']) {
        const config = JSON.parse(readFileSync(join(templatesFolder, '_json-samples', sample['app-sample'], '.yo-rc.json'), 'utf8'))[
            'generator-jhipster'
        ];
        return config.reactive ?? config.applicationType === 'gateway';
    }
    if (sample['jdl-samples']) {
        const files = sample['jdl-samples'].split(',').flatMap(name => {
            const folder = join(templatesFolder, '_jdl-samples', name);
            if (existsSync(folder)) {
                return readdirSync(folder)
                    .filter(file => file.endsWith('.jdl'))
                    .map(file => join(folder, file));
            }
            return [join(templatesFolder, '_supporting-samples', `${name}.jdl`)];
        });
        // Gateways default to WebFlux, but an explicit reactive setting takes precedence.
        // Inspect each application config independently, including mixed application stacks.
        return files.some(file => {
            const content = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
            return [...content.matchAll(/\bapplication\s*\{\s*config\s*\{([^}]+)\}/g)].some(([, config]) => {
                const reactive = config.match(/\breactive\s+(true|false)\b/);
                return reactive ? reactive[1] === 'true' : /\bapplicationType\s+gateway\b/.test(config);
            });
        });
    }
    throw new Error('Cannot determine the application type for a workflow sample');
};
