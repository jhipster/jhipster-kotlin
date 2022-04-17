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
// const fs = require('fs');
const serverCleanup = require('generator-jhipster/generators/cleanup');
const {
    INTERPOLATE_REGEX,
    MAIN_DIR,
    TEST_DIR,
    DOCKER_DIR,
    SERVER_MAIN_RES_DIR,
    SERVER_TEST_RES_DIR,
    SUPPORTED_CLIENT_FRAMEWORKS,
} = require('generator-jhipster/generators/generator-constants');
const cheerio = require('cheerio');

const { GATEWAY, MICROSERVICE, MONOLITH } = require('generator-jhipster/jdl/jhipster/application-types');
const { JWT, OAUTH2, SESSION } = require('generator-jhipster/jdl/jhipster/authentication-types');
const { GRADLE, MAVEN } = require('generator-jhipster/jdl/jhipster/build-tool-types');
const { ELASTICSEARCH } = require('generator-jhipster/jdl/jhipster/search-engine-types');
const { SPRING_WEBSOCKET } = require('generator-jhipster/jdl/jhipster/websocket-types');
const databaseTypes = require('generator-jhipster/jdl/jhipster/database-types');
const { COUCHBASE, MONGODB, NEO4J, SQL, MARIADB } = require('generator-jhipster/jdl/jhipster/database-types');
const { CAFFEINE, EHCACHE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS } = require('generator-jhipster/jdl/jhipster/cache-types');
const { KAFKA } = require('generator-jhipster/jdl/jhipster/message-broker-types');
const { CONSUL, EUREKA } = require('generator-jhipster/jdl/jhipster/service-discovery-types');
const { addSectionsCondition, mergeSections } = require('generator-jhipster/generators/utils');
const kotlinConstants = require('../generator-kotlin-constants');
const { writeCouchbaseFiles } = require('./files-couchbase');
const { writeSqlFiles } = require('./files-sql');
// const { addSectionsCondition, mergeSections } = require('generator-jhipster/generators/utils');

/* Constants use throughout */
const NO_DATABASE = databaseTypes.NO;
const SERVER_MAIN_KOTLIN_SRC_DIR = `${MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_KOTLIN_DIR = `${TEST_DIR}kotlin/`;
const { REACT, VUE } = SUPPORTED_CLIENT_FRAMEWORKS;

// TODO: Do a PR in the parent JHipster project to export and re-use here as well in order to have a single source of truth!!!
const shouldSkipUserManagement = generator =>
    generator.skipUserManagement && (generator.applicationType !== MONOLITH || generator.authenticationType !== OAUTH2);

const h2Files = {
    serverResource: [
        {
            condition: generator => generator.devDatabaseTypeH2Any,
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'h2.server.properties', renameTo: () => '.h2.server.properties' }],
        },
    ],
};

const liquibaseFiles = {
    serverResource: [
        {
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    override: generator =>
                        !generator.jhipsterConfig.incrementalChangelog || generator.configOptions.recreateInitialChangelog,
                    file: 'config/liquibase/changelog/initial_schema.xml',
                    renameTo: () => 'config/liquibase/changelog/00000000000000_initial_schema.xml',
                    options: { interpolate: INTERPOLATE_REGEX },
                },
                {
                    override: generator =>
                        !generator.jhipsterConfig.incrementalChangelog || generator.configOptions.recreateInitialChangelog,
                    file: 'config/liquibase/master.xml',
                },
            ],
        },
    ],
};

const mongoDbFiles = {
    docker: [
        {
            path: DOCKER_DIR,
            templates: ['mongodb.yml', 'mongodb-cluster.yml', 'mongodb/MongoDB.Dockerfile', 'mongodb/scripts/init_replicaset.js'],
        },
    ],
    serverResource: [
        {
            condition: generator =>
                !generator.skipUserManagement || (generator.skipUserManagement && generator.authenticationType === OAUTH2),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/dbmigrations/InitialSetupMigration.kt',
                    renameTo: generator => `${generator.javaDir}config/dbmigrations/InitialSetupMigration.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/MongoDbTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/MongoDbTestContainer.kt`,
                },
                {
                    file: 'package/config/EmbeddedMongo.kt',
                    renameTo: generator => `${generator.testDir}config/EmbeddedMongo.kt`,
                },
                {
                    file: 'package/config/TestContainersSpringContextCustomizerFactory.kt',
                    renameTo: generator => `${generator.testDir}config/TestContainersSpringContextCustomizerFactory.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: [
                {
                    file: 'META-INF/spring.factories',
                },
                {
                    file: 'testcontainers.properties',
                },
            ],
        },
    ],
};

