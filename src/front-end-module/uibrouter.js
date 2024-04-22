/* eslint-disable no-undef */
// @ts-nocheck
/** A simple, vanilla JavaScript front-end router class
 * Included in node-red-contrib-uibuilder but is not dependent on it.
 * May be used in other contexts as desired.
 *
 * Copyright (c) 2023-2024 Julian Knight (Totally Information)
 * https://it.knightnet.org.uk
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Type definitions
 * routeDefinition
 * @typedef {object} routeDefinition Single route configuration
 * @property {string} id REQUIRED. Route ID
 * @property {string} src REQUIRED for external, optional for internal (default=route id). CSS Selector for template tag routes, url for external routes
 * @property {"url"|undefined} [type] OPTIONAL, default=internal route. "url" for external routes
 * @property {string} [title] OPTIONAL, default=route id. Text to use as a short title for the route
 * @property {string} [description] OPTIONAL, default=route id. Text to use as a long description for the route
 * @property {"html"|"md"|"markdown"} [format] OPTIONAL, default=html. Route content format, HTML or Markdown (md). Markdown requires the Markdown-IT library to have been loaded.
 *
 * UibRouterConfig
 * @typedef {object} UibRouterConfig Configuration for the UiBRouter class instances
 * @property {routeDefinition[]} routes REQUIRED. Array of route definitions
 * @property {Array<string|object>} [mdPlugins] OPTIONAL. Array of Markdown-IT plugins
 * @property {string} [defaultRoute] OPTIONAL, default=1st route. If set to a route id, that route will be automatically shown on load
 * @property {string} [routeContainer] OPTIONAL, default='#uibroutecontainer'. CSS Selector for an HTML Element containing routes
 * @property {boolean} [hide] OPTIONAL, default=false. If TRUE, routes will be hidden/shown on change instead of removed/added
 * @property {boolean} [templateLoadAll] OPTIONAL, default=false. If TRUE, all external route templates will be loaded when the router is instanciated. Default is to lazy-load external templates
 * @property {boolean} [templateUnload] OPTIONAL, default=true. If TRUE, route templates will be unloaded from DOM after access.
 * @property {otherLoadDefinition[]} [otherLoad] OPTIONAL, default=none. If present, router start will pre-load other external templates direct to the DOM. Use for menu's, etc.
 *
 * otherLoadDefinition
 * @typedef {object} otherLoadDefinition Single external load configuration
 * @property {string} id REQUIRED. Unique (to page) ID. Will be applied to loaded content.
 * @property {string} src REQUIRED. url of external template to load
 * @property {string} container REQUIRED. CSS Selector defining the parent element that this will become the child of. If it doesn't exist on page, content will not be loaded.
 */

class UibRouter { // eslint-disable-line no-unused-vars
    //#region --- Variables ---
    /** Class version */
    static version = '1.4.0' // 2024-04-07
    /** Ensures only 1 class instance on a page */
    static #instanceExists = false
    /** Options for Markdown-IT if available (set in constructor) */
    static mdOpts
    /** Reference to pre-loaded Markdown-IT library */
    static md

    /** Configuration settings @type {UibRouterConfig} */
    config
    /** Reference to the container DOM element - set in setup() @type {HTMLDivElement} */
    routeContainerEl
    /** The current route id after doRoute() has been called */
    currentRouteId
    /** The previous route id after doRoute() has been called */
    previousRouteId
    /** Array of route ID's (created in constructor) */
    routeIds = []

    /** Internal only. Set to true when the _start() method has been called */
    #startDone = false

    safety = 0
    //#endregion --- ----- ---

