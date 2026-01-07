/** uibuilder Web Worker module for capturing HTTP headers
 * Creates an inline web worker that fetches HTTP headers from the server
 *
 * @module uib-worker
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025 Julian Knight (Totally Information)
 */

/** The inline worker code as a string
 * This worker makes a HEAD request to capture response headers
 */
const workerCode = `
    'use strict'

    /** Fetch headers from the server
     * @param {string} url URL to fetch headers from
     */
    async function fetchHeaders(url) {
        try {
            // Make a HEAD request to minimize data transfer
            const response = await fetch(url, {
                method: 'HEAD',
                cache: 'no-store',
                credentials: 'same-origin',
            })

            // Convert headers to a plain object
            const headers = {}
            for (const [key, value] of response.headers.entries()) {
                headers[key] = value
            }

            // Send headers back to main thread
            self.postMessage({
                type: 'headers',
                success: true,
                headers: headers,
                status: response.status,
                statusText: response.statusText,
                url: response.url,
            })
        } catch (error) {
            self.postMessage({
                type: 'headers',
                success: false,
                error: error.message,
            })
        }
    }

    // Listen for messages from main thread
    self.onmessage = (event) => {
        const { type, url } = event.data

        switch (type) {
            case 'fetchHeaders':
                fetchHeaders(url || self.location.origin)
                break

            case 'ping':
                self.postMessage({ type: 'pong' })
                break

            default:
                self.postMessage({ type: 'error', message: 'Unknown message type: ' + type })
        }
    }

    // Signal that worker is ready
    self.postMessage({ type: 'ready' })
`

/** Create and manage the uibuilder header worker
 * @class UibHeaderWorker
 */
class UibHeaderWorker {
    /** @type {Worker|null} The web worker instance */
    #worker = null
    /** @type {string|null} The blob URL for cleanup */
    #workerUrl = null
    /** @type {boolean} Whether the worker is ready */
    #isReady = false
    /** @type {Object<string, string>} Captured HTTP headers */
    #headers = {}
    /** @type {boolean} Whether headers have been fetched */
    #headersFetched = false
    /** @type {Function[]} Callbacks waiting for headers */
    #pendingCallbacks = []
    /** @type {Object} Additional response info */
    #responseInfo = {}

    /** Create and start the worker */
    constructor() {
        // 1. Try pre-fetched headers (set by inline script before module load)
        if (window.__uibHeaders && Object.keys(window.__uibHeaders).length > 0) {
            this.#headers = window.__uibHeaders
            this.#headersFetched = true
            this.#responseInfo = { source: 'prefetch' }
            return
        }

        // 2. If pre-fetch is in progress, wait for it
        if (window.__uibHeadersPromise) {
            window.__uibHeadersPromise.then(headers => {
                if (!this.#headersFetched && Object.keys(headers).length > 0) {
                    this.#headers = headers
                    this.#headersFetched = true
                    this.#responseInfo = { source: 'prefetch-async' }
                    this.#resolvePendingCallbacks()
                }
            })
        }
        // 3. Otherwise, create the worker to fetch headers
        this.#createWorker()
    }

    #resolvePendingCallbacks() {
        while (this.#pendingCallbacks.length > 0) {
            const callback = this.#pendingCallbacks.shift()
            callback(this.#headers)
        }
    }
    
    /** Create the inline worker from blob
     * @private
     */
    #createWorker() {
        try {
            // Create blob from worker code
            const blob = new Blob([workerCode], { type: 'application/javascript' })
            this.#workerUrl = URL.createObjectURL(blob)

            // Create worker
            this.#worker = new Worker(this.#workerUrl)

            // Set up message handler
            this.#worker.onmessage = this.#handleMessage.bind(this)

            // Set up error handler
            this.#worker.onerror = (error) => {
                console.error('[uib-worker] Worker error:', error.message)
                this.#cleanup()
            }
        } catch (error) {
            console.warn('[uib-worker] Failed to create worker:', error.message)
        }
    }

    /** Handle messages from the worker
     * @param {MessageEvent} event The message event
     * @private
     */
    #handleMessage(event) {
        const { type, success, headers, error, status, statusText, url } = event.data

        switch (type) {
            case 'ready':
                this.#isReady = true
                // Automatically fetch headers when worker is ready
                this.fetchHeaders()
                break

            case 'headers':
                if (success) {
                    this.#headers = headers
                    this.#responseInfo = { status, statusText, url }
                    this.#headersFetched = true

                    // Resolve any pending callbacks
                    while (this.#pendingCallbacks.length > 0) {
                        const callback = this.#pendingCallbacks.shift()
                        callback(this.#headers)
                    }
                } else {
                    console.warn('[uib-worker] Failed to fetch headers:', error)
                    this.#headersFetched = true // Mark as fetched even on error
                    
                    // Resolve pending callbacks with empty object
                    while (this.#pendingCallbacks.length > 0) {
                        const callback = this.#pendingCallbacks.shift()
                        callback({})
                    }
                }
                break

            case 'pong':
                // Worker is alive
                break

            case 'error':
                console.warn('[uib-worker] Worker reported error:', event.data.message)
                break
        }
    }

    /** Request the worker to fetch headers
     * @param {string} [url] Optional URL to fetch headers from (defaults to current page)
     */
    fetchHeaders(url) {
        if (this.#worker && this.#isReady) {
            this.#worker.postMessage({
                type: 'fetchHeaders',
                url: url || window.location.href,
            })
        }
    }

    /** Get the captured headers
     * @param {string} [headerName] Optional specific header name to retrieve
     * @returns {Object|string|null} All headers, a specific header value, or null if not found
     */
    getHeaders(headerName) {
        if (headerName) {
            // Headers are case-insensitive, normalize to lowercase
            const normalizedName = headerName.toLowerCase()
            for (const [key, value] of Object.entries(this.#headers)) {
                if (key.toLowerCase() === normalizedName) {
                    return value
                }
            }
            return null
        }
        return { ...this.#headers }
    }

    /** Get headers with a promise (waits if not yet fetched)
     * @param {string} [headerName] Optional specific header name to retrieve
     * @returns {Promise<Object|string|null>} Promise resolving to headers
     */
    getHeadersAsync(headerName) {
        return new Promise((resolve) => {
            if (this.#headersFetched) {
                resolve(this.getHeaders(headerName))
            } else {
                this.#pendingCallbacks.push((headers) => {
                    if (headerName) {
                        const normalizedName = headerName.toLowerCase()
                        for (const [key, value] of Object.entries(headers)) {
                            if (key.toLowerCase() === normalizedName) {
                                resolve(value)
                                return
                            }
                        }
                        resolve(null)
                    } else {
                        resolve({ ...headers })
                    }
                })
            }
        })
    }

    /** Get response info (status, statusText, url)
     * @returns {Object} Response information
     */
    getResponseInfo() {
        return { ...this.#responseInfo }
    }

    /** Check if headers have been fetched
     * @returns {boolean} True if headers are available
     */
    get isReady() {
        return this.#headersFetched
    }

    /** Clean up the worker
     * @private
     */
    #cleanup() {
        if (this.#worker) {
            this.#worker.terminate()
            this.#worker = null
        }
        if (this.#workerUrl) {
            URL.revokeObjectURL(this.#workerUrl)
            this.#workerUrl = null
        }
        this.#isReady = false
    }

    /** Terminate the worker and clean up resources */
    terminate() {
        this.#cleanup()
    }
}

// Create singleton instance
const uibHeaderWorker = new UibHeaderWorker()

export { uibHeaderWorker, UibHeaderWorker }
export default uibHeaderWorker
