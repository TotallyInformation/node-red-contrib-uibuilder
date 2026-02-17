// @ts-nocheck
/* eslint-disable jsdoc/no-undefined-types */
/* eslint-disable n/no-unsupported-features/node-builtins */
// ^ This file is browser code, not Node.js - localStorage is a browser API

/** The uibuilder.pageData object is set on load and when navigating
 * You can use it to do your own processing if desired
 * window.pageData is passed in the initial page load, we use that
 *   to drive the initial set.
 * On navigation or server page update notifications, we get the updated
 *   page data from the server in a control msg.
 * The updatePageData() fn is used for further updates of the managed
 *   variable to ensure consistency.
 */
let pageData = window.pageData
uibuilder.set('pageData', pageData)

// The uibuilder log display is controlled by the uibuilder.logLevel variable
const log = uibuilder.log

// The base URL must be specified via a <base> tag in the document head
// It is used to resolve relative links for SPA navigation.
// It is also set on page load as window.baseUrl. It does not change.
const baseUrl = window.baseUrl
console.info('Base URL:', baseUrl, pageData)

// Get references to commonly used elements
const elContent = document.querySelector('[data-fmvar="content"]')
const elSearchInput = /** @type {HTMLInputElement} */ (document.getElementById('search-input'))
const elSearchResults = document.getElementById('search-results')
const elSearchQuery = document.getElementById('search-query')
const elSearchCount = document.getElementById('search-count')
const elSearchDetails = document.getElementById('search-details')
// Note: elShowMeta is NOT cached here because it may be recreated during navigation

// #region --- Utility Functions ---

/** Escape HTML to prevent XSS - returns escaped text (HTML removed)
 * @param {string} text Input text
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Normalize: remove trailing slashes, .md extension, leading slashes, and double slashes
const normalizePath = (p) => {
    if (!p) return ''
    return p
        .replace(/\/+/g, '/') // collapse multiple slashes
        .replace(/^\//, '') // remove leading slash
        .replace(/\/$/, '') // remove trailing slash
        .replace(/\.md$/, '') // remove .md extension
        .replace(/\/index$/, '') // remove trailing /index
        .toLowerCase()
}

/** Update the uibuilder pageData store
 * Also reflect back to window.pageData and the local pageData object for consistency. Log the change
 * @param {object} attributes The page attributes to set
 * @param {object} additionalInfo Any additional info to merge into pageData (e.g. search query)
 * @returns {object} The updated pageData object
 */
function updatePageData(attributes, additionalInfo = {}) {
    const pgData = { ...additionalInfo, ...attributes, }
    uibuilder.set('pageData', pgData )
    window.pageData = pgData
    pageData = pgData
    console.log(`uibuilder.pageData has changed (From: ${pgData.from}): `, pgData)
    // NB: <show-meta> elements will update themselves
    return pgData
}

// #endregion --- Utility Functions ---

// #region --- Sidebar Functionality ---

/** Sidebar controller class - handles toggle, resize, tabs, TOC generation, and state persistence */
class SidebarController {
    isResizing = false

    constructor() {
        /** @type {HTMLElement|null} */
        this.elRoot = document.getElementById('markweb')
        if (!this.elRoot) return
        /** @type {HTMLElement|null} */
        this.sidebar = document.getElementById('sidebar')
        if (!this.sidebar) return

        /** @type {HTMLButtonElement|null} */
        this.elToggle = /** @type {HTMLButtonElement} */ (document.getElementById('sidebar-toggle'))
        /** @type {HTMLInputElement|null} */
        this.toggleInput = this.elToggle.getElementsByTagName('input')[0]
        /** @type {HTMLElement|null} */
        this.resizer = document.getElementById('sidebar-resizer')
        /** @type {HTMLElement|null} */
        this.navTab = document.getElementById('sidebar-tab-nav')
        /** @type {HTMLElement|null} */
        this.tocTab = document.getElementById('sidebar-tab-toc')
        /** @type {HTMLElement|null} */
        this.navPanel = document.getElementById('sidebar-panel-nav')
        /** @type {HTMLElement|null} */
        this.tocPanel = document.getElementById('sidebar-panel-toc')
        /** @type {HTMLElement|null} */
        this.tocContainer = document.getElementById('sidebar-toc')
        /** @type {HTMLInputElement|null} */
        this.searchInput = /** @type {HTMLInputElement} */ (document.getElementById('sidebar-search-input'))
        /** @type {HTMLElement|null} */
        this.searchResults = document.getElementById('sidebar-search-results')

        this.storageKeyOpen = 'uib-sidebar-open'
        this.storageKeyWidth = 'uib-sidebar-width'
        this.storageKeyCollapsed = 'uib-sidebar-collapsed'

        this.init()
    }

    init() {
        this.restoreState()
        this.setupToggle()
        this.setupResizer()
        this.setupTabs()
        this.setupSearch()
        this.generateTOC()
        this.restoreCollapsedStates()
        this.highlightCurrentPage()
    }

    /** Restore sidebar open/closed and width state from localStorage */
    restoreState() {
        // Restore open state or default to open if not set
        this.openClose(localStorage.getItem(this.storageKeyOpen) ?? 'true', true)

        // Restore width
        // const savedWidth = localStorage.getItem(this.storageKeyWidth)
        // if (savedWidth) {
        //     this.sidebar.style.setProperty('--sidebar-width', savedWidth)
        // }
    }

