/** Manage ExpressJS on behalf of uibuilder
 * Singleton. only 1 instance of this class will ever exist. So it can be used in other modules within Node-RED.
 * 
 * Copyright (c) 2017-2022 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('Express')} Express
 */

const path = require('path')
const fs = require('fs-extra')
const fg = require('fast-glob')
const serveIndex = require('serve-index')
const express = require('express')
const tilib = require('./tilib')
const uiblib = require('./uiblib')
const packageMgt = require('./package-mgt.js')
const socket = require('./socket.js')
const { dumpReq, mylog } = require('./tilib')
//const { isBuffer } = require('util')
//const { type } = require('os')

// Filename for default web page
const defaultPageName = 'index.html'

class UibWeb {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    //_isConfigured

    /** Called when class is instantiated */
    constructor() {
        //#region ---- References to core Node-RED & uibuilder objects ---- //

        /** @type {runtimeRED} */
        this.RED = undefined
        /** @type {uibConfig} Reference link to uibuilder.js global configuration object */
        this.uib = undefined
        /** Reference to uibuilder's global log functions */
        this.log = undefined

        //#endregion ---- References to core Node-RED & uibuilder objects ---- //
        
        //#region ---- Common variables ---- //

        /** Reference to ExpressJS app instance being used by uibuilder
         * Used for all other interactions with Express
         * @type {express.Application}
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

        /** Holder for node instance routers 
         * @type {Object.<string, express.Router>}
        */
        this.instanceRouters = {}
        /** ExpressJS Route Metadata */
        this.routers = { admin:[], user:[], instances:{}, config:{} }

        //#endregion ---- ---- //

        /** Set up a dummy ExpressJS Middleware Function
         * @param {Express.Request} req x
         * @param {Express.Response} res x
         * @param {Express.NextFunction} next x
         */
        this.dummyMiddleware = function(req, res, next) { next() }

        // setup() has not yet been run
        this._isConfigured = false

        // setTimeout(() => {
        //     console.log(' \n >> web.js dump >> ', Object.keys(this))
        // }, 3000)

    } // --- End of constructor() --- //

    /** Assign uibuilder and Node-RED core vars to Class static vars.
     *  This makes them available wherever this MODULE is require'd.
     *  Because JS passess objects by REFERENCE, updates to the original
     *    variables means that these are updated as well.
     * @param {uibConfig} uib reference to uibuilder 'global' configuration object
     * param {Object} server reference to ExpressJS server being used by uibuilder
     */
    setup( uib ) {
        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            uib.RED.log.warn('[uibuilder:web:setup] Setup has already been called, it cannot be called again.')
            return
        }

        if ( ! uib ) {
            throw new Error('[uibuilder:web.js:setup] Called without required uib parameter')
        }

        const RED = this.RED = uib.RED
        this.uib = uib
        this.log = uib.RED.log

        // Get the actual httpRoot
        if ( RED.settings.httpRoot === undefined ) this.uib.httpRoot = ''
        else this.uib.httpRoot = RED.settings.httpRoot

        this.routers.config = {httpRoot: this.uib.httpRoot, httpAdminRoot: this.RED.settings.httpAdminRoot}

        // At this point we have the refs to uib and RED
        this._isConfigured = true

        // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
        this._adminApiSetup()
        this._setMasterStaticFolder()
        this._webSetup()

    } // --- End of setup() --- //

    //#region ==== Setup - these are called AFTER _isConfigured=true ==== //

    /** Add routes for uibuilder's admin REST API's */
    _adminApiSetup() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:_adminApiSetup] Cannot run. Setup has not been called.')
            return
        }

        this.adminRouter = express.Router({mergeParams:true}) // eslint-disable-line new-cap

        /** Serve up the v3 admin apis on /<httpAdminRoot>/uibuilder/admin/ */
        this.adminRouterV3 = require('./admin-api-v3')(this.uib, this.log)
        this.adminRouter.use('/admin', this.adminRouterV3)
        this.routers.admin.push( {name: 'Admin API v3', path:`${this.RED.settings.httpAdminRoot}uibuilder/admin`, desc: 'Consolidated admin APIs used by the uibuilder Editor panel', type:'Router'} )
        
        /** Serve up the package docs folder on /<httpAdminRoot>/uibuilder/techdocs (uses docsify)
         * @see https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/108
         */
        let techDocsPath = path.join(__dirname, '..', '..', 'docs')
        this.adminRouter.use('/techdocs', express.static( techDocsPath, this.uib.staticOpts ) )
        this.routers.admin.push( {name: 'Tech Docs', path:`${this.RED.settings.httpAdminRoot}uibuilder/techdocs`, desc: 'Tech docs website powered by Docsify', type:'Static', folder: techDocsPath} )

        // TODO: Move v2 API's to V3
        this.adminRouterV2 = require('./admin-api-v2')(this.uib, this.log)
        this.routers.admin.push( {name: 'Admin API v2', path:`${this.RED.settings.httpAdminRoot}uibuilder/*`, desc: 'Various older admin APIs used by the uibuilder Editor panel', type:'Router'} )

        /** Serve up the admin root for uibuilder on /<httpAdminRoot>/uibuilder/ */
        this.RED.httpAdmin.use('/uibuilder', this.adminRouter, this.adminRouterV2)
    }

    /** Set up the appropriate ExpressJS web server references
     * @protected
     */
    _webSetup() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:_webSetup] Cannot run. Setup has not been called.')
            return
        }

        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        const log = this.log

        // For custom server only, Try to find the external LAN IP address of the server
        if ( uib.customServer.isCustom === true ) {
            require('dns').lookup(uib.customServer.hostName, function (err, add) {
                if ( err ) {
                    log.error('[uibuilder:web.js:_websetup] DNS lookup failed.', err)
                }

                uib.customServer.host = add

                log.trace(`[uibuilder:web:webSetup] Using custom ExpressJS server at ${uib.customServer.type}://${add}:${uib.customServer.port}`)
            })
        } else {
            log.trace(`[uibuilder:web:webSetup] Using Node-RED ExpressJS server at ${RED.settings.https?'https':'http'}://${RED.settings.uiHost}:${RED.settings.uiPort}${uib.nodeRoot === '' ? '/' : uib.nodeRoot}`)
        }

        /** We need an http server to serve the page and vendor packages. The app is used to serve up the Socket.IO client.
         * NB: uib.nodeRoot is the root URL path for http-in/out and uibuilder nodes 
         * Always set to empty string if a dedicated ExpressJS app is required
         * Otherwise it is set to RED.settings.httpNodeRoot 
         */

        if ( uib.customServer.isCustom === true ) {

            // Port has been specified & is different to NR's port so create a new instance of express & app
            const express = require('express') 
            this.app = express()

            // Use the Express server options from settings.js uibuilder.serverOptions (if any)
            Object.keys(uib.customServer.serverOptions).forEach( key => {
                this.app.set(key, uib.customServer.serverOptions[key] )
            })

            /** Socket.io needs an http(s) server rather than an ExpressJS app
             * As we want Socket.io on the same port, we have to create our own server
             * Use https if NR itself is doing so, use same certs as NR
             * TODO: Switch from https to http/2?
             */
            if ( uib.customServer.type === 'https' ) {
                // Allow https settings separate from RED.settings.https
                if ( RED.settings.uibuilder && RED.settings.uibuilder.https ) {
                    try {
                        this.server = require('https').createServer(RED.settings.uibuilder.https, this.app)
                    } catch (e) {
                        // Throw error - we don't want to continue if https is needed but we can't create the server
                        throw new Error(`[uibuilder:web:webSetup:CreateServer]\n\t Cannot create uibuilder custom ExpressJS server.\n\t Check uibuilder.https in settings.js,\n\t make sure the key and cert files exist and are accessible.\n\t ${e.message}\n \n `)
                    }
                } else {
                    if ( RED.settings.https !== undefined ) { // eslint-disable-line no-lonely-if
                        this.server = require('https').createServer(RED.settings.https, this.app)
                    } else {
                        // Throw error - we don't want to continue if https is needed but we can't create the server
                        throw new Error('[uibuilder:web:webSetup:CreateServer]\n\t Cannot create uibuilder custom ExpressJS server using NR https settings.\n\t Check https property in settings.js,\n\t make sure the key and cert files exist and are accessible.\n \n ')
                    }
                }
            } else {
                this.server = require('http').createServer(this.app)
            }

            // Connect the server to the requested port, domain is the same as Node-RED
            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    this.server.close()
                    RED.log.error(
                        `[uibuilder:web:webSetup:CreateServer] ERROR: Port ${uib.customServer.port} is already in use. Cannot create uibuilder server, use a different port number and restart Node-RED`
                    )
                } else {
                    RED.log.error(
                        `[uibuilder:web:webSetup:CreateServer] ERROR: ExpressJS error. Cannot create uibuilder server. ${err.message}`,
                        err
                    )
                }
            })

            this.server.listen(uib.customServer.port, () => {
                //uib.customServer.host = this.server.address().address // not very useful. Typically returns `::`
            })

        } else {
            // Port not specified (default) so reuse Node-RED's ExpressJS server and app
            // @ts-ignore
            this.app = /** @type {express.Application} */ (RED.httpNode) // || RED.httpAdmin
            this.server = RED.server
        }

        // Set views folder to uibRoot (but only if not overridden in settings)
        if ( ! uib.customServer.serverOptions.views ) this.app.set('views', path.join(uib.rootFolder, 'views') )

        // Note: Keep the router vars separate so that they can be used for reporting

        // Create Express Router to handle routes on `<httpNodeRoot>/uibuilder/`
        this.uibRouter = express.Router({mergeParams:true}) // eslint-disable-line new-cap

        // Add masterStatic to ../uibuilder - serves up front-end/... uib-styles.css, uibuilderfe...
        if ( this.masterStatic !== undefined )
            this.uibRouter.use( express.static( this.masterStatic, uib.staticOpts ) )
        // Add vendor paths for installed front-end libraries - from `<uibRoot>/package.json`
        this.serveVendorPackages()
        // Add socket.io client (../uibuilder/vendor/socket.io/socket.io.js)
        this.serveVendorSocketIo()
        // Serve the ping endpoint (../uibuilder/ping)
        this.servePing()

        //TODO: This needs some tweaking to allow the cache settings to change - currently you'd have to restart node-red.
        // Serve up the master common folder (e.g. <httpNodeRoute>/uibuilder/common/)
        this.uibRouter.use( tilib.urlJoin(uib.commonFolderName), express.static( uib.commonFolder, uib.staticOpts ) )
        this.routers.user.push( {name: 'Central Common Resources', path:`${this.uib.httpRoot}/uibuilder/${uib.commonFolderName}/*`, desc: 'Common resource library', type:'Static', folder: uib.commonFolder} )
        
        // Assign the uibRouter to the ../uibuilder url path
        this.app.use( tilib.urlJoin(uib.moduleName), this.uibRouter )

    } // --- End of webSetup() --- //

    /** Set folder to use for the central, static, front-end resources
     *  in the uibuilder module folders. Services standard images, ico file and fall-back index pages
     * @protected */
    _setMasterStaticFolder() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:_setMasterStaticFolder] Cannot run. Setup has not been called.')
            return
        }

        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log
        
        try {
            fs.accessSync( path.join(uib.masterStaticFeFolder, defaultPageName), fs.constants.R_OK )
            log.trace(`[uibuilder:web:setMasterStaticFolder] Using master production build folder. ${uib.masterStaticFeFolder}`)
            this.masterStatic = uib.masterStaticFeFolder
        } catch (e) {
            throw new Error(`setMasterStaticFolder: Cannot serve master production build folder. ${uib.masterStaticFeFolder}`)
        }
    } // --- End of setMasterStaticFolder() --- //

    /** Add ExpressJS Route for Socket.IO client that can be used with an import or build
     * The socket.io server supplies one to use with an html script tag
     */
    serveVendorSocketIo() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:serveVendorSocketIo] Cannot run. Setup has not been called.')
            return
        }

        // Add socket.io client (../uibuilder/vendor/socket.io-client/socket.io.js)
        let sioPath = packageMgt.getPackagePath2('socket.io-client', this.RED.settings.userDir)
        if ( sioPath === null ) sioPath = packageMgt.getPackagePath2('socket.io-client', path.join(__dirname, '..', '..') )
        
        //let sioPath = packageMgt.getPackagePath2('socket.io', this.RED.settings.userDir)
        // If it can't be found the usual way - probably because Docker being used & socket.io not in usual place
        if ( sioPath === null ) {
            try {
                sioPath = path.join(path.dirname(require.resolve('socket.io-client')),'..')
            } catch (e) {
                this.log.error(`[uibuilder:web:serveVendorSocketIo] Cannot find socket.io-client. ${e.message}`)
            }
        }

        if ( sioPath !== null ) {
            // console.log('>> this.uib.staticOpts >>', this.uib.staticOpts)
            sioPath += '/dist'
            this.vendorRouter.use( '/socket.io-client', express.static( sioPath, this.uib.staticOpts ) )
            this.routers.user.push( {name: 'Socket.IO Client', path:`${this.uib.httpRoot}/uibuilder/vendor/socket.io-client/*`, desc: 'Socket.IO Clients', type:'Static', folder: sioPath} )
            //! No! This never actually worked! :} - The socket.io SERVER actually creates the path for the client used in script tag but that doesn't work with import/build
            //this.vendorRouter.use( '/socket.io', express.static( sioPath, opts ) )
        } else {
            // Error: Can't find Socket.IO
            this.log.error(`[uibuilder:web.js:serveVendorSocketIo] Cannot find installation of Socket.IO Client. It should be in userDir (${this.RED.settings.userDir}) but is not. Check that uibuilder is installed correctly. Run 'npm ls socket.io-client'.`)
        }
    } // --- End of serveVendorSocketIo() --- //

    /** Add ExpressJS Routes for all installed packages & ensure <uibRoot>/package.json is up-to-date. */
    serveVendorPackages() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:serveVendorPackages] Cannot run. Setup has not been called.')
            return
        }

        // TODO Add some trace messages

        // Create Express Router to handle routes on `<httpNodeRoot>/uibuilder/vendor/`
        this.vendorRouter = express.Router({mergeParams:true}) // eslint-disable-line new-cap
        this.vendorRouter.myname = 'uibVendorRouter'

        // Remove the vendor router if it already exists - we will recreate it. `some` stops once it has found a result
        this.uibRouter.stack.some((layer, i, aStack) => {
            if ( layer.regexp.toString() === '/^\\/vendor\\/?(?=\\/|$)/i' ) {
                aStack.splice(i,1)
                return true
            }
            return false
        } )
        this.routers.user.some((entry, i, uRoutes) => {
            if ( entry.name === 'Vendor Routes' ) {
                uRoutes.splice(i,1)
                return true
            }
            return false
        } )

        // Assign the vendorRouter to the ../uibuilder/vendor url path (via uibRouter)
        this.uibRouter.use( '/vendor', this.vendorRouter )
        this.routers.user.push( {name: 'Vendor Routes', path:`${this.uib.httpRoot}/uibuilder/vendor/*`, desc: 'Front-end libraries are mounted under here', type:'Router'} )        

        // Get the installed packages from the `<uibRoot>/package.json` file
        // If it doesn't exist, this will create it.
        const pj = packageMgt.getUibRootPackageJson()

        Object.keys(pj.dependencies).forEach( packageName => {
            const pkgDetails = pj.uibuilder.packages[packageName]

            // Add a route for each package to this.vendorRouter
            this.vendorRouter.use( 
                pkgDetails.packageUrl,
                express.static(
                    pkgDetails.installFolder, 
                    this.uib.staticOpts
                ) 
            )

        })

        // Update the <uibRoot>/package.json file with updated details
        packageMgt.setUibRootPackageJson(pj)

    } // ---- End of serveVendorPackages ---- //

    /** Add the ping endpoint
     * This just returns a 201 (No Content) response and can be used for a keepalive process from the client.
     */
    servePing() {
        this.uibRouter.all('/ping', (err, res) => {
            res.status(201).end()
        })
        this.routers.user.push( {name: 'Ping', path:`${this.uib.httpRoot}/uibuilder/ping`, desc: 'Ping/keep-alive endpoint, returns 201', type:'Endpoint'} )        
    }

    //#endregion ==== End of Setup ==== //

    /** Allow the isConfigured flag to be read (not written) externally 
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    //#region ====== Per-node instance processing ====== //

    /** Remove an ExpressJS router from the stack
     * @param {string} url The url of the router to remove
     */
    removeRouter(url) {
        this.app._router.stack.forEach( (route, i, routes) => {
            if (route.regexp.toString() === `/^\\/${url}\\/?(?=\\/|$)/i` ) {
                routes.splice(i, 1)
            }
        })
    } // ---- End of removeRouter ---- //

    /** Setup the web resources for a specific uibuilder instance
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    instanceSetup(node) {
        this.uib.RED.log.trace(`[uibuilder:web.js:instanceSetup] Setup for URL: ${node.url}`)

        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        // NOTE: When an instance is renamed or deleted, the routes are removed
        //       See the relevant parts of uibuilder.js for details.

        // Reset the routes for this instance
        this.routers.instances[node.url] = []
        this.removeRouter(node.url)

        /** Make sure that the common static folder is only loaded once */
        node.commonStaticLoaded = false

        // Create router for this node instance
        this.instanceRouters[node.url] = express.Router({mergeParams:true}) // eslint-disable-line new-cap
        this.routers.instances[node.url].push( {name: 'Instance Rooter', path:`${this.uib.httpRoot}/${node.url}/`, desc: 'Other routes hang off this', type:'Router', folder: '--'} )

        /** We want to add services in the right order - first load takes preference:
         *   (1) Middleware: (a) common (for all instances), (b) internal (all instances), (c) (if allowed in settings) instance API middleware
         *   (2) Front-end user code: (a) dynamic templated (*.ejs) & explicit (*.html) from views folder, (b) src or dist static
         *   (3) Master static folders - for the built-in front-end resources (css, default html, uibuilderfe, etc)
         *   (4) [Optionally] The folder lister
         *   (5) Common static folder is last
         * TODO Make sure the above is documented in Tech Docs
         */

        // (1a) httpMiddleware - Optional common middleware from a custom file (same for all instances)
        this.addMiddlewareFile(node)
        // (1b) masterMiddleware - uib's internal dynamic middleware to add uibuilder specific headers & cookie
        this.addMasterMiddleware(node)

        // (1c) Add user-provided API middleware
        if (uib.instanceApiAllowed === true ) this.addInstanceApiRouter(node)
        else log.trace(`[uibuilder:webjs:instanceSetup] Instance API's not permitted. '${node.url}'`)

        //! IN PROCRESS - Render views
        /** (2a) Render dynamic and explicit template files from views folder
         * ! NOTE: If you create a `views/index.html`, you will never reach your actual `src/index.html` (or dist)
         * TODO For render - prevent base outside instanceRoot/views/ - https://security.stackexchange.com/a/123723/20102
         * TODO Allow views dir to be set in editor
         * TODO Allow custom data to be added via Editor and/or msg
         * ? TODO give access to global/flow/node vars ? DANGEROUS - needs a list for specific entries instead.
         * ? TODO change instance static to optional render
         */
        this.instanceRouters[node.url].use( (req, res, next) => {
            const pathRoot = path.join(uib.rootFolder, node.url, 'views')
            const requestedView = path.parse(req.path)
            let filePath = path.join(pathRoot, requestedView.base)

            //this.app.set('foo', 'bar') //! TODO - remove

            if (this.app.get('view engine')) {
                filePath = path.join(pathRoot, `${requestedView.name}.ejs`)
                if (fs.existsSync(filePath)) {
                    // console.log('>> render >>', requestedView.name, filePath) //! TODO - remove
                    try {
                        //res.render( path.join(uib.rootFolder, node.url, 'views', requestedView.name), {foo:'Crunchy', footon: 'bar stool', _env: node.context().global.get('_env')} )
                        res.render( path.join(uib.rootFolder, node.url, 'views', requestedView.name), {_env: node.context().global.get('_env')} )
                    } catch (e) {
                        res.sendFile( requestedView.base, { root: pathRoot } )
                    }
                    return
                }
            }
            return next()
        }) // --- End of render views --- //

        // (2b) THIS IS THE IMPORTANT ONE - customStatic - Add static route for instance local custom files (src or dist)
        this.instanceRouters[node.url].use( this.setupInstanceStatic(node) )

        // (3) Master Static - Add static route for uibuilder's built-in front-end code
        if ( this.masterStatic !== undefined ) {
            this.instanceRouters[node.url].use( express.static( this.masterStatic, uib.staticOpts ) )
            this.routers.instances[node.url].push( {name: 'Master Code', path: `${this.uib.httpRoot}/${node.url}/`, desc: 'Built-in FE code, same for all instances', type:'Static', folder: this.masterStatic} )
        }

        /** (4) If enabled, allow for directory listing of the custom instance folder */
        if ( node.showfolder === true ) {
            this.instanceRouters[node.url].use( 
                '/idx', 
                serveIndex( node.customFolder, {'icons':true, 'view':'details'} ), 
                express.static( node.customFolder, uib.staticOpts ) // Needed to allow index view to show actual files
            )
            this.routers.instances[node.url].push( {name: 'Index Lister', path:`${this.uib.httpRoot}/${node.url}/idx`, desc: 'Custom pages to list server files', type:'ServeIndex', folder: node.customFolder } )
        } 

        // (5) Serve up the uibuilder static common folder on `<httpNodeRoot>/<url>/<commonFolderName>` (it is already available on `<httpNodeRoot>/uibuilder/<commonFolderName>/`, see _webSetup()
        this.instanceRouters[node.url].use( tilib.urlJoin(uib.commonFolderName), express.static( uib.commonFolder, uib.staticOpts ) )
        // Track routes
        this.routers.instances[node.url].push( {name: 'Common Code', path: `${this.uib.httpRoot}/${node.url}/common/`, desc: 'Shared FE code, same for all instances', type:'Static', folder: uib.commonFolder} )

        // Apply this instances router to the url path on `<httpNodeRoot>/<url>/`
        this.app.use( tilib.urlJoin(node.url), this.instanceRouters[node.url])

        // this.dumpUserRoutes(true)
        // this.dumpInstanceRoutes(true, node.url)
    } // --- End of instanceSetup --- //

    /** (1a) Optional common middleware from a file (same for all instances)
     * @param {uibNode} node Reference to the uibuilder node instance
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
                this.instanceRouters[node.url].use( uibMiddleware )
                log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder common Middleware file loaded. Path: ${uibMwPath}`)
                this.routers.instances[node.url].push( {name: 'Common Middleware', path: `${this.uib.httpRoot}/${node.url}/`, desc: 'Optional middleware, same for all instances', type:'Handler', folder: uibMwPath} )
            } else {
                log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder common Middleware file not loaded, not a function. Type: ${typeof uibMiddleware}, Path: ${uibMwPath}`)
            }
        } catch (e) {
            log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder common Middleware file failed to load. Path: ${uibMwPath}, Reason: ${e.message}`)
        }
    } // --- End of addMiddlewareFile --- //

    /** (1b) Add uib's internal dynamic middleware - adds uibuilder specific headers & cookies
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    addMasterMiddleware(node) { // eslint-disable-line class-methods-use-this
        const uib = this.uib

        let mypath
        if ( uib.nodeRoot === '' || uib.nodeRoot === '/' )  mypath = `/${node.url}/`
        else mypath = `${uib.nodeRoot}${node.url}/`

        const qSec = uib.customServer.type === 'http' ? false : true

        let that = this

        /**
         * Return a middleware handler
         * @param {express.Request} req Express request object
         * @param {express.Response} res Express response object
         * @param {express.NextFunction} next Express next() function
         */
        function masterMiddleware (req, res, next) {
            // Check for client id from client - if it exists, reuse it otherwise create one
            const clientId = uiblib.getClientId(req)

            //TODO: X-XSS-Protection only needed for html (and js?), not for css, etc
            res
                .header({
                    // Help reduce risk of XSS and other attacks
                    'X-XSS-Protection': '1;mode=block',
                    'X-Content-Type-Options': 'nosniff',
                    // 'X-Frame-Options': 'SAMEORIGIN',
                    // Content-Security-Policy': "script-src 'self'",
                    // Tell the client that uibuilder is being used (overides the default "ExpressJS" entry)
                    'x-powered-by': 'uibuilder',
                    // Tell the client what Socket.IO namespace to use,
                    'uibuilder-namespace': node.url, // only client accessible from xhr or web worker
                    'uibuilder-node': node.id,
                    //'uibuilder-path': mypath,
                })
                // .links({
                //     help: '',
                // })
                .cookie('uibuilder-namespace', node.url, {
                    path: mypath, 
                    sameSite: true,
                    expires: 0, // session cookie only
                    secure: qSec,
                })
                // Give the client a fixed session id
                .cookie('uibuilder-client-id', clientId, {
                    path: mypath, 
                    sameSite: true,
                    expires: 0, // session cookie only
                    secure: qSec,
                })
                // Tell clients what httpNodeRoot to use (affects Socket.io path)
                .cookie('uibuilder-webRoot', uib.nodeRoot.replace(/\//g,''), {
                    path: mypath, 
                    sameSite: true,
                    expires: 0, // session cookie only
                    secure: qSec,
                })

            //that.dumpExpressReqAppRes(req, res)
            
            next()
        }

        this.instanceRouters[node.url].use(masterMiddleware )
        
        // Track routes
        that.routers.instances[node.url].push( {name: 'uib Internal Middleware', path: `${that.uib.httpRoot}/${node.url}/`, desc: 'Master middleware, same for all instances', type:'Handler', folder: '(internal)'} )

    } // --- End of addMasterMiddleware --- //

    /** (2) Front-end code is mounted here - Add static ExpressJS route for an instance local resource files
     * Called on startup but may also be called if user changes setting Advanced/Serve
     * @param {uibNode} node Reference to the uibuilder node instance
     * @returns {express.RequestHandler} serveStatic for the folder containing the front-end code
     */
    setupInstanceStatic(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        let customStatic = node.sourceFolder

        // Cope with pre v4.1 node configs (sourceFolder not defined)
        if ( node.sourceFolder === undefined ) {
            try {
                // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
                fs.accessSync( path.join(node.customFolder, 'dist', defaultPageName), fs.constants.R_OK )
                // If the ./dist/index.html exists use the dist folder...
                customStatic = 'dist'
                log.trace(`[uibuilder:web:setupInstanceStatic:${node.url}] Using local dist folder`)
                // NOTE: You are expected to have included vendor packages in
                //       a build process so we are not loading them here
            } catch (e) {
                // dist not being used or not accessible, use src
                log.trace(`[uibuilder:web:setupInstanceStatic:${node.url}] Dist folder not in use or not accessible. Using local src folder. ${e.message}` )
                customStatic = 'src'
            }
        }

        const customFull = path.join(node.customFolder, customStatic)

        // Does the customStatic folder exist? If not, then create it
        try {
            fs.ensureDirSync( customFull )
            log.trace(`[uibuilder:web:setupInstanceStatic:${node.url}] Using local ${customStatic} folder`)
        } catch (e) {
            node.warn(`[uibuilder:web:setupInstanceStatic:${node.url}] Cannot create or access ${customFull} folder, no pages can be shown. Error: ${e.message}`)
        }

        // Does it contain an index.html file? If not, then issue a warn
        if ( ! fs.existsSync( path.join(customFull, defaultPageName) ) ) {
            node.warn(`[uibuilder:web:setupInstanceStatic:${node.url}] Cannot show default page, index.html does not exist in ${customFull}.`)
        } 

        // Track the route
        this.routers.instances[node.url].push( {name: 'Front-end user code', path:`${uib.httpRoot}/${node.url}/`, desc: 'Your own FE Code', type: 'Static', folder: customFull} )

        // Return the serveStatic
        return express.static( customFull, uib.staticOpts )

    } // --- End of setupInstanceStatic --- //

    /** Load & return an ExpressJS Router from file(s) in <uibRoot>/<node.url>/api/*.js
     * @param {uibNode} node 
     * @returns {object|undefined} Valid instance router or undefined
     */
    addInstanceApiRouter(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        // Allow all .js files in api folder to be loaded, always returns an array - NB: Fast Glob requires fwd slashes even on Windows
        const apiFiles = fg.sync(`${uib.rootFolder}/${node.url}/api/*.js`)
        //console.log('>> apiFiles >>', `${uib.rootFolder}/${node.url}/api/*.js`, apiFiles)
        apiFiles.forEach( instanceApiPath => {
            // console.log('>> api file >>', instanceApiPath)

            // Try to require the api module file
            let instanceApi
            try {
                instanceApi = require(instanceApiPath)
            } catch (e) {
                log.error(`[uibuilder:webjs:addInstanceApiRouter] Could not require instance API file. API not added. '${node.url}', '${instanceApiPath}'. ${e.message}`)
                return false
            }

            // if instanceApi is a function, simply .use it on /api
            if ( instanceApi && typeof instanceApi === 'function' ) {
                log.trace(`[uibuilder:webjs:addInstanceApiRouter] ${node.url} function api added`)
                this.instanceRouters[node.url].use( '/api', instanceApi )
                return
            } 

            // Make sure we can understand the contents
            let keys
            try {
                keys = Object.keys(instanceApi)
            } catch (e) {
                log.error(`[uibuilder:webjs:addInstanceApiRouter] Could not understand API file properties - is it an object? It must be an object or a function, see the docs for details. '${node.url}', '${instanceApiPath}'. ${e.message}`)
                return false
            }

            // allow `path` property - if present, use as api path
            let apipath
            if ( instanceApi.path ) apipath = instanceApi.path
            else apipath = '/api/*'

            // allow apiSetup function
            if ( instanceApi.apiSetup && typeof instanceApi.apiSetup === 'function' ) {
                instanceApi.apiSetup(node, uib)
            }

            // Each property in the imported object MUST match an ExpressJS method or `use` & must be a function
            keys.forEach( fnName => {
                if ( fnName === 'path' || fnName === 'apiSetup' ) return // ignore this

                // TODO validate verb
                if ( typeof instanceApi[fnName] === 'function' ) {
                    log.trace(`[uibuilder:webjs:addInstanceApiRouter] ${node.url} api added. ${fnName}, ${apipath}`)
                    this.instanceRouters[node.url][fnName]( apipath, instanceApi[fnName] )
                }
            })
    
        })

        return undefined
    } // ---- End of getInstanceApiRouter ---- //

    /** Create instance details web page
     * @param {Express.Request} req ExpressJS Request object
     * @param {uibNode} node configuration data for this instance
     * @returns {string} page html
     */
    showInstanceDetails(req, node) {
        // Reference static vars
        const uib = this.uib
        const RED = this.RED
        const userDir = RED.settings.userDir
        //const log = this.log

        let page = ''

        // If using own Express server, correct the URL's
        const url = new URL(req.headers.referer)
        url.pathname = ''
        if (uib.customServer && uib.customServer.port && uib.customServer.port != RED.settings.uiPort ) { // eslint-disable-line eqeqeq
            //http://127.0.0.1:3001/uibuilder/vendor/bootstrap/dist/css/bootstrap.min.css
            //customServer: { port: 3001, type: 'http', host: '::' }
            url.port = uib.customServer.port.toString()
        }
        const urlPrefix = url.href 
        //let urlRoot = `${urlPrefix}${uib.nodeRoot.replace('/','')}${uib.moduleName}`
        let urlRoot = `${urlPrefix}${uib.nodeRoot.replace('/','')}${node.url}`

        const nodeKeys = [
            'id', 'type',  
            'name', 'wires', '_wireCount', 'credentials', 'topic', 'url', 
            'fwdInMessages', 'allowScripts', 'allowStyles', 'copyIndex', 'showfolder', 
            //'useSecurity', 
            'sessionLength', 'tokenAutoExtend', 'customFolder', 
            'ioClientsCount', 'rcvMsgCount', 'ioNamespace'
        ]
        // functions: ['_closeCallbacks', '_inputCallback', '_inputCallbacks', 'send', ]
        // Keep secret: ['jwtSecret', ]

        let ns = socket.getNs(node.url)

        page += `
            <!doctype html><html lang="en"><head>
                <title>uibuilder Instance Debug Page</title>
                <link rel="icon" href="${urlRoot}/common/images/node-blue.ico">
                <link type="text/css" rel="stylesheet" href="${urlRoot}/uib-styles.css" media="screen">
                <style type="text/css" rel="stylesheet" media="all">
                    h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                    .col3i tbody>tr>:nth-child(3){ font-style:italic; }
                </style>
            </head><body class="uib"><div class="container">
                <h1>uibuilder Instance Debug Page</h1>
                <p>
                    Note that this page is only accessible to users with Node-RED admin authority.
                </p>
                <h2>Instance Information for '${node.url}'</h2>
                <table class="uib-info-tb">
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
                <h2>Node Instance Configuration Items</h2>
                <p>
                    Shows the internal configuration.
                </p>
                <table class="uib-info-tb">
                    <tbody>
        `

        nodeKeys.sort().forEach( item => {
            let info = node[item]

            if ( item === 'ioNamespace' ) info = ns.name
            if ( item === 'ioClientsCount' ) info = ns.sockets.size

            try {
                if ( info !== null && info.constructor.name === 'Object' ) info = JSON.stringify(info)
            } catch (e) {
                if ( info !== undefined )
                    RED.log.warn(`[uibuilder:webjs:showInstanceDetails] ${node.id}, ${url}: Item '${item}' failed to stringify. ${e.message}`)
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
                <div></div>
        `

        let iRoutes = Object.values(this.dumpInstanceRoutes(false, node.url))[0]
        page += `
            <h4>Instance Routes for ${node.url}</h4>
            ${this.htmlBuildTable( this.routers.instances[node.url], ['name', 'desc', 'path', 'type', 'folder'] )}
            <h5>ExpressJS technical route data for <code>${node.url}</code> (<code>../${node.url}/*</code>)</h5>
            ${this.htmlBuildTable( iRoutes, ['name','path', 'folder', 'route'] )}
            `                    

        page += `
            </body></html>

        `

        return page
    } // ---- End of showInstanceDetails ---- //

    //#endregion ====== Per-node instance processing ====== //

    //#region ==== ExpressJS Route & other Reporting ==== //

    /** Summarise Express route properties
     * @param {*} L Express Route Stack Layer
     * @param {*} out Save to
     */
    summariseRoute(L, out) {
        if (L.name === 'query' || L.name === 'expressInit') return

        let x = {
            'name': L.name, 
            'path': 
                L.regexp.toString()
                    .replace('/^\\', '')
                    .replace('\\/?(?=\\/|$)/i', '/')
                    .replace('\\/?$/i', '/')
                    .replace('/^\\/?$/i', '/')
                    .replace('//?(?=/|$)/i', '/')
                    .replace(/\\/g, '')
                    .replace('/(?:([^/]+?))/', '/'),
        }

        if (L.route !== undefined) {
            if ( !L.route.stack[0].method ) x.route = Object.keys(L.route.methods).join(',')
            else x.route = `${L.route.stack[0].method}:${L.route.stack[0].regexp}`
        }

        if ( x.path && x.path === '/common/' ) x.folder = this.uib.commonFolder
        else if ( x.path && x.path === '/?(?=/|$)/i' ) {
            x.path = '/'
            x.folder = '(route applied direct)'
            // x.folder = this.masterStatic
            // console.log('>>', L)
        }
        
        // @ts-ignore
        out.push( x )
    }

    /** Return a summary of all the ExpressJS routes for a specific uibuilder instance & output to console if required
     * @param {boolean} print If true, output to console
     * @param {string|null} [url] Optional. If not null, only dump the given instance
     * @returns {any} Summary object
     */
    dumpInstanceRoutes(print=true, url=null) {
        let instances = {}

        let urls = []
        if ( url === null ) {
            urls = Object.keys(this.instanceRouters)
        } else {
            urls = [url]
        }

        // Get each uibuilder instance's routes
        urls.forEach( url => {
            instances[url] = []
            for ( const layer of this.instanceRouters[url].stack) { this.summariseRoute(layer, instances[url]) }
            if ( instances[url].length === 0 ) instances[url] = [{name: 'No routes'}]
        })

        if (print) {
            console.log(' \n---- Per-Instance User Facing Routes ----')

            Object.keys(this.instanceRouters).forEach( url => {
                console.log(`>> User Instance Routes ${this.uib.nodeRoot}/${url}/* >>`)
                console.table(instances[url])
            })

            // console.log('>> Master Static Folder >>', this.masterStatic)
        }

        return instances
    }

    /** Return a summary of all the admin-facing ExpressJS routes (not just uibuilder) & output to console if required
     * @param {boolean} print If true, output to console
     * @returns {any} Summary object
     */
    dumpAdminRoutes(print=true) {
        let routes = {'app':[], 'admin':[], 'v3':[], 'v2':[]}

        // @ts-ignore
        for ( const layer of this.RED.httpAdmin._router.stack) { this.summariseRoute(layer, routes.app) }
        for ( const layer of this.adminRouter.stack) { this.summariseRoute(layer, routes.admin) }
        for ( const layer of this.adminRouterV3.stack) { this.summariseRoute(layer, routes.v3) }
        for ( const layer of this.adminRouterV2.stack) { this.summariseRoute(layer, routes.v2) }

        if (print) {
            console.log(' \n---- Admin Facing Routes ----')
            let adminRoot = this.RED.settings.httpAdminRoot

            console.log(`>> App Admin Routes ${adminRoot}* >>`)
            console.table(routes.app)

            console.log(`>> Admin uib Routes ${adminRoot}${this.uib.moduleName}/* >>`)
            console.table(routes.admin)

            console.log(`>> Admin v3 Routes ${adminRoot}${this.uib.moduleName}/admin >>`)
            console.table(routes.v3)

            console.log(`>> Admin v2 Routes ${adminRoot}${this.uib.moduleName}/ >>`)
            console.table(routes.v2)
        }

        return routes
    }

    /** Return a summary of all the user-facing uibuilder specific ExpressJS routes & output to console if required
     * @param {boolean} print If true, output to console
     * @returns {any} Summary object
     */
    dumpUserRoutes(print=true) {
        let routes = {'app':[], 'uibRouter':[], 'vendorRouter':[]}

        // Get the user-facing routes
        for ( const layer of this.app._router.stack) { this.summariseRoute(layer, routes.app) }
        for ( const layer of this.uibRouter.stack) { this.summariseRoute(layer, routes.uibRouter) }
        for ( const layer of this.vendorRouter.stack) { this.summariseRoute(layer, routes.vendorRouter) }

        if (print) {
            console.log(' \n---- User Facing Routes ----')

            console.log(`>> User App Routes ${this.uib.nodeRoot}/* >>`)
            console.table(routes.app)

            console.log(`>> User uib Routes ${this.uib.nodeRoot}/${this.uib.moduleName}/* >>`)
            console.table(routes.uibRouter)

            console.log(`>> User vendor Routes ${this.uib.nodeRoot}/${this.uib.moduleName}/vendor/* >>`)
            console.table(routes.vendorRouter)
        }

        return routes
    }

    /** Return a summary of all of the ExpressJS routes and output to console if required
     * @param {boolean} print If true, output to console
     * @returns {any} Summary object
     */
    dumpRoutes(print=true) {
        let o = {
            'user': {'app':[], 'uibRouter':[], 'vendorRouter':[]}, 
            'admin': {'app':[], 'admin':[], 'v3':[], 'v2':[]},
            'instances': {}
        }

        if (print) console.log('\n \n[uibuilder:web.js:dumpRoutes] Showing all ExpressJS Routes for uibuilder.\n')

        // Get the user-facing routes
        o.user = this.dumpUserRoutes(print)

        // Get each uibuilder instance's routes
        o.instances = this.dumpInstanceRoutes(print)

        // @ts-ignore Get admin-facing routes
        o.admin = this.dumpAdminRoutes(print)

        if (print) console.log('\n---- ---- ---- ----\n \n')

        return o
    }

    /** Dump to mylog important ExpressJS properties
     * @param {object} req Express Request object
     * @param {object} res Express Response Object
     */
    dumpExpressReqAppRes(req, res) { // eslint-disable-line class-methods-use-this
        const log = mylog

        const r = req

        log('>> REQ >>', {
            baseUrl: r.baseUrl,
            body: r.body,
            cookies: r.cookies,
            fresh: r.fresh,
            hostname: r.hostname,
            httpVersion: r.httpVersion,
            ip: r.ip, // remote ip of request, proxy dependent
            ips: r.ips, // list of forwarded ips if proxy set
            method: r.method,
            orginalUrl: r.originalUrl,
            params: r.params,
            path: r.path, 
            protocol: r.protocol,
            query: r.query,
            route: r.route,
            secure: r.secure,
            stale: r.stale, // oposite of fresh
            subdomains: r.subdomains,
            url: r.url, //from node.js url
            xhr: r.xhr,
        })
        // console.log('>> app >>', {
        //     locals: r.app.locals
        // })
        // const s = res
        // console.log('>> res >>', {
        //     headersSent: s.headersSent,
        //     locals: s.locals,
        //     headers: s.headers,
        // })
    } // --- end of dumpReq --- //

    //#endregion ==== ExpressJS Route Reporting ==== //

    //#region ==== HTML helpers ==== //

    /** Build a raw HTML table from an input
     * @param {*} input Input object
     * @param {Array} [cols] List of columns
     * @returns {string} HTML Table
     */
    htmlBuildTable(input, cols) { // eslint-disable-line class-methods-use-this
        if (!cols) {
            cols = Object.keys(input[0])
        }
        let html = '<div class="table-responsive"><table  class="uib-info-tb table table-sm"><thead><tr>'

        const escapeHTML = str => 
            str.replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag])
            )

        /** The HTML for a single cell
         * @param {*} col _
         * @param {*} entry _ 
         * @returns {string} HTML for a single cell
         */
        function cell(col, entry) { // eslint-disable-line require-jsdoc
            let html = '<td>'
            html += entry[col] ? escapeHTML(entry[col]) : ' '
            html += '</td>'

            return html
        }

        // Show the headings
        cols.forEach( (col) => {
            html += '<th>'
            html += col
            html += '</th>'
        })
        html += '</tr></thead>'

        for (const entry of input) {
            html += '<tr>'

            for (const col of cols) {
                html += cell(col, entry)
            }
            
            html += '</tr>'
        }

        html += '</table></div>'
        return html
    }

    //#endregion ==== HTML helpers ==== //

} // ==== End of Web Class Definition ==== //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const web = require('./web.js')`
 */
const uiweb = new UibWeb()
module.exports = uiweb
