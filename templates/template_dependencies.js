/** Describes the dependencies for each library-specific template
 * THE OBJECT NAME MUST BE THE SAME AS THE FOLDER NAME
 * Feel free to change this but keep a copy of your changes since
 * they will be overwritten when uibuilder is updated.
 * If changed, restart Node-RED and reload the Editor.
 */
'use strict'

module.exports = {
    // Do not remove this one, it is the default and expected to be there
    blank: {
        'name': 'Blank template, no framework',
        'folder': 'blank',
        'dependencies': [],
        'description': 'Default blank template. As of v6, uses the iife client.'
    },
    'iife-blank-client': {
        'name': 'No framework, IIFE client',
        'folder': 'iife-blank-client',
        'dependencies': [],
        'description': 'Minimal template using the IIFE client library.'
    },
    'esm-blank-client': {
        'name': 'No framework, ESM client',
        'folder': 'esm-blank-client',
        'dependencies': [],
        'description': 'Minimal template using the ESM client library.'
    },
    'iife-vue3-nobuild': {
        'name': 'Vue3 no build step, IIFE client',
        'folder': 'iife-vue3-nobuild',
        'dependencies': ['vue'],
        'description': 'Very simple Vue v3+ template that does not require a build step. Uses the IIFE uib client library.'
    },
    'esm-vue3-nobuild': {
        'name': 'Vue3 no build step, ESM client, Vue Module',
        'folder': 'esm-vue3-nobuild',
        'dependencies': ['vue'],
        'description': 'A Vue v3+ template that includes a Vue module but does not require a build step. Uses the ESM uib client library.'
    },
    // 'vue3-sfc-load': {
    //     'name': 'Vue3 no build step, IIFE client. SFC Loader to directly load/compile/run .vue files.',
    //     'folder': 'vue3-sfc-load',
    //     'dependencies': [ 'vue', 'vue3-sfc-loader' ],
    //     'description': 'Vue v3 template demonstrating the direct loading of .vue files without a build step using vue3-sfc-loader.'
    // },
    'vue2-bootstrap': {
        'name': 'VueJS v2 & bootstrap-vue',
        'folder': 'vue2-bootstrap',
        'dependencies': ['vue', 'bootstrap-vue'],
        'description': 'VueJS v2 and bootstrap-vue template. No build step. Uses the IIFE uib client library.'
    },
    'vue2-simple': {
        'name': 'Simple VueJS v2',
        'folder': 'vue2-simple',
        'dependencies': ['vue', 'bootstrap-vue'],
        'description': 'Simplest VueJS v2 and bootstrap-vue template. No build step. Uses the IIFE uib client library.'
    },
    'svelte-basic': {
        'name': 'Svelte Basic',
        'folder': 'svelte-basic',
        'dependencies': [],
        'description': 'Simple Svelte template. Requires Svelte installation, see README.md'
    },
    // DO NOT REMOVE THIS ONE OR YOU WILL NOT BE ABLE TO LOAD EXTERNAL TEMPLATES
    external: {
        'name': 'Load an external template using Degit',
        'folder': 'external',
        'dependencies': [],
        'description': 'Use this to load a template from GitHub or elsewhere. See https://github.com/Rich-Harris/degit for details. Example name: totallyinformation/uib-template-test'
    },
}
