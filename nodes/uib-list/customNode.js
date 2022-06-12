/** Template Node-RED node runtime
 *
 * Copyright (c) 2022 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').thisNode} thisNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const tiEvents = require('@totallyinformation/ti-common-event-handler')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-list', // Note that 'uib-list' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

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
    // const RED = mod.RED

    // TODO Check if payload is an object
    // TODO Check if method is add, update or remove
    // TODO Allow parent selector to be set
    // TODO Allow ol/ul/dl
    // TODO Allow ID to be set
    // TODO Allow additional attributes
    // TODO Add check to uibuilder.module.js to prevent adding of multiple entries with same ID
    // ? What is the best way to retain? Per-node or per-uib node? If per uib-node, retain in Node-RED? As part of instanceRoot?

    const out = []
    if ( msg.payload.isArray ) {
        msg.payload.array.forEach( el => {
            out.push({
                type: 'li',
                slot: el,
            })
        } )
    }

    // Use events to send msg to uibuilder front-end.
    tiEvents.emit( `node-red-contrib-uibuilder/${this.url}`, {
        ...msg,
        ...{
            _uib: {
                originator: this.id
            },
            _ui: {
                // TODO Allow override from msg
                'method': 'add',
                // TODO Allow override from msg
                'parent': '#start',
                'components': [
                    {
                        'type': 'ol',
                        'parent': '#card4',
                        'attributes': {
                            'id': 'ol-01',
                        },
                        'components': out,
                    },
                ],
            },
        },
    } )

    // We are done
    done()

} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & thisNode} config The Node-RED node instance config object
 * @this {runtimeNode & thisNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED

    // @ts-ignore Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name || ''
    this.topic = config.topic || ''
    const url = this.url = 'components-html' || config.url || '' // ! TODO

    tiEvents.on(`node-red-contrib-uibuilder/${url}/**`, function(data) {
        console.log(`>> list >> node-red-contrib-uibuilder/${url}/** >> `, this.event, data)
    })

    // When a client (re)connects
    tiEvents.on(`node-red-contrib-uibuilder/${url}/clientConnect`, function(data) {
        console.log(`>> list >> node-red-contrib-uibuilder/${url}/clientConnect >> `, data)
        // TODO Send the cached data
    })

    // When a client disconnects
    tiEvents.on(`node-red-contrib-uibuilder/${url}/clientDisconnect`, function(data) {
        console.log(`>> list >> node-red-contrib-uibuilder/${url}/clientDisconnect >> `, data)
    })

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    /** Put things here if you need to do anything when a node instance is removed
     * Or if Node-RED is shutting down.
     * Note the use of an arrow function, ensures that the function keeps the
     * same `this` context and so has access to all of the node instance properties.
     */
    this.on('close', (removed, done) => {
        // console.log('>>>=[IN 4]=>>> [nodeInstance:close] Closing. Removed?: ', removed)

        // Cancel any event listeners for this node
        tiEvents.removeAllListeners(`node-red-contrib-uibuilder/return/${this.id}`)

        done()
    })

    /** Properties of `this`
     * Methods: updateWires(wires), context(), on(event,callback), emit(event,...args), removeListener(name,listener), removeAllListeners(name), close(removed)
     *          send(msg), receive(msg), log(msg), warn(msg), error(logMessage,msg), debug(msg), trace(msg), metric(eventname, msg, metricValue), status(status)
     * Other: credentials, id, type, z, wires, x, y
     * + any props added manually from config, typically at least name and topic
     */
}

//#endregion ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition

// EOF
