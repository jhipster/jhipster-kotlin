import { execa } from 'execa';

export default async ({ ktlintExecutable, fileContents, cwd }) => {
    try {
        const { stdout } = await execa(ktlintExecutable, ['--log-level=none', '--format', '--stdin'], {
            input: fileContents,
            stdio: 'pipe',
            shell: false,
            stripFinalNewline: false,
            cwd,
        });
        return { result: stdout };
    } catch (error) {
        if (!error.stdout || !error.stderr) {
            return { error: `${error}` };
        }
        return { result: error.stdout, info: error.stderr };
    }
};
