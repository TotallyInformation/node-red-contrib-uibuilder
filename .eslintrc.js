/** JavaScript Versions
 *  5 is minimum -> Last IE11
 *  6 = 2015 -> Node >8.10, iOS12+
 *  7 = 2016 -> FF78+,
 *  8 = 2017 -> Node 10.9+
 *  9 = 2018 -> Node 12.11+
 * 10 = 2019 -> Node 12.20 LTS
 * 11 = 2020 -> Node 14 LTS
 * 12 = 2021 -> Node 16
 */
/** Node.js supports (https://node.green/):
 * v07 - async/await
 * v09 - tagged template literals with invalid escape sequences,  RegExp lookbehind assertions
 * v10 - optional catch binding (no need for err param on catch), BigInt, import.meta,
 *         RegExp Unicode property escape sequences \p{...},
 *         trimStart/trimEnd, async iteration, Promise.prototype.finally,
 *         RegExp named capture groups
 * v11 - Array.prototype.{flat,flatMap}, Symbol.prototype.description
 * v12 - Promise.allSettled, globalThis, numeric separators, Object.fromEntries
 * v13 - import (modules), dynamic import(), export
 * v14 - optional chaining, Nullish Coalescing operators, String.prototype.matchAll,
 *         Intl.DisplayNames, Intl.DateTimeFormat, (Experimental: Async Local Storage, Top-Level Await, Diagnostic report),
 *         WeakReferences, private class methods
 * v15 - logical assignment operators, String.prototype.replaceAll, Promise.any, AggregateError, AbortController,
 *        (Experimental Promisified setTimeout/setImmediate)
 * v16 - Promisified setTimeout/setImmediate, RegExp match indices. npm v7 (peer deps now installed again).
 *       fs.rmdir no longer supports recursive (use new fs.rm)
 * v17 - OpenSSL 3 (incl QUIC), Readline Promise API
 * v18 - (Experimental: Fetch API, Web Streams API, Test Runner), HTTP Timeouts, findLast/findLastIndex array methods,
 *       Improvements to the Intl.Locale API [calendars, collations, hourCycles, numberingSystems, timeZones, textInfo, weekInfo],
 *       Intl.supportedValuesOf function
 * v19 - (Experimental: node --watch), HTTP(S)/1.1 KeepAlive by default, Stable WebCrypto API, Intl.NumberFormat
 */
