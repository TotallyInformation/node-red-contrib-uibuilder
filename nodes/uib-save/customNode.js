/* eslint-disable sonarjs/no-duplicate-string */
/** Send an update to a specific front-end element.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2023-2024 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs').uibSaveNode} uibSaveNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const fslib  = require('../libs/fs.cjs')   // File/folder handling library (by Totally Information)
// const uiblib = require('../libs/uiblib')  // Utility library for uibuilder
const { setNodeStatus } = require('../libs/uiblib')  // Utility library for uibuilder

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-save', // Note that 'uib-update' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

// MAYBE?
// - Add optional output msg?

//#region ----- Module-level support functions ----- //

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibSaveNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars
    const RED = mod.RED
    let statusColor = 'blue'

    if (!msg.payload) {
        this.counters.fail++
        statusColor = 'red'
        this.error('⛔ msg.payload not present or empty. File not saved.')
    } else {
        let folder = this.folder
        let fname = this.fname

        const srcNode = RED.nodes.getNode(this.uibId)

        // If "Use pageName"
        if (this.usePageName === true) {
            if ( (msg._uib && msg._uib.pageName) || (msg._ui && msg._ui.pageName) ) {
                fname = msg._uib ? msg._uib.pageName : msg._ui.pageName
                folder = srcNode.sourceFolder
            } else {
                this.warn('⚠️ Use pageName requested but neither msg._uib nor msg._ui exists.')
            }
        }

        // If msg.fname or msg.folder provided, override the static setting but only if the static setting is blank
        if (!folder && msg.folder) folder = msg.folder
        if (!fname) {
            if (msg.fname) fname = msg.fname
            else if (msg.filename) fname = msg.filename
            else if (msg.fileName) fname = msg.fileName
        }

        // Don't allow .. (which would let paths escape the instanceRoot)
        if (folder.includes('..')) {
            this.warn('⚠️ Folder name contains ".." which has been removed.')
            folder = folder.replace(/\.\./g, '')
        }
        if (fname.includes('..')) {
            this.warn('⚠️ File name contains ".." which has been removed.')
            fname = fname.replace(/\.\./g, '')
        }

        if (fname) {
            // Call uibuilder shared library to save file (optional sub-folder creation and client reload)
            try {
                await fslib.writeInstanceFile(this.url, folder, fname, msg.payload, this.createFolder, this.reload)
                if (this.reload === true ) {
                    // Reload connected clients if required by sending them a reload msg
                    srcNode.sendToFe(
                        {
                            _ui: { 'method': 'reload' },
                            topic: 'uib-save reload'
                        },
                        this,
                        'uiBuilder'
                    )
                }
                this.counters.success++
                statusColor = 'green'
            } catch (err) {
                this.counters.fail++
                statusColor = 'red'
                this.error(`⛔ ${err.message}`, err)
            }
        } else {
            this.counters.fail++
            statusColor = 'red'
            this.error('⛔ No file name found. Provide in node or use msg.fname, msg.filename, or msg.fileName. File not saved.')
        }
    }

    this.statusDisplay = { fill: statusColor, shape: 'dot', text: `Saved: ${this.counters.success}, Failed: ${this.counters.fail}` }
    setNodeStatus( this )

    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibSaveNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibSaveNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED
    if (RED === null) return

    // @ts-ignore Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.url = config.url ?? ''
    this.folder = config.folder ?? ''
    this.fname = config.fname ?? ''
    this.createFolder = config.createFolder ?? false
    this.reload = config.reload ?? false
    this.usePageName = config.usePageName ?? false
    this.encoding = config.encoding ?? 'utf8'
    this.mode = config.mode ?? 0o666
    this.uibId = config.uibId ?? ''
    this.name = config.name ?? ''
    this.topic = config.topic ?? ''

    if (this.url === '' || this.uibId === '') {
        this.error(`No uibuilder instance provided, cannot continue. url = '${this.url}'`)
        return
    }

    this.counters = {
        success: 0,
        fail: 0,
    }
    this.statusDisplay = { fill: 'blue', shape: 'dot', text: `Saved: ${this.counters.success}, Failed: ${this.counters.fail}` }
    setNodeStatus( this )

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
