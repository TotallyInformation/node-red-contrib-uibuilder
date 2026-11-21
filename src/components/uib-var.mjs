/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable jsdoc/valid-types */
// @ts-nocheck
/** A zero dependency web component that will display a managed uibuilder variable.
 *
 * Version: See component version
 */
/*
  Copyright (c) 2023-2026 Julian Knight (Totally Information)

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
 * @class
 * @augments TiBaseComponent
 * @description Define a new zero dependency custom web component will display a managed uibuilder variable.
 *
 * @element uib-var
 * @memberOf Live

 * METHODS FROM BASE: (see TiBaseComponent)
 * STANDARD METHODS:
  * @function attributeChangedCallback Called when an attribute is added, removed, updated or replaced
  * @function connectedCallback Called when the element is added to a document
  * @function constructor Construct the component
  * @function disconnectedCallback Called when the element is removed from a document

 * OTHER METHODS:
  * None

 * CUSTOM EVENTS:
  * @fires uib-var:connected - When an instance of the component is attached to the DOM. `evt.details` contains the details of the element.
  * @fires uib-var:ready - Alias for connected. The instance can handle property & attribute changes
  * @fires uib-var:disconnected - When an instance of the component is removed from the DOM. `evt.details` contains the details of the element.
  * @fires uib-var:attribChanged - When a watched attribute changes. `evt.details.data` contains the details of the change.
  * NOTE that listeners can be attached either to the `document` or to the specific element instance.

 * Standard watched attributes (common across all my components):
  * @attr {string|boolean} inherit-style - Optional. Load external styles into component (only useful if using template). If present but empty, will default to './index.css'. Optionally give a URL to load.
  * @attr {string} name - Optional. HTML name attribute. Included in output _meta prop.

 * Other watched attributes:
  * @attr {string} data-before - Optional. Text to show before the variable value.
  * @attr {string} data-after - Optional. Text to show after the variable value.
  * @attr {string} filter - Optional. A function name which will be applied to the variable value before display. Can include arguments in parentheses (e.g. `myFilter(1, 'abc')`). The function can be a global function or a function on the uibuilder client instance (e.g. `uibuilder.get`).

 * PROPS FROM BASE: (see TiBaseComponent)
 * OTHER STANDARD PROPS:
  * @property {string} componentVersion Static. The component version string (date updated). Also has a getter that returns component and base version strings.

 * Other props:
  * By default, all attributes are also created as properties

 * @slot Default content display.

 * @example
  * <uib-var name="var01" topic="mytopic"></uib-var>
  * <uib-var name="var02" variable="msg.payload"></uib-var>
  * <uib-var name="var03" variable="msg.payload" type="json"></uib-var>
  * <uib-var name="var04" variable="msg.payload" filter="uibuilder.get('msg.payload')"></uib-var>
  * <uib-var name="var04" variable="msg.payload" data-before="Status: " data-after=". "></uib-var>

 * @see https://totallyinformation.github.io/node-red-contrib-uibuilder/#/client-docs/custom-components?id=uib-var

 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc
 */
class UibVar extends TiBaseComponent {
    /** Component version */
    static componentVersion = '2026-11-21'

    /** Makes HTML attribute change watched
     * Since v8.0.0 "type" changed to "output"
     * @return {Array<string>} List of all of the html attribs (props) listened to
     */
    static get observedAttributes() {
        return [
            // Standard watched attributes:
            /* 'inherit-style', */ 'name',
            // Other watched attributes:
            'filter', 'id', 'report',
            'topic', 'output', 'undefined', 'variable',
        ]
    }

    // #region --- Class Properties ---

