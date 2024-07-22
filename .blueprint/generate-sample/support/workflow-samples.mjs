import { readFileSync } from 'fs';

const angularSamples = readFileSync(new URL('../../../test-integration/workflow-samples/angular.json', import.meta.url), 'utf8');
const reactSamples = readFileSync(new URL('../../../test-integration/workflow-samples/react.json', import.meta.url), 'utf8');

const samples = [...JSON.parse(angularSamples).include, ...JSON.parse(reactSamples).include];
export const workflowSamples = Object.fromEntries(samples.map(({ name, ...sample }) => [name, sample]));