    /** Setup toggle button event */
    setupToggle() {
        if (!this.elToggle) return

        this.toggleInput
            .addEventListener('click', (evt) => {
                this.openClose(!evt.target.checked, false)
            })
    }

    openClose(open, changeInput = false) {
        if (!this.sidebar || !this.elToggle) return

        if (open === true || open === 'true') {
            this.sidebar.classList.remove('closed')
            this.sidebar.dataset.open = 'true'
            this.elToggle.setAttribute('aria-expanded', 'true')
            localStorage.setItem(this.storageKeyOpen, 'true')
            if (changeInput) this.toggleInput.checked = false
        } else {
            this.sidebar.classList.add('closed')
            this.sidebar.dataset.open = 'false'
            this.elToggle.setAttribute('aria-expanded', 'false')
            localStorage.setItem(this.storageKeyOpen, 'false')
            if (changeInput) this.toggleInput.checked = true
        }
    }

    /** Setup resizer drag functionality */
    setupResizer() {
        if (!this.resizer) return

        this.resizer.addEventListener('mousedown', (e) => {
            // Don't start resize if clicking on the toggle
            if (e.target.closest('label') || e.target.closest('input')) {
                return
            }

            this.isResizing = true
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        })

        document.addEventListener('mousemove', (e) => {
            if (!this.isResizing) return

            // Calculate new width based on mouse position
            const newWidth = e.clientX

            // Set min/max constraints
            const minWidth = 0
            const maxWidth = 9999

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                this.elRoot.style.setProperty('--sidebar-min-width', `${newWidth}px`)
                this.elRoot.style.setProperty('--sidebar-max-width', `${newWidth}px`)
            }
        })

        document.addEventListener('mouseup', () => {
            if (this.isResizing) {
                this.isResizing = false
                document.body.style.cursor = ''
                document.body.style.userSelect = ''
            }
        })
    }

    /** Setup tab switching */
    setupTabs() {
        if (!this.navTab || !this.tocTab) return

        const switchTab = (activeTab, activePanel, inactiveTab, inactivePanel) => {
            activeTab.classList.add('active')
            activeTab.setAttribute('aria-selected', 'true')
            activePanel.hidden = false
            activePanel.classList.add('active')

            inactiveTab.classList.remove('active')
            inactiveTab.setAttribute('aria-selected', 'false')
            inactivePanel.hidden = true
            inactivePanel.classList.remove('active')
        }

        this.navTab.addEventListener('click', () => {
            switchTab(this.navTab, this.navPanel, this.tocTab, this.tocPanel)
        })

        this.tocTab.addEventListener('click', () => {
            switchTab(this.tocTab, this.tocPanel, this.navTab, this.navPanel)
        })
    }

    /** Setup sidebar search functionality */
    setupSearch() {
        if (!this.searchInput || !this.searchResults) return

        let searchTimeout = null

        this.searchInput.addEventListener('input', (e) => {
            if (searchTimeout) clearTimeout(searchTimeout)
            const query = /** @type {HTMLInputElement} */ (e.target).value.trim()

            if (query.length < 2) {
                this.searchResults.hidden = true
                return
            }

            // Debounce search
            searchTimeout = setTimeout(() => {
                this.searchResults.innerHTML = '<div style="padding: 0.5rem; color: var(--text3);">Searching...</div>'
                this.searchResults.hidden = false
                // Send search request to server
                uibuilder.sendCtrl({
                    uibuilderCtrl: 'internal',
                    controlType: 'search',
                    query: query,
                    source: 'sidebar',
                })
            }, 300)
        })
    }

    /** Display sidebar search results
     * @param {Array<{ title: string, path: string }>} results Search results
     */
    displaySearchResults(results) {
        if (!this.searchResults) return

        if (!results || results.length === 0) {
            this.searchResults.innerHTML = '<div style="padding: 0.5rem; color: var(--text3);">No results found</div>'
            return
        }

        let html = ''
        results.forEach((item) => {
            html += `<a href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>`
        })
        this.searchResults.innerHTML = html
    }

    /** Generate table of contents from page headings with collapsible sections */
    generateTOC() {
        if (!this.tocContainer) return

        const contentEl = document.querySelector('[data-fmvar="body"]')
        if (!contentEl) return

        const headings = contentEl.querySelectorAll('h2, h3, h4, h5, h6')
        if (headings.length === 0) {
            this.tocContainer.innerHTML = '<p style="padding: 0.5rem; color: var(--text3); font-size: 0.875rem;">No headings found</p>'
            return
        }

        // Build a hierarchical structure from flat headings list
        const getLevel = tag => parseInt(tag.charAt(1), 10)

        // Create a tree structure
        const root = { children: [], level: 1, }
        const stack = [root]

        headings.forEach((heading) => {
            const id = heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '')
            if (!heading.id) heading.id = id

            const level = getLevel(heading.tagName)
            const node = {
                id,
                text: heading.textContent,
                level,
                children: [],
            }

            // Pop stack until we find a parent with lower level
            while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                stack.pop()
            }

            // Add to current parent
            stack[stack.length - 1].children.push(node)
            stack.push(node)
        })

        // Render the tree with details/summary for nodes with children
        const renderTree = (nodes) => {
            if (!nodes || nodes.length === 0) return ''

            let html = '<ul>'
            nodes.forEach((node) => {
                const hasChildren = node.children && node.children.length > 0
                const levelClass = `toc-h${node.level}`

                if (hasChildren) {
                    html += `<li class="${levelClass}">
                        <details open data-toc-id="${node.id}">
                            <summary><a href="#${node.id}">${escapeHtml(node.text)}</a></summary>
                            ${renderTree(node.children)}
                        </details>
                    </li>`
                } else {
                    html += `<li class="${levelClass}"><a href="#${node.id}">${escapeHtml(node.text)}</a></li>`
                }
            })
            html += '</ul>'
            return html
        }

        this.tocContainer.innerHTML = renderTree(root.children)
    }

    /** Restore collapsed state of details elements from localStorage */
    restoreCollapsedStates() {
        const saved = localStorage.getItem(this.storageKeyCollapsed)
        if (!saved) return

        try {
            const collapsedPaths = JSON.parse(saved)
            if (!Array.isArray(collapsedPaths)) return

            const details = this.sidebar.querySelectorAll('details[data-path]')
            details.forEach((detail) => {
                const path = /** @type {HTMLDetailsElement} */ (detail).dataset.path
                // Open all by default, close those in the saved collapsed list
                if (collapsedPaths.includes(path)) {
                    detail.removeAttribute('open')
                } else {
                    detail.setAttribute('open', '')
                }
            })
        } catch (e) {
            // Ignore parse errors
        }

        // Listen for toggle events to save state
        this.sidebar.addEventListener('toggle', (e) => {
            const target = /** @type {HTMLElement} */ (e.target)
            if (target.tagName !== 'DETAILS') return
            this.saveCollapsedState()
        }, true)
    }

    /** Save collapsed state of details elements to localStorage */
    saveCollapsedState() {
        const details = this.sidebar.querySelectorAll('details[data-path]')
        const collapsedPaths = []
        details.forEach((detail) => {
            if (!detail.hasAttribute('open')) {
                collapsedPaths.push(/** @type {HTMLDetailsElement} */ (detail).dataset.path)
            }
        })
        localStorage.setItem(this.storageKeyCollapsed, JSON.stringify(collapsedPaths))
    }

    /** Highlight current page in sidebar navigation */
    highlightCurrentPage() {
        let currentPath = window.location.pathname
        if (currentPath.startsWith(baseUrl)) {
            currentPath = currentPath.slice(baseUrl.length)
        }
        currentPath = normalizePath(currentPath)

        // Remove existing highlights
        this.sidebar.querySelectorAll('.sidebar-active').forEach((el) => {
            el.classList.remove('sidebar-active')
        })

        // Find and highlight current page link
        const links = this.sidebar.querySelectorAll('.sidebar-panel a[href]')
        links.forEach((link) => {
            const href = link.getAttribute('href')
            if (normalizePath(href) === currentPath) {
                // Check if link is inside a summary
                const summary = link.closest('summary')
                if (summary) {
                    summary.classList.add('sidebar-active')
                } else {
                    link.closest('li')?.classList.add('sidebar-active')
                }
                // Expand parent details elements
                let parent = link.closest('details')
                while (parent) {
                    parent.setAttribute('open', '')
                    parent = parent.parentElement?.closest('details')
                }
            }
        })
    }

    /** Update sidebar after navigation
     * @param {object} data Page data from navigation
     */
    update(data) {
        this.generateTOC()
        this.highlightCurrentPage()
    }
}

