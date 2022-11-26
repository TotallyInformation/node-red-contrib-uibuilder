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
 * @typedef {import('../../typedefs').uibListNode} uibListNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const tiEvents = require('@totallyinformation/ti-common-event-handler')
//const uibPackages = require('../libs/package-mgt')

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

/** Deal with a new client connection: send the last msg
 * @param {*} msg The msg data in the custom event
 * @this {runtimeNode & uibListNode}
 */
function handleConnectionEvent(msg) {
    // Send the cached data - but only if connections=0 (e.g. fresh page load)
    if ( msg.connections === 0 && this._ui ) {
        // Don't forget to include the _socketId
        emitMsg(msg, this)
    }
}

function emptyCache() {

}

/** Create/update the _ui object and retain for replay
 * @param {*} msg incoming msg
 * @param {runtimeNode & uibListNode} node reference to node instance
 */
function buildUi(msg, node) {
    if ( msg.mode && msg.mode === 'remove' ) {
        emptyCache()

        node.status({ fill: 'blue', shape: 'dot', text: 'No initial data yet' })
        node._ui = [{
            method: 'remove',
            components: [`#${node.elementid}`] // remove uses css selector, not raw id
        }]
        return
    }

    // If an object, turn into an array
    if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
        // Turn into an array
        msg.payload = Object.entries(msg.payload)
    } else if ( typeof msg.payload === 'string' || typeof msg.payload === 'number' || typeof msg.payload === 'boolean' ) {
        msg.payload = [msg.payload]
    } else if ( !Array.isArray(msg.payload) ) {
        node.warn('[uib-list:buildUi] msg.payload must be an array of strings or an array containing an array of strings. Cannot procede.')
        return
    }

    if ( !node._ui ) {
        // Create template
        node._ui = [
            {}, // placeholder in case a remove is needed
            {
                'method': '',
                'components': [
                    {
                        'type': '',
                        'id': '',
                        // 'parent': '',
                        'attributes': {},
                        'components': [],
                    },
                ],
            }
        ]
    }

    // Assume the data replaces. If msg.mode = 'update' then add rather than replace
    if ( msg.mode && msg.mode !== 'update' ) {
        node._ui[0] = {}
        node._ui[1].components[0].components = []
    } else {
        node._ui[0].method = 'remove'
        node._ui[0].components = [`#${node.elementid}`] // remove uses css selector, not raw id
        node._ui[1].components[0].components = []
    }

    const ui = node._ui[1]

    ui.method = 'add'
    ui.components[0].type = node.elementtype
    ui.components[0].id = node.elementid // `add` method allows raw id
    if ( node.parent !== '' ) ui.components[0].parent = node.parent

    // if ( this.topic === '' && msg.topic ) this.topic = msg.topic

    // Convert the input data array to _ui list entries

    msg.payload.forEach( (el, i) => {
        // List of objects
        if ( el !== null && el.constructor.name === 'Object' ) {
            el = Object.entries(el)
        }
        // Flatten nested objects/arrays
        if ( Array.isArray(el) ) {
            el.forEach( (el2, i) => {
                if ( el2 !== null && el2.constructor.name === 'Object' ) {
                    // Turn into an array
                    el.splice(i, 1, ...Object.entries(el2))
                } else if ( Array.isArray(el2) ) {
                    el.splice(i, 1, ...el2)
                }
            })
        }

        if ( node.elementtype !== 'dl' ) {
            // ul/ol
            ui.components[0].components.push({
                type: 'li',
                slot: el,
            })
        } else {
            // dl - needs a list of lists where the inner has 2 entries
            if (el.length > 0) {
                ui.components[0].components.push({
                    type: 'dt',
                    slot: el[0],
                })
            }
            if (el.length > 1) {
                ui.components[0].components.push({
                    type: 'dd',
                    slot: el[1],
                })
            }
        }

    } )

    node.status({ fill: 'green', shape: 'dot', text: 'Data registered' })

}

/** Build the output and send the msg via an event emitter
 * @param {*} msg The input or custom event msg data
 * @param {runtimeNode & uibListNode} node reference to node instance
 */
function emitMsg(msg, node) {
    if ( node._ui === undefined ) return

    // Use event to send msg to uibuilder front-end.
    const msg2 = {
        ...msg,
        ...{
            _uib: {
                originator: node.id
            },
            _ui: node._ui,
        }
    }
    delete msg2.payload

    if ( node.passthrough === true ) {
        node.send(msg2)
    } else {
        tiEvents.emit( `node-red-contrib-uibuilder/${node.url}`, msg2)
    }

    if ( msg.mode && msg.mode === 'remove' ) {
        node._ui = undefined
        node.status({ fill: 'blue', shape: 'dot', text: 'Data cleared' })
        // return
    }
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibListNode}
 */
function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - or just use mod.RED if you prefer:
    // const RED = mod.RED

    // Save the last input msg for replay to new client connections, creates/update this._ui
    buildUi(msg, this)

    // Emit the list (sends to the matching uibuilder instance) or fwd to output depending on settings
    emitMsg(msg, this)

    // We are done
    done()

} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibListNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibListNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED

    // @ts-ignore Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name || ''
    this.elementid = config.elementid || ''
    this.elementtype = config.elementtype || ''
    this.parent = config.parent || ''
    this.passthrough = config.passthrough === undefined ? false : config.passthrough

    this.cacheOn = config.cacheOn === undefined ? false : config.cacheOn
    this.storeName = config.storeName || 'default'
    this.storeContext = config.storeContext || 'context'
    this.varName = config.varName || 'uib_list'
    this.newcache = config.newcache === undefined ? true : config.newcache

    this._ui = undefined
    const url = this.url = config.url || ''

    this.status({ fill: 'blue', shape: 'dot', text: 'No initial data yet' })

    // Get ref to this node's context store or the flow/global stores as needed
    let context = this.context()
    if ( this.storeContext !== 'context') {
        context = context[this.storeContext]
    }
    this.getC = context.get
    this.setC = context.set

    // Get the cache or initialise it if new
    this.cache = this.getC(this.varName, this.storeName) || {}
    // Note that the cache is written back in addToCache and clearCache

    // When a client (re)connects
    if ( this.cacheOn ) tiEvents.on(`node-red-contrib-uibuilder/${url}/clientConnect`, handleConnectionEvent.bind(this))

    // When a client disconnects
    // tiEvents.on(`node-red-contrib-uibuilder/${url}/clientDisconnect`, function(data) {
    //     console.log(`>> list >> node-red-contrib-uibuilder/${url}/clientDisconnect >> `, data)
    // })

    // tiEvents.on(`node-red-contrib-uibuilder/${url}/**`, function(data) {
    //     console.log(`>> list >> node-red-contrib-uibuilder/${url}/** >> `, this.event, data)
    // })

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    /** Put things here if you need to do anything when a node instance is removed
     * Or if Node-RED is shutting down.
     * Note the use of an arrow function, ensures that the function keeps the
     * same `this` context and so has access to all of the node instance properties.
     */
    this.on('close', (removed, done) => {
        this._ui = undefined
        tiEvents.removeEventListener(`node-red-contrib-uibuilder/${url}/clientConnect`, handleConnectionEvent)
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
