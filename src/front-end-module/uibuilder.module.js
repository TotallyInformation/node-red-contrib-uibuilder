// @ts-nocheck
/* This is the Front-End JavaScript for uibuilder  in HTML Module form
  It provides a number of global objects that can be used in your own javascript.
  see the docs folder `./docs/uibuilder.module.md` for details of how to use this fully.

  Please use the default index.js file for your own code and leave this as-is.
  See Uib._meta for client version string

  Copyright (c) 2022-2024 Julian Knight (Totally Information)

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

// We need the Socket.IO & ui libraries & the uib-var component  --- //
// @ts-ignore - Note: Only works when using esbuild to bundle
import Ui from './ui'
import io from 'socket.io-client'
import UibVar from '../components/uib-var'
import UibMeta from '../components/uib-meta'
import ApplyTemplate from '../components/apply-template'

const version = '7.1.0-src'

// TODO Move to separate library
// TODO Add option to allow log events to be sent back to Node-RED as uib ctrl msgs
//#region --- Module-level utility functions --- //

// Detect whether the loaded library is minified or not
const isMinified = !(/param/).test(function (param) { })

//#region --- print/console - debugging output functions --- //

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
            if (log.level < 5) break
            level = 5 // make sure level is numeric
            strLevel = 'trace'
            break
        }

        case 'debug':
        case 4: {
            if (log.level < 4) break
            level = 4
            strLevel = 'debug'
            break
        }

        case 'log':
        case 3: {
            if (log.level < 3) break
            level = 3
            strLevel = 'log'
            break
        }

        case 'info':
        case '':
        case 2: {
            if (log.level < 2) break
            level = 2
            strLevel = 'info'
            break
        }

        case 'warn':
        case 1: {
            if (log.level < 1) break
            level = 1
            strLevel = 'warn'
            break
        }

        case 'error':
        case 'err':
        case 0: {
            if (log.level < 0) break
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
        console[log.LOG_STYLES[strLevel].console],
        console,
        `%c${log.LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`, `${log.LOG_STYLES.level} ${log.LOG_STYLES[strLevel].css}`, `${log.LOG_STYLES.head} ${log.LOG_STYLES[strLevel].txtCss}`,
        ...args
    )
}

// Nice console styling
log.LOG_STYLES = {
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

/** Default log level - Warn (@since v7.1.0) */
log.default = 1
let ll

// Check if the script element was found and get the data-log-level attribute (only numeric levels allowed here)
try {
    const scriptElement = document.currentScript
    ll = scriptElement.getAttribute('logLevel')
} catch (e) {}

// Otherwise check if the import url (for ESM only) has a logLevel query param
if (ll === undefined) {
    try {
        const url = new URL(import.meta.url).searchParams
        ll = url.get('logLevel')
    } catch (e) {}
}

// If either found, check numeric and set default level if so
if (ll !== undefined) {
    ll = Number(ll)
    if (isNaN(ll)) {
        console.warn( `[Uib:constructor] Cannot set logLevel to "${scriptElement.getAttribute('logLevel')}". Defaults to 0 (error).`)
        log.default = 0
    } else log.default = ll
}

// Set current level to default
log.level = log.default

// log.default = isMinified ? 0 : 1  // When using minified lib, assume production and only log errors otherwise also log warn

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

/** Convert JSON to Syntax Highlighted HTML
 * @param {object} json A JSON/JavaScript Object
 * @returns {html} Object reformatted as highlighted HTML
 */
function syntaxHighlight(json) {
    if (json === undefined) {
        json = '<span class="undefined">undefined</span>'
    } else {
        try {
            json = JSON.stringify(json, undefined, 4)
            // json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // eslint-disable-line newline-per-chained-call
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
                return `<span class="${cls}">${match}</span>`
            })
        } catch (e) {
            json = `Syntax Highlight ERROR: ${e.message}`
        }
    }
    return json
}

/** msg._ui handling functions */
const _ui = new Ui(window, log, syntaxHighlight)

//#endregion --- Module-level utility functions --- //

/** Define and export the Uib class - note that an instance of the class is also exported in the wrap-up
 * @typicalname uibuilder
 */
