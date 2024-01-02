/** Manage Socket.IO on behalf of uibuilder
 * Singleton. only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
 *
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
 */
/* eslint-disable class-methods-use-this, sonarjs/no-duplicate-string, max-params */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('express')} Express
 */

const { join }     = require('path')
const { existsSync } = require('./fs')
const socketio = require('socket.io')
const { urlJoin }    = require('./tilib')    // General purpose library (by Totally Information)
const { setNodeStatus }   = require('./uiblib')   // Utility library for uibuilder
// const security = require('./sec-lib') // uibuilder security module
// const { emit } = require('@totallyinformation/ti-common-event-handler') // NO, don't do this! If you do, the emits don't work
const tiEvent = require('@totallyinformation/ti-common-event-handler')

/** Get client real ip address - NB: Optional chaining (?.) is node.js v14 not v12
 * @param {socketio.Socket} socket Socket.IO socket object
 * @returns {string | string[] | undefined} Best estimate of the client's real IP address
 */
function getClientRealIpAddress(socket) {
    let clientRealIpAddress
    if ( 'headers' in socket.request && 'x-real-ip' in socket.request.headers) {
        // get ip from behind a nginx proxy or proxy using nginx's 'x-real-ip header
        clientRealIpAddress = socket.request.headers['x-real-ip']
    } else if ( 'headers' in socket.request && 'x-forwarded-for' in socket.request.headers) {
        // else get ip from behind a general proxy
        if (socket.request.headers['x-forwarded-for'] === undefined) throw new Error('socket.request.headers["x-forwarded-for"] is undefined')
        if (!Array.isArray(socket.request.headers['x-forwarded-for'])) socket.request.headers['x-forwarded-for'] = [socket.request.headers['x-forwarded-for']]
        clientRealIpAddress = socket.request.headers['x-forwarded-for'][0].split(',').shift()
    } else if ( 'connection' in socket.request && 'remoteAddress' in socket.request.connection ) {
        // else get ip from socket.request that returns the reference to the request that originated the underlying engine.io Client
        clientRealIpAddress = socket.request.connection.remoteAddress
    } else {
        // else get ip from socket.handshake that is a object that contains handshake details
        clientRealIpAddress = socket.handshake.address
    }

    // socket.client.conn.remoteAddress

    // Switch to this code when node.js v14 becomes the baseline version
    // const clientRealIpAddress =
    //     //get ip from behind a nginx proxy or proxy using nginx's 'x-real-ip header
    //     socket.request?.headers['x-real-ip']
    //     //get ip from behind a general proxy
    //     || socket.request?.headers['x-forwarded-for']?.split(',').shift() //if more thatn one x-fowared-for the left-most is the original client. Others after are successive proxys that passed the request adding to the IP addres list all the way back to the first proxy.
    //     //get ip from socket.request that returns the reference to the request that originated the underlying engine.io Client
    //     || socket.request?.connection?.remoteAddress
    //     // get ip from socket.handshake that is a object that contains handshake details
    //     || socket.handshake?.address

    return clientRealIpAddress
} // --- End of getClientRealIpAddress --- //

/** Get client real ip address - NB: Optional chaining (?.) is node.js v14 not v12
 * @param {socketio.Socket} socket Socket.IO socket object
 * @param {uibNode} node Reference to the uibuilder node instance
 * @returns {string | string[] | undefined} Best estimate of the client's real IP address
 */
function getClientPageName(socket, node) {
    let pageName = socket.handshake.auth.pathName.replace(`/${node.url}/`, '')
    if ( pageName.endsWith('/') ) pageName += 'index.html'
    if ( pageName === '' ) pageName = 'index.html'

    return pageName
} // --- End of getClientPageName --- //

class UibSockets {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected
     */
    // _isConfigured = false

