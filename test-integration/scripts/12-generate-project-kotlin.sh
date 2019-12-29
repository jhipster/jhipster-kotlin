#!/bin/bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$JHI_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHI_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/*.jdl "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    npm link generator-jhipster-kotlin
    jhipster import-jdl *.jdl --no-insight --blueprint kotlin

else
    #-------------------------------------------------------------------------------
    # Generate UAA project with jhipster
    #-------------------------------------------------------------------------------
    if [[ "$JHI_APP" == *"uaa"* ]]; then
        mkdir -p "$JHI_FOLDER_UAA"
        cp -f "$JHI_SAMPLES"/uaa/.yo-rc.json "$JHI_FOLDER_UAA"/
        cd "$JHI_FOLDER_UAA"
        jhipster --force --no-insight --with-entities --skip-checks --from-cli
        ls -al "$JHI_FOLDER_UAA"
    fi

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    cd "$JHI_FOLDER_APP"
    npm link generator-jhipster-kotlin
    khipster --force --no-insight --skip-checks --with-entities --from-cli

fi

cd "$JHI_FOLDER_APP"

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
