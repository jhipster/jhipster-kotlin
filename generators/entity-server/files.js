/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const _ = require('lodash');
const randexp = require('randexp');
const chalk = require('chalk');
const fs = require('fs');
const utils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');
const baseServerFiles = require('generator-jhipster/generators/entity-server/files').serverFiles;
const writeFilesToDisk = require('../server/files').writeFilesToDisk;
const NeedleServerChacheKt = require('./needle-server-cache-kt');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const TEST_DIR = constants.TEST_DIR;
const SERVER_MAIN_SRC_KOTLIN_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_KOTLIN_DIR = `${constants.TEST_DIR}kotlin/`;

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    ...baseServerFiles,
    server: [
        {
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt',
                    renameTo: generator => `${generator.packageFolder}/domain/${generator.asEntity(generator.entityClass)}.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/repository/EntityRepository.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/web/rest/EntityResource.kt',
                    renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}Resource.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.jpaMetamodelFiltering,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityCriteria.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.entityClass}Criteria.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/service/EntityQueryService.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepository.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.reactive && ['mongodb', 'cassandra', 'couchbase'].includes(generator.databaseType),
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/reactive/EntityReactiveRepository.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/reactive/${generator.entityClass}ReactiveRepository.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.service === 'serviceImpl',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/EntityService.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.service === 'serviceClass',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.dto === 'mapstruct',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTO.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/service/mapper/BaseEntityMapper.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/service/mapper/EntityMapper.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.kt`,
                    useBluePrint: true
                }
            ]
        }
    ],
    test: [
        {
            // TODO: add test for reactive
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/EntityResourceIT.kt',
                    options: {
                        context: {
                            randexp,
                            _,
                            chalkRed: chalk.red,
                            fs,
                            SERVER_TEST_SRC_KOTLIN_DIR
                        }
                    },
                    renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIT.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.kt',
                    renameTo: generator =>
                        `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepositoryMockConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.gatlingTests,
            path: TEST_DIR,
            templates: [
                {
                    file: 'gatling/user-files/simulations/EntityGatlingTest.scala',
                    options: { interpolate: INTERPOLATE_REGEX },
                    renameTo: generator => `gatling/user-files/simulations/${generator.entityClass}GatlingTest.scala`
                }
            ]
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/EntityTest.kt',
                    renameTo: generator => `${generator.packageFolder}/domain/${generator.entityClass}Test.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.dto === 'mapstruct',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTOTest.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                generator.dto === 'mapstruct' &&
                (generator.databaseType === 'sql' || generator.databaseType === 'mongodb' || generator.databaseType === 'couchbase'),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/mapper/EntityMapperTest.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}MapperTest.kt`,
                    useBluePrint: true
                }
            ]
        }
    ]
};

module.exports = {
    writeFiles,
    serverFiles
};

function writeFiles() {
    return {
        saveRemoteEntityPath() {
            if (_.isUndefined(this.microservicePath)) {
                return;
            }
            this.copy(
                `${this.microservicePath}/${this.jhipsterConfigDirectory}/${this.entityNameCapitalized}.json`,
                this.destinationPath(`${this.jhipsterConfigDirectory}/${this.entityNameCapitalized}.json`)
            );
        },

        writeServerFiles() {
            if (this.skipServer) return;

            // write server side files
            writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));

            if (this.databaseType === 'sql') {
                if (!this.skipDbChangelog) {
                    if (this.fieldsContainOwnerManyToMany || this.fieldsContainOwnerOneToOne || this.fieldsContainManyToOne) {
                        this.addConstraintsChangelogToLiquibase(`${this.changelogDate}_added_entity_constraints_${this.entityClass}`);
                    }
                    this.addChangelogToLiquibase(`${this.changelogDate}_added_entity_${this.entityClass}`);
                }

                const serverCacheKt = new NeedleServerChacheKt(this);

                if (['ehcache', 'caffeine', 'infinispan', 'redis'].includes(this.cacheProvider) && this.enableHibernateCache) {
                    serverCacheKt.addEntityToCache(
                        this.asEntity(this.entityClass),
                        this.relationships,
                        this.packageName,
                        this.packageFolder,
                        this.cacheProvider
                    );
                }
            }
        },

        writeEnumFiles() {
            this.fields.forEach(field => {
                if (field.fieldIsEnum === true) {
                    const fieldType = field.fieldType;
                    const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);
                    if (!this.skipServer) {
                        this.template(
                            `${SERVER_MAIN_SRC_KOTLIN_DIR}package/domain/enumeration/Enum.kt.ejs`,
                            `${SERVER_MAIN_SRC_KOTLIN_DIR}${this.packageFolder}/domain/enumeration/${fieldType}.kt`,
                            this,
                            {},
                            enumInfo
                        );
                    }
                }
            });
        }
    };
}
