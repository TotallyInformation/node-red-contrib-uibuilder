/** A zero dependency web component that will display a managed uibuilder variable.
 *
 * Version: See component version
 */
/*
  Copyright (c) 2023-2024 Julian Knight (Totally Information)

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

/** TODO
 * - Move other attrib change processing to setters
 */

// const template = document.createElement('template')
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<link type="text/css" rel="stylesheet" href=""../uibuilder/uib-brand.min.css"" media="all"><span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`
// {/* <style>@import url("../uibuilder/uib-brand.min.css");</style><span></span> */}
// `

class UibVar extends HTMLElement {
    /** Component version */
    static version = '2024-10-04'

    //#region --- Class Properties ---

    connected = false
    /** Name of the uibuilder mangaged variable to use @type {string} */
    #variable
    /** Current value of the watched variable */
    value
    /** Holds reference to var watch callback so it can be cancelled @type {Function} */
    #varCb
    /** The watched msg topic @type {string} */
    #topic
    /** Holds reference to topic watch callback so it can be cancelled @type {Function} */
    #topicCb
    /** Whether to output if the variable is undefined */
    undef = false
    /** Whether to send update value to Node-RED on change */
    report = false
    /** What is the value type */
    type = 'plain'
    /** what are the available types? */
    types = ['plain', 'html', 'markdown', 'object', 'json', 'table', 'list', 'array']
    /** Is UIBUILDER loaded? */
    uib = !!window['uibuilder']
    uibuilder = window['uibuilder']

    /** Mini jQuery-like shadow dom selector (see constructor) */
    $

    /** Holds a count of how many instances of this component are on the page */
    static _iCount = 0

    // Makes HTML attribute change watched
    static get observedAttributes() {
        return [
            'filter', 'id', 'name', 'report', 
            'topic', 'type', 'undefined', 'variable',
        ]
    }

    
    //#endregion --- Class Properties ---

    constructor() {
        super()
        // this.shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
        //  .append(template.content.cloneNode(true))

        // this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot)

        // Apply external styles to the shadow dom - assumes you use index.css in same url location as main url
        // this.css = document.createElement('link')
        // this.css.setAttribute('type', 'text/css')
        // this.css.setAttribute('rel', 'stylesheet')
        // this.css.setAttribute('href', './index.css')

        // this.dispatchEvent(new Event('uib-var:construction', { bubbles: true, composed: true }))
        this.uibuilder.log('trace', this.localName, `Constructor end`)
    }

