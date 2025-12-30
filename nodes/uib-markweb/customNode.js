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

const { join, parse, sep, } = require('path')
const express = require('express')
const { accessSync, existsSync, readFile, } = require('../libs/fs.cjs')
const web = require('../libs/web.cjs')
// The uibuilder global configuration object, used throughout all nodes and libraries.
const uib = require('../libs/uibGlobalConfig.cjs')
// Import the bundled marked and front-matter libraries
const { marked, fm, } = require('@totallyinformation/uib-md-utils') // eslint-disable-line n/no-extraneous-require
const { urlJoin, } = require('../libs/tilib.cjs')

/** Main (module) variables - acts as a configuration object
 *  that can easily be passed around.
 */
const mod = {
    /** @type {Function|undefined} Reference to a promisified version of RED.util.evaluateNodeProperty*/
    // evaluateNodeProperty: undefined,
    /** @type {string} Custom Node Name - has to match with html file and package.json `red` section */
    nodeName: 'uib-markweb',
}

const htmlTemplate = /* html */`
<!DOCTYPE html>
<html lang="en"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{{description}}">
    <link rel="icon" href="{{icon}}">
    <title>{{title}}</title>
    <link type="text/css" rel="stylesheet" href="{{stylesheet}}" media="all">
    <!-- <script defer src="../uibuilder/uibuilder.iife.min.js"></script> -->
</head><body>
    <header>
        <h1>{{title}}</h1>
    </header>

    <main>
    {{body}}
    </main>
</body></html>
`

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

    // Create the node instance - `this` can only be referenced AFTER here
    RED.nodes.createNode(this, config)

    /** Transfer config items from the Editor panel to the runtime */
    this.source = config.source ?? ''
    this.url = config.url ?? 'markweb'
    this.name = config.name ?? ''
    this.sourceFolder = '' // Used in web.instanceSetup(), should be ''

    // source folder cannot be null/blank
    if (!this.source || this.source.trim() === '') {
        this.error('🌐🛑[uibuilder:uib-markweb] Source folder cannot be blank. Please set a valid source folder in the node configuration.')
        return
    }

    this.instanceFolder = join(RED.settings.userDir, this.source)

    // TODO Check if folder exists and is readable?

    // @ts-ignore Set up web services for this instance (static folders, middleware, etc)
    web.instanceSetup(this, `${urlJoin(this.url)}/:morePath(*)?`, handler.bind(this) )

    /** Handle incoming msg's - note that the handler fn inherits `this` */
    // this.on('input', inputMsgHandler)

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
// function inputMsgHandler(msg, send, done) {
//     const RED = uibGlobalConfig.RED

//     // We are done
//     done()
// }

// #region ----- Module-level support functions ----- //

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
    // Get route extended parameter if present
    let morePath = req.params?.morePath || 'index.md'
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
        res.status(404).send(`Source file does not exist or is not accessible`)
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
            attributes.icon = attributes.icon || '../uibuilder/images/node-blue.ico'
            attributes.stylesheet = attributes.stylesheet || '../uibuilder/uib-brand.min.css'
            // Replace any {{...}} in content.body with the matching content.attributes property value
            attributes.body = content.body.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const trimmedKey = key.trim()
                return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            }) || ''
            attributes.body = marked(attributes.body)
            // Replace any {{...}} in htmlTemplate with the matching content.attributes property value
            const html = htmlTemplate.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
                const trimmedKey = key.trim()
                return attributes[trimmedKey] !== undefined ? attributes[trimmedKey] : match
            })
            // console.log({ content, html, } )
            res.send(html)
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
