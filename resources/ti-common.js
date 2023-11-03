/** Common functions and data for UIBUILDER nodes
 * Load as: ./resources/@totallyinformation/node-red-contrib-uibuilder/ti-common.js
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

            localHost: ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname) || window.location.hostname.endsWith('.localhost'),

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

            /** Tracks uibuilder URL's by node id by tracking changes to the Node-RED Editor 
             * These URL's may not actually be deployed.
             */
            urlsByNodeId: {},

            /** Tracks uibuilder's installed front-end packages */
            packages: [],
        }

        uibuilder.debug = window['uibuilder'].localHost
        uibuilder.log('[uibuilder] DEBUG ON (because running on localhost)')

        /** Get list of installed FE packages via v2 API - save to master list */
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
                // Keep a list of uib nodes in the editor
                // may be different to the deployed list
                uibuilder.urlsByNodeId[node.id] = node.url
                // -- IF uibuilderInstances <> editorInstances THEN there are undeployed instances. --
                // uibuilder.log('[uibuilder] node added:', node)
            }
        })
        RED.events.on('nodes:change', function(node) {
            if ( node.type === 'uibuilder') {
                uibuilder.log('[uibuilder] node changed:', node)
                uibuilder.urlsByNodeId[node.id] = node.url
            }
        })
        RED.events.on('nodes:remove', function(node) {
            if ( node.type === 'uibuilder') {
                uibuilder.log('[uibuilder] node removed: ', node)
                delete uibuilder.urlsByNodeId[node.id]
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
                console.group('[uibuilder] Settings:')
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

                    // List of the deployed uib instances [{node_id: url}]
                    `\n\nDeployed Instances (${Object.keys(RED.settings.uibuilderInstances).length}): `, RED.settings.uibuilderInstances,

                    `\n\nEditor Instances (${Object.keys(uibuilder.urlsByNodeId).length}, incl undeployed & disabled): `, uibuilder.urlsByNodeId,

                    `\n\nFE installed packages - (${Object.keys(uibuilder.packages).length}): `, uibuilder.packages
                )
                console.groupEnd()
            }, 1500)
        }
    }
}())
