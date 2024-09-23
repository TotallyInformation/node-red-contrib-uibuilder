/* eslint-disable prefer-named-capture-group */
/**
 * General utility library for Node.JS
 *
 * Copyright (c) 2019-2023 Julian Knight (Totally Information)
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
'use strict'

const path = require('path')

const mylog = (process.env.TI_ENV === 'debug') ? console.log : function() {}

module.exports = {
    /** The name of the package.json file 'package.json' */
    packageJson: 'package.json',

    /** Remove leading/trailing slashes from a string
     * @param {string} str String to trim
     * @returns {string} Trimmed string
     */
    trimSlashes: function(str) {
        return str.replace(/(^\/*)|(\/*$)/g, '')
    }, // ---- End of trimSlashes ---- //

    /** Joins all arguments as a URL string
     * @see http://stackoverflow.com/a/28592528/3016654
     * param {...string} [path] URL fragments (picked up via the arguments var)
     * @returns {string} Joined path
     */
    urlJoin: function() {
        /** @type {Array<string>} */
        const paths = Array.prototype.slice.call(arguments)
        const url = '/' + paths.map(function(e) {
            return e !== undefined ? e.replace(/^\/|\/$/g, '') : ''
        })
            .filter(function(e) {
                return e
            })
            .join('/')
        return  url.replace('//', '/')
    }, // ---- End of urlJoin ---- //

    /** Escape a user input string to use in a regular expression
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
     * @param {string} string String to escape
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
     * @returns {object|string|undefined|null} undefined if file not found or list of script names/commands. If chkScript, null if not found or script text.
     */
    getNpmRunScripts: function(chkPath, chkScript = '') {
        let pj
        try {
            pj = require( path.join( chkPath, this.packageJson ) ).scripts
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

    /** Utility function to html pretty-print JSON
     * @param {*} json JSON to pretty-print
     * @returns {string} HTML
     */
    syntaxHighlight: function(json) {
        /*
            pre .string { color: orange; }
            .number { color: white; }
            .boolean { color: rgb(20, 99, 163); }
            .null { color: magenta; }
            .key { color: #069fb3;}
        */
        json = JSON.stringify(json, undefined, 4)
        json = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
        json = '<pre class="syntax-highlight" style="color:white;background-color:black;overflow:auto;">' +
            json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
                let cls = 'number'; let style = 'style="color:white"'
                if ((/^"/).test(match)) {
                    if ((/:$/).test(match)) {
                        cls = 'key'
                        style = 'style="color:#069fb3"'
                    } else {
                        cls = 'string'
                        style = 'style="color:orange"'
                    }
                } else if ((/true|false/).test(match)) {
                    cls = 'boolean'
                    style = 'style="color:rgb(20,99,163)"'
                } else if ((/null/).test(match)) {
                    cls = 'null'
                    style = 'style="color:magenta"'
                }
                return `<span class="${cls}" ${style}>${match}</span>`
            }) +
            '</pre>'
        return json
    }, // ----  ---- //

    /** Returns true/false or a default value for truthy/falsy and other values
     * @param {string|number|boolean|*} val The value to test
     * @param {any} deflt Default value to use if the value is not truthy/falsy
     * @returns {boolean|any} The truth! Or the default
     */
    truthy(val, deflt) {
        let ret
        if (['on', 'On', 'ON', 'true', 'True', 'TRUE', '1', true, 1].includes(val)) ret = true
        else if (['off', 'Off', 'OFF', 'false', 'False', 'FALSE', '0', false, 0].includes(val)) ret = false
        else ret = deflt
        return ret
    },

    /** Compare 2 simple arrays, return array of arrays - additions and deletions
     * @param {Array} a1 First array
     * @param {Array} a2 Second array
     * @returns {[string[],string[]]} Array of 2 arrays. Inner array 1: Additions, 2: Deletions
     */
    compareArrays: function(a1, a2) {
        const temp = [[], []]

        // for each a1 entry, if not in a2 then push to temp[0]
        for (let i = 0, len = a1.length; i < len; ++i) {
            if (a2.indexOf(a1[i]) === -1) temp[0].push(a1[i])
        }

        // for each a2 entry, if not in a1 then push to temp[1]
        for (let i = 0, len = a2.length; i < len; ++i) {
            if (a1.indexOf(a2[i]) === -1) temp[1].push(a2[i])
        }

        // @ts-ignore
        return temp
    }, // ----  ---- //

    /** Compare 2 simple arrays, return false as soon as a difference is found
     * @param {Array} a1 First array
     * @param {Array} a2 Second array
     * @returns {boolean} False if arrays are differnt, else True
     */
    quickCompareArrays: function(a1, a2) {
        // for each a1 entry, if not in a2 then push to temp[0]
        for (let i = 0, len = a1.length; i < len; ++i) {
            if (a2.indexOf(a1[i]) === -1) return false
        }

        // for each a2 entry, if not in a1 then push to temp[1]
        for (let i = 0, len = a2.length; i < len; ++i) {
            if (a1.indexOf(a2[i]) === -1) return false
        }

        return true
    }, // ----  ---- //

    /** Return only the most important parts of an ExpressJS `req` object
     * @param {object} req express.Request
     * @returns {object} importantReq
     */
    dumpReq: function(req) {
        return {
            'headers': {
                'host': req.headers.host,
                'referer': req.headers.referer,
            },
            'url': req.url,
            'method': req.method,
            'baseUrl': req.baseUrl,
            'hostname': req.hostname,
            'originalUrl': req.originalUrl,
            'path': req.path,
            'protocol': req.protocol,
            'secure': req.secure,
            'subdomains': req.subdomains,
        }
    }, // ----  ---- //

    /** Debugging output that only executes if an env variable is set before Node-RED is run */
    mylog: mylog,

    /** Dump process memory use to console
     * @param {string} prefix Text to output before the memory info
     */
    dumpMem: (prefix) => {
        const mem = process.memoryUsage()
        const formatMem = (m) => ( m / 1048576 ).toFixed(2)
        mylog(`${prefix} Memory Use (MB): RSS=${formatMem(mem.rss)}. Heap: Used=${formatMem(mem.heapUsed)}, Tot=${formatMem(mem.heapTotal)}. Ext C++=${formatMem(mem.external)}`)
    },

} // ---- End of module.exports ---- //

// EOF
