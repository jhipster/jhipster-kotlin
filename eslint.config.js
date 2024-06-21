import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import jhipsterRecommended from 'generator-jhipster/eslint/recommended';

export default [
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    jhipsterRecommended,
    prettierRecommended,
];
