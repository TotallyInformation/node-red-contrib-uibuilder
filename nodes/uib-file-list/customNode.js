/** Send an update to a specific front-end element.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2024-2024 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs - should help with coding ---
 * @typedef {import('../../typedefs').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs').uibFileListNode} uibFileListNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const fslib  = require('../libs/fs.cjs')   // File/folder handling library (by Totally Information)
// const uiblib = require('../libs/uiblib')  // Utility library for uibuilder
const { setNodeStatus } = require('../libs/uiblib.cjs')  // Utility library for uibuilder

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-file-list',
}

//#endregion ----- Module level variables ---- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance, {
        // Makes these available to the editor as RED.settings.uibuilderxxxxxx
        settings: {
            // Tell the Editor where the uibuilder Root folder is
            uibFileListRootFolder: { value: fslib.uibRootFolder, exportable: true },
            // The server's NODE_ENV environment var (e.g. PRODUCTION or DEVELOPMENT)
            // uibuilderNodeEnv: { value: process.env.NODE_ENV, exportable: true },
            // Custom server details
            // uibuilderCustomServer: { value: (uib.customServer), exportable: true },
        }
    })
}

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibFileListNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibFileListNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED
    if (RED === null) return

    // @ts-ignore Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name ?? ''
    this.topic = config.topic ?? ''
    this.url = config.url ?? ''
    this.uibId = config.uibId ?? ''
    this.folder = config.folder ?? ''
    // @ts-ignore
    this.filter = config.filter ? config.filter.split(',') : []
    this.exclude = config.exclude ?? ''
    this.urlOut = config.urlOut ?? true
    this.live = config.live ?? true
    this.fullPrefix = config.fullPrefix ?? true

    if (this.url === '' || this.uibId === '') {
        this.error(`No uibuilder instance provided, cannot continue. url = '${this.url}'`)
        return
    }

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)
} // ---- End of nodeInstance ---- //

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibFileListNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // const RED = mod.RED

    msg.payload = await fslib.searchInstance(this.uibId, this.live, this.filter, this.exclude, this.urlOut, this.fullPrefix)

    this.statusDisplay = { fill: 'blue', shape: 'dot', text: `Found: ${msg.payload.length}` }
    setNodeStatus( this )

    if (this.topic) msg.topic = this.topic

    send(msg)

    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
