/* eslint-disable class-methods-use-this */
/* eslint-disable sonarjs/no-duplicate-string */
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
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('Express')} Express
 */

const path     = require('path')
const socketio = require('socket.io')
const tilib    = require('./tilib')    // General purpose library (by Totally Information)
const uiblib   = require('./uiblib')   // Utility library for uibuilder
const security = require('./security') // uibuilder security module
const tiEventManager = require('@totallyinformation/ti-common-event-handler')

class UibSockets {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    //_isConfigured = false

    /** Called when class is instantiated */
    constructor() {
        // setup() has not yet been run
        this._isConfigured = false

        //#region ---- References to core Node-RED & uibuilder objects ---- //
        /** @type {runtimeRED} */
        this.RED = undefined
        /** @type {object} Reference link to uibuilder.js global configuration object */
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
         * @type {!Object.<string, socketio.Namespace>}
         */
        this.ioNamespaces = {}

        //#endregion ---- ---- //

    } // --- End of constructor() --- //

    /** Assign uibuilder and Node-RED core vars to Class static vars.
     *  This makes them available wherever this MODULE is require'd.
     *  Because JS passess objects by REFERENCE, updates to the original
     *    variables means that these are updated as well.
     * @param {uibConfig} uib reference to uibuilder 'global' configuration object
     * @param {Express} server reference to ExpressJS server being used by uibuilder
     */
    setup( uib, server ) {

        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            uib.RED.log.warn('[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
            return
        }

        if ( ! uib || ! server ) {
            throw new Error('[uibuilder:socket.js:setup] Called without required parameters')
        }

        /** @type {runtimeRED} reference to Core Node-RED runtime object */
        this.RED = uib.RED

        this.uib = uib
        this.log = uib.RED.log
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

    /** Allow the isConfigured flag to be read (not written) externally 
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    //? Consider adding isConfigered checks on each method?
    
    /** Output a msg to the front-end.
     * @param {object} msg The message to output, include msg._socketId to send to a single client
     * @param {string} url THe uibuilder id 
     * @param {string} channel Which channel to send to (see uib.ioChannels)
     */
    sendToFe( msg, url, channel ) {
        const uib = this.uib
        const log = this.log

        const ioNs = this.ioNamespaces[url]

        let socketId = msg._socketId || undefined

        if ( channel === uib.ioChannels.control ) msg.from = 'server'

        //console.log('> > > > ', msg)

        // pass the complete msg object to the uibuilder client
        // TODO: This should have some safety validation on it! Also need to add security processing
        if (socketId !== undefined) { // Send to specific client
            // TODO ...If socketId not validated as having a current session, don't send
            log.trace(`[uibuilder:socket.js:sendToFe:${url}] msg sent on to client ${socketId}. Channel: ${channel}. ${JSON.stringify(msg)}`)
            ioNs.to(socketId).emit(channel, msg)
        } else { // Broadcast
            //? - is there any way to prevent sending to clients not logged in?
            log.trace(`[uibuilder:socket.js:sendToFe:${url}] msg sent on to ALL clients. Channel: ${channel}. ${JSON.stringify(msg)}`)
            //console.log('> > > > ', channel, ioNs.name, msg)

            ioNs.emit(channel, msg)
        }

    } // ---- End of sendToFe ---- //

    /** Output a normal msg to the front-end. WARNING: Cannot use uibuilder security on this because! Currently only used to send a reload msg to FE.
     * To add security, would need reference to node. When called from a uib api, the node isn't available. 
     * @param {object} msg The message to output
     * @param {object} url The uibuilder instance url - will be unique. Used to lookup the correct Socket.IO namespace for sending.
     * @param {string=} socketId Optional. If included, only send to specific client id (mostly expecting this to be on msg._socketID so not often required)
     */
    send(msg, url, socketId) { // eslint-disable-line class-methods-use-this
        const uib = this.uib
        const ioNs = this.ioNamespaces[url]

        if (socketId) msg._socketId = socketId

        // TODO: This should have some safety validation on it!
        if (msg._socketId) {
            //  TODO If socketId not validated as having a current session, don't send
            this.log.trace(`[uibuilder:socket:send:${url}] msg sent on to client ${msg._socketId}. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.to(msg._socketId).emit(uib.ioChannels.server, msg)
        } else {
            this.log.trace(`[uibuilder:socket:send:${url}] msg sent on to ALL clients. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.emit(uib.ioChannels.server, msg)
        }
    }
    
    /** Get client details for JWT security check
     * @param {socketio.Socket} socket Reference to client socket connection
     * @returns {object} Extracted key information
     */
    getClientDetails(socket) {
        
        // tilib.mylog('>>>>> ========================= <<<<<')
        // tilib.mylog('>>>>>   remote address:', socket.request.connection.remoteAddress) // client ip address. May be IPv4 or v6
        // tilib.mylog('>>>>> handshake secure:', socket.handshake.secure) // true if https/wss
        // // tilib.mylog('>>>>>', socket.handshake.time)
        // tilib.mylog('>>>>> handshake issued:', (new Date(socket.handshake.issued)).toISOString()) // when the client connected to the server
        // // tilib.mylog('>>>>>', socket.handshake.url)
        // tilib.mylog('>>>>>       x-clientid:', socket.request.headers['x-clientid']) // = 'uibuilderfe'
        // tilib.mylog('>>>>>          referer:', socket.request.headers.referer) // = uibuilder url
        // tilib.mylog('>>>>> ========================= <<<<<')

        return {
            /** Client remote IP address (v4 or v6) */
            remoteAddress: socket.request.connection.remoteAddress,
            /** True if https/wss */
            secure: socket.handshake.secure,
            /** When the client connected to the server */
            connectedTimestamp: (new Date(socket.handshake.issued)).toISOString(),
            /** 'x-clientid' from headers. uibuilderfe sets this to 'uibuilderfe' */
            clientId: socket.request.headers['x-clientid'], 
            /** THe referring webpage, should be the full URL of the uibuilder page */
            referer: socket.request.headers.referer,
            //url: socket.handshake.url
        }
    }

    /** Get a uib node instance namespace
     * @param {string} url The uibuilder node instance's url (identifier)
     * @returns {socketio.Namespace} Return a reference to the namespace of the specified uib instance for convenience in core code
     */
    getNs(url) {
        return this.ioNamespaces[url]
    }

    /** Send a msg either directly out of the node instance OR via return event name
     * @param {object} msg Message object received from a client
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    sendIt(msg, node) {
        if ( msg._uib && msg._uib.originator ) {
            //const eventName = `node-red-contrib-uibuilder/return/${msg._uib.originator}`
            tiEventManager.emit(`node-red-contrib-uibuilder/return/${msg._uib.originator}`, msg)
        } else {
            node.send(msg)
        }
    }

    /** Socket listener fn for msgs from clients
     * @param {object} msg Message object received from a client
     * @param {socketio.Socket} socket Reference to the socket for this node
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    listenFromClient(msg, socket, node) {
        const log = this.log

        node.rcvMsgCount++
        log.trace(`[uibuilder:socket:${node.url}] Data received from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

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

            /** Check for valid auth and session - JWT is removed if not authorised 
             * @type {MsgAuth} */
            msg._auth = security.authCheck2( msg, node, this.getClientDetails(socket) )
            //msg._auth = security.authCheck(msg, node, socket.id)
            //msg._auth = uiblib.authCheck(msg, ioNs, node, socket.id, log, uib)

            //console.log('[UIBUILDER:addNs:on-client-msg] _auth: ', msg._auth)

            // Only send the msg onward if the user is validated or if unauth traffic permitted
            if ( node.allowUnauth === true || msg._auth.jwt !== undefined ) {
                this.sendIt(msg, node)
                tilib.mylog(`[uibuilder:socket.js:addNs:connection:on:client] Msg received from ${node.url} client but they are not authorised. But unauth traffic allowed.`)
            } else 
                log.info(`[uibuilder:socket.js:addNs:connection:on:client] Msg received from ${node.url} client but they are not authorised. Ignoring.`)

        } else {

            // Send out the message for downstream flows
            // TODO: This should probably have safety validations!
            this.sendIt(msg, node)

        }
    } // ---- End of listenFromClient ---- //

