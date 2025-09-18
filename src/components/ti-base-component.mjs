/** Define the base component extensions for other components in this package.
 * Used to ensure that standard properties and methods are available in every component.
 *
 * Version: See the class code
 *
 */
/** Copyright (c) 2024-2025 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Namespace
 * @namespace Library
 */

/**
 * @class
 * @augments HTMLElement
 * @description Define the base component extensions for other components in this package.
 *
 * @element ti-base-component
 * @memberOf Library

 * STANDARD METHODS:
  * @function config Update runtime configuration, return complete config
  * @function createShadowSelectors Creates the jQuery-like $ and $$ methods
  * @function deepAssign Object deep merger
  * @function doInheritStyles If requested, add link to an external style sheet
  * @function ensureId Adds a unique ID to the tag if no ID defined.
  * @function uibSend Send a message to the Node-RED server via uibuilder if available.
  * @function _uibMsgHandler Not yet in use
  * @function _event (name,data) Standardised custom event dispatcher
  * @function _ready Call from end of connectedCallback. Sets connected prop and outputs events

 * Standard watched attributes (common across all my components):
  * @property {string|boolean} inherit-style - Optional. Load external styles into component (only useful if using template). If present but empty, will default to './index.css'. Optionally give a URL to load.

 * Standard props (common across all my components):
  * @property {string} baseVersion Static. The component version string (date updated). Also has a getter.
  * @property {number} _iCount Static. The count of instances of this component that weren't given an id. Creates a unique id as needed.
  * @property {boolean} uib True if UIBUILDER for Node-RED is loaded
  * @property {object} uibuilder Reference to loaded UIBUILDER for Node-RED client library if loaded (else undefined)
  * @property {function(string): Element} $ jQuery-like shadow dom selector
  * @property {function(string): NodeList} $$  jQuery-like shadow dom multi-selector
  * @property {boolean} connected False until connectedCallback finishes
  * @property {string} name Placeholder for the optional name attribute
  * @property {object} opts This components controllable options - get/set using the `config()` method
  *
  * @property {string} version Getter that returns the class version & baseVersion static strings.

 * Other props:
  * By default, all attributes are also created as properties

 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc
 */
class TiBaseComponent extends HTMLElement {
    /** Component version */
    static baseVersion = '2025-06-09'

    /** Holds a count of how many instances of this component are on the page that don't have their own id
     * Used to ensure a unique id if needing to add one dynamically
     */
    static _iCount = 0

    /** Is UIBUILDER for Node-RED loaded? */
    uib = !!window['uibuilder']
    uibuilder = window['uibuilder']

    /** Mini jQuery-like shadow dom selector (see constructor)
     * @type {function(string): Element}
     * @param {string} selector - A CSS selector to match the element within the shadow DOM.
     * @returns {Element} The first element that matches the specified selector.
     */
    $
    /** Mini jQuery-like shadow dom multi-selector (see constructor)
     * @type {function(string): NodeList}
     * @param {string} selector - A CSS selector to match the element within the shadow DOM.
     * @returns {NodeList} A STATIC list of all shadow dom elements that match the selector.
     */
    $$

    /** True when instance finishes connecting.
     * Allows initial calls of attributeChangedCallback to be
     * ignored if needed.
     */
    connected = false

    /** Placeholder for the optional name attribute @type {string} */
    name

    /** Runtime configuration settings @type {object} */
    opts = {}

    /** Report the current component version string
     * @returns {string} The component version & base version as a string
     */
    static get version() {
        // @ts-ignore
        return `${this.componentVersion} (Base: ${this.baseVersion})`
    }

    // get id() {
    //     return this.id
    // }

    // set id(value) {
    //     // this.id = value
    //     console.log('>> SETTING ID:', value, this.id, this.getAttribute('id'))
    // }


    /** NB: Attributes not available here - use connectedCallback to reference */
    constructor() {
        super()
    }

    /** OPTIONAL. Update runtime configuration, return complete config
     * @param {object|undefined} config If present, partial or full set of options. If undefined, fn returns the current full option settings
     * @returns {object} The full set of options
     */
    config(config) {
        // Merge config but ensure that default states always present
        // if (config) this.opts = { ...this.opts, ...config }
        if (config) this.opts = TiBaseComponent.deepAssign(this.opts, config)
        return this.opts
    }

