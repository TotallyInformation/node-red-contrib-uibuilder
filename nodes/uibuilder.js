/**
 * Copyright (c) 2019 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk
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

// Utility library for uibuilder
const uiblib        = require('./uiblib')
// General purpose library (by Totally Information)
const tilib         = require('./tilib')
const serveStatic   = require('serve-static')
const serveIndex   = require('serve-index')
const socketio      = require('socket.io')
const path          = require('path')
const fs            = require('fs-extra')
//const events        = require('events')
const child_process = require('child_process')

// uibuilder module-level globals
const uib = {
    /** Contents of uibuilder's package.json file */
    me: fs.readJSONSync(path.join( __dirname, '..', 'package.json' )),
    /** Module name must match this nodes html file @constant {string} uib.moduleName */
    moduleName: 'uibuilder',
    // URL path prefix set in settings.js - prefixes all URL's
    nodeRoot: '',
    /** Track across redeployments @constant {Object} uib.deployments */
    deployments: {},
    /** When nodeGo is run, add the node.id as a key with the value being the url
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
    masterTemplateFolder: path.join( __dirname, 'templates' ),
    /** What template to use as master? Must match a folder in the masterTemplateFolder */
    masterTemplate: 'vue',
    /** root folder (on the server FS) for all uibuilder front-end data
     *  Cannot be set until we have the RED object and know if projects are being used
     *  Name of the fs path used to hold custom files & folders for all uib.instances of uibuilder
     * @constant {string} uib.rootFolder
     * @default <userDir>/<uib.moduleName> or <userDir>/projects/<currProject>/<uib.moduleName>
     **/
    rootFolder: null,
    /** Locations for uib config and common folders - set once rootFolder is finalised */
    configFolder: null,
    commonFolder: null,
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

