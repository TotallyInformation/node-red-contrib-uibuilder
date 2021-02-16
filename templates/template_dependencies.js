/** Describes the dependencies for each library-specific template
 * Note that the first entry will be the default.
 * THE OBJECT NAME MUST BE THE SAME AS THE FOLDER NAME
 */

module.exports = {
    vue: {
        'name': 'VueJS & bootstrap-vue',
        'folder': 'vue',
        'dependencies': [ 'vue', 'bootstrap-vue', 'donkey' ],
        'description': 'The default template since uibuilder v2. Uses VueJS and bootstrap-vue.'
    },
    blank: {
        'name': 'Blank template, no framework',
        'folder': 'blank',
        'dependencies': [ ],
        'description': 'You can use this if you do not want to use any framework at all.'
    },
}