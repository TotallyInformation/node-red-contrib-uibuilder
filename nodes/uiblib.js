/* eslint-disable max-params */
/* eslint-env node es2017 */
/**
 * Utility library for uibuilder
 * 
 * Copyright (c) 2017-2021 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk
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
 **/
'use strict'

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 * typedef {import('../typedefs.js')} 
 * @typedef {import('node-red')} Red
 * @typedef {import('socket.io').Namespace} socketio.Namespace
 * @typedef {import('socket.io').Socket} socketio.Socket
 */

const path = require('path')
const fs = require('fs-extra')
const tilib = require('./tilib')
// NOTE: Don't add socket.js here otherwise it will stop working because it references this module

// Make sure that we only work out where the security.js file exists only ONCE - see the logon() function
let securitySrc = ''
let securityjs = null
let jsonwebtoken = null
/**  Gives us a standard _auth object to work with
 * @type MsgAuth */
const dummyAuth = {
    id: null,
    jwt: undefined,
    sessionExpiry: undefined,
    userValidated: false,
    info: {
        error: undefined,
        message: undefined,
        validJwt: undefined,
    },
}
//
//const mylog = process.env.TI_ENV === 'debug' ? console.log : function() {}

module.exports = {
    /** Complex, custom code when processing an incoming msg to uibuilder node input should go here
     * Needs to return the msg object. Not for processing msgs coming back from front-end.
     */
    inputHandler: function(msg, send, done, node, RED, io, ioNs, log, uib) {
        node.rcvMsgCount++
        log.trace( `[uibuilder:uiblib:inputHandler:${node.url}] msg received via FLOW. ${node.rcvMsgCount} messages received. ${JSON.stringify(msg)}` )

        // If the input msg is a uibuilder control msg, then drop it to prevent loops
        if ( Object.prototype.hasOwnProperty.call(msg, 'uibuilderCtrl') ) return null

        //setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Received #' + node.rcvMsgCount}, node)

        // Remove script/style content if admin settings don't allow
        if ( node.allowScripts !== true ) {
            if ( Object.prototype.hasOwnProperty.call(msg, 'script') ) delete msg.script
        }
        if ( node.allowStyles !== true ) {
            if ( Object.prototype.hasOwnProperty.call(msg, 'style') ) delete msg.style
        }

        // pass the complete msg object to the uibuilder client
        // TODO: This should have some safety validation on it!
        if (msg._socketId) {
            //! TODO If security is active ...
            //  ...If socketId not validated as having a current session, don't send
            log.trace(`[uibuilder:uiblib:inputHandler:${node.url}] msg sent on to client ${msg._socketId}. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.to(msg._socketId).emit(uib.ioChannels.server, msg)
        } else {
            //? - is there any way to prevent sending to clients not logged in?
            log.trace(`[uibuilder:uiblib:inputHandler:${node.url}] msg sent on to ALL clients. Channel: ${uib.ioChannels.server}. ${JSON.stringify(msg)}`)
            ioNs.emit(uib.ioChannels.server, msg)
        }

        if (node.fwdInMessages) {
            // Send on the input msg to output
            send(msg)
            done()
            log.trace(`[uibuilder:uiblib:inputHandler:${node.url}] msg passed downstream to next node. ${JSON.stringify(msg)}`)
        }

        return msg
    }, // ---- End of inputHandler function ---- //

    /** Do any complex, custom node closure code here
     * @param {uibNode} node Reference to the node instance object
     * @param {runtimeRED} RED Reference to the Node-RED API
     * @param {Object} uib Reference to the uibuilder master config object
     * @param {Object} sockets - Instance of Socket.IO handler singleton
     * @param {Object} web - Instance of ExpressJS handler singleton
     * @param {Object} log - Winston logging instance
     * @param {function|null} done Default=null, internal node-red function to indicate processing is complete
     */
    instanceClose: function(node, RED, uib, sockets, web, log, done = null) {
        log.trace(`[uibuilder:uiblib:instanceClose:${node.url}] Running instance close.`)

        /** @type {Object} instances[] Reference to the currently defined instances of uibuilder */
        const instances = uib.instances

        this.setNodeStatus({fill: 'red', shape: 'ring', text: 'CLOSED'}, node)

        // Let all the clients know we are closing down
        sockets.sendControl({ 'uibuilderCtrl': 'shutdown' }, node, undefined, false)

        // Disconnect all Socket.IO clients for this node instance
        sockets.removeNS(node)

        web.removeInstanceMiddleware(node)

        // Remove url folder if requested
        if ( uib.deleteOnDelete[node.url] === true ) {
            log.trace(`[uibuilder:uiblib:instanceClose] Deleting instance folder. URL: ${node.url}`)
            
            // Remove the flag in case someone recreates the same url!
            delete uib.deleteOnDelete[node.url]
            
            fs.remove(path.join(uib.rootFolder, node.url))
                .catch(err => {
                    log.error(`[uibuilder:uiblib:processClose] Deleting instance folder failed. URL=${node.url}, Error: ${err.message}`)
                })
        }

        // Keep a log of the active instances @since 2019-02-02
        delete instances[node.id] // = undefined

        /*
            // This code borrowed from the http nodes
            // THIS DOESN'T ACTUALLY WORK!!! Static routes don't set route.route
            app._router.stack.forEach(function(route,i,routes) {
                if ( route.route && route.route.path === node.url ) {
                    routes.splice(i,1)
                }
            });
        */

        // This should be executed last if present. `done` is the data returned from the 'close'
        // event and is used to resolve async callbacks to allow Node-RED to close
        if (done) done()
    }, // ---- End of processClose function ---- //

    /**  Get property values from an Object.
     * Can list multiple properties, the first found (or the default return) will be returned
     * Makes use of RED.util.getMessageProperty
     * @param {Object} RED - RED
     * @param {Object} myObj - the parent object to search for the props
     * @param {string|string[]} props - one or a list of property names to retrieve.
     *                               Can be nested, e.g. 'prop1.prop1a'
     *                               Stops searching when the first property is found
     * @param {any} defaultAnswer - if the prop can't be found, this is returned
     * @return {any} The first found property value or the default answer
     */
    getProps: function(RED,myObj,props,defaultAnswer = []) {
        if ( (typeof props) === 'string' ) {
            // @ts-ignore
            props = [props]
        }
        if ( ! Array.isArray(props) ) {
            return undefined
        }
        let ans
        for (var i = 0; i < props.length; i++) {
            try { // errors if an intermediate property doesn't exist
                ans = RED.util.getMessageProperty(myObj, props[i])
                if ( typeof ans !== 'undefined' ) {
                    break
                }
            } catch(e) {
                // do nothing
            }
        }
        return ans || defaultAnswer
    }, // ---- End of getProps ---- //

    /** Output a control msg
     * Sends to all connected clients & outputs a msg to port 2 if required
     * @param {Object} msg The message to output
     * @param {Object} ioNs Socket.IO instance to use
     * @param {Object} node The node object
     * @param {Object} uib Reference to the uibuilder configuration object
     * @param {string=} socketId Optional. If included, only send to specific client id
     * @param {boolean=} output Optional. If included, also output to port #2 of the node @since 2020-01-03
     */
    sendControl: function(msg, ioNs, node, uib, socketId, output) {
        if (output === undefined || output === null) output = true

        msg.from = 'server'

        if (socketId) msg._socketId = socketId

        // Send to specific client if required
        if (msg._socketId) ioNs.to(msg._socketId).emit(uib.ioChannels.control, msg)
        else ioNs.emit(uib.ioChannels.control, msg)

        if ( (! Object.prototype.hasOwnProperty.call(msg, 'topic')) && (node.topic !== '') ) msg.topic = node.topic

        // copy msg to output port #2 if required
        if ( output === true ) node.send([null, msg])
    }, // ---- End of getProps ---- //

    /** Simple fn to set a node status in the admin interface
     * fill: red, green, yellow, blue or grey
     * @param {Object|string} status
     * @param {Object} node
     */
    setNodeStatus: function( status, node ) {
        if ( typeof status !== 'object' ) status = {fill: 'grey', shape: 'ring', text: status}

        node.status(status)
    }, // ---- End of setNodeStatus ---- //

    /** Check authorisation validity - called for every msg received from client if security is on
     * @param {Object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket 
     * @param {Object} log Custom logger instance
     * @param {Object} uib Reference to the core uibuilder config object
     * @returns {_auth} An updated _auth object
     */
    authCheck: function(msg, ioNs, node, socket, log, uib) { // eslint-disable-line no-unused-vars
        /** @type MsgAuth */
        var _auth = dummyAuth

        // Has the client included msg._auth? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth) {
            _auth.info.error = 'Client did not provide an _auth'

            this.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type _auth */
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, false)

            return _auth
        }

        // Has the client included msg._auth.id? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth.id) {
            _auth.info.error = 'Client did not provide an _auth.id'

            this.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type _auth */
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, false)

            return _auth
        }

        // TODO: remove log output
        console.log('[uibuilder:socket.on.control] Use Security _auth: ', msg._auth, `. Node ID: ${node.id}`)

        //      does the client have a valid session?
        //      if not, return a not logged in control msg

        _auth = this.checkToken(msg._auth, node)

        //console.log('[uibuilder:socket.on.control] result of checkToken _auth: ', _auth)
        // if (_auth.info.validJwt === true) {
        //     uiblib.sendControl({
        //         'uibuilderCtrl': 'session valid',
        //         'topic': node.topic || undefined,
        //         '_auth': _auth
        //     }, ioNs, node, socket.id, false, uib)
        // } else {
        //     uiblib.sendControl({
        //         'uibuilderCtrl': 'session invalid',
        //         'topic': node.topic || undefined,
        //         '_auth': _auth
        //     }, ioNs, node, socket.id, false, uib)
        // }

        return _auth
    }, // ---- End of authCheck ---- //

    /** Create a new JWT token based on a user id, session length and security string 
     * @param {MsgAuth} _auth The unique id that identifies the user.
     * @param {uibNode} node  Reference to the calling uibuilder node instance.
     * @returns {MsgAuth} Updated _auth including a signed JWT token string, expiry date/time & info flag.
     */
    createToken: function(_auth, node) {

        // TODO if securityjs === null we need to load the security.js? Currently only done in the logon() function

        // If anything fails, ensure that the token is invalidated
        try {

            if (jsonwebtoken === null) jsonwebtoken = require('jsonwebtoken')

            const sessionExpiry = Math.floor(Number(Date.now()) / 1000) + Number(node.sessionLength)

            // TODO ??? Add security.js function call to enable further validation of token contents - e.g. source IP address
            const jwtData = {
                // When does the token expire? Value is seconds since 1970
                exp: sessionExpiry,
                // Subject = unique id to identify user
                sub: _auth.id,
                // Issuer
                iss: 'uibuilder',
            }

            _auth.jwt = jsonwebtoken.sign(jwtData, node.jwtSecret)
            _auth.sessionExpiry = sessionExpiry * 1000 // Javascript ms not unix sec
            if (!_auth.info) _auth.info = {}
            _auth.info.validJwt = true

        } catch(e) {

            _auth.jwt = undefined
            _auth.sessionExpiry = undefined
            _auth.userValidated = false
            if (!_auth.info) _auth.info = {}
            _auth.info.validJwt = false
            _auth.info.error = 'Could not create JWT'

        }

        return _auth

    }, // ---- End of createToken ---- //

    /** Check whether a received JWT token is valid. If it is, then try to update it. 
     * @param {_auth} token A base64 encoded, signed JWT token string.
     * @param {uibNode} node  Reference to the calling uibuilder node instance.
     * @returns {_auth}  { valid: [boolean], data: [object], newToken: [string], err: [object] }
     */
    checkToken: function(_auth, node) {
        if (jsonwebtoken === null)  jsonwebtoken = require('jsonwebtoken')

        // TODO if securityjs === null we need to load the security.js? Currently only done in the logon() function

        const options = {
            issuer: 'uibuilder',
            clockTimestamp: Math.floor(Date.now() / 1000), // seconds since 1970
            //clockTolerance: 10, // seconds
            //maxAge: "7d",
        }

        /** @type _auth */
        var response = {
            id: _auth.id,
            jwt: undefined, 
            info: {
                validJwt: false, 
                error: undefined,
            }, 
        }

        try {
            response.info.verify = jsonwebtoken.verify(_auth.jwt, node.jwtSecret, options) // , callback])
            response = this.createToken(response, node)
            //response.info.validJwt = true // set in createToken, also the jwt & expiry
        } catch(err) {
            response.info.error = err
            response.info.validJwt = false
        }

        // TODO ??? Add security.js function call to enable further validation of token contents - e.g. source IP address

        console.log('[uibuilder:uiblib.js:checkToken] response: ', response)
        return response

    }, // ---- End of checkToken ---- //

    /** Process a logon request
     * msg._auth contains any extra data needed for the login
     * @param {Object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket 
     * @param {Object} log Custom logger instance
     * @param {Object} uib Constants from uibuilder.js
     * @returns {boolean} True = user logged in, false = user not logged in
     */
    logon: function(msg, ioNs, node, socket, log, uib) {

        /** @type MsgAuth */
        var _auth = msg._auth || dummyAuth
        if (!_auth.info) _auth.info = {}
        _auth.userValidated = false

        // Only process if security is turned on. Otherwise output info to log, inform client and exit
        if ( node.useSecurity !== true ) {
            log.info('[uibuilder:uiblib:logon] Security is not turned on, ignoring logon attempt.')

            _auth.info.error = 'Security is not turned on for this uibuilder instance'

            this.sendControl({
                uibuilderCtrl: 'authorisation failure',
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, false)

            return _auth.userValidated
        }

        // Check if using TLS - if not, send warning to log & inform client and exit
        if ( socket.handshake.secure !== true ) {
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
                _auth.info.warning = `
    
    +---------------------------------------------------------------+
    | uibuilder security warning:                                   |
    |    A logon is being processed without TLS security turned on. |
    |    This works, with warnings, in a development environment.   |
    |    It will NOT work for non-development environments.         |
    |    See the uibuilder security docs for details.               |
    +---------------------------------------------------------------+
    `
                log.warn(`[uibuilder:uiblib:logon] **WARNING** ${_auth.info.warning}`)
            } else {
                _auth.info.error = `
    
    +---------------------------------------------------------------+
    | uibuilder security warning:                                   |
    |    A logon is being processed without TLS security turned on. |
    |    This IS NOT PERMITTED for non-development environments.    |
    |    See the uibuilder security docs for details.               |
    +---------------------------------------------------------------+
    `
                log.error(`[uibuilder:uiblib:logon] **ERROR** ${_auth.info.error}`)
                
                // Report fail to client but don't output to port #2 as error msg already sent
                _auth.userValidated = false
                _auth.info.error = 'Logons cannot be processed without TLS in non-development environments'

                this.sendControl({
                    uibuilderCtrl: 'authorisation failure',
                    topic: msg.topic || node.topic,
                    '_auth': _auth,
                }, ioNs, node, uib, socket.id, false)

                return _auth.userValidated
            }
        }

        // Make sure that we at least have a user id, if not, inform client and exit
        if ( ! _auth.id ) {
            log.warn('[uibuilder:uiblib.js:logon] No _auth.id provided')

            //TODO ?? record fail ??
            _auth.userValidated = false
            _auth.info.error = 'Logon failed. No id provided'

            // Report fail to client & Send output to port #2
            this.sendControl({
                uibuilderCtrl: 'authorisation failure',
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, true)

            return _auth.userValidated
        }

        /** Attempt logon */

        // If an instance specific version of the security module exists, use it or use master copy or fail
        // On fail, output to NR log & exit the logon - don't tell the client as that would be leaking security info
        if ( securitySrc === '' ) { // make sure this only runs once
            securitySrc = path.join(node.customFolder,'security.js')
            if ( ! fs.existsSync(securitySrc) ) {
                // Otherwise try to use the central version in uibRoot/.config
                securitySrc = path.join(uib.rootFolder, uib.configFolderName,'security.js')
                if ( ! fs.existsSync(securitySrc) ) {
                    // Otherwise use the template version from ./templates/.config
                    securitySrc = path.join(__dirname, 'templates', '.config', 'security.js')

                    // And output a warning if in dev mode, fail in production mode
                    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
                        log.warn('[uibuilder:uiblib:logon] Security is ON but no `security.js` found. Using master template. Please replace with your own code.')

                        if (node.copyIndex === true) { // eslint-disable-line max-depth
                            log.warn('[uibuilder:uiblib:logon] copyIndex flag is ON so copying master template `security.js` to the <usbRoot>/.config` folder.')
                            fs.copy(securitySrc, path.join(uib.configFolderName,'security.js'), {overwrite:false, preserveTimestamps:true}, err => {
                                if (err) log.error('[uibuilder:uiblib:logon] Copy of master template `security.js` FAILED.', err)
                                else {
                                    log.warn('[uibuilder:uiblib:logon] Copy of master template `security.js` SUCCEEDED. Please restart Node-RED to use it.')
                                }
                            })
                        }
                    } else {
                        // In production mode, don't allow insecure processes - fail now
                        log.error('[uibuilder:uiblib:logon] Security is ON but no `security.js` found. Cannot process logon in non-development mode without a custom security.js file. See uibuilder security docs for details.')

                        return _auth.userValidated
                    }
                }
            }

            try {
                securityjs = require( securitySrc )
            } catch (e) {
                log.error('[uibuilder:uiblib:logon] Security is ON but `security.js` could not be `required`. Cannot process logons. Is security.js a valid Node.js module?', e)

                return _auth.userValidated
            }
        }

        // Make sure that securityjs has the correct functions available or log and exit
        if ( ! securityjs.userValidate ) {
            log.error('[uibuilder:uiblib:logon] Security is ON but `security.js` does not contain the required function(s). Cannot process logon. Check docs and change file.')
            return _auth.userValidated
        }

        // Make sure that _auth.info exists
        if ( ! Object.prototype.hasOwnProperty.call(_auth, 'info') ) _auth.info = {}

        // Use security module to validate user - updates _auth
        _auth = securityjs.userValidate(_auth)

        // Ensure that _auth.password is not present
        delete _auth.password

        // Validate the _auth object - full ensure the following props exist: id, userValidated, info. And ensures that password DOES NOT EXIST
        if ( ! this.chkAuth(_auth, 'full') ) {
            log.error(`[uibuilder:uiblib:logon] _auth is not valid, logon cancelled. Please check 'userValidate()' in '${uib.configFolder}/security.js'.\n\t\tIt MUST return an object with at least id, userValidated, info props. info must be an object.`)
            console.log('[uibuilder:uiblib:logon] _auth=',_auth)  // NB: leave this console log in place for error reporting
            return false 
        }

        console.log('[uibuilder:uiblib.js:logon] Updated _auth: ', _auth)

        // Send responses
        //TODO Should output to port #2 be an option? Should less data be sent?
        if ( _auth.userValidated === true ) {
            // Record session details

            // Add token to _auth - created here not in user function to ensure consistency
            _auth = this.createToken(_auth, node)

            // Check that we have a valid token
            if ( _auth.info.jwtValid === true ) {
                // Add success reason and add any optional data from the user validation
                _auth.info.message = 'Logon successful'
            } else {
                _auth.userValidated = false
            }

            // Report success & send token to client & to port #2
            this.sendControl({
                'uibuilderCtrl': 'authorised',
                'topic': msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, true)

            // Send output to port #2 manually (because we only include a subset of _auth)
            /* node.send([null, {
                uibuilderCtrl: 'authorised',
                topic: msg.topic || node.topic,
                _socketId: socket.id,
                from: 'server',
                '_auth': {
                    // Try to show some usefull info without revealing too much
                    id: _auth.id,
                    authTokenExpiry: _auth.authTokenExpiry,
                    // Optional data from the client
                    uid: _auth.uid,
                    user: _auth.user,
                    name: _auth.name,
                },
             }]) */
        } else { // _auth.userValidated <> true
            _auth.info.error = 'Logon failed. Invalid id or password'  // NB _auth.info is created further up if it doesn't already exist, it is validated as an object

            // Report fail to client & Send output to port #2
            this.sendControl({
                uibuilderCtrl: 'authorisation failure',
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, true)
        }

        return _auth.userValidated
    }, // ---- End of logon ---- //

    /** Process a logoff request
     * msg._auth contains any extra data needed for the login
     * @param {Object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket 
     * @param {Object} log Custom logger instance
     * @param {Object} uib uibuilder's master variables
     * @returns {_auth} Updated _auth
     */
    logoff: function(msg, ioNs, node, socket, log, uib) { // eslint-disable-line no-unused-vars
        /** @type MsgAuth */
        var _auth = msg._auth || dummyAuth
        
        // Check that request is valid (has valid token)
        // Check that session exists
        // delete session entry

        _auth.jwt = undefined
        _auth.sessionExpiry = undefined
        _auth.userValidated = false
        if (!_auth.info) _auth.info = {}
        _auth.info.validJwt = false
        _auth.info.message = 'Logoff successful'

        // confirm logoff to client & Send output to port #2
        this.sendControl({
            uibuilderCtrl: 'logged off',
            topic: msg.topic || node.topic,
            '_auth': _auth,
        }, ioNs, node, uib, socket.id, true)

        return _auth
    }, // ---- End of logoff ---- //

    /** Check an _auth object for the correct schema 
     * @param {MsgAuth} _auth The _auth object to check
     * @param {String=} type Optional. 'short' or 'full'. How much checking to do
     * @returns {Boolean}
    */
    chkAuth: function(_auth, type='short') {
        // Has to be an object
        if ( ! (_auth!== null && _auth.constructor.name === 'Object') ) {
            return false
        }

        let chk = false
        let chk1, chk2, chk3

        // --- REQUIRED --- //
        // ID? (user id)
        try {
            if ( _auth.id !== '' ) chk = true
        } catch (e) {
            chk = false
        }

        // --- FULL CHECK --- //
        if ( type === 'full' ) {
            // userValidated
            if ( _auth.userValidated === true || _auth.userValidated === false ) chk1 = true
            else chk1 = false
            
            // info - exists and is an object
            if ( _auth.info && _auth.info !== null && _auth.info.constructor.name === 'Object' ) chk2 = true
            else chk2 = false

            // MUST NOT EXIST password
            if ( ! _auth.password  ) chk3 = true
            else chk3 = false
        }

        if ( chk && chk1 && chk2 && chk3 ) return true
        return false
    }, // ---- End of chkAuth() ---- //

    /** Create instance details web page
     * @param {import("express").Request} req ExpressJS Request object
     * @param {Object} node configuration data for this instance
     * @param {Object} uib uibuilder "globals" common to all instances
     * @param {string} userDir The Node-RED userDir folder
     * @param {runtimeRED} RED The Node-RED runtime object
     * @return {string} page html
     */
    showInstanceDetails: function(req, node, uib, userDir, RED) {
        let page = ''

        // If using own Express server, correct the URL's
        const url = new URL(req.headers.referer)
        url.pathname = ''
        if (uib.customServer && uib.customServer.port && uib.customServer.port !== RED.settings.uiPort ) {
            //http://127.0.0.1:3001/uibuilder/vendor/bootstrap/dist/css/bootstrap.min.css
            //customServer: { port: 3001, type: 'http', host: '::' }
            url.port = uib.customServer.port
        }
        const urlPrefix = url.href 
        let urlRoot = `${urlPrefix}${uib.nodeRoot.replace('/','')}${uib.moduleName}`

        page += `
            <!doctype html><html lang="en"><head>
                <title>uibuilder Instance Debug Page</title>
                <link rel="icon" href="${urlRoot}/common/images/node-blue.ico">
                <link type="text/css" rel="stylesheet" href="${urlRoot}/vendor/bootstrap/dist/css/bootstrap.min.css" media="screen">
                <style type="text/css" rel="stylesheet" media="all">
                    h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                    .col3i tbody>tr>:nth-child(3){ font-style:italic; }
                </style>
            </head><body><div class="container">
                <h1>uibuilder Instance Debug Page</h1>
                <p>
                    Note that this page is only accessible to users with Node-RED admin authority.
                </p>
            `
    
        page += `
            <h2>Instance Information for '${node.url}'</h2>
            <table class="table">
                <tbody>
                    <tr>
                        <th>The node id for this instance</th>
                        <td>${node.id}<br>
                            This can be used to search for the node in the Editor.
                        </td>
                    </tr>
                    <tr>
                        <th>Filing system path to front-end resources</th>
                        <td>${node.customFolder}<br>
                            Contains all of your UI code and other resources.
                            Folders and files can be viewed, edited, created and deleted using the "Edit Files" button.
                            You <b>MUST</b> keep at least the <code>src</code> and <code>dist</code> folders otherwise things may not work.
                        </td>
                    </tr>
                    <tr>
                        <th>URL for the front-end resources</th>
                        <td><a href="${urlPrefix}${tilib.urlJoin(uib.nodeRoot, node.url).replace('/','')}" target="_blank">.${tilib.urlJoin(uib.nodeRoot, node.url)}/</a><br>Index.html page will be shown if you click.</td>
                    </tr>
                    <tr>
                        <th>Node-RED userDir folder</th>
                        <td>${userDir}<br>
                            Also the location for any installed vendor resources (installed library packages)
                            and your other nodes.
                        </td>
                    </tr>
                    <tr>
                        <th>URL for vendor resources</th>
                        <td>../uibuilder/vendor/<br>
                            See the <a href="../../uibindex" target="_blank">Detailed Information Page</a> for more details.
                        </td>
                    </tr>
                    <tr>
                        <th>Filing system path to common (shared) front-end resources</th>
                        <td>${uib.commonFolder}<br>
                            Resource files in this folder are accessible from the main URL.
                        </td>
                    </tr>
                    <tr>
                        <th>Filing system path to common uibuilder configuration resource files</th>
                        <td>${uib.configFolder}<br>
                            Contains the package list, master package list, authentication and authorisation middleware.
                        </td>
                    </tr>
                    <tr>
                        <th>Filing system path to uibuilder master template files</th>
                        <td>${uib.masterTemplateFolder}<br>
                            These are copied to any new instance of the uibuilder node.
                            If you keep the copy flag turned on they are re-copied if deleted.
                        </td>
                    </tr>
                    <tr>
                        <th>uibuilder version</th>
                        <td>${uib.version}</td>
                    </tr>
                    <tr>
                        <th>Node-RED version</th>
                        <td>${RED.settings.version}<br>
                            Minimum version required by uibuilder is ${uib.me['node-red'].version}
                        </td>
                    </tr>
                    <tr>
                        <th>Node.js version</th>
                        <td>${uib.nodeVersion.join('.')}<br>
                            Minimum version required by uibuilder is ${uib.me.engines.node}
                        </td>
                    </tr>
                </tbody>
            </table>
            `

        const nodeKeys = [
            'id', 'type',  
            'name', 'wires', '_wireCount', 'credentials', 'topic', 'url', 
            'fwdInMessages', 'allowScripts', 'allowStyles', 'copyIndex', 'showfolder', 
            'useSecurity', 'sessionLength', 'tokenAutoExtend', 'customFolder', 
            'ioClientsCount', 'rcvMsgCount', 'ioNamespace'
        ]
        // functions: ['_closeCallbacks', '_inputCallback', '_inputCallbacks', 'send', ]
        // Keep secret: ['jwtSecret', ]
    
        page += `
            <h2>Node Instance Configuration Items</h2>
            <p>
                Shows the internal configuration.
            </p>
            <table class="table">
                <tbody>
            `

        nodeKeys.sort().forEach( item => {
            let info = node[item]
            try {
                if ( info !== null && info.constructor.name === 'Object' ) info = JSON.stringify(info)
            } catch (e) {
                if ( info !== undefined )
                    RED.log.warn(`[uibuilder:uiblib:showInstanceDetails] ${node.id}, ${url}: Item '${item}' failed to stringify. ${e.message}`)
            }
            page += `
                <tr>
                    <th>${item}</th>
                    <td>${info}</td>
                </tr>
                `
        })

        page += `
                </tbody>
            </table>
            `

        page += '' // eslint-disable-line no-implicit-coercion
        page += '<div></div>'

        page += '</body></html>'

        return page
    }, // ---- End of showInstanceDetails() ---- //

    /** Replace template in front-end instance folder
     * @param {string} url The uib instance URL
     * @param {string} template Name of one of the built-in templates including 'blank' and 'external'
     * @param {string|undefined} extTemplate Optional external template name to be passed to degit. See degit options for details.
     * @param {string} cmd 'replaceTemplate' if called from admin-router:POST, otherwise can be anything descriptive & unique by caller
     * @param {Object} templateConf Template configuration object
     * @param {Object} uib uibuilder's master variables
     * @param {Object} log uibuilder's Log functions (normally points to RED.log)
     * @returns {Promise} {statusMessage, status, (json)}
     */
    replaceTemplate: async function(url, template, extTemplate, cmd, templateConf, uib, log) {
        const res = {
            'statusMessage': 'Something went wrong!',
            'status': 500,
            'json': undefined,
        }

        // Load a new template (params url, template, extTemplate)
        if ( template === 'external' && ( (!extTemplate) || extTemplate.length === 0) ) {
            let statusMsg = `External template selected but no template name provided. template=external, url=${url}, cmd=${cmd}`
            log.error(`[uibuilder:uiblib:replaceTemplate]. ${statusMsg}`)
            res.statusMessage = statusMsg
            res.status = 500
            return res
        }

        let fullname = path.join(uib.rootFolder, url)

        if ( extTemplate ) extTemplate = extTemplate.trim()

        // If template="external" & extTemplate not blank - use degit to load
        if ( template === 'external' ) {
            const degit = require('degit')

            uib.degitEmitter = degit(extTemplate, {
                cache: true,
                force: true,
                verbose: false,
            })
            
            uib.degitEmitter.on('info', info => {
                log.trace(`[uibuilder:uiblib:replaceTemplate] Degit: '${extTemplate}' to '${fullname}': ${info.message}`)
            })
            
            let myclone = await uib.degitEmitter.clone(fullname)

            console.log({myclone})
            let statusMsg = `Degit successfully copied template '${extTemplate}' to '${fullname}'.`
            log.info(`[uibuilder:uiblib:replaceTemplate] ${statusMsg} cmd=${cmd}`)
            res.statusMessage = statusMsg
            res.status = 200
            res.json = {
                'url': url,
                'template': template,
                'extTemplate': extTemplate,
                'cmd': cmd,
            }
            return res

        } else {

            // Otherwise, use internal template
            if ( Object.prototype.hasOwnProperty.call(templateConf, template) ) {
                const fsOpts = {'overwrite': true, 'preserveTimestamps':true}
                const srcTemplate = path.join( uib.masterTemplateFolder, template )
                try {
                    fs.copySync( srcTemplate, fullname, fsOpts )
                    let statusMsg = `Successfully copied template ${template} to ${url}.`
                    log.info(`[uibuilder:uiblib:replaceTemplate] ${statusMsg} cmd=replaceTemplate`)
                    res.statusMessage = statusMsg
                    res.status = 200
                    res.json = {
                        'url': url,
                        'template': template,
                        'extTemplate': extTemplate,
                        'cmd': cmd,
                    }
                    return res
                } catch (err) {
                    let statusMsg = `Failed to copy template from '${srcTemplate}' to '${fullname}'. url=${url}, cmd=${cmd}, ERR=${err.message}.`
                    log.error(`[uibuilder:uiblib:replaceTemplate] ${statusMsg}`, err)
                    res.statusMessage = statusMsg
                    res.status = 500
                    return res
                }
            } else {
                // Shouldn't ever be able to occur - but still :-)
                let statusMsg = `Template '${template}' does not exist. url=${url}, cmd=${cmd}.`
                log.error(`[uibuilder:uiblib:replaceTemplate] ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status = 500
                return res
            }

        }

        // Shouldn't get here
        return res

    }, // ----- End of replaceTemplate() ----- //

    //#region ===== DEPRECATED ===== //

    /** Validate a url query parameter - DEPRECATED in v3.1.0
     * @deprecated
     * @param {string} url uibuilder URL to check (not a full url, the name used by uibuilder)
     * @param {import("express").Response} res The ExpressJS response variable
     * @param {string} caller A string indicating the calling function - used for logging only
     * @param {Object} log The uibuilder log Object
     * @return {boolean} True if the url is valid, false otherwise (having set the response object)
     */
    // checkUrl: function (url, res, caller, log) {
    //     log.warn(`[uibuilder:checkUrl] FUNCTION DEPRECATED - DO NOT USE. url=${url}, caller=${caller}`)
    //     // We have to have a url to work with
    //     if ( url === undefined ) {
    //         log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter not provided`)
    //         res.statusMessage = 'url parameter not provided'
    //         res.status(500).end()
    //         return false
    //     }
    //     // URL must not exceed 20 characters
    //     if ( url.length > 20 ) {
    //         log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter is too long (>20 characters)`)
    //         res.statusMessage = 'url parameter is too long. Max 20 characters'
    //         res.status(500).end()
    //         return false 
    //     }
    //     // URL must be more than 0 characters
    //     if ( url.length < 1 ) {
    //         log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter is empty`)
    //         res.statusMessage = 'url parameter is empty, please provide a value'
    //         res.status(500).end()
    //         return false
    //     }
    //     // URL cannot contain .. to prevent escaping sub-folder structure
    //     if ( url.includes('..') ) {
    //         log.error('[uibdeletefile] Admin API. url parameter contains ..')
    //         res.statusMessage = 'url parameter may not contain ..'
    //         res.status(500).end()
    //         return false
    //     }

    //     return true
    // }, // ---- End of checkUrl ---- //

    //#endregion ===== DEPRECATED ===== //
    
} // ---- End of module.exports ---- //
