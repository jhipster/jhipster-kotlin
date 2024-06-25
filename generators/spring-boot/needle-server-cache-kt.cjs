/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const needleServerCache = require('generator-jhipster/generators/server/needle-api/needle-server-cache');
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_SRC_KOTLIN_DIR = `${constants.MAIN_DIR}kotlin/`;

module.exports = class extends needleServerCache {
    addEntityToCache(entityClass, relationships, packageName, packageFolder, cacheProvider) {
        this.addEntryToCache(`${packageName}.domain.${entityClass}::class.java.name`, packageFolder, cacheProvider);
        // Add the collections linked to that entity to ehcache
        relationships.forEach(relationship => {
            const relationshipType = relationship.relationshipType;
            if (relationshipType === 'one-to-many' || relationship.relationshipManyToMany) {
                this.addEntryToCache(
                    `${packageName}.domain.${entityClass}::class.java.name + ".${relationship.relationshipFieldNamePlural}"`,
                    packageFolder,
                    cacheProvider,
                );
            }
        });
    }

    addEntryToCache(entry, packageFolder, cacheProvider) {
        const errorMessage = chalk.yellow(`\nUnable to add ${entry} to CacheConfiguration.kt file.`);
        const cachePath = `${SERVER_MAIN_SRC_KOTLIN_DIR}${packageFolder}/config/CacheConfiguration.kt`;

        if (cacheProvider === 'ehcache') {
            const needle = 'jhipster-needle-ehcache-add-entry';
            const content = `createCache(cm, ${entry})`;

            this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
        } else if (cacheProvider === 'infinispan') {
            const needle = 'jhipster-needle-infinispan-add-entry';
            const content = `registerPredefinedCache(${entry}, JCache(
                cacheManager.getCache<Any, Any>(${entry}).advancedCache, this,
                ConfigurationAdapter.create()))`;

            this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
        }
    }
};
