/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
const baseCouchbaseFiles = require('generator-jhipster/generators/server/files-couchbase').couchbaseFiles;
const constants = require('generator-jhipster/generators/generator-constants');
const { makeKotlinServerFiles } = require('../util');

const couchbaseFiles = makeKotlinServerFiles(baseCouchbaseFiles);

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = `${constants.TEST_DIR}kotlin/`;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

function writeCouchbaseFiles() {
    return {
        cleanupCouchbaseFiles() {
            if (!this.databaseTypeCouchbase) return;

            if (this.isJhipsterVersionLessThan('7.1.1')) {
                this.removeFile(`${this.javaDir}repository/CustomReactiveCouchbaseRepository.kt`);
                this.removeFile(`${this.testDir}config/DatabaseConfigurationIT.kt`);
                this.removeFile(`${this.javaDir}repository/N1qlCouchbaseRepository.kt`);
                this.removeFile(`${this.javaDir}repository/ReactiveN1qlCouchbaseRepository.kt`);
                this.removeFile(`${this.javaDir}repository/CustomN1qlCouchbaseRepository.kt`);
                this.removeFile(`${this.javaDir}repository/CustomCouchbaseRepository.kt`);
                this.removeFile(`${this.javaDir}repository/SearchCouchbaseRepository.kt`);
                this.removeFile(`${this.testDir}repository/CustomCouchbaseRepositoryTest.kt`);
            }

            if (this.isJhipsterVersionLessThan('7.6.1')) {
                this.removeFile(`${SERVER_TEST_SRC_DIR}${this.testDir}repository/JHipsterCouchbaseRepositoryTest.java`);
                this.removeFolder(`${SERVER_MAIN_SRC_DIR}${this.javaDir}config/couchbase`);
                this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0__create_indexes.n1ql`);
                this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json`);
                this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json`);
                this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__admin.json`);
                this.removeFile(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__user.json`);
              }
        },

        async writeCouchbaseFiles() {
            if (!this.databaseTypeCouchbase) return;

            await this.writeFiles({
                sections: couchbaseFiles,
                rootTemplatesPath: 'couchbase',
            });
        },
    };
}

module.exports = {
    couchbaseFiles,
    writeCouchbaseFiles,
};
