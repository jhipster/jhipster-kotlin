import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, entitiesServerSamples, result } from 'generator-jhipster/testing';

import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from './entities.js';

const blogEntity = {
    name: 'Blog',
    changelogDate: '20260927000100',
    fields: [
        { fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required', 'minlength'], fieldValidateRulesMinlength: '3' },
        { fieldName: 'handle', fieldType: 'String', fieldValidateRules: ['required', 'minlength'], fieldValidateRulesMinlength: '2' },
    ],
};

const postEntity = {
    name: 'Post',
    changelogDate: '20260927000200',
    fields: [
        { fieldName: 'title', fieldType: 'String', fieldValidateRules: ['required'] },
        { fieldName: 'content', fieldType: 'byte[]', fieldTypeBlobContent: 'text', fieldValidateRules: ['required'] },
        { fieldName: 'date', fieldType: 'Instant', fieldValidateRules: ['required'] },
    ],
    relationships: [
        {
            relationshipName: 'blog',
            otherEntityName: 'Blog',
            relationshipType: 'many-to-one',
            otherEntityField: 'name',
        },
        {
            relationshipName: 'tag',
            otherEntityName: 'Tag',
            relationshipType: 'many-to-many',
            otherEntityField: 'name',
            otherEntityRelationshipName: 'entry',
        },
    ],
};

const tagEntity = {
    name: 'Tag',
    changelogDate: '20260927000300',
    fields: [{ fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required', 'minlength'], fieldValidateRulesMinlength: '2' }],
};

const expectOnlyKotlinFiles = snapshot => {
    const allFiles = Object.keys(snapshot);
    const javaFiles = allFiles.filter(file => file.endsWith('.java'));
    expect(javaFiles).toEqual([]);

    const kotlinFiles = allFiles.filter(
        file => (file.startsWith('src/main/kotlin/') || file.startsWith('src/test/kotlin/')) && file.endsWith('.kt'),
    );
    expect(kotlinFiles.length).toBeGreaterThan(0);
};

describe('Kotlin-only generation verification', () => {
    describe('Assertion guard', () => {
        it('should fail when a .java file is present in the snapshot', () => {
            const fakeSnapshot = {
                'src/main/kotlin/com/mycompany/myapp/App.kt': { state: 'modified' },
                'src/test/kotlin/com/mycompany/myapp/web/rest/TagResourceIT.java': { state: 'modified' },
            };
            const javaFiles = Object.keys(fakeSnapshot).filter(file => file.endsWith('.java'));
            expect(() => {
                expect(javaFiles).toEqual([]);
            }).toThrow();
        });
    });

    describe('Microservice with Blog, Post, and Tag entities (blog sample)', () => {
        beforeAll(async () => {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig(
                    {
                        applicationType: 'microservice',
                        baseName: 'blog',
                        packageName: 'com.okta.developer.blog',
                        prodDatabaseType: 'postgresql',
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        clientFramework: 'angular',
                        skipUserManagement: true,
                        feignClient: true,
                    },
                    [blogEntity, postEntity, tagEntity],
                )
                .withOptions({
                    ignoreNeedlesError: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
                })
                .withJHipsterGenerators()
                .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
        });

        it('should generate all source and test files as Kotlin and zero Java files', () => {
            expectOnlyKotlinFiles(result.getStateSnapshot());
        });

        it('should have generated *ResourceIT files as .kt only', () => {
            const resourceITFiles = Object.keys(result.getStateSnapshot()).filter(file => file.includes('ResourceIT'));
            expect(resourceITFiles.length).toBeGreaterThan(0);
            for (const file of resourceITFiles) {
                expect(file.endsWith('.kt')).toBe(true);
                expect(file.endsWith('.java')).toBe(false);
            }
        });
    });

    describe('Monolith with multiple entities and relationships', () => {
        beforeAll(async () => {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig(
                    {
                        applicationType: 'monolith',
                        baseName: 'sampleApp',
                        packageName: 'com.mycompany.myapp',
                        prodDatabaseType: 'postgresql',
                        authenticationType: 'jwt',
                    },
                    [...entitiesServerSamples, entityWithCriteriaAndDto, entityWithEnum, entityWithBagRelationship],
                )
                .withOptions({
                    ignoreNeedlesError: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
                })
                .withJHipsterGenerators()
                .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
        });

        it('should generate all source and test files as Kotlin and zero Java files', () => {
            expectOnlyKotlinFiles(result.getStateSnapshot());
        });
    });
});
