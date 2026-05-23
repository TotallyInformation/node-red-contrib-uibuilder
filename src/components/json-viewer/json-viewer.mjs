/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable @stylistic/max-statements-per-line */
/* eslint-disable jsdoc/valid-types */
// @ts-nocheck
/** A zero-dependency web component that renders JSON/JavaScript data as an
 * interactive, collapsible, searchable tree with syntax highlighting.
 *
 * Also exports a pure {@link renderToHTML} function for SSR/Node.js use —
 * it produces an HTML string without touching the DOM.
 *
 * Version See COMPONENT_VERSION
 */
/*
  Copyright (c) 2026-2026 Julian Knight (Totally Information)

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

import TiBaseComponent from '../ti-base-component.mjs'

// Max number of object/array entries to render per node before truncating with "…". This is a safeguard against rendering huge objects that can freeze the browser. The total node budget is maxChildren * 500, which allows for some nested expansion while still preventing runaway rendering.
const CONFIGMAXCHILDREN = 1000
// Approx max total nodes to render across the entire tree (including nested children) before truncating with "… node limit reached". This is a hard cap to prevent freezing on extremely large or deeply nested objects, even if maxChildren is set high or unlimited. The default allows for some nested expansion while still providing a safety net against runaway rendering.
const CONFIGMAXTOTAL = 50000

// ── Component version ─────────────────────────────────────────────────────────

/** Date-based component version @type {string} */
const COMPONENT_VERSION = '2026-05-09'

// ── CSS injected into the document head (light DOM, scoped to json-viewer) ────

const STYLES = /* css */`
json-viewer {
    display: block;
    font-family: var(--jv-font-family, 'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace);
    font-size: var(--jv-font-size, 0.875rem);
    line-height: 1.5;
    background: var(--jv-bg, transparent);
    color: var(--jv-color, inherit);
    overflow: auto;
}
.jv-tree-wrap {
    display: flow-root;
}
.jv-controls {
    float: right;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0 0.2rem 0.4rem;
}
.jv-search-row {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid hsl(0 0% 50% / 0.2);
}
.jv-search {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0.2rem 0.4rem;
    border: 1px solid hsl(0 0% 60%);
    border-radius: 3px;
    font-family: inherit;
    font-size: inherit;
    background: var(--jv-bg, transparent);
    color: var(--jv-color, inherit);
}
.jv-btn {
    padding: 0.15rem 0.5rem;
    border: 1px solid hsl(0 0% 60%);
    border-radius: 3px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 0.8em;
    white-space: nowrap;
}
.jv-btn:hover, .jv-btn:focus-visible {
    background: hsl(0 0% 50% / 0.15);
    outline: 2px solid hsl(200 100% 50%);
    outline-offset: 1px;
}
.jv-tree { padding: 0.25rem 0.5rem; }
.jv-node {
    padding-left: var(--jv-indent, 1.25rem);
    outline: none;
}
.jv-node.jv-leaf:focus-visible,
details.jv-node > summary:focus-visible {
    outline: 2px solid hsl(200 100% 50%);
    outline-offset: 1px;
    border-radius: 2px;
}
/* <details>/<summary> expand/collapse — no JavaScript required */
details.jv-node > summary {
    list-style: none;
    margin-left: calc(-1 * var(--jv-indent, 1.25rem));
    cursor: pointer;
    display: block;
}
details.jv-node > summary::-webkit-details-marker { display: none; }
details.jv-node > summary::marker { content: ''; }
details.jv-node > summary::before {
    content: '▼';
    display: inline-block;
    width: var(--jv-indent, 1.25rem);
    text-align: center;
    font-size: 0.65em;
    color: var(--jv-toggle-color, hsl(0 0% 55%));
    user-select: none;
}
details.jv-node:not([open]) > summary::before { content: '▶'; }
details.jv-node[open] > summary .jv-hint { display: none; }
details.jv-node:not([open]) > summary .jv-hint { display: inline; }
.jv-key { color: var(--jv-key-color, hsl(230 60% 45%)); cursor: pointer; }
.jv-key:hover { text-decoration: underline; }
.jv-key[contenteditable='true'] {
    border-bottom: 1px dashed hsl(0 0% 60%);
    cursor: text;
    outline: none;
    min-width: 2ch;
    text-decoration: none !important;
}
.jv-key[contenteditable='true']:focus { border-bottom-color: hsl(200 100% 50%); }
.jv-sep { color: hsl(0 0% 50%); margin: 0 0.1em; }
.jv-string  { color: var(--jv-string-color,  hsl(10  80% 40%)); }
.jv-val.jv-string::before,
.jv-val.jv-string::after { content: '"'; }
.jv-number  { color: var(--jv-number-color,  hsl(260 70% 50%)); }
.jv-val.jv-bigint { color: var(--jv-number-color, hsl(260 70% 50%)); }
.jv-val.jv-bigint::after { content: 'n'; }
.jv-boolean { color: var(--jv-boolean-color, hsl(200 80% 40%)); font-weight: bold; }
.jv-null,
.jv-undefined { color: var(--jv-null-color, hsl(0 0% 55%)); font-style: italic; }
.jv-special,
.jv-circular { color: var(--jv-special-color, hsl(30 80% 40%)); font-style: italic; }
.jv-regexp  { color: var(--jv-regexp-color, hsl(330 70% 45%)); }
.jv-bracket,
.jv-bracket-close { color: hsl(0 0% 45%); }
.jv-hint { color: hsl(0 0% 60%); font-size: 0.85em; margin-left: 0.3em; }
.jv-copy {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8em;
    padding: 0 0.15rem;
    margin: 0;
    color: hsl(0 0% 60%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
}
.jv-node:hover > .jv-copy,
.jv-node.jv-leaf:focus-visible > .jv-copy,
details.jv-node:focus-within > .jv-copy { opacity: 1; }
.jv-copy:hover,
.jv-copy:focus-visible { color: hsl(200 100% 40%); opacity: 1; outline: 1px solid hsl(200 100% 50%); }
.jv-add {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: bold;
    padding: 0 0.2rem;
    margin: 0 0.1rem;
    color: hsl(120 50% 40%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
    vertical-align: middle;
}
details.jv-node:not([open]) > summary .jv-add { display: none !important; }
details.jv-node[open] > summary:hover .jv-add,
details.jv-node[open] > summary:focus-visible .jv-add { opacity: 1; }
.jv-add:hover,
.jv-add:focus-visible { color: hsl(120 70% 30%); opacity: 1; outline: 1px solid hsl(120 70% 50%); }
.jv-delete {
    appearance: none;
    -webkit-appearance: none;
    opacity: 0;
    border: none;
    box-shadow: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8em;
    padding: 0 0.15rem;
    margin: 0;
    color: hsl(0 60% 55%);
    display: inline-flex;
    align-items: center;
    line-height: 1;
    transition: opacity 0.15s;
    border-radius: 2px;
}
/* Leaf nodes: delete is a direct child of the node div */
.jv-node.jv-leaf:hover > .jv-delete,
.jv-node.jv-leaf:focus-visible > .jv-delete { opacity: 1; }
/* Expandable nodes: delete is inside <summary> */
details.jv-node > summary:hover .jv-delete,
details.jv-node > summary:focus-visible .jv-delete { opacity: 1; }
.jv-delete:hover,
.jv-delete:focus-visible { color: hsl(0 80% 45%); opacity: 1; outline: 1px solid hsl(0 80% 50%); }
.jv-children { padding-left: 0; }
.jv-hl { background: var(--jv-hl-bg, hsl(50 100% 70% / 0.6)); border-radius: 2px; }
.jv-hidden { display: none !important; }
.jv-truncated {
    color: var(--jv-truncated-color, hsl(0 0% 55%));
    font-style: italic;
    font-size: 0.85em;
    cursor: default;
    user-select: none;
}
.jv-val[contenteditable='true'] {
    border-bottom: 1px dashed hsl(0 0% 60%);
    cursor: text;
    outline: none;
    min-width: 2ch;
}
.jv-val[contenteditable='true']:focus { border-bottom-color: hsl(200 100% 50%); }

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .jv-key     { color: var(--jv-key-color,     hsl(220 80% 75%)); }
    .jv-string  { color: var(--jv-string-color,  hsl(30  90% 65%)); }
    .jv-number  { color: var(--jv-number-color,  hsl(270 80% 75%)); }
    .jv-val.jv-bigint { color: var(--jv-number-color, hsl(270 80% 75%)); }
    .jv-boolean { color: var(--jv-boolean-color, hsl(200 80% 70%)); }
    .jv-null,
    .jv-undefined { color: var(--jv-null-color, hsl(0 0% 60%)); }
    .jv-special,
    .jv-circular  { color: var(--jv-special-color, hsl(40 80% 65%)); }
    .jv-regexp    { color: var(--jv-regexp-color, hsl(330 80% 70%)); }
    .jv-truncated { color: var(--jv-truncated-color, hsl(0 0% 60%)); }
    .jv-bracket,
    .jv-bracket-close { color: hsl(0 0% 65%); }
    details.jv-node > summary::before { color: var(--jv-toggle-color, hsl(0 0% 70%)); }
}

/* Print styles: expand everything and hide controls */
@media print {
    .jv-controls { display: none; }
    .jv-search-row { display: none; }
    details.jv-node > :not(summary) { display: block !important; }
    details.jv-node > summary .jv-hint { display: none !important; }
    .jv-copy { display: none; }
    .jv-add { display: none; }
    .jv-delete { display: none; }
}
`

