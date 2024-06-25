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
const { dirname, join } = require('path');

// Paths that are not exported by the generator-jhipster package, we need to import using cjs syntax
const packagePath = dirname(require.resolve('jhipster-7-templates/package.json'));
const { couchbaseFiles } = require(join(packagePath, 'generators/server/files-couchbase.js'));
const jhipsterConstants = require(join(packagePath, 'generators/generator-constants.js'));

const jhipster7DockerContainers = {
    mysql: jhipsterConstants.DOCKER_MYSQL,
    mariadb: jhipsterConstants.DOCKER_MARIADB,
    postgresql: jhipsterConstants.DOCKER_POSTGRESQL,
    mongodb: jhipsterConstants.DOCKER_MONGODB,
    couchbase: jhipsterConstants.DOCKER_COUCHBASE,
    cassandra: jhipsterConstants.DOCKER_CASSANDRA,
    mssql: jhipsterConstants.DOCKER_MSSQL,
    neo4j: jhipsterConstants.DOCKER_NEO4J,
    hazel: jhipsterConstants.DOCKER_HAZELCAST_MANAGEMENT_CENTER,
    memcached: jhipsterConstants.DOCKER_MEMCACHED,
    redis: jhipsterConstants.DOCKER_REDIS,
    elasticsearch: jhipsterConstants.DOCKER_ELASTICSEARCH,
    keycloak: jhipsterConstants.DOCKER_KEYCLOAK,
    kafka: jhipsterConstants.DOCKER_KAFKA,
    zookeeper: jhipsterConstants.DOCKER_ZOOKEEPER,
    sonar: jhipsterConstants.DOCKER_SONAR,
    consul: jhipsterConstants.DOCKER_CONSUL,
    prometheus: jhipsterConstants.DOCKER_PROMETHEUS,
    alertmanager: jhipsterConstants.DOCKER_PROMETHEUS_ALERTMANAGER,
    grafana: jhipsterConstants.DOCKER_GRAFANA,
    zipkin: jhipsterConstants.DOCKER_ZIPKIN,
    jenkins: jhipsterConstants.DOCKER_JENKINS,
    swagger: jhipsterConstants.DOCKER_SWAGGER_EDITOR,
    prometheusOperator: jhipsterConstants.DOCKER_PROMETHEUS_OPERATOR,
    grafanaWatcher: jhipsterConstants.DOCKER_GRAFANA_WATCHER,
};

module.exports = { couchbaseFiles, jhipsterConstants, jhipster7DockerContainers };
