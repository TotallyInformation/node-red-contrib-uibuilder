/* eslint-disable class-methods-use-this */
/** Manage npm packages
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
 * @typedef {import('../../typedefs.js').runtimeRED} runtimeRED
 * @typedef {import('../../typedefs.js').uibNode} uibNode
 * @typedef {import('../../typedefs.js').uibConfig} uibConfig
 * @typedef {import('../../typedefs.js').uibPackageJson} uibPackageJson
 */

const path = require('path')
// const util = require('util')
const fs = require('fs-extra')
// const tilib = require('./tilib')
const execa = require('execa')

class UibPackages {
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

    constructor() {

        /** Get npm's global install location */
        this.globalPrefix = this.npmGetGlobalPrefix()

    } // ---- End of constructor ---- //

    /** Gets the global install folder for npm & saves to a class variable
     * @returns {string} The npm global install folder name
     */
    npmGetGlobalPrefix() { // eslint-disable-line class-methods-use-this
        // Does not need setup to have run

        const opts = {
            'all': true,
        }
        const args = [
            'config',
            'get',
            'prefix',
        ]

        let res
        try {
            const all = execa.sync('npm', args, opts)
            res = all.stdout
        } catch (e) {
            console.error('>>>>>', e.all)
            res = e.all  // Do we need to wrap this in a promise?
        }
        return res
    } // ---- End of npmGetGlobalPrefix ---- //

    /** Configure this class with uibuilder module specifics
     * @param {uibConfig} uib uibuilder module-level configuration
     */
    setup( uib ) {
        if ( !uib ) throw new Error('[uibuilder:UibPackages.js:setup] Called without required uib parameter or uib is undefined.')
        if ( uib.RED === null ) throw new Error('[uibuilder:UibPackages.js:setup] uib.RED is null')

        // Prevent setup from being called more than once
        if ( this.#isConfigured === true ) {
            uib.RED.log.warn('[uibuilder:UibPackages:setup] Setup has already been called, it cannot be called again.')
            return
        }

        this.RED = uib.RED
        this.uib = uib
        const log = this.log = uib.RED.log

        log.trace('[uibuilder:package-mgt:setup] Package Management setup started')

        // Get the uibuilder root folder's package.json file and save to class var or create minimal version if one doesn't exist
        const pj = this.uibPackageJson = this.getUibRootPJ()

        // Update the version string to match uibuilder version
        pj.version = this.uib.version
        // Make sure there is a dependencies prop
        if ( !pj.dependencies ) pj.dependencies = {}
        // Make sure there is a uibuilder prop
        if ( !pj.uibuilder ) pj.uibuilder = {}
        // Make sure there is a uibuilder.packagedetails prop
        if ( !pj.uibuilder.packages ) pj.uibuilder.packages = {}
        
        this.pkgsQuickUpd()

        // At this point we have the refs to uib and RED
        this.#isConfigured = true

        // Re-build package.json uibuilder.packages with details & rewrite file [after 3sec] (async)
        this.updateInstalledPackageDetails()

        log.trace('[uibuilder:package-mgt:setup] Package Management setup completed')
    } // ---- End of setup ---- //

    /** Do a fast update of the min data in pj.uibuilder.packages required for web.serveVendorPackages() - re-saves the package.json file */
    pkgsQuickUpd() {
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError
        
        const pj = this.uibPackageJson

        // Make sure no extra package details
        for (const pkgName in pj.uibuilder.packages) {
            if ( !pj.dependencies[pkgName] ) delete pj.uibuilder.packages[pkgName]
        }
        // Make sure all dependencies are reflected in uibuilder.packagedetails
        for (const depName in pj.dependencies) {
            if ( !pj.uibuilder.packages[depName] ) {
                pj.uibuilder.packages[depName] = {installedVersion: pj.dependencies[depName]}
            }
        }
        // Get folders for web:startup:serveVendorPackages()
        for (const pkgName in pj.uibuilder.packages) {
            let pkg = pj.uibuilder.packages[pkgName]
            if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError
            // The actual location of the package folder
            pkg.installFolder = path.join(this.uib.rootFolder, 'node_modules', pkgName)
            // The base url used by uib - note this is changed if this is a scoped package
            pkg.packageUrl = '/' + pkgName
            //this.log.debug(`[uibuilder:package-mgt:pkgsQuickUpd] Updating '${pkgName}'. Fldr: '${pkg.installFolder}', URL: '${pkg.packageUrl}'.`)
        }

        // Re-save the updated file
        //this.setUibRootPackageJson(pj)
        this.writePackageJson(this.uib.rootFolder, pj)
    }

