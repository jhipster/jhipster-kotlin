/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
    options: {},
    configs: {
        skipKtlintFormat: {
            cli: {
                desc: 'Skip ktlintFormat',
                type: Boolean,
            },
            scope: 'generator',
        },
    },
    arguments: {},
};

export default command;
