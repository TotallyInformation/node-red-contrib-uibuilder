/** Send a dynamic UI config to the uibuilder front-end library.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2022-2023 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').uibElNode} uibElNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const tiEvents = require('@totallyinformation/ti-common-event-handler')
const { node } = require('execa')
//const uibPackages = require('../libs/package-mgt')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-element', // Note that 'uib-element' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** Set status msg in Editor
 * @param {runtimeNode & uibElNode} node Reference to node instance
 */
function setNodeStatus(node) {
    let txt = 'Not caching'
    let shape = 'ring'

    if (node.cacheOn === true) {
        if ( !node.cache || Object.keys(node.cache).length === 0 ) txt = 'No element cached'
        else txt = 'Element is cached'
    }

    node.status({ fill: 'blue', shape: shape, text: txt })
} // ---- end of setStatus ---- //

/** Deal with a new client connection: send the last msg
 * @param {*} msg The msg data in the custom event
 * @this {runtimeNode & uibElNode}
 */
function handleConnectionEvent(msg) {
    if (this.cacheOn === false) return
    // If no _ui elements object to send, don't bother
    //! TODO - this looks odd, should it really be this._ui? Or should it be the cache object?
    if ( !this._ui ) return

    // Send the cached data - but only if connections=0 (e.g. fresh page load) if flag is set
    if ( (this.newcache === true && msg.connections === 0) || this.newcache === false ) {
        // Don't forget to include the _socketId
        emitMsg(msg, this)
    }
}

/** Clear the cache
 * @param {runtimeNode & uibElNode} node Reference to node instance
 */
function clearCache(node) {
    if (node.cacheOn === false) return

    // Save the cache or initialise it if new
    node.cache = {}
    node.setC(node.varName, node.cache, node.storeName)
}

/** Cache the INPUT. Replace the cached list with the latest msg
 * @param {*} msg The recieved message to add
 * @param {runtimeNode & uibElNode} node Reference to node instance
 */
function replaceCache(msg, node) {
    if (mod.RED === null) return
    if (node.cacheOn === false) return
    // TODO Check if there is something to cache (this._ui)
    
    // TODO Provide option to keep/remove the original data in the output
    // // HAS to be a CLONE to avoid downstream changes impacting cache
    const clone = mod.RED.util.cloneMessage(msg)
    delete clone._msgid

    // Replace the cache
    node.cache = clone

    // Save the cache
    node.setC(node.varName, node.cache, node.storeName)

} // ---- end of addToCache ---- //

/** Build the output and send the msg via an event emitter
 * @param {*} msg The input or custom event msg data
 * @param {runtimeNode & uibElNode} node reference to node instance
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
 * @this {runtimeNode & uibElNode}
 */
function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // TODO: Accept cache-replay and cache-clear
    // Is this a uib control msg? If so, ignore it since this is connected to uib via event handler
    if ( msg.uibuilderCtrl ) {
        // this.warn('Received a uibuilder control msg, ignoring')
        done()
        return
    }

    // Save the last input msg for replay to new client connections, creates/update this._ui
    buildUi(msg, this)

    // Emit the list (sends to the matching uibuilder instance) or fwd to output depending on settings
    emitMsg(msg, this)

    // We are done
    done()

} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibElNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibElNode}
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
    this.elementid = config.elementid ?? ''
    this.elementtype = config.elementtype ?? ''
    this.parent = config.parent ?? ''
    this.passthrough = config.passthrough ?? false
    // Configuration data specific to the chosen type
    this.confData = config.confData ?? {}
    // Cache configuration
    this.cacheOn = config.cacheOn ?? false
    this.storeName = config.storeName ?? 'default'
    this.storeContext = config.storeContext ?? 'context'
    this.varName = config.varName ?? 'uib_el'
    this.newcache = config.newcache ?? true

    this._ui = undefined // set in buildUI()
    this.cache = {} // make sure it exists but is empty until set

    const url = this.url = config.url ?? ''

    // Show if anything in the cache
    setNodeStatus(this)
    //this.status({ fill: 'blue', shape: 'dot', text: 'No initial data yet' })

    // Get ref to this node's context store or the flow/global stores as needed
    let context = this.context()
    if ( this.storeContext !== 'context') {
        context = context[this.storeContext]
    }
    this.getC = context.get
    this.setC = context.set
    
    if (this.cacheOn === true) {
        // Get the cache or initialise it if new
        this.cache = this.getC(this.varName, this.storeName) ?? {}
        // Note that the cache is written back in addToCache and clearCache

        // When a client (re)connects
        tiEvents.on(`node-red-contrib-uibuilder/${url}/clientConnect`, handleConnectionEvent.bind(this))
    } else {
        // See if we can clear the cache
        try {
            this.cache = {}
            this.setC(this.varName, this.cache, this.storeName)
            setNodeStatus(this)
        } catch(e) { }
    }

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

