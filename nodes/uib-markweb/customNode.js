// @ts-nocheck
/* eslint-disable jsdoc/no-undefined-types, jsdoc/valid-types */
/** Send a dynamic UI config to the uibuilder front-end library.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2025-2025 Julian Knight (Totally Information)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

// Save indexes for convenient debugging - not needed for production
if (!globalThis._uibuilder_) globalThis._uibuilder_ = {}
if (!globalThis._uibuilder_.markweb) globalThis._uibuilder_.markweb = {}
if (!globalThis._uibuilder_.markweb.indexes) globalThis._uibuilder_.markweb.indexes = {}

/** --- Type Defs - should help with coding ---
 * @typedef {import('../../typedefs').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs').runtimeNodeConfig} runtimeNodeConfig
 * @typedef {import('../../typedefs').runtimeNode} runtimeNode
 * @typedef {import('../../typedefs').uibMwNode} uibMwNode
 */

// #region ----- Module level variables ---- //

const { basename, join, isAbsolute, parse, relative, resolve, sep, } = require('path')
const express = require('express')
// ! TODO Move to fs.cjs

const {
    accessSync, existsSync, fgSync,
    readdirSync, readFile, readFileSync,
    stat, watch,
} = require('../libs/fs.cjs')
const { urlJoin, } = require('../libs/tilib.cjs')
const { setNodeStatus, } = require('../libs/uiblib.cjs') // Utility library for uibuilder
const sockets = require('../libs/socket.cjs')
const web = require('../libs/web.cjs')
// The uibuilder global configuration object, used throughout all nodes and libraries.
const uib = require('../libs/uibGlobalConfig.cjs')
// Used to show approx size of variables in bytes: serialize(variableName).byteLength
const { serialize, } = require('v8')

// Import my utility packages using npm workspaces
const { mdParse, fm, } = require('@totallyinformation/uib-md-utils') // eslint-disable-line n/no-extraneous-require
const { chokidar, } = require('@totallyinformation/uib-fs-utils') // eslint-disable-line n/no-extraneous-require

/** Object tree of folders and files
 * @typedef {object} FolderTree
 * @property {string} name - Name of the folder or file
 * @property {string} type - 'folder' or 'file'
 * @property {string} path - Path of the folder or file in URL form for matching to details if required
 * @property {FolderTree[]} [children] - Children if folder
 */

/** walkFolderStructure - Recursively walks a folder structure and returns a nested object representing folders and files.
 * Folders are only included if they contain an index.md file. Any folder or file starting with _ or . is ignored.
 * @param {string} dirPath - The root directory to start walking from
 * @param {string} [_startPath] - The initial starting path (used internally)
 * @param {number} [_level] - Current recursion depth (used internally to prevent infinite loops)
 * @returns {Promise<FolderTree|null>} Nested object representing the folder structure
 * @throws {Error} If the directory cannot be read
 * @example
 * // Example usage:
 * const structure = walkFolderStructure('/docs');
 */
const walkFolderStructure = async (dirPath, _startPath, _level = 0) => {
    if (_level >= 10) {
        throw new Error(`[walkFolderStructure] Maximum folder depth (10) exceeded at: ${dirPath}`)
    }
    if (_level === 0) _startPath = dirPath

    /** Helper to check if a name should be ignored
     * @param {string} name - The name of the file or folder
     * @returns {boolean} True if the name should be ignored
     */
    const shouldIgnore = name => name.startsWith('_') || name.startsWith('.')

    /** Read directory and filter out ignored entries */
    let entries
    try {
        entries = readdirSync(dirPath, { withFileTypes: true, })
    } catch (err) {
        throw new Error(`Unable to read directory: ${dirPath}`)
    }
    // Ignore entries starting with _ or .
    entries = entries.filter(e => !shouldIgnore(e.name))

    // Only include this folder if it contains index.md
    const hasIndexMd = entries.some(e => e.isFile() && e.name === 'index.md')
    if (!hasIndexMd) return null

    /** @type {FolderTree} */
    const node = {
        name: basename(dirPath),
        type: 'folder',
        path: urlJoin('/', relative(_startPath, dirPath)),
        children: [],
    }

    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)
        if (entry.isDirectory()) {
            const child = await walkFolderStructure(fullPath, _startPath, _level + 1)
            if (child) node.children.push(child)
        } else if (entry.isFile() && entry.name !== 'index.md') {
            node.children.push({
                name: entry.name,
                type: 'file',
                path: urlJoin('/', relative(_startPath, fullPath)),
            })
        }
    }
    return node
}

// Export for use elsewhere
// module.exports.walkFolderStructure = walkFolderStructure

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    // evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-markweb',
}

// #endregion ----- Module level variables ---- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    if (!uib.RED) uib.RED = RED

    /** Register a new instance of the specified node type (2) */
    RED.nodes.registerType(mod.nodeName, nodeInstance, {
        // settings: {
        //     uibMarkwebCheckLibs: { value: uib.markedLibs, exportable: true, },
        // },
    })
}

/** 2) This is run when an actual instance of our node is committed to a flow
 * @param {runtimeNodeConfig & uibMwNode} config The Node-RED node instance config object
 * @this {runtimeNode & uibMwNode}
 */
