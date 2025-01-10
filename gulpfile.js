/* eslint-disable n/no-unpublished-require, sonarjs/no-duplicate-string, jsdoc/require-param, jsdoc/require-jsdoc */

/**
 * https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js
 * https://gulpjs.com/plugins/
 * https://gulpjs.com/docs/en/api/concepts/
 * Plugins
 *  https://www.npmjs.com/package/gulp-include - source file inline replacements
 *  https://www.npmjs.com/package/gulp-uglify  - Minify
 *  https://www.npmjs.com/package/gulp-rename  - Rename source filename on output
 *  https://www.npmjs.com/package/gulp-once    - Only do things if files have changed
 *  https://www.npmjs.com/package/gulp-replace - String replacer
 *  https://www.npmjs.com/package/gulp-json-editor - Change data in a JSON file
 *  https://www.npmjs.com/package/gulp-debug
 *  https://github.com/jonschlinkert/gulp-htmlmin
 *  https://www.npmjs.com/package/gulp-esbuild - supports modern es modules
 *
 *  https://www.npmjs.com/package/gulp-concat
 *  https://www.npmjs.com/package/gulp-sourcemaps
 *  https://www.npmjs.com/package/gulp-prompt  - get input from user
 *  https://www.npmjs.com/package/gulp-if-else
 *  https://www.npmjs.com/package/gulp-minify-inline
 *  https://www.npmjs.com/package/gulp-tap - Easily tap into a pipeline. Could replace gulp-replace
 *  https://www.npmjs.com/package/webpack-stream - Use WebPack with gulp
 *  https://www.npmjs.com/package/tinyify - runs various optimizations
 *
 *  ❌https://www.npmjs.com/package/gulp-changed - Does not work as expected
 */

'use strict'

const { src, dest, series, watch, parallel, } = require('gulp')
// const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const include = require('gulp-include')
const once = require('gulp-once')
// const prompt = require('gulp-prompt')
const greplace = require('gulp-replace')
// const debug = require('gulp-debug') // Don't use - force changed to ESM only
const htmlmin = require('gulp-htmlmin')
const jeditor = require('gulp-json-editor')
// const gulpEsbuild = require('gulp-esbuild')
const { createGulpEsbuild } = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild()

const sourcemaps = require("gulp-sourcemaps");
const browserslist = require('browserslist');
const { transform, browserslistToTargets } = require('lightningcss');
const lightningcss = require("gulp-lightningcss");

const execa = require('execa')

const fs = require('fs-extra')
// const { default: esm } = require('socket.io-client')

// const { promisify } = require('util')
// const dotenv = require('dotenv')

if (!process.cwd().startsWith('D:')) {
    throw new Error('NOT RUNNING FROM THE D: DRIVE')
}

const feModuleSrc = 'src/front-end-module'
const feDest = 'front-end'
const feDestAlt = 'test-front-end'
const nodeDest = 'nodes'
const nodeSrcRoot = 'src/editor'

// print output of commands into the terminal
const stdio = 'inherit'

// @ts-ignore Find the module version in the package.json
const { version } = JSON.parse(fs.readFileSync('package.json'))
// Desired release version
const release = '7.2.0'
// Wanted node.js version - used for ESBUILD
const nodeVersion = 'node18.12'

console.log(`Current Version: ${version}. Requested Version: ${release}. Node.js Build Version: ${nodeVersion}`)

// const readline = require('readline')
/** Create a new node from the template */
// function createNewNode(cb) {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     })
//     rl.question('Enter the name of the new node to create: ', async function (nodeName) {
//         console.log(`\nNew node will be called '${nodeName}'`)
//         try {
//             fs.copy('new-node-template/nodes/node-name', `nodes/${nodeName}`)
//             console.log(`Template runtime copied to 'nodes/${nodeName}'`)
//         } catch (e) {
//             cb(e)
//         }
//         try {
//             fs.copy('new-node-template/src/nodes-html/node-name', `src/editor/${nodeName}`)
//             console.log(`Template Editor source copied to 'src/editor/${nodeName}'`)
//         } catch (e) {
//             cb(e)
//         }

//         rl.close()
//     })
//     rl.on('close', function () {
//         console.log('New node created.\n')
//         // setName(cb)
//         cb()
//     })
// }

