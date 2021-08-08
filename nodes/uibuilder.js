/* eslint-env node es2017 */
/**
 * Copyright (c) 2017-2021 Julian Knight (Totally Information)
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
 * @typedef {import('../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 */

//#region ------ Require packages ------ //
// uibuilder custom 
const uiblib        = require('./libs/uiblib')  // Utility library for uibuilder
const tilib         = require('./libs/tilib')   // General purpose library (by Totally Information)
// Wrap these require's with try/catch to force better error reports - just in case any of the modules have issues
try {
    var templateConf  = require('../templates/template_dependencies') // Template configuration metadata
} catch (e) {
    console.trace('[uibuilder] REQUIRE TEMPLATE-CONF failed::', e)
}
try {
    var sockets       = require('./libs/socket') // Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
} catch (e) {
    console.trace('[uibuilder] REQUIRE SOCKET failed::', e)
}
try {
    var web           = require('./libs/web') // Singleton, only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
} catch (e) {
    console.trace('[uibuilder] REQUIRE WEB failed::', e)
}

// Core node.js
const path          = require('path')
//const events        = require('events')
const child_process = require('child_process')

// 3rd-party
const serveStatic   = require('serve-static')
//const serveIndex    = require('serve-index')
//const socketio      = require('socket.io')
const Express       = require('express') // eslint-disable-line no-unused-vars
const fs            = require('fs-extra')  // https://github.com/jprichardson/node-fs-extra#nodejs-fs-extra
const fg            = require('fast-glob') // https://github.com/mrmlnc/fast-glob

//#endregion ----- Require packages ----- //

