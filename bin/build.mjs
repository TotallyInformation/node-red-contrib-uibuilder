#!/usr/bin/env node
/* eslint-disable jsdoc/valid-types */
/* eslint-disable @stylistic/arrow-parens */
/* eslint-disable @stylistic/key-spacing */
/* eslint-disable @stylistic/no-multi-spaces */
/** @file bin/build.mjs
 * @description Single ESM build and watch script for node-red-contrib-uibuilder.
 *              Builds all front-end and Node.js libraries using esbuild and LightningCSS.
 *              Replaces the legacy gulpfile.js for all source compilation tasks.
 *
 * @example
 *   node bin/build.mjs              Build everything once
 *   node bin/build.mjs --watch      Build everything then watch for changes
 *   node bin/build.mjs fe           Build front-end modules only
 *   node bin/build.mjs node         Build Node.js packages only
 *   node bin/build.mjs css          Build CSS only
 *   node bin/build.mjs docs         Build docs bundle only
 *   node bin/build.mjs versions     Update all version strings only (no build)
 *   node bin/build.mjs fe css       Build front-end and CSS
 *   node bin/build.mjs fe --watch   Build front-end and watch for changes
 *
 * All configuration is centralised at the top of this file — see the "Central Configuration"
 * region. To add a new library or output format, add an entry to the relevant config array.
 */

