/* eslint-disable no-var, array-bracket-newline */
/*
  Copyright (c) 2017-2022 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
/**
 * This is the Front-End JavaScript for uibuilder
 * It provides a number of global objects that can be used in your own javascript.
 * @see the docs folder `./docs/uibuilderfe-js.md` for details of how to use this fully.
 *
 * Please use the default index.js file for your own code and leave this as-is.
 */

'use strict'

/** Tell Webpack/Parcel that we need socket.io client if running from webpack build
 * For this to work, you have to have the socket.io-client package installed as a dev
 * dependency in your front-end project.
 * ! NOTE: It is preferable NOT to bundle the socket.io client since there is a danger
 * !       that you will end up with an incompatible version. You gain little to nothing anyway.
 */
if (typeof require !== 'undefined'  &&  typeof io === 'undefined') { // eslint-disable-line block-scoped-var, no-use-before-define
    const io = require('socket.io-client') // eslint-disable-line no-unused-vars
}

/** Create a single global using "new" with an anonymous function
 * ensures that everything is isolated and only what is returned is accessible
 * Isolate everything
 **/
(function () {
    //#region --- Type Defs --- //
    /**
     * @typedef {object} _auth The standard auth object used by uibuilder security. See docs for details.
     * Note that any other data may be passed from your front-end code in the _auth.info object.
     * _auth.info.error, _auth.info.validJwt, _auth.info.message, _auth.info.warning
     * @property {string} id Required. A unique user identifier.
     * @property {string} [password] Required for login only.
     * @property {string} [jwt] Required if logged in. Needed for ongoing session validation and management.
     * @property {number} [sessionExpiry] Required if logged in. Milliseconds since 1970. Needed for ongoing session validation and management.
     * @property {boolean} [userValidated] Required after user validation. Whether the input ID (and optional additional data from the _auth object) validated correctly or not.
     * @property {object=} [info] Optional metadata about the user.
     */
    /**
     * A string containing HTML markup
     * @typedef {string} html
     */
    //#endregion --- Type Defs --- //

    // Keep a copy of the starting context
    var root = this
    // Keep a copy of anything with a clashing name in the starting context
    var previous_uibuilder = root.uibuilder

    //#region ----- Utility Functions ----- //

    /** Makes a null or non-object into an object
     * If not null, moves "thing" to {payload:thing}
     *
     * @param {*} thing Thing to check
     * @param {string} [property='payload'] property that "thing" is moved to if not null and not an object
     * @returns {!object} _
     */
    function makeMeAnObject(thing, property) {
        if (!property) property = 'payload'
        if ( typeof property !== 'string' ) {
            console.warn('[uibuilderfe:makeMeAnObject] WARNING: property parameter must be a string and not: ' + typeof property)
            property = 'payload'
        }
        var out = {}
        if ( thing !== null && thing.constructor.name === 'Object' ) {
            out = thing
        } else if (thing !== null) {
            out[property] = thing
        }
        return out
    } // --- End of make me an object --- //

    /** Joins all arguments as a URL string
     * see http://stackoverflow.com/a/28592528/3016654
     * since v1.0.10, fixed potential double // issue
     * arguments {string} URL fragments
     * @returns {string} _
     */
    function urlJoin() {
        var paths = Array.prototype.slice.call(arguments)
        var url = '/' + paths.map(function(e) {
            return e.replace(/^\/|\/$/g,'')
        })
            .filter(function(e) {
                return e
            })
            .join('/')
        return  url.replace('//','/')
    } // ---- End of urlJoin ---- //

    //#endregion ----- Utility Functions ----- //

    // Create a function with specific "this" context - this is the main code
    // @since 2017-10-14 Replaced "new (function(){})" with "(function(){}).call(root)"
    var uibuilder = (function uibuilder() { // eslint-disable-line no-extra-parens
        // Remember that things have to be defined *before* they are referenced

        // Define polyfill for endsWith for IE
        if (!String.prototype.endsWith) {
            // eslint-disable-next-line no-extend-native
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1
            }
        }

        /** @type {object} */
        var self = this

        //#region ++++++++++ Start of setup ++++++++++ //

        self.version = '6.1.1-old'
        self.moduleName  = 'uibuilder' // Must match moduleName in uibuilder.js on the server
        // @ts-expect-error ts(2345) Tests loaded ver of lib to see if minified
        self.isUnminified = (/param/).test(function(param) {}) // eslint-disable-line no-unused-vars
        self.debug = self.isUnminified === true ? true : false // do not change directly - use .debug() method
        /** Default originator node id */
        self.originator = ''

        /** Debugging function
         * param {string} type One of log|error|warn|info|dir, etc
         * param {...*} msg Msg(s) to send to console
         * WARNING: ...args is ES6, it doesn't work on IE11
         * since 2019-02-01 Apply any number of args
         * since 2022-01-21 Allow single arg, default log type to 'log'
         */
        self.uiDebug = function () {
            if (!self.debug) return

            let type
            if ( arguments.length < 2 ) type = 'log'
            else type = arguments[0]

            /** since v2.0.0-dev3 2019-05-27 changed from ...apply(undefined,...) to ...apply(console,...) Fixes Issue #49 */
            //console[type](...args)
            console[type].apply(console, [].slice.call(arguments, 1))

        } // --- End of debug function --- //

        self.cookies = {}
        document.cookie.split(';').forEach( function(c) {
            const splitC = c.split('=')
            self.cookies[splitC[0].trim()] = splitC[1]
        })
        /** Client ID set by uibuilder */
        self.clientId = self.cookies['uibuilder-client-id']

        /** Returns the self object if debugging otherwise just the current version
         * @returns {object|string} Returns self or version
         */
        self.me = function() {
            return self.debug === true ? self : 'uibuilderfe.js Version: ' + self.version
        }

        self.uiDebug('log', '\nuibuilderfe: Debug? ', self.debug, '\n\t\tVersion? ', self.version, '\n\t\tRunning Packed version? ', !self.isUnminified, '\n ')

        /** Try to get the Socket.IO namespace from the current URL - won't work if page is in a sub-folder
         * since 2017-10-21 Improve method to cope with more complex paths - thanks to Steve Rickus @shrickus
         * since 2017-11-10 v1.0.1 Check cookie first then url. cookie works even if the path is more complex (e.g. sub-folder)
         * since 2020-01-25 Removed httpRoot from namespace to prevent proxy induced errors
         * @returns {string} Socket.IO namespace
         */
        self.setIOnamespace = function setIOnamespace() {

            var ioNamespace = ''

            /** Try getting the namespace cookie. */
            ioNamespace = self.cookies['uibuilder-namespace']

            // if it wasn't available, try using the current url path
            if ( ioNamespace === undefined || ioNamespace === '' ) {
                // split url path & eliminate any blank elements, and trailing or double slashes
                var u = window.location.pathname.split('/').filter(function(t) { return t.trim() !== '' })

                /** since v2.0.5 Extra check for 0 length, Issue #73. since 2017-11-06 If the last element of the path is an .html file name, remove it */
                if (u.length > 0 && (u[u.length - 1].endsWith('.html')) ) u.pop()

                // Get the last part of the url path, this MUST match the namespace in uibuilder
                ioNamespace = u.pop()

                self.uiDebug('log', '[uibuilderfe:setIOnamespace] Found via url path: ' + ioNamespace)
            } else {
                self.uiDebug('log', '[uibuilderfe:setIOnamespace] Found via cookie: ' + ioNamespace)
            }

            // Namespace HAS to start with a /
            ioNamespace = '/' + ioNamespace

            self.uiDebug('log', 'uibuilderfe: IO Namespace: ' + ioNamespace)

            return ioNamespace
        } // --- End of set IO namespace --- //

        //#region ===== variables ===== //

        // ---- These cannot be accessed externally via get/set: ----
        self.authToken    = ''    // populated when receive 'authorised' msg from server, must be returned with each msg sent

        //#region ---- These are unlikely to be needed externally: ----
        self.ioChannels   = { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder' }
        self.retryMs      = 2000                            // starting retry ms period for manual socket reconnections workaround
        self.retryFactor  = 1.5                             // starting delay factor for subsequent reconnect attempts
        self.timerid      = null
        self.ioNamespace  = self.setIOnamespace()           // Get the namespace from the current URL
        self.ioTransport  = ['polling', 'websocket']
        self.loaded       = false                           // Are all browser resources loaded?
        self.storePrefix  = 'uib_'                          // Prefix for all uib-related localStorage
        /** Empty User info template
         * @type {_auth} */
        self.dummyAuth = {
            id: 'anonymous',
            jwt: undefined,
            sessionExpiry: undefined,
            userValidated: false,
            info: {
                error: undefined,
                message: undefined,
                validJwt: undefined,
            },
        }
        /** Retained User info
         * @type {_auth|undefined} */
        self._auth = self.dummyAuth
        /** Flag to know whether `uibuilder.start()` has been run */
        self.started = false
        // Work out pageName
        self.pageName = window.location.pathname.replace(`${self.ioNamespace}/`, '')
        if ( self.pageName.endsWith('/') ) self.pageName += 'index.html'
        if ( self.pageName === '' ) self.pageName = 'index.html'        
        //#endregion ---- ---- ---- ----

        /** Writable (via custom method. read via .get method) */
        /** Automatically send a "ready for content" control message on window.load
         * Set to false if you want to send this yourself (e.g. when Riot/Moon/etc mounted event triggered)
         * see .autoSendReady method
         */
        self.autoSendReady = true

        //#region ---- Externally Writable (via .set method, read via .get method) ---- //
        self.allowScript  = true   // Allow incoming msg to contain msg.script with JavaScript that will be automatically executed
        self.allowStyle   = true   // Allow incoming msg to contain msg.style with CSS that will be automatically executed
        self.removeScript = true   // Delete msg.code after inserting to DOM if it exists on incoming msg
        self.removeStyle  = true   // Delete msg.style after inserting to DOM if it exists on incoming msg
        //#endregion ---- ---- ---- ---- //

        //#region ---- Externally read-only (via .get method) ---- //
        self.msg          = {}
        self.ctrlMsg      = {}  // copy of last control msg object received from sever
        self.sentMsg      = {}  // copy of last msg object sent via uibuilder.send()
        self.sentCtrlMsg  = {}  // copy of last control msg object sent via uibuilder.send() @since v2.0.0-dev3
        self.msgsSent     = 0   // track number of messages sent to server since page load
        self.msgsReceived = 0   // track number of messages received from server since page load
        self.msgsSentCtrl = 0   // track number of control messages sent to server since page load
        self.msgsCtrl     = 0   // track number of control messages received from server since page load
        self.ioConnected  = false
        self.serverTimeOffset = null // placeholder to track time offset from server, see fn self.socket.on(self.ioChannels.server ...)
        self.isAuthorised = false    // Set to true if receive 'authorised' msg from server
        self.authTokenExpiry  = null // Set on successful logon. Timestamp.
        self.authData     = {}       // Additional data returned from logon/logoff requests
        self.connectedNum = 0        // How many times have we reconnected since page load?
        // self.security     = false    // Does uibuilder have security turned on? (Set by early incoming control message)
        //#endregion ---- ---- ---- ---- //

        //#region - Try to make sure client uses Socket.IO version from the uibuilder module (using path) @since v2.0.0 2019-02-24 allows for httpNodeRoot
        /** httpNodeRoot (to set path) */
        if ( 'uibuilder-webRoot' in self.cookies ) {
            self.httpNodeRoot = self.cookies['uibuilder-webRoot']
        } else {
            // split current url path, eliminate any blank elements and trailing or double slashes
            var fullPath = window.location.pathname.split('/').filter(function(t) { return t.trim() !== '' })
            /** handle url includes file name - @since v2.0.5 Extra check for 0 length, Issue #73. */
            if ( fullPath.length > 0 && fullPath[fullPath.length - 1].endsWith('.html') ) fullPath.pop()
            self.url = fullPath.pop() // not actually used and only gives the last path section of the url anyway
            self.httpNodeRoot = '/' + fullPath.join('/')
        }
        self.ioPath = urlJoin(self.httpNodeRoot, self.moduleName, 'vendor', 'socket.io')
        self.uiDebug('debug', 'uibuilderfe: ioPath: ' + self.ioPath + ', httpNodeRoot: ' + self.httpNodeRoot + ', uibuilder url (not used): ' + self.url)
        //#endregion

        //#endregion ===== variables ===== //

        //#region ===== internal functions ===== //

        /** Write to localStorage if possible. console error output if can't write
         * Also uses self.storePrefix
         * @param {string} id localStorage var name to be used (prefixed with 'uib_')
         * @param {*} value value to write to localstore
         * @returns {boolean} True if succeeded else false
         */
        self.setStore = function setStore(id, value) {
            if ( typeof value === 'object') {
                try {
                    value = JSON.stringify(value)
                } catch (e) {
                    console.error('[uibuilder:setStore] Cannot stringify object, not storing. ', e)
                    return false
                }
            }
            try{
                localStorage.setItem(self.storePrefix + id, value)
                return true
            } catch (e) {
                console.error('[uibuilder:setStore] Cannot write to localStorage. ', e)
                return false
            }
        }

        /** Function to set uibuilder properties to a new value - works on any property - see uiReturn.set also for external use
         * Also triggers any event listeners.
         * Example: self.set('msg', {topic:'uibuilder', payload:42});
         * @param {string} prop _
         * @param {*} val _
         */
        self.set = function set(prop, val) {
            self[prop] = val
            //self.uiDebug('debug', `uibuilderfe: prop set - prop: ${prop}, val: ${(typeof val === 'object') ? JSON.stringify(val) : val}` )
            self.uiDebug('debug', 'uibuilderfe: prop set - prop: ' + prop + ', val: ' + ((typeof val === 'object') ? JSON.stringify(val) : val) )

            // Trigger this prop's event callbacks (listeners)
            self.emit(prop, val)

            //self.uiDebug('debug', `uibuilderfe:uibuilder:set Property: ${prop}, Value: ${val}`)
        }

        /** Function used to check whether Socket.IO is connected to the server, reconnect if not (recursive)
         * @param {number} delay Initial delay before checking (ms)
         * @param {number} factor Multiplication factor for subsequent checks (delay*factor)
         * @param {number} [depth] Recursion depth
         */
        self.checkConnect = function checkConnect(delay, factor, depth = 1) {
            //var depth = depth++ || 1 // eslint-disable-line no-use-before-define

            //self.uiDebug('debug', `uibuilderfe:checkConnect. Reconnect - Depth: ${depth}, Delay: ${delay}, Factor: ${factor}`)
            self.uiDebug('debug', 'uibuilderfe:checkConnect. Reconnect - Depth: ' + depth + ', Delay: ' + delay + ', Factor: ' + factor, self.ioNamespace, self.ioPath)

            // we only want one running at a time
            if (self.timerid) window.clearTimeout(self.timerid)

            // Create the new timer
            self.timerid = window.setTimeout(function () {
                //self.uiDebug('debug', `uibuilderfe:checkConnect timeout. SIO reconnect attempt, timeout: ${delay}, depth: ${depth}`)
                self.uiDebug('debug', 'uibuilderfe:checkConnect timeout. SIO reconnect attempt, timeout: ' + delay + ', depth: ' + depth, self.ioNamespace, self.ioPath)
                console.info('[uibuilderfe:checkConnect:setTimeout] Socket.IO reconnection attempt. Current delay: ' + delay)

                // this is necessary sometimes when the socket fails to connect on startup
                self.socket.close()

                // Try to reconnect
                self.socket.connect()

                // don't need to check whether we have connected as the timer will have been cleared if we have
                self.timerid = null

                // Create new timer for next time round with extended delay
                self.checkConnect(delay * factor, factor, depth++)
            }, delay)
        } // --- End of checkConnect Fn--- //

        /** Check supplied msg from server for a timestamp - if received, work out & store difference to browser time
         * @param {object} receivedMsg A message object recieved from Node-RED
         * @returns {void} Updates self.serverTimeOffset if different to previous value
         */
        self.checkTimestamp = function checkTimestamp(receivedMsg) {
            if ( Object.prototype.hasOwnProperty.call(receivedMsg, 'serverTimestamp') ) {
                var serverTimestamp = new Date(receivedMsg.serverTimestamp)
                // @ts-ignore
                var offset = Math.round( ( (new Date()) - serverTimestamp ) / 3600000 ) // in ms / 3.6m to get hours
                if ( offset !== self.serverTimeOffset ) {
                    self.set('serverTimeOffset', offset )
                    self.uiDebug('log', 'uibuilderfe:' + self.ioChannels.server + ' (server): Offset changed to: ' + offset )
                }
            }
        }

        /** Setup Socket.io
         * since v2.0.0-beta2 Moved to a function and called by the user (uibuilder.start()) so that namespace & path can be passed manually if needed
         * @returns {void} Attaches socket.io manager to self.socket and updates self.ioNamespace & self.ioPath as needed
         */
        self.ioSetup = function ioSetup() {

            // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
            self.uiDebug('debug', '[uibuilderfe:ioSetup] About to create IO. Namespace: ' + self.ioNamespace + ', Path: ' + self.ioPath + ', Transport: [' + self.ioTransport.join(', ') + ']')
            self.socketOptions = {
                path: self.ioPath,
                transports: self.ioTransport,
                auth: {
                    clientId: self.clientId,
                    connectedNum: self.connectedNum,
                    pathName: window.location.pathname,
                    pageName: self.pageName,
                    clientVersion: self.version,
                },
                transportOptions: {
                    // Can only set headers when polling
                    polling: {
                        extraHeaders: {
                            'x-clientid': `${self.moduleName}; old-iife; ${self.version}; ${self.clientId}`
                        }
                    },
                },
            }

            self.socket = io(self.ioNamespace, self.socketOptions)  // eslint-disable-line block-scoped-var

            /** When the socket is connected - set ioConnected flag and reset connect timer  */
            self.socket.on('connect', function ioconnect() {

                self.connectedNum++
                // How many times has the client (re)connected since page load
                self.socketOptions.auth.connectedNum = self.connectedNum

                self.uiDebug('info', '[uibuilderfe:ioSetup] SOCKET CONNECTED - # connections: ' + self.connectedNum + ' Namespace: ' + self.ioNamespace, ' Server Channel: ', self.ioChannels.server, ' Control Channel: ', self.ioChannels.control)
                
                self.set('ioConnected', true)

                // Reset any reconnect timers
                if (self.timerid) {
                    window.clearTimeout(self.timerid)
                    self.timerid = null
                }

            }) // --- End of socket connection processing ---

            // RECEIVE a STANDARD, non-control msg from Node-RED server
            self.socket.on(self.ioChannels.server, function msgFromServer(receivedMsg) {
                self.uiDebug('info', '[uibuilderfe:ioSetup:on-' + self.ioChannels.server + ' (server)] msg received - Namespace: ' + self.ioNamespace, receivedMsg)

                // Make sure that msg is an object & not null
                receivedMsg = makeMeAnObject(receivedMsg, 'payload')

                // @since 2018-10-07 v1.0.9: Work out local time offset from server
                self.checkTimestamp(receivedMsg)

                // Update _auth if needed
                if ( receivedMsg._auth ) self.updateAuth(receivedMsg._auth)

                // If the msg contains a code property (js), insert to DOM, remove from msg if required
                if ( self.allowScript && Object.prototype.hasOwnProperty.call(receivedMsg, 'script') ) {
                    self.newScript(receivedMsg.script)
                    if ( self.removeScript ) delete receivedMsg.script
                }
                // If the msg contains a style property (css), insert to DOM, remove from msg if required
                if ( self.allowStyle && Object.prototype.hasOwnProperty.call(receivedMsg, 'style') ) {
                    self.newStyle(receivedMsg.style)
                    if ( self.removeStyle ) delete receivedMsg.style
                }

                // Save the msg for further processing
                self.set('msg', receivedMsg)

                // Track how many messages have been received
                self.set('msgsReceived', self.msgsReceived + 1)

                /** Test auto-response - not really required but useful when getting started **/
                /* if (self.debug) {
                    self.send({payload: 'From: uibuilderfe - we got a message from you, thanks', origMsg: receivedMsg})
                } */

            }) // -- End of websocket receive DATA msg from Node-RED -- //

            // RECEIVE a CONTROL msg from Node-RED server - see also sendCtrl()
            self.socket.on(self.ioChannels.control, function ctrlMsgRecvd(receivedCtrlMsg) {
                self.uiDebug('debug', '[uibuilder:ioSetup:on-ctrl-recvd] ' + self.ioChannels.control + ' (control): msg received - Namespace: ' + self.ioNamespace, receivedCtrlMsg)

                // Make sure that msg is an object & not null
                if (receivedCtrlMsg === null) {
                    receivedCtrlMsg = {}
                } else if (typeof receivedCtrlMsg !== 'object') {
                    var msg = {}
                    msg['uibuilderCtrl:' + self.ioChannels.control] = receivedCtrlMsg
                    receivedCtrlMsg = msg
                }

                // Allow incoming control msg to change debug state (usually on the connection msg)
                if ( Object.prototype.hasOwnProperty.call(receivedCtrlMsg, 'debug') ) self.debug = receivedCtrlMsg.debug

                // Allow incoming control msg to indicate that this instance of the uibuilder node has security turned on
                // if ( Object.prototype.hasOwnProperty.call(receivedCtrlMsg, 'security') ) {
                //     self.security = receivedCtrlMsg.security
                // }

                // @since 2018-10-07 v1.0.9: Work out local time offset from server
                self.checkTimestamp(receivedCtrlMsg)

                self.set('ctrlMsg', receivedCtrlMsg)
                self.set('msgsCtrl', self.msgsCtrl + 1)

                /** Process control msg types */
                switch(receivedCtrlMsg.uibuilderCtrl) {
                    // Node-RED is shutting down
                    case 'shutdown': {
                        self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "shutdown" from server`)
                        self.set('serverShutdown', undefined)
                        break
                    }

                    /** We are connected to the server - 1st msg from server */
                    case 'client connect': {
                        self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "client connect" from server`)
                        self.uiDebug('info', `[uibuilderfe:ioSetup:client-connect] Server: Version=${receivedCtrlMsg.version}, Time=${receivedCtrlMsg.serverTimestamp}.`)
                        if ( !self.version.startsWith(receivedCtrlMsg.version.split('-')[0]) )
                            console.warn( `[uibuilderfe:ioSetup:client-connect] Server version (${receivedCtrlMsg.version}) not the same as the client version (${self.version})`)

                        // If security is on
                        // if ( Object.prototype.hasOwnProperty.call(receivedCtrlMsg, 'security') && receivedCtrlMsg === true ) {
                        //     // Initialise client security
                        //     self.initSecurity()
                        //     // DO NOT RETURN ANYTHING ELSE UNTIL SERVER CONFIRMS VALID AUTHORISATION
                        // } else {
                        if ( self.autoSendReady === true ) { // eslint-disable-line no-lonely-if
                            self.uiDebug( 'info', '[uibuilderfe:ioSetup:client-connect] Auto-sending ready-for-content/replay msg to server')
                            // @since 0.4.8c Add cacheControl property for use with node-red-contrib-infocache
                            self.send({
                                'uibuilderCtrl':'ready for content',
                                'cacheControl':'REPLAY',
                            },self.ioChannels.control)
                        }
                        // }

                        break
                    }

                    // Login was accepted by the Node-RED server - note that payload may contain more info
                    // case 'authorised': {
                    //     self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "authorised" from server`, receivedCtrlMsg._auth)
                    //     self.updateAuth(receivedCtrlMsg._auth)
                    //     break
                    // }

                    // Login was rejected by the Node-RED server - note that payload may contain more info
                    // case 'not authorised': {
                    //     self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "not authorised" from server`)
                    //     //self.markLoggedOut('Logon authorisation failure', receivedCtrlMsg._auth.authData)
                    //     self.updateAuth(receivedCtrlMsg._auth)
                    //     break
                    // }

                    // Logoff confirmation from server - note that payload may contain more info
                    // case 'logged off': {
                    //     self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "logged off" from server`)
                    //     //self.markLoggedOut('Logged off by logout() request', receivedCtrlMsg._auth)
                    //     self.updateAuth(receivedCtrlMsg._auth)
                    //     break
                    // }

                    // Received a socket error - an untrapped error from the server, possibly from sioUse.js
                    case 'socket error': {
                        console.error( `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received "socket error" from server. ${receivedCtrlMsg.error}`)
                        break
                    }

                    default: {
                        self.uiDebug('info', `[uibuilderfe:ioSetup:${self.ioChannels.control}] Received ${receivedCtrlMsg.uibuilderCtrl} from server`)
                        if ( receivedCtrlMsg._auth ) self.updateAuth(receivedCtrlMsg._auth)
                        // Anything else
                    }

                } // ---- End of process control msg types ---- //

                /* Test auto-response
                    if (self.debug) {
                        self.send({payload: 'We got a control message from you, thanks'})
                    }
                // */

            }) // -- End of websocket receive CONTROL msg from Node-RED -- //

            // When the socket is disconnected ..............
            self.socket.on('disconnect', function onDisconnect(reason) {
                // reason === 'io server disconnect' - redeploy of Node instance
                // reason === 'transport close' - Node-RED terminating
                // reason === 'ping timeout' - didn't receive a pong response?
                self.uiDebug('info', '[uibuilderfe:ioSetup:disconnect] SOCKET DISCONNECTED - Namespace: ' + self.ioNamespace + ', Reason: ' + reason)

                self.set('ioConnected', false)

                console.warn('[uibuilderfe:ioSetup:disconnect] Disconnection Reason: ' + reason)

                /** A workaround for SIO's failure to reconnect after a disconnection */
                self.checkConnect(self.retryMs, self.retryFactor)
            }) // --- End of socket disconnect processing ---

            // Socket.io connection error - probably the wrong ioPath
            self.socket.on('connect_error', function onConnectErr(err) {
                console.error( `[uibuilderfe:ioSetup:connect_error] SOCKET CONNECT ERROR - Namespace: ${self.ioNamespace}, ioPath: ${self.ioPath}, Reason: ${err.message}`, err)
            }) // --- End of socket connect error processing ---

            // Socket.io error - from the server (socket.use middleware triggered an error response)
            self.socket.on('error', function onSocErr(err) {
                console.error( '[uibuilderfe:ioSetup:error] SOCKET ERROR from server - MESSAGE: ', err)
                self.set('socketError', err)
            }) // --- End of socket error processing ---

            // Ensure we are connected, retry if not
            self.checkConnect(self.retryMs, self.retryFactor)

            // TODO: Just for testing - remove or do something useful
            /*
            self.socket.io.on('packet', function onPacket(data){
                // we get one of these for each REAL msg (not ping/pong)
                console.log('PACKET', data)
            })
            self.socket.on('pong', function(latency) {
                console.log('SOCKET PONG - Latency: ', latency)
                //console.dir(self.socket)
            }) // --- End of socket pong processing ---
            */

            /* We really don't need these, just for interest
                self.socket.io.on('packet', function(data){
                    // We get one of these for actual messages, not ping/pong
                    console.log('PACKET', data)
                })
                self.socket.on('connect_timeout', function(timeout) {
                    self.uiDebug('log', 'SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace + ', Timeout: ' + timeout)
                }) // --- End of socket connect timeout processing ---
                self.socket.on('reconnect', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECTED - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnect processing ---
                self.socket.on('reconnect_attempt', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECT ATTEMPT - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnect_attempt processing ---
                self.socket.on('reconnecting', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECTING - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnecting processing ---
                self.socket.on('reconnect_error', function(err) {
                    self.uiDebug('log', 'SOCKET RECONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
                    //console.dir(err)
                }) // --- End of socket reconnect_error processing ---
                self.socket.on('reconnect_failed', function() {
                    self.uiDebug('log', 'SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
                }) // --- End of socket reconnect_failed processing ---
                self.socket.on('ping', function() {
                    self.uiDebug('log', 'SOCKET PING')
                }) // --- End of socket ping processing ---
                self.socket.on('pong', function(latency) {
                    self.uiDebug('log', 'SOCKET PONG - Latency: ', latency)
                }) // --- End of socket pong processing ---
             */
        } // ---- End of ioSetup ---- //

        //#region ==== Security Functions ==== //

        /** Mark client as logged off & delete local auth data
         * @param {string=} localReason Optional, give a reason for logoff, will be placed in self.authData
         * @param {_auth=} _auth Data from server, uses self._auth if not provided
         */
        // self.markLoggedOut = function markLoggedOut(localReason, _auth) {
        //     // If _auth undefined then ignore
        //     if (self._auth === undefined && _auth === undefined) return

        //     // If _auth not provided, use self._auth
        //     if ( _auth === undefined ) _auth = self._auth

        //     // Reset auth info
        //     //_auth = self.dummyAuth

        //     // Record reason if given
        //     if ( ! _auth.info ) _auth.info = {}
        //     if ( localReason !== undefined ) _auth.info.message = localReason

        //     // Trigger change in isAuthorised
        //     self.set('isAuthorised', false) // also triggers event

        //     self.uiDebug('info', '[uibuilderfe:markLoggedOut] ', _auth)

        //     // Trigger change in _auth
        //     self.set('_auth', _auth)
        //     // Save updated _auth to localStorage
        //     self.setStore('auth', _auth)

        //     //delete self.socketOptions.transportOptions.polling.extraHeaders.Authorization
        // } // ---- End of markLoggedOut ---- //

        /** Send a logon request control message
         * Node-RED will respond with another control msg indicating success or failure,
         * the `isAuthorised` variable is set accordingly to true or false.
         * @param {_auth=} _auth Logon specific data to be passed to Node-RED, uses self._auth if not provided.
         * @param {string=} [api] Optional. If set to a valid API URL, send login data to it and process response. Otherwise send login request as a control msg
         */
        // self.logon = function logon(_auth, api) {
        //     // If security is off, don't bother
        //     if (!self.security) return

        //     // If _auth undefined then ignore
        //     if (self._auth === undefined && _auth === undefined) return

        //     // If _auth not provided, use self._auth
        //     if ( _auth === undefined ) _auth = self._auth

        //     if ( _auth.id === undefined || _auth.id === null || _auth.id.length === 0 ) {
        //         console.error('[uibuilder:logon] No logon id supplied, ignoring request.')
        //         return
        //     }

        //     if ( ! _auth.info ) _auth.info = self.dummyAuth.info

        //     self.set('_auth', _auth)
        //     // Save updated _auth to localStorage
        //     self.setStore('auth', _auth)

        //     if (api) {
        //         //TODO (see login method on vue2 test)
        //     } else {
        //         self.send({
        //             'uibuilderCtrl':'logon',
        //             'from': 'client',
        //             '_auth': self._auth,
        //         },self.ioChannels.control)
        //     }

        //     self.uiDebug('log', '[uibuilder:logon] ', self._auth)
        // } // ---- End of logon ---- //

        /** Send a logoff request control message
         * Note that the local auth data is NOT removed here.
         *   That happens when the client receives the control msg "logged off" from the server.
         * @param {_auth=} _auth Required. Logon specific data to be passed to Node-RED
         * @param {string} [api] Optional. If set to a valid API URL, send login data to it and process response. Otherwise send login request as a control msg
         */
        // self.logoff = function logoff(_auth, api) {
        //     // If security is off, don't bother
        //     if (!self.security) return

        //     // If _auth undefined then ignore
        //     if (self._auth === undefined && _auth === undefined) return

        //     // If _auth not provided, use self._auth
        //     if ( _auth === undefined ) _auth = self._auth

        //     if ( _auth.id === undefined || _auth.id === null || _auth.id.length === 0 ) {
        //         console.error('[uibuilder:logoff] No logoff id supplied, ignoring request.')
        //         return
        //     }

        //     if ( ! _auth.info ) _auth.info = self.dummyAuth.info

        //     // Trigger change in _auth
        //     self.set('_auth', _auth)
        //     // Save updated _auth to localStorage
        //     self.setStore('auth', _auth)

        //     if (api) {
        //         //TODO (see login method on vue2 test)
        //     } else {
        //         self.send({
        //             'uibuilderCtrl':'logoff',
        //             'from': 'client',
        //             '_auth': self._auth,
        //         },self.ioChannels.control)
        //     }
        // }  // ---- End of logoff ---- //

        /** Initialise client security
         * Called on recv 'client connect' control message
         */
        // self.initSecurity = function initSecurity() {
        //     self.uiDebug('info', '[uibuilderfe:initSecurity] Initialising security')

        //     self.security = true

        //     // Check for the localstore
        //     if (localStorage.getItem('uib_auth') === null) {
        //         // Not present so write the auth
        //         self.setStore('auth', self._auth)
        //     } else {
        //         // Is present so recover the data and update _auth
        //         try {
        //             // Trigger change in _auth
        //             self.set('_auth', JSON.parse(localStorage.getItem(self.storePrefix + 'auth')))
        //             self.uiDebug('info', '[uibuilderfe:initSecurity] Set self._auth from localStorage')
        //         } catch (e) {
        //             console.error('[uibuilderfe:initSecurity] Could not parse localStorage', e)
        //             return
        //         }
        //     }

        //     // Send 'auth' control msg to server - NB: msg._auth is added automatically
        //     self.send({'uibuilderCtrl':'auth',},self.ioChannels.control)

        // } // --- end of initSecurity --- //

        /** Update client authorisation info from server info
         * Note that this may happen after a successful logon request or at any time
         * a msg is received (on any channel) that contains a msg._auth object
         * @param {_auth=} _auth Authorisation information. Defaults to self._auth if not supplied
         * @param {string=} control Additional optional control string
         */
        // self.updateAuth = function updateAuth(_auth, control) {
        //     // If security is off, don't bother
        //     if (!self.security) return

        //     // If _auth undefined then ignore
        //     if (self._auth === undefined && _auth === undefined) return

        //     // If _auth not provided, use self._auth
        //     if ( _auth === undefined ) _auth = self._auth

        //     // Ignore if empty object
        //     //if ( Object.keys(_auth).length === 0 ) return

        //     // We wont give out spurious warnings if this is the initial contact from the server
        //     // if (control === 'init') {
        //     //     return
        //     // }

        //     if (_auth.info && _auth.info.error) {
        //         self.showToast({_uib: {options: {title:'[uibuilder:updateAuth] Error from Server',variant:'danger',noAutoHide:true}}, payload: `${_auth.info.error}<br>No authentication.`})
        //         console.warn('[uibuilder:updateAuth] Error from Server: ', _auth.info.error)
        //         return
        //     }
        //     if ( _auth.id === undefined || _auth.id === null || _auth.id.length === 0 ) {
        //         self.showToast({_uib: {options: {title:'[uibuilder:updateAuth] No auth id supplied by server',variant:'danger',noAutoHide:true}}, payload: 'Ignoring server response<br>No authentication.'})
        //         console.error('[uibuilder:updateAuth] No auth id supplied by server, ignoring server response.')
        //         return
        //     }

        //     if ( ! _auth.info ) _auth.info = self.dummyAuth.info

        //     // Make sure user is valid & jwt is valid and current
        //     if ( _auth.userValidated && _auth.jwt && (new Date(_auth.sessionExpiry) > (new Date())) ) {
        //         self.set('isAuthorised', true) // also triggers event

        //         self.set('_auth', _auth)
        //         // Save updated _auth to localStorage
        //         self.setStore('auth', _auth)

        //         //self.socketOptions.transportOptions.polling.extraHeaders.Authorization = 'Bearer ' + self.authToken
        //     } else {
        //         self.uiDebug('info', '[uibuilderfe:updateAuth] Client not authorised or no JWT', _auth)
        //         self.markLoggedOut('Client: Not authorised or no token received')
        //     }

        // } // ---- End of updateAuth ---- //

        /** Returns a standard msg._auth Object either with valid authToken or none
         * If token has expired, run the logout to invalidate the retained data.
         * @returns {_auth|undefined} _
         */
        // self.sendAuth = function sendAuth() {
        //     // If security is off, don't supply a msg._auth
        //     if (!self.security) return undefined

        //     // If anything goes wrong, don't send _auth to server
        //     try {

        //         if ( self._auth === undefined ) return undefined

        //         // TODO: Remove extra metadata from _auth before sending (info, userValidated, sessionExpiry)
        //         if ( self.isAuthorised ) {

        //             if ( new Date(self._auth.sessionExpiry) > (new Date()) ) {
        //                 return self._auth
        //             }

        //             // Token has expired so mark as logged off
        //             self.markLoggedOut('Automatically logged off. Token expired')
        //         }

        //         //self.uiDebug('info', '[uibuilderfe:sendAuth] Returning. ', self._auth)
        //         return self._auth

        //     } catch(e) {
        //         console.error('[uibuilderfe:sendAuth] Failed to validate auth. Error: ', e.message)
        //         return undefined
        //     }
        // } // ---- End of addAuth ---- //

        //#endregion ==== Security Functions ==== //

        /** Set the default originator. Set to '' to ignore. Used with uib-sender.
         * @param {string} [originator] A Node-RED node ID to return the message to
         */
        self.setOriginator = function setOriginator(originator = '') {
            self.originator = originator
        } // ---- End of setOriginator ---- //

        /** Send a standard or control msg back to Node-RED via Socket.IO
         * NR will generally expect the msg to contain a payload topic
         * @param {object} msgToSend The msg object to send.
         * @param {string} [channel=uiBuilderClient] The Socket.IO channel to use, must be in self.ioChannels or it will be ignored
         * @param {string} [originator] A Node-RED node ID to return the message to
         */
        self.send = function send(msgToSend, channel, originator = '') {
            if ( channel === null || channel === undefined ) channel = self.ioChannels.client

            self.uiDebug('log', '[uibuilderfe:send] Sending msg - Namespace: ' + self.ioNamespace + ', Channel: ' + channel, msgToSend)

            // Make sure msgToSend is an object
            if (channel === self.ioChannels.client) {
                msgToSend = makeMeAnObject(msgToSend, 'payload')
            } else if (channel === self.ioChannels.control) {
                msgToSend = makeMeAnObject(msgToSend, 'uibuilderCtrl')
                if ( ! Object.prototype.hasOwnProperty.call(msgToSend, 'uibuilderCtrl') ) {
                    msgToSend.uibuilderCtrl = 'manual send'
                }
                // help remember where this came from as ctrl msgs can come from server or client
                msgToSend.from = 'client'
            }

            /** since 2020-01-02 Added _socketId which should be the same as the _socketId on the server */
            msgToSend._socketId = self.socket.id

            // Track how many messages have been sent & last msg sent
            if (channel === self.ioChannels.client) {
                self.set('sentMsg', msgToSend)
                self.set('msgsSent', self.msgsSent + 1)
            } else if (channel === self.ioChannels.control) {
                self.set('sentCtrlMsg', msgToSend)
                self.set('msgsSentCtrl', self.msgsSentCtrl + 1)
            }

            // Add the originator metadata if required
            if ( originator === '' && self.originator !== '' ) originator = self.originator
            if ( originator !== '' ) Object.assign(msgToSend, {'_uib': {'originator': originator}})

            self.socket.emit(channel, msgToSend)
        } // --- End of Send Msg Fn --- //

        /** Register on-change event listeners
         * Make it possible to register a function that will be run when the property changes.
         * Note that you can create listeners for non-existant properties becuase
         * Example: uibuilder.onChange('msg', function(newValue){ console.log('uibuilder.msg changed! It is now: ', newValue) })
         *
         * @param {string} prop The property of uibuilder that we want to monitor
         * @param {Function} callback The function that will run when the property changes, parameter is the new value of the property after change
         */
        self.onChange = function onChange(prop, callback) {
            // Note: Property does not have to exist yet

            //self.uiDebug('log', `uibuilderfe:uibuilder:onchange: pushing new callback (event listener) for property: ${prop}`)

            // Create a new array or add to the array of callback functions for the property in the events object
            if (self.events[prop]) {
                self.events[prop].push(callback)
            } else {
                self.events[prop] = [callback]
            }
        } // ---- End of onChange() ---- //

        /** Forcably removes all event listeners from the events array
         * Use if you need to re-initialise the environment
         */
        self.clearEventListeners = function clearEventListeners() {
            self.events = []
        } // ---- End of clearEventListeners() ---- //

        /** Add a new CSS Class to the internal style sheet and create the sheet if needed
         * @param {string[]|string} styleDefs String or string array definition(s) of the new style(s) to add
         */
        self.addCSSClass = function addCSSClass(styleDefs) {

            if ( styleDefs === '' || (typeof styleDefs === 'undefined') ) return
            if ( !Array.isArray(styleDefs) ) styleDefs = [styleDefs]

            self.uiDebug('log', '[uibuilderfe:addCSSClass] style: ' + styleDefs)

            let uibStyle = document.getElementById('uibstyle')
            if ( uibStyle === null ) {
                self.uiDebug('log', '[uibuilderfe:addCSSClass] Adding uibstyle stylesheet')
                uibStyle = document.createElement('style')
                uibStyle.title = uibStyle.id = 'uibstyle'
                //Add to start of head so that user added styles will take preference
                document.head.insertAdjacentElement('afterbegin', uibStyle)
            }

            // @ts-ignore
            const uibStyles = /** @type {CSSStyleSheet} */ (uibStyle.sheet)

            for (const styleDef of styleDefs) {
                self.uiDebug('log', `[uibuilderfe:addCSSClass] Adding style ${styleDef}`)
                uibStyles.insertRule(styleDef)
            }

        } // ---- End of addCSSClass ---- //

        /** Ping/Keep-alive - makes a call back to uibuilder's ExpressJS server and receives a 201 response
         * Can be used to keep sessions alive.
         * @example
         *   uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.
         *   uibuilder.onChange('ping', function(data) {
         *      console.log('pinger', data)
         *   })
         * @param {number} ms Repeat interval in ms
         */
        self.setPing = function setPing(ms = 0) {
            const oReq = new XMLHttpRequest()
            oReq.addEventListener('load', function() {
                const headers = (oReq.getAllResponseHeaders()).split('\r\n')
                //console.log('PING', oReq.status, oReq.getAllResponseHeaders())
                self.set('ping', {
                    success: oReq.status === 201 ? true : false,
                    status: oReq.status,
                    headers: headers,
                })
            })

            if ( self.pingInterval) {
                clearInterval(self.pingInterval)
                delete self.pingInterval
            }

            if ( ms < 1 ) {
                oReq.open('GET', '../uibuilder/ping')
                oReq.send()
            } else {
                self.pingInterval = setInterval(() => {
                    oReq.open('GET', '../uibuilder/ping')
                    oReq.send()
                }, ms)
            }
        } // ---- End of ping ---- //

        //#region ---------- Our own event handling system ---------- //

        self.events = {}  // placeholder for event listener callbacks by property name

        /** Trigger event listener for a given property
         * Called when uibuilder.set is used
         *
         * @param {*} prop The property for which to run the callback functions
         * arguments: Additional arguments contain the value to pass to the event callback (e.g. newValue)
         */
        self.emit = function emit(prop) {
            var evt = self.events[prop]
            if (!evt) {
                return
            }
            var args = Array.prototype.slice.call(arguments, 1)
            for (var i = 0; i < evt.length; i++) {
                evt[i].apply(self, args)
            }
        }

        //#endregion ---------- End of event handling system ---------- //

        //#region ---------- Handle incoming code via received msg ---------- //

        /** Add a new script block to the end of <body> from text or an array of text
         * @param {(string[]|string)} script _
         */
        self.newScript = function newScript(script) {
            if ( self.allowScript !== true ) return
            if ( script === '' || (typeof script === 'undefined') ) return
            //if ( script.constructor === Array ) script.join("\n")

            self.uiDebug('log', 'uibuilderfe: newCode - script: ' + script)
            var newScript = document.createElement('script')
            newScript.type = 'text/javascript'
            newScript.defer = true
            // @ts-ignore
            newScript.textContent = script
            document.getElementsByTagName('body')[0].appendChild(newScript)
        }

        /** Add a new style block to end of <head> from text or an array of text
         * @param {(string[]|string)} style _
         */
        self.newStyle = function newStyle(style) {
            if ( self.allowStyle !== true ) return
            if ( style === '' || (typeof style === 'undefined') ) return

            self.uiDebug('log', 'uibuilderfe: newStyle - style: ' + style)
            const uibStyles = document.createElement('style')
            // @ts-ignore
            uibStyles.textContent = style
            //document.getElementsByTagName('head')[0].appendChild(uibStyles)
            document.head.appendChild(uibStyles)
        }

        //#endregion ---------- End of Handle incoming code via received msg ---------- //

        //#region ---------- Vanilla HTML display functions ---------- //

        /** Simple function to create a overlay toast notification from an incoming msg
         * Called if bootstrap-vue is not available
         * Place inside the uibuilder.on('msg', ...) function
         * param {object} msg A msg from Node-RED with appropriate formatting
         * @param {string} content toast content (may be HMTL string)
         * @param {object} toastOptions Various options that control the display
         */
        self.showToastVanilla = function showToastVanilla(content, toastOptions) {

            // Create a toaster container element if not already created - or get a ref to it
            let toaster = document.getElementById('toaster')
            if ( toaster === null ) {
                toaster = document.createElement('div')
                toaster.id = 'toaster'
                toaster.title = 'Click to clear all notifcations'
                toaster.setAttribute('class', 'uib-toaster')
                toaster.onclick = function() {
                    toaster.remove()
                }
                document.body.insertAdjacentElement('afterbegin', toaster)
            }

            // Create a toast element
            const toast = document.createElement('div')
            toast.title = 'Click to clear this notifcation'
            toast.setAttribute('class', `uib-toast ${toastOptions.variant}`)
            if ( toastOptions.title ) {
                content = `<p class="uib-toast-head">${toastOptions.title}</p><p>${content}</p>`
            }
            toast.innerHTML = content
            toast.onclick = function(evt) {
                evt.stopPropagation()
                toast.remove()
                if ( toaster.childElementCount < 1 ) toaster.remove()
            }
            toaster.insertAdjacentElement(toastOptions.appendToast === true ? 'beforeend' : 'afterbegin', toast)
            // Auto-hide
            if ( toastOptions.autohide === true ) {
                setInterval( () => {
                    toast.remove()
                    if ( toaster.childElementCount < 1 ) toaster.remove()
                }, toastOptions.autoHideDelay)
            }
        }

        //#endregion ---------- Vanilla HTML display functions ---------- //

        self.showToast = function showToast(msg) {
            /** Make sure that we have a msg._uib object */
            if ( ! msg._uib || msg._uib === null || msg._uib.constructor.name !== 'Object' ) {
                console.warn('[uibuilder:toast] Incoming msg requires msg._uib object, cannot create a toast')
                return
            }

            /** Toast options
             * @type {object} toastOptions Optional metadata for the toast.
             * @param {string} [toastOptions.title] Optional title, may be HTML (vNode or array of vNodes)
             * @param {boolean} [toastOptions.appendToast] Optional. Whether to show new toasts below previous ones still on-screen (true). Or to replace previous (false - default)
             * @param {number} [toastOptions.autoHideDelay] Optional. Ms until toast is auto-hidden.
             */
            let toastOptions = {}
            if ( msg._uib.options ) toastOptions = Object.assign({}, msg._uib.options) // Need a copy here otherwise debug output breaks

            /** Main content of the toast
             * @type {string} //|VNode|VNode[]}
             */
            let content = ''

            // Main body content
            if ( msg.payload ) content += msg.payload
            if ( toastOptions.content ) content += toastOptions.content

            // Do we want new toasts to be shown at the bottom of the list (true) instead of the top (false - default)?
            if ( toastOptions.append ) toastOptions.appendToast = toastOptions.append

            // Toasts auto-hide by default after 10s
            if ( toastOptions.noAutohide ) toastOptions.noAutoHide = toastOptions.noAutohide
            if ( toastOptions.noAutoHide ) toastOptions.autohide = !toastOptions.noAutoHide
            if ( ! Object.prototype.hasOwnProperty.call(toastOptions, 'autohide') ) toastOptions.autohide = true
            // If set, number of ms until toast is auto-hidden
            if ( toastOptions.autoHideDelay ) {
                toastOptions.autohide = true
                toastOptions.delay = toastOptions.autoHideDelay
            }
            if ( toastOptions.autohide === true && !toastOptions.autoHideDelay ) toastOptions.autoHideDelay = 10000 // default = 10s

            // Allow for variants
            if ( !toastOptions.variant || !['', 'primary', 'secondary', 'success',  'info', 'warn', 'warning', 'error', 'danger'].includes(toastOptions.variant)) toastOptions.variant = ''

            // Use msg.topic as title if no title provided
            if ( !toastOptions.title && msg.topic ) toastOptions.title = msg.topic

            // Toast wont show anyway if content is empty, may as well warn user
            if ( content === '' ) {
                console.warn('[uibuilder:toast] Toast content is blank. Not shown.')
                return
            }

            // Either Vue/bootstrap-vue or vanilla HTML
            if ( self.vueApp && self.vueApp.$bvToast ) {
                self.uiDebug('[uibuilder:showToast] Bootstrap-Vue available, using to create a toast')
                self.showToastBVue(content, toastOptions)
            } else {
                self.uiDebug('[uibuilder:showToast] Bootstrap-Vue NOT available, creating a vanilla HTML toast')
                self.showToastVanilla(content, toastOptions)
            }
        }

        //#region ---------- VueJS Specific functions ---------- //

        /** Simple function to create a bootstrap-vue toast notification from an incoming msg
         * Requires a reference to a VueJS instance and a msg object from Node-RED.
         * Place inside the uibuilder.on('msg', ...) function inside your Vue app's
         * mounted section.
         * @see https://bootstrap-vue.org/docs/components/toast
         * param {object} msg A msg from Node-RED with appropriate formatting
         * @param {string} content toast content (may be HMTL string)
         * @param {object} toastOptions Various options that control the display
         */
        self.showToastBVue = function showToastBVue(content, toastOptions) {

            // We need self.vueApp to be set
            if ( ! self.vueApp ) {
                console.warn('[uibuilder:toast] Vue app object not available, cannot create a Vue toast, falling back to vanilla.')
                self.showToastVanilla(content, toastOptions)
                return
            }

            /** Make sure that we have Vue loaded with the $bvToast function
             *  That lets us dynamically create a toast object directly in the virtual DOM */
            if ( ! self.vueApp.$bvToast ) {
                console.warn('[uibuilder:toast] bootstrap-vue toast component not available, cannot create a Bootstrap-Vue toast, falling back to vanilla.')
                self.showToastVanilla(content, toastOptions)
                return
            }

            // $createElement is a Vue function that lets you create Vue virtual DOM
            // elements. We use it here to let us render HTML in the toast.
            const h = self.vueApp.$createElement

            // Assume that the input content is or could be HTML. create a virtual DOM element
            const vNodesContent = h(
                'p', {
                    domProps: {
                        innerHTML: content
                    }
                }
            )

            // The title is also allowed to have HTML
            if ( toastOptions.title ) toastOptions.title = h(
                'p', {
                    domProps: {
                        innerHTML: toastOptions.title
                    }
                }
            )

            if (toastOptions.variant === 'error') toastOptions.variant = 'danger'
            if (toastOptions.variant === 'warn') toastOptions.variant = 'warning'
            if (!toastOptions.solid) toastOptions.solid = true

            // Dynamically insert the toast to the virtual DOM
            // Will show at top-right of the HTML element that is the app root
            // unless you include a <b-toaster> element
            self.vueApp.$bvToast.toast(vNodesContent, toastOptions)

        } // --- End of showToastVue() --- //

        /** Simple function to show a bootstrap-vue alert (globalAlerts) */
        self.showAlert = function showAlert() {}

        /** Return a control msg containing the props/attribs/etc of a given Vue Component instance
         * @param {string} componentRef The ref value of the component instance to be queried
         * @returns {object} msg - a uibuilder control msg object
         */
        self.showComponentDetails = function showComponentDetails(componentRef) {
            // Only if Vue is in use and a reference to the Vue master app is available ...
            if ( !self.vueApp ) return

            if ( ! self.vueApp.$refs[componentRef] ) return

            const ref = self.vueApp.$refs[componentRef]

            let msg = {}

            // It is possible that what looks like a component is only a set of HTML elements
            // So we have to test for that.
            if ( ref.$options ) {
                msg = {
                    'uibuilderCtrl': 'vue component details',
                    'componentDetails': {
                        'ref': componentRef,
                        'tag': ref.$options._componentTag,
                        'props': ref.$options._propKeys,
                    },
                }
            } else {
                const warning = `[uibuilderfe:showComponentDetails] ref="${componentRef}" is not a Vue Component. Details cannot be returned.`
                self.uiDebug('warn', warning )
                msg = {
                    'uibuilderCtrl': 'vue component details',
                    'componentDetails': {
                        'warning': warning,
                        'ref': componentRef,
                        'tag': null,
                        'props': null,
                    },
                }
            }

            return msg
        }

        /** @ runtime: If Vue is in use and we have a reference to the main app, this fn can send data and config direct to a Vue componant instance
         *  if that component has been written in the right way.
         * @param {object} msg Message object from Node-RED
         */
        self.onChange('msg', function onMsgRcvd(msg) {
            // Do nothing if the msg doesn't have a _uib property
            if ( !msg._uib ) return

            // Process a client reload request from Node-RED - as the page is reloaded, everything else is ignored
            if ( msg._uib.reload === true ) {
                console.log('reloading')
                location.reload()
            }

            // Do nothing if the msg doesn't have a component ref
            if ( !msg._uib.componentRef ) return

            const componentRef = msg._uib.componentRef

            // Deal with toast requests (notifications)
            if (componentRef === 'globalNotification') {
                self.uiDebug('[uibuilder:internalOnChange] globalNotification triggered - showToast() ')
                // This dynamically inserts a toast into the DOM
                self.showToast(msg)
                return
            }

            // Deal with alert requests
            if (componentRef === 'globalAlert') {
                // This dynamically inserts an alert into the DOM
                self.showAlert(msg)
                return
            }

            //#region ---- Only VueJS specific features from here ---- //

            // Only if Vue is in use and a reference to the Vue master app is available ...
            if ( !self.vueApp ) return
            const vueApp = self.vueApp

            // 1) Return ctrl msg containing component instance details
            if ( msg._uib.requestDetails ) {
                const m = self.showComponentDetails(componentRef)
                if (m) {
                    if (msg.topic) m.topic = msg.topic
                    self.send(m, self.ioChannels.control)
                }
                return
            }

            // 4) Does the component ref exist? Remember to include a ref="xxxx" on each component instance in your html - note: this doesn't always work, depends on component
            if ( componentRef in vueApp.$refs ) {

                /** Copy each prop direct into the component (updates the DOM if needed) */
                if ( msg._uib.options ) {

                    self.uiDebug('log', '🔢📈 new component instance options received for ref', componentRef, ':', msg._uib.options)

                    Object.keys(msg._uib.options).forEach( function(key) {
                        try {
                            vueApp.$set(vueApp.$refs[componentRef], key,  msg._uib.options[key])
                        } catch (e) {
                            self.uiDebug('warn', `[uibuilderfe:internal:onChange] Could not update prop "${key}" for component ref="${componentRef}". Error: ${e.message}`)
                        }
                    })
                }

                /** Also check if the payload exists. If it does, update the components value with it
                 * WARNING: No type or other checking is done - make sure you pass the right data type
                 *          and make sure that custom components check inputs.
                 */
                if ( msg.payload ) {

                    self.uiDebug('log', '🔢📈 new component instance value received for ref', componentRef, ':', msg.payload)

                    // TODO: Not sure this is quite right ...
                    try {
                        vueApp.$refs[componentRef].$props.config.value = msg.payload
                    } catch (e) { /** */ }

                }

            } else {
                const warning = `[uibuilderfe:internal:onChange] ref="${componentRef}" is not a Vue Component. Cannot set props.`
                self.uiDebug('warn', warning )
                const m = {
                    'uibuilderCtrl': 'vue component details',
                    'componentDetails': {
                        'warning': warning,
                        'ref': componentRef,
                        'tag': null,
                        'props': null,
                    },
                }
                if (msg.topic) m.topic = msg.topic
                self.send(m, self.ioChannels.control)
            }

            //#endregion ---- Only VueJS specific features from here ---- //

        }) // ---- End of internal onChange(msg) handler ---- //

        //#endregion ---------- VueJS Specific functions ---------- //

        //#endregion ===== end of internal functions ===== //

        // uiReturn contains a set of functions that are returned when this function self-executes (on-load)
        self.uiReturn = {

            /** Function to set uibuilder properties to a new value. Also triggers any event listeners.
             * This version is for external use and disallows certain properties to be set
             * Example: uibuilder.set('foo', {name:'uibuilder', data:42}); uibuilder.set('oldMsg', uibuilder.get('msg'));
             * @param {string} prop _
             * @param {*} val _
             */
            set: function set(prop, val) {
                /** Add exclusions for protected properties.
                 * Can't use hasOwnProperty or use an allow list as that would exclude new properties
                 * @type {Array}
                 */
                var excluded = [
                    'autoSendReady',
                    'clientId', 'cookies', 'ctrlMsg',
                    'debug',
                    'events',
                    'httpNodeRoot',
                    'ioChannels', 'ioConnected', 'ioNamespace', 'ioPath', 'ioTransport',
                    'isAuthorised', 'isUnminified',
                    'loaded',
                    'msgsCtrl', 'msgsReceived', 'msgsSent', 'msgsSentCtrl', 'moduleName',
                    'retryFactor', 'retryMs',
                    'sentMsg', 'sentCtrlMsg', 'serverTimeOffset', 'socket',
                    'timerid',
                    'url',
                    'version',
                    // Ensure no clashes with internal and external method names
                    'checkConnect', 'checkTimestamp',
                    'emit',
                    'get',
                    'ioSetup',
                    'logon', 'logoff',
                    'markLoggedOut', 'me',
                    'newScript', 'newStyle',
                    'onChange',
                    'self', 'set', 'send', 'sendAuth', 'sendCtrl', 'setIOnamespace', 'showComponentDetails', 'showToast', 'socket',
                    'uiDebug', 'updateAuth',
                    'uiReturn',
                ]
                if (excluded.indexOf(prop) !== -1) {
                    console.warn('[uibuilder:set] Cannot use set() on protected property "' + prop + '"')
                    self.uiDebug('warn', 'uibuilderfe:uibuilder:set: "' + prop + '" is in list of excluded properties, not set')
                    return
                }

                // if setting _auth, make sure it has the right bits in it
                if (prop === '_auth') {
                    if ( (!val.id) || val.id.length === 0 ) {
                        console.warn('[uibuilder:set] _auth must contain a valid _auth.id property')
                        return
                    }
                    if ( !val.info ) val.info = self.dummyAuth.info
                }

                // Set & Trigger this prop's event callbacks (listeners)
                self.set(prop, val)
            },

            /** Function to get the value of a uibuilder property
             * Example: uibuilder.get('msg')
             * @param {string} prop The name of the property to get
             * @returns {*} The current value of the property
             */
            get: function get(prop) {
                /** Add exclusions for protected properties.
                 * Can't use hasOwnProperty or use an allow list as that would exclude new properties
                 * @type {Array}
                 */
                var excluded = [
                    // Exclude internal methods
                    'checkConnect', 'checkTimestamp',
                    'emit',
                    'get',
                    'ioSetup',
                    'logon', 'logoff',
                    'markLoggedOut', 'me',
                    'newScript', 'newStyle',
                    'onChange',
                    'self', 'set', 'send', 'sendAuth', 'sendCtrl', 'setIOnamespace', 'showComponentDetails', 'showToast', 'socket',
                    'uiDebug', 'updateAuth',
                    'uiReturn',
                ]
                if (excluded.indexOf(prop) !== -1) {
                    console.warn('[uibuilder] Cannot use get() on protected property "' + prop + '"')
                    self.uiDebug('warn', 'uibuilderfe:uibuilder:get: "' + prop + '" is in list of excluded properties, not get')
                    return
                }
                //if ( prop !== 'debug' ) self.uiDebug('log', `uibuilderfe:uibuilder:get Property: ${prop}`)
                if ( self[prop] === undefined ) {
                    console.warn('[uibuilder] get() - property "' + prop + '" does not exist')
                }
                return self[prop]
            },

            /** Register on-change event listeners
             * Example: uibuilder.onChange('msg', function(msg){ console.log(msg) })
             */
            onChange: self.onChange,

            /** Forcibly removes all event listeners from the events array
             * Use if you need to re-initialise the environment
             */
            clearEventListeners: self.clearEventListeners,

            /** Helper fn, shortcut to return current value of msg
             * Use instead of having to do: uibuilder.get('msg')
             * Example: console.log( uibuilder.msg )
             *
             * @returns {object} msg
             */
            msg: self.msg,

            /** Helper fn, Send a message to NR
             * @example uibuilder.send({payload:'Hello'})
             * @param {object} msg Message to send
             * @param {string} [originator] A Node-RED node ID to return the message to
             */
            send: function send(msg, originator = '') {
                self.send(msg, self.ioChannels.client, originator)
            },

            setOriginator: self.setOriginator,

            /** Send a control msg to NR
             * @param {object} msg Message to send
             */
            sendCtrl: function sendCtrl(msg) {
                self.send(msg, self.ioChannels.control)
            },

            /** Control auto sending of '' control message
             * @param {boolean} sw True= Send ctrl msg on window.load, false=have to send manually
             */
            autoSendReady: function autoSendReady(sw) {
                if ( sw !== true ) sw = false
                self.autoSendReady = sw
            },

            /** Turn on/off debugging
             * Example: uibuilder.debug(true)
             * @param {boolean} [onOff] Debug flag
             * @returns {boolean|void} If no parameter given, returns current debug state
             */
            debug: function (onOff) {
                if ( typeof onOff === 'undefined' ) return self.debug
                if ( typeof onOff === 'boolean' ) self.debug = onOff
            },

            /** Debugging function
             * Example: uibuilder.debug('info', 'This is an information message to console.log')
             * @param {string} type One of log|error|info|dir
             * @param {*} msg Msg to send to console
             */
            uiDebug: self.uiDebug,

            /** Return self object (if debug true) or module version
             * Use only for debugging as: console.dir(uibuilder.me())
             * @returns {object|string} Returns self object or version string
             **/
            me: self.me,

            /** Startup socket.io comms - must be done manually by user to allow for changes to namespace/path
             * @param {object|string} [namespace] Optional. Object containing ref to vueApp, Object containing settings, or IO Namespace override. changes self.ioNamespace from the default.
             * @param {string=} ioPath Optional. changes self.ioPath from the default
             * @param {object=} vueApp Optional. reference to the VueJS instance
             */
            start: function start(namespace,ioPath,vueApp) {
                if ( self.started === true ) {
                    self.uiDebug('log', '❌ [uibuilderfe:start] Start function already called. Do not call more than once.')
                    return
                }

                self.uiDebug('log', '[uibuilderfe:start] start() called')

                // If 1st param is an object ...
                if ( toString.call(namespace) === '[object Object]' ) {
                    self.uiDebug('log', '✅ [uibuilderfe:start] namespace IS an object!')

                    // Is it the vue instance?
                    if ( namespace._isVue === true ) {
                        self.uiDebug('log', '✅ [uibuilderfe:start] Vue instance object IS available!')
                        vueApp = namespace
                        namespace = undefined
                    } else {
                        // if not vue instance, is it an options object? If so, separate them out
                        if ( namespace.ioPath ) ioPath = namespace.ioPath
                        if ( namespace.vueApp ) vueApp = namespace.vueApp
                        if ( namespace.namespace ) namespace = namespace.namespace // make sure this is the last entry
                        else namespace = undefined // finally reset the namespace var but only if it wasn't in the object
                    }
                } else {
                    // If the 1st param wasn't an object, was the vueApp param provided?
                    if ( ! vueApp ) { // eslint-disable-line no-lonely-if
                        self.uiDebug('log', '❌ [uibuilderfe:start] Vue app not available!')
                    } else if ( toString.call(vueApp) === '[object Object]' && vueApp._isVue === true ) {
                        self.uiDebug('log', '✅ [uibuilderfe:start] Vue instance object IS available!')
                    } else {
                        self.uiDebug('log', '❌ [uibuilderfe:start] Vue instance object not available!')
                        vueApp = undefined
                    }
                }

                self.uiDebug('log', '[uibuilderfe:start] Calling params - namespace', namespace, 'ioPath', ioPath, 'vueApp', vueApp)

                // Save the parameters
                if (namespace !== undefined && namespace !== null) self.ioNamespace = namespace
                if (ioPath !== undefined && ioPath !== null) self.ioPath = ioPath
                if (vueApp !== undefined && vueApp !== null) self.vueApp = vueApp

                self.uiDebug('log', '[uibuilderfe:start] Final Socket.IO params - namespace', self.ioNamespace, 'ioPath', self.ioPath)

                self.ioSetup()

                self.started = true
            },

            /** Send a logon request control message
             * Node-RED will respond with another control msg indicating success or failure,
             * the `isAuthorised` variable is set accordingly to true or false.
             * @param {object} [data] Optional. Logon specific data to be passed to Node-RED
             */
            //logon: self.logon,

            /** Send a logoff request message
             * Note that the local auth data is NOT removed here.
             *   That happens when the client receives the control msg "logged off" from the server.
             */
            //logoff: self.logoff,

            /** Return a control msg containing the props/attribs/etc of a given Vue Component instance
             * @param {string} componentRef The ref value of the component instance to be queried
             * @returns {object} msg - a uibuilder control msg object
             */
            showComponentDetails: self.showComponentDetails,

            /** Display a pop-up notification
             * @see docs/vue-component-handling.md
             * @param {string|html} text Text to show in the notification body. May be HTML. Use options params for more control.
             * @param {string} [ref] Optional. If provided, positions the notification next to the referenced component instance
             * @param {object} [options] Optional. Additional toast options
             */
            // @ts-ignore ts(1005), ts(8010)
            showToast: function(text, ref = 'globalNotification', options = {}) {
                const msg = {
                    '_uib': {
                        'componentRef': ref,
                        'options': options,
                    },
                    'payload': text,
                }
                self.showToast(msg)
            },

            /** Easily send a msg back to Node-RED on a DOM event
             * In HTML: `<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>`
             * In JS methods: `doEvent: uibuilder.eventSend,`
             * All `data-` attributes will be passed back to Node-RED,
             *    use them instead of arguments in the click function
             * @param {MouseEvent|any} domevent DOM Event object
             * @param {string} [originator] A Node-RED node ID to return the message to
             */
            eventSend: function eventSend(domevent, originator = '') {
                // The argument must be a DOM event
                if ( (! domevent.constructor.name.endsWith('Event')) || (! domevent.currentTarget) ) {
                    self.uiDebug('log', '[uibuilderfe:eventSend] ARGUMENT NOT A DOM EVENT - use data attributes not function arguments to pass data')
                    return
                }
                const target = domevent.currentTarget

                // Try to get a meaningful ID. id attrib is highest priority, text content is lowest
                let id = ''
                try { if (target.textContent !== '') id = target.textContent.substring(0,25) } catch (e) { /** */ }
                try { if (target.name !== '') id = target.name } catch (e) { /** */ }
                try { if (target.id !== '') id = target.id } catch (e) { /** */ }

                self.send({
                    topic: self.msg.topic,  // repeats the topic from the last inbound msg if it exists

                    uibDomEvent: {
                        sourceId: id,
                        event: domevent.type,
                    },

                    // Each `data-xxxx` attribute is added as a property
                    // - this may be an empty Object if no data attributes defined
                    payload: target.dataset,
                }, self.ioChannels.client, originator)
            },

            /** auto map msg.topic's to variables */
            //automap: self.automap,

            /** Ping/keep-alive */
            setPing: self.setPing,

        } // --- End of return callback functions --- //

        //#endregion ++++++++++ End of setup ++++++++++ //

        //#region ++++++++++ @ runtime: start of execution ++++++++++ //

        /** At runtime: Are all browser resources loaded?
         * DOMContentLoaded: DOM is ready but external resources may not be loaded yet
         * load: All resources are loaded
         */
        window.addEventListener('load', function() {
            self.uiDebug('debug', 'uibuilderfe:load: All resources loaded')
            self.loaded = true
        })

        //#endregion ++++++++++ end of execution ++++++++++ //

        // @ runtime Make externally available the external methods
        return self.uiReturn

    }).call(root) // --- End of uibuilder function --- //

    /** Allows users to use a noConflict version in case they already have a uibuilder var in the starting context
     * In parent code, use as:
     *    var othername = uibuilder.noConflict()
     *    // the variable uibuilder is back to its old value from here
     * @returns {object} _
     */
    uibuilder.noConflict = function () {
        root.uibuilder = previous_uibuilder
        return uibuilder
    }

    // Makes uibuilder function available to the browser or as a module to Node.js or bundle
    if( typeof exports !== 'undefined' ) {
        // If running bundled code or in Node.js, this exports uibuilder you would need to import or require it
        if( typeof module !== 'undefined' && module.exports ) {
            exports = module.exports = uibuilder
        }
        exports.uibuilder = uibuilder
    } else {
        // If running in browser, this creates window.uibuilder
        root.uibuilder = uibuilder
    }

// eslint-disable-next-line semi
}).call(this); // Pass current context into the IIFE
// --- End of isolation IIFE --- //


// EOF
