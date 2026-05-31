/* eslint-disable jsdoc/valid-types */
/**
 * Copyright (c) 2017-2026 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs.js').uibuilderEditorVars} uibuilderEditorVars
 */

// #region ------ uibuilder module-level globals ------ //

// #region ------ Require packages ------ //

// uibuilder custom
const uiblib = require('../libs/uiblib.cjs') // Utility library for uibuilder
const tilib = require('../libs/tilib.cjs') // General purpose library (by Totally Information)
const fslib = require('../libs/fs.cjs') // File/folder handling library (by Totally Information)
// Template configuration metadata
const templateConf = require('../../templates/template_dependencies.js')
// Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
const sockets = require('../libs/socket.cjs')
// Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
const web = require('../libs/web.cjs')

const path = require('node:path')

/** @type {uibConfig} The uibuilder global configuration object, used throughout all nodes and libraries. */
const uibGlobalConfig = require('../libs/uibGlobalConfig.cjs')

// #endregion ----- Require packages ----- //

// `uib` is the previously used variable containing the uibuilder global configuration - slowly migrating to the module version.
const uib = uibGlobalConfig

/** Dummy logging
 * @type {Object<string, Function>}
 */
const dummyLog = {
    fatal: function() {}, // fatal - only those errors which make the application unusable should be recorded
    error: function() {}, // error - record errors which are deemed fatal for a particular request + fatal errors
    warn: function() {}, // warn - record problems which are non fatal + errors + fatal errors
    info: function() {}, // info - record information about the general running of the application + warn + error + fatal errors
    debug: function() {}, // debug - record information which is more verbose than info + info + warn + error + fatal errors
    trace: function() {}, // trace - record very detailed logging + debug + info + warn + error + fatal errors
}
let log = dummyLog // reset to RED.log or anything else you fancy at any point

// We need to define chokidar here - it is required later - only if reload is true and it has native dependencies which can cause install issues
let chokidar

// #endregion ----- uibuilder module-level globals ----- //

// #region ------ module-level functions ------ //

/** Create external event listeners
 * Called for every uibuilder node instance
 * @param {uibNode} node Reference to node instance
 */
function externalEvents(node) {
    const RED = uib.RED
    // The event name to listen out for
    const eventName = `UIBUILDER/send/${node.url}`
    node.sender = (msg) => {
        // this.send(msg)
        sockets.sendToFe(msg, node, uib.ioChannels.server)
    }
    // Create new listener for the given topic, they are removed on close
    RED.events.on(eventName, node.sender)
}

// #endregion ----- End of mod-level fns ----- //

// NOTE: uib globals and other config has now been moved to the runtime plugin - including settings.js overrides
/** 1) The function that defines the node - runs even if no nodes are deployed
 * @param {runtimeRED} RED Node-RED's runtime object
 */
function Uib(RED) {
    // NB: A reference to the RED object (uib.RED) is defined in the runtime plugin and passed to the uibGlobalConfig module, so it can be accessed from any module that requires it.

    /** 2) Register the node by name. This must be called before overriding any of the
     *  Node functions.
     */
    RED.nodes.registerType(uib.moduleName, nodeInstance, {
        credentials: {
            jwtSecret: { type: 'password', },
        },
        // Makes these available to the editor as RED.settings.uibuilderxxxxxx
        settings: {
            // The server's NODE_ENV environment var (e.g. PRODUCTION or DEVELOPMENT)
            uibuilderNodeEnv: { value: process.env.NODE_ENV, exportable: true, },
            // Available templates and details
            uibuilderTemplates: { value: templateConf, exportable: true, },
            // Custom server details
            uibuilderCustomServer: { value: (uib.customServer), exportable: true, },
            // Current version of uibuilder
            uibuilderCurrentVersion: { value: (uib.version), exportable: true, },
            // Should the editor tell the user that a redeploy is needed (based on uib versions)
            uibuilderRedeployNeeded: { value: uib.reDeployNeeded, exportable: true, },
            // TODO REMOVE? since only correct at first load and an API is needed anyway. List of the deployed uib instances [{node_id: url}]
            uibuilderInstances: { value: uib.instances, exportable: true, },
            // uibRoot
            uibuilderRootFolder: { value: uib.rootFolder, exportable: true, },
        },
    })
} // ==== End of Uib ==== //

