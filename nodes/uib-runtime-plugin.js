/* eslint-disable jsdoc/valid-types */
/**
 * Copyright (c) 2024-2026 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../typedefs.js').uibConfig} uibConfig
 */

const path = require('node:path')

const { saferSerialize, } = require('./libs/tilib.cjs') // Safer JSON.stringify with circular reference handling
// const { parseTelemetryFile, } = require('./libs/uiblib.cjs')
const fslib = require('./libs/fs.cjs') // File/folder handling library (by Totally Information)
const packageMgt = require('./libs/package-mgt.cjs')
const web = require('./libs/web.cjs')
const sockets = require('./libs/socket.cjs')
const { renderToHTML, } = require('../front-end/utils/json-viewer.cjs')

// WARNING: Don't try to deconstruct this, if you do, some things fail because they lose the correct `this` binding
const uiblib = require('./libs/uiblib.cjs')

/** @type {uibConfig} The uibuilder global configuration object, used throughout all nodes and libraries. */
const uib = require('./libs/uibGlobalConfig.cjs')

/** Set up the global uibuilder configuration
 * @param {runtimeRED} RED Node-RED's runtime object
 */
function setupUibGlobalConfig(RED) {
    // Save a reference to the RED object so we can access it in other functions
    uib.RED = RED
    // Record the httpNodeRoot for later use
    uib.nodeRoot = RED.settings.httpNodeRoot

    // Get and record uibuilder settings from settings.js into the `uib` master object - these apply to all instances of uibuilder & Markweb
    if ( RED.settings.uibuilder ) {
        const settings = RED.settings.uibuilder
        // Change the root folder - moved to setupUibFs()
        // Get web-relavent uibuilder settings from settings.js
        uib.customServer.port = Number(RED.settings.uiPort)
        // Note the system host name
        uib.customServer.hostName = require('os').hostname()
        /** HTTP(s) port. If set & different to node-red, uibuilder will use its own ExpressJS server */
        // @ts-ignore - deliberately allowing string/number comparison
        if ( settings.port && settings.port != RED.settings.uiPort) {
            uib.customServer.isCustom = true
            uib.customServer.port = Number(settings.port)
            // Override the httpNodeRoot setting, has to be empty string for custom server. Use reverse proxy to change instead if needed.
            uib.nodeRoot = ''
        }
        // http, https or http2 (default=http)
        if ( RED.settings.https ) uib.customServer.type = 'https'
        if ( settings.customType ) uib.customServer.type = settings.customType
        // Allow instance-level api's to be loaded (default=false)
        if ( settings.instanceApiAllowed === true ) uib.instanceApiAllowed = true
        // Allow custom ExpressJS server options to be set in settings.js
        if ( settings.serverOptions ) {
            uib.customServer.serverOptions = Object.assign(uib.customServer.serverOptions, settings.serverOptions)
        }
        // Allow override of the default Content Security Policy (CSP) header for uibuilder ExpressJS routes.
        if ( settings.contentSecurityPolicy ) {
            uib.customServer.contentSecurityPolicy = settings.contentSecurityPolicy
        }
        // Allow override of the telemetry service
        if ( settings.telemetryEnabled && typeof settings.telemetryEnabled === 'boolean' ) {
            uib.telemetryEnabled = settings.telemetryEnabled
        }
    }
}

