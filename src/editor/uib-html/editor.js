/* eslint-disable strict, sonarjs/no-duplicate-string */

// Isolate this code
(function () {
    'use strict'

    // const mylog = window['uibuilder'].log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-html'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = window['uibuilder'].paletteCategory
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = 'var(--uib-node-colour)' // '#E6E0F8'

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        window['tiDoTooltips']('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
            topic: { value: '' },
            useTemplate: { value: false },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'uibuilder dynamic UI configuration source data',
        outputs: 1,
        outputLabels: ['HTML payload'],
        icon: 'font-awesome/fa-code',
        paletteLabel: nodeLabel,
        label: function () {
            return this.name || moduleName
        },

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

    }) // ---- End of registerType() ---- //

}())
