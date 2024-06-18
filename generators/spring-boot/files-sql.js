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
import { addSectionsCondition, mergeSections } from 'generator-jhipster/generators/base/support';
import constants from '../jhipster-constants.cjs';

const DOCKER_DIR = constants.DOCKER_DIR;
// const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
// const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

const { MAIN_DIR, TEST_DIR } = constants;

const SERVER_MAIN_SRC_DIR = `${MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = `${TEST_DIR}kotlin/`;

const dockerFiles = {
    docker: [
        {
            condition: generator => !generator.prodDatabaseTypeOracle,
            path: DOCKER_DIR,
            templates: [{ file: generator => `${generator.prodDatabaseType}.yml` }],
        },
        {
            condition: generator => !generator.devDatabaseTypeOracle && !generator.devDatabaseTypeH2Any,
            path: DOCKER_DIR,
            templates: [{ file: generator => `${generator.devDatabaseType}.yml` }],
        },
    ],
};

const sqlFiles = {
    reactiveJavaUserManagement: [
        {
            condition: generator => generator.reactive && (!generator.skipUserManagement || generator.authenticationTypeOauth2),
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/UserSqlHelper.kt',
                    renameTo: generator => `${generator.javaDir}repository/UserSqlHelper.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive && (!generator.skipUserManagement || generator.authenticationTypeOauth2),
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/rowmapper/UserRowMapper.kt',
                    renameTo: generator => `${generator.javaDir}repository/rowmapper/UserRowMapper.kt`,
                },
            ],
        },
    ],
    reactiveCommon: [
        {
            condition: generator => generator.reactive,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/rowmapper/ColumnConverter.kt',
                    renameTo: generator => `${generator.javaDir}repository/rowmapper/ColumnConverter.kt`,
                },
                {
                    file: 'package/repository/EntityManager.kt',
                    renameTo: generator => `${generator.javaDir}repository/EntityManager.kt`,
                },
            ],
        },
    ],
    liquibase: [
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/LiquibaseConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LiquibaseConfiguration.kt`,
                },
            ],
        },
    ],
    hibernate: [
        {
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/timezone/HibernateTimeZoneIT.kt',
                    renameTo: generator => `${generator.testDir}config/timezone/HibernateTimeZoneIT.kt`,
                },
                {
                    file: 'package/repository/timezone/DateTimeWrapper.kt',
                    renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapper.kt`,
                },
                {
                    file: 'package/repository/timezone/DateTimeWrapperRepository.kt',
                    renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapperRepository.kt`,
                },
            ],
        },
    ],
    testContainers: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/EmbeddedSQL.kt',
                    renameTo: generator => `${generator.testDir}config/EmbeddedSQL.kt`,
                },
                {
                    file: 'package/config/SqlTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/SqlTestContainer.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: ['config/application-testdev.yml'],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_TEST_RES_DIR,
            templates: ['config/application-testprod.yml'],
        },
    ],
};

const h2Files = {
    serverResource: [
        {
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'h2.server.properties', renameTo: () => '.h2.server.properties' }],
        },
    ],
};

const mysqlFiles = {
    serverTestSources: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/MysqlTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/MysqlTestContainer.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: [{ file: 'testcontainers/mysql/my.cnf', method: 'copy', noEjs: true }],
        },
        {
            path: DOCKER_DIR,
            templates: [{ file: 'config/mysql/my.cnf', method: 'copy', noEjs: true }],
        },
    ],
};

const mariadbFiles = {
    serverTestSources: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/MariadbTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/MariadbTestContainer.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: [{ file: 'testcontainers/mariadb/my.cnf', method: 'copy', noEjs: true }],
        },
        {
            path: DOCKER_DIR,
            templates: [{ file: 'config/mariadb/my.cnf', method: 'copy', noEjs: true }],
        },
    ],
};

const mssqlFiles = {
    serverTestSources: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/MsSqlTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/MsSqlTestContainer.kt`,
                },
            ],
        },
    ],
};

const postgresFiles = {
    serverTestSources: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/PostgreSqlTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/PostgreSqlTestContainer.kt`,
                },
            ],
        },
    ],
};

const serverFiles = mergeSections(
    sqlFiles,
    dockerFiles,
    addSectionsCondition(h2Files, context => context.devDatabaseTypeH2Any),
    addSectionsCondition(mysqlFiles, context => context.devDatabaseTypeMysql || context.prodDatabaseTypeMysql),
    addSectionsCondition(mariadbFiles, context => context.devDatabaseTypeMariadb || context.prodDatabaseTypeMariadb),
    addSectionsCondition(mssqlFiles, context => context.devDatabaseTypeMssql || context.prodDatabaseTypeMssql),
    addSectionsCondition(postgresFiles, context => context.devDatabaseTypePostgresql || context.prodDatabaseTypePostgresql),
);

export function writeSqlFiles() {
    return {
        async writeSqlFiles({ application }) {
            if (!application.databaseTypeSql) return;

            await this.writeFiles({
                sections: serverFiles,
                rootTemplatesPath: ['sql/reactive', 'sql/common'],
                context: application,
            });
        },
    };
}

// function writeSqlFiles() {
//     return {
//         async writeSqlFiles() {
//             if (!this.databaseTypeSql) return;

//             await this.writeFiles({
//                 sections: sqlFiles,
//                 rootTemplatesPath: ['sql/reactive', 'sql'],
//             });
//         },
//     };
// }

// module.exports = {
//     sqlFiles,
//     writeSqlFiles,
// };
