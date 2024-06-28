/**
 * Build a bundle using ESBUILD for Docsify and plugins to allow offline use
 */

// import esbuild from 'esbuild'
const esbuild = require('esbuild')
const { resolve } = require('path')

esbuild.build({
    entryPoints: [
        'bundle-input.js'
    ],
    format: 'iife',
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: resolve('../../docs/.config/app.js',),
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
        process.exit(1)
    })

esbuild.build({
    entryPoints: [
        'docsify-darklight-theme/dist/docsify-themeable/style.min.css',
        'docsify-themeable/dist/css/theme-simple.css',
        'docsify-themeable/dist/css/theme-simple-dark.css',
    ],
    bundle: true,
    minify: true,
    // outfile: resolve('../../docs/.config/app.css',),
    outdir: resolve('../../docs/.config/',),
})
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
