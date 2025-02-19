/** A zero dependency web component that will display some metadata about the current web page.
 */
/*
  Copyright (c) 2024-2025 Julian Knight (Totally Information)

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

import TiBaseComponent from './ti-base-component'

// const template = document.createElement('template')
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<link type="text/css" rel="stylesheet" href=""../uibuilder/uib-brand.min.css"" media="all"><span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`
// {/* <style>@import url("../uibuilder/uib-brand.min.css");</style><span></span> */}
// `

/** Namespace
 * @namespace Live
 */

/**
 * @class
 * @extends TiBaseComponent
 * @description Define a new zero dependency custom web component ECMA module that can be used as an HTML tag
 *
 * @element component-template
 * @memberOf Live

 * METHODS FROM BASE:
  * @method config Update runtime configuration, return complete config
  * @method createShadowSelectors Creates the jQuery-like $ and $$ methods
  * @method deepAssign Object deep merger
  * @method doInheritStyles If requested, add link to an external style sheet
  * @method ensureId Adds a unique ID to the tag if no ID defined.
  * @method _connect Call from start of connectedCallback. Sets connected prop and creates shadow selectors
  * @method _event(name,data) Standardised custom event dispatcher
  * @method _disconnect Call from end of disconnectedCallback. Clears connected prop and removes shadow selectors
  * @method _ready Call from end of connectedCallback. Sets connected prop and outputs events
  * @method _uibMsgHandler Not yet in use
 * STANDARD METHODS:
  * @method attributeChangedCallback Called when an attribute is added, removed, updated or replaced
  * @method connectedCallback Called when the element is added to a document
  * @method constructor Construct the component
  * @method disconnectedCallback Called when the element is removed from a document

 * OTHER METHODS:
  * method doFilter Apply value filter if specified
  * @method doFormat(val,type) Format a value using this.format
  * @method doWatch Process changes to the required uibuilder variable
  * @method varDom(chkVal) Convert this.value to DOM output (applies output filter if needed)

 * CUSTOM EVENTS:
  * @fires component-template:connected - When an instance of the component is attached to the DOM. `evt.details` contains the details of the element.
  * @fires component-template:ready - Alias for connected. The instance can handle property & attribute changes
  * @fires component-template:disconnected - When an instance of the component is removed from the DOM. `evt.details` contains the details of the element.
  * @fires component-template:attribChanged - When a watched attribute changes. `evt.details.data` contains the details of the change.
  * NOTE that listeners can be attached either to the `document` or to the specific element instance.

 * @constructor
  * @throws {Error} Throws an error if the uibuilder client library is not available.
 
 * Standard watched attributes (common across all my components):
  * @attr {string|boolean} inherit-style - Optional. Load external styles into component (only useful if using template). If present but empty, will default to './index.css'. Optionally give a URL to load.
  * @attr {string} name - Optional. HTML name attribute. Included in output _meta prop.

 * Other watched attributes:
  * @attr {string} format - Optional. Format to apply to the output. Default is none. Options are 'd', 'dt', 't', 'k', 'm'
  * @attr {string} type - Optional. What type of metadata to display. Default is 'created'. Options are 'created', 'updated', 'crup', 'both', 'size', 'modified', 'all'

 * PROPS FROM BASE:
  * @prop {number} _iCount Static. The component version string (date updated)
  * @prop {boolean} uib True if UIBUILDER for Node-RED is loaded
  * @prop {object} uibuilder Reference to loaded UIBUILDER for Node-RED client library if loaded (else undefined)
  * @prop {function(string): Element} $ jQuery-like shadow dom selector (or undefined if shadow dom not used)
  * @prop {function(string): NodeList} $$  jQuery-like shadow dom multi-selector (or undefined if shadow dom not used)
  * @prop {boolean} connected False until connectedCallback finishes
  * @prop {string} name Placeholder for the optional name attribute
  * @prop {object} opts This components controllable options - get/set using the `config()` method - empty object by default
  * @prop {string} baseVersion Static. The base component version string (date updated).
 * OTHER STANDARD PROPS:
  * @prop {string} componentVersion Static. The component version string (date updated). Also has a getter that returns component and base version strings.

 * Other props:
  * @prop {string} format - Chosen formatting - default to none
  * @prop {'d'|'dt'|'t'|'k'|'m'} formats - what are the available formats?
  * @prop {boolean} report - Whether to send update value to Node-RED on change. Default is false
  * @prop {object} topicMonitors - Holds uibuilder.onTopic listeners
  * @prop {string} type - What is the value type. Default is 'created'
  * @prop {'created'|'updated'|'crup'|'both'| 'size'|'modified'|'all'} types - what are the available types?
  * @prop {boolean} undef - Whether to output if the variable is undefined. Default is false
  * @prop {*} value - Current value of the watched variable
  * @prop {string} variable - Name of the uibuilder managed variable to use. Default is 'pageMeta'
  * By default, all attributes are also created as properties

 * @slot Container contents

 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc

 * @example
  *  <div id="more">
  *    <uib-meta type="created" format="t"></uib-meta><br>
  *    <uib-meta format="d"></uib-meta><br>
  *    <uib-meta type="updated" format="dt"></uib-meta><br>
  *    <uib-meta type="crup" format="d"></uib-meta><br>
  *    <uib-meta type="size" format="k"></uib-meta><br>
  *  </div>
 */
