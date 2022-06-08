// #!/usr/bin/env node

/** docsify-auto-sidebar -d docs
 * Generates a new _sidebar.md for docsify. 
 * You can prefix directories with a number and a dash to control the ordering, the number and dash will not appear in the sidebar text. For example:
 *
 * 1-Guides
 * 2-API
 * will result with "Guides" and "API" items in the sidebar.
 *
 * Other dashes will be replaced with spaces
 */

'use strict'

// function __importStar(mod) {
//     if (mod && mod.__esModule) return mod
//     const result = {}
//     if (mod != null) {
//         for (const k in mod) {
//             if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
//         }
//     }
//     result['default'] = mod
//     return result
// }

// Object.defineProperty(exports, '__esModule', { value: true })

// const fs = __importStar(require('fs'))
// const path = __importStar(require('path'))
// const yargs = __importStar(require('yargs'))
const fs = require('fs-extra')
const path = require('path')
const yargs = require('yargs')

const ignores = /node_modules|^\.|_sidebar|_docsify/
const isDoc = /.md$/

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}
function titleCase2(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

function niceName(name) {
    const splitName = titleCase(name).split('-')
    if (Number.isNaN(Number(splitName[0]))) {
        return splitName.join(' ')
    }
    return splitName.slice(1).join(' ')
}

function buildTree(dirPath, name = '', dirLink = '') {
    const children = []
    for (const fileName of fs.readdirSync(dirPath)) {
        if (ignores.test(fileName)) {
            continue
        }
        const fileLink = dirLink + '/' + fileName
        const filePath = path.join(dirPath, fileName)
        if (fs.statSync(filePath).isDirectory()) {
            const sub = buildTree(filePath, fileName, fileLink)
            if (sub.children != null && sub.children.length > 0) {
                children.push(sub)
            }
        } else if (isDoc.test(fileName)) {
            children.push({ name: fileName, link: fileLink })
        }
    }
    return { name: name, children: children, link: dirLink }
}

function renderToMd(tree, linkDir = false) {
    if (!tree.children) {
        return `- [${niceName(path.basename(tree.name, '.md'))}](${tree.link.replace(/ /g, '%20')})`
    }
    else {
        const fileNames = new Set(tree.children.filter(c => !c.children).map(c => c.name))
        const dirNames = new Set(tree.children.filter(c => c.children).map(c => c.name + '.md'))
        const content = tree.children
            .filter(c => (!fileNames.has(c.name) || !dirNames.has(c.name)) && c.name !== 'README.md')
            .map(c => renderToMd(c, dirNames.has(c.name + '.md') && fileNames.has(c.name + '.md')))
            .join('\n')
            .split('\n')
            .map(item => '  ' + item)
            .join('\n')
        let prefix = ''
        if (tree.name) {
            if (linkDir || fileNames.has('README.md')) {
                let linkPath = tree.link.replace(/ /g, '%20')
                if (fileNames.has('README.md')) {
                    linkPath += '/README.md'
                }
                prefix = `- [${niceName(path.basename(tree.name, '.md'))}](${linkPath})\n`
            } else {
                prefix = `- ${niceName(tree.name)}\n`
            }
        }
        return prefix + content
    }
}

const args = yargs
    .wrap(yargs.terminalWidth() - 1)
    .usage('$0 [-d docsDir] ')
    .options({
        docsDir: {
            alias: 'd',
            type: 'string',
            describe: 'Where to look for the documentation (defaults to docs subdir of repo directory)'
        }
    }).argv

const dir = path.resolve(process.cwd(), args.docsDir || './docs')

try {
    const root = buildTree(dir)
    fs.writeFileSync(path.join(dir, '_sidebar_auto.md'), renderToMd(root))
} catch (e) {
    throw new Error(`Unable to generate sidebar for directory ${dir}. ${e.message}`)
}
