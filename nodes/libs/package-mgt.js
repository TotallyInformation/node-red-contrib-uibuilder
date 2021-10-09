/** Manage npm packages
 * 
 * Copyright (c) 2021 Julian Knight (Totally Information)
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
const tilib = require('./tilib')
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
        this._isConfigured = true

        if ( ! uib ) {
            throw new Error('[uibuilder:UibPackages.js:setup] Called without required uib parameter')
        }

        this.RED = uib.RED
        this.uib = uib
        this.log = uib.RED.log
        
        // Make sure we have the list as soon as possible
        this.updateMergedPackageList('')

        this.updateInstalledPackages()

    } // ---- End of setup ---- //

    /** Update all of the installed packages
     * NB: Not including Global installs because they are not managed the same way by npm and there is no matching master package.json
     * @param {string=} url A uibuilder node instance url
     * @returns {object} List of installed packages from userDir, uibRoot and the node instance
     */
    updateInstalledPackages(url) {

        // See which front-end packages are already installed (compare uib.me.dependencies with master package list? Better to scan the node_modules folder?)
        this.userDirPackageList = ( this.readPackageJson( path.join(this.RED.settings.userDir) ) ).dependencies || {}
        this.uibRootPackageList = ( this.readPackageJson( path.join(this.uib.rootFolder) ) ).dependencies || {}

        // console.log('>> userDir >> ', this.userDirPackageList, this.RED.settings.userDir)
        // console.log('>> uibRoot >> ',  this.uibRootPackageList, this.uib.rootFolder)

        if ( url && url !== undefined && url !== 'undefined' ) {
            this.uibNodePackageList[url] = ( this.readPackageJson( path.join(this.uib.rootFolder, url) ) ).dependencies || {}
            console.log('>> Node    >>', this.uibNodePackageList, url, path.join(this.uib.rootFolder, url))
        } else {
            this.uibNodePackageList = {}
        }

        //console.log('>> uib.installedPackages >> ', this.uib.installedPackages)
        // return {
        //     userDir: this.userDirPackageList,
        //     uibRoot: this.uibRootPackageList,
        //     node: this.uibNodePackageList[url],
        // }
        return {
            ...this.userDirPackageList,
            ...this.uibRootPackageList,
            ...this.uibNodePackageList[url],
        }

    } // ---- End of updateInstalledPackages ---- //

    /** Find install folder for a package
     * NOTE: require.resolve can be a little ODD! 
     *       When run from a linked package, it uses the link root not the linked location, 
     *       this throws out the tree search. That's why we have to try several different locations here.
     *       Also, it finds the "main" script name which might not be in the package root.
     *       Also, it won't find ANYTHING if a `main` entry doesn't exist :(
     *       So we no longer use it, just search for folder names.
     * @param {string} packageName - Name of the package who's root folder we are looking for.
     * @param {uibNode=} node A uibuilder node instance - will search in node's root folder first
     * @returns {null|string} Actual filing system path to the installed package
     */
    getPackagePath(packageName, node) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:getPackagePath] Cannot run. Setup has not been called.')
            return
        }

        let uib = this.uib
        let userDir = this.RED.settings.userDir

        let tracePkg = false // Use this to debug package finding if needed
        let mylog = tracePkg ? tilib.mylog : function(){}
        
        let found = false, packagePath = ''

        // May as well just search the folder names first. require.resolve is too unreliable and quirky.
        let loc
        // 1) If a node instance is provided, search there first
        if (node) {
            loc = path.join(uib.rootFolder, node.url, 'node_modules', packageName)
            if (fs.existsSync( loc )) {
                found = true
                packagePath = loc
                mylog(`>> FOUND ${packageName} at ${loc}`)
            } else {
                mylog(`>> NOT FOUND ${packageName} at ${loc}`)
            }
        }
        // 2) Check the Common modules next
        if (!found) {
            loc = path.join(userDir, 'node_modules', packageName)
            if (fs.existsSync( loc )) {
                found = true
                packagePath = loc
                mylog(`>> FOUND ${packageName} at ${loc}`)
            } else {
                mylog(`>> NOT FOUND ${packageName} at ${loc}`)
            }
        }
        // 3) Check the userDir modules next
        if (!found) {
            loc = path.join(userDir, 'node_modules', packageName)
            if (fs.existsSync( loc )) {
                found = true
                packagePath = loc
                mylog(`>> FOUND ${packageName} at ${loc}`)
            } else {
                mylog(`>> NOT FOUND ${packageName} at ${loc}`)
            }
        }
        // 4) Then check uibuilder's modules
        if (!found) {
            loc = path.join(__dirname, '..', '..', 'node_modules', packageName)
            if (fs.existsSync( loc )) {
                found = true
                packagePath = loc
                mylog(`>> FOUND ${packageName} at ${loc}`)
            } else {
                mylog(`>> NOT FOUND ${packageName} at ${loc}`)
            }
        }
        // 4) Finally try the global modules - no, don't because there is no package.json for the globals parent
        // if (!found) {
        //     loc = path.join(this.globalPrefix, 'node_modules', packageName)
        //     if (fs.existsSync( loc )) {
        //         found = true
        //         packagePath = loc
        //         mylog(`>> FOUND ${packageName} at ${loc}`)
        //     } else {
        //         mylog(`>> NOT FOUND ${packageName} at ${loc}`)
        //     }
        // }

        /* DEPRECATED: Using unreliable require.resolve
        // Try in userDir first
        if (!found) try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [userDir]}) )
            mylog(`[UIBUILDER] ${packageName} found from userDir`, packagePath)
            found = true
        } catch (e) {
            mylog(`[UIBUILDER] ${packageName} not found from userDir. Path: ${userDir}`)
        }
        // Then try without a path
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName) )
            mylog(`[UIBUILDER] ${packageName} found (no path)`, packagePath)
            found = true
        } catch (e) {
            mylog(`[UIBUILDER] ${packageName} not found (no path)`)
        }
        // Then try this uibuilder instance's root folder
        if (!found) try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [userDir]}) )
            mylog(`[UIBUILDER] ${packageName} found from userDir`, packagePath)
            found = true
        } catch (e) {
            mylog(`[UIBUILDER] ${packageName} not found from userDir. Path: ${userDir}`)
        }
        // Finally try in the uibuilder source folder
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [path.join(__dirname,'..')]}) )
            mylog(`[UIBUILDER] ${packageName} found from uibuilder path`, packagePath)
            found = true
        } catch (e) {
            mylog(`[UIBUILDER] ${packageName} not found from uibuilder path. Path: ${path.join(__dirname,'..')}`)
        } */
        
        if ( found === false ) {
            mylog(`>> ${packageName} not found anywhere\n`)
            return null
        }

        /** require.resolve returns the "main" script, this may not be in the root folder for the package
         *  so we change that here. We check whether the last element of the path matches the package
         *  name. If not, we walk back up the tree until it is or we run out of tree.
         *  If we don't do this, when it is used with express.static, we may not get everything we need served.
         * NB: Only assuming 3 levels here.
         * NB2: Added packageName split to allow for more complex npm package names.
         */
        /* DEPRECATED: Only needed when using require.resolve
        let pathSplit = packagePath.split(path.sep)
        let packageLast = packageName.split('/').pop() // Allow for package names like `@riophae/vue-treeselect`
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageLast) ) pathSplit.pop()
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageLast) ) pathSplit.pop()
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageLast) ) pathSplit.pop()
        packagePath = pathSplit.join(path.sep) */

        return packagePath

    } // ----  End of getPackagePath ---- //
    
    /** Update the master name list of possible packages that could be served to the front-end
     * Called initially from this.setup (early in uibuilder setup)
     * and then repeatedly from other places that trigger an update.
     * @param {string} newPkg Optional new package to add to the list
     */
    updateMergedPackageList(newPkg='') {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmInstallPackage] Cannot run. Setup has not been called.')
            return
        }

        let uib = this.uib
        //let log = this.log
        let installedPackages = uib.installedPackages
        let pkgList = []
        let masterPkgList = []

        // Read packageList and masterPackageList from their files
        try {
            pkgList = fs.readJsonSync(path.join(uib.configFolder, uib.packageListFilename))
        } catch (err) {
            // not an issue
        }
        try {
            masterPkgList = fs.readJsonSync(path.join(uib.configFolder, uib.masterPackageListFilename))
        } catch (err) {
            // no op
        }
        // // If neither can be found, that's an error
        // if ( (pkgList.length === 0) && (masterPkgList.length === 0) ) {
        //     log.error(`[uibuilder:web:checkInstalledPackages] Neither packageList nor masterPackageList could be read from: ${uib.configFolder}`)
        //     return null
        // }

        // Make sure we have socket.io in the list
        masterPkgList.push('socket.io')

        // Add in the new package as well if requested
        if (newPkg !== '') {
            pkgList.push(newPkg)
        }

        // Merge and de-dup to get a complete list
        this.mergedPkgMasterList = tilib.mergeDedupe(Object.keys(installedPackages), pkgList, masterPkgList)
    } // ---- End of updateMergedPackageList ---- //

    /** Install an npm package
     * @param {string} url Node instance url
     * @param {string} location One of 'userdir', 'common' or 'local'
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<string>} Combined stdout/stderr
     */
    async npmInstallPackage(url, location, pkgName) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmInstallPackage] Cannot run. Setup has not been called.')
            return
        }

        let folder
        switch (location) {
            case 'userdir': {
                folder = this.RED.settings.userDir
                break
            }
            case 'common': {
                folder = this.uib.rootFolder
                break
            }
            case 'local': {
                folder = path.join( this.uib.rootFolder, url )
                break
            }
        
            default: {
                folder = this.RED.settings.userDir
                break
            }
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': folder,
            'all': true,
        }
        const args = [ // `npm install --no-audit --no-update-notifier --save --production --color=false --no-fund --json ${params.package}@latest`
            'install', 
            '--no-audit',
            '--no-update-notifier',
            '--save',
            '--production',
            '--color=false',
            '--no-fund',
            //'--json',
            pkgName,
        ]
        
        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const {all} = await execa('npm', args, opts)

        this.updateInstalledPackages(url, location, pkgName)

        return all

    } // ---- End of installPackage ---- //

    /** Install an npm package
     * @param {string} folder Path of the folder in which to install the package
     * @param {string} pkgName The npm name of the package (with scope prefix, version, etc if needed)
     * @returns {Promise<string>} Combined stdout/stderr
     */
    async npmRemovePackage(folder, pkgName) {
        if ( this._isConfigured !== true ) {
            this.log.warn('[uibuilder:UibPackages:npmRemovePackage] Cannot run. Setup has not been called.')
            return
        }

        // https://github.com/sindresorhus/execa#options
        const opts = {
            'cwd': folder,
            'all': true,
        }
        const args = [ // `npm remove --no-audit --no-update-notifier --color=false --json ${params.package}` //  --save-prefix="~"
            'uninstall', 
            '--save',
            '--color=false',
            '--no-fund',
            //'--json',
            pkgName,
        ]
        
        // Don't need a try since we don't do any processing on an execa error - if cmd fails, the promise is rejected
        const {all} = await execa('npm', args, opts)

        this.updateInstalledPackages()

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
            console.log('>>>>>', all)
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
