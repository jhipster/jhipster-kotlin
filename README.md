<div align="center">
    <img width="320" height="160" src="logo-khipster.png" alt="KHipster — Kotlin + JHipster">
</div>

# KHipster

Build JHipster applications with a Kotlin backend. KHipster is a [JHipster blueprint](https://www.jhipster.tech/modules/extending-and-customizing/): it adds Kotlin templates and tooling to JHipster's application and entity generators.

[![npm version](https://img.shields.io/npm/v/generator-jhipster-kotlin.svg)](https://www.npmjs.com/package/generator-jhipster-kotlin)
[![Generator](https://github.com/jhipster/jhipster-kotlin/actions/workflows/generator.yml/badge.svg)](https://github.com/jhipster/jhipster-kotlin/actions/workflows/generator.yml)
[![Angular](https://github.com/jhipster/jhipster-kotlin/actions/workflows/angular.yml/badge.svg)](https://github.com/jhipster/jhipster-kotlin/actions/workflows/angular.yml)
[![React](https://github.com/jhipster/jhipster-kotlin/actions/workflows/react.yml/badge.svg)](https://github.com/jhipster/jhipster-kotlin/actions/workflows/react.yml)
[![Vue](https://github.com/jhipster/jhipster-kotlin/actions/workflows/vue.yml/badge.svg)](https://github.com/jhipster/jhipster-kotlin/actions/workflows/vue.yml)

## Quick start

Install the published generator, then run it in an empty directory:

```sh
npm install --global generator-jhipster-kotlin
mkdir my-app
cd my-app
khipster
```

Choose your application settings in the prompts. Follow the generated application's `README.md` to start its database, backend, and frontend.

**Working from this repository?** The `main` branch currently targets **JHipster 9.4.0** and requires **Node.js `^22.18.0 || >=24.11.0`**. CI uses Node.js 24. Generated applications also need a JDK; the current default is Java 21. Published npm releases can target older JHipster versions. See [getting started](docs/getting-started.md) for prerequisites and [contributing](CONTRIBUTING.md) to run this checkout.

## What you can generate

- Kotlin Spring Boot backends, including application and entity code.
- Monoliths, gateways, and microservices using JHipster's configuration options.
- Angular, React, or Vue clients, or applications without a client.
- Maven or Gradle projects, with Kotlin formatting and static analysis support.

Available combinations depend on the bundled JHipster version. Use `khipster --help` and the command-specific help to inspect supported options.

## Documentation

| I want to…                                             | Start here                                 |
| ------------------------------------------------------ | ------------------------------------------ |
| Install KHipster and run my first application          | [Getting started](docs/getting-started.md) |
| Add entities, import JDL, or regenerate an application | [Generation guide](docs/generation.md)     |
| Run the generator in a container                       | [Docker guide](docs/docker.md)             |
| Fix a setup or generation problem                      | [Troubleshooting](docs/troubleshooting.md) |
| Work on the generator or its templates                 | [Contributing](CONTRIBUTING.md)            |
| Understand which CI jobs run for a change              | [CI guide](docs/ci.md)                     |
| Read historical release notes                          | [Changelog](CHANGELOG.md)                  |

For concepts shared with upstream, see the [JHipster documentation](https://www.jhipster.tech/), [JDL guide](https://www.jhipster.tech/jdl/), and [application creation guide](https://www.jhipster.tech/creating-an-app/).

## Community

Report reproducible bugs in [GitHub Issues](https://github.com/jhipster/jhipster-kotlin/issues). Include the generator version, `khipster info` output, and the smallest configuration or JDL that reproduces the problem. Remove credentials before sharing files.

Contributions are welcome. Read the [contributor guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md). KHipster is licensed under [Apache License 2.0](LICENSE).
