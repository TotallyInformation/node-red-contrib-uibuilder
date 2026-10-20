/* eslint-disable security/detect-non-literal-fs-filename */
/** Custom logging module for UIBUILDER
 *
 * NOTES:
 * - log.error(new Error()) will include a stack trace from the calling location rather than this class
 * - log.trace() will also output the trace from the calling location
 * - When viewing node.js logs in a browser dev console, ONLY THE FIRST OUTPUT can be coloured.
 *
 * @example
 * const {log} = require('./libs/logger.mjs')
 * import {log} from './libs/logger.mjs'
 *
 * @example 1. Standard log levels
 * log.info('Application started successfully')
 * log.error(new Error('Something went wrong'))
 *
 * @example 2. Pass through additional console methods transparently (e.g., timers)
 * log.time('database-query')
 * ... simulated work ...
 * log.timeEnd('database-query')
 *
 * log.table([
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' }
 * ])
 *
 * @example 3. Global settings apply to core methods
 * log.setEnabled(false)
 * log.info('This will be ignored')
 * log.time('ignored-timer') // Also ignored when disabled
 */

/** Copyright (c) 2026-2026 Julian Knight (Totally Information)
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

/** --- Type Defs ---
 * @typedef {import('../../typedefs.js').uibCustomLogger} uibCustomLogger custom logger
 */

// TODO add options to turn on/off file-name/class-name/fn-name/line-location
// TODO add local override - allowing a specific module, class or fn/method to be set to a different level or turned off

import fs from 'node:fs'
import { format, styleText } from 'node:util' // eslint-disable-line n/no-unsupported-features/node-builtins

const cons = console

/** @type {uibCustomLogger} */
class Logger {
    #stream
    enabled = false
    filePath = null
    levelMap = {}
    showLocation = true
    supportsColor = process.stdout.hasColors()
    #defaultLogLevel = 4
    #logLevel = 4
    levelOrder = {
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
        log: 4,
    }
    icon = '🌐'
    icons = {
        log: '  ',
        info: 'ℹ️',
        warn: '⚠️',
        error: '🛑',
        debug: '🪲',
        trace: '🔍',
    }
    colors = {
        log: 'white',
        info: 'cyan',
        warn: 'yellow',
        error: 'red',
        debug: 'green',
        trace: 'magenta',
    }

