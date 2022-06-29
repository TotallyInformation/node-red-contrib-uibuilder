/* eslint-disable n/no-unpublished-require, sonarjs/no-duplicate-string, jsdoc/newline-after-description, jsdoc/require-param */

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
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const include = require('gulp-include')
const once = require('gulp-once')
// const prompt = require('gulp-prompt')
const greplace = require('gulp-replace')
const debug = require('gulp-debug')
const htmlmin = require('gulp-htmlmin')
const jeditor = require('gulp-json-editor')
const gulpEsbuild = require('gulp-esbuild')

const execa = require('execa')

const fs = require('fs-extra')
const { default: esm } = require('socket.io-client')

// const { promisify } = require('util')
// const dotenv = require('dotenv')

const feSrc = 'src/front-end'
const feModuleSrc = 'src/front-end-module'
const feDest = 'front-end'
const nodeDest = 'nodes'
const nodeSrcRoot = 'src/editor'

// print output of commands into the terminal
const stdio = 'inherit'

// @ts-ignore
const { version } = JSON.parse(fs.readFileSync('package.json'))

// npm version 4.2.1 --no-git-tag-version --allow-same-version
const release = '5.1.1'

console.log(`Current Version: ${version}. Requested Version: ${release}`)

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
 *  - In packfe, set the source version string to the current package.json version
 */

/** Pack (Uglify) front-end task
 * @param {Function} cb Callback
 */
function packfe(cb) {
    try {
        src(`${feSrc}/uibuilderfe.dev.js`)
            // .pipe(debug({ title: '1', minimal: true }))
            .pipe(once())
            // .pipe(debug({ title: '2', minimal: true }))
            .pipe(uglify())
            .pipe(rename('uibuilderfe.min.js'))
            .pipe(dest(feDest))
        fs.copyFileSync(`${feSrc}/uibuilderfe.dev.js`, `${feDest}/uibuilderfe.js`)
        // src(`${feSrc}/uibuilderfe.dev.js`)
        //     .pipe(gulpEsbuild({
        //         outfile: 'uibuilderfe.esm.min.js',
        //         bundle: false,
        //         format: 'esm',
        //         platform: 'browser',
        //         minify: true,
        //         sourcemap: true,
        //         target: [
        //             'es2019',
        //         ]
        //     }))
        //     .pipe(dest(feDest))
        // src(`${feSrc}/uibuilderfe.dev.js`)
        //     .pipe(gulpEsbuild({
        //         outfile: 'uibuilderfe.alt.min.js',
        //         bundle: false,
        //         // format: 'esm',
        //         platform: 'browser',
        //         minify: true,
        //         sourcemap: true,
        //         target: [
        //             'es6',
        //         ]
        //     }))
        //     .pipe(dest(feDest))
    } catch (e) {
        console.error('Could not pack uibuilderfe', e)
    }
    cb()
}

/** Pack (Uglify) front-end Module task
 * @param {Function} cb Callback
 */
function packfeModule(cb) {
    try {
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
            .pipe(greplace(/="(.*)-mod"/, '="$1-esm.min"'))
            .pipe(dest(feDest))

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
            .pipe(greplace(/version = "(.*)-mod"/, 'version = "$1-esm"'))
            .pipe(dest(feDest))

        // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    } catch (e) {
        console.error('Could not pack uibuilder.module.js for esm', e)
    }
    cb()
}

/** Pack (Uglify) front-end IIFE task
 * @param {Function} cb Callback
 */
function packfeIIFE(cb) {
    try {
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
            .pipe(greplace(/="(.*)-mod"/, '="$1-iife.min"'))
            .pipe(dest(feDest))

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
            .pipe(greplace(/version = "(.*)-mod"/, 'version = "$1-iife"'))
            .pipe(dest(feDest))

        // fs.copyFileSync(`${feModuleSrc}/uibuilder.module.js`, `${feDest}/uibuilder.esm.js`)
    } catch (e) {
        console.error('Could not pack uibuilder.module.js for iife', e)
    }
    cb()
}

/** Combine the parts of uibuilder.html */
function buildPanelUib1(cb) {
    src('src/editor/uibuilder/editor.js')
        // .pipe(debug({title:'1', minimal:true}))
        // .pipe(once())
        // .pipe(debug({title:'2', minimal:true}))
        .pipe(uglify())
        .pipe(rename('editor.min.js'))
        .pipe(dest('src/editor/uibuilder'))

    cb()
}
/** compress */
function buildPanelUib2(cb) {
    src('src/editor/uibuilder/main.html')
        .pipe(include())
        // .pipe(once())
        .pipe(rename('uibuilder.html'))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, processScripts: ['text/html'], removeScriptTypeAttributes: true }))
        .pipe(dest(nodeDest))

    cb()
}

/** Combine the parts of uib-cache.html */
function buildPanelCache(cb) {
    src('src/editor/uib-cache/main.html')
        .pipe(include())
        .pipe(once())
        .pipe(rename('uib-cache.html'))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyJS: true }))
        .pipe(dest(nodeDest))

    cb()
}

/** Combine the parts of uib-sender.html */
function buildPanelSender(cb) {
    src('src/editor/uib-sender/main.html')
        .pipe(include())
        .pipe(once())
        .pipe(rename('uib-sender.html'))
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyJS: true }))
        .pipe(dest(nodeDest))

    cb()
}

