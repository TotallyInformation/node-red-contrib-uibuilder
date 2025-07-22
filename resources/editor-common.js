/** Common functions and data for UIBUILDER nodes
 * Load as: ./resources/node-red-contrib-uibuilder/editor-common.js
 * Note that RED is available here
 */

// Register the plugin
RED.plugins.registerPlugin('uib-editor-plugin', {
    type: 'uibuilder-editor-plugin', // optional plugin type
    onadd: function() {
        let _dbg = false

        /** Add a "uibuilder" object to the Node-RED Editor
         * To contain common functions, variables and constants for UIBUILDER nodes
         */
        const uibuilder = window['uibuilder'] = {
            // Standard palette category for all uibuilder nodes
            paletteCategory: 'uibuilder',
            // Standard width for typed input fields
            typedInputWidth: '68.5%',
            // Are we running on a local device?
            localHost: ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost'),
            // Server address of the Node-RED server
            nrServer: window.location.hostname,
            // URL root if needed (set below to '' if using a custom uib server)
            nodeRoot: RED.settings.httpNodeRoot.replace(/^\//, ''),
            // URL prefix for all uib nodes - set below
            urlPrefix: undefined,
            // uib server type
            serverType: undefined,
            /** Tracks ALL uibuilder editor instance URL's by node id by tracking changes to the Node-RED Editor - ONLY USE FOR URL TRACKING
             * These URL's may not actually be deployed. They also include disabled nodes (node.d=true) AND disabled flows.
             * NOTE: Nodes on disabled flows are not directly detectable and node.d will not be set.
             * @type {{string,string}|{}}
             */
            editorUibInstances: {},
            /** Tracks all DEPLOYED uibuilder instances url's by node id @type {{string,string}|{}} */
            deployedUibInstances: {},
            /** Tracks uibuilder's installed front-end packages - changes as packages added/removed (in uibuilder node) */
            packages: [],
            /** List of uib node names */
            uibNodeTypes: ['uibuilder', 'uib-cache', 'uib-element', 'uib-html', 'uib-save', 'uib-sender', 'uib-tag', 'uib-update'],

            // Debug output via log() - turn on/off with true/false
            get debug() { return _dbg },
            set debug(dbg) {
                if (![true, false].includes(dbg)) return
                if (dbg === null) _dbg = !_dbg
                else _dbg = dbg
                this.log = _dbg ? console.log : function() {}
            },
            log: function(...args) {},

            /** Add jQuery UI formatted tooltips - add as the last line of oneditprepare in a node
             * @param {string} baseSelector CSS Selector that is the top of the hierarchy to impact
             */
            doTooltips: function doTooltips(baseSelector) {
                // Select our page elements
                $(baseSelector).tooltip({
                    items: 'img[alt], [aria-label], [title]',
                    track: true,
                    content: function() {
                        const element = $( this )
                        if ( element.is( '[title]' ) ) {
                            return element.attr( 'title' )
                        } else if ( element.is( '[aria-label]' ) ) {
                            return element.attr( 'aria-label' )
                        } else if ( element.is( 'img[alt]' ) ) {
                            return element.attr( 'alt' )
                        }
                        return ''
                    },
                })
            },
            /** Get all of the currently deployed uibuilder URL's & updates this.deployedUibInstances
             * NOTE that the uibuilder.editorUibInstances cannot be used as that includes disabled nodes/flows
             * @returns {{string,string}} URLs by node id of deployed uibuilder nodes
             */
            getDeployedUrls: function getDeployedUrls() {
                $.ajax({
                    type: 'GET',
                    async: false,
                    dataType: 'json',
                    url: './uibuilder/admin/dummy',
                    data: {
                        cmd: 'listinstances',
                    },
                    beforeSend: function(jqXHR) {
                        const authTokens = RED.settings.get('auth-tokens')
                        if (authTokens) {
                            jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                        }
                    },
                    success: (instances) => {
                        this.deployedUibInstances = this.sortInstances(instances)
                        // Also pre-populate the editorUibInstances to avoid the problem that
                        // that list is built too late during Editor load
                        if (Object.keys(this.editorUibInstances).length === 0) this.editorUibInstances = this.deployedUibInstances
                        // uibuilder.log('[uibuilder] Deployed Instances >>', instances, this )
                    },
                })
                return this.deployedUibInstances
            }, // ---- end of getDeployedUrls ---- //
            /** Sort an instances object by url instead of the natural order added
             * @param {*} instances The instances object to sort
             * @returns {*} instances sorted by url
             */
            sortInstances: function sortInstances(instances) {
                return Object.fromEntries(
                    Object.entries(instances).sort(([, a], [, b]) => {
                        const nameA = a.toUpperCase()
                        const nameB = b.toUpperCase()
                        if (nameA < nameB) return -1
                        if (nameA > nameB) return 1
                        return 0
                    })
                )
            },
        }

        // #region --- Calculate the node url root & the uibuilder FE url prefix
        const eUrlSplit = window.origin.split(':')
        // Is uibuilder using a custom server?
        if (RED.settings.uibuilderCustomServer.isCustom === true) {
            // Use the correct protocol (http or https)
            eUrlSplit[0] = RED.settings.uibuilderCustomServer.type.replace('http2', 'https')
            // Use the correct port
            eUrlSplit[2] = RED.settings.uibuilderCustomServer.port
            // When using custom server, no base path is used
            uibuilder.nodeRoot = ''
            uibuilder.serverType = 'a custom'
        } else {
            uibuilder.serverType = 'Node-RED\'s'
        }
        uibuilder.urlPrefix = `${eUrlSplit.join(':')}/${uibuilder.nodeRoot}`
        // #endregion ---- ---- ----

        if (RED.settings.uibuilderNodeEnv) {
            uibuilder.debug = RED.settings.uibuilderNodeEnv.toLowerCase() === 'development' || RED.settings.uibuilderNodeEnv.toLowerCase() === 'dev' // uibuilder.localHost
            uibuilder.log(`🌐[uibuilder] DEBUG ON (because env NODE_ENV is '${RED.settings.uibuilderNodeEnv}')`)
        }

        /** Get initial list of installed FE packages via v2 API - save to master list */
        $.ajax({

            dataType: 'json',
            method: 'get',
            url: 'uibuilder/uibvendorpackages',
            async: false,
            // data: { url: node.url},

            beforeSend: function(jqXHR) {
                const authTokens = RED.settings.get('auth-tokens')
                if (authTokens) {
                    jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                }
            },

            success: function(vendorPaths) {
                uibuilder.packages = vendorPaths
            },

            error: function(err) {
                console.error('ERROR', err)
            },
        })

        /** Get initial list of deployed uibuilder instances */
        uibuilder.getDeployedUrls()

        /** Track which urls have been used - required to handle copy/paste and import
         *  as these can contain duplicate urls before deployment.
         */
        RED.events.on('nodes:add', function(node) {
            // For any newly added uib node, track what type of addition this is
            if ( uibuilder.uibNodeTypes.includes(node.type) ) {
                if (node.changed === false && !('moved' in node)) node.addType = 'load'
                else if (!('_config' in node)) node.addType = 'new'
                else if (node.changed === true && ('_config' in node)) node.addType = 'paste/import'
            }

            if ( node.type === 'uibuilder') {
                // Remove the URL on paste or import
                if (node.addType === 'paste/import') {
                    delete node.url
                    delete node.oldUrl
                    // We have to change this if we want the display version to change (if the prop is part of the label)
                    delete node._config.url
                }
                // Keep a list of ALL uibuilder nodes in the editor incl disabled, undeployed, etc. Different to the deployed list
                if (node.url) uibuilder.editorUibInstances[node.id] = node.url
                // Inform interested functions that something was added (and why)
                RED.events.emit('uibuilder/node-added', node)
                // -- IF uibuilderInstances <> editorInstances THEN there are undeployed instances. OR Disabled nodes/flows --

                // uibuilder.log('[uibuilder] node added:', node)
            }
        })
        RED.events.on('nodes:change', function(node) {
            if ( node.type === 'uibuilder') {
                // Update list
                if (node.url) uibuilder.editorUibInstances[node.id] = node.url
                else delete uibuilder.editorUibInstances[node.id]
                // Inform interested functions that something was changed
                RED.events.emit('uibuilder/node-changed', node)

                uibuilder.log('[uibuilder] node changed:', node)
            }
        })
        RED.events.on('nodes:remove', function(node) {
            if ( node.type === 'uibuilder') {
                // update list
                delete uibuilder.editorUibInstances[node.id]
                // Inform interested functions that something was deleted
                RED.events.emit('uibuilder/node-deleted', node)

                uibuilder.log('[uibuilder] node removed: ', node)
            }
        })
        // RED.events.on('deploy', function() {
        //     console.log('[uibuilder] Deployed')
        // })
        // RED.events.on('workspace:dirty', function(data) {
        //     console.log('[uibuilder] Workspace dirty:', data)
        // })
        // RED.events.on('runtime-state', function(event) {
        //     console.log('[uibuilder] Runtime State:', event)
        // })

        // #region --- Add uibuilder-specific actions to the RED editor ---

        // Action to open a selected uibuilder node's site in a new tab
        RED.actions.add('uibuilder:open-uibuilder-site', () => {
            // Get the selected node
            const selectedNode = RED.view.selection().nodes
            // If there is a single selected node and it is a uibuilder node, open
            if (selectedNode && selectedNode.length === 1 && selectedNode[0].type === 'uibuilder') {
                // Open the uibuilder site in a new tab
                const url = `${uibuilder.urlPrefix}${selectedNode[0].url}`
                window.open(url, '_blank')
            } else {
                RED.notify('🌐 Please select a single uibuilder node to open its site', 'error')
            }
        })

        // Action to open a selected uibuilder node's front-end code in an IDE
        RED.actions.add('uibuilder:edit-uibuilder-site', () => {
            const selectedNode = RED.view.selection().nodes
            if (selectedNode && selectedNode.length === 1 && selectedNode[0].type === 'uibuilder') {
                const url = selectedNode[0].editurl
                if (url) {
                    window.open(url, '_blank')
                } else {
                    RED.notify('No IDE URL set for this uibuilder node', 'error')
                }
            } else {
                RED.notify('🌐 Please select a single uibuilder node to open its front-end code in your IDE', 'error')
            }
        })
        // #endregion ---- ---- ----

        /** If debug, dump out key information to console */
        if (uibuilder.debug === true) {
            setTimeout( () => {
                console.groupCollapsed('🌐⚙️[uibuilder:editor-common] Settings ...')
                console.log(
                    // The server's NODE_ENV environment var (e.g. PRODUCTION or DEVELOPMENT)
                    'NodeEnv: ', RED.settings.uibuilderNodeEnv,
                    // Current version of uibuilder
                    '\nCurrentVersion: ', RED.settings.uibuilderCurrentVersion,
                    // Should the editor tell the user that a redeploy is needed (based on uib versions)
                    '\nRedeployNeeded: ', RED.settings.uibuilderRedeployNeeded,
                    // uibRoot folder
                    '\nRootFolder: ', RED.settings.uibuilderRootFolder,

                    // Available templates and details
                    '\n\nTemplates: ', RED.settings.uibuilderTemplates,
                    // Custom server details
                    '\n\nCustomServer: ', RED.settings.uibuilderCustomServer,

                    // List of the deployed uib instances at Editor load time [{node_id: url}]
                    `\n\nDeployed Instances (${Object.keys(RED.settings.uibuilderInstances).length}): `, RED.settings.uibuilderInstances,
                    // ALL possible nodes in the editor
                    `\n\nEditor Instances (${Object.keys(uibuilder.editorUibInstances).length}, incl undeployed & disabled): `, uibuilder.editorUibInstances,
                    // Currently installed FE packages
                    `\n\nFE installed packages - (${Object.keys(uibuilder.packages).length}): `, uibuilder.packages,

                    '\n\nRED Keys: ', Object.keys(RED),
                    '\n\nRED.events Keys: ', Object.keys(RED.events),
                    '\n\nRED.utils Keys: ', Object.keys(RED.utils)
                )
                console.groupEnd()
            }, 1500)
        }

        // TODO: EXPERIMENTAL - Maybe dynamically add things to the help panel?
        // // Create a mutation observer to watch for changes to the inner text of any element with the class '.red-ui-help.title'
        // const observer = new MutationObserver((mutations) => {
        //     mutations.forEach((mutation) => {
        //         if (mutation.type === 'childList') {
        //             console.log('🌐 MutationObserver: Detected childList mutation:', mutation.target.classList, mutation)
        //             // Check if the target element has the class 'red-ui-help title'
        //             if (mutation.target.classList.contains('red-ui-help-title')) {
        //                 console.log('🌐 MutationObserver: Detected change in red-ui-help title element:', mutation.target);
        //                 // If it does, update the title text
        //                 const txt = mutation.target.innerText
        //                 if (txt === 'uibuilder') mutation.target.innerText = 'uibuilder - Node-RED Front-End Builder'
        //             }
        //         } else {
        //             console.log('🌐 MutationObserver: Detected mutation of type:', mutation.type);
        //         }
        //     })
        // })
        // // start observing from `div.red-ui-help`
        // const helpDiv = document.querySelector('.red-ui-panel > .red-ui-help')
        // if (helpDiv) {
        //     console.log('🌐 MutationObserver: Starting to observe red-ui-help element:', helpDiv);
        //     observer.observe(helpDiv, {
        //         childList: true, // Watch for changes to the children of the target node
        //         subtree: true, // Watch for changes in all descendants of the target node
        //     })
        // } else {
        //     console.warn('🌐 MutationObserver: No red-ui-help element found to observe.')
        // }
    },
    // onremove: function() {},
})
