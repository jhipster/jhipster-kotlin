import { beforeAll, describe, expect, it } from 'vitest';

import {
    buildServerMatrix,
    defaultHelpers as helpers,
    entitiesServerSamples,
    extendFilteredMatrix,
    extendMatrix,
    result,
} from 'generator-jhipster/testing';
import { isMatch } from 'lodash-es';

import { entityWithBagRelationship, entityWithCriteriaAndDto, entityWithEnum } from '../../test/entities.js';

const databaseType = ['sql', 'mongodb', 'cassandra', 'couchbase', 'neo4j'];

let matrix = buildServerMatrix({ databaseType });
matrix = extendMatrix(matrix, { messageBroker: ['no', 'kafka'] });
matrix = extendFilteredMatrix(matrix, config => config.applicationType === 'microservice' && !config.reactive, { feignClient: [true] });

describe('Matrix test of SubGenerator kotlin of kotlin JHipster blueprint', () => {
    Object.entries(matrix).forEach(([name, config], _idx) => {
        // if (_idx !== 0) return;
        // generator-jhipster 9.x's own matrix builder produces the real 'spring-websocket' string
        // value directly (not a `true` placeholder), and its own validation now rejects websocket
        // support on gateway/microservice applications outright.
        if (
            config.websocket &&
            config.websocket !== 'no' &&
            (config.applicationType === 'gateway' || config.applicationType === 'microservice')
        ) {
            config.websocket = false;
        }
        if (config.websocket === true) {
            config.websocket = 'spring-websocket';
        }
        if (isMatch(config, { skipUserManagement: false, applicationType: 'microservice' })) {
            config.skipUserManagement = true;
        }
        if (isMatch(config, { databaseType: 'couchbase', searchEngine: 'elasticsearch' })) {
            config.searchEngine = 'couchbase';
        }
        describe(name, () => {
            beforeAll(async function () {
                await helpers
                    .run('jhipster:spring-boot')
                    .withJHipsterConfig(config, [
                        ...entitiesServerSamples,
                        entityWithCriteriaAndDto,
                        entityWithEnum,
                        entityWithBagRelationship,
                    ])
                    .withOptions({
                        ignoreNeedlesError: true,
                        blueprints: 'kotlin',
                        skipKtlintFormat: true,
                        // Imperative (non-reactive) gateways use Spring Cloud Gateway MVC, which
                        // generator-jhipster 9.x flags as experimental and refuses without this.
                        experimental: true,
                    })
                    .withJHipsterGenerators()
                    .withLookups({ packagePaths: [process.cwd()], lookups: ['generators', 'generators/*/generators'] })
                    .withMockedGenerators(['jhipster-kotlin:ktlint', 'jhipster-kotlin:detekt', 'jhipster:client', 'jhipster:languages']);
            });

            it('does not generate package-only constants files', () => {
                const constants = Object.keys(result.getStateSnapshot()).filter(file => file.endsWith('/config/Constants.kt'));
                for (const file of constants) {
                    expect(result.fs.read(file)).toContain('const val ');
                }
            });

            if (config.searchEngine === 'couchbase') {
                it('retries the Couchbase search response assertions', () => {
                    const resources = Object.keys(result.getStateSnapshot()).filter(file => file.endsWith('ResourceIT.kt'));
                    const searchTests = resources
                        .map(file => result.fs.read(file))
                        .filter(content => content.includes('ENTITY_SEARCH_API_URL'));
                    expect(searchTests.length).toBeGreaterThan(0);
                    for (const content of searchTests) {
                        expect(content).toContain('await().pollInSameThread().atMost(1, TimeUnit.MINUTES).untilAsserted');
                        expect(content).not.toContain('retryUntilNotEmpty');
                    }
                });
            }

            it('should succeed', () => {
                expect(result.getStateSnapshot()).toMatchSnapshot();
            });

            it('should generate valid security utility return types', () => {
                const securityUtilsPath = Object.keys(result.getStateSnapshot()).find(path => path.endsWith('/security/SecurityUtils.kt'));
                const securityUtils = result.fs.read(securityUtilsPath);
                const prefix = config.reactive ? 'suspend ' : '';
                const returnType = config.reactive ? 'String?' : 'Optional<String>';
                expect(securityUtils).toContain(`${prefix}fun getCurrentUserLogin(): ${returnType} =`);
                if (config.authenticationType === 'jwt') {
                    expect(securityUtils).toContain(`${prefix}fun getCurrentUserJWT(): ${returnType} =`);
                }
                if (config.reactive) {
                    const userServicePath = Object.keys(result.getStateSnapshot()).find(path => path.endsWith('/service/UserService.kt'));
                    if (userServicePath) {
                        const userService = result.fs.read(userServicePath);
                        expect(userService).toContain('import kotlinx.coroutines.reactor.mono');
                        expect(userService).not.toMatch(/getCurrentUserLogin\(\)\s*\./);
                        expect(userService).toContain('mono { getCurrentUserLogin() }');
                    }
                }
            });

            it('should not generate any .java files', () => {
                const javaFiles = Object.keys(result.getStateSnapshot()).filter(file => file.endsWith('.java'));
                expect(javaFiles).toEqual([]);
            });
        });
    });
});
