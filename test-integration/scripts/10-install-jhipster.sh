#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
cd "$HOME"
echo "*** generator-jhipster: JHI_GEN_REPO=$JHI_GEN_REPO with JHI_GEN_BRANCH=$JHI_GEN_BRANCH"
git clone "$JHI_GEN_REPO" generator-jhipster
cd generator-jhipster
echo "*** Checkout branch $JHI_GEN_BRANCH"
git checkout "$JHI_GEN_BRANCH"

#-------------------------------------------------------------------------------
# Override config
#-------------------------------------------------------------------------------

# replace 00-init-env.sh
cp "$KHI_SCRIPTS"/00-init-env.sh "$JHI_SCRIPTS"/

# copy all samples
# TODO Clean up if it is not throwing any errors
# cp -R "$KHI_SAMPLES"/* "$JHI_SAMPLES"/

#-------------------------------------------------------------------------------
# Install JHipster Kotlin
#-------------------------------------------------------------------------------
cd "$KHI_HOME"/

npm ci
npm i -g .
# TODO check why this is needed.
#npm link
#
#if [[ "$JHI_APP" == "" ]]; then
#    npm test
#fi