// Initialize sidebar controller
let sidebarController = null
const initSidebar = () => {
    sidebarController = new SidebarController()
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar)
} else {
    initSidebar()
}

// #endregion --- Sidebar Functionality ---

// TODO: Future feature
// #region --- Checkbox Event Delegation ---
/** Handle checkbox clicks using event delegation to support dynamically added checkboxes.
 * @param {MouseEvent} evt - The click event
 */
const handleCheckboxClick = (evt) => {
    const target = /** @type {HTMLElement} */ (evt.target)
    if (target.matches('input[type="checkbox"]')) {
        const checkbox = /** @type {HTMLInputElement} */ (target)
        const identifier = checkbox.id || checkbox.name || checkbox.className || 'unnamed'
        const checked = checkbox.checked

        // Find associated label text (via for attribute or wrapping label)
        let labelText = ''
        if (checkbox.id) {
            const labelFor = document.querySelector(`label[for="${checkbox.id}"]`)
            if (labelFor) labelText = labelFor.textContent?.trim() || ''
        }
        if (!labelText) {
            const parentLabel = checkbox.closest('label')
            if (parentLabel) labelText = parentLabel.textContent?.trim() || ''
        }

        console.log(`Checkbox clicked: "${identifier}" - label: "${labelText}" - checked: ${checked}`)
        uibuilder.send({
            topic: 'markweb-checkbox-click',
            checkboxId: identifier,
            label: labelText,
            checked: checked,
        })
    }
}

// Attach delegated event listener for all checkboxes (including dynamically added ones)
// ! Disabled for now since this cannot (yet) update the source markdown
// !  nor does it have a local state store to update checkbox states.
// document.addEventListener('click', handleCheckboxClick)
// #endregion --- Checkbox Event Delegation ---

