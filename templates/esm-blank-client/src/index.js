// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED using ESM
 *
 * Note that you need to understand a bit about how ESM's work
 * or you will get caught out! This is not a uibuilder issue.
 * Script files loaded as a module have no access to other scripts
 * unless imported here.
 */

import '../uibuilder/uibuilder.esm.min.js'  // Adds `uibuilder` and `$` to globals

// logLevel 2+ shows more built-in logging. 0=error,1=warn,2=info,3=log,4=debug,5=trace.
// uibuilder.set('logLevel', 2)
// uibuilder.log('info', 'a prefix', 'some info', {any:'data',life:42})

// Helper function to send a message back to Node-RED using the standard send function - see the HTML file for use
window.fnSendToNR = function fnSendToNR(payload) {
    uibuilder.send({
        'topic': 'msg-from-uibuilder-front-end',
        'payload': payload,
    })
}

// Listen for incoming messages from Node-RED
uibuilder.onChange('msg', function(msg) {
    // Dump the msg as text to the "msg" html element
    // either the HTML way or via uibuilder's $ helper function
    // const eMsg = document.getElementById('msg')
    const eMsg = $('#msg')
    if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
})