const neo4jFiles = {
    docker: [
        {
            path: DOCKER_DIR,
            templates: ['neo4j.yml'],
        },
    ],
    serverResource: [
        {
            condition: generator => !generator.skipUserManagement || generator.authenticationType === OAUTH2,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/neo4j/Neo4jMigrations.kt',
                    renameTo: generator => `${generator.javaDir}config/neo4j/Neo4jMigrations.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement || generator.authenticationType === OAUTH2,
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/neo4j/migrations/user__admin.json', 'config/neo4j/migrations/user__user.json'],
        },
    ],
    serverTestFw: [
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/AbstractNeo4jIT.kt',
                    renameTo: generator => `${generator.testDir}/AbstractNeo4jIT.kt`,
                },
            ],
        },
    ],
};

const cassandraFiles = {
    docker: [
        {
            path: DOCKER_DIR,
            templates: [
                // docker-compose files
                'cassandra.yml',
                'cassandra-cluster.yml',
                'cassandra-migration.yml',
                // dockerfiles
                'cassandra/Cassandra-Migration.Dockerfile',
                // scripts
                'cassandra/scripts/autoMigrate.sh',
                'cassandra/scripts/execute-cql.sh',
            ],
        },
    ],
    serverResource: [
        {
            path: SERVER_MAIN_RES_DIR,
            templates: [
                'config/cql/create-keyspace-prod.cql',
                'config/cql/create-keyspace.cql',
                'config/cql/drop-keyspace.cql',
                { file: 'config/cql/changelog/README.md', method: 'copy' },
            ],
        },
        {
            condition: generator =>
                generator.applicationType !== MICROSERVICE && (!generator.skipUserManagement || generator.authenticationType === OAUTH2),
            path: SERVER_MAIN_RES_DIR,
            templates: [
                { file: 'config/cql/changelog/create-tables.cql', renameTo: () => 'config/cql/changelog/00000000000000_create-tables.cql' },
                {
                    file: 'config/cql/changelog/insert_default_users.cql',
                    renameTo: () => 'config/cql/changelog/00000000000001_insert_default_users.cql',
                },
            ],
        },
    ],
    serverTestFw: [
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/CassandraKeyspaceIT.kt',
                    renameTo: generator => `${generator.testDir}CassandraKeyspaceIT.kt`,
                },
                {
                    file: 'package/config/CassandraTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/CassandraTestContainer.kt`,
                },
                {
                    file: 'package/config/EmbeddedCassandra.kt',
                    renameTo: generator => `${generator.testDir}config/EmbeddedCassandra.kt`,
                },
                {
                    file: 'package/config/TestContainersSpringContextCustomizerFactory.kt',
                    renameTo: generator => `${generator.testDir}config/TestContainersSpringContextCustomizerFactory.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: [
                {
                    file: 'META-INF/spring.factories',
                },
                {
                    file: 'testcontainers.properties',
                },
            ],
        },
    ],
};

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const baseServerFiles = {
    jib: [
        {
            path: 'src/main/docker/jib/',
            templates: ['entrypoint.sh'],
        },
    ],
    packageJson: [
        {
            condition: generator => generator.skipClient,
            templates: ['package.json'],
        },
    ],
    docker: [
        {
            path: DOCKER_DIR,
            templates: [
                'app.yml',
                'jhipster-control-center.yml',
                'sonar.yml',
                'monitoring.yml',
                'prometheus/prometheus.yml',
                'grafana/provisioning/dashboards/dashboard.yml',
                'grafana/provisioning/dashboards/JVM.json',
                'grafana/provisioning/datasources/datasource.yml',
            ],
        },
        {
            condition: generator => generator.databaseTypeSql && !generator.prodDatabaseTypeOracle,
            path: DOCKER_DIR,
            templates: [{ file: generator => `${generator.prodDatabaseType}.yml` }],
        },
        {
            condition: generator => generator.cacheProvider === HAZELCAST,
            path: DOCKER_DIR,
            templates: ['hazelcast-management-center.yml'],
        },
        {
            condition: generator => generator.cacheProvider === MEMCACHED,
            path: DOCKER_DIR,
            templates: ['memcached.yml'],
        },
        {
            condition: generator => generator.cacheProvider === REDIS,
            path: DOCKER_DIR,
            templates: ['redis.yml', 'redis-cluster.yml', 'redis/Redis-Cluster.Dockerfile', 'redis/connectRedisCluster.sh'],
        },
        {
            condition: generator => generator.searchEngine === ELASTICSEARCH,
            path: DOCKER_DIR,
            templates: ['elasticsearch.yml'],
        },
        {
            condition: generator => generator.messageBroker === KAFKA,
            path: DOCKER_DIR,
            templates: ['kafka.yml'],
        },
        {
            condition: generator => !!generator.serviceDiscoveryType,
            path: DOCKER_DIR,
            templates: [{ file: 'config/README.md', renameTo: () => 'central-server-config/README.md' }],
        },
        {
            condition: generator => generator.serviceDiscoveryType && generator.serviceDiscoveryType === CONSUL,
            path: DOCKER_DIR,
            templates: [
                'consul.yml',
                { file: 'config/git2consul.json', method: 'copy' },
                { file: 'config/consul-config/application.yml', renameTo: () => 'central-server-config/application.yml' },
            ],
        },
        {
            condition: generator => generator.serviceDiscoveryType && generator.serviceDiscoveryType === EUREKA,
            path: DOCKER_DIR,
            templates: [
                'jhipster-registry.yml',
                {
                    file: 'config/docker-config/application.yml',
                    renameTo: () => 'central-server-config/docker-config/application.yml',
                },
                {
                    file: 'config/localhost-config/application.yml',
                    renameTo: () => 'central-server-config/localhost-config/application.yml',
                },
            ],
        },
        {
            condition: generator => !!generator.enableSwaggerCodegen,
            path: DOCKER_DIR,
            templates: ['swagger-editor.yml'],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2 && generator.applicationType !== MICROSERVICE,
            path: DOCKER_DIR,
            templates: [
                'keycloak.yml',
                { file: 'config/realm-config/jhipster-realm.json', renameTo: () => 'realm-config/jhipster-realm.json' },
                { file: 'config/realm-config/jhipster-users-0.json', method: 'copy', renameTo: () => 'realm-config/jhipster-users-0.json' },
            ],
        },
        {
            condition: generator =>
                generator.serviceDiscoveryType || generator.applicationTypeGateway || generator.applicationTypeMicroservice,
            path: DOCKER_DIR,
            templates: ['zipkin.yml'],
        },
    ],
    serverBuild: [
        {
            templates: [
                { file: 'checkstyle.xml', options: { interpolate: INTERPOLATE_REGEX } },
                { file: 'devcontainer/devcontainer.json', renameTo: () => '.devcontainer/devcontainer.json' },
                { file: 'devcontainer/Dockerfile', renameTo: () => '.devcontainer/Dockerfile' },
            ],
        },
        {
            condition: generator => generator.buildTool === GRADLE,
            templates: [
                'build.gradle',
                'settings.gradle',
                'gradle.properties',
                'gradle/sonar.gradle',
                'gradle/docker.gradle',
                { file: 'gradle/profile_dev.gradle', options: { interpolate: INTERPOLATE_REGEX } },
                { file: 'gradle/profile_prod.gradle', options: { interpolate: INTERPOLATE_REGEX } },
                'gradle/war.gradle',
                'gradle/zipkin.gradle',
                { file: 'gradlew', method: 'copy', noEjs: true },
                { file: 'gradlew.bat', method: 'copy', noEjs: true },
                { file: 'gradle/wrapper/gradle-wrapper.jar', method: 'copy', noEjs: true },
                'gradle/wrapper/gradle-wrapper.properties',
            ],
        },
        {
            condition: generator => generator.buildTool === GRADLE && !!generator.enableSwaggerCodegen,
            templates: ['gradle/swagger.gradle'],
        },
        {
            condition: generator => generator.buildTool === MAVEN,
            templates: [
                { file: 'mvnw', method: 'copy', noEjs: true },
                { file: 'mvnw.cmd', method: 'copy', noEjs: true },
                { file: '.mvn/jvm.config', method: 'copy', noEjs: true },
                { file: '.mvn/wrapper/maven-wrapper.jar', method: 'copy', noEjs: true },
                { file: '.mvn/wrapper/maven-wrapper.properties', method: 'copy', noEjs: true },
                { file: 'pom.xml', options: { interpolate: INTERPOLATE_REGEX } },
            ],
        },
        {
            condition: generator => !generator.skipClient,
            templates: [
                { file: 'npmw', method: 'copy', noEjs: true },
                { file: 'npmw.cmd', method: 'copy', noEjs: true },
            ],
        },
        {
            condition: generator => generator.buildTool === GRADLE,
            templates: [{ file: 'gradle/kotlin.gradle' }],
        },
        {
            templates: [{ file: `${kotlinConstants.DETEKT_CONFIG_FILE}` }],
        },
    ],
    serverResource: [
        {
            condition: generator => generator.clientFramework === REACT,
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    file: 'banner-react.txt',
                    method: 'copy',
                    noEjs: true,
                    renameTo: () => 'banner.txt',
                },
            ],
        },
        {
            condition: generator => generator.clientFramework === VUE,
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    file: 'banner-vue.txt',
                    method: 'copy',
                    noEjs: true,
                    renameTo: () => 'banner.txt',
                },
            ],
        },
        {
            condition: generator => generator.clientFramework !== REACT && generator.clientFramework !== VUE,
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'banner.txt', method: 'copy', noEjs: true }],
        },
        {
            condition: generator => !!generator.enableSwaggerCodegen,
            path: SERVER_MAIN_RES_DIR,
            templates: ['swagger/api.yml'],
        },
        {
            path: SERVER_MAIN_RES_DIR,
            templates: [
                // Thymeleaf templates
                { file: 'templates/error.html', method: 'copy' },
                'logback-spring.xml',
                'config/application.yml',
                'config/application-dev.yml',
                'config/application-tls.yml',
                'config/application-prod.yml',
                'i18n/messages.properties',
            ],
        },
    ],
    serverJavaAuthConfig: [
        {
            condition: generator =>
                !generator.reactive &&
                (generator.databaseType === SQL || generator.databaseType === MONGODB || generator.databaseType === COUCHBASE),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/SpringSecurityAuditorAware.kt',
                    renameTo: generator => `${generator.javaDir}security/SpringSecurityAuditorAware.kt`,
                },
            ],
        },
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/SecurityUtils.kt',
                    renameTo: generator => `${generator.javaDir}security/SecurityUtils.kt`,
                },
                {
                    file: 'package/security/AuthoritiesConstants.kt',
                    renameTo: generator => `${generator.javaDir}security/AuthoritiesConstants.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/security/SecurityUtilsUnitTest.kt',
                    renameTo: generator => `${generator.testDir}security/SecurityUtilsUnitTest.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/security/SecurityUtilsUnitTest_reactive.kt',
                    renameTo: generator => `${generator.testDir}security/SecurityUtilsUnitTest.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === JWT,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/jwt/TokenProvider.kt',
                    renameTo: generator => `${generator.javaDir}security/jwt/TokenProvider.kt`,
                },
                {
                    file: 'package/security/jwt/JWTFilter.kt',
                    renameTo: generator => `${generator.javaDir}security/jwt/JWTFilter.kt`,
                },
                {
                    file: 'package/management/SecurityMetersService.kt',
                    renameTo: generator => `${generator.javaDir}management/SecurityMetersService.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === JWT && !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/jwt/JWTConfigurer.kt',
                    renameTo: generator => `${generator.javaDir}security/jwt/JWTConfigurer.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive && generator.applicationType === GATEWAY && generator.authenticationType === JWT,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/jwt/JWTRelayGatewayFilterFactory.kt',
                    renameTo: generator => `${generator.testDir}security/jwt/JWTRelayGatewayFilterFactory.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/SecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/SecurityConfiguration_reactive.kt',
                    renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === SESSION && !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/PersistentTokenRememberMeServices.kt',
                    renameTo: generator => `${generator.javaDir}security/PersistentTokenRememberMeServices.kt`,
                },
                {
                    file: 'package/domain/PersistentToken.kt',
                    renameTo: generator => `${generator.javaDir}domain/PersistentToken.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !shouldSkipUserManagement(generator) &&
                generator.authenticationType === SESSION &&
                !generator.reactive &&
                generator.databaseType !== COUCHBASE,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/PersistentTokenRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/AudienceValidator.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/AudienceValidator.kt`,
                },
                {
                    file: 'package/security/oauth2/JwtGrantedAuthorityConverter.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/JwtGrantedAuthorityConverter.kt`,
                },
                {
                    file: 'package/security/oauth2/OAuthIdpTokenResponseDTO.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuthIdpTokenResponseDTO.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/AudienceValidatorTest.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/AudienceValidatorTest.kt`,
                },
                {
                    file: 'package/config/TestSecurityConfiguration.kt',
                    renameTo: generator => `${generator.testDir}config/TestSecurityConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.reactive &&
                generator.authenticationType === OAUTH2 &&
                (generator.applicationType === MICROSERVICE || generator.applicationType === GATEWAY),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/AuthorizationHeaderUtilTest.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/AuthorizationHeaderUtilTest.kt`,
                },
            ],
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== OAUTH2,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/DomainUserDetailsService.kt',
                    renameTo: generator => `${generator.javaDir}security/DomainUserDetailsService.kt`,
                },
                {
                    file: 'package/security/UserNotActivatedException.kt',
                    renameTo: generator => `${generator.javaDir}security/UserNotActivatedException.kt`,
                },
            ],
        },
        {
            condition: generator => generator.applicationType !== MICROSERVICE && generator.authenticationType === JWT,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/vm/LoginVM.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/vm/LoginVM.kt`,
                },
                {
                    file: 'package/web/rest/UserJWTController.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/UserJWTController.kt`,
                },
            ],
        },
        {
            condition: generator => !!generator.enableSwaggerCodegen,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/OpenApiConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/OpenApiConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.reactive && generator.authenticationType === OAUTH2 && generator.applicationType === MONOLITH,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/CustomClaimConverter.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CustomClaimConverter.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.reactive && generator.authenticationType === OAUTH2 && generator.applicationType === MONOLITH,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/CustomClaimConverterIT.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CustomClaimConverterIT.kt`,
                },
            ],
        },
    ],
    serverJavaGateway: [
        {
            condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryType,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                { file: 'package/web/rest/vm/RouteVM.kt', renameTo: generator => `${generator.javaDir}web/rest/vm/RouteVM.kt` },
                {
                    file: 'package/web/rest/GatewayResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/GatewayResource.kt`,
                },
            ],
        },
        {
            condition: generator =>
                generator.authenticationType === OAUTH2 &&
                (generator.applicationType === MONOLITH || generator.applicationType === GATEWAY),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/AuthInfoResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/AuthInfoResource.kt`,
                },
            ],
        },
        {
            condition: generator =>
                generator.authenticationType === OAUTH2 &&
                !generator.reactive &&
                (generator.applicationType === MONOLITH || generator.applicationType === GATEWAY),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/LogoutResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/LogoutResource.kt`,
                },
            ],
        },
        {
            condition: generator =>
                generator.authenticationType === OAUTH2 &&
                generator.reactive &&
                (generator.applicationType === MONOLITH || generator.applicationType === GATEWAY),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/LogoutResource_reactive.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/LogoutResource.kt`,
                },
            ],
        },
        {
            condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryType && generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/filter/ModifyServersOpenApiFilter.kt',
                    renameTo: generator => `${generator.javaDir}web/filter/ModifyServersOpenApiFilter.kt`,
                },
            ],
        },
        {
            condition: generator => generator.applicationType === GATEWAY && generator.serviceDiscoveryType && generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/filter/ModifyServersOpenApiFilterTest.kt',
                    renameTo: generator => `${generator.testDir}web/filter/ModifyServersOpenApiFilterTest.kt`,
                },
            ],
        },
    ],
    serverMicroservice: [
        {
            condition: generator =>
                !generator.reactive &&
                (generator.applicationType === MICROSERVICE || generator.applicationType === GATEWAY) &&
                generator.authenticationType === JWT,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/FeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/FeignConfiguration.kt`,
                },
                {
                    file: 'package/client/JWT_UserFeignClientInterceptor.kt',
                    renameTo: generator => `${generator.javaDir}client/UserFeignClientInterceptor.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.reactive &&
                generator.authenticationType === OAUTH2 &&
                (generator.applicationType === MICROSERVICE || generator.applicationType === GATEWAY),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/AuthorizationHeaderUtil.kt',
                    renameTo: generator => `${generator.javaDir}security/oauth2/AuthorizationHeaderUtil.kt`,
                },
                {
                    file: 'package/config/FeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/FeignConfiguration.kt`,
                },
                {
                    file: 'package/client/AuthorizedFeignClient.kt',
                    renameTo: generator => `${generator.javaDir}client/AuthorizedFeignClient.kt`,
                },
                {
                    file: 'package/client/OAuth2InterceptedFeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}client/OAuth2InterceptedFeignConfiguration.kt`,
                },
                {
                    file: 'package/client/TokenRelayRequestInterceptor.kt',
                    renameTo: generator => `${generator.javaDir}client/TokenRelayRequestInterceptor.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.reactive && generator.applicationType === GATEWAY && !generator.serviceDiscoveryType,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/RestTemplateConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/RestTemplateConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.applicationType === MICROSERVICE,
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'static/microservices_index.html', renameTo: () => 'static/index.html' }],
        },
    ],
    serverMicroserviceAndGateway: [
        {
            condition: generator => generator.serviceDiscoveryType,
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/bootstrap.yml', 'config/bootstrap-prod.yml'],
        },
    ],
    serverJavaApp: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [{ file: 'package/Application.kt', renameTo: generator => `${generator.javaDir}${generator.mainClass}.kt` }],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [{ file: 'package/ApplicationWebXml.kt', renameTo: generator => `${generator.javaDir}ApplicationWebXml.kt` }],
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/TechnicalStructureTest.kt',
                    renameTo: generator => `${generator.testDir}TechnicalStructureTest.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/IntegrationTest.kt',
                    renameTo: generator => `${generator.testDir}/IntegrationTest.kt`,
                },
            ],
        },
        // {
        //     path: SERVER_MAIN_KOTLIN_SRC_DIR,
        //     templates: [
        //         {
        //             file: 'package/GeneratedByJHipster.kt',
        //             renameTo: generator => `${generator.javaDir}GeneratedByJHipster.kt`,
        //         },
        //     ],
        // },
    ],
    serverJavaConfig: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/aop/logging/LoggingAspect.kt',
                    renameTo: generator => `${generator.javaDir}aop/logging/LoggingAspect.kt`,
                },
                {
                    file: 'package/config/AsyncConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/AsyncConfiguration.kt`,
                },
                {
                    file: 'package/config/DateTimeFormatConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/DateTimeFormatConfiguration.kt`,
                },
                {
                    file: 'package/config/LoggingConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LoggingConfiguration.kt`,
                },
                {
                    file: 'package/config/ApplicationProperties.kt',
                    renameTo: generator => `${generator.javaDir}config/ApplicationProperties.kt`,
                },
                {
                    file: 'package/config/JacksonConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/JacksonConfiguration.kt`,
                },
                {
                    file: 'package/config/LoggingAspectConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LoggingAspectConfiguration.kt`,
                },
                { file: 'package/config/WebConfigurer.kt', renameTo: generator => `${generator.javaDir}config/WebConfigurer.kt` },
            ],
        },
        {
            condition: generator => !generator.skipClient && !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/StaticResourcesWebConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/StaticResourcesWebConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement || [SQL, MONGODB, COUCHBASE, NEO4J].includes(generator.databaseType),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [{ file: 'package/config/Constants.kt', renameTo: generator => `${generator.javaDir}config/Constants.kt` }],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/LocaleConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LocaleConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ReactorConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/ReactorConfiguration.kt`,
                },
                {
                    file: 'package/config/LocaleConfiguration_reactive.kt',
                    renameTo: generator => `${generator.javaDir}config/LocaleConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator =>
                [EHCACHE, CAFFEINE, HAZELCAST, INFINISPAN, MEMCACHED, REDIS].includes(generator.cacheProvider) ||
                generator.applicationType === GATEWAY,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/CacheConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.cacheProvider === INFINISPAN,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheFactoryConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/CacheFactoryConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.cacheProvider === REDIS,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/RedisTestContainerExtension.kt',
                    renameTo: generator => `${generator.testDir}RedisTestContainerExtension.kt`,
                },
            ],
        },
        {
            condition: generator => generator.databaseType !== NO_DATABASE,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: generator => `package/config/DatabaseConfiguration_${generator.databaseType}.kt`,
                    renameTo: generator => `${generator.javaDir}config/DatabaseConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === SQL,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/LiquibaseConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LiquibaseConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === SQL && generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
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
        {
            condition: generator =>
                generator.databaseType === SQL &&
                generator.reactive &&
                (!generator.skipUserManagement || generator.authenticationType === OAUTH2),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/rowmapper/UserRowMapper.kt',
                    renameTo: generator => `${generator.javaDir}repository/rowmapper/UserRowMapper.kt`,
                },
            ],
        },
        {
            condition: generator => generator.websocket === SPRING_WEBSOCKET,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/WebsocketConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/WebsocketConfiguration.kt`,
                },
                {
                    file: 'package/config/WebsocketSecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/WebsocketSecurityConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.searchEngine === ELASTICSEARCH,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ElasticsearchConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/ElasticsearchConfiguration.kt`,
                },
            ],
        },
    ],
    serverJavaDomain: [
        {
            condition: generator => [SQL, MONGODB, NEO4J, COUCHBASE].includes(generator.databaseType),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/domain/AbstractAuditingEntity.kt',
                    renameTo: generator => `${generator.javaDir}domain/AbstractAuditingEntity.kt`,
                },
            ],
        },
    ],
    serverJavaServiceError: [
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/EmailAlreadyUsedException.kt',
                    renameTo: generator => `${generator.javaDir}service/EmailAlreadyUsedException.kt`,
                },
                {
                    file: 'package/service/InvalidPasswordException.kt',
                    renameTo: generator => `${generator.javaDir}service/InvalidPasswordException.kt`,
                },
                {
                    file: 'package/service/UsernameAlreadyUsedException.kt',
                    renameTo: generator => `${generator.javaDir}service/UsernameAlreadyUsedException.kt`,
                },
            ],
        },
    ],
    serverJavaService: [
        {
            condition: generator => generator.messageBroker === KAFKA,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/KafkaSseConsumer.kt',
                    renameTo: generator => `${generator.javaDir}config/KafkaSseConsumer.kt`,
                },
                {
                    file: 'package/config/KafkaSseProducer.kt',
                    renameTo: generator => `${generator.javaDir}config/KafkaSseProducer.kt`,
                },
            ],
        },
    ],
    serverJavaWebError: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/errors/BadRequestAlertException.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/BadRequestAlertException.kt`,
                },
                {
                    file: 'package/web/rest/errors/ErrorConstants.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/ErrorConstants.kt`,
                },
                {
                    file: 'package/web/rest/errors/ExceptionTranslator.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/ExceptionTranslator.kt`,
                },
                {
                    file: 'package/web/rest/errors/FieldErrorVM.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/FieldErrorVM.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/errors/EmailAlreadyUsedException.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/EmailAlreadyUsedException.kt`,
                },
                {
                    file: 'package/web/rest/errors/InvalidPasswordException.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/InvalidPasswordException.kt`,
                },
                {
                    file: 'package/web/rest/errors/LoginAlreadyUsedException.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/errors/LoginAlreadyUsedException.kt`,
                },
            ],
        },
    ],
    serverJavaWeb: [
        {
            condition: generator => !generator.skipClient && !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/ClientForwardController.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/ClientForwardController.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipClient && generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/filter/SpaWebFilter.kt',
                    renameTo: generator => `${generator.javaDir}web/filter/SpaWebFilter.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA && generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/KafkaResource_reactive.kt',
                    renameTo: generator =>
                        `${generator.javaDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResource.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA && !generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/KafkaResource.kt',
                    renameTo: generator =>
                        `${generator.javaDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResource.kt`,
                },
            ],
        },
    ],
    serverJavaWebsocket: [
        {
            condition: generator => generator.websocket === SPRING_WEBSOCKET,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/websocket/ActivityService.kt',
                    renameTo: generator => `${generator.javaDir}web/websocket/ActivityService.kt`,
                },
                {
                    file: 'package/web/websocket/dto/ActivityDTO.kt',
                    renameTo: generator => `${generator.javaDir}web/websocket/dto/ActivityDTO.kt`,
                },
            ],
        },
    ],
    serverTestReactive: [
        {
            condition: generator => generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/JHipsterBlockHoundIntegration.kt',
                    renameTo: generator => `${generator.testDir}config/JHipsterBlockHoundIntegration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive,
            path: SERVER_TEST_RES_DIR,
            templates: ['META-INF/services/reactor.blockhound.integration.BlockHoundIntegration'],
        },
    ],
    springBootOauth2: [
        {
            condition: generator => generator.authenticationTypeOauth2 && generator.applicationTypeMonolith,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/OAuth2Configuration.kt',
                    renameTo: generator => `${generator.javaDir}config/OAuth2Configuration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: generator => `package/web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.kt`,
                    renameTo: generator =>
                        `${generator.javaDir}web/filter/OAuth2${generator.reactive ? 'Reactive' : ''}RefreshTokensWebFilter.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationTypeOauth2 && !generator.applicationTypeMicroservice,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/test/util/OAuth2TestUtil.kt',
                    renameTo: generator => `${generator.testDir}test/util/OAuth2TestUtil.kt`,
                },
            ],
        },
    ],
    serverTestFw: [
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                { file: 'package/web/rest/TestUtil.kt', renameTo: generator => `${generator.testDir}web/rest/TestUtil.kt` },
                {
                    file: 'package/web/rest/errors/ExceptionTranslatorTestController.kt',
                    renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorTestController.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/errors/ExceptionTranslatorIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/errors/ExceptionTranslatorIT_reactive.kt',
                    renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorIT.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipClient && !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/ClientForwardControllerTest.kt',
                    renameTo: generator => `${generator.testDir}web/rest/ClientForwardControllerTest.kt`,
                },
            ],
        },
        {
            condition: generator => generator.databaseType === SQL && !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
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
        {
            path: SERVER_TEST_RES_DIR,
            templates: ['config/application.yml', 'logback.xml', 'junit-platform.properties'],
        },
        {
            condition: generator => generator.databaseType === SQL && !generator.reactive,
            path: SERVER_TEST_RES_DIR,
            templates: ['config/application-testcontainers.yml'],
        },
        {
            condition: generator => generator.prodDatabaseType === MARIADB && !generator.reactive,
            path: SERVER_TEST_RES_DIR,
            templates: [{ file: 'testcontainers/mariadb/my.cnf', method: 'copy', noEjs: true }],
        },
        {
            condition: generator => generator.reactiveSqlTestContainers,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/ReactiveSqlTestContainerExtension.kt',
                    renameTo: generator => `${generator.testDir}ReactiveSqlTestContainerExtension.kt`,
                },
            ],
        },
        {
            // TODO : add these tests to reactive
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/WebConfigurerTest.kt',
                    renameTo: generator => `${generator.testDir}config/WebConfigurerTest.kt`,
                },
                {
                    file: 'package/config/WebConfigurerTestController.kt',
                    renameTo: generator => `${generator.testDir}config/WebConfigurerTestController.kt`,
                },
            ],
        },
        {
            // TODO : add these tests to reactive
            condition: generator => !generator.skipClient && !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/StaticResourcesWebConfigurerTest.kt',
                    renameTo: generator => `${generator.testDir}config/StaticResourcesWebConfigurerTest.kt`,
                },
            ],
        },
        {
            condition: generator => generator.serviceDiscoveryType,
            path: SERVER_TEST_RES_DIR,
            templates: ['config/bootstrap.yml'],
        },
        {
            condition: generator =>
                generator.authenticationType === OAUTH2 &&
                (generator.applicationType === MONOLITH || generator.applicationType === GATEWAY),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/LogoutResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/LogoutResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.gatlingTests,
            path: TEST_DIR,
            templates: [
                // Create Gatling test files
                'gatling/conf/gatling.conf',
                'gatling/conf/logback.xml',
            ],
        },
        {
            condition: generator => generator.cucumberTests,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                // Create Cucumber test files
                { file: 'package/cucumber/CucumberIT.kt', renameTo: generator => `${generator.testDir}cucumber/CucumberIT.kt` },
                {
                    file: 'package/cucumber/stepdefs/StepDefs.kt',
                    renameTo: generator => `${generator.testDir}cucumber/stepdefs/StepDefs.kt`,
                },
                {
                    file: 'package/cucumber/CucumberTestContextConfiguration.kt',
                    renameTo: generator => `${generator.testDir}cucumber/CucumberTestContextConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.cucumberTests,
            path: SERVER_TEST_RES_DIR,
            templates: [{ file: 'package/features/gitkeep', renameTo: generator => `${generator.testDir}cucumber/gitkeep`, noEjs: true }],
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== OAUTH2,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                // Create auth config test files
                {
                    file: 'package/security/DomainUserDetailsServiceIT.kt',
                    renameTo: generator => `${generator.testDir}security/DomainUserDetailsServiceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/KafkaTestContainer.kt',
                    renameTo: generator => `${generator.testDir}config/KafkaTestContainer.kt`,
                },
                {
                    file: 'package/config/EmbeddedKafka.kt',
                    renameTo: generator => `${generator.testDir}config/EmbeddedKafka.kt`,
                },
                {
                    file: 'package/config/TestContainersSpringContextCustomizerFactory.kt',
                    renameTo: generator => `${generator.testDir}config/TestContainersSpringContextCustomizerFactory.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA && !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/KafkaResourceIT.kt',
                    renameTo: generator =>
                        `${generator.testDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA && generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/KafkaResourceIT_reactive.kt',
                    renameTo: generator =>
                        `${generator.testDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.messageBroker === KAFKA,
            path: SERVER_TEST_RES_DIR,
            templates: [
                {
                    file: 'META-INF/spring.factories',
                },
                {
                    file: 'testcontainers.properties',
                },
            ],
        },
    ],
    serverJavaUserManagement: [
        {
            condition: generator => generator.isUsingBuiltInUser(),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/domain/User.kt',
                    renameTo: generator => `${generator.javaDir}domain/${generator.asEntity('User')}.kt`,
                },
            ],
        },
        {
            condition: generator => generator.isUsingBuiltInAuthority(),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                { file: 'package/domain/Authority.kt', renameTo: generator => `${generator.javaDir}domain/Authority.kt` },
                {
                    file: 'package/repository/AuthorityRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/AuthorityRepository.kt`,
                },
            ],
        },
        {
            condition: generator =>
                (generator.authenticationType === OAUTH2 && generator.applicationType !== MICROSERVICE) ||
                (!generator.skipUserManagement && generator.databaseType === SQL),
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/liquibase/data/user.csv'],
        },
        {
            condition: generator =>
                (generator.authenticationType === OAUTH2 && generator.applicationType !== MICROSERVICE && generator.databaseType === SQL) ||
                (!generator.skipUserManagement && generator.databaseType === SQL),
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/liquibase/data/authority.csv', 'config/liquibase/data/user_authority.csv'],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                { file: 'package/config/Constants.kt', renameTo: generator => `${generator.javaDir}config/Constants.kt` },
                { file: 'package/service/UserService.kt', renameTo: generator => `${generator.javaDir}service/UserService.kt` },
                {
                    file: 'package/service/dto/AdminUserDTO.kt',
                    renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('AdminUser')}.kt`,
                },
                {
                    file: 'package/service/dto/UserDTO.kt',
                    renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('User')}.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2 && generator.databaseType !== NO_DATABASE,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/service/mapper/UserMapper.kt',
                    renameTo: generator => `${generator.javaDir}service/mapper/UserMapper.kt`,
                },
                {
                    file: 'package/repository/UserRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/UserRepository.kt`,
                },
                {
                    file: 'package/web/rest/PublicUserResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/PublicUserResource.kt`,
                },
                {
                    file: 'package/web/rest/vm/ManagedUserVM.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/vm/ManagedUserVM.kt`,
                },
            ],
        },
        {
            condition: generator => generator.skipUserManagement && [MONOLITH, GATEWAY].includes(generator.applicationType),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/AccountResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/AccountResource.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/UserServiceIT.kt',
                    renameTo: generator => `${generator.testDir}service/UserServiceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2 && generator.databaseType !== NO_DATABASE,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/mapper/UserMapperTest.kt',
                    renameTo: generator => `${generator.testDir}service/mapper/UserMapperTest.kt`,
                },
                {
                    file: 'package/web/rest/PublicUserResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/PublicUserResourceIT.kt`,
                },
                {
                    file: 'package/web/rest/UserResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/UserResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator =>
                generator.skipUserManagement &&
                generator.authenticationType !== OAUTH2 &&
                [MONOLITH, GATEWAY].includes(generator.applicationType),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/AccountResourceIT_skipUserManagement.kt',
                    renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator =>
                generator.skipUserManagement &&
                generator.authenticationType === OAUTH2 &&
                [MONOLITH, GATEWAY].includes(generator.applicationType),
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/AccountResourceIT_oauth2.kt',
                    renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2 && generator.searchEngine === ELASTICSEARCH,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/search/UserSearchRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/search/UserSearchRepository.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === OAUTH2 && generator.searchEngine === ELASTICSEARCH,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/UserSearchRepositoryMockConfiguration.kt',
                    renameTo: generator => `${generator.testDir}repository/search/UserSearchRepositoryMockConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_MAIN_RES_DIR,
            templates: [
                'templates/mail/activationEmail.html',
                'templates/mail/creationEmail.html',
                'templates/mail/passwordResetEmail.html',
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/UserRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/UserRepository.kt`,
                },

                /* User management java service files */
                { file: 'package/service/UserService.kt', renameTo: generator => `${generator.javaDir}service/UserService.kt` },
                { file: 'package/service/MailService.kt', renameTo: generator => `${generator.javaDir}service/MailService.kt` },

                /* User management java web files */
                {
                    file: 'package/service/dto/AdminUserDTO.kt',
                    renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('AdminUser')}.kt`,
                },
                {
                    file: 'package/service/dto/UserDTO.kt',
                    renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('User')}.kt`,
                },
                {
                    file: 'package/service/dto/PasswordChangeDTO.kt',
                    renameTo: generator => `${generator.javaDir}service/dto/PasswordChangeDTO.kt`,
                },
                {
                    file: 'package/web/rest/vm/ManagedUserVM.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/vm/ManagedUserVM.kt`,
                },
                {
                    file: 'package/web/rest/AccountResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/AccountResource.kt`,
                },
                { file: 'package/web/rest/UserResource.kt', renameTo: generator => `${generator.javaDir}web/rest/UserResource.kt` },
                {
                    file: 'package/web/rest/PublicUserResource.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/PublicUserResource.kt`,
                },
                {
                    file: 'package/web/rest/vm/KeyAndPasswordVM.kt',
                    renameTo: generator => `${generator.javaDir}web/rest/vm/KeyAndPasswordVM.kt`,
                },
                {
                    file: 'package/service/mapper/UserMapper.kt',
                    renameTo: generator => `${generator.javaDir}service/mapper/UserMapper.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement && generator.searchEngine === ELASTICSEARCH,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/search/UserSearchRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/search/UserSearchRepository.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement && generator.searchEngine === ELASTICSEARCH,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/repository/search/UserSearchRepositoryMockConfiguration.kt',
                    renameTo: generator => `${generator.testDir}repository/search/UserSearchRepositoryMockConfiguration.kt`,
                },
            ],
        },
        {
            condition: generator => generator.authenticationType === JWT,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/management/SecurityMetersServiceTests.kt',
                    renameTo: generator => `${generator.testDir}management/SecurityMetersServiceTests.kt`,
                },
                {
                    file: 'package/security/jwt/TokenProviderTest.kt',
                    renameTo: generator => `${generator.testDir}security/jwt/TokenProviderTest.kt`,
                },
                {
                    file: 'package/security/jwt/TokenProviderSecurityMetersTests.kt',
                    renameTo: generator => `${generator.testDir}security/jwt/TokenProviderSecurityMetersTests.kt`,
                },
                {
                    file: 'package/security/jwt/JWTFilterTest.kt',
                    renameTo: generator => `${generator.testDir}security/jwt/JWTFilterTest.kt`,
                },
            ],
        },
        {
            condition: generator => generator.applicationType !== MICROSERVICE && generator.authenticationType === JWT,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/UserJWTControllerIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/UserJWTControllerIT.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.skipUserManagement &&
                generator.cucumberTests &&
                !generator.databaseTypeMongodb &&
                !generator.databaseTypeCassandra,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/cucumber/stepdefs/UserStepDefs.kt',
                    renameTo: generator => `${generator.testDir}cucumber/stepdefs/UserStepDefs.kt`,
                },
            ],
        },
        {
            condition: generator =>
                !generator.skipUserManagement &&
                generator.cucumberTests &&
                !generator.databaseTypeMongodb &&
                !generator.databaseTypeCassandra,
            path: SERVER_TEST_RES_DIR,
            templates: [
                {
                    file: 'package/features/user/user.feature',
                    renameTo: generator => `${generator.testDir}cucumber/user.feature`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_TEST_RES_DIR,
            templates: [
                /* User management java test files */
                'templates/mail/testEmail.html',
            ],
        },
        {
            condition: generator => !generator.skipUserManagement && !generator.enableTranslation,
            path: SERVER_TEST_RES_DIR,
            templates: ['i18n/messages_en.properties'],
        },
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/service/MailServiceIT.kt',
                    renameTo: generator => `${generator.testDir}service/MailServiceIT.kt`,
                },
                {
                    file: 'package/service/UserServiceIT.kt',
                    renameTo: generator => `${generator.testDir}service/UserServiceIT.kt`,
                },
                {
                    file: 'package/service/mapper/UserMapperTest.kt',
                    renameTo: generator => `${generator.testDir}service/mapper/UserMapperTest.kt`,
                },
                {
                    file: 'package/config/NoOpMailConfiguration.kt',
                    renameTo: generator => `${generator.testDir}config/NoOpMailConfiguration.kt`,
                },
                {
                    file: 'package/web/rest/PublicUserResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/PublicUserResourceIT.kt`,
                },
                {
                    file: 'package/web/rest/UserResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/UserResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement && generator.authenticationType !== OAUTH2,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/AccountResourceIT.kt',
                    renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.kt`,
                },
            ],
        },
        {
            condition: generator => !generator.skipUserManagement && generator.authenticationType === OAUTH2,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/AccountResourceIT_oauth2.kt',
                    renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.kt`,
                },
            ],
        },
        {
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/web/rest/WithUnauthenticatedMockUser.kt',
                    renameTo: generator => `${generator.testDir}web/rest/WithUnauthenticatedMockUser.kt`,
                },
            ],
        },
    ],
};

