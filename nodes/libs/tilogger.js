/** Custom logging module using just the Console object 
 * Use as:
 *     const logger = require('./tilogger.js')
 *     var console = logger.console() // output to the current processes stdout/stderr
 *     console.verbose('This is verbose output - it will be prefixed with date/time and output level')
 * Or, create your own output log:
 *     var console = logger.console('/some/path/mylog.log') // add 2nd param if you want errors to go to a different location
 * 
 * DEPENDENCIES:
 *     Node.js v8+
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
*/
'use strict'

const fs = require('fs')

/** Return a formatted date/time
 * @param {string|Date} aDT A JavaScript Date object or a date-like string
 * @returns {string} Formatted date string: 'mm-dd HH:MM:SS.SSSS'
 */
function fmtDT(aDT) {
    if (typeof aDT === 'string') aDT = new Date(aDT)

    var month = String(aDT.getMonth() + 1).padStart(2,'0') // months are zero indexed
    var day = String(aDT.getDate()).padStart(2,'0')
    var hours = String(aDT.getHours()).padStart(2,'0')
    var minutes = String(aDT.getMinutes()).padStart(2,'0')
    var seconds = String(aDT.getSeconds()).padStart(2,'0')
    var ms = String(aDT.getMilliseconds()).padStart(4,'0')

    return `${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`
}

/** Return a structured V8 stack trace */
function prepStack(error, stack) { 
    const myStack = []
    var j = 0
    for (let i = 0; i < stack.length; i++) {
        const frame = stack[i]
        const fName = frame.getFileName()
        if (!fName.includes('tilogger') && !fName.startsWith('internal/')) {
            myStack.push({
                'Position': ++j,
                'Function':frame.getFunctionName(),
                'File':fName,
                'Line':frame.getLineNumber(),
                'Col':frame.getColumnNumber(),
                'Method':frame.getMethodName(),
                'EvalOrigin':frame.getEvalOrigin(),
                'isToplevel':frame.isToplevel(),
                'isEval':frame.isEval(),
                'isConstructor':frame.isConstructor(),
                'isNative':frame.isNative(),
                'TypeName':frame.getTypeName(),
            })
        }
    }
    return myStack 
}
function fullStack() { 
    const origST = Error.prepareStackTrace

    Error.prepareStackTrace = prepStack
    const stack = (new Error('')).stack
    Error.prepareStackTrace = origST

    return stack
}