/** Combine the parts of uib-receiver.html */
// function buildPanelReceiver(cb) {
//     src('src/editor/uib-receiver/main.html')
//         .pipe(include())
//         .pipe(once())
//         .pipe(rename('uib-receiver.html'))
//         .pipe(dest(nodeDest))

//     cb()
// }

// For new nodes, the html & js files go in /nodes/<node-name>/ with the filename customNode.{html|js}
function buildPanelUibList(cb) {
    src(`${nodeSrcRoot}/uib-list/main.html`, ) // { since: lastRun(buildMe) } )
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
        .pipe(dest(`${nodeDest}/uib-list/`))

    cb()
}

// const buildme = parallel(buildPanelUib, buildPanelSender, buildPanelReceiver)
const buildme = parallel(series(buildPanelUib1, buildPanelUib2), buildPanelSender, buildPanelCache, buildPanelUibList)

/** Watch for changes during development of uibuilderfe & editor */
function watchme(cb) {
    // Re-pack uibuilderfe if it changes
    watch('src/front-end/uibuilderfe.dev.js', packfe)
    watch('src/front-end-module/uibuilder.module.js', parallel(packfeModule, packfeIIFE))
    watch(['src/editor/uibuilder/editor.js'], buildPanelUib1)
    // Re-combine uibuilder.html if the source changes
    watch(['src/editor/uibuilder/*', '!src/editor/uibuilder/editor.js'], buildPanelUib2)
    watch('src/editor/uib-sender/*', buildPanelSender)
    // watch('src/editor/uib-receiver/*', buildPanelReceiver)
    watch('src/editor/uib-cache/*', buildPanelCache)
    watch('src/editor/uib-list/*', buildPanelUibList)

    cb()
}

/** Set the version string for uibuilderfe.js */
function setFeVersionDev(cb) {
    if (version !== release) {
        // Replace the version in uibuilderfe.js
        src(`${feSrc}/uibuilderfe.dev.js`)
            // eslint-disable-next-line prefer-named-capture-group
            .pipe(greplace(/self.version = '(.*?)'/, function handleReplace(match, p1, offset, string) { // eslint-disable-line no-unused-vars

                if ( match !== release) {
                    console.log(`setFeVersionDev: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                    // git commit -m 'my notes' path/to/my/file.ext 
                    return `self.version = '${release}'`
                } 

                console.log(`setFeVersionDev: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )

                cb(new Error('setFeVersionDev: Content version same as release'))

            })) // ,`self.version = '${release}'`))
            .pipe(dest(feSrc))
    }
    cb()
}
/** Live version */
function setFeVersion(cb) {
    if (version !== release) {
        // Replace the version in uibuilderfe.js
        src(`${feDest}/uibuilderfe.js`)
            // eslint-disable-next-line prefer-named-capture-group
            .pipe(greplace(/self.version = '(.*?)'/, function handleReplace(match, p1, offset, string) { // eslint-disable-line no-unused-vars

                if ( match !== release) {
                    console.log(`setFeVersion: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                    // git commit -m 'my notes' path/to/my/file.ext 
                    return `self.version = '${release}'`
                } 

                console.log(`setFeVersion: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                cb(new Error('setFeVersion: Content version same as release'))

            })) // ,`self.version = '${release}'`))
            .pipe(dest(feDest))
    }
    cb()
}
/**  Set the version string for uibuilderfe.min.js */
function setFeVersionMin(cb) {
    if (version !== release) {
        // Replace the version in uibuilderfe.min.js
        src(`${feDest}/uibuilderfe.min.js`)
            // eslint-disable-next-line prefer-named-capture-group
            .pipe(greplace(/.version="(.*?)",/, function handleReplace(match, p1, offset, string) { // eslint-disable-line no-unused-vars
                if ( match !== release) {
                    console.log(`setFeVersionMin: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                    return `.version="${release}",`
                } 

                console.log(`Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                cb(new Error('setFeVersionMin: Content version same as release'))
            }))
            .pipe(dest(feDest))
    }
    cb()
}

/** Set uibuilder version in package.json */
function setPackageVersion(cb) {
    if (version !== release) {
        // bump version without committing and tagging
        // await execa('npm', ['version', release, '--no-git-tag-version'], {stdio})
        src('./package.json')
            .pipe(jeditor({ 'version': release } ) )
            .pipe(dest('.') )
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
    }
    cb()
}

/** Create a new GitHub tag for a release (only if release ver # different to last committed tag) */
async function createTag(cb) {
    // Get the last committed tag: git describe --tags --abbrev=0
    let lastTag
    try {
        lastTag = (await execa('git', ['describe', '--tags', '--abbrev=0'])).stdout
    } catch (e) {
        lastTag = ''
    }
    
    console.log(`Last committed tag: ${lastTag}`)

    // If the last committed tag is different to the required release ...
    if ( lastTag.replace('v','') !== release ) {
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

exports.default     = series( packfe, packfeModule, buildme ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
exports.watch       = watchme
exports.buildPanelUib = series(buildPanelUib1, buildPanelUib2)
exports.build       = buildme
exports.packfe      = packfe
exports.packfeModule = packfeModule
exports.createTag   = createTag
exports.setVersion  = series( setPackageVersion, setPackageLockVersion, setFeVersionDev, setFeVersion, setFeVersionMin )
