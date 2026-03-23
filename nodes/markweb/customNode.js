/* eslint-disable security/detect-non-literal-regexp */
// @ts-nocheck
/* eslint-disable jsdoc/valid-types */
/** Send a dynamic UI config to the uibuilder front-end library.
 * The FE library will update the UI accordingly.
 *
 * Copyright (c) 2025-2026 Julian Knight (Totally Information)
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
const {
    accessSync, copySync, existsSync, fgSync,
    readdirSync, readFile, readFileSync,
    stat, watch,
} = require('../libs/fs.cjs')
const { urlJoin, formatDateIntl, } = require('../libs/tilib.cjs')
const { setNodeStatus, } = require('../libs/uiblib.cjs') // Utility library for uibuilder
const sockets = require('../libs/socket.cjs')
const web = require('../libs/web.cjs')
// The uibuilder global configuration object, used throughout all nodes and libraries.
const uib = require('../libs/uibGlobalConfig.cjs')
// Used to show approx size of variables in bytes: serialize(variableName).byteLength
const { serialize, } = require('v8')

// Import my utility packages using npm workspaces
const { md, mdParse, directivePlugin, fmVariablesPlugin, fm, mermaid, } = require('@totallyinformation/uib-md-utils') // eslint-disable-line n/no-extraneous-require
const { chokidar, } = require('@totallyinformation/uib-fs-utils') // eslint-disable-line n/no-extraneous-require

/** Object tree of folders and files (typedef)
 * @typedef {object} FolderTree
 * @property {string} name - Name of the folder or file
 * @property {string} type - 'folder' or 'file'
 * @property {string} path - Path of the folder or file in URL form for matching to details if required
 * @property {FolderTree[]} [children] - Children if folder
 */

