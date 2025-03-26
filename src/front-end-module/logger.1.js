/**
 * @module logger
 * @description A simple logger for the front-end module.
 *   Enhances standard console logging with additional features.
 *   Ensures that the original calling context is preserved so that the correct calling line number is shown.
 * @version 1.0.0
 * @license Apache-2.0
 * @author Julian Knight (Totally Information)
 * @copyright (c) 2025-2025 Julian Knight (Totally Information)
 */

// TODO:
// - Add a `level` property to set the logging level.
// - Add a `styles` property to set the logging styles.
// - Add a `version` property to show the version.
// - Swap uibuilder and ui modules to use this logger.

class Logger {
    version = '2025-02-06'

    // Retain a copy of the original native console object
    static nativeConsole = { ...window.console }

    // Set the default logging level
    level = 'info'

    LOG_STYLES = {
        // 0
        error: {
            level: 0,
            css: 'background: red; color: black;',
            txtCss: 'color: red; ',
            pre: '⛔ ',
            console: 'error',  // or trace
        },
        // 1
        warn: {
            level: 1,
            css: 'background: darkorange; color: black;',
            txtCss: 'color: darkorange; ',
            pre: '⚠ ',
            console: 'warn',
        },
        // 2
        info: {
            level: 2,
            css: 'background: aqua; color: black;',
            txtCss: 'color: aqua;',
            pre: '❗ ',
            console: 'info',
        },
        // 3
        log: {
            level: 3,
            css: 'background: grey; color: yellow;',
            txtCss: 'color: grey;',
            pre: '',
            console: 'log',
        },
        // 4
        debug: {
            level: 4,
            css: 'background: chartreuse; color: black;',
            txtCss: 'color: chartreuse;',
            pre: '',
            console: 'debug',
        },
        // 5
        trace: {
            level: 5,
            css: 'background: indigo; color: yellow;',
            txtCss: 'color: hotpink;',
            pre: '',
            console: 'trace',
        },
    
        '_': {
            names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
            reset: 'color: inherit;',
            head: 'font-weight:bold; font-style:italic;',
            level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
        },
    }

    constructor(parameters) {
        // Attach the log styles to the callable function
        this.callable.styles = this.LOG_STYLES
        const LOG_STYLES = this.callable.styles

        // Attach the log level to the callable function - using a getter and setter
        Object.defineProperty(this.callable, 'level', {
            get: () => this.level,
            set: (newLevel) => {
                if (LOG_STYLES._.names.includes(newLevel)) {
                    this.level = newLevel
                } else {
                    this.callable.error(`Invalid logging level: ${newLevel}`)
                }
            }
        })

        this.callable.valueOf = this.callable.toString = () => `Logger v${this.callable.version} - Level: ${this.callable.level}`

        // Add the ability to this.callable to return some help text to the console - ideally it would not need to be called as a function
        this.callable.help = () => {
            const helpText = [
                `\tLogger v${this.version} - Level: ${this.callable.level}`,
                `\tAvailable logging levels: ${LOG_STYLES._.names.join(', ')}`,
                '\tAdditionally, all console methods are available.',
                '\tTo change the logging level, use: logger.setLevel(\'level\')',
            ]
            this.callable.info('UIBUILDER Custom Logger help', helpText.join('\n'))
        }

        // Attach enhanced console methods to the callable function
        Object.keys(Logger.nativeConsole).forEach(method => {
            if (typeof Logger.nativeConsole[method] === 'function') {
                // By using bind, we ensure that the original calling context is preserved because the stack is preserved.
                if (method in this.LOG_STYLES) { // Not all console methods are stylable
                    this.callable[method] = Logger.nativeConsole[method].bind(
                        Logger.nativeConsole,
                        `%c${LOG_STYLES[method].pre}${method}%c [%s]\n`, // %s is the 1st actual arg
                        `${LOG_STYLES._.level} ${LOG_STYLES[method].css}`, // 1st %c format
                        `${LOG_STYLES._.head} ${LOG_STYLES[method].txtCss}`, // 2nd %c format
                    )
                } else {
                    this.callable[method] = Logger.nativeConsole[method].bind(
                        Logger.nativeConsole
                    )
                }
            }
        })

        // Return the callable function
        return this.callable

        // NOTE: That this prevents access to class properties/methods when in use.
        //  So if other properties/methods are needed, they will need to be attached to the returned function.
    }

    /** Define a callable function that defaults to console.log
     * This will be the main function that is returned by the class when creating an instance.
     * The other console methods will be attached as additional properties to the class instance.
     */
    callable = Logger.nativeConsole['log'].bind(
        Logger.nativeConsole,
        '%c[Custom]%c', 'color: green; font-weight: bold;', ''
    )
}

const log2 = new Logger()

module.exports = { Logger, log2 }


