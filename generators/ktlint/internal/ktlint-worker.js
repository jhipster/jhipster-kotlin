import { execa } from 'execa';

export default async ({ ktlintExecutable, fileContents, filePath, cwd }) => {
    // Wrapping one expression can reveal another formatting change. Retry only
    // when ktlint produced changed source, and never accept a nonzero exit.
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const { stdout } = await execa(ktlintExecutable, ['--log-level=none', '--format', '--stdin', `--stdin-path=${filePath}`], {
                input: fileContents,
                stdio: 'pipe',
                shell: false,
                stripFinalNewline: false,
                cwd,
            });
            return { result: stdout };
        } catch (error) {
            if (
                error.exitCode === 1 &&
                typeof error.stdout === 'string' &&
                error.stdout.trim().length > 0 &&
                error.stdout !== fileContents &&
                attempt < 2
            ) {
                fileContents = error.stdout;
                continue;
            }
            return { error: error.stderr || error.message || String(error) };
        }
    }
};
