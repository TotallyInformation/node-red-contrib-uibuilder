/** A web component that displays page metadata.
 * Metadata comes from makdown frontmatter, with some from the system.
 *
 * @example
 * // HTML usage:
 * <show-meta></show-meta>
 *
 * // With custom metadata object:
 * const el = document.querySelector('show-meta')
 * el.metadata = { title: 'My Page', author: 'John Doe', created: '2026-01-01' }
 *
 * Copyright (c) 2026-2026 Julian Knight (Totally Information)
 * Licensed under the Apache License, Version 2.0
 */

/** @type {string} Component tag name */
const componentName = 'show-meta'

/** @type {string} Component version */
const componentVersion = '1.0.0'

/** ShowMeta web component - displays metadata in a grid layout
 * @class
 * @augments HTMLElement
 */
class ShowMeta extends HTMLElement {
    /** @type {object} Internal metadata storage */
    #metadata = {}

    /** Component constructor */
    constructor() {
        super()
        this.#metadata = {}
    }

    /** Called when element is added to the DOM */
    connectedCallback() {
        this.#render()
    }

    /** Get the current metadata object
     * @returns {object} The metadata object
     */
    get metadata() {
        return this.#metadata
    }

    /** Set the metadata object and re-render
     * @param {object} value - The metadata object to display
     */
    set metadata(value) {
        if (typeof value === 'object' && value !== null) {
            this.#metadata = value
            this.#render()
        }
    }

    /** Format a value for display
     * @param {*} value - The value to format
     * @returns {string} Formatted value as HTML string
     */
    #formatValue(value) {
        if (value === null || value === undefined) {
            return '<em>Not set</em>'
        }
        if (Array.isArray(value)) {
            if (value.length === 0) return '<em>None</em>'
            if (window['uibuilder']) {
                return uibuilder.syntaxHighlight(value)
            }
            return value
                .map(v => `<span class="show-meta-tag">${this.#escapeHtml(String(v))}</span>`)
                .join(' ')
        }
        if (typeof value === 'object') {
            if (window['uibuilder']) {
                return uibuilder.syntaxHighlight(value)
            }
            return `<pre>${this.#escapeHtml(JSON.stringify(value, null, 2))}</pre>`
        }
        if (typeof value === 'boolean') {
            return value ? 'True' : 'False'
        }
        return this.#escapeHtml(String(value))
    }

    /** Escape HTML special characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    #escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    /** Format a field name for display (convert camelCase/snake_case to Title Case)
     * @param {string} name - The field name
     * @returns {string} Formatted field name
     */
    #formatFieldName(name) {
        return name
            // Insert space before capitals (camelCase)
            .replace(/([A-Z])/g, ' $1')
            // Replace underscores with spaces
            .replace(/_/g, ' ')
            // Capitalize first letter of each word
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim()
    }

    /** Render the component content */
    #render() {
        const meta = this.#metadata
        const entries = Object.entries(meta)

        if (entries.length === 0) {
            this.innerHTML = '<article class="show-meta"><p><em>No metadata available</em></p></article>'
            return
        }

        // Filter out internal/private fields (starting with _ or containing 'body'/'content' which can be large)
        const displayEntries = entries.filter(([key]) => {
            return !key.startsWith('_')
                && !['body', 'content', 'htmlbody'].includes(key.toLowerCase())
        })

        const rows = displayEntries.map(([key, value]) => {
            return `
                <dt class="show-meta-label">${this.#formatFieldName(key)}</dt>
                <dd class="show-meta-value">${this.#formatValue(value)}</dd>
            `
        }).join('')

        this.innerHTML = /* html */`
            <article class="show-meta">
                <h2>Page Metadata</h2>
                <dl class="show-meta-grid">
                    ${rows}
                </dl>
            </article>
            <style>
                .show-meta {
                    dl {
                        display: grid;
                        grid-template-columns: max-content 1fr;
                        gap: 0.5rem 1rem;
                    }

                    dt {
                        font-weight: bolder;
                        text-align: right;
                    }

                    dd {
                        margin: 0;
                    }
                }
                .show-meta-value pre {
                    margin: 0;
                    padding: 0.5rem;
                    border-radius: 0.25rem;
                    overflow-x: auto;
                    font-size: 0.875em;
                }
                .show-meta-tag {
                    display: inline-block;
                    padding: 0.125rem 0.5rem;
                    margin: 0.125rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                }
            </style>
        `
    }
}

// Register the custom element
customElements.define(componentName, ShowMeta)

export { ShowMeta, componentName, componentVersion }
export default ShowMeta
