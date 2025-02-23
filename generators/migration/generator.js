import { basename } from 'node:path';
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { passthrough } from '@yeoman/transform';

export default class extends BaseApplicationGenerator {
    get [BaseApplicationGenerator.DEFAULT]() {
        return this.asDefaultTaskGroup({
            async defaultTask() {
                this.queueTransformStream(
                    {
                        name: 'updating build files',
                        filter: file => file.path.endsWith('.gradle') || ['libs.versions.toml', 'pom.xml'].includes(basename(file.path)),
                        refresh: false,
                    },
                    passthrough(file => {
                        file.contents = Buffer.from(
                            file.contents
                                .toString()
                                .replace('micrometer-registry-prometheus-simpleclient', 'micrometer-registry-prometheus')
                                .replaceAll('jakarta.', 'javax.')
                                .replaceAll('spring-cloud-stream-test-binder', 'spring-cloud-stream-test-support')
                                .replaceAll('org.hibernate.orm', 'org.hibernate')
                                .replaceAll('mongock-springboot-v3', 'mongock-springboot')
                                .replaceAll('mongodb-springdata-v4-driver', 'mongodb-springdata-v3-driver')
                                .replaceAll('jackson-datatype-hibernate6', 'jackson-datatype-hibernate5')
                                .replaceAll('org.apache.cassandra', 'com.datastax.oss')
                                .replaceAll('springdoc-openapi-starter-webflux-api', 'springdoc-openapi-webflux-core')
                                .replaceAll('springdoc.openapi.starter.webflux.api', 'springdoc.openapi.webflux.core')
                                .replaceAll('springdoc-openapi-starter-webmvc-api', 'springdoc-openapi-webmvc-core')
                                .replaceAll('springdoc.openapi.starter.webmvc.api', 'springdoc.openapi.webmvc.core')
                                // Gradle only
                                .replace(
                                    'importMappings = [Problem:"org.zalando.problem.Problem"]',
                                    'importMappings = [Problem:"org.springframework.http.ProblemDetail"]',
                                )
                                .replace('hibernate-jcache"', 'hibernate-jcache:${hibernateVersion}"')
                                .replace(
                                    "excludes = ['time']",
                                    `properties {
            time = null
        }`,
                                )
                                // Maven only
                                .replaceAll('<classifier>jakarta</classifier>', '')
                                .replace(
                                    '<skipValidateSpec>false</skipValidateSpec>',
                                    '<importMappings>Problem=org.zalando.problem.Problem</importMappings><skipValidateSpec>false</skipValidateSpec>',
                                ),
                        );
                    }),
                );

                this.queueTransformStream(
                    {
                        name: 'updating log files',
                        filter: file => file.path.endsWith('logback-spring.xml') || file.path.endsWith('logback.xml'),
                        refresh: false,
                    },
                    passthrough(file => {
                        file.contents = Buffer.from(file.contents.toString().replaceAll('jakarta.', 'javax.'));
                    }),
                );

                this.queueTransformStream(
                    {
                        name: 'reverting kt files to javax',
                        filter: file => file.path.endsWith('.kt'),
                        refresh: false,
                    },
                    passthrough(file => {
                        file.contents = Buffer.from(file.contents.toString().replaceAll('import jakarta.', 'import javax.'));
                    }),
                );
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
        });
    }

    delayTask(method) {
        this.queueTask({
            method,
            taskName: `${this.runningState.methodName}(delayed)`,
            queueName: this.runningState.queueName,
        });
    }
}
