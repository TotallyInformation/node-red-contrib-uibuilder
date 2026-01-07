/** The uibuilder.pageData object is set on load and when navigating
 * You can use it to do your own processing if desired
 */
uibuilder.onChange('pageData', (pageData) => {
    console.log(`uibuilder.pageData has changed (${pageData.from}): `, pageData)
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

// #region --- Utility Functions ---
// Normalize: remove trailing slashes, .md extension, and double slashes
const normalizePath = p => p
    .replace(/\/+/g, '/') // collapse multiple slashes
    .replace(/\/$/, '') // remove trailing slash
    .replace(/\.md$/, '') // remove .md extension
    .toLowerCase()

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

// #region --- SPA Navigation ---
/** Initialize multi-level navigation menu with mobile support
 * Handles burger toggle, submenu expansion, keyboard navigation, and edge detection
 */
function initMenu() {
    const nav = document.querySelector('.horizontal')
    const menuToggle = nav?.querySelector('.menu-toggle')
    const routemenu = nav?.querySelector('.routemenu')

    if (!nav || !menuToggle || !routemenu) return

    // Mobile: Toggle menu visibility
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true'
        // @ts-ignore
        menuToggle.setAttribute('aria-expanded', !isExpanded)
        // @ts-ignore
        nav.setAttribute('aria-expanded', !isExpanded)
    })

    // Mobile: Handle submenu toggle on click for items with children
    routemenu.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches
        if (!isMobile) return

        // @ts-ignore
        const link = e.target.closest('a')
        const li = link?.closest('li')
        const hasSubmenu = li?.querySelector(':scope > ul')

        if (link && hasSubmenu) {
            e.preventDefault()
            li.classList.toggle('submenu-open')

            // Close sibling submenus
            const siblings = li.parentElement.querySelectorAll(':scope > li.submenu-open')
            siblings.forEach((sibling) => {
                if (sibling !== li) sibling.classList.remove('submenu-open')
            })
        }
    })

    // Desktop: Detect edge overflow and flip submenus
    const checkSubmenuOverflow = () => {
        const submenus = routemenu.querySelectorAll('ul ul')
        submenus.forEach((submenu) => {
            submenu.classList.remove('flip-left')
            const rect = submenu.getBoundingClientRect()
            if (rect.right > window.innerWidth) {
                submenu.classList.add('flip-left')
            }
        })
    }

    // Check overflow on hover
    routemenu.addEventListener('mouseenter', checkSubmenuOverflow, true)
    window.addEventListener('resize', () => {
        // Reset mobile menu state on resize
        if (!window.matchMedia('(max-width: 768px)').matches) {
            nav.setAttribute('aria-expanded', 'false')
            menuToggle.setAttribute('aria-expanded', 'false')
            routemenu.querySelectorAll('.submenu-open').forEach((el) => {
                el.classList.remove('submenu-open')
            })
        }
        checkSubmenuOverflow()
    })

    // Keyboard navigation
    routemenu.addEventListener('keydown', (e) => {
        const focusedItem = document.activeElement
        const li = focusedItem?.closest('li')
        const hasSubmenu = li?.querySelector(':scope > ul')
        const isInSubmenu = focusedItem?.closest('ul ul')

        // @ts-ignore
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                if (isInSubmenu) {
                    // Move to next sibling in submenu
                    const nextItem = li?.nextElementSibling?.querySelector('a')
                    nextItem?.focus()
                } else if (hasSubmenu) {
                    // Open submenu and focus first item
                    const firstSubItem = hasSubmenu.querySelector('a')
                    firstSubItem?.focus()
                }
                break

            case 'ArrowUp':
                e.preventDefault()
                if (isInSubmenu) {
                    const prevItem = li?.previousElementSibling?.querySelector('a')
                    if (prevItem) {
                        prevItem.focus()
                    } else {
                        // Go back to parent
                        const parentLink = li?.closest('ul')
                            ?.closest('li')
                            ?.querySelector(':scope > a')
                        // @ts-ignore
                        parentLink?.focus()
                    }
                }
                break

            case 'ArrowRight':
                e.preventDefault()
                if (!isInSubmenu) {
                    // Move to next top-level item
                    const nextTopItem = li?.nextElementSibling?.querySelector('a')
                    nextTopItem?.focus()
                } else if (hasSubmenu) {
                    // Open nested submenu
                    const firstSubItem = hasSubmenu.querySelector('a')
                    firstSubItem?.focus()
                }
                break

            case 'ArrowLeft':
                e.preventDefault()
                if (isInSubmenu) {
                    // Go back to parent
                    const parentLink = li?.closest('ul')
                        ?.closest('li')
                        ?.querySelector(':scope > a')
                    // @ts-ignore
                    parentLink?.focus()
                } else {
                    // Move to previous top-level item
                    const prevTopItem = li?.previousElementSibling?.querySelector('a')
                    prevTopItem?.focus()
                }
                break

            case 'Escape':
                // Close any open submenus and mobile menu
                nav.setAttribute('aria-expanded', 'false')
                menuToggle.setAttribute('aria-expanded', 'false')
                // @ts-ignore
                menuToggle.focus()
                break

            case 'Enter':
            case ' ':
                if (hasSubmenu && window.matchMedia('(max-width: 768px)').matches) {
                    e.preventDefault()
                    li.classList.toggle('submenu-open')
                }
                break
        }
    })

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        // @ts-ignore
        if (!nav.contains(e.target) && nav.getAttribute('aria-expanded') === 'true') {
            nav.setAttribute('aria-expanded', 'false')
            menuToggle.setAttribute('aria-expanded', 'false')
        }
    })
}

