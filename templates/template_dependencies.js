/** Describes the dependencies for each library-specific template
 * Note that the first entry will be the default.
 * THE OBJECT NAME MUST BE THE SAME AS THE FOLDER NAME
 */

module.exports = {
    vue: {
        'name': 'VueJS & bootstrap-vue',
        'folder': 'vue',
        'dependencies': [ 'vue', 'bootstrap-vue' ],
        'description': 'VueJS and bootstrap-vue example. Was the default until v4.'
    },
    'vue-simple': {
        'name': 'Simple VueJS',
        'folder': 'vue-simple',
        'dependencies': [ 'vue', 'bootstrap-vue' ],
        'description': 'Simplest VueJS and bootstrap-vue template.'
    },
    // DO NOT EVER REMOVE EITHER OF THESE
    blank: {
        'name': 'Blank template, no framework',
        'folder': 'blank',
        'dependencies': [ ],
        'description': 'Default blank template.'
    },
    // See https://github.com/Rich-Harris/degit
    external: {
        'name': 'Load an external template using Degit',
        'folder': 'external',
        'dependencies': [ ],
        'description': 'Use this to load a template from GitHub or elsewhere. See https://github.com/Rich-Harris/degit for details. Example name: totallyinformation/uib-template-test'
    },
}