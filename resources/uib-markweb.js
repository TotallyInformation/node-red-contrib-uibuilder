/** Node-RED WidgetTypedInputType
 * @typedef { Array<"bin"|"bool"|"date"|"env"|"flow"|"global"|"json"|"jsonata"|"msg"|"num"|"re"|"str"> } WidgetTypedInputType
 */

// Now loading as a module so no need to further Isolate this code

// RED._debug({topic: 'RED.settings', payload:RED.settings})

const uibuilder = window['uibuilder']
const log = uibuilder.log

/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName = 'uib-markweb'

/** Validate presence of required/optional marked libraries
 * @param {*} v Value to validate
 * @returns {boolean} True if valid, false if not
 */
function validateLibs(v) {
    // log.debug(`${moduleName}: validateLibs called`, v)
    // if ( RED.settings['uibMarkwebCheckLibs'].marked.available === true ) {
    //     return true
    // }
    // return false
    return true
}

/** Prep for edit
 * @param {*} node A node instance as seen from the Node-RED Editor
 */
function onEditPrepare(node) {
    console.log(`${moduleName}: onEditPrepare called`, node, RED.settings.uibMarkwebCheckLibs)
    // If RED.settings['uibMarkwebCheckLibs'].marked.available is false, mark the node as invalid
    if ( RED.settings.uibMarkwebCheckLibs.marked.available === true ) {
        node.valid = false
    }
    uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
} // ----- end of onEditPrepare() ----- //

RED.nodes.registerType(moduleName, {
    defaults: {
        source: { value: '', required: true, },
        url: { value: 'markweb', required: true, },
        name: { value: '', },
        // Dummy property to allow checking of required libraries
        markedAvailable: { value: false, validate: validateLibs, },
    },
    align: 'left',
    inputs: 0,
    // inputLabels: '',
    outputs: 0,
    // outputLabels: [''],
    icon: 'pencilBoxMultipleWhite.svg',
    label: function () {
        return this.name || moduleName
    },
    paletteLabel: moduleName,
    category: uibuilder.paletteCategory,
    color: 'var(--uib-node-colour)', // '#E6E0F8'

    /** Prepares the Editor panel */
    oneditprepare: function () { onEditPrepare(this) },

    /** Runs before save (Actually when Done button pressed) - oneditsave */
    // oneditsave: function () { onEditSave(this) },

    /** Runs before cancel - oneditcancel */
    /** Handle window resizing for the editor - oneditresize */
    /** Show notification warning before allowing delete - oneditdelete */
}) // ---- End of registerType() ---- //
