/* eslint-disable jsdoc/valid-types */
/** v3 Admin API ExpressJS Router Handler
 *
 * See: https://expressjs.com/en/4x/api.html#router, https://expressjs.com/en/guide/routing.html
 *
 * Copyright (c) 2021-2025 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk, https://github.com/TotallyInformation/node-red-contrib-uibuilder
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 */

const path = require('node:path')
const { AsyncLocalStorage, } = require('node:async_hooks') // https://nodejs.org/docs/latest-v18.x/api/async_context.html#class-asynclocalstorage

const express = require('express')
const fg = require('fast-glob') // https://github.com/mrmlnc/fast-glob

const fslib = require('./fs.cjs') // Utility library for uibuilder
const web = require('./web.cjs')
const sockets = require('./socket.cjs')
const packageMgt = require('./package-mgt.cjs')
const { killTree, } = require('./uiblib.cjs')

const templateConf = require('../../templates/template_dependencies.js') // Template configuration metadata
const elements = require('../elements/elements.js')
const { url, } = require('node:inspector')

const v3AdminRouter = express.Router() // eslint-disable-line new-cap
const asyncLocalStorage = new AsyncLocalStorage()

const errUibRootFldr = new Error('uib.rootFolder is null [uibuilder:admin-api-v3]')

// Add a Map to track running processes (see PUT/runInstanceNpmScript)
const runningProcesses = new Map()

// #region === REST API Validation functions === //

/** Validate url query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.url The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
function chkParamUrl(params) {
    const res = { statusMessage: '', status: 0, }

    // We have to have a url to work with - the url defines the start folder
    if ( params.url === undefined ) {
        res.statusMessage = 'url parameter not provided'
        res.status = 500
        return res
    }

    // Trim the url
    params.url = params.url.trim()

    // URL must not exceed 20 characters
    if ( params.url.length > 20 ) {
        res.statusMessage = `url parameter is too long. Max 20 characters: ${params.url}`
        res.status = 500
        return res
    }

    // URL must be more than 0 characters
    if ( params.url.length < 1 ) {
        res.statusMessage = 'url parameter is empty, please provide a value'
        res.status = 500
        return res
    }

    // URL cannot contain .. to prevent escaping sub-folder structure
    if ( params.url.includes('..') ) {
        res.statusMessage = `url parameter may not contain "..": ${params.url}`
        res.status = 500
        return res
    }

    // Actually, since uib auto-creates folder if not exists, this just gets in the way - // Does this url have a matching instance root folder?
    // if ( ! fslib.existsSync(path.join(uib.rootFolder, params.url)) ) {
    //     res.statusMessage = `url does not have a matching instance root folder. url='${params.url}', Master root folder='${uib.rootFolder}'`
    //     res.status = 500
    //     return res
    // }

    return res
} // ---- End of fn chkParamUrl ---- //

/** Validate fname (filename) query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.fname The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
function chkParamFname(params) {
    const res = { statusMessage: '', status: 0, }
    const fname = params.fname

    // We have to have an fname (file name) to work with
    if ( fname === undefined ) {
        res.statusMessage = 'file name not provided'
        res.status = 500
        return res
    }
    // Blank file name probably means no files available so we will ignore
    if ( fname === '' ) {
        res.statusMessage = 'file name cannot be blank'
        res.status = 500
        return res
    }
    // fname must not exceed 255 characters
    if ( fname.length > 255 ) {
        res.statusMessage = `file name is too long. Max 255 characters: ${params.fname}`
        res.status = 500
        return res
    }
    // fname cannot contain .. to prevent escaping sub-folder structure
    if ( fname.includes('..') ) {
        res.statusMessage = `file name may not contain "..": ${params.fname}`
        res.status = 500
        return res
    }

    return res
} // ---- End of fn chkParamFname ---- //

/** Validate folder query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.folder The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
function chkParamFldr(params) {
    const res = { statusMessage: '', status: 0, }
    const folder = params.folder

    // we have to have a folder name
    if ( folder === undefined ) {
        res.statusMessage = 'folder name not provided'
        res.status = 500
        return res
    }
    // folder name must be >0 in length
    if ( folder === '' ) {
        res.statusMessage = 'folder name cannot be blank'
        res.status = 500
        return res
    }
    // folder name must not exceed 255 characters
    if ( folder.length > 255 ) {
        res.statusMessage = `folder name is too long. Max 255 characters: ${folder}`
        res.status = 500
        return res
    }
    // folder name cannot contain .. to prevent escaping sub-folder structure
    if ( folder.includes('..') ) {
        res.statusMessage = `folder name may not contain "..": ${folder}`
        res.status = 500
        return res
    }

    return res
} // ---- End of fn chkParamFldr ---- //

// #endregion === End of API validation functions === //

/** Get the description & options HTML for an element and return to caller
 * @param {object} params All parameters from the HTTP call
 * @param {string} rootFolder uibuilder's root folder
 * @param {express.Request} req ExpressJS request object
 * @param {express.Response} res ExpressJS response object
 */
