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

/** @type {uibConfig} The uibuilder global configuration object, used throughout all nodes and libraries. */
const uib = require('./libs/uibGlobalConfig.cjs')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
// const mod = {
//     /** @type {runtimeRED|undefined} Reference to the master RED instance */
//     RED: undefined,
// }

/** Called when the plugin is added to the editor - is passed the RED global object */
function onAdd() {
    if ( uib.RED === null ) return
    const RED = uib.RED

    // Add some uibuilder specific utility functions to RED.util so they can be used inside function nodes
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

        // TODO: Now we have the uib global config, we can move the plugins from the base node to here
        /** Return a list of all instances
         * @returns {object} List of all registered uibuilder instances
         */
        listAllApps: () => {
            return uib.apps
        },

        // In case another plugin defines more of these and is processed first
        ...RED.util.uib,
    }
}

/** 1) The function that defines the plugin
 * @param {runtimeRED} RED Node-RED's runtime object
 */
function pluginDefinition(RED) {
    // Save a reference to the RED object so we can access it in other functions
    uib.RED = RED
    // Save reference to the uibuilder root folder
    uib.rootFolder = path.join(RED.settings.userDir, uib.moduleName)
    // Record the httpNodeRoot for later use
    uib.nodeRoot = RED.settings.httpNodeRoot

    // Get and record uibuilder settings from settings.js into the `uib` master object - these apply to all instances of uibuilder & Markweb
    if ( RED.settings.uibuilder ) {
        const settings = RED.settings.uibuilder
        // Change the root folder
        if ( settings.uibRoot && typeof settings.uibRoot === 'string') {
            uib.rootFolder = settings.uibRoot
        }
        // Get web-relavent uibuilder settings from settings.js
        uib.customServer.port = Number(RED.settings.uiPort)
        // Note the system host name
        uib.customServer.hostName = require('os').hostname()
        /** HTTP(s) port. If set & different to node-red, uibuilder will use its own ExpressJS server */
        // @ts-ignore - deliberately allowing string/number comparison
        if ( settings.port && settings.port != RED.settings.uiPort) {
            uib.customServer.isCustom = true
            uib.customServer.port = Number(settings.port)
            // Override the httpNodeRoot setting, has to be empty string. Use reverse proxy to change instead if needed.
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
            uib.customServer.contentSecurityPolicy = Object.assign(uib.customServer.contentSecurityPolicy, settings.contentSecurityPolicy)
        }
    }

    /** Locations for uib config can common folders */
    uib.configFolder = path.join(uib.rootFolder, uib.configFolderName)
    uib.commonFolder = path.join(uib.rootFolder, uib.commonFolderName)

    // @ts-ignore Are Node-RED projects enabled?
    if ( RED.settings?.editorTheme?.projects?.enabled === true ) {
        // @ts-ignore If so, we need the root to be relative to the project folder
        const currProject = RED.settings?.editorTheme?.projects?.activeProject ?? ''
        if ( currProject !== '' ) {
            uib.rootFolder = path.join(RED.settings.userDir, 'projects', currProject, uib.moduleName)
        }
    }

    RED.plugins.registerPlugin('uib-runtime-plugin', {
        type: 'uibuilder-runtime-plugin', // optional plugin type
        onadd: onAdd,
    })

    let initialised = false
    RED.events.on('runtime-event', function(event) {
        if (event.id === 'runtime-state' && initialised === false ) {
            initialised = true
            const myroot = uib.nodeRoot === '' ? '/' : uib.nodeRoot
            RED.log.info('+-----------------------------------------------------')
            RED.log.info(`| 🌐 ${uib.moduleName} v${uib.version} initialised`)
            RED.log.info(`| root folder: ${uib.rootFolder}`)
            if ( uib.customServer.isCustom === true ) {
                RED.log.info('| Using custom ExpressJS webserver at:')
                RED.log.info(`|   ${uib.customServer.type}://${uib.customServer.host}:${uib.customServer.port}${uib.nodeRoot} or ${uib.customServer.type}://localhost:${uib.customServer.port}${myroot}`)
            } else {
                RED.log.info('| Using Node-RED\'s webserver at:')
                RED.log.info(`|   ${RED.settings.https ? 'https' : 'http'}://${RED.settings.uiHost}:${RED.settings.uiPort}${myroot}`)
            }
            RED.log.info('+-----------------------------------------------------')
        }
    })
}

// Export the plugin definition (1), this is consumed by Node-RED on startup.
module.exports = pluginDefinition
