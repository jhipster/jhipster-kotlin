import { asCommand } from 'generator-jhipster';

export default asCommand({
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
});
