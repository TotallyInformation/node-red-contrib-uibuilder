/** This is the Front-End JavaScript for uibuilder  in HTML Module form
 * It provides a number of global objects that can be used in your own javascript.
 * see the docs folder `./docs/uibuilder.module.md` for details of how to use this fully.
 *
 * Please use the default index.js file for your own code and leave this as-is.
 * See Uib._meta for client version string
 */
/*
  Copyright (c) 2022-2023 Julian Knight (Totally Information)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

//#region --- Type Defs --- //
/**
 * A string containing HTML markup
 * @typedef {string} html
 */
//#endregion --- Type Defs --- //

//#region --- We need the Socket.IO client - check in decreasing order of likelihood --- //
import io from 'socket.io-client' // Note: Only works when using esbuild to bundle

// TODO - Maybe - check if already loaded as window['io']?
// TODO - Maybe - Should this be moved to inside the class - would know the httpRoot then so less need to guess?
// TODO           Or, could pull the cookie processing out of the class
// const ioLocns = [ // Likely locations of the Socket.IO client library
//     // Where it should normally be
//     '../uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     // Where it might be if using a custom uib Express server and haven't changed httpNodeRoot
//     '/uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     // Where it might be if using a custom uib Express server and have changed httpNodeRoot
//     '../../../../../uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     '../../../../uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     '../../../uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     '../../uibuilder/vendor/socket.io-client/socket.io.esm.min.js',
//     // Direct from the Internet - last ditch attempt
//     'https://cdn.jsdelivr.net/npm/socket.io-client/+esm',
// ]

// let io
// for (const locn of ioLocns) {
//     try {
//         ({ io } = await import(locn))
//         log('trace', 'uibuilder.module.js:io', `Socket.IO client library found at '${locn}'`)()
//     } catch (e) {
//         log('trace', 'uibuilder.module.js:io', `Socket.IO client library not found at '${locn}'`)()
//     }
//     if (io) break
// }
// if (!io) log('error', 'uibuilder.module.js', 'Socket.IO client failed to load')()
//#endregion -------- -------- -------- //

const version = '6.1.1-mod'

// TODO Add option to allow log events to be sent back to Node-RED as uib ctrl msgs
//#region --- Module-level utility functions --- //

// @ts-ignore Detect whether the loaded library is minified or not
const isMinified = !(/param/).test(function (param) { }) // eslint-disable-line no-unused-vars

//#region --- print/console - debugging output functions --- //

/** Default log level - Error & Warn */
let logLevel = isMinified ? 0 : 1  // When using minified lib, assume production and only log errors otherwise also log warn
// function changeLogLevel(level) {
//     logLevel = level
//     console.trace = logLevel < 4 ? function(){} : console.trace
//     console.debug = logLevel < 2 ? function(){} : console.debug
//     if ( logLevel < 1 ) {
//         console.log = console.group = console.groupEnd =  function(){}
//     }
// }

// Experimental
const LOG_STYLES = {
    // 0
    error: {
        css: 'background: red; color: black;',
        txtCss: 'color: red; ',
        pre: '⛔ ',
        console: 'error',  // or trace
    },
    // 1
    warn: {
        css: 'background: darkorange; color: black;',
        txtCss: 'color: darkorange; ',
        pre: '⚠ ',
        console: 'warn',
    },
    // 2
    info: {
        css: 'background: aqua; color: black;',
        txtCss: 'color: aqua;',
        pre: '❗ ',
        console: 'info',
    },
    // 3
    log: {
        css: 'background: grey; color: yellow;',
        txtCss: 'color: grey;',
        pre: '',
        console: 'log',
    },
    // 4
    debug: {
        css: 'background: chartreuse; color: black;',
        txtCss: 'color: chartreuse;',
        pre: '',
        console: 'debug',
    },
    // 5
    trace: {
        css: 'background: indigo; color: yellow;',
        txtCss: 'color: hotpink;',
        pre: '',
        console: 'log',
    },

    names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
    reset: 'color: inherit;',
    head: 'font-weight:bold; font-style:italic;',
    level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
}
/** Custom logging. e.g. log(2, 'here:there', 'jiminy', {fred:'jim'})()
 * @returns {Function} Log function @example log(2, 'here:there', 'jiminy', {fred:'jim'})()
 */
function log() {
    // Get the args
    const args = Array.prototype.slice.call(arguments)

    // 1st arg is the log level/type
    let level = args.shift()
    let strLevel
    switch (level) {
        case 'trace':
        case 5: {
            if (logLevel < 5) break
            level = 5 // make sure level is numeric
            strLevel = 'trace'
            break
        }

        case 'debug':
        case 4: {
            if (logLevel < 4) break
            level = 4
            strLevel = 'debug'
            break
        }

        case 'log':
        case 3: {
            if (logLevel < 3) break
            level = 3
            strLevel = 'log'
            break
        }

        case 'info':
        case '':
        case 2: {
            if (logLevel < 2) break
            level = 2
            strLevel = 'info'
            break
        }

        case 'warn':
        case 1: {
            if (logLevel < 1) break
            level = 1
            strLevel = 'warn'
            break
        }

        case 'error':
        case 'err':
        case 0: {
            if (logLevel < 0) break
            level = 0
            strLevel = 'error'
            break
        }

        default: {
            level = -1
            break
        }

    }

    // If set to something unknown, no log output
    if (strLevel === undefined) return function () { }

    // 2nd arg is a heading that will be colour highlighted
    const head = args.shift()

    // Bind back to console.log (could use console[strLevel] but some levels ignore some formatting, use console.xxx directly or dedicated fn)
    return Function.prototype.bind.call(
        console[LOG_STYLES[strLevel].console],
        console,
        `%c${LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`, `${LOG_STYLES.level} ${LOG_STYLES[strLevel].css}`, `${LOG_STYLES.head} ${LOG_STYLES[strLevel].txtCss}`,
        ...args
    )
}
//#endregion

/** A hack to dynamically load a remote module and wait until it is loaded
 * @param {string} url The URL of the module to load
 * @returns {object|null} Either the result object or null (if the load fails)
 */
// function loadModule(url) { // eslint-disable-line no-unused-vars
//     let done

//     import(url)
//         .then(res => {
//             log('debug', '>> then >>', res)()
//             done = res
//         })
//         .catch(err => {
//             console.error(`[uibuilder:loadModule] Could not load module ${url}`, err)
//             done = null
//         })

//     //  eslint-disable-next-line no-empty
//     while (!done) { } // eslint-disable-line no-unmodified-loop-condition

//     return done
// }

/** Makes a null or non-object into an object
 * If not null, moves "thing" to {payload:thing}
 *
 * @param {*} thing Thing to check
 * @param {string} [property='payload'] property that "thing" is moved to if not null and not an object
 * @returns {!object} _
 */
function makeMeAnObject(thing, property) {
    if (!property) property = 'payload'
    if (typeof property !== 'string') {
        log('warn', 'uibuilderfe:makeMeAnObject', `WARNING: property parameter must be a string and not: ${typeof property}`)()
        property = 'payload'
    }
    let out = {}
    if ( thing !== null && thing.constructor.name === 'Object' ) {
        out = thing
    } else if (thing !== null) {
        out[property] = thing
    }
    return out
} // --- End of make me an object --- //

/** Joins all arguments as a URL string
 * see http://stackoverflow.com/a/28592528/3016654
 * since v1.0.10, fixed potential double // issue
 * arguments {string} URL fragments
 * @returns {string} _
 */
function urlJoin() {
    const paths = Array.prototype.slice.call(arguments)
    const url = '/' + paths.map(function (e) {
        return e.replace(/^\/|\/$/g, '')
    })
        .filter(function (e) {
            return e
        })
        .join('/')
    return url.replace('//', '/')
} // ---- End of urlJoin ---- //

//#endregion --- Module-level utility functions --- //

/** Define and export the Uib class - note that an instance of the class is also exported in the wrap-up
 * @typicalname uibuilder
 */
