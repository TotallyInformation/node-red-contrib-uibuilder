/** Custom browser logging function
 * Author: Julian Knight (Totally Information), March 2023
 * License: Apache 2.0
 * Copyright: Julian Knight (Totally Information), March 2023, all rights reserved
 */

const Logger = class Logger {
    /** Default log level - Error & Warn */
    logLevel = 0
    /** Running with uibuilder client? */
    uibuilder = false

    LOG_STYLES = {
        // 0
        error: {
            css: 'background: red; color: black;',
            txtCss: 'color: red; ',
            pre: '⛔ ',
            console: 'error',  // or trace
        },
        // 1
        warn: {
            css: 'background: darkorange; color: black;',
            txtCss: 'color: darkorange; ',
            pre: '⚠ ',
            console: 'warn',
        },
        // 2
        info: {
            css: 'background: aqua; color: black;',
            txtCss: 'color: aqua;',
            pre: '❗ ',
            console: 'info',
        },
        // 3
        log: {
            css: 'background: grey; color: yellow;',
            txtCss: 'color: grey;',
            pre: '',
            console: 'log',
        },
        // 4
        debug: {
            css: 'background: chartreuse; color: black;',
            txtCss: 'color: chartreuse;',
            pre: '',
            console: 'debug',
        },
        // 5
        trace: {
            css: 'background: indigo; color: yellow;',
            txtCss: 'color: hotpink;',
            pre: '',
            console: 'log',
        },

        names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
        reset: 'color: inherit;',
        head: 'font-weight:bold; font-style:italic;',
        level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
    }

    /** Custom logging. e.g. log(2, 'here:there', 'jiminy', {fred:'jim'})()
     * @param {*} config Optional configuration object (currently unused)
     */
    constructor(...config) {
        this.config = config
        if (window['uibuilder']) this.uibuilder = true
    }

    /** Output a log msg to the browser dev console if the output level >= log level
     * NOTE: The old Function.prototype.bind.call method always returned the location
     *    of the actual call to log BUT required that the log call had and extra func
     *    call. e.g. log(...)().
     *    The new version does not require that but as a compromise, uses `new Error().stack
     *    to display the call location. This might not work in all browsers.
     * @param {*} level Log level (0-5, error-trace)
     * @param {*} head Text to be used at start of log output wrapped in [...]
     * @param  {...any} args any other arguments. Passed on to the underlying console.... function
     */
    log(level, head, ...args) {
        // 1st arg is the log level/type
        let strLevel
        switch (level) {
            case 'trace':
            case 5: {
                level = 5 // make sure level is numeric
                strLevel = 'trace'
                break
            }

            case 'debug':
            case 4: {
                level = 4
                strLevel = 'debug'
                break
            }

            case 'log':
            case 3: {
                level = 3
                strLevel = 'log'
                break
            }

            case 'info':
            case '':
            case 2: {
                level = 2
                strLevel = 'info'
                break
            }

            case 'warn':
            case 1: {
                level = 1
                strLevel = 'warn'
                break
            }

            case 'error':
            case 'err':
            case 0: {
                level = 0
                strLevel = 'error'
                break
            }

            default: {
                level = -1
                break
            }

        }

        // If set to something unknown, no log output
        if (level > this.logLevel || level === -1) return

        let stack = ['no stack']
        try {
            // @ts-ignore
            stack = (new Error().stack).split('\n')
            stack.shift(); stack.shift()
        } catch (e) { }
        const logMethod = console[this.LOG_STYLES[strLevel].console]
        logMethod(`%c${this.LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`, `${this.LOG_STYLES.level} ${this.LOG_STYLES[strLevel].css}`, `${this.LOG_STYLES.head} ${this.LOG_STYLES[strLevel].txtCss}`, ...args, `(${stack.join('/n').trim()})`)

        // if (level > this.logLevel || level === -1) return function () { }
        // return Function.prototype.bind.call(
        //     console[this.LOG_STYLES[strLevel].console],
        //     console,
        //     `%c${this.LOG_STYLES[strLevel].pre}${strLevel}%c [${head}]`, `${this.LOG_STYLES.level} ${this.LOG_STYLES[strLevel].css}`, `${this.LOG_STYLES.head} ${this.LOG_STYLES[strLevel].txtCss}`,
        //     ...args, new Error().stack
        // )()
    }

    // TODO Log to node-red
    //      Use either std or control msgs? Maybe even option to use API?
    //      Option to use node-red log?

}

const logger = new Logger()

// TODO If uibuilder, allow logs to be returned to node-red (dynamic option)
const log = logger.log.bind(logger) // eslint-disable-line no-unused-vars

// log(0, 'XXX', 'hello', window)
