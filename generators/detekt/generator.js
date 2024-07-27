import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';

const DETEKT_CONFIG_FILE = 'detekt-config.yml';

export default class extends BaseApplicationGenerator {
    constructor(args, opts, features) {
        super(args, opts, { ...features, queueCommandTasks: true });
    }

    async beforeQueue() {
        await this.dependsOnBootstrapApplicationServer();
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async loading({ application }) {
                this.loadJavaDependenciesFromGradleCatalog(application.javaDependencies);
            },
        });
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            async preparing({ applicationDefaults }) {
                applicationDefaults({
                    detektConfigFile: DETEKT_CONFIG_FILE,
                });
            },
        });
    }

    get [BaseApplicationGenerator.WRITING]() {
        return this.asWritingTaskGroup({
            async writing({ application }) {
                await this.writeFiles({
                    blocks: [
                        { templates: [{ file: DETEKT_CONFIG_FILE }] },
                        { condition: ctx => ctx.buildToolGradle, templates: [{ file: 'gradle/detekt.gradle' }] },
                    ],
                    context: application,
                });
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async customizeGradle({ application, source }) {
                if (application.buildToolGradle) {
                    source.applyFromGradle({ script: 'gradle/detekt.gradle' });

                    // source.addGradleProperty({ property: 'detekt_version', value: application.javaDependencies['detekt-gradle'] });

                    /*
                    source.addGradlePluginToBuildScript({
                        group: 'io.gitlab.arturbosch.detekt',
                        name: 'detekt-gradle-plugin',
                        version: '${detekt_version}',
                    });
                    */

                    // JHipster 8 based configuration
                    source.addGradleDependencyCatalogPlugins([
                        {
                            pluginName: 'detekt',
                            id: 'io.gitlab.arturbosch.detekt',
                            version: application.javaDependencies['detekt-gradle'],
                            addToBuild: true,
                        },
                    ]);
                }
            },

            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addJavaDefinition({
                        versions: [
                            { name: 'maven-antrun-plugin', version: application.javaDependencies['maven-antrun-plugin'] },
                            { name: 'detekt', version: application.javaDependencies['detekt-cli'] },
                        ],
                    });

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
                                      failonerror="false"
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
                            { property: 'detekt.configFile', value: `$\{project.basedir}/${DETEKT_CONFIG_FILE}` },
                            { property: 'detekt.xmlReportFile', value: '${project.build.directory}/detekt-reports/detekt.xml' },
                            { property: 'sonar.kotlin.detekt.reportPaths', value: '${detekt.xmlReportFile}' },
                        ],
                        plugins: [
                            {
                                groupId: 'org.apache.maven.plugins',
                                artifactId: 'maven-antrun-plugin',
                                version: '${maven-antrun-plugin.version}',
                                additionalContent: antRunOther,
                            },
                        ],
                    });
                }
            },
        });
    }
}
