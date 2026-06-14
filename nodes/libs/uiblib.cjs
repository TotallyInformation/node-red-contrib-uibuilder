/* eslint-disable jsdoc/no-undefined-types */
/* eslint-disable jsdoc/valid-types */
/** Utility library for uibuilder
 *
 * Copyright (c) 2017-2026 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * typedef {import('../typedefs.js')}
 * typedef {import('node-red')} Red
 * typedef {import('Express')} Express
 * typedef {import('socket.io').Namespace} socketio.Namespace
 * typedef {import('socket.io').Socket} socketio.Socket
 */

const path = require('node:path')
const { promisify, } = require('node:util')
const { randomFillSync, randomUUID, } = require('node:crypto')
const { exec, spawn, spawnSync, } = require('node:child_process')
const fslib = require('./fs.cjs')
/** @type {uibConfig} The uibuilder global configuration object, used throughout all nodes and libraries. */
const uib = require('./uibGlobalConfig.cjs')
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

const UibLib = {
    /** Do any complex, custom node closure code here
     * @param {uibNode} node Reference to the node instance object
     * @param {object} uib Reference to the uibuilder master config object
     * @param {object} sockets - Instance of Socket.IO handler singleton
     * @param {object} web - Instance of ExpressJS handler singleton
     * @param {Function|null} done Default=null, internal node-red function to indicate processing is complete
     * @param {boolean} removed Indicates if the node instance is being removed (as opposed to just being stopped) - if true, the instance folder will be deleted if the deleteOnDelete flag is set for this url
     */
    instanceClose: function(node, uib, sockets, web, done = null, removed = false) {
        // const RED = /** @type {runtimeRED} */ uib.RED
        const log = uib.RED.log

        log.trace(`🌐[uibuilder[:uiblib:instanceClose:${node.url}] Running instance close.`)

        /** @type {object} instances[] Reference to the currently defined instances of uibuilder */
        const instances = uib.instances

        node.statusDisplay.text = 'CLOSED'
        this.setNodeStatus(node)

        // Cancel the file watcher if it exists
        if ( node.watcher ) {
            // @ts-ignore
            node.watcher.close()
            log.trace(`🌐[uibuilder[:nodeInstance:close:${node.url}] File watcher closed`)
        }

        // Tidy up the ExpressJS routes if a node is removed
        if (removed) {
            delete web.routers.instances[node.url]
            delete web.instanceRouters[node.url]
        }

        try {
            // Remove url folder if requested
            if ( removed && uib.deleteOnDelete[node.url] === true ) {
                log.trace(`🌐[uibuilder:uiblib:instanceClose] Deleting instance folder. URL: ${node.url}`)

                fslib.remove(path.join(uib.rootFolder, node.url))
                    .catch((err) => {
                        log.error(`🌐🛑[uibuilder:uiblib:processClose] Deleting instance folder failed. URL=${node.url}, Error: ${err.message}`)
                    })

                // Remove the flag in case someone recreates the same url!
                delete uib.deleteOnDelete[node.url]
            }
        } catch (err) {
            log.error(`🌐🛑[uibuilder:uiblib:instanceClose] Failed to remove instance folder for URL="${node.url}". Error: ${err.message}`, err)
        }

        // Keep a log of the active instances @since 2019-02-02
        delete instances[node.id] // = undefined

        try {
            // Disconnect all Socket.IO clients for this node instance
            sockets.removeNS(node)
        } catch (err) {
            log.error(`🌐🛑[uibuilder:uiblib:instanceClose] Error in closure. Error: ${err.message}`, err)
        }

        // This should be executed last if present. `done` is the data returned from the 'close'
        // event and is used to resolve async callbacks to allow Node-RED to close
        if (done) done()
    }, // ---- End of processClose function ---- //

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
            if ( !matches || !matches.groups.id ) clientId = this.nanoId(uidLen)
            else clientId = matches.groups.id
        } else {
            // clientId = nanoid()
            clientId = this.nanoId(uidLen)
        }
        return clientId
    },

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

    /** Kill a process tree
     * Inspired by https://github.com/pkrumins/node-tree-kill
     * @param {number|string} rootPid OS pid that will be killed along with its children
     * @param {"SIGTERM"|"SIGKILL"} [signal] Optional. The signal to send (default=SIGTERM)
     */
    killTree: function killTree(rootPid, signal = 'SIGTERM') {
        // @ts-ignore In case a string number is passed
        rootPid = parseInt(rootPid, 10)
        if (Number.isNaN(rootPid)) {
            throw new Error(`Invalid root PID, must be a number: ${rootPid}`)
        }

        const tree = {}
        const pidsToProcess = {}
        tree[rootPid] = []
        pidsToProcess[rootPid] = 1
        // TODO PROBABLY REMOVE
        const callback = () => {}

        switch (process.platform) {
            case 'win32': {
                exec('taskkill /pid ' + rootPid + ' /T /F', callback) // eslint-disable-line security/detect-child-process
                break
            }

            case 'darwin': {
                buildProcessTree(rootPid, tree, pidsToProcess,
                    function (parentPid) {
                        return spawn('pgrep', ['-P', parentPid])
                    },
                    function () {
                        killAll(tree, signal, callback)
                    }
                )
                break
            }

            default: { // Linux
                buildProcessTree(rootPid, tree, pidsToProcess,
                    function (parentPid) {
                        return spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', parentPid])
                    },
                    function () {
                        killAll(tree, signal, callback)
                    }
                )
                break
            }
        }

        /** Build a process tree for the given parent PID
         * @param {number} parentPid Parent PID to process
         * @param {object} tree Object to hold the tree
         * @param {object} pidsToProcess Object to hold the list of PIDs to process
         * @param {Function} spawnChildProcessesList Function to spawn child processes
         * @param {Function} cb Callback function
         */
        function buildProcessTree(parentPid, tree, pidsToProcess, spawnChildProcessesList, cb) {
            const ps = spawnChildProcessesList(parentPid)
            let allData = ''
            ps.stdout.on('data', function (data) {
                allData += data.toString('ascii')
            })

            const onClose = function (code) {
                delete pidsToProcess[parentPid]

                if (code != 0) {
                    // no more parent processes
                    if (Object.keys(pidsToProcess).length == 0) {
                        cb()
                    }
                    return
                }

                allData.match(/\d+/g).forEach(function (spid) {
                    // ts-ignore
                    rootPid = parseInt(spid, 10)
                    tree[parentPid].push(rootPid)
                    tree[rootPid] = []
                    pidsToProcess[rootPid] = 1
                    buildProcessTree(rootPid, tree, pidsToProcess, spawnChildProcessesList, cb)
                })
            }

            ps.on('close', onClose)
        }

        /** Kill a complete process tree (for MacOS and Linux)
         * @param {object} tree tree of pids to process
         * @param {string} signal Signal to send
         * @param {Function} [callback] Optional callback fn
         * @returns {void|Function} Nothing unless a callback is provided
         * @throws {Error} If an error occurs during the kill process
         */
        function killAll(tree, signal, callback) {
            const killed = {}
            try {
                Object.keys(tree).forEach(function (pid) {
                    tree[pid].forEach(function (pidpid) {
                        if (!killed[pidpid]) {
                            killPid(pidpid, signal)
                            killed[pidpid] = 1
                        }
                    })
                    if (!killed[pid]) {
                        // @ts-ignore
                        killPid(pid, signal)
                        killed[pid] = 1
                    }
                })
            } catch (err) {
                if (callback) {
                    return callback(err)
                }
                throw err
            }
            if (callback) {
                return callback()
            }
        }

        /** Kill a single pid using process.kill
         * @param {number} pid OS pid
         * @param {string} signal Signal to send
         */
        function killPid(pid, signal) {
            try {
                process.kill(pid, signal)
            } catch (err) {
                if (err.code !== 'ESRCH') throw err
            }
        }
    },

    /** Generates a secure and URL-friendly unique ID.
     * Based on https://github.com/luavixen/foxid
     * @param {number} [length] - Length of the generated ID, defaults to 21.
     * @returns {string} Newly generated ID as a string.
     */
    nanoId(length) {
        length = Math.max(length | 0, 0) || 21
        const size = (length * 5 + 7) >>> 3

        const buffer = Buffer.allocUnsafeSlow(size)

        randomFillSync(buffer, 0, size)

        return encodeNanoId(buffer, length, size)
    },

    /** Run an OS command asynchronously, with streaming and process control support.
     * Uses the default OS Shell unless overridden - returns a promise
     * @param {string} cmd The OS command to run
     * @param {Array<string>} args Array of argument strings to be passed to the command
     * @param {object} opts Options for child_process.spawn and uiblib features. Takes standard spawn opts + the following:
     *   @param {(chunk: string) => void} [opts.stream] Optional. Callback for streaming output chunks
     *   @param {(shell: import('node:child_process').ChildProcessWithoutNullStreams) => void} [opts.childProcess] Optional. Callback to receive the spawned child process for process control (e.g. killing the process)
     *   @param {string} [opts.out] Optional. Set to 'bare' to return just the output string
     *   @param {boolean} [opts.verbose] Optional. Whether to include verbose output formatting
     *   @param {object|string} [opts.env] Optional. Whether to include environment variables object for the command, if a string, will use process.env
     * @returns {Promise<{all:string, code:number, command:string, pid?: number}>} Promise with kill method for process control
     *
     * @example
     * // Kill a long-running process
     * const proc = runOsCmd('ping', ['localhost'], { stream: chunk => console.log(chunk) })
     * setTimeout(() => proc.kill(), 5000) // kill after 5 seconds
     * @example
     * // Stream output example
     * runOsCmd('ping', ['localhost'], { stream: chunk => console.log(chunk) })
     */
    runOsCmd: function runOsCmd(cmd, args, opts) {
        if (!opts) opts = {}

        // Extract custom properties from opts
        const stream = opts.stream
        const childProcess = opts.childProcess
        const out = opts.out
        const verbose = opts.verbose

        // Create spawn options by copying opts and removing custom properties
        // const spawnOpts = { shell: true, windowsHide: true, ...opts, }
        const spawnOpts = { windowsHide: true, ...opts, }
        delete spawnOpts.stream
        delete spawnOpts.childProcess
        delete spawnOpts.out
        delete spawnOpts.verbose
        // @ts-ignore Remove shell option, we handle it explicitly
        // delete spawnOpts.shell

        // @ts-ignore Ensure stdio is set to 'pipe' so shell.stdout and shell.stderr are streams
        spawnOpts.stdio = 'pipe'
        // @ts-ignore Ensure spawnOpts.env is an object if provided
        if (spawnOpts.env && typeof spawnOpts.env === 'string') {
            // @ts-ignore
            spawnOpts.env = process.env
        }
        // @ts-ignore Avoid DEP0190 by not using shell: true
        spawnOpts.shell = false

        const cmdOut = `${cmd} ${args.join(' ')}`

        // Determine the shell and its argument for running a command string
        const isWindows = process.platform === 'win32'
        const shellCmd = isWindows ? process.env.ComSpec || 'cmd.exe' : '/bin/sh'
        const shellArg = isWindows ? '/c' : '-c'

        let shellRef
        const promise = new Promise((resolve, reject) => {
            // @ts-ignore Run the command. NB: shell contains shell.pid
            // const shell = spawn(cmd, args, spawnOpts)
            // This avoids DEP0190 by not using shell: true
            const shell = spawn(shellCmd, [shellArg, cmdOut], spawnOpts)
            shellRef = shell
            // If opts.childProcess is a function, provide the child process reference to it
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
        /** Attach a kill method to the promise for long-running processes
         * @type {Promise<{all:string, code:number, command:string, pid?: number}>}
         */
        const typedPromise = promise
        // @ts-ignore
        typedPromise.pid = shellRef.pid
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
        if (!opts) opts = { windowsHide: true, }
        // opts.stdio = 'pipe' // force this option

        // @ts-ignore Avoid DEP0190 by not using shell: true
        opts.shell = false

        const cmdOut = `${cmd} ${args.join(' ')}`

        // Determine the shell and its argument for running a command string
        const isWindows = process.platform === 'win32'
        const shellCmd = isWindows ? process.env.ComSpec || 'cmd.exe' : '/bin/sh'
        const shellArg = isWindows ? '/c' : '-c'

        /** @type {object} */
        const out = spawnSync(shellCmd, [shellArg, cmdOut], opts)

        if (opts.out === 'bare') {
            return out.stdout.toString()
        }
        out.command = cmdOut
        return out
    },

    /** Simple fn to set a node status in the admin interface
     * fill: red, green, yellow, blue or grey
     * shape: ring, dot
     * @param {object} node _
     */
    setNodeStatus: function( node ) {
        node.status(node.statusDisplay)
    }, // ---- End of setNodeStatus ---- //

    /** Escape an array of strings for safe use in a shell command
     * Based on https://github.com/nodejs/help/issues/5063#issuecomment-3211961369
     * @param {Array<string>} args Array of strings to escape
     * @returns {string} The escaped string
     */
    shellescape: function shellescape(args) {
        const isWindows = process.platform === 'win32'
        const escaped = args.map((arg) => {
            if (isWindows) {
                // Windows: use double quotes, escape internal double quotes
                if (/[^A-Za-z0-9_/:=-]/.test(arg)) {
                    return `"${arg.replace(/"/g, '\\"')}"`
                }
                return arg
            }
            // Unix: use single quotes, escape internal single quotes
            if (/[^A-Za-z0-9_/:=-]/.test(arg)) {
                let result = `'${arg.replace(/'/g, "'\\''")}'`
                result = result
                    .replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
                    .replace(/\\'''/g, "\\'") // remove non-escaped single-quote if there are enclosed between 2 escaped
                return result
            }
            return arg
        })

        return escaped.join(' ')
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

    // #region ----- Telemetry functions ----- //

    /** Send anonymous telemetry data to the uibuilder Cloudflare analytics endpoint.
     * Only sends when telemetry is enabled and the configured interval has elapsed since the last successful send.
     * On success, records the Unix send timestamp as `lastSent` in the telemetry file.
     * All errors are caught and logged; the function never rejects.
     * NOTE: Uses the native `fetch` global (requires Node.js ≥ 18; experimental in v18, stable in v21+).
     * @returns {Promise<null|number>} Returns the Unix timestamp of the send if successful, or null if telemetry is disabled, uuid is missing, interval has not elapsed, or an error occurred.
     * @throws {Error} If an error occurs during the fetch, an error is thrown with a message describing the issue. Network errors are expected and logged as trace, not warn.
     */
    sendTelemetry: async function sendTelemetry() {
        const log = uib.RED.log

        if ( uib.telemetryEnabled !== true ) return null
        if ( !uib.telemetry?.uuid ) return null

        // Only send if the configured interval has elapsed since the last successful send
        const lastSent = uib.telemetry?.lastSent // Unix timestamp in seconds, or undefined
        const nowS = Math.floor(Date.now() / 1000)
        if ( lastSent && (nowS - lastSent) < uib.telemetrySendInterval ) return null

        log.info(`🌐[uiblib:sendTelemetry] Going to send Telemetry (uuid=${uib.telemetry.uuid})`)

        const payload = uib.telemetry

        try {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins -- fetch is experimental in Node.js v18 but available; stable from v21+
            const res = await fetch(uib.telemetryEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(payload),
            })
            if ( res.ok ) {
                log.info(`🌐[uiblib:sendTelemetry] Telemetry sent successfully (uuid=${uib.telemetry.uuid})`)
                // Return the time of send so we don't send again for 30 days.
                return nowS
            }
            throw new Error(`Telemetry endpoint returned ${res.status} ${res.statusText}`)
        } catch (err) {
            // Network errors are expected (e.g. air-gapped installs). Log as trace, not warn.
            throw new Error(`Could not reach telemetry endpoint: ${err.message}`, { cause: err, })
        }
    },

    /** Write the current `uibGlobalConfig.telemetry` value to `<uibRoot>/.config/telemetry.json`.
     * If `data` is provided its properties are merged into `uibGlobalConfig.telemetry` before saving.
     * Per uuid:
     * {
     *   uuid:          string,   // Instance UUID (required)
     *   uib_version:   string,   // uibuilder package version
     *   nr_version:    string,   // Node-RED version
     *   node_version:  string,   // Node.js version
     *   os_platform:   string,   // e.g. "linux", "win32", "darwin"
     *   uib_count:     number,   // Count of uibuilder nodes deployed
     *   markweb_count: number,   // Count of markweb nodes deployed
     *   browsers: [              // Pre-aggregated browser stats (NOT raw UA strings)
     *     { family: string, version: string, count: number }
     *   ]
     * }
     * @returns {Promise<void>}
     * @throws {Error} If there is an error stringifying the telemetry data or writing the file, an error is thrown with a message describing the issue.
     */
    fileTelemetry: async function fileTelemetry() {
        let json = '{}\n' // eslint-disable-line no-useless-assignment

        try {
            json = JSON.stringify(uib.telemetry, null, 2) + '\n'
        } catch (err) {
            throw new Error(`Invalid telemetry data. ${err.message} [UibFs:fileTelemetry]`, { cause: err, })
        }

        // Write the telemetry object to the telemetry file (will create the file if needed but not the folder)
        const telemetryFile = path.join(uib.configFolder, uib.telemetryFilename)
        try {
            await fslib.writeFile(telemetryFile, json, 'utf8')
        } catch (err) {
            throw new Error(`Could not write telemetry file '${telemetryFile}'. ${err.message} [UibFs:fileTelemetry]`, { cause: err, })
        }
    },

    /** Update UIBUILDER Telemetry data
     * Loaded from and saved to `<uibRoot>/.config/telemetry.json` via UibFs.
     * {
     *   uuid:          string,   // Instance UUID (required)
     *   uib_version:   string,   // uibuilder package version
     *   nr_version:    string,   // Node-RED version
     *   node_version:  string,   // Node.js version
     *   os_platform:   string,   // e.g. "linux", "win32", "darwin"
     *   uib_count:     number,   // Count of uibuilder nodes deployed
     *   markweb_count: number,   // Count of markweb nodes deployed
     *   browsers: [              // Pre-aggregated browser stats (NOT raw UA strings)
     *     { family: string, version: string, count: number }
     *   ]
     * }
     * @param {object} data Optional telemetry data to merge
     */
    updateTelemetryData: async function updateTelemetryData(data) {
        const log = uib.RED.log
        const tel = uib.telemetry

        // if data provided, merge it into the current telemetry object
        if ( data !== undefined && data !== null && typeof data === 'object' ) {
            uib.telemetry = { ...tel, ...data, }
        }

        tel.uib_version = uib.me.version
        tel.nr_version = uib.RED.settings.version
        tel.node_version = process.version
        tel.os_platform = process.platform
        tel.uib_count = Object.keys(uib.instances).length
        tel.markweb_count = Object.keys(uib.mwinstances).length

        let result = null
        // If telemetry is disabled (in settings.js), ensure that there is no uuid
        if ( uib.telemetryEnabled === false ) {
            delete tel.uuid
        } else {
            // Otherwise make sure that the uuid exists
            if ( !tel.uuid ) tel.uuid = randomUUID()
            // And see if it needs sending
            try {
                result = await this.sendTelemetry()
            } catch (err) {
                log.error(`🌐[uiblib:sendTelemetry] Error sending telemetry (uuid=${tel.uuid}): ${err.message}`, { cause: err, })
            }
        }

        if ( result !== null ) { // Send was successful and we have a timestamp to record
            // Record the time of the successful send so we don't send again for 30 days.
            uib.telemetry.lastSent = result
            // Clear down the browser stats as these will be re-populated over time and we don't want to send old data on the next send.
            uib.telemetry.browsers = []
        }

        // This will write the file (and create if needed)
        // Do this regardless of result in case something else changed
        try {
            await this.fileTelemetry()
        } catch (err) {
            log.error(`🌐[uiblib:fileTelemetry] Error writing telemetry file: ${err.message}`, { cause: err, })
        }
    },

    /** Read the telemetry config file on startup (`<uibRoot>/.config/telemetry.json`), with content from
     * global context telemetry if it does not already exist. Parsed contents are merged into `uibGlobalConfig.telemetry`.
     * @returns {Promise<void>} If successful, uib.telemetry will have been updated with the parsed contents
     *    of the telemetry file. Otherwise throws an error.
     */
    parseTelemetryFile: async function parseTelemetryFile() {
        const log = uib.RED.log
        const telemetryFile = path.join(uib.configFolder, uib.telemetryFilename)

        // Try to read the telemetry file (if !exists, the call to updateTelemetryData() will create it anyway)
        if ( fslib.existsSync(telemetryFile) ) {
            let parsed
            try {
                const raw = await fslib.readFile(telemetryFile, 'utf8')
                parsed = JSON.parse(raw)
            } catch (err) {
                throw new Error(`Could not read or parse telemetry file '${telemetryFile}'. ${err.message} [uiblib:parseTelemetryFile]`, { cause: err, })
            }
            uib.telemetry = parsed
        }

        // Update telemetry data with current versions, counts, etc. & if data provided, merge it into global telemetry object.
        // This will eventually write (and create if needed) the file.
        try {
            await this.updateTelemetryData()
        } catch (err) {
            log.error(`🌐[uiblib:updateTelemetryData] Error updating telemetry data: ${err.message}`, { cause: err, })
        }
    },

    /** Parse browser family/version from Client Hints headers when available.
     * @param {string|undefined} secChUa Value of `sec-ch-ua` header
     * @param {boolean} isMobile Whether `sec-ch-ua-mobile` indicates a mobile client
     * @returns {{family:string, version:string}|null} Parsed browser details or null
     */
    parseBrowserFromClientHints: function parseBrowserFromClientHints(secChUa, isMobile) {
        if ( !secChUa || typeof secChUa !== 'string' ) return null

        /** @type {Array<{brand:string, version:string}>} */
        const brands = []
        const re = /"([^"]+)";v="([^"]+)"/g
        let match
        while ( (match = re.exec(secChUa)) !== null ) {
            if (match[1] && match[2]) {
                brands.push({ brand: match[1], version: match[2], })
            }
        }
        if (brands.length === 0) return null

        // Matches 'Chromium' or variations of 'Not A Brand' (e.g., 'Not_A Brand', 'Not.A/Brand') case-insensitively
        const ignoreRegex = /chromium|not[-.__ \/;)]?a[-.__ \/;)]?brand/i
        const pick = brands.find(b => !ignoreRegex.test(b.brand)) || brands[0]

        let family
        switch (pick.brand) {
            case 'Firefox': // FF does not currently support Client Hints
                family = 'Firefox'
                break
            case 'Safari': // Safari does not currently support Client Hints
                family = 'Safari'
                break
            case 'Opera':
                family = 'Opera'
                break
            case 'Samsung Internet':
                family = 'Samsung Internet'
                break

            case 'Brave':
                family = 'Brave'
                break
            case 'Vivaldi': // currently reports as Chrome
                family = 'Vivaldi'
                break
            case 'Microsoft Edge':
                family = 'Edge'
                break
            case 'Google Chrome':
            case 'Chromium':
                family = 'Chrome'
                break

            default:
                family = pick.brand ?? 'Other'
        }

        if (isMobile && family !== 'Samsung Internet') family = `${family} Mobile`

        return {
            family: family,
            version: String(pick.version)
                .split('.')
                .slice(0, 2)
                .join('.'),
        }
    },

    /** Parse a User-Agent string into a browser family/version tuple.
     * This is intentionally lightweight to avoid another runtime dependency.
     * @param {string|undefined} userAgent Browser user-agent header value
     * @param {boolean} [mobileHint] Value from Client Hints mobile indicator (`sec-ch-ua-mobile`)
     * @returns {{family:string, version:string}|null} Parsed browser details or null if unavailable
     */
    parseBrowserFromUserAgent: function parseBrowserFromUserAgent(userAgent, mobileHint = false) {
        if ( !userAgent || typeof userAgent !== 'string' ) return null

        const isMobile = mobileHint || /Mobile|Android|iP(?:hone|od|ad)|Windows Phone/i.test(userAgent)

        /** @type {Array<{family:string, regex:RegExp}>} */
        const browsers = [
            { family: 'Edge', regex: /(?:EdgiOS|EdgA|Edg)\/([\d.]+)/, },
            { family: 'Opera', regex: /(?:OPR|OPiOS)\/([\d.]+)/, },
            { family: 'Vivaldi', regex: /Vivaldi\/([\d.]+)/, },
            { family: 'Brave', regex: /Brave\/([\d.]+)/, },
            { family: 'Samsung Internet', regex: /SamsungBrowser\/([\d.]+)/, },
            { family: 'Chrome', regex: /(?:Chrome|CriOS)\/([\d.]+)/, },
            { family: 'Firefox', regex: /(?:Firefox|FxiOS)\/([\d.]+)/, },
            { family: 'Safari', regex: /Version\/([\d.]+).*Safari\//, },
            { family: 'Internet Explorer', regex: /(?:MSIE\s|Trident\/.*rv:)([\d.]+)/, },
        ]

        for (const browser of browsers) {
            const match = browser.regex.exec(userAgent)
            if ( match && match[1] ) {
                const family = browser.family === 'Samsung Internet'
                    ? browser.family
                    : isMobile ? `${browser.family} Mobile` : browser.family

                return {
                    family: family,
                    // Keep version granularity small to reduce cardinality in telemetry storage.
                    version: String(match[1])
                        .split('.')
                        .slice(0, 2)
                        .join('.'),
                }
            }
        }

        return { family: isMobile ? 'Other Mobile' : 'Other', version: '0', }
    },

    /** Convert a request header value to a single string.
     * @param {string|string[]|undefined} value Header value from Node.js request headers
     * @returns {string|undefined} First string value if available
     */
    getHeaderString: function getHeaderString(value) {
        if (Array.isArray(value)) return value[0]
        if (typeof value === 'string') return value
        return undefined
    },

    /** Parse browser details from request headers, preferring Client Hints where available.
     * NOTE: Client hints only available in secure contexts and not from all browsers
     * @param {import('http').IncomingHttpHeaders|undefined} headers Request headers
     * @returns {{family:string, version:string}|null} Parsed browser details or null
     */
    parseBrowserFromHeaders: function parseBrowserFromHeaders(headers) {
        const secChUa = this.getHeaderString(headers?.['sec-ch-ua'])
        const secChUaMobile = this.getHeaderString(headers?.['sec-ch-ua-mobile'])
        // const secChUaPlatform = this.getHeaderString(headers?.['sec-ch-ua-platform'])
        const userAgent = this.getHeaderString(headers?.['user-agent'])

        const isMobileHint = secChUaMobile === '?1'

        const hinted = this.parseBrowserFromClientHints(secChUa, isMobileHint)
        if (hinted) return hinted

        return this.parseBrowserFromUserAgent(userAgent, isMobileHint)
    },

    /** Debounced save of telemetry data to avoid writing on every single connection.
     * @returns {void}
     */
    queueTelemetrySave: function queueTelemetrySave() {
        if ( this.telemetrySaveTimer ) clearTimeout(this.telemetrySaveTimer)

        this.telemetrySaveTimer = setTimeout(async() => {
            try {
                await this.fileTelemetry()
            } catch (err) {
                if (uib.RED?.log) {
                    uib.RED.log.trace(`🌐[uibuilder:socket:queueTelemetrySave] Telemetry save skipped/failed. ${err.message}`)
                }
            }
        }, 5000)
    },

    /** Aggregate browser telemetry from the current socket connection.
     * @param {import('http').IncomingHttpHeaders|undefined} headers Request headers
     */
    updateBrowserTelemetry: function updateBrowserTelemetry(headers) {
        const parsed = this.parseBrowserFromHeaders(headers)
        if (!parsed) return

        if ( !uib.telemetry || typeof uib.telemetry !== 'object' ) uib.telemetry = {}
        if ( !Array.isArray(uib.telemetry.browsers) ) uib.telemetry.browsers = []

        const existing = uib.telemetry.browsers.find(b => b.family === parsed.family && b.version === parsed.version)
        if (existing) {
            existing.count = (Number(existing.count) || 0) + 1
        } else {
            uib.telemetry.browsers.push({ family: parsed.family, version: parsed.version, count: 1, })
        }

        // Optional cap/prune rule (disabled for now): keep only top-N browser tuples by count.
        // const MAX_BROWSER_TUPLES = 50
        // if (uib.telemetry.browsers.length > MAX_BROWSER_TUPLES) {
        //     uib.telemetry.browsers.sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
        //     uib.telemetry.browsers = uib.telemetry.browsers.slice(0, MAX_BROWSER_TUPLES)
        // }

        // Debounced save
        this.queueTelemetrySave()
    },
    // #endregion ----- Telemetry functions ----- //

} // ---- End of module.exports ---- //

module.exports = UibLib
