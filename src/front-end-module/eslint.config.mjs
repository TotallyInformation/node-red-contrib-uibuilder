// @ts-nocheck
import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
// @ts-ignore https://www.npmjs.com/package/eslint-plugin-promise
import pluginPromise from 'eslint-plugin-promise'
// https://www.npmjs.com/package/eslint-plugin-import
import { importX } from 'eslint-plugin-import-x'
// https://github.com/gajus/eslint-plugin-jsdoc
import jsdoc from 'eslint-plugin-jsdoc' // eslint-disable-line import-x/no-named-as-default
// https://eslint.style
import stylistic from '@stylistic/eslint-plugin'
// Shared rules for all ESLINT configs
import { jsdocRules, stylisticRules, generalRules } from '../../eslint-shared-config.mjs'

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
        plugins: {
            js,
            jsdoc,
            'pluginPromise': pluginPromise,
            'import-x': importX,
            '@stylistic': stylistic,
        },
        extends: [
            'js/recommended',
            // jsdoc.configs['flat/recommended'],
            'jsdoc/flat/recommended',
            // stylistic.configs.recommended,
            '@stylistic/recommended',
            // pluginPromise.configs['flat/recommended'],
            'pluginPromise/flat/recommended',
            'import-x/flat/recommended',
        ],
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
                // window: 'writable', // allow setting window global properties
                // jQuery: 'readonly',
                RED: 'readonly',
                uibuilder: 'writable',
                Ui: 'readonly',
                // $: 'readonly',
                // $$: 'readonly',
                // console: 'readonly',
            },
        },
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        settings: {
            jsdoc: { mode: 'jsdoc', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
        },
    },
])