/** Set up the uibuilder global filing system config, checking permissions and initialising the fs class */
function setupUibFs() {
    const RED = uib.RED

    // Save reference to the default uibuilder root folder location (may be overridden by settings.js or project root)
    uib.rootFolder = path.join(RED.settings.userDir, uib.moduleName)

    // Allow to be overridden by settings.js
    if ( RED.settings?.uibuilder?.uibRoot && typeof RED.settings.uibuilder.uibRoot === 'string') {
        uib.rootFolder = RED.settings.uibuilder.uibRoot
    } else {
        // @ts-ignore Are Node-RED projects enabled? Only apply if no explicit uibRoot override was set in settings.js
        if ( RED.settings?.editorTheme?.projects?.enabled === true ) {
            // @ts-ignore If so, we need the root to be relative to the project folder
            const currProject = RED.settings?.editorTheme?.projects?.activeProject ?? ''
            if ( currProject !== '' ) {
                uib.rootFolder = path.join(RED.settings.userDir, 'projects', currProject, uib.moduleName)
            }
        }
    }

    /** Locations for uib config can common folders */
    uib.configFolder = path.join(uib.rootFolder, uib.configFolderName)
    uib.commonFolder = path.join(uib.rootFolder, uib.commonFolderName)

    // Check that the Node-RED userDir folder is writable - completely error if not
    try {
        fslib.accessSync( RED.settings.userDir, 'rw' ) // try to access read/write
        RED.log.trace(`🌐[uibuilder:runtimeSetup] uibRoot folder is read/write accessible. ${RED.settings.userDir}`)
    } catch (e) {
        throw new Error(`🌐🛑[uibuilder:runtimeSetup] UIBUILDER cannot be configured,\n  Node-RED userDir folder "${RED.settings.userDir}" is not writable.`, e)
    }

    // (a) Configure the UibFs handler class (requires uib.RED - now using the uibGlobalConfig module)
    fslib.setup(uib) // Cannot required uib in fs module as it creates a circular dependency

    // #region ----- Set up uibuilder root, root/.config & root/common folders ----- //

    /** Check uib root folder: create if needed, writable? */
    let uibRootFolderOK = true
    // Try to create root and root/.config - ignore error if it already exists
    try {
        fslib.ensureDirSync(uib.configFolder) // creates both folders
        RED.log.trace(`🌐[uibuilder[:runtimeSetup] uibRoot folder exists. ${uib.rootFolder}` )
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`🌐🛑[uibuilder:runtimeSetup] Custom folder ERROR, path: ${uib.rootFolder}. ${e.message}`)
            uibRootFolderOK = false
        }
    }
    // Try to access the root folder (read/write) - if we can, create and serve the common resource folder
    try {
        fslib.accessSync( uib.rootFolder, 'rw' ) // try to access read/write
        RED.log.trace(`🌐[uibuilder[:runtimeSetup] uibRoot folder is read/write accessible. ${uib.rootFolder}` )
    } catch (e) {
        RED.log.error(`🌐🛑[uibuilder:runtimeSetup] Root folder is not accessible, path: ${uib.rootFolder}. ${e.message}`)
        uibRootFolderOK = false
    }
    // Assuming all OK, copy over the master .config folder without overwriting (vendor package list, middleware)
    if (uibRootFolderOK === true) {
        // We want to always overwrite the .config template files
        const fsOpts = { overwrite: true, preserveTimestamps: true, recursive: true, }
        try {
            fslib.copySync( path.join( uib.masterTemplateFolder, uib.configFolderName ), uib.configFolder, fsOpts)
            RED.log.trace(`🌐[uibuilder:runtimeSetup] Copied template .config folder to local .config folder ${uib.configFolder} (not overwriting)` )
        } catch (e) {
            RED.log.error(`🌐🛑[uibuilder:runtimeSetup] Master .config folder copy ERROR, path: ${uib.masterTemplateFolder}. ${e.message}`)
            uibRootFolderOK = false
        }

        // and copy the common folder from template (contains the default blue node-red icon)
        fsOpts.overwrite = false // we don't want to overwrite any common folder files
        try {
            fslib.copyCb( path.join( uib.masterTemplateFolder, uib.commonFolderName ) + '/', uib.commonFolder + '/', fsOpts, function(err) {
                if (err) {
                    RED.log.error(`🌐🛑[uibuilder:runtimeSetup] Error copying common template folder from ${path.join( uib.masterTemplateFolder, uib.commonFolderName)} to ${uib.commonFolder}. ${err.message}`, err)
                } else {
                    RED.log.trace(`🌐[uibuilder:runtimeSetup] Copied common template folder to local common folder ${uib.commonFolder} (not overwriting)` )
                }
            })
        } catch (e) {
            // should never happen
            RED.log.error(`🌐🛑[uibuilder:runtimeSetup] COPY OF COMMON FOLDER FAILED. ${e.message}`)
        }
        // It is served up at the instance level to allow caching to be configured. It is used as a static resource folder (added in nodeInstance() so available for each instance as `./common/`)
    }
    // If the root folder setup failed, throw an error and give up completely
    if (uibRootFolderOK !== true) {
        throw new Error(`[uibuilder:runtimeSetup] Failed to set up uibuilder root folder structure correctly. Check log for additional error messages. Root folder: ${uib.rootFolder}.`)
    }

    // #endregion ----- root folder ----- //
}

