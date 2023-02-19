/* eslint-disable sonarjs/no-duplicate-string */
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

const { promisify } = require('util')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-element', // Note that 'uib-element' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** Build the output and send the msg (clone input msg and add _ui prop)
 * @param {*} msg The input or custom event msg data
 * @param {runtimeNode & uibElNode} node reference to node instance
 */
function emitMsg(msg, node) {
    if ( node._ui === undefined ) return

    // Use event to send msg to uibuilder front-end.
    const msg2 = {
        ...msg,
        ...{
            _ui: node._ui,
        }
    }
    delete msg2.payload

    // Add default topic if defined and if not overridden by input msg
    // NB: Needs to be unique if using uib-cache
    if (!msg2.topic && node.topic !== '') msg2.topic = node.topic

    node.send(msg2)
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibElNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    // TODO: Accept cache-replay and cache-clear
    // Is this a uib control msg? If so, ignore it since this is connected to uib via event handler
    if ( msg.uibuilderCtrl ) {
        // this.warn('Received a uibuilder control msg, ignoring')
        done()
        return
    }

    // Save the last input msg for replay to new client connections, creates/update this._ui
    await buildUi(msg, this)

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
    this.topic = config.topic ?? ''

    this.elementtype = config.elementtype

    this.parentSource = config.parent ?? 'body' // Swap to source naming
    this.parentSourceType = config.parentSourceType ?? 'str'
    this.parent = undefined // update in buildui

    this.elementIdSource = config.elementid ?? config.elementId ?? '' // Swap to source naming
    this.elementIdSourceType = config.elementIdSourceType ?? 'str'
    this.elementId = undefined

    this.positionSource = config.position ?? 'last'
    this.positionSourceType = config.positionSourceType ?? 'str'
    this.position = undefined

    this.classesSource = config.classes ?? ''
    this.classesSourceType = config.classesSourceType ?? 'str'
    this.classes = undefined

    this.stylesSource = config.styles ?? ''
    this.stylesSourceType = config.stylesSourceType ?? 'str'
    this.styles = undefined

    this.headingSource = config.heading ?? ''
    this.headingSourceType = config.headingSourceType ?? ''
    this.heading = undefined
    this.headingLevel = config.headingLevel ?? 'h2'

    // Configuration data specific to the chosen type
    this.confData = config.confData ?? {}

    this._ui = undefined // set in buildUI()

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

} // ---- End of nodeInstance ---- //

//#endregion ----- Module-level support functions ----- //

//#region ----- UI definition builders ----- //

/** Build the UI config instructions for the ARTICLE element
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildArticle(node, msg, parent) {
    const err = ''

    // Add the ol/ul tag
    parent.components.push({
        'type': node.elementtype,
        'slot': msg.payload,
    })

    return err
} // ---- End of buildArticle ---- //

/** Build the UI config instructions for the HTML element
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildHTML(node, msg, parent) {
    // Must be a string or array
    let data = msg.payload
    if (!msg.payload) data = ''
    else if (Array.isArray(msg.payload)) data = msg.payload.join('/n')
    else if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
        try {
            data = JSON.stringify(msg.payload)
        } catch (e) {
            data = 'ERROR: Could not parse input data'
        }
    }

    const err = ''

    parent.components.push( {
        'type': node.elementtype,
        'slot': data,
    } )

    return err
} // ---- End of buildHTML ---- //

/** Build the UI config instructions for the Title and leading H1
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @returns {string} Error description or empty error string
 */
function buildTitle(node, msg) {
    // Must be a string or array/object of strings
    // If array/object, then catenate

    const err = ''

    // Convenient references
    // const insertPoint = parentComponent // parentComponent.components
    // const data = Array.isArray(msg.payload) ? msg.payload.join('/n') : msg.payload

    // insertPoint.slot = data
    node._ui[0] = ({
        'method': 'update',
        'type': 'title',
        'slot': msg.payload
    })
    node._ui.push({
        'method': 'replace',
        'components': [
            {
                'type': 'h1',
                'selector': 'h1',
                'parent': node.parent ? node.parent : 'body',
                'position': 'first',
                'slot': msg.payload
            },
        ],
    })

    return err
} // ---- End of buildTitle ---- //

