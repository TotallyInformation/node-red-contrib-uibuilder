/** Takes a msg input and sends it to the chosen uibuilder instance
 *  Destructured to make for easier and more consistent logic.
 *
 * Copyright (c) 2021-2023 Julian Knight (Totally Information)
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

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs.js').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs.js').senderNode1} senderNode
 * typedef {import('../typedefs.js').myNode} myNode
 */

//#region ----- Module level variables ---- //

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|null} Reference to the master RED instance */
    RED: null,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-sender',
    /** */
    useEvents: true,
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function EventOut(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    /** Register a new instance of the specified node type (2)
     *
     */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & senderNode} config The Node-RED node instance config object
 * @this {runtimeNode & senderNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED

    // Create the node instance - `this` can only be referenced AFTER here
    // @ts-ignore
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name
    this.topic = config.topic || ''
    this.passthrough = config.passthrough
    /** Allow return events? */
    this.return = config.return
    this.url = config.url || ''
    this.uibId = config.uibId || ''

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    const eventSender = (msg) => {
        this.send(msg)
    }

    /** If returns allowed, set up the return event listener */
    if ( this.return === true ) {
        RED.events.on(`UIBUILDER/return-to-sender/${this.id}`, eventSender)
    }

    /** Put things here if you need to do anything when a node instance is removed
     * Or if Node-RED is shutting down.
     * Note the use of an arrow function, ensures that the function keeps the
     * same `this` context and so has access to all of the node instance properties.
     */
    this.on('close', (removed, done) => {
        // Cancel any event listeners for this node
        RED.events.off(`UIBUILDER/return-to-sender/${this.id}`, eventSender)

        done()
    })

    /** Properties of `this`
     * Methods: updateWires(wires), context(), on(event,callback), emit(event,...args), removeListener(name,listener), removeAllListeners(name), close(removed)
     *          send(msg), receive(msg), log(msg), warn(msg), error(logMessage,msg), debug(msg), trace(msg), metric(eventname, msg, metricValue), status(status)
     * Other: credentials, id, type, z, wires, x, y
     * + any props added manually from config, typically at least name and topic
     */
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 */
function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - or just use mod.RED if you prefer:
    const RED = mod.RED

    if (this.topic !== '') msg.topic = this.topic

    // NOTE: Several ways to do this.
    //  1) Most direct would be to directly ref the uibuilder node via RED.nodes - but this is tight coupling
    //  2) 2nd most direct would be to use global uibsockets ref - but this is also fairly tight coupling
    //  3) Least coupling is to use RED.events

    if ( mod.useEvents === false && global['totallyInformationShared'] ) {
        this.warn('⚠️ [uib-sender] Using deprecated message handler - please let @totallyinformation know')
        // TODO DEPRECATE this part
        const sockets = global['totallyInformationShared'].uibsockets
        msg._fromSender = true
        if ( global['totallyInformationShared'].uibsockets ) {
            sockets.sendToFe(msg, this, sockets.uib.ioChannels.server)
        }
    } else {
        // Use events to send msg to uibuilder front-end.
        const eventName = `UIBUILDER/send/${this.url}`
        RED.events.emit( eventName, { ...msg, ...{ _uib: { originator: this.id } } } )
    }

    // If passthrough is enabled, send the msg
    if ( this.passthrough === true ) send(msg)
    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

//#endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = EventOut

// EOF
