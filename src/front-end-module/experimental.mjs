// @ts-nocheck
/**
 * @kind module
 * @module experimental
 * @description Experimental extensions to the uibuilder client library for testing future features
 *   This module extends the Uib class with experimental functionality that may be included
 *   in future releases. Use at your own risk as these features may change or be removed.
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025 Julian Knight (Totally Information)
 */

// Import the base Uib class
import { Uib } from './uibuilder.module.mjs'

// #region --- Type Definitions --- //
/** Configuration options for experimental reactive binding
 * @typedef {object} ReactiveBindConfig
 * @property {string} [attribute] - The attribute name to bind to
 * @property {string} [variable] - The variable name to bind
 * @property {Function} [transformer] - Optional transformation function
 * @property {boolean} [twoWay] - Whether binding is two-way (default: false)
 * @property {string} [selector] - CSS selector for elements to bind
 */

/** Configuration for experimental dialog component
 * @typedef {object} DialogConfig
 * @property {string} template - Template HTML or selector
 * @property {string} [title] - Dialog title
 * @property {boolean} [modal] - Whether dialog is modal (default: true)
 * @property {object} [data] - Data to pass to template
 * @property {Function} [onClose] - Callback when dialog closes
 */
// #endregion --- Type Definitions --- //

/**
 * Experimental extensions to the Uib class
 * Provides experimental features for testing future functionality
 * @class UibExperimental
 * @augments Uib
 */
export class UibExperimental extends Uib {
    /** @type {object} Experimental metadata */
    static _experimentalMeta = {
        version: '7.5.0-experimental',
        features: 'reactive-binding,enhanced-dialogs,auto-layout,template-engine',
        warning: 'Experimental features - subject to change or removal',
    }

    // #region --- Private experimental properties --- //

    /** @type {Map<string, ReactiveBindConfig>} Reactive binding configurations */
    #reactiveBindings = new Map()

    /** @type {MutationObserver} Observer for reactive attribute changes */
    #reactiveObserver = null

    /** @type {Set<HTMLElement>} Elements with experimental attributes */
    #experimentalElements = new Set()

    /** @type {Object<string, HTMLDialogElement>} Active dialogs */
    #activeDialogs = {}

    /** @type {number} Counter for unique dialog IDs */
    #dialogCounter = 0

    /** @type {Map<string, Set<HTMLElement>>} Track elements that use specific variables in templates */
    #templateVariableMap = new Map()

    /** @type {Map<HTMLElement, object>} Track template data for each element */
    #templateDataMap = new Map()

    /** @type {Map<HTMLElement, string>} Track original template strings for each element */
    #templateStringMap = new Map()

    // #endregion --- Private experimental properties --- //

    constructor() {
        super()

        // Initialize experimental features
        this._initExperimentalFeatures()

        // Dispatch experimental ready event
        if (this._dispatchCustomEvent) {
            this._dispatchCustomEvent('uibuilder:experimentalReady', {
                features: UibExperimental._experimentalMeta.features,
                version: UibExperimental._experimentalMeta.version,
            })
        }
    }

    // #region --- Experimental Feature Initialization --- //

    /** Initialize all experimental features */
    _initExperimentalFeatures() {
        this._initReactiveBinding()
        this._initExperimentalAttributes()
        this._initDialogSupport()

        // Log experimental mode activation
        console.warn('[UibExperimental] Experimental mode activated. Features may change or be removed.', UibExperimental._experimentalMeta)
        console.info('[UibExperimental] Available features:', UibExperimental._experimentalMeta.features.split(','))
    }

