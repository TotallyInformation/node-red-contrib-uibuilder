/**
 * Type definitions for `uibrouter.mjs` - a simple, vanilla JavaScript front-end router class.
 * Included in node-red-contrib-uibuilder but is not dependent on it.
 * May be used in other contexts as desired.
 *
 * Gives IDE hint information (e.g. VS Code IntelliSense) for the `UibRouter` class
 * and its configuration whether loaded as an ES Module or via a script tag.
 *
 * For JavaScript users, add the following to the top of any JS file to enable
 * IDE hints for uibrouter (adjust the path as needed):
 *   /// <reference path="../uibuilder/utils/uibrouter.d.ts" />
 *
 * Copyright (c) 2023-2026 Julian Knight (Totally Information)
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
 *
 * @version 8.0.0-src
 * @author Julian Knight (Totally Information)
 */

/** Minimal type shape of the Markdown-IT library - only the parts used by uibrouter are defined
 * https://markdown-it.github.io/markdown-it
 */
export interface MarkdownIt {
    /** Render a Markdown string to HTML */
    render(mdText: string): string
    /** Load a Markdown-IT plugin. Pass the plugin function and, optionally, its options */
    use(plugin: unknown, options?: unknown): void
    /** Utility functions */
    utils: {
        /** Escape HTML characters in a string */
        escapeHtml(str: string): string,
    }
}

/** Options used when setting up the Markdown-IT library (see `UibRouter.mdOpts`) */
export interface MarkdownItOptions {
    /** Allow raw HTML in the source Markdown */
    html?: boolean,
    /** Use XHTML style self-closing tags */
    xhtmlOut?: boolean,
    /** Auto-convert URL-like text to links */
    linkify?: boolean,
    /** CSS class prefix applied to code blocks */
    langPrefix?: string,
    /** Custom code highlighting function. NB: the HighlightJS (hljs) library must be loaded for this to work */
    highlight?: (str: string, lang: string) => string,
    /** Any other Markdown-IT options are also allowed */
    [key: string]: unknown,
}

/** Single route configuration */
export interface RouteDefinition {
    /** REQUIRED. Route ID */
    id: string,
    /** REQUIRED for external routes, optional for internal (default=route id). CSS Selector for template tag routes, url for external routes */
    src?: string,
    /** OPTIONAL, default=internal route. 'url' for external routes */
    type?: 'url',
    /** OPTIONAL, default=route id. Text to use as a short title for the route */
    title?: string,
    /** OPTIONAL, default=route id. Text to use as a long description for the route */
    description?: string,
    /** OPTIONAL, default='html'. Route content format, HTML or Markdown (md). Markdown requires the Markdown-IT library to have been loaded */
    format?: 'html' | 'md' | 'markdown',
}

/** Single external load configuration */
export interface OtherLoadDefinition {
    /** REQUIRED. Unique (to page) ID. Will be applied to loaded content */
    id: string,
    /** REQUIRED. url of external template to load */
    src: string,
    /** REQUIRED. CSS Selector defining the parent element that this will become the child of. If it doesn't exist on page, content will not be loaded */
    container: string,
}

/** Single navigation menu configuration */
export interface RouteMenu {
    /** REQUIRED. Unique (to page) ID. Used as the menu container */
    id: string,
    /** OPTIONAL. Type of menu to create. Default is 'horizontal', 'vertical' is not yet supported */
    menuType?: 'horizontal' | 'vertical',
    /** OPTIONAL. Text to use as an accessible label for the nav element */
    label?: string,
}

/** UibRouter router configuration */
export interface UibRouterConfig {
    /** REQUIRED. Array of route definitions */
    routes: RouteDefinition[],
    /** OPTIONAL. Array of Markdown-IT plugins. Each entry is either the global library name string or an object whose single key is the global library name and whose value is the plugin options */
    mdPlugins?: Array<string | Record<string, unknown>>,
    /** OPTIONAL, default=1st route. If set to a route id, that route will be automatically shown on load */
    defaultRoute?: string,
    /** OPTIONAL, default='#uibroutecontainer'. CSS Selector for an HTML Element containing routes */
    routeContainer?: string,
    /** OPTIONAL, default=false. If TRUE, routes will be hidden/shown on change instead of removed/added */
    hide?: boolean,
    /** OPTIONAL, default=false. If TRUE, all external route templates will be loaded when the router is instanciated. Default is to lazy-load external templates */
    templateLoadAll?: boolean,
    /** OPTIONAL, default=true. If TRUE, route templates will be unloaded from DOM after access */
    templateUnload?: boolean,
    /** OPTIONAL, default=none. If present, router start will pre-load other external templates direct to the DOM. Use for menu's, etc. */
    otherLoad?: OtherLoadDefinition[],
    /** OPTIONAL, default=none. If present, router will create navigation menus for each entry defined in this array */
    routeMenus?: RouteMenu[],
}

