import { readdir } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { globby } from 'globby';
import { describe, expect, it } from 'vitest';

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
                !file.includes('/common/') &&
                // Partials reworked
                !file.includes('/partials/') &&
                // Partials reworked
                !file.includes('relationship_validators.ejs') &&
                // Modularized file in JHipster 8
                !file.includes('_entityClass_Repository'),
        )) {
            const javaTemplate = file.replace('.kt', '.java').replace('kotlin/_package_', 'java/_package_');
            const possibleTemplates = [];
            let javaTemplateRelativePath;
            if (['src', 'partials', 'reactive'].includes(folder)) {
                javaTemplateRelativePath = relative(join(__dirname, 'templates'), javaTemplate);
                possibleTemplates.push(
                    join(jhipster8Generators, 'server/templates', javaTemplateRelativePath),
                    join(jhipster8Generators, 'spring-boot/templates', javaTemplateRelativePath),
                );
            } else {
                javaTemplateRelativePath = relative(join(__dirname, 'templates', folder), javaTemplate);
                if (['domain'].includes(folder)) {
                    possibleTemplates.push(join(jhipster8Generators, 'java/generators', folder, 'templates', javaTemplateRelativePath));
                } else {
                    possibleTemplates.push(join(jhipster8Generators, folder, 'templates', javaTemplateRelativePath));
                }
            }

            it(`java jhipster template should exist: ${javaTemplateRelativePath}`, async () => {
                expect(
                    possibleTemplates.some(template => existsSync(template)),
                    `none of files were found: ${possibleTemplates}`,
                ).toBeTruthy();
            });
        }
    }
});
