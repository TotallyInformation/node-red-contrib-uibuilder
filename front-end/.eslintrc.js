/* eslint-env node commonjs */
/** JavaScript Versions
 *  5 is minimum -> Last IE11
 *  6 = 2015 -> Node >8.10, iOS12+
 *  7 = 2016 -> FF78+,
 *  8 = 2017 -> Node 10.9+
 *  9 = 2018 -> Node 12.11+
 * 10 = 2019
 * 11 = 2020
 * 12 = 2021
 */
'use strict'
module.exports = {
    env: {
        browser: true,
        jquery: false,
        node: false,
        'shared-node-browser': false
    },
    parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'script'
    },
    globals: {
        RED: true,
    },
    overrides: [
        {
            files: ['*.module.js', '*.mod.js', '*.mjs'],
            parserOptions: { ecmaVersion: 2019, sourceType: 'module' },
            extends: [
                'standard',
                'plugin:es/restrict-to-es2015',
                'plugin:jsdoc/recommended',
                'plugin:promise/recommended',
                'plugin:sonarjs/recommended',
            ]
        }
    ],
    plugins: [
        'html',     // Check scripts in HTML. https://www.npmjs.com/package/eslint-plugin-html
        'es',       // Help avoid js that is too new. https://eslint-plugin-es.mysticatea.dev/
        'jsdoc',    // JSDoc. https://www.npmjs.com/package/eslint-plugin-jsdoc
        'promise',  // Better promises. https://www.npmjs.com/package/eslint-plugin-promise
        'sonarjs',  // Detect bugs and suspicious patterns. https://github.com/SonarSource/eslint-plugin-sonarjs
    ],
    extends: [
        'standard',
        'plugin:es/restrict-to-es2015',
        'plugin:jsdoc/recommended',
        'plugin:promise/recommended',
        'plugin:sonarjs/recommended',
    ],
    rules: {
        // 'sonarjs/no-duplicate-string': 0,
        // 'sonarjs/cognitive-complexity': 0,

        // Tidy up some jsdoc oddities
        'jsdoc/multiline-blocks': 0,
        'jsdoc/newline-after-description': 0,
        'jsdoc/no-multi-asterisks': 0,
        'jsdoc/tag-lines': 0,
        'jsdoc/valid-types': 0, // Rubbish, fails on common type configs
        'jsdoc/no-undefined-types': 0, // ['error'|'warn', {'definedTypes':['Promise']}],

        // Try to keep code complexity in functions to a minimum
        'sonarjs/cognitive-complexity': ['error', 60],  // default is 15! Need to try and improve this :-)

        // Make Standard less annoying
        'brace-style': 'off',     // You should only use one-true-brace style but sometimes we want to compress things a bit.
        'comma-dangle': 'off',    // Lack of dangles wastes soo much time correcting lists
        'dot-notation': 'off',    // Turn off to allow for tslint's brain-dead treatment of expando objects in JS
        'indent': ['error', 4, { 'SwitchCase': 1 }],   // Standard wants 2, I like 4
        'space-before-function-paren': 'off', // No, don't need space between fn and arg!
        'no-multi-spaces': 'off', // Readability is more important than size (reduce size using uglify)
        'object-shorthand': ['error', 'consistent'],
        'padded-blocks': 'off',   // Sometimes you just need some space! See above.
        'space-in-parens': 'off', // Sometimes you just need some space!
        'spaced-comment': ['error', 'always', {
            'markers': ['html', '#region', '#endregion']
        }],
        'quote-props': 'off',     // Sometimes it is necessary and then much nicer to be able to quote things that don't need it.
    }
}
