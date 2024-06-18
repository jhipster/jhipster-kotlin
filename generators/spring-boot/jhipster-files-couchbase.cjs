const DOCKER_DIR = 'src/main/docker/';
const SERVER_MAIN_SRC_DIR = 'src/main/java/';
const SERVER_MAIN_RES_DIR = 'src/main/resources/';
const SERVER_TEST_SRC_DIR = 'src/test/java/';

const shouldSkipUserManagement = generator =>
    generator.skipUserManagement && (!generator.applicationTypeMonolith || !generator.authenticationTypeOauth2);

const couchbaseFiles = {
    docker: [
        {
            path: DOCKER_DIR,
            templates: ['couchbase.yml', 'couchbase-cluster.yml', 'couchbase/Couchbase.Dockerfile', 'couchbase/scripts/configure-node.sh'],
        },
    ],
    serverJavaConfig: [
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/JHipsterCouchbaseRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/JHipsterCouchbaseRepository.java`,
                },
            ],
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationTypeSession && !generator.reactive,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/PersistentTokenRepository_couchbase.java',
                    renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.java`,
                },
            ],
        },
        {
            condition: generator => generator.searchEngineCouchbase,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/CouchbaseSearchRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/CouchbaseSearchRepository.java`,
                },
            ],
        },
        {
            condition: generator => generator.searchEngineCouchbase,
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/CouchbaseSearchRepositoryTest.java',
                    renameTo: generator => `${generator.testDir}repository/CouchbaseSearchRepositoryTest.java`,
                },
            ],
        },
    ],
    serverResource: [
        {
            condition: generator => !generator.skipUserManagement,
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/couchmove/changelog/V0__create_collections.n1ql', 'config/couchmove/changelog/V0.2__create_indexes.n1ql'],
        },
        {
            condition: generator => !generator.skipUserManagement || generator.authenticationTypeOauth2,
            path: SERVER_MAIN_RES_DIR,
            templates: [
                'config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_ADMIN.json',
                'config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_USER.json',
                'config/couchmove/changelog/V0.1__initial_setup/user/admin.json',
                'config/couchmove/changelog/V0.1__initial_setup/user/user.json',
            ],
        },
    ],
    serverTestFw: [
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CouchbaseTestContainer.java',
                    renameTo: generator => `${generator.testDir}config/CouchbaseTestContainer.java`,
                },
                {
                    file: 'package/config/EmbeddedCouchbase.java',
                    renameTo: generator => `${generator.testDir}config/EmbeddedCouchbase.java`,
                },
            ],
        },
    ],
};

module.exports = {
    couchbaseFiles,
};