/** 2) All of the initialisation of the Node Instance
 * This is callled once for each uibuilder node instance added to a flow
 * THIS IS ONLY RUN IF A NODE HAS BEEN OR IS BEING DEPLOYED.
 * type {function(this:runtimeNode&uib, runtimeNodeConfig & uib):void}
 * @param {runtimeNodeConfig & uibuilderEditorVars} config The configuration object passed from the Admin interface (see the matching HTML file)
 * @this {uibNode}
 */
function nodeInstance(config) {
    if ( uib.RED === null ) return
    const RED = uib.RED

    // If someone deploys but ignored the error about blank URL's - don't set up the node.
    if (!config.url || config.okToGo === false ) {
        RED.log.error(`🌐🛑[uibuilder] uibuilder node ${config.id} deployed with invalid URL in flow ${config.z} - not configuring`)
        return
    }

    /** Create the node instance - `this` can only be referenced AFTER here
     * @param {uibNode} this _
     */
    RED.nodes.createNode(this, config)

    // #region ====== Create local copies of the node configuration (as defined in the .html file) ====== //
    // NB: this.id and this.type are also available
    this.name = config.name ?? ''
    this.topic = config.topic ?? ''
    this.url = config.url // Undefined or '' is not valid
    this.oldUrl = config.oldUrl
    this.instancePath = config.instancePath ?? this.url // Allows for the node to use a different folder name than the url
    this.fwdInMessages = config.fwdInMessages ?? false
    this.allowScripts = config.allowScripts ?? false
    this.allowStyles = config.allowStyles ?? false
    this.copyIndex = config.copyIndex ?? true // DEPRECATED
    this.templateFolder = config.templateFolder ?? templateConf.blank.folder
    this.extTemplate = config.extTemplate
    this.showfolder = config.showfolder ?? false
    this.reload = config.reload ?? false
    this.sourceFolder = config.sourceFolder // NB: Do not add a default here as undefined triggers a check for index.html in web.js:setupInstanceStatic
    this.deployedVersion = config.deployedVersion
    this.showMsgUib = config.showMsgUib // Show additional client id in standard msgs (see socket.js)
    this.title = config.title ?? ''
    this.descr = config.descr ?? ''
    this.editurl = config.editurl ?? ''
    // #endregion ====== Local node config copy ====== //

    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] ================ instance registered ================`)
    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] node keys: ${JSON.stringify(Object.keys(this))}`)
    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] config keys: ${JSON.stringify(Object.keys(config))}`)
    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] Deployed Version: ${this.deployedVersion}`)

    if ( !this.url || typeof this.url !== 'string' || this.url.length < 1 ) {
        log.error('🌐🛑[uibuilder:nodeInstance] No valid URL provided. Cannot set up this uibuilder instance')
        this.statusDisplay = { fill: 'red', shape: 'dot', text: 'ERROR:NOT CONFIGURED - No URL', }
        uiblib.setNodeStatus( this )
        return
    }

    this.statusDisplay = { fill: 'blue', shape: 'dot', text: 'Configuring node', }
    // if ( this.useSecurity === true ) this.statusDisplay.fill = 'yellow'
    // if ( this.allowUnauth === true ) this.statusDisplay.shape = 'ring'
    uiblib.setNodeStatus( this )

    // #region ====== Instance logging/audit ====== //

    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] Node instance settings: ${JSON.stringify({ name: this.name, topic: this.topic, url: this.url, copyIndex: this.copyIndex, fwdIn: this.fwdInMessages, allowScripts: this.allowScripts, allowStyles: this.allowStyles, showfolder: this.showfolder, })}`)

    // Keep a log of the active uib.instances @since 2019-02-02
    uib.instances[this.id] = this.url
    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] Node uib.Instances Registered: ${JSON.stringify(uib.instances)}`)
    uib.apps[this.url] = {
        node: this.id,
        url: this.url,
        title: this.title,
        descr: this.descr,
        type: 'uibuilder',
    }

    // Keep track of the number of times each instance is deployed.
    // The initial deployment = 1
    if ( Object.prototype.hasOwnProperty.call(uib.deployments, this.id) ) uib.deployments[this.id]++
    else uib.deployments[this.id] = 1
    log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] Number of uib.Deployments: ${uib.deployments[this.id]}` )

    // Track the number of messages received by this instance
    this.rcvMsgCount = 0

    // #endregion ====== Instance logging/audit ====== //

    // #region ====== Local folder structure ====== //

    // NB: uibRoot folder checks done in runtimeSetup()

    // Double-check that this.instancePath has a valid value
    if ( !this.instancePath ) this.instancePath = this.url

    /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
     *   Files in this folder are also served to URL but take preference
     *   over those in the nodes folders (which act as defaults) @type {string}
     */
    this.instanceFolder = path.join(/** @type {string} */ (uib.rootFolder), this.instancePath)
    // ! TODO Need to find a way to make this more robust for when folder rename fails
    // Check whether the url has been changed. If so, rename the folder
    if ( this.oldUrl !== undefined && this.oldUrl !== '' && this.url !== this.oldUrl ) {
        // rename (move) folder if possible - but don't overwrite
        try {
            fslib.moveSync(path.join(/** @type {string} */ (uib.rootFolder), this.oldUrl), this.instanceFolder, { overwrite: false, })
            log.trace(`🌐[uibuilder:nodeInstance:${this.url}] Folder renamed from ${this.oldUrl} to ${this.url}`)
            // Notify other nodes
            RED.events.emit('UIBUILDER/URL-change', { oldURL: this.oldUrl, newURL: this.url, folder: this.instanceFolder, } )
            RED.events.emit(`UIBUILDER/URL-change/${this.oldUrl}`, { oldURL: this.oldUrl, newURL: this.url, folder: this.instanceFolder, } )
        } catch (e) {
            log.trace(`🌐[uibuilder[:nodeInstance:${this.url}] Could not rename folder. ${e.message}`)
            // Not worried if the source doesn't exist - this will regularly happen when changing the name BEFORE first deploy.
            if ( e.code !== 'ENOENT' ) {
                log.error(`🌐🛑[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal. Manually change the URL back to the original. newUrl=${this.url}, oldUrl=${this.oldUrl}, Fldr=${this.instanceFolder}. Error=${e.message}`, e)
            }
        }
        // TODO Move this to a function in web.js
        // Remove the old router and remove from the routes list
        delete web.routers.instances[this.oldUrl]
        delete web.instanceRouters[this.oldUrl]
        // we continue to do the normal checks in case something failed or if this is an initial deploy (so no original folder exists)
    }

    // Does the instance folder exist? If not, create it and copy requested template to it. Otherwise make sure it is accessible.
    let instanceFoldersOK = true
    if ( !fslib.existsSync(this.instanceFolder) ) {
        // Folder does not exist so create it
        try {
            fslib.ensureDirSync(this.instanceFolder) // creates the folder if it doesn't exist
        } catch (e) {
            log.error(`🌐🛑[uibuilder:nodeInstance] CREATE OF INSTANCE FOLDER '${this.instanceFolder}' FAILED. Fatal. Error=${e.message}`, e)
            instanceFoldersOK = false
        }

        // Copy the template files to the instance folder (replaceTemplate is async, we don't care about result) - only if create succeded
        if (instanceFoldersOK === true) {
            (async () => {
                try {
                    await fslib.replaceTemplate({
                        url: this.url,
                        template: this.templateFolder,
                        extTemplate: this.extTemplate,
                        cmd: 'startup-CheckTemplate',
                        templateConf,
                        uib,
                        log,
                    })
                } catch (e) {
                    log.error(`🌐🛑[uibuilder:nodeInstance] COPY OF TEMPLATE '${this.templateFolder}' FAILED. Fatal. Error=${e.message}`, e)
                    instanceFoldersOK = false
                }
            })()
        }
    } else {
        // Instance folder already exists so check that it is accessible
        try {
            fslib.accessSync(this.instanceFolder, 'w')
        } catch (e) {
            log.error(`🌐🛑[uibuilder:nodeInstance:${this.url}] Local custom folder ERROR`, e.message)
            instanceFoldersOK = false
        }
    }

    // We've checked that the custom folder is there and has the correct structure
    // TODO Add check for src folder?
    if ( instanceFoldersOK === true ) {
        // local custom folders are there ...
        log.trace(`🌐[uibuilder:nodeInstance:${this.url}] Using local front-end folders in: ${this.instanceFolder}` )
    } else {
        // Local custom folders are not right!
        log.error(`🌐🛑[uibuilder:nodeInstance:${this.url}] Wanted to use local front-end folders in ${this.instanceFolder} but could not`)
    }

    // #endregion ====== End of Local folder structure ====== //

    // If security turned on, set up security for this instance - NB: most sec processing done from socket.js
    // if ( this.useSecurity === true ) security.setupInstance(this)

    // Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this)

    /** Socket.IO instance configuration. Each deployed instance has it's own namespace */
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    log.trace(`🌐[uibuilder:nodeInstance:${this.url}] URL . . . . .  : ${tilib.urlJoin( uib.nodeRoot, this.url )}`)
    log.trace(`🌐[uibuilder:nodeInstance:${this.url}] Source files . : ${this.instanceFolder}`)

    // We only do the following if io is not already assigned (e.g. after a redeploy)
    this.statusDisplay.text = 'Node Initialised'
    uiblib.setNodeStatus( this )

    // 3) Add event handler to process inbound messages
    this.on('input', inputMsgHandler)

    // 3rd-party node (non-flow) Event handlers (e.g. uib-sender)
    externalEvents(this)

    // If this.reload is true, then we want to trigger a reload of the client when FE files change
    if ( this.reload === true ) {
        try {
            // this is a local npm workspace package and so not in package.json dependencies
            if (!chokidar) ({ chokidar, } = require('../../packages/uib-fs-utils'))
            log.debug(`🌐🪲[uibuilder:nodeInstance:${this.url}] Successfully loaded chokidar for file watching, it will be used by all further instances needing it.`)
        } catch (e) {
            log.error(`🌐🛑[uibuilder:nodeInstance:${this.url}] Failed to load chokidar for file watching. Reload on file change will not work. ${e.message}`, e)
            return
        }
        if (chokidar) {
            // Watch the instance folder for changes and trigger a reload if they happen
            try {
                this.watcher = chokidar.watch(this.instanceFolder, {
                    cwd: this.instanceFolder,
                    persistent: true,
                    // Doesn't fire on initial setup
                    ignoreInitial: true,
                    // Only check up to 9 deep
                    depth: 9,
                    // Waits for writes to finish (adds 100ms polling, waits until stable for 2sec)
                    // Also adds 2 sec delay when renaming files so try to do without.
                    // awaitWriteFinish: true,
                })
                // @ts-ignore
                this.watcher.on('all', (event, path) => {
                    log.info(`🌐[uibuilder:nodeInstance:${this.url}] File change detected (${event}): ${path}. Triggering client reload.`)
                    sockets.sendToFe({ _uib: { reload: true, }, }, this, uib.ioChannels.server)
                })
            } catch (error) {
                console.error(`🌐🛑[uibuilder:nodeInstance:${this.url}] Error setting up file watcher: ${error.message}`, chokidar)
            }
        }
    }

    /** Do something when Node-RED is closing down which includes when this node instance is redeployed
     * Note use of arrow function so as to retain the correct `this` context
     */
    this.on('close', (removed, done) => {
        log.trace(`🌐[uibuilder[:nodeInstance:close:${this.url}] nodeInstance:on-close: ${removed ? 'Node Removed' : 'Node (re)deployed'}`)

        // Let all the clients know Node-RED is shutting down (or a full/modified nodes redeploy)
        if (!removed) {
            sockets.sendToFe({ uibuilderCtrl: 'shutdown', }, this, uib.ioChannels.control)
        }

        // Stop inputs being processed immediately
        this.removeListener('input', inputMsgHandler)

        // Cancel any event listeners for this node
        RED.events.off(`UIBUILDER/send/${this.url}`, this.sender)

        // Do any complex close processing here if needed - MUST BE LAST
        uiblib.instanceClose(this, uib, sockets, web, done, removed)
        // done()
    })

    // TODO Move to web
    // Shows an instance details debug page
    RED.httpAdmin.get(`/uibuilder/instance/${this.url}`, (req, res) => {
        res.status(200).send( web.showInstanceDetails(req, this) )
    })

    RED.events.emit('UIBUILDER/instanceSetupComplete', this)
    RED.events.emit(`UIBUILDER/instanceSetupComplete/${this.url}`, this)
} // ----- end of nodeInstance ----- //

/** 3) Handler function for node flow input events (when a node instance receives a msg from the flow)
 * NOTE: `this` context is still the parent within the function.
 *       Also, this function does NOT have access to RED
 * see https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @returns {undefined|null} Not a lot
 * @this {uibNode}
 */
function inputMsgHandler (msg, send, done) {
    // const RED = uib.RED

    log.trace(`🌐[uibuilder[:${this.url}] nodeInstance:nodeInputHandler - emit received msg - Namespace: ${this.url}`) // debug

    // If msg is null, nothing will be sent
    if ( msg !== null ) {
        // if msg isn't null and isn't an object
        // NOTE: This is paranoid and shouldn't be possible!
        if ( typeof msg !== 'object' ) {
            // Force msg to be an object with payload of original msg
            msg = { payload: msg, }
        }
        // Add topic from node config if present and not present in msg
        if ( !(Object.prototype.hasOwnProperty.call(msg, 'topic')) || msg.topic === '' ) {
            if ( this.topic !== '' ) msg.topic = this.topic
            else msg.topic = uib.moduleName
        }
    }

    // Keep this fn small for readability so offload any further, more customised code to another fn
    this.rcvMsgCount++
    log.trace(`🌐[uibuilder[:uiblib:inputHandler:${this.url}] msg received via FLOW. ${this.rcvMsgCount} messages received. ${JSON.stringify(msg)}`)

    // If the input msg is a uibuilder control msg, then drop it to prevent loops
    if ( Object.prototype.hasOwnProperty.call(msg, 'uibuilderCtrl') ) return null

    // If msg has _ui property - is it from the client? If so, remove it.
    if (msg._ui && msg._ui.from && msg._ui.from === 'client') delete msg._ui

    // setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Received #' + this.rcvMsgCount}, node)

    // Remove script/style content if admin settings don't allow
    if ( this.allowScripts !== true && Object.prototype.hasOwnProperty.call(msg, 'script') ) delete msg.script
    if ( this.allowStyles !== true && Object.prototype.hasOwnProperty.call(msg, 'style') ) delete msg.style

    // pass the complete msg object to the uibuilder client
    if ( (!Object.prototype.hasOwnProperty.call(msg, 'topic')) && (this.topic !== '') ) msg.topic = this.topic
    sockets.sendToFe( msg, this, uib.ioChannels.server )

    // Pass on to output port 1 if wanted
    if (this.fwdInMessages) {
        // Send on the input msg to output
        send(msg)
        done()
        log.trace(`🌐[uibuilder[:uiblib:inputHandler:${this.url}] msg passed downstream to next node. ${JSON.stringify(msg)}`)
    }

    // tilib.dumpMem('On Msg')
} // ----- End of inputMsgHandler ----- //

/** Export the function that defines the node */
module.exports = Uib
