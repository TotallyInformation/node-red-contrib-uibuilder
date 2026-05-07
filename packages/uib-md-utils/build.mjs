/** Build script for uib-md-utils
 * Bundles markdown utilities into CJS + ESM (Node.js) formats, and additionally
 * bundles the mermaid package into browser-ready IIFE and ESM bundles which are
 * written to the parent uibuilder package's front-end/utils/ folder.
 */

import * as esbuild from 'esbuild' // eslint-disable-line n/no-extraneous-import
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Absolute path to the parent (node-red-contrib-uibuilder) package root */
const ROOT = join(__dirname, '../..')

/** Browser targets for the mermaid browser bundle — same baseline as the main build */
const BROWSER_TARGETS = [
    'chrome73',
    'firefox66',
    'opera60',
    'safari12.1',
    'ios12.2',
    'edge79',
]

const commonOptions = {
    entryPoints: [join(__dirname, 'src/index.mjs')],
    bundle: true,
    // This also excludes built-in Node.js modules like 'fs', 'path', etc. from the bundle
    platform: 'node',
    target: 'node18',
    minify: false, // Keep readable for debugging
    sourcemap: false,
    loader: {
        '.mjs': 'js',
    },
    supported: {
        destructuring: true,
    },
}

// Build CommonJS version
// @ts-ignore
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.cjs'),
    format: 'cjs',
    banner: {
        js: '/** @file Bundled Markdown utilities for uibuilder (CJS) - includes marked and front-matter */',
    },
})

// Build ESM version
// @ts-ignore
await esbuild.build({
    ...commonOptions,
    outfile: join(__dirname, 'index.mjs'),
    format: 'esm',
    banner: {
        js: '/** @file Bundled Markdown utilities for uibuilder (ESM) - includes marked and front-matter */',
    },
})

console.log('✓ uib-md-utils bundled successfully (CJS + ESM)')

// ─── Mermaid browser bundles ─────────────────────────────────────────────────
// Build mermaid as a self-contained browser bundle (IIFE and ESM) so it can be
// served locally without any CDN dependency.  The output is written directly to
// the parent package's front-end/utils/ folder for use by markweb.mjs.
//
// Entry point is a virtual stdin snippet that re-exports the mermaid default so
// the IIFE global name and ESM default export both resolve to the mermaid API object.

const mermaidOut = join(ROOT, 'front-end/utils/mermaid')

/** @type {import('esbuild').StdinOptions} */
const mermaidStdin = {
    contents: "export { default } from 'mermaid'",
    resolveDir: join(__dirname, 'src'),
    loader: 'js',
}

/** Shared esbuild options for both mermaid browser builds */
const mermaidCommon = {
    stdin: mermaidStdin,
    bundle: true,
    platform: 'browser',
    target: BROWSER_TARGETS,
    minify: true,
    sourcemap: false,
    supported: { destructuring: true, },
}

// IIFE build — for use via <script src="mermaid.iife.min.js">
// window.mermaid is unwrapped from the namespace object via the footer so callers
// can use `mermaid.initialize(...)` directly rather than `mermaid.default.initialize(...)`.
// @ts-ignore
await esbuild.build({
    ...mermaidCommon,
    outfile: `${mermaidOut}.iife.min.js`,
    format: 'iife',
    globalName: 'mermaid',
    // Unwrap the ESM default export so `window.mermaid` is the mermaid API object directly
    footer: { js: 'mermaid = (typeof mermaid !== "undefined" && mermaid.default) ? mermaid.default : mermaid;', },
    banner: { js: '/** @file Bundled mermaid for browser use (IIFE). Served locally — no CDN required. */', },
})

// ESM build — for use via `import mermaid from './mermaid.esm.min.js'`
// @ts-ignore
await esbuild.build({
    ...mermaidCommon,
    outfile: `${mermaidOut}.esm.min.js`,
    format: 'esm',
    banner: { js: '/** @file Bundled mermaid for browser use (ESM). Served locally — no CDN required. */', },
})

console.log('✓ mermaid browser bundles built (IIFE + ESM → front-end/utils/)')
