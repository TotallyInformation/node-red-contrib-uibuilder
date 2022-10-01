/** This is the Front-End JavaScript for uibuilder  in HTML Module form
 * It provides a number of global objects that can be used in your own javascript.
 * @see the docs folder `./docs/uibuilder.module.md` for details of how to use this fully.
 *
 * Please use the default index.js file for your own code and leave this as-is.
 * See Uib._meta for client version string
 */
/*
  Copyright (c) 2017-2022 Julian Knight (Totally Information)

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

const version = '6.0.0-mod'

// TODO Add option to allow log events to be sent back to Node-RED as uib ctrl msgs
//#region --- Module-level utility functions --- //

//#region --- print/console - debugging output functions --- //
/** Default log level - Error & Warn */
let logLevel = 1
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
    if (property === null || property === undefined) property = 'payload'
    if (typeof property !== 'string') {
        log('warn', 'uibuilderfe:makeMeAnObject', `WARNING: property parameter must be a string and not: ${typeof property}`)()
        property = 'payload'
    }
    let out = {}
    if (typeof thing === 'object') {
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

// Define and export the Uib class - note that an instance of the class is also exported in the wrap-up
export const Uib = class Uib {

    //#region private class vars

    // How many times has the loaded instance connected to Socket.IO (detect if not a new load?)
    #connectedNum = 0
    // event listener callbacks by property name
    #events = {}
    // Socket.IO channel names
    _ioChannels = { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder' }
    /** setInterval holder for pings @type {function|undefined} */
    #pingInterval
    // onChange event callbacks
    #propChangeCallbacks = {}
    // onTopic event callbacks
    #msgRecvdByTopicCallbacks = {}
    /** setInterval id holder for Socket.IO checkConnect
     * @type {number|null}
     */
    #timerid = null
    // @ts-ignore Detect whether the loaded library is minified or not
    #isMinified = !(/param/).test(function (param) { }) // eslint-disable-line no-unused-vars
    // Holds the reference ID for the internal msg change event handler so that it can be cancelled
    #MsgHandler
    // Placeholder for io.socket - can't make a # var until # fns allowed in all browsers
    _socket

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
    /** last control msg object sent via uibuilder.send() @since v2.0.0-dev3 */
    sentCtrlMsg = {}
    /** last std msg object sent via uibuilder.send() */
    sentMsg = {}
    /** placeholder to track time offset from server, see fn socket.on(ioChannels.server ...) */
    serverTimeOffset = null
    /** placeholder for a socket error message */
    socketError = null
    /** Is the client online or offline? */
    online = null
    // Remember the last page (re)load/navigation type: navigate, reload, back_forward, prerender
    lastNavType = null
    //#endregion ---- ---- ---- ---- //

    // TODO Move to proper getters/setters
    //#region ---- Externally Writable (via .set method, read via .get method) ---- //
    originator = ''     // Default originator node id
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
        },
        transportOptions: {
            // Can only set headers when polling
            polling: {
                extraHeaders: {
                    'x-clientid': `uibuilderfe; ${this.clientId}`,
                    // Authorization: 'test', //TODO: Replace with self.jwt variable? // Authorization: `Bearer ${your_jwt}`
                }
            },
        },
    }
    //#endregion -- not external --

    //#endregion --- End of variables ---

    //#region ------- Static metadata ------- //
    static _meta = {
        version: version,
        type: 'module',
        displayName: 'uibuilder',
    }

    get meta() { return Uib._meta }
    //#endregion ---- ---- ---- ---- //

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
     * @returns {*} Input value
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
     * @returns {*} The current value of the property
     */
    get(prop) {
        if (prop.startsWith('_') || prop.startsWith('#')) {
            log('warn', 'Uib:get', `Cannot use get() on protected property "${prop}"`)()
            return
        }
        if (prop === 'version') return Uib._meta.version
        if (prop === 'msgsCtrl') return this.msgsCtrlReceived
        if (prop === 'reconnections') return this.#connectedNum
        if (this[prop] === undefined) {
            log('warn', 'Uib:get', `get() - property "${prop}" does not exist`)()
        }
        return this[prop]
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
     * @example: uibuilder.onChange('msg', function(msg){ console.log('uibuilder.msg changed! It is now: ', msg) })
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

    /** Simplistic jQuery-like document CSS query selector, returns an HTML Element */
    $ = document.querySelector.bind(document)

    /** Set the default originator. Set to '' to ignore. Used with uib-sender.
     * @param {string} [originator] A Node-RED node ID to return the message to
     */
    setOriginator(originator = '') {
        this.set('originator', originator)
    } // ---- End of setOriginator ---- //

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

    getStore(id) {
        try {
            // @ts-ignore
            return JSON.parse(localStorage.getItem(this.storePrefix + id))
        } catch (e) {
            return localStorage.getItem(this.storePrefix + id)
        }
    }

    removeStore(id) {
        try {
            localStorage.removeItem(this.storePrefix + id)
        } catch (e) { }
    }

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

    //#endregion -------- -------- -------- //

    //#region ------- UI handlers --------- //

    /** Replace or add an HTML element's slot from text or an HTML string
     * Will use DOMPurify if that library has been loaded to window.
     * @param {*} ui Single entry from the msg._ui property
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlot(ui, el, component) {
        // If DOMPurify is loaded, apply it now
        if (window['DOMPurify']) component.slot = window['DOMPurify'].sanitize(component.slot)
        // Set the component content to the msg.payload or the slot property
        if (component.slot !== undefined && component.slot !== null && component.slot !== '') {
            el.innerHTML = component.slot ? component.slot : ui.payload
        }
    }

    /** Replace or add an HTML element's slot from a Markdown string
     * Only does something if the markdownit library has been loaded to window.
     * Will use DOMPurify if that library has been loaded to window.
     * @param {*} ui Single entry from the msg._ui property
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlotMarkdown(ui, el, component) {
        if (!window['markdownit']) return

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
        component.slotMarkdown = md.render(component.slotMarkdown)
        // If DOMPurify is loaded, apply it now
        if (window['DOMPurify']) component.slotMarkdown = window['DOMPurify'].sanitize(component.slotMarkdown)
        // Set the component content to the msg.payload or the slot property
        if (component.slotMarkdown !== undefined && component.slotMarkdown !== null && component.slotMarkdown !== '') {
            el.innerHTML += component.slotMarkdown ? component.slotMarkdown : ui.payload
        }
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

        // Allow for variants
        if ( !ui.variant || !['', 'primary', 'secondary', 'success', 'info', 'warn', 'warning', 'failure', 'error', 'danger'].includes(ui.variant)) ui.variant = ''

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

    // TODO Add check if ID already exists
    // TODO Allow single add without using components array
    /** Handle incoming msg._ui add requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiAdd(ui) {
        log('trace', 'Uib:_uiManager:add', 'Starting _uiAdd')()

        // console.log('>> ui >> ', ui)

        ui.components.forEach((compToAdd) => {
            // Create the new component
            const newEl = document.createElement(compToAdd.type)

            // Add attributes
            if (compToAdd.attributes) {
                Object.keys(compToAdd.attributes).forEach((attrib) => {
                    newEl.setAttribute(attrib, compToAdd.attributes[attrib])
                })
            }

            // ID if set
            if (compToAdd.id) newEl.setAttribute('id', compToAdd.id)

            // Add event handlers
            if (compToAdd.events) {
                Object.keys(compToAdd.events).forEach((type) => {
                    // @ts-ignore  I'm forever getting this wrong!
                    if (type.toLowerCase === 'onclick') type = 'click'
                    // Add the event listener - hate eval but it is the only way I can get it to work
                    try {
                        newEl.addEventListener(type, (evt) => {
                            // Use new Function to ensure that esbuild works: https://esbuild.github.io/content-types/#direct-eval
                            (new Function('evt', `${compToAdd.events[type]}(evt)`))(evt) // eslint-disable-line no-new-func
                        })
                        // newEl.setAttribute( 'onClick', `${compToAdd.events[type]}()` )
                    } catch (err) {
                        log('error', 'Uib:_uiAdd', `Add event '${type}' for element '${compToAdd.type}': Cannot add event handler. ${err.message}`)()
                    }
                })
            }

            // Add custom properties to the dataset
            if (compToAdd.properties) {
                Object.keys(compToAdd.properties).forEach((prop) => {
                    // TODO break a.b into sub properties
                    newEl[prop] = compToAdd.properties[prop]
                })
            }

            //#region Add Slot content to innerHTML
            if (!compToAdd.slot) compToAdd.slot = ui.payload
            if (compToAdd.slot) {
                this.replaceSlot(ui, newEl, compToAdd)
            }
            //#endregion

            // TODO Add multi-slot capability

            //#region Add Slot Markdown content to innerHTML IF marked library is available
            if (compToAdd.slotMarkdown) {
                this.replaceSlotMarkdown(ui, newEl, compToAdd)
            }
            //#endregion

            // Where to add the new element?
            let elParent
            if (compToAdd.parentEl) {
                elParent = compToAdd.parentEl
            } else if (ui.parentEl) {
                elParent = ui.parentEl
            } else if (compToAdd.parent || ui.parent) {
                const parent = compToAdd.parent ? compToAdd.parent : ui.parent
                elParent = document.querySelector(parent)
                if (!elParent) {
                    log('info', 'Uib:_uiAdd', `Parent element '${parent}' not found, adding to body`)()
                    elParent = document.querySelector('body')
                }
            } else {
                log('info', 'Uib:_uiAdd', 'No parent specified, adding to body')()
                elParent = document.querySelector('body')
            }

            // Append to the required parent
            elParent.appendChild(newEl)

            // If nested components, go again - but don't pass payload to sub-components
            if (compToAdd.components) {
                this._uiAdd({
                    method: ui.method,
                    parentEl: newEl,
                    components: compToAdd.components,
                })
            }
        })

    } // --- end of _uiAdd ---

    // TODO Add better tests for failures (see comments)
    /** Handle incoming _ui remove requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiRemove(ui) {
        ui.components.forEach((compToRemove) => {
            try {
                document.querySelector(compToRemove).remove()
            } catch (err) {
                // Could not remove. Cannot read properties of null <= no need to report this one
                // Could not remove. Failed to execute 'querySelector' on 'Document': '##testbutton1' is not a valid selector
                log('trace', 'Uib:_uiRemove', `Could not remove. ${err.message}`)()
            }
        })
    } // --- end of _uiRemove ---

    // TODO Allow single add without using components array
    // TODO Allow sub-components
    /** Handle incoming _ui update requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiUpdate(ui) {
        log('trace', 'Uib:_uiManager:update', 'Starting _uiUpdate')()

        if ( !ui.components ) ui.components = [ui]

        ui.components.forEach((compToUpd) => {

            /** @type {NodeListOf<Element>} */
            let elToUpd

            // Either the id, name or type (element type) must be given in order to identify the element to change. ALL elements matching are updated.
            if ( compToUpd.parentEl ) { // Handles nested components
                // ! NOT WORKING
                console.log('>> parentEl >>', compToUpd.parentEl, ui)
                elToUpd = compToUpd.parentEl[0]
            } else if ( compToUpd.id ) {
                elToUpd = document.querySelectorAll(`#${compToUpd.id}`)
            } else if ( compToUpd.name ) {
                elToUpd = document.querySelectorAll(`[name="${compToUpd.name}"]`)
            } else if ( compToUpd.type ) {
                elToUpd = document.querySelectorAll(compToUpd.type)
            }

            // @ts-ignore Nothing was found so give up
            if ( elToUpd === undefined || elToUpd.length < 1 ) {
                log('error', 'Uib:_uiManager:update', 'Cannot find the DOM element', compToUpd)()
                return
            }

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
                        el.setAttribute(attrib, compToUpd.attributes[attrib])
                    })
                })
            }

            if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload
            if (compToUpd.slot) {
                elToUpd.forEach( el => {
                    this.replaceSlot(ui, el, compToUpd)
                })
            }

            if (compToUpd.slotMarkdown) {
                elToUpd.forEach( el => {
                    this.replaceSlotMarkdown(ui, el, compToUpd)
                })
            }

            // If nested components, go again - but don't pass payload to sub-components
            if (compToUpd.components) {
                elToUpd.forEach( el => {
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
                    this._uiAdd(ui)
                    break
                }

                case 'remove': {
                    this._uiRemove(ui)
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
        // Handle no argument, e.g. <button onClick="uibuilder.eventSend()"> - event is a hidden variable when fn used in addEventListener
        if (!domevent || !domevent.constructor) domevent = event
        // The argument must be a DOM event
        if ((!domevent.constructor.name.endsWith('Event')) || (!domevent.currentTarget)) {
            log('warn', 'Uib:eventSend', `ARGUMENT NOT A DOM EVENT - use data attributes not function arguments to pass data. Arg Type: ${domevent.constructor.name}`, domevent)()
            return
        }
        const target = domevent.currentTarget

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

        let thisMsg
        if ( !Object.prototype.hasOwnProperty.call(this, 'msg') ) thisMsg = { topic: undefined }
        else thisMsg = this.msg
        if ( !Object.prototype.hasOwnProperty.call(thisMsg, 'topic') ) thisMsg.topic = undefined
        const msg = {
            topic: thisMsg.topic,  // repeats the topic from the last inbound msg if it exists

            // Each `data-xxxx` attribute is added as a property
            // - this may be an empty Object if no data attributes defined
            payload: target.dataset,

            _ui: {
                type: 'eventSend',
                id: target.id !== '' ? target.id : undefined,
                name: target.name !== '' ? target.name : undefined,
                slotText: target.textContent !== '' ? target.textContent.substring(0, 255) : undefined,

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
            }
        }

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

            // TODO Process toast and alert requests - can also be requested via msg._ui
            if ( msg._uib.componentRef === 'globalNotification' ) { }
            if ( msg._uib.componentRef === 'globalAlert' ) { }
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
                    this._send({
                        'uibuilderCtrl': 'ready for content',
                        'cacheControl': 'REPLAY',
                    }, this._ioChannels.control)
                }

                break
            }

            default: {
                log('trace', `uibuilderfe:ioSetup:${this._ioChannels.control}`, `Received ${receivedCtrlMsg.uibuilderCtrl} from server`)
                // Anything else to do for other control msgs?
            }

        } // ---- End of process control msg types ---- //

    } // -- End of websocket receive CONTROL msg from Node-RED -- //

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
     * @returns {boolean} Whether or not Socket.IO is connected to uibuilder in Node-RED
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
        // How many times has the client (re)connected since page load
        this.socketOptions.auth.connectedNum = this.#connectedNum
        //#endregion --- ---- ---

        // Create the socket - make sure client uses Socket.IO version from the uibuilder module (using path)
        log('trace', 'Uib:ioSetup', `About to create IO object. Transports: [${this.socketOptions.transports.join(', ')}]`)()
        this._socket = io(this.ioNamespace, this.socketOptions)

        /** When the socket is connected - set ioConnected flag and reset connect timer  */
        this._socket.on('connect', () => {

            this.#connectedNum++
            this.socketOptions.auth.connectedNum = this.#connectedNum
            log('info', 'Uib:ioSetup', `✅ SOCKET CONNECTED. Connection count: ${this.#connectedNum}\nNamespace: ${this.ioNamespace}`)()
            this._dispatchCustomEvent('uibuilder:socket:connected', this.#connectedNum)

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

        /** Client ID set by uibuilder */
        this.clientId = this.cookies['uibuilder-client-id']
        log('trace', 'Uib:constructor', 'Client ID: ', this.clientId)()

        this.ioNamespace = this._getIOnamespace()

        //#region - Try to make sure client uses Socket.IO client version from the uibuilder module (using cookie or path) @since v2.0.0 2019-02-24 allows for httpNodeRoot

        /** httpNodeRoot (to set path) */
        if ('uibuilder-webRoot' in this.cookies) {
            this.httpNodeRoot = this.cookies['uibuilder-webRoot']
            log('trace', 'Uib:constructor', `httpNodeRoot set by cookie to "${this.httpNodeRoot}"`)()
        } else {
            // split current url path, eliminate any blank elements and trailing or double slashes
            const fullPath = window.location.pathname.split('/').filter(function (t) { return t.trim() !== '' })
            /** handle url includes file name - @since v2.0.5 Extra check for 0 length, Issue #73. */
            if (fullPath.length > 0 && fullPath[fullPath.length - 1].endsWith('.html')) fullPath.pop()
            fullPath.pop() // gives the last path section of the url
            this.httpNodeRoot = '/' + fullPath.join('/')
            log('trace', '[Uib:constructor]', `httpNodeRoot set by URL parsing to "${this.httpNodeRoot}". NOTE: This may fail for pages in sub-folders.`)()
        }
        this.ioPath = urlJoin(this.httpNodeRoot, Uib._meta.displayName, 'vendor', 'socket.io')
        log('trace', 'Uib:constructor', `ioPath: "${this.ioPath}"`)()

        //#endregion

        // Work out pageName
        this.pageName = window.location.pathname.replace(`${this.ioNamespace}/`, '')
        if ( this.pageName.endsWith('/') ) this.pageName += 'index.html'
        if ( this.pageName === '' ) this.pageName = 'index.html'

        log('trace', 'Uib:constructor', 'Ending')()
    }

    // TODO Add option to override auto-loading of stylesheet
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
            if (options.ioNamespace !== undefined && options.ioNamespace !== null && options.ioNamespace !== '') this.ioNamespace = options.ioNamespace
            if (options.ioPath !== undefined && options.ioPath !== null && options.ioPath !== '') this.ioPath = options.ioPath
        }

        // Do we need to load styles?
        if ( document.styleSheets.length > 1 || (document.styleSheets.length === 0 && document.styleSheets[0].cssRules.length === 0) ) {
            log('info', 'Uib:start', 'Styles already loaded so not loading uibuilder default styles.')()
        } else {
            log('info', 'Uib:start', 'No styles loaded, loading uibuilder default styles.')()
            this.loadStyleSrc(`${this.httpNodeRoot}/uibuilder/uib-brand.css`)
        }

        // Handle specialist messages like reload and _ui -> Moved to _msgRcvdEvents

        // Track last browser navigation type: navigate, reload, back_forward, prerender
        const [entry] = performance.getEntriesByType('navigation')
        this.set('lastNavType', entry.type)

        // Start up (or restart) Socket.IO connections and listeners. Returns false if io not found
        this.started = this._ioSetup()

        if ( this.started === true ) {
            log('trace', 'Uib:start', 'Start completed. Socket.IO client library loaded.')()
        } else {
            log('error', 'Uib:start', 'Start completed. ERROR: Socket.IO client library NOT LOADED.')()
        }

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

if (!window['$']) {
    window['$'] = document.querySelector.bind(document)
} else {
    log('warn', 'uibuilder.module.js', 'Cannot allocate the global `$`, it is already in use')
}

// Can import as `import uibuilder from ...` OR `import {uibuilder} from ...`
export { uibuilder }
export default uibuilder

// Attempt to run start fn
uibuilder.start()

//#endregion --- Wrap up ---

// EOF
