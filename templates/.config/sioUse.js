/* globals module */
/**
 * Template Socket.IO Use Middleware for uibuilder.
 * UPDATED: 2022-01-02
 *
 * NOTES & WARNINGS:
 *   1) This function is called when a client sends a "packet" of data to the server.
 *   2) Failing to either return or call `next()` will mean that your clients will never be able to get responses.
 *   3) An error in this function will probably cause Node-RED to fail to start at all.
 *   4) You have to restart Node-RED if you change this file.
 *   5) If you call `next( new Error('blah') )` The error is sent back to the client and further proessing of the incoming msg stops.
 *
 * Allows you to process incoming data from clients.
 * 
 * see also: uibRoot/.config/sioMiddleware.js
 *           and https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#websocket-implementation-hints
 * 
 * @param {[string,object]} msg The msg send by a client (Socket.IO calls it a "packet"). msg[0] is the channel, msg[1] is the actual msg
 * @param {function} next The callback to hand off to the next middleware
 */
 function sioUseMw(msg, next) {

    console.log('[uibuilder:Socket.IO:sioUse.js] msg from client: ', msg)

    // Simplistic error example
    if ( msg[1].i_am_an_error ) {
        // The error is sent back to the client and further processing of the msg stops
        next(new Error('Oops! Some kind of error happened'))
        return
    }
    
    next()

} // Do not forget to end with a call to `next()` or clients will not be able to connect

// Uncomment this for example to work.
//module.exports = sioUseMw