/** Export the function that defines the node */
module.exports = function(RED) {
    // NB: entries in settings.js are read-only and shouldn't be read using RED.settings.get, that is only for settings that can change in-flight.
    //     see Node-RED issue #1543.

    /*  RED.events.on('nodes-started',function() {
            console.log('****** All nodes have started ******')
        })
        RED.events.on('nodes-stopped',function() {
            console.log('****** All nodes have stopped ******')
        }) 
    */

    //#region ----- Constants (& logging) for standard setup ----- //
    /** Folder containing settings.js, installed nodes, etc. @constant {string} userDir */
    userDir = RED.settings.userDir

    // Set the root folder
    uib.rootFolder = path.join(userDir, uib.moduleName)
    // If projects are enabled - update root folder to `<userDir>/projects/<projectName>/uibuilder/<url>`
    const currProject = uiblib.getProps(RED, RED.settings.get('projects'), 'activeProject', '')
    if ( currProject !== '' ) uib.rootFolder = path.join(userDir, 'projects', currProject, uib.moduleName) 

    /** Locations for uib config can common folders */
    uib.configFolder = path.join(uib.rootFolder, '.config') 
    uib.commonFolder = path.join(uib.rootFolder, 'common')
    
    /** Root URL path for http-in/out and uibuilder nodes @constant {string} httpNodeRoot */
    const httpNodeRoot = uib.nodeRoot = RED.settings.httpNodeRoot

    //#region ----- back-end debugging ----- //
    log = RED.log
    log.trace('[uibuilder:Module] ----------------- uibuilder - module started -----------------')
    //#endregion ----- back-end debugging ----- //

    /** We need an http server to serve the page and vendor packages. 
     * @since 2019-02-04 removed httpAdmin - we only want to use httpNode for web pages 
     * @since v2.0.0 2019-02-23 Moved from instance level (nodeGo()) to module level */
    const app = RED.httpNode // || RED.httpAdmin

    //#endregion -------- Constants -------- //

    //#region ----- Set up uibuilder root, root/.config & root/common folders ----- //
    /** Check uib root folder: create if needed, writable?
     * @since v2.0.0 2019-03-03
     */
    var uib_rootFolder_OK = true
    // Try to create root and root/.config - ignore error if it already exists
    try {
        fs.ensureDirSync(uib.configFolder) // creates both folders
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib.rootFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }
    }
    // Try to access the root folder (read/write) - if we can, create and serve the common resource folder
    try {
        fs.accessSync( uib.rootFolder, fs.constants.R_OK | fs.constants.W_OK ) // try to access read/write
        // and create the common resource folder
        fs.ensureDirSync(uib.commonFolder)
        // and serve it up as a static resource folder (added in nodeGo() so available for each instance as `./common/`)
        var commonStatic = serveStatic( uib.commonFolder )
    } catch (e) {
        RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib.commonFolder}. ${e.message}`)
        uib_rootFolder_OK = false
    }
    // Assuming all OK, copy over the master vendor package list & the working package list as needed (doesn't overwrite)
    if (uib_rootFolder_OK === true) {
        const fsOpts = {'overwrite': false}
        try {
            fs.copySync( path.join( uib.masterTemplateFolder, uib.masterPackageListFilename ), path.join( uib.configFolder, uib.masterPackageListFilename ), fsOpts )
            fs.copySync( path.join( uib.masterTemplateFolder, uib.masterPackageListFilename ), path.join( uib.configFolder, uib.packageListFilename ), fsOpts )
        } catch (e) {
            RED.log.error(`uibuilder: Master Package List copy ERROR, path: ${uib.masterTemplateFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }
    }
    // If the root folder setup failed, throw an error and give up completely
    if (uib_rootFolder_OK !== true) {
        throw new Error(`uibuilder: Failed to set up uibuilder root folder structure correctly. Check log for additional error messages. Root folder: ${uib.rootFolder}.`)
    }
    //#endregion ----- root folder ----- //
    
    /** Serve up vendor packages - updates uib.installedPackages
     * This is the first check, the installed packages are rechecked at various times.
     * Reads the packageList and masterPackageList files
     * Adds ExpressJS static paths for each found FE package & saves the details to the vendorPaths variable.
     */
    uiblib.checkInstalledPackages('', uib, userDir, log, app)

    //#region ----- Set up Socket.IO server & middleware ----- //
    /** Holder for Socket.IO - we want this to survive redeployments of each node instance
     *  so that existing clients can be reconnected.
     * Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
     * modules that might also use it (path). This is only needed ONCE for ALL uib.instances of this node.
     **/

    /** URI path for accessing the socket.io client from FE code. 
     * @since v2.0.0-dev Now: `../uibuilder/vendor/socket.io/socket.io.js`
     * @constant {string} uib_socketPath */
    //const uib_socketPath = tilib.urlJoin(httpNodeRoot, uib.moduleName, 'socket.io')
    const uib_socketPath = tilib.urlJoin(httpNodeRoot, uib.moduleName, 'vendor', 'socket.io')

    log.trace('[uibuilder:Module] Socket.IO initialisation - Socket Path=', uib_socketPath )
    var io = socketio.listen(RED.server, {'path': uib_socketPath}) // listen === attach
    // @ts-ignore
    io.set('transports', ['polling', 'websocket'])

    /** Check for <uibRoot>/.config/sioMiddleware.js, use it if present. Copy template if not exists @since v2.0.0-dev3 */
    let sioMwPath = path.join(uib.rootFolder,'.config','sioMiddleware.js')
    if ( ! fs.existsSync(sioMwPath) ) {
        // Doesn't exist so copy the Template
        fs.copySync( path.join(uib.masterTemplateFolder, 'sioMiddleware.js'), sioMwPath, {'overwrite':false, 'preserveTimestamps':true})
        log.trace(`[uibuilder:Module] Copied sioMiddleware template file from ${uib.masterTemplateFolder} to ${sioMwPath} (not overwriting)` )
    }
    try {
        const sioMiddleware = require(sioMwPath)
        if ( typeof sioMiddleware === 'function' ) {
            io.use(require(path.join(uib.rootFolder,'.config','sioMiddleware.js')))
        }    
    } catch (e) {
        log.trace('[uibuilder:Module] Socket.IO Middleware failed to load. Reason: ', e.message)
    }

    //#endregion ----- socket.io server ----- //

    //#region ---- Set up uibuilder master resources (these are applied in nodeGO at instance level) ----
    /** Create a new, additional static http path to enable loading of central static resources for uibuilder
     * Loads standard images, ico file, etc.
     * @since v2.0.0 2019-03-03 Moved out of nodeGo() only need to do once - but is applied in nodeGo
     */
    var masterStatic = function(req,res,next) { next() }
    try {
        // Will we use "compiled" version of module front-end code?
        fs.accessSync( path.join(__dirname, 'dist', 'index.html'), fs.constants.R_OK )
        log.trace('[uibuilder:Module] Using master production build folder')
        // If the ./dist/index.html exists use the dist folder...
        masterStatic = serveStatic( path.join( __dirname, 'dist' ) )
    } catch (e) {
        // ... otherwise, use dev resources at ./src/
        log.trace('[uibuilder:Module] Using master src folder')
        log.trace('                   Reason for not using master dist folder: ', e.message )
        masterStatic = serveStatic( path.join( __dirname, 'src' ) )
    }
    // These are NOT applied here since they have to be applied at the instance level so that
    // the default index.html page can be utilised.
    //#endregion -------- master resources --------

    RED.log.info('+-----------------------------------------------------')
    RED.log.info(`| ${uib.moduleName} initialised:`)
    RED.log.info(`|   root folder: ${uib.rootFolder}`)
    RED.log.info(`|   version . .: ${uib.version}`)
    RED.log.info(`|   packages . : ${Object.keys(uib.installedPackages)}`)
    RED.log.info('+-----------------------------------------------------')

    /** Run the node instance - called from registerType()
     * @param {Object} config The configuration object passed from the Admin interface (see the matching HTML file)
     */
    function nodeGo(config) {
        // Create the node
        RED.nodes.createNode(this, config)

        /** @since 2019-02-02 - the current instance name (url) */
        var uibInstance = config.url // for logging

        log.trace(`[uibuilder:${uibInstance}] ================ instance registered ================`)

        /** A copy of 'this' object in case we need it in context of callbacks of other functions. @constant {Object} node */
        const node = this
        log.trace(`[uibuilder:${uibInstance}] = Keys: this, config =`, {'this': Object.keys(node), 'config': Object.keys(config)})

        //#region ----- Create local copies of the node configuration (as defined in the .html file) ----- //
        // NB: node.id and node.type are also available
        node.name          = config.name  || ''
        node.topic         = config.topic || ''
        node.url           = config.url   || 'uibuilder'
        node.fwdInMessages = config.fwdInMessages        // @since 2017-09-20 changed to remove default, || with boolean doesn't work properly
        node.allowScripts  = config.allowScripts
        node.allowStyles   = config.allowStyles
        node.copyIndex     = config.copyIndex
        node.showfolder    = config.showfolder
        //#endregion ----- Local node config copy ----- //

        log.trace(`[uibuilder:${uibInstance}] Node instance settings`, {'name': node.name, 'topic': node.topic, 'url': node.url, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'debugFE': node.debugFE })

        // Keep a log of the active uib.instances @since 2019-02-02
        uib.instances[node.id] = node.url
        log.trace(`[uibuilder:${uibInstance}] Node uib.Instances Registered`, uib.instances)

        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults) @type {string}
         */
        node.customFolder = path.join(uib.rootFolder, node.url)

        //#region ----- Socket.IO instance configuration ----- //
        /** How many Socket clients connected to this instance? @type {integer} */
        node.ioClientsCount = 0
        /** How many msg's received since last reset or redeploy? @type {integer} */
        node.rcvMsgCount = 0
        /** The channel names for Socket.IO @type {Object} */
        node.ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}
        /** Make sure each node instance uses a separate Socket.IO namespace - WARNING: This HAS to match the one derived in uibuilderfe.js
         * @since v1.0.10, changed namespace creation to correct a missing / if httpNodeRoot had been changed from the default. @type {string} */
        node.ioNamespace = tilib.urlJoin(httpNodeRoot, node.url)

        log.trace(`[uibuilder:${uibInstance}] Socket.io details`, { 'ClientCount': node.ioClientsCount, 'rcvdMsgCount': node.rcvMsgCount, 'Channels': node.ioChannels, 'Namespace': node.ioNamespace } )
        //#endregion ----- socket.io instance config ----- //

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( uib.deployments.hasOwnProperty(node.id) ) uib.deployments[node.id]++
        else uib.deployments[node.id] = 1
        log.trace(`[uibuilder:${uibInstance}] Number of uib.Deployments`, uib.deployments[node.id] )

        //#region ----- Set up ExpressJS Middleware ----- //
        /** Provide the ability to have a ExpressJS middleware hook.
         * This can be used for custom authentication/authorisation or anything else.
         */
        var httpMiddleware = function(req,res,next) { next() }
        /** Check for <uibRoot>/.config/uibMiddleware.js, use it if present. Copy template if not exists @since v2.0.0-dev4 */
        let uibMwPath = path.join(uib.rootFolder,'.config','uibMiddleware.js')
        if ( ! fs.existsSync(uibMwPath) ) {
            // Doesn't exist so copy the Template
            fs.copySync( path.join(uib.masterTemplateFolder, 'uibMiddleware.js'), uibMwPath, {'overwrite':false, 'preserveTimestamps':true})
            log.trace(`[uibuilder:${uibInstance}] Copied uibMiddleware template file from ${uib.masterTemplateFolder} to ${uibMwPath} (not overwriting)` )
        }
        try {
            const uibMiddleware = require(uibMwPath)
            if ( typeof uibMiddleware === 'function' ) {
                httpMiddleware = uibMiddleware
            }    
        } catch (e) {
            log.trace(`[uibuilder:${uibInstance}] uibuilder Middleware failed to load. Reason: `, e.message)
        }

        /** This ExpressJS middleware runs when the uibuilder page loads - set cookies and headers
         * @see https://expressjs.com/en/guide/using-middleware.html */
        function masterMiddleware (req, res, next) {
            // Tell the client what Socket.IO namespace to use,
            // trim the leading slash because the cookie will turn it into a %2F
            res.setHeader('uibuilder-namespace', node.ioNamespace)
            res.cookie('uibuilder-namespace', tilib.trimSlashes(node.ioNamespace), {path: node.url, sameSite: true})
            next()
        }
        //#endregion ----- Express Middleware ----- //

        //#region ----- Create instance local folder structure ----- //
        var customStatic = function(req, res, next) { next() } // Dummy ExpressJS middleware, replaced by local static folder if needed
        var customFoldersOK = true
        try {
            fs.mkdirSync(node.customFolder)
            fs.accessSync(node.customFolder, fs.constants.W_OK)
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error(`[uibuilder:${uibInstance}] Local custom folder ERROR`, e.message)
                customFoldersOK = false
            }
        }
        // Then make sure the DIST & SRC folders for this node instance exist
        try {
            fs.mkdirSync( path.join(node.customFolder, 'dist') )
            fs.mkdirSync( path.join(node.customFolder, 'src') )
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error(`[uibuilder:${uibInstance}] Local custom dist or src folder ERROR`, e.message)
                customFoldersOK = false
            }
        }

        // We've checked that the custom folder is there and has the correct structure
        if ( uib_rootFolder_OK === true && customFoldersOK === true ) {
            // local custom folders are there ...
            log.trace(`[uibuilder:${uibInstance}] Using local front-end folders in`, node.customFolder)

            /** Now copy files from the master template folder (instead of master src) @since 2017-10-01
             *  Note: We don't copy the master dist folder
             *  Don't copy if copy turned off in admin ui 
             */
            if ( node.copyIndex ) {
                const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
                fs.copy( path.join( uib.masterTemplateFolder, uib.masterTemplate ), path.join(node.customFolder, 'src'), cpyOpts, function(err){
                    if(err){
                        log.error(`[uibuilder:${uibInstance}] Error copying template files from ${path.join( __dirname, 'templates')} to ${path.join(node.customFolder, 'src')}`, err)
                    } else {
                        log.trace(`[uibuilder:${uibInstance}] Copied template files to local src (not overwriting)`, node.customFolder )
                    }
                })
            }
        } else {
            // Local custom folders are not right!
            log.error(`[uibuilder:${uibInstance}] Wanted to use local front-end folders in ${node.customFolder} but could not`)
        }

        //#region Add static path for instance local custom files
        // TODO: need a build capability for dist - nb probably keep vendor and private code separate
        try {
            // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
            fs.accessSync( path.join(node.customFolder, 'dist', 'index.html'), fs.constants.R_OK )
            // If the ./dist/index.html exists use the dist folder...
            log.trace(`[uibuilder:${uibInstance}] Using local dist folder`)
            customStatic = serveStatic( path.join(node.customFolder, 'dist') )
            // NOTE: You are expected to have included vendor packages in
            //       a build process so we are not loading them here
        } catch (e) {
            // dist not being used or not accessible, use src
            log.trace(`[uibuilder:${uibInstance}] Dist folder not in use or not accessible. Using local src folder`, e.message )
            customStatic = serveStatic( path.join(node.customFolder, 'src') )
        }
        //#endregion -- Added static path for local custom files -- //
        //#endregion ------ End of Create custom folder structure ------- //

        /** Apply all of the middleware functions to the current instance url 
         * Must be applied in the right order with the most important first */
        app.use( tilib.urlJoin(node.url), httpMiddleware, masterMiddleware, customStatic, masterStatic )
        /** If enabled, allow for directory listing of the custom instance folder */
        if ( node.showfolder === true ) {
            app.use( tilib.urlJoin(node.url, 'idx'), 
                serveIndex( node.customFolder, {'icons':true, 'view':'details'} ), 
                serveStatic( node.customFolder ) 
            )
        }
        /** Make the uibuilder static common folder available */
        app.use( tilib.urlJoin(node.url,'common'), commonStatic )

        const fullPath = tilib.urlJoin( httpNodeRoot, node.url ) // same as node.ioNamespace

        log.debug(`uibuilder : ${uibInstance} : URL . . . . .  : ${fullPath}`)
        log.debug(`uibuilder : ${uibInstance} : Source files . : ${node.customFolder}`)

        // We only do the following if io is not already assigned (e.g. after a redeploy)
        uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        /** Each deployed instance has it's own namespace @type {Object.ioNameSpace} */
        const ioNs = io.of(node.ioNamespace)

        /** When someone loads the page, it will try to connect over Socket.IO
         *  note that the connection returns the socket instance to monitor for responses from
         *  the ui client instance */
        ioNs.on('connection', function(socket) {
            node.ioClientsCount++

            log.trace(`[uibuilder:${uibInstance}] Socket connected, clientCount: ${node.ioClientsCount}, ID: ${socket.id}`)

            uiblib.setNodeStatus( { fill: 'green', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )

            // Let the clients (and output #2) know we are connecting & send the desired debug state
            uiblib.sendControl({
                'uibuilderCtrl': 'client connect',
                'cacheControl': 'REPLAY',          // @since 2017-11-05 v0.4.9 @see WIKI for details
                'debug': node.debugFE,
                '_socketId': socket.id,
                'from': 'server',
                // @since 2018-10-07 v1.0.9 - send server timestamp so that client can work out
                // time difference (UTC->Local) without needing clever libraries.
                'serverTimestamp': (new Date()),
            }, ioNs, node)
            //ioNs.emit( node.ioChannels.control, { 'uibuilderCtrl': 'server connected', 'debug': node.debugFE } )

            // if the client sends a specific msg channel...
            socket.on(node.ioChannels.client, function(msg) {
                log.trace(`[uibuilder:${uibInstance}] Data received from client, ID: ${socket.id}, Msg:`, msg)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'topic': node.topic, 'payload': msg}
                }

                // If the sender hasn't added msg._clientId, add the Socket.id now
                if ( ! msg.hasOwnProperty('_socketId') ) {
                    msg._socketId = socket.id
                }

                // Send out the message for downstream flows
                // TODO: This should probably have safety validations!
                node.send(msg)
            })
            socket.on(node.ioChannels.control, function(msg) {
                log.trace(`[uibuilder:${uibInstance}] Control Msg from client, ID: ${socket.id}, Msg:`, msg)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'uibuilderCtrl': msg }
                }

                // If the sender hasn't added msg._clientId, add the Socket.id now
                if ( ! msg.hasOwnProperty('_socketId') ) {
                    msg._socketId = socket.id
                }

                // @since 2017-11-05 v0.4.9 If the sender hasn't added msg.from, add it now
                if ( ! msg.hasOwnProperty('from') ) {
                    msg.from = 'client'
                }

                // Send out the message on port #2 for downstream flows
                uiblib.sendControl(msg, ioNs, node)  // fn adds topic if needed
                //node.send([null,msg])
            })

            socket.on('disconnect', function(reason) {
                node.ioClientsCount--
                log.trace(
                    `[uibuilder:${uibInstance}] Socket disconnected, clientCount: ${node.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}`
                )
                if ( node.ioClientsCount <= 0) uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )
                else uiblib.setNodeStatus( { fill: 'green', shape: 'ring', text: 'connected ' + node.ioClientsCount }, node )
                // Let the control output port know a client has disconnected
                uiblib.sendControl({
                    'uibuilderCtrl': 'client disconnect',
                    'reason': reason,
                    '_socketId': socket.id,
                    'from': 'server'
                }, ioNs, node)
                //node.send([null, {'uibuilderCtrl': 'client disconnect', '_socketId': socket.id, 'topic': node.topic}])
            })

            socket.on('error', function(err) {
                log.error(`[uibuilder:${uibInstance}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)
                // Let the control output port know there has been an error
                uiblib.sendControl({
                    'uibuilderCtrl': 'socket error',
                    'error': err.message,
                    '_socketId': socket.id,
                    'from': 'server'
                }, ioNs, node)
            })

            /* More Socket.IO events but we really don't need to monitor them
                socket.on('disconnecting', function(reason) {
                    RED.log.audit({
                        'UIbuilder': node.url+' DISCONNECTING received', 'ID': socket.id,
                        'data': reason
                    })
                })
                socket.on('newListener', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' NEWLISTENER received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('removeListener', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' REMOVELISTENER received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('ping', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' PING received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('pong', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' PONG received', 'ID': socket.id,
                        'data': data
                    })
                })
            */

        }) // ---- End of ioNs.on connection ---- //

        /** Handler function for node input events (when a node instance receives a msg)
         * @param {Object} msg The msg object received.
         **/
        function nodeInputHandler(msg) {
            log.trace(`[uibuilder:${uibInstance}] nodeGo:nodeInputHandler - emit received msg - Namespace: ${node.url}`) //debug

            // If msg is null, nothing will be sent
            if ( msg !== null ) {
                // if msg isn't null and isn't an object
                // NOTE: This is paranoid and shouldn't be possible!
                if ( typeof msg !== 'object' ) {
                    // Force msg to be an object with payload of original msg
                    msg = { 'payload': msg }
                }
                // Add topic from node config if present and not present in msg
                if ( !(msg.hasOwnProperty('topic')) || msg.topic === '' ) {
                    if ( node.topic !== '' ) msg.topic = node.topic
                    else msg.topic = uib.moduleName
                }
            }

            // Keep this fn small for readability so offload
            // any further, more customised code to another fn
            msg = uiblib.inputHandler(msg, node, RED, io, ioNs, log)

        } // -- end of msg received processing -- //

        // Process inbound messages
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        node.on('close', function(removed,done) {
            log.trace(`[uibuilder:${uibInstance}] nodeGo:on-close: ${removed?'Node Removed':'Node (re)deployed'}`)

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            //processClose(null, node, RED, ioNs, io, app) // swap with below if needing async
            uiblib.processClose(done, node, RED, ioNs, io, app, log, uib.instances)

            done()
        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    /** Register the node by name. This must be called before overriding any of the
     *  Node functions. */
    RED.nodes.registerType(uib.moduleName, nodeGo, {
        // see userDir/settings.js - makes the settings available to the admin ui
        /* settings: {
            uibuilder: {
                value: {
                    'userVendorPackages': userVendorPackages,
                    'debug': false,
                    //middleware: function(req,res,next){next()},
                    //socketmiddleware: function(socket,next){next()},
                },
                exportable: true
            }
        } */
    })

    //#region --- Admin API's ---

    //#region -- File Handling API's --
    /** Create a simple NR admin API to return the list of files in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibfiles', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        //#region --- Parameter validation ---
        var params = req.query
        // We have to have a url to work with
        if ( req.query.url === undefined ) {
            log.error('[uibfiles] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.query.url.length > 20 ) {
            log.error('[uibfiles] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.query.url.length < 1 ) {
            log.error('[uibfiles] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.url.includes('..') ) {
            log.error('[uibfiles] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }
        // TODO: Does the url exist?

        var folder = params.folder || 'src'
        if ( folder !== 'src' && folder !== 'dist' && folder !== 'root' ) {
            log.error('[uibfiles] Admin API. folder parameter is not one of src|dest|root')
            res.statusMessage = 'folder parameter must be one of src|dest|root'
            res.status(500).end()
            return
        }
        if ( folder === 'root' ) folder = ''

        // cpyIdx - force the index.(html|css|js) files to be present in the src folder if not there
        var cpyIdx = params.cpyIdx === 'true' ? true : false
        //#endregion ---- ----

        log.trace(`[uibfiles] Admin API. File list requested for uibuilder/${req.query.url}/${req.query.folder}/`)

        const srcFolder = path.join(uib.rootFolder, req.query.url, folder)

        /** If requested, copy files from the master template folder
         *  Note: We don't copy the master dist folder
         *  Don't copy if copy turned off in admin ui 
         */
        if ( (folder === 'src') && (cpyIdx === true) ) {
            const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
            const fromTemplateFolder = path.join( uib.masterTemplateFolder, uib.masterTemplate )
            try {
                fs.copySync( fromTemplateFolder, srcFolder, cpyOpts)
                log.trace(`[uibuilder:uibfiles] Copied template files from ${fromTemplateFolder} to ${srcFolder} (not overwriting)` )
            } catch (err) {
                log.error(`[uibuilder:uibfiles] Error copying template files from ${fromTemplateFolder} to ${srcFolder}`, err)
            }
        }

        // Get the file list - note, ignore errors for now
        // TODO: Need to filter out folders. Or better, flatten and allow sub-folders.
        // @ts-ignore
        fs.readdir(srcFolder, {withFileTypes: true}, (err, files) => {
            if ( err ) {
                log.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
                console.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
                res.statusMessage = err
                res.status(500).end()
                return
            }
            // Send back a JSON response body containing the list of files that can be edited
            res.json(
                files
                    .filter(dirent => !dirent.isDirectory())
                    .map(dirent => dirent.name)
            )
        })

    }) // ---- End of uibfiles ---- //

    /** Create a simple NR admin API to return the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibgetfile', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        //#region --- Parameter validation ---
        /** req.query parameters
         * url
         * fname
         * folder
         */
        // We have to have a url (uibuilder url) to work with
        if ( req.query.url === undefined ) {
            log.error('[uibgetfile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.query.url.length > 20 ) {
            log.error('[uibgetfile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.query.url.length < 1 ) {
            log.error('[uibfiles] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.url.includes('..') ) {
            log.error('[uibgetfile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

        // We have to have an fname (file name) to work with
        if ( req.query.fname === undefined ) {
            log.error('[uibgetfile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // Blank file name probably means no files available so we will ignore
        if ( req.query.fname === '' ) {
            res.statusMessage = 'fname parameter null - no file available'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( req.query.fname.length > 255 ) {
            log.error('[uibgetfile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.fname.includes('..') ) {
            log.error('[uibgetfile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }

        //we have to have a folder name
        let folder = req.query.folder
        if ( folder === undefined ) {
            log.error('[uibgetfile] Admin API. folder parameter not provided')
            res.statusMessage = 'folder parameter not provided'
            res.status(500).end()
            return
        }
        // folder cannot contain .. to prevent escaping sub-folder structure
        if ( folder.includes('..') ) {
            log.error('[uibgetfile] Admin API. folder parameter contains ..')
            res.statusMessage = 'folder parameter may not contain ..'
            res.status(500).end()
            return
        }
        // folder can only be one of: 'src', 'dist', 'root'
        switch ( folder ) {
            case 'src':
            case 'dist':
                break
            case 'root':
                folder = ''
                break
            default:
                log.error('[uibgetfile] Admin API. folder parameter is not one of src, dist, root', folder)
                res.statusMessage = 'folder parameter must be one of src, dist, root'
                res.status(500).end()
                return
        }
        //#endregion ---- ----

        log.trace(`[uibgetfile:${req.query.url}] Admin API. File get requested for ${folder}/${req.query.fname}`)

        // Send back a plain text response body containing content of the file
        res.type('text/plain').sendFile(
            req.query.fname, 
            {
                // Prevent injected relative paths from escaping `src` folder
                'root': path.join(uib.rootFolder, req.query.url, folder),
                // Turn off caching
                'lastModified': false, 
                'cacheControl': false
            }
        )
    }) // ---- End of uibgetfile ---- //

    /** Create a simple NR admin API to UPDATE the content of a file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @since 2019-02-04 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    RED.httpAdmin.post('/uibputfile', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        //#region --- Parameter validation ---
        // We have to have a url to work with
        if ( req.body.url === undefined ) {
            log.error('[uibputfile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.body.url.length > 20 ) {
            log.error('[uibputfile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.body.url.length < 1 ) {
            log.error('[uibputfile] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.body.url.includes('..') ) {
            log.error('[uibputfile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

        // We have to have an fname (file name) to work with
        if ( req.body.fname === undefined ) {
            log.error('[uibputfile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( req.body.fname.length > 255 ) {
            log.error('[uibputfile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( req.body.fname.includes('..') ) {
            log.error('[uibputfile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }

        //we have to have a folder name
        let folder = req.body.folder
        if ( folder === undefined ) {
            log.error('[uibputfile] Admin API. folder parameter not provided')
            res.statusMessage = 'folder parameter not provided'
            res.status(500).end()
            return
        }
        // folder cannot contain .. to prevent escaping sub-folder structure
        if ( folder.includes('..') ) {
            log.error('[uibputfile] Admin API. folder parameter contains ..')
            res.statusMessage = 'folder parameter may not contain ..'
            res.status(500).end()
            return
        }
        // folder can only be one of: 'src', 'dist', 'root'
        switch ( folder ) {
            case 'src':
            case 'dist':
                break
            case 'root':
                folder = ''
                break
            default:
                log.error('[uibputfile] Admin API. folder parameter is not one of src, dist, root', folder)
                res.statusMessage = 'folder parameter must be one of src, dist, root'
                res.status(500).end()
                return
        }        
        //#endregion ---- ----
        
        log.trace(`[${req.body.url}:uibputfile] Admin API. File put requested for ${req.body.fname}`)

        // TODO: Add path validation - Also, file should always exist to check that
        const fullname = path.join(uib.rootFolder, req.body.url, folder, req.body.fname)

        fs.writeFile(fullname, req.body.data, function (err, _data) {
            if (err) {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.error(`[${req.body.url}:uibputfile] Admin API. File write FAIL for ${req.body.fname}`, err)
                res.statusMessage = err
                res.status(500).end()
            } else {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.trace(`[${req.body.url}:uibputfile] Admin API. File write SUCCESS for ${req.body.fname}`)
                res.statusMessage = 'File written successfully'
                res.status(200).end()
            }
        })
    }) // ---- End of uibputfile ---- //

    /** Create a simple NR admin API to CREATE a new file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibnewfile', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        //#region --- Parameter validation ---
        // TODO standardise param validation, move to functions
        const params = req.query
        // We have to have a url to work with
        if ( params.url === undefined ) {
            log.error('[uibnewfile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( params.url.length > 20 ) {
            log.error('[uibnewfile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( params.url.length < 1 ) {
            log.error('[uibnewfile] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( params.url.includes('..') ) {
            log.error('[uibnewfile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

        // We have to have an fname (file name) to work with
        if ( params.fname === undefined ) {
            log.error('[uibnewfile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( params.fname.length > 255 ) {
            log.error('[uibnewfile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( params.fname.includes('..') ) {
            log.error('[uibnewfile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }

        //we have to have a folder name
        let folder = params.folder
        if ( folder === undefined ) {
            log.error('[uibnewfile] Admin API. folder parameter not provided')
            res.statusMessage = 'folder parameter not provided'
            res.status(500).end()
            return
        }
        // folder cannot contain .. to prevent escaping sub-folder structure
        if ( folder.includes('..') ) {
            log.error('[uibnewfile] Admin API. folder parameter contains ..')
            res.statusMessage = 'folder parameter may not contain ..'
            res.status(500).end()
            return
        }
        // folder can only be one of: 'src', 'dist', 'root'
        // TODO: Allow for sub-folders in src & dist
        switch ( folder ) {
            case 'src':
            case 'dist':
                break
            case 'root':
                folder = ''
                break
            default:
                log.error('[uibnewfile] Admin API. folder parameter is not one of src, dist, root', folder)
                res.statusMessage = 'folder parameter must be one of src, dist, root'
                res.status(500).end()
                return
        }        
        //#endregion ---- ----
        
        log.trace(`[${params.url}:uibnewfile] Admin API. File create requested for ${folder}/${params.fname}`)

        // TODO: Add path validation - Also, file should always exist to check that
        const fullname = path.join(uib.rootFolder, params.url, folder, params.fname)

        try {
            fs.ensureFileSync(fullname)
            // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
            log.trace(`[${params.url}:uibnewfile] Admin API. File create SUCCESS for ${folder}/${params.fname}`)
            res.statusMessage = 'File created successfully'
            res.status(200).end()
        } catch (err) {
            // Send back a response message and code 500 (Internal Server Error)=Create failed
            log.error(`[${params.url}:uibnewfile] Admin API. File create FAILED for ${folder}/${params.fname}`, err)
            res.statusMessage = err
            res.status(500).end()
        }
    }) // ---- End of uibnewfile ---- //

    /** A simple NR admin API to DELETE a file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibdeletefile', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        //#region --- Parameter validation ---
        // TODO standardise param validation, move to functions
        const params = req.query
        // If the url query param is invalid, exit (res.status was set in function)
        if ( uiblib.checkUrl(params.url, res, 'uibdeletefile', log) === false ) return

        // We have to have an fname (file name) to work with
        if ( params.fname === undefined ) {
            log.error('[uibdeletefile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( params.fname.length > 255 ) {
            log.error('[uibdeletefile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( params.fname.includes('..') ) {
            log.error('[uibdeletefile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }

        //we have to have a folder name
        let folder = params.folder
        if ( folder === undefined ) {
            log.error('[uibdeletefile] Admin API. folder parameter not provided')
            res.statusMessage = 'folder parameter not provided'
            res.status(500).end()
            return
        }
        // folder cannot contain .. to prevent escaping sub-folder structure
        if ( folder.includes('..') ) {
            log.error('[uibdeletefile] Admin API. folder parameter contains ..')
            res.statusMessage = 'folder parameter may not contain ..'
            res.status(500).end()
            return
        }
        // folder can only be one of: 'src', 'dist', 'root'
        // TODO: Allow for sub-folders in src & dist
        switch ( folder ) {
            case 'src':
            case 'dist':
                break
            case 'root':
                folder = ''
                break
            default:
                log.error('[uibdeletefile] Admin API. folder parameter is not one of src, dist, root', folder)
                res.statusMessage = 'folder parameter must be one of src, dist, root'
                res.status(500).end()
                return
        }        
        //#endregion ---- ----
        
        log.trace(`[${params.url}:uibdeletefile] Admin API. File delete requested for ${folder}/${params.fname}`)

        // TODO: Add path validation - Also, file should always exist to check that
        const fullname = path.join(uib.rootFolder, params.url, folder, params.fname)

        try {
            fs.removeSync(fullname)
            // Send back a response message and code 200 = OK
            log.trace(`[${params.url}:uibdeletefile] Admin API. File delete SUCCESS for ${folder}/${params.fname}`)
            res.statusMessage = 'File created successfully'
            res.status(200).end()
        } catch (err) {
            // Send back a response message and code 500 (Internal Server Error)=Create failed
            log.error(`[${params.url}:uibdeletefile] Admin API. File delete FAILED for ${folder}/${params.fname}`, err)
            res.statusMessage = err
            res.status(500).end()
        }
    }) // ---- End of uibdeletefile ---- //

    //#endregion -- File Handling API's -- //

    /** Create an index web page or JSON return listing all uibuilder endpoints
     * Also allows confirmation of whether a url is in use ('check' parameter) or a simple list of urls in use.
     * @since 2019-02-04 v1.1.0-beta6
     */
    RED.httpAdmin.get('/uibindex', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        log.trace('[uibindex] User Page/API. List all available uibuilder endpoints')

        /** If GET includes a "check" parameter, see if that uibuilder URL is in use
         * @returns {boolean} True if the given url exists, else false
         */
        if (req.query.check) {
            res.json( Object.values(uib.instances).includes(req.query.check) )
            return
        }

        /** If no check parameter, return full details based on type parameter */
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
                uiblib.checkInstalledPackages('', uib, userDir, log)

                // Include socket.io as a client library (but don't add to vendorPaths)
                // let sioFolder = tilib.findPackage('socket.io', userDir)
                // let sioVersion = tilib.readPackageJson( sioFolder ).version

                // Collate current ExpressJS urls and details
                var otherPaths = [], uibPaths = []
                var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
                // req.app._router.stack.forEach( function(r, i, stack) { // shows Node-RED admin server paths
                app._router.stack.forEach( function(r, _i, _stack) { // shows Node-RED user server paths
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
                        <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
                        <style type="text/css" media="all">
                            h1 {border-top:1px solid silver;margin-top:0.5em;padding-top:0.2em;}
                        </style>
                    </head><body><div class="container">
                        <p>
                            Note that this page is only accessible to users with Node-RED admin authority.
                        </p>
                        <h1>Index of uibuilder pages</h1>
                        <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
                        <table class="table">
                            <thead><tr>
                                <th>URL</th>
                                <th title="Use this to search for the source node in the admin ui">Source Node Instance</th>
                                <th>Server Filing System Folder</th>
                            </tr></thead><tbody>
                `
                Object.keys(uib.instances).forEach(key => {
                    page += '  <tr>'
                    page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, uib.instances[key])}">${uib.instances[key]}</a></td>`
                    page += `    <td>${key}</td>`
                    page += `    <td>${path.join(uib.rootFolder, uib.instances[key])}</td>`
                    page += '  </tr>'
                })
                page += `</tbody></table>
                    <p>Note that each instance uses its own socket.io <i>namespace</i> that matches <code>httpNodeRoot/url</code>. You can use this to manually send messages to your user interface.</p>
                    <p>Paste the Source Node Instance into the search feature in the Node-RED admin ui to find the instance.
                        The "Filing System Folder" shows you where the front-end (client browser) code lives.</p>
                    <h1>Vendor Client Libraries</h1>
                    <p>You can include these libraries in any uibuilder served web page.
                        Note though that you need to find out the correct file and relative folder either by looking on your Node-RED server in the location shown or by looking at the packages source online. </p>
                        <table class="table"><thead><tr>
                                <th>Package</th>
                                <th>Version</th>
                                <th>uibuilder URL (1)</th>
                                <th>Main Entry Point (2)</th>
                                <th>Server Filing System Folder</th>
                            </tr></thead><tbody>`

                Object.keys(uib.installedPackages).forEach(packageName => {
                    let pj = uib.installedPackages[packageName]
                    page += `
                        <tr>
                            <td><a href="${pj.homepage}">${packageName}</a></td>
                            <td>${pj.version}</a></td>
                            <td>${pj.url}</td>
                            <td><a href="${tilib.urlJoin(httpNodeRoot, pj.url.replace('..',''), pj.main)}">${pj.url}/${pj.main}</a></td>
                            <td>${pj.folder}</td>
                        </tr>
                    `
                })
                page += `</tbody></table>
                    <p>Notes:</p>
                    <ol>
                        <li>
                            Always use relative URL's. All vendor URL's start <code>../uibuilder/vendor/</code>, 
                            all uibuilder and custom file URL's start <code>./</code>.<br>
                            Using relative URL's saves you from needing to worry about http(s), ip names/addresses and port numbers.
                        </li>
                        <li>
                            The 'Main Entry Point' shown is <i>usually</i> a JavaScript file that you will want in your index.html. 
                            However, because this is reported by the authors of the package, it may refer to something completely different, 
                            uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation 
                            for the correct library files to load.
                        </li>
                    </ol>
                `

                page += `
                    <h1>Configuration</h1>
                    <h2>uibuilder</h2>
                    <ul>
                        <li><b>uibuilder Version</b>: ${uib.version}</li>
                        <li><b>uibuilder Global Configuration Folder</b>: ${uib.configFolder}</li>
                        <li><b>uib.rootFolder</b>: ${uib.rootFolder}</li>
                        <li><b>uib_socketPath</b>: ${uib_socketPath}</li>
                    </ul>
                    <h2>Node-RED</h2>
                    <p>See the <code>&lt;userDir&gt;/settings.js</code> file and the 
                    <a href="https://nodered.org/docs/" target="_blank">Node-RED documentation</a> for details.</p>
                    <ul>
                        <li><b>userDir</b>: ${userDir}</li>
                        <li><b>httpNodeRoot</b>: ${httpNodeRoot}</li>
                    </ul>
                    <h2>ExpressJS</h2>
                    <p>See the <a href="https://expressjs.com/en/api.html#app.settings.table" target="_blank">ExpressJS documentation</a> for details.</p>
                    <ul>
                        <li><b>Views Folder</b>: ${app.get('views')}</li>
                        <li><b>View Engine</b>: ${app.get('view engine')}</li>
                        <li><b>View Cache</b>: ${app.get('view cache')}</li>
                    </ul>
                    <h3>app.locals</h3>
                    <pre>${tilib.syntaxHighlight( app.locals )}</pre>
                    <h3>app.mountpath</h3>
                    <pre>${tilib.syntaxHighlight( app.mountpath )}</pre>
                `

                page += `<h1>Installed Packages</h1>
                    <p>
                        These are the front-end libraries uibuilder knows to be installed and made available via ExpressJS serve-static.
                        This is the raw view of the Vendor Client Libraries table above.
                    </p>
                    <pre>${tilib.syntaxHighlight( uib.installedPackages )}</pre>
                `

                // Show the ExpressJS paths currently defined
                page += `
                    <h1>uibuilder Vendor ExpressJS Paths</h1>
                    <p>A raw view of the ExpressJS app.use paths currently in use serving vendor packages.</p>
                    <pre>${tilib.syntaxHighlight( uibPaths )}</pre>
                `
                page += `
                    <h1>Other ExpressJS Paths</h1>
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
    RED.httpAdmin.get('/uibvendorpackages', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        // Update the installed packages list
        uiblib.checkInstalledPackages('', uib, userDir, log)

        res.json(uib.installedPackages)
    }) // ---- End of uibindex ---- //

    /** Call npm. Schema: {name:{(url),cmd}}
     * If url parameter not provided, uibPath = <userDir>, else uibPath = <uib.rootFolder>/<url>
     * Valid commands:
     *    install, remove, update
     *    * = run as npm command with --json output
     * @param {string} [req.query.url=userDir] Optional. If present, CWD is set to the uibuilder folder for that instance. Otherwise CWD is set to the userDir.
     * @param {string} req.query.cmd Command to run (see notes for this function)
     */
    RED.httpAdmin.get('/uibnpmmanage', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        //#region --- Parameter validation (cmd, package) ---
        const params = req.query
        
        // Validate the npm command to be used.
        if ( params.cmd === undefined ) {
            log.error('[uibuilder/uibnpmmanage] uibuilder Admin API. No command provided for npm management.')
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
                log.error('[uibuilder/uibnpmmanage] uibuilder Admin API. Invalid command provided for npm management.')
                res.statusMessage = 'npm command parameter is invalid'
                res.status(500).end()
                return
        }

        // package name must not exceed 255 characters
        //we have to have a package name
        if ( params.package === undefined ) {
            log.error('[uibuilder/uibnpmmanage] uibuilder Admin API. package parameter not provided')
            res.statusMessage = 'package parameter not provided'
            res.status(500).end()
            return
        }
        if ( params.package.length > 255 ) {
            log.error('[uibuilder/uibnpmmanage] uibuilder Admin API. package name parameter is too long (>255 characters)')
            res.statusMessage = 'package name parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        //#endregion ---- ----
        
        // TODO add optional url param that must be an active uibuilder url name
        const folder = userDir

        log.info(`[uibuilder/uibnpmmanage] Admin API. Running npm ${params.cmd} for package ${params.package}`)

        // delete package lock file as it seems to mess up sometimes - no error if it fails
        fs.removeSync(path.join(folder, 'package-lock.json'))

        // Formulate the command to be run
        var command = ''
        switch (params.cmd) {
            case 'install': {
                // npm install --no-audit --no-update-notifier --save --production --color=false --json <packageName> // --save-prefix="~" 
                command = `npm install --no-audit --no-update-notifier --save --production --color=false --json ${params.package}`
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
            log.error('[uibuilder/uibnpmmanage] uibuilder Admin API. No valid command available for npm management.')
            res.statusMessage = 'No valid npm command available'
            res.status(500).end()
            return
        }

        // Run the command - against the correct instance or userDir (cwd)
        var output = [], errOut = null, success = false
        child_process.exec(command, {'cwd': folder}, (error, stdout, stderr) => {
            if ( error ) {
                log.warn(`[uibuilder/uibnpmmanage] Admin API. ERROR Running npm ${params.cmd} for package ${params.package}`, error)
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

            //log.trace(`[uibuilder/uibnpmmanage] Writing stdout to ${path.join(uib.rootFolder,uib.configFolder,'npm-out-latest.txt')}`)
            //fs.writeFile(path.join(uib.configFolder,'npm-out-latest.txt'), stdout, 'utf8', function(){})

            // Update the packageList
            uib.installedPackages = uiblib.checkInstalledPackages(params.package, uib, userDir, log)

            // Check the results of the command
            switch (params.cmd) {
                // check pkg exiss in uib.installedPackages, if so, serve it up
                case 'install': {
                    // package name should exist in uib.installedPackages
                    if ( uib.installedPackages.hasOwnProperty(params.package) ) success = true
                    if (success === true) {
                        // Add an ExpressJS URL
                        uiblib.servePackage(params.package, uib, userDir, log, app)
                    }
                    break
                }
                // Check pkg does not exist in uib.installedPackages, if so, remove served url
                case 'remove': {
                    // package name should NOT exist in uib.installedPackages
                    if ( ! uib.installedPackages.hasOwnProperty(params.package) ) success = true
                    if (success === true) {
                        // Remove ExpressJS URL
                        uiblib.unservePackage(params.package, uib, userDir, log, app)
                    }
                    break
                }
                // Check pkg still exists in uib.installedPackages
                case 'update': {
                    // package name should exist in uib.installedPackages
                    if ( uib.installedPackages.hasOwnProperty(params.package) ) success = true
                    break
                }
            }

            if (success === true) {
                log.info(`[uibuilder/uibnpmmanage] Admin API. npm command success. npm ${params.cmd} for package ${params.package}`)
            } else {
                log.error(`[uibuilder/uibnpmmanage] Admin API. npm command failed. npm ${params.cmd} for package ${params.package}`, jResult)
            }

            res.json({'success':success,'result':jResult,'output':output,'errOut':errOut})
            return
        })

    }) // ---- End of npmmanage ---- //

    //#endregion --- Admin API's ---

} // ==== End of module.exports ==== // 

// EOF
