/* eslint-disable jsdoc/valid-types */
/** Takes a msg input and caches it then passes it through.
 *  If it receives a cache-replay control msg, it dumps the cache.
 *  If it receives a cache-empty control msg, it empties the cache.
 *
 * Copyright (c) 2022-2025 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').cacheNode1} cacheNode
 * typedef {import('../typedefs.js').myNode} myNode
 */

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|null} Reference to the master RED instance */
    RED: null,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-cache',
}

// #endregion ----- Module level variables ---- //

// #region ----- Module-level support functions ----- //

/** Set status msg in Editor
 * @param {runtimeNode & cacheNode} node Reference to node instance
 */
function setNodeStatus(node) {
    let len = 0
    if (node.cache) len = Object.keys(node.cache).length

    node.status({ fill: 'blue', shape: 'dot', text: `${node.cacheKey} entries: ${len}`, })
} // ---- end of setStatus ---- //

/** Trim all of the cache to the requested number of entries
 * @param {runtimeNode & cacheNode} node Reference to node instance
 */
function trimCacheAll(node) {
    if (node.num === 0) return // 0 = infinite, so no need to trim
    Object.keys(node.cache).forEach( (key) => {
        const msgs = node.cache[key]
        // See if the array is now too long - if so, slice it down to size
        if ( msgs.length > node.num ) {
            node.cache[key] = msgs.slice( msgs.length - node.num )
        }
    })

    // Save the cache
    node.setC(node.varName, node.cache, node.storeName)
} // ---- end of trimCache ---- //

/** Add a new msg to the cache, dropping excessive entries if needed
 * @param {*} msg The recieved message to add
 * @param {runtimeNode & cacheNode} node Reference to node instance
 */
function addToCache(msg, node) {
    if (mod.RED === null) return
    if (node.cacheKey === undefined) return

    const cacheKey = node.cacheKey

    // If msg[<cacheKey>] doesn't exist (or is an empty string), do not process
    if ( !msg[cacheKey] ) return

    const cacheKeyValue = msg[cacheKey]

    // If this is a new property value in the stored variable, create empty array
    if ( !node.cache[cacheKeyValue] ) node.cache[cacheKeyValue] = []

    // HAS to be a CLONE to avoid downstream changes impacting cache
    const clone = mod.RED.util.cloneMessage(msg)
    delete clone._msgid

    // Add a new entry to the array
    node.cache[cacheKeyValue].push(clone)

    // See if the array is now too long - if so, slice it down to size (unless num=0)
    if ( node.num !== 0 && node.cache[cacheKeyValue].length > node.num ) {
        node.cache[cacheKeyValue] = node.cache[cacheKeyValue].slice( node.cache[cacheKeyValue].length - node.num )
    }

    // Save the cache
    node.setC(node.varName, node.cache, node.storeName)

    setNodeStatus(node)
} // ---- end of addToCache ---- //

/** Clear the cache
 * @param {runtimeNode & cacheNode} node Reference to node instance
 */
function clearCache(node) {
    // Save the cache or initialise it if new
    node.setC(node.varName, {}, node.storeName)
    node.cache = {}

    setNodeStatus(node)
} // ---- end of clearCache ---- //

/** Send the cache
 * @param {Function} send Reference to the Node's send function
 * @param {runtimeNode & cacheNode} node Reference to node instance
 * @param {object} msg Reference to the input message
 */
function sendCache(send, node, msg) {
    const toSend = []

    Object.values(node.cache).forEach( (cachedMsgs) => {
        // toSend.push(...cachedMsgs)

        cachedMsgs.forEach( (cachedMsg) => {
            if (mod.RED === null) return

            // Has to be a clone to prevent changes from downstream nodes
            const clone = mod.RED.util.cloneMessage(cachedMsg)

            // Add replay indicator
            if (!clone._uib) clone._uib = {}
            clone._uib.cache = 'REPLAY'

            // Add socketId if needed - only for uib control msgs
            // TODO Add flag override
            if (msg.uibuilderCtrl && msg._socketId) {
                clone._socketId = msg._socketId
            }

            // send( clone )
            toSend.push( clone )
        })
    })

    send([toSend])
} // ---- end of sendCache ---- //

// TODO: Adjust processes for all msg caching
// TODO: Add clearF(n) to drop the oldest N msgs from cache, clearL(n) to drop the newest N msgs from the cache
// TODO: And to the cache control msgs
// TODO: Editor option to to ignore replay socket id
// TODO: Editor options to clear the cache, clear first n, clear last n entries

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function UibCache(RED) {
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
 * @param {runtimeNodeConfig & cacheNode} config The Node-RED node instance config object
 * @this {runtimeNode & cacheNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED
    if (RED === null) return

    // Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name
    this.cacheall = config.cacheall
    this.cacheKey = config.cacheKey ?? 'topic'
    this.newcache = config.newcache ?? true
    this.num = Number(config.num) // zero is unlimited cache
    this.storeName = config.storeName ?? 'default'
    this.storeContext = config.storeContext ?? 'context'
    this.varName = config.varName ?? 'uib_cache'

    if (Number.isNaN(this.num) || this.num < 0) {
        this.num = 1
    }

    // Show if anything in the cache
    setNodeStatus(this)

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

    if (this.cacheall === true) {
        this.cacheKey = undefined
    }

    trimCacheAll(this)

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    /** Put things here if you need to do anything when a node instance is removed
     * Or if Node-RED is shutting down.
     * Note the use of an arrow function, ensures that the function keeps the
     * same `this` context and so has access to all of the node instance properties.
     */
    this.on('close', (removed, done) => {
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
 * @this {runtimeNode & cacheNode}
 */
function inputMsgHandler(msg, send, done) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - or just use mod.RED if you prefer:
    // const RED = mod.RED

    // Only send if connection is really new (connections=0) - if newcache is selected
    let sendit = true
    if ( this.newcache === true && msg.connections && msg.connections > 2 ) sendit = false

    // Is this a control msg?
    if ( msg.uibuilderCtrl ) {
        if ( msg.cacheControl ) {
            if ( msg.cacheControl === 'REPLAY' && sendit === true ) {
                // Send the cache
                sendCache(send, this, msg)
            } else if ( msg.cacheControl === 'CLEAR' ) {
                // Clear the cache
                clearCache(this)
            }
        } else if ( msg.uibuilderCtrl === 'client connect' && sendit === true ) {
            sendCache(send, this, msg)
        }
    } else {
        // Remove ExpressJS msg.res and msg.req because they are recursive objects and cannot be serialised
        if ( Object.prototype.hasOwnProperty.call(msg, 'req') || Object.prototype.hasOwnProperty.call(msg, 'res') ) {
            mod.RED.log.info('🌐📘[uib-cache:inputMsgHandler] msg contains Express res/req. These cannot be serialised so removing them.')
            delete msg.req
            delete msg.res
        }

        // Forward
        send(msg)
        // Add to cache
        addToCache(msg, this)
    }

    // We are done
    // done()
} // ----- end of inputMsgHandler ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = UibCache

// EOF
