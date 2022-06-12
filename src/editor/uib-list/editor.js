/* eslint-disable strict */

// Isolate this code
(function () {
    'use strict'

    console.log('>>>> uib-list >>>>')

    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName  = 'uib-list'
    /** Node's label @constant {string} paletteCategory */
    const nodeLabel  = moduleName
    /** Node's palette category @constant {string} paletteCategory */
    const paletteCategory  = 'uibuilder'
    /** Node's background color @constant {string} paletteColor */
    const paletteColor  = '#F6E0F8' // '#E6E0F8'

    /** Prep for edit
     * @param {*} node A node instance as seen from the Node-RED Editor
     */
    function onEditPrepare(node) {

    } // ----- end of onEditPrepare() ----- //

    // @ts-ignore
    RED.nodes.registerType(moduleName, {
        category: paletteCategory,
        color: paletteColor,
        defaults: {
            name: { value: '' },
        },
        // align:'right',
        inputs: 1,
        inputLabels: '',
        outputs: 1,
        outputLabels: [''],
        icon: 'parser-json.svg',
        paletteLabel: nodeLabel,
        label: function () {
            return this.name || moduleName
        },

        /** Prepares the Editor panel */
        oneditprepare: function() { onEditPrepare(this) },

        /** Runs before save (Actually when Done button pressed) - oneditsave */
        /** Runs before cancel - oneditcancel */
        /** Handle window resizing for the editor - oneditresize */
        /** Show notification warning before allowing delete - oneditdelete */

    }) // ---- End of registerType() ---- //

}())
