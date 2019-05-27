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

// @ts-ignore
const nodeVersion = require('../package.json').version
// Utility library for uibuilder
const uiblib = require('./uiblib')
// General purpose library (by Totally Information)
const tilib = require('./tilib')

const serveStatic   = require('serve-static')
const socketio      = require('socket.io')
const path          = require('path')
const fs            = require('fs-extra')
//const events        = require('events')
const child_process = require('child_process')

/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName  = 'uibuilder'

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

/** We want these to track across redeployments
 *  if OK to reset on redeployment, attach to node.xxx inside nodeGo instead. @constant {Object} deployments */
const deployments = {}

/** When nodeGo is run, add the node.id as a key with the value being the url
 *  then add processing to ensure that the URL's are unique. 
 * Schema: {'<node.id>': '<url>'}
 * @constant {Object} instances */
const instances = {}

/** Track the vendor packages installed and their paths
 * Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
 * @type {Object.<string, Object>} vendorPaths */
var vendorPaths = {}

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

    /** Root URL path for http-in/out and uibuilder nodes @constant {string} httpNodeRoot */
    const httpNodeRoot = RED.settings.httpNodeRoot

    /** Default uibuilder global settings - DEPRECATED - to be removed
     * @typedef {Object} globalSettings
     * @prop {string[]} packages List of packages made available globally to the front-end (npm package name)
     * @prop {string} template - Which master template folder to use (index.{html|js|css})
     * @prop {boolean} debug - Should debug output be turned on?
     */
    var uib_globalSettings = { 
        // our default installed packages
        'packages': [ 
            'vue',
            'bootstrap-vue',
            'bootstrap',
        ],
        // Which template to use for default src files? Folder must exist in the master template folder
        'template': 'vue',
        // Back-end debug?
        'debug': false,
    }

    //#region ----- back-end debugging ----- //
    // TODO do this again once we have the instance settings
    if (uib_globalSettings.debug) {
        // log.debugging = uib_globalSettings.debug === true ? true : false
        log = RED.log
    }
    log.trace('[uibuilder:Module] ----------------- uibuilder - module started -----------------')
    //#endregion ----- back-end debugging ----- //

    /** Location of master template folders (containing default front-end code) @constant {string} masterTemplateFolder */
    const masterTemplateFolder = path.join( __dirname, 'templates' )

    /** Set the root folder (on the server FS) for all uibuilder front-end data
     *  Name of the fs path used to hold custom files & folders for all instances of uibuilder
     * @constant {string} uib_rootFolder
     * @default <userDir>/<moduleName>
     **/
    var uib_rootFolder = path.join(userDir, moduleName)

    // If projects are enabled - update root folder to `<userDir>/projects/<projectName>/uibuilder/<url>`
    const currProject = uiblib.getProps(RED, RED.settings.get('projects'), 'activeProject', '')
    if ( currProject !== '' ) uib_rootFolder = path.join(userDir, 'projects', currProject, moduleName) 
    
    /** @constant {string} newSettingsFile Location of the global settings file default: <uib_rootFolder>/.settings.json {@link uib_rootFolder} */
    const newSettingsFile = path.join(uib_rootFolder, '.settings.json')

    /** We need an http server to serve the page and vendor packages. 
     * @since 2019-02-04 removed httpAdmin - we only want to use httpNode for web pages 
     * @since v2.0.0 2019-02-23 Moved from instance level (nodeGo()) to module level */
    const app = RED.httpNode // || RED.httpAdmin

    //#endregion -------- Constants -------- //

    //#region ----- Set up uibuilder root & root/common folders ----- //
    /** Check uib root folder: create if needed, writable?
     * @since v2.0.0 2019-03-03
     */
    var uib_rootFolder_OK = true
    // Try to create it - ignore error if it already exists
    try {
        //fs.mkdirSync(uib_rootFolder) // try to create
        fs.ensureDirSync(uib_rootFolder)
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib_rootFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }
    }
    // Try to access it (read/write) - if we can, create and serve the common resource folder
    try {
        fs.accessSync( uib_rootFolder, fs.constants.R_OK | fs.constants.W_OK ) // try to access read/write
        // and create the common resource folder
        const commonPath = path.join(uib_rootFolder, 'common')
        fs.ensureDirSync(commonPath)
        // and serve it up as a static resource folder (added in nodeGo() so available for each instance as `./common/`)
        var commonStatic = serveStatic( commonPath )
    } catch (e) {
        RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib_rootFolder}. ${e.message}`)
        uib_rootFolder_OK = false
    }
    //#endregion ----- root folder ----- //
    
    /** Serve up vendor packages - this is the first check, the installed packages are rechecked at various times.
     * Adds ExpressJS static paths for each found FE package & saves the details to the vendorPaths variable.
     * @since v2.0.0 Since we no longer use a global settings file, the initial run
     *               of this only finds any "well known" library packages that are
     *               installed in userDir/node_modules - e.g. the ones that the uibuilder
     *               installation installs for you.
     */
    vendorPaths = uiblib.updVendorPaths(vendorPaths, moduleName, userDir, log, app, serveStatic, RED)

    //#region ----- Set up Socket.IO server & middleware ----- //
    /** Holder for Socket.IO - we want this to survive redeployments of each node instance
     *  so that existing clients can be reconnected.
     * Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
     * modules that might also use it (path). This is only needed ONCE for ALL instances of this node.
     **/

    /** URI path for accessing the socket.io client from FE code. 
     * @since v2.0.0-dev Now: `../uibuilder/vendor/socket.io/socket.io.js`
     * @constant {string} uib_socketPath */
    //const uib_socketPath = tilib.urlJoin(httpNodeRoot, moduleName, 'socket.io')
    const uib_socketPath = tilib.urlJoin(httpNodeRoot, moduleName, 'vendor', 'socket.io')

    log.trace('[uibuilder:Module] Socket.IO initialisation - Socket Path=', uib_socketPath )
    var io = socketio.listen(RED.server, {'path': uib_socketPath}) // listen === attach
    // @ts-ignore
    io.set('transports', ['polling', 'websocket'])

    /** Check that all incoming SocketIO data has the IO cookie
     *  WARNING: This will be called ONLY when the initial connection happens,
     *           it is NOT run on every message exchange.
     *           This means that websocket connections can NEVER be as secure.
     *           since token expiry and validation is only run once
     * TODO Could be mitigated with custom function in msg send and receive functions */
    // TODO: Needs a bit more work to add some real security - should it be on ioNs? - No! Pointless as it is only done on connection
    // TODO Include from external file: `<uibRoot>/.commonIoMiddleware.js` and/or `<uibRoot>/<instanceName>/.ioMiddleware.js`
    io.use(function(socket, next){
        /* Some SIO related info that might be useful in security checks
            //console.log('--socket.request.connection.remoteAddress--')
            //console.dir(socket.request.connection.remoteAddress)
            //console.log('--socket.handshake.address--')
            //console.dir(socket.handshake.address)
            //console.dir(io.sockets.connected)
        */
        if (socket.request.headers.cookie) {
            //log.info('[uibuilder:Module] io.use - Authentication OK - ID: ' + socket.id)
            //log.trace('[uibuilder:Module] Cookie', socket.request.headers.cookie)  // socket.handshake.headers.cookie
            return next()
        }
        next(new Error('UIbuilder:io.use - Authentication error - ID: ' + socket.id ))
    })
    /** @since 2017-12-20 add optional socket middleware from settings.js
     */
    if ( uib_globalSettings.hasOwnProperty('socketmiddleware') ) {
        /** Is a uibuilder specific function available? */
        if ( typeof uib_globalSettings.socketmiddleware === 'function' ) {
            log.trace('[uibuilder:Module] Using socket middleware from settings.js')
            io.use(uib_globalSettings.socketmiddleware)
        }
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
    RED.log.info(`| ${moduleName} initialised:`)
    RED.log.info(`|   root folder: ${uib_rootFolder}`)
    RED.log.info(`|   version . .: ${nodeVersion}`)
    RED.log.info(`|   packages . : ${Object.keys(vendorPaths)},socket.io`)
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
        //#endregion ----- Local node config copy ----- //

        // back-end debugging (again)
        if (node.debugBE === true) log = RED.log

        log.trace(`[uibuilder:${uibInstance}] Node instance settings`, {'name': node.name, 'topic': node.topic, 'url': node.url, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'debugFE': node.debugFE })

        // Keep a log of the active instances @since 2019-02-02
        instances[node.id] = node.url
        log.trace(`[uibuilder:${uibInstance}] Node Instances Registered`, instances)

        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults) @type {string}
         */
        node.customFolder = path.join(uib_rootFolder, node.url)

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
        if ( deployments.hasOwnProperty(node.id) ) deployments[node.id]++
        else deployments[node.id] = 1
        log.trace(`[uibuilder:${uibInstance}] Number of Deployments`, deployments[node.id] )

        //#region ----- Set up ExpressJS Middleware ----- //
        /** Provide the ability to have a ExpressJS middleware hook.
         * This can be used for custom authentication/authorisation or anything else.
         * The function must be defined in settings.js
         * @since v1.0.3 2017-12-15
         */
        // TODO rework to load from a file - `<uibRoot>/.commonMiddleware.js` and/or `<uibRoot>/<instanceName>/.middleware.js`
        var httpMiddleware = function(req,res,next) { next() }
        if ( uib_globalSettings.hasOwnProperty('middleware') ) {
            /** Is a uibuilder specific function available? */
            if ( typeof uib_globalSettings.middleware === 'function' ) {
                log.trace(`[uibuilder:${uibInstance}] Using uibuilder specific middleware from settings.js`)
                httpMiddleware = uib_globalSettings.middleware
            }
        } else {
            /** If not, see if the Node-RED one is available and use that instead.
             * Use httNodeMiddleware function which is defined in settings.js
             * as for the http in/out nodes - normally used for authentication
             */
            if ( typeof RED.settings.httpNodeMiddleware === 'function' ) {
                log.trace(`[uibuilder:${uibInstance}] Using Node-RED middleware from settings.js`)
                httpMiddleware = RED.settings.httpNodeMiddleware
            }
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
        var customStatic = function(req,res,next) { next() } // Dummy ExpressJS middleware, replaced by local static folder if needed
        var customFoldersOK = true
        // TODO: May be better as async calls - probably not, but a promisified version would be OK?
        // TODO make sure the folder for this node instance exists
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
             * TODO: always copy index.html */
            if ( node.copyIndex ) {
                const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
                fs.copy( path.join( masterTemplateFolder, uib_globalSettings.template ), path.join(node.customFolder, 'src'), cpyOpts, function(err){
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
        app.use( tilib.urlJoin(node.url,'common'), commonStatic )

        const fullPath = tilib.urlJoin( httpNodeRoot, node.url ) // same as node.ioNamespace

        log.info(`uibuilder : ${uibInstance} : URL . . . . .  : ${fullPath}`)
        log.info(`uibuilder : ${uibInstance} : Source files . : ${node.customFolder}`)

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
                    else msg.topic = 'uibuilder'
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
            uiblib.processClose(done, node, RED, ioNs, io, app, log, instances)

            done()
        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    /** Register the node by name. This must be called before overriding any of the
     *  Node functions. */
    RED.nodes.registerType(moduleName, nodeGo, {
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
    /** Create a simple NR admin API to return the list of files in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibfiles', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        //#region --- Parameter validation ---
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

        var folder = req.query.folder || 'src'
        if ( folder !== 'src' && folder !== 'dist' && folder !== 'root' ) {
            log.error('[uibfiles] Admin API. folder parameter is not one of src|dest|root')
            res.statusMessage = 'folder parameter must be one of src|dest|root'
            res.status(500).end()
            return
        }
        if ( folder === 'root' ) folder = ''
        //#endregion ---- ----

        log.trace(`[uibfiles] Admin API. File list requested for uibuilder/${req.query.url}/${req.query.folder}/`)

        const srcFolder = path.join(uib_rootFolder, req.query.url, folder)

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
                'root': path.join(uib_rootFolder, req.query.url, folder),
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
        const fullname = path.join(uib_rootFolder, req.body.url, folder, req.body.fname)

        fs.writeFile(fullname, req.body.data, function (err, data) {
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
        const fullname = path.join(uib_rootFolder, params.url, folder, params.fname)

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
        // We have to have a url to work with
        if ( params.url === undefined ) {
            log.error('[uibdeletefile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( params.url.length > 20 ) {
            log.error('[uibdeletefile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( params.url.length < 1 ) {
            log.error('[uibdeletefile] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( params.url.includes('..') ) {
            log.error('[uibdeletefile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

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
        const fullname = path.join(uib_rootFolder, params.url, folder, params.fname)

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
            res.json( Object.values(instances).includes(req.query.check) )
            return
        }

        /** If no check parameter, return full details based on type parameter */
        switch (req.query.type) {
            case 'json': {
                res.json(instances)
                break
            }
            case 'urls': {
                res.json(Object.values(instances))
                break
            }
            // default to 'html' output type
            default: {
                //console.log('Expresss 3.x - app.routes: ', app.routes) // Expresss 3.x
                //console.log('Expresss 3.x with express.router - app.router.stack: ', app.router.stack) // Expresss 3.x with express.router
                //console.log('Expresss 4.x - app._router.stack: ', app._router.stack) // Expresss 4.x
                //console.log('Restify - server.router.mounts: ', server.router.mounts) // Restify

                // Update the vendorPaths master variable
                vendorPaths = uiblib.updVendorPaths(vendorPaths, moduleName, userDir, log, app, serveStatic, RED)

                // Include socket.io as a client library (but don't add to vendorPaths)
                let sioFolder = tilib.findPackage('socket.io', userDir)
                let sioVersion = tilib.readPackageJson( sioFolder ).version

                // Collate current ExpressJS urls and details
                var otherPaths = [], uibPaths = []
                var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
                // req.app._router.stack.forEach( function(r, i, stack) { // shows Node-RED admin server paths
                app._router.stack.forEach( function(r, i, stack) { // shows Node-RED user server paths
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
                let page = `<!doctype html><html lang="en"><head>
                        <title>Uibuilder Index</title>
                        <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen">
                    </head><body><div class="container">
                        <h1>Index of uibuilder pages</h1>
                        <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
                        <table class="table">
                            <thead><tr>
                                <th>URL</th>
                                <th title="Use this to search for the source node in the admin ui">Source Node Instance</th>
                                <th>Server Filing System Folder</th>
                            </tr></thead><tbody>`
                Object.keys(instances).forEach(key => {
                    page += '  <tr>'
                    page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, instances[key])}">${instances[key]}</a></td>`
                    page += `    <td>${key}</td>`
                    page += `    <td>${path.join(uib_rootFolder, instances[key])}</td>`
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
                                <th>uibuilder URL</th>
                                <th>Main Entry Point</th>
                                <th>Server Filing System Folder</th>
                            </tr></thead><tbody><tr>
                                <td><a href="https://socket.io/">socket.io</a></td>
                                <td>${sioVersion}</td>
                                <td>../uibuilder/socket.io/socket.io.js</td>
                                <td><a href="${tilib.urlJoin(httpNodeRoot, 'uibuilder/vendor/socket.io/socket.io.js')}">../uibuilder/vendor/socket.io/socket.io.js</a></td>
                                <td>${sioFolder}</td>
                            </tr>`

                Object.keys(vendorPaths).forEach(packageName => {
                    let pj = vendorPaths[packageName]
                    page += '  <tr>'
                    page += `    <td><a href="${pj.homepage}">${packageName}</a></td>`
                    page += `    <td>${pj.version}</a></td>`
                    page += `    <td>${pj.url}</td>`
                    page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, pj.url.replace('..',''), pj.main)}">${pj.url}/${pj.main}</a></td>`
                    page += `    <td>${pj.folder}</td>`
                    page += '  </tr>'
                })
                page += '</tbody></table>'
                page += '<blockquote><p><em>Note</em>: Always use relative URL\'s. All vendor URL\'s start <code>../uibuilder/vendor/</code>, all uibuilder and custom file URL\'s start <code>./</code>.</p></blockquote>'
                page += '<p>The \'Main Entry Point\' shown is <i>usually</i> a JavaScript file that you will want in your index.html. However, because this is reported'
                page += 'by the authors of the package, it may refer to something completely different, uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation for the correct library files to load.</p>'

                page += '<h1>Settings</h1>'
                page += '<ul>'
                page += `  <li><b>uibuilder Version</b>: ${nodeVersion}</li>`
                page += `  <li><b>Global Settings File</b>: ${path.join(uib_rootFolder, '.settings.json')}</li>`
                page += `  <li><b>Backend Debug</b>: ${uib_globalSettings.debug}</li>`
                page += `  <li><b>Backend Debug Logs</b>: ${path.join(uib_rootFolder, '.logs')}</li>`
                page += `  <li><b>uib_rootFolder</b>: ${uib_rootFolder}</li>`
                page += `  <li><b>uib_socketPath</b>: ${uib_socketPath}</li>`
                page += `  <li><b>httpNodeRoot</b>: ${httpNodeRoot}</li>`
                page += '</ul>'

                // page += '<h1>userDir/package.json</h1><pre>'
                // page += tilib.syntaxHighlight( readPackageJson(userDir) )
                // page += '</pre>'

                page += '<h1>vendorPaths</h1><pre>'
                page += tilib.syntaxHighlight( vendorPaths )
                page += '</pre>'

                // Show the ExpressJS paths currently defined
                page += `<h1>uibuilder Vendor ExpressJS Paths</h1><pre>${tilib.syntaxHighlight( uibPaths )}</pre>`
                page += `<h1>other ExpressJS Paths</h1><pre>${tilib.syntaxHighlight( otherPaths )}</pre>`

                page += '</div></body></html>'
    
                res.send(page)
    
                break
            }
        }
    }) // ---- End of uibindex ---- //

    /** Check & update installed front-end library packages, return list as JSON */
    RED.httpAdmin.get('/uibvendorpackages', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        // Update the vendorPaths master variable
        uiblib.updVendorPaths(vendorPaths, moduleName, userDir, log, app, serveStatic, RED)

        res.json(vendorPaths)  // schema: [name]
    }) // ---- End of uibindex ---- //

    /** Call npm. Schema: {name:{(url),cmd}}
     * If url parameter not provided, uibPath = <userDir>, else uibPath = <uib_rootFolder>/<url>
     * ~~Returns JSON {error} if package.json doesn't exist in the cwd~~
     * Valid commands:
     *    packages = List the installed npm packages
     *    * = run as npm command with --json output
     * @since v2.0.0 2019-03-02
     * @param {string} [req.query.url=userDir] Optional. If present, CWD is set to the uibuilder folder for that instance. Otherwise CWD is set to the userDir.
     * @param {string} req.query.cmd Command to run (see notes for this function)
     */
    RED.httpAdmin.get('/uibnpm', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        log.trace(`[uibnpm] Call npm. Cmd: ${req.query.cmd}`)

        const npm = 'npm' //process.platform === 'win32' ? 'npm.cmd' : 'npm'

        // Set the Current Working Directory (CWD). Default to userDir ...
        let uibPath = userDir
        // ... but if the url param exists, use the uib root folder+url
        if ( req.query.url ) uibPath = path.join(uib_rootFolder, req.query.url)

        // console.log('[uibnpm] COMSPEC ', process.env.ComSpec) // normally will be cmd.exe for Windows
        console.log(`[uibnpm] Command: ${req.query.cmd}. Package: ${req.query.package}. Path: ${uibPath}`)

        /** results object */
        const output = {
            'result': [],
            'errResult': [],
            'error': [],
            'package': req.query.package || '',
            // Path to be used for npm operations
            'path': uibPath,
            'check': {
                // Check if package.json exists in uibPath
                'package.json': fs.pathExistsSync(path.join(uibPath, 'package.json')),
                // check if node_modules folder exists in uibPath
                'node_modules': fs.pathExistsSync(path.join(uibPath, 'node_modules')),
                // if package param provided, check whether that package folder exists in uibPath
                'package_exists': req.query.package !== '' ? fs.pathExistsSync(path.join(uibPath, 'node_modules', req.query.package)): 'N/A',
            },
        }
        
        // Validate cmd parameter
        let cmd = '',      // command to run (if not empty string)
            chk = true,    // Run the package.json check
            chkWarn = true // If false, package.json check fail will prevent cmd from running

        switch (req.query.cmd) {
            // Check whether chosen uibPath has a package.json - no command run
            case 'check': {
                cmd = ''
                break
            }
            // List the top-level packages installed in uibPath
            case 'packages': {
                if ( req.query.package ) {
                    cmd = ''
                    // IF uibPath = userDir ...
                    //    Read .settings.json, extract package list, replace uib_globalSettings.packages
                    //    foreach package, Check node_modules, remove any that aren't actually installed
                    //    if uib_globalSettings.packages has changed, write back to .settings.json
                    // ELSE
                    //    List the top-level packages installed in uibPath
                    //    cmd = `${npm} ls ${uibPath} --depth=0 --json`
                    /*
                            λ  npm ls C:\src\nr\data\uibuilder\uib --depth=0
                            node-red-project@0.0.4 C:\src\nr\data
                            `-- (empty)
                    */
                } else {
                    cmd = ''
                    output.error.push('No package name supplied for the package list command')
                }

                break
            }
            // Initialise a package.json file in the chosen CWD
            case 'init': {
                cmd = `${npm} init -y --json`
                break
            }
            // Install an npm package in the chosen CWD
            case 'install': {
                /** Don't allow cmd to continue if package.json doesn't exist
                 *  since this will install the package in a parent folder
                 *  and that can be confusing.
                 */
                chkWarn = false
                if ( req.query.package ) {
                    cmd = `${npm} install ${req.query.package} --json`
                } else {
                    // No package to install
                    cmd = ''
                    output.error.push('No package name supplied for the install command')
                }
                break
            }
            // Update an npm package in the chosen CWD
            case 'update': {
                /** Don't allow cmd to continue if package.json doesn't exist
                 *  since this will update the package in a parent folder
                 *  and that can be confusing.
                 */
                chkWarn = false
                if ( req.query.package ) {
                    cmd = `${npm} update ${req.query.package} --json`
                } else {
                    // No package to install
                    cmd = ''
                    output.error.push('No package name supplied for the update command')
                }
                break
            }
            // Remove an npm package from the chosen CWD
            case 'remove': {
                if ( req.query.package ) {
                    if ( output.check.package_exists === true) {
                        cmd = `${npm} remove ${req.query.package} --json`
                    } else {
                        // Package doesn't exist in uibLib/node_modules
                        cmd = ''
                        output.error.push('Package does not exist in node_modules for the remove command')                      
                    }
                } else {
                    // No package to remove
                    cmd = ''
                    output.error.push('No package name supplied for the remove command')
                }
                break
            }
            default: {
                cmd = `${req.query.cmd} --json`
                break
            }
        }

        // Check whether chosen CWD has a package.json - if not, immediately returns an error
        if (chk) {
            if ( output.check['package.json'] === false ) {
                output.errResult.push(`${uibPath}/package.json does not exist`)
                output.error.push(`package.json does not exist in folder ${uibPath}`)
                // If cmd isn't sensible without package.json, stop it now
                if (chkWarn === false) {
                    cmd = ''
                    output.error.push('cmd blocked because no package.json exists at this path')
                }
            } else {
                output.result.push(`${uibPath}/package.json exists`)
            }
            let modPath = path.join(uibPath, 'node_modules')
            if ( output.check['node_modules'] === false ) {
                output.errResult.push(`${modPath} does not exist`)
                output.error.push(`node_modules does not exist in folder ${uibPath}`)
                // If cmd isn't sensible without node_modules folder, stop it now
                if (chkWarn === false) {
                    cmd = ''
                    output.error.push('cmd blocked because no node_modules folder exists at this path')
                }
            } else {
                output.result.push(`${modPath} exists`)
            }
        }

        if (cmd !== '') {
            // Always run the cmd against the correct instance or userDir (cwd)
            let child = child_process.exec(cmd, {'cwd': uibPath}, (error, stdout, stderr) => {
                // try to force output to JSON (or split by newline)
                try {
                    output.result.push(JSON.parse(stdout))
                } catch (error) {
                    output.result.push(stdout.split('\n'))
                }
                try {
                    output.errResult.push(JSON.parse(stderr))
                } catch (error) {
                    output.errResult.push(stderr.split('\n'))
                }

                if (error !== null) output.error.push(error)

                switch (req.query.cmd) {
                    // List the installed modules for this instance
                    case 'packages': {
                        output.packages = Object.keys(output.result[output.result.length-1].dependencies)
                        break
                    }
                    case 'install': {
                        let lastResult = output.result[output.result.length-1]
                        let errCode = uiblib.getProps(RED, lastResult, 'error.code', '')
                        if ( errCode === 'E404' ) {
                            output.error.push(`Package '${req.query.package}' not found by npm`)
                            output.installAction = 'none'
                        }
                        // Note that an install make comprise many add/update/etc actions
                        if ( uiblib.getProps(RED, lastResult, 'updated[0].action', '') === 'update' ) {
                            output.installAction = 'update'
                        }
                        if ( uiblib.getProps(RED, lastResult, 'added[0].action', '') === 'add' ) {
                            output.installAction = 'add'
                        }
                        break
                    }
                    case 'remove': {
                        console.log(`[uibnpm] Command: ${cmd}. Output: `, output)
                        let lastResult = output.result[output.result.length-1]
                        let errCode = uiblib.getProps(RED, lastResult, 'error.code', '')
                        if ( errCode === 'E404' ) {
                            output.error.push(`Package '${req.query.package}' not found by npm`)
                            //output.installAction = 'none'
                        }
                        break
                    }
                    default: {
                        break
                    }
                }

                if ( output.package !== '' ) {
                    // Recheck whether package is actually installed
                    output.check.package_exists = fs.pathExistsSync(path.join(uibPath, 'node_modules', req.query.package))
                    if ( output.check.package_exists === true ) {
                        // If it is, update the global settings & the .settings.json file
                        uib_globalSettings.packages = tilib.mergeDedupe(uib_globalSettings.packages, [output.package])
                        fs.writeFileSync(newSettingsFile, JSON.stringify(uib_globalSettings, null, '    '))
                    } else {
                        // Otherwise, remove from the global settings & the .settings.json file
                        let index
                        while ((index = uib_globalSettings.packages.indexOf(output.package)) > -1) {
                            uib_globalSettings.packages.splice(index, 1)
                            fs.writeFileSync(newSettingsFile, JSON.stringify(uib_globalSettings, null, '    '))
                        }
                    }
                }
                
                res.json(output)
            }) // --- End of exec process (async) --- //
        } else {
            res.json(output)
        }

        console.log(`[uibnpm] Command: ${cmd}. Output: `, output)

    }) // ---- End of uibindex ---- //
    //#endregion --- Admin API's ---

} // ==== End of module.exports ==== //

// EOF
