import { existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';
import BaseApplicationGenerator from 'generator-jhipster/generators/spring-boot';
import { files as rawEntityServerFiles } from 'jhipster-7-templates/esm/generators/entity-server';
import { files as rawServerFiles } from 'jhipster-7-templates/esm/generators/server';

import { convertToKotlinFile } from '../kotlin/support/files.js';

import migration from './migration.cjs';
import { migrateApplicationTask } from './preparing-migration.js';

const { jhipsterConstants } = migration;

// jhipster-7-templates file specs use the legacy `{ file, method: 'copy', noEjs: true }` shape.
// generator-jhipster 9.x's writeFiles only understands the `transform: false` equivalent.
const normalizeJhipster7Template = template => {
    if (typeof template !== 'object' || template.noEjs === undefined) {
        return template;
    }
    const { noEjs, method: _method, ...rest } = template;
    return { ...rest, transform: !noEjs };
};
const normalizeJhipster7Sections = sections =>
    Object.fromEntries(
        Object.entries(sections).map(([sectionName, blocks]) => [
            sectionName,
            blocks.map(block => ({ ...block, templates: block.templates.map(normalizeJhipster7Template) })),
        ]),
    );

const entityServerFiles = normalizeJhipster7Sections(rawEntityServerFiles);
const serverFiles = normalizeJhipster7Sections(rawServerFiles);
const { MAIN_DIR } = jhipsterConstants;
const SERVER_MAIN_SRC_KOTLIN_DIR = `${MAIN_DIR}kotlin/`;

const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));

const IGNORED_SPRING_BOOT_V3_DEPENDENCIES = new Set([
    'spring-boot-docker-compose',
    'spring-boot-h2console',
    'spring-boot-starter-aspectj',
    'spring-boot-starter-jackson',
    'spring-boot-starter-jackson-test',
    'spring-boot-starter-liquibase',
    'spring-boot-starter-security-test',
    'spring-boot-starter-webmvc-test',
    'spring-boot-testcontainers',
    'hibernate-processor',
    'jackson-datatype-hibernate7',
    'jackson-module-jaxb-annotations',
]);

const isIgnoredDependency = dep => {
    if (!dep) return false;
    const artifactId = dep.artifactId || (typeof dep === 'string' ? dep : undefined);
    if (artifactId && IGNORED_SPRING_BOOT_V3_DEPENDENCIES.has(artifactId)) return true;
    if (dep.module && typeof dep.module === 'string') {
        const [, artId] = dep.module.split(':');
        if (IGNORED_SPRING_BOOT_V3_DEPENDENCIES.has(artId)) {
            return true;
        }
    }
    return false;
};

const fixDependency = dep => {
    if (!dep) return dep;
    if (typeof dep === 'string') {
        if (dep.startsWith('org.testcontainers:testcontainers-')) {
            const [groupId, artifactId] = dep.split(':');
            let mappedArtifactId = artifactId.replace('testcontainers-', '');
            if (mappedArtifactId === 'mssql') mappedArtifactId = 'mssqlserver';
            return `${groupId}:${mappedArtifactId}`;
        }
        return dep;
    }
    if (dep.groupId === 'org.testcontainers') {
        let { artifactId } = dep;
        if (artifactId?.startsWith('testcontainers-')) {
            artifactId = artifactId.replace('testcontainers-', '');
            if (artifactId === 'mssql') artifactId = 'mssqlserver';
            return { ...dep, artifactId };
        }
    }
    return dep;
};

const fixAnnotationProcessor = (proc, isGradle = false) => {
    if (!proc) return proc;
    if (proc.artifactId === 'spring-boot-configuration-processor' && !proc.version) {
        return { ...proc, version: isGradle ? '2.7.3' : '${spring-boot.version}' };
    }
    if (proc.artifactId === 'jaxb-runtime' && !proc.version) {
        return { ...proc, version: isGradle ? '4.0.0' : '${jaxb-runtime.version}' };
    }
    return proc;
};

const filterDependencies = deps => {
    if (Array.isArray(deps)) {
        return deps.filter(d => !isIgnoredDependency(d)).map(fixDependency);
    }
    if (deps && isIgnoredDependency(deps)) {
        return undefined;
    }
    return fixDependency(deps);
};

