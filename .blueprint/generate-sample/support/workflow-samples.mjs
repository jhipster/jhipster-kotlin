import { readFileSync } from 'fs';

const angularJson = readFileSync(new URL('../../../test-integration/workflow-samples/angular.json', import.meta.url), 'utf8');
const angularWorkflowSamples = JSON.parse(angularJson).include;

const reactJson = readFileSync(new URL('../../../test-integration/workflow-samples/react.json', import.meta.url), 'utf8');
const reactWorkflowSamples = JSON.parse(reactJson).include;

const prepareSamples = samples => Object.fromEntries(samples.map(({ name, ...sample }) => [name, sample]));

export const workflowSamples = prepareSamples([...angularWorkflowSamples, ...reactWorkflowSamples]);
export const angularSamples = prepareSamples(angularWorkflowSamples);
export const reactSamples = prepareSamples(reactWorkflowSamples);