// ! TODO Move to fs lib
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

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    // evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'markweb',
    /** @type {string} Path to the default configuration folder */
    defaultConfigPath: join(__dirname, '..', '..', 'templates', '.markweb-defaults'),
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
    this.configFolder = config.configFolder ?? ''
    this.sourceFolder = '' // Used in web.instanceSetup(), should be ''

    // Make sure the url is valid & prefix with nodeRoot if needed
    this.url = urlJoin(uib.nodeRoot, this.url.trim())

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
    this.configFolder = this.configFolder.trim()
    // Check if configFolder exists and is readable - set watcher. Config will use default fldr if not
    processConfig(this)

    // Holder for page index - Map
    this.index = new Map()
    // Build page index asynchronously
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

    // Extend Markdown-IT with %%...%% directive & {{...}} variable processing
    mdExtension(this)

    // Clean up watchers on node close
    this.on('close', async () => {
        if (this.watcher) {
            await this.watcher.close()
            log.trace(`🌐[uib-markweb:close:${this.url}] File watcher closed`)
        }
        if (this.configWatcher) {
            await this.configWatcher.close()
            log.trace(`🌐[uib-markweb:close:${this.url}] Config watcher closed`)
        }
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
        'search': (msg) => {
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
        'navigate': doNavigate.bind(node),

        /** Internal control hook to return just the sidebar navigation HTML
         * @param {object} msg A control message with at least { currentPath: string }
         */
        'get-sidebar-nav': (msg) => {
            const returnTopic = '_sidebar-nav-result'
            const currentPath = msg.currentPath || '/'

            // Check for sidebar.json override in config folder (don't warn if not found)
            const sidebarOverride = readConfigFile(node, 'sidebar.json', true)

            let navIndexHtml
            if (sidebarOverride && Array.isArray(sidebarOverride)) {
                navIndexHtml = buildSidebarFromJson(sidebarOverride, currentPath)
            } else {
                const indexOptions = {
                    start: 0,
                    end: 3,
                    type: 'both',
                    sidebar: true,
                    id: 'sidebar-nav',
                    title: 'Sidebar navigation index',
                }
                const tree = createTree(false, { path: currentPath, }, indexOptions, node)
                navIndexHtml = renderSidebarTree(tree, { currentPath, })
            }

            node.sendToFe({
                topic: returnTopic,
                navHtml: navIndexHtml,
                _socketId: msg._socketId,
            }, node, uib.ioChannels.control)
        },
    }
}

// #region -- %%...%% specials processing (see processTemplates for calls) -- //

/** Render a date placeholder with optional formatting and frontmatter date types
 * @param {'date'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%date [options]%% instruction
 * @param {string} [options.type] Type of date to show: 'now' (default), 'created', 'updated', or any frontmatter date field
 * @param {string} [options.format] Date format string (default: 'YYYY-MM-DD'). Uses standard tokens. Underscore translates to space
 * @returns {string} Formatted date string
 */
function renderDate(key, attributes, node, options) {
    if (!options) options = {}

    const type = options.type || 'now'
    const format = options.format || 'YYYY-MM-DD'

    let date
    if (type === 'now') {
        // Use current date/time
        date = new Date()
    } else {
        // Try to get date from frontmatter attributes
        const dateValue = attributes[type]
        if (!dateValue) {
            // Date field not found in frontmatter
            return `[${type} date not found]`
        }
        date = new Date(dateValue)
        if (isNaN(date.getTime())) {
            // Invalid date value
            return `[Invalid ${type} date: ${dateValue}]`
        }
    }

    return formatDateIntl(date, format)
}

/** Wrap main content in a div#content & convert markdown to html
 * @param {'content'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%nav [options]%% instruction. Applied as html attributes to the wrapper div
 * @returns {string} Wrapped content as an html string
 */
// function bodyWrapper(key, attributes, node, options) {
//     console.log('🌐[bodyWrapper] options=', options)
//     let attrs = ''
//     if (options) {
//         attrs = Object.entries(options)
//             .map(([k, v]) => `${k}="${v}"`)
//             .join(' ')
//     }
//     let html = ''
//     try {
//         html = mdParse(attributes.content, attributes)
//     } catch (e) { /* ignore errors */ }
//     return `<div id="content" ${attrs} data-directive="body">${html || ''}</div>`
//     // return `<div id="content" ${attrs} data-directive="body">{{body}}</div>`
// }

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
    <nav data-directive="nav" data-replace aria-label="Main menu" class="${options?.orient || 'horizontal'}" role="navigation">
        ${links}
        ${searchBox}
    </nav>
    `
}

/** Parse a duration string into milliseconds
 * Duration format: number + type, e.g. '1w' (week), '1d' (day), '1m' (month), '1y' (year), '1h' (hour)
 * Number can be negative, e.g. '-1w' for 1 week offset
 * @param {string} durationStr - Duration string like '1w', '-2d', '3m'
 * @returns {number|null} Duration in milliseconds or null if invalid
 */
function parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return null

    const match = durationStr.trim().match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/) // eslint-disable-line security/detect-unsafe-regex
    if (!match) return null

    const value = parseFloat(match[1])
    const unit = match[2].toLowerCase()

    // Conversion factors to milliseconds
    const msPerSecond = 1000
    const msPerMinute = msPerSecond * 60
    const msPerHour = msPerMinute * 60
    const msPerDay = msPerHour * 24
    const msPerWeek = msPerDay * 7
    const msPerMonth = msPerDay * 30 // Approximate
    const msPerYear = msPerDay * 365 // Approximate

    const units = {
        s: msPerSecond,
        sec: msPerSecond,
        second: msPerSecond,
        seconds: msPerSecond,
        min: msPerMinute,
        minute: msPerMinute,
        minutes: msPerMinute,
        h: msPerHour,
        hr: msPerHour,
        hour: msPerHour,
        hours: msPerHour,
        d: msPerDay,
        day: msPerDay,
        days: msPerDay,
        w: msPerWeek,
        wk: msPerWeek,
        week: msPerWeek,
        weeks: msPerWeek,
        m: msPerMonth,
        mo: msPerMonth,
        month: msPerMonth,
        months: msPerMonth,
        y: msPerYear,
        yr: msPerYear,
        year: msPerYear,
        years: msPerYear,
    }

    if (!(unit in units)) return null

    return value * units[unit]
}

/** Create an HTML list of links to pages the current level or between the given levels
 * If start/end not provided, assume only the current level
 * @param {'index'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%nav [options]%% instruction
 * @param {string|number} [options.start] The starting depth level (0 = root)
 * @param {string|number} [options.end] The ending depth level (0 = root)
 * @param {string} [options.from] Start date/time for filtering (any JS Date() format)
 * @param {string} [options.to] End date/time for filtering (any JS Date() format, or 'now')
 * @param {string} [options.duration] Duration offset from from/to (e.g. '1w', '-2d', '3m')
 * @param {string|number} [options.latest] Return only the N most recent pages (sorted by updated/created date)
 * @returns {string} The generated navigation HTML
 */
function indexListing(key, attributes, node, options) {
    // Max depth default
    const maxDepth = 5

    let currentStart = false
    if (!options) options = {}

    if (!('nav' in options)) options.nav = false

    // Check if latest is specified - it changes default behavior for path/depth
    const hasLatest = 'latest' in options
    const hasExplicitStart = 'start' in options
    const hasExplicitEnd = 'end' in options || 'depth' in options
    const hasExplicitDateRange = 'from' in options || 'to' in options || 'duration' in options

    if (hasExplicitStart) {
        options.start = Number(options.start)
    } else if (hasLatest) {
        // When latest is specified without explicit start, use current page level
        options.start = Number(attributes.depth)
        currentStart = true
    } else {
        // No start given so assume current level
        options.start = Number(attributes.depth)
        currentStart = true
    }

    // if ('depth' in options) options.end = Number(options.depth)

    if ('end' in options) {
        options.end = Number(options.end)
    } else if ('depth' in options) {
        options.end = Number(options.start) + Number(options.depth)
    } else if (hasLatest) {
        // When latest is specified without explicit end or depth, use current page depth + max depth
        options.end = Number(attributes.depth) + maxDepth
    } else if (currentStart) {
        // When currentStart is specified without explicit end or depth, use start + max depth
        options.end = Number(attributes.depth) + maxDepth
        // options.end = Number(attributes.depth)
    } else {
        options.end = maxDepth // Max depth default
    }

    if (!('type' in options)) {
        // type can be 'files', 'folders', or 'both'
        options.type = 'both'
    }

    // Process date/time range filtering options (only if explicitly provided)
    // `from` and `to` accept date/time strings in any JS Date() recognized format
    // `to` can also be 'now' representing current date/time
    // `duration` can be used with either `from` or `to` (not both) as an offset
    // Duration format: number + type, e.g. '1w' (week), '1d' (day), '1m' (month), '1y' (year), '1h' (hour)
    // Number can be negative, e.g. '-1w' for 1 week ago
    if (hasExplicitDateRange) {
        const now = new Date()
        let fromDate = null
        let toDate = null

        // Parse 'to' first (may be 'now')
        if ('to' in options) {
            if (options.to.toLowerCase() === 'now') {
                toDate = now
            } else {
                toDate = new Date(options.to)
                if (isNaN(toDate.getTime())) toDate = null
            }
        }

        // Parse 'from'
        if ('from' in options) {
            fromDate = new Date(options.from)
            if (isNaN(fromDate.getTime())) fromDate = null
        }

        // Handle duration offset (only if one of from/to is missing)
        if ('duration' in options && !(fromDate && toDate)) {
            const offset = parseDuration(options.duration)
            if (offset !== null) {
                if (fromDate && !toDate) {
                    // from + duration = to
                    toDate = new Date(fromDate.getTime() + offset)
                } else if (toDate && !fromDate) {
                    // to - duration = from (note: offset is added, so negative duration goes back)
                    fromDate = new Date(toDate.getTime() - offset)
                } else if (!fromDate && !toDate) {
                    // No from or to, use now as base with duration
                    // Assume duration is relative to now, creating a range ending at now
                    toDate = now
                    fromDate = new Date(now.getTime() - offset)
                }
            }
        }

        // Store parsed dates in options for filteredIndex
        if (fromDate) options.fromDate = fromDate
        if (toDate) options.toDate = toDate
    }

    // Parse latest option - returns only the N most recent pages
    if ('latest' in options) {
        options.latest = Number(options.latest)
        if (isNaN(options.latest) || options.latest < 1) {
            delete options.latest // Invalid value, ignore
        }
    }

    const tree = createTree(currentStart, attributes, options, node)

    // If start and end levels are the same, omit folder (index) entries
    const sameLevel = options.start === options.end

    return renderTree(tree, options, sameLevel, options.nav, 0, attributes.path)
}

/** Create search results wrapper HTML
 * @param {'searchResults'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%search-results [options]%% instruction.
 * @returns {string} The generated search results HTML
 */
function searchResultsWrapper(key, attributes, node, options) {
    let headTxt
    if (options && options.head === 'short') {
        headTxt = '<span id="search-count">N/A</span> results'
    } else {
        headTxt = 'Search results for "<span id="search-query">N/A</span>" (<span id="search-count">N/A</span>)'
    }
    // console.log('🌐[searchResultsWrapper] options=', options)
    return /* html */`
        <article id="search-results" hidden>
            <div id="search-header">
                <span>${headTxt}</span>
                <button class="search-close" aria-label="Close search results">×</button>
            </div>
            <div id="search-details"></div>
        </article>
    `
}

/** Render a sidebar navigation tree with collapsible details/summary elements
 * @param {Map} map The tree map to render
 * @param {object} options Sidebar rendering options
 * @param {string} options.currentPath The current page path for highlighting
 * @param {number} [_level] Current recursion level (internal use)
 * @returns {string} Nested HTML with details/summary for collapsible sections
 */
function renderSidebarTree(map, options, _level = 0) {
    if (map.size === 0) return ''

    let html = '<ul>'
    for (const [, entry] of map) {
        const hasChildren = entry.children && entry.children.size > 0
        const isCurrentPage = options.currentPath === entry.path
            || options.currentPath === entry.path.replace(/\/$/, '')
        // const activeClass = isCurrentPage ? ' class="sidebar-active"' : ''
        const activeClass = isCurrentPage ? ' class="active-link"' : ''
        const titleAttr = entry.description ? ` title="${entry.description.replace(/"/g, '&quot;')}"` : ''

        if (hasChildren) {
            // Use details/summary for collapsible sections
            const childHtml = renderSidebarTree(entry.children, options, _level + 1)
            html += `<li>
                <details data-path="${entry.path}">
                    <summary${activeClass}${titleAttr}><a href="${entry.path}">${entry.title}</a></summary>
                    ${childHtml}
                </details>
            </li>`
        } else {
            html += `<li${activeClass}><a href="${entry.path}"${titleAttr}>${entry.title}</a></li>`
        }
    }
    html += '</ul>'
    return html
}