// #region --- SPA Navigation ---
/** @type {HTMLElement|null} */
let nav = null
/** @type {HTMLElement|null} */
let header = null
/** @type {HTMLElement|null} */
let burger = null
/** @type {number} */
let headerBottom = 0
/** @type {boolean} */
let isCollapsed = false

/** Create the burger icon element
 * @returns {HTMLElement} The burger button element
 */
const navCreateBurger = () => {
    const btn = document.createElement('button')
    btn.className = 'menu-burger'
    btn.setAttribute('aria-label', 'Toggle navigation menu')
    btn.setAttribute('aria-expanded', 'false')
    btn.innerHTML = '<span></span><span></span><span></span>'
    return btn
}

/** Update header bottom position (for resize handling)  */
const navHorizontalUpdateHeaderPosn = () => {
    if (header) {
        const rect = header.getBoundingClientRect()
        headerBottom = rect.bottom + window.scrollY
    }
}

/** Handle scroll - collapse/expand nav based on scroll position */
const navHorizontalScroll = () => {
    if (!nav || !burger) return

    const scrollY = window.scrollY
    const shouldCollapse = scrollY > headerBottom

    if (shouldCollapse !== isCollapsed) {
        isCollapsed = shouldCollapse
        nav.classList.toggle('collapsed', shouldCollapse)
        burger.classList.toggle('visible', shouldCollapse)

        // Close menu when un-collapsing
        if (!shouldCollapse) {
            nav.classList.remove('open')
            burger.classList.remove('open')
            burger.setAttribute('aria-expanded', 'false')
        }
    }
}

/** Toggle menu open/closed state */
const navBurgerToggleMenu = () => {
    if (!nav || !burger) return

    const isOpen = nav.classList.toggle('open')
    burger.classList.toggle('open', isOpen)
    burger.setAttribute('aria-expanded', String(isOpen))
}

/** Close the menu */
const navBurgerCloseMenu = () => {
    if (!nav || !burger) return

    nav.classList.remove('open')
    burger.classList.remove('open')
    burger.setAttribute('aria-expanded', 'false')
}

/** Handle clicks outside the menu to close it
 * @param {MouseEvent} evt Click event
 */
const navBurgerClickOutside = (evt) => {
    if (!nav || !burger) return
    if (!isCollapsed || !nav.classList.contains('open')) return

    const target = /** @type {HTMLElement} */ (evt.target)
    if (!nav.contains(target) && !burger.contains(target)) {
        navBurgerCloseMenu()
    }
}

/** Handle mouse leaving the menu area */
const navBurgerMouseLeave = () => {
    if (isCollapsed && nav?.classList.contains('open')) {
        navBurgerCloseMenu()
    }
}

/** Initialise the navigation behaviour */
const navHorizontalInit = () => {
    nav = document.querySelector('nav.horizontal')
    if (!nav) return

    header = document.querySelector('header')

    // Create and insert burger button after nav
    burger = navCreateBurger()
    nav.insertAdjacentElement('afterend', burger)

    // Calculate initial header position
    navHorizontalUpdateHeaderPosn()

    // Event listeners
    window.addEventListener('scroll', navHorizontalScroll, { passive: true, })
    window.addEventListener('resize', () => {
        navHorizontalUpdateHeaderPosn()
        navHorizontalScroll()
    }, { passive: true, })

    burger.addEventListener('click', navBurgerToggleMenu)
    burger.addEventListener('touchstart', (evt) => {
        evt.preventDefault()
        navBurgerToggleMenu()
    }, { passive: false, })

    // Close on click outside
    document.addEventListener('click', navBurgerClickOutside)

    // Close on mouse leave (with delay for UX)
    let leaveTimeout = null
    nav.addEventListener('mouseleave', () => {
        leaveTimeout = setTimeout(navBurgerMouseLeave, 300)
    })
    nav.addEventListener('mouseenter', () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout)
            leaveTimeout = null
        }
    })
    burger.addEventListener('mouseenter', () => {
        if (leaveTimeout) {
            clearTimeout(leaveTimeout)
            leaveTimeout = null
        }
    })

    // Hover to open when collapsed
    burger.addEventListener('mouseenter', () => {
        if (isCollapsed && !nav.classList.contains('open')) {
            navBurgerToggleMenu()
        }
    })

    // Initial check
    navHorizontalScroll()
}

// Initialise when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', navHorizontalInit)
} else {
    navHorizontalInit()
}

/** Initialize multi-level navigation menu with mobile support
 * Handles burger toggle, submenu expansion, keyboard navigation, and edge detection
 */
// function initMenu() {
//     const nav = document.querySelector('.horizontal')
//     const menuToggle = nav?.querySelector('.menu-toggle')
//     const routemenu = nav?.querySelector('.routemenu')

//     if (!nav || !menuToggle || !routemenu) return

//     // Mobile: Toggle menu visibility
//     menuToggle.addEventListener('click', () => {
//         const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true'
//         // @ts-ignore
//         menuToggle.setAttribute('aria-expanded', !isExpanded)
//         // @ts-ignore
//         nav.setAttribute('aria-expanded', !isExpanded)
//     })

//     // Mobile: Handle submenu toggle on click for items with children
//     routemenu.addEventListener('click', (e) => {
//         const isMobile = window.matchMedia('(max-width: 768px)').matches
//         if (!isMobile) return