import * as esbuild from 'esbuild' // eslint-disable-line n/no-unpublished-import
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { browserslistToTargets, transform } from 'lightningcss' // eslint-disable-line n/no-unpublished-import
import browserslist from 'browserslist' // eslint-disable-line n/no-unpublished-import
import { readFile, writeFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { resolve, dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

// #region ---- Bootstrap ----

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {string} Absolute path to the project root directory */
const ROOT = resolve(__dirname, '..')

/** @type {string} Current package version read from package.json at startup */
const PKG_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version

// #endregion ---- Bootstrap ----

// #region ---- Central Configuration ----
// ─────────────────────────────────────────────────────────────────────────────
// All build configuration is defined here. To add a new output or change paths,
// edit the relevant constant below — no other code changes should be required.
// ─────────────────────────────────────────────────────────────────────────────

// --- Build targets ─────────────────────────────────────────────────────────

/** Explicit esbuild browser targets — early 2019 baseline.
 * Hardcoded rather than derived from browserslist so the JS build target is
 * fully deterministic and immune to browserslist database updates.
 * Minimum versions per caniuse for full ES2018 destructuring support:
 *   chrome 60, firefox 55, opera 47, safari 11.1, ios_saf 11.4, edge 79
 * Targeting early 2019: chrome73, firefox66, opera60, safari12.1, ios12.2, edge79
 * @type {string[]}
 */
const ESBUILD_BROWSER_TARGETS_HARDCODED = [
    'chrome73',
    'firefox66',
    'opera60',
    'safari12.1',
    'ios12.2',
    'edge79',
]

/** @type {string} Browserslist query that controls browser support for both JS and CSS builds */
// const BROWSER_QUERY = '>=0.12%, not ie > 0'
// const BROWSER_QUERY = [
//     '>=0.12%',
//     'not ie > 0',
//     ... ESBUILD_BROWSER_TARGETS_HARDCODED,
// ].join(', ')
const CSS_QUERY = '>=0.12%, not ie > 0, not ios_saf < 12.2, not safari < 12.1, not edge < 79'

/** esbuild Node.js target version.
 * Aligned with the Node-RED v3+ minimum requirement of Node.js 18.
 * Increase to 'node22' when Node-RED v4 becomes the baseline.
 * @type {string}
 */
const NODE_TARGET = 'node18'

// ─── Directory paths ───────────────────────────────────────────────────────

/** @type {string} Source directory for all front-end module source files */
const FE_SRC = 'src/front-end-module'

/** @type {string} Output directory for built front-end files */
const FE_OUT = 'front-end'

/** @type {string} Source directory for built-in web components (bundled into FE module) */
const COMPONENTS_SRC = 'src/components'

// ─── Computed browser targets ─────────────────────────────────────────────

/** Resolved browserslist result; used to derive both esbuild and LightningCSS targets */
// const _browserslistResult = browserslist(BROWSER_QUERY)

/** LightningCSS browser targets derived from the browserslist query.
 * Used by the CSS build to emit forwards-compatible CSS.
 */
const LIGHTNING_TARGETS = browserslistToTargets(browserslist(CSS_QUERY))

/** Convert a browserslist result array to esbuild-compatible target strings.
 * Maps browser identifiers to the esbuild format (e.g. 'chrome 120' → 'chrome120').
 * Browsers not recognised by esbuild (op_mini, kaios, samsung, etc.) are filtered out.
 * @param {string[]} list - Raw browserslist result array
 * @returns {string[]} Deduplicated esbuild target strings
 */
// function browserslistToEsbuildTargets(list) {
//     /** Maps browserslist browser names to esbuild equivalents. null = not supported by esbuild. */
//     const BROWSER_MAP = {
//         and_chr: 'chrome',
//         and_ff:  'firefox',
//         ios_saf: 'safari',
//         android: 'chrome',
//         op_mob:  'opera',
//         op_mini: null,
//         kaios:   null,
//         baidu:   null,
//         bb:      null,
//         and_qq:  null,
//         and_uc:  null,
//         ie:      null,
//         ie_mob:  null,
//         samsung: null,
//     }

//     const seen = new Set()
//     /** @type {string[]} */
//     const result = []

//     for (const entry of list) {
//         const spaceIdx = entry.lastIndexOf(' ')
//         const browser = entry.slice(0, spaceIdx)
//         const ver = entry.slice(spaceIdx + 1)

//         if (ver === 'all') continue

//         const mapped = browser in BROWSER_MAP ? BROWSER_MAP[browser] : browser
//         if (!mapped) continue

//         const target = `${mapped}${ver}`
//         if (!seen.has(target)) {
//             seen.add(target)
//             result.push(target)
//         }
//     }
//     return result
// }

/** esbuild browser targets derived from the browserslist query.
 * Used for all front-end JavaScript builds.
 * @type {string[]}
 */
// const ESBUILD_BROWSER_TARGETS = browserslistToEsbuildTargets(_browserslistResult)
const ESBUILD_BROWSER_TARGETS = ESBUILD_BROWSER_TARGETS_HARDCODED

// ─── Version file configuration ────────────────────────────────────────────

/** Type: VersionFileEntry
 * @typedef {object} VersionFileEntry
 * @property {string}          file  Relative path from project root to the source file
 * @property {RegExp}          regex Regular expression matching the version string in the file
 * @property {'semantic'|'date'} type
 *   'semantic' → version set to the current package.json version (e.g. '7.7.0')
 *   'date'     → version set to source file's last modified date (e.g. '2026-04-21')
 */

/** Source files whose embedded version strings are automatically updated before building.
 *
 * - type 'semantic': replaces the semver number with the current package.json version.
 *   The regex must match the complete version declaration including the '-src' suffix.
 * - type 'date': replaces a YYYY-MM-DD date with the source file's last modified date.
 *   The regex may include one capture group for a leading prefix (used as-is in the replacement).
 *
 * The CSS entry is handled directly inside buildCSS() and is included here for documentation.
 * @type {VersionFileEntry[]}
 */
const VERSION_FILES = [
    { file: `${FE_SRC}/uibuilder.module.mjs`, regex: /version = '[\d.]+-src'/,        type: 'semantic', },
    { file: `${FE_SRC}/ui.mjs`,               regex: /version = '[\d.]+-src'/,        type: 'semantic', },
    { file: `${FE_SRC}/uibrouter.mjs`,        regex: /static version = '[\d.]+-src'/, type: 'semantic', },
    { file: `${FE_OUT}/uib-brand.css`,        regex: /(^ \* @version: )[\d-]+$/m,     type: 'date', },
]

// ─── Front-end module build configurations ────────────────────────────────

/** Type: FEBuildConfig
 * @typedef {object} FEBuildConfig
 * @property {string}   name         Human-readable name used in log output
 * @property {string}   entryPoint   Relative path from root to the source entry point
 * @property {string}   outBase      Base path for output files (format + extension suffixes are appended)
 * @property {RegExp}   versionRegex Regex matching the version string in esbuild output files
 * @property {string}   [nodeOut]    If provided, also builds a Node.js CJS bundle to this path
 * @property {string[]} watchFiles   Glob patterns of source files that trigger a rebuild when changed
 */

/** Front-end module build configurations.
 * Each entry produces four output files:
 *   *.iife.min.js  (IIFE, minified, with source map)
 *   *.iife.js      (IIFE, unminified)
 *   *.esm.min.js   (ESM,  minified, with source map)
 *   *.esm.js       (ESM,  unminified)
 *
 * If `nodeOut` is set, a fifth output — a Node.js CJS bundle — is also produced.
 * @type {FEBuildConfig[]}
 */
const FE_BUILDS = [
    {
        name:         'uibuilder-module',
        entryPoint:   `${FE_SRC}/uibuilder.module.mjs`,
        outBase:      `${FE_OUT}/uibuilder`,
        versionRegex: /version = "([\d.]+-src)"/,
        watchFiles: [
            `${FE_SRC}/uibuilder.module.mjs`,
            `${FE_SRC}/ui.mjs`,
            `${FE_SRC}/reactive.mjs`,
            // `${FE_SRC}/tinyDom.js`,
            // `${FE_SRC}/logger.js`,
            `${FE_SRC}/libs/*.mjs`,
            `${COMPONENTS_SRC}/ti-base-component.mjs`,
            `${COMPONENTS_SRC}/uib-var.mjs`,
            `${COMPONENTS_SRC}/apply-template.mjs`,
            `${COMPONENTS_SRC}/uib-meta.mjs`,
            `${COMPONENTS_SRC}/uib-control.mjs`,
        ],
    },
    {
        name:         'ui',
        entryPoint:   `${FE_SRC}/ui.mjs`,
        outBase:      `${FE_OUT}/ui`,
        versionRegex: /version = "([\d.]+-src)"/,
        nodeOut:      'nodes/libs/ui.cjs',
        watchFiles: [
            `${FE_SRC}/ui.mjs`,
            `${FE_SRC}/libs/show-overlay.mjs`,
        ],
    },
    {
        name:         'uibrouter',
        entryPoint:   `${FE_SRC}/uibrouter.mjs`,
        outBase:      `${FE_OUT}/utils/uibrouter`,
        versionRegex: /version = "([\d.]+-src)"/,
        watchFiles:   [
            `${FE_SRC}/uibrouter.mjs`
        ],
    },
]

/** Type: ExperimentalBuildConfig
 * @typedef {object} ExperimentalBuildConfig
 * @property {string}   name        Human-readable name used in log output
 * @property {string}   entryPoint  Relative path from root to the source entry point
 * @property {string}   outFile     Relative path from root to the single output file
 * @property {string[]} watchFiles  Glob patterns of source files that trigger a rebuild when changed
 */

/** Configuration for the experimental front-end module.
 * Produces a single minified ESM output with a source map.
 * @type {ExperimentalBuildConfig}
 */
const EXPERIMENTAL_BUILD = {
    name:       'experimental',
    entryPoint: `${FE_SRC}/experimental.mjs`,
    outFile:    `${FE_OUT}/experimental.mjs`,
    watchFiles: [`${FE_SRC}/experimental.mjs`],
}

// ─── Node.js package build configurations ─────────────────────────────────

/** Type: NodeBuildConfig
 * @typedef {object} NodeBuildConfig
 * @property {string}   name        Human-readable name used in log output
 * @property {string}   entryPoint  Relative path from root to the source entry point
 * @property {string}   outBase     Base path for outputs (.cjs and .mjs extensions are appended)
 * @property {string[]} watchFiles  Glob patterns of source files that trigger a rebuild when changed
 */

/** Node.js package build configurations.
 * Each entry produces two output files: CJS (.cjs) and ESM (.mjs).
 * Node.js code is intentionally NOT minified to aid debugging and produce readable stack traces.
 * @type {NodeBuildConfig[]}
 */
const NODE_BUILDS = [
    {
        name:       'uib-md-utils',
        entryPoint: 'packages/uib-md-utils/src/index.mjs',
        outBase:    'packages/uib-md-utils/index',
        watchFiles: [
            'packages/uib-md-utils/src/**/*.mjs'
        ],
    },
    {
        name:       'uib-fs-utils',
        entryPoint: 'packages/uib-fs-utils/src/index.mjs',
        outBase:    'packages/uib-fs-utils/index',
        watchFiles: [
            'packages/uib-fs-utils/src/**/*.mjs'
        ],
    },
]

/** CSS build configuration.
 * The source is the unminified brand CSS; the build produces a minified file and source map.
 */
const CSS_BUILD = {
    name:       'uib-brand',
    srcFile:    `${FE_OUT}/uib-brand.css`,
    outFile:    `${FE_OUT}/uib-brand.min.css`,
    mapFile:    `${FE_OUT}/uib-brand.min.css.map`,
    watchFiles: [
        `${FE_OUT}/uib-brand.css`
    ],
}

// #endregion ---- Central Configuration ----

// #region ---- Version Helpers ----

/**
 * Update the version string embedded in a source file according to the VERSION_FILES config.
 *
 * - 'semantic' type: replaces only the semver number portion (before '-src') with PKG_VERSION.
 * - 'date' type:     replaces a YYYY-MM-DD date with the source file's last modified date.
 *   If the regex contains a capture group it is treated as a fixed prefix and is preserved.
 *
 * Errors are non-fatal: a warning is logged and the function returns without throwing.
 * @async
 * @param {VersionFileEntry} entry - Version file configuration entry
 * @returns {Promise<void>}
 */
async function updateVersionInSourceFile(entry) {
    const filePath = join(ROOT, entry.file)
    try {
        const content = await readFile(filePath, 'utf8') // eslint-disable-line security/detect-non-literal-fs-filename
        let updatedContent

        if (entry.type === 'semantic') {
            // Replace only the numeric semver part before '-src', preserving surrounding syntax
            updatedContent = content.replace(entry.regex, (match) =>
                match.replace(/\d+\.\d+\.\d+(?=-src)/, PKG_VERSION)
            )
        } else if (entry.type === 'date') {
            const fileStat = await stat(filePath) // eslint-disable-line security/detect-non-literal-fs-filename
            const fileDate = fileStat.mtime.toISOString().split('T')[0]
            updatedContent = content.replace(entry.regex, (match, prefix) =>
                // Use the capture group as a prefix when present (e.g. CSS @version comment)
                (prefix !== undefined
                    ? `${prefix}${fileDate}`
                    : match.replace(/\d{4}-\d{2}-\d{2}/, fileDate))
            )
        } else {
            console.warn(`[version] Unknown type '${entry.type}' for ${entry.file}`)
            return
        }

        if (updatedContent !== content) {
            await writeFile(filePath, updatedContent, 'utf8') // eslint-disable-line security/detect-non-literal-fs-filename
            console.log(`[version] Updated '${entry.type}' version in ${entry.file}`)
        }
    } catch (err) {
        console.warn(`[version] Could not update ${entry.file}: ${err.message}`)
    }
}

/**
 * Replace the '-src' version suffix in a built output file with a format-specific suffix.
 *
 * For example, 'version = "7.7.0-src"' becomes 'version = "7.7.0-iife.min"' when
 * called with suffix = 'iife.min'.  The regex must contain exactly one capture group
 * matching the full version string including the '-src' suffix.
 *
 * Errors are non-fatal: a warning is logged and the function returns without throwing.
 * @async
 * @param {string} filePath - Absolute path to the output file
 * @param {RegExp} regex    - Regex with one capture group matching the versioned substring
 * @param {string} suffix   - Format suffix to replace '-src' with (e.g. 'iife.min', 'esm', 'node')
 * @returns {Promise<void>}
 */
async function updateVersionInOutputFile(filePath, regex, suffix) {
    try {
        const content = await readFile(filePath, 'utf8') // eslint-disable-line security/detect-non-literal-fs-filename
        const updated = content.replace(regex, (match, ver) =>
            match.replace(ver, ver.replace(/-src$/, `-${suffix}`))
        )
        if (updated !== content) {
            await writeFile(filePath, updated, 'utf8') // eslint-disable-line security/detect-non-literal-fs-filename
        }
    } catch (err) {
        console.warn(`[version] Could not update output version in ${filePath}: ${err.message}`)
    }
}

/**
 * Update all version strings across every entry in VERSION_FILES.
 *
 * Runs both 'semantic' and 'date' update types.  This is equivalent to the
 * pre-build version-stamp step but can be invoked standalone without triggering
 * any esbuild or LightningCSS compilation.
 * @async
 * @returns {Promise<void>}
 */
async function updateAllVersions() {
    await Promise.all(VERSION_FILES.map(e => updateVersionInSourceFile(e)))
    console.log('[versions] All version strings updated.')
}

// #endregion ---- Version Helpers ----

// #region ---- Front-End Builds ----

/** Shared esbuild loader map for front-end builds — treats .mjs and .cjs as plain JS */
const FE_LOADER = { '.mjs': 'js', '.cjs': 'js', }

/** Build a single front-end module in all four standard output formats.
 *
 * Outputs produced (where `outBase` is the configured base path):
 *   {outBase}.iife.min.js   IIFE, minified,   with source map
 *   {outBase}.iife.js       IIFE, unminified, no source map
 *   {outBase}.esm.min.js    ESM,  minified,   with source map
 *   {outBase}.esm.js        ESM,  unminified, no source map
 *
 * If `config.nodeOut` is set, a fifth output (Node.js CJS bundle) is also produced.
 * After each successful build the version suffix in the output file is updated from
 * '-src' to the appropriate format-specific suffix (e.g. '-iife.min').
 * @async
 * @param {FEBuildConfig} config - Front-end build configuration
 * @returns {Promise<void>}
 * @throws {Error} If any individual sub-build fails
 */
async function buildFEModule(config) {
    const entryPoint = join(ROOT, config.entryPoint)
    const outBase = join(ROOT, config.outBase)

    /** @type {import('esbuild').BuildOptions} Shared esbuild options for all four variants */
    const common = {
        entryPoints: [entryPoint],
        bundle:      true,
        platform:    'browser',
        loader:      FE_LOADER,
        target:      ESBUILD_BROWSER_TARGETS,
        supported: {
            destructuring: true,
        },
    }

    /**
     * Build variants: [esbuild format, minify flag, output extension, version suffix].
     * Source maps are generated only for minified builds.
     * @type {Array<['iife'|'esm', boolean, string, string]>}
     */
    const variants = [
        ['iife', true,  'iife.min.js', 'iife.min'],
        ['iife', false, 'iife.js',     'iife'],
        ['esm',  true,  'esm.min.js',  'esm.min'],
        ['esm',  false, 'esm.js',      'esm'],
    ]

    for (const [format, minify, ext, versionSuffix] of variants) {
        const outfile = `${outBase}.${ext}`
        try {
            await esbuild.build({ ...common, outfile, format, minify, sourcemap: minify, })
            if (config.versionRegex) {
                await updateVersionInOutputFile(outfile, config.versionRegex, versionSuffix)
            }
        } catch (err) {
            throw new Error(
                `[${config.name}] ${format.toUpperCase()} ${minify ? '(min)' : '(unmin)'} build failed: ${err.message}`
            )
        }
    }

    // Optionally produce a Node.js CJS build of the same module
    if (config.nodeOut) {
        const nodeOutfile = join(ROOT, config.nodeOut)
        try {
            await esbuild.build({
                entryPoints:      [entryPoint],
                outfile:          nodeOutfile,
                bundle:           true,
                format:           'cjs',
                platform:         'node',
                minify:           false,
                sourcemap:        false,
                loader:           FE_LOADER,
                resolveExtensions: ['.mjs', '.cjs', '.js', '.ts', '.json'],
                mainFields:       ['module', 'main'],
                external:         [],
                target:           NODE_TARGET,
            })
            if (config.versionRegex) {
                await updateVersionInOutputFile(nodeOutfile, config.versionRegex, 'node')
            }
        } catch (err) {
            throw new Error(`[${config.name}] Node.js CJS build failed: ${err.message}`)
        }
    }

    console.log(`[build] ✓ ${config.name}`)
}

/** Build the experimental front-end module as a single minified ESM file with a source map.
 * This module is kept as a separate output because it may contain unstable or preview features.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If the esbuild step fails
 */
async function buildExperimental() {
    const config = EXPERIMENTAL_BUILD
    const outfile = join(ROOT, config.outFile)
    try {
        await esbuild.build({
            entryPoints: [join(ROOT, config.entryPoint)],
            outfile,
            bundle:    true,
            format:    'esm',
            platform:  'browser',
            minify:    true,
            sourcemap: true,
            loader:    FE_LOADER,
            target:    ESBUILD_BROWSER_TARGETS,
            supported: {
                destructuring: true,
            },

        })
    } catch (err) {
        throw new Error(`[${config.name}] ESM (min) build failed: ${err.message}`)
    }
    console.log(`[build] ✓ ${config.name}`)
}

/** Build all configured front-end modules and the experimental module concurrently.
 * Individual failures are caught and reported; other builds continue unaffected.
 * @async
 * @returns {Promise<void>}
 */
async function buildAllFE() {
    const tasks = [
        ...FE_BUILDS.map(cfg => buildFEModule(cfg)),
        buildExperimental(),
    ]
    const results = await Promise.allSettled(tasks)
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error(`[build] ✗ ${result.reason}`)
        }
    }
}

