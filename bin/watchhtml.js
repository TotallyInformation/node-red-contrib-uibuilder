#!/usr/bin/env node
// @ts-check
'use strict'

/** Merge the various sections of nodes/uibuilder.html from the files in node-src/
 * Note that this is run from `npm run mergehtml` which puts the working directory
 * to the root, not `./bin`
*/

const replace = require('replace-in-file')
const fs = require('fs')
//const path = require('path')
//const { spawn } = require('child_process')

const userDir = '/src/nr/data' // the Node-RED userDir, often `~/.node-red`

//nodemon node_modules/node-red/red.js --userDir ./data
/* function spawnNodemon() {
    const cp = spawn('node', [
        '/src/nr/node_modules/node-red/red.js', '--userDir', '/src/nr/data'], {
            // the important part is the 4th option 'ipc'
            // this way `process.send` will be available in the child process (nodemon)
            // so it can communicate back with parent process (through `.on()`, `.send()`)
            // https://nodejs.org/api/child_process.html#child_process_options_stdio
            stdio: [
                'pipe', 'pipe', 'pipe', 'ipc'
            ],
        }
    )
    return cp
} */

/* var app = spawnNodemon()
app.on('message', function (event) {
    if (event.type === 'start') {
        console.log('nodemon started')
    } else if (event.type === 'crash') {
        console.log('script crashed for some reason')
    }
}) */

function mergehtml() {
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
            console.log('MERGEHELP: Modified files:', changes.join(', '))
            restartNR()
        })
        .catch(error => {
            console.error('MERGEHELP: Error occurred:', error)
        })

    console.log('MERGEHELP: Completed')
}

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

function restartNR() {
    // force a restart
    //app.send('restart')
}

fs.watch('./node-src/', (eventType, filename) => {
    //console.log(`event type is: ${eventType}`);
    if (filename) {
        //console.log(`filename provided: ${filename}`)
        mergehtml()
        //restartNR()
    }
})