//         // @ts-ignore
//         const link = e.target.closest('a')
//         const li = link?.closest('li')
//         const hasSubmenu = li?.querySelector(':scope > ul')

//         if (link && hasSubmenu) {
//             e.preventDefault()
//             li.classList.toggle('submenu-open')

//             // Close sibling submenus
//             const siblings = li.parentElement.querySelectorAll(':scope > li.submenu-open')
//             siblings.forEach((sibling) => {
//                 if (sibling !== li) sibling.classList.remove('submenu-open')
//             })
//         }
//     })

//     // Desktop: Detect edge overflow and flip submenus
//     const checkSubmenuOverflow = () => {
//         const submenus = routemenu.querySelectorAll('ul ul')
//         submenus.forEach((submenu) => {
//             submenu.classList.remove('flip-left')
//             const rect = submenu.getBoundingClientRect()
//             if (rect.right > window.innerWidth) {
//                 submenu.classList.add('flip-left')
//             }
//         })
//     }

//     // Check overflow on hover
//     routemenu.addEventListener('mouseenter', checkSubmenuOverflow, true)
//     window.addEventListener('resize', () => {
//         // Reset mobile menu state on resize
//         if (!window.matchMedia('(max-width: 768px)').matches) {
//             nav.setAttribute('aria-expanded', 'false')
//             menuToggle.setAttribute('aria-expanded', 'false')
//             routemenu.querySelectorAll('.submenu-open').forEach((el) => {
//                 el.classList.remove('submenu-open')
//             })
//         }
//         checkSubmenuOverflow()
//     })

//     // Keyboard navigation
//     routemenu.addEventListener('keydown', (e) => {
//         const focusedItem = document.activeElement
//         const li = focusedItem?.closest('li')
//         const hasSubmenu = li?.querySelector(':scope > ul')
//         const isInSubmenu = focusedItem?.closest('ul ul')

//         // @ts-ignore
//         switch (e.key) {
//             case 'ArrowDown':
//                 e.preventDefault()
//                 if (isInSubmenu) {
//                     // Move to next sibling in submenu
//                     const nextItem = li?.nextElementSibling?.querySelector('a')
//                     nextItem?.focus()
//                 } else if (hasSubmenu) {
//                     // Open submenu and focus first item
//                     const firstSubItem = hasSubmenu.querySelector('a')
//                     firstSubItem?.focus()
//                 }
//                 break

//             case 'ArrowUp':
//                 e.preventDefault()
//                 if (isInSubmenu) {
//                     const prevItem = li?.previousElementSibling?.querySelector('a')
//                     if (prevItem) {
//                         prevItem.focus()
//                     } else {
//                         // Go back to parent
//                         const parentLink = li?.closest('ul')
//                             ?.closest('li')
//                             ?.querySelector(':scope > a')
//                         // @ts-ignore
//                         parentLink?.focus()
//                     }
//                 }
//                 break

//             case 'ArrowRight':
//                 e.preventDefault()
//                 if (!isInSubmenu) {
//                     // Move to next top-level item
//                     const nextTopItem = li?.nextElementSibling?.querySelector('a')
//                     nextTopItem?.focus()
//                 } else if (hasSubmenu) {
//                     // Open nested submenu
//                     const firstSubItem = hasSubmenu.querySelector('a')
//                     firstSubItem?.focus()
//                 }
//                 break

//             case 'ArrowLeft':
//                 e.preventDefault()
//                 if (isInSubmenu) {
//                     // Go back to parent
//                     const parentLink = li?.closest('ul')
//                         ?.closest('li')
//                         ?.querySelector(':scope > a')
//                     // @ts-ignore
//                     parentLink?.focus()
//                 } else {
//                     // Move to previous top-level item
//                     const prevTopItem = li?.previousElementSibling?.querySelector('a')
//                     prevTopItem?.focus()
//                 }
//                 break

//             case 'Escape':
//                 // Close any open submenus and mobile menu
//                 nav.setAttribute('aria-expanded', 'false')
//                 menuToggle.setAttribute('aria-expanded', 'false')
//                 // @ts-ignore
//                 menuToggle.focus()
//                 break

//             case 'Enter':
//             case ' ':
//                 if (hasSubmenu && window.matchMedia('(max-width: 768px)').matches) {
//                     e.preventDefault()
//                     li.classList.toggle('submenu-open')
//                 }
//                 break
//         }
//     })

//     // Close mobile menu when clicking outside
//     document.addEventListener('click', (e) => {
//         // @ts-ignore
//         if (!nav.contains(e.target) && nav.getAttribute('aria-expanded') === 'true') {
//             nav.setAttribute('aria-expanded', 'false')
//             menuToggle.setAttribute('aria-expanded', 'false')
//         }
//     })
// }

/** Update active navigation state and parent highlighting
 * @param {string} [currentPath] The current page path (defaults to window.location.pathname)
 */
// function updateActiveNavState(currentPath) {
//     let pathname = currentPath || window.location.pathname

//     // Normalize pathname: if starts with baseUrl, keep as-is; else remove "./" prefix and add baseUrl
//     if (!pathname.startsWith(baseUrl)) {
//         pathname = baseUrl + '/' + pathname.replace(/^\.\//, '')
//     }