/** Called when the plugin is added to the editor - is passed the RED global object */
function onAdd() {
    if ( uib.RED === null ) return
    const RED = uib.RED

    // Add some uibuilder specific utility functions to RED.util so they can be used inside function nodes
    // ! NOTE: If updating these, also update the TypeScript defs in editor-common.js.
    RED.util.uib = {
        /** Recursive object deep find
         * @param {*} obj The object to be searched
         * @param {Function} matcher Function that, if returns true, will result in cb(obj) being called
         * @param {Function} cb Callback function that takes a single arg `obj`
         */
        deepObjFind: (obj, matcher, cb) => {
            if (matcher(obj)) {
                cb(obj)
            }
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    RED.util.uib.deepObjFind(obj[key], matcher, cb)
                }
            }
        },

        /** Format a number to a given locale and decimal places
         * @param {number} inp Input number
         * @param {number} dp Number of output decimal places required (default=1)
         * @param {string} int Locale to use for number format (default=en-GB)
         * @returns {string} Formatted number as a string
         */
        dp: (inp, dp = 1, int = 'en-GB') => {
            return inp.toLocaleString(int, { minimumFractionDigits: dp, maximumFractionDigits: dp, })
        },

        /** Return a list of all instances
         * @returns {object} List of all registered uibuilder instances
         */
        listAllApps: () => {
            return uib.apps
        },

        /** Render a JavaScript value to an HTML string using the json-viewer component's pure renderer.
         * The returned HTML includes optional embedded styles and a structured tree representation.
         * @param {*} data The data to render (any JavaScript value)
         * @param {object} [opts] Rendering options
         * @param {number} [opts.maxDepth] Maximum auto-expand depth. Default=2
         * @param {boolean} [opts.collapsed] Whether all nodes start collapsed. Default=false
         * @param {boolean} [opts.editable] Whether scalar leaf values are editable. Default=false
         * @param {boolean} [opts.interactive] Whether to include search/collapse controls. Default=false
         * @param {boolean} [opts.includeStyles] Whether to embed the component CSS. Default=true
         * @returns {string} An HTML string representing the data tree
         */
        renderToHTML: (data, opts = {}) => renderToHTML(data, opts),

        /** Send a message to a specific uibuilder instance
         * @param {string} uibName The name (url) of the uibuilder instance to send via
         * @param {object} msg Message object to send to the front-end
         */
        send: (uibName, msg) => {
            const targetNode = RED.nodes.getNode(uib.apps[uibName]?.node)
            if ( !targetNode ) {
                throw new Error(`🌐🛑[RED.util.uib.send] ERROR: uibuilder instance '${uibName}' not found`)
            }
            msg.from = 'server/function-node'
            sockets.sendToFe2(msg, targetNode)
        },

        /** Safer JSON.stringify with circular reference handling
         * @param {*} obj The object to serialize
         * @param {number} [space] Number of spaces for indentation (default=2)
         * @returns {string} JSON string
         */
        saferSerialize: saferSerialize,

        /** Returns true/false or a default value for truthy/falsy and other values
         * @param {string|number|boolean|*} val The value to test
         * @param {any} deflt Default value to use if the value is not truthy/falsy
         * @returns {boolean|any} The truth! Or the default
         */
        truthy: (val, deflt) => {
            let ret
            if (['on', 'On', 'ON', 'true', 'True', 'TRUE', '1', true, 1].includes(val)) ret = true
            else if (['off', 'Off', 'OFF', 'false', 'False', 'FALSE', '0', false, 0].includes(val)) ret = false
            else ret = deflt
            return ret
        },

        // In case another plugin defines more of these and is processed first
        ...RED.util.uib,
    }
}

/** 1) The function that defines the plugin - we also set up the uibuilder global config and root folder here.
 * @param {runtimeRED} RED Node-RED's runtime object
 */
