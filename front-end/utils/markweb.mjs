/** The uibuilder.pageData object is set on load and when navigating
 * You can use it to do your own processing if desired
 */
let pageData
uibuilder.onChange('pageData', (newPageData) => {
    console.log(`uibuilder.pageData has changed (${newPageData.from}): `, newPageData)
    pageData = newPageData
    // If <show-meta> component is present, update its metadata
    if (elShowMeta) elShowMeta.metadata = pageData || {}
})

const log = uibuilder.log

// The base URL must be specified via a <base> tag in the document head
// It is used to resolve relative links for SPA navigation
const baseUrl = document.querySelector('base')?.getAttribute('href') || null
if (!baseUrl) {
    log('error', 'SETUP', 'No <base> tag found in document head. SPA navigation may not work correctly.')
}
console.info('Base URL:', baseUrl)

// Get references to commonly used elements
// const elContent = document.getElementById('content')
const elContent = document.querySelector('[data-attribute="body"]')
const elSearchInput = /** @type {HTMLInputElement} */ (document.getElementById('search-input'))
const elSearchResults = document.getElementById('search-results')
const elSearchQuery = document.getElementById('search-query')
const elSearchCount = document.getElementById('search-count')
const elSearchDetails = document.getElementById('search-details')
const elShowMeta = document.querySelector('show-meta')

// #region --- Utility Functions ---
// Normalize: remove trailing slashes, .md extension, leading slashes, and double slashes
const normalizePath = p => {
    if (!p) return ''
    return p
        .replace(/\/+/g, '/') // collapse multiple slashes
        .replace(/^\//, '') // remove leading slash
        .replace(/\/$/, '') // remove trailing slash
        .replace(/\.md$/, '') // remove .md extension
        .replace(/\/index$/, '') // remove trailing /index
        .toLowerCase()
}

/** Escape HTML to prevent XSS - returns escaped text (HTML removed)
 * @param {string} text Input text
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}
// #endregion --- Utility Functions ---

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
    header = document.querySelector('header')

    if (!nav) {
        console.warn('[markweb-nav] No nav.horizontal element found')
        return
    }

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

    // Update elements with data-attribute based on response data
    document.querySelectorAll('[data-attribute]').forEach((el) => {
        const attr = el.getAttribute('data-attribute')
        if (attr === 'body') return // Skip body as it is handled separately
        if (attr && data[attr] !== undefined) {
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
                el.setAttribute('content', data[attr])
            } else {
                // Everything else
                // el.textContent = data[attr]
                el.innerHTML = data[attr]
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

    console.log(`Navigating to: "${toUrl}"`, hashFragment ? `(hash: ${hashFragment})` : '', baseUrl, window.location.origin)

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
} else {
    console.warn('⚠️ Search results element not found.')
}

/** Process and display search results
 * @param {Array<{ title: string, path: string, snippet: string, score?: number }>} data Search results data
 * @param {string} query The search query
 */
function doResults(data, query) {
    elSearchQuery.textContent = escapeHtml(query)
    // @ts-ignore
    elSearchCount.textContent = data.length
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
                <small>${escapeHtml(item.path)}</small>
                <small>${escapeHtml(item.snippet)}</small>
            </a>
        `
    })
    elSearchDetails.innerHTML = html
    elSearchResults.hidden = false
}

function updatePageData(attributes) {
    uibuilder.set('pageData', attributes )
    // pageData = attributes
    if (elShowMeta) elShowMeta.metadata = pageData || {}
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
elSearchInput.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    // @ts-ignore
    const query = e.target.value.trim()
    if (query.length < 2) {
        elSearchResults.hidden = true
        return
    }
    // Debounce search request inputs
    searchTimeout = setTimeout(async () => {
        elSearchQuery.textContent = escapeHtml(query)
        elSearchCount.textContent = 'N/A'
        elSearchDetails.innerHTML = '<p class="no-results">Searching...</p>'
        elSearchResults.hidden = false
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
    // console.log('Control message received:', ctrlMsg)

    // UIBUILDER sends this on initial connect, use to request initial page metadata
    if (ctrlMsg.uibuilderCtrl === 'client connect') {
        console.log('Client connected to server, requesting initial page data.', initialPath)
        uibuilder.sendCtrl({
            uibuilderCtrl: 'internal',
            controlType: 'getMetadata',
            initialPath: initialPath.replace(baseUrl, '/') || '/',
        })
        return
    }

    switch (ctrlMsg.topic) {
        // From initial page data request only. No body in this since we already have it
        case '_page-metadata': {
            console.log('Initial page metadata received from server:', ctrlMsg)
            updatePageData(ctrlMsg.attributes)
            break
        }

        case '_search-results': {
            console.log('Search results received from server:', ctrlMsg)
            if (ctrlMsg.error) {
                elSearchQuery.textContent = escapeHtml(ctrlMsg.query)
                elSearchCount.textContent = 'N/A'
                elSearchDetails.innerHTML = '<p class="no-results">Search error: ' + escapeHtml(ctrlMsg.error) + '</p>'
                elSearchResults.hidden = false
                return
            }
            const data = ctrlMsg.results ?? []
            doResults(data, ctrlMsg.query)
            console.log(`Displayed ${data.length} search results for query "${ctrlMsg.query}"`, data)

            break
        }

        case '_indexes-changed': {
            console.log('Indexes changed on server.', ctrlMsg)
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
            console.log(
                `Page change from ${ctrlMsg.from} (${ctrlMsg.attributes.from}):`,
                ` New url: ${ctrlMsg.attributes.toUrl}.`,
                ctrlMsg
            )
            if (ctrlMsg.error) {
                // TODO Handle not found
                return
            }
            const data = ctrlMsg.attributes ?? []
            updatePageData(data)
            // TODO: Sanitize data.body for safety
            // TODO: Should {{...}} replacements be done here? Instead of on server?
            if (elContent) elContent.innerHTML = data.body || '<p>No content</p>'

            postDataUpdate(data)

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
            }

            // Reset the popstate flag after processing
            isHandlingPopstate = false

            // Update active nav link(s) and parent indicators
            // updateActiveNavState(data.path)

            // Update search result highlighting to reflect current page
            updateSearchResultHighlight()

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
