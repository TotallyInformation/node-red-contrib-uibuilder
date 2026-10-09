/** Build script for uib-degit
 * Bundles marked and front-matter into both CJS and ESM formats
 */

import * as esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commonOptions = {
    entryPoints: [join(__dirname, 'src/index.mjs')],
    bundle: true,
    platform: 'node',
    target: 'node22',
    minify: false, // Keep readable for debugging
    sourcemap: false,
    loader: {
        '.mjs': 'js',
    },
}

// Build CommonJS version
// @ts-ignore
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.cjs'),
    format: 'cjs',
    banner: {
        js: '/** @file Bundled DEGIT for uibuilder (CJS) */',
    },
    // Required to inject import.meta.url to the output
    inject: ['./import-meta-url.mjs'],
    define: {
        'import.meta.url': 'import_meta_url',
    },
    // Required to allow require('module') to work as expected instead of having to use require('module').default
    footer: {
        js: 'module.exports = module.exports.default',
    },
})

// Build ESM version
// @ts-ignore
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.mjs'),
    format: 'esm',
    banner: {
        js: '/** @file Bundled DEGIT for uibuilder (ESM) */',
    },
})

console.log('✓ uib-md-utils bundled successfully (CJS + ESM)')
