/*global document,window,io */
/*
  Copyright (c) 2017 Julian Knight (Totally Information)

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
 * Please use the default index.js file for your own code and leave this as-is
 * unless you really need to change something.
 * See the master template index.js file for how to use.
 * Inspiration for this came from:
 * // @see https://ponyfoo.com/articles/a-less-convoluted-event-emitter-implementation
 * // @see https://gist.github.com/wildlyinaccurate/3209556
 *
 *   uibuilder: The main global object containing the following...
 *     Methods:
 *       .onChange(attribute, callbackFn) - listen for changes to attribute and execute callback when it changes
 *       .get(attribute)        - Get any available attribute
 *       .set(attribute, value) - Set any available attribute (can't overwrite internal attributes)
 *       .msg                   - Shortcut to get the latest value of msg. Equivalent to uibuilder.get('msg')
 *       .send(msg)             - Shortcut to send a msg back to Node-RED manually
 *       .debug(true/false)     - Turn on/off debugging
 *       .uiDebug(type,msg)     - Utility function: Send debug msg to console (type=[log,info,warn,error,dir])
 *     Attributes with change events (only accessible via .get method except for msg)
 *       .msg          - Copy of the last msg sent from Node-RED over Socket.IO
 *       .sentMsg      - Copy of the last msg sent by us to Node-RED
 *       .ctrlMsg      - Copy of the last control msg received by us from Node-RED (Types: ['shutdown','server connected'])
 *       .msgsReceived - How many standard messages have we received
 *       .msgsSent     - How many messages have we sent
 *       .msgsCtrl     - How many control messages have we received
 *       .ioConnected  - Is Socket.IO connected right now? (true/false)
 *     Attributes without change events
 *           (only accessible via .get method, reload page to get changes, don't change unless you know what you are doing)
 *       .debug       - true/false, controls debug console logging output
 *       ---- You are not likely to need any of these ----
 *       .version     - check the current version of the uibuilder code
 *       .ioChannels  - List of the channel names in use [uiBuilderControl, uiBuilderClient, uiBuilder]
 *       .retryMs     - starting retry ms period for manual socket reconnections workaround
 *       .retryFactor - starting delay factor for subsequent reconnect attempts
 *       .ioNamespace - Get the namespace from the current URL
 *       .ioPath      - make sure client uses Socket.IO version from the uibuilder module (using path)
 *       .ioTransport - ['polling', 'websocket']
 *
 *   makeMeAnObject(thing, attribute='payload') - Utility function: make sure that 'thing' is an object
 */

