/** Node-RED WidgetTypedInputType
 * @typedef { Array<"bin"|"bool"|"date"|"env"|"flow"|"global"|"json"|"jsonata"|"msg"|"num"|"re"|"str"> } WidgetTypedInputType
 */

// Now loading as a module so no need to further Isolate this code

// RED._debug({topic: 'RED.settings', payload:RED.settings})

// @ts-ignore
const uibuilder = window['uibuilder'] // eslint-disable-line no-redeclare
// @ts-ignore
const log = uibuilder.log

/** Module name must match this nodes html file @constant {string} moduleName */
// @ts-ignore
const moduleName = 'markweb'

/** Validate The source folder entry
 * @param {*} v Value to validate
 * @returns {boolean} True if valid, false if not
 */
function validateSource(v) {
    // log(`🌐[${moduleName}] validateSource called`, v)
    return true
}

/** Prep for edit
 * @param {*} node A node instance as seen from the Node-RED Editor
 */
function onEditPrepare(node) {
    log(`🌐[${moduleName}] onEditPrepare called`, node)

    // TODO - Needs to use a fetch to the server to get the actual paths
    // Update inline hints
    // document.getElementById('actual-source-path').textContent = RED.settings.userDir + '/' + node.source || '<no source>'
    // document.getElementById('actual-url').textContent = node.url || '<no url>'
    // document.getElementById('actual-config-path').textContent = node.configFolder || '<no config folder>'

    uibuilder.doTooltips('#ti-edit-panel') // Do this at the end
} // ----- end of onEditPrepare() ----- //

RED.nodes.registerType(moduleName, {
    defaults: {
        source: { value: '', required: true, validate: validateSource, },
        url: { value: 'markweb', required: true, },
        configFolder: { value: '', },
        name: { value: '', },
    },
    align: 'left',
    inputs: 1,
    inputLabels: 'Msg to send to front-end',
    outputs: 2,
    outputLabels: ['Data from front-end', 'Control Msgs from front-end'],
    // icon: 'node-white.svg',
    // icon: 'node-blue-inverted.svg',
    icon: 'semanticWebWhite.svg',
    label: function () {
        const url = this.url ? `<${this.url}>` : '<>'
        const name = this.name ? `${this.name} ` : ''
        return `${name}${url}`
    },

    paletteLabel: moduleName,
    category: uibuilder.paletteCategory,
    color: 'var(--uib-node-colour)', // '#E6E0F8' '"hsl(248 100% 91%)"'

    /** Prepares the Editor panel */
    oneditprepare: function () { onEditPrepare(this) },

    /** Runs before save (Actually when Done button pressed) - oneditsave */
    // oneditsave: function () { onEditSave(this) },

    /** Runs before cancel - oneditcancel */
    /** Handle window resizing for the editor - oneditresize */
    /** Show notification warning before allowing delete - oneditdelete */
}) // ---- End of registerType() ---- //