function nodeInstance(config) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // If you need it - which you will here - or just use uibGlobalConfig.RED if you prefer:
    const RED = uib.RED
    if (RED === null) return
    const log = RED.log

    // Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    this.statusDisplay = { fill: 'blue', shape: 'dot', text: 'Configuring node', }
    setNodeStatus( this )

    /** Transfer config items from the Editor panel to the runtime */
    this.source = config.source ?? ''
    this.url = config.url ?? 'markweb'
    this.name = config.name ?? ''
    this.configFolder = config.configFolder ?? '_config'
    this.sourceFolder = '' // Used in web.instanceSetup(), should be ''

    // Make sure the url is valid & prefix with nodeRoot if needed
    this.url = urlJoin(uib.nodeRoot, this.url.trim())

    this.configFolder = this.configFolder.trim()

    // source folder cannot be null/blank
    this.source = this.source.trim()
    if (!this.source || this.source === '') {
        this.error('🌐🛑[uibuilder:uib-markweb] Source folder cannot be blank. Please set a valid source folder in the node configuration.')
        return
    }

    // if source folder is a relative path, make it relative to userDir
    if (isAbsolute(this.source)) {
        this.instanceFolder = this.source
    } else {
        this.instanceFolder = join(RED.settings.userDir, this.source)
    }
    // Check if instanceFolder exists and is readable? Error if not
    try {
        accessSync( this.instanceFolder, 'r' )
    } catch (err) {
        this.error(`🌐🛑[uibuilder:uib-markweb] Source folder must be readable. Please check permissions. Source="${this.instanceFolder}"`)
        return
    }

    // if config folder is a relative path, make it relative to userDir
    if (!isAbsolute(this.configFolder)) {
        this.configFolder = join(RED.settings.userDir, this.configFolder)
    }
    // Check if configFolder exists and is readable? Config will use defaults if not
    if (processConfig.bind(this) === false) {
        log.warn(`🌐⚠️[uib-markweb:nodeInstance:${this.url}] Config folder is not accessible, using defaults. "${this.configFolder}"`)
    }

    // Holder for search indexes - Map
    this.index = new Map()

    // Build search index asynchronously
    buildIndexes(this)
        .then(() => {
            return true
        })
        .catch((err) => {
            log.error(`🌐🛑[uib-markweb:nodeInstance:${this.url}] Uncaught error in buildIndexes: ${err.message}`)
        })
    // File/folder change watch (sets this.watcher so it can be cancelled), also notifies connected clients
    setupFileWatcher(this)

    // Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this, `${this.url}/:morePath(*)?`, handler.bind(this), { searchHandler: searchHandler.bind(this), })

    // Socket.IO instance configuration. Each deployed instance has it's own namespace
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    // Define internal control messages and processing
    this.internalControls = internalControlMsgHooks(this, log)

    // Clean up watcher on node close
    this.on('close', async () => {
        await this.watcher.close()
        log.trace(`🌐[uib-markweb:close:${this.url}] File watcher closed`)
        // const watcher = this.watcher
        // if (watcher) {
        //     watcher.close()
        //     watcher.delete(this.url)
        //     this.watcher = null
        //     log.trace(`🌐[uib-markweb:nodeInstance:${this.url}] File watcher closed`)
        // }
    })

    log.trace(`🌐[uib-markweb:nodeInstance:${this.url}] URL . . . . .  : ${urlJoin( uib.nodeRoot, this.url )}`)
    log.trace(`🌐[uib-markweb:nodeInstance:${this.url}] Source files . : ${this.instanceFolder}`)

    // We only do the following if io is not already assigned (e.g. after a redeploy)
    this.statusDisplay.text = 'Node Initialised'
    setNodeStatus( this )

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    this.on('input', inputMsgHandler)

    // Allow editor to query whether marked and other dependencies are available
    // RED.httpAdmin.get(`/uibuilder/chk-markweb`, (req, res) => {
    //     res.status(200).json( chkLibs )
    // })
} // ---- End of nodeInstance ---- //

/** 3) Run whenever a node instance receives a new input msg
 * NOTE: `this` context is still the parent (nodeInstance).
 * See https://nodered.org/blog/2019/09/20/node-done
 * @param {object} msg The msg object received.
 * @param {Function} send Per msg send function, node-red v1+
 * @param {Function} done Per msg finish function, node-red v1+
 * @this {runtimeNode & uibMwNode}
 */
function inputMsgHandler(msg, send, done) {
    // const RED = uib.RED

    // If the input msg is a uibuilder control msg, then drop it to prevent loops
    if ( Object.prototype.hasOwnProperty.call(msg, 'uibuilderCtrl') ) {
        done()
        return
    }

    // @ts-ignore pass the complete msg object to the uibuilder client
    sockets.sendToFe( msg, this, uib.ioChannels.server )

    // We are done
    done()
}

// #region ----- Module-level support functions ----- //

/** Define internal control message hooks for this node instance
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} log The RED.log object for logging
 * @returns {object} An object containing internal control message handler functions
 * @this {runtimeNode & uibMwNode}
 */
function internalControlMsgHooks(node, log) {
    return {
        /** Internal control hook to perform a search, returns a list of results to the requesting client
         * @param {object} msg A control message with at least { query: string }
         */
        search: (msg) => {
            const returnTopic = '_search-results'
            const index = node.index
            if (!index) {
                log.warn(`🌐⚠️[uib-markweb:nodeInstance:search}] Search attempted but index not ready for instance URL: "${node.url}"`)
                node.sendToFe({
                    topic: returnTopic,
                    query: msg.query,
                    results: [],
                    error: 'Search index not ready',
                    _socketId: msg._socketId, // Ensure response goes to requesting client only
                }, node, uib.ioChannels.control)
                return
            }
            let results
            try {
                results = doSearch(index, msg.query)
            } catch (e) {
                log.error(`🌐🛑[uib-markweb:nodeInstance:search}] Error performing search for instance URL "${node.url}": ${e.message}`)
            }
            node.sendToFe({
                topic: returnTopic,
                query: msg.query,
                results: results,
                _socketId: msg._socketId,
            }, node, uib.ioChannels.control)
        },

        /** Internal control hook to navigate to a different page
         * @param {object} msg A control message with at least { toUrl: string }
         */
        navigate: doNavigate.bind(node),

        /** Internal control hook to get page metadata
         * @param {object} msg A control message with at least { initialPath: string }
         */
        getMetadata: (msg) => {
            const index = node.index
            // Strip hash/fragment identifiers (e.g., #section) as they are client-side only
            let lookupPath = msg.initialPath
            if (lookupPath && lookupPath.includes('#')) lookupPath = lookupPath.split('#')[0]
            // console.log(`🌐[uib-markweb:nodeInstance] Internal get-metadata control message received for instance URL "${node.url}": "${msg.initialPath}"`, index.has(lookupPath), index)
            const attributes = index.get(lookupPath)
            const data = { ...attributes, }
            delete data.body // We don't want this in the front-end

            // Get the client to set the pageData managed prop
            node.sendToFe({
                topic: '_page-metadata',
                initialPath: msg.initialPath,
                attributes: data,
                // attributes: data,
                _socketId: msg._socketId, // Ensure response goes to requesting client only
            }, node, uib.ioChannels.control)
        },
    }
}

// #region -- %%...%% specials processing (see processTemplates for calls) -- //
/** Wrap body content in a div#content & convert markdown to html
 * @param {'body'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%nav [options]%% instruction. Applied as html attributes to the wrapper div
 * @returns {string} Wrapped body content as an html string
 */