/** Create a hierarchical tree structure from the filtered index for sidebar or nav rendering
 * @param {boolean} currentStart Whether to use the current page's depth as the start level (true) or use options.start (false)
 * @param {object} attributes The current pages attributes
 * @param {object} indexOptions Options for filtering the index
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @returns {Map<string, {path: string, title: string, description: string, children: Map<string, any>}>} The hierarchical tree structure
 */
function createTree(currentStart, attributes, indexOptions, node) {
    const filtered = filteredIndex(currentStart, attributes, indexOptions, node)
    // if (!indexOptions.sidebar) console.log(`  >>🌐[markweb:createTree] Filtered index for ${attributes.toUrl}`, { currentStart, indexOptions, filtered, })
    // Build hierarchical tree from filtered index (similar to indexListing)
    const tree = new Map()
    for (const [path, doc] of filtered) {
        // Determine title - prefer shortTitle over title
        let title = doc.shortTitle || doc.title
        if (doc.path === '/') title = 'Home'
        else if (doc.type === 'folder' && (!title || title === 'index')) {
            const segments = doc.path.replace(/\/$/, '').split('/')
                .filter(Boolean)
            const rawTitle = segments[segments.length - 1] || doc.path.slice(1, -1)
            title = rawTitle.replace(/[_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        }
        // Split path into segments
        const segments = path
            .replace(/\/$/, '')
            .split('/')
            .filter(Boolean)
        if (segments.length === 0) {
            if (!tree.has('/')) {
                tree.set('/', {
                    path: '/',
                    title,
                    description: doc.description || '',
                    children: new Map(),
                })
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
                    description: isLast ? (doc.description || '') : '',
                    children: new Map(),
                })
            } else if (isLast) {
                const nodeEntry = current.get(segment)
                nodeEntry.path = path
                nodeEntry.title = title
                nodeEntry.description = doc.description || ''
            }
            current = current.get(segment).children
        }
    }
    return tree
}

/** Create sidebar HTML with navigation index, TOC, and search
 * @param {'sidebar'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options passed to the %%sidebar [options]%% instruction
 * @param {string} [options.search] Whether to include search box (default: 'true')
 * @param {string} [options.open] Whether sidebar starts open (default: 'true')
 * @param {string} [options.width] Default sidebar width (default: '20em')
 * @param {string} [options.start] Start depth for nav index (default: '0')
 * @param {string} [options.end] End depth for nav index (default: '5')
 * @param {string} [options.position] Sidebar position - 'left' or 'right' (default: 'left')
 * @returns {string} The generated sidebar HTML
 */
function createSidebar(key, attributes, node, options) {
    const log = uib.RED.log
    log.trace(`🌐[createSidebar] Creating sidebar for ${attributes.path}`, options)

    if (!options) options = {}

    // Parse options with defaults
    const showSearch = options.search !== 'false' // default=true
    const start = 'start' in options ? Number(options.start) : 0
    const end = 'end' in options ? Number(options.end) : 3 // 4 levels

    // Check for sidebar.json override in config folder (don't warn if not found)
    const sidebarOverride = readConfigFile(node, 'sidebar.json', true)

    // If we have a sidebar override, use it instead
    let navIndexHtml
    if (sidebarOverride && Array.isArray(sidebarOverride)) {
        // Build tree from sidebar.json structure
        navIndexHtml = buildSidebarFromJson(sidebarOverride, attributes.path)
    } else {
        // Build the navigation index using filtered index
        const indexOptions = {
            start,
            end,
            type: 'both',
            sidebar: true,
            id: 'sidebar-nav',
            title: 'Sidebar navigation index',
        }
        const tree = createTree(false, attributes, indexOptions, node)
        // Render the tree with collapsible sections
        navIndexHtml = renderSidebarTree(tree, { currentPath: attributes.path, })
    }

    // Generate data attributes for client-side use
    const dataAttrs = `data-directive="sidebar"`

    // Build the search box & results HTML if enabled
    const searchBoxHtml = showSearch
        ? /* html */`
            <search>
                <form id="search-form" role="search" onsubmit="return false">
                    <input type="search" id="search-input"
                        placeholder="Search..." aria-label="Search pages"
                    >
                </form>
            </search>
            ${searchResultsWrapper(key, attributes, node, { head: 'short', })}
        `
        : ''

    // Build the complete sidebar HTML
    return /* html */`
        <div id="sidebar-resizer" title="Resize sidebar">
            <label id="sidebar-toggle" class="sidebar-toggle" title="Toggle sidebar">
                <input type='checkbox'>
                <span></span><span></span><span></span>
            </label>
        </div>
        <aside id="sidebar" ${dataAttrs} aria-label="Page sidebar">
            <div class="sidebar-content">
                ${searchBoxHtml}
                <div class="sidebar-tabs" role="tablist">
                    <button id="sidebar-tab-nav" class="sidebar-tab active" role="tab" aria-selected="true" aria-controls="sidebar-panel-nav">
                        Navigation
                    </button>
                    <button id="sidebar-tab-toc" class="sidebar-tab" role="tab" aria-selected="false" aria-controls="sidebar-panel-toc">
                        Contents
                    </button>
                </div>
                <uib-var id="sidebar-panel-nav" class="sidebar-panel active" role="tabpanel" aria-labelledby="sidebar-tab-nav" variable="sidebar-nav" type="html">
                    ${navIndexHtml}
                </uib-var>
                <div id="sidebar-panel-toc" class="sidebar-panel" role="tabpanel" aria-labelledby="sidebar-tab-toc" hidden>
                    <nav id="sidebar-toc" aria-label="Table of contents">
                        <!-- TOC generated client-side from page headings -->
                        <uib-var variable="sidebar-toc" type="html">
                            <p>Table of contents will appear here based on page headings.</p>
                        </uib-var>
                    </nav>
                </div>
            </div>
        </aside>
    `
}

