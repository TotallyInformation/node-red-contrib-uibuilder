/** Describes the dependencies for each library-specific template
 * THE OBJECT NAME MUST BE THE SAME AS THE FOLDER NAME
 * Feel free to change this but keep a copy of your changes since
 * they will be overwritten when uibuilder is updated.
 * If changed, restart Node-RED and reload the Editor.
 *
 * Schema expanded @since v7.3.0 (2025), allowing std templates to be external
 * Standard external templates now allowed. Set the location property to the degit compatible location.
 * Do not include the location property for anthing other than standard external templates.
 */
'use strict'

module.exports = {
    // Do not remove this one, it is the default and expected to be there
    'blank': {
        name: 'Minimal template (default)',
        folder: 'blank',
        dependencies: [],
        description:
        `Default minimal template. Uses the IIFE client & no front-end framework library.
         The <code>index.js</code> file is commented out because you may not need it at all.
         Contains a div with the id "<code>more</code>" which is set to automatically show
         <code>msg.payload</code> content sent with <code>msg.topic</code> set to "<code>more</code>".`,
    },
    'ext-extended-iife': {
        name: 'Extended example using the IIFE client (external)',
        folder: 'ext-extended-iife',
        location: 'totallyinformation/uib-extended-template', // GitHub
        dependencies: [],
        description:
        `The IIFE client library can be slightly easier to use than delving into ES Modules.
         This is similar to the default template but includes some extended features to play with.
         Contains a div with the id "<code>more</code>" which is set to automatically show
         <code>msg.payload</code> content sent with <code>msg.topic</code> set to "<code>more</code>".
         See <u><a href="https://github.com/TotallyInformation/uib-extended-template" target="_blank">README.md</a></u> for details.`,
    },
    'ext-simple-esm': {
        name: 'Simple ES Module Template (external)',
        folder: 'ext-simple-esm',
        location: 'totallyinformation/uib-template-test', // GitHub
        dependencies: [],
        description:
        `Simple basic ES Module template loaded from GitHub.
         Contains a div with the id "<code>more</code>" which is set to automatically show
         <code>msg.payload</code> content sent with <code>msg.topic</code> set to "<code>more</code>".
         See <u><a href="https://github.com/TotallyInformation/uib-template-test" target="_blank">README.md</a></u> for details.`,
    },
    'ext-svelte': {
        name: 'Svelte Template (external)',
        folder: 'ext-svelte',
        location: 'TotallyInformation/uib-template-svelte-simple', // GitHub
        dependencies: [],
        description:
        `Simple Svelte template loaded from GitHub.
         Requires <code>npm install</code> to be run to install the development dependencies.
         See <u><a href="https://github.com/TotallyInformation/uib-template-svelte-simple" target="_blank">README.md</a></u> for details.<br>
         Don't forget to change the default Serve folder on the Advanced tab to "dist" for this template to work correctly.`,
    },
    'ext-iife-vue3-nobuild': {
        name: 'Vue3 no build step, IIFE client (External)',
        folder: 'ext-iife-vue3-nobuild',
        location: 'TotallyInformation/uib-template-iife-vue3-nobuild', // GitHub
        dependencies: ['vue'],
        description:
        `Very simple Vue v3 template that does not require a build step.
         Uses the IIFE uib client library. Requires Vue v3+ installation in Libraries.
         See <u><a href="https://github.com/TotallyInformation/uib-template-iife-vue3-nobuild" target="_blank">README.md</a></u> for details.`,
    },
    // DO NOT REMOVE THIS ONE OR YOU WILL NOT BE ABLE TO LOAD EXTERNAL TEMPLATES
    'external': {
        name: 'Load an external template using Degit',
        folder: 'external',
        // location: '', // Don't include location here, it would confuse the logic
        dependencies: [],
        description:
        `Use this to load a template from GitHub or elsewhere.
         See <u><a href="https://github.com/Rich-Harris/degit" target="_blank">degit</a></u> for details.
         Example name: <b>totallyinformation/uib-template-test</b>`,
    },
}
