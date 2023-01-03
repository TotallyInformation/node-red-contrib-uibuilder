/** Describes the dependencies for each library-specific template
 * THE OBJECT NAME MUST BE THE SAME AS THE FOLDER NAME
 * Feel free to change this but keep a copy of your changes since
 * they will be overwritten when uibuilder is updated.
 * If changed, restart Node-RED and reload the Editor.
 */
'use strict'

module.exports = {
    'iife-blank-client': {
        'name': 'No framework, modern IIFE client',
        'folder': 'iife-blank-client',
        'dependencies': [ ],
        'description': 'Minimal template using the modern IIFE client library.'
    },
    'esm-blank-client': {
        'name': 'No framework, modern ESM client',
        'folder': 'esm-blank-client',
        'dependencies': [ ],
        'description': 'Minimal template using the modern ESM client library.'
    },
    'iife-vue3-nobuild': {
        'name': 'Vue3 no build step, modern IIFE client',
        'folder': 'iife-vue3-nobuild',
        'dependencies': [ 'vue' ],
        'description': 'Very simple Vue v3+ template that does not require a build step. Uses the modern IIFE uib client library.'
    },
    'vue2-bootstrap': {
        'name': 'VueJS v2 & bootstrap-vue',
        'folder': 'vue2-bootstrap',
        'dependencies': [ 'vue', 'bootstrap-vue' ],
        'description': 'VueJS v2 and bootstrap-vue template. No build step. Uses the modern IIFE uib client library.'
    },
    'vue2-simple': {
        'name': 'Simple VueJS v2',
        'folder': 'vue2-simple',
        'dependencies': [ 'vue', 'bootstrap-vue' ],
        'description': 'Simplest VueJS v2 and bootstrap-vue template. No build step. Uses the modern IIFE uib client library.'
    },
    'svelte-basic': {
        'name': 'Svelte Basic',
        'folder': 'svelte-basic',
        'dependencies': [ ],
        'description': 'Simple Svelte template. Requires Svelte installation, see README.md'
    },
    'old-blank-client': {
        'name': 'No framework, old client',
        'folder': 'old-blank-client',
        'dependencies': [ ],
        'description': 'Minimal template using the old uibuilderfe client.'
    },
    // DO NOT EVER REMOVE EITHER OF THESE
    blank: {
        'name': 'Blank template, no framework',
        'folder': 'blank',
        'dependencies': [ ],
        'description': 'Default blank template. As of v6, uses the iife client.'
    },
    external: {
        'name': 'Load an external template using Degit',
        'folder': 'external',
        'dependencies': [ ],
        'description': 'Use this to load a template from GitHub or elsewhere. See https://github.com/Rich-Harris/degit for details. Example name: totallyinformation/uib-template-test'
    },
}
