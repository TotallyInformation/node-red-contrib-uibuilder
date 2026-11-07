/** v3 Admin API ExpressJS Router Handler
 *
 * See: https://expressjs.com/en/4x/api.html#router, https://expressjs.com/en/guide/routing.html
 *
 * Copyright (c) 2021-2026 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').uibCustomLogger} uibCustomLogger
 */

// Will auto-enable if TI_ENV environment variable is set to "debug"
const { /** @type {uibCustomLogger} */ log: clog, } = require('./logger.mjs')
clog.debug('Loading')

const path = require('node:path')
const { AsyncLocalStorage, } = require('node:async_hooks') // https://nodejs.org/docs/latest-v18.x/api/async_context.html#class-asynclocalstorage

const express = require('express')

const fslib = require('./fs.cjs') // Utility library for uibuilder
// const web = require('./web.cjs') // Avoid circular ref issues by late loading for any specific fn that required web
const sockets = require('./socket.cjs')
const packageMgt = require('./package-mgt.cjs')
const { killTree, } = require('./uiblib.cjs') // Utility library for uibuilder
const { syntaxHighlight, urlJoin, } = require('./tilib.cjs') // General purpose library (by Totally Information)
const uib = require('./uibGlobalConfig.cjs') // UIBUILDER's global config object
const templateConf = require('../../templates/template_dependencies.js') // Template configuration metadata
const elements = require('../elements/elements.js')

/** NB: This creates an ExpressJS router object that is mounted to `./uibuilder/admin` (e.g. `http://localhost:1880/red/uibuilder/admin`)
 * So all routes stem from that root. It is mounted by `nodes/libs/web.cjs:_adminApiSetup()`
 */
const v3AdminRouter = express.Router()
// Standard error message
const errUibRootFldr = new Error('uib.rootFolder is null [uibuilder:admin-api-v3]')
// Allow async calls from ExpressJS routes
const asyncLocalStorage = new AsyncLocalStorage()
// Add a Map to track running processes (see PUT/runInstanceNpmScript)
const runningProcesses = new Map()

const log = uib.RED.log

// #region === REST API Validation functions === //

/** Validate url query parameter
 * 0>length<21, must not contain path traversal strings
 * NB: The URL param only has to be a potentially valid name, it doesn't have to exist
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.url The uibuilder url to check
 * @return {{statusMessage: string, status: number}} Status message
 */
