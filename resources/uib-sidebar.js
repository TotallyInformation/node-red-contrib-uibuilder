// @ts-nocheck

// Now loading as a module so no need to further Isolate this code

// NOTE: window.uibuilder is added by editor-common.js - see `resources` folder
const uibuilder = window['uibuilder']
const log = uibuilder.log
/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName  = 'uib-sidebar'

// Create a new set to hold all saved node instances oneditsave
if (!window['uibSidebarNodes']) {
    window['uibSidebarNodes'] = new Set()
}

const purifyOpts = {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
}

/** Send a message via the node's runtime (API call)
 * @param {*} node -
 * @param {*} msg -
 */
function sendToNode(node, msg) {
    msg = JSON.stringify(msg)  // needs try/catch
    const postUrl = '/uibuilder/sidebarui/' + node.id
    // console.log('📊 [uib-sidebar:sidebar] Sending to node runtime:', postUrl, msg, node.id, node)
    $.ajax({
        url: './uibuilder/sidebarui/' + node.id,
        type: 'POST',
        data: msg,
        contentType: 'application/json; charset=utf-8',
        success: function (resp) {
            RED.notify(
                '📊 Sidebar UI send success',
                { type: 'success', id: moduleName, timeout: 2000 }
            )
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('📊 ❌ [uib-sidebar:sidebar] POST failed. ', postUrl, errorThrown, textStatus)
            RED.notify(
                '📊 Failed to send from sidebar UI',
                { type: 'error', id: moduleName }
            )
        }
    })
}

const sbMasterEl = document.createElement('section')
sbMasterEl.id = 'uib-sidebar-ui'
sbMasterEl.className = moduleName
let sbEl

// Keep track of the number of uib-sidebar nodes - used for sending msgs from the sidebar
RED.events.on('nodes:add', function(node) {
    if (node.type === moduleName) {
        // When the first uib-sidebar node is added ...
        if (window['uibSidebarNodes'].size === 0) {
            log('📊 [uib-sidebar] FIRST uib-sidebar added - ADDING SIDEBAR')
            // Set the default HTML for the sidebar UI
            window['uibSidebarHTML'] = node.html ?? '<p>Sidebar UI</p>'
            // Add the current node's html to the sbMasterEl
            sbMasterEl.innerHTML = window['uibSidebarHTML']
            // Add the sidebar tab
            RED.sidebar.addTab({
                id: 'uibuilder-sidebar-ui',
                label: 'uib UI',
                name: 'UIBUILDER Sidebar UI',
                content: sbMasterEl,
                // toolbar: uiComponents.footer,
                enableOnEdit: true,
                iconClass: 'fa fa-globe uib-blue',
            })
            // Get a reference to the sidebar UI element because node-red doesn't add a proper id (as of nr v4.0.8)
            sbEl = document.getElementById('uib-sidebar-ui')
        }
        window['uibSidebarNodes'].add(node)
        sbEl.addEventListener('change', function(evt) {
            const target = evt.target
            // TODO if target is in a form, get all the form data - consider requiring a submit button
            const msg = {
                payload: target.value,
                topic: `${moduleName}/${target.localName}${target.id ? `/${target.id}` : target.name ? `/${target.name}` : ''}`,
                from: moduleName,
                id: target.id,
                name: target.name,
                attributes: target.attributes,
                data: target.dataset,
                willValidate: target.willValidate,
                type: target.type,
                checked: target.checked,
                localName: target.localName,
                modifierKeys: {
                    altKey: evt.altKey,
                    ctrlKey: evt.ctrlKey,
                    metaKey: evt.metaKey,
                    shiftKey: evt.shiftKey,
                },
            }
            // TODO specials for checkboxes and radios
            if (!isNaN(target.valueAsNumber)) {
                msg.valueAsNumber = target.valueAsNumber
            }
            if (target.localName === 'select') {
                msg.multiple = target.multiple
            }
            if (target.localName === 'textarea') {
                msg.selectionStart = target.selectionStart
                msg.selectionEnd = target.selectionEnd
                // msg.rows = target.rows
            }
            log('📊 [uib-sidebar] Input changed:', target, msg)
            sendToNode(node, msg)
        })
    }
})
RED.events.on('nodes:remove', function(node) {
    if (node.type === moduleName) {
        // Remove the node from the set
        window['uibSidebarNodes'].delete(node)
        // If there are no more uib-sidebar nodes, remove the sidebar tab
        if (window['uibSidebarNodes'].size === 0) {
            log('📊 [uib-sidebar] LAST uib-sidebar removed - REMOVING SIDEBAR UI')
            RED.sidebar.removeTab('uibuilder-sidebar-ui')
        }
    }
})

