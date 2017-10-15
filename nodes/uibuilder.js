/**
 * Copyright (c) 2017 Julian Knight (Totally Information)
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
"use strict";

// Module name must match this nodes html file
const moduleName  = 'uibuilder'
const nodeVersion = require('../package.json').version

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

module.exports = function(RED) {

    'use strict'

    // Set to true in settings.js/uibuilder if you want additional debug output to the console - JK @since 2017-08-17, use getProps()
    // @since 2017-09-19 moved to top of module.exports. @since 2017-10-15 var not const as it can be overridden
    var debug = getProps(RED,RED.settings,'uibuilder.debug',false) // JK @since 2017-08-17, Change default answer to false

    // @since 2017-09-19 setup the logger - WARNING: the module folder has to be writable!
    // @TODO: add check for writable, add check for prod/dev, prod+no dev should use standard RED.log
    var winstonTransport
    if (debug) {
        // @since 2017-10-06 if debugging, log to ~/.node-red/uibuilder.log, otherwise log to console
        winstonTransport = new (winston.transports.File)({ filename: path.join(RED.settings.userDir, 'uibuilder.log'), json:false }) // file in user folder ~/.node-red
    } else {
        winstonTransport = new (winston.transports.Console)()
    }
    const log = new winston.Logger({
        // set log level based on debug var from settings.js/uibuilder
        level: debug ? 'silly' : 'warn', // error, warn, info, verbose, debug, silly
        // Where do we want log output to go?
        transports: [
            // @TODO: format console output to match RED.log
            winstonTransport
        ]
    })

    log.debug('\n\n----------------- uibuilder - module.exports -----------------')

    // Holder for Socket.IO - we want this to survive redeployments of each node instance
    // so that existing clients can be reconnected.
    // Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
    // modules that might also use it (path). This is only needed ONCE for ALL instances of this node.
    log.debug('uibuilder: Socket.IO initialisation - Socket Path=', urlJoin(moduleName, 'socket.io') )
    var io = socketio.listen(RED.server, {'path': urlJoin(moduleName, 'socket.io')}) // listen === attach
    io.set('transports', ['polling', 'websocket'])

    // Check that all incoming SocketIO data has the IO cookie
    // TODO: Needs a bit more work to add some real security - should it be on ioNs?
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

    function nodeGo(config) {
        log.debug('============ uibuilder - nodeGo started ============')

        // Create the node
        RED.nodes.createNode(this, config)

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        //#region Create local copies of the node configuration (as defined in the .html file)
        // NB: node.id and node.type are also available
        node.name          = config.name || ''
        node.topic         = config.topic || ''
        // TODO: Needs validation as a suitable URL path
        node.url           = config.url  || 'uibuilder'
        node.fwdInMessages = config.fwdInMessages        // @since 2017-09-20 changed to remove default, || with boolean doesn't work properly
        node.allowScripts  = config.allowScripts
        node.allowStyles   = config.allowStyles
        node.debugFE       = config.debugFE
        //#endregion

        log.debug( {'name': node.name, 'topic': node.topic, 'url': node.url, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'debugFE': node.debugFE })

        /** User supplied vendor packages
         * & only if using dev folders (delete ~/.node-red/uibuilder/<url>/dist/index.html)
         * JK @since 2017-08-17 fix for non-existent properties and use getProps()
         */
        node.userVendorPackages = getProps(RED,config,'userVendorPackages',null) || getProps(RED,RED.settings,'uibuilder.userVendorPackages',[])
        // Name of the fs path used to hold custom files & folders for all instances of uibuilder
        node.customAppFolder = path.join(RED.settings.userDir, 'uibuilder')
        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults)
         */
        node.customFolder = path.join(node.customAppFolder, node.url)

        log.debug( { 'usrVendorPkgs': node.userVendorPackages, 'customAppFldr': node.customAppFolder, 'customFldr': node.customFolder } )

        // Socket.IO config
        node.ioClientsCount = 0 // how many Socket clients connected to this instance?
        node.rcvMsgCount = 0 // how many msg's received since last reset or redeploy?
        // The channel names for Socket.IO
        node.ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}
        // Make sure each node instance uses a separate Socket.IO namespace
        node.ioNamespace = '/' + trimSlashes(node.url)

        log.debug(  'io', { 'ClientCount': node.ioClientsCount, 'rcvdMsgCount': node.rcvMsgCount, 'Channels': node.ioChannels, 'Namespace': node.ioNamespace } )

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( deployments.hasOwnProperty(node.id) ) deployments[node.id]++
        else deployments[node.id] = 1
        log.debug(  'deployments', deployments[node.id] )

        // We need an http server to serve the page
        const app = RED.httpNode || RED.httpAdmin

        // Use httNodeMiddleware function which is defined in settings.js
        // as for the http in/out nodes - normally used for authentication
        var httpMiddleware = function(req,res,next) { next() }
        if (RED.settings.httpNodeMiddleware) {
            if ( typeof RED.settings.httpNodeMiddleware === 'function' ) {
                httpMiddleware = RED.settings.httpNodeMiddleware
            }
        }

        // This ExpressJS middleware runs when the uibuilder page loads
        // @see https://expressjs.com/en/guide/using-middleware.html
        function localMiddleware (req, res, next) {
            // Tell the client what Socket.IO namespace to use,
            // trim the leading slash because the cookie will turn into a %2F
            res.setHeader('x-uibuilder-namespace', node.ioNamespace)
            res.cookie('uibuilder-namespace', trimSlashes(node.ioNamespace), {path: node.url, sameSite: true})
            next()
        }

        // ----- Create local folder structure ----- //
        var customStatic = function(req,res,next) { next() } // Dummy ExpressJS middleware, replaced by local static folder if needed
        var customFoldersOK = true
        // TODO: May be better as async calls - probably not, but a promisified version would be OK?
        // Make sure the global custom folder exists first
        try {
            fs.mkdirSync(node.customAppFolder) // try to create
            fs.accessSync( node.customAppFolder, fs.constants.W_OK ) // try to access
        } catch (e) {
            if ( e.code !== 'EEXIST' ) { // ignore folder exists error
                log.error('uibuilder custom folder ERROR, path: ' + path.join(RED.settings.userDir, node.customAppFolder) + ', error: ' + e.message)
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
            const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
            fs.copy( path.join( __dirname, 'templates' ), path.join(node.customFolder, 'src'), cpyOpts, function(err){
                if(err){
                    log.error( 'uibuilder: Error copying template files from ', path.join( __dirname, 'templates'), ' to ', path.join(node.customFolder, 'src'), '. ', err)
                } else {
                    log.debug('UIbuilder: Copied template files to local src (not overwriting) ', node.customFolder )
                }
              })
        } else {
            // Local custom folders are not right!
            log.error( 'uibuilder wanted to use local front-end folders in ', node.customFolder, ' but could not')
        }

        // Add static path for local custom files
        // TODO: need a build capability for dist - nb probably keep vendor and private code separate
        try {
            // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
            fs.accessSync( path.join(node.customFolder, 'dist', 'index.html'), fs.constants.R_OK )
            // If the ./dist/index.html exists use the dist folder...
            log.debug('UIbuilder:', node.url, ':: Using local dist folder' )
            customStatic = serveStatic( path.join(node.customFolder, 'dist') )
            // NOTE: You are expected to have included vendor packages in
            //       a build process so we are not loading them here
        } catch (e) {
            // dist not being used or not accessible, use src
            log.debug('UIbuilder:', node.url, ':: dist folder not in use or not accessible. Using local src folder. ', e.message );
            customStatic = serveStatic( path.join(node.customFolder, 'src') )
            // Include vendor resource source paths if needed
            node.userVendorPackages.forEach(function (packageName) {
                // @since 2017-09-19 Using get-installed-path to find where a module is actually installed
                // @since 2017-09-19 AND try require.resolve() as backup (NB this may return unusable path for linked modules)
                var installPath = ''
                try { //@since 2017-09-21 force cwd to be NR's UserDir - Colin Law
                    installPath = getInstalledPathSync(packageName, {local:true, cwd: RED.settings.userDir})
                } catch (e1) {
                    try {
                        installPath = require.resolve(packageName)
                    } catch (e2) {
                        log.error('UIbuilder: Failed to add user vendor path - no install found for ', packageName, ' Try doing "npm install ', packageName, ' --save" from ', RED.settings.userDir)
                        RED.log.warn('UIbuilder: Failed to add user vendor path - no install found for ' + packageName + ' Try doing "npm install ' + packageName + ' --save" from ' + RED.settings.userDir)
                    }
                }
                if (installPath !== '') {
                    log.debug('UIbuilder: Adding user vendor path', {'url':  urlJoin(node.url, 'vendor', packageName), 'path': installPath})
                    app.use( urlJoin(node.url, 'vendor', packageName), serveStatic(installPath) )
                }
            })
        }
        // ------ End of Create custom folder structure ------- //

        // Create a new, additional static http path to enable
        // loading of central static resources for uibuilder
        var masterStatic = function(req,res,next) { next() }
        try {
            // Will we use "compiled" version of module front-end code?
            fs.accessSync( path.join(__dirname, 'dist', 'index.html'), fs.constants.R_OK )
            log.debug('UIbuilder:', node.url, ' Using master production build folder' )
            // If the ./dist/index.html exists use the dist folder...
            masterStatic = serveStatic( path.join( __dirname, 'dist' ) )
        } catch (e) {
            // ... otherwise, use dev resources at ./src/
            log.debug('UIbuilder:', node.url, ' Using master src folder and master vendor packages' )
            log.debug('  Reason for not using master dist folder: ', e.message )
            masterStatic = serveStatic( path.join( __dirname, 'src' ) )
            // Include vendor resource source paths if needed
            vendorPackages.forEach(function (packageName) {
                // @since 2017-09-19 Using get-installed-path to find where a module is actually installed
                // @since 2017-09-19 AND try require.resolve() as backup (NB this may return unusable path for linked modules)
                var installPath = ''
                try { //@since 2017-09-21 force cwd to be NR's UserDir - Colin Law
                    installPath = getInstalledPathSync(packageName, {local:true, cwd: RED.settings.userDir})
                } catch (e1) {
                    try {
                        installPath = require.resolve(packageName)
                    } catch (e2) {
                        log.error('UIbuilder: Failed to add master vendor path - no install found for ', packageName, ' Should have been installed by this module')
                        RED.log.warn('UIbuilder: Failed to add master vendor path - no install found for ' + packageName + ' Should have been installed by this module')
                    }
                }
                if (installPath !== '') {
                    log.debug('UIbuilder: Adding master vendor path', {'url':  urlJoin(node.url, 'vendor', packageName), 'path': installPath})
                    app.use( urlJoin(node.url, 'vendor', packageName), serveStatic(installPath) )
                }
            })
        }

        app.use( urlJoin(node.url), httpMiddleware, localMiddleware, customStatic, masterStatic )

        const fullPath = urlJoin( RED.settings.httpNodeRoot, node.url )

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
        setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        // Each deployed instance has it's own namespace
        var ioNs = io.of(node.ioNamespace)

        // When someone loads the page, it will try to connect over Socket.IO
        // note that the connection returns the socket instance to monitor for responses from
        // the ui client instance
        ioNs.on('connection', function(socket) {
            node.ioClientsCount++

            log.debug(
                `UIbuilder: ${node.url} Socket connected, clientCount: ${node.ioClientsCount}, ID: ${socket.id}, Cookie: ${socket.handshake.headers.cookie}`
            )
            setNodeStatus( { fill: 'green', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )

            // Let the clients know we are connecting & send the desired debug state
            ioNs.emit( node.ioChannels.control, { 'type': 'server connected', 'debug': node.debugFE } )

            // if the client sends a specific msg channel...
            socket.on(node.ioChannels.client, function(msg) {
                log.debug(
                    `UIbuilder: ${node.url}, Data received from client, ID: ${socket.id}, Cookie: ${socket.handshake.headers.cookie}, Msg: ${msg.payload}`
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

            socket.on('disconnect', function(reason) {
                node.ioClientsCount--
                log.debug(
                    `UIbuilder: ${node.url} Socket disconnected, clientCount: ${node.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}, Cookie: ${socket.handshake.headers.cookie}`
                )
                setNodeStatus( { fill: 'green', shape: 'ring', text: 'connected ' + node.ioClientsCount }, node )
            })

            socket.on('error', function(err) {
                log.error(
                    `UIbuilder: ${node.url} ERROR received, ID: ${socket.id}, Reason: ${err.message}`
                )
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
            msg = inputHandler(msg, node, RED, io, ioNs, log)

        } // -- end of msg received processing -- //
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        node.on('close', function() {
            log.debug('uibuilder:nodeGo:on-close') //debug

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            processClose(null, node, RED, ioNs, io, app) // swap with below if needing async
            //processClose(done, node, RED, ioNs, io, app)

        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(moduleName, nodeGo)

} // ==== End of module.exports ==== //

// ========== UTILITY FUNCTIONS ================ //

// Complex, custom code when processing an incoming msg should go here
// Needs to return the msg object
function inputHandler(msg, node, RED, io, ioNs, log) {
    node.rcvMsgCount++
    //setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Received #' + node.rcvMsgCount}, node)

    // Remove script/style content if admin settings don't allow
    if ( node.allowScripts !== true ) {
        if ( msg.hasOwnProperty('script') ) delete msg.script
    }
    if ( node.allowStyles !== true ) {
        if ( msg.hasOwnProperty('style') ) delete msg.style
    }

    // pass the complete msg object to the uibuilder client
    // TODO: This should have some safety validation on it!
    if (msg._socketId) {
        ioNs.to(msg._socketId).emit(node.ioChannels.server, msg)
    } else {
        ioNs.emit(node.ioChannels.server, msg)
    }


    log.debug('uibuilder - msg sent to front-end via ws channel, ', node.ioChannels.server, ': ', msg)

    if (node.fwdInMessages) {
        // Send on the input msg to output
        node.send(msg)
        log.debug('uibuilder - msg passed downstream to next node: ', msg)
    }

    return msg
} // ---- End of inputHandler function ---- //

// Do any complex, custom node closure code here
function processClose(done = null, node, RED, ioNs, io, app) {
    setNodeStatus({fill: 'red', shape: 'ring', text: 'CLOSED'}, node)

    // Let the clients know we are closing down
    ioNs.emit( node.ioChannels.control, { 'type': 'shutdown' } )

    // Disconnect all Socket.IO clients
    // WARNING: TODO: If we do this, a client cannot reconnect after redeployment
    //                so the user has to reload the page
    //  They have to do this at the moment anyway so might as well.
    const connectedNameSpaceSockets = Object.keys(ioNs.connected) // Get Object with Connected SocketIds as properties
    if ( connectedNameSpaceSockets.length >0 ) {
        connectedNameSpaceSockets.forEach(socketId => {
            ioNs.connected[socketId].disconnect() // Disconnect Each socket
        })
    }
    ioNs.removeAllListeners() // Remove all Listeners for the event emitter
    delete io.nsps[node.ioNamespace] // Remove from the server namespaces

    // We need to remove the app.use paths too.
    // NOTE: Nope, this works better than the original but it doesn't remove everything for some
    //       odd reason. Looks like Express REALLY doesn't like dynamic route removal & we will
    //       just have to live with it!
    var urlRe = new RegExp('^' + escapeRegExp('/^\\' + urlJoin(node.url)) + '.*$');
    //console.log(urlRe.toString())
    app._router.stack.forEach( function(r, i, stack) {
        //let rUrl = urlJoin( r.regexp.toString().replace(/^\/\^\\\//, '').replace(/\\\/\?\(\?\=\\\/\|\$\)\/i$/, '').replace(/\\\/vendor\\\/.*$/, '') )
        let rUrl = r.regexp.toString().replace(urlRe, '')
        //console.log(`${rUrl === r.regexp.toString()} :: ${r.regexp.toString() === urlRe.toString()} :: ${rUrl} :: ${r.regexp.toString()}`)
        if ( rUrl === '' ) {
            //console.log('GOING! ' + r.regexp.toString())
            app._router.stack.splice(i,1)
        }
    })

    /*
        // This code borrowed from the http nodes
        // TODO: THIS DOESN'T ACTUALLY WORK!!! Static routes don't set route.route
        app._router.stack.forEach(function(route,i,routes) {
            if ( route.route && route.route.path === node.url ) {
                routes.splice(i,1)
            }
        });
    */

    // This should be executed last if present. `done` is the data returned from the 'close'
    // event and is used to resolve async callbacks to allow Node-RED to close
    if (done) done()
} // ---- End of processClose function ---- //

// Simple fn to set a node status in the admin interface
// fill: red, green, yellow, blue or grey
// shape: ring or dot
function setNodeStatus( status, node ) {
    if ( typeof status !== 'object' ) status = {fill: 'grey', shape: 'ring', text: status}

    node.status(status)
}

function trimSlashes(str) {
    return str.replace(/(^\/*)|(\/*$)/g, '')
} // ---- End of trimSlashes ---- //

//from: http://stackoverflow.com/a/28592528/3016654
function urlJoin() {
    var paths = Array.prototype.slice.call(arguments);
    return '/'+paths.map(function(e){return e.replace(/^\/|\/$/g,'');}).filter(function(e){return e;}).join('/');
}

//from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**  Get property values from an object.
 * Can list multiple properties, the first found (or the default return) will be returned
 * @param {object} RED - RED
 * @param {object} myObj - the parent object to search for the props
 * @param {string|array} props - one or a list of property names to retrieve.
 *                               Can be nested, e.g. 'prop1.prop1a'
 *                               Stops searching when the first property is found
 * @param {any} defaultAnswer - if the prop can't be found, this is returned
 * JK @since 2017-08-17 Added
 * @todo Change instances of "in" and "hasOwnProperty" to use this function
 */
function getProps(RED,myObj,props,defaultAnswer = []) {
    if ( (typeof props) === 'string' ) {
        props = [props]
    }
    if ( ! Array.isArray(props) ) {
        return undefined
    }
    let ans
    for (var i = 0; i < props.length; i++) {
        try { // errors if an intermediate property doesn't exist
            ans = RED.util.getMessageProperty(myObj, props[i])
            if ( typeof ans !== 'undefined' ) {
                break
            }
        } catch(e) {
            // do nothing
        }
    }
    return ans || defaultAnswer
}

// EOF
