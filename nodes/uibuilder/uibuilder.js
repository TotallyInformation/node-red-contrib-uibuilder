/* eslint-disable block-scoped-var */
/**
 * Copyright (c) 2017-2023 Julian Knight (Totally Information)
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
 **/
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs.js').uibuilderEditorVars} uibuilderEditorVars
 */

//#region ------ Require packages ------ //
// uibuilder custom
const uiblib = require('../libs/uiblib.js')  // Utility library for uibuilder
const tilib = require('../libs/tilib.js')   // General purpose library (by Totally Information)
const packageMgt = require('../libs/package-mgt.js')
const tiEvents = require('@totallyinformation/ti-common-event-handler') // https://github.com/EventEmitter2/EventEmitter2
const fslib  = require('../libs/fs.js')   // File/folder handling library (by Totally Information)
// Wrap these require's with try/catch to force better error reports - just in case any of the modules have issues
try {
    // Template configuration metadata
    var templateConf = require('../../templates/template_dependencies.js') // eslint-disable-line no-var
} catch (e) {
    console.error('[uibuilder] REQUIRE TEMPLATE-CONF failed::', e)
}
try {
    // Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
    var sockets = require('../libs/socket.js') // eslint-disable-line no-var
} catch (e) {
    console.error('[uibuilder] REQUIRE SOCKET failed::', e)
}
try {
    // Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
    var web = require('../libs/web.js') // eslint-disable-line no-var
} catch (e) {
    console.error('[uibuilder] REQUIRE WEB failed::', e)
}
// try {
//     var security      = require('./libs/sec-lib') // Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
// } catch (e) {
//     console.error('[uibuilder] REQUIRE SECURITY failed::', e)
// }

// Core node.js
const path = require('path')

// TODO - ELIMINATE - move fs processing to uibFs
const fs = require('fs-extra')  // https://github.com/jprichardson/node-fs-extra#nodejs-fs-extra

//#endregion ----- Require packages ----- //

//#region ------ uibuilder module-level globals ------ //

