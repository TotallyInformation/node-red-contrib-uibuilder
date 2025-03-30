/** An example template for Node-RED custom nodes
 *
 * Copyright (c) 2025-2025 Julian Knight (Totally Information)
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
 */

//#region ----- Module level variables ---- //

// Uncomment this if you want to use the promisified version of evaluateNodeProperty
// const { promisify } = require('util')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    // evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-sidebar',
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    // Save a ref to a promisified version to simplify async callback handling
    // mod.evaluateNodeProperty = promisify(mod.RED.util.evaluateNodeProperty)

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & tiTemplateNode} config The Node-RED node instance config object
 * @this {runtimeNode & tiTemplateNode}
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
    this.html = config.html ?? ''
    // this.topic = config.topic ?? ''

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    RED.log.trace(`📊 [uib-sidebar] Listening for posts to /uibuilder/sidebarui/${this.id}`)
    RED.httpAdmin.post(`/uibuilder/sidebarui/${this.id}`, (req, res) => {
        RED.log.trace(`📊 [uib-sidebar] POST request for /uibuilder/sidebarui/${this.id}`, req.body)
        // res.status(200).send( { 'response': 'ok', 'id': this.id } )
        res.status(200).json( { 'response': 'ok', 'id': this.id } )
        this.send({
            ...req.body
        })
    })
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & tiTemplateNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // const RED = mod.RED

    // Pass straight through
    // send(msg)

    sendToEditor(this, msg)

    // We are done - not really needed probably
    done()
}

function sendToEditor(node, msg) {
    const RED = mod.RED
    RED.log.trace(`📊 [uib-sidebar] Sending to editor for ${node.id}`, msg, )
    RED.events.emit('runtime-event', {
        id: `uibuilder/uib-sidebar/${node.id}`,
        retain: false,
        payload: {
            srcId: node.id,
            ...msg,
        },
    })
}

//#endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
