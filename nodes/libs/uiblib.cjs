/* eslint-disable jsdoc/valid-types */
/**
 * Utility library for uibuilder
 *
 * Copyright (c) 2017-2025 Julian Knight (Totally Information)
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
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').MsgAuth} MsgAuth
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs.js').runtimeNode} runtimeNode
 * typedef {import('../typedefs.js')}
 * typedef {import('node-red')} Red
 * typedef {import('Express')} Express
 * typedef {import('socket.io').Namespace} socketio.Namespace
 * typedef {import('socket.io').Socket} socketio.Socket
 */

const path = require('node:path')
const { promisify, } = require('node:util')
const crypto = require('node:crypto')
const { spawn, spawnSync, } = require('node:child_process')
const fslib = require('./fs.cjs')
// NOTE: Don't add socket.js here otherwise it will stop working because it references this module

/** Encode data in a buffer as Base32 with a url-safe alphabet.
 * Based on https://github.com/luavixen/foxid
 * Algorithm copied from https://github.com/LinusU/base32-encode by Linus Unnebäck, MIT licensed.
 * @param {Buffer} buff - A buffer containing crypto random bytes
 * @param {number} length - Number of characters in the encoded string
 * @param {number} size - Number of bytes in `buffer` to encode
 * @returns {string} Encoded string
 */
function encodeNanoId(buff, length, size) {
    let bits = 0
    let value = 0
    let output = ''
    const alphaLen = 59 // was 31 in original (alphabet was only 0-9a-z = 32 chars)
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjkmnpqrstvwxyz_-'

    for (let i = 0; i < size; i++) {
        value = (value << 8) | buff[i]
        bits += 8

        while (bits >= 5) {
            output += alphabet[(value >>> (bits - 5)) & alphaLen]
            bits -= 5
        }
    }

    if (bits > 0 && output.length < length) {
        output += alphabet[(value << (5 - bits)) & alphaLen]
    }

    return output.substring(0, length)
}

/** Generates a secure and URL-friendly unique ID.
 * Based on https://github.com/luavixen/foxid
 * @param {number} [length] - Length of the generated ID, defaults to 21.
 * @returns {string} Newly generated ID as a string.
 */
function nanoId(length) {
    length = Math.max(length | 0, 0) || 21
    const size = (length * 5 + 7) >>> 3

    const buffer = Buffer.allocUnsafeSlow(size)

    crypto.randomFillSync(buffer, 0, size)

    return encodeNanoId(buffer, length, size)
}

