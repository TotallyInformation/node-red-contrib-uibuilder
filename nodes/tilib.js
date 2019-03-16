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
const fs = require('fs')

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
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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
        return [...new Set([].concat(...arr))];
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
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<pre style="color:white;background-color:black">' + json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
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
    }, // ----  ---- //
    
    /** Find package install folder
     * Searches in: userDir, nrc-uibuilder/node_modules, require.resolve(packageName) in that order.
     * NOTE: require.resolve can be a little ODD! 
     *       When run from a linked package, it uses the link root not the linked location, 
     *       this throws out the tree search. That's why we have to try several different locations here.
     *       Also, it finds the "main" script name which might not be in the package root.
     * @param {string} packageName - Name of the package who's root folder we are looking for.
     * @param {string} userDir - Home folder for Node-RED modules
     */
    findPackage: function(packageName, userDir) {
        
        let found = false, packagePath = ''
        try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [userDir]}) )
            //console.log(`${packageName} found from userDir`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found from userDir`)
        }
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName) )
            //console.log(`${packageName} found`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found`)
        }
        if (found === false) try {
            packagePath = path.dirname( require.resolve(packageName, {paths: [path.join(__dirname,'..')]}) )
            //console.log(`${packageName} found from uibuilder`, packagePath)
            found = true
        } catch (e) {
            //console.log (`${packageName} not found from uibuilder`)
        }

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

    /** Read the contents of a package.json file 
     * @param {string} folder The folder containing a package.json file
     * @returns {Object|null} Object representation of JSON if found otherwise null
    */
    readPackageJson: function(folder) {
        var file = null
        try {
            file = JSON.parse( fs.readFileSync( path.join(folder, 'package.json'), 'utf8' ) )
        } catch (err) {
            //console.error('[uibuilder] tilib.readPackageJson - failed to read ', folder, 'package.json', err)
        }
        return file
    }, // ----  ---- //

} // ---- End of module.exports ---- //