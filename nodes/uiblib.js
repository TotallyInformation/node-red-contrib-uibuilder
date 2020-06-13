/**
 * Utility library for uibuilder
 * 
 * Copyright (c) 2020 Julian Knight (Totally Information)
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

const path = require('path')
const fs = require('fs-extra')
const tilib = require('./tilib.js')
const util = require('util')
const serveStatic = require('serve-static')

// Make sure that we only work out where the security.js file exists only ONCE - see the logon() function
let securitySrc = ''
let securityjs = null
let jsonwebtoken = null

module.exports = {

    /** Complex, custom code when processing an incoming msg to uibuilder node input should go here
     * Needs to return the msg object. Not for processing msgs coming back from front-end.
     */
    inputHandler: function(msg, send, done, node, RED, io, ioNs, log) {
        node.rcvMsgCount++
        log.trace(`[uiblib:${node.url}] msg received via FLOW. ${node.rcvMsgCount} messages received`, msg)

        // If the input msg is a uibuilder control msg, then drop it to prevent loops
        if ( msg.hasOwnProperty('uibuilderCtrl') ) return null

        //setNodeStatus({fill: 'yellow', shape: 'dot', text: 'Message Received #' + node.rcvMsgCount}, node)

        // Remove script/style content if admin settings don't allow
        if ( node.allowScripts !== true ) {
            if ( msg.hasOwnProperty('script') ) delete msg.script
        }
        if ( node.allowStyles !== true ) {
            if ( msg.hasOwnProperty('style') ) delete msg.style
        }

        // pass the complete msg object to the uibuilder client
        // TODO: This should have some safety validation on it!
        if (msg._socketId) {
            //! If security is active ...
            //  ...If socketId not validated as having a current session, don't send
            log.trace(`[${node.url}] msg sent on to client ${msg._socketId}. Channel: ${node.ioChannels.server}`, msg)
            ioNs.to(msg._socketId).emit(node.ioChannels.server, msg)
        } else {
            //? - is there any way to prevent sending to clients not logged in?
            log.trace(`[${node.url}] msg sent on to ALL clients. Channel: ${node.ioChannels.server}`, msg)
            ioNs.emit(node.ioChannels.server, msg)
        }

        if (node.fwdInMessages) {
            // Send on the input msg to output
            send(msg)
            done()
            log.trace(`[${node.url}] msg passed downstream to next node`, msg)
        }

        return msg
    }, // ---- End of inputHandler function ---- //

    /** Do any complex, custom node closure code here
     * @param {function|null} [done=null]
     * @param {Object} node
     * @param {Object} RED
     * @param {Object} ioNs - Instance of Socket.IO Namespace
     * @param {Object} io - Instance of Socket.IO
     * @param {Object} app - Instance of ExpressJS app
     * @param {Object} log - Winston logging instance
     */
    processClose: function(done = null, node, RED, ioNs, io, app, log, instances) {
        log.trace(`[${node.url}] nodeGo:on-close:processClose`)

        this.setNodeStatus({fill: 'red', shape: 'ring', text: 'CLOSED'}, node)

        // Let all the clients know we are closing down
        this.sendControl({ 'uibuilderCtrl': 'shutdown' }, ioNs, node)

        // Disconnect all Socket.IO clients
        const connectedNameSpaceSockets = Object.keys(ioNs.connected) // Get Object with Connected SocketIds as properties
        if ( connectedNameSpaceSockets.length >0 ) {
            connectedNameSpaceSockets.forEach(socketId => {
                ioNs.connected[socketId].disconnect() // Disconnect Each socket
            })
        }
        ioNs.removeAllListeners() // Remove all Listeners for the event emitter
        delete io.nsps[node.ioNamespace] // Remove from the server namespaces

        // We need to remove the app.use paths too as they will be recreated on redeploy
        // we check whether the regex string matches the current node.url, if so, we splice it out of the stack array
        var removePath = []
        var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\' + tilib.urlJoin(node.url)) + '.*$')
        var urlReVendor = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
        // For each entry on ExpressJS's server stack...
        app._router.stack.forEach( function(r, i, _stack) {
            // Check whether the URL matches a vendor path...
            let rUrlVendor = r.regexp.toString().replace(urlReVendor, '')
            // If it DOES NOT, then...
            if (rUrlVendor !== '') {
                // Check whether the URL is a uibuilder one...
                let rUrl = r.regexp.toString().replace(urlRe, '')
                // If it IS ...
                if ( rUrl === '' ) {
                    // Mark it for removal because it will be re-created by nodeGo() when the nodes restart
                    removePath.push( i )
                    // @since 2017-10-15 Nasty bug! Splicing changes the length of the array so the next splice is wrong!
                    //app._router.stack.splice(i,1)
                }
            }
            // NB: We do not want to remove the vendor URL's because they are only created ONCE when Node-RED initialises
        })

        // @since 2017-10-15 - proper way to remove array entries - in reverse order so the ids don't change - doh!
        for (var i = removePath.length -1; i >= 0; i--) {
            app._router.stack.splice(removePath[i],1)
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
     * Sends to all connected clients & outputs a msg to port 2
     * @param {Object} msg The message to output
     * @param {Object} ioNs Socket.IO instance to use
     * @param {Object} node The node object
     * @param {string=} socketId Optional. If included, only send to specific client id
     * @param {boolean=} output Optional. If included, also output to port #2 of the node @since 2020-01-03
     */
    sendControl: function(msg, ioNs, node, socketId, output) {
        if (output === undefined || output === null) output = true

        msg.from = 'server'

        if (socketId) msg._socketId = socketId

        // Send to specific client if required
        if (msg._socketId) ioNs.to(msg._socketId).emit(node.ioChannels.control, msg)
        else ioNs.emit(node.ioChannels.control, msg)

        if ( (! msg.hasOwnProperty('topic')) && (node.topic !== '') ) msg.topic = node.topic

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

    /** DEPRECATED - Add an ExpressJS url for an already npm installed package (doesn't update vendorPaths var)
     * @param {string} packageName Name of the front-end npm package we are trying to add
     * @param {string} installFolder The filing system location of the package (if '', will use findPackage() to search for it)
     * @param {string} moduleName Name of the uibuilder module ('uibuilder')
     * @param {string} userDir Reference to the Node-RED userDir folder
     * @param {Object} log Custom logger instance
     * @param {Object} app ExpressJS web server app instance
     * @param {Object} serveStatic ExpressJS static serving middleware instance
     * @param {Object} RED RED object instance (for error logging)
     * @returns {null|{url:string,folder:string}} Vendor url & fs path
     */
    addPackage: function(packageName, installFolder='', moduleName, userDir, log, app, serveStatic, RED) {
        RED.log.error( '[uibuilder:uiblib:addPackage] THIS FUNCTION IS DEPRECATED. Please raise a GitHub issue.' )
        return

        // if ( installFolder === '' ) {
        //     installFolder = tilib.findPackage(packageName, userDir)
        // }

        // if (installFolder === '' ) {
        //     RED.log.warn(`uibuilder:Module: Failed to add user vendor path - no install found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}`)
        //     return null
        // } else {
        //     let vendorPath = tilib.urlJoin(moduleName, 'vendor', packageName)
        //     log.trace(`[uibuilder:uiblib:addPackage] Adding user vendor path:  ${util.inspect({'url': vendorPath, 'path': installFolder})}`)
        //     try {
        //         app.use( vendorPath, /**function (req, res, next) {
        //             // TODO Allow for a test to turn this off
        //             // if (true !== true) {
        //             //     next('router')
        //             // }
        //             next() // pass control to the next handler
        //         }, */ serveStatic(installFolder) )
                
        //         return {'url': '..'+vendorPath, 'folder': installFolder}
        //     } catch (e) {
        //         RED.log.error(`uibuilder: app.use failed. vendorPath: ${vendorPath}, installFolder: ${installFolder}`, e)
        //         return null
        //     }
        // }
    }, // ---- End of addPackage ---- //

    /** Add an installed package to the ExpressJS app to allow access from URLs
     * @param {string} packageName Name of the front-end npm package we are trying to add
     * @param {Object} uib "Global" uib variable object
     * @param {string} userDir Reference to the Node-RED userDir folder
     * @param {Object} log Custom logger instance
     * @param {Object} app ExpressJS web server app instance
     * @returns {boolean} True if loaded, false otherwise
     */
    servePackage: function(packageName, uib, userDir, log, app) {
        let pkgDetails = null

        let installedPackages = uib.installedPackages

        // uib.installedPackages[packageName] MUST exist and be populated (done by uiblib.checkInstalledPackages())
        if ( installedPackages.hasOwnProperty(packageName) ) {
            pkgDetails = installedPackages[packageName]
        } else {
            log.error('[uibuilder:uiblib.servePackage] Failed to find package in uib.installedPackages')
            return false
        }

        // Where is the node_modules folder for this package?
        const installFolder = pkgDetails.folder

        if (installFolder === '' ) {
            log.error(`[uibuilder:uiblib.servePackage] Failed to add user vendor path - no install folder found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}`)
            return false
        } else {
            // What is the URL for this package? Remove the leading "../"
            try {
                var vendorPath = pkgDetails.url.replace('../','/') // "../uibuilder/vendor/socket.io" tilib.urlJoin(uib.moduleName, 'vendor', packageName)
            } catch (e) {
                log.error(`[uibuilder:uiblib.servePackage] ${packageName} `, e)
                return false
            }
            log.trace(`[uibuilder:uiblib.servePackage] Adding user vendor path:  ${util.inspect({'url': vendorPath, 'path': installFolder})}`)
            try {
                app.use( vendorPath, /**function (req, res, next) {
                    // TODO Allow for a test to turn this off
                    // if (true !== true) {
                    //     next('router')
                    // }
                    next() // pass control to the next handler
                }, */ serveStatic(installFolder, uib.staticOpts) )
                return true
            } catch (e) {
                log.error(`[uibuilder:uiblib.servePackage] app.use failed. vendorPath: ${vendorPath}, installFolder: ${installFolder}`, e)
                return false
            }
        }
    }, // ---- End of servePackage ---- //

    /** Remove an installed package from the ExpressJS app
     * @param {string} packageName Name of the front-end npm package we are trying to add
     * @param {Object} uib "Global" uib variable object
     * @param {string} userDir Reference to the Node-RED userDir folder
     * @param {Object} log Custom logger instance
     * @param {Object} app ExpressJS web server app instance
     * @returns {boolean} True if unserved, false otherwise
     */
    unservePackage: function(packageName, uib, userDir, log, app) {
        let pkgReStr = `/^\\/uibuilder\\/vendor\\/${packageName}\\/?(?=\\/|$)/i`
        let done = false
        // For each entry on ExpressJS's server stack...
        app._router.stack.some( function(r, i) {
            if ( r.regexp.toString() === pkgReStr ) {
                // We can splice inside the array only because we will only do a single one.
                app._router.stack.splice(i,1)
                done = true
                return true
            }
            return false
        })

        return done
    }, // ---- End of unservePackage ---- //

    /** Compare the in-memory package list against packages actually installed.
     * Also check common packages installed against the master package list in case any new ones have been added.
     * Updates the package list file and uib.installedPackages
     * param {Object} vendorPaths Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
     * @param {string} [newPkg] Optional. Name of a new package to be checked for in addition to existing. 
     * @param {Object} uib Name of the uibuilder module ('uibuilder' by default)
     * @param {string} userDir Name of the Node-RED userDir folder currently in use
     * @param {Object} log Custom logger instance
     * @param {Object} [app] Optional. Reference to ExpressJS app. If present each pkg will add a serveStatic.
     * @return {Object} uib.installedPackages
     */
    checkInstalledPackages: function (newPkg='', uib, userDir, log, app=null) {
        const debug = false
        //if (debug) console.log('[uibuilder.uiblib] debugging ', {newPkg, uib, userDir})

        let installedPackages = uib.installedPackages
        let pkgList = []
        let masterPkgList = []
        let merged = []

        //region --- get package lists from files --- //
        // Read packageList and masterPackageList from their files
        try {
            pkgList = fs.readJsonSync(path.join(uib.configFolder, uib.packageListFilename))
        } catch (err) {
            // not an issue
        }
        try {
            masterPkgList = fs.readJsonSync(path.join(uib.configFolder, uib.masterPackageListFilename))
        } catch (err) {
            // no op
        }
        // If neither can be found, that's an error
        if ( (pkgList.length === 0) && (masterPkgList.length === 0) ) {
            log.error(`[uibuilder:uiblib.checkInstalledPackages] Neither packageList nor masterPackageList could be read from: ${uib.configFolder}`)
            return null
        }
        // Make sure we have socket.io in the list
        masterPkgList.push('socket.io')
        //endregion --- get package lists from files --- //

        // Add in the new package as well if requested
        if (newPkg !== '') {
            pkgList.push(newPkg)
        }

        // Merge and de-dup to get a complete list
        merged = tilib.mergeDedupe(Object.keys(installedPackages), pkgList, masterPkgList)

        // For each entry in the complete list ...
        merged.forEach( (pkgName, _i) => {
            // flags
            let pkgExists = false

            let pj = null // package details if found

            // Check to see if folder names present in <userDir>/node_modules
            const pkgFolder = tilib.findPackage(pkgName, userDir)

            // Check whether package is really installed (exists)
            if ( pkgFolder !== null ) {
                
                // Get the package.json
                pj = tilib.readPackageJson( pkgFolder )

                /** The folder delete for npm remove happens async so it may
                 *  still exist when we check. But the package.json will have been removed
                 *  so we don't process the entry unless package.json actually exists
                 */
                if ( ! pj.hasOwnProperty('ERROR')) {
                    // We only know for sure package exists now
                    pkgExists = true
                }
            }

            // Check to see if the package is in the current list
            const isInCurrent = installedPackages.hasOwnProperty(pkgName)

            if ( pkgExists ) {
                // If package does NOT exist in current - add it now
                if ( ! isInCurrent ) {
                    // Add to current & mark for loading
                    installedPackages[pkgName] = {}
                    installedPackages[pkgName].loaded = false
                }

                // Update package info
                installedPackages[pkgName].folder = pkgFolder
                installedPackages[pkgName].url = ['..', uib.moduleName, 'vendor', pkgName].join('/')
                // Find installed version
                installedPackages[pkgName].version = pj.version
                // Find main entry point (or '')
                installedPackages[pkgName].main = pj.main || ''
                // Find browser entry point (or '')
                installedPackages[pkgName].browser = pj.browser || ''
                // Find homepage
                installedPackages[pkgName].homepage = pj.homepage

                // Replace generic with specific entries if we know them
                if ( pkgName === 'socket.io' ) {
                    //installedPackages[pkgName].url  = '../uibuilder/socket.io/socket.io.js'
                    installedPackages[pkgName].main = 'socket.io.js'
                }

                // If we need to load it & we have app available
                if ( (installedPackages[pkgName].loaded === false) && (app !== null) ) {
                    /** Add a static path to serve up the files */
                    installedPackages[pkgName].loaded = this.servePackage(pkgName, uib, userDir, log, app)
                }

            } else { // (package not actually installed)
                // If in current, flag for unloading then delete from current
                if ( isInCurrent ) {
                    if ( app !== null) {
                        installedPackages[pkgName].loaded = this.unservePackage(pkgName, installedPackages, userDir, log, app)
                        if (debug) console.log('[uibuilder.uiblib] checkInstalledPackages - package unserved ', pkgName)
                    }
                    delete installedPackages[pkgName]
                    if (debug) console.log('[uibuilder.uiblib] checkInstalledPackages - package deleted from installedPackages ', pkgName)
                }
            }
        })

        //uib.installedPackages = installedPackages
        
        // Write packageList back to file
        try {
            fs.writeJsonSync(path.join(uib.configFolder,uib.packageListFilename), Object.keys(installedPackages), {spaces:2})
        } catch(e) {
            log.error(`[uibuilder:uiblib.checkInstalledPackages] Could not write ${uib.packageListFilename} in ${uib.configFolder}`, e)
        }

        return uib.installedPackages

    }, // ---- End of checkInstalledPackages ---- //

    /** Validate a url query parameter
     * @param {string} url uibuilder URL to check (not a full url, the name used by uibuilder)
     * @param {Object} res The ExpressJS response variable
     * @param {string} caller A string indicating the calling function - used for logging only
     * @param {Object} log The uibuilder log Object
     * @return {boolean} True if the url is valid, false otherwise (having set the response object)
     */
    checkUrl: function (url, res, caller, log) {
        // We have to have a url to work with
        if ( url === undefined ) {
            log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter not provided`)
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return false
        }
        // URL must not exceed 20 characters
        if ( url.length > 20 ) {
            log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter is too long (>20 characters)`)
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return false 
        }
        // URL must be more than 0 characters
        if ( url.length < 1 ) {
            log.error(`[uiblib.checkUrl:${caller}] Admin API. url parameter is empty`)
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return false
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( url.includes('..') ) {
            log.error('[uibdeletefile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return false
        }

        return true
    }, // ---- End of checkUrl ---- //


    /** Create a new JWT token based on a user id, session length and security string 
     * @param {String} userId The unique id that identifies the user.
     * @param {Object} node  Reference to the calling uibuilder node instance.
     * @returns {Object} A base64 encoded, signed JWT token string & expiry date/time.
     */
    createToken: function(userId, node) {

        if (jsonwebtoken === null) jsonwebtoken = require('jsonwebtoken')

        const sessionExpiry = Math.floor(Date.now() / 1000) + node.sessionLength

        const jwtData = {
            // When does the token expire? Value is seconds since 1970
            exp: sessionExpiry,
            // Subject = unique id to identify user
            sub: userId,
            // Issuer
            iss: 'uibuilder',
        }

        return { 'token': jsonwebtoken.sign(jwtData, node.credentials.jwtSecret), 'tokenExpiry': sessionExpiry * 1000 }

    }, // ---- End of createToken ---- //

    /** Check whether a received JWT token is valid. If it is, then try to update it. 
     * @param {String} token A base64 encoded, signed JWT token string.
     * @param {Object} node  Reference to the calling uibuilder node instance.
     * @returns {Object}  { valid: [boolean], data: [object], newToken: [string], err: [object] }
     */
    checkToken: function(token, node) {
        if (jsonwebtoken === null)  jsonwebtoken = require('jsonwebtoken')

        const options = {
            issuer: 'uibuilder',
            clockTimestamp: Math.floor(Date.now() / 1000), // seconds since 1970
            //clockTolerance: 10, // seconds
            //maxAge: "7d",
        }

        var response = { 'valid': false, data: undefined, newToken: undefined, err: undefined }

        try {
            response.data = jsonwebtoken.verify(token, node.credentials.jwtSecret, options) // , callback])
            response.newToken = this.createToken(response.data.sub, node)
            response.valid = true
        } catch(err) {
            response.err = err
            response.valid = false
        }

        return response

    }, // ---- End of checkToken ---- //

    /** Process a logon request
     * msg.payload contains any extra data needed for the login
     */
    logon: function(msg, ioNs, node, socket, log, uib) {

        // Only process if security is turned on
        if ( node.useSecurity !== true ) {
            log.info('[uibuilder:uiblib:logon] Security is not turned on, ignoring logon attempt.')
            return
        }

        // console.log('SOCKET', Object.keys(socket))
         // console.log('SOCKET.client', Object.keys(socket.client))
         // console.log('SOCKET.conn', Object.keys(socket.conn))
         // console.log('SOCKET.server', Object.keys(socket.server))
         // console.log('SOCKET.flags', Object.keys(socket.flags))
         // console.log('SOCKET.handshake', Object.keys(socket.handshake))
         //console.log('SOCKET.handshake', socket.handshake)
         //console.dir(msg)

        const _uibAuth = msg._uibAuth || {}

        // Make sure that we at least have a user id
        if ( ! _uibAuth.id ) {
            log.warn('')

            // ?? record fail ??
            _uibAuth.reason = 'Logon failed. No id provided'

            // Report fail to client & Send output to port #2
            this.sendControl({
                uibuilderCtrl: 'authorisation failure',
                topic: msg.topic || node.topic,
                '_uibAuth': _uibAuth,
            }, ioNs, node, socket.id, true)
        }

        // Check if using TLS - if not, send warning to log
        if ( socket.handshake.secure !== true ) {
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
                _uibAuth.warning = 'A logon is being processed without TLS security turned on - this will not work in a non-development environment. See the uibuilder security docs for details'

                log.warn(`[uibuilder:uiblib:logon] **WARNING** ${_uibAuth.warning}`)
            } else {
                log.error('[uibuilder:uiblib:logon] **ERROR** A logon is being attempted in a non-development environment without TLS security turned on - this is not permitted. See the uibuilder security docs for details')
                
                // Report fail to client but don't output to port #2 as error msg already sent
                _uibAuth.reason = 'Logons cannot be processed without TLS in non-development environments'

                this.sendControl({
                    uibuilderCtrl: 'authorisation failure',
                    topic: msg.topic || node.topic,
                    '_uibAuth': _uibAuth,
                }, ioNs, node, socket.id, false)
                return
            }
        }

        /** Attempt logon 
         * @type {boolean|Object}
         */
        let auth = false

        // If an instance specific version of the security module exists, use it or use master
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

                        if (node.copyIndex === true) {
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
                        return
                    }
                }
            }

            securityjs = require( securitySrc )
        }

        // Use security module to validate user
        auth = securityjs.userValidate(msg._uibAuth)
        let authData = null
        if ( Object.prototype.toString.call(auth) === '[object Object]' ) {
            authData = auth.authData || {}
            auth = auth.userValidated
        }

        // Send responses
        if ( auth === true ) {
            // Record session details

            // Add token
            const tokenData = this.createToken(_uibAuth.id, node)
            console.log(tokenData)
            _uibAuth.authToken = tokenData.token
            _uibAuth.authTokenExpiry = tokenData.tokenExpiry

            // Add success reason and add any optional data from the user validation
            _uibAuth.reason = 'Logon successful'
            _uibAuth.authData = authData

            // Report success & send token to client
            this.sendControl({
                'uibuilderCtrl': 'authorised',
                'topic': msg.topic || node.topic,
                '_uibAuth': _uibAuth,
            }, ioNs, node, socket.id, false)

            // Send output to port #2 manually
            node.send([null, {
                uibuilderCtrl: 'authorised',
                topic: msg.topic || node.topic,
                _socketId: socket.id,
                from: 'server',
                '_uibAuth': {
                    // Try to show some usefull info without revealing too much
                    id: _uibAuth.id,
                    authTokenExpiry: _uibAuth.authTokenExpiry,
                    // Optional data from the client
                    uid: _uibAuth.uid,
                    user: _uibAuth.user,
                    name: _uibAuth.name,
                },
            }])
        } else { // auth <> true
            // ?? record fail ??
            _uibAuth.reason = 'Logon failed. Invalid id or password'

            // Report fail to client & Send output to port #2
            this.sendControl({
                uibuilderCtrl: 'authorisation failure',
                topic: msg.topic || node.topic,
                '_uibAuth': _uibAuth,
            }, ioNs, node, socket.id, true)
        }
    }, // ---- End of logon ---- //

    /** Process a logoff request
     * msg.payload contains any extra data needed for the login
     */
    logoff: function(msg, ioNs, node, socket, log) {
        // Only process if security is turned on
        if ( node.useSecurity !== true ) {
            log.info('[uibuilder:uiblib:logoff] Security is not turned on, ignoring logoff attempt.')
            return
        }

        // Check that request is valid (has valid token)
        // Check that session exists
        // delete session entry

        // confirm logoff to client & Send output to port #2
        this.sendControl({
            uibuilderCtrl: 'logged off',
            topic: msg.topic || node.topic,
            '_uibAuth': {
                reason: 'Logoff successful',
            },
        }, ioNs, node, socket.id, true)
    }, // ---- End of logoff ---- //

} // ---- End of module.exports ---- //
