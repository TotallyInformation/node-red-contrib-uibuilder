/**
 * Type definitions for uibuilder.module.js
 * WCAG 2.2 AA, ESLint v9, Shift-Left security, and project conventions applied.
 * @version 7.3.0
 * @author Julian Knight (Totally Information)
 */

export type HtmlString = string

/** Column metadata for tables */
export interface ColumnDefinition {
    index: number,
    hasName: boolean,
    title: string,
    name?: string,
    key?: string | number,
    dataType?: 'string' | 'date' | 'number' | 'html',
    editable?: boolean,
}

/** Options for building HTML tables */
export interface TableOptions {
    cols?: ColumnDefinition[],
    parent?: HTMLElement | string,
    allowHTML?: boolean,
}

/** Options for tblAddListener */
export interface TableListenerOptions {
    eventScope?: 'row' | 'cell',
    returnType?: 'text' | 'html',
    pad?: number,
    send?: boolean,
    logLevel?: string | number,
    eventType?: string,
}

/** Options for notification */
export interface NotificationConfig {
    title?: string,
    body?: string,
    return?: boolean,
    [key: string]: any,
}

/**
 * Uibuilder main class
 * @typicalname uibuilder
 * @description The client-side Front-End JavaScript for uibuilder in HTML Module form.
 * Provides a number of global objects that can be used in your own JavaScript.
 * See the docs folder `./docs/uibuilder.module.md` for details of how to use this fully.
 * @version 7.3.0
 * @author Julian Knight (Totally Information)
 */
export class Uib {
    /**
     * Static metadata for the Uibuilder client
     */
    static _meta: {
        version: string,
        type: string,
        displayName: string,
    }

    /** Client ID set by uibuilder on connect */
    clientId: string
    /** The collection of cookies provided by uibuilder */
    cookies: Record<string, string>
    /** Copy of last control msg object received from server */
    ctrlMsg: object
    /** Is Socket.IO client connected to the server? */
    ioConnected: boolean
    /** Is the library running from a minified version? */
    isMinified: boolean
    /** Is the browser tab containing this page visible or not? */
    isVisible: boolean
    /** Remember the last page (re)load/navigation type: navigate, reload, back_forward, prerender */
    lastNavType: string
    /** Max msg size that can be sent over Socket.IO - updated by "client connect" msg receipt */
    maxHttpBufferSize: number
    /** Last std msg received from Node-RED */
    msg: object
    /** Number of messages sent to server since page load */
    msgsSent: number
    /** Number of messages received from server since page load */
    msgsReceived: number
    /** Number of control messages sent to server since page load */
    msgsSentCtrl: number
    /** Number of control messages received from server since page load */
    msgsCtrlReceived: number
    /** Is the client online or offline? */
    online: boolean
    /** Last control msg object sent via uibuilder.send() */
    sentCtrlMsg: object
    /** Last std msg object sent via uibuilder.send() */
    sentMsg: object
    /** Placeholder to track time offset from server, see fn socket.on(ioChannels.server ...) */
    serverTimeOffset: number | null
    /** Placeholder for a socket error message */
    socketError: string | null
    /** Tab identifier from session storage */
    tabId: string
    /** Actual name of current page (set in constructor) */
    pageName: string | null
    /** Is the DOMPurify library loaded? Updated in start() */
    purify: boolean
    /** Is the Markdown-IT library loaded? Updated in start() */
    markdown: boolean
    /** Current URL hash. Initial set is done from start->watchHashChanges via a set to make it watched */
    urlHash: string
    /** Default originator node id - empty string by default */
    originator: string
    /** Optional default topic to be included in outgoing standard messages */
    topic?: string
    /** Either undefined or a reference to a uib router instance. Set by uibrouter, do not set manually. */
    uibrouterinstance?: any
    /** Set by uibrouter, do not set manually */
    uibrouter_CurrentRoute?: any
    /** Internal: auto-send ready flag */
    autoSendReady: boolean
    /** Node-RED setting (via cookie) */
    httpNodeRoot: string
    /** Socket.IO namespace - unique to each uibuilder node instance */
    ioNamespace: string
    /** Socket.IO path */
    ioPath: string
    /** Starting delay factor for subsequent reconnect attempts */
    retryFactor: number
    /** Starting retry ms period for manual socket reconnections workaround */
    retryMs: number
    /** Prefix for all uib-related localStorage */
    storePrefix: string
    /** Whether uibuilder client has started */
    started: boolean
    /** Socket.IO connection options */
    socketOptions: object

