/* eslint-disable sonarjs/no-duplicate-string */
/** Send an update to a specific front-end element.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2023-2023 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').uibUpdNode} uibUpdNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-update', // Note that 'uib-update' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** Build the output and send the msg (clone input msg and add _ui prop)
 * @param {*} msg The input or custom event msg data
 * @param {runtimeNode & uibUpdNode} node reference to node instance
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

/**
 * Parse a returned global/flow variable reference from typedInput
 * Borrowed from RED.util
 * @param {string} key The value returned by typedInput
 * @returns {*} Object containing either just the key or the key and the store name as appropriate
 */
function parseContextStore(key) {
    const parts = {}
    const m = /^#:\((\S+?)\)::(.*)$/.exec(key)
    if (m) {
        parts.store = m[1]
        parts.key = m[2]
    } else {
        parts.key = key
    }
    return parts
}

// ! TODO: How do we handle asynch flow/global access? Wrap in try and error out if the store needs async.
/** Evaluate a typed input value from its type
 * @param {string} propName The name of the property to evaluate
 * @param {*} propType The typedInput type
 * @param {runtimeNode & uibUpdNode} node reference to node instance
 * @param {*} msg The input or custom event msg data
 * @returns {*} The value of the typed input field - undefined if input not defined
 */
function evalTypedInput(propName, propType, node, msg) {
    const RED = mod.RED
    let result
    if (propType === 'flow' || propType === 'global') {
        const contextKey = parseContextStore(node[propName])
        // if (/\[msg/.test(contextKey.key)) {
        //     The key has a nest msg. reference to evaluate first
        //     contextKey.key = normalisePropertyExpression(contextKey.key, msg, true)
        // }
        result = node.context()[propType].get(contextKey.key, contextKey.store)
    } else {
        result = RED.util.evaluateNodeProperty(node[propName], propType, node, msg)
    }
    return result
}

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibUpdNode}
 */
function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars

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
 * @param {runtimeNodeConfig & uibUpdNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibUpdNode}
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

    this.cssSelector = config.cssSelector ?? 'body'
    this.cssSelectorType = config.cssSelectorType ?? 'str'

    this.slotSourceProp = config.slotSourceProp ?? ''
    this.slotSourcePropType = config.slotSourcePropType ?? 'msg'

    this.slotPropMarkdown = config.slotPropMarkdown ?? false

    this._ui = undefined // set in buildUI()

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

} // ---- End of nodeInstance ---- //

//#endregion ----- Module-level support functions ----- //

//#region ----- UI definition builders ----- //

/** Create/update the _ui object and retain for replay
 * @param {*} msg incoming msg
 * @param {runtimeNode & uibUpdNode} node reference to node instance
 */
function buildUi(msg, node) {
    console.log({
        'name': node.name,
        'topic': node.topic,

        'cssSelector': evalTypedInput('cssSelector', node.cssSelectorType, node, msg),
        'cssSelectorType': node.cssSelectorType,

        'slotSourceProp': evalTypedInput('slotSourceProp', node.slotSourcePropType, node, msg),
        'slotSourcePropType': node.slotSourcePropType,

        'slotPropMarkdown': node.slotPropMarkdown,
    })

    // Allow combination of msg._ui and this node allowing chaining of the nodes
    if ( msg._ui ) node._ui = msg._ui
    else node._ui = []

    // NB: eval returns undefined for undefined input so no output produced
    node._ui.push({
        'method': 'update',
        'components': [
            {
                'selector': evalTypedInput('cssSelector', node.cssSelectorType, node, msg),
                'slot': evalTypedInput('slotSourceProp', node.slotSourcePropType, node, msg),
            }
        ]
    })

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
