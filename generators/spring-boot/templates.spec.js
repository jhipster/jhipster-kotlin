import { describe, expect, it } from 'vitest';
import { existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { globby } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jhipsterGenerators = join(__dirname, '../../node_modules/generator-jhipster/dist/generators');
const templatesFolder = join(__dirname, 'templates');

// Flattened blueprint template ownership mapping
const UPSTREAM_GENERATOR_TO_BLUEPRINT_DIR = {
    'spring-boot': '',
    'spring-boot/generators/jwt': '',
    'spring-boot/generators/oauth2': '',
    'spring-boot/generators/cache': 'spring-cache',
    'spring-boot/generators/cucumber': 'cucumber',
    'spring-boot/generators/data-cassandra': 'spring-data-cassandra',
    'spring-boot/generators/data-couchbase': 'spring-data-couchbase',
    'spring-boot/generators/data-elasticsearch': 'spring-data-elasticsearch',
    'spring-boot/generators/data-mongodb': 'spring-data-mongodb',
    'spring-boot/generators/data-neo4j': 'spring-data-neo4j',
    'spring-boot/generators/data-relational': 'spring-data-relational',
    'spring-boot/generators/graalvm': 'graalvm',
    'spring-boot/generators/liquibase': 'liquibase',
    'spring-boot/generators/websocket': 'spring-websocket',
    'java/generators/domain': 'domain',
    'java/generators/gatling': 'gatling',
    'spring-cloud/generators/feign-client': 'feign-client',
    'spring-cloud/generators/gateway': 'gateway',
    'spring-cloud/generators/kafka': 'kafka',
    'spring-cloud/generators/pulsar': 'pulsar',
};

const BLUEPRINT_DIR_TO_UPSTREAM_GENERATORS = {};
for (const [upstreamGen, bpDir] of Object.entries(UPSTREAM_GENERATOR_TO_BLUEPRINT_DIR)) {
    (BLUEPRINT_DIR_TO_UPSTREAM_GENERATORS[bpDir] ??= []).push(upstreamGen);
}

const excludedJavaTemplates = new Map([
    [
        'java-simple-application/templates/src/main/java/_package_/GeneratedByJHipster.java.ejs',
        'Inherited from the base Java application generator; it is an annotation consumed by both Java and Kotlin sources.',
    ],
]);

const excludedKotlinTemplates = new Map([]);

const exclusionReason = (template, excluded) =>
    [...excluded].find(([path]) => (path.endsWith('/') ? template.startsWith(path) : template === path))?.[1];

const toKotlinTemplatePath = template => template.replaceAll('/java/', '/kotlin/').replace(/\.java(?=[_.]|$)/, '.kt');

const toJavaTemplatePath = template => template.replaceAll('/kotlin/', '/java/').replace(/\.kt(?=[_.]|$)/, '.java');

describe('test if kotlin templates have a matching java template', async () => {
    const kotlinTemplates = (
        await globby('**/*', {
            cwd: templatesFolder,
            gitignore: false,
        })
    ).filter(file => basename(file).includes('.kt'));

    for (const kotlinTemplate of kotlinTemplates) {
        const reason = exclusionReason(kotlinTemplate, excludedKotlinTemplates);
        if (reason) {
            it.skip(`${kotlinTemplate}: ${reason}`, () => {});
            continue;
        }

        const firstSegment = kotlinTemplate.split('/')[0];
        const isSubDir = Boolean(BLUEPRINT_DIR_TO_UPSTREAM_GENERATORS[firstSegment]);
        const bpDir = isSubDir ? firstSegment : '';
        const relPath = isSubDir ? kotlinTemplate.slice(firstSegment.length + 1) : kotlinTemplate;
        const relativeJavaTemplate = toJavaTemplatePath(relPath);
        const candidateGenerators = BLUEPRINT_DIR_TO_UPSTREAM_GENERATORS[bpDir] || ['spring-boot'];

        it(`java jhipster template should exist for: ${kotlinTemplate}`, () => {
            const match = candidateGenerators.some(gen => existsSync(join(jhipsterGenerators, gen, 'templates', relativeJavaTemplate)));
            expect(
                match,
                `no upstream Java template was found for Kotlin template ${kotlinTemplate} (expected ${relativeJavaTemplate} in [${candidateGenerators.join(', ')}])`,
            ).toBe(true);
        });
    }
});

describe('test if upstream java templates have a matching kotlin template', async () => {
    const javaTemplates = (
        await globby('**/templates/**', {
            cwd: jhipsterGenerators,
            gitignore: false,
        })
    ).filter(file => basename(file).includes('.java'));

    for (const javaTemplate of javaTemplates) {
        const reason = exclusionReason(javaTemplate, excludedJavaTemplates);
        if (reason) {
            it.skip(`${javaTemplate}: ${reason}`, () => {});
            continue;
        }

        const upstreamGenerator = javaTemplate.slice(0, javaTemplate.indexOf('/templates/'));
        const relativeJavaTemplate = javaTemplate.slice(javaTemplate.indexOf('/templates/') + '/templates/'.length);
        const kotlinRelTemplate = toKotlinTemplatePath(relativeJavaTemplate);
        const bpDir = UPSTREAM_GENERATOR_TO_BLUEPRINT_DIR[upstreamGenerator];
        const expectedKotlinTemplate = bpDir ? join(bpDir, kotlinRelTemplate) : kotlinRelTemplate;

        it(`kotlin template should exist: ${expectedKotlinTemplate}`, () => {
            expect(
                UPSTREAM_GENERATOR_TO_BLUEPRINT_DIR,
                `generator ${upstreamGenerator} is not mapped to a blueprint template directory`,
            ).toHaveProperty(upstreamGenerator);

            const exists = existsSync(join(templatesFolder, expectedKotlinTemplate));
            expect(exists, `no Kotlin template was found at ${expectedKotlinTemplate} for upstream template ${javaTemplate}`).toBe(true);
        });
    }
});