    // --- Getters/Setters ---
    logLevel: number
    meta: typeof Uib._meta

    /**
     * Set uibuilder properties to a new value - works on any property except _* or #*
     * Also triggers any event listeners.
     * @param prop Any uibuilder property who's name does not start with a _ or #
     * @param val The set value of the property or a string declaring that a protected property cannot be changed
     * @param store If true, the variable is also saved to the browser localStorage if possible
     * @param autoload If true & store is true, on load, uib will try to restore the value from the store automatically
     * @returns Input value
     */
    set(prop: string, val: any, store?: boolean, autoload?: boolean): any

    /**
     * Get the value of a uibuilder property
     * @param prop The name of the property to get as long as it does not start with a _ or #
     * @returns The current value of the property
     */
    get(prop: string): any

    /**
     * Write to localStorage if possible. Console error output if can't write
     * Also uses this.storePrefix
     * @param id localStorage var name to be used (prefixed with 'uib_')
     * @param value value to write to localstore
     * @param autoload If true, on load, uib will try to restore the value from the store
     * @returns True if succeeded else false
     */
    setStore(id: string, value: any, autoload?: boolean): boolean

    /**
     * Attempt to get and re-hydrate a key value from localStorage
     * @param id The key of the value to attempt to retrieve
     * @returns The re-hydrated value of the key or null if key not found, undefined on error
     */
    getStore(id: string): any

    /**
     * Remove a given id from the uib keys in localStorage
     * @param id The key to remove
     */
    removeStore(id: string): void

    /**
     * Returns a list of uibuilder properties (variables) that can be watched with onChange
     * @returns List of uibuilder managed variables
     */
    getManagedVarList(): Record<string, string>

    /**
     * Returns a list of currently watched variables
     * @returns List of watched variable names
     */
    getWatchedVars(): string[]

    /**
     * Register on-change event listeners for uibuilder tracked properties
     * @param prop The property of uibuilder that we want to monitor
     * @param callback The function that will run when the property changes, parameter is the new value of the property after change
     * @returns A reference to the callback to cancel
     */
    onChange(prop: string, callback: (val: any) => void): number

    /**
     * Cancel a previously registered onChange event listener
     * @param prop The property name
     * @param cbRef The callback reference number
     */
    cancelChange(prop: string, cbRef: number): void

    /**
     * Register a change callback for a specific msg.topic
     * @param topic The msg.topic we want to listen for
     * @param callback The function that will run when an appropriate msg is received
     * @returns A reference to the callback to cancel
     */
    onTopic(topic: string, callback: (msg: any) => void): number

    /**
     * Cancel a previously registered onTopic event listener
     * @param topic The topic name
     * @param cbRef The callback reference number
     */
    cancelTopic(topic: string, cbRef: number): void

    /**
     * Returns a new array containing the intersection of the 2 input arrays
     * @param a1 Array to check
     * @param a2 Array to intersect
     * @returns The intersection of the 2 arrays (may be an empty array)
     */
    arrayIntersect<T>(a1: T[], a2: T[]): T[]

    /**
     * Copies a uibuilder variable to the browser clipboard
     * @param varToCopy The name of the uibuilder variable to copy to the clipboard
     */
    copyToClipboard(varToCopy: string): void

    /**
     * Does the chosen CSS Selector currently exist?
     * @param cssSelector Required. CSS Selector to examine for visibility
     * @param msg Optional, default=true. If true also sends a message back to Node-RED
     * @returns True if the element exists
     */
    elementExists(cssSelector: string, msg?: boolean): boolean

    /**
     * Format a number using the INTL standard library
     * @param value Number to format
     * @param decimalPlaces Number of decimal places to include
     * @param intl standard locale spec, e.g. "ja-JP" or "en-GB"
     * @param opts INTL library options object
     * @returns formatted number
     */
    formatNumber(value: number, decimalPlaces?: number, intl?: string, opts?: object): string

    /**
     * Attempt to get rough size of an object
     * @param obj Any serialisable object
     * @returns Rough size of object in bytes or undefined
     */
    getObjectSize(obj: any): number | undefined

