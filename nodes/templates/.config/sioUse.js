/* globals module, log */
/**
 * Template Socket.IO Use Middleware for uibuilder.
 *
 * NOTES & WARNINGS:
 *   1) This function is called when a client sends a "packet" if data to the server.
 *   2) Failing to either return or call `next()` will mean that your clients will never be able to get responses.
 *   3) An error in this function will probably cause Node-RED to fail to start at all.
 *   4) You have to restart Node-RED if you change this file.
 *   5) If you call `next( new Error('blah') )` The error is sent back to the client and further proessing of the incoming msg stops.
 *
 * Allows you to process incoming data from clients.
 * 
 * @param {*} packet The msg send by a client
 * @param {function} next The callback to hand off to the next middleware
 */
// module.exports = function(packet, next) {
//     //if (not some kind of error) {
//         console.log('SIO packet', packet)
//         return next()
//     //} else {
//         // The error is sent back to the client and further processing of the msg stops
//     //    next(new Error('Oops! Some kind of error happened'))
//     //}
// }
