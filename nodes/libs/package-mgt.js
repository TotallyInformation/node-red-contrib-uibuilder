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
 */

const path = require('path')
//const util = require('util')
const fs = require('fs-extra')
//const tilib = require('./tilib')
const execa = require('execa')

class UibPackages {
    // TODO: Replace _XXX with #XXX once node.js v14 is the minimum supported version
    /** Flag to indicate whether setup() has been run
     * @type {boolean}
     * @protected 
     */
    //_isConfigured

    constructor() {
        // setup() has not yet been run
        this._isConfigured = false

        //#region ---- References to core Node-RED & uibuilder objects ---- //

        /** @type {runtimeRED} */
        this.RED = undefined
        /** @type {uibConfig} Reference link to uibuilder.js global configuration object */
        this.uib = undefined
        /** Reference to uibuilder's global log functions */
        this.log = undefined

        //#endregion ---- References to core Node-RED & uibuilder objects ---- //

        /** @type {Array<string>} Updated by updateMergedPackageList which is called first in setup and then in various updates */
        this.mergedPkgMasterList = []

        /** @type {string} Get npm's global install location */
        this.globalPrefix = this.npmGetGlobalPrefix()

        /** @type {string} The name of the package.json file 'package.json' */
        this.packageJson = 'package.json'

        /** @type {*} The uibRoot package.json contents */
        this.uibPackageJson

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

    /** Read the contents of a package.json file 
     * @param {string} folder The folder containing a package.json file
     * @returns {object|null} Object representation of JSON if found otherwise null
     */
    readPackageJson(folder) {
        // Does not need setup to have run

        let debug = false
        let file = null
        try {
            file = fs.readJsonSync( path.join(folder, this.packageJson), 'utf8' )
            if (debug) console.log(`[uibuilder:package-mgt:readPackageJson] package.json file read successfully from ${folder}`)
        } catch (err) {
            if (debug) console.error(`[uibuilder:package-mgt:readPackageJson] Failed to read package.json file from  ${folder}`, this.packageJson, err)
            file = {'ERROR': err}
        }
        return file
    } // ---- End of readPackageJson ---- //
        
    /** Configure this class with uibuilder module specifics
     * @param {uibConfig} uib uibuilder module-level configuration
     */
    setup( uib ) {
        // Prevent setup from being called more than once
        if ( this._isConfigured === true ) {
            uib.RED.log.warn('[uibuilder:UibPackages:setup] Setup has already been called, it cannot be called again.')
            return
        }

        if ( ! uib ) {
            throw new Error('[uibuilder:UibPackages.js:setup] Called without required uib parameter')
        }

        this.RED = uib.RED
        this.uib = uib
        this.log = uib.RED.log

        // At this point we have the refs to uib and RED
        this._isConfigured = true

    } // ---- End of setup ---- //

    /** Create/Update, record & return <uibRoot>/package.json (create it if it doesn't exist)
     * @returns {object|null} Parsed version of <uibRoot>/package.json with uibuilder specific updates
     */
    getUibRootPackageJson() {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getUibRootPackageJson] Cannot run. Setup has not been called.')
            return
        }

        const uibRoot = this.uib.rootFolder
        const fileName = path.join( uibRoot, 'package.json' )

        // Make sure it exists & contains valid JSON
        if ( ! fs.existsSync(fileName) ) {
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
        if ( ! pj.dependencies ) pj.dependencies = {}
        // Make sure there is a uibuilder prop
        if ( ! pj.uibuilder ) pj.uibuilder = {}
        // Reset the packages list, we rebuild it below
        pj.uibuilder.packages = {}
        
        // Update the version string to match uibuilder version
        pj.version = this.uib.version

        // Make sure we have package details for all installed packages
        Object.keys(pj.dependencies).forEach( packageName => {
            // Get/Update package details
            pj.uibuilder.packages[packageName] = this.getPackageDetails2(packageName, this.uib.rootFolder)
            // And save the version/location spec from the dependencies prop so everything is together
            pj.uibuilder.packages[packageName].spec = pj.dependencies[packageName]

            //Frig to pick up the version of Bootstrap installed with bootstrap-vue
            if (packageName === 'bootstrap-vue' && ! pj.dependencies.bootstrap ) {
                pj.dependencies.bootstrap = pj.uibuilder.packages[packageName].bootstrap
                pj.uibuilder.packages.bootstrap = this.getPackageDetails2('bootstrap', this.uib.rootFolder)
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
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:setUibRootPackageJson] Cannot run. Setup has not been called.')
            return
        }

        const uibRoot = this.uib.rootFolder
        const fileName = path.join( uibRoot, 'package.json' )

        // Save it for use elsewhere
        this.uibPackageJson = json
        
        // TODO Add try & error message
        fs.writeJsonSync(fileName, json)
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
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getPackagePath] Cannot run. Setup has not been called.')
            return
        }

