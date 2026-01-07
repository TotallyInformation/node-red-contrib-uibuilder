/* eslint-disable jsdoc/valid-types */
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
const { watch, } = require('node:fs')

const { accessSync, existsSync, fgSync, readFile, readFileSync, stat, } = require('../libs/fs.cjs')
const { urlJoin, } = require('../libs/tilib.cjs')
const { setNodeStatus, } = require('../libs/uiblib.cjs') // Utility library for uibuilder
const sockets = require('../libs/socket.cjs')
const web = require('../libs/web.cjs')
// The uibuilder global configuration object, used throughout all nodes and libraries.
const uib = require('../libs/uibGlobalConfig.cjs')
// Used to show approx size of variables in bytes: serialize(variableName).byteLength
const { serialize, } = require('v8')

// Import the bundled marked and front-matter libraries
const { marked, fm, } = require('@totallyinformation/uib-md-utils') // eslint-disable-line n/no-extraneous-require

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    // evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-markweb',
}

/** @type {Map<string, Map<string, object>>} Search indexes keyed by instance URL */
const indexes = new Map()
/** @type {Map<string, Map<string, object>>} Navigation indexes keyed by instance URL */
const navIndexes = new Map()
/** @type {Map<string, import('node:fs').FSWatcher>} File watchers keyed by instance URL */
const fileWatchers = new Map()

// #endregion ----- Module level variables ---- //

/** 1) Complete module definition for our Node. This is where things actually start.
 * @param {runtimeRED} RED The Node-RED runtime object
 */