function pluginDefinition(RED) {
    RED.log.trace('🌐[uibuilder:runtimeSetup] ----------------- global config started -----------------')
    setupUibGlobalConfig(RED)

    /** (a) Filing system checks and library setup */
    setupUibFs()

    /** (b) Do this before doing the web setup so that the packages can be served but after the folder/file setup */
    packageMgt.setup()

    /** (c) We need an ExpressJS web server to serve the page, socket.io and vendor packages. */
    web.setup()

    /** (d) Pass web server reference to the Socket.IO handler module */
    sockets.setup(web.server)

    // For a custom web server only: Catch SIGINT and close the server and any active connections
    if ( uib.customServer.isCustom === true ) {
        process.on('SIGINT', () => {
            RED.log.info(`🌐[uibuilder:runtimeSetup] Caught SIGINT, shutting down custom server and socket.io gracefully...`)
            sockets.io.sockets.sockets.forEach((socket) => {
                socket.disconnect(true)
            })
            if ( web.connections.size > 0 ) {
                RED.log.info(`🌐[uibuilder:runtimeSetup] Force-closing active connections: ${web.connections.size}`)
                for (const socket of web.connections) {
                    socket.destroy()
                    web.connections.delete(socket)
                }
            }
            // web.server.close(() => {
            //     RED.log.info('🌐[uibuilder:runtimeSetup] Custom server closed')
            // })
        })
    }

    // May as well register this plugin now.
    RED.plugins.registerPlugin('uib-runtime-plugin', {
        type: 'uibuilder-runtime-plugin', // optional plugin type
        onadd: onAdd,
    })

    // Show the base uibuilder config on startup in the log
    let initialised = false
    // RED.events.on('runtime-event', function(event) {
    //     if (event.id === 'runtime-state' && initialised === false ) {
    //         initialised = true
    //     }
    // })
    RED.events.on('flows:started', async function(event) {
        // Parse the telemetry file to load the telemetry data into the global uib object
        // (ensures the file exists & sends data to cloudflare if needed)
        // NB: Runs every time the flows are (re)started
        await uiblib.parseTelemetryFile()

        if (initialised === false ) { // make sure we only log this once, not on every deploy (flows:started is emitted on every deploy)
            initialised = true
            const myroot = uib.nodeRoot === '' ? '/' : uib.nodeRoot
            RED.log.info('+-----------------------------------------------------')
            RED.log.info(`| 🌐 ${uib.moduleName} v${uib.version} initialised`)
            RED.log.info(`| root folder: ${uib.rootFolder}`)
            RED.log.info(`| Telemetry: ${uib.telemetryEnabled === true ? `On, uuid: ${uib.telemetry?.uuid}` : 'Off'}`)
            if ( uib.customServer.isCustom === true ) {
                RED.log.info('| Using custom ExpressJS webserver at:')
                RED.log.info(`|   ${uib.customServer.type}://${uib.customServer.host}:${uib.customServer.port}${uib.nodeRoot} or ${uib.customServer.type}://localhost:${uib.customServer.port}${myroot}`)
            } else {
                RED.log.info('| Using Node-RED\'s webserver at:')
                RED.log.info(`|   ${RED.settings.https ? 'https' : 'http'}://${RED.settings.uiHost}:${RED.settings.uiPort}${myroot}`)
            }
            RED.log.info(`| Instances: ${uib.telemetry?.uib_count} uibuilder, ${uib.telemetry?.markweb_count} markweb`)
            const pkgs = Object.keys(packageMgt.uibPackageJson.uibuilder.packages)
            RED.log.info('| Installed packages:')
            if (pkgs.length === 0) {
                RED.log.info('|   No packages installed')
            } else {
                for (let i = 0; i < pkgs.length; i += 4) {
                    const k = []
                    for (let j = 0; j <= 3; j++) {
                        if ( pkgs[i + j] ) k.push(pkgs[i + j])
                    }
                    RED.log.info(`|   ${k.join(', ')}`)
                }
            }
            RED.log.info('+-----------------------------------------------------')
        }
    })
    RED.log.trace('🌐[uibuilder:runtimeSetup] ----------------- global config complete -----------------')
    RED.events.emit('UIBUILDER/runtimeSetupComplete', uib)
}

// Export the plugin definition (1), this is consumed by Node-RED on startup.
module.exports = pluginDefinition