function bodyWrapper(key, attributes, node, options) {
    console.log('🌐[bodyWrapper] options=', options)
    let attrs = ''
    if (options) {
        attrs = Object.entries(options)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ')
    }
    let html = ''
    try {
        html = mdParse(attributes.body)
    } catch (e) { /* ignore errors */ }
    return `<div id="content" ${attrs} data-attribute="body">${html || ''}</div>`
    // return `<div id="content" ${attrs} data-attribute="body">{{body}}</div>`
}

/** Create navigation menu HTML and return it
 * @param {'nav'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} options Optional options passed to the %%nav [options]%% instruction
 * @returns {string} The generated navigation HTML
 */
function createNav(key, attributes, node, options) {
    // console.log('  >>🌐[createNav] ', key, options, attributes)

    if (!options) options = {}

    options.nav = true

    let currentStart = false
    if ('start' in options) options.start = Number(options.start)
    else {
        // No start given so assume current level
        options.start = attributes.depth
        currentStart = true
    }

    if ('depth' in options) options.end = Number(options.depth)

    if ('end' in options) options.end = Number(options.end)
    else if (options.depth) options.end = options.start + options.depth
    else if (currentStart) options.end = attributes.depth
    else options.end = 3 // Max depth default

    if (!('type' in options)) {
        // type can be 'files', 'folders', or 'both'
        options.type = 'folders'
    }

    options = { start: 0, end: 3, type: 'folders', orient: 'horizontal', nav: true, }
    const links = indexListing(
        key, attributes, node,
        options
    )
    const isHorizontal = options?.orient === 'horizontal' || !options?.orient
    const searchBox = /* html */`
        <search>
            <form id="search-form" role="search" onsubmit="return false">
                <input type="search" id="search-input" placeholder="Search..." aria-label="Search pages">
            </form>
        </search>
    `
    return `
    <nav data-attribute="nav" data-replace aria-label="Main menu" class="${options?.orient || 'horizontal'}" role="navigation">
        ${links}
        ${searchBox}
    </nav>
    `
}

/** Create an HTML list of links to pages the current level or between the given levels
 * If start/end not provided, assume only the current level
 * @param {'index'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%nav [options]%% instruction
 * @param {string|number} [options.start] The starting depth level (0 = root)
 * @param {string|number} [options.end] The ending depth level (0 = root)
 * @returns {string} The generated navigation HTML
 */
function indexListing(key, attributes, node, options) {
    let currentStart = false
    if (!options) options = {}

    if (!('nav' in options)) options.nav = false

    if ('start' in options) options.start = Number(options.start)
    else {
        // No start given so assume current level
        options.start = attributes.depth
        currentStart = true
    }

    if ('depth' in options) options.end = Number(options.depth)

    if ('end' in options) options.end = Number(options.end)
    else if (options.depth) options.end = options.start + options.depth
    else if (currentStart) options.end = attributes.depth
    else options.end = 5 // Max depth default

    if (!('type' in options)) {
        // type can be 'files', 'folders', or 'both'
        options.type = 'both'
    }

    const filtered = filteredIndex(currentStart, attributes, options, node)
    // console.log('  >>🌐[indexListing] ', { key, options, attributes, filtered, })

    // Build a hierarchical tree structure from the filtered paths
    const tree = new Map()

    for (const [path, doc] of filtered) {
        // If no start given, and path matches current page, skip it
        if (currentStart && path === attributes.path) continue

        // Determine title
        let title = doc.title
        if (doc.path === '/') title = 'Home'
        else if (doc.type === 'folder' && (!title || title === 'index')) {
            // Get the last segment of the path as title and convert to title case
            const segments = doc.path.replace(/\/$/, '').split('/').filter(Boolean)
            const rawTitle = segments[segments.length - 1] || doc.path.slice(1, -1)
            title = rawTitle.replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }

        // Split path into segments (remove empty strings from leading/trailing slashes)
        const segments = path
            .replace(/\/$/, '')
            .split('/')
            .filter(Boolean)
        if (segments.length === 0) {
            // Root path
            if (!tree.has('/')) {
                tree.set('/', { path: '/', title, children: new Map(), })
            }
            continue
        }

        // Navigate/create tree structure
        let current = tree
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]
            const isLast = i === segments.length - 1

            if (!current.has(segment)) {
                current.set(segment, {
                    path: isLast ? path : '/' + segments.slice(0, i + 1).join('/') + '/',
                    title: isLast ? title : segment,
                    children: new Map(),
                })
            } else if (isLast) {
                // Update with actual doc info if this is the final segment
                const node = current.get(segment)
                node.path = path
                node.title = title
            }
            current = current.get(segment).children
        }
    }

    // If start and end levels are the same, omit folder (index) entries
    const sameLevel = options.start === options.end

    // Recursive function to render the tree structure as HTML
    return renderTree(tree, sameLevel, options.nav)
}

/** Create search results wrapper HTML
 * @param {'searchResults'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%search-results [options]%% instruction.
 * @returns {string} The generated search results HTML
 */
function searchResultsWrapper(key, attributes, node, options) {
    console.log('🌐[searchResultsWrapper] options=', options)
    return /* html */`
        <article id="search-results" hidden>
            <div id="search-header">
                <span>Search results for "<span id="search-query">N/A</span>" (<span id="search-count">N/A</span>)</span>
                <button class="search-close" aria-label="Close search results">×</button>
            </div>
            <div id="search-details"></div>
        </article>
    `
}

// #endregion -- %%...%% specials processing -- //

/** Build search & nav indexes from all markdown files asynchronously & notifies connected clients
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * param {string} sourcePath The source folder path
 * param {string} instanceUrl The instance URL (used as index key)
 * @returns {Promise<void>}
 */
async function buildIndexes(node) {
    const log = uib.RED.log
    const strt = performance.now()
    const url = node.url
    const instanceFolder = node.instanceFolder

    const index = node.index
    const indexFolder = instanceFolder.replace(/\\/g, '/')

    let files
    try {
        files = fgSync(`${indexFolder}/**/*.md`)
    } catch (e) {
        log.error(`🌐🛑[uib-markweb:buildSearchIndex:${url}] Error reading markdown files from source folder "${indexFolder}": ${e.message}`)
        files = []
    }
    log.info(`🌐[uib-markweb:buildSearchIndex:${url}] Building search index. sourcePath="${indexFolder}". Found ${files.length} markdown files.`)

    // Process all files in parallel
    const results = await Promise.allSettled(
        files.map(file => getMarkdownFile(node, file))
    )

    // Log any errors
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            log.error(`🌐🛑[uib-markweb:buildSearchIndex:${url}] Skipping file "${files[index]}" due to error: ${result.reason.message}`)
        }
    })

    // notify ALL connected clients that indexes have changed
    node.sendToFe({
        topic: '_indexes-changed',
    }, node, uib.ioChannels.control)

    // ! TEMPORARY - for debugging convenience
    globalThis._uibuilder_.markweb.indexes[url] = node.index

    log.info(`🌐[uib-markweb:buildSearchIndex:${url}] Finished index. sourcePath="${instanceFolder}", duration=${Math.round(performance.now() - strt)}ms, Size=${(serialize(node.index).byteLength / 1024).toFixed(0)}kb`)
}