/** Build the UI config instructions for the UL or OL LIST elements
 * NB: Row ids all removed since rows might change position
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildUlOlList(node, msg, parent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    const err = ''

    // Add the ol/ul tag
    parent.components.push({
        'type': node.elementtype,
        'components': [],
    })

    // Convenient references
    const listRows = parent.components[parent.components.length - 1].components
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {
        // Track the data row offset
        // const rowNum = i + 1

        // Create next list row
        listRows.push( {
            'type': 'li',
            // 'id': `${node.elementId}-data-R${rowNum}`,
            'attributes': {
                // NB: Making all indexes 1-based for consistency
                // 'data-row-index': rowNum,
                // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd'
            },
            'slot': tbl[row]
        } )
        // Add a row name attrib from the object key if the input is an object
        if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
            listRows[i].attributes['data-row-name'] = row
        }
    } )

    return err
} // ---- End of buildUlOlList ---- //

/** Build the UI config instructions for DL LIST elements
 * NB: Row ids all removed since rows might change position
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildDlList(node, msg, parent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    const err = ''

    // Add the dl tag
    parent.components.push({
        'type': node.elementtype,
        'components': [],
    })

    // Convenient references
    const listRows = parent.components[parent.components.length - 1].components
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {
        // Each DL entry needs two elements - treated as a single row

        // Track the data row offset
        // const rowNum = i + 1

        // Check if we have an object(or array)? If not, make content an array - will output only DT's
        if (!(tbl[row] instanceof Object)) {
            tbl[row] = [tbl[row]]
        }
        // Check if the inner data is an object - if so, convert to key/value array
        if (!Array.isArray(tbl[row])) tbl[row] = Object.entries(tbl[row])[0]

        const listIndex = listRows.push( {
            'type': 'div',
            // 'id': `${node.elementId}-data-R${rowNum}`,
            'attributes': {
                // NB: Making all indexes 1-based for consistency
                // 'data-row-index': rowNum,
                // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd'
            },
            'components': [],
        } )
        // Add a row name attrib from the object key if the input is an object
        if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
            listRows[listIndex - 1].attributes['data-row-name'] = row
        }

        // If multiple elements, treat the 1st as the term and the rest as definitions.
        // Object.keys(tbl[row]).slice(0,2).forEach( (el,indx) => {
        tbl[row].forEach( (el, indx) => {
            let lType
            if (indx === 0) {
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

            listRows[listIndex - 1].components.push( {
                'type': lType,
                'slot': tbl[row][indx],
            } )

        })
    } )

    return err
} // ---- End of buildDlList ---- //

/** Build the UI config instructions for the TABLE element
 * NB: Row ids all removed since rows might change position
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildTable(node, msg, parent) {
    // Make sure msg.payload is an object or an array - if not, force to array
    if (!(msg.payload instanceof Object)) msg.payload = [msg.payload]

    let cols = []
    const err = ''

    // Add the table and thead/tbody tags
    parent.components.push({
        'type': node.elementtype,
        'components': [
            {
                'type': 'thead',
                'components': []
            },
            {
                'type': 'tbody',
                'components': []
            }
        ],
    })

    // Convenient references
    const thead = parent.components[parent.components.length - 1].components[0]
    const tbody = parent.components[parent.components.length - 1].components[1]
    const tbl = msg.payload

    // Walk through the inbound msg payload (works as both object or array)
    Object.keys(tbl).forEach( (row, i) => {

        // TODO Allow for msg.cols to be used as override
        // Build the columns from the first set of entries & add the thead
        if (i === 0) {
            // const hdrRowNum = i + 1

            // TODO inp[el] has to be an object
            // TODO check that there are >0 columns

            // Create the header row
            thead.components = [
                {
                    'type': 'tr',
                    // 'id': `${node.elementId}-head-r${hdrRowNum}`,
                    // 'attributes': {
                    //     'data-hdr-row-index': hdrRowNum,
                    // },
                    'components': []
                }
            ]

            // TODO Allow override from msg.cols
            // Save the col names
            cols = Object.keys(tbl[row])

            // Build the headings
            cols.forEach( (colName, k) => {
                const colNum = k + 1
                thead.components[0].components.push({
                    'type': 'th',
                    // 'id': `${node.elementId}-head-r${hdrRowNum}-c${colNum}`,
                    'attributes': {
                        // 'data-hdr-row-index': hdrRowNum,
                        'data-col-index': colNum,
                        'data-col-name': colName,
                    },
                    'slot': colName
                })
            } )

        }

        // Track the data row offset
        // const rowNum = i + 1

        // Create the data row
        const rLen = tbody.components.push( {
            'type': 'tr',
            // 'id': `${node.elementId}-data-R${rowNum}`,
            'components': [],
            'attributes': {},
        } )
        // // Add the row index attrib and even/odd class
        // tbody.components[rLen - 1].attributes = {
        //     // NB: Making all indexes 1-based for consistency
        //     'data-row-index': rLen,
        //     // 'class': (rLen % 2  === 0) ? 'even' : 'odd'
        // }
        // Add a row name attrib from the object key if the input is an object
        if ( msg.payload !== null && msg.payload.constructor.name === 'Object' ) {
            tbody.components[rLen - 1].attributes['data-row-name'] = row
        }
        // TODO If tbl is an object - get the row names and apply to data-rowname attrib
        // TODO Allow for class overrides in node

        // Build the columns
        cols.forEach(  (colName, j) => {
            const colNum = j + 1

            tbody.components[rLen - 1].components.push({
                'type': 'td',
                // 'id': `${node.elementId}-data-R${rowNum}-C${colNum}`,
                'attributes': {
                    // 'class': ((rowNum) % 2  === 0) ? 'even' : 'odd',
                    // 'data-row-index': rowNum,
                    // NB: Making all indexes 1-based for consistency
                    'data-col-index': colNum,
                    'data-col-name': colName,
                },
                'slot': tbl[row][colName],
            })
        } )

    } )

    return err
} // ---- End of buildTable ---- //

/** Build the UI config instructions for adding a table row to an existing table
 * NB: Row ids all removed since rows might change position
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildTableRow(node, msg, parent) {
    // Payload must be an object (col/value pairs)
    // TODO Allow payload to be an array

    const err = ''

    parent.method = 'add'
    const rLen = parent.components.push({
        'type': 'tr',
        'parent': `${node.parent} > table > tbody`,
        'position': node.position,
        'components': [],
    })
    // const rowNum = -10
    Object.keys(msg.payload).forEach(  (colName, j) => {
        const colNum = j + 1

        parent.components[rLen - 1].components.push({
            'type': 'td',
            'attributes': {
                'data-col-index': colNum,
                'data-col-name': colName,
            },
            'slot': msg.payload[colName],
        })
    } )

    return err
} // ---- End of buildTableRow ---- //

/** Build the UI config instructions for adding a table row to an existing table
 * NB: Row ids all removed since rows might change position
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg The msg data in the custom event
 * @param {object} parent The parent JSON node that we will add components to
 * @returns {string} Error description or empty error string
 */
