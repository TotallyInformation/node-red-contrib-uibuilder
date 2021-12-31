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
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('Express')} Express
 */

const path = require('path')
const fs = require('fs-extra')
const tilib = require('./tilib')
const serveIndex = require('serve-index')
const packageMgt = require('./package-mgt.js')
const express = require('express')

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

        /** Optional port. If set, uibuilder will use its own ExpressJS server */
        // @ts-ignore
        if ( RED.settings.uibuilder && RED.settings.uibuilder.port && RED.settings.uibuilder.port != RED.settings.uiPort) uib.customServer.port = RED.settings.uibuilder.port // eslint-disable-line eqeqeq

        // At this point we have the refs to uib and RED
        this._isConfigured = true

        // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
        this._adminApiSetup()
        this._webSetup()
        this._userApiSetup()
        this._setMasterStaticFolder()

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

        /** NB: uib.nodeRoot is the root URL path for http-in/out and uibuilder nodes 
         * Always set to empty string if a dedicated ExpressJS app is required
         * Otherwise it is set to RED.settings.httpNodeRoot */

        /** We need an http server to serve the page and vendor packages. The app is used to serve up the Socket.IO client. */
        
        // Note the system host name
        uib.customServer.hostName = require('os').hostname()
        // Try to find the external LAN IP address of the server
        require('dns').lookup(uib.customServer.hostName, function (err, add) {
            if ( err ) {
                log.error('[uibuilder:web.js:_websetup] DNS lookup failed.', err)
            }
            uib.customServer.host = add
            if ( uib.customServer.port && uib.customServer.port !== RED.settings.uiPort )
                log.trace(`[uibuilder:web:webSetup] Using custom ExpressJS server at ${uib.customServer.type}://${add}:${uib.customServer.port}`)
            else
                log.trace(`[uibuilder:web:webSetup] Using Node-RED ExpressJS server at ${uib.customServer.type}://${add}:${RED.settings.uiPort}`)
        })
        // Set http(s) according to Node-RED settings (will use the same certs if https)
        if ( RED.settings.uibuilder && RED.settings.uibuilder.customType ) {
            uib.customServer.type = RED.settings.uibuilder.customType
        } else if ( RED.settings.https ) uib.customServer.type = 'https'
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
                // Allow https settings separate from RED.settings.https
                if ( RED.settings.uibuilder && RED.settings.uibuilder.https ) {
                    try {
                        this.server = require('https').createServer(RED.settings.uibuilder.https, this.app)
                    } catch (e) {
                        RED.log.error(
                            `[uibuilder:web:webSetup:CreateServer]\n\t Cannot create uibuilder custom ExpressJS server.\n\t Check uibuilder.https in settings.js,\n\t make sure the key and cert files exist and are accessible.\n\t ${e.message}\n \n `,
                            e
                        )    
                    }
                } else {
                    console.log('>>>>',RED.settings.https)
                    if ( RED.settings.https !== undefined ) {
                        this.server = require('https').createServer(RED.settings.https, this.app)
                    } else {
                        RED.log.error(
                            '[uibuilder:web:webSetup:CreateServer]\n\t Cannot create uibuilder custom ExpressJS server using NR https settings.\n\t Check https property in settings.js,\n\t make sure the key and cert files exist and are accessible.\n \n '
                        )
                    }
                }
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
            // Record the httpNodeRoot for later use
            uib.nodeRoot = RED.settings.httpNodeRoot

        } 

        // Note: Keep the router vars separate so that they can be used for reporting

        // Create Express Router to handle routes on `<httpNodeRoot>/uibuilder/`
        this.uibRouter = express.Router({mergeParams:true}) // eslint-disable-line new-cap

        // Add vendor paths for installed front-end libraries - from `<uibRoot>/package.json`
        this.serveVendorPackages()
        // Add socket.io client (../uibuilder/vendor/socket.io/socket.io.js)
        this.serveVendorSocketIo()

        //TODO: This needs some tweaking to allow the cache settings to change - currently you'd have to restart node-red.
        // Serve up the master common folder (e.g. <httpNodeRoute>/uibuilder/common/)
        this.uibRouter.use( tilib.urlJoin(uib.commonFolderName), express.static( uib.commonFolder, uib.staticOpts ) )
        this.routers.user.push( {name: 'Central Common Resources', path:`${this.uib.httpRoot}/uibuilder/${uib.commonFolderName}/*`, desc: 'Common resource library', type:'Static', folder: uib.commonFolder} )
        
        // Assign the uibRouter to the ../uibuilder url path
        this.app.use( tilib.urlJoin(uib.moduleName), this.uibRouter )

        //! ==== Passport tests ====
        /*
        // const session = require('express-session')
        // // const bodyParser = express.text()
        // const passport = require('passport')
        // const LocalStrategy = require('passport-local').Strategy

        // const DUMMY_USER = {
        //     id: 1,
        //     username: 'john',
        // }
        
        // passport.serializeUser((user, cb) => {
        //     console.log('5>>>>> serializeUser ', user)
        //     cb(null, user)
        // })
          
        // passport.deserializeUser((id, cb) => {
        //     console.log(`6>>>>> deserializeUser ${id}`)
        //     cb(null, DUMMY_USER)
        // })


        // // this.app.use(bodyParser.json())
        // // this.app.use(bodyParser.urlencoded({ extended: true }))
        // const sessionMiddleware = session({ secret: 'changeit', resave: false, saveUninitialized: false })
        // this.app.use(sessionMiddleware)
        // this.app.use(passport.initialize())
        // //this.app.use(passport.session())

        // passport.use(
        //     new LocalStrategy((username, password, done) => {
        //         console.log('3>>>>> ', {username, password})
        //         if (username === 'john') {
        //             console.log('4>>>>> authentication OK')
        //             return done(null, DUMMY_USER, { message: 'authentication OK.' })
        //         }

        //         console.log('>>>>> wrong credentials')
        //         return done(null, false, { message: 'wrong credentials.' })
            
        //     })
        // )

        // this.app.post('/uibtest/mock/login', function(req, res, next) {
        //     req.body = { username:'john', password: 'doe' }
        //     passport.authenticate('local', function(err, user, info) {
        //         console.log('1>>>>> ', {err, user, info})

        //         if (err) { return next(err) }
        //         //if (!user) { return res.redirect('/login') }
        //         req.logIn(user, function(err) {
        //             console.log('2>>>>> ', {err, user})
        //             if (err) { return next(err) }
        //             return res.status(200).json(user) //res.redirect('/users/' + user.username)
        //         })
        //     })(req, res, next)
        // })
        */

        // TODO - process login
        /*
        const http = require('http')
        const data = JSON.stringify({
            username: 'john',
            password: 'doe'
        })
        const options = {
            hostname: '127.0.0.1',
            port: 3001,
            path: '/uibtest/mock/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }
        http.get(options, resp => {
            console.log('====> ', resp.statusCode)
        })
        */


    } // --- End of webSetup() --- //

    // TODO - lots of work to do here
    /** Set up user-facing REST API's */
    _userApiSetup() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:_userApiSetup] Cannot run. Setup has not been called.')
            return
        }

        //const RED = uib.RED
    
        //app = RED.httpNode

        /** Login 
         * TODO: Change to an external module
         */
        //const jwt = require('jsonwebtoken')
        const { checkSchema, validationResult } = require('express-validator')
    
        /** Input validation schema, @see https://express-validator.github.io/docs/schema-validation.html */
        const loginSchema = {
            'id': {
                in: ['body'],
                errorMessage: 'User ID is incorrect length',
                isLength: {
                    errorMessage: 'User ID must be between 1 and 50 characters long',
                    // Multiple options would be expressed as an array
                    options: { min: 1, max: 50 }
                },
                stripLow: true,
                trim: true,
            },
            'password': {
                in: ['body'],
                errorMessage: 'Password is incorrect length',
                isLength: {
                    errorMessage: 'Password must be between 10 and 50 characters long',
                    // Multiple options would be expressed as an array
                    options: { min: 10, max: 50 }
                },
                stripLow: true,
                trim: true,
            },
        }
    
        //TODO
        // @ts-ignore
        this.uibRouter.post('/uiblogin', express.json, checkSchema(loginSchema), (req, res) => {
    
            console.log('[uiblogin] BODY: ', req.body)
            //console.log('[uiblogin] HEADERS: ', req.headers)
    
            // Finds the validation errors in this request and wraps them in an object with handy functions
            const errors = validationResult(req)
            console.log('[uiblogin] Validation Errors: ', errors)
    
            // Request body failed validation, return 400 - bad request
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }
    
            //TODO
            // Validate user data
            // If valid user, generate token & add to authorization header
    
            // If user or pw is invalid, return 401 - Unauthorized
    
            // Return status 200 - OK with json data
            return res.status(200).json(req.body)
        }) // --- End of uiblogin api --- //
        this.routers.user.push( {name: 'User Login', path:`${this.uib.httpRoot}/uibuilder/uiblogin`, desc: 'Login API endpoint (Experimental)', type:'Handler'} )
     
    }

    /** Set which folder to use for the central, static, front-end resources
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
            /** Will we use "compiled" version of module front-end code? */
            fs.accessSync( path.join(uib.masterStaticDistFolder, defaultPageName), fs.constants.R_OK )
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

    /** Add ExpressJS Route for Socket.IO client */
    serveVendorSocketIo() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:web.js:serveVendorSocketIo] Cannot run. Setup has not been called.')
            return
        }

        // Add socket.io client (../uibuilder/vendor/socket.io/socket.io.js)
        let sioPath = packageMgt.getPackagePath2('socket.io', this.RED.settings.userDir)
        // If it can't be found the usual way - probably because Docker being used & socket.io not in usual place
        if ( sioPath === null ) {
            try {
                sioPath = path.join(path.dirname(require.resolve('socket.io')),'..')
            } catch (e) {}
        }

        if ( sioPath !== null ) {
            this.vendorRouter.use( '/socket.io', express.static( sioPath, this.uib.staticOpts ) )
        } else {
            // Error: Can't find Socket.IO
            this.log.error(`[uibuilder:web.js:serveVendorSocketIo] Cannot find installation of Socket.IO. It should be in userDir (${this.RED.settings.userDir}) but is not. Check that uibuilder is installed correctly. Run 'npm ls socket.io'.`)
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

    //#endregion ==== End of Setup ==== //

    /** Allow the isConfigured flag to be read (not written) externally 
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    //#region ====== Per-node instance processing ====== //

    /** Setup the web resources for a specific uibuilder instance
     * @param {uibNode} node Reference to the uibuilder node instance
     */
    instanceSetup(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        //const log = this.log

        // NOTE: When an instance is renamed or deleted, the routes are removed
        //       See the relevant parts of uibuilder.js for details.

        // Reset the routes for this instance
        this.routers.instances[node.url] = []

        /** Make sure that the common static folder is only loaded once */
        node.commonStaticLoaded = false

        // Create router for this node instance
        this.instanceRouters[node.url] = express.Router({mergeParams:true}) // eslint-disable-line new-cap
        this.routers.instances[node.url].push( {name: 'Instance Root', path:`${this.uib.httpRoot}/${node.url}/`, desc: 'Instance root path', type:'Router'} )

        // We want to add services in the right order - first load takes preference
        // Middleware first (1), then front-end user code(2)(4), master (3) and common (5) folders last

        // (1a) httpMiddleware - Optional middleware from a custom file
        this.addMiddlewareFile(node)
        // (1b) masterMiddleware - Generic dynamic middleware to add uibuilder specific headers & cookie
        this.instanceRouters[node.url].use(this.addMasterMiddleware(node) )

        // TODO (1c) Add API middleware option - see https://discourse.nodered.org/t/can-i-host-stand-alone-nodejs-apps-inside-uibuilder-nodes-if-so-should-i/51813/6
        let instanceApiRouter = this.getInstanceApiRouter(node)
        if (instanceApiRouter) this.instanceRouters[node.url].use( '/api', instanceApiRouter )

        // (2) THIS IS THE IMPORTANT ONE - customStatic - Add static route for instance local custom files (src or dist)
        this.instanceRouters[node.url].use( this.setupInstanceStatic(node) )

        // (3) Master Static - Add static route for uibuilder's built-in front-end code
        this.instanceRouters[node.url].use( express.static( this.masterStatic, uib.staticOpts ) )

        /** (4) If enabled, allow for directory listing of the custom instance folder */
        if ( node.showfolder === true ) {
            // @ts-ignore
            this.instanceRouters[node.url].use( '/idx', 
                serveIndex( node.customFolder, {'icons':true, 'view':'details'} ), 
                express.static( node.customFolder, uib.staticOpts ) // Needed to allow index view to show actual files
            )
            this.routers.instances[node.url].push( {name: 'Index Lister', path:`${this.uib.httpRoot}/${node.url}/idx`, desc: 'Custom pages to list server files', type:'Static', folder: node.customFolder } )
        } 

        // (5) Serve up the uibuilder static common folder on `<httpNodeRoot>/<url>/<commonFolderName>` (it is already available on `<httpNodeRoot>/uibuilder/<commonFolderName>/`, see _webSetup()
        this.instanceRouters[node.url].use( tilib.urlJoin(uib.commonFolderName), express.static( uib.commonFolder, uib.staticOpts ) )

        // Apply this instances router to the url path on `<httpNodeRoot>/<url>/`
        this.app.use( tilib.urlJoin(node.url), this.instanceRouters[node.url])

    } // --- End of instanceSetup --- //

    /** (1a) Optional middleware from a file
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
                log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file loaded.`)
                this.routers.instances[node.url].push( {name: 'Master Middleware', path:`${this.uib.httpRoot}/${node.url}`, desc: 'Adds user custom handler from a file', type:'Handler', folder: uib.configFolder} )
            }    
        } catch (e) {
            log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file failed to load. Reason: `, e.message)
        }
    } // --- End of addMiddlewareFile --- //

    /** (1b) Return Generic dynamic middleware to add uibuilder specific headers & cookies
     * @param {uibNode} node Reference to the uibuilder node instance
     * @returns {express.Handler} Master middleware handler
     */
    addMasterMiddleware(node) { // eslint-disable-line class-methods-use-this
        // Track routes
        this.routers.instances[node.url].push( {name: 'Master Middleware', path:`${this.uib.httpRoot}/${node.url}`, desc: 'Adds custom headers', type:'Handler'} )

        // Return a middleware handler
        return function masterMiddleware (/** @type {express.Request} */ req, /** @type {express.Response} */ res, /** @type {express.NextFunction} */ next) {
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
        this.routers.instances[node.url].push( {name: 'Front-end user code', path:`${uib.httpRoot}/${node.url}`, desc: 'Instance root path', type:'Static', folder:customFull} )

        // Return the serveStatic
        return express.static( customFull, uib.staticOpts )

    } // --- End of setupInstanceStatic --- //

    /** Load & return an ExpressJS Router from a file in <uibRoot>/<node.url>/lib/api.js
     * @param {uibNode} node 
     */
    getInstanceApiRouter(node) {
        // Reference static vars
        const uib = this.uib
        //const RED = this.RED
        const log = this.log

        // let instanceApiPath = path.join(uib.rootFolder, node.url, 'lib', 'api.js')
        // console.log('>> instanceApiPath >>', instanceApiPath)
        // //try { 
        // const instanceApi = require(instanceApiPath)
        // console.log('>> instanceApi >>', 
        //     'route' in instanceApi,
        //     'post' in instanceApi,
        //     'head' in instanceApi,
        //     'patch' in instanceApi,
        //     'm-search' in instanceApi
        // )
        //     (instanceApi instanceof express.Router),
        // Object.getPrototypeOf(instanceApi) == express.Router,
        //     Object.getPrototypeOf(instanceApi),
        //     type(instanceApi, true), 
        //     instanceApi.constructor.name, 
        //     instanceApi.constructor, 
        //     typeof instanceApi, 
        //     Object.prototype.toString.call(instanceApi)
        // )
            // if ( typeof uibMiddleware === 'function' ) {
            //     //! TODO: Add some more checks in here (e.g. does the function have a next()?)
            //     // @ts-ignore
            //     this.instanceRouters[node.url].use( uibMiddleware )
            //     log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file loaded.`)
            //     this.routers.instances[node.url].push( {name: 'Master Middleware', path:`${this.uib.httpRoot}/${node.url}`, desc: 'Adds user custom handler from a file', type:'Handler', folder: uib.configFolder} )
            // }    
        // } catch (e) {
        //     // Only trace as it is OK not to be able to load this
        //     if ( e.message.startsWith('Cannot find module'))
        //         log.trace(`[uibuilder:web:getInstanceApiRouter:${node.url}] instance api router file failed to load. Reason: ${e.message}`)
        //     else
        //         log.warn(`[uibuilder:web:getInstanceApiRouter:${node.url}] instance api router file failed to load. Reason: ${e.message}`)
        // }
    } // ---- End of getInstanceApiRouter ---- //

    // TODO Add this.routers & maybe this.dumpInstanceRoutes(false)
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
    } // ---- End of showInstanceDetails ---- //

    //#endregion ====== Per-node instance processing ====== //

    //#region ==== ExpressJS Route Reporting ==== //

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

            console.log('>> Master Static Folder >>', this.masterStatic)
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
        let html = '<div class="table-responsive"><table  class="table table-sm"><tr>'

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
        html += '</tr>'

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