//     // Clear all active and parent-active classes first
//     document.querySelectorAll('.routemenu a.active').forEach((a) => {
//         a.classList.remove('active')
//     })
//     document.querySelectorAll('.routemenu li[class*="parent-active"]').forEach((li) => {
//         li.classList.remove('parent-active-1', 'parent-active-2', 'parent-active-3')
//     })

//     // Find matching link
//     let activeLink = null
//     document.querySelectorAll('.routemenu a').forEach((a) => {
//         const href = a.getAttribute('href')
//         if (!href) return

//         // Normalize linkPath: if starts with baseUrl, keep as-is; else remove "./" prefix and add baseUrl
//         let linkPath = href
//         if (!linkPath.startsWith(baseUrl)) {
//             linkPath = baseUrl + '/' + linkPath.replace(/^\.\//, '')
//         }

//         if (normalizePath(pathname) === normalizePath(linkPath)) {
//             activeLink = a
//             a.classList.add('active')
//         }
//     })

//     // TODO Consider having a single ancestor highlight for multiple matches
//     // Apply parent-active classes bubbling up from active item
//     if (activeLink) {
//         // @ts-ignore
//         let parentLi = activeLink.closest('li')?.parentElement?.closest('li')
//         let level = 1
//         while (parentLi && level <= 3) {
//             parentLi.classList.add(`parent-active-${level}`)
//             parentLi = parentLi.parentElement?.closest('li')
//             level++
//         }
//     }
// }

/** Update page data after navigation
 * @param {object} data The page data returned from server
 */
function postDataUpdate(data) {
    // Pseudo-send updated page data to local uib store
    // delete data.body // We don't need body in uibuilder store
    uibuilder.set('pageData', data )
    // const toUrl = data.toUrl || window.location.href
    const toUrl = data.path

    // Update elements with data-fmvar based on response data
    document.querySelectorAll('[data-fmvar]').forEach((el) => {
        // const attr = el.getAttribute('data-fmvar')
        if (el.dataset.fmvar === undefined) return
        const fmvar = el.dataset.fmvar
        // Skip body as it is handled separately
        if (fmvar === 'body') return
        // Look for the var in the data - if it exists, update the element
        if (data[fmvar] !== undefined) {
            // Optional marker to denote meta tags that should update their 'content' attribute instead of innerHTML/textContent
            const isContent = !!el.hasAttribute('content')
            // If el has attribute 'data-replace', switch el to be el's parent element
            if (el.hasAttribute('data-replace')) {
                const parent = el.parentElement
                if (parent) {
                    el = parent
                }
            }
            // Handle meta tags
            if (isContent) {
                el.setAttribute('content', data[fmvar])
            } else {
                // ! TODO: Consider whether we want to use textContent or innerHTML here - if the data can contain HTML, we need innerHTML, but this opens up XSS risks if the data is not sanitized. For now, we'll assume the server sends safe HTML in the data.
                // Everything else
                // el.textContent = data[fmvar]
                el.innerHTML = data[fmvar]
            }
        }
    })
}

/** Handle SPA navigation
 * @param {string} toUrl The URL to navigate to
 * @param {boolean} [addToHistory] Whether to add this navigation to browser history (default: true)
 */
async function navigate(toUrl, addToHistory = true) {
    elContent?.classList.add('loading')
    // Hide search results when navigating
    // elSearchResults.hidden = true
    // elSearchInput.value = ''

    // #region --- Normalize toUrl ---
    // Remove origin from toUrl if present
    const origin = window.location.origin
    toUrl = toUrl.replace(origin, '')
    // Remove baseUrl from toUrl if present at start
    if (toUrl.startsWith(baseUrl)) {
        toUrl = toUrl.slice(baseUrl.length)
    }
    // Extract and preserve hash fragment for client-side scrolling after content loads
    let hashFragment = ''
    if (toUrl.includes('#')) {
        const hashIndex = toUrl.indexOf('#')
        hashFragment = toUrl.slice(hashIndex)
        toUrl = toUrl.slice(0, hashIndex)
    }
    // #endregion --- Normalize toUrl ---

    console.log(`Navigating to: "${uibuilder.urlJoin(window.location.origin, baseUrl, toUrl, hashFragment ? `(hash: ${hashFragment})` : '')}"` )

    // Ask server for new page content via uibuilder control message (see onChange handler below)
    // Pass hashFragment so client can scroll to it after content loads
    uibuilder.sendCtrl({ uibuilderCtrl: 'internal', controlType: 'navigate', toUrl: toUrl, addToHistory: addToHistory, hashFragment: hashFragment, })
}

/** Intercept clicks on links
 * All internal links (without ":" in href) are handled via SPA navigation.
 * Relative links are all assumed to be relative to baseUrl.
 * External links (with ":") are not intercepted.
 */
document.addEventListener('click', (e) => {
    // @ts-ignore
    const link = e.target.closest('a')
    if (link) {
        const href = link.getAttribute('href')
        // If href is external (contains a ":"), do not intercept
        if (!href || href.includes(':')) return

        e.preventDefault()

        // If href starts with "#" (anchor link), handle scrolling with history support
        if (href.startsWith('#')) {
            const targetId = href.slice(1)
            const targetElement = document.getElementById(targetId)
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', })
                // Add to history so back/fwd browser nav works - preserve the current page path
                const currentPath = location.pathname + location.search
                history.pushState({ hash: href, path: currentPath, }, '', currentPath + href)
            }
            return
        }

        if (href.startsWith('./')) navigate(baseUrl + href)
        else {
            if (href.startsWith('/')) navigate(baseUrl + href)
            else navigate(baseUrl + '/' + href)
            // Don't pushState here since navigation might actually fail.
        }
    }
})