    /** Initialize reactive binding system */
    _initReactiveBinding() {
        // Create mutation observer for reactive attributes
        this.#reactiveObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
                    this._handleReactiveAttributeChange(mutation.target, mutation.attributeName)
                } else if (mutation.type === 'childList') {
                    // Handle new elements added to DOM
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement) {
                            this._scanForExperimentalAttributes(node)
                        }
                    })
                }
            })
        })

        // Start observing
        this.#reactiveObserver.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['uib-bind', 'uib-on', 'uib-show', 'uib-text', 'uib-model'],
        })
    }

    /** Initialize support for experimental attributes */
    _initExperimentalAttributes() {
        // Scan existing DOM for experimental attributes
        this._scanForExperimentalAttributes(document.body)
    }

    /** Initialize enhanced dialog support */
    _initDialogSupport() {
        // Ensure native dialog support or polyfill
        if (!HTMLDialogElement) {
            console.warn('[UibExperimental] Native dialog not supported. Consider adding a polyfill.')
        }
    }

    // #endregion --- Experimental Feature Initialization --- //

    // #region --- Reactive Binding Experimental Features --- //

    /**
     * Create a reactive binding between a variable and DOM elements
     * @param {string} variable - Variable name to bind
     * @param {string} selector - CSS selector for elements to bind
     * @param {ReactiveBindConfig} config - Binding configuration
     * @returns {void}
     * @example
     * uibExperimental.createReactiveBinding('userName', '[uib-bind="userName"]', {
     *     attribute: 'textContent',
     *     twoWay: false
     * })
     */
    createReactiveBinding(variable, selector, config = {}) {
        const bindingId = `${variable}:${selector}`
        const bindingConfig = {
            variable,
            selector,
            attribute: config.attribute || 'textContent',
            transformer: config.transformer || (val => val),
            twoWay: config.twoWay || false,
            ...config,
        }

        this.#reactiveBindings.set(bindingId, bindingConfig)

        // Apply initial binding
        this._applyReactiveBinding(bindingConfig)

        // Watch for variable changes
        this.onChange(variable, (newValue) => {
            this._applyReactiveBinding(bindingConfig, newValue)
        })
    }

    /**
     * Apply reactive binding to DOM elements
     * @param {ReactiveBindConfig} config - Binding configuration
     * @param {*} [value] - Optional value to set
     * @private
     */
    _applyReactiveBinding(config, value) {
        const elements = document.querySelectorAll(config.selector)
        const currentValue = value !== undefined ? value : this.get(config.variable)
        const transformedValue = config.transformer(currentValue)

        elements.forEach((element) => {
            if (config.attribute === 'textContent') {
                element.textContent = transformedValue
            } else if (config.attribute === 'innerHTML') {
                element.innerHTML = transformedValue
            } else if (config.attribute.startsWith('data-')) {
                element.setAttribute(config.attribute, transformedValue)
            } else {
                element[config.attribute] = transformedValue
            }

            // Set up two-way binding for input elements
            if (config.twoWay && element.tagName === 'INPUT') {
                element.addEventListener('input', (event) => {
                    this.set(config.variable, event.target.value)
                })
            }

            this.#experimentalElements.add(element)
        })
    }

    /**
     * Handle reactive attribute changes
     * @param {HTMLElement} element - Element that changed
     * @param {string} attributeName - Name of changed attribute
     * @private
     */
    _handleReactiveAttributeChange(element, attributeName) {
        if (attributeName === 'uib-bind') {
            const variable = element.getAttribute('uib-bind')
            if (variable) {
                const value = this.get(variable)
                element.textContent = value
            }
        } else if (attributeName === 'uib-show') {
            const variable = element.getAttribute('uib-show')
            if (variable) {
                const value = this.get(variable)
                if (element instanceof HTMLElement) {
                    element.style.display = value ? 'block' : 'none'
                }
            }
        }
    }

    /**
     * Scan for experimental attributes in DOM
     * @param {HTMLElement} root - Root element to scan from
     * @private
     */
    _scanForExperimentalAttributes(root) {
        // Scan for uib-bind attributes
        const bindElements = root.querySelectorAll('[uib-bind]')
        bindElements.forEach((element) => {
            const variable = element.getAttribute('uib-bind')
            if (variable) {
                this.createReactiveBinding(variable, `[uib-bind="${variable}"]`)
            }
        })

        // Scan for uib-show attributes
        const showElements = root.querySelectorAll('[uib-show]')
        showElements.forEach((element) => {
            const variable = element.getAttribute('uib-show')
            if (variable) {
                this.onChange(variable, (value) => {
                    element.style.display = value ? 'block' : 'none'
                })
            }
        })
    }

    // #endregion --- Reactive Binding Experimental Features --- //

    // #region --- Enhanced Dialog Experimental Features --- //

    /** Create and show an experimental dialog
     * @param {DialogConfig} config - Dialog configuration
     * @returns {Promise<any>} Promise that resolves when dialog closes
     * @example
     * const result = await uibExperimental.showExperimentalDialog({
     *     template: '<p>Are you sure?</p>',
     *     title: 'Confirmation',
     *     modal: true
     * })
     */
    async showExperimentalDialog(config) {
        return new Promise((resolve) => {
            const dialogId = `exp-dialog-${++this.#dialogCounter}`
            const dialog = this._createDialog(dialogId, config)

            // Store dialog reference
            this.#activeDialogs[dialogId] = dialog

            // Handle dialog close
            const handleClose = (result) => {
                delete this.#activeDialogs[dialogId]
                dialog.remove()
                if (config.onClose) config.onClose(result)
                resolve(result)
            }

            // Add close event listeners
            dialog.addEventListener('close', () => handleClose(dialog.returnValue))

            // Add to DOM and show
            document.body.appendChild(dialog)
            dialog.showModal()
        })
    }

    /** Create a dialog element
     * @param {string} dialogId - Unique dialog ID
     * @param {DialogConfig} config - Dialog configuration
     * @returns {HTMLDialogElement} Created dialog element
     * @private
     */
    _createDialog(dialogId, config) {
        const dialog = document.createElement('dialog')
        dialog.id = dialogId
        dialog.className = 'uib-experimental-dialog'

        // Build dialog content
        let content = ''
        if (config.title) {
            content += `<header class="uib-dialog-header">
                <h2>${config.title}</h2>
                <button type="button" class="uib-dialog-close" aria-label="Close">&times;</button>
            </header>`
        }

        content += `<main class="uib-dialog-content">`

        // Handle template
        if (config.template.trim().startsWith('<')) {
            // Direct HTML
            content += config.template
        } else {
            // Selector - get template from DOM
            const templateElement = document.querySelector(config.template)
            if (templateElement) {
                content += templateElement.innerHTML
            } else {
                content += config.template
            }
        }

        content += `</main>`

        // Add default buttons if not present in template
        if (!config.template.includes('button')) {
            content += `<footer class="uib-dialog-footer">
                <button type="button" value="cancel">Cancel</button>
                <button type="button" value="ok" class="uib-primary">OK</button>
            </footer>`
        }

        dialog.innerHTML = content

        // Add event listeners
        dialog.addEventListener('click', (event) => {
            const target = event.target
            if (target && 'matches' in target && target.matches('button[value]')) {
                dialog.returnValue = target.value
                dialog.close()
            } else if (target && 'matches' in target && target.matches('.uib-dialog-close')) {
                dialog.returnValue = 'cancel'
                dialog.close()
            }
        })

        // Close on backdrop click if modal
        if (config.modal !== false) {
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) {
                    dialog.returnValue = 'cancel'
                    dialog.close()
                }
            })
        }

        return dialog
    }

    /** Close all experimental dialogs
     * @returns {void}
     */
    closeAllDialogs() {
        Object.values(this.#activeDialogs).forEach((dialog) => {
            dialog.close()
        })
    }

    // #endregion --- Enhanced Dialog Experimental Features --- //

    // #region --- Template Engine Experimental Features --- //

    /** Process a template with data using experimental template engine
     * @param {string} template - Template string with {{variable}} syntax
     * @param {object} data - Data object to interpolate
     * @param {HTMLElement} [targetElement] - Optional element to bind for auto-updates
     * @returns {string} Processed template
     * @example
     * const result = uibExperimental.processTemplate(
     *     '<p>Hello {{name}}!</p>',
     *     { name: 'World' }
     * )
     *
     * // With auto-update binding
     * const element = document.getElementById('greeting')
     * element.innerHTML = uibExperimental.processTemplate(
     *     '<p>Hello {{userName}}! Today is {{date}}.</p>',
     *     { userName: 'John', date: new Date().toLocaleDateString() },
     *     element
     * )
     */
    processTemplate(template, data = {}, targetElement = null) {
        // Extract variable names from template
        const variables = this._extractTemplateVariables(template)

        // If we have a target element, set up auto-update
        if (targetElement) {
            this._setupTemplateAutoUpdate(targetElement, template, data, variables)
        }

        // Process the template
        return this._renderTemplate(template, data)
    }

    /** Extract variable names from a template string
     * @param {string} template - Template string with {{variable}} syntax
     * @returns {string[]} Array of variable names found in template
     * @private
     */
    _extractTemplateVariables(template) {
        const variables = []
        const regex = /\{\{([^}]+)\}\}/g
        let match

        while ((match = regex.exec(template)) !== null) {
            const variable = match[1].trim()
            if (!variables.includes(variable)) {
                variables.push(variable)
            }
        }

        return variables
    }

    /** Set up auto-update for a template bound to an element
     * @param {HTMLElement} element - Target element for template
     * @param {string} template - Template string
     * @param {object} data - Template data
     * @param {string[]} variables - Variable names used in template
     * @private
     */
    _setupTemplateAutoUpdate(element, template, data, variables) {
        // Store template information for this element
        this.#templateStringMap.set(element, template)
        this.#templateDataMap.set(element, { ...data, })

        // Track which variables this element depends on
        variables.forEach((variable) => {
            const rootVar = variable.split('.')[0] // Get root variable name

            if (!this.#templateVariableMap.has(rootVar)) {
                this.#templateVariableMap.set(rootVar, new Set())
            }
            this.#templateVariableMap.get(rootVar).add(element)

            // Set up change listener for this variable if not already set
            this._ensureVariableListener(rootVar)
        })
    }

    /** Ensure a change listener exists for a variable
     * @param {string} variable - Variable name to watch
     * @private
     */
    _ensureVariableListener(variable) {
        // Check if we already have a listener for this variable
        const existingListeners = this._propChangeCallbacks || {}
        if (existingListeners[variable]) {
            // Check if our template update listener is already registered
            const hasTemplateListener = existingListeners[variable].some(
                cb => cb.name === '_templateUpdateListener'
            )
            if (hasTemplateListener) return
        }

        // Add our template update listener
        this.onChange(variable, this._createTemplateUpdateListener(variable))
    }

    /**
     * Create a template update listener for a specific variable
     * @param {string} variable - Variable name being watched
     * @returns {Function} Update listener function
     * @private
     */
    _createTemplateUpdateListener(variable) {
        const listener = (newValue) => {
            // Find all elements that use this variable
            const elements = this.#templateVariableMap.get(variable)
            if (!elements) return

            elements.forEach((element) => {
                // Update the stored data for this element
                const storedData = this.#templateDataMap.get(element)
                if (storedData) {
                    storedData[variable] = newValue

                    // Re-render the template
                    const template = this.#templateStringMap.get(element)
                    if (template) {
                        const newContent = this._renderTemplate(template, storedData)
                        element.innerHTML = newContent
                    }
                }
            })
        }

        // Add a name property for identification
        Object.defineProperty(listener, 'name', { value: '_templateUpdateListener', })

        return listener
    }

    /**
     * Render a template with data (core template processing)
     * @param {string} template - Template string with {{variable}} syntax
     * @param {object} data - Data object to interpolate
     * @returns {string} Processed template
     * @private
     */
    _renderTemplate(template, data) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
            const keys = variable.trim().split('.')
            let value = data

            for (const key of keys) {
                value = value?.[key]
                if (value === undefined) break
            }

            return value !== undefined ? String(value) : match
        })
    }

    /**
     * Update template data for an element (triggers re-render)
     * @param {HTMLElement} element - Element with bound template
     * @param {object} newData - New data to merge with existing data
     * @returns {void}
     * @example
     * uibExperimental.updateTemplateData(element, { userName: 'Jane' })
     */
    updateTemplateData(element, newData) {
        const storedData = this.#templateDataMap.get(element)
        if (!storedData) {
            console.warn('[UibExperimental] No template data found for element')
            return
        }

        // Merge new data with existing data
        Object.assign(storedData, newData)

        // Re-render the template
        const template = this.#templateStringMap.get(element)
        if (template) {
            const newContent = this._renderTemplate(template, storedData)
            element.innerHTML = newContent
        }

        // Update any uibuilder variables that changed
        Object.entries(newData).forEach(([key, value]) => {
            this.set(key, value)
        })
    }

    /**
     * Remove template binding from an element
     * @param {HTMLElement} element - Element to unbind
     * @returns {void}
     */
    unbindTemplate(element) {
        // Remove from template maps
        this.#templateStringMap.delete(element)
        this.#templateDataMap.delete(element)

        // Remove from variable tracking
        this.#templateVariableMap.forEach((elements) => {
            elements.delete(element)
        })
    }

    /** Apply template to elements with uib-template attribute
     * @param {object} data - Data object for template interpolation
     * @param {boolean} autoUpdate - Whether to enable auto-updates when variables change (default: true)
     * @returns {void}
     */
    applyTemplates(data = {}, autoUpdate = true) {
        const templateElements = document.querySelectorAll('[uib-template]')

        templateElements.forEach((element) => {
            const templateSelector = element.getAttribute('uib-template')
            const templateElement = document.querySelector(templateSelector)

            if (templateElement) {
                const template = templateElement.innerHTML

                if (autoUpdate) {
                    // Use the new auto-update processTemplate
                    const processed = this.processTemplate(template, data, element)
                    element.innerHTML = processed
                } else {
                    // Use simple template processing without auto-update
                    const processed = this._renderTemplate(template, data)
                    element.innerHTML = processed
                }
            } else {
                console.warn(`[UibExperimental] Template element not found for selector: "${templateSelector}"`)
            }
        })
    }

    // #endregion --- Template Engine Experimental Features --- //

    // #region --- Auto Layout Experimental Features --- //

    /** Apply experimental auto-layout to container elements
     * @param {string} selector - CSS selector for containers
     * @param {object} options - Layout options
     * @returns {void}
     * @example
     * uibExperimental.applyAutoLayout('.auto-grid', {
     *     type: 'grid',
     *     columns: 'auto-fit',
     *     gap: '1rem'
     * })
     */
    applyAutoLayout(selector, options = {}) {
        const containers = document.querySelectorAll(selector)

        containers.forEach((container) => {
            if (!(container instanceof HTMLElement)) return

            const layoutType = options.type || 'flex'

            if (layoutType === 'grid') {
                container.style.display = 'grid'
                container.style.gridTemplateColumns = options.columns || 'repeat(auto-fit, minmax(200px, 1fr))'
                container.style.gap = options.gap || '1rem'
            } else if (layoutType === 'flex') {
                container.style.display = 'flex'
                container.style.flexWrap = options.wrap || 'wrap'
                container.style.gap = options.gap || '1rem'
                container.style.justifyContent = options.justify || 'space-between'
            }

            // Add responsive behavior
            if (options.responsive !== false) {
                this._addResponsiveLayout(container, layoutType, options)
            }
        })
    }

    /** Add responsive behavior to layout
     * @param {HTMLElement} container - Container element
     * @param {string} layoutType - Type of layout
     * @param {object} options - Layout options
     * @private
     */
    _addResponsiveLayout(container, layoutType, options) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width

                if (layoutType === 'grid') {
                    // Adjust grid columns based on width
                    const minColumnWidth = options.minColumnWidth || 200
                    const columns = Math.floor(width / minColumnWidth) || 1
                    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
                } else if (layoutType === 'flex') {
                    // Adjust flex direction based on width
                    if (width < (options.breakpoint || 768)) {
                        container.style.flexDirection = 'column'
                    } else {
                        container.style.flexDirection = 'row'
                    }
                }
            }
        })

        resizeObserver.observe(container)
    }

    // #endregion --- Auto Layout Experimental Features --- //

    // #region --- Utility Methods --- //

    /** Get experimental metadata
     * @returns {object} Experimental metadata
     */
    getExperimentalMeta() {
        return UibExperimental._experimentalMeta
    }

    /** Check if an experimental feature is available
     * @param {string} feature - Feature name to check
     * @returns {boolean} Whether feature is available
     */
    hasExperimentalFeature(feature) {
        return UibExperimental._experimentalMeta.features.split(',').includes(feature)
    }

    /** Enable experimental debug mode
     * @param {boolean} enabled - Whether to enable debug mode (default: true)
     * @returns {void}
     */
    setExperimentalDebug(enabled = true) {
        if (enabled) {
            console.info('[UibExperimental] Debug mode enabled')
            if (typeof window !== 'undefined') {
                window.uibExpDebug = {
                    bindings: this.#reactiveBindings,
                    elements: this.#experimentalElements,
                    dialogs: this.#activeDialogs,
                }
            }
        } else {
            if (typeof window !== 'undefined' && 'uibExpDebug' in window) {
                delete window.uibExpDebug
            }
        }
    }

    /** Clean up experimental features
     * @returns {void}
     */
    cleanup() {
        // Disconnect observers
        this.#reactiveObserver?.disconnect()

        // Close all dialogs
        this.closeAllDialogs()

        // Clear experimental elements
        this.#experimentalElements.clear()

        // Clear bindings
        this.#reactiveBindings.clear()

        // Clear template tracking
        this.#templateVariableMap.clear()
        this.#templateDataMap.clear()
        this.#templateStringMap.clear()

        console.info('[UibExperimental] Cleanup completed')
    }

    // #endregion --- Utility Methods --- //
}

// Create experimental instance
const uibExperimental = new UibExperimental()

// Export both class and instance
export { uibExperimental }
export default uibExperimental

// Add to global scope for script tag usage
if (typeof window !== 'undefined') {
    window.uibExperimental = uibExperimental
}
