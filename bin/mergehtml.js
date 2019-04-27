#!/usr/bin/env node

/** Merge the various sections of nodes/uibuilder.html from the files in node-src/
 * Note that this is run from `npm run mergehtml` which puts the working directory
 * to the root, not `./bin`
*/

const replace = require('replace-in-file')
const fs = require('fs')
//const path = require('path')

// nodes\lib\uibuilder-help.html
const myhelp = fs.readFileSync('./node-src/uibuilder-help.html')
const mytemplate = fs.readFileSync('./node-src/uibuilder-template.html')
const myscript = fs.readFileSync('./node-src/uibuilder-script.js')

// Copy template
fs.copyFileSync('./node-src/uibuilder.html', './nodes/uibuilder.html')

var options = {
    files: './nodes/uibuilder.html',
    from: [
        /(<script type="text\/javascript">)(.|\n)*?(<\/script>)/gmi,
        /(<script type="text\/x-red" data-template-name="uibuilder">)(.|\n)*?(<\/script>)/gmi,
        /(<script type="text\/x-red" data-help-name="uibuilder">)(.|\n)*?(<\/script>)/gmi,
    ],
    to: [
        `$1\n${myscript}\n$3`,
        `$1\n${mytemplate}\n$3`,
        `$1\n${myhelp}\n$3`,
    ],
}

replace(options)
    .then(changes => {
        console.log('MERGEHELP: data-help-name Modified files:', changes.join(', '));
    })
    .catch(error => {
        console.error('MERGEHELP: Error occurred:', error);
    })

console.log('MERGEHELP: Completed')

/*
//v4 code
replace(options)
        .then(results => {
            const changes = results.filter(result => result.hasChanged).map(result => result.file);
            console.log('MERGEHELP: Modified files:', changes.join(', '))
            restartNR()
        })
        .catch(error => {
            console.error('MERGEHELP: Error occurred:', error)
        })
*/
