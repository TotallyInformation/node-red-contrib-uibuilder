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

import globals from 'globals' // https://www.npmjs.com/package/globals
// @ts-ignore
import pluginImport from 'eslint-plugin-import' // https://www.npmjs.com/package/eslint-plugin-import
import pluginPromise from 'eslint-plugin-promise' // https://www.npmjs.com/package/eslint-plugin-promise
import jsdoc from 'eslint-plugin-jsdoc'// https://github.com/gajus/eslint-plugin-jsdoc
import node from 'eslint-plugin-n' // https://www.npmjs.com/package/eslint-plugin-n, node.js only
import stylistic from '@stylistic/eslint-plugin' // https://eslint.style
import js from '@eslint/js'

// Folder/file lists
const browserCJS = [ // browser, es2019
    // User FE code, mostly CJS/IIFE
    'front-end/**/*.iife.js',
    'front-end/**/*.html',
    // Documentation
    'docs/**/*.js',
    'docs/**/*.html',
    // NR Editor FE code
    'resources/*.js', // these are actually being moved to load as modules but are not built so need es2019
]
const browserMJS = [ // browser, latest, module
    // Built-in web components source code - Use ESBUILD, treat as ESM
    'src/components/*.js',
    // Source code for the FE libraries - Use ESBUILD, treat as ESM
    'src/front-end-module/*.js',
    // User FE code, ESM versions - already built so not worried about es version
    'front-end/**/*.esm.js',
]
const nodeCJS = [ // node, node18, cjs
    'nodes/elements/elementBuilder.js',
    // NR runtime code
    // 'nodes/libs/*.js',
    'nodes/**/*.{js|cjs}',
    // Update the docs bundle for docsify offline use
    'src/doc-bundle/*.js',
]
const nodeMJS = [ // node, latest, module
    'nodes/**/*.mjs',
    'eslint.config.mjs',
]

// General rules
// const general = {
//     plugins: {
//         '@stylistic': stylistic,
//     },
//     rules: {
//         'jsdoc/check-alignment': 'warn',
//         // "jsdoc/check-indentation": ["warn", {"excludeTags":['example', 'description']}],
//         'jsdoc/check-indentation': 'off',
//         'jsdoc/check-param-names': 'warn',
//         'jsdoc/check-tag-names': ['warn', {
//             definedTags: ['typicalname'],
//         }],
//         'jsdoc/multiline-blocks': ['error', {
//             noZeroLineText: false,
//         }],
//         'jsdoc/no-undefined-types': ['error', {
//             'definedTypes': ['NodeListOf'],
//         }],
//         'jsdoc/tag-lines': 'off',

//         '@stylistic/comma-dangle': ['error', {
//             'arrays': 'only-multiline',
//             'objects': 'always',
//             'imports': 'never',
//             'exports': 'always-multiline',
//             'functions': 'never',
//             'importAttributes': 'never',
//             'dynamicImports': 'never',
//         }],
//         '@stylistic/eol-last': ['error', 'always'],
//         '@stylistic/indent': ['error', 4, {
//             'SwitchCase': 1,
//         }],
//         '@stylistic/linebreak-style': ['error', 'unix'],
//         '@stylistic/lines-between-class-members': ['error', 'always'],
//         '@stylistic/newline-per-chained-call': ['error', {
//             'ignoreChainWithDepth': 2,
//         }],
//         '@stylistic/no-confusing-arrow': 'error',
//         '@stylistic/no-extra-semi': 'error',
//         '@stylistic/no-mixed-spaces-and-tabs': 'error',
//         '@stylistic/no-trailing-spaces': 'error',
//         '@stylistic/semi': ['error', 'never'],
//         '@stylistic/quotes': ['error', 'single', {
//             'avoidEscape': true,
//             'allowTemplateLiterals': 'always',
//         }],

//         'new-cap': 'error',
//         'prefer-const': 'error',
//         'no-else-return': 'error',
//         'no-empty': ['error', {
//             allowEmptyCatch: true,
//         }],
//         'no-unused-vars': 'off',
//         'no-useless-escape': 'off',
//         'no-var': 'warn',
//     },
//     settings: {
//         jsdoc: {
//             mode: 'jsdoc',
//         },
//     },
//     ignores: ['tsconfig.json'],
// }

