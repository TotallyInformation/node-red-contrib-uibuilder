/** A zero dependency web component that will display a managed uibuilder variable.
 *
 * Version: 0.0.1 2023-10-07
 *
 * ToDo:
 * -
 */
/*
  Copyright (c) 2023 Julian Knight (Totally Information)

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

const template = document.createElement('template')
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<span></span>`
template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<div></div>`

export default class UibVar extends HTMLElement {
    //#region --- Class Properties ---
    /** @type {string} Name of the uibuilder mangaged variable to use */
    variable
    /** Current value of the watched variable */
    value
    /** Whether to output if the variable is undefined */
    undefined = false
    /** Whether to send update value to Node-RED on change */
    report = false
    /** What is the value type */
    type = 'plain'
    /** what are the available types? */
    types = ['plain', 'html', 'markdown', 'object']

    /** Mini jQuery-like shadow dom selector (see constructor) */
    $
    
    /** Holds a count of how many instances of this component are on the page */
    static _iCount = 0
    /** @type {Array<string>} List of all of the html attribs (props) listened to */
    static props = ['name', 'id', 'variable', 'undefined', 'report', 'type']
    //#endregion --- Class Properties ---

    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open', delegatesFocus: true })
            // .append(template.content.cloneNode(true))

        this.$ = this.shadowRoot.querySelector.bind(this.shadowRoot)

        this.dispatchEvent(new Event(`uib-var:construction`, { bubbles: true, composed: true }))
    }

    // Makes HTML attribute change watched
    static get observedAttributes() {
        return UibVar.props
    }

    /** NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called  */
    attributeChangedCallback(attrib, oldVal, newVal) {
        if ( oldVal === newVal ) return

        switch (attrib) {
            case 'variable': {
                if (newVal === '') throw new Error('[uib-var] Attribute "variable" MUST be set to a UIBUILDER managed variable name')
                this.variable = newVal
                this.doWatch()
                break
            }
            case 'undefined': {
                if (newVal === '' || ['on', 'true', 'report'].includes(newVal.toLowerCase())) this.undefined = true
                else this.undefined = false
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
    // disconnectedCallback() {} // ---- end of disconnectedCallback ---- //

    /** Process changes to the required uibuilder variable */
    doWatch() {
        if (!this.variable) throw new Error('No variable name provided')
        // if (!window['uibuilder']) throw new Error('UIBUILDER client library not loaded - this component must be loaded AFTER the UIBUILDER library')

        this.value = window['uibuilder'].get(this.variable)
        this.varDom()

        // Watch for changes in the variable
        window['uibuilder'].onChange(this.variable, (val) => {
            this.value = val
            this.varDom()
            if (this.report === true) window['uibuilder'].send({topic: this.variable, payload: this.value || undefined})
        })
    }

    /** Convert this.value to DOM output */
    varDom() {
        if (this.value === undefined && this.undefined !== true) { this.shadow.innerHTML = ''; return }
        
        let val = this.value

        // console.log('🧪 varDOM: ', val, typeof val, this.type)

        switch (this.type) {
            case 'markdown': {
                this.shadow.innerHTML = window['uibuilder'].sanitiseHTML(window['uibuilder'].convertMarkdown(val))
                break
            }
        
            case 'object': {
                // console.log(window['uibuilder'].syntaxHighlight(val))
                this.shadow.innerHTML = `<pre class="syntax-highlight">${window['uibuilder'].syntaxHighlight(val)}</pre>`
                break
            }
        
            case 'plain':
            case 'html':
            default: {
                const t = typeof val
                if (Array.isArray(val) || t === '[object Object]' || t === 'object') {
                    try {
                        this.shadow.innerHTML = JSON.stringify(val)
                    } catch (e) {
                        this.shadow.innerHTML = val
                    }
                } else {
                    this.shadow.innerHTML = val
                }
                break
            }
        }

        // this.$('span').innerHTML = window['uibuilder'].sanitiseHTML(val)
        // this.shadow.innerHTML = window['uibuilder'].sanitiseHTML(val)
    }
}

// Add the class as a new Custom Element to the window object 
// customElements.define('uib-var', UibVar)
