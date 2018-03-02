/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const mkdirp = require('mkdirp');
const cleanup = require('generator-jhipster/generators/cleanup');
const constants = require('generator-jhipster/generators/generator-constants');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const DOCKER_DIR = constants.DOCKER_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

const BASE_DIR = '../../../node_modules/generator-jhipster/generators/server/templates/';

const KOTLIN_VERSION_STR = ['${', 'kotlin.version}'].join('');

const mavenPluginConfiguration = `          <configuration>
                    <args>
                        <arg>-Xjsr305=strict</arg>
                    </args>
                    <compilerPlugins>
                        <plugin>spring</plugin>
                    </compilerPlugins>
                    <jvmTarget>1.8</jvmTarget>
                    </configuration>
                    <executions>
                        <execution>
                            <id>compile</id>
                            <phase>compile</phase>
                            <goals>
                                <goal>compile</goal>
                            </goals>
                        </execution>
                        <execution>
                            <id>test-compile</id>
                            <phase>test-compile</phase>
                            <goals>
                                <goal>test-compile</goal>
                            </goals>
                        </execution> 
                    </executions>
                    <dependencies>
                        <dependency>
                            <groupId>org.jetbrains.kotlin</groupId>
                            <artifactId>kotlin-maven-allopen</artifactId>
                            <version>${KOTLIN_VERSION_STR}</version>
                        </dependency>
                    </dependencies>`;


const rewriteDir = (ejsFile) => {
    if (!ejsFile.endsWith('.kt.ejs') && !ejsFile.endsWith('kotlin.gradle') && !ejsFile.endsWith('banner.txt')) {
        ejsFile = BASE_DIR + ejsFile;
    }
    return ejsFile;
};

module.exports = {
    writeFiles
};

let javaDir;

