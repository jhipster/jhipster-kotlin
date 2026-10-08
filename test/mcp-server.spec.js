import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';

import { createMcpServer } from '../cli/mcp-server.js';

const mcpCli = fileURLToPath(new URL('../cli/mcp.cjs', import.meta.url));

describe('MCP server for JDL and KHipster', () => {
    let tempDir;

    beforeAll(async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'khipster-mcp-test-'));
    });

    afterAll(async () => {
        if (tempDir) {
            await rm(tempDir, { recursive: true, force: true });
        }
    });

    it('initializes the McpServer with expected tools and prompt', () => {
        const server = createMcpServer();
        expect(server).toBeDefined();
        expect(server.server).toBeDefined();
    });

    it('provides JDL reference documentation via get_jdl_reference', async () => {
        const server = createMcpServer();
        const toolHandler = server._registeredTools.get_jdl_reference;
        expect(toolHandler).toBeDefined();

        const fullRef = await toolHandler.handler({});
        expect(fullRef.content[0].text).toContain('JHipster Domain Language (JDL) Reference for KHipster');
        expect(fullRef.content[0].text).toContain('dto * with mapstruct');
        expect(fullRef.content[0].text).toContain('service * with serviceClass');

        const typesRef = await toolHandler.handler({ topic: 'types' });
        expect(typesRef.content[0].text).toContain('Entities & Fields');

        const relRef = await toolHandler.handler({ topic: 'relationships' });
        expect(relRef.content[0].text).toContain('Relationships');

        const optRef = await toolHandler.handler({ topic: 'options' });
        expect(optRef.content[0].text).toContain('Kotlin & Architecture Options');
    });

    it('writes JDL files to disk via write_jdl_file', async () => {
        const server = createMcpServer();
        const writeHandler = server._registeredTools.write_jdl_file;
        expect(writeHandler).toBeDefined();

        const targetFile = 'test-domain.jdl';
        const jdlSample = 'entity Author { name String required }\n';

        const result = await writeHandler.handler({
            jdlContent: jdlSample,
            targetFile,
            projectPath: tempDir,
        });

        expect(result.isError).toBeFalsy();
        expect(result.content[0].text).toContain('Successfully wrote JDL model');

        const writtenContent = await readFile(join(tempDir, targetFile), 'utf8');
        expect(writtenContent).toBe(jdlSample);
    });

    it('rejects empty JDL content in write_jdl_file', async () => {
        const server = createMcpServer();
        const writeHandler = server._registeredTools.write_jdl_file;

        const result = await writeHandler.handler({
            jdlContent: '   ',
            targetFile: 'empty.jdl',
            projectPath: tempDir,
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Error: jdlContent cannot be empty');
    });

    it('handles nonexistent JDL file in import_jdl gracefully with an error report', async () => {
        const server = createMcpServer();
        const importHandler = server._registeredTools.import_jdl;

        const result = await importHandler.handler({
            jdlFile: 'nonexistent-model.jdl',
            projectPath: tempDir,
            skipInstall: true,
            force: true,
        });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('failed with exit code');
    });

    it('starts MCP server binary without polluting stdout', async () => {
        const subprocess = execa(process.execPath, [mcpCli], { reject: false });

        let stderrOutput = '';
        subprocess.stderr.on('data', chunk => {
            stderrOutput += chunk.toString();
        });

        await new Promise(r => setTimeout(r, 1000));
        subprocess.kill();
        await subprocess.catch(() => {});

        expect(stderrOutput).toContain('[khipster-mcp]');
    });
});
