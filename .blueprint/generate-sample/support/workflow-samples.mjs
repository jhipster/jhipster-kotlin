import { readFileSync } from 'fs';

const prepareSamples = samples => Object.fromEntries(samples.map(({ name, ...sample }) => [name, sample]));
const addSamplesGroup = (samples, samplesGroup) => samples.map(sample => ({ ...sample, 'samples-group': samplesGroup }));

const angularJson = readFileSync(new URL('../templates/_workflow-samples/angular.json', import.meta.url), 'utf8');
const angularWorkflowSamples = addSamplesGroup(JSON.parse(angularJson).include, 'angular');

const reactJson = readFileSync(new URL('../templates/_workflow-samples/react.json', import.meta.url), 'utf8');
const reactWorkflowSamples = addSamplesGroup(JSON.parse(reactJson).include, 'react');

const vueJson = readFileSync(new URL('../templates/_workflow-samples/vue.json', import.meta.url), 'utf8');
const vueWorkflowSamples = addSamplesGroup(JSON.parse(vueJson).include, 'vue');

export const workflowSamples = prepareSamples([...angularWorkflowSamples, ...reactWorkflowSamples, ...vueWorkflowSamples]);
export const angularSamples = prepareSamples(angularWorkflowSamples);
export const reactSamples = prepareSamples(reactWorkflowSamples);
export const vueSamples = prepareSamples(vueWorkflowSamples);