    /** Creates the $ and $$ fns that do css selections against the shadow dom */
    createShadowSelectors() {
        this.$ = this.shadowRoot?.querySelector.bind(this.shadowRoot)
        this.$$ = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot)
    }

    /** Utility object deep merge fn
     * @param {object} target Merge target object
     * @param  {...object} sources 1 or more source objects to merge
     * @returns {object} Deep merged object
     */
    static deepAssign(target, ...sources) {
        for (let source of sources) { // eslint-disable-line prefer-const
            for (let k in source) { // eslint-disable-line prefer-const
                const vs = source[k]
                const vt = target[k]
                if (Object(vs) == vs && Object(vt) === vt) {
                    target[k] = TiBaseComponent.deepAssign(vt, vs)
                    continue
                }
                target[k] = source[k]
            }
        }
        return target
    }

    /** Optionally apply an external linked style sheet for Shadow DOM (called from connectedCallback)
     * param {*} url The URL for the linked style sheet
     */
    async doInheritStyles() {
        if (!this.shadowRoot) return
        if (!this.hasAttribute('inherit-style')) return

        let url = this.getAttribute('inherit-style')
        if (!url) url = './index.css'

        const linkEl = document.createElement('link')
        linkEl.setAttribute('type', 'text/css')
        linkEl.setAttribute('rel', 'stylesheet')
        linkEl.setAttribute('href', url)
        this.shadowRoot.appendChild(linkEl)

        console.info(`[${this.localName}] Inherit-style requested. Loading: "${url}"`)
    }

    /** Ensure that the component instance has a unique ID & check again if uib loaded */
    ensureId() {
        // Check again if UIBUILDER for Node-RED is loaded
        this.uib = !!window['uibuilder']

        if (!this.id) {
            // if (!this.name) this.name = this.getAttribute('name')
            // if (this.name) this.id = this.name.toLowerCase().replace(/\s/g, '_')
            // else this.id = `${this.localName}-${++this.constructor._iCount}`
            // @ts-ignore
            this.id = `${this.localName}-${++this.constructor._iCount}`
        }
    }

    /** Check if slot has meaningful content (not just whitespace)
     * @returns {boolean} True if slot has non-empty content
     */
    hasSlotContent() {
        const slot = this.shadowRoot.querySelector('slot')
        const assignedNodes = slot.assignedNodes()

        return assignedNodes.some(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                return true
            }
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent.trim().length > 0
            }
            return false
        })
    }

    /** Attaches a new stylesheet before all other stylesheets in the light DOM
     * @param {string} cssText - CSS text to inject directly
     * @param {number} order - Optional order/priority for stylesheet placement. Lower numbers = higher priority (inserted first). Defaults to 0.
     * @returns {Element} The created or existing style element
     * @throws {Error} If cssText is not provided
     * @example
     * // Inject CSS text directly with default order
     * dataList.prependStylesheet('.custom { color: hsl(0, 100%, 50%); }')
     *
     * // Inject CSS with specific order (lower number = higher priority)
     * dataList.prependStylesheet('.base { font-size: 1rem; }', 1)
     * dataList.prependStylesheet('.critical { color: hsl(0, 100%, 50%); }', 0)
     */
    prependStylesheet(cssText, order = 0) {
        if (!cssText) {
            throw new Error(`[${this.localName}] cssText must be provided`)
        }

        // TODO: - Add ability to append after other stylesheets (inlcuding those in the HTML head)

        // Check if same stylesheet already exists
        const existingStylesheet = this._findExistingStylesheet()
        // If so, return existing element instead of creating duplicate
        if (existingStylesheet) return existingStylesheet

        // Create style element with direct CSS text
        const styleElement = document.createElement('style')
        styleElement.textContent = cssText
        styleElement.setAttribute('data-component', this.localName)
        styleElement.setAttribute('data-order', order.toString())

        // Prepend to light DOM (document head) with order consideration
        this._prependToDocumentHead(styleElement, order)
        return styleElement
    }

    /** Send a message to the Node-RED server via uibuilder if available
     * NB: These web components are NEVER dependent on Node-RED or uibuilder.
     * @param {string} evtName The event name to send
     * @param {*} data The data to send
     */
    uibSend(evtName, data){
        if (this.uib) {
            if (this.uibuilder.ioConnected) {
                this.uibuilder.send({
                    topic: `${this.localName}:${evtName}`,
                    payload: data,
                    id: this.id,
                    name: this.name,
                })
            } else {
                console.warn(`[${this.localName}] uibuilder not connected to server, cannot send:`, evtName, data)
            }
        }
    }

    // #region ---- Methods private to extended classes ----
    // These are called from a class that extends this base class but should not be called directly by the user.

    /** Standardised connection. Call from the start of connectedCallback fn */
    _connect() {
        // Make sure instance has an ID. Create an id from name or calculation if needed
        this.ensureId()  // in base class
        // Apply parent styles from a stylesheet if required - only required if using an applied template
        this.doInheritStyles()  // in base class

        // Listen for a uibuilder msg that is targetted at this instance of the component
        if (this.uib) this.uibuilder.onTopic(`${this.localName}::${this.id}`, this._uibMsgHandler.bind(this) )
    }

    /** Standardised constructor. Keep after call to super()
     * @param {Node|string} template Nodes/string content that will be cloned into the shadow dom
     * @param {{mode:'open'|'closed',delegatesFocus:boolean}=} shadowOpts Options passed to attachShadow
     */
    _construct(template, shadowOpts) {
        if (!template) return
        if (!shadowOpts) shadowOpts = { mode: 'open', delegatesFocus: true, }
        // Only attach the shadow dom if code and style isolation is needed
        this.attachShadow(shadowOpts)
            .append(template)

        // jQuery-like selectors but for the shadow. NB: Returns are STATIC not dynamic lists
        this.createShadowSelectors()  // in base class
    }

    /** Standardised disconnection. Call from the END of disconnectedCallback fn */
    _disconnect() {
        // @ts-ignore Remove optional uibuilder event listener
        document.removeEventListener(`uibuilder:msg:_ui:update:${this.id}`, this._uibMsgHandler )

        // Keep at end. Let everyone know that an instance of the component has been disconnected
        this._event('disconnected')
    }

    /** Custom event dispacher `component-name:name` with detail data
     * @example
     *   this._event('ready')
     * @example
     *   this._event('ready', {age: 42, type: 'android'})
     *
     * @param {string} evtName A name to give the event, added to the component-name separated with a :
     * @param {*=} data Optional data object to pass to event listeners via the evt.detail property
     */
    _event(evtName, data) {
        this.dispatchEvent(new CustomEvent(`${this.localName}:${evtName}`, {
            bubbles: true,
            composed: true,
            detail: {
                id: this.id,
                name: this.name,
                data: data,
            },
        } ) )
    }

    /** Call from end of connectedCallback */
    _ready() {
        this.connected = true
        this._event('connected')
        this._event('ready')
    }

    /** Handle a `${this.localName}::${this.id}` custom event
     * Each prop in the msg.payload is set as a prop on the component instance.
     * @param {object} msg A uibuilder message object
     */
    _uibMsgHandler(msg) {
        // if msg.payload is not an object, ignore
        if (typeof msg.payload !== 'object') {
            console.warn(`[${this.localName}] Ignoring msg, payload is not an object:`, msg)
            return
        }

        // set properties from the msg
        Object.keys(msg.payload).forEach(key => {
            if (key.startsWith('_')) return
            this[key] = msg.payload[key]
        })
    }

    // #endregion ---- Methods private to the extended classes ----

    // #region ---- Methods private to the base class only ----

    /** Find existing component stylesheet with the same data-component attribute value
     * Assumes that the style element has a `data-component` attribute set to the component's local name
     * @returns {Element|null} Existing element or null if not found
     * @private
     */
    _findExistingStylesheet() {
        const existing = document.head.querySelector(
            `style[data-component="${this.localName}"]`
        )
        return existing
    }

    /** Helper method to prepend a style element to the document head with order consideration
     * @param {HTMLElement} styleElement - The style element to prepend
     * @param {number} order - The order/priority for placement (lower numbers = higher priority)
     * @private
     */
    _prependToDocumentHead(styleElement, order) {
        const head = document.head

        // Find existing injected stylesheets to determine proper insertion point
        const existingComponentStyles = Array.from(head.querySelectorAll('style[data-component]'))

        if (existingComponentStyles.length === 0) {
            // No existing injected styles, insert at the very beginning
            const firstChild = head.firstChild
            if (firstChild) {
                head.insertBefore(styleElement, firstChild)
            } else {
                head.appendChild(styleElement)
            }
            return
        }

        // Find the correct position based on order
        let insertBefore = null
        for (const existing of existingComponentStyles) {
            const existingOrder = parseInt(existing.getAttribute('data-order') ?? '0', 10)
            if (order < existingOrder) {
                insertBefore = existing
                break
            }
        }

        if (insertBefore) {
            // Insert before the found element
            head.insertBefore(styleElement, insertBefore)
        } else {
            // Insert after all existing component styles but before non-component styles
            const lastInjected = existingComponentStyles[existingComponentStyles.length - 1]
            const nextSibling = lastInjected.nextSibling
            if (nextSibling) {
                head.insertBefore(styleElement, nextSibling)
            } else {
                head.appendChild(styleElement)
            }
        }
    }

    // #endregion ---- Methods private to the base class only ----
} // ---- end of Class ---- //

// Make the class the default export so it can be used elsewhere
export default TiBaseComponent

// This is a library class so don't self-register, it is only for inclusion in actual components
