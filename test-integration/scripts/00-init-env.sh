#!/bin/bash

JHI_DETECTED_DIR="$( cd "$( dirname $( dirname $( dirname "${BASH_SOURCE[0]}" ) ) )" >/dev/null 2>&1 && pwd )"

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
JHI_REPO=$(init_var "$BUILD_REPOSITORY_URI" "$GITHUB_WORKSPACE" )
JHI_CLONED=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$GITHUB_WORKSPACE")
# folder where the repo is cloned
if [[ "$JHI_HOME" == "" ]]; then
    JHI_HOME=$(init_var "$BUILD_REPOSITORY_LOCALPATH" "$GITHUB_WORKSPACE" "$JHI_DETECTED_DIR")
fi

# folder where the generator-jhipster is cloned
JHI_HOME="$HOME"/generator-jhipster

# folder for test-integration
JHI_INTEG="$JHI_HOME"/test-integration

# folder for samples
JHI_SAMPLES="$JHI_INTEG"/samples

# folder for scripts
JHI_SCRIPTS="$JHI_INTEG"/scripts

# folder for app
JHI_FOLDER_APP="$HOME"/app

# folder for uaa app
JHI_FOLDER_UAA="$HOME"/uaa

# set correct OpenJDK version
if [[ "$JHI_JDK" == "11" && "$JHI_GITHUB_CI" != "true" ]]; then
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi
