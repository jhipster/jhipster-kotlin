import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { parse } from '@iarna/toml';
import { execa } from 'execa';

const root = fileURLToPath(new URL('../', import.meta.url));
const { values } = parseArgs({
    options: {
        sample: { type: 'string', default: 'ng-default' },
        output: { type: 'string' },
        stage: { type: 'string', default: 'all' },
    },
});
const stages = ['generate', 'check', 'detekt', 'build'];
if (values.stage !== 'all' && !stages.includes(values.stage)) throw new Error(`Unknown stage: ${values.stage}`);
const output = resolve(values.output ?? join(root, '.kotlin-lint', values.sample));
if (output === root) throw new Error('Generate into a separate directory, never the repository root');
await mkdir(output, { recursive: true });
const logs = join(output, 'lint-logs');
await mkdir(logs, { recursive: true });

async function run(stage, command, args) {
    console.log(`[${values.sample}] ${stage}: ${command} ${args.join(' ')}`);
    const subprocess = execa(command, args, { cwd: output, reject: false, all: true });
    // Persist output while the process runs so interruptions retain diagnostic logs.
    const [result] = await Promise.all([subprocess, pipeline(subprocess.all, createWriteStream(join(logs, `${stage}.log`)))]);
    if (result.failed) {
        console.error(result.all);
        throw new Error(`${stage} failed. Logs and generated files remain in ${output}; rerun with --stage ${stage}.`);
    }
}

async function downloadTool(generator, library, urlForVersion) {
    const catalog = parse(await readFile(join(root, `generators/${generator}/resources/gradle/libs.versions.toml`), 'utf8'));
    const { version } = catalog.libraries[library];
    const tools = join(root, '.kotlin-lint', 'tools');
    await mkdir(tools, { recursive: true });
    const destination = join(tools, `${library}-${version}.jar`);
    if (!existsSync(destination)) {
        const response = await fetch(urlForVersion(version));
        if (!response.ok) throw new Error(`Tool download failed: ${response.status} ${response.statusText}`);
        const temporary = `${destination}.${process.pid}.tmp`;
        await writeFile(temporary, Buffer.from(await response.arrayBuffer()));
        await rename(temporary, destination);
    }
    return destination;
}

for (const stage of values.stage === 'all' ? stages : [values.stage]) {
    if (stage !== 'generate') {
        const sources = await readdir(join(output, 'src/main/kotlin'), { recursive: true });
        if (!sources.some(file => file.endsWith('.kt'))) throw new Error(`No generated Kotlin sources in ${output}`);
    }
    if (stage === 'generate') {
        await run(stage, process.execPath, [
            join(root, 'cli/cli.cjs'),
            'generate-sample',
            values.sample,
            '--skip-jhipster-dependencies',
            '--skip-install',
            '--skip-client',
            '--skip-git',
            '--force',
        ]);
    } else if (stage === 'check') {
        const ktlint = await downloadTool(
            'ktlint',
            'ktlint-cli',
            version => `https://github.com/ktlint/ktlint/releases/download/${version}/ktlint`,
        );
        await run(stage, 'java', ['-jar', ktlint, 'src/**/*.kt', 'src/**/*.kts']);
    } else if (stage === 'detekt') {
        const detekt = await downloadTool(
            'detekt',
            'detekt-cli',
            version => `https://github.com/detekt/detekt/releases/download/v${version}/detekt-cli-${version}-all.jar`,
        );
        await run(stage, 'java', [
            '-jar',
            detekt,
            '--input',
            'src/main/kotlin',
            '--config',
            'detekt-config.yml',
            '--report',
            'xml:lint-logs/detekt.xml',
        ]);
    } else {
        const gradle = existsSync(join(output, 'gradlew'));
        await run(
            stage,
            'bash',
            gradle ? ['./gradlew', '--no-daemon', 'ktlintCheck', 'detekt'] : ['./mvnw', '-B', 'ktlint:check', 'antrun:run@detekt'],
        );
    }
}
console.log(`Kotlin lint ${values.stage} completed: ${output}`);