/** Build sidebar navigation from a sidebar.json override file
 * @param {Array<object>} items Array of sidebar items from sidebar.json
 * @param {string} currentPath The current page path for highlighting
 * @returns {string} HTML for the sidebar navigation
 */
function buildSidebarFromJson(items, currentPath) {
    if (!items || !Array.isArray(items) || items.length === 0) return ''

    let html = '<ul>'
    for (const item of items) {
        const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0
        const isCurrentPage = currentPath === item.path
        const activeClass = isCurrentPage ? ' class="sidebar-active"' : ''
        const titleAttr = item.description ? ` title="${item.description.replace(/"/g, '&quot;')}"` : ''
        const title = item.shortTitle || item.title || item.path

        if (hasChildren) {
            const childHtml = buildSidebarFromJson(item.children, currentPath)
            html += `<li>
                <details data-path="${item.path}">
                    <summary${activeClass}${titleAttr}><a href="${item.path}">${title}</a></summary>
                    ${childHtml}
                </details>
            </li>`
        } else {
            html += `<li${activeClass}><a href="${item.path}"${titleAttr}>${title}</a></li>`
        }
    }
    html += '</ul>'
    return html
}

/** Render copyright information from template
 * @param {'copyright'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options (not used for copyright)
 * @returns {string} Formatted copyright HTML
 */
function renderCopyright(key, attributes, node, options) {
    // Read the copyright template file (with fallback to default)
    const template = readConfigFile(node, 'copyright-template.html', true)

    if (!template) {
        // If no template found, return a basic fallback
        return 'Copyright © All rights reserved.'
    }

    // Process the template to replace any nested directives and variables
    // This allows the template to use %%date%% and {{author}} etc.
    return processTemplates(template, node, attributes, 'renderCopyright')
}

/** Add more markdown-it extensions along with their handlers
 * Has to be done here so that the handlers can pick up page attributes and node content.
 * "Standard" markdown-it extensions (e.g., footnotes, task lists) are added in uib-md-utils
 *   as they don't need access to page attributes.
 * NOTE: Handlers receive:
 *       args: `[argname=value, ...]` arguments object
 *       env: The page attributes, AKA the page's frontmatter variables
 * @param {runtimeNode & uibMwNode} node The current node instance
 */
function mdExtension(node) {
    /** Handler functions for each specific directive */
    const directiveHandlers = {
        // 'date': renderDate,
        // 'nav': createNav,
        // 'offset': parseDuration,
        // Return an index list of pages from the current page level
        index: (args, env) => {
            const il = indexListing('index', env, node, args)
            // console.log('🌐[mdExtension:index] ', {il, args, env})
            return il
        },
        // 'url': () => attributes.url,
        // 'search-results': searchResultsWrapper,
        // 'sidebar': createSidebar,
        // 'content': bodyWrapper,
        // 'content': () => attributes.content || '<div>No content</div>',
        // 'copyright': renderCopyright,
    }
    /** Convert {{varname}} to HTML spans with the variable value from frontmatter attributes
     * This allows using frontmatter variables anywhere in markdown content AND in Templates
     * @param {object} args The [args] object passed from the markdown content
     * @param {object} env The page attributes, AKA the page's frontmatter variables
     * @returns {string} The rendered HTML for the fm variable
     */
    const fmVariablesHandler = (args, env) => {
        const varName = args.varName
        let value = env[varName]
        let errClass = ''
        if (value === undefined) {
            value = `[Unknown variable: "${varName}"]`
            errClass = ' variable-unknown'
        }
        // process standard args
        let before = ''
        if (args.before) before = args.before
        else if (args.prefix) before = args.prefix
        let after = ''
        if (args.after) after = args.after
        // Wrap in dummy element with data attribute for client-side processing
        return /* html */`<fm-var class="fm-${varName}${errClass}" data-fmvar="${varName}">${before}${value}${after}</fm-var>`
    }
    // Extend markdown-it with these plugins
    md
        .use(directivePlugin, directiveHandlers)
        .use(fmVariablesPlugin, fmVariablesHandler)
}

// #endregion -- %%...%% specials processing -- //

/** Build search & nav indexes from all markdown files asynchronously & notifies connected clients
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @returns {Promise<void>}
 */
