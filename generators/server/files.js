/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const mkdirp = require('mkdirp');
const cleanup = require('generator-jhipster/generators/cleanup');
const constants = require('generator-jhipster/generators/generator-constants');
const baseServerFiles = require('generator-jhipster/generators/server/files').serverFiles;
const kotlinConstants = require('../generator-kotlin-constants');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_KOTLIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_TEST_SRC_KOTLIN_DIR = `${constants.TEST_DIR}kotlin/`;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;
const TEST_DIR = constants.TEST_DIR;

// TODO: Do a PR in the parent JHipster project to export and re-use here as well in order to have a single source of truth!!!
const shouldSkipUserManagement = generator =>
    generator.skipUserManagement && (generator.applicationType !== 'monolith' || generator.authenticationType !== 'oauth2');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
    ...baseServerFiles,
    serverBuild: [
        ...baseServerFiles.serverBuild,
        {
            condition: generator => generator.buildTool === 'gradle',
            templates: [{ file: 'gradle/kotlin.gradle', useBluePrint: true }]
        }
    ],
    serverResource: [
        {
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    file: 'banner.txt',
                    method: 'copy',
                    noEjs: true,
                    renameTo: () => 'banner.txt',
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.clientFramework === 'react',
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    file: 'banner-react.txt',
                    method: 'copy',
                    noEjs: true,
                    renameTo: () => 'banner.txt'
                }
            ]
        },
        {
            condition: generator => generator.clientFramework !== 'react',
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'banner.txt', method: 'copy', noEjs: true }]
        },
        {
            condition: generator => generator.devDatabaseType === 'h2Disk' || generator.devDatabaseType === 'h2Memory',
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'h2.server.properties', renameTo: () => '.h2.server.properties' }]
        },
        {
            condition: generator => !!generator.enableSwaggerCodegen,
            path: SERVER_MAIN_RES_DIR,
            templates: ['swagger/api.yml']
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
                'i18n/messages.properties'
            ]
        },
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_MAIN_RES_DIR,
            templates: [
                {
                    file: 'config/liquibase/changelog/initial_schema.xml',
                    renameTo: () => 'config/liquibase/changelog/00000000000000_initial_schema.xml',
                    options: { interpolate: INTERPOLATE_REGEX }
                },
                { file: 'config/liquibase/master.xml', method: 'copy' }
            ]
        },
        {
            condition: generator => generator.databaseType === 'mongodb',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/dbmigrations/package-info.java',
                    renameTo: generator => `${generator.javaDir}config/dbmigrations/package-info.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.databaseType === 'mongodb' &&
                (!generator.skipUserManagement || (generator.skipUserManagement && generator.authenticationType === 'oauth2')),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/dbmigrations/InitialSetupMigration.kt',
                    renameTo: generator => `${generator.javaDir}config/dbmigrations/InitialSetupMigration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'couchbase',
            path: SERVER_MAIN_RES_DIR,
            templates: ['config/couchmove/changelog/V0__create_indexes.n1ql']
        },
        {
            condition: generator =>
                generator.databaseType === 'couchbase' && (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
            path: SERVER_MAIN_RES_DIR,
            templates: [
                'config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json',
                'config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json',
                'config/couchmove/changelog/V0.1__initial_setup/user__admin.json',
                'config/couchmove/changelog/V0.1__initial_setup/user__anonymoususer.json',
                'config/couchmove/changelog/V0.1__initial_setup/user__system.json',
                'config/couchmove/changelog/V0.1__initial_setup/user__user.json'
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_RES_DIR,
            templates: [
                'config/cql/create-keyspace-prod.cql',
                'config/cql/create-keyspace.cql',
                'config/cql/drop-keyspace.cql',
                { file: 'config/cql/changelog/README.md', method: 'copy' }
            ]
        },
        {
            condition: generator =>
                generator.databaseType === 'cassandra' &&
                generator.applicationType !== 'microservice' &&
                (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
            path: SERVER_MAIN_RES_DIR,
            templates: [
                { file: 'config/cql/changelog/create-tables.cql', renameTo: () => 'config/cql/changelog/00000000000000_create-tables.cql' },
                {
                    file: 'config/cql/changelog/insert_default_users.cql',
                    renameTo: () => 'config/cql/changelog/00000000000001_insert_default_users.cql'
                }
            ]
        }
    ],
    serverJavaAuthConfig: [
        {
            condition: generator =>
                generator.databaseType === 'sql' || generator.databaseType === 'mongodb' || generator.databaseType === 'couchbase',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/SpringSecurityAuditorAware.java',
                    renameTo: generator => `${generator.javaDir}security/SpringSecurityAuditorAware.java`
                }
            ]
        },
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/SecurityUtils.java',
                    renameTo: generator => `${generator.javaDir}security/SecurityUtils.java`
                },
                {
                    file: 'package/security/AuthoritiesConstants.java',
                    renameTo: generator => `${generator.javaDir}security/AuthoritiesConstants.java`
                },
                {
                    file: 'package/security/package-info.java',
                    renameTo: generator => `${generator.javaDir}security/package-info.java`
                }
            ]
        },
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/security/SecurityUtilsUnitTest.java',
                    renameTo: generator => `${generator.testDir}security/SecurityUtilsUnitTest.java`
                }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/jwt/TokenProvider.java',
                    renameTo: generator => `${generator.javaDir}security/jwt/TokenProvider.java`
                },
                {
                    file: 'package/security/jwt/JWTFilter.java',
                    renameTo: generator => `${generator.javaDir}security/jwt/JWTFilter.java`
                }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'jwt' && !generator.reactive,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/jwt/JWTConfigurer.java',
                    renameTo: generator => `${generator.javaDir}security/jwt/JWTConfigurer.java`
                }
            ]
        },
        {
            condition: generator =>
                !generator.reactive &&
                (generator.applicationType === 'microservice' ||
                    (generator.applicationType !== 'uaa' &&
                        ((shouldSkipUserManagement(generator) && generator.authenticationType === 'jwt') ||
                            !shouldSkipUserManagement(generator) ||
                            generator.authenticationType === 'uaa'))),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/SecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                generator.reactive &&
                (generator.applicationType === 'microservice' ||
                    (generator.applicationType !== 'uaa' &&
                        ((shouldSkipUserManagement(generator) && generator.authenticationType === 'jwt') ||
                            !shouldSkipUserManagement(generator) ||
                            generator.authenticationType === 'uaa'))),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ReactiveSecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.applicationType === 'uaa',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/UaaWebSecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/UaaWebSecurityConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/UaaConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/UaaConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/UaaProperties.kt',
                    renameTo: generator => `${generator.javaDir}config/UaaProperties.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.applicationType === 'uaa',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/IatTokenEnhancer.java',
                    renameTo: generator => `${generator.javaDir}security/IatTokenEnhancer.java`
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === 'session',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/PersistentTokenRememberMeServices.java',
                    renameTo: generator => `${generator.javaDir}security/PersistentTokenRememberMeServices.java`
                },
                {
                    file: 'package/domain/PersistentToken.java',
                    renameTo: generator => `${generator.javaDir}domain/PersistentToken.java`
                },
                {
                    file: 'package/repository/PersistentTokenRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.java`
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === 'oauth2',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/OAuth2Configuration.kt',
                    renameTo: generator => `${generator.javaDir}config/OAuth2Configuration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === 'oauth2',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/OAuth2AuthenticationSuccessHandler.java',
                    renameTo: generator => `${generator.javaDir}security/OAuth2AuthenticationSuccessHandler.java`
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== 'oauth2',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/DomainUserDetailsService.java',
                    renameTo: generator => `${generator.javaDir}security/DomainUserDetailsService.java`
                },
                {
                    file: 'package/security/UserNotActivatedException.java',
                    renameTo: generator => `${generator.javaDir}security/UserNotActivatedException.java`
                }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === 'jwt',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/vm/LoginVM.java',
                    renameTo: generator => `${generator.javaDir}web/rest/vm/LoginVM.java`
                },
                {
                    file: 'package/web/rest/UserJWTController.java',
                    renameTo: generator => `${generator.javaDir}web/rest/UserJWTController.java`
                }
            ]
        }
    ],
    serverJavaGateway: [
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/GatewayConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/GatewayConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/apidoc/GatewaySwaggerResourcesProvider.kt',
                    renameTo: generator => `${generator.javaDir}config/apidoc/GatewaySwaggerResourcesProvider.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/gateway/ratelimiting/RateLimitingFilter.java',
                    renameTo: generator => `${generator.javaDir}gateway/ratelimiting/RateLimitingFilter.java`
                },
                {
                    file: 'package/gateway/accesscontrol/AccessControlFilter.java',
                    renameTo: generator => `${generator.javaDir}gateway/accesscontrol/AccessControlFilter.java`
                },
                {
                    file: 'package/gateway/responserewriting/SwaggerBasePathRewritingFilter.java',
                    renameTo: generator => `${generator.javaDir}gateway/responserewriting/SwaggerBasePathRewritingFilter.java`
                },
                { file: 'package/web/rest/vm/RouteVM.java', renameTo: generator => `${generator.javaDir}web/rest/vm/RouteVM.java` },
                {
                    file: 'package/web/rest/GatewayResource.java',
                    renameTo: generator => `${generator.javaDir}web/rest/GatewayResource.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.applicationType === 'gateway' && generator.authenticationType === 'jwt' && generator.serviceDiscoveryType,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/gateway/TokenRelayFilter.java',
                    renameTo: generator => `${generator.javaDir}gateway/TokenRelayFilter.java`
                }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.authenticationType === 'uaa',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/oauth2/OAuth2AuthenticationConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/oauth2/OAuth2AuthenticationConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.authenticationType === 'uaa',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                { file: 'package/web/rest/AuthResource.java', renameTo: generator => `${generator.javaDir}web/rest/AuthResource.java` },
                {
                    file: 'package/web/filter/RefreshTokenFilter.java',
                    renameTo: generator => `${generator.javaDir}web/filter/RefreshTokenFilter.java`
                },
                {
                    file: 'package/web/filter/RefreshTokenFilterConfigurer.java',
                    renameTo: generator => `${generator.javaDir}web/filter/RefreshTokenFilterConfigurer.java`
                },
                {
                    file: 'package/security/oauth2/CookieCollection.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CookieCollection.java`
                },
                {
                    file: 'package/security/oauth2/CookiesHttpServletRequestWrapper.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CookiesHttpServletRequestWrapper.java`
                },
                {
                    file: 'package/security/oauth2/CookieTokenExtractor.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CookieTokenExtractor.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2AuthenticationService.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2AuthenticationService.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2CookieHelper.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2CookieHelper.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2Cookies.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2Cookies.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2TokenEndpointClient.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2TokenEndpointClient.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2TokenEndpointClientAdapter.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2TokenEndpointClientAdapter.java`
                },
                {
                    file: 'package/security/oauth2/UaaTokenEndpointClient.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/UaaTokenEndpointClient.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.applicationType === 'gateway' && generator.authenticationType === 'oauth2' && generator.serviceDiscoveryType,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/OAuth2Configuration.kt',
                    renameTo: generator => `${generator.javaDir}config/OAuth2Configuration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                generator.applicationType === 'gateway' && generator.authenticationType === 'oauth2' && generator.serviceDiscoveryType,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/OAuth2AuthenticationSuccessHandler.java',
                    renameTo: generator => `${generator.javaDir}security/OAuth2AuthenticationSuccessHandler.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.authenticationType === 'oauth2' &&
                (generator.applicationType === 'monolith' || generator.applicationType === 'gateway'),
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/LogoutResource.java',
                    renameTo: generator => `${generator.javaDir}web/rest/LogoutResource.java`
                }
            ]
        }
    ],
    serverMicroservice: [
        {
            condition: generator =>
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) && generator.authenticationType === 'uaa',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/oauth2/OAuth2Properties.kt',
                    renameTo: generator => `${generator.javaDir}config/oauth2/OAuth2Properties.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/oauth2/OAuth2JwtAccessTokenConverter.kt',
                    renameTo: generator => `${generator.javaDir}config/oauth2/OAuth2JwtAccessTokenConverter.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) && generator.authenticationType === 'uaa',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/OAuth2SignatureVerifierClient.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/OAuth2SignatureVerifierClient.java`
                },
                {
                    file: 'package/security/oauth2/UaaSignatureVerifierClient.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/UaaSignatureVerifierClient.java`
                }
            ]
        },
        {
            condition: generator =>
                !generator.reactive &&
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) &&
                generator.applicationType === 'microservice' &&
                generator.authenticationType === 'uaa',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/FeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/FeignConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                !generator.reactive &&
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) &&
                generator.applicationType === 'microservice' &&
                generator.authenticationType === 'uaa',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/client/AuthorizedFeignClient.java',
                    renameTo: generator => `${generator.javaDir}client/AuthorizedFeignClient.java`
                },
                {
                    file: 'package/client/OAuth2InterceptedFeignConfiguration.java',
                    renameTo: generator => `${generator.javaDir}client/OAuth2InterceptedFeignConfiguration.java`
                },
                {
                    file: 'package/client/AuthorizedUserFeignClient.java',
                    renameTo: generator => `${generator.javaDir}client/AuthorizedUserFeignClient.java`
                },
                {
                    file: 'package/client/OAuth2_UserFeignClientInterceptor.java',
                    renameTo: generator => `${generator.javaDir}client/UserFeignClientInterceptor.java`
                },
                {
                    file: 'package/client/OAuth2UserClientFeignConfiguration.java',
                    renameTo: generator => `${generator.javaDir}client/OAuth2UserClientFeignConfiguration.java`
                }
            ]
        },
        {
            condition: generator =>
                !generator.reactive &&
                (generator.applicationType === 'microservice' || generator.applicationType === 'gateway') &&
                generator.authenticationType === 'jwt',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/FeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/FeignConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                !generator.reactive &&
                (generator.applicationType === 'microservice' || generator.applicationType === 'gateway') &&
                generator.authenticationType === 'jwt',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/client/JWT_UserFeignClientInterceptor.java',
                    renameTo: generator => `${generator.javaDir}client/UserFeignClientInterceptor.java`
                }
            ]
        },
        {
            condition: generator =>
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) && generator.authenticationType === 'oauth2',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/AuthorizationHeaderUtil.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/AuthorizationHeaderUtil.java`
                },
                {
                    file: 'package/security/oauth2/SimplePrincipalExtractor.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/SimplePrincipalExtractor.java`
                },
                {
                    file: 'package/security/oauth2/SimpleAuthoritiesExtractor.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/SimpleAuthoritiesExtractor.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.applicationType === 'microservice' &&
                generator.authenticationType === 'oauth2' &&
                generator.cacheProvider !== 'no',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/CachedUserInfoTokenServices.java',
                    renameTo: generator => `${generator.javaDir}security/oauth2/CachedUserInfoTokenServices.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.authenticationType === 'oauth2' &&
                (generator.applicationType === 'microservice' || generator.applicationType === 'gateway'),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/FeignConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/FeignConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/OAuth2TokenServicesConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/OAuth2TokenServicesConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                generator.authenticationType === 'oauth2' &&
                (generator.applicationType === 'microservice' || generator.applicationType === 'gateway'),
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/client/AuthorizedFeignClient.java',
                    renameTo: generator => `${generator.javaDir}client/AuthorizedFeignClient.java`
                },
                {
                    file: 'package/client/OAuth2InterceptedFeignConfiguration.java',
                    renameTo: generator => `${generator.javaDir}client/OAuth2InterceptedFeignConfiguration.java`
                },
                {
                    file: 'package/client/TokenRelayRequestInterceptor.java',
                    renameTo: generator => `${generator.javaDir}client/TokenRelayRequestInterceptor.java`
                }
            ]
        },
        {
            condition: generator =>
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) &&
                (generator.authenticationType === 'oauth2' && generator.applicationType === 'gateway'),
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/OAuth2SsoConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/OAuth2SsoConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                !(
                    generator.applicationType !== 'microservice' &&
                    !(
                        generator.applicationType === 'gateway' &&
                        (generator.authenticationType === 'uaa' || generator.authenticationType === 'oauth2')
                    )
                ) && generator.applicationType === 'microservice',
            path: SERVER_MAIN_RES_DIR,
            templates: [{ file: 'static/microservices_index.html', method: 'copy', renameTo: () => 'static/index.html' }]
        }
    ],
    ...baseServerFiles.serverResource.serverMicroserviceAndGateway,
    serverJavaApp: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/Application.kt',
                    useBluePrint: true,
                    renameTo: generator => `${generator.javaDir}${generator.mainClass}.kt`
                },
                {
                    file: 'package/ApplicationWebXml.kt',
                    renameTo: generator => `${generator.javaDir}ApplicationWebXml.kt`,
                    useBluePrint: true
                }
            ]
        }
    ],
    serverJavaConfig: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/aop/logging/LoggingAspect.kt',
                    renameTo: generator => `${generator.javaDir}aop/logging/LoggingAspect.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/DefaultProfileUtil.kt',
                    renameTo: generator => `${generator.javaDir}config/DefaultProfileUtil.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/AsyncConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/AsyncConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/Constants.kt',
                    renameTo: generator => `${generator.javaDir}config/Constants.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/DateTimeFormatConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/DateTimeFormatConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/LoggingConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LoggingConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/ApplicationProperties.kt',
                    renameTo: generator => `${generator.javaDir}config/ApplicationProperties.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/JacksonConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/JacksonConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/LocaleConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LocaleConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/LoggingAspectConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LoggingAspectConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/WebConfigurer.kt',
                    renameTo: generator => `${generator.javaDir}config/WebConfigurer.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            // TODO: remove when supported by spring-data
            condition: generator => generator.reactive,
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ReactivePageableHandlerMethodArgumentResolver.kt',
                    renameTo: generator => `${generator.javaDir}config/ReactivePageableHandlerMethodArgumentResolver.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/ReactiveSortHandlerMethodArgumentResolver.kt',
                    renameTo: generator => `${generator.javaDir}config/ReactiveSortHandlerMethodArgumentResolver.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                ['ehcache', 'hazelcast', 'infinispan', 'memcached'].includes(generator.cacheProvider) ||
                generator.applicationType === 'gateway',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/CacheConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.cacheProvider === 'infinispan',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheFactoryConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/CacheFactoryConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator =>
                generator.databaseType === 'sql' || generator.databaseType === 'mongodb' || generator.databaseType === 'couchbase',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CloudDatabaseConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/CloudDatabaseConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/DatabaseConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/DatabaseConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/audit/AuditEventConverter.kt',
                    renameTo: generator => `${generator.javaDir}config/audit/AuditEventConverter.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/LiquibaseConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LiquibaseConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'couchbase',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/N1qlCouchbaseRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/N1qlCouchbaseRepository.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/repository/CustomN1qlCouchbaseRepository.kt',
                    renameTo: generator => `${generator.javaDir}repository/CustomN1qlCouchbaseRepository.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/WebsocketConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/WebsocketConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/WebsocketSecurityConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/WebsocketSecurityConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/metrics/JHipsterHealthIndicatorConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/metrics/CassandraHealthIndicator.kt',
                    renameTo: generator => `${generator.javaDir}config/metrics/CassandraHealthIndicator.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/cassandra/CassandraConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/cassandra/CassandraConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ElasticsearchConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/ElasticsearchConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.messageBroker === 'kafka',
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/MessagingConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/MessagingConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        }
    ],
    ...baseServerFiles.serverResource.serverJavaDomain,
    ...baseServerFiles.serverResource.serverJavaPackageInfo,
    ...baseServerFiles.serverResource.serverJavaService,
    ...baseServerFiles.serverResource.serverJavaWebError,
    ...baseServerFiles.serverResource.serverJavaWeb,
    ...baseServerFiles.serverResource.serverJavaWebsocket,
    serverTestFw: [
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/CassandraKeyspaceUnitTest.kt',
                    renameTo: generator => `${generator.testDir}CassandraKeyspaceUnitTest.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/AbstractCassandraTest.kt',
                    renameTo: generator => `${generator.testDir}AbstractCassandraTest.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/CassandraTestConfiguration.kt',
                    renameTo: generator => `${generator.testDir}config/CassandraTestConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_TEST_RES_DIR,
            templates: ['cassandra-random-port.yml']
        },
        {
            condition: generator => generator.databaseType === 'couchbase',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/DatabaseTestConfiguration.kt',
                    renameTo: generator => `${generator.testDir}config/DatabaseTestConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            path: SERVER_TEST_SRC_DIR,
            templates: [
                { file: 'package/web/rest/TestUtil.java', renameTo: generator => `${generator.testDir}web/rest/TestUtil.java` },
                {
                    file: 'package/web/rest/LogsResourceIntTest.java',
                    renameTo: generator => `${generator.testDir}web/rest/LogsResourceIntTest.java`
                },
                {
                    file: 'package/web/rest/errors/ExceptionTranslatorIntTest.java',
                    renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorIntTest.java`
                },
                {
                    file: 'package/web/rest/errors/ExceptionTranslatorTestController.java',
                    renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorTestController.java`
                },
                {
                    file: 'package/web/rest/util/PaginationUtilUnitTest.java',
                    renameTo: generator => `${generator.testDir}web/rest/util/PaginationUtilUnitTest.java`
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/timezone/HibernateTimeZoneTest.kt',
                    renameTo: generator => `${generator.testDir}config/timezone/HibernateTimeZoneTest.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/timezone/DateTimeWrapper.java',
                    renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapper.java`
                },
                {
                    file: 'package/repository/timezone/DateTimeWrapperRepository.java',
                    renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapperRepository.java`
                }
            ]
        },
        {
            path: SERVER_TEST_RES_DIR,
            templates: ['config/application.yml', 'logback.xml']
        },
        {
            // TODO : add these tests to reactive
            condition: generator => !generator.reactive,
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/WebConfigurerTest.kt',
                    renameTo: generator => `${generator.testDir}config/WebConfigurerTest.kt`,
                    useBluePrint: true
                },
                {
                    file: 'package/config/WebConfigurerTestController.kt',
                    renameTo: generator => `${generator.testDir}config/WebConfigurerTestController.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
            path: SERVER_TEST_SRC_DIR,
            templates: [
                // Create Gateway tests files
                {
                    file: 'package/gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java',
                    renameTo: generator => `${generator.testDir}gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java`
                }
            ]
        },
        {
            condition: generator => generator.serviceDiscoveryType,
            path: SERVER_TEST_RES_DIR,
            templates: ['config/bootstrap.yml']
        },
        {
            condition: generator => generator.authenticationType === 'uaa',
            path: SERVER_TEST_SRC_KOTLIN_DIR,
            templates: [
                {
                    file: 'package/config/SecurityBeanOverrideConfiguration.kt',
                    renameTo: generator => `${generator.testDir}config/SecurityBeanOverrideConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'uaa',
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/security/OAuth2TokenMockUtil.java',
                    renameTo: generator => `${generator.testDir}security/OAuth2TokenMockUtil.java`
                }
            ]
        },
        {
            condition: generator => generator.authenticationType === 'uaa' && generator.applicationType === 'gateway',
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/security/oauth2/OAuth2CookieHelperTest.java',
                    renameTo: generator => `${generator.testDir}security/oauth2/OAuth2CookieHelperTest.java`
                },
                {
                    file: 'package/security/oauth2/OAuth2AuthenticationServiceTest.java',
                    renameTo: generator => `${generator.testDir}security/oauth2/OAuth2AuthenticationServiceTest.java`
                },
                {
                    file: 'package/security/oauth2/CookieTokenExtractorTest.java',
                    renameTo: generator => `${generator.testDir}security/oauth2/CookieTokenExtractorTest.java`
                },
                {
                    file: 'package/security/oauth2/CookieCollectionTest.java',
                    renameTo: generator => `${generator.testDir}security/oauth2/CookieCollectionTest.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.authenticationType === 'oauth2' &&
                (generator.applicationType === 'monolith' || generator.applicationType === 'gateway'),
            path: SERVER_TEST_SRC_DIR,
            templates: [
                {
                    file: 'package/web/rest/LogoutResourceIntTest.java',
                    renameTo: generator => `${generator.testDir}web/rest/LogoutResourceIntTest.java`
                }
            ]
        },
        {
            condition: generator => {
                if (generator.gatlingTests) {
                    mkdirp(`${TEST_DIR}gatling/user-files/data`);
                    mkdirp(`${TEST_DIR}gatling/user-files/bodies`);
                    mkdirp(`${TEST_DIR}gatling/user-files/simulations`);
                    return true;
                }
                return false;
            },
            path: TEST_DIR,
            templates: [
                // Create Gatling test files
                'gatling/conf/gatling.conf',
                'gatling/conf/logback.xml'
            ]
        },
        {
            condition: generator => generator.cucumberTests,
            path: SERVER_TEST_SRC_DIR,
            templates: [
                // Create Cucumber test files
                { file: 'package/cucumber/CucumberTest.java', renameTo: generator => `${generator.testDir}cucumber/CucumberTest.java` },
                {
                    file: 'package/cucumber/stepdefs/StepDefs.java',
                    renameTo: generator => `${generator.testDir}cucumber/stepdefs/StepDefs.java`
                },
                {
                    file: 'package/cucumber/CucumberContextConfiguration.java',
                    renameTo: generator => `${generator.testDir}cucumber/CucumberContextConfiguration.java`
                },
                { file: '../features/gitkeep', noEjs: true }
            ]
        },
        {
            condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== 'oauth2',
            path: SERVER_TEST_SRC_DIR,
            templates: [
                // Create auth config test files
                {
                    file: 'package/security/DomainUserDetailsServiceIntTest.java',
                    renameTo: generator => `${generator.testDir}security/DomainUserDetailsServiceIntTest.java`
                }
            ]
        }
    ],
    ...baseServerFiles.serverResource.serverJavaUserManagement
};

function writeFiles() {
    return {
        setUp() {
            this.javaDir = `${this.packageFolder}/`;
            this.testDir = `${this.packageFolder}/`;

            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            mkdirp(`${SERVER_TEST_SRC_DIR}/${this.testDir}`);
            mkdirp(`${SERVER_TEST_SRC_KOTLIN_DIR}/${this.testDir}`);
            this.generateKeyStore();
        },

        cleanupOldServerFiles() {
            cleanup.cleanupOldServerFiles(
                this,
                `${SERVER_MAIN_SRC_DIR}/${this.javaDir}`,
                `${SERVER_TEST_SRC_DIR}/${this.testDir}`,
                SERVER_MAIN_RES_DIR,
                SERVER_TEST_RES_DIR
            );
        },

        writeFiles() {
            writeFilesToDisk(serverFiles, this, false, this.fetchFromInstalledJHipster('server/templates'));
        },

        modifyFiles() {
            if (this.buildTool === 'gradle') {
                this.addGradleProperty('kotlin_version', kotlinConstants.KOTLIN_VERSION);
                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-gradle-plugin', '${kotlin_version}');
                this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-allopen', '${kotlin_version}');
                if (this.databaseType === 'sql') {
                    this.addGradlePlugin('org.jetbrains.kotlin', 'kotlin-noarg', '${kotlin_version}');
                }

                this.applyFromGradleScript('gradle/kotlin');
            }

            if (this.buildTool === 'maven') {
                this.addMavenProperty('kotlin.version', kotlinConstants.KOTLIN_VERSION);
                this.addMavenDependencyManagement('org.jetbrains.kotlin', 'kotlin-stdlib', '${kotlin.version}');
                this.addMavenDependencyManagement('org.jetbrains.kotlin', 'kotlin-stdlib-jdk7', '${kotlin.version}');
                this.addMavenDependency('com.fasterxml.jackson.datatype', 'jackson-datatype-json-org');
                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-stdlib-jdk8', '${kotlin.version}');
                this.addMavenDependency('org.jetbrains.kotlin', 'kotlin-reflect', '${kotlin.version}');
                this.addMavenDependency(
                    'org.jetbrains.kotlin',
                    'kotlin-test-junit',
                    '${kotlin.version}',
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
                                <path>
                                    <groupId>org.mapstruct</groupId>
                                    <artifactId>mapstruct-processor</artifactId>
                                    <version>$\{mapstruct.version}</version>
                                </path>
                                ${
                                    this.databaseType === 'sql'
                                        ? `<!-- For JPA static metamodel generation -->
                                <path>
                                    <groupId>org.hibernate</groupId>
                                    <artifactId>hibernate-jpamodelgen</artifactId>
                                    <version>$\{hibernate.version}</version>
                                </path>`
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
                    ${
                        this.databaseType === 'couchbase'
                            ? `<args>
                        <arg>-Xjvm-default=enable</arg>
                    </args>`
                            : ''
                    }
                    <compilerPlugins>
                        <plugin>spring</plugin>${
                            this.databaseType === 'sql'
                                ? `<plugin>jpa</plugin>
                        <plugin>all-open</plugin>`
                                : ''
                        }
                    </compilerPlugins>${
                        this.databaseType === 'sql'
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
                        this.databaseType === 'sql'
                            ? `<dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-noarg</artifactId>
                        <version>$\{kotlin.version}</version>
                    </dependency>`
                            : ''
                    }
                </dependencies>`;
                this.addMavenPlugin('org.jetbrains.kotlin', 'kotlin-maven-plugin', '${kotlin.version}', kotlinOther);

                removeDefaultMavenCompilerPlugin(this);
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
            }
        }
    };
}