    /**
     * Returns true if a uibrouter instance is loaded, otherwise returns false
     * @returns true if uibrouter instance loaded else false
     */
    hasUibRouter(): boolean

    /**
     * Only keep the URL Hash & ignoring query params
     * @param url URL to extract the hash from
     * @returns Just the route id
     */
    keepHashFromUrl(url: string): string

    /**
     * Custom logging function
     * @param args Arguments to log
     */
    log(...args: any[]): void

    /**
     * Makes a null or non-object into an object. If thing is already an object.
     * If not null, moves "thing" to {payload:thing}
     * @param thing Thing to check
     * @param property property that "thing" is moved to if not null and not an object. Default='payload'
     * @returns Object
     */
    makeMeAnObject(thing: any, property?: string): object

    /**
     * Navigate to a new page or a new route (hash)
     * @param url URL to navigate to. Can be absolute or relative (to current page) or just a hash for a route change
     * @returns The new window.location string
     */
    navigate(url: string): Location

    /**
     * Convert a string attribute into a variable/constant reference
     * Used to resolve data sources in attributes
     * @param path The string path to resolve, must be relative to the `window` global scope
     * @returns The resolved data source or null
     */
    resolveDataSource(path: string): any

    /**
     * Fast but accurate number rounding
     * @param num The number to be rounded
     * @param decimalPlaces Number of DP's to round to
     * @returns Rounded number
     */
    round(num: number, decimalPlaces: number): number

    /**
     * Set the default originator. Set to '' to ignore. Used with uib-sender.
     * @param originator A Node-RED node ID to return the message to
     */
    setOriginator(originator?: string): void

    /**
     * HTTP Ping/Keep-alive - makes a call back to uibuilder's ExpressJS server and receives a 204 response
     * Can be used to keep sessions alive.
     * @param ms Repeat interval in ms
     */
    setPing(ms?: number): void

    /**
     * Convert JSON to Syntax Highlighted HTML
     * @param json A JSON/JavaScript Object
     * @returns Object reformatted as highlighted HTML
     */
    syntaxHighlight(json: object): HtmlString

    /**
     * Returns true/false or a default value for truthy/falsy and other values
     * @param val The value to test
     * @param deflt Default value to use if the value is not truthy/falsy
     * @returns The truth! Or the default
     */
    truthy(val: any, deflt: any): boolean | any

    /**
     * Joins all arguments as a URL string
     * @param paths URL fragments
     * @returns Joined URL string
     */
    urlJoin(...paths: string[]): string

    /**
     * Turn on/off/toggle sending URL hash changes back to Node-RED
     * @param toggle Optional on/off/etc
     * @returns True if we will send a msg to Node-RED on a hash change
     */
    watchUrlHash(toggle?: any): boolean

    /**
     * DEPRECATED FOR NOW - wasn't working properly.
     * Is the chosen CSS Selector currently visible to the user? NB: Only finds the FIRST element of the selection.
     * @returns False
     */
    elementIsVisible(): false

