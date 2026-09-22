import prettier from 'eslint-plugin-prettier/recommended';
import jhipster from 'generator-jhipster/eslint';
import globals from 'globals';
// jhipster-needle-eslint-add-import - JHipster will add additional import here

export default [
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    { ignores: ['coverage/**'] },
    jhipster.recommended,
    // jhipster-needle-eslint-add-config - JHipster will add additional config here
    prettier,
];
