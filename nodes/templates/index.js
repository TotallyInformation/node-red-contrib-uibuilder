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
/**
 * This is the default, template Front-End JavaScript for uibuilder
 * It is usable as is though you will want to add your own code to
 * process incoming and outgoing messages.
 */

const debug = true,
      ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'},
      msgCounter = {control: 0, sent: 0, data: 0}
      //cookies = []

var timerid,
    msg = {},
    ioNamespace = '', // '/' + readCookie('uibuilder-namespace'),
    socket,
    retryMs = 2000 // retry ms period for manual socket reconnections workaround

// Get the namespace from the current URL rather than a cookie which seems unreliable
// if last element is '', take [-1]
var u = window.location.pathname.split('/')
ioNamespace = u.pop()
if (ioNamespace === '') ioNamespace = u.pop()
// Socket.IO namespace HAS to start with a leading slash
ioNamespace = '/' + ioNamespace

debug && console.log('IO Namespace: ' + ioNamespace)

// Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
socket = io(ioNamespace, {
    path: '/uibuilder/socket.io',
    transports: ['polling', 'websocket']
})

checkConnect(2000, 1.5)

// When the socket is connected .................
var ioConnected = false
socket.on('connect', function() {
    debug && console.log('SOCKET CONNECTED - Namespace: ' + ioNamespace)

    ioConnected = true
    $('#socketConnectedState').text('Connected')

    // Reset any reconnect timers
    if (timerid) {
        window.clearTimeout(timerid)
        retryMs = 2000
        timerid = null
    }

}) // --- End of socket connection processing ---

// When Node-RED uibuilder node sends a msg over Socket.IO to us ...
socket.on(ioChannels.server, function(receivedMsg) {
    debug && console.info('uibuilder:socket.on.server - msg received - Namespace: ' + ioNamespace)
    debug && console.dir(receivedMsg)

    // Make sure that msg is an object & not null
    if ( receivedMsg === null ) {
        receivedMsg = {}
    } else if ( typeof receivedMsg !== 'object' ) {
        receivedMsg = { 'payload': receivedMsg }
    }

    // Save the msg for further processing
    msg = receivedMsg

    // Track how many messages have been received
    msgCounter.data++

    // TODO: Add a check for a pre-defined global function here
    //       to make it easier for users to add their own code
    //       to process receipt of new msg
    //       OR MAYBE use msg.prototype to add a function?
    $('#msgsReceived').text(msgCounter.data)
    $('#showMsg').text(JSON.stringify(msg))

    // Test auto-response - not really required but useful when getting started
    if (debug) {
        sendMsg({payload: 'We got a message from you, thanks'})
    }

}) // -- End of websocket receive DATA msg from Node-RED -- //

// Receive a CONTROL msg from Node-RED
socket.on(ioChannels.control, function(receivedCtrlMsg) {
    debug && console.info('uibuilder:socket.on.control - msg received - Namespace: ' + ioNamespace)
    debug && console.dir(receivedCtrlMsg)


    // Make sure that msg is an object & not null
    if ( receivedCtrlMsg === null ) {
        receivedCtrlMsg = {}
    } else if ( typeof receivedCtrlMsg !== 'object' ) {
        receivedCtrlMsg = { 'payload': receivedCtrlMsg }
    }

    msgCounter.control++
    $('#msgsControl').text(msgCounter.control)
    $('#showMsg').text(JSON.stringify(receivedCtrlMsg))

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

    // Test auto-response
    if (debug) {
        sendMsg({payload: 'We got a control message from you, thanks'})
    }

}) // -- End of websocket receive CONTROL msg from Node-RED -- //

// When the socket is disconnected ..............
socket.on('disconnect', function(reason) {
    // reason === 'io server disconnect' - redeploy of Node instance
    // reason === 'transport close' - Node-RED terminating
    // reason === 'ping timeout' - didn't receive a pong response?
    debug && console.log('SOCKET DISCONNECTED - Namespace: ' + ioNamespace + ', Reason: ' + reason)

    ioConnected = false
    $('#socketConnectedState').text('Disconnected')

    // A workaround for SIO's failure to reconnect after a NR redeploy of the node instance
    if ( reason === 'io server disconnect' ) {
        checkConnect(2000, 1.5)
    }
}) // --- End of socket disconnect processing ---

/* We really don't need these, just for interest
    socket.on('connect_error', function(err) {
        debug && console.log('SOCKET CONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
        //console.dir(err)
    }) // --- End of socket connect error processing ---
    socket.on('connect_timeout', function(data) {
        debug && console.log('SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket connect timeout processing ---
    socket.on('reconnect', function(attemptNum) {
        debug && console.log('SOCKET RECONNECTED - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
    }) // --- End of socket reconnect processing ---
    socket.on('reconnect_attempt', function(attemptNum) {
        debug && console.log('SOCKET RECONNECT ATTEMPT - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
    }) // --- End of socket reconnect_attempt processing ---
    socket.on('reconnecting', function(attemptNum) {
        debug && console.log('SOCKET RECONNECTING - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
    }) // --- End of socket reconnecting processing ---
    socket.on('reconnect_error', function(err) {
        debug && console.log('SOCKET RECONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
        //console.dir(err)
    }) // --- End of socket reconnect_error processing ---
    socket.on('reconnect_failed', function(data) {
        debug && console.log('SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
        console.dir(data)
    }) // --- End of socket reconnect_failed processing ---
    socket.on('ping', function() {
        debug && console.log('SOCKET PING - Namespace: ' + ioNamespace)
    }) // --- End of socket ping processing ---
    socket.on('pong', function(data) {
        debug && console.log('SOCKET PONG - Namespace: ' + ioNamespace + ', Data: ' + data)
    }) // --- End of socket pong processing ---
*/

// When JQuery is ready, update
$( document ).ready(function() {
    debug && console.log('Document Ready: IO Namespace: ' + ioNamespace)

    $('#socketConnectedState').text('Disconnected')
    $('#msgsReceived').text(msgCounter.data)
    $('#msgsControl').text(msgCounter.control)
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsg').text(JSON.stringify(msg))


})

// ----- UTILITY FUNCTIONS ----- //
// try to reconnect to Socket.IO after specified delay (msec) and then wait delay * factor and try again, and again...
function checkConnect(delay, factor) {
    var depth = depth++ || 1
    debug && console.log('checkConnect. Depth: ', depth, ' , Delay: ', delay, ', Factor: ', factor)
    if (timerid) window.clearTimeout(timerid) // we only want one running at a time
    timerid = window.setTimeout(function(){
        debug && console.log('checkConnect timeout. SIO reconnect attempt, timeout: ' + delay + ', depth: ' + depth)
        // don't need to check whether we have connected as the timer will have been cleared if we have
        socket.close()    // this is necessary sometimes when the socket fails to connect on startup
        socket.connect()  // Try to reconnect
        timerid = null
        checkConnect(delay*factor, factor) // extend timer for next time round
    }, delay)
} // --- End of checkConnect Fn--- //

// send a msg back to Node-RED, NR will generally expect the msg to contain a payload topic
function sendMsg(msgToSend) {
    debug && console.info('uibuilder:msg sent - Namespace: ' + ioNamespace)
    debug && console.dir(msgToSend)

    // Track how many messages have been sent
    msgCounter.sent++
    $('#msgsSent').text(msgCounter.sent)
    $('#showMsgSent').text(JSON.stringify(msgToSend))

    socket.emit(ioChannels.client, msgToSend)
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
