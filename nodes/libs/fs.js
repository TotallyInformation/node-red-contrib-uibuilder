/* eslint-disable class-methods-use-this */
/** Manage uibuilder server files
 *
 * Copyright (c) 2023-2024 Julian Knight (Totally Information)
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

// REFERENCES
//  https://nodejs.org/docs/latest-v14.x/api/fs.html
//  https://github.com/jprichardson/node-fs-extra
//  https://github.com/jprichardson/node-jsonfile
//  https://github.com/isaacs/node-graceful-fs

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').uibPackageJson} uibPackageJson
 */

const { join, relative, normalize } = require('node:path')
// To be removed when feasible - https://github.com/jprichardson/node-fs-extra
const fsextra = require('fs-extra')
// Async
const fs = require('node:fs/promises')
// cb
const { cp, writeFile } = require('node:fs')
// Sync
const { accessSync, cpSync, constants: fsConstants, existsSync, mkdirSync, readFileSync } = require('node:fs')
// TODO Remove in future?
const fg = require('fast-glob')
// WARNING: Take care not to end up with circular requires. e.g. libs/socket.js or uiblib.js cannot be required here

let log

class UibFs {
    //#region --- Class vars ---
    /** PRIVATE Flag to indicate whether setup() has been run (ignore the false eslint error)
     * @type {boolean}
     */
    #isConfigured = false

    // #logUndefinedError = new Error('fs: this.log is undefined')
    // #uibUndefinedError = new Error('fs: this.uib is undefined')
    // #rootFldrNullError = new Error('fs: this.uib.rootFolder is null')

    /** @type {Array<string>} Updated by updateMergedPackageList which is called first in setup and then in various updates */
    mergedPkgMasterList = []

    /** @type {string} The name of the package.json file 'package.json' */
    packageJson = 'package.json'

    /** @type {uibPackageJson|null} The uibRoot package.json contents */
    uibPackageJson

    /** @type {string} Get npm's global install location */
    globalPrefix // set in constructor

    /** Node's fs libs constants */
    constants = fs.constants
    //#endregion --- ----- ---

    // constructor() {} // ---- End of constructor ---- //

    //#region ---- Utility methods ----

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
        this.log = log = uib.RED.log

