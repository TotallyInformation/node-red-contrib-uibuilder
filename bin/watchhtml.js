#!/usr/bin/env node
// @ts-check
'use strict'

/* ---- CHANGE THIS ---- */
const nodeName = 'uibuilder'
/* --------------------- */

const replace = require('replace-in-file')
const fs = require('fs')
const path = require('path')

const nodeSrc = path.join('.', 'node-admin-src')

/** Merge the various sections of nodes/uibuilder.html from the files in node-src/
 * Note that this is run from `npm run mergehtml` which puts the working directory
 * to the root, not `./bin`
 * 
 * Folder containing files must be called: `node-admin-src`
 * Files must be named: `template.html`, `panel.html`, `help.html`, `script.js`
 */
function mergehtml(nodeName, srcFiles) {
    const myhelp = fs.readFileSync( path.join(srcFiles, 'help.html') )
    const mytemplate = fs.readFileSync(  path.join(srcFiles, 'panel.html') )
    const myscript = fs.readFileSync(  path.join(srcFiles, 'script.js') )

    // Copy template
    fs.copyFileSync( path.join(srcFiles, 'template.html'), './nodes/' + nodeName + '.html')

    var options = {
        files: './nodes/' + nodeName + '.html',
        from: [
            /(<script type="text\/javascript">)(.|\n)*?(<\/script>)/gmi,
            /(<script type="text\/x-red" data-template-name="NODENAME">)(.|\n)*?(<\/script>)/gmi,
            /(<script type="text\/x-red" data-help-name="NODENAME">)(.|\n)*?(<\/script>)/gmi,
            /-name="NODENAME">/gmi,
        ],
        to: [
            `$1\n${myscript}\n$3`,
            `$1\n${mytemplate}\n$3`,
            `$1\n${myhelp}\n$3`,
            `-name="${nodeName}">`,
        ],
    }

    replace(options)
        .then(changes => {
            console.log('MERGE:Modified files:', changes.join(', '));
        })
        .catch(error => {
            console.error('MERGE: Error occurred:', error);
        })
        .finally( () => {
            console.log('MERGE: Finished')
        })

} /* ---- End of MergeHtml ---- */

fs.watch(nodeSrc, (eventType, filename) => {
    //console.log(`event type is: ${eventType}`);
    if (filename) {
        mergehtml(nodeName, nodeSrc)
    }
})

// EOF