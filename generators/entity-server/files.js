/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require('path');
const utils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');
const baseServerFiles = require('generator-jhipster/generators/entity-server/files').serverFiles;

const { SQL } = require('generator-jhipster/jdl/jhipster/database-types');
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = require('generator-jhipster/jdl/jhipster/cache-types');

const { writeEntityCouchbaseFiles } = require('./files-couchbase');
const NeedleServerChacheKt = require('./needle-server-cache-kt');
const { makeKotlinServerFiles } = require('../util');

/* Constants use throughout */
const SERVER_MAIN_SRC_KOTLIN_DIR = `${constants.MAIN_DIR}kotlin/`;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = makeKotlinServerFiles(baseServerFiles);

module.exports = {
    writeFiles,
    serverFiles,
    customizeFiles,
};

function writeFiles() {
    return {
        writeServerFiles() {
            if (this.skipServer) return undefined;

            // write server side files
            // writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));
            if (this.reactive) {
                return this.writeFilesToDisk(serverFiles, ['reactive', '']);
            }

            return this.writeFilesToDisk(serverFiles);
        },

        writeEnumFiles() {
            // TODO replace this with proper function.
            const fetchFromInstalledKHipster = subpath => path.join(__dirname, subpath);
            this.fields.forEach(field => {
                if (!field.fieldIsEnum) {
                    return;
                }

                const fieldType = field.fieldType;
                const enumInfo = {
                    ...utils.getEnumInfo(field, this.clientRootFolder),
                    frontendAppName: this.frontendAppName,
                    packageName: this.packageName,
                    entityAbsolutePackage: this.entityAbsolutePackage || this.packageName,
                };
                // eslint-disable-next-line no-console
                if (!this.skipServer) {
                    const pathToTemplateFile = `${fetchFromInstalledKHipster(
                        'templates'
                    )}/${SERVER_MAIN_SRC_KOTLIN_DIR}package/domain/enumeration/Enum.kt.ejs`;
                    this.template(
                        pathToTemplateFile,
                        `${SERVER_MAIN_SRC_KOTLIN_DIR}${this.entityAbsoluteFolder}/domain/enumeration/${fieldType}.kt`,
                        this,
                        {},
                        enumInfo
                    );
                }
            });
        },
        ...writeEntityCouchbaseFiles(),
    };
}

function customizeFiles() {
    if (this.databaseType === SQL) {
        const serverCacheKt = new NeedleServerChacheKt(this);

        if ([EHCACHE, CAFFEINE, INFINISPAN, REDIS].includes(this.cacheProvider) && this.enableHibernateCache) {
            serverCacheKt.addEntityToCache(
                this.asEntity(this.entityClass),
                this.relationships,
                this.packageName,
                this.packageFolder,
                this.cacheProvider
            );
        }
    }
}
