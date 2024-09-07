// @ts-nocheck
'use strict'

window.$docsify = { //  eslint-disable-line no-undef
    loadSidebar: '.config/sidebar.md',
    name: 'UIBUILDER Documentation v7',
    repo: 'TotallyInformation/node-red-contrib-uibuilder',
    // coverpage: true,
    coverpage: '.config/coverpage.md',
    onlyCover: false,
    // homepage: 'README.md',

    executeScript: true,
    // loadNavbar: true,
    // mergeNavbar: true,
    autoHeader: false,
    logo: '/images/node-lblue-125x125.png',
    auto2top: true,
    alias: {
        // Moved pages
        '/dev/socket-js.*': '/dev/server-libs/socket.md',
        '/dev/tilib-js.*': '/dev/server-libs/tilib.md',
        '/dev/uiblib-js.*': '/dev/server-libs/uiblib.md',
        '/dev/web-js.*': '/dev/server-libs/web.md',
        // '/roadmap.*': '/roadmap/readme.md',

        '.*?/.config/(.*)': '/.config/$1',
        '.*?/images/(.*)': '/images/$1',
        '.*?/changelog': 'https://raw.githubusercontent.com/TotallyInformation/node-red-contrib-uibuilder/main/CHANGELOG.md',
        '.*?/uibhome': 'https://raw.githubusercontent.com/TotallyInformation/node-red-contrib-uibuilder/main/README.md',
        '/docs/(.*)': '/$1',
    },
    subMaxLevel: 1,
    search: {
        depth: 3,
        noData: 'No results!',
        placeholder: 'Search...'
    },
    pagination: {
        crossChapter: true,
        crossChapterText: true,
    },
    // notFoundPage: true,
    notFoundPage: '.config/404.md',
    toc: {
        // tocMaxLevel: 5,
        // target: 'h2, h3, h4, h5'
        // -- --
        // scope: '.markdown-section',
        // headings: 'h2, h3, h4, h5',
        // title: 'Table of Contents',
        // https://github.com/justintien/docsify-plugin-toc
        tocMaxLevel: 3,
        target: 'h2, h3',
        ignoreHeaders:  ['<!-- {docsify-ignore} -->', '<!-- {docsify-ignore-all} -->']
    },

    plugins: [
        // My custom plugin
        function ti(hook, vm) {
            // console.log({hook,vm})

            const orgName = 'Julian Knight (Totally Information)'
            const orgUrl = 'https://it.knightnet.org.uk'

            const footer = [
                '<hr/>',
                '<footer>',
                '<span>',
                `Copyright &copy; ${(new Date()).getFullYear()}`, // per-page - (c) and date
                ` <a href="${orgUrl}">${orgName}</a>.`,
                '', // updated date - {docsify-updated} variable could have been used
                '</span> ',
                '',
                ' <span>Published with <a href="https://docsify.js.org/" target="_blank">docsify</a>.</span> ',
                '</footer>'
            ]

            // Runs against the raw markdown for each page
            hook.beforeEach(function (content) {
                content = content.replace(/-UIBUILDER-/g, '<span class="uib-name"><span class="uib-red">UI</span>BUILDER</span>')
                let mydate = new Date()
                let strYr = mydate.getFullYear()
                let yearFrom = 2017
                let yearTo = strYr
                footer[5] = ''

                if (vm.frontmatter) { // vm only exists per page, requires plugin
                    //#region --- Add front-matter (YAML) standard metadata to each page if present ---
                    if (vm.frontmatter.description) {
                        content = `${vm.frontmatter.description}\n\n${content}`
                    }

                    if (vm.frontmatter.status) {
                        content = `> Status: ${vm.frontmatter.status}\n\n${content}`
                    }

                    if (vm.frontmatter.title) {
                        content = `# ${vm.frontmatter.title}\n\n${content}`
                    }
                    //#endregion ---  ---

                    //#region --- Add page specific (c) and last updated date to each page if available from YAML front-matter ---
                    if (vm.frontmatter.created) { // uib docs/Obsidian
                        mydate = new Date(vm.frontmatter.created)
                        yearFrom = mydate.getFullYear()
                    } else if (vm.frontmatter.date) { // Hugo
                        mydate = new Date(vm.frontmatter.date)
                        yearFrom = mydate.getFullYear()
                    }

                    if (vm.frontmatter.updated) { // Obsidian
                        mydate = new Date(vm.frontmatter.updated)
                        yearTo = mydate.getFullYear()
                    } else if (vm.frontmatter.lastUpdated) { // uib/IT Stds docs
                        mydate = new Date(vm.frontmatter.lastUpdated)
                        yearTo = mydate.getFullYear()
                    } else if (vm.frontmatter.Lastmod) { // Hugo
                        mydate = new Date(vm.frontmatter.Lastmod)
                        yearTo = mydate.getFullYear()
                    }

                    if (yearFrom === yearTo && yearFrom !== Number(strYr)) {
                        strYr = yearFrom
                    } else if (yearFrom !== yearTo) {
                        strYr = yearFrom + '-' + yearTo
                    }

                    footer[5] = ` Updated ${mydate.toLocaleString('en-GB', { dateStyle: 'medium' })}.`
                    //#endregion ---  ---

                } // ---- End of if front-matter ---- //

                footer[3] = `Copyright &copy; ${strYr}`

                return content

            }) // ------- End of Custom Plugin ------- //

            // Runs against the rendered HTML for each page
            hook.afterEach(function (html, next) {
                html = html.replace(/UIBUILDER/g, '<span class="uib-name"><span class="uib-red">UI</span>BUILDER</span>')
                next(html + footer.join(''))
            })
        },

        // function toc(hook, vm) {
        //     hook.mounted(function () {
        //         const content = window.Docsify.dom.find('.content')
        //         if (content) {
        //             const pgtoc = window.Docsify.dom.create('aside', '')
        //             window.Docsify.dom.appendTo(content, pgtoc)
        //             const pgtoc2 = window.Docsify.dom.find('.content > aside')
        //             pgtoc2.innerHTML = '<div>Content</div>'
        //             // console.log(pgtoc2)
        //         }
        //     })
        // },

        // lyingdragon/docsify-plugin-page-toc - amended
        // function toc(hook, vm) {
        //     hook.mounted(function () {
        //         // const content = window.Docsify.dom.find('main')
        //         const content = window.Docsify.dom.find('.content')
        //         if (content) {
        //             const nav = window.Docsify.dom.create('aside', '')
        //             window.Docsify.dom.toggleClass(nav, 'add', 'pgnav')
        //             window.Docsify.dom.appendTo(window.Docsify.dom.find('main'), nav)
        //             // window.Docsify.dom.before(content, nav)
        //         }
        //     })
        //     hook.doneEach(function () {
        //         const nav = window.Docsify.dom.find('.pgnav')
        //         if (nav) {
        //             nav.innerHTML = pageToC().trim()
        //             if (nav.innerHTML === '') {
        //                 window.Docsify.dom.toggleClass(nav, 'add', 'nothing')
        //             } else {
        //                 window.Docsify.dom.toggleClass(nav, 'remove', 'nothing')
        //             }
        //         }
        //     })
        // },
    ],
}

