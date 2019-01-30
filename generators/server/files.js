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
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_KOTLIN_SRC_DIR = `${constants.MAIN_DIR}kotlin/`;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

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
        ...baseServerFiles.serverResource,
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
        }
    ],
    serverJavaApp: [
        {
            path: SERVER_MAIN_KOTLIN_SRC_DIR,
            templates: [
                {
                    file: 'package/Application.kt',
                    useBluePrint: true,
                    renameTo: generator => `${generator.javaDir}${generator.mainClass}.kt`
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
                    file: 'package/config/LoggingAspectConfiguration.kt',
                    renameTo: generator => `${generator.javaDir}config/LoggingAspectConfiguration.kt`,
                    useBluePrint: true
                }
            ]
        },
        {
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/Constants.java',
                    renameTo: generator => `${generator.javaDir}config/Constants.java`
                },
                {
                    file: 'package/config/LocaleConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/LocaleConfiguration.java`
                },
                {
                    file: 'package/config/WebConfigurer.java',
                    renameTo: generator => `${generator.javaDir}config/WebConfigurer.java`
                }
            ]
        },
        {
            // TODO: remove when supported by spring-data
            condition: generator => generator.reactive,
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ReactivePageableHandlerMethodArgumentResolver.java',
                    renameTo: generator => `${generator.javaDir}config/ReactivePageableHandlerMethodArgumentResolver.java`
                },
                {
                    file: 'package/config/ReactiveSortHandlerMethodArgumentResolver.java',
                    renameTo: generator => `${generator.javaDir}config/ReactiveSortHandlerMethodArgumentResolver.java`
                }
            ]
        },
        {
            condition: generator =>
                ['ehcache', 'hazelcast', 'infinispan', 'memcached'].includes(generator.cacheProvider) ||
                generator.applicationType === 'gateway',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/CacheConfiguration.java`
                }
            ]
        },
        {
            condition: generator => generator.cacheProvider === 'infinispan',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CacheFactoryConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/CacheFactoryConfiguration.java`
                }
            ]
        },
        {
            condition: generator =>
                generator.databaseType === 'sql' || generator.databaseType === 'mongodb' || generator.databaseType === 'couchbase',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/CloudDatabaseConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/CloudDatabaseConfiguration.java`
                },
                {
                    file: 'package/config/DatabaseConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/DatabaseConfiguration.java`
                },
                {
                    file: 'package/config/audit/package-info.java',
                    renameTo: generator => `${generator.javaDir}config/audit/package-info.java`
                },
                {
                    file: 'package/config/audit/AuditEventConverter.java',
                    renameTo: generator => `${generator.javaDir}config/audit/AuditEventConverter.java`
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'sql',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/LiquibaseConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/LiquibaseConfiguration.java`
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'couchbase',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/repository/N1qlCouchbaseRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/N1qlCouchbaseRepository.java`
                },
                {
                    file: 'package/repository/CustomN1qlCouchbaseRepository.java',
                    renameTo: generator => `${generator.javaDir}repository/CustomN1qlCouchbaseRepository.java`
                }
            ]
        },
        {
            condition: generator => generator.websocket === 'spring-websocket',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/WebsocketConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/WebsocketConfiguration.java`
                },
                {
                    file: 'package/config/WebsocketSecurityConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/WebsocketSecurityConfiguration.java`
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/metrics/package-info.java',
                    renameTo: generator => `${generator.javaDir}config/metrics/package-info.java`
                },
                {
                    file: 'package/config/metrics/JHipsterHealthIndicatorConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`
                },
                {
                    file: 'package/config/metrics/CassandraHealthIndicator.java',
                    renameTo: generator => `${generator.javaDir}config/metrics/CassandraHealthIndicator.java`
                }
            ]
        },
        {
            condition: generator => generator.databaseType === 'cassandra',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/cassandra/CassandraConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/cassandra/CassandraConfiguration.java`
                },
                {
                    file: 'package/config/cassandra/package-info.java',
                    renameTo: generator => `${generator.javaDir}config/cassandra/package-info.java`
                }
            ]
        },
        {
            condition: generator => generator.searchEngine === 'elasticsearch',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/ElasticsearchConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/ElasticsearchConfiguration.java`
                }
            ]
        },
        {
            condition: generator => generator.messageBroker === 'kafka',
            path: SERVER_MAIN_SRC_DIR,
            templates: [
                {
                    file: 'package/config/MessagingConfiguration.java',
                    renameTo: generator => `${generator.javaDir}config/MessagingConfiguration.java`
                }
            ]
        }
    ]
};

function writeFiles() {
    return {
        setUp() {
            this.javaDir = `${this.packageFolder}/`;
            this.testDir = `${this.packageFolder}/`;

            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            mkdirp(`${SERVER_TEST_SRC_DIR}/${this.testDir}`);
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
                    <compilerPlugins>
                        <plugin>spring</plugin>
                    ${
                        this.databaseType === 'sql'
                            ? `<plugin>jpa</plugin>
                        <plugin>all-open</plugin>`
                            : ''
                    }
                    </compilerPlugins>
                    ${
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
    /* eslint-disable */
    for (const block of Object.keys(files)) {
        for (const blockTemplate of files[block]) {
            if (!blockTemplate.condition || blockTemplate.condition(_this)) {
                const path = blockTemplate.path || '';
                for (const templateObj of blockTemplate.templates) {
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
                }
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
    const $ = cheerio.load(xml, {xmlMode: true});

    $(`build > plugins > plugin > artifactId:contains('${artifactId}')`).parent().remove();

    const modifiedXml = $.xml();

    _this.fs.write(fullPath, modifiedXml);
}

module.exports = {
    writeFiles,
    writeFilesToDisk,
    serverFiles
};