        this.log.trace('[uibuilder:fs.js:setup] Setup completed', this.uib)
    } // ---- End of setup ---- //

    /** returns true if the filename contains / or \ else false
     * @param {string} fname filename to test
     * @returns {boolean} True if fname contains / or \
     */
    hasFolder(fname) {
        return /[/|\\]/.test(fname)
    }

    /** Throw an error if a path string contains folder traversal `..`
     * @param {string} fname Path to test
     * @param {string} note Optional text to add to error to indicate source
     */
    throwOnFolderEscape(fname, note) {
        if (fname.includes('..')) {
            throw new Error(`Path includes '..'. Folder traversal not permitted. '${fname}' [uibuilder:UibFs:throwOnFolderEscape] ${note}`)
        }
    }

    /** Walks through a folder and sub-folders returning list of files
     * @param {string} dir Folder name to start the walk
     * @param {string} ftype File extension to filter on, e.g. '.html'
     * @returns {Promise<string[]>} On each call, returns the next found file name
     */
    async walk(dir, ftype) {
        let files = await fs.readdir(dir)
        // @ts-ignore
        files = await Promise.all(files.map(async file => {
            const filePath = join(dir, file)
            const stats = await fs.stat(filePath)
            if (stats.isDirectory()) {
                return this.walk(filePath, ftype)
            } else if (stats.isFile() && file.endsWith(ftype)) {
                return filePath
            }
        }))

        // Filter out undefined entries before concatenating
        return files.filter(Boolean).reduce((all, folderContents) => all.concat(folderContents), [])
    } // -- End of walk -- //

    //#endregion ---- ---- ----

    get uibRootFolder() {
        return this.uib.rootFolder
    }

    //#region ---- Async Methods ----

    /** Tests a user's permissions for the file or directory specified by path. The mode argument is an optional integer that specifies the accessibility checks to be performed
     * @param {string|Buffer|URL} path Path to test
     * @param {number} mode Access mode to test.
     */
    access = fs.access

    /** ASYNC Folder or File copy - Will THROW on error
     * @param {Array<string>|string} src Source. Single string or array of strings that will be `join`d
     * @param {Array<string>|string} dest Destination. Single string or array of strings that will be `join`d
     * @param {import('node:fs').CopyOptions} [opts] Optional.
     */
    async copy(src, dest, opts) {
        if (opts === undefined) {
            opts = {
                'preserveTimestamps': true,
            }
        }
        // @ts-ignore - opts.overwrite is an fs-extra setting
        if (opts.hasOwnProperty('overwrite')) opts.force = opts.overwrite
        // When copying, we always want everything
        opts.recursive = true

        // @ts-ignore
        if (Array.isArray(src)) src = join(src)
        // @ts-ignore
        if (Array.isArray(dest)) dest = join(dest)

        try {
            await fs.cp(src, dest, opts)
        } catch (e) {
            throw new Error(`uib libs/fs.js copy could not copy '${src}' to '${dest}'. ${e.message}`)
        }
    }

    /** Returns the create/amend timestamps (as JS Date objects) & file size
     * @param {string} fname File name to examine
     * @returns {Promise< {created:Date,modified:Date,size:number,[pageName:string]} | {error:string,[originalError:string]} >} File stats
     */
    async getFileMeta(fname) {
        if (!fname) return { error: 'No file provided' }

        let stat
        try {
            const fstat = await fs.stat(fname)
            stat = {
                created: fstat.birthtime,
                modified: fstat.mtime,
                size: fstat.size,
            }
        } catch (e) {
            stat = {
                error: 'Could not get file metadata',
                originalError: e.message // take care not to leak this to end users
            }
        }
        return stat
    }

    /** Return all of the *.html files from the served folder for a specific instance
     * NOTE: Only call this after all nodes are loaded into the Node-RED runtime
     * @param {string} url uibuilder instance url (name)
     * @returns {Promise<string[]>} List of discovered html files with their folder if needed
     */
    async getInstanceLiveHtmlFiles(url) {
        if ( !this.uib ) throw new Error('Called without required uib parameter or uib is undefined [uibuilder:UibFs:writeInstanceFile]')
        if ( this.uib.RED === null ) throw new Error('uib.RED is null [uibuilder:UibFs:writeInstanceFile] ')

        const RED = this.uib.RED

        // Get the node id of the instance
        let node
        for (const [key, value] of Object.entries(this.uib.instances)) {
            if (value === url) node = RED.nodes.getNode(key)
        }

        // Make sure we got a node
        if (!node) {
            RED.log.error(`No node found for url="${url}" - called before all nodes loaded in Node-RED?`)
            return []
        }

        // Get the served folder from the instance node
        let folder = ''
        const allFiles = []

        folder = join(node.customFolder, node.sourceFolder)

        // Get all *.html files recursively
        for await (const p of await this.walk(folder, '.html')) {
            allFiles.push(p.replace(folder, ''))
        }

        return allFiles
    } // -- End of getInstanceLiveHtmlFiles -- //

    /** Get a text file from uibuilder's master template folders
     * @param {*} template The name of the master template, e.g. "blank" or "esm-blank-client"
     * @param {*} fName The name of the file to get (optionally with leading folder using forward-slash separators)
     * @returns {Promise<string>} The text contents of the file.
     */
    async getTemplateFile(template, fName) {
        return await fs.readFile( join(__dirname, '..', '..', 'templates', template, fName), 'utf8')
    }

    async getUibInstanceRootFolders() {
        // const chkInstances = Object.values(uib.instances).includes(params.url)
        // const chkFolders = existsSync(join(uib.rootFolder, params.url))
    }

    /**Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing. 
     * @param {string} path Folder/File to remove
     */
    async remove(path) {
        await fs.rm(path, {force:true,recursive:true})
    }

    // TODO Move degit processing to its own function. Don't need the emitter on uib
    /** Replace template in front-end instance folder
     * @param {string} url The uib instance URL
     * @param {string} template Name of one of the built-in templates including 'blank' and 'external'
     * @param {string|undefined} extTemplate Optional external template name to be passed to degit. See degit options for details.
     * @param {string} cmd 'replaceTemplate' if called from admin-router:POST, otherwise can be anything descriptive & unique by caller
     * @param {object} templateConf Template configuration object
     * @param {object} uib uibuilder's master variables
     * @param {object} log uibuilder's Log functions (normally points to RED.log)
     * @returns {Promise} {statusMessage, status, (json)}
     */
    async replaceTemplate(url, template, extTemplate, cmd, templateConf, uib, log) {
        const res = {
            'statusMessage': 'Something went wrong!',
            'status': 500,
            'json': undefined,
        }

        // Load a new template (params url, template, extTemplate)
        if ( template === 'external' && ( (!extTemplate) || extTemplate.length === 0) ) {
            const statusMsg = `External template selected but no template name provided. template=external, url=${url}, cmd=${cmd}`
            log.error(`[uibuilder:fs:replaceTemplate]. ${statusMsg}`)
            res.statusMessage = statusMsg
            res.status = 500
            return res
        }

        /** Destination folder name */
        const fullname = join(uib.rootFolder, url)

        if ( extTemplate ) extTemplate = extTemplate.trim()
        if ( extTemplate === undefined ) throw new Error('extTemplate is undefined')

        // TODO Move degit processing to its own function. Don't need the emitter on uib
        // If template="external" & extTemplate not blank - use degit to load
        if ( template === 'external' ) {
            const degit = require('degit')

            uib.degitEmitter = degit(extTemplate, {
                cache: false,  // Fix for Issue #155 part 3 - degit error
                force: true,
                verbose: false,
            })

            uib.degitEmitter.on('info', info => {
                log.trace(`[uibuilder:fs:replaceTemplate] Degit: '${extTemplate}' to '${fullname}': ${info.message}`)
            })

            await uib.degitEmitter.clone(fullname)

            // console.log({myclone})
            const statusMsg = `Degit successfully copied template '${extTemplate}' to '${fullname}'.`
            log.info(`[uibuilder:uiblib:replaceTemplate] ${statusMsg} cmd=${cmd}`)
            res.statusMessage = statusMsg
            res.status = 200

            res.json = /** @type {*} */ ({
                'url': url,
                'template': template,
                'extTemplate': extTemplate,
                'cmd': cmd,
            })
            return res
        } else if ( Object.prototype.hasOwnProperty.call(templateConf, template) ) {
            // Otherwise, use internal template - copy whole template folder
            // const fsOpts = { 'overwrite': true, 'preserveTimestamps': true }
            const fsOpts = { 'force': true, 'preserveTimestamps': true, 'recursive': true }
            /** Source template folder name */
            const srcTemplate = join( uib.masterTemplateFolder, template )
            try {
                // NB: fs.cp is still experimental even in node.js v20 - but seems stable since v16
                await fs.cp(srcTemplate, fullname, fsOpts)
                const statusMsg = `Successfully copied template ${template} to ${url}.`
                log.info(`[uibuilder:fs:replaceTemplate] ${statusMsg} cmd=replaceTemplate`)
                res.statusMessage = statusMsg
                res.status = 200
                res.json = /** @type {*} */ ({
                    'url': url,
                    'template': template,
                    'extTemplate': extTemplate,
                    'cmd': cmd,
                })
                return res
            } catch (err) {
                const statusMsg = `Failed to copy template from '${srcTemplate}' to '${fullname}'. url=${url}, cmd=${cmd}, ERR=${err.message}.`
                log.error(`[uibuilder:fs:replaceTemplate] ${statusMsg}`, err)
                res.statusMessage = statusMsg
                res.status = 500
                return res
            }
        } else {
            // Shouldn't ever be able to occur - but still :-)
            const statusMsg = `Template '${template}' does not exist. url=${url}, cmd=${cmd}.`
            log.error(`[uibuilder:fs:replaceTemplate] ${statusMsg}`)
            res.statusMessage = statusMsg
            res.status = 500
            return res
        }
    } // ----- End of replaceTemplate() ----- //

    /** Return list of found files as folder/files and/or urls
     * @param {string} uibId The uibuilder node instance id to search
     * @param {boolean} live If true, the search root will be limited to the currently live served folder
     * @param {[string]} filter A fast-glob search filter array (or string)
     * @param {[string]} exclude A fast-glob exclude filter array (or string)
     * @param {boolean} urlOut Output will include a url list (relative to the current uib instance root)
     * @param {boolean} fullPrefix Output will be prefixed with the full path for both file and url outputs
     * @returns {Promise<any>} List of found files
     */
    async searchInstance(uibId, live, filter, exclude, urlOut, fullPrefix) {
        if ( !this.uib ) throw new Error('Called without required uib parameter or uib is undefined [uibuilder:UibFs:searchInstance]')
        if ( this.uib.RED === null ) throw new Error('uib.RED is null [uibuilder:UibFs:searchInstance] ')
        const RED = this.uib.RED

        // Get node instance paths
        const uibnode = RED.nodes.getNode(uibId)
        const searchFolder = join(uibnode.customFolder, live === true ? uibnode.sourceFolder : '')

        // Defaults to finding everything in the search folder
        if (!filter) filter = ['*']
        if (!Array.isArray(filter)) filter = [filter]

        // Remove dangerous ../ segments from filters
        filter.forEach( (f, i) => {
            filter[i] = f.replace(/\.\.\//g, '')
        })

        const opts = {
            cwd: searchFolder,
            suppressErrors: true,
            unique: true,
            deep: 10, // restrict to max 10 deep sub-folders (prevent recursion)
            // caseSensitiveMatch: true, // default
            // dot: false, // default
        }
        if (exclude) opts.ignore = exclude

        const srch = await fg.async(filter, opts)

        const isCustom = this.uib.customServer.isCustom

        let prefix = ''
        if (urlOut) {
            if (fullPrefix) {
                if (isCustom || (!isCustom && !this.uib.httpRoot)) prefix = `./${uibnode.url}/`
                else prefix = `./${this.uib.httpRoot}/${uibnode.url}/`
            } else {
                prefix = './'
            }
        }
        srch.forEach( (f, i) => {
            // If output as urls required, replace `index.html`
            if (urlOut) {
                f = f.replace('index.html', '')
            } else {
                if (fullPrefix) {
                    f = join(searchFolder, f)
                } else {
                    f = relative(searchFolder, join(searchFolder, f))
                }
            }
            srch[i] = `${prefix}${f}`
        })

        const out = {
            results: srch,
            config: {
                filter: {
                    searchRoot: searchFolder,
                    filter: filter,
                    exclude: exclude,
                    urlOutput: urlOut,
                    fullPrefixOutput: fullPrefix,
                },
                uibuilder: {
                    rootFolder: normalize(this.uibRootFolder),
                },
                node: {
                    id: uibId,
                    name: uibnode.url,
                    customFolder: uibnode.customFolder,
                    liveFolder: uibnode.sourceFolder,
                }
            },
        }
        if (!isCustom) {
            out.config.uibuilder.httpRoot = this.uib.httpRoot
        } else {
            out.config.uibuilder.customServer = this.uib.customServer
        }

        return out
    }

    // TODO chk params
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

        // Make sure that the inputs don't include folder traversal
        this.throwOnFolderEscape(folder, 'writeInstanceFile, folder')
        this.throwOnFolderEscape(folder, 'writeInstanceFile, file')

        // Check to see if any folder's on the filename - if so, move to the fullFolder
        if (this.hasFolder(fname)) {
            const splitFname = fname.split(/[/|\\]/)
            fname = splitFname.pop()
            folder = join(folder, ...splitFname)
        }

        const uib = this.uib

        // TODO check parameters
        // TODO check if uib.rootFolder/url folder exists

        const fullFolder = join(uib.rootFolder, url, folder)

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

        const fullname = join(fullFolder, fname)

        try {
            // https://nodejs.org/docs/latest-v14.x/api/fs.html#fs_fspromises_writefile_file_data_options
            await fs.writeFile(fullname, data)
            // await fs.outputFile(fullname, data)
        } catch (err) {
            throw new Error(`File write FAIL. ${err.message} [uibuilder:UibFs:writeInstanceFile]`, err)
        }

        log.trace(`📗[uibuilder:UibFs:writeInstanceFile] File write SUCCESS. url=${url}, file=${folder}/${fname}`)
    } // -- End of writeFile -- //

    //#endregion ---- ---- ----

    //#region ---- Callback methods ----

    /** Asynchronously copies the entire directory structure from src to dest, including subdirectories and files. Throws on fail.
     * @param {string|Array<string>|URL} src Source path to copy, if an array of strings, they will be path joined
     * @param {string|Array<string>|URL} dest Source path to copy, if an array of strings, they will be path joined
     * @param {import('node:fs').CopyOptions} opts Node.js copy options
     * @param {Function} cb Callback function
     */
    copyCb(src, dest, opts, cb) {
        if (opts === undefined) {
            opts = {
                'preserveTimestamps': true,
            }
        }
        // @ts-ignore - opts.overwrite is an fs-extra setting
        if (opts.hasOwnProperty('overwrite')) opts.force = opts.overwrite
        // When copying, we always want everything
        opts.recursive = true
        // @ts-ignore - we allow an array of path segments
        if (Array.isArray(src)) src = join(src)
        // @ts-ignore
        if (Array.isArray(dest)) dest = join(dest)

        try {
            // @ts-ignore
            cp(src, dest, opts, cb)
        } catch (e) {
            throw new Error(`uib libs/fs.js copyCb could not copy '${src}' to '${dest}'. ${e.message}`)
        }
    }

    /** Write to a file (make sure it exists first)
     * @param {string|Buffer|URL|number} file File path to write to
     * @param {string|Buffer|DataView|object} data Data to write to file
     * @param {object=} options
     * @param {function} callback Has err as only argument
     */
    writeFileCb = writeFile

    //#endregion ---- ---- ----

    //#region ---- Synchronous methods ----

    /** Synchronously try access and error if fail.
     * @param {string} path Path to try to access
     * @param {'r'|'w'|'rw'|number} mode Modes required to work: r, w or rw
     */
    accessSync(path, mode) {
        switch (mode) {
            case 'r': {
                mode = fsConstants.R_OK
                break
            }

            case 'w': {
                mode = fsConstants.W_OK
                break
            }

            case 'rw': {
                mode = fsConstants.R_OK || fsConstants.W_OK
                break
            }

            default: {
                mode = fsConstants.R_OK || fsConstants.W_OK
                break
            }
        }
        accessSync(path, mode)
    }

    /** Synchronous Folder or File copy - Will THROW on error
     * @param {Array<string>|string} src Source. Single string or array of strings that will be `join`d
     * @param {Array<string>|string} dest Destination. Single string or array of strings that will be `join`d
     * @param {import('node:fs').CopySyncOptions} [opts] Optional.
     */
    copySync(src, dest, opts) {
        if (opts === undefined) {
            opts = {
                'preserveTimestamps': true,
            }
        }
        // @ts-ignore - opts.overwrite is an fs-extra setting
        if (opts.hasOwnProperty('overwrite')) opts.force = opts.overwrite
        // When copying, we always want everything
        opts.recursive = true

        try {
            // @ts-ignore
            if (Array.isArray(src)) src = join(...src)
            // ts-ignore
            if (Array.isArray(dest)) dest = join(...dest)
            cpSync(src, dest, opts)
        } catch (e) {
            throw new Error(`uib libs/fs.js copySync could not copy '${src}' to '${dest}'. ${e.message}`)
        }
    }

    // ensureFolder({ folder, copyFrom,  }) {
    // const cpyOpts = { 'preserveTimestamps': true }
    // Make sure folder exists, create if not
    // Make sure that the folder can be read/write
    // If copyFrom not undefined/null/'', copy to folder
    // }

    /** Does the path exist? Pass 1 or more args which are joined & then checked
     * @param {...string} path FS Path to check, multiple strings are path.join'd
     * @returns {boolean} True if path exists
     */
    existsSync() {
        const p = join(...arguments)
        return existsSync(p)
    }

    /** Return a list of files matching the glob specification
     * @param {string} glob The pattern to match - see fast-glob for details
     * @returns {string[]} A list of files
     */
    fgSync(glob) {
        if (!glob) return []
        return fg.sync(glob)
    }

    /** Synchronously create a folder
     * @param {string} path The folder to create - creates intermediates only if recursive option is set
     * @param {{recursive:boolean}|{recursive:boolean,mode:string|number}|number} [options] Options
     * @returns {string|undefined} Returns undefined unless recursive is set in which case the 1st created path is returned
     */
    mkdirSync(path, options) {
        return mkdirSync(path, options)
    }

    /** Read a JSON file and return as a JavaScript object - can use instead of fs-extra
     * @throws If reading or parsing fails
     * @param {string} file JSON file path/name to read
     * @returns {object} The parsed JSON file as an object
     */
    readJSONSync(file) {
        try {
            return JSON.parse(readFileSync(file, 'utf8'))
        } catch (e) {
            e.message = `${file}: ${e.message}`
            throw e
        }
    }

    //#endregion ---- ---- ----

    //#region ---- fs-extra passthrough methods that need replacement ----

    /** Ensures that the directory exists. If the directory structure does not exist, it is created. If provided, options may specify the desired mode for the directory.
     * @param {string} dir Folder path to ensure
     * @param {object|number=} opts Mode if number, else { mode: <Integer> }
     */
    ensureDirSync = fsextra.ensureDirSync

    /** Ensures that the file exists. If the file that is requested to be created is in directories that do not exist, these directories are created. If the file already exists, it is NOT MODIFIED.
     * @param {string} file File path to ensure
     */
    ensureFileSync = fsextra.ensureFileSync

    /** Moves a file or directory, even across devices.
     * @param {string} src Source folder/file
     * @param {string} dest Destination folder/file
     * @param {object=} opts { overwrite: true } - overwrite is false by default
     */
    moveSync = fsextra.moveSync

    /** Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
     * @param {string} path Folder/file path to remove
     */
    removeSync = fsextra.removeSync
    
    /** Writes an object to a JSON file.
     * https://github.com/jprichardson/node-fs-extra/blob/master/docs/writeJson.md
     * @param {string} file File path to write to
     * @param {object} object Object to write to
     * @param {object} options
     */
    writeJson = fsextra.writeJson

    //#endregion ---- ---- ----

} // ----- End of UibPackages ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibFs = new UibFs()
module.exports = uibFs

// EOF