export const Uib = class Uib {

    //#region --- Static variables ---
    static _meta = {
        version: version,
        type: 'module',
        displayName: 'uibuilder',
    }
    //#endregion ---- ---- ---- ----

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
    // If true, URL hash changes send msg back to node-red. Controlled by watchUrlHash()
    #sendUrlHash = false
    // Used to help create unique element ID's if one hasn't been provided, increment on use
    #uniqueElID = 0
    // Externally accessible command functions (NB: Case must match) - remember to update _uibCommand for new commands
    #extCommands = [
        'elementExists', 'get', 'getManagedVarList', 'getWatchedVars', 'htmlSend', 'include',
        'navigate', 'scrollTo', 'set', 'showMsg', 'showStatus', 'uiGet', 'uiWatch', 'watchUrlHash',
    ]

    /** @type {{[key: string]: string}} Managed uibuilder variables */
    #managedVars = {}

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

    // Track ui observers (see uiWatch)
    #uiObservers = {}

    // List of uib specific attributes that will be watched and processed dynamically
    uibAttribs = ['uib-topic', 'data-uib-topic']
    #uibAttrSel = `[${this.uibAttribs.join('], [')}]`

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
    // Is the library running from a minified version?
    isMinified = isMinified
    // Is the browser tab containing this page visible or not?
    isVisible = false
    // Remember the last page (re)load/navigation type: navigate, reload, back_forward, prerender
    lastNavType = ''
    // Max msg size that can be sent over Socket.IO - updated by "client connect" msg receipt
    maxHttpBufferSize = 1048576
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
    // Is the DOMPurify library loaded? Updated in start()
    purify = false
    // Is the Markdown-IT library loaded? Updated in start()
    markdown = false
    // Current URL hash. Initial set is done from start->watchHashChanges via a set to make it watched
    urlHash = location.hash
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
    /** Either undefined or a reference to a uib router instance
     * Set by uibrouter, do not set manually.
     */
    uibrouterinstance
    /** Set by uibrouter, do not set manually */
    uibrouter_CurrentRoute
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
    // NOTE: These can only change when a client (re)connects
    socketOptions = {
        path: this.ioPath,
        // https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
        // https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API
        // https://socket.io/get-started/webtransport
        // NOTE: webtransport requires HTTP/3 and TLS. HTTP/2 & 3 not yet available in Node.js
        // transports: ['polling', 'websocket', 'webtransport'],
        transports: ['polling', 'websocket'],
        // Using callback so that they are updated automatically on (re)connect
        // Only put things in here that will be valid for a websocket connected session
        auth: (cb) => {
            cb({ // eslint-disable-line n/no-callback-literal
                clientVersion: version,
                clientId: this.clientId,
                pathName: window.location.pathname,
                urlParams: Object.fromEntries(new URLSearchParams(location.search)),
                pageName: this.pageName,
                tabId: this.tabId,
                lastNavType: this.lastNavType,
                connectedNum: ++this.connectedNum,
                // Used to calculate the diff between the server and client connection timestamps - reported if >1 minute
                browserConnectTimestamp: (new Date()).toISOString(),
            })
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

    //#endregion --- End of variables ---

    //#region ------- Getters and Setters ------- //

    // Change logging level dynamically (affects both console. and print.)
    set logLevel(level) { log.level = level; console.log('%c❗ info%c [logLevel]', `${log.LOG_STYLES.level} ${log.LOG_STYLES.info.css}`, `${log.LOG_STYLES.head} ${log.LOG_STYLES.info.txtCss}`, `Set to ${level} (${log.LOG_STYLES.names[level]})`) /* changeLogLevel(level)*/ }
    get logLevel() { return log.level }

    get meta() { return Uib._meta }

    /** Function to set uibuilder properties to a new value - works on any property except _* or #*
     * Also triggers any event listeners.
     * Example: this.set('msg', {topic:'uibuilder', payload:42});
     * @param {string} prop Any uibuilder property who's name does not start with a _ or #
     * @param {*} val The set value of the property or a string declaring that a protected property cannot be changed
     * @param {boolean} [store] If true, the variable is also saved to the browser localStorage if possible
     * @param {boolean} [autoload] If true & store is true, on load, uib will try to restore the value from the store automatically
     * @returns {*} Input value
     */
    set(prop, val, store = false, autoload = false) {
        // Check for excluded properties - we don't want people to set these
        // if (this.#excludedSet.indexOf(prop) !== -1) {
        if (prop.startsWith('_') || prop.startsWith('#')) {
            log('warn', 'Uib:set', `Cannot use set() on protected property "${prop}"`)()
            return `Cannot use set() on protected property "${prop}"`
        }

        // We must add the var to the uibuilder object
        this[prop] = val

        // Keep track of all managed variables
        this.#managedVars[prop] = prop

        // If requested, save to store
        if (store === true) this.setStore(prop, val, autoload)

        log('trace', 'Uib:set', `prop set - prop: ${prop}, val: `, val, ` store: ${store}, autoload: ${autoload}`)()

        // Trigger this prop's event callbacks (listeners which are set by this.onChange)
        // this.emit(prop, val)

        // trigger an event on the prop name, pass both the name and value to the event details
        this._dispatchCustomEvent('uibuilder:propertyChanged', { 'prop': prop, 'value': val, 'store': store, 'autoload': autoload })
        this._dispatchCustomEvent(`uibuilder:propertyChanged:${prop}`, { 'prop': prop, 'value': val, 'store': store, 'autoload': autoload })

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
            log('warn', 'Uib:get', `get() - property "${prop}" is undefined`)()
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
     * @param {boolean} [autoload] If true, on load, uib will try to restore the value from the store
     * @returns {boolean} True if succeeded else false
     */
    setStore(id, value, autoload = false) {
        let autoVars = {}
        if (autoload === true) {
            try {
                autoVars = this.getStore('_uibAutoloadVars') || {}
            } catch (e) {}
        }
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
            if (autoload) {
                autoVars[id] = id
                try {
                    localStorage.setItem(this.storePrefix + '_uibAutoloadVars', JSON.stringify(autoVars))
                } catch (e) {
                    log('error', 'Uib:setStore', 'Cannot save autoload list. ', e)()
                }
            }
            this._dispatchCustomEvent('uibuilder:propertyStored', { 'prop': id, 'value': value, 'autoload': autoload })
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

    /** Returns a list of uibuilder properties (variables) that can be watched with onChange
     * @returns {{[key: string]: string}} List of uibuilder managed variables
     */
    getManagedVarList() {
        return this.#managedVars
    }

    getWatchedVars() {
        return Object.keys(this.#propChangeCallbacks)
    }

    //#endregion ------- -------- ------- //

    //#region ------- Our own event handling system ---------- //

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

    /** Forcibly removes all event listeners from the events array
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
            const offset = Math.round(((new Date()) - serverTimestamp) / 3600000) // in ms /3.6m to get hours
            if (offset !== this.serverTimeOffset) {
                log('trace', `Uib:checkTimestamp:${this._ioChannels.server} (server)`, `Offset changed to: ${offset} from: ${this.serverTimeOffset}`)()
                this.set('serverTimeOffset', offset)
            }
        }
    }

    /** Set up an event listener to watch for hash changes
     * and set the watchable urlHash variable
     */
    _watchHashChanges() {
        this.set('urlHash', location.hash)
        window.addEventListener('hashchange', (event) => {
            this.set('urlHash', location.hash)
            if (this.#sendUrlHash === true) {
                this.send({ topic: 'hashChange', payload: location.hash, newHash: this.keepHashFromUrl(event.newURL), oldHash: this.keepHashFromUrl(event.oldURL) })
            }
        })
    }

    /** Returns a new array containing the intersection of the 2 input arrays
     * @param {Array} a1 Array to check
     * @param {Array} a2 Array to intersect
     * @returns {Array} The intersection of the 2 arrays (may be an empty array)
     */
    arrayIntersect(a1, a2) {
        return a1.filter(uName => a2.includes(uName))
    }

    /** Copies a uibuilder variable to the browser clipboard
     * @param {string} varToCopy The name of the uibuilder variable to copy to the clipboard
     */
    copyToClipboard(varToCopy) {
        let data = ''
        try {
            data = JSON.stringify(this.get(varToCopy))
        } catch (e) {
            log('error', 'copyToClipboard', `Could not copy "${varToCopy}" to clipboard.`, e.message)()
        }
        navigator.clipboard.writeText(data)
    } // --- End of copyToClipboard --- //

    /** Does the chosen CSS Selector currently exist?
     * Automatically sends a msg back to Node-RED unless turned off.
     * @param {string} cssSelector Required. CSS Selector to examine for visibility
     * @param {boolean} [msg] Optional, default=true. If true also sends a message back to Node-RED
     * @returns {boolean} True if the element exists
     */
    elementExists(cssSelector, msg = true) {
        const el = document.querySelector(cssSelector)

        let exists = false
        if (el !== null) exists = true

        if (msg === true) {
            this.send({
                payload: exists,
                info: `Element "${cssSelector}" ${exists ? 'exists' : 'does not exist'}`
            })
        }

        return exists
    } // --- End of elementExists --- //

    /** Format a number using the INTL standard library - compatible with uib-var filter function
     * @param {number} value Number to format
     * @param {number} decimalPlaces Number of decimal places to include. Default=no default
     * @param {string} intl standard locale spec, e.g. "ja-JP" or "en-GB". Default=navigator.language
     * @param {object} opts INTL library options object. Optional
     * @returns {string} formatted number
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
     */
    formatNumber(value, decimalPlaces, intl, opts) {
        if (isNaN(value)) {
            log('error', 'formatNumber', `Value must be a number. Value type: "${typeof value}"`)()
            return 'NaN'
        }
        if (!opts) opts = {}
        if (!intl) intl = navigator.language ? navigator.language : 'en-GB'
        if (decimalPlaces) {
            opts.minimumFractionDigits = decimalPlaces
            opts.maximumFractionDigits = decimalPlaces
        }
        let out
        try {
            out = Number(value).toLocaleString(intl, opts)
        } catch (e) {
            log('error', 'formatNumber', `${e.message}. value=${value}, dp=${decimalPlaces}, intl="${intl}", opts=${JSON.stringify(opts)}`)()
            return 'NaN'
        }
        return out
    }

    /** Attempt to get rough size of an object
     * @param {*} obj Any serialisable object
     * @returns {number|undefined} Rough size of object in bytes or undefined
     */
    getObjectSize(obj) {
        let size
        try {
            const jsonString = JSON.stringify(obj)
            // Encode the string to a Uint8Array and measure its length
            const encoder = new TextEncoder()
            const uint8Array = encoder.encode(jsonString)
            size = uint8Array.length
        } catch (e) {
            log('error', 'uibuilder:getObjectSize', 'Could not stringify, cannot determine size', obj, e)
        }
        return size
    }

    /** Returns true if a uibrouter instance is loaded, otherwise returns false
     * @returns {boolean} true if uibrouter instance loaded else false
     */
    hasUibRouter() {
        return !!this.uibrouterinstance
    }

    /** Only keep the URL Hash & ignoring query params
     * @param {string} url URL to extract the hash from
     * @returns {string} Just the route id
     */
    keepHashFromUrl(url) {
        if (!url) return ''
        return '#' + url.replace(/^.*#(.*)/, '$1').replace(/\?.*$/, '')
    }

    log() {
        log(...arguments)()
    }

    /** Makes a null or non-object into an object. If thing is already an object.
     * If not null, moves "thing" to {payload:thing}
     * @param {*} thing Thing to check
     * @param {string} [property='payload'] property that "thing" is moved to if not null and not an object
     * @returns {!object} _
     */
    makeMeAnObject(thing, property) {
        if (!property) property = 'payload'
        if (typeof property !== 'string') {
            log('warn', 'uibuilder:makeMeAnObject', `WARNING: property parameter must be a string and not: ${typeof property}`)()
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

    /** Navigate to a new page or a new route (hash)
     * @param {string} url URL to navigate to. Can be absolute or relative (to current page) or just a hash for a route change
     * @returns {Location} The new window.location string
     */
    navigate(url) {
        if (url) window.location.href = url
        return window.location
    }

    /** Fast but accurate number rounding (https://stackoverflow.com/a/48764436/1309986 solution 2)
     * Half away from zero method (AKA "commercial" rounding), most common type
     * @param {number} num The number to be rounded
     * @param {number} decimalPlaces Number of DP's to round to
     * @returns Rounded number
     */
    round(num, decimalPlaces) {
        const p = Math.pow(10, decimalPlaces || 0)
        const n = (num * p) * (1 + Number.EPSILON)
        return Math.round(n) / p
    }

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

    /** Convert JSON to Syntax Highlighted HTML
     * @param {object} json A JSON/JavaScript Object
     * @returns {html} Object reformatted as highlighted HTML
     */
    syntaxHighlight(json) {
        return syntaxHighlight(json)
    } // --- End of syntaxHighlight --- //

    /** Returns true/false or a default value for truthy/falsy and other values
     * @param {string|number|boolean|*} val The value to test
     * @param {any} deflt Default value to use if the value is not truthy/falsy
     * @returns {boolean|any} The truth! Or the default
     */
    truthy(val, deflt) {
        let ret
        if (['on', 'On', 'ON', 'true', 'True', 'TRUE', '1', true, 1].includes(val)) ret = true
        else if (['off', 'Off', 'OFF', 'false', 'False', 'FALSE', '0', false, 0].includes(val)) ret = false
        else ret = deflt
        return ret
    }

    /** Joins all arguments as a URL string
     * see http://stackoverflow.com/a/28592528/3016654
     * since v1.0.10, fixed potential double // issue
     * arguments {string} URL fragments
     * @returns {string} _
     */
    urlJoin() {
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

    /** Turn on/off/toggle sending URL hash changes back to Node-RED
     * @param {string|number|boolean|undefined} [toggle] Optional on/off/etc
     * @returns {boolean} True if we will send a msg to Node-RED on a hash change
     */
    watchUrlHash(toggle) {
        this.#sendUrlHash = this.truthy(toggle, this.#sendUrlHash !== true)
        return this.#sendUrlHash
    }

    /** DEPRECATED FOR NOW - wasn't working properly.
     * Is the chosen CSS Selector currently visible to the user? NB: Only finds the FIRST element of the selection.
     * Requires IntersectionObserver (available to all mainstream browsers from early 2019)
     * Automatically sends a msg back to Node-RED.
     * Requires the element to already exist.
     * @returns {false} False if not visible
     */
    elementIsVisible() {
        const info = 'elementIsVisible has been temporarily DEPRECATED as it was not working correctly and a fix is complex'
        log('error', 'uib:elementIsVisible', info)()
        this.send({ payload: 'elementIsVisible has been temporarily DEPRECATED as it was not working correctly and a fix is complex' })
        return false
    } // --- End of elementIsVisible --- //

    //#endregion -------- -------- -------- //

    //#region ------- UI handlers --------- //

    //#region -- Direct to _ui --
    // ! NOTE: Direct assignments change the target `this` to here. Use with caution
    // However, also note that the window/jsdom and the window.document
    // references are now static in _ui so not impacted by this.

    /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
     * NOTE that this fn returns the element itself. Use $$ to get the properties of 1 or more elements.
     * If the selected element is a <template>, returns the first child element.
     * type {HTMLElement}
     * @param {string} cssSelector A CSS Selector that identifies the element to return
     * @returns {HTMLElement|null} Selected HTML element or null
     */
    $ = _ui.$

    /** CSS query selector that returns ALL found selections. Matches the Chromium DevTools feature of the same name.
     * NOTE that this fn returns an array showing the PROPERTIES of the elements whereas $ returns the element itself
     * @param {string} cssSelector A CSS Selector that identifies the elements to return
     * @returns {HTMLElement[]} Array of DOM elements/nodes. Array is empty if selector is not found.
     */
    $$ = _ui.$$

    /** Reference to the full ui library */
    $ui = _ui

    /** Add 1 or several class names to an element
     * @param {string|string[]} classNames Single or array of classnames
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    addClass = _ui.addClass

    /** Apply a source template tag to a target html element
     * NOTES:
     * - styles in ALL templates are accessible to all templates.
     * - scripts in templates are run AT TIME OF APPLICATION (so may run multiple times).
     * - scripts in templates are applied in order of application, so variables may not yet exist if defined in subsequent templates
     * @param {HTMLElement} source The source element
     * @param {HTMLElement} target The target element
     * @param {boolean} onceOnly If true, the source will be adopted (the source is moved)
     */
    applyTemplate = _ui.applyTemplate

    /** Builds an HTML table from an array (or object) of objects
     * 1st row is used for columns.
     * If an object of objects, inner keys are used to populate th/td `data-col-name` attribs.
     * @param {Array<object>|Object} data Input data array or object
     * @param {object} opts Table options
     *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
     * @returns {HTMLTableElement|HTMLParagraphElement} Output HTML Element
     */
    buildHtmlTable(data, opts={}) {
        return _ui.buildHtmlTable(data, opts)
    }

    createTable(data=[], opts={parent: 'body'}) {
        _ui.createTable(data, opts)
    }

    /** Converts markdown text input to HTML if the Markdown-IT library is loaded
     * Otherwise simply returns the text
     * @param {string} mdText The input markdown string
     * @returns {string} HTML (if Markdown-IT library loaded and parse successful) or original text
     */
    convertMarkdown(mdText) {
        return _ui.convertMarkdown(mdText)
    }

    /** ASYNC: Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
     * Wraps the included object in a div tag.
     * PDF's, text or unknown MIME types are also wrapped in an iFrame.
     * @param {string} url The URL of the source file to include
     * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
     * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
     * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
     */
    async include(url, uiOptions) {
        await _ui.include(url, uiOptions)
    }

    /** Attach a new remote script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the script src attribute
     */
    loadScriptSrc(url) {
        _ui.loadScriptSrc(url)
    }

    /** Attach a new remote stylesheet link to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the style link href attribute
     */
    loadStyleSrc(url) {
        _ui.loadStyleSrc(url)
    }

    /** Attach a new text script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a script
     */
    loadScriptTxt(textFn) {
        _ui.loadScriptTxt(textFn)
    }

    /** Attach a new text stylesheet to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a stylesheet
     */
    loadStyleTxt(textFn) {
        _ui.loadStyleTxt(textFn)
    }

    /** Load a dynamic UI from a JSON web reponse
     * @param {string} url URL that will return the ui JSON
     */
    loadui(url) {
        _ui.loadui(url)
    }

    /** Remove All, 1 or more class names from an element
     * @param {undefined|null|""|string|string[]} classNames Single or array of classnames. If undefined, "" or null, remove all classes
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    removeClass = _ui.removeClass

    /** Replace or add an HTML element's slot from text or an HTML string
     * WARNING: Executes <script> tags! And will process <style> tags.
     * Will use DOMPurify if that library has been loaded to window.
     * param {*} ui Single entry from the msg._ui property
     * @param {Element} el Reference to the element that we want to update
     * @param {*} slot The slot content we are trying to add/replace (defaults to empty string)
     */
    replaceSlot(el, slot) {
        _ui.replaceSlot(el, slot)
    }

    /** Replace or add an HTML element's slot from a Markdown string
     * Only does something if the markdownit library has been loaded to window.
     * Will use DOMPurify if that library has been loaded to window.
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlotMarkdown(el, component) {
        _ui.replaceSlotMarkdown(el, component)
    }

    /** Sanitise HTML to make it safe - if the DOMPurify library is loaded
     * Otherwise just returns that HTML as-is.
     * @param {string} html The input HTML string
     * @returns {string} The sanitised HTML or the original if DOMPurify not loaded
     */
    sanitiseHTML(html) {
        return _ui.sanitiseHTML(html)
    }

    /** Add table click listener that returns the text or html content of either the full row or a single cell
     * NOTE: Assumes that the table has a `tbody` element.
     * If cells have a `data-col-name` attribute, it will be used in the output as the column name.
     * @example tblAddListener('#eltest-tbl-table', {}, myVar)
     * @example tblAddListener('#eltest-tbl-table', {eventScope: 'cell'}, myVar2)
     *
     * @param {string} tblSelector The table CSS Selector
     * @param {object} [options={}] Additional options
     *   @param {"row"|"cell"=} options.eventScope Optional, default=row. Return data for either the whole row (as an object) or for the single cell clicked
     *   @param {"text"|"html"=} options.returnType Optional, default=text. Return text or html data
     *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
     *   @param {boolean=} options.send Optional, default=true. If uibuilder is present, will automatically send a message back to Node-RED.
     *   @param {string|number=} options.logLevel Optional, default=3/info. Numeric or string log level matching uibuilder's log levels.
     *   @param {string} [options.eventType] Optional, default=click. What event to listen for.
     * @param {object=} out A variable reference that will be updated with the output data upon a click event
     */
    tblAddListener(tblSelector, options = {}, out = {}) {
        return _ui.tblAddListener(tblSelector, options, out)
    }

    /** Adds a single new row to an existing table>tbody
     * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
     * @param {object|array} rowData A single row of column/cell data
     * @param {object} [options]
     * @param {number=} options.body Optional, default=0. The tbody section to add the row to.
     * @param {boolean=} options.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
     * @param {string=} options.rowId Optional. HTML element ID for the added row
     * @param {Array<columnDefinition>} [options.colMeta] Optional. Data about each column. If not provided, will be calculated from the table
     * 
     * @returns {HTMLTableRowElement} Reference to the newly added row. Use the `rowIndex` prop for the row number
     */
    tblAddDataRow(tbl, rowData={}, options={}) {
        return _ui.tblAddDataRow(tbl, rowData, options)
    }

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
        _ui.showDialog(type, ui, msg)
    }

    /** Directly manage UI via JSON
     * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
     */
    ui(json) {
        _ui.ui(json)
    }

    /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
     * @param {string} cssSelector Identify the DOM element to get data from
     * @param {string} [propName] Optional. Specific name of property to get from the element
     * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
     */
    uiGet(cssSelector, propName = null) {
        return _ui.uiGet(cssSelector, propName)
    }

    /** Enhance an HTML element that is being composed with ui data
     *  such as ID, attribs, event handlers, custom props, etc.
     * @param {*} el HTML Element to enhance
     * @param {*} component Individual uibuilder ui component spec
     */
    uiEnhanceElement(el, component) {
        _ui.uiEnhanceElement(el, component)
    }

    //#endregion -- direct to _ui --

    /** DOM Mutation observer callback to watch for new/amended elements with uib-* or data-uib-* attributes
     * WARNING: Mutation observers can receive a LOT of mutations very rapidly. So make sure this runs as fast
     *          as possible. Async so that calling function does not need to wait.
     * Observer is set up in the start() function
     * @param {MutationRecord[]} mutations Array of Mutation Records
     */
    async _uibAttribObserver(mutations/* , observer */) {
        mutations.forEach( async m => { // async so process does not wait
            log('trace', 'uibuilder:_uibAttribObserver', 'Mutations ', m)()
            // Deal with attribute changes
            if (m.attributeName && (m.attributeName.startsWith('uib') || m.attributeName.startsWith('data-uib'))) {
                // log(0, 'attribute mutation', m.attributeName, m.target.getAttribute(m.attributeName), m.oldValue, m )()
                this._uibAttrScanOne(m.target)
            } else if (m.addedNodes.length > 0) {
                // And deal with newly added elements (e.g. from route change)
                // Check for added nodes with uib attribs
                m.addedNodes.forEach( async n => { // async so process does not wait
                    // Attributes are a map and we need an array
                    let aNames = []
                    try { // Nodes might not always have attributes
                        aNames = [...n.attributes]
                    } catch (e) {}
                    // Get any added elements that have uib attribs
                    const intersect = this.arrayIntersect(this.uibAttribs, aNames)
                    // Process them
                    intersect.forEach( async el => {
                        this._uibAttrScanOne(el)
                    })
                    // And get any children of the added elements that have uib attribs (a node might not have querySelectorAll method)
                    let uibChildren = []
                    if (n.querySelectorAll) uibChildren = n.querySelectorAll(this.#uibAttrSel)
                    // Process them
                    uibChildren.forEach( async el => {
                        this._uibAttrScanOne(el)
                    })
                })
            }
        })
    }

    /** Check a single HTML element for uib attributes and add auto-processors as needed.
     * Async so that calling function does not need to wait.
     * Understands only uib-topic at present. Msgs received on the topic can have:
     *   msg.payload - replaces innerHTML (but also runs <script>s and applies <style>s)
     *   msg.attributes - An object containing attribute names as keys with attribute values as values. e.g. {title: 'HTML tooltip', href='#route03'}
     * @param {Element} el HTML Element to check for uib-* or data-uib-* attributes
     */
    async _uibAttrScanOne(el) {
        log('trace', 'uibuilder:_uibAttrScanOne', 'Setting up auto-processor for: ', el)()
        const topic = el.getAttribute('uib-topic') || el.getAttribute('data-uib-topic')
        // Create a topic listener
        this.onTopic(topic, (msg) => {
            log('trace', 'uibuilder:_uibAttrScanOne', `Msg with topic "${topic}" received. msg content: `, msg)()
            msg._uib_processed_by = '_uibAttrScanOne' // record that this has already been processed
            // Process msg.attributes
            if (Object.prototype.hasOwnProperty.call(msg, 'attributes')) {
                try {
                    for (const [k, v] of Object.entries(msg.attributes)) {
                        el.setAttribute(k, v)
                    }
                } catch (e) {
                    log(0, 'uibuilder:attribute-processing', 'Failed to set attributes. Ensure that msg.attributes is an object containing key/value pairs with each key a valid attribute name. Note that attribute values have to be a string.')()
                }
            }

            // Process msg.value (or set checked if boolean - for checkboxes)
            // TODO Move this to a common function
            const hasChecked = Object.prototype.hasOwnProperty.call(msg, 'checked')
            const hasValue = Object.prototype.hasOwnProperty.call(msg, 'value')
            if ( hasValue || hasChecked ) {
                if (el.type && (el.type === 'checkbox' || el.type === 'radio')) {
                    if (hasChecked) el.checked = this.truthy(msg.checked, false)
                    else if (hasValue) el.checked = this.truthy(msg.value, false)
                } else {
                    if (hasValue) el.value = msg.value
                    else if (hasChecked) el.value = this.truthy(msg.checked, false)
                }
            }

            // TODO (MAYBE) Process msg.classes and msg.styles. msg.props (for non-string data)?

            // Process msg.payload (applied as slot HTML) - NB: Will process <script> & <style>
            if (Object.prototype.hasOwnProperty.call(msg, 'payload')) this.replaceSlot(el, msg.payload)
        })
    }

    /** Check all children of an array of or a single HTML element(s) for uib attributes and add auto-processors as needed.
     * Async so that calling function does not need to wait.
     * @param {Element|Element[]} parentEl HTML Element to check for uib-* or data-uib-* attributes
     */
    async _uibAttrScanAll(parentEl) {
        if (!Array.isArray(parentEl)) parentEl = [parentEl]
        parentEl.forEach( async p => { // async so process does not wait
            const uibChildren = p.querySelectorAll(this.#uibAttrSel)
            // log('trace', 'uibuilder:_uibAttrScanAll:forEach:children', 'p, uibChildren: ', p, uibChildren)()
            if (uibChildren.length > 0) {
                // console.log('existing elements uib attrib', uibChildren)
                uibChildren.forEach( el => {
                    this._uibAttrScanOne(el) // async so process does not wait
                })
            }
        })
    }

    /** Given a FileList array, send each file to Node-RED and return file metadata
     * @param {FileList} files FileList array
     * @param {boolean=} noSend If true, don't send the file to Node-RED. Default is to send.
     * @returns {Array<object>} Metadata values from all files
     */
    _processFilesInput(files, noSend = false) {
        const value = []
        for (const file of files) {
            const props = {}
            // Walk through each file property
            for (const prop in file) {
                props[prop] = file[prop]
            }
            // Create a temp URL allowing access to download the file
            // Automatically destroyed on page reload
            props.tempUrl = window.URL.createObjectURL(file)

            value.push(props)

            // Auto-upload to Node-RED over Socket.IO
            if (noSend !== true) this.uploadFile(file)
        }
        return value
    }

    /** Attempt to get target attributs - can fail for certain target types, if so, returns empty object
     * @param {HTMLElement} el Target element
     * @returns {object} Array of key/value HTML attribute objects
     */
    getElementAttributes(el) {
        const ignoreAttribs = ['class', 'id', 'name']
        let attribs
        try {
            attribs = Object.assign({},
                ...Array.from(el.attributes,
                    ( { name, value } ) => {
                        if ( !ignoreAttribs.includes(name) ) {
                            return ({ [name]: value })
                        }
                        return undefined
                    }
                )
            )
        } catch (e) {}

        return attribs
    }

    /** Check for CSS Classes and return as array if found or undefined if not
     * @param {HTMLElement} el Target element
     * @returns {Array|undefined} Array of class names
     */
    getElementClasses(el) {
        let classes
        try {
            classes = Array.from(el.classList)
        } catch (e) {}
        return classes
    }

    /** Get target custom properties - only shows custom props not element default ones
     * Excludes custom props starting with _
     * @param {HTMLElement} el Target element
     * @returns {object} Object of propname/value pairs
     */
    getElementCustomProps(el) {
        const props = {}
        Object.keys(el).forEach( key => {
            if (key.startsWith('_')) return // Exclude private
            props[key] = el[key]
        })
        return props
    }

    /** Check for el.value and el.checked. el.checked will also set the value return for ease of use.
     * Only 2 input types use el.checked, different from all other input types - this is annoying.
     * @param {HTMLElement} el HTML Element to be checked
     * @returns {{value:boolean|null, checked:boolean|null}} Return null if properties not present, else the appropriate value
     */
    getFormElementValue(el) {
        let value = null
        let checked = null

        switch (el.type) {
            case 'checkbox':
            case 'radio': {
                value = checked = el.checked
                // HTML does not normally return any value if not checked but we do for ease of use,
                break
            }

            case 'select-multiple': {
                // value = Array.from(el.selectedOptions).forEach( (sel) => sel.value )
                value = Array.from(el.selectedOptions).map(option => option.value)
                break
            }

            default: {
                if (el.value) value = el.value

                // Probably not really needed
                if (el.checked) {
                    value = checked = el.checked
                    // HTML does not normally return any value if not checked but we do for ease of use,
                }

                // If the value is a valid number, use that instead of the text version - probably only applies to range inputs
                if (el.valueAsNumber && !isNaN(el.valueAsNumber)) {
                    value = el.valueAsNumber
                }

                break
            }
        }

        return { value, checked }
    }

    // ! TODO - Handle fieldsets
    /** For HTML Form elements (e.g. input, textarea, select), return the details
     * @param {HTMLFormElement} el Source form element
     * @returns {object|null} Form element key details
     */
    getFormElementDetails(el) {
        if (!el.type) {
            log(1, 'uibuilder:getFormElementDetails', 'Cannot get form element details as this is not an input type element')()
            return null
        }

        // Get or create a (hopefully) unique ID
        const id = this.returnElementId(el)
        if (!id) {
            log(1, 'uibuilder:getFormElementDetails', 'Cannot get form element details as no id is present and could not be generated')()
            return null
        }

        let { value, checked } = this.getFormElementValue(el)

        // For multi file input, get the file details as the value
        // el.files is a FileList type & each entry is a File type - have to process these manually - stupid HTML!
        // https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
        // NOTE: The eventSend fn calls uploadFiles if files present in form.
        if (el.type === 'file' && el.files.length > 0) {
            // Walk through each file in the FileList, get the details and send the file to Node-RED
            value = this._processFilesInput(el.files)
        }

        const formDetails = {
            'id': id,
            'name': el.name,
            'valid': el.checkValidity(),
            'type': el.type,
        }
        if (value !== null) formDetails.value = value
        if (checked !== null) formDetails.checked = checked

        // If the form element has invalid content, try to report why
        if (formDetails.valid === false) {
            const v = el.validity
            formDetails.validity = {
                badInput: v.badInput === true ? v.badInput : undefined,
                customError: v.customError === true ? v.customError : undefined,
                patternMismatch: v.patternMismatch === true ? v.patternMismatch : undefined,
                rangeOverflow: v.rangeOverflow === true ? v.rangeOverflow : undefined,
                rangeUnderflow: v.rangeUnderflow === true ? v.rangeUnderflow : undefined,
                stepMismatch: v.stepMismatch === true ? v.stepMismatch : undefined,
                tooLong: v.tooLong === true ? v.tooLong : undefined,
                tooShort: v.tooShort === true ? v.tooShort : undefined,
                typeMismatch: v.typeMismatch === true ? v.typeMismatch : undefined,
                valueMissing: v.valueMissing === true ? v.valueMissing : undefined,
            }
        }

        // If any data-* attribs defined
        if (Object.keys(el.dataset).length > 0) formDetails.data = el.dataset

        return formDetails
    }

    /** Show a browser notification if possible.
     * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
     * or a Notifications API options object + config.title string.
     * @example uibuilder.notify( 'My simple message to the user' )
     * @example uibuilder.notify( {topic: 'My Title', payload: 'My simple message to the user'} )
     * @example uibuilder.notify( {title: 'My Title', body: 'My simple message to the user'} )
     * @example // If config.return = true, a promise is returned.
     * // The resolved promise is only returned if the notification is clicked by the user.
     * // Can be used to send the response back to Node-RED
     * uibuilder.notify(notifyConfig).then( res => uibuilder.eventSend(res) )
     * @ref https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
     * @param {object|string} config Notification config data or simple message string
     * @returns {Promise<Event>|null} A promise that resolves to the click event or null
     */
    notify(config) {
        if (config.return) return _ui.notification(config)

        _ui.notification(config)
            .then( res => { // eslint-disable-line promise/always-return
                log('info', 'Uib:notification', 'Notification completed event', res)()
                // if (config.return) return res
            })
            .catch( err => {
                log('error', 'Uib:notification', 'Notification error event', err)()
            })
        return null
    }

    /** Get or create a (hopefully) unique ID
     * @param {HTMLFormElement} el Source form element
     * @returns {string|null} A hopefully unique element ID
     */
    returnElementId(el) {
        return el.id !== '' ? el.id : (el.name !== '' ? `${el.name}-${++this.#uniqueElID}` : (el.type ? `${el.type}-${++this.#uniqueElID}` : `${el.localName}-${++this.#uniqueElID}`))
    }

    /** Scroll the page
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
     * @param {string} [cssSelector] Optional. If not set, scrolls to top of page.
     * @param {{block:(string|undefined),inline:(string|undefined),behavior:(string|undefined)}} [opts] Optional. DOM scrollIntoView options
     * @returns {boolean} True if element was found, false otherwise
     */
    scrollTo(cssSelector, opts) {
        // @ts-ignore
        if (!opts) opts = {}
        if (!cssSelector || cssSelector === 'top'  || cssSelector === 'start') cssSelector = 'body'
        else if (cssSelector === 'bottom' || cssSelector === 'end') {
            cssSelector = 'body'
            opts.block = 'end'
        }
        const el = this.$(cssSelector)
        if (el) {
            el.scrollIntoView(opts)
            return true
        }
        return false
    }

    /** * Show/hide a display card on the end of the visible HTML that will dynamically display the last incoming msg from Node-RED
     * The card has the id `uib_last_msg`. Updates are done from a listener set up in the start function.
     * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
     * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
     * @returns {boolean} New state
     */
    showMsg(showHide, parent = 'body') {
        if ( showHide === undefined ) showHide = !this.#isShowMsg
        this.#isShowMsg = showHide
        let slot = 'Waiting for a message from Node-RED'

        if (this.msg && Object.keys(this.msg).length > 0) {
            slot = this.syntaxHighlight(this.msg)
        }

        if ( showHide === false ) {
            _ui._uiRemove( {
                components: [
                    '#uib_last_msg_wrap',
                ],
            })
        } else {
            _ui._uiReplace({
                components: [
                    {
                        type: 'div',
                        id: 'uib_last_msg_wrap',
                        parent: parent,
                        attributes: {
                            title: 'Last message from Node-RED',
                        },
                        components: [
                            {
                                type: 'button',
                                attributes: {
                                    onclick: 'uibuilder.copyToClipboard("msg")',
                                    class: 'compact',
                                    style: 'right:3em;',
                                },
                                slot: '📋',
                            },
                            {
                                type: 'button',
                                attributes: {
                                    onclick: 'uibuilder.showMsg()',
                                    class: 'compact',
                                    style: 'right:.5em;',
                                },
                                slot: '⛔',
                            },
                            {
                                type: 'pre',
                                id: 'uib_last_msg',
                                // parent: 'uib_last_msg_wrap',
                                attributes: {
                                    class: 'syntax-highlight',
                                },
                                slot: slot,
                            },
                        ],
                    },
                ],
            })
        }

        return showHide
    }

    /** Show/hide a display card on the end of the visible HTML that will dynamically display the current status of the uibuilder client
     * The card has the id `uib_status`.
     * The display is updated by an event listener created in the class constructor.
     * @param {boolean|undefined} showHide true=show, false=hide. undefined=toggle.
     * @param {string|undefined} parent Optional. If not undefined, a CSS selector to attach the display to. Defaults to `body`
     * @returns {boolean} New state
     */
    showStatus(showHide, parent = 'body') {
        if ( showHide === undefined ) showHide = !this.#isShowStatus
        this.#isShowStatus = showHide

        if ( showHide === false ) {
            _ui._uiRemove( {
                components: [
                    '#uib_status',
                ],
            })
            return showHide
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

        _ui._uiReplace(root)

        return showHide
    }

    /** Use the Mutation Observer browser API to watch for changes to a single element on the page.
     * OMG! It is sooo hard to turn the data into something that successfully serialises so it can be sent back to Node-RED!
     * NB: Each cssSelector creates a unique watcher. Sending the same selector overwrites the previous one.
     * @param {string} cssSelector A CSS Selector that selects the element to watch for changes
     * @param {boolean|"toggle"} [startStop] true=start watching the DOM, false=stop. Default='toggle'
     * @param {boolean} [send] true=Send changes to Node-RED, false=Don't send. Default=true
     * @param {boolean} [showLog] true=Output changes to log, false=stop. Default=true. Log level is 2 (Info)
     * @returns {boolean} True if the watch is on, false otherwise
     */
    uiWatch(cssSelector, startStop = 'toggle', send = true, showLog = true) {
        // Select the node that will be observed for mutations
        const targetNode = document.querySelector(cssSelector)
        if (!targetNode) {
            log('warn', 'uibuilder.module.js:uiWatch', `CSS Selector '${cssSelector}' not found.`)()
            return false
        }

        if (startStop === 'toggle' || startStop === undefined || startStop === null) {
            if (this.#uiObservers[cssSelector]) startStop = false
            else startStop = true
        }

        // Need a ref to the Uib this
        const that = this

        if (startStop === true) {
            // Create an observer instance
            this.#uiObservers[cssSelector] = new MutationObserver( function( mutationList /* , observer */ ) {
                const out = []

                mutationList.forEach( mu => {
                    // console.log({ mu })
                    const oMu = {
                        type: mu.type,
                        oldValue: mu.oldValue !== null ? mu.oldValue : undefined,
                    }

                    if (mu.addedNodes.length > 0) {
                        oMu.addedNodes = []
                        mu.addedNodes.forEach( (an, i) => {
                            oMu.addedNodes.push(_ui.nodeGet(mu.addedNodes[i]))
                        })
                    }

                    if (mu.removedNodes.length > 0) {
                        oMu.removedNodes = []
                        mu.removedNodes.forEach( (an, i) => {
                            oMu.removedNodes.push(_ui.nodeGet(mu.removedNodes[i]))
                        })
                    }

                    if ( mu.type === 'attributes' ) {
                        oMu.attributeName = mu.attributeName
                        // @ts-ignore
                        oMu.newValue = mu.target.attributes[mu.attributeName].value
                    }

                    out.push(oMu)
                })

                // Custom event
                that._dispatchCustomEvent('uibuilder:domChange', out)
                // Send a msg back to node-red
                if (send === true) {
                    that.send({
                        _ui: {
                            cssSelector: cssSelector,
                            uiChanges: out
                        },
                        topic: that.topic || `DOM Changes for '${cssSelector}'`,
                    })
                }
                // Log to info
                if (showLog === true) {
                    log('info', 'uibuilder.module.js:uiWatch', `DOM Changes for '${cssSelector}'`, { uiChanges: out }, { mutationList })()
                }
            } )

            // Start observing the target node for configured mutations
            this.#uiObservers[cssSelector].observe(targetNode, { attributes: true, childList: true, subtree: true, characterData: true })
            log('trace', 'uibuilder.module.js:uiWatch', `Started Watching DOM changes for '${cssSelector}'`)()
        } else {
            this.#uiObservers[cssSelector].disconnect()
            delete this.#uiObservers[cssSelector]
            log('trace', 'uibuilder.module.js:uiWatch', `Stopped Watching DOM changes for '${cssSelector}'`)()
        }

        return startStop
    } // ---- End of watchDom ---- //

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

    //#region ------- HTML cache --------- //

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

    //#endregion -------- -------- -------- //

    //#region ------- Message Handling (To/From Node-RED) -------- //

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
                log('trace', `Uib:ioSetup:${this._ioChannels.control}`, 'Received "client connect" from server', receivedCtrlMsg)()
                log('info', `Uib:ioSetup:${this._ioChannels.control}`, `✅ Server connected. Version: ${receivedCtrlMsg.version}\nServer time: ${receivedCtrlMsg.serverTimestamp}, Sever time offset: ${this.serverTimeOffset} hours. Max msg size: ${receivedCtrlMsg.maxHttpBufferSize}`)()

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

                // Save the current server max msg size - defaults to 1mb, change in settings.js
                this.maxHttpBufferSize = receivedCtrlMsg.maxHttpBufferSize

                break
            }

            // We requested this page's metadata from the server using getPageMeta() - this handles the response
            case 'get page meta': {
                this.set('pageMeta', receivedCtrlMsg.payload)
                break
            }

            default: {
                log('trace', `uibuilder:ioSetup:${this._ioChannels.control}`, `Received ${receivedCtrlMsg.uibuilderCtrl} from server`)
                // Anything else to do for other control msgs?
            }
        } // ---- End of process control msg types ---- //
    } // -- End of websocket receive CONTROL msg from Node-RED -- //

    /** Do we want to process something? Check pageName, clientId, tabId. Defaults to yes.
     * @param {*} obj Either a msg._ui or msg._uib object to check
     * @returns {boolean} True if we should process the inbound _ui/_uib msg, false if not.
     */
    _forThis(obj) {
        let r = true

        // Is this msg for this pageName?
        if (obj.pageName && obj.pageName !== this.pageName) {
            log('trace', 'Uib:_msgRcvdEvents:_uib', 'Not for this page')()
            r = false
        }

        // Is this msg for this clientId?
        if (obj.clientId && obj.clientId !== this.clientId) {
            log('trace', 'Uib:_msgRcvdEvents:_uib', 'Not for this clientId')()
            r = false
        }

        // Is this msg for this tabId?
        if (obj.tabId && obj.tabId !== this.tabId) {
            log('trace', 'Uib:_msgRcvdEvents:_uib', 'Not for this tabId')()
            r = false
        }

        return r
    }

    // Handle received messages - Process some msgs internally, emit specific events on document that make it easy for coders to use
    _msgRcvdEvents(msg) {
        // Message received
        this._dispatchCustomEvent('uibuilder:stdMsgReceived', msg)

        // Topic
        if ( msg.topic ) this._dispatchCustomEvent(`uibuilder:msg:topic:${msg.topic}`, msg)

        // Check whether the msg has already been processed - if so, we don't need to process again
        if (msg._uib_processed_by) return
        else msg._uib_processed_by = '_msgRcvdEvents'

        // Handle msg._uib special requests
        if (msg._uib) {
            // Don't process if the inbound msg is not for us
            if (!this._forThis(msg._uib)) return

            /** Process a client reload request from Node-RED - as the page is reloaded, everything else is ignored
             * Note that msg._ui.reload is also actioned via the _ui processing below */
            if (msg._uib.reload === true) {
                log('trace', 'Uib:_msgRcvdEvents:_uib:reload', 'reloading')()
                msg._uib_processed_by = '_msgRcvdEvents - reload'
                location.reload()
                return
            }

            // Process msg._uib.command messages - allows Node-RED to run uibuilder FE functions
            if (msg._uib.command) {
                msg._uib_processed_by = '_msgRcvdEvents - remote command'
                this._uibCommand(msg)
                return
            }

            // Better to request via msg._ui - these are for backwards compatibility
            if ( msg._uib.componentRef === 'globalNotification' ) {
                msg._uib_processed_by = '_msgRcvdEvents - globalNotification'
                _ui.showDialog('notify', msg._uib.options, msg)
            }
            if ( msg._uib.componentRef === 'globalAlert' ) {
                msg._uib_processed_by = '_msgRcvdEvents - globalAlert'
                _ui.showDialog('alert', msg._uib.options, msg)
            }
        }

        // Handle msg._ui requests
        if ( msg._ui ) {
            // Don't process if the inbound msg is not for us
            if (!this._forThis(msg._ui)) return

            log('trace', 'Uib:_msgRcvdEvents:_ui', 'Calling _uiManager')()
            msg._uib_processed_by = '_msgRcvdEvents - _ui'
            this._dispatchCustomEvent('uibuilder:msg:_ui', msg)
            _ui._uiManager(msg)
        }
    } // --- end of _msgRcvdEvents ---

    /** Internal send fn. Send a standard or control msg back to Node-RED via Socket.IO
     * NR will generally expect the msg to contain a payload topic
     * @param {object} msgToSend The msg object to send.
     * @param {string} [channel=uiBuilderClient] The Socket.IO channel to use, must be in self.ioChannels or it will be ignored
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    _send(msgToSend, channel, originator = '') {
        if (channel === null || channel === undefined) channel = this._ioChannels.client

        // Make sure msgToSend is an object & add props to control msgs
        if (channel === this._ioChannels.client) {
            msgToSend = this.makeMeAnObject(msgToSend, 'payload')
            if (this.hasUibRouter()) {
                if (!msgToSend._uib) msgToSend._uib = {}
                msgToSend._uib.routeId = this.uibrouter_CurrentRoute
            }
        } else if (channel === this._ioChannels.control) {
            msgToSend = this.makeMeAnObject(msgToSend, 'uibuilderCtrl')
            if (!Object.prototype.hasOwnProperty.call(msgToSend, 'uibuilderCtrl')) {
                msgToSend.uibuilderCtrl = 'manual send'
            }
            // help remember where this came from as ctrl msgs can come from server or client
            msgToSend.from = 'client'
            // Add current route id if needed
            if (this.hasUibRouter()) msgToSend.routeId = this.uibrouter_CurrentRoute
        }

        /** since 2020-01-02 Added _socketId which should be the same as the _socketId on the server */
        msgToSend._socketId = this._socket.id

        // WARNING: You cannot change any of the this._socket.auth settings at this point

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

        // If a standard send & _ui property exists, make sure to add _ui.from = 'client' & routerId if needed
        if (msgToSend._ui) {
            msgToSend._ui.from = 'client'
            if (this.hasUibRouter()) msgToSend._ui.routeId = this.uibrouter_CurrentRoute
        }

        // Check size and warn if may be too large - doesn't work if obj contains a buffer
        // const approxMsgSize = this.getObjectSize(msgToSend)
        // console.log(approxMsgSize, this.maxHttpBufferSize, approxMsgSize >= this.maxHttpBufferSize, msgToSend, this.getObjectSize(msgToSend))
        // if (approxMsgSize >= this.maxHttpBufferSize) {
        //     log('error', 'Uib:_send', `Message may be too large to send. Approx msg size: ${approxMsgSize}. Max msg size: ${this.maxHttpBufferSize}`)()
        // }

        // Track how many messages have been sent & last msg sent
        let numMsgs
        if (channel === this._ioChannels.client) {
            this.set('sentMsg', msgToSend)
            numMsgs = this.set('msgsSent', ++this.msgsSent)
        } else if (channel === this._ioChannels.control) {
            this.set('sentCtrlMsg', msgToSend)
            numMsgs = this.set('msgsSentCtrl', ++this.msgsSentCtrl)
        }
        log('trace', 'Uib:_send', ` Channel '${channel}'. Sending msg #${numMsgs}`, msgToSend)()

        this._socket.emit(channel, msgToSend)
    } // --- End of Send Msg Fn --- //

    /** Callback handler for messages from Node-RED
     * NOTE: `this` is the class here rather the `socket` as would be normal since we bind the correct `this` in the call.
     *       Use this._socket if needing reference to the socket.
     * @callback ioSetupFromServer Called from ioSetup/this._socket.on(this.#ioChannels.server, this.stdMsgFromServer.bind(this))
     * @param {object} receivedMsg The msg object from Node-RED
     * @this Uib
     */
    _stdMsgFromServer(receivedMsg) {

        // Make sure that msg is an object & not null
        receivedMsg = this.makeMeAnObject(receivedMsg, 'payload')

        // Don't process if the inbound msg is not for us
        if (receivedMsg._uib && !this._forThis(receivedMsg._uib)) return
        if (receivedMsg._ui && !this._forThis(receivedMsg._ui)) return

        // @since 2018-10-07 v1.0.9: Work out local time offset from server
        this._checkTimestamp(receivedMsg)

        // Track how many messages have been received
        this.set('msgsReceived', ++this.msgsReceived)

        // Emit specific document events on msg receipt that make it easy for coders to use
        this._msgRcvdEvents(receivedMsg)

        if ( !('_ui' in receivedMsg && !('payload' in receivedMsg)) ) {
            // Save the msg for further processing
            this.set('msg', receivedMsg)
        }

        log('info', 'Uib:ioSetup:stdMsgFromServer', `Channel '${this._ioChannels.server}'. Received msg #${this.msgsReceived}.`, receivedMsg)()

        // ! NOTE: Don't try to handle specialist messages here. See _msgRcvdEvents.
    } // -- End of websocket receive DATA msg from Node-RED -- //

    /** Process msg._uib.command - Remember to update #extCommands with new allowed commands
     * @param {object} msg Msg from Node-RED containing a msg._uib object
     */
    _uibCommand(msg) {
        if (!msg._uib || !msg._uib.command) {
            log('error', 'uibuilder:_uibCommand', 'Invalid command message received', { msg })()
            msg.payload = msg.error = 'Invalid command message received'
            this.send(msg)
            return
        }
        const cmd = msg._uib.command
        // Disallowed command request outputs error and ignores the msg (NB: Case must match)
        if (!this.#extCommands.includes(cmd.trim())) {
            log('error', 'Uib:_uibCommand', `Command '${cmd} is not allowed to be called externally`)()
            return
        }
        const prop = msg._uib.prop
        const value = msg._uib.value
        const quiet = msg._uib.quiet ?? false
        let response, info

        // Don't forget to update `#extCommands`, `docs/client-docs/control-from-node-red.md` & `functions.md`
        switch (cmd) {
            case 'elementIsVisible': {
                response = this.elementIsVisible(prop)
                // info = `Element "${prop}" ${response ? 'is visible' : 'is not visible'}`
                break
            }

            case 'elementExists': {
                response = this.elementExists(prop, false)
                info = `Element "${prop}" ${response ? 'exists' : 'does not exist'}`
                break
            }

            case 'get': {
                response = this.get(prop)
                break
            }

            case 'getManagedVarList': {
                if (prop === 'full') response = this.getManagedVarList()
                else response = Object.values(this.getManagedVarList())
                break
            }

            case 'getWatchedVars': {
                if (prop === 'full') response = this.getWatchedVars()
                else response = Object.values(this.getWatchedVars())
                break
            }

            case 'htmlSend': {
                response = this.htmlSend('', false)
                break
            }

            case 'include': {
                // include is async
                response = _ui.include(prop, value)
                break
            }

            case 'navigate': {
                let newUrl
                if (prop) newUrl = prop
                else if (value) newUrl = value
                response = this.navigate(newUrl)
                break
            }

            case 'scrollTo': {
                response = this.scrollTo(prop, value)
                break
            }

            case 'set': {
                let store = false
                let autoload = false
                if (msg._uib.options && msg._uib.options.store) {
                    if (msg._uib.options.store === true) store = true
                    if (msg._uib.options.autoload === true) autoload = true
                }
                response = this.set(prop, value, store, autoload)
                break
            }

            case 'showMsg': {
                response = this.showMsg(value, prop)
                break
            }

            case 'showStatus': {
                response = this.showStatus(value, prop)
                break
            }

            case 'uiGet': {
                response = _ui.uiGet(prop, value)
                break
            }

            case 'uiWatch': {
                response = this.uiWatch(prop)
                break
            }

            case 'watchUrlHash': {
                response = this.watchUrlHash(prop)
                break
            }

            default: {
                log('warning', 'Uib:_uibCommand', `Command '${cmd}' not yet implemented`)()
                break
            }
        }

        if (quiet !== true) {
            if (response === undefined) {
                response = `'${prop}' is undefined`
            }
            if (Object(response).constructor === Promise) {
                // response = `'${cmd} ${prop}' submitted. Cmd is async, no response available`
                response
                    .then( (/** @type {any} */ data) => {
                        msg.payload = msg._uib.response = data
                        msg.info = msg._uib.info = info
                        if (!msg.topic) msg.topic = this.topic || `uib ${cmd} for '${prop}'`
                        this.send(msg)
                        return true
                    })
                    .catch( err => {
                        log(0, 'Uib:_uibCommand', 'Error: ', err)()
                    })
            } else {
                msg.payload = msg._uib.response = response
                msg.info = msg._uib.info = info
                if (!msg.topic) msg.topic = this.topic || `uib ${cmd} for '${prop}'`
                this.send(msg)
            }
        }
    } // --- end of _uibCommand ---

    /** Send log text to uibuilder's beacon endpoint (works even if socket.io not connected)
     * @param {string} txtToSend Text string to send
     * @param {string|undefined} logLevel Log level to use. If not supplied, will default to debug
     */
    beaconLog(txtToSend, logLevel) {
        if (!logLevel) logLevel = 'debug'
        navigator.sendBeacon('./_clientLog', `${logLevel}::${txtToSend}`)
    }

    /** Request the current page's metadata from the server - response is handled automatically in _ctrlMsgFromServer */
    getPageMeta() {
        this.sendCtrl({
            uibuilderCtrl: 'get page meta'
        })
    }

    /** Easily send the entire DOM/HTML msg back to Node-RED
     * @param {string} [originator] A Node-RED node ID to return the message to
     * @param {boolean} [send] If true (default) directly send response to Node-RED. Is false when calling from Node-RED as a command.
     * @returns {string} The HTML as a string
     */
    htmlSend(originator = '', send = true) {
        const out = `<!doctype html>\n${document.documentElement.outerHTML}`

        // Set up the msg to send - NB: Topic may be added by this._send
        const msg = {
            payload: out,
            length: out.length,
            topic: this.topic,
        }

        log('trace', 'Uib:htmlSend', 'Sending full HTML to Node-RED', msg)()

        if (send === true) this._send(msg, this._ioChannels.client, originator)
        return out
    }

    /** Send log info back to Node-RED over uibuilder's websocket control output (Port #2)
     * @param {...*} arguments All arguments passed to the function are added to the msg.payload
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
    eventSend(domevent, originator = '') { // eslint-disable-line sonarjs/cognitive-complexity
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

        // Get target custom properties - only shows custom props not element default ones
        const props = this.getElementCustomProps(target)

        // Attempt to get target attributs - can fail for certain target types
        const attribs = this.getElementAttributes(target)

        // Msg.payload
        let payload = {}

        // If target is embedded in a form, include ALL the form data in the output
        let formDetails
        if ( target.form ) {
            formDetails = {
                id: this.returnElementId(target.form),
                valid: target.form.checkValidity(),
            }

            Object.values(target.form).forEach( (frmEl, i) => {
                // Ignore <fieldset>, <object> - they don't have values
                if (['fieldset', 'object'].includes(frmEl.type)) return

                // NB: If type=files, this also sends the file to Node-RED
                const details = this.getFormElementDetails(frmEl)
                if (details) {
                    formDetails[details.id] = details
                    // simplified for addition to msg.payload
                    payload[details.id] = details.value
                }
            })
        } else {
            if (target.type === 'file') {
                // Walk through each file in the FileList, get the details and send the file to Node-RED
                payload = this._processFilesInput(target.files)
            }
        }

        // Check for CSS Classes
        const classes = this.getElementClasses(target)

        // Each `data-xxxx` attribute is added as a property
        if (Object.keys(target.dataset).length > 0) payload = { ...payload, ...target.dataset }

        // Check for element value/check props
        const { value, checked } = this.getFormElementValue(target)
        if (value !== null) payload.value = value
        if (checked !== null) payload.checked = checked

        // Handle Notification events
        let nprops
        if ( Object.prototype.toString.call(target) === '[object Notification]') {
            // Fixed payload for convenience
            payload = `notification-${target.userAction}`
            // Capture the notification properties
            nprops = {
                // userAction: target.userAction, // uib custom prop: click, close or error
                actions: target.actions,
                badge: target.badge,
                body: target.body,
                data: target.data,
                dir: target.dir,
                icon: target.icon,
                image: target.image,
                lang: target.lang,
                renotify: target.renotify,
                requireInteraction: target.requireInteraction,
                silent: target.silent,
                tag: target.tag,
                timestamp: target.timestamp,
                title: target.title,
                vibrate: target.vibrate,
            }
        }

        // Set up the msg to send - NB: Topic may be added by this._send
        const msg = {
            // - this may be an empty Object if no data attributes defined
            payload: payload,

            _ui: {
                type: 'eventSend',
                id: target.id !== '' ? target.id : undefined,
                name: target.name !== '' ? target.name : undefined,
                slotText: target.textContent ? target.textContent.substring(0, 255) : undefined,

                form: formDetails,
                props: props,
                attribs: attribs,
                classes: classes,

                notification: nprops,

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

        log('trace', 'Uib:eventSend', 'Sending msg to Node-RED', msg)()

        this._send(msg, this._ioChannels.client, originator)
    }

    /** Send a standard message to NR
     * @example uibuilder.send({payload:'Hello'})
     * @param {object} msg Message to send
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    send(msg, originator = '') {
        this._send(msg, this._ioChannels.client, originator)
    }

    // ! TODO: Rooms do not auto-reconnect. Add tracking and update _onConnect
    // ! TODO: Add receipt handler on joining a room.

    // NOTE: Rooms only understood by server not client so we have to use custom emits
    //       They do not auto-reconnect

    /** Send a msg to a pre-defined Socket.IO room
     * @link https://socket.io/docs/v4/rooms/
     * @param {string} room Name of a Socket.IO pre-defined room.
     * @param {*} msg Message to send
     */
    sendRoom(room, msg) {
        this._socket.emit('uib-room-send', room, msg )
    }

    joinRoom(room) {
        this._socket.emit('uib-room-join', room)
    }

    leaveRoom(room) {
        this._socket.emit('uib-room-leave', room)
    }

    /** Send a control msg to NR
     * @param {object} msg Message to send
     */
    sendCtrl(msg) {
        this._send(msg, this._ioChannels.control)
    }

    /**
     * Send a message to Node-RED on a custom channel - use for UIBUILDER 3rd-party custom nodes
     * @param {string} channel The custom channel name to use
     * @param {object} msg The message to send
     */
    sendCustom(channel, msg) {
        this._socket.emit(channel, msg)
    }

    /** Upload a file to Node-RED over Socket.IO
     * https://developer.mozilla.org/en-US/docs/Web/API/FileReader
     * @param {File} file Reference to File API object to upload
     */
    uploadFile(file) {
        // Create a new FileReader instance
        const reader = new FileReader()

        // Define the onload event for the FileReader
        reader.onload = (e) => {
            // Get the binary content of the file
            const arrayBuffer = e.target.result

            // Send the binary content to the server
            const msg = {
                topic: this.topic || 'file-upload',
                payload: arrayBuffer,
                fileName: file.name,
                type: file.type,
                lastModified: file.lastModifiedDate,
                size: file.size,
            }

            // Only send if content not too large
            const maxSize = this.maxHttpBufferSize - 500
            if (arrayBuffer.byteLength >= maxSize) {
                msg.payload = undefined
                msg.error = `File is too large to send. File size: ${arrayBuffer.byteLength}. Max msg size: ${maxSize}`
                log('error', 'Uib:uploadFile', msg.error)()

            }

            this.send(msg)
        }

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file)
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

        this.url = ioNamespace
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
            this._socket.disconnect()

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

    /** Called by _ioSetup when Socket.IO connects to Node-RED */
    _onConnect() {
        // WARNING: You cannot change any of the this._socket.auth settings at this point
        log('info', 'Uib:ioSetup', `✅ SOCKET CONNECTED. Connection count: ${this.connectedNum}, Is a Recovery?: ${this._socket.recovered}. \nNamespace: ${this.ioNamespace}`)()
        this._dispatchCustomEvent('uibuilder:socket:connected', { 'numConnections': this.connectedNum, 'isRecovery': this._socket.recovered })

        this._checkConnect() // resets any reconnection timers & sets connected flag
    }

    /** Called by _ioSetup when Socket.IO disconnects from Node-RED
     * @param {string} reason Disconnection title
     */
    _onDisconnect(reason) {
        // reason === 'io server disconnect' - redeploy of Node instance
        // reason === 'transport close' - Node-RED terminating
        // reason === 'ping timeout' - didn't receive a pong response?
        log('info', 'Uib:ioSetup:socket-disconnect', `⛔ Socket Disconnected. Reason: ${reason}`)()

        this._dispatchCustomEvent('uibuilder:socket:disconnected', reason)

        /** A workaround for SIO's failure to reconnect after a disconnection */
        this._checkConnect()
    }

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

        // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
        log('trace', 'Uib:ioSetup', `About to create IO object. Transports: [${this.socketOptions.transports.join(', ')}]`)()
        this._socket = io(this.ioNamespace, this.socketOptions)

        this._connectGlobal()

        /** When the socket is connected - set ioConnected flag and reset connect timer  */
        this._socket.on('connect', this._onConnect.bind(this))

        // RECEIVE a STANDARD, non-control msg from Node-RED server
        this._socket.on(this._ioChannels.server, this._stdMsgFromServer.bind(this))

        // RECEIVE a CONTROL msg from Node-RED server - see also sendCtrl()
        this._socket.on(this._ioChannels.control, this._ctrlMsgFromServer.bind(this))

        // When the socket is disconnected ..............
        this._socket.on('disconnect', this._onDisconnect.bind(this))

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

    /** Connect to global namespace & create global listener that updates the `globalMsg` var */
    _connectGlobal() {
        this._socketGlobal = io('/', this.socketOptions)
        this._socketGlobal.onAny( (...args) => {
            this.set('globalMsg', args.slice(0, -1))
        })
    }

    /** Manually (re)connect socket.io */
    connect() {
        // ? Should I use this._checkConnect()?
        this._socket.connect()
    }

    /** Manually disconnect socket.io and stop any auto-reconnect timer */
    disconnect() {
        this._socket.disconnect()
        // As this is a manual disconnect, stop any reconnect timers
        if (this.#timerid) window.clearTimeout(this.#timerid)
    }

    //#endregion -------- ------------ -------- //

    //#region ! EXPERIMENTAL: Watch for and process uib-* or data-uib-* attributes in HTML and auto-process

    /** Attempt to load a service worker
     * https://yonatankra.com/how-service-workers-sped-up-our-website-by-97-5/
     * @param {string} fileName Name of service worker js file (without .js extension)
     */
    // async registerServiceWorker(fileName) {
    //     if (!navigator.serviceWorker) return

    //     await navigator.serviceWorker.register(
    //         `./${fileName}.js`,
    //         {
    //             scope: './',
    //         }
    //     )
    // }

    /** Wrap an object in a JS proxy
     * WARNING: Sadly, `let x = uib.createProxy( [1,2] ); x.push(3);` Does not trigger a send because that is classed as a
     * GET, not a SET.
     * param {*} target The target object to proxy
     * returns {Proxy} A proxied version of the target object
     */
    // createProxy(target) {
    //     return new Proxy(target, {
    //         _doSend(prop, val, oldVal) {
    //             uibuilder.send({
    //                 topic: 'uibuilder/proxy/change',
    //                 _uib: {
    //                     varChange: {
    //                         name: self.$name,
    //                         property: prop,
    //                         oldValue: oldVal,
    //                         newValue: val,
    //                     }
    //                 },
    //                 payload: target,
    //             })
    //         },
    //         get(target, prop, receiver) {
    //             console.log('uib proxy - GET: ', prop, target)
    //             let val = Reflect.get(...arguments)
    //             if (typeof val === 'function') val = val.bind(target)
    //             if (self.$sendChanges) this._doSend(prop, Reflect.get(target))
    //             return val
    //         },
    //         set(target, prop, val, receiver) {
    //             if (prop === '$sendChanges') {
    //                 self.$sendChanges = typeof val === 'boolean' ? val : false
    //                 return true
    //             }
    //             if (prop === '$name') {
    //                 self.$name = typeof val === 'string' ? val : undefined
    //                 return true
    //             }
    //             console.log('uib proxy - SET: ', val, prop, target)
    //             const oldVal = Reflect.get(...arguments)
    //             const worked = Reflect.set(target, prop, val, receiver)
    //             if (self.$sendChanges && worked) {
    //                 self._doSend(prop, val, oldVal)
    //             }
    //             return worked
    //         },
    //     })
    // }

    //#endregion ! EXPERIMENTAL

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

            // @ts-ignore
            if (event.detail.prop in this.#showStatus) {
                // @ts-ignore
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
        this.set('ioPath', this.urlJoin(this.httpNodeRoot, Uib._meta.displayName, 'vendor', 'socket.io'))
        log('trace', 'Uib:constructor', `ioPath: "${this.ioPath}"`)()

        //#endregion

        // Work out pageName
        this.set('pageName', window.location.pathname.replace(`${this.ioNamespace}/`, ''))
        if ( this.pageName.endsWith('/') ) this.set('pageName', `${this.pageName}index.html`)
        if ( this.pageName === '' ) this.set('pageName', 'index.html')

        // Attempt to restore autoload variables
        try {
            const autoloadVars = this.getStore('_uibAutoloadVars')
            if (Object.keys(autoloadVars).length > 0) {
                Object.keys(autoloadVars).forEach( (id) => {
                    this.set(id, this.getStore(id))
                })
            }
        } catch (e) {}

        // ! Experimental service worker
        // this.registerServiceWorker('sw')

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
            if (options.ioNamespace) this.set('ioNamespace', options.ioNamespace)
            if (options.ioPath) this.set('ioPath', options.ioPath)
            if (options.nopolling && this.socketOptions.transports[0] === 'polling') this.socketOptions.transports.shift()
        }

        /** Handle specialist messages like reload and _ui -> Moved to _msgRcvdEvents */

        // Track last browser navigation type: navigate, reload, back_forward, prerender
        // TODO Needs more work - updates on navigation needed?
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

        // Watch for URL hash changes in case using a front-end router. Updates watched var `urlHash` and socket.io `auth.urlHash`
        this._watchHashChanges()

        // Check if Vue is present (used for dynamic UI processing)
        if (window['Vue']) {
            this.set('isVue', true)
            try {
                this.set('vueVersion', window['Vue'].version)
            } catch (e) { }
            log('trace', 'Uib:start', `VueJS is loaded. Version: ${this.vueVersion}`)()
        } else {
            log('trace', 'Uib:start', 'VueJS is not loaded.')()
        }

        // Check if DOMPurify library is loaded
        if (window['DOMPurify']) {
            this.set('purify', true)
            log('trace', 'Uib:start', 'DOMPurify is loaded.')()
        } else {
            log('trace', 'Uib:start', 'DOMPurify is not loaded.')()
        }
        // Check if Markdown-IT library is loaded
        if (window['markdownit']) {
            this.set('markdown', true)
            log('trace', 'Uib:start', 'Markdown-IT is loaded.')()
        } else {
            log('trace', 'Uib:start', 'Markdown-IT is not loaded.')()
        }

        // Set up msg listener for the optional showMsg
        this.onChange('msg', (msg) => {
            if (this.#isShowMsg === true) {
                const eMsg = document.getElementById('uib_last_msg')
                if (eMsg) eMsg.innerHTML = this.syntaxHighlight(msg)
            }
        })

        // Initial scan for uib-* attributes & add suitable change processors
        this._uibAttrScanAll(document)
        // Observer to watch for new/changed elements & add suitable change processors
        const observer = new MutationObserver(this._uibAttribObserver.bind(this))
        observer.observe(document, {
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: this.uibAttribs,
            childList: true
        })

        this._dispatchCustomEvent('uibuilder:startComplete')
    }

    //#endregion -------- ------------ -------- //
} // ==== End of Class Uib ====

//#region --- Wrap up - get things started, define globals & web components ---

// Create an instance (we will only ever want one)
const uibuilder = new Uib()

// Assign reference to the instance to the global `window` object
// Only useful if loading via <script> tag - prefer loading via `import uibuilder from ...`
if (!window['uibuilder']) {
    window['uibuilder'] = uibuilder
} else {
    log('error', 'uibuilder.module.js', '`uibuilder` already assigned to window. Have you tried to load it more than once?')
}
if (!window['uib']) {
    window['uib'] = uibuilder
} else {
    log('warn', 'uibuilder.module.js', '`uib` shortcut already assigned to window.')
}

// Assign `$` to global window object unless it is already in use.
// Note that this is also available as `uibuilder.$`.
if (!window['$']) {
    /** @type {HTMLElement} */
    window['$'] = window['uibuilder'].$ // document.querySelector.bind(document)
} else {
    log('warn', 'uibuilder.module.js', 'Cannot allocate the global `$`, it is already in use. Use `uibuilder.$` or `uib.$` instead.')
}
// Assign `$$` to global window object unless it is already in use.
// Note that this is also available as `uibuilder.$$`.
if (!window['$$']) {
    /** @type {HTMLElement} */
    window['$$'] = window['uibuilder'].$$ // document.querySelectorAll.bind(document)
} else {
    log('warn', 'uibuilder.module.js', 'Cannot allocate the global `$$`, it is already in use. Use `uibuilder.$$` or `uib.$$` instead.')
}

// Assign `$ui` to global window object unless it is already in use.
if (!window['$ui']) {
    /** @type {HTMLElement} */
    window['$ui'] = window['uibuilder'].$ui
} else {
    log('warn', 'uibuilder.module.js', 'Cannot allocate the global `$ui`, it is already in use. Use `uibuilder.$ui` or `uib.$ui` instead.')
}

if (!('on' in document)) {
    document.on = function (event, callback) {
        this.addEventListener(event, callback)
    }
}
if (!('on' in window)) {
    window.on = function (event, callback) {
        this.addEventListener(event, callback)
    }
}

try {
    if (!('query' in Element)) {
        Element.prototype.query = function(selector) {
            return this.querySelector(selector)
        }
    }
    if (!('queryAll' in Element)) {
        Element.prototype.queryAll = function(selector) {
            return this.querySelectorAll(selector)
        }
    }
    if (!('on' in Element)) {
        Element.prototype.on = function (event, callback) {
            this.addEventListener(event, callback)
        }
    }
} finally { } // eslint-disable-line no-empty

// Can import as `import uibuilder from ...` OR `import {uibuilder} from ...`
export { uibuilder }
export default uibuilder

// Attempt to run start fn
uibuilder.start()

// Add built-in web component classes as a new Custom Element to the window object
customElements.define('uib-var', UibVar)
customElements.define('uib-meta', UibMeta)
customElements.define('apply-template', ApplyTemplate)

//#endregion --- Wrap up ---

// EOF
