/** A web component that applies a template to the DOM.
 *
 * Version: See component version
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

import TiBaseComponent from './ti-base-component.mjs'

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
 * ApplyTemplate is a custom HTML element that allows you to apply a template to the DOM.
 * It listens to changes in specific attributes and updates the DOM accordingly.
 * 
 * @class ApplyTemplate
 * @extends TiBaseComponent
 * @description Applies an HTML template to the DOM
 * 
 * @element apply-template
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
 * None

 * @fires apply-template:connected - When an instance of the component is attached to the DOM. `evt.details` contains the details of the element.
 * @fires apply-template:ready - Alias for connected. The instance can handle property & attribute changes
 * @fires apply-template:disconnected - When an instance of the component is removed from the DOM. `evt.details` contains the details of the element.
 * @fires apply-template:attribChanged - When a watched attribute changes. `evt.details.data` contains the details of the change.
 * NOTE that listeners can be attached either to the `document` or to the specific element instance.

 * @constructor
 * @throws {Error} Throws an error if the uibuilder client library is not available.
 
 * Standard watched attributes (common across all my components):
 * attr {string|boolean} inherit-style - Optional. Load external styles into component (only useful if using template). If present but empty, will default to './index.css'. Optionally give a URL to load.
 * @attr {string} name - Optional. HTML name attribute. Included in output _meta prop.

 * Other watched attributes:
 * @attr {string} template-id - Required. The ID of the template to apply.
 * @attr {string|boolean} once - Optional. If true, the template can only be used once. Default is false.

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
 * @property {boolean} once - Holder for the once attribute. If true, the template can only be used once. Default is false.
 * @property {string} template-id - The ID of the template to apply.
 * By default, all attributes are also created as properties

 * @slot Container contents (only if used template contains a slot)

 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc
 */
class ApplyTemplate extends TiBaseComponent {
    /** Component version */
    static componentVersion = '2025-08-28'

    // Holder for once attribute
    once = false

    /** Makes HTML attribute change watched
     * @returns {Array<string>} List of all of the html attribs (props) listened to
     */
    static get observedAttributes() {
        return [
            // Standard watched attributes:
            /* 'inherit-style', */ 'name',
            // Other watched attributes:
            'template-id', 'once',
        ]
    }

    /** NB: Attributes not available here - use connectedCallback to reference */
    constructor() {
        super()
        // Only attach the shadow dom if code and style isolation is needed - comment out if shadow dom not required
        // if (template && template.content) this._construct(template.content.cloneNode(true))
        // Otherwise, if component styles are needed, use the following instead:
        // this.prependStylesheet(styles, 0)

        if (!this.uibuilder) throw new Error('[apply-template] uibuilder client library not available')
    }

    /** Runs when an instance is added to the DOM
     * Runs AFTER the initial attributeChangedCallback's
     * @private
     */
    connectedCallback() {
        this._connect() // Keep at start.

        const templateId = this['template-id']
        const onceOnly = this['once']

        if (!templateId) {
            throw new Error('[ApplyTemplate] Template id attribute not provided. Template must be identified by an id attribute')
        }

        const template = document.getElementById(templateId)
        if (!template || template.tagName !== 'TEMPLATE') {
            throw new Error(`[ApplyTemplate] Source must be a <template>. id='${templateId}'`)
        }

        const existContent = this.innerHTML
        this.innerHTML = '' // Clear any existing content

        let templateContent
        if (onceOnly === false) {
            // @ts-ignore
            templateContent = document.importNode(template.content, true)
        } else {
            // NB content.childElementCount = 0 after adoption
            // @ts-ignore
            templateContent = document.adoptNode(template.content)
        }

        this.appendChild(templateContent)

        if (existContent) {
            const slot = this.getElementsByTagName('slot')
            if (slot.length > 0) {
                slot[0].innerHTML = existContent
            }
        }

        this._ready() // Keep at end. Let everyone know that a new instance of the component has been connected & is ready
    }

    /** Runs when an instance is removed from the DOM
     * @private
     */
    disconnectedCallback() {
        this._disconnect() // Keep at end.
    }

    /** Runs when an observed attribute changes - Note: values are always strings
     * NOTE: On initial startup, this is called for each watched attrib set in HTML.
     *       and BEFORE connectedCallback is called.
     * @param {string} attrib Name of watched attribute that has changed
     * @param {string} oldVal The previous attribute value
     * @param {string} newVal The new attribute value
     * @private
     */
    attributeChangedCallback(attrib, oldVal, newVal) {
        /** Optionally ignore attrib changes until instance is fully connected
         * Otherwise this can fire BEFORE everthing is fully connected.
         */
        // if (!this.connected) return

        // Don't bother if the new value same as old
        if ( oldVal === newVal ) return
        // Create a property from the value - WARN: Be careful with name clashes
        this[attrib] = newVal

        // Add other dynamic attribute processing here.
        // If attribute processing doesn't need to be dynamic, process in connectedCallback as that happens earlier in the lifecycle

        // Keep at end. Let everyone know that an attribute has changed for this instance of the component
        this._event('attribChanged', { attribute: attrib, newVal: newVal, oldVal: oldVal, })
    }
}

// Make the class the default export so it can be used elsewhere
export default ApplyTemplate

/** Self register the class to global
 * Enables new data lists to be dynamically added via JS
 * and lets the static methods be called
 */
window['ApplyTemplate'] = ApplyTemplate

// Add the class as a new Custom Element to the window object - Done by uibuilder client library otherwise uibuilder fns can't be used
// customElements.define('apply-template', ApplyTemplate)