async function buildIndexes(node) {
    const log = uib.RED.log
    const strt = performance.now()
    const url = node.url
    const instanceFolder = node.instanceFolder

    const index = node.index
    const indexFolder = instanceFolder.replace(/\\/g, '/')

    node.isIndexing = true

    // TODO: Use async fg
    let files
    try {
        files = fgSync(`${indexFolder}/**/*.md`)
    } catch (e) {
        log.error(`🌐🛑[uib-markweb:buildIndex:${url}] Error reading markdown files from source folder "${indexFolder}": ${e.message}`)
        files = []
    }

    node.isIndexing = false

    // Process all files in parallel - updates index if needed
    // ! WARNING: While this is fast, it adds index entries in a semi-random order !
    const results = await Promise.allSettled(
        files.map(file => getMarkdownFile(node, file))
    )

    // Collect valid paths from results and log any errors
    const validPaths = new Set()
    results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value?.path) {
            validPaths.add(result.value.path)
        } else if (result.status === 'rejected') {
            log.error(`🌐🛑[uib-markweb:buildIndex:${url}] Skipping file "${files[i]}" due to error: ${result.reason.message}`)
        }
    })

    // Remove stale index entries for files that no longer exist
    for (const key of index.keys()) {
        if (!validPaths.has(key)) {
            log.trace(`🌐[uib-markweb:buildIndex:${url}] Removing stale index entry: "${key}"`)
            index.delete(key)
        }
    }

    // notify ALL connected clients that indexes have changed
    node.sendToFe({
        topic: '_indexes-changed',
    }, node, uib.ioChannels.control)

    // ! TEMPORARY - for debugging convenience
    globalThis._uibuilder_.markweb.indexes[url] = node.index

    log.info(`🌐[uib-markweb:buildIndex:${url}] Indexed "${instanceFolder}" in ${Math.round(performance.now() - strt)}ms. ${files.length} files, ${(serialize(node.index).byteLength / 1024).toFixed(0)}kb`)
}

/** Build a list of navigable pages from all markdown files in the source folder
 * @param {string} sourcePath Source folder path
 * @returns {Array<{path: string, title: string, file: string}>} Array of navigation items
 */
// function buildNavigationIndex(sourcePath) {
//     try {
//         const files = fgSync(`${sourcePath.replace(/\\/g, '/')}/**/*.md`)
//         return files.map((file) => {
//             const relativePath = relative(sourcePath, file).replace(/\\/g, '/')
//             const urlPath = relativePath.replace(/\.md$/, '')
//             const title = basename(file, '.md')
//                 .replace(/-/g, ' ')
//                 .replace(/\b\w/g, c => c.toUpperCase())
//             return { path: urlPath, title, file: relativePath, }
//         })
//     } catch (e) {
//         return []
//     }
// }

/** Check if the requested path is valid and does not violate security rules (e.g., no access to files/folders starting with _ or ., no path traversal)
 * @param {runtimeNode & uibMwNode} node The node instance
 * @param {string} morePath Everything in the URI after the main path
 * @param {object} attributes Page attributes to send back to the browser
 * @param {string} returnTopic Message topic to send back tot he browser
 * @param {object} msg Received message object, used to retreive the socket id
 * @param {string} from What fn name called this fn, used for messages
 * @param {import('express').Response} [res] ExpressJS Result object. If used, previous 3 params are ignored
 * @param {boolean} [isAjax] Whether this request is an AJAX request (only used if res is provided) to determine response format
 * @returns {{fullPath:string, parsedPath:import('path').ParsedPath}|null} The full and corrected actual paths to be processed
 */
