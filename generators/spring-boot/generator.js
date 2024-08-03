import { basename, join } from 'path';
import { existsSync } from 'fs';
// Use spring-boot as parent due to this context in generators
import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { createNeedleCallback } from 'generator-jhipster/generators/base/support';

import { convertToKotlinFile } from '../kotlin/support/files.js';
import { KOTLIN_TEST_SRC_DIR } from './kotlin-constants.js';

export default class extends BaseApplicationGenerator {
    constructor(args, options, features) {
        super(args, options, {
            ...features,
            sbsBlueprint: true,
            jhipster7Migration: true,
            checkBlueprint: true,
            inheritTasks: true,
            queueCommandTasks: true,
        });
    }

    async _postConstruct() {
        await this.dependsOnJHipster('jhipster-kotlin:migration');
        // Use _postConstruct so kotlin will be queued before jhipster:spring-boot dependencies
        await this.dependsOnJHipster('jhipster:java:bootstrap');
        await this.dependsOnJHipster('jhipster-kotlin:kotlin');
    }

    async beforeQueue() {
        await this.dependsOnJHipster('jhipster-kotlin:ktlint');
    }

    get [BaseApplicationGenerator.COMPOSING]() {
        return this.asComposingTaskGroup({
            async composeDetekt() {
                await this.composeWithJHipster('jhipster-kotlin:detekt');
            },
            async composeSpringBootV2() {
                await this.composeWithJHipster('jhipster-kotlin:spring-boot-v2');
            },
        });
    }

    get [BaseApplicationGenerator.LOADING]() {
        return this.asLoadingTaskGroup({
            async applyKotlinDefaults({ application }) {
                Object.assign(application, {
                    // syncUserWithIdp disabled is not supported by kotlin blueprint
                    syncUserWithIdp: application.authenticationType === 'oauth2',
                });

                application.customizeTemplatePaths.unshift(
                    // Remove package-info.java files
                    file => (file.sourceFile.includes('package-info.java') ? undefined : file),
                    // Ignore files from generators
                    file =>
                        [
                            'jhipster:spring-cloud:gateway',
                            'jhipster:feign-client',
                            'jhipster:spring-cloud-stream:kafka',
                            'jhipster:spring-cloud-stream:pulsar',
                        ].includes(file.namespace) && !file.sourceFile.includes('buildSrc')
                            ? undefined
                            : file,
                    // Kotling blueprint does not implements these files
                    file => {
                        const sourceBasename = basename(file.sourceFile);
                        return [
                            '_persistClass_Asserts.java',
                            '_persistClass_TestSamples.java',
                            'AssertUtils.java',
                            '_entityClass_Repository_r2dbc.java',
                            'ElasticsearchExceptionMapper.java',
                            'ElasticsearchExceptionMapperTest.java',
                            'QuerySyntaxException.java',
                            '_enumName_.java',
                            '_persistClass_.java.jhi.jackson_identity_info',
                            '_entityClass_GatlingTest.java',
                            '_entityClass_CriteriaTest.java',

                            'AccountResource_skipUserManagement.java',
                            'TestAuthenticationResource.java',
                            'SpaWebFilter_imperative.java',
                            'SpaWebFilterIT_imperative.java',
                            'SecurityJwtConfiguration.java',
                            'AuthenticationIntegrationTest.java',
                            'JwtAuthenticationTestUtils.java',
                            'AuthenticationIntegrationTest.java',
                            'SecurityInMemoryConfiguration.java',
                            'TokenAuthenticationSecurityMetersIT.java',
                            'TokenAuthenticationIT.java',
                            'AuthenticateController.java',
                            'AuthenticateControllerIT.java',
                            'CRLFLogConverterTest.java',
                            'SpaWebFilterIT_reactive.java',
                            'SpaWebFilterTestController_reactive.java',
                            'AccountResource_oauth2.java',
                        ].includes(sourceBasename)
                            ? undefined
                            : file;
                    },
                    file => {
                        // We don't want to handle spring-boot-v2 templates here
                        if (file.namespace === 'jhipster-kotlin:spring-boot-v2') return file;
                        let { resolvedSourceFile: javaResolvedSourceFile, sourceFile, destinationFile, namespace: ns } = file;
                        // Already resolved kotlin files
                        if (javaResolvedSourceFile && (javaResolvedSourceFile.endsWith('.kt') || javaResolvedSourceFile.includes('.kt.'))) {
                            return file;
                        }

                        if (sourceFile.includes('.java')) {
                            // Kotlint User template does not implements Persistable api. Ignore for now.
                            if (application.user && destinationFile.endsWith('UserCallback.java')) {
                                return undefined;
                            }

                            // TestContainersSpringContextCustomizerFactory uses a single template for modularized (dbs) and non-modularized (kafka, etc) templates
                            if (sourceFile.endsWith('TestContainersSpringContextCustomizerFactory.java')) {
                                // Convert *TestContainersSpringContextCustomizerFactory to TestContainersSpringContextCustomizerFactory
                                const adjustTestContainersSpringContextCustomizerFactoryFile = filename =>
                                    filename.replace(
                                        /(\w*)TestContainersSpringContextCustomizerFactory.java/,
                                        'TestContainersSpringContextCustomizerFactory.java',
                                    );
                                sourceFile = adjustTestContainersSpringContextCustomizerFactoryFile(sourceFile);
                                destinationFile = adjustTestContainersSpringContextCustomizerFactoryFile(destinationFile);
                            }

                            sourceFile = convertToKotlinFile(sourceFile);
                            destinationFile = convertToKotlinFile(destinationFile);
                        }

                        const isCommonFile = filename => {
                            const sourceBasename = basename(filename);
                            if (['_entityClass_Repository.kt', '_entityClass_Repository_reactive.kt'].includes(sourceBasename)) {
                                return ns !== 'spring-data-couchbase';
                            }
                            return ['TestContainersSpringContextCustomizerFactory.kt'].includes(sourceBasename);
                        };

                        const prefix = ns === 'jhipster:spring-boot' || isCommonFile(sourceFile) ? '' : ns.split(':').pop();
                        sourceFile = join(prefix, sourceFile);
                        const resolvedSourceInBlueprint = this.templatePath(sourceFile);
                        const resolvedSourceFile = existsSync(`${resolvedSourceInBlueprint}.ejs`)
                            ? resolvedSourceInBlueprint
                            : javaResolvedSourceFile;

                        return { ...file, sourceFile, javaResolvedSourceFile, resolvedSourceFile, destinationFile };
                    },
                );
            },
        });
    }

