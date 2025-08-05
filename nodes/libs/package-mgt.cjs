/* eslint-disable jsdoc/valid-types */
/** Manage npm packages
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
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').uibPackageJson} uibPackageJson
 */

const { join, } = require('node:path')
const { copy, copySync, existsSync, readJSONSync, writeJson, } = require('./fs.cjs')
const { runOsCmd, runOsCmdSync, } = require('./uiblib.cjs')
const uibGlobalConfig = require('./uibGlobalConfig.cjs')

class UibPackages {
    // #region ---- Class Variables ----

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

    /** Details of actually installed packages - set in  setup > pkgCheck */
    dependencyDetails
    /** Details of mismatched installed packages - set in  setup > pkgCheck */
    dependencyProblems

    // OS Command options for running npm commands - https://nodejs.org/docs/latest-v18.x/api/child_process.html#child_processspawncommand-args-options
    npmCmdOpts = {
        cwd: '',
        shell: true,
        windowsHide: true,
        timeout: 300000, // 5min
        out: '', // uib addition - set to 'bare' when requesting JSON output
        verbose: true, // @since 7.5.0 - default to verbose output
    }

    // #endregion ---- ---- ----

    constructor() {
        /** Get npm's global install location */
        // @ts-ignore
        this.globalPrefix = this.npmGetGlobalPrefix()
    } // ---- End of constructor ---- //