function doGetOneElement(params, rootFolder, req, res) {
    const rootPath = [__dirname, '..', 'elements']

    let optsHtml = ''
    let descHtml = ''

    const availableLangs = ['en-US']

    let lang
    if (params.languages) {
        lang = params.languages.filter(value => availableLangs.includes(value))
    }
    if (!lang) lang = ['en-US']
    rootPath.push(lang[0])

    let fname = path.join( ...rootPath, `${params.elType}-options.html`)

    // Get the content for the advanced settings tab
    try {
        optsHtml = fslib.readFileSync(fname, 'utf8')
    } catch (e) {
        fname = path.join( ...rootPath, 'default-options.html')
        optsHtml = fslib.readFileSync(fname, 'utf8')
    }

    // Get the description
    try {
        fname = path.join( ...rootPath, `${params.elType}-description.html`)
        descHtml = fslib.readFileSync(fname, 'utf8')
    } catch (e) {
        fname = path.join( ...rootPath, 'default-description.html')
        descHtml = fslib.readFileSync(fname, 'utf8')
    }

    res.statusMessage = `No-code element ${params.elType} options returned`
    res.status(200).json( { descHtml, optsHtml, } )
}

/** Return a router but allow parameters to be passed in
 * @param {uibConfig} uib Reference to uibuilder's master uib object
 * @param {*} log Reference to uibuilder's log functions
 * @returns {express.Router} The v3 admin API ExpressJS router
 */
