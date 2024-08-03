import migration from '../../generators/spring-boot-v2/migration.cjs';

const { jhipsterConstants: constants } = migration;

const TEST_DIR = constants.TEST_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;
const DOCKER_DIR = constants.DOCKER_DIR;
const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_DIR = `${constants.TEST_DIR}kotlin/`;

const expectedFiles = {
    entity: {
        server: [
            '.jhipster/Foo.json',
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.kt`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.kt`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.kt`,
            `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.kt`,
        ],
        entitySearchSpecific: [`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.kt`],
        fakeData: [`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/foo.csv`],
        serverLiquibase: [`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160120000100_added_entity_Foo.xml`],
        gatling: [`${TEST_DIR}gatling/user-files/simulations/FooGatlingTest.scala`],
    },

    gradle: [
        'gradle.properties',
        'build.gradle',
        'settings.gradle',
        'gradlew',
        'gradlew.bat',
        'gradle/profile_dev.gradle',
        'gradle/profile_prod.gradle',
        'gradle/wrapper/gradle-wrapper.jar',
        'gradle/wrapper/gradle-wrapper.properties',
        'checkstyle.xml',
        'gradle/kotlin.gradle',
    ],

    maven: ['pom.xml', 'mvnw', 'mvnw.cmd', '.mvn/wrapper/maven-wrapper.jar', '.mvn/wrapper/maven-wrapper.properties', 'checkstyle.xml'],

    server: [
        `${SERVER_MAIN_RES_DIR}banner.txt`,
        `${SERVER_MAIN_RES_DIR}templates/error.html`,
        `${SERVER_MAIN_RES_DIR}logback-spring.xml`,
        `${SERVER_MAIN_RES_DIR}config/application.yml`,
        `${SERVER_MAIN_RES_DIR}config/application-dev.yml`,
        `${SERVER_MAIN_RES_DIR}config/application-prod.yml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
        `${SERVER_MAIN_RES_DIR}i18n/messages.properties`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/JhipsterApp.kt`,
        // `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/GeneratedByJHipster.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/aop/logging/LoggingAspect.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/ApplicationProperties.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/AsyncConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/Constants.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/DatabaseConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/DateTimeFormatConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/JacksonConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LocaleConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LoggingAspectConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/WebConfigurer.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/AbstractAuditingEntity.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/AuthoritiesConstants.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/SecurityUtils.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/SpringSecurityAuditorAware.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/BadRequestAlertException.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/ErrorConstants.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/ExceptionTranslator.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/FieldErrorVM.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/AccountResource.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/SecurityUtilsUnitTest.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/AccountResourceIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/WithUnauthenticatedMockUser.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/TestUtil.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/errors/ExceptionTranslatorIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/errors/ExceptionTranslatorTestController.kt`,
        `${SERVER_TEST_RES_DIR}config/application.yml`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/AsyncSyncConfiguration.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}logback.xml`,
    ],

    userManagementServer: [
        `${SERVER_MAIN_RES_DIR}config/liquibase/data/authority.csv`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/data/user.csv`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/data/user_authority.csv`,
        `${SERVER_MAIN_RES_DIR}templates/mail/activationEmail.html`,
        `${SERVER_MAIN_RES_DIR}templates/mail/passwordResetEmail.html`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Authority.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/User.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/AuthorityRepository.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/UserRepository.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/DomainUserDetailsService.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/UserNotActivatedException.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/MailService.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/UserService.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/UserDTO.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/PasswordChangeDTO.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/UserMapper.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/EmailAlreadyUsedException.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/InvalidPasswordException.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/errors/LoginAlreadyUsedException.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/UserResource.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/KeyAndPasswordVM.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/ManagedUserVM.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/UserResourceIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/service/UserServiceIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/service/MailServiceIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/service/mapper/UserMapperTest.kt`,
    ],

    infinispan: [`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheFactoryConfiguration.kt`],

    memcached: [`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.kt`, `${DOCKER_DIR}memcached.yml`],

    redis: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/CacheConfiguration.kt`,
        `${DOCKER_DIR}redis.yml`,
        `${DOCKER_DIR}redis-cluster.yml`,
        `${DOCKER_DIR}redis/connectRedisCluster.sh`,
        `${DOCKER_DIR}redis/Redis-Cluster.Dockerfile`,
        `${SERVER_TEST_SRC_DIR}/com/mycompany/myapp/config/EmbeddedRedis.kt`,
        `${SERVER_TEST_SRC_DIR}/com/mycompany/myapp/config/RedisTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}/com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
    ],

    gatling: [`${TEST_DIR}gatling/conf/gatling.conf`],

    i18nJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/en/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/user-management.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/user-management.json`,
    ],

    i18nAdminJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/en/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/metrics.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/metrics.json`,
    ],

    i18nDeJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/de/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/user-management.json`,
    ],

    i18nAdminDeJson: [
        `${CLIENT_MAIN_SRC_DIR}i18n/de/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/de/metrics.json`,
    ],

    session: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/PersistentToken.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/PersistentTokenRepository.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/PersistentTokenRememberMeServices.kt`,
    ],

    jwtServer: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/management/SecurityMetersService.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTConfigurer.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilter.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProvider.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/management/SecurityMetersServiceTests.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilterTest.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProviderTest.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProviderSecurityMetersTests.kt`,
    ],

    jwtServerGateway: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/management/SecurityMetersService.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilter.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProvider.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/management/SecurityMetersServiceTests.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/JWTFilterTest.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProviderTest.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/security/jwt/TokenProviderSecurityMetersTests.kt`,
    ],

    oauth2: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/User.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/oauth2/JwtGrantedAuthorityConverter.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/oauth2/AudienceValidator.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/security/oauth2/OAuthIdpTokenResponseDTO.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/AccountResource.kt`,
        `${DOCKER_DIR}keycloak.yml`,
    ],

    messageBroker: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/KafkaSseConsumer.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/KafkaSseProducer.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/JhipsterKafkaResource.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/JhipsterKafkaResourceIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/KafkaTestContainer.kt`,
        `${DOCKER_DIR}kafka.yml`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
    ],

    swaggerCodegen: [`${SERVER_MAIN_RES_DIR}swagger/api.yml`],

    swaggerCodegenGradle: ['gradle/swagger.gradle'],

    gateway: [
        `${SERVER_MAIN_RES_DIR}config/bootstrap.yml`,
        `${SERVER_MAIN_RES_DIR}config/bootstrap-prod.yml`,
        `${SERVER_TEST_RES_DIR}config/bootstrap.yml`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/filter/ModifyServersOpenApiFilter.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/filter/ModifyServersOpenApiFilterTest.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/vm/RouteVM.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/GatewayResource.kt`,
    ],

    feignConfig: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/FeignConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/client/UserFeignClientInterceptor.kt`,
    ],

    microservice: [
        `${SERVER_MAIN_RES_DIR}static/index.html`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/SecurityConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/FeignConfiguration.kt`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/client/UserFeignClientInterceptor.kt`,
        'package.json',
    ],

    dockerServices: [`${DOCKER_DIR}app.yml`, `${DOCKER_DIR}sonar.yml`, `${DOCKER_DIR}jhipster-control-center.yml`],

    hibernateTimeZoneConfig: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/timezone/HibernateTimeZoneIT.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/repository/timezone/DateTimeWrapper.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/repository/timezone/DateTimeWrapperRepository.kt`,
    ],

    mysql: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/SqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/MysqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/EmbeddedSQL.kt`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.kt`,
        `${DOCKER_DIR}mysql.yml`,
    ],

    mariadb: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/SqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/MariadbTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/EmbeddedSQL.kt`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.kt`,
        `${DOCKER_DIR}mariadb.yml`,
        `${SERVER_TEST_RES_DIR}config/application-testdev.yml`,
        `${SERVER_TEST_RES_DIR}config/application-testprod.yml`,
        `${SERVER_TEST_RES_DIR}testcontainers/mariadb/my.cnf`,
    ],

    mssql: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/SqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/MsSqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/EmbeddedSQL.kt`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.kt`,
        `${DOCKER_DIR}mssql.yml`,
    ],

    postgresql: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/SqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/PostgreSqlTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/EmbeddedSQL.kt`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.kt`,
        `${DOCKER_DIR}postgresql.yml`,
        `${SERVER_TEST_RES_DIR}config/application-testdev.yml`,
        `${SERVER_TEST_RES_DIR}config/application-testprod.yml`,
    ],

    liquibase: [
        `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/LiquibaseConfiguration.kt`,
    ],

    hazelcast: [`${DOCKER_DIR}hazelcast-management-center.yml`],

    mongodb: [
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/config/dbmigrations/InitialSetupMigration.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/MongoDbTestContainer.kt`,
        `${DOCKER_DIR}mongodb.yml`,
        `${DOCKER_DIR}mongodb-cluster.yml`,
        `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`,
        `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
    ],

    couchbase: [
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0__create_collections.n1ql`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.2__create_indexes.n1ql`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_ADMIN.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/authority/ROLE_USER.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user/admin.json`,
        `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V0.1__initial_setup/user/user.json`,
        `${DOCKER_DIR}couchbase.yml`,
        `${DOCKER_DIR}couchbase-cluster.yml`,
        `${DOCKER_DIR}couchbase/Couchbase.Dockerfile`,
        `${DOCKER_DIR}couchbase/scripts/configure-node.sh`,
    ],

    neo4j: [
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/EmbeddedNeo4j.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/Neo4jTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
        `${SERVER_TEST_RES_DIR}META-INF/spring.factories`,
        `${SERVER_MAIN_RES_DIR}config/neo4j/migrations/user__admin.json`,
        `${SERVER_MAIN_RES_DIR}config/neo4j/migrations/user__user.json`,
        `${DOCKER_DIR}neo4j.yml`,
    ],

    couchbaseSearch: [`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/repository/CouchbaseSearchRepositoryTest.kt`],

    cassandra: [
        `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace-prod.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/drop-keyspace.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000000_create-tables.cql`,
        `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000001_insert_default_users.cql`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/TestContainersSpringContextCustomizerFactory.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/config/CassandraTestContainer.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/CassandraKeyspaceIT.kt`,
        `${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile`,
        `${DOCKER_DIR}cassandra/scripts/autoMigrate.sh`,
        `${DOCKER_DIR}cassandra/scripts/execute-cql.sh`,
        `${DOCKER_DIR}cassandra-cluster.yml`,
        `${DOCKER_DIR}cassandra-migration.yml`,
        `${DOCKER_DIR}cassandra.yml`,
        `${SERVER_TEST_RES_DIR}testcontainers.properties`,
    ],

    elasticsearch: [
        `${DOCKER_DIR}elasticsearch.yml`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/UserSearchRepository.kt`,
    ],

    cucumber: [
        `${TEST_DIR}features/user/user.feature`,
        `${TEST_DIR}features/gitkeep`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/CucumberTestContextConfiguration.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/stepdefs/UserStepDefs.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/stepdefs/StepDefs.kt`,
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/cucumber/CucumberIT.kt`,
        `${SERVER_TEST_RES_DIR}cucumber.properties`,
    ],

    eureka: [
        `${DOCKER_DIR}central-server-config/localhost-config/application.yml`,
        `${DOCKER_DIR}central-server-config/docker-config/application.yml`,
        `${DOCKER_DIR}jhipster-registry.yml`,
    ],

    consul: [`${DOCKER_DIR}central-server-config/application.yml`, `${DOCKER_DIR}consul.yml`, `${DOCKER_DIR}config/git2consul.json`],
};

export default expectedFiles;