/** Update active navigation state and parent highlighting
 * @param {string} [currentPath] The current page path (defaults to window.location.pathname)
 */
function updateActiveNavState(currentPath) {
    let pathname = currentPath || window.location.pathname

    // Normalize pathname: if starts with baseUrl, keep as-is; else remove "./" prefix and add baseUrl
    if (!pathname.startsWith(baseUrl)) {
        pathname = baseUrl + '/' + pathname.replace(/^\.\//, '')
    }

    // Clear all active and parent-active classes first
    document.querySelectorAll('.routemenu a.active').forEach((a) => {
        a.classList.remove('active')
    })
    document.querySelectorAll('.routemenu li[class*="parent-active"]').forEach((li) => {
        li.classList.remove('parent-active-1', 'parent-active-2', 'parent-active-3')
    })

    // Find matching link
    let activeLink = null
    document.querySelectorAll('.routemenu a').forEach((a) => {
        const href = a.getAttribute('href')
        if (!href) return

        // Normalize linkPath: if starts with baseUrl, keep as-is; else remove "./" prefix and add baseUrl
        let linkPath = href
        if (!linkPath.startsWith(baseUrl)) {
            linkPath = baseUrl + '/' + linkPath.replace(/^\.\//, '')
        }

        if (normalizePath(pathname) === normalizePath(linkPath)) {
            activeLink = a
            a.classList.add('active')
        }
    })

    // TODO Consider having a single ancestor highlight for multiple matches
    // Apply parent-active classes bubbling up from active item
    if (activeLink) {
        // @ts-ignore
        let parentLi = activeLink.closest('li')?.parentElement?.closest('li')
        let level = 1
        while (parentLi && level <= 3) {
            parentLi.classList.add(`parent-active-${level}`)
            parentLi = parentLi.parentElement?.closest('li')
            level++
        }
    }
}

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
            // Handle meta tags
            if (el.hasAttribute('content')) {
                el.setAttribute('content', data[attr])
            } else {
                // Everything else
                el.textContent = data[attr]
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
    // #endregion --- Normalize toUrl ---

    console.log(`Navigating to: "${toUrl}"`, baseUrl, window.location.origin)

    // Ask server for new page content via uibuilder control message (see onChange handler below)
    uibuilder.sendCtrl({ uibuilderCtrl: 'internal', controlType: 'navigate', toUrl: toUrl, addToHistory: addToHistory, })
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

        console.log('Link click intercepted:', href, link)
        e.preventDefault()
        if (href.startsWith('./')) navigate(baseUrl + href)
        else {
            if (href.startsWith('/')) navigate(baseUrl + href)
            else navigate(baseUrl + '/' + href)
        }
    }
})