    /** Gets the global install folder for npm & saves to a class variable
     * @returns {Promise<string>} The npm global install folder name
     */
    async npmGetGlobalPrefix() {
        // Does not need setup to have run

        const opts = this.npmCmdOpts
        opts.out = 'bare' // returns just the output string

        const args = [
            'config',
            'get',
            'prefix',
        ]

        /** @type {string} */
        let out
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            const myerr = new Error(`runOsCmd/npmGetGlobalPrefix failed. ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }

        return out
    } // ---- End of npmGetGlobalPrefix ---- //

    /** Configure this class with uibuilder module specifics
     * param {uibConfig} uib uibuilder module-level configuration
     */
    setup() {
        const uib = uibGlobalConfig
        if ( !uib ) throw new Error('[uibuilder:UibPackages.js:setup] Called without required uib parameter or uib is undefined.')
        if ( uib.RED === null ) throw new Error('[uibuilder:UibPackages.js:setup] uib.RED is null')
        if ( uib.rootFolder === null ) throw this.#rootFldrNullError

        // Prevent setup from being called more than once
        if ( this.#isConfigured === true ) {
            uib.RED.log.warn('🌐⚠️[uibuilder:UibPackages:setup] Setup has already been called, it cannot be called again.')
            return
        }

        this.RED = uib.RED
        this.uib = uib
        const log = this.log = uib.RED.log

        log.trace('🌐[uibuilder:package-mgt:setup] Package Management setup started')

        // ! HAVE TO CHECK IF uibRoot/package.json or uibRoot/node_modules EXISTS FIRST
        //   or checks and installs could happen at a parent level if it has a package.json
        if (!existsSync(uib.rootFolder, this.packageJson)) {
            log.warn(`🌐⚠️[uibuilder:package-mgt:setup] uibRoot package.json not found. Copying template file. ${uib.rootFolder}`)
            this.createBasicPj()
        }

        // Get the uibuilder root folder's package.json file and save to class var or create minimal version if one doesn't exist
        // const pj = this.uibPackageJson = this.getUibRootPJ()
        this.uibPackageJson = this.pkgCheck()

        // Update the version string to match uibuilder version
        this.uibPackageJson.version = this.uib.version

        // TODO Good enough for now but all SHOULD be auto-fixable.
        if (this.dependencyProblems) {
            setTimeout(() => {
                this.log.warn('------------------------------------------------------')
                this.log.warn([`🌐⚠️[uibuilder:package-mgt:setup] Problems with uibuilder root package.json.\nRoot folder: ${this.uib.rootFolder}\nPlease resolve before continuing.`, this.dependencyProblems])
                this.log.warn('------------------------------------------------------\n \n')
            }, 3000)
        }

        // SYNC - minimum update of the in-memory this.uibPackageJson.uibuilder.packages with enough info to be able to serve the folders
        this.pkgsQuickUpd()

        // At this point we have the refs to uib and RED & enough to be able to serve the libraries
        this.#isConfigured = true

        // ASYNC - Re-build package.json uibuilder.packages with details & rewrite file (async)
        this.updateInstalledPackageDetails()

        log.trace('🌐[uibuilder:package-mgt:setup] Package Management setup completed')
    } // ---- End of setup ---- //

    /** Make sure that <uibRoot>/package.json exists and contains basic info */
    createBasicPj() {
        if (!this.log) console.error('🌐🛑[uibuilder:package-mgt:createBasicPj] this.log not defined!')
        try {
            copySync([__dirname, '..', '..', 'templates', 'uibroot-package.json'], [this.uib.rootFolder, 'package.json'])
            this.log.trace(`🌐[uibuilder[:package-mgt:createBasicPj] Basic package.json created in "${this.uib.rootFolder}"`)
        } catch (e) {
            this.log.error(`🌐🛑[uibuilder:package-mgt:createBasicPj] Basic package.json creation FAILED in "${this.uib.rootFolder}". ${e.message}`, e)
            return
        }
    }

    /** Use npm to check packages installed to uibRoot
     * ! This could return a PARENT details if package.json doesn't exist in the given folder
     * ! If no package.json found, returns empty json if no node_modules.
     * ! If no package.json but modules anyway, output includes a `problems` entry
     * @returns {object} uibRoot package.json + dependencyDetails for actual installed packages
     */
    pkgCheck() {
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = this.uib.rootFolder
        opts.out = 'bare' // returns just the output string

        const args = [
            'list',
            // Long output includes parent package.json and all dependencies package.json
            // So this could replace all other reads
            '--long', // Short output seems to take .1s longer!
            '--omit=dev',
            '--json',
            '--depth=0',
        ]

        let out
        // console.time('⏱️ >> pkgCheckCmd')
        try {
            out = runOsCmdSync('npm', args, opts)
            out = JSON.parse(out)
        } catch (e) {
            this.log.error(`🌐🛑[uibuilder:package-mgt:pkgCheck] npm list installed packages FAILED. ${e.message}`, e)
        }
        // console.timeEnd('⏱️ >> pkgCheckCmd')

        // Save dependencies seperatelly then move _dependendencies back to dependencies to normalise the data
        this.dependencyDetails = out.dependencies
        delete out['dependencies']
        out.dependencies = out._dependencies
        delete out['_dependencies']
        delete out['extraneous']
        if (out.problems) {
            this.dependencyProblems = out.problems
            delete out.problems
        }

        return out
    }

    /** Do a fast update of the min data in pj.uibuilder.packages required for web.serveVendorPackages()
     * Only compares dependencies with uibuilder.packages in the package.json file. Does not compare to installed.
     */
    pkgsQuickUpd() {
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        const pj = this.uibPackageJson

        // Make sure there is a dependencies prop
        if ( !pj.dependencies ) pj.dependencies = {}
        // Make sure there is a uibuilder prop
        if ( !pj.uibuilder ) pj.uibuilder = {}
        // Make sure there is a uibuilder.packagedetails prop
        if ( !pj.uibuilder.packages ) pj.uibuilder.packages = {}

        // Make sure no extra package details
        for (const pkgName in pj.uibuilder.packages) {
            if ( !pj.dependencies[pkgName] ) delete pj.uibuilder.packages[pkgName]
        }
        // Make sure all dependencies are reflected in uibuilder.packagedetails
        for (const depName in pj.dependencies) {
            if ( !pj.uibuilder.packages[depName] ) {
                pj.uibuilder.packages[depName] = { installedVersion: pj.dependencies[depName], }
            }
        }
        // Get folders for web:startup:serveVendorPackages()
        for (const pkgName in pj.uibuilder.packages) {
            const pkg = pj.uibuilder.packages[pkgName]
            // The actual location of the package folder
            pkg.installFolder = this.dependencyDetails[pkgName].path || join(this.uib.rootFolder, 'node_modules', pkgName)
            // The base url used by uib - note this is changed if this is a scoped package
            pkg.packageUrl = '/' + pkgName
        }

        // Re-save the updated file
        // this.setUibRootPackageJson(pj)
        // this.writePackageJson(this.uib.rootFolder, pj)
    }

    /** Write updated <folder>/package.json (async)
     * Also makes a backup copy to package.json.bak
     * @param {string} folder The folder where to write the file
     * @param {object} json The Object data to write to the file
     */
    async writePackageJson(folder, json) {
        // Does not need setup to have finished running

        const fileName = join( folder, this.packageJson )

        try { // Make a backup copy
            await copy(fileName, `${fileName}.bak`)
            this.log.trace(`🌐[uibuilder:package-mgt:writePackageJson] package.json file successfully backed up in ${folder}`)
        } catch (err) {
            this.log.error(`🌐🛑[uibuilder:package-mgt:writePackageJson] Failed to copy package.json to backup.  ${folder}`, this.packageJson, err)
        }

        try {
            await writeJson(fileName, json, { spaces: 2, })
            this.log.trace(`🌐[uibuilder:package-mgt:writePackageJson] package.json file written successfully in ${folder}`)
        } catch (err) {
            this.log.error(`🌐🛑[uibuilder:package-mgt:writePackageJson] Failed to write package.json.  ${folder}`, this.packageJson, err)
        }
    }

    async updIndividualPkgDetails(pkgName, dependencyDetails) {
        if ( this.uibPackageJson === null ) throw new Error('[uibuilder:UibPackages.js:updIndividualPkgDetails] this.uibPackageJson is null')
        const pj = this.uibPackageJson

        if ( pj.uibuilder === undefined || pj.uibuilder.packages === undefined || pj.dependencies === undefined ) throw new Error('pgkMgt:updIndividualPkgDetails: pj.uibuilder, pj.uibuilder.packages or pj.dependencies is undefined')

        // Make sure only packages in uibRoot/package.json dependencies are processed
        if ( !pj.dependencies[pkgName] ) return

        const packages = pj.uibuilder.packages

        packages[pkgName] = {}
        const pkg = packages[pkgName]

        const lsp = dependencyDetails[pkgName]
        // save the version/location spec from the dependencies prop so everything is together
        pkg.spec = pj.dependencies[pkgName]

        if ( lsp.missing ) {
            pkg.missing = true
            pkg.problems = lsp.problems
        } else {
            // Get/Update package details
            pkg.installFolder = lsp.path
            pkg.installedVersion = lsp.version

            /** If we can, lets work out what resource is actually needed
             *  when using one of these packages in the browser.
             *  If we can't, leave a ? to make it obvious
             * Annoyingly, a few packages have decided to make the `browser` property an object instead of a string.
             *   (e.g. vgauge) - ignore in that case as it isn't clear what the intent is.
             */
            if (lsp.browser && (typeof lsp.browser === 'string') ) pkg.estimatedEntryPoint = lsp.browser
            else if (lsp.jsdelivr) pkg.estimatedEntryPoint = lsp.jsdelivr
            else if (lsp.unpkg) pkg.estimatedEntryPoint = lsp.unpkg
            else if (lsp.main) pkg.estimatedEntryPoint = lsp.main
            else pkg.estimatedEntryPoint = '?'
            if ( pkg.estimatedEntryPoint === 'none') pkg.estimatedEntryPoint = '?'

            // Homepage - used for a help ref in the Editor
            if (lsp.homepage) pkg.homepage = lsp.homepage
            else pkg.homepage = `https://www.npmjs.com/search?q=${pkgName}`

            // The base url used by uib - note this is changed if this is a scoped package
            pkg.packageUrl = '/' + pkgName

            // As the url may have changed (by removing scope), record the usable url
            pkg.url = `../uibuilder/vendor${pkg.packageUrl}/${pkg.estimatedEntryPoint}`

            // If the package name is npm @scoped, remove the scope, add leading / & track scope name
            if ( pkgName.startsWith('@') ) {
                // pkg.packageUrl = '/' + pkgName.replace(/^@.*\//, '')
                pkg.scope = pkgName.replace(pkg.packageUrl, '')
            }
        }

        if ( pj.dependencies[pkgName] && pj.dependencies[pkgName].includes(':') ) {
            // Must be installed from somewhere other than npmjs so don't try to find latest version
            pkg.latestVersion = null
            pkg.installedFrom = pj.dependencies[pkgName].split(':')[0]
            pkg.outdated = {}
        } else {
            pkg.installedFrom = 'npm'

            // Add current version details
            let res = await this.npmOutdated(pkgName)
            try {
                res = JSON.parse(res)
            } catch (e) { /* */ }
            if ( res[pkgName] ) {
                res = {
                    current: res[pkgName].current,
                    wanted: res[pkgName].wanted,
                    latest: res[pkgName].latest,
                }
            }
            pkg.outdated = res
        }
    }

    /** Use npm to get detailed pkg info (slow, async) to pj.uibuilder.packages & rewrite the pj file */
    async updateInstalledPackageDetails() {
        const pj = this.uibPackageJson

        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError
        const rootFolder = this.uib.rootFolder

        // Make sure we have package details for all installed packages - NB: don't use await with forEach!
        const depPkgNames = Object.keys(this.dependencyDetails || {})
        // await depPkgNames.forEach( async pkgName => {
        //     await this.updIndividualPkgDetails(pkgName, lsParsed)
        // })
        // EITHER (serial)
        // for ( const pkgName of depPkgNames ) {
        //     await this.updIndividualPkgDetails(pkgName, lsParsed)
        // }
        // OR (parallel)
        await Promise.all( depPkgNames.map(async (pkgName) => {
            await this.updIndividualPkgDetails(pkgName, this.dependencyDetails)
        }))

        // (re)Write package.json
        this.writePackageJson(rootFolder, pj)
    }

    /** Get the instance node for a uibuilder instance
     * @param {string} url The URL of the uibuilder instance
     * @returns {uibNode|null} The instance node or null if not found
     */
    getInstanceNode(url) {
        const RED = this.uib.RED

        // Get the node id of the instance
        let node
        for (const [key, value] of Object.entries(this.uib.instances)) {
            if (value === url) node = RED.nodes.getNode(key)
        }

        // // Make sure we got a node
        // if (!node) {
        //     RED.log.error(`🌐🛑[UibFs:getInstanceLiveHtmlFiles] No node found for url="${url}" - called before all nodes loaded in Node-RED?`)
        // }

        return node || null
    }

    /** Get the root folder for a uibuilder instance
     * @throws Error if setup has not been called
     * @param {string} url The URL of the uibuilder instance
     * @returns {string|null} The root folder path or null if not found
     */
    getInstanceRootFolder(url) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( !this.uib ) throw new Error('Called without required uib parameter or uib is undefined [UibFs:getInstanceRootFolder]')
        if ( this.uib.RED === null ) throw new Error('uib.RED is null. Check setup order [UibFs:getInstanceRootFolder]')

        // Get the node instance
        const node = this.getInstanceNode(url)
        // If no node found, throw error
        if (!node) {
            this.log.warn(`🌐⚠️[UibFs:getInstanceRootFolder] No node found for url="${url}" - called before all nodes loaded in Node-RED?`)
            return null
        }

        // Get the root folder for the uibuilder instance
        const rootFolder = node?.instanceFolder
        return rootFolder || null
    }

