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

const { basename, join, parse, relative, sep, } = require('path')
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
    this.sourceFolder = '' // Used in web.instanceSetup(), should be ''

    // Make sure the url is valid & prefix with nodeRoot if needed
    this.url = urlJoin(uib.nodeRoot, this.url.trim())

    // source folder cannot be null/blank
    this.source = this.source.trim()
    if (!this.source || this.source === '') {
        this.error('🌐🛑[uibuilder:uib-markweb] Source folder cannot be blank. Please set a valid source folder in the node configuration.')
        return
    }

    this.instanceFolder = join(RED.settings.userDir, this.source)

    // TODO Check if folder exists and is readable?

    // @ts-ignore Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this, `${this.url}/:morePath(*)?`, handler.bind(this), { searchHandler: searchHandler.bind(this), })

    /** @ts-ignore Socket.IO instance configuration. Each deployed instance has it's own namespace */
    sockets.addNS(this) // NB: Namespace is set from url

    // Save a reference to sendToFe to allow this and other nodes referencing this to send direct to clients
    this.sendToFe = sockets.sendToFe.bind(sockets)

    // Build search index asynchronously and set up file watcher
    buildSearchIndex(this.instanceFolder, this.url)
        .then(() => {
            log.info(`🌐[uib-markweb:nodeInstance:${this.url}] Search index built successfully`)
            console.log({searchIndexes})
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

    // pass the complete msg object to the uibuilder client
    sockets.sendToFe( msg, this, uib.ioChannels.server )

    // We are done
    done()
}

// #region ----- Module-level support functions ----- //

/** HTML template for markdown rendering
 * @param {string} url Base URL for this uib-markweb instance
 * @param {object} attributes Attributes extracted from front-matter and other defaults
 * @returns {string} Full HTML page as a string
 */
function htmlTemplate(url, attributes) {
    return /* html */`
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8">
    <base href="${url}/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${attributes.description}" data-attribute="description">
    <link rel="icon" href="../uibuilder/images/node-blue.ico">
    <title data-attribute="title">${attributes.title}</title>
    <link type="text/css" rel="stylesheet" href="../uibuilder/uib-brand.min.css" media="all">
    <style>
        #search-form { position: relative; }
        #search-input { padding: 0.5rem; border: 1px solid hsl(0, 0%, 80%); border-radius: 0.25rem; }
        #search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: hsl(0, 0%, 100%);
            border: 1px solid hsl(0, 0%, 80%);
            border-radius: 0.25rem;
            max-height: 20rem;
            overflow-y: auto;
            z-index: 100;
            box-shadow: 0 4px 6px hsla(0, 0%, 0%, 0.1);
        }
        #search-results a {
            display: block;
            padding: 0.75rem;
            text-decoration: none;
            border-bottom: 1px solid hsl(0, 0%, 90%);
        }
        #search-results a:hover { background: hsl(210, 100%, 95%); }
        #search-results a:last-child { border-bottom: none; }
        #search-results strong { display: block; color: hsl(210, 100%, 40%); }
        #search-results small { color: hsl(0, 0%, 50%); font-size: 0.85em; }
        #search-results .no-results { padding: 0.75rem; color: hsl(0, 0%, 50%); }
    </style>
    
</head><body>
    <header>
        <h1 data-attribute="title">${attributes.title}</h1>
        <nav>
            <a href="/" data-spa-link>Home</a>
            <a href="/no1" data-spa-link>No.1</a>
            <a href="/another" data-spa-link>Another</a>
            <a href="/another/no2.md" data-spa-link>No.2</a>
        </nav>
        <form id="search-form" role="search" onsubmit="return false">
            <input type="search" id="search-input" placeholder="Search..." aria-label="Search pages">
            <div id="search-results" hidden></div>
        </form>
    </header>

    <main id="content">
    ${attributes.body}
    </main>

    <script src="../uibuilder/uibuilder.iife.min.js"></script>
    <script>
        (function() {
            const contentEl = document.getElementById('content')
            const baseUrl = '${url}'
            const searchInput = document.getElementById('search-input')
            const searchResults = document.getElementById('search-results')
            let searchTimeout = null
            console.log('Base URL:', baseUrl)
            
            /** Handle SPA navigation
             * @param {string} href The URL to navigate to
             * @param {boolean} [pushState=true] Whether to push to history
             */
            async function navigate(href, pushState = true) {
                console.log('Navigating to:', href)
                contentEl.classList.add('loading')
                // Hide search results when navigating
                searchResults.hidden = true
                searchInput.value = ''
                
                try {
                    const response = await fetch(href, {
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    })
                    
                    if (!response.ok) throw new Error('Page not found')
                    
                    const data = await response.json()
                    // TODO: Sanitize data.body for safety
                    contentEl.innerHTML = data.body || '<p>No content</p>'
                    console.log('Page loaded:', data)

                    // Update elements with data-attribute based on response data
                    document.querySelectorAll('[data-attribute]').forEach(el => {
                        const attr = el.getAttribute('data-attribute')
                        if (attr && data[attr] !== undefined) {
                            if (el.hasAttribute('content')) {
                                el.setAttribute('content', data[attr])
                            } else {
                                el.textContent = data[attr]
                            }
                        }
                    })
                    
                    // Update active nav link(s)
                    document.querySelectorAll('a[data-spa-link]').forEach(a => {
                        a.classList.toggle('active', baseUrl + a.getAttribute('href') === href)
                    })
                    
                    if (pushState) {
                        history.pushState({ path: href }, '', href)
                    }
                    
                    // Update page title if provided
                    if (data.title) {
                        document.title = data.title
                    }
                    
                } catch (err) {
                    contentEl.innerHTML = '<p>Error loading page. <a href="' + href + '">Try again</a></p>'
                } finally {
                    contentEl.classList.remove('loading')
                }
            }
            
            // Intercept clicks on SPA links
            document.addEventListener('click', (e) => {
                const link = e.target.closest('[data-spa-link]')
                console.log('Link click intercepted:', link)
                if (link) {
                    e.preventDefault()
                    navigate(baseUrl + link.getAttribute('href'))
                }
            })
            
            // Handle browser back/forward
            window.addEventListener('popstate', (e) => {
                console.log('popstate', e.state)
                if (e.state?.path) {
                    navigate(e.state.path, false)
                }
            })
            
            // Set initial state
            history.replaceState({ path: location.href }, '', location.href)

            // Search functionality
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout)
                const query = e.target.value.trim()
                
                if (query.length < 2) {
                    searchResults.hidden = true
                    return
                }
                
                searchTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(baseUrl + '/.search?q=' + encodeURIComponent(query))
                        const data = await response.json()
                        
                        if (data.results.length === 0) {
                            searchResults.innerHTML = '<p class="no-results">No results found</p>'
                        } else {
                            searchResults.innerHTML = data.results.map(r => 
                                '<a href="' + r.path + '" data-spa-link>' +
                                '<strong>' + escapeHtml(r.title) + '</strong>' +
                                '<small>' + escapeHtml(r.snippet || r.description || '') + '</small></a>'
                            ).join('')
                        }
                        searchResults.hidden = false
                    } catch (err) {
                        console.error('Search error:', err)
                        searchResults.innerHTML = '<p class="no-results">Search error</p>'
                        searchResults.hidden = false
                    }
                }, 300)
            })

            // Hide search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#search-form')) {
                    searchResults.hidden = true
                }
            })

            // Escape HTML to prevent XSS
            function escapeHtml(text) {
                const div = document.createElement('div')
                div.textContent = text
                return div.innerHTML
            }

            uibuilder.beaconLog('some text', 'info')
        })()
    </script>
</body></html>
`
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
    // Check if folder or file name starts with _ and deny access
    if (morePath.split(sep).some(part => part.startsWith('_'))) {
        log.error(`🌐🛑[uib-markweb:handler] Access denied to folder/file "${morePath}" because it is in a folder or file starting with "_"`)
        res.status(403).send(`Access denied`)
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
            res.status(404).json({ error: 'Page not found', body: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>' })
        } else {
            // const nav = buildNavigation()
            res.status(404).send(htmlTemplate(this.url,{ body: '<h1>Page Not Found</h1><p>The requested page does not exist.</p>' }))
        }
        return
    }

    // Handle markdown files
    if (parsedPath.ext === '.md') {
        log.trace(`🌐[uib-markweb:handler] Request for markdown file received: "${this.source}", "${this.url}", "${morePath}", "${fullPath}"`)
        let buffer
        try {
            buffer = await readFile(fullPath, 'utf8')
            log.trace(`🌐[uib-markweb:handler] Read markdown file successfully: "${fullPath}"`)
            // console.log(buffer.toString())
            const content = fm(buffer)
            const attributes = content.attributes || {}
            // Enhance content.attributes with some defaults
            attributes.title = attributes.title || parsedPath.name
            attributes.description = attributes.description || attributes.title || `uib-markweb served markdown file "${parsedPath.base}"`
            // Replace any {{...}} in content.body with the matching content.attributes property value
            attributes.body = content.body.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const trimmedKey = key.trim()
                return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            }) || ''
            attributes.body = marked(attributes.body)
            attributes.nav = buildNavigation( this.instanceFolder )
            // Replace any {{...}} in htmlTemplate with the matching content.attributes property value
            // const html = htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            //     const trimmedKey = key.trim()
            //     return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            // })
            if (isAjax) {
                // Return JSON for SPA navigation
                res.json(attributes)
            } else {
                // Return full page for initial load / direct access
                res.send(htmlTemplate(this.url, attributes))
            }
        } catch (err) {
            log.error(`🌐🛑[uib-markweb:handler] Error reading markdown file "${fullPath}". ${err.message}`)
            res.status(500).send(`Error reading markdown file "${fullPath}" \n ${err.message}`)
            return
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

/** Check whether the required marked modules are available, if they are, load them.
 * NB: Only run if uib.markedLibs.marked is undefined
 * @returns {object} An object listing the libraries and whether they are available
 */
// function checkLibs() {
//     const RED = uib.RED
//     const chkLibs = {
//         marked: {
//             available: false,
//             required: true,
//             npmName: 'marked',
//             // node.js module
//             module: null,
//             // Front-end script locations
//             iife: null,
//             esm: null,
//         },
//         plugins: {
//             fm: {
//                 available: false,
//                 required: true,
//                 npmName: 'front-matter',
//                 module: null,
//             },
//             mermaid: {
//                 available: false,
//                 required: false,
//                 npmName: 'mermaid',
//                 module: null,
//             },
//         },
//     }

//     const module = require('node:module')
//     const require2 = module.createRequire( join(uib.rootFolder, 'package.json') )
//     // console.log('🌐[uibuilder:uib-markweb] Checking for module:', require2)

//     /** Check for a library's availability & add metadata
//      * @param {object} lib `marked` or `plugins`
//      * @param {string} prop Property name within `lib`
//      */
//     function check(lib) {
//         try {
//             // Attempting to see if the module is installed
//             // Checks from <uibRoot> and not this modules's root
//             require2.resolve(lib.npmName, { paths: [uib.rootFolder], })
//             if ( lib.npmName === 'marked' ) {
//                 const { marked, } = require2(lib.npmName)
//                 if (!marked) {
//                     RED.log.error(`🌐🛑[uibuilder:uib-markweb] Required "marked" module is not installed. Markdown-to-HTML conversion is not available.`)
//                 }
//                 lib.module = marked
//             } else {
//                 lib.module = require2(lib.npmName)
//                 if (lib.module) RED.log.trace(`🌐[uibuilder:uib-markweb] Loaded plugin module "${lib.npmName}" successfully. "${typeof lib.module}"`)
//                 try {
//                     chkLibs.marked.module.use( lib.module )
//                 } catch (e) {
//                     RED.log.warn(`🌐⚠️[uibuilder:uib-markweb] Could not use plugin module "${lib.npmName}" with marked. Some features may not be available.`)
//                 }
//             }
//             lib.available = true
//             RED.log.trace(`🌐[uibuilder:uib-markweb] Module "${lib.npmName}" is available for use.`)
//         } catch (e) {
//             lib.available = false
//             if ( lib.required === true ) {
//                 RED.log.error(`🌐🛑[uibuilder:uib-markweb] Required module "${lib.npmName}" is not installed. Markdown-to-HTML conversion is not available.\nPlease install it using "npm install ${lib.npmName}" in your Node-RED user directory and restart Node-RED.`)
//             } else {
//                 RED.log.warn(`🌐⚠️[uibuilder:uib-markweb] Optional marked module "${lib.npmName}" is not installed. Some features may not be available.`)
//             }
//         }
//     }

//     // @ts-ignore
//     check(chkLibs.marked)

//     for (const prop in chkLibs.plugins) {
//         // @ts-ignore
//         check(chkLibs.plugins[prop])
//     }

//     return chkLibs
// }

// #endregion ----- Module-level support functions ----- //

// Export the module definition (1), this is consumed by Node-RED on startup.
module.exports = ModuleDefinition
