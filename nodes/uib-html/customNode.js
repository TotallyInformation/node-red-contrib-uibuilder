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
 * @typedef {import('../../typedefs').uibHtmlNode} uibHtmlNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const jsdom = require("jsdom");
const { JSDOM } = jsdom

//#region --- Log util - needed for the ui class ---
/** Default log level - Error & Warn */
let logLevel = 5 // isMinified ? 0 : 1  // When using minified lib, assume production and only log errors otherwise also log warn
// function changeLogLevel(level) {
//     logLevel = level
//     console.trace = logLevel < 4 ? function(){} : console.trace
//     console.debug = logLevel < 2 ? function(){} : console.debug
//     if ( logLevel < 1 ) {
//         console.log = console.group = console.groupEnd =  function(){}
//     }
// }

// Experimental
const LOG_STYLES = {
    // 0
    error: {
        css: 'background: red; color: black;',
        txtCss: 'color: red; ',
        pre: '⛔ ',
        console: 'error',  // or trace
    },
    // 1
    warn: {
        css: 'background: darkorange; color: black;',
        txtCss: 'color: darkorange; ',
        pre: '⚠ ',
        console: 'warn',
    },
    // 2
    info: {
        css: 'background: aqua; color: black;',
        txtCss: 'color: aqua;',
        pre: '❗ ',
        console: 'info',
    },
    // 3
    log: {
        css: 'background: grey; color: yellow;',
        txtCss: 'color: grey;',
        pre: '',
        console: 'log',
    },
    // 4
    debug: {
        css: 'background: chartreuse; color: black;',
        txtCss: 'color: chartreuse;',
        pre: '',
        console: 'debug',
    },
    // 5
    trace: {
        css: 'background: indigo; color: yellow;',
        txtCss: 'color: hotpink;',
        pre: '',
        console: 'log',
    },

    names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
    reset: 'color: inherit;',
    head: 'font-weight:bold; font-style:italic;',
    level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
}
/** Custom logging. e.g. log(2, 'here:there', 'jiminy', {fred:'jim'})()
 * @returns {Function} Log function @example log(2, 'here:there', 'jiminy', {fred:'jim'})()
 */
function log() {
    // Get the args
    const args = Array.prototype.slice.call(arguments)

    // 1st arg is the log level/type
    let level = args.shift()
    let strLevel
    switch (level) {
        case 'trace':
        case 5: {
            if (logLevel < 5) break
            level = 5 // make sure level is numeric
            strLevel = 'trace'
            break
        }

        case 'debug':
        case 4: {
            if (logLevel < 4) break
            level = 4
            strLevel = 'debug'
            break
        }

        case 'log':
        case 3: {
            if (logLevel < 3) break
            level = 3
            strLevel = 'log'
            break
        }

        case 'info':
        case '':
        case 2: {
            if (logLevel < 2) break
            level = 2
            strLevel = 'info'
            break
        }

        case 'warn':
        case 1: {
            if (logLevel < 1) break
            level = 1
            strLevel = 'warn'
            break
        }

        case 'error':
        case 'err':
        case 0: {
            if (logLevel < 0) break
            level = 0
            strLevel = 'error'
            break
        }

        default: {
            level = -1
            break
        }

    }

    // If set to something unknown, no log output
    if (strLevel === undefined) return function () { }

    // 2nd arg is a heading that will be colour highlighted
    const head = args.shift()

    // Bind back to console.log (could use console[strLevel] but some levels ignore some formatting, use console.xxx directly or dedicated fn)
    return Function.prototype.bind.call(
        console[LOG_STYLES[strLevel].console],
        console,
        `%c${LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`, `${LOG_STYLES.level} ${LOG_STYLES[strLevel].css}`, `${LOG_STYLES.head} ${LOG_STYLES[strLevel].txtCss}`,
        ...args
    )
}
//#endregion

// Ui class copied from src/front-end-module/ui.js
const Ui = require('../libs/ui.js')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-html', // Note that 'uib-update' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibHtmlNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars

    // const RED = mod.RED

    // If msg has _ui property - is it from the client? If so, remove it.
    if (msg._ui && msg._ui.from && msg._ui.from === 'client') delete msg._ui

    if (msg._ui) {
        const dom = new JSDOM(/*html*/`<!DOCTYPE html>`)

        // Create instance of ui class
        const ui = new Ui(dom.window, null, null)

        // Updates the virtual DOM
        ui.ui(msg._ui)

        console.log(Object.keys(msg))

        // Copy the input msg
        const out = {...msg}
        // remove _ui
        delete out._ui

        // Add the topic defined in the editor if not supplied by the msg
        if (!msg.topic && this.topic) out.topic = this.topic

        // add the HTML
        try {
            out.payload = dom.serialize()
        } catch (err) {
            mod.RED.log.error(`[uib-html:inputMsgHandler] Cannot serialise the DOM. ${err.message} `, err)
        }
        
        // And send it on its way
        send(out)

        // Make sure that the v DOM is closed down
        dom.window.close()
    }

    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibHtmlNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibHtmlNode}
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

    // this.tagSource = config.tag ?? ''
    // this.tagSourceType = config.tagSourceType ?? 'str'
    // this.tag = undefined

    // this.elementIdSource = config.elementId ?? ''
    // this.elementIdSourceType = config.elementIdSourceType ?? 'str'
    // this.elementId = undefined

    // this.parentSource = config.parent ?? 'body'
    // this.parentSourceType = config.parentSourceType ?? 'str'
    // this.parent = undefined

    // this.positionSource = config.position ?? 'body'
    // this.positionSourceType = config.positionSourceType ?? 'str'
    // this.position = undefined

    // this.slotContentSource = config.slotSourceProp ?? ''
    // this.slotContentSourceType = config.slotSourcePropType ?? 'msg'
    // this.slotContent = undefined

    // this.slotPropMarkdown = config.slotPropMarkdown ?? false

    // this.attribsSource = config.attribsSource ?? ''
    // this.attribsSourceType = config.attribsSourceType ?? 'msg'

    this._ui = undefined // set in buildUI()

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)
} // ---- End of nodeInstance ---- //

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