//#region ----- UI definition builders ----- //

/** Build the UI config instructions for the TEXT element
 * @param {*} msg The msg data in the custom event
 * @param {object} parentComponent The parent descriptor object that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildText(msg, parentComponent) {
    let err = ''
    return err
} // ---- End of buildText ---- //

/** Build the UI config instructions for the UL or OL LIST elements
 * @param {*} msg The msg data in the custom event
 * @param {object} parentComponent The parent descriptor object that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildUlOlList(msg, parentComponent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    let cols = []
    let err = ''

    // NOTE: that the outer element (ul/ol/dl) is built in the calling fn buildUi

    // Convenient references
    const listRows = parentComponent.components
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {
        // Create next list row
        listRows.push( {
            "type": "li",
            "attributes": {
                // NB: Making all indexes 1-based for consistency
                "data-row-index": i+1,
                'class': ((i+1) % 2  == 0) ? "even" : "odd" 
            },
            "slot": tbl[row]
        } )
        // Add a row name attrib from the object key if the input is an object
        if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
            listRows[i].attributes['data-row-name'] = row
        }
    } )

    return err
} // ---- End of buildUlOlList ---- //

/** Build the UI config instructions for DL LIST elements
 * @param {*} msg The msg data in the custom event
 * @param {object} parentComponent The parent descriptor object that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildDlList(msg, parentComponent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    let cols = []
    let err = ''

    // NOTE: that the outer element (ul/ol/dl) is built in the calling fn buildUi

    // Convenient references
    const listRows = parentComponent.components
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {
        // Each DL entry needs two elements - treated as a single row

        // Check if we have an object(or array)? If not, make content an array - will output only DT's
        if (!(tbl[row] instanceof Object)) {
            tbl[row] = [tbl[row]]
        }
        // Check if the inner data is an object - if so, convert to key/value array
        if (!Array.isArray(tbl[row])) tbl[row] = Object.entries(tbl[row])[0]

        // We only want the first 2 elements of the tbl[row] object/array
        Object.keys(tbl[row]).slice(0,2).forEach( (el,indx) => {
            let lType
            if ((indx) % 2  == 0) {
                lType = 'dt'
            } else {
                lType = 'dd'
            }

            // If a 3rd-level object, stringify it (an array will stringify itself)
            if ( tbl[row][indx] !== null && tbl[row][indx].constructor.name === 'Object' ) {
                try {
                    tbl[row][indx] = JSON.stringify(tbl[row][indx])
                } catch (e) { }
            }

            let listIndex = listRows.push( {
                "type": lType,
                "attributes": {
                    // NB: Making all indexes 1-based for consistency
                    "data-row-index": i+1,
                    'class': ((i+1) % 2  == 0) ? "even" : "odd" 
                },
                "slot": tbl[row][indx],
            } )
            // Add a row name attrib from the object key if the input is an object
            if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
                listRows[listIndex-1].attributes['data-row-name'] = row
            }
        })
    } )

    return err
} // ---- End of buildDlList ---- //

/** Build the UI config instructions for the TABLE element
 * @param {*} msg The msg data in the custom event
 * @param {object} parentComponent The parent descriptor object that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildTable(msg, parentComponent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    let cols = []
    let err = ''

    // NOTE: that the outer element (table) is built in the calling fn buildUi

    // Add the thead and tbody wrappers
    parentComponent.components = [
        {
            "type":"thead",
            "components": []
        },
        {
            "type":"tbody",
            "components": []
        }
    ]

    // Convenient references
    let thead = parentComponent.components[0]
    let tbody = parentComponent.components[1]
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {
        // Build the columns from the first set of entries & add the thead
        if (i===0) {
            // TODO inp[el] has to be an object
            // TODO check that there are >0 columns

            // Create the header row
            thead.components = [
                {
                    "type":"tr",
                    "components": []
                }
            ]

            // TODO Allow override from msg.cols
            // Save the col names
            cols = Object.keys(tbl[row])
            
            // Build the headings
            cols.forEach( (colName,k) => {
                thead.components[0].components.push({
                    "type": "th",
                    "attributes": {
                        "data-hdr-row-index": 1,
                        "data-col-index": k+1,
                        "data-col-name": colName,
                    },
                    "slot": colName
                })
            } )
    
        }

        // Create the data row
        let rLen = tbody.components.push( {
                "type":"tr",
                "components": []
            }
        )
        // Add the row index attrib and even/odd class
        tbody.components[rLen-1].attributes = {
            // NB: Making all indexes 1-based for consistency
            'data-row-index': rLen,
            'class': (rLen % 2  == 0) ? "even" : "odd" 
        }
        // Add a row name attrib from the object key if the input is an object
        if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
            tbody.components[rLen-1].attributes['data-row-name'] = row
        }
        // TODO If tbl is an object - get the row names and apply to data-rowname attrib
        // TODO Allow for class overrides in node

        // Build the columns
        cols.forEach( ( (colName, j) => {
            tbody.components[rLen-1].components.push({
                "type": "td",
                "attributes": {
                    "data-row-index": rLen,
                    // NB: Making all indexes 1-based for consistency
                    "data-col-index": j+1,
                    "data-col-name": colName,
                },
                "slot": tbl[row][colName],
            })
        } ) )

    } )

    return err
} // ---- End of buildTable ---- //

/** Create/update the _ui object and retain for replay
 * @param {*} msg incoming msg
 * @param {runtimeNode & uibElNode} node reference to node instance
 */
