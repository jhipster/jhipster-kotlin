#!/bin/bash
set -e

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$APP_FOLDER" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHIPSTER_TRAVIS"/configstore/*.json "$HOME"/.config/configstore/
fi

#-------------------------------------------------------------------------------
# Generate the project with jhipster
#-------------------------------------------------------------------------------
if [[ "$JHIPSTER" == *"uaa"* ]]; then
    mkdir -p "$UAA_APP_FOLDER"
    cp -f "$JHIPSTER_SAMPLES"/uaa/.yo-rc.json "$UAA_APP_FOLDER"/
    cd "$UAA_APP_FOLDER"
    npm link generator-jhipster-kotlin
    jhipster --force --no-insight --with-entities --skip-checks --blueprint generator-jhipster-kotlin
    ls -al "$UAA_APP_FOLDER"
fi

mkdir -p "$APP_FOLDER"
cp -f "$JHIPSTER_SAMPLES"/"$JHIPSTER"/.yo-rc.json "$APP_FOLDER"/
cd "$APP_FOLDER"
npm link generator-jhipster-kotlin
jhipster --force --no-insight --skip-checks --with-entities --blueprint generator-jhipster-kotlin 
ls -al "$APP_FOLDER"
