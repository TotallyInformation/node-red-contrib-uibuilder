/* eslint-disable no-undef */
// @ts-nocheck
/** A simple, vanilla JavaScript front-end router class
 * Included in node-red-contrib-uibuilder but is not dependent on it.
 * May be used in other contexts as desired.
 * 
 * Copyright (c) 2023-2023 Julian Knight (Totally Information)
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

/** ---------------------------------------------------------------------
 * TODO
 * Methods needed:
 *   Delete route
 *   Update/reload route
 *   shutdown - that removes all elements
 *   delete templates - unloads a list of (or all) templates
 *   reload templates - to facilitate updates of a list of (or all) templates
 * Additional options:
 *   unload templates after they are added to the route container. Only if hide=true. `unload: true`
 *   Maybe: options to auto-load js and css files with the same name as a template file.
 * ---------------------------------------------------------------------  */

/** Type definitions
 * routeConfig
 * @typedef {object} routeDefinition Single route configuration
 * @property {string} id REQUIRED. Route ID
 * @property {string} src REQUIRED. CSS Selector for template tag routes, url for external routes
 * @property {"url"|undefined} [type] OPTIONAL. "url" for external routes
 * UibRouterConfig
 * @typedef {object} UibRouterConfig Configuration for the UiBRouter class instances
 * @property {routeDefinition[]} routes REQUIRED. Array of route definitions
 * @property {string} [defaultRoute] OPTIONAL. If set to a route id, that route will be automatically shown on load
 * @property {string} [routeContainer] OPTIONAL. CSS Selector for an HTML Element containing routes
 * @property {boolean} [hide] OPTIONAL. If TRUE, routes will be hidden/shown on change instead of removed/added
 * @property {boolean} [unload] OPTIONAL. If TRUE, route templates will be unloaded from DOM after access. Only useful with the `hide` option
 */

class UibRouter { // eslint-disable-line no-unused-vars
    //#region --- Variables ---
    /** Class version */
    static version = '1.0.1'

    /** Configuration settings @type {UibRouterConfig} */
    config
    /** Reference to the container DOM element - set in setup() @type {HTMLDivElement} */
    routeContainerEl
    /** The current route id after doRoute() has been called */
    currentRouteId
    /** The previous route id after doRoute() has been called */
    previousRouteId

    /** Internal only. Set to true when the _start() method has been called */
    #startDone = false
    //#endregion --- ----- ---

