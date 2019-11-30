/* globals module, log */
/**
 * Template Socket.IO Connection Middleware for uibuilder.
 *
 * NOTES & WARNINGS:
 *   1) This function is only called ONCE - when a new client connects. So any authentication/security processing is limited
 *      because you cannot use this to, for example, timeout/extend a session without further server processing of incoming messages.
 *   2) Failing to either return or call `next()` will mean that your clients will never connect.
 *   3) An error in this function will probably cause Node-RED to fail to start at all.
 *   4) You have to restart Node-RED if you change this file.
 *
 * Allows custom processing for authentication, session management, connection validation, logging, rate limiting, etc.
 */

//module.exports = function(socket, next) {
    /* Some SIO related info that might be useful in security checks
     * console.log('--socket.request.connection.remoteAddress--')
     * console.dir(socket.request.connection.remoteAddress)
     * console.log('--socket.handshake.address--')
     * console.dir(socket.handshake.address)
     * console.dir(io.sockets.connected)
     */
    /*
    if ( socket.request.headers.cookie) {
        log.info('[uibuilder:Module] io.use - Authentication OK - ID: ' + socket.id)
        log.info('[uibuilder:Module] Cookie', socket.request.headers.cookie)  // socket.handshake.headers.cookie
        return next()
    }
    next (new Error('UIbuilder:io.use - Authentication error - ID: ' + socket.id ))
    */
//}