    // --- UI handlers ---
    /**
     * Simplistic jQuery-like document CSS query selector, returns an HTML Element.
     * If the selected element is a <template>, returns the first child element.
     * @param cssSelector A CSS Selector that identifies the element to return
     * @returns Selected HTML element or null
     */
    $: (cssSelector: string) => HTMLElement | null
    /**
     * CSS query selector that returns ALL found selections as an array of elements.
     * @param cssSelector A CSS Selector that identifies the elements to return
     * @returns Array of DOM elements/nodes. Array is empty if selector is not found.
     */
    $$: (cssSelector: string) => HTMLElement[]
    /**
     * Reference to the full ui library
     */
    $ui: any
    /**
     * Add one or several class names to an element
     * @param classNames Single or array of classnames
     * @param el HTML Element to add class(es) to
     */
    addClass(classNames: string | string[], el: HTMLElement): void
    /**
     * Apply a source template tag to a target html element
     * @param source The source element
     * @param target The target element
     * @param onceOnly If true, the source will be adopted (the source is moved)
     */
    applyTemplate(source: HTMLElement, target: HTMLElement, onceOnly: boolean): void
    /**
     * Builds an HTML table from an array (or object) of objects
     * @param data Input data array or object
     * @param opts Table options
     * @returns Output HTML Element
     */
    buildHtmlTable(data: object[] | object, opts?: TableOptions): HTMLTableElement | HTMLParagraphElement
    /**
     * Directly add a table to a parent element.
     * @param data Input data array or object
     * @param opts Build options
     */
    createTable(data?: object[] | any[], opts?: TableOptions): void
    /**
     * Converts markdown text input to HTML if the Markdown-IT library is loaded
     * Otherwise simply returns the text
     * @param mdText The input markdown string
     * @returns HTML (if Markdown-IT library loaded and parse successful) or original text
     */
    convertMarkdown(mdText: string): string
    /**
     * ASYNC: Include HTML fragment, img, video, text, json, form data, pdf or anything else from an external file or API
     * @param url The URL of the source file to include
     * @param uiOptions Object containing properties recognised by the _uiReplace function. Must at least contain an id
     */
    include(url: string, uiOptions: object): Promise<void>
    /**
     * Attach a new remote script to the end of HEAD synchronously
     * @param url The url to be used in the script src attribute
     */
    loadScriptSrc(url: string): void
    /**
     * Attach a new remote stylesheet link to the end of HEAD synchronously
     * @param url The url to be used in the style link href attribute
     */
    loadStyleSrc(url: string): void
    /**
     * Attach a new text script to the end of HEAD synchronously
     * @param textFn The text to be loaded as a script
     */
    loadScriptTxt(textFn: string): void
    /**
     * Attach a new text stylesheet to the end of HEAD synchronously
     * @param textFn The text to be loaded as a stylesheet
     */
    loadStyleTxt(textFn: string): void
    /**
     * Load a dynamic UI from a JSON web response
     * @param url URL that will return the ui JSON
     */
    loadui(url: string): void
    /**
     * Remove All, 1 or more class names from an element
     * @param classNames Single or array of classnames. If undefined, "" or null, remove all classes
     * @param el HTML Element to remove class(es) from
     */
    removeClass(classNames: string | string[] | undefined | null, el: HTMLElement): void
    /**
     * Replace or add an HTML element's slot from text or an HTML string
     * WARNING: Executes <script> tags! And will process <style> tags.
     * Will use DOMPurify if that library has been loaded to window.
     * @param el Reference to the element that we want to update
     * @param slot The slot content we are trying to add/replace (defaults to empty string)
     */
    replaceSlot(el: Element, slot: any): void
    /**
     * Replace or add an HTML element's slot from a Markdown string
     * Only does something if the markdownit library has been loaded to window.
     * Will use DOMPurify if that library has been loaded to window.
     * @param el Reference to the element that we want to update
     * @param component The component we are trying to add/replace
     */
    replaceSlotMarkdown(el: Element, component: any): void
    /**
     * Sanitise HTML to make it safe - if the DOMPurify library is loaded
     * Otherwise just returns that HTML as-is.
     * @param html The input HTML string
     * @returns The sanitised HTML or the original if DOMPurify not loaded
     */
    sanitiseHTML(html: string): string
    /**
     * Add table event listener that returns the text or html content of either the full row or a single cell
     * @param tblSelector The table CSS Selector
     * @param options Additional options
     * @param out A variable reference that will be updated with the output data upon a click event
     */
    tblAddListener(tblSelector: string, options?: TableListenerOptions, out?: object): void
    /**
     * Add a row to a table element in the DOM.
     * @param tbl The table element or selector to add the row to
     * @param rowData The data for the new row (object or array)
     * @param options Optional configuration for row creation
     * @returns The created HTMLTableRowElement
     */
    tblAddRow(tbl: string | HTMLTableElement, rowData: object | any[], options?: object): HTMLTableRowElement
    /**
     * Remove a row from a table element in the DOM.
     * @param tbl The table element or selector to remove the row from
     * @param rowIndex The index of the row to remove
     * @param options Optional configuration for row removal
     */
    tblRemoveRow(tbl: string | HTMLTableElement, rowIndex: number, options?: object): void
    /**
     * Show a dialog (notification or alert) in the UI.
     * @param type The dialog type: 'notify' or 'alert'
     * @param ui The UI configuration object for the dialog
     * @param msg Optional message object to include
     */
    showDialog(type: 'notify' | 'alert', ui: object, msg?: object): void
    /**
     * Apply a UI definition (JSON) to the current page.
     * @param json The UI definition object
     */
    ui(json: object): void
    /**
     * Get properties or values from UI elements matching a selector.
     * @param cssSelector The CSS selector for the elements
     * @param propName Optional property name to retrieve
     * @returns Array of property values or elements
     */
    uiGet(cssSelector: string, propName?: string): any[]
    /**
     * Enhance a DOM element with a UI component definition.
     * @param el The element to enhance
     * @param component The component definition or configuration
     */
    uiEnhanceElement(el: any, component: any): void