//#region --- lyingdragon/docsify-plugin-page-toc ---

// To collect headings and then add to the page ToC
const pageToC = (headings, path) => {
    const list = []
    // let toc = ['<div class="page_toc">', '<p class="title">Contents</p>']
    let toc = [
        '<div class="page_toc">',
        '<h2>Page Contents</h2>', 
        // '<ul class="">'
    ]
    headings = document.querySelectorAll(`.markdown-section ${window.$docsify['toc'].target}`)

    if (headings) {
        let prevLevel = -1
        headings.forEach(function (heading) {
            const level = heading.tagName.replace(/h/gi, '')
            if (level === 0 || level > window.$docsify['toc'].tocMaxLevel) return

            let newLevel = ''
            if (level > prevLevel) newLevel = 'new'
            else if (level < prevLevel) newLevel = 'end'
            console.log('level: ', level, newLevel)
            const item = generateToC(level, newLevel, heading.innerHTML)
            if (item) list.push(item)
            prevLevel = level
        })
    }

    if (list.length > 0) {
        toc = toc.concat(list)
        toc.push('</div>')
        // toc.push('</ul>')
        return toc.join('')
    } else {
        return ''
    }
}

// To generate each ToC item
const generateToC = (level, newLevel, html) => {
    let out = ''
    // out = ['<div class="lv' + level + '">', html, '</div>'].join('')
    // out = ['<li class="lv' + level + '">', html, '</li>'].join('')

    if (newLevel === 'new') {
        out = [
            // `<li class="lv${oldLevel}">`, // ???
            `<ul class="lv${level}"><li>${html}</li>`,
            // ${html},
            // `</ul>`,
            // `</li>`,
        ].join('')
    } else if (newLevel === 'end') {
        out = [
            `<li>${html}</li>`,
            `</ul>`,
        ].join('')
    } else {
        out = `<li>${html}</li>`
    }

    return out
}

//#endregion --- lyingdragon/docsify-plugin-page-toc ---
