/*global document */
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
    ioNamespace = '/'+readCookie('uibuilder-namespace')

console.log('ioNameSpace: '+ioNamespace)

// Create the socket
var io = io(ioNamespace, {transports: ['polling', 'websocket']})

// send a msg back to Node-RED
// NR will generally expect the msg to contain a payload topic
// TODO: Needs a restrictor on it so it doesn't trigger on every keypress
var sendMsg = function(msg) {
    // Track how many messages have been sent
    msgCounter.sent++

    io.emit(ioChannels.client, msg)
}

// When the socket is connected .................
io.on('connect', function() {
    debug && console.log('SOCKET CONNECTED - Namespace: ' + ioNamespace)

    // When Node-RED vueui template node sends a msg over Socket.IO...
    io.on(ioChannels.server, function(wsMsg) {
        debug && console.info('uibuilder:io.connect:io.on.data - msg received - Namespace: ' + ioNamespace)
        //console.dir(wsMsg)

        // Only process if the msg actually contains something useful
        // TODO: Check whether msg is an object 
        if ( (wsMsg !== null) && (wsMsg !== '') ) {
            if ( Object.getOwnPropertyNames(wsMsg).length > 0 ) {
                // Track how many messages have been recieved
                msgCounter.data++
            }
        }
    }) // -- End of websocket recieve DATA msg from Node-RED -- //

    // Recieve a CONTROL msg from Node-RED
    io.on(ioChannels.control, function(wsMsg) {
        debug && console.info('uibuilder:io.connect:io.on.control - msg received - Namespace: ' + ioNamespace)
        //console.dir(wsMsg)

        // TODO: Check msg is an object

        switch(wsMsg.type) {
            case 'shutdown':
                // We are shutting down
                break
            default:
                // ???
        }
    }) // -- End of websocket recieve CONTROL msg from Node-RED -- //

}) // --- End of socket connection processing ---

// When the socket is disconnected ..............
io.on('disconnect', function() {
    debug && console.log('SOCKET DISCONNECTED - Namespace: ' + ioNamespace)
}) // --- End of socket disconnect processing ---

// ----- UTILITY FUNCTIONS ----- //
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
