import { readFileSync } from 'fs';

const prepareSamples = samples => Object.fromEntries(samples.map(({ name, ...sample }) => [name, sample]));
const addSamplesGroup = (samples, samplesGroup) => samples.map(sample => ({ ...sample, 'samples-group': samplesGroup }));

const angularJson = readFileSync(new URL('../templates/_workflow-samples/angular.json', import.meta.url), 'utf8');
const angularWorkflowSamples = addSamplesGroup(JSON.parse(angularJson).include, 'angular');

const reactJson = readFileSync(new URL('../templates/_workflow-samples/react.json', import.meta.url), 'utf8');
const reactWorkflowSamples = addSamplesGroup(JSON.parse(reactJson).include, 'react');

export const workflowSamples = prepareSamples([...angularWorkflowSamples, ...reactWorkflowSamples]);
export const angularSamples = prepareSamples(angularWorkflowSamples);
export const reactSamples = prepareSamples(reactWorkflowSamples);
