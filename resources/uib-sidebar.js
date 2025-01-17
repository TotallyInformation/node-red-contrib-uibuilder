// @ts-nocheck

// Now loading as a module so no need to further Isolate this code

//#region --------- module variables for the panel --------- //

// RED._debug({topic: 'RED.settings', payload:RED.settings})

// Create a new set to hold all saved node instances oneditsave
if (!window['savedNodes']) {
    window['uibSidebarNodes'] = new Set()
}

const sbHTMLx = /*html*/ `
    <section id="uib-sidebar-ui" class="uib-sidebar">
        <h2>uibuilder Sidebar UI</h2>
        <div id="more"></div>
        <div>
            <button id="uib-send"  type="button" onclick="doSend()">Send to Node</button>
        </div>
    </section>

    <script type="module" async >
        function sendToNode(node) {
            const customMsg = JSON.stringify({ payload: 'Hello from the sidebar' })
            const label = node.name || node.id
            const postUrl = "/uibuilder/sidebarui/" + node.id
            console.log('📊 [uib-sidebar:sidebar] Sending to node runtime:', postUrl, customMsg, node.id, node)
            $.ajax({
                url: "./uibuilder/sidebarui/" + node.id,
                type: "POST",
                data: customMsg,
                // data: JSON.stringify(customMsg||{}),
                contentType: "application/json; charset=utf-8",
                success: function (resp) {
                    RED.notify(
                        '📊 Sidebar UI send success',
                        { type: "success", id: "uib-sidebar", timeout: 2000 }
                    )
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('📊 ❌ [uib-sidebar:sidebar] POST failed. ', postUrl, errorThrown, textStatus)
                    RED.notify(
                        '📊 Failed to send from sidebar UI',
                        { type: "error", id: "uib-sidebar" }
                    )
                }
            })
        }
        function doSend() {
            window['uibSidebarNodes'].forEach( node => {
                console.log('📊 [uib-sidebar:sidebar] Sending data from sidebar to node:', node)
                sendToNode(node)
            })
        }
        const more = document.getElementById('more')
        more.innerText = 'This is the uibuilder sidebar UI'
    </script>
`
const sbHTML = /*html*/ `
    <section id="uib-sidebar-ui" class="uib-sidebar">
        <h2>uibuilder Sidebar UI</h2>
        <div id="more"></div>
    </section>
`

// Keep track of the number of uib-sidebar nodes - used for sending msgs from the sidebar
RED.events.on('nodes:add', function(node) {
    if (node.type === 'uib-sidebar') {
        // When the first uib-sidebar node is added, add the sidebar tab.
        if (window['uibSidebarNodes'].size === 0) {
            log('📊 [uib-sidebar] FIRST uib-sidebar added - ADDING SIDEBAR')
            RED.sidebar.addTab({
                id: 'uibuilder-sidebar-ui',
                label: 'uib UI',
                name: 'UIBUILDER Sidebar UI',
                content: node.html,
                // toolbar: uiComponents.footer,
                enableOnEdit: true,
                iconClass: 'fa fa-globe uib-blue',
            })
        }
        window['uibSidebarNodes'].add(node)
    }
})
RED.events.on('nodes:remove', function(node) {
    if (node.type === 'uib-sidebar') {
        window['uibSidebarNodes'].delete(node)
        if (window['uibSidebarNodes'].size === 0) {
            log('📊 [uib-sidebar] LAST uib-sidebar removed - REMOVING SIDEBAR')
            RED.sidebar.removeTab('uibuilder-sidebar-ui')
        }
    }
})

function updateTab(html) {
    RED.sidebar.removeTab('uibuilder-sidebar-ui')
    RED.sidebar.addTab({
        id: 'uibuilder-sidebar-ui',
        label: 'uib UI',
        name: 'UIBUILDER Sidebar UI',
        content: html,
        // toolbar: uiComponents.footer,
        enableOnEdit: true,
        iconClass: 'fa fa-globe uib-blue',
    })
}

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
    // log('📊 [uib-sidebar] Edit prepare: node', node)

    if (node.html === '') node.html = sbHTML

    const stateId = RED.editor.generateViewStateId('node', node, '')
    node.editor = RED.editor.createEditor({
        id: 'node-input-editor',
        mode: 'ace/mode/html',
        stateId: stateId,
        value: node.html
    })
    // const mod = 'ace/mode/html'
    // node.editor.getSession().setMode({
    //     path: mod,
    //     v: Date.now()
    // })

    uibuilder.doTooltips('.ti-edit-panel') // Do this at the end
}

/** Handles the save event when editing a node in the Node-RED editor.
 * @param {object} node - The node being edited.
 * @description
 * This function performs the following tasks:
 * 1. Copies the value of the editor to the hidden `html` input field.
 * 2. Destroys & deletes the editor.
 */
function onEditSave(node) {
    // console.log('uibuilder: uib-sidebar: Edit save: node', node)

    const html = node.editor.getValue()
    $('#node-input-html').val(html)

    updateTab(html)

    node.editor.destroy()
    delete node.editor
}

/** Handles the cancel event when editing a node in the Node-RED editor.
 * @param {object} node - The node being edited.
 */
function onEditCancel(node) {
    node.editor.destroy()
    delete node.editor
}

/** Handles the resize event when editing a node in the Node-RED editor.
 * @param {object} size - The size of the editor.
 * @param {object} node - The node being edited.
 */
function onEditResize(size, node) {
    const rows = $('#dialog-form>div:not(.node-text-editor-row)')
    let height = $('#dialog-form').height()
    for (let i = 0; i < rows.length; i++) {
        height -= $(rows[i]).outerHeight(true)
    }
    const editorRow = $('#dialog-form>div.node-text-editor-row')
    height -= (parseInt(editorRow.css('marginTop')) + parseInt(editorRow.css('marginBottom')))
    $('#dialog-form .node-text-editor').css('height', height + 'px')
    node.editor.resize()
}

//#endregion ------------------------------------------------- //

// Register the node type, defaults and set up the edit fns
RED.nodes.registerType(moduleName, {
    //#region --- options --- //
    defaults: {
        name: { value: '' },
        html: { value: sbHTML },
        // topic: { value: '' },
    },
    inputs: 1,
    inputLabels: 'Msg to send to sidebar UI',
    outputs: 1,
    outputLabels: ['Data from sidebar UI'],
    // icon: 'node-white.svg',
    icon: 'node-blue-inverted.svg',
    // icon: 'semanticWebWhite.svg',
    label: function () {
        return this.name ? this.name : moduleName
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

    oneditcancel: function() { onEditCancel(this) },
    oneditresize: function(size) { onEditResize(size, this) },
})

// Subscribe to notifications from the runtime
RED.comms.subscribe('notification/uibuilder/uib-sidebar/#', function(topic, payload) {
    log('📊 [uib-sidebar] COMMS:SUBSCRIBE Message Received: ', topic, payload)
})