        // If installRoot = string, make an array
        if ( !Array.isArray(installRoot) ) installRoot = [installRoot]

        for (let r of installRoot) {
            let loc = path.join(r, 'node_modules', packageName)
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
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getPackagePath] Cannot run. Setup has not been called.')
            return
        }

        // Trim the input just in case
        packageName = packageName.trim()

        const folder = this.getPackagePath2(packageName, installRoot)
        const pkgJson = this.readPackageJson(folder)

        const pkgDetails = { 'installFolder': folder }
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

        //Frig to pick up the version of Bootstrap installed with bootstrap-vue
        if (packageName === 'bootstrap-vue') {
            pkgDetails.bootstrap = pkgJson.dependencies.bootstrap
        }

        return pkgDetails
    } // ----  End of getPackageDetails2 ---- //
    
    // ----

    /** DEPRECATED Update all of the installed packages
     */
    updateInstalledPackages() {
        console.trace('package-mgt.js:updateInstalledPackages')
    } // ---- End of updateInstalledPackages ---- //

    /** DEPRECATED Find install folder for a package
     */
    getPackagePath() {
        console.trace('package-mgt.js:getPackagePath')
    } // ----  End of getPackagePath ---- //
    
    /** DEPRECATED Update the master name list of possible packages that could be served to the front-end
     */
    updateMergedPackageList() {
        console.trace('package-mgt.js:updateMergedPackageList')
    } // ---- End of updateMergedPackageList ---- //

    // ------

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
    async npmInstallPackage(url, pkgName, tag='', toLocation=this.uib.rootFolder) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmInstallPackage] Cannot run. Setup has not been called.')
            return
        }

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
            //'--json',
            pkgName + tag,
        ]
        
        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const {all} = await execa('npm', args, opts)
        this.log.info(`[uibuilder:UibPackages:npmRemovePackage] npm output: \n ${all}\n `)

        return all

    } // ---- End of installPackage ---- //

    /** Install an npm package
     * NOTE: This fn does not update the list of packages - see install above for reasons.
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<string>} Combined stdout/stderr
     */
    async npmRemovePackage(pkgName) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmRemovePackage] Cannot run. Setup has not been called.')
            return
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': this.uib.rootFolder,
            'all': true,
        }
        const args = [ // `npm remove --no-audit --no-update-notifier --color=false --json ${params.package}` //  --save-prefix="~"
            'uninstall', 
            '--save',
            '--color=false',
            '--no-fund',
            '--no-audit',
            '--no-update-notifier',
            //'--json',
            pkgName,
        ]
        
        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const {all} = await execa('npm', args, opts)
        this.log.info(`[uibuilder:UibPackages:npmRemovePackage] npm output: \n ${all}\n `)

        return all

    } // ---- End of removePackage ---- //

    /** List all npm packages installed at the top-level of a folder
     * @param {string=} folder The folder to start the list in
     * @returns {Promise<string>} Command output
     */
    async npmListInstalled(folder) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmListInstalled] Cannot run. Setup has not been called.')
            return
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': folder,
            'all': true,
        }
        const args = [
            'ls', 
            '--depth=0', 
            //'--json=true',
        ]
        
        let res
        try {
            const {all} = await execa('npm', args, opts)
            //console.log('>>>>>', all)
            res = all
        } catch (e) {
            console.error('>>>>>', e.all)    
            res = e.all  // Do we need to wrap this in a promise?
        }

        return res
    } // ---- End of npmListInstalled ---- //

} // ----- End of UibPackages ----- //

/** Singleton model. Only 1 instance of UibWeb should ever exist.
 * Use as: `const packageMgt = require('./package-mgt.js')`
 */
// @ts-ignore
const uibPackages = new UibPackages()
module.exports = uibPackages

//EOF