// ── Pure utility functions (no DOM) ───────────────────────────────────────────

/**
 * Escape a string for safe insertion into HTML content or attribute values.
 * @param {*} str - Value to escape (coerced to string)
 * @returns {string} HTML-safe string
 */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

/**
 * Return a normalised type label for any JavaScript value.
 * NB: If updating this, consider updating the equivalent in tilib.cjs
 * @param {*} value - Any JavaScript value
 * @returns {string} Type label
 */
function typeOf(value) {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string' || value instanceof String) return 'string'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'symbol') return 'symbol'
    if (typeof value === 'bigint') return 'bigint'
    if (typeof value === 'function') return 'function'
    if (Number.isFinite(value)) return 'number'
    if (Number.isNaN(value)) return 'nan'
    if (Array.isArray(value)) return 'array'
    if (value instanceof Date) return 'date'
    if (value instanceof RegExp) return 'regexp'
    if (value instanceof Promise) return 'promise'
    if (value instanceof Error) return 'error'
    if (value instanceof Map) return 'map'
    if (value instanceof Set) return 'set'
    if (value instanceof WeakMap) return 'weakmap'
    if (value instanceof WeakSet) return 'weakset'
    if (value instanceof ArrayBuffer) return 'arraybuffer'
    if (ArrayBuffer.isView(value)) return 'typedarray'
    if (value instanceof URL || value instanceof URLSearchParams) return 'urllike'
    if (!Number.isFinite(value) && typeof value === 'number') return 'infinity'
    return typeof value
}

/**
 * Render a scalar (leaf) value as a typed HTML span.
 * @param {*} val - The primitive value to render
 * @param {string} type - Pre-computed {@link typeOf} result
 * @param {boolean} [editable] - If true, render content as plain text for editing. Default = false
 * @returns {string} HTML span string
 */
