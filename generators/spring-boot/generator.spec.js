import { beforeAll, describe, expect, it } from 'vitest';

import { defaultHelpers as helpers, entitiesServerSamples, entityCustomId, entityStringId, result } from 'generator-jhipster/testing';

import { crossPackageReactiveEntity, entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

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
    });
});
