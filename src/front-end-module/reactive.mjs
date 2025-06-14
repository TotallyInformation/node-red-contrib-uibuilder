/**
 * @kind module
 * @module reactive
 * @description Reactive proxy implementation for uibuilder (Loosely based on Vue.js v3 reactivity)
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025 Julian Knight (Totally Information)
 */

/**
 * Reactive proxy class that wraps variables/objects to make them reactive
 * @class
 *
 * @example
 * // Basic usage
 * const reactiveData = new Reactive({ count: 0, user: { name: 'John' } })
 * const proxy = reactiveData.create()
 *
 * // Listen to all changes
 * const ref = proxy.onChange((newValue, oldValue, propertyPath, target) => {
 *     console.log(`Property ${propertyPath} changed from ${oldValue} to ${newValue}`)
 * })
 *
 * // Changes will show full paths:
 * proxy.count = 5                // propertyPath = "count"
 * proxy.user.name = 'Jane'       // propertyPath = "user.name"
 *
 * // Cancel the listener
 * proxy.cancelChange(ref)
 */
export class Reactive {
    static version = '2025-06-14' // Version of the reactive module

    /** Create a new Reactive instance
     * @param {*} srcvar The source variable to wrap
     */
    constructor(srcvar) {
        // If srcvar is not an object, wrap it in an object to make it proxy-able
        this.target = typeof srcvar === 'object' && srcvar !== null ? srcvar : { value: srcvar, }

        // Storage for change listeners - watches all changes
        this.changeListeners = new Map()
        this.listenerIdCounter = 0
    }

    /** Helper function to check if an object is already reactive
     * @param {*} obj Object to check
     * @returns {boolean} True if the object is already reactive
     * @private
     */
    _isReactive(obj) {
        return obj && obj.__v_isReactive === true
    }

    /** Helper function to trigger all change listeners
     * @param {string} propertyPath Full property path (e.g., "user.name")
     * @param {*} value New value
     * @param {*} oldValue Previous value
     * @param {*} target The target object
     * @private
     */
    _triggerListeners(propertyPath, value, oldValue, target) {
        this.changeListeners.forEach((callback) => {
            try {
                callback(value, oldValue, propertyPath, target)
            } catch (error) {
                console.warn(`[uibuilder:reactive] Error in onChange listener for "${propertyPath}":`, error)
            }
        })
    }

    /** Helper function to make an object reactive with property path tracking
     * @param {*} obj Object to make reactive
     * @param {string} basePath Base property path for nested objects
     * @returns {Proxy} Reactive proxy object
     * @private
     */
    _createReactiveObject(obj, basePath = '') {
        if (!obj || typeof obj !== 'object') return obj
        if (this._isReactive(obj)) return obj

        // Don't proxy DOM elements, functions, or other special objects
        if ( (Element && obj instanceof Element) || typeof obj === 'function' || obj instanceof Date || obj instanceof RegExp) {
            console.warn('[uibuilder:reactive] Can not proxy DOM elements, functions or other special objects')
            return obj
        }

        const proxy = new Proxy(obj, {
            get: (target, key, receiver) => {
                // Mark as reactive
                if (key === '__v_isReactive') return true

                // Add onChange method to the proxy - simplified to watch all changes
                if (key === 'onChange') {
                    return (callback) => {
                        if (typeof callback !== 'function') {
                            throw new Error('[uibuilder:reactive] onChange callback must be a function')
                        }

                        const listenerId = ++this.listenerIdCounter
                        this.changeListeners.set(listenerId, callback)

                        // Return a reference object that can be used to cancel the listener
                        return {
                            id: listenerId,
                            cancel: () => {
                                this.changeListeners.delete(listenerId)
                            },
                        }
                    }
                }

                // Add cancelChange method to the proxy
                if (key === 'cancelChange') {
                    return (listenerRef) => {
                        if (!listenerRef || typeof listenerRef.cancel !== 'function') {
                            console.warn('[uibuilder:reactive] Invalid listener reference provided to cancelChange')
                            return false
                        }

                        try {
                            listenerRef.cancel()
                            return true
                        } catch (error) {
                            console.warn('[uibuilder:reactive] Error cancelling listener:', error)
                            return false
                        }
                    }
                }

                const result = Reflect.get(target, key, receiver)

                // If the result is an object, make it reactive too with the extended path
                if (result && typeof result === 'object' && !this._isReactive(result)) {
                    const newPath = basePath ? `${basePath}.${String(key)}` : String(key)
                    return this._createReactiveObject(result, newPath)
                }

                return result
            },

            set: (target, key, value, receiver) => {
                // Don't allow setting the reactive marker or special methods
                if (key === '__v_isReactive' || key === 'onChange' || key === 'cancelChange') return true

                const oldValue = target[key]
                const hadKey = Object.prototype.hasOwnProperty.call(target, key)
                const result = Reflect.set(target, key, value, receiver)

                // Only trigger effects if the value actually changed or it's a new property
                if (!hadKey || value !== oldValue) {
                    // Create the full property path
                    const propertyPath = basePath ? `${basePath}.${String(key)}` : String(key)

                    // Trigger all change listeners with the full property path
                    this._triggerListeners(propertyPath, value, oldValue, receiver)

                    // Dispatch a custom event for the property change if dispatcher provided
                    try {
                        this._dispatchCustomEvent('uibuilder:reactive:propertyChanged', {
                            property: propertyPath,
                            value,
                            oldValue,
                            target: receiver,
                        })
                    } catch (error) {
                        console.warn('[uibuilder:reactive] Error dispatching custom event:', error)
                    }
                }

                return result
            },

            deleteProperty: (target, key) => {
                const hadKey = Object.prototype.hasOwnProperty.call(target, key)
                const oldValue = target[key]
                const result = Reflect.deleteProperty(target, key)

                if (hadKey && result) {
                    // Create the full property path
                    const propertyPath = basePath ? `${basePath}.${String(key)}` : String(key)

                    // Trigger all change listeners for deletion with the full property path
                    this._triggerListeners(propertyPath, undefined, oldValue, target)

                    // Dispatch a custom event for the property deletion if dispatcher provided
                    try {
                        this._dispatchCustomEvent('uibuilder:reactive:propertyDeleted', {
                            property: propertyPath,
                            oldValue,
                            target,
                        })
                    } catch (error) {
                        console.warn('[uibuilder:reactive] Error dispatching delete event:', error)
                    }
                }

                return result
            },
        })

        return proxy
    }

    /** Standard fn to create a custom event with details & dispatch it
     * @param {string} title The event name
     * @param {*} details Any details to pass to event output
     * @private
     */
    _dispatchCustomEvent(title, details) {
        const event = new CustomEvent(title, { detail: details, })
        document.dispatchEvent(event)
    }

    /** Create and return the reactive proxy
     * @returns {Proxy} A proxy object that can be used reactively
     */
    create() {
        return this._createReactiveObject(this.target)
    }

    /** Get the number of active listeners
     * @returns {number} Number of active change listeners
     */
    getListenerCount() {
        return this.changeListeners.size
    }

    /** Clear all listeners
     * @returns {void}
     */
    clearAllListeners() {
        this.changeListeners.clear()
    }
}

/** Convenience function to create a reactive proxy (maintains backward compatibility)
 * @param {*} srcvar The source variable to wrap
 * @returns {Proxy} A proxy object that can be used reactively
 */
export function reactive(srcvar) {
    const reactiveInstance = new Reactive(srcvar)
    return reactiveInstance.create()
}

export default Reactive
