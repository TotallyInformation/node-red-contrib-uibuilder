/* eslint-disable max-params */
/* eslint-env node es2017 */
/**
 * Utility library for uibuilder
 *
 * Copyright (c) 2017-2023 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * typedef {import('../typedefs.js')}
 * @typedef {import('node-red')} Red
 * @typedef {import('Express')} Express
 * typedef {import('socket.io').Namespace} socketio.Namespace
 * typedef {import('socket.io').Socket} socketio.Socket
 */

const path = require('path')
const fs = require('fs-extra')
// const tilib = require('./tilib')
const { nanoid } = require('nanoid')
// NOTE: Don't add socket.js here otherwise it will stop working because it references this module

module.exports = {

    /** Do any complex, custom node closure code here
     * @param {uibNode} node Reference to the node instance object
     * @param {object} uib Reference to the uibuilder master config object
     * @param {object} sockets - Instance of Socket.IO handler singleton
     * @param {object} web - Instance of ExpressJS handler singleton
     * @param {Function|null} done Default=null, internal node-red function to indicate processing is complete
     */
    instanceClose: function(node, uib, sockets, web, done = null) {

        // const RED = /** @type {runtimeRED} */ uib.RED
        const log = uib.RED.log

        log.trace(`[uibuilder:uiblib:instanceClose:${node.url}] Running instance close.`)

        /** @type {object} instances[] Reference to the currently defined instances of uibuilder */
        const instances = uib.instances

        try { // Wrap this in a try to make sure that everything is working

            // Remove url folder if requested
            if ( uib.deleteOnDelete[node.url] === true ) {
                log.trace(`[uibuilder:uiblib:instanceClose] Deleting instance folder. URL: ${node.url}`)

                // Remove the flag in case someone recreates the same url!
                delete uib.deleteOnDelete[node.url]

                fs.remove(path.join(uib.rootFolder, node.url))
                    .catch(err => {
                        log.error(`[uibuilder:uiblib:processClose] Deleting instance folder failed. URL=${node.url}, Error: ${err.message}`)
                    })
            }

            // Keep a log of the active instances @since 2019-02-02
            delete instances[node.id] // = undefined

            node.statusDisplay.text = 'CLOSED'
            this.setNodeStatus(node)

            // Let all the clients know we are closing down
            sockets.sendToFe({ 'uibuilderCtrl': 'shutdown' }, node.url, uib.ioChannels.control)

            // Disconnect all Socket.IO clients for this node instance
            sockets.removeNS(node)

        } catch (err) {
            log.error(`[uibuilder:uiblib:instanceClose] Error in closure. Error: ${err.message}`, err)
        }

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
     * @param {object} RED - RED
     * @param {object} myObj - the parent object to search for the props
     * @param {string|string[]} props - one or a list of property names to retrieve.
     *                               Can be nested, e.g. 'prop1.prop1a'
     *                               Stops searching when the first property is found
     * @param {any} defaultAnswer - if the prop can't be found, this is returned
     * @returns {any} The first found property value or the default answer
     */
    getProps: function(RED, myObj, props, defaultAnswer = []) {
        if ( (typeof props) === 'string' ) {
            // @ts-ignore
            props = [props]
        }
        if ( !Array.isArray(props) ) {
            return undefined
        }
        let ans
        for (let i = 0; i < props.length; i++) {
            try { // errors if an intermediate property doesn't exist
                ans = RED.util.getMessageProperty(myObj, props[i])
                if ( typeof ans !== 'undefined' ) {
                    break
                }
            } catch (e) {
                // do nothing
            }
        }
        return ans || defaultAnswer
    }, // ---- End of getProps ---- //

    /** Simple fn to set a node status in the admin interface
     * fill: red, green, yellow, blue or grey
     * shape: ring, dot
     * @param {object} node _
     */
    setNodeStatus: function( node ) {
        node.status(node.statusDisplay)
    }, // ---- End of setNodeStatus ---- //

    /** Replace template in front-end instance folder
     * @param {string} url The uib instance URL
     * @param {string} template Name of one of the built-in templates including 'blank' and 'external'
     * @param {string|undefined} extTemplate Optional external template name to be passed to degit. See degit options for details.
     * @param {string} cmd 'replaceTemplate' if called from admin-router:POST, otherwise can be anything descriptive & unique by caller
     * @param {object} templateConf Template configuration object
     * @param {object} uib uibuilder's master variables
     * @param {object} log uibuilder's Log functions (normally points to RED.log)
     * @returns {Promise} {statusMessage, status, (json)}
     */
    replaceTemplate: async function(url, template, extTemplate, cmd, templateConf, uib, log) {
        const res = {
            'statusMessage': 'Something went wrong!',
            'status': 500,
            'json': undefined,
        }

        // Load a new template (params url, template, extTemplate)
        if ( template === 'external' && ( (!extTemplate) || extTemplate.length === 0) ) {
            const statusMsg = `External template selected but no template name provided. template=external, url=${url}, cmd=${cmd}`
            log.error(`[uibuilder:uiblib:replaceTemplate]. ${statusMsg}`)
            res.statusMessage = statusMsg
            res.status = 500
            return res
        }

        const fullname = path.join(uib.rootFolder, url)

        if ( extTemplate ) extTemplate = extTemplate.trim()
        if ( extTemplate === undefined ) throw new Error('extTemplate is undefined')

        // If template="external" & extTemplate not blank - use degit to load
        if ( template === 'external' ) {
            const degit = require('degit')

            uib.degitEmitter = degit(extTemplate, {
                cache: false,  // Fix for Issue #155 part 3 - degit error
                force: true,
                verbose: false,
            })

            uib.degitEmitter.on('info', info => {
                log.trace(`[uibuilder:uiblib:replaceTemplate] Degit: '${extTemplate}' to '${fullname}': ${info.message}`)
            })

            await uib.degitEmitter.clone(fullname)

            // console.log({myclone})
            const statusMsg = `Degit successfully copied template '${extTemplate}' to '${fullname}'.`
            log.info(`[uibuilder:uiblib:replaceTemplate] ${statusMsg} cmd=${cmd}`)
            res.statusMessage = statusMsg
            res.status = 200

            res.json = /** @type {*} */ ({
                'url': url,
                'template': template,
                'extTemplate': extTemplate,
                'cmd': cmd,
            })
            return res

        } else if ( Object.prototype.hasOwnProperty.call(templateConf, template) ) {

            // Otherwise, use internal template
            const fsOpts = { 'overwrite': true, 'preserveTimestamps': true }
            const srcTemplate = path.join( uib.masterTemplateFolder, template )
            try {
                fs.copySync( srcTemplate, fullname, fsOpts )
                const statusMsg = `Successfully copied template ${template} to ${url}.`
                log.info(`[uibuilder:uiblib:replaceTemplate] ${statusMsg} cmd=replaceTemplate`)
                res.statusMessage = statusMsg
                res.status = 200
                res.json = /** @type {*} */ ({
                    'url': url,
                    'template': template,
                    'extTemplate': extTemplate,
                    'cmd': cmd,
                })
                return res
            } catch (err) {
                const statusMsg = `Failed to copy template from '${srcTemplate}' to '${fullname}'. url=${url}, cmd=${cmd}, ERR=${err.message}.`
                log.error(`[uibuilder:uiblib:replaceTemplate] ${statusMsg}`, err)
                res.statusMessage = statusMsg
                res.status = 500
                return res
            }

        } else {

            // Shouldn't ever be able to occur - but still :-)
            const statusMsg = `Template '${template}' does not exist. url=${url}, cmd=${cmd}.`
            log.error(`[uibuilder:uiblib:replaceTemplate] ${statusMsg}`)
            res.statusMessage = statusMsg
            res.status = 500
            return res
        }

    }, // ----- End of replaceTemplate() ----- //

    /** Get the client id from req headers cookie string OR, create a new one and return that
     * @param {*} req ExpressJS request object
     * @returns {string} The clientID
     */
    getClientId: function getClientId(req) {
        let clientId
        if ( req.headers.cookie ) {
            const matches = req.headers.cookie.match(/uibuilder-client-id=(?<id>.{21})/)
            if ( !matches || !matches.groups.id ) clientId = nanoid()
            else clientId = matches.groups.id
        } else {
            clientId = nanoid()
        }
        return clientId
    }

} // ---- End of module.exports ---- //

// EOF