function buildUlOlRow(node, msg, parent) {
    // Payload must be a a string
    if ( !Array.isArray(msg.payload) ) msg.payload = [msg.payload]

    const err = ''

    parent.method = 'add'

    // const rowNum = -10
    Object.keys(msg.payload).forEach(  (rowName, j) => {
        parent.components.push({
            'type': 'li',
            'parent': `${node.parent} > ul`,
            'position': node.position,
            // 'attributes': {
            //     'data-row-name': rowName,
            // },
            'slot': msg.payload[j],
        })
    } )

    return err
} // ---- End of buildUlOlRow ---- //

/** Adds a wrapping DIV tag
 * @param {object} parent The parent JSON node that we will add components to
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @returns {object} Reference to new compontents array for next element to be added into
 */
function addDiv(parent, node) {
    if (!parent.components) parent.components = []
    parent.components.push(
        {
            'type': 'div',
            'id': node.elementId,
            'parent': node.parent,
            'position': node.position,
            'attributes': {},
            'components': [],
        },
    )
    return node._ui[node._ui.length - 1].components[0]
}

/** Add the element heading if defined
 * @param {object} parent The parent JSON node that we will add components to
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @returns {object} Reference to new compontents array for next element to be added into
 */
function addHeading(parent, node) {
    if (node.heading === '') return parent

    const hdId = `${node.elementId}-heading`

    // Add accessibility label
    if (!parent.attributes) parent.attributes = {}
    parent.attributes['aria-labelledby'] = hdId

    if (!parent.components) parent.components = []
    parent.components.push(
        {
            'type': node.headingLevel,
            'id': hdId,
            'slot': node.heading,
            'components': [],
        },
    )

    return parent
}

