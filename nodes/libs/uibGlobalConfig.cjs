/* eslint-disable jsdoc/valid-types */
/** UIBUILDER's global configuration data
 * Moved from nodes/uibuilder/uibuilder.js to here to for clarity and central loading. @since v7.3.0
 *
 * Copyright (c) 2025-2026 Julian Knight (Totally Information)
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
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('express')} Express
 */

const path = require('node:path')
const fslib = require('./fs.cjs') // File/folder handling library (by Totally Information)

const pkgJson = fslib.readJSONSync(path.join( __dirname, '..', '..', 'package.json' ))

/** @type {uibConfig} */
const uibGlobalConfig = {
    /** Current module version (taken from package.json) @constant {string} uib.version */
    version: pkgJson.version,
    // Reference to the version of Node.js in use.
    nodeVersion: process.version.replace('v', '').split('.'),
    // If existing install of uibuilder is < this version, then user must re-deploy flows after upgrade
    reDeployNeeded: '4.1.2',

    moduleName: 'uibuilder',

    // Location of master template folders (containing default front-end code)
    masterTemplateFolder: path.join( __dirname, '..', '..', 'templates' ),
    // Location of master FE folder (containing pre-built core front-end code)
    masterStaticFeFolder: path.join( __dirname, '..', '..', 'front-end' ),
    /** Folder on the server FS to hold common & custom files & folders for all instances of uibuilder.
        Cannot be set until we have the RED object and know if projects are being used.
        Can be changed in settings.js
        Default <userDir>/<uib.moduleName> or <userDir>/projects/<currProject>/<uib.moduleName>
     */
    rootFolder: null,
    // Location for uib config folder - set once rootFolder is finalised. Default `<userDir>/<uib.moduleName>/.config/`
    configFolder: null,
    // Name of the config folder. Default `.config` (`<userDir>/projects/<currProject>/.config/`)
    configFolderName: '.config',
    // Location for uib common folder - set once rootFolder is finalised. Default `<userDir>/<uib.moduleName>/common/`
    commonFolder: null,
    // URI name of the common folder for shared resources. Default `common`
    commonFolderName: 'common',

    // Name of the optional Socket.IO connection middleware. Default 'sioUse.js' in the `<uibRoot>/.config` folder
    sioUseMwName: 'sioUse.js',
    // Name of the optional Socket.IO per-output msg middleware. Default 'sioMsgOut.js' in the `<uibRoot>/.config` folder
    sioMsgOutMwName: 'sioMsgOut.js',
    // Socket.IO channel names for main use
    ioChannels: { control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder', },

    // {node.id: url} for each uibuilder nodeInstance. Helps when ensuring that the URL's are unique.
    deployments: {}, // uibuilder only
    instances: {}, // uibuilder only
    mwinstances: {}, // markweb only
    // Instance details Schema: `{url: {node.id, node.title, node.descr, node.type}}`
    apps: {}, // uibuilder and markweb

    // Options for serveStatic. See https://expressjs.com/en/resources/middleware/serve-static.html
    staticOpts: {}, // Default: { maxAge: 31536000, immutable: true } - set in uibuilder.js when creating the node, can be overridden by settings.js uibuilder.staticOpts

    /** Set of instances that have requested their local instance folders be deleted on deploy
     *  see html file oneditdelete, updated by admin api. Actually set in admin-api-v3.js/put and consumed in uiblib.js/instanceClose
     * {url: string; value: boolean;}
     */
    deleteOnDelete: {},

    // Parameters for custom webserver if required. Port is left undefined if using Node-RED's webserver.
    customServer: { // set correctly in libs/web.js:_webSetup()
        port: undefined,
        type: 'http',
        host: undefined,
        hostName: undefined,
        isCustom: false,
        // These will only be applied if using a custom ExpressJS server
        serverOptions: {
            // @since v7 - make Express URL's case-sensitive to match w3c guidelines and socket.io
            'case sensitive routing': true,
            // For security
            'x-powered-by': false,
        },
        // Default Content Security Policy for uibuilder custom server only.
        contentSecurityPolicy: {
            'default-src': "'self' 'unsafe-inline' data: blob: https:;",
            'connect-src': "'self';",
            'img-src': "'self' data: blob: https:;",
            'font-src': "'self' data: https:;",
            'style-src': "'self' 'unsafe-inline' data: blob: https:;",
            'script-src': "'self' 'unsafe-inline' 'unsafe-eval' blob: https:;",
            'frame-src': "'self' https:;", // added in v7.7.0
        },
    },

    /** Copy of Node-RED settings.js nodeRoot property for convenience
     * Set in uibuilder.js when creating the node - will be overwritten to "" if using
     * a custom server for uibuilder.
     */
    nodeRoot: null,

    /** Are uibuilder node instances allowed to create their own API endpoints?
     * Updated in uibuilder.js from settings.js if it contains a uibuilder property
     */
    instanceApiAllowed: false,
    // Only set if requested to use an external template. See libs/fs.js:replaceTemplate()
    degitEmitter: undefined,

    /** UIBUILDER telemetry settings
     * Telemetry is optional and always anonymous. It is used to collect basic information about the usage
     * of uibuilder to help guide future development. It is not used for any other purpose and is not shared with any third parties.
     * See the privacy policy for more details.
     * Telemetry data is stored in a JSON file in the uibuilder config folder and is loaded and saved via the UibFs library.
     * It is sent to a Cloudflare work endpoint once a month if telemetry is enabled.
     */
    telemetryEnabled: true, // Set from settings.js uibuilder.telemetryEnabled. Default=true
    telemetryFilename: 'telemetry.json', // Name of the telemetry file in the config folder
    /** URL of the uibuilder Cloudflare Worker telemetry endpoint.
     * For local testing with wrangler dev, use http://localhost:8787/telemetry and
     * cd packages/telemetry && npx wrangler dev
     * @constant {string}
     */
    // telemetryEndpoint: 'https://uibuilder-telemetry.totallyinformation.workers.dev/telemetry',
    telemetryEndpoint: 'http://localhost:8787/telemetry',
    // telemetrySendInterval: 2592000, // 30*24*60*60=30d in secs, Number of days between telemetry sends
    telemetrySendInterval: 30, // 30 secs, for testing only
    /** Telemetry data
     * Loaded from and saved to `<uibRoot>/.config/telemetry.json` via UibFs.
     * See also uiblib.cjs:updateTelemetryData() for the data that is collected and sent to the telemetry endpoint.
     * {
     *   uuid:          string,   // Instance UUID (required)
     *   uib_version:   string,   // uibuilder package version
     *   nr_version:    string,   // Node-RED version
     *   node_version:  string,   // Node.js version
     *   os_platform:   string,   // e.g. "linux", "win32", "darwin"
     *   uib_count:     number,   // Count of uibuilder nodes deployed
     *   markweb_count: number,   // Count of markweb nodes deployed
     *   browsers: [              // Pre-aggregated browser stats (NOT raw UA strings)
     *     { family: string, version: string, count: number }
     *   ]
     * }
     */
    telemetry: {
        // uuid will be set in uiblib.js:updateTelemetryData() when telemetry is sent
        uib_version: pkgJson.version,
        // nr_version: RED.settings.version,
        node_version: process.version,
        os_platform: process.platform,
        // uib_count: Object.keys(uib.instances).length,
        // markweb_count: Object.keys(uib.mwinstances).length,
        // browsers: [], // will be set ??
        // lastSent: 0, // timestamp of last telemetry send - set in uib-runtime-plugin:sendTelemetry()
    },

    // A reference to the uibuilder package.json file contents for convenience
    me: pkgJson,
    // Reference to Node-RED runtime object. Will be set in uibuilder.js createNode
    RED: null,
}

module.exports = uibGlobalConfig
