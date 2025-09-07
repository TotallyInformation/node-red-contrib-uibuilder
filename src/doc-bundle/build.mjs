/**
 * Build bundles using ESBUILD for Docsify and plugins to allow offline use.
 */

import { build } from 'esbuild' // eslint-disable-line n/no-unpublished-import
import { resolve } from 'path'
import { readdir, readFile, writeFile } from 'fs/promises'

/** Update tipsFiles array in docs/.config/index.js with discovered tip files from docs/tips/*.md */
async function updateTipsFiles() {
    try {
        const tipsDir = resolve('./docs/tips')
        const files = await readdir(tipsDir)
        const mdFiles = files.filter(file => file.endsWith('.md'))

        const indexJsPath = resolve('./docs/.config/index.js')
        let content = await readFile(indexJsPath, 'utf8')

        // Find and replace the tipsFiles array
        const arrayMatch = content.match(/(const tipsFiles = \[)(.*?)(\])/s)
        if (arrayMatch) {
            const newArray = `const tipsFiles = [\n        ${mdFiles.map(file => `'${file}'`).join(',\n        ')}\n    ]`
            content = content.replace(arrayMatch[0], newArray)
            await writeFile(indexJsPath, content, 'utf8')
            console.log(`ℹ  Updated tipsFiles array with ${mdFiles.length} files`)
        } else {
            console.warn('⚠  Could not find tipsFiles array in "docs/.config/index.js"')
        }
    } catch (error) {
        console.error('Error updating tipsFiles:', error)
    }
}

/** Build a single output app.js from docsify & all needed plugins */
build({
    entryPoints: [
        'src/doc-bundle/bundle-input.mjs'
    ],
    format: 'iife',
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: resolve('../../docs/.config/app.js'),
    // outdir: resolve('../../docs/.config/',),
    platform: 'browser',
    target: [
        // Start of 2019
        'chrome72',
        'safari12.1',
        'firefox65',
        'opera58',
    ],
})
    .then(() => {
        console.log('JS bundle completed')
        return
    })
    .catch((error) => {
        console.error(error)
        process.exit(1) // eslint-disable-line n/no-process-exit
    })

/** Use separate outputs for CSS because we need to be able to
 *  specify alternate stylesheets for light/dark.
 *  Doesn't work if we bundle into a single app.css output.
 */
build({
    entryPoints: [
        'docsify-darklight-theme/dist/docsify-themeable/style.min.css',
        'docsify-themeable/dist/css/theme-simple.css',
        'docsify-themeable/dist/css/theme-simple-dark.css',
    ],
    bundle: true,
    minify: true,
    // outfile: resolve('../../docs/.config/app.css',),
    outdir: resolve('../../docs/.config/'),
})
    .then(() => {
        console.log('ℹ  CSS bundle completed')
        return
    })
    .catch((error) => {
        console.error(error)
        process.exit(1) // eslint-disable-line n/no-process-exit
    })

// Update tips files in docs/.config/index.js
updateTipsFiles()

console.log('App target: ', resolve('../../docs/.config/app.js'))
console.log('ESBUILD Bundle input: ', resolve('src/doc-bundle/bundle-input.mjs'))
