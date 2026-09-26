import { beforeEach, describe, expect, it, vi } from 'vitest';

import { execa } from 'execa';

import ktlintWorker from './ktlint-worker.js';

vi.mock('execa', () => ({ execa: vi.fn() }));

const options = {
    ktlintExecutable: '/tools/ktlint',
    cwd: '/application',
    filePath: '/application/src/test/kotlin/Example.kt',
    fileContents: 'class Example\n',
};

describe('ktlint worker', () => {
    beforeEach(() => vi.resetAllMocks());

    it('uses the file path for EditorConfig and preserves the final newline', async () => {
        execa.mockResolvedValue({ stdout: options.fileContents });
        await expect(ktlintWorker(options)).resolves.toEqual({ result: options.fileContents });
        expect(execa).toHaveBeenCalledWith(
            options.ktlintExecutable,
            ['--log-level=none', '--format', '--stdin', `--stdin-path=${options.filePath}`],
            expect.objectContaining({ input: options.fileContents, cwd: options.cwd, stripFinalNewline: false, shell: false }),
        );
    });

    it('preserves empty successful output', async () => {
        execa.mockResolvedValue({ stdout: '' });
        await expect(ktlintWorker(options)).resolves.toEqual({ result: '' });
    });

    it('fails on uncorrectable violations even when formatted output exists', async () => {
        execa.mockRejectedValue({ stdout: 'partial output', stderr: 'Uncorrectable violation', exitCode: 1 });
        await expect(ktlintWorker(options)).resolves.toEqual({ error: 'Uncorrectable violation' });
    });

    it('retries changed source but still requires a successful exit', async () => {
        execa.mockRejectedValueOnce({ stdout: 'wrapped source\n', stderr: 'Line length', exitCode: 1 });
        execa.mockResolvedValueOnce({ stdout: 'formatted source\n' });
        await expect(ktlintWorker(options)).resolves.toEqual({ result: 'formatted source\n' });
        expect(execa.mock.calls[1][2].input).toBe('wrapped source\n');
    });

    it('does not retry empty failure output as an empty source file', async () => {
        execa.mockRejectedValue({ stdout: '', stderr: 'Parse error', exitCode: 1 });
        await expect(ktlintWorker(options)).resolves.toEqual({ error: 'Parse error' });
        expect(execa).toHaveBeenCalledTimes(1);
    });

    it('reports process startup failures', async () => {
        execa.mockRejectedValue(new Error('spawn ENOENT'));
        await expect(ktlintWorker(options)).resolves.toEqual({ error: 'spawn ENOENT' });
    });
});
