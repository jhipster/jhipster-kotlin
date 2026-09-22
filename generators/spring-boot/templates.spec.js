import { describe, expect, it } from 'vitest';
import { readdir } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

import { globby } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
// const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));
const jhipster8Generators = join(__dirname, '../../node_modules/generator-jhipster/dist/generators');

describe('test if kotlin templates has a matching java template', async () => {
    const templatesFolder = join(__dirname, 'templates');
    const folders = await readdir(templatesFolder);
    for (const folder of folders.filter(folder => !folder.startsWith('.') && !['pom.xml.ejs'].includes(folder))) {
        const files = await globby(`${join(templatesFolder, folder)}/**`, { gitignore: true });
        for (const file of files.filter(
            file =>
                // Partials reworked
                !file.includes('field_validators.ejs') &&
                // Removed partial
                !file.includes('update_template.ejs') &&
                // Partials reworked
                !file.includes('relationship_validators.ejs') &&
                // Modularized file in JHipster 8
                !file.includes('_entityClass_Repository') &&
                // Mapped to KafkaResourceIT_imperative
                !file.includes('KafkaResourceIT_reactive'),
        )) {
            const javaTemplate = file.replace('.kt', '.java').replace('kotlin/_package_', 'java/_package_');
            const javaTemplateRelativePath = ['src', '_global_partials_entity_', 'reactive'].includes(folder)
                ? relative(join(__dirname, 'templates'), javaTemplate)
                : relative(join(__dirname, 'templates', folder), javaTemplate);

            it(`java jhipster template should exist: ${javaTemplateRelativePath}`, async () => {
                // JHipster's own generators get reorganized across releases (subgenerators move,
                // get renamed, etc.), so search the whole tree for a matching relative path instead
                // of hardcoding which generator currently owns it.
                const matches = await globby(`**/templates/${javaTemplateRelativePath}`, {
                    cwd: jhipster8Generators,
                    gitignore: false,
                });
                expect(
                    matches,
                    `none of files were found for ${javaTemplateRelativePath}, it was removed in generator-jhipster?`,
                ).not.toHaveLength(0);
            });
        }
    }
});