/**
 * write the given files using provided config.
 *
 * @param {object} files - files to write
 * @param {object} generator - the generator instance to use
 * @param {boolean} returnFiles - weather to return the generated file list or to write them
 * @param {string} prefix - prefix to add in the path
 */
function writeFilesToDisk(files, generator, returnFiles, prefix) {
    const _this = generator || this;
    const filesOut = [];
    const startTime = new Date();
    // using the fastest method for iterations
    for (let i = 0, blocks = Object.keys(files); i < blocks.length; i++) {
        for (let j = 0, blockTemplates = files[blocks[i]]; j < blockTemplates.length; j++) {
            const blockTemplate = blockTemplates[j];
            if (!blockTemplate.condition || blockTemplate.condition(_this)) {
                const path = blockTemplate.path || '';
                blockTemplate.templates.forEach(templateObj => {
                    let templatePath = path;
                    let method = 'template';
                    let useTemplate = false;
                    let options = {};
                    let templatePathTo;
                    if (typeof templateObj === 'string') {
                        templatePath += templateObj;
                    } else {
                        if (typeof templateObj.file === 'string') {
                            templatePath += templateObj.file;
                        } else if (typeof templateObj.file === 'function') {
                            templatePath += templateObj.file(_this);
                        }
                        method = templateObj.method ? templateObj.method : method;
                        useTemplate = templateObj.template ? templateObj.template : useTemplate;
                        options = templateObj.options ? templateObj.options : options;
                    }
                    if (templateObj && templateObj.renameTo) {
                        templatePathTo = path + templateObj.renameTo(_this);
                    } else {
                        // remove the .ejs suffix
                        templatePathTo = templatePath.replace('.ejs', '');
                    }
                    filesOut.push(templatePathTo);
                    if (!returnFiles) {
                        let templatePathFrom = prefix ? `${prefix}/${templatePath}` : templatePath;

                        if (templateObj.useBluePrint) {
                            templatePathFrom = templatePath;
                        }
                        if (
                            !templateObj.noEjs &&
                            !templatePathFrom.endsWith('.png') &&
                            !templatePathFrom.endsWith('.jpg') &&
                            !templatePathFrom.endsWith('.gif') &&
                            !templatePathFrom.endsWith('.svg') &&
                            !templatePathFrom.endsWith('.ico')
                        ) {
                            templatePathFrom = `${templatePathFrom}.ejs`;
                        }
                        // if (method === 'template')
                        _this[method](templatePathFrom, templatePathTo, _this, options, useTemplate);
                    }
                });
            }
        }
    }
    _this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
    return filesOut;
}

/**
 * remove the default <maven-compiler-plugin> configuration from pom.xml.
 */
function removeDefaultMavenCompilerPlugin(generator) {
    const _this = generator || this;

    const fullPath = path.join(process.cwd(), 'pom.xml');
    const artifactId = 'maven-compiler-plugin';

    const xml = _this.fs.read(fullPath).toString();

    const cheerio = require('cheerio');
    const $ = cheerio.load(xml, { xmlMode: true });

    $(`build > plugins > plugin > artifactId:contains('${artifactId}')`)
        .parent()
        .remove();

    const modifiedXml = $.xml();

    _this.fs.write(fullPath, modifiedXml);
}

module.exports = {
    writeFiles,
    writeFilesToDisk,
    serverFiles
};