const serverFiles = mergeSections(
    baseServerFiles,
    addSectionsCondition(h2Files, context => context.devDatabaseTypeH2Any),
    addSectionsCondition(liquibaseFiles, context => context.databaseTypeSql),
    addSectionsCondition(mongoDbFiles, context => context.databaseTypeMongodb),
    addSectionsCondition(neo4jFiles, context => context.databaseTypeNeo4j),
    addSectionsCondition(cassandraFiles, context => context.databaseTypeCassandra)
);

/* eslint-disable no-template-curly-in-string */
function writeFiles() {
    return {
        setUp() {
            this.javaDir = `${this.packageFolder}/`;
            this.testDir = `${this.packageFolder}/`;

            this.generateKeyStore();
        },

        cleanupOldServerFiles() {
            serverCleanup.cleanupOldServerFiles(
                this,
                `${SERVER_MAIN_KOTLIN_SRC_DIR}/${this.javaDir}`,
                `${SERVER_TEST_SRC_KOTLIN_DIR}/${this.testDir}`,
                SERVER_MAIN_RES_DIR,
                SERVER_TEST_RES_DIR
            );
        },

        writeFiles() {
            return this.writeFilesToDisk(serverFiles);
        },

        ...writeCouchbaseFiles(),

        ...writeSqlFiles(),

        modifyFiles() {
            if (this.buildTool === GRADLE) {
                this.addGradleProperty('kotlin_version', kotlinConstants.KOTLIN_VERSION);
                this.addGradleProperty('mapstruct_version', kotlinConstants.MAPSTRUCT_VERSION);
                this.addGradleProperty('detekt_version', kotlinConstants.DETEKT_VERSION);
                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-gradle-plugin', '${kotlin_version}');
                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-allopen', '${kotlin_version}');
                if (this.databaseTypeSql) {
                    this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-noarg', '${kotlin_version}');
                }
                this.addGradlePlugin('org.jlleitschuh.gradle', 'ktlint-gradle', kotlinConstants.KTLINT_GRADLE_VERSION);
                this.addGradlePlugin('io.gitlab.arturbosch.detekt', 'detekt-gradle-plugin', '${detekt_version}');

                this.applyFromGradleScript('gradle/kotlin');
            }

            if (this.buildTool === MAVEN) {
                this.addMavenProperty('kotlin.version', kotlinConstants.KOTLIN_VERSION);
                this.addMavenProperty('mapstruct.version', kotlinConstants.MAPSTRUCT_VERSION);
                this.addMavenProperty('ktlint-maven-plugin.version', kotlinConstants.KTLINT_MAVEN_VERSION);
                this.addMavenProperty('maven-antrun-plugin.version', kotlinConstants.MAVEN_ANTRUN_VERSION);
                this.addMavenProperty('detekt.version', kotlinConstants.DETEKT_VERSION);
                this.addMavenProperty('detekt.configFile', `$\{project.basedir}/${kotlinConstants.DETEKT_CONFIG_FILE}`);
                this.addMavenProperty('detekt.xmlReportFile', '${project.build.directory}/detekt-reports/detekt.xml');
                this.addMavenProperty('sonar.kotlin.detekt.reportPaths', '${detekt.xmlReportFile}');
                this.addMavenProperty('sonar.coverage.jacoco.xmlReportPaths', '${jacoco.reportFolder}/jacoco.xml');

                this.addMavenDependencyManagement('org.jetbrains.kotlin', 'kotlin-stdlib', '${kotlin.version}');
                this.addMavenDependencyManagement('org.jetbrains.kotlin', 'kotlin-stdlib-jdk8', '${kotlin.version}');

                this.addMavenDependency('org.jetbrains.kotlinx', 'kotlinx-coroutines-debug');
                this.addMavenDependency('org.jetbrains.kotlinx', 'kotlinx-coroutines-reactor');
                this.addMavenDependency('io.projectreactor.kotlin', 'reactor-kotlin-extensions');

                this.addMavenDependency('com.fasterxml.jackson.datatype', 'jackson-datatype-json-org');
                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-stdlib-jdk8', '${kotlin.version}');
                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-reflect', '${kotlin.version}');
                this.addMavenDependency(
                    'org.jetbrains.kotlin',
                    'kotlin-test-junit',
                    '${kotlin.version}',
                    '            <scope>test</scope>'
                );
                this.addMavenDependency(
                    'com.nhaarman.mockitokotlin2',
                    'mockito-kotlin',
                    kotlinConstants.MOCKITO_KOTLIN_VERSION,
                    '            <scope>test</scope>'
                );
                // NOTE: Add proper indentation of the configuration tag
                const kotlinOther = `                <executions>
                    <execution>
                        <id>kapt</id>
                        <goals>
                            <goal>kapt</goal>
                        </goals>
                        <configuration>
                            <sourceDirs>
                                <sourceDir>$\{project.basedir}/src/main/kotlin</sourceDir>
                                <sourceDir>$\{project.basedir}/src/main/java</sourceDir>
                            </sourceDirs>
                            <annotationProcessorPaths>
                                <annotationProcessorPath>
                                    <groupId>org.mapstruct</groupId>
                                    <artifactId>mapstruct-processor</artifactId>
                                    <version>$\{mapstruct.version}</version>
                                </annotationProcessorPath>
                                ${
                                    this.databaseTypeSql
                                        ? `<!-- For JPA static metamodel generation -->
                                <annotationProcessorPath>
                                    <groupId>org.hibernate</groupId>
                                    <artifactId>hibernate-jpamodelgen</artifactId>
                                    <version>$\{hibernate.version}</version>
                                </annotationProcessorPath>
                                <annotationProcessorPath>
                                    <groupId>org.glassfish.jaxb</groupId>
                                    <artifactId>jaxb-runtime</artifactId>
                                    <version>$\{jaxb-runtime.version}</version>
                                </annotationProcessorPath>`
                                        : ''
                                }
                                ${
                                    this.databaseTypeCassandra
                                        ? `
                                <annotationProcessorPath>
                                    <groupId>com.datastax.oss</groupId>
                                    <artifactId>java-driver-mapper-processor</artifactId>
                                    <version>$\{cassandra-driver.version}</version>
                                </annotationProcessorPath>`
                                        : ''
                                }
                            </annotationProcessorPaths>
                        </configuration>
                    </execution>
                    <execution>
                        <id>compile</id>
                        <phase>process-sources</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                        <configuration>
                            <sourceDirs>
                                <sourceDir>$\{project.basedir}/src/main/kotlin</sourceDir>
                                <sourceDir>$\{project.basedir}/src/main/java</sourceDir>
                            </sourceDirs>
                        </configuration>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <phase>process-test-sources</phase>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                        <configuration>
                            <sourceDirs>
                                <sourceDir>$\{project.basedir}/src/test/kotlin</sourceDir>
                                <sourceDir>$\{project.basedir}/src/test/java</sourceDir>
                            </sourceDirs>
                        </configuration>
                    </execution>
                </executions>
                <configuration>
                    <jvmTarget>$\{java.version}</jvmTarget>
                    <javaParameters>true</javaParameters>
                    <args>
                        <arg>-Xjvm-default=all</arg>
                    </args>
                    <compilerPlugins>
                        <plugin>spring</plugin>${
                            this.databaseTypeSql
                                ? `
                        <plugin>jpa</plugin>
                        <plugin>all-open</plugin>`
                                : ''
                        }
                    </compilerPlugins>${
                        this.databaseTypeSql
                            ? `<pluginOptions>
                        <!-- Each annotation is placed on its own line -->
                        <option>all-open:annotation=javax.persistence.Entity</option>
                        <option>all-open:annotation=javax.persistence.MappedSuperclass</option>
                        <option>all-open:annotation=javax.persistence.Embeddable</option>
                    </pluginOptions>`
                            : ''
                    }
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-allopen</artifactId>
                        <version>$\{kotlin.version}</version>
                    </dependency>
                    ${
                        this.databaseTypeSql
                            ? `<dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-noarg</artifactId>
                        <version>$\{kotlin.version}</version>
                    </dependency>`
                            : ''
                    }
                </dependencies>`;
                this.addMavenPlugin('org.jetbrains.kotlin', 'kotlin-maven-plugin', '${kotlin.version}', kotlinOther);

                updatePom(this);
                const defaultCompileOther = `                <executions>
                    <!-- Replacing default-compile as it is treated specially by maven -->
                    <execution>
                        <id>default-compile</id>
                        <phase>none</phase>
                    </execution>
                    <!-- Replacing default-testCompile as it is treated specially by maven -->
                    <execution>
                        <id>default-testCompile</id>
                        <phase>none</phase>
                    </execution>
                    <execution>
                        <id>java-compile</id>
                        <phase>compile</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>java-test-compile</id>
                        <phase>test-compile</phase>
                        <goals>
                            <goal>testCompile</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <proc>none</proc>
                </configuration>`;
                this.addMavenPlugin(
                    'org.apache.maven.plugins',
                    'maven-compiler-plugin',
                    '${maven-compiler-plugin.version}',
                    defaultCompileOther
                );
                const ktlintMavenOther = `                <executions>
                    <execution>
                        <id>format</id>
                        <goals>
                            <goal>format</goal>
                        </goals>
                    </execution>
                </executions>`;
                this.addMavenPlugin('com.github.gantsign.maven', 'ktlint-maven-plugin', '${ktlint-maven-plugin.version}', ktlintMavenOther);

                const antRunOther = `                <executions>
                    <execution>
                        <!-- This can be run separately with mvn antrun:run@detekt -->
                        <id>detekt</id>
                        <phase>verify</phase>
                        <configuration>
                            <target name="detekt">
                                <!-- See https://arturbosch.github.io/detekt/cli.html for more options-->
                                <java taskname="detekt" dir="$\{basedir}"
                                      fork="true"
                                      failonerror="true"
                                      classname="io.gitlab.arturbosch.detekt.cli.Main"
                                      classpathref="maven.plugin.classpath">
                                    <arg value="--input"/>
                                    <arg value="$\{project.basedir}/src/main/kotlin"/>
                                    <arg value="--report"/>
                                    <arg value="xml:$\{detekt.xmlReportFile}"/>
                                    <arg value="--config"/>
                                    <arg value="$\{detekt.configFile}"/>
                                </java>
                            </target>
                        </configuration>
                        <goals>
                            <goal>run</goal>
                        </goals>
                    </execution>
                </executions>
                <dependencies>
                    <dependency>
                        <groupId>io.gitlab.arturbosch.detekt</groupId>
                        <artifactId>detekt-cli</artifactId>
                        <version>$\{detekt.version}</version>
                    </dependency>
                    <!-- additional 3rd party ruleset(s) can be specified here -->
                </dependencies>`;
                this.addMavenPlugin('org.apache.maven.plugins', 'maven-antrun-plugin', '${maven-antrun-plugin.version}', antRunOther);
            }
        },
    };
}

/**
 * Manually updates the pom.xml file to perform the following operations:
 * 1. Set the Kotlin source directories as the default (Needed for the ktlint plugin to properly format the sources)
 * 2. Remove the default <maven-compiler-plugin> configuration.
 */
async function updatePom(generator) {
    const _this = generator || this;

    const fullPath = path.join(process.cwd(), 'pom.xml');
    const artifactId = 'maven-compiler-plugin';

    const xml = _this.fs.read(fullPath).toString();
    const $ = cheerio.load(xml, { xmlMode: true });

    // 1. Set the Kotlin source directories as the default
    $('build > defaultGoal').after(`

        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
`);
    // 2. Remove the default <maven-compiler-plugin> configuration
    $(`build > plugins > plugin > artifactId:contains('${artifactId}')`).parent().remove();

    _this.fs.write(fullPath, $.xml());
}

module.exports = {
    writeFiles,
    serverFiles,
};
