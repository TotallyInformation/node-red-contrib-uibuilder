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
 * uibuilderfe.js (or uibuilderfe.min.js) exposes the following global object.
 * Note that you can use webpack or similar to bundle uibuilder with your own code.
 *
 *   uibuilder: The main global object containing the following...
 *     External Methods:
 *       .onChange(property, callbackFn) - listen for changes to property and execute callback when it changes
 *       .get(property)        - Get any available property
 *       .set(property, value) - Set any available property (can't overwrite internal properties)
 *       .msg                  - Shortcut to get the latest value of msg. Equivalent to uibuilder.get('msg')
 *       .send(msg)            - Shortcut to send a msg back to Node-RED manually
 *       .sendCtrl(msg)        - Shortcut to send a control msg back to Node-RED manually (@since v0.4.8)
 *       .debug(true/false)    - Turn on/off debugging
 *       .uiDebug(type,msg)    - Utility function: Send debug msg to console (type=[log,info,warn,error,dir])
 *       .me()                 - Returns the self object if debugging otherwise just the current version string
 *       .autoSendReady(true/false) - If true, sends "ready for content" ctrl msg on window.load
 *                       If false, you will need to manually do
 *                       uibuilder.sendCtrl({'uibuilderCtrl':'ready for content', 'cacheControl':'REPLAY'})
 *                       (e.g. in an app.mounted event)  @since v0.4.8a
 *
 *     All properties can be read using the .get method
 *     New properties can be added via .set method as long as the property name does not clash with anything internal.
 *     All properties (including custom) can have change events associated with them by using the .onChange method
 *
 *     Externally settable properties using special methods only
 *       .autoSendReady - see .autoSendReady method
 *       .debug         - see .debug method, also see 'server connected' control msg from server
 *
 *     Externally settable properties via the .set method
 *       .allowScript   - Allow incoming msg to contain msg.script with JavaScript that will be automatically executed
 *       .allowStyle    - Allow incoming msg to contain msg.style with CSS that will be automatically executed
 *       .removeScript  - Delete msg.code after inserting to DOM if it exists on incoming msg
 *       .removeStyle   - Delete msg.style after inserting to DOM if it exists on incoming msg
 *
 *     Externally read only properties (may be changed internally)
 *       .msg           - Copy of the last msg sent from Node-RED over Socket.IO
 *       .sentMsg       - Copy of the last msg sent by us to Node-RED (both data and control)
 *       .ctrlMsg       - Copy of the last control msg received by us from Node-RED (Types: ['shutdown','server connected'])
 *       .msgsReceived  - How many standard messages have we received
 *       .msgsSent      - How many messages have we sent
 *       .msgsSentCtrl  - How many control messages have we sent
 *       .msgsCtrl      - How many control messages have we received
 *       .ioConnected   - Is Socket.IO connected right now? (true/false)
 *       ---- You are not likely to need any of these, they are for internal use ----
 *       .version       - check the current version of the uibuilder code
 *       .ioChannels    - List of the channel names in use [uiBuilderControl, uiBuilderClient, uiBuilder]
 *       .retryMs       - starting retry ms period for manual socket reconnections workaround
 *       .retryFactor   - starting delay factor for subsequent reconnect attempts
 *       .ioNamespace   - Get the namespace from the current URL
 *       .ioPath        - make sure client uses Socket.IO version from the uibuilder module (using path)
 *       .ioTransport   - ['polling', 'websocket']
 *       .timerid       - internal use only
 *       .events        - list of registered events
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

    // Manually send a control message. Include cacheControl:REPLAY to test cache handling
    // Shouldn't be needed in this example since window.load will also send cacheControl and we should
    // be done before then.
    uibuilder.sendCtrl({'cacheControl': 'REPLAY'})

}) // --- End of JQuery Ready --- //

// EOF
