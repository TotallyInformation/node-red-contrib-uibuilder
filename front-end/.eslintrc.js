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
module.exports = {
    root: true,
    env: {
        node: false,
        browser: true,
        es6: true,
        //es5: true,
        commonjs: true,
    },
    parserOptions: {
        //parser: "babel-eslint",
        ecmaVersion: 2015,
        // specifying a module sourcetype prevent eslint from marking import statements as errors
        //sourceType: 'module',
    },
    extends: [
        // use the recommended rule sets for javascript
        // 'eslint:recommended',
        //'plugin:prettier/recommended',
        //'plugin:vue/essential'
    ],
    'plugins': [
        'vue'
    ],
    rules: {
        // we should always disable console logs and debugging in production
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-consoledebugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'indent': [
            'warn',
            4,
            {'SwitchCase': 1}
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'warn',
            'single'
        ],
        'semi': [
            'warn',
            'never'
        ],
        'comma-dangle':'off',
        'no-unused-vars': 'warn',
    },
}
