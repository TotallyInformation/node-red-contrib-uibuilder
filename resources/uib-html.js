// NOTE: window.uibuilder is added - see `resources` folder
;(function () {
    'use strict'

    // #region --------- module variables for the panel --------- //

    // NOTE: window.uibuilder is added by editor-common.js - see `resources` folder
    const uibuilder = window['uibuilder']
    // const mylog = window['uibuilder'].log

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-html'

    // #endregion ------------------------------------------------- //

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {
        window['tiDoTooltips']('#ti-edit-panel') // Do this at the end
    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        defaults: {
            name: { value: '', },
            topic: { value: '', },
            useTemplate: { value: false, },
        },
        align: 'left',
        inputs: 1,
        inputLabels: 'uibuilder dynamic UI configuration source data',
        outputs: 1,
        outputLabels: ['HTML payload'],
        icon: 'code.svg',
        label: function () {
            return this.name || moduleName
        },
        paletteLabel: 'to HTML',
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8' '"hsl(248 100% 91%)"'

        /** Prepares the Editor panel */
        oneditprepare: function () { onEditPrepare(this) },

    })
}())