    get [BaseApplicationGenerator.PREPARING]() {
        return this.asPreparingTaskGroup({
            blockhound({ application, source }) {
                source.addAllowBlockingCallsInside = ({ classPath, method }) => {
                    if (!application.reactive) throw new Error('Blockhound is only supported by reactive applications');

                    this.editFile(
                        `${KOTLIN_TEST_SRC_DIR}${application.packageFolder}config/JHipsterBlockHoundIntegration.kt`,
                        createNeedleCallback({
                            needle: 'blockhound-integration',
                            contentToAdd: `builder.allowBlockingCallsInside("${classPath}", "${method}")`,
                        }),
                    );
                };
            },
            async kotlinDefaults({ applicationDefaults }) {
                applicationDefaults({
                    __override__: true,
                    // Enabled by default if backendTypeJavaAny, apply for Kotlin as well
                    useNpmWrapper: ({ clientFrameworkAny }) => clientFrameworkAny,
                });
            },
            addCacheNeedles({ source, application }) {
                // Needle added in jhipster:spring-cache, delay to override it.
                this.delayTask(() => {
                    if (application.cacheProviderEhcache) {
                        const cacheConfigurationFile = `src/main/kotlin/${application.packageFolder}config/CacheConfiguration.kt`;
                        const needle = `${application.cacheProvider}-add-entry`;
                        const useJcacheConfiguration = application.cacheProviderRedis;
                        const addEntryToCacheCallback = entry =>
                            createNeedleCallback({
                                needle,
                                contentToAdd: `createCache(cm, ${entry}${useJcacheConfiguration ? ', jcacheConfiguration' : ''})`,
                            });

                        source.addEntryToCache = ({ entry }) => this.editFile(cacheConfigurationFile, addEntryToCacheCallback(entry));
                        source.addEntityToCache = ({ entityAbsoluteClass, relationships }) => {
                            const entry = `${entityAbsoluteClass}::class.java.name`;
                            this.editFile(
                                cacheConfigurationFile,
                                addEntryToCacheCallback(entry),
                                ...(relationships ?? [])
                                    .filter(rel => rel.collection)
                                    .map(rel => addEntryToCacheCallback(`${entry} + ".${rel.propertyName}"`)),
                            );
                        };
                    } else {
                        // Add noop
                        source.addEntryToCache = () => {};
                        // Add noop
                        source.addEntityToCache = () => {};
                    }
                });
            },
        });
    }

    get [BaseApplicationGenerator.LOADING_ENTITIES]() {
        return this.asLoadingEntitiesTaskGroup({
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
            migration({ entity }) {
                // V7 templates expects false instead of 'no'
                entity.searchEngine = entity.searchEngine === 'no' ? false : entity.searchEngine;
                // V7 templates are not compatible with jpaMetamodelFiltering for reactive
                if (this.jhipsterConfig.reactive && entity.jpaMetamodelFiltering) {
                    entity.jpaMetamodelFiltering = false;
                }
            },
            prepareEntityForKotlin({ entity }) {
                const { primaryKey } = entity;
                if (primaryKey && primaryKey.name === 'id') {
                    // Kotlin does not support string ids specifications.
                    primaryKey.javaBuildSpecification = 'buildRangeSpecification';
                    for (const field of primaryKey.fields) {
                        field.fieldJavaBuildSpecification = 'buildRangeSpecification';
                    }
                }
            },
        });
    }

    get [BaseApplicationGenerator.POST_WRITING]() {
        return this.asPostWritingTaskGroup({
            async customizeMaven({ application, source }) {
                if (application.buildToolMaven) {
                    source.addMavenDefinition({
                        properties: [{ property: 'modernizer.failOnViolations', value: 'false' }],
                    });
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