function ModuleDefinition(RED) {
    // As a module-level named function, it will inherit `mod` and other module-level variables

    // Save a reference to the RED runtime for convenience
    if (!uib.RED) uib.RED = RED

    // Check whether required libraries are available & loads them to uib.markedLibs
    // if (!uib.markedLibs.marked.module) {
    //     uib.markedLibs = checkLibs()
    // }

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

    this.instanceFolder = join(RED.settings.userDir, this.source)

    // TODO Check if instanceFolder exists and is readable?
    // TODO Check if configFolder exists and is readable?
    processConfig.bind(this)

    // Build search index asynchronously and set up file watcher
    buildIndexes(this)
        .then(() => {
            return true
        })
        .catch((err) => {
            log.warn(`🌐⚠️[uib-markweb:nodeInstance:${this.url}] Error building search index: ${err.message}`)
        })
    setupFileWatcher(this.instanceFolder, this.url, log)

    // @ts-ignore Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this, `${this.url}/:morePath(*)?`, handler.bind(this), { searchHandler: searchHandler.bind(this), })

    // @ts-ignore Socket.IO instance configuration. Each deployed instance has it's own namespace
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    // Define internal control messages and processing
    this.internalControls = {
        /** Internal control hook to perform a search, returns a list of results to the requesting client
         * @param {object} msg A control message with at least { query: string }
         */
        search: (msg) => {
            console.log(`🌐[uib-markweb:nodeInstance] Internal search control message received for instance URL "${this.url}": Query="${msg.query}"`)
            const returnTopic = '_search-results'
            const index = indexes.get(this.url)
            if (!index) {
                log.warn(`🌐⚠️[uib-markweb:nodeInstance:search}] Search attempted but index not ready for instance URL: "${this.url}"`)
                this.sendToFe({
                    topic: returnTopic,
                    query: msg.query,
                    results: [],
                    error: 'Search index not ready',
                    _socketId: msg._socketId, // Ensure response goes to requesting client only
                }, this, uib.ioChannels.control)
                return
            }
            const results = doSearch(index, msg.query)
            this.sendToFe({
                topic: returnTopic,
                query: msg.query,
                results: results,
                _socketId: msg._socketId,
            }, this, uib.ioChannels.control)
        },

        /** Internal control hook to navigate to a different page
         * @param {object} msg A control message with at least { toUrl: string }
         */
        navigate: doNavigate.bind(this),
    }

    // Clean up watcher on node close
    this.on('close', () => {
        const watcher = fileWatchers.get(this.url)
        if (watcher) {
            watcher.close()
            fileWatchers.delete(this.url)
            log.trace(`🌐[uib-markweb:nodeInstance:${this.url}] File watcher closed`)
        }
        indexes.delete(this.url)
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

/** Wrap body content in a div#content & convert markdown to html
 * @param {'body'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {object} options Optional options passed to the %%nav [options]%% instruction. Applied as html attributes to the wrapper div
 * @returns {string} Wrapped body content as an html string
 */
function bodyWrapper(key, attributes, options) {
    console.log('🌐[bodyWrapper] options=', options)
    let attrs = ''
    if (options) {
        attrs = Object.entries(options).map(([k, v]) => `${k}="${v}"`).join(' ')
    }
    let html = ''
    try {
        html = marked(attributes.body)
    } catch (e) { /* ignore errors */ }
    return `<div id="content" ${attrs} data-attribute="body">${html || ''}</div>`
    // return `<div id="content" ${attrs} data-attribute="body">{{body}}</div>`
}

/** Build search & nav indexes from all markdown files asynchronously
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

    const index = indexes.get(url) || new Map()
    const navIndex = navIndexes.get(url) || new Map()

    const files = fgSync(`${instanceFolder.replace(/\\/g, '/')}/**/*.md`)
    log.info(`🌐[uib-markweb:buildSearchIndex:${url}] Building search index. sourcePath="${instanceFolder}". Found ${files.length} markdown files.`)

    // TODO How to parallelize this?
    for (const file of files) {
        try {
            await getMarkdownFile(node, index, file)
        } catch (e) {
            // Skip files that can't be read
            log.warn(`🌐⚠️[uib-markweb:buildSearchIndex:${url}] Skipping file "${file}" due to error: ${e.message}`)
        }
    }

    // Keep these in memory as a cache
    indexes.set(url, index)
    console.log(`>>🌐${url}] `, indexes)
    console.log(`>>🌐[uib-markweb:buildSearchIndex:${url}] Built index with ${index.size} entries. Size=${(serialize(index).byteLength / 1024).toFixed(0)}kb`)
    log.info(`🌐[uib-markweb:buildSearchIndex:${url}] Finished index. sourcePath="${instanceFolder}", duration=${Math.round(performance.now() - strt)}ms`)
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

/** Create navigation menu HTML and return it
 * @param {'nav'} key The special key being processed
 * @param {object} attributes The current pages attributes
 * @param {object} options Optional options passed to the %%nav [options]%% instruction
 * @returns {string} The generated navigation HTML
 */
function createNav(key, attributes, options) {
    console.log('  >>🌐[createNav] ', key, options, attributes)
    return `
    <nav aria-label="Main menu" class="${options?.type || 'horizontal'}" role="navigation">
    </nav>
    `
}

/** Handle a navigation socket request
 * @param {object} msg A control message with at least { toUrl: string }
 */
async function doNavigate(msg) {
    const log = uib.RED.log
    const returnTopic = '_page-navigation-result'
    let attributes = {}

    let morePath = msg.toUrl.replace(new RegExp(`^${this.url}`), '')
    if (morePath.startsWith('.')) morePath = morePath.slice(1)
    if (morePath.startsWith('/')) morePath = morePath.slice(1)
    if (morePath === '.search' || morePath === '_search') {
        // Ignore for now
        return
    }
    // Check if folder or file name starts with _ or . and deny access
    if (morePath.split(sep).some(part => part.startsWith('_') || part.startsWith('.'))) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:navigate] Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_" or "."`)
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

    console.log(`🌐[uib-markweb:nodeInstance:navigate] Internal navigate control message received for instance URL: "${this.url}": 
        toUrl="${msg.toUrl}", 
        fullPath="${fullPath}", 
        morePath="${morePath}", 
        parsedPath=${JSON.stringify(parsedPath)}
    `)

    // Now check that the file exists, return an error if not
    try {
        accessSync( fullPath, 'r' )
        log.trace(`🌐[uib-markweb:nodeInstance:navigate] Source file is accessible: "${fullPath}"`)
    } catch (err) {
        log.error(`🌐🛑[uib-markweb:nodeInstance:navigate] Source file "${fullPath}" not accessible: ${err.message}`)
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
        attributes = await getMarkdownFile(this, null, fullPath, morePath, parsedPath)
        attributes.body = marked(processTemplates(attributes.body, attributes, 'doNavigate-body'))
        attributes.from = 'navigate'
        attributes.toUrl = morePath // msg.toUrl
        this.sendToFe({
            topic: returnTopic,
            attributes: attributes,
            _socketId: msg._socketId,
            // Gets the client to add this nav to browser history
            addToHistory: msg.addToHistory || false,
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
    for (const [path, doc] of index) {
        const titleMatch = doc.title.toLowerCase().includes(query)
        const contentMatch = doc.content.includes(query)
        const descMatch = doc.description.toLowerCase().includes(query)
        const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(query))

        if (titleMatch || contentMatch || descMatch || tagMatch) {
            // Extract snippet around match
            let snippet = ''
            const idx = doc.content.indexOf(query)
            if (idx >= 0) {
                const start = Math.max(0, idx - 50)
                const end = Math.min(doc.content.length, idx + query.length + 50)
                snippet = '...' + doc.content.slice(start, end) + '...'
            }

            results.push({
                path: doc.path,
                title: doc.title,
                description: doc.description,
                snippet,
                score: titleMatch ? 10 : (tagMatch ? 7 : (descMatch ? 5 : 1)),
            })
        }
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score)
    return results
}

/** Get and parse a markdown file
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {Map} index Index map for this instance
 * @param {string} file FS path to the markdown file
 * param {string} fullPath Full path to the markdown file
 * @param {string} morePath Relative path or additional path info
 * @param {object} parsedPath Parsed path object
 * @returns {Promise<object>} Parsed attributes and HTML body
 */
async function getMarkdownFile(node, index, file, morePath, parsedPath) {
    // fullPath, morePath, parsedPath
    const log = uib.RED.log
    const userDir = uib.RED.settings.userDir
    log.trace(`🌐[uib-markweb:getMarkdownFile:${node.url}] Request for markdown file, source="${node.source}", file="${file}"`)

    // check if urlPath already exists in searchIndex
    if (!index) index = indexes.get(node.url) || new Map()

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

        attributes = {
            ...parsed.attributes || {},
            title: parsed.attributes?.title || basename(file, '.md'),
            description: parsed.attributes?.description || '',
            // Store plain text (strip markdown) for searching
            // TODO Might want to do the {{...}} replacements here as well?
            // TODO Use the index in nav/handle when entry exists.
            // body: parsed.body.replace(/[#*`\[\]()]/g, '').toLowerCase() || '',
            body: parsed.body || '',
            tags: parsed.attributes?.tags || [],
            category: parsed.attributes?.category || '',
            author: parsed.attributes?.author || '',
            // Use the file's actual last updated timestamp from the filing system
            path: urlPath,
            fsMtimeMs: fStats.mtimeMs,
        }
        // attributes.htmlbody = processTemplates(attributes.body, attributes)
        index.set(urlPath, attributes)
    }
    // console.log(`  >>🌐 Indexing file: ${urlPath}, ${relativePath}, ${file}`)
    return attributes

    // try {
    //     const buffer = await readFile(fullPath, 'utf8')
    //     log.trace(`🌐[uib-markweb:handler] Read markdown file successfully: "${fullPath}"`)
    //     // console.log(buffer.toString())
    //     const content = fm(buffer)
    //     attributes = content.attributes || {}
    //     // Enhance content.attributes with some defaults
    //     attributes.title = attributes.title || parsedPath.name
    //     attributes.description = attributes.description || attributes.title || `uib-markweb served markdown file "${parsedPath.base}"`
    //     // Replace any %%....%% or {{...}} in content.body with the matching content.attributes property value
    //     attributes.body = processTemplates(content.body, attributes)
    //     // attributes.body = content.body.replace(/%%([^%]+)%%|\{\{([^}]+)\}\}/g, (match, key1, key2) => {
    //     //     const key = key1 || key2
    //     //     const trimmedKey = key.trim()
    //     //     if (trimmedKey === 'body') {
    //     //         return bodyWrapper(attributes[trimmedKey] || '')
    //     //     }
    //     //     return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
    //     // }) || ''
    //     // attributes.body = marked(attributes.body)
    //     // Replace any {{...}} in htmlTemplate with the matching content.attributes property value
    //     // const html = htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    //     //     const trimmedKey = key.trim()
    //     //     return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
    //     // })
    // } catch (err) {
    //     log.error(`🌐🛑[uib-markweb:handler] Error reading markdown file "${fullPath}". ${err.message}`)
    //     // @ts-ignore
    //     attributes = {
    //         error: true,
    //         title: 'Error',
    //         description: `Error reading markdown file "${fullPath}"`,
    //         body: `<h1>Error</h1><p>There was an error reading the requested markdown file.</p><pre>${err.message}</pre>`,
    //     }
    // }
    // // attributes.nav = buildNavigationIndex( node.instanceFolder )
    // return attributes
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

    let morePath = req.params?.morePath || '' // 'index.md'
    // Guard: Verify this request is for this instance
    // req.baseUrl is the path where the router is mounted (should match this.url)
    // Normalize both paths for comparison (remove trailing slashes, handle case)
    const normalizedBaseUrl = req.baseUrl.replace(/\/+$/, '').toLowerCase()
    const normalizedInstanceUrl = this.url.replace(/\/+$/, '').toLowerCase()
    console.log(`>>🌐[uib-markweb:handler]>>
        Request URL: "${req.url}", 
        Path: "${req.path}",
        morePath: "${morePath}",
        normalizedBaseUrl: "${normalizedBaseUrl}", 
        normalizedInstanceUrl: "${normalizedInstanceUrl}"
    `)
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
        const attributes = await getMarkdownFile(this, null, fullPath, morePath, parsedPath)
        attributes.body = marked(processTemplates(attributes.body, attributes, 'handler-body'))
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
            // Send pageData to FE via socket.io after a short delay to allow FE to set up
            setTimeout(() => {
                // console.log('🌐[uib-markweb:handler] Sending pageData to FE via socket.io')
                const data = { ...attributes, }
                delete data.body // We don't want this in the front-end
                // delete attributes.body // We don't want this in the front-end
                this.sendToFe(
                    { _uib: { command: 'set', prop: 'pageData', value: data, }, },
                    // { _uib: { command: 'set', prop: 'pageData', value: attributes, }, },
                    this,
                    uib.ioChannels.server
                )
            }, 500)
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
    const globalAttributes = readConfigFile(node, 'global-attributes.json') || {}
    attributes = { ...globalAttributes, ...attributes, }
    attributes.url = node.url
    // add the markdown body
    // if (!attributes.body) {
    //     attributes.body = '## Error: No content (htmlTemplate)\n\nThe requested page has no content.'
    // } else {
    //     try {
    //         // attributes.body = marked(processTemplates(attributes.body, attributes))
    //         attributes.body = processTemplates(attributes.body, attributes) || '<h2>Error: (htmlTemplate)</h2><div>processTemplates produced no output.</div>'
    //         // attributes.body = marked(attributes.body)
    //         // console.log('>> GOOD ATTRIBUTES >> ', attributes)
    //     } catch (err) {
    //         log.error(`🌐🛑[uib-markweb:htmlTemplate] Error converting markdown to HTML: ${err.message}`)
    //         // console.log('>> BAD ATTRIBUTES >> ', attributes)
    //     }
    // }
    // Replace any %%....%% or {{....}} in content with the matching attributes property value
    const html = processTemplates(node.pageTemplate, attributes, 'htmlTemplate-pageTemplate')
    // console.log('🌐[uib-markweb:htmlTemplate] ', html)
    return html
}

/** Process configuration files from the config folder
 * @this {runtimeNode & uibMwNode}
 */
function processConfig() {
    // Check if this.configFolder exists and is readable
    const RED = uib.RED
    const log = RED.log
    if (this.configFolder) {
        // if configFolder is a relative path, make it relative to userDir
        if (!isAbsolute(this.configFolder)) {
            this.configFolder = join(RED.settings.userDir, this.configFolder)
        }
        try {
            accessSync( this.configFolder, 'r' )
            log.trace(`🌐[uib-markweb:processConfig] Config folder is accessible. "${this.configFolder}"`)
        } catch (err) {
            log.warn(`🌐⚠️[uib-markweb:processConfig] Config folder is not accessible, using defaults. "${this.configFolder}" - ${err.message}`)
        }
    }
}

/** Replace %%...% and {{...}}
 * @param {string} text Text to process
 * @param {object} [attributes] Attributes to use for replacements
 * @returns {string} Processed text
 */
function processTemplates(text, attributes = {}, calledFrom = '') {
    // Supported %%...%% special directives and their callback. The function is called with (key, attributes, options)
    const specials = {
        'url': () => attributes.url,
        'nav': createNav,
        'search-results': () => '',
        // 'body': bodyWrapper,
        'body': () => attributes.body || '<div>No content</div>',
    }
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
                    const [k, v] = pair.split('=').map(s => s.trim())
                    if (k) bracketContent[k] = v || ''
                })
                key = key.substring(0, bracketIndex).trim()
            }
        }
        foundKeys.specials.push(key)
        // If there is a specials function for specials[key], call it and return the result
        if (specials[key]) {
            return specials[key](key, attributes, bracketContent)
        }
        // Otherwise, return the attribute value if exists or the original special if not
        return attributes[key] !== undefined ? attributes[key] : match
    })
    // {{...}} attributes
    text = text.replace(/\{\{([^}]+)\}\}/g, (match, key1, key2) => {
        const key = (key1 || key2).trim()
        foundKeys.attributes.push(key)
        return attributes[key] !== undefined ? attributes[key] : match
    })
    console.log(`>>🌐[processTemplates] (${calledFrom}) foundKeys=`, foundKeys)
    return text
}