// Handle browser back/forward - Track to avoid pushing state during popstate handling
let isHandlingPopstate = false
window.addEventListener('popstate', (evt) => {
    console.log('popstate', !!evt.state?.hash, evt.state)
    // Handle hash-only navigation (anchor links)
    if (evt.state?.hash) {
        const targetId = evt.state.hash.slice(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', })
        }
    } else if (evt.state?.path) {
        // Handle full page navigation
        isHandlingPopstate = true
        navigate(evt.state.path, false)
    }
})

// Set initial state
let initialPath = location.href
// Remove origin
initialPath = initialPath.replace(window.location.origin, '')
// If the initialPath === baseURL without trailing slash, set to baseURL
if (initialPath === baseUrl.replace(/\/$/, '')) {
    initialPath = baseUrl
}
console.log('Setting initial history state:', initialPath, { path: initialPath, status: 'initial load', })
history.replaceState({ path: initialPath, status: 'initial load', }, '', initialPath)

// If the page loaded with a hash, scroll to that element after content is ready
if (location.hash) {
    const scrollToHash = () => {
        const targetId = location.hash.slice(1)
        const targetElement = document.getElementById(targetId)
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', })
        }
    }
    // Use requestAnimationFrame to ensure DOM is ready, with a small delay for content load
    requestAnimationFrame(() => {
        setTimeout(scrollToHash, 100)
    })
}
// #endregion --- SPA Navigation ---

// #region --- Search functionality ---
let searchTimeout = null

// Add event listener to close button
if (elSearchResults) {
    const closeButtons = elSearchResults.querySelectorAll('.search-close')
    closeButtons.forEach((btnClose) => {
        btnClose.addEventListener('click', () => {
            elSearchResults.hidden = true
            elSearchInput.value = ''
            elSearchDetails.innerHTML = ''
            elSearchInput.focus()
        })
    })
}

/** Process and display search results
 * @param {Array<{ title: string, path: string, snippet: string, score?: number }>} data Search results data
 * @param {string} query The search query
 */
function doResults(data, query) {
    if (elSearchQuery) elSearchQuery.textContent = escapeHtml(query)
    // @ts-ignore
    if (elSearchCount) elSearchCount.textContent = data.length
    if (data.length === 0) {
        elSearchDetails.innerHTML = `<p class="no-results">No results found for "${escapeHtml(query)}"</p>`
        elSearchResults.hidden = false
        return
    }

    // Determine the current page path for highlighting
    let currentPath = window.location.pathname
    if (currentPath.startsWith(baseUrl)) {
        currentPath = currentPath.slice(baseUrl.length)
    }
    currentPath = normalizePath(currentPath)

    let html = ''
    data.forEach((item) => {
        // Check if this result matches the current page
        const itemPath = normalizePath(item.path)
        const isCurrentPage = currentPath === itemPath
        const activeClass = isCurrentPage ? ' search-result-active' : ''

        // Build tooltip with score if available
        const scoreTooltip = item.score !== undefined ? `title="Search score: ${item.score.toFixed(2)}"` : ''

        html += `
            <a class="search-result${activeClass}" href="${escapeHtml(item.path)}" ${scoreTooltip}>
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.snippet)}</small>
            </a>
        `
    })
    if (elSearchDetails) elSearchDetails.innerHTML = html
    if (elSearchResults) elSearchResults.hidden = false
}

/** Update search result highlighting based on current page */
function updateSearchResultHighlight() {
    if (elSearchResults.hidden) return

    let currentPath = window.location.pathname
    if (currentPath.startsWith(baseUrl)) {
        currentPath = currentPath.slice(baseUrl.length)
    }
    currentPath = normalizePath(currentPath)

    const resultLinks = elSearchDetails.querySelectorAll('.search-result')
    resultLinks.forEach((link) => {
        const href = link.getAttribute('href')
        if (!href) return
        const linkPath = normalizePath(href)
        if (currentPath === linkPath) {
            link.classList.add('search-result-active')
        } else {
            link.classList.remove('search-result-active')
        }
    })
}

/** Handle input event on search input - ask server for search results
 * Sends an "internal" control message to uibuilder to request search
 */
if (elSearchInput) elSearchInput.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    // @ts-ignore
    const query = e.target.value.trim()
    if (query.length < 2) {
        elSearchResults.hidden = true
        return
    }
    // Debounce search request inputs
    searchTimeout = setTimeout(async () => {
        if (elSearchQuery) elSearchQuery.textContent = escapeHtml(query)
        if (elSearchCount) elSearchCount.textContent = 'N/A'
        if (elSearchDetails) elSearchDetails.innerHTML = '<p class="no-results">Searching...</p>'
        if (elSearchResults) elSearchResults.hidden = false
        console.log(`Requesting search for query: "${query}"`)
        uibuilder.sendCtrl({ uibuilderCtrl: 'internal', controlType: 'search', query: query, })
    }, 300)
})

