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

/** --- Type Defs ---
 * @typedef {import('../typedefs.js').uibNode} uibNode
 * @typedef {import('../typedefs.js').runtimeRED} runtimeRED
 */

const path = require('path')
const util = require('util')
const fs = require('fs-extra')
const tilib = require('./tilib')
const serveStatic = require('serve-static')
const serveIndex    = require('serve-index')
// Only used for type checking
const Express = require('express') // eslint-disable-line no-unused-vars

//const mylog = process.env.TI_ENV === 'debug' ? console.log : function() {}

class UibWeb {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    _isConfigured

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

        /** Which folder to use for the fall-back front-end code (in the uibuilder module folders) */
        /** Set which folder to use for the central, static, front-end resources
         *  in the uibuilder module folders. Services standard images, ico file and fall-back index pages
         * @type {string}
         */
        this.masterStatic = undefined

        /** Set up a dummy ExpressJS Middleware Function */
        this.dummyMiddleware = function(/** @type {Express.Request} */ req, /** @type {Express.Response} */ res, /** @type {Express.NextFunction} */ next) { next() }

        //#endregion ---- ---- //

        // setup() has not yet been run
        this._isConfigured = false

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
        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            log.warn('[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
            return
        }

        if ( ! RED || ! uib || ! log ) {
            throw new Error('[uibuilder:web.js] Called without required parameters')
        }

        this.RED = RED
        this.uib = uib
        this.log = log

        /** Optional port. If set, uibuilder will use its own ExpressJS server */
        if ( RED.settings.uibuilder && RED.settings.uibuilder.port && RED.settings.uibuilder.port != RED.settings.uiPort) uib.customServer.port = RED.settings.uibuilder.port

        // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
        this._webSetup()
        this._setMasterStaticFolder()

