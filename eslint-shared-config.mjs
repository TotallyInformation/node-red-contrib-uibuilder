/** Shared ESLINT rules (Import into ESLINT config files) */

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
    'jsdoc/reject-any-type': 'off',
    'jsdoc/reject-function-type': 'off',
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
    'no-empty': ['error', { allowEmptyCatch: true, }],
    'no-unused-vars': 'off',
    'no-useless-escape': 'off',
    'no-var': 'warn',
    'prefer-const': 'error',
}

export {
    jsdocRules,
    stylisticRules,
    generalRules,
}
