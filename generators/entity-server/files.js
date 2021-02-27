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
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const utils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');
const baseServerFiles = require('generator-jhipster/generators/entity-server/files').serverFiles;
const writeFilesToDisk = require('generator-jhipster/generators/generator-base').writeFilesToDisk;
// const writeFilesToDisk = require('../server/files').writeFilesToDisk;
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
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/EntityResource.kt',
                    renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}Resource.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.jpaMetamodelFiltering,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityCriteria.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.entityClass}Criteria.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/EntityQueryService.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}QueryService.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch' && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepository.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => !generator.reactive && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepository.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}Repository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.reactive && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepository_reactive.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}ReactiveRepository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.reactive && generator.databaseType === 'sql' && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepositoryInternalImpl_reactive.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/${generator.entityClass}RepositoryInternalImpl.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/repository/rowmapper/EntityRowMapper.kt',
                    renameTo: generator => `${generator.packageFolder}/repository/rowmapper/${generator.entityClass}RowMapper.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.service === 'serviceImpl' && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/EntityService.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.packageFolder}/service/impl/${generator.entityClass}ServiceImpl.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.service === 'serviceClass' && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.packageFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.dto === 'mapstruct',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTO.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/mapper/BaseEntityMapper.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/EntityMapper.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/mapper/EntityMapper.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}Mapper.kt`,
                    useBluePrint: true,
                },
            ],
        },
    ],
    test: [
        {
            condition: generator => !generator.embedded,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/EntityResourceIT.kt',
                    options: {
                        context: {
                            _,
                            chalkRed: chalk.red,
                            fs,
                            SERVER_TEST_SRC_KOTLIN_DIR,
                        },
                    },
                    renameTo: generator => `${generator.packageFolder}/web/rest/${generator.entityClass}ResourceIT.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch' && !generator.embedded,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.kt',
                    renameTo: generator =>
                        `${generator.packageFolder}/repository/search/${generator.entityClass}SearchRepositoryMockConfiguration.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.gatlingTests,
            path: TEST_DIR,
            templates: [
                {
                    file: 'gatling/user-files/simulations/EntityGatlingTest.scala',
                    options: { interpolate: INTERPOLATE_REGEX },
                    renameTo: generator => `gatling/user-files/simulations/${generator.entityClass}GatlingTest.scala`,
                },
            ],
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/EntityTest.kt',
                    renameTo: generator => `${generator.packageFolder}/domain/${generator.entityClass}Test.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.dto === 'mapstruct',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTOTest.kt',
                    renameTo: generator => `${generator.packageFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator =>
                generator.dto === 'mapstruct' && ['sql', 'mongodb', 'couchbase', 'neo4j'].includes(generator.databaseType),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/mapper/EntityMapperTest.kt',
                    renameTo: generator => `${generator.packageFolder}/service/mapper/${generator.entityClass}MapperTest.kt`,
                    useBluePrint: true,
                },
            ],
        },
    ],
};

module.exports = {
    writeFiles,
    serverFiles,
};

function writeFiles() {
    return {
        writeServerFiles() {
            if (this.skipServer) return;

            // write server side files
            // writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('entity-server/templates'));
            if (this.reactive) {
                this.writeFilesToDisk(serverFiles, ['reactive', '']);
            } else {
                this.writeFilesToDisk(serverFiles);
            }

            if (this.databaseType === 'sql') {
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
                };
                // eslint-disable-next-line no-console
                if (!this.skipServer) {
                    const pathToTemplateFile = `${fetchFromInstalledKHipster(
                        'templates'
                    )}/${SERVER_MAIN_SRC_KOTLIN_DIR}package/domain/enumeration/Enum.kt.ejs`;
                    this.template(
                        pathToTemplateFile,
                        `${SERVER_MAIN_SRC_KOTLIN_DIR}${this.packageFolder}/domain/enumeration/${fieldType}.kt`,
                        this,
                        {},
                        enumInfo
                    );
                }
            });
        },
    };
}