module.exports = {

    /** Create a better console logger
     * @param {string} [stdout=process.stdout] Optional. Filename to use for standard output. If blank or not provided, uses process.stdout.
     * @param {string} [errout=process.stderr] Optional. Filename to use for error output. If blank, uses stdout if that is provided or process.stderr.
     * @returns {console & tiConsole} Clone of console with additions.
     */
    console: function(stdout='', errout='', options={}) {
        // TODO Add log rotation - @see https://github.com/iccicci/rotating-file-stream or https://www.npmjs.com/package/file-stream-rotator
        let output, errOutput
        if (stdout === '') output = process.stdout
        else { output = fs.createWriteStream(stdout) }
        if (errout === '') {
            if (stdout !== '') errOutput = output
            else errOutput = process.stderr
        } else { errOutput = fs.createWriteStream(errout) }

        /** Create extended logger from console
         * @typedef {Object} tiConsole
         * @property {string} [stdout] Location of standard output
         * @property {string} [errout] Location of error output
         * @property {function} [prefix] Function that adds optional text to the beginning of each output
         * @property {function} [verbose] Additional, detailed logging level
         * @property {function} [stack] Structured current stack output (without internal and logger)
         * @property {function} [settings] Current logger settings
         * @property {boolean} [debugging] myLogger.debug will only output if this is true
         * @property {function} [debug] Independently controlled by the .debugging property, clone of log
         * @property {array} [levels] Array of output levels available: ['none','error','warn','info','log','verbose','all']
         * @property {string} [level="log"] One of: none/error/warn/info/log/verbose/all. all=verbose
         */
        /** @type {console & tiConsole} */
        const myLogger = new console.Console(output, errOutput)

        // What levels of logging are available? Keep in the order least to most.
        myLogger.levels = ['none','error','warn','info','log','verbose','all']
        // What types of logging are there? As above plus debug & stack
        let types = ['error','warn','info','log','verbose','debug','stack','settings']

        // Record where output is going
        myLogger.stdout = stdout
        myLogger.errout = errout

        //#region Set the output level for logging
        var level = 'log'
        if (options.hasOwnProperty('level')) {
            if ( myLogger.levels.includes(options.level) ) {
                level = options.level
            } else {
                level = 'log'
            }
        } else {
            level = 'log'
        }
        myLogger.level = level
        // TODO Add support for NODE_DEBUG env var - @see https://www.npmjs.com/package/logdown#wildcards
        //#endregion ----- -----

        /** Function to return a std formatted prefix for error/warn/info/log/verbose & debug outputs
         * @param {string} [type="log"] One of: error/warn/info/log/verbose or debug
         * @returns {string} Fixed-width string with date/time and log level
         */
        myLogger.prefix = function(type='log') {
            if ( !types.includes(type) ) type = 'unknown'
            return `${fmtDT(new Date())} [${type.padEnd(7,' ')}]`
        }
        // TODO add module/function prefixes

        //#region Add a prefix to all console logs!
        // error
        const originalConsoleError = myLogger.error
        myLogger.error = function() {
            // Only output if logging level is 1 (error) or above
            if (myLogger.levels.indexOf(myLogger.level) < 1 ) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('error') )
            originalConsoleError.apply( myLogger, args )
        }

        // warn
        const originalConsoleWarn = myLogger.warn
        myLogger.warn = function() {
            // Only output if logging level is 2 (warn) or above
            if (myLogger.levels.indexOf(myLogger.level) < 2 ) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('warn') )
            originalConsoleWarn.apply( myLogger, args )
        }

        // info
        const originalConsoleInfo = myLogger.info
        myLogger.info = function() {
            // Only output if logging level is 3 (info) or above
            if (myLogger.levels.indexOf(myLogger.level) < 3 ) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('info') )
            originalConsoleInfo.apply( myLogger, args )
        }

        // log
        const originalConsoleLog = myLogger.log
        myLogger.log = function() {
            // Only output if logging level is 4 (log) or above
            if (myLogger.levels.indexOf(myLogger.level) < 4 ) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('log') )
            originalConsoleLog.apply( myLogger, args )
        }

        //verbose - new logging type, clone of log
        myLogger.verbose = function() {
            // Only output if logging level is 5 (verbose) or above
            if (myLogger.levels.indexOf(myLogger.level) < 5 ) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('verbose') )
            originalConsoleLog.apply( myLogger, args )
        }
        
        //debug (currently an alias for console.log in node.js)
        const originalConsoleDebug = myLogger.debug
        /** Clone of 'log' but only outputs if myLogger.debugging = true  */
        myLogger.debug = function() {
            // Only output if logging level is 4 (log) or above
            //if (myLogger.levels.indexOf(myLogger.level) < 4 ) return
            // Only output if debugging flag is true
            if (myLogger.debugging !== true) return

            const args = Array.from(arguments)
            args.unshift( myLogger.prefix('debug') )
            originalConsoleDebug.apply( myLogger, args )
        }

        // Stack
        myLogger.stack = function() {
            // Only output if logging level is above 0 (none)
            if (myLogger.levels.indexOf(myLogger.level) <= 0 ) return

            const args = Array.from(arguments)
            args.unshift( fullStack() )
            args.unshift( 'Current stack: ' )
            args.unshift( myLogger.prefix('stack') )
            originalConsoleLog.apply( myLogger, args )
        }

        // Settings - output the current logger settings
        myLogger.settings = function() {
            // Only output if logging level is above 0 (none)
            if (myLogger.levels.indexOf(myLogger.level) <= 0 ) return

            const args = Array.from(arguments)
            args.unshift( {'Level': myLogger.level, 'Debugging': myLogger.debugging} )
            args.unshift( myLogger.prefix('settings') )
            originalConsoleLog.apply( myLogger, args )
        }
        //#endregion ----- -----

        return myLogger
    }
}