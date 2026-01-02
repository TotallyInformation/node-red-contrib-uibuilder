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

const { basename, join, isAbsolute, parse, relative, sep, } = require('path')
const express = require('express')
// ! TODO Move to fs.cjs
const { watch, } = require('node:fs')

const { accessSync, existsSync, fgSync, readFile, readFileSync, } = require('../libs/fs.cjs')
const { urlJoin, } = require('../libs/tilib.cjs')
const { setNodeStatus, } = require('../libs/uiblib.cjs') // Utility library for uibuilder
const sockets = require('../libs/socket.cjs')
const web = require('../libs/web.cjs')
// The uibuilder global configuration object, used throughout all nodes and libraries.
const uib = require('../libs/uibGlobalConfig.cjs')

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
const searchIndexes = new Map()
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

    // @ts-ignore Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this, `${this.url}/:morePath(*)?`, handler.bind(this), { searchHandler: searchHandler.bind(this), })

    // @ts-ignore Socket.IO instance configuration. Each deployed instance has it's own namespace
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    // Build search index asynchronously and set up file watcher
    buildSearchIndex(this.instanceFolder, this.url)
        .then(() => {
            log.info(`🌐[uib-markweb:nodeInstance:${this.url}] Search index built successfully`)
            return true
        })
        .catch((err) => {
            log.warn(`🌐⚠️[uib-markweb:nodeInstance:${this.url}] Error building search index: ${err.message}`)
        })
    setupFileWatcher(this.instanceFolder, this.url, log)

    // Clean up watcher on node close
    this.on('close', () => {
        const watcher = fileWatchers.get(this.url)
        if (watcher) {
            watcher.close()
            fileWatchers.delete(this.url)
            log.trace(`🌐[uib-markweb:nodeInstance:${this.url}] File watcher closed`)
        }
        searchIndexes.delete(this.url)
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

/** HTML template for markdown rendering
 * @param {runtimeNode & uibMwNode} node Instance `this` context
 * @param {object} [attributes] Attributes extracted from front-matter and other defaults
 * @returns {string} Full HTML page as a string
 */
function htmlTemplate(node, attributes = {}) {
    // TODO consider caching the page-template content for this instance for efficiency - but think about easy updates, how?
    node.pageTemplate = readConfigFile(node, 'page-template.html') || ''
    const globalAttributes = readConfigFile(node, 'global-attributes.json') || {}
    attributes = { ...globalAttributes, ...attributes, }
    attributes.url = node.url
    // Replace any %%....%% or {{....}} in content with the matching attributes property value
    return node.pageTemplate.replace(/%%([^%]+)%%|\{\{([^}]+)\}\}/g, (match, key1, key2) => {
        const key = key1 || key2
        const trimmedKey = key.trim()
        if (trimmedKey === 'body') {
            return bodyWrapper(attributes[trimmedKey] || '')
        }
        return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
    })
}

/** Wrap body content in a div#content
 * @param {string} [bodyContent] Body content to wrap
 * @returns {string} Wrapped body content
 */
function bodyWrapper(bodyContent = '') {
    return `<div id="content">${bodyContent}</div>`
}

/** ExpressJS middleware handler function for uib-markweb nodes
 * @param {import('express').Request} req ExpressJS request object
 * @param {import('express').Response} res ExpressJS response object
 * @param {import('express').NextFunction} next ExpressJS next() function
 * @this {runtimeNode & uibMwNode}
 */
async function handler(req, res, next) {
    const log = uib.RED.log
    // Differentiate between ajax and normal requests
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest'
    // Handle a search request
    console.log('🌐[uib-markweb:handler] Request received:', req.params, req.url, req.path)
    // Get route extended parameter if present
    let morePath = req.params?.morePath || 'index.md'
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
        log.trace(`🌐[uib-markweb:handler] Request for markdown file received: "${this.source}", "${this.url}", "${morePath}", "${fullPath}"`)
        let attributes = {}
        try {
            const buffer = await readFile(fullPath, 'utf8')
            log.trace(`🌐[uib-markweb:handler] Read markdown file successfully: "${fullPath}"`)
            // console.log(buffer.toString())
            const content = fm(buffer)
            attributes = content.attributes || {}
            // Enhance content.attributes with some defaults
            attributes.title = attributes.title || parsedPath.name
            attributes.description = attributes.description || attributes.title || `uib-markweb served markdown file "${parsedPath.base}"`
            // Replace any {{...}} in content.body with the matching content.attributes property value
            attributes.body = content.body.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const trimmedKey = key.trim()
                if (trimmedKey === 'body') {
                    return bodyWrapper(attributes[trimmedKey] || '')
                }
                return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            }) || ''
            attributes.body = marked(attributes.body)
            attributes.nav = buildNavigation( this.instanceFolder )
            // Replace any {{...}} in htmlTemplate with the matching content.attributes property value
            // const html = htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            //     const trimmedKey = key.trim()
            //     return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            // })
        } catch (err) {
            log.error(`🌐🛑[uib-markweb:handler] Error reading markdown file "${fullPath}". ${err.message}`)
            res.status(500).send(`Error reading markdown file "${fullPath}" \n ${err.message}`)
            return
        }
        if (isAjax) {
            // Return JSON for SPA navigation
            res.json(attributes)
        } else {
            // Return full page for initial load / direct access
            res.send(htmlTemplate(this, attributes))
            // Send pageData to FE via socket.io after a short delay to allow FE to set up
            setTimeout(() => {
                console.log('🌐[uib-markweb:handler] Sending pageData to FE via socket.io')
                delete attributes.body // We don't want this in the front-end
                this.sendToFe(
                    { _uib: { command: 'set', prop: 'pageData', value: attributes, }, },
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

/** Build a list of navigable pages from all markdown files in the source folder
 * @param {string} sourcePath Source folder path
 * @returns {Array<{path: string, title: string, file: string}>} Array of navigation items
 */
function buildNavigation(sourcePath) {
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

/** Build search index from all markdown files asynchronously
 * @param {string} sourcePath The source folder path
 * @param {string} instanceUrl The instance URL (used as index key)
 * @returns {Promise<void>}
 */
async function buildSearchIndex(sourcePath, instanceUrl) {
    const index = new Map()
    const files = fgSync(`${sourcePath.replace(/\\/g, '/')}/**/*.md`)

    for (const file of files) {
        // TODO Skip files/folders starting with "_"
        try {
            const content = await readFile(file, 'utf8')
            const parsed = fm(content)
            const relativePath = relative(sourcePath, file).replace(/\\/g, '/')
            const urlPath = '/' + relativePath.replace(/\.md$/, '')

            index.set(urlPath, {
                path: urlPath,
                title: parsed.attributes?.title || basename(file, '.md'),
                description: parsed.attributes?.description || '',
                // Store plain text (strip markdown) for searching
                content: parsed.body.replace(/[#*`\[\]()]/g, '').toLowerCase(),
                tags: parsed.attributes?.tags || [],
            })
        } catch (e) {
            // Skip files that can't be read
        }
    }

    searchIndexes.set(instanceUrl, index)
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
                buildSearchIndex(sourcePath, instanceUrl).catch((err) => {
                    log.warn(`🌐⚠️[uib-markweb:watcher:${instanceUrl}] Error rebuilding search index: ${err.message}`)
                })
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
    console.log('🌐[uib-markweb:searchHandler] Search request received:', req.query)
    const query = (req.query.q || '').toString().toLowerCase()
        .trim()

    if (!query || query.length < 2) {
        res.json({ results: [], query, })
        return
    }

    const index = searchIndexes.get(this.url)
    if (!index) {
        res.json({ results: [], query, message: 'Search index not ready', })
        return
    }

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
    console.log('🌐[uib-markweb:searchHandler] Search results:', results)
    res.json({ results: results.slice(0, 20), query, })
}

// #endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
