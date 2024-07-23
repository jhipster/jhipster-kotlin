#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$KHI_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$KHI_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$KHI_FOLDER_APP"
    IFS=','
    for i in `echo "$JHI_APP"`
    do
        cp -f "$JHI_SAMPLES"/"$i"/*.jdl "$KHI_FOLDER_APP"/
    done
    cd "$KHI_FOLDER_APP"
    ls -la "$KHI_FOLDER_APP"/
    eval "$KHI_CLI import-jdl *.jdl --no-insight --skip-ktlint-format $@"

elif [[ "$JHI_APP" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate project with jhipster using jdl
    #-------------------------------------------------------------------------------
    mkdir -p "$KHI_FOLDER_APP"

    IFS=','
    for i in `echo "$JHI_JDL_APP"`
    do
        if [[ -f "$i" ]]; then
            cp -f "$i" "$KHI_FOLDER_APP"/

        elif [[ -d "$i" ]]; then
            cp -f "$i"/*.jdl "$KHI_FOLDER_APP"/

        elif [[ -d "$JHI_SAMPLES/jdl-entities/$i" ]]; then
            cp -f "$JHI_SAMPLES/jdl-entities/$i/*.jdl" "$KHI_FOLDER_APP"/

        elif [[ -f "$JHI_SAMPLES/jdl-entities/$i.jdl" ]]; then
            cp -f "$JHI_SAMPLES/jdl-entities/$i.jdl" "$KHI_FOLDER_APP"/

        else
            cp -f "$JHI_JDL_SAMPLES"/"$i"/*.jdl "$KHI_FOLDER_APP"/
        fi
    done

    ls -la "$KHI_FOLDER_APP"/
    cd "$KHI_FOLDER_APP"
    eval "$KHI_CLI jdl *.jdl --no-insight --skip-ktlint-format $@"

else

    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$KHI_FOLDER_APP"
    if [[ "$JHI_GENERATE_SKIP_CONFIG" != "1" ]]; then
        cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$KHI_FOLDER_APP"/
    else
        echo "skipping config file"
    fi
    cd "$KHI_FOLDER_APP"
    eval "$KHI_CLI --force --no-insight --skip-checks --skip-ktlint-format $@"

fi

cd "$KHI_FOLDER_APP"

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$KHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit || true
