#!/usr/bin/env bash

KHI_DETECTED_DIR="$( cd "$( dirname $( dirname $( dirname "${BASH_SOURCE[0]}" ) ) )" >/dev/null 2>&1 && pwd )"

# JHipster cloned
# folder where the generator-jhipster is cloned
JHI_CLONED_HOME="$JHI_HOME"

init_var() {
    result=""
    if [[ $1 != "" ]]; then
        result=$1
    elif [[ $2 != "" ]]; then
        result=$2
    elif [[ $3 != "" ]]; then
        result=$3
    fi
    echo $result
}

# uri of repo
if [[ "$KHI_REPO" == "" ]]; then
    KHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$GITHUB_WORKSPACE" )
fi

# folder for generator-jhipster-kotlin
if [[ "$KHI_HOME" == "" ]]; then
    KHI_HOME="$KHI_DETECTED_DIR"
fi

# folder for executable package (blueprints or generator-jhipster)
if [[ "$KHI_CLI_PACKAGE_PATH" == "" ]]; then
    if [[ "$KHI_CLI_PACKAGE" != "" && "$KHI_WORKSPACE" != "" ]]; then
        KHI_CLI_PACKAGE_PATH="$KHI_WORKSPACE/$KHI_CLI_PACKAGE"
    else
        KHI_CLI_PACKAGE_PATH="$KHI_HOME"
    fi
fi

# folder where the repo is cloned
if [[ "$KHI_REPO_PATH" == "" ]]; then
    KHI_REPO_PATH=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$GITHUB_WORKSPACE")
fi

if [[ "$KHI_LIB_HOME" == "" ]]; then
    if [[ "$KHI_REPO" == *"/jhipster-bom" ]]; then
        KHI_LIB_HOME="$KHI_REPO_PATH"
    else
        KHI_LIB_HOME="$HOME"/jhipster-bom
    fi
fi

# folder for test-integration
if [[ "$KHI_INTEG" == "" ]]; then
    KHI_INTEG="$KHI_HOME"/test-integration
fi

if [[ "$JHI_SAMPLES" == "" ]]; then
    JHI_SAMPLES="$JHI_INTEG"/samples
fi

if [[ -d "$JHI_SAMPLES"/.jhipster ]]; then
    JHI_ENTITY_SAMPLES="$JHI_SAMPLES"/.jhipster
else
    JHI_ENTITY_SAMPLES="$JHI_HOME"/test-integration/samples/.jhipster
fi

# folder for jdls samples
if [[ "$JHI_JDL_SAMPLES" == "" ]]; then
    JHI_JDL_SAMPLES="$JHI_INTEG"/jdl-samples
fi

# folder for scripts
if [[ "$KHI_SCRIPTS" == "" ]]; then
    KHI_SCRIPTS="$KHI_INTEG"/scripts
fi

# folder for app
if [[ "$KHI_FOLDER_APP" == "" ]]; then
    KHI_FOLDER_APP="$HOME"/app
fi

if [[ "$KHI_CLI" == "" ]]; then
    KHI_CLI=khipster
fi

# jdk version
if [[ "$JHI_JDK" == "" ]]; then
    JHI_JDK=$(grep -o "JAVA_VERSION = '[^']*'" $JHI_CLONED_HOME/generators/generator-constants.js | cut -f2 -d "'")
fi

# set correct OpenJDK version
if [[ "$JHI_JDK" == "11" && "$JHI_GITHUB_CI" != "true" ]]; then
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# node version
JHI_NODE_VERSION=$(grep -o "NODE_VERSION = '[^']*'" $JHI_CLONED_HOME/generators/generator-constants.js | cut -f2 -d "'")

# npm version
JHI_NPM_VERSION=$(grep -o '"npm": "[^"]*"' $JHI_CLONED_HOME/generators/common/templates/package.json | cut -f4 -d '"')


# folder for generator-jhipster test-integration
if [[ "$JHI_INTEG" == "" ]]; then
    JHI_INTEG="$JHI_CLONED_HOME"/test-integration
fi

# folder for generator-jhipster  samples
if [[ "$JHI_SAMPLES" == "" ]]; then
    JHI_SAMPLES="$JHI_INTEG"/samples
fi

# folder for generator-jhipster  scripts
if [[ "$JHI_SCRIPTS" == "" ]]; then
    JHI_SCRIPTS="$JHI_INTEG"/scripts
fi

# generator-jhipster version
JHI_VERSION=$(grep -o '"version": "[^"]*"' $JHI_HOME/package.json | cut -f4 -d '"')
