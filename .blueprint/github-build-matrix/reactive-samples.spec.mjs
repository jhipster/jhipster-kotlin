import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { angularSamples, reactSamples, vueSamples } from '../generate-sample/support/workflow-samples.mjs';

import { isReactiveSample } from './reactive-samples.mjs';

const templates = fileURLToPath(new URL('../generate-sample/templates', import.meta.url));

describe('reactive application checks', () => {
    it('includes every WebFlux Angular variant and the mixed reactive stack', () => {
        expect(
            Object.entries(angularSamples)
                .filter(([, sample]) => !sample.disabled && isReactiveSample(sample, templates))
                .map(([name]) => name),
        ).toEqual([
            'ng-webflux-mongodb',
            'ng-webflux-gradle-mongodb-oauth2',
            'ng-webflux-psql-default',
            'ng-webflux-psql-additional',
            'ng-webflux-gradle-session-h2mem-es',
            'mf-ng-eureka-jwt-psql-ehcache',
            'ng-webflux-mysql-kafka',
            'ng-webflux-couchbase',
        ]);
    });

    it('includes reactive applications without WebFlux in their sample names', () => {
        for (const [samples, names] of [
            [reactSamples, ['ms-react-consul-jwt-cassandra-redis', 'ms-mf-react-eureka-oauth2-mariadb-infinispan']],
            [vueSamples, ['ms-vue-eureka-jwt-couchbase-hazelcast', 'ms-mf-vue-consul-oauth2-mysql-memcached', 'stack-vue-no-db']],
        ]) {
            expect(
                Object.entries(samples)
                    .filter(([, sample]) => !sample.disabled && isReactiveSample(sample, templates))
                    .map(([name]) => name),
            ).toEqual(names);
        }
    });
    it('honors explicit nonreactive gateways and inspects additional JDL samples', () => {
        const folder = mkdtempSync(join(tmpdir(), 'reactive-matrix-'));
        try {
            mkdirSync(join(folder, '_json-samples', 'gateway'), { recursive: true });
            writeFileSync(
                join(folder, '_json-samples', 'gateway', '.yo-rc.json'),
                JSON.stringify({ 'generator-jhipster': { applicationType: 'gateway', reactive: false } }),
            );
            expect(isReactiveSample({ 'app-sample': 'gateway' }, folder)).toBe(false);
            mkdirSync(join(folder, '_jdl-samples', 'first'), { recursive: true });
            writeFileSync(
                join(folder, '_jdl-samples', 'first', 'app.jdl'),
                'application { config { applicationType gateway reactive false } } // reactive true',
            );
            expect(isReactiveSample({ 'jdl-samples': 'first' }, folder)).toBe(false);
            mkdirSync(join(folder, '_supporting-samples'));
            writeFileSync(
                join(folder, '_supporting-samples', 'second.jdl'),
                'application { config { applicationType microservice reactive true } }',
            );
            expect(isReactiveSample({ 'jdl-samples': 'first,second' }, folder)).toBe(true);
            expect(() => isReactiveSample({}, folder)).toThrow('Cannot determine');
        } finally {
            rmSync(folder, { recursive: true, force: true });
        }
    });
});
