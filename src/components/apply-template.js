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

const uib = window['uibuilder']

// const template = document.createElement('template')
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`<link type="text/css" rel="stylesheet" href=""../uibuilder/uib-brand.min.css"" media="all"><span></span>`
// template.innerHTML = /** @type {HTMLTemplateElement} */ /*html*/`
// {/* <style>@import url("../uibuilder/uib-brand.min.css");</style><span></span> */}
// `

/**
 * ApplyTemplate is a custom HTML element that allows you to apply a template to the DOM.
 * It listens to changes in specific attributes and updates the DOM accordingly.
 * 
 * @class ApplyTemplate
 * @extends {HTMLElement}
 * 
 * @property {number} static _iCount - Holds a count of how many instances of this component are on the page.
 * @property {Array<string>} static props - List of all of the HTML attributes (props) listened to.
 * @property {boolean} once - Holder for the once attribute.
 * @property {Object} log - Holder for the uibuilder log.
 * 
 * @constructor
 * @throws {Error} Throws an error if the uibuilder client library is not available.
 * 
 * @method static get observedAttributes - Makes HTML attribute changes watched.
 * @returns {Array<string>} The list of observed attributes.
 * 
 * @method attributeChangedCallback - Handle watched attributes.
 * @param {string} attrib - The name of the attribute that is changing.
 * @param {string} oldVal - The old value of the attribute.
 * @param {string} newVal - The new value of the attribute.
 * 
 * @method connectedCallback - Runs when an instance is added to the DOM.
 */
export default class ApplyTemplate extends HTMLElement {
    //#region --- Class Properties ---
    /** Holds a count of how many instances of this component are on the page */
    static _iCount = 0
    /** @type {Array<string>} List of all of the html attribs (props) listened to */
    static props = ['template-id', 'once']
    // Holder for once attribute
    once = false
    // Holder for uibuilder log
    log
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

        // Get the latest page metadata from the server
        // this.value = window['uibuilder'].get('pageMeta')
        // if (!this.value) window['uibuilder'].getPageMeta()
        // this.doWatch()

        if (!window['uibuilder']) throw new Error('uibuilder client library not available')
        this.log = window['uibuilder'].log
        this.dispatchEvent(new Event('apply-template:construction', { bubbles: true, composed: true }))
    }

    // Makes HTML attribute change watched
    static get observedAttributes() {
        return ApplyTemplate.props
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
        this[attrib] = newVal
    } // --- end of attributeChangedCallback --- //

    // Runs when an instance is added to the DOM
    connectedCallback() {
        const templateId = this['template-id']
        const onceOnly = this['once']

        if (templateId) {
            const template = document.getElementById(templateId)

            if (template) {
                try {
                    let content
                    if (onceOnly === false) {
                        content = document.importNode(template.content, true)
                    } else {
                        content = document.adoptNode(template.content)
                    }
                    // NB content.childElementCount = 0 after adoption
                    this.appendChild(content)
                } catch (e) {
                    this.log('error', 'ApplyTemplate', `Source must be a <template>. id='${templateId}'`)
                }
            } else {
                this.log('error', 'ApplyTemplate', `Source not found: id='${templateId}'`)
            }
        } else {
            this.log('error', 'ApplyTemplate', 'Template id attribute not provided. Template must be identified by an id attribute.')
        }
    }
}

// Add the class as a new Custom Element to the window object
// customElements.define('uib-meta', UibMeta)
