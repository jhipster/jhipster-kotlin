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
const baseCouchbaseFiles = require('./jhipster-files-couchbase.cjs').couchbaseFiles;
const { makeKotlinServerFiles } = require('../util.cjs');

const couchbaseFiles = makeKotlinServerFiles(baseCouchbaseFiles);

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
