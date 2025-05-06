/* eslint-disable jsdoc/valid-types */
/**
 * Copyright (c) 2024-2025 Julian Knight (Totally Information)
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
 */

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
}

/** Called when the plugin is added to the editor */
function onAdd() {
    if ( mod.RED === null ) return
    const RED = mod.RED

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

        // WARNING: Plugins are defined EARLY so they won't have access to the uibuilder library/startup data yet
        //          So some plugins are defined in the base uibuilder node instead.

        // In case another plugin defines more of these and is processed first
        ...RED.util.uib,
    }
}

/** 1) The function that defines the plugin
 * @param {runtimeRED} RED Node-RED's runtime object
 */
function pluginDefinition(RED) {
    // Save a reference to the RED object so we can access it in other functions
    mod.RED = RED

    RED.plugins.registerPlugin('uib-runtime-plugin', {
        type: 'uibuilder-runtime-plugin', // optional plugin type
        onadd: onAdd,
    })
}

// Export the plugin definition (1), this is consumed by Node-RED on startup.
module.exports = pluginDefinition
