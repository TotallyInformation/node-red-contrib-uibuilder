/* eslint-disable max-params */
/** Manage Socket.IO on behalf of uibuilder
 * Singleton. only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
 * 
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
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 */

const socketio      = require('socket.io')
const tilib         = require('./tilib')   // General purpose library (by Totally Information)
const uiblib        = require('./uiblib')  // Utility library for uibuilder
const path          = require('path')

class UibSockets {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    _isConfigured

    /** Called when class is instantiated */
    constructor() {
        // setup() has not yet been run
        this._isConfigured = false

        //#region ---- References to core Node-RED & uibuilder objects ---- //
        /** @type {runtimeRED} */
        this.RED = undefined
        /** @type {Object} Reference link to uibuilder.js global configuration object */
        this.uib = undefined
        /** Reference to uibuilder's global log functions */
        this.log = undefined
        /** Reference to ExpressJS server instance being used by uibuilder
         * Used to enable the Socket.IO client code to be served to the front-end
         */
        this.server = undefined
        //#endregion ---- References to core Node-RED & uibuilder objects ---- //
        
        //#region ---- Common variables ---- //

        /** URI path for accessing the socket.io client from FE code. Based on the uib node instance URL.
         * @constant {string} uib_socketPath */
        this.uib_socketPath = undefined

        /** An instance of Socket.IO Server */
        this.io = undefined

        /** Collection of Socket.IO namespaces
         * Each namespace correstponds to a uibuilder node instance and must have a unique namespace name that matches the unique URL parameter for the node.
         * The namespace is stored in the this.ioNamespaces object against a property name matching the URL so that it can be referenced later.
         * Because this is a Singleton object, any reference to this module can access all of the namespaces (by url).
         * The namespace has some uib extensions that track the originating node id (searchable in Node-RED), the number of connected clients
         *   and the number of messages recieved.
         * @type {Object.<string, socketio.Namespace>}}
         */
        this.ioNamespaces = {}

        //#endregion ---- ---- //

    } // --- End of constructor() --- //

    /** Assign uibuilder and Node-RED core vars to Class static vars.
     *  This makes them available wherever this MODULE is require'd.
     *  Because JS passess objects by REFERENCE, updates to the original
     *    variables means that these are updated as well.
     * @param {runtimeRED} RED reference to Core Node-RED runtime object
     * @param {Object} uib reference to uibuilder 'global' configuration object
     * @param {Object} log reference to uibuilder log object
     * @param {Object} server reference to ExpressJS server being used by uibuilder
     */
    setup( RED, uib, log, server ) {
        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            log.warn('[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
            return
        }

        if ( ! RED || ! uib || ! log || ! server ) {
            throw new Error('[uibuilder:socket.js] Called without required parameters')
        }

        this.RED = RED
        this.uib = uib
        this.log = log
        this.server = server

        // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
        this._socketIoSetup()

        this._isConfigured = true

    } // --- End of setup() --- //

    /**  Holder for Socket.IO - we want this to survive redeployments of each node instance
     *   so that existing clients can be reconnected.
     * Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
     * modules that might also use it (path). This is only needed ONCE for ALL uib.instances of this node.
     * Must only be run once and so is made an ECMA2018 private class method
     * @private
     */
    _socketIoSetup() {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log
        const server = this.server
        const uib_socketPath = this.uib_socketPath = tilib.urlJoin(uib.nodeRoot, uib.moduleName, 'vendor', 'socket.io')

        log.trace(`[uibuilder:socket:socketIoSetup] Socket.IO initialisation - Socket Path=${uib_socketPath}` )
        let ioOptions = {
            'path': uib_socketPath,
            // Socket.Io 3+ CORS is disabled by default, also options have changed.
            // for CORS need to handle preflight request explicitly 'cause there's an
            // Allow-Headers:X-ClientId in there.  see https://socket.io/docs/v2/handling-cors/
            // handlePreflightRequest: (req, res) => {
            //     res.writeHead(204, {
            //         'Access-Control-Allow-Origin': req.headers['origin'], // eslint-disable-line dot-notation
            //         'Access-Control-Allow-Methods': 'GET,POST',
            //         'Access-Control-Allow-Headers': 'X-ClientId',
            //         'Access-Control-Allow-Credentials': true,
            //     })
            //     res.end()
            // },
        }

        // @ts-ignore ts(2349)
        const io = this.io = socketio(server, ioOptions) // listen === attach

        // Socket.IO v3+ no longer needed (default) and io.set no longer allowed
        //io.set('transports', ['polling', 'websocket'])

        /** Check for <uibRoot>/.config/sioMiddleware.js, use it if present. Copy template if not exists @since v2.0.0-dev3 */
        let sioMwPath = path.join(uib.configFolder, 'sioMiddleware.js')
        try {
            const sioMiddleware = require(sioMwPath)
            if ( typeof sioMiddleware === 'function' ) {
                // TODO as of socket.io v3, this won't trigger, move to namespace
                io.use(require(sioMwPath))
            }    
        } catch (e) {
            log.trace(`[uibuilder:socket:socketIoSetup] Socket.IO Middleware failed to load. Reason: ${e.message}`)
        }

    } // --- End of socketIoSetup() --- //

