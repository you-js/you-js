import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
            sourceType: 'module',
        },
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off', // 게임 엔진 개발 특성상 console 사용 허용
        },
    },
    {
        ignores: ['dist/', 'dist-game/', 'release/', 'node_modules/'],
    },
];
