/* eslint-disable jsdoc/valid-types */
/* eslint-disable n/no-unpublished-import */
/* eslint-disable import/no-unresolved */
// @ts-nocheck
/**
 * https://www.npmjs.com/search?q=eslint-config
 * https://www.npmjs.com/search?q=keywords:eslint
 *
 * npm init @eslint/config@latest -- --config eslint-config-standard
 * https://eslint.org/docs/latest/rules
 *
 * npx @eslint/config-inspector@latest
 * npx eslint --debug somefile.js
 * npx eslint --print-config file.js
 */

import { defineConfig } from 'eslint/config'
import globals from 'globals' // https://www.npmjs.com/package/globals
// @ts-ignore
import pluginImport from 'eslint-plugin-import' // https://www.npmjs.com/package/eslint-plugin-import
import pluginPromise from 'eslint-plugin-promise' // https://www.npmjs.com/package/eslint-plugin-promise
import jsdoc from 'eslint-plugin-jsdoc'// https://github.com/gajus/eslint-plugin-jsdoc
import node from 'eslint-plugin-n' // https://www.npmjs.com/package/eslint-plugin-n, node.js only
import stylistic from '@stylistic/eslint-plugin' // https://eslint.style
import js from '@eslint/js'

// Folder/file lists - eslint flat config is WEIRD!
// You have to override the top-level config (e.g. **/*.js) and then exclude the folders/files you don't want.

// Shared rules
const jsdocRules = {
    'jsdoc/check-alignment': 'off',
    // "jsdoc/check-indentation": ["warn", {"excludeTags":['example', 'description']}],
    'jsdoc/check-indentation': 'off',
    'jsdoc/check-param-names': 'warn',
    'jsdoc/check-tag-names': ['warn', {
        definedTags: ['typicalname', 'element', 'memberOf', 'slot', 'csspart'],
    }],
    'jsdoc/multiline-blocks': ['error', {
        noZeroLineText: false,
    }],
    'jsdoc/no-multi-asterisk': 'off',
    'jsdoc/no-undefined-types': ['error', {
        definedTypes: ['JQuery', 'NodeListOf', 'ProxyHandler'],
    }],
    'jsdoc/tag-lines': 'off',
}
const stylisticRules = {
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true, }],
    '@stylistic/comma-dangle': ['error', {
        arrays: 'only-multiline',
        objects: 'always',
        imports: 'never',
        exports: 'always-multiline',
        functions: 'never',
        importAttributes: 'never',
        dynamicImports: 'never',
    }],
    '@stylistic/eol-last': ['error', 'always'],
    '@stylistic/indent': ['error', 4, {
        SwitchCase: 1,
    }],
    '@stylistic/indent-binary-ops': ['error', 4],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/lines-between-class-members': 'off',
    '@stylistic/newline-per-chained-call': ['error', {
        ignoreChainWithDepth: 2,
    }],
    '@stylistic/no-confusing-arrow': 'error',
    '@stylistic/no-extra-semi': 'error',
    '@stylistic/no-mixed-spaces-and-tabs': 'error',
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/space-before-function-paren': 'off',
    '@stylistic/spaced-comment': ['error', 'always', {
        line: {
            exceptions: ['*', '#region', '#endregion'],
        },
        block: {
            exceptions: ['*'],
        },
    }],
    '@stylistic/space-in-parens': 'off',
    '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: 'always',
    }],
}
const generalRules = {
    'new-cap': 'error',
    'no-else-return': 'error',
    'no-empty': ['error', {
        allowEmptyCatch: true,
    }],
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    'no-var': 'warn',
    'prefer-const': 'error',
}

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([

    // Browser (ES2019) script, no-build
    {
        files: ['**/*.{js,cjs}'],
        ignores: ['nodes/**/*.{js,cjs}'],
        languageOptions: {
            sourceType: 'script',
            ecmaVersion: 2019,
            globals: {
                ...globals.browser,
                // window: 'writable', // allow setting window global properties
                jQuery: 'readonly',
                RED: 'readonly',
                uibuilder: 'writable',
                $: 'readonly',
                $$: 'readonly',
                // console: 'readonly',
            },
        },
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        plugins: {
            'js': js,
            'pluginPromise': pluginPromise,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
        },
        extends: [
            js.configs.recommended,
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
        ],
        settings: {
            jsdoc: { mode: 'jsdoc', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
            // 'no-empty': ['error', { 'allowEmptyCatch': true }],
        },
    },

    // Browser (Latest) ESM, ESBUILD
    {
        files: ['**/*.mjs'],
        ignores: ['nodes/**/*.{js,cjs,mjs}'],
        // ...pluginImport.flatConfigs.recommended,
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
                // window: 'writable', // allow setting window global properties
                jQuery: 'readonly',
                RED: 'readonly',
                uibuilder: 'writable',
                $: 'readonly',
                $$: 'readonly',
                // console: 'readonly',
            },
        },
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        plugins: {
            'js': js,
            'pluginPromise': pluginPromise,
            'pluginImport': pluginImport,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
        },
        extends: [
            js.configs.recommended,
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            pluginImport.flatConfigs.recommended,
        ],
        settings: {
            jsdoc: { mode: 'jsdoc', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
            // 'no-empty': ['error', { 'allowEmptyCatch': true }],
        },

    },

    // Node.js (v18) CommonJS, no-build
    {
        // files: nodeCJS,
        files: ['**/*.{js,cjs}'],
        ignores: ['resources/*.{js,cjs}'],
        languageOptions: {
            sourceType: 'commonjs',
            // Will be overridden by the n plugin which detects the correct node.js version from package.json
            ecmaVersion: 'latest',
            // Node.js globals are provided by the n plugin
            // globals: globals.browser,
        },
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        plugins: {
            'js': js,
            'pluginImport': pluginImport,
            'pluginPromise': pluginPromise,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
            'n': node, // <= n/node
        },
        extends: [
            js.configs.recommended,
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            node.configs['flat/recommended-script'], // <= script/commonjs
        ],
        settings: {
            jsdoc: { mode: 'jsdoc', },
            // Better to pick up from package.json unless needing to override
            // package.json is restricted to >=v18 to match Node-RED. We want at least v18.4
            node: { version: '18.4.0', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
        },
    },

    // Node.js (LTS) ESM, ESBUILD
    {
        // files: nodeMJS,
        files: ['**/*.mjs'],
        ignores: ['resources/*.{js,cjs,mjs}'],
        languageOptions: {
            sourceType: 'module',
            // Will be overridden by the n plugin which detects the correct node.js version from package.json
            ecmaVersion: 'latest',
            // Node.js globals are provided by the n plugin
            // globals: globals.browser,
        },
        linterOptions: {
            reportUnusedInlineConfigs: 'error',
        },
        plugins: {
            'js': js,
            'pluginImport': pluginImport,
            'pluginPromise': pluginPromise,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
            'n': node, // <= n/node
        },
        extends: [
            js.configs.recommended,
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            pluginImport.flatConfigs.recommended,
            node.configs['flat/recommended-module'], // <= module/ESM
        ],
        settings: {
            jsdoc: { mode: 'jsdoc', },
            // Override for node.js current LTS (assuming the use of ESBUILD)
            // Better to pick up from package.json unless needing to override
            node: { version: 'lts', },
        },
        rules: {
            ...jsdocRules,
            ...stylisticRules,
            ...generalRules,
            'n/no-unsupported-features/es-syntax': 'off', // Allow all modern ESM features
            'n/no-missing-import': 'error',
            'n/no-process-exit': 'warn',
        },
    },
])