/** A simple, vanilla JavaScript front-end router class
 * Included in node-red-contrib-uibuilder but is not dependent on it.
 * May be used in other contexts as desired.
 *
 * Custom events dispatched on `document`:
 * * `uibrouter:loaded` - When all internal and external routes have loaded.
 * * `uibrouter:route-changed` - When a route change is successful. `event.detail` contains `newRouteId` and `oldRouteId`.
 * * `uibrouter:route-change-failed` - When a route change fails and is rolled back. `event.detail` contains `newRouteId` and `oldRouteId`.
 * * `uibrouter:route-loaded` - When a route's content has been created in the DOM.
 * * `uibrouter:routes-added` - When new routes are added via `addRoutes()`. `event.detail` contains the added route definitions.
 */
export class UibRouter {
    // #region --- Variables ---

    /** Class version */
    static version: string

    /** Options for Markdown-IT if available (set in constructor) */
    static mdOpts: MarkdownItOptions

    /** Reference to pre-loaded Markdown-IT library */
    static md: MarkdownIt

    /** Configuration settings */
    config: UibRouterConfig

    /** Reference to the container DOM element - set in setup() */
    routeContainerEl: HTMLElement

    /** The current route id after doRoute() has been called */
    currentRouteId: string

    /** The previous route id after doRoute() has been called */
    previousRouteId: string

    /** Set of route ID's (created in constructor) */
    routeIds: Set<string>

    /** Safety counter - incremented on failed route changes to prevent route bounces */
    safety: number

    /** True if the uibuilder front-end client library is loaded on the page */
    uibuilder: boolean

    // #endregion --- ----- ---

    // #region --- Internal Methods ---

    /**
     * Class constructor
     * @param routerConfig Configuration object
     * @throws {Error} If a UibRouter instance already exists on the page, if `fetch` is not available,
     * if no config provided, if no routes provided in the config or if a non-default route container
     * selector does not match an element in the HTML
     */
    constructor(routerConfig: UibRouterConfig)

    /**
     * Save a reference to, and create if necessary, the HTML element to hold routes
     * @throws {Error} if the route container could not be set
     */
    _setRouteContainer(): void

    /**
     * Apply fetched external elements to templates tags under the head tag
     * @param loadedElements Loaded external element or array of loaded external elements to add as templates to the head tag
     * @returns Count of load errors
     */
    _appendExternalTemplates(loadedElements: HTMLElement | HTMLElement[]): number

    /** Called once all external templates have been loaded */
    _start(): Promise<void>

    /**
     * Called when the URL Hash changes
     * @param event URL Hash change event object
     */
    _hashChange(event: HashChangeEvent): void

    /**
     * Loads an external HTML file into a `<template>` tag, adding the router id as the template id. Or throws.
     * @param routeDefinition Configuration for a single route
     * @returns An HTMLTemplateElement that will provide the route content
     */
    _loadExternal(routeDefinition: RouteDefinition): Promise<HTMLTemplateElement>

    /**
     * Remove/re-apply scripts in a container Element so that they are executed.
     * @param tempContainer HTML Element of container to process
     */
    _applyScripts(tempContainer: HTMLElement | DocumentFragment): void

    /** Set up the Markdown-IT library if loaded */
    _markdownIt(): void

    /**
     * Normalise route definition arrays
     * @param routeDefns Route definitions to normalise
     */
    _normaliseRouteDefns(routeDefns: RouteDefinition | RouteDefinition[]): void

    /** Update this.routeIds array from this.config (on start and after add/remove routes) */
    _updateRouteIds(): void

    /**
     * If uibuilder in use, report on route change
     * @param newRouteId The route id now shown
     */
    _uibRouteChange(newRouteId: string): void

    // #endregion --- ----- ---

    /**
     * Create requested navigation menus
     * @param menus Array of menu definitions. Each entry is a routeMenu object
     */
    createMenus(menus: RouteMenu[]): void

    /**
     * Process a routing request
     * All errors throw so make sure to try/catch calls to this method.
     * @param routeSource Either string containing route id or DOM Event object either click/touch on element containing `href="#routeid"` or Hash URL change event
     * @throws {Error} If the safety protocol is triggered (too many route bounces) or if no valid route found
     */
    doRoute(routeSource?: string | HashChangeEvent | PointerEvent | MouseEvent | TouchEvent): Promise<void>

