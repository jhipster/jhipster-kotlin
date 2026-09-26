# Getting started

[Documentation home](../README.md#documentation)

## Choose a generator version

The npm package and the repository's `main` branch can be at different stages of development. Install the published package for a released version. To try the current source, follow [the contributor setup](../CONTRIBUTING.md#set-up-a-checkout).

For this checkout, [package.json](../package.json) declares JHipster 9.4.0 and Node.js `^22.18.0 || >=24.11.0`. CI uses Node.js 24. When using an older release, use its own prerequisites rather than assuming the requirements on `main` apply.

## Prerequisites

- **Node.js and npm** to install and run the generator.
- **A JDK** to build the generated backend. The current default generated project targets Java 21; check the generated `pom.xml` or `build.gradle` for the actual target, especially for alternate configurations or older releases.
- **Git** if you want the generator to initialize a repository.
- **Docker with Compose**, or locally installed services, when your application needs a database, identity provider, or message broker.

The generated project includes a Maven or Gradle wrapper, so you normally do not need a separate global Maven or Gradle installation. Installing the generator does not install your application's database or JDK.

Check your environment:

```sh
node --version
npm --version
java -version
git --version
```

## Install and generate

```sh
npm install --global generator-jhipster-kotlin
mkdir my-app
cd my-app
khipster
```

The prompts select the application type, authentication, database, frontend, and build tool. Start in an empty directory: generated files are written to the current directory.

For a noninteractive application using the generator's defaults:

```sh
khipster --defaults
```

To generate files without installing the application's npm dependencies:

```sh
khipster --defaults --skip-install
```

The skip-install option does not build or start the application. Install the generated application's dependencies before running scripts that need them.

## Run the generated application

Read the **generated** `README.md` first. It describes the services and commands for your selected configuration.

For the backend, use the selected build tool:

```sh
# Maven
./mvnw

# Gradle
./gradlew
```

On Windows, use `mvnw.cmd` or `gradlew.bat`. If you generated a frontend, its development server typically runs in a second terminal:

```sh
npm start
```

Start any required database or authentication services using the instructions and Compose files in the generated application. A backend failing to connect to PostgreSQL or an OAuth2 provider usually means that service is not running or its configuration does not match.

Continue with [entities and JDL](generation.md), [Docker generation](docker.md), or [troubleshooting](troubleshooting.md).
