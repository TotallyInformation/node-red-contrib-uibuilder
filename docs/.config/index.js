// @ts-nocheck
'use strict'

window.$docsify = {
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
        '/roadmap/': '/roadmap/readme.md',

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
        placeholder: 'Search...',
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
        ignoreHeaders: ['<!-- {docsify-ignore} -->', '<!-- {docsify-ignore-all} -->'],
    },

    plugins: [
        // Tips plugin - displays random or specific tips from tips folder
        function tipsPlugin(hook, vm) {
            const tipsCache = new Map()
            const tipsList = []
            const rotatingTips = new Set()
            let rotateInterval = null
            const tipsFiles = [
                'Browser and Node-RED are different contexts.md',
                'Compare uibuilder with Dashboard 2.md',
                'Creating a Single Page App.md',
                'Front-end templates.md',
                'Messages to the UI are automatically filtered.md',
                'No-code output is low-code.md',
                'Send messages to Node-RED from the browser.md',
                'Send to UI from a function node.md',
                'uibuilder node outputs.md',
                'Where are my files.md'
            ]
            // get current page url
            const currentPage = `${window.location.origin}${window.location.pathname}`
            // get current hash
            const currentHash = window.location.hash.replace('#/', '').split('/')
            currentHash.pop() // remove last element (the page)
            let prefix = '/'
            if (currentHash.length > 0) {
                prefix = '../'.repeat(currentHash.length)
            }
            const tipsFolder = `${prefix}tips/`

            /** Safely get a single tip file
             * @param {string} filename - The tip filename to load
             * @returns {string} The markdown content or error message
             */
            const getSingleTipFile = (filename) => {
                try {
                    const url = `${currentPage}/${tipsFolder}${encodeURIComponent(filename)}`
                    // Use XMLHttpRequest for better browser compatibility
                    const xhr = new XMLHttpRequest()
                    xhr.open('GET', url, false)
                    xhr.send()

                    if (xhr.status === 200) {
                        const content = xhr.responseText
                        // console.log('Tips plugin: Loaded tip file', url, content)
                        // Remove front matter and extract tip content
                        return content.replace(/^---[\s\S]*?---\n/, '').trim()
                        // console.log('Tips plugin: frontMatter?', window.$docsify.frontMatter.parseMarkdown(content))
                        // return content
                    }
                    return `**Tip Not Found**: Could not load tip file: "tips/${filename}"`
                } catch (error) {
                    console.warn(`Failed to load tip file: "tips/${filename}"`, error)
                    return `**Tip Not Found**: Could not load tip file: "tips/${filename}" (${error.message || 'Unknown error'})`
                }
            }

            // Load all tips from the tips folder
            const loadTips = async () => {
                if (tipsList.length > 0) return tipsList

                try {
                    for (const file of tipsFiles) {
                        if (!tipsCache.has(file)) {
                            try {
                                // Use XMLHttpRequest for better browser compatibility
                                const xhr = new XMLHttpRequest()
                                xhr.open('GET', `${tipsFolder}${encodeURIComponent(file)}`, false)
                                xhr.send()

                                if (xhr.status === 200) {
                                    const content = xhr.responseText
                                    // Remove front matter and extract tip content
                                    const tipContent = content.replace(/^---[\s\S]*?---\n/, '').trim()
                                    const tipTitle = file.replace('.md', '')
                                    tipsCache.set(file, { title: tipTitle, content: tipContent, })
                                    tipsList.push({ file, title: tipTitle, content: tipContent, })
                                }
                            } catch (error) {
                                console.warn(`Failed to load tip: ${file}`, error)
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Failed to load tips:', error)
                }

                return tipsList
            }

            /** Get a random tip from the available tips
             * @returns {object|null} Random tip object or null if no tips available
             */
            const getRandomTip = () => {
                if (tipsFiles.length === 0) return null
                return tipsFiles[Math.floor(Math.random() * tipsFiles.length)]
            }

            /** Start the rotation timer for rotating tips */
            const startRotationTimer = () => {
                if (rotateInterval) return // Already running

                rotateInterval = setInterval(() => {
                    rotatingTips.forEach((tipId) => {
                        // console.log('Rotating tip:', tipId)
                        const randomTip = getRandomTip()
                        if (randomTip) {
                            const tipMarkdown = getSingleTipFile(randomTip)
                            // Replace the DOM content of the div having an id of the tipId, with HTML from tipMarkdown
                            const tipElement = document.getElementById(tipId)
                            if (tipElement) {
                                // Convert markdown to HTML using Docsify's internal function
                                tipElement.innerHTML = `
                                    <div class="alert callout tip">
                                        <p class="title"><span class="icon icon-tip"></span>Tip <span style="color:darkgrey;font-size:small;">&nbsp;&nbsp;(Changes every 15sec)</span></p>
                                        <p>
                                            <em>${randomTip.replace('.md', '').replace('uibuilder','<span class="uib-name"><span class="uib-red">UI</span>BUILDER</span>')}</em>
                                        </p><p>
                                            ${window.marked(tipMarkdown)}
                                        </p>
                                    </div>
                                `
                            }
                        }
                    })
                }, 15000) // 60 seconds = 1 minute
            }

            // Process tip shortcodes in markdown
            hook.beforeEach(function (content) {
                // Ensure content is a string
                if (typeof content !== 'string') {
                    console.warn('Tips plugin: content is not a string, skipping processing')
                    return content
                }

                // Look for tip shortcodes: [tip] or [tip:filename] or [tip:random] or [tip:rotate]
                const tipRegex = /\[tip(?::([^\]]+))?\]/g
                let match
                const replacements = []

                while ((match = tipRegex.exec(content)) !== null) {
                    const [fullMatch, tipParam] = match
                    replacements.push({ match: fullMatch, param: tipParam, })
                }

                if (replacements.length > 0) {
                    // loadTips()

                    for (const { match, param, } of replacements) {
                        let tipMarkdown = ''
                        let tipType = 'tip'
                        let tipTitle = ''
                        let tipFile = ''
                        const tipId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // eslint-disable-line @stylistic/newline-per-chained-call

                        if (!param || param === 'random') {
                            // Show random tip using Docsify include
                            const randomTip = getRandomTip()
                            if (randomTip) {
                                tipType = 'random-tip'
                                tipFile = randomTip
                                tipTitle = randomTip.replace('.md', '')
                                tipMarkdown = getSingleTipFile(randomTip)
                            }
                        } else if (param === 'rotate') {
                            // Show rotating tip with unique ID (will be handled by afterEach for rotation)
                            const randomTip = getRandomTip()
                            if (randomTip) {
                                tipType = 'rotating-tip'
                                tipFile = randomTip
                                tipTitle = randomTip.replace('.md', '')
                                rotatingTips.add(`${tipType}-${tipId}`)
                                tipMarkdown = getSingleTipFile(randomTip)
                            }
                        } else {
                            // Show specific tip by filename
                            if (param.endsWith('.md')) {
                                tipFile = param
                                tipTitle = param.replace('.md', '')
                            } else {
                                tipFile = `${param}.md`
                                tipTitle = param
                            }
                            tipMarkdown = getSingleTipFile(tipFile)
                        }

                        content = content.replace(match, `

<div id="${tipType}-${tipId}" class="doctips doc${tipType}" title="${tipTitle}">
<div class="alert callout tip">
    <p class="title"><span class="icon icon-tip"></span>Tip <span style="color:darkgrey;font-size:small;">&nbsp;&nbsp;(Changes every 15sec)</span></p>
    <p>
        <em>${tipTitle}</em>
    </p><p>
        ${tipMarkdown}
    </p>
</div>
</div>
`
                        )
                    }
                }

                return content
            })

            /*
                <div id="rotating-tip-1757693356981-9gqwlggao" class="doctips docrotating-tip" title="Compare uibuilder with Dashboard 2">
                    <div class="alert callout tip">
                        <p class="title"><span class="icon icon-tip"></span>Tip</p>
                        <p>
                            <em><span class="uib-name"><span class="uib-red">UI</span>BUILDER</span> node outputs</em>
                        </p>
                        <p></p>
                        <p>
                            Blah blah
                        </p>
                        <p></p>
                    </div>
                </div>
            */

            // Start rotation timer after page content is loaded
            hook.doneEach(() => {
                if (rotatingTips.size > 0) {
                    startRotationTimer()
                }
            })
        },

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
                // content = content.replace(/-UIBUILDER-/g, '<span class="uib-name"><span class="uib-red">UI</span>BUILDER</span>')
                let mydate = new Date()
                let strYr = mydate.getFullYear()
                let yearFrom = 2017
                let yearTo = strYr
                footer[5] = ''

                if (vm.frontmatter) { // vm only exists per page, requires plugin
                    const fm = vm.frontmatter
                    // #region --- Add front-matter (YAML) standard metadata to each page if present ---
                    if (fm.description) {
                        content = `${fm.description}\n\n${content}`
                        // Update the output page's description meta tag
                        const desc = document.querySelector('meta[name="description"]')
                        if (desc) desc.setAttribute('content', fm.description)
                    }

                    if (fm.status) {
                        content = `> Status: ${fm.status}\n\n${content}`
                    }

                    if (fm.title) {
                        content = `# ${fm.title}\n\n${content}`
                    }
                    // #endregion ---  ---

                    // #region --- Add page specific (c) and last updated date to each page if available from YAML front-matter ---
                    if (fm.created) { // uib docs/Obsidian
                        mydate = new Date(fm.created)
                        yearFrom = mydate.getFullYear()
                    } else if (fm.date) { // Hugo
                        mydate = new Date(fm.date)
                        yearFrom = mydate.getFullYear()
                    }

                    if (fm.updated) { // Obsidian
                        mydate = new Date(fm.updated)
                        yearTo = mydate.getFullYear()
                    } else if (fm.lastUpdated) { // uib/IT Stds docs
                        mydate = new Date(fm.lastUpdated)
                        yearTo = mydate.getFullYear()
                    } else if (fm.Lastmod) { // Hugo
                        mydate = new Date(fm.Lastmod)
                        yearTo = mydate.getFullYear()
                    }

                    if (yearFrom === yearTo && yearFrom !== Number(strYr)) {
                        strYr = yearFrom
                    } else if (yearFrom !== yearTo) {
                        strYr = yearFrom + '-' + yearTo
                    }

                    footer[5] = ` Updated ${mydate.toLocaleString('en-GB', { dateStyle: 'medium', })}.`
                    // #endregion ---  ---
                } // ---- End of if front-matter ---- //

                footer[3] = `Copyright &copy; ${strYr}`

                return content
            }) // ------- End of Custom Plugin ------- //

            // Runs against the rendered HTML for each page
            hook.afterEach(function (html, next) {
                // html = html.replace(/UIBUILDER/g, '<span class="uib-name"><span class="uib-red">UI</span>BUILDER</span>')
                next(html + footer.join(''))
            })

            hook.doneEach(() => {
                // Make top-level sidebar list items with nested lists collapsible
                const sidebar = document.querySelector('.sidebar-nav > ul')
                if (sidebar) {
                    const STORAGE_KEY = 'uib-docs-sidebar-state'

                    /** Get saved sidebar state from localStorage
                     * @returns {Object} Saved state object or empty object
                     */
                    const getSavedState = () => {
                        try {
                            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
                        } catch (e) {
                            return {}
                        }
                    }

                    /** Save sidebar state to localStorage
                     * @param {string} sectionId - The section identifier
                     * @param {boolean} isOpen - Whether the section is open
                     */
                    const saveState = (sectionId, isOpen) => {
                        try {
                            const state = getSavedState()
                            state[sectionId] = isOpen
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
                        } catch (e) {
                            console.warn('Failed to save sidebar state:', e)
                        }
                    }

                    /** Generate a stable ID from section text content
                     * @param {HTMLElement} summaryEl - The summary element
                     * @returns {string} A stable identifier for the section
                     */
                    const getSectionId = (summaryEl) => {
                        // Use text content, trimmed and lowercased, as the key
                        return summaryEl.textContent
                            .trim().toLowerCase()
                            .replace(/\s+/g, '-')
                    }

                    const savedState = getSavedState()

                    // Get all top-level list items
                    const topLevelItems = sidebar.querySelectorAll(':scope > li')
                    topLevelItems.forEach((li) => {
                        const nestedList = li.querySelector(':scope > ul')
                        // Only convert items that have a nested list (sections with children)
                        if (nestedList) {
                            // Check if already converted to details
                            if (li.querySelector(':scope > details')) return

                            // Get the text/link content (everything before the nested ul)
                            const summaryContent = []
                            const childNodes = Array.from(li.childNodes)
                            for (const node of childNodes) {
                                if (node === nestedList) break
                                summaryContent.push(node.cloneNode(true))
                            }

                            // Create details/summary structure
                            const details = document.createElement('details')
                            const summary = document.createElement('summary')
                            summaryContent.forEach((node) => summary.appendChild(node))

                            // Generate section ID and check saved state
                            const sectionId = getSectionId(summary)
                            // Default to open if no saved state exists
                            const isOpen = savedState.hasOwnProperty(sectionId) ? savedState[sectionId] : true
                            details.open = isOpen

                            // Add toggle event listener to save state
                            details.addEventListener('toggle', () => {
                                saveState(sectionId, details.open)
                            })

                            details.appendChild(summary)
                            details.appendChild(nestedList)

                            // Clear the li and add the details element
                            li.innerHTML = ''
                            li.appendChild(details)
                        }
                    })
                }

                // Scroll active link into view
                const activeLink = document.querySelector('.sidebar-nav li.active')
                if (activeLink) {
                    activeLink.scrollIntoView({ behavior: 'smooth', block: 'center', })
                }
            })

            // Invoked on each page load after new HTML has been appended to the DOM
            // hook.doneEach(() => {
            //     // replace the <title> tag
            //     document.title = document.title.replace(/<title>(.*?)<\/title>/, '<title>UIBUILDER: $1')
            // })

            // Hooks: [ "init", "mounted", "beforeEach", "afterEach", "doneEach", "ready" ]
        },
    ],
}
