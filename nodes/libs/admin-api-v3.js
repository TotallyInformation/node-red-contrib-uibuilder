/** v3 Admin API ExpressJS Router Handler
 *
 * See: https://expressjs.com/en/4x/api.html#router, https://expressjs.com/en/guide/routing.html
 *
 * Copyright (c) 2021-2023 Julian Knight (Totally Information)
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

const express = require('express')
const path = require('path')
const fs = require('fs-extra')  // https://github.com/jprichardson/node-fs-extra#nodejs-fs-extra
const fg = require('fast-glob') // https://github.com/mrmlnc/fast-glob
const uiblib = require('./uiblib')  // Utility library for uibuilder
const web = require('./web')
const templateConf  = require('../../templates/template_dependencies') // Template configuration metadata

const v3AdminRouter = express.Router() // eslint-disable-line new-cap

const errUibRootFldr = new Error('uib.rootFolder is null')

//#region === REST API Validation functions === //

/** Validate url query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.url The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
function chkParamUrl(params) {
    const res = { 'statusMessage': '', 'status': 0 }

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
    // if ( ! fs.existsSync(path.join(uib.rootFolder, params.url)) ) {
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
    const res = { 'statusMessage': '', 'status': 0 }
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
    const res = { 'statusMessage': '', 'status': 0 }
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

//#endregion === End of API validation functions === //

/** Return a router but allow parameters to be passed in
 * @param {uibConfig} uib Reference to uibuilder's master uib object
 * @param {*} log Reference to uibuilder's log functions
 * @returns {express.Router} The v3 admin API ExpressJS router
 */