    /** Called when class is instantiated */
    constructor() {
        // setup() has not yet been run
        this._isConfigured = false

        //#region ---- References to core Node-RED & uibuilder objects ---- //
        /** @type {runtimeRED|undefined} */
        this.RED = undefined
        /** @type {uibConfig|undefined} Reference link to uibuilder.js global configuration object */
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
         * @type {!Object<string, socketio.Namespace>}
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
        if ( !uib || !server ) throw new Error('[uibuilder:socket.js:setup] Called without required parameters or uib and/or server are undefined.')
        if (uib.RED === null) throw new Error('[uibuilder:socket.js:setup] uib.RED is null')

        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            uib.RED.log.warn('[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
            return
        }

        /** reference to Core Node-RED runtime object */
        this.RED = uib.RED

        this.uib = uib
        this.log = uib.RED.log
        this.server = server

        // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
        this._socketIoSetup()

        if (uib.configFolder === null) throw new Error('[uibuilder:socket.js:setup] uib.configFolder is null')

        // If available, set up optional outbound msg middleware
        this.outboundMsgMiddleware = function outboundMsgMiddleware( msg, url, channel ) { return null }
        // Try to load the sioMsgOut middleware function - sioMsgOut applies to all outgoing msgs
        const mwfile = join(uib.configFolder, uib.sioMsgOutMwName)
        if ( existsSync(mwfile) ) { // not interested if the file doesn't exist
            try {
                const sioMsgOut = require( mwfile )
                if ( typeof sioMsgOut === 'function' ) { // if exported, has to be a function
                    this.outboundMsgMiddleware = sioMsgOut
                    this.log.trace('[uibuilder:socket:setup] sioMsgOut Middleware loaded successfully.')
                } else {
                    this.log.warn('[uibuilder:socket:setup] sioMsgOut Middleware failed to load - check that uibRoot/.config/sioMsgOut.js has a valid exported fn.')
                }
            } catch (e) {
                this.log.warn(`[uibuilder:socket:setup] sioMsgOut middleware Failed to load. Reason: ${e.message}`)
            }
        }

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
        const RED = this.RED
        const log = this.log
        const server = this.server

        if (uib === undefined) throw new Error('uib is undefined')
        if (RED === undefined) throw new Error('RED is undefined')
        if (log === undefined) throw new Error('log is undefined')

        const uibSocketPath = this.uib_socketPath = urlJoin(uib.nodeRoot, uib.moduleName, 'vendor', 'socket.io')

        log.trace(`[uibuilder:socket:socketIoSetup] Socket.IO initialisation - Socket Path=${uibSocketPath}, CORS Origin=*` )
        // Socket.Io server options, see https://socket.io/docs/v4/server-options/
        let ioOptions = {
            'path': uibSocketPath,
            serveClient: true, // Needed for backwards compatibility
            connectionStateRecovery: {
                // the backup duration of the sessions and the packets
                maxDisconnectionDuration: 120000, // Default = 2 * 60 * 1000 = 120000,
                // whether to skip middlewares upon successful recovery
                skipMiddlewares: true, // Default = true
            },
            // https://github.com/expressjs/cors#configuration-options, https://socket.io/docs/v3/handling-cors/
            cors: {
                origin: '*',
                // allowedHeaders: ['x-clientid'],
            },
            /* // Socket.Io 3+ CORS is disabled by default, also options have changed.
            // for CORS need to handle preflight request explicitly 'cause there's an
            // Allow-Headers:X-ClientId in there.  see https://socket.io/docs/v4/handling-cors/
            handlePreflightRequest: (req, res) => {
                res.writeHead(204, {
                    'Access-Control-Allow-Origin': req.headers['origin'], // eslint-disable-line dot-notation
                    'Access-Control-Allow-Methods': 'GET,POST',
                    'Access-Control-Allow-Headers': 'X-ClientId',
                    'Access-Control-Allow-Credentials': true,
                })
                res.end()
            }, */
        }

        // Merge in overrides from settings.js if given. NB: settings.uibuilder.socketOptions will override the above defaults.
        if ( RED.settings.uibuilder && RED.settings.uibuilder.socketOptions ) {
            ioOptions = Object.assign( {}, ioOptions, RED.settings.uibuilder.socketOptions )
        }

        // @ts-ignore ts(2769)
        this.io = new socketio.Server(server, ioOptions) // listen === attach
    } // --- End of socketIoSetup() --- //

