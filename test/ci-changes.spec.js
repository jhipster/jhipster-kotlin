import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { documentationOnly, isDocumentation } from '../.github/scripts/ci-changes.mjs';

describe('documentation path allowlist', () => {
    it.each([
        'README.md',
        'CONTRIBUTING.md',
        'CHANGELOG.md',
        'docs/getting-started.md',
        'docs/images/setup.png',
        '.github/ISSUE_TEMPLATE.md',
        '.github/ISSUE_TEMPLATE/bug.md',
        '.github/PULL_REQUEST_TEMPLATE.md',
    ])('recognizes %s', path => {
        expect(isDocumentation(path)).toBe(true);
    });

    it.each([
        'generators/example/README.md',
        'generators/example/README.md.ejs',
        'test/templates/README.md',
        '.blueprint/README.md',
        'package.json',
        '.github/workflows/generator.yml',
        '.github/scripts/ci-changes.mjs',
        '.prettierrc-docs.yml',
        'docs/example.js',
        'docs/package.json',
        'docs/example.jdl',
    ])('requires full CI for %s', path => {
        expect(isDocumentation(path)).toBe(false);
    });
});

describe('CI change detection with Git history', () => {
    let cwd;
    const commits = {};
    const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const commitFile = (path, contents) => {
        mkdirSync(dirname(join(cwd, path)), { recursive: true });
        writeFileSync(join(cwd, path), contents);
        git('add', '--all');
        git('commit', '-m', 'Test change');
        return git('rev-parse', 'HEAD');
    };
    const push = (before, after) => ({ ref: 'refs/heads/main', before, after });
    const pr = (base, head) => ({ pull_request: { base: { sha: base }, head: { sha: head } } });

    beforeAll(() => {
        cwd = mkdtempSync(join(tmpdir(), 'khipster-ci-changes-'));
        git('init', '--initial-branch=main');
        git('config', 'user.name', 'CI test');
        git('config', 'user.email', 'ci-test@example.invalid');
        git('config', 'commit.gpgsign', 'false');
        commits.base = commitFile('README.md', '# Hello\n');
        commits.docs = commitFile('docs/guide with spaces.md', '# Guide\n');
        commits.code = commitFile('generators/example.js', 'export default {};\n');
        commits.mixed = commitFile('README.md', '# Updated\n');
        git('mv', 'generators/example.js', 'docs/example.md');
        git('commit', '-m', 'Move code into docs');
        commits.rename = git('rev-parse', 'HEAD');
        git('rm', 'docs/guide with spaces.md');
        git('commit', '-m', 'Delete documentation');
        commits.deletion = git('rev-parse', 'HEAD');
        git('checkout', '-b', 'target', commits.base);
        commits.target = commitFile('target-only.js', 'export default true;\n');
    });

    afterAll(() => {
        if (cwd) rmSync(cwd, { recursive: true, force: true });
    });

    it('skips expensive work for documentation-only PRs and pushes', () => {
        expect(documentationOnly('pull_request', pr(commits.base, commits.docs), cwd)).toBe(true);
        expect(documentationOnly('push', push(commits.base, commits.docs), cwd)).toBe(true);
    });

    it('checks all commits in a mixed PR or push, even when the last commit only changes docs', () => {
        expect(documentationOnly('pull_request', pr(commits.base, commits.mixed), cwd)).toBe(false);
        expect(documentationOnly('push', push(commits.base, commits.mixed), cwd)).toBe(false);
        expect(documentationOnly('push', push(commits.code, commits.mixed), cwd)).toBe(true);
    });

    it('uses the merge base, excluding changes made only on the target branch', () => {
        expect(documentationOnly('pull_request', pr(commits.target, commits.docs), cwd)).toBe(true);
    });

    it('checks both sides of renames and handles documentation deletions', () => {
        expect(documentationOnly('push', push(commits.mixed, commits.rename), cwd)).toBe(false);
        expect(documentationOnly('push', push(commits.rename, commits.deletion), cwd)).toBe(true);
    });

    it('runs full CI for new branches, missing history, empty diffs, and invalid refs', () => {
        expect(documentationOnly('push', push('0'.repeat(40), commits.docs), cwd)).toBe(false);
        expect(documentationOnly('push', push('1'.repeat(40), commits.docs), cwd)).toBe(false);
        expect(documentationOnly('push', push(commits.docs, commits.docs), cwd)).toBe(false);
        expect(documentationOnly('pull_request', pr('--invalid', commits.docs), cwd)).toBe(false);
    });

    it.each(['workflow_dispatch', 'schedule', 'merge_group'])('runs full CI for %s', event => {
        expect(documentationOnly(event, {}, cwd)).toBe(false);
    });

    it('does not skip tag pushes', () => {
        expect(documentationOnly('push', { ...push(commits.base, commits.docs), ref: 'refs/tags/v1' }, cwd)).toBe(false);
    });
});