/** Get an individual value for a typed input field
 * @param {string} propName Name of the node property to check
 * @param {runtimeNode & uibElNode} node reference to node instance
 * @param {*} msg incoming msg
 */
async function getSource(propName, node, msg) {
    const src = `${propName}Source`
    const srcType = `${propName}SourceType`
    if (node[src] !== '') {
        try {
            node[propName] = await mod.evaluateNodeProperty(node[src], node[srcType], node, msg)
        } catch (e) {
            node.warn(`Cannot evaluate source for ${propName}. ${e.message} (${srcType})`)
        }
    }
}

/** Create/update the _ui object and retain for replay
 * @param {*} msg incoming msg
 * @param {runtimeNode & uibElNode} node reference to node instance
 */
async function buildUi(msg, node) {

    // Get all of the typed input values (in parallel)
    await Promise.all([
        getSource('parent', node, msg),
        getSource('elementId', node, msg),
        getSource('classes', node, msg),
        getSource('styles', node, msg),
        getSource('heading', node, msg),
        getSource('position', node, msg),
    ])

    console.log('NODE', node)

    // Allow combination of msg._ui and this node allowing chaining of the nodes
    if ( msg._ui ) node._ui = msg._ui
    else node._ui = []

    // If no mode specified, we assume the desire is to update (since a removal attempt with nothing to remove is safe)
    if ( !msg.mode ) msg.mode = 'update'

    // If mode is remove, then simply do that and return
    if ( msg.mode === 'remove' ) {
        if (!node.elementId) {
            node.warn('[uib-element:buildUi] Cannot remove element as no HTML ID provided')
            return
        }

        node._ui.push({
            method: 'remove',
            components: [`#${node.elementId}`] // remove uses css selector, not raw id
        })
        return
    }
    // Otherwise ...

    // Add the outer component which is always a div
    node._ui.push({
        'method': 'replace',
        'components': [],
    } )
    let parent = node._ui[node._ui.length - 1]

    // Keep track of the next set of components to add to the hierarchy
    // let nextComponents = node._ui[node._ui.length - 1].components
    // TODO if heading, unshift new component object into nextComponents
    // Get the component array for the actual element we are adding
    // nextComponents = nextComponents[nextComponents.length - 1].components

    // ! What type to process?
    let err = ''
    switch (node.elementtype) {
        case 'article': {
            parent = addDiv(parent, node)
            parent = addHeading(parent, node)
            err = buildArticle(node, msg, parent)
            break
        }

        case 'list':
        case 'ol':
        case 'ul': {
            parent = addDiv(parent, node)
            parent = addHeading(parent, node)
            err = buildUlOlList(node, msg, parent)
            break
        }

        case 'dl': {
            parent = addDiv(parent, node)
            parent = addHeading(parent, node)
            err = buildDlList(node, msg, parent)
            break
        }

        case 'table': {
            parent = addDiv(parent, node)
            parent = addHeading(parent, node)
            err = buildTable(node, msg, parent)
            break
        }

        case 'html': {
            parent = addDiv(parent, node)
            parent = addHeading(parent, node)
            err = buildHTML(node, msg, parent)
            break
        }

        case 'title': {
            // In this case, we do not want a wrapping div
            err = buildTitle(node, msg)
            break
        }

        case 'tr': {
            err = buildTableRow(node, msg, parent)
            break
        }

        case 'li': {
            err = buildUlOlRow(node, msg, parent)
            break
        }

        // Unknown type. Issue warning and exit
        default: {
            err = `Type "${node.elementtype}" is unknown. Cannot process.`
            break
        }
    }

    if (err.length > 0) {
        node.error(err, node)
    }

} // -- end of buildUI -- //

//#endregion ----- ui functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    // Save a ref to a promisified version to simplify async callback handling
    mod.evaluateNodeProperty = promisify(mod.RED.util.evaluateNodeProperty)

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition

// EOF