/**
 * TODO
 *  - Add text replace to ensure 2021 in (c) blocks is current year
 */

//#region ---- packing FE components ----

//#region -- ESbuild client library ---
/** ESBuild front-end as ES Module minified
 * @param {Function} cb Callback
 */
function packfeModuleMin(cb) {
    src(`${feModuleSrc}/uibuilder.module.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibuilder.esm.min.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packfeModuleMin] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/="(.*)-src"/, '="$1-esm.min"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })

    // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    // cb()
}
/** ESBuild front-end as ES Module (not minified)
 * @param {Function} cb Callback
 */
function packfeModule(cb) {
    src(`${feModuleSrc}/uibuilder.module.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibuilder.esm.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[packfeModule] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-esm"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
    // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    // cb()
}
/** ESBuild front-end as IIFE minified
 * @param {Function} cb Callback
 */
function packfeIIFEmin(cb) {
    src(`${feModuleSrc}/uibuilder.module.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibuilder.iife.min.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packfeIIFEmin] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/="(.*)-src"/, '="$1-iife.min"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
    // cb()
}
/** ESBuild front-end as IIFE (not minified)
 * @param {Function} cb Callback
 */
function packfeIIFE(cb) {
    src(`${feModuleSrc}/uibuilder.module.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibuilder.iife.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[packfeIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-iife"'))
        // .pipe(debug({title: '>>> '}))
        .pipe(dest('front-end/'))
        // .pipe(dest(`${feDest}/`))
        .on('end', function() {
            // in case of success
            cb()
        })

    // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)

    // cb()
}
//#endregion -- ESbuild NEW client library ---

//#region -- ESbuild UI client library ---
/** ESBuild ui.js as ES Module minified
 * @param {Function} cb Callback
 */
function packUiEsmMin(cb) {
    src(`${feModuleSrc}/ui.js`)
        .pipe(gulpEsbuild({
            outfile: 'ui.esm.min.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packUiEsmMin] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/="(.*)-src"/, '="$1-esm.min"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
}
/** ESBuild ui.js as ES Module (not minified)
 * @param {Function} cb Callback
 */
function packUiEsm(cb) {
    src(`${feModuleSrc}/ui.js`)
        .pipe(gulpEsbuild({
            outfile: 'ui.esm.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[packUiEsm] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-esm"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
}
/** ESBuild ui.js as IIFE minified
 * @param {Function} cb Callback
 */
function packUiIIFEmin(cb) {
    src(`${feModuleSrc}/ui.js`)
        .pipe(gulpEsbuild({
            outfile: 'ui.iife.min.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packUiIIFEmin] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/="(.*)-src"/, '="$1-iife.min"'))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
}
/** ESBuild ui.js as IIFE (not minified)
 * @param {Function} cb Callback
 */
function packUiIIFE(cb) {
    src(`${feModuleSrc}/ui.js`)
        .pipe(gulpEsbuild({
            outfile: 'ui.iife.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[packUiIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-iife"'))
        .pipe(dest('front-end/'))
        .on('end', function() {
            // in case of success
            cb()
        })
}
/** ESBuild ui.js as a Node.js library
 * @param {Function} cb Callback
 */
function packUiNode(cb) {
    src(`${feModuleSrc}/ui.js`)
        .pipe(gulpEsbuild({
            outfile: 'ui.js',
            bundle: false,
            format: 'cjs', // CommonJS
            platform: 'node',
            minify: false,
            sourcemap: false,
            packages: 'external',
            target: [
                nodeVersion,
            ]
        }))
        .on('error', function(err) {
            console.error('[packUiNode] ERROR ', err)
            cb(err)
        })
        .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-node"'))
        .pipe(dest('nodes/libs/'))
        .on('end', function() {
            // in case of success
            cb()
        })
}
//#endregion -- ESbuild UI client library ---

//#region -- ESbuild components --
/** ESBuild front-end as IIFE minified
 * @param {Function} cb Callback
 */
// function buildUibVarIIFEmin(cb) {
//     src('src/components/uib-var.js')
//         .pipe(gulpEsbuild({
//             outfile: 'uib-var.iife.min.js',
//             bundle: true,
//             format: 'iife',
//             platform: 'browser',
//             minify: true,
//             sourcemap: true,
//             target: [
//                 // 'es2019',
//                 // Start of 2019
//                 'chrome72',
//                 'safari12.1',
//                 'firefox65',
//                 'opera58',

//                 // For private class fields:
//                 // 'chrome74',   // Apr 23, 2019
//                 // 'opera62',    // Jun 27, 2019
//                 // 'edge79',     // Jan 15, 2020
//                 // 'safari14.1', // Apr 26, 2021
//                 // 'firefox90',  // Jul 13, 2021

//                 // If we need top-level await
//                 // 'chrome89',  // March 1, 2021
//                 // 'edge89',
//                 // 'opera75',   // Mar 24, 2021
//                 // 'firefox89', // Jun 1, 2021
//                 // 'safari15',  // Sep 20, 2021
//             ]
//         }))
//         .on('error', function(err) {
//             console.error('[buildUibVarIIFEmin] ERROR ', err)
//             cb(err)
//         })
//         // .pipe(greplace(/="(.*)-src"/, '="$1-iife.min"'))
//         .pipe(dest(feDest))
//         .on('end', function() {
//             // in case of success
//             cb()
//         })
// }
/** ESBuild front-end as IIFE (not minified)
 * @param {Function} cb Callback
 */
// function buildUibVarIIFE(cb) {
//     src('src/components/uib-var.js')
//         .pipe(gulpEsbuild({
//             outfile: 'uib-var.iife.js',
//             bundle: true,
//             format: 'iife',
//             platform: 'browser',
//             minify: false,
//             sourcemap: false,
//             target: [
//                 'es2020',
//             ]
//         }))
//         .on('error', function(err) {
//             console.error('[buildUibVarIIFE] ERROR ', err)
//             cb(err)
//         })
//         // .pipe(greplace(/version = "(.*)-src"/, 'version = "$1-iife"'))
//         // .pipe(debug({title: '>>> '}))
//         .pipe(dest('front-end/'))
//         // .pipe(dest(`${feDest}/`))
//         .on('end', function() {
//             // in case of success
//             cb()
//         })
// }

//#endregion -- ---- --

//#region -- ESbuild uibrouter --
function buildUibRouterIIFE(cb) {
    src(`${feModuleSrc}/uibrouter.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibrouter.iife.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[buildUibRouterIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(dest('front-end/utils/'))
        .on('end', function() {
            cb()
        })
}
function buildUibRouterIIFEmin(cb) {
    src(`${feModuleSrc}/uibrouter.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibrouter.iife.min.js',
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[buildUibRouterIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(dest('front-end/utils/'))
        .on('end', function() {
            cb()
        })
}
function buildUibRouterESM(cb) {
    src(`${feModuleSrc}/uibrouter.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibrouter.esm.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: false,
            sourcemap: false,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[buildUibRouterIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(dest('front-end/utils/'))
        .on('end', function() {
            cb()
        })
}
function buildUibRouterESMmin(cb) {
    src(`${feModuleSrc}/uibrouter.js`)
        .pipe(gulpEsbuild({
            outfile: 'uibrouter.esm.min.js',
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                'es2020',
            ]
        }))
        .on('error', function(err) {
            console.error('[buildUibRouterIIFE] ERROR ', err)
            cb(err)
        })
        .pipe(dest('front-end/utils/'))
        .on('end', function() {
            cb()
        })
}
//#endregion -- ---- --

//#region -- tests --
/** Pack (Uglify) front-end IIFE ES6 task
 * @param {Function} cb Callback
 */
function packfeIIFEes6(cb) { // eslint-disable-line no-unused-vars
    try {
        src(`${feModuleSrc}/uibuilder.module.js`)
            .pipe(gulpEsbuild({
                outfile: 'uibuilder.es6.min.js',
                bundle: true,
                format: 'iife',
                platform: 'browser',
                minify: true,
                sourcemap: true,
                target: [
                    'es2016',
                    // Start of 2019
                    // 'chrome72',
                    // 'safari12.1',
                    // 'firefox65',
                    // 'opera58',

                    // For private class fields:
                    // 'chrome74',   // Apr 23, 2019
                    // 'opera62',    // Jun 27, 2019
                    // 'edge79',     // Jan 15, 2020
                    // 'safari14.1', // Apr 26, 2021
                    // 'firefox90',  // Jul 13, 2021

                    // If we need top-level await
                    // 'chrome89',  // March 1, 2021
                    // 'edge89',
                    // 'opera75',   // Mar 24, 2021
                    // 'firefox89', // Jun 1, 2021
                    // 'safari15',  // Sep 20, 2021
                ]
            }))
            .pipe(greplace(/="(.*)-mod"/, '="$1-es6.min"'))
            .pipe(dest(feDestAlt))

        src(`${feModuleSrc}/uibuilder.module.js`)
            .pipe(gulpEsbuild({
                outfile: 'uibuilder.es6.js',
                bundle: true,
                format: 'iife',
                platform: 'browser',
                minify: false,
                sourcemap: false,
                target: [
                    'es2016',
                ]
            }))
            .pipe(greplace(/version = "(.*)-mod"/, 'version = "$1-es6"'))
            .pipe(dest(feDestAlt))

        // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    } catch (e) {
        console.error('Could not pack uibuilder.module.js for es6', e)
    }
    cb()
}
/** Pack (Uglify) front-end IIFE ES5 task - DOES NOT WORK!
 * @param {Function} cb Callback
 */
function packfeIIFEes5(cb) { // eslint-disable-line no-unused-vars
    try {
        src(`${feModuleSrc}/uibuilder.module.js`)
            .pipe(gulpEsbuild({
                outfile: 'uibuilder.es5.min.js',
                bundle: true,
                format: 'iife',
                platform: 'browser',
                minify: true,
                sourcemap: true,
                target: [
                    'es5',
                    // Start of 2019
                    // 'chrome72',
                    // 'safari12.1',
                    // 'firefox65',
                    // 'opera58',

                    // For private class fields:
                    // 'chrome74',   // Apr 23, 2019
                    // 'opera62',    // Jun 27, 2019
                    // 'edge79',     // Jan 15, 2020
                    // 'safari14.1', // Apr 26, 2021
                    // 'firefox90',  // Jul 13, 2021

                    // If we need top-level await
                    // 'chrome89',  // March 1, 2021
                    // 'edge89',
                    // 'opera75',   // Mar 24, 2021
                    // 'firefox89', // Jun 1, 2021
                    // 'safari15',  // Sep 20, 2021
                ]
            }))
            .pipe(greplace(/="(.*)-mod"/, '="$1-es5.min"'))
            .pipe(dest(feDestAlt))

        src(`${feModuleSrc}/uibuilder.module.js`)
            .pipe(gulpEsbuild({
                outfile: 'uibuilder.es5.js',
                bundle: true,
                format: 'iife',
                platform: 'browser',
                minify: false,
                sourcemap: false,
                target: [
                    'es5',
                ]
            }))
            .pipe(greplace(/version = "(.*)-mod"/, 'version = "$1-es5"'))
            .pipe(dest(feDestAlt))

        // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    } catch (e) {
        console.error('Could not pack uibuilder.module.js for es5', e)
    }
    cb()
}
//#endregion

//#endregion ---- ---- ----

// Allows iOS Safari back to v12, excludes IE
let targets = browserslistToTargets(browserslist('>=0.12%, not ie > 0'));
// console.log(targets)

const lightningcss_options = {
    minify: true, // Default
    sourceMap: true, // Default
    targets: targets, // Make sure we don't use too new CSS
}

/** Pack CSS & limit "new" css options
 * Retains original, creates new .min.css version and .min.css.map
 * @param {Function} cb Callback
 */
function minifyBrandCSS(cb) {
    src(`${feDest}/uib-brand.css`)
        .pipe(sourcemaps.init())
            .pipe(lightningcss(lightningcss_options))
            .pipe(rename('uib-brand.min.css'))
        .pipe(sourcemaps.write(""))
        .pipe(dest(feDest))
        .on('end', function() {
            // in case of success
            cb()
        })
}

/** See the buildDocBundle script in package.json for building the Docsify bundle for offline use */
// function buildDocsApp(cb) {}

//#region ---- Build node panels ----

/** Build the uib-element panel */
function buildPanelUibElement(cb) {
    try {
        src(`${nodeSrcRoot}/uib-element/main.html`, ) // { since: lastRun(buildMe) } )
            // .pipe(debug({title:'debug1',minimal:false}))
            .pipe( include() )
            // Rename output to $dirname/editor.html
            .pipe(rename(function(thispath) {
                // thispath.dirname = `${thispath.dirname}`
                thispath.basename = 'customNode'
                // thispath.extname = 'html'
            }))
            // Minimise HTML output
            // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, processScripts: ['text/html'], removeScriptTypeAttributes: true }))
            .pipe(dest(`${nodeDest}/uib-element/`))
    } catch (e) {
        console.error('buildPanelUibElement failed', e)
    }

    cb()
}

/** Combine the parts of uib-update.html */
function buildPanelUpdate(cb) {
    try {
        src(`${nodeSrcRoot}/uib-update/main.html`, ) // { since: lastRun(buildMe) } )
            // .pipe(debug({title:'debug1',minimal:false}))
            .pipe( include() )
            // Rename output to $dirname/editor.html
            .pipe(rename(function(thispath) {
                // thispath.dirname = `${thispath.dirname}`
                thispath.basename = 'customNode'
                // thispath.extname = 'html'
            }))
            // Minimise HTML output
            // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, processScripts: ['text/html'], removeScriptTypeAttributes: true }))
            .pipe(dest(`${nodeDest}/uib-update/`))
    } catch (e) {
        console.error('buildPanelUpdate failed', e)
    }

    cb()
}

/** Combine the parts of uib-tag.html */
function buildPanelTag(cb) {
    try {
        src(`${nodeSrcRoot}/uib-tag/main.html`, ) // { since: lastRun(buildMe) } )
            // .pipe(debug({title:'debug1',minimal:false}))
            .pipe( include() )
            // Rename output to $dirname/editor.html
            .pipe(rename(function(thispath) {
                // thispath.dirname = `${thispath.dirname}`
                thispath.basename = 'customNode'
                // thispath.extname = 'html'
            }))
            // Minimise HTML output
            // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, processScripts: ['text/html'], removeScriptTypeAttributes: true }))
            .pipe(dest(`${nodeDest}/uib-tag/`))
    } catch (e) {
        console.error('buildPanelTag failed', e)
    }

    cb()
}

/** Combine the parts of uib-html.html */
function buildPanelHTML(cb) {
    try {
        src(`${nodeSrcRoot}/uib-html/main.html`, ) // { since: lastRun(buildMe) } )
            // .pipe(debug({title:'debug1',minimal:false}))
            .pipe( include() )
            // Rename output to $dirname/editor.html
            .pipe(rename(function(thispath) {
                // thispath.dirname = `${thispath.dirname}`
                thispath.basename = 'customNode'
                // thispath.extname = 'html'
            }))
            // Minimise HTML output
            // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, processScripts: ['text/html'], removeScriptTypeAttributes: true }))
            .pipe(dest(`${nodeDest}/uib-html/`))
    } catch (e) {
        console.error('buildPanelTag failed', e)
    }

    cb()
}

//#endregion ---- ---- ----

// const buildme = parallel(buildPanelUib, buildPanelSender, buildPanelReceiver)
const buildme = parallel(
    // buildPanelSender,
    buildPanelUibElement,
    buildPanelUpdate,
    buildPanelTag,
    buildPanelHTML,
)

const buildNewFe = parallel(
    packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE
)

/* Ignored for now
function buildNodeLibs(cb) {
    src(`src/libs/*.js`)
        .pipe(gulpEsbuild({
            // outfile: 'test-execa.js',
            // outdir: 'libs',
            bundle: false,
            format: 'cjs', // CommonJS
            platform: 'node',
            minify: true,
            sourcemap: true,
            packages: 'external',
            target: [
                nodeVersion,
            ]
        }))
        .on('error', function(err) {
            console.error('[buildNodeLibs] ERROR ', err)
            cb(err)
        })
        .pipe(debug({title: '>>> '}))
        .pipe(dest('nodes/libs/'))
        .on('end', function() {
            // in case of success
            cb()
        })
}
*/

/** Watch for changes during development */
function watchme(cb) {
    watch(['src/front-end-module/uibuilder.module.js'], parallel(packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE))
    watch('src/front-end-module/uibrouter.js', parallel(buildUibRouterIIFE, buildUibRouterIIFEmin, buildUibRouterESM, buildUibRouterESMmin))
    watch('src/components/uib-var.js', parallel(packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE))
    watch('src/components/apply-template.js', parallel(packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE))
    watch('src/components/uib-meta.js', parallel(packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE))
    watch(['src/front-end-module/ui.js'], parallel(packUiNode, packUiEsmMin, packUiEsm, packUiIIFEmin, packUiIIFE, packfeModuleMin, packfeModule, packfeIIFEmin, packfeIIFE))
    // watch('src/editor/uib-sender/*', buildPanelSender)
    watch('src/editor/uib-element/*', buildPanelUibElement)
    watch('src/editor/uib-update/*', buildPanelUpdate)
    watch('src/editor/uib-tag/*', buildPanelTag)
    watch('src/editor/uib-html/*', buildPanelHTML)
    watch('front-end/uib-brand.css', minifyBrandCSS)

    cb()
}

//#region ---- set versions ----

/** Set uibuilder version in package.json */
function setPackageVersion(cb) {
    if (version !== release) {
        // bump version without committing and tagging
        // await execa('npm', ['version', release, '--no-git-tag-version'], {stdio})
        src('./package.json')
            .pipe(jeditor({ 'version': release } ) )
            .pipe(dest('.') )
        console.log(`setPackageVersion: Setting version to ${release}` )
    } else {
        console.log('setPackageVersion: Requested version is same as current version - nothing will change')
    }
    cb()
}
/** Set uibuilder version in package-lock.json */
function setPackageLockVersion(cb) {
    if (version !== release) {
        src('./package-lock.json')
            .pipe(jeditor({ 'version': release } ) )
            .pipe(dest('.') )
        console.log(`setPackageVersion: Setting version to ${release}` )
    }
    cb()
}
/** Set uibuilder version in src\front-end-module\ui.js */
function notifyOtherVersions(cb) {
    if (version !== release) {
        console.log(`Updating version to ${release}. Don't forget to run 'gulp watch' then change versions in: src/front-end-module/ui.js, src/components/uib-var.js, src/front-end-module/uibrouter.js. And template package.json files if updated.` )
    }
    cb()
}

//#endregion ---- ---- ----

/** Create a new GitHub tag for a release (only if release ver # different to last committed tag) */
async function createTag(cb) {
    // Get the last committed tag: git describe --tags --abbrev=0
    // To delete a tag so it can be recreated `git tag -d v6.8.0`
    let lastTag
    try {
        lastTag = (await execa('git', ['describe', '--tags', '--abbrev=0'])).stdout
    } catch (e) {
        lastTag = ''
    }

    console.log(`Last committed tag: ${lastTag}`)

    // If the last committed tag is different to the required release ...
    if ( lastTag.replace('v', '') !== release ) {
        // const commitMsg = `chore: release ${release}`
        // await execa('git', ['add', '.'], { stdio })
        // await execa('git', ['commit', '--message', commitMsg], { stdio })
        await execa('git', ['tag', `v${release}`], { stdio })
        await execa('git', ['push', '--follow-tags'], { stdio })
        await execa('git', ['push', 'origin', '--tags'], { stdio })
    } else {
        console.log('Requested release version is same as the latest tag - not creating tag')
    }
    cb()
}

exports.default     = series( packfeModule, buildme ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
exports.watch       = watchme
// exports.buildPanelUib = series(buildPanelUib1, buildPanelUib2)
exports.build       = buildme
exports.buildFe     = buildNewFe
// exports.buildNodeLibs = buildNodeLibs
exports.packfeModule = packfeModule
exports.packfeIIFE  = packfeIIFE
exports.createTag   = createTag
// exports.setVersion  = series( setPackageVersion, setPackageLockVersion, setFeVersionDev, setFeVersion, setFeVersionMin, notifyOtherVersions )
exports.setVersion  = series( setPackageVersion, setPackageLockVersion, notifyOtherVersions )
// To update branch from main: git pull origin main
// To publish: npm publish --access public