function writeFiles() {
    return {

        setUpJavaDir() {
            javaDir = this.javaDir = `${constants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        },

        cleanupOldServerFiles() {
            cleanup.cleanupOldServerFiles(this, this.javaDir, this.testDir);
        },

        writeGlobalFiles() {
            this.template(rewriteDir('README.md.ejs'), 'README.md');
            this.template(rewriteDir('gitignore.ejs'), '.gitignore');
            this.copy(rewriteDir('gitattributes.ejs'), '.gitattributes');
            this.copy(rewriteDir('editorconfig.ejs'), '.editorconfig');
        },

        writeDockerFiles() {
            // Create Docker and Docker Compose files
            this.template(rewriteDir(`${DOCKER_DIR}Dockerfile.ejs`), `${DOCKER_DIR}Dockerfile`);
            this.template(rewriteDir(`${DOCKER_DIR}.dockerignore.ejs`), `${DOCKER_DIR}.dockerignore`);
            this.template(rewriteDir(`${DOCKER_DIR}app.yml.ejs`), `${DOCKER_DIR}app.yml`);
            this.template(rewriteDir(`${DOCKER_DIR}${this.prodDatabaseType}.yml.ejs`), `${DOCKER_DIR}${this.prodDatabaseType}.yml`);
            if (this.prodDatabaseType === 'mongodb') {
                this.template(rewriteDir(`${DOCKER_DIR}mongodb-cluster.yml.ejs`), `${DOCKER_DIR}mongodb-cluster.yml`);
                this.template(rewriteDir(`${DOCKER_DIR}mongodb/MongoDB.Dockerfile.ejs`), `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`);
                this.template(rewriteDir(`${DOCKER_DIR}mongodb/scripts/init_replicaset.js.ejs`), `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`);
            }
            if (this.prodDatabaseType === 'couchbase') {
                this.template(rewriteDir(`${DOCKER_DIR}couchbase-cluster.yml.ejs`), `${DOCKER_DIR}couchbase-cluster.yml`);
                this.template(rewriteDir(`${DOCKER_DIR}couchbase/Couchbase.Dockerfile.ejs`), `${DOCKER_DIR}couchbase/Couchbase.Dockerfile`);
                this.template(rewriteDir(`${DOCKER_DIR}couchbase/scripts/configure-node.sh.ejs`), `${DOCKER_DIR}couchbase/scripts/configure-node.sh`);
            }
            if (this.prodDatabaseType === 'cassandra') {
                // docker-compose files
                this.template(rewriteDir(`${DOCKER_DIR}cassandra-cluster.yml.ejs`), `${DOCKER_DIR}cassandra-cluster.yml`);
                this.template(rewriteDir(`${DOCKER_DIR}cassandra-migration.yml.ejs`), `${DOCKER_DIR}cassandra-migration.yml`);
                // dockerfiles
                this.template(rewriteDir(`${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile.ejs`), `${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile`);
                // scripts
                this.template(rewriteDir(`${DOCKER_DIR}cassandra/scripts/autoMigrate.sh.ejs`), `${DOCKER_DIR}cassandra/scripts/autoMigrate.sh`);
                this.template(rewriteDir(`${DOCKER_DIR}cassandra/scripts/execute-cql.sh.ejs`), `${DOCKER_DIR}cassandra/scripts/execute-cql.sh`);
            }
            if (this.cacheProvider === 'hazelcast') {
                this.template(rewriteDir(`${DOCKER_DIR}hazelcast-management-center.yml.ejs`), `${DOCKER_DIR}hazelcast-management-center.yml`);
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(rewriteDir(`${DOCKER_DIR}elasticsearch.yml.ejs`), `${DOCKER_DIR}elasticsearch.yml`);
            }
            if (this.messageBroker === 'kafka') {
                this.template(rewriteDir(`${DOCKER_DIR}kafka.yml.ejs`), `${DOCKER_DIR}kafka.yml`);
            }
            if (this.serviceDiscoveryType) {
                this.template(rewriteDir(`${DOCKER_DIR}config/README.md.ejs`), `${DOCKER_DIR}central-server-config/README.md`);

                if (this.serviceDiscoveryType === 'consul') {
                    this.template(rewriteDir(`${DOCKER_DIR}consul.yml.ejs`), `${DOCKER_DIR}consul.yml`);
                    this.copy(rewriteDir(`${DOCKER_DIR}config/git2consul.json.ejs`), `${DOCKER_DIR}config/git2consul.json`);
                    this.copy(rewriteDir(`${DOCKER_DIR}config/consul-config/application.yml.ejs`), `${DOCKER_DIR}central-server-config/application.yml`);
                }
                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(rewriteDir(`${DOCKER_DIR}jhipster-registry.yml.ejs`), `${DOCKER_DIR}jhipster-registry.yml`);
                    this.copy(rewriteDir(`${DOCKER_DIR}config/docker-config/application.yml.ejs`), `${DOCKER_DIR}central-server-config/docker-config/application.yml`);
                    this.copy(rewriteDir(`${DOCKER_DIR}config/localhost-config/application.yml.ejs`), `${DOCKER_DIR}central-server-config/localhost-config/application.yml`);
                }
            }

            if (this.enableSwaggerCodegen) {
                this.template(rewriteDir(`${DOCKER_DIR}swagger-editor.yml.ejs`), `${DOCKER_DIR}swagger-editor.yml`);
            }

            this.template(rewriteDir(`${DOCKER_DIR}sonar.yml.ejs`), `${DOCKER_DIR}sonar.yml`);

            if (this.authenticationType === 'oauth2') {
                this.template(rewriteDir(`${DOCKER_DIR}keycloak.yml.ejs`), `${DOCKER_DIR}keycloak.yml`);
                this.template(rewriteDir(`${DOCKER_DIR}config/realm-config/jhipster-realm.json.ejs`), `${DOCKER_DIR}realm-config/jhipster-realm.json`);
                this.copy(rewriteDir(`${DOCKER_DIR}config/realm-config/jhipster-users-0.json.ejs`), `${DOCKER_DIR}realm-config/jhipster-users-0.json`);
            }
        },

        writeServerBuildFiles() {
            switch (this.buildTool) {
            case 'gradle':
                this.template(rewriteDir('build.gradle.ejs'), 'build.gradle');
                this.template(rewriteDir('settings.gradle.ejs'), 'settings.gradle');
                this.template(rewriteDir('gradle.properties.ejs'), 'gradle.properties');
                this.template(rewriteDir('gradle/sonar.gradle.ejs'), 'gradle/sonar.gradle');
                this.template(rewriteDir('gradle/docker.gradle.ejs'), 'gradle/docker.gradle');
                this.template(rewriteDir('gradle/profile_dev.gradle.ejs'), 'gradle/profile_dev.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template(rewriteDir('gradle/profile_prod.gradle.ejs'), 'gradle/profile_prod.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template(rewriteDir('gradle/mapstruct.gradle.ejs'), 'gradle/mapstruct.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template(rewriteDir('gradle/graphite.gradle.ejs'), 'gradle/graphite.gradle');
                this.template(rewriteDir('gradle/prometheus.gradle.ejs'), 'gradle/prometheus.gradle');
                this.template(rewriteDir('gradle/zipkin.gradle.ejs'), 'gradle/zipkin.gradle');
                if (this.gatlingTests) {
                    this.template(rewriteDir('gradle/gatling.gradle.ejs'), 'gradle/gatling.gradle');
                }
                if (this.databaseType === 'sql') {
                    this.template(rewriteDir('gradle/liquibase.gradle.ejs'), 'gradle/liquibase.gradle');
                }
                if (this.enableSwaggerCodegen) {
                    this.template(rewriteDir('gradle/swagger.gradle.ejs'), 'gradle/swagger.gradle');
                }
                this.copy(rewriteDir('gradlew'), 'gradlew');
                this.copy(rewriteDir('gradlew.bat'), 'gradlew.bat');
                this.copy(rewriteDir('gradle/wrapper/gradle-wrapper.jar'), 'gradle/wrapper/gradle-wrapper.jar');
                this.copy(rewriteDir('gradle/wrapper/gradle-wrapper.properties'), 'gradle/wrapper/gradle-wrapper.properties');
                this.template(rewriteDir('gradle/_kotlin.gradle'), 'gradle/kotlin.gradle');

                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-gradle-plugin', '1.2.21');
                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-allopen', '1.2.21');

                this.applyFromGradleScript('gradle/kotlin');
                break;
            case 'maven':
            default:
                this.copy(rewriteDir('mvnw'), 'mvnw');
                this.copy(rewriteDir('mvnw.cmd'), 'mvnw.cmd');
                this.copy(rewriteDir('.mvn/wrapper/maven-wrapper.jar'), '.mvn/wrapper/maven-wrapper.jar');
                this.copy(rewriteDir('.mvn/wrapper/maven-wrapper.properties'), '.mvn/wrapper/maven-wrapper.properties');
                this.template(rewriteDir('pom.xml.ejs'), 'pom.xml', null, { interpolate: INTERPOLATE_REGEX });

                this.addMavenProperty('kotlin.compiler.incremental', 'true');
                this.addMavenProperty('kotlin.version', '1.2.21');

                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-stdlib-jdk8', KOTLIN_VERSION_STR);
                this.addMavenDependency('com.fasterxml.jackson.module', 'jackson-module-kotlin', '2.9.4.1');
                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-reflect', KOTLIN_VERSION_STR);

                this.addMavenPlugin('org.jetbrains.kotlin', 'kotlin-maven-plugin', KOTLIN_VERSION_STR, mavenPluginConfiguration);
            }
        },

        writeServerResourceFiles() {
            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}banner.txt`), `${SERVER_MAIN_RES_DIR}banner.txt`);

            if (this.devDatabaseType === 'h2Disk' || this.devDatabaseType === 'h2Memory') {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}h2.server.properties.ejs`), `${SERVER_MAIN_RES_DIR}.h2.server.properties`);
            }

            // Thymeleaf templates
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}templates/error.html.ejs`), `${SERVER_MAIN_RES_DIR}templates/error.html`);

            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}logback-spring.xml.ejs`), `${SERVER_MAIN_RES_DIR}logback-spring.xml`, this, { interpolate: INTERPOLATE_REGEX });

            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/application.yml.ejs`), `${SERVER_MAIN_RES_DIR}config/application.yml`);
            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/application-dev.yml.ejs`), `${SERVER_MAIN_RES_DIR}config/application-dev.yml`);
            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/application-prod.yml.ejs`), `${SERVER_MAIN_RES_DIR}config/application-prod.yml`);

            if (this.enableSwaggerCodegen) {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}swagger/api.yml.ejs`), `${SERVER_MAIN_RES_DIR}swagger/api.yml`);
            }

            if (this.databaseType === 'sql') {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/liquibase/changelog/initial_schema.xml.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`, this, { interpolate: INTERPOLATE_REGEX });
                this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/liquibase/master.xml.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`);
            }

            if (this.databaseType === 'mongodb') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/dbmigrations/package-info.java.ejs`), `${javaDir}config/dbmigrations/package-info.java`);
                if (!this.skipUserManagement) {
                    this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/dbmigrations/InitialSetupMigration.java.ejs`), `${javaDir}config/dbmigrations/InitialSetupMigration.java`);
                }
            }

            if (this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0__create_indexes.n1ql.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0__create_indexes.n1ql`);
                if (!this.skipUserManagement || this.authenticationType === 'oauth2') {
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/user__admin.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__admin.json`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/user__anonymoususer.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__anonymoususer.json`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/user__system.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__system.json`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}/config/couchmove/changelog/V0.1__initial_setup/user__user.json.ejs`), `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user__user.json`);
                }
            }

            if (this.databaseType === 'cassandra') {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/create-keyspace-prod.cql.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace-prod.cql`);
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/create-keyspace.cql.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace.cql`);
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/drop-keyspace.cql.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/drop-keyspace.cql`);
                this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/changelog/README.md.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/changelog/README.md`);

                /* Skip the code below for --skip-user-management */
                if (this.skipUserManagement && this.authenticationType !== 'oauth2') return;
                if (this.applicationType !== 'microservice' && this.databaseType === 'cassandra') {
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/changelog/create-tables.cql.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000000_create-tables.cql`);
                    this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/cql/changelog/insert_default_users.cql.ejs`), `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000001_insert_default_users.cql`);
                }
            }

            if (this.applicationType === 'uaa') {
                this.generateKeyStore();
            }
        },

        writeServerPropertyFiles() {
            this.template(rewriteDir(`../../languages/templates/${SERVER_MAIN_RES_DIR}i18n/messages_en.properties.ejs`), `${SERVER_MAIN_RES_DIR}i18n/messages.properties`);
        },

        writeServerJavaAuthConfigFiles() {
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/SpringSecurityAuditorAware.java.ejs`), `${javaDir}security/SpringSecurityAuditorAware.java`);
            }
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/SecurityUtils.java.ejs`), `${javaDir}security/SecurityUtils.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/AuthoritiesConstants.java.ejs`), `${javaDir}security/AuthoritiesConstants.java`);

            if (this.authenticationType === 'jwt') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/jwt/TokenProvider.java.ejs`), `${javaDir}security/jwt/TokenProvider.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/jwt/JWTConfigurer.java.ejs`), `${javaDir}security/jwt/JWTConfigurer.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/jwt/JWTFilter.java.ejs`), `${javaDir}security/jwt/JWTFilter.java`);
            }

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement && (this.applicationType !== 'monolith' || this.authenticationType !== 'oauth2')) {
                if (this.applicationType !== 'microservice' && this.authenticationType === 'jwt') {
                    this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/SecurityConfiguration.java.ejs`), `${javaDir}config/SecurityConfiguration.java`);
                }
                return;
            }

            if (this.applicationType === 'uaa') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/UaaWebSecurityConfiguration.java.ejs`), `${javaDir}config/UaaWebSecurityConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/UaaConfiguration.java.ejs`), `${javaDir}config/UaaConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/UaaProperties.java.ejs`), `${javaDir}config/UaaProperties.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/IatTokenEnhancer.java.ejs`), `${javaDir}security/IatTokenEnhancer.java`);
            } else {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/SecurityConfiguration.java.ejs`), `${javaDir}config/SecurityConfiguration.java`);
            }

            if (this.authenticationType === 'session') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/PersistentToken.kt.ejs`), `${javaDir}domain/PersistentToken.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/PersistentTokenRepository.java.ejs`), `${javaDir}repository/PersistentTokenRepository.java`);
            }

            if (this.authenticationType === 'oauth2') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/OAuth2Configuration.java.ejs`), `${javaDir}config/OAuth2Configuration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/OAuth2AuthenticationSuccessHandler.java.ejs`), `${javaDir}security/OAuth2AuthenticationSuccessHandler.java`);
            } else {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/DomainUserDetailsService.kt.ejs`), `${javaDir}security/DomainUserDetailsService.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/UserNotActivatedException.java.ejs`), `${javaDir}security/UserNotActivatedException.java`);
            }

            if (this.authenticationType === 'jwt') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/LoginVM.java.ejs`), `${javaDir}web/rest/vm/LoginVM.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/UserJWTController.kt.ejs`), `${javaDir}web/rest/UserJWTController.kt`);
            }

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/package-info.java.ejs`), `${javaDir}security/package-info.java`);

            if (this.authenticationType === 'session') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/PersistentTokenRememberMeServices.java.ejs`), `${javaDir}security/PersistentTokenRememberMeServices.java`);
            }

            if (this.enableSocialSignIn) {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/social/package-info.java.ejs`), `${javaDir}security/social/package-info.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/social/SocialConfiguration.java.ejs`), `${javaDir}config/social/SocialConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/SocialUserConnection.kt.ejs`), `${javaDir}domain/SocialUserConnection.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/CustomSocialConnectionRepository.kt.ejs`), `${javaDir}repository/CustomSocialConnectionRepository.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/CustomSocialUsersConnectionRepository.java.ejs`), `${javaDir}repository/CustomSocialUsersConnectionRepository.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/SocialUserConnectionRepository.kt.ejs`), `${javaDir}repository/SocialUserConnectionRepository.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/social/CustomSignInAdapter.java.ejs`), `${javaDir}security/social/CustomSignInAdapter.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/social/package-info.java.ejs`), `${javaDir}security/social/package-info.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/SocialService.kt.ejs`), `${javaDir}service/SocialService.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/SocialController.kt.ejs`), `${javaDir}web/rest/SocialController.kt`);
            }
        },

        writeServerJavaGatewayFiles() {
            if (this.applicationType !== 'gateway') return;

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/GatewayConfiguration.java.ejs`), `${javaDir}config/GatewayConfiguration.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/apidoc/GatewaySwaggerResourcesProvider.java.ejs`), `${javaDir}config/apidoc/GatewaySwaggerResourcesProvider.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/gateway/ratelimiting/RateLimitingFilter.java.ejs`), `${javaDir}gateway/ratelimiting/RateLimitingFilter.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/gateway/TokenRelayFilter.java.ejs`), `${javaDir}gateway/TokenRelayFilter.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/gateway/accesscontrol/AccessControlFilter.java.ejs`), `${javaDir}gateway/accesscontrol/AccessControlFilter.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/gateway/responserewriting/SwaggerBasePathRewritingFilter.java.ejs`), `${javaDir}gateway/responserewriting/SwaggerBasePathRewritingFilter.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/RouteVM.java.ejs`), `${javaDir}web/rest/vm/RouteVM.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/GatewayResource.kt.ejs`), `${javaDir}web/rest/GatewayResource.kt`);
            if (this.authenticationType === 'uaa') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/AuthResource.java.ejs`), `${javaDir}web/rest/AuthResource.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/filter/RefreshTokenFilter.java.ejs`), `${javaDir}web/filter/RefreshTokenFilter.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/filter/RefreshTokenFilterConfigurer.java.ejs`), `${javaDir}web/filter/RefreshTokenFilterConfigurer.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/OAuth2AuthenticationConfiguration.java.ejs`), `${javaDir}config/oauth2/OAuth2AuthenticationConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/CookieCollection.java.ejs`), `${javaDir}security/oauth2/CookieCollection.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/CookiesHttpServletRequestWrapper.java.ejs`), `${javaDir}security/oauth2/CookiesHttpServletRequestWrapper.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/CookieTokenExtractor.java.ejs`), `${javaDir}security/oauth2/CookieTokenExtractor.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2AuthenticationService.java.ejs`), `${javaDir}security/oauth2/OAuth2AuthenticationService.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2CookieHelper.java.ejs`), `${javaDir}security/oauth2/OAuth2CookieHelper.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2Cookies.java.ejs`), `${javaDir}security/oauth2/OAuth2Cookies.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2TokenEndpointClient.java.ejs`), `${javaDir}security/oauth2/OAuth2TokenEndpointClient.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2TokenEndpointClientAdapter.java.ejs`), `${javaDir}security/oauth2/OAuth2TokenEndpointClientAdapter.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/UaaTokenEndpointClient.java.ejs`), `${javaDir}security/oauth2/UaaTokenEndpointClient.java`);
            }
        },

        writeServerMicroserviceFiles() {
            if (this.applicationType !== 'microservice' && !(this.applicationType === 'gateway' && (this.authenticationType === 'uaa' || this.authenticationType === 'oauth2'))) return;

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/MicroserviceSecurityConfiguration.java.ejs`), `${javaDir}config/MicroserviceSecurityConfiguration.java`);
            if (this.authenticationType === 'uaa') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/OAuth2Properties.java.ejs`), `${javaDir}config/oauth2/OAuth2Properties.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/OAuth2JwtAccessTokenConverter.java.ejs`), `${javaDir}config/oauth2/OAuth2JwtAccessTokenConverter.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/OAuth2SignatureVerifierClient.java.ejs`), `${javaDir}security/oauth2/OAuth2SignatureVerifierClient.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/UaaSignatureVerifierClient.java.ejs`), `${javaDir}security/oauth2/UaaSignatureVerifierClient.java`);
            }
            if (this.applicationType === 'microservice' && this.authenticationType === 'uaa') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/FeignConfiguration.java.ejs`), `${javaDir}config/FeignConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/AuthorizedFeignClient.java.ejs`), `${javaDir}client/AuthorizedFeignClient.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/OAuth2InterceptedFeignConfiguration.java.ejs`), `${javaDir}client/OAuth2InterceptedFeignConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/AuthorizedUserFeignClient.java.ejs`), `${javaDir}client/AuthorizedUserFeignClient.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/UserFeignClientInterceptor.java.ejs`), `${javaDir}client/UserFeignClientInterceptor.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/OAuth2UserClientFeignConfiguration.java.ejs`), `${javaDir}client/OAuth2UserClientFeignConfiguration.java`);
            }
            if (this.authenticationType === 'oauth2') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/AuthorizationHeaderUtil.java.ejs`), `${javaDir}/security/oauth2/AuthorizationHeaderUtil.java`);
                if (this.cacheProvider !== 'no') {
                    this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/CachedUserInfoTokenServices.java.ejs`), `${javaDir}/security/oauth2/CachedUserInfoTokenServices.java`);
                }
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/SimplePrincipalExtractor.java.ejs`), `${javaDir}/security/oauth2/SimplePrincipalExtractor.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/security/oauth2/SimpleAuthoritiesExtractor.java.ejs`), `${javaDir}/security/oauth2/SimpleAuthoritiesExtractor.java`);
            }
            if (this.authenticationType === 'oauth2' && (this.applicationType === 'microservice' || this.applicationType === 'gateway')) {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/FeignConfiguration.java.ejs`), `${javaDir}config/FeignConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/AuthorizedFeignClient.java.ejs`), `${javaDir}client/AuthorizedFeignClient.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/OAuth2InterceptedFeignConfiguration.java.ejs`), `${javaDir}client/OAuth2InterceptedFeignConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/client/TokenRelayRequestInterceptor.java.ejs`), `${javaDir}client/TokenRelayRequestInterceptor.java`);
            }
            if (this.authenticationType === 'oauth2' && this.applicationType === 'gateway') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/OAuth2SsoConfiguration.java.ejs`), `${javaDir}config/OAuth2SsoConfiguration.java`);
            }
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}static/microservices_index.html.ejs`), `${SERVER_MAIN_RES_DIR}static/index.html`);
        },

        writeServerMicroserviceAndGatewayFiles() {
            if (!this.serviceDiscoveryType) return;

            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/bootstrap.yml.ejs`), `${SERVER_MAIN_RES_DIR}config/bootstrap.yml`);
            this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/bootstrap-prod.yml.ejs`), `${SERVER_MAIN_RES_DIR}config/bootstrap-prod.yml`);
        },

        writeServerJavaAppFiles() {
            // Create Java files
            // Spring Boot main
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/Application.kt.ejs`), `${javaDir}/${this.mainClass}.kt`);
        },

        writeServerJavaConfigFiles() {
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/aop/logging/LoggingAspect.kt.ejs`), `${javaDir}aop/logging/LoggingAspect.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/DefaultProfileUtil.kt.ejs`), `${javaDir}config/DefaultProfileUtil.kt`);

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/package-info.java.ejs`), `${javaDir}config/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/AsyncConfiguration.kt.ejs`), `${javaDir}config/AsyncConfiguration.kt`);
            if (['ehcache', 'hazelcast', 'infinispan'].includes(this.cacheProvider) || this.applicationType === 'gateway') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/CacheConfiguration.java.ejs`), `${javaDir}config/CacheConfiguration.java`);
            }
            if (this.cacheProvider === 'infinispan') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/CacheFactoryConfiguration.java.ejs`), `${javaDir}config/CacheFactoryConfiguration.java`);
            }
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/Constants.java.ejs`), `${javaDir}config/Constants.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/DateTimeFormatConfiguration.kt.ejs`), `${javaDir}config/DateTimeFormatConfiguration.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/LoggingConfiguration.kt.ejs`), `${javaDir}config/LoggingConfiguration.kt`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/CloudDatabaseConfiguration.java.ejs`), `${javaDir}config/CloudDatabaseConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/DatabaseConfiguration.java.ejs`), `${javaDir}config/DatabaseConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/audit/package-info.java.ejs`), `${javaDir}config/audit/package-info.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/audit/AuditEventConverter.java.ejs`), `${javaDir}config/audit/AuditEventConverter.java`);
            }

            if (this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/N1qlCouchbaseRepository.kt.ejs`), `${javaDir}repository/N1qlCouchbaseRepository.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/CustomN1qlCouchbaseRepository.kt.ejs`), `${javaDir}repository/CustomN1qlCouchbaseRepository.kt`);
            }

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/ApplicationProperties.kt.ejs`), `${javaDir}config/ApplicationProperties.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/JacksonConfiguration.kt.ejs`), `${javaDir}config/JacksonConfiguration.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/LocaleConfiguration.kt.ejs`), `${javaDir}config/LocaleConfiguration.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/LoggingAspectConfiguration.kt.ejs`), `${javaDir}config/LoggingAspectConfiguration.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/MetricsConfiguration.java.ejs`), `${javaDir}config/MetricsConfiguration.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/ThymeleafConfiguration.java.ejs`), `${javaDir}config/ThymeleafConfiguration.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/WebConfigurer.java.ejs`), `${javaDir}config/WebConfigurer.java`);
            if (this.websocket === 'spring-websocket') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/WebsocketConfiguration.java.ejs`), `${javaDir}config/WebsocketConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/WebsocketSecurityConfiguration.java.ejs`), `${javaDir}config/WebsocketSecurityConfiguration.java`);
            }

            if (this.databaseType === 'cassandra') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/metrics/package-info.java.ejs`), `${javaDir}config/metrics/package-info.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/metrics/JHipsterHealthIndicatorConfiguration.java.ejs`), `${javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/metrics/CassandraHealthIndicator.java.ejs`), `${javaDir}config/metrics/CassandraHealthIndicator.java`);
            }

            if (this.databaseType === 'cassandra') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/cassandra/CassandraConfiguration.java.ejs`), `${javaDir}config/cassandra/CassandraConfiguration.java`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/cassandra/package-info.java.ejs`), `${javaDir}config/cassandra/package-info.java`);
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/ElasticsearchConfiguration.java.ejs`), `${javaDir}config/ElasticsearchConfiguration.java`);
            }
            if (this.messageBroker === 'kafka') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/config/MessagingConfiguration.java.ejs`), `${javaDir}config/MessagingConfiguration.java`);
            }
        },

        writeServerJavaDomainFiles() {
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/package-info.java.ejs`), `${javaDir}domain/package-info.java`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/AbstractAuditingEntity.kt.ejs`), `${javaDir}domain/AbstractAuditingEntity.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/PersistentAuditEvent.kt.ejs`), `${javaDir}domain/PersistentAuditEvent.kt`);
            }
        },

        writeServerJavaPackageInfoFiles() {
            if (this.searchEngine === 'elasticsearch') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/search/package-info.java.ejs`), `${javaDir}repository/search/package-info.java`);
            }
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/package-info.java.ejs`), `${javaDir}repository/package-info.java`);
        },

        writeServerJavaServiceFiles() {
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/package-info.java.ejs`), `${javaDir}service/package-info.java`);

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/util/RandomUtil.kt.ejs`), `${javaDir}service/util/RandomUtil.kt`);
        },

        writeServerJavaWebErrorFiles() {
            // error handler code - server side
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/package-info.java.ejs`), `${javaDir}web/rest/errors/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/InternalServerErrorException.java.ejs`), `${javaDir}web/rest/errors/InternalServerErrorException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/BadRequestAlertException.java.ejs`), `${javaDir}web/rest/errors/BadRequestAlertException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/CustomParameterizedException.java.ejs`), `${javaDir}web/rest/errors/CustomParameterizedException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/EmailAlreadyUsedException.java.ejs`), `${javaDir}web/rest/errors/EmailAlreadyUsedException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/EmailNotFoundException.java.ejs`), `${javaDir}web/rest/errors/EmailNotFoundException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/ErrorConstants.java.ejs`), `${javaDir}web/rest/errors/ErrorConstants.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/ExceptionTranslator.java.ejs`), `${javaDir}web/rest/errors/ExceptionTranslator.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/FieldErrorVM.java.ejs`), `${javaDir}web/rest/errors/FieldErrorVM.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/InvalidPasswordException.java.ejs`), `${javaDir}web/rest/errors/InvalidPasswordException.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/LoginAlreadyUsedException.java.ejs`), `${javaDir}web/rest/errors/LoginAlreadyUsedException.java`);
        },

        writeServerJavaWebFiles() {
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/package-info.java.ejs`), `${javaDir}web/rest/vm/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/LoggerVM.java.ejs`), `${javaDir}web/rest/vm/LoggerVM.java`);

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/util/HeaderUtil.java.ejs`), `${javaDir}web/rest/util/HeaderUtil.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/util/PaginationUtil.java.ejs`), `${javaDir}web/rest/util/PaginationUtil.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/package-info.java.ejs`), `${javaDir}web/rest/package-info.java`);

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/LogsResource.kt.ejs`), `${javaDir}web/rest/LogsResource.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/ProfileInfoResource.kt.ejs`), `${javaDir}web/rest/ProfileInfoResource.kt`);
        },

        writeServerJavaWebsocketFiles() {
            if (this.websocket !== 'spring-websocket') return;

            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/websocket/package-info.java.ejs`), `${javaDir}web/websocket/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/websocket/ActivityService.java.ejs`), `${javaDir}web/websocket/ActivityService.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/websocket/dto/package-info.java.ejs`), `${javaDir}web/websocket/dto/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/websocket/dto/ActivityDTO.java.ejs`), `${javaDir}web/websocket/dto/ActivityDTO.java`);
        },

        writeServerTestFwFiles() {
            // Create Test Java files
            const testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType === 'cassandra') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/CassandraKeyspaceUnitTest.java.ejs`), `${testDir}CassandraKeyspaceUnitTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/AbstractCassandraTest.java.ejs`), `${testDir}AbstractCassandraTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/config/CassandraTestConfiguration.java.ejs`), `${testDir}config/CassandraTestConfiguration.java`);
                this.template(rewriteDir(`${SERVER_TEST_RES_DIR}cassandra-random-port.yml.ejs`), `${SERVER_TEST_RES_DIR}cassandra-random-port.yml`);
            }

            if (this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/config/DatabaseTestConfiguration.java.ejs`), `${testDir}config/DatabaseTestConfiguration.java`);
            }

            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/config/WebConfigurerTest.java.ejs`), `${testDir}config/WebConfigurerTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/config/WebConfigurerTestController.java.ejs`), `${testDir}config/WebConfigurerTestController.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/TestUtil.java.ejs`), `${testDir}web/rest/TestUtil.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/LogsResourceIntTest.java.ejs`), `${testDir}web/rest/LogsResourceIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/ProfileInfoResourceIntTest.java.ejs`), `${testDir}web/rest/ProfileInfoResourceIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/errors/ExceptionTranslatorIntTest.java.ejs`), `${testDir}web/rest/errors/ExceptionTranslatorIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/errors/ExceptionTranslatorTestController.java.ejs`), `${testDir}web/rest/errors/ExceptionTranslatorTestController.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/util/PaginationUtilUnitTest.java.ejs`), `${testDir}web/rest/util/PaginationUtilUnitTest.java`);

            this.template(rewriteDir(`${SERVER_TEST_RES_DIR}config/application.yml.ejs`), `${SERVER_TEST_RES_DIR}config/application.yml`);
            this.template(rewriteDir(`${SERVER_TEST_RES_DIR}logback.xml.ejs`), `${SERVER_TEST_RES_DIR}logback.xml`);

            // Create Gateway tests files
            if (this.applicationType === 'gateway') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java.ejs`), `${testDir}gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java`);
            }
            if (this.serviceDiscoveryType) {
                this.template(rewriteDir(`${SERVER_TEST_RES_DIR}config/bootstrap.yml.ejs`), `${SERVER_TEST_RES_DIR}config/bootstrap.yml`);
            }

            if (this.authenticationType === 'uaa') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/OAuth2TokenMockUtil.java.ejs`), `${testDir}security/OAuth2TokenMockUtil.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/config/SecurityBeanOverrideConfiguration.java.ejs`), `${testDir}config/SecurityBeanOverrideConfiguration.java`);
                if (this.applicationType === 'gateway') {
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/oauth2/OAuth2CookieHelperTest.java.ejs`), `${testDir}security/oauth2/OAuth2CookieHelperTest.java`);
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/oauth2/OAuth2AuthenticationServiceTest.java.ejs`), `${testDir}security/oauth2/OAuth2AuthenticationServiceTest.java`);
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/oauth2/CookieTokenExtractorTest.java.ejs`), `${testDir}security/oauth2/CookieTokenExtractorTest.java`);
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/oauth2/CookieCollectionTest.java.ejs`), `${testDir}security/oauth2/CookieCollectionTest.java`);
                }
            }

            // Create Gatling test files
            if (this.gatlingTests) {
                this.copy(rewriteDir(`${TEST_DIR}gatling/conf/gatling.conf.ejs`), `${TEST_DIR}gatling/conf/gatling.conf`);
                this.copy(rewriteDir(`${TEST_DIR}gatling/conf/logback.xml.ejs`), `${TEST_DIR}gatling/conf/logback.xml`);
                mkdirp(`${TEST_DIR}gatling/user-files/data`);
                mkdirp(`${TEST_DIR}gatling/user-files/bodies`);
                mkdirp(`${TEST_DIR}gatling/user-files/simulations`);
            }

            // Create Cucumber test files
            if (this.cucumberTests) {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/cucumber/CucumberTest.java.ejs`), `${testDir}cucumber/CucumberTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/cucumber/stepdefs/StepDefs.java.ejs`), `${testDir}cucumber/stepdefs/StepDefs.java`);
                this.copy(rewriteDir(`${TEST_DIR}features/gitkeep`), `${TEST_DIR}features/.gitkeep`);
            }

            // Create auth config test files
            if (this.applicationType === 'monolith' && this.authenticationType !== 'oauth2') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/DomainUserDetailsServiceIntTest.java.ejs`), `${testDir}security/DomainUserDetailsServiceIntTest.java`);
            }
        },

        writeJavaUserManagementFiles() {
            const testDir = this.testDir;

            if (this.skipUserManagement) {
                if (this.authenticationType === 'oauth2') {
                    if (this.databaseType === 'sql') {
                        this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv`);
                        this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv`);
                    }
                    this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/AccountResource.kt.ejs`), `${javaDir}web/rest/AccountResource.kt`);
                    this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/User.kt.ejs`), `${javaDir}domain/User.kt`);
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/AccountResourceIntTest.java.ejs`), `${testDir}web/rest/AccountResourceIntTest.java`);
                    this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/SecurityUtilsUnitTest.java.ejs`), `${testDir}security/SecurityUtilsUnitTest.java`);

                    if (this.applicationType === 'monolith') {
                        this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/users.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/users.csv`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/Authority.kt.ejs`), `${javaDir}domain/Authority.kt`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/UserService.kt.ejs`), `${javaDir}service/UserService.kt`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/package-info.java.ejs`), `${javaDir}service/dto/package-info.java`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/UserDTO.java.ejs`), `${javaDir}service/dto/UserDTO.java`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/PasswordChangeDTO.java.ejs`), `${javaDir}service/dto/PasswordChangeDTO.java`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/mapper/package-info.java.ejs`), `${javaDir}service/mapper/package-info.java`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/mapper/UserMapper.kt.ejs`), `${javaDir}service/mapper/UserMapper.kt`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/UserRepository.kt.ejs`), `${javaDir}repository/UserRepository.kt`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/AuthorityRepository.kt.ejs`), `${javaDir}repository/AuthorityRepository.kt`);
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/UserResource.kt.ejs`), `${javaDir}web/rest/UserResource.kt`);
                        if (this.searchEngine === 'elasticsearch') {
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/search/UserSearchRepository.java.ejs`), `${javaDir}repository/search/UserSearchRepository.java`);
                        }
                        this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/ManagedUserVM.java.ejs`), `${javaDir}web/rest/vm/ManagedUserVM.java`);
                        this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/service/UserServiceIntTest.java.ejs`), `${testDir}service/UserServiceIntTest.java`);
                        this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/UserResourceIntTest.java.ejs`), `${testDir}web/rest/UserResourceIntTest.java`);

                        if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/CustomAuditEventRepository.kt.ejs`), `${javaDir}repository/CustomAuditEventRepository.kt`);
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/AuthorityRepository.kt.ejs`), `${javaDir}repository/AuthorityRepository.kt`);
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/PersistenceAuditEventRepository.kt.ejs`), `${javaDir}repository/PersistenceAuditEventRepository.kt`);
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/AuditEventService.kt.ejs`), `${javaDir}service/AuditEventService.kt`);
                            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/AuditResource.kt.ejs`), `${javaDir}web/rest/AuditResource.kt`);
                            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/repository/CustomAuditEventRepositoryIntTest.kt.ejs`), `${testDir}repository/CustomAuditEventRepositoryIntTest.kt`);
                            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/AuditResourceIntTest.java.ejs`), `${testDir}web/rest/AuditResourceIntTest.java`);
                        }
                    }
                }
                return;
            }

            /* User management resources files */
            if (this.databaseType === 'sql') {
                this.template(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/users.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/users.csv`);
                this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv`);
                this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv.ejs`), `${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv`);
            }

            // Email templates
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}mails/activationEmail.html.ejs`), `${SERVER_MAIN_RES_DIR}mails/activationEmail.html`);
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}mails/creationEmail.html.ejs`), `${SERVER_MAIN_RES_DIR}mails/creationEmail.html`);
            this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}mails/passwordResetEmail.html.ejs`), `${SERVER_MAIN_RES_DIR}mails/passwordResetEmail.html`);
            if (this.enableSocialSignIn) {
                this.copy(rewriteDir(`${SERVER_MAIN_RES_DIR}mails/socialRegistrationValidationEmail.html.ejs`), `${SERVER_MAIN_RES_DIR}mails/socialRegistrationValidationEmail.html`);
            }

            /* User management java domain files */
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/User.kt.ejs`), `${javaDir}domain/User.kt`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/domain/Authority.kt.ejs`), `${javaDir}domain/Authority.kt`);
            }

            /* User management java repo files */
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/CustomAuditEventRepository.kt.ejs`), `${javaDir}repository/CustomAuditEventRepository.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/AuthorityRepository.kt.ejs`), `${javaDir}repository/AuthorityRepository.kt`);
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/PersistenceAuditEventRepository.kt.ejs`), `${javaDir}repository/PersistenceAuditEventRepository.kt`);
            }
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/UserRepository.kt.ejs`), `${javaDir}repository/UserRepository.kt`);

            /* User management java service files */
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/UserService.kt.ejs`), `${javaDir}service/UserService.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/MailService.kt.ejs`), `${javaDir}service/MailService.kt`);
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/AuditEventService.kt.ejs`), `${javaDir}service/AuditEventService.kt`);
            }

            /* User management java web files */
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/package-info.java.ejs`), `${javaDir}service/dto/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/UserDTO.java.ejs`), `${javaDir}service/dto/UserDTO.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/dto/PasswordChangeDTO.java.ejs`), `${javaDir}service/dto/PasswordChangeDTO.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/ManagedUserVM.java.ejs`), `${javaDir}web/rest/vm/ManagedUserVM.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/AccountResource.kt.ejs`), `${javaDir}web/rest/AccountResource.kt`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/UserResource.kt.ejs`), `${javaDir}web/rest/UserResource.kt`);
            if (this.searchEngine === 'elasticsearch') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/repository/search/UserSearchRepository.java.ejs`), `${javaDir}repository/search/UserSearchRepository.java`);
            }
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/KeyAndPasswordVM.java.ejs`), `${javaDir}web/rest/vm/KeyAndPasswordVM.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/mapper/package-info.java.ejs`), `${javaDir}service/mapper/package-info.java`);
            this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/service/mapper/UserMapper.kt.ejs`), `${javaDir}service/mapper/UserMapper.kt`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_MAIN_SRC_DIR}package/web/rest/AuditResource.kt.ejs`), `${javaDir}web/rest/AuditResource.kt`);
            }

            /* User management java test files */
            this.copy(rewriteDir(`${SERVER_TEST_RES_DIR}mails/testEmail.html.ejs`), `${SERVER_TEST_RES_DIR}mails/testEmail.html`);
            this.copy(rewriteDir(`${SERVER_TEST_RES_DIR}i18n/messages_en.properties.ejs`), `${SERVER_TEST_RES_DIR}i18n/messages_en.properties`);

            if (this.searchEngine === 'elasticsearch') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/repository/search/UserSearchRepositoryMockConfiguration.java.ejs`), `${testDir}repository/search/UserSearchRepositoryMockConfiguration.java`);
            }
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/service/MailServiceIntTest.java.ejs`), `${testDir}service/MailServiceIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/service/UserServiceIntTest.java.ejs`), `${testDir}service/UserServiceIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/UserResourceIntTest.java.ejs`), `${testDir}web/rest/UserResourceIntTest.java`);

            if (this.enableSocialSignIn) {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/repository/CustomSocialUsersConnectionRepositoryIntTest.java.ejs`), `${testDir}repository/CustomSocialUsersConnectionRepositoryIntTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/service/SocialServiceIntTest.java.ejs`), `${testDir}service/SocialServiceIntTest.java`);
            }

            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/AccountResourceIntTest.java.ejs`), `${testDir}web/rest/AccountResourceIntTest.java`);
            this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/SecurityUtilsUnitTest.java.ejs`), `${testDir}security/SecurityUtilsUnitTest.java`);
            if (this.authenticationType === 'jwt') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/jwt/JWTFilterTest.java.ejs`), `${testDir}security/jwt/JWTFilterTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/security/jwt/TokenProviderTest.java.ejs`), `${testDir}security/jwt/TokenProviderTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/UserJWTControllerIntTest.java.ejs`), `${testDir}web/rest/UserJWTControllerIntTest.java`);
            }

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb' || this.databaseType === 'couchbase') {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/repository/CustomAuditEventRepositoryIntTest.java.ejs`), `${testDir}repository/CustomAuditEventRepositoryIntTest.java`);
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/web/rest/AuditResourceIntTest.java.ejs`), `${testDir}web/rest/AuditResourceIntTest.java`);
            }
            // Cucumber user management tests
            if (this.cucumberTests) {
                this.template(rewriteDir(`${SERVER_TEST_SRC_DIR}package/cucumber/stepdefs/UserStepDefs.java.ejs`), `${testDir}cucumber/stepdefs/UserStepDefs.java`);
                this.copy(rewriteDir('src/test/features/user/user.feature.ejs'), 'src/test/features/user/user.feature');
            }
        }
    };
}
