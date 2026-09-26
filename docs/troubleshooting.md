# Troubleshooting

[Documentation home](../README.md#documentation)

## `khipster` is not found

Check that the package is installed globally and that npm's global executable directory is on your `PATH`:

```sh
npm list --global --depth=0
npm prefix --global
```

If you are developing this repository, run `npm link` from its root, or invoke `node /absolute/path/to/jhipster-kotlin/cli/cli.cjs` from the directory where you want the application generated.

## Node.js or Java version errors

Compare `node --version` against the installed generator's `engines` requirement. This checkout's supported versions are in [package.json](../package.json). CI uses Node.js 24.

For Java errors, compare `java -version` and `JAVA_HOME` with the generated build's target version. The generator's JavaScript tests and the generated application's JVM build have different prerequisites.

## An option from an old example is rejected

Run the command with `--help`. CLI flags change between JHipster versions. In this checkout, entity generation is automatic during JDL import, so the historical `--with-entities` flag is no longer accepted.

## EJS compilation or template errors

Capture the complete error and the smallest JDL or entity definition that reproduces it. An EJS error is a generator-template failure, not necessarily an error in your Kotlin code.

When working on the generator, run:

```sh
npm run ejslint
npm test
```

Then generate an application using the failing configuration. Some template branches only run for specific databases, authentication modes, or primary-key types.

## Generation is slow during Kotlin formatting

Use `--skip-ktlint-format` when inspecting generated output. This skips generation-time formatting; format and test the generated application before committing a template change.

## The generated backend cannot connect to a service

Check the generated README and files under `src/main/docker/` and `src/main/resources/config/`. Start the selected database, OAuth2 provider, message broker, or service discovery system and verify ports and credentials. The generator does not start these services for you.

## A snapshot test fails

Inspect the diff before updating snapshots. A changed file can reflect an intentional improvement, an upstream template change, or an accidental regression. Update only the relevant snapshots and build a representative application when changing generated Kotlin.

## Report a bug

[Open an issue](https://github.com/jhipster/jhipster-kotlin/issues/new) with:

- The KHipster version and whether it came from npm or a source checkout.
- `khipster info` output from the affected application.
- The command you ran and its complete error output.
- A minimal JDL, or relevant `.yo-rc.json` and `.jhipster/` files.
- Expected behavior, actual behavior, and reproduction steps.

Remove passwords, tokens, signing keys, and private application data from shared output. If the same configuration fails with unmodified JHipster, mention that too; it helps locate the problem.
