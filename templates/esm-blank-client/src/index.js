// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED using ESM
 * logLevel and showMsg can be controlled from Node-RED instead of here if preferred.
 *
 * Note that you need to understand a bit about how ESM's work
 * or you will get caught out! This is not a uibuilder issue.
 * Script files loaded as a module have no access to other scripts
 * unless imported here.
 */

// THIS MUST BE INCLUDED - WITHOUT IT YOU CANNOT CONNECT TO NODE-RED
import '../uibuilder/uibuilder.esm.min.js'  // Adds `uibuilder` and `$` to globals

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2) // uibuilder.set('logLevel', 'info')
// Using the log output yourself:
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
// uibuilder.onChange('msg', (msg) => {
//     // do stuff with the incoming msg
// })