export const Uib = class Uib {

    //#region private class vars

    // How many times has the loaded instance connected to Socket.IO (detect if not a new load?)
    connectedNum = 0
    // event listener callbacks by property name
    // #events = {}
    // Socket.IO channel names
    _ioChannels = { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder' }
    /** setInterval holder for pings @type {function|undefined} */
    #pingInterval
    // onChange event callbacks
    #propChangeCallbacks = {}
    // onTopic event callbacks
    #msgRecvdByTopicCallbacks = {}
    // Is Vue available?
    isVue = false
    // What version? Set in startup if Vue is loaded. Won't always work
    vueVersion = undefined
    /** setInterval id holder for Socket.IO checkConnect
     * @type {number|null}
     */
    #timerid = null
    // Holds the reference ID for the internal msg change event handler so that it can be cancelled
    #MsgHandler
    // Placeholder for io.socket - can't make a # var until # fns allowed in all browsers
    _socket
    // Placeholder for an observer that watches the whole DOM for changes - can't make a # var until # fns allowed in all browsers
    _htmlObserver
    // Has showMsg been turned on?
    #isShowMsg = false
    // Has showStatus been turned on?
    #isShowStatus = false
    // Externally accessible command functions (NB: Case must match)
    #extCommands = [
        'get', 'set', 'showMsg', 'showStatus'
    ]

    // What status variables to show via showStatus()
    #showStatus = {
        online: { 'var': 'online', 'label': 'Online?', 'description': 'Is the browser online?', },
        ioConnected: { 'var': 'ioConnected', 'label': 'Socket.IO connected?', 'description': 'Is Socket.IO connected?', },
        connectedNum: { 'var': 'connectedNum', 'label': '# reconnections', 'description': 'How many times has Socket.IO had to reconnect since last page load?', },

        clientId: { 'var': 'clientId', 'label': 'Client ID', 'description': 'Static client unique id set in Node-RED. Only changes when browser is restarted.', },
        tabId: { 'var': 'tabId', 'label': 'Browser tab ID', 'description': 'Static unique id for the browser\'s current tab', },
        cookies: { 'var': 'cookies', 'label': 'Cookies', 'description': 'Cookies set in Node-RED', },
        httpNodeRoot: { 'var': 'httpNodeRoot', 'label': 'httpNodeRoot', 'description': 'From Node-RED\' settings.js, affects URL\'s. May be wrong for pages in sub-folders', },
        pageName: { 'var': 'pageName', 'label': 'Page name', 'description': 'Actual name of this page', },

        ioNamespace: { 'var': 'ioNamespace', 'label': 'SIO namespace', 'description': 'Socket.IO namespace - unique to each uibuilder node instance', },
        // ioPath: { 'var': 'ioPath', 'label': 'SIO path', 'description': '', }, // no longer needed in the modern client
        socketError: { 'var': 'socketError', 'label': 'Socket error', 'description': 'If the Socket.IO connection has failed, says why', },

        msgsSent: { 'var': 'msgsSent', 'label': '# msgs sent', 'description': 'How many standard messages have been sent to Node-RED?', },
        msgsReceived: { 'var': 'msgsReceived', 'label': '# msgs received', 'description': 'How many standard messages have been received from Node-RED?', },
        msgsSentCtrl: { 'var': 'msgsSentCtrl', 'label': '# control msgs sent', 'description': 'How many control messages have been sent to Node-RED?', },
        msgsCtrlReceived: { 'var': 'msgsCtrlReceived', 'label': '# control msgs received', 'description': 'How many control messages have been received from Node-RED?', },
        originator: { 'var': 'originator', 'label': 'Node Originator', 'description': 'If the last msg from Node-RED was from a `uib-sender` node, this will be its node id so that messasges can be returned to it', },
        topic: { 'var': 'topic', 'label': 'Default topic', 'description': 'Optional default topic to be included in outgoing standard messages', },

        started: { 'var': 'started', 'label': 'Has uibuilder client started?', 'description': 'Whether `uibuilder.start()` ran successfully. This should self-run and should not need to be run manually', },
        version: { 'var': 'version', 'label': 'uibuilder client version', 'description': 'The version of the loaded uibuilder client library', },
        serverTimeOffset: { 'var': 'serverTimeOffset', 'label': 'Server time offset (Hrs)', 'description': 'The number of hours difference between the Node-red server and the client', },
    }

    //#endregion

    //#region public class vars

    // TODO Move to proper getters
    //#region ---- Externally read-only (via .get method) ---- //
    // version - moved to _meta
    /** Client ID set by uibuilder on connect */
    clientId = ''
    /** The collection of cookies provided by uibuilder */
    cookies = {}
    /** Copy of last control msg object received from sever */
    ctrlMsg = {}
    /** Is Socket.IO client connected to the server? */
    ioConnected = false
    // Is the browser tab containing this page visible or not?
    isVisible = false
    // Remember the last page (re)load/navigation type: navigate, reload, back_forward, prerender
    lastNavType = ''
    /** Last std msg received from Node-RED */
    msg = {}
    /** number of messages sent to server since page load */
    msgsSent = 0
    /** number of messages received from server since page load */
    msgsReceived = 0
    /** number of control messages sent to server since page load */
    msgsSentCtrl = 0
    /** number of control messages received from server since page load */
    msgsCtrlReceived = 0
    /** Is the client online or offline? */
    online = navigator.onLine
    /** last control msg object sent via uibuilder.send() @since v2.0.0-dev3 */
    sentCtrlMsg = {}
    /** last std msg object sent via uibuilder.send() */
    sentMsg = {}
    /** placeholder to track time offset from server, see fn socket.on(ioChannels.server ...) */
    serverTimeOffset = null
    /** placeholder for a socket error message */
    socketError = null
    // tab identifier from session storage
    tabId = ''
    // Actual name of current page (set in constructor)
    pageName = null
    //#endregion ---- ---- ---- ---- //

    // TODO Move to proper getters/setters
    //#region ---- Externally Writable (via .set method, read via .get method) ---- //
    /** Default originator node id - empty string by default
     * @type {string}
     */
    originator = ''
    /** Default topic - used by send if set and no topic provided
     * @type {(string|undefined)}
     */
    topic = undefined
    //#endregion ---- ---- ---- ---- //

    //#region ---- These are unlikely to be needed externally: ----
    autoSendReady = true
    httpNodeRoot = '' // Node-RED setting (via cookie)
    ioNamespace = ''
    ioPath = ''
    retryFactor = 1.5       // starting delay factor for subsequent reconnect attempts
    retryMs = 2000          // starting retry ms period for manual socket reconnections workaround
    storePrefix = 'uib_'    // Prefix for all uib-related localStorage
    started = false
    socketOptions = {
        path: this.ioPath,
        transports: ['polling', 'websocket'],
        auth: {
            clientVersion: version,
            clientId: this.clientId,
            pathName: window.location.pathname,
            pageName: undefined,
            tabId: undefined,
            lastNavType: undefined,
        },
        transportOptions: {
            // Can only set headers when polling
            polling: {
                extraHeaders: {
                    'x-clientid': `${Uib._meta.displayName}; ${Uib._meta.type}; ${Uib._meta.version}; ${this.clientId}`,
                }
            },
        },
    }
    //#endregion -- not external --

    //#region ------- Static metadata ------- //
    static _meta = {
        version: version,
        type: 'module',
        displayName: 'uibuilder',
    }

    get meta() { return Uib._meta }
    //#endregion ---- ---- ---- ---- //

    //#endregion --- End of variables ---

    //#region ------- Getters and Setters ------- //

    // Change logging level dynamically (affects both console. and print.)
    set logLevel(level) { logLevel = level; console.log('%c❗ info%c [logLevel]', `${LOG_STYLES.level} ${LOG_STYLES.info.css}`, `${LOG_STYLES.head} ${LOG_STYLES.info.txtCss}`, `Set to ${level} (${LOG_STYLES.names[level]})`) /* changeLogLevel(level)*/ }
    get logLevel() { return logLevel }

    // TODO Block setting of read-only vars
    /** Function to set uibuilder properties to a new value - works on any property except _* or #*
     * Also triggers any event listeners.
     * Example: this.set('msg', {topic:'uibuilder', payload:42});
     * @param {string} prop Any uibuilder property who's name does not start with a _ or #
     * @param {*} val _
     * @returns {*|undefined} Input value
     */
    set(prop, val) {
        // Check for excluded properties - we don't want people to set these
        // if (this.#excludedSet.indexOf(prop) !== -1) {
        if (prop.startsWith('_') || prop.startsWith('#')) {
            log('warn', 'Uib:set', `Cannot use set() on protected property "${prop}"`)()
            return
        }

        this[prop] = val

        log('trace', 'Uib:set', `prop set - prop: ${prop}, val: `, val)()

        // Trigger this prop's event callbacks (listeners which are set by this.onChange)
        // this.emit(prop, val)

        // trigger an event on the prop name, pass both the name and value to the event details
        this._dispatchCustomEvent('uibuilder:propertyChanged', { 'prop': prop, 'value': val })

        return val
    }

    /** Function to get the value of a uibuilder property
     * Example: uibuilder.get('msg')
     * @param {string} prop The name of the property to get as long as it does not start with a _ or #
     * @returns {*|undefined} The current value of the property
     */
    get(prop) {
        if (prop.startsWith('_') || prop.startsWith('#')) {
            log('warn', 'Uib:get', `Cannot use get() on protected property "${prop}"`)()
            return
        }
        if (prop === 'version') return Uib._meta.version
        if (prop === 'msgsCtrl') return this.msgsCtrlReceived
        if (prop === 'reconnections') return this.connectedNum
        if (this[prop] === undefined) {
            log('warn', 'Uib:get', `get() - property "${prop}" does not exist`)()
        }
        return this[prop]
    }

    /** Write to localStorage if possible. console error output if can't write
     * Also uses this.storePrefix
     * @example
     *   uibuilder.setStore('fred', 42)
     *   console.log(uibuilder.getStore('fred'))
     * @param {string} id localStorage var name to be used (prefixed with 'uib_')
     * @param {*} value value to write to localstore
     * @returns {boolean} True if succeeded else false
     */
    setStore(id, value) {
        if (typeof value === 'object') {
            try {
                value = JSON.stringify(value)
            } catch (e) {
                log('error', 'Uib:setStore', 'Cannot stringify object, not storing. ', e)()
                return false
            }
        }
        try {
            localStorage.setItem(this.storePrefix + id, value)
            return true
        } catch (e) {
            log('error', 'Uib:setStore', 'Cannot write to localStorage. ', e)()
            return false
        }
    } // --- end of setStore --- //

    /** Attempt to get and re-hydrate a key value from localStorage
     * Note that all uib storage is automatically prefixed using this.storePrefix
     * @param {*} id The key of the value to attempt to retrieve
     * @returns {*|null|undefined} The re-hydrated value of the key or null if key not found, undefined on error
     */
    getStore(id) {
        try {
            // @ts-ignore
            return JSON.parse(localStorage.getItem(this.storePrefix + id))
        } catch (e) { }
        try {
            return localStorage.getItem(this.storePrefix + id)
        } catch (e) {
            return undefined
        }
    }

    /** Remove a given id from the uib keys in localStorage
     * @param {*} id The key to remove
     */
    removeStore(id) {
        try {
            localStorage.removeItem(this.storePrefix + id)
        } catch (e) { }
    }

    //#endregion ------- -------- ------- //

    //#region ------- Our own event handling system ---------- //

    // TODO Add option to send event details back to Node-RED as uib ctrl msg
    /** Standard fn to create a custom event with details & dispatch it
     * @param {string} title The event name
     * @param {*} details Any details to pass to event output
     */
    _dispatchCustomEvent(title, details) {
        const event = new CustomEvent(title, { detail: details })
        document.dispatchEvent(event)
    }

    // See the this.#propChangeCallbacks & msgRecvdByTopicCallbacks private vars

    /** Register on-change event listeners for uibuilder tracked properties
     * Make it possible to register a function that will be run when the property changes.
     * Note that you can create listeners for non-existant properties
     * @example: uibuilder.onChange('msg', (msg) => { console.log('uibuilder.msg changed! It is now: ', msg) })
     *
     * @param {string} prop The property of uibuilder that we want to monitor
     * @param {Function} callback The function that will run when the property changes, parameter is the new value of the property after change
     * @returns {number} A reference to the callback to cancel, save and pass to uibuilder.cancelChange if you need to remove a listener
     */
    onChange(prop, callback) {
        // Note: Property does not have to exist yet

        // console.debug(`[Uib:onchange] pushing new callback (event listener) for property: ${prop}`)

        // Create a new array or add to the array of callback functions for the property in the events object
        // if (this.#events[prop]) {
        //     this.#events[prop].push(callback)
        // } else {
        //     this.#events[prop] = [callback]
        // }

        // Make sure we have an object to receive the saved callback, update the latest reference number
        if (!this.#propChangeCallbacks[prop]) this.#propChangeCallbacks[prop] = { _nextRef: 1 }
        else this.#propChangeCallbacks[prop]._nextRef++

        const nextCbRef = this.#propChangeCallbacks[prop]._nextRef

        // Register the callback function. It is saved so that we can remove the event listener if we need to
        const propChangeCallback = this.#propChangeCallbacks[prop][nextCbRef] = function propChangeCallback(e) {
            // If the prop name matches the 1st arg in the onChange fn:
            if (prop === e.detail.prop) {
                const value = e.detail.value
                // console.warn('[Uib:onChange:evt] uibuilder:propertyChanged. ', e.detail)
                // Set the callback fn's `this` and its single argument to the msg
                callback.call(value, value)
            }
        }

        document.addEventListener('uibuilder:propertyChanged', propChangeCallback)

        return nextCbRef
    } // ---- End of onChange() ---- //

    cancelChange(prop, cbRef) {
        document.removeEventListener('uibuilder:propertyChanged', this.#propChangeCallbacks[prop][cbRef])
        delete this.#propChangeCallbacks[prop][cbRef]
        // this.#propChangeCallbacks[topic]._nextRef-- // Don't bother, let the ref# increase
    }

    /** Register a change callback for a specific msg.topic
     * Similar to onChange but more convenient if needing to differentiate by msg.topic.
     * @example: let otRef = uibuilder.onTopic('mytopic', function(){ console.log('Received a msg with msg.topic=`mytopic`. msg: ', this) })
     * To cancel a change listener: uibuilder.cancelTopic('mytopic', otRef)
     *
     * @param {string} topic The msg.topic we want to listen for
     * @param {Function} callback The function that will run when an appropriate msg is received. `this` inside the callback as well as the cb's single argument is the received msg.
     * @returns {number} A reference to the callback to cancel, save and pass to uibuilder.cancelTopic if you need to remove a listener
     */
    onTopic(topic, callback) {
        // Make sure we have an object to receive the saved callback, update the latest reference number
        if (!this.#msgRecvdByTopicCallbacks[topic]) this.#msgRecvdByTopicCallbacks[topic] = { _nextRef: 1 }
        else this.#msgRecvdByTopicCallbacks[topic]._nextRef++

        const nextCbRef = this.#msgRecvdByTopicCallbacks[topic]._nextRef

        // Register the callback function. It is saved so that we can remove the event listener if we need to
        const msgRecvdEvtCallback = this.#msgRecvdByTopicCallbacks[topic][nextCbRef] = function msgRecvdEvtCallback(e) {
            const msg = e.detail
            // console.log('[Uib:onTopic:evt] uibuilder:stdMsgReceived where topic matches. ', e.detail)
            if (msg.topic === topic) {
                // Set the callback fn's `this` and its single argument to the msg
                callback.call(msg, msg)
            }
        }

        document.addEventListener('uibuilder:stdMsgReceived', msgRecvdEvtCallback)

        return nextCbRef
    }

    cancelTopic(topic, cbRef) {
        document.removeEventListener('uibuilder:stdMsgReceived', this.#msgRecvdByTopicCallbacks[topic][cbRef])
        delete this.#msgRecvdByTopicCallbacks[topic][cbRef]
        // this.#msgRecvdCallbacks[topic]._nextRef-- // Don't bother, let the ref# increase
    }

    /** Trigger event listener for a given property
     * Called when uibuilder.set is used
     *
     * @param {*} prop The property for which to run the callback functions
     * arguments: Additional arguments contain the value to pass to the event callback (e.g. newValue)
     */
    // emit(prop) {
    //     var evt = this.#events[prop]
    //     if (!evt) {
    //         return
    //     }
    //     var args = Array.prototype.slice.call(arguments, 1)
    //     for (var i = 0; i < evt.length; i++) {
    //         evt[i].apply(this, args)
    //     }
    //     log('trace', 'Uib:emit', `${evt.length} listeners run for prop ${prop} `)()
    // }

    /** Forcably removes all event listeners from the events array
     * Use if you need to re-initialise the environment
     */
    // clearEventListeners() {
    //     this.#events = []
    // } // ---- End of clearEventListeners() ---- //

    /** Clear a single property event listeners
     * @param {string} prop The property of uibuilder for which we want to clear the event listener
     */
    // clearListener(prop) {
    //     if (this.#events[prop]) delete this.#events[prop]
    // }

    //#endregion ---------- End of event handling system ---------- //

    //#region ------- General Utility Functions -------- //

    /** Check supplied msg from server for a timestamp - if received, work out & store difference to browser time
     * @param {object} receivedMsg A message object recieved from Node-RED
     * @returns {void} Updates self.serverTimeOffset if different to previous value
     */
    _checkTimestamp(receivedMsg) {
        if (Object.prototype.hasOwnProperty.call(receivedMsg, 'serverTimestamp')) {
            const serverTimestamp = new Date(receivedMsg.serverTimestamp)
            // @ts-ignore
            const offset = Math.round(((new Date()) - serverTimestamp) / 3600000) // in ms / 3.6m to get hours
            if (offset !== this.serverTimeOffset) {
                log('trace', `Uib:checkTimestamp:${this._ioChannels.server} (server)`, `Offset changed to: ${offset} from: ${this.serverTimeOffset}`)()
                this.set('serverTimeOffset', offset)
            }
        }
    }

    /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
     * @type {HTMLElement}
     */
    $ = document.querySelector.bind(document)

    /** Set the default originator. Set to '' to ignore. Used with uib-sender.
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    setOriginator(originator = '') {
        this.set('originator', originator)
    } // ---- End of setOriginator ---- //

    /** HTTP Ping/Keep-alive - makes a call back to uibuilder's ExpressJS server and receives a 204 response
     * Can be used to keep sessions alive.
     * @example
     *   uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.
     *   uibuilder.onChange('ping', function(data) {
     *      console.log('pinger', data)
     *   })
     * @param {number} ms Repeat interval in ms
     */
    setPing(ms = 0) {
        const oReq = new XMLHttpRequest()
        oReq.addEventListener('load', () => {
            const headers = (oReq.getAllResponseHeaders()).split('\r\n')
            const elapsedTime = Number(new Date()) - Number((oReq.responseURL.split('='))[1])
            this.set('ping', {
                success: !!((oReq.status === 201) || (oReq.status === 204)), // true if one of the listed codes else false
                status: oReq.status,
                headers: headers,
                url: oReq.responseURL,
                elapsedTime: elapsedTime,
            })
        })

        if (this.#pingInterval) {
            clearInterval(this.#pingInterval)
            this.#pingInterval = undefined
        }

        oReq.open('GET', `${this.httpNodeRoot}/uibuilder/ping?t=${Number(new Date())}`)
        oReq.send()

        if (ms > 0) {
            this.#pingInterval = setInterval(() => {
                oReq.open('GET', `${this.httpNodeRoot}/uibuilder/ping?t=${Number(new Date())}`)
                oReq.send()
            }, ms)
        }
    } // ---- End of ping ---- //

    log() {
        log(...arguments)()
    }

    /** Convert JSON to Syntax Highlighted HTML
     * @param {object} json A JSON/JavaScript Object
     * @returns {html} Object reformatted as highlighted HTML
     */
    syntaxHighlight(json) {
        json = JSON.stringify(json, undefined, 4)
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // eslint-disable-line newline-per-chained-call
        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) { // eslint-disable-line prefer-named-capture-group
            let cls = 'number'
            if ((/^"/).test(match)) {
                if ((/:$/).test(match)) {
                    cls = 'key'
                } else {
                    cls = 'string'
                }
            } else if ((/true|false/).test(match)) {
                cls = 'boolean'
            } else if ((/null/).test(match)) {
                cls = 'null'
            }
            return '<span class="' + cls + '">' + match + '</span>'
        })
        return json
    } // --- End of syntaxHighlight --- //

    //#endregion -------- -------- -------- //

    //#region ------- UI handlers --------- //

    /** Directly manage UI via JSON
     * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
     */
    ui(json) {
        // Simulate a msg and process
        let msg = {}
        if ( json._ui ) msg = json
        else msg._ui = json

        this._uiManager(msg)
    }

    // TODO Add multi-slot
    /** Replace or add an HTML element's slot from text or an HTML string
     * Will use DOMPurify if that library has been loaded to window.
     * param {*} ui Single entry from the msg._ui property
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlot(el, component) {
        if (!component.slot) return

        // If DOMPurify is loaded, apply it now
        if (window['DOMPurify']) component.slot = window['DOMPurify'].sanitize(component.slot)
        // Set the component content to the msg.payload or the slot property
        el.innerHTML = component.slot
    }

    /** Replace or add an HTML element's slot from a Markdown string
     * Only does something if the markdownit library has been loaded to window.
     * Will use DOMPurify if that library has been loaded to window.
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlotMarkdown(el, component) {
        if (!window['markdownit']) return
        if (!component.slotMarkdown) return

        const opts = { // eslint-disable-line object-shorthand
            html: true,
            linkify: true,
            _highlight: true,
            langPrefix: 'language-',
            highlight(str, lang) {
                if (lang && window['hljs'] && window['hljs'].getLanguage(lang)) {
                    try {
                        return `<pre class="highlight" data-language="${lang.toUpperCase()}">
                                <code class="language-${lang}">${window['hljs'].highlightAuto(str).value}</code></pre>`
                    } finally { } // eslint-disable-line no-empty
                }
                return `<pre class="highlight"><code>${md.utils.escapeHtml(str)}</code></pre>`
            },
        }
        const md = window['markdownit'](opts)
        // Convert from markdown to HTML
        component.slotMarkdown = md.render(component.slotMarkdown)
        // If DOMPurify is loaded, apply it now
        if (window['DOMPurify']) component.slotMarkdown = window['DOMPurify'].sanitize(component.slotMarkdown)
        // Set the component content to the the converted slotMarkdown property
        el.innerHTML = component.slotMarkdown
    }

    /** Attach a new remote script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the script src attribute
     */
    loadScriptSrc(url) {
        const newScript = document.createElement('script')
        newScript.src = url
        newScript.async = false
        document.head.appendChild(newScript)
    }

    /** Attach a new remote stylesheet link to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the style link href attribute
     */
    loadStyleSrc(url) {
        const newStyle = document.createElement('link')
        newStyle.href = url
        newStyle.rel = 'stylesheet'
        newStyle.type = 'text/css'

        document.head.appendChild(newStyle)
    }

    /** Attach a new text script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a script
     */
    loadScriptTxt(textFn) {
        const newScript = document.createElement('script')
        newScript.async = false
        newScript.textContent = textFn
        document.head.appendChild(newScript)
    }

    /** Attach a new text stylesheet to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a stylesheet
     */
    loadStyleTxt(textFn) {
        const newStyle = document.createElement('style')
        newStyle.textContent = textFn
        document.head.appendChild(newStyle)
    }

    // TODO - Allow notify to sit in corners rather than take over the screen
    /** Show a pop-over "toast" dialog or a modal alert
     * Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
     *       https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
     *       https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
     * @param {"notify"|"alert"} type Dialog type
     * @param {object} ui standardised ui data
     * @param {object} [msg] msg.payload/msg.topic - only used if a string. Optional.
     * @returns {void}
     */
    showDialog(type, ui, msg) {

        //#region -- Check properties --

        let content = ''
        // Main body content
        if ( msg.payload && typeof msg.payload === 'string' ) content += msg.payload
        if ( ui.content ) content += ui.content
        // Toast wont show anyway if content is empty, may as well warn user
        if ( content === '' ) {
            log(1, 'Uib:showDialog', 'Toast content is blank. Not shown.')()
            return
        }

        // Use msg.topic as title if no title provided
        if ( !ui.title && msg.topic ) ui.title = msg.topic
        if ( ui.title ) content = `<p class="toast-head">${ui.title}</p><p>${content}</p>`

        // Allow for variants - @since v6.1 - don't bother - since this now sets CSS class, not tied to bootstrap-vue
        // if ( !ui.variant || !['', 'primary', 'secondary', 'success', 'info', 'warn', 'warning', 'failure', 'error', 'danger'].includes(ui.variant)) ui.variant = ''

        // Toasts auto-hide by default after 10s but alerts do not auto-hide
        if ( ui.noAutohide ) ui.noAutoHide = ui.noAutohide
        if ( ui.noAutoHide ) ui.autohide = !ui.noAutoHide
        // If set, number of ms until toast is auto-hidden
        if ( ui.autoHideDelay ) {
            if ( !ui.autohide ) ui.autohide = true
            ui.delay = ui.autoHideDelay
        } else ui.autoHideDelay = 10000 // default = 10s
        if ( !Object.prototype.hasOwnProperty.call(ui, 'autohide') ) ui.autohide = true

        if ( type === 'alert' ) {
            ui.modal = true
            ui.autohide = false
            content = `<svg viewBox="0 0 192.146 192.146" style="width:30;background-color:transparent;"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg> ${content}`
        }

        //#endregion -- -- --

        // Create a toaster container element if not already created - or get a ref to it
        let toaster = document.getElementById('toaster')
        if ( toaster === null ) {
            toaster = document.createElement('div')
            toaster.id = 'toaster'
            toaster.title = 'Click to clear all notifcations'
            toaster.setAttribute('class', 'toaster')
            toaster.setAttribute('role', 'dialog')
            toaster.setAttribute('arial-label', 'Toast message')
            toaster.onclick = function() {
                // @ts-ignore
                toaster.remove()
            }
            document.body.insertAdjacentElement('afterbegin', toaster)
        }

        // Create a toast element. Would be nice to use <dialog> but that isn't well supported yet - come on Apple!
        const toast = document.createElement('div')
        toast.title = 'Click to clear this notifcation'
        toast.setAttribute('class', `toast ${ui.variant ? ui.variant : ''} ${type}`)
        toast.innerHTML = content
        toast.setAttribute('role', 'alertdialog')
        if ( ui.modal ) toast.setAttribute('aria-modal', ui.modal)
        toast.onclick = function(evt) {
            evt.stopPropagation()
            toast.remove()
            // @ts-ignore
            if ( toaster.childElementCount < 1 ) toaster.remove()
        }

        // TODO
        if (type === 'alert') {
            // newD.setAttribute('aria-labelledby', '')
            // newD.setAttribute('aria-describedby', '')
        }

        toaster.insertAdjacentElement(ui.appendToast === true ? 'beforeend' : 'afterbegin', toast)

        // Auto-hide
        if ( ui.autohide === true ) {
            setInterval( () => {
                toast.remove()
                // @ts-ignore
                if ( toaster.childElementCount < 1 ) toaster.remove()
            }, ui.autoHideDelay)
        }

    } // --- End of showDialog ---

    /** Load a dynamic UI from a JSON web reponse
     * @param {string} url URL that will return the ui JSON
     */
    loadui(url) {

        fetch(url)
            .then(response => {
                if (response.ok === false) {
                    // log('warn', 'Uib:loadui:then1', `Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)()
                    throw new Error(`Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)
                }

                log('trace', 'Uib:loadui:then1', `Loaded '${url}'. Status ${response.status}, ${response.statusText}`)()
                // Did we get json?
                const contentType = response.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError(`Fetch '${url}' did not return JSON, ignoring`)
                }
                // Returns parsed json to next .then
                return response.json()
            })
            .then(data => {
                if (data !== undefined) {
                    log('trace', 'Uib:loadui:then2', 'Parsed JSON successfully obtained')()
                    // Call the _uiManager
                    this._uiManager({ _ui: data })
                    return true
                }
                return false
            })
            .catch(err => {
                log('warn', 'Uib:loadui:catch', 'Error. ', err)()
            })

    } // --- end of loadui

    /** Enhance an HTML element that is being composed with ui data
     *  such as ID, attribs, event handlers, custom props, etc.
     * @param {HTMLElement} el HTML Element to enhance
     * @param {*} comp Individual uibuilder ui component spec
     */
    _uiComposeComponent(el, comp) {
        // Add attributes
        if (comp.attributes) {
            Object.keys(comp.attributes).forEach((attrib) => {
                el.setAttribute(attrib, comp.attributes[attrib])
            })
        }

        // ID if set
        if (comp.id) el.setAttribute('id', comp.id)

        // Add event handlers
        if (comp.events) {
            Object.keys(comp.events).forEach((type) => {
                // @ts-ignore  I'm forever getting this wrong!
                if (type.toLowerCase === 'onclick') type = 'click'
                // Add the event listener - hate eval but it is the only way I can get it to work
                try {
                    el.addEventListener(type, (evt) => {
                        // Use new Function to ensure that esbuild works: https://esbuild.github.io/content-types/#direct-eval
                        (new Function('evt', `${comp.events[type]}(evt)`))(evt) // eslint-disable-line no-new-func
                    })
                    // newEl.setAttribute( 'onClick', `${comp.events[type]}()` )
                } catch (err) {
                    log('error', 'Uib:_uiComposeComponent', `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)()
                }
            })
        }

        // Add custom properties to the dataset
        if (comp.properties) {
            Object.keys(comp.properties).forEach((prop) => {
                // TODO break a.b into sub properties
                el[prop] = comp.properties[prop]
            })
        }

        //#region Add Slot content to innerHTML
        if (comp.slot) {
            this.replaceSlot(el, comp)
        }
        //#endregion

        // TODO Add multi-slot capability

        //#region Add Slot Markdown content to innerHTML IF marked library is available
        if (comp.slotMarkdown) {
            this.replaceSlotMarkdown(el, comp)
        }
        //#endregion
    }

    /** Extend an HTML Element with appended elements using ui components
     * NOTE: This fn follows a strict hierarchy of added components.
     * @param {HTMLElement} parentEl The parent HTML Element we want to append to
     * @param {*} components The ui component(s) we want to add
     */
    _uiExtendEl(parentEl, components) {
        components.forEach( (compToAdd, i) => {
            let newEl

            if (compToAdd.type === 'html') {
                newEl = parentEl
                // newEl.outerHTML = compToAdd.slot
                parentEl.innerHTML = compToAdd.slot
            } else {
                newEl = document.createElement(compToAdd.type === 'html' ? 'div' : compToAdd.type)
                // Updates newEl
                this._uiComposeComponent(newEl, compToAdd)
                parentEl.appendChild(newEl)
            }

            // If nested components, go again - but don't pass payload to sub-components
            if (compToAdd.components) {
                this._uiExtendEl(newEl, compToAdd.components)
            }
        } )
    }

    // Vue dynamic inserts Don't really work ...
    // _uiAddVue(ui, isRecurse) {

    //     // must be Vue
    //     // must have only 1 root element
    //     const compToAdd = ui.components[0]
    //     const newEl = document.createElement(compToAdd.type)

    //     if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload
    //     this._uiComposeComponent(newEl, compToAdd)

    //     // If nested components, go again - but don't pass payload to sub-components
    //     if (compToAdd.components) {
    //         this._uiExtendEl(newEl, compToAdd.components)
    //     }

    //     console.log('MAGIC: ', this.magick, newEl, newEl.outerHTML)
    //     this.set('magick', newEl.outerHTML)

    //     // if (compToAdd.id) newEl.setAttribute('ref', compToAdd.id)
    //     // if (elParent.id) newEl.setAttribute('data-parent', elParent.id)
    // }

    // TODO Add check if ID already exists
    // TODO Allow single add without using components array
    /** Handle incoming msg._ui add requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     * @param {boolean} isRecurse Is this a recursive call?
     */
    _uiAdd(ui, isRecurse) {
        log('trace', 'Uib:_uiManager:add', 'Starting _uiAdd')()

        // Vue dynamic inserts Don't really work ...
        // if (this.#isVue && !isRecurse) {
        //     this._uiAddVue(ui, false)
        //     return
        // }

        ui.components.forEach((compToAdd, i) => {

            /** @type {HTMLElement} Create the new component */
            const newEl = document.createElement(compToAdd.type === 'html' ? 'div' : compToAdd.type)

            if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload

            // const parser = new DOMParser()
            // const newDoc = parser.parseFromString(compToAdd.slot, 'text/html')
            // console.log(compToAdd, newDoc.body)

            this._uiComposeComponent(newEl, compToAdd)

            /** @type {HTMLElement} Where to add the new element? */
            let elParent
            if (compToAdd.parentEl) {
                elParent = compToAdd.parentEl
            } else if (ui.parentEl) {
                elParent = ui.parentEl
            } else if (compToAdd.parent) {
                elParent = document.querySelector(compToAdd.parent)
            } else if (ui.parent) {
                elParent = document.querySelector(ui.parent)
            }
            if (!elParent) {
                log('info', 'Uib:_uiAdd', 'No parent found, adding to body')()
                elParent = document.querySelector('body')
            }

            if ( compToAdd.position && compToAdd.position === 'first') {
                // Insert new el before the first child of the parent. Ref: https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore#example_3
                elParent.insertBefore(newEl, elParent.firstChild)
            } else if ( compToAdd.position && Number.isInteger(Number(compToAdd.position)) ) {
                elParent.insertBefore(newEl, elParent.children[compToAdd.position])
            } else {
                // Append to the required parent
                elParent.appendChild(newEl)
            }

            // If nested components, go again - but don't pass payload to sub-components
            if (compToAdd.components) {
                // this._uiAdd({
                //     method: ui.method,
                //     parentEl: newEl,
                //     components: compToAdd.components,
                // }, true)
                this._uiExtendEl(newEl, compToAdd.components)
            }
        })

    } // --- end of _uiAdd ---

    // TODO Add better tests for failures (see comments)
    /** Handle incoming _ui remove requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     * @param {boolean} all Optional, default=false. If true, will remove ALL found elements, otherwise only the 1st is removed
     */
    _uiRemove(ui, all = false) {
        ui.components.forEach((compToRemove) => {
            let els
            if (all !== true) els = [document.querySelector(compToRemove)]
            else els = document.querySelectorAll(compToRemove)

            els.forEach( el => {
                try {
                    el.remove()
                } catch (err) {
                    // Could not remove. Cannot read properties of null <= no need to report this one
                    // Could not remove. Failed to execute 'querySelector' on 'Document': '##testbutton1' is not a valid selector
                    log('trace', 'Uib:_uiRemove', `Could not remove. ${err.message}`)()
                }
            })
        })
    } // --- end of _uiRemove ---

    /** Handle incoming _ui replace requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiReplace(ui) {
        log('trace', '_uiReplace', 'Starting')()

        ui.components.forEach((compToReplace, /** @type {number} */ i) => {
            log('trace', `_uiReplace:components-forEach:${i}`, 'Component to replace: ', compToReplace)()

            /** @type {HTMLElement} */
            let elToReplace

            // Either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. FIRST element matching is updated.
            if ( compToReplace.id ) {
                elToReplace = document.getElementById(compToReplace.id) // .querySelector(`#${compToReplace.id}`)
            } else if ( compToReplace.selector || compToReplace.select ) {
                elToReplace = document.querySelector(compToReplace.selector)
            } else if ( compToReplace.name ) {
                elToReplace = document.querySelector(`[name="${compToReplace.name}"]`)
            } else if ( compToReplace.type ) {
                elToReplace = document.querySelector(compToReplace.type)
            }

            log('trace', `_uiReplace:components-forEach:${i}`, 'Element to replace: ', elToReplace)()

            // Nothing was found so ADD the element instead
            if ( elToReplace === undefined || elToReplace === null ) {
                log('trace', `Uib:_uiReplace:components-forEach:${i}:noReplace`, 'Cannot find the DOM element. Adding instead.', compToReplace)()
                this._uiAdd({ components: [compToReplace] }, false)
                return
            }

            /** @type {HTMLElement} Create the new component */
            const newEl = document.createElement(compToReplace.type === 'html' ? 'div' : compToReplace.type)
            // const newEl = document.createElement(compToReplace.type)

            // Updates the newEl and maybe the ui
            this._uiComposeComponent(newEl, compToReplace)

            // Replace the current element
            elToReplace.replaceWith(newEl)

            // If nested components, go again - but don't pass payload to sub-components
            if (compToReplace.components) {
                this._uiExtendEl(newEl, compToReplace.components)
            }
        })

    } // --- end of _uiReplace ---

    // TODO Allow single add without using components array
    // TODO Allow sub-components
    // TODO Add multi-slot capability
    /** Handle incoming _ui update requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiUpdate(ui) {
        log('trace', 'Uib:_uiManager:update', 'Starting _uiUpdate')()

        // We allow an update not to actually need to spec a component
        if ( !ui.components ) ui.components = [Object.assign({}, ui)]

        ui.components.forEach((compToUpd, i) => {
            log('trace', '_uiUpdate:components-forEach', `Component #${i}`, compToUpd)()

            /** @type {NodeListOf<Element>} */
            let elToUpd

            // Either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. ALL elements matching are updated.
            if ( compToUpd.id ) {
                // NB We don't use get by id because this way the code is simpler later on
                elToUpd = document.querySelectorAll(`#${compToUpd.id}`)
            } else if ( compToUpd.selector || compToUpd.select ) {
                elToUpd = document.querySelectorAll(compToUpd.selector)
            } else if ( compToUpd.name ) {
                elToUpd = document.querySelectorAll(`[name="${compToUpd.name}"]`)
            } else if ( compToUpd.type ) {
                elToUpd = document.querySelectorAll(compToUpd.type)
            }

            // @ts-ignore Nothing was found so give up
            if ( elToUpd === undefined || elToUpd.length < 1 ) {
                log('warn', 'Uib:_uiManager:update', 'Cannot find the DOM element. Ignoring.', compToUpd)()
                return
            }

            log('trace', '_uiUpdate:components-forEach', `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)()

            // Process slot first to allow for named slots
            if (compToUpd.properties) {
                Object.keys(compToUpd.properties).forEach((prop) => {
                    elToUpd.forEach( el => {
                        el[prop] = compToUpd.properties[prop]
                    })
                })
            }

            // Add event handlers
            if (compToUpd.events) {
                Object.keys(compToUpd.events).forEach((type) => {
                    // @ts-ignore  I'm forever getting this wrong!
                    if (type.toLowerCase === 'onclick') type = 'click'
                    elToUpd.forEach( el => {
                        // Add the event listener - hate eval but it is the only way I can get it to work
                        try {
                            el.addEventListener(type, (evt) => {
                                // Use new Function to ensure that esbuild works: https://esbuild.github.io/content-types/#direct-eval
                                (new Function('evt', `${compToUpd.events[type]}(evt)`))(evt) // eslint-disable-line no-new-func
                            })
                        } catch (err) {
                            log('error', 'Uib:_uiAdd', `Add event '${type}' for element '${compToUpd.type}': Cannot add event handler. ${err.message}`)()
                        }
                    })
                })
            }

            if (compToUpd.attributes) {
                Object.keys(compToUpd.attributes).forEach((attrib) => {
                    elToUpd.forEach( el => {
                        // For values, set the actual value as well since the attrib only changes the DEFAULT value
                        // @ts-ignore
                        if (attrib === 'value') el.value = compToUpd.attributes[attrib]
                        el.setAttribute(attrib, compToUpd.attributes[attrib])
                    })
                })
            }

            if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload
            if (compToUpd.slot) {
                elToUpd.forEach( el => {
                    this.replaceSlot(el, compToUpd)
                })
            }

            if (compToUpd.slotMarkdown) {
                elToUpd.forEach( el => {
                    this.replaceSlotMarkdown(el, compToUpd)
                })
            }

            // If nested components, go again - but don't pass payload to sub-components
            if (compToUpd.components) {
                elToUpd.forEach( el => {
                    log('trace', '_uiUpdate:components', 'el', el)()
                    this._uiUpdate({
                        method: ui.method,
                        parentEl: el,
                        components: compToUpd.components,
                    })
                })
            }
            // TODO Add multi-slot capability (default slot must always be processed first as innerHTML is replaced)
            // ? Do we want to allow nested component lists?

        })

    } // --- end of _uiUpdate ---

    // TODO Add more error handling and parameter validation
    /** Handle incoming _ui load requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiLoad(ui) {

        // Self-loading ECMA Modules (e.g. web components)
        if (ui.components) {
            if (!Array.isArray(ui.components)) ui.components = [ui.components]

            ui.components.forEach(async component => {
                await import(component)
            })
        }
        // Remote Scripts
        if (ui.srcScripts) {
            if (!Array.isArray(ui.srcScripts)) ui.srcScripts = [ui.srcScripts]

            ui.srcScripts.forEach(script => {
                this.loadScriptSrc(script)
            })
        }
        // Scripts passed as text
        if (ui.txtScripts) {
            if (!Array.isArray(ui.txtScripts)) ui.txtScripts = [ui.txtScripts]

            this.loadScriptTxt(ui.txtScripts.join('\n'))
        }
        // Remote Stylesheets
        if (ui.srcStyles) {
            if (!Array.isArray(ui.srcStyles)) ui.srcStyles = [ui.srcStyles]

            ui.srcStyles.forEach(sheet => {
                this.loadStyleSrc(sheet)
            })
        }
        // Styles passed as text
        if (ui.txtStyles) {
            if (!Array.isArray(ui.txtStyles)) ui.txtStyles = [ui.txtStyles]

            this.loadStyleTxt(ui.txtStyles.join('\n'))
        }

    } // --- end of _uiLoad ---

    /** Handle a reload request */
    _uiReload() {
        log('trace', 'Uib:uiManager:reload', 'reloading')()
        location.reload()
    }

    /** Handle incoming _ui messages and loaded UI JSON files
     * Called from start()
     * @param {*} msg Standardised msg object containing a _ui property object
     */
    _uiManager(msg) {
        if (!msg._ui) return

        // Make sure that _ui is an array
        if (!Array.isArray(msg._ui)) msg._ui = [msg._ui]

        msg._ui.forEach((ui, i) => {
            if (!ui.method) {
                log('warn', 'Uib:_uiManager', `No method defined for msg._ui[${i}]. Ignoring`)()
                return
            }

            ui.payload = msg.payload
            ui.topic = msg.topic
            this._dispatchCustomEvent(
                `uibuilder:msg:_ui:${ui.method}${ui.id ? `:${ui.id}` : ''}`,
                ui
            )

            switch (ui.method) {
                case 'add': {
                    this._uiAdd(ui, false)
                    break
                }

                case 'remove': {
                    this._uiRemove(ui, false)
                    break
                }

                case 'removeAll': {
                    this._uiRemove(ui, true)
                    break
                }

                case 'replace': {
                    this._uiReplace(ui)
                    break
                }

                case 'update': {
                    this._uiUpdate(ui)
                    break
                }

                case 'load': {
                    this._uiLoad(ui)
                    break
                }

                case 'reload': {
                    this._uiReload()
                    break
                }

                case 'notify': {
                    this.showDialog('notify', ui, msg)
                    break
                }

                case 'alert': {
                    this.showDialog('alert', ui, msg)
                    break
                }

                default: {
                    log('error', 'Uib:_uiManager', `Invalid msg._ui[${i}].method (${ui.method}). Ignoring`)()
                    break
                }
            }
        })

    } // --- end of _uiManager ---

    /** Show/hide a display card on the end of the visible HTML that will dynamically display the last incoming msg from Node-RED
     * The card has the id `uib_last_msg`. Updates are done from a listener set up in the start function.
     * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
     * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
     */
    showMsg(showHide, parent = 'body') {
        if ( showHide === undefined ) showHide = !this.#isShowMsg
        this.#isShowMsg = showHide
        let slot = 'Waiting for a message from Node-RED'

        if (this.msg && Object.keys(this.msg).length > 0) {
            slot = this.syntaxHighlight(this.msg)
        }

        if ( showHide === false ) {
            this._uiRemove( {
                components: [
                    '#uib_last_msg',
                ],
            })
        } else {
            this._uiReplace({
                components: [
                    {
                        type: 'pre',
                        id: 'uib_last_msg',
                        parent: parent,
                        attributes: {
                            title: 'Last message from Node-RED',
                            class: 'syntax-highlight',
                        },
                        slot: slot,
                    }
                ]
            })
        }
    }

    /** Show/hide a display card on the end of the visible HTML that will dynamically display the current status of the uibuilder client
     * The card has the id `uib_status`.
     * The display is updated by an event listener created in the class constructor.
     * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
     * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
     */
    showStatus(showHide, parent = 'body') {
        if ( showHide === undefined ) showHide = !this.#isShowStatus
        this.#isShowStatus = showHide

        if ( showHide === false ) {
            this._uiRemove( {
                components: [
                    '#uib_status',
                ],
            })
            return
        }

        const root = {
            components: [
                {
                    type: 'div',
                    id: 'uib_status',
                    parent: parent,
                    attributes: {
                        title: 'Current status of the uibuilder client',
                        class: 'text-smaller',
                    },
                    components: [
                        {
                            'type': 'table',
                            'components': [
                                {
                                    'type': 'tbody',
                                    'components': []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
        const details = root.components[0].components[0].components[0].components

        Object.values(this.#showStatus).forEach( entry => {
            details.push({
                'type': 'tr',
                'attributes': {
                    title: entry.description,
                },
                'components': [
                    {
                        'type': 'th',
                        'slot': entry.label,
                    },
                    {
                        'type': 'td',
                        'attributes': {
                            'data-varType': entry.var,
                        },
                        'slot': entry.var === 'version' ? Uib._meta.version : JSON.stringify(this[entry.var]),
                    }
                ],
            })
        })

        this._uiReplace(root)
    }

    /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
     * @param {string} cssSelector Identify the DOM element to get data from
     * @param {string} [propName] Optional. Specific name of property to get from the element
     * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
     */
    uiGet(cssSelector, propName = null) {
        // The type cast below not really correct but it gets rid of the other typescript errors
        const selection = /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll(cssSelector))

        const out = []

        selection.forEach( node => {
            // Specific property asked for ...
            if (propName !== null && propName !== '') {
                const prop = propName.split('.').reduce((prev, cur) => prev[cur], node)
                // Nightmare of different object types in a DOM Element!
                if (prop.constructor.name === 'NamedNodeMap') { // Attributes
                    const p = {}
                    for (const key of prop) {
                        p[key.name] = prop[key.name].value
                    }
                    out.push(p)
                } else if (!prop.constructor.name.toLowerCase().includes('map')) { // Ordinary properties
                    out.push({
                        [propName]: prop
                    })
                } else { // Other MAP types
                    const p = {}
                    for (const key in prop) {
                        p[key] = prop[key]
                    }
                    out.push(p)
                }
            } else { // Otherwise, grab everything useful
                const len = out.push({
                    id: node.id === '' ? undefined : node.id,
                    name: node.name,
                    children: node.childNodes.length,
                    type: node.nodeName,
                    attributes: undefined,

                    isUserInput: node.value === undefined ? false : true, // eslint-disable-line no-unneeded-ternary
                    userInput: node.value === undefined ? undefined : { // eslint-disable-line multiline-ternary
                        value: node.value,
                        validity: undefined,
                        willValidate: node.willValidate,
                        valueAsDate: node.valueAsDate,
                        valueAsNumber: node.valueAsNumber,
                        type: node.type,
                    },
                })
                const thisOut = out[len - 1]
                if ( node.attributes.length > 0 ) thisOut.attributes = {}
                // @ts-ignore
                for (const attrib of node.attributes) {
                    if (attrib.name !== 'id') {
                        thisOut.attributes[attrib.name] = node.attributes[attrib.name].value
                    }
                }
                if ( node.value !== undefined ) thisOut.userInput.validity = {}
                for (const v in node.validity) {
                    thisOut.userInput.validity[v] = node.validity[v]
                }
            }
        })

        return out
    } // --- end of uiGet ---

    //#endregion -------- -------- -------- //

    //#region ------- HTML cache and DOM watch --------- //

    /** Clear the saved DOM from localStorage */
    clearHtmlCache() {
        this.removeStore('htmlCache')
        log('trace', 'uibuilder.module.js:clearHtmlCache', 'HTML cache cleared')()
    }

    /** Restore the complete DOM (the whole web page) from browser localStorage if available */
    restoreHtmlFromCache() {
        // Is the html cached? If so, restore it
        const htmlCache = this.getStore('htmlCache')
        if (htmlCache) {
            const targetNode = document.getElementsByTagName('html')[0]
            // Restore the entire HTML
            targetNode.innerHTML = htmlCache
            log('trace', 'uibuilder.module.js:restoreHtmlFromCache', 'Restored HTML from cache')()
        } else {
            log('trace', 'uibuilder.module.js:restoreHtmlFromCache', 'No cache to restore')()
        }
    }

    /** Save the current DOM state to browser localStorage.
     * localStorage is persistent and so can be recovered even after a browser restart.
     */
    saveHtmlCache() {
        // Save the updated entire HTML in localStorage
        this.setStore('htmlCache', document.documentElement.innerHTML)
    }

    /** Use the Mutation Observer browser API to watch for and save changes to the HTML
     * Once the observer is created, it will be reused.
     * Sending true or undefined will turn on the observer, false turns it off.
     * saveHtmlCache is called whenever anything changes in the dom. This allows
     * users to call restoreHtmlFromCache() on page load if desired to completely reload
     * to the last saved state.
     * @param {boolean} startStop true=start watching the DOM, false=stop
     */
    watchDom(startStop) {
        // Select the node that will be observed for mutations
        const targetNode = document.documentElement

        // Need a ref to the Uib this
        const that = this

        // Create an observer instance
        if (!this._htmlObserver) {
            this._htmlObserver = new MutationObserver( function(/* mutationList, observer */) {
                // We don't need to know the details - so kill off any outstanding mutation records
                this.takeRecords()
                // Save the updated entire HTML in localStorage
                that.saveHtmlCache()
            } )
        }

        if (startStop === true || startStop === undefined) {
            // Start observing the target node for configured mutations
            this._htmlObserver.observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true })
            log('trace', 'uibuilder.module.js:watchDom', 'Started Watching and saving DOM changes')()
        } else {
            this._htmlObserver.disconnect()
            log('trace', 'uibuilder.module.js:watchDom', 'Stopped Watching and saving DOM changes')()
        }
    } // ---- End of watchDom ---- //

    //#endregion -------- -------- -------- //

    //#region ------- Message Handling (To/From Node-RED) -------- //

    /** Internal send fn. Send a standard or control msg back to Node-RED via Socket.IO
     * NR will generally expect the msg to contain a payload topic
     * @param {object} msgToSend The msg object to send.
     * @param {string} [channel=uiBuilderClient] The Socket.IO channel to use, must be in self.ioChannels or it will be ignored
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    _send(msgToSend, channel, originator = '') {
        if (channel === null || channel === undefined) channel = this._ioChannels.client

        // Make sure msgToSend is an object
        if (channel === this._ioChannels.client) {
            msgToSend = makeMeAnObject(msgToSend, 'payload')
        } else if (channel === this._ioChannels.control) {
            msgToSend = makeMeAnObject(msgToSend, 'uibuilderCtrl')
            if (!Object.prototype.hasOwnProperty.call(msgToSend, 'uibuilderCtrl')) {
                msgToSend.uibuilderCtrl = 'manual send'
            }
            // help remember where this came from as ctrl msgs can come from server or client
            msgToSend.from = 'client'
        }

        /** since 2020-01-02 Added _socketId which should be the same as the _socketId on the server */
        msgToSend._socketId = this._socket.id

        //#region ---- Update socket.io metadata ---- //
        // Session tab id
        this.socketOptions.auth.tabId = this.tabId
        // How was the page last loaded?
        this.socketOptions.auth.lastNavType = this.lastNavType
        // How many times has the client (re)connected since page load
        this.socketOptions.auth.connectedNum = this.connectedNum
        //#endregion ---- ---- ---- //

        // Track how many messages have been sent & last msg sent
        let numMsgs
        if (channel === this._ioChannels.client) {
            this.set('sentMsg', msgToSend)
            numMsgs = this.set('msgsSent', ++this.msgsSent)
        } else if (channel === this._ioChannels.control) {
            this.set('sentCtrlMsg', msgToSend)
            numMsgs = this.set('msgsSentCtrl', ++this.msgsSentCtrl)
        }

        // Add the originator metadata if required
        if (originator === '' && this.originator !== '') originator = this.originator
        if (originator !== '') Object.assign(msgToSend, { '_uib': { 'originator': originator } })

        // If the msg does not have a topic - see if we want to add one
        if ( !Object.prototype.hasOwnProperty.call(msgToSend, 'topic') ) {
            // From the default (`uibuilder.set('topic', 'some topic')`)
            if (this.topic !== undefined && this.topic !== '') msgToSend.topic = this.topic
            else {
                // Did the last inbound msg have a topic?
                if ( Object.prototype.hasOwnProperty.call(this, 'msg') && Object.prototype.hasOwnProperty.call(this.msg, 'topic') ) {
                    msgToSend.topic = this.msg.topic
                }
            }
        }

        log('debug', 'Uib:_send', ` Channel '${channel}'. Sending msg #${numMsgs}`, msgToSend)()

        this._socket.emit(channel, msgToSend)
    } // --- End of Send Msg Fn --- //

    /** Send a standard message to NR
     * @example uibuilder.send({payload:'Hello'})
     * @param {object} msg Message to send
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    send(msg, originator = '') {
        this._send(msg, this._ioChannels.client, originator)
    }

    /** Send a control msg to NR
     * @param {object} msg Message to send
     */
    sendCtrl(msg) {
        this._send(msg, this._ioChannels.control)
    }

    /** Easily send a msg back to Node-RED on a DOM event
     * @example In plain HTML/JavaScript
     *    `<button id="button1" name="button 1" data-fred="jim"></button>`
     *    $('#button1').onclick = (evt) => {
     *      uibuilder.eventSend(evt)
     *    }
     * @example
     * In VueJS: `<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>`
     * In VueJS methods: `doEvent: uibuilder.eventSend,`
     *
     * All `data-` attributes will be passed back to Node-RED,
     *    use them instead of arguments in the click function.
     *    All target._ui custom properties are also passed back to Node-RED.
     *
     * @param {MouseEvent|any} domevent DOM Event object
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    eventSend(domevent, originator = '') {
        // @ts-ignore Handle case where vue messes up `this`
        if ( this.$attrs ) {
            log('error', 'Uib:eventSend', '`this` has been usurped by VueJS. Make sure that you wrap the call in a function: `doEvent: function (event) { uibuilder.eventSend(event) },`' )()
            return
        }
        if (!domevent && !event) {
            log('warn', 'Uib:eventSend', 'Neither the domevent nor the hidden event properties are set. You probably called this function directly rather than applying to an on click event.' )()
            return
        }
        // Handle no argument, e.g. <button onClick="uibuilder.eventSend()"> - event is a hidden variable when fn used in addEventListener
        if (!domevent || !domevent.constructor) domevent = event

        // The argument must be a DOM event
        if ((!domevent.constructor.name.endsWith('Event')) || (!domevent.currentTarget)) {
            log('warn', 'Uib:eventSend', `ARGUMENT NOT A DOM EVENT - use data attributes not function arguments to pass data. Arg Type: ${domevent.constructor.name}`, domevent)()
            return
        }

        // Prevent default event action
        domevent.preventDefault()

        // The target element
        const target = domevent.currentTarget
        // const targetId = target.id !== '' ? target.id : (target.name !== '' ? target.name : target.type)

        // Get target properties - only shows custom props not element default ones
        const props = {}
        Object.keys(target).forEach( key => {
            if (key.startsWith('_')) return // Exclude private
            props[key] = target[key]
        })

        const ignoreAttribs = ['class', 'id', 'name']
        const attribs = Object.assign({},
            ...Array.from(target.attributes,
                ( { name, value } ) => {
                    if ( !ignoreAttribs.includes(name) ) {
                        return ({ [name]: value })
                    }
                    return undefined
                }
            )
        )

        // If target embedded in a form, include the form data
        const form = {}
        const frmVals = []
        if ( target.form ) {
            // console.log(target.form)
            Object.values(target.form).forEach( (frmEl, i) => {
                const id = frmEl.id !== '' ? frmEl.id : (frmEl.name !== '' ? frmEl.name : `${i}-${frmEl.type}`)
                // const attribs = Object.assign({},
                //     ...Array.from(frmEl.attributes,
                //         ( { name, value } ) => {
                //             if ( !ignoreAttribs.includes(name) ) {
                //                 return ({ [name]: value })
                //             }
                //             return undefined
                //         }
                //     )
                // )
                if (id !== '') {
                    frmVals.push( { key: id, val: frmEl.value } ) // simplified for addition to msg.payload
                    // form[id] = frmEl.value
                    form[id] = {
                        'id': frmEl.id,
                        'name': frmEl.name,
                        'value': frmEl.value,
                        'data': frmEl.dataset,
                        // 'meta': {
                        //     'defaultValue': frmEl.defaultValue,
                        //     'defaultChecked': frmEl.defaultChecked,
                        //     'disabled': frmEl.disabled,
                        //     'valid': frmEl.willValidate,
                        //     'attributes': attribs,
                        // },
                    }
                }
            })
        }

        // Set up the msg to send - NB: Topic may be added by this._send
        const msg = {
            // Each `data-xxxx` attribute is added as a property
            // - this may be an empty Object if no data attributes defined
            payload: { ...target.dataset },

            _ui: {
                type: 'eventSend',
                id: target.id !== '' ? target.id : undefined,
                name: target.name !== '' ? target.name : undefined,
                slotText: target.textContent !== '' ? target.textContent.substring(0, 255) : undefined,

                form: form,
                props: props,
                attribs: attribs,
                classes: Array.from(target.classList),

                event: domevent.type,
                altKey: domevent.altKey,
                ctrlKey: domevent.ctrlKey,
                shiftKey: domevent.shiftKey,
                metaKey: domevent.metaKey,

                pointerType: domevent.pointerType,
                nodeName: target.nodeName,

                clientId: this.clientId,
                pageName: this.pageName,
                tabId: this.tabId,
            }
        }

        if (frmVals.length > 0) {
            frmVals.forEach( entry => {
                msg.payload[entry.key] = entry.val
            })
        }

        if (domevent.type === 'change') msg._ui.newValue = msg.payload.value = domevent.target.value

        log('trace', 'Uib:eventSend', 'Sending msg to Node-RED', msg)()
        if (target.dataset.length === 0) log('warn', 'Uib:eventSend', 'No payload in msg. data-* attributes should be used.')()

        this._send(msg, this._ioChannels.client, originator)
    }

    // Handle received messages - Process some msgs internally, emit specific events on document that make it easy for coders to use
    _msgRcvdEvents(msg) {

        // Message received
        this._dispatchCustomEvent('uibuilder:stdMsgReceived', msg)

        // Topic
        if ( msg.topic ) this._dispatchCustomEvent(`uibuilder:msg:topic:${msg.topic}`, msg)

        // Handle msg._uib special requests
        if (msg._uib) {
            /** Process a client reload request from Node-RED - as the page is reloaded, everything else is ignored
             * Note that msg._ui.reload is also actioned via the _ui processing below */
            if (msg._uib.reload === true) {
                log('trace', 'Uib:_msgRcvdEvents:_uib:reload', 'reloading')()
                location.reload()
                return
            }

            /** Process msg._uib.command messages - allows Node-RED to run uibuilder FE functions */
            if (msg._uib.command) {
                const cmd = msg._uib.command
                // Disallowed command request outputs error and ignores the msg (NB: Case must match)
                if (!this.#extCommands.includes(cmd.trim())) {
                    log('error', 'Uib:_msgRcvdEvents:_uib', `Command '${cmd} is not allowed to be called externally`)()
                    return
                }
                const prop = msg._uib.prop
                const value = msg._uib.value

                // console.log('CMD FROM NODE-RED: ', cmd, ', Prop: ', prop, ', Sent Val: ', value)
                switch (msg._uib.command) {
                    case 'get': {
                        msg._uib.response = this.get(prop)
                        this.send(msg)
                        break
                    }

                    case 'set': {
                        msg._uib.response = this.set(prop, value)
                        this.send(msg)
                        break
                    }

                    case 'showMsg': {
                        this.showMsg(value, prop)
                        break
                    }

                    case 'showStatus': {
                        this.showStatus(value, prop)
                        break
                    }

                    default: {
                        log('warning', 'Uib:_msgRcvdEvents:command', `Command '${cmd} not yet implemented`)()
                        // msg._uib.response = this[cmd]()
                        // this.send(msg)
                        break
                    }
                }
                return
            }

            // Better to request via msg._ui - these are for backwards compatibility
            if ( msg._uib.componentRef === 'globalNotification' ) {
                this.showDialog('notify', msg._uib.options, msg)
            }
            if ( msg._uib.componentRef === 'globalAlert' ) {
                this.showDialog('alert', msg._uib.options, msg)
            }
        }

        // Handle msg._ui requests
        if ( msg._ui ) {
            log('trace', 'Uib:_msgRcvdEvents:_ui', 'Calling _uiManager')()
            this._dispatchCustomEvent('uibuilder:msg:_ui', msg)
            this._uiManager(msg)
        }

    } // --- end of _msgRcvdEvents ---

    /** Callback handler for messages from Node-RED
     * NOTE: `this` is the class here rather the `socket` as would be normal since we bind the correct `this` in the call.
     *       Use this._socket if needing reference to the socket.
     * @callback ioSetupFromServer Called from ioSetup/this._socket.on(this.#ioChannels.server, this.stdMsgFromServer.bind(this))
     * @param {object} receivedMsg The msg object from Node-RED
     * @this Uib
     */
    _stdMsgFromServer(receivedMsg) {

        // Make sure that msg is an object & not null
        receivedMsg = makeMeAnObject(receivedMsg, 'payload')

        // @since 2018-10-07 v1.0.9: Work out local time offset from server
        this._checkTimestamp(receivedMsg)

        // Save the msg for further processing
        this.set('msg', receivedMsg)

        // Track how many messages have been received
        this.set('msgsReceived', ++this.msgsReceived)

        // Emit specific document events on msg receipt that make it easy for coders to use
        this._msgRcvdEvents(receivedMsg)

        log('info', 'Uib:ioSetup:stdMsgFromServer', `Channel '${this._ioChannels.server}'. Received msg #${this.msgsReceived}.`, receivedMsg)()

        // ! NOTE: Don't try to handle specialist messages here. See _msgRcvdEvents.

    } // -- End of websocket receive DATA msg from Node-RED -- //

    /** Handles original control msgs (not to be confused with "new" msg._uib controls)
     * @param {*} receivedCtrlMsg The msg received on the socket.io control channel
     */
    _ctrlMsgFromServer(receivedCtrlMsg) {

        // Make sure that msg is an object & not null
        if (receivedCtrlMsg === null) {
            receivedCtrlMsg = {}
        } else if (typeof receivedCtrlMsg !== 'object') {
            const msg = {}
            msg['uibuilderCtrl:' + this._ioChannels.control] = receivedCtrlMsg
            receivedCtrlMsg = msg
        }

        // @since 2018-10-07 v1.0.9: Work out local time offset from server
        this._checkTimestamp(receivedCtrlMsg)

        this.set('ctrlMsg', receivedCtrlMsg)
        this.set('msgsCtrlReceived', ++this.msgsCtrlReceived)

        log('trace', 'Uib:ioSetup:_ctrlMsgFromServer', `Channel '${this._ioChannels.control}'. Received control msg #${this.msgsCtrlReceived}`, receivedCtrlMsg)()

        /** Process control msg types */
        switch (receivedCtrlMsg.uibuilderCtrl) {
            // Node-RED is shutting down
            case 'shutdown': {
                log('info', `Uib:ioSetup:${this._ioChannels.control}`, '❌ Received "shutdown" from server')()
                this.set('serverShutdown', undefined)
                break
            }

            /** We are connected to the server - 1st msg from server */
            case 'client connect': {
                log('trace', `Uib:ioSetup:${this._ioChannels.control}`, 'Received "client connect" from server')()
                log('info', `Uib:ioSetup:${this._ioChannels.control}`, `✅ Server connected. Version: ${receivedCtrlMsg.version}\nServer time: ${receivedCtrlMsg.serverTimestamp}, Sever time offset: ${this.serverTimeOffset} hours`)()

                if ( !Uib._meta.version.startsWith(receivedCtrlMsg.version.split('-')[0]) ) {
                    log('warn', `Uib:ioSetup:${this._ioChannels.control}`, `Server version (${receivedCtrlMsg.version}) not the same as the client version (${Uib._meta.version})`)()
                }

                if (this.autoSendReady === true) { // eslint-disable-line no-lonely-if
                    log('trace', `Uib:ioSetup:${this._ioChannels.control}/client connect`, 'Auto-sending ready-for-content/replay msg to server')
                    // @since 0.4.8c Add cacheControl property for use with node-red-contrib-infocache
                    // @since 6.1.0 Don't bother, we use the "client connect" msg
                    // this._send({
                    //     'uibuilderCtrl': 'ready for content',
                    //     'cacheControl': 'REPLAY',
                    // }, this._ioChannels.control)
                }

                break
            }

            default: {
                log('trace', `uibuilderfe:ioSetup:${this._ioChannels.control}`, `Received ${receivedCtrlMsg.uibuilderCtrl} from server`)
                // Anything else to do for other control msgs?
            }

        } // ---- End of process control msg types ---- //

    } // -- End of websocket receive CONTROL msg from Node-RED -- //

    /** Send log text to uibuilder's beacon endpoint (works even if socket.io not connected)
     * @param {string} txtToSend Text string to send
     * @param {string|undefined} logLevel Log level to use. If not supplied, will default to debug
     */
    beaconLog(txtToSend, logLevel) {
        if (!logLevel) logLevel = 'debug'
        navigator.sendBeacon('./_clientLog', `${logLevel}::${txtToSend}`)
    }

    /** Send log info back to Node-RED over uibuilder's websocket control output (Port #2)
     * -@param {...*} arguments All arguments passed to the function are added to the msg.payload
     */
    logToServer() {
        this.sendCtrl({
            uibuilderCtrl: 'client log message',
            payload: arguments,
            // "version":"6.1.0-iife.min",
            _socketId: this._socket.id,
            // "ip":"::1",
            clientId: this.clientId,
            tabId: this.tabId,
            // "url":"esp-test",
            pageName: this.pageName,
            connections: this.connectedNum,
            lastNavType: this.lastNavType,
        })
    }

    //#endregion -------- ------------ -------- //

    //#region ------- Socket.IO -------- //

    /** Return the Socket.IO namespace
     * The cookie method is the most reliable but this falls back to trying to work it
     * out from the URL if cookies not available. That won't work if page is in a sub-folder.
     * since 2017-10-21 Improve method to cope with more complex paths - thanks to Steve Rickus @shrickus
     * since 2017-11-10 v1.0.1 Check cookie first then url. cookie works even if the path is more complex (e.g. sub-folder)
     * since 2020-01-25 Removed httpRoot from namespace to prevent proxy induced errors
     * @returns {string} Socket.IO namespace
     */
    _getIOnamespace() {

        let ioNamespace

        /** Try getting the namespace cookie. */
        ioNamespace = this.cookies['uibuilder-namespace']

        // if it wasn't available, try using the current url path
        if (ioNamespace === undefined || ioNamespace === '') {
            // split url path & eliminate any blank elements, and trailing or double slashes
            const u = window.location.pathname.split('/')
                .filter(function (t) { return t.trim() !== '' })

            /** since v2.0.5 Extra check for 0 length, Issue #73. since 2017-11-06 If the last element of the path is an .html file name, remove it */
            if (u.length > 0 && (u[u.length - 1].endsWith('.html'))) u.pop()

            // Get the last part of the url path, this MUST match the namespace in uibuilder
            ioNamespace = u.pop()

            log('trace', 'uibuilder.module.js:getIOnamespace', `Socket.IO namespace found via url path: ${ioNamespace}`)()
        } else {
            log('trace', 'uibuilder.module.js:getIOnamespace', `Socket.IO namespace found via cookie: ${ioNamespace}`)()
        }

        // Namespace HAS to start with a /
        ioNamespace = '/' + ioNamespace

        log('trace', 'uibuilder.module.js:getIOnamespace', `Final Socket.IO namespace: ${ioNamespace}`)()

        return ioNamespace
    } // --- End of set IO namespace --- //

    /** Function used to check whether Socket.IO is connected to the server, reconnect if not (recursive)
     * @param {number} [delay] Initial delay before checking (ms). Default=2000ms
     * @param {number} [factor] Multiplication factor for subsequent checks (delay*factor). Default=1.5
     * @param {number} [depth] Recursion depth
     * @returns {boolean|undefined} Whether or not Socket.IO is connected to uibuilder in Node-RED
     */
    _checkConnect(delay, factor, depth = 1) {
        if ( navigator.onLine === false ) return // Don't bother if we know we are offline

        if (!delay) delay = this.retryMs
        if (!factor) factor = this.retryFactor

        log('trace', 'Uib:checkConnect', `Checking connection. Connected: ${this._socket.connected}. Timer: ${this.#timerid}. Depth: ${depth}. Delay: ${delay}. Factor: ${factor}`, this._socket)()

        // If we are connected ...
        if (this._socket.connected === true) {
            // Clear the setTimeout
            if (this.#timerid) {
                window.clearTimeout(this.#timerid)
                this.#timerid = null
            }
            this.set('ioConnected', true)
            this.set('socketError', null)
            return true
        }

        // ... we aren't connected so:
        this.set('ioConnected', false)

        // we only want one running at a time
        if (this.#timerid) window.clearTimeout(this.#timerid)

        // Create the new timer
        this.#timerid = window.setTimeout(() => {
            log('warn', 'Uib:checkConnect:setTimeout', `Socket.IO reconnection attempt. Current delay: ${delay}. Depth: ${depth}`)()

            // this is necessary sometimes when the socket fails to connect on startup
            this._socket.close()

            // Try to reconnect
            this._socket.connect()

            // don't need to check whether we have connected as the timer will have been cleared if we have
            this.#timerid = null

            // @ts-ignore Create new timer for next time round with extended delay
            this._checkConnect(delay * factor, factor, depth++)
        }, delay)

        return false
    } // --- End of checkConnect Fn--- //

    // See message handling section for msg receipt handlers

    /** Setup Socket.io
     * since v2.0.0-beta2 Moved to a function and called by the user (uibuilder.start()) so that namespace & path can be passed manually if needed
     * @returns {boolean} Attaches socket.io manager to self._socket and updates self.ioNamespace & self.ioPath as needed
     */
    _ioSetup() {

        // Just a notification, actual load is done outside the class (see start of file)
        if (io === undefined) {
            log('error', 'Uib:ioSetup', 'Socket.IO client not loaded, Node-RED comms will not work')()
            return false
        }

        // If socket is already set up, close it and remove all of the listeners
        if (this._socket) {
            log('trace', 'Uib:ioSetup', 'Removing listeners in preparation for redoing Socket.IO connections')()
            if (this.#timerid) {
                window.clearTimeout(this.#timerid)
                this.#timerid = null
            }
            this._socket.close()
            this._socket.offAny()
            this._socket = undefined
            this.set('ioConnected', false)
        }

        // Update the URL path to make sure we have the right one
        this.socketOptions.path = this.ioPath

        //#region --- custom meta-data ---
        // Add the pageName
        this.socketOptions.auth.pageName = this.pageName
        // Add stable client id (static unless browser closed)
        this.socketOptions.auth.clientId = this.clientId
        this.socketOptions.transportOptions.polling.extraHeaders['x-clientid'] = `${Uib._meta.displayName}; ${Uib._meta.type}; ${Uib._meta.version}; ${this.clientId}`
        // Session tab id
        this.socketOptions.auth.tabId = this.tabId
        // How was the page last loaded?
        this.socketOptions.auth.lastNavType = this.lastNavType
        // How many times has the client (re)connected since page load
        this.socketOptions.auth.connectedNum = this.connectedNum
        //#endregion --- ---- ---

        // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
        log('trace', 'Uib:ioSetup', `About to create IO object. Transports: [${this.socketOptions.transports.join(', ')}]`)()
        this._socket = io(this.ioNamespace, this.socketOptions)

        /** When the socket is connected - set ioConnected flag and reset connect timer  */
        this._socket.on('connect', () => {

            this.set('connectedNum', this.connectedNum++)
            // How many times has the client (re)connected since page load
            this.socketOptions.auth.connectedNum = this.connectedNum
            // How was the page last loaded?
            this.socketOptions.auth.lastNavType = this.lastNavType
            // Session tab id
            this.socketOptions.auth.tabId = this.tabId
            this.socketOptions.auth.more = this.tabId

            log('info', 'Uib:ioSetup', `✅ SOCKET CONNECTED. Connection count: ${this.connectedNum}\nNamespace: ${this.ioNamespace}`)()
            this._dispatchCustomEvent('uibuilder:socket:connected', this.connectedNum)

            this._checkConnect() // resets any reconnection timers & sets connected flag

        }) // --- End of socket connection processing ---

        // RECEIVE a STANDARD, non-control msg from Node-RED server
        this._socket.on(this._ioChannels.server, this._stdMsgFromServer.bind(this))

        // RECEIVE a CONTROL msg from Node-RED server - see also sendCtrl()
        this._socket.on(this._ioChannels.control, this._ctrlMsgFromServer.bind(this))

        // When the socket is disconnected ..............
        this._socket.on('disconnect', (reason) => {
            // reason === 'io server disconnect' - redeploy of Node instance
            // reason === 'transport close' - Node-RED terminating
            // reason === 'ping timeout' - didn't receive a pong response?
            log('info', 'Uib:ioSetup:socket-disconnect', `⛔ Socket Disconnected. Reason: ${reason}`)()

            this._dispatchCustomEvent('uibuilder:socket:disconnected', reason)

            /** A workaround for SIO's failure to reconnect after a disconnection */
            this._checkConnect()
        }) // --- End of socket disconnect processing ---

        // Socket.io connection error - probably the wrong ioPath - or client is offline
        this._socket.on('connect_error', (err) => {
            if ( navigator.onLine === false ) return // Don't bother with an error if we know we are offline
            log('error', 'Uib:ioSetup:connect_error', `❌ Socket.IO Connect Error. Reason: ${err.message}`, err)()
            this.set('ioConnected', false)
            this.set('socketError', err)
            this._dispatchCustomEvent('uibuilder:socket:disconnected', err)
        }) // --- End of socket connect error processing ---

        // Socket.io error - from the server (socket.use middleware triggered an error response)
        this._socket.on('error', (err) => {
            log('error', 'Uib:ioSetup:error', `❌ Socket.IO Error. Reason: ${err.message}`, err)()
            this.set('ioConnected', false)
            this.set('socketError', err)
            this._dispatchCustomEvent('uibuilder:socket:disconnected', err)
        }) // --- End of socket error processing ---

        // Ensure we are connected, retry if not
        this._checkConnect()

        return true

        /* We really don't need these, just for interest
            self._socket.io.on('packet', function onPacket(data){
                // we get one of these for each REAL msg (not ping/pong)
                console.debug('PACKET', data)
            })
            self._socket.on('pong', function(latency) {
                console.debug('SOCKET PONG - Latency: ', latency)
                //console.dir(self._socket)
            }) // --- End of socket pong processing ---
            self._socket.io.on('packet', function(data){
                // We get one of these for actual messages, not ping/pong
                console.debug('PACKET', data)
            })
            self._socket.on('connect_timeout', function(timeout) {
                console.debug('SOCKET CONNECT TIMEOUT - Namespace: ' + ioNamespace + ', Timeout: ' + timeout)
            }) // --- End of socket connect timeout processing ---
            self._socket.on('reconnect', function(attemptNum) {
                console.debug('SOCKET RECONNECTED - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
            }) // --- End of socket reconnect processing ---
            self._socket.on('reconnect_attempt', function(attemptNum) {
                console.debug('SOCKET RECONNECT ATTEMPT - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
            }) // --- End of socket reconnect_attempt processing ---
            self._socket.on('reconnecting', function(attemptNum) {
                console.debug('SOCKET RECONNECTING - Namespace: ' + ioNamespace + ', Attempt #: ' + attemptNum)
            }) // --- End of socket reconnecting processing ---
            self._socket.on('reconnect_error', function(err) {
                console.debug('SOCKET RECONNECT ERROR - Namespace: ' + ioNamespace + ', Reason: ' + err.message)
                //console.dir(err)
            }) // --- End of socket reconnect_error processing ---
            self._socket.on('reconnect_failed', function() {
                console.debug('SOCKET RECONNECT FAILED - Namespace: ' + ioNamespace)
            }) // --- End of socket reconnect_failed processing ---
            self._socket.on('ping', function() {
                console.debug('SOCKET PING')
            }) // --- End of socket ping processing ---
            self._socket.on('pong', function(latency) {
                console.debug('SOCKET PONG - Latency: ', latency)
            }) // --- End of socket pong processing ---
            */
    } // ---- End of ioSetup ---- //

    //#endregion -------- ------------ -------- //

    //#region ------- Class construction & startup method -------- //

    constructor() {
        log('trace', 'Uib:constructor', 'Starting')()

        // Track whether the client is online or offline
        window.addEventListener('offline', (e) => {
            this.set('online', false)
            this.set('ioConnected', false)
            log('warn', 'Browser', 'DISCONNECTED from network')()
        })
        window.addEventListener('online', (e) => {
            this.set('online', true)
            log('warn', 'Browser', 'Reconnected to network')()
            this._checkConnect()
        })

        document.cookie.split(';').forEach((c) => {
            const splitC = c.split('=')
            this.cookies[splitC[0].trim()] = splitC[1]
        })

        /** Client ID set by uibuilder - lasts until browser profile is closed, applies to all tabs */
        this.set('clientId', this.cookies['uibuilder-client-id'])
        log('trace', 'Uib:constructor', 'Client ID: ', this.clientId)()

        /** Tab ID - lasts while the tab is open (even if reloaded)
         * WARNING: Duplicating a tab retains the same tabId
         */
        this.set('tabId', window.sessionStorage.getItem('tabId'))
        if (!this.tabId) {
            this.set('tabId', `t${Math.floor(Math.random() * 1000000)}`)
            window.sessionStorage.setItem('tabId', this.tabId)
        }

        // document.addEventListener('pagehide', (event) => {
        //     // console.log(`pagehide. From Cache?: ${event.persisted}`)
        //     navigator.sendBeacon('./_clientLog', `pagehide. From Cache?: ${event.persisted}`)
        // })
        // document.addEventListener('pageshow', (event) => {
        //     // console.log(`pageshow. From Cache?: ${event.persisted}`)
        //     navigator.sendBeacon('./_clientLog', `pageshow. From Cache?: ${event.persisted}`)
        // })
        document.addEventListener('load', () => {
            this.set('isVisible', true)
        })
        document.addEventListener('visibilitychange', () => {
            // hidden=unload, minimise. visible=un-minimise (not fired on load)
            this.set('isVisible', document.visibilityState === 'visible')
            this.sendCtrl({ uibuilderCtrl: 'visibility', isVisible: this.isVisible })
            // navigator.userActivation is experimental Chromium only
            // console.log('visibilitychange', ':', `Document Event: visibilitychange. Visibility State: ${document.visibilityState}. User Activity- Has:${navigator.userActivation.hasBeenActive}, Is:${navigator.userActivation.isActive}`)
            // navigator.sendBeacon('./_clientLog', `${(new Date()).toISOString()} Document Event: visibilitychange. Visibility State: ${document.visibilityState}. User Activity- Has:${navigator.userActivation.hasBeenActive}, Is:${navigator.userActivation.isActive}`)
        })

        // Set a listener to update showStatus table if it is active
        document.addEventListener('uibuilder:propertyChanged', (event) => {
            if (!this.#isShowStatus) return

            if (event.detail.prop in this.#showStatus) {
                document.querySelector(`td[data-vartype="${event.detail.prop}"]`).innerText = JSON.stringify(event.detail.value)
            }
        })

        this.set('ioNamespace', this._getIOnamespace())

        //#region - Try to make sure client uses Socket.IO client version from the uibuilder module (using cookie or path) @since v2.0.0 2019-02-24 allows for httpNodeRoot

        /** httpNodeRoot (to set path) */
        if ('uibuilder-webRoot' in this.cookies) {
            this.set('httpNodeRoot', this.cookies['uibuilder-webRoot'])
            log('trace', 'Uib:constructor', `httpNodeRoot set by cookie to "${this.httpNodeRoot}"`)()
        } else {
            // split current url path, eliminate any blank elements and trailing or double slashes
            const fullPath = window.location.pathname.split('/').filter(function (t) { return t.trim() !== '' })
            /** handle url includes file name - @since v2.0.5 Extra check for 0 length, Issue #73. */
            if (fullPath.length > 0 && fullPath[fullPath.length - 1].endsWith('.html')) fullPath.pop()
            fullPath.pop() // gives the last path section of the url
            this.set('httpNodeRoot', `/${fullPath.join('/')}`)
            log('trace', '[Uib:constructor]', `httpNodeRoot set by URL parsing to "${this.httpNodeRoot}". NOTE: This may fail for pages in sub-folders.`)()
        }
        this.set('ioPath', urlJoin(this.httpNodeRoot, Uib._meta.displayName, 'vendor', 'socket.io'))
        log('trace', 'Uib:constructor', `ioPath: "${this.ioPath}"`)()

        //#endregion

        // Work out pageName
        this.set('pageName', window.location.pathname.replace(`${this.ioNamespace}/`, ''))
        if ( this.pageName.endsWith('/') ) this.set('pageName', `${this.pageName}index.html`)
        if ( this.pageName === '' ) this.set('pageName', 'index.html')

        this._dispatchCustomEvent('uibuilder:constructorComplete')

        log('trace', 'Uib:constructor', 'Ending')()
    }

    /** Start up Socket.IO comms and listeners
     * This has to be done separately because if running from a web page in a sub-folder of src/dist, uibuilder cannot
     * necessarily work out the correct ioPath to use.
     * Also, if cookies aren't permitted in the browser, both ioPath and ioNamespace may need to be specified.
     * @param {object} [options] The start options object.
     * @returns {void}
     */
    start(options) {
        log('trace', 'Uib:start', 'Starting')()

        // Cancel the msg event handler if already present
        if ( this.#MsgHandler ) this.cancelChange('msg', this.#MsgHandler)

        if (this.started === true) {
            log('info', 'Uib:start', 'Start function already called. Resetting Socket.IO and msg handler.')()
        }

        log('log', 'Uib:start', 'Cookies: ', this.cookies, `\nClient ID: ${this.clientId}`)()
        log('trace', 'Uib:start', 'ioNamespace: ', this.ioNamespace, `\nioPath: ${this.ioPath}`)()

        // Handle options
        if (options) {
            if (options.ioNamespace !== undefined && options.ioNamespace !== null && options.ioNamespace !== '') this.set('ioNamespace', options.ioNamespace)
            if (options.ioPath !== undefined && options.ioPath !== null && options.ioPath !== '') this.set('ioPath', options.ioPath)
            // See below for handling of options.loadStylesheet
        }

        // Do we need to load styles?
        if ( document.styleSheets.length >= 1 || (document.styleSheets.length === 0 && document.styleSheets[0].cssRules.length === 0) ) {
            log('info', 'Uib:start', 'Styles already loaded so not loading uibuilder default styles.')()
        } else {
            if (options && options.loadStylesheet === false) log('info', 'Uib:start', 'No styles loaded & options.loadStylesheet === false.')()
            else {
                log('info', 'Uib:start', 'No styles loaded, loading uibuilder default styles.')()
                this.loadStyleSrc(`${this.httpNodeRoot}/uibuilder/uib-brand.css`)
            }
        }

        /** Handle specialist messages like reload and _ui -> Moved to _msgRcvdEvents */

        // Track last browser navigation type: navigate, reload, back_forward, prerender
        const [entry] = performance.getEntriesByType('navigation')
        // @ts-ignore
        this.set('lastNavType', entry.type)

        // Start up (or restart) Socket.IO connections and listeners. Returns false if io not found
        this.set('started', this._ioSetup())

        if ( this.started === true ) {
            log('trace', 'Uib:start', 'Start completed. Socket.IO client library loaded.')()
        } else {
            log('error', 'Uib:start', 'Start completed. ERROR: Socket.IO client library NOT LOADED.')()
        }

        // Check if Vue is present (used for dynamic UI processing)
        if (window['Vue']) {
            this.set('isVue', true)
            try {
                this.set('vueVersion', window['Vue'].version)
            } catch (e) { }
        }

        // Set up msg listener for the optional showMsg
        this.onChange('msg', (msg) => {
            if (this.#isShowMsg === true) {
                const eMsg = document.getElementById('uib_last_msg')
                if (eMsg) eMsg.innerHTML = this.syntaxHighlight(msg)
            }
        })

        this._dispatchCustomEvent('uibuilder:startComplete')
    }

    //#endregion -------- ------------ -------- //

} // ==== End of Class Uib

//#region --- Wrap up - get things started ---

// Create an instance (we will only ever want one)
const uibuilder = new Uib()

// Assign reference to the instance to the global `window` object
// Only useful if loading via <script> tag - prefer loading via `import uibuilder from ...`
if (!window['uibuilder']) {
    window['uibuilder'] = uibuilder
} else {
    log('error', 'uibuilder.module.js', 'uibuilder already assigned to window. Have you tried to load it more than once?')
}

// Assign `$` to global window object unless it is already in use.
// Note that this is also available as `uibuilder.$`.
if (!window['$']) {
    /** @type {HTMLElement} */
    window['$'] = document.querySelector.bind(document)
} else {
    log('warn', 'uibuilder.module.js', 'Cannot allocate the global `$`, it is already in use. Use `uibuilder.$` instead.')
}

// Can import as `import uibuilder from ...` OR `import {uibuilder} from ...`
export { uibuilder }
export default uibuilder

// Attempt to run start fn
uibuilder.start()

//#endregion --- Wrap up ---

// EOF
