#!/bin/bash

KHI_DETECTED_DIR="$( cd "$( dirname $( dirname $( dirname "${BASH_SOURCE[0]}" ) ) )" >/dev/null 2>&1 && pwd )"

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

# KHipster locations 

# uri of repo
JHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$GITHUB_WORKSPACE" )

# folder where the repo is cloned
if [[ "$JHI_HOME" == "" ]]; then
    JHI_HOME=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$GITHUB_WORKSPACE" "$JHI_DETECTED_DIR")
fi

# folder for test-integration
if [[ "$KHI_INTEG" == "" ]]; then
    KHI_INTEG="$JHI_HOME"/test-integration
fi

# folder for samples
if [[ "$KHI_SAMPLES" == "" ]]; then
    KHI_SAMPLES="$KHI_INTEG"/samples-kotlin
fi

# folder for scripts
if [[ "$KHI_SCRIPTS" == "" ]]; then
    KHI_SCRIPTS="$KHI_INTEG"/scripts
fi

# folder for app
if [[ "$JHI_FOLDER_APP" == "" ]]; then
    JHI_FOLDER_APP="$HOME"/app
fi

# set correct OpenJDK version
if [[ "$JHI_JDK" == "11" && "$JHI_GITHUB_CI" != "true" ]]; then
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# JHipster cloned
# folder where the generator-jhipster is cloned
JHI_CLONED_HOME="$HOME"/generator-jhipster

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
