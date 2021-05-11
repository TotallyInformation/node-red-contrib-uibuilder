/* eslint-disable max-params */
/** Manage ExpressJS on behalf of uibuilder
 * Singleton. only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
 * 
 * Copyright (c) 2017-2021 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

class Web {
    /** Called when class is instantiated */
    constructor() {
        //#region ---- References to core Node-RED & uibuilder objects ---- //

        /** @type {runtimeRED} */
        this.RED = undefined
        /** @type {Object} Reference link to uibuilder.js global configuration object */
        this.uib = undefined
        /** Reference to uibuilder's global log functions */
        this.log = undefined

        //#endregion ---- References to core Node-RED & uibuilder objects ---- //
        
        //#region ---- Common variables ---- //

        /** Reference to ExpressJS app instance being used by uibuilder
         * Used for all other interactions with Express
         */
        this.app = undefined
        /** Reference to ExpressJS server instance being used by uibuilder
         * Used to enable the Socket.IO client code to be served to the front-end
         */
        this.server = undefined

        //#endregion ---- ---- //

    } // --- End of constructor() --- //

    /** Assign uibuilder and Node-RED core vars to Class static vars.
     *  This makes them available wherever this MODULE is require'd.
     *  Because JS passess objects by REFERENCE, updates to the original
     *    variables means that these are updated as well.
     * @param {runtimeRED} RED reference to Core Node-RED runtime object
     * @param {Object} uib reference to uibuilder 'global' configuration object
     * @param {Object} log reference to uibuilder log object
     * param {Object} server reference to ExpressJS server being used by uibuilder
     */
    //setup( RED, uib, log, server ) {
    setup( RED, uib, log ) {
        if ( RED ) this.RED = RED
        if ( uib ) this.uib = uib
        if ( uib ) this.log = log
        //if ( uib ) this.server = server

        this.webSetup()
    } // --- End of setup() --- //

    /** Set up the appropriate ExpressJS web server references */
    webSetup() {
        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        //const log = this.log

        /** NB: uib.nodeRoot is the root URL path for http-in/out and uibuilder nodes 
         * Always set to empty string if a dedicated ExpressJS app is required
         * Otherwise it is set to RED.settings.httpNodeRoot */

        /** We need an http server to serve the page and vendor packages. 
         * @since 2019-02-04 removed httpAdmin - we only want to use httpNode for web pages 
         * @since v2.0.0 2019-02-23 Moved from instance level (nodeInstance()) to module level
         * @since v3.3.0 2021-03-16 Allow independent ExpressJS server/app 
         */
        //let app = this.app
        //let server = this.server
        
        if ( uib.customServer.port ) {
            // Port has been specified & is different to NR's port so create a new instance of express & app
            const express = require('express') 
            this.app = express()
            /** Socket.io needs an http(s) server rather than an ExpressJS app
             * As we want Socket.io on the same port, we have to create out own server
             * Use https if NR itself is doing so, use same certs as NR
             * TODO: Allow for https/settings overrides using uibuilder props in settings.js
             * TODO: Switch from https to http/2?
             */
            if ( RED.settings.https ) {
                uib.customServer.type = 'https'
                this.server = require('https').createServer(RED.settings.https, this.app)
            } else {
                this.server = require('http').createServer(this.app)
            }
            // Connect the server to the requested port, domain is the same as Node-RED
            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    this.server.close()
                    RED.log.error(
                        `[uibuilder:CreateServer] ERROR: Port ${uib.customServer.port} is already in use. Cannot create uibuilder server, use a different port number and restart Node-RED`
                    )
                    return
                }    
            })
            this.server.listen(uib.customServer.port, function() {
                uib.customServer.host = this.server.address().address
            })
            // Override the httpNodeRoot setting, has to be empty string. Use reverse proxy to change.
            uib.nodeRoot = ''
        } else {
            // Port not specified (default) so reuse Node-RED's ExpressJS server and app
            this.app = RED.httpNode // || RED.httpAdmin
            this.server = RED.server
            // Record the httpNodeRoot for later use
            uib.nodeRoot = RED.settings.httpNodeRoot
        }

    } // --- End of webSetup() --- //

} // ==== End of Web Class Definition ==== //

/** Singleton model. Only 1 instance of UibSockets should ever exist.
 * Use as: `const sockets = require('./socket.js')`
 */
module.exports = new Web()

// EOF