;(function () {
    const originalConsole = { ...console } // Clone the original console

    const logger = function (first, ...rest) {
        const wrappedFirstArg = `%c[PRE]%c ${first} %c[POST]%c`
        const styles = [
            'color: lightblue; font-weight: bold;', '', // [PRE] styles
            'color: red; font-weight: bold;', '',  // [POST] styles
        ]
        originalConsole.log.call(originalConsole, wrappedFirstArg, ...styles, ...rest)
    }.bind(originalConsole)

    Object.keys(originalConsole).forEach(method => {
        if (typeof originalConsole[method] === 'function') {
            logger[method] = function (first, ...rest) {
                const wrappedFirstArg = `%c[PRE]%c ${first} %c[POST]%c`;
                const styles = [
                    'color: lightblue; font-weight: bold;', '', // [PRE] styles
                    'color: red; font-weight: bold;', '',  // [POST] styles
                ]
                originalConsole[method].call(originalConsole, wrappedFirstArg, ...styles, ...rest)
                // originalConsole[method] = originalConsole[method](wrappedFirstArg, ...styles, ...rest)
            }.bind(originalConsole)
        }
    });
    // @ts-ignore
    globalThis.logger = logger
    // module.exports = { logger }
})()

// version = '2025-02-06'

//     // Retain a copy of the original native console object
//     static nativeConsole = { ...window.console }

//     // Set the default logging level
//     level = 'info'

//     LOG_STYLES = {
//         // 0
//         error: {
//             level: 0,
//             css: 'background: red; color: black;',
//             txtCss: 'color: red; ',
//             pre: '⛔ ',
//             console: 'error',  // or trace
//         },
//         // 1
//         warn: {
//             level: 1,
//             css: 'background: darkorange; color: black;',
//             txtCss: 'color: darkorange; ',
//             pre: '⚠ ',
//             console: 'warn',
//         },
//         // 2
//         info: {
//             level: 2,
//             css: 'background: aqua; color: black;',
//             txtCss: 'color: aqua;',
//             pre: '❗ ',
//             console: 'info',
//         },
//         // 3
//         log: {
//             level: 3,
//             css: 'background: grey; color: yellow;',
//             txtCss: 'color: grey;',
//             pre: '',
//             console: 'log',
//         },
//         // 4
//         debug: {
//             level: 4,
//             css: 'background: chartreuse; color: black;',
//             txtCss: 'color: chartreuse;',
//             pre: '',
//             console: 'debug',
//         },
//         // 5
//         trace: {
//             level: 5,
//             css: 'background: indigo; color: yellow;',
//             txtCss: 'color: hotpink;',
//             pre: '',
//             console: 'log',
//         },
    
//         names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
//         reset: 'color: inherit;',
//         head: 'font-weight:bold; font-style:italic;',
//         level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
//     }

//     constructor(parameters) {
//         // Attach the log styles to the callable function
//         const LOG_STYLES = this.callable.styles = this.LOG_STYLES

//         // Attach the log level to the callable function
//         this.callable.level = this.level

//         this.callable.valueOf = this.callable.toString = () => `Logger v${this.version} - Level: ${this.level}`

//         // Attach enhanced console methods to the callable function
//         Object.keys(Logger.nativeConsole).forEach(method => {
//             if (typeof Logger.nativeConsole[method] === 'function') {
//                 // By using bind, we ensure that the original calling context is preserved because the stack is preserved.
//                 // this.callable[method] = Logger.nativeConsole[method].bind(
//                 //     Logger.nativeConsole,
//                 //     '%c[Custom]%c', 'color: green; font-weight: bold;',
//                 //     `%c${LOG_STYLES[method].pre}${method}%c [${head}]`,
//                 //     `${LOG_STYLES.level} ${LOG_STYLES[method].css}`,
//                 //     `${LOG_STYLES.head} ${LOG_STYLES[method].txtCss}`,
//                 //     ''
//                 // )
//                 this.callable[method] = function(first, ...rest) {
//                     Logger.nativeConsole[method].call(
//                         Logger.nativeConsole,
//                         '%c[Custom]%c', 'color: green; font-weight: bold;',
//                         `%c${LOG_STYLES[method].pre}${method}%c [${first}]`,
//                         `${LOG_STYLES.level} ${LOG_STYLES[method].css}`,
//                         `${LOG_STYLES.head} ${LOG_STYLES[method].txtCss}`,
//                         '',
//                         ...rest
//                     ).bind(Logger.nativeConsole)
//                 }
//             }
//         })

//         // Return the callable function
//         return this.callable

//         // NOTE: That this prevents access to class properties/methods when in use.
//         //  So if other properties/methods are needed, they will need to be attached to the returned function.
//     }

//     /** Define a callable function that defaults to console.log
//      * This will be the main function that is returned by the class when creating an instance.
//      * The other console methods will be attached as additional properties to the class instance.
//      */
//     callable = Logger.nativeConsole['log'].bind(
//         Logger.nativeConsole,
//         '%c[Custom]%c', 'color: green; font-weight: bold;', ''
//     )