function checkNames(node, morePath, attributes, returnTopic, msg, from, res, isAjax) {
    const log = uib.RED.log
    // console.log(`🌐[uib-markweb:nodeInstance:checkNames] (from: ${from}) Checking access for "${morePath}"`)

    // Check if folder or file name starts with _ or . and deny access
    if (morePath.split(sep).some(part => part.startsWith('_') || part.startsWith('.'))) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:${from}] Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`)
        if (res) {
            res.status(403).send(`<p>Folders or files starting with "_" or "." are not accessible.</p>`)
        } else {
            // @ts-ignore
            attributes = {
                error: true,
                title: 'Error',
                description: `Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`,
                content: `<h1>Error</h1><p>Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."</pre>`,
                from: from,
            }
            this.sendToFe({
                topic: returnTopic,
                attributes: attributes,
                _socketId: msg._socketId,
            }, node, uib.ioChannels.control)
        }
        return null
    }
    // Normalize morePath to prevent path traversal attacks
    let fullPath = join(node.instanceFolder, morePath)
    // Security: Prevent path traversal
    if (!fullPath.startsWith(node.instanceFolder)) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:${from}] Access denied to "${fullPath}" because it is outside "${node.instanceFolder}"`)
        if (res) {
            res.status(403).send(`Access denied`)
        } else {
            // @ts-ignore
            attributes = {
                error: true,
                title: 'Error',
                description: `Access denied to "${fullPath}" because it is outside "${node.instanceFolder}"`,
                content: `<h1>Error</h1><p>Access denied to "${fullPath}" because it is outside "${node.instanceFolder}"</pre>`,
                from: from,
            }
            this.sendToFe({
                topic: returnTopic,
                attributes: attributes,
                _socketId: msg._socketId,
            }, node, uib.ioChannels.control)
        }
        return null
    }

    // If morePath has no extension, first check if it is a valid folder
    let parsedPath = parse(morePath)
    if (!parsedPath.ext) {
        if (existsSync(fullPath)) {
            // The folder exists, we assume the index file needed
            morePath = join(morePath, 'index.md')
            fullPath = join(node.instanceFolder, morePath)
        } else {
            // Not a folder, so add .md extension
            morePath += '.md'
            fullPath = join(node.instanceFolder, morePath)
        }
        parsedPath = parse(morePath)
    }

    // Now check that the file exists, return an error if not
    try {
        accessSync( fullPath, 'r' )
        log.trace(`🌐[uib-markweb:nodeInstance:checkNames] (from: ${from}) Source file is accessible: "${fullPath}"`)
    } catch (err) {
        // const file404 = readConfigFile(this, '404-template.md', false)
        log.error(`🌐🛑[uib-markweb:nodeInstance:checkNames] (from: ${from}) Source file "${fullPath}" not accessible: ${err.message}`)
        if (res) {
            if (isAjax) {
                res.status(404).json({ error: 'Page not found', content: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>', })
            } else {
                // const nav = buildNavigation()
                res.status(404).send(htmlTemplate(node, { content: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>', }))
            }
        } else {
            // @ts-ignore
            attributes = {
                error: 'Page not accessible or not found',
                title: 'Error',
                description: `The requested page does not exist or cannot be read.`,
                content: `<h1>Page Not Found</h1><p>The requested page does not exist or cannot be read.</p>`,
                from: from,
            }
            node.sendToFe({
                topic: returnTopic,
                attributes: attributes,
                _socketId: msg._socketId,
            }, node, uib.ioChannels.control)
        }
        return null
    }

    return { fullPath, parsedPath, }
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

    const paths = checkNames(this, morePath, attributes, returnTopic, msg, 'doNavigate', null, null)
    if (!paths) return // nothing more to do
    const { fullPath, parsedPath, } = paths

    // Handle markdown files
    if (parsedPath.ext === '.md') {
        // processTemplates(node.pageTemplate, attributes)
        attributes = await getMarkdownFile(this, fullPath, morePath, parsedPath, 'doNavigate')
        attributes.content = mdParse(attributes.content || '', attributes) // Pre-render markdown content to HTML for display in metadata panel
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
    const sorted = [...node.index]
        .sort((a, b) => a[1].path.localeCompare(b[1].path))

    // For file pages, use the parent folder as the path prefix so sibling entries are included
    const pathPrefix = currentStart
        ? (attributes.path.endsWith('/')
            ? attributes.path
            : attributes.path.substring(0, attributes.path.lastIndexOf('/') + 1))
        : ''

    let filtered = sorted
        .filter( ([key, value]) => {
            // Depth filtering
            if (value.depth < options.start || value.depth > options.end) return false
            // Path prefix filtering
            if (currentStart && !value.path.startsWith(pathPrefix)) return false
            // Type filtering
            if (options.type === 'folders' && value.type !== 'folder') return false
            if (options.type === 'files' && value.type !== 'file') return false

            // Date range filtering (uses 'updated' or 'created' attribute)
            if (options.fromDate || options.toDate) {
                // Prefer 'updated', fall back to 'created'
                const docDateStr = value.updated || value.created
                if (!docDateStr) return false // No date to filter on

                const docDate = new Date(docDateStr)
                if (isNaN(docDate.getTime())) return false // Invalid date

                if (options.fromDate && docDate < options.fromDate) return false
                if (options.toDate && docDate > options.toDate) return false
            }

            return true
        })
    // console.log(`  >>🌐[filteredIndex] Filtering index for ${attributes.path} with options`, { filtered, sorted, options, })

    // If latest option specified, sort by date descending and limit results
    if (options.latest) {
        // Sort by updated (or created) date, most recent first
        filtered.sort((a, b) => {
            const dateA = new Date(a[1].updated || a[1].created || 0)
            const dateB = new Date(b[1].updated || b[1].created || 0)
            return dateB.getTime() - dateA.getTime() // Descending (newest first)
        })
        // Limit to the specified number
        filtered = filtered.slice(0, options.latest)
    } else {
        // TODO: Allow options.sort to specify sorting field(s) and order
        // Default sort by path
        filtered.sort((a, b) => a[1].path.localeCompare(b[1].path))
    }

    return filtered
}

/** Get and parse a markdown file called from buildIndexes
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {string} file FS path to the markdown file
 * param {string} fullPath Full path to the markdown file
 * @param {string} [morePath] Relative path or additional path info
 * @param {object} [parsedPath] Parsed path object
 * @param {string} [from] The name of the calling function for logging purposes
 * @returns {Promise<object>} Parsed attributes and HTML body
 */
async function getMarkdownFile(node, file, morePath, parsedPath, from) {
    // fullPath, morePath, parsedPath
    const log = uib.RED.log
    const userDir = uib.RED.settings.userDir
    log.trace(`🌐[uib-markweb:getMarkdownFile:${node.url}] Request for markdown file from ${from}, source="${node.source}", file="${file}"`)

    const index = node.index

    // check if urlPath already exists in the page index
    // get the actual filename without the path
    const filename = basename(file)
    // Skip files starting with _ or .
    if (filename.startsWith('_') || filename.startsWith('.')) {
        return {}
    }

    const relativePath = relative(join(userDir, node.source), file)
        .replace(/\\/g, '/')
    // Replace trailing .md and whole `index` filename with empty string to get the URL path
    const urlPath = '/' + relativePath
        .replace(/\.md$/, '')
        .replace(/\/index$/, '/')

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
    // check if urlPath already exists in the page index and if the file has not been modified since last indexed (using fsMtimeMs)
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
                content: `<h1>Error</h1><p>There was an error reading the requested markdown file.</p><pre>${err.message}</pre>`,
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
                content: `<h1>Error</h1><p>There was an error parsing the front-matter in the requested markdown file.</p><pre>${err.message}</pre>`,
            }
        }

        // Generate title from filename if not in front-matter: remove .md, convert _ to space, capitalize first char
        let derivedTitle
        const fileName = basename(file, '.md')
        if (fileName === 'index') {
            // Use the last segment of the path as the name
            const segments = file.split(/[\\\/]/)
            derivedTitle = segments[segments.length - 2].replace(/_/g, ' ')
        } else {
            derivedTitle = fileName.replace(/_/g, ' ')
        }
        derivedTitle = derivedTitle.charAt(0).toUpperCase() + derivedTitle.slice(1)

        attributes = {
            ...node.globalAttributes || {},
            ...parsed.attributes || {},
            title: parsed.attributes?.title || derivedTitle,
            shortTitle: parsed.attributes?.shortTitle || '',
            description: parsed.attributes?.description || '',
            // Store plain text for searching
            // ! DO NOT Convert MD to HTML here - we want the raw markdown content in the index for searching, and we can convert to HTML on the fly when rendering pages. Also, converting here would mean we lose the original markdown formatting in the index, which could be useful for other purposes (e.g., generating excerpts, showing raw markdown in search results, etc).
            content: parsed.body || '',
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
            from: from,
            // other: [morePath, parsedPath],
        }
        // Update the index for this path with the new attributes
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
    // Strip hash/fragment identifiers (e.g., #section) as they are client-side only
    if (morePath.includes('#')) morePath = morePath.split('#')[0]

    // Handle a search request
    // Get route extended parameter if present
    if (morePath === '.search' || morePath === '_search') {
        searchHandler.bind(this)(req, res)
        return
    }

    const paths = checkNames(this, morePath, null, null, null, 'handler', res, isAjax)
    if (paths === null) return // nothing more to do
    const { fullPath, parsedPath, } = paths
    // console.log(`🌐[uib-markweb:handler] Request`, {for: req.originalUrl, parsedMorePath: morePath, fullPath: fullPath, ext: parsedPath.ext, isAjax: isAjax})

    // Handle markdown files
    if (parsedPath.ext === '.md') {
        const attributes = await getMarkdownFile(this, fullPath, morePath, parsedPath, 'handler')
        attributes.reqType = isAjax ? 'ajax' : 'get'
        if (isAjax) {
            // Return JSON for SPA navigation
            res.json(attributes)
        } else {
            // Return full page for initial load / direct access
            const html = htmlTemplate(this, attributes)
            res.send(html)
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
    node.pageTemplate = readConfigFile(node, 'page-template.html', false) || ''
    node.globalAttributes = readConfigFile(node, 'global-attributes.json', false) || {}
    attributes = { ...node.globalAttributes, ...attributes, }
    attributes.url = node.url
    // add the markdown body
    // if (!attributes.content) {
    //     attributes.content = '## Error: No content (htmlTemplate)\n\nThe requested page has no content.'
    // } else {
    //     try {
    //         // attributes.content = marked(processTemplates(attributes.content, attributes))
    //         attributes.content = processTemplates(attributes.content, attributes) || '<h2>Error: (htmlTemplate)</h2><div>processTemplates produced no output.</div>'
    //         // attributes.content = mdParse(attributes.content)
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

/** Render a prescript block that safely assigns page attributes to window.pageData at load time
 * Uses base64 encoding to prevent processTemplates from matching {{...}} or %%...%%
 * patterns inside the serialized JSON, and to avoid <script> tag injection issues.
 * @param {'prescript'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [options] Optional options (not used)
 * @returns {string} JavaScript code to embed in a script tag
 */
function renderPrescript(key, attributes, node, options) {
    // Base64 encode the JSON to avoid:
    //   1. processTemplates replacing {{...}} / %%...%% patterns found inside the JSON
    //   2. </script> or other HTML-breaking sequences in the content
    const b64 = Buffer.from(JSON.stringify(attributes)).toString('base64')
    const content = Buffer.from(mdParse(attributes.content, attributes)).toString('base64')
    return `<script>
    window.baseUrl = '${node.url}';
    window.pageData = JSON.parse(atob('${b64}'));
    window.pageData.content = atob('${content}');