// #endregion ---- Front-End Builds ----

// #region ---- Node.js Package Builds ----

/**
 * Build a Node.js workspace package into both CJS (.cjs) and ESM (.mjs) formats.
 * Code is NOT minified so that error messages and stack traces remain readable.
 * Built-in Node.js modules are excluded automatically via platform:'node'.
 * All package dependencies are bundled into the output for standalone use.
 * @async
 * @param {NodeBuildConfig} config - Node.js package build configuration
 * @returns {Promise<void>}
 * @throws {Error} If either sub-build fails
 */
async function buildNodePackage(config) {
    const entryPoint = join(ROOT, config.entryPoint)

    /** @type {import('esbuild').BuildOptions} Shared options for both CJS and ESM builds */
    const common = {
        entryPoints: [entryPoint],
        bundle:      true,
        platform:    'node',
        target:      NODE_TARGET,
        minify:      false,
        sourcemap:   false,
        loader:      { '.mjs': 'js', },
    }

    try {
        await esbuild.build({
            ...common,
            format:  'cjs',
            outfile: join(ROOT, `${config.outBase}.cjs`),
        })
    } catch (err) {
        throw new Error(`[${config.name}] CJS build failed: ${err.message}`)
    }

    try {
        await esbuild.build({
            ...common,
            format:  'esm',
            outfile: join(ROOT, `${config.outBase}.mjs`),
        })
    } catch (err) {
        throw new Error(`[${config.name}] ESM build failed: ${err.message}`)
    }

    console.log(`[build] ✓ ${config.name} (CJS + ESM)`)
}

