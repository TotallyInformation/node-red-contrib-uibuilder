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

'use strict'

// Module name must match this nodes html file
const moduleName = 'uibuilder'
const nodeVersion = require('../package.json').version

const serveStatic = require('serve-static'),
      socketio = require('socket.io'),
      path = require('path'),
      fs = require('fs'),
      events = require('events')

// These are loaded to the /<uibuilder>/vendor URL path
const vendorPackages = [
    'normalize.css',
    'jquery',
]

// Holder for Socket.IO
var io

// Will we use "compiled" version of module front-end code?
var useCompiledCode = false
fs.stat(path.join(__dirname, 'dist', 'index.html'), function(err, stat) {
    if (!err) useCompiledCode = true
})

module.exports = function(RED) {
    'use strict';

    function nodeGo(config) {
        // Create the node
        RED.nodes.createNode(this, config)

        // copy 'this' object in case we need it in context of callbacks of other functions.
        const node = this

        // Create local copies of the node configuration (as defined in the .html file)
        node.name   = config.name || ''
        node.topic  = config.topic || ''
        // TODO: This needs to be limited to a single path element
        node.url    = config.url  || 'uibuilder'
        node.fwdInMessages = config.fwdInMessages || true
        node.customFoldersReqd = config.customFoldersReqd || false
        node.userVendorPackages = config.userVendorPackages || RED.settings.uibuilder.userVendorPackages || []
        node.ioClientsCount = 0 // how many Socket clients connected to this intance?
        node.rcvMsgCount = 0 // how many msg's recieved since last reset or redeploy?
        // The channel names for Socket.IO
        node.ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}
        node.ioNamespace = '/' + trimSlashes(node.url)
        console.log(node.ioNamespace)
        // Name of the fs path used to hold custom files & folders for all instances of uibuilder
        node.customAppFolder = path.join(RED.settings.userDir, 'uibuilder')
        // Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
        //   Files in this folder are also served to URL but take preference
        //   over those in the nodes folders (which act as defaults)
        node.customFolder = path.join(node.customAppFolder, node.url)

        // Set to true if you want additional debug output to the console
        const debug = RED.settings.uibuilder.debug || true

        // We need an http server to serve the page
        const app = RED.httpNode || RED.httpAdmin

        // Use httNodeMiddleware function which is defined in settings.js
        // as for the http in/out nodes
        var httpMiddleware = function(req,res,next) { next() }
        if (RED.settings.httpNodeMiddleware) {
            if ( typeof RED.settings.httpNodeMiddleware === 'function' ) {
                httpMiddleware = RED.settings.httpNodeMiddleware
            }
        }
        
        // This ExpressJS middleware runs when the vueui page loads - we'll use it at some point
        // maybe to pass a "room" name in custom header for IO to use
        // so that we can have multiple pages served
        // @see https://expressjs.com/en/guide/using-middleware.html
        function localMiddleware (req, res, next) {
            // Tell the client what namespace to use, trim the leading slash because the cookie will
            // turn into a %2F
            res.setHeader('x-uibuilder-namespace', node.ioNamespace)
            res.cookie('uibuilder-namespace', trimSlashes(node.ioNamespace), {path: node.url, sameSite: true})
            next()
        }

        // ---- Add custom folder structure if requested ---- //
        if ( node.customFoldersReqd ) {
            // NOTE: May be better as async calls?
            // Make sure the global custom folder exists first
            try {
                fs.mkdirSync(node.customAppFolder)
                fs.accessSync( node.customAppFolder, fs.constants.W_OK )
            } catch (e) {
                if ( e.code !== 'EEXIST' ) {
                    debug && RED.log.error('UIBUILDER - uibuilder custom folder ERROR, path: ' + path.join(RED.settings.userDir, node.customAppFolder) + ', error: ' + e.message)
                }
            }
            // Then make sure the folder for this node instance exists
            try {
                fs.mkdirSync(node.customFolder)
                fs.accessSync(node.customFolder, fs.constants.W_OK)
            } catch (e) {
                if ( e.code !== 'EEXIST' ) {
                    debug && RED.log.error('UIBUILDER - uibuilder local custom folder ERROR: ' + e.message)
                }
            }
            // Then make sure the DIST & SRC folders for this node instance exist
            try {
                fs.mkdirSync( path.join(node.customFolder, 'dist') )
                fs.mkdirSync( path.join(node.customFolder, 'src') )
                fs.accessSync(node.customFolder, fs.constants.W_OK)
            } catch (e) {
                if ( e.code !== 'EEXIST' ) {
                    debug && RED.log.error('UIBUILDER - uibuilder local custom dist or src folder ERROR: ' + e.message)
                }
            }
            // Add static path for local custom files
            fs.stat(path.join(node.customFolder, 'dist', 'index.html'), function(err, stat) {
                if (!err) {
                    // If the ./dist/index.html exists use the dist folder... 
                    app.use( urlJoin(node.url), serveStatic( path.join(node.customFolder, 'dist') ) );
                } else {
                    // ... otherwise, use dev resources at ./src/
                    debug && RED.log.audit({ 'UIbuilder': node.url+' Using local development folder' });
                    app.use( urlJoin(node.url), serveStatic( path.join(node.customFolder, 'src') ) );
                    // Include vendor resource source paths if needed
                    node.userVendorPackages.forEach(function (packageName) {
                        //debug && RED.log.audit({ 'UIbuilder': 'Adding vendor paths', 'url':  join(node.url, 'vendor', packageName), 'path': path.join(__dirname, 'node_modules', packageName)});
                        app.use( urlJoin(node.url, 'vendor', packageName), serveStatic(path.join(__dirname, '..', '..', packageName)) );
                    })
                }
            })
        }
        // -------------------------------------------------- //
        
        // Create a new, additional static http path to enable
        // loading of central static resources for uibuilder
        if (useCompiledCode) {
            debug && RED.log.audit({ 'UIbuilder': node.url+' Using production build folder' })
            // If the ./dist/index.html exists use the dist folder... 
            app.use( urlJoin(node.url), httpMiddleware, localMiddleware, serveStatic( path.join( __dirname, 'dist' ) ) )
        } else {
            // ... otherwise, use dev resources at ./src/
            debug && RED.log.audit({ 'UIbuilder': node.url+' Using development folder' })
            app.use( urlJoin(node.url), httpMiddleware, localMiddleware, serveStatic( path.join( __dirname, 'src' ) ) )
            // Include vendor resource source paths if needed
            vendorPackages.forEach(function (packageName) {
                //debug && RED.log.audit({ 'UIbuilder': 'Adding vendor paths', 'url':  urlJoin(node.url, 'vendor', packageName), 'path': path.join(__dirname, '..', 'node_modules', packageName)});
                app.use( urlJoin(node.url, 'vendor', packageName), serveStatic(path.join(__dirname, '..', 'node_modules', packageName)) )
            })
        }

        const fullPath = urlJoin( RED.settings.httpNodeRoot, node.url );
        if ( node.customFoldersReqd ) {
            RED.log.info('UI Builder - Version ' + nodeVersion + ' started at ' + fullPath)
            RED.log.info('UI Builder - Local file overrides at ' + node.customFolder)
        } else {
            RED.log.info('UI Builder - Version ' + nodeVersion + ' started at ' + fullPath)
            RED.log.info('UI Builder - Local file overrides not requested')
        }

        if (  (typeof io) !== 'object' ) {
            // Start Socket.IO with a namespace to match the url path, ensure using Socket.IO version from this uibuilder module (using path)
            io = socketio.listen(RED.server, {'path': urlJoin(node.url, 'socket.io')}) // listen === attach
            io.set('transports', ['polling', 'websocket'])
            node.ioClientsCount = 0
            setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Socket Created' }, node )
            // Check that all incoming SocketIO data has the IO cookie
            // TODO: Needs a bit more work to add some real security - is it even being called? should it be on ioNs?
            io.use(function(socket, next){
                if (socket.request.headers.cookie) {
                    node.debug && RED.log.info('SOCKET OK')
                    setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Socket Authentication OK - ID: ' + socket.id }, node )
                    return next()
                }
                setNodeStatus( { fill: 'red', shape: 'ring', text: 'Socket Authentication Error - ID: ' + socket.id }, node )
                next(new Error('UIbuilder:NodeGo:io.use - Authentication error - ID: ' + socket.id ))
            })
        }

        var ioNs = io.of(node.ioNamespace)

        // When someone loads the page, it will try to connect over Socket.IO
        // note that the connection returns the socket instance to monitor for responses from 
        // the ui client instance
        ioNs.on('connection', function(socket) {
            node.ioClientsCount++
            RED.log.audit({ 
                'UIbuilder': node.url+' Socket connected', 'clientCount': node.ioClientsCount, 
                'ID': socket.id, 'Cookie': socket.handshake.headers.cookie
            })
            setNodeStatus( { fill: 'green', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )
            //console.log('--socket.request.connection.remoteAddress--')
            //console.dir(socket.request.connection.remoteAddress)
            //console.log('--socket.handshake.address--')
            //console.dir(socket.handshake.address)
            //console.dir(io.sockets.connected)

            // Let the clients know we are connecting
            ioNs.emit( node.ioChannels.control, { 'type': 'connected' } )

            // if the client sends a specific msg channel...
            socket.on(node.ioChannels.client, function(msg) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' Data recieved from client', 'ID': socket.id, 
                    'Cookie': socket.handshake.headers.cookie, 'data': msg 
                })

                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'topic': node.topic, 'payload': msg}
                }
                // Add sending client id to msg
                msg._socketId = socket.id
                // Send out the message for downstream flows
                // TODO: This should probably have safety validations!
                node.send(msg)
            });

            socket.on('disconnect', function(reason) {
                node.ioClientsCount--
                RED.log.audit({
                    'UIbuilder': node.url+' Socket disconnected', 'clientCount': node.ioClientsCount,
                    'reason': reason, 'ID': socket.id, 'Cookie': socket.handshake.headers.cookie
                })
                setNodeStatus( { fill: 'green', shape: 'ring', text: 'connected ' + node.ioClientsCount }, node )
            })

            socket.on('error', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' ERROR recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })

            socket.on('connect', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' CONNECT recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })
            socket.on('disconnecting', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' DISCONNECTING recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })
            socket.on('newListener', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' NEWLISTENER recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })
            socket.on('removeListener', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' REMOVELISTENER recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })
            socket.on('ping', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' PING recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })
            socket.on('pong', function(data) {
                RED.log.audit({ 
                    'UIbuilder': node.url+' PONG recieved', 'ID': socket.id, 
                    'data': data 
                })                
            })

        }) // ---- End of ioNs.on connection ---- //

        // handler function for node input events (when a node instance receives a msg)
        function nodeInputHandler(msg) {
            //debug && RED.log.info('UIbuilder:nodeGo:nodeInputHandler - emit received msg - Namespace: ' + node.url) //debug

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
                }
            }

            // Keep this fn small for readability so offload
            // any further, more customised code to another fn
            msg = inputHandler(msg, node, RED, ioNs)

        } // -- end of msg recieved processing -- //
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        node.on('close', function() {
            //debug && RED.log.info('VUEUI:nodeGo:on-close') //debug

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            processClose(null, node, RED, ioNs, io, app) // swap with below if needing async
            //processClose(done, node, RED, ioNs, io, app)

        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType(moduleName, nodeGo);
}

// ========== UTILITY FUNCTIONS ================ //

// Complex, custom code when processing an incoming msg should go here
// Needs to return the msg object
function inputHandler(msg, node, RED, ioNs) {
    node.rcvMsgCount++
    //setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Recieved #' + node.rcvMsgCount}, node)

    //debug && console.dir(msg) //debug

    // pass the complete msg object to the vue ui client
    // TODO: This should probably have some safety validation on it
    ioNs.emit(node.ioChannels.server, msg)

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
    //io = null

    // We need to remove the app.use paths too. This code borrowed from the http nodes
    app._router.stack.forEach(function(route,i,routes) {
        if ( route.route && route.route.path === node.url ) {
            routes.splice(i,1)
        }
    });

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

// EOF
