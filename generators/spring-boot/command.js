import { command as springBootCommand } from 'generator-jhipster/generators/spring-boot';

/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */
const command = {
    ...springBootCommand,
    configs: {
        skipKtlintFormat: {
            cli: {
                desc: 'Skip ktlintFormat',
                type: Boolean,
            },
            scope: 'generator',
        },
        ...springBootCommand.configs,
    },
};

export default command;
