---
title: uibuilder Roadmap
description: >
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
lastUpdated: 2023-03-05 18:05:36
---

Is there something in this list you would like to see prioritised? Is there something you could help with? Please get in touch via the [Node-RED forum](https://discourse.nodered.org/). Alternatively, you can start a [discussion on GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) or [raise a GitHub issue](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Please note that I no longer have the time to monitor the #uibuilder channel in the Node-RED slack.

## Aims and the future

### uibuilder aims and overall direction

_THIS NEEDS AN UPDATE_

The general direction of uibuilder (or associated modules) that I would like to see includes:

* _STARTED_, see [node-red-experimental-nodes](https://github.com/TotallyInformation/node-red-experimental-nodes). A set of extension front-end components with well defined (reusable) data schemas for doing common UI tasks. The defined data schema's would cover both the component content and configuration data so that both could be sent from Node-RED via uibuilder and any return data structures would similarly be well defined.
* _STARTED_, see the new front-end library in the above module. A capability to have configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code.
* A UI designer allowing users without HTML/CSS/JS skills to create reasonable web apps without code.

Information also needs to be provided to enable people to build security, identity, authentication and authorisation. As at v5, the experimental security features in uibuilder have been removed as they were never complete and were holding back other development. Security of web apps is best done using a dedicated service anyway. Typically a reverse-proxy using a web server can be used to provided integrated security and authentication.

### Focus for the near future

_THIS NEEDS AN UPDATE_

The following is the immediate direction. These are not likely to be incuded in v5.0.0 but are likely to be added to v5.1 or maybe a little later.

Current focus (beyond what has already been developed) is on:

* Continuing to improve  the zero-code features.
* Ensuring that control is easy from both front-end code and Node-RED flows. Creating visible elements and updating them should be easy and consistent.
* Ensuring the information from the UI and the uibuilder client is easy to recover and use either in front-end code or in Node-RED.
* Add further options for efficiency - such as easy ways to save updated HTML such that it will be used on new connections and reloads.
* Continuing to improve the documentation. Updating details and changes, adding how-to's, moving some things from the WIKI. Improving language consistency.
* Creating more YouTube videos.

Next immediate focus will be on:

* Enabling instance npm scripts to be run from the Editor.

### Longer term focus

_THIS NEEDS AN UPDATE_

* Creating usable components that have standardised data interfaces. So that other developers can produce similar outputs with different frameworks but the data that is exchanged with Node-RED remains the same. These components should make things easy that flow designers might typically want to do (notifications, forms, charts, tables, drag-and-drop, etc.)
* Creating a visual layout generator to bridge the gap between uibuilder and Dashboard. Ideally this would be non-framework specific but this seems a very unlikely goal to hit. Would be happy for this to either use web components, Svelte or VueJS.
* Add *option* to auto-install npm dependencies on change of Template (and possibly run an install script).
* Possibly the addition of a `uib-dashboard` node that uses data-driven composition. As a half-way house between code-driven and visual-layout approaches.

---

## In Progress

To see what is currently being developed, please look at the "Unreleased" section of the [Changelog](changelog)

----

## vNext - the next release after current (v6.2)

* **NEW NODE** - `uib-html` - Hydrates `msg._ui` configurations

  Uses the same code as the client library. Outputs HTML on `msg.payload`, removes the input `msg._ui`.
  Optionally, can add one of the uibuilder templates as a wrapper to the input payload HTML or wrap in a non-uibuilder template

  Why?

  - Learn how to write your own HTML
  - Output to a uibuilder node to save processing the _ui data in the front-end
  - Output to a uibuilder server folder for use in your app as a static load (or occasionally changing load)
  - Output to a file for use in an external (to Node-RED) static web server/service
  - Output to an `http-out` node as a response to a request
  - Output to a `ui_template` node for incorporation in Dashboard UI's

* **NEW NODE** - `uib-save` - Easily save files to uibuilder-specific locations

  Select a deployed uibuilder node as the "parent" and the server folder location will be set for you so that you don't need to remember it.

  Why?

  - Save `msg._ui` configuration data to a static JSON which can then be used to load an entire UI on page load.
  - Save/update files that are automatically available via the uibuilder web. For example a static web page that is perhaps updated periodically. This could also work with data, JavaScript, CSS, etc. In fact anything that can be serialised or that is already a string.
  - Use with the `uib-html` node to save static HTML files built via `uib-element` or some other flow that outputs `msg._ui` configurations.

* **NEW NODE** - `uib-get` - Gets data from a page's DOM. Will use the `uiGet` function.

  e.g. Get the number of rows in a table or list. Get the ID of the first `div`. Get the current value of an input field.

* Continuing documentation improvements
  * `README.md`: Add more links to the Features section so that each feature points to appropriate documentation. Add a landing-page link to "includes many helper features" to signpost to relavent detailed documentation.
  * Node-specific docs.
  * Reorg docs to make more sense to new starters & make more logical.

* Update _ui handling to allow filtering on page name. Add `pageName` as an option to all ui instructions. Change client to check for pageName and ignore if it doesn't match.
* Improve client `eventSend` to put form values into payload along with data-* attributes.

## Next - these are things that need to be done

* Change fixed text to use `RED._` for l8n. See: https://discourse.nodered.org/t/flexdash-alpha-release-a-dashboard-for-node-red/65861/48.

* Allow control of browser html cache from Node-RED. Add an auto-restore on load option. (? Add send updates back to Node-RED option - control msg ?)
* Allow control of showMsg from Node-RED.

* Improvements to `uib-cache` node
  * CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC
  * Output node.warn msg if recv input with no "Cache by" msg prop. (e.g. no msg.topic for default setting)
  * Add cache clear button to complement the cache clear control msg
  * Add optional page filter - a cache with a page filter will only send the cache if the replay request is from that page. Page filters need to allow a list of pages and ideally wildcards.
  * Allow send to client id - would need clientId to _socketId map to be maintained by uibuilder.
  * Add checks to prevent non-string cache by property values.
  * Add empty cache button.
  * Think about impact of a cache clear (affects all connected clients)

* Impovements to `uib-sender` node

  * CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC

* Extensions to the `uib-element` node
  * Disable or hide inputs when unused for a specific type.
  * As more element types are added, group into types: main, add, form, etc
  * ? Have JSON input msg templates for each type with links to copy to clipboard ?
  * ?? update mode - change to replace mode? Replace mode looks for root id, if found, replace outerHTML, if not found add.
  * Add more elements:
    * [x] List (ul, ol, dl)
      * Future improvements:
        * Better validation of input data
        * list-style-type (add to outer) - several options plus text (incl emoji's)
        * ? Optional list leading/trailing text ?
    * [x] Table
      * Future improvements:
        * Better validation of input data
        * Caption
        * If named row comes from a field, make sure it is the 1st col and marked as a th
        * Add data-row-name to td's as well
    * [x] HTML - allow raw html to be sent - e.g. from template node
    * [x] Page Title
    * [x] tr - Add a row to an existing table
    * [x] li - Add a row to an existing ul/ol list
      * Future improvements:
        * Better validation of input data
        * list-style-type (add to outer) - several options plus text (incl emoji's)
    * [x] Card/Article
      * Future improvements:
        * Better layout, more optional internal structure (footer, etc)
    * [x] Simple Form - Input types: button, checkbox, color, date, detetime-local, email, hidden, month, number, password, radio, range, tel, text, time, url, week
      * Future Improvements:
        * Better validation of input data
        * Additional input types: select, combo, file, image, textarea.
        * Eventually add extended inputs such as HTML WYSIWYG/Markdown
        * Add Auto-complete for text inputs
        * If no button added, make each input send changes direct - or possibly add that as an optional setting.
    * [ ] Status Box, Status Panel - [ref](https://discourse.nodered.org/t/web-endpoint-status-dashboard-uibuilder-zero-code-example/75740)
    * [ ] Grid/Flex-Grid (with option to turn on visible grid to help with layout)
    * [ ] Markdown - allow raw Markdown to be sent similar to the HTML element (will require the Markdown-IT library to be loaded)
    * [ ] Form
      * [ ] Select - https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html
      * [ ] Inputs: incl text, number, time, date, colour picker, ...
      * [ ] button (NB: add type="button" to avoid form submit issues, click=uibuilder.eventSend by default)
    * [ ] Para (with a section title and multiple paragraphs, optional html in text, ?optional markdown?)
    * [ ] tbody
    * [ ] iFrame - https://flows.nodered.org/node/node-red-node-ui-iframe
    * [ ] notify (globalNotification)
    * [ ] Modal Dialogue
    * [ ] LED (on/off/colour/brightness) - ref: node-red-contrib-ui-led
    * [ ] Status timeline. https://github.com/hotNipi/node-red-contrib-ui-state-trail/blob/master/ui-state-trail.js (Maybe uPlot with timeline plugin)
    * [ ] Image. Buffer->data uri->img tag, data uri->img tag, filename->img tag. [ref](https://flows.nodered.org/node/node-red-contrib-image-tools)
    * [ ] Container (with option for drag/drop of contents) [ref](https://discourse.nodered.org/t/is-there-a-pallete-that-can-do-this/75143?u=totallyinformation)
    * [ ] Style/Theme changer.
    * [ ] Segmented vertical/horizontal status/progress panel. For things like battery displays, etc.

  * ??? How to allow EXTERNAL element definitions ??? e.g. Someone else's contributed package.

* Extensions to the `uib-update` node
  * ?? Consider if worth adding a way to update a front-end javascript variable directly ??

* Continue to improve the new `uib-brand.css`
  * Parameterise other aspects such as font-size, typeface, varient colours, flexbox & grid spacing. `
  * Create min version of css.
  * Something similar to the sidebar status panel but segmented. Choose number of segments.
  * Make `input[type="color"]` starting colour the brand colour. Can only be done via JavaScript.
  * Check `input:valid` pseudo-class defaults

* Extensions to FE Library
  * Control from Node-RED. Functions to implement:
    * [x] get/set
    * [x] showMsg(boolean, parent=body)
    * [x] showStatus(boolean, parent=body)
    * [ ] uiGet (probably better to implement the `uib-get` node?)
    * [ ] `clearHtmlCache()`, `saveHtmlCache()`, `restoreHtmlFromCache()`
    * [ ] htmlSend()
    * [ ] getStore, setStore, removeStore
    * [ ] watchDom(startStop), uiWatch(cssSelector)
    * [ ] reload, navigate(url)
    * [ ] setPing
    * [ ] `elementExists(selector)`, `elementIsVisible(selector)`

  * New functions:
    * `htmlSend()` - sends the current web page back to Node-RED.
    * `uiWatch(cssSelector)` - watches for any changes to the selected nodes and uses `uiGet` to send useful data back to Node-RED automatically. It should also trigger a custom event to allow front-end processing too.
    * `uiUpdate(cssSelector, data)` - mirroring the `uib-update` node's features & allowing easy DOM updates from front-end code as well.
    * `elementExists(selector)`, `elementIsVisible(selector)` -  methods for checking if an element exists on the page and whether it is visible to the user.
    * `uibuilder.cacheSend()` and `uibuilder.cacheClear()` - send ctrl msgs back to node-red - reinstate in uib-cache fn now we've removed extra ctrl send.
    * `uibuilder.showLog()` - Add a visible panel on-page to show console.log output. Redirects (or maybe copies) uibuilder.log output - possibly also console.log. Will need amendments to the uibuilder.log function to give options for output to this and/or back to Node-RED.

  * Add `window.uib` as a synonym of `window.uibuilder`.
  * Add flags to track if the optional Markdown-IT or DOMPurify libraries are loaded and available.
  * Consider watching for a url change (e.g. from vue router) and send a ctrl msg if not sending a new connection (e.g. from an actual page change).
  * Option for a pop-over notification to manually reconnect the websocket.
  * Add manual socket.io reconnection function so it can be incorporated in disconnected UI notifications.
  * Investigate use of [PerformanceNavigationTiming.type](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type) to detect page load type and inform uibuilder on initial message.
  * Fix start options load style sheet https://discourse.nodered.org/t/uibuilder-new-release-v5-1-1-some-nice-new-features-and-illustration-of-future-features/64479/16?u=totallyinformation

  * Add ability to save the current DOM.
    * _started_ To local storage - with option to reload on reload
    * Send to Node-RED as a control msg (whole HTML or from a CSS Selector)

  * _UI - improvements to the config-/data-driven UI creation features
    * Add optional page filter to _ui - if `msg._ui.pageName` not matching current page, don't process
       - probably needs list and wildcard though.
    * Add handling for `_ui.components[n].slots` where slots is an object of named slots with the special 
       name of `default` for the default slot (default must be handled first since it overwrites all existing slots)
    * Add check to uibuilder.module.js to prevent adding of multiple entries with same ID
    * Add HTML loader capability to _ui handling (see html-loader web component)
    * Allow adding to more locations: ~~1st child rather than last~~ (done), next/previous sibling
    * Add click coordinates to return msgs where appropriate. See https://discourse.nodered.org/t/contextmenu-location/22780/51
  
  * Extend logging functions:
    * Report socket.io setup/config issues back to Node-RED using `beaconLog(txtToSend, logLevel)`.
    * _started_ Add showLog function similar to showMsg - showing log output to the UI instead of the console.
    * Add option to send log events back to node-red via the `navigator.sendBeacon()` method.
        * uibuilder node will output control msg of type `Client Log` when client sends a beacon.
        * Make optional via flag in Editor with start msg enabling/disabling in client.
        * ? window and document events - make optional via uibuilder fe command.
      
  * Add a standard tab handler fn to handle tab changes. Are DOM selectors dynamic (do they update with new DOM elements)? If not, will need to include a DOM observer.
  * Extend clearHtmlCache, restoreHtmlFromCache, saveHtmlCache fns to allow *sessionCache*.
  * Add a `uibuilder.navigate(url)` function to allow a msg from node-red to change the page. Ensure it works with SPA routers and with anchor links.
  * Add a [resizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to report resize events back to Node-RED as a control msg.
  * Consider watching for a url change (e.g. from vue router) and send a ctrl msg if not sending a new connection (e.g. from an actual page change).
  * Look at [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt), [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) and [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - should _ui implement these?
  * Get better control over what control messages can be sent. Centralise the list of control messages in use.
  
  * Allow for PWA use:
    * Check for OFFLINE use and supress transport errors
    * Add check for online/offline - make available to user code
    * Auto-generate manifest and sw.js - need icon and to set names/urls/etc
    * https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests
    * Allow push API interface as well as websocket. https://developer.mozilla.org/en-US/docs/Web/API/Push_API

  * Accessibility
    * Need to add a dismiss button to toasts
    * Check all auto-added elements for accessibility
    * Add count of current errors to title

* Updates to `uibuilder` node

  * Add option to process a crafted msg from the FE that returns a JSON list of all files/folders (optionally recursive) - needs change to FE library & editor.
    * In Editor, set the top-level permitted folder - relative to the `Serve` folder (e.g. If serving `<instanceRoot>/src`, that would be the default root but allow a sub-folder to be set, e.g. `content` so that only `<instanceRoot>/src/content` and below could be queried). This is to facilitate the creation of content management systems.
    * Possibly also needs option as to whether data can be written back. Including options to create/delete as well as amend. To begin with, just output any changed data to port 1 and let people create their own write-back logic.

  * Gracefully handle when rename cannot (re)move original folder (e.g. held open by browser).
  * Files: Changing filetype in editor does not change the highlighting.
  * On template load, issue reload command to all connected clients.
  
  * Ensure that uibRoot is set to a project folder if projects in use. See [PR#47](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/47) and [Issue #44](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/44)
  * Improve handling for when Node-RED changes projects.
  * Use new `uib-brand.css` style library on details pages.
  * Add api to query if a specific uib library is installed (and return version)
  * Add API test harness using VScode restbook.
  * Add 4th cookie to record the Node-RED web URL (e.g. `http://x.x.x.x:1800/`) since uibuilder can now use a different server, it is helpful if the front-end knows the location of Node-RED itself.
  * Allow instance npm installs to be served (would allow both vue 2 and vue 3 for example). Instance serves to take preference. Would need extension to editor libraries tab to differentiate the locations.
  * Centralise the list of control messages in use.
  * Add occasional check for new version of uib being available and give single prompt in editor.
  * Improve checks for rename failures. `[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal.` - these should clear after restart but sometimes don't.
  * Trace report for not loading uibMiddleware.js but not for other middleware files. Doesn't need a stack trace if the file isn't found and probably not at all. Make everything consistent. "uibuilder common Middleware file failed to load. Path: \src\uibRoot\.config\uibMiddleware.js, Reason: Cannot find module '\src\uibRoot\.config\uibMiddleware.js'". "sioUse middleware failed to load for NS" - make sure that middleware does not log warnings if no file is present. [ref](https://discourse.nodered.org/t/uibuilder-question-on-siouse-middleware/75199?u=totallyinformation).
  * Introduce standard events: url-change (so that all uib related nodes can be notified if a uib endpoint changes url).
  * uibindex change "User-Facing Routes" to "Client-Facing Routes".

  * Editor:
    * Add template description to display.
    * Add dependency version handling to templates (e.g. vue 2/3)
    * Switch tooltips to using aria-label with hover CSS as in the new node.
    * Remove scripts/css flags from uibuilder panel, no longer in use (not while old client library still in use)
    * Change getFileList to only return files, use the separate folder list for folders. No need to run it multiple times then.
    * Update the `Advanced > Serve` dropdown list after creating a new top-level folder (to save having to exit and re-enter the panel).
    * settings.js option to allow _ files to show in editor. https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/190.
    * Creating new folder - new folder should be selected after create.
    * NEW TAB: `Build` - run npm scripts, install instance libraries (for dev or dependencies - just dev initially)
    * Add visual error when changing advanced/Serve to a folder with no index.html.
    * Option for project folder storage.
    * Better icons! See https://discourse.nodered.org/t/wish-for-new-nodes/73858/20
    * Libraries tab
      * Add update indicator to Libraries tab.
      * Trigger indicator to Libraries to show if new major version available when switching to the tab.
    * Consider adding an action for when a uibuilder node is selected - would open the web page. https://discourse.nodered.org/t/call-link-from-node-red-editor-ctrl-shift-d/73388/4
    * Add optional sidebar (or drop-down menu on NR header bar) displaying list of all uib URLs (and link to nodes).
    * Move folder management to a popup dialog (to save vertical space)
    * If `uibRoot` and the browser are on the same client, add an "Edit with VSCode" link to the Files tab
    * Add all local package.json script entries as links/buttons so they can be run from the editor panel.
      * If `dev` script discovered in local package.json scripts, enable a dev button so that a CI dev service can be spun up (e.g. Svelte). Will need debug output to be visible in Editor?
    * Show Socket.io server & client versions
    * Extend folder/file management
      * Allow renaming of files/folders.
      * Add the `common` folder to the file editor.
      * Allow editing in the `common` folder not just the instance folder.
      * Add a file upload button.
      * Method to import/export front-end files. Needs ZIP/Unzip functions at the back-end.
      * Add a reminder to the Editor help about examples. Add an onclick to that <a> icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.

  * Details index page
    * Make sure that the ExpressJS `views` folder is shown.

  * Templates
    * Add group/category to `template_dependencies.js`. Add grouping to drop-down in editor. Allow for no group specified (for backwards compatibility).
    * Add option for external templates in `template_dependencies.js`.
    * Consider allowing a local version of `template_dependencies.js`.
    * Add descriptions when chosen.
    * Maybe add as external templates.
      * Vue v3 (build)
      * Vue v3 + Quasar
      * REACT (no-build)
      * REACT (build)
      * jQuery + jQuery UI (maybe + some add-ons?)

  * Investigate use of WebWorkers to have a shared websocket that allows retained connection on page reload and between pages in the same uibuilder node.
    * https://crossbario.com/blog/Websocket-Persistent-Connections/
    * https://stackoverflow.com/questions/10886910/how-to-maintain-a-websockets-connection-between-pages


* `package-mgt.js`
  * Rationalise the various functions - several of them have similar tasks.

* `socket.js`
  * Add rooms: page, User id, Tab id - will allow broadcasts to a specific page, user or individual tab and will not be purely reliant on the `_socketId` which can change.
  * When a new client connection is made, use `socket.emit('join', tabId)`
  * Output to a room using `io.to(tabId).emit(...)`
  * https://socket.io/docs/v4/rooms/


* Updates to Documentation
  * Add the `replace` type to the `config-driven-ui.md` document.
  * Search for `*(This document is a work-in-progress, it is not complete)*` and update documents.
  * Update glossary with ESM, ECMA, UMD, IIFE
  * Add CSS Selectors how-to with typical examples. e.g. element with id, element with class, nth list entry/table row.
  * Split the new client library, move _ui features to separate page.
  * Add message interaction diagram to "pre-defined-msgs.md"
  * Add note to documentation for the library manager that you can install LOCAL folders.
  * Finish [Configuring uibuilder](uib-configuration?id=ltuibrootgtltinstance-urlgt) and [Configuring uibuilder nodes](uib-node-configuration.md) pages.
  * Add some notes about Node-RED's projects feature. It doesn't seem to add a correct .gitignore which should contain `**/node_modules`. Also add notes about the fact that projects creates a disconnect between the flows and the userDir folder.
  * Add new doc to explain the HTML document hierarchy.



* **[STARTED]** Provide option to switch from static to rendering to allow dynamic content using ExpressJS Views.

  Currently available by adding the appropriate ExpressJS option in settings.js.

* Examples
  * Reproduce the examples from the [pdfmaker website](http://pdfmake.org/playground.html) since that uses a similar-style config-driven approach to uibuilder's low-code, config-driven UI feature. See especially the _tables_ example.

* Changes needed for future versions of node.js (will be updating uib in line with Node-RED v3)
  * Node.js v14 features - code updates to leverage the latest features
    * Replace `||` default value tests with `??` .
    * Replace checks for if a property exists with `?.` - [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

    * https://nodejs.org/en/about/releases/, https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V14.md, https://node.green/
    * [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
    * [Nullish Coalescing](https://wiki.developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_Coalescing_Operator)
    * [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DisplayNames)
    * [calendar & numberingSystem for Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
    * Private Class methods (v14.5.1+)
    * WeakReferences (v14.5.1+)
    * Array flat and flat map
    * Optional catch binding
    * Object.fromEntries (helps make an object either from Map or from a key/value array)
    * **ESM IS STILL EXPERIMENTAL**
    * Corepack https://nodejs.org/dist/latest-v14.x/docs/api/corepack.html
    * Diagnostic reports. https://developer.ibm.com/articles/introducing-report-toolkit-for-nodejs-diagnostic-reports/, https://github.com/IBM/report-toolkit

  * Changes due once Node.js v16 live:
    * JSON Modules (experimental in v14, full in 16.15.0)
    * Object.hasOwn is a static alias for Object.prototype.hasOwnProperty.call (16.9.0)
    * [Error cause](https://v8.dev/features/error-cause) (16.9.0)
    * [Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) (16.6.0)
    * Stable Timers Promises API, RegExp Match Indices, which provide the start and end indices of the captured string (16.0.0)

  * Changes due once Node.js v18 live
    * Test Runner module (experimental 18.0.0)
    * [`findLast` and `findLastIndex` array methods](https://v8.dev/features/finding-in-arrays) (18.0.0)
    * Top-level await (experimental in v14 - behind flag, full in v18)

  * Changes due once Node.js post v18
    * Diagnostic channels (experimental in v14)
    * AbortController and AbortSignal (experimental in v14)
    * Fetch (Experimental 16.15.0, 18.0.0)



## Ideas for releases further out

### General

* Optimise runtime code using esbuild (see node-build.mjs). Reduce runtime dependencies by bundling and move deps to dev deps.
* Allow client id to be set externally.
* ? Add client identifier chooser to cache node - allowing use of different msg props to identify a specific client
* Change cache & main nodes to use client id rather than socket id where available. Since that is less likely to change.

* Use [chokidar](https://github.com/paulmillr/chokidar) to send a control msg to the fe when files change. Change the front-end to allow the browser to automatically reload (location.reload()). Put everything behind an optional flag and don't load the chokidar library unless the flag is set. May want an auto-rebuild feature as well.

* Add package.json `style` property to Instance details page and packages list if it exists.

* Add Web Reporting API endpoint(s). Set a header to tell the client where to report to. Reports are JSON and so could be directed out of port 2 as a new control msg type. See https://web.dev/reporting-api/ & https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API.

* Add Notifications API support. See https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API & https://developer.mozilla.org/en-US/docs/Web/API/notification.

* Add option to log http(s) requests to control output port

* Switch to [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) for require's with low probability of usage. [ref](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_import_expressions).

* Migrate from commonjs to [ES modules](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_commonjs_json_and_native_modules). (2) [JSON can't be imported directly in ESMs](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_json_modules), use createRequire.

* Add funding link to package.json (see `man 5 package.json`)

* Maybe switch package.json reads to [npm/read-package-json: The thing npm uses to read package.json files with semantics and defaults and validation and stuff (github.com)](https://github.com/npm/read-package-json)?

 
* Add settings.js options to use different paths/names for middleware files.

* Add socket.io instrumentation server. See https://socket.io/docs/v4/admin-ui/

* Once Node-RED's baseline node.js version has moved passed v12.20, can update `execa` and use dynamic imports (and change README notes on scorecard). Once it has moved into v14, can simplify the socket.js class by reinstating the optional chaining.

* Move socket.io client to dev deps and remove serve from web.js (new library builds it in) - can't do until uibuilderfe is deprecated? Or updated to include (breaking chg)

* Consider the use of `RED.comms.publish('uibuilder:some-event-name', data, retainFlag)` to push data to the editor

* Consider allowing addition of HTTP request headers to control msgs

* Consider allowing control msg for each request

### Editor (`uibuilder.html`)

* Show template (instance root) folder
* Editor Help: Change output msgs headers to include guidance to say that port 1 is the upper port and port 2 the lower port.
* Check for new versions of installed packages when entering the library manager.
* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.
* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?
* Allow custom locations for delivery folder (normally `src/` or `dist/`) and for api's folder (normally `api/`)
  * Allow the use of `public` as well as `src` and `dist`. Svelte outputs to the public folder by default. Also add warnings if no index.html file exists in the folder in use.
* Method to show output from npm package handling.
* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header
* If instance folder doesn't exist - need to mark node as changed to force deploy.

### Front-End new ESM library (`uibuilder.esm.js`/`uibuilder.module.js`)

* Allow add/change to use a.b prop names
* Document `loadScriptSrc` and `loadScriptTxt`
* UI
  * Add prop validation
  * keep track of added ids?
  * Handle script and style types
  * Swap from marked to markdown-it
* ?? Maybe:
  * Add msg # to outgoing messages to act as a sequence number
  * Option to allow log msgs to be returned to Node-RED as uibuilder control messages
  * Option to allow custom events to be returned to Node-RED as uibuilder control messages
  * Do we need a confirmation (ctrl?) msg back to node-red?

### Package Manager Class

* Output npm log to NR log debug level (or maybe trace?)
* When checking for URL to use - scan for a `dist` folder.

### Templates

* Serve instance package.json `dependencies` on `../uibuilder/vendor/` path

  * Or maybe on `./vendor/`? That might be more consistent and avoid other issues/changes?
  
  * Complexity: this would end up with packages installed locally - would the uib central packages be recognised? Maybe use `uibuilder.dependencies` instead?

  * Change '../../templates/template_dependencies' in api v3

  * Update built-in templates to use package.json

* uibuilder version checker - https://github.com/npm/node-semver
* watcher
* Add a new template and example to demonstrate the sender node.
* Template - Docsify CMS
* Allow templates to provide example flows via a uibuilder Node-RED library plugin ([ref1](https://discourse.nodered.org/t/red-library-without-red-editor/61247), [ref2](https://nodered.org/docs/api/library/), [ref3](https://github.com/node-red/node-red-library-file-store/blob/main/index.js))
* Add uibuilder property to package.json - define
  * uibuilder version checker - https://github.com/npm/node-semver
  * required fe packages
  * watch - dict of watches: `{'path':'scriptname'}` or `{['path1',...]:'scriptname'}`
  * add `dependencies` to `../uibuilder/vendor/` path

### uib-sender node

* Track undeployed uib nodes via RED.events
* Store links by node.id not url since url may change
* Bind ctrl-s to save button

### uib-cache node

* On close, delete cache


## *Maybe*

These are some thoughts about possible future direction. They need further thought and design.

### General

* Add `uibuilder` prop to `<uibInstanceRoot>/package.json`
  * `uibuilder.loader` - an array of folder paths - relative to `<uibInstanceRoot>` that would be served using uibuilder's ExpressJS web server. Allowing instance-specific front-end resources. To be used by things like components.
  * `uibuilder.scripts.deploy` - pointing to node.js file to run when the template is deployed.
* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's.

* Trial use of [web-workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) since majority support goes back to 2014.
  * Create a [Progressive Web App](https://web.dev/what-are-pwas/) (PWA) capable version with [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers) [Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
  
  Enabling semi-offline use so speeding up the whole interface after the first load.
  Also makes more native app-like features available such as mobile content sharing & badges, background downloading, etc.

  Note that service workers don't have access to the DOM but they do act as a network proxy. Global state is not maintained but
  IndexedDB is available for persistence. They don't work on older browsers. See the [Mozilla Service Worker Cookbook](https://serviceworke.rs/)

  Websockets can't be used in a service worker but [Web Push](https://developers.google.com/web/fundamentals/push-notifications) 
  is available for notifications & might be an interesting additional node for uibuilder. 
  See the [push demo from Mozilla](https://serviceworke.rs/push-payload_demo.html). Push payloads can include JSON and binary.

  [Workbox](https://developers.google.com/web/tools/workbox) - library for adding offline support.

  [fxos-components/serviceworkerware](https://github.com/fxos-components/serviceworkerware#serviceworkerware): An Express-like layer on top of Service Workers to provide a way to easily plug functionality.

* Add support for HTTP/2 with auto-push. See [http2-express-autopush - npm](https://www.npmjs.com/package/http2-express-autopush)
* Add support for HTTP/3 and QUIC (available in Node.js v14, in preview with NGINX as at June 2022, websockets over http/3 is defined in RFC9220 in draft at June 2022). https://www.f5.com/company/blog/quic-will-eat-the-internet
* Allow transfer of files via Socket.IO. https://stackoverflow.com/a/59224495/1309986
* Allow switch of log.trace to log.info for advanced debugging (would need new switch in Editor or setting in settings.js:uibuilder)
* New node: allowing a socket.io "room" to be defined. Will need to pick a current main instance from a dropdown (using API)
   * Change FE to allow for rooms.


### Core (`uibuilder.js`)

* Add index web page for the `common` folder.

### Templates

* Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?) - using the pluggable libraries feature of Node-RED v2.1?
* Add option to auto-load npm dependencies on change of Template. [Issue #165](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/165)
* Maybe move dependencies and other template meta-data into the template package.json file.
  Would require making sure that package.json always exists (e.g. after template change). May need to be able to reload package.json file as well.
  Couldn't use the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot. 
  Will need matching code in the Editor panel & a suitable API.


### Editor (`uibuilder.html`)

* Add option to allow new front-end code files to be input via inbound msg.
  Allows a flow to read a file and save to the server. Optional because it could be a security issue. Allow folder name as well as file name.
* Add (advanced) flag to make use of project folder optional.
* Add option to keep backups for edited files + button to reset to backup + hide backup files
* Add npm package delete confirmation - probably via std NR notifications
* When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.
* Add GIT processing? Or maybe just handle via npm scripts?
   * Is git command available?
   * is front-end src folder a git repository?
   * git commit
   * git push

### uib-sender Node

* Allow multi-instance sending - send to multiple uibuilder nodes.
* Include schema checks - filter on available schema's from uib compatible components
* Allow sending to a cache node rather than just a uibuilder node.

### uib-cache Node

* ? Option to constrain cache/cache-clear to socketid/clientid

### New Nodes

* add alternate `uib-dashboard` node that uses web components and data-driven composition.

### Testing

* Look at the possibility of using https://www.cypress.io/ to automate some front-end and Editor testing.


----

# OLD

**Update 2022-01-19**: These are the old entries from the WIKI To Do page. They need tidying up and consolidating into the newer structure.
**Update 2022-06-18**: Now mostly tidied and consolidated. Just a few left that I want to keep for reference.

## Ideas

* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/) - _[Keep for reference]_

* Extend middleware hook feature to allow for different middleware for each node instance
  instead of one for all instances.

* Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end

  Started: script/style is removed if disallowed in settings, uibuilder control msgs dropped (since v1.0.0)

* _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._
