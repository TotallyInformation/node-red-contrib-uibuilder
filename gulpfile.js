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
 * 
 *  https://www.npmjs.com/package/gulp-concat
 *  https://www.npmjs.com/package/gulp-sourcemaps
 *  https://www.npmjs.com/package/gulp-run - pipe to shell commands
 *  https://www.npmjs.com/package/gulp-prompt - console prompts
 *  https://www.npmjs.com/package/gulp-if-else
 *  https://www.npmjs.com/package/gulp-minify-inline
 *  https://www.npmjs.com/package/gulp-git
 * 
 *  ❌https://www.npmjs.com/package/gulp-changed - Does not work as expected
 */

'use strict'

const { src, dest, series, watch, /* parallel, */ } = require('gulp')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const include = require('gulp-include')
const once = require('gulp-once')

const feDest = 'front-end/src'
const nodeDest = 'nodes'

/** 
 * TODO
 *  - Add text replace to ensure 2021 in (c) blocks is current year
 *  - Use gulp-git for tage/release
 *  - Add task to change version in both package.json and uibuilderfe
 */

/** copy task */
// function copy(cb) {
//     src('nodes/libs/*.js')
//         .pipe(dest('tmp'))

//     cb()
// }

/** Pack (Uglify) front-end task */
function packfe(cb) {
    src('front-end/src/uibuilderfe.js')
        .pipe(once())
        .pipe(uglify())
        .pipe(rename('uibuilderfe.min.js'))
        .pipe(dest(feDest))

    cb()
}
exports.packfe = packfe

/** Combine the parts of uibuilder.html */
function combineHtml(cb) {
    src('src/editor/main.html')
        .pipe(once())
        .pipe(include())
        .pipe(rename('uibuilder.html'))
        .pipe(dest(nodeDest))

    cb()
}
exports.combineHtml = combineHtml

/** */
function watchme() {
    // Re-pack uibuilderfe if it changes
    watch('front-end/src/uibuilderfe.js', packfe)
    // Re-combine uibuilder.html if the source changes
    watch('src/editor/*', combineHtml)
}
exports.watch = watchme

exports.default = series( packfe, combineHtml ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
