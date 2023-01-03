// @ts-nocheck

/** The simplest use of uibuilder client library
 * Note that uibuilder.start() should no longer be needed.
 * See the Tech docs if the client doesn't start on its own.
 */
'use strict'

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
