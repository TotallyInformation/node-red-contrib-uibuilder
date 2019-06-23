/* globals module */
/**
 * Template ExpressJS Middleware for uibuilder.
 *
 * NOTES & WARNINGS:
 *   1) This function is called EVERY TIME any web call is made to the URL defined by your uib instance.
 *      So it should be kept short and efficient.
 *   2) Failing to either return or call `next()` will cause an ExpressJS error.
 *   3) An error in this function will probably cause Node-RED to fail to start at all.
 *   4) You have to restart Node-RED if you change this file.
 *
 * Allows custom processing for authentication, session management, custom logging, etc.
 */

// module.exports = function(req,res,next) {
//     console.log('[uibuilder:uibMiddleware] Custom ExpressJS middleware called.')
//     next()
// }