    /** Allow the isConfigured flag to be read (not written) externally */
    get isConfigured() {
        return this._isConfigured
    }

    /** Output a control msg to the front-end
     * Sends to all connected clients & outputs a msg to port 2 if required
     * @param {Object} msg The message to output
     * @param {Object} node The node object
     * @param {string=} socketId Optional. If included, only send to specific client id
     * @param {boolean=} output Optional. If included, also output to port #2 of the node @since 2020-01-03
     */
    sendControl( msg, node, socketId, output) {
        /** @type {Object} Reference to the core uibuilder config object */
        const uib = this.uib

        const ioNs = this.ioNamespaces[node.url]

        if (output === undefined || output === null) output = true

        msg.from = 'server'

        if (socketId) msg._socketId = socketId

        // Send to specific client if required
        if (msg._socketId) ioNs.to(msg._socketId).emit(uib.ioChannels.control, msg)
        else ioNs.emit(uib.ioChannels.control, msg)

        if ( (! Object.prototype.hasOwnProperty.call(msg, 'topic')) && (node.topic !== '') ) msg.topic = node.topic

        // copy msg to output port #2 if required
        if ( output === true ) node.send([null, msg])
    } // ---- End of getProps ---- //

    /** Output a normal msg to the front-end 
     * @param {Object} msg The message to output
     * @param {Object} url The uibuilder instance url - will be unique. Used to lookup the correct Socket.IO namespace for sending.
     * @param {string=} socketId Optional. If included, only send to specific client id (mostly expecting this to be on msg._socketID so not often required)
     */
    send(msg, url, socketId) { // eslint-disable-line class-methods-use-this
        const uib = this.uib
        const ioNs = this.ioNamespaces[url]

        if (socketId) msg._socketId = socketId

        // TODO: This should have some safety validation on it!
        if (msg._socketId) {
            //! TODO If security is active ...
            //  ...If socketId not validated as having a current session, don't send
            this.log.trace(`[uibuilder:socket:send:${url}] msg sent on to client ${msg._socketId}. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.to(msg._socketId).emit(uib.ioChannels.server, msg)
        } else {
            //? - is there any way to prevent sending to clients not logged in?
            this.log.trace(`[uibuilder:socket:send:${url}] msg sent on to ALL clients. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.emit(uib.ioChannels.server, msg)
        }
    }
    
    /** Add a new Socket.IO NAMESPACE
     * Each namespace correstponds to a uibuilder node instance and must have a unique namespace name that matches the unique URL parameter for the node.
     * The namespace is stored in the this.ioNamespaces object against a property name matching the URL so that it can be referenced later.
     * Because this is a Singleton object, any reference to this module can access all of the namespaces (by url).
     * The namespace has some uib extensions that track the originating node id (searchable in Node-RED), the number of connected clients
     *   and the number of messages recieved.
     * @param {uibNode} node Reference to the uibuilder node instance
     * @return {socketio.Namespace} Return a reference to the namespace for convenience in core code
     */
    addNS(node) {
        const log = this.log
        const uib = this.uib

        const ioNs = this.ioNamespaces[node.url] = this.io.of(node.url)
        const url = ioNs.url = node.url
        ioNs.nodeId = node.id // allows us to track back to the actual node in Node-RED
        ioNs.ioClientsCount = 0
        ioNs.rcvMsgCount = 0

        const that = this

        ioNs.on('connection', function(socket) {
            ioNs.ioClientsCount++
            node.ioClientsCount = ioNs.ioClientsCount

            log.trace(`[uibuilder:socket:addNS:${url}] Socket connected for node ${node.id} clientCount: ${ioNs.ioClientsCount}, Socket ID: ${socket.id}`)

            // Try to load the sioUse middleware function
            try {
                const sioUseMw = require( path.join(uib.configFolder, uib.sioUseMwName) )
                if ( typeof sioUseMw === 'function' ) socket.use(sioUseMw)
            } catch(e) {
                log.trace(`[uibuilder:socket:addNS:${url}] Socket.use Failed to load Use middleware. Reason: ${e.message}`)
            }

            uiblib.setNodeStatus( { fill: 'green', shape: 'dot', text: 'connected ' + ioNs.ioClientsCount }, node )

            // Let the clients (and output #2) know we are connecting
            that.sendControl({
                'uibuilderCtrl': 'client connect',
                'cacheControl': 'REPLAY',          // @since 2017-11-05 v0.4.9 @see WIKI for details
                // @since 2018-10-07 v1.0.9 - send server timestamp so that client can work out
                // time difference (UTC->Local) without needing clever libraries.
                'serverTimestamp': (new Date()),
                topic: node.topic || undefined,
            }, node, socket.id, true)
            //ioNs.emit( uib.ioChannels.control, { 'uibuilderCtrl': 'server connected', 'debug': node.debugFE } )
            
            // Listen for msgs from clients only on specific input channels:
            socket.on(uib.ioChannels.client, function(msg) {
                node.rcvMsgCount++
                log.trace(`[uibuilder:socket:${url}] Data received from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'topic': node.topic, 'payload': msg}
                }

                // If the sender hasn't added msg._socketId, add the Socket.id now
                if ( ! Object.prototype.hasOwnProperty.call(msg, '_socketId') ) msg._socketId = socket.id

                // If security is active...
                if (node.useSecurity === true) {
                    /** Check for valid auth and session 
                     * @type MsgAuth */
                    msg._auth = uiblib.authCheck(msg, ioNs, node, socket, log, uib)
                }

                // Send out the message for downstream flows
                // TODO: This should probably have safety validations!
                node.send(msg)
            }) // --- End of on-connection::on-incoming-client-msg() --- //
            socket.on(uib.ioChannels.control, function(msg) {
                node.rcvMsgCount++
                log.trace(`[uibuilder:socket:${url}] Control Msg from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'uibuilderCtrl': msg }
                }

                // If the sender hasn't added Socket.id, add it now
                if ( ! Object.prototype.hasOwnProperty.call(msg, '_socketId') ) msg._socketId = socket.id

                // @since 2017-11-05 v0.4.9 If the sender hasn't added msg.from, add it now
                if ( ! Object.prototype.hasOwnProperty.call(msg, 'from') ) msg.from = 'client'

                /** If a logon/logoff msg, we need to process it directly (don't send on the msg in this case) */
                if ( msg.uibuilderCtrl === 'logon') {
                    uiblib.logon(msg, ioNs, node, socket, log, uib)

                } else if ( msg.uibuilderCtrl === 'logoff') {
                    uiblib.logoff(msg, ioNs, node, socket, log, uib)

                } else {
                    // If security is active...
                    if (node.useSecurity === true) {
                        /** Check for valid auth and session 
                         * @type MsgAuth */
                        msg._auth = uiblib.authCheck(msg, ioNs, node, socket, log, uib)
                    }

                    // Send out the message on port #2 for downstream flows
                    if ( ! msg.topic ) msg.topic = node.topic
                    node.send([null,msg])
                }

            }) // --- End of on-connection::on-incoming-control-msg() --- //

            socket.on('disconnect', function(reason) {
                ioNs.ioClientsCount--
                node.ioClientsCount = ioNs.ioClientsCount
                log.trace(
                    `[uibuilder:socket:${url}] Socket disconnected, clientCount: ${ioNs.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}`
                )
                if ( ioNs.ioClientsCount <= 0) uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'connected ' + ioNs.ioClientsCount }, node )
                else uiblib.setNodeStatus( { fill: 'green', shape: 'ring', text: 'connected ' + ioNs.ioClientsCount }, node )
                // Let the control output port know a client has disconnected
                that.sendControl({
                    'uibuilderCtrl': 'client disconnect',
                    'reason': reason,
                    topic: node.topic || undefined,
                }, node, socket.id, true)
                //node.send([null, {'uibuilderCtrl': 'client disconnect', '_socketId': socket.id, 'topic': node.topic}])
            }) // --- End of on-connection::on-disconnect() --- //

            socket.on('error', function(err) {
                log.error(`[uibuilder:${url}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)
                // Let the control output port know there has been an error
                that.sendControl({
                    'uibuilderCtrl': 'socket error',
                    'error': err.message,
                    topic: node.topic || undefined,
                }, node, socket.id, true)
            }) // --- End of on-connection::on-error() --- //

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
                // ping is received every 30 sec
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
            
        }) // --- End of addNS() --- //

        return ioNs
    } // --- End of addNS() --- //

    /** Remove the current clients and namespace for this node.
     *  Called from uiblib.processClose.
     */
    removeNS(node) {

        const ioNs = this.ioNamespaces[node.url]

        // Disconnect all connected sockets for this Namespace (Socket.io v4+)
        ioNs.disconnectSockets()

        ioNs.removeAllListeners() // Remove all Listeners for the event emitter
        delete this.io.nsps[node.url] // Remove from the server namespaces

    } // --- End of removeNS() --- //

} // ==== End of UibSockets Class Definition ==== //

/** Singleton model. Only 1 instance of UibSockets should ever exist.
 * Use as: `const sockets = require('./socket.js')`
 * Wrap in try/catch to force out better error logging if there is a problem
 */
try {
    module.exports = new UibSockets()
} catch (e) {
    console.trace('[uibuilder:socket.js] new singleton instance failed', e)
} 

// EOF
 