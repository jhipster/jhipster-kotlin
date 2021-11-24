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
// const writeFilesToDisk = require('generator-jhipster/generators/generator-base').writeFilesToDisk;
// const writeFilesToDisk = require('../server/files').writeFilesToDisk;

const { COUCHBASE, MONGODB, NEO4J, SQL } = require('generator-jhipster/jdl/jhipster/database-types');
const { ELASTICSEARCH } = require('generator-jhipster/jdl/jhipster/search-engine-types');
const { MapperTypes, ServiceTypes } = require('generator-jhipster/jdl/jhipster/entity-options');
const { EHCACHE, CAFFEINE, INFINISPAN, REDIS } = require('generator-jhipster/jdl/jhipster/cache-types');
const { writeEntityCouchbaseFiles } = require('./files-couchbase');
const NeedleServerChacheKt = require('./needle-server-cache-kt');

const { MAPSTRUCT } = MapperTypes;
const { SERVICE_CLASS, SERVICE_IMPL } = ServiceTypes;

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
                    file: 'package/domain/Entity.kt.jhi',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi`,
                    useBluePrint: true,
                },
                {
                    file: 'package/domain/Entity.kt.jhi.javax_validation',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.javax_validation`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'sql' && generator.reactive,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.spring_data_reactive',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.spring_data_reactive`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.spring_data_cassandra',
                    renameTo: generator =>
                        `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.spring_data_cassandra`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'neo4j',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.spring_data_neo4j',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.spring_data_neo4j`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'sql' && !generator.reactive,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.javax_persistence',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.javax_persistence`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'mongodb',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.spring_data_mongodb',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.spring_data_mongodb`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === 'sql' && !generator.reactive && generator.enableHibernateCache,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.hibernate_cache',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.hibernate_cache`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/domain/Entity.kt.jhi.elastic_search',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.kt.jhi.elastic_search`,
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
                    renameTo: generator => `${generator.entityAbsoluteFolder}/web/rest/${generator.entityClass}Resource.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.jpaMetamodelFiltering,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/criteria/EntityCriteria.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/criteria/${generator.entityClass}Criteria.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/EntityQueryService.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}QueryService.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === ELASTICSEARCH && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepository.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/search/${generator.entityClass}SearchRepository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => !generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepository.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}Repository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.reactive && !generator.embedded && generator.databaseType !== COUCHBASE,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepository_reactive.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}ReactiveRepository.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.reactive && generator.databaseTypeSql && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/EntityRepositoryInternalImpl_reactive.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}RepositoryInternalImpl.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/repository/EntitySqlHelper_reactive.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}SqlHelper.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/repository/rowmapper/EntityRowMapper.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/repository/rowmapper/${generator.entityClass}RowMapper.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.service === SERVICE_IMPL && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/EntityService.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/impl/${generator.entityClass}ServiceImpl.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.service === SERVICE_CLASS && !generator.embedded,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/impl/EntityServiceImpl.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/${generator.entityClass}Service.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.dto === MAPSTRUCT,
            path: SERVER_MAIN_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTO.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.asDto(generator.entityClass)}.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/mapper/BaseEntityMapper.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/EntityMapper.kt`,
                    useBluePrint: true,
                },
                {
                    file: 'package/service/mapper/EntityMapper.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/${generator.entityClass}Mapper.kt`,
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
                    renameTo: generator => `${generator.entityAbsoluteFolder}/web/rest/${generator.entityClass}ResourceIT.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === ELASTICSEARCH && !generator.embedded,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/EntitySearchRepositoryMockConfiguration.kt',
                    renameTo: generator =>
                        `${generator.entityAbsoluteFolder}/repository/search/${generator.entityClass}SearchRepositoryMockConfiguration.kt`,
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
                    renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}Test.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.dto === MAPSTRUCT,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/dto/EntityDTOTest.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/dto/${generator.asDto(generator.entityClass)}Test.kt`,
                    useBluePrint: true,
                },
            ],
        },
        {
            condition: generator => generator.dto === MAPSTRUCT && [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/mapper/EntityMapperTest.kt',
                    renameTo: generator => `${generator.entityAbsoluteFolder}/service/mapper/${generator.entityClass}MapperTest.kt`,
                    useBluePrint: true,
                },
            ],
        },
    ],
};

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