        this._isConfigured = true
    } // --- End of setup() --- //

    /** Set up the appropriate ExpressJS web server references
     * @protected
     */
    _webSetup() {
        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        const log = this.log

        /** NB: uib.nodeRoot is the root URL path for http-in/out and uibuilder nodes 
         * Always set to empty string if a dedicated ExpressJS app is required
         * Otherwise it is set to RED.settings.httpNodeRoot */

        /** We need an http server to serve the page and vendor packages. The app is used to serve up the Socket.IO client. */
        
        // Note the system host name
        uib.customServer.hostName = require('os').hostname()
        // Try to find the external LAN IP address of the server
        require('dns').lookup(uib.customServer.hostName, function (err, add, fam) {
            uib.customServer.host = add
            if ( uib.customServer.port && uib.customServer.port !== RED.settings.uiPort )
                log.trace(`[uibuilder:web:webSetup] Using custom ExpressJS server at ${uib.customServer.type}://${add}:${uib.customServer.port}`)
            else
                log.trace(`[uibuilder:web:webSetup] Using Node-RED ExpressJS server at ${uib.customServer.type}://${add}:${RED.settings.uiPort}`)
        })
        // Set http(s) according to Node-RED settings (will use the same certs if https)
        // TODO Allow override in uibuilder settings
        if ( RED.settings.https ) uib.customServer.type = 'https'
        else uib.customServer.type = 'http'

        if ( uib.customServer.port && uib.customServer.port !== RED.settings.uiPort ) {
            // Port has been specified & is different to NR's port so create a new instance of express & app
            const express = require('express') 
            this.app = express()

            /** Socket.io needs an http(s) server rather than an ExpressJS app
             * As we want Socket.io on the same port, we have to create our own server
             * Use https if NR itself is doing so, use same certs as NR
             * TODO: Switch from https to http/2?
             */
            if ( uib.customServer.type === 'https' ) {
                this.server = require('https').createServer(RED.settings.https, this.app)
            } else {
                this.server = require('http').createServer(this.app)
            }

            // Override the httpNodeRoot setting, has to be empty string. Use reverse proxy to change.
            uib.nodeRoot = ''

            // Connect the server to the requested port, domain is the same as Node-RED
            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    this.server.close()
                    RED.log.error(
                        `[uibuilder:web:webSetup:CreateServer] ERROR: Port ${uib.customServer.port} is already in use. Cannot create uibuilder server, use a different port number and restart Node-RED`
                    )
                    return
                }    
            })

            this.server.listen(uib.customServer.port, () => {
                //uib.customServer.host = this.server.address().address // not very useful. Typically returns `::`
            })

        } else {

            // Port not specified (default) so reuse Node-RED's ExpressJS server and app
            this.app = RED.httpNode // || RED.httpAdmin
            this.server = RED.server
            // Record the httpNodeRoot for later use
            uib.nodeRoot = RED.settings.httpNodeRoot

        }

        // Serve up the master common folder (e.g. /uibuilder/common/)
        // Only load this once for all instances
        //TODO: This needs some tweaking to allow the cache settings to change - currently you'd have to restart node-red.
        let commonStatic = serveStatic( uib.commonFolder, uib.staticOpts )
        // @ts-ignore
        this.app.use( tilib.urlJoin(uib.moduleName, uib.commonFolderName), commonStatic )

    } // --- End of webSetup() --- //

    /** Set which folder to use for the central, static, front-end resources
     *  in the uibuilder module folders. Services standard images, ico file and fall-back index pages
     * @protected */
    _setMasterStaticFolder() {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log
        
        try {
            /** Will we use "compiled" version of module front-end code? */
            fs.accessSync( path.join(uib.masterStaticDistFolder, 'index.html'), fs.constants.R_OK )
            log.trace('[uibuilder:web:setMasterStaticFolder] Using master production build folder')
            // If the ./../front-end/dist/index.html exists use the dist folder...
            this.masterStatic = uib.masterStaticDistFolder
        } catch (e) {
            // ... otherwise, use dev resources at ./../front-end/src/
            //TODO: Check if path.join(__dirname, 'src') actually exists & is accessible - else fail completely
            log.trace('[uibuilder:web:setMasterStaticFolder] Using master folder: src')
            log.trace(`    Reason for not using master dist folder: ${e.message}` )
            this.masterStatic = uib.masterStaticSrcFolder
        }
    } // --- End of setMasterStaticFolder() --- //

    /** Allow the isConfigured flag to be read (not written) externally */
    get isConfigured() {
        return this._isConfigured
    }

    //#region ====== Per-node instance processing ====== //

    /** Setup the web resources for a specific uibuilder instance
     * @param {uibNode} node
     */
    instanceSetup(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        //const log = this.log

        /** Make sure that the common static folder is only loaded once */
        node.commonStaticLoaded = false

        // We want to add services in the right order - first load takes preference

        // (1) httpMiddleware - Optional middleware from a file
        this.addMiddlewareFile(node)
        // (2) masterMiddleware - Generic dynamic middleware to add uibuilder specific headers & cookie
        this.addMasterMiddleware(node)
        // (3) customStatic - Add static route for instance local custom files (src or dist)
        this.addInstanceStaticRoute(node)
        // @ts-ignore (4) Master Static - Add static route for instance local custom files
        this.app.use( tilib.urlJoin(node.url), serveStatic( this.masterStatic, uib.staticOpts ) )

        /** If enabled, allow for directory listing of the custom instance folder */
        if ( node.showfolder === true ) {
            // @ts-ignore
            this.app.use( tilib.urlJoin(node.url, 'idx'), 
                serveIndex( node.customFolder, {'icons':true, 'view':'details'} ), 
                serveStatic( node.customFolder, uib.staticOpts ) 
            )
        }

        /** Serve up the uibuilder static common folder on `<url>/<commonFolderName>` (it is already available on `../uibuilder/<commonFolderName>/`, see _webSetup() */
        let commonStatic = serveStatic( uib.commonFolder, uib.staticOpts )
        // @ts-ignore
        this.app.use( tilib.urlJoin(node.url, uib.commonFolderName), commonStatic )

    }

    /** (1) Optional middleware from a file
     * @param {uibNode} node
     */
    addMiddlewareFile(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        /** Provide the ability to have a ExpressJS middleware hook.
         * This can be used for custom authentication/authorisation or anything else.
         */

        /** Check for <uibRoot>/.config/uibMiddleware.js, use it if present. Copy template if not exists @since v2.0.0-dev4 */
        let uibMwPath = path.join(uib.configFolder, 'uibMiddleware.js')
        try {
            const uibMiddleware = require(uibMwPath)
            if ( typeof uibMiddleware === 'function' ) {
                //! TODO: Add some more checks in here (e.g. does the function have a next()?)
                // @ts-ignore
                this.app.use( tilib.urlJoin(node.url), uibMiddleware )
                log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file loaded.`)
            }    
        } catch (e) {
            log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file failed to load. Reason: `, e.message)
        }
    } // --- End of addMiddlewareFile() --- //

    /** (2) Generic dynamic middleware to add uibuilder specific headers & cookies
     * @param {uibNode} node
     */
    addMasterMiddleware(node) {
        // Reference static vars
        //const uib = this.uib
        //const RED = this.RED
        //const log = this.log

        let masterMiddleware = function masterMiddleware (/** @type {Express.Request} */ req, /** @type {Express.Response} */ res, /** @type {Express.NextFunction} */ next) {
            //TODO: X-XSS-Protection only needed for html (and js?), not for css, etc
            // Help reduce risk of XSS and other attacks
            res.setHeader('X-XSS-Protection','1;mode=block')
            res.setHeader('X-Content-Type-Options','nosniff')
            //res.setHeader('X-Frame-Options','SAMEORIGIN')
            //res.setHeader('Content-Security-Policy',"script-src 'self'")

            // Tell the client that uibuilder is being used (overides the default "ExpressJS" entry)
            res.setHeader('x-powered-by','uibuilder')

            // Tell the client what Socket.IO namespace to use,
            // trim the leading slash because the cookie will turn it into a %2F
            res.setHeader('uibuilder-namespace', node.url)
            res.cookie('uibuilder-namespace', node.url, {path: node.url, sameSite: true}) // tilib.trimSlashes(node.url), {path: node.url, sameSite: true})

            next()
        }

        // @ts-ignore
        this.app.use( tilib.urlJoin(node.url), masterMiddleware )
    } // --- End of addMasterMiddleware() --- //

    /** (3) Add static ExpressJS route for instance local custom files
     * @param {uibNode} node
     */
    addInstanceStaticRoute(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        let customStatic = node.sourceFolder

        // Cope with pre v4.1 node configs (sourceFolder not defined)
        if ( node.sourceFolder === undefined ) {
            try {
                // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
                fs.accessSync( path.join(node.customFolder, 'dist', 'index.html'), fs.constants.R_OK )
                // If the ./dist/index.html exists use the dist folder...
                customStatic = 'dist'
                log.trace(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Using local dist folder`)
                // NOTE: You are expected to have included vendor packages in
                //       a build process so we are not loading them here
            } catch (e) {
                // dist not being used or not accessible, use src
                log.trace(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Dist folder not in use or not accessible. Using local src folder. ${e.message}` )
                customStatic = 'src'
            }
        }

        const customFull = path.join(node.customFolder, customStatic)

        // Remove existing middleware so that it can be redone - allows for changing of src/dist folder
        this.removeInstanceMiddleware(node)

        // Does the customStatic folder exist? If not, then create it
        try {
            fs.ensureDirSync( customFull )
            log.trace(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Using local ${customStatic} folder`)
        } catch (e) {
            node.warn(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Cannot create or access ${customFull} folder, no pages can be shown. Error: ${e.message}`)
        }

        // Does it contain an index.html file? If not, then issue a warn
        if ( ! fs.existsSync( path.join(customFull, 'index.html') ) ) {
            node.warn(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Cannot show default page, index.html does not exist in ${customFull}.`)
        }

        // @ts-ignore
        this.app.use( tilib.urlJoin(node.url), serveStatic( customFull, uib.staticOpts ) )

    } // --- End of addInstanceStaticRoute() --- //

    /** Remove all of the app.use middleware for this instance
     * @param {uibNode} node
     */
    removeInstanceMiddleware(node) {
        
        // We need to remove the app.use paths too as they will be recreated on redeploy
        // we check whether the regex string matches the current node.url, if so, we splice it out of the stack array
        var removePath = []
        var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\' + tilib.urlJoin(node.url)) + '.*$')
        var urlReVendor = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
        // For each entry on ExpressJS's server stack...
        this.app._router.stack.forEach( function(r, i, _stack) { // eslint-disable-line no-unused-vars
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
        // TODO Remove instance debug admin route `RED.httpAdmin.get('/uib/instance/${node.url}')`

        // @since 2017-10-15 - proper way to remove array entries - in reverse order so the ids don't change - doh!
        for (var i = removePath.length -1; i >= 0; i--) {
            this.app._router.stack.splice(removePath[i],1)
        }

    } // --- End of removeAllMiddleware() --- //
    
    /** Dump to console log all middleware for this instance
     * 
     * @param {uibNode} node 
     */
    dumpInstanceMiddleware(node) {
        var urlRe = new RegExp('^' + tilib.escapeRegExp('/^\\' + tilib.urlJoin(node.url)) + '.*$')
        var urlReVendor = new RegExp('^' + tilib.escapeRegExp('/^\\/uibuilder\\/vendor\\') + '.*$')
        this.app._router.stack.forEach( function(r, i, _stack) { // eslint-disable-line no-unused-vars
            // Check whether the URL matches a vendor path...
            let rUrlVendor = r.regexp.toString().replace(urlReVendor, '')
            // If it DOES NOT, then...
            if (rUrlVendor !== '') {
                // Check whether the URL is a uibuilder one...
                let rUrl = r.regexp.toString().replace(urlRe, '')
                // If it IS ...
                if ( rUrl === '' ) {
                    console.log(`[UIBUILDER:web:dumpInstanceMiddleware] ${i}: ${r.name}: ${r.regexp.toString()}` )
                    if (r.name !== 'serveStatic') console.log(i, r.handle.toString())
                }
            }
        })

    }

    //#endregion ====== Per-node instance processing ====== //

    //#region ====== Package Management ====== //

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
            log.error(`[uibuilder:web:checkInstalledPackages] Neither packageList nor masterPackageList could be read from: ${uib.configFolder}`)
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
                        if (debug) console.log('[uibuilder:web:checkInstalledPackages] package unserved ', pkgName)
                    }
                    delete installedPackages[pkgName]
                    if (debug) console.log('[uibuilder:web:checkInstalledPackages] package deleted from installedPackages ', pkgName)
                }
            }
        })

        //uib.installedPackages = installedPackages
        
        // Write packageList back to file
        try {
            fs.writeJsonSync(path.join(uib.configFolder,uib.packageListFilename), Object.keys(installedPackages), {spaces:2})
        } catch(e) {
            log.error(`[uibuilder:web:checkInstalledPackages] Could not write ${uib.packageListFilename} in ${uib.configFolder}`, e)
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
            log.error('[uibuilder:web:servePackage] Failed to find package in uib.installedPackages')
            return false
        }

        // Where is the node_modules folder for this package?
        const installFolder = pkgDetails.folder

        if (installFolder === '' ) {
            log.error(`[uibuilder:web:servePackage] Failed to add user vendor path - no install folder found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}`)
            return false
        }

        // What is the URL for this package? Remove the leading "../"
        var vendorPath
        try {
            vendorPath = pkgDetails.url.replace('../','/') // "../uibuilder/vendor/socket.io" tilib.urlJoin(uib.moduleName, 'vendor', packageName)
        } catch (e) {
            log.error(`[uibuilder:web:servePackage] ${packageName} `, e)
            return false
        }
        log.trace(`[uibuilder:web:servePackage] Adding user vendor path:  ${util.inspect({'url': vendorPath, 'path': installFolder})}`)
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
            log.error(`[uibuilder:web:servePackage] app.use failed. vendorPath: ${vendorPath}, installFolder: ${installFolder}`, e)
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

    //#endregion ====== Package Management ====== //

} // ==== End of Web Class Definition ==== //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const web = require('./web.js')`
 */
module.exports = new UibWeb()

// EOF
