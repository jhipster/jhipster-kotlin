# Generating and updating applications

[Documentation home](../README.md#documentation)

Run application commands in the generated application's directory. Commit your existing work before regenerating files so you can review and resolve changes.

## Discover available commands

```sh
khipster --help
khipster app --help
khipster entity --help
khipster import-jdl --help
```

Commands and options depend on the bundled JHipster version. Older tutorials may mention commands such as `spring-controller` and `spring-service`; they are not listed by this checkout's CLI.

## Add an entity

```sh
khipster entity Book
```

Follow the prompts to define fields and relationships. Entity definitions are stored in `.jhipster/`; application settings are stored in `.yo-rc.json`. Keep both under version control.

To regenerate configured entities:

```sh
khipster entities
```

## Import a JDL model

Save this as `model.jdl` in an existing application's directory:

```jdl
entity Book {
    title String required
    publishedOn LocalDate
}
```

Then import it:

```sh
khipster import-jdl model.jdl
```

JDL can also define applications, relationships, validation, DTOs, and services. See the [upstream JDL documentation](https://www.jhipster.tech/jdl/) for the complete language.

For generation without dependency installation or Git initialization:

```sh
khipster import-jdl model.jdl --skip-install --skip-git
```

Current JHipster imports generate entities automatically. Do not use the old `--with-entities` option. Use `--force` only when you intend to overwrite conflicting generated files.

Export the current model with:

```sh
khipster export-jdl
```

## Select Maven or Gradle

Select the build tool in the application prompts, or pass it explicitly when generating a new application:

```sh
khipster --defaults --build gradle
```

Use a separate empty directory for each sample. Changing build tools in an existing application can leave obsolete files behind; inspect the resulting diff carefully.

## Kotlin formatting and analysis

KHipster integrates ktlint and detekt into generated build configuration. Inspect the generated project's README and build files for the available tasks.

To skip Kotlin formatting while experimenting with generator templates:

```sh
khipster --defaults --skip-install --skip-ktlint-format
```

This speeds up generation but does not validate Kotlin syntax or compilation. Run formatting, static analysis, and backend tests in the generated application before relying on a template change.

## Upgrade an existing application

Keep `.yo-rc.json`, `.jhipster/`, and custom code committed before upgrading. Review the [JHipster upgrade guide](https://www.jhipster.tech/upgrading-an-application/) and the release notes for both JHipster and this blueprint. Blueprint compatibility and template changes must be assessed together; installing a newer global CLI alone does not migrate an existing application.
