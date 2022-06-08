/** v2 Admin API ExpressJS Router Handler
 *
 * See: https://expressjs.com/en/4x/api.html#router, https://expressjs.com/en/guide/routing.html
 *
 * Copyright (c) 2021-2022 Julian Knight (Totally Information)
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
// const uiblib = require('./uiblib')  // Utility library for uibuilder
const web = require('./web')
const sockets = require('./socket')
const packageMgt                    = require('./package-mgt')
const tilib  = require('./tilib')   // General purpose library (by Totally Information)

const v2AdminRouter = express.Router() // eslint-disable-line new-cap

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

/** uibuilder detailed information page
 * @param {uibConfig} uib Reference to uibuilder's master uib object
 * @param {string} urlPrefix The URL href prefix
 * @returns {string} HTML string output
 */
function detailsPage(uib, urlPrefix) {
    const RED = uib.RED
    const routes = web.dumpRoutes(false)
    const urlRoot = `${urlPrefix}${uib.nodeRoot.replace('/', '')}${uib.moduleName}`

    const uibSummary = JSON.parse(JSON.stringify(uib))
    delete uibSummary.me
    delete uibSummary.RED

    // Build the web page
    let page = `
        <!doctype html><html lang="en"><head>
            <title>Uibuilder Index</title>
            <link rel="icon" href="${urlRoot}/common/images/node-blue.ico">
            <link type="text/css" rel="stylesheet" href="${urlRoot}/uib-styles.css" media="screen">
            <style type="text/css" rel="stylesheet" media="all">
                h2 { border-top:1px solid silver;margin-top:1em;padding-top:0.5em; }
                .col3i tbody>tr>:nth-child(3){ font-style:italic; }
            </style>
        </head><body class="uib"><div class="container">
            <h1>uibuilder Detailed Information Page</h1>
            <p>
                Note that this page is only accessible to users with Node-RED admin authority.
            </p>
    `

    /** Index of uibuilder instances */
    page += `
            <h2>Index of uibuilder pages</h2>
            <p>'Folders' refer to locations on your Node-RED's server. 'Paths' refer to URL's in the browser.</p>
            <table class="uib-info-tb table table-sm">
                <thead><tr>
                    <th>URL</th>
                    <th title="Use this to search for the source node in the admin ui">Source Node Instance <a href="#i2"><sup>(2)</sup></th>
                    <th>Server Filing System Folder</th>
                </tr></thead><tbody>
    `
    Object.keys(uib.instances).forEach(key => {
        page += `
            <tr>
                <td><a href="${urlPrefix}${tilib.urlJoin(uib.nodeRoot, uib.instances[key]).replace('/', '')}" target="_blank">${uib.instances[key]}</a></td>
                <td>${key}</td>
                <td>${path.join(uib.rootFolder, uib.instances[key])}</td>
            </tr>
        `
    })
    page += `
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
    page += `
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
    Object.keys(installedPackages).forEach(packageName => {
        const pj = installedPackages[packageName]

        page += `
            <tr>
                <td><a href="${pj.homepage}" title="Click to go to package's home page">${packageName}</a></td>
                <td title="Installed Version, Version Spec='${pj.spec}'">${pj.installedVersion}</td>
                <td title="Use this in your front-end code">${pj.url}</td>
                <td>${pj.installFolder}</td>
            </tr>
        `
    })
    page += `
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
    page += `
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
                <td>${uib.rootFolder}</td>
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
        <pre>${tilib.syntaxHighlight( uibSummary )}</pre>

        <h4>Dump of all uib settings.js entries</h4>
        <pre>${tilib.syntaxHighlight( RED.settings.uibuilder ? RED.settings.uibuilder : 'NOT DEFINED' )}</pre>

        <h3>Node-RED</h3>
        <p>See the <code>&lt;userDir&gt;/settings.js</code> file and the 
        <a href="https://nodered.org/docs/" target="_blank">Node-RED documentation</a> for details.</p>
        <table class="uib-info-tb table table-sm">
            <tr><th>userDir</th><td>${RED.settings.userDir}</td></tr>
            <tr><th>httpNodeRoot</th><td>${uib.nodeRoot}</td></tr>
            <tr><th>Node-RED Version</th><td>${RED.settings.version}</td></tr>
            <tr><th>Min. Version Required by uibuilder</th><td>${uib.me['node-red'].version}</td></tr>
        </table>

        <h3>Node.js</h3>
        <table class="uib-info-tb table table-sm">
            <tr><th>Version</th><td>${uib.nodeVersion.join('.')}</td></tr>
            <tr><th>Min. version required by uibuilder</th><td>${uib.me.engines.node}</td></tr>
        </table>
    `

    /** ExpressJS Configuration info */
    page += `
        <h2>ExpressJS Configuration</h2>
        <p>
            See the <a href="https://expressjs.com/en/api.html#app.settings.table" target="_blank">ExpressJS documentation</a> for details.
            Note that ExpressJS Views are not current used by uibuilder
        </p>
        <table class="uib-info-tb table table-sm">
            <tr><th>Views Folder</th><td>${web.app.get('views')}</td></tr>
            <tr><th>Views Engine</th><td>${web.app.get('view engine')}</td></tr>
            <tr><th>Views Cache</th><td>${web.app.get('view cache')}</td></tr>
        </table>
        <h3>app.locals</h3>
        <pre>${tilib.syntaxHighlight( web.app.locals )}</pre>
        <h3>app.mountpath</h3>
        <pre>${tilib.syntaxHighlight( web.app.mountpath )}</pre>
    `

    // Show the ExpressJS paths currently defined
    // web.routers contains descriptive info on routes, routes.user contains the ExpressJS route stack info.
    // console.log('>> web >>', web.htmlBuildTable( web.routers.user, ['name', 'desc', 'path', 'type', 'folder'] ))
    page += `
        <h2>uibuilder ExpressJS Routes</h2>
        <p>These tables show all of the web URL routes for uibuilder.</p>
        <h3>User-Facing Routes</h3>
        ${web.htmlBuildTable( web.routers.user, ['name', 'desc', 'path', 'type', 'folder'] )}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Application Routes (<code>../*</code>)</h5>
        ${web.htmlBuildTable( routes.user.app, ['name', 'path', 'folder', 'route'] )}
        <h5>uibuilder generic Routes (<code>../uibuilder/*</code>)</h5>
        ${web.htmlBuildTable( routes.user.uibRouter, ['name', 'path', 'folder', 'route'] )}
        <h5>Vendor Routes (<code>../uibuilder/vendor/*</code>)</h5>
        ${web.htmlBuildTable( routes.user.vendorRouter, ['name', 'path', 'folder', 'route'] )}
        <hr>
        <h3>Per-Instance User-Facing Routes</h3>
    `
    Object.keys(routes.instances).forEach( url => {
        page += `
            <h4>${url}</h4>
            ${web.htmlBuildTable( web.routers.instances[url], ['name', 'desc', 'path', 'type', 'folder'] )}
            <h5>ExpressJS technical route data for <code>${url}</code> (<code>../${url}/*</code>)</h5>
            ${web.htmlBuildTable( routes.instances[url], ['name', 'path', 'folder', 'route'] )}
        `
    } )
    page += `
        <hr>
        <h3>Admin-Facing Routes</h3>
        ${web.htmlBuildTable( web.routers.admin, ['name', 'desc', 'path', 'type', 'folder'] )}
        <h4>ExpressJS technical route data for admin routes</h4>
        <h5>Node-RED Admin Routes (<code>../*</code>)</h5>
        <p>Note: Shows ALL Node-RED top-level admin routes, not just uibuilder</p>
        ${web.htmlBuildTable( routes.admin.app, ['name', 'path', 'folder', 'route'] )}
        <h5>Admin uibuilder Routes (<code>../uibuilder/*</code>)</h5>
        ${web.htmlBuildTable( routes.admin.admin, ['name', 'path', 'folder', 'route'] )}
        <h5>Admin v3 API Routes (<code>../uibuilder/admin</code>)</h5>
        <p>Note: This route uses the following methods: all, get, put, post, delete.</p>
        ${web.htmlBuildTable( routes.admin.v3, ['name', 'path', 'folder', 'route'] )}
        <h5>Admin v2 API Routes (<code>../uibuilder/*</code>)</h5>
        ${web.htmlBuildTable( routes.admin.v2, ['name', 'path', 'folder', 'route'] )}
    `

    page += '</div></body></html>'

    return page
}

/** Return a router but allow parameters to be passed in
 * @param {uibConfig} uib Reference to uibuilder's master uib object
 * @param {*} log Reference to uibuilder's log functions
 * @returns {express.Router} The v3 admin API ExpressJS router
 */
function adminRouterV2(uib, log) {

    /** uibuilder v3 unified Admin API router - new API commands should be added here */
    // admin_Router_V3.route('/:url')

    const RED = uib.RED

    /** Create a simple NR admin API to return the content of a file in the `<userLib>/uibuilder/<url>/src` folder
     * @param {string} url The admin api url to create
     * @param {object} permissions The permissions required for access
     * @param {Function} cb
     **/
    v2AdminRouter.get('/uibgetfile', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        //#region --- Parameter validation ---
        /** req.query parameters
         * url
         * fname
         * folder
         */
        const params = req.query

        // @ts-ignore
        const chkUrl = chkParamUrl(params)
        if ( chkUrl.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkUrl.statusMessage}`)
            res.statusMessage = chkUrl.statusMessage
            res.status(chkUrl.status).end()
            return
        }

        // @ts-ignore
        const chkFname = chkParamFname(params)
        if ( chkFname.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFname.statusMessage
            res.status(chkFname.status).end()
            return
        }

        // @ts-ignore
        const chkFldr = chkParamFldr(params)
        if ( chkFldr.status !== 0 ) {
            log.error(`[uibuilder:uibgetfile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFldr.statusMessage
            res.status(chkFldr.status).end()
            return
        }
        //#endregion ---- ----

        log.trace(`[uibuilder:uibgetfile] Admin API. File get requested. url=${params.url}, file=${params.folder}/${params.fname}`)

        // if fldr = root, no folder
        if ( params.folder === 'root' ) params.folder = ''

        // @ts-ignore
        const filePathRoot = path.join(uib.rootFolder, params.url, params.folder)
        // @ts-ignore
        const filePath = path.join(filePathRoot, req.query.fname)

        // Does the file exist?
        if ( fs.existsSync(filePath) ) {
            // Send back a plain text response body containing content of the file
            res.type('text/plain').sendFile(
                // @ts-ignore
                req.query.fname,
                {
                    // Prevent injected relative paths from escaping `src` folder
                    'root': filePathRoot,
                    // Turn off caching
                    'lastModified': false,
                    'cacheControl': false,
                    'dotfiles': 'allow',
                }
            )
        } else {
            log.error(`[uibuilder:uibgetfile] Admin API. File does not exist '${filePath}'. url=${params.url}`)
            res.statusMessage = 'File does not exist'
            res.status(500).end()
        }
    }) // ---- End of uibgetfile ---- //

    /** Create a simple NR admin API to UPDATE the content of a file in the `<userLib>/uibuilder/<url>/<folder>` folder
     * @param {string} url The admin api url to create
     * @param {object} permissions The permissions required for access (Express middleware)
     * @param {Function} cb
     **/
    v2AdminRouter.post('/uibputfile', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        //#region ====== Parameter validation ====== //
        const params = req.body

        const chkUrl = chkParamUrl(params)
        if ( chkUrl.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API v2. ${chkUrl.statusMessage}`)
            res.statusMessage = chkUrl.statusMessage
            res.status(chkUrl.status).end()
            return
        }

        const chkFname = chkParamFname(params)
        if ( chkFname.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API. ${chkFname.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFname.statusMessage
            res.status(chkFname.status).end()
            return
        }

        const chkFldr = chkParamFldr(params)
        if ( chkFldr.status !== 0 ) {
            log.error(`[uibuilder:uibputfile] Admin API. ${chkFldr.statusMessage}. url=${params.url}`)
            res.statusMessage = chkFldr.statusMessage
            res.status(chkFldr.status).end()
            return
        }
        //#endregion ====== ====== //

        log.trace(`[uibuilder:uibputfile] Admin API. File put requested. url=${params.url}, file=${params.folder}/${params.fname}, reload? ${params.reload}`)

        // Fix for Issue #155 - if fldr = root, no folder
        if ( params.folder === 'root' ) params.folder = '.'

        const fullname = path.join(uib.rootFolder, params.url, params.folder, params.fname)

        // eslint-disable-next-line no-unused-vars
        fs.writeFile(fullname, req.body.data, function (err, data) {
            if (err) {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.error(`[uibuilder:uibputfile] Admin API. File write FAIL. url=${params.url}, file=${params.folder}/${params.fname}`, err)
                res.statusMessage = err
                res.status(500).end()
            } else {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.trace(`[uibuilder:uibputfile] Admin API. File write SUCCESS. url=${params.url}, file=${params.folder}/${params.fname}`)
                res.statusMessage = 'File written successfully'
                res.status(200).end()
                // Reload connected clients if required by sending them a reload msg
                if ( params.reload === 'true' ) {
                    sockets.sendToFe2({
                        '_uib': {
                            'reload': true,
                        }
                    }, params.url)
                }
            }
        })
    }) // ---- End of uibputfile ---- //

    /** Create an index web page or JSON return listing all uibuilder endpoints
     * Also allows confirmation of whether a url is in use ('check' parameter) or a simple list of urls in use.
     */
    v2AdminRouter.get('/uibindex', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        log.trace('[uibindex] User Page/API. List all available uibuilder endpoints')

        // If using own Express server, correct the URL's
        const url = new URL(req.headers.referer)
        url.pathname = ''
        if (uib.customServer.port) {
            // @ts-expect-error ts(2322)
            url.port = uib.customServer.port
        }
        const urlPrefix = url.href

        /** Return full details based on type parameter */
        switch (req.query.type) {
            case 'json': {
                res.json(uib.instances)
                break
            }
            case 'urls': {
                res.json(Object.values(uib.instances))
                break
            }
            // default to 'html' output type
            default: {
                const page = detailsPage(uib, urlPrefix)
                res.send(page)
                break
            }
        }
    }) // ---- End of uibindex ---- //

    /** Check & update installed front-end library packages, return list as JSON - this runs when NR Editor is loaded if a uib instance deployed */
    v2AdminRouter.get('/uibvendorpackages', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {

        // Update the installed packages list
        // web.serveVendorPackages()

        res.json( packageMgt.uibPackageJson.uibuilder.packages )

    }) // ---- End of uibvendorpackages ---- //

    /** Call npm. Schema: {name:{(url),cmd}}
     * If url parameter not provided, uibPath = <userDir>, else uibPath = <uib.rootFolder>/<url>
     * Valid commands:
     *    install, remove, update
     *    * = run as npm command with --json output
     * @param {string} [req.query.url=userDir] Optional. If present, CWD is set to the uibuilder folder for that instance. Otherwise CWD is set to the userDir.
     * @param {string} req.query.cmd Command to run (see notes for this function)
     */
    v2AdminRouter.get('/uibnpmmanage', function(/** @type {express.Request} */ req, /** @type {express.Response} */ res) {
        //#region --- Parameter validation (cmd, package) ---

        const params = req.query

        // Validate the npm command to be used.
        if ( params.cmd === undefined ) {
            log.error('[uibuilder:API:uibnpmmanage] uibuilder Admin API. No command provided for npm management.')
            res.statusMessage = 'npm command parameter not provided'
            res.status(500).end()
            return
        }
        switch (params.cmd) {
            case 'install':
            case 'remove':
            case 'update':
                break

            default:
                log.error('[uibuilder:API:uibnpmmanage] Admin API. Invalid command provided for npm management.')
                res.statusMessage = 'npm command parameter is invalid'
                res.status(500).end()
                return
        }

        // package name must not exceed 255 characters
        // we have to have a package name
        if ( params.package === undefined ) {
            log.error('[uibuilder:API:uibnpmmanage] Admin API. package parameter not provided')
            res.statusMessage = 'package parameter not provided'
            res.status(500).end()
            return
        }
        if ( params.package.length > 255 ) {
            log.error('[uibuilder:API:uibnpmmanage] Admin API. package name parameter is too long (>255 characters)')
            res.statusMessage = 'package name parameter is too long. Max 255 characters'
            res.status(500).end()
            return
        }

        // If install/update, we need the node instance as well
        if ( params.cmd !== 'remove' ) {
            // @ts-ignore
            const chkUrl = chkParamUrl(params)
            if ( chkUrl.status !== 0 ) {
                log.error(`[uibuilder:API:uibnpmmanage] Admin API. ${chkUrl.statusMessage}`)
                res.statusMessage = chkUrl.statusMessage
                res.status(chkUrl.status).end()
                return
            }
        }

        //#endregion ---- ----

        const folder = RED.settings.userDir

        log.info(`[uibuilder:API:uibnpmmanage] Admin API. Running npm ${params.cmd} for package ${params.package} with tag/version '${params.tag}'`)

        // delete package lock file as it seems to mess up sometimes - no error if it fails
        fs.removeSync(path.join(folder, 'package-lock.json'))

        // Formulate the command to be run
        switch (params.cmd) {
            case 'update':
            case 'install': {
                // @ts-ignore
                packageMgt.npmInstallPackage(params.url, params.package, params.tag)
                    .then((npmOutput) => {
                        // let success = false

                        // Update the packageList
                        web.serveVendorPackages()

                        res.json({ 'success': true, 'result': [npmOutput, packageMgt.uibPackageJson.uibuilder.packages] })

                        // return success
                        return true
                    })
                    .catch((err) => {
                        // log.warn(`[uibuilder:API:uibnpmmanage] Admin API. ERROR Running npm ${params.cmd} for package ${params.package}`, err.stdout)
                        console.dir(err)
                        log.warn(`[uibuilder:API:uibnpmmanage:install] Admin API. ERROR Running: \n'${err.command}' \n${err.all}`)
                        res.json({ 'success': false, 'result': err.all })
                        return false
                    })
                break
            }
            case 'remove': {
                // @ts-ignore
                packageMgt.npmRemovePackage(params.package)
                    .then((npmOutput) => {

                        // TODO remove - just send back success

                        // Update the packageList
                        web.serveVendorPackages()

                        res.json({ 'success': true, 'result': npmOutput })
                        return true
                    })
                    .catch((err) => {
                        // log.warn(`[uibuilder:API:uibnpmmanage] Admin API. ERROR Running npm ${params.cmd} for package ${params.package}`, err.stdout)
                        log.warn(`[uibuilder:API:uibnpmmanage:remove] Admin API. ERROR Running: \n'${err.command}' \n${err.all}`)
                        res.json({ 'success': false, 'result': err.all })
                        return false
                    })
                break
            }
            default: {
                log.error(`[uibuilder:API:uibnpmmanage] Admin API. Command ${params.cmd} is not a valid command. Must be 'install', 'remove' or 'update'.`)
                res.statusMessage = 'No valid npm command available'
                res.status(500).end()
                break
            }
        }

    }) // ---- End of npmmanage ---- //

    return v2AdminRouter
}

module.exports = adminRouterV2

// EOF
