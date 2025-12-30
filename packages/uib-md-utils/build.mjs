/** Build script for uib-md-utils
 * Bundles marked and front-matter into both CJS and ESM formats
 */

import esbuild from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commonOptions = {
    entryPoints: [join(__dirname, 'src/index.mjs')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    minify: false, // Keep readable for debugging
    sourcemap: false,
    loader: {
        '.mjs': 'js',
    },
}

// Build CommonJS version
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.cjs'),
    format: 'cjs',
    banner: {
        js: '/** @file Bundled Markdown utilities for uibuilder (CJS) - includes marked and front-matter */',
    },
})

// Build ESM version
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.mjs'),
    format: 'esm',
    banner: {
        js: '/** @file Bundled Markdown utilities for uibuilder (ESM) - includes marked and front-matter */',
    },
})

console.log('✓ uib-md-utils bundled successfully (CJS + ESM)')