const interceptSourceMethod = (source, methodName, wrapperFactory) => {
    let currentMethod = source[methodName];
    Object.defineProperty(source, methodName, {
        configurable: true,
        enumerable: true,
        get() {
            return currentMethod;
        },
        set(newMethod) {
            currentMethod = typeof newMethod === 'function' ? wrapperFactory(newMethod) : newMethod;
        },
    });
    if (typeof currentMethod === 'function') {
        currentMethod = wrapperFactory(currentMethod);
    }
};

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, { ...features, jhipster7Migration: true });

        this.jhipsterTemplatesFolders = [
            this.templatePath('../../spring-boot/templates'),
            this.templatePath(''),
            join(jhipster7TemplatesPackage, 'generators/server/templates/'),
            join(jhipster7TemplatesPackage, 'generators/entity-server/templates/'),
        ];
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            migrateApplicationTask,
            ignoreSpringBootV3Dependencies({ source, application }) {
                const isGradle = application?.buildToolGradle;
                const fixProc = proc => fixAnnotationProcessor(proc, isGradle);

                const wrapDependencyMethod =
                    original =>
                    (deps, ...args) => {
                        const filtered = filterDependencies(deps);
                        if (!filtered || (Array.isArray(filtered) && filtered.length === 0)) return undefined;
                        return original(filtered, ...args);
                    };

                const wrapCatalogLibrariesMethod =
                    original =>
                    (libs, ...args) => {
                        const filtered = Array.isArray(libs) ? libs.filter(lib => !isIgnoredDependency(lib)).map(fixDependency) : libs;
                        if (Array.isArray(filtered) && filtered.length === 0) return undefined;
                        return original(filtered, ...args);
                    };

                const wrapAnnotationProcessorMethod =
                    original =>
                    (proc, ...args) => {
                        const filtered = filterDependencies(proc);
                        if (!filtered || (Array.isArray(filtered) && filtered.length === 0)) return undefined;
                        const fixed = Array.isArray(filtered) ? filtered.map(fixProc) : fixProc(filtered);
                        return original(fixed, ...args);
                    };

                const wrapMavenDefinitionMethod =
                    original =>
                    (definition, ...args) => {
                        if (!definition) return original(definition, ...args);
                        const filteredDef = { ...definition };
                        if (filteredDef.dependencies) {
                            filteredDef.dependencies = filteredDef.dependencies.filter(d => !isIgnoredDependency(d)).map(fixDependency);
                        }
                        if (filteredDef.dependencyManagement) {
                            filteredDef.dependencyManagement = filteredDef.dependencyManagement
                                .filter(d => !isIgnoredDependency(d))
                                .map(fixDependency);
                        }
                        if (filteredDef.annotationProcessors) {
                            filteredDef.annotationProcessors = filteredDef.annotationProcessors
                                .filter(d => !isIgnoredDependency(d))
                                .map(p => fixAnnotationProcessor(p, false));
                        }
                        return original(filteredDef, ...args);
                    };

                const wrapJavaDependenciesMethod =
                    original =>
                    (deps, ...args) => {
                        const filtered = filterDependencies(deps);
                        if (!filtered || (Array.isArray(filtered) && filtered.length === 0)) return undefined;
                        const fixed = Array.isArray(filtered) ? filtered.map(fixProc) : fixProc(filtered);
                        return original(fixed, ...args);
                    };

                const wrapJavaDefinitionMethod =
                    original =>
                    (definition, ...args) => {
                        if (!definition) return original(definition, ...args);
                        const filteredDef = { ...definition };
                        if (filteredDef.dependencies) {
                            filteredDef.dependencies = filteredDef.dependencies.filter(d => !isIgnoredDependency(d)).map(fixDependency);
                        }
                        return original(filteredDef, ...args);
                    };

                const wrapSpringBootModuleMethod =
                    original =>
                    (...modules) => {
                        const filteredModules = modules.filter(
                            m =>
                                !IGNORED_SPRING_BOOT_V3_DEPENDENCIES.has(m) &&
                                !IGNORED_SPRING_BOOT_V3_DEPENDENCIES.has(`spring-boot-starter-${m}`),
                        );
                        if (filteredModules.length === 0) return undefined;
                        return original(...filteredModules);
                    };

                interceptSourceMethod(source, 'addGradleDependency', wrapDependencyMethod);
                interceptSourceMethod(source, 'addGradleDependencies', wrapDependencyMethod);
                interceptSourceMethod(source, 'addGradleDependencyCatalogLibraries', wrapCatalogLibrariesMethod);

                interceptSourceMethod(source, 'addMavenDependency', wrapDependencyMethod);
                interceptSourceMethod(source, 'addMavenDependencyManagement', wrapDependencyMethod);
                interceptSourceMethod(source, 'addMavenAnnotationProcessor', wrapAnnotationProcessorMethod);
                interceptSourceMethod(source, 'addMavenDefinition', wrapMavenDefinitionMethod);

                interceptSourceMethod(source, 'addJavaDependencies', wrapJavaDependenciesMethod);
                interceptSourceMethod(source, 'addJavaDefinition', wrapJavaDefinitionMethod);
                interceptSourceMethod(source, 'addSpringBootModule', wrapSpringBootModuleMethod);
            },
            ignoreSpringBootV3Files({ application }) {
                (application.customizeTemplatePaths ??= []).push(
                    file => {
                        if (
                            file.sourceFile.includes('JacksonHibernateConfiguration') ||
                            file.destinationFile?.includes('JacksonHibernateConfiguration')
                        ) {
                            return undefined;
                        }
                        return file;
                    },
                    file => {
                        if (
                            file.sourceFile.includes('TokenProviderSecurityMetersTests') ||
                            file.destinationFile?.includes('TokenProviderSecurityMetersTests')
                        ) {
                            return undefined;
                        }
                        return file;
                    },
                    // Adjust feign-client and kafka destinationFile for jhipster 7 paths
                    file => {
                        if (!['jhipster:feign-client', 'jhipster:spring-cloud-stream:kafka'].includes(file.namespace)) return file;
                        const renamedFiles = file => {
                            for (const fileMap of [
                                ['security/oauth2/AuthorizationHeaderUtilTest.', 'client/AuthorizationHeaderUtilTest.'],
                                ['security/oauth2/AuthorizationHeaderUtil.', 'client/AuthorizationHeaderUtil.'],
                                ['security/oauth2/OAuthIdpTokenResponseDTO.', 'client/OAuthIdpTokenResponseDTO.'],
                                ['config/KafkaSseConsumer.', 'broker/KafkaConsumer.'],
                                ['config/KafkaSseProducer.', 'broker/KafkaProducer.'],
                            ]) {
                                // Files renamed in v8
                                file = file.replace(...fileMap.reverse());
                            }
                            return file;
                        };
                        return {
                            ...file,
                            destinationFile: renamedFiles(file.destinationFile),
                        };
                    },
                    // Ignore files from jhipster:spring-boot except the Gradle script applied by build.gradle
                    file => {
                        if (file.namespace === 'jhipster:spring-boot') {
                            return file.sourceFile.includes('spring-boot.gradle') ? file : undefined;
                        }
                        return file;
                    },
                    file => {
                        // Passthrough non liquibase files
                        if (!file.sourceFile.includes('src/main/resources/config/liquibase')) return file;
                        // Use master.xml from jhipster 7 templates
                        if (file.sourceFile.includes('master.xml')) return file.namespace === 'jhipster:liquibase' ? undefined : file;
                        // Use liquibase templates from liquibase generator
                        return file.namespace === 'jhipster:liquibase' ? file : undefined;
                    },
                    // Updated templates from v8
                    file => {
                        if (!['jhipster-kotlin:spring-boot-v2'].includes(file.namespace)) return file;
                        if (
                            // Use v8 files due to needles
                            file.sourceFile.includes('resources/logback') ||
                            // Updated gradle stack
                            file.sourceFile.endsWith('.gradle') ||
                            ['gradle.properties'].includes(basename(file.sourceFile))
                        ) {
                            return {
                                ...file,
                                resolvedSourceFile: this.fetchFromInstalledJHipster('spring-boot/templates/', file.sourceFile),
                            };
                        }
                        return file;
                    },
                    file => {
                        // We will only handle spring-boot-v2 here
                        if (file.namespace !== 'jhipster-kotlin:spring-boot-v2') return file;
                        const { destinationFile } = file;
                        let { resolvedSourceFile, sourceFile } = file;
                        // Already resolved kotlin files
                        if (resolvedSourceFile && (resolvedSourceFile.endsWith('.kt') || resolvedSourceFile.includes('.kt.'))) {
                            return file;
                        }

                        if (sourceFile.includes('spring.factories')) {
                            return undefined;
                        }

                        if (sourceFile.includes('.java')) {
                            // Kotlint User template does not implements Persistable api. Ignore for now.
                            if (application.user && destinationFile.endsWith('UserCallback.java')) {
                                return undefined;
                            }
                            if (application.generateBuiltInAuthorityEntity && destinationFile.endsWith('AuthorityRepository.java')) {
                                return undefined;
                            }
                            if (
                                destinationFile.endsWith('UserJWTController.java') ||
                                destinationFile.endsWith('UserJWTControllerIT.java')
                            ) {
                                return undefined;
                            }

                            if (
                                sourceFile.endsWith('/TestContainersSpringContextCustomizerFactory.java') &&
                                !application.databaseTypeMongodb &&
                                !application.searchEngineElasticsearch &&
                                !application.databaseTypeCouchbase
                            ) {
                                return undefined;
                            }

                            // jhipster-7-templates' file list always requests the unsuffixed
                            // AccountResource(IT).java; 9.x split it by auth/user-management
                            // strategy into 3 files each, so pick the matching one ourselves.
                            if (sourceFile.endsWith('/AccountResource.java')) {
                                if (application.authenticationTypeOauth2 && application.generateBuiltInUserEntity) {
                                    sourceFile = sourceFile.replace('AccountResource.java', 'AccountResource_oauth2.java');
                                } else if (!application.generateUserManagement) {
                                    sourceFile = sourceFile.replace('AccountResource.java', 'AccountResource_skipUserManagement.java');
                                }
                            } else if (sourceFile.endsWith('/AccountResourceIT.java')) {
                                if (application.authenticationTypeOauth2) {
                                    sourceFile = sourceFile.replace('AccountResourceIT.java', 'AccountResourceIT_oauth2.java');
                                } else if (!application.generateUserManagement) {
                                    sourceFile = sourceFile.replace('AccountResourceIT.java', 'AccountResourceIT_skipUserManagement.java');
                                }
                            }

                            for (const fileMap of [
                                ['/java/package/', '/java/_package_/'],
                                ['/EntityMapper.', '/_entityClass_Mapper.'],
                                ['/SecurityUtilsUnitTest.', '/SecurityUtilsUnitTest_imperative.'],
                                ['/SecurityConfiguration.', '/SecurityConfiguration_imperative.'],
                                ['/ExceptionTranslatorIT.', '/ExceptionTranslatorIT_imperative.'],
                                ['/LogoutResource.', '/LogoutResource_imperative.'],
                                ['/SpaWebFilter.', application.reactive ? '/SpaWebFilter_reactive.' : '/SpaWebFilter_imperative.'],
                                ['EntityDTO', '_dtoClass_'],
                                [/\/Entity(.*)\./, '/_entityClass_$1.'],
                                ['/BaseEntityMapper.', '/EntityMapper.'],
                                ['JWT_UserFeignClientInterceptor.', 'UserFeignClientInterceptor_jwt.'],
                                ['OAuth2UserClientFeignConfiguration.', 'OAuth2InterceptedFeignConfiguration.'],
                                ['OAuth2_UserFeignClientInterceptor.', 'TokenRelayRequestInterceptor.'],
                                ['UserJWTController', 'AuthenticateController'],
                            ]) {
                                // Files renamed in v8
                                sourceFile = sourceFile.replace(...fileMap);
                            }
                            sourceFile = convertToKotlinFile(sourceFile);
                            resolvedSourceFile = this.templatePath('../../spring-boot/templates', sourceFile);
                            if (!existsSync(`${resolvedSourceFile}.ejs`)) {
                                const sourceBasename = basename(resolvedSourceFile);
                                if (
                                    ((/^(Public)?User(.*)\.kt/.test(sourceBasename) || /^Entity(.*)\.kt/.test(sourceBasename)) &&
                                        !['UserJWTController.kt', 'UserJWTControllerIT.kt'].includes(sourceBasename)) ||
                                    resolvedSourceFile.includes('_entityClass_') ||
                                    resolvedSourceFile.includes('_dtoClass_')
                                ) {
                                    resolvedSourceFile = resolvedSourceFile.replace('_package_', '_package_/_entityPackage_');
                                } else {
                                    resolvedSourceFile = this.templatePath(sourceFile);
                                }
                            }
                            return {
                                ...file,
                                sourceFile,
                                javaResolvedSourceFile: file.resolvedSourceFile,
                                resolvedSourceFile,
                                destinationFile: convertToKotlinFile(destinationFile),
                            };
                        }
                        return file;
                    },
                );
            },
        });
    }

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            migration({ application }) {
                Object.assign(application, {
                    serviceDiscoveryType: application.serviceDiscoveryType === 'no' ? false : application.serviceDiscoveryType,
                });
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async writeFiles({ application }) {
                await this.writeFiles({
                    sections: serverFiles,
                    context: application,
                    customizeTemplatePath: file => {
                        const { sourceFile } = file;
                        // Use docker-compose files from docker generator
                        if (
                            sourceFile.includes('src/main/docker') &&
                            !sourceFile.includes('src/main/docker/jhipster-control-center.yml') &&
                            !sourceFile.includes('src/main/docker/jib') &&
                            !sourceFile.includes('src/main/docker/grafana') &&
                            !sourceFile.includes('src/main/docker/monitoring.yml')
                        ) {
                            return undefined;
                        }

                        // Use wrappers scripts from maven/gradle generators
                        if (file.sourceFile.includes('.mvnw') || file.sourceFile.includes('gradle/wrapper/')) {
                            return undefined;
                        }

                        const sourceBasename = basename(sourceFile);

                        // Ignore files migrated to modularized templates
                        return [
                            // jhipster-kotlin:kotlin
                            'GeneratedByJHipster.java',
                            // jhipster:java:node
                            'npmw',
                            'npmw.cmd',
                            // jhipster:maven
                            'maven-wrapper.jar',
                            'maven-wrapper.properties',
                            'mvnw',
                            'mvnw.cmd',
                            // jhipster:gradle
                            'gradlew',
                            'gradlew.bat',
                            // jhipster:java:docker
                            'entrypoint.sh',
                            // jhipster:spring-cloud:gateway
                            'JWTRelayGatewayFilterFactory.java',
                            'GatewayResource.java',
                            'RouteVM.java',
                            // jhipster:spring-data-couchbase
                            'DatabaseConfiguration_couchbase.java',
                            // jhipster:spring-data-cassandra
                            'DatabaseConfiguration_cassandra.java',
                            'EmbeddedCassandra.java',
                            'CassandraTestContainer.java',
                            'CassandraKeyspaceIT.java',
                            // jhipster:spring-data-mongodb
                            'DatabaseConfiguration_mongodb.java',
                            'EmbeddedMongo.java',
                            'MongoDbTestContainer.java',
                            'InitialSetupMigration.java',
                            // jhipster:spring-data-neo4j
                            'DatabaseConfiguration_neo4j.java',
                            'EmbeddedNeo4j.java',
                            'Neo4jTestContainer.java',
                            'Neo4jMigrations.java',
                            // jhipster:spring-data-elasticsearch
                            'ElasticsearchConfiguration.java',
                            'EmbeddedElasticsearch.java',
                            'ElasticsearchTestContainer.java',
                            'ElasticsearchTestConfiguration.java',
                            'UserSearchRepository.java',
                            // jhipster:spring-data-relational
                            'DatabaseConfiguration_sql.java',
                            'UserSqlHelper.java',
                            'ColumnConverter.java',
                            'EntityManager.java',
                            'application-testdev.yml',
                            'application-testprod.yml',
                            // jhipster:cucumber
                            'CucumberIT.java',
                            'StepDefs.java',
                            'UserStepDefs.java',
                            'CucumberTestContextConfiguration.java',
                            'user.feature',
                            'gitkeep',
                            // jhipster:spring-cache
                            'CacheConfiguration.java',
                            'CacheFactoryConfiguration.java',
                            'EmbeddedRedis.java',
                            'RedisTestContainer.java',
                            // jhipster:spring-websocket
                            'WebsocketConfiguration.java',
                            'WebsocketSecurityConfiguration.java',
                            'ActivityService.java',
                            'ActivityDTO.java',
                            // jhipster:java:jib
                            'docker.gradle',
                            // jhipster:java:code-quality
                            'sonar.gradle',
                            // jhipster:feign-client
                            'AuthorizedFeignClient.java',
                            'OAuth2InterceptedFeignConfiguration.java',
                            'TokenRelayRequestInterceptor.java',
                            'FeignConfiguration.java',
                            'JWT_UserFeignClientInterceptor.java',
                            'OAuth2UserClientFeignConfiguration.java',
                            'OAuth2_UserFeignClientInterceptor.java',
                            'AuthorizationHeaderUtilTest.java',
                            'AuthorizationHeaderUtil.java',
                            'OAuthIdpTokenResponseDTO.java',
                            // jhipster:spring-cloud-stream:kafka
                            'KafkaTestContainer.java',
                            'EmbeddedKafka.java',
                            'EmbeddedKafka.java',
                            'EmbeddedKafka.java',
                            'KafkaResource.java',
                            'KafkaResourceIT.java',
                            'KafkaResource_reactive.java',
                            'KafkaResourceIT_reactive.java',
                            'KafkaSseConsumer.java',
                            'KafkaSseProducer.java',
                            // jhipster:java:openapi-generator v7.6.1
                            'swagger.gradle',
                            // jhipster:java-simple-application:gradle
                            'build.gradle',
                        ].includes(sourceBasename)
                            ? undefined
                            : file;
                    },
                });
            },
        });
    }

    get [BaseApplicationGenerator.WRITING_ENTITIES]() {
        return this.asWritingEntitiesTaskGroup({
            async writingEntitiesTemplateTask({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtInUser && !entity.builtInAuthority)) {
                    await this.writeFiles({
                        sections: entityServerFiles,
                        context: { ...application, ...entity, entity },
                        rootTemplatesPath: application.reactive ? ['reactive', ''] : [''],
                        customizeTemplatePath: file => {
                            const sourceBasename = basename(file.sourceFile);
                            // Files migrated to modularized templates
                            return [
                                'EntityTest.java',
                                'EntityRepository.java',
                                'EntityRepository_reactive.java',
                                'EntityRowMapper.java',
                                'EntitySqlHelper_reactive.java',
                                'EntityRepositoryInternalImpl_reactive.java',
                                'EntityCallback.java',
                                'EntitySqlHelper_reactive.java',
                                'EntityRepositoryWithBagRelationships.java',
                                'EntityRepositoryWithBagRelationshipsImpl.java',
                                'EntityRepositoryInternalImpl_reactive.java',
                                'EntitySearchRepository.java',
                            ].includes(sourceBasename) || sourceBasename.startsWith('Entity.java.jhi')
                                ? undefined
                                : file;
                        },
                    });
                }
            },

            // Can be dropped for jhipster 8.7.0
            async writeEnumFiles({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer)) {
                    for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
                        const enumInfo = {
                            ...application,
                            ...getEnumInfo(field, entity.clientRootFolder),
                            frontendAppName: entity.frontendAppName,
                            packageName: application.packageName,
                            javaPackageSrcDir: application.javaPackageSrcDir,
                            entityJavaPackageFolder: entity.entityJavaPackageFolder,
                            entityAbsolutePackage: entity.entityAbsolutePackage || application.packageName,
                        };
                        await this.writeFiles({
                            blocks: [
                                {
                                    templates: [
                                        {
                                            file: `${SERVER_MAIN_SRC_KOTLIN_DIR}_package_/_entityPackage_/domain/enumeration/_enumName_.kt`,
                                            renameTo: () =>
                                                `${SERVER_MAIN_SRC_KOTLIN_DIR}${entity.entityAbsoluteFolder}/domain/enumeration/${field.fieldType}.kt`,
                                        },
                                    ],
                                },
                            ],
                            rootTemplatesPath: ['../../spring-boot/templates/domain/'],
                            context: enumInfo,
                        });
                    }
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async jhipsterV7Dependencies({ application, source }) {
                source.addJavaDefinition({
                    dependencies: [
                        { groupId: 'io.dropwizard.metrics', artifactId: 'metrics-core' },
                        { groupId: 'org.zalando', artifactId: `problem-spring-${application.reactive ? 'webflux' : 'web'}` },
                        {
                            groupId: 'tech.jhipster',
                            artifactId: 'jhipster-dependencies',
                            version: application.jhipsterDependenciesVersion,
                            type: 'pom',
                            scope: 'import',
                        },
                    ],
                });

                if (application.authenticationTypeJwt) {
                    source.addJavaDefinition({
                        dependencies: [
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-api' },
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-impl', scope: 'runtime' },
                            { groupId: 'io.jsonwebtoken', artifactId: 'jjwt-jackson', scope: 'compile' },
                        ],
                    });
                } else if (application.authenticationTypeOauth2) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.springframework.boot', artifactId: 'spring-boot-starter-oauth2-resource-server' }],
                    });
                }

                if (application.applicationTypeGateway || application.applicationTypeMicroservice) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.springframework.cloud', artifactId: 'spring-cloud-starter-openfeign' }],
                    });
                }
                if (application.databaseTypeMongodb) {
                    source.addJavaDefinition({
                        dependencies: [
                            { groupId: 'org.mongodb', artifactId: 'mongodb-driver-sync' },
                            ...(application.reactive ? [{ groupId: 'org.mongodb', artifactId: 'mongodb-driver-reactivestreams' }] : []),
                        ],
                    });
                }
                if (application.databaseTypeCassandra) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.cassandraunit', artifactId: 'cassandra-unit-spring' }],
                    });
                }
                if (application.databaseTypeSql && application.reactive) {
                    source.addJavaDefinition({
                        dependencies: [{ groupId: 'org.apache.commons', artifactId: 'commons-collections4' }],
                    });
                }
            },
            customizeGradle({ application, source }) {
                if (application.buildToolGradle) {
                    source.addGradleProperty({ property: 'mapstructVersion', value: application.javaDependencies.mapstruct });
                    source.addGradleProperty({ property: 'springBootVersion', value: application.javaDependencies['spring-boot'] });
                    if (application.databaseTypeSql) {
                        source.addGradleProperty({ property: 'liquibase.version', value: application.javaDependencies.liquibase });
                        source.addGradleProperty({ property: 'hibernateVersion', value: application.javaDependencies.hibernate });
                        source.addGradleProperty({ property: 'jaxbRuntimeVersion', value: '4.0.0' });
                    }
                    if (application.databaseTypeCassandra) {
                        source.addGradleProperty({ property: 'cassandraDriverVersion', value: '4.14.1' });
                    }
                    source.addGradleDependencies([{ groupId: 'tech.jhipster', artifactId: 'jhipster-framework', scope: 'implementation' }]);
                    if (application.databaseTypeSql && !application.reactive) {
                        source.addGradleDependencies([
                            {
                                groupId: 'com.fasterxml.jackson.datatype',
                                artifactId: 'jackson-datatype-hibernate5',
                                scope: 'implementation',
                            },
                        ]);
                    }
                    source.addGradleDependencyCatalogPlugin({
                        pluginName: 'spring-dependency-management',
                        id: 'io.spring.dependency-management',
                        version: '1.1.7',
                        addToBuild: true,
                    });
                }
            },
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [
                            { property: 'modernizer-maven-plugin.version', value: application.javaDependencies['modernizer-maven-plugin'] },
                            { property: 'spring-boot.version', value: application.javaDependencies['spring-boot'] },
                            {
                                property: 'maven-resources-plugin.version',
                                value: application.javaDependencies['maven-resources-plugin'] || '3.3.0',
                            },
                        ],
                        dependencies: [
                            {
                                groupId: 'tech.jhipster',
                                artifactId: 'jhipster-framework',
                                additionalContent: application.reactive
                                    ? `
            <exclusions>
                <exclusion>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-webmvc</artifactId>
                </exclusion>
            </exclusions>`
                                    : '',
                            },
                        ],
                    });

                    if (application.databaseTypeSql) {
                        source.addMavenDefinition({
                            properties: [
                                { property: 'jaxb-runtime.version', value: '4.0.0' },
                                { property: 'liquibase-hibernate5.version', value: application.javaDependencies.liquibase },
                                { property: 'liquibase.version', value: application.javaDependencies.liquibase },
                                { property: 'hibernate.version', value: application.javaDependencies.hibernate },
                            ],
                        });
                    }
                }
            },
            migrateOpenApi({ application }) {
                if (!application.enableSwaggerCodegen) return;
                if (application.buildToolGradle) {
                    this.editFile('buildSrc/src/main/groovy/jhipster.openapi-generator-conventions.gradle', content =>
                        content.replace(', useSpringBoot3: "true"', ''),
                    );
                } else if (application.buildToolMaven) {
                    this.editFile('pom.xml', content => content.replace('<useSpringBoot3>true</useSpringBoot3>', ''));
                }
            },
        });
    }
}
