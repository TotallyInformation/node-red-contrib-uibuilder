/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable jsdoc/newline-after-description, jsdoc/require-param */

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
 *  https://www.npmjs.com/package/gulp-debug
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
//const prompt = require('gulp-prompt')
const replace = require('gulp-replace')
const debug = require('gulp-debug')
const execa = require('execa')
const fs = require('fs')
//const { promisify } = require('util')
//const dotenv = require('dotenv')

const feDest = 'front-end/src'
const nodeDest = 'nodes'

// print output of commands into the terminal
const stdio = 'inherit'

// @ts-ignore
const { version } = JSON.parse(fs.readFileSync('package.json'))

//npm version 4.2.1 --no-git-tag-version --allow-same-version
const release = '4.2.1'

console.log(`Current Version: ${version}. Requested Version: ${release}`)

/** 
 * TODO
 *  - Add text replace to ensure 2021 in (c) blocks is current year
 */

/** Pack (Uglify) front-end task
 * @param {Function} cb Callback
 */
function packfe(cb) {
    try {
        src('front-end/src/uibuilderfe.js')
            .pipe(debug({title:'1', minimal:true}))
            .pipe(once())
            .pipe(debug({title:'2', minimal:true}))
            .pipe(uglify())
            .pipe(rename('uibuilderfe.min.js'))
            .pipe(dest(feDest))
    } catch (e) {
        console.error('Could not pack uibuilderfe', e)
    }
    cb()
}

/** Combine the parts of uibuilder.html */
function buildPanelUib(cb) {
    src('src/editor/uibuilder/main.html')
        .pipe(include())
        .pipe(once())
        .pipe(rename('uibuilder.html'))
        .pipe(dest(nodeDest))

    cb()
}
/** Combine the parts of uib-sender.html */
function buildPanelSender(cb) {
    src('src/editor/uib-sender/main.html')
        .pipe(include())
        .pipe(once())
        .pipe(rename('uib-sender.html'))
        .pipe(dest(nodeDest))

    cb()
}
/** Combine the parts of uib-sender.html */
function buildPanelReceiver(cb) {
    src('src/editor/uib-receiver/main.html')
        .pipe(include())
        .pipe(once())
        .pipe(rename('uib-receiver.html'))
        .pipe(dest(nodeDest))

    cb()
}

const buildme = parallel(buildPanelUib, buildPanelSender, buildPanelReceiver)

/** Watch for changes during development of uibuilderfe & editor */
function watchme(cb) {
    // Re-pack uibuilderfe if it changes
    watch('front-end/src/uibuilderfe.js', packfe)
    // Re-combine uibuilder.html if the source changes
    watch('src/editor/uibuilder/*', buildPanelUib)
    watch('src/editor/uib-sender/*', buildPanelSender)
    watch('src/editor/uib-receiver/*', buildPanelReceiver)

    cb()
}

/** Set the version string for uibuilderfe.js */
function setFeVersion(cb) {
    if (version !== release) {
        // Replace the version in uibuilderfe.js
        src('front-end/src/uibuilderfe.js')
            // eslint-disable-next-line prefer-named-capture-group
            .pipe(replace(/self.version = '(.*?)'/, function handleReplace(match, p1, offset, string) { // eslint-disable-line no-unused-vars
                if ( match !== release) {
                    console.log(`setFeVersion: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                    //git commit -m 'my notes' path/to/my/file.ext 
                    return `self.version = '${release}'`
                } 

                console.log(`Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                cb(new Error('setFeVersion: Content version same as release'))

            })) //,`self.version = '${release}'`))
            .pipe(dest('front-end/src/'))
    }
    cb()
}
/**  Set the version string for uibuilderfe.min.js */
function setFeVersionMin(cb) {
    if (version !== release) {
        // Replace the version in uibuilderfe.min.js
        src('front-end/src/uibuilderfe.min.js')
            // eslint-disable-next-line prefer-named-capture-group
            .pipe(replace(/.version="(.*?)",/, function handleReplace(match, p1, offset, string) { // eslint-disable-line no-unused-vars
                if ( match !== release) {
                    console.log(`setFeVersionMin: Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                    return `.version="${release}",`
                } 

                console.log(`Found '${match}', version: '${p1} at ${offset}. Replacing with '${release}'` )
                cb(new Error('setFeVersionMin: Content version same as release'))
            }))
            .pipe(dest('front-end/src/'))
    }
    cb()
}

/** Set uibuilder version in package.json */
async function setPackageVersion() {
    if (version !== release) {
        // bump version without committing and tagging
        await execa('npm', ['version', release, '--no-git-tag-version'], {stdio})
    } else {
        console.log('Requested version is same as current version - nothing will change')
    }
}

/** Create a new GitHub tag for a release (only if release ver # different to last committed tag) */
async function createTag(cb) {
    //Get the last committed tag: git describe --tags --abbrev=0
    let lastTag
    try {
        lastTag = (await execa('git', ['describe', '--tags', '--abbrev=0'])).stdout
    } catch (e) {
        lastTag = ''
    }
    
    console.log(`Last committed tag: ${lastTag}`)

    // If the last committed tag is different to the required release ...
    if ( lastTag.replace('v','') !== release ) {
        //const commitMsg = `chore: release ${release}`
        //await execa('git', ['add', '.'], { stdio })
        //await execa('git', ['commit', '--message', commitMsg], { stdio })
        await execa('git', ['tag', `v${release}`], { stdio })
        await execa('git', ['push', '--follow-tags'], { stdio })
        await execa('git', ['push', 'origin', '--tags'], { stdio })
    } else {
        console.log('Requested release version is same as the latest tag - not creating tag')
    }
    cb()
}

exports.default     = series( packfe, buildme ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
exports.watch       = watchme
exports.buildPanelUib = buildPanelUib
exports.build       = buildme
exports.packfe      = packfe
exports.createTag   = createTag
exports.setVersion  = series( setPackageVersion, setFeVersion, setFeVersionMin )
