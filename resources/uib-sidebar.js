// @ts-nocheck

// Now loading as a module so no need to further Isolate this code

//#region --------- module variables for the panel --------- //

// RED._debug({topic: 'RED.settings', payload:RED.settings})

// Create a new set to hold all saved node instances oneditsave
if (!window['savedNodes']) {
    window['uibSidebarNodes'] = new Set()
}

RED.events.on('nodes:add', function(node) {
    if (node.type === 'uib-sidebar') {
        console.log('🏠 uib-sidebar added', node)
        window['uibSidebarNodes'].add(node)
    }
})

// NOTE: window.uibuilder is added by editor-common.js - see `resources` folder
const uibuilder = window['uibuilder']
const log = uibuilder.log
/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName  = 'uib-sidebar'

//#endregion ------------------------------------------------- //

//#region --------- module functions for the panel --------- //

/** Prep for edit
 * @param {*} node -
 */
function onEditPrepare(node) {
    console.log('uibuilder: uib-sidebar: Edit prepare: node', node)

    uibuilder.doTooltips('.ti-edit-panel') // Do this at the end
}

/** Handles the save event when editing a node in the Node-RED editor.
 *
 * @param {object} node - The node being edited.
 *
 * @description
 * This function performs the following tasks:
 * 1.
 */
function onEditSave(node) {
    // console.log('uibuilder: uib-sidebar: Edit save: node', node)

    // Add the node to the saved set
    // window['uibSidebarNodes'].add(node)

    // Do any other processing here
}

//#endregion ------------------------------------------------- //

// Register the node type, defaults and set up the edit fns
RED.nodes.registerType(moduleName, {
    //#region --- options --- //
    defaults: {
        name: { value: '' },
        topic: { value: '' },
    },
    inputs: 1,
    inputLabels: 'Msg to send to sidebar UI',
    outputs: 1,
    outputLabels: ['Data from sidebar UI'],
    // icon: 'node-white.svg',
    icon: 'node-blue-inverted.svg',
    // icon: 'semanticWebWhite.svg',
    label: function () {
        const url = this.url ? `<${this.url}>` : '<no url>'
        const name = this.name ? `${this.name} ` : ''
        return `${name}${url}`
    },
    paletteLabel: moduleName,
    category: uibuilder.paletteCategory,
    color: 'var(--uib-node-colour)',
    //#endregion --- options --- //

    /** Prepares the Editor panel */
    oneditprepare: function() { onEditPrepare(this) },

    /** Runs BEFORE save (Actually when Done button pressed)
     * @this {RED}
     */
    oneditsave: function() { onEditSave(this) },

    /** Runs before cancel */
    // oneditcancel: function() {
    // },

    /** Handle window resizing for the editor */
    // oneditresize: function() { // (size) {
    // },

    /** Remove savedNodes entry for this node before removal */
    oneditdelete: function() {
        window['uibSidebarNodes'].delete(this)
    }
})

// Subscribe to notifications from the runtime
RED.comms.subscribe('notification/#', function(topic, payload) {
    if (topic.startsWith('notification/uibuilder-uib-sidebar-runtime')) {
        console.log('🏠 COMMS:SUBSCRIBE uibuilder:uib-sidebar:publish', topic, payload)
    }
})

const sb = /*html*/ `
    <h2>uibuilder Sidebar UI</h2>
    <div id="more"></div>
    <div>
        <button id="uib-send"  type="button" onclick="doSend()">Send to Node</button>
    </div>

    <script>
        function sendToNode(node) {
            const customMsg = JSON.stringify({ payload: 'Hello from the sidebar' })
            const label = node.name || node.id
            const postUrl = "/uibuilder/sidebarui/" + node.id
            console.log('Sending to node runtime:', postUrl, customMsg, node.id, node)
            $.ajax({
                url: "./uibuilder/sidebarui/" + node.id,
                type: "POST",
                data: customMsg,
                // data: JSON.stringify(customMsg||{}),
                contentType: "application/json; charset=utf-8",
                success: function (resp) {
                    RED.notify(
                        'Sidebar send success',
                        { type: "success", id: "uib-sidebar", timeout: 2000 }
                    )
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('🏠 ❌ ☹️', postUrl, errorThrown, textStatus)
                    RED.notify(
                        'Failed to send from sidebar UI',
                        { type: "error", id: "uib-sidebar" }
                    )
                }
            })
        }
        function doSend() {
            console.log('Sending to Node', window['uibSidebarNodes'].size, window['uibSidebarNodes'])
            window['uibSidebarNodes'].forEach( node => {
                console.log('🏠 doSend - Node:', node)
                sendToNode(node)
            })
        }
        const more = document.getElementById('more')
        more.innerText = 'This is the uibuilder sidebar UI'
    </script>

`

RED.sidebar.addTab({
    id: 'uibuilder-sidebar-ui',
    label: 'uib UI',
    name: 'UIBUILDER Sidebar UI',
    content: sb,
    // toolbar: uiComponents.footer,
    enableOnEdit: true,
    iconClass: 'fa fa-globe',
    icon: 'node-blue-inverted.svg',
})
