/* eslint-disable jsdoc/newline-after-description, jsdoc/require-param */

/**
 * https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js
 * https://gulpjs.com/plugins/
 * https://gulpjs.com/docs/en/api/concepts/
 * Plugins
 *  https://www.npmjs.com/package/gulp-include
 *  https://www.npmjs.com/package/gulp-uglify
 *  https://www.npmjs.com/package/gulp-rename
 *  https://www.npmjs.com/package/gulp-changed - only let through files changed since last dest modified
 * 
 *  https://www.npmjs.com/package/gulp-concat
 *  https://www.npmjs.com/package/gulp-sourcemaps
 *  https://www.npmjs.com/package/gulp-run - pipe to shell commands
 *  https://www.npmjs.com/package/gulp-prompt - console prompts
 *  https://www.npmjs.com/package/gulp-if-else
 *  https://www.npmjs.com/package/gulp-minify-inline
 *  https://www.npmjs.com/package/gulp-git
 */

'use strict'

const { src, dest, series, /*watch, parallel, */ } = require('gulp')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const include = require('gulp-include')
const changed = require('gulp-changed')

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
        .pipe(changed(feDest))
        .pipe(uglify())
        .pipe(rename('uibuilderfe.min.js'))
        .pipe(dest(feDest))

    cb()
}

/** Combine the parts of uibuilder.html */
function combineHtml(cb) {
    src('src/editor/main.html')
        .pipe(changed(nodeDest))
        .pipe(include())
        .pipe(rename('uibuilder.html'))
        .pipe(dest(nodeDest))

    cb()
}

exports.default = series( packfe, combineHtml ) // series(runLinter,parallel(generateCSS,generateHTML),runTests)