// Hide search results when clicking outside
// document.addEventListener('click', (e) => {
//     if (!e.target.closest('#search-form')) {
//         searchResults.hidden = true
//     }
// })
// #endregion --- Search functionality ---

/** Watch for search or navigation response from server & show results */
uibuilder.onChange('ctrlMsg', (ctrlMsg) => {
    switch (ctrlMsg.topic) {
        // ! NO LONGER REQUIRED
        // From initial page data request only. No body in this since we already have it
        // case '_page-metadata': {
        //     console.log('Initial page metadata received from server:', ctrlMsg)
        //     updatePageData(ctrlMsg.attributes, { from: '_page-metadata', initialPath: ctrlMsg.initialPath, topic: ctrlMsg.topic, })
        //     break
        // }

        case '_search-results': {
            console.log('Search results received from server:', ctrlMsg)
            if (ctrlMsg.error) {
                // Handle error for main search
                if (elSearchQuery) elSearchQuery.textContent = escapeHtml(ctrlMsg.query)
                if (elSearchCount) elSearchCount.textContent = 'N/A'
                if (elSearchDetails) elSearchDetails.innerHTML = '<p class="no-results">Search error: ' + escapeHtml(ctrlMsg.error) + '</p>'
                if (elSearchResults) elSearchResults.hidden = false
                // Handle error for sidebar search
                if (sidebarController && ctrlMsg.source === 'sidebar') {
                    sidebarController.displaySearchResults([])
                }
                return
            }
            const data = ctrlMsg.results ?? []

            // Route to sidebar search if source is sidebar
            if (ctrlMsg.source === 'sidebar' && sidebarController) {
                sidebarController.displaySearchResults(data)
            } else {
                // Default: main search results
                doResults(data, ctrlMsg.query)
            }
            console.log(`Displayed ${data.length} search results for query "${ctrlMsg.query}"`, data)

            break
        }

        // Received when server detects an index change (e.g. file added/removed)
        // Used to trigger updates of any indexListings via use of `uib-topic="_indexes-changed"`
        case '_indexes-changed': {
            console.log('Indexes changed on server.', ctrlMsg)
            break
        }

        // If the server watch fn detects a config file change, reload the current page
        case '_config-change': {
            console.log('Config file changed on server, reloading current page.', ctrlMsg)
            // Reload the current page to pick up any config changes
            if (pageData?.toUrl) {
                navigate(pageData.toUrl, false)
            } else {
                // Fallback: reload the page if pageData is not available
                window.location.reload()
            }
            break
        }

        // If the server watch fn detects a file/folder change
        case '_source-change': {
            console.log('Source changed on server.', { ctrlMsg, pageData, })
            if (ctrlMsg.payload.url === pageData.toUrl) {
                console.log('Current page affected by source change, reloading page content.')
                navigate(pageData.toUrl, false)
            }
            break
        }

        case '_page-navigation-result': {
            // What is the current page url?
            const currentPageUrl = window.location.pathname

            if (ctrlMsg.error) {
                // TODO Handle not found
                console.error('Error during page navigation:', ctrlMsg.error)
                return
            }
            const data = updatePageData(ctrlMsg.attributes ?? {}, { from: '_page-navigation-result', initialPath: '', topic: ctrlMsg.topic, hashFragment: ctrlMsg.hashFragment, })
            console.log(
                `Page change from ${ctrlMsg.from} (${data.from}):`,
                ` Old url: ${currentPageUrl}, New url: ${data.toUrl}.`,
                ctrlMsg
            )
            // TODO: Sanitize data.body for safety
            // TODO: Should {{...}} replacements be done here? Instead of on server?
            // if (elContent) elContent.innerHTML = data.content || '<p>No content</p>'
            // else console.error('Content element not found to update page content.')

            // Remove trailing slash from baseUrl and include hash fragment if present
            const hashFragment = ctrlMsg.hashFragment || ''
            const newUrl = baseUrl.replace(/\/$/, '') + data.path + hashFragment

            // Only push to history if not handling popstate and server says to add to history
            // console.log('pushState:', newUrl, 'addToHistory:', ctrlMsg.addToHistory, 'isHandlingPopstate:', isHandlingPopstate)
            if (ctrlMsg.addToHistory === true && !isHandlingPopstate) {
                history.pushState(
                    { path: newUrl, hash: hashFragment || undefined, status: 'SPA page change', },
                    '', newUrl
                )
            }

            // If there's a hash fragment, scroll to that element after content is rendered
            if (hashFragment) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const targetId = hashFragment.slice(1) // Remove leading #
                        const targetElement = document.getElementById(targetId)
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', })
                        }
                    }, 100)
                })
            } else {
                // Scroll to top on page navigation if no hash fragment
                window.scrollTo({ top: 0, behavior: 'smooth', })
            }

            // Reset the popstate flag after processing
            isHandlingPopstate = false

            // Update active nav link(s) and parent indicators
            // updateActiveNavState(data.path)

            // Update search result highlighting to reflect current page
            updateSearchResultHighlight()

            // Update sidebar TOC and current page highlight
            if (sidebarController) {
                sidebarController.update(data)
            }

            break
        }

        default: {
            // Ignore other control messages
            break
        }
    }
})

// Initialize menu on DOM ready
// initMenu()
// Set initial active state on page load
// updateActiveNavState()
