// @ts-nocheck
/** Front-end ESLINT definition
 * @version 2026-11-07
 */
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import pluginPromise from 'eslint-plugin-promise' // https://www.npmjs.com/package/eslint-plugin-promise
import pluginSecurity from 'eslint-plugin-security' // https://www.npmjs.com/package/eslint-plugin-security, node.js only
import stylistic from '@stylistic/eslint-plugin' // https://eslint.style
import js from '@eslint/js'
import { importX } from 'eslint-plugin-import-x' // https://www.npmjs.com/package/eslint-plugin-import
import { jsdocRules, stylisticRules, generalRules } from '../../eslint-shared-config.mjs' // Shared rules for all ESLINT configs
// https://github.com/gajus/eslint-plugin-jsdoc
import jsdoc from 'eslint-plugin-jsdoc' // eslint-disable-line import-x/no-named-as-default

// Everything in `src/front-end-module` is ESM - it is built via esbuild
// into `front-end/` as both ESM and IIFE and down-built to ES2019

export default defineConfig([
    {
        files: ['**/*.{js,mjs}'],
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
        plugins: {
            'js': js,
            'pluginPromise': pluginPromise,
            'import-x': importX,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
        },
        extends: [
            'js/recommended',
            'jsdoc/flat/recommended',
            '@stylistic/recommended',
            'pluginPromise/flat/recommended',
            'import-x/flat/recommended',
        ],
        settings: {
            jsdoc: { mode: 'permissive', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
        },
    },
])