/** @type {import('eslint').Linter.Config[]} */
const conf = [
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    pluginPromise.configs['flat/recommended'],
    pluginImport.flatConfigs.recommended,

    // {
    //     ignores: ['tsconfig.json'],
    // },

    // General
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
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
                'definedTypes': ['NodeListOf', 'ProxyHandler'],
            }],
            'jsdoc/tag-lines': 'off',

            '@stylistic/comma-dangle': ['error', {
                'arrays': 'only-multiline',
                'objects': 'always',
                'imports': 'never',
                'exports': 'always-multiline',
                'functions': 'never',
                'importAttributes': 'never',
                'dynamicImports': 'never',
            }],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/indent': ['error', 4, {
                'SwitchCase': 1,
            }],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/lines-between-class-members': 'off',
            '@stylistic/newline-per-chained-call': ['error', {
                'ignoreChainWithDepth': 2,
            }],
            '@stylistic/no-confusing-arrow': 'error',
            '@stylistic/no-extra-semi': 'error',
            '@stylistic/no-mixed-spaces-and-tabs': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/quotes': ['error', 'single', {
                'avoidEscape': true,
                'allowTemplateLiterals': 'always',
            }],

            'new-cap': 'error',
            'no-else-return': 'error',
            'no-empty': ['error', {
                allowEmptyCatch: true,
            }],
            'no-unused-vars': 'off',
            'no-useless-escape': 'off',
            'no-var': 'warn',
            'prefer-const': 'error',
        },
        settings: {
            jsdoc: {
                mode: 'jsdoc',
            },
        },
        // languageOptions: {
        //     sourceType: 'commonjs',
        //     ecmaVersion: 'latest',
        // },
    },

    // Browser (ES2019) script, no-build
    {
        files: browserCJS,
        // ...general,
        ...js.configs.browser,
        languageOptions: {
            sourceType: 'script',
            ecmaVersion: 2019,
            globals: {
                ...globals.browser,
                window: 'writable', // allow setting window global properties
                jQuery: 'readonly',
                RED: 'readonly',
                uibuilder: 'writable',
                console: 'readonly',
            },
        },
        // rules: {
        //     'no-empty': ['error', { 'allowEmptyCatch': true }],
        // },
    },

    // Browser (Latest) ESM, ESBUILD
    {
        files: browserMJS,
        // ...general,
        ...js.configs.browser,
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
                window: 'writable', // allow setting window global properties
                globalThis: 'writable',
                jQuery: 'readonly',
                RED: 'readonly',
                uibuilder: 'writable',
                console: 'readonly',
            },
        },
        // rules: {
        //     'no-empty': 'off',
        // },
    },

    // Node.js (v18) CommonJS, no-build
    {
        files: nodeCJS,
        ...node.configs['flat/recommended-script'],
        languageOptions: {
            sourceType: 'commonjs',
            // Will be overridden by the n plugin which detects the correct node.js version from package.json
            ecmaVersion: 'latest',
            // Node.js globals are provided by the n plugin
            // globals: globals.browser,
        },
        rules: {
            'n/no-missing-import': 'error',
            'n/no-process-exit': 'warn',
        },
        // Better to pick up from package.json unless needing to override
        // settings: {
        //     node: {
        //         version: '18.0.0',
        //     }
        // },
    },

    // Node.js (LTS) ESM, ESBUILD
    {
        files: nodeMJS,
        // ...general,
        ...node.configs['flat/recommended-module'],
        languageOptions: {
            sourceType: 'module',
            // Will be overridden by the n plugin which detects the correct node.js version from package.json
            ecmaVersion: 'latest',
            // Node.js globals are provided by the n plugin
            // globals: globals.browser,
        },
        rules: {
            'n/no-unsupported-features/es-syntax': 'off', // Allow all modern ESM features
            'n/no-missing-import': 'error',
            'n/no-process-exit': 'warn',
        },
        // Better to pick up from package.json unless needing to override
        // Override for node.js current LTS (assuming the use of ESBUILD)
        settings: {
            node: {
                version: 'lts', // Use latest LTS version
            },
        },
    },
]

export default conf
