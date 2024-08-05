import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { transform, passthrough } from '@yeoman/transform';
import { SERVER_MAIN_SRC_KOTLIN_DIR, SERVER_TEST_SRC_KOTLIN_DIR } from './support/index.js';

export default class extends BaseApplicationGenerator {
    constructor(args, opts, features) {
        super(args, opts, { ...features, queueCommandTasks: true });
    }

    async beforeQueue() {
        await this.dependsOnJHipster('jhipster:java:build-tool');
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async loadCatalog({ application }) {
                this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies);
            },
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // We don't want to use to write any Java files
                    backendTypeJavaAny: false,
                });
            },
        });
    }

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            async checkForJavaFiles() {
                this.queueTransformStream(
                    {
                        name: 'removing remaining java files',
                        filter: file => file.path.endsWith('.java'),
                        refresh: true,
                    },
                    transform(file => {
                        this.log.warn(`Remaining java file ${file.path} removed`);
                    }),
                );
            },
            async convertGradleScripts({ application }) {
                if (application.buildToolGradle) {
                    this.queueTransformStream(
                        {
                            name: 'updating gradle files',
                            filter: file => file.path.endsWith('.gradle'),
                            refresh: false,
                        },
                        passthrough(file => {
                            file.contents = Buffer.from(file.contents.toString().replaceAll('classes/java/main', 'classes/kotlin/main'));
                        }),
                    );
                }
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async writeKotlinFiles({ application }) {
                await this.writeFiles({
                    blocks: [
                        { templates: ['.editorconfig.jhi.kotlin', `src/main/kotlin/_package_/GeneratedByJHipster.kt`] },
                        {
                            condition: ctx => ctx.buildToolGradle,
                            templates: [{ file: 'gradle/kotlin.gradle' }],
                        },
                    ],
                    context: application,
                    customizeTemplatePath: file => ({
                        ...file,
                        destinationFile: file.destinationFile.replace('_package_/', application.packageFolder),
                    }),
                });
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async customizeGradle({ application, source }) {
                if (application.buildToolGradle) {
                    source.addGradleDependencyCatalogVersion({ name: 'kotlin', version: application.javaDependencies.kotlin });

                    source.applyFromGradle({
                        script: 'gradle/kotlin.gradle',
                    });

                    source.addGradleDependencyCatalogPlugins([
                        {
                            pluginName: 'kotlin',
                            id: 'org.jetbrains.kotlin.jvm',
                            'version.ref': 'kotlin',
                            addToBuild: true,
                        },
                        {
                            pluginName: 'kotlin-kapt',
                            id: 'org.jetbrains.kotlin.kapt',
                            'version.ref': 'kotlin',
                            addToBuild: true,
                        },
                    ]);

                    source.addGradleDependencyCatalogLibrary({
                        libraryName: 'kotlin-bom',
                        group: 'org.jetbrains.kotlin',
                        name: 'kotlin-bom',
                        scope: 'implementation platform',
                        'version.ref': 'kotlin',
                    });

                    if (application.backendTypeSpringBoot) {
                        source.addGradleDependencyCatalogPlugin({
                            pluginName: 'kotlin-spring',
                            id: 'org.jetbrains.kotlin.plugin.spring',
                            'version.ref': 'kotlin',
                            addToBuild: true,
                        });
                        if (application.databaseTypeSql) {
                            source.addGradleDependencyCatalogPlugin({
                                pluginName: 'kotlin-jpa',
                                id: 'org.jetbrains.kotlin.plugin.jpa',
                                'version.ref': 'kotlin',
                                addToBuild: true,
                            });
                        }
                    }

                    if (application.enableSwaggerCodegen) {
                        this.editFile(
                            'build.gradle',
                            content => `${content}
tasks.withType(org.jetbrains.kotlin.gradle.internal.KaptGenerateStubsTask.class).configureEach {
    dependsOn 'openApiGenerate'
}
`,
                        );
                        this.editFile('gradle/swagger.gradle', content => content.replace(', useSpringBoot3: "true"', ''));
                    }
                }
            },
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.mergeMavenPomContent({
                        project: {
                            build: {
                                sourceDirectory: SERVER_MAIN_SRC_KOTLIN_DIR,
                                testSourceDirectory: SERVER_TEST_SRC_KOTLIN_DIR,
                            },
                        },
                    });

                    source.addJavaDefinition({
                        versions: [{ name: 'kotlin', version: application.javaDependencies.kotlin }],
                        dependencies: [
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-stdlib-jdk8' },
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-reflect' },
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-test-junit', scope: 'test' },
                            {
                                groupId: 'org.mockito.kotlin',
                                artifactId: 'mockito-kotlin',
                                version: application.javaDependencies['mockito-kotlin'],
                                scope: 'test',
                            },
                        ],
                    });
                    if (application.reactive) {
                        source.addJavaDefinition({
                            dependencies: [
                                { groupId: 'org.jetbrains.kotlinx', artifactId: 'kotlinx-coroutines-debug' },
                                { groupId: 'org.jetbrains.kotlinx', artifactId: 'kotlinx-coroutines-reactor' },
                                { groupId: 'io.projectreactor.kotlin', artifactId: 'reactor-kotlin-extensions' },
                            ],
                        });
                    }

                    source.addMavenDefinition({
                        dependencyManagement: [
                            {
                                groupId: 'org.jetbrains.kotlin',
                                artifactId: 'kotlin-bom',
                                version: '${kotlin.version}',
                                type: 'pom',
                                scope: 'import',
                            },
                        ],
                        plugins: [
                            {
                                groupId: 'org.apache.maven.plugins',
                                artifactId: 'maven-compiler-plugin',
                                version: '${maven-compiler-plugin.version}',
                                additionalContent: `
                                    <executions>
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
                                    </configuration>`,
                            },
                            {
                                groupId: 'org.jetbrains.kotlin',
                                artifactId: 'kotlin-maven-plugin',
                                version: '${kotlin.version}',
                                additionalContent: `
                                    <executions>
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
                                                        application.databaseTypeSql
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
                                                        application.databaseTypeCassandra
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
                                                application.databaseTypeSql
                                                    ? `
                                            <plugin>jpa</plugin>
                                            <plugin>all-open</plugin>`
                                                    : ''
                                            }
                                        </compilerPlugins>
                                    </configuration>
                                    <dependencies>
                                        <dependency>
                                            <groupId>org.jetbrains.kotlin</groupId>
                                            <artifactId>kotlin-maven-allopen</artifactId>
                                            <version>$\{kotlin.version}</version>
                                        </dependency>
                                        ${
                                            application.databaseTypeSql
                                                ? `<dependency>
                                            <groupId>org.jetbrains.kotlin</groupId>
                                            <artifactId>kotlin-maven-noarg</artifactId>
                                            <version>$\{kotlin.version}</version>
                                        </dependency>`
                                                : ''
                                        }
                                    </dependencies>`,
                            },
                        ],
                    });

                    if (application.enableSwaggerCodegen) {
                        this.editFile('pom.xml', content => content.replace('<useSpringBoot3>true</useSpringBoot3>', ''));
                    }
                }
            },
        });
    }
}