    /** Add a new Socket.IO NAMESPACE
     * Each namespace correstponds to a uibuilder node instance and must have a unique namespace name that matches the unique URL parameter for the node.
     * The namespace is stored in the this.ioNamespaces object against a property name matching the URL so that it can be referenced later.
     * Because this is a Singleton object, any reference to this module can access all of the namespaces (by url).
     * The namespace has some uib extensions that track the originating node id (searchable in Node-RED), the number of connected clients
     *   and the number of messages received.
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    addNS(node) {
        const log = this.log
        const uib = this.uib

        const ioNs = this.ioNamespaces[node.url] = this.io.of(node.url)
        const url = ioNs.url = node.url
        ioNs.nodeId = node.id // allows us to track back to the actual node in Node-RED
        ioNs.useSecurity = node.useSecurity // Is security on for this node instance?
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

            node.statusDisplay.text = 'connected ' + ioNs.ioClientsCount
            uiblib.setNodeStatus( node )

            const msg = {
                'uibuilderCtrl': 'client connect',
                //'cacheControl': 'REPLAY',          // @since v4.2.0 REMOVED
                // @since 2018-10-07 v1.0.9 - send server timestamp so that client can work out
                // time difference (UTC->Local) without needing clever libraries.
                'serverTimestamp': (new Date()),
                'topic': node.topic || undefined,
                'security': node.useSecurity, // let the client know whether to use security or not
                '_socketId': socket.id,
            }

            // Let the clients (and output #2) know we are connecting
            that.sendToFe(msg, node.url, uib.ioChannels.control)
            //ioNs.emit( uib.ioChannels.control, { 'uibuilderCtrl': 'server connected', 'debug': node.debugFE } )

            // Copy to port#2 for reference
            node.send(null,msg)
            
            // Listen for msgs from clients only on specific input channels:
            
            socket.on(uib.ioChannels.client, function(msg) {
                that.listenFromClient(msg, socket, node )
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

                if ( ! msg.topic ) msg.topic = node.topic

                /** If an auth/logon/logoff msg, we need to process it directly (don't send on the msg in this case) */
                if ( msg.uibuilderCtrl === 'logon') {

                    //uiblib.logon(msg, ioNs, node, socket, log, uib)
                    security.logon(msg, ioNs, node, socket)

                } else if ( msg.uibuilderCtrl === 'logoff') {

                    //uiblib.logoff(msg, ioNs, node, socket, log, uib)
                    security.logoff(msg, ioNs, node, socket.id)

                } else if ( msg.uibuilderCtrl === 'auth') {
                    // 'auth' is sent by client after server sends 'client connect' or 'request for logon' if security is on
                    /**
                     * == Server receives 'auth' control message. Checks auth
                     *    1. If auth is dummy
                     *       1. => Send 'request for logon' to client
                     *          1. ++ client must prompt user for logon
                     *          2. <= Client must send 'auth' control message to server
                     *          3. GOTO 1.0
                     *    
                     *    2. Otherwise
                     *       1. == Server validates msg._auth (*1). Only succeeds if client was already auth and send a valid _auth with JWT (due to node redeploy since nr restart invalidates all JWT's).
                     *          1. => Server returns either an 'auth succeded' or 'auth failed' message to client.
                     *          2. If auth failed
                     *             1. => Send 'request for logon' to client
                     *             2. ++ client must prompt user for logon
                     *             3. <= Client must send 'auth' control message to server
                     *             4. GOTO 1.0
                     */

                    msg._auth = security.authCheck2(msg, node, that.getClientDetails(socket))

                    //! temp 
                    node.send([null,msg])

                    // Report success & send token to client & to port #2
                    //if ( msg._auth.userValidated === true ) {
                    const ctrlMsg = {
                        'uibuilderCtrl': msg._auth.userValidated ? 'authorised' : 'not authorised',
                        'topic': msg.topic || node.topic || undefined,
                        '_auth': msg._auth,
                        '_socketId': socket.id,
                    }
                    that.sendToFe(ctrlMsg, node.url, uib.ioChannels.control)
                    // Copy to port#2 for reference
                    node.send(null,msg)
                    //}

                } else if (node.useSecurity === true) {
                    // If security is active...

                    /** Check for valid auth and session 
                     * @type {MsgAuth} */
                    msg._auth = security.authCheck2( msg, node, that.getClientDetails(socket) )
                    //msg._auth = security.authCheck(msg, node, socket.id)
                    //msg._auth = uiblib.authCheck(msg, ioNs, node, socket.id, log, uib)

                    // Only send the msg onward if the user is validated or if unauth traffic permitted or if the msg is the initial ready for content handshake.
                    if ( node.allowUnauth === true || msg._auth.jwt !== undefined || msg.uibuilderCtrl === 'ready for content' ) {
                        node.send([null,msg])
                        tilib.mylog(`[uibuilder:socket.js:addNs:connection:on:control] '${msg.uibuilderCtrl}' msg received from ${node.url} client but they are not authorised. But unauth traffic allowed.`)
                    } else 
                        log.info(`[uibuilder:socket.js:addNs:connection:on:control] '${msg.uibuilderCtrl}' msg received from ${node.url} client but they are not authorised. Ignoring.`)

                } else {

                    // Send out the message on port #2 for downstream flows
                    node.send([null,msg])

                }

            }) // --- End of on-connection::on-incoming-control-msg() --- //

            socket.on('disconnect', function(reason) {

                ioNs.ioClientsCount--
                node.ioClientsCount = ioNs.ioClientsCount
                log.trace(
                    `[uibuilder:socket:${url}] Socket disconnected, clientCount: ${ioNs.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}`
                )
                node.statusDisplay.text = 'connected ' + ioNs.ioClientsCount
                uiblib.setNodeStatus( node )

                // Let the control output port know a client has disconnected
                const ctrlMsg = {
                    'uibuilderCtrl': 'client disconnect',
                    'reason': reason,
                    'topic': node.topic || undefined,
                    '_socketId': socket.id,
                }
                that.sendToFe(ctrlMsg, node.url, uib.ioChannels.control)
                // Copy to port#2 for reference
                node.send(null,msg)
                
            }) // --- End of on-connection::on-disconnect() --- //

            socket.on('error', function(err) {

                log.error(`[uibuilder:${url}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)
                
                // Let the control output port know there has been an error
                const ctrlMsg = {
                    'uibuilderCtrl': 'socket error',
                    'error': err.message,
                    'topic': node.topic || undefined,
                    '_socketId': socket.id,
                }
                that.sendToFe(ctrlMsg, node.url, uib.ioChannels.control)
                // Copy to port#2 for reference
                node.send(null,msg)
                    
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

    } // --- End of addNS() --- //

    /** Remove the current clients and namespace for this node.
     *  Called from uiblib.processClose.
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    removeNS(node) {

        const ioNs = this.ioNamespaces[node.url]

        // Disconnect all connected sockets for this Namespace (Socket.io v4+)
        ioNs.disconnectSockets(true)

        ioNs.removeAllListeners() // Remove all Listeners for the event emitter

        // No longer works from socket.io v3+ //delete this.io.nsps[`/${node.url}`] // Remove from the server namespaces

    } // --- End of removeNS() --- //

} // ==== End of UibSockets Class Definition ==== //

/** Singleton model. Only 1 instance of UibSockets should ever exist.
 * Use as: `const sockets = require('./libs/socket.js')`
 * Wrap in try/catch to force out better error logging if there is a problem
 * Downside of this approach is that you cannot directly pass in parameters. Use the startup(...) method instead.
 */

try { // Wrap in a try in case any errors creep into the class

    let uibsockets = new UibSockets()
    module.exports = uibsockets

    // Make this globally available so that it can be shared with other common nodes from TotallyInformation
    if ( ! global.totallyInformationShared ) global.totallyInformationShared = {}
    global.totallyInformationShared.uibsockets = uibsockets

} catch (e) {
    console.error(`[uibuilder:socket.js] Unable to create class instance. Error: ${e.message}`)
}


// EOF