    /** Set the uibuilder variable name to watch */
    set variable(varName) {
        this.#variable = varName
        this.splitVarName
        if (varName) {
            // console.log('resolving', this.resolveVariable(varName))
            try {
                this.splitVarName = varName.split(/[\.\[\]\'\"]/)
                this.#variable = varName = this.splitVarName.shift()
            } catch (e) {
                throw new Error(`[${this.localName}] variable attribute: Name split failed on "${varName}". ${e.message}`)
            }
        }

        // Stop any previous variable or topic settings
        if (this.#varCb) this.uibuilder.cancelChange(varName, this.#varCb)

        if (!varName) return

        // NB: We don't show an initial current value when the variable name is set.
        //     We wait for the value of the variable to change then show.

        // Watch for changes in the variable (could use `uibuilder:propertyChanged:${prop}` event instead)
        this.#varCb = this.uibuilder.onChange(varName, this._varChange.bind(this))
    }

    /** Get the watched uibuilder variable name */
    get variable() {
        return this.#variable
    }

    /** Set the uibuilder msg topic to watch. We could use `uibuilder:msg:topic:${msg.topic}` event instead */
    set topic(topicName) {
        this.#topic = topicName
        // Stop any previous variable or topic settings
        if (this.#topicCb) this.uibuilder.cancelTopic(topicName, this.#topicCb)
        
        // Handle empty topic
        if (!topicName) return

        // Set up a uibuilder listener for this topic - ASSUMES msg.payload contains the VALUE to show
        this.#topicCb = this.uibuilder.onTopic(topicName, this._topicChange.bind(this))
    }

    /** Get the watched uibuilder msg topic */
    get topic() {
        return this.#topic
    }

    // Runs when an instance is added to the DOM
    connectedCallback() {
        // Make sure instance has an ID. Create an id from name or calculation if needed
        this._ensureId()  // Keep at start.

        // Initial process of key attributes
        this.variable = this.getAttribute('variable')
        this.topic = this.getAttribute('topic')

        this._ready() // Keep at end. Let everyone know that a new instance of the component has been connected & is ready
    }

    // Runs when an instance is removed from the DOM
    disconnectedCallback() {
        // Stop any previous variable or topic settings
        if (this.#varCb) this.uibuilder.cancelChange(this.#variable, this.#varCb)
        if (this.#topicCb) this.uibuilder.cancelTopic(this.#topic, this.#topicCb)

        Object.keys(this.#topicCb).forEach( topic => {
            this.uibuilder.cancelTopic(topic, this.#topicCb[topic])
        })

        // Keep at end. Let everyone know that an instance of the component has been disconnected
        this._event('disconnected')
    }

    /** Handle watched attributes
     * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
     * Attribute values can only ever be strings
     * @param {string} attrib The name of the attribute that is changing
     * @param {string} newVal The new value of the attribute
     * @param {string} oldVal The old value of the attribute
     */
    attributeChangedCallback(attrib, oldVal, newVal) {
        /** Optionally ignore attrib changes until instance is fully connected
         * Otherwise this can fire BEFORE everthing is fully connected.
         */
        // if (!this.connected) return

        // Don't bother if the new value same as old
        if ( oldVal === newVal ) return
        // Create a property from the value - WARN: Be careful with name clashes - triggers setters
        this[attrib] = newVal

        switch (attrib) {
            case 'undefined': {
                if (newVal === '' || ['on', 'true', 'report'].includes(newVal.toLowerCase())) this.undef = true
                else this.undef = false
                break
            }
            case 'report': {
                if (newVal === '' || ['on', 'true', 'report'].includes(newVal.toLowerCase())) this.report = true
                else this.report = false
                break
            }
            case 'type': {
                if (newVal === '' || !this.types.includes(newVal.toLowerCase())) this.type = 'plain'
                else this.type = newVal
                break
            }
            case 'filter': {
                this.filter = undefined
                this.filterArgs = []

                // Handle empty filter
                if (!newVal) break

                this.filter = newVal

                // Filter the input - at least limit the length of the attr
                newVal = newVal.slice(0, 127)
                // Remove spaces and then separate fn name from potential extra arguments
                const f = newVal.replace(/\s/g, '').match(/([a-zA-Z_$][a-zA-Z_$0-9.-]+)(\((.*)\))?/)
                if (!f) {
                    console.warn(`⚠️ [uib-var] Filter function "${newVal}" invalid. Cannot process.`)
                    break
                }
                // Fn name
                this.filter = f[1]
                // Fn arguments
                if (f[3]) { // undefined if no args found
                    // TODO Do we really want to try this?
                    try {
                        this.filterArgs = JSON.parse(f[3])
                    } catch (e) {}

                    this.filterArgs = f[3].split(',').map((x) => {
                        // No objects/arrays allowed - if they have a , they are split
                        x = x.trim()
                        // @ts-ignore NB: Do NOT use Number.isNaN here, it is too narrow minded
                        if (isNaN(x)) {
                            // String inside string ends up double quoted so remove those
                            let y = x.replace(/^["'`]/, '').replace(/["'`]$/, '')
                            // Attempt very limited parse in case it is valid object/array
                            try {
                                y = new Function(`return ${y}`)() // eslint-disable-line no-new-func
                            } catch (e) {}
                            return y
                        }
                        return Number(x)
                    })
                }

                // Apply the filter directly if neither variable nor topic attribs set
                if (!this.variable && !this.topic) this.showVar(false)
                break
            }

            default: {
                break
            }
        }

        // Keep at end. Let everyone know that an attribute has changed for this instance of the component
        this._event('attribChanged', { attribute: attrib, newVal: newVal, oldVal: oldVal })
    } // --- end of attributeChangedCallback --- //

    /** Ensure that the component instance has a unique ID & check again if uib loaded */
    _ensureId() {
        // Check again if UIBUILDER for Node-RED is loaded
        this.uib = !!window['uibuilder']
        this.uibuilder = window['uibuilder']

        if (!this.id) {
            // if (!this.name) this.name = this.getAttribute('name')
            // if (this.name) this.id = this.name.toLowerCase().replace(/\s/g, '_')
            // else this.id = `${this.localName}-${++this.constructor._iCount}`
            // @ts-ignore
            this.id = `${this.localName}-${++this.constructor._iCount}`
        }
    }

    /** Call from end of connectedCallback */
    _ready() {
        this.connected = true
        this._event('connected')
        this._event('ready')
    }

    /** Custom event dispacher `component-name:name` with detail data
     * @example
     *   this._event('ready')
     * @example
     *   this._event('ready', {age: 42, type: 'android'})
     *
     * @param {string} name A name to give the event, added to the component-name separated with a :
     * @param {*=} data Optional data object to pass to event listeners via the evt.detail property
     */
    _event(name, data) {
        this.dispatchEvent(new CustomEvent(`${this.localName}:${name}`, {
            bubbles: true,
            composed: true,
            detail: {
                id: this.id,
                name: this.name,
                data: data,
            },
        } ) )
    }

    /** Process watched uibuilder variable value change
     * @param {*} value The value of the managed uibuilder variable
     */
    _varChange(value) {
        // If varname was nested object - get the real value - silently exit if the path can't be traversed (found)
        let success = true
        if (this.splitVarName.length > 0) {
            let target = value
            let partSuccess = []
            try {
                this.splitVarName.forEach( part => {
                    let successPart
                    if (target[part] === undefined) successPart = false
                    else successPart = true
                    partSuccess.push(successPart)
                    target = target[part]
                })
                value = target
                success = partSuccess.filter(Boolean).length > 0 ? true : false
            } catch (e) {
                success = false
            }
        }
        if (success) {
            this.value = value
            this.showVar()
            if (this.report === true) this.uibuilder.send({ topic: this.variable, payload: this.value || undefined, source: this.localName, id: this.id, })
        }
    }

    /** Process watched uibuilder msg.topic received
     * @param {object} msg The value of the managed uibuilder variable
     */
    _topicChange(msg) {
        this.uibuilder.log('trace', this.localName, `Topic msg received: '${msg.topic}'`, msg)
        // console.log('🔦 topicMonitor ⟫', newVal, msg)
        this.value = msg.payload
        this.showVar()
        if (this.report === true) this.uibuilder.send({ topic: msg.topic, payload: this.value || undefined, source: this.localName, id: this.id, })
    }
    
    /** Convert this.value to DOM output (applies output filter if needed)
     * @param {boolean} chkVal If true (default), check for undefined value. False used to run filter even with no value set.
     */
    showVar(chkVal = true) {
        this.uibuilder.log('trace', this.localName, `showVar. chkVal: '${chkVal}'. Value=`, this.value)

        // If user doesn't want to show undefined vars, allow the component slot to show instead
        if (chkVal === true && !this.value && this.undef !== true) {
            // this.shadow.innerHTML = '<slot></slot>'
            return
        }

        // Apply the filter to the value before display
        let val = chkVal ? this.doFilter(this.value) : this.doFilter()

        // console.log('🔦 varDOM ⟫ ', val, typeof val, this.type)

        let out = val

        switch (this.type) {
            case 'markdown': {
                if (this.uib) out = this.uibuilder.convertMarkdown(val)
                break
            }

            case 'json':
            case 'object': {
                // console.log(this.uibuilder.syntaxHighlight(val))
                out = `<pre class="syntax-highlight">${this.uib ? this.uibuilder.syntaxHighlight(val) : val}</pre>`
                break
            }

            case 'table': {
                // console.log('🔦 val ⟫', val)
                // if (!Array.isArray(val)) {
                //     out = '<code>Contents of msg.payload is not an array which is required for table output.</code>'
                //     break
                // }
                out = this.uibuilder.buildHtmlTable(val).outerHTML
                break
            }

            case 'array':
            case 'list': {
                if (!Array.isArray(val)) val = [val]
                // console.log('🔦 val ⟫', val)
                out = '<ul>'
                val.forEach( li => {
                    out += `<li>${li}</li>`
                })
                out += '</ul>'
                break
            }

            case 'plain':
            case 'html':
            default: {
                const t = typeof val
                // @ts-ignore
                if (Array.isArray(val) || t === '[object Object]' || t === 'object') {
                    try {
                        out = JSON.stringify(val)
                    } catch (e) {}
                }
                break
            }
        }

        // if (this.uib) this.shadow.innerHTML = this.uibuilder.sanitiseHTML(out)
        // else this.shadow.innerHTML = out
        if (this.uib) this.innerHTML = this.uibuilder.sanitiseHTML(out)
        else this.innerHTML = out

        // this.shadow.appendChild(this.css)
    }

    /** Apply value filter if specified
     * @param {*} value The value to change
     * @returns {*} The amended value that will be displayed
     */
    doFilter(value) {
        if (this.filter) {
            // Cater for dotted notation functions (e.g. uibuilder.get)
            const splitFilter = this.filter.split('.')
            let globalFn = globalThis[splitFilter[0]]
            if (globalFn && splitFilter.length > 1) {
                const parts = [splitFilter.pop()]
                parts.forEach( part => {
                    globalFn = globalFn[part]
                } )
            }
            if (!globalFn && this.uib === true) globalFn = globalThis['uibuilder'][splitFilter[0]]
            if (globalFn && typeof globalFn !== 'function' ) globalFn = undefined
            if (globalFn) {
                const argList = value === undefined ? [...this.filterArgs] : [value, ...this.filterArgs]
                value = Reflect.apply(globalFn, value ?? globalFn, argList)
            } else {
                console.warn(`⚠️ [uib-var] Filter function "${this.filter}" ${typeof globalFn === 'object' ? 'is an object not a function' : 'not found'}`)
            }
        }

        return value
    }
}

// Make the class the default export so it can be used elsewhere
export default UibVar

/** Self register the class to global
 * Enables new data lists to be dynamically added via JS
 * and lets the static methods be called
 */
window['UibVar'] = UibVar

// Add the class as a new Custom Element to the window object - Done by uibuilder client library otherwise uibuilder fns can't be used
// customElements.define('uib-var', UibVar)