function buildUi(msg, node) {
    // Allow combination of msg._ui and this node allowing chaining of the nodes
    if ( msg._ui ) node._ui = msg._ui
    else node._ui = []
    let uiIndex = node._ui.length === 0 ? 0 : node._ui.length-1

    // If no mode specified, we assume the desire is to update (since a removal attempt with nothing to remove is safe)
    if ( !msg.mode ) msg.mode = 'update'

    // If mode is remove, then simply do that and return
    if ( msg.mode === 'remove' ) {
        clearCache(node)
        setNodeStatus(node)

        if (!node.elementid) {
            node.warn('[uib-element:buildUi] Cannot remove element as no HTML ID provided')
            return
        }

        node._ui.push({
            method: 'remove',
            components: [`#${node.elementid}`] // remove uses css selector, not raw id
        })
        return
    }
    // Otherwise ...

    // If msg.mode = 'update' then remove+add.
    if ( msg.mode == 'update' ) {
        node._ui.push({
            method: 'remove',
            components: [`#${node.elementid}`], // remove uses css selector, not raw id
        })
    }
    // Create template
    node._ui.push({   // Blank template
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
    } )
    uiIndex = node._ui.length-1

    // TODO Will need to adjust for wrapper
    
    // Keep track of the next set of components to add to the hierarchy
    let nextComponents = node._ui[uiIndex].components
    
    // Common - add the outer component
    node._ui[uiIndex].method = 'add' // looks odd but at present, the _ui[1] component can ONLY be an add.
    nextComponents[0].type = node.elementtype
    nextComponents[0].id = node.elementid // `add` method allows raw id
    if ( node.parent !== '' ) nextComponents[0].parent = node.parent

    // What type to process?
    let err = ''
    switch (node.elementtype) {
        case 'text': {
            err = buildText(msg, nextComponents[0])
            break
        }

        case 'list':
        case 'ol':
        case 'ul': {
            err = buildUlOlList(msg, nextComponents[0])
            break
        }

        case 'dl': {
            err = buildDlList(msg, nextComponents[0])
            break
        }

        case 'table': {
            err = buildTable(msg, nextComponents[0])
            break
        }

        // Unknown type. Issue warning and exit
        default: {
            err = `Type "${node.elementtype}" is unknown. Cannot process.`
            break
        }
    }

    if (err.length>0) {
        node.error(err, node)
        return
    }

    // Replace the cache if caching turned on
    replaceCache(msg, node)

    setNodeStatus(node)
} // -- end of buildUI -- //

//#endregion ----- ui functions ----- //

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
