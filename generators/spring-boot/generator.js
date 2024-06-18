import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { transform, passthrough } from '@yeoman/transform';
import BaseApplicationGenerator from 'generator-jhipster/generators/spring-boot';
import { createNeedleCallback, upperFirstCamelCase } from 'generator-jhipster/generators/base/support';
import { prepareSqlApplicationProperties } from 'generator-jhipster/generators/spring-data-relational/support';

import { serverFiles } from './files.js';
import { writeSqlFiles } from './files-sql.js';
import jhipsterConstants from '../jhipster-constants.cjs';
import kotlinConstants from '../generator-kotlin-constants.cjs';
import { serverFiles as entityServerFiles } from './entity-files.js';
import { getEnumInfo } from 'generator-jhipster/generators/base-application/support';

const { DETEKT_CONFIG_FILE, MOCKITO_KOTLIN_VERSION } = kotlinConstants;
const {
    DOCKER_COMPOSE_FORMAT_VERSION,
    SPRING_BOOT_VERSION,
    LIQUIBASE_VERSION,
    HIBERNATE_VERSION,
    JACOCO_VERSION,
    JIB_VERSION,
    GRADLE_VERSION,
    JAVA_VERSION,
    JAVA_COMPATIBLE_VERSIONS,
    JHIPSTER_DEPENDENCIES_VERSION,
    jhipster7DockerContainers,
    JACKSON_DATABIND_NULLABLE_VERSION,
    DOCKER_ELASTICSEARCH_CONTAINER,
    ELASTICSEARCH_VERSION,
} = jhipsterConstants;

