// processCSS.mjs
/** Processes a CSS file to extract CSS custom properties (variables).
 *
 * Usage:
 *   node tests/processCSS.mjs <path-to-css-file>
 *
 * @module processCSS
 * @author Copilot
 * @async
 * @param {string} filePath - Path to the CSS file to process
 * @returns {Promise<void>} Prints a JS object with a 'variables' property to stdout
 * @throws {Error} If the file cannot be read
 */
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * Extracts CSS custom properties (variables) from a CSS file.
 * @param {string} cssText - The CSS file contents
 * @returns {Array<Array<string>>} Array of [variable, value] pairs
 * @example
 * // returns [['--brand-hue', '200'], ...]
 * extractCSSVariables(':root { --brand-hue: 200; }')
 */
const extractCSSVariables = (cssText) => {
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g
    const variables = []
    let match
    while ((match = varRegex.exec(cssText)) !== null) {
        variables.push([`--${match[1]}`, match[2].trim()])
    }
    return variables
}

/** Main entry point. */
const main = async () => {
    const filePath = process.argv[2]
    if (!filePath) {
        throw new Error('Usage: node tests/processCSS.mjs <path-to-css-file>')
    }
    let cssText
    try {
        cssText = await readFile(filePath, 'utf8')
    } catch (err) {
        throw new Error(`Error reading file: ${err.message}`)
    }
    const variables = extractCSSVariables(cssText)
    const result = { variables, }
    console.log('const cssAnalysis = ' + JSON.stringify(result, null, 4))
}


// Node.js ESM entrypoint check (compatible with most Node.js versions)
if (process.argv[1] && process.argv[1].endsWith('processCSS.mjs')) {
    main()
}

export { extractCSSVariables }
