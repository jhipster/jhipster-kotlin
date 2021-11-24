/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const constants = require('generator-jhipster/generators/generator-constants');

const SERVER_MAIN_KOTLIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;

const sqlFiles = {
    reactiveJavaUserManagement: [
        {
            condition: generator => generator.reactive && (!generator.skipUserManagement || generator.authenticationTypeOauth2),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/UserSqlHelper.kt',
                    renameTo: generator => `${generator.javaDir}repository/UserSqlHelper.kt`,
                    useBlueprint: true,
                },
            ],
        },
    ],
};

function writeSqlFiles() {
    return {
        async writeSqlFiles() {
            if (!this.databaseTypeSql) return;

            await this.writeFiles({
                sections: sqlFiles,
                rootTemplatesPath: ['sql/reactive', 'sql'],
            });
        },
    };
}

module.exports = {
    sqlFiles,
    writeSqlFiles,
};
