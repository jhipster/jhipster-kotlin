/**
 * generator-jhipster 9.x no longer re-exports these enums from 'generator-jhipster/jdl'
 * (lib/jhipster is not part of its public package "exports" map). The string values are
 * stable JHipster configuration values, so they are mirrored here for test usage.
 */
export const applicationTypes = {
    MONOLITH: 'monolith',
    MICROSERVICE: 'microservice',
    GATEWAY: 'gateway',
};

export const authenticationTypes = {
    JWT: 'jwt',
    OAUTH2: 'oauth2',
    SESSION: 'session',
};

export const buildToolTypes = {
    MAVEN: 'maven',
    GRADLE: 'gradle',
};

export const cacheTypes = {
    CAFFEINE: 'caffeine',
    EHCACHE: 'ehcache',
    HAZELCAST: 'hazelcast',
    INFINISPAN: 'infinispan',
    MEMCACHED: 'memcached',
    REDIS: 'redis',
    NO: 'no',
};

export const clientFrameworkTypes = {
    ANGULAR: 'angular',
    REACT: 'react',
    VUE: 'vue',
    SVELTE: 'svelte',
    NO: 'no',
};

export const databaseTypes = {
    SQL: 'sql',
    MYSQL: 'mysql',
    MARIADB: 'mariadb',
    POSTGRESQL: 'postgresql',
    MSSQL: 'mssql',
    ORACLE: 'oracle',
    MONGODB: 'mongodb',
    CASSANDRA: 'cassandra',
    COUCHBASE: 'couchbase',
    NEO4J: 'neo4j',
    H2_DISK: 'h2Disk',
    H2_MEMORY: 'h2Memory',
    NO: 'no',
};

export const serviceDiscoveryTypes = {
    EUREKA: 'eureka',
    CONSUL: 'consul',
    NO: 'no',
};

export const testFrameworkTypes = {
    CYPRESS: 'cypress',
    PLAYWRIGHT: 'playwright',
    CUCUMBER: 'cucumber',
    GATLING: 'gatling',
    NO: 'no',
};
