/** Common functions and data for UIBUILDER nodes
 * Load as: ./resources/node-red-contrib-uibuilder/ti-common.js
 */

;(function () { // eslint-disable-line sonarjs/cognitive-complexity
    'use strict'

    if (!window['uibuilder']) {
        let _dbg = false

        /** Add a "uibuilder" object to the Node-RED Editor
         * To contain common functions, variables and constants for UIBUILDER nodes
         */
        const uibuilder = window['uibuilder'] = {
            paletteCategory: 'uibuilder',
            // Standard width for typed input fields
            typedInputWidth: '68.5%',
            // Are we running on a local device?
            localHost: ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost'),
            // URL root if needed (set below to '' if using a custom uib server)
            nodeRoot: RED.settings.httpNodeRoot.replace(/^\//, ''),
            // URL prefix for all uib nodes - set below
            urlPrefix: undefined,
            // uib server type
            serverType: undefined,
            /** Tracks ALL uibuilder URL's by node id by tracking changes to the Node-RED Editor - ONLY USE FOR URL TRACKING
             * These URL's may not actually be deployed. They also include disabled nodes (node.d=true) AND disabled flows.
             * NOTE: Nodes on disabled flows are not directly detectable and node.d will not be set.
             */
            urlsByNodeId: {},
            /** Tracks uibuilder's installed front-end packages - changes as packages added/removed (in uibuilder node) */
            packages: [],

            // Debug output via log() - turn on/off with true/false
            get debug() { return _dbg },
            set debug(dbg) {
                if (![true, false].includes(dbg)) return
                if (dbg === null) _dbg = !_dbg
                else _dbg = dbg
                this.log = _dbg ? console.log : function() {}
            },
            log: function(...args) {},
            /** Add jQuery UI formatted tooltips
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
                        } else return ''
                    },
                })
            },
            /** Get all of the currently deployed uibuilder URL's
             * NOTE that the uibuilder.urlsByNodeId cannot be used as that includes disabled nodes/flows
             * @returns {{string,string}} URLs by node id of deployed uibuilder nodes
             */
            getDeployedUrls: function getDeployedUrls() {
                let out
                $.ajax({
                    type: 'GET',
                    async: false,
                    dataType: 'json',
                    url: './uibuilder/admin/dummy',
                    data: {
                        'cmd': 'listinstances',
                    },
                    success: function(instances) {
                        // uibuilder.log('[uibuilder] Deployed Instances >>', instances )
                        out = instances
                    }
                })
                return out
            } // ---- end of getDeployedUrls ---- //
        }

        //#region --- Calculate the node url root & the uibuilder FE url prefix
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
        //#endregion ---- ---- ----

        uibuilder.debug = uibuilder.localHost
        uibuilder.log('[uibuilder] DEBUG ON (because running on localhost)')

        /** Get initial list of installed FE packages via v2 API - save to master list */
        $.ajax({

            dataType: 'json',
            method: 'get',
            url: 'uibuilder/uibvendorpackages',
            async: false,
            // data: { url: node.url},

            success: function(vendorPaths) {
                uibuilder.packages = vendorPaths
            },

            error: function(err) {
                console.error('ERROR', err)
            },
        })

        /** Track which urls have been used - required to handle copy/paste and import
         *  as these can contain duplicate urls before deployment.
         */
        RED.events.on('nodes:add', function(node) {
            if ( node.type === 'uibuilder') {
                // Track what type of addition this is
                if (node.changed === false && !('moved' in node)) node.addType = 'load'
                else if (!('_config' in node)) node.addType = 'new'
                else if (node.changed === true && ('_config' in node)) node.addType = 'paste/import'
                // Remove the URL on paste or import
                if (node.addType === 'paste/import') {
                    delete node.url
                    // We have to change this if we want the display version to change (if the prop is part of the label)
                    delete node._config.url
                }
                // Keep a list of ALL uib nodes in the editor incl disabled, undeployed, etc. Different to the deployed list
                if (node.url) uibuilder.urlsByNodeId[node.id] = node.url
                // Inform interested functions that something was added (and why)
                RED.events.emit('uibuilder:node-added', node)
                // -- IF uibuilderInstances <> editorInstances THEN there are undeployed instances. OR Disabled nodes/flows --

                // uibuilder.log('[uibuilder] node added:', node)
            }
        })
        RED.events.on('nodes:change', function(node) {
            if ( node.type === 'uibuilder') {
                // Update list
                if (node.url) uibuilder.urlsByNodeId[node.id] = node.url
                else delete uibuilder.urlsByNodeId[node.id]
                // Inform interested functions that something was changed
                RED.events.emit('uibuilder:node-changed', node)

                uibuilder.log('[uibuilder] node changed:', node)
            }
        })
        RED.events.on('nodes:remove', function(node) {
            if ( node.type === 'uibuilder') {
                // update list
                delete uibuilder.urlsByNodeId[node.id]
                // Inform interested functions that something was deleted
                RED.events.emit('uibuilder:node-deleted', node)

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

        /** If debug, dump out key information to console */
        if (uibuilder.debug === true) {
            setTimeout( () => {
                console.groupCollapsed('[uibuilder] Settings ...')
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
                    `\n\nEditor Instances (${Object.keys(uibuilder.urlsByNodeId).length}, incl undeployed & disabled): `, uibuilder.urlsByNodeId,
                    // Currently installed FE packages
                    `\n\nFE installed packages - (${Object.keys(uibuilder.packages).length}): `, uibuilder.packages
                )
                console.groupEnd()
            }, 1500)
        }
    }
}())