    /**
     * Load other external files and apply to specific parents (mostly used for externally defined menus)
     * @param extOther Required. Array of objects defining what to load and where
     * @throws {Error} If no extOther provided or if fetch fails
     */
    loadOther(extOther: OtherLoadDefinition | OtherLoadDefinition[]): void

    /**
     * Async method to create DOM route content from a route template (internal or external) - loads external templates if not already loaded.
     * Route templates have to be a `<template>` tag with an ID that matches the route id.
     * Scripts in the template are run at this point.
     * All errors throw so make sure to try/catch calls to this method.
     * @param routeId ID of the route definition to use to create the content
     * @param routeParentEl OPTIONAL, default=this.routeContainerEl (master route container). Reference to an HTML Element to which the route content will added as a child.
     * @returns True if the route content was created successfully, false otherwise
     */
    loadRoute(routeId: string, routeParentEl?: HTMLElement): Promise<boolean>

    /**
     * Async method to ensure that a template element exists for a given route id.
     * If route is external, will try to load if it doesn't exist.
     * All errors throw so make sure to try/catch calls to this method.
     * @param routeId A single route ID
     * @returns A reference to the HTML Template element
     */
    ensureTemplate(routeId: string): Promise<HTMLTemplateElement>

    /**
     * Return a route config given a route id (returns undefined if route not found)
     * @param routeId Route ID to search for
     * @returns Route config for found id else undefined
     */
    getRouteConfigById(routeId: string): RouteDefinition | undefined

    /**
     * Return true if the given route is external, false otherwise.
     * Used to correctly (re)apply script tags when cloning the template to the DOM (createRouteContent)
     * @param routeId Route ID to check
     * @returns True if the given route is external, false otherwise
     */
    isRouteExternal(routeId: string): boolean

    /** Go to the default route if it has been specified */
    defaultRoute(): void

    /** Remove the hash from the browser URL */
    removeHash(): void

    /** Empty the current container and remove url hash - does not trigger a route change */
    noRoute(): void

    /**
     * Only keep anything after the # & ignoring query params
     * @param url URL to extract the hash from
     * @returns Just the route id ('' if no hash present)
     */
    keepHashFromUrl(url: string): string

    /**
     * Return an array of route ids (to facilitate creation of menus)
     * @param returnHash If true, returns id's with leading `#` to apply to href attributes else returns the id
     * @returns Array of route id's or route url hashes
     */
    routeList(returnHash?: boolean): string[]

    /**
     * Add new route definitions to the existing ones
     * @param routeDefn Single or array of route definitions to add
     */
    addRoutes(routeDefn: RouteDefinition | RouteDefinition[]): void

    /**
     * Remove a template from the DOM (optionally external templates only)
     * @param routeId REQUIRED. The route id of the template to remove (templates are ID's by their route id)
     * @param externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
     */
    unloadTemplate(routeId: string, externalOnly?: boolean): void

    /**
     * Remove ALL templates from the DOM (optionally external templates only)
     * @param templateIds OPTIONAL, default=ALL (or '*'). Array of template (route) id's to remove
     * @param externalOnly OPTIONAL, default=true. If true only remove if routeId is an external template
     */
    deleteTemplates(templateIds?: string | string[], externalOnly?: boolean): void

    // #region --- utils for page display & processing ---

    /** Mark/unmark menu items to highlight the currently shown route */
    setCurrentMenuItems(): void

    /**
     * Return the title of the current route
     * @returns Current route title
     */
    routeTitle(): string

    /**
     * Return the description of the current route
     * @returns Current route description
     */
    routeDescription(): string

    /**
     * Return the current route configuration
     * @returns Current route configuration or undefined if not found
     */
    currentRoute(): RouteDefinition | undefined

    /**
     * Use Markdown-IT to render Markdown to HTML
     * https://markdown-it.github.io/markdown-it
     * @param mdText Markdown string
     * @returns HTML rendering of the Markdown input (undefined if the Markdown-IT library is not loaded)
     */
    renderMarkdown(mdText: string): string | undefined

    // #endregion ---- ----- ----
}

// For use in ESM loads
export default UibRouter

/** The `UibRouter` class constructor type (used for the global declarations below) */
type UibRouterConstructor = typeof UibRouter

/** Auto-assign for when the library is loaded via a script tag (IIFE build) */
declare global {
    /** Reference to the `UibRouter` class, auto-assigned by the library unless it already exists */
    var UibRouter: UibRouterConstructor

    interface Window {
        /** Reference to the `UibRouter` class, auto-assigned by the library unless it already exists */
        UibRouter: UibRouterConstructor,
    }
}
