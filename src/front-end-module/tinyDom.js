/**
 * @module tinyDom
 * @description A tiny DOM manipulation library
 *   Inspired by TinyJS (https://github.com/victorqribeiro/TinyJS/)
 *   Allows easy DOM manipulation using simple JavaScript.
 *   Allows the creation of ANY DOM HTML element (even custom elements) with any attributes.
 * @version 1.0.0
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025-2025 Julian Knight (Totally Information)
 */

/** TODO:
 * - Consider moving this to a separate module. Possibly in the TI web components repo.
 *
 * - Add a `get` method that returns an existing element using querySelector.
 * - Add a `getAll` method that returns all existing elements using querySelectorAll.
 * - Change the handler to use CSS Selectors instead of ID's.
 * - Add `props` and `attr` props to the handler to allow for setting properties or attributes directly.
 * - Add a `remove` method to remove one or more existing element(s).
 * - Add an `add` method to add one or more elements to an existing element.
 * - Check for DOMpurify and use it if available.
 * - Force attr containing a dash to camelCase. For direct assignment to element properties only.
 * - Auto-add event listeners to input elements unless in a form or already set.
 * - Auto-add event listener to form submit.
 * - Input/Form event listeners should return data to node-red if uibuilder is in use.
 * - Add `update` method to update an existing element.
 * - Update client docs
 *
 * - ?? If no ID is provided, auto-generate one. (as per my standard custom components)
 * - Add a fn that takes a standard JSON object and creates/deletes/updates DOM elements. Needs a defined JSON schema.
 */

/** Return a function that creates an element with the given name.
 * If the element name is unknown and does not contain a dash, return undefined.
 * Element names containing a dash are always treated as custom or framework elements. (no way to differentiate whether they actually exist).
 * @example dom.div({id: 'myDiv'}, 'Hello World!')
 * @example dom['my-element']({id: 'myElement'}, 'Hello World!')
 * @example dom.myElement({id: 'myElement'}, dom.p('<span style="color:red;">Hello</span> World!'))
 * @param {string} prop The name of the element to create.
 * @param {object} args The attributes, innerHTML or child nodes for the element.
 * @returns {HTMLElement|undefined} The created element or undefined if the element is unknown.
 */
function handlerReturnfunction (prop, ...args) {
    if (!prop) {
        return undefined
    }

    // Is prop in camelCase? If so, convert to kebab-case
    prop = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

    // Attempt to create an element using the property name.
    const element = document.createElement(prop)

    // console.log(element instanceof HTMLUnknownElement, element.localName, customElements.get(prop))

    // Is the requested element a custom element? (could be either a web component or from a framework)
    // const isCustom = prop.includes('-')

    // If the created element is unknown (i.e. not a valid HTML element),
    // simply ignore it by returning undefined.
    // NB: Elements with a dash are custom elements and always report as known even if not registered.
    if (element instanceof HTMLUnknownElement ) {
        return undefined
    }

    // Process arguments if provided.
    if (args.length) {
        const [first, ...rest] = args

        // If the first argument is an object (but not a Node or an Array),
        // treat it as an attributes/properties map.
        if (
            first &&
            typeof first === 'object' &&
            !Array.isArray(first) &&
            !(first instanceof Node)
        ) {
            // ! Consider forcing attr containing a dash to camelCase
            Object.entries(first).forEach(([attr, value]) => {
                // If the attribute is a known property of the element,
                // assign it directly. Otherwise, use setAttribute.
                if (attr in element) {
                    element[attr] = value
                } else {
                    element.setAttribute(attr, value)
                }
            })
        } else {
            // If the first argument is not an attribute object,
            // treat all arguments as child nodes.
            rest.unshift(first)
        }

        // Append each subsequent argument as a child.
        rest.forEach(child => {
            if (child instanceof Node) {
                element.appendChild(child)
            } else if (typeof child === 'string') {
                // element.appendChild(document.createTextNode(child))
                element.innerHTML = child // WARNING: Unsafe, use DOMPurify if available
            }
        })
    }

    return element
}

/** Proxy handler function for the `dom` tool
 * It allows ANY HTML tag name to be used and ignores any unknown tag names.
 * Each tag name is a function that accepts an object of attributes and an array of child nodes.
 * The attributes object can contain any valid attribute or property for the element.
 * The child nodes can be any valid child node for the element.
 * @type {ProxyHandler}
 */
const tinyDomHandler = {
    // @ts-ignore
    version: '2025-02-02',

    /** Update an existing HTML element with new attributes.
     * @example dom.update('more', { className: 'myClass', innerHTML: '<span style="color:red;">Hello</span> World!'} )
     * @param {string} cssSelector HTML ID of an existing element
     * @param {object} props An object of Element attributes and/or properties to update.
     * @returns {Element|undefined} The updated element or undefined if the element is unknown.
     */
    update: function update (cssSelector, props) {
        const el = document.querySelector(cssSelector)
        if (!el) {
            console.warn(`[dom:update] Element with selector '${cssSelector}' not found`)
            return undefined
        }
        if (props.length < 1) return

        // ! Consider forcing attr containing a dash to camelCase for the in check and prop set only
        // TODO - Check if prop is `attr` or `props` and use accordingly
        Object.entries(props).forEach(([attr, value]) => {
            // If the attribute is a known property of the element,
            // assign it directly. Otherwise, use setAttribute.
            if (attr in el) {
                el[attr] = value
            } else {
                el.setAttribute(attr, value)
            }
        })

        return el
    },

    /** A trap for getting property values. Allows ANY function name to be used.
     * @param {*} target The target object.
     * @param {string} prop Allows any property name to be used.
     * @param {*} receiver The Proxy object.
     * @returns {Function|undefined} A function that creates an element or undefined if the element is unknown.
     */
    get: function get(target, prop, receiver) {
        // If the prop exists in this object, return it.
        if (prop in this) {
            return this[prop]
        }
        // @ts-ignore
        return handlerReturnfunction.bind(this, prop)
    },
}

const dom = new Proxy({}, tinyDomHandler)

export default { tinyDomHandler, dom, }
