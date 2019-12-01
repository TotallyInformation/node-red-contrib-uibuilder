/*
  Copyright (c) 2019 Julian Knight (Totally Information)

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
 * This is the default Front-End JavaScript for uibuilder
 * It provides a number of global objects that can be used in your own javascript.
 * @see the docs folder `./docs/uibuilderfe-js.md` for details of how to use this fully.
 * 
 * Please use the default index.js file for your own code and leave this as-is
 * unless you really need to change something.
 */

'use strict'

// @since 2017-10-17 CL: tell webpack that we need socket.io client if running from webpack build
if (typeof require !== 'undefined'  &&  typeof io === 'undefined') {
    var io = require('socket.io-client')
}

/** Create a single global using "new" with an anonymous function
 * ensures that everything is isolated and only what is returned is accessible
 * Isolate everything
 **/
(function () {
    // Keep a copy of the starting context
    var root = this
    // Keep a copy of anything with a clashing name in the starting context
    var previous_uibuilder = root.uibuilder

    // Create a function with specific "this" context - this is the main code
    // @since 2017-10-14 Replaced "new (function(){})" with "(function(){}).call(root)"
    var uibuilder = (function () {
        // Remember that things have to be defined *before* they are referenced

        // Define polyfill for endsWith for IE
        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1
            }
        }

        var self = this

        //#region ======== Start of setup ======== //

        self.version = '2.0.6'
        self.debug = false // do not change directly - use .debug() method
        self.moduleName  = 'uibuilder' // Must match moduleName in uibuilder.js on the server
        self.isUnminified = /param/.test(function(param) {})

        /** Debugging function
         * @param {string} type One of log|error|warn|info|dir, etc
         * @param {...*} msg Msg(s) to send to console
         * WARNING: ...args is ES6, it doesn't work on IE11
         * @since 2019-02-01 Apply any number of args
         */
        //self.uiDebug = function (type, ...args) {
        self.uiDebug = function () {
            if (!self.debug) return

            var type = arguments[0]

            /** @since v2.0.0-dev3 2019-05-27 changed from ...apply(undefined,...) to ...apply(console,...) Fixes Issue #49 */
            //console[type](...args)
            console[type].apply(console, [].slice.call(arguments, 1))

        } // --- End of debug function --- //

        /** Returns the self object if debugging otherwise just the current version
         * @return {object|string} Returns self or version
        */
        self.me = function() {
            return self.debug === true ? self : 'uibuilderfe.js Version: ' + self.version
        }

        self.uiDebug('log', '\nuibuilderfe: Debug? ', self.debug, '\n\t\tVersion? ', self.version, '\n\t\tRunning Packed version? ', !self.isUnminified, '\n ')


        /** Try to get the Socket.IO namespace from the current URL - won't work if page is in a sub-folder
         * @since 2017-10-21 Improve method to cope with more complex paths - thanks to Steve Rickus @shrickus
         * @since 2017-11-10 v1.0.1 Check cookie first then url. cookie works even if the path is more complex (e.g. sub-folder)
         * @return {string} Socket.IO namespace
         */
        self.setIOnamespace = function () {

            var ioNamespace = ''

            // Try getting the namespace cookie. @since 2017-11-12 v1.0.2 Made capture non-greedy to cope with multiple cookies of same name.
            ioNamespace = document.cookie.replace(/(?:(?:^|.*;\s*)uibuilder-namespace\s*\=\s*([^;]*?).*$)|^.*$/, '$1')

            // if it wasn't available, try using the current url path
            if (ioNamespace === '' ) {
                // split url path & eliminate any blank elements, and trailing or double slashes
                var u = window.location.pathname.split('/').filter(function(t) { return t.trim() !== '' })

                /** @since v2.0.5 Extra check for 0 length, Issue #73. @since 2017-11-06 If the last element of the path is an .html file name, remove it */
                if (u.length > 0) if (u[u.length - 1].endsWith('.html')) u.pop()

                // Socket.IO namespace HAS to start with a leading slash
                ioNamespace = u.join('/')

                self.uiDebug('log', 'uibuilderfe: IO Namespace - Found via url path: ' + ioNamespace)
            } else {
                self.uiDebug('log', 'uibuilderfe: IO Namespace - Found via cookie: ' + ioNamespace)
            }

            // Namespace HAS to start with a /
            ioNamespace = '/' + ioNamespace

            self.uiDebug('log', 'uibuilderfe: IO Namespace: ' + ioNamespace)

            return ioNamespace
        } // --- End of set IO namespace --- //

        //#region --- variables ---
        /** Writable (via custom method. read via .get method) */

        /** Automatically send a "ready for content" control message on window.load
         * Set to false if you want to send this yourself (e.g. when Riot/Moon/etc mounted event triggered)
         * see .autoSendReady method
         */
        self.autoSendReady= true

        /** Externally Writable (via .set method, read via .get method) */
        self.allowScript  = true   // Allow incoming msg to contain msg.script with JavaScript that will be automatically executed
        self.allowStyle   = true   // Allow incoming msg to contain msg.style with CSS that will be automatically executed
        self.removeScript = true   // Delete msg.code after inserting to DOM if it exists on incoming msg
        self.removeStyle  = true   // Delete msg.style after inserting to DOM if it exists on incoming msg

        /** Externally read-only (via .get method) */
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
        // ---- These are unlikely to be needed externally: ----
        self.ioChannels   = { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder' }
        self.retryMs      = 2000                            // starting retry ms period for manual socket reconnections workaround
        self.retryFactor  = 1.5                             // starting delay factor for subsequent reconnect attempts
        self.timerid      = null
        self.ioNamespace  = self.setIOnamespace()           // Get the namespace from the current URL
        self.ioTransport  = ['polling', 'websocket']
        self.loaded       = false                           // Are all browser resources loaded?

        /** Try to make sure client uses Socket.IO version from the uibuilder module (using path) @since v2.0.0 2019-02-24 allows for httpNodeRoot */
        {
            // split current url path, eliminate any blank elements and trailing or double slashes
            var fullPath = window.location.pathname.split('/').filter(function(t) { return t.trim() !== '' })
            /** handle url includes file name - @since v2.0.5 Extra check for 0 length, Issue #73. */
            if (fullPath.length > 0) if (fullPath[fullPath.length - 1].endsWith('.html')) fullPath.pop()
            self.url = fullPath.pop() // not actually used and only gives the last path section of the url anyway
            self.httpNodeRoot = '/' + fullPath.join('/')
            self.ioPath       = urlJoin(self.httpNodeRoot, self.moduleName, 'vendor', 'socket.io')
            self.uiDebug('debug', 'uibuilderfe: ioPath: ' + self.ioPath + ', httpNodeRoot: ' + self.httpNodeRoot + ', uibuilder url (not used): ' + self.url)
        }

        //#endregion --- variables ---

        /** Function to set uibuilder properties to a new value - works on any property - see uiReturn.set also for external use
         * Also triggers any event listeners.
         * Example: self.set('msg', {topic:'uibuilder', payload:42});
         * @param {string} prop
         * @param {*} val
         */
        self.set = function (prop, val) {
            self[prop] = val
            //self.uiDebug('debug', `uibuilderfe: prop set - prop: ${prop}, val: ${(typeof val === 'object') ? JSON.stringify(val) : val}` )
            self.uiDebug('debug', 'uibuilderfe: prop set - prop: ' + prop + ', val: ' + (typeof val === 'object') ? JSON.stringify(val) : val )

            // Trigger this prop's event callbacks (listeners)
            self.emit(prop, val)

            //self.uiDebug('debug', `uibuilderfe:uibuilder:set Property: ${prop}, Value: ${val}`)
        }

        /** Function used to check whether Socket.IO is connected to the server, reconnect if not (recursive)
         * @param {number} delay Initial delay before checking (ms)
         * @param {number} factor Multiplication factor for subsequent checks (delay*factor)
         */
        self.checkConnect = function (delay, factor) {
            var depth = depth++ || 1

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
                self.checkConnect(delay * factor, factor)
            }, delay)
        } // --- End of checkConnect Fn--- //

        /** Check supplied msg from server for a timestamp - if received, work out & store difference to browser time
         * @param {Object} receivedMsg A message object recieved from Node-RED
         * @returns {void} Updates self.serverTimeOffset if different to previous value
         */
        self.checkTimestamp = function (receivedMsg) {
            if ( receivedMsg.hasOwnProperty('serverTimestamp') ) {
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
         * @since v2.0.0-beta2 Moved to a function and called by the user (uibuilder.start()) so that namespace & path can be passed manually if needed
         * @returns {void} Attaches socket.io manager to self.socket and updates self.ioNamespace & self.ioPath as needed
         */
        self.ioSetup = function () {

            // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
            self.uiDebug('debug', 'uibuilderfe:ioSetup: About to create IO. Namespace: ' + self.ioNamespace + ', Path: ' + self.ioPath + ', Transport: [' + self.ioTransport.join(', ') + ']')
            self.socket = io(self.ioNamespace, { 
                path: self.ioPath, 
                transports: self.ioTransport, 
                transportOptions: {
                    // Can only set headers when polling
                    polling: {
                        extraHeaders: {
                            'x-clientid': 'uibuilderfe',
                            Authorization: 'test', //TODO: Replace with self.jwt variable
                        }
                    },
                },
                //extraHeaders: { Authorization: `Bearer ${your_jwt}` } 
            })

            /** When the socket is connected - set ioConnected flag and reset connect timer  */
            self.socket.on('connect', function () {
                self.uiDebug('info', 'uibuilderfe:ioSetup: SOCKET CONNECTED - Namespace: ' + self.ioNamespace, ' Server Channel: ', self.ioChannels.server, ' Control Channel: ', self.ioChannels.control)

                self.set('ioConnected', true)

                // Reset any reconnect timers
                if (self.timerid) {
                    window.clearTimeout(self.timerid)
                    self.timerid = null
                }

            }) // --- End of socket connection processing ---

            // RECEIVE When Node-RED uibuilder node sends a msg over Socket.IO to us ...
            self.socket.on(self.ioChannels.server, function (receivedMsg) {
                self.uiDebug('debug', 'uibuilderfe:ioSetup:' + self.ioChannels.server + ' (server): msg received - Namespace: ' + self.ioNamespace, receivedMsg)

                // Make sure that msg is an object & not null
                receivedMsg = makeMeAnObject(receivedMsg, 'payload')

                // @since 2018-10-07 v1.0.9: Work out local time offset from server
                self.checkTimestamp(receivedMsg)

                // If the msg contains a code property (js), insert to DOM, remove from msg if required
                if ( self.allowScript && receivedMsg.hasOwnProperty('script') ) {
                    self.newScript(receivedMsg.script)
                    if ( self.removeScript ) delete receivedMsg.script
                }
                // If the msg contains a style property (css), insert to DOM, remove from msg if required
                if ( self.allowStyle && receivedMsg.hasOwnProperty('style') ) {
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

            // RECEIVE a CONTROL msg from Node-RED - see also sendCtrl()
            self.socket.on(self.ioChannels.control, function (receivedCtrlMsg) {
                self.uiDebug('debug', 'uibuilder:ioSetup:' + self.ioChannels.control + ' (control): msg received - Namespace: ' + self.ioNamespace, receivedCtrlMsg)

                // Make sure that msg is an object & not null
                if (receivedCtrlMsg === null) {
                    receivedCtrlMsg = {}
                } else if (typeof receivedCtrlMsg !== 'object') {
                    var msg = {}
                    msg['uibuilderCtrl:'+self.ioChannels.control] = receivedCtrlMsg
                    receivedCtrlMsg = msg
                }

                // Allow incoming control msg to change debug state (usually on the connection msg)
                if ( receivedCtrlMsg.hasOwnProperty('debug') ) self.debug = receivedCtrlMsg.debug

                // @since 2018-10-07 v1.0.9: Work out local time offset from server
                self.checkTimestamp(receivedCtrlMsg)

                self.set('ctrlMsg', receivedCtrlMsg)
                self.set('msgsCtrl', self.msgsCtrl + 1)

                switch(receivedCtrlMsg.uibuilderCtrl) {
                    case 'ready for content':
                        self.uiDebug('debug', 'uibuilderfe:ioSetup:' + self.ioChannels.control + ' Received "ready for content" from server')
                        break
                    case 'shutdown':
                        // Node-RED is shutting down
                        self.uiDebug('debug', 'uibuilderfe:ioSetup:' + self.ioChannels.control + ' Received "shutdown" from server')
                        break
                    case 'client connect':
                        // We are connected to the server
                        if ( self.autoSendReady === true ) {
                            self.uiDebug('debug', 'uibuilderfe:ioSetup:' + self.ioChannels.control + ' Received "client connect" from server, auto-sending REPLAY control msg')
            
                            // @since 0.4.8c Add cacheControl property for use with node-red-contrib-infocache
                            self.send({
                                'uibuilderCtrl':'ready for content',
                                'cacheControl':'REPLAY',
                                'from': 'client', // @since 2018-10-07 v1.0.9
                            },self.ioChannels.control)
                        }
                        break
                    default:
                        self.uiDebug('debug', 'uibuilderfe:ioSetup:' + self.ioChannels.control + ' Received "' + receivedCtrlMsg.uibuilderCtrl + '" from server')
                        // Anything else
                } // */

                /* Test auto-response
                    if (self.debug) {
                        self.send({payload: 'We got a control message from you, thanks'})
                    }
                // */

            }) // -- End of websocket receive CONTROL msg from Node-RED -- //

            // When the socket is disconnected ..............
            self.socket.on('disconnect', function (reason) {
                // reason === 'io server disconnect' - redeploy of Node instance
                // reason === 'transport close' - Node-RED terminating
                // reason === 'ping timeout' - didn't receive a pong response?
                self.uiDebug('info', 'uibuilderfe:ioSetup: SOCKET DISCONNECTED - Namespace: ' + self.ioNamespace + ', Reason: ' + reason)

                self.set('ioConnected', false)

                console.warn('[uibuilderfe:socket-disconnect] Reason: ' + reason)

                /** A workaround for SIO's failure to reconnect after a disconnection */
                self.checkConnect(self.retryMs, self.retryFactor)
            }) // --- End of socket disconnect processing ---

            // Socket.io connection error - probably the wrong ioPath
            self.socket.on('connect_error', function(err) {
                self.uiDebug('error', 'uibuilderfe:ioSetup: SOCKET CONNECT ERROR - Namespace: ' + self.ioNamespace + ' ioPath: ' + self.ioPath + ', Reason: ' + err.message)
                //console.dir(err)
            }) // --- End of socket connect error processing ---
            
            // Socket.io error - from the server (socket.use middleware triggered an error response)
            self.socket.on('error', function(err) {
                self.uiDebug('warn', 'uibuilderfe:ioSetup: SOCKET ERROR from server - MESSAGE: ', err)
                //console.dir(err)
            }) // --- End of socket error processing ---

            // Ensure we are connected, retry if not
            self.checkConnect(self.retryMs, self.retryFactor)

            /* We really don't need these, just for interest
                socket.on('connect_timeout', function(timeout) {
                    self.uiDebug('log', 'SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace + ', Timeout: ' + timeout)
                }) // --- End of socket connect timeout processing ---
                socket.on('reconnect', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECTED - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnect processing ---
                socket.on('reconnect_attempt', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECT ATTEMPT - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnect_attempt processing ---
                socket.on('reconnecting', function(attemptNum) {
                    self.uiDebug('log', 'SOCKET RECONNECTING - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
                }) // --- End of socket reconnecting processing ---
                socket.on('reconnect_error', function(err) {
                    self.uiDebug('log', 'SOCKET RECONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
                    //console.dir(err)
                }) // --- End of socket reconnect_error processing ---
                socket.on('reconnect_failed', function() {
                    self.uiDebug('log', 'SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
                }) // --- End of socket reconnect_failed processing ---
                socket.on('ping', function() {
                    self.uiDebug('log', 'SOCKET PING - Namespace: ' + ioNamespace)
                }) // --- End of socket ping processing ---
                socket.on('pong', function(latency) {
                    self.uiDebug('log', 'SOCKET PONG - Namespace: ' + self.ioNamespace + ', Latency: ', latency)
                }) // --- End of socket pong processing ---
            // */
        } // ---- End of ioSetup ---- //
        
        /** Send a standard msg back to Node-RED via Socket.IO
         * NR will generally expect the msg to contain a payload topic
         * @param {Object} msgToSend The msg object to send.
         * @param {string} [channel=uiBuilderClient] The Socket.IO channel to use, must be in self.ioChannels or it will be ignored
         */
        self.send = function (msgToSend, channel) {
            if ( channel === null || channel === undefined ) channel = self.ioChannels.client

            self.uiDebug('log', 'uibuilderfe: sending msg - Namespace: ' + self.ioNamespace + ', Channel: ' + channel, msgToSend)

            // Make sure msgToSend is an object
            if (channel === self.ioChannels.client) {
                msgToSend = makeMeAnObject(msgToSend, 'payload')
            } else if (channel === self.ioChannels.control) {
                msgToSend = makeMeAnObject(msgToSend, 'uibuilderCtrl')
                if ( ! msgToSend.hasOwnProperty('uibuilderCtrl') ) {
                    msgToSend.uibuilderCtrl = 'manual send'
                }
                // help remember where this came from as ctrl msgs can come from server or client
                msgToSend.from = 'client'
            }

            // Track how many messages have been sent & last msg sent
            if (channel === self.ioChannels.client) {
                self.set('sentMsg', msgToSend)
                self.set('msgsSent', self.msgsSent + 1)
            } else if (channel === self.ioChannels.control) {
                self.set('sentCtrlMsg', msgToSend)
                self.set('msgsSentCtrl', self.msgsSentCtrl + 1)
            }

            self.socket.emit(channel, msgToSend)
        } // --- End of Send Msg Fn --- //

        //#region ========== Our own event handling system ========== //

        self.events = {}  // placeholder for event listener callbacks by property name

        /** Trigger event listener for a given property
         * Called when uibuilder.set is used
         *
         * @param {*} prop The property for which to run the callback functions
         * @param arguments Additional arguments contain the value to pass to the event callback (e.g. newValue)
         */
        self.emit = function (prop) {
            var evt = self.events[prop]
            if (!evt) {
                return
            }
            var args = Array.prototype.slice.call(arguments, 1)
            for (var i = 0; i < evt.length; i++) {
                evt[i].apply(self, args)
            }
        }

        //#endregion ========== End of event handling system ========== //

        //#region ========== Handle incoming code via received msg ========== //

        /** Add a new script block to the end of <body> from text or an array of text
         * @param {(string[]|string)} script
         */
        self.newScript = function(script) {
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
         * @param {(string[]|string)} style
         */
        self.newStyle = function(style) {
            if ( self.allowStyle !== true ) return
            if ( style === '' || (typeof style === 'undefined') ) return

            self.uiDebug('log', 'uibuilderfe: newStyle - style: ' + style)
            var newStyle = document.createElement('style')
            // @ts-ignore
            newStyle.textContent = style
            document.getElementsByTagName('head')[0].appendChild(newStyle)
        }

        //#endregion ====== End of Handle incoming code via received msg ====== //

        //#region ========== uibuilder callbacks ========== //

        // uiReturn contains a set of functions that are returned when this function
        // self-executes (on-load)
        self.uiReturn = {

            /** Function to set uibuilder properties to a new value. Also triggers any event listeners.
             * This version is for external use and disallows certain properties to be set
             * Example: uibuilder.set('foo', {name:'uibuilder', data:42}); uibuilder.set('oldMsg', uibuilder.get('msg'));
             * @param {string} prop
             * @param {*} val
             */
            set: function (prop, val) {
                // Add exclusions for protected properties - can't use hasOwnProperty or use an allow list as that would exclude new properties
                var excluded = [
                    'version', 'debug', 'msg', 'ctrlMsg', 'sentMsg', 'msgsSent', 'msgsSentCtrl', 'msgsReceived',
                    'msgsCtrl', 'ioConnected', 'ioChannels', 'retryMs', 'retryFactor', 'timerid', 'ioNamespace',
                    'ioPath', 'ioTransport', 'events', 'autoSendReady',
                    // Ensure no clashes with internal and external method names
                    'set', 'get', 'send', 'sendCtrl', 'onChange', 'socket', 'checkConnect', 'emit', 'uiReturn',
                    'newScript', 'newStyle', 'uiDebug', 'me', 'self', 'setIOnamespace'
                ]
                if (excluded.indexOf(prop) !== -1) {
                    self.uiDebug('warn', 'uibuilderfe:uibuilder:set: "' + prop + '" is in list of excluded properties, not set')
                    return
                }

                // Set & Trigger this prop's event callbacks (listeners)
                self.set(prop, val)
            },

            /** Function to get the value of a uibuilder property
             * Example: uibuilder.get('msg')
             * @param {string} prop The name of the property to get
             * @return {*} The current value of the property
             */
            get: function (prop) {
                //if ( prop !== 'debug' ) self.uiDebug('log', `uibuilderfe:uibuilder:get Property: ${prop}`)
                // TODO: Add warning for non-existent property?
                return self[prop]
            },

            /** Register on-change event listeners
             * Make it possible to register a function that will be run when the property changes.
             * Note that you can create listeners for non-existant properties becuase
             * Example: uibuilder.onChange('msg', function(newValue){ console.log('uibuilder.msg changed! It is now: ', newValue) })
             *
             * @param {string} prop The property of uibuilder that we want to monitor
             * @param {function(*)} callback The function that will run when the property changes, parameter is the new value of the property after change
             */
            onChange: function (prop, callback) {
                // Note: Property does not have to exist yet

                //self.uiDebug('log', `uibuilderfe:uibuilder:onchange: pushing new callback (event listener) for property: ${prop}`)

                // Create a new array or add to the array of callback functions for the property in the events object
                if (self.events[prop]) {
                    self.events[prop].push(callback)
                } else {
                    self.events[prop] = [callback]
                }
            },

            /** Helper fn, shortcut to return current value of msg
             * Use instead of having to do: uibuilder.get('msg')
             * Example: console.log( uibuilder.msg )
             *
             * @return {Object} msg
             */
            msg: self.msg,

            /** Helper fn, Send a message to NR
             * Example: uibuilder.sendMsg({payload:'Hello'})
             */
            send: self.send,
            sendCtrl: function(msg) {
                self.send(msg, self.ioChannels.control)
            },

            /** Control auto sending of '' control message
             * @param {boolean} sw True= Send ctrl msg on window.load, false=have to send manually
             */
            autoSendReady: function(sw) {
                if ( sw !== true ) sw = false
                self.autoSendReady = sw
            },

            /** Turn on/off debugging
             * Example: uibuilder.debug(true)
             * @param {boolean} [onOff] Debug flag
             * @return {boolean|void} If no parameter given, returns current debug state
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
             * @return {object|string} Returns self object or version string
             **/
            me: self.me,

            /** Startup socket.io comms - must be done manually by user to allow for changes to namespace/path 
             * @param {string=} namespace If not blank, changes self.ioNamespace from the default
             * @param {string=} ioPath If not blank, changes self.ioPath from the default
             */
            start: function(namespace,ioPath) {
                //TODO change to options object? What other options would we want?
                if (namespace !== undefined) self.ioNamespace = namespace
                if (ioPath !== undefined) self.ioPath = ioPath

                self.ioSetup()
            },

        } // --- End of return callback functions --- //

        //#endregion ======== End of uibuilder callbacks ======== //

        //#endregion ========== End of setup ========== //

        //#region ======== start of execution ======== //

        /** Are all browser resources loaded?
         * DOMContentLoaded: DOM is ready but external resources may not be loaded yet
         * load: All resources are loaded
         */
         /* document.addEventListener('DOMContentLoaded', function(){
           self.send({'uibuilderCtrl':'DOMContentLoaded'},self.ioChannels.control)
          }) */
        window.addEventListener('load', function(){
            self.uiDebug('debug', 'uibuilderfe:load: All resources loaded')
            self.loaded = true
        })

        //#endregion ======== end of execution ======== //

        // Make externally available the external methods
        return self.uiReturn

    }).call(root) // --- End of uibuilder function --- //

    /** Allows users to use a noConflict version in case they already have a uibuilder var in the starting context
     * In parent code, use as:
     *    var othername = uibuilder.noConflict()
     *    // the variable uibuilder is back to its old value from here
     * @return {object}
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

    /** Makes a null or non-object into an object
     * If not null, moves "thing" to {payload:thing}
     *
     * @param {*} thing Thing to check
     * @param {string} [property='payload'] property that "thing" is moved to if not null and not an object
     * @return {!Object}
     */
    function makeMeAnObject(thing, property) {
        if (property === null || property === undefined) property = 'payload'
        if ( typeof property !== 'string' ) {
            console.warn('[uibuilderfe:makeMeAnObject] WARNING: property parameter must be a string and not: ' + typeof property)
            property = 'payload'
        }
        var out = {}
        if (typeof thing === 'object') { out = thing }
        else if (thing !== null) { out[property] = thing }
        return out
    } // --- End of make me an object --- //

    /** Joins all arguments as a URL string
     * @see http://stackoverflow.com/a/28592528/3016654
     * @since v1.0.10, fixed potential double // issue
     * @arguments {string} URL fragments
     * @returns {string}
     */
    function urlJoin() {
        var paths = Array.prototype.slice.call(arguments)
        var url =
            '/'+paths.map(function(e){
                return e.replace(/^\/|\/$/g,'')
            }).filter(function(e){
                return e
            }).join('/')
        return  url.replace('//','/')
    } // ---- End of urlJoin ---- //

// eslint-disable-next-line semi
}).call(this); // Pass current context into the IIFE
// --- End of isolation IIFE --- //


// EOF
