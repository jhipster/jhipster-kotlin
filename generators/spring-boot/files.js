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
import { buildToolTypes } from 'generator-jhipster/jdl';
// const path = require('path');

import { serverFiles as baseServerFiles } from './jhipster-files.js';
import utils from '../util.cjs';
import kotlinConstants from '../generator-kotlin-constants.cjs';

// const fs = require('fs');
// const serverCleanup = require('generator-jhipster/generators/cleanup');
// const cheerio = require('cheerio');
/*
const { MAIN_DIR, TEST_DIR } = require('../jhipster-constants.cjs');
const { buildToolTypes } = require('../migration.cjs');

const baseServerFiles = require('./jhipster-files.cjs').serverFiles;
const kotlinConstants = require('../generator-kotlin-constants.cjs');
const { makeKotlinServerFiles } = require('../util.cjs');
*/

/* Constants use throughout */
const { GRADLE } = buildToolTypes;
const { makeKotlinServerFiles } = utils;
const files = makeKotlinServerFiles(baseServerFiles);

export const serverFiles = {
    ...files,
    serverBuild: [
        ...files.serverBuild,
        {
            condition: generator => generator.buildTool === GRADLE,
            templates: [{ file: 'gradle/kotlin.gradle' }],
        },
        {
            templates: [{ file: `${kotlinConstants.DETEKT_CONFIG_FILE}` }],
        },
    ],
};

/* eslint-disable no-template-curly-in-string */
/*
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
                SERVER_TEST_RES_DIR,
            );
        },

        async writeFiles() {
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

                updateGradle(this);
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
                    '            <scope>test</scope>',
                );
                this.addMavenDependency(
                    'org.mockito.kotlin',
                    'mockito-kotlin',
                    kotlinConstants.MOCKITO_KOTLIN_VERSION,
                    '            <scope>test</scope>',
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
                    defaultCompileOther,
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
*/

/**
 * Manually updates the pom.xml file to perform the following operations:
 * 1. Set the Kotlin source directories as the default (Needed for the ktlint plugin to properly format the sources)
 * 2. Remove the default <maven-compiler-plugin> configuration.
 */
/*
async function updatePom(generator) {
    const _this = generator || this;

    const fullPath = path.join(process.cwd(), 'pom.xml');

    const xml = _this.fs.read(fullPath).toString();
    const updatedXml = xml.replace('TestContainer.java', 'TestContainer.kt');
    const $ = cheerio.load(updatedXml, { xmlMode: true });

    // 1. Set the Kotlin source directories as the default
    $('build > defaultGoal').after(`

        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
`);
    _this.fs.write(fullPath, $.xml());
}

async function updateGradle(generator) {
    const _this = generator || this;

    const fullPath = path.join(process.cwd(), 'build.gradle');

    const content = _this.fs.read(fullPath).toString();

    _this.fs.write(fullPath, content.replace('classes/java/main', 'classes/kotlin/main'));
}
*/
