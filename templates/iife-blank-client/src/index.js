// @ts-nocheck
/** Example of using the IIFE build of the uibuilder client library
 * Note that uibuilder.start() should no longer be needed.
 * See the docs if the client doesn't start on its own.
 */
'use strict'

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2) // uibuilder.set('logLevel', 'info')
// Using the log yourself:
// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})

// Show the latest incoming msg from Node-RED
uibuilder.showMsg(true, 'body')

// Helper function to send a message back to Node-RED using the standard send function
// - see the HTML file for use. Can, of course, add any custom data in the msg.
window.fnSendToNR = function fnSendToNR(payload) {
    uibuilder.send({
        'topic': 'msg-from-uibuilder-front-end',
        'payload': payload,
    })
}

// Listen for incoming messages from Node-RED and action
// uibuilder.onChange('msg', function(msg) {
//     // do stuff with the incoming msg
// })
