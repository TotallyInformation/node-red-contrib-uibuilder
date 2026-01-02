/* eslint-disable jsdoc/valid-types */
/** Manage Socket.IO on behalf of uibuilder
 * Singleton. only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
 *
 * Copyright (c) 2017-2024 Julian Knight (Totally Information)
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
 * @typedef {import('express')} Express
 */

const { join, } = require('path')
const { existsSync, getFileMeta, } = require('./fs.cjs')
const socketio = require('socket.io')
const { urlJoin, } = require('./tilib.cjs') // General purpose library (by Totally Information)
const { setNodeStatus, } = require('./uiblib.cjs') // Utility library for uibuilder
// const security = require('./sec-lib') // uibuilder security module

/** Parse x-forwarded-for headers.
 * Borrowed from https://github.com/pbojinov/request-ip/blob/master/src/index.js
 * @param {string|string[]} value - The value to be parsed.
 * @returns {string|null} First known IP address, if any.
 */
function getClientIpFromXForwardedFor(value) {
    if (!value) return null

    if (Array.isArray(value)) value = value[0]

    // x-forwarded-for may return multiple IP addresses in the format:
    // "client IP, proxy 1 IP, proxy 2 IP"
    // Therefore, the right-most IP address is the IP address of the most recent proxy
    // and the left-most IP address is the IP address of the originating client.
    // source: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
    // Azure Web App's also adds a port for some reason, so we'll only use the first part (the IP)
    const forwardedIps = value.split(',').map((e) => {
        const ip = e.trim()
        if (ip.includes(':')) {
            const splitted = ip.split(':')
            // make sure we only use this if it's ipv4 (ip:port)
            if (splitted.length === 2) {
                return splitted[0]
            }
        }
        return ip
    })

    // Sometimes IP addresses in this header can be 'unknown' (http://stackoverflow.com/a/11285650).
    // Therefore taking the right-most IP address that is not unknown
    // A Squid configuration directive can also set the value to "unknown" (http://www.squid-cache.org/Doc/config/forwarded_for/)
    for (let i = 0; i < forwardedIps.length; i++) {
        if (forwardedIps[i] !== 'unknown') {
            return forwardedIps[i]
        }
    }

    // If no value in the split list is an ip, return null
    return null
}

/** Get client real ip address
 * Borrowed from https://github.com/pbojinov/request-ip/blob/master/src/index.js
 * @param {socketio.Socket} socket Socket.IO socket object
 * @returns {string | string[] | undefined} Best estimate of the client's real IP address
 */