    /** Read the contents of a package.json file
     * @param {string} folder The folder containing a package.json file
     * @returns {object|null} Object representation of JSON if found otherwise null
     */
    readPackageJson(folder) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        // Does not need setup to have finished running

        let file = null
        try {
            file = fs.readJsonSync( path.join(folder, this.packageJson), 'utf8' )
            this.log.trace(`[uibuilder:package-mgt:readPackageJson] package.json file read successfully from ${folder}`)
        } catch (err) {
            this.log.error(`[uibuilder:package-mgt:readPackageJson] Failed to read package.json file from  ${folder}`, this.packageJson, err)
        }
        return file
    } // ---- End of readPackageJson ---- //

    /** Write updated <folder>/package.json (async)
     * @param {string} folder The folder where to write the file
     * @param {object} json The Object data to write to the file
     */
    async writePackageJson(folder, json) {
        // Does not need setup to have finished running

        const fileName = path.join( folder, this.packageJson )

        // TODO Add try & error message
        fs.writeJson(fileName, json, { spaces: 2 })
    }

    /** Get the uibRoot package.json and return as object. Or, if not exists, return minimal object
     * Note: Does not directly update this.uibPackageJson because of async timing
     * @returns {object} uibRoot/package.json contents or a minimal version as an object
     */
    getUibRootPJ() {
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.log === undefined ) throw this.#logUndefinedError

        // Does not need setup to have finished running

        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError
        const uibRoot = this.uib.rootFolder

        const fileName = path.join( uibRoot, this.packageJson )

        // Get it to class var or create minimal class var
        let res = this.readPackageJson(uibRoot)

        if (res === null) {
            this.log.warn(`[uibuilder:package-mgt:getUibRootPJ] Could not read ${fileName}. Creating minimal version.`)
            // Create a minimal pj
            res = {
                'name': 'uib_root',
                'version': this.uib.version,
                'description': 'Root configuration and data folder for uibuilder',
                'scripts': {},
                'dependencies': {},
                'homepage': '',
                'bugs': '',
                'author': '',
                'license': 'Apache-2.0',
                'repository': '',
                'uibuilder': {
                    'packages': {},
                },
            }
        }

        return res
    }

    async updIndividualPkgDetails(pkgName, lsParsed) {
        if ( this.uibPackageJson === null ) throw new Error('[uibuilder:UibPackages.js:updIndividualPkgDetails] this.uibPackageJson is null')
        const pj = this.uibPackageJson

        if ( pj.uibuilder === undefined || pj.uibuilder.packages === undefined || pj.dependencies === undefined ) throw new Error('pgkMgt:updIndividualPkgDetails: pj.uibuilder, pj.uibuilder.packages or pj.dependencies is undefined')

        // Make sure only packages in uibRoot/package.json dependencies are processed
        if ( !pj.dependencies[pkgName] ) return

        const packages =  pj.uibuilder.packages

        packages[pkgName] = {}
        const pkg = packages[pkgName]

        const lsp = lsParsed.dependencies[pkgName]
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

        let ls = ''
        try {
            ls = await this.npmListInstalled(rootFolder)
        } catch {}

        let lsParsed = { dependencies: {} }
        try {
            lsParsed = JSON.parse(ls)
        } catch {}

        // Make sure we have package details for all installed packages - NB: don't use await with forEach!
        let depPkgNames = Object.keys(lsParsed.dependencies || {})
        // await depPkgNames.forEach( async pkgName => {
        //     await this.updIndividualPkgDetails(pkgName, lsParsed)
        // })
        // EITHER (serial)
        // for ( const pkgName of depPkgNames ) {
        //     await this.updIndividualPkgDetails(pkgName, lsParsed)
        // }
        // OR (parallel)
        await Promise.all( depPkgNames.map(async (pkgName) => {
            await this.updIndividualPkgDetails(pkgName, lsParsed)
        }))
        
        // (re)Write package.json
        this.writePackageJson(rootFolder, pj)
    }

    /** Create/Update, record & return <uibRoot>/package.json (create it if it doesn't exist)
     * @returns {object|null} Parsed version of <uibRoot>/package.json with uibuilder specific updates
     */
    getUibRootPackageJson() {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getUibRootPackageJson] Cannot run. Setup has not been called.')
            return
        }

        const uibRoot = this.uib.rootFolder
        const fileName = path.join( uibRoot, this.packageJson )

        // Make sure it exists & contains valid JSON
        if ( !fs.existsSync(fileName) ) {
            this.log.warn('[uibuilder:package-mgt:getUibRootPackageJson] No uibRoot/package.json file, creating minimal file.')
            // Create a minimal one
            fs.writeJsonSync(fileName, {
                'name': 'uib_root',
                'version': this.uib.version,
                'description': 'Root configuration and data folder for uibuilder',
                'scripts': {},
                'dependencies': {},
                'homepage': '',
                'bugs': '',
                'author': '',
                'license': 'Apache-2.0',
                'repository': '',
                'uibuilder': {
                    'packages': {},
                },
            })
        }

        // Get it
        let pj = {}
        try {
            pj = this.readPackageJson(uibRoot)
        } catch (e) {
            this.log.error(`[uibuilder:package-mgt:getUibRootPackageJson] Error reading ${fileName}. ${e.message}`)
            this.uibPackageJson = null
            return null
        }

        // Make sure there is a dependencies prop
        if ( !pj.dependencies ) pj.dependencies = {}
        // Make sure there is a uibuilder prop
        if ( !pj.uibuilder ) pj.uibuilder = {}
        // Reset the packages list, we rebuild it below
        pj.uibuilder.packages = {}

        // Update the version string to match uibuilder version
        pj.version = this.uib.version

        // Make sure we have package details for all installed packages
        Object.keys(pj.dependencies).forEach( packageName => {
            // Get/Update package details
            pj.uibuilder.packages[packageName] = this.getPackageDetails2(packageName, uibRoot)
            // And save the version/location spec from the dependencies prop so everything is together
            pj.uibuilder.packages[packageName].spec = pj.dependencies[packageName]

            // Frig to pick up the version of Bootstrap installed with bootstrap-vue
            if (packageName === 'bootstrap-vue' && !pj.dependencies.bootstrap ) {
                pj.dependencies.bootstrap = pj.uibuilder.packages[packageName].bootstrap
                pj.uibuilder.packages.bootstrap = this.getPackageDetails2('bootstrap', uibRoot)
                pj.uibuilder.packages.bootstrap.spec = pj.dependencies.bootstrap
            }
        })

        // Save it for use elsewhere
        this.uibPackageJson = pj

        // Update the <uibRoot>/package.json file with updated details
        this.setUibRootPackageJson(pj)

        // Return it
        return pj
    } // ----- End of getUibRootPackageJson() ----- //

    /** Write updated <uibRoot>/package.json
     * @param {object} json The Object data to write to the file
     */
    setUibRootPackageJson(json) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:setUibRootPackageJson] Cannot run. Setup has not been called.')
            return
        }

        const uibRoot = this.uib.rootFolder
        const fileName = path.join( uibRoot, this.packageJson )

        // Save it for use elsewhere
        this.uibPackageJson = json

        // TODO Add try & error message
        fs.writeJsonSync(fileName, json, { spaces: 2 })
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
            this.log.warn('[uibuilder:UibPackages:getPackagePath] Cannot run. Setup has not been called.')
            return null
        }

        // If installRoot = string, make an array
        if ( !Array.isArray(installRoot) ) installRoot = [installRoot]

        for (const r of installRoot) {
            const loc = path.join(r, 'node_modules', packageName)
            if (fs.existsSync( loc )) return loc
        }

        this.log.warn(`[uibuilder:package-mgt:getPackagePath2] PACKAGE ${packageName} NOT FOUND`)
        return null
    } // ----  End of getPackagePath2 ---- //

    /** Get the details for an installed package & update uibuilder specific details before returning it
     * @param {string} packageName - Name of the package who's install folder we are looking for.
     * @param {string} installRoot A uibuilder node instance - will search in node's root folder first
     * @returns {object} Details object for an installed package
     */
    getPackageDetails2(packageName, installRoot) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getPackagePath2] Cannot run. Setup has not been called.')
            return
        }

        // Trim the input just in case
        packageName = packageName.trim()

        const folder = this.getPackagePath2(packageName, installRoot)
        if ( folder === null ) throw new Error('folder is null')
        const pkgJson = this.readPackageJson(folder)

        const pkgDetails = { 'installFolder': folder }
        // if ( pkgDetails === undefined ) throw new Error('pkgDetails is undefined')
        if (pkgJson.version) pkgDetails.installedVersion = pkgJson.version

        /** If we can, lets work out what resource is actually needed
         *  when using one of these packages in the browser.
         *  If we can't, leave a ? to make it obvious
         * Annoyingly, a few packages have decided to make the `browser` property an object instead of a string.
         *   (e.g. vgauge) - ignore in that case as it isn't clear what the intent is.
         */
        if (pkgJson.browser && (typeof pkgJson.browser === 'string') ) pkgDetails.estimatedEntryPoint = pkgJson.browser
        else if (pkgJson.jsdelivr) pkgDetails.estimatedEntryPoint = pkgJson.jsdelivr
        else if (pkgJson.unpkg) pkgDetails.estimatedEntryPoint = pkgJson.unpkg
        else if (pkgJson.main) pkgDetails.estimatedEntryPoint = pkgJson.main
        else pkgDetails.estimatedEntryPoint = '?'
        if ( pkgDetails.estimatedEntryPoint === 'none') pkgDetails.estimatedEntryPoint = '?'

        // Homepage - used for a help ref in the Editor
        if (pkgJson.homepage) pkgDetails.homepage = pkgJson.homepage
        else pkgDetails.homepage = `https://www.npmjs.com/search?q=${packageName}`

        // The base url used by uib - note this is changed if this is a scoped package
        pkgDetails.packageUrl = '/' + packageName

        // Work out what kind of package this is

        // If the package name is npm @scoped, remove the scope, add leading / & track scope name
        if ( pkgDetails.packageUrl.startsWith('@') ) {
            pkgDetails.packageUrl = '/' + packageName.replace(/^@.*\//, '')
            pkgDetails.scope = packageName.replace(pkgDetails.packageUrl, '')
        }

        // As the url may have changed (by removing scope), record the usable url
        pkgDetails.url = `../uibuilder/vendor${pkgDetails.packageUrl}/${pkgDetails.estimatedEntryPoint}`

        // Frig to pick up the version of Bootstrap installed with bootstrap-vue
        if (packageName === 'bootstrap-vue') {
            pkgDetails.bootstrap = pkgJson.dependencies.bootstrap
        }

        // Add current version details
        // pkgDetails.outdated = this.npmOutdated(packageName)
        // console.log('pkgDetails.outdated', pkgDetails.outdated)
        // this.npmOutdated(packageName)
        //     .then(res => {
        //         try {
        //             res = JSON.parse(res)
        //         } catch(e) { /* */ }
        //         if ( res[packageName] ) {
        //             res = {
        //                 current: res[packageName].current,
        //                 wanted: res[packageName].wanted,
        //                 latest: res[packageName].latest,
        //             }
        //         }
        //         pkgDetails.outdated = res
        //         return true
        //     })
        //     .catch( err => {
        //         //
        //     })

        return pkgDetails
    } // ----  End of getPackageDetails2 ---- //

    //#region --- DEPRECATED ---

    /** Update all of the installed packages
     */
    updateInstalledPackages() {
        this.log.error('[uibuilder:UibPackages:updateInstalledPackages] FUNCTION IS DEPRECATED.')
        console.trace()

        console.trace('package-mgt.js:updateInstalledPackages')
    } // ---- End of updateInstalledPackages ---- //

    /** !DEPRECATED!  Find install folder for a package
     */
    getPackagePath() {
        this.log.error('[uibuilder:UibPackages:getPackagePath] FUNCTION IS DEPRECATED.')
        console.trace()

        console.trace('package-mgt.js:getPackagePath')
    } // ----  End of getPackagePath ---- //

    /** Update the master name list of possible packages that could be served to the front-end
     */
    updateMergedPackageList() {
        this.log.error('[uibuilder:UibPackages:updateMergedPackageList] FUNCTION IS DEPRECATED.')
        console.trace()

        console.trace('package-mgt.js:updateMergedPackageList')
    } // ---- End of updateMergedPackageList ---- //

    //#endregion --- DEPRECATED ---

    /** Install an npm package
     * NOTE: This fn does not update the list of packages
     *       because that is built from the package.json file
     *       and that is updated by calling web.serveVendorPackages()
     *       which can't be done here - The calling admin API's do that
     *       Editor->API->This fn->API cont.->web.serveVendorPackages->getUibRootPackageJson->API cont2->Editor
     * @param {string} url Node instance url
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @param {string} [tag] Default=''. Specifier for a version, tag, branch, etc. with leading @ for npm and # for GitHub installs
     * @param {string} [toLocation] Where to install to. Defaults to uibRoot
     * @returns {Promise<string>} [Combined stdout/stderr, updated list of package details]
     */
    async npmInstallPackage(url, pkgName, tag = '', toLocation = '') {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmInstallPackage] Cannot run. Setup has not been called.')
            return ''
        }

        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw new Error('this.log.rootFolder is null')
        if ( toLocation === '' ) toLocation = this.uib.rootFolder

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': toLocation,
            'all': true,
        }
        const args = [ // `npm install --no-audit --no-update-notifier --save --production --color=false --no-fund --json ${params.package}@latest`
            'install',
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            '--save',
            '--production',
            '--color=false',
            // '--json',
            pkgName + tag,
        ]

        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const { all } = await execa('npm', args, opts)
        this.log.info(`[uibuilder:UibPackages:npmInstallPackage] npm output: \n ${all}\n `)

        return /** @type {string} */ (all)

    } // ---- End of installPackage ---- //

    /** Install an npm package
     * NOTE: This fn does not update the list of packages - see install above for reasons.
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<string>} Combined stdout/stderr
     */
    async npmRemovePackage(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmRemovePackage] Cannot run. Setup has not been called.')
            return ''
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': this.uib.rootFolder,
            'all': true,
        }
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

        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const { all } = await execa('npm', args, opts)
        this.log.info(`[uibuilder:UibPackages:npmRemovePackage] npm output: \n ${all}\n `)

        return /** @type {string} */ (all)

    } // ---- End of removePackage ---- //

    /** List all npm packages installed at the top-level of a folder
     * @param {string=} folder The folder to start the list in
     * @returns {Promise<string>} Command output
     */
    async npmListInstalled(folder) {
        this.log.trace('[uibuilder:package-mgt:npmListInstalled] npm list installed started')

        // if ( this._isConfigured !== true ) {
        //     this.log.warn('[uibuilder:UibPackages:npmListInstalled] Cannot run. Setup has not been called.')
        //     return
        // }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': folder,
            'all': true,
        }
        const args = [
            'list',
            '--long',
            '--json',
            '--depth=0',
        ]

        let res
        try {
            const { stdout } = await execa('npm', args, opts)
            // console.log('>>>>>', stdout)
            res = stdout
        } catch (e) {
            // console.log('>>>>>', e.message)
            res = e.stdout
        }

        this.log.trace('[uibuilder:package-mgt:npmListInstalled] npm list installed completed')
        return res
    } // ---- End of npmListInstalled ---- //

    /** Get the latest version string for a package
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<any>} Combined stdout/stderr
     */
    async npmOutdated(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError
        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw this.#rootFldrNullError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmOutdated] Cannot run. Setup has not been called.')
            return
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': this.uib.rootFolder,
            'all': true,
        }
        const args = [ // `npm remove --no-audit --no-update-notifier --color=false --json ${params.package}` //  --save-prefix="~"
            'outdated',
            '--json',
            pkgName,
        ]

        let res
        try {
            const { stdout } = await execa('npm', args, opts)
            // const {stdout} = execa.sync('npm', args, opts)
            res = stdout
        } catch (err) {
            res = err.stdout
        }

        this.log.trace(`[uibuilder:UibPackages:npmOutdated] npm output: \n ${res}\n `)

        return res

    } // ---- End of npmOutdated ---- //

    /** Update an npm package (Not yet in use)
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<string>} Combined stdout/stderr
     */
     async npmUpdate(pkgName) {
        if ( this.log === undefined ) throw this.#logUndefinedError

        if ( this.#isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmUpdate] Cannot run. Setup has not been called.')
            return ''
        }

        if ( this.uib === undefined ) throw this.#uibUndefinedError
        if ( this.uib.rootFolder === null ) throw new Error('this.log.rootFolder is null')
        // if ( toLocation === '' ) toLocation = this.uib.rootFolder
        const toLocation = this.uib.rootFolder

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': toLocation,
            'all': true,
        }
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

        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const { all } = await execa('npm', args, opts)
        this.log.info(`[uibuilder:UibPackages:npmUpdate] npm output: \n ${all}\n `)

        return /** @type {string} */ (all)

     }

} // ----- End of UibPackages ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibPackages = new UibPackages()
module.exports = uibPackages

// EOF
