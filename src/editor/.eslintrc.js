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
        jquery: true,
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
    rules: {
        'jsdoc/multiline-blocks': 0,
        'jsdoc/newline-after-description': 0,
        'jsdoc/no-multi-asterisks': 0,

        'sonarjs/no-duplicate-string': 0,
        'sonarjs/cognitive-complexity': 0,

        'es/no-object-entries': 0,
    }
}