function adminRouterV3(uib, log) {

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
                log.error(`[uibuilder:adminRouterV3:ALL] Admin API. ${chkUrl.statusMessage}`)
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
                // List all folders and files for this uibuilder instance
                case 'listall': {
                    log.trace(`[uibuilder:adminRouterV3:GET] Admin API. List all folders and files. url=${params.url}, root fldr=${uib.rootFolder}`)

                    // get list of all (sub)folders (follow symlinks as well)
                    const out = { 'root': [] }
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
                        .on('data', entry => {
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
                } // -- end of listall -- //

                // List all folders and files for this uibuilder instance
                case 'listfolders': {
                    log.trace(`[uibuilder:adminRouterV3:GET] Admin API. List all folders. url=${params.url}, root fldr=${uib.rootFolder}`)

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
                        .on('data', entry => {
                            entry = entry.replace(`${root2}/${params.url}/`, '')
                            out.push(entry)
                        })
                        .on('end', () => {
                            res.statusMessage = 'Folders listed successfully'
                            res.status(200).json(out)
                        })

                    break
                } // -- end of listfolders -- //

                // Check if URL is already in use
                case 'checkurls': {
                    log.trace(`[uibuilder:adminRouterV3:GET:checkurls] Check if URL is already in use. URL: ${params.url}`)

                    /** @returns {boolean} True if the given url exists, else false */
                    const chkInstances = Object.values(uib.instances).includes(params.url)
                    const chkFolders = fs.existsSync(path.join(uib.rootFolder, params.url))

                    res.statusMessage = 'Instances and Folders checked'
                    res.status(200).json( chkInstances || chkFolders )

                    break
                } // -- end of checkurls -- //

                // List all of the deployed instance urls
                case 'listinstances': {

                    log.trace('[uibuilder:adminRouterV3:GET:listinstances] Returning a list of deployed URLs (instances of uib).')

                    /** @returns {boolean} True if the given url exists, else false */
                    // let chkInstances = Object.values(uib.instances).includes(params.url)
                    // let chkFolders = fs.existsSync(path.join(uib.rootFolder, params.url))

                    res.statusMessage = 'Instances listed'
                    res.status(200).json( uib.instances )

                    break
                } // -- end of listinstances -- //

                // Return a list of all user urls in use by ExpressJS
                case 'listurls': {
                    // TODO Not currently working
                    let route
                    const routes = []
                    web.app._router.stack.forEach( (middleware) => {
                        if (middleware.route) { // routes registered directly on the app
                            const path = middleware.route.path
                            const methods = middleware.route.methods
                            routes.push({ path: path, methods: methods })
                        } else if (middleware.name === 'router') { // router middleware
                            middleware.handle.stack.forEach(function(handler) {
                                route = handler.route
                                route && routes.push(route)
                            })
                        }
                    })
                    // console.log(web.app._router.stack[0])

                    log.trace('[uibuilder:adminRouterV3:GET:listurls] Admin API. List of all user urls in use.')
                    res.statusMessage = 'URLs listed successfully'
                    // res.status(200).json(routes)
                    res.status(200).json(web.app._router.stack)

                    break
                } // -- end of listurls -- //

                // See if a node's custom folder exists. Return true if it does, else false
                case 'checkfolder': {
                    log.trace(`[uibuilder:adminRouterV3:GET:checkfolder] See if a node's custom folder exists. URL: ${params.url}`)

                    const folder = path.join( uib.rootFolder, params.url)

                    fs.access(folder, fs.constants.F_OK)
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
                } // -- end of checkfolder -- //

                default: {
                    break
                }
            }
        })

        // TODO Write file contents
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
                    log.trace(`[uibuilder:adminRouterV3:PUT:deleteondelete] url=${params.url}`)
                    uib.deleteOnDelete[params.url] = true
                    res.statusMessage = 'PUT successful'
                    res.status(200).json({})
                    return
                }

                case 'updatepackage': {
                    log.trace(`[uibuilder:adminRouterV3:PUT:updatepackage] url=${params.url}`)
                    console.log(`[uibuilder:adminRouterV3:PUT:updatepackage] url=${params.url}, pkg=${params.pkgName}`)

                    res.statusMessage = 'PUT successful'
                    res.status(200).json({
                        newVersion: ''
                    })
                    return
                }
            }

            // If we get here, we've failed
            log.trace(`[uibuilder:adminRouterV3:PUT] Unsuccessful. command=${params.cmd}, url=${params.url}`)
            res.statusMessage = 'PUT unsuccessful'
            res.status(500).json({
                'cmd': params.cmd,
                'fullname': fullname,
                'params': params,
                'message': 'PUT unsuccessful',
            })

        })

        // Load new template or Create a new folder or file
        .post(function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
            if (uib.rootFolder === null) throw errUibRootFldr

            // @ts-ignore
            const params = res.allparams
            params.type = 'post'

            if ( params.cmd === 'replaceTemplate' ) {

                uiblib.replaceTemplate(params.url, params.template, params.extTemplate, params.cmd, templateConf, uib, log)
                    .then( resp => {
                        res.statusMessage = resp.statusMessage
                        if ( resp.status === 200 ) res.status(200).json(resp.json)
                        else res.status(resp.status).end()
                        return true
                    })
                    .catch( err => {
                        let statusMsg, mystr
                        if ( err.code === 'MISSING_REF' ) {
                            statusMsg = `Degit clone error. CHECK External Template Name. Name='${params.extTemplate}', url=${params.url}, cmd=${params.cmd}. ${err.message}`
                        } else {
                            if ( params.template === 'external' ) mystr = `, ${params.extTemplate}`
                            statusMsg = `Replace template error. ${err.message}. url=${params.url}. ${params.template}${mystr}`
                        }
                        log.error(`[uibuilder:adminapi:POST:replaceTemplate] ${statusMsg}`, err)
                        res.statusMessage = statusMsg
                        res.status(500).end()
                    } )

            } else {

                // Validate folder name - params.folder
                const chkFldr = chkParamFldr(params)
                if ( chkFldr.status !== 0 ) {
                    log.error(`[uibuilder:adminRouterV3:POST] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFldr.statusMessage
                    res.status(chkFldr.status).end()
                    return
                }
                // Validate command - must be present and either be 'newfolder' or 'newfile'
                if ( !(params.cmd && (params.cmd === 'newfolder' || params.cmd === 'newfile')) ) {
                    const statusMsg = `cmd parameter not present or wrong value (must be 'newfolder' or 'newfile'). url=${params.url}, cmd=${params.cmd}`
                    log.error(`[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }
                // If newfile, validate file name - params.fname
                if (params.cmd === 'newfile' ) {
                    const chkFname = chkParamFname(params)
                    if ( chkFname.status !== 0 ) {
                        log.error(`[uibuilder:adminRouterV3:POST] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
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
                if ( fs.pathExistsSync(fullname) ) {
                    const statusMsg = `selected ${params.cmd === 'newfolder' ? 'folder' : 'file'} already exists. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                    log.error(`[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                // try to create folder/file - if fail, return error
                try {
                    if ( params.cmd === 'newfolder') {
                        fs.ensureDirSync(fullname)
                    } else {
                        fs.ensureFileSync(fullname)
                    }
                } catch (e) {
                    const statusMsg = `could not create ${params.cmd === 'newfolder' ? 'folder' : 'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                    log.error(`[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                    res.statusMessage = statusMsg
                    res.status(500).end()
                    return
                }

                log.trace(`[uibuilder:adminRouterV3:POST] Admin API. Folder/File create SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                res.statusMessage = 'Folder/File created successfully'
                res.status(200).json({
                    'fullname': fullname,
                    'params': params,
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
                log.error(`[uibuilder:adminRouterV3:DELETE] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                res.statusMessage = chkFldr.statusMessage
                res.status(chkFldr.status).end()
                return
            }
            // Validate command - must be present and either be 'deletefolder' or 'deletefile'
            if ( !(params.cmd && (params.cmd === 'deletefolder' || params.cmd === 'deletefile')) ) {
                const statusMsg = `cmd parameter not present or wrong value (must be 'deletefolder' or 'deletefile'). url=${params.url}, cmd=${params.cmd}`
                log.error(`[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }
            // If newfile, validate file name - params.fname
            if (params.cmd === 'deletefile' ) {
                const chkFname = chkParamFname(params)
                if ( chkFname.status !== 0 ) {
                    log.error(`[uibuilder:adminRouterV3:DELETE] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
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
            if ( !fs.pathExistsSync(fullname) ) {
                const statusMsg = `selected ${params.cmd === 'deletefolder' ? 'folder' : 'file'} does not exist. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}`
                log.error(`[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            // try to create folder/file - if fail, return error
            try {
                fs.removeSync(fullname)  // deletes both files and folders
            } catch (e) {
                const statusMsg = `could not delete ${params.cmd === 'deletefolder' ? 'folder' : 'file'}. url=${params.url}, cmd=${params.cmd}, folder=${params.folder}, error=${e.message}`
                log.error(`[uibuilder:adminRouterV3:DELETE] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                return
            }

            log.trace(`[uibuilder:adminRouterV3:DELETE] Admin API. Folder/File delete SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
            res.statusMessage = 'Folder/File deleted successfully'
            res.status(200).json({
                'fullname': fullname,
                'params': params,
            })
        })

    /** @see https://expressjs.com/en/4x/api.html#app.METHOD for other methods
     *  patch, report, search ?
     */

    return v3AdminRouter
}

module.exports = adminRouterV3

// EOF