const jhipster7TemplatesPackage = dirname(fileURLToPath(import.meta.resolve('jhipster-7-templates/package.json')));

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, { ...features, jhipster7Migration: true, checkBlueprint: true, inheritTasks: true });

        this.jhipsterTemplatesFolders = [
            this.templatePath(),
            join(jhipster7TemplatesPackage, 'generators/server/templates/'),
            join(jhipster7TemplatesPackage, 'generators/entity-server/templates/'),
        ];
    }

    async beforeQueue() {
        await this.dependsOnJHipster('server');
        await this.dependsOnJHipster('jhipster:java:build-tool', {
            // We want to use v7 liquibase templates and keep pom.xml unsorted for easier migration
            generatorOptions: { skipPriorities: ['writing', 'postWriting'], sortMavenPom: false },
        });
    }

    get [BaseApplicationGenerator.COMPOSING]() {
        return this.asComposingTaskGroup({
            async composingTemplateTask() {
                await this.composeCurrentJHipsterCommand();
            },
            async composeDocker() {
                await this.composeWithJHipster('docker');
            },
            async liquibase() {
                if (
                    this.jhipsterConfigWithDefaults.databaseType === 'sql' ||
                    this.jhipsterConfigWithDefaults.databaseMigration === 'liquibase'
                ) {
                    await this.composeWithJHipster('liquibase', {
                        // We want to use v7 liquibase templates.
                        generatorOptions: { skipPriorities: ['writing', 'postWriting'] },
                    });
                }
                if (this.jhipsterConfigWithDefaults.applicationType === 'gateway') {
                    // Use gateway package.json scripts.
                    await this.composeWithJHipster('jhipster:spring-cloud:gateway');
                }
            },
        });
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            ...super.loading,
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // We don't want to use to write any Java files
                    backendTypeJavaAny: false,
                    // syncUserWithIdp disabled is not supported by kotlin blueprint
                    syncUserWithIdp: application.authenticationType === 'oauth2',
                });
            },
            async migration({ application, applicationDefaults }) {
                const dockerContainersVersions = Object.fromEntries(
                    Object.entries({ ...application.dockerContainers, ...jhipster7DockerContainers }).map(([containerName, container]) => [
                        `DOCKER_${this._.snakeCase(containerName).toUpperCase().replace('_4_', '4')}`,
                        container,
                    ]),
                );

                // Add variables required by V7 templates
                applicationDefaults({
                    ...dockerContainersVersions,
                    testDir: application.packageFolder,
                    javaDir: application.packageFolder,

                    DOCKER_COMPOSE_FORMAT_VERSION,
                    DETEKT_CONFIG_FILE,
                    MOCKITO_KOTLIN_VERSION,
                    GRADLE_VERSION,
                    SPRING_BOOT_VERSION,
                    LIQUIBASE_VERSION,
                    HIBERNATE_VERSION,
                    JACOCO_VERSION,
                    JIB_VERSION,
                    JACKSON_DATABIND_NULLABLE_VERSION,
                    DOCKER_ELASTICSEARCH_CONTAINER,
                    ELASTICSEARCH_VERSION,
                    otherModules: [],
                    protractorTests: false,
                });

                Object.assign(application, {
                    // Required by renameTo
                    upperFirstCamelCase,
                    // Required by renameTo
                    asDto: name => `${name}${application.dtoSuffix}`,
                    // Required by renameTo
                    asEntity: name => `${name}${application.entitySuffix}`,
                    jhipsterDependenciesVersion: JHIPSTER_DEPENDENCIES_VERSION,
                    JHIPSTER_DEPENDENCIES_VERSION,
                    JAVA_COMPATIBLE_VERSIONS,
                    javaCompatibleVersions: JAVA_COMPATIBLE_VERSIONS,
                    JAVA_VERSION,
                    javaVersion: JAVA_VERSION,
                    SPRING_BOOT_VERSION,
                });
            },
        });
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            ...super.preparing,
            async preparingTemplateTask({ applicationDefaults }) {
                applicationDefaults({
                    __override__: true,
                    // Enabled by default if backendTypeJavaAny, apply for Kotlin as well
                    useNpmWrapper: ({ clientFrameworkAny }) => clientFrameworkAny,
                });
            },
            async migration({ application, applicationDefaults }) {
                prepareSqlApplicationProperties({ application });

                applicationDefaults({
                    __override__: true,
                    // V7 templates expects prodDatabaseType to be set for non SQL databases
                    prodDatabaseType: ({ prodDatabaseType, databaseType }) => prodDatabaseType ?? databaseType,
                    // V7 templates expects false instead of 'no'
                    searchEngine: ({ searchEngine }) => (searchEngine === 'no' ? false : searchEngine),
                });
            },
        });
    }

    get [BaseApplicationGenerator.LOADING_ENTITIES]() {
        return this.asLoadingEntitiesTaskGroup({
            ...super.loadingEntities,
            migration({ application }) {
                if (application.authority) {
                    // V8 rest api is not compatible with current authority api.
                    application.authority.skipClient = true;
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
        return this.asPostPreparingEachEntityTaskGroup({
            ...super.postPreparingEachEntity,
            migration({ entity }) {
                // V7 templates requires liquibase preparation
                // postPrepareEntity({ application, entity });

                // V7 templates expects false instead of 'no'
                entity.searchEngine = entity.searchEngine === 'no' ? false : entity.searchEngine;
                // V7 templates are not compatible with jpaMetamodelFiltering for reactive
                if (this.jhipsterConfig.reactive && entity.jpaMetamodelFiltering) {
                    entity.jpaMetamodelFiltering = false;
                }
            },
        });
    }

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            ...super.default,
            async defaultTemplateTask({ application }) {
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

                if (application.buildToolGradle) {
                    this.queueTransformStream(
                        {
                            name: 'updating gradle files',
                            filter: file => file.path.endsWith('.gradle'),
                            refresh: false,
                        },
                        passthrough(file => {
                            file.contents = Buffer.from(
                                file.contents
                                    .toString()
                                    .replaceAll('classes/java/main', 'classes/kotlin/main')
                                    .replaceAll('html.enabled =', 'html.required =')
                                    .replaceAll('xml.enabled =', 'xml.required =')
                                    .replaceAll('csv.enabled =', 'csv.required ='),
                            );
                        }),
                    );
                }
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        const { resetFakeDataSeed, generateKeyStore } = super.writing;
        return this.asWritingTaskGroup({
            resetFakeDataSeed,
            generateKeyStore,
            async writingTemplateTask({ application }) {
                /*
                if (application.user && !application.user.liquibaseFakeData) {
                    application.user.liquibaseFakeData = [{}, {}];
                }
                    */
                await this.writeFiles({
                    sections: serverFiles,
                    context: application,
                });
            },
            ...writeSqlFiles(),
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
                    });
                }
            },

            async writeEnumFiles({ application, entities }) {
                for (const entity of entities.filter(entity => !entity.skipServer)) {
                    for (const field of entity.fields.filter(field => field.fieldIsEnum)) {
                        const enumInfo = {
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
                                            file: 'src/main/kotlin/package/domain/enumeration/Enum.kt',
                                            renameTo: () =>
                                                `src/main/kotlin/${entity.entityAbsoluteFolder}/domain/enumeration/${field.fieldType}.kt`,
                                        },
                                    ],
                                },
                            ],
                            context: enumInfo,
                        });
                    }
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            removeScripts({ application }) {
                if (application.applicationTypeGateway || application.gatewayServerPort) {
                    // Readiness port is not correctly exposed in gateways
                    // Don't wait for readiness state
                    const scriptsStorage = this.packageJson.createStorage('scripts');
                    scriptsStorage.delete('pree2e:headless');
                }
            },
            async customizeGradle({ application, source }) {
                if (application.buildToolGradle) {
                    // JHipster 8 have needles fixed
                    this.editFile('build.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));
                    this.editFile('settings.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));

                    source.applyFromGradle({
                        script: 'gradle/kotlin.gradle',
                    });

                    const { DETEKT_VERSION, KTLINT_GRADLE_VERSION, KOTLIN_VERSION } = kotlinConstants;
                    source.addGradleProperty({ property: 'kotlin_version', value: KOTLIN_VERSION });
                    source.addGradleProperty({ property: 'mapstruct_version', value: kotlinConstants.MAPSTRUCT_VERSION });
                    source.addGradleProperty({ property: 'detekt_version', value: DETEKT_VERSION });

                    // JHipster 7 does not support buildScript add for migration
                    source.addGradlePluginToBuildScript = ({ group, name, version }) => {
                        this.editFile(
                            'build.gradle',
                            createNeedleCallback({
                                needle: 'gradle-buildscript-dependency',
                                contentToAdd: `classpath "${group}:${name}:${version}"`,
                            }),
                        );
                    };
                    source.addGradlePluginToBuildScript({
                        group: 'org.jetbrains.kotlin',
                        name: 'kotlin-gradle-plugin',
                        version: '${kotlin_version}',
                    });
                    source.addGradlePluginToBuildScript({
                        group: 'org.jetbrains.kotlin',
                        name: 'kotlin-allopen',
                        version: '${kotlin_version}',
                    });
                    if (application.databaseTypeSql) {
                        source.addGradlePluginToBuildScript({
                            group: 'org.jetbrains.kotlin',
                            name: 'kotlin-noarg',
                            version: '${kotlin_version}',
                        });
                    }
                    source.addGradlePluginToBuildScript({
                        group: 'org.jlleitschuh.gradle',
                        name: 'ktlint-gradle',
                        version: KTLINT_GRADLE_VERSION,
                    });
                    source.addGradlePluginToBuildScript({
                        group: 'io.gitlab.arturbosch.detekt',
                        name: 'detekt-gradle-plugin',
                        version: '${detekt_version}',
                    });

                    /*
                    // JHipster 8 based configuration
                    source.addJavaDefinition({
                        versions: [
                            { name: 'kotlin', version: KOTLIN_VERSION },
                            { name: 'detekt', version: DETEKT_VERSION },
                        ],
                    });

                    source.addGradleDependencyCatalogPlugins([
                        { pluginName: 'kotlin-jvm', id: 'org.jetbrains.kotlin.jvm', 'version.ref': 'kotlin', addToBuild: true },
                        { pluginName: 'detekt', id: 'io.gitlab.arturbosch.detekt', version: DETEKT_VERSION, addToBuild: true },
                        { pluginName: 'ktlint', id: 'org.jlleitschuh.gradle.ktlint', version: KTLINT_GRADLE_VERSION, addToBuild: true },
                        {
                            pluginName: 'kotlin-allopen',
                            id: 'org.jetbrains.kotlin.plugin.allopen',
                            'version.ref': 'kotlin',
                            addToBuild: true,
                        },
                    ]);
                    if (application.databaseTypeSql) {
                        source.addGradleDependencyCatalogPlugins([
                            {
                                pluginName: 'kotlin-noarg',
                                id: 'org.jetbrains.kotlin.plugin.noarg',
                                'version.ref': 'kotlin',
                                addToBuild: true,
                            },
                        ]);
                    }
                    */
                }
            },

            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    const maven = await this.composeWithJHipster('jhipster:maven');
                    maven.pomStorage.merge({
                        project: { build: { sourceDirectory: 'src/main/kotlin/', testSourceDirectory: 'src/test/kotlin/' } },
                    });

                    source.addJavaDefinition({
                        versions: [
                            { name: 'kotlin', version: kotlinConstants.KOTLIN_VERSION },
                            { name: 'mapstruct', version: kotlinConstants.MAPSTRUCT_VERSION },
                            { name: 'ktlint-maven-plugin', version: kotlinConstants.KTLINT_MAVEN_VERSION },
                            { name: 'maven-antrun-plugin', version: kotlinConstants.MAVEN_ANTRUN_VERSION },
                            { name: 'detekt', version: kotlinConstants.DETEKT_VERSION },
                            { name: 'modernizer-maven-plugin', version: '2.6.0' },
                        ],
                        dependencies: [
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-stdlib-jdk8' },
                            { groupId: 'org.jetbrains.kotlinx', artifactId: 'kotlinx-coroutines-debug' },
                            { groupId: 'org.jetbrains.kotlinx', artifactId: 'kotlinx-coroutines-reactor' },
                            { groupId: 'io.projectreactor.kotlin', artifactId: 'reactor-kotlin-extensions' },
                            { groupId: 'com.fasterxml.jackson.datatype', artifactId: 'jackson-datatype-json-org' },
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-reflect', versionRef: 'kotlin' },
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-test-junit', versionRef: 'kotlin', scope: 'test' },
                            {
                                groupId: 'org.mockito.kotlin',
                                artifactId: 'mockito-kotlin',
                                version: kotlinConstants.MOCKITO_KOTLIN_VERSION,
                                scope: 'test',
                            },
                        ],
                    });

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
                    </compilerPlugins>${
                        application.databaseTypeSql
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
                        application.databaseTypeSql
                            ? `<dependency>
                        <groupId>org.jetbrains.kotlin</groupId>
                        <artifactId>kotlin-maven-noarg</artifactId>
                        <version>$\{kotlin.version}</version>
                    </dependency>`
                            : ''
                    }
                </dependencies>`;

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

                    const ktlintMavenOther = `                <executions>
                    <execution>
                        <id>format</id>
                        <goals>
                            <goal>format</goal>
                        </goals>
                    </execution>
                </executions>`;

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

                    source.addMavenDefinition({
                        properties: [
                            { property: 'modernizer.failOnViolations', value: 'false' },
                            { property: 'detekt.configFile', value: `$\{project.basedir}/${kotlinConstants.DETEKT_CONFIG_FILE}` },
                            { property: 'detekt.xmlReportFile', value: '${project.build.directory}/detekt-reports/detekt.xml' },
                            { property: 'sonar.kotlin.detekt.reportPaths', value: '${detekt.xmlReportFile}' },
                            { property: 'sonar.coverage.jacoco.xmlReportPaths', value: '${jacoco.reportFolder}/jacoco.xml' },
                        ],
                        dependencyManagement: [
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-stdlib', version: '${kotlin.version}' },
                            { groupId: 'org.jetbrains.kotlin', artifactId: 'kotlin-stdlib-jdk8', version: '${kotlin.version}' },
                        ],
                        plugins: [
                            {
                                groupId: 'org.jetbrains.kotlin',
                                artifactId: 'kotlin-maven-plugin',
                                version: '${kotlin.version}',
                                additionalContent: kotlinOther,
                            },
                            {
                                groupId: 'org.apache.maven.plugins',
                                artifactId: 'maven-compiler-plugin',
                                version: '${maven-compiler-plugin.version}',
                                additionalContent: defaultCompileOther,
                            },
                            {
                                groupId: 'com.github.gantsign.maven',
                                artifactId: 'ktlint-maven-plugin',
                                version: '${ktlint-maven-plugin.version}',
                                additionalContent: ktlintMavenOther,
                            },
                            {
                                groupId: 'org.apache.maven.plugins',
                                artifactId: 'maven-antrun-plugin',
                                version: '${maven-antrun-plugin.version}',
                                additionalContent: antRunOther,
                            },
                        ],
                    });

                    maven.pomStorage.save(false);
                }
            },
        });
    }
}
