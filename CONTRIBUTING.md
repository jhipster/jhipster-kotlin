# Contributing to KHipster

Thanks for helping improve KHipster. Bug fixes, tests, examples, and documentation are all useful contributions. Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Set up a checkout

Use Node.js 24, as CI does. The supported Node.js range and bundled JHipster version are declared in [package.json](package.json). Building generated applications also requires a suitable JDK and any services selected during generation.

```sh
git clone https://github.com/jhipster/jhipster-kotlin.git
cd jhipster-kotlin
npm ci
```

Use npm and commit `package-lock.json` when changing dependencies. `npm ci` installs the locked versions and sets up the Git hooks.

To make this checkout available as `khipster`:

```sh
npm link
```

Alternatively, invoke the CLI by its absolute path without changing your global installation:

```sh
mkdir ../khipster-playground
cd ../khipster-playground
node ../jhipster-kotlin/cli/cli.cjs --defaults --skip-install
```

Always generate applications outside the generator repository. The generator writes files into the current directory.

## Find the right place to change

| Path                                       | Purpose                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| `cli/`                                     | CLI entry point and customizations                                               |
| `generators/spring-boot/`                  | Spring Boot blueprint hooks and Kotlin EJS templates                             |
| `generators/kotlin/`                       | Kotlin language and build configuration                                          |
| `generators/ktlint/`, `generators/detekt/` | Kotlin formatting and static analysis integration                                |
| `generators/migration/`                    | Migration support                                                                |
| `generators/**/*.spec.js`, `test/`         | Generator tests and snapshots                                                    |
| `.blueprint/`                              | Repository development commands, sample definitions, and synchronization tooling |
| `.github/workflows/`                       | GitHub Actions workflows                                                         |
| `docs/`                                    | User and contributor documentation                                               |

The blueprint overlays upstream generators. Check the matching template in `node_modules/generator-jhipster/dist/generators/` when changing EJS logic. Keep upstream control flow recognizable where possible; emitted source must use Kotlin syntax.

## Validate a change

Run from the repository root:

```sh
npm test
npm run ejslint
```

`npm test` runs Prettier, ESLint, and the Vitest suite. `npm run ejslint` separately checks EJS syntax.

Useful commands during development:

```sh
# Run a focused test file, without the npm pretest checks.
npx vitest run generators/spring-boot/generator.spec.js

# Format repository files.
npm run prettier-format

# Update a focused snapshot after reviewing the intended output change.
npx vitest run generators/spring-boot/generator.spec.js --update

# Check documentation without loading the package.json formatting plugin.
npx prettier --check --config .prettierrc-docs.yml "**/*.md"
```

Add regression coverage for bugs. Review snapshot changes before committing: a passing snapshot update does not establish that generated code is correct. For template changes, also generate a relevant application and run its backend tests. GitHub Actions tests a wider set of generated applications.

## Generate an application or CI sample

After `npm link`, run these commands in an empty directory outside the repository:

```sh
# Default Maven application.
khipster --defaults --skip-install

# Or, in a separate directory, a Gradle application.
khipster --defaults --build gradle --skip-install
```

For CI samples, use the repository's development CLI. From the repository root, inspect the available sample names:

```sh
node cli/cli.cjs generate-sample --help
```

The workflow definitions in [.blueprint/generate-sample/templates/\_workflow-samples](.blueprint/generate-sample/templates/_workflow-samples) are the source of truth for sample names and configurations. To generate one, replace `SAMPLE_NAME` with a name from those files:

```sh
# Run from an empty sibling directory, such as ../khipster-playground.
node ../jhipster-kotlin/cli/cli.cjs generate-sample SAMPLE_NAME --skip-install --skip-ktlint-format
```

`--skip-ktlint-format` speeds up generation when inspecting output. It skips formatting only; still run the generated project's checks before submitting a Kotlin template change.

## Synchronize upstream templates

From the repository root:

```sh
node cli/cli.cjs synchronize
```

Review each conflict against the Kotlin template. Press `i` to mark an already synchronized template as ignored, or edit the file and press `r` to retry the comparison. Synchronization can update `.yo-resolve`; review those changes and discard temporary ignore entries before committing.

## Submit a pull request

1. Create a branch from the current `main`.
2. Keep the change focused and explain the problem it solves.
3. Include relevant validation results and issue references in the PR description.
4. Review generated output, snapshots, and dependency changes.
5. Request a review before merging. Maintainers can add suitable labels.

Documentation-only changes use a lighter CI path automatically. Changes to templates, code, dependencies, or CI still get full validation; see [CI behavior](docs/ci.md). Do not add skip-CI markers to documentation commits.

For project-wide contributor expectations, see the [JHipster policies](https://www.jhipster.tech/policies/). Maintainers work on the project in their spare time; clear reproduction steps and focused PRs make reviews easier.