    /** Allow the isConfigured flag to be read (not written) externally
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    // ? Consider adding isConfigured checks on each method?

    /** Output a msg to the front-end.
     * @param {object} msg The message to output, include msg._socketId to send to a single client
     * @param {string} url THe uibuilder id
     * @param {string=} channel Optional. Which channel to send to (see uib.ioChannels) - defaults to client
     */
    sendToFe( msg, url, channel ) {
        const uib = this.uib
        const log = this.log

        if (uib === undefined) throw new Error('uib is undefined')
        if (log === undefined) throw new Error('log is undefined')

        if ( channel === undefined ) channel = uib.ioChannels.client

        const ioNs = this.ioNamespaces[url]

        const socketId = msg._socketId || undefined

        // Control msgs should say where they came from
        if ( channel === uib.ioChannels.control && !msg.from ) msg.from = 'server'

        // Process outbound middleware (middleware is loaded in this.setup)
        try {
            this.outboundMsgMiddleware( msg, url, channel, ioNs )
        } catch (e) {
            log.warn(`[uibuilder:socket:sendToFe] outboundMsgMiddleware middleware failed to run. Reason: ${e.message}`)
        }

        // TODO: Sending should have some safety validation on it. Is msg an object? Is channel valid?

        // pass the complete msg object to the uibuilder client
        if (socketId !== undefined) { // Send to specific client
            log.trace(`[uibuilder:socket.js:sendToFe:${url}] msg sent on to client ${socketId}. Channel: ${channel}. ${JSON.stringify(msg)}`)
            ioNs.to(socketId).emit(channel, msg)
        } else { // Broadcast
            log.trace(`[uibuilder:socket.js:sendToFe:${url}] msg sent on to ALL clients. Channel: ${channel}. ${JSON.stringify(msg)}`)
            ioNs.emit(channel, msg)
        }
    } // ---- End of sendToFe ---- //

