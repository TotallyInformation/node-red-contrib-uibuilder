/**
 * Build bundles using ESBUILD for Docsify and plugins to allow offline use.
 */

import { build } from 'esbuild' // eslint-disable-line n/no-unpublished-import
import { join, resolve } from 'path'
import { readdir, readFile, writeFile } from 'fs/promises'

console.log('-------------------------------')

// get the current execution folder
const curDir = resolve('.')
console.log('Current folder is', curDir)
const jsOutpath = join(curDir, 'docs', '.config', 'app.js')
console.log('JS output file will be', jsOutpath)
const cssOutPath = join(curDir, 'docs', '.config')
console.log('CSS output folder will be', cssOutPath)

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
            const newArray = `const tipsFiles = [
                ${mdFiles.map(file => `'${file}'`).join(',\n                ')}
            ]`
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

// add an async iife and await the build calls if you need to sequence them
(async () => {

    console.log('-------------------------------')

    /** Build a single output app.js from docsify & all needed plugins */
    try {
        console.log('Starting ESBUILD for app.js ...', jsOutpath)
        await build({
            entryPoints: [
                'src/doc-bundle/bundle-input.mjs'
            ],
            format: 'iife',
            bundle: true,
            minify: true,
            sourcemap: true,
            logLevel: 'info',
            outfile: jsOutpath,
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
        console.log('... JS bundle completed')
    } catch (error) {
        console.error('... Error building JS bundle:', error)
        process.exit(1) // eslint-disable-line n/no-process-exit
    }

    console.log('-------------------------------')

    /** Use separate outputs for CSS because we need to be able to
     *  specify alternate stylesheets for light/dark.
     *  Doesn't work if we bundle into a single app.css output.
     */
    try {
        console.log('Starting ESBUILD for app.css ...', cssOutPath)
        await build({
            entryPoints: [
                'docsify-darklight-theme/dist/docsify-themeable/style.min.css',
                'docsify-themeable/dist/css/theme-simple.css',
                'docsify-themeable/dist/css/theme-simple-dark.css',
            ],
            bundle: true,
            minify: true,
            logLevel: 'info',
            // outfile: resolve('../../docs/.config/app.css',),
            outdir: cssOutPath,
        })
        console.log('... CSS bundle completed')
    } catch (error) {
        console.error('... CSS bundle failed', error)
        process.exit(1) // eslint-disable-line n/no-process-exit
    }

    console.log('-------------------------------')

    // Update tips files in docs/.config/index.js
    await updateTipsFiles()

    console.log('-------------------------------')
})()
