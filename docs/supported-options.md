# Supported options

[Documentation home](../README.md#documentation)

KHipster follows the bundled JHipster version. This page documents the support
boundaries for this checkout; published npm releases can target older JHipster
versions.

## Compatibility matrix

| `generator-jhipster-kotlin` | JHipster | Node.js                   | Generated Java target |
| --------------------------- | -------- | ------------------------- | --------------------- |
| `main` / `1.16.0`           | 9.4.0    | `^22.18.0 \|\| >=24.11.0` | Java 21 by default    |

CI runs the generator on Node.js 24. Generated applications need a JDK and any
services selected during generation, such as a database, an identity provider, a
cache, or a message broker.

## Application shapes

KHipster supports Kotlin Spring Boot backends for the main JHipster application
types:

- Monoliths.
- Gateways.
- Microservices.
- Reactive Spring WebFlux applications.
- Backend-only applications without a generated client.

The exact prompt choices and command flags come from the bundled JHipster
version. Use `khipster --help`, `khipster app --help`, `khipster entity --help`,
and `khipster import-jdl --help` for the current command surface.

## Clients and build tools

Supported client choices are:

- Angular.
- React.
- Vue.
- No client.

Supported build tools are:

- Maven.
- Gradle.

Generated projects include Kotlin formatting and static-analysis integration.
Use `npm run ktlint:check`, `npm run ktlint:format`, and `npm run detekt` in the
generated application when those scripts are present.

## Persistence and services

KHipster has Kotlin templates and CI coverage for representative combinations of:

- SQL databases, including PostgreSQL, MariaDB, and JHipster's default SQL paths.
- MongoDB.
- Cassandra.
- Couchbase.
- Neo4j.
- Elasticsearch search integration.
- Redis or Infinispan cache/session combinations where selected by the sample.
- Kafka where selected by the sample.

Coverage is representative, not exhaustive. A combination can still depend on
upstream JHipster support, selected authentication, reactive versus imperative
mode, and the selected build tool.

## Authentication

KHipster supports the authentication options exercised by the bundled JHipster
version, including:

- JWT.
- OAuth2.
- Session-based authentication.

Some upstream options need Kotlin-specific handling. For example,
`syncUserWithIdp` is only enabled for supported OAuth2 database combinations in
this blueprint.

## Kotlin-specific behavior

KHipster overlays upstream JHipster templates with Kotlin templates:

- Implemented Java templates are replaced with Kotlin files.
- `package-info.java` files are not generated.
- Unhandled Java templates are intentionally skipped instead of generating Java
  source into a Kotlin backend.
- ktlint and detekt configuration is added to generated applications.
- Generated Kotlin is formatted during normal generation unless
  `--skip-ktlint-format` is used.

When changing templates, compare the matching upstream JHipster template and keep
the control flow recognizable where possible.

## Known limits

- KHipster does not guarantee every possible JHipster option combination.
- CLI options can change when the bundled JHipster version changes.
- Published npm releases may support different Node.js, Java, and JHipster
  versions than `main`.
- Snapshot tests verify broad generated output, while CI samples validate a
  representative matrix of generated applications.
- If the same configuration fails with unmodified JHipster, mention that in bug
  reports; it helps separate blueprint issues from upstream behavior.

For setup details, see [getting started](getting-started.md). For generation
commands and JDL usage, see the [generation guide](generation.md).
