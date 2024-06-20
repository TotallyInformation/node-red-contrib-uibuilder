/** A zero dependency web component that will display some metadata about the current web page.
 *
 * @version 1.0.0 2024-06-01
 *
 * @example
 *  <div id="more">
 *    <uib-meta type="created" format="t"></uib-meta><br>
 *    <uib-meta format="d"></uib-meta><br>
 *    <uib-meta type="updated" format="dt"></uib-meta><br>
 *    <uib-meta type="crup" format="d"></uib-meta><br>
 *    <uib-meta type="size" format="k"></uib-meta><br>
 *  </div>
 */
/*
  Copyright (c) 2024-2024 Julian Knight (Totally Information)

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

export default class UibMeta extends HTMLElement {
    //#region --- Class Properties ---
    /** @type {string} Name of the uibuilder mangaged variable to use */
    variable = 'pageMeta'
    /** Current value of the watched variable */
    value
    /** Whether to output if the variable is undefined */
    undef = false
    /** Whether to send update value to Node-RED on change */
    report = false
    /** What is the value type */
    type = 'created'
    /** what are the available types? */
    types = ['created', 'updated', 'crup', 'size', 'modified',]
    /** Chosen formatting - default to none */
    format = ''
    /** what are the available formats? */
    formats = ['d', 'dt', 't', 'k', 'm']
    /** Holds uibuilder.onTopic listeners */
    topicMonitors = {}
    /** Is UIBUILDER loaded? */
    uib = !!window['uibuilder']

    /** Mini jQuery-like shadow dom selector (see constructor) */
    $

    /** Holds a count of how many instances of this component are on the page */
    static _iCount = 0
    /** @type {Array<string>} List of all of the html attribs (props) listened to */
    static props = ['type', 'format']
    //#endregion --- Class Properties ---

    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
        //  .append(template.content.cloneNode(true))

        this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot)

        // Apply external styles to the shadow dom - assumes you use index.css in same url location as main url
        // this.css = document.createElement('link')
        // this.css.setAttribute('type', 'text/css')
        // this.css.setAttribute('rel', 'stylesheet')
        // this.css.setAttribute('href', './index.css')

        // Get the latest page metadata from the server
        this.value = window['uibuilder'].get('pageMeta')
        if (!this.value) window['uibuilder'].getPageMeta()
        this.doWatch()

        this.dispatchEvent(new Event('uib-meta:construction', { bubbles: true, composed: true }))
    }

    // Makes HTML attribute change watched
    static get observedAttributes() {
        return UibMeta.props
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
            case 'type': {
                if (newVal === '' || !this.types.includes(newVal.toLowerCase())) this.type = 'created'
                else this.type = newVal
                break
            }

            case 'format': {
                if (!this.formats.includes(newVal.toLowerCase())) this.type = ''
                else this[attrib] = newVal
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
            else this.id = `uib-meta-${++UibMeta._iCount}`
        }
    }  // ---- end of connectedCallback ---- //

    // Runs when an instance is removed from the DOM
    // disconnectedCallback() {
    //     // Ignore if not using uibuilder
    //     if (this.uib) {
    //         Object.keys(this.topicMonitors).forEach( topic => {
    //             uibuilder.cancelTopic(topic, this.topicMonitors[topic])
    //         })
    //     }
    // } // ---- end of disconnectedCallback ---- //

    /** Process changes to the required uibuilder variable */
    doWatch() {
        // if (!this.variable) throw new Error('No variable name provided')
        // if (!this.uib) throw new Error('UIBUILDER client library not loaded - this component must be loaded AFTER the UIBUILDER library')

        // this.value = window['uibuilder'].get(this.variable)
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
        // const val = chkVal ? this.doFilter(this.value) : this.doFilter()

        // console.log('🧪 varDOM: ', val, typeof val, this.type)

        let out // = val

        switch (this.type) {
            case 'size': { // File size in bytes
                out = `Size: ${this.doFormat(this.value.size, 'num')}b`
                break
            }

            case 'modified':
            case 'updated': { // both created and updated dates
                out = `Updated: ${this.doFormat(this.value.modified, 'dt')}`
                break
            }

            case 'crup': {
                out = `Created: ${this.doFormat(this.value.created, 'dt')}, Updated: ${this.doFormat(this.value.modified, 'dt')}`
                break
            }

            case 'created':
            default: {
                out = `Created: ${this.doFormat(this.value.created, 'dt')}`
                break
            }
        }
        // if (this.uib) this.shadow.innerHTML = window['uibuilder'].sanitiseHTML(out)
        // else this.shadow.innerHTML = out
        if (out !== undefined) this.shadow.innerHTML = out

        // this.shadow.appendChild(this.css)
    }

    /** Format a value using this.format
     * @param {Date|string|number} val Value to format
     * @param {'num'|'dt'} type Type of of input
     * @returns {*} Formatted value
     */
    doFormat(val, type) {
        if (this.format === '') return val

        // ['d', 'dt', 't', 'k', 'm']
        let out
        switch (this.format) {
            case 'd': {
                if (type === 'dt') out = (new Date(val)).toLocaleDateString()
                else out = val
                break
            }

            case 't': {
                if (type === 'dt') out = (new Date(val)).toLocaleTimeString()
                else out = val
                break
            }

            case 'dt': {
                if (type === 'dt') out = (new Date(val)).toLocaleString()
                else out = val
                break
            }

            case 'k': {
                if (type === 'num') out = `${uibuilder.round(val/1024, 1)} k`
                else out = val
                break
            }

            case 'm': {
                if (type === 'num') out = `${uibuilder.round(val/1048576, 2)} M`
                else out = val
                break
            }

            default: {
                out = val
                // break
            }
        }
        return out
    }

    /** Apply value filter if specified
     * @param {*} value The value to change
     * @returns {*} The amended value that will be displayed
     */
    // doFilter(value) {
    //     if (this.filter) {
    //         // Cater for dotted notation functions (e.g. uibuilder.get)
    //         const splitFilter = this.filter.split('.')
    //         let globalFn = globalThis[splitFilter[0]]
    //         if (globalFn && splitFilter.length > 1) {
    //             const parts = [splitFilter.pop()]
    //             parts.forEach( part => {
    //                 globalFn = globalFn[part]
    //             } )
    //         }
    //         if (!globalFn && this.uib === true) globalFn = globalThis['uibuilder'][splitFilter[0]]
    //         if (globalFn && typeof globalFn !== 'function' ) globalFn = undefined
    //         if (globalFn) {
    //             const argList = value === undefined ? [...this.filterArgs] : [value, ...this.filterArgs]
    //             value = Reflect.apply(globalFn, value ?? globalFn, argList)
    //         } else {
    //             console.warn(`⚠️ [uib-var] Filter function "${this.filter}" ${typeof globalFn === 'object' ? 'is an object not a function' : 'not found'}`)
    //         }
    //     }

    //     return value
    // }
}

// Add the class as a new Custom Element to the window object
// customElements.define('uib-meta', UibMeta)
