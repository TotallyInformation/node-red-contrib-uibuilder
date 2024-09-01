/** A zero dependency web component that will display a managed uibuilder variable.
 *
 * Version: 1.0.1 2023-12-27
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

// const template = document.createElement('template')
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<link type="text/css" rel="stylesheet" href=""../uibuilder/uib-brand.min.css"" media="all"><span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`
// {/* <style>@import url("../uibuilder/uib-brand.min.css");</style><span></span> */}
// `

export default class UibVar extends HTMLElement {
    //#region --- Class Properties ---
    /** @type {string} Name of the uibuilder mangaged variable to use */
    variable
    /** Current value of the watched variable */
    value
    /** Whether to output if the variable is undefined */
    undef = false
    /** Whether to send update value to Node-RED on change */
    report = false
    /** What is the value type */
    type = 'plain'
    /** what are the available types? */
    types = ['plain', 'html', 'markdown', 'object', 'json', 'table', 'list', 'array']
    /** Holds uibuilder.onTopic listeners */
    topicMonitors = {}
    /** Is UIBUILDER loaded? */
    uib = !!window['uibuilder']

    /** Mini jQuery-like shadow dom selector (see constructor) */
    $

    /** Holds a count of how many instances of this component are on the page */
    static _iCount = 0
    /** @type {Array<string>} List of all of the html attribs (props) listened to */
    static props = ['filter', 'id', 'name', 'report', 'topic', 'type', 'undefined', 'variable',]
    //#endregion --- Class Properties ---

    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
        //  .append(template.content.cloneNode(true))

        this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot)

        // Apply external styles to the shadow dom - assumes you use index.css in same url location as main url
        this.css = document.createElement('link')
        this.css.setAttribute('type', 'text/css')
        this.css.setAttribute('rel', 'stylesheet')
        this.css.setAttribute('href', './index.css')

        this.dispatchEvent(new Event('uib-var:construction', { bubbles: true, composed: true }))
    }

    // Makes HTML attribute change watched
    static get observedAttributes() {
        return UibVar.props
    }

    /** Handle watched attributes
     * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
     * Attribute values can only ever be strings
     * @param {string} attrib The name of the attribute that is changing
     * @param {string} newVal The new value of the attribute
     * @param {string} oldVal The old value of the attribute
     */
    attributeChangedCallback(attrib, oldVal, newVal) {
        if ( oldVal === newVal ) return

        switch (attrib) {
            case 'variable': {
                // NB Doesn't check if var exists because it might not be set yet
                if (newVal === '') throw new Error('[uib-var] Attribute "variable" MUST be set to a UIBUILDER managed variable name')
                this.variable = newVal
                this.doWatch()
                break
            }
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
            case 'topic': {
                // console.log(1, attrib, newVal)
                // Handle empty topic
                if (!newVal) break
                // Ignore if not using uibuilder
                if (!this.uib) break
                // If variable attrib set, give warning and ignore
                if (this.variable) {
                    console.warn('⚠️ [uib-var] Cannot process both variable and topic attributes, use only 1. Using variable')
                    break
                }

                this.topic = newVal

                // Cancel old listener just in case
                if (this.topicMonitors[newVal]) uibuilder.cancelTopic(newVal, this.topicMonitors[newVal])
                // Set up a uibuilder listener for this topic - ASSUMES msg.payload contains the VALUE to show
                this.topicMonitors[newVal] = uibuilder.onTopic(newVal, (msg) => {
                    // console.log('🔦 topicMonitor ⟫', newVal, msg)
                    this.value = msg.payload
                    this.varDom()
                    if (this.report === true) window['uibuilder'].send({ topic: this.variable, payload: this.value || undefined })
                })
                this.varDom()

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
                if (!this.variable && !this.topic) this.varDom(false)
                break
            }

            default: {
                this[attrib] = newVal
                break
            }
        }
    } // --- end of attributeChangedCallback --- //

    // Runs when an instance is added to the DOM
    connectedCallback() {
        // Make sure instance has an ID. Create an id from name or calculation if needed
        if (!this.id) {
            if (!this.name) this.name = this.getAttribute('name')
            if (this.name) this.id = this.name.toLowerCase().replace(/\s/g, '_')
            else this.id = `uib-var-${++UibVar._iCount}`
        }
    }  // ---- end of connectedCallback ---- //

    // Runs when an instance is removed from the DOM
    disconnectedCallback() {
        // Ignore if not using uibuilder
        if (this.uib) {
            Object.keys(this.topicMonitors).forEach( topic => {
                uibuilder.cancelTopic(topic, this.topicMonitors[topic])
            })
        }
    } // ---- end of disconnectedCallback ---- //

    /** Process changes to the required uibuilder variable */
    doWatch() {
        if (!this.variable) throw new Error('No variable name provided')
        // if (!this.uib) throw new Error('UIBUILDER client library not loaded - this component must be loaded AFTER the UIBUILDER library')

        this.value = window['uibuilder'].get(this.variable)
        this.varDom()

        // Watch for changes in the variable
        window['uibuilder'].onChange(this.variable, (val) => {
            this.value = val
            this.varDom()
            if (this.report === true) window['uibuilder'].send({ topic: this.variable, payload: this.value || undefined })
        })
    }

    /** Convert this.value to DOM output (applies output filter if needed)
     * @param {boolean} chkVal If true (default), check for undefined value. False used to run filter even with no value set.
     */
    varDom(chkVal = true) {
        // If user doesn't want to show undefined vars, allow the component slot to show instead
        if (chkVal === true && !this.value && this.undef !== true) {
            this.shadow.innerHTML = '<slot></slot>'
            return
        }

        // Apply the filter to the value before display
        let val = chkVal ? this.doFilter(this.value) : this.doFilter()

        // console.log('🔦 varDOM ⟫ ', val, typeof val, this.type)

        let out = val

        switch (this.type) {
            case 'markdown': {
                if (this.uib) out = window['uibuilder'].convertMarkdown(val)
                break
            }

            case 'json':
            case 'object': {
                // console.log(window['uibuilder'].syntaxHighlight(val))
                out = `<pre class="syntax-highlight">${this.uib ? window['uibuilder'].syntaxHighlight(val) : val}</pre>`
                break
            }

            case 'table': {
                // console.log('🔦 val ⟫', val)
                // if (!Array.isArray(val)) {
                //     out = '<code>Contents of msg.payload is not an array which is required for table output.</code>'
                //     break
                // }
                out = window['uibuilder'].sanitiseHTML(window['uibuilder'].buildHtmlTable(val).outerHTML)
                break
            }

            case 'array':
            case 'list': {
                if (!Array.isArray(val)) val = [val]
                // console.log('🔦 val ⟫', val)
                out = '<ul>'
                val.forEach( li => {
                    out += `<li>${window['uibuilder'].sanitiseHTML(li)}</li>`
                })
                out += '</ul>'
                break
            }

            case 'plain':
            case 'html':
            default: {
                const t = typeof val
                if (Array.isArray(val) || t === '[object Object]' || t === 'object') {
                    try {
                        out = JSON.stringify(val)
                    } catch (e) {}
                }
                break
            }
        }
        if (this.uib) this.shadow.innerHTML = window['uibuilder'].sanitiseHTML(out)
        else this.shadow.innerHTML = out

        this.shadow.appendChild(this.css)
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

// Add the class as a new Custom Element to the window object
// customElements.define('uib-var', UibVar)
