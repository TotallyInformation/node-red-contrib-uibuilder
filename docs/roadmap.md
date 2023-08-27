---
title: uibuilder Roadmap
description: >
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
lastUpdated: 2023-08-21 21:14:07
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

## Questions that need answers

* How best to allow other nodes to provide zero-code nodes - that allow auto feedback from the front-end? e.g. something like the [node-red-contrib-ui-time-scheduler](https://github.com/fellinga/node-red-contrib-ui-time-scheduler) node.
* How to provide a better log output? With a simple way to link to Node-RED log output (filtered) as well as a dedicated output node. That output's to a web page with highlighting and possibly page back/fwd through history.

## Next - these are things that need to be done

### **NEW NODE** - `uib-save` - Easily save files to uibuilder-specific locations

Select a deployed uibuilder node as the "parent" and the server folder location will be set for you so that you don't need to remember it.

Why?

- Save `msg._ui` configuration data to a static JSON which can then be used to load an entire UI on page load.
- Save/update files that are automatically available via the uibuilder web. For example a static web page that is perhaps updated periodically. This could also work with data, JavaScript, CSS, etc. In fact anything that can be serialised or that is already a string.
- Use with the `uib-html` node to save static HTML files built via `uib-element` or some other flow that outputs `msg._ui` configurations.

### General changes

* Move the ui class to a separate repo so that it can be used independently.

* Restructure to a monorepo? With libs in 1, maybe nodes in their own and the front-end library in another? [ref](https://www.bing.com/search?pglt=161&q=what+is+a+monorepo&cvid=42b295dfc64143cfb64e4061114803fd&aqs=edge.0.0l9.7031j0j1&FORM=ANNTA1&PC=U531)
* Restructure uibuilder node to remove fs-extra dependency to its own library module.
* Restructure other nodes to move server file handling to a separate library module.
* Consider adding a default CSS override to the uibuilder node. To be used when no CSS specificed and also to be used in admin/generated uib pages. Defaulting to `../uibuilder/uib-brand.css`.
* Consider scraping all .html files in each uibuilder instance and building an auto-list that can be added to the `../uibuilder/apps` page. Possibly with a manual override list option.
* [Issue #94](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/94) - Detect when Node-RED switches projects and see if the uibRoot folder can be dynamically changed.
* Change fixed text to use `RED._` for l8n. See: https://discourse.nodered.org/t/flexdash-alpha-release-a-dashboard-for-node-red/65861/48. [ref](https://discourse.nodered.org/t/question-on-internationalisation-can-i-have-1-json-file-for-several-nodes/76300/2)

* Allow control of browser html cache from Node-RED. Add an auto-restore on load option. (? Add send updates back to Node-RED option - control msg ?)

* Use alt logging for websocket disconnects, sleep, error, etc

* **Example stand-alone node package as exemplar**
  * https://github.com/TotallyInformation/nr-uibuilder-uplot
  * probably chart
  * How to pass data through?

* REJECTED
  * ~~NEW NODE - `uib-get` - Gets data from a page's DOM. Will use the `uiGet` function.~~ No longer needed, use `msg._uib` commands in std msg.


### Updates to `uibuilder` node

* Allow file uploads
* Add instance title and description fields. Extend record of instances to include these and update the `apps` page.

* Move all filing system handling to a separate library module. Should help work out how to support implementations with limited filing systems.
* Add option to process a crafted msg from the FE that returns a JSON list of all files/folders (optionally recursive) - needs change to FE library & editor.
  * In Editor, set the top-level permitted folder - relative to the `Serve` folder (e.g. If serving `<instanceRoot>/src`, that would be the default root but allow a sub-folder to be set, e.g. `content` so that only `<instanceRoot>/src/content` and below could be queried). This is to facilitate the creation of content management systems.
  * Possibly also needs option as to whether data can be written back. Including options to create/delete as well as amend. To begin with, just output any changed data to port 1 and let people create their own write-back logic.

* Gracefully handle when rename cannot (re)move original folder (e.g. held open by browser).
  * Improve checks for rename failures. `[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal.` - these should clear after restart but sometimes don't.
* Files: Changing filetype in editor does not change the highlighting.

* Ensure that uibRoot is set to a project folder if projects in use. See [PR#47](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/47) and [Issue #44](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/44)
* Improve handling for when Node-RED changes projects.
* Allow instance npm installs to be served (would allow both vue 2 and vue 3 for example). Instance serves to take preference. Would need extension to editor libraries tab to differentiate the locations.
* Centralise the list of control messages in use.
* Add occasional check for new version of uib being available and give single prompt in editor.
* Trace report for not loading uibMiddleware.js but not for other middleware files. Doesn't need a stack trace if the file isn't found and probably not at all. Make everything consistent. "uibuilder common Middleware file failed to load. Path: \src\uibRoot\.config\uibMiddleware.js, Reason: Cannot find module '\src\uibRoot\.config\uibMiddleware.js'". "sioUse middleware failed to load for NS" - make sure that middleware does not log warnings if no file is present. [ref](https://discourse.nodered.org/t/uibuilder-question-on-siouse-middleware/75199?u=totallyinformation).
* Introduce standard events: url-change (so that all uib related nodes can be notified if a uib endpoint changes url).
* uibindex change "User-Facing Routes" to "Client-Facing Routes".
* Add index web page for the `common` folder.
* Auto-generate web manifest.
* Add actions: open page? open docs? using RED.actions editor API. [ref](https://nodered.org/docs/api/ui/actions/)

* Editor:
  * Templates
    * Add template description to display.
    * Add dependency version handling to templates (e.g. vue 2/3)
    * Allow templates to provide example flows via a uibuilder Node-RED library plugin - will library update though?
      
      Check for examples folder, if present load all *.json files to library.
      [saveLibraryEntry](https://nodered.org/docs/api/storage/methods/#storagesavelibraryentrytypenamemetabody)
      
      ([ref1](https://discourse.nodered.org/t/red-library-without-red-editor/61247), [ref2](https://nodered.org/docs/api/library/), [ref3](https://github.com/node-red/node-red-library-file-store/blob/main/index.js))
    
  
  * Libraries tab
    * Add Homepage link to each package in the Libraries tab.
    * Add update indicator to Libraries tab.
    * Trigger indicator to Libraries to show if new major version available when switching to the tab.
    * Add npm package delete confirmation - probably via std NR notifications.
    * When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.
  
  * Files tab
    * Change getFileList to only return files, use the separate folder list for folders. No need to run it multiple times then.
    * Creating new folder - new folder should be selected after create.
    * settings.js option to allow _ files to show in editor. https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/190.
    * Move folder management to a popup dialog (to save vertical space)
    * Extend folder/file management
      * Allow renaming of files/folders.
      * Add the `common` folder to the file editor.
      * Allow editing in the `common` folder not just the instance folder.
      * Add a file upload button.
      * Method to import/export front-end files. Needs ZIP/Unzip functions at the back-end.
      * Add a reminder to the Editor help about examples. Add an onclick to that <a> icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.
      * Add option to keep backups for edited files + button to reset to backup + hide backup files
  
  * Advanced tab
    * Update the `Advanced > Serve` dropdown list after creating a new top-level folder (to save having to exit and re-enter the panel).
    * Add visual error when changing advanced/Serve to a folder with no index.html.
    * Add (advanced) flag to make use of project folder optional.
    * Improve help box for _uib switch 
    * Option for project folder storage.
    * Show Socket.io server & client versions

  * Settings.js
    * Add optional sidebar (or drop-down menu on NR header bar) displaying list of all uib URLs (and link to nodes).
  
  * NEW TAB: `Build` - run npm scripts, install instance libraries (for dev or dependencies - just dev initially)
    * Add all local package.json script entries as links/buttons so they can be run from the editor panel.
    * If `dev` script discovered in local package.json scripts, enable a dev button so that a CI dev service can be spun up (e.g. Svelte). Will need debug output to be visible in Editor?

  * Template handling:
    * Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?) - using the pluggable libraries feature of Node-RED v2.1+?
    * Add option to auto-load npm dependencies on change of Template. [Issue #165](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/165)
    * Maybe move dependencies and other template meta-data into the template package.json file.
      Would require making sure that package.json always exists (e.g. after template change). May need to be able to reload package.json file as well.
      Couldn't use the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot. 
      Will need matching code in the Editor panel & a suitable API.

  * Switch tooltips to using aria-label with hover CSS as in the new node.
  * Remove scripts/css flags from uibuilder panel, no longer in use (not while old client library still in use)
  * Better icons! See https://discourse.nodered.org/t/wish-for-new-nodes/73858/20
  * Consider adding an action for when a uibuilder node is selected - would open the web page. https://discourse.nodered.org/t/call-link-from-node-red-editor-ctrl-shift-d/73388/4
  * Add GIT processing? Or maybe just handle via npm scripts?
     * Is git command available?
     * is front-end src folder a git repository?
     * git commit
     * git push

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
  * ~~Add `class="dark"` to all template html file `html` tags. Remove `class="uib"` from body tag.~~ Maybe not such a good idea
  
* Investigate use of WebWorkers to have a shared websocket that allows retained connection on page reload and between pages in the same uibuilder node.
  * https://crossbario.com/blog/Websocket-Persistent-Connections/
  * https://stackoverflow.com/questions/10886910/how-to-maintain-a-websockets-connection-between-pages

* **[STARTED]** Provide option to switch from static to rendering to allow dynamic content using ExpressJS Views.

  Currently available by adding the appropriate ExpressJS option in settings.js.

* `package-mgt.js`
  * Output npm log to NR log debug level (or maybe trace?)
  * When checking for URL to use - scan for a `dist` folder.

* `socket.js`
  * Add rooms: page, User id, Tab id - will allow broadcasts to a specific page, user or individual tab and will not be purely reliant on the `_socketId` which can change.
  * When a new client connection is made, use `socket.emit('join', tabId)`
  * Output to a room using `io.to(tabId).emit(...)`
  * https://socket.io/docs/v4/rooms/

* Rejected
  * ~~Add 4th cookie to record the Node-RED web URL since uibuilder can now use a different server, it is helpful if the front-end knows the location of Node-RED itself.~~ Can't even give the port since the client access might be totally different to the server (e.g. behind a proxy).


### Extensions to `uib-cache` node

* CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC
* Add DELAY and EXPIRY features.
* Output node.warn msg if recv input with no "Cache by" msg prop. (e.g. no msg.topic for default setting)
* Add cache clear button to complement the cache clear control msg
* Add optional page filter - a cache with a page filter will only send the cache if the replay request is from that page. Page filters need to allow a list of pages and ideally wildcards.
* Allow send to client id - would need clientId to _socketId map to be maintained by uibuilder.
* Add checks to prevent non-string cache by property values.
* Add empty cache button.
* Think about impact of a cache clear (affects all connected clients)

### Extensions to `uib-sender` node

* CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC

### Extensions to the `uib-element` node
* Forms:
  * Check if textarea sizes can be changed - specifically the number of lines. Similarly for select-multiple.
  * Add option for blank line.
  * Add option for an info line (supporting HTML? Markdown?)
  * Add a "Simple Form Immediate" version where every element sends its own changes back to Node-RED and where send/reset buttons are not added.
* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
* New Types for CSS and JS files?
* New type "Clone" - use a template or other element already in the HTML and copy it to a new position in the DOM. Applies attribs/slot changes if specified. Templates themselves are invisible.
* Add more elements:

* "Text Box" type - allow msg.payload to be an array with each entry being a new para.
* Disable or hide inputs when unused for a specific type.
* As more element types are added, group into types: main, add, form, etc
* ? Have JSON input msg templates for each type with links to copy to clipboard ?
* Check out: https://www.w3.org/WAI/ARIA/apg/patterns/
* Think about having a `linkInputs([idList])` fn that allows easy linking of different inputs?
* Consider adding the ability to have some tag other than `div` as the wrapper. [ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/210)
* Add more elements:
  * [ ] Markdown
    Allow raw Markdown to be sent similar to the HTML element. Will require the Markdown-IT library to be loaded as per other uibuilder Markdown support.
  * Individual Form Elements
    This is to enable additional form elements to be added to an existing form.
    * [ ] Select - https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html
    * [ ] Input
    * [ ] button (NB: add type="button" to avoid form submit issues, click=uibuilder.eventSend by default)
    * [ ] iFrame
      As for [ui-iframe](https://flows.nodered.org/node/node-red-node-ui-iframe)
  * [x] List (ul, ol, dl)
    * Future improvements:
      * Better validation of input data
      * list-style-type (add to outer) - several options plus text (incl emoji's)
      * ? Optional list leading/trailing text ?
  * [x] Table
    * Future improvements:
      * Additional field definitions in input data
      * Better validation of input data
      * Caption
      * If named row comes from a field, make sure it is the 1st col and marked as a th
      * Add data-row-name to td's as well
      * See also: https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
      * Consider: https://github.com/tofsjonas/sortable - perhaps adopt data-sort attribs?
  * [ ] TTS text-to-speach output
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
      * **Improve range slider** - with min/max and current value indicator (possibly as a separate, linked number input box) - may need an `oninput` handler
      * Better validation of input data
      * Additional input types: file (need to process uploads to NR), combo, image.
      * Eventually add extended inputs such as HTML WYSIWYG/Markdown
      * Add Auto-complete for text inputs
      * If no button added, make each input send changes direct - or possibly add that as an optional setting.
  
  * [ ] Status Box, Status Panel - [ref](https://discourse.nodered.org/t/web-endpoint-status-dashboard-uibuilder-zero-code-example/75740)
    A segmented vertical/horizontal status/progress panel. For things like battery displays, etc.
    Each status box has a coloured sidepanel to show the status.

  * [ ] Toggle button, Toggle button panel (AKA Switch)
    Similar to the status box/panel but for buttons. https://www.w3.org/WAI/ARIA/apg/patterns/switch/

  * [ ] Tab container and tabs
    Include events that trigger and send msgs back to Node-RED on tab change.
    What is the best way to hide/unload the non-current tabs?

  * [ ] Grid/Flex-Grid
     Standardised layout. With option to turn on visible grid to help with layout.

  * [ ] tbody
    Additional table body sections. [ref](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#multiple_bodies)

  * [ ] notify (globalNotification)

  * [ ] Modal Dialogue
    `window.prompt`, `window.confirm`, `<dialog>`

  * [ ] LED (on/off/colour/brightness), LED panel
    As for [ui-led](https://flows.nodered.org/node/node-red-contrib-ui-led)

  * [ ] Status timeline
    Maybe uPlot with timeline plugin? [ref](https://github.com/hotNipi/node-red-contrib-ui-state-trail/blob/master/ui-state-trail.js)

  * [ ] Image. 
     Allowing for buffer->data-uri->img-tag, data-uri->img-tag, URL->img-tag. [ref](https://flows.nodered.org/node/node-red-contrib-image-tools)

  * [ ] Container
    Standard layout. With option for drag/drop of contents. [ref](https://discourse.nodered.org/t/is-there-a-pallete-that-can-do-this/75143?u=totallyinformation)

  * [ ] Style/Theme changer.
    Extended version of the one in my experimental W3C Components repo. Will let you change between light/dark mode, change base colours, etc. [Example component](https://github.com/TotallyInformation/web-components/blob/main/components/uib-theme-changer.js)

  * [ ] Accordian.
    [ref](https://css-tricks.com/quick-reminder-that-details-summary-is-the-easiest-way-ever-to-make-an-accordion/)

* Other thoughts:
  * Pill list, scrollable search - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/
* ??? How to allow EXTERNAL element definitions ??? e.g. Someone else's contributed package.

### Extensions to the `uib-update` node

* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
* Add props: `uibUpdated`, `uibUpdatedBy`
* Add status in Editor: # input msgs
* ?? Consider if worth adding a way to update a front-end javascript variable directly ??
* New type option "Template" - Replaces the selected element with a template clone. Then applies attribs/slot if required. [Ref](https://developer.mozilla.org/en-US/docs/web/html/element/template)


### Extensions to the `uib-tag` node

* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

### Extensions to client Library
* Forms (eventSend): 
  * Allow for multi-select sending array of selected options.
  * Allow for multi-select pre-selecting array of options.
  * Allow for "selected" `true` on option entries.

* Get _uib/_ui notify features to use Notification API if available
* Compare ui.js with radar version - see if changes to watch fn need to be brought over. Also add observe options.
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).    
* Consider removing the css auto-load in the next major release since at least 1 person has hit a race condition. [ref](https://discourse.nodered.org/t/uib-brand-css-sometimes-injected/78876).

* *New Functions* (all to be callable from Node-RED):
  * [ ] `uibuilder.watchLocation()` - sends control msgs back to node-red if location changes but page not loaded - e.g. from SPA routers.
  * [ ] `uibuilder.cacheSend()` and `uibuilder.cacheClear()` - send ctrl msgs back to node-red - reinstate in uib-cache fn now we've removed extra ctrl send.
  * [ ] `uibuilder.showLog()` - Add a visible panel on-page to show console.log output. Redirects (or maybe copies) uibuilder.log output - possibly also console.log. Will need amendments to the uibuilder.log function to give options for output to this and/or back to Node-RED.
  * [ ] `uibuilder.socketReconnect()` Add manual socket.io reconnection function so it can be incorporated in disconnected UI notifications.
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others) buttons. [ref](https://codereview.stackexchange.com/questions/192138/buttons-that-expand-or-collapse-all-the-details-within-the-document)
  * [ ] `uibuilder.navigate(locationUrl)` - change page. Ensure it works with SPA routers and with anchor links. Probably won't work with router libraries as they have to intercept link calls.
  * [ ] **HARD - may be impossible?** `uibuilder.convertToUI(cssSelector)` - convert part/all of the DOM to `_ui` json structure. [ref](https://stackoverflow.com/questions/2303713/how-to-serialize-dom-node-to-json-even-if-there-are-circular-references)

* Control from Node-RED. Functions to implement:
  * [ ] watchDom(startStop), uiWatch(cssSelector) [add custom event outputs]
  * [ ] setPing
  * [ ] `elementExists(selector)`, `elementIsVisible(selector)`
  * [ ] `navigate(url)`
  * [ ] `loadui()`
  * [ ] `clearHtmlCache()`, `saveHtmlCache()`, `restoreHtmlFromCache()`
  * [ ] getStore, setStore, removeStore - control browser local storage
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others)
  * Add `info` outputs to commands. Allow the fns that commands call to have auto-send & info.

* Use esbuild to create stand-alone minimised IIFE/ESM versions of `ui.js`.
* Allow file uploads
* Add a `jsonImport` option to the _ui `load` method. The `jsonImport` property being an object where the keys are variable names to load to and the values are the URL's to load the JSON from.

* Add treeview formatting to syntaxHighlight. [ref](https://iamkate.com/code/tree-views/).
* Consider watching for a url change (e.g. from vue router) and send a ctrl msg if not sending a new connection (e.g. from an actual page change).
* Option for a pop-over notification to manually reconnect the websocket.
* Investigate use of [PerformanceNavigationTiming.type](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type) to detect page load type and inform uibuilder on initial message.

* Add ability to save the current DOM.
  * _started_ To local storage - with option to reload on reload
  * _started_ (manual request is done) Send to Node-RED as a control msg (whole HTML or from a CSS Selector)

* _UI - improvements to the config-/data-driven UI creation features
  * **Started** Add optional page filter to _ui - if `msg._ui.pageName` not matching current page, don't process - needs list and wildcard capabilities.
  * Content editor capability - to set editable content blocks. [ref 1](https://editorjs.io/)
  * Add handling for `_ui.components[n].slots` where slots is an object of named slots with the special 
     name of `default` for the default slot (default must be handled first since it overwrites all existing slots)
  * Add check to uibuilder.module.js to prevent adding of multiple entries with same ID
  * Allow adding to more locations: next/previous sibling
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
* Add a [resizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to report resize events back to Node-RED as a control msg.
* Look at [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt), [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) and [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - should _ui implement these?
* Get better control over what control messages can be sent. Centralise the list of control messages in use.
* Add functions for manipulating SVG's.

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

### Improvements to `uib-brand.css`
  
* Forms:
  * Allow for blank line spanning the form width.
  * Allow for information line spanning the form width.
* Something similar to the sidebar status panel but segmented. Choose number of segments.
* Make `input[type="color"]` starting colour the brand colour. Can only be done via JavaScript.
* Check `input:valid` pseudo-class defaults
* Improve input/form elements. [Ref](https://developer.mozilla.org/en-US/docs/Web/CSS/:required)
* Add treeview formatting. [ref](https://iamkate.com/code/tree-views/)
* Consider an "Easy Read" variation:
  * Easy read means:
    * wide margins
    * images on the left
    * larger text (14 to 16pt)
    * bigger spaces between lines (1.5 spacing in a word processor for example) - already done in the base.
    * 1 idea per image

### Updates to Documentation (including videos)

* New doc for using `ui.js` outside of uibuilder.
* `README.md`: Add more links to the Features section so that each feature points to appropriate documentation. Add a landing-page link to "includes many helper features" to signpost to relavent detailed documentation.
* Node-specific docs.
* Reorg docs to make more sense to new starters & make more logical.

* Search for `*(This document is a work-in-progress, it is not complete)*` and update documents.
* Add message interaction diagram to "pre-defined-msgs.md"
* Add note to documentation for the library manager that you can install LOCAL folders.
* Finish [Configuring uibuilder](uib-configuration?id=ltuibrootgtltinstance-urlgt) and [Configuring uibuilder nodes](uib-node-configuration.md) pages.
* Add some notes about Node-RED's projects feature. It doesn't seem to add a correct .gitignore which should contain `**/node_modules`. Also add notes about the fact that projects creates a disconnect between the flows and the userDir folder.
* Add new doc to explain the HTML document hierarchy.
* WIKI
  * Update examples
  * [Helmet Example](https://www.npmjs.com/package/helmet)
* Flows site
  * https://flows.nodered.org/flow/bbe6803d9daebda5c991336cf4e5e3e0
* Videos
  * uibuilder reactive variables (set, get, onChange)
  * Low-code, do anything from Node-RED
  * Easy forms
  * Switch light/dark
  * Mix of HTML and uibuilder uib-update for simple tasks.
  * Caching
  * Dynamically modify CSS class for HTML elements
  * Forms - zero-code
  * UI updates using low-code. [ref](https://discourse.nodered.org/t/uibuilder-documentation-suggestions-and-improvements/74812/33?u=totallyinformation)

### Examples

* Zero-code example needs better wording for UL/OL example. [ref](https://discourse.nodered.org/t/documents-6-1-0/74885/47)
* Reproduce the examples from the [pdfmaker website](http://pdfmake.org/playground.html) since that uses a similar-style config-driven approach to uibuilder's low-code, config-driven UI feature. See especially the _tables_ example.
* Add example for Vue sfc loader.
* Ticklist
  * Send a list
  * Attach click handler to switch list type from bullet to ticked & msg node-red
  * Save changes to cache on click
* Table
  * Weather example?
* Telegram web app. [ref1](https://github.com/revenkroz/telegram-web-app-bot-example)

### Other changes

* Consider adding a virtual file system to enable uibuilder to work with FlowForge. [ref](https://discourse.nodered.org/t/ui-builder-and-flowforge-device-agent/79373/7)

### Changes needed for future versions of node.js (will be updating uib in line with Node-RED v3)
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

* `uib-sender` node not really needed any more - consider putting a "deprecated" node.warn message prior to removing.
* Remove dependencies on fs-extra library - need to wait for node.js v16.7 to be minimum so that fs.cp/fs.cpSync is available
  * [x] libs/web.js
  * [ ] libs/package-mgt.js
  * [ ] uiblib.js
* Optimise runtime code using esbuild (see node-build.mjs). Reduce runtime dependencies by bundling and move deps to dev deps.
* Use uibuilder itself to manage docs webpage. Rather than docsify.
* Allow client id to be set externally.
* ? Add client identifier chooser to cache node - allowing use of different msg props to identify a specific client
* Change cache & main nodes to use client id rather than socket id where available. Since that is less likely to change.
* Improve editor panels with better tooltips. [ref](https://kazzkiq.github.io/balloon.css/)

* Use [chokidar](https://github.com/paulmillr/chokidar) to send a control msg to the fe when files change. Change the front-end to allow the browser to automatically reload (location.reload()). Put everything behind an optional flag and don't load the chokidar library unless the flag is set. May want an auto-rebuild feature as well. Alternatively, try [livereload](https://www.npmjs.com/package/livereload) which is used by rollup.

* Add package.json `style` property to Instance details page and packages list if it exists.

* Add Web Reporting API endpoint(s). Set a header to tell the client where to report to. Reports are JSON and so could be directed out of port 2 as a new control msg type. See https://web.dev/reporting-api/ & https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API.

* Add Notifications API support. See https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API & https://developer.mozilla.org/en-US/docs/Web/API/notification.

* Add option to log http(s) requests to control output port

* Switch to [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) for require's with low probability of usage. [ref](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_import_expressions).

* Migrate from commonjs to [ES modules](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_commonjs_json_and_native_modules). (2) [JSON can't be imported directly in ESMs](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_json_modules), use createRequire.

* Add funding link to package.json (see `man 5 package.json`)

* Maybe switch package.json reads to [npm/read-package-json: The thing npm uses to read package.json files with semantics and defaults and validation and stuff (github.com)](https://github.com/npm/read-package-json)?

 
* Add settings.js options to use different paths/names for middleware files.

* Once Node-RED's baseline node.js version has moved passed v12.20, can update `execa` and use dynamic imports (and change README notes on scorecard). Once it has moved into v14, can simplify the socket.js class by reinstating the optional chaining.

* Add socket.io instrumentation server. See https://socket.io/docs/v4/admin-ui/
{}
* Move socket.io client to dev deps and remove serve from web.js (new library builds it in) - can't do until uibuilderfe is deprecated? Or updated to include (breaking chg)

* Consider the use of `RED.comms.publish('uibuilder:some-event-name', data, retainFlag)` to push data to the editor (using RED.comms.subscribe in the Editor)

* Consider allowing addition of HTTP request headers to control msgs

* Consider allowing control msg for each request

* Consider implementing at Kroki diagram service node - https://kroki.io/ - enables delivery of diagrams from text descriptions using many different libraries.

* Create a `uib-router` node. This would connect a route handler flow to an existing `uibuilder` node. A bit like an `http-in` node but not needing an `http-out` because the out is via the `uibuilder` node. Would allow wildcard routing and ability to restrict by method. The defined path(s) would be added as a new router to the uibuilder routes. Consider whether this needs to be a `uib-router-in`/`uib-router-out` pair instead? 

### Editor (`uibuilder.html`)

* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.
* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?
* Method to show output from npm package handling.
* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header
* If instance folder doesn't exist - need to mark node as changed to force deploy.

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
* Add examples folder
* Add uibuilder property to package.json - define
  * uibuilder version checker - https://github.com/npm/node-semver
  * required fe packages
  * watch - dict of watches: `{'path':'scriptname'}` or `{['path1',...]:'scriptname'}`
  * add `dependencies` to `../uibuilder/vendor/` path

### uib-cache node

* On close, delete cache


## *Maybe*

These are some thoughts about possible future direction. They need further thought and design.

### Front-End library

* Add msg # to outgoing messages to act as a sequence number
* Option to allow log msgs to be returned to Node-RED as uibuilder control messages
* Option to allow custom events to be returned to Node-RED as uibuilder control messages
* Do we need a confirmation (ctrl?) msg back to node-red?

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

* uibuilder "Knowledge Garden"
  * Requirements
    - Get a partial or full list of folders and/or files
    - Display data in resizable panels
    - Tree view for folders/files
    - Markdown render and WYSIWYG/WYSIWFM editing - [mdxeditor](https://mdxeditor.dev/editor/demo), or vditor
  * References
    - [kajero/src at master · JoelOtter/kajero (github.com)](https://github.com/JoelOtter/kajero/tree/master/src) - interactive notebook
    - [vditor/README_en_US.md at master · Vanessa219/vditor (github.com)](https://github.com/Vanessa219/vditor/blob/master/README_en_US.md), [Demo example - Vditor (b3log.org)](https://b3log.org/vditor/demo/index.html)
    - [How to make a resizable panel control with Web Components - DEV Community 👩‍💻👨‍💻](https://dev.to/ndesmic/how-to-make-a-resizable-panel-control-with-web-components-2cpa)
    - [Draggable & Resizable Panel Component For Vue 3 - Vue Script](https://www.vuescript.com/draggable-resizable-panel/)


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