</script>`
}

/** Check if this.configFolder exists and is readable
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @returns {boolean|null} True if configFolder exists and is readable, false if not, null if not set
 */
function processConfig(node) {
    const RED = uib.RED
    const log = RED.log
    let ans = null

    if (node.configFolder && node.configFolder.length > 0) {
        // if configFolder is a relative path, make it relative to userDir
        if (!isAbsolute(node.configFolder)) {
            node.configFolder = join(RED.settings.userDir, node.configFolder)
        }
        // Check if configFolder exists and is readable? Config will use defaults if not
        try {
            accessSync( node.configFolder, 'r' )
            ans = true
            // log.trace(`🌐[uib-markweb:processConfig] Config folder is accessible. "${node.configFolder}"`)
        } catch (err) {
            ans = false
            log.warn(`🌐⚠️[uib-markweb:processConfig:${node.url}] Config folder is not accessible, using defaults. "${node.configFolder}"`)
        }
    } else {
        ans = false
    }
    // For some reason, either configFolder not set or not accessible, fall back to default
    if (ans === true) {
        // If configFolder is valid, copy default config files but do not overwrite
        try {
            copySync(mod.defaultConfigPath, node.configFolder)
        } catch (e) { /* ignore errors */ }
    } else {
        node.configFolder = mod.defaultConfigPath
    }
    // Config folder watcher (sets this.configWatcher so it can be cancelled)
    setupConfigWatcher(node)
    return ans
}

/** Replace %%...% and {{...}}
 * @param {string} htmlText HTML string to process
 * @param {runtimeNode & uibMwNode} node The current node instance
 * @param {object} [attributes] Attributes to use for replacements
 * @param {string} [calledFrom] Optional string indicating where this function was called from (for logging)
 * @returns {string} Processed text
 */
function processTemplates(htmlText, node, attributes = {}, calledFrom = '') {
    // Supported %%...%% special directives and their callback. The function is called with (key, attributes, node, options)
    const specials = {
        'url': () => attributes.url,
        'nav': createNav,
        'search-results': searchResultsWrapper,
        'sidebar': createSidebar,
        // 'content': bodyWrapper,
        'content': () => mdParse(attributes.content, attributes) || '<div>No content</div>',
        // Return an index list of pages from the current page level
        'index': indexListing,
        'date': renderDate,
        'copyright': renderCopyright,
        // Adds a script tag to create window.pageData BEFORE uibuilder and markweb libraries load
        'prescript': renderPrescript,
    }

    // Protect backtick-wrapped patterns from processing (e.g., `%%nav%%` or `{{title}}`)
    const protectedPatterns = []
    const protectPattern = (match) => {
        const placeholder = `__PROTECTED_${protectedPatterns.length}__`
        protectedPatterns.push(match)
        return placeholder
    }
    // Protect markdown backtick-wrapped patterns
    htmlText = htmlText.replace(/`(%%[^%]+%%|\{\{[^}]+\}\})`/g, protectPattern)

    // %%...%% specials
    const foundKeys = { specials: [], attributes: [], }
    const activeDirectives = new Set()
    htmlText = htmlText.replace(/%%([^%]+)%%/g, (match, key1, key2) => {
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
            activeDirectives.add(key)
            return specials[key](key, attributes, node, bracketContent)
        }
        // Otherwise, return the attribute value if exists or the original special if not
        return attributes[key] !== undefined ? attributes[key] : match
    })

    // Save the directives keys found in the text for logging/debugging
    if (!node.globalAttributes) node.globalAttributes = {}
    if (!node.globalAttributes.directives) node.globalAttributes.directives = {}
    node.globalAttributes.directives[calledFrom] = [...activeDirectives]

    // Protect HTML <code> wrapped patterns (after %%body%% inserts content with <code> tags)
    htmlText = htmlText.replace(/<code>(%%[^%]+%%|\{\{[^}]+\}\})<\/code>/gi, protectPattern)

    // {{...}} attributes
    htmlText = htmlText.replace(/\{\{([^}]+)\}\}/g, (match, key1, key2) => {
        const key = (key1 || key2).trim()
        foundKeys.attributes.push(key)
        let value = attributes[key] !== undefined ? attributes[key] : match
        // If the value is an object or array, convert to JSON string
        if (typeof value === 'object') {
            try {
                value = JSON.stringify(value)
            } catch (e) {
                value = String(value)
            }
        }
        // If key is "content", replace with html conversion
        if (value && key === 'content') value = mdParse(value, attributes)
        return value
    })

    // Restore protected patterns (backtick-wrapped %%...%% or {{...}})
    protectedPatterns.forEach((pattern, index) => {
        htmlText = htmlText.replace(`__PROTECTED_${index}__`, pattern)
    })

    // console.log(`>>🌐[processTemplates] (${calledFrom}) foundKeys=`, foundKeys)
    return htmlText
}

/** Read a configuration file from configFolder or fallback to package templates folder
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {string} fileName The name of the file to read
 * @param {boolean} [optional] If true, will not log a warning if the file is not found or readable
 * @returns {string|null} The file contents or null if not found or not readable
 */
function readConfigFile(node, fileName, optional = false) {
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
        const templatesPath = join(mod.defaultConfigPath, fileName)
        try {
            accessSync(templatesPath, 'r')
            content = readFileSync(templatesPath, 'utf8')
            log.trace(`🌐[uib-markweb:readConfigFile] Read file from templates folder: "${templatesPath}"`)
        } catch (err) {
            if (optional === false) {
                log.warn(`🌐⚠️[uib-markweb:readConfigFile] File not found or not readable in templates folder: "${templatesPath}". ${err.message}`)
            }
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
 * @param {object} [options] Optional options for rendering
 * @param {boolean} [sameLevel] Whether to render only files at the same level (skip folders)
 * @param {boolean} [nav] Whether this is for the nav directive, default=false
 * @param {number} [_level] Current recursion level (internal use)
 * @param {string} [currentPath] Current page path for active link highlighting
 * @returns {string} Nested HTML unordered lists
 */
function renderTree(map, options, sameLevel = false, nav = false, _level = 0, currentPath = '') {
    if (!map || map.size === 0) return ''
    let html = _level > 0 ? '<ul>' : '<ul class="tree">'
    for (const [, entry] of map) {
        // Ignore samelevel in recursive calls
        const childHtml = renderTree(entry.children, null, false, nav, _level + 1, currentPath)
        // If same level, skip folder entries (show only files)
        if (sameLevel && entry.path.endsWith('/')) {
            // Still include children if any
            if (childHtml) html += childHtml.replace(/^<ul>/, '').replace(/<\/ul>$/, '')
            continue
        }
        const hasChildren = entry.children && entry.children.size > 0
        const isActive = currentPath && (currentPath === entry.path || currentPath === entry.path.replace(/\/$/, ''))
        const titleAttr = entry.description ? ` title="${entry.description.replace(/"/g, '&quot;')}"` : ''
        if (hasChildren) {
            const folderClass = isActive ? 'tree-folder active-link' : 'tree-folder'
            // Use details/summary for collapsible folder sections
            html += `
            <li class="${folderClass}">
                <details open data-path="${entry.path}">
                    <summary${titleAttr}><a href="${entry.path}">${entry.title}</a></summary>
                    ${childHtml}
                </details>
            </li>
            `
        } else {
            const activeClass = isActive ? ' class="active-link"' : ''
            html += `<li${activeClass}><a href="${entry.path}"${titleAttr}>${entry.title}</a></li>`
        }
    }
    html += '</ul>'
    // console.log(`>>🌐[renderTree] Rendered tree (sameLevel=${sameLevel}, nav=${nav}):`, html)
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

