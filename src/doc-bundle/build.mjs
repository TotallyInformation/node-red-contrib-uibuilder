/**
 * Build bundles using ESBUILD for Docsify and plugins to allow offline use.
 */

import { build } from 'esbuild' // eslint-disable-line n/no-unpublished-import
import { resolve } from 'path'

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
    .catch((error) => {
        console.error(error)
        process.exit(1) // eslint-disable-line n/no-process-exit
    })

console.log('App target: ', resolve('../../docs/.config/app.js'))
console.log('ESBUILD Bundle input: ', resolve('src/doc-bundle/bundle-input.mjs'))
