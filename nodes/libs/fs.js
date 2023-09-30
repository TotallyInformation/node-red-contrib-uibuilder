/* eslint-disable class-methods-use-this */
/** Manage uibuilder server files
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
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').uibPackageJson} uibPackageJson
 */

const path = require('path')
// const fs = require('fs-extra')
const fs = require('fs/promises')
const sockets = require('./socket') // Socket.io handler library for uibuilder

// ! TODO: Move other file-handling functions into this class
// !       In readiness for move to mono-repo (need node.js v16+ as a base)

class UibFs {
    /** PRIVATE Flag to indicate whether setup() has been run (ignore the false eslint error)
     * @type {boolean}
     */
    #isConfigured = false

    #logUndefinedError = new Error('pkgMgt: this.log is undefined')
    #uibUndefinedError = new Error('pkgMgt: this.uib is undefined')
    #rootFldrNullError = new Error('pkgMgt: this.uib.rootFolder is null')

    /** @type {Array<string>} Updated by updateMergedPackageList which is called first in setup and then in various updates */
    mergedPkgMasterList = []

    /** @type {string} The name of the package.json file 'package.json' */
    packageJson = 'package.json'

    /** @type {uibPackageJson|null} The uibRoot package.json contents */
    uibPackageJson

    /** @type {string} Get npm's global install location */
    globalPrefix // set in constructor

    // constructor() {} // ---- End of constructor ---- //

    /** Configure this class with uibuilder module specifics
     * @param {uibConfig} uib uibuilder module-level configuration
     */
    setup( uib ) {
        if ( !uib ) throw new Error('[uibuilder:UibFs:setup] Called without required uib parameter or uib is undefined.')
        if ( uib.RED === null ) throw new Error('[uibuilder:UibFs:setup] uib.RED is null')

        // Prevent setup from being called more than once
        if ( this.#isConfigured === true ) {
            uib.RED.log.warn('⚠️[uibuilder:UibFs:setup] Setup has already been called, it cannot be called again.')
            return
        }

        this.RED = uib.RED
        this.uib = uib
        const log = this.log = uib.RED.log

        log.trace('[uibuilder:UibFs:setup] Package Management setup started')

        log.trace('[uibuilder:UibFs:setup] Package Management setup completed')
    } // ---- End of setup ---- //

    /** Output a file to an instance folder (async/promise)
     * NB: Errors have the fn indicator at the end because this is expected to be a utility fn called from elsewhere
     *     This is also the reason we throw errors here rather than output error msgs
     * @param {string} url The uibuilder instance URL (name)
     * @param {string} folder The folder to save to (no '..' allowed)
     * @param {string} fname The file name to save (no path allowed)
     * @param {*} data The data to save, string or buffer
     * @param {boolean} createFolder If true and folder does not exist, will be created. Else returns error
     * @param {boolean} reload If true, issue a reload command to all clients connected to the instance
     * @returns {Promise} Success if write is successful
     */
    async writeInstanceFile(url, folder, fname, data, createFolder = false, reload = false) {
        if ( !this.uib ) throw new Error('Called without required uib parameter or uib is undefined [uibuilder:UibFs:writeInstanceFile]')
        if ( this.uib.RED === null ) throw new Error('uib.RED is null [uibuilder:UibFs:writeInstanceFile] ')

        const log = this.uib.RED.log

        if (folder.includes('..')) {
            throw new Error(`Folder path includes '..', invalid. '${folder}' [uibuilder:UibFs:writeInstanceFile]`)
        }
        if ( fname.includes('/') || fname.includes('\\') ) {
            throw new Error(`File name includes '/' or '\\', invalid. '${fname}' [uibuilder:UibFs:writeInstanceFile]`)
        }

        const uib = this.uib

        // TODO check parameters
        // TODO check if uib.rootFolder/url folder exists

        const fullFolder = path.join(uib.rootFolder, url, folder)

        // Test if folder exists and can be written to. If not, error unless createFolder flag is true
        try {
            await fs.access(fullFolder, fs.constants.W_OK)
        } catch {
            // If createFolder flag set, attempt to create the folder
            if (createFolder === true) {
                try {
                    await fs.mkdir(fullFolder, { recursive: true }) // Add mode?
                } catch (err) {
                    throw new Error(`Cannot create folder. ${err.message} [uibuilder:UibFs:writeInstanceFile]`, err)
                }
            } else {
                throw new Error(`Folder does not exist. "${fullFolder}" [uibuilder:UibFs:writeInstanceFile]`)
            }
        }

        const fullname = path.join(fullFolder, fname)

        try {
            // https://nodejs.org/docs/latest-v14.x/api/fs.html#fs_fspromises_writefile_file_data_options
            await fs.writeFile(fullname, data)
            // await fs.outputFile(fullname, data)
        } catch (err) {
            throw new Error(`File write FAIL. ${err.message} [uibuilder:UibFs:writeInstanceFile]`, err)
        }

        log.trace(`📗[uibuilder:UibFs:writeInstanceFile] File write SUCCESS. url=${url}, file=${folder}/${fname}`)

        // Reload connected clients if required by sending them a reload msg
        if ( reload === true ) {
            sockets.sendToFe2({
                '_uib': {
                    'reload': true,
                }
            }, url)
        }
    } // -- End of writeFile -- //
} // ----- End of UibPackages ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibFs = new UibFs()
module.exports = uibFs

// EOF