/**
 * Build all configured Node.js packages concurrently.
 * Individual failures are caught and reported; other builds continue unaffected.
 * @async
 * @returns {Promise<void>}
 */
async function buildAllNode() {
    const results = await Promise.allSettled(NODE_BUILDS.map(cfg => buildNodePackage(cfg)))
    for (const result of results) {
        if (result.status === 'rejected') {
            console.error(`[build] ✗ ${result.reason}`)
        }
    }
}

// #endregion ---- Node.js Package Builds ----

// #region ---- CSS Build ----

/**
 * Build and minify the uib-brand CSS file using LightningCSS.
 *
 * Steps performed:
 *   1. Update the @version date comment in the source file to source file's last modified date.
 *   2. Read the (potentially updated) source file.
 *   3. Transform with LightningCSS: minify and apply browser-specific transforms.
 *   4. Write the minified CSS with an appended sourceMappingURL comment.
 *   5. Write the source map file.
 *
 * Both output files ({outFile} and {mapFile}) are created or overwritten.
 * @async
 * @returns {Promise<void>}
 */
async function buildCSS() {
    const config = CSS_BUILD
    const srcPath = join(ROOT, config.srcFile)
    const outPath = join(ROOT, config.outFile)
    const mapFileName = basename(config.mapFile)

    // Step 1: Update the @version date in the CSS source via the centralised VERSION_FILES config
    const cssVersionEntry = VERSION_FILES.find(e => e.file === config.srcFile)
    if (cssVersionEntry) {
        await updateVersionInSourceFile(cssVersionEntry)
    }

    // Step 2: Read source (after potential date update)
    let cssInput
    try {
        cssInput = await readFile(srcPath) // eslint-disable-line security/detect-non-literal-fs-filename
    } catch (err) {
        console.error(`[css] Cannot read ${config.srcFile}: ${err.message}`)
        return
    }

    // Steps 3-5: Transform and write output
    try {
        const { code, map, } = transform({
            filename:  config.srcFile,
            code:      cssInput,
            minify:    true,
            sourceMap: true,
            targets:   LIGHTNING_TARGETS,
        })

        // Append sourceMappingURL so browser DevTools can locate the map
        const sourceMapComment = `\n/*# sourceMappingURL=${mapFileName} */\n`
        await writeFile(outPath, Buffer.concat([code, Buffer.from(sourceMapComment)])) // eslint-disable-line security/detect-non-literal-fs-filename

        if (map) {
            await writeFile(join(ROOT, config.mapFile), map) // eslint-disable-line security/detect-non-literal-fs-filename
        }

        console.log(`[build] ✓ ${config.name} CSS`)
    } catch (err) {
        console.error(`[build] ✗ CSS build failed: ${err.message}`)
    }
}