/** @type {uibConfig} */
const uib = {
    me: fslib.readJSONSync(path.join( __dirname, '..', '..', 'package.json' )),
    moduleName: 'uibuilder',
    nodeRoot: '',
    deployments: {},
    instances: {},
    apps: {},
    masterTemplateFolder: path.join( __dirname, '..', '..', 'templates' ),
    masterStaticFeFolder: path.join( __dirname, '..', '..', 'front-end' ),
    rootFolder: null,
    configFolder: null,
    configFolderName: '.config',
    commonFolder: null,
    commonFolderName: 'common',
    sioUseMwName: 'sioUse.js',
    sioMsgOutMwName: 'sioMsgOut.js',
    ioChannels: { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder' },
    nodeVersion: process.version.replace('v', '').split('.'),
    staticOpts: {}, // { maxAge: 31536000, immutable: true, },
    deleteOnDelete: {},
    customServer: { // set correctly in libs/web.js:_webSetup()
        port: undefined,
        type: 'http',
        host: undefined,
        hostName: undefined,
        isCustom: false,
        serverOptions: {},
    },
    reDeployNeeded: '4.1.2',
    degitEmitter: undefined,
    RED: null,
    instanceApiAllowed: false,
}

/** Current module version (taken from package.json) @constant {string} uib.version */
uib.version = uib.me.version

/** Dummy logging
 * @type {Object<string, Function>} */
const dummyLog = {
    fatal: function() {}, // fatal - only those errors which make the application unusable should be recorded
    error: function() {}, // error - record errors which are deemed fatal for a particular request + fatal errors
    warn: function() {},  // warn - record problems which are non fatal + errors + fatal errors
    info: function() {},  // info - record information about the general running of the application + warn + error + fatal errors
    debug: function() {}, // debug - record information which is more verbose than info + info + warn + error + fatal errors
    trace: function() {}, // trace - record very detailed logging + debug + info + warn + error + fatal errors
}
let log = dummyLog // reset to RED.log or anything else you fancy at any point

// Placeholder - set in export
let userDir = ''

//#endregion ----- uibuilder module-level globals ----- //

//#region ------ module-level functions ------ //

/** Create external event listeners
 * Called for every uibuilder node instance
 * @param {uibNode} node Reference to node instance
 */
function externalEvents(node) {

    // The event name to listen out for
    const eventName = `node-red-contrib-uibuilder/${node.url}`
    // console.log('[uibuilder:externalEvents] ', eventName )

    // The function to execute when an event is received
    const sender = (msg) => {
        // this.send(msg)
        // console.log('>> EVENT tofe: ', msg )
        sockets.sendToFe(msg, node.url, uib.ioChannels.server)
    }

    // Create new listener for the given topic, they are removed on close
    tiEvents.on(eventName, sender)

    // console.log('>>>> THIS >>>>> ', node)
}

//#endregion ----- End of mod-level fns ----- //

/** 1) The function that defines the node
 * @param {runtimeRED} RED Node-RED's runtime object */
function Uib(RED) {
    uib.RED = RED

    runtimeSetup() // (1a)

    /** 2) Register the node by name. This must be called before overriding any of the
     *  Node functions. */
    RED.nodes.registerType(uib.moduleName, nodeInstance, {
        credentials: {
            jwtSecret: { type: 'password' },
        },
        // Makes these available to the editor as RED.settings.uibuilderxxxxxx
        settings: {
            // The server's NODE_ENV environment var (e.g. PRODUCTION or DEVELOPMENT)
            uibuilderNodeEnv: { value: process.env.NODE_ENV, exportable: true },
            // Available templates and details
            uibuilderTemplates: { value: templateConf, exportable: true },
            // Custom server details
            uibuilderCustomServer: { value: (uib.customServer), exportable: true },
            // Current version of uibuilder
            uibuilderCurrentVersion: { value: (uib.version), exportable: true },
            // Should the editor tell the user that a redeploy is needed (based on uib versions)
            uibuilderRedeployNeeded: { value: uib.reDeployNeeded, exportable: true },
            // TODO REMOVE? since only correct at first load and an API is needed anyway. List of the deployed uib instances [{node_id: url}]
            uibuilderInstances: { value: uib.instances, exportable: true },
            // uibRoot
            uibuilderRootFolder: { value: uib.rootFolder, exportable: true },
        },
    })

    // // TODO: Remove this debug info
    // setTimeout(function(){
    //     tilib.dumpMem('Module')
    //     web.dumpRoutes(true)
    // }, 2000)
} // ==== End of Uib ==== //

/** 1a) All of the initialisation of the Node
 * This is only run once no matter how many uib node instances are added to a flow
 */
function runtimeSetup() { // eslint-disable-line sonarjs/cognitive-complexity
    if ( uib.RED === null ) return
    const RED = uib.RED

    // Add deep find utility function to RED.util so it can be used inside function nodes
    RED.util.uib = {
        /** Recursive object deep find
         * @param {*} obj The object to be searched
         * @param {Function} matcher Function that, if returns true, will result in cb(obj) being called
         * @param {Function} cb Callback function that takes a single arg `obj`
         */
        deepObjFind: (obj, matcher, cb) => {
            if (matcher(obj)) {
                cb(obj)
            }
            for (const key in obj) {
                if (typeof obj[key] === 'object') {
                    RED.util.uib.deepObjFind(obj[key], matcher, cb)
                }
            }
        },
        /** Return a list of all instances
         * @returns {object} List of all registered uibuilder instances
         */
        listAllApps: () => {
            return uib.apps
        }
    }

    //#region ----- back-end debugging ----- //
    log = RED.log
    log.trace('[uibuilder:runtimeSetup] ----------------- uibuilder - module started -----------------')
    //#endregion ----- back-end debugging ----- //

    // When uibuilder enters runtime state, show the details in the log
    let initialised = false
    RED.events.on('runtime-event', function(event) {
        if (event.id === 'runtime-state' && initialised === false ) {
            initialised = true
            const myroot = uib.nodeRoot === '' ? '/' : uib.nodeRoot
            RED.log.info('+-----------------------------------------------------')
            RED.log.info(`| ${uib.moduleName} v${uib.version} initialised 📗`)
            RED.log.info(`| root folder: ${uib.rootFolder}`)
            if ( uib.customServer.isCustom === true ) {
                RED.log.info('| Using custom ExpressJS webserver at:')
                RED.log.info(`|   ${uib.customServer.type}://${uib.customServer.host}:${uib.customServer.port}${uib.nodeRoot} or ${uib.customServer.type}://localhost:${uib.customServer.port}${myroot}`)
            } else {
                RED.log.info('| Using Node-RED\'s webserver at:')
                RED.log.info(`|   ${RED.settings.https ? 'https' : 'http'}://${RED.settings.uiHost}:${RED.settings.uiPort}${myroot}`)
            }
            RED.log.info('| Installed packages:')
            // @ts-ignore
            const pkgs = Object.keys(packageMgt.uibPackageJson.uibuilder.packages)
            for (let i = 0; i < pkgs.length; i += 4) {
                const k = []
                for (let j = 0; j <= 3; j++) {
                    if ( pkgs[i + j] ) k.push(pkgs[i + j])
                }
                RED.log.info(`|   ${k.join(', ')}`)
            }
            RED.log.info('+-----------------------------------------------------')
        }
    })

    //#region ----- Constants for standard setup ----- //

    /** Folder containing settings.js, installed nodes, etc. @constant {string} userDir */
    userDir = RED.settings.userDir

    uib.rootFolder = path.join(userDir, uib.moduleName)
    // If projects are enabled - update root folder to `<userDir>/projects/<projectName>/uibuilder/<url>`
    if ( uiblib.getProps(RED, RED.settings.get('editorTheme'), 'projects.enabled') === true ) {
        const currProject = uiblib.getProps(RED, RED.settings.get('projects'), 'activeProject', '')
        if ( currProject !== '' ) uib.rootFolder = path.join(userDir, 'projects', currProject, uib.moduleName)
    }

    // Record the httpNodeRoot for later use
    uib.nodeRoot = RED.settings.httpNodeRoot

    // Get and record uibuilder settings from settings.js into the `uib` master object - these apply to all instances of uib
    if ( RED.settings.uibuilder ) {
        const settings = RED.settings.uibuilder

        // Change the root folder
        if ( settings.uibRoot && typeof settings.uibRoot === 'string') {
            uib.rootFolder = settings.uibRoot
        }

        // Get web-relavent uibuilder settings from settings.js
        uib.customServer.port = Number(RED.settings.uiPort)
        // Note the system host name
        uib.customServer.hostName = require('os').hostname()
        /** HTTP(s) port. If set & different to node-red, uibuilder will use its own ExpressJS server */
        // @ts-ignore - deliberately allowing string/number comparison
        if ( settings.port && settings.port != RED.settings.uiPort) { // eslint-disable-line eqeqeq
            uib.customServer.isCustom = true
            uib.customServer.port = Number(settings.port)
            // Override the httpNodeRoot setting, has to be empty string. Use reverse proxy to change instead if needed.
            uib.nodeRoot = ''
        }
        // http, https or http2 (default=http)
        if ( RED.settings.https ) uib.customServer.type = 'https'
        if ( settings.customType ) uib.customServer.type = settings.customType

        // Allow instance-level api's to be loaded (default=false)
        if ( settings.instanceApiAllowed === true ) uib.instanceApiAllowed = true

        if ( settings.serverOptions ) uib.customServer.serverOptions = settings.serverOptions

    } // --- end of settings.js --- //

    /** Locations for uib config can common folders */
    uib.configFolder = path.join(uib.rootFolder, uib.configFolderName)
    uib.commonFolder = path.join(uib.rootFolder, uib.commonFolderName)

    //#endregion -------- Constants -------- //

    // TODO: Move all file handling to separate uibFs lib
    // Configure the UibFs handler class
    fslib.setup(uib)

    //#region ----- Set up uibuilder root, root/.config & root/common folders ----- //

    /** Check uib root folder: create if needed, writable? */
    let uibRootFolderOK = true
    // Try to create root and root/.config - ignore error if it already exists
    try {
        fs.ensureDirSync(uib.configFolder) // creates both folders
        log.trace(`[uibuilder:runtimeSetup] uibRoot folder exists. ${uib.rootFolder}` )
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`🛑[uibuilder:runtimeSetup] Custom folder ERROR, path: ${uib.rootFolder}. ${e.message}`)
            uibRootFolderOK = false
        }
    }
    // Try to access the root folder (read/write) - if we can, create and serve the common resource folder
    try {
        fslib.accessSync( uib.rootFolder, 'rw' ) // try to access read/write
        log.trace(`[uibuilder:runtimeSetup] uibRoot folder is read/write accessible. ${uib.rootFolder}` )
    } catch (e) {
        RED.log.error(`🛑[uibuilder:runtimeSetup] Root folder is not accessible, path: ${uib.rootFolder}. ${e.message}`)
        uibRootFolderOK = false
    }
    // Assuming all OK, copy over the master .config folder without overwriting (vendor package list, middleware)
    if (uibRootFolderOK === true) {
        // We want to always overwrite the .config template files
        const fsOpts = { 'overwrite': true, 'preserveTimestamps': true }
        try {
            fs.copySync( path.join( uib.masterTemplateFolder, uib.configFolderName ), uib.configFolder, fsOpts )
            log.trace(`[uibuilder:runtimeSetup] Copied template .config folder to local .config folder ${uib.configFolder} (not overwriting)` )
        } catch (e) {
            RED.log.error(`🛑[uibuilder:runtimeSetup] Master .config folder copy ERROR, path: ${uib.masterTemplateFolder}. ${e.message}`)
            uibRootFolderOK = false
        }

        // and copy the common folder from template (contains the default blue node-red icon)
        fsOpts.overwrite = false // we don't want to overwrite any common folder files
        try {
            fs.copy( path.join( uib.masterTemplateFolder, uib.commonFolderName ), uib.commonFolder, fsOpts, function(err) {
                if (err) {
                    log.error(`🛑[uibuilder:runtimeSetup] Error copying common template folder from ${path.join( uib.masterTemplateFolder, uib.commonFolderName)} to ${uib.commonFolder}`, err)
                } else {
                    log.trace(`[uibuilder:runtimeSetup] Copied common template folder to local common folder ${uib.commonFolder} (not overwriting)` )
                }
            })
        } catch (e) {
            // should never happen
            log.error('🛑[uibuilder:runtimeSetup] COPY OF COMMON FOLDER FAILED')
        }
        // It is served up at the instance level to allow caching to be configured. It is used as a static resource folder (added in nodeInstance() so available for each instance as `./common/`)
    }
    // If the root folder setup failed, throw an error and give up completely
    if (uibRootFolderOK !== true) {
        throw new Error(`[uibuilder:runtimeSetup] Failed to set up uibuilder root folder structure correctly. Check log for additional error messages. Root folder: ${uib.rootFolder}.`)
    }

    //#endregion ----- root folder ----- //

    /** Do this before doing the web setup so that the packages can be served */
    packageMgt.setup(uib)

    /** We need an ExpressJS web server to serve the page and vendor packages.
     * since v2.0.0 2019-02-23 Moved from instance level (nodeInstance()) to module level
     * since v3.3.0 2021-03-16 Allow independent ExpressJS server/app
     */
    web.setup(uib) // Singleton wrapper for ExpressJS

    /** Pass core objects to the Socket.IO handler module */
    sockets.setup(uib, web.server) // Singleton wrapper for Socket.IO
} // --- end of runtimeSetup --- //

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
        RED.log.error(`[uibuilder] uibuilder node ${config.id} deployed with invalid URL in flow ${config.z} - not configuring`)
        return
    }

    /** Create the node instance - `this` can only be referenced AFTER here
     * @param {uibNode} this _
     */
    RED.nodes.createNode(this, config)

    //#region ====== Create local copies of the node configuration (as defined in the .html file) ====== //
    // NB: this.id and this.type are also available
    this.name            = config.name  ?? ''
    this.topic           = config.topic ?? ''
    this.url             = config.url // Undefined or '' is not valid
    this.oldUrl          = config.oldUrl
    this.fwdInMessages   = config.fwdInMessages ?? false
    this.allowScripts    = config.allowScripts ?? false
    this.allowStyles     = config.allowStyles ?? false
    this.copyIndex       = config.copyIndex ?? true // DEPRECATED
    this.templateFolder  = config.templateFolder ?? templateConf.blank.folder
    this.extTemplate     = config.extTemplate
    this.showfolder      = config.showfolder ?? false
    this.reload          = config.reload ?? false
    this.sourceFolder    = config.sourceFolder // NB: Do not add a default here as undefined triggers a check for index.html in web.js:setupInstanceStatic
    this.deployedVersion = config.deployedVersion
    this.showMsgUib      = config.showMsgUib // Show additional client id in standard msgs (see socket.js)
    this.title           = config.title ?? ''
    this.descr           = config.descr ?? ''
    this.editurl         = config.editurl ?? ''
    //#endregion ====== Local node config copy ====== //

    log.trace(`[uibuilder:nodeInstance:${this.url}] ================ instance registered ================`)
    log.trace(`[uibuilder:nodeInstance:${this.url}] node keys: ${JSON.stringify(Object.keys(this))}`)
    log.trace(`[uibuilder:nodeInstance:${this.url}] config keys: ${JSON.stringify(Object.keys(config))}`)
    log.trace(`[uibuilder:nodeInstance:${this.url}] Deployed Version: ${this.deployedVersion}`)

    if ( !this.url || typeof this.url !== 'string' || this.url.length < 1 ) {
        log.error('🛑[uibuilder:nodeInstance] No valid URL provided. Cannot set up this uibuilder instance')
        this.statusDisplay = { fill: 'red', shape: 'dot', text: 'ERROR:NOT CONFIGURED - No URL' }
        uiblib.setNodeStatus( this )
        return
    }

    this.statusDisplay = { fill: 'blue', shape: 'dot', text: 'Configuring node' }
    // if ( this.useSecurity === true ) this.statusDisplay.fill = 'yellow'
    // if ( this.allowUnauth === true ) this.statusDisplay.shape = 'ring'
    uiblib.setNodeStatus( this )

    //#region ====== Instance logging/audit ====== //

    log.trace(`[uibuilder:nodeInstance:${this.url}] Node instance settings: ${JSON.stringify({ 'name': this.name, 'topic': this.topic, 'url': this.url, 'copyIndex': this.copyIndex, 'fwdIn': this.fwdInMessages, 'allowScripts': this.allowScripts, 'allowStyles': this.allowStyles, 'showfolder': this.showfolder })}`)

    // Keep a log of the active uib.instances @since 2019-02-02
    uib.instances[this.id] = this.url
    log.trace(`[uibuilder:nodeInstance:${this.url}] Node uib.Instances Registered: ${JSON.stringify(uib.instances)}`)
    uib.apps[this.url] = {
        node: this.id,
        url: this.url,
        title: this.title,
        descr: this.descr,
    }

    // Keep track of the number of times each instance is deployed.
    // The initial deployment = 1
    if ( Object.prototype.hasOwnProperty.call(uib.deployments, this.id) ) uib.deployments[this.id]++
    else uib.deployments[this.id] = 1
    log.trace(`[uibuilder:nodeInstance:${this.url}] Number of uib.Deployments: ${uib.deployments[this.id]}` )

    // Track the number of messages received by this instance
    this.rcvMsgCount = 0

    //#endregion ====== Instance logging/audit ====== //

    //#region ====== Local folder structure ====== //

    /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
     *   Files in this folder are also served to URL but take preference
     *   over those in the nodes folders (which act as defaults) @type {string}
     */
    this.customFolder = path.join(/** @type {string} */ (uib.rootFolder), this.url)
    // console.log('uibuilder custom folder', this.customFolder)

    // TODO Need to find a way to make this more robust for when folder rename fails
    // Check whether the url has been changed. If so, rename the folder
    if ( this.oldUrl !== undefined && this.oldUrl !== '' && this.url !== this.oldUrl ) {
        // rename (move) folder if possible - but don't overwrite
        try {
            fs.moveSync(path.join(/** @type {string} */ (uib.rootFolder), this.oldUrl), this.customFolder, { overwrite: false })
            log.trace(`[uibuilder:nodeInstance:${this.url}] Folder renamed from ${this.oldUrl} to ${this.url}`)
            // Notify other nodes
            tiEvents.emit(`node-red-contrib-uibuilder/URL-change/${this.oldUrl}`, { oldURL: this.oldUrl, newURL: this.url, folder: this.customFolder } )
        } catch (e) {
            log.trace(`[uibuilder:nodeInstance:${this.url}] Could not rename folder. ${e.message}`)
            // Not worried if the source doesn't exist - this will regularly happen when changing the name BEFORE first deploy.
            if ( e.code !== 'ENOENT' ) {
                log.error(`🛑[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal. Manually change the URL back to the original. newUrl=${this.url}, oldUrl=${this.oldUrl}, Fldr=${this.customFolder}. Error=${e.message}`, e)
            }
        }
        // TODO Move this to a function in web.js
        // Remove the old router and remove from the routes list
        delete web.routers.instances[this.oldUrl]
        delete web.instanceRouters[this.oldUrl]
        // we continue to do the normal checks in case something failed or if this is an initial deploy (so no original folder exists)
    }

    // Does the custom folder exist? If not, create it and copy template to it. Otherwise make sure it is accessible.
    // TODO replace with uibFs.ensureFolder()
    let customFoldersOK = true
    if ( !fslib.existsSync(this.customFolder) ) {
        // Does not exist so check whether built-in or external template wanted
        if ( this.templateFolder !== 'external' ) {

            // Internal template wanted - so copy it now
            const cpyOpts = { 'preserveTimestamps': true }

            const copyFrom = path.join( uib.masterTemplateFolder, this.templateFolder )
            try {
                fs.copySync( copyFrom, this.customFolder, cpyOpts)
                log.info(`[uibuilder:nodeInstance:${this.url}] Created instance folder ${this.customFolder} and copied template files from ${copyFrom}` )
            } catch (e) {
                log.error(`🛑[uibuildernodeInstance] CREATE OF INSTANCE FOLDER '${this.customFolder}' & COPY OF TEMPLATE '${copyFrom}' FAILED. Fatal. Error=${e.message}`, e)
                customFoldersOK = false
            }

        } else {

            // External template wanted to try to load it
            uiblib.replaceTemplate(this.url, this.templateFolder, this.extTemplate, 'startup-CopyTemplate', templateConf, uib, log)
                .then( () => { // resp => {
                    // resp.statusMessage
                    log.info(`[uibuilder:nodeInstance:${this.url}] Created instance folder ${this.customFolder} and copied external template files from ${this.templateFolder}` )
                    return true
                })
                .catch( err => {
                    let statusMsg
                    if ( err.code === 'MISSING_REF' ) {
                        statusMsg = `Degit clone error. CHECK External Template Name. Name='${this.extTemplate}', url=${this.url}, cmd=startup-CopyTemplate. ${err.message}`
                    } else {
                        let mystr
                        if ( this.templateFolder === 'external' ) mystr = `, ${this.extTemplate}`
                        statusMsg = `Replace template error. ${err.message}. url=${this.url}. ${this.templateFolder}${mystr}`
                    }
                    log.error(`🛑[uibuilder:nodeInstance:replaceTemplate] ${statusMsg}`, err)
                } )

        }

    } else {

        try {
            fslib.accessSync(this.customFolder, 'w')
        } catch (e) {
            log.error(`🛑[uibuilder:nodeInstance:${this.url}] Local custom folder ERROR`, e.message)
            customFoldersOK = false
        }

    }

    // We've checked that the custom folder is there and has the correct structure
    // TODO Add check for src folder?
    if ( customFoldersOK === true ) {
        // local custom folders are there ...
        log.trace(`[uibuilder:nodeInstance:${this.url}] Using local front-end folders in: ${this.customFolder}` )
    } else {
        // Local custom folders are not right!
        log.error(`🛑[uibuilder:nodeInstance:${this.url}] Wanted to use local front-end folders in ${this.customFolder} but could not`)
    }

    //#endregion ====== End of Local folder structure ====== //

    // If security turned on, set up security for this instance - NB: most sec processing done from socket.js
    // if ( this.useSecurity === true ) security.setupInstance(this)

    // Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this)

    /** Socket.IO instance configuration. Each deployed instance has it's own namespace */
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    log.trace(`[uibuilder:nodeInstance:${this.url}] URL . . . . .  : ${tilib.urlJoin( uib.nodeRoot, this.url )}`)
    log.trace(`[uibuilder:nodeInstance:${this.url}] Source files . : ${this.customFolder}`)

    // We only do the following if io is not already assigned (e.g. after a redeploy)
    this.statusDisplay.text = 'Node Initialised'
    uiblib.setNodeStatus( this )

    // 3) Add event handler to process inbound messages
    // @ts-ignore
    this.on('input', inputMsgHandler)

    // 3rd-party node (non-flow) Event handlers (e.g. uib-sender)
    externalEvents(this)

    /** Do something when Node-RED is closing down which includes when this node instance is redeployed
     * Note use of arrow function so as to retain the correct `this` context
     */
    this.on('close', (removed, done) => {
        log.trace(`[uibuilder:nodeInstance:close:${this.url}] nodeInstance:on-close: ${removed ? 'Node Removed' : 'Node (re)deployed'}`)

        // @ts-ignore
        this.removeListener('input', inputMsgHandler)

        // Cancel any event listeners for this node
        tiEvents.removeAllListeners(`node-red-contrib-uibuilder/${this.url}`)

        // Tody up the ExpressJS routes if a node is removed
        if (removed) {
            delete web.routers.instances[this.url]
            delete web.instanceRouters[this.url]
        }

        // Do any complex close processing here if needed - MUST BE LAST
        uiblib.instanceClose(this, uib, sockets, web, done)
        // done()
    })

    // TODO Move to web
    // Shows an instance details debug page
    RED.httpAdmin.get(`/uibuilder/instance/${this.url}`, (req, res) => {
        res.status(200).send( web.showInstanceDetails(req, this) )
    })

    tiEvents.emit(`node-red-contrib-uibuilder/${this.url}/instanceSetupComplete`, this)

    // // TODO: Remove this debug info
    // setTimeout(function() {
    //     tiEvents.emit(`node-red-contrib-uibuilder/components-html/BOO`, 1, 2)
    //     tiEvents.emit(`node-red-contrib-uibuilder/components-html`, 3, 4)
    // }, 8000)
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
 **/