    /** Get the list of npm script names for a uibuilder instance
     * @param {string} url The URL of the uibuilder instance
     * @returns {Array<string>} Array of npm script names or empty list if not found
     */
    getInstanceNpmScriptNames( url ) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:getInstanceNpmScriptNames] Cannot run. Setup has not been called.'
            )
            return []
        }

        // Get the instance root folder
        // const rootFolder = getInstanceRootFolder(url)
        const rootFolder = this.getInstanceRootFolder(url)
        if (!rootFolder) {
            // getInstanceRootFolder will have already logged a warning
            return []
        }

        // Read the package.json file for the uibuilder instance
        let pj
        try {
            pj = readJSONSync(join(rootFolder, this.packageJson))
        } catch (e) {
            this.log.error(`🌐🛑[uibuilder:UibPackages:getInstanceNpmScriptNames] Error reading package.json for url="${url}": ${e.message}`)
            return []
        }

        // Get the list of npm script names for a uibuilder instance
        const npmScriptNames = Object.keys(pj?.scripts || {})

        return npmScriptNames
    }

    /** Find install folder for a package - allows an array of locations to be given
     * NOTE: require.resolve can be a little ODD!
     *       When run from a linked package, it uses the link root not the linked location,
     *       this throws out the tree search. That's why we have to try several different locations here.
     *       Also, it finds the "main" script name which might not be in the package root.
     *       Also, it won't find ANYTHING if a `main` entry doesn't exist :(
     *       So we no longer use it, just search for folder names.
     * @param {string} packageName - Name of the package who's install folder we are looking for.
     * @param {string|Array<string>} installRoot Location to search. Can be an array of locations.
     * @returns {null|string} Actual filing system path to the installed package
     */
    getPackagePath2(packageName, installRoot) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:getPackagePath] Cannot run. Setup has not been called.')
            return null
        }

        // If installRoot = string, make an array
        if ( !Array.isArray(installRoot) ) installRoot = [installRoot]

        for (const r of installRoot) {
            const loc = join(r, 'node_modules', packageName)
            if (existsSync( loc )) return loc
        }

        this.log.warn(`🌐⚠️[uibuilder:package-mgt:getPackagePath2] PACKAGE ${packageName} NOT FOUND`)
        return null
    } // ----  End of getPackagePath2 ---- //

    /** Is the specified package installed into uibRoot (e.g. via the library manager)
     * @param {string} packageName The package name to check
     * @returns {boolean} True if it is installed, false otherwise
     */
    isPackageInstalled(packageName) {
        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:isPackageInstalled] Cannot run. Setup has not been called.')
            return false
        }
        if (!this.uibPackageJson) return false

        if (!this.uibPackageJson.uibuilder.packages[packageName]) return false

        return true
    } // ----  End of isPackageInstalled ---- //

    // #region -- Manage Packages via npm --

    // TODO Use RED.events `UIBUILDER/npm` as option to show log during install
    /** Install or update an npm package
     * NOTE: This fn does not update the list of packages
     *       because that is built from the package.json file
     *       and that is updated by calling web.serveVendorPackages()
     *       which can't be done here - The calling admin API's do that
     *       Editor->API->This fn->API cont.->web.serveVendorPackages->getUibRootPackageJson->API cont2->Editor
     * @param {string} url Node instance url
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @param {string} [tag] Default=''. Specifier for a version, tag, branch, etc. with leading @ for npm and # for GitHub installs
     * @param {string} [toLocation] Where to install to. '' defaults to uibRoot
     * @param {'install'|'update'} [action] Install or Update. Defaults to install
     * @returns {Promise<{all:string, code:number, command:string}|string>} Combined stdout/stderr, return code
     */
    async npmInstallPackage(url, pkgName, tag = '', toLocation = '', action = 'install') {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:npmInstallPackage] Cannot run. Setup has not been called.')
            return ''
        }

        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw new Error('this.log.rootFolder is null')
        if ( toLocation === '' ) toLocation = this.uib.rootFolder

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = toLocation
        opts.out = ''

        const args = [ // `npm install --no-audit --no-update-notifier --save --production --color=false --no-fund --json ${params.package}@latest`
            action,
            pkgName + tag,
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            '--save',
            '--production',
            '--color=false',
            // '--json',
        ]

        /** @type {{all:string, code:number, command:string}} */
        let out
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            const myerr = new Error(`runOsCmd/npmInstallPackage failed. ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }
        if (out.code > 0) {
            const myerr = new Error(`Install failed. Code: ${out.code}`)
            // @ts-ignore
            myerr.all = out.all
            // @ts-ignore
            myerr.code = out.code
            // @ts-ignore
            myerr.command = out.command
            throw myerr
        }

        this.log.info(`🌐📘[uibuilder:UibPackages:npmInstallPackage] npm output: \n ${out.all}\n `)

        return out
    } // ---- End of installPackage ---- //

    /** Install an npm package
     * NOTE: This fn does not update the list of packages - see install above for reasons.
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<{all:string, code:number, command:string}|string>} Combined stdout/stderr
     */
    async npmRemovePackage(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:npmRemovePackage] Cannot run. Setup has not been called.')
            return ''
        }

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = this.uib.rootFolder
        opts.out = ''

        const args = [
            'uninstall',
            '--save',
            '--color=false',
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            // '--json',
            pkgName,
        ]

        /** @type {{all:string, code:number, command:string}} */
        let out
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            const myerr = new Error(`runOsCmd/npmRemovePackage failed. ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }
        if (out.code > 0) {
            const myerr = new Error(`Removal failed. Code: ${out.code}`)
            // @ts-ignore
            myerr.all = out.all
            // @ts-ignore
            myerr.code = out.code
            // @ts-ignore
            myerr.command = out.command
            throw myerr
        }
        this.log.info(`🌐📘[uibuilder:UibPackages:npmRemovePackage] npm output: \n ${out.all}\n `)

        return out
    } // ---- End of removePackage ---- //

    /** Get the latest version string for a package
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<any>} Combined stdout/stderr
     */
    async npmOutdated(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:npmOutdated] Cannot run. Setup has not been called.')
            return
        }

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = this.uib.rootFolder
        opts.out = 'bare' // returns just the output string

        const args = [
            'outdated',
            '--json',
            pkgName,
        ]

        /** @type {string} */
        let out
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            const myerr = new Error(`runOsCmd/npmOutdated failed. ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }

        this.log.trace(`🌐[uibuilder[:UibPackages:npmOutdated] npm output: \n ${out}\n `)

        return out // we asked for bare output so out is a string
    } // ---- End of npmOutdated ---- //

    /** Update an npm package (Not yet in use)
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<{all:string, code:number, command:string}|string>} Combined stdout/stderr, return code
     */
    async npmUpdate(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('🌐⚠️[uibuilder:UibPackages:npmUpdate] Cannot run. Setup has not been called.')
            return ''
        }

        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw new Error('this.log.rootFolder is null')
        // if ( toLocation === '' ) toLocation = this.uib.rootFolder
        const toLocation = this.uib.rootFolder

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = toLocation
        opts.out = ''

        const args = [
            'update',
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            '--save',
            '--production',
            '--color=false',
            // '--json',
            pkgName,
        ]

        /** @type {{all:string, code:number, command:string}} */
        let out
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            const myerr = new Error(`runOsCmd/npmInstallPackage failed. ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }
        if (out.code > 0) {
            const myerr = new Error(`Install failed. Code: ${out.code}`)
            // @ts-ignore
            myerr.all = out.all
            // @ts-ignore
            myerr.code = out.code
            // @ts-ignore
            myerr.command = out.command
            throw myerr
        }

        this.log.info(`🌐📘[uibuilder:UibPackages:npmUpdate] npm output: \n ${out.all}\n `)

        return out
        // return /** @type {string} */ (all)
    }

    // #endregion -- ---- --

    /** Run an npm script in the context of a specific URL (uibuilder instance)
     * @param {string} scriptName The name of the npm script to run
     * @param {string} url The URL (name) of the uibuilder instance
     * @returns {Promise<{all:string, code:number, command:string}|string>} Combined stdout/stderr, return code of the executed command
     * @throws {Error} If this.log is undefined (setup not called)
     */
    async npmRunScript(scriptName, url) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        /** @type {{all:string, code:number, command:string}} */
        let out = { all: 'No output', code: -1, command: '', }

        if ( this.#isConfigured !== true ) {
            throw new Error(`runOsCmd/npmRunScript failed for url="${url}". Cannot run. Setup has not been called`)
        }

        if ( !scriptName || scriptName === '' ) {
            throw new Error(`runOsCmd/npmRunScript failed for url="${url}". No script name provided.`)
        }

        // Get the instance root folder
        const rootFolder = this.getInstanceRootFolder(url)
        if (!rootFolder) {
            throw new Error(`runOsCmd/npmRunScript failed for url="${url}". No root folder`)
        }

        const opts = { ...this.npmCmdOpts, }
        opts.cwd = rootFolder
        opts.out = ''
        opts.verbose = false

        const args = [
            !['outdated', 'update', 'install'].includes(scriptName) ? 'run' : '',
            scriptName,
            '--long',
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            '--no-progress',
            '--color=false',
        ]

        let myerr
        try {
            out = await runOsCmd('npm', args, opts)
        } catch (e) {
            myerr = new Error(`runOsCmd/npmRunScript failed for url="${url}". ${e.message}`)
            // @ts-ignore
            myerr.all = ''
            // @ts-ignore
            myerr.code = 3
            // @ts-ignore
            myerr.command = `npm ${args.join(' ')}`
            throw myerr
        }
        if (out.code > 1) {
            myerr = new Error(`Run script failed for url="${url}". Code: ${out.code}`)
            // @ts-ignore
            myerr.all = out.all
            // @ts-ignore
            myerr.code = out.code
            // @ts-ignore
            myerr.command = out.command
            throw myerr
        }

        return out
    } // ---- End of npmRunScript ---- //
}

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibPackages = new UibPackages()
module.exports = uibPackages