    /** Output a normal msg to the front-end. Can override socketid
     * Currently only used for the auto-reload on edit in admin-api-v2.js
     * @param {object} msg The message to output
     * @param {object} url The uibuilder instance url - will be unique. Used to lookup the correct Socket.IO namespace for sending.
     * @param {string=} socketId Optional. If included, only send to specific client id (mostly expecting this to be on msg._socketID so not often required)
     */
    sendToFe2(msg, url, socketId) { // eslint-disable-line class-methods-use-this
        const uib = this.uib
        const ioNs = this.ioNamespaces[url]

        if (uib === undefined) throw new Error('uib is undefined')
        if (this.log === undefined) throw new Error('this.log is undefined')

        if (socketId) msg._socketId = socketId

        // TODO: This should have some safety validation on it
        if (msg._socketId) {
            this.log.trace(`[uibuilder:socket:sendToFe2:${url}] msg sent on to client ${msg._socketId}. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.to(msg._socketId).emit(uib.ioChannels.server, msg)
        } else {
            this.log.trace(`[uibuilder:socket:sendToFe2:${url}] msg sent on to ALL clients. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.emit(uib.ioChannels.server, msg)
        }
    } // ---- End of sendToFe2 ---- //

    /** Send a uibuilder control message out of port #2
     * Note: this.getClientDetails is used before calling this if client details needed
     * @param {object} msg The message to output
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    sendCtrlMsg(msg, node) {
        node.send( [null, msg])
    }

    /** Get client details for including in Node-RED messages
     * @param {socketio.Socket} socket Reference to client socket connection
     * @param {uibNode} node Reference to the uibuilder node instance
     * @returns {object} Extracted key information
     */
    getClientDetails(socket, node) {

        // Add page name meta to allow caches and other flows to send back to specific page
        // Note, could use socket.handshake.auth.pageName instead
        let pageName
        if ( socket.handshake.auth.pathName ) {
            pageName = getClientPageName(socket, node)
        }

        // @ts-ignore
        const clientTimeDifference = (new Date(socket.handshake.issued)) - (new Date(socket.handshake.auth.browserConnectTimestamp))

        // WARNING: The socket.handshake data can only ever be changed by the client when it (re)connects
        const out = {
            /** What was the originating uibuilder URL */
            'url': node.url,

            '_socketId': socket.id,
            /** Is this client reconnected after temp loss? */
            'recovered': socket.recovered,
            /** Do our best to get the actual IP addr of client despite any Proxies */
            'ip': getClientRealIpAddress(socket),
            /** THe referring webpage, should be the full URL of the uibuilder page */
            'referer': socket.request.headers.referer,

            // Let the flow know what v of uib client is in use
            'version': socket.handshake.auth.clientVersion,
            /** What is the stable client id (set by uibuilder, retained till browser restart) */
            'clientId': socket.handshake.auth.clientId,
            /** What is the client tab identifier (set by uibuilder modern client) */
            'tabId': socket.handshake.auth.tabId,
            /** What was the originating page name (for SPA's) */
            'pageName': pageName,
            /** The browser's URL parameters */
            'urlParams': socket.handshake.auth.urlParams,
            /** How many times has this client reconnected (e.g. after sleep) */
            'connections': socket.handshake.auth.connectedNum,
            /** True if https/wss */
            'tls': socket.handshake.secure,
            /** When the client connected to the server */
            'connectedTimestamp': (new Date(socket.handshake.issued)).toISOString(),
            // 'browserConnectTimestamp': socket.handshake.auth.browserConnectTimestamp,
        }

        // Only include this if The difference between the timestamps is > 1 minute - output is in milliseconds
        if (clientTimeDifference > 60000) out.clientTimeDifference = clientTimeDifference

        return out
    }

    /** Get a uib node instance namespace
     * @param {string} url The uibuilder node instance's url (identifier)
     * @returns {socketio.Namespace} Return a reference to the namespace of the specified uib instance for convenience in core code
     */
    getNs(url) {
        return this.ioNamespaces[url]
    }

    /** Send a node-red msg either directly out of the node instance OR via return event name
     * @param {object} msg Message object received from a client
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    sendIt(msg, node) {
        if ( msg._uib && msg._uib.originator && (typeof msg._uib.originator === 'string') ) {
            // const eventName = `node-red-contrib-uibuilder/return/${msg._uib.originator}`
            tiEvent.emit(`node-red-contrib-uibuilder/return/${msg._uib.originator}`, msg)
        } else {
            node.send(msg)
        }
    }

    /** Socket listener fn for msgs from clients - NOTE that the optional sioUse middleware is also applied before this
     * @param {object} msg Message object received from a client
     * @param {socketio.Socket} socket Reference to the socket for this node
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    listenFromClient(msg, socket, node) {
        const log = this.log
        if (log === undefined) throw new Error('log is undefined')

        node.rcvMsgCount++
        log.trace(`[uibuilder:socket:${node.url}] Data received from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

        // Make sure the incoming msg is a correctly formed Node-RED msg
        switch ( typeof msg ) {
            case 'string':
            case 'number':
            case 'boolean':
                msg = { 'topic': node.topic, 'payload': msg }
        }

        // If the sender hasn't added msg._socketId, add the Socket.id now
        if ( !Object.prototype.hasOwnProperty.call(msg, '_socketId') ) msg._socketId = socket.id

        // If required, add/merge the client details to the msg using msg._uib
        if (node.showMsgUib) {
            if (!msg._uib) msg._uib = this.getClientDetails(socket, node)
            else {
                msg._uib = {
                    ...msg._uib,
                    ...this.getClientDetails(socket, node)
                }
            }
        }

        // Send out the message for downstream flows
        // TODO: This should probably have safety validations!
        this.sendIt(msg, node)
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

        if (log === undefined) throw new Error('log is undefined')
        if (uib === undefined) throw new Error('uib is undefined')
        if (this.io === undefined) throw new Error('this.io is undefined')

        const ioNs = this.ioNamespaces[node.url] = this.io.of(node.url)

        // @ts-expect-error Add some additional metadata to NS
        const url = ioNs.url = node.url
        // @ts-expect-error Allows us to track back to the actual node in Node-RED
        ioNs.nodeId = node.id
        // @ts-expect-error ioNs.useSecurity = node.useSecurity // Is security on for this node instance?
        ioNs.rcvMsgCount = 0
        // @ts-expect-error Make Node-RED's log available to middleware via custom ns property
        ioNs.log = log
        // ioNs.clientLog = {}

        if (uib.configFolder === null) throw new Error('uib.configFolder is undefined')

        /** Check for <uibRoot>/.config/sioMiddleware.js, use it if present.
         * Applies ONCE on a new client connection.
         * Had to move to addNS since MW no longer globally loadable since sio v3
         */
        const sioMwPath = join(uib.configFolder, 'sioMiddleware.js')
        if ( existsSync(sioMwPath) ) { // not interested if the file doesn't exist
            try {
                const sioMiddleware = require(sioMwPath)
                if ( typeof sioMiddleware === 'function' ) {
                    ioNs.use(sioMiddleware)
                    log.trace(`[uibuilder:socket:addNs:${url}] Socket.IO sioMiddleware.js middleware loaded successfully for NS.`)
                } else {
                    log.warn(`[uibuilder:socket:addNs:${url}] Socket.IO middleware failed to load for NS - check that uibRoot/.config/sioMiddleware.js has a valid exported fn.`)
                }
            } catch (e) {
                log.warn(`[uibuilder:socket:addNs:${url}] Socket.IO middleware failed to load for NS. Reason: ${e.message}`)
            }
        }

        //#region -- trace room events --
        // NB: Only sockets can join rooms, not the server
        { // eslint-disable-line no-lone-blocks
            const thislog = log.trace
            // const thislog = console.log
            ioNs.adapter.on('create-room', (room) => {
                thislog(
                    `[uibuilder:socket:addNS:${url}] Room "${room}" was created`
                )
            })
            ioNs.adapter.on('delete-room', (room) => {
                thislog(
                    `[uibuilder:socket:addNS:${url}] Room "${room}" was deleted`
                )
            })
            ioNs.adapter.on('join-room', (room, id) => {
                thislog(
                    `[uibuilder:socket:addNS:${url}] Socket ID "${id}" has joined room "${room}"`
                )
            })
            ioNs.adapter.on('leave-room', (room, id) => {
                thislog(
                    `[uibuilder:socket:addNS:${url}] Socket ID "${id}" has left room "${room}"`
                )
            })
        }
        //#endregion -- -- --

        // ! TODO TEST REMOVE
        // if (url === 'uib-router-eg') {
        //     setInterval(() => {
        //         // console.log(`ping uibuilder:fred. NS: ${url}`, '\n SIDS: ', ioNs.adapter.sids, '\n ROOMS: ', ioNs.adapter.rooms)
        //         ioNs.to('uibuilder:fred').emit('uibuilder:fred', `Hello from the server. NS: "${url}"`)
        //     }, 60000)
        //     setInterval(() => {
        //         // console.log(`ping uibuilder:fred. NS: ${url}`, '\n SIDS: ', ioNs.adapter.sids, '\n ROOMS: ', ioNs.adapter.rooms)
        //         this.io.of('/').emit('uibuilder:global', 'Hello from the server. NS: "/"')
        //     }, 60000)
        //     // ioNs.join('uibuilder:fred')
        //     ioNs.on('uibuilder:fred', (room, msg) => {
        //         console.log('uibuilder:fred', room, msg)
        //     })
        //     this.io.on('uibuilder:fred', (room, msg) => {
        //         console.log('[this.io] uibuilder:fred', room, msg)
        //     })
        // }

        const that = this

        // When a client connects to the server
        ioNs.on('connection', (socket) => {

            //#region ----- Event Handlers ----- //

            // NOTE: as of sio v4, disconnect seems to be fired AFTER a connect when a client reconnects
            socket.on('disconnect', (reason, description) => {
                // ioNs.clientLog[socket.handshake.auth.clientId].connected = false

                node.ioClientsCount = ioNs.sockets.size
                log.trace(
                    `[uibuilder:socket:${url}:disconnect] Client disconnected, clientCount: ${ioNs.sockets.size}, Reason: ${reason}, ID: ${socket.id}, IP Addr: ${getClientRealIpAddress(socket)}, Client ID: ${socket.handshake.auth.clientId}. For node ${node.id}`
                )
                node.statusDisplay.text = 'connected ' + ioNs.sockets.size
                setNodeStatus( node )

                // Let the control output port know a client has disconnected
                const ctrlMsg = {
                    ...{
                        'uibuilderCtrl': 'client disconnect',
                        'reason': reason,
                        'topic': node.topic || undefined,
                        'from': 'server',
                        'description': description,
                    },
                    ...that.getClientDetails(socket, node),
                }

                that.sendToFe(ctrlMsg, node.url, uib.ioChannels.control)

                // Copy to port#2 for reference
                that.sendCtrlMsg(ctrlMsg, node)

                // Let other nodes know a client is disconnecting (via custom event manager)
                tiEvent.emit(`node-red-contrib-uibuilder/${node.url}/clientDisconnect`, ctrlMsg)
            }) // --- End of on-connection::on-disconnect() --- //

            // Listen for msgs from clients on standard channel
            socket.on(uib.ioChannels.client, function(msg) {
                that.listenFromClient(msg, socket, node )
            }) // --- End of on-connection::on-incoming-client-msg() --- //

            // Listen for msgs from clients on control channel
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

                // Apply standard client details to the control msg
                msg = { ...msg, ...that.getClientDetails(socket, node) }

                // Control msgs should say where they came from
                msg.from = 'client'

                if ( !msg.topic ) msg.topic = node.topic

                that.sendCtrlMsg(msg, node)
            }) // --- End of on-connection::on-incoming-control-msg() --- //

            // Listen for socket.io errors - output a control msg
            socket.on('error', function(err) {
                log.error(`[uibuilder:socket:addNs:${url}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)

                // Let the control output port (port #2) know there has been an error
                const ctrlMsg = {
                    ...{
                        uibuilderCtrl: 'socket error',
                        error: err.message,
                        from: 'server',
                    },
                    ...that.getClientDetails(socket, node),
                }

                that.sendCtrlMsg(ctrlMsg, node)
            }) // --- End of on-connection::on-error() --- //

            // Custom room handling (clientId & pageId rooms are always joined)
            // - NB: Clients don't understand rooms, they simply receive
            //       all messages send to all joined rooms.
            //       Messages have to include room name if need to differentiate at client.
            //       Server cannot listen to rooms but can send
            // To send to a custom room from server: ioNs.to("project:4321").emit("project updated")

            // Allow client to request to create/join a room
            socket.on('uib-room-join', (room) => {
                socket.join(room)
            })
            // Allow clients to request to leave a room
            socket.on('uib-room-leave', (room) => {
                socket.leave(room)
            })
            // Allow clients to send message to a custom room
            socket.on('uib-room-send', (room, msg) => {
                // console.log('uib-room-send', { room, msg })
                ioNs.to(room).emit(room, msg, socket.handshake.auth)
                // TODO Option to send on as a node-red msg
            })
            //#endregion ----- Event Handlers ----- //

            //#region ---- run when client connects ---- //

            // How many client connections are there?
            node.ioClientsCount = ioNs.sockets.size

            log.trace(
                `[uibuilder:socket:addNS:${url}:connect] Client connected. ClientCount: ${ioNs.sockets.size}, Socket ID: ${socket.id}, IP Addr: ${getClientRealIpAddress(socket)}, Client ID: ${socket.handshake.auth.clientId}, Recovered?: ${socket.recovered}, Client Version: ${socket.handshake.auth.clientVersion}. For node ${node.id}`
            )

            if (uib.configFolder === null) throw new Error('uib.configFolder is undefined')

            // Try to load the sioUse middleware function - sioUse applies to all incoming msgs
            const mwfile = join(uib.configFolder, uib.sioUseMwName)
            if ( existsSync(mwfile) ) { // not interested if the file doesn't exist
                try {
                    const sioUseMw = require( mwfile )
                    if ( typeof sioUseMw === 'function' ) { // if exported, has to be a function
                        socket.use(sioUseMw)
                        log.trace(`[uibuilder:socket:onConnect:${url}] sioUse sioUse.js middleware loaded successfully for NS ${url}.`)
                    } else {
                        log.warn(`[uibuilder:socket:onConnect:${url}] sioUse middleware failed to load for NS ${url} - check that uibRoot/.config/sioUse.js has a valid exported fn.`)
                    }
                } catch (e) {
                    log.warn(`[uibuilder:socket:addNS:${url}] sioUse failed to load Use middleware. Reason: ${e.message}`)
                }
            }

            node.statusDisplay.text = `connected ${ioNs.sockets.size}`
            setNodeStatus( node )

            // Initial connect message to client
            const msgClient = {
                'uibuilderCtrl': 'client connect',
                'serverTimestamp': (new Date()),
                'topic': node.topic || undefined,
                'version': uib.version,  // Let the front-end know what v of uib is in use
                '_socketId': socket.id,
            }
            // msgClient.ip = getClientRealIpAddress(socket)
            // msgClient.clientId = socket.handshake.auth.clientId
            // msgClient.connections = socket.handshake.auth.connectedNum
            // msgClient.pageName = socket.handshake.auth.pageName

            // ioNs.clientLog[msg.clientId] = {
            //     ip: msg.ip,
            //     connections: msg.connections,
            //     connected: true,
            // }

            // Let the clients know we are connecting
            that.sendToFe(msgClient, node.url, uib.ioChannels.control)

            // Send client connect control msg (via port #2)
            const ctrlMsg = {
                ...{
                    uibuilderCtrl: 'client connect',
                    topic: node.topic || undefined,
                    from: 'server',
                },
                ...that.getClientDetails(socket, node),
            }

            that.sendCtrlMsg(ctrlMsg, node)

            // Let other nodes know a client is connecting (via custom event manager)
            tiEvent.emit(`node-red-contrib-uibuilder/${node.url}/clientConnect`, ctrlMsg)

            //#endregion ---- run when client connects ---- //

            //#region ---- Rooms ----
            // Ensures uib is listening to all clients and pages
            // console.log('socket auth: ', socket.handshake.auth)
            socket.join(`clientId:${socket.handshake.auth.clientId}`)
            socket.join(`pageName:${socket.handshake.auth.pageName}`)
            // Not bothering with a tabId room - gets filtered at client anyway
            // rooms for pathName not needed as each path has own namespace
            //#endregion ---- ---- ----
        }) // --- End of on-connection() --- //
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
    const uibsockets = new UibSockets()
    module.exports = uibsockets
} catch (e) {
    console.error(`[uibuilder:socket.js] Unable to create class instance. Error: ${e.message}`)
}

// EOF
