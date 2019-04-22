/**
 * Copyright (c) 2019 Julian Knight (Totally Information)
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
// @ts-check
'use strict'

const child_process = require('child_process')

/** Module name must match this nodes html file @constant {string} moduleName */
const moduleName  = 'uibuilder'
// @ts-ignore
const nodeVersion = require('../package.json').version
// Utility library for uibuilder
const uiblib = require('./uiblib')
// General purpose library (by Totally Information)
const tilib = require('./tilib')

const serveStatic      = require('serve-static'),
      socketio         = require('socket.io'),
      path             = require('path'),
      fs               = require('fs-extra'),
      events           = require('events'),
      logger           = require('./tilogger.js')

// Placeholder - set in export
var userDir = ''

/** We want these to track across redeployments
 *  if OK to reset on redeployment, attach to node.xxx inside nodeGo instead. @constant {Object} deployments */
const deployments = {}

/** When nodeGo is run, add the node.id as a key with the value being the url
 *  then add processing to ensure that the URL's are unique. 
 * Schema: {'<node.id>': '<url>'}
 * @constant {Object} instances */
const instances = {}

/** Track the vendor packages installed and their paths
 * Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder} }
 * @constant {Object} vendorPaths */
const vendorPaths = {}

/** Update the vendorPaths object for a given package 
 * NOTE: We assume that vendorPaths already has the physical path and served url
 *       for each package referenced in <uibRoot>/.settings.js
 * @param {string} packageName The npm name of the package
*/
function updateVendorPaths(packageName) {
    //console.log('[uibuilder] updateVendorPaths - '+packageName, userDir)

    if ( userDir === '' ) return

    // Check if package exists in userDir/package.json
    const userDirPackageInfo = tilib.readPackageJson( userDir )

    //console.log('[uibuilder] updateVendorPaths - userDirPackageInfo', userDirPackageInfo)

    // Update the package details
    if ( packageName in vendorPaths ) {
        try {
            // does this package exist in <userDir>/package.json?
            vendorPaths[packageName].userDirRequired = false
            if ( packageName in userDirPackageInfo.dependencies ) {
                vendorPaths[packageName].userDirRequired = true
            }
            // version of package installed
            vendorPaths[packageName].userDirWanted = userDirPackageInfo.dependencies[packageName] || ''

            // Get the package.json for the install package
            const packageInfo = tilib.readPackageJson( vendorPaths[packageName].folder )
            // homepage of package installed
            //if ( homepage in packageInfo )
            vendorPaths[packageName].homepage = packageInfo.homepage || ''
            // Main entrypoint of package installed
            vendorPaths[packageName].main = packageInfo.main || ''
            // Installed Version
            vendorPaths[packageName].version = packageInfo.version || ''
        } catch (err) {
            //console.error('[uibuilder] updateVendorPaths - ERROR: '+packageName, err)
        }
    }
}