/** Set up file watcher for the config folder
 * Notifies connected clients when config files change so they can reload the page.
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 */
function setupConfigWatcher(node) {
    const log = uib.RED.log
    const configPath = node.configFolder
    const instanceUrl = node.url
    let notifyTimeout = null
    const debounceMs = 500 // Debounce rapid changes
    const isDefault = configPath === mod.defaultConfigPath

    // Skip if configFolder is not set or not accessible
    if (!configPath) {
        log.trace(`🌐[uib-markweb:setupConfigWatcher:${instanceUrl}] No config folder set, skipping config watcher`)
        return
    }
    try {
        accessSync(configPath, 'r')
    } catch (err) {
        log.trace(`🌐[uib-markweb:setupConfigWatcher:${instanceUrl}] Config folder not accessible, skipping config watcher: ${configPath}`)
        return
    }

    try {
        const configWatcher = node.configWatcher = chokidar.watch(configPath, {
            cwd: configPath,
            persistent: true,
            ignoreInitial: true,
            depth: 5,
        })

        configWatcher.on('ready', () => {
            if (!isDefault) log.info(`🌐[uib-markweb:setupConfigWatcher:${instanceUrl}] Config watcher started for: ${configPath}`)
        })

        configWatcher.on('all', (eventType, filename) => {
            log.info(`🌐[uib-markweb:configWatcher:${instanceUrl}] Config file event: ${eventType}, ${filename}`)

            // Debounce to avoid notifying multiple times for rapid changes
            if (notifyTimeout) clearTimeout(notifyTimeout)
            notifyTimeout = setTimeout(async () => {
                // If global-attributes.json changed, rebuild the index since these are merged into all pages
                if (filename === 'global-attributes.json') {
                    log.info(`🌐[uib-markweb:configWatcher:${instanceUrl}] global-attributes.json changed, rebuilding index`)
                    // Clear globalAttributes cache so it will be re-read
                    node.globalAttributes = null
                    try {
                        await buildIndexes(node)
                    } catch (err) {
                        log.error(`🌐🛑[uib-markweb:configWatcher:${instanceUrl}] Error rebuilding index after global-attributes change: ${err.message}`)
                    }
                }

                log.info(`🌐[uib-markweb:configWatcher:${instanceUrl}] Config file(s) changed, notifying all clients to reload`)

                // Notify ALL connected clients that config changed - they should reload the current page
                node.sendToFe({
                    topic: '_config-change',
                    payload: {
                        instanceUrl: instanceUrl,
                        eventType: eventType,
                        file: filename,
                    },
                }, node, uib.ioChannels.control)
            }, debounceMs)
        })

        configWatcher.on('error', (error) => {
            console.error(`>>🌐[uib-markweb:configWatcher:${instanceUrl}] Config watcher error: ${error}`)
        })
    } catch (err) {
        log.error(`🌐🛑[uib-markweb:setupConfigWatcher:${instanceUrl}] Could not set up config watcher: ${err.message}`)
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
