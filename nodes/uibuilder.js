/**
 * Copyright (c) 2018 Julian Knight (Totally Information)
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
// @ts-check
'use strict';

// Module name must match this nodes html file
const moduleName  = 'uibuilder'
// @ts-ignore
const nodeVersion = require('../package.json').version
const uiblib = require('./uiblib')

const serveStatic      = require('serve-static'),
      socketio         = require('socket.io'),
      path             = require('path'),
      fs               = require('fs-extra'),
      events           = require('events'),
      winston          = require('winston')

const { getInstalledPathSync } = require('get-installed-path')

// These are loaded to the /<uibuilder>/vendor URL path
const vendorPackages = [
    'normalize.css',
    'jquery'
]

// We want these to track across redeployments
// if OK to reset on redeployment, attach to node.xxx inside nodeGo instead.
const deployments = {}

// TODO: track instance urls here
//  when nodeGo is run, add the node.id as a key with the value being the url
//  then add processing to ensure that the URL's are unique.
const instances = {}

function winstonFormatter(options) {
    // - Return string will be passed to logger.
    // - Optionally, use options.colorize(options.level, <string>) to colorize output based on the log level.
    /**
     * options = {
     * {    colorize: false,
            json: false,
            level: 'info',
            message: 'This is an information message.',
            meta: {},
            stringify: undefined,
            timestamp: [Function: timestamp],
            showLevel: true,
            prettyPrint: false,
            raw: false,
            label: null,
            logstash: false,
            depth: null,
            formatter: [Function: winstonFormatter],
            align: false,
            humanReadableUnhandledException: false }
     */
    return options.timestamp() + ' ' +
        (options.level.toUpperCase()+ '          ').slice(0,7) + ' [uibuilder:' +
        moduleName + '] ' +
        (options.message ? options.message : '') +
        (options.meta && Object.keys(options.meta).length ? ' :: '+JSON.stringify(options.meta) : '' );
}

function winstonTimestamp() {
    return (new Date()).toISOString().slice(0,16).replace('T', ' ')
}


