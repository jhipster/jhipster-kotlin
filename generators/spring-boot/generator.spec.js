import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, entitiesServerSamples, entityCustomId, entityStringId, result } from 'generator-jhipster/testing';

import { crossPackageReactiveEntity, entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

// Regression guard: the Kotlin blueprint must never fall back to a Java template
// under a Kotlin source root (see generator.js `NAMESPACE_TO_TEMPLATE_PREFIX`).
const expectNoJavaFilesUnderKotlinSourceRoots = () => {
    const javaFilesUnderKotlin = Object.keys(result.getStateSnapshot()).filter(
        file => (file.startsWith('src/main/kotlin/') || file.startsWith('src/test/kotlin/')) && file.endsWith('.java'),
    );
    expect(javaFilesUnderKotlin).toEqual([]);
};

describe('SubGenerator kotlin of kotlin JHipster blueprint', () => {
    describe('run', () => {
        beforeAll(async function () {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig({}, [...entitiesServerSamples, entityWithCriteriaAndDto, entityWithEnum, entityWithBagRelationship])
                .withOptions({
                    ignoreNeedlesError: true,
                    blueprints: 'kotlin',
                })
                .withJHipsterGenerators()
                .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                .withMockedGenerators(['jhipster-kotlin:ktlint']);
        });

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });

        it('should not leave .java files under a kotlin source root', () => {
            expectNoJavaFilesUnderKotlinSourceRoots();
        });
    });

    describe('cross-package reactive entities', () => {
        beforeAll(async function () {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig(
                    {
                        reactive: true,
                    },
                    [entityCustomId, crossPackageReactiveEntity],
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

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });

        it('should not leave .java files under a kotlin source root', () => {
            expectNoJavaFilesUnderKotlinSourceRoots();
        });
    });

    describe('entityStringId coverage', () => {
        beforeAll(async function () {
            await helpers
                .run('jhipster:spring-boot')
                .withJHipsterConfig({}, [entityStringId])
                .withOptions({
                    ignoreNeedlesError: true,
                    blueprints: 'kotlin',
                    skipKtlintFormat: true,
                })
                .withJHipsterGenerators()
                .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
        });

        it('should succeed', () => {
            expect(result.getStateSnapshot()).toMatchSnapshot();
        });

        it('should not leave .java files under a kotlin source root', () => {
            expectNoJavaFilesUnderKotlinSourceRoots();
        });
    });
});