//#region ------ uibuilder module-level globals ------ //
const uib = {
    /** Contents of uibuilder's package.json file */
    me: fs.readJSONSync(path.join( __dirname, '..', 'package.json' )),
    /** Module name must match this nodes html file @constant {string} uib.moduleName */
    moduleName: 'uibuilder',
    /** URL path prefix set in settings.js - prefixes all URL's - equiv of httpNodeRoot from settings.js */
    nodeRoot: '',
    /** Track across redeployments @constant {Object} uib.deployments */
    deployments: {},
    /** When nodeInstance is run, add the node.id as a key with the value being the url
     *  then add processing to ensure that the URL's are unique. 
     * Schema: {'<node.id>': '<url>'}
     * @constant {Object} uib.uib.instances
     */
    instances: {},
    /** File name of the master package list used to check for commonly installed FE libraries */
    masterPackageListFilename: 'masterPackageList.json',
    /** File name of the installed package list */
    packageListFilename: 'packageList.json',
    /** Track the vendor packages installed and their paths - updated by uiblib.checkInstalledPackages()
     * Populated initially from packageList file once the configFolder is known & master list has been copied.
     * Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
     * @type {Object.<string, Object>} uib.packageList */
    installedPackages: {},
    /** Location of master template folders (containing default front-end code) @constant {string} uib.masterTemplateFolder */
    masterTemplateFolder: path.join( __dirname, '..', 'templates' ),
    /** Location of master dist folder (containing built core front-end code) @constant {string} uib.masterStaticDistFolder */
    masterStaticDistFolder: path.join( __dirname, '..', 'front-end', 'dist' ),
    /** Location of master src folder (containing src core front-end code) @constant {string} uib.masterStaticSrcFolder */
    masterStaticSrcFolder: path.join( __dirname, '..', 'front-end', 'src' ),
    /** root folder (on the server FS) for all uibuilder front-end data
     *  Cannot be set until we have the RED object and know if projects are being used
     *  Name of the fs path used to hold custom files & folders for all uib.instances of uibuilder
     * @constant {string} uib.rootFolder
     * @default <userDir>/<uib.moduleName> or <userDir>/projects/<currProject>/<uib.moduleName>
     **/
    rootFolder: null,
    /** Location for uib config folder - set once rootFolder is finalised */
    configFolder: null,
    /** name of the config folder */
    configFolderName: '.config',
    /** Location for uib common folder - set once rootFolder is finalised */
    commonFolder: null,
    /** Name of the `common` folder for shared resources */
    commonFolderName: 'common',
    /** Name of the Socket.IO Use Middleware */
    sioUseMwName: 'sioUse.js',
    /** The channel names for Socket.IO @type {Object} */
    ioChannels: {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'},
    /** What version of Node.JS are we running under? Impacts some file processing. 
     * @type {Array.<number|string>} */
    nodeVersion: process.version.replace('v','').split('.'),
    /** Options for serveStatic
     * @see https://expressjs.com/en/resources/middleware/serve-static.html
     */
    staticOpts: {}, //{ maxAge: 31536000, immutable: true, },
    /** Array of instances that have requested their local instance folders be deleted on deploy - see html file oneditdelete, updated by admin api */
    deleteOnDelete: {},
    /** Parameters for custom webserver if required. Port is undefined if using Node-RED's webserver. */
    customServer: {
        /** Optional TCP/IP port number. If defined, uibuilder will use its own ExpressJS server/app
         * If undefined, uibuilder will use the Node-RED user-facing ExpressJS server
         * @type {undefined|number} If undefined, means that uibuilder is using Node-RED's webserver
         */
        port: undefined,
        /** @type {string} Node.js server type. ['http', 'https', 'http2']  */
        type: 'http',
        /** @type {undefined|string} uibuilder Host. sub(domain) name or IP Address */
        host: undefined,
        /** @type {undefined|string} The host name of the Node-RED server */
        hostName: undefined,
    },
    /** Event emitter for degit, populated on 1st use. See POST admin API */
    degitEmitter: undefined,
}

/** Current module version (taken from package.json) @constant {string} uib.version */
uib.version = uib.me.version

/** Dummy logging 
 * @type {Object.<string, function>} */
var dummyLog = {
    fatal: function(){}, // fatal - only those errors which make the application unusable should be recorded
    error: function(){}, // error - record errors which are deemed fatal for a particular request + fatal errors
    warn: function(){},  // warn - record problems which are non fatal + errors + fatal errors
    info: function(){},  // info - record information about the general running of the application + warn + error + fatal errors
    debug: function(){}, // debug - record information which is more verbose than info + info + warn + error + fatal errors
    trace: function(){}, // trace - record very detailed logging + debug + info + warn + error + fatal errors
}
var log = dummyLog // reset to RED.log or anything else you fancy at any point

// Placeholder - set in export
var userDir = ''

//#endregion ----- uibuilder module-level globals ----- //

/** Export the function that defines the node 
 * @type {runtimeRED} */
module.exports = function(/** @type {runtimeRED} */ RED) {
    // When uibuilder enters runtime state, show the details in the log
    let initialised = false
    RED.events.on('runtime-event', function(event) {
        if (event.id === 'runtime-state' && initialised === false ) {
            initialised = true
            RED.log.info('+-----------------------------------------------------')
            RED.log.info(`| ${uib.moduleName} v${uib.version} initialised`)
            RED.log.info(`| root folder: ${uib.rootFolder}`)
            if ( uib.customServer.port ) {
                RED.log.info(`| Using custom ExpressJS webserver at:`)
            } else {
                RED.log.info('| Using Node-RED\'s webserver at:')
            }
            let port = Number(RED.settings.uiPort)
            if ( uib.customServer.port !== undefined && uib.customServer.port != port ) port = uib.customServer.port
            
            RED.log.info(`|   ${uib.customServer.type}://${uib.customServer.host}:${port}/ or ${uib.customServer.type}://localhost:${port}/`)
            RED.log.info(`| Installed packages:`)
            const pkgs = Object.keys(uib.installedPackages)
            for (let i = 0; i < pkgs.length; i=i+4) {
                const k = []
                for (let j = 0; j <= 3; j++) {
                    if ( pkgs[i+j] ) k.push(pkgs[i+j])
                }
                RED.log.info(`|   ${k.join(', ')}`)
            }
            RED.log.info('+-----------------------------------------------------')
        }
    })

    //#region ----- Constants for standard setup ----- //
    /** Folder containing settings.js, installed nodes, etc. @constant {string} userDir */
    userDir = RED.settings.userDir

    // Set the root folder
    if ( RED.settings.uibuilder && RED.settings.uibuilder.uibRoot && typeof RED.settings.uibuilder.uibRoot === 'string') {
        // Does the folder exist and is it accessible?
        if ( ! fs.existsSync(RED.settings.uibuilder.uibRoot) ) {
            // This is not recoverable so stop the Node here.
            throw new Error(`Folder does not exist. Check settings.js:uibuilder.uibRoot '${RED.settings.uibuilder.uibRoot}'`)
        }
        uib.rootFolder = RED.settings.uibuilder.uibRoot
    } else {
        // No override supplied
        uib.rootFolder = path.join(userDir, uib.moduleName)
        // If projects are enabled - update root folder to `<userDir>/projects/<projectName>/uibuilder/<url>`
        if ( uiblib.getProps(RED, RED.settings.get('editorTheme'), 'projects.enabled') === true ) {
            const currProject = uiblib.getProps(RED, RED.settings.get('projects'), 'activeProject', '')
            if ( currProject !== '' ) uib.rootFolder = path.join(userDir, 'projects', currProject, uib.moduleName) 
        }
    }

    /** Locations for uib config can common folders */
    uib.configFolder = path.join(uib.rootFolder,uib.configFolderName) 
    uib.commonFolder = path.join(uib.rootFolder, uib.commonFolderName)
    
    //#endregion -------- Constants -------- //

    //#region ----- back-end debugging ----- //
    // @ts-ignore
    log = RED.log
    log.trace('[uibuilder:Module] ----------------- uibuilder - module started -----------------')
    //#endregion ----- back-end debugging ----- //

    //#region ----- Set up uibuilder root, root/.config & root/common folders ----- //

    /** Check uib root folder: create if needed, writable?
     * @since v2.0.0 2019-03-03
     */
    var uib_rootFolder_OK = true
    // Try to create root and root/.config - ignore error if it already exists
    try {
        fs.ensureDirSync(uib.configFolder) // creates both folders
        log.trace(`[uibuilder] uibRoot folder exists. ${uib.rootFolder}` )
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib.rootFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }
    }
    // Try to access the root folder (read/write) - if we can, create and serve the common resource folder
    try {
        fs.accessSync( uib.rootFolder, fs.constants.R_OK | fs.constants.W_OK ) // try to access read/write
        log.trace(`[uibuilder] uibRoot folder is read/write accessible. ${uib.rootFolder}` )
    } catch (e) {
        RED.log.error(`uibuilder: Root folder is not accessible, path: ${uib.rootFolder}. ${e.message}`)
        uib_rootFolder_OK = false
    }
    // Assuming all OK, copy over the master .config folder without overwriting (vendor package list, middleware)
    if (uib_rootFolder_OK === true) {
        const fsOpts = {'overwrite': false, 'preserveTimestamps':true}
        try {
            fs.copySync( path.join( uib.masterTemplateFolder, uib.configFolderName ), uib.configFolder, fsOpts )
            log.trace(`[uibuilder] Copied template .config folder to local .config folder ${uib.configFolder} (not overwriting)` )
        } catch (e) {
            RED.log.error(`uibuilder: Master .config folder copy ERROR, path: ${uib.masterTemplateFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }

        // and copy the common folder from template (contains the default blue node-red icon)
        try {
            fs.copy( path.join( uib.masterTemplateFolder, uib.commonFolderName ), uib.commonFolder, fsOpts, function(err){
                if(err){
                    log.error(`[uibuilder] Error copying common template folder from ${path.join( uib.masterTemplateFolder, uib.commonFolderName)} to ${uib.commonFolder}`, err)
                } else {
                    log.trace(`[uibuilder] Copied common template folder to local common folder ${uib.commonFolder} (not overwriting)` )
                }
            })
        } catch (e) {
            // should never happen
            log.error('[uibuilder] COPY OF COMMON FOLDER FAILED')
        }
        // It is served up at the instance level to allow caching to be configured. It is used as a static resource folder (added in nodeInstance() so available for each instance as `./common/`)
    }
    // If the root folder setup failed, throw an error and give up completely
    if (uib_rootFolder_OK !== true) {
        throw new Error(`uibuilder: Failed to set up uibuilder root folder structure correctly. Check log for additional error messages. Root folder: ${uib.rootFolder}.`)
    }

    //#endregion ----- root folder ----- //
    
    /** We need an ExpressJS web server to serve the page and vendor packages. 
     * @since 2019-02-04 removed httpAdmin - we only want to use httpNode for web pages 
     * @since v2.0.0 2019-02-23 Moved from instance level (nodeInstance()) to module level
     * @since v3.3.0 2021-03-16 Allow independent ExpressJS server/app 
     */
    web.setup(RED, uib, log) // Singleton wrapper for ExpressJS
    
    /** Pass core objects to the Socket.IO handler module */
    sockets.setup(RED, uib, log, web.server) // Singleton wrapper for Socket.IO

    /** Serve up vendor packages. Updates uib.installedPackages
     * This is the first check, the installed packages are rechecked at various times.
     * Reads the packageList and masterPackageList files
     * Adds ExpressJS static paths for each found FE package & saves the details to the vendorPaths variable.
     */
    web.checkInstalledPackages()

    /** Run the node instance - called from registerType()
     * type {runtimeNode}
     * @param {runtimeNodeConfig & uib} config The configuration object passed from the Admin interface (see the matching HTML file)
     */
    function nodeInstance(config) {
        // Create the node
        RED.nodes.createNode(this, config)

        /** @since 2019-02-02 - the current instance name (url) */
        var uibInstance = config.url // for logging
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] ================ instance registered ================`)
        /** Copy 'this' object in case we need it in context of callbacks of other functions.
         * @type {uibNode}
         */
        // @ts-ignore
        const node = this
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] node keys: ${JSON.stringify(Object.keys(node))}`)
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] config keys: ${JSON.stringify(Object.keys(config))}`)

        //#region ====== Create local copies of the node configuration (as defined in the .html file) ====== //
        // NB: node.id and node.type are also available
        node.name            = config.name  || ''
        node.topic           = config.topic || ''
        node.url             = config.url   || 'uibuilder'
        node.oldUrl          = config.oldUrl
        node.fwdInMessages   = config.fwdInMessages === undefined ? false : config.fwdInMessages
        node.allowScripts    = config.allowScripts === undefined ? false : config.allowScripts
        node.allowStyles     = config.allowStyles === undefined ? false : config.allowStyles
        node.copyIndex       = config.copyIndex === undefined ? true : config.copyIndex // DEPRECATED
        node.templateFolder  = config.templateFolder || templateConf.blank.folder
        node.extTemplate     = config.extTemplate
        node.showfolder      = config.showfolder === undefined ? false : config.showfolder
        node.useSecurity     = config.useSecurity 
        node.sessionLength   = Number(config.sessionLength) || 120  // in seconds
        node.jwtSecret       = node.credentials.jwtSecret || 'thisneedsreplacingwithacredential'
        node.tokenAutoExtend = config.tokenAutoExtend === undefined ? false : config.tokenAutoExtend
        node.reload          = config.reload === undefined ? false : config.reload
        node.sourceFolder    = config.sourceFolder // NB: Do not add a default here as undefined triggers a check for index.html in web.js:addInstanceStaticRoute
        //#endregion ====== Local node config copy ====== //

        //#region ====== Instance logging/audit ====== //
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] Node instance settings: ${JSON.stringify({'name': node.name, 'topic': node.topic, 'url': node.url, 'copyIndex': node.copyIndex, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'showfolder': node.showfolder })}`)
        
        // Keep a log of the active uib.instances @since 2019-02-02
        uib.instances[node.id] = node.url
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] Node uib.Instances Registered: ${JSON.stringify(uib.instances)}`)

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( Object.prototype.hasOwnProperty.call(uib.deployments, node.id) ) uib.deployments[node.id]++
        else uib.deployments[node.id] = 1
        log.trace(`[uibuilder:nodeInstance:${uibInstance}] Number of uib.Deployments: ${uib.deployments[node.id]}` )
        //#endregion ====== Instance logging/audit ====== //

        //#region ====== Local folder structure ====== //

        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults) @type {string}
         */
        node.customFolder = path.join(uib.rootFolder, node.url)

        // Check whether the url has been changed. If so, rename the folder
        if ( node.oldUrl !== undefined && node.url !== node.oldUrl ) {
            // rename (move) folder if possible - but don't overwrite
            try {
                fs.moveSync(path.join(uib.rootFolder, node.oldUrl), node.customFolder, {overwrite: false})
            } catch (e) {
                // Not worried if the source doesn't exist - this will regularly happen when changing the name BEFORE first deploy.
                if ( e.code !== 'ENOENT' ) {
                    log.error(`[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal. url=${node.url}, oldUrl=${node.oldUrl}, Fldr=${node.customFolder}. Error=${e.message}`, e)
                }
            }
            // we continue to do the normal checks in case something failed or if this is an initial deploy (so no original folder exists)
        }

        // Does the custom folder exist? If not, create it and copy blank template to it. Otherwise make sure it is accessible.
        var customFoldersOK = true
        if ( ! fs.existsSync(node.customFolder) ) {

            // Does not exist so check whether built-in or external template wanted
            if ( node.templateFolder !== 'external' ) {

                // Internal template wanted - so copy it now
                const cpyOpts = {'preserveTimestamps':true}
                let copyFrom = path.join( uib.masterTemplateFolder, 'blank' )
                try {
                    fs.copySync( copyFrom, node.customFolder, cpyOpts)
                    log.info(`[uibuilder:nodeInstance:${uibInstance}] Created instance folder ${node.customFolder} and copied template files from ${copyFrom}` )
                } catch (e) {
                    log.error(`[uibuildernodeInstance] CREATE OF INSTANCE FOLDER '${node.customFolder}' & COPY OF TEMPLATE '${copyFrom}' FAILED. Fatal. Error=${e.message}`, e)
                    customFoldersOK = false
                }

            } else {

                // External template wanted to try to load it
                uiblib.replaceTemplate(node.url, node.templateFolder, node.extTemplate, 'startup-CopyTemplate', templateConf, uib, log)
                .then( resp => {
                    //resp.statusMessage
                    log.info(`[uibuilder:nodeInstance:${uibInstance}] Created instance folder ${node.customFolder} and copied external template files from ${node.templateFolder}` )
                })
                .catch( err => {
                    let statusMsg
                    if ( err.code === 'MISSING_REF' ){
                        statusMsg = `Degit clone error. CHECK External Template Name. Name='${node.extTemplate}', url=${node.url}, cmd=startup-CopyTemplate. ${err.message}`
                    } else {
                        let mystr 
                        if ( node.templateFolder === 'external' ) mystr = `, ${node.extTemplate}`
                        statusMsg = `Replace template error. ${err.message}. url=${node.url}. ${node.templateFolder}${mystr}`
                    }
                    log.error(`[uibuilder:nodeInstance:replaceTemplate] ${statusMsg}`, err)
                } )

            }

        } else {

            try {
                fs.accessSync(node.customFolder, fs.constants.W_OK)
            } catch (e) {
                log.error(`[uibuilder:nodeInstance:${uibInstance}] Local custom folder ERROR`, e.message)
                customFoldersOK = false
            }

        }

        // We've checked that the custom folder is there and has the correct structure
        if ( uib_rootFolder_OK === true && customFoldersOK === true ) {
            // local custom folders are there ...
            log.trace(`[uibuilder:nodeInstance:${uibInstance}] Using local front-end folders in: ${node.customFolder}` )
        } else {
            // Local custom folders are not right!
            log.error(`[uibuilder:nodeInstance:${uibInstance}] Wanted to use local front-end folders in ${node.customFolder} but could not`)
        }

        //#endregion ====== End of Local folder structure ====== //

        // Set up web services for this instance (static folders, middleware, etc)
        web.instanceSetup(node)

        node.rcvMsgCount = 0
        /** Socket.IO instance configuration. Each deployed instance has it's own namespace @type {Object.ioNameSpace} */
        const ioNs = sockets.addNS(node) // NB: Namespace is set from url
        node.ioNamespace = ioNs.name
        
        log.trace(`[uibuilder:${uibInstance}] URL . . . . .  : ${tilib.urlJoin( uib.nodeRoot, node.url )}`)
        log.trace(`[uibuilder:${uibInstance}] Source files . : ${node.customFolder}`)

        // We only do the following if io is not already assigned (e.g. after a redeploy)
        uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        /** Handler function for node flow input events (when a node instance receives a msg from the flow)
         * @see https://nodered.org/blog/2019/09/20/node-done 
         * @param {Object} msg The msg object received.
         * @param {function} send Per msg send function, node-red v1+
         * @param {function} done Per msg finish function, node-red v1+
         **/
        function nodeInputHandler(msg, send, done) {
            log.trace(`[uibuilder:${uibInstance}] nodeInstance:nodeInputHandler - emit received msg - Namespace: ${node.url}`) //debug

            // If this is pre-1.0, 'send' will be undefined, so fallback to node.send
            send = send || function() { node.send.apply(node,arguments) }
            // If this is pre-1.0, 'done' will be undefined, so fallback to dummy function
            done = done || function() { if (arguments.length>0) node.done.apply(node,arguments) }

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
                    if ( node.topic !== '' ) msg.topic = node.topic
                    else msg.topic = uib.moduleName
                }
            }

            // Keep this fn small for readability so offload any further, more customised code to another fn
            msg = uiblib.inputHandler(msg, send, done, node, RED, sockets.io, ioNs, log, uib)

        } // -- end of flow msg received processing -- //

        // Process inbound messages
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down which includes when this node instance is redeployed
        node.on('close', function(removed,done) {
            log.trace(`[uibuilder:${uibInstance}] nodeInstance:on-close: ${removed?'Node Removed':'Node (re)deployed'}`)

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            //processClose(null, node, RED, ioNs, app) // swap with below if needing async
            //uiblib.processClose(node, RED, uib, ioNs, sockets.io, web.app, log, done)
            uiblib.instanceClose(node, RED, uib, sockets, web, log, done)

            done()
        })

        // Shows an instance details debug page
        RED.httpAdmin.get(`/uibuilder/instance/${node.url}`, function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
            let page = uiblib.showInstanceDetails(req, node, uib, userDir, RED)
            res.status(200).send( page )
        })

    } // ---- End of nodeInstance (initialised node instance) ---- //

    /** Register the node by name. This must be called before overriding any of the
     *  Node functions. */
    RED.nodes.registerType(uib.moduleName, nodeInstance, {
        credentials: {
            jwtSecret: {type:'password'},
        },
        settings: {
            uibuilderNodeEnv: { value: process.env.NODE_ENV, exportable: true },
            uibuilderTemplates: { value: templateConf, exportable: true },
            uibuilderCustomServer: { value: (uib.customServer), exportable: true },
        },
    }) 

    //#region ====== Admin API's ====== //

    //#region === Validation functions === //
    /** Validate url query parameter
     * @param {Object} params The GET (res.query) or POST (res.body) parameters
     * @param {string} params.url The uibuilder url to check
     * @return {{statusMessage: string, status: number}}
     */
    function chkParamUrl(params) {
        const res = {'statusMessage': '', 'status': 0}

        // We have to have a url to work with - the url defines the start folder
        if ( params.url === undefined ) {
            res.statusMessage = 'url parameter not provided'
            res.status = 500
            return res
        }

        // Trim the url
        params.url = params.url.trim()

        // URL must not exceed 20 characters
        if ( params.url.length > 20 ) {
            res.statusMessage = `url parameter is too long. Max 20 characters: ${params.url}`
            res.status = 500
            return res
        }

        // URL must be more than 0 characters
        if ( params.url.length < 1 ) {
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status = 500
            return res
        }

        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( params.url.includes('..') ) {
            res.statusMessage = `url parameter may not contain "..": ${params.url}`
            res.status = 500
            return res
        }

        // Actually, since uib auto-creates folder if not exists, this just gets in the way - // Does this url have a matching instance root folder?
        // if ( ! fs.existsSync(path.join(uib.rootFolder, params.url)) ) {
        //     res.statusMessage = `url does not have a matching instance root folder. url='${params.url}', Master root folder='${uib.rootFolder}'`
        //     res.status = 500
        //     return res
        // }

        return res
    } // ---- End of fn chkParamUrl ---- //

    /** Validate fname (filename) query parameter
     * @param {Object} params The GET (res.query) or POST (res.body) parameters
     * @param {string} params.fname The uibuilder url to check
     * @return {{statusMessage: string, status: number}}
     */
    function chkParamFname(params) {
        const res = {'statusMessage': '', 'status': 0}
        const fname = params.fname

        // We have to have an fname (file name) to work with
        if ( fname === undefined ) {
            res.statusMessage = 'file name not provided'
            res.status = 500
            return res
        }
        // Blank file name probably means no files available so we will ignore
        if ( fname === '' ) {
            res.statusMessage = 'file name cannot be blank'
            res.status = 500
            return res
        }
        // fname must not exceed 255 characters
        if ( fname.length > 255 ) {
            res.statusMessage = `file name is too long. Max 255 characters: ${params.fname}`
            res.status = 500
            return res
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( fname.includes('..') ) {
            res.statusMessage = `file name may not contain "..": ${params.fname}`
            res.status = 500
            return res
        }
        
        return res
    } // ---- End of fn chkParamFname ---- //

    /** Validate folder query parameter
     * @param {Object} params The GET (res.query) or POST (res.body) parameters
     * @param {string} params.folder The uibuilder url to check
     * @return {{statusMessage: string, status: number}}
     */
    function chkParamFldr(params) {
        const res = {'statusMessage': '', 'status': 0}
        let folder = params.folder

        //we have to have a folder name
        if ( folder === undefined ) {
            res.statusMessage = 'folder name not provided'
            res.status = 500
            return res
        }
        // folder name must be >0 in length
        if ( folder === '' ) {
            res.statusMessage = 'folder name cannot be blank'
            res.status = 500
            return res
        }
        // folder name must not exceed 255 characters
        if ( folder.length > 255 ) {
            res.statusMessage = `folder name is too long. Max 255 characters: ${folder}`
            res.status = 500
            return res
        }
        // folder name cannot contain .. to prevent escaping sub-folder structure
        if ( folder.includes('..') ) {
            res.statusMessage = `folder name may not contain "..": ${folder}`
            res.status = 500
            return res
        }
        
        return res
    } // ---- End of fn chkParamFldr ---- //
    //#endregion === Validation functions === //

    //#region === Admin API v3 === //

    /** uibuilder v3 unified Admin API router - new API commands should be added here */
    RED.httpAdmin.route('/uibuilder/admin/:url')
        // For all routes (this function is called before more specific ones)
        .all(function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res, /** @type {Express.NextFunction} */ next) {
            // @ts-ignore
            const params = res.allparams = Object.assign({}, req.query, req.body, req.params)
            params.type = 'all'
            //params.headers = req.headers

            // Validate URL - params.url
            const chkUrl = chkParamUrl(params)
            if ( chkUrl.status !== 0 ) {
                log.error(`[uibuilder:admin-router:ALL] Admin API. ${chkUrl.statusMessage}`)
                res.statusMessage = chkUrl.statusMessage
                res.status(chkUrl.status).end()
                return
            }    

            next()
        })
        /** Get something and return it */
        .get(function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
            // @ts-ignore
            const params = res.allparams
            params.type = 'get'

            // List all folders and files for this uibuilder instance
            if ( params.cmd === 'listall' ) {
                log.trace(`[uibuilder:admin-router:GET] Admin API. List all folders and files. url=${params.url}, root fldr=${uib.rootFolder}`)

                // get list of all (sub)folders (follow symlinks as well)
                const out = {'root':[]}
                const root2 = uib.rootFolder.replace(/\\/g, '/')
                fg.stream([`${root2}/${params.url}/**`], { dot: true, onlyFiles: false, deep: 10, followSymbolicLinks: true, markDirectories: true })
                    .on('data', entry => {
                        entry = entry.replace(`${root2}/${params.url}/`, '')
                        let fldr
                        if ( entry.endsWith('/') ) {
                            // remove trailing /
                            fldr = entry.slice(0, -1)
                            // For the root folder of the instance, use "root" as the name (matches editor processing)
                            if ( fldr === '' ) fldr = 'root'
                            out[fldr] = []
                        } else {
                            let splitEntry = entry.split('/')
                            let last = splitEntry.pop()
                            fldr = splitEntry.join('/')
                            if ( fldr === '' ) fldr = 'root'
                            out[fldr].push(last)
                        }
                    })
                    .on('end', () => {
                        res.statusMessage = 'Folders and Files listed successfully'
                        res.status(200).json(out)
                    })
                return
                // -- end of listall -- //
            } else if ( params.cmd === 'checkurls' ) {
                log.trace(`[uibuilder:admin-router:GET:checkurls] Check if URL is already in use. URL: ${params.url}`)
        
                /** @returns {boolean} True if the given url exists, else false */
                let chkInstances = Object.values(uib.instances).includes(params.url)
                let chkFolders = fs.existsSync(path.join(uib.rootFolder, params.url))

                res.statusMessage = 'Instances and Folders checked'
                res.status(200).json( chkInstances || chkFolders )

                return
            } else if ( params.cmd === 'listurls' ) {
                // Return a list of all user urls in use by ExpressJS
                // TODO Not currently working
                var route, routes = []
                web.app._router.stack.forEach( (middleware) => {
                    if(middleware.route){ // routes registered directly on the app
                        let path = middleware.route.path
                        let methods = middleware.route.methods
                        routes.push({path: path, methods: methods})
                    } else if(middleware.name === 'router'){ // router middleware 
                        middleware.handle.stack.forEach(function(handler){
                            route = handler.route
                            route && routes.push(route)
                        })
                    }
                })
                console.log(web.app._router.stack[0])

                log.trace('[uibuilder:admin-router:GET:listurls] Admin API. List of all user urls in use.')
                res.statusMessage = 'URLs listed successfully'
                //res.status(200).json(routes)
                res.status(200).json(web.app._router.stack)

                return
            }

        })
        /** TODO Write file contents */
        .put(function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
            // @ts-ignore
            const params = res.allparams
            params.type = 'put'
            
            let fullname = path.join(uib.rootFolder, params.url)

            // Tell uibuilder to delete the instance local folder when this instance is deleted - see html file oneditdelete & uiblib.processClose
            if ( params.cmd && params.cmd === 'deleteondelete' ) {
                log.trace(`[uibuilder:admin-router:PUT:deleteondelete] Admin API. url=${params.url}`)
                uib.deleteOnDelete[params.url] = true
                res.statusMessage = 'PUT successfully'
                res.status(200).json({})
                return
            }

            log.trace(`[uibuilder:admin-router:PUT] Admin API. url=${params.url}`)
            res.statusMessage = 'PUT successfully'
            res.status(200).json({
                'fullname': fullname,
                'params': params,
            })

        })
        /** Load new template or Create a new folder or file */
        .post(function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
            // @ts-ignore
            const params = res.allparams
            params.type = 'post'

            if ( params.cmd === 'replaceTemplate' ) {

                uiblib.replaceTemplate(params.url, params.template, params.extTemplate, params.cmd, templateConf, uib, log)
                .then( resp => {
                    res.statusMessage = resp.statusMessage
                    if ( resp.status === 200 ) res.status(200).json(resp.json)
                    else res.status(resp.status).end()    
                })
                .catch( err => {
                    let statusMsg, mystr
                    if ( err.code === 'MISSING_REF' ){
                        statusMsg = `Degit clone error. CHECK External Template Name. Name='${params.extTemplate}', url=${params.url}, cmd=${params.cmd}. ${err.message}`
                    } else {
                        if ( params.template === 'external' ) mystr = `, ${params.extTemplate}`
                        statusMsg = `Replace template error. ${err.message}. url=${params.url}. ${params.template}${mystr}`
                    }
                    log.error(`[uibuilder:adminapi:POST:replaceTemplate] ${statusMsg}`, err)
                    res.statusMessage = statusMsg
                    res.status(500).end()    
                } )

            } else {

                // Validate folder name - params.folder
                const chkFldr = chkParamFldr(params)
                if ( chkFldr.status !== 0 ) {
                    log.error(`[uibuilder:admin-router:POST] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFldr.statusMessage
                    res.status(chkFldr.status).end()
                    return
                }
                // Validate command - must be present and either be 'newfolder' or 'newfile'
                if ( ! (params.cmd && (params.cmd === 'newfolder' || params.cmd === 'newfile')) ) {
                    let statusMsg = `cmd parameter not present or wrong value (must be 'newfolder' or 'newfile'). url=${params.url}, cmd=${params.cmd}`
                    log.error(`[uibuilder:admin-router:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }
                // If newfile, validate file name - params.fname
                if (params.cmd === 'newfile' ) {
                    const chkFname = chkParamFname(params)
                    if ( chkFname.status !== 0 ) {
                        log.error(`[uibuilder:admin-router:POST] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
                        res.statusMessage = chkFname.statusMessage
                        res.status(chkFname.status).end()
                        return
                    }        
                }
        
                let fullname = path.join(uib.rootFolder, params.url, params.folder)
                if (params.cmd === 'newfile' ) {
                    fullname = path.join(fullname, params.fname)
                }
                
                // Does folder or file already exist? If so, return error
                if ( fs.pathExistsSync(fullname) ) {
                    let statusMsg = `selected ${params.cmd === 'newfolder' ? 'folder':'file'} already exists. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                    log.error(`[uibuilder:admin-router:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                // try to create folder/file - if fail, return error
                try {
                    if ( params.cmd === 'newfolder') {
                        fs.ensureDirSync(fullname)
                    } else {
                        fs.ensureFileSync(fullname)
                    }
                } catch (e) {
                    let statusMsg = `could not create ${params.cmd === 'newfolder' ? 'folder':'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                    log.error(`[uibuilder:admin-router:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                log.trace(`[uibuilder:admin-router:POST] Admin API. Folder/File create SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                res.statusMessage = 'Folder/File created successfully'
                res.status(200).json({
                    'fullname': fullname,
                    'params': params,
                })

            } // end of else

        }) // --- End of POST processing --- //
        /** Delete a folder or a file */
        .delete(function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
            // @ts-ignore ts(2339)
            const params = res.allparams
            params.type = 'delete'

            // Several command options available: deletefolder, deletefile

            // deletefolder or deletefile:

            // Validate folder name - params.folder
            const chkFldr = chkParamFldr(params)
            if ( chkFldr.status !== 0 ) {
                log.error(`[uibuilder:admin-router:DELETE] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                res.statusMessage = chkFldr.statusMessage
                res.status(chkFldr.status).end()
                return
            }
            // Validate command - must be present and either be 'deletefolder' or 'deletefile'
            if ( ! (params.cmd && (params.cmd === 'deletefolder' || params.cmd === 'deletefile')) ) {
                let statusMsg = `cmd parameter not present or wrong value (must be 'deletefolder' or 'deletefile'). url=${params.url}, cmd=${params.cmd}`
                log.error(`[uibuilder:admin-router:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }
            // If newfile, validate file name - params.fname
            if (params.cmd === 'deletefile' ) {
                const chkFname = chkParamFname(params)
                if ( chkFname.status !== 0 ) {
                    log.error(`[uibuilder:admin-router:DELETE] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFname.statusMessage
                    res.status(chkFname.status).end()
                    return
                }        
            }
    
            let fullname = path.join(uib.rootFolder, params.url, params.folder)
            if (params.cmd === 'deletefile' ) {
                fullname = path.join(fullname, params.fname)
            }
            
            // Does folder or file does not exist? Return error
            if ( ! fs.pathExistsSync(fullname) ) {
                let statusMsg = `selected ${params.cmd === 'deletefolder' ? 'folder':'file'} does not exist. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                log.error(`[uibuilder:admin-router:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            // try to create folder/file - if fail, return error
            try {
                fs.removeSync(fullname)  // deletes both files and folders
            } catch (e) {
                let statusMsg = `could not delete ${params.cmd === 'deletefolder' ? 'folder':'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                log.error(`[uibuilder:admin-router:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            log.trace(`[uibuilder:admin-router:DELETE] Admin API. Folder/File delete SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
            res.statusMessage = 'Folder/File deleted successfully'
            res.status(200).json({
                'fullname': fullname,
                'params': params,
            })
        })
        /** @see https://expressjs.com/en/4x/api.html#app.METHOD for other methods
         *  patch, report, search ?
         */
    
    //#endregion === Admin API v3 === //

    //#region === Admin API v1/2 === //

    /** Create a simple NR admin API to return the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibgetfile', function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
        //#region --- Parameter validation ---
        /** req.query parameters
         * url
         * fname
         * folder
         */
        const params = req.query

        // @ts-ignore
        const chkUrl = chkParamUrl(params)
        if ( chkUrl.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkUrl.statusMessage}`)
            res.statusMessage = chkUrl.statusMessage
            res.status(chkUrl.status).end()
            return
        }

        // @ts-ignore
        const chkFname = chkParamFname(params)
        if ( chkFname.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFname.statusMessage
            res.status(chkFname.status).end()
            return
        }

        // @ts-ignore
        const chkFldr = chkParamFldr(params)
        if ( chkFldr.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFldr.statusMessage
            res.status(chkFldr.status).end()
            return
        }
        //#endregion ---- ----

        log.trace(`[uibuilder:uibgetfile] Admin API. File get requested. url=${params.url}, file=${params.folder}/${params.fname}`)

        if ( params.folder === 'root' ) params.folder = ''

        // @ts-ignore
        const filePathRoot = path.join(uib.rootFolder, req.query.url, params.folder)
        // @ts-ignore
        const filePath = path.join(filePathRoot, req.query.fname)

        // Does the file exist?
        if ( fs.existsSync(filePath) ) {
            // Send back a plain text response body containing content of the file
            res.type('text/plain').sendFile(
                // @ts-ignore
                req.query.fname, 
                {
                    // Prevent injected relative paths from escaping `src` folder
                    'root': filePathRoot,
                    // Turn off caching
                    'lastModified': false, 
                    'cacheControl': false,
                    'dotfiles': 'allow',
                }
            )
        } else {
            log.error(`[uibuilder:uibgetfile] Admin API. File does not exist '${filePath}'. url=${params.url}`)
            res.statusMessage = 'File does not exist'
            res.status(500).end()
        }
    }) // ---- End of uibgetfile ---- //

    /** Create a simple NR admin API to UPDATE the content of a file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @since 2019-02-04 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    RED.httpAdmin.post('/uibputfile', function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
        //#region ====== Parameter validation ====== //
        const params = req.body

        const chkUrl = chkParamUrl(params)
        if ( chkUrl.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API. ${chkUrl.statusMessage}`)
            res.statusMessage = chkUrl.statusMessage
            res.status(chkUrl.status).end()
            return
        }

        const chkFname = chkParamFname(params)
        if ( chkFname.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFname.statusMessage
            res.status(chkFname.status).end()
            return
        }

        const chkFldr = chkParamFldr(params)
        if ( chkFldr.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFldr.statusMessage
            res.status(chkFldr.status).end()
            return
        }
        //#endregion ====== ====== //
        
        log.trace(`[uibuilder:uibputfile] Admin API. File put requested. url=${params.url}, file=${params.folder}/${params.fname}, reload? ${params.reload}`)

        const fullname = path.join(uib.rootFolder, params.url, params.folder, params.fname)

        // eslint-disable-next-line no-unused-vars
        fs.writeFile(fullname, req.body.data, function (err, data) {
            if (err) {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.error(`[uibuilder:uibputfile] Admin API. File write FAIL. url=${params.url}, file=${params.folder}/${params.fname}`, err)
                res.statusMessage = err
                res.status(500).end()
            } else {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.trace(`[uibuilder:uibputfile] Admin API. File write SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                res.statusMessage = 'File written successfully'
                res.status(200).end()
                // Reload connected clients if required by sending them a reload msg
                if ( params.reload ) {
                    sockets.send({
                        '_uib': {
                            'reload': true,
                        }
                    }, params.url)
                }
            }
        })
    }) // ---- End of uibputfile ---- //
    
    /** Create an index web page or JSON return listing all uibuilder endpoints
     * Also allows confirmation of whether a url is in use ('check' parameter) or a simple list of urls in use.
     * @since 2019-02-04 v1.1.0-beta6
     */
    RED.httpAdmin.get('/uibindex', function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
        log.trace('[uibindex] User Page/API. List all available uibuilder endpoints')
        
        // If using own Express server, correct the URL's
        const url = new URL(req.headers.referer)
        url.pathname = ''
        if (uib.customServer.port) {
            // @ts-expect-error ts(2322)
            url.port = uib.customServer.port
        }
        const urlPrefix = url.href
        
        /** Return full details based on type parameter */
        switch (req.query.type) {
            case 'json': {
                res.json(uib.instances)
                break
            }
            case 'urls': {
                res.json(Object.values(uib.instances))
                break
            }
            // default to 'html' output type
            default: {
                //console.log('Expresss 3.x - app.routes: ', app.routes) // Expresss 3.x
                //console.log('Expresss 3.x with express.router - app.router.stack: ', app.router.stack) // Expresss 3.x with express.router
                //console.log('Expresss 4.x - app._router.stack: ', app._router.stack) // Expresss 4.x
                //console.log('Restify - server.router.mounts: ', server.router.mounts) // Restify

                // Update the uib.vendorPaths master variable
                web.checkInstalledPackages()

                // Include socket.io as a client library (but don't add to vendorPaths)
                // let sioFolder = tilib.findPackage('socket.io', userDir)
                // let sioVersion = tilib.readPackageJson( sioFolder ).version

                // Collate current ExpressJS urls and details
                var otherPaths = [], uibPaths = []
                var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
                // req.app._router.stack.forEach( function(r, i, stack) { // shows Node-RED admin server paths
                // eslint-disable-next-line no-unused-vars
                web.app._router.stack.forEach( function(r, i, stack) { // shows Node-RED user server paths
                    let rUrl = r.regexp.toString().replace(urlRe, '')
                    if ( rUrl === '' ) {
                        uibPaths.push( {
                            'name': r.name,
                            'regex': r.regexp.toString(), 
                            'route': r.route,
                            'path': r.path,
                            'params': r.params,
                            'keys': r.keys,
                            'method': r.route ? Object.keys(r.route.methods)[0].toUpperCase() : 'ANY',
                            'handle': r.handle.toString(),
                        } )
                    } else {
                        otherPaths.push( {
                            'name': r.name,
                            'regex': r.regexp.toString(), 
                            'route': r.route,
                            'path': r.path,
                            'params': r.params,
                            'keys': r.keys,
                            'method': r.route ? Object.keys(r.route.methods)[0].toUpperCase() : 'ANY',
                            'handle': r.handle.toString(),
                        } )
                    }
                })

                // Build the web page
                let page = `
                    <!doctype html><html lang="en"><head>
                        <title>Uibuilder Index</title>
                        <link type="text/css" href="${urlPrefix}${uib.nodeRoot.replace('/','')}${uib.moduleName}/vendor/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" media="screen">
                        <link rel="icon" href="${urlPrefix}${uib.nodeRoot.replace('/','')}${uib.moduleName}/common/images/node-blue.ico">
                        <style type="text/css" media="all">
                            h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                            .col3i tbody>tr>:nth-child(3){ font-style:italic; }
                        </style>
                    </head><body><div class="container">
                        <h1>uibuilder Detailed Information Page</h1>
                        <p>
                            Note that this page is only accessible to users with Node-RED admin authority.
                        </p>
                `

                /** Index of uibuilder instances */
                page += `
                        <h2>Index of uibuilder pages</h2>
                        <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
                        <table class="table">
                            <thead><tr>
                                <th>URL</th>
                                <th title="Use this to search for the source node in the admin ui">Source Node Instance <a href="#i2"><sup>(2)</sup></th>
                                <th>Server Filing System Folder</th>
                            </tr></thead><tbody>
                `
                Object.keys(uib.instances).forEach(key => {
                    page += `
                        <tr>
                            <td><a href="${urlPrefix}${tilib.urlJoin(uib.nodeRoot, uib.instances[key]).replace('/','')}" target="_blank">${uib.instances[key]}</a></td>
                            <td>${key}</td>
                            <td>${path.join(uib.rootFolder, uib.instances[key])}</td>
                        </tr>
                    `
                })
                page += `
                    </tbody></table>
                    <p>Notes:</p>
                    <ol>
                        <li><a id="i1"></a>
                            Each instance of uibuilder uses its own socket.io <i>namespace</i> that matches <code>httpNodeRoot/url</code>. 
                            You can use this to manually send messages to your user interface.
                        </li>
                        <li><a id="i2"></a>
                            Paste the Source Node Instance into the search feature in the Node-RED admin ui to find the instance.
                            The "Filing System Folder" shows you where the front-end (client browser) code lives.
                        </li>
                    </ol>
                `

                /** Table of Vendor Libraries available */
                page += `
                    <h2>Vendor Client Libraries</h2>
                    <p>
                        You can include these libraries in any uibuilder served web page.
                        Note though that you need to find out the correct file and relative folder either by looking on 
                        your Node-RED server in the location shown or by looking at the packages source online.
                    </p>
                    <table class="table">
                        <thead><tr>
                            <th>Package</th>
                            <th>Version</th>
                            <th>uibuilder URL <a href="#vl1"><sup>(1)</sup></a></th>
                            <th>Browser Entry Point (est.) <a href="#vl2"><sup>(2)</sup></a></th>
                            <th>Server Filing System Folder</th>
                        </tr></thead><tbody>
                `
                Object.keys(uib.installedPackages).forEach(packageName => {
                    let pj = uib.installedPackages[packageName]
                    
                    /** Are either the `browser` or `main` properties set in package.json?
                     *  If so, add them to the output as an indicator of where to look.
                     */
                    let mainTxt = '<i>Not Supplied</i>'
                    //console.log('==>> ',uib.nodeRoot, pj.url,pj.browser)
                    if ( pj.browser !== '' ) {
                        mainTxt = `<a href="${urlPrefix}${tilib.urlJoin(uib.nodeRoot, pj.url.replace('..',''), pj.browser).replace('/','')}">${pj.url}/${pj.browser}</a>`
                    } else if ( pj.main !== '' ) {
                        mainTxt = `<a href="${urlPrefix}${tilib.urlJoin(uib.nodeRoot, pj.url.replace('..',''), pj.main).replace('/','')}">${pj.url}/${pj.main}</a>`
                    }

                    page += `
                        <tr>
                            <td><a href="${pj.homepage}">${packageName}</a></td>
                            <td>${pj.version}</td>
                            <td>${pj.url}</td>
                            <td>${mainTxt}</td>
                            <td>${pj.folder}</td>
                        </tr>
                    `
                })
                page += `
                    </tbody></table>
                    <p>Notes:</p>
                    <ol>
                        <li><a id="vl1"></a>
                            Always use relative URL's. All vendor URL's start <code>../uibuilder/vendor/</code>, 
                            all uibuilder and custom file URL's start <code>./</code>.<br>
                            Using relative URL's saves you from needing to worry about http(s), ip names/addresses and port numbers.
                        </li>
                        <li><a id="vl2"></a>
                            The 'Main Entry Point' shown is <i>usually</i> a JavaScript file that you will want in your index.html. 
                            However, because this is reported by the authors of the package, it may refer to something completely different, 
                            uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation 
                            for the correct library files to load.
                        </li>
                    </ol>
                `

                /** Configuration info */
                page += `
                    <h2>Configuration</h2>

                    <h3>uibuilder</h3>
                    <table class="table col3i">
                        <tr>
                            <th>uibuilder Version</th>
                            <td>${uib.version}</td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>uib.rootFolder</th>
                            <td>${uib.rootFolder}</td>
                            <td>All uibuilder data lives here</td>
                        </tr>
                        <tr>
                            <th>uib.configFolder</th>
                            <td>${uib.configFolder}</td>
                            <td>uibuilder Global Configuration Folder</td>
                        </tr>
                        <tr>
                            <th>uib.commonFolder</th>
                            <td>${uib.commonFolder}</td>
                            <td>Used for loading common resources between multiple uibuilder instances</td>
                        </tr>
                        <tr>
                            <th>Common URL</th>
                            <td>../${uib.moduleName}/common</td>
                            <td>The common folder maps to this URL</td>
                        </tr>
                        <tr title="">
                            <th>uib_socketPath</th>
                            <td>${sockets.uib_socketPath}</td>
                            <td>Unique path given to Socket.IO to ensure isolation from other Nodes that might also use it</td>
                        </tr>
                        <tr>
                            <th>uib.masterPackageListFilename</th>
                            <td>${uib.masterPackageListFilename}</td>
                            <td>Holds a list of npm packages automatically recognised, uibuilder will add URL's for these</td>
                        </tr>
                        <tr>
                            <th>uib.packageListFilename</th>
                            <td>${uib.packageListFilename}</td>
                            <td>The list of npm packages actually being served</td>
                        </tr>
                        <tr>
                            <th>uib.masterTemplateFolder</th>
                            <td>${uib.masterTemplateFolder}</td>
                            <td>The built-in source templates, can be copied to any instance</td>
                        </tr>
                    </table>

                    <h3>Configuration Files</h3>

                    <p>All are kept in the master configuration folder: ${uib.configFolder}</p>

                    <dl style="margin-left:1em;">
                        <dt>${uib.masterPackageListFilename}</dt>
                        <dd>Holds a list of npm packages automatically recognised, uibuilder will add URL's for these.</dd>
                        <dt>${uib.packageListFilename}</dt>
                        <dd>The list of npm packages actually installed and being served.</dd>
                        <dt>${uib.sioUseMwName}</dt>
                        <dd>Custom Socket.IO Middleware file, also uibMiddleware.js.</dd>
                        <dt>uibMiddleware.js</dt>
                        <dd>Custom ExpressJS Middleware file.</dd>
                    </dl>

                    <h3>Node-RED</h3>
                    <p>See the <code>&lt;userDir&gt;/settings.js</code> file and the 
                    <a href="https://nodered.org/docs/" target="_blank">Node-RED documentation</a> for details.</p>
                    <table class="table">
                        <tr><th>userDir</th><td>${userDir}</td></tr>
                        <tr><th>httpNodeRoot</th><td>${uib.nodeRoot}</td></tr>
                        <tr><th>Node-RED Version</th><td>${RED.settings.version}</td></tr>
                        <tr><th>Min. Version Required by uibuilder</th><td>${uib.me['node-red'].version}</td></tr>
                    </table>

                    <h3>Node.js</h3>
                    <table class="table">
                        <tr><th>Version</th><td>${uib.nodeVersion.join('.')}</td></tr>
                        <tr><th>Min. version required by uibuilder</th><td>${uib.me.engines.node}</td></tr>
                    </table>
                    
                    <h3>ExpressJS</h3>
                    <p>
                        See the <a href="https://expressjs.com/en/api.html#app.settings.table" target="_blank">ExpressJS documentation</a> for details.
                        Note that ExpressJS Views are not current used by uibuilder
                    </p>
                    <table class="table">
                        <tr><th>Views Folder</th><td>${web.app.get('views')}</td></tr>
                        <tr><th>Views Engine</th><td>${web.app.get('view engine')}</td></tr>
                        <tr><th>Views Cache</th><td>${web.app.get('view cache')}</td></tr>
                    </table>
                    <h4>app.locals</h4>
                    <pre>${tilib.syntaxHighlight( web.app.locals )}</pre>
                    <h4>app.mountpath</h4>
                    <pre>${tilib.syntaxHighlight( web.app.mountpath )}</pre>
                `

                /** Installed Packages */
                page += `
                    <h2>Installed Packages</h2>
                    <p>
                        These are the front-end libraries uibuilder knows to be installed and made available via ExpressJS serve-static.
                        This is the raw view of the Vendor Client Libraries table above.
                    </p>
                    <pre>${tilib.syntaxHighlight( uib.installedPackages )}</pre>
                `

                // Show the ExpressJS paths currently defined
                page += `
                    <h2>uibuilder Vendor ExpressJS Paths</h2>
                    <p>
                        A raw view of the ExpressJS app.use paths currently in use serving vendor packages.
                        Generally, you will need to interpret the "regex" line to work out what URL is being served.
                    </p>
                    <pre>${tilib.syntaxHighlight( uibPaths )}</pre>
                `
                page += `
                    <h2>Other ExpressJS Paths</h2>
                    <p>A raw view of all other app.use paths being served.</p>
                    <pre>${tilib.syntaxHighlight( otherPaths )}</pre>
                `

                page += '</div></body></html>'
    
                res.send(page)
    
                break
            }
        }
    }) // ---- End of uibindex ---- //

    /** Check & update installed front-end library packages, return list as JSON */
    RED.httpAdmin.get('/uibvendorpackages', function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
        // Update the installed packages list
        web.checkInstalledPackages()

        res.json(uib.installedPackages)
    }) // ---- End of uibvendorpackages ---- //

    /** Call npm. Schema: {name:{(url),cmd}}
     * If url parameter not provided, uibPath = <userDir>, else uibPath = <uib.rootFolder>/<url>
     * Valid commands:
     *    install, remove, update
     *    * = run as npm command with --json output
     * @param {string} [req.query.url=userDir] Optional. If present, CWD is set to the uibuilder folder for that instance. Otherwise CWD is set to the userDir.
     * @param {string} req.query.cmd Command to run (see notes for this function)
     */
    RED.httpAdmin.get('/uibnpmmanage', function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res) {
        //#region --- Parameter validation (cmd, package) ---
        const params = req.query
        
        // Validate the npm command to be used.
        if ( params.cmd === undefined ) {
            log.error('[uibuilder:API:uibnpmmanage] uibuilder Admin API. No command provided for npm management.')
            res.statusMessage = 'npm command parameter not provided'
            res.status(500).end()
            return
        }
        switch (params.cmd) {
            case 'install':
            case 'remove':
            case 'update':
                break
        
            default:
                log.error('[uibuilder:API:uibnpmmanage] Admin API. Invalid command provided for npm management.')
                res.statusMessage = 'npm command parameter is invalid'
                res.status(500).end()
                return
        }

        // package name must not exceed 255 characters
        //we have to have a package name
        if ( params.package === undefined ) {
            log.error('[uibuilder:API:uibnpmmanage] Admin API. package parameter not provided')
            res.statusMessage = 'package parameter not provided'
            res.status(500).end()
            return
        }
        if ( params.package.length > 255 ) {
            log.error('[uibuilder:API:uibnpmmanage] Admin API. package name parameter is too long (>255 characters)')
            res.statusMessage = 'package name parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        //#endregion ---- ----
        
        // TODO: add optional url param that must be an active uibuilder url name
        const folder = userDir

        log.info(`[uibuilder:API:uibnpmmanage] Admin API. Running npm ${params.cmd} for package ${params.package}`)

        // delete package lock file as it seems to mess up sometimes - no error if it fails
        fs.removeSync(path.join(folder, 'package-lock.json'))

        // Formulate the command to be run
        var command = ''
        switch (params.cmd) {
            case 'install': {
                // npm install --no-audit --no-update-notifier --save --production --color=false --no-fund --json <packageName>@latest // --save-prefix="~" 
                command = `npm install --no-audit --no-update-notifier --save --production --color=false --no-fund --json ${params.package}@latest`
                break
            }
            case 'remove': {
                // npm remove --no-audit --no-update-notifier --color=false --json <packageName> // --save-prefix="~" 
                command = `npm remove --no-audit --no-update-notifier --color=false --json ${params.package}`
                break
            }
            case 'update': {

                break
            }
        }
        if ( command === '' ) {
            log.error('[uibuilder:API:uibnpmmanage] Admin API. No valid command available for npm management.')
            res.statusMessage = 'No valid npm command available'
            res.status(500).end()
            return
        }

        // Run the command - against the correct instance or userDir (cwd)
        var output = [], errOut = null, success = false
        child_process.exec(command, {'cwd': folder}, (error, stdout, stderr) => {
            if ( error ) {
                log.warn(`[uibuilder:API:uibnpmmanage] Admin API. ERROR Running npm ${params.cmd} for package ${params.package}`, error)
            }

            // try to force output & error output to JSON (or split by newline)
            try {
                output.push(JSON.parse(stdout))
            } catch (err) {
                output.push(stdout.split('\n'))
            }
            try {
                errOut = JSON.parse(stderr)
            } catch (err) {
                errOut = stderr.split('\n')
            }

            // Find the actual JSON output in amongst all the other crap that npm can produce
            var result = null
            try {
                result = stdout.slice(stdout.search(/^\{/m), stdout.search(/^\}/m)+1) //stdout.match(/\n\{.*\}\n/)
            } catch (e) {
                result = e
            }
            var jResult = null
            try {
                jResult = JSON.parse(result)
            } catch (e) {
                jResult = {'ERROR': e, 'RESULT': result}
            }

            //log.trace(`[uibuilder:API:uibnpmmanage] Writing stdout to ${path.join(uib.rootFolder,uib.configFolder,'npm-out-latest.txt')}`)
            //fs.writeFile(path.join(uib.configFolder,'npm-out-latest.txt'), stdout, 'utf8', function(){})

            // Update the packageList
            // @ts-ignore
            uib.installedPackages = web.checkInstalledPackages(params.package)

            // Check the results of the command
            switch (params.cmd) {
                // check pkg exiss in uib.installedPackages, if so, serve it up
                case 'install': {
                    // package name should exist in uib.installedPackages
                    if ( Object.prototype.hasOwnProperty.call(uib.installedPackages, params.package) ) success = true
                    if (success === true) {
                        // Add an ExpressJS URL
                        web.servePackage( /** @type {string} */ (params.package) )
                    }
                    break
                }
                // Check pkg does not exist in uib.installedPackages, if so, remove served url
                case 'remove': {
                    // package name should NOT exist in uib.installedPackages
                    if ( ! Object.prototype.hasOwnProperty.call(uib.installedPackages, params.package) ) success = true
                    if (success === true) {
                        // Remove ExpressJS URL
                        // @ts-ignore
                        web.unservePackage(params.package)
                    }
                    break
                }
                // Check pkg still exists in uib.installedPackages
                case 'update': {
                    // package name should exist in uib.installedPackages
                    if ( Object.prototype.hasOwnProperty.call(uib.installedPackages, params.package) ) success = true
                    break
                }
            }

            if (success === true) {
                log.info(`[uibuilder:API:uibnpmmanage] Admin API. npm command success. npm ${params.cmd} for package ${params.package}`)
            } else {
                log.error(`[uibuilder:API:uibnpmmanage] Admin API. npm command failed. npm ${params.cmd} for package ${params.package}`, jResult)
            }

            res.json({'success':success,'result':jResult,'output':output,'errOut':errOut})
            return
        })

    }) // ---- End of npmmanage ---- //

    /** Serve up the package docs folder (uses docsify)
     * @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/108
     */
    // @ts-ignore
    RED.httpAdmin.use('/uibuilder/techdocs', serveStatic( path.join(__dirname, '..', 'docs'), uib.staticOpts ) )

    //#endregion === Admin API v1/2 === //

    //#region === DEPRECATED API's === //

    /** DEPRECATED in v3.1.0. Do not use, will be removed soon. Create a simple NR admin API to return the list of files in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb Function to be exectuted when this API called
     **/
    // RED.httpAdmin.get('/uibfiles', function(req,res) {
    //     log.warn('[uibuilder:uibfiles] Admin API. THIS API IS DEPRECATED, DO NOT USE, IT WILL BE REMOVED SOON.')
    //     //#region --- Parameter validation ---
    //     /** @type {Object} */
    //     const params = req.query

    //     const chkUrl = chkParamUrl(params)
    //     if ( chkUrl.status !== 0 ) {
    //         log.error(`[uibuilder:uibfiles] Admin API. ${chkUrl.statusMessage}`)
    //         res.statusMessage = chkUrl.statusMessage
    //         res.status(chkUrl.status).end()
    //         return
    //     }

    //     var folder = params.folder || 'src'
    //     if ( folder !== 'src' && folder !== 'dist' && folder !== 'root' ) {
    //         log.error('[uibfiles] Admin API. folder parameter is not one of src|dest|root')
    //         res.statusMessage = 'folder parameter must be one of src|dest|root'
    //         res.status(500).end()
    //         return
    //     }
    //     if ( folder === 'root' ) folder = ''

    //     // cpyIdx - force the index.(html|css|js) files to be present in the src folder if not there
    //     var cpyIdx = params.cpyIdx === 'true' ? true : false

    //     //#endregion ---- ----

    //     log.trace(`[uibuilder:uibfiles] Admin API. File get requested. url=${params.url}, folder=${folder}`)

    //     // @ts-ignore
    //     const srcFolder = path.join(uib.rootFolder, req.query.url, folder)

    //     /** If requested, copy files from the master template folder
    //      *  Note: We don't copy the master dist folder
    //      *  Don't copy if copy turned off in admin ui 
    //      */
    //     if ( (folder === 'src') && (cpyIdx === true) ) {
    //         const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
    //         const fromTemplateFolder = path.join( uib.masterTemplateFolder, uib.masterTemplate )
    //         try {
    //             fs.copySync( fromTemplateFolder, srcFolder, cpyOpts)
    //             log.trace(`[uibuilder:uibfiles] Copied template files from ${fromTemplateFolder} to ${srcFolder} (not overwriting)` )
    //         } catch (err) {
    //             log.error(`[uibuilder:uibfiles] Error copying template files from ${fromTemplateFolder} to ${srcFolder}`, err)
    //         }
    //     }

    //     // Get the file list - note, ignore errors for now
    //     // TODO: (v2.1) Need to filter out folders. Or better, flatten and allow sub-folders.
    //     // @ts-ignore
    //     fs.readdir(srcFolder, {withFileTypes: true}, (err, files) => {
    //         if ( err ) {
    //             log.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
    //             //console.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
    //             res.statusMessage = err
    //             res.status(500).end()
    //             return
    //         }
    //         // Send back a JSON response body containing the list of files that can be edited
    //         if ( uib.nodeVersion[0] < 10 ) {
    //             res.json(
    //                 files
    //                     .filter(fname => {
    //                         try {
    //                             let stat = fs.statSync( path.join(srcFolder, fname) )
    //                             return !stat.isDirectory()
    //                         } catch (e) {
    //                             log.error(`[uibfiles] Admin API. stat failed for '${fname}' in '${srcFolder}'.`, e)
    //                         }
    //                     })
    //             )
    //         } else {
    //             res.json(
    //                 files
    //                     .filter(dirent => !dirent.isDirectory())
    //                     .map(dirent => dirent.name)
    //             )
    //         }
    //     })

    // }) // ---- End of uibfiles ---- //

    /** DEPRECATED in v3.1.0. Do not use, will be removed soon. Create a simple NR admin API to CREATE a new file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    // RED.httpAdmin.get('/uibnewfile', function(req,res) {
    //     log.warn('[uibuilder:uibuilder] Admin API. THIS API IS DEPRECATED, DO NOT USE, IT WILL BE REMOVED SOON.')
    //     //#region --- Parameter validation ---
    //     /** @type {Object} */
    //     const params = req.query

    //     const chkUrl = chkParamUrl(params)
    //     if ( chkUrl.status !== 0 ) {
    //         log.error(`[uibuilder:uibnewfile] Admin API. ${chkUrl.statusMessage}`)
    //         res.statusMessage = chkUrl.statusMessage
    //         res.status(chkUrl.status).end()
    //         return
    //     }

    //     const chkFname = chkParamFname(params)
    //     if ( chkFname.status !== 0 ) {
    //         log.error(`[uibuilder:uibnewfile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
    //         res.statusMessage = chkFname.statusMessage
    //         res.status(chkFname.status).end()
    //         return
    //     }

    //     const chkFldr = chkParamFldr(params)
    //     if ( chkFldr.status !== 0 ) {
    //         log.error(`[uibuilder:uibnewfile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
    //         res.statusMessage = chkFldr.statusMessage
    //         res.status(chkFldr.status).end()
    //         return
    //     }
    //     //#endregion ---- ----
        
    //     log.trace(`[uibuilder:uibnewfile] Admin API. File create requested. url=${params.url}, file=${params.folder}/${params.fname}`)

    //     const fullname = path.join(uib.rootFolder, params.url, params.folder, params.fname)

    //     try {
    //         fs.ensureFileSync(fullname)
    //         // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
    //         log.trace(`[uibuilder:uibnewfile] Admin API. File create SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
    //         res.statusMessage = 'File created successfully'
    //         res.status(200).end()
    //     } catch (err) {
    //         // Send back a response message and code 500 (Internal Server Error)=Create failed
    //         log.error(`[uibuilder:uibnewfile] Admin API. File create FAILED. url=${params.url}, file=${params.folder}/${params.fname}`, err)
    //         res.statusMessage = err
    //         res.status(500).end()
    //     }
    // }) // ---- End of uibnewfile ---- //

    /** DEPRECATED in v3.1.0. Do not use, will be removed soon. A simple NR admin API to DELETE a file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    // RED.httpAdmin.get('/uibdeletefile', function(req,res) {
    //     log.warn('[uibuilder:uibdeletefile] Admin API. THIS API IS DEPRECATED, DO NOT USE, IT WILL BE REMOVED SOON.')
    //     //#region --- Parameter validation ---
    //     /** @type {Object} */
    //     const params = req.query

    //     const chkUrl = chkParamUrl(params)
    //     if ( chkUrl.status !== 0 ) {
    //         log.error(`[uibuilder:uibdeletefile] Admin API. ${chkUrl.statusMessage}`)
    //         res.statusMessage = chkUrl.statusMessage
    //         res.status(chkUrl.status).end()
    //         return
    //     }

    //     const chkFname = chkParamFname(params)
    //     if ( chkFname.status !== 0 ) {
    //         log.error(`[uibuilder:uibdeletefile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
    //         res.statusMessage = chkFname.statusMessage
    //         res.status(chkFname.status).end()
    //         return
    //     }

    //     const chkFldr = chkParamFldr(params)
    //     if ( chkFldr.status !== 0 ) {
    //         log.error(`[uibuilder:uibdeletefile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
    //         res.statusMessage = chkFldr.statusMessage
    //         res.status(chkFldr.status).end()
    //         return
    //     }

    //     // If the url query param is invalid, exit (res.status was set in function)
    //     //if ( uiblib.checkUrl(params.url, res, 'uibdeletefile', log) === false ) return
      
    //     //#endregion ---- ----
        
    //     log.trace(`[uibuilder:uibdeletefile] Admin API. File delete requested. url=${params.url}, file=${params.folder}/${params.fname}`)

    //     const fullname = path.join(uib.rootFolder, params.url, params.folder, params.fname)

    //     try {
    //         fs.removeSync(fullname)
    //         // Send back a response message and code 200 = OK
    //         log.trace(`[uibuilder:uibdeletefile] Admin API. File delete SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
    //         res.statusMessage = 'File deleted successfully'
    //         res.status(200).end()
    //     } catch (err) {
    //         // Send back a response message and code 500 (Internal Server Error)=Create failed
    //         log.error(`[uibuilder:uibdeletefile] Admin API. File delete FAILED. url=${params.url}, file=${params.folder}/${params.fname}`, err)
    //         res.statusMessage = err
    //         res.status(500).end()
    //     }
    // }) // ---- End of uibdeletefile ---- //

    //#endregion === end of deprecated admin api's === //

    //#endregion ====== Admin API's ====== //

    //#region ====== End User API's ======
    //app = RED.httpNode
    /** Login 
     * TODO: Change to an external module
    */
    const jsonBodyParser = require('body-parser').json()
    //const jwt = require('jsonwebtoken')
    const { checkSchema, validationResult } = require('express-validator')

    /** Input validation schema, @see https://express-validator.github.io/docs/schema-validation.html */
    const loginSchema = {
        'id': {
            in: ['body'],
            errorMessage: 'User ID is incorrect length',
            isLength: {
                errorMessage: 'User ID must be between 1 and 50 characters long',
                // Multiple options would be expressed as an array
                options: { min: 1, max: 50 }
            },
            stripLow: true,
            trim: true,
        },
        'password': {
            in: ['body'],
            errorMessage: 'Password is incorrect length',
            isLength: {
                errorMessage: 'Password must be between 10 and 50 characters long',
                // Multiple options would be expressed as an array
                options: { min: 10, max: 50 }
            },
            stripLow: true,
            trim: true,
        },
    }

    //TODO
    // @ts-ignore
    web.app.post('/uiblogin', jsonBodyParser, checkSchema(loginSchema), (req, res) => {

        console.log('[uiblogin] BODY: ', req.body)
        //console.log('[uiblogin] HEADERS: ', req.headers)

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req)
        console.log('[uiblogin] Validation Errors: ', errors)

        // Request body failed validation, return 400 - bad request
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        //TODO
        // Validate user data
        // If valid user, generate token & add to authorization header

        // If user or pw is invalid, return 401 - Unauthorized

        // Return status 200 - OK with json data
        return res.status(200).json(req.body)
    }) // --- End of uiblogin api --- //

    //#endregion ====== End User API's ====== //

} // ==== End of module.exports ==== // 

// EOF
