/* eslint-disable class-methods-use-this */
/** Build UI elements by output of low-code JSON
 *
 * Copyright (c) 2023-2023 Julian Knight (Totally Information)
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

// REFERENCES
//

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').uibPackageJson} uibPackageJson
 */

// const { getSource } = require('../libs/uiblib')
// const { promisify } = require('util')

class UibLowCode {
    //#region --- Class vars ---
    /** PRIVATE Flag to indicate whether setup() has been run (ignore the false eslint error)
     * @type {boolean}
     */
    #isConfigured = false

    // #logUndefinedError = new Error('fs: this.log is undefined')
    // #uibUndefinedError = new Error('fs: this.uib is undefined')
    // #rootFldrNullError = new Error('fs: this.uib.rootFolder is null')

    //#endregion --- ----- ---

    // constructor() {} // ---- End of constructor ---- //

    /** Configure this class with uibuilder module specifics
     * @param {runtimeRED} RED uibuilder module-level configuration
     */
    setup( RED ) {
        if ( !RED ) throw new Error('[uibuilder:UibLowCode:setup] RED is not defined')

        // Prevent setup from being called more than once
        if ( this.#isConfigured === true ) {
            RED.log.warn('⚠️[uibuilder:UibLowCode:setup] Setup has already been called, it cannot be called again.')
            return
        }

        this.RED = RED
        this.log = RED.log

        this.#isConfigured = true
    } // ---- End of setup ---- //

    /** Create/update the _ui object and retain for replay
     * @param {*} msg incoming msg
     * @param {runtimeNode} node reference to node instance
     */
    async buildUi(msg, node) {

        // Allow combination of msg._ui and this node allowing chaining of the nodes
        if ( msg._ui ) {
            if (!Array.isArray(msg._ui)) msg._ui = [msg._ui]
            node._ui = msg._ui
        } else node._ui = []

        // If no mode specified, we assume the desire is to update (since a removal attempt with nothing to remove is safe)
        if ( msg.mode ) msg.mode = msg.mode.toLowerCase()
        else msg.mode = 'replace'

        // If mode is remove, then simply do that and return
        if ( msg.mode === 'delete' || msg.mode === 'remove' ) {
            if (!node.elementId) {
                node.warn('[uib-element:buildUi] Cannot remove element as no HTML ID provided')
                return
            }

            node._ui.push(
                {
                    'method': 'removeAll',
                    'components': [
                        `#${node.elementId}`,
                    ]
                }
            )
            return
        }

        // If no HMTL ID is specified & not removing, then always ADD
        if (!node.elementId) msg.mode = 'add'

        node._ui.push({
            'method': msg.mode === 'add' ? 'add' : 'replace',
            'components': [
                {
                    'type': node.tag,
                    'id': node.elementId,
                    'parent': node.parent,
                    'position': node.position,
                    'slot': node.slotPropMarkdown === false ? node.slotContent : undefined,
                    'slotMarkdown': node.slotPropMarkdown === true ? node.slotContent : undefined,
                    'attributes': node.attribs,
                },
            ]
        })
    } // -- end of buildUI -- //
} // ----- End of Class ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibLowCode = new UibLowCode()
module.exports = uibLowCode

// EOF
