/** Manage Security on behalf of uibuilder
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

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * typedef {import('socket.io').Namespace} socketioNs
 */
 
const tilib    = require('./tilib')   // General purpose library (by Totally Information)
//const uiblib  = require('./uiblib')  // Utility library for uibuilder
const sockets  = require('./socket')  // Access to Socket.IO server
const path     = require('path')
const fs       = require('fs-extra')

// Only used for type checking
const socketio = require('socket.io') // eslint-disable-line no-unused-vars

// This is replaced by the jsonwebtoken if security is activated
var jsonwebtoken = null
// This is replaced by the security.js module if security is enabled and a logon happens
//! Warning: only allows for a single module for all instances at the moment
var securityjs
// File name for the security module
const securityjsFileName = 'security.js'
// Auth failure message string
const authFailureMsg = 'authorisation failure'

// Make sure that we only work out where the security.js file exists only ONCE - see the logon() function
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

//#region ----- Minimal security functions that should be overridden by uibRoot>/.config/security.js or a node instance override -----
/** Dummy user signup function */
function userSignup() {
    throw new Error('[uibuilder:libs/security.js:userSignup] No actual userSignup function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}
/** Dummy user validate function */
function userValidate() {
    throw new Error('[uibuilder:libs/security.js:userValidate] No actual userValidate function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}

/** Capture user logins. Needed to control msgs from Node-RED to the Front-End
 * Unless some details are captured, it would not be possible to limit outgoing messages
 * to only authorised users.
 */
function captureUserAuth() {
    throw new Error('[uibuilder:libs/security.js:captureUserAuth] No actual captureUserAuth function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}
/** Dummy remove user auth function */
function removeUserAuth() {
    throw new Error('[uibuilder:libs/security.js:removeUserAuth] No actual removeUserAuth function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}
/** Dummy check user auth function */
function checkUserAuth() {
    throw new Error('[uibuilder:libs/security.js:checkUserAuth] No actual checkUserAuth function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}

/** Dummy JWT custom validation function */
function jwtValidateCustom() {
    throw new Error('[uibuilder:libs/security.js:jwtValidateCustom] No actual jwtValidateCustom function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}
/** Dummy JWT create custom function */
function jwtCreateCustom() {
    throw new Error('[uibuilder:libs/security.js:jwtCreateCustom] No actual jwtCreateCustom function provided. Check that <uibRoot>/.config/security.js exists and contains a valid version of this function. Cannot continue.')
}
//#endregion ----- -----
 
class UibSec {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    //_isConfigured = false

    constructor() {
        // Replace when node.js v14 used
        this._isConfigured = false

        /** Create dummy methods - will be overwritten later
         *  by master template in setup (because we need the uib variable)
         *  and again if there is a local override (because we need the node variable)
         */
        this.userSignup = userSignup
        this.userValidate = userValidate
        this.captureUserAuth = captureUserAuth
        this.removeUserAuth = removeUserAuth
        this.checkUserAuth = checkUserAuth
        this.jwtValidateCustom = jwtValidateCustom
        this.jwtCreateCustom = jwtCreateCustom

        // Name of the security.js file that should be loaded. Set in logon()
        this.securitySrc = ''

        // Track node instances that have security turned on
        this.trackNodes = {}

        /** Make dummyAuth available
         * @type {MsgAuth}
         */
        this.dummyAuth = dummyAuth
    }

    /** Configure this class instance.
     * Gets round the inability to pass constructor params to a singleton
     * Also allows the class instance to be configured at a different time to the `require`
     * @param {object} uib reference to uibuilder 'global' configuration object
     */
    setup( uib ) {    

        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            // Can't set up this instance until we know that security is required
            // on at least 1 instance of uib. So this will be called at instance
            // level and therefore is bound to be called >1 - so don't warn.
            uib.RED.log.trace('[uibuilder:security:setup] Setup has already been called, calling again is ignored.')
            return
        }

        if ( ! uib ) {
            throw new Error('[uibuilder:security.js] Called without required uib parameter')
        }

        /** @type {runtimeRED} */
        this.RED = uib.RED

        this.uib = uib
        this.log = uib.RED.log

        /** Replace dummy methods with those from <uibRoot>/.config/security.js - need to reassign again at node instance level in case local override is used */
        const securityjs = require( path.join(uib.rootFolder, uib.configFolderName, securityjsFileName) )
        this.reallocateMethod('userSignup', securityjs)
        this.reallocateMethod('userValidate', securityjs)
        this.reallocateMethod('captureUserAuth', securityjs)
        this.reallocateMethod('removeUserAuth', securityjs)
        this.reallocateMethod('checkUserAuth', securityjs)
        this.reallocateMethod('jwtValidateCustom', securityjs)
        this.reallocateMethod('jwtCreateCustom', securityjs)

        this._isConfigured = true
    }

    /** Allow the isConfigured flag to be read (not written) externally 
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }
    
    /** Re-allocate an existing method definition
     * @param {string} methodName Name of the method to reallocate
     * @param {object} source Where to take the new method from
     */
    reallocateMethod(methodName, source) {
        if ( source[methodName] && (typeof source[methodName] === 'function') ) this[methodName] = source[methodName]
    }

    /** Check an _auth object for the correct schema 
     * @param {MsgAuth} _auth The _auth object to check
     * @param {string=} type Optional. 'short' or 'full'. How much checking to do
     * @returns {boolean} True if the auth check succeeded
     */
    chkAuth(_auth, type='short') { // eslint-disable-line class-methods-use-this
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
    } // ---- End of chkAuth() ---- // 
    
    //? Consider adding isConfigered checks on each method?

    //#region ===== Instance-level methods (require `node` param) ===== //

    /** Set up security for a specified node instance
     * @param {uibNode} node The node object
     * @returns {void} _
     */
    setupInstance( node ) {

        const log = this.RED.log
        const uib = this.uib

        // Track
        if (this.trackNodes[node.url]) {
            log.info(`[uibuilder:security:setupInstance] ${node.url} is already set up, calling again is ignored.`)
            return
        }
        this.trackNodes[node.url] = {
            id: node.url,
            nodeId: node.id // allows us to track back to the actual node in Node-RED
        }

        tilib.mylog(`[uibuilder:security:setupInstance] ${node.url} security is set up.`)

        if ( node.useSecurity !== true ) return
        // The rest of the setup is only for if security is turned on

        // If an instance specific version of the security module exists, use it or use master copy or fail
        // On fail, output to NR log & exit the logon - don't tell the client as that would be leaking security info
        if ( this.securitySrc === '' ) { // make sure this only runs once
            this.securitySrc = path.join(node.customFolder,securityjsFileName)
            if ( ! fs.existsSync(this.securitySrc) ) {
                // Otherwise try to use the central version in uibRoot/.config
                this.securitySrc = path.join(uib.rootFolder, uib.configFolderName,securityjsFileName)
                if ( ! fs.existsSync(this.securitySrc) ) {
                    // Otherwise use the template version from ./templates/.config
                    this.securitySrc = path.join(__dirname, 'templates', '.config', securityjsFileName)

                    // And output a warning if in dev mode, fail in production mode
                    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
                        log.warn('[uibuilder:uiblib:logon] Security is ON but no `security.js` found. Using master template. Please replace with your own code.')

                        fs.copy(this.securitySrc, path.join(uib.configFolderName,securityjsFileName), {overwrite:false, preserveTimestamps:true}, err => {
                            if (err) log.error('[uibuilder:uiblib:logon] Copy of master template `security.js` FAILED.', err)
                            else {
                                log.warn('[uibuilder:uiblib:logon] Copy of master template `security.js` SUCCEEDED. Please restart Node-RED to use it.')
                            }
                        })
                    } else {
                        // In production mode, don't allow insecure processes - fail now
                        log.error('[uibuilder:uiblib:logon] Security is ON but no `security.js` found. See uibuilder security docs for details.')
                    }
                }
            }

            //! WARNING: This only allows for 1 security.js file across all instances - it doesn't allow per-instance overrides
            try {
                securityjs = require( this.securitySrc )
            } catch (e) {
                log.error('[uibuilder:uiblib:logon] Security is ON but `security.js` could not be `required`. Cannot process logons. Is security.js a valid Node.js module?', e)
            }
        }

        // Make sure that securityjs has the correct functions available or log and exit
        // TODO Validate for additional functions?
        if ( ! securityjs.userValidate ) {
            log.error('[uibuilder:uiblib:logon] Security is ON but `security.js` does not contain the required function(s). Cannot process logon. Check docs and change file.')
        }

    } // --- end of setupInstance --- //

    /** Check authorisation validity - called for every msg received from client if security is on
     * @param {object} msg The input message from the client
     * @param {uibNode} node The node object
     * @param {string} socketId The client's socket id
     * param {Object} log Custom logger instance
     * param {Object} uib Reference to the core uibuilder config object
     * @returns {_auth} An updated _auth object
     */
    authCheck(msg, node, socketId) { // eslint-disable-line no-unused-vars
        /** @type {MsgAuth} */
        var _auth = dummyAuth

        /** @type {socketio.Namespace} Socket.IO namespace to use */
        //const ioNs = sockets.getNs(node)

        // TODO: remove log output
        tilib.mylog('[uibuilder:authCheck] Use Security _auth: ', msg._auth, `. Node ID: ${node.id}`)

        // Has the client included msg._auth? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth || msg._auth === undefined) {
            node.warn('No msg._auth provided')
            _auth.info.error = 'Client did not provide a msg._auth'

            sockets.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type {_auth} */
                '_auth': _auth,
            }, node, socketId, false)

            return _auth
        }

        // Has the client included msg._auth.id? If not, send back an unauth msg
        // TODO: Only send if msg was on std channel NOT on control channel
        if (!msg._auth.id || msg._auth.id === null) {
            _auth.info.error = 'Client did not provide an _auth.id'

            sockets.sendControl({
                'uibuilderCtrl': 'Auth Failure',
                'topic': node.topic || undefined,
                /** @type {_auth} */
                '_auth': _auth,
            }, node, socketId, false)

            return _auth
        }

        //      does the client have a valid session?
        //      if not, return a not logged in control msg

        _auth = this.checkToken(msg._auth, node)

        /*
        console.log('[uibuilder:socket.on.control] result of checkToken _auth: ', _auth)
        if (_auth.info.validJwt === true) {
            uiblib.sendControl({
                'uibuilderCtrl': 'session valid',
                'topic': node.topic || undefined,
                '_auth': _auth
            }, ioNs, node, socket.id, false, uib)
        } else {
            uiblib.sendControl({
                'uibuilderCtrl': 'session invalid',
                'topic': node.topic || undefined,
                '_auth': _auth
            }, ioNs, node, socket.id, false, uib)
        }
        */

        return _auth
    } // ---- End of authCheck ---- //

    /** Create a new JWT token based on a user id, session length and security string 
     * @param {MsgAuth} _auth The _auth object
     * @param {uibNode} node  Reference to the calling uibuilder node instance.
     * @param {object} clientDetails Extracted from client socket.io connection
     * @returns {MsgAuth} Updated _auth including a signed JWT token string, expiry date/time & info flag.
     */
    createToken(_auth, node, clientDetails) { // eslint-disable-line class-methods-use-this
        const log = this.log

        // TODO if securityjs === null we need to load the security.js? Currently only done in the logon() function

        // If anything fails, ensure that the token is invalidated
        try {

            if (jsonwebtoken === null) jsonwebtoken = require('jsonwebtoken')

            if (node.jwtSecret === undefined ) {
                log.error('[uibuilder.security.js:createToken] Nodes JWT Secret is undefined, using default.')
                node.jwtSecret = 'this IS not MUCH of a SEcrET'
            }

            const sessionExpiry = Math.floor(Number(Date.now()) / 1000) + Number(node.sessionLength)

            // TODO ??? Add security.js function call to enable further validation of token contents
            const jwtData = {
                // When does the token expire? Value is seconds since 1970
                exp: sessionExpiry,
                // Subject = unique id to identify user
                sub: _auth.id,
                // Issuer
                iss: 'uibuilder',
                // Audience
                aud: node.url,
                // Client IP Address (v4 or v6) - always include but checking is optional
                ip: clientDetails.remoteAddress,
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

            log.error(`[uibuilder.security.js:createToken] Could not create JWT. ${e.message}`)
        }

        return _auth

    } // ---- End of createToken ---- //

    /** Check whether a received JWT token is valid. If it is, then try to update it. 
     * @param {MsgAuth} _auth The _auth object
     * @param {uibNode} node  Reference to the calling uibuilder node instance.
     * @param {object} clientDetails Extracted from client socket.io connection
     * @returns {_auth}  { valid: [boolean], data: [object], newToken: [string], err: [object] }
     */
    checkToken(_auth, node, clientDetails) { // eslint-disable-line class-methods-use-this
        const log = this.log

        if (jsonwebtoken === null)  jsonwebtoken = require('jsonwebtoken')

        // TODO if securityjs === null we need to load the security.js? Currently only done in the logon() function

        const options = {
            // Check that the issuer (iss) is correct
            issuer: 'uibuilder',
            // Check the audience (aud)
            audience: node.url,
            // Check the subject = unique id to identify user
            subject: _auth.id,
            // Time in seconds against which all timestamps are checked
            clockTimestamp: Math.floor(Date.now() / 1000), // seconds since 1970
            //clockTolerance: 10, // seconds
            //maxAge: "7d",
            // Return full details, not just decoded payload
            complete: false,
        }

        if ( ! _auth.info ) _auth.info = {}
        _auth.info.message = undefined
        _auth.info.error = undefined

        let jwtData

        try { // Validate the payload of the JWT

            // Sync verify generates an error if not a valid JWT - save decoded payload for further verifications
            jwtData = jsonwebtoken.verify(_auth.jwt, node.jwtSecret, options) // , callback])

            // verify does not check custom payload properties
            if ( node.jwtCheckIp === true && jwtData.ip !== clientDetails.remoteAddress ) 
                throw new Error('JWT IP Address does not match client IP')

            // TODO ??? Add security.js function call to enable further validation of token contents 

            // If we got here, JWT is valid & has passed all checks
            _auth.info.validJwt = true

        } catch(e) {

            // Could not validate the JWT or it didn't pass the validation checks
            _auth.jwt = undefined
            _auth.info.error = 'JWT is invalid, client authorisation removed. See server logs for details.'
            _auth.info.validJwt = false
            if (node.useSecurity) { // not an error if security not being used
                log.error(`[uibuilder.security.js:checkToken] '${node.url}' JWT Error. ${e.message}`)
            }

        }

        //tilib.mylog('[uibuilder:socket.js:checkToken] JWT DECODED:', jwtData)
        //tilib.mylog('[uibuilder:socket.js:checkToken] response: ', _auth)

        return _auth

    } // ---- End of checkToken ---- //

    /** Process a logon request
     * msg._auth contains any extra data needed for the login
     * @param {object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO namespace for this uib instance
     * @param {uibNode} node The node object
     * @param {socketio.Socket} socket Socket.IO instance to use
     * param {object} log Custom logger instance
     * param {object} uib Constants from uibuilder.js
     * @returns {boolean} True = user logged in, false = user not logged in
     */
    logon(msg, ioNs, node, socket) {

        const log = this.log
        const uib = this.uib

        /** @type {MsgAuth} */
        var _auth = msg._auth || dummyAuth
        if (!_auth.info) _auth.info = {}
        _auth.userValidated = false

        // Only process if security is turned on. Otherwise output info to log, inform client and exit
        if ( node.useSecurity !== true ) {
            log.info('[uibuilder:socket.js:logon] Security is not turned on, ignoring logon attempt.')

            _auth.info.error = 'Security is not turned on for this uibuilder instance'

            this.sendControl({
                uibuilderCtrl: authFailureMsg,
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, false)

            return _auth.userValidated
        }

        // Check if using TLS - if not, send warning to log & inform client
        if ( socket.handshake.secure !== true ) {
            _auth.info.warning = `

+---------------------------------------------------------------+
| uibuilder security warning:                                   |
|    A logon is being processed without TLS security turned on. |
|    This works, but with warnings.   |
+---------------------------------------------------------------+
`
            log.warn(`[uibuilder:socket.js:logon] **WARNING** ${_auth.info.warning}`)
        }

        // Make sure that we at least have a user id, if not, inform client and exit
        if ( ! _auth.id ) {
            log.warn('[uibuilder:socket.js:logon] No _auth.id provided')

            //TODO ?? record fail ??
            _auth.userValidated = false
            _auth.info.error = 'Logon failed. No id provided'

            // Report fail to client & Send output to port #2
            this.sendControl({
                uibuilderCtrl: authFailureMsg,
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, true)

            return _auth.userValidated
        }

        /** Attempt logon */

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
                uibuilderCtrl: authFailureMsg,
                topic: msg.topic || node.topic,
                '_auth': _auth,
            }, ioNs, node, uib, socket.id, true)
        }

        return _auth.userValidated
    } // ---- End of logon ---- //

    /** Process a logoff request
     * msg._auth contains any extra data needed for the login
     * @param {object} msg The input message from the client
     * @param {socketio.Namespace} ioNs Socket.IO namespace for this uib instance
     * @param {uibNode} node The node object
     * @param {string} socketId Socket.IO 
     * @returns {_auth} Updated _auth
     */
    logoff(msg, ioNs, node, socketId) { // eslint-disable-line no-unused-vars
        //const log = this.RED.log
        const uib = this.uib

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
        }, ioNs, node, uib, socketId, true)

        return _auth
    } // ---- End of logoff ---- //

    /** Check whether a connected client is valid and has valid JWT & valid auth details
     * Called from socket.js
     * @param {object} msg The input message from the client
     * @param {uibNode} node The node object
     * @param {object} clientDetails Extracted from client socket.io connection
     * @returns {_auth} Updated _auth
     */
    authCheck2(msg, node, clientDetails) { // eslint-disable-line class-methods-use-this
        // TODO Check if msg._auth exists

        var _auth = msg._auth

        // if no jwt, create one now
        if (!_auth.jwt) {
            //tilib.mylog('[uibuilder:uiblib.js:authCheck2] No JWT. Creating. ')
            _auth = this.createToken(_auth, node, clientDetails)
        } else {
            //tilib.mylog('[uibuilder:uiblib.js:authCheck2] JWT, checking. ', _auth)
            _auth = this.checkToken(_auth, node, clientDetails)
        }

        //tilib.mylog('[uibuilder:uiblib.js:authCheck2] _auth after JWT. ', _auth)

        // If valid JWT, check if user still valid
        if ( _auth.info.validJwt === true )
            _auth = this.checkUserAuth(_auth, node.sessionLength)
        else // Otherwise, make sure that users auth is removed
            this.removeUserAuth(_auth)

        //tilib.mylog('[uibuilder:socket.js:authCheck2] Ending auth check. ', _auth)
        return _auth
    }

    //#endregion ===== End of Instance-level methods ===== //

} // ==== End of UibSec Class Definition ==== //

/** Singleton model. Only 1 instance of UibSec should ever exist.
 * Use as: `const security = require('.libs/security.js')`
 * Wrap in try/catch to force out better error logging if there is a problem
 */
let uibsec = new UibSec()
module.exports = uibsec

// Make this globally available so that it can be shared with other common nodes from TotallyInformation
if ( ! global.totallyInformationShared ) global.totallyInformationShared = {}
global.totallyInformationShared.uibsec = uibsec

//console.log('>>>> TI GLOBAL <<<<', global.totallyInformationShared)

// EOF
