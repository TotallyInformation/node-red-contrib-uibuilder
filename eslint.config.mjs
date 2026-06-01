/* eslint-disable n/no-unpublished-import */
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
import { importX } from 'eslint-plugin-import-x' // https://www.npmjs.com/package/eslint-plugin-import-x
import pluginPromise from 'eslint-plugin-promise' // https://www.npmjs.com/package/eslint-plugin-promise
// https://github.com/gajus/eslint-plugin-jsdoc
import jsdoc from 'eslint-plugin-jsdoc' // eslint-disable-line import-x/no-named-as-default
// import sonarjs from 'eslint-plugin-sonarjs' // https://www.npmjs.com/package/eslint-plugin-sonarjs, for code quality and security issues
import node from 'eslint-plugin-n' // https://www.npmjs.com/package/eslint-plugin-n, node.js only
import pluginSecurity from 'eslint-plugin-security' // https://www.npmjs.com/package/eslint-plugin-security, node.js only
import stylistic from '@stylistic/eslint-plugin' // https://eslint.style
import js from '@eslint/js'
import { jsdocRules, stylisticRules, generalRules } from './eslint-shared-config.mjs' // Shared rules for all ESLINT configs

// Folder/file lists - eslint flat config is WEIRD!
// You have to override the top-level config (e.g. **/*.js) and then exclude the folders/files you don't want.

export default defineConfig([

    // Browser (ES2019) script, no-build
    {
        files: ['**/*.{js,cjs}'],
        ignores: ['nodes/**/*.*', 'gulpfile.js'],
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
            'js/recommended',
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
        ignores: ['nodes/**/*.*', 'stylelint.config.mjs'],
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
            'import-x': importX,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
        },
        extends: [
            'js/recommended',
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            'import-x/flat/recommended',
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
        ignores: ['resources/**/*.*', 'src/front-end-module/**/*.*', 'src/components/**/*.*'],
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
            // 'import-x': importX,
            'pluginPromise': pluginPromise,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
            'n': node, // <= n/node
            'pluginSecurity': pluginSecurity, // <= eslint-plugin-security for Node.js security best practices
            // 'sonarjs': sonarjs, // <= eslint-plugin-sonarjs for code quality and security issues
        },
        extends: [
            'js/recommended',
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            node.configs['flat/recommended-script'], // <= script/commonjs
            pluginSecurity.configs.recommended,
            // sonarjs.configs.recommended
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
            'security/detect-object-injection': 'off', // Common in Node-RED for dynamic property access, but can be a security risk if used with untrusted input
        },
    },

    // Node.js (LTS) ESM, ESBUILD
    {
        // files: nodeMJS,
        files: ['**/*.mjs'],
        ignores: ['resources/**/*.*', 'src/front-end-module/**/*.*', 'src/components/**/*.*'],
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
            'import-x': importX,
            'pluginPromise': pluginPromise,
            'jsdoc': jsdoc,
            '@stylistic': stylistic,
            'n': node, // <= n/node
            'pluginSecurity': pluginSecurity, // <= eslint-plugin-security for Node.js security best practices
        },
        extends: [
            'js/recommended',
            jsdoc.configs['flat/recommended'],
            stylistic.configs.recommended,
            pluginPromise.configs['flat/recommended'],
            'import-x/flat/recommended',
            node.configs['flat/recommended-module'], // <= module/ESM
            pluginSecurity.configs.recommended,
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
            'security/detect-object-injection': 'off', // Common in Node-RED for dynamic property access, but can be a security risk if used with untrusted input
        },
    },
])