/** Build a list of navigable pages from all markdown files in the source folder
 * @param {string} sourcePath Source folder path
 * @returns {Array<{path: string, title: string, file: string}>} Array of navigation items
 */
function buildNavigationIndex(sourcePath) {
    try {
        const files = fgSync(`${sourcePath.replace(/\\/g, '/')}/**/*.md`)
        return files.map((file) => {
            const relativePath = relative(sourcePath, file).replace(/\\/g, '/')
            const urlPath = relativePath.replace(/\.md$/, '')
            const title = basename(file, '.md')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase())
            return { path: urlPath, title, file: relativePath, }
        })
    } catch (e) {
        return []
    }
}

/** Handle a navigation socket request
 * @param {object} msg A control message with at least { toUrl: string }
 * @this {runtimeNode & uibMwNode}
 */
async function doNavigate(msg) {
    const log = uib.RED.log
    const returnTopic = '_page-navigation-result'
    let attributes = {}

    let morePath = msg.toUrl.replace(new RegExp(`^${this.url}`), '')
    if (morePath.startsWith('.')) morePath = morePath.slice(1)
    if (morePath.startsWith('/')) morePath = morePath.slice(1)
    // Strip hash/fragment identifiers (e.g., #section) as they are client-side only
    if (morePath.includes('#')) morePath = morePath.split('#')[0]
    if (morePath === '.search' || morePath === '_search') {
        // Ignore for now
        return
    }
    // Check if folder or file name starts with _ or . and deny access
    if (morePath.split(sep).some(part => part.startsWith('_') || part.startsWith('.'))) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:navigate] Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`)
        // @ts-ignore
        attributes = {
            error: true,
            title: 'Error',
            description: `Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`,
            body: `<h1>Error</h1><p>Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."</pre>`,
            from: 'navigate',
        }
        this.sendToFe({
            topic: returnTopic,
            attributes: attributes,
            _socketId: msg._socketId,
        }, this, uib.ioChannels.control)
        return
    }

    let fullPath = join(this.instanceFolder, morePath)
    // Security: Prevent path traversal
    if (!fullPath.startsWith(this.instanceFolder)) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:navigate] Access denied to "${fullPath}" because it is outside "${this.instanceFolder}"`)
        // @ts-ignore
        attributes = {
            error: true,
            title: 'Error',
            description: `Access denied to "${fullPath}" because it is outside "${this.instanceFolder}"`,
            body: `<h1>Error</h1><p>Access denied to "${fullPath}" because it is outside "${this.instanceFolder}"</pre>`,
            from: 'navigate',
        }
        this.sendToFe({
            topic: returnTopic,
            attributes: attributes,
            _socketId: msg._socketId,
        }, this, uib.ioChannels.control)
        return
    }

    // If morePath has no extension, first check if it is a valid folder
    let parsedPath = parse(morePath)
    if (!parsedPath.ext) {
        if (existsSync(fullPath)) {
            // The folder exists, we assume the index file needed
            morePath = join(morePath, 'index.md')
            fullPath = join(this.instanceFolder, morePath)
        } else {
            // Not a folder, so add .md extension
            morePath += '.md'
            fullPath = join(this.instanceFolder, morePath)
        }
        parsedPath = parse(morePath)
    }

    // console.log(`🌐[uib-markweb:nodeInstance:navigate] Internal navigate control message received for instance URL: "${this.url}": 
    //     toUrl="${msg.toUrl}", 
    //     fullPath="${fullPath}", 
    //     morePath="${morePath}", 
    //     parsedPath=${JSON.stringify(parsedPath)}
    // `)

    // Now check that the file exists, return an error if not
    try {
        accessSync( fullPath, 'r' )
        log.trace(`🌐[uib-markweb:nodeInstance:navigate] Source file is accessible: "${fullPath}"`)
    } catch (err) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:navigate] Source file "${fullPath}" not accessible: ${err.message}`)
        // @ts-ignore
        attributes = {
            error: 'Page not found',
            title: 'Error',
            description: `The requested page does not exist.`,
            body: `<h1>Page Not Found</h1><p>The requested page does not exist.</p>`,
            from: 'navigate',
        }
        this.sendToFe({
            topic: returnTopic,
            attributes: attributes,
            _socketId: msg._socketId,
        }, this, uib.ioChannels.control)
        return
    }

    if (parsedPath.ext === '.md') {
        // processTemplates(node.pageTemplate, attributes)
        attributes = await getMarkdownFile(this, fullPath, morePath, parsedPath)
        attributes.body = mdParse(processTemplates(attributes.body, this, attributes, 'doNavigate-body'))
        attributes.from = 'navigate'
        attributes.toUrl = urlJoin(morePath) // Normalise
        this.sendToFe({
            topic: returnTopic,
            attributes: attributes,
            _socketId: msg._socketId,
            // Gets the client to add this nav to browser history - explicitly convert to boolean
            addToHistory: msg.addToHistory === true,
            // Pass hash fragment back to client for scrolling
            hashFragment: msg.hashFragment || '',
        }, this, uib.ioChannels.control)
    }

    // If not a markdown file, do nothing for now
}

/** Process a search request against the index
 * @param {Map<string, object>} index The search index
 * @param {string} query The search query
 * @returns {Array} Array of search results
 */
function doSearch(index, query) {
    const results = []
    query = query.toLowerCase()
    for (const [path, doc] of index) {
        let titleMatch, contentMatch, descMatch, tagMatch

        if (doc?.title) titleMatch = doc.title.toLowerCase().includes(query)
        if (doc?.description) descMatch = doc.description.toLowerCase().includes(query)
        if (doc?.tags && Array.isArray(doc.tags) && doc.tags.length > 0) {
            tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(query))
        }
        if (doc?.content) contentMatch = doc.content.toLowerCase().includes(query)

        // Extract snippet around match
        const MAXSNIPPETLENGTH = 50 // 50 gives max length of 100 chars
        let snippet = ''
        if (titleMatch) {
            snippet = `Title: ${doc.title}`
        } else if (tagMatch) {
            snippet = `Tags: ${doc.tags.join(', ')}`
        } else if (descMatch) {
            snippet = `Description: ${doc.description}`
        } else if (contentMatch) {
            let idx = -1
            idx = doc.content.toLowerCase().indexOf(query)
            if (idx >= 0) {
                const start = Math.max(0, idx - MAXSNIPPETLENGTH)
                const end = Math.min(doc.content.length, idx + query.length + MAXSNIPPETLENGTH)
                snippet = '...' + doc.content.slice(start, end) + '...'
            }
        }

        // Set relavence score
        let score = 0
        const foundIn = []
        if (titleMatch) {
            score += 10
            foundIn.push('title')
        }
        if (tagMatch) {
            score += 7
            foundIn.push('tags')
        }
        if (descMatch) {
            score += 5
            foundIn.push('description')
        }
        if (contentMatch) {
            score += 1
            foundIn.push('content')
        }

        if (score > 0) {
            results.push({
                path: doc.path,
                title: doc.title,
                description: doc.description,
                snippet,
                score,
                foundIn,
            })
        }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score)
    return results
}

/** Filter the index based on options
 * @param {boolean} currentStart Whether to limit to current start path
 * @param {object} attributes The current pages attributes
 * @param {object} options Filtering options
 *   @param {object} [options.sort] Sorting options
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @returns {Array} Filtered index entries
 */
function filteredIndex(currentStart, attributes, options, node) {
    const filtered = [...node.index].filter(
        ([key, value]) =>
            value.depth >= options.start
            && value.depth <= options.end
            && (currentStart ? value.path.startsWith(attributes.path) : true)
            && (options.type === 'folders' ? value.type === 'folder' : true)
            && (options.type === 'files' ? value.type === 'file' : true)
    )
    // TODO: Allow options.sort to specify sorting field(s) and order
    // Sort the filtered array
    filtered.sort((a, b) => a[1].path.localeCompare(b[1].path))
    return filtered
}

/** Get and parse a markdown file
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {string} file FS path to the markdown file
 * param {string} fullPath Full path to the markdown file
 * @param {string} [morePath] Relative path or additional path info
 * @param {object} [parsedPath] Parsed path object
 * @returns {Promise<object>} Parsed attributes and HTML body
 */
async function getMarkdownFile(node, file, morePath, parsedPath) {
    // fullPath, morePath, parsedPath
    const log = uib.RED.log
    const userDir = uib.RED.settings.userDir
    log.trace(`🌐[uib-markweb:getMarkdownFile:${node.url}] Request for markdown file, source="${node.source}", file="${file}"`)

    const index = node.index

    // check if urlPath already exists in searchIndex
    // get the actual filename without the path
    const filename = basename(file)
    // Skip files starting with _ or .
    if (filename.startsWith('_') || filename.startsWith('.')) {
        return {}
    }

    const relativePath = relative(join(userDir, node.source), file)
        .replace(/\\/g, '/')
    // Replace trailing .md and training index
    const urlPath = '/' + relativePath
        .replace(/\.md$/, '')
        .replace(/index$/, '')

    // console.group(`>>🌐[uib-markweb:getMarkdownFile:${node.url}] Processing markdown file:`)
    // console.log(`File: ${file}`)
    // console.log(`Relative Path: ${relativePath}`)
    // console.log(`URL Path: ${urlPath}`)
    // console.log(`node.source: ${node.source}`)
    // console.groupEnd()

    let fStats = {}
    try {
        fStats = await stat(file)
    } catch (e) { /* ignore errors */ }

    let attributes = {}
    // check if urlPath already exists in searchIndex
    let needToUpd = true
    if (index.has(urlPath)) {
        // Check if existing entry has the same last updated timestamp as the actual file
        attributes = index.get(urlPath)
        if (attributes?.fsMtimeMs === fStats.mtimeMs) {
            // No need to re-index
            needToUpd = false
        }
    }
    if (needToUpd) {
        // TODO Move file processing to separate fn that returns the attributes needed for indexing & showing
        let content = ''
        try {
            content = await readFile(file, 'utf8')
            log.trace(`🌐[uib-markweb:getMarkdownFile:${node.url}] Read markdown file successfully: "${file}"`)
        } catch (err) {
            log.error(`🌐🛑[uib-markweb:getMarkdownFile:${node.url}] Error reading markdown file "${file}". ${err.message}`)
            return {
                error: true,
                title: 'Error',
                description: `Error reading markdown file "${file}"`,
                body: `<h1>Error</h1><p>There was an error reading the requested markdown file.</p><pre>${err.message}</pre>`,
            }
        }
        let parsed = { }
        try {
            parsed = fm(content)
        } catch (err) {
            log.error(`🌐🛑[uib-markweb:getMarkdownFile:${node.url}] Error parsing front-matter in markdown file "${file}". ${err.message}`)
            return {
                error: true,
                title: 'Error',
                description: `Error parsing front-matter in markdown file "${file}"`,
                body: `<h1>Error</h1><p>There was an error parsing the front-matter in the requested markdown file.</p><pre>${err.message}</pre>`,
            }
        }

        // Generate title from filename if not in front-matter: remove .md, convert _ to space, capitalize first char
        let derivedTitle = basename(file, '.md')
        derivedTitle = derivedTitle.replace(/_/g, ' ')
        derivedTitle = derivedTitle.charAt(0).toUpperCase() + derivedTitle.slice(1)

        attributes = {
            ...node.globalAttributes || {},
            ...parsed.attributes || {},
            title: parsed.attributes?.title || derivedTitle,
            description: parsed.attributes?.description || '',
            // Store plain text (strip markdown) for searching
            // body: parsed.body.replace(/[#*`\[\]()]/g, '').toLowerCase() || '',
            body: parsed.body || '',
            // Store plain text content for search indexing (strip markdown syntax)
            content: parsed.body?.replace(/[#*`\[\]()!<>]/g, ' ').replace(/\s+/g, ' ').trim() || '',
            tags: parsed.attributes?.tags || [],
            category: parsed.attributes?.category || '',
            author: parsed.attributes?.author || '',
            path: urlPath,
            // Use the file's actual last updated timestamp from the filing system
            fsMtimeMs: fStats.mtimeMs,
            // Generate created from file birthtime if not in front-matter
            created: parsed.attributes?.created || (fStats.birthtimeMs ? new Date(fStats.birthtimeMs).toISOString() : ''),
            // Generate updated from file mtime if not in front-matter
            updated: parsed.attributes?.updated || (fStats.mtimeMs ? new Date(fStats.mtimeMs).toISOString() : ''),
            // Record whether this is a folder or a file
            type: filename === 'index.md' ? 'folder' : 'file',
            // Record the file name
            file: filename,
            // Record the folder depth (0 for root index.md, 1 for first level, etc)
            depth: urlPath.split('/').length - 2,
            // Full relative URL (use relativePath which already contains the correct path)
            toUrl: urlJoin('/', relativePath),
            // other: [morePath, parsedPath],
        }
        // attributes.htmlbody = processTemplates(attributes.body, attributes)
        index.set(urlPath, attributes)
    }
    // console.log(`  >>🌐 Indexing file: ${urlPath}, ${relativePath}, ${file}`)
    // Return a shallow copy to prevent mutations from affecting the cached index entry
    return { ...attributes, }
}

