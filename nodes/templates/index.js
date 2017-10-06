/*global document,$,window,uibuilder */
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

// When JQuery is ready, update
$( document ).ready(function() {
    // Initial set
    $('#msgsReceived').text( uibuilder.get('msgsReceived') )
    $('#msgsControl').text( uibuilder.get('msgsCtrl') )
    $('#msgsSent').text( uibuilder.get('msgsSent') )
    $('#socketConnectedState').text( uibuilder.get('ioConnected') )
    $('#feVersion').text( uibuilder.get('version') )

    // Turn on debugging (default is off)
    uibuilder.debug(true)

    // If msg changes - msg is updated when a standard msg is received from Node-RED over Socket.IO
    // Note that you can also listen for 'msgsReceived' as they are updated at the same time
    // but newVal relates to the attribute being listened to.
    uibuilder.onChange('msg', function(newVal){
        console.info('property msg changed!')
        console.dir(newVal)
        $('#showMsg').text(JSON.stringify(newVal))
        //uibuilder.set('msgCopy', newVal)
    })

    // You can get attributes manually. Non-existent attributes return 'undefined'
    //console.dir(uibuilder.get('msg'))

    // You can also set things manually. See the list of attributes top of page.
    // You can add arbitrary attributes to the object, you cannot overwrite internal attributes

    // Try setting a restricted, internal attribute - see the warning in the browser console
    uibuilder.set('msg', 'You tried but failed!')

    // Remember that onChange functions don't trigger if you haven't set them
    // up BEFORE an attribute change.
    uibuilder.onChange('msgCopy', function(newVal){
        console.info('msgCopy changed. New value: ', newVal)
    })

    // Now try setting a new attribute - this will be an empty object because
    // msg won't yet have been received
    uibuilder.set('msgCopy', uibuilder.msg)
    // Hint: Try putting this set into the onChange for 'msg'

    // As noted, we could get the msg here too
    uibuilder.onChange('msgsReceived', function(newVal){
        console.info('New msg sent to us from Node-RED over Socket.IO. Total Count: ', newVal)
        $('#msgsReceived').text(newVal)
        // uibuilder.msg is a shortcut for uibuilder.get('msg')
        //$('#showMsg').text(JSON.stringify(uibuilder.msg))
    })

    // If Socket.IO connects/disconnects
    uibuilder.onChange('ioConnected', function(newVal){
        console.info('Socket.IO Connection Status Changed: ', newVal)
        $('#socketConnectedState').text(newVal)
    })

    // If a message is sent back to Node-RED
    uibuilder.onChange('msgsSent', function(newVal){
        console.info('New msg sent to Node-RED over Socket.IO. Total Count: ', newVal)
        $('#msgsSent').text(newVal)
        $('#showMsgSent').text(JSON.stringify(uibuilder.get('sentMsg')))
    })

    // If we receive a control message from Node-RED
    uibuilder.onChange('msgsCtrl', function(newVal){
        console.info('New control msg sent to us from Node-RED over Socket.IO. Total Count: ', newVal)
        $('#msgsControl').text(newVal)
        $('#showCtrlMsg').text(JSON.stringify(uibuilder.get('ctrlMsg')))
    })

    //Manually send a message back to Node-RED after 2 seconds
    window.setTimeout(function(){
        console.info('Sending a message back to Node-RED - after 2s delay')
        uibuilder.send( { 'topic':'uibuilderfe', 'payload':'I am a message sent from the uibuilder front end' } )
    }, 2000)

}) // --- End of JQuery Ready --- //

// EOF
