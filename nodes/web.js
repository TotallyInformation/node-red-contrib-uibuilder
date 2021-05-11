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

const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const tilib = require('./tilib.js')
const serveStatic = require('serve-static')

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

        /** We need an http server to serve the page and vendor packages. The app is used to serve up the Socket.IO client. */
        
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

    /** Compare the in-memory package list against packages actually installed.
     * Also check common packages installed against the master package list in case any new ones have been added.
     * Updates the package list file and uib.installedPackages
     * param {Object} vendorPaths Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
     * @param {string} newPkg Default=''. Name of a new package to be checked for in addition to existing. 
     * @return {Object} uib.installedPackages
     */
    checkInstalledPackages(newPkg='') {
        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        const log = this.log
        const app = this.app

        const debug = false
        const userDir = RED.settings.userDir

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
        merged.forEach( (pkgName, _i) => { // eslint-disable-line no-unused-vars
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
                if ( ! Object.prototype.hasOwnProperty.call(pj, 'ERROR') ) {
                    // We only know for sure package exists now
                    pkgExists = true
                }
            }

            // Check to see if the package is in the current list
            const isInCurrent = Object.prototype.hasOwnProperty.call(installedPackages, pkgName)

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
                // Find homepage
                installedPackages[pkgName].homepage = pj.homepage
                // Find main entry point (or '')
                installedPackages[pkgName].main = pj.main || ''

                /** Try to guess the browser entry point (or '')
                 * @since v3.2.1 Fix for packages misusing the browser property - might be an object see #123
                 */
                let browserEntry = ''
                if ( pj.browser ) {
                    if ( typeof pj.browser === 'string' ) browserEntry = pj.browser
                }
                if ( browserEntry === '' ) {
                    browserEntry = pj.jsdelivr || pj.unpkg || ''
                }
                installedPackages[pkgName].browser = browserEntry

                // Replace generic with specific entries if we know them
                if ( pkgName === 'socket.io' ) {
                    //installedPackages[pkgName].url  = '../uibuilder/socket.io/socket.io.js'
                    installedPackages[pkgName].main = 'socket.io.js'
                }

                // If we need to load it & we have app available
                if ( (installedPackages[pkgName].loaded === false) && (app !== undefined) ) {
                    /** Add a static path to serve up the files */
                    installedPackages[pkgName].loaded = this.servePackage(pkgName)
                }

            } else { // (package not actually installed)
                // If in current, flag for unloading then delete from current
                if ( isInCurrent ) { // eslint-disable-line no-lonely-if
                    if ( app !== undefined) {
                        installedPackages[pkgName].loaded = this.unservePackage(pkgName)
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

    } // ---- End of checkInstalledPackages ---- //

    /** Add an installed package to the ExpressJS app to allow access from URLs
     * @param {string} packageName Name of the front-end npm package we are trying to add
     * @returns {boolean} True if loaded, false otherwise
     */
    servePackage(packageName) {
        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        const log = this.log
        const app = this.app

        let userDir = RED.settings.userDir        
        let pkgDetails = null
        let installedPackages = uib.installedPackages

        // uib.installedPackages[packageName] MUST exist and be populated (done by uiblib.checkInstalledPackages())
        if ( Object.prototype.hasOwnProperty.call(installedPackages, packageName) ) {
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
        }

        // What is the URL for this package? Remove the leading "../"
        var vendorPath
        try {
            vendorPath = pkgDetails.url.replace('../','/') // "../uibuilder/vendor/socket.io" tilib.urlJoin(uib.moduleName, 'vendor', packageName)
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
    } // ---- End of servePackage ---- //

    /** Remove an installed package from the ExpressJS app
     * @param {string} packageName Name of the front-end npm package we are trying to add
     * @returns {boolean} True if unserved, false otherwise
     */
    unservePackage(packageName) {
        // Reference static vars
        //const uib = this.uib
        //const RED = this.RED
        //const log = this.log
        const app = this.app
        
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
    } // ---- End of unservePackage ---- //

} // ==== End of Web Class Definition ==== //

/** Singleton model. Only 1 instance of UibSockets should ever exist.
 * Use as: `const sockets = require('./socket.js')`
 */
module.exports = new Web()

// EOF
