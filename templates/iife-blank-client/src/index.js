// @ts-nocheck

/** The simplest use of uibuilder client library
 * Note that uibuilder.start() should no longer be needed.
 * See the Tech docs if the client doesn't start on its own.
 */

/** Minimalist code for uibuilder and Node-RED */
'use strict'

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
    // dump the msg as formatted text to the "msg" html element - does nothing if the element not found
    const eMsg = document.getElementById('msg')
    if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
})
