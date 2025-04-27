/** UIBUILDER's global configuration data
 * Moved from nodes/uibuilder/uibuilder.js to here to for clarity and central loading. @since v7.3.0
 *
 * Copyright (c) 2025-2025 Julian Knight (Totally Information)
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

const path = require('path')
const fslib  = require('../libs/fs.js')   // File/folder handling library (by Totally Information)

const pkgJson = fslib.readJSONSync(path.join( __dirname, '..', '..', 'package.json' ))
/** @type {uibConfig} */
const uibGlobalConfig = {
    /** Current module version (taken from package.json) @constant {string} uib.version */
    version: pkgJson.version,
    // Refernce to the version of Node.js in use.
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
    deployments: {},
    instances: {},
    // Instance details Schema: `{url: {node.id, node.title, node.desc}}`
    apps: {},

    // Options for serveStatic. See https://expressjs.com/en/resources/middleware/serve-static.html
    staticOpts: {}, // Default: { maxAge: 31536000, immutable: true, },

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
    },

    /** Are uibuilder node instances allowed to create their own API endpoints?
     * Updated in uibuilder.js from settings.js if it contains a uibuilder property
     */
    instanceApiAllowed: false,
    // Only set if requested to use an external template. See libs/fs.js:replaceTemplate()
    degitEmitter: undefined,

    // A reference to the uibuilder package.json file contents for convenience
    me: pkgJson,
    // Reference to Node-RED runtime object. Will be set in uibuilder.js createNode
    RED: null,
}

module.exports = uibGlobalConfig