function getClientRealIpAddress(socket) {
    const headers = socket.request.headers

    // Standard headers used by Amazon EC2, Heroku, and others.
    if (headers['x-client-ip']) return headers['x-client-ip']

    // Load-balancers (AWS ELB) or proxies.
    const xForwardedFor = getClientIpFromXForwardedFor(headers['x-forwarded-for'])
    if (xForwardedFor) return xForwardedFor

    // Cloudflare. @see https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-Cloudflare-handle-HTTP-Request-headers-
    // CF-Connecting-IP - applied to every request to the origin.
    if (headers['cf-connecting-ip']) return headers['cf-connecting-ip']

    // DigitalOcean. @see https://www.digitalocean.com/community/questions/app-platform-client-ip
    // DO-Connecting-IP - applied to app platform servers behind a proxy.
    if (headers['do-connecting-ip']) return headers['do-connecting-ip']

    // Fastly and Firebase hosting header (When forwared to cloud function)
    if (headers['fastly-client-ip']) return headers['fastly-client-ip']

    // Akamai and Cloudflare: True-Client-IP.
    if (headers['true-client-ip']) return headers['true-client-ip']

    // Default nginx proxy/fcgi alternative to x-forwarded-for, used by some proxies.
    if (headers['x-real-ip']) return headers['x-real-ip']

    // (Rackspace LB and Riverbed's Stingray)
    // http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
    // https://splash.riverbed.com/docs/DOC-1926
    if (headers['x-cluster-client-ip']) return headers['x-cluster-client-ip']

    if (headers['x-forwarded']) return headers['x-forwarded']

    if (headers['forwarded-for']) return headers['forwarded-for']

    if (headers.forwarded) return headers.forwarded

    // Google Cloud App Engine
    // https://cloud.google.com/appengine/docs/standard/go/reference/request-response-headers

    if (headers['x-appengine-user-ip']) return headers['x-appengine-user-ip']

    // else get ip from socket.request that returns the reference to the request that originated the underlying engine.io Client
    if ( socket.request?.connection?.remoteAddress ) return socket.request.connection.remoteAddress

    // else get ip from socket.handshake that is a object that contains handshake details
    return socket.handshake.address
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

        // #region ---- References to core Node-RED & uibuilder objects ---- //
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
        // #endregion ---- References to core Node-RED & uibuilder objects ---- //

        // #region ---- Common variables ---- //

        /** URI path for accessing the socket.io client from FE code. Based on the uib node instance URL.
         * @constant {string} uib_socketPath
         */
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

        // #endregion ---- ---- //
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
            uib.RED.log.warn('🌐⚠️[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
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
        this.outboundMsgMiddleware = function outboundMsgMiddleware( msg, url, channel ) { return null } // eslint-disable-line @stylistic/max-statements-per-line
        // Try to load the sioMsgOut middleware function - sioMsgOut applies to all outgoing msgs
        const mwfile = join(uib.configFolder, uib.sioMsgOutMwName)
        if ( existsSync(mwfile) ) { // not interested if the file doesn't exist
            try {
                const sioMsgOut = require( mwfile )
                if ( typeof sioMsgOut === 'function' ) { // if exported, has to be a function
                    this.outboundMsgMiddleware = sioMsgOut
                    this.log.trace('🌐[uibuilder:socket:setup] sioMsgOut Middleware loaded successfully.')
                } else {
                    this.log.warn('🌐⚠️[uibuilder:socket:setup] sioMsgOut Middleware failed to load - check that uibRoot/.config/sioMsgOut.js has a valid exported fn.')
                }
            } catch (e) {
                this.log.warn(`🌐⚠️[uibuilder:socket:setup] sioMsgOut middleware Failed to load. Reason: ${e.message}`)
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

        log.trace(`🌐[uibuilder[:socket:socketIoSetup] Socket.IO initialisation - Socket Path=${uibSocketPath}, CORS Origin=*` )
        // Socket.Io server options, see https://socket.io/docs/v4/server-options/
        let ioOptions = {
            path: uibSocketPath,
            // NOTE: webtransport requires HTTP/3 and TLS. HTTP/2 & 3 not yet available in Node.js
            // transports: ['polling', 'websocket', 'webtransport'],
            serveClient: false, // No longer required from v7
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

        // Runs when a connection or long-poll request happens - allows overrides of socket.request.headers (=== socket.handshake.headers)
        this.io.engine.on('headers', (headers, req) => {
            // Optional hook to override headers - set in settings.js uibuilder.hooks.socketIoHeaders
            this.hooks('socketIoHeaders', { headers, req, })
        })
    } // --- End of socketIoSetup() --- //

    /** Allow the isConfigured flag to be read (not written) externally
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    /** Run socket related hooks if present
     * Hooks must be a function and must return true or false, if not present, return true
     * @param {string} hookName Name of the hook function to call
     * @param {object} data Data to pass to the hook fn. Content depends on which hook.
     * @returns {boolean} True to allow message flow, false to block
     */
    hooks(hookName, data) {
        if (!this.uib) throw new Error('uib is undefined')

        const RED = this.RED
        let out = true

        if (!RED?.settings?.uibuilder?.hooks?.[hookName]) return undefined

        const hook = RED.settings.uibuilder.hooks[hookName]
        if (typeof hook === 'function') {
            try {
                out = RED.settings.uibuilder.hooks[hookName](data)
            } catch (e) {
                this.log.warn(`🌐⚠️[uibuilder:socket:hooks] Could not run 'uibuilder.hooks.${hookName}' hook in settings.js. ${e.message}`, { e, data, })
            }
        }

        return out
    }

    // ? Consider adding isConfigured checks on each method?

    /** Output a msg to the front-end.
     * @param {object} msg The message to output, include msg._socketId to send to a single client
     * @param {uibNode} node Reference to the uibuilder node instance
     * @param {string=} channel Optional. Which channel to send to (see uib.ioChannels) - defaults to client
     */
    sendToFe( msg, node, channel ) {
        const uib = this.uib
        const log = this.log

        const url = node.url

        if (!uib) throw new Error('uib is undefined. UibSockets:sendToFe')
        if (!log) throw new Error('log is undefined. UibSockets:sendToFe')
        if (!url) throw new Error('url is undefined. UibSockets:sendToFe')

        if ( !channel ) channel = uib.ioChannels.client

        const ioNs = this.ioNamespaces[url]

        const socketId = msg._socketId || undefined

        // Control msgs should say where they came from
        if ( channel === uib.ioChannels.control && !msg.from ) msg.from = 'server'

        // Run uibuilder.hooks.msgSending hook - NOTE: msg might be amended by the hook
        if (this.hooks('msgSending', { msg, node, }) === false) {
            log.warn(`🌐⚠️[uibuilder:socket:sendToFe] outbound msg blocked for "${node.url}" by "uibuilder.hooks.msgSending" hook in settings.js`)
        }

        // Process outbound middleware (middleware is loaded in this.setup)
        try {
            this.outboundMsgMiddleware( msg, url, channel, ioNs )
        } catch (e) {
            log.warn(`🌐⚠️[uibuilder:socket:sendToFe] outboundMsgMiddleware middleware failed to run. Reason: ${e.message}`)
        }

        // TODO: Sending should have some safety validation on it. Is msg an object? Is channel valid?

        // pass the complete msg object to the uibuilder client
        if (socketId) { // Send to specific client
            log.trace(`🌐[uibuilder[:socket.js:sendToFe:${url}] msg sent on to client ${socketId}. Channel: ${channel}. ${JSON.stringify(msg)}`)
            ioNs.to(socketId).emit(channel, msg)
        } else { // Broadcast
            log.trace(`🌐[uibuilder[:socket.js:sendToFe:${url}] msg sent on to ALL clients. Channel: ${channel}. ${JSON.stringify(msg)}`)
            ioNs.emit(channel, msg)
        }
    } // ---- End of sendToFe ---- //

    /** Output a normal msg to the front-end. Can override socketid. NOTE:
     *    Applies the msgReceived hook if present
     *    Only used for: function-node:uib.send, auto-reload on edit in admin-api-v2.js and Post:replaceTemplate in admin-api-v3.js
     * @param {object} msg The message to output
     * @param {uibNode} node WARNING: Not a full reference to a node instance, only node.url is available
     * @param {string=} socketId Optional. If included, only send to specific client id (mostly expecting this to be on msg._socketID so not often required)
     */
    sendToFe2(msg, node, socketId) {
        const uib = this.uib

        const ioNs = this.ioNamespaces[node.url]

        if (uib === undefined) throw new Error('uib is undefined')
        if (this.log === undefined) throw new Error('this.log is undefined')

        if (socketId) msg._socketId = socketId

        // Run uibuilder.hooks.msgSending hook - NOTE: msg might be amended by the hook
        if (this.hooks('msgSending', { msg, node, }) === false) {
            this.log.warn(`🌐⚠️[uibuilder:socket:sendToFe2] outbound msg blocked for "${node.url}" by "uibuilder.hooks.msgSending" hook in settings.js`)
        }

        // TODO: This should have some safety validation on it
        if (msg._socketId) {
            this.log.trace(`🌐[uibuilder[:socket:sendToFe2:${node.url}] msg sent on to client ${msg._socketId}. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.to(msg._socketId).emit(uib.ioChannels.server, msg)
        } else {
            this.log.trace(`🌐[uibuilder[:socket:sendToFe2:${node.url}] msg sent on to ALL clients. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.emit(uib.ioChannels.server, msg)
        }
    } // ---- End of sendToFe2 ---- //

    /** Send a uibuilder control message out of port #2. NOTE:
     *    Applies the msgReceived hook if present
     *    this.getClientDetails is used before calling this if client details needed
     * @param {object} msg The message to output
     * @param {uibNode} node Reference to the uibuilder node instance
     * @param {string} [from] Optional. Trace what source fn triggered the send
     */
    sendCtrlMsg(msg, node, from = '') {
        this.log.trace(`🌐[uibuilder[:sendCtrlMsg] FROM: '${from}'`)

        // Run uibuilder.hooks.msgReceived hook - NOTE: msg might be amended by the hook
        if (this.hooks('msgReceived', { msg, node, }) === false) {
            this.log.warn(`🌐⚠️[uibuilder:socket:sendToFe] Control msg output blocked for "${node.url}" by "uibuilder.hooks.msgReceived" hook in settings.js`)
            return
        }

        node.send( [null, msg] )
    }

    /** Get client details for including in Node-RED messages
     * @param {socketio.Socket} socket Reference to client socket connection
     * @param {uibNode} node Reference to the uibuilder node instance
     * @returns {object} Extracted key client information
     */
    getClientDetails(socket, node) {
        // Add page name meta to allow caches and other flows to send back to specific page
        // Note, could use socket.handshake.auth.pageName instead
        let pageName
        const headers = socket.request.headers
        const handshake = socket.handshake

        if ( handshake.auth.pathName ) pageName = getClientPageName(socket, node)
        const realClientIP = getClientRealIpAddress(socket)

        // WARNING: The socket.handshake data can only ever be changed by the client when it (re)connects
        const client = {}
        client._uib = {
            /** What was the originating uibuilder URL */
            url: node.url,

            _socketId: socket.id,
            /** Is this client reconnected after temp loss? */
            recovered: socket.recovered,
            /** Do our best to get the actual IP addr of client despite any Proxies */
            ip: realClientIP,
            /** The referring webpage, should be the full URL of the uibuilder page */
            referer: headers.referer,

            // Let the flow know what v of uib client is in use
            version: handshake.auth.clientVersion,
            /** What is the stable client id (set by uibuilder, retained till browser restart) */
            clientId: handshake.auth.clientId,
            /** What is the client tab identifier (set by uibuilder modern client) */
            tabId: handshake.auth.tabId,
            /** What was the originating page name (for SPA's) */
            pageName: pageName,
            /** The browser's URL parameters */
            urlParams: handshake.auth.urlParams,
            /** How many times has this client reconnected (e.g. after sleep) */
            connections: handshake.auth.connectedNum,
            /** True if https/wss */
            tls: handshake.secure,
            /** When the client connected to the server */
            connectedTimestamp: (new Date(handshake.issued)).toISOString(),
            // 'browserConnectTimestamp': handshake.auth.browserConnectTimestamp,
            connectHeaders: headers,
        }

        // @ts-ignore
        const clientTimeDifference = (new Date(handshake.issued)) - (new Date(handshake.auth.browserConnectTimestamp))
        // Only include this if The difference between the timestamps is > 1 minute - output is in milliseconds
        if (clientTimeDifference > 60000) client._uib.clientTimeDifference = clientTimeDifference

        let authProvider
        if (headers['cf-access-authenticated-user-email']) authProvider = 'CloudFlare Access'
        else if (handshake.auth?.user?.userId) authProvider = 'FlowFuse'
        else if (headers['x-user-id']) authProvider = 'Keycloak'
        else if (headers['x-authentik-uid']) authProvider = 'Authentik'
        else if (headers['remote-user'] || headers['x-remote-user']) authProvider = 'Custom'
        else if (headers['x-forwarded-user']) authProvider = 'Proxied Custom'

        const userID = headers['cf-access-user'] || headers['cf-access-authenticated-user-email'] || handshake.auth?.user?.userId || headers['x-authentik-uid'] || headers['remote-user'] || headers['x-remote-user'] || headers['x-forwarded-user'] || headers['x-user-id'] || undefined

        // client._client is ONLY added for recognised authenticated clients
        if (authProvider !== undefined && userID !== undefined) {
            const email = headers['cf-access-authenticated-user-email'] || headers['x-authentik-email'] || headers['remote-email'] || headers['x-user-email'] || undefined
            const name = headers['x-authentik-name'] || headers['remote-name'] || headers['x-remote-name'] || handshake.auth?.user?.name
            client._client = {
                userId: userID,
                socketId: socket.id,
                email: email,
                provider: authProvider,
                agent: headers['user-agent'] || null,
                ip: realClientIP,
                host: headers['host'],
                name: name,
            }
            if (headers['x-forwarded-groups']) client._client.groups = headers['x-forwarded-groups']
            if (headers['x-authentik-groups']) client._client.groups = headers['x-authentik-groups']
            if (headers['x-authentik-username']) client._client.username = headers['x-authentik-username']
            if (headers['x-user-role']) client._client.role = headers['x-user-role']
            if (handshake.auth?.user?.image) client._client.image = handshake.auth.user.image
        }

        // Run uibuilder.hooks.msgReceived hook if it exists - NOTE: msg might be amended by the hook
        // Allows client data to be amended
        this.hooks('clientDetails', { client, socket, node, })

        return client
    }

    /** Get a uib node instance namespace
     * @param {string} url The uibuilder node instance's url (identifier)
     * @returns {socketio.Namespace} Return a reference to the namespace of the specified uib instance for convenience in core code
     */
    getNs(url) {
        return this.ioNamespaces[url]
    }

    /** Send a node-red msg either directly out of the node instance OR via return event name. NOTE:
     *    Applies the msgReceived hook if present
     * @param {object} msg Message object received from a client
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    sendIt(msg, node) {
        const RED = this.RED

        // Run uibuilder.hooks.msgReceived hook - NOTE: msg might be amended by the hook
        if (this.hooks('msgReceived', { msg, node, }) === false) {
            this.log.warn(`🌐⚠️[uibuilder:socket:sendToFe] msg output blocked for "${node.url}" by "uibuilder.hooks.msgReceived" hook in settings.js`)
            return
        }

        if ( msg?._uib?.originator && (typeof msg._uib.originator === 'string') ) {
            RED.events.emit(`UIBUILDER/return-to-sender/${msg._uib.originator}`, msg)
        } else {
            node.send(msg)
        }
    }

    /** Socket listener fn for standard msgs from clients - NOTE:
     *    The optional sioUse middleware is applied BEFORE this
     *    The optional msgReceived hook is applied AFTER this
     * @param {object} msg Message object received from a client
     * @param {socketio.Socket} socket Reference to the socket for this node
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    listenFromClientStd(msg, socket, node) {
        const log = this.log
        if (log === undefined) throw new Error('log is undefined')

        node.rcvMsgCount++
        log.trace(`🌐[uibuilder[:socket:${node.url}] Data received from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

        // Make sure the incoming msg is a correctly formed Node-RED msg
        switch ( typeof msg ) {
            case 'string':
            case 'number':
            case 'boolean':
                msg = { topic: node.topic, payload: msg, }
        }

        // If the sender hasn't added msg._socketId, add the Socket.id now
        if ( !Object.prototype.hasOwnProperty.call(msg, '_socketId') ) msg._socketId = socket.id

        const { _uib, _client, } = this.getClientDetails(socket, node)

        // If required, add/merge the client details to the msg using msg._uib, remove if not required
        if (node.showMsgUib) {
            if (!msg._uib) msg._uib = _uib
            else {
                msg._uib = {
                    ...msg._uib,
                    ..._uib,
                }
            }
        }
        // Do NOT remove msg._uib here!

        if (_client) msg._client = _client

        // Send out the message for downstream flows
        // TODO: This should probably have safety validations!
        this.sendIt(msg, node)
    } // ---- End of listenFromClient ---- //

    /** Socket listener fn for control msgs from clients - NOTE:
     *    The optional sioUse middleware is applied BEFORE this
     *    The optional msgReceived hook is applied AFTER this
     * @param {object} msg Message object received from a client
     * @param {socketio.Socket} socket Reference to the socket for this node
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    listenFromClientCtrl(msg, socket, node) {
        const log = this.log
        if (log === undefined) throw new Error('log is undefined')

        node.rcvMsgCount++
        log.trace(`🌐[uibuilder[:socket:${node.url}] Control Msg from client, ID: ${socket.id}, Msg: ${JSON.stringify(msg)}`)

        // Make sure the incoming msg is a correctly formed Node-RED msg
        switch ( typeof msg ) {
            case 'string':
            case 'number':
            case 'boolean':
                msg = { uibuilderCtrl: msg, }
        }

        // Apply standard client details to the control msg
        const { _uib, _client, } = this.getClientDetails(socket, node)
        msg = { ...msg, ..._uib, }
        if (_client) msg._client = _client

        // Control msgs should say where they came from
        msg.from = 'client'

        if ( !msg.topic ) msg.topic = node.topic

        // Can we handle a control request directly? If not, send it out of port #2
        switch (msg.uibuilderCtrl) {
            case 'get page meta': {
                // This returns the data straight back to the requesting client, does not output to port #2
                getFileMeta(join(node.instanceFolder, node.sourceFolder, msg.pageName))
                    .then( (fstats) => {
                        fstats.pageName = msg.pageName
                        // Send the details back to the FE
                        const newMsg = {
                            payload: fstats,
                            uibuilderCtrl: 'get page meta',
                            _socketId: msg._socketId,
                            topic: msg.topic,
                        }
                        this.sendToFe( newMsg, node, this.uib.ioChannels.control )
                        return fstats
                    })
                    .catch( (err) => {
                        log.error(err)
                    })
                break
            }

            default: {
                this.sendCtrlMsg(msg, node, 'listenFromClientCtrl')
                break
            }
        }
    }

    /** Add a new Socket.IO NAMESPACE (for each uib instance) - also creates std & ctrl and other listeners on connection
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
                    log.trace(`🌐[uibuilder[:socket:addNs:${url}] Socket.IO sioMiddleware.js middleware loaded successfully for NS.`)
                } else {
                    log.warn(`🌐⚠️[uibuilder:socket:addNs:${url}] Socket.IO middleware failed to load for NS - check that uibRoot/.config/sioMiddleware.js has a valid exported fn.`)
                }
            } catch (e) {
                log.warn(`🌐⚠️[uibuilder:socket:addNs:${url}] Socket.IO middleware failed to load for NS. Reason: ${e.message}`)
            }
        }

        // #region -- trace room events --
        // NB: Only sockets can join rooms, not the server
        {
            const thislog = log.trace
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
        // #endregion -- -- --

        const that = this

        // When a client connects to the server - create the socket listeners & do other stuff
        ioNs.on('connection', (socket) => {
            // #region ----- Event Handlers ----- //

            // NOTE: as of sio v4, disconnect seems to be fired AFTER a connect when a client reconnects
            socket.on('disconnect', (reason, description) => {
                // ioNs.clientLog[socket.handshake.auth.clientId].connected = false

                node.ioClientsCount = ioNs.sockets.size
                log.trace(
                    `🌐[uibuilder:socket:${url}:disconnect] Client disconnected, clientCount: ${ioNs.sockets.size}, Reason: ${reason}, ID: ${socket.id}, IP Addr: ${getClientRealIpAddress(socket)}, Client ID: ${socket.handshake.auth.clientId}. For node ${node.id}`
                )
                node.statusDisplay.text = 'connected ' + ioNs.sockets.size
                setNodeStatus( node )

                // Let the control output port know a client has disconnected
                const { _uib, _client, } = this.getClientDetails(socket, node)
                const ctrlMsg = {
                    ...{
                        uibuilderCtrl: 'client disconnect',
                        reason: reason,
                        topic: node.topic || undefined,
                        from: 'server',
                        description: description,
                    },
                    ..._uib,
                }
                if (_client) ctrlMsg._client = _client

                that.sendToFe(ctrlMsg, node, uib.ioChannels.control)

                // Copy to port#2 for reference
                that.sendCtrlMsg(ctrlMsg, node, 'addNS:disconnect')

                // Let other nodes know a client is disconnecting (via custom event manager)
                this.RED.events.emit(`UIBUILDER/${node.url}/clientDisconnect`, ctrlMsg)
            }) // --- End of on-connection::on-disconnect() --- //

            // Listen for msgs from clients on standard channel
            socket.on(uib.ioChannels.client, function(msg) {
                that.listenFromClientStd(msg, socket, node)
            }) // --- End of on-connection::on-incoming-client-msg() --- //

            // Listen for msgs from clients on control channel
            socket.on(uib.ioChannels.control, function(msg) {
                that.listenFromClientCtrl(msg, socket, node)
            }) // --- End of on-connection::on-incoming-control-msg() --- //

            // Listen for socket.io errors - output a control msg
            socket.on('error', function(err) {
                log.error(`🌐🛑[uibuilder:socket:addNs:${url}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)

                // Let the control output port (port #2) know there has been an error
                const { _uib, _client, } = this.getClientDetails(socket, node)
                const ctrlMsg = {
                    ...{
                        uibuilderCtrl: 'socket error',
                        error: err.message,
                        from: 'server',
                    },
                    ..._uib,
                }
                if (_client) ctrlMsg._client = _client

                that.sendCtrlMsg(ctrlMsg, node, 'addNS:error')
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
                ioNs.to(room).emit(room, msg, socket.handshake.auth)
                // TODO Option to send on as a node-red msg
            })
            // #endregion ----- Event Handlers ----- //

            // #region ---- run when client connects ---- //

            // How many client connections are there?
            node.ioClientsCount = ioNs.sockets.size

            log.trace(
                `🌐[uibuilder:socket:addNS:${url}:connect] Client connected. ClientCount: ${ioNs.sockets.size}, Socket ID: ${socket.id}, IP Addr: ${getClientRealIpAddress(socket)}, Client ID: ${socket.handshake.auth.clientId}, Recovered?: ${socket.recovered}, Client Version: ${socket.handshake.auth.clientVersion}. For node ${node.id}`
            )

            if (uib.configFolder === null) throw new Error('uib.configFolder is undefined')

            // Try to load the sioUse middleware function - sioUse applies to all incoming msgs
            const mwfile = join(uib.configFolder, uib.sioUseMwName)
            if ( existsSync(mwfile) ) { // not interested if the file doesn't exist
                try {
                    const sioUseMw = require( mwfile )
                    if ( typeof sioUseMw === 'function' ) { // if exported, has to be a function
                        socket.use(sioUseMw)
                        log.trace(`🌐[uibuilder[:socket:onConnect:${url}] sioUse sioUse.js middleware loaded successfully for NS ${url}.`)
                    } else {
                        log.warn(`🌐⚠️[uibuilder:socket:onConnect:${url}] sioUse middleware failed to load for NS ${url} - check that uibRoot/.config/sioUse.js has a valid exported fn.`)
                    }
                } catch (e) {
                    log.warn(`🌐⚠️[uibuilder:socket:addNS:${url}] sioUse failed to load Use middleware. Reason: ${e.message}`)
                }
            }

            node.statusDisplay.text = `connected ${ioNs.sockets.size}`
            setNodeStatus( node )

            // Initial connect message to client
            const msgClient = {
                uibuilderCtrl: 'client connect',
                serverTimestamp: (new Date()),
                topic: node.topic || undefined,
                version: uib.version, // Let the front-end know what v of uib is in use
                _socketId: socket.id,
                // @ts-ignore
                maxHttpBufferSize: this.io.opts.maxHttpBufferSize || 1048576, // Let the client know the max msg size that can be sent, default=1MB
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
            that.sendToFe(msgClient, node, uib.ioChannels.control)

            // Send initial client connect control msg (via port #2)
            const { _uib, _client, } = this.getClientDetails(socket, node)
            const ctrlMsg = {
                ...{
                    uibuilderCtrl: 'client connect',
                    topic: node.topic || undefined,
                    from: 'server',
                    maxHttpBufferSize: msgClient.maxHttpBufferSize,
                },
                ..._uib,
            }
            if (_client) ctrlMsg._client = _client

            that.sendCtrlMsg(ctrlMsg, node, 'addNS:connection')

            // Let other nodes know a client is connecting (via custom event manager)
            this.RED.events.emit(`UIBUILDER/${node.url}/clientConnect`, ctrlMsg)

            // #endregion ---- run when client connects ---- //

            // #region ---- Rooms ----
            // Ensures uib is listening to all clients and pages
            socket.join(`clientId:${socket.handshake.auth.clientId}`)
            socket.join(`pageName:${socket.handshake.auth.pageName}`)
            // Not bothering with a tabId room - gets filtered at client anyway
            // rooms for pathName not needed as each path has own namespace
            // #endregion ---- ---- ----
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