/** Update the sidebar UI tab with new HTML content
 * @param {string} html - The new HTML to display in the sidebar UI
 */
function updateTab(html) {
    // Empty the current sidebar UI master element
    sbEl.innerHTML = ''
    // Replace with the new HTML - but sanitise it first
    sbEl.innerHTML = DOMPurify.sanitize(html, purifyOpts) // eslint-disable-line no-undef
}

// Subscribe to notifications from the runtime
RED.comms.subscribe('notification/uibuilder/uib-sidebar/#', function(topic, payload) {
    log('📊 [uib-sidebar] Message Received from Sidebar: ', { topic, payload })
    const msg = payload
    if ('reset' in msg) {
        log('📊 [uib-sidebar] Resetting sidebar UI')
        // Reset the sidebar UI
        updateTab(window['uibSidebarHTML'])
    }
    if (msg.sidebar) {
        // for each entry in msg.sidebar, update the sidebar UI
        for (const key in msg.sidebar) {
            // log('📊 [uib-sidebar] key:', key, sbEl)
            // get a reference to the element with the id of key
            const el = sbEl.querySelector(`#${key}`)
            // TODO Note that this is rather dangerous as it allows arbitrary HTML to be injected into the sidebar
            if (el) {
                // for each property in msg.sidebar[key], update the element
                for (const prop in msg.sidebar[key]) {
                    switch (prop) {
                        // Don't allow outerHTML to be updated
                        case 'outerHTML': {
                            break
                        }

                        // Only update if sanitised. DOMPurify is loaded by Node-RED core.
                        case 'innerHTML': {
                            let clean
                            try {
                                clean = DOMPurify.sanitize(msg.sidebar[key][prop], purifyOpts) // eslint-disable-line no-undef
                                el[prop] = clean
                            } catch (e) {
                                log('📊 [uib-sidebar] DOMPurify error:', e)
                            }
                            break
                        }

                        default: {
                            el[prop] = msg.sidebar[key][prop]
                            break
                        }
                    }
                }
            }
            // if (Object.hasOwnProperty.call(msg.sidebar, key)) {
            //     const html = msg.sidebar[key]
            //     updateTab(html)
            // }
        }
    }
    // TODO Unpack the payload and apply to the sidebar UI
})

//#region --------- module functions for the panel --------- //

/** Prep for edit
 * @param {*} node -
 */
function onEditPrepare(node) {
    // log('📊 [uib-sidebar] Edit prepare: node', node)

    // In case the html was changed by another uib-sidebar node
    if (node.html !== window['uibSidebarHTML']) node.html = window['uibSidebarHTML']

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

// TODO html from editor has to be GLOBAL, not local to the node
/** Handles the save event when editing a node in the Node-RED editor.
 * @param {object} node - The node being edited.
 * @description
 * This function performs the following tasks:
 * 1. Copies the value of the editor to the hidden `html` input field.
 * 2. Destroys & deletes the editor.
 */
function onEditSave(node) {
    // console.log('uibuilder: uib-sidebar: Edit save: node', node)

    // Update both the node's html property and the global window['uibSidebarHTML'] (for other uib-sidebar nodes)
    const html = window['uibSidebarHTML'] = node.editor.getValue()
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
        html: { value: '' },
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