class UibMeta extends TiBaseComponent {
    /** Component version */
    static componentVersion = '2025-01-06'

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
    types = ['created', 'updated', 'crup', 'both', 'size', 'modified', 'all', ]
    /** Chosen formatting - default to none */
    format = ''
    /** what are the available formats? */
    formats = ['d', 'dt', 't', 'k', 'm']
    /** Holds uibuilder.onTopic listeners */
    topicMonitors = {}
    
    // Makes HTML attribute change watched
    static get observedAttributes() {
        return [
            // Standard watched attributes:
            'inherit-style', 'name',
            // Other watched attributes:
            'type', 'format',
        ]
    }
    
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

        if (!this.uibuilder) throw new Error('[uib-meta] uibuilder client library not available')

        // Get the latest page metadata from the server
        this.value = this.uibuilder.get('pageMeta')
        if (!this.value) this.uibuilder.getPageMeta()
        this.doWatch()
    }

    // Runs when an instance is added to the DOM
    connectedCallback() {
        this._connect() // Keep at start.

        this._ready() // Keep at end. Let everyone know that a new instance of the component has been connected & is ready
    }

    // Runs when an instance is removed from the DOM
    disconnectedCallback() {
        this._disconnect() // Keep at end.
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
        // Create a property from the value - WARN: Be careful with name clashes
        // this[attrib] = newVal

        // Add other dynamic attribute processing here.
        // If attribute processing doesn't need to be dynamic, process in connectedCallback as that happens earlier in the lifecycle
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

        // Keep at end. Let everyone know that an attribute has changed for this instance of the component
        this._event('attribChanged', { attribute: attrib, newVal: newVal, oldVal: oldVal })
    }

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

        switch (this.type.toLowerCase()) {
            case 'all': {
                out = `Created: ${this.doFormat(this.value.created, 'dt')}, Updated: ${this.doFormat(this.value.modified, 'dt')}`
                out += `, Size: ${this.doFormat(this.value.size, 'num')}b`
                break
            }

            case 'size': { // File size in bytes
                out = `Size: ${this.doFormat(this.value.size, 'num')}b`
                break
            }

            case 'modified':
            case 'updated': { // updated dates
                out = `Updated: ${this.doFormat(this.value.modified, 'dt')}`
                break
            }

            case 'both': // both created and updated dates
            case 'created-updated':
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

// Make the class the default export so it can be used elsewhere
export default UibMeta

/** Self register the class to global
 * Enables new data lists to be dynamically added via JS
 * and lets the static methods be called
 */
window['UibMeta'] = UibMeta

// Add the class as a new Custom Element to the window object - Done by uibuilder client library otherwise uibuilder fns can't be used
// customElements.define('uib-meta', UibMeta)
