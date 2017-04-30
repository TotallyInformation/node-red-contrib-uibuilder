/*global document,$,window,io */
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

var debug = true,
    ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'},
    msgCounter = {control: 0, sent: 0, data: 0},
    msg = {},
    cookies = [],
    ioNamespace = '/' + readCookie('uibuilder-namespace'),
    socket

// When JQuery is ready, update
$( document ).ready(function() {
    debug && console.log('Document Ready: IO Namespace: ' + ioNamespace)

    // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
    socket = io(ioNamespace, {
        path: '/uibuilder/socket.io', 
        transports: ['polling', 'websocket']
    })

    $('#msgsReceived').text(msgCounter.data)
    $('#msgsControl').text(msgCounter.control)
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsg').text(JSON.stringify(msg))

    // When the socket is connected .................
    socket.on('connect', function(data) {
        debug && console.log('SOCKET CONNECTED - Namespace: ' + ioNamespace)
        console.dir(data)

        // When Node-RED uibuilder template node sends a msg over Socket.IO...
        socket.on(ioChannels.server, function(wsMsg) {
            debug && console.info('uibuilder:socket.connect:socket.on.data - msg received - Namespace: ' + ioNamespace)
            //console.dir(wsMsg)

            // Make sure that msg is an object & not null
            if ( wsMsg === null ) {
                wsMsg = {}
            } else if ( typeof wsMsg !== 'object' ) {
                wsMsg = { 'payload': wsMsg }
            }

            // Save the msg for further processing
            msg = wsMsg

            // Track how many messages have been recieved
            msgCounter.data++
            $('#msgsReceived').text(msgCounter.data)
            $('#showMsg').text(JSON.stringify(msg))

            // TODO: Add a check for a pre-defined global function here
            //       to make it easier for users to add their own code
            //       to process reciept of new msg
            //       OR MAYBE use msg.prototype to add a function?

            // Test auto-response
            if (debug) {
                wsMsg.payload = 'We got a message from you, thanks'
                sendMsg(wsMsg)
            }

        }) // -- End of websocket recieve DATA msg from Node-RED -- //

        // Recieve a CONTROL msg from Node-RED
        socket.on(ioChannels.control, function(wsMsg) {
            debug && console.info('uibuilder:socket.connect:socket.on.control - msg received - Namespace: ' + ioNamespace)
            //console.dir(wsMsg)


            // Make sure that msg is an object & not null
            if ( wsMsg === null ) {
                wsMsg = {}
            } else if ( typeof wsMsg !== 'object' ) {
                wsMsg = { 'payload': wsMsg }
            }

            msgCounter.control++
            $('#msgsControl').text(msgCounter.control)
            $('#showMsg').text(JSON.stringify(wsMsg))

            switch(wsMsg.type) {
                case 'shutdown':
                    // We are shutting down
                    break
                case 'connected':
                    // We are connected to the server
                    break
                default:
                    // Anything else
            }

            // Test auto-response
            if (debug) {
                wsMsg.payload = 'We got a control message from you, thanks'
                sendMsg(wsMsg)
            }

        }) // -- End of websocket recieve CONTROL msg from Node-RED -- //

    }) // --- End of socket connection processing ---

    // When the socket is disconnected ..............
    socket.on('disconnect', function(data) {
        debug && console.log('SOCKET DISCONNECTED - Namespace: ' + ioNamespace)
        console.dir(data)

        //socket = io(ioNamespace, {path: window.location.pathname + 'socket.io', transports: ['polling', 'websocket']})
    }) // --- End of socket disconnect processing ---

    socket.on('end', function(data) {
        debug && console.log('SOCKET END - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket end processing ---

    socket.on('connect_error', function(err) {
        debug && console.log('SOCKET CONNECT ERROR - Namespace: ' + ioNamespace)
        console.dir(err)
    }) // --- End of socket connect error processing ---

    socket.on('connect_timeout', function(data) {
        debug && console.log('SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket connect timeout processing ---

    socket.on('reconnect', function(attemptNumber) {
        debug && console.log('SOCKET RECONNECT - Namespace: ' + ioNamespace)
        console.dir(attemptNumber)
    }) // --- End of socket reconnect processing ---

    socket.on('reconnect_attempt', function(data) {
        debug && console.log('SOCKET RECONNECT ATTEMPT - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket reconnect_attempt processing ---

    socket.on('reconnecting', function(data) {
        debug && console.log('SOCKET RECONNECTING - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket reconnecting processing ---

    socket.on('reconnect_error', function(data) {
        debug && console.log('SOCKET RECONNECT ERROR - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket reconnect_error processing ---

    socket.on('reconnect_failed', function(data) {
        debug && console.log('SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket reconnect_failed processing ---

    /*
    socket.on('ping', function() {
        debug && console.log('SOCKET PING - Namespace: ' + ioNamespace)
    }) // --- End of socket ping processing ---

    socket.on('pong', function(data) {
        debug && console.log('SOCKET PONG - Namespace: ' + ioNamespace + ', Data: ' + data)
    }) // --- End of socket pong processing ---
    */
});

// ----- UTILITY FUNCTIONS ----- //
// send a msg back to Node-RED, NR will generally expect the msg to contain a payload topic
var sendMsg = function(msg) {
    // Track how many messages have been sent
    msgCounter.sent++
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsgSent').text(JSON.stringify(msg))

    socket.emit(ioChannels.client, msg)
} // --- End of Send Msg Fn --- //

function readCookie(name,c,C,i){
    // @see http://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript
    if(cookies.length > 0){ return cookies[name]; }

    c = document.cookie.split('; ');
    cookies = {};

    for(i=c.length-1; i>=0; i--){
        C = c[i].split('=');
        cookies[C[0]] = C[1];
    }

    return cookies[name];
}
// ----------------------------- //

// EOF