module.exports = function(RED) {
    // NB: entries in settings.js are read-only and shouldn't be read using RED.settings.get, that is only for settings that can change in-flight.
    //     see Node-RED issue #1543.

    // Get the uibuilder global settings from settings.js if available, otherwise set to empty object
    const uib_globalSettings = RED.settings.uibuilder || { 'debug': false }

    const userDir = RED.settings.userDir // folder containing settings.js
    const httpNodeRoot = RED.settings.httpNodeRoot // root url path for http-in/out and uibuilder nodes

    // Set to true in settings.js/uibuilder if you want additional debug output to the console - JK @since 2017-08-17, use getProps()
    // @since 2017-09-19 moved to top of module.exports. @since 2017-10-15 var not const as it can be overridden
    var debug = uib_globalSettings.debug || false // JK @since 2017-08-17, Change default answer to false

    // @since 2017-09-19 setup the logger - WARNING: the module folder has to be writable!
    // @TODO: add check for writable, add check for prod/dev, prod+no dev should use standard RED.log
    var winstonTransport
    var log = function(){} // dummy log function - replaced by Winston if debug config is set @since 2019-01-27
    if (debug) {
        // @since 2017-10-06 if debugging, log to ~/.node-red/uibuilder.log, otherwise log to console
        winstonTransport = new (winston.transports.File)({
            filename: path.join(userDir, 'uibuilder.log'),
            maxsize: 50000,
            maxFiles: 10,
            tailable: true,
            json:false,
            timestamp: winstonTimestamp,
            formatter: winstonFormatter
        }) // file in user folder ~/.node-red
        // @ts-ignore
        log = new (winston.Logger)({
            // set log level based on debug var from settings.js/uibuilder
            level: debug === true ? 'silly' : debug, // error, warn, info, verbose, debug, silly; true=silly
            // Where do we want log output to go?
            transports: [
                // @TODO: format console output to match RED.log
                winstonTransport
            ]
        })
    } else {
        // @since 2019-01-27 don't log if debug not set since we output key messages to the Node-RED log anyway
        //winstonTransport = new (winston.transports.Console)()
    }

    log.verbose('----------------- uibuilder - module.exports -----------------')

    /** Holder for Socket.IO - we want this to survive redeployments of each node instance
     *  so that existing clients can be reconnected.
     * Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
     * modules that might also use it (path). This is only needed ONCE for ALL instances of this node.
     * NOTE: This ignores RED.settings.httpNodeRoot deliberately, it will always be /uibuilder/socket.io
     *       otherwise it is impossible to have a standard index.html file.
     **/
    log.debug('uibuilder: Socket.IO initialisation - Socket Path=', uiblib.urlJoin(moduleName, 'socket.io') )
    var io = socketio.listen(RED.server, {'path': uiblib.urlJoin(moduleName, 'socket.io')}) // listen === attach
    // @ts-ignore
    io.set('transports', ['polling', 'websocket'])

    // Check that all incoming SocketIO data has the IO cookie
    // TODO: Needs a bit more work to add some real security - should it be on ioNs? - No! Pointless as it is only done on connection
    io.use(function(socket, next){
        /* Some SIO related info that might be useful in security checks
            //console.log('--socket.request.connection.remoteAddress--')
            //console.dir(socket.request.connection.remoteAddress)
            //console.log('--socket.handshake.address--')
            //console.dir(socket.handshake.address)
            //console.dir(io.sockets.connected)
        */
        if (socket.request.headers.cookie) {
            //log.info('UIbuilder:io.use - Authentication OK - ID: ' + socket.id)
            //log.debug(socket.request.headers.cookie)  // socket.handshake.headers.cookie
            return next()
        }
        next(new Error('UIbuilder:io.use - Authentication error - ID: ' + socket.id ))
    })
    /** @since 2017-12-20 add optional socket middleware from settings.js
     * Use for custom authorisation such as JWT.
     * WARNING: This will be called ONLY when the initial connection happens,
     *          it is NOT run on every message exchange.
     *          This means that websocket connections can NEVER be as secure.
     *          since token expiry and validation is only run once
     **/
    if ( uib_globalSettings.hasOwnProperty('socketmiddleware') ) {
        /** Is a uibuilder specific function available? */
        if ( typeof uib_globalSettings.socketmiddleware === 'function' ) {
            io.use(uib_globalSettings.socketmiddleware)
        }
    }

    /**
     * Run the node instance
     * @param {*} config
     */
    function nodeGo(config) {
        // Create the node
        RED.nodes.createNode(this, config)

        //moduleInstance = config.url // for logging
        log.verbose('================ instance registered ================')

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        //#region --- Create local copies of the node configuration (as defined in the .html file)
        // NB: node.id and node.type are also available
        node.name          = config.name || ''
        node.topic         = config.topic || ''
        // TODO: Needs validation as a suitable URL path
        node.url           = config.url  || moduleName
        node.fwdInMessages = config.fwdInMessages        // @since 2017-09-20 changed to remove default, || with boolean doesn't work properly
        node.allowScripts  = config.allowScripts
        node.allowStyles   = config.allowStyles
        node.debugFE       = config.debugFE
        node.copyIndex     = config.copyIndex
        //#endregion ----

        log.verbose( 'node settings', {'name': node.name, 'topic': node.topic, 'url': node.url, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'debugFE': node.debugFE })

        /** User supplied vendor packages
         * & only if using dev folders (delete ~/.node-red/uibuilder/<url>/dist/index.html)
         * JK @since 2017-08-17 fix for non-existent properties and use getProps()
         * JK @since 2018-01-06 use uib_globalSettings instead of RED.settings.uibuilder. At least an empty array is returned.
         */
        node.userVendorPackages = uiblib.getProps(RED,config,'userVendorPackages',null) || uiblib.getProps(RED,uib_globalSettings,'userVendorPackages',[])
        // Name of the fs path used to hold custom files & folders for all instances of uibuilder
        node.customAppFolder = path.join(userDir, moduleName)
        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults)
         */
        node.customFolder = path.join(node.customAppFolder, node.url)

        log.verbose( 'node pkg details', { 'usrVendorPkgs': node.userVendorPackages, 'customAppFldr': node.customAppFolder, 'customFldr': node.customFolder } )

        // Socket.IO config
        node.ioClientsCount = 0 // how many Socket clients connected to this instance?
        node.rcvMsgCount = 0 // how many msg's received since last reset or redeploy?
        // The channel names for Socket.IO
        node.ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: moduleName}
        // Make sure each node instance uses a separate Socket.IO namespace - WARNING: This HAS to match the one derived in uibuilderfe.js
        // @since v1.0.10, changed namespace creation to correct a missing / if httpNodeRoot had been changed from the default
        node.ioNamespace = uiblib.urlJoin(httpNodeRoot, node.url)

        log.verbose(  'io', { 'ClientCount': node.ioClientsCount, 'rcvdMsgCount': node.rcvMsgCount, 'Channels': node.ioChannels, 'Namespace': node.ioNamespace } )

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( deployments.hasOwnProperty(node.id) ) deployments[node.id]++
        else deployments[node.id] = 1
        log.debug(  'deployments', deployments[node.id] )

        // We need an http server to serve the page
        const app = RED.httpNode || RED.httpAdmin

        /** Provide the ability to have a ExpressJS middleware hook.
         * This can be used for custom authentication/authorisation or anything else.
         * The function must be defined in settings.js
         * @since v1.0.3 2017-12-15
         */
        var httpMiddleware = function(req,res,next) { next() }
        if ( uib_globalSettings.hasOwnProperty('middleware') ) {
            /** Is a uibuilder specific function available? */
            if ( typeof uib_globalSettings.middleware === 'function' ) {
                httpMiddleware = uib_globalSettings.middleware
            }
        } else {
            /** If not, see if the Node-RED one is available and use that instead.
             * Use httNodeMiddleware function which is defined in settings.js
             * as for the http in/out nodes - normally used for authentication
             */
            if ( typeof RED.settings.httpNodeMiddleware === 'function' ) {
                httpMiddleware = RED.settings.httpNodeMiddleware
            }
        }

        // This ExpressJS middleware runs when the uibuilder page loads
        // @see https://expressjs.com/en/guide/using-middleware.html
        function localMiddleware (req, res, next) {
            // Tell the client what Socket.IO namespace to use,
            // trim the leading slash because the cookie will turn into a %2F
            res.setHeader('uibuilder-namespace', node.ioNamespace)
            res.cookie('uibuilder-namespace', uiblib.trimSlashes(node.ioNamespace), {path: node.url, sameSite: true})
            //res.write( '<script>var uibuilderIOnamespace = ' + node.ioNamespace + '</script>')
            next()
        }

        //#region ----- Create local folder structure ----- //
        var customStatic = function(req,res,next) { next() } // Dummy ExpressJS middleware, replaced by local static folder if needed
        var customFoldersOK = true
        // TODO: May be better as async calls - probably not, but a promisified version would be OK?
        // Make sure the global custom folder exists first
        try {
            fs.mkdirSync(node.customAppFolder) // try to create
            fs.accessSync( node.customAppFolder, fs.constants.W_OK ) // try to access
        } catch (e) {
            if ( e.code !== 'EEXIST' ) { // ignore folder exists error
                log.error('uibuilder custom folder ERROR, path: ' + path.join(userDir, node.customAppFolder) + ', error: ' + e.message)
                customFoldersOK = false
            }
        }
        // make sure the folder for this node instance exists
        try {
            fs.mkdirSync(node.customFolder)
            fs.accessSync(node.customFolder, fs.constants.W_OK)
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error('uibuilder local custom folder ERROR: ' + e.message)
                customFoldersOK = false
            }
        }
        // Then make sure the DIST & SRC folders for this node instance exist
        try {
            fs.mkdirSync( path.join(node.customFolder, 'dist') )
            fs.mkdirSync( path.join(node.customFolder, 'src') )
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error('uibuilder local custom dist or src folder ERROR: ' + e.message)
                customFoldersOK = false
            }
        }

        if ( customFoldersOK === true ) {
            // local custom folders are there ...
            log.debug( 'uibuilder using local front-end folders in ', node.customFolder)

            // Now copy files from the master template folder (instead of master src) @since 2017-10-01
            // Note: We don't copy the master dist folder
            // Don't copy if copy turned off in admin ui @TODO: always copy index.html
            if ( node.copyIndex ) {
                const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
                fs.copy( path.join( __dirname, 'templates' ), path.join(node.customFolder, 'src'), cpyOpts, function(err){
                    if(err){
                        log.error( 'uibuilder: Error copying template files from ', path.join( __dirname, 'templates'), ' to ', path.join(node.customFolder, 'src'), '. ', err)
                    } else {
                        log.debug('UIbuilder: Copied template files to local src (not overwriting) ', node.customFolder )
                    }
                })
            }
        } else {
            // Local custom folders are not right!
            log.error( 'uibuilder wanted to use local front-end folders in ', node.customFolder, ' but could not')
        }

        //#region Add static path for local custom files
        // TODO: need a build capability for dist - nb probably keep vendor and private code separate
        try {
            // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
            fs.accessSync( path.join(node.customFolder, 'dist', 'index.html'), fs.constants.R_OK )
            // If the ./dist/index.html exists use the dist folder...
            log.debug('Using local dist folder' )
            customStatic = serveStatic( path.join(node.customFolder, 'dist') )
            // NOTE: You are expected to have included vendor packages in
            //       a build process so we are not loading them here
        } catch (e) {
            // dist not being used or not accessible, use src
            log.debug('dist folder not in use or not accessible. Using local src folder. ', e.message );
            customStatic = serveStatic( path.join(node.customFolder, 'src') )
            // Include vendor resource source paths if needed
            node.userVendorPackages.forEach(function (packageName) {
                // @since 2017-09-19 Using get-installed-path to find where a module is actually installed
                // @since 2017-09-19 AND try require.resolve() as backup (NB this may return unusable path for linked modules)
                var installPath = ''
                try { //@since 2017-09-21 force cwd to be NR's UserDir - Colin Law
                    installPath = getInstalledPathSync(packageName, {local:true, cwd: userDir})
                } catch (e1) {
                    // if getInstalledPath fails, try nodejs internal resolve
                    try {
                        // @since 2017-11-11 v1.0.2 resolve returns the root script not the path
                        installPath = path.dirname( require.resolve(packageName) )
                    } catch (e2) {
                        log.error('Failed to add user vendor path - no install found for ', packageName, ' Try doing "npm install ', packageName, ' --save" from ', userDir)
                        RED.log.warn('UIbuilder: Failed to add user vendor path - no install found for ' + packageName + ' Try doing "npm install ' + packageName + ' --save" from ' + userDir)
                    }
                }
                if (installPath !== '') {
                    log.info('Adding user vendor path', {
                        'url':  uiblib.urlJoin(node.url, 'vendor', packageName), 'path': installPath
                    })
                    app.use( uiblib.urlJoin(node.url, 'vendor', packageName), serveStatic(installPath) )
                }
            })
        }
        //#endregion -- Added static path for local custom files -- //
        //#endregion ------ End of Create custom folder structure ------- //

        // Create a new, additional static http path to enable
        // loading of central static resources for uibuilder
        var masterStatic = function(req,res,next) { next() }
        //Object.defineProperty(f, 'name', {value: myName, writable: false})
        try {
            // Will we use "compiled" version of module front-end code?
            fs.accessSync( path.join(__dirname, 'dist', 'index.html'), fs.constants.R_OK )
            log.debug('Using master production build folder' )
            // If the ./dist/index.html exists use the dist folder...
            masterStatic = serveStatic( path.join( __dirname, 'dist' ) )
        } catch (e) {
            // ... otherwise, use dev resources at ./src/
            log.debug('Using master src folder and master vendor packages' )
            log.debug('  Reason for not using master dist folder: ', e.message )
            masterStatic = serveStatic( path.join( __dirname, 'src' ) )
            // Include vendor resource source paths if needed
            vendorPackages.forEach(function (packageName) {
                // @since 2017-09-19 Using get-installed-path to find where a module is actually installed
                // @since 2017-09-19 AND try require.resolve() as backup (NB this may return unusable path for linked modules)
                var installPath = ''
                try { //@since 2017-09-21 force cwd to be NR's UserDir - Colin Law
                    installPath = getInstalledPathSync(packageName, {local:true, cwd: userDir})
                } catch (e1) {
                    // if getInstalledPath fails, try nodejs internal resolve
                    try {
                        // @since 2017-11-11 v1.0.2 resolve returns the root script not the path
                        installPath = path.dirname( require.resolve(packageName) )
                    } catch (e2) {
                        log.error('UIbuilder: Failed to add master vendor path - no install found for ', packageName, ' Should have been installed by this module')
                        RED.log.warn('UIbuilder: Failed to add master vendor path - no install found for ' + packageName + ' Should have been installed by this module')
                    }
                }
                if (installPath !== '') {
                    log.info( 'UIbuilder: Adding master vendor path', {
                        'url':  uiblib.urlJoin(node.url, 'vendor', packageName), 'path': installPath
                    } )
                    app.use( uiblib.urlJoin(node.url, 'vendor', packageName), serveStatic(installPath) )
                }
            })
        }

        app.use( uiblib.urlJoin(node.url), httpMiddleware, localMiddleware, customStatic, masterStatic )

        const fullPath = uiblib.urlJoin( httpNodeRoot, node.url )

        log.info('UI Builder - Version ' + nodeVersion + ' started at ' + fullPath)
        log.info('UI Builder - Local file overrides at ' + node.customFolder)
        RED.log.info('UI Builder - Version ' + nodeVersion + ' started at ' + fullPath)
        RED.log.info('UI Builder - Local file overrides at ' + node.customFolder)

        //console.dir(app._router.stack)
        //if (debug && process.env.NODE_ENV === 'development') { // Only in dev environment
            // Absolute path to output file
            //var filepath = path.join(__dirname, './routes.generated.txt')
            // Invoke express-print-routes
            //require('express-print-routes')(app, filepath)
        //}

        // We only do the following if io is not already assigned (e.g. after a redeploy)
        uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        // Each deployed instance has it's own namespace
        var ioNs = io.of(node.ioNamespace)

        // When someone loads the page, it will try to connect over Socket.IO
        // note that the connection returns the socket instance to monitor for responses from
        // the ui client instance
        ioNs.on('connection', function(socket) {
            node.ioClientsCount++

            log.debug(
                `UIbuilder: ${node.url} Socket connected, clientCount: ${node.ioClientsCount}, ID: ${socket.id}`
            )

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
                log.debug(
                    `UIbuilder: ${node.url}, Data received from client, ID: ${socket.id}, Msg: ${msg.payload}`
                )

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
            });
            socket.on(node.ioChannels.control, function(msg) {
                log.debug(
                    `UIbuilder: ${node.url}, Control Msg from client, ID: ${socket.id}, Msg: ${msg.payload}`
                )

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
            });

            socket.on('disconnect', function(reason) {
                node.ioClientsCount--
                log.debug(
                    `UIbuilder: ${node.url} Socket disconnected, clientCount: ${node.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}`
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
                log.error(
                    `UIbuilder: ${node.url} ERROR received, ID: ${socket.id}, Reason: ${err.message}`
                )
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

        // handler function for node input events (when a node instance receives a msg)
        function nodeInputHandler(msg) {
            log.debug('UIbuilder:nodeGo:nodeInputHandler - emit received msg - Namespace: ' + node.url) //debug

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
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        node.on('close', function(removed,done) {
            log.debug('uibuilder:nodeGo:on-close:', node.url, '::', removed?'Node Removed':'Node (re)deployed')

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            //processClose(null, node, RED, ioNs, io, app) // swap with below if needing async
            uiblib.processClose(done, node, RED, ioNs, io, app, log)

            done()
        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(moduleName, nodeGo, {
        // see userDir/settings.js - makes the settings available to the admin ui
        settings: {
            uibuilder: {
                value: {
                    userVendorPackages: [],
                    debug: false,
                    //middleware: function(req,res,next){next()},
                    //socketmiddleware: function(socket,next){next()},
                },
                exportable: true
            }
        }
    })

    /** Create a simple NR admin API to return the list of files in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibfiles', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        // Send back a JSON response body containing the list of files that can be edited
        res.json([
            'index.html', 'index.js', 'index.css', 'manifest.json'
        ])
    })

    /** Create a simple NR admin API to return the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibgetfile', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        // TODO: validate parameters
        const fpath = path.join(userDir, moduleName, req.query.url, 'src', req.query.fname)
        console.log(fpath, req.query.url, req.query.fname, userDir)

        // Send back a plain text response body containing content of the file
        // TODO: validate path and file
        res.type('text/plain').sendFile(fpath, {'lastModified': false, 'cacheControl': false})
    })
        
} // ==== End of module.exports ==== //

// EOF
