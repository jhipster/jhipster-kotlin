import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';

export default class extends BaseApplicationGenerator {
    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            async source({ application, source }) {
                if (application.buildToolGradle) {
                    // Add a noop needles for spring-gateway generator
                    source.addJavaDefinition = () => {};
                    source.addJavaDependencies = () => {};

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
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async postWritingTemplateTask({ application }) {
                if (application.buildToolGradle) {
                    // JHipster 8 have needles fixed
                    this.editFile('build.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));
                    this.editFile('settings.gradle', contents => contents.replaceAll('//jhipster', '// jhipster'));
                }
            },
        });
    }
}
