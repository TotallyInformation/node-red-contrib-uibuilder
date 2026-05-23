// NOTE: window.uibuilder is added - see `resources` folder
(function () {
    'use strict'
    // console.log('📊 [uib-sidebar] Initialising uib-sidebar node')

    // #region --------- module variables for the panel --------- //

    // NOTE: window.uibuilder is added by editor-common.js - see `resources` folder
    const uibuilder = window['uibuilder']
    const log = uibuilder.log
    /** Module name must match this nodes html file @constant {string} moduleName */
    const moduleName = 'uib-sidebar'

    // Create a new count of uib-sidebar nodes
    if (!window['uibSidebarNodeCount']) window['uibSidebarNodeCount'] = 0

    const purifyOpts = {
        USE_PROFILES: { html: true, svg: true, svgFilters: true, },
    }

    // #endregion ------------------------------------------------- //

    /** Send a message via the node's runtime (API call)
     * @param {string} nodeid The id of the node to send the message to
     * @param {object} msg The message to send to the runtime - will be stringified before sending
     */
    function sendToNode(nodeid, msg) {
        msg = JSON.stringify(msg) // needs try/catch
        const postUrl = '/uibuilder/sidebarui/' + nodeid
        // console.log('🌐📊[uib-sidebar:sidebar] Sending to node runtime:', postUrl, msg, node.id, node)
        $.ajax({
            url: './uibuilder/uib-sidebar/' + nodeid,
            type: 'POST',
            data: msg,
            contentType: 'application/json; charset=utf-8',
            success: function (resp) {
                RED.notify(
                    '🌐📊Sidebar UI send success',
                    { type: 'success', id: moduleName, timeout: 2000, }
                )
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('🌐📊❌ [uib-sidebar:sidebar] POST failed. ', postUrl, errorThrown, textStatus)
                RED.notify(
                    '🌐📊Failed to send from sidebar UI',
                    { type: 'error', id: moduleName, }
                )
            },
        })
    }

    function sidebarListener(evt) {
        // console.log('🌐📊[uib-sidebar] Input change event:', evt)
        const target = evt.target
        // Deal with stupid checkboxes and radios
        let value = target.value
        if (target.localName === 'input' && (target.type === 'checkbox' || target.type === 'radio')) {
            value = target.checked
        }
        const nodeId = target.closest(`[id^="UIB-SB-"]`)?.id?.replace('UIB-SB-', '')
        // TODO if target is in a form, get all the form data - consider requiring a submit button
        const msg = {
            payload: value,
            topic: `${moduleName}/${target.localName}${target.id ? `/${target.id}` : target.name ? `/${target.name}` : ''}`,
            from: moduleName,
            sourceNode: nodeId,
            id: target.id,
            name: target.name,
            attributes: {}, // target.attributes,
            data: target.dataset,
            willValidate: target.willValidate,
            type: target.type,
            value: value,
            checked: target.checked,
            localName: target.localName,
            modifierKeys: {
                altKey: evt.altKey,
                ctrlKey: evt.ctrlKey,
                metaKey: evt.metaKey,
                shiftKey: evt.shiftKey,
            },
        }
        for (const attr of target.attributes) {
            msg.attributes[attr.name] = attr.value
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
        log('🌐📊[uib-sidebar] Input changed:', target, msg)
        if (nodeId) {
            msg.topic = `${moduleName}/${nodeId}/${target.localName}${target.id ? `/${target.id}` : target.name ? `/${target.name}` : ''}`
            sendToNode(nodeId, msg)
        } else {
            log('🌐📊[uib-sidebar] No node id found for input event', msg)
        }
    }

    const sbMasterEl = document.createElement('section')
    sbMasterEl.id = 'uib-sidebar-ui'
    sbMasterEl.className = moduleName
    let sbEl

    // Keep track of the number of uib-sidebar nodes - used for sending msgs from the sidebar
    RED.events.on('nodes:add', function(node) {
        if (node.type === moduleName) {
            // console.log(`🌐📊[uib-sidebar] Node added: ${node.id}`, node.html)
            window['uibSidebarNodeCount']++
            // When the first uib-sidebar node is added ...
            if (window['uibSidebarNodeCount'] === 1) {
                log('🌐📊[uib-sidebar] FIRST uib-sidebar added - ADDING SIDEBAR')
                // Add the sidebar tab
                if (!RED.sidebar.containsTab('uibuilder-sidebar-ui')) {
                    RED.sidebar.addTab({
                        id: 'uibuilder-sidebar-ui',
                        label: 'uib UI',
                        name: 'UIBUILDER Sidebar UI',
                        content: sbMasterEl,
                        // toolbar: uiComponents.footer,
                        enableOnEdit: true,
                        iconClass: 'fa fa-globe uib-blue',
                    })
                }
            }
            // Get a reference to the sidebar UI element (only once)
            if (!sbEl) sbEl = document.getElementById('uib-sidebar-ui')
            // Add the instance div to the sidebar UI
            sbEl.insertAdjacentHTML('beforeend', `<div id="UIB-SB-${node.id}"></div>`)
            // with the HTML from the node config (or a placeholder if empty)
            if (node.html) {
                updateTab(node.html, node.id)
            } else {
                updateTab(`{${node.id} No content}`, node.id)
            }
            // Listen for any inputs and send to the output of the node
            document.getElementById(`UIB-SB-${node.id}`)?.addEventListener('change', sidebarListener)
        }
    })
    RED.events.on('nodes:remove', function(node) {
        if (node.type === moduleName) {
            // console.log(`🌐📊[uib-sidebar] Node removed: ${node.id}`)
            window['uibSidebarNodeCount']--
            const el = document.getElementById(`UIB-SB-${node.id}`)
            el?.removeEventListener('change', sidebarListener)
            el?.remove()
            // If there are no more uib-sidebar nodes, remove the sidebar tab
            if (window['uibSidebarNodeCount'] === 0) {
                log('🌐📊[uib-sidebar] LAST uib-sidebar removed - REMOVING SIDEBAR UI')
                RED.sidebar.removeTab('uibuilder-sidebar-ui')
            }
        }
    })
    // RED.events.on('deploy', function(node) {
    //     console.log('🌐📊[uib-sidebar] Deploy event', node)
    //     // RED.nodes.dirty()
    // })

    /** Update the sidebar UI tab with new HTML content
     * @param {string} html - The new HTML to display in the sidebar UI
     * @param {string} id - The node id of the HTML to update
     */
    function updateTab(html, id) {
        // TODO Sanitise the HTML before adding it to the sidebar UI - DOMPurify is loaded by Node-RED core
        // html = DOMPurify.sanitize(wrappedHtml, purifyOpts)

        // See if the <div id="${id}"> already exists in the sidebar UI, then update if possible
        const el = document.getElementById(`UIB-SB-${id}`)
        if (el) el.innerHTML = html
        else console.warn(`🌐📊[uib-sidebar] No existing element with id UIB-SB-${id} found`)
    }

    // Subscribe to notifications from the runtime
    RED.comms.subscribe('UIBUILDER/uib-sidebar/#', function(topic, payload) {
        log('🌐📊[uib-sidebar] Message Received from Sidebar: ', { topic, payload, })
        const msg = payload
        if ('reset' in msg) {
            log('🌐📊[uib-sidebar] Resetting sidebar UI')
            // Reset the sidebar UI
            updateTab(window['uibSidebarHTML'], payload.srcId)
        }
        if (msg.sidebar) {
            // for each entry in msg.sidebar, update the sidebar UI
            for (const key in msg.sidebar) {
                // log('🌐📊[uib-sidebar] key:', key, sbEl)
                // get a reference to the element with the id of key
                /** @type {HTMLElement} */
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
                            case 'innerText':
                            case 'innerHTML': {
                                // let clean
                                try {
                                    // TODO: Needs better config
                                    // clean = DOMPurify.sanitize(msg.sidebar[key][prop], purifyOpts) // eslint-disable-line no-undef
                                    // el[prop] = clean
                                    el[prop] = msg.sidebar[key][prop]
                                } catch (e) {
                                    // log('🌐📊[uib-sidebar] DOMPurify error:', e)
                                    log(`🌐📊[uib-sidebar] InnerHTML assignment error for "${key}":`, e)
                                }
                                break
                            }

                            default: {
                                try {
                                    el.setAttribute(prop, msg.sidebar[key][prop])
                                } catch (e) {
                                    log(`🌐📊[uib-sidebar] Attribute assignment error for "${key}":`, e)
                                }
                                // el[prop] = msg.sidebar[key][prop]
                                break
                            }
                        }
                    }
                } else {
                    log(`🌐📊[uib-sidebar] No element with id "${key}" found in sidebar UI`)
                }
                // if (Object.hasOwnProperty.call(msg.sidebar, key)) {
                //     const html = msg.sidebar[key]
                //     updateTab(html)
                // }
            }
        }
        // TODO Unpack the payload and apply to the sidebar UI
    })

    // #region --------- module functions for the panel --------- //

    /** Prep for edit - also run on editor load to set up the editor for any existing nodes
     * @param {*} node -
     */
    function onEditPrepare(node) {
        // log('🌐📊[uib-sidebar] Edit prepare: node', node)

        const stateId = RED.editor.generateViewStateId('node', node, '')
        node.editor = RED.editor.createEditor({
            id: 'node-input-editor',
            mode: 'ace/mode/html',
            stateId: stateId,
            value: node.html,
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

        // Update both the node's html property and the global window['uibSidebarHTML'] (for other uib-sidebar nodes)
        const html = node.editor.getValue()
        $('#node-input-html').val(html)

        updateTab(html, node.id)

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

    // #endregion ------------------------------------------------- //

    // Register the node type, defaults and set up the edit fns
    RED.nodes.registerType(moduleName, {
        // #region --- options --- //
        defaults: {
            name: { value: '', },
            html: { value: '', },
            // topic: { value: '' },
        },
        inputs: 1,
        inputLabels: 'Msg to send to sidebar UI',
        outputs: 1,
        outputLabels: ['Data from sidebar UI'],
        // icon: 'node-white.svg',
        icon: 'node-blue-inverted.svg',
        // icon: 'globe-emoji.svg',
        // icon: 'semanticWebWhite.svg',
        label: function () {
            return this.name ? this.name : moduleName
        },
        paletteLabel: 'uib sidebar',
        category: uibuilder.paletteCategory,
        color: 'var(--uib-node-colour)', // '#E6E0F8' '"hsl(248 100% 91%)"'
        // #endregion --- options --- //

        /** Prepares the Editor panel */
        oneditprepare: function() { onEditPrepare(this) },

        /** Runs BEFORE save (Actually when Done button pressed)
         * @this {RED}
         */
        oneditsave: function() { onEditSave(this) },

        oneditcancel: function() { onEditCancel(this) },
        oneditresize: function(size) { onEditResize(size, this) },
    })
}())
