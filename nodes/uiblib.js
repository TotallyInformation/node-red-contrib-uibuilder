/**
 * Utility library for uibuilder
 * 
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

const fs = require('fs-extra')
const tilib = require('./tilib.js')
const util = require('util')

module.exports = {

    // Complex, custom code when processing an incoming msg should go here
    // Needs to return the msg object
    inputHandler: function(msg, node, RED, io, ioNs, log) {
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
            log.trace(`[${node.url}] msg sent on to client ${msg._socketId}. Channel: ${node.ioChannels.server}`, msg)
            ioNs.to(msg._socketId).emit(node.ioChannels.server, msg)
        } else {
            log.trace(`[${node.url}] msg sent on to ALL clients. Channel: ${node.ioChannels.server}`, msg)
            ioNs.emit(node.ioChannels.server, msg)
        }

        if (node.fwdInMessages) {
            // Send on the input msg to output
            node.send(msg)
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
        this.sendControl({ 'uibuilderCtrl': 'shutdown', 'from': 'server' }, ioNs, node)

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
        app._router.stack.forEach( function(r, i, stack) {
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
        instances[node.id] = undefined

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
     * @param {string|array} props - one or a list of property names to retrieve.
     *                               Can be nested, e.g. 'prop1.prop1a'
     *                               Stops searching when the first property is found
     * @param {any} defaultAnswer - if the prop can't be found, this is returned
     * JK @since 2017-08-17 Added
     * TODO Change instances of "in" and "hasOwnProperty" to use this function
     */
    getProps: function(RED,myObj,props,defaultAnswer = []) {
        if ( (typeof props) === 'string' ) {
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
     */
    sendControl: function(msg, ioNs, node, socketId) {
        if (socketId) msg._socketId = socketId

        // Send to specific client if required
        if (msg._socketId) ioNs.to(msg._socketId).emit(node.ioChannels.control, msg)
        else ioNs.emit(node.ioChannels.control, msg)

        if ( (! msg.hasOwnProperty('topic')) && (node.topic !== '') ) msg.topic = node.topic

        // copy msg to output port #2
        node.send([null, msg])
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

    /** Add an ExpressJS url for an already npm installed package (doesn't update vendorPaths var)
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
        if ( installFolder === '' ) {
            installFolder = tilib.findPackage(packageName, userDir)
        }

        if (installFolder === '' ) {
            RED.log.warn(`uibuilder:Module: Failed to add user vendor path - no install found for ${packageName}.  Try doing "npm install ${packageName} --save" from ${userDir}`)
            return null
        } else {
            let vendorPath = tilib.urlJoin(moduleName, 'vendor', packageName)
            log.trace(`[uibuilder:uiblib:addPackage] Adding user vendor path:  ${util.inspect({'url': vendorPath, 'path': installFolder})}`)
            try {
                app.use( vendorPath, /**function (req, res, next) {
                    // TODO Allow for a test to turn this off
                    // if (true !== true) {
                    //     next('router')
                    // }
                    next() // pass control to the next handler
                }, */ serveStatic(installFolder) )
                
                return {'url': '..'+vendorPath, 'folder': installFolder}
            } catch (e) {
                RED.log.error(`uibuilder: app.use failed. vendorPath: ${vendorPath}, installFolder: ${installFolder}`, e)
                return null
            }
        }
    }, // ---- End of addPackage ---- //

    /** Check/add/remove packages in vendorPaths & static server
     * @param {Object} vendorPaths Schema: {'<npm package name>': {'url': vendorPath, 'path': installFolder, 'version': packageVersion, 'main': mainEntryScript} }
     * @param {string} moduleName Name of the uibuilder module ('uibuilder' by default)
     * @param {string} userDir Name of the Node-RED userDir folder currently in use
     * @param {Object} log Custom logger instance
     * @param {Object} app ExpressJS web server app instance
     * @param {Object} serveStatic ExpressJS static serving middleware instance
     * @param {Object} RED RED object instance (for error logging)
     * @returns {Object} Updated vendorPaths object
     */
    updVendorPaths: function(vendorPaths, moduleName, userDir, log, app, serveStatic, RED) {
        if ( userDir === '' ) return null

        // Check for known, common packages and add them if found & not already in vendorPaths
        const commonFePackages = [
            // TODO Move this to the main module - or maybe to its own object in this library
            'vue','bootstrap','bootstrap-vue','jquery','moonjs','reactjs','riot','angular',
            'picnic','umbrellajs',
        ]
        commonFePackages.forEach(packageName => {
            let fp = tilib.findPackage(packageName, userDir)
            if ( (fp !== null) && (! vendorPaths.hasOwnProperty(packageName)) ) {
                // Add package
                let fp2 = this.addPackage(packageName, fp, moduleName, userDir, log, app, serveStatic, RED)
                //findPackage = null
                if ( (fp2 !== null) ) {
                    vendorPaths[packageName] = fp2
                }
            }
        })
        
        if ( Object.values(vendorPaths).length === 0 ) return null

        const packageList = Object.keys(vendorPaths)

        packageList.forEach(function(packageName,index){
            /** RE-Check if package exists in userDir/node_modules (tilib.findPackage) (in case it was removed via command line)
             * @type {string|null} pkgFolder
             */
            const pkgFolder = tilib.findPackage(packageName, userDir)
            if ( pkgFolder === null ) {
                // If it doesn't, remove from list (will disable static serve route)
                delete vendorPaths[packageName]
            } else {
                // If it does, re-read package.json for any updated details

                // Get the package.json
                const pj = tilib.readPackageJson( pkgFolder )
                // Find installed version
                vendorPaths[packageName].version = pj.version
                // Find main entry point (or null)
                vendorPaths[packageName].main = pj.main
                // Find homepage
                vendorPaths[packageName].homepage = pj.homepage

                // TODO (maybe) check if it exists in userDir/package.json
            }
        })

        return vendorPaths

        // Check if package exists in userDir/package.json
        //const userDirPackageInfo = tilib.readPackageJson( userDir )

/*         //console.log('[uibuilder] updateVendorPaths - userDirPackageInfo', userDirPackageInfo)

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
        } */

        //return vendorPaths
    }, // ---- End of updVendorPaths ---- //

} // ---- End of module.exports ---- //