/** ExpressJS middleware handler function for uib-markweb nodes
 * @param {import('express').Request} req ExpressJS request object
 * @param {import('express').Response} res ExpressJS response object
 * @param {import('express').NextFunction} next ExpressJS next() function
 * @returns {Promise<void|import('express').Response|import('express').NextFunction>} Response or void
 * @this {runtimeNode & uibMwNode}
 */
async function handler(req, res, next) {
    const log = uib.RED.log

    // HEAD requests only need headers, not body - respond early to avoid duplicate processing
    if (req.method === 'HEAD') {
        res.set('Content-Type', 'text/html; charset=utf-8')
        res.status(200).end()
        return
    }

    let morePath = req.params?.morePath || '' // 'index.md'
    // Guard: Verify this request is for this instance
    // req.baseUrl is the path where the router is mounted (should match this.url)
    // Normalize both paths for comparison (remove trailing slashes, handle case)
    const normalizedBaseUrl = req.baseUrl.replace(/\/+$/, '').toLowerCase()
    const normalizedInstanceUrl = this.url.replace(/\/+$/, '').toLowerCase()
    // console.log(`>>🌐[uib-markweb:handler]>>
    //     Request URL: "${req.url}", 
    //     Path: "${req.path}",
    //     morePath: "${morePath}",
    //     normalizedBaseUrl: "${normalizedBaseUrl}", 
    //     normalizedInstanceUrl: "${normalizedInstanceUrl}"
    // `)
    // console.log({req, res})
    // Handle requests that should be redirected to /uibuilder/...
    // e.g., /markweb/uibuilder/vendor/socket.io/... -> /uibuilder/vendor/socket.io/...
    if (morePath.startsWith('uibuilder/')) {
        const redirectUrl = '/' + morePath + req.url.substring(req.url.indexOf('?'))
        log.info(`🌐[uib-markweb:handler] REDIRECTING "${req.originalUrl}" to "${redirectUrl}"`)
        return res.redirect(301, redirectUrl)
    }
    if (!normalizedBaseUrl.startsWith(normalizedInstanceUrl)) {
        // This request is not for this instance, pass to next handler
        log.info(`🌐[uib-markweb:handler] Skipping - baseUrl "${req.baseUrl}" !== instanceUrl "${this.url}"`)
        return next()
    }

    // Differentiate between ajax and normal requests
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest'
    // Handle a search request
    // Get route extended parameter if present
    if (morePath === '.search' || morePath === '_search') {
        searchHandler.bind(this)(req, res)
        return
    }
    // Check if folder or file name starts with _ or . and deny access
    if (morePath.split(sep).some(part => part.startsWith('_') || part.startsWith('.'))) {
        log.error(`🌐🛑[uib-markweb:handler] Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`)
        res.status(403).send(`<p>Folders or files starting with "_" or "." are not accessible.</p>`)
        return
    }
    // Normalize morePath to prevent path traversal attacks
    let fullPath = join(this.instanceFolder, morePath)
    // Security: Prevent path traversal
    if (!fullPath.startsWith(this.instanceFolder)) {
        log.error(`🌐🛑[uib-markweb:handler] Access denied to "${fullPath}" because it is outside "${this.instanceFolder}"`)
        res.status(403).send(`Access denied`)
        return
    }
    // If morePath has no extension, first check if it is a valid folder
    let parsedPath = parse(morePath)
    if (!parsedPath.ext) {
        if (existsSync(fullPath)) {
            // The folder exists, we assume the index file needed
            morePath = join(morePath, 'index.md')
            fullPath = join(this.instanceFolder, morePath)
        } else {
            // Not a folder, so add .md extension
            morePath += '.md'
            fullPath = join(this.instanceFolder, morePath)
        }
        parsedPath = parse(morePath)
    }
    // Now check that the file exists, return an error if not
    try {
        accessSync( fullPath, 'r' )
        log.trace(`🌐[uib-markweb:handler] Source file is accessible: "${fullPath}"`)
    } catch (err) {
        log.error(`🌐🛑[uib-markweb:handler] Source file "${fullPath}" not accessible: ${err.message}`)
        if (isAjax) {
            res.status(404).json({ error: 'Page not found', body: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>', })
        } else {
            // const nav = buildNavigation()
            res.status(404).send(htmlTemplate(this, { body: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>', }))
        }
        return
    }

    // Handle markdown files
    if (parsedPath.ext === '.md') {
        const attributes = await getMarkdownFile(this, fullPath, morePath, parsedPath)
        attributes.body = mdParse(processTemplates(attributes.body, this, attributes, 'handler-body'))
        attributes.from = 'handler'
        attributes.toUrl = morePath
        attributes.reqType = isAjax ? 'ajax' : 'get'
        if (isAjax) {
            // Return JSON for SPA navigation
            res.json(attributes)
        } else {
            // Return full page for initial load / direct access
            const html = htmlTemplate(this, attributes)
            res.send(html)
            // // Send pageData to FE via socket.io after a short delay to allow FE to set up
            // setTimeout(() => {
            //     // console.log('🌐[uib-markweb:handler] Sending pageData to FE via socket.io')
            //     const data = { ...attributes, }
            //     delete data.body // We don't want this in the front-end
            //     const headers = res.getHeaders()
            //     // Get the client to set the pageData managed prop
            //     // No socket id available on first page load so use clientId if available
            //     this.sendToFe({
            //         topic: '_setMetaData',
            //         attributes: data,
            //         _uib: {
            //             clientId: headers['uibuilder-client-id'] || undefined,
            //         },
            //     }, this, uib.ioChannels.control)
            // }, 500)
        }
    } else {
        // Not a markdown file, serve static
        log.info(`🌐[uib-markweb:handler] Request for static file received: "${this.source}", "${this.url}", "${morePath}", "${fullPath}", "${parsedPath.ext}"`)
        express.static( this.instanceFolder, uib.staticOpts )(req, res, next)
    }
}

/** Get an HTML template and global attributes for markdown rendering
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {object} [attributes] Attributes extracted from front-matter and other defaults
 * @returns {string} Full HTML page as a string
 */
function htmlTemplate(node, attributes = {}) {
    const log = uib.RED.log
    // TODO consider caching the page-template content for this instance for efficiency - but think about easy updates, how?
    node.pageTemplate = readConfigFile(node, 'page-template.html') || ''
    node.globalAttributes = readConfigFile(node, 'global-attributes.json') || {}
    attributes = { ...node.globalAttributes, ...attributes, }
    attributes.url = node.url
    // add the markdown body
    // if (!attributes.body) {
    //     attributes.body = '## Error: No content (htmlTemplate)\n\nThe requested page has no content.'
    // } else {
    //     try {
    //         // attributes.body = marked(processTemplates(attributes.body, attributes))
    //         attributes.body = processTemplates(attributes.body, attributes) || '<h2>Error: (htmlTemplate)</h2><div>processTemplates produced no output.</div>'
    //         // attributes.body = mdParse(attributes.body)
    //         // console.log('>> GOOD ATTRIBUTES >> ', attributes)
    //     } catch (err) {
    //         log.error(`🌐🛑[uib-markweb:htmlTemplate] Error converting markdown to HTML: ${err.message}`)
    //         // console.log('>> BAD ATTRIBUTES >> ', attributes)
    //     }
    // }
    // Replace any %%....%% or {{....}} in content with the matching attributes property value
    const html = processTemplates(node.pageTemplate, node, attributes, 'htmlTemplate-pageTemplate')
    // console.log('🌐[uib-markweb:htmlTemplate] ', html)
    return html
}

/** Check if this.configFolder exists and is readable
 * @returns {boolean|null} True if configFolder exists and is readable, false if not, null if not set
 * @this {runtimeNode & uibMwNode}
 */
function processConfig() {
    const RED = uib.RED
    const log = RED.log
    let ans = null
    if (this.configFolder) {
        // if configFolder is a relative path, make it relative to userDir
        if (!isAbsolute(this.configFolder)) {
            this.configFolder = join(RED.settings.userDir, this.configFolder)
        }
        try {
            accessSync( this.configFolder, 'r' )
            ans = true
            // log.trace(`🌐[uib-markweb:processConfig] Config folder is accessible. "${this.configFolder}"`)
        } catch (err) {
            ans = false
            // log.warn(`🌐⚠️[uib-markweb:processConfig] Config folder is not accessible, using defaults. "${this.configFolder}" - ${err.message}`)
        }
    }
    return ans
}

/** Replace %%...% and {{...}}
 * @param {string} text Text to process
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [attributes] Attributes to use for replacements
 * @param {string} [calledFrom] Optional string indicating where this function was called from (for logging)
 * @returns {string} Processed text
 */
function processTemplates(text, node, attributes = {}, calledFrom = '') {
    // Supported %%...%% special directives and their callback. The function is called with (key, attributes, node, options)
    const specials = {
        'url': () => attributes.url,
        'nav': createNav,
        'search-results': searchResultsWrapper,
        // 'body': bodyWrapper,
        'body': () => attributes.body || '<div>No content</div>',
        // Return an index list of pages from the current page level
        'index': indexListing,
    }

    // Protect backtick-wrapped patterns from processing (e.g., `%%nav%%` or `{{title}}`)
    const protectedPatterns = []
    const protectPattern = (match) => {
        const placeholder = `__PROTECTED_${protectedPatterns.length}__`
        protectedPatterns.push(match)
        return placeholder
    }
    // Protect markdown backtick-wrapped patterns
    text = text.replace(/`(%%[^%]+%%|\{\{[^}]+\}\})`/g, protectPattern)

    // %%...%% specials
    const foundKeys = { specials: [], attributes: [], }
    text = text.replace(/%%([^%]+)%%/g, (match, key1, key2) => {
        let key = (key1 || key2).trim()
        // If key contains `[...]`, save the contents & remove from key
        const bracketIndex = key.indexOf('[')
        let bracketContent = null
        if (bracketIndex !== -1) {
            const endBracketIndex = key.indexOf(']', bracketIndex)
            if (endBracketIndex !== -1) {
                // make bracketContent into an object of key=value pairs by splitting first on , and then by key=value
                const bracketString = key.substring(bracketIndex + 1, endBracketIndex)
                bracketContent = {}
                bracketString.split(',').forEach((pair) => {
                    const [k, v] = pair.split('=').map(s => s.replace(/"/g, '').trim())
                    if (k) bracketContent[k] = v || ''
                })
                key = key.substring(0, bracketIndex).trim()
            }
        }
        foundKeys.specials.push(key)
        // If there is a specials function for specials[key], call it and return the result
        if (specials[key]) {
            return specials[key](key, attributes, node, bracketContent)
        }
        // Otherwise, return the attribute value if exists or the original special if not
        return attributes[key] !== undefined ? attributes[key] : match
    })

    // Protect HTML <code> wrapped patterns (after %%body%% inserts content with <code> tags)
    text = text.replace(/<code>(%%[^%]+%%|\{\{[^}]+\}\})<\/code>/gi, protectPattern)

    // {{...}} attributes
    text = text.replace(/\{\{([^}]+)\}\}/g, (match, key1, key2) => {
        const key = (key1 || key2).trim()
        foundKeys.attributes.push(key)
        return attributes[key] !== undefined ? attributes[key] : match
    })

    // Restore protected patterns (backtick-wrapped %%...%% or {{...}})
    protectedPatterns.forEach((pattern, index) => {
        text = text.replace(`__PROTECTED_${index}__`, pattern)
    })

    // console.log(`>>🌐[processTemplates] (${calledFrom}) foundKeys=`, foundKeys)
    return text
}

/** Read a configuration file from configFolder or fallback to package templates folder
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {string} fileName The name of the file to read
 * @returns {string|null} The file contents or null if not found or not readable
 */
function readConfigFile(node, fileName) {
    const log = uib.RED.log
    let content = null

    // First, try to read from configFolder
    if (node.configFolder) {
        const configPath = join(node.configFolder, fileName)
        try {
            accessSync(configPath, 'r')
            content = readFileSync(configPath, 'utf8')
            log.trace(`🌐[uib-markweb:readConfigFile] Read file from configFolder: "${configPath}"`)
        } catch (err) {
            // File not accessible in configFolder, try templates folder
            log.trace(`🌐[uib-markweb:readConfigFile] File not found or not readable in configFolder: "${configPath}". Will try default.`)
        }
    }

    if (content === null) {
        // Fallback to templates/.markweb-defaults folder in the package
        const templatesPath = join(__dirname, '..', '..', 'templates', '.markweb-defaults', fileName)
        try {
            accessSync(templatesPath, 'r')
            content = readFileSync(templatesPath, 'utf8')
            log.trace(`🌐[uib-markweb:readConfigFile] Read file from templates folder: "${templatesPath}"`)
        } catch (err) {
            log.warn(`🌐⚠️[uib-markweb:readConfigFile] File not found or not readable in either configFolder or templates: "${fileName}"`)
        }
    }

    // If the fileName extension is ".json", attempt to parse the content
    if (content && fileName.endsWith('.json')) {
        try {
            content = JSON.parse(content)
        } catch (err) {
            log.warn(`🌐⚠️[uib-markweb:readConfigFile] Failed to parse JSON file "${fileName}": ${err.message}`)
            // return null content
            content = null
        }
    }

    return content
}

/** Render a Map tree as nested UL HTML
 * @param {Map} map The tree map to render
 * @param {boolean} [sameLevel] Whether to render only files at the same level (skip folders)
 * @param {boolean} [nav] Whether this is for the nav directive, default=false
 * @param {number} [_level] Current recursion level (internal use)
 * @returns {string} Nested HTML unordered lists
 */
function renderTree(map, sameLevel = false, nav = false, _level = 0) {
    // Nothing to do
    if (map.size === 0) return ''
    // If not a nav menu, we need extra attributes so that the front-end can reflect changes
    let hOpts = ''
    if (_level === 0) hOpts = nav ? '' : 'data-attribute="index" data-replace'

    let html = `<ul ${hOpts}>`
    for (const [, entry] of map) {
        // Ignore samelevel in recursive calls
        const childHtml = renderTree(entry.children, false, nav, _level++)
        // If same level, skip folder entries (show only files)
        if (sameLevel && entry.path.endsWith('/')) {
            // Still include children if any
            if (childHtml) html += childHtml.replace(/^<ul>/, '').replace(/<\/ul>$/, '')
            continue
        }
        html += `<li><a href="${entry.path}">${entry.title}</a>${childHtml}</li>`
    }
    html += '</ul>'
    return html
}

/** Set up file watcher for the instance folder
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * param {string} node.sourcePath The source folder path
 * param {string} node.url The instance URL (used as watcher key)
 * param {object} node.log Node-RED log object
 */
function setupFileWatcher(node) {
    const log = uib.RED.log
    const sourcePath = node.instanceFolder
    const instanceUrl = node.url
    let rebuildTimeout = null
    const debounceMs = 1000 // Debounce rapid changes
    let changes = []

    try {
        // https://github.com/paulmillr/chokidar
        const watcher = node.watcher = chokidar.watch(sourcePath, {
            cwd: sourcePath,
            persistent: true,
            // Doesn't fire on initial setup
            ignoreInitial: true,
            // Only check up to 9 deep
            depth: 9,
            // Waits for writes to finish (adds 100ms polling, waits until stable for 2sec)
            // Also adds 2 sec delay when renaming files so try to do without.
            // awaitWriteFinish: true,
        })

        watcher.on('ready', () => {
            log.info(`🌐[uib-markweb:setupFileWatcher:${instanceUrl}] File watcher started for: ${sourcePath}`)
        })
        // WARNING: A file rename is an unlink & add event pair - can happen in any order
        watcher.on('all', (eventType, filename) => {
            log.info(`🌐[uib-markweb:watcher:${instanceUrl}] File event detected: ${eventType}, ${filename}`, performance.now())
            changes.push({ eventType, filename: urlJoin(filename), })
            // Debounce to avoid rebuilding multiple times for rapid changes
            if (rebuildTimeout) clearTimeout(rebuildTimeout)
            rebuildTimeout = setTimeout(async () => {
                const changesCopy = [...changes]
                changes = []
                log.info(`🌐[uib-markweb:watcher:${instanceUrl}] File/folder changes detected, rebuilding search index`)
                // (re)Build the search index
                try {
                    // Also notifies connected clients
                    await buildIndexes(node)
                } catch (err) {
                    log.error(`🌐🛑[uib-markweb:watcher:${instanceUrl}] Error rebuilding search index: ${err.message}`)
                    console.error(err)
                }
                // notify ALL connected clients that something changed
                node.sendToFe({
                    topic: '_source-change',
                    payload: {
                        instanceUrl: instanceUrl,
                        eventType: eventType,
                        url: urlJoin(filename),
                    },
                    changes: changesCopy,
                }, node, uib.ioChannels.control)
            }, debounceMs)
        })
        watcher.on('error', (error) => {
            console.error(`>>🌐[uib-markweb:watcher:${instanceUrl}] Watcher error: ${error}`)
        })
    } catch (err) {
        log.error(`🌐🛑[uib-markweb:setupFileWatcher:${instanceUrl}] Could not set up file watcher: ${err.message}`)
    }
}

/** Express handler for search API requests
 * @param {import('express').Request} req ExpressJS request object
 * @param {import('express').Response} res ExpressJS response object
 * @this {runtimeNode & uibMwNode}
 */
function searchHandler(req, res) {
    const log = uib.RED.log

    log.info(`🌐[uib-markweb:searchHandler] Search request received for "${this.url}". q="${req.query.q}"`)

    const query = (req.query.q || '').toString().toLowerCase()
        .trim()

    if (!query || query.length < 2) {
        res.json({ results: [], query, })
        return
    }

    const index = this.index
    if (index.size === 0) {
        log.warn(`🌐⚠️[uib-markweb:searchHandler:${this.url}] Search attempted but index is empty or not ready`)
        res.json({ results: [], query, message: 'Search index empty or not ready', })
        return
    }

    const results = doSearch(index, query)

    log.info(`🌐[uib-markweb:searchHandler] Search results: ${results.length} found`)
    res.json({ results: results.slice(0, 20), query, })
}

// #endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
