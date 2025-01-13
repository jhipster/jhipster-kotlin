import { fileURLToPath } from 'node:url';
import { defineDefaults } from 'generator-jhipster/testing';

defineDefaults({
    blueprint: 'generator-jhipster-kotlin',
    blueprintPackagePath: fileURLToPath(new URL('./', import.meta.url)),
});