function inputMsgHandler (msg, send, done) {
    // const RED = uib.RED

    log.trace(`[uibuilder:${this.url}] nodeInstance:nodeInputHandler - emit received msg - Namespace: ${this.url}`) // debug

    // If msg is null, nothing will be sent
    if ( msg !== null ) {
        // if msg isn't null and isn't an object
        // NOTE: This is paranoid and shouldn't be possible!
        if ( typeof msg !== 'object' ) {
            // Force msg to be an object with payload of original msg
            msg = { 'payload': msg }
        }
        // Add topic from node config if present and not present in msg
        if ( !(Object.prototype.hasOwnProperty.call(msg, 'topic')) || msg.topic === '' ) {
            if ( this.topic !== '' ) msg.topic = this.topic
            else msg.topic = uib.moduleName
        }
    }

    // Keep this fn small for readability so offload any further, more customised code to another fn
    this.rcvMsgCount++
    log.trace( `[uibuilder:uiblib:inputHandler:${this.url}] msg received via FLOW. ${this.rcvMsgCount} messages received. ${JSON.stringify(msg)}` )

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
    sockets.sendToFe( msg, this.url, uib.ioChannels.server )

    // Pass on to output port 1 if wanted
    if (this.fwdInMessages) {
        // Send on the input msg to output
        send(msg)
        done()
        log.trace(`[uibuilder:uiblib:inputHandler:${this.url}] msg passed downstream to next node. ${JSON.stringify(msg)}`)
    }

    // tilib.dumpMem('On Msg')
} // ----- End of inputMsgHandler ----- //

/** Export the function that defines the node */
module.exports = Uib

// EOF
