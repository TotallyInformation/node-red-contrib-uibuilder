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
const util = require('util')
const fs = require('fs-extra')
const tilib = require('./tilib')
const serveStatic = require('serve-static')
const serveIndex    = require('serve-index')
const packageMgt = require('./package-mgt.js')
// Only used for type checking
//const Express = require('express') // eslint-disable-line no-unused-vars

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

        //#endregion ---- ---- //

        /** Set up a dummy ExpressJS Middleware Function
         * @param {Express.Request} req x
         * @param {Express.Response} res x
         * @param {Express.NextFunction} next x
         */
        this.dummyMiddleware = function(req, res, next) { next() }

        // setup() has not yet been run
        this._isConfigured = false

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

        /** Optional port. If set, uibuilder will use its own ExpressJS server */
        // @ts-ignore
        if ( RED.settings.uibuilder && RED.settings.uibuilder.port && RED.settings.uibuilder.port != RED.settings.uiPort) uib.customServer.port = RED.settings.uibuilder.port // eslint-disable-line eqeqeq

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

        //! ==== Passport tests ====

        // const session = require('express-session')
        // // const bodyParser = require('body-parser')
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

    /** Allow the isConfigured flag to be read (not written) externally 
     * @returns {boolean} True if this class as been configured
     */
    get isConfigured() {
        return this._isConfigured
    }

    //? Consider adding isConfigered checks on each method?

    //#region ====== Per-node instance processing ====== //

    /** Setup the web resources for a specific uibuilder instance
     * @param {uibNode} node Reference to the uibuilder node instance
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
                this.app.use( tilib.urlJoin(node.url), uibMiddleware )
                log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file loaded.`)
            }    
        } catch (e) {
            log.trace(`[uibuilder:web:addMiddlewareFile:${node.url}] uibuilder Middleware file failed to load. Reason: `, e.message)
        }
    } // --- End of addMiddlewareFile() --- //

    /** (2) Generic dynamic middleware to add uibuilder specific headers & cookies
     * @param {uibNode} node Reference to the uibuilder node instance
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
     * @param {uibNode} node Reference to the uibuilder node instance
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
                fs.accessSync( path.join(node.customFolder, 'dist', defaultPageName), fs.constants.R_OK )
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
        if ( ! fs.existsSync( path.join(customFull, defaultPageName) ) ) {
            node.warn(`[uibuilder:web:addInstanceStaticRoute:${node.url}] Cannot show default page, index.html does not exist in ${customFull}.`)
        }

        // @ts-ignore
        this.app.use( tilib.urlJoin(node.url), serveStatic( customFull, uib.staticOpts ) )

    } // --- End of addInstanceStaticRoute() --- //

    /** Remove all of the app.use middleware for this instance
     * @param {uibNode} node Reference to the uibuilder node instance
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
     * @param {uibNode} node Reference to the uibuilder node instance
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
    } // ---- End of showInstanceDetails() ---- //

    //#endregion ====== Per-node instance processing ====== //

    //#region ====== Package Management ====== //
    // NB: Packages are actually installed via a v2 API `uibnpmmanage`

    /** Compare the in-memory package list against packages actually installed.
     * Also check common packages installed against the master package list in case any new ones have been added.
     * Updates the package list file and uib.installedPackages
     * param {Object} vendorPaths Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
     * @param {string} newPkg Default=''. Name of a new package to be checked for in addition to existing. 
     * @returns {object} uib.installedPackages
     */
    checkInstalledPackages(newPkg='') {
        // Reference static vars
        const uib = this.uib
        const log = this.log
        const app = this.app

        let installedPackages = uib.installedPackages

        packageMgt.updateMergedPackageList(newPkg)

        // For each entry in the complete list ...
        packageMgt.mergedPkgMasterList.forEach( (pkgName, _i) => { // eslint-disable-line no-unused-vars
            // flags
            let pkgExists = false

            let pj = null // package details if found

            // Check to see if folder names present in <userDir>/node_modules
            const pkgFolder = packageMgt.getPackagePath(pkgName)

            // Check whether package is really installed (exists)
            if ( pkgFolder !== null ) {
                
                // Get the package.json
                pj = packageMgt.readPackageJson( pkgFolder )

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
                // If package is installed but does NOT exist in current list - add it now
                if ( ! isInCurrent ) {
                    // Add to current & mark for loading (serving)
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
                 * since v3.2.1 Fix for packages misusing the browser property - might be an object see #123
                 */
                let browserEntry = ''
                if ( pj.browser && typeof pj.browser === 'string' ) {
                    browserEntry = pj.browser
                }
                if ( browserEntry === '' ) {
                    browserEntry = pj.jsdelivr || pj.unpkg || ''
                }
                installedPackages[pkgName].browser = browserEntry

                // Replace generic entry points with specific if we know them
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
                        log.trace('[uibuilder:web:checkInstalledPackages] package unserved ', pkgName)
                    }
                    delete installedPackages[pkgName]
                    log.trace('[uibuilder:web:checkInstalledPackages] package deleted from installedPackages ', pkgName)
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
const uiweb = new UibWeb()
module.exports = uiweb

// Make this globally available so that it can be shared with other common nodes from TotallyInformation
if ( ! global.totallyInformationShared ) global.totallyInformationShared = {}
global.totallyInformationShared.uiweb = uiweb

//console.log('>>>> TI GLOBAL <<<<', global.totallyInformationShared)

// EOF