const uibuilder = function () {
    // Remember that things have to be defined before they are referenced

    const self  = this

    self.version     = '0.4.2'
    self.debug       = false

    /** Debugging function
     * @param {string} type One of log|error|warn|info|dir
     * @param {any} msg Msg to send to console
     */
    self.uiDebug = function(type,msg) {
        if ( !self.debug ) return

        let myLog = {}
        switch ( type ) {
            case 'error':
                myLog = console.error
                break
            case 'warn':
                myLog = console.warn
                break
            case 'info':
                myLog = console.info
                break
            case 'dir':
                myLog = console.dir
                break
            default:
                myLog = console.log
        }

        myLog(msg)
    } // --- End of debug function --- //

    /** Get the Socket.IO namespace from the current URL
     * @returns {string} Socket.IO namespace
     */
    self.setIOnamespace = function() {
        var u = window.location.pathname.split('/')

        //if last element is '', take [-1]
        var ioNamespace = u.pop()
        if (ioNamespace === '') ioNamespace = u.pop()

        self.uiDebug('log', 'uibuilderfe: IO Namespace: /' + ioNamespace)

        // Socket.IO namespace HAS to start with a leading slash
        return '/' + ioNamespace
    } // --- End of set IO namespace --- //

    self.msg         = {}                           // msg object. Updated on receipt of a Socket.IO msg (server channel).
    self.ctrlMsg     = {}                           // control msg object. Updated on receipt of a Socket.IO control msg (control channel).
    self.sentMsg     = {}

    self.msgsSent    = 0
    self.msgsReceived= 0
    self.msgsCtrl    = 0

    self.ioChannels  = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}
    self.retryMs     = 2000                                                                            // starting retry ms period for manual socket reconnections workaround
    self.retryFactor = 1.5                                                                             // starting delay factor for subsequent reconnect attempts
    self.timerid     = null
    self.ioNamespace = self.setIOnamespace()       // Get the namespace from the current URL
    self.ioPath      = '/uibuilder/socket.io'      // make sure client uses Socket.IO version from the uibuilder module (using path)
    self.ioTransport = ['polling', 'websocket']
    self.ioConnected = false

    /** Function to set uibuilder properties to a new value - works on any property - see uiReturn.set also for external use
     * Also triggers any event listeners.
     * Example: self.set('msg', {topic:'uibuilder', payload:42});
     * @param {string} prop
     * @param {any} val
     */
    self.set = function(prop, val) {
        self[prop] = val

        // Trigger this prop's event callbacks (listeners)
        self.emit(prop, val)

        //self.uiDebug('log', `uibuilderfe:uibuilder:set Property: ${prop}, Value: ${val}`)
    },

    // ========== Socket.IO processing ========== //

    // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
    self.socket      = io(self.ioNamespace, { path: self.ioPath, transports: self.ioTransport })

    /** Check whether Socket.IO is connected to the server, reconnect if not (recursive)
     *
     * @param {integer} delay Initial delay before checking (ms)
     * @param {integer} factor Multiplication factor for subsequent checks (delay*factor)
     */
    self.checkConnect = function(delay, factor) {
        var depth = depth++ || 1
        self.uiDebug('log', 'checkConnect. Depth: ', depth, ' , Delay: ', delay, ', Factor: ', factor)
        if (self.timerid) window.clearTimeout(self.timerid) // we only want one running at a time
        self.timerid = window.setTimeout(function(){
            self.uiDebug('log', 'checkConnect timeout. SIO reconnect attempt, timeout: ' + delay + ', depth: ' + depth)
            // don't need to check whether we have connected as the timer will have been cleared if we have
            self.socket.close()    // this is necessary sometimes when the socket fails to connect on startup
            self.socket.connect()  // Try to reconnect
            self.timerid = null
            self.checkConnect(delay*factor, factor) // extend timer for next time round
        }, delay)
    } // --- End of checkConnect Fn--- //

    // When the socket is connected ...
    self.socket.on('connect', function() {
        self.uiDebug('log', 'uibuilderfe: SOCKET CONNECTED - Namespace: ' + self.ioNamespace)

        self.set('ioConnected', true)

        // Reset any reconnect timers
        if (self.timerid) {
            window.clearTimeout(self.timerid)
            self.timerid = null
        }

    }) // --- End of socket connection processing ---

    // When Node-RED uibuilder node sends a msg over Socket.IO to us ...
    self.socket.on(self.ioChannels.server, function(receivedMsg) {
        self.uiDebug('info', 'uibuilderfe: socket.on.server - msg received - Namespace: ' + self.ioNamespace)
        self.uiDebug('dir', receivedMsg)

        // Make sure that msg is an object & not null
        receivedMsg = makeMeAnObject( receivedMsg, 'payload' )

        // Save the msg for further processing
        self.set('msg', receivedMsg)

        // Track how many messages have been received
        self.set('msgsReceived', self.msgsReceived + 1)

        // Test auto-response - not really required but useful when getting started
        //if (self.debug) {
        //    self.send({payload: 'From: uibuilderfe - we got a message from you, thanks'})
        //}

    }) // -- End of websocket receive DATA msg from Node-RED -- //

    // Receive a CONTROL msg from Node-RED
    self.socket.on(self.ioChannels.control, function(receivedCtrlMsg) {
        self.uiDebug('info', 'uibuilder:socket.on.control - msg received - Namespace: ' + self.ioNamespace)
        self.uiDebug('dir', receivedCtrlMsg)

        // Make sure that msg is an object & not null
        if ( receivedCtrlMsg === null ) {
            receivedCtrlMsg = {}
        } else if ( typeof receivedCtrlMsg !== 'object' ) {
            receivedCtrlMsg = { 'payload': receivedCtrlMsg }
        }

        self.set('ctrlMsg', receivedCtrlMsg)
        self.set('msgsCtrl', self.msgsCtrl + 1)

        /*
        switch(receivedCtrlMsg.type) {
            case 'shutdown':
                // Node-RED is shutting down
                break
            case 'server connected':
                // We are connected to the server
                break
            default:
                // Anything else
        }
        */

        // Test auto-response
        //if (self.debug) {
        //    self.send({payload: 'We got a control message from you, thanks'})
        //}

    }) // -- End of websocket receive CONTROL msg from Node-RED -- //

    // When the socket is disconnected ..............
    self.socket.on('disconnect', function(reason) {
        // reason === 'io server disconnect' - redeploy of Node instance
        // reason === 'transport close' - Node-RED terminating
        // reason === 'ping timeout' - didn't receive a pong response?
        self.uiDebug('log', 'SOCKET DISCONNECTED - Namespace: ' + self.ioNamespace + ', Reason: ' + reason)

        self.set('ioConnected', false)

        // A workaround for SIO's failure to reconnect after a NR redeploy of the node instance
        if ( reason === 'io server disconnect' ) {
            self.checkConnect(self.retryMs, self.retryFactor)
        }
    }) // --- End of socket disconnect processing ---

    /* We really don't need these, just for interest
        socket.on('connect_error', function(err) {
            self.uiDebug('log', 'SOCKET CONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
            //console.dir(err)
        }) // --- End of socket connect error processing ---
        socket.on('connect_timeout', function(data) {
            self.uiDebug('log', 'SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace)
            console.dir(data)
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
        socket.on('reconnect_failed', function(data) {
            self.uiDebug('log', 'SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
            console.dir(data)
        }) // --- End of socket reconnect_failed processing ---
        socket.on('ping', function() {
            self.uiDebug('log', 'SOCKET PING - Namespace: ' + ioNamespace)
        }) // --- End of socket ping processing ---
        socket.on('pong', function(data) {
            self.uiDebug('log', 'SOCKET PONG - Namespace: ' + ioNamespace + ', Data: ' + data)
        }) // --- End of socket pong processing ---
    */

    /** Send msg back to Node-RED via Socket.IO
     * NR will generally expect the msg to contain a payload topic
     * @param {object} msgToSend The msg object to send.
     */
    self.send = function(msgToSend) {
        self.uiDebug('info', 'uibuilderfe: msg sent - Namespace: ' + self.ioNamespace)
        self.uiDebug('dir', msgToSend)

        // @TODO: Make sure msgToSend is an object

        // Track how many messages have been sent
        self.set('sentMsg', msgToSend)
        self.set('msgsSent', self.msgsSent + 1)

        self.socket.emit(self.ioChannels.client, msgToSend)
    } // --- End of Send Msg Fn --- //

    // ========== Our own event handling system ========== //

    self.events = {}  // placeholder for event listener callbacks by property name

    /** Trigger event listener for a given property
     * Called when uibuilder.set is used
     *
     * @param {any} prop The property for which to run the callback functions
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

    // ========== uibuilder callbacks ========== //

    // uiReturn contains a set of functions that are returned when this function
    // self-executes (on-load)
    self.uiReturn = {

        /** Function to set uibuilder properties to a new value. Also triggers any event listeners.
         * This version is for external use and disallows certain attributes to be set
         * Example: uibuilder.set('foo', {name:'uibuilder', data:42}); uibuilder.set('oldMsg', uibuilder.get('msg'));
         * @param {string} prop
         * @param {any} val
         */
        set : function(prop, val) {
            // TODO: Add exclusions for protected properties
            let excluded = [
                'version', 'msg', 'ctrlMsg', 'sentMsg', 'msgsSent', 'msgsReceived', 'msgsCtrl', 'ioChannels',
                'retryMs', 'retryFactor', 'timerid', 'ioNamespace', 'ioPath', 'ioTransport', 'ioConnected',
                'set', 'get', 'debug', 'send', 'onChange', 'socket', 'checkConnect', 'events', 'emit', 'uiReturn'
            ]
            if ( excluded.indexOf(prop) !== -1 ) {
                self.uiDebug('warn', `uibuilderfe:uibuilder:set: '${prop}' is in list of excluded attributes, not set`)
                return
            }

            // Set & Trigger this prop's event callbacks (listeners)
            self.set(prop, val)
        },

        /** Function to get the value of a uibuilder property
         * Example: uibuilder.get('msg')
         * @param {string} prop The name of the property to get
         * @returns {any} The current value of the property
         */
        get : function(prop) {
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
         * @param {function} callback The function that will run when the property changes
         */
        onChange : function(prop, callback) {
            // Note: Property does not have to exist yet

            //self.uiDebug('log', `uibuilderfe:uibuilder:onchange: pushing new callback (even listener) for property: ${prop}`)

            // Create a new array or add to the array of callback functions for the property in the events object
            if ( self.events[prop] ) {
                self.events[prop].push(callback)
            } else {
                self.events[prop] = [callback]
            }
        },

        /** Helper fn, shortcut to return current value of msg
         * Use instead of having to do: uibuilder.get('msg')
         * Example: console.log( uibuilder.msg )
         *
         * @returns {object} msg
         */
        msg : self.msg,

        /** Helper fn, Send a message to NR
         * Example: uibuilder.sendMsg({payload:'Hello'})
         */
        send : self.send,

        /** Turn on/off debugging
         * Example: uibuilder.debug(true)
         * @param {boolean} onOff Flag
         */
        debug: function(onOff) {
            self.debug = onOff
        },

        /** Debugging function
         * Example: uibuilder.debug('info', 'This is an information message to console.log')
         * @param {string} type One of log|error|info|dir
         * @param {any} msg Msg to send to console
         */
        uiDebug: self.uiDebug

    } // --- End of return callback functions --- //

    // ========== End of setup, start execution ========== //

    // Repeatedly check & retry connection until connected (async)
    self.checkConnect(self.retryMs, self.retryFactor)

    // Make externally available the external methods
    return self.uiReturn

}(); // --- End of uibuilder self-executing function --- //


// ========== UTILITY FUNCTIONS ========== //

/** Makes a null or non-object into an object
 * If not null, moves "thing" to {payload:thing}
 *
 * @param {any} thing Thing to check
 * @param {string} [attribute='payload'] Attribute that "thing" is moved to if not null and not an object
 * @returns {object}
 */
function makeMeAnObject(thing, attribute='payload') {

    if ( thing === null ) {
        thing = {}
    } else if ( typeof thing !== 'object' ) {
        thing = { attribute : thing }
    }

    return thing
} // --- End of make me an object --- //

// EOF
