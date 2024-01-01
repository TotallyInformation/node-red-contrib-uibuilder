/** User-facing API ExpressJS Router Handler
 *
 * See: https://expressjs.com/en/4x/api.html#router, https://expressjs.com/en/guide/routing.html
 *
 * Copyright (c) 2023-2023 Julian Knight (Totally Information)
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
// const path = require('path')
// const fs = require('fs-extra')  // https://github.com/jprichardson/node-fs-extra#nodejs-fs-extra
// const fg = require('fast-glob') // https://github.com/mrmlnc/fast-glob
// const uiblib = require('./uiblib')  // Utility library for uibuilder
// const web = require('./web')
// const sockets = require('./socket')
// const packageMgt = require('./package-mgt')
// const templateConf  = require('../../templates/template_dependencies') // Template configuration metadata

const UserRouter = express.Router({ mergeParams: true }) // eslint-disable-line new-cap

// const errUibRootFldr = new Error('uib.rootFolder is null')

const config = {}

// ! NEEDED?
//#region === REST API Validation functions === //

/** Validate url query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.url The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
// function chkParamUrl(params) {
//     const res = { 'statusMessage': '', 'status': 0 }

//     // We have to have a url to work with - the url defines the start folder
//     if ( params.url === undefined ) {
//         res.statusMessage = 'url parameter not provided'
//         res.status = 500
//         return res
//     }

//     // Trim the url
//     params.url = params.url.trim()

//     // URL must not exceed 20 characters
//     if ( params.url.length > 20 ) {
//         res.statusMessage = `url parameter is too long. Max 20 characters: ${params.url}`
//         res.status = 500
//         return res
//     }

//     // URL must be more than 0 characters
//     if ( params.url.length < 1 ) {
//         res.statusMessage = 'url parameter is empty, please provide a value'
//         res.status = 500
//         return res
//     }

//     // URL cannot contain .. to prevent escaping sub-folder structure
//     if ( params.url.includes('..') ) {
//         res.statusMessage = `url parameter may not contain "..": ${params.url}`
//         res.status = 500
//         return res
//     }

//     // Actually, since uib auto-creates folder if not exists, this just gets in the way - // Does this url have a matching instance root folder?
//     // if ( ! fs.existsSync(path.join(uib.rootFolder, params.url)) ) {
//     //     res.statusMessage = `url does not have a matching instance root folder. url='${params.url}', Master root folder='${uib.rootFolder}'`
//     //     res.status = 500
//     //     return res
//     // }

//     return res
// } // ---- End of fn chkParamUrl ---- //

/** Validate fname (filename) query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.fname The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
// function chkParamFname(params) {
//     const res = { 'statusMessage': '', 'status': 0 }
//     const fname = params.fname

//     // We have to have an fname (file name) to work with
//     if ( fname === undefined ) {
//         res.statusMessage = 'file name not provided'
//         res.status = 500
//         return res
//     }
//     // Blank file name probably means no files available so we will ignore
//     if ( fname === '' ) {
//         res.statusMessage = 'file name cannot be blank'
//         res.status = 500
//         return res
//     }
//     // fname must not exceed 255 characters
//     if ( fname.length > 255 ) {
//         res.statusMessage = `file name is too long. Max 255 characters: ${params.fname}`
//         res.status = 500
//         return res
//     }
//     // fname cannot contain .. to prevent escaping sub-folder structure
//     if ( fname.includes('..') ) {
//         res.statusMessage = `file name may not contain "..": ${params.fname}`
//         res.status = 500
//         return res
//     }

//     return res
// } // ---- End of fn chkParamFname ---- //

/** Validate folder query parameter
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.folder The uibuilder url to check
 * @returns {{statusMessage: string, status: number}} Status message
 */
// function chkParamFldr(params) {
//     const res = { 'statusMessage': '', 'status': 0 }
//     const folder = params.folder

//     // we have to have a folder name
//     if ( folder === undefined ) {
//         res.statusMessage = 'folder name not provided'
//         res.status = 500
//         return res
//     }
//     // folder name must be >0 in length
//     if ( folder === '' ) {
//         res.statusMessage = 'folder name cannot be blank'
//         res.status = 500
//         return res
//     }
//     // folder name must not exceed 255 characters
//     if ( folder.length > 255 ) {
//         res.statusMessage = `folder name is too long. Max 255 characters: ${folder}`
//         res.status = 500
//         return res
//     }
//     // folder name cannot contain .. to prevent escaping sub-folder structure
//     if ( folder.includes('..') ) {
//         res.statusMessage = `folder name may not contain "..": ${folder}`
//         res.status = 500
//         return res
//     }

//     return res
// } // ---- End of fn chkParamFldr ---- //

//#endregion === End of API validation functions === //

/** Return a router but allow parameters to be passed in
 * @param {uibConfig} uib Reference to uibuilder's master uib object
 * @param {*} log Reference to uibuilder's log functions
 * @returns {express.Router} The v3 admin API ExpressJS router
 */
function userRouter(uib, log) {
    if (config.setup === true) throw new Error('userRoute setup already called')
    config.setup = true
    config.uib = uib
    config.log = log

    /** uibuilder v3 unified Admin API router - new API commands should be added here
     * Typical URL is: http://127.0.0.1:1880/uibuilder/api/xxxxx
     */
    UserRouter.get('/test', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        console.log(' TEST API', {uib})
        res.statusMessage = 'Instances listed'
        res.status(200).json( uib.instances )
    })

    /** see https://expressjs.com/en/4x/api.html#app.METHOD for methods */

    return UserRouter
}

module.exports = userRouter

// EOF
