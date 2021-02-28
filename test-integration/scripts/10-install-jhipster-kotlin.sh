#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Install JHipster Dependencies and Server-side library
#-------------------------------------------------------------------------------
echo "Always use the ***Release*** version for the JHipster"
#-------------------------------------------------------------------------------
# Install JHipster Generator
#-------------------------------------------------------------------------------
cd "$HOME"
echo "*** generator-jhipster: JHI_GEN_REPO=$JHI_GEN_REPO with JHI_GEN_BRANCH=$JHI_GEN_BRANCH"
git clone "$JHI_GEN_REPO" generator-jhipster
cd generator-jhipster
echo "*** Checkout branch $JHI_GEN_BRANCH"
git checkout "$JHI_GEN_BRANCH"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit


ls "$HOME"/generator-jhipster/test-integration/scripts/

#-------------------------------------------------------------------------------
# Override config
#-------------------------------------------------------------------------------

# replace 00-init-env.sh
cp "$KHI_SCRIPTS"/00-init-env.sh "$JHI_SCRIPTS"/

# copy all samples
cp -R "$KHI_SAMPLES"/* "$JHI_SAMPLES"/

#-------------------------------------------------------------------------------
# Install JHipster Kotlin
#-------------------------------------------------------------------------------
cd "$JHI_HOME"/

npm ci
npm link

if [[ "$JHI_APP" == "" ]]; then
    npm test
fi