    constructor(opts) {
        if (opts !== undefined) this.options = opts

        this.#stream = this.filePath ? fs.createWriteStream(this.filePath, { flags: 'a', }) : null

        // Default is output off. But setting TI_ENV to debug before starting Node-RED turns it on
        if (process.env.TI_ENV === 'debug') this.enabled = true
        // TI_LOGGER to a valid level string to turn on output up to the desired level
        if (process.env.TI_LOGGER) {
            const pel = process.env.TI_LOGGER.toLowerCase()
            if (this.levelOrder[pel]) {
                this.enabled = true
                this.level = pel
            }
        }

        const coreMethods = ['log', 'info', 'warn', 'error', 'debug', 'trace']
        const consoleMethods = Object.getOwnPropertyNames(console).filter(
            name => typeof console[name] === 'function'
        )

        consoleMethods.forEach((method) => {
            this[method] = (...args) => {
                if (!this.enabled) return

                if (coreMethods.includes(method)) {
                    const methodWeight = this.levelOrder[method] || this.#defaultLogLevel
                    if (methodWeight > this.#logLevel) return

                    const actualMethod = this.levelMap[method] || method
                    const timestamp = (new Date().toISOString())
                        .replace('T', ' ')
                        .slice(0, 23)
                    let out = [...args]

                    const chkStack = new Error()
                    chkStack.name = ''
                    Error.captureStackTrace(chkStack, this[method])

                    // Collect *all* uibuilder frames, nearest caller first
                    const stackLines = chkStack.stack.split('\n') // .slice(1) // only keeps current & immediate parent
                    const uibRegEx = /\s*at\s(.*)\(.*node-red-contrib-uibuilder[\\/]nodes[\\/](.+)\)$/

                    const uibFrames = stackLines.map((line) => {
                        const m = line.match(uibRegEx)
                        if (!m) return null
                        const parts = m[2]
                            .replace(/\\/g, '/')
                            .replace(/\.(c|m)?js/, '')
                            .split(':')
                        const caller = m[1].trim() === 'Object.<anonymous>' ? '' : m[1].trim()
                        return {
                            caller: caller,
                            file: parts[0], // e.g. 'modules/myModule'
                            // line: parts[1],
                            // col: parts[2],
                            // chainIncr: caller ? 2 : 1,
                        }
                    }).filter(Boolean)
                    const chainParts = []
                    let lastFile = null
                    for (const f of uibFrames) {
                        const base = f.file.replace(/.*\//, '')
                        // Caller always shown (method names are the "positions" in the chain)
                        if (f.caller) chainParts.push(f.caller)
                        // File only when it differs from the previously shown one
                        if (base !== lastFile) {
                            chainParts.push(base)
                            lastFile = base
                        }
                    }
                    const depth = chainParts.length
                    const chainStr = ` [d${depth}: ${chainParts.join(' ← ')}]`
                    cons.log({chainStr})

                    const stackLine = chkStack.stack.split('\n', 2)[1] || ''
                    let caller = ''
                    let _file = ['', '', '']
                    // Matches: optional class/method name, followed by path containing node-red-contrib-uibuilder/nodes/
                    const _line = stackLine.match(/\s*at\s(.*)\(.*node-red-contrib-uibuilder[\\/]nodes[\\/](.+)\)$/)
                    if (_line) {
                        // e.g. "classname.methodname", "functionname" or empty if top-level
                        if (_line[1]) caller = `:${_line[1].trim()}`
                        else caller = ''
                        if (caller === ':Object.<anonymous>') caller = ''
                        // strips/splits extension, line, and column numbers
                        if (_line[2]) {
                            _file = _line[2]
                                .replace(/\\/g, '/')
                                .replace(/\.(c|m)?js/, '')
                                .split(':')
                        }
                    }

                    // if (this.showLocation) {

                    // }

                    if (method === 'trace') {
                        out = [chkStack.stack]
                    }

                    // if (typeof out[0] !== 'string') out.unshift('') // we always want a string here
                    // out[0] = `${timestamp}${this.icon}[${actualMethod.toUpperCase().padEnd(5)} ${this.icons[actualMethod]}] ${_file[0]}${caller}: ${out[0]} (${_file[1]}:${_file[2]})`
                    out.unshift(`${timestamp}${this.icon}[${actualMethod.toUpperCase().padEnd(5)} ${this.icons[actualMethod]}] ${_file[0]}${caller}(${_file[1]}:${_file[2]}):`)
                    // out.push(`(${_file[1]}:${_file[2]})`)

                    if (this.#stream) {
                        const message = format(...out)
                        this.#stream.write(`${message}\n`)
                    } else {
                        if (this.supportsColor) {
                            out[0] = styleText(this.colors[actualMethod], out[0])
                            // out[out.length - 1] = styleText(this.colors[actualMethod], out[out.length - 1])
                        }

                        if (console[actualMethod]) {
                            if (actualMethod === 'trace') console.error(...out)
                            else if (actualMethod === 'warn') console.info(...out)
                            else console[actualMethod](...out)
                        } else {
                            console.log(...out)
                        }
                    }
                } else {
                    // Passthrough method to console
                    console[method](...args)
                }
            }
        })
    }

    #resolveLevel(level) {
        if (typeof level === 'number') return level
        if (typeof level === 'string' && this.levelOrder[level.toLowerCase()] !== undefined) {
            return this.levelOrder[level.toLowerCase()]
        }
        return 4
    }

    set options(opts) {
        this.enabled = opts.enabled ?? this.enabled
        this.filePath = opts.filePath || this.filePath
        this.levelMap = opts.levelMap || this.levelMap
        this.showLocation = opts.showLocation ?? this.showLocation
        this.supportsColor = opts.supportsColor ?? this.supportsColor
        this.#logLevel = this.#resolveLevel(opts.logLevel) || this.#logLevel
    }

    /** Set the log level
     * @param {string|number} setLevel Level string or number: error|warn|info|debug or 1-4
     */
    set level(setLevel) {
        if (setLevel === this.#defaultLogLevel) return
        if (!setLevel) setLevel = this.#defaultLogLevel
        // @ts-ignore
        if (typeof setLevel === 'string' && this.levelOrder[setLevel.toLowerCase()] !== undefined) {
            // @ts-ignore
            setLevel = this.levelOrder[setLevel.toLowerCase()]
        }
        if (typeof setLevel !== 'number') setLevel = this.#defaultLogLevel
        this.#logLevel = setLevel
    }
    get level() {
        return this.#logLevel
    }
}

// @ts-ignore
const loggerInstance = /** @type {uibCustomLogger} */ (new Logger())

// module.exports = new Logger()
/** @type {uibCustomLogger} */
export { loggerInstance as default }
export { loggerInstance as log }