/** Read a configuration file from configFolder or fallback to package templates folder
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {string} fileName The name of the file to read
 * @returns {string|null} The file contents or null if not found in either location
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
            log.trace(`🌐[uib-markweb:readConfigFile] File not found or not readable in configFolder: "${configPath}"`)
        }
    }

    // Fallback to templates/.markweb-defaults folder in the package
    const templatesPath = join(__dirname, '..', '..', 'templates', '.markweb-defaults', fileName)
    try {
        accessSync(templatesPath, 'r')
        content = readFileSync(templatesPath, 'utf8')
        log.trace(`🌐[uib-markweb:readConfigFile] Read file from templates folder: "${templatesPath}"`)
    } catch (err) {
        log.warn(`🌐⚠️[uib-markweb:readConfigFile] File not found or not readable in either configFolder or templates: "${fileName}"`)
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

/** Set up file watcher for the instance folder
 * @param {string} sourcePath The source folder path
 * @param {string} instanceUrl The instance URL (used as watcher key)
 * @param {object} log Node-RED log object
 */
function setupFileWatcher(sourcePath, instanceUrl, log) {
    // Close existing watcher if any
    const existingWatcher = fileWatchers.get(instanceUrl)
    if (existingWatcher) {
        existingWatcher.close()
    }

    let rebuildTimeout = null
    const debounceMs = 500 // Debounce rapid changes

    try {
        const watcher = watch(sourcePath, { recursive: true, }, (eventType, filename) => {
            // Only react to .md file changes
            if (!filename || !filename.endsWith('.md')) return

            // Debounce to avoid rebuilding multiple times for rapid changes
            if (rebuildTimeout) clearTimeout(rebuildTimeout)
            rebuildTimeout = setTimeout(() => {
                log.info(`🌐[uib-markweb:watcher:${instanceUrl}] File ${eventType}: ${filename}, rebuilding search index`)
                // Build the search index
                buildIndexes(this).catch((err) => {
                    log.warn(`🌐⚠️[uib-markweb:watcher:${instanceUrl}] Error rebuilding search index: ${err.message}`)
                })
                // Build the navigation index
                // buildNavigationIndex(sourcePath, instanceUrl).catch((err) => {
                //     log.warn(`🌐⚠️[uib-markweb:watcher:${instanceUrl}] Error rebuilding navigation index: ${err.message}`)
                // })
            }, debounceMs)
        })

        fileWatchers.set(instanceUrl, watcher)
        log.info(`🌐[uib-markweb:nodeInstance:${instanceUrl}] File watcher started for: ${sourcePath}`)
    } catch (err) {
        log.warn(`🌐⚠️[uib-markweb:nodeInstance:${instanceUrl}] Could not set up file watcher: ${err.message}`)
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

    const index = indexes.get(this.url)
    if (!index) {
        log.warn(`🌐⚠️[uib-markweb:searchHandler] Search attempted but index not ready for instance URL: "${this.url}"`)
        res.json({ results: [], query, message: 'Search index not ready', })
        return
    }

    const results = doSearch(index, query)

    log.info(`🌐[uib-markweb:searchHandler] Search results: ${results.length} found`)
    res.json({ results: results.slice(0, 20), query, })
}

// #endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
