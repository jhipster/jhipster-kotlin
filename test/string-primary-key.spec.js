import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';

const cli = fileURLToPath(new URL('../cli/cli.cjs', import.meta.url));
const jdl = fileURLToPath(new URL('./templates/string-primary-key/app.jdl', import.meta.url));

describe('issue #357: importing a custom String primary key', () => {
    let destination;
    const readGeneratedFile = path => readFile(join(destination, path), 'utf8');

    beforeAll(async () => {
        destination = await mkdtemp(join(tmpdir(), 'khipster-string-primary-key-'));
        await copyFile(jdl, join(destination, 'app.jdl'));
        // Exercise the public CLI and the complete EJS rendering pipeline with the issue's JDL.
        // Entity generation is now implicit; the old --with-entities option was removed upstream.
        await execa(process.execPath, [cli, 'import-jdl', 'app.jdl', '--skip-git', '--skip-install', '--force', '--skip-ktlint-format'], {
            cwd: destination,
            timeout: 60000,
        });
    }, 65000);

    afterAll(async () => {
        if (destination) await rm(destination, { recursive: true, force: true });
    });

    it('preserves the JDL primary key in the entity configuration', async () => {
        const entity = JSON.parse(await readGeneratedFile('.jhipster/Abc0.json'));
        expect(entity.fields).toContainEqual({ fieldName: 'key', fieldType: 'String', options: { id: true } });
    });

    it('generates a Kotlin domain and repository with an assigned String key', async () => {
        const domain = await readGeneratedFile('src/main/kotlin/sample/domain/Abc0.kt');
        expect(domain).toMatch(/@Id\s+@Column\(name = "key"\)\s+var key: String\? = null/);
        expect(domain).toContain('Persistable<String>');
        expect(domain).toContain('override fun getId() = this.key');
        expect(domain).not.toContain('@GeneratedValue');
        expect(await readGeneratedFile('src/main/kotlin/sample/repository/Abc0Repository.kt')).toContain('JpaRepository<Abc0, String>');
    });

    it('renders REST resources and integration tests using the custom key', async () => {
        const resource = await readGeneratedFile('src/main/kotlin/sample/web/rest/Abc0Resource.kt');
        expect(resource).toContain('abc0.key?.let { abc0Repository.existsById(it) }');
        expect(resource).toContain('@PathVariable(value = "key", required = false) key: String');
        expect(resource).toContain('URI("/api/abc-0-s/${result.key}")');
        expect(await readGeneratedFile('src/test/kotlin/sample/web/rest/Abc0ResourceIT.kt')).toContain(
            'abc0.key = UUID.randomUUID().toString()',
        );
    });
});