function chkParamUrl(params) {
    const res = { statusMessage: '', status: 0, }

    // We have to have a url to work with - the url defines the start folder
    if ( !params.url ) {
        res.statusMessage = 'uibuilder instance url parameter not provided'
        res.status = 500
        return res
    }
    // Make sure that params.url is a string, not an array
    if ( Array.isArray(params.url) ) params.url = params.url[0]

    // If present, must be a string thanks to ExpressJS

    params.url = params.url.trim()

    // uibuilder instance URL must not exceed 20 characters
    if ( params.url.length > 20 ) {
        res.statusMessage = `uibuilder instance url parameter is too long. Max 20 characters: ${params.url}`
        res.status = 500
        return res
    }

    // URL must be more than 0 characters
    if ( params.url.length < 1 ) {
        res.statusMessage = 'uibuilder instance url parameter is empty, please provide a value'
        res.status = 500
        return res
    }

    // URL cannot contain .. to prevent escaping sub-folder structure
    if ( params.url.includes('..') ) {
        res.statusMessage = `url parameter may not contain "..": ${params.url}`
        res.status = 500
        return res
    }

    // Final safety check - Rejects path traversal, spaces, %, query params, # fragments, leading /, empty paths, absolute urls
    if ( !/^[a-z\d_-]+(?:\/[a-z\d_-]+)*$/i.test(params.url) ) { // eslint-disable-line security/detect-unsafe-regex
        res.statusMessage = 'uibuilder instance url parameter is invalid. Cannot include path traversal, spaces, %, query params, # fragments, leading /, empty paths, absolute urls'
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
}

/** Validate fname (filename) query parameter
 * <256 chars, no `..`, `/`, or `\`
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.fname The uibuilder url to check
 * @return {{statusMessage: string, status: number}} Status message
 */
function chkParamFname(params) {
    const res = { statusMessage: '', status: 0, }
    /** @type {string} */
    const fname = Array.isArray(params.fname) ? params.fname[0] : params.fname

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
    // fname cannot contain / to prevent escaping sub-folder structure
    if ( fname.includes('/') || fname.includes('\\') ) {
        res.statusMessage = `file name may not contain "/" or "\\": ${params.fname}`
        res.status = 500
        return res
    }

    return res
}

/** Validate folder query parameter
 * <256 chars, no `..`
 * @param {object} params The GET (res.query) or POST (res.body) parameters
 * @param {string} params.folder The uibuilder url to check
 * @return {{statusMessage: string, status: number}} Status message
 */
function chkParamFldr(params) {
    const res = { statusMessage: '', status: 0, }
    /** @type {string} */
    const folder = Array.isArray(params.folder) ? params.folder[0] : params.folder

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
}

// #endregion === End of API validation functions === //

// #region === Utility functions === //

/** Return an HTML page listing all uib instances (apps) with details
 * @param {URL} url The URL object
 * @param {string} adminRoot The admin root
 * @return {string} HTML string output
 */
function appsPage(url, adminRoot) {
    const apps = uib.apps
    // const urlAdminRoot = `${urlPrefix}${uib.nodeRoot.replace('/', '')}`
    const urlAdminRoot = url.origin + `${adminRoot}/${uib.moduleName}`.replace('//', '/')
    let usrPort = url.port
    let usrType = url.protocol
    let usrRoot = uib.RED.settings.httpRoot ?? ''
    if (uib.customServer.isCustom) {
        usrPort = `${uib.customServer.port}`
        usrType = `${uib.customServer.type}:`
        if (uib.httpRoot) usrRoot = uib.httpRoot
    }

    let page = /* html */`
        <!doctype html><html lang="en"><head>
            <title>UIBUILDER Instances (Apps)</title>
            <link rel="icon" href="${urlAdminRoot}/docs/resources/images/node-blue.ico">
            <link type="text/css" rel="stylesheet" href="${urlAdminRoot}/docs/resources/uib-brand.min.css" media="screen">
            <style type="text/css" rel="stylesheet" media="all">
                h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                .col3i tbody>tr>:nth-child(3){ font-style:italic; }
            </style>
        </head><body><main>
            <h1 class="with-subtitle">UIBUILDER Instances (Apps)</h1>
            <div role="doc-subtitle">Note that this page is only accessible to users with Node-RED admin read authority</div>
            <table>
    `

    Object.keys(apps)
        .sort()
        .forEach( (app) => {
            const detail = apps[app]
            const appUrl = `${usrType}//${url.hostname}:${usrPort}${usrRoot}/${detail.url}`
            // If detail.type = 'uibuilder' then set style to bold, else set style to italic
            const style = detail.type === 'uibuilder' ? '' : 'font-style: italic'
            page += /* html */`
            <tr>
                <td title="URL and link (opens in new tab)">
                    <a href="${appUrl}" target="_blank">${app}</a>
                </td>
                <td title="title/description - see uibuilder node advanced tab to set">
                    ${detail.title}
                    ${detail.descr ? `<br><i>${detail.descr}</i>` : ''}
                </td>
                <td title="Type: uibuilder or markweb" style="${style}">
                    ${detail.type}
                </td>
            </tr>
            `
        })

    page += `</table></main></body></html>`

    return page
}

/** uibuilder detailed information page
 * @param {URL} url The URL object
 * @param {string} adminRoot The admin root
 * @return {string} HTML string output
 */
function detailsPage(url, adminRoot) {
    if (uib.rootFolder === null) throw errUibRootFldr
    const rootFolder = uib.rootFolder

    const RED = uib.RED
    const log = RED.log
    const web = require('./web.cjs') // Late load to avoid circular clash
    const routes = web.dumpRoutes(false)
    const urlAdminRoot = url.origin + `${adminRoot}/${uib.moduleName}`.replace('//', '/')
    let usrPort = url.port
    let usrType = url.protocol
    let usrRoot = uib.RED.settings.httpRoot ?? ''
    if (uib.customServer.isCustom) {
        usrPort = `${uib.customServer.port}`
        usrType = `${uib.customServer.type}:`
        if (uib.httpRoot) usrRoot = uib.httpRoot
    }

    // Fix for one person who had a failure on JSON parse with win32 circular ref - weird
    let uibSummary = {}
    try {
        uibSummary = Object.assign({}, uib) // JSON.parse(JSON.stringify(uib))
        delete uibSummary.me
        delete uibSummary.RED
    } catch (e) {
        log.warn(`🌐⚠️[uibuilder:admin-api-v3:detailsPage] Could not parse uib object, some info will be missing. ${e.message}`)
    }

    // Build the web page
    let page = /* html */`
        <!doctype html><html lang="en"><head>
            <title>UIBUILDER Details Index</title>
            <link rel="icon" href="${urlAdminRoot}/docs/resources/images/node-blue.ico">
            <link type="text/css" rel="stylesheet" href="${urlAdminRoot}/docs/resources/uib-brand.min.css" media="screen">
            <style type="text/css" rel="stylesheet" media="all">
                h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                .col3i tbody>tr>:nth-child(3){ font-style:italic; }
            </style>
        </head><body><main><section>
            <h1 class="with-subtitle">UIBUILDER Full Details Index</h1>
            <div role="doc-subtitle">Note that this page is only accessible to users with Node-RED admin read authority</div>
    `
    /** Index of uibuilder instances */
    page += /* html */`
            <h2>Index of uibuilder pages</h2>
            <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
            <table class="uib-info-tb table table-sm">
                <thead><tr>
                    <th>URL</th>
                    <th title="Use this to search for the source node in the admin ui">Source Node Instance <a href="#i2"><sup>(2)</sup></th>
                    <th>Server Filing System Folder</th>
                </tr></thead><tbody>
    `
    Object.keys(uib.instances).forEach((key) => {
        page += /* html */`
            <tr>
                <td><a href="${usrType}//${url.hostname}:${usrPort}${usrRoot}/${uib.instances[key]}" target="_blank">${uib.instances[key]}</a></td>
                <td>${key}</td>
                <td>${path.join(rootFolder, uib.instances[key])}</td>
            </tr>
        `
    })
    page += /* html */`
        </tbody></table>
        <p>Notes:</p>
        <ol>
            <li><a id="i1"></a>
                Each instance of uibuilder uses its own socket.io <i>namespace</i> that matches <code>httpNodeRoot/url</code>. 
                You can use this to manually send messages to your user interface.
            </li>
            <li><a id="i2"></a>
                Paste the Source Node Instance into the search feature in the Node-RED admin ui to find the instance.
                The "Filing System Folder" shows you where the front-end (client browser) code lives.
            </li>
        </ol>
    `
    /** Table of Vendor Libraries available */
    page += /* html */`
        <h2>Vendor Client Libraries</h2>
        <p>
            You can include these libraries (packages) in any uibuilder served web page.
            Note though that you need to find out the correct file and relative folder either by looking on 
            your Node-RED server in the location shown or by looking at the packages source online.
        </p>
        <table class="uib-info-tb table table-sm">
            <thead><tr>
                <th>Package</th>
                <th>Version</th>
                <th>Browser Entry Point (est.) <a href="#vl1"><sup>(1)</sup></a> <a href="#vl2"><sup>(2)</sup></a></th>
                <th>Server Filing System Folder</th>
            </tr></thead><tbody>
    `
    const installedPackages = packageMgt.uibPackageJson.uibuilder.packages
    Object.keys(installedPackages).forEach((packageName) => {
        const pj = installedPackages[packageName]

        page += /* html */`
            <tr>
                <td><a href="${pj.homepage}" title="Click to go to package's home page">${packageName}</a></td>
                <td title="Installed Version, Version Spec='${pj.spec}'">${pj.installedVersion}</td>
                <td title="Use this in your front-end code">${pj.url}</td>
                <td>${pj.installFolder}</td>
            </tr>
        `
    })
    page += /* html */`
        </tbody></table>
        <p>Notes:</p>
        <ol>
            <li><a id="vl1"></a>
                Always use relative URL's. All vendor URL's start <code>../uibuilder/vendor/</code>, 
                all uibuilder and custom file URL's start <code>./</code>.<br>
                Using relative URL's saves you from needing to worry about http(s), ip names/addresses and port numbers.
            </li>
            <li><a id="vl2"></a>
                The 'Main Entry Point' shown is <i>usually</i> a JavaScript file that you will want in your index.html. 
                However, because this is reported by the authors of the package, it may refer to something completely different, 
                uibuilder has no way of knowing. Treat it as a hint rather than absolute truth. Check the packages documentation 
                for the correct library files to load.
            </li>
        </ol>
    `
    /** Configuration info */
    page += /* html */`
        <h2>Configuration</h2>

        <h3>uibuilder</h3>
        <table class="uib-info-tb table table-sm col3i">
            <tr>
                <th>uibuilder Version</th>
                <td>${uib.version}</td>
                <td></td>
            </tr>
            <tr>
                <th>uib.rootFolder</th>
                <td>${rootFolder}</td>
                <td>All uibuilder data lives here</td>
            </tr>
            <tr>
                <th>uib.configFolder</th>
                <td>${uib.configFolder}</td>
                <td>uibuilder Global Configuration Folder</td>
            </tr>
            <tr>
                <th>uib.commonFolder</th>
                <td>${uib.commonFolder}</td>
                <td>Used for loading common resources between multiple uibuilder instances</td>
            </tr>
            <tr>
                <th>Common URL</th>
                <td>../${uib.moduleName}/common</td>
                <td>The common folder maps to this URL</td>
            </tr>
            <tr title="">
                <th>uib_socketPath</th>
                <td>${sockets.uib_socketPath}</td>
                <td>Unique path given to Socket.IO to ensure isolation from other Nodes that might also use it</td>
            </tr>
            <tr>
                <th>uib.masterTemplateFolder</th>
                <td>${uib.masterTemplateFolder}</td>
                <td>The built-in source templates, can be copied to any instance</td>
            </tr>
        </table>

        <h3>Configuration Files</h3>

        <p>All are kept in the master configuration folder: ${uib.configFolder}</p>

        <dl style="margin-left:1em;">
            <dt>${uib.sioUseMwName}</dt>
            <dd>Custom Socket.IO Middleware file, also uibMiddleware.js.</dd>
            <dt>uibMiddleware.js</dt>
            <dd>Custom ExpressJS Middleware file.</dd>
        </dl>

        <h4>Dump of all uib master configuration settings</h4>
        <pre>${syntaxHighlight( uibSummary, 100000 )}</pre>

        <h4>Dump of all uib settings.js entries</h4>
        <pre>${syntaxHighlight( RED.settings.uibuilder ? RED.settings.uibuilder : 'NOT DEFINED', 100000 )}</pre>

        <h3>Node-RED</h3>
        <p>See the <code>&lt;userDir&gt;/settings.js</code> file and the 
        <a href="https://nodered.org/docs/" target="_blank">Node-RED documentation</a> for details.</p>
        <table class="uib-info-tb table table-sm">
            <tr><th>userDir</th><td>${RED.settings.userDir}</td></tr>
            <tr><th>httpNodeRoot</th><td>${uib.nodeRoot}</td></tr>
            <tr><th>Node-RED Version</th><td>${RED.settings.version}</td></tr>
            <tr><th>Min. Version Required by uibuilder</th><td>${uib.me['node-red'].version}</td></tr>
        </table>
        <h4>Dump of all settings.js entries</h4>
        <pre>${syntaxHighlight( RED.settings, 100000 )}</pre>
        

        <h3>Node.js</h3>
        <table class="uib-info-tb table table-sm">
            <tr><th>Version</th><td>${uib.nodeVersion.join('.')}</td></tr>
            <tr><th>Min. version required by uibuilder</th><td>${uib.me.engines.node}</td></tr>
        </table>
    `
    /** ExpressJS Configuration info */
    page += /* html */`
        <h2>ExpressJS Configuration</h2>
        <p>
            See the <a href="https://expressjs.com/en/api.html#app.settings.table" target="_blank">ExpressJS documentation</a> for details.
            Note that ExpressJS Views are not currently used by uibuilder
        </p>
        <table class="uib-info-tb table table-sm">
            <tr><th>Views Folder</th><td>${web.app.get('views')}</td></tr>
            <tr><th>Views Engine</th><td>${web.app.get('view engine')}</td></tr>
            <tr><th>Views Cache</th><td>${web.app.get('view cache')}</td></tr>
        </table>
        <h3>app.locals</h3>
        <pre>${syntaxHighlight( web.app.locals )}</pre>
        <h3>app.mountpath</h3>
        <pre>${syntaxHighlight( web.app.mountpath )}</pre>
    `
    // Show the ExpressJS paths currently defined
    // web.routers contains descriptive info on routes, routes.user contains the ExpressJS route stack info.
    page += /* html */`
        <h2>UIBUILDER ExpressJS Routes</h2>
        <p>These tables show all of the web URL routes for UIBUILDER.</p>
        <h3>Client-Facing Routes</h3>
        ${web.htmlBuildTable( web.routers.user, ['name', 'desc', 'path', 'type', 'folder'] )}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Application Routes (<code>../*</code>)</h5>
        ${web.htmlBuildTable( routes.user.app, ['name', 'path', 'folder', 'route'] )}
        <h5>UIBUILDER generic Routes (<code>../uibuilder/*</code>)</h5>
        ${web.htmlBuildTable( routes.user.uibRouter, ['name', 'path', 'folder', 'route'] )}
        <h5>Vendor Routes (<code>../uibuilder/vendor/*</code>)</h5>
        ${web.htmlBuildTable( routes.user.vendorRouter, ['name', 'path', 'folder', 'route'] )}
        <hr>
        <h3>Per-Instance Client-Facing Routes</h3>
    `
    Object.keys(routes.instances).forEach( (url) => {
        page += /* html */`
            <h4>${url}</h4>
            ${web.htmlBuildTable( web.routers.instances[url], ['name', 'desc', 'path', 'type', 'folder'] )}
            <h5>ExpressJS technical route data for <code>${url}</code> (<code>../${url}/*</code>)</h5>
            ${web.htmlBuildTable( routes.instances[url], ['name', 'path', 'folder', 'route'] )}
        `
    } )
    page += /* html */`
        <hr>
        <h3>Admin-Facing Routes</h3>
        ${web.htmlBuildTable( web.routers.admin, ['name', 'desc', 'path', 'type', 'folder'] )}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Node-RED Admin Routes (<code>../*</code>)</h5>
        <p>Note: Shows ALL Node-RED top-level admin routes, not just UIBUILDER</p>
        ${web.htmlBuildTable( routes.admin.app, ['name', 'path', 'folder', 'route'] )}
        <h5>Admin UIBUILDER Routes (<code>../uibuilder/*</code>)</h5>
        ${web.htmlBuildTable( routes.admin.admin, ['name', 'path', 'folder', 'route'] )}
        <h5>Admin v3 API Routes (<code>../uibuilder/admin</code>)</h5>
        <p>Note: This route uses the following methods: all, get, put, post, delete.</p>
        ${web.htmlBuildTable( routes.admin.v3, ['name', 'path', 'folder', 'route'] )}
    `
    page += '</section></main></body></html>'
    return page
}

/** Return diagnostics information as JSON
 * @return {object} An object containing diagnostics information
 */
function diagnostics() {
    const RED = uib.RED
    const myroot = uib.nodeRoot === '' ? '/' : uib.nodeRoot
    let serverLocation
    if (uib.customServer.isCustom === true ) {
        serverLocation = [
            `${uib.customServer.type}://${uib.customServer.host}:${uib.customServer.port}${uib.nodeRoot}`,
            `${uib.customServer.type}://localhost:${uib.customServer.port}${myroot}`
        ]
    } else {
        [
            `${RED.settings.https ? 'https' : 'http'}://${RED.settings.uiHost}:${RED.settings.uiPort}${myroot}`,
        ]
    }
    return {
        version: uib.version,
        rootFolder: uib.rootFolder,
        configFolder: uib.configFolder,
        commonFolder: uib.commonFolder,
        serverLocation: serverLocation,
        installedLibraries: Object.keys(packageMgt.uibPackageJson.uibuilder.packages),
        uib: uib,
    }
}

// ! incomplete
/** Debug routes
 * @param {express.Request} req Request object
 * @param {express.Response} res Response object
 * @param {express.NextFunction} next next handler
 */
function doDebug(req, res, next) {
    res.set('X-UIB-Admin-APIv3')
    res.statusMessage = 'UIB Admin API v3 Debug'
    // Node-RED populates req.user if a session exists
    clog.info({
        // @ts-ignore
        allparams: res?.allparams ?? Object.assign({}, req.query, req.body, req.params),
        originalUrl: req.originalUrl,
        url: req.url,
        authInfo: req.authInfo,
        isAuthenticated: req.isAuthenticated,
        isUnauthenticated: req.isUnauthenticated,
        statusMessage: req.statusMessage,
        user: req.user ?? 'Unauthenticated',
        secure: req.secure,
        headers: req.headers,
        // @ts-ignore
        uibSec: res?.uibSec ?? 'Not yet set',
    })
    next()
}

/** Get the description & options HTML for an element and return to caller
 * @param {object} params All parameters from the HTTP call
 * @param {string} rootFolder uibuilder's root folder
 * @param {express.Request} req ExpressJS request object
 * @param {express.Response} res ExpressJS response object
 */
function doGetOneElement(params, rootFolder, req, res) {
    const rootPath = [__dirname, '..', 'elements']

    let optsHtml = '' // eslint-disable-line no-useless-assignment
    let descHtml = '' // eslint-disable-line no-useless-assignment

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

/** Get the actual URL & admin root for uibuilder admin pages
 * @param {express.Request} req ExpressJS request object
 * @return {[URL, string]} The URL & admin root
 */
function getAdminUrlPrefix(req) {
    // If using proxy, correct the URL's
    let url = new URL(`${req.protocol}://${req.headers.host}${req.originalUrl}`)
    if (req.headers.referer) url = new URL(req.headers.referer)
    else if (req.headers.origin) url = new URL(req.headers.origin)
    const adminRoot = url.pathname.replace(/\/uibuilder\/admin\/.*/, '/')
    return [url, adminRoot]
}

// #endregion === Utility functions === //

// TODO: Not yet in use
// ! Incomplete: We must recurse through sub-routers. Vendor routes missing for example.
/** Return a hierarchical list of all routes
 * @param {*} web Reference to uibuilder's web library
 * @param {*} routerStack ExpressJS router stack
 * @param {*} parentPath Parent path
 * @return {object} route hierarchy
 */
function getAllRoutes(web, routerStack, parentPath = '') {
    let route
    const mw = []
    routerStack.forEach( (layer) => { // Each is an Express route Layer
        const layerName = layer.name
        const layerPath = web.layerPath(layer)
        // const r = layer.regexp.toString().replace('/^\\', '').replace('/?(?=\\/|$)/i', '').replace('\\', '')
        const mwl = {
            name: layerName,
            layerPath: parentPath + layerPath,
            route: layer.route,
            routes: [],
        }
        if (layer.route) { // routes registered directly on the app
            const path = layer.route.path
            const methods = layer.route.methods
            mwl.routes.push({ path: path, methods: Object.keys(methods).join(', '), type: 'direct', })
        } else if (layer.name === 'router') { // router middleware
            if (layer.handle?.stack) {
                layer.handle?.stack.forEach(function(handler) {
                    route = handler.route
                    if (route) {
                        mwl.routes.push({
                            path: route.path,
                            methods: Object.keys(route.methods).join(', '),
                            // stack: route.stack.map(({ name, }) => name),
                            stack: getAllRoutes(web, layer.handle.stack, `${layerPath}/${route.path}`),
                        })
                    }
                })
                // mwl.routes.push(getAllRoutes(web, layer.handle.stack, `${layerPath}/`))
            }
        }
        mw.push(mwl)
    })
    return mw
}

// Standard authorisation permissions using Node-RED's admin permissions
// @example: v3AdminRouter.use(needsRead) or add before verb function `.get(needsRead, function v3AdminGet(){...})`
const needsRead = uib.RED.auth.needsPermission('flows.read')
const needsWrite = uib.RED.auth.needsPermission('flows.write')

/** Kill a running process (if exists in runningProcesses)
 * @param {string} processId Process ID to kill
 * @param {string} url The URL of the request
 * @param {string} scriptName The name of the script to kill
 * @return {boolean} True if the process was killed, else false
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

/** uibuilder v3 unified Admin API router (./uibuilder/admin/<uib-node-url>) - new API commands should be added here
 * Typical URL (with httpAdminRoot set to /red): http://127.0.0.1:1880/red/uibuilder/admin/:url?cmd=listfolders
 * or (NR defaults): http://127.0.0.1:1880/uibuilder/admin/:url?cmd=listfolders
 */
v3AdminRouter.route('/:url')
    // For all routes (this function is called before more specific ones) - don't add authorisation to this
    .all(function v3AdminAll(/** @type {express.Request} */ req, /** @type {express.Response} */ res, /** @type {express.NextFunction} */ next) {
        // @ts-ignore + Make sure that cmd has a default of ''
        const params = res.allparams = Object.assign({ cmd: '', }, req.query, req.body, req.params)
        params.type = 'all'
        // @ts-ignore - Add pseudo uibuilder security settings summary to the response object
        res.uibSec = {
            authInfo: req.authInfo,
            isAuthenticated: req.isAuthenticated,
            isUnauthenticated: req.isUnauthenticated,
            statusMessage: req.statusMessage,
            user: req.user ?? 'Unauthenticated',
            secure: req.secure,
        }
        // params.headers = req.headers

        // Validate URL - params.url - 0>length<21, must not contain path traversal strings
        const chkUrl = chkParamUrl(params)
        if ( chkUrl.status !== 0 ) {
            log.error(`🌐🛑[uibuilder:adminRouterV3:ALL] Admin API. ${chkUrl.statusMessage}`)
            res.statusMessage = chkUrl.statusMessage
            res.status(chkUrl.status).end()
            return
        }
        next()
    })
    // }, doDebug) // Debug routing (uses clog.info) - leave commented out unless debugging

    // Get something and return it - if NR admin auth applied, read authorisation required
    .get(needsRead, function v3AdminGet(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        if (uib.rootFolder === null) throw errUibRootFldr

        // @ts-ignore
        const params = res.allparams
        params.type = 'get'

        // Commands ...
        switch (params.cmd) {
            // See if a node's custom folder exists. Return true if it does, else false
            case 'checkfolder': {
                log.trace(`🌐[uibuilder:adminRouterV3:GET:checkfolder] See if a node's custom folder exists. URL: ${params.url}`)

                const folder = path.join( uib.rootFolder, params.url)

                fslib.access(folder, fslib.constants.F_OK)
                    .then( () => {
                        res.statusMessage = 'Folder checked, exists'
                        res.status(200).json( true )
                        return true
                    })
                    .catch( () => { // err) => {
                        res.statusMessage = 'Folder checked, does not exist'
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
                log.trace(`🌐[uibuilder:adminRouterV3:GET:checkurls] Check if URL is already in use. URL: ${params.url}`)

                /** @return {boolean} True if the given url exists, else false */
                const chkInstances = Object.values(uib.instances).includes(params.url)
                const chkFolders = fslib.existsSync(uib.rootFolder, params.url)

                res.statusMessage = 'Instances and Folders checked'
                res.status(200).json( chkInstances || chkFolders )

                break
            }

            // Get the docs/changelog-highlights.md file content
            case 'getChangeSummary': {
                log.trace('🌐[uibuilder:adminRouterV3:GET:getChangeSummary] Returning the contents of docs/changelog-highlights.md')
                const fname = path.join(__dirname, '..', '..', 'docs', 'changelog-highlights.md')
                const fileContent = fslib.readFileSync(fname, 'utf8')
                res.statusMessage = 'Change summary returned'
                res.status(200).send(fileContent)
                break
            }

            // Get list of all available no-code elements
            case 'getElements': {
                res.statusMessage = 'No-code elements list returned'
                res.status(200).json( elements )
                break
            }

            // Return the content of a file in the `<uibRoot>/<url>/src` folder
            case 'getfile': {
                // if fldr = root, no folder
                if ( params.folder === 'root' ) params.folder = ''

                // @ts-ignore
                const filePathRoot = path.join(uib.rootFolder, params.url, params.folder)
                // @ts-ignore
                const filePath = path.join(filePathRoot, params.fname)

                // Does the file exist?
                if ( fslib.existsSync(filePath) ) {
                    // Send back a plain text response body containing content of the file
                    res.type('text/plain').sendFile(
                        // @ts-ignore
                        req.query.fname,
                        {
                            // Prevent injected relative paths from escaping `src` folder
                            root: filePathRoot,
                            // Turn off caching
                            lastModified: false,
                            cacheControl: false,
                            dotfiles: 'allow',
                        }
                    )
                } else {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:GET:getfile] Admin API. File does not exist '${filePath}'. url=${params.url}`)
                    res.statusMessage = 'File does not exist'
                    res.status(500).end()
                }

                break
            }

            case 'getLibraries': {
                res.json( packageMgt.uibPackageJson.uibuilder.packages )
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
                log.trace(`🌐[uibuilder:adminRouterV3:GET] Admin API. List all folders and files. url=${params.url}, root fldr=${uib.rootFolder}`)

                // get list of all (sub)folders (follow symlinks as well)
                const out = { root: [], }
                const root2 = uib.rootFolder.replace(/\\/g, '/')
                fslib.fgStream(
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
                log.trace(`🌐[uibuilder:adminRouterV3:GET] Admin API. List all folders. url=${params.url}, root fldr=${uib.rootFolder}`)

                // get list of all (sub)folders (follow symlinks as well)
                // const out = { 'root': [] }
                const out = []
                const root2 = uib.rootFolder.replace(/\\/g, '/')
                fslib.fgStream(
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

                /** @return {boolean} True if the given url exists, else false */
                // let chkInstances = Object.values(uib.instances).includes(params.url)
                // let chkFolders = fslib.existsSync(path.join(uib.rootFolder, params.url))

                res.statusMessage = 'Instances listed'
                res.status(200).json( uib.instances )

                break
            }

            // TODO: Return a list of all user urls in use by ExpressJS
            // ! Incomplete: We must recurse through sub-routers. Vendor routes missing for example.
            case 'listurls': {
                const routes = []
                // @ts-ignore
                const web = require('./web.cjs') // late loading to avoid circular dependency
                const routerStack = web.appStack(web.app)
                // clog.info({routerStack})
                const mw = getAllRoutes(web, routerStack)

                log.trace('🌐[uibuilder:adminRouterV3:GET:listurls] Admin API. List of all user urls in use.')
                res.statusMessage = 'URLs listed successfully'
                res.status(200).json(mw)

                break
            }

            //
            case 'showapps': {
                // Correct the admin URL's for proxies and httpAdminRoot
                const [adminURL, adminRoot] = getAdminUrlPrefix(req)
                res.send( appsPage(adminURL, adminRoot) )
                break
            }

            // Shows the all-details index page for uibuilder or alternate output formats
            case 'showdetails': {
                log.trace('🌐[uibuilder:admin-api-v3:showalldetails] User Page/API. List all available uibuilder endpoints')

                if (!params.output) params.output = 'html'

                // Correct the admin URL's for proxies and httpAdminRoot
                const [adminURL, adminRoot] = getAdminUrlPrefix(req)

                /** Return full details based on "output" parameter */
                switch (params.output) {
                    case 'short': {
                        res.json({
                            actual: {
                                adminOrigin: adminURL,
                                adminRoot: adminRoot,
                            },
                            nr: {
                                httpRoot: uib.RED.settings.httpRoot,
                                httpAdminRoot: uib.RED.settings.httpAdminRoot,
                                uiPort: uib.RED.settings.uiPort,
                            },
                            uib: {
                                isCustom: uib.customServer.isCustom,
                                port: uib.customServer.port,
                                type: uib.customServer.type,
                                httpRoot: uib.httpRoot,
                            },
                        })
                        break
                    }
                    case 'diagnostics': {
                        res.json(diagnostics())
                        break
                    }
                    case 'json': {
                        res.json(uib.instances)
                        break
                    }
                    case 'urls': {
                        res.json(Object.values(uib.instances))
                        break
                    }
                    // default to 'html' output type
                    case 'html':
                    default: {
                        res.status(200).send( detailsPage(adminURL, adminRoot) )
                        break
                    }
                }
                break
            }

            // Shows the details page for a specific uibuilder instance
            case 'showinstancedetails': {
                // @ts-ignore
                const web = require('./web.cjs') // late loading to avoid circular dependency
                res.status(200).send( web.showInstanceDetails(req, null, uib.apps[params.url].node) )
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
    .put(needsWrite, function v3AdminPut(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        if (uib.rootFolder === null) throw errUibRootFldr
        // @ts-expect-error
        const params = res.allparams
        params.type = 'put'
        const fullname = path.join(uib.rootFolder, params.url)
        // Commands ...
        switch (params.cmd) {
            // Tell uibuilder to delete the instance local folder when this instance is deleted - see html file oneditdelete & uiblib.processClose
            case 'deleteondelete': {
                log.trace(`🌐[uibuilder:adminRouterV3:PUT:deleteondelete] url=${params.url}`)
                uib.deleteOnDelete[params.url] = true
                res.statusMessage = 'PUT successful'
                res.status(200).json({})
                return
            }
            // npm install/remove handling
            case 'updatepackage':
            case 'installpackage': {
                log.trace(`🌐[uibuilder:adminRouterV3:PUT:installpackage] package="${params.package}". url="${params.url}" (ignored)`)
                if (!params.package) {
                    res.json({ success: false, result: 'Package name not supplied', })
                    return
                }
                // Create a unique process ID for this script execution
                const processId = `uibApiV3Put_installpackage:${params.url}:${params.package}:${Date.now().toString()}`
                // asyncLocalStorage captures the context for async functions so we can handle async outputs in a synchronous way
                asyncLocalStorage.run({ requestId: processId, }, async () => {
                    try {
                        const npmOutput = await packageMgt.npmInstallPackage(params.package, params.tag, '', 'install', false)
                        // Get the updated package.json file into packageMgt.uibPackageJson
                        packageMgt.uibPackageJson = packageMgt.pkgCheck()
                        // Do a fast update of the min data in pj.uibuilder.packages required for web.serveVendorPackages()
                        packageMgt.pkgsQuickUpd()
                        // ASYNC - Update details and re-save the file - no need to wait
                        packageMgt.updateInstalledPackageDetails()
                        // Update the packageList
                        const web = require('./web.cjs') // late loading to avoid circular dependency
                        web.serveVendorPackages()

                        res.json({ success: true, result: [npmOutput, packageMgt.uibPackageJson.uibuilder.packages], })
                        log.info(`🌐[uibuilder:adminRouterV3:PUT:installPackage] Admin API. Added/updated package "${params.package}". \n${npmOutput.all}\n\n`)
                    } catch (err) {
                        clog.error('npmInstallPacckage error.', err)
                        // err has extra props: {all:string, code:number, command:string}
                        log.error(`🌐🛑[uibuilder:adminRouterV3:PUT:installpackage] Admin API. ERROR Running: \n'${err.command}' \n${err.all}\n\n`)
                        res.json({ success: false, result: err.all, })
                    }
                })
                return
            }
            case 'removepackage': {
                log.trace(`🌐[uibuilder:adminRouterV3:PUT:removepackage] package="${params.package}". url="${params.url}" (ignored)`)
                if (!params.package) {
                    res.json({ success: false, result: 'Package name not supplied', })
                    return
                }

                // Create a unique process ID for this script execution
                const processId = `uibApiV3Put_removepackage:${params.url}:${params.package}:${Date.now().toString()}`
                // asyncLocalStorage captures the context for async functions so we can handle async outputs in a synchronous way
                asyncLocalStorage.run({ requestId: processId, }, async () => {
                    try {
                        const npmOutput = await packageMgt.npmRemovePackage(params.package, false)
                        // Get the updated package.json file into packageMgt.uibPackageJson
                        packageMgt.uibPackageJson = packageMgt.pkgCheck()
                        // Do a fast update of the min data in pj.uibuilder.packages required for web.serveVendorPackages()
                        packageMgt.pkgsQuickUpd()
                        // ASYNC - Only need this to re-save the file - no need to wait
                        packageMgt.updateInstalledPackageDetails()
                        // Update the packageList
                        const web = require('./web.cjs') // late loading to avoid circular dependency
                        web.serveVendorPackages()

                        res.json({ success: true, result: npmOutput, })
                        log.info(`🌐[uibuilder:adminRouterV3:PUT:removePackage] Admin API. Removed package "${params.package}". \n${npmOutput.all}\n\n`)
                    } catch (err) {
                        log.warn(`🌐⚠️[uibuilder:apiv3:uibnpmmanage:remove] Admin API. ERROR Running: \n'${err.command}' \n${err.all}\n\n`)
                        res.json({ success: false, result: err.all, })
                    }
                })
                return
            }
            // Run an instance npm script, returning the output
            // Note that only valid, pre-defined npm scripts can be executed by packageMgt.npmRunScript
            case 'runInstanceNpmScript': {
                log.trace(`🌐[uibuilder:adminRouterV3:PUT:runInstanceNpmScript] Running script. url="${params.url}", script="${params.scriptName}"`)
                if (!params.scriptName) {
                    res.json({ success: false, result: 'NPM script name not supplied', })
                    return
                }
                // Create a unique process ID for this script execution
                const processId = `uibApiV3Put_runInstanceNpmScript:${params.url}:${params.scriptName}:${Date.now().toString()}`
                // asyncLocalStorage captures the context for async functions so we can handle async outputs in a synchronous way
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
            // case for killing processes using asyncLocalStorage
            case 'killInstanceNpmScript': {
                log.trace(`🌐[uibuilder:adminRouterV3:PUT:killInstanceNpmScript] processId="${params.processId}"`)
                if (!params.processId) {
                    res.json({ success: false, result: 'Process ID not supplied', })
                    return
                }
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

    // Load new template, Create a new folder or file or save a file
    .post(needsWrite, function v3AdminPost(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        if (uib.rootFolder === null) throw errUibRootFldr

        // @ts-ignore
        const params = res.allparams
        params.type = 'post'

        switch (params.cmd) {
            case 'replaceTemplate': {
                fslib.replaceTemplate({
                    url: params.url,
                    template: params.template,
                    extTemplate: params.extTemplate,
                    cmd: params.cmd,
                    templateConf,
                    uib,
                    log,
                })
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
                        let statusMsg = ''
                        let mystr = ''
                        const data = {}
                        if ( err.cause.code === 'MISSING_REF' ) {
                            statusMsg = `Degit clone error. CHECK External Template Name. Name="${params.extTemplate}", url="${params.url}". ${err.message}`
                        } else {
                            if ( params.template === 'external' ) mystr = `, ${params.extTemplate}`
                            statusMsg = `Replace template error. ${err.message}. url=${params.url}. ${params.template}${mystr}`
                        }
                        log.error(`🌐🛑[uibuilder:adminapiv3:POST:replaceTemplate] ${statusMsg}`, err)
                        // console.log(err.stack)
                        data.code = err?.cause?.code
                        data.ref = err?.cause?.ref
                        res.statusMessage = statusMsg
                        res.status(500).json({ statusMsg, data, })
                    } )
                break
            }

            case 'newfolder':
            case 'newfile': {
                // Validate folder name - params.folder - 0>chars<256, no `..`
                const chkFldr = chkParamFldr(params)
                if ( chkFldr.status !== 0 ) {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFldr.statusMessage
                    res.status(chkFldr.status).end()
                    return
                }
                // If newfile, validate file name - params.fname - <256 chars, no `..`, `/`, or `\`
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
                break
            }

            case 'saveFile': {
                // #region ====== Parameter validation ====== //
                // NOTE: url already checked
                const chkFname = chkParamFname(params) // <256 chars, no `..`, `/`, or `\`
                if ( chkFname.status !== 0 ) {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:post:saveFile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFname.statusMessage
                    res.status(chkFname.status).end()
                    return
                }
                const chkFldr = chkParamFldr(params) // 0>chars<256, no `..`
                if ( chkFldr.status !== 0 ) {
                    log.error(`🌐🛑[uibuilder:adminRouterV3:post:saveFile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
                    res.statusMessage = chkFldr.statusMessage
                    res.status(chkFldr.status).end()
                    return
                }
                // #endregion ====== ====== //
                log.trace(`🌐[uibuilder[:adminRouterV3:post:saveFile] Admin API. File put requested. url=${params.url}, file=${params.folder}/${params.fname}, reload? ${params.reload}`)
                // Fix for Issue #155 - if fldr = root, no folder
                if ( params.folder === 'root' ) params.folder = '.'
                const fullname = path.join(uib.rootFolder, params.url, params.folder, params.fname)
                fslib.writeFileCb(fullname, params.data, function (err) {
                    if (err) {
                        // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                        log.error(`🌐🛑[uibuilder:adminRouterV3:post:saveFile] Admin API. File write FAIL. url=${params.url}, file=${params.folder}/${params.fname}. ${err.message}`, err)
                        res.statusMessage = err.message
                        res.status(500).json({ statusMessage: res.statusMessage, })
                    } else {
                        // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                        log.trace(`🌐[uibuilder:adminRouterV3:post:saveFile] Admin API. File write SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                        res.statusMessage = 'File written successfully'
                        res.status(200).json({ statusMessage: res.statusMessage, })
                        // Reload connected clients if required by sending them a reload msg
                        // if ( params.reload === 'true' ) {
                        //     sockets.sendToFe2(
                        //         {
                        //             _uib: {
                        //                 reload: true,
                        //             },
                        //         },
                        //         // @ts-ignore
                        //         {
                        //             url: params.url,
                        //         }
                        //     )
                        // }
                    }
                })
                break
            }

            default: {
                // Validate command
                const statusMsg = `cmd parameter not present or wrong value. url=${params.url}, cmd=${params.cmd}`
                log.error(`🌐🛑[uibuilder:adminRouterV3:POST] Admin API. ${statusMsg}`)
                res.statusMessage = statusMsg
                res.status(500).end()
                break
            }
        }
    })

    // Delete a folder or a file
    .delete(needsWrite, function v3AdminDelete(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
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
 *  patch, report, search, options ?
 */

module.exports = v3AdminRouter

clog.debug('Loaded')
