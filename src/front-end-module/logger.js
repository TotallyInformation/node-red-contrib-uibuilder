/* eslint-disable jsdoc/no-defaults */
// @ts-nocheck
/**
 * @module logger
 * @description A simple logger for the front-end module.
 *   Enhances standard console logging with additional features.
 *   Ensures that the original calling context is preserved so that the correct calling line number is shown.
 *   Exposes a global `log` object for ease of use. In addition to exporting the logger object.
 *
 * @example
 *   log.error('This is an error message', { some: 'data' })
 *
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

const nativeConsole = { ...window.console } // Clone the original console

/** Recursively builds an object with all properties of an object, including getters and setters
 * @param {object} obj - The object to log
 * @param {string} [prefix=''] - The prefix for nested properties
 * @returns {object} - The nested object with all properties
 */
const buildDeepPropertiesObject = (obj, prefix = '') => {
    const result = {}
    const descriptors = Object.getOwnPropertyDescriptors(obj)
    for (const key in descriptors) {
        if (Object.prototype.hasOwnProperty.call(descriptors, key)) {
            const descriptor = descriptors[key]
            const newPrefix = prefix ? `${prefix}.${key}` : key
            if (descriptor.get || descriptor.set) {
                result[newPrefix] = {
                    get: !!descriptor.get,
                    set: !!descriptor.set
                }
            } else if (typeof descriptor.value === 'object' && descriptor.value !== null) {
                result[newPrefix] = buildDeepPropertiesObject(descriptor.value, newPrefix)
            } else {
                result[newPrefix] = descriptor.value
            }
        }
    }
    return result
}

// Create the new logger object - so that logger can be called without a property function - i.e. log(...) - easy shorthand
// const logger = {}
const logger = nativeConsole['log'].bind(
    nativeConsole,
    '%c[Custom]%c', 'color: green; font-weight: bold;', ''
)

// Set the logging level
logger.level = 'info'

// Set the logging styles
logger.styles = {
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
    // General data and default styles
    '_': {
        names: ['error', 'warn', 'info', 'log', 'debug', 'trace'],
        reset: 'color: inherit;',
        head: 'font-weight:bold; font-style:italic;',
        level: 'font-weight:bold; border-radius: 3px; padding: 2px 5px; display:inline-block;',
    },
}

// Attach enhanced console methods to the logger object
Object.keys(nativeConsole).forEach(method => {
    if (typeof nativeConsole[method] === 'function') {
        // By using bind, we ensure that the original calling context is preserved because the stack is preserved.
        if (method in logger.styles) { // Not all console methods are stylable
            logger[method] = nativeConsole[method].bind(
                nativeConsole,
                // `%c${logger.styles[method].pre}${method}%c [%s]`, // %s is the 1st actual arg
                `%c${logger.styles[method].pre}${method}%c`,
                `${logger.styles._.level} ${logger.styles[method].css}`, // 1st %c format
                `${logger.styles._.head} ${logger.styles[method].txtCss}`, // 2nd %c format
            )
        } else {
            logger[method] = nativeConsole[method].bind(
                nativeConsole
            )
        }
    }
})

console.log('LOGGER', buildDeepPropertiesObject(logger))

export default { logger }

if (!window.log) {
    window.log = logger
}




// // Attach the log level to the callable function - using a getter and setter
// Object.defineProperty(this.callable, 'level', {
//     get: () => this.level,
//     set: (newLevel) => {
//         if (LOG_STYLES._.names.includes(newLevel)) {
//             this.level = newLevel
//         } else {
//             this.callable.error(`Invalid logging level: ${newLevel}`)
//         }
//     }
// })

// this.callable.valueOf = this.callable.toString = () => `Logger v${this.callable.version} - Level: ${this.callable.level}`

// Add the ability to this.callable to return some help text to the console - ideally it would not need to be called as a function
// this.callable.help = () => {
//     const helpText = [
//         `\tLogger v${this.version} - Level: ${this.callable.level}`,
//         `\tAvailable logging levels: ${LOG_STYLES._.names.join(', ')}`,
//         '\tAdditionally, all console methods are available.',
//         '\tTo change the logging level, use: logger.setLevel(\'level\')',
//     ]
//     this.callable.info('UIBUILDER Custom Logger help', helpText.join('\n'))
// }