const UibLib = {
    // ! TODO: Replace fs-extra
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

        log.trace(`🌐[uibuilder[:uiblib:instanceClose:${node.url}] Running instance close.`)

        /** @type {object} instances[] Reference to the currently defined instances of uibuilder */
        const instances = uib.instances

        try { // Wrap this in a try to make sure that everything is working
            // Remove url folder if requested
            if ( uib.deleteOnDelete[node.url] === true ) {
                log.trace(`🌐[uibuilder:uiblib:instanceClose] Deleting instance folder. URL: ${node.url}`)

                // Remove the flag in case someone recreates the same url!
                delete uib.deleteOnDelete[node.url]

                fslib.remove(path.join(uib.rootFolder, node.url))
                    .catch((err) => {
                        log.error(`🌐🛑[uibuilder:uiblib:processClose] Deleting instance folder failed. URL=${node.url}, Error: ${err.message}`)
                    })
            }

            // Keep a log of the active instances @since 2019-02-02
            delete instances[node.id] // = undefined

            node.statusDisplay.text = 'CLOSED'
            this.setNodeStatus(node)

            // Let all the clients know we are closing down
            sockets.sendToFe({ uibuilderCtrl: 'shutdown', }, node, uib.ioChannels.control)

            // Disconnect all Socket.IO clients for this node instance
            sockets.removeNS(node)
        } catch (err) {
            log.error(`🌐🛑[uibuilder:uiblib:instanceClose] Error in closure. Error: ${err.message}`, err)
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

    // hooks: function(hookName) {
    //     if (RED.settings.uibuilder && RED.settings.uibuilder.hooks && RED.settings.uibuilder.hooks[hookName]) {
    //         return RED.settings.uibuilder.hooks[hookName]
    //     }
    // },

    /** Simple fn to set a node status in the admin interface
     * fill: red, green, yellow, blue or grey
     * shape: ring, dot
     * @param {object} node _
     */
    setNodeStatus: function( node ) {
        node.status(node.statusDisplay)
    }, // ---- End of setNodeStatus ---- //

    /** Get the client id from req headers cookie string OR, create a new one and return that
     * @param {*} req ExpressJS request object
     * @returns {string} The clientID
     */
    getClientId: function getClientId(req) {
        const uidLen = 21
        const regex = new RegExp(`uibuilder-client-id=(?<id>.{${uidLen}})`)
        let clientId
        if ( req.headers.cookie ) {
            const matches = req.headers.cookie.match(regex)
            // if ( !matches || !matches.groups.id ) clientId = nanoid()
            if ( !matches || !matches.groups.id ) clientId = nanoId(uidLen)
            else clientId = matches.groups.id
        } else {
            // clientId = nanoid()
            clientId = nanoId(uidLen)
        }
        return clientId
    },

    /** Get an individual value for a typed input field and save to supplied node object - REQUIRES standardised node property names
     * Use propnameSource and propnameSourceType as standard input field names
     * @param {string} propName Name of the node property to check
     * @param {runtimeNode} node reference to node instance
     * @param {*} msg incoming msg
     * @param {runtimeRED} RED Reference to runtime RED library
     * @param {string} [src] Name of the typed input field (defaults to `${propName}Source`)
     * @param {string} [srcType] Name of the field holding the typed input field type (defaults to `${propName}SourceType`)
     */
    getSource: async function getSource(propName, node, msg, RED, src, srcType) {
        if (!propName) throw new Error('[uiblib:getSource] No propName provided, cannot continue')
        if (!node) throw new Error('[uiblib:getSource] No node object provided, cannot continue')
        if (!RED) throw new Error('[uiblib:getSource] No RED reference provided, cannot continue')

        if (!src) src = `${propName}Source`
        if (!srcType) srcType = `${propName}SourceType`

        if (!msg && srcType === 'msg') throw new Error('[uiblib:getSource] Type is msg but no msg object provided, cannot continue')

        if (!(src in node)) throw Error(`[uiblib:getSource] Property ${src} does not exist in supplied node object`)
        if (!(srcType in node)) throw Error(`[uiblib:getSource] Property ${srcType} does not exist in supplied node object`)

        const evaluateNodeProperty = promisify(RED.util.evaluateNodeProperty)

        if (node[src] !== '') {
            try {
                if (msg) node[propName] = await evaluateNodeProperty(node[src], node[srcType], node, msg)
                else node[propName] = await evaluateNodeProperty(node[src], node[srcType], node)
            } catch (e) {
                node.warn(`🌐⚠️[uibuilder:uiblib:getSource] Cannot evaluate source for ${propName}. ${e.message} (${srcType})`)
            }
        }
    },

    /** uibuilder/runOsCmd/log event definition
     * event uibuilder/runOsCmd/log
     * type {string} A line of log output from the running OS Command
     */

    /** Run an OS Command asynchronously - uses the default OS Shell unless overridden - returns a promise
     * @fires uibuilder/runOsCmd/log
     * @param {string} cmd The OS command to run
     * @param {Array<string>} args Array of argument strings to be passed to the command
     * @param {object} [opts] Optional. Options object. If not present, defaults to running via an OS shell
     * @param {boolean} [opts.shell] Optional. If provided, the spawn command will be run in a shell (default=true)
     * @param {boolean} [opts.windowsHide] Optional. If provided, will hide the spawned process window on Windows (default=true)
     * @param {string} [opts.out] Optional. If set to 'bare', will return just the output string, otherwise returns an object
     * @param {boolean} [opts.verbose] Optional. If true, will add extra information to the output object
     * @param {import('node:child_process').StdioOptions} [opts.stdio] Optional. If set to 'pipe', will capture stdout and stderr output (default='pipe')
     * @param {string|Buffer|null} [opts.stdout] Optional. Will be updated with the stdout output if stdio is set to 'pipe'
     * @param {string|Buffer|null} [opts.stderr] Optional. Will be updated with the stderr output if stdio is set to 'pipe'
     * @param {string} [opts.cwd] Optional. If provided, will set the current working directory for the command
     * @param {object} [opts.env] Optional. If provided, will set the environment variables for the command
     * @param {Function} [opts.stream] Optional. If provided, will be called with each chunk of output as soon as it arrives
     * @returns {Promise & {kill: Function}} The stdout/stderr output (interleaved) or the command's error reason. The returned promise has a .kill([signal]) method to terminate the process.
     * @example
     * // Kill a long-running process
     * const proc = runOsCmd('ping', ['localhost'], { stream: chunk => console.log(chunk) })
     * setTimeout(() => proc.kill(), 5000) // kill after 5 seconds
     * @example
     * // Stream output example
     * runOsCmd('ping', ['localhost'], { stream: chunk => console.log(chunk) })
     */
    /**
     * Run an OS command asynchronously, with streaming and process control support.
     * @param {string} cmd The OS command to run
     * @param {Array<string>} args Array of argument strings to be passed to the command
     * @param {object} opts Options for child_process.spawn and uiblib features
     * @param {Function} [opts.stream] Optional. Callback for streaming output chunks
     * @param {Function} [opts.childProcess] Optional. Callback to receive the spawned child process for process control
     * @param {string} [opts.out] Optional. Set to 'bare' to return just the output string
     * @param {boolean} [opts.verbose] Optional. Whether to include verbose output formatting
     * @returns {Promise<{all:string, code:number, command:string}> & {kill: (signal?: string) => void}} Promise with kill method for process control
     */
    runOsCmd: function runOsCmd(cmd, args, opts) {
        if (!opts) opts = {}

        // Extract custom properties
        const stream = opts.stream
        const childProcess = opts.childProcess
        const out = opts.out
        const verbose = opts.verbose

        // Create spawn options by copying opts and removing custom properties
        const spawnOpts = { shell: true, windowsHide: true, ...opts, }
        delete spawnOpts.stream
        delete spawnOpts.childProcess
        delete spawnOpts.out
        delete spawnOpts.verbose

        // Ensure stdio is set to 'pipe' so shell.stdout and shell.stderr are streams
        // @ts-ignore
        spawnOpts.stdio = 'pipe'
        // Ensure spawnOpts.env is an object if provided
        // @ts-ignore
        if (spawnOpts.env && typeof spawnOpts.env === 'string') {
            // @ts-ignore
            spawnOpts.env = process.env
        }
        const cmdOut = `${cmd} ${args.join(' ')}`

        /**
         * If opts.stream is provided, it should be a callback function that receives each chunk of output as soon as it arrives.
         * @callback streamCallback
         * @param {string} chunk - A chunk of output from stdout or stderr
         */

        let shellRef
        const promise = new Promise((resolve, reject) => {
            // Run the command
            // @ts-ignore
            const shell = spawn(cmd, args, spawnOpts)
            shellRef = shell
            // If opts.childProcess is a function, provide the child process reference
            if (typeof childProcess === 'function') {
                childProcess(shell)
            }

            // Capture all output in 1 place + emit log events
            let output = ''
            if (shell.stdout) {
                // @ts-ignore
                shell.stdout.on('data', (data) => {
                    const d = data.toString()
                    if (typeof stream === 'function') {
                        stream(d)
                    }
                    output += d
                })
            }
            if (shell.stderr) {
                // @ts-ignore
                shell.stderr.on('data', (data) => {
                    const d = data.toString()
                    if (typeof stream === 'function') {
                        stream(d)
                    }
                    output += d
                })
            }

            shell.on('error', (err) => {
                // Create a custom error object to avoid TypeScript lint errors
                const customErr = {
                    message: err.message,
                    all: output,
                    command: cmdOut,
                    code: 2,
                    original: err,
                }
                reject(customErr)
            })

            shell.on('close', (code) => {
                if (out === 'bare') {
                    resolve(output)
                } else {
                    let all = output
                    if (verbose === true) {
                        all = `\n------------------------------------------------------\n[uibuilder:uiblib:runOsCmd]\nCommand:\n  "${cmdOut}"\n  Completed with code ${code}\n  \n${output}\n------------------------------------------------------\n`
                    }
                    resolve({
                        all: all,
                        code: code,
                        command: cmdOut,
                    })
                }
            })
        })
        // Attach a kill method to the promise for long-running processes
        const typedPromise = promise
        // @ts-ignore
        typedPromise.kill = (signal = 'SIGTERM') => {
            if (shellRef && typeof shellRef.kill === 'function') {
                shellRef.kill(signal)
            }
        }
        // @ts-ignore
        return typedPromise
    },

    /** Run an OS Command synchronously - uses the default OS Shell unless overridden
     * WARNING: This fn will THROW if the command fails - make sure you trap it.
     * @throws {Error} If the command fails
     * @fires uibuilder/runOsCmd/log
     * @param {string} cmd The OS command to run
     * @param {Array<string>} args Array of argument strings to be passed to the command
     * @param {object} [opts] Optional. Array of argument strings to be passed to the command. If not present, defaults to running via an OS shell
     * @returns {object} The stdout/stderr output (interleaved) or the commands error reason
     */
    runOsCmdSync: function runOsCmdSync(cmd, args, opts) {
        if (!opts) opts = { shell: true, windowsHide: true, }
        // opts.stdio = 'pipe' // force this option

        /** @type {object} */
        const out = spawnSync(cmd, args, opts)

        if (opts.out === 'bare') {
            return out.stdout.toString()
        }
        out.command = `${cmd} ${args.join(' ')}`
        return out
    },

    /** Sort a uibuilder instances object by url instead of the natural order added
     * @param {*} instances The instances object to sort
     * @returns {*} instances sorted by url
     */
    sortInstances: function sortInstances(instances) {
        return Object.fromEntries(
            Object.entries(instances).sort(([, a], [, b]) => {
                const nameA = a.toUpperCase()
                const nameB = b.toUpperCase()
                if (nameA < nameB) return -1
                if (nameA > nameB) return 1
                return 0
            })
        )
    },

    /** Sort a uibuilder apps object by url instead of the natural order added
     * @param {*} apps The apps object to sort
     * @returns {*} apps sorted by url
     */
    sortApps: function sortApps(apps) {
        return apps.sort((a, b) => {
            const nameA = a[0].toUpperCase()
            const nameB = b[0].toUpperCase()
            if (nameA < nameB) return -1
            if (nameA > nameB) return 1
            return 0
        })
    },
} // ---- End of module.exports ---- //

module.exports = UibLib

// EOF
