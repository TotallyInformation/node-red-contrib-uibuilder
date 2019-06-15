/**
 * General utility library for Node.JS
 * 
 * Copyright (c) 2019 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk
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
 **/
// @ts-check
'use strict'

const path = require('path')
const fs = require('fs-extra')

module.exports = {
    /** Remove leading/trailing slashes from a string
     * @param {string} str
     * @returns {string}
     */
    trimSlashes: function(str) {
        return str.replace(/(^\/*)|(\/*$)/g, '')
    }, // ---- End of trimSlashes ---- //

    /** Joins all arguments as a URL string
     * @see http://stackoverflow.com/a/28592528/3016654
     * @since v1.0.10, fixed potential double // issue
     * @arguments {string} URL fragments
     * @returns {string}
     */
    urlJoin: function() {
        const paths = Array.prototype.slice.call(arguments)
        const url =
            '/'+paths.map(function(e){
                return e !== undefined ? e.replace(/^\/|\/$/g,'') : ''
            }).filter(function(e){
                return e
            }).join('/')
        return  url.replace('//','/')
    }, // ---- End of urlJoin ---- //

    /** Escape a user input string to use in a regular expression
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
     * @param {string} string
     * @returns {string} Input string escaped to use in a re
     */
    escapeRegExp: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }, // ---- End of escapeRegExp ---- //

    /**  Get a list of all of the npm run scripts in <folder>/package.json OR
     * Check if a specific script exists in <folder>/package.json
     * Used to check that restart and build scripts are available.
     * @param {string} chkPath - The path that should contain a package.json
     * @param {string} chkScript - OPTIONAL. If present return the script text if present
     * @returns {Object|string|undefined|null} undefined if file not found or list of script names/commands. If chkScript, null if not found or script text.
     */
    getNpmRunScripts: function(chkPath, chkScript='') {
        let pj = undefined
        try {
            pj = require( path.join( chkPath, 'package.json' ) ).scripts
        } catch (e) {
            pj = undefined
        }
        if ( (pj !== undefined) && (chkScript !== '') ) {
            if (pj[chkScript] === undefined) pj = null
            else pj = pj[chkScript]
        }
        return pj
    }, // ---- End of getRedUserRunScripts ---- //

    /** Merge and deduplicate multiple arrays
     * @see https://stackoverflow.com/a/27664971/1309986
     * @param {any[]} arr One or more arrays
     * @returns {any[]} Deduplicated, merged single array
     */
    mergeDedupe: function(...arr) {
        return [...new Set([].concat(...arr))]
    }, // ----  ---- //

    /** Utility function to html pretty-print JSON */
    syntaxHighlight: function(json) {
        /*
            pre .string { color: orange; }
            .number { color: white; }
            .boolean { color: rgb(20, 99, 163); }
            .null { color: magenta; }
            .key { color: #069fb3;}
        */
        json = JSON.stringify(json, undefined, 4)
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        json = '<pre class="syntax-highlight" style="color:white;background-color:black;overflow:auto;">' + json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number', style = 'style="color:white"'
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key'
                    style = 'style="color:#069fb3"'
                } else {
                    cls = 'string'
                    style = 'style="color:orange"'
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean'
                style = 'style="color:rgb(20,99,163)"'
            } else if (/null/.test(match)) {
                cls = 'null'
                style = 'style="color:magenta"'
            }
            return `<span class="${cls}" ${style}>${match}</span>`
        }) + '</pre>'
        return json
    }, // ----  ---- //
    
    /** Find package install folder
     * Searches in: userDir, nrc-uibuilder/node_modules, require.resolve(packageName) in that order.
     * NOTE: require.resolve can be a little ODD! 
     *       When run from a linked package, it uses the link root not the linked location, 
     *       this throws out the tree search. That's why we have to try several different locations here.
     *       Also, it finds the "main" script name which might not be in the package root.
     * @param {string} packageName - Name of the package who's root folder we are looking for.
     * @param {string} userDir - Home folder for Node-RED modules - needed to allow search for installation
     * @return {null|string} Actual filing system path to the installed package
     */
    findPackage: function(packageName, userDir) {
        
        let found = false, packagePath = ''
        // Try in userDir first
        try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [userDir]}) )
            //console.log(`${packageName} found from userDir`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found from uibuilder. Path: ${userDir}`)
        }
        // Then try without a path
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName) )
            //console.log(`${packageName} found`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found`)
        }
        // Finally try in the uibuilder source folder
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [path.join(__dirname,'..')]}) )
            //console.log(`${packageName} found from uibuilder`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found from uibuilder. Path: ${path.join(__dirname,'..')}`)
        }

        if ( found === false ) return null

        /** require.resolve returns the "main" script, this may not be in the root folder for the package
         *  so we change that here. We check whether the last element of the path matches the package
         *  name. If not, we walk back up the tree until it is or we run out of tree.
         *  If we don't do this, when it is used with serveStatic, we may not get everything we need served.
         * NB: Only assuming 3 levels here.
         */
        let pathSplit = packagePath.split(path.sep)
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageName) ) pathSplit.pop()
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageName) ) pathSplit.pop()
        if ( (pathSplit.length > 1) && (pathSplit[pathSplit.length - 1] !== packageName) ) pathSplit.pop()
        packagePath = pathSplit.join(path.sep)

        return packagePath
    }, // ----  ---- //

    /** DEPRECATED. Return an updated list of installed front-end library packages
     * TODO DEPRECATE and change references to uiblib.updVendorPaths()
     * @param {string[]} masterPackageList Array of installed package names
     * @param {string} userDir Home folder for Node-RED modules - needed to allow search for installation
     * @return {string[]} Updated array of installed packages
     */
    updatePackageList: function(masterPackageList, userDir) {
        console.warn('uibuilder warning: tilib.updatePackageList is DEPRECATED, please remove from code')
        // Clone the current package list
        const packageList = [...masterPackageList]
        // Walk the cloned list and find any that are no longer actally there - changes the original list
        packageList.forEach(function(packageName,index){
            // call check function
            const qPackage = this.findPackage(packageName, userDir)
            // If not found, remove from global list
            if ( qPackage === null ) {
                masterPackageList = masterPackageList.filter(function(pName, index){
                    return pName != packageName
                })
            }
            // TODO ?Remove served references? Is this necessary?
        })
        // Find common FE packages and add them to the list if not already there - changes the original list

        return masterPackageList
    }, // ---- End of updatePackageList ---- //

    /** Read the contents of a package.json file 
     * @param {string} folder The folder containing a package.json file
     * @returns {Object|null} Object representation of JSON if found otherwise null
    */
    readPackageJson: function(folder) {
        var file = null
        try {
            // TODO replace with fs-extra readJsonSync
            file = JSON.parse( fs.readFileSync( path.join(folder, 'package.json'), 'utf8' ) )
        } catch (err) {
            //console.error('[uibuilder] tilib.readPackageJson - failed to read ', folder, 'package.json', err)
            file = {'ERROR': err}
        }
        return file
    }, // ----  ---- //

    /** Compare 2 simple arrays, return array of arrays - additions and deletions
     * @param {array} a1 First array
     * @param {array} a2 Second array
     * @returns {[string[],string[]]} Array of 2 arrays. Inner array 1: Additions, 2: Deletions
     */
    compareArrays: function(a1, a2) {
        let temp = [ [], [] ]

        // for each a1 entry, if not in a2 then push to temp[0]
        for (let i = 0, len = a1.length; i < len; ++i) {
            if(a2.indexOf(a1[i]) === -1) temp[0].push(a1[i])
        }

        // for each a2 entry, if not in a1 then push to temp[1]
        for (let i = 0, len = a2.length; i < len; ++i) {
            if(a1.indexOf(a2[i]) === -1) temp[1].push(a2[i])
        }

        // @ts-ignore
        return temp
    }, // ----  ---- //

    /** Compare 2 simple arrays, return false as soon as a difference is found
     * @param {array} a1 First array
     * @param {array} a2 Second array
     * @returns {boolean} False if arrays are differnt, else True
     */
    quickCompareArrays: function(a1, a2) {
        // for each a1 entry, if not in a2 then push to temp[0]
        for (let i = 0, len = a1.length; i < len; ++i) {
            if(a2.indexOf(a1[i]) === -1) return false
        }

        // for each a2 entry, if not in a1 then push to temp[1]
        for (let i = 0, len = a2.length; i < len; ++i) {
            if(a1.indexOf(a2[i]) === -1) return false
        }

        return true
    }, // ----  ---- //
    
} // ---- End of module.exports ---- //