    //#region --- Internal Methods ---
    /** Class constructor
     * @param {UibRouterConfig} routerConfig Configuration object
     */
    constructor(routerConfig) {
        // Enforce only 1 instance on page (otherwise uibuilder vars will be overwritten)
        if (UibRouter.#instanceExists) throw new Error('[uibrouter:constructor] Only 1 instance of a UibRouter may exist on the page.')

        // Fetch is on desktop browsers since 2017 at least. Not so much on mobile (Android!)
        // May need a polyfill on mobile or old browsers.
        if (!fetch) throw new Error('[uibrouter:constructor] UibRouter requires `fetch`. Please use a current browser or load a fetch polyfill.')

        if (!routerConfig) throw new Error('[uibrouter:constructor] No config provided')
        if (!routerConfig.routes) throw new Error('[uibrouter:constructor] No routes provided in routerConfig')

        // Save the config
        this.config = routerConfig

        // Add a default route container uf needed
        if (!this.config.routeContainer) this.config.routeContainer = '#uibroutecontainer'
        // If no default set in config, set to the first entry
        if (!this.config.defaultRoute && this.config.routes[0] && this.config.routes[0].id) this.config.defaultRoute = this.config.routes[0].id
        // Other defaults
        if (!this.config.hide) this.config.hide = false
        if (!this.config.templateLoadAll) this.config.templateLoadAll = false
        if (!this.config.templateUnload) this.config.templateUnload = true

        this._normaliseRouteDefns(this.config.routes)

        // If Markdown-IT library pre-loaded, set it up now
        if (window['markdownit']) this._markdownIt()

        if (uibuilder) uibuilder.set('uibrouterinstance', this)

        // Create/access the route container element, sets this.routeContainerEl
        this._setRouteContainer()

        if (this.config.otherLoad) this.loadOther(this.config.otherLoad)

        this._updateRouteIds()

        // Only pre-load all templates if requested (default is not to)
        if (this.config.templateLoadAll === false) {
            this._start()
        } else {
            console.info('[uibrouter] Pre-loading all external templates')
            // Load all external route templates async in parallel - NB: Object.values works on both arrays and objects
            // Note that final `then` is called even if no external routes are given
            Promise.allSettled(Object.values(routerConfig.routes).filter(r => r.type && r.type === 'url').map(this._loadExternal))
                .then( results => {
                    results.filter( res => res.status === 'rejected').forEach(res => {
                        console.error(res.reason)
                    })
                    results.filter( res => res.status === 'fulfilled').forEach(res => {
                        console.log('allSettled results', res, results)
                        this._appendExternalTemplates(res.value)
                    })
                    // Everything is loaded that can be so we can start
                    this._start()
                    return true
                })
                .catch( reason => {
                    console.error(reason)
                })
        }

        UibRouter.#instanceExists = true
    }

    /** Save a reference to, and create if necessary, the HTML element to hold routes */
    _setRouteContainer() {
        const body = document.getElementsByTagName('body')[0]
        // Get reference to route container or create it
        let routeContainerEl = this.routeContainerEl = document.querySelector(this.config.routeContainer)
        if (!routeContainerEl) {
            // throw new Error(`Route container element with CSS selector '${routerConfig.routeContainer}' not found in HTML`)
            const tempContainer = document.createElement('div')
            tempContainer.setAttribute('id', this.config.routeContainer.replace('#', ''))
            body.append(tempContainer)
            routeContainerEl = this.routeContainerEl = document.querySelector(this.config.routeContainer)
        }
    }

    /** Apply fetched external elements to templates tags under the head tag
     * @param {HTMLElement[]} loadedElements Array of loaded external elements to add as templates to the head tag
     * @returns {number} Count of load errors
     */
    _appendExternalTemplates(loadedElements) {
        if (!Array.isArray(loadedElements)) loadedElements = [loadedElements]
        // console.log('_appendExternalTemplates', loadedElements)
        const head = document.getElementsByTagName('head')[0]
        let errors = 0
        // Append the loaded content to the main container
        loadedElements.forEach(element => {
            if (Array.isArray(element)) {
                console.error(...element)
                errors++
            } else {
                head.append(element)
            }
        })
        return errors
    }

    /** Called once all external templates have been loaded */
    async _start() {
        if (this.#startDone === true) return // Don't run this again

        // Go to url hash route or default route if no route in url
        await this.doRoute(this.keepHashFromUrl(window.location.hash))

        // After initial route set, listen for url hash changes and process route change
        window.addEventListener('hashchange', (event) => this._hashChange(event) )

        // Events on fully loaded ...
        document.dispatchEvent(new CustomEvent('uibrouter:loaded'))
        if (uibuilder) uibuilder.set('uibrouter', 'loaded') // eslint-disable-line no-undef

        this.#startDone = true // Don't run this again
    }

    /** Called when the URL Hash changes
     * @param {HashChangeEvent} event URL Hash change event object
     */
    _hashChange(event) {
        // console.log(`[uibrouter] hashchange: ${this.keepHashFromUrl(event.oldURL)} => ${this.keepHashFromUrl(event.newURL)}` )
        this.doRoute(event)
    }

    /** Loads an external HTML file into a `<template>` tag, adding the router id as the template id. Or throws.
     * @param {routeDefinition} routeDefinition Configuration for a single route
     * @returns {HTMLTemplateElement[]} An HTMLTemplateElement that will provide the route content
     */
    async _loadExternal(routeDefinition) {
        if (!routeDefinition) throw new Error('[uibrouter:loadExternal] Error loading route template. No route definition provided.')
        // Obviously, this only works for internal routes
        if (!routeDefinition.src) {
            if (!routeDefinition.type || (routeDefinition.type && routeDefinition.type !== 'url')) routeDefinition.src = routeDefinition.id
            else throw new Error('[uibrouter:loadExternal] Error loading route template. `src` property not defined')
        }

        const id = routeDefinition.id

        let response
        try {
            response = await fetch(routeDefinition.src)
        } catch (e) {
            throw new Error(`[uibrouter:loadExternal] Error loading route template HTML for route: ${routeDefinition.id}, src: ${routeDefinition.src}. Error: ${e.message}`, e)
        }

        // Fetch failed?
        if (response.ok === false) throw new Error(`[uibrouter:loadExternal] Fetch failed to return data for route: ${routeDefinition.id}, src: ${routeDefinition.src}. Status: ${response.statusText} (${response.status})`, [routeDefinition.id, routeDefinition.src, response.status, response.statusText])

        /** @type {string & any[]} */
        let htmlText = await response.text()

        // If Markdown & library loaded, convert from markdown to HTML
        if (window['markdownit'] && routeDefinition.format === 'md') {
            htmlText = this.renderMarkdown(htmlText)
        }

        // Check to see if template already exists, if so, remove it
        try {
            const chkTemplate = document.querySelector(`#${id}`)
            if (chkTemplate) chkTemplate.remove()
        } catch (e) {}

        // Return the template
        const tempContainer = document.createElement('template')
        tempContainer.innerHTML = htmlText
        tempContainer.setAttribute('id', id)
        return tempContainer
    }

    /** Remove/re-apply scripts in a container Element so that they are executed.
     * @param {HTMLElement} tempContainer HTML Element of container to process
     */
    _applyScripts(tempContainer) {
        const scripts = tempContainer.querySelectorAll('script')
        scripts.forEach( scr => {
            const newScript = document.createElement('script')
            newScript.textContent = scr.innerText
            tempContainer.append(newScript)
            scr.remove() // remove the origin
        })
    }

    /** Set up the MarkdownIT library if loaded */
    _markdownIt() {
        if (!window['markdownit']) return
        // If plugins not yet defined, check if uibuilder has set them
        if (!this.config.mdPlugins && window['uibuilder'] && window['uibuilder'].ui_md_plugins) this.config.mdPlugins = window['uibuilder'].ui_md_plugins
        // If Markdown-IT library pre-loaded, set it up now
        UibRouter.mdOpts = {
            html: true,
            xhtmlOut: false,
            linkify: true,
            _highlight: true,
            _strict: false,
            _view: 'html',
            langPrefix: 'language-',
            // NB: the highlightjs (hljs) library must be loaded before markdown-it for this to work
            highlight: function(str, lang) {
                if (window['hljs']) {
                    if (lang && window['hljs'].getLanguage(lang)) {
                        try {
                            return `<pre><code class="hljs border language-${lang}" data-language="${lang}" title="Source language: '${lang}'">${window['hljs'].highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
                        } finally { } // eslint-disable-line no-empty
                    } else {
                        try {
                            const high = window['hljs'].highlightAuto(str)
                            return `<pre><code class="hljs border language-${high.language}" data-language="${high.language}" title="Source language estimated by HighlightJS: '${high.language}'">${high.value}</code></pre>`
                        } finally { } // eslint-disable-line no-empty
                    }
                }
                return `<pre><code class="border">${Ui.md.utils.escapeHtml(str).trim()}</code></pre>`
            },
        }
        UibRouter.md = window['markdownit'](UibRouter.mdOpts)
        if (this.config.mdPlugins) {
            if (!Array.isArray(this.config.mdPlugins)) {
                console.error('[uibrouter:_markDownIt:plugins] Could not load plugins, config.mdPlugins is not an array')
                return
            }
            this.config.mdPlugins.forEach( plugin => {
                if (typeof plugin === 'string') {
                    UibRouter.md.use(window[plugin])
                } else {
                    const name = Object.keys(plugin)[0]
                    UibRouter.md.use(window[name], plugin[name])
                }
            })
        }
    }

    /** Normalise route definition arrays
     * @param {Array<routeDefinition>} routeDefns Route definitions to normalise
     */
    _normaliseRouteDefns(routeDefns) {
        if (!Array.isArray(routeDefns)) routeDefns = [routeDefns]
        routeDefns.forEach( defn => {
            let fmt = defn.format || 'html'
            fmt = fmt.toLowerCase()
            if (fmt === 'markdown') fmt = 'md'
            defn.format = fmt
        })
    }

    /** Update this.routeIds array from this.config (on start and after add/remove routes) */
    _updateRouteIds() {
        this.routeIds = new Set(Object.values(routerConfig.routes).map( r => r.id ))
    }

    /** If uibuilder in use, report on route change
     * @param {string} newRouteId The route id now shown
     */
    _uibRouteChange(newRouteId) {
        if (!uibuilder || !newRouteId) return
        uibuilder.set('uibrouter', 'route changed')
        uibuilder.set('uibrouter_CurrentRoute', newRouteId)
        uibuilder.set('uibrouter_CurrentTitle', this.routeTitle())
        uibuilder.set('uibrouter_CurrentDescription', this.routeDescription())
        uibuilder.set('uibrouter_CurrentDetails', this.getRouteConfigById(newRouteId))
        // Send control msg back to Node-RED
        uibuilder.sendCtrl({
            uibuilderCtrl: 'route change',
            routeId: newRouteId,
            title: this.routeTitle(),
            description: this.routeDescription(),
            details: this.getRouteConfigById(newRouteId),
        })
    }
    //#endregion --- ----- --

    /** Process a routing request
     * All errors throw so make sure to try/catch calls to this method.
     * @param {PointerEvent|MouseEvent|HashChangeEvent|TouchEvent|string} routeSource Either string containing route id or DOM Event object either click/touch on element containing `href="#routeid"` or Hash URL change event
     */
    async doRoute(routeSource) {
        if (this.safety > 10) throw new Error('🚫 [uibrouter:doRoute] Safety protocol triggered, too many route bounces')

        if (!routeSource) routeSource = this.config.defaultRoute

        const container = this.routeContainerEl
        if (!container) throw new Error('[uibrouter:doRoute] Cannot route, has router.setup() been called yet?')

        // Remove all the url and query param text and any leading # - returns '' if no current hash
        const currentHash = this.keepHashFromUrl(window.location.hash)

        // If no route source provided, take the current hash (which might be '' and that will trigger the default route if defined)
        if (!routeSource) routeSource = currentHash

        let newRouteId, oldRouteId

        // Define new and old routes depending on different call types
        if (typeof routeSource === 'string') { // Manually provided route id
            // console.log(`[uibrouter:doRoute] manual: ${currentHash} => ${this.keepHashFromUrl(routeSource)}. Current: ${currentHash}` )
            newRouteId = this.keepHashFromUrl(routeSource)
            oldRouteId = currentHash
            // If no hash & config has default, set the default as new
            if (newRouteId === '' && this.config.defaultRoute) newRouteId = this.config.defaultRoute
            // If the new route id not the same as the current one in the url hash, just change the current hash & exit
            if (newRouteId !== currentHash ) {
                window.location.hash = `#${newRouteId}`
                return
            }
        } else if (routeSource.type === 'hashchange') { // A URL Hash change event
            // console.log(`[uibrouter:doRoute] hashchange: ${this.keepHashFromUrl(routeSource.oldURL)} => ${this.keepHashFromUrl(routeSource.newURL)}. Current: ${currentHash}` )
            const newUrl = routeSource.newURL
            // Check if URL actually contains a #
            if (newUrl.includes('#')) {
                oldRouteId = this.keepHashFromUrl(routeSource.oldURL)
                newRouteId = this.keepHashFromUrl(newUrl) // Only keep anything after the # & ignoring query params
            } else return
        } else { // A mouse click/touch event on a dom element with an href attribute
            oldRouteId = currentHash
            // Try to get the route name from the URL hash
            try {
                newRouteId = this.keepHashFromUrl(routeSource.target.attributes.href.value) // Only keep anything after the # & ignoring query params
            } catch (e) {
                throw new Error('[uibrouter:doRoute] No valid route found. Event.target does not have an href attribute')
            }
        }

        let routeShown = false

        // If no defined valid route id, undo and report error
        if (!newRouteId || !this.routeIds.has(newRouteId)) {
            // Events on route change fail ...
            document.dispatchEvent(new CustomEvent('uibrouter:route-change-failed', { detail: { newRouteId, oldRouteId } }))
            if (uibuilder) uibuilder.set('uibrouter', 'route change failed') // eslint-disable-line no-undef
            // If ID's the same, this happened on load and would keep failing so revert to default
            if (newRouteId === oldRouteId) oldRouteId = ''
            // Don't throw an error here, it stops the menu highlighting from working
            console.error(`[uibrouter:doRoute] No valid route found. Either pass a valid route name or an event from an element having an href of '#${newRouteId}'. Route id requested: '${newRouteId}'`)
            this.safety++
            // Revert route
            this.doRoute(oldRouteId || '')
            return
        }

        // At this point, we have a valid route ID

        // NB: The `loadRoute` method will attempt to load external templates that are not currently loaded

        // Show the new container (replace or show)
        if (this.config.hide) {
            // config.hide = true so hide previous contents
            if (oldRouteId) {
                /** @type {HTMLElement|null} */
                const oldContent = document.querySelector(`div[data-route="${oldRouteId}"]`)
                if (oldContent) oldContent.style.display = 'none'
            }
            /** and unhide new route if possible @type {HTMLElement|null} */
            const content = document.querySelector(`div[data-route="${newRouteId}"]`)
            if (content) {
                content.style.removeProperty('display')
                routeShown = true
            } else {
                // else create new content from template
                try {
                    routeShown = await this.loadRoute(newRouteId)
                } catch (e) {
                    console.error('[uibrouter:doRoute] ', e)
                    routeShown = false
                }
            }
        } else {
            // config.hide != true so remove previous contents
            container.replaceChildren()
            // Create new content from template
            try {
                routeShown = await this.loadRoute(newRouteId)
            } catch (e) {
                console.error('[uibrouter:doRoute] ', e)
                routeShown = false
            }
        }

        // console.log({ newRouteId, oldRouteId, currentHash, routeShown })

        // Roll back the route change if the new route cannot be shown
        if (routeShown === false) {
            // Events on route change fail ...
            document.dispatchEvent(new CustomEvent('uibrouter:route-change-failed', { detail: { newRouteId, oldRouteId } }))
            if (uibuilder) uibuilder.set('uibrouter', 'route change failed') // eslint-disable-line no-undef
            // If ID's the same, this happened on load and would keep failing so revert to default
            if (newRouteId === oldRouteId) oldRouteId = ''
            // Don't throw an error here, it stops the menu highlighting from working
            console.error(`[uibrouter:doRoute] Route content for '${newRouteId}' could not be shown, reverting to old route '${oldRouteId}'`)
            this.safety++
            // Revert route
            this.doRoute(oldRouteId || '')
            return
        }

        // At this point, the new route has successfully been shown
        this.safety = 0

        // If requested (default), unload the old route template
        if (this.config.templateUnload) this.unloadTemplate(oldRouteId)

        // Retain current and previous route id's
        this.currentRouteId = newRouteId
        this.previousRouteId = oldRouteId

        // Record the current route on the route container
        container.dataset.currentRoute = newRouteId

        // Update any existing HTML menu items
        this.setCurrentMenuItems()

        // Events on route changed ...
        document.dispatchEvent(new CustomEvent('uibrouter:route-changed', { detail: { newRouteId, oldRouteId } }))
        this._uibRouteChange(newRouteId)
    }

    /** Load other external files and apply to specific parents (mostly used for externally defined menus)
     * @param {otherLoadDefinition|Array<otherLoadDefinition>} extOther Required. Array of objects defining what to load and where
     */
    loadOther(extOther) {
        if (!extOther) throw new Error('[uibrouter:loadOther] At least 1 load definition must be provided')
        if (!Array.isArray(extOther)) extOther = [extOther]

        extOther.forEach( async f => {
            const parent = document.querySelector(f.container)
            if (!parent) return // Nothing to do if parent does not exist on page

            let response
            try {
                response = await fetch(f.src)
            } catch (e) {
                throw new Error(`[uibrouter:loadOther] Error loading template HTML for '${f.id}', src: '${f.src}'. Error: ${e.message}`, e)
            }
            // Fetch failed?
            if (response.ok === false) throw new Error(`[uibrouter:loadOther] Fetch failed to return data '${f.id}', src: '${f.src}'. Status: ${response.statusText} (${response.status})`, [f.id, f.src, response.status, response.statusText])

            /** @type {string & any[]} */
            const htmlText = await response.text()

            // We fetched it, so now load it to the DOM
            const tempContainer = document.createElement('div')
            tempContainer.innerHTML = htmlText
            tempContainer.id = f.id

            parent.append(tempContainer)
            this._applyScripts(parent.lastChild)
        })
    }

    /** Async method to create DOM route content from a route template (internal or external) - loads external templates if not already loaded
     * Route templates have to be a `<template>` tag with an ID that matches the route id.
     * Scripts in the template are run at this point.
     * All errors throw so make sure to try/catch calls to this method.
     * @param {string} routeId ID of the route definition to use to create the content
     * @param {HTMLElement} [routeParentEl] OPTIONAL, default=this.routeContainerEl (master route container). Reference to an HTML Element to which the route content will added as a child.
     * @returns {boolean} True if the route content was created successfully, false otherwise
     */
    async loadRoute(routeId, routeParentEl) {
        if (!routeParentEl) routeParentEl = this.routeContainerEl

        // Try to reference the template for this route
        let rContent
        try {
            rContent = await this.ensureTemplate(routeId)
        } catch (e) {
            throw new Error(`[uibrouter:loadRoute] No template for route id '${routeId}'. \n ${e.message}`)
        }

        // Clone the template
        const docFrag = rContent.content.cloneNode(true)

        // Have to re-apply the scripts to make them run - only for external templates
        if (this.isRouteExternal(routeId)) this._applyScripts(docFrag)

        // Create the route wrapper div with data-route attrib
        const tempContainer = document.createElement('div')
        tempContainer.dataset.route = routeId
        tempContainer.append(docFrag)

        // And finally try to append to the container
        try {
            routeParentEl.append(tempContainer)
        } catch (e) {
            throw new Error(`[uibrouter:loadRoute] Failed to apply route id '${routeId}'. \n ${e.message}`)
        }

        // Then tell the world
        document.dispatchEvent(new CustomEvent('uibrouter:route-loaded', { routeId: routeId }))

        // If we get here, everything is good
        return true
    }

    /** Async method to ensure that a template element exists for a given route id
     *  If route is external, will try to load if it doesn't exist.
     * All errors throw so make sure to try/catch calls to this method.
     * @param {string} routeId A single route ID
     * @returns {HTMLTemplateElement} A reference to the HTML Template element
     */
    async ensureTemplate(routeId) {
        if (!routeId || !this.routeIds.has(routeId)) throw new Error(`[uibrouter:ensureTemplate] No valid route id provided. Route ID: '${routeId}'`)
        // Try to reference the template for this route
        let rContent = document.querySelector(`#${routeId}`)
        // If not found, try once to load it - assuming it is external
        if (!rContent) {
            // If external template content doesn't exist, try to load it now (but only try once)
            const r = this.getRouteConfigById(routeId)
            if (r.type && r.type === 'url') {
                let loadedEls
                try {
                    loadedEls = await this._loadExternal(r)
                } catch (e) {
                    throw new Error(e.message, e)
                }

                if (!loadedEls) throw new Error(`[uibrouter:ensureTemplate] No route template found for route selector '#${routeId}'. Does the link url match a defined route id?`)

                // Apply fetched external elements to templates tags under the head tag
                this._appendExternalTemplates(loadedEls)

                // And check that the template now actually exists
                rContent = document.querySelector(`#${routeId}`)

                if (!rContent) throw new Error(`[uibrouter:ensureTemplate] No valid route template found for external route selector '#${routeId}'`)
            } else {
                // type not not external so we can't do anything when it doesn't actually exist
                throw new Error(`[uibrouter:ensureTemplate] No route template found for internal route selector '#${routeId}'. Ensure that a template element with the matching ID exists in the HTML.`)
            }
        }
        return rContent
    }

    /** Return a route config given a route id (returns undefined if route not found)
     * @param {string} routeId Route ID to search for
     * @returns {routeDefinition|undefined} Route config for found id else undefined
     */
    getRouteConfigById(routeId) {
        return Object.values(this.config.routes).filter(r => r.id === routeId)[0]
    }

    /** Return true if the given route is external, false otherwise
     * Used to correctly (re)apply script tags when cloning the template to the DOM (createRouteContent)
     * @param {string} routeId Route ID to check
     * @returns {boolean} True if the given route is external, false otherwise
     */
    isRouteExternal(routeId) {
        const routeConfig = this.getRouteConfigById(routeId)
        return !!(routeConfig && routeConfig.type === 'url')
    }

    /** Go to the default route if it has been specified */
    defaultRoute() {
        if (this.config.defaultRoute) this.doRoute(this.config.defaultRoute)
    }

    /** Remove the hash from the browser URL */
    removeHash() {
        history.pushState('', document.title, window.location.pathname + window.location.search)
    }

    /** Empty the current container and remove url hash - does not trigger a route change */
    noRoute() {
        this.removeHash()
        this.routeContainerEl.replaceChildren()
    }

    /** Only keep anything after the # & ignoring query params
     * @param {string} url URL to extract the hash from
     * @returns {string} Just the route id
     */
    keepHashFromUrl(url) {
        if (!url) return ''
        return url.replace(/^.*#(.*)/, '$1').replace(/\?.*$/, '')
    }

    /** Return an array of route ids (to facilitate creation of menus)
     * @param {boolean} returnHash If true, returns id's with leading `#` to apply to href attributes else returns the id
     * @returns {string[]} Array of route id's or route url hashes
     */
    routeList(returnHash) {
        if (returnHash === true) return this.routeIds.map((r) => returnHash === true ? `#${r.id}` : r.id)
        return this.routeIds
    }

    /** Add new route definitions to the existing ones
     * @param {routeDefinition|routeDefinition[]} routeDefn Single or array of route definitions to add
     */
    addRoutes(routeDefn) {
        if (!Array.isArray(routeDefn)) routeDefn = [routeDefn]
        this._normaliseRouteDefns(routeDefn)

        // Update the route config
        this.config.routes.push(...routeDefn)
        // and update the routeIds list
        this._updateRouteIds()
        // Let everyone know it all finished
        document.dispatchEvent(new CustomEvent('uibrouter:routes-added', { detail: routeDefn }))
        if (uibuilder) uibuilder.set('uibrouter', 'routes added')

        if (this.config.templateLoadAll) {
            // Load all external route templates async in parallel - NB: Object.values works on both arrays and objects
            Promise.allSettled(Object.values(routeDefn).filter(r => r.type && r.type === 'url').map(this._loadExternal))
                .then( results => {
                    results.filter( res => res.status === 'rejected').forEach(res => {
                        console.error(res.reason)
                    })
                    // results.filter( res => res.status === 'fulfilled').forEach(res => {})

                    // Everything is loaded that can be - Add new routes to config
                    this.config.routes.push(...routeDefn)
                    // and update the routeIds list
                    this._updateRouteIds()
                    // Let everyone know it all finished
                    document.dispatchEvent(new CustomEvent('uibrouter:routes-added', { detail: routeDefn }))
                    if (uibuilder) uibuilder.set('uibrouter', 'routes added')
                    return true
                })
                .catch( reason => {
                    console.error(reason)
                })
        }
    }

    /** Remove a template from the DOM (optionally external templates only)
     * @param {string} routeId REQUIRED. The route id of the template to remove (templates are ID's by their route id)
     * @param {boolean=} externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
     */
    unloadTemplate(routeId, externalOnly) {
        if (!externalOnly) externalOnly = true
        if (!routeId || !this.isRouteExternal(routeId)) return

        if (externalOnly === true && !this.isRouteExternal(routeId)) return

        // Try to get the template - if found delete it
        const chkTemplate = document.querySelector(`#${routeId}`)
        if (chkTemplate) chkTemplate.remove()
    }

    /** Remove ALL templates from the DOM (optionally external templates only)
     * @param {Array<string>=} templateIds OPTIONAL, default=ALL. Array of template (route) id's to remove
     * @param {boolean=} externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
     */
    deleteTemplates(templateIds, externalOnly) {
        if (!externalOnly) externalOnly = true
        if (!templateIds || templateIds === '*') templateIds = [...this.routeIds]

        if (!Array.isArray(templateIds)) templateIds = [templateIds]

        templateIds.forEach( routeId => {
            if (externalOnly === true && !this.isRouteExternal(routeId)) return
            this.unloadTemplate(routeId, externalOnly)
        } )
    }

    //#region --- utils for page display & processing ---
    setCurrentMenuItems() {
        // const items = document.querySelectorAll(`li[data-route="${this.currentRouteId}"]`)
        const items = document.querySelectorAll('li[data-route]')
        items.forEach( item => {
            if (item.dataset.route === this.currentRouteId) {
                item.classList.add('currentRoute')
                item.setAttribute('aria-current', 'page')
            } else {
                item.classList.remove('currentRoute')
                item.removeAttribute('aria-current')
            }
        })
    }

    routeTitle() {
        const thisRoute = this.currentRoute() || {}
        return thisRoute.title || thisRoute.id || '[ROUTE NOT FOUND]'
    }

    routeDescription() {
        const thisRoute = this.currentRoute() || {}
        return thisRoute.description || thisRoute.id || '[ROUTE NOT FOUND]'
    }

    currentRoute() {
        return this.getRouteConfigById(this.currentRouteId)
    }

    /** Use Markdown-IT to render Markdown to HTML
     * https://markdown-it.github.io/markdown-it
     * @param {string} mdText Markdown string
     * @returns {string|undefined} HTML rendering of the Markdown input
     */
    renderMarkdown(mdText) {
        if (!window['markdownit']) return
        if (!UibRouter.md) this._markdownIt() // In case Markdown-IT lib was late loaded
        try {
            return UibRouter.md.render(mdText.trim())
        } catch (e) {
            console.error(`[uibrouter:renderMarkdown] Could not render Markdown. ${e.message}`, e)
            return '<p class="border error">Could not render Markdown<p>'
        }
    }
    //#endregion ---- ----- ----

    // TODO
    // deleteRoutes(aRoutes) {
    //     // Delete all if no list provided
    //     if (!aRoutes) aRoutes = this.config.routes
    //     if (!Array.isArray(aRoutes)) aRoutes = [aRoutes]
    //     console.log('to be deleted', this.config.routes.filter(r => aRoutes.includes(r.id)))
    //     console.log('to be retained', this.config.routes.filter(r => !aRoutes.includes(r.id)))

    //     // TODO actually remove the unwanted route templates
    //     // TODO remove from the config: this.config.routes = this.config.routes.filter(r => !aRoutes.includes(r.id))

    //     // ? Optional future upgrade - attempt to also remove any links to this route?
    // }

    // TODO
    // reloadTemplates(templateIds) {
    //     if (!Array.isArray(templateIds)) templateIds = [templateIds]
    //     templateIds.forEach( templateid => {
    //         // TODO reload
    //     } )
    // }
} // ---- End of class ----

// For use in ESM loads
export { UibRouter }
export default UibRouter

// Auto-assign for when the library is loaded via a script tag
if (!window['UibRouter']) {
    window['UibRouter'] = UibRouter
} else {
    console.warn('`UibRouter` already assigned to window. Have you tried to load it more than once?')
}