    /** The original var name to process (may have sub-property-paths) @type {string} */
    #fullVarName
    /** Name of the uibuilder mangaged variable to use @type {string} */
    #rootVarName
    /** Current value of the watched variable */
    value
    /** Default type */
    #defaultOutputType = 'html'
    /** what are the available types? */
    outputTypes = ['html', 'plain', 'text', 'markdown', 'object', 'json', 'table', 'list', 'array']
    /** uibuilder extended element data properties - aligns with uibuilder element handling */
    _uib = {
        /** @type {'html'|'text'|'plain'|'markdown'|'json'|'object'|'table'|'array'|'list'} */
        outputType: this.#defaultOutputType,
        /** Name of filter fn to apply (in globalThis/window or uibuilder scope) @type {string} */
        filterName: null,
        /** Array of filter fn arguments to apply @type {Array<string>} */
        filterArgs: null,
        /** The (split)path of the var name @type {{fullVarName:string,hasSubPath:boolean,rootVarName:string,nestedPath:string,splitNestedPath:Array<string>}} */
        uibVarDetails: null,
        /** The watch fn for changes to the variable to allow cancel @type {Function} */
        varWatch: null,
        /** The name of the watched variable to allow cancel @type {string} */
        varWatchName: null,
        /** The watch fn for changes to the topic to allow cancel @type {Function} */
        topicWatch: null,
        /** The name of the watched topic to allow cancel @type {string} */
        topicWatchName: null,
        /** If true, show undefined variables with the text "undefined", otherwise show slot content @type {boolean} */
        showUndefined: false,
        /** Whether to report back to Node-RED on data change @type {boolean} */
        sendReport: false,
    }
    #topic
    /** Whether to output if the variable is undefined */
    undef = false
    /** Whether to send update value to Node-RED on change */
    report = false

    // #endregion --- Class Properties ---

    constructor() {
        super()
        // Only attach the shadow dom if code and style isolation is needed - comment out if shadow dom not required
        // if (template && template.content) this._construct(template.content.cloneNode(true))
    }