// #endregion ---- CSS Build ----

// #region ---- Docs Bundle Build ----

/** Build the Docsify documentation bundle for offline use.
 * Delegates to the existing src/doc-bundle/build.mjs script by spawning a child process so
 * that the doc bundle's top-level await and side effects are fully isolated.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If the child process exits with a non-zero code
 */
async function buildDocBundle() {
    console.log('[docs] Building documentation bundle...')
    return new Promise((resolve, reject) => {
        const child = spawn(
            process.execPath,
            [join(ROOT, 'src/doc-bundle/build.mjs')],
            { cwd: ROOT, stdio: 'inherit', }
        )
        child.on('close', (code) => {
            if (code === 0) {
                console.log('[build] ✓ docs bundle')
                resolve()
            } else {
                reject(new Error(`[docs] Doc bundle build exited with code ${code}`))
            }
        })
        child.on('error', reject)
    })
}

// #endregion ---- Docs Bundle Build ----

// #region ---- Watch Mode ----

/**
 * Execute an async build function and report any error without crashing the watcher process.
 * This ensures a single failing rebuild does not stop other modules from being watched.
 * @async
 * @param {() => Promise<void>} buildFn - Async build function to execute safely
 * @param {string}              label   - Human-readable name used in error output
 * @returns {Promise<void>}
 */
