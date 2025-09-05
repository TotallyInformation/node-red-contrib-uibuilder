// @ts-nocheck
/* Creates HTML UI's based on a standardised data input.
  Works stand-alone, with uibuilder or with Node.js/jsdom.
  See: https://totallyinformation.github.io/node-red-contrib-uibuilder/#/client-docs/config-driven-ui

  Author: Julian Knight (Totally Information), March 2023

  License: Apache 2.0
  Copyright (c) 2022-2025 Julian Knight (Totally Information)

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

// Namespaces - See https://stackoverflow.com/a/52572048/1309986
// const NAMESPACES = {
//     svg: 'http://www.w3.org/2000/svg',
//     html: 'http://www.w3.org/1999/xhtml',
//     xml: 'http://www.w3.org/XML/1998/namespace',
//     xlink: 'http://www.w3.org/1999/xlink',
//     xmlns: 'http://www.w3.org/2000/xmlns/' // sic for the final slash...
// }

import { showOverlay } from './libs/show-overlay.mjs'

const Ui = class Ui {
    // #region --- Class variables ---
    version = '7.5.0-src'

    // List of tags and attributes not in sanitise defaults but allowed in uibuilder.
    sanitiseExtraTags = ['uib-var']
    sanitiseExtraAttribs = ['variable', 'report', 'undefined']

    /** Reference to DOM window - must be passed in the constructor
     * Allows for use of this library/class with `jsdom` in Node.JS as well as the browser.
     * @type {Window}
     */
    static win

    /** Reference to the DOM top-level window.document for convenience - set in constructor @type {Document} */
    static doc

    /** Log function - passed in constructor or will be a dummy function
     * @type {Function}
     */
    static log

    /** Options for Markdown-IT if available (set in constructor) */
    static mdOpts
    /** Reference to pre-loaded Markdown-IT library */
    static md
    /** Optional Markdown-IT Plugins */
    ui_md_plugins
    // #endregion --- class variables ---

    /** Called when `new Ui(...)` is called
     * @param {globalThis} win Either the browser global window or jsdom dom.window
     * @param {Function} [extLog] A function that returns a function for logging
     * @param {Function} [jsonHighlight] A function that returns a highlighted HTML of JSON input
     */
    constructor(win, extLog, jsonHighlight) {
        // window must be passed in as an arg to the constructor
        // Should either be the global window for a browser or `dom.window` for jsdom in Node.js
        // @ts-ignore
        if (win) Ui.win = win
        else {
            // Ui.log(0, 'Ui:constructor', 'Current environment does not include `window`, UI functions cannot be used.')()
            // return
            throw new Error('Ui:constructor. Current environment does not include `window`, UI functions cannot be used.')
        }

        // For convenience
        Ui.doc = Ui.win.document

        // If a suitable function not passed in, create a dummy one
        if (extLog) Ui.log = extLog
        else Ui.log = function() { return function() {} } // eslint-disable-line @stylistic/max-statements-per-line

        // If a JSON HTML highlighting function passed then use it, else a dummy fn
        if (jsonHighlight) this.syntaxHighlight = jsonHighlight
        else this.syntaxHighlight = function() {}

        // If Markdown-IT pre-loaded, then configure it now
        if (Ui.win['markdownit']) {
            Ui.mdOpts = {
                html: true,
                xhtmlOut: false,
                linkify: true,
                _highlight: true,
                _strict: false,
                _view: 'html',
                langPrefix: 'language-',
                // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
                highlight: function(str, lang) {
                    // https://highlightjs.org
                    if (lang && window['hljs'] && window['hljs'].getLanguage(lang)) {
                        try {
                            return `<pre class="">
                                    <code class="hljs border">${window['hljs'].highlight(str, { language: lang, ignoreIllegals: true, }).value}</code></pre>`
                        } finally { } // eslint-disable-line no-empty
                    }
                    return `<pre class="hljs border"><code>${Ui.md.utils.escapeHtml(str).trim()}</code></pre>`
                },
            }
            Ui.md = Ui.win['markdownit'](Ui.mdOpts)
        }
    }

    // #region ---- Internal Methods ----

    _markDownIt() {
        // If Markdown-IT pre-loaded, then configure it now
        if (!Ui.win['markdownit']) return

        // If plugins not yet defined, check if uibuilder has set them
        if (!this.ui_md_plugins && Ui.win['uibuilder'] && Ui.win['uibuilder'].ui_md_plugins) this.ui_md_plugins = Ui.win['uibuilder'].ui_md_plugins

        Ui.mdOpts = {
            html: true,
            xhtmlOut: false,
            linkify: true,
            _highlight: true,
            _strict: false,
            _view: 'html',
            langPrefix: 'language-',
            // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
            highlight: function(str, lang) {
                if (window['hljs']) {
                    if (lang && window['hljs'].getLanguage(lang)) {
                        try {
                            return `<pre><code class="hljs border language-${lang}" data-language="${lang}" title="Source language: '${lang}'">${window['hljs'].highlight(str, { language: lang, ignoreIllegals: true, }).value}</code></pre>`
                        } finally { } // eslint-disable-line no-empty
                    } else {
                        try {
                            const high = window['hljs'].highlightAuto(str)
                            return `<pre><code class="hljs border language-${high.language}" data-language="${high.language}" title="Source language estimated by HighlightJS: '${high.language}'">${high.value}</code></pre>`
                        } finally { } // eslint-disable-line no-empty
                    }
                }
                return `<pre><code class="border">${Ui.md.utils.escapeHtml(str).trim()}</code></pre>`
            },
        }
        Ui.md = Ui.win['markdownit'](Ui.mdOpts)
        // Ui.md.use(Ui.win.markdownitTaskLists, {enabled: true})
        if (this.ui_md_plugins) {
            if (!Array.isArray(this.ui_md_plugins)) {
                Ui.log('error', 'Ui:_markDownIt:plugins', 'Could not load plugins, ui_md_plugins is not an array')()
                return
            }
            this.ui_md_plugins.forEach( (plugin) => {
                if (typeof plugin === 'string') {
                    Ui.md.use(Ui.win[plugin])
                } else {
                    const name = Object.keys(plugin)[0]
                    Ui.md.use(Ui.win[name], plugin[name])
                }
            })
        }
    }

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
                notify.addEventListener('close', (ev) => {
                    // @ts-ignore
                    ev.currentTarget.userAction = 'close'
                    resolve(ev)
                })
                notify.addEventListener('click', (ev) => {
                    // @ts-ignore
                    ev.currentTarget.userAction = 'click'
                    resolve(ev)
                })
                notify.addEventListener('error', (ev) => {
                    // @ts-ignore
                    ev.currentTarget.userAction = 'error'
                    reject(ev)
                })
            })
        } catch (e) {
            return Promise.reject(new Error('Browser refused to create a Notification'))
        }
    }

    // Vue dynamic inserts Don't really work ...
    // _uiAddVue(ui, isRecurse) {

    //     // must be Vue
    //     // must have only 1 root element
    //     const compToAdd = ui.components[0]
    //     const newEl = Ui.doc.createElement(compToAdd.type)

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
        Ui.log('trace', 'Ui:_uiManager:add', 'Starting _uiAdd')()

        // Vue dynamic inserts Don't really work ...
        // if (this.#isVue && !isRecurse) {
        //     this._uiAddVue(ui, false)
        //     return
        // }

        ui.components.forEach((compToAdd, i) => {
            Ui.log('trace', `Ui:_uiAdd:components-forEach:${i}`, 'Component to add: ', compToAdd)()

            /** @type {*} Create the new component - some kind of HTML element */
            let newEl
            switch (compToAdd.type) {
                // If trying to insert raw html, wrap in a div
                case 'html': {
                    compToAdd.ns = 'html'
                    newEl = Ui.doc.createElement('div')
                    break
                }

                // If trying to insert raw svg, need to create in namespace
                case 'svg': {
                    compToAdd.ns = 'svg'
                    newEl = Ui.doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
                    break
                }

                default: {
                    compToAdd.ns = 'dom'
                    newEl = Ui.doc.createElement(compToAdd.type)
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
                elParent = Ui.doc.querySelector(compToAdd.parent)
            } else if (ui.parent) {
                elParent = Ui.doc.querySelector(ui.parent)
            }
            if (!elParent) {
                Ui.log('info', 'Ui:_uiAdd', 'No parent found, adding to body')()
                elParent = Ui.doc.querySelector('body')
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

    /** Enhance an HTML element that is being composed with ui data
     *  such as ID, attribs, event handlers, custom props, etc.
     * @param {*} el HTML Element to enhance
     * @param {*} comp Individual uibuilder ui component spec
     */
    _uiComposeComponent(el, comp) {
        // Add attributes
        if (comp.attributes) {
            Object.keys(comp.attributes).forEach((attrib) => {
                if (attrib === 'class' && Array.isArray(comp.attributes[attrib])) comp.attributes[attrib].join(' ')

                Ui.log('trace', '_uiComposeComponent:attributes-forEach', `Attribute: '${attrib}', value: '${comp.attributes[attrib]}'`)()

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
                        (new Function('evt', `${comp.events[type]}(evt)`))(evt)
                    })
                    // newEl.setAttribute( 'onClick', `${comp.events[type]}()` )
                } catch (err) {
                    Ui.log('error', 'Ui:_uiComposeComponent', `Add event '${type}' for element '${comp.type}': Cannot add event handler. ${err.message}`)()
                }
            })
        }

        // Add custom properties to the dataset
        if (comp.properties) {
            Object.keys(comp.properties).forEach((prop) => {
                // TODO break a.b into sub properties
                el[prop] = comp.properties[prop]
                // Auto-dispatch events if changing value or changed since DOM does not do this automatically
                if (['value', 'checked'].includes(prop)) {
                    el.dispatchEvent(new Event('input'))
                    el.dispatchEvent(new Event('change'))
                }
            })
        }

        // #region Add Slot content to innerHTML
        if (comp.slot) {
            this.replaceSlot(el, comp.slot)
        }
        //#endregion

        // TODO Add multi-slot capability (default slot must always be processed first as innerHTML is replaced)

        // #region Add Slot Markdown content to innerHTML IF marked library is available
        if (comp.slotMarkdown) {
            this.replaceSlotMarkdown(el, comp)
        }
        //#endregion
    }

    /** Extend an HTML Element with appended elements using ui components
     * NOTE: This fn follows a strict hierarchy of added components.
     * @param {HTMLElement} parentEl The parent HTML Element we want to append to
     * @param {*} components The ui component(s) we want to add
     * @param {string} [ns] Optional. The namespace to use.
     */
    _uiExtendEl(parentEl, components, ns = '') {
        components.forEach((compToAdd, i) => {
            Ui.log('trace', `Ui:_uiExtendEl:components-forEach:${i}`, compToAdd)()

            /** @type {HTMLElement} Create the new component */
            let newEl

            compToAdd.ns = ns

            if (compToAdd.ns === 'html') {
                newEl = parentEl
                // newEl.outerHTML = compToAdd.slot
                // parentEl.innerHTML = compToAdd.slot
                this.replaceSlot(parentEl, compToAdd.slot)
            } else if (compToAdd.ns === 'svg') {
                newEl = Ui.doc.createElementNS('http://www.w3.org/2000/svg', compToAdd.type)
                // Updates newEl
                this._uiComposeComponent(newEl, compToAdd)
                parentEl.appendChild(newEl)
            } else {
                newEl = Ui.doc.createElement(compToAdd.type === 'html' ? 'div' : compToAdd.type)
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

    // TODO Add more error handling and parameter validation
    /** Handle incoming _ui load requests
     * Can load JavaScript modules, JavaScript scripts and CSS.
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiLoad(ui) {
        // Self-loading ECMA Modules (e.g. web components)
        if (ui.components) {
            if (!Array.isArray(ui.components)) ui.components = [ui.components]

            ui.components.forEach(async (component) => {
                // NOTE: This happens asynchronously but we don't wait
                import(component)
            })
        }
        // Remote Scripts
        if (ui.srcScripts) {
            if (!Array.isArray(ui.srcScripts)) ui.srcScripts = [ui.srcScripts]

            ui.srcScripts.forEach((script) => {
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

            ui.srcStyles.forEach((sheet) => {
                this.loadStyleSrc(sheet)
            })
        }
        // Styles passed as text
        if (ui.txtStyles) {
            if (!Array.isArray(ui.txtStyles)) ui.txtStyles = [ui.txtStyles]

            this.loadStyleTxt(ui.txtStyles.join('\n'))
        }
    } // --- end of _uiLoad ---

    /** Handle incoming _ui messages and loaded UI JSON files
     * Called from start()
     * @param {*} msg Standardised msg object containing a _ui property object
     */
    _uiManager(msg) {
        if (!msg._ui) return

        // Make sure that _ui is an array
        if (!Array.isArray(msg._ui)) msg._ui = [msg._ui]

        msg._ui.forEach((ui, i) => {
            if (ui.mode && !ui.method) ui.method = ui.mode
            if (!ui.method) {
                Ui.log('error', 'Ui:_uiManager', `No method defined for msg._ui[${i}]. Ignoring. `, ui)()
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
                    Ui.log('error', 'Ui:_uiManager', `Invalid msg._ui[${i}].method (${ui.method}). Ignoring`)()
                    break
                }
            }
        })
    } // --- end of _uiManager ---

    /** Handle a reload request */
    _uiReload() {
        Ui.log('trace', 'Ui:uiManager:reload', 'reloading')()
        location.reload()
    }

    // TODO Add better tests for failures (see comments)
    /** Handle incoming _ui remove requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     * @param {boolean} all Optional, default=false. If true, will remove ALL found elements, otherwise only the 1st is removed
     */
    _uiRemove(ui, all = false) {
        ui.components.forEach((compToRemove) => {
            let els
            if (all !== true) els = [Ui.doc.querySelector(compToRemove)]
            else els = Ui.doc.querySelectorAll(compToRemove)

            els.forEach((el) => {
                try {
                    el.remove()
                } catch (err) {
                    // Could not remove. Cannot read properties of null <= no need to report this one
                    // Could not remove. Failed to execute 'querySelector' on 'Ui.doc': '##testbutton1' is not a valid selector
                    Ui.log('trace', 'Ui:_uiRemove', `Could not remove. ${err.message}`)()
                }
            })
        })
    } // --- end of _uiRemove ---

    /** Handle incoming _ui replace requests
     * @param {*} ui Standardised msg._ui property object. Note that payload and topic are appended to this object
     */
    _uiReplace(ui) {
        Ui.log('trace', 'Ui:_uiReplace', 'Starting')()

        ui.components.forEach((compToReplace, /** @type {number} */ i) => {
            Ui.log('trace', `Ui:_uiReplace:components-forEach:${i}`, 'Component to replace: ', compToReplace)()

            /** @type {HTMLElement} */
            let elToReplace

            // Either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. FIRST element matching is updated.
            if (compToReplace.id) {
                elToReplace = Ui.doc.getElementById(compToReplace.id) // .querySelector(`#${compToReplace.id}`)
            } else if (compToReplace.selector || compToReplace.select) {
                elToReplace = Ui.doc.querySelector(compToReplace.selector)
            } else if (compToReplace.name) {
                elToReplace = Ui.doc.querySelector(`[name="${compToReplace.name}"]`)
            } else if (compToReplace.type) {
                elToReplace = Ui.doc.querySelector(compToReplace.type)
            }

            Ui.log('trace', `Ui:_uiReplace:components-forEach:${i}`, 'Element to replace: ', elToReplace)()

            // Nothing was found so ADD the element instead
            if (elToReplace === undefined || elToReplace === null) {
                Ui.log('trace', `Ui:_uiReplace:components-forEach:${i}:noReplace`, 'Cannot find the DOM element. Adding instead.', compToReplace)()
                this._uiAdd({ components: [compToReplace], }, false)
                return
            }

            /** @type {*} Create the new component - some kind of HTML element */
            let newEl
            switch (compToReplace.type) {
                // If trying to insert raw html, wrap in a div
                case 'html': {
                    compToReplace.ns = 'html'
                    newEl = Ui.doc.createElement('div')
                    break
                }

                // If trying to insert raw svg, need to create in namespace
                case 'svg': {
                    compToReplace.ns = 'svg'
                    newEl = Ui.doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
                    break
                }

                default: {
                    compToReplace.ns = 'dom'
                    newEl = Ui.doc.createElement(compToReplace.type)
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
        Ui.log('trace', 'UI:_uiUpdate:update', 'Starting _uiUpdate', ui)()

        // We allow an update not to actually need to spec a component
        if (!ui.components) ui.components = [Object.assign({}, ui)]

        ui.components.forEach((compToUpd, i) => {
            Ui.log('trace', '_uiUpdate:components-forEach', `Start loop #${i}`, compToUpd)()

            /** @type {NodeListOf<Element>} */
            let elToUpd

            // If a parent element is passed, use that as the update target (only allowed internally)
            // Otherwise either the id, CSS selector, name or type (element type) must be given in order to identify the element to change. ALL elements matching are updated.
            if (compToUpd.parentEl) {
                elToUpd = compToUpd.parentEl
            } else if (compToUpd.id) {
                // NB We don't use get by id because this way the code is simpler later on
                elToUpd = Ui.doc.querySelectorAll(`#${compToUpd.id}`)
            } else if (compToUpd.selector || compToUpd.select) {
                elToUpd = Ui.doc.querySelectorAll(compToUpd.selector)
            } else if (compToUpd.name) {
                elToUpd = Ui.doc.querySelectorAll(`[name="${compToUpd.name}"]`)
            } else if (compToUpd.type) {
                elToUpd = Ui.doc.querySelectorAll(compToUpd.type)
            }

            // @ts-ignore Nothing was found so give up
            if (elToUpd === undefined || elToUpd.length < 1) {
                Ui.log('warn', 'Ui:_uiManager:update', 'Cannot find the DOM element. Ignoring.', compToUpd)()
                return
            }

            Ui.log('trace', '_uiUpdate:components-forEach', `Element(s) to update. Count: ${elToUpd.length}`, elToUpd)()

            // If slot not specified but payload is, use the payload in the slot
            if (!compToUpd.slot && compToUpd.payload) compToUpd.slot = compToUpd.payload

            // Might have >1 element to update - so update them all
            elToUpd.forEach((el, j) => {
                Ui.log('trace', '_uiUpdate:components-forEach', `Updating element #${j}`, el)()
                this._uiComposeComponent(el, compToUpd)
                // Try to go down another level of nesting if needed
                // ! NOT CONVINCED THIS ACTUALLY WORKS !
                if (compToUpd.components) {
                    Ui.log('trace', '_uiUpdate:nested-component', `Element #${j} - nested-component`, compToUpd, el)()
                    const nc = { _ui: [], }
                    compToUpd.components.forEach((nestedComp, k) => {
                        const method = nestedComp.method || compToUpd.method || ui.method
                        if (nestedComp.method) delete nestedComp.method
                        if (!Array.isArray(nestedComp)) nestedComp = [nestedComp]
                        // nestedComp.parentEl = el
                        // nestedComp.components = [nestedComp]
                        Ui.log('trace', '_uiUpdate:nested-component', `Element #${j} - nested-component #${k}`, nestedComp)()
                        nc._ui.push( {
                            method: method,
                            parentEl: el,
                            components: nestedComp,
                        })
                    })
                    Ui.log('trace', '_uiUpdate:nested-component', `Element #${j} - nested-component new manager`, nc)()
                    this._uiManager(nc)
                }
            })

            // If nested components, apply to every found element - but don't pass payload to sub-components
            // if (compToUpd.components) {
            //     compToUpd.components.forEach((el, k) => {
            //         Ui.log('trace', '_uiUpdate:nested-component', `Updating nested-component #${k}`, el)()
            //         this._uiUpdate({
            //             method: el.method || ui.method,
            //             parentEl: el,
            //             components: el.components,
            //         })
            //     })
            // }
        })
    } // --- end of _uiUpdate ---

    // #endregion ---- -------- ----

    // #region ---- External Methods ----

    /** Simplistic jQuery-like document CSS query selector, returns an HTML Element
     * NOTE that this fn returns the element itself. Use $$ to get the properties of 1 or more elements.
     * If the selected element is a <template>, returns the first child element.
     * type {HTMLElement}
     * @param {string} cssSelector A CSS Selector that identifies the element to return
     * @param {"el"|"text"|"html"|"attributes"|"attr"} [output] Optional. What type of output to return. Defaults to "el", the DOM element reference
     * @param {HTMLElement} [context] Optional. The context to search within. Defaults to the document. Must be a DOM element.
     * @returns {HTMLElement|string|Array|null} Selected HTML DOM element, innerText, innerHTML, attribute list or null
     */
    $(cssSelector, output, context) {
        if (!context) context = Ui.doc
        if (!output) output = 'el'

        // if context is not a valid htmlelement, return null
        if (!context || !context.nodeType) {
            Ui.log(1, 'Uib:$', `Invalid context element. Must be a valid HTML element.`, context)()
            return null
        }

        /** @type {HTMLElement} Some kind of HTML element */
        let el = (context).querySelector(cssSelector)

        // if no element found or is not a valid htmlelement, return null
        if (!el || !el.nodeType) {
            Ui.log(1, 'Uib:$', `No element found or element is not an HTML element for CSS selector ${cssSelector}`)()
            return null
        }

        if ( el.nodeName === 'TEMPLATE' ) {
            el = el.content.firstElementChild
            if (!el) {
                Ui.log(0, 'Uib:$', `Template selected for CSS selector ${cssSelector} but it is empty`)()
                return null
            }
        }

        let out

        try {
            switch (output.toLowerCase()) {
                case 'text': {
                    out = el.innerText
                    break
                }

                case 'html': {
                    out = el.innerHTML
                    break
                }

                case 'attr':
                case 'attributes': {
                    out = {}
                    for (const attr of el.attributes) {
                        out[attr.name] = attr.value
                    }
                    break
                }

                default: {
                    out = el
                    break
                }
            }
        } catch (e) {
            out = el
            Ui.log(1, 'Uib:$', `Could not process output type "${output}" for CSS selector ${cssSelector}, returned the DOM element. ${e.message}`, e)()
        }

        return out
    }

    /** CSS query selector that returns ALL found selections. Matches the Chromium DevTools feature of the same name.
     * NOTE that this fn returns an array showing the PROPERTIES of the elements whereas $ returns the element itself
     * @param {string} cssSelector A CSS Selector that identifies the elements to return
     * @param {HTMLElement} [context] Optional. The context to search within. Defaults to the document. Must be a DOM element.
     * @returns {HTMLElement[]} Array of DOM elements/nodes. Array is empty if selector is not found.
     */
    $$(cssSelector, context) {
        if (!context) context = Ui.doc

        // if context is not a valid htmlelement, return null
        if (!context || !context.nodeType) {
            Ui.log(1, 'Uib:$$', `Invalid context element. Must be a valid HTML element.`, context)()
            return null
        }

        return Array.from((context).querySelectorAll(cssSelector))
    }

    /** Add 1 or several class names to an element
     * @param {string|string[]} classNames Single or array of classnames
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    addClass(classNames, el) {
        if (!Array.isArray(classNames)) classNames = [classNames]
        if (el) el.classList.add(...classNames)
    }

    /** Apply a source template tag to a target html element
     * NOTES:
     * - Any attributes are only applied to the 1ST ELEMENT of the template content. Use a wrapper div if you need to apply to multiple elements.
     * - When using 'wrap' mode, the target content is placed into the template's 1ST <slot> only (if present).
     * - styles in ALL templates are accessible to all templates & impact the whole page.
     * - scripts in templates are run AT TIME OF APPLICATION (so may run multiple times).
     * - scripts in templates are applied in order of application, so variables may not yet exist if defined in subsequent templates
     * @param {string} sourceId The HTML ID of the source element
     * @param {string} targetId The HTML ID of the target element
     * @param {object} config Configuration options
     *   @param {boolean=} config.onceOnly   If true, the source will be adopted (the source is moved)
     *   @param {object=}  config.attributes A set of key:value pairs that will be applied as attributes to the 1ST ELEMENT ONLY of the target
     *   @param {'insert'|'replace'|'wrap'}  config.mode How to apply the template. Default is 'insert'. 'replace' will replace the targets innerHTML. 'wrap' is like 'replace' but will put any target content into the template's 1ST <slot> (if present).
     */
    applyTemplate(sourceId, targetId, config) {
        if (!config) config = {}
        if (!config.onceOnly) config.onceOnly = false
        if (!config.mode) config.mode = 'insert'

        const template = Ui.doc.getElementById(sourceId)
        if (!template || template.tagName !== 'TEMPLATE') {
            Ui.log('error', 'Ui:applyTemplate', `Source must be a <template>. id='${sourceId}'`)()
            return
        }

        const target = Ui.doc.getElementById(targetId)
        if (!target) {
            Ui.log('error', 'Ui:applyTemplate', `Target not found: id='${targetId}'`)()
            return
        }

        const targetContent = target.innerHTML ?? ''
        if (targetContent && config.mode === 'replace') {
            Ui.log('warn', 'Ui:applyTemplate', `Target element is not empty, content is replaced. id='${targetId}'`)()
        }

        let templateContent
        if (config.onceOnly === true) templateContent = Ui.doc.adoptNode(template.content) // NB content.childElementCount = 0 after adoption
        else templateContent = Ui.doc.importNode(template.content, true)

        if (templateContent) {
            // Apply config.attributes to the 1ST ELEMENT ONLY of the template content
            if (config.attributes) {
                const el = templateContent.firstElementChild
                Object.keys(config.attributes).forEach( (attrib) => {
                    // Apply each attribute and value
                    el.setAttribute(attrib, config.attributes[attrib])
                })
            }

            if (config.mode === 'insert') {
                target.appendChild(templateContent)
            } else if (config.mode === 'replace') {
                target.innerHTML = ''
                target.appendChild(templateContent)
            } else if (config.mode === 'wrap') {
                target.innerHTML = ''
                target.appendChild(templateContent)
                if (targetContent) {
                    const slot = target.getElementsByTagName('slot')
                    if (slot.length > 0) {
                        slot[0].innerHTML = targetContent
                    }
                }
            }
        } else {
            Ui.log('warn', 'Ui:applyTemplate', `No valid content found in template`)()
        }
    }

    /** Converts markdown text input to HTML if the Markdown-IT library is loaded
     * Otherwise simply returns the text
     * @param {string} mdText The input markdown string
     * @returns {string} HTML (if Markdown-IT library loaded and parse successful) or original text
     */
    convertMarkdown(mdText) {
        if (!mdText) return ''
        if (!Ui.win['markdownit']) return mdText
        if (!Ui.md) this._markDownIt() // To handle case where the library is late loaded
        // Convert from markdown to HTML
        try {
            return Ui.md.render(mdText.trim())
        } catch (e) {
            Ui.log(0, 'uibuilder:convertMarkdown', `Could not render Markdown. ${e.message}`, e)()
            return '<p class="border error">Could not render Markdown<p>'
        }
    }

    /** Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
     * Wraps the included object in a div tag.
     * PDF's, text or unknown MIME types are also wrapped in an iFrame.
     * @param {string} url The URL of the source file to include
     * @param {object} uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
     * param {string} uiOptions.id The HTML ID given to the wrapping DIV tag
     * param {string} uiOptions.parentSelector The CSS selector for a parent element to insert the new HTML under (defaults to 'body')
     * @returns {Promise<any>} Status
     */
    async include(url, uiOptions) {
        // TODO: src, id, parent must all be a strings
        if (!fetch) {
            Ui.log(0, 'Ui:include', 'Current environment does not include `fetch`, skipping.')()
            return 'Current environment does not include `fetch`, skipping.'
        }
        if (!url) {
            Ui.log(0, 'Ui:include', 'url parameter must be provided, skipping.')()
            return 'url parameter must be provided, skipping.'
        }
        if (!uiOptions || !uiOptions.id) {
            Ui.log(0, 'Ui:include', 'uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.')()
            return 'uiOptions parameter MUST be provided and must contain at least an `id` property, skipping.'
        }

        // Try to get the content via the URL
        let response
        try {
            response = await fetch(url)
        } catch (error) {
            Ui.log(0, 'Ui:include', `Fetch of file '${url}' failed. `, error.message)()
            return error.message
        }
        if (!response.ok) {
            Ui.log(0, 'Ui:include', `Fetch of file '${url}' failed. Status='${response.statusText}'`)()
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
                if (Ui.win['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    Ui.log('warn', 'Ui:include:image', txtReturn)()
                }
                break
            }

            case 'video': {
                data = await response.blob()
                slot = `<video controls autoplay><source src="${URL.createObjectURL(data)}"></video>`
                if (Ui.win['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    Ui.log('warn', 'Ui:include:video', txtReturn)()
                }
                break
            }

            case 'pdf':
            case 'text':
            default: {
                data = await response.blob()
                slot = `<iframe style="resize:both;width:inherit;height:inherit;" src="${URL.createObjectURL(data)}">`
                if (Ui.win['DOMPurify']) {
                    txtReturn = 'Include successful. BUT DOMPurify loaded which may block its use.'
                    Ui.log('warn', `Ui:include:${type}`, txtReturn)()
                }
                break
            }
        }

        // Wrap it all in a <div id="..." class="included">
        uiOptions.type = 'div'
        uiOptions.slot = slot
        if (!uiOptions.parent) uiOptions.parent = 'body'
        if (!uiOptions.attributes) uiOptions.attributes = { class: 'included', }

        // Use uibuilder's standard ui processing to turn the instructions into HTML
        this._uiReplace({
            components: [
                uiOptions
            ],
        })

        Ui.log('trace', `Ui:include:${type}`, txtReturn)()
        return txtReturn
    } // ---- End of include() ---- //

    /** Attach a new remote script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the script src attribute
     */
    loadScriptSrc(url) {
        const newScript = Ui.doc.createElement('script')
        newScript.src = url
        newScript.async = false
        Ui.doc.head.appendChild(newScript)
    }

    /** Attach a new text script to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a script
     */
    loadScriptTxt(textFn) {
        const newScript = Ui.doc.createElement('script')
        newScript.async = false
        newScript.textContent = textFn
        Ui.doc.head.appendChild(newScript)
    }

    /** Attach a new remote stylesheet link to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} url The url to be used in the style link href attribute
     */
    loadStyleSrc(url) {
        const newStyle = Ui.doc.createElement('link')
        newStyle.href = url
        newStyle.rel = 'stylesheet'
        newStyle.type = 'text/css'

        Ui.doc.head.appendChild(newStyle)
    }

    /** Attach a new text stylesheet to the end of HEAD synchronously
     * NOTE: It takes too long for most scripts to finish loading
     *       so this is pretty useless to work with the dynamic UI features directly.
     * @param {string} textFn The text to be loaded as a stylesheet
     */
    loadStyleTxt(textFn) {
        const newStyle = Ui.doc.createElement('style')
        newStyle.textContent = textFn
        Ui.doc.head.appendChild(newStyle)
    }

    /** Load a dynamic UI from a JSON web reponse
     * @param {string} url URL that will return the ui JSON
     */
    loadui(url) {
        if (!fetch) {
            Ui.log(0, 'Ui:loadui', 'Current environment does not include `fetch`, skipping.')()
            return
        }
        if (!url) {
            Ui.log(0, 'Ui:loadui', 'url parameter must be provided, skipping.')()
            return
        }

        fetch(url)
            .then((response) => {
                if (response.ok === false) {
                    // Ui.log('warn', 'Ui:loadui:then1', `Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)()
                    throw new Error(`Could not load '${url}'. Status ${response.status}, Error: ${response.statusText}`)
                }

                Ui.log('trace', 'Ui:loadui:then1', `Loaded '${url}'. Status ${response.status}, ${response.statusText}`)()
                // Did we get json?
                const contentType = response.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    throw new TypeError(`Fetch '${url}' did not return JSON, ignoring`)
                }
                // Returns parsed json to next .then
                return response.json()
            })
            .then((data) => {
                if (data !== undefined) {
                    Ui.log('trace', 'Ui:loadui:then2', 'Parsed JSON successfully obtained')()
                    // Call the _uiManager
                    this._uiManager({ _ui: data, })
                    return true
                }
                return false
            })
            .catch((err) => {
                Ui.log('warn', 'Ui:loadui:catch', 'Error. ', err)()
            })
    } // --- end of loadui

    /** ! NOT COMPLETE Move an element from one position to another
     * @param {object} opts Options
     * @param {string} opts.sourceSelector Required, CSS Selector that identifies the element to be moved
     * @param {string} opts.targetSelector Required, CSS Selector that identifies the element to be moved
     */
    moveElement(opts) {
        const { sourceSelector, targetSelector, moveType, position, } = opts
        const sourceEl = document.querySelector(sourceSelector)
        if (!sourceEl) {
            Ui.log(0, 'Ui:moveElement', 'Source element not found')()
            return
        }
        const targetEl = document.querySelector(targetSelector)
        if (!targetEl) {
            Ui.log(0, 'Ui:moveElement', 'Target element not found')()
            return
        }
    }

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

            isUserInput: node.validity ? true : false,
            userInput: !node.validity
                ? undefined
                : {
                    value: node.value,
                    validity: undefined,
                    willValidate: node.willValidate,
                    valueAsDate: node.valueAsDate,
                    valueAsNumber: node.valueAsNumber,
                    type: node.type,
                },
        }

        if (['UL', 'OL'].includes(node.nodeName)) {
            const listEntries = Ui.doc.querySelectorAll(`${cssSelector} li`)
            if (listEntries) {
                thisOut.list = {
                    entries: listEntries.length,
                }
            }
        }
        if (node.nodeName === 'DL') {
            const listEntries = Ui.doc.querySelectorAll(`${cssSelector} dt`)
            if (listEntries) {
                thisOut.list = {
                    entries: listEntries.length,
                }
            }
        }
        if (node.nodeName === 'TABLE') {
            const bodyEntries = Ui.doc.querySelectorAll(`${cssSelector} > tbody > tr`)
            const headEntries = Ui.doc.querySelectorAll(`${cssSelector} > thead > tr`)
            const cols = Ui.doc.querySelectorAll(`${cssSelector} > tbody > tr:last-child > *`) // #eltest > table > tbody > tr:nth-child(3)
            if (bodyEntries || headEntries || cols) {
                thisOut.table = {
                    headRows: headEntries ? headEntries.length : 0,
                    bodyRows: bodyEntries ? bodyEntries.length : 0,
                    columns: cols ? cols.length : 0,
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
                if (attrib.name === 'class') thisOut.classes = Array.from(node.classList)
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

    /** Show a browser notification if possible. Returns a promise
     * Config can be a simple string, a Node-RED msg (topic as title, payload as body)
     * or a Notifications API options object + config.title string.
     * Config ref: https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
     * @param {object|string} config Notification config object or simple message string
     * @returns {Promise} Resolves on close or click event, returns the event.
     */
    async notification(config) {
        if (typeof config === 'string') {
            config = { body: config, }
        }
        // Are notifications available?
        if (typeof Notification === 'undefined') return Promise.reject(new Error('Notifications not available in this browser'))
        // Do we have permission? If not, ask for permission
        let permit = Notification.permission
        if (permit === 'denied') {
            return Promise.reject(new Error('Notifications not permitted by user'))
        } else if (permit === 'granted') {
            return this._showNotification(config)
        }
        // if (permit === 'default') {
        permit = await Notification.requestPermission()
        if (permit === 'granted') {
            return this._showNotification(config)
        }
        return Promise.reject(new Error('Notifications not permitted by user'))
    }

    /** Remove All, 1 or more class names from an element
     * @param {undefined|null|""|string|string[]} classNames Single or array of classnames. If undefined, "" or null, remove all classes
     * @param {HTMLElement} el HTML Element to add class(es) to
     */
    removeClass(classNames, el) {
        if (!classNames) {
            el.removeAttribute('class')
            return
        }
        if (!Array.isArray(classNames)) classNames = [classNames]
        if (el) el.classList.remove(...classNames)
    }

    /** Replace or add an HTML element's slot from text or an HTML string
     * WARNING: Executes <script> tags! And will process <style> tags.
     * Will use DOMPurify if that library has been loaded to window.
     * param {*} ui Single entry from the msg._ui property
     * @param {Element} el Reference to the element that we want to update
     * @param {*} slot The slot content we are trying to add/replace (defaults to empty string)
     */
    replaceSlot(el, slot) {
        if (!el) return
        if (!slot) slot = ''

        // If DOMPurify is loaded, apply it now
        slot = this.sanitiseHTML(slot)

        // Override for where the el is a template, the normal handler does now work correctly
        if (el.nodeName === 'TEMPLATE') {
            el.innerHTML = slot
            return
        }

        // Only use innerHTML for templates as the following does not work for them
        // For everything else use a DocumentFragment for both security and performance.
        //   It also preserves DOM state and does not destroy event handlers.

        // Create doc frag and apply html string (msg.payload or the slot property)
        const tempFrag = Ui.doc.createRange().createContextualFragment(slot)

        // Remove content of el and replace with tempFrag
        const elRange = Ui.doc.createRange()
        elRange.selectNodeContents(el)
        elRange.deleteContents()
        el.append(tempFrag)
    }

    /** Replace or add an HTML element's slot from a Markdown string
     * Only does something if the markdownit library has been loaded to window.
     * Will use DOMPurify if that library has been loaded to window.
     * @param {Element} el Reference to the element that we want to update
     * @param {*} component The component we are trying to add/replace
     */
    replaceSlotMarkdown(el, component) {
        if (!el) return
        if (!component.slotMarkdown) return

        // Convert from markdown to HTML
        component.slotMarkdown = this.convertMarkdown(component.slotMarkdown)
        // If DOMPurify is loaded, apply it now
        component.slotMarkdown = this.sanitiseHTML(component.slotMarkdown)
        // Set the component content to the the converted slotMarkdown property
        el.innerHTML = component.slotMarkdown
    }

    /** Sanitise HTML to make it safe - if the DOMPurify library is loaded
     * Otherwise just returns that HTML as-is.
     * @param {string} html The input HTML string
     * @returns {string} The sanitised HTML or the original if DOMPurify not loaded
     */
    sanitiseHTML(html) {
        if (!Ui.win['DOMPurify']) return html
        return Ui.win['DOMPurify'].sanitize(html, { ADD_TAGS: this.sanitiseExtraTags, ADD_ATTR: this.sanitiseExtraAttribs, })
    }

    // TODO - Allow notify to sit in corners rather than take over the screen
    /** Show a pop-over "toast" dialog or a modal alert
     * Refs: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/alertdialog.html,
     *       https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html,
     *       https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
     * @param {"notify"|"alert"|null} type Dialog type. If null, invalid or not provided, defaults to "notify".
     * @param {object|null} ui Standardised ui data. If not provided, defaults to {noAutohide:true,modal:true,appendToast:false}
     * @param {object} [msg] msg.payload/msg.topic - only used if payload is a string. Optional.
     * @returns {HTMLDivElement|null} The toast element (which may disappear after a timeout) or null if no content
     * @example
     * Ui.showDialog('notify', { title: 'Hello', content: 'This is a notification', noAutohide: true, appendToast: true })
     * @example
     * Ui.showDialog('alert', null, msg)
     */
    showDialog(type, ui, msg) {
        // #region -- Check properties --

        if (!type || !['notify', 'alert'].includes(type)) {
            type = 'notify' // Default to notify
        }

        if (!ui) {
            ui = {
                noAutohide: true,
                modal: true,
                appendToast: false,
            }
        }

        let body = ''
        // Main body content
        if (msg.payload && typeof msg.payload === 'string') body += `<div>${msg.payload}</div>`
        if (ui.content) body += `<div>${ui.content}</div>`
        // Toast wont show anyway if content is empty, may as well warn user
        if (body === '') {
            Ui.log(1, 'Ui:showDialog', 'Toast content is blank. Not shown.')()
            return null
        }

        // Use msg.topic as alert title if no title provided
        let title = ''
        if (ui.title) title = ui.title
        else if (msg.topic) title = msg.topic
        // if (ui.title) content = `<div class="toast-head">${ui.title}</div><div class="toast-body">${content}</div>`

        // Allow for variants - @since v6.1 - don't bother - since this now sets CSS class, not tied to bootstrap-vue

        // Toasts auto-hide by default after 10s but alerts do not auto-hide
        if (ui.noAutohide) ui.noAutoHide = ui.noAutohide
        if (ui.noAutoHide) ui.autohide = !ui.noAutoHide
        // If set, number of ms until toast is auto-hidden
        if (ui.autoHideDelay) {
            if (!ui.autohide) ui.autohide = true
            ui.delay = ui.autoHideDelay
        } else ui.autoHideDelay = 10000 // default = 10s
        if (!Object.prototype.hasOwnProperty.call(ui, 'autohide')) ui.autohide = true

        let content = ''
        let icon = ''
        if (type === 'alert') {
            icon = '<svg viewBox="0 0 192.146 192.146"><path d="M108.186 144.372c0 7.054-4.729 12.32-12.037 12.32h-.254c-7.054 0-11.92-5.266-11.92-12.32 0-7.298 5.012-12.31 12.174-12.31s11.91 4.992 12.037 12.31zM88.44 125.301h15.447l2.951-61.298H85.46l2.98 61.298zm101.932 51.733c-2.237 3.664-6.214 5.921-10.493 5.921H12.282c-4.426 0-8.51-2.384-10.698-6.233a12.34 12.34 0 0 1 .147-12.349l84.111-149.22c2.208-3.722 6.204-5.96 10.522-5.96h.332c4.445.107 8.441 2.618 10.513 6.546l83.515 149.229c1.993 3.8 1.905 8.363-.352 12.066zm-10.493-6.4L96.354 21.454l-84.062 149.18h167.587z" /></svg>'
            ui.modal = true
            ui.autohide = false
        }
        content = `<div class="toast-head">${icon}${title}</div><div class="toast-body">${body}</div>`

        // #endregion -- -- --

        const removeToaster = () => {
            if (!toaster) return
            Ui.doc.body.removeEventListener('keyup', toasterEventHandler)
            toaster.removeEventListener('keyup', toasterEventHandler)
            toaster.removeEventListener('touchend', toasterEventHandler)
            toaster.removeEventListener('click', toasterEventHandler)
            toaster.remove()
        }

        const removeToast = (localToast) => {
            localToast.removeEventListener('keyup', toasterEventHandler)
            localToast.removeEventListener('touchend', toasterEventHandler)
            localToast.removeEventListener('click', toasterEventHandler)
            localToast.remove()
            // If no more toasts in the toaster, remove the toaster itself
            if (toaster && toaster.childElementCount === 0) removeToaster()
        }

        // Prevent toaster events from affecting toast & remote itself
        const toasterEventHandler = (evt) => {
            evt.stopPropagation()
            if (!toaster) return
            console.log(
                'toasterEventHandler',
                evt,
                toaster.contains(evt.target),
                newToast.contains(evt.target),
                newToast === evt.target
            )
            // removeToast(evt)
            removeToaster()
        }

        const toastEventHandler = (evt) => {
            evt.stopPropagation()

            // Create a reference to the event target or the targets parent that has a class of 'toast'
            let localToast
            if (evt.target.classList.contains('toast')) {
                localToast = evt.target
            } else {
                localToast = evt.target.closest('.toast')
            }
            if (!localToast) {
                Ui.log(1, 'Ui:showDialog', 'Event target is not a (or in a) toast element, ignoring event')()
                return
            }

            // Does the toast contain an input, textarea or button element?
            const hasInteractiveElement = !!localToast.querySelector('input, textarea, button')

            console.log(
                'toastEventHandler',
                hasInteractiveElement,
                evt,
                localToast.contains(evt.target),
                localToast === evt.target
            )

            if (hasInteractiveElement) {
                // Only respond to Escape key
                if (evt.key !== 'Escape') return
                // If hasInteractiveElement is true, then only close on Escape key
                removeToast(localToast)
            }

            removeToast(localToast)
        }

        // Create a toast element (the actual dialog box). Would be nice to use <dialog> but that isn't well supported yet - come on Apple!
        const newToast = Ui.doc.createElement('div')
        newToast.title = 'Click or Esc to clear this notifcation'
        newToast.setAttribute('class', `toast ${type}`)
        newToast.setAttribute('role', type === 'alert' ? 'alertdialog' : 'dialog')
        newToast.dataset.modal = ui.modal
        newToast.dataset.autohide = ui.autohide
        newToast.dataset.autoHideDelay = ui.autoHideDelay
        // newToast.dataset.appendToast = ui.appendToast
        newToast.innerHTML = content

        // toaster.insertAdjacentElement(ui.appendToast === true ? 'beforeend' : 'afterbegin', newToast)
        if (ui.appendToast === true) {
            // Insert newToast after the last toast in Ui.doc.body
            const lastToast = Array.from(Ui.doc.body.querySelectorAll('.toast')).pop()
            if (lastToast) {
                lastToast.insertAdjacentElement('afterend', newToast)
            } else {
                Ui.doc.body.insertBefore(newToast, Ui.doc.body.firstChild)
            }
        } else {
            // Ui.doc.body.insertAdjacentElement('afterbegin', toaster)
            Ui.doc.body.insertBefore(newToast, Ui.doc.body.firstChild)
        }

        // Add event handlers to each toast that still allow esc to close but only close on click if they do not contain an input, textarea or button element
        newToast.addEventListener('keyup', toastEventHandler)
        newToast.addEventListener('click', toastEventHandler)
        newToast.addEventListener('touchend', toastEventHandler)

        // Auto-hide each toast after a delay
        if (ui.autohide === true) {
            setInterval(() => {
                // removeToaster()
                removeToast(newToast)
            }, ui.autoHideDelay)
        }

        // Only needed if using modal
        let toaster
        if (ui.modal === true) {
            // Create a toaster container element if not already created - or get a ref to it
            toaster = Ui.doc.getElementById('toaster')
            if (toaster === null) {
                toaster = Ui.doc.createElement('div')
                toaster.id = 'toaster'
                toaster.title = 'Click, touch, or ESC to clear notifcations'
                toaster.setAttribute('class', 'toaster')
                toaster.setAttribute('arial-label', 'Toast message')

                toaster.addEventListener('click', toasterEventHandler)
                toaster.addEventListener('touchend', toasterEventHandler)
                // default active element is the body, attach the keyup event handler to the body to catch Escape key
                Ui.doc.body.addEventListener('keyup', toasterEventHandler)

                Ui.doc.body.insertAdjacentElement('afterbegin', toaster)
            }
        }

        // Retursn a reference to the new toast element
        return newToast
    }

    /** Creates and displays an overlay window with customizable content and behavior
     * @param {object} options - Configuration options for the overlay
     *   @param {string} [options.content] - Main content (text or HTML) to display
     *   @param {string} [options.title] - Optional title above the main content
     *   @param {string} [options.icon] - Optional icon to display left of title (HTML or text)
     *   @param {string} [options.type] - Overlay type: 'success', 'info', 'warning', or 'error'
     *   @param {boolean} [options.showDismiss] - Whether to show dismiss button (auto-determined if not set)
     *   @param {number|null} [options.autoClose] - Auto-close delay in seconds (null for no auto-close)
     *   @param {boolean} [options.time] - Show timestamp in overlay (default: true)
     * @returns {object} Object with close() method to manually close the overlay
     */
    showOverlay(options) {
        return showOverlay(options)
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

    /** Get data from the DOM. Returns selection of useful props unless a specific prop requested.
     * @param {string} cssSelector Identify the DOM element to get data from
     * @param {string} [propName] Optional. Specific name of property to get from the element
     * @returns {Array<*>} Array of objects containing either specific requested property or a selection of useful properties
     */
    uiGet(cssSelector, propName = null) {
        // The type cast below not really correct but it gets rid of the other typescript errors
        const selection = /** @type {NodeListOf<HTMLInputElement>} */ (Ui.doc.querySelectorAll(cssSelector))

        const out = []

        selection.forEach((node) => {
            // Specific property asked for ...
            if (propName) {
                if (propName === 'classes') propName = 'class'
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
                    const p = {}
                    // Nightmare of different object types in a DOM Element!
                    const cType = prop.constructor.name.toLowerCase()
                    if (cType === 'namednodemap') {
                        for (const key of prop) {
                            // @ts-ignore
                            p[key.name] = prop[key.name].value
                        }
                    } else if (!cType.includes('map')) { // Ordinary properties (not a mapped type)
                        p[propName] = prop
                    } else { // Other MAP types
                        const p = {}
                        // @ts-ignore
                        for (const key in prop) {
                            p[key] = prop[key]
                        }
                    }
                    if (p.class) p.classes = Array.from(node.classList)
                    out.push(p)
                }
            } else { // Otherwise, grab everything useful
                out.push(this.nodeGet(node, cssSelector))
            }
        })

        return out
    }

    /** External alias for _uiComposeComponent
     * @param {*} el HTML Element to enhance
     * @param {*} comp Individual uibuilder ui component spec
     */
    uiEnhanceElement(el, comp) {
        this._uiComposeComponent(el, comp)
    }

    // #region --- table handling ---

    /** Column metadata object definition
     * @typedef columnDefinition
     * @property {number} index The column index number
     * @property {boolean} hasName Whether the column has a defined name or not
     * @property {string} title The title of the column. Shown in the table header row
     * @property {string=} name Optional. A defined column name that will be added as the `data-col-name` to all cells in the column if defined
     * @property {string|number=} key Optional. A key value (currently unused)
     * @property {"string"|"date"|"number"|"html"=} dataType FOR FUTURE USE. Optional. What type of data will this column contain?
     * @property {boolean=} editable FOR FUTURE USE. Optional. Can cells in this column be edited?
     */

    /** Directly add a table to a parent element.
     * @param {Array<object>|Array<Array>|object} data  Input data array or object. Object of objects gives named rows. Array of objects named cols. Array of arrays no naming.
     * @param {object} [opts] Build options
     *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
     *   @param {HTMLElement|string} opts.parent Default=body. The table will be added as a child. May be an actual HTML element or a CSS Selector
     *   @param {boolean=} opts.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
     */
    createTable(data = [], opts = { parent: 'body', }) {
        if (!opts.parent) throw new Error('[ui.js:createTable] opts.parent must be provided')
        this.buildHtmlTable(data, opts)
    }

    // TODO ...
    /** Builds & returns an HTML table element from an array (or object) of objects
     * 1st row is used for columns unless you pass opts.cols to describe them.
     * If an object of objects, inner keys are used to populate th/td `data-col-name` attribs. Outer keys applied as row ID's.
     *
     * TODO
     * - Allow optional caption, heading, footers, optional collapse
     * - Multiple headings, footers
     * - colspans, rowspans
     * - multiple tbody
     *
     * @param {Array<object>|Array<Array>|object} data Input data array or object. Object of objects gives named rows. Array of objects named cols. Array of arrays no naming.
     * @param {object} opts Table options
     *   @param {Array<columnDefinition>=} opts.cols Column metadata. If not provided will be derived from 1st row of data
     *   @param {HTMLElement|string=} opts.parent If provided, the table will be added as a child instead of returned. May be an actual HTML element or a CSS Selector
     *   @param {boolean=} opts.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
     * @returns {HTMLTableElement|HTMLParagraphElement} Output HTML Element
     */
    buildHtmlTable(data, opts = {}) {
        // If data is an object of objects, convert it to an array of objects
        let rowKeys
        const dataType = Object.prototype.toString.apply(data)
        if (dataType === '[object Array]' || dataType === '[object Object]') {
            rowKeys = Object.keys(data)
            data = Object.values(data)
        } else {
            const out = Ui.doc.createElement('p')
            out.textContent = 'Input data is not an array or an object, cannot create a table.'
            return out
        }

        if (rowKeys.length > 1000) Ui.log(1, 'Uib:buildHtmlTable', `Warning, data is ${rowKeys.length} rows. Anything over 1,000 can get very slow to complete.`)()

        const tbl = Ui.doc.createElement('table')

        // Heading row
        const thead = Ui.doc.createElement('thead')
        const headerRow = Ui.doc.createElement('tr')

        if (!opts.cols) { // Take the columns from the 1st row of provided data
            // We have to have data
            if (data.length < 1) throw new Error('[ui.js:buildHtmlTable] When no opts.cols is provided, data must contain at least 1 row')

            const hasName = Object.prototype.toString.apply(data[0]) !== '[object Array]'

            // Set this row to be the column reference (so we have a fixed ref if we allow more thead rows in the future)
            headerRow.dataset.colReference = '' // creates attribute data-col-reference

            // Create cols data: Assume 1st row of data
            opts.cols = []
            Object.keys(data[0]).forEach( (col, i) => {
                opts.cols.push({
                    index: i,
                    hasName: hasName,
                    name: hasName ? col : undefined,
                    key: col ?? i,
                    title: col,
                })
            })
        }
        // @ts-ignore Add cols metadata to table element as a custom prop
        tbl.cols = opts.cols

        // Add the table column headings
        opts.cols.forEach((col) => {
            const thEl = Ui.doc.createElement('th')
            thEl.textContent = col.title
            // @ts-ignore
            if (col.hasName === true) thEl.dataset.colName = name
            headerRow.appendChild(thEl)
        })

        thead.appendChild(headerRow)
        tbl.appendChild(thead)

        // body
        const tbody = Ui.doc.createElement('tbody')
        tbl.appendChild(tbody)

        const rowOpts = {
            allowHTML: true,
            cols: opts.cols, // we only want to get this once
        }

        // Directly adds rows to the tbl element
        data.forEach( (item, i) => {
            if (isNaN(Number(rowKeys[i]))) rowOpts.rowId = rowKeys[i]
            else rowOpts.rowId = undefined
            this.tblAddRow(tbl, item, rowOpts)
        })

        if (opts.parent) {
            // const parentType = Object.prototype.toString.apply(opts.parent)
            let parentEl
            if (typeof opts.parent === 'string') {
                parentEl = Ui.doc.querySelector(opts.parent)
            } else {
                parentEl = opts.parent
            }
            try {
                parentEl.appendChild(tbl)
            } catch (e) {
                throw new Error(`[ui.js:buildHtmlTable] Could not add table to parent. ${e.message}`)
            }
            return
        }

        return tbl
    }

    /** Adds (or replaces) a single row in an existing table>tbody
     * NOTE: Row numbers use the rowIndex property of the row element.
     * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
     * @param {object|Array} rowData A single row of column/cell data
     * @param {object} [options] Additional options
     *  @param {number=} options.body Optional, default=0. The tbody section to add the row to.
     *  @param {boolean=} options.allowHTML Optional, default=false. If true, allows HTML cell content, otherwise only allows text. Always sanitise HTML inputs
     *  @param {string=} options.rowId Optional. HTML element ID for the added row
     *  @param {number=} options.afterRow Optional. If provided, the new row will be added after this row number
     *  @param {number=} options.beforeRow Optional. If provided, the new row will be added before this row number. Ignored if afterRow is provided
     *  @param {number=} options.replaceRow Optional. If provided, the specified row will be REPLACED instead of added. Ignored if afterRow or beforeRow is provided
     *  @param {Array<columnDefinition>} [options.cols] Optional. Data about each column. If not provided, will be calculated from the table
     *
     * @returns {HTMLTableRowElement} Reference to the newly added row. Use the `rowIndex` prop for the row number
     */
    tblAddRow(tbl, rowData = {}, options = {}) {
        const tblType = Object.prototype.toString.apply(tbl)

        if (Object.prototype.toString.apply(options) !== '[object Object]') throw new Error(`[tblAddDataRow] options must be an object`)

        // rowData must be an object or array of column cell data
        const dataType = Object.prototype.toString.apply(rowData)
        if (dataType !== '[object Object]' && dataType !== '[object Array]') throw new Error(`[tblAddDataRow] rowData MUST be an object or an array containing column/cell data for each column`)

        /** @type {HTMLTableElement} */
        let tblEl
        if (tblType === '[object HTMLTableElement]') { // we were passed an actual table el
            // @ts-ignore
            tblEl = tbl
        } else { // we were passed a css selector
            // @ts-ignore
            tblEl = Ui.doc.querySelector(tbl)
            if (!tblEl) throw new Error(`[tblAddDataRow] Table with CSS Selector "${tbl}" not found`)
        }

        if (!options.body) options.body = 0
        if (!('allowHTML' in options)) options.allowHTML = false

        const tbodyEl = tblEl.getElementsByTagName('tbody')[options.body]
        if (!tbodyEl) throw new Error(`[tblAddDataRow] Table must have a tbody tag, tbody section ${options.body} does not exist`)
        // console.log('rows', tbody.rows.length)

        // Get column meta if not provided
        if (!options.cols) options.cols = this.tblGetColMeta(tblEl)
        const colMeta = options.cols
        // console.log('COL-META:', colMeta, '-- COL-META-LENGTH:', colMeta.length)

        const rowEl = Ui.doc.createElement('tr')
        if (options.rowId) rowEl.id = options.rowId

        // Pre-create all the columns in an array
        const cols = []
        for (const col of colMeta) {
            const cellEl = Ui.doc.createElement('td')
            // Attach the col metadata to the col element as a custom prop
            cellEl.colMeta = col
            // If we have a name, add `data-col-name` attribute
            if (col.hasName) cellEl.dataset.colName = col.name

            cols.push(cellEl)
        }
        // console.log('COLS:', cols)

        // walk through provided data
        Object.keys(rowData).forEach( (colKey, i, row) => {
            // console.log('++ ROW KEY. i=', i, 'rowKey=', rowKey, 'rowData[rowKey]=', rowData[rowKey])

            // Match the new input to one of the columns
            let foundEl = cols.find( col => col?.colMeta?.name === colKey )
            let foundRowData
            if (foundEl) { // Find by name
                foundRowData = rowData[colKey]
            } else { // By index
                let numColKey = Number(colKey)
                if (isNaN(numColKey)) numColKey = i
                // NOTE: Ignore if the col index is larger than the number of cols
                if (numColKey <= cols.length - 1) {
                    foundEl = cols[numColKey]
                    foundRowData = Object.values(rowData)[numColKey] // Gets an array even if the original is an object
                }
            }
            if (foundEl) {
                // Attach the text/html
                if (options.allowHTML) foundEl.innerHTML = this.sanitiseHTML(foundRowData)
                else foundEl.textContent = foundRowData
            }
            // Ignore not found columns
        })

        // Append all the columns to the row
        rowEl.append(...cols)

        // If afterRow is provided, insert the row after the specified row number & return reference to the new row
        if ('afterRow' in options) {
            const afterRow = tbodyEl.rows[options.afterRow]
            if (afterRow) return afterRow.after(rowEl)
        } else if ('beforeRow' in options) {
            const beforeRow = tbodyEl.rows[options.beforeRow]
            if (beforeRow) return beforeRow.before(rowEl)
        } else if ('replaceRow' in options) {
            const replaceRow = tbodyEl.rows[options.replaceRow]
            if (replaceRow) return replaceRow.replaceWith(rowEl)
        }
        // Otherwise adds the row to the end of the table and returns the row reference for further processing if needed
        return tbodyEl.appendChild(rowEl)
    }

    /** Add table event listener that returns the text or html content of either the full row or a single cell
     * NOTE: Assumes that the table has a `tbody` element.
     * If cells have a `data-col-name` attribute, it will be used in the output as the column name.
     * @example tblAddListener('#eltest-tbl-table', {}, myVar)
     * @example tblAddListener('#eltest-tbl-table', {eventScope: 'cell'}, myVar2)
     *
     * @param {string} tblSelector The table CSS Selector
     * @param {object} [options] Additional options. Default={}
     *   @param {"row"|"cell"=} options.eventScope Optional, default=row. Return data for either the whole row (as an object) or for the single cell clicked
     *   @param {"text"|"html"=} options.returnType Optional, default=text. Return text or html data
     *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
     *   @param {boolean=} options.send Optional, default=true. If uibuilder is present, will automatically send a message back to Node-RED.
     *   @param {string|number=} options.logLevel Optional, default=3/info. Numeric or string log level matching uibuilder's log levels.
     *   @param {string} [options.eventType] Optional, default=click. What event to listen for.
     * @param {object=} out A variable reference that will be updated with the output data upon a click event
     */
    tblAddListener(tblSelector, options = {}, out = {}) {
        const table = Ui.doc.querySelector(tblSelector)
        if (!table) throw new Error(`Table with CSS Selector "${tblSelector}" not found`)
        if (typeof out !== 'object') throw new Error('The "out" argument MUST be an object')

        if (!options.eventScope) options.eventScope = 'row'
        if (!options.returnType) options.returnType = 'text'
        if (!options.eventType) options.eventType = 'click'
        if (!options.pad) options.pad = 3
        if (!options.logLevel) options.logLevel = 2 // info
        if (!('send' in options)) options.send = true

        // Add event listener to the table's <tbody> to capture clicks on any <tr> within it
        table.querySelector('tbody').addEventListener(options.eventType, (event) => {
            Object.keys(out).forEach(key => delete out[key]) // empty the out object

            const clickedRow = event.target.closest('tr')
            const clickedCell = event.target.closest('td')
            // console.log('element clicked: ', clickedEl)

            if (clickedRow) {
                out.clickType = options.eventScope
                out.eventType = options.eventType

                const rowIndex = out.rowIndex = clickedRow.rowIndex
                const cellIndex = out.cellIndex = clickedCell.cellIndex + 1 // Madness! rowindex starts from 1 but cell index from 0!

                if (clickedRow.id) out.rowId = clickedRow.id

                if (options.eventScope === 'row') {
                    // Loop through each <td> in the clicked row
                    clickedRow.querySelectorAll('td').forEach((cell) => {
                        const colName = this.tblGetCellName(cell, options.pad)
                        out[colName] = options.returnType === 'text' ? cell.textContent.trim() : cell.innerHTML
                    })
                } else {
                    const colName = this.tblGetCellName(clickedCell, options.pad)
                    out[colName] = options.returnType === 'text' ? clickedCell.textContent.trim() : clickedCell.innerHTML
                }

                Ui.log(options.logLevel, 'Ui:tblAddClickListener', `${options.eventScope} ${options.eventType} on row=${rowIndex}, col=${cellIndex}, data: `, out)()

                // If UIBUILDER for Node-RED client library, send a message back to Node-RED
                if (options.send === true && Ui.win['uibuilder']) Ui.win['uibuilder'].send({
                    topic: `${tblSelector} ${options.eventScope} ${options.eventType}`,
                    payload: out,
                })
            }
        })
    }

    /** Find the column definition for a single column
     * @param {string|number} rowKey Key or index to use for column search
     * @param {Array<columnDefinition>=} colMeta Array of column definitions. If not provided, will need the HTML table element.
     * @param {HTMLTableElement=} tblEl If the colMeta table not provided, provide the HTML table element to do the lookup
     * @returns {columnDefinition} Column metadata object
     */
    tblFindColMeta(rowKey, colMeta, tblEl) {
        if (!colMeta && !tblEl) throw new Error('[tblFindColMeta] Either the column metadata array or the HTML table element must be provided')
        if (!colMeta && tblEl) colMeta = this.tblGetColMeta(tblEl)

        let colDef
        if (colMeta[rowKey]) colDef = colMeta[rowKey]
        else {
            const find = colMeta.find( c => c.name === rowKey || c.index === Number(rowKey) )
            // console.log('FIND:', find)
            if (find) colDef = find
        }
        // console.log('== COL DEF', colDef)
        return colDef
    }

    /** Return a standardised table cell name. Either from a `data-col-name` attribute or a numeric reference like `C003`
     * @param {HTMLTableCellElement} cellEl The cell element to process
     * @param {number=} pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
     * @returns {string} A cell name
     */
    tblGetCellName(cellEl, pad = 3) {
        return cellEl.getAttribute('data-col-name') ?? `C${String(cellEl.cellIndex + 1).padStart(pad, '0')}`
    }

    /** Returns either the existing or calculated column metadata given any table
     * First checks if the data is on the `cols` custom property of the table
     * If not, then looks 1st for a row with a `data-col-reference` attribute. Then for the first TR of the thead. Then for the first TR of the table.
     * @param {HTMLTableElement} tblEl DOM table element
     * @param {object} [options] Additional options. Default={}
     *   @param {number=} options.pad Optional, default=3. Will be used to front-pad unnamed column references with zeros. e.g. 3 => "C002"/"C012"/"C342"
     * @returns {Array<columnDefinition>} Column metadata = array of column definitions
     */
    tblGetColMeta(tblEl, options = {}) {
        if (!options.pad) options.pad = 3

        // @ts-ignore If the table already has the cols custom prop, simply return it
        if (tblEl.cols) return tblEl.cols

        let cols = tblEl.querySelector('tr[data-col-reference]')?.children
        if (!cols) cols = tblEl.querySelector('thead>tr:first-of-type')?.children
        if (!cols) cols = tblEl.querySelector('tr:first-of-type')?.children

        if (!cols) {
            Ui.log(1, 'Ui:tblGetColMeta', 'No columns found in table')()
            return []
        }

        const colData = []

        /** @type {HTMLTableCellElement} */ let cellEl
        for (cellEl of cols) {
            const hasName = !!cellEl.dataset.colName
            const colName = cellEl.dataset.colName
            const colIndex = cellEl.cellIndex + 1
            const colKey = hasName ? colName : `C${String(cellEl.cellIndex + 1).padStart(options.pad, '0')}`

            colData.push({
                index: colIndex,
                hasName: hasName,
                name: colName,
                key: colKey,
                title: cellEl.textContent,
            })
        }

        // @ts-ignore Add the custom prop to the table element
        tblEl.cols = colData

        return colData
    }

    /** Remove a row from an existing table
     * @param {string|HTMLTableElement} tbl Either a CSS Selector for the table or a reference to the HTML Table Element
     * @param {number} rowIndex The row number to remove (1st row is 0, last row is -1)
     * @param {object} [options] Additional options
     *  @param {number=} options.body Optional, default=0. The tbody section to add the row to.
     */
    tblRemoveRow(tbl, rowIndex, options = {}) {
        const tblType = Object.prototype.toString.apply(tbl)

        if (Object.prototype.toString.apply(options) !== '[object Object]') throw new Error(`[tblRemoveRow] options must be an object`)

        /** @type {HTMLTableElement} */
        let tblEl
        if (tblType === '[object HTMLTableElement]') { // we were passed an actual table el
            // @ts-ignore
            tblEl = tbl
        } else { // we were passed a css selector
            // @ts-ignore
            tblEl = Ui.doc.querySelector(tbl)
            if (!tblEl) throw new Error(`[tblRemoveRow] Table with CSS Selector "${tbl}" not found`)
        }

        if (!options.body) options.body = 0

        const tbodyEl = tblEl.getElementsByTagName('tbody')[options.body]
        if (!tbodyEl) throw new Error(`[tblAddDataRow] Table must have a tbody tag, tbody section ${options.body} does not exist`)

        tbodyEl.deleteRow(rowIndex)
    }

    // #endregion --- table handling ---
}

export default Ui

// if (window) window['$ui'] = new Ui(window)

// export Ui