/** Export the function that defines the node */
module.exports = function(RED) {
    // NB: entries in settings.js are read-only and shouldn't be read using RED.settings.get, that is only for settings that can change in-flight.
    //     see Node-RED issue #1543.

    //#region ---- Constants for standard setup ----
    /** Folder containing settings.js, installed nodes, etc. @constant {string} userDir */
    userDir = RED.settings.userDir

    /** Root URL path for http-in/out and uibuilder nodes @constant {string} httpNodeRoot */
    const httpNodeRoot = RED.settings.httpNodeRoot

    /** Default uibuilder global settings @constant {Object} uib_globalSettings **/
    var uib_globalSettings = { 
        // our default installed packages
        'packages': [ 
            'vue',
            'bootstrap-vue',
            'bootstrap',
        ],
        // Which template to use for default src files? Folder must exist in the master template folder
        'template': 'vue',
        // Back-end debug?
        'debug': false,
    }

    /** Location of master template folders (containing default front-end code) @constant {string} masterTemplateFolder */
    const masterTemplateFolder = path.join( __dirname, 'templates' )

    /** Set the root folder (on the server FS) for all uibuilder front-end data
     *  Name of the fs path used to hold custom files & folders for all instances of uibuilder
     * @constant {string} uib_rootFolder
     **/
    var uib_rootFolder = path.join(userDir, moduleName)
    // If projects are enabled - update root folder to `<userDir>/projects/<projectName>/uibuilder/<url>`
    const currProject = uiblib.getProps(RED, RED.settings.get('projects'), 'activeProject', '')
    if ( currProject !== '' ) uib_rootFolder = path.join(userDir, 'projects', currProject, moduleName) 
    
    // Location of the global settings file
    const newSettingsFile = path.join(uib_rootFolder, '.settings.json')

    //#endregion -------- --------

    //#region ---- Set up global configuration ----
    /** Check uib root folder: create if needed, writable?
     * @since v2.0.0 2019-03-03
     */
    var uib_rootFolder_OK = true
    // Try to create it - ignore error if it already exists
    try {
        fs.mkdirSync(uib_rootFolder) // try to create
    } catch (e) {
        if ( e.code !== 'EEXIST' ) { // ignore folder exists error
            RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib_rootFolder}. ${e.message}`)
            uib_rootFolder_OK = false
        }
    }
    // Try to access it (read/write)
    try {
        fs.accessSync( uib_rootFolder, fs.constants.R_OK | fs.constants.W_OK ) // try to access read/write
    } catch (e) {
            RED.log.error(`uibuilder: Custom folder ERROR, path: ${uib_rootFolder}. ${e.message}`)
            uib_rootFolder_OK = false
    }
    
    /** Update global settings from <userDir>/uibuilder/.settings.json
     * Also migrate old settings.js data if needed
     * @since v2.0.0 2019-03-03
     * If userDir/moduleName/.settings.json does not exist, copy from global settings (if they exist)
     * If global settings different to new settings - log a warning
     */
    if (uib_rootFolder_OK === true) {
        if ( !fs.existsSync(newSettingsFile) ) {
            // Migrate old to new global settings
            RED.log.warn('uibuilder: Use of Node-RED global settings for uibuilder is DEPRECATED - please remove them from settings.js')    
            RED.log.warn('           uibuilder settings are now found in `<userDir>/uibuilder/.settings.json` (or the quivalent project folder).')    
            
            // Update uib_globalSettings with those from settings.json - Note settings.js now deprecated since v2
            /** Merge default and user supplied vendor packages
             * JK @since 2017-08-17 fix for non-existent properties and use getProps()
             * JK @since 2018-01-06 use uib_globalSettings instead of RED.settings.uibuilder. At least an empty array is returned.
             * JK @since v2.0.0 2019-02-24 Move out of nodeGo() to module level, remove config read as it isn't used (only settings.js)
             * JK @since v2.0.0 2019-03-03 Rearrange to better merge with new settings - Now only used for initial migration
             * @type {Array}
             */
            uib_globalSettings.packages = tilib.mergeDedupe(
                uib_globalSettings.packages, // Make sure that the default packages are included
                uiblib.getProps(RED,RED.settings,'uibuilder.userVendorPackages',[])
            )
            uib_globalSettings.debug = uiblib.getProps(
                RED, uib_globalSettings, 'debug', uib_globalSettings.debug
            )
            
            // create new settings file & copy over uib_globalSettings
            //fs.closeSync(fs.openSync(newSettingsFile, 'w'))
            fs.writeFileSync(newSettingsFile, JSON.stringify(uib_globalSettings, null, '    '))
        } else {
            // Read the settings file into uib_globalSettings
            uib_globalSettings = uiblib.readGlobalSettings(newSettingsFile, RED)
        }
    }

    RED.log.info('+-----------------------------------------------------')
    RED.log.info('| uibuilder:')
    RED.log.info(`|   root folder: ${uib_rootFolder}`)
    RED.log.info(`|   version . .: ${nodeVersion}`)
    RED.log.info(`|   debug . . .: ${uib_globalSettings.debug}`)
    RED.log.info(`|   packages . : ${uib_globalSettings.packages}`)
    RED.log.info('+-----------------------------------------------------')
    //#endregion ---- ----

    //#region ---- back-end debugging ----
    if ( !fs.existsSync(path.join(uib_rootFolder, '.logs')) ) fs.mkdirSync(path.join(uib_rootFolder, '.logs'))
    var log = logger.console(path.join(uib_rootFolder, '.logs', 'uibuilder.log'))
    if (uib_globalSettings.logging) {
        log.level = uib_globalSettings.logging
    } else {
        log.level = 'none'
    }
    if (uib_globalSettings.debug) {
        log.debugging = uib_globalSettings.debug === true ? true : false
    } else {
        log.debugging = false
    }
    log.verbose('[Module] ----------------- uibuilder - module started -----------------')
    //#endregion ---- ----

    /** We need an http server to serve the page and vendor packages. 
     * @since 2019-02-04 removed httpAdmin - we only want to use httpNode for web pages 
     * @since v2.0.0 2019-02-23 Moved from instance level (nodeGo()) to module level */
    const app = RED.httpNode // || RED.httpAdmin

    //#region ---- Serve up vendor packages ----
    /** Include vendor resource source paths if needed
     * @since v2.0.0 2019-02-23 moved from nodeGo() to module level and merged with default vendor package list
     * @since 2017-09-19 Using get-installed-path to find where a module is actually installed
     * @since 2017-09-19 AND try require.resolve() as backup (NB this may return unusable path for linked modules) 
     * @since 2017-09-21 force cwd to be NR's UserDir - Colin Law
     * @since v2.0.0 2019-03-04 Replace path resolution with my own code - MUCH more reliable */
    uib_globalSettings.packages.forEach(function (packageName) {
        let temp = uiblib.addVendorPath(packageName, moduleName, userDir, log, app, serveStatic, RED)
        if ( temp !== undefined ) {
            vendorPaths[packageName] = temp
            updateVendorPaths(packageName)
        }
        // let installFolder = tilib.findPackage(packageName, userDir)
        // if (installFolder === '' ) {
        //     log.error(`[Module] Failed to add user vendor path - no install found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}` )
        //     RED.log.warn(`uibuilder:Module: Failed to add user vendor path - no install found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}`)
        // } else {
        //     let vendorPath = tilib.urlJoin(moduleName, 'vendor', packageName)
        //     log.info('[Module] Adding user vendor path', {'url': vendorPath, 'path': installFolder})
        //     try {
        //         app.use( vendorPath, serveStatic(installFolder) )
        //     } catch (e) {
        //         RED.log.error(`uibuilder: app.use failed. vendorPath: ${vendorPath}, installFolder: ${installFolder}`, e)
        //     }
        //     vendorPaths[packageName] = {'url': '..'+vendorPath, 'folder': installFolder}
        //     updateVendorPaths(packageName)
        // }
    }) // -- end of forEach vendor package -- //

    /** Create a new, additional static http path to enable loading of central static resources for uibuilder
     * @since v2.0.0 2019-03-03 Moved out of nodeGo() only need to do once - but is applied in nodeGo
     */
    var masterStatic = function(req,res,next) { next() }
    try {
        // Will we use "compiled" version of module front-end code?
        fs.accessSync( path.join(__dirname, 'dist', 'index.html'), fs.constants.R_OK )
        log.debug('[Module] Using master production build folder')
        // If the ./dist/index.html exists use the dist folder...
        masterStatic = serveStatic( path.join( __dirname, 'dist' ) )
    } catch (e) {
        // ... otherwise, use dev resources at ./src/
        log.debug('[Module] Using master src folder and master vendor packages')
        log.debug('        Reason for not using master dist folder: ', e.message )
        masterStatic = serveStatic( path.join( __dirname, 'src' ) )
    }

    //#endregion -------- --------

    //#region ---- Set up Socket.IO ----
    /** Holder for Socket.IO - we want this to survive redeployments of each node instance
     *  so that existing clients can be reconnected.
     * Start Socket.IO - make sure the right version of SIO is used so keeping this separate from other
     * modules that might also use it (path). This is only needed ONCE for ALL instances of this node.
     * NOTE: This ignores RED.settings.httpNodeRoot deliberately, it will always be ../uibuilder/socket.io
     *       otherwise it is impossible to have a standard index.html file.
     **/

    /** @constant {string} uib_socketPath */
    const uib_socketPath = tilib.urlJoin(httpNodeRoot, moduleName, 'socket.io')

    log.debug('[Module] Socket.IO initialisation - Socket Path=', uib_socketPath )
    var io = socketio.listen(RED.server, {'path': uib_socketPath}) // listen === attach
    // @ts-ignore
    io.set('transports', ['polling', 'websocket'])

    // Check that all incoming SocketIO data has the IO cookie
    // TODO: Needs a bit more work to add some real security - should it be on ioNs? - No! Pointless as it is only done on connection
    io.use(function(socket, next){
        /* Some SIO related info that might be useful in security checks
            //console.log('--socket.request.connection.remoteAddress--')
            //console.dir(socket.request.connection.remoteAddress)
            //console.log('--socket.handshake.address--')
            //console.dir(socket.handshake.address)
            //console.dir(io.sockets.connected)
        */
        if (socket.request.headers.cookie) {
            //log.info('[Module] io.use - Authentication OK - ID: ' + socket.id)
            //log.debug('[Module] Cookie', socket.request.headers.cookie)  // socket.handshake.headers.cookie
            return next()
        }
        next(new Error('UIbuilder:io.use - Authentication error - ID: ' + socket.id ))
    })
    /** @since 2017-12-20 add optional socket middleware from settings.js
     * Use for custom authorisation such as JWT.
     * WARNING: This will be called ONLY when the initial connection happens,
     *          it is NOT run on every message exchange.
     *          This means that websocket connections can NEVER be as secure.
     *          since token expiry and validation is only run once
     * TODO Could be mitigated with custom function in msg send and receive functions
     **/
    if ( uib_globalSettings.hasOwnProperty('socketmiddleware') ) {
        /** Is a uibuilder specific function available? */
        if ( typeof uib_globalSettings.socketmiddleware === 'function' ) {
            log.verbose('[Module] Using socket middleware from settings.js')
            io.use(uib_globalSettings.socketmiddleware)
        }
    }
    //#endregion ---- ----

    /**
     * Run the node instance
     * @param {Object} config The configuration object passed from the Admin interface (see the matching HTML file)
     */
    function nodeGo(config) {
        // Create the node
        RED.nodes.createNode(this, config)

        /** @since 2019-02-02 - the current instance name (url) */
        var uibInstance = config.url // for logging

        log.verbose(`[${uibInstance}] ================ instance registered ================`)

        /** A copy of 'this' object in case we need it in context of callbacks of other functions. @constant {Object} node */
        const node = this

        log.verbose(`[${uibInstance}] = Keys: this, config =`, {'this': Object.keys(node), 'config': Object.keys(config)})

        //#region --- Create local copies of the node configuration (as defined in the .html file)
        // NB: node.id and node.type are also available
        node.name          = config.name  || ''
        node.topic         = config.topic || ''
        node.url           = config.url   || 'uibuilder'
        node.fwdInMessages = config.fwdInMessages        // @since 2017-09-20 changed to remove default, || with boolean doesn't work properly
        node.allowScripts  = config.allowScripts
        node.allowStyles   = config.allowStyles
        node.debugFE       = config.debugFE
        node.copyIndex     = config.copyIndex
        //#endregion ----

        log.verbose(`[${uibInstance}] Node instance settings`, {'name': node.name, 'topic': node.topic, 'url': node.url, 'fwdIn': node.fwdInMessages, 'allowScripts': node.allowScripts, 'allowStyles': node.allowStyles, 'debugFE': node.debugFE })

        // Keep a log of the active instances @since 2019-02-02
        instances[node.id] = node.url
        log.verbose(`[${uibInstance}] Node Instances Registered`, instances)

        /** Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder
         *   Files in this folder are also served to URL but take preference
         *   over those in the nodes folders (which act as defaults) @type {string}
         */
        node.customFolder = path.join(uib_rootFolder, node.url)

        //#region ---- Socket.IO instance configuration ----
        /** How many Socket clients connected to this instance? @type {integer} */
        node.ioClientsCount = 0
        /** How many msg's received since last reset or redeploy? @type {integer} */
        node.rcvMsgCount = 0
        /** The channel names for Socket.IO @type {Object} */
        node.ioChannels = {control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}
        /** Make sure each node instance uses a separate Socket.IO namespace - WARNING: This HAS to match the one derived in uibuilderfe.js
         * @since v1.0.10, changed namespace creation to correct a missing / if httpNodeRoot had been changed from the default. @type {string} */
        node.ioNamespace = tilib.urlJoin(httpNodeRoot, node.url)
        //#endregion ---- ----

        log.verbose(`[${uibInstance}] Socket.io details`, { 'ClientCount': node.ioClientsCount, 'rcvdMsgCount': node.rcvMsgCount, 'Channels': node.ioChannels, 'Namespace': node.ioNamespace } )

        // Keep track of the number of times each instance is deployed.
        // The initial deployment = 1
        if ( deployments.hasOwnProperty(node.id) ) deployments[node.id]++
        else deployments[node.id] = 1
        log.verbose(`[${uibInstance}] Number of Deployments`, deployments[node.id] )

        /** Provide the ability to have a ExpressJS middleware hook.
         * This can be used for custom authentication/authorisation or anything else.
         * The function must be defined in settings.js
         * @since v1.0.3 2017-12-15
         */
        // TODO Only need to do this setup once - move out of nodeGo
        // TODO rework to fit new uib_globalSettings structure - maybe load from a file
        var httpMiddleware = function(req,res,next) { next() }
        if ( uib_globalSettings.hasOwnProperty('middleware') ) {
            /** Is a uibuilder specific function available? */
            if ( typeof uib_globalSettings.middleware === 'function' ) {
                log.verbose(`[${uibInstance}] Using uibuilder specific middleware from settings.js`)
                httpMiddleware = uib_globalSettings.middleware
            }
        } else {
            /** If not, see if the Node-RED one is available and use that instead.
             * Use httNodeMiddleware function which is defined in settings.js
             * as for the http in/out nodes - normally used for authentication
             */
            if ( typeof RED.settings.httpNodeMiddleware === 'function' ) {
                log.verbose(`[${uibInstance}] Using Node-RED middleware from settings.js`)
                httpMiddleware = RED.settings.httpNodeMiddleware
            }
        }

        /** This ExpressJS middleware runs when the uibuilder page loads - can be used for setting cookies and setting headings
         * @see https://expressjs.com/en/guide/using-middleware.html */
        function localMiddleware (req, res, next) {
            // Tell the client what Socket.IO namespace to use,
            // trim the leading slash because the cookie will turn it into a %2F
            res.setHeader('uibuilder-namespace', node.ioNamespace)
            res.cookie('uibuilder-namespace', tilib.trimSlashes(node.ioNamespace), {path: node.url, sameSite: true})
            next()
        }

        //#region ----- Create instance local folder structure ----- //
        var customStatic = function(req,res,next) { next() } // Dummy ExpressJS middleware, replaced by local static folder if needed
        var customFoldersOK = true
        // TODO: May be better as async calls - probably not, but a promisified version would be OK?
        // TODO make sure the folder for this node instance exists
        try {
            fs.mkdirSync(node.customFolder)
            fs.accessSync(node.customFolder, fs.constants.W_OK)
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error(`[${uibInstance}] Local custom folder ERROR`, e.message)
                customFoldersOK = false
            }
        }
        // Then make sure the DIST & SRC folders for this node instance exist
        try {
            fs.mkdirSync( path.join(node.customFolder, 'dist') )
            fs.mkdirSync( path.join(node.customFolder, 'src') )
        } catch (e) {
            if ( e.code !== 'EEXIST' ) {
                log.error(`[${uibInstance}] Local custom dist or src folder ERROR`, e.message)
                customFoldersOK = false
            }
        }

        // We've checked that the custom folder is there and has the correct structure
        if ( uib_rootFolder_OK === true && customFoldersOK === true ) {
            // local custom folders are there ...
            log.debug(`[${uibInstance}] Using local front-end folders in`, node.customFolder)

            /** Now copy files from the master template folder (instead of master src) @since 2017-10-01
             *  Note: We don't copy the master dist folder
             *  Don't copy if copy turned off in admin ui 
             * TODO: always copy index.html */
            if ( node.copyIndex ) {
                const cpyOpts = {'overwrite':false, 'preserveTimestamps':true}
                fs.copy( path.join( masterTemplateFolder, uib_globalSettings.template ), path.join(node.customFolder, 'src'), cpyOpts, function(err){
                    if(err){
                        log.error(`[${uibInstance}] Error copying template files from ${path.join( __dirname, 'templates')} to ${path.join(node.customFolder, 'src')}`, err)
                    } else {
                        log.debug(`[${uibInstance}] Copied template files to local src (not overwriting)`, node.customFolder )
                    }
                })
            }
        } else {
            // Local custom folders are not right!
            log.error(`[${uibInstance}] Wanted to use local front-end folders in ${node.customFolder} but could not`)
        }

        //#region Add static path for instance local custom files
        // TODO: need a build capability for dist - nb probably keep vendor and private code separate
        try {
            // Check if local dist folder contains an index.html & if NR can read it - fall through to catch if not
            fs.accessSync( path.join(node.customFolder, 'dist', 'index.html'), fs.constants.R_OK )
            // If the ./dist/index.html exists use the dist folder...
            log.debug(`[${uibInstance}] Using local dist folder`)
            customStatic = serveStatic( path.join(node.customFolder, 'dist') )
            // NOTE: You are expected to have included vendor packages in
            //       a build process so we are not loading them here
        } catch (e) {
            // dist not being used or not accessible, use src
            log.debug(`[${uibInstance}] Dist folder not in use or not accessible. Using local src folder`, e.message )
            customStatic = serveStatic( path.join(node.customFolder, 'src') )
        }
        //#endregion -- Added static path for local custom files -- //
        //#endregion ------ End of Create custom folder structure ------- //

        /** Apply all of the middleware functions to the current instance url 
         * Must be applied in the right order with the most important first
        */
        app.use( tilib.urlJoin(node.url), httpMiddleware, localMiddleware, customStatic, masterStatic )

        const fullPath = tilib.urlJoin( httpNodeRoot, node.url ) // same as node.ioNamespace

        log.info(`[${uibInstance}] Version ${nodeVersion} started at URL ${fullPath}`)
        log.info(`[${uibInstance}] UI Source files at ${node.customFolder}`)
        RED.log.info(`uibuilder:${uibInstance}: Instance started. URL: ${fullPath}`)
        RED.log.info(`uibuilder:${uibInstance}: Source files . . . . : ${node.customFolder}`)

        //console.dir(app._router.stack)
        //if (debug && process.env.NODE_ENV === 'development') { // Only in dev environment
            // Absolute path to output file
            //var filepath = path.join(__dirname, './routes.generated.txt')
            // Invoke express-print-routes
            //require('express-print-routes')(app, filepath)
        //}

        // We only do the following if io is not already assigned (e.g. after a redeploy)
        uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'Node Initialised' }, node )

        /** Each deployed instance has it's own namespace @type {Object.ioNameSpace} */
        var ioNs = io.of(node.ioNamespace)

        /** When someone loads the page, it will try to connect over Socket.IO
         *  note that the connection returns the socket instance to monitor for responses from
         *  the ui client instance */
        ioNs.on('connection', function(socket) {
            node.ioClientsCount++

            log.verbose(`[${uibInstance}] Socket connected, clientCount: ${node.ioClientsCount}, ID: ${socket.id}`)

            uiblib.setNodeStatus( { fill: 'green', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )

            // Let the clients (and output #2) know we are connecting & send the desired debug state
            uiblib.sendControl({
                'uibuilderCtrl': 'client connect',
                'cacheControl': 'REPLAY',          // @since 2017-11-05 v0.4.9 @see WIKI for details
                'debug': node.debugFE,
                '_socketId': socket.id,
                'from': 'server',
                // @since 2018-10-07 v1.0.9 - send server timestamp so that client can work out
                // time difference (UTC->Local) without needing clever libraries.
                'serverTimestamp': (new Date()),
            }, ioNs, node)
            //ioNs.emit( node.ioChannels.control, { 'uibuilderCtrl': 'server connected', 'debug': node.debugFE } )

            // if the client sends a specific msg channel...
            socket.on(node.ioChannels.client, function(msg) {
                log.debug(`[${uibInstance}] Data received from client, ID: ${socket.id}, Msg:`, msg)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'topic': node.topic, 'payload': msg}
                }

                // If the sender hasn't added msg._clientId, add the Socket.id now
                if ( ! msg.hasOwnProperty('_socketId') ) {
                    msg._socketId = socket.id
                }

                // Send out the message for downstream flows
                // TODO: This should probably have safety validations!
                node.send(msg)
            })
            socket.on(node.ioChannels.control, function(msg) {
                log.debug(`[${uibInstance}] Control Msg from client, ID: ${socket.id}, Msg:`, msg)

                // Make sure the incoming msg is a correctly formed Node-RED msg
                switch ( typeof msg ) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                        msg = { 'uibuilderCtrl': msg }
                }

                // If the sender hasn't added msg._clientId, add the Socket.id now
                if ( ! msg.hasOwnProperty('_socketId') ) {
                    msg._socketId = socket.id
                }

                // @since 2017-11-05 v0.4.9 If the sender hasn't added msg.from, add it now
                if ( ! msg.hasOwnProperty('from') ) {
                    msg.from = 'client'
                }

                // Send out the message on port #2 for downstream flows
                uiblib.sendControl(msg, ioNs, node)  // fn adds topic if needed
                //node.send([null,msg])
            })

            socket.on('disconnect', function(reason) {
                node.ioClientsCount--
                log.debug(
                    `[${uibInstance}] Socket disconnected, clientCount: ${node.ioClientsCount}, Reason: ${reason}, ID: ${socket.id}`
                )
                if ( node.ioClientsCount <= 0) uiblib.setNodeStatus( { fill: 'blue', shape: 'dot', text: 'connected ' + node.ioClientsCount }, node )
                else uiblib.setNodeStatus( { fill: 'green', shape: 'ring', text: 'connected ' + node.ioClientsCount }, node )
                // Let the control output port know a client has disconnected
                uiblib.sendControl({
                    'uibuilderCtrl': 'client disconnect',
                    'reason': reason,
                    '_socketId': socket.id,
                    'from': 'server'
                }, ioNs, node)
                //node.send([null, {'uibuilderCtrl': 'client disconnect', '_socketId': socket.id, 'topic': node.topic}])
            })

            socket.on('error', function(err) {
                log.error(`[${uibInstance}] ERROR received, ID: ${socket.id}, Reason: ${err.message}`)
                // Let the control output port know there has been an error
                uiblib.sendControl({
                    'uibuilderCtrl': 'socket error',
                    'error': err.message,
                    '_socketId': socket.id,
                    'from': 'server'
                }, ioNs, node)
            })

            /* More Socket.IO events but we really don't need to monitor them
                socket.on('disconnecting', function(reason) {
                    RED.log.audit({
                        'UIbuilder': node.url+' DISCONNECTING received', 'ID': socket.id,
                        'data': reason
                    })
                })
                socket.on('newListener', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' NEWLISTENER received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('removeListener', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' REMOVELISTENER received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('ping', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' PING received', 'ID': socket.id,
                        'data': data
                    })
                })
                socket.on('pong', function(data) {
                    RED.log.audit({
                        'UIbuilder': node.url+' PONG received', 'ID': socket.id,
                        'data': data
                    })
                })
            */

        }) // ---- End of ioNs.on connection ---- //

        /** Handler function for node input events (when a node instance receives a msg)
         * @param {Object} msg The msg object received.
         **/
        function nodeInputHandler(msg) {
            log.verbose(`[${uibInstance}] nodeGo:nodeInputHandler - emit received msg - Namespace: ${node.url}`) //debug

            // If msg is null, nothing will be sent
            if ( msg !== null ) {
                // if msg isn't null and isn't an object
                // NOTE: This is paranoid and shouldn't be possible!
                if ( typeof msg !== 'object' ) {
                    // Force msg to be an object with payload of original msg
                    msg = { 'payload': msg }
                }
                // Add topic from node config if present and not present in msg
                if ( !(msg.hasOwnProperty('topic')) || msg.topic === '' ) {
                    if ( node.topic !== '' ) msg.topic = node.topic
                    else msg.topic = 'uibuilder'
                }
            }

            // Keep this fn small for readability so offload
            // any further, more customised code to another fn
            msg = uiblib.inputHandler(msg, node, RED, io, ioNs, log)

        } // -- end of msg received processing -- //

        // Process inbound messages
        node.on('input', nodeInputHandler)

        // Do something when Node-RED is closing down
        // which includes when this node instance is redeployed
        node.on('close', function(removed,done) {
            log.debug(`[${uibInstance}] nodeGo:on-close: ${removed?'Node Removed':'Node (re)deployed'}`)

            node.removeListener('input', nodeInputHandler)

            // Do any complex close processing here if needed - MUST BE LAST
            //processClose(null, node, RED, ioNs, io, app) // swap with below if needing async
            uiblib.processClose(done, node, RED, ioNs, io, app, log, instances)

            done()
        })

    } // ---- End of nodeGo (initialised node instance) ---- //

    /** Register the node by name. This must be called before overriding any of the
     *  Node functions. */
    RED.nodes.registerType(moduleName, nodeGo, {
        // see userDir/settings.js - makes the settings available to the admin ui
        /* settings: {
            uibuilder: {
                value: {
                    'userVendorPackages': userVendorPackages,
                    'debug': false,
                    //middleware: function(req,res,next){next()},
                    //socketmiddleware: function(socket,next){next()},
                },
                exportable: true
            }
        } */
    })

    //#region --- Admin API's ---
    /** Create a simple NR admin API to return the list of files in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibfiles', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        //#region --- Parameter validation ---
        // We have to have a url to work with
        if ( req.query.url === undefined ) {
            log.error('[uibfiles] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.query.url.length > 20 ) {
            log.error('[uibfiles] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.query.url.length < 1 ) {
            log.error('[uibfiles] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.url.includes('..') ) {
            log.error('[uibfiles] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }
        // TODO: Does the url exist?

        var folder = req.query.folder || 'src'
        if ( folder !== 'src' && folder !== 'dist' && folder !== 'root' ) {
            log.error('[uibfiles] Admin API. folder parameter is not one of src|dest|root')
            res.statusMessage = 'folder parameter must be one of src|dest|root'
            res.status(500).end()
            return
        }
        if ( folder === 'root' ) folder = ''
        //#endregion ---- ----

        log.verbose(`[uibfiles] Admin API. File list requested for uibuilder/${req.query.url}/${req.query.folder}/`)

        const srcFolder = path.join(uib_rootFolder, req.query.url, folder)

        // Get the file list - note, ignore errors for now
        // TODO: Need to filter out folders. Or better, flatten and allow sub-folders.
        // @ts-ignore
        fs.readdir(srcFolder, {withFileTypes: true}, (err, files) => {
            if ( err ) {
                log.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
                console.error(`[uibfiles] Admin API. readDir failed for folder '${srcFolder}'.`, err)
                res.statusMessage = err
                res.status(500).end()
                return
            }
            // Send back a JSON response body containing the list of files that can be edited
            res.json(
                files
                    .filter(dirent => !dirent.isDirectory())
                    .map(dirent => dirent.name)
            )
        })

    }) // ---- End of uibfiles ---- //

    /** Create a simple NR admin API to return the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-01-27 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access
     * @param {function} cb
     **/
    RED.httpAdmin.get('/uibgetfile', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        //#region --- Parameter validation ---
        // We have to have a url to work with
        if ( req.query.url === undefined ) {
            log.error('[uibgetfile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.query.url.length > 20 ) {
            log.error('[uibgetfile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.query.url.length < 1 ) {
            log.error('[uibfiles] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.url.includes('..') ) {
            log.error('[uibgetfile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

        // We have to have an fname (file name) to work with
        if ( req.query.fname === undefined ) {
            log.error('[uibgetfile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( req.query.fname.length > 255 ) {
            log.error('[uibgetfile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( req.query.fname.includes('..') ) {
            log.error('[uibgetfile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }
        //#endregion ---- ----

        log.verbose(`[${req.query.url}:uibgetfile] Admin API. File get requested for ${req.query.fname}`)

        // Send back a plain text response body containing content of the file
        res.type('text/plain').sendFile(
            req.query.fname, 
            {
                // Prevent injected relative paths from escaping `src` folder
                'root': path.join(uib_rootFolder, req.query.url, 'src'),
                // Turn off caching
                'lastModified': false, 
                'cacheControl': false
            }
        )
    }) // ---- End of uibgetfile ---- //

    /** Create a simple NR admin API to UPDATE the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @since 2019-02-04 - Adding the file edit admin ui
     * @param {string} url The admin api url to create
     * @param {Object} permissions The permissions required for access (Express middleware)
     * @param {function} cb
     **/
    RED.httpAdmin.post('/uibputfile', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        //#region --- Parameter validation ---
        // We have to have a url to work with
        if ( req.body.url === undefined ) {
            log.error('[uibputfile] Admin API. url parameter not provided')
            res.statusMessage = 'url parameter not provided'
            res.status(500).end()
            return
        }
        // URL must not exceed 20 characters
        if ( req.body.url.length > 20 ) {
            log.error('[uibputfile] Admin API. url parameter is too long (>20 characters)')
            res.statusMessage = 'url parameter is too long. Max 20 characters'
            res.status(500).end()
            return
        }
        // URL must be more than 0 characters
        if ( req.body.url.length < 1 ) {
            log.error('[uibfiles] Admin API. url parameter is empty')
            res.statusMessage = 'url parameter is empty, please provide a value'
            res.status(500).end()
            return
        }
        // URL cannot contain .. to prevent escaping sub-folder structure
        if ( req.body.url.includes('..') ) {
            log.error('[uibputfile] Admin API. url parameter contains ..')
            res.statusMessage = 'url parameter may not contain ..'
            res.status(500).end()
            return
        }

        // We have to have an fname (file name) to work with
        if ( req.body.fname === undefined ) {
            log.error('[uibputfile] Admin API. fname parameter not provided')
            res.statusMessage = 'fname parameter not provided'
            res.status(500).end()
            return
        }
        // fname must not exceed 255 characters
        if ( req.body.fname.length > 255 ) {
            log.error('[uibputfile] Admin API. fname parameter is too long (>255 characters)')
            res.statusMessage = 'fname parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }
        // fname cannot contain .. to prevent escaping sub-folder structure
        if ( req.body.fname.includes('..') ) {
            log.error('[uibputfile] Admin API. fname parameter contains ..')
            res.statusMessage = 'fname parameter may not contain ..'
            res.status(500).end()
            return
        }
        //#endregion ---- ----
        
        log.verbose(`[${req.body.url}:uibputfile] Admin API. File put requested for ${req.body.fname}`)

        // TODO: Add path validation - Also, file should always exist to check that
        const fullname = path.join(uib_rootFolder, req.body.url, 'src', req.body.fname)

        fs.writeFile(fullname, req.body.data, function (err, data) {
            if (err) {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.error(`[${req.body.url}:uibputfile] Admin API. File write FAIL for ${req.body.fname}`, err)
                res.statusMessage = err
                res.status(500).end()
            } else {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.verbose(`[${req.body.url}:uibputfile] Admin API. File write SUCCESS for ${req.body.fname}`)
                res.statusMessage = 'File written successfully'
                res.status(200).end()
            }
        })
    }) // ---- End of uibputfile ---- //

    /** Create an index web page or JSON return listing all uibuilder endpoints
     * Also allows confirmation of whether a url is in use ('check' parameter) or a simple list of urls in use.
     * @since 2019-02-04 v1.1.0-beta6
     */
    RED.httpAdmin.get('/uibindex', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        log.verbose('[uibindex] User Page/API. List all available uibuilder endpoints')

        /** If GET includes a "check" parameter, see if that uibuilder URL is in use
         * @returns {boolean} True if the given url exists, else false
         */
        if (req.query.check) {
            res.json( Object.values(instances).includes(req.query.check) )
            return
        }

        /** If no check parameter, return full details based on type parameter */
        switch (req.query.type) {
            case 'json': {
                res.json(instances)
                break
            }
            case 'urls': {
                res.json(Object.values(instances))
                break
            }
            // default to 'html' output type
            default: {
                //console.log(app.routes) // Expresss 3.x
                //console.log(app.router.stack) // Expresss 3.x with express.router
                //console.log(app._router.stack) // Expresss 4.x
                //console.log(server.router.mounts) // Restify

                let page = '<!doctype html><html lang="en"><head><title>Uibuilder Index</title><link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" media="screen"></head><body><div class="container">'
                page += '<h1>Index of uibuilder pages</h1>'
                page += '<p>\'Folders\' refer to locations on your Node-RED\'s server. \'Paths\' refer to URL\'s in the browser.</p>'
                page += '<table class="table"><thead>'
                page += '  <tr>'
                page += '    <th>URL</th>'
                page += '    <th title="Use this to search for the source node in the admin ui">Source Node Instance</th>'
                page += '    <th>Server Filing System Folder</th>'
                page += '  </tr></thead><tbody>'
                Object.keys(instances).forEach(key => {
                    page += '  <tr>'
                    page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, instances[key])}">${instances[key]}</a></td>`
                    page += `    <td>${key}</td>`
                    page += `    <td>${path.join(uib_rootFolder, instances[key])}</td>`
                    page += '  </tr>'
                })
                page += '</tbody></table>'
                page += '<p>Note that each instance uses its own socket.io <i>namespace</i> that matches <code>httpNodeRoot/url</code>. You can use this to manually send messages to your user interface.</p>'
                page += '<p>Paste the Source Node Instance into the search feature in the Node-RED admin ui to find the instance.'
                page += 'The "Filing System Folder" shows you where the front-end (client browser) code lives.</p>'
    
                page += '<h1>Vendor Client Libraries</h1>'
                page += '<p>You can include these libraries in any uibuilder served web page. '
                page += 'Note though that you need to find out the correct file and relative folder either by looking on your Node-RED server in the location shown or by looking at the packages source online. </p>'
                page += '<table class="table"><thead>'
                page += '  <tr>'
                page += '    <th>Package</th>'
                page += '    <th>Version</th>'
                page += '    <th>uibuilder URL</th>'
                page += '    <th>Main Entry Point</th>'
                page += '    <th>Server Filing System Folder</th>'
                page += '  </tr></thead><tbody>'

                page += '  <tr>'
                let sioFolder = tilib.findPackage('socket.io', userDir)
                let sioVersion = tilib.readPackageJson( sioFolder ).version
                page += '    <td><a href="https://socket.io/">socket.io</a></td>'
                page += `    <td>${sioVersion}</td>`
                page += '    <td>../uibuilder/socket.io/socket.io.js</td>'
                page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, 'uibuilder/socket.io/socket.io.js')}">../uibuilder/socket.io/socket.io.js</a></td>`
                page += `    <td>${sioFolder}</td>`
                page += '  </tr>'

                Object.keys(vendorPaths).forEach(packageName => {
                    updateVendorPaths(packageName)
                    let pj = vendorPaths[packageName]
                    page += '  <tr>'
                    page += `    <td><a href="${pj.homepage}">${packageName}</a></td>`
                    page += `    <td>${pj.version}</a></td>`
                    page += `    <td>${pj.url}</td>`
                    page += `    <td><a href="${tilib.urlJoin(httpNodeRoot, pj.url.replace('..',''), pj.main)}">${pj.url}/${pj.main}</a></td>`
                    page += `    <td>${pj.folder}</td>`
                    page += '  </tr>'
                })
                page += '</tbody></table>'
                page += '<blockquote><p><em>Note</em>: Always use relative URL\'s. All vendor URL\'s start <code>../uibuilder/vendor/</code>, all uibuilder and custom file URL\'s start <code>./</code>.</p></blockquote>'
                page += '<p>The \'Main Entry Point\' shown is <i>usually</i> a JavaScript file that you will want in your index.html. However, because this is reported'
                page += 'by the authors of the package, it may refer to something completely different, uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation for the correct library files to load.</p>'

                page += '<h1>Settings</h1>'
                page += '<ul>'
                page += `  <li><b>uibuilder Version</b>: ${nodeVersion}</li>`
                page += `  <li><b>Global Settings File</b>: ${path.join(uib_rootFolder, '.settings.json')}</li>`
                page += `  <li><b>Backend Debug</b>: ${uib_globalSettings.debug}</li>`
                page += `  <li><b>Backend Debug Logs</b>: ${path.join(uib_rootFolder, '.logs')}</li>`
                page += `  <li><b>uib_rootFolder</b>: ${uib_rootFolder}</li>`
                page += `  <li><b>uib_socketPath</b>: ${uib_socketPath}</li>`
                page += `  <li><b>httpNodeRoot</b>: ${httpNodeRoot}</li>`
                page += '</ul>'

                // page += '<h1>userDir/package.json</h1><pre>'
                // page += tilib.syntaxHighlight( readPackageJson(userDir) )
                // page += '</pre>'

                page += '<h1>vendorPaths</h1><pre>'
                page += tilib.syntaxHighlight( vendorPaths )
                page += '</pre>'

                page += '</div></body></html>'
    
                res.send(page)
    
                break
            }
        }
    }) // ---- End of uibindex ---- //

    /** Return a list of vendor packages. Schema: {name:{url,folder}}
     * @since v2.0.0 2019-02-24
     */
    RED.httpAdmin.get('/uibvendorpackages', RED.auth.needsPermission('uibuilder.read'), function(req,res) {
        log.verbose('[uibvendorpackages] User Page/API. List all available uibuilder vendor paths')

        // Reload the settings file into uib_globalSettings in case it has changed
        const settings = uiblib.readGlobalSettings(newSettingsFile, RED)
        // Check if package list has changed, update vendorPaths if needed
        if ( uib_globalSettings.packages.toString() !== settings.packages.toString() ) {
            //console.log('uib_globalSettings changing', uib_globalSettings.packages, settings.packages)
            let temp = tilib.compareArrays(settings.packages, uib_globalSettings.packages)
            console.log('\n\n---------\nTEMP', temp, '\n--------\n\n')
            uib_globalSettings = settings

            // Additions
            temp[0].forEach( (packageName) => {
                let temp = uiblib.addVendorPath(packageName, moduleName, userDir, log, app, serveStatic, RED)
                if ( temp !== undefined ) {
                    vendorPaths[packageName] = temp
                    updateVendorPaths(packageName)
                }
            } )

            // TODO Deletions
            temp[1].forEach( (val) => {
                //
            } )
        }

        res.json(vendorPaths)  // schema: {name:{url,folder}}
    }) // ---- End of uibindex ---- //

    /** Call npm. Schema: {name:{(url),cmd}}
     * If url parameter not provided, cwd = <userDir>, else cwd = <userDir>/<url>
     * Returns JSON {error} if package.json doesn't exist in the cwd
     * Valid commands:
     *    packages = List the installed npm packages
     *    * = run as npm command with --json output
     * @since v2.0.0 2019-03-02
     * @param {string} [req.query.url=userDir] Optional. If present, CWD is set to the uibuilder folder for that instance. Otherwise CWD is set to the userDir.
     * @param {string} req.query.cmd Command to run (see notes for this function)
     */
    RED.httpAdmin.get('/uibnpm', RED.auth.needsPermission('uibuilder.write'), function(req,res) {
        log.verbose(`[uibnpm] Call npm. Cmd: ${req.query.cmd}`)

        const npm = 'npm' //process.platform === 'win32' ? 'npm.cmd' : 'npm'

        // Set the Current Working Directory (CWD). Default to userDir.
        let uibPath = userDir
        if ( req.query.url ) uibPath = path.join(uib_rootFolder, req.query.url)

        // console.log('[uibnpm] COMSPEC ', process.env.ComSpec) // normally will be cmd.exe for Windows

        // Check if package.json exists in <uibRoot>(/<url>) - if not, return error

        const output = {
            'result': [],
            'errResult': [],
            'error': [],
            'path': uibPath,
        }
        
        // Validate cmd parameter
        let cmd = '',      // command to run (if not empty string)
            chk = true,    // Run the package.json check
            chkWarn = true // If false, package.json check fail will prevent cmd from running
        switch (req.query.cmd) {
            // Check whether chosen CWD has a package.json - no command run
            case 'check': {
                cmd = ''
                break
            }
            // List the top-level packages installed
            case 'packages': {
                cmd = `${npm} ls --depth=0 --json`
                break
            }
            // Initialise a package.json file in the chosen CWD
            case 'init': {
                cmd = `${npm} init -y --json`
                break
            }
            // Install an npm package in the chosen CWD
            case 'install': {
                /** Don't allow cmd to continue if package.json doesn't exist
                 *  since this will install the package in a parent folder
                 *  and that can be confusing.
                 */
                chkWarn = false
                if ( req.query.package ) {
                    cmd = `${npm} install ${req.query.package} --json`
                } else {
                    // No package to install
                    cmd = ''
                    output.error.push('No package name supplied for the install command')
                }
                break
            }
            // Update an npm package in the chosen CWD
            case 'update': {
                /** Don't allow cmd to continue if package.json doesn't exist
                 *  since this will update the package in a parent folder
                 *  and that can be confusing.
                 */
                chkWarn = false
                if ( req.query.package ) {
                    cmd = `${npm} update ${req.query.package} --json`
                } else {
                    // No package to install
                    cmd = ''
                    output.error.push('No package name supplied for the update command')
                }
                break
            }
            // Remove an npm package from the chosen CWD
            case 'remove': {
                /** Don't allow cmd to continue if package.json doesn't exist
                 *  since this will install the package in a parent folder
                 *  and that can be confusing.
                 */
                chkWarn = false
                if ( req.query.package ) {
                    cmd = `${npm} remove ${req.query.package} --json`
                } else {
                    // No package to install
                    cmd = ''
                    output.error.push('No package name supplied for the remove command')
                }
                break
            }
            default: {
                cmd = `${req.query.cmd} --json`
                break
            }
        }

        // Check whether chosen CWD has a package.json - if not, immediately returns an error
        if (chk) {
            let pjPath = path.join(uibPath, 'package.json')
            output.check = {}
            if ( !fs.existsSync(pjPath) ) {
                output.errResult.push(`${pjPath} does not exist`)
                output.error.push(`package.json does not exist in folder ${uibPath}`)
                output.check['package.json'] = false
                // If cmd isn't sensible without package.json, stop it now
                if (chkWarn === false) {
                    cmd = ''
                    output.error.push('cmd blocked because no package.json exists at this path')
                }
            } else {
                output.result.push(`${pjPath} exists`)
                output.check['package.json'] = true
            }
            let modPath = path.join(uibPath, 'node_modules')
            if ( !fs.existsSync(modPath) ) {
                output.errResult.push(`${modPath} does not exist`)
                output.error.push(`node_modules does not exist in folder ${uibPath}`)
                output.check['node_modules'] = false
            } else {
                output.result.push(`${modPath} exists`)
                output.check['node_modules'] = true
            }
        }

        if (cmd !== '') {
            // Always run the cmd against the correct instance or userDir (cwd)
            let child = child_process.exec(cmd, {'cwd': uibPath}, (error, stdout, stderr) => {
                // try to force output to JSON (or split by newline)
                try {
                    output.result.push(JSON.parse(stdout))
                } catch (error) {
                    output.result.push(stdout.split('\n'))
                }
                try {
                    output.errResult.push(JSON.parse(stderr))
                } catch (error) {
                    output.errResult.push(stderr.split('\n'))
                }

                if (error !== null) output.error.push(error)

                switch (req.query.cmd) {
                    // List the installed modules for this instance
                    case 'packages': {
                        output.packages = Object.keys(output.result[output.result.length-1].dependencies)
                        break
                    }
                    case 'install': {
                        let lastResult = output.result[output.result.length-1]
                        let errCode = uiblib.getProps(RED, lastResult, 'error.code', '')
                        if ( errCode === 'E404' ) {
                            output.error.push(`Package '${req.query.package}' not found by npm`)
                            output.installAction = 'none'
                        }
                        // Note that an install make comprise many add/update/etc actions
                        if ( uiblib.getProps(RED, lastResult, 'updated[0].action', '') === 'update' ) {
                            output.installAction = 'update'
                        }
                        if ( uiblib.getProps(RED, lastResult, 'added[0].action', '') === 'add' ) {
                            output.installAction = 'add'
                        }
                        break
                    }
                    default: {
                        break
                    }
                }

                res.json(output)
            }) // --- End of exec process (async) --- //
        } else {
            res.json(output)
        }

    }) // ---- End of uibindex ---- //
    //#endregion --- Admin API's ---

} // ==== End of module.exports ==== //

// EOF
