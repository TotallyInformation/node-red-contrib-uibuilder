// @ts-nocheck

/** Minimalist code for uibuilder and Node-RED using ESM
 *
 * Note that you need to understand a bit about how ESM's work
 * or you will get caught out! This is not a uibuilder issue.
 * Script files loaded as a module have no access to other scripts
 * unless imported here.
 */

import '../uibuilder/uibuilder.esm.min.js'  // Adds `uibuilder` and `$` to globals

// Set logLevel to 2 or above to see more built-in logging info & use info-level custom logging.
// uibuilder.set('logLevel', 2)

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
    // either the HTML way or via uibuilder's helper function
    // const eMsg = document.getElementById('msg')
    const eMsg = $('#msg')
    if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
})