    //#region --- Internal Methods ---
    /** Class constructor
     * @param {UibRouterConfig} routerConfig Configuration object
     */
    constructor(routerConfig) {
        // Fetch is on desktop browsers since 2017 at latest. Not so much on mobile (Android!)
        // May need a polyfill on mobile or old browsers.
        if (!fetch) throw new Error('[uibrouter:constructor] UibRouter requires `fetch`. Please use a current browser or load a fetch polyfill.')

        if (!routerConfig) throw new Error('[uibrouter:constructor] No config provided')
        if (!routerConfig.routes) throw new Error('[uibrouter:constructor] No routes provided in routerConfig')
        // Add a default route container uf needed
        if (!routerConfig.routeContainer)routerConfig.routeContainer = '#uibroutecontainer'

        // Save the config
        this.config = routerConfig
        // Create/access the route container element, sets this.routeContainerEl
        this._setRouteContainer()

        // Load all external route templates async in parallel - NB: Object.values works on both arrays and objects
        // Note that final `then` is called even if no external routes are given
        Promise.all(Object.values(routerConfig.routes).filter(r => r.type === 'url').map(this._loadExternal)) // eslint-disable-line promise/catch-or-return
            .then(this._appendExternalTemplates)
            .then( () => { // eslint-disable-line promise/always-return
                // Everything is loaded so we can start
                this._start()
            } )
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

    /** Load fetched external elements to templates tags under the head tag
     * @param {HTMLElement[]} loadedElements Array of loaded external elements to add as templates to the head tag
     */
    _appendExternalTemplates(loadedElements) {
        const head = document.getElementsByTagName('head')[0]
        // Append the loaded content to the main container
        loadedElements.forEach(element => {
            if (Array.isArray(element)) {
                console.error(...element)
            } else {
                head.append(element)
            }
        })
    }

    /** Called once all external templates have been loaded */
    _start() {
        if (this.#startDone === true) return // Don't run this again

        // Listen for url hash changes and process route change
        window.addEventListener('hashchange', (event) => this._hashChange(event) )
        // Go to default route if no route in url and if a default is defined or ensure current route is shown
        this.doRoute()
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

    /** Create DOM route content from a route template (internal or external)
     * Route templates have to be a `<template>` tag with an ID that matches the route id.
     * @param {string} routeId ID of the route definition to use to create the content
     * @returns {boolean} True if the route content was created successfully, false otherwise
     */
    _createRouteContent(routeId) {
        const rContent = document.querySelector(`#${routeId}`)
        if (!rContent) {
            console.error(`[uibrouter:createRouteContent] No route template found for route selector '#${routeId}'. Does the link url match a defined route id?`)
            return false
        }
        const docFrag = rContent.content.cloneNode(true)
        // Have to re-apply the scripts to make them run - only for external templates
        if (this.isRouteExternal(routeId)) this._applyScripts(docFrag)
        // Create the route wrapper div with data-route attrib
        const tempContainer = document.createElement('div')
        tempContainer.dataset.route = routeId
        tempContainer.append(docFrag)
        // And finally try to append to the container
        try {
            this.routeContainerEl.append(tempContainer)
        } catch (e) {
            console.error(`[uibrouter:createRouteContent] Failed to apply route id '${routeId}'. \n ${e.message}`)
            return false
        }
        return true
    }

    /** Loads an external HTML file into a `<template>` tag, adding the router id as the template id.
     *  or returns an error array
     * @param {routeDefinition} routeDefinition Configuration for a single route
     * @returns {Promise<HTMLTemplateElement[]|[string,string,number,string]>} A promise that fulfills to an HTMLTemplateElement or an array containing error information
     */
    _loadExternal(routeDefinition) {
        // const id = singleConfig.src.split('/').pop().replace('.html','')
        const id = routeDefinition.id
        // @ts-ignore
        return fetch(routeDefinition.src)
            .then(response => {
                // Fetch failed?
                if (response.ok === false) return [routeDefinition.id, routeDefinition.src, response.status, response.statusText]
                return response.text()
            })
            .then((/** @type {string} */ htmlText) => {
                if (Array.isArray(htmlText)) return htmlText // if the fetch failed

                // Check to see if template already exists, if so, remove it
                try {
                    const chkTemplate = document.querySelector(`#${id}`)
                    if (chkTemplate) chkTemplate.remove()
                } catch (e) {}

                const tempContainer = document.createElement('template')
                tempContainer.innerHTML = htmlText
                tempContainer.setAttribute('id', id)
                return tempContainer
            })
            .catch(error => {
                console.error(`[uibrouter:loadHTML] Error loading route template HTML from ${routeDefinition.src}:`, error)
            })
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
    //#endregion --- ----- --

    /** Process a routing request
     * @param {PointerEvent|MouseEvent|HashChangeEvent|TouchEvent|string} routeSource Either string containing route id or DOM Event object either click/touch on element containing `href="#routeid"` or Hash URL change event
     */
    doRoute(routeSource) {
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

        // If no defined valid route, undo and throw error
        if (!newRouteId || !this.routeList().includes(newRouteId)) {
            // Events on route change fail ...
            document.dispatchEvent(new CustomEvent('uibrouter:route-change-failed', { detail: { newRouteId, oldRouteId } }))
            if (uibuilder) uibuilder.set('uibrouter', 'route change failed') // eslint-disable-line no-undef

            window.location.hash = oldRouteId ? `#${oldRouteId}` : ''
            throw new Error(`[uibrouter:doRoute] No valid route found. Either pass a valid route name or an event from an element having an href of '#routename'. Route id requested: '${newRouteId}'`)
        }

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
                routeShown = this._createRouteContent(newRouteId)
            }
        } else {
            // config.hide != true so remove previous contents
            container.replaceChildren()
            // Create new content from template
            routeShown = this._createRouteContent(newRouteId)
        }

        // console.log({ newRouteId, oldRouteId, currentHash, routeShown })

        // Roll back the route change if the new route cannot be shown
        if (routeShown === false) {
            // Events on route change fail ...
            document.dispatchEvent(new CustomEvent('uibrouter:route-change-failed', { detail: { newRouteId, oldRouteId } }))
            if (uibuilder) uibuilder.set('uibrouter', 'route change failed') // eslint-disable-line no-undef

            window.location.hash = oldRouteId ? `#${oldRouteId}` : ''
            return
        }

        // Retain current and previous route id's
        this.currentRouteId = newRouteId
        this.previousRouteId = oldRouteId

        // Record the current route on the route container
        container.dataset.currentRoute = newRouteId

        // Update any existing HTML menu items
        this.setCurrentMenuItems()

        // Events on route changed ...
        document.dispatchEvent(new CustomEvent('uibrouter:route-changed', { detail: { newRouteId, oldRouteId } }))
        if (uibuilder) {
            uibuilder.set('uibrouter', 'route changed')
            uibuilder.set('uibrouter_CurrentRoute', newRouteId)
            uibuilder.set('uibrouter_CurrentHeading', this.routeHeading())
            uibuilder.set('uibrouter_CurrentDetails', this.getRouteConfigById(newRouteId))
        }
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
        return Object.values(this.config.routes).map((r) => returnHash === true ? `#${r.id}` : r.id)
    }

    /** Add new route definitions to the existing ones
     * @param {routeDefinition|routeDefinition[]} routeConfig Single or array of route definitions to add
     */
    addRoutes(routeConfig) {
        if (!Array.isArray(routeConfig)) routeConfig = [routeConfig]
        // Load all external route templates async in parallel - NB: Object.values works on both arrays and objects
        // Note that final `then` is called even if no external routes are given
        Promise.all(Object.values(routeConfig).filter(r => r.type === 'url').map(this._loadExternal)) // eslint-disable-line promise/catch-or-return
            .then(this._appendExternalTemplates)
            .then( () => { // eslint-disable-line promise/always-return
                // Everything is loaded - Add new routes to config
                this.config.routes.push(...routeConfig)
                // Let everyone know it all finished
                document.dispatchEvent(new CustomEvent('uibrouter:routes-added', { detail: routeConfig }))
                if (uibuilder) uibuilder.set('uibrouter', 'routes added') // eslint-disable-line no-undef, promise/always-return
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

    routeHeading() {
        const thisRoute = this.currentRoute() || {}
        return thisRoute.heading || thisRoute.title || thisRoute.description || thisRoute.id || '[ROUTE NOT FOUND]'
    }

    currentRoute() {
        return this.getRouteConfigById(this.currentRouteId)
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
    // deleteTemplates(templateIds) {
    //     if (!Array.isArray(templateIds)) templateIds = [templateIds]
    //     templateIds.forEach( templateid => {
    //         // TODO delete
    //     } )
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