module.exports = {
    env: {
        browser: false,
        commonjs: true,
        jquery: false,
        node: true,
        // es2019: true,
        'shared-node-browser': false
    },
    parserOptions: {
        // Only ESLint 6.2.0 and later support ES2020. Node.js v12+ supports some things only ratified in 2020
        'ecmaVersion': 2022,
        sourceType: 'script'
    },
    root: true,
    globals: {
        Set: true, // Not sure why eslint doesn't recognise this as it is part of node.js since v0.12
        RED: true,
    },
    overrides: [
        {
            files: ['*.module.js', '*.mod.js', '*.mjs'],
            parserOptions: { sourceType: 'module' },
        }
    ],
    plugins: [
        'html',     // Check scripts in HTML. https://www.npmjs.com/package/eslint-plugin-html
        'es',       // Help avoid js that is too new. https://eslint-plugin-es.mysticatea.dev/
        'jsdoc',    // JSDoc. https://www.npmjs.com/package/eslint-plugin-jsdoc
        'promise',  // Better promises. https://www.npmjs.com/package/eslint-plugin-promise
        'sonarjs',  // Detect bugs and suspicious patterns. https://github.com/SonarSource/eslint-plugin-sonarjs
        // 'prettier', // https://www.npmjs.com/package/eslint-plugin-prettier
        // 'eslint-plugin-n', // loads itself from extends, no need to manually load
    ],
    extends: [
        'standard',
        // 'eslint:recommended',
        'plugin:es/no-new-in-esnext',
        'plugin:jsdoc/recommended',
        'plugin:promise/recommended',
        'plugin:sonarjs/recommended',
        // 'plugin:prettier/recommended',
        // The n plugin reads the min. node.js version from package.json and error's any ES features not available in that version.
        'plugin:n/recommended',
    ],
    // settings: {
    //     jsdoc: {
    //         mode: 'permissive'
    //     }
    // },
    rules: {
        'n/no-process-exit': 'error',

        // remove once min engines moves to node.js v14+
        // 'es/no-optional-chaining': 'error',
        // 'es/no-dynamic-import': 'error',
        // 'es/no-nullish-coalescing-operators': 'error',

        // remove once min engines moves to node.js v15+
        'es/no-logical-assignment-operators': 'error',
        'es/no-promise-any': 'error',
        'es/no-numeric-separators': 'error',

        // Tidy up some jsdoc oddities
        'jsdoc/multiline-blocks': 0,
        'jsdoc/newline-after-description': 0,
        'jsdoc/no-multi-asterisks': 0,
        'jsdoc/tag-lines': 0,
        'jsdoc/valid-types': 0, // Rubbish, fails on common type configs
        'jsdoc/no-undefined-types': 0, // ['error'|'warn', {'definedTypes':['Promise']}],

        // Try to keep code complexity in functions to a minimum
        'sonarjs/cognitive-complexity': ['error', 60],  // default is 15! Need to try and improve this :-)
        'sonarjs/no-duplicate-string': ['warn', 5],  // default is 3

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

/*
        quotes: [
            'warn',
            'single'
        ],

        'accessor-pairs': 'error',
        'array-bracket-newline': 'error',
        'array-bracket-spacing': 0,
        'array-callback-return': 'off',
        'array-element-newline': 'off',
        'arrow-body-style': 'error',
        'arrow-parens': 'off',
        'arrow-spacing': [
            'error',
            {
                after: true,
                before: true
            }
        ],
        'block-scoped-var': 'error',
        'block-spacing': [
            'error',
            'always'
        ],
        'brace-style': [
            'error',
            '1tbs',
            {
                allowSingleLine: true
            }
        ],
        'callback-return': 'error',
        camelcase: 'off',
        'capitalized-comments': 'off',
        'class-methods-use-this': 'error',
        'comma-dangle': 'off',
        'comma-spacing': 'off',
        'comma-style': [
            'error',
            'last'
        ],
        complexity: 'off',
        'computed-property-spacing': [
            'error',
            'never'
        ],
        'consistent-return': 'off',
        'consistent-this': 'off',
        curly: 'off',
        'default-case': 'off',
        'default-case-last': 'error',
        'default-param-last': 'error',
        'dot-location': [
            'error',
            'property'
        ],
        'dot-notation': [
            'error',
            {
                allowKeywords: true
            }
        ],
        'eol-last': 'error',
        eqeqeq: 'error',
        'func-call-spacing': 'error',
        'func-name-matching': 'error',
        'func-names': 'off',
        'func-style': 'off',
        'function-call-argument-newline': 'off',
        'function-paren-newline': 'off',
        'generator-star-spacing': 'error',
        'global-require': 'off',
        'grouped-accessor-pairs': 'error',
        'guard-for-in': 'error',
        'handle-callback-err': 'error',
        'id-blacklist': 'error',
        'id-denylist': 'error',
        'id-length': 'off',
        'id-match': 'error',
        'implicit-arrow-linebreak': [
            'error',
            'beside'
        ],
        indent: [
            'warn',
            4,
            { 'SwitchCase': 1 }
        ],
        'indent-legacy': 'off',
        'init-declarations': 'off',
        'jsx-quotes': 'error',
        'key-spacing': 'off',
        'keyword-spacing': 'off',
        'line-comment-position': 'off',
        'linebreak-style': [
            'error',
            'unix'
        ],
        'lines-around-comment': 'off',
        'lines-around-directive': 'off',
        'lines-between-class-members': 'error',
        'max-classes-per-file': 'error',
        'max-depth': 'error',
        'max-len': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-nested-callbacks': 'error',
        'max-params': ['error', 6],
        'max-statements': 'off',
        'max-statements-per-line': 'off',
        'multiline-comment-style': 'off',
        'new-cap': 'error',
        'new-parens': 'error',
        'newline-after-var': 'off',
        'newline-before-return': 'off',
        'newline-per-chained-call': 'error',
        'no-alert': 'error',
        'no-array-constructor': 'error',
        'no-await-in-loop': 'error',
        'no-bitwise': 'off',
        'no-buffer-constructor': 'error',
        'no-caller': 'error',
        'no-catch-shadow': 'error',
        'no-confusing-arrow': 'error',
        'no-console': 'off',
        'no-constructor-return': 'error',
        'no-continue': 'error',
        'no-div-regex': 'error',
        'no-duplicate-imports': 'error',
        'no-else-return': [
            'error',
            {
                allowElseIf: true
            }
        ],
        'no-empty-function': 'off',
        'no-eq-null': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-extra-parens': 'off',
        'no-floating-decimal': 'error',
        'no-implicit-coercion': 'error',
        'no-implicit-globals': 'error',
        'no-implied-eval': 'error',
        'no-inline-comments': 'off',
        'no-inner-declarations': [
            'error',
            'functions'
        ],
        'no-invalid-this': 'off',
        'no-iterator': 'error',
        'no-label-var': 'error',
        'no-labels': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-loss-of-precision': 'error',
        'no-magic-numbers': 'off',
        'no-mixed-operators': 'error',
        'no-mixed-requires': 'error',
        'no-multi-assign': 'off',
        'no-multi-spaces': 'off',
        'no-multi-str': 'error',
        'no-multiple-empty-lines': 'error',
        'no-native-reassign': 'error',
        'no-negated-condition': 'off',
        'no-negated-in-lhs': 'error',
        'no-nested-ternary': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-object': 'error',
        'no-new-require': 'error',
        'no-new-wrappers': 'error',
        'no-nonoctal-decimal-escape': 'error',
        'no-octal-escape': 'error',
        'no-param-reassign': 'off',
        'no-path-concat': 'error',
        'no-plusplus': 'off',
        'no-process-env': 'off',
        'no-process-exit': 'error',
        'no-promise-executor-return': 'error',
        'no-proto': 'error',
        'no-restricted-exports': 'error',
        'no-restricted-globals': 'error',
        'no-restricted-imports': 'error',
        'no-restricted-modules': 'error',
        'no-restricted-properties': 'error',
        'no-restricted-syntax': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-shadow': 'off',
        'no-spaced-func': 'error',
        'no-sync': 'off',
        'no-tabs': 'error',
        'no-template-curly-in-string': 'error',
        'no-ternary': 'off',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'off',
        'no-undef-init': 'error',
        'no-undefined': 'off',
        'no-underscore-dangle': 'off',
        'no-unmodified-loop-condition': 'error',
        'no-unneeded-ternary': 'off',
        'no-unreachable-loop': 'error',
        'no-unsafe-optional-chaining': 'error',
        'no-use-before-define': 'error',
        'no-useless-backreference': 'error',
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'off',
        'no-var': 'off',
        'no-void': 'error',
        'no-warning-comments': 'off',
        'no-whitespace-before-property': 'error',
        'nonblock-statement-body-position': [
            'error',
            'any'
        ],
        'object-curly-newline': 'error',
        'object-curly-spacing': 'off',
        'object-shorthand': 'off',
        'one-var': 'off',
        'one-var-declaration-per-line': 'off',
        'operator-assignment': [
            'error',
            'always'
        ],
        'operator-linebreak': 'error',
        'padded-blocks': 'off',
        'padding-line-between-statements': 'error',
        'prefer-arrow-callback': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'prefer-exponentiation-operator': 'error',
        'prefer-named-capture-group': 'error',
        'prefer-numeric-literals': 'error',
        'prefer-object-spread': 'off',
        'prefer-promise-reject-errors': 'error',
        'prefer-reflect': 'off',
        'prefer-regex-literals': 'error',
        'prefer-rest-params': 'off',
        'prefer-spread': 'off',
        'prefer-template': 'off',
        'quote-props': 'off',
        radix: 'error',
        'require-atomic-updates': 'error',
        'require-await': 'error',
        'require-jsdoc': 'error',
        'require-unicode-regexp': 'off',
        'rest-spread-spacing': 'error',
        semi: [
            'warn',
            'never'
        ],
        'semi-spacing': 'error',
        'semi-style': 'error',
        'sort-imports': 'error',
        'sort-keys': 'off',
        'sort-vars': 'off',
        'space-before-blocks': 'off',
        'space-before-function-paren': 'off',
        'space-in-parens': 'off',
        'space-infix-ops': 'off',
        'space-unary-ops': 'off',
        'spaced-comment': 'off',
        strict: 'error',
        'switch-colon-spacing': [
            'error',
            {
                after: true,
                before: false
            }
        ],
        'symbol-description': 'error',
        'template-curly-spacing': 0,
        'template-tag-spacing': 'error',
        'unicode-bom': [
            'error',
            'never'
        ],
        'valid-jsdoc': 'off',
        'vars-on-top': 'off',
        'wrap-iife': 'error',
        'wrap-regex': 'error',
        'yield-star-spacing': 'error',
        yoda: [
            'error',
            'never'
        ]
    },
}
*/