    // --- DOM/HTML cache ---
    /**
     * Clear the cached HTML content from memory or storage.
     */
    clearHtmlCache(): void
    /**
     * Restore HTML content from the cache into the DOM.
     */
    restoreHtmlFromCache(): void
    /**
     * Save the current HTML content to the cache for later restoration.
     */
    saveHtmlCache(): void

    // --- Message Handling ---
    /**
     * Send a standard message to Node-RED via Socket.IO.
     * @param msg The message object to send
     * @param originator Optional Node-RED node ID to return the message to
     */
    send(msg: object, originator?: string): void
    /**
     * Send a message to a specific room via Socket.IO.
     * @param room The room name
     * @param msg The message to send
     */
    sendRoom(room: string, msg: any): void
    /**
     * Join a Socket.IO room.
     * @param room The room name to join
     */
    joinRoom(room: string): void
    /**
     * Leave a Socket.IO room.
     * @param room The room name to leave
     */
    leaveRoom(room: string): void
    /**
     * Send a control message to Node-RED via Socket.IO.
     * @param msg The control message object to send
     */
    sendCtrl(msg: object): void
    /**
     * Send a custom message on a specific channel via Socket.IO.
     * @param channel The custom channel name
     * @param msg The message object to send
     */
    sendCustom(channel: string, msg: object): void
    /**
     * Upload a file to the server via Socket.IO.
     * @param file The file to upload
     * @param meta Optional metadata to send with the file
     */
    uploadFile(file: File, meta?: object): void

    // --- Socket.IO ---
    /**
     * Connect the Socket.IO client to the server.
     */
    connect(): void
    /**
     * Disconnect the Socket.IO client from the server.
     */
    disconnect(): void

    // --- Startup ---
    /**
     * Start the uibuilder client, initializing all features and connections.
     * @param options Optional startup options
     */
    start(options?: object): void

    // --- Show/hide ---
    /**
     * Show or hide the message area in the UI.
     * @param showHide If true, show the message area; if false, hide it
     * @param parent Optional parent selector or element
     * @returns True if the message area is shown, false if hidden
     */
    showMsg(showHide?: boolean, parent?: string): boolean
    /**
     * Show or hide the status area in the UI.
     * @param showHide If true, show the status area; if false, hide it
     * @param parent Optional parent selector or element
     * @returns True if the status area is shown, false if hidden
     */
    showStatus(showHide?: boolean, parent?: string): boolean

    // --- Watchers ---
    /**
     * Watch a DOM element for changes and optionally send updates to Node-RED.
     * @param cssSelector The CSS selector to watch
     * @param startStop Start, stop, or toggle the watcher
     * @param send If true, send updates to Node-RED
     * @param showLog If true, log watcher activity
     * @returns True if watching, false otherwise
     */
    uiWatch(cssSelector: string, startStop?: boolean | 'toggle', send?: boolean, showLog?: boolean): boolean
    /**
     * Watch the DOM for changes (e.g., for dynamic UI updates).
     * @param startStop Start or stop watching
     */
    watchDom(startStop: boolean): void

    // --- Notifications ---
    /**
     * Show a notification or alert in the UI.
     * @param config Notification configuration or string message
     * @returns A promise resolving to the notification event, or null
     */
    notify(config: NotificationConfig | string): Promise<Event> | null

    // --- Clipboard ---
    /**
     * Copy a uibuilder variable's value to the clipboard.
     * @param varToCopy The name of the uibuilder variable to copy
     */
    copyToClipboard(varToCopy: string): void
}

/** The default uibuilder instance */
declare const uibuilder: Uib

export { uibuilder }
export default uibuilder
