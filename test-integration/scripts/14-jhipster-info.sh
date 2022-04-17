#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

cd "$KHI_FOLDER_APP"
khipster info