async function safeRebuild(buildFn, label) {
    try {
        await buildFn()
    } catch (err) {
        console.error(`[watch] ✗ ${label} rebuild failed: ${err.message}`)
    }
}

/**
 * Start chokidar file watchers for all configured build targets.
 * Each module has its own dedicated watcher so only the affected output(s) are rebuilt
 * when a source file changes.  The initial build must have been completed before calling
 * this function.
 * @async
 * @returns {Promise<void>}
 */
async function startWatch() {
    console.log('\n[watch] Starting watch mode...\n')

    // Lazily import chokidar only when watch mode is actually used.
    // The uib-fs-utils bundle uses dynamic require() which fails at module parse
    // time in a pure ESM context, so a top-level static import would break every
    // non-watch invocation (e.g. `node bin/build.mjs versions`).
    const { chokidar, } = await import('../packages/uib-fs-utils/index.mjs')

    /**
     * Strip the project root from a path for cleaner log lines.
     * @param {string} p - Absolute file path
     * @returns {string} Input path with the project root removed, for concise logging
     */
    const rel = (p) => p.replace(ROOT + '\\', '').replace(ROOT + '/')

    // ── Front-end modules (one watcher per config) ──────────────────────
    for (const config of FE_BUILDS) {
        chokidar
            .watch(config.watchFiles.map(f => join(ROOT, f)), { ignoreInitial: true, })
            .on('change', (p) => {
                console.log(`[watch] Changed: ${rel(p)}`)
                safeRebuild(() => buildFEModule(config), config.name)
            })
            .on('add',    (p) => {
                console.log(`[watch] Added:   ${rel(p)}`)
                safeRebuild(() => buildFEModule(config), config.name)
            })
    }

    // ── Experimental module ──────────────────────────────────────────────
    chokidar
        .watch(EXPERIMENTAL_BUILD.watchFiles.map(f => join(ROOT, f)), { ignoreInitial: true, })
        .on('change', (p) => {
            console.log(`[watch] Changed: ${rel(p)}`)
            safeRebuild(buildExperimental, EXPERIMENTAL_BUILD.name)
        })

    // ── Node.js packages (one watcher per config) ────────────────────────
    for (const config of NODE_BUILDS) {
        chokidar
            .watch(config.watchFiles.map(f => join(ROOT, f)), { ignoreInitial: true, })
            .on('change', (p) => {
                console.log(`[watch] Changed: ${rel(p)}`)
                safeRebuild(() => buildNodePackage(config), config.name)
            })
            .on('add',    (p) => {
                console.log(`[watch] Added:   ${rel(p)}`)
                safeRebuild(() => buildNodePackage(config), config.name)
            })
    }

    // ── CSS source ───────────────────────────────────────────────────────
    chokidar
        .watch(CSS_BUILD.watchFiles.map(f => join(ROOT, f)), { ignoreInitial: true, })
        .on('change', (p) => {
            console.log(`[watch] Changed: ${rel(p)}`)
            safeRebuild(buildCSS, CSS_BUILD.name)
        })

    console.log('[watch] Watching for changes. Press Ctrl+C to stop.\n')
}