function renderLeafValue(val, type, editable = false) {
    // Editable scalars: show raw text without HTML formatting so the user can type freely.
    // bigint strips the trailing 'n'; null/undefined show their literal text.
    if (editable && (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint' || type === 'null' || type === 'undefined')) {
        if (type === 'null') return 'null'
        if (type === 'undefined') return 'undefined'
        return escHtml(String(val))
    }

    switch (type) {
        case 'string':
            return escHtml(val)
        case 'number':
            return escHtml(String(val))
        case 'bigint':
            return escHtml(String(val))
        case 'boolean':
            return String(val)
        case 'null':
            return 'null'
        case 'undefined':
            return 'undefined'
        case 'date':
            return escHtml(`[Date: ${val.toISOString()}]`)
        case 'nan':
            return `[NaN]`
        case 'regexp':
            return escHtml(String(val))
        case 'function': {
            const fnName = val.name || 'anonymous'
            const kindMap = { AsyncFunction: 'async', GeneratorFunction: 'generator', AsyncGeneratorFunction: 'async-generator', }
            const fnKind = kindMap[val.constructor.name] ?? '' // std sync fns will have empty string
            const src = val.toString()
                .trimStart()
                .slice(0, 20)
            const arrow = !src.startsWith('function') && !src.startsWith('async function') ? 'arrow ' : ''
            const fnType = fnKind || arrow ? `{${`${arrow}${fnKind}`.trim()}}` : ''
            return escHtml(`[f ${fnName} ${fnType} ]`)
        }
        case 'error':
            return escHtml(`[${val.name}: ${val.message}]`)
        case 'urllike':
            return escHtml(`[URL: ${val.toString()}]`)
        case 'symbol': {
            const desc = val.description !== undefined ? escHtml(val.description) : ''
            return `Symbol(${desc})`
        }
        case 'weakmap':
            return '[WeakMap]'
        case 'weakset':
            return '[WeakSet]'
        case 'arraybuffer':
            return escHtml(JSON.stringify(Array.from(new Uint8Array(val))))
        case 'typedarray':
            return escHtml(JSON.stringify(Array.from(val)))
        default:
            return `[${escHtml(type)}]`
    }
}

/**
 * Build a human-readable item-count summary for a collapsed object or array node.
 * @param {object|Array} val - Object or array value
 * @param {'object'|'array'} type - Value type
 * @returns {string} E.g. "3 props" or "5 items"
 */
function countLabel(val, type) {
    const n = (type === 'map' || type === 'set') ? val.size : type === 'array' ? val.length : Object.keys(val).length
    const noun = (type === 'array' || type === 'set')
        ? (n === 1 ? 'item' : 'items')
        : type === 'map'
            ? (n === 1 ? 'entry' : 'entries')
            : (n === 1 ? 'prop' : 'props')
    return `${n} ${noun}`
}

/**
 * Build a dot-notation path string for a child node.
 * Uses bracket notation for keys that contain non-identifier characters.
 * @param {string} parentPath - The parent node's path (empty string for root)
 * @param {string|number} key - Current key name or array index
 * @param {'object'|'array'} parentType - The parent container type
 * @returns {string} Child path string (e.g. "a.b[2].c")
 */
function buildPath(parentPath, key, parentType) {
    if (parentPath === '') return String(key)
    if (parentType === 'array') return `${parentPath}[${key}]`
    // Keys containing non-identifier chars require bracket notation
    if (/[^a-zA-Z0-9_$]/.test(String(key))) {
        return `${parentPath}["${String(key)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')}"]`
    }
    return `${parentPath}.${key}`
}

/**
 * Parse a raw input into a JavaScript value.
 * Accepts: any JS value, a JSON string, or a pre-parsed object.
 * Non-JSON strings are returned as-is.
 * @param {*} input - The input to parse
 * @returns {*} The parsed (or pass-through) JavaScript value
 */
function parseInput(input) {
    if (typeof input === 'string') {
        try { return JSON.parse(input) } catch (_) { /* not JSON — return as plain string */ }
    }
    return input
}

/**
 * Format a Map key as a display-safe string label for use as a node key.
 * @param {*} k - The Map key value
 * @returns {string} Display-safe string label
 */
function mapKeyLabel(k) {
    if (k === null) return 'null'
    if (k === undefined) return 'undefined'
    if (typeof k === 'string') return k
    if (typeof k === 'number' || typeof k === 'boolean' || typeof k === 'bigint') return String(k)
    if (k instanceof RegExp) return String(k)
    return `(${typeOf(k)})`
}

// ── HTML renderer (pure / no DOM) ─────────────────────────────────────────────

/**
 * @typedef {object} RenderNodeOpts
 * @property {number}           maxDepth    - Max depth to auto-expand (0 = collapse all)
 * @property {boolean}          collapsed   - Force all expandable nodes collapsed
 * @property {boolean}          editable    - Allow inline editing of scalar leaf values
 * @property {boolean}          interactive - Render interactive elements (copy buttons, key path links)
 * @property {string|number|null} key       - Key label for this node (null = no key shown)
 * @property {string}           path        - Dot-notation path to this node
 * @property {number}           depth       - Current recursion depth (0 = root)
 * @property {WeakSet<object>}  seen        - Ancestor object set for circular-ref detection
 * @property {string|null}      parentType  - Type of the parent container (null at root)
 * @property {number}           maxChildren - Max children to render per expandable node (0 = unlimited)
 * @property {{ remaining: number }} budget - Shared mutable node budget; rendering stops when exhausted
 */

/**
 * Recursively render a JavaScript value as an HTML string.
 * This is a **pure function** — it performs no DOM access and is safe for SSR/Node.js use.
 *
 * Circular reference detection uses a DFS ancestor-set strategy: an object is added to
 * `seen` before its children are rendered and removed afterwards. This allows the same
 * object to appear in multiple sibling branches (shared reference) while still correctly
 * detecting true cycles (where a descendant references an ancestor).
 *
 * @param {*} val - The value to render
 * @param {RenderNodeOpts} opts - Rendering options
 * @returns {string} HTML string for this node and all its descendants
 */
function renderNode(val, opts) {
    const { maxDepth, collapsed, editable, interactive, key, path, depth, seen, parentType, maxChildren, budget, } = opts
    const type = typeOf(val)
    const isExpandable = type === 'object' || type === 'array' || type === 'map' || type === 'set'
    const safeKey = key !== null && key !== undefined ? String(key) : null
    const pathAttr = escHtml(path !== '' ? path : '(root)')
    const displayKey = safeKey !== null ? escHtml(safeKey) : null

    // Object keys (string keys, not numeric array indices) within plain objects are renameable
    const isObjectKey = key !== null && key !== undefined && typeof key !== 'number' && parentType === 'object'
    const keyEditable = editable && interactive && isObjectKey

    // Node budget guard: stop rendering if the total node limit is exhausted
    if (budget.remaining <= 0) {
        return `<div class="jv-node jv-leaf jv-truncated" role="treeitem" tabindex="-1" data-jv-path="${pathAttr}" data-jv-type="truncated">… node limit reached</div>`
    }
    budget.remaining--

    // Leaf/circular key: in interactive mode clicking copies the path; in editable mode clicking focuses for rename
    const keyHtml = displayKey !== null
        ? keyEditable
            ? `<span class="jv-key" contenteditable="true" spellcheck="false" data-jv-key-editable="true" data-jv-path="${pathAttr}" aria-label="Edit key name">${displayKey}</span><span class="jv-sep">:</span> `
            : interactive
                ? `<span class="jv-key" data-jv-copy="path" title="Copy path: ${pathAttr}">${displayKey}</span><span class="jv-sep">:</span> `
                : `<span class="jv-key">${displayKey}</span><span class="jv-sep">:</span> `
        : ''
    // Expandable key: clicking <summary> toggles; in editable mode the key span is renameable
    const expandKeyHtml = displayKey !== null
        ? keyEditable
            ? `<span class="jv-key" contenteditable="true" spellcheck="false" data-jv-key-editable="true" data-jv-path="${pathAttr}" aria-label="Edit key name">${displayKey}</span><span class="jv-sep">:</span> `
            : `<span class="jv-key">${displayKey}</span><span class="jv-sep">:</span> `
        : ''

    // ── Circular reference guard ─────────────────────────────────────────────
    if (isExpandable) {
        if (seen.has(val)) {
            return (
                `<div class="jv-node jv-leaf jv-circular" role="treeitem" tabindex="0" data-jv-path="${pathAttr}" data-jv-type="${type}">`
                + `${keyHtml}<span class="jv-circular" title="Circular reference">[Circular \u21ba]</span>`
                + (interactive ? `<button class="jv-copy" data-jv-copy="path" aria-label="Copy path to clipboard" title="Copy path to clipboard" tabindex="-1">\u2398</button>` : '')
                + `</div>`
            )
        }
        seen.add(val)
    }

    // ── Leaf node ────────────────────────────────────────────────────────────
    if (!isExpandable) {
        const canEdit = editable && (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint' || type === 'null' || type === 'undefined')
        const valContent = renderLeafValue(val, type, canEdit)
        const editAttrs = canEdit
            ? ` contenteditable="true" spellcheck="false" data-jv-editable="true" data-jv-type="${type}" aria-label="Edit ${type} value"`
            : ''
        const valHtml = `<span class="jv-val jv-${type}"${editAttrs}>${valContent}</span>`
        const copyKind = canEdit ? 'value' : 'value'

        return (
            `<div class="jv-node jv-leaf jv-${type}" role="treeitem" tabindex="0" data-jv-path="${pathAttr}" data-jv-type="${type}">`
            + `${keyHtml}${valHtml}`
            + (interactive ? `<button class="jv-copy" data-jv-copy="value" aria-label="Copy value to clipboard" title="Copy value to clipboard" tabindex="-1">\u2398</button>` : '')
            + (interactive && editable ? `<button class="jv-delete" aria-label="Delete entry" title="Delete entry" tabindex="-1">\u00D7</button>` : '')
            + `</div>`
        )
    }

    // ── Expandable node (object, array, Map or Set) ──────────────────────────
    const isOpen = !collapsed && depth < maxDepth
    const openAttr = isOpen ? ' open' : ''
    const bracketOpen = (type === 'array' || type === 'set') ? '[' : '{'
    const bracketClose = (type === 'array' || type === 'set') ? ']' : '}'
    const typePrefix = type === 'map' ? 'Map' : type === 'set' ? 'Set' : ''
    const hint = countLabel(val, type)

    // Enumerate children. Maps use index-keyed value entries (map key displayed as label).
    // Sets and arrays use numeric indices. Objects use string keys.
    const mapKeyArr = type === 'map' ? Array.from(val.keys()) : null
    const allEntries = (type === 'array' || type === 'set')
        ? Array.from(val, (v, i) => /** @type {[number, *]} */ ([i, v]))
        : type === 'map'
            ? Array.from(val.values()).map((v, i) => /** @type {[number, *]} */ ([i, v]))
            : Object.entries(val)

    // Per-container truncation
    const hiddenCount = (maxChildren > 0 && allEntries.length > maxChildren) ? allEntries.length - maxChildren : 0
    const entries = hiddenCount > 0 ? allEntries.slice(0, maxChildren) : allEntries
    let truncationHtml = ''
    if (hiddenCount > 0) {
        const noun = (type === 'array' || type === 'set') ? (hiddenCount === 1 ? 'item' : 'items') : (hiddenCount === 1 ? 'prop' : 'props')
        truncationHtml = `<div class="jv-node jv-leaf jv-truncated" role="treeitem" tabindex="-1">… ${hiddenCount} more ${noun} not shown (max-children=${maxChildren})</div>`
    }

    // Render children sequentially — DFS order is required for circular-ref tracking
    const childrenHtml = entries.map(([k, v]) => {
        const childKey = type === 'map' ? mapKeyLabel(mapKeyArr[k]) : k
        return renderNode(v, {
            ...opts,
            key: childKey,
            path: buildPath(path, k, (type === 'map' || type === 'set') ? 'array' : type),
            depth: depth + 1,
            parentType: type,
        })
    }).join('') + truncationHtml

    // Remove from ancestor set after subtree is rendered so siblings can share the same object
    seen.delete(val)

    return (
        `<details class="jv-node jv-${type}"${openAttr} data-jv-path="${pathAttr}" data-jv-type="${type}">`
        + `<summary>${expandKeyHtml}<span class="jv-bracket">${typePrefix}${bracketOpen}</span>${interactive && editable && (type === 'object' || type === 'array') ? `<button class="jv-add" aria-label="Add entry to ${escHtml(type)}" title="Add entry" tabindex="-1">\u002B</button>` : ''}${interactive && editable && depth > 0 ? `<button class="jv-delete" aria-label="Delete entry" title="Delete entry" tabindex="-1">\u00D7</button>` : ''}<span class="jv-hint"> ${bracketClose} ${hint}</span></summary>`
        + `<div class="jv-children" role="group">${childrenHtml}</div>`
        + `<span class="jv-bracket-close">${bracketClose}</span>`
        + (interactive ? `<button class="jv-copy" data-jv-copy="value" aria-label="Copy value as JSON to clipboard" title="Copy value as JSON to clipboard" tabindex="-1">\u2398</button>` : '')
        + `</details>`
    )
}

/**
 * Render any JavaScript value to a self-contained HTML string.
 *
 * This is a **pure function** — it performs no DOM manipulation and is safe for use
 * in Node.js / SSR contexts. Import only this export when a browser environment is
 * not available.
 *
 * @param {*} data - Data to render: any JS value, a JSON string, or a plain object.
 * @param {object}  [opts]                    - Rendering options
 * @param {number}  [opts.maxDepth]           - Maximum depth to auto-expand on first render. Default=2
 * @param {boolean} [opts.collapsed]      - Collapse all expandable nodes on first render. Default=false
 * @param {boolean} [opts.editable]       - Allow inline editing of scalar leaf values. Default=false
 * @param {boolean} [opts.includeStyles]   - Prepend a `<style>` tag containing the component CSS. Default=true
 * @param {number}  [opts.maxChildren]     - Max children rendered per container; excess shows a notice. Default=100 (0=unlimited)
 * @returns {string} Self-contained HTML string (styles + toolbar + tree)
 *
 * @example
 * // SSR / Node.js usage
 * import { renderToHTML } from './json-viewer.mjs'
 * const html = renderToHTML({ hello: 'world' }, { maxDepth: 3 })
 */
export function renderToHTML(data, opts = {}) {
    const maxDepth = typeof opts.maxDepth === 'number' ? Math.max(0, opts.maxDepth) : 2
    const collapsed = !!opts.collapsed
    const editable = !!opts.editable
    const interactive = opts.interactive === true
    const includeStyles = opts.includeStyles !== false
    const maxChildren = typeof opts.maxChildren === 'number' ? Math.max(0, opts.maxChildren) : CONFIGMAXCHILDREN
    const budget = { remaining: maxChildren > 0 ? maxChildren * 500 : CONFIGMAXTOTAL, }
    const value = parseInput(data)

    const searchHtml = interactive
        ? (`<div class="jv-search-row jv-hidden" role="search">`
            + `<input type="search" class="jv-search" placeholder="Search keys or values\u2026" aria-label="Search JSON keys and values">`
            + `</div>`)
        : ''
    const controlsHtml = interactive
        ? (`<div class="jv-controls" role="toolbar" aria-label="JSON viewer controls">`
            + `<button class="jv-btn jv-collapse-all" aria-label="Collapse all nodes" title="Collapse all">\u229f</button>`
            + `<button class="jv-btn jv-expand-all"   aria-label="Expand all nodes"   title="Expand all">\u229e</button>`
            + `<button class="jv-btn jv-search-toggle" aria-label="Toggle search" title="Search" aria-expanded="false">\uD83D\uDD0D</button>`
            + `</div>`)
        : ''

    const treeHtml = renderNode(value, {
        maxDepth,
        collapsed,
        editable,
        interactive,
        key: null,
        path: '',
        depth: 0,
        seen: new WeakSet(),
        parentType: null,
        maxChildren,
        budget,
    })

    const styleTag = includeStyles ? `<style>${STYLES}</style>` : ''
    return `${styleTag}${searchHtml}<div class="jv-tree-wrap">${controlsHtml}<div class="jv-tree" role="tree" aria-label="JSON data tree">${treeHtml}</div></div>`
}

// ── Web Component (browser only) ──────────────────────────────────────────────

/**
 * @class
 * @augments TiBaseComponent
 * @description Interactive JSON viewer web component. Renders JSON/JS data as a
 * collapsible, searchable, syntax-highlighted tree using the light DOM.
 *
 * @element json-viewer
 * @memberOf Live
 *
 * METHODS FROM BASE: (see TiBaseComponent)
 * STANDARD METHODS:
 * @function attributeChangedCallback Called when a watched attribute changes
 * @function connectedCallback        Called when the element is added to the document
 * @function constructor              Construct the component
 * @function disconnectedCallback     Called when the element is removed from the document
 *
 * PUBLIC API METHODS:
 * @function collapseAll  Collapse all expandable nodes
 * @function expandAll    Expand all expandable nodes
 * @function search       Apply a search query programmatically
 * @function renderToHTML Static re-export of the pure renderer (convenience)
 *
 * CUSTOM EVENTS:
 * @fires json-viewer:connected     - Instance added to DOM
 * @fires json-viewer:disconnected  - Instance removed from DOM
 * @fires json-viewer:ready         - Instance ready for interaction
 * @fires json-viewer:attribChanged - Watched attribute changed. evt.detail.data = { attribute, newVal, oldVal }
 * @fires json-viewer:toggle        - Node expanded or collapsed. evt.detail.data = { path, expanded }
 * @fires json-viewer:copy          - Path or value copied to clipboard. evt.detail.data = { path, text, kind }
 * @fires json-viewer:search        - Search query changed. evt.detail.data = { query, matches }
 * @fires json-viewer:change        - Data changed. evt.detail.data = { path, oldValue, newValue, changeType: 'valueEdited'|'addedProperty'|'removedProperty' }
 * @fires json-viewer:rename        - Object key renamed. evt.detail.data = { parentPath, oldKey, newKey }
 * @fires json-viewer:add           - Add entry to object/array requested. evt.detail.data = { path, type }
 * @fires json-viewer:delete        - Delete entry requested. evt.detail.data = { path, type, oldValue }
 *
 * WATCHED ATTRIBUTES:
 * @attr {string}  data        - JSON string or serialisable value to display
 * @attr {number}  max-depth   - Maximum auto-expand depth on first render (default: 2)
 * @attr {boolean} collapsed   - Presence collapses all nodes on first render
 * @attr {string}  filter-type - Restrict visible nodes to this data type (e.g. "string", "number")
 * @attr {boolean} editable    - Presence enables inline editing of scalar leaf values
 * @attr {string}  name        - Optional name (inherited from base component)
 *
 * PROPS FROM BASE: (see TiBaseComponent)
 * OTHER PROPS:
 * @property {string} componentVersion - Static. Date-based version string.
 * @property {*}      data             - Get/set the rendered data (JS value or JSON string)
 * @property {number} maxDepth         - Get/set the maximum auto-expand depth
 * @property {boolean} collapsed       - Get/set collapsed state
 * @property {string|null} filterType  - Get/set the data-type filter (null = all)
 * @property {boolean} editable        - Get/set editable mode
 *
 * @example
 * <json-viewer data='{"hello":"world"}' max-depth="3"></json-viewer>
 *
 * @example
 * const el = document.querySelector('json-viewer')
 * el.data = { nested: { values: [1, 2, 3] } }
 *
 * @example
 * // Listen for a node being toggled
 * el.addEventListener('json-viewer:toggle', evt => console.log(evt.detail.data))
 *
 * See https://github.com/runem/web-component-analyzer?tab=readme-ov-file#-how-to-document-your-components-using-jsdoc
 */
class JsonViewer extends TiBaseComponent {
    /** Component version */
    static componentVersion = COMPONENT_VERSION

    /** Static re-export of the pure renderer, accessible as JsonViewer.renderToHTML
     * @type {typeof renderToHTML}
     */
    static renderToHTML = renderToHTML

    /** Watched HTML attributes
     * @returns {string[]} Attribute names that trigger attributeChangedCallback
     */
    static get observedAttributes() {
        return ['data', 'max-depth', 'max-children', 'collapsed', 'filter-type', 'editable', 'name']
    }

    // #region ── Private fields ────────────────────────────────────────────

    /** Current parsed data value @type {*} */
    #data = undefined

    /** Maximum auto-expand depth @type {number} */
    #maxDepth = 2

    /** Whether all expandable nodes are initially collapsed @type {boolean} */
    #collapsed = false

    /** Active data-type filter (null = show all) @type {string|null} */
    #filterType = null

    /** Whether scalar leaf values are editable @type {boolean} */
    #editable = false

    /** Maximum number of children to render per expandable node (0 = unlimited) @type {number} */
    #maxChildren = CONFIGMAXCHILDREN

    /** Current search query @type {string} */
    #searchQuery = ''

    /** AbortController used to clean up event listeners on disconnect @type {AbortController|null} */
    #abortController = null

    // #endregion

    // #region ── Constructor ───────────────────────────────────────────────

    constructor() {
        super()
        // Light DOM — no shadow root; all content rendered directly into this element
    }

    // #endregion

    // #region ── Getters / Setters ─────────────────────────────────────────

    /** Get the current rendered data
     * @returns {*} Current data value
     */
    get data() { return this.#data }

    /** Set new data and re-render the tree
     * @param {*} val - New data value (JS object, array, primitive, or JSON string)
     */
    set data(val) {
        this.#data = parseInput(val)
        this.#searchQuery = ''
        if (this.connected) this._render()
    }

    /** Get the current max-depth setting @returns {number} */
    get maxDepth() { return this.#maxDepth }

    /** Set max-depth and re-render
     * @param {number|string} val - New depth value
     */
    set maxDepth(val) {
        const n = parseInt(val, 10)
        this.#maxDepth = isNaN(n) ? 2 : Math.max(0, n)
        if (this.connected) this._render()
    }

    /** Get collapsed state @returns {boolean} */
    get collapsed() { return this.#collapsed }

    /** Set collapsed state and re-render @param {boolean|string} val */
    set collapsed(val) {
        this.#collapsed = val === true || val === '' || val === 'true' || val === 'collapsed'
        if (this.connected) this._render()
    }

    /** Get the active type filter @returns {string|null} */
    get filterType() { return this.#filterType }

    /** Set the type filter and apply it @param {string|null} val */
    set filterType(val) {
        this.#filterType = (val && val !== 'all') ? val : null
        if (this.connected) this._applyTypeFilter()
    }

    /** Get editable state @returns {boolean} */
    get editable() { return this.#editable }

    /** Set editable state and re-render @param {boolean|string} val */
    set editable(val) {
        this.#editable = val === true || val === '' || val === 'true' || val === 'editable'
        if (this.connected) this._render()
    }

    /** Get max-children setting @returns {number} */
    get maxChildren() { return this.#maxChildren }

    /** Set max-children and re-render
     * @param {number|string} val - Max children per container (0 = unlimited)
     */
    set maxChildren(val) {
        const n = parseInt(val, 10)
        this.#maxChildren = isNaN(n) ? CONFIGMAXCHILDREN : Math.max(0, n)
        if (this.connected) this._render()
    }

    // #endregion

    // #region ── Lifecycle callbacks ───────────────────────────────────────

    /** Called when the element is added to the document */
    connectedCallback() {
        this._connect() // base class — keep at start

        // Inject component styles into the document head (idempotent)
        this.prependStylesheet(STYLES)

        // Read initial attribute values
        if (this.hasAttribute('data')) this.#data = parseInput(this.getAttribute('data'))
        if (this.hasAttribute('max-depth')) this.maxDepth = this.getAttribute('max-depth')
        if (this.hasAttribute('collapsed')) this.#collapsed = true
        if (this.hasAttribute('filter-type')) this.#filterType = this.getAttribute('filter-type') || null
        if (this.hasAttribute('editable')) this.#editable = true
        if (this.hasAttribute('max-children')) this.maxChildren = this.getAttribute('max-children')

        // Initial render
        this._render()

        // Attach delegated event listeners; AbortController removes them on disconnect
        this.#abortController = new AbortController()
        const { signal, } = this.#abortController

        // Capture-phase: intercepts clicks on jv-add/jv-delete inside <summary> before
        // the browser's native <details> toggle fires during bubble phase.
        this.addEventListener('click', this._onClickCapture.bind(this), { signal, capture: true, })
        this.addEventListener('click', this._onClick.bind(this), { signal, })
        this.addEventListener('keydown', this._onKeydown.bind(this), { signal, })
        this.addEventListener('input', this._onSearchInput.bind(this), { signal, })
        this.addEventListener('focusout', this._onValueCommit.bind(this), { signal, })
        // <details> toggle events do not bubble; capture phase is required
        this.addEventListener('toggle', this._onToggle.bind(this), { signal, capture: true, })

        this._ready() // base class — keep at end
    }

    /** Called when the element is removed from the document */
    disconnectedCallback() {
        this.#abortController?.abort()
        this.#abortController = null
        this._disconnect() // base class — keep at end
    }

    /** Called whenever a watched attribute changes
     * @param {string}      attrib - Attribute name
     * @param {string|null} oldVal - Previous attribute value
     * @param {string|null} newVal - New attribute value
     */
    attributeChangedCallback(attrib, oldVal, newVal) {
        if (oldVal === newVal) return

        switch (attrib) {
            case 'data':
                this.#data = parseInput(newVal)
                this.#searchQuery = ''
                if (this.connected) this._render()
                break
            case 'max-depth':
                this.maxDepth = newVal
                break
            case 'collapsed':
                this.#collapsed = newVal !== null
                if (this.connected) this._render()
                break
            case 'filter-type':
                this.#filterType = (newVal && newVal !== 'all') ? newVal : null
                if (this.connected) this._applyTypeFilter()
                break
            case 'editable':
                this.#editable = newVal !== null
                if (this.connected) this._render()
                break
            case 'max-children':
                this.maxChildren = newVal
                break
            default:
                break
        }

        this._event('attribChanged', { attribute: attrib, newVal, oldVal, })
    }

    // #endregion

    // #region ── Public API ────────────────────────────────────────────────

    /** Collapse all expandable nodes in the tree */
    collapseAll() {
        this.querySelectorAll('details.jv-node').forEach(node => node.removeAttribute('open'))
        this._event('toggle', { path: '*', expanded: false, })
    }

    /** Expand all expandable nodes in the tree */
    expandAll() {
        this.querySelectorAll('details.jv-node').forEach(node => node.setAttribute('open', ''))
        this._event('toggle', { path: '*', expanded: true, })
    }

    /** Apply a search query programmatically (mirrors typing in the search box).
     * Opens the search row when a non-empty query is supplied; closes it when cleared.
     * @param {string} query - Search string (empty string clears the filter and closes the row)
     */
    search(query) {
        const trimmed = query.trim()
        this.#searchQuery = trimmed
        const row = /** @type {HTMLElement|null} */ (this.querySelector('.jv-search-row'))
        const btn = /** @type {HTMLElement|null} */ (this.querySelector('.jv-search-toggle'))
        const input = /** @type {HTMLInputElement|null} */ (this.querySelector('.jv-search'))
        if (input) input.value = trimmed
        if (trimmed) {
            if (row) row.classList.remove('jv-hidden')
            if (btn) btn.setAttribute('aria-expanded', 'true')
        } else {
            if (row) row.classList.add('jv-hidden')
            if (btn) btn.setAttribute('aria-expanded', 'false')
        }
        this._applySearch(trimmed)
    }

    // #endregion

    // #region ── Private render / filter methods ───────────────────────────

    /** Re-render the entire component content from scratch */
    _render() {
        this.innerHTML = renderToHTML(this.#data, {
            maxDepth: this.#maxDepth,
            collapsed: this.#collapsed,
            editable: this.#editable,
            interactive: true,
            maxChildren: this.#maxChildren,
        })
        // If a search was active when re-rendering (e.g. maxDepth change), restore it
        if (this.#searchQuery) {
            const row = /** @type {HTMLElement|null} */ (this.querySelector('.jv-search-row'))
            const btn = /** @type {HTMLElement|null} */ (this.querySelector('.jv-search-toggle'))
            const input = /** @type {HTMLInputElement|null} */ (this.querySelector('.jv-search'))
            if (row) row.classList.remove('jv-hidden')
            if (btn) btn.setAttribute('aria-expanded', 'true')
            if (input) input.value = this.#searchQuery
            this._applySearch(this.#searchQuery)
        }
        if (this.#filterType) this._applyTypeFilter()
    }

    /**
     * Show only nodes whose key or value text matches the query.
     * Ancestor nodes of matching leaves are also revealed so the tree context is clear.
     * Passing an empty string resets all visibility.
     * @param {string} query - Search string
     */
    _applySearch(query) {
        const tree = this.querySelector('.jv-tree')
        if (!tree) return

        const all = /** @type {NodeListOf<HTMLElement>} */ (tree.querySelectorAll('.jv-node'))

        if (!query) {
            all.forEach(n => n.classList.remove('jv-hidden'))
            return
        }

        const lq = query.toLowerCase()

        // First pass: hide everything
        all.forEach(n => n.classList.add('jv-hidden'))

        // Second pass: show matching nodes and all their ancestors
        all.forEach((node) => {
            // Key/val may be direct children (leaf) or inside <summary> (expandable)
            const keyEl = node.querySelector(':scope > .jv-key')
                ?? node.querySelector(':scope > summary > .jv-key')
            const valEl = node.querySelector(':scope > .jv-val')
                ?? node.querySelector(':scope > summary > .jv-val')
            const keyText = (keyEl?.textContent ?? '').toLowerCase()
            const valText = (valEl?.textContent ?? '').toLowerCase()

            if (keyText.includes(lq) || valText.includes(lq)) {
                node.classList.remove('jv-hidden')
                // Reveal all ancestors and open any closed <details>
                let parent = node.parentElement?.closest('.jv-node')
                while (parent) {
                    parent.classList.remove('jv-hidden')
                    if (parent.tagName?.toLowerCase() === 'details') parent.setAttribute('open', '')
                    parent = parent.parentElement?.closest('.jv-node')
                }
            }
        })

        const matches = this.querySelectorAll('.jv-node.jv-leaf:not(.jv-hidden)').length
        this._event('search', { query, matches, })
    }

    /**
     * Show only nodes whose `data-jv-type` matches `this.#filterType`.
     * Ancestor nodes of matching leaves are also revealed.
     * Clears filter if `this.#filterType` is null.
     */
    _applyTypeFilter() {
        const tree = this.querySelector('.jv-tree')
        if (!tree) return

        const all = /** @type {NodeListOf<HTMLElement>} */ (tree.querySelectorAll('.jv-node'))

        if (!this.#filterType) {
            all.forEach(n => n.classList.remove('jv-hidden'))
            return
        }

        const ft = this.#filterType
        all.forEach(n => n.classList.add('jv-hidden'))

        all.forEach((node) => {
            if (node.dataset.jvType === ft) {
                node.classList.remove('jv-hidden')
                let parent = node.parentElement?.closest('.jv-node')
                while (parent) {
                    parent.classList.remove('jv-hidden')
                    if (parent.tagName?.toLowerCase() === 'details') parent.setAttribute('open', '')
                    parent = parent.parentElement?.closest('.jv-node')
                }
            }
        })
    }

    // #endregion

    // #region ── Private event handlers ────────────────────────────────────

    /** Capture-phase click handler: intercepts jv-add and jv-delete button clicks before
     * the event reaches a parent `<summary>`, which would otherwise toggle the `<details>`.
     * Using capture ensures we fire before the browser's native activation behaviour.
     * @param {MouseEvent} evt Mouse click event (capture phase)
     */
    _onClickCapture(evt) {
        const target = /** @type {HTMLElement} */ (evt.target)
        if (!target.classList.contains('jv-add') && !target.classList.contains('jv-delete')) return
        // Stop propagation so the parent <summary> never receives this event
        evt.stopPropagation()
        evt.preventDefault()
        const node = /** @type {HTMLElement|null} */ (target.closest('.jv-node'))
        if (!node) return
        if (target.classList.contains('jv-add')) this._handleAdd(node)
        else this._handleDelete(node)
    }

    /** Delegated click handler
     * @param {MouseEvent} evt Mouse click event
     */
    _onClick(evt) {
        const target = /** @type {HTMLElement} */ (evt.target)

        // Copy button (⎘) — stopPropagation prevents <summary> from also toggling
        if (target.classList.contains('jv-copy')) {
            evt.preventDefault()
            evt.stopPropagation()
            this._handleCopy(target)
            return
        }

        // Key label click (leaf nodes only) → copy the dot-notation path.
        // Expandable node keys live inside <summary> and carry no data-jv-copy attribute;
        // clicking them is handled natively by the browser to toggle the <details>.
        if (target.classList.contains('jv-key') && target.dataset.jvCopy === 'path') {
            evt.preventDefault()
            const node = target.closest('.jv-node')
            if (node) this._copyPath(node)
            return
        }

        // Toolbar buttons
        if (target.classList.contains('jv-collapse-all')) { this.collapseAll(); return }
        if (target.classList.contains('jv-expand-all')) { this.expandAll(); return }

        // Search toggle button
        if (target.classList.contains('jv-search-toggle')) {
            const row = /** @type {HTMLElement|null} */ (this.querySelector('.jv-search-row'))
            const isOpen = row && !row.classList.contains('jv-hidden')
            if (isOpen) {
                // Close: clear search and hide row
                const input = /** @type {HTMLInputElement|null} */ (this.querySelector('.jv-search'))
                if (input) input.value = ''
                this.#searchQuery = ''
                this._applySearch('')
                if (row) row.classList.add('jv-hidden')
                target.setAttribute('aria-expanded', 'false')
            } else {
                // Open: show row and focus input
                if (row) row.classList.remove('jv-hidden')
                target.setAttribute('aria-expanded', 'true')
                const input = /** @type {HTMLInputElement|null} */ (this.querySelector('.jv-search'))
                if (input) { input.focus(); input.select() }
            }
            return
        }
    }

    /** Delegated keyboard handler implementing the ARIA tree keyboard pattern.
     * Acts when focus is on a `.jv-node` leaf or a `<summary>` inside a `<details.jv-node>`.
     * Enter/Space on expandable nodes are handled natively by `<details>/<summary>`.
     * @param {KeyboardEvent} evt Keyboard event
     */
    _onKeydown(evt) {
        const target = /** @type {HTMLElement} */ (evt.target)

        // If focus is inside a contenteditable key or value, handle Enter (commit) and Tab (move to value)
        if (target.dataset?.jvKeyEditable || target.dataset?.jvEditable || target.closest('[contenteditable]')) {
            if (evt.key === 'Enter') {
                evt.preventDefault()
                const editable = /** @type {HTMLElement} */ (target)
                editable.blur() // triggers focusout → commit
            } else if (evt.key === 'Tab' && target.dataset?.jvKeyEditable) {
                // Commit the key rename, then move focus to the value field of the same node
                evt.preventDefault()
                const keyEl = /** @type {HTMLElement} */ (target)
                this._onKeyCommit(keyEl)
                // After re-render (or no-op if unchanged), find and focus the value span
                const path = keyEl.dataset.jvPath ?? ''
                const split = this._splitLastSegment(path)
                const newKey = keyEl.textContent?.trim() ?? (split ? String(split.key) : '')
                const parentPath = split?.parentPath ?? ''
                const newPath = parentPath ? `${parentPath}.${newKey}` : newKey
                const valEl = /** @type {HTMLElement|null} */ (
                    this.querySelector(`[data-jv-path="${newPath}"] > .jv-val[contenteditable]`)
                    ?? this.querySelector(`[data-jv-path="${newPath}"] > .jv-val`)
                )
                if (valEl) valEl.focus()
            }
            return
        }

        // Resolve the nearest .jv-node from the focused element.
        // Focus lands on <summary> (expandable) or <div tabindex="0"> (leaf).
        const nodeEl = target.classList.contains('jv-node')
            ? target
            : /** @type {HTMLElement|null} */ (target.closest('.jv-node'))
        if (!nodeEl) return

        const tree = this.querySelector('.jv-tree')
        if (!tree) return

        // Collect all visible nodes not hidden inside a closed <details>
        const allNodes = Array.from(/** @type {NodeListOf<HTMLElement>} */ (
            tree.querySelectorAll('.jv-node:not(.jv-hidden)')
        ))
        const reachable = allNodes.filter((n) => {
            let el = n.parentElement
            while (el && el !== tree) {
                if (el.tagName?.toLowerCase() === 'details' && !el.hasAttribute('open') && el.classList.contains('jv-node')) return false
                el = el.parentElement
            }
            return true
        })
        const idx = reachable.indexOf(nodeEl)

        /** Focus a .jv-node: <summary> for details, direct focus for leaves
         * @param {HTMLElement|null} n Node to focus
         */
        const focusNode = (n) => {
            if (!n) return
            if (n.tagName?.toLowerCase() === 'details') n.querySelector(':scope > summary')?.focus()
            else n.focus()
        }

        const isExpandable = nodeEl.tagName?.toLowerCase() === 'details'
        const isOpen = isExpandable && nodeEl.hasAttribute('open')

        switch (evt.key) {
            case 'ArrowDown': {
                evt.preventDefault()
                if (idx < reachable.length - 1) focusNode(reachable[idx + 1])
                break
            }
            case 'ArrowUp': {
                evt.preventDefault()
                if (idx > 0) focusNode(reachable[idx - 1])
                break
            }
            case 'ArrowRight': {
                evt.preventDefault()
                if (isExpandable && !isOpen) {
                    nodeEl.setAttribute('open', '')
                } else if (isExpandable && isOpen) {
                    const firstChild = /** @type {HTMLElement|null} */ (nodeEl.querySelector('.jv-children > .jv-node'))
                    focusNode(firstChild)
                }
                break
            }
            case 'ArrowLeft': {
                evt.preventDefault()
                if (isExpandable && isOpen) {
                    nodeEl.removeAttribute('open')
                } else {
                    const parent = /** @type {HTMLElement|null} */ (nodeEl.parentElement?.closest('.jv-node'))
                    focusNode(parent)
                }
                break
            }
            case 'Home': {
                evt.preventDefault()
                if (reachable.length > 0) focusNode(reachable[0])
                break
            }
            case 'End': {
                evt.preventDefault()
                if (reachable.length > 0) focusNode(reachable[reachable.length - 1])
                break
            }
            case 'c': {
                // Ctrl+C → copy path; Ctrl+Shift+C → copy value
                if (evt.ctrlKey || evt.metaKey) {
                    evt.preventDefault()
                    if (evt.shiftKey) this._copyValue(nodeEl)
                    else this._copyPath(nodeEl)
                }
                break
            }
            default:
                break
        }
    }

    /** Handle native toggle events fired by <details> expandable nodes.
     * Fires whenever a node is expanded or collapsed (by user or programmatic change).
     * @param {Event} evt Toggle event
     */
    _onToggle(evt) {
        const target = /** @type {HTMLElement} */ (evt.target)
        if (!target?.classList?.contains('jv-node')) return
        const expanded = target.hasAttribute('open')
        const path = target.dataset?.jvPath ?? ''
        this._event('toggle', { path, expanded, })
    }

    /** Handle input events from the search box
     * @param {Event} evt Input event
     */
    _onSearchInput(evt) {
        const target = /** @type {HTMLInputElement} */ (evt.target)
        if (!target.classList.contains('jv-search')) return
        this.#searchQuery = target.value.trim()
        this._applySearch(this.#searchQuery)
    }

    /** Commit an edit when a contenteditable value loses focus
     * @param {FocusEvent} evt Focus event
     */
    _onValueCommit(evt) {
        const target = /** @type {HTMLElement} */ (evt.target)

        // Key rename takes priority
        if (target.dataset?.jvKeyEditable) {
            this._onKeyCommit(target)
            return
        }

        if (!target.dataset?.jvEditable) return

        const node = target.closest('.jv-node')
        if (!node) return

        const path = /** @type {HTMLElement} */ (node).dataset.jvPath ?? ''
        const type = target.dataset.jvType ?? 'string'
        const newText = target.textContent?.trim() ?? ''
        const oldValue = this._getValueAtPath(path)

        let newValue
        // Early upgrade: if the input looks like a JSON object or array, parse it regardless of the original type
        {
            const t = newText.trim()
            if (t.length > 1 && ((t[0] === '{' && t[t.length - 1] === '}') || (t[0] === '[' && t[t.length - 1] === ']'))) {
                try {
                    const parsed = JSON.parse(t)
                    if (typeof parsed === 'object' && parsed !== null) newValue = parsed
                } catch (_) { /* not valid JSON — fall through to scalar parse */ }
            }
        }
        if (newValue === undefined) {
            // Universal smart-parse: infer type from text content, not from the original type.
            // This enables cross-type conversion in all directions (e.g. string ↔ number ↔ boolean ↔ null).
            if (newText === 'null') newValue = null
            else if (newText === 'undefined') newValue = undefined
            else if (newText === 'true') newValue = true
            else if (newText === 'false') newValue = false
            else if (newText === 'NaN') newValue = NaN
            else if (newText.length >= 2 && newText[0] === '"' && newText[newText.length - 1] === '"') {
                // Explicit string literal: wrap in quotes to force string type ("42" → '42', "true" → 'true')
                newValue = newText.slice(1, -1)
            } else if (/^-?\d+n$/.test(newText)) {
                // BigInt literal: digits followed by 'n' suffix (e.g. "42n", "-7n")
                try { newValue = BigInt(newText.slice(0, -1)) } catch (_) { newValue = newText }
            } else if (newText !== '' && !isNaN(Number(newText))) {
                newValue = Number(newText)
            } else {
                newValue = newText
            }
        }

        // Skip if the value has not actually changed
        if (Object.is(newValue, oldValue)) return

        this._event('change', { path, oldValue, newValue, changeType: 'valueEdited', })
        if (this.uib) {
            // BigInt cannot be JSON-serialised; send as a string with 'n' suffix
            const sendValue = typeof newValue === 'bigint' ? `${String(newValue)}n` : newValue
            const sendOldValue = typeof oldValue === 'bigint' ? `${String(oldValue)}n` : oldValue
            this.uibSend('change', { path, oldValue: sendOldValue, newValue: sendValue, changeType: 'valueEdited', })
        }
        // Persist the new value and re-render so the type colour updates immediately
        this._setValueAtPath(path, newValue)
        this._render()
    }

    // #endregion

    // #region ── Private DOM helpers ───────────────────────────────────────

    /** Toggle the expanded/collapsed state of an expandable <details> node.
     * Called programmatically (e.g. from keyboard handler).
     * The native <details> 'toggle' event fires automatically and calls _onToggle.
     * @param {Element|null} node - The `<details.jv-node>` element to toggle
     */
    _toggleNode(node) {
        if (node?.tagName?.toLowerCase() !== 'details') return
        if (/** @type {HTMLElement} */ (node).hasAttribute('open')) {
            /** @type {HTMLElement} */ (node).removeAttribute('open')
        } else {
            /** @type {HTMLElement} */ (node).setAttribute('open', '')
        }
    }

    /** Copy the dot-notation path of a node to the clipboard
     * @param {Element} node - The `.jv-node` element
     */
    _copyPath(node) {
        const path = /** @type {HTMLElement} */ (node).dataset.jvPath ?? ''
        this._writeClipboard(path, 'path', path)
    }

    /** Traverse this.#data using a dot/bracket-notation path string to retrieve a sub-value.
     * @param {string} path - Path as produced by buildPath (e.g. "a.b[2].c" or "(root)")
     * @returns {*} The value at that path, or undefined if the path cannot be resolved
     */
    _getValueAtPath(path) {
        if (!path || path === '(root)') return this.#data
        // Normalise bracket notation: [0] → .0, ["key"] / ['key'] → .key
        const normalised = path
            .replace(/\[(\d+)\]/g, '.$1')
            .replace(/\[["'](.+?)["']\]/g, '.$1')
        const parts = normalised.split('.').filter(Boolean)
        let current = this.#data
        for (const part of parts) {
            if (current == null || typeof current !== 'object') return undefined
            if (current instanceof Map) {
                current = Array.from(current.values())[parseInt(part, 10)]
            } else if (current instanceof Set) {
                current = Array.from(current)[parseInt(part, 10)]
            } else {
                current = current[part]
            }
        }
        return current
    }

    /** Write a value into this.#data at the given dot/bracket-notation path.
     * Handles plain objects, arrays, Maps, and Sets.
     * @param {string} path     - Path as produced by buildPath (e.g. "a.b[2].c" or "(root)")
     * @param {*}      newValue - Value to store at the path
     */
    _setValueAtPath(path, newValue) {
        if (!path || path === '(root)') { this.#data = newValue; return }
        const split = this._splitLastSegment(path)
        if (!split) { this.#data = newValue; return }
        const parent = this._getValueAtPath(split.parentPath || '')
        if (parent == null || typeof parent !== 'object') return
        if (parent instanceof Map) {
            const mapKey = Array.from(parent.keys())[parseInt(String(split.key), 10)]
            if (mapKey !== undefined) parent.set(mapKey, newValue)
        } else if (parent instanceof Set) {
            const arr = Array.from(parent)
            arr[parseInt(String(split.key), 10)] = newValue
            parent.clear()
            arr.forEach(v => parent.add(v))
        } else {
            parent[split.key] = newValue
        }
    }

    /** Commit a key rename when a contenteditable key span loses focus.
     * Restores the original key text if the new name is empty or unchanged.
     * @param {HTMLElement} target - The `.jv-key[data-jv-key-editable]` span
     */
    _onKeyCommit(target) {
        const path = target.dataset.jvPath ?? ''
        const newKey = target.textContent?.trim() ?? ''
        const split = this._splitLastSegment(path)
        const oldKey = split ? String(split.key) : ''
        if (!newKey || newKey === oldKey) {
            // Restore original text (empty input or no change)
            target.textContent = oldKey
            return
        }
        if (split) this._renameKey(split.parentPath, oldKey, newKey)
    }

    /** Rename an object property key, preserving insertion order.
     * Mutates the parent object in place, re-renders, and fires `json-viewer:rename`.
     * Silently ignores the rename if `newKey` already exists in the parent.
     * @param {string} parentPath - Path to the parent object (empty string = root)
     * @param {string} oldKey     - Current property key
     * @param {string} newKey     - Desired new property key
     */
    _renameKey(parentPath, oldKey, newKey) {
        const parent = this._getValueAtPath(parentPath)
        if (parent === null || parent === undefined || typeof parent !== 'object' || Array.isArray(parent)) return
        if (Object.prototype.hasOwnProperty.call(parent, newKey)) return
        // Rebuild properties in-place to preserve insertion order
        const entries = Object.entries(parent)
        for (const k of Object.keys(parent)) delete parent[k]
        for (const [k, v] of entries) parent[k === oldKey ? newKey : k] = v
        this._render()
        this._event('rename', { parentPath, oldKey, newKey, })
        if (this.uib) this.uibSend('rename', { parentPath, oldKey, newKey, })
    }

    /** Handle add-entry button click for an expandable node.
     * Appends `null` to arrays; adds a unique `"new_key"` property to objects.
     * Mutates `this.#data` directly, re-renders, then fires `json-viewer:add`.
     * @param {HTMLElement} node - The expandable `.jv-node` element
     */
    _handleAdd(node) {
        const pathAttr = node.dataset.jvPath ?? ''
        const type = node.dataset.jvType ?? 'object'
        const container = this._getValueAtPath(pathAttr)

        if (type === 'array' && Array.isArray(container)) {
            container.push(null)
            const newPath = (pathAttr === '(root)' || pathAttr === '')
                ? String(container.length - 1)
                : `${pathAttr}[${container.length - 1}]`
            const containerOldValue = container.slice(0, -1)
            this._render()
            this._event('add', { path: pathAttr, type, newValue: null, newPath, })
            this._event('change', { path: pathAttr, oldValue: containerOldValue, newValue: [...container], changeType: 'addedProperty', })
            if (this.uib) this.uibSend('add', { path: pathAttr, type, newValue: null, newPath, changeType: 'addedProperty', })
        } else if (type === 'object' && container !== null && typeof container === 'object' && !Array.isArray(container)) {
            let key = 'new_key'
            let i = 1
            while (Object.prototype.hasOwnProperty.call(container, key)) key = `new_key_${i++}`
            container[key] = null
            const containerSnapshot = { ...container, }
            delete containerSnapshot[key]
            this._render()
            this._event('add', { path: pathAttr, type, newKey: key, newValue: null, })
            this._event('change', { path: pathAttr, oldValue: containerSnapshot, newValue: { ...container, }, changeType: 'addedProperty', })
            if (this.uib) this.uibSend('add', { path: pathAttr, type, newKey: key, newValue: null, changeType: 'addedProperty', })
            // Focus the new key span for immediate renaming
            const containerPath = pathAttr === '(root)' ? '' : pathAttr
            const childPath = buildPath(containerPath, key, 'object')
            const newKeyEl = /** @type {HTMLElement|null} */ (this.querySelector(`[data-jv-key-editable][data-jv-path="${childPath}"]`))
            if (newKeyEl) {
                newKeyEl.focus()
                const range = document.createRange()
                range.selectNodeContents(newKeyEl)
                const sel = window.getSelection()
                if (sel) { sel.removeAllRanges(); sel.addRange(range) }
            }
        }
    }

    /** Handle delete button click for any node.
     * Mutates `this.#data` directly, re-renders, then fires `json-viewer:delete` and
     * a `json-viewer:change` event on the parent container reflecting the updated value.
     * @param {HTMLElement} node - The `.jv-node` element to delete
     */
    _handleDelete(node) {
        const pathAttr = node.dataset.jvPath ?? ''
        const type = node.dataset.jvType ?? 'string'
        const oldValue = this._getValueAtPath(pathAttr)
        const split = this._splitLastSegment(pathAttr)
        if (!split) return
        const parent = this._getValueAtPath(split.parentPath)
        if (parent === null || parent === undefined || typeof parent !== 'object') return
        // Snapshot parent before mutation for the change event
        let parentOldValue
        if (Array.isArray(parent)) parentOldValue = [...parent]
        else if (parent instanceof Map) parentOldValue = new Map(parent)
        else if (parent instanceof Set) parentOldValue = new Set(parent)
        else parentOldValue = { ...parent, }
        if (Array.isArray(parent)) {
            parent.splice(Number(split.key), 1)
        } else if (parent instanceof Map) {
            const mapKey = Array.from(parent.keys())[Number(split.key)]
            if (mapKey !== undefined) parent.delete(mapKey)
        } else if (parent instanceof Set) {
            const setVal = Array.from(parent)[Number(split.key)]
            parent.delete(setVal)
        } else {
            delete parent[/** @type {string} */ (split.key)]
        }
        let parentNewValue
        if (Array.isArray(parent)) parentNewValue = [...parent]
        else if (parent instanceof Map) parentNewValue = new Map(parent)
        else if (parent instanceof Set) parentNewValue = new Set(parent)
        else parentNewValue = { ...parent, }
        this._render()
        this._event('delete', { path: pathAttr, type, oldValue, })
        const parentPath = split.parentPath || '(root)'
        this._event('change', { path: parentPath, oldValue: parentOldValue, newValue: parentNewValue, changeType: 'removedProperty', })
        if (this.uib) this.uibSend('delete', { path: pathAttr, type, parentPath, newValue: parentNewValue, changeType: 'removedProperty', })
    }

    /** Split a `data-jv-path` attribute value into its parent path and final key segment.
     * Handles dot notation (`a.b`), array-index notation (`a[0]`), and bracket-string
     * notation (`a["key with spaces"]`) as produced by {@link buildPath}.
     * @param {string} pathAttr - Raw data-jv-path value (e.g. `"a.b[2]"` or `"(root)"`)
     * @returns {{ parentPath: string, key: string|number }|null} Split result, or null for root
     */
    _splitLastSegment(pathAttr) {
        if (!pathAttr || pathAttr === '(root)') return null
        // Array index at end: ...something[N]
        const arrMatch = /^(.*?)\[(\d+)\]$/.exec(pathAttr)
        if (arrMatch) return { parentPath: arrMatch[1], key: parseInt(arrMatch[2], 10), }
        // Bracket string notation at end: ...something["key"]
        const bracketMatch = /^(.*?)\[["'](.+?)["']\]$/.exec(pathAttr)
        if (bracketMatch) return { parentPath: bracketMatch[1], key: bracketMatch[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\'), }
        // Dot notation: last segment after final dot
        const dotIdx = pathAttr.lastIndexOf('.')
        if (dotIdx !== -1) return { parentPath: pathAttr.slice(0, dotIdx), key: pathAttr.slice(dotIdx + 1), }
        // Root-level simple key
        return { parentPath: '', key: pathAttr, }
    }

    /** Copy the value of a node to the clipboard.
     * For leaf nodes reads the rendered text; for expandable nodes serialises to JSON.
     * @param {Element} node - The `.jv-node` element
     */
    _copyValue(node) {
        const path = /** @type {HTMLElement} */ (node).dataset.jvPath ?? ''
        const isExpandable = node.classList.contains('jv-object') || node.classList.contains('jv-array')
        let text
        if (isExpandable) {
            const val = this._getValueAtPath(path)
            try { text = JSON.stringify(val, null, 2) } catch (_) { text = String(val) }
        } else {
            const valEl = node.querySelector(':scope > .jv-val')
            const rawText = valEl?.textContent ?? ''
            // Add surrounding quotes for string values to match the visual display
            text = /** @type {HTMLElement} */ (node).dataset.jvType === 'string' ? `"${rawText}"` : rawText
        }
        this._writeClipboard(text ?? '', 'value', path)
    }

    /** Dispatch the correct copy operation from a copy button click
     * @param {HTMLElement} btn - The `.jv-copy` button element
     */
    _handleCopy(btn) {
        const node = btn.closest('.jv-node')
        if (!node) return
        const kind = btn.dataset.jvCopy ?? 'path'
        if (kind === 'value') this._copyValue(node)
        else this._copyPath(node)
    }

    /** Write text to the clipboard and dispatch a `json-viewer:copy` event.
     * Falls back to `document.execCommand('copy')` when the Clipboard API is unavailable.
     * @param {string}          text - Text to copy
     * @param {'path'|'value'} kind - What kind of thing was copied
     * @param {string}          path - Dot-notation path of the source node
     */
    async _writeClipboard(text, kind, path) {
        try {
            await navigator.clipboard.writeText(text)
        } catch (_) {
            // Fallback for older browsers or non-secure contexts
            const ta = document.createElement('textarea')
            ta.value = text
            ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
            document.body.appendChild(ta)
            ta.select()
            document.execCommand('copy')
            document.body.removeChild(ta)
        }
        this._event('copy', { path, text, kind, })
    }

    // #endregion
} // ── end of class JsonViewer ──────────────────────────────────────────────────

// Register the custom element (guard allows the module to be imported in Node.js
// for access to the exported renderToHTML function without DOM side-effects)
if (typeof customElements !== 'undefined') {
    // Self-register the HTML tag
    customElements.define('json-viewer', JsonViewer)
    /** Self register the class to global
     * Enables new data lists to be dynamically added via JS
     * and lets the static methods be called
     */
    window['JsonViewer'] = JsonViewer
}

export default JsonViewer
