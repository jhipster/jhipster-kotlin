# Running the generator with Docker

[Documentation home](../README.md#documentation)

The repository's [Dockerfile](../docker/Dockerfile) builds an interactive generator image. It installs **the published npm package**, not the source in your checkout. Use the [contributor setup](../CONTRIBUTING.md#set-up-a-checkout) to test local changes.

The image supplies Node.js and the generator. It does not supply the JDK, database, or other services needed to build and run the generated application.

## Build the image

From the repository root:

```sh
docker build -t khipster-generator -f docker/Dockerfile .
```

The current Dockerfile downloads a Linux x64 Node.js distribution. On ARM machines, building and running it requires an amd64 Docker environment or emulation; pass `--platform linux/amd64` to both commands where needed.

## Generate into a host directory

The following commands use a POSIX shell:

```sh
mkdir -p my-app
cd my-app
docker run --interactive --tty --rm \
    --volume "$PWD:/home/khipster/app" \
    khipster-generator
```

Generated files remain in `my-app` after the container exits. The image runs as the `khipster` user; the mounted directory must be writable by that user. On Linux, check directory ownership and your Docker user mapping if generation reports a permission error.

To pass generator options, specify the command after the image name:

```sh
docker run --interactive --tty --rm \
    --volume "$PWD:/home/khipster/app" \
    khipster-generator khipster --defaults --skip-install
```

For a shell inside the image:

```sh
docker run --interactive --tty --rm \
    --volume "$PWD:/home/khipster/app" \
    khipster-generator /bin/bash
```

After generation, follow the generated application's README to install its dependencies and run it on your host or in your chosen development environment. Rebuild the image when you want to pick up a new published generator release; Docker may reuse a cached installation layer otherwise.
