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
const fs = require('fs-extra')
const sockets = require('./socket') // Socket.io handler library for uibuilder
const uiblib = require('./uiblib')  // Utility library for uibuilder

// ! TODO: Move other file-handling functions into this class
// !       So that fs-extra is only ever needed here
// !       In readiness for move to mono-repo (need node.js v16+ as a base)

class UibFs {
    /** PRIVATE Flag to indicate whether setup() has been run (ignore the false eslint error)
     * @type {boolean}
     */
    #isConfigured = false

    static #loadCount = 0

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

    constructor() {

        console.log('📘: UibFs - Load Count: ', ++UibFs.#loadCount)

    } // ---- End of constructor ---- //

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

    // TODO Change to async
    /** Output a file to an instance folder
     * @param {string} url The uibuilder instance URL (name)
     * @param {string} folder The folder to save to (no '..' allowed)
     * @param {string} fname The file name to save (no path allowed)
     * @param {*} data The data to save, string or buffer
     * @param {boolean} reload If true, issue a reload command to all clients connected to the instance
     * @returns {boolean} True if successful, false otherwise
     */
    writeFile(url, folder, fname, data, reload = false) {
        if ( !this.uib ) throw new Error('[uibuilder:UibFs:writeFile] Called without required uib parameter or uib is undefined.')
        if ( this.uib.RED === null ) throw new Error('[uibuilder:UibFs:writeFile] uib.RED is null')

        const log = this.uib.RED.log

        // TODO Change from throw to log & return false
        if (folder.includes('..')) {
            log.error(`🛑[uibuilder:UibFs:writeFile] Folder path includes '..', invalid. '${folder}'`)
            return false
        }
        if ( fname.includes('/') || fname.includes('\\') ) {
            log.error(`🛑[uibuilder:UibFs:writeFile] File name includes '/' or '\\', invalid. '${fname}'`)
            return false
        }

        const uib = this.uib

        // TODO check if uib.rootFolder/url folder exists
        // TODO Add reload flag to Editor settings

        const fullname = path.join(uib.rootFolder, url, folder, fname)

        console.log('📔: WRITE FILE: ', url, folder, fname, fullname)

        // TODO Change to await
        // TODO Move status msgs and uiblib ref to node, not here
        fs.writeFile(fullname, data, (err) => {
            if (err) {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.error(`🛑[uibuilder:UibFs:writeFile] Admin API. File write FAIL. url=${url}, file=${folder}/${fname}`, err)
                return false
            } else {
                // Send back a response message and code 200 = OK, 500 (Internal Server Error)=Update failed
                log.trace(`📗[uibuilder:UibFs:writeFile] Admin API. File write SUCCESS. url=${url}, file=${folder}/${fname}`)

                // Reload connected clients if required by sending them a reload msg
                if ( reload === true ) {
                    sockets.sendToFe2({
                        '_uib': {
                            'reload': true,
                        }
                    }, url)
                }
                return true
            }
        })

        // TODO Add status display
    }
} // ----- End of UibPackages ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibFs = new UibFs()
module.exports = uibFs

// EOF
