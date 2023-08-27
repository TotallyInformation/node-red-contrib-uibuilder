/* eslint-disable sonarjs/no-duplicate-string */
/** Send an update to a specific front-end element.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2023-2023 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs - should help with coding ---
 * @typedef {import('../../typedefs').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs').uibHtmlNode} uibHtmlNode <= Change this to be specific to this node
 */

//#region ----- Module level variables ---- //

const jsdom = require("jsdom");
const { JSDOM } = jsdom

//#region --- Log util - needed for the ui class ---
/** Default log level - Error & Warn */
let logLevel = 5 // isMinified ? 0 : 1  // When using minified lib, assume production and only log errors otherwise also log warn
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

// Ui class copied from src/front-end-module/ui.js
const Ui = class Ui {
    // Reference to DOM window
    window
    document

    static log
    
    /** Called when `new Ui(...)` is called
     * @param {*} extLog A fn that returns a fn for logging
     * @param {*} jsonHighlight A function that returns a highlighted HTML of JSON input
     */
    constructor(extLog, jsonHighlight, win) {
        if (extLog) Ui.log = extLog
        else Ui.log = function(){}

        if (win) this.window = win
        else {
            Ui.log(0, 'Ui:constructor', 'Current environment does not include `window`, UI functions cannot be used.')()
            return
        }

        this.document = this.window.document

        if (jsonHighlight) this.syntaxHighlight = jsonHighlight
        else this.syntaxHighlight = function(){}
    }

    /** Directly manage UI via JSON
     * @param {object} json Either an object containing {_ui: {}} or simply simple {} containing ui instructions
     */
    ui(json) {
        // Simulate a msg and process
        let msg = {}
        if (json._ui) msg = json
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
        if (!el) return

        // If DOMPurify is loaded, apply it now
        if (this.window['DOMPurify']) component.slot = this.window['DOMPurify'].sanitize(component.slot)
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
        if (!el) return
        if (!this.window['markdownit']) return
        if (!component.slotMarkdown) return

        const opts = { // eslint-disable-line object-shorthand
            html: true,
            linkify: true,
            _highlight: true,
            langPrefix: 'language-',
            highlight(str, lang) {
                if (lang && this.window['hljs'] && this.window['hljs'].getLanguage(lang)) {
                    try {
                        return `<pre class="highlight" data-language="${lang.toUpperCase()}">
                                <code class="language-${lang}">${this.window['hljs'].highlightAuto(str).value}</code></pre>`
                    } finally { } // eslint-disable-line no-empty
                }
                return `<pre class="highlight"><code>${md.utils.escapeHtml(str)}</code></pre>`
            },
        }
        const md = this.window['markdownit'](opts)
        // Convert from markdown to HTML
        component.slotMarkdown = md.render(component.slotMarkdown)
        // If DOMPurify is loaded, apply it now
        if (this.window['DOMPurify']) component.slotMarkdown = this.window['DOMPurify'].sanitize(component.slotMarkdown)
        // Set the component content to the the converted slotMarkdown property
        el.innerHTML = component.slotMarkdown
    }

    /** Attach a new remote script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the script src attribute
     */
    loadScriptSrc(url) {
        const newScript = this.document.createElement('script')
        newScript.src = url
        newScript.async = false
        this.document.head.appendChild(newScript)
    }

    /** Attach a new remote stylesheet link to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the style link href attribute
     */
    loadStyleSrc(url) {
        const newStyle = this.document.createElement('link')
        newStyle.href = url
        newStyle.rel = 'stylesheet'
        newStyle.type = 'text/css'

        this.document.head.appendChild(newStyle)
    }

    /** Attach a new text script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a script
     */
    loadScriptTxt(textFn) {
        const newScript = this.document.createElement('script')
        newScript.async = false
        newScript.textContent = textFn
        this.document.head.appendChild(newScript)
    }

    /** Attach a new text stylesheet to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a stylesheet
     */
    loadStyleTxt(textFn) {
        const newStyle = this.document.createElement('style')
        newStyle.textContent = textFn
        this.document.head.appendChild(newStyle)
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
    showDialog(type, ui, msg) { // eslint-disable-line sonarjs/cognitive-complexity

        //#region -- Check properties --

        let content = ''
        // Main body content
        if (msg.payload && typeof msg.payload === 'string') content += msg.payload
        if (ui.content) content += ui.content
        // Toast wont show anyway if content is empty, may as well warn user
        if (content === '') {
            log(1, 'Ui:showDialog', 'Toast content is blank. Not shown.')()
            return
        }

        // Use msg.topic as title if no title provided
        if (!ui.title && msg.topic) ui.title = msg.topic
        if (ui.title) content = `<p class="toast-head">${ui.title}</p><p>${content}</p>`

        // Allow for variants - @since v6.1 - don't bother - since this now sets CSS class, not tied to bootstrap-vue
        // if ( !ui.variant || !['', 'primary', 'secondary', 'success', 'info', 'warn', 'warning', 'failure', 'error', 'danger'].includes(ui.variant)) ui.variant = ''

        // Toasts auto-hide by default after 10s but alerts do not auto-hide
        if (ui.noAutohide) ui.noAutoHide = ui.noAutohide
        if (ui.noAutoHide) ui.autohide = !ui.noAutoHide
        // If set, number of ms until toast is auto-hidden
        if (ui.autoHideDelay) {
            if (!ui.autohide) ui.autohide = true
            ui.delay = ui.autoHideDelay
        } else ui.autoHideDelay = 10000 // default = 10s
        if (!Object.prototype.hasOwnProperty.call(ui, 'autohide')) ui.autohide = true

        if (type === 'alert') {
            ui.modal = true
            ui.autohide = false
            content = `<svg viewBox="0 0 192.146 192.146" style="width:30;background-color:transparent;"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg> ${content}`
        }

        //#endregion -- -- --

        // Create a toaster container element if not already created - or get a ref to it
        let toaster = this.document.getElementById('toaster')
        if (toaster === null) {
            toaster = this.document.createElement('div')
            toaster.id = 'toaster'
            toaster.title = 'Click to clear all notifcations'
            toaster.setAttribute('class', 'toaster')
            toaster.setAttribute('role', 'dialog')
            toaster.setAttribute('arial-label', 'Toast message')
            toaster.onclick = function () {
                // @ts-ignore
                toaster.remove()
            }
            this.document.body.insertAdjacentElement('afterbegin', toaster)
        }

        // Create a toast element. Would be nice to use <dialog> but that isn't well supported yet - come on Apple!
        const toast = this.document.createElement('div')
        toast.title = 'Click to clear this notifcation'
        toast.setAttribute('class', `toast ${ui.variant ? ui.variant : ''} ${type}`)
        toast.innerHTML = content
        toast.setAttribute('role', 'alertdialog')
        if (ui.modal) toast.setAttribute('aria-modal', ui.modal)
        toast.onclick = function (evt) {
            evt.stopPropagation()
            toast.remove()
            // @ts-ignore
            if (toaster.childElementCount < 1) toaster.remove()
        }

        // TODO
        if (type === 'alert') {
            // newD.setAttribute('aria-labelledby', '')
            // newD.setAttribute('aria-describedby', '')
        }

        toaster.insertAdjacentElement(ui.appendToast === true ? 'beforeend' : 'afterbegin', toast)

        // Auto-hide
        if (ui.autohide === true) {
            setInterval(() => {
                toast.remove()
                // @ts-ignore
                if (toaster.childElementCount < 1) toaster.remove()
            }, ui.autoHideDelay)
        }

    } // --- End of showDialog ---

    /** Show a browser notification if the browser and the user allows it
     * @param {object} config Notification config data
     * @returns {Promise} Resolves on close or click event, returns the event.
     */
    _showNotification(config) {
        if ( config.topic && !config.title ) config.title = config.topic
        if ( !config.title ) config.title = 'uibuilder notification'
        if ( config.payload && !config.body ) config.body = config.payload
        if ( !config.body ) config.body = ' No message given.'
        // Wrap in try/catch since Chrome Android may throw an error
        try {
            const notify = new Notification(config.title, config)
            return new Promise( (resolve, reject) => {
                // Doesn't ever seem to fire (at least in Chromium)
                notify.addEventListener('close', ev => {
                    ev.currentTarget.userAction = 'close'
                    resolve(ev)
                })
                notify.addEventListener('click', ev => {
                    ev.currentTarget.userAction = 'click'
                    resolve(ev)
                })
                notify.addEventListener('error', ev => {
                    ev.currentTarget.userAction = 'error'
                    reject(ev)
                })
            })
        } catch (e) {
            return Promise.reject(new Error('Browser refused to create a Notification'))
        }
    }

    /** Show a browser notification if possible. Returns a promise
     * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
     * or a Notifications API options object + config.title string.
     * Config ref: https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
     * @param {object|string} config Notification config object or simple message string
     * @returns {Promise} Resolves on close or click event, returns the event.
     */
    async notification(config) {
        if (typeof config === 'string') {
            config = { body: config }
        }
        // Are notifications available?
        if (typeof Notification === 'undefined') return Promise.reject(new Error('Notifications not available in this browser'))
        // Do we have permission? If not, ask for permission
        let permit = Notification.permission
        if (permit === 'denied') {
            return Promise.reject(new Error('Notifications not permitted by user')) // eslint-disable-line no-useless-return
        } else if (permit === 'granted') {
            return this._showNotification(config)
        } else { // if (permit === 'default') {
            permit = await Notification.requestPermission()
            if (permit === 'granted') {
                return this._showNotification(config)
            }
            return Promise.reject(new Error('Notifications not permitted by user'))
        }
    }

    /** Load a dynamic UI from a JSON web reponse
     * @param {string} url URL that will return the ui JSON
     */
    loadui(url) {
        if (!fetch) {
            log(0, 'Ui:loadui', 'Current environment does not include `fetch`, skipping.')()
            return
        }
        if (!url) {
            log(0, 'Ui:loadui', 'url parameter must be provided, skipping.')()
            return
        }

        fetch(url)
            .then(response => {
                if (response.ok === false) {
                    // log('warn', 'Ui:loadui:then1', `Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)()
                    throw new Error(`Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)
                }

                log('trace', 'Ui:loadui:then1', `Loaded '${url}'. Status ${response.status}, ${response.statusText}`)()
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
                    log('trace', 'Ui:loadui:then2', 'Parsed JSON successfully obtained')()
                    // Call the _uiManager
                    this._uiManager({ _ui: data })
                    return true
                }
                return false
            })
            .catch(err => {
                log('warn', 'Ui:loadui:catch', 'Error. ', err)()
            })
    } // --- end of loadui

    // Namespaces - See https://stackoverflow.com/a/52572048/1309986
    // const NAMESPACES = {
    //     svg: 'http://www.w3.org/2000/svg',
    //     html: 'http://www.w3.org/1999/xhtml',
    //     xml: 'http://www.w3.org/XML/1998/namespace',
    //     xlink: 'http://www.w3.org/1999/xlink',
    //     xmlns: 'http://www.w3.org/2000/xmlns/' // sic for the final slash...
    // }

    /** Enhance an HTML element that is being composed with ui data
     *  such as ID, attribs, event handlers, custom props, etc.
     * @param {*} el HTML Element to enhance
     * @param {*} comp Individual uibuilder ui component spec
     */
    _uiComposeComponent(el, comp) {
        // Add attributes
        if (comp.attributes) {
            Object.keys(comp.attributes).forEach((attrib) => {
                // For values, set the actual value as well since the attrib only changes the DEFAULT value
                if (attrib === 'value') el.value = comp.attributes[attrib]

                if (attrib.startsWith('xlink:')) el.setAttributeNS('http://www.w3.org/1999/xlink', attrib, comp.attributes[attrib])
                else el.setAttribute(attrib, comp.attributes[attrib])
            })
        }

        // ID if set
        if (comp.id) el.setAttribute('id', comp.id)

        // If an SVG tag, ensure we have the appropriate namespaces added
        if (comp.type === 'svg') {
            el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg')
            el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink')
        }

        // Add event handlers
        if (comp.events) {
            Object.keys(comp.events).forEach((type) => {
                // @ts-ignore  I'm forever getting this wrong!
                if (type.toLowerCase === 'onclick') type = 'click'
                // Add the event listener
                try {
                    el.addEventListener(type, (evt) => {
                        // Use new Function to ensure that esbuild works: https://esbuild.github.io/content-types/#direct-eval
                        (new Function('evt', `${comp.events[type]}(evt)`))(evt) // eslint-disable-line no-new-func
                    })
                    // newEl.setAttribute( 'onClick', `${comp.events[type]}()` )
                } catch (err) {
                    log('error', 'Ui:_uiComposeComponent', `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)()
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

        // TODO Add multi-slot capability (default slot must always be processed first as innerHTML is replaced)

        //#region Add Slot Markdown content to innerHTML IF marked library is available
        if (comp.slotMarkdown) {
            this.replaceSlotMarkdown(el, comp)
        }
        //#endregion
    }

    uiEnhanceElement(el, comp) {
        this._uiComposeComponent(el, comp)
    }

    /** Extend an HTML Element with appended elements using ui components
     * NOTE: This fn follows a strict hierarchy of added components.
     * @param {HTMLElement} parentEl The parent HTML Element we want to append to
     * @param {*} components The ui component(s) we want to add
     * @param {string} [ns] Optional. The namespace to use.
     */
    _uiExtendEl(parentEl, components, ns = '') {
        components.forEach((compToAdd, i) => {
            log('trace', `Ui:_uiExtendEl:components-forEach:${i}`, compToAdd)()

            /** @type {HTMLElement} Create the new component */
            let newEl

            compToAdd.ns = ns

            if (compToAdd.ns === 'html') {
                newEl = parentEl
                // newEl.outerHTML = compToAdd.slot
                parentEl.innerHTML = compToAdd.slot
            } else if (compToAdd.ns === 'svg') {
                newEl = this.document.createElementNS('http://www.w3.org/2000/svg', compToAdd.type)
                // Updates newEl
                this._uiComposeComponent(newEl, compToAdd)
                parentEl.appendChild(newEl)
            } else {
                newEl = this.document.createElement(compToAdd.type === 'html' ? 'div' : compToAdd.type)
                // Updates newEl
                this._uiComposeComponent(newEl, compToAdd)
                parentEl.appendChild(newEl)
            }

            // If nested components, go again - but don't pass payload to sub-components
            if (compToAdd.components) {
                this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns)
            }
        })
    }

    // Vue dynamic inserts Don't really work ...
    // _uiAddVue(ui, isRecurse) {

    //     // must be Vue
    //     // must have only 1 root element
    //     const compToAdd = ui.components[0]
    //     const newEl = this.document.createElement(compToAdd.type)

    //     if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload
    //     this._uiComposeComponent(newEl, compToAdd)

    //     // If nested components, go again - but don't pass payload to sub-components
    //     if (compToAdd.components) {
    //         this._uiExtendEl(newEl, compToAdd.components)
    //     }

    //     console.log('MAGIC: ', this.magick, newEl, newEl.outerHTML)()
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
        log('trace', 'Ui:_uiManager:add', 'Starting _uiAdd')()

        // Vue dynamic inserts Don't really work ...
        // if (this.#isVue && !isRecurse) {
        //     this._uiAddVue(ui, false)
        //     return
        // }

        ui.components.forEach((compToAdd, i) => {
            log('trace', `Ui:_uiAdd:components-forEach:${i}`, 'Component to add: ', compToAdd)()

            /** @type {*} Create the new component - some kind of HTML element */
            let newEl
            switch (compToAdd.type) {
                // If trying to insert raw html, wrap in a div
                case 'html': {
                    compToAdd.ns = 'html'
                    newEl = this.document.createElement('div')
                    break
                }

                // If trying to insert raw svg, need to create in namespace
                case 'svg': {
                    compToAdd.ns = 'svg'
                    newEl = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                    break
                }

                default: {
                    compToAdd.ns = 'dom'
                    newEl = this.document.createElement(compToAdd.type)
                    break
                }
            }

            if (!compToAdd.slot && ui.payload) compToAdd.slot = ui.payload

            // const parser = new DOMParser()
            // const newDoc = parser.parseFromString(compToAdd.slot, 'text/html')
            // console.log(compToAdd, newDoc.body)()

            this._uiComposeComponent(newEl, compToAdd)

            /** @type {HTMLElement} Where to add the new element? */
            let elParent
            if (compToAdd.parentEl) {
                elParent = compToAdd.parentEl
            } else if (ui.parentEl) {
                elParent = ui.parentEl
            } else if (compToAdd.parent) {
                elParent = this.document.querySelector(compToAdd.parent)
            } else if (ui.parent) {
                elParent = this.document.querySelector(ui.parent)
            }
            if (!elParent) {
                log('info', 'Ui:_uiAdd', 'No parent found, adding to body')()
                elParent = this.document.querySelector('body')
            }

            if (compToAdd.position && compToAdd.position === 'first') {
                // Insert new el before the first child of the parent. Ref: https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore#example_3
                elParent.insertBefore(newEl, elParent.firstChild)
            } else if (compToAdd.position && Number.isInteger(Number(compToAdd.position))) {
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
                this._uiExtendEl(newEl, compToAdd.components, compToAdd.ns)
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
            if (all !== true) els = [this.document.querySelector(compToRemove)]
            else els = this.document.querySelectorAll(compToRemove)

            els.forEach(el => {
                try {
                    el.remove()
                } catch (err) {
                    // Could not remove. Cannot read properties of null <= no need to report this one
                    // Could not remove. Failed to execute 'querySelector' on 'this.document': '##testbutton1' is not a valid selector
                    log('trace', 'Ui:_uiRemove', `Could not remove. ${err.message}`)()
                }
            })
        })
    } // --- end of _uiRemove ---

    /** Handle incoming _ui replace requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiReplace(ui) {
        log('trace', 'Ui:_uiReplace', 'Starting')()

        ui.components.forEach((compToReplace, /** @type {number} */ i) => {
            log('trace', `Ui:_uiReplace:components-forEach:${i}`, 'Component to replace: ', compToReplace)()

            /** @type {HTMLElement} */
            let elToReplace

            // Either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. FIRST element matching is updated.
            if (compToReplace.id) {
                elToReplace = this.document.getElementById(compToReplace.id) // .querySelector(`#${compToReplace.id}`)
            } else if (compToReplace.selector || compToReplace.select) {
                elToReplace = this.document.querySelector(compToReplace.selector)
            } else if (compToReplace.name) {
                elToReplace = this.document.querySelector(`[name="${compToReplace.name}"]`)
            } else if (compToReplace.type) {
                elToReplace = this.document.querySelector(compToReplace.type)
            }

            log('trace', `Ui:_uiReplace:components-forEach:${i}`, 'Element to replace: ', elToReplace)()

            // Nothing was found so ADD the element instead
            if (elToReplace === undefined || elToReplace === null) {
                log('trace', `Ui:_uiReplace:components-forEach:${i}:noReplace`, 'Cannot find the DOM element. Adding instead.', compToReplace)()
                this._uiAdd({ components: [compToReplace] }, false)
                return
            }

            /** @type {*} Create the new component - some kind of HTML element */
            let newEl
            switch (compToReplace.type) {
                // If trying to insert raw html, wrap in a div
                case 'html': {
                    compToReplace.ns = 'html'
                    newEl = this.document.createElement('div')
                    break
                }

                // If trying to insert raw svg, need to create in namespace
                case 'svg': {
                    compToReplace.ns = 'svg'
                    newEl = this.document.createElementNS('http://www.w3.org/2000/svg', 'svg')
                    break
                }

                default: {
                    compToReplace.ns = 'dom'
                    newEl = this.document.createElement(compToReplace.type)
                    break
                }
            }

            // Updates the newEl and maybe the ui
            this._uiComposeComponent(newEl, compToReplace)

            // Replace the current element
            elToReplace.replaceWith(newEl)

            // If nested components, go again - but don't pass payload to sub-components
            if (compToReplace.components) {
                this._uiExtendEl(newEl, compToReplace.components, compToReplace.ns)
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
        log('trace', 'Ui:_uiManager:update', 'Starting _uiUpdate')()

        // We allow an update not to actually need to spec a component
        if (!ui.components) ui.components = [Object.assign({}, ui)]

        ui.components.forEach((compToUpd, i) => {
            log('trace', '_uiUpdate:components-forEach', `Component #${i}`, compToUpd)()

            /** @type {NodeListOf<Element>} */
            let elToUpd

            // Either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. ALL elements matching are updated.
            if (compToUpd.id) {
                // NB We don't use get by id because this way the code is simpler later on
                elToUpd = this.document.querySelectorAll(`#${compToUpd.id}`)
            } else if (compToUpd.selector || compToUpd.select) {
                elToUpd = this.document.querySelectorAll(compToUpd.selector)
            } else if (compToUpd.name) {
                elToUpd = this.document.querySelectorAll(`[name="${compToUpd.name}"]`)
            } else if (compToUpd.type) {
                elToUpd = this.document.querySelectorAll(compToUpd.type)
            }

            // @ts-ignore Nothing was found so give up
            if (elToUpd === undefined || elToUpd.length < 1) {
                log('warn', 'Ui:_uiManager:update', 'Cannot find the DOM element. Ignoring.', compToUpd)()
                return
            }

            log('trace', '_uiUpdate:components-forEach', `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)()

            // If slot not specified but payload is, use the payload in the slot
            if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload

            // Might have >1 element to update - so update them all
            elToUpd.forEach(el => {
                this._uiComposeComponent(el, compToUpd)
            })

            // If nested components, go again - but don't pass payload to sub-components
            if (compToUpd.components) {
                elToUpd.forEach(el => {
                    log('trace', '_uiUpdate:components', 'el', el)()
                    this._uiUpdate({
                        method: ui.method,
                        parentEl: el,
                        components: compToUpd.components,
                    })
                })
            }

        })

    } // --- end of _uiUpdate ---

    // TODO Add more error handling and parameter validation
    /** Handle incoming _ui load requests
     * Can load JavaScript modules, JavaScript scripts and CSS.
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
        log('trace', 'Ui:uiManager:reload', 'reloading')()
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
                log('error', 'Ui:_uiManager', `No method defined for msg._ui[${i}]. Ignoring`)()
                return
            }

            ui.payload = msg.payload
            ui.topic = msg.topic
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
                    log('error', 'Ui:_uiManager', `Invalid msg._ui[${i}].method (${ui.method}). Ignoring`)()
                    break
                }
            }
        })

    } // --- end of _uiManager ---

    /** Get standard data from a DOM node.
     * @param {*} node DOM node to examine
     * @param {string} cssSelector Identify the DOM element to get data from
     * @returns {object} Standardised data object
     */
    nodeGet(node, cssSelector) {
        const thisOut = {
            id: node.id === '' ? undefined : node.id,
            name: node.name,
            children: node.childNodes.length,
            type: node.nodeName,
            attributes: undefined,

            isUserInput: node.validity ? true : false, // eslint-disable-line no-unneeded-ternary
            userInput: !node.validity ? undefined : { // eslint-disable-line multiline-ternary
                value: node.value,
                validity: undefined,
                willValidate: node.willValidate,
                valueAsDate: node.valueAsDate,
                valueAsNumber: node.valueAsNumber,
                type: node.type,
            },
        }

        if (['UL', 'OL'].includes(node.nodeName)) {
            const listEntries = this.document.querySelectorAll(`${cssSelector} li`)
            if (listEntries) {
                thisOut.list = {
                    'entries': listEntries.length
                }
            }
        }
        if (node.nodeName === 'DL') {
            const listEntries = this.document.querySelectorAll(`${cssSelector} dt`)
            if (listEntries) {
                thisOut.list = {
                    'entries': listEntries.length
                }
            }
        }
        if (node.nodeName === 'TABLE') {
            const bodyEntries = this.document.querySelectorAll(`${cssSelector} > tbody > tr`)
            const headEntries = this.document.querySelectorAll(`${cssSelector} > thead > tr`)
            const cols = this.document.querySelectorAll(`${cssSelector} > tbody > tr:last-child > *`)  // #eltest > table > tbody > tr:nth-child(3)
            if (bodyEntries || headEntries || cols) {
                thisOut.table = {
                    'headRows': headEntries ? headEntries.length : 0,
                    'bodyRows': bodyEntries ? bodyEntries.length : 0,
                    'columns': cols ? cols.length : 0,
                }
            }
        }
        if (node.nodeName !== '#text' && node.attributes && node.attributes.length > 0) {
            thisOut.attributes = {}
            // @ts-ignore
            for (const attrib of node.attributes) {
                if (attrib.name !== 'id') {
                    thisOut.attributes[attrib.name] = node.attributes[attrib.name].value
                }
            }
        }
        if (node.nodeName === '#text') {
            thisOut.text = node.textContent
        }
        if (node.validity) thisOut.userInput.validity = {}
        for (const v in node.validity) {
            thisOut.userInput.validity[v] = node.validity[v]
        }

        return thisOut
    } // --- end of nodeGet --- //

    /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
     * @param {string} cssSelector Identify the DOM element to get data from
     * @param {string} [propName] Optional. Specific name of property to get from the element
     * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
     */
    uiGet(cssSelector, propName = null) {
        // The type cast below not really correct but it gets rid of the other typescript errors
        const selection = /** @type {NodeListOf<HTMLInputElement>} */ (this.document.querySelectorAll(cssSelector))

        const out = []

        selection.forEach(node => {
            // Specific property asked for ...
            if (propName !== null && propName !== '') {
                // Try assuming the prop is an attribute first (will return null or "" if not present)
                let prop = node.getAttribute(propName)
                // If not an attribute, try getting as a property of the element
                if (prop === undefined || prop === null) {
                    try {
                        prop = node[propName]
                    } catch (error) {}
                }
                // We didn't find as either an attribute or a property
                if (prop === undefined || prop === null) {
                    // If 'value' was requested, return the innerText
                    if (propName.toLowerCase() === 'value') out.push(node.innerText)
                    else out.push(`Property '${propName}' not found`)
                } else {
                    // Nightmare of different object types in a DOM Element!
                    if (prop.constructor.name === 'NamedNodeMap') { // Attributes
                        const p = {}
                        for (const key of prop) {
                            // @ts-ignore
                            p[key.name] = prop[key.name].value
                        }
                        out.push(p)
                    } else if (!prop.constructor.name.toLowerCase().includes('map')) { // Ordinary properties
                        out.push({
                            [propName]: prop
                        })
                    } else { // Other MAP types
                        const p = {}
                        // @ts-ignore
                        for (const key in prop) {
                            p[key] = prop[key]
                        }
                        out.push(p)
                    }
                }

            } else { // Otherwise, grab everything useful
                out.push(this.nodeGet(node, cssSelector))
            }
        })

        return out
    } // --- end of uiGet --- //

    /** Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
     * Wraps the included object in a div tag.
     * PDF's, text or unknown MIME types are also wrapped in an iFrame.
     * @param {string} url The URL of the source file to include
     * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
     * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
     * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
     * @returns {Promise<any>} Status
     */
    async include(url, uiOptions) { // eslint-disable-line sonarjs/cognitive-complexity
        // TODO: src, id, parent must all be a strings
        if (!fetch) {
            log(0, 'Ui:include', 'Current environment does not include `fetch`, skipping.')()
            return 'Current environment does not include `fetch`, skipping.'
        }
        if (!url) {
            log(0, 'Ui:include', 'url parameter must be provided, skipping.')()
            return 'url parameter must be provided, skipping.'
        }
        if (!uiOptions || !uiOptions.id) {
            log(0, 'Ui:include', 'uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.')()
            return 'uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.'
        }

        // Try to get the content via the URL
        let response
        try {
            response = await fetch(url)
        } catch (error) {
            log(0, 'Ui:include', `Fetch of file '${url}' failed. `, error.message)()
            return error.message
        }
        if (!response.ok) {
            log(0, 'Ui:include', `Fetch of file '${url}' failed. Status='${response.statusText}'`)()
            return response.statusText
        }

        // Work out what type of data we got
        const contentType = await response.headers.get('content-type')
        let type = null
        if (contentType) {
            if (contentType.includes('text/html')) {
                type = 'html'
            } else if (contentType.includes('application/json')) {
                type = 'json'
            } else if (contentType.includes('multipart/form-data')) {
                type = 'form'
            } else if (contentType.includes('image/')) {
                type = 'image'
            } else if (contentType.includes('video/')) {
                type = 'video'
            } else if (contentType.includes('application/pdf')) {
                type = 'pdf'
            } else if (contentType.includes('text/plain')) {
                type = 'text'
            } // else type = null
        }

        // Create the HTML to include on the page based on type
        let slot = ''
        let txtReturn = 'Include successful'
        let data
        switch (type) {
            case 'html': {
                data = await response.text()
                slot = data
                break
            }

            case 'json': {
                data = await response.json()
                slot = '<pre class="syntax-highlight">'
                slot += this.syntaxHighlight(data)
                slot += '</pre>'
                break
            }

            case 'form': {
                data = await response.formData()
                slot = '<pre class="syntax-highlight">'
                slot += this.syntaxHighlight(data)
                slot += '</pre>'
                break
            }

            case 'image': {
                data = await response.blob()
                slot = `<img src="${URL.createObjectURL(data)}">`
                if (this.window['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    log('warn', 'Ui:include:image', txtReturn)()
                }
                break
            }

            case 'video': {
                data = await response.blob()
                slot = `<video controls autoplay><source src="${URL.createObjectURL(data)}"></video>`
                if (this.window['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    log('warn', 'Ui:include:video', txtReturn)()
                }
                break
            }

            case 'pdf':
            case 'text':
            default: {
                data = await response.blob()
                slot = `<iframe style="resize:both;width:inherit;height:inherit;" src="${URL.createObjectURL(data)}">`
                if (this.window['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    log('warn', `Ui:include:${type}`, txtReturn)()
                }
                break
            }
        }

        // Wrap it all in a <div id="..." class="included">
        uiOptions.type = 'div'
        uiOptions.slot = slot
        if (!uiOptions.parent) uiOptions.parent = 'body'
        if (!uiOptions.attributes) uiOptions.attributes = { class: 'included' }

        // Use uibuilder's standard ui processing to turn the instructions into HTML
        this._uiReplace({
            components: [
                uiOptions
            ]
        })

        log('trace', `Ui:include:${type}`, txtReturn)()
        return txtReturn

    } // ---- End of include() ---- //

}


/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {runtimeRED|undefined} Reference to the master RED instance */
    RED: undefined,
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-html', // Note that 'uib-update' will be replaced with actual node-name. Do not forget to also add to package.json
}

//#endregion ----- Module level variables ---- //

//#region ----- Module-level support functions ----- //

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibHtmlNode}
 */
async function inputMsgHandler(msg, send, done) { // eslint-disable-line no-unused-vars

    // const RED = mod.RED

    // If msg has _ui property - is it from the client? If so, remove it.
    if (msg._ui && msg._ui.from && msg._ui.from === 'client') delete msg._ui

    if (msg._ui) {
        const dom = new JSDOM(/*html*/`<!DOCTYPE html>`)

        // Create instance of ui class
        const ui = new Ui(log, null, dom.window)

        // Updates the virtual DOM
        ui.ui(msg._ui)

        console.log(Object.keys(msg))

        // Copy the input msg
        const out = {...msg}
        // remove _ui
        delete out._ui

        // Add the topic defined in the editor if not supplied by the msg
        if (!msg.topic && this.topic) out.topic = this.topic

        // add the HTML
        try {
            out.payload = dom.serialize()
        } catch (err) {
            mod.RED.log.error(`[uib-html:inputMsgHandler] Cannot serialise the DOM. ${err.message} `, err)
        }
        
        // And send it on its way
        send(out)

        // Make sure that the v DOM is closed down
        dom.window.close()
    }

    // We are done
    done()
} // ----- end of inputMsgHandler ----- //

/** 2) This is run when an actual instance of our node is committed to a flow
 * type {function(this:runtimeNode&senderNode, runtimeNodeConfig & senderNode):void}
 * @param {runtimeNodeConfig & uibHtmlNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibHtmlNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use mod.RED if you prefer:
    const RED = mod.RED
    if (RED === null) return

    // @ts-ignore Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.name = config.name ?? ''
    this.topic = config.topic ?? ''

    // this.tagSource = config.tag ?? ''
    // this.tagSourceType = config.tagSourceType ?? 'str'
    // this.tag = undefined

    // this.elementIdSource = config.elementId ?? ''
    // this.elementIdSourceType = config.elementIdSourceType ?? 'str'
    // this.elementId = undefined

    // this.parentSource = config.parent ?? 'body'
    // this.parentSourceType = config.parentSourceType ?? 'str'
    // this.parent = undefined

    // this.positionSource = config.position ?? 'body'
    // this.positionSourceType = config.positionSourceType ?? 'str'
    // this.position = undefined

    // this.slotContentSource = config.slotSourceProp ?? ''
    // this.slotContentSourceType = config.slotSourcePropType ?? 'msg'
    // this.slotContent = undefined

    // this.slotPropMarkdown = config.slotPropMarkdown ?? false

    // this.attribsSource = config.attribsSource ?? ''
    // this.attribsSourceType = config.attribsSourceType ?? 'msg'

    this._ui = undefined // set in buildUI()

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)
} // ---- End of nodeInstance ---- //

//#endregion ----- Module-level support functions ----- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    mod.RED = RED

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance)
}

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition

// EOF