// #endregion ---- Watch Mode ----

// #region ---- CLI Entry Point ----

/**
 * Parse process.argv to determine which build targets to run and whether to enable watch mode.
 *
 * Flags:  --watch | -w  Enable watch mode after the initial build
 * Targets (positional args, any combination):
 *   all      Build everything (default when no positional arg is given)
 *   fe       Front-end modules
 *   node     Node.js workspace packages
 *   css      CSS files
 *   docs     Docsify documentation bundle
 *   versions Update all version strings without building
 *
 * @returns {{ targets: string[], watch: boolean }} Parsed build targets and watch mode flag
 */
function parseArgs() {
    const args = process.argv.slice(2)
    const watchMode = args.includes('--watch') || args.includes('-w')
    const positional = args.filter(a => !a.startsWith('-'))
    const targets = positional.length > 0 ? positional : ['all']
    return { targets, watch: watchMode, }
}

/**
 * Main entry point.
 *
 * 1. Parses CLI arguments.
 * 2. Prints a startup banner with version and target information.
 * 3. Updates semantic version strings in source files before building.
 * 4. Runs the selected builds concurrently.
 * 5. Optionally enters watch mode to rebuild on file changes.
 * @async
 * @returns {Promise<void>}
 */
async function main() {
    const { targets, watch, } = parseArgs()

    const buildAll      = targets.includes('all')
    const versionsOnly  = targets.length === 1 && targets.includes('versions')
    const buildFE       = buildAll || targets.includes('fe')
    const buildNode     = buildAll || targets.includes('node')
    const buildCss      = buildAll || targets.includes('css')
    const buildDocs     = buildAll || targets.includes('docs')
    const updateVersions = targets.includes('versions')

    // ── Startup banner ───────────────────────────────────────────────────
    const SEP = '─'.repeat(60)
    console.log(SEP)
    console.log('  uibuilder build script')
    console.log(`  Package version : ${PKG_VERSION}`)
    console.log(`  Node.js target  : ${NODE_TARGET}  (Node-RED ≥v3 baseline)`)
    console.log(`  Browser target  : ${ESBUILD_BROWSER_TARGETS_HARDCODED.join(', ')}`)
    console.log(`  Targets         : ${targets.join(', ')}${watch ? '  [watch mode]' : ''}`)
    console.log(SEP)
    console.log()

    // ── Standalone versions-only target ─────────────────────────────────
    if (versionsOnly || updateVersions) {
        await updateAllVersions()
        if (versionsOnly) {
            console.log('\n[build] Done.')
            return
        }
        console.log()
    }

    // ── Pre-build: update semantic version strings in FE source files ────
    // Date-type entries (CSS @version) are handled by their own build functions.
    // Skipped when 'versions' already ran above (avoids duplicate updates).
    if (buildFE && !updateVersions) {
        const semanticEntries = VERSION_FILES.filter(e => e.type === 'semantic')
        await Promise.all(semanticEntries.map(e => updateVersionInSourceFile(e)))
        console.log()
    }

    // ── Run selected builds ──────────────────────────────────────────────
    /** @type {Array<[string, () => Promise<void>]>} */
    const tasks = []
    if (buildFE)   tasks.push(['front-end modules',  buildAllFE])
    if (buildNode) tasks.push(['node packages',       buildAllNode])
    if (buildCss)  tasks.push(['CSS',                 buildCSS])
    if (buildDocs) tasks.push(['docs bundle',         buildDocBundle])

    if (tasks.length === 0) {
        console.warn('[build] No recognised build targets. Use: all | fe | node | css | docs')
        return
    }

    // Run all tasks concurrently; individual failures are caught inside each function
    const results = await Promise.allSettled(tasks.map(([, fn]) => fn()))
    for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'rejected') {
            console.error(`\n[main] ✗ ${tasks[i][0]}: ${results[i].reason}`)
        }
    }

    console.log('\n[build] Build complete.')

    // ── Optionally enter watch mode ──────────────────────────────────────
    if (watch) {
        await startWatch()
    }
}

main().catch(err => {
    console.error(`[fatal] Uncaught error: ${err.message}`)
    process.exitCode = 1 // Use exitCode instead of exit() to allow pending logs to flush
})

// #endregion ---- CLI Entry Point ----
