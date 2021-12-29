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
  * typedef {import('socket.io').Namespace} socketio.Namespace
  * typedef {import('socket.io').Socket} socketio.Socket
  */
 
// ---- DEPRECATED - SECURITY MOVED TO ITS OWN CLASS LIBRARY ---- //

const path = require('path')
const fs = require('fs-extra')
const tilib = require('./tilib')
// Only used for type checking
const socketio      = require('socket.io') // eslint-disable-line no-unused-vars
// Only used for type checking
const Express = require('express') // eslint-disable-line no-unused-vars
// NOTE: Don't add socket.js here otherwise it will stop working because it references this module
 
// Make sure that we only work out where the security.js file exists only ONCE - see the logon() function
let securitySrc = ''
let securityjs = null
let jsonwebtoken = null
/**  Gives us a standard _auth object to work with
 * @type {MsgAuth} */
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

module.exports = {
    /** Output a control msg
     * Sends to all connected clients & outputs a msg to port 2 if required
     * @param {object} msg The message to output
     * @param {object} ioNs Socket.IO instance to use
     * @param {object} node The node object
     * @param {object} uib Reference to the uibuilder configuration object
     * @param {string=} socketId Optional. If included, only send to specific client id
     * @param {boolean=} output Optional. If included, also output to port #2 of the node @since 2020-01-03
     */
    sendControl: function(msg, ioNs, node, uib, socketId, output) {
        if (output === undefined || output === null) output = true

        msg.from = 'server'

        if (socketId !== undefined) msg._socketId = socketId

        // Send to specific client if required
        if (msg._socketId) ioNs.to(msg._socketId).emit(uib.ioChannels.control, msg)
        else ioNs.emit(uib.ioChannels.control, msg)

        if ( (! Object.prototype.hasOwnProperty.call(msg, 'topic')) && (node.topic !== '') ) msg.topic = node.topic

        // copy msg to output port #2 if required
        if ( output === true ) node.send([null, msg])
    }, // ---- End of getProps ---- //

    
    /** Check authorisation validity - called for every msg received from client if security is on
     * @param {object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {string} socketId The client's socket id
     * @param {object} log Custom logger instance
     * @param {object} uib Reference to the core uibuilder config object
     * @returns {_auth} An updated _auth object
     */
    authCheck: function(msg, ioNs, node, socketId, log, uib) { // eslint-disable-line no-unused-vars
        /** @type {MsgAuth} */
        var _auth = dummyAuth

        // TODO: remove log output
        tilib.mylog('[uibuilder:authCheck] Use Security _auth: ', msg._auth, `. Node ID: ${node.id}`)

        // Has the client included msg._auth? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth || msg._auth === undefined) {
            node.warn('No msg._auth provided')
            _auth.info.error = 'Client did not provide a msg._auth'

            this.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type {_auth} */
                '_auth': _auth,
            }, ioNs, node, uib, socketId, false)

            return _auth
        }

        // Has the client included msg._auth.id? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth.id || msg._auth.id === null) {
            _auth.info.error = 'Client did not provide an _auth.id'

            this.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type {_auth} */
                '_auth': _auth,
            }, ioNs, node, uib, socketId, false)

            return _auth
        }

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
     * @param {MsgAuth} _auth _
     * @param {uibNode} node  Reference to the calling uibuilder node instance.
     * @returns {MsgAuth}  { valid: [boolean], data: [object], newToken: [string], err: [object] }
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

        if ( ! _auth.info ) _auth.info = {}
        _auth.jwt = undefined
        _auth.info.error = false

        try {
            _auth.info.verify = jsonwebtoken.verify(_auth.jwt, node.jwtSecret, options) // , callback])
            _auth = this.createToken(_auth, node)
            //_auth.info.validJwt = true // set in createToken, also the jwt & expiry
        } catch(err) {
            _auth.info.error = err.message
            _auth.info.validJwt = false
        }

        // TODO ??? Add security.js function call to enable further validation of token contents - e.g. source IP address

        console.log('[uibuilder:uiblib.js:checkToken] response: ', _auth)
        return _auth
    }, // ---- End of checkToken ---- //

    /** Process a logon request
     * msg._auth contains any extra data needed for the login
     * @param {object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket _
     * @param {object} log Custom logger instance
     * @param {object} uib Constants from uibuilder.js
     * @returns {boolean} True = user logged in, false = user not logged in
     */
    logon: function(msg, ioNs, node, socket, log, uib) {

        /** @type {MsgAuth} */
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
    |    This works, but with warnings.   |
    +---------------------------------------------------------------+
    `
                log.warn(`[uibuilder:uiblib:logon] **WARNING** ${_auth.info.warning}`)
            } else {
                _auth.info.error = `
    
    +---------------------------------------------------------------+
    | uibuilder security warning:                                   |
    |    A logon is being processed without TLS security turned on. |
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
                securitySrc = path.join(uib.rootFolder, '..', '..', uib.configFolderName,'security.js')
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
            if ( _auth.info.validJwt === true ) {
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
     * @param {object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO instance to use
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket _
     * @param {object} log Custom logger instance
     * @param {object} uib uibuilder's master variables
     * @returns {_auth} Updated _auth
     */
    logoff: function(msg, ioNs, node, socket, log, uib) { // eslint-disable-line no-unused-vars
        /** @type {MsgAuth} */
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
     * @param {string=} type Optional. 'short' or 'full'. How much checking to do
     * @returns {boolean} _
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

}

