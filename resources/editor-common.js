/** Common functions and data for UIBUILDER nodes
 * Load as: ./resources/node-red-contrib-uibuilder/editor-common.js
 * Note that RED is available here
 */

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').UibEditorCommon} UibEditorCommon
 */

// Register the plugin
RED.plugins.registerPlugin('uib-editor-plugin', {
    type: 'uibuilder-editor-plugin', // optional plugin type
    onadd: function() {
        let _dbg = false

        /** Add a "uibuilder" object to the Node-RED Editor
         * To contain common functions, variables and constants for UIBUILDER nodes
         * @type {UibEditorCommon}
         */
        const uibuilder = window['uibuilder'] = /** @type {UibEditorCommon} */ ({
            // Standard palette category for all uibuilder nodes
            paletteCategory: 'uibuilder',
            // Common node color for all uibuilder nodes - set in each node to avoid v4.1.7 custom var bug
            paletteColor: 'hsl(248 100% 91%)', // node-red v4.1.7 broke using custom var from plugin
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
            uibNodeTypes: [
                'uibuilder',
                'markweb',
                'uib-cache',
                'uib-element',
                'uib-file-list',
                'uib-html',
                'uib-save',
                'uib-sender',
                'uib-sidebar',
                'uib-tag',
                'uib-update'
            ],

            /** Wrapper for RED.notify
             * @param {string} msg Message to display
             * @param {string|object} opts Options object
             * @param {'info'|'compact'|'success'|'warning'|'error'} [opts.type] Panel type (default=info)
             * @param {boolean} [opts.modal] Modal dialog (default=false)
             * @param {boolean} [opts.fixed] Fixed position (default=false)
             * @param {number} [opts.timeout] Timeout (ms)
             * @param {number} [opts.btns] Number of buttons (1 or 2)
             */
            nrNotify: function nrNotify(msg, opts = {}) {
                if (typeof opts === 'string') opts = { type: opts, }
                if (!('modal' in opts)) {
                    opts.modal = false
                }
                if (opts.modal === true && !('fixed' in opts)) opts.fixed = true

                const myNote = RED.notify(`🌐UIBUILDER ${msg}`, {
                    type: 'info', // info, compact, success, warning, error
                    ...opts,
                    buttons: opts.fixed === true || opts.btns > 0
                        ? (opts.type === 'error') || (opts.btns === 1)
                            ? [
                                {
                                    text: 'Ok',
                                    class: 'primary',
                                    click: function(e) {
                                        myNote.close()
                                    },
                                },
                            ]
                            : [
                                {
                                    text: 'cancel',
                                    click: function(e) {
                                        myNote.close()
                                    },
                                },
                                {
                                    text: 'okay',
                                    class: 'primary',
                                    click: function(e) {
                                        myNote.close()
                                    },
                                },
                            ]
                        : [],
                })
            },

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

            /** Perform an API call to the admin v3 API - defaults to ASYNC, override with opt.async=false
             * @param {object} opt Options object
             * @param {'GET'|'POST'|'PUT'|'DELETE'} [opt.verb] HTTP verb to use (default='GET')
             * @param {'text'|'json'} [opt.dataType] Type of data expected in return (default='text')
             * @param {boolean=} opt.async Data to send (as query parameters)
             * @param {string=} opt.url uibuilder/markweb url (default='dummy')
             * @param {object=} opt.data Data to send (as query parameters)
             * @param {number=} opt.timeout API call timout in ms (default=500)
             * @param {boolean=} opt.fixErrNotify If true, unexpected API err notification is fixed on page (default=true)
             * @param {Function=} opt.done Function to call on successful call
             * @param {Function=} opt.fail Function to call on fail
             * @param {Function=} opt.always Optional function to run after success or fail
             */
            doAdminApiv3: function doAdminApiv3(opt) {
                // Make sure that the opt object has its defaults
                const verb = opt.verb || 'GET'
                const dataType = opt.dataType || 'text'
                const async = 'async' in opt ? opt.async : true
                const url = opt.url || 'dummy' // 'dummy' used where a real instance url isn't wanted
                const data = opt.data || {}
                const timeout = opt.timeout || 500
                const fixErrNotify = 'fixErrNotify' in opt ? opt.fixErrNotify : true
                // These are for async calls
                const done = opt.done || function() {}
                const fail = opt.fail || function() {}
                const always = opt.always || function() {}
                // These are for sync calls
                if (async === false && !opt.success) {
                    uibuilder.nrNotify(`"${data.cmd}" API call failed. success function not provided.`, { type: 'error', fixed: true, })
                    console.error(`🌐🛑[uibuilder:common:doAdminApiv3] "${data.cmd}" API call ERROR: success function not provided.`)
                    return
                }
                const success = opt.success || function() {}
                const error = opt.error || function() {}

                $.ajax({
                    url: './uibuilder/admin/' + url, // api v3
                    method: verb,
                    dataType: dataType,
                    async: async,
                    timeout: timeout,
                    // converted to URL query parameters
                    data: data,
                    beforeSend: function(jqXHR) {
                        const authTokens = RED.settings.get('auth-tokens')
                        if (authTokens) {
                            jqXHR.setRequestHeader('Authorization', 'Bearer ' + authTokens.access_token)
                        }
                    },
                    error: function(xhr, textStatus, err) {
                        if (xhr.status === 401) {
                            // Could be: not logged in, OR insufficient permissions
                            uibuilder.nrNotify(`"${data.cmd}" API call failed - insufficient authorisation`, { type: 'error', fixed: true, })
                            console.error(`🌐🛑[uibuilder:common:doAdminApiv3] "${data.cmd}" API call authorisation failure`, err)
                        } else if (err === 'Not Found') { // for checkfolder
                            // do nothing
                        } else {
                            uibuilder.nrNotify(`"${data.cmd}" API call failed. Status=${textStatus} (${xhr.status})`, { type: 'error', fixed: fixErrNotify, })
                            console.error(`🌐🛑[uibuilder:common:doAdminApiv3] "${data.cmd}" API call ERROR: ${textStatus} (${xhr.status})`, err)
                        }
                        // if (textStatus === 'timeout') {}
                        // Call the error function if provided
                        error(xhr, textStatus, err)
                    },
                    success: success,
                })
                    // .done(function(data, textStatus, jqXHR) {
                    .done(done)
                    // .fail(function(jqXHR, textStatus, errorThrown) {
                    .fail(fail)
                    .always(always)
            },

            /** SYNC Get all of the currently deployed uibuilder URL's & updates this.deployedUibInstances
             * NOTE that the uibuilder.editorUibInstances cannot be used as that includes disabled nodes/flows
             * See nodes/libs/admin-api-v3.cjs
             * @return {{string,string}} URLs by node id of deployed uibuilder nodes
             */
            getDeployedUrls: function getDeployedUrls() {
                // SYNC Call the npm installPackage v3 API (it updates the package list)
                this.doAdminApiv3({
                    verb: 'GET',
                    async: false,
                    dataType: 'json',
                    data: { // converted to URL query parameters
                        cmd: 'listinstances',
                    },
                    success: (instances) => {
                        this.deployedUibInstances = this.sortInstances(instances)
                        // Also pre-populate the editorUibInstances to avoid the problem that
                        // that list is built too late during Editor load
                        if (Object.keys(this.editorUibInstances).length === 0) this.editorUibInstances = this.deployedUibInstances
                        // uibuilder.log('🌐[uibuilder] Deployed Instances >>', instances, this )
                    },
                })
                return this.deployedUibInstances
            },
            /** Sort an instances object by url instead of the natural order added
             * @param {*} instances The instances object to sort
             * @return {*} instances sorted by url
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
            /** Ensure that a UIB "url" is a valid and safe url path
             * Rejects path traversal, spaces, %, query params, # fragments, leading /, empty paths, absolute urls
             * @param {string} urlPath The url path to sanitise
             * @return {string|null} The sanitised url or null if path is invalid
             */
            sanitiseUrl: function sanitiseUrl(urlPath) {
                if ( !urlPath || typeof urlPath !== 'string' || urlPath.length > 255 || !/^[a-z\d_-]+(?:\/[a-z\d_-]+)*$/i.test(urlPath) ) {
                    console.error(`🌐🛑[uibuilder:sanitiseUrl] Invalid URL path "${urlPath}"`)
                    // throw new Error('Invalid URL path')
                    return null
                }
                return urlPath.trim()
            },
        })

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

        /** SYNC Get initial list of installed FE packages via v3 API - save to master list */
        uibuilder.doAdminApiv3({
            verb: 'GET',
            async: false,
            dataType: 'json',
            data: { // converted to URL query parameters
                cmd: 'getLibraries',
            },
            success: (vendorPaths) => {
                uibuilder.packages = vendorPaths
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
                RED.events.emit('UIBUILDER/node-added', node)
                // -- IF uibuilderInstances <> editorInstances THEN there are undeployed instances. OR Disabled nodes/flows --

                // uibuilder.log('🌐[uibuilder] node added:', node)
            }
        })
        RED.events.on('nodes:change', function(node) {
            if ( node.type === 'uibuilder') {
                // Update list
                if (node.url) uibuilder.editorUibInstances[node.id] = node.url
                else delete uibuilder.editorUibInstances[node.id]
                // Inform interested functions that something was changed
                RED.events.emit('UIBUILDER/node-changed', node)

                uibuilder.log('🌐[uibuilder] node changed:', node)
            }
        })
        RED.events.on('nodes:remove', function(node) {
            if ( node.type === 'uibuilder') {
                // update list
                delete uibuilder.editorUibInstances[node.id]
                // Inform interested functions that something was deleted
                RED.events.emit('UIBUILDER/node-deleted', node)

                uibuilder.log('🌐[uibuilder] node removed: ', node)
            }
        })
        // RED.events.on('deploy', function() {
        //     console.log('🌐[uibuilder] Deployed')
        // })
        // RED.events.on('workspace:dirty', function(data) {
        //     console.log('🌐[uibuilder] Workspace dirty:', data)
        // })
        // RED.events.on('runtime-state', function(event) {
        //     console.log('🌐[uibuilder] Runtime State:', event)
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
                    RED.notify('🌐 No IDE URL set for this uibuilder node', 'error')
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

        // Check if the user has seen this version before - if not, show the changes - See nodes/libs/admin-api-v3.cjs
        const isSeen = localStorage.getItem('uibuilder.lastSeenVersion') || 'none'
        if (isSeen !== RED.settings.uibuilderCurrentVersion) {
            // Get the contents of the changelog-highlights.md file and log to console
            uibuilder.doAdminApiv3({
                verb: 'GET',
                dataType: 'text',
                data: {
                    cmd: 'getChangeSummary',
                },
                done: (data) => {
                    // Get the version from the frontmatter
                    const frontmatterMatch = data.match(/^---\s*\n([\s\S]*?)\n---/)
                    if (frontmatterMatch) {
                        const frontmatter = frontmatterMatch[1]
                        const versionMatch = frontmatter.match(/version:\s*['"]?([^'"\n]+)['"]?/)
                        if (versionMatch) {
                            // Delay for 5 seconds to let the Editor completely load
                            setTimeout(() => {
                                const version = versionMatch[1]
                                uibuilder.log('🌐[uibuilder] Highlights frontmatter version:', version)
                                // If the version is not the same as the current version, don't show anything
                                if (version !== RED.settings.uibuilderCurrentVersion) return
                                // Remove the frontmatter from the data & display the remainder in a node-red notification
                                const changelog = RED.utils.renderMarkdown(data.replace(frontmatterMatch[0], '').trim())
                                uibuilder.nrNotify(
                                    `has been updated to version ${version}\n${changelog}`,
                                    {
                                        type: 'info',
                                        modal: true,
                                        fixed: true,
                                        btns: 1,
                                    }
                                )
                                console.info(`🌐[uibuilder] Welcome to uibuilder version ${version} - this is your first view`)
                                localStorage.setItem('uibuilder.lastSeenVersion', RED.settings.uibuilderCurrentVersion)
                            }, 5000)
                        }
                    }
                },
            })
        }

        // #region --- Add Monaco type declarations for RED.util.uib ---
        // ! NOTE: See the uib-runtime-plugin.js file for the actual implementations of these functions. If updating one, update the other.
        /** Wait for Monaco to be available then inject RED.util.uib type declarations
         * so function nodes get IntelliSense for uibuilder server-side utilities.
         * Uses Object.defineProperty to detect when window.monaco is assigned, with
         * a polling fallback in case the property is non-configurable.
         */
        ;(function addUibMonacoTypes() { // eslint-disable-line @stylistic/no-extra-semi
            const typeDeclarations = `
                declare namespace RED {
                    namespace util {
                        /** uibuilder server-side utilities available in function nodes */
                        namespace uib {
                            /** Recursive object deep find
                             * @param obj The object to be searched
                             * @param matcher If returns true, cb(obj) is called
                             * @param cb Callback receiving the matching object
                             */
                            function deepObjFind(obj: any, matcher: (obj: any) => boolean, cb: (obj: any) => void): void
                            /** Format a number to a given locale and decimal places
                             * @param inp Input number
                             * @param dp Decimal places (default=1)
                             * @param locale Locale string (default='en-GB')
                             */
                            function dp(inp: number, dp?: number, locale?: string): string
                            /** Returns true/false or a default for truthy/falsy inputs
                             * @param val The value to test
                             * @param deflt Default if value is neither truthy nor falsy
                             */
                            function truthy(val: string | number | boolean | any, deflt?: any): boolean | any
                            /** Return a list of all deployed uibuilder instances */
                            function listAllApps(): object
                            /** Send a message to a specific uibuilder instance
                             * @param uibName The URL name of the target uibuilder instance
                             * @param msg Message to send to the front-end
                             */
                            function send(uibName: string, msg: object): void
                            /** Render data to an HTML string using the json-viewer component renderer
                             * @param data Any JavaScript value to render
                             * @param opts Rendering options
                             * @returns HTML string representing the data tree
                             */
                            function renderToHTML(data: any, opts?: {
                                /** Maximum auto-expand depth (default=2) */
                                maxDepth?: number
                                /** Start all nodes collapsed (default=false) */
                                collapsed?: boolean
                                /** Allow scalar leaf values to be edited (default=false) */
                                editable?: boolean
                                /** Include search/collapse controls (default=false) */
                                interactive?: boolean
                                /** Embed component CSS in output (default=true) */
                                includeStyles?: boolean
                            }): string
                            /** Safer JSON.stringify with circular reference handling */
                            function saferSerialize(data: any): string
                        }
                    }
                }
            `

            /** Inject the type declarations into Monaco for RED.util.uib as soon as Monaco is available,
             * so that function nodes get IntelliSense for uibuilder server-side utilities.
             */
            function inject() {
                // Seems to have moved with NR v5.0.9
                let javascriptDefaults
                if (window.monaco.languages.typescript) { // Prior to NR v5.0.9
                    javascriptDefaults = window.monaco.languages.typescript.javascriptDefaults
                } else { // NR v5.0.9+
                    javascriptDefaults = window.monaco.typescript.javascriptDefaults
                }
                javascriptDefaults.addExtraLib(
                    typeDeclarations,
                    'file://types/uibuilder/uib-util.d.ts'
                )
            }

            if (window.monaco) {
                inject()
                return
            }
            try {
                Object.defineProperty(window, 'monaco', {
                    configurable: true,
                    enumerable: true,
                    set(value) {
                        Object.defineProperty(window, 'monaco', {
                            configurable: true,
                            writable: true,
                            enumerable: true,
                            value,
                        })
                        inject()
                    },
                })
            } catch(_) {
                // Property is non-configurable; fall back to polling
                const t = setInterval(() => {
                    if (window.monaco) {
                        clearInterval(t)
                        inject()
                    }
                }, 500)
            }
        })()
        // #endregion ---- ---- ----

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
