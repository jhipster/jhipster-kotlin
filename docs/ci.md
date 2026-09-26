# Continuous integration

[Documentation home](../README.md#documentation)

CI classifies the complete pull-request or push diff before installing generator dependencies or building applications. You do not need special PR titles or commit messages for documentation work.

## Which checks run?

| Change or event                                                   | Validation                                                                   |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Documentation only                                                | Documentation formatting; lightweight change detection and completion checks |
| Code, templates, tests, dependencies, configuration, or workflows | Normal generator tests, application matrices, and CodeQL                     |
| Documentation mixed with any other change                         | Normal full CI                                                               |
| Manual application-workflow run                                   | Normal application matrix                                                    |
| Scheduled CodeQL run                                              | Normal code scan                                                             |
| New branch push, missing history, or uncertain comparison         | Normal full CI                                                               |

For documentation-only changes, `npm-test` checks Markdown with Prettier without installing the generator's dependencies. Angular, React, and Vue workflows skip their dependency installation and application matrices. CodeQL skips analysis for that change. Scheduled maintenance workflows are unaffected.

Existing `npm-test`, `check-angular`, `check-react`, `check-vue`, and `CodeQL-Build` jobs still complete. We deliberately avoid workflow-level `paths-ignore`: GitHub can leave required checks pending when an entire workflow is filtered out. See [GitHub's required-check guidance](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

## What counts as documentation?

The allowlist in [.github/scripts/ci-changes.mjs](../.github/scripts/ci-changes.mjs) includes:

- Markdown files at the repository root, such as `README.md` and `CONTRIBUTING.md`.
- Markdown and common image formats (`png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`) under `docs/`.
- Markdown issue and pull-request templates under `.github/`.

Markdown or EJS files under `generators/`, `test/`, or `.blueprint/` are not documentation-only changes: they can affect generated applications or test fixtures. Executable files under `docs/`, dependency files, formatting configuration, and workflow changes also run full CI. Moving a code file into `docs/` runs full CI because both the deleted and added paths are checked.

The shared [change-detection action](../.github/actions/changes/action.yml) uses Git history rather than a limited page of changed files. PRs compare their head against the merge base with the target branch, so an earlier code commit in the same PR cannot be hidden by a later documentation commit. Pushes compare the event's before and after commits. Failed or unavailable comparisons fall back to full CI.

## Validate locally

For documentation formatting:

```sh
npx prettier --check --config .prettierrc-docs.yml "**/*.md"
```

The equivalent lightweight command used by CI, without `npm ci`, is:

```sh
npm exec --yes --package=prettier@3.4.2 -- prettier --check --config .prettierrc-docs.yml "**/*.md"
```

For the detector's regression tests:

```sh
npx vitest run test/ci-changes.spec.js
```

For code and template changes, follow the [contributor validation steps](../CONTRIBUTING.md#validate-a-change).
