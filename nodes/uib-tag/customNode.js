/* eslint-disable jsdoc/valid-types */
// @ts-nocheck
/** Send an update to a specific front-end element.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2023-2025 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').uibTagNode} uibTagNode <= Change this to be specific to this node
 */

// #region ----- Module level variables ---- //

const { getSource, } = require('../libs/uiblib')
// const lowCode = require('../libs/low-code')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-tag', // Note that 'uib-update' will be replaced with actual node-name. Do not forget to also add to package.json
}

// #endregion ----- Module level variables ---- //

// #region ----- Module-level support functions ----- //

/** Create/update the _ui object and retain for replay
 * @param {*} msg incoming msg
 * @param {runtimeNode & uibTagNode} node reference to node instance
 */
async function buildUi(msg, node) {
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
            node.warn('🌐⚠️[uibuilder:uib-element:buildUi] Cannot remove element as no HTML ID provided')
            return
        }

        node._ui.push(
            {
                method: 'removeAll',
                components: [
                    `#${node.elementId}`,
                ],
            }
        )
        return
    }

    // If no HMTL ID is specified & not removing, then always ADD
    if (!node.elementId) msg.mode = 'add'

    node._ui.push({
        method: msg.mode === 'add' ? 'add' : 'replace',
        components: [
            {
                type: node.tag,
                id: node.elementId,
                parent: node.parent,
                position: node.position,
                slot: node.slotPropMarkdown === false ? node.slotContent : undefined,
                slotMarkdown: node.slotPropMarkdown === true ? node.slotContent : undefined,
                attributes: node.attribs,
            },
        ],
    })
} // -- end of buildUI -- //

/** Build the output and send the msg (clone input msg and add _ui prop)
 * @param {*} msg The input or custom event msg data
 * @param {runtimeNode & uibTagNode} node reference to node instance
 */
function emitMsg(msg, node) {
    if ( node._ui === undefined ) return

    // Use event to send msg to uibuilder front-end.
    const msg2 = {
        ...msg,
        ...{
            _ui: node._ui,
        },
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
 * @this {runtimeNode & uibTagNode}
 */
async function inputMsgHandler(msg, send, done) {
    const RED = mod.RED

    // TODO: Accept cache-replay and cache-clear
    // Is this a uib control msg? If so, ignore it since this is connected to uib via event handler
    if ( msg.uibuilderCtrl ) {
        // this.warn('Received a uibuilder control msg, ignoring')
        done()
        return
    }

    // If msg has _ui property - is it from the client? If so, remove it.
    if (msg._ui && msg._ui.from && msg._ui.from === 'client') delete msg._ui

    // Get all of the typed input values (in parallel)
    await Promise.all([
        getSource('tag', this, msg, RED),
        getSource('elementId', this, msg, RED),
        getSource('parent', this, msg, RED),
        getSource('position', this, msg, RED),
        getSource('slotContent', this, msg, RED),
        getSource('attribs', this, msg, RED),
    ])

    // Save the last input msg for replay to new client connections, creates/update this._ui
    await buildUi(msg, this)

    // Emit the list (sends to the matching uibuilder instance) or fwd to output depending on settings
    emitMsg(msg, this)

    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibTagNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibTagNode}
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

    this.tagSource = config.tag ?? ''
    this.tagSourceType = config.tagSourceType ?? 'str'
    this.tag = undefined

    this.elementIdSource = config.elementId ?? ''
    this.elementIdSourceType = config.elementIdSourceType ?? 'str'
    this.elementId = undefined

    this.parentSource = config.parent ?? 'body'
    this.parentSourceType = config.parentSourceType ?? 'str'
    this.parent = undefined

    this.positionSource = config.position ?? 'body'
    this.positionSourceType = config.positionSourceType ?? 'str'
    this.position = undefined

    this.slotContentSource = config.slotSourceProp ?? ''
    this.slotContentSourceType = config.slotSourcePropType ?? 'msg'
    this.slotContent = undefined

    this.slotPropMarkdown = config.slotPropMarkdown ?? false

    this.attribsSource = config.attribsSource ?? ''
    this.attribsSourceType = config.attribsSourceType ?? 'msg'

    this._ui = undefined // set in buildUI()

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)
} // ---- End of nodeInstance ---- //

// #endregion ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    // lowCode.setup(RED)

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition

// EOF