// Handle browser back/forward - Track to avoid pushing state during popstate handling
let isHandlingPopstate = false
window.addEventListener('popstate', (evt) => {
    console.log('popstate', evt)
    if (evt.state?.path) {
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
// console.log('Setting initial history state:', initialPath)
history.replaceState({ path: initialPath, status: 'initial load', }, '', initialPath)
// #endregion --- SPA Navigation ---

// #region --- Search functionality ---
let searchTimeout = null
// Add event listener to close button
const closeButtons = elSearchResults.querySelectorAll('.search-close')
closeButtons.forEach((btnClose) => {
    btnClose.addEventListener('click', () => {
        elSearchResults.hidden = true
        elSearchInput.value = ''
        elSearchDetails.innerHTML = ''
        elSearchInput.focus()
    })
})

/** Process and display search results
 * @param {Array<{ title: string, url: string, snippet: string }>} data Search results data
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
    let html = ''
    data.forEach((item) => {
        html += `
            <a class="search-result" href="${escapeHtml(item.url)}">
                <strong>${escapeHtml(item.title)}</strong>
                <small>${escapeHtml(item.url)}</small>
                <small>${escapeHtml(item.snippet)}</small>
            </a>
        `
    })
    elSearchDetails.innerHTML = html
    elSearchResults.hidden = false
}

/** Handle input event on search input - ask server for search results
 * Sends an "internal" control message to uibuilder to request search
 */
// elSearchInput.addEventListener('input', (e) => {
//     clearTimeout(searchTimeout)
//     // @ts-ignore
//     const query = e.target.value.trim()
//     if (query.length < 2) {
//         elSearchResults.hidden = true
//         return
//     }
//     // Debounce search request inputs
//     searchTimeout = setTimeout(async () => {
//         elSearchQuery.textContent = escapeHtml(query)
//         elSearchCount.textContent = 'N/A'
//         elSearchDetails.innerHTML = '<p class="no-results">Searching...</p>'
//         elSearchResults.hidden = false
//         uibuilder.sendCtrl({ uibuilderCtrl: 'internal', controlType: 'search', query: query, })
//     }, 300)
// })

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
    switch (ctrlMsg.topic) {
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

        case '_page-navigation-result': {
            console.log(`Page change from server (${ctrlMsg.attributes.from}):`, ctrlMsg)
            if (ctrlMsg.error) {
                // TODO Handle not found
                return
            }
            const data = ctrlMsg.attributes ?? []
            // TODO: Sanitize data.body for safety
            // TODO: Should {{...}} replacements be done here? Instead of on server?
            if (elContent) elContent.innerHTML = data.body || '<p>No content</p>'

            postDataUpdate(data)

            // Update active nav link(s) and parent indicators
            updateActiveNavState(data.path)

            // Remove trailing slash from baseUrl
            const newUrl = baseUrl.replace(/\/$/, '') + data.path
            // Only push to history if not handling popstate and server says to add to history
            // console.log('pushState:', newUrl, 'addToHistory:', ctrlMsg.addToHistory, 'isHandlingPopstate:', isHandlingPopstate)
            if (ctrlMsg.addToHistory === true && !isHandlingPopstate) {
                history.pushState(
                    { path: newUrl, status: 'SPA page change', },
                    '', newUrl
                )
            }
            // Reset the popstate flag after processing
            isHandlingPopstate = false
            break
        }

        default: {
            // Ignore other control messages
            break
        }
    }
})

// Initialize menu on DOM ready
initMenu()
// Set initial active state on page load
updateActiveNavState()
