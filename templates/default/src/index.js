// Give VS Code IntelliSense for uibuilder
/// <reference path="../types/uibuilder.d.ts" />

/** The simplest use of uibuilder client library
 * See the docs if the client doesn't start on its own.
 */

// Listen for incoming messages from Node-RED and action
// uibuilder.onChange('msg', (msg) => {
//     // do stuff with the incoming msg
// })

// If you have timing issues (uibuilder data not yet ready)
// Use this event to delay your code.
// document.addEventListener('uibuilder:startComplete', () => {
//     console.log('>> pageData?', uibuilder.get('pageData'))
// })