function adminRouterV3(uib, log) {
    /** Kill a running process (if exists in runningProcesses)
     * @param {string} processId Process ID to kill
     * @param {string} url The URL of the request
     * @param {string} scriptName The name of the script to kill
     * @returns {boolean} True if the process was killed, else false
     */
    function killRunningProcess(processId, url, scriptName) {
        const process = runningProcesses.get(processId)
        if (process && typeof process.kill === 'function') {
            try {
                log.info(`🌐[uibuilder:admin-api-v3:killRunningProcess] Killing process for ${url}. Process ID: "${processId}". PID: "${process.pid}"`)
                // process.kill('SIGTERM')
                killTree(process.pid)
                runningProcesses.delete(processId)
                return true
            } catch (err) {
                log.error(`🌐🛑[uibuilder:admin-api-v3:killRunningProcess] Error killing process for ${url}:${scriptName}. Process ID: "${processId}". Error: ${err.message}`, err)
            }
        }
        return false
    }

    /** uibuilder v3 unified Admin API router - new API commands should be added here
     * Typical URL is: http://127.0.0.1:1880/red/uibuilder/admin/nodeurl?cmd=listfolders
     */
    v3AdminRouter.route('/:url')
        // For all routes (this function is called before more specific ones)
        .all(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res, /** @type {express.NextFunction} */ next) {
            // @ts-ignore
            const params = res.allparams = Object.assign({}, req.query, req.body, req.params)
            params.type = 'all'
            // params.headers = req.headers

            // Validate URL - params.url
            const chkUrl = chkParamUrl(params)
            if ( chkUrl.status !== 0 ) {
                log.error(`🌐🛑[uibuilder:adminRouterV3:ALL] Admin API. ${chkUrl.statusMessage}`)
                res.statusMessage = chkUrl.statusMessage
                res.status(chkUrl.status).end()
                return
            }

            next()
        })
        // Get something and return it
        .get(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
            if (uib.rootFolder === null) throw errUibRootFldr

            // @ts-ignore
            const params = res.allparams
            params.type = 'get'

            // Commands ...
            switch (params.cmd) {
                // See if a node's custom folder exists. Return true if it does, else false
                case 'checkfolder': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:GET:checkfolder] See if a node's custom folder exists. URL: ${params.url}`)

                    const folder = path.join( uib.rootFolder, params.url)

                    fslib.access(folder, fslib.constants.F_OK)
                        .then( () => {
                            res.statusMessage = 'Folder checked'
                            res.status(200).json( true )
                            return true
                        })
                        .catch( () => { // err) => {
                            res.statusMessage = 'Folder checked'
                            res.status(200).json( false )
                            return false
                        })

                    break
                }

                // See if a specific package has been installed into uibRoot (e.g. via library manager)
                case 'checkpackage': {
                    // We must have a packageName
                    if (!params.packageName) {
                        log.error(`🌐🛑[uibuilder:adminRouterV3:GET] Admin API. cmd=${params.cmd}. 'packageName' parameter not provided. url=${params.url}`)
                        res.statusMessage = 'packageName parameter not provided'
                        res.status(500).end()
                        return
                    }
                    const ans = packageMgt.isPackageInstalled(params.packageName)
                    if (ans === false) {
                        res.statusMessage = 'Package checked - not installed'
                        res.status(200).json( false )
                    }

                    res.statusMessage = 'Package checked - is installed'
                    res.status(200).json( true )

                    break
                }

                // Check if URL is already in use
                case 'checkurls': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:GET:checkurls] Check if URL is already in use. URL: ${params.url}`)

                    /** @returns {boolean} True if the given url exists, else false */
                    const chkInstances = Object.values(uib.instances).includes(params.url)
                    const chkFolders = fslib.existsSync(uib.rootFolder, params.url)

                    res.statusMessage = 'Instances and Folders checked'
                    res.status(200).json( chkInstances || chkFolders )

                    break
                }

                // Get list of all available no-code elements
                case 'getElements': {
                    res.statusMessage = 'No-code elements list returned'
                    res.status(200).json( elements )
                    break
                }

                // Get details for one specific no-code element
                case 'getOneElement': {
                    doGetOneElement(params, uib.rootFolder, req, res)
                    break
                }

                // Get the list of npm script names for a uibuilder instance
                case 'getNpmScriptNames': {
                    // Could be an empty list if errors
                    const npmScriptNames = packageMgt.getInstanceNpmScriptNames(params.url)
                    res.statusMessage = 'NPM script names list returned'
                    res.status(200).json( npmScriptNames )
                    break
                }

                // List all folders and files for this uibuilder instance
                case 'listall': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:GET] Admin API. List all folders and files. url=${params.url}, root fldr=${uib.rootFolder}`)

                    // get list of all (sub)folders (follow symlinks as well)
                    const out = { root: [], }
                    const root2 = uib.rootFolder.replace(/\\/g, '/')
                    fg.stream(
                        [
                            // '**',
                            // '!node_modules',
                            // '!.git',
                            // '!.vscode',
                            // '!_*',
                            // '!/**/_*/',
                            `${root2}/${params.url}/**`,
                            `!${root2}/${params.url}/node_modules`,
                            `!${root2}/${params.url}/.git`,
                            `!${root2}/${params.url}/.vscode`,
                            `!${root2}/${params.url}/_*`,
                            `!${root2}/${params.url}/**/[_]*`,

                        ],
                        {
                            // cwd: `${root2}/${params.url}/`,
                            dot: true,
                            onlyFiles: false,
                            deep: 10,
                            followSymbolicLinks: true,
                            markDirectories: true,
                        }
                    )
                        .on('data', (entry) => {
                            entry = entry.replace(`${root2}/${params.url}/`, '')
                            let fldr
                            if ( entry.endsWith('/') ) {
                                // remove trailing /
                                fldr = entry.slice(0, -1)
                                // For the root folder of the instance, use "root" as the name (matches editor processing)
                                if ( fldr === '' ) fldr = 'root'
                                out[fldr] = []
                            } else {
                                const splitEntry = entry.split('/')
                                const last = splitEntry.pop()
                                fldr = splitEntry.join('/')
                                if ( fldr === '' ) fldr = 'root'
                                // Wrap in a try because we can't exclude xxx/_yyyy/som.thing and that seems to crash the push.
                                try {
                                    out[fldr].push(last)
                                } catch (e) { /* Nothing needed here */ }
                            }
                        })
                        .on('end', () => {
                            res.statusMessage = 'Folders and Files listed successfully'
                            res.status(200).json(out)
                        })

                    break
                }

                // List all folders for this uibuilder instance
                case 'listfolders': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:GET] Admin API. List all folders. url=${params.url}, root fldr=${uib.rootFolder}`)

                    // get list of all (sub)folders (follow symlinks as well)
                    // const out = { 'root': [] }
                    const out = []
                    const root2 = uib.rootFolder.replace(/\\/g, '/')
                    fg.stream(
                        [
                            // '**',
                            // '!node_modules',
                            // '!.git',
                            // '!.vscode',
                            // '!_*',
                            // '!/**/_*/',
                            `${root2}/${params.url}/**`,
                            `!${root2}/${params.url}/node_modules`,
                            `!${root2}/${params.url}/.git`,
                            `!${root2}/${params.url}/.vscode`,
                            `!${root2}/${params.url}/_*`,
                            `!${root2}/${params.url}/**/[_]*`,

                        ],
                        {
                            // cwd: `${root2}/${params.url}/`,
                            dot: true,
                            onlyFiles: false,
                            onlyDirectories: true,
                            deep: 10,
                            followSymbolicLinks: true,
                            markDirectories: false,
                        }
                    )
                        .on('data', (entry) => {
                            entry = entry.replace(`${root2}/${params.url}/`, '')
                            out.push(entry)
                        })
                        .on('end', () => {
                            res.statusMessage = 'Folders listed successfully'
                            res.status(200).json(out)
                        })

                    break
                }

                // List all of the deployed instance urls
                case 'listinstances': {
                    log.trace('🌐[uibuilder:adminRouterV3:GET:listinstances] Returning a list of deployed URLs (instances of uib).')

                    /** @returns {boolean} True if the given url exists, else false */
                    // let chkInstances = Object.values(uib.instances).includes(params.url)
                    // let chkFolders = fslib.existsSync(path.join(uib.rootFolder, params.url))

                    res.statusMessage = 'Instances listed'
                    res.status(200).json( uib.instances )

                    break
                }

                // Return a list of all user urls in use by ExpressJS
                case 'listurls': {
                    // TODO Not currently working
                    let route
                    const routes = []
                    web.app._router.stack.forEach( (middleware) => {
                        if (middleware.route) { // routes registered directly on the app
                            const path = middleware.route.path
                            const methods = middleware.route.methods
                            routes.push({ path: path, methods: methods, })
                        } else if (middleware.name === 'router') { // router middleware
                            middleware.handle.stack.forEach(function(handler) {
                                route = handler.route
                                route && routes.push(route)
                            })
                        }
                    })

                    log.trace('🌐[uibuilder:adminRouterV3:GET:listurls] Admin API. List of all user urls in use.')
                    res.statusMessage = 'URLs listed successfully'
                    res.status(200).json(web.app._router.stack)

                    break
                }

                default: {
                    res.statusMessage = 'cmd parameter missing or incorrect'
                    res.status(500).json( { error: res.statusMessage, } )
                    break
                }
            }
        })

        // Do something that has side-effects, e.g. update a file or run an npm script
        .put(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
            if (uib.rootFolder === null) throw errUibRootFldr

            // @ts-expect-error
            const params = res.allparams
            params.type = 'put'

            const fullname = path.join(uib.rootFolder, params.url)

            // Commands ...
            switch (params.cmd) {
                // Tell uibuilder to delete the instance local folder when this instance is deleted - see html file oneditdelete & uiblib.processClose
                case 'deleteondelete': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:PUT:deleteondelete] url=${params.url}`)
                    uib.deleteOnDelete[params.url] = true
                    res.statusMessage = 'PUT successful'
                    res.status(200).json({})
                    return
                }

                // TODO: This is just a dummy placeholder for now
                case 'updatepackage': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:PUT:updatepackage] url=${params.url}`)

                    res.statusMessage = 'PUT successful'
                    res.status(200).json({
                        newVersion: '',
                    })
                    return
                }

                // Run an instance npm script, returning the output
                case 'runInstanceNpmScript': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:PUT:runInstanceNpmScript] Running script. url="${params.url}", script="${params.scriptName}"`)

                    // Create a unique process ID for this script execution
                    const processId = `uibApiV3Put_runInstanceNpmScript:${params.url}:${params.scriptName}:${Date.now().toString()}`

                    /** asyncLocalStorage captures the context for async functions
                     * so we can handle async outputs in a synchronous way
                     */
                    asyncLocalStorage.run({ requestId: processId, }, async () => {
                        try {
                            // Set headers for streaming output
                            res.setHeader('Content-Type', 'application/json; charset=utf-8')
                            res.setHeader('Transfer-Encoding', 'chunked')

                            // Stream each chunk as a JSON line
                            const streamOutput = (chunk) => {
                                const msg = JSON.stringify({ type: 'stream', data: chunk, }) + '\n'
                                res.write(msg)
                            }

                            // Get the promise with kill method
                            const processPromise = packageMgt.npmRunScript(
                                params.scriptName, params.url, streamOutput
                            )
                            // Store the process for potential killing
                            runningProcesses.set(processId, processPromise)
                            // @ts-ignore Send process ID to client for kill capability
                            const processMsg = JSON.stringify({ type: 'processId', processId, pid: processPromise.pid, }) + '\n'
                            res.write(processMsg)

                            // Await the process completion
                            const result = await processPromise
                            // Clean up completed process
                            runningProcesses.delete(processId)

                            // Send final result
                            const finalMsg = JSON.stringify({ type: 'end', result: { all: '... Script completed', code: result.code, command: result.command, }, }) + '\n'
                            // const finalMsg = JSON.stringify({ type: 'end', result, }) + '\n'
                            res.write(finalMsg)
                            res.end()
                        } catch (err) {
                            log.error(`🌐🛑[uibuilder:adminRouterV3:PUT:runInstanceNpmScript] Error running script "${params.scriptName}" for URL "${params.url}". Error: ${err.message}`, err)

                            // Kill the running process if it exists
                            killRunningProcess(processId, params.url, params.scriptName)

                            res.statusMessage = `PUT unsuccessful. Error running script "${params.scriptName}" for URL "${params.url}". Error: ${err.message}`
                            const errorMsg = JSON.stringify({
                                type: 'error',
                                all: err?.all || 'No output',
                                params: params,
                                message: res.statusMessage,
                            }) + '\n'
                            res.write(errorMsg)
                            res.end()
                        }
                    })

                    return
                }

                // case for killing processes
                case 'killInstanceNpmScript': {
                    log.trace(`🌐[uibuilder[:adminRouterV3:PUT:killInstanceNpmScript] processId="${params.processId}"`)

                    // Kill the running process if it exists
                    const killed = killRunningProcess(params.processId, params.url, params.scriptName)

                    if (killed) {
                        res.statusMessage = 'Process killed successfully'
                        res.status(200).json({ killed: true, processId: params.processId, })
                    } else {
                        res.statusMessage = 'Process not found or already completed'
                        res.status(404).json({ killed: false, error: 'Process not found', })
                    }

                    return
                }
            }

            // If we get here, we've failed
            log.trace(`🌐[uibuilder:adminRouterV3:PUT] Unsuccessful. command=${params.cmd}, url=${params.url}`)
            res.statusMessage = 'PUT unsuccessful'
            res.status(500).json({
                cmd: params.cmd,
                fullname: fullname,
                params: params,
                message: 'PUT unsuccessful',
            })
        })

        // Load new template or Create a new folder or file
        .post(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
            if (uib.rootFolder === null) throw errUibRootFldr

            // @ts-ignore
            const params = res.allparams
            params.type = 'post'

            if ( params.cmd === 'replaceTemplate' ) {
                fslib.replaceTemplate({ url: params.url, template: params.template, extTemplate: params.extTemplate, cmd: params.cmd, templateConf, uib, log, })
                    .then( (statusMessage) => {
                        // @ts-ignore
                        res.statusMessage = statusMessage
                        res.status(200).json({ statusMessage, })
                        // Reload connected clients if required by sending them a reload msg
                        if ( params.reload === 'true' ) {
                            sockets.sendToFe2(
                                {
                                    _uib: {
                                        reload: true,
                                    },
                                },
                                // @ts-ignore
                                {
                                    url: params.url,
                                }
                            )
                        }
                        return true
                    })
                    .catch( (err) => {
                        let statusMsg, mystr
                        if ( err.code === 'MISSING_REF' ) {
                            statusMsg = `Degit clone error. CHECK External Template Name. Name='${params.extTemplate}', url=${params.url}, cmd=${params.cmd}. ${err.message}`
                        } else {
                            if ( params.template === 'external' ) mystr = `, ${params.extTemplate}`
                            statusMsg = `Replace template error. ${err.message}. url=${params.url}. ${params.template}${mystr}`
                        }
                        log.error(`🌐🛑[uibuilder:adminapi:POST:replaceTemplate] ${statusMsg}`, err)
                        res.statusMessage = statusMsg
                        res.status(500).end()
                    } )
            } else {
                // Validate folder name - params.folder
                const chkFldr = chkParamFldr(params)
                if ( chkFldr.status !== 0 ) {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFldr.statusMessage
                    res.status(chkFldr.status).end()
                    return
                }
                // Validate command - must be present and either be 'newfolder' or 'newfile'
                if ( !(params.cmd && (params.cmd === 'newfolder' || params.cmd === 'newfile')) ) {
                    const statusMsg = `cmd parameter not present or wrong value (must be 'newfolder' or 'newfile'). url=${params.url}, cmd=${params.cmd}`
                    log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }
                // If newfile, validate file name - params.fname
                if (params.cmd === 'newfile' ) {
                    const chkFname = chkParamFname(params)
                    if ( chkFname.status !== 0 ) {
                        log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
                        res.statusMessage = chkFname.statusMessage
                        res.status(chkFname.status).end()
                        return
                    }
                }

                // Fix for Issue #155 - if fldr = root, no folder
                if ( params.folder === 'root' ) params.folder = ''

                let fullname = path.join(uib.rootFolder, params.url, params.folder)
                if (params.cmd === 'newfile' ) {
                    fullname = path.join(fullname, params.fname)
                }

                // Does folder or file already exist? If so, return error
                if ( fslib.existsSync(fullname) ) {
                    const statusMsg = `selected ${params.cmd === 'newfolder' ? 'folder' : 'file'} already exists. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                    log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                // try to create folder/file - if fail, return error
                try {
                    if ( params.cmd === 'newfolder') {
                        fslib.ensureDirSync(fullname)
                    } else {
                        fslib.ensureFileSync(fullname)
                    }
                } catch (e) {
                    const statusMsg = `could not create ${params.cmd === 'newfolder' ? 'folder' : 'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                    log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                log.trace(`🌐[uibuilder:adminRouterV3:POST] Admin API. Folder/File create SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                res.statusMessage = 'Folder/File created successfully'
                res.status(200).json({
                    fullname: fullname,
                    params: params,
                })
            } // end of else
        }) // --- End of POST processing --- //

        // Delete a folder or a file
        .delete(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
            if (uib.rootFolder === null) throw errUibRootFldr

            // @ts-ignore ts(2339)
            const params = res.allparams
            params.type = 'delete'

            // Several command options available: deletefolder, deletefile

            // deletefolder or deletefile:

            // Validate folder name - params.folder
            const chkFldr = chkParamFldr(params)
            if ( chkFldr.status !== 0 ) {
                log.error(`🌐🛑[uibuilder:adminRouterV3:DELETE] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                res.statusMessage = chkFldr.statusMessage
                res.status(chkFldr.status).end()
                return
            }
            // Validate command - must be present and either be 'deletefolder' or 'deletefile'
            if ( !(params.cmd && (params.cmd === 'deletefolder' || params.cmd === 'deletefile')) ) {
                const statusMsg = `cmd parameter not present or wrong value (must be 'deletefolder' or 'deletefile'). url=${params.url}, cmd=${params.cmd}`
                log.error(`🌐🛑[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }
            // If newfile, validate file name - params.fname
            if (params.cmd === 'deletefile' ) {
                const chkFname = chkParamFname(params)
                if ( chkFname.status !== 0 ) {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:DELETE] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFname.statusMessage
                    res.status(chkFname.status).end()
                    return
                }
            }

            // Fix for Issue #155 - if fldr = root, no folder
            if ( params.folder === 'root' ) params.folder = ''

            let fullname = path.join(uib.rootFolder, params.url, params.folder)
            if (params.cmd === 'deletefile' ) {
                fullname = path.join(fullname, params.fname)
            }

            // Does folder or file does not exist? Return error
            if ( !fslib.existsSync(fullname) ) {
                const statusMsg = `selected ${params.cmd === 'deletefolder' ? 'folder' : 'file'} does not exist. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                log.error(`🌐🛑[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            // try to delete folder/file - if fail, return error
            try {
                fslib.removeSync(fullname) // deletes both files and folders
            } catch (e) {
                const statusMsg = `could not delete ${params.cmd === 'deletefolder' ? 'folder' : 'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                log.error(`🌐🛑[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            log.trace(`🌐[uibuilder:adminRouterV3:DELETE] Admin API. Folder/File delete SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
            res.statusMessage = 'Folder/File deleted successfully'
            res.status(200).json({
                fullname: fullname,
                params: params,
            })
        })

    /** @see https://expressjs.com/en/4x/api.html#app.METHOD for other methods
     *  patch, report, search ?
     */

    return v3AdminRouter
}

module.exports = adminRouterV3
