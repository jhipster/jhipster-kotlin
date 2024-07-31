import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { passthrough } from '@yeoman/transform';

export default class extends BaseApplicationGenerator {
    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            async source({ application, source }) {
                this.queueTask({
                    method: () => {
                        source.addAllowBlockingCallsInside = () => undefined;
                        source.addApplicationPropertiesContent = () => undefined;
                        source.addIntegrationTestAnnotation = () => undefined;
                        source.addTestSpringFactory = () => undefined;

                        if (application.buildToolGradle) {
                            // Add a noop needles for spring-gateway generator
                            source.addJavaDefinition = () => {};
                            source.addJavaDependencies = () => {};
                        }
                    },
                    taskName: `${this.runningState.methodName}(delayed)`,
                    queueName: this.runningState.queueName,
                });
            },
        });
    }

    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            async defaultTask({ application }) {
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
                                    .replaceAll(/reportOn (.*)/g, 'testResults.from($1)')
                                    .replaceAll('destinationDir =', 'destinationDirectory =')
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
            async postWritingTemplateTask({ application }) {
                this.editFile('src/main/resources/logback-spring.xml', contents => contents.replaceAll('jakarta.', 'javax.'));
                this.editFile('src/test/resources/logback.xml', contents => contents.replaceAll('jakarta.', 'javax.'));

                if (application.buildToolGradle) {
                    // JHipster 8 have needles fixed
                    this.editFile('build.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));
                    if (application.databaseTypeSql) {
                        const { javaDependencies } = application;
                        this.editFile('build.gradle', contents =>
                            contents.replace(
                                '\nconfigurations {',
                                '\nconfigurations {\n    liquibaseRuntime.extendsFrom sourceSets.main.compileClasspath\n',
                            ),
                        );
                        this.editFile('gradle.properties', contents =>
                            contents
                                .replace(/liquibasePluginVersion=(.*)/, 'liquibasePluginVersion=2.2.2')
                                .replace(/(checkstyleVersion)=(.*)/, `$1=${javaDependencies.checkstyle}`)
                                .replace(/(noHttpCheckstyleVersion)=(.*)/, `$1=${javaDependencies['nohttp-checkstyle']}`),
                        );
                    }
                    this.editFile('settings.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));
                }
            },
        });
    }
}