    /** Set the uibuilder variable name to watch */
    set variable(varName) {
        if (varName) {
            this.#fullVarName = varName
            this._uib.uibVarDetails = this.uibuilder.varNameSubPathChk(varName)
            this.#rootVarName = this._uib.uibVarDetails.rootVarName
        } else {
            this.#fullVarName = null
            this._uib.uibVarDetails = null
            this.#rootVarName = null
        }

        // Stop any previous variable or topic watcher & settings
        this._removeWatchers()

        if (!varName) return

        // NB: this._uib should contain path details, filter & args, output type
        //     varChange gets the nested value and calls _processUibVar to update the element and content

        // Set the initial value immediately - this handles the case where the variable was already set before this component was connected to the DOM
        this.value = this.uibuilder.varChange(this, this.uibuilder.get(this.#rootVarName), 'uib-var-var-initial')
        // And save the var name used for the callback
        this._uib.varWatchName = this.#rootVarName
        // Watch for changes in the variable (could use `uibuilder:propertyChanged:${prop}` event instead)
        this._uib.varWatch = this.uibuilder.onChange(this.#rootVarName, (rootValue) => {
            this.value = this.uibuilder.varChange(this, rootValue, 'uib-var-on-var-change')
        })
    }

    /** Get the watched uibuilder variable name (including sub-property-paths)
     * @return {string} The watched variable name
     */
    get variable() {
        return this.#fullVarName
    }

    /** Set the uibuilder msg topic to watch. We could use `uibuilder:msg:topic:${msg.topic}` event instead */
    set topic(topicName) {
        if (topicName) {
            this.#topic = topicName
        } else {
            this.#topic = null
        }

        // Stop any previous variable or topic watcher & settings
        this._removeWatchers()

        // Handle empty topic
        if (!topicName) return

        this.#topic = topicName
        // Set this manually, allows varChange to work correctly
        this._uib.uibVarDetails = {
            fullVarName: 'msg',
            hasSubPath: false,
            rootVarName: 'msg',
            nestedPath: null,
            splitNestedPath: [],
        }

        // save the var name used for the callback
        this._uib.topicWatchName = topicName
        // Set up a uibuilder listener for this topic - ASSUMES msg.payload contains the VALUE to show
        this._uib.topicWatch = this.uibuilder.onTopic(topicName, (msg) => {
            msg._uib_processed_by = 'uib-var-topic' // record that this has already been processed
            this.uibuilder.varChange(this, msg, 'uib-var-on-topic-change')
        })
    }

    /** Get the watched uibuilder msg topic
     * @return {string} The watched topic name
     */
    get topic() {
        return this.#topic
    }

    // Runs when an instance is added to the DOM
    connectedCallback() {
        this._connect() // Keep at start.

        // Initial process of key attributes (fires set methods)
        this.variable = this.getAttribute('variable')
        this.topic = this.getAttribute('topic')

        this._ready() // Keep at end. Let everyone know that a new instance of the component has been connected & is ready
    }

    // Runs when an instance is removed from the DOM
    disconnectedCallback() {
        // Stop any previous variable or topic watcher & settings
        this._removeWatchers()

        this._disconnect() // Keep at end.
    }

    /** Handle watched attributes
     * NOTE: On initial startup, this is called for each watched attrib set in HTML - BEFORE connectedCallback is called.
     * Attribute values can only ever be strings
     * @param {string} attrib The name of the attribute that is changing
     * @param {string} oldVal The old value of the attribute
     * @param {string} newVal The new value of the attribute
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

        // Add other dynamic attribute processing here.
        // If attribute processing doesn't need to be dynamic, process in connectedCallback as that happens earlier in the lifecycle
        switch (attrib) {
            case 'undefined': {
                if (newVal === '' || ['on', 'true', 'report'].includes(newVal.toLowerCase())) this.undef = true
                else this.undef = false
                this._uib.showUndefined = this.undef
                break
            }
            case 'report': {
                if (newVal === '' || ['on', 'true', 'report'].includes(newVal.toLowerCase())) this._uib.sendReport = true
                else this._uib.sendReport = false
                break
            }
            case 'output': { /** Since v8.0.0 changed to output from type */
                if (newVal === '' || !this.outputTypes.includes(newVal.toLowerCase())) this._uib.outputType = this.#defaultOutputType
                else this._uib.outputType = newVal
                break
            }
            case 'filter': {
                this._uib.filterName = undefined
                this._uib.filterArgs = []

                // Handle empty filter
                if (!newVal) break

                this._uib.filterName = newVal

                // Filter the input - at least limit the length of the attr
                newVal = newVal.slice(0, 127)
                // Remove spaces and then separate fn name from potential extra arguments
                const f = newVal.replace(/\s/g, '').match(/([a-zA-Z_$][a-zA-Z_$0-9.-]+)(\((.*)\))?/)
                if (!f) {
                    console.warn(`⚠️ [uib-var] Filter function "${newVal}" invalid. Cannot process.`)
                    break
                }
                // Fn name
                this._uib.filterName = f[1]
                // Fn arguments
                if (f[3]) { // undefined if no args found
                    // TODO Do we really want to try this?
                    try {
                        this._uib.filterArgs = JSON.parse(f[3])
                    } catch (e) {}

                    this._uib.filterArgs = f[3].split(',').map((x) => {
                        // No objects/arrays allowed - if they have a , they are split
                        x = x.trim()
                        // NB: Do NOT use Number.isNaN here, it is too narrow minded
                        if (isNaN(x)) {
                            // String inside string ends up double quoted so remove those
                            let y = x.replace(/^["'`]/, '').replace(/["'`]$/, '')
                            // Attempt very limited parse in case it is valid object/array
                            try {
                                y = new Function(`return ${y}`)()
                            } catch (e) {}
                            return y
                        }
                        return Number(x)
                    })
                }

                // ! TODO: Check if filter applied  if neither variable nor topic attribs set
                // if (!this.variable && !this.topic) this.showVar(false)
                break
            }
            default: {
                break
            }
        }

        // Keep at end. Let everyone know that an attribute has changed for this instance of the component
        this._event('attribChanged', { attribute: attrib, newVal: newVal, oldVal: oldVal, })
    }

    /** Remove any existing watchers */
    _removeWatchers() {
        // Stop any previous variable watch settings
        if (this._uib.varWatch) {
            this.uibuilder.cancelChange(this._uib.varWatchName, this._uib.varWatch)
            this._uib.varWatch = undefined
            this._uib.varWatchName = undefined
        }
        // Stop any previous topic watch settings
        if (this._uib?.topicWatchName) {
            this.uibuilder.cancelTopic(this._uib.topicWatchName, this._uib.topicWatch)
            this._uib.varWatch = null
            this._uib.varWatchName = null
        }
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
