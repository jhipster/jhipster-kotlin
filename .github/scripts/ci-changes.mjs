import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Keep this allowlist narrow: generator templates and executable documentation
// examples can affect generated applications even if their names include "docs".
export const isDocumentation = path =>
    /^[^/]+\.md$/.test(path) ||
    /^docs\/.+\.(?:md|png|jpe?g|gif|svg|webp)$/.test(path) ||
    /^\.github\/(?:ISSUE_TEMPLATE|PULL_REQUEST_TEMPLATE)(?:\/[^/]+)?\.md$/.test(path);

export function documentationOnly(eventName, event, cwd = process.cwd()) {
    let base;
    let head;
    if (eventName === 'pull_request') {
        base = event.pull_request?.base?.sha;
        head = event.pull_request?.head?.sha;
    } else if (eventName === 'push' && event.ref?.startsWith('refs/heads/')) {
        base = event.before;
        head = event.after;
    } else {
        return false;
    }
    // New branches, deleted branches and missing history must run full CI.
    if (![base, head].every(sha => /^[a-f0-9]{40}$/.test(sha ?? '') && !/^0+$/.test(sha))) return false;

    try {
        const range = eventName === 'pull_request' ? `${base}...${head}` : `${base}..${head}`;
        // --no-renames includes both paths of a move; NUL delimiters handle spaces/newlines.
        const files = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', range, '--'], {
            cwd,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024,
            stdio: ['ignore', 'pipe', 'pipe'],
        })
            .split('\0')
            .filter(Boolean);
        return files.length > 0 && files.every(isDocumentation);
    } catch {
        console.warn('Unable to compare changes; running full CI.');
        return false;
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let docsOnly = false;
    try {
        docsOnly = documentationOnly(process.env.GITHUB_EVENT_NAME, JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')));
    } catch {
        console.warn('Unable to read the event; running full CI.');
    }
    console.log(docsOnly ? 'Documentation-only changes: skipping application builds and code scanning.' : 'Running full CI.');
    appendFileSync(process.env.GITHUB_OUTPUT, `docs-only=${docsOnly}\n`);
}
