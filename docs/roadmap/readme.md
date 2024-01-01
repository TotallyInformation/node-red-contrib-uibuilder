---
title: uibuilder Roadmap
description: |
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
updated: 2023-12-31 15:17:45
---

Is there something in this list you would like to see prioritised? Is there something you could help with? Please get in touch via the [Node-RED forum](https://discourse.nodered.org/). Alternatively, you can start a [discussion on GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) or [raise a GitHub issue](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues). Please note that I no longer have the time to monitor the #uibuilder channel in the Node-RED slack.

For more information about the future of UIBUILDER, please see the [Futures page](roadmap/Future.md)


## In Progress

To see what is currently being developed, please look at the "Unreleased" section of the [Changelog](changelog) for the latest branch. Anything else in this section is work-in-progress.

### Comms
* Socket.IO rooms. [ref](https://socket.io/docs/v4/rooms/) - Rooms can be used to filter messages for specific destinations (e.g. client or page id) or to create client-to-client comms.
  * Need a way to join rooms from Node-RED
  * socket.js
    * [x] Auto-join `clientId:xxxxxxx` & `pageName:xxxxxxx` rooms
    * [x] socket.on uib-room-join/-leave-send
    * [ ] Change send functions to use rooms where clientId/pageName is specified in `msg._uib`
    * [ ] `socket.on('uib-room-send', ...)` Add option to also send a uibuilder msg.
    * [ ] Incorporate `msg._uib.roomId` for sending to custom rooms
    * [ ] ? Allow sending to different uib namespaces? would likely need an option flag for security?
    * [ ] Allow global as well as NS rooms - allow sending between different uib connected clients. 
          [ref](https://socket.io/docs/v4/socket-io-protocol/#introduction) - `this.io.of('/').emit('uibuilder:global', 'Hello from the server. NS: "/"')`
    * [ ] Remove console.log from addNs
  * client
    * [x] joinRoom, leaveRoom, sendRoom - allows clients to join/leave/message any arbitrary room
    * [x] Add additional listener for the default (global) namespace
    * [ ] Add `globalSend` function
    * [ ] Add listener when joining a room, remove when leaving
    * [ ] Document new managed var: `globalMsg`.

### FE Router

* add `rotate` method to auto-rotate through routes. Needs ms and stop/start args.
* Add 1st show marker to route change to allow client to ask for cache update
* Update example
* Make this.config.routes a SET to prevent duplicates. Or possibly an object. Needs some code changes.
* Methods needed:
  * Delete route - need to update routeIds
  * Update/reload route
  * shutdown - that removes all elements
  * delete templates - unloads a list of (or all) templates
  * reload templates - to facilitate updates of a list of (or all) templates
  * auto-rotation of routes - uib..navigate(nextRoute)
  * next/prev route navigation
* Additional options:
  * Add pre-load option early load of all routes instead of default lazy-load.
  * unload templates after they are added to the route container. Only if hide=true. `unload: true`
  * Maybe: options to auto-load js and css files with the same name as a template file.

### Core node

* Add manual entry field to editor config for a URL scheme to open the instanceRoot folder in an editor new window. Pre-fill with vscode entry for localhost. Partially fill with vscode-remote otherwise (or maybe have a button).

### All nodes

* Incorporate ideas from: https://www.htmhell.dev/adventcalendar/2023/2/

* More flexible low-code class attribute handling.
  * In ui.js
    * [ ] Update the low-code schema's with add/remove/replace `classes` property
    * Update all fns to use the extra property
    
  * In nodes - update to allow using array of classes and to have add/remove class arrays
    * In uib-update
    
    * In uib-element
    
    * In uib-tag
    
      

### Node Edit Panel Refactoring

| Refactor / Node:              | uibuilder             | uib-cache | uib-element         | uib-html | uib-save | uib-sender | uib-tag | uib-update | *uib-uplot*                         |
| ----------------------------- | --------------------- | --------- | ------------------- | -------- | -------- | ---------- | ------- | ---------- | ----------------------------------- |
| Ref ti-common.js/css          | ✔️                     | ✔️         | ✔️                   |          | ✔️        |            | ✔️       | ✔️          |                                     |
| Mv src editor.js to resources | ✔️                     | ✔️         | ✔️                   |          | ✔️        |            | ✔️       | ✔️          |                                     |
| jQ Tooltips                   | ✔️                     | ✔️         | ✔️                   |          | ✔️        |            | ✔️       | ✔️          |                                     |
| rename template.html          | ✔️                     | ✔️         | ✔️                   |          | ✔️        | ✔️          |         | ✔️          |                                     |
| jQ TI class not id            | ✔️                     | ✔️         | ✔️                   |          | ✔️        |            |         |            |                                     |
| Notes                         | class="ti-edit-panel" |           | mv combobox styles? |          |          |            |         |            | check this for other needed updates |

Vars moved to ti-common (replace): node.urlPrefix, node.nodeRoot, paletteCategory, typedInputWidth, localHost, packages, editorInstances[urlsByNodeId].

### Node Runtime Refactoring

| Refactor / Node:             | uibuilder | uib-cache | uib-element | uib-html | uib-save | uib-sender | uib-tag | uib-update | *uib-uplot*                         |
| ---------------------------- | --------- | --------- | ----------- | -------- | -------- | ---------- | ------- | ---------- | ----------------------------------- |
| getSource                    |           |           | ✔️           |          |          |            | ✔️       |            |                                     |
| Std process for typed inputs |           |           |             |          |          |            |         |            |                                     |
| fs to std lib                |           |           |             |          |          |            |         |            |                                     |
| buildUi to std lib           | --        | --        |             |          | --       | --         |         |            | ??                                  |
| Notes                        |           |           |             |          |          |            |         |            | check this for other needed updates |

---

## Next - these are things that need to be done

### Possible New Nodes

* `uib-template` -  New node to take a msg._ui template input and update parts of it belore sending (e.g. parent, id, ...). `uib-override` or `uib-config`? [Ref](https://discourse.nodered.org/t/an-idea-for-third-party-ui-in-ui-builder/83196/4?u=totallyinformation).
* `uib-event` - Outputs uibuilder standard messages (or maybe both std and control) but is separate from the uibuilder instance node and can be filtered by user, client, page as well as the instance.

### General changes

* Complete the move of the zero- to low-code translations into the `libs/lowcode.js` library. Move runtime `buildUi` to common library.
    Consider putting each element in its own source js file and using a build process. This will allow their use when converting to web components. Add a master js with all components but allow each to be individually loaded.
* Complete the move of all server filing system handling into the `libs/fs.js` library. And remove dependency on `fs-extra`.
* [Issue #94](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/94) - Detect when Node-RED switches projects and see if the uibRoot folder can be dynamically changed.
* Allow control of browser html cache from Node-RED. Add an auto-restore on load option. (? Add send updates back to Node-RED option - control msg ?)
* Editor: Add panel of links to all instances of uibuilder.
* **Example stand-alone node package as exemplar**

  * https://github.com/TotallyInformation/nr-uibuilder-uplot
  * probably chart
  * How to pass data through?

### Node: `uibuilder`

* **FIX NEEDED** Loading template - if it fails due to a missing dependency, the template isn't loaded but the Template shows the new one. Need to revert the name if loading fails.
* Allow file uploads
* Add instance title and description fields. Extend record of instances to include these and update the `apps` page.
* Use alt logging for websocket disconnects, sleep, error, etc
* [**STARTED**] Move all filing system handling to a separate library module `libs/fs.js`. Should help work out how to support implementations with limited filing systems.
* Move all uibRoot package.json handling to `libs/package-mgt.js`
* Runtime API's - a new set of runtime API's

  * List all URL's
  * List all *.html files for instance serve folder
  * List all *.html for all URL's
  * _started_ Add api to query if a specific uib library is installed and return version. Optionally return estimated base path. Allow calling from front-end.
* Add API test harness using VScode restbook.
* Add option to process a crafted msg from the FE that returns a JSON list of all files/folders (optionally recursive) - needs change to FE library & editor.

  * In Editor, set the top-level permitted folder - relative to the `Serve` folder (e.g. If serving `<instanceRoot>/src`, that would be the default root but allow a sub-folder to be set, e.g. `content` so that only `<instanceRoot>/src/content` and below could be queried). This is to facilitate the creation of content management systems.
  * Possibly also needs option as to whether data can be written back. Including options to create/delete as well as amend. To begin with, just output any changed data to port 1 and let people create their own write-back logic.
* Gracefully handle when rename cannot (re)move original folder (e.g. held open by browser).

  * Improve checks for rename failures. `[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal.` - these should clear after restart but sometimes don't.
* Files: Changing filetype in editor does not change the highlighting. May need the editor to be re-engineered.
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
* Remove scripts/css flags from uibuilder panel, no longer in use (not while old client library still in use)
* Better icons! See https://discourse.nodered.org/t/wish-for-new-nodes/73858/20
* Consider adding an action for when a `uibuilder` node is selected - would open the web page. https://discourse.nodered.org/t/call-link-from-node-red-editor-ctrl-shift-d/73388/4
* Add GIT processing? Or maybe just handle via npm scripts?

  * Is git command available?
  * is front-end src folder a git repository?
  * git commit
  * git push
* Investigate use of WebWorkers to have a shared websocket that allows retained connection on page reload and between pages in the same `uibuilder` node.

  * https://crossbario.com/blog/Websocket-Persistent-Connections/
  * https://stackoverflow.com/questions/10886910/how-to-maintain-a-websockets-connection-between-pages
* **[STARTED]** Provide option to switch from static to rendering to allow dynamic content using ExpressJS Views.

  Currently available by adding the appropriate ExpressJS option in settings.js.

#### Editor (`uibuilder.html`)

* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.
* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?
* Method to show output from npm package handling.
* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header
* If instance folder doesn't exist - need to mark node as changed to force deploy.
* Admin API enhancements

  * List of All uib endpoints as a menu page.
* Add case sensitivity flag
* Rationalise the file editor. [Ref](https://discourse.nodered.org/t/code-editor-isnt-saving-text/80836)

#### Templates

* Add eslint dev dependencies to package.json

    * .eslintrc.js: 	Configuration for rule "sonarjs/no-duplicate-string" is invalid: 	Value 6 should be object.
  
* Add template description to display.
* Add dependency version handling to templates (e.g. vue 2/3)
* Allow templates to provide example flows via a `uibuilder` Node-RED library plugin - will library update though?
  
    Check for examples folder, if present load all *.json files to library.
    [saveLibraryEntry](https://nodered.org/docs/api/storage/methods/#storagesavelibraryentrytypenamemetabody)
    ([ref1](https://discourse.nodered.org/t/red-library-without-red-editor/61247), [ref2](https://nodered.org/docs/api/library/), [ref3](https://github.com/node-red/node-red-library-file-store/blob/main/index.js))
    
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
* Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?) - using the pluggable libraries feature of Node-RED v2.1+?
* Add option to auto-load npm dependencies on change of Template. [Issue #165](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/165)
* Maybe move dependencies and other template meta-data into the template package.json file.

  Would require making sure that package.json always exists (e.g. after template change). May need to be able to reload package.json file as well.
  Couldn't use the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot.
  Will need matching code in the Editor panel & a suitable API.

#### Libraries tab

* Add Homepage link to each package in the Libraries tab.
* Add update indicator to Libraries tab.
* Trigger indicator to Libraries to show if new major version available when switching to the tab.
* Add npm package delete confirmation - probably via std NR notifications.
* When adding a package, make sure that the input field gets focus & add `<keyb>`Enter`</keyb>` & `<keyb>`Esc`</keyb>` key processing.

#### Files tab

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
  * Add a reminder to the Editor help about examples. Add an onclick to that `<a>` icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.
  * Add option to keep backups for edited files + button to reset to backup + hide backup files

#### Advanced tab

* Update the `Advanced > Serve` dropdown list after creating a new top-level folder (to save having to exit and re-enter the panel).
* Add visual error when changing advanced/Serve to a folder with no index.html.
* Add (advanced) flag to make use of project folder optional.
* Improve help box for _uib switch
* Option for project folder storage.
* Show Socket.io server & client versions

#### Settings.js

* Add optional sidebar (or drop-down menu on NR header bar) displaying list of all uib URLs (and link to nodes).

#### NEW TAB: `Build` - run npm scripts, install instance libraries (for dev or dependencies - just dev initially)

* Add all local package.json script entries as links/buttons so they can be run from the editor panel.
* If `dev` script discovered in local package.json scripts, enable a dev button so that a CI dev service can be spun up (e.g. Svelte). Will need debug output to be visible in Editor?
* `package-mgt.js`

  * Rationalise the various functions - several of them have similar tasks.
  * Remove dependency on `execa`.
  * Output npm log to NR log debug level (or maybe trace?)
  * When checking for URL to use - scan for a `dist` folder.
* `socket.js`

  * Add rooms: page, User id, Tab id - will allow broadcasts to a specific page, user or individual tab and will not be purely reliant on the `_socketId` which can change.
  * When a new client connection is made, use `socket.emit('join', tabId)`
  * Output to a room using `io.to(tabId).emit(...)`
  * https://socket.io/docs/v4/rooms/
* Rejected

  * ~~Add 4th cookie to record the Node-RED web URL since uibuilder can now use a different server, it is helpful if the front-end knows the location of Node-RED itself.~~ Can't even give the port since the client access might be totally different to the server (e.g. behind a proxy).

### Node: `uib-cache`

* CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC
* Add DELAY and EXPIRY features.
* Output node.warn msg if recv input with no "Cache by" msg prop. (e.g. no msg.topic for default setting)
* Add cache clear button to complement the cache clear control msg
* Add optional page filter - a cache with a page filter will only send the cache if the replay request is from that page. Page filters need to allow a list of pages and ideally wildcards.
* Allow send to client id - would need clientId to _socketId map to be maintained by uibuilder.
* Add checks to prevent non-string cache by property values.
* Add empty cache button.
* Think about impact of a cache clear (affects all connected clients)

### Node: `uib-element`

* Add width setting
* Add new element: Layout

  * Start with grid layout
* Forms:

  * Check if textarea sizes can be changed - specifically the number of lines. Similarly for select-multiple.
  * Add option for blank line.
  * Add option for an info line (supporting HTML? Markdown?)
  * Add a "Simple Form Immediate" version where every element sends its own changes back to Node-RED and where send/reset buttons are not added.
  * **Improve range slider** - with min/max and current value indicator (possibly as a separate, linked number input box) - may need an `oninput` handler
  * Better validation of input data
  * Additional input types: file (need to process uploads to NR), combo, image.
  * Eventually add extended inputs such as HTML WYSIWYG/Markdown
  * Add Auto-complete for text inputs
  * If no button added, make each input send changes direct - or possibly add that as an optional setting.
  * Rich text edit (Markdown? HTML?)
* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
* New Types for CSS and JS files?
* New type "Clone" - use a template or other element already in the HTML and copy it to a new position in the DOM. Applies attribs/slot changes if specified. Templates themselves are invisible.
* "Text Box" type - allow msg.payload to be an array with each entry being a new para.
* Disable or hide inputs when unused for a specific type.
* As more element types are added, group into types: main, add, form, etc
* ? Have JSON input msg templates for each type with links to copy to clipboard ?
* Check out: https://www.w3.org/WAI/ARIA/apg/patterns/
* Think about having a `linkInputs([idList])` fn that allows easy linking of different inputs?
* Consider adding the ability to have some tag other than `div` as the wrapper. [ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/210)
* Add more elements:

  * Buttons

    * All buttons should allow image (icon), main text and sub-text ([ref](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras))

    * [ ] Toggle/3-way
    * [ ]
  * Individual Form Elements

    This is to enable additional form elements to be added to an existing form.

    * [ ] Select - https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html
    * [ ] Combo
    * [ ] Input
    * [ ] button (NB: add type="button" to avoid form submit issues, click=uibuilder.eventSend by default)

      * Types:

        * Basic: click only, text
        * Toggle: click on/off
        * Advanced: opens up overlay with an input field with selectable type (colour, value, slider, switch).
      * Parts: Icon, title (next to icon), (sub)text (below icon/title) - any of which can be optional.
    * [ ] iFrame

       As for [ui-iframe](https://flows.nodered.org/node/node-red-node-ui-iframe)

  * [ ] Charts
  * [ ] Gauges
  * [X] List (ul, ol, dl)

    * Future improvements:

      * Better validation of input data
      * list-style-type (add to outer) - several options plus text (incl emoji's)
      * Collapsable list style. [ref](https://github.com/mdn/web-components-examples/blob/main/expanding-list-web-component)
      * ? Optional list leading/trailing text ?
  * [X] Card/Article

    * Future improvements:

      * Better layout, more optional internal structure (footer, etc)
  * [X] Table

    * Future improvements:

      * Additional field definitions in input data
      * Better validation of input data
      * Caption
      * If named row comes from a field, make sure it is the 1st col and marked as a th
      * Add data-row-name to td's as well
      * See also: https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
      * Consider: https://github.com/tofsjonas/sortable - perhaps adopt data-sort attribs?
  * [ ] Editable List - [ref](https://github.com/mdn/web-components-examples/blob/main/editable-list)
  * [ ] TTS text-to-speach output
  * [ ] Status Box, Status Panel - [ref](https://discourse.nodered.org/t/web-endpoint-status-dashboard-uibuilder-zero-code-example/75740)
    A segmented vertical/horizontal status/progress panel. For things like battery displays, etc.
    Each status box has a coloured sidepanel to show the status.
  * [ ] Toggle button, Toggle button panel (AKA Switch)
    Similar to the status box/panel but for buttons. https://www.w3.org/WAI/ARIA/apg/patterns/switch/
  * [ ] Tab container and tabs
    Include events that trigger and send msgs back to Node-RED on tab change.
    What is the best way to hide/unload the non-current tabs?
  * [ ] Layout: Grid/Flex-Grid
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
  * [ ] Map - Leaflet

  * Completed

    * [X] Markdown
      Allow raw Markdown to be sent similar to the HTML element. Will require the Markdown-IT library to be loaded as per other uibuilder Markdown support.
    * [X] Simple Form - Input types: button, checkbox, color, date, datetime-local, email, hidden, month, number, password, radio, range, tel, text, time, url, week
    * [X] HTML - allow raw html to be sent - e.g. from template node
    * [X] Page Title
    * [X] tr - Add a row to an existing table
    * [X] li - Add a row to an existing ul/ol list
* Other thoughts:

  * Pill list, scrollable search - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/
* ??? How to allow EXTERNAL element definitions ??? e.g. Someone else's contributed package.

### Node: `uib-html`

* Add option to remove the page tags, leaving just the document body fragment.
* Add options for DOMpurify and Markdown-IT
* Consider adding an HTML editor for the template?

### Node: `uib-save`

* Allow msg overrides of input fields
* Allow URL to be driven by msg or context (just add new options to select, don't bother with typed input)

### Node: `uib-sender`

* CHANGE CONTEXT VAR HANDLING TO DEAL WITH ASYNC

### Node: `uib-tag`

* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

### Node: `uib-update`

* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
* Add props: `uibUpdated`, `uibUpdatedBy`
* Add status in Editor: # input msgs
* ?? Consider if worth adding a way to update a front-end javascript variable directly ??
* New type option "Template" - Replaces the selected element with a template clone. Then applies attribs/slot if required. [Ref](https://developer.mozilla.org/en-US/docs/web/html/element/template)

### Library: `ti-common.js`/`ti-common.css` (Shared Editor Code)

* Add `isNew` flag that indicates if a node instance has not yet been deployed. (e.g. new paste or import or drag from palatte)

### Library: FE Client

* [ ] [**STARTED**] Ability to visually show all uibuilder managed variables.

* [ ] [**STARTED**] Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

* [ ] [**STARTED**]  Add ability to save the current DOM.

  * [ ] [**STARTED**] To local storage - with option to reload on reload
  * [ ] [**STARTED**] (manual request is done) Send to Node-RED as a control msg (whole HTML or from a CSS Selector)

  

* ??? `uib.setAttr(selector, attr, val)`?  - quick way to set an attribute on an element.

* Consider special variable `managedTags`? where each entry update will automatically update the matching element ID and if the element doesn't yet exist, will watch for it and update as soon as it is added. E.g. setting value on `uib.managedTags.mytag` would update `<xxxx id="mytag"></xxxx>`. ?? Just the slot content? Or attributes as well (perhaps making the value an object).

* Add client `tag()` function that creates a new HTML element similar to the Node-RED side `uib-tag` node. (See https://redom.js.org for refs)

* A way to show and change uib-brand variables visually?

* Add Node-RED command to find out if a front-end library is installed.

* Add small button to showStatus output to allow user to turn off the display.

* Make sure that all watch/monitor fns emit custom events

* msgShow - add a message counter (optional?)

* Forms (eventSend):

  * Allow for multi-select sending array of selected options.
  * Allow for multi-select pre-selecting array of options.
  * Allow for "selected" `true` on option entries.
  
* Get _uib/_ui notify features to use Notification API if available

* *New Functions* (all to be callable from Node-RED):

  * [ ] `uibuilder.cacheSend()` and `uibuilder.cacheClear()` - send ctrl msgs back to node-red - reinstate in uib-cache fn now we've removed extra ctrl send.
  * [ ] `uibuilder.showLog()` - Add a visible panel on-page to show console.log output. Redirects (or maybe copies) uibuilder.log output - possibly also console.log. Will need amendments to the uibuilder.log function to give options for output to this and/or back to Node-RED.
  * [ ] `uibuilder.socketReconnect()` Add manual socket.io reconnection function so it can be incorporated in disconnected UI notifications.
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others) buttons. [ref](https://codereview.stackexchange.com/questions/192138/buttons-that-expand-or-collapse-all-the-details-within-the-document)
  * [ ] **HARD - may be impossible?** `uibuilder.convertToUI(cssSelector)` - convert part/all of the DOM to `_ui` json structure. [ref](https://stackoverflow.com/questions/2303713/how-to-serialize-dom-node-to-json-even-if-there-are-circular-references)
  
* Control from Node-RED. Functions to implement:

  * [ ] watchDom(startStop), uiWatch(cssSelector) [add custom event outputs]
  * [ ] setPing
  * [ ] `loadui()`
  * [ ] `clearHtmlCache()`, `saveHtmlCache()`, `restoreHtmlFromCache()`
  * [ ] getStore, setStore, removeStore - control browser local storage
  * [ ] Expand/collapse all details, expand previous/next (with/without collapsing others)

  * Add `info` outputs to commands. Allow the fns that commands call to have auto-send & info.
  
* Allow file uploads

* Add a `jsonImport` option to the _ui `load` method. The `jsonImport` property being an object where the keys are variable names to load to and the values are the URL's to load the JSON from.

* Add treeview formatting to syntaxHighlight. [ref](https://iamkate.com/code/tree-views/).

* Consider watching for a url change (e.g. from vue router) and send a ctrl msg if not sending a new connection (e.g. from an actual page change). `url` variable already added in preparation.

* Option for a pop-over notification to manually reconnect the websocket.

* Investigate use of [PerformanceNavigationTiming.type](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type) to detect page load type and inform uibuilder on initial message.

* Extend logging functions:

  * Report socket.io setup/config issues back to Node-RED using `beaconLog(txtToSend, logLevel)`.
  * [ ] [**STARTED**]  Add showLog function similar to showMsg - showing log output to the UI instead of the console.
  * Add option to send log events back to node-red via the `navigator.sendBeacon()` method.

    * `uibuilder` node will output control msg of type `Client Log` when client sends a beacon.
    * Make optional via flag in Editor with start msg enabling/disabling in client.
    * ? window and document events - make optional via uibuilder fe command.
  
* Add a standard tab handler fn to handle tab changes. Are DOM selectors dynamic (do they update with new DOM elements)? If not, will need to include a DOM observer.

* Extend clearHtmlCache, restoreHtmlFromCache, saveHtmlCache fns to allow *sessionCache*.

* Add a [resizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) to report resize events back to Node-RED as a control msg.

* Look at [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt), [`window.confirm`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm) and [`<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) - should _ui implement these?

* Get better control over what control messages can be sent. Centralise the list of control messages in use.

* Add functions for manipulating SVG's.

* Allow for PWA use:

  * Check for OFFLINE use and suppress transport errors
  * Add check for online/offline - make available to user code
  * Auto-generate manifest and sw.js - need icon and to set names/urls/etc
  * https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/how-to/web-app-manifests
  * Allow push API interface as well as websocket. https://developer.mozilla.org/en-US/docs/Web/API/Push_API
  
* Accessibility

  * Need to add a dismiss button to toasts
  * Check all auto-added elements for accessibility
  * Add count of current errors to title

### Library: `ui.js`

* [ ] uib-element/client - allow loading of data to the ROOT to allow for full HTML replacement
* [ ] [**Started**] Add optional page filter to _ui - if `msg._ui.pageName` not matching current page, don't process - *needs list and wildcard capabilities*.
* Filter on `msg._ui.routeId` (If using router).
* Content editor capability - to set editable content blocks. [ref 1](https://editorjs.io/)
* Add handling for `_ui.components[n].slots` where slots is an object of named slots with the special
  name of `default` for the default slot (default must be handled first since it overwrites all existing slots)
* Add check to uibuilder.module.js to prevent adding of multiple entries with same ID
* Allow adding to more locations: next/previous sibling
* Add click coordinates to return msgs where appropriate. See https://discourse.nodered.org/t/contextmenu-location/22780/51

### Library: `uibrouter.js` (FE router)

* Add option to auto scroll to a css selector on route change.

### Web Component: `uib-var` (internal)

* Allow no var attrib but instead allow ID to create a new managed variable.
* Add uib.var function as a test of using a proxy to manage vars and work with the uib-var component.

### Possible New Web Components

* `<uib-loop>`. [Ref](https://discourse.nodered.org/t/ui/82818/33?u=totallyinformation) - A web component that takes a variable to loop over. Slot content being used as a template and replicated. Need a way to represent loop properties in the template.
* lamp - [convert from vue version](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras)
* gauge - [convert from vue version](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras).

### Styles: `uib-brand.css`

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

### Server libraries

#### `libs/package-mgt.js`

* uibRoot package.json - add check if dependencies blank but `node_modules` is not empty, if so, repopulate? Need to decide when to check - on commit at least.

### Documentation (including videos)

* New doc for using `ui.js` outside of uibuilder.
* `README.md`: Add more links to the Features section so that each feature points to appropriate documentation. Add a landing-page link to "includes many helper features" to signpost to relavent detailed documentation.
* Node-specific docs.
* Reorg docs to make more sense to new starters & make more logical.
* Search for `*(This document is a work-in-progress, it is not complete)*` and update documents.
* Add message interaction diagram to "pre-defined-msgs.md"
* Add note to documentation for the library manager that you can install LOCAL folders.
* Finish [Configuring uibuilder](uib-configuration?id=ltuibrootgtltinstance-urlgt) and [Configuring `uibuilder` nodes](uib-node-configuration.md) pages.
* Add some notes about Node-RED's projects feature. It doesn't seem to add a correct .gitignore which should contain `**/node_modules`. Also add notes about the fact that projects creates a disconnect between the flows and the userDir folder.
* Add new doc to explain the HTML document hierarchy.
* Consider changing favicon slightly for the docs - to better differentiate from uibuilder apps.
* Allow offline usage. [Ref](https://docsify.js.org/#/pwa). Need to work out how to cache the plugins. May need a manifest.json?

#### WIKI

* Update examples
* [Helmet Example](https://www.npmjs.com/package/helmet)

#### Flows site

* https://flows.nodered.org/flow/bbe6803d9daebda5c991336cf4e5e3e0

#### Videos

* Updating content/attributes (see [ref](how-to/change-element.md))
* Each release
* Each node
* Snapshots (grab html and save somewhere)
* uibuilder reactive variables (set, get, onChange), uib-var
* Dynamically modify CSS class for HTML elements
* Low-code, do anything from Node-RED or browser
* UI updates using low-code. [ref](https://discourse.nodered.org/t/uibuilder-documentation-suggestions-and-improvements/74812/33?u=totallyinformation)
* Easy forms
* Forms - zero-code
* SHORT

  * quick-start example
  * Switch light/dark
* Mix of HTML and uibuilder uib-update for simple tasks.
* Caching - node and custom

### Examples

* Add a "Quick Start" example.
* Update the uib-element example.
* Update the remote-commands example.
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
* [Perspective](https://perspective.finos.org/) - interactive data dashboard

### Other changes

* Consider adding a virtual file system to enable uibuilder to work with FlowForge. [ref](https://discourse.nodered.org/t/ui-builder-and-flowforge-device-agent/79373/7)

### Ideas

* *STARTED* How to add FILTERs (text formaters) to `<uib-var>`? They should be a collection of JS functions that are auto-given the var as a value, add any other args and return a formatted version of the value. Filters should be chainable. Reflect.apply(target, thisArgument, argumentsList)
* PAGE CREATOR: Something that creates a new page file from template. Could be an extension to uib-save?

  * Maybe also a way to track pages? A catalogue? Maybe also an API to return all HTML file names as an array?
  * Consider scraping all .html files in each uibuilder instance and building an auto-list that can be added to the `../uibuilder/apps` page. Possibly with a manual override list option.
  * Add functions to not only reference page-names/urls but also to automatically create menus.
  * [Ref](https://discourse.nodered.org/t/why-would-i-want-to-use-uibuilder/81683/7?u=totallyinformation)
* THEME CONFGURATOR: Something that allows manipulation of theme settings from within Node-RED
* Consider using element setHTML() method if DOMsanitise is not available. [Ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)
* Consider adding a default CSS override to the `uibuilder` node. To be used when no CSS specificed and also to be used in admin/generated uib pages. Defaulting to `../uibuilder/uib-brand.css`.
* Change fixed text to use `RED._` for l8n. See: https://discourse.nodered.org/t/flexdash-alpha-release-a-dashboard-for-node-red/65861/48. [ref](https://discourse.nodered.org/t/question-on-internationalisation-can-i-have-1-json-file-for-several-nodes/76300/2)
* NEW NODE: `uib-room` - linked to a uibuilder node, creates a socket.io room. Will need a way to tell the connected clients to subscribe to the room (optional) and FE fns to connect/disconnect from rooms.
* UIB index page - new node? Default to root url. Show all instances by default, optional pages? Include descriptions. Selectable list of instances/pages. Allow for multiple instances of the node with different settings. CSS.
* ?For no-code nodes that might have class selectors - add a search button that searches the uib-brand.css?
* ?Have a toggled UI button that opens the Node-RED Editor to the correct location for the URL?
* Add custom internal store for any uibuilder nodes that want one - so that users don't have to manually configure a file store.

#### Questions that need answers

* How best to allow other nodes to provide zero-code nodes - that allow auto feedback from the front-end? e.g. something like the [node-red-contrib-ui-time-scheduler](https://github.com/fellinga/node-red-contrib-ui-time-scheduler) node.
* How to provide a better log output? With a simple way to link to Node-RED log output (filtered) as well as a dedicated output node. That output's to a web page with highlighting and possibly page back/fwd through history.

## UIBUILDER v7 planned breaking changes

* Minimum node.js v18
* Minimum node-red v4
* Removal of uib-list node
* Remove Pollyfills from uibuilder editor code
* Consider removing the css auto-load in the next major release since at least 1 person has hit a race condition. [ref](https://discourse.nodered.org/t/uib-brand-css-sometimes-injected/78876).
* Switch to default of case sensitive URL's for ExpressJS. Socket.IO is already case sensitive but ExpressJS is not. This can cause issues as shown in [Ref](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6)
* Add URL case sensitivity flag - currently ExpressJS and Socket.IO handle URL case sensitivity differently.

  In rare cases, this can cause an error. Will make both case sensitive in line with W3C recommendations (will be optional until next major release).

  Add case sensitivity flag to uibuilder node and allow setting of ExpressJS flags on routers. [ref 1](https://stackoverflow.com/questions/21216523/nodejs-express-case-sensitive-urls), [Ref 2](http://expressjs.com/en/api.html). Also document in  uibuilder settings. [Ref 3](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).
* Restrict `onChange` to only watch watched variables? (checking to make sure it doesn't start with `_` or `#`)

## Ideas for releases further out

### Changes needed for future versions of node.js (will be updating uib in line with Node-RED v3)

* Node.js v14 features - code updates to leverage the latest features

  * Replace `||` default value tests with `??` .
  * Replace checks for if a property exists with `?.` - [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
  * https://nodejs.org/en/about/releases/, https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V14.md, https://node.green/
  * [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
  * [Nullish Coalescing](https://wiki.developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_Coalescing_Operator)
  * [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DisplayNames)
  * [calendar &amp; numberingSystem for Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
  * Private Class methods (v14.5.1+)
  * WeakReferences (v14.5.1+)
  * Array flat and flat map
  * Optional catch binding
  * Object.fromEntries (helps make an object either from Map or from a key/value array)
  * **ESM IS STILL EXPERIMENTAL**
  * Corepack https://nodejs.org/dist/latest-v14.x/docs/api/corepack.html
  * Diagnostic reports. https://developer.ibm.com/articles/introducing-report-toolkit-for-nodejs-diagnostic-reports/, https://github.com/IBM/report-toolkit
* Changes due once Node.js v16 live:

  * Change style of requiring core node modules: `require('node:os')` instead of `require('os')`
  * JSON Modules (experimental in v14, full in 16.15.0)
  * Object.hasOwn is a static alias for Object.prototype.hasOwnProperty.call (16.9.0)
  * [Error cause](https://v8.dev/features/error-cause) (16.9.0)
  * [Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) (16.6.0) - allows use of negative indexes.
  * Stable Timers Promises API, RegExp Match Indices, which provide the start and end indices of the captured string (16.0.0)

  Refs: [release notes](https://nodejs.org/en/blog/release/v16.0.0), [What&#39;s New In Node.js 16?](https://www.howtogeek.com/devops/whats-new-in-node-js-16/)
* Changes due once Node.js v18 live

  * [Socket.IO with WebTransport](https://socket.io/get-started/webtransport) - requires https
  * [`findLast` and `findLastIndex` array methods](https://v8.dev/features/finding-in-arrays) (18.0.0)
  * Top-level await (experimental in v14 - behind flag, full in v18)
  * V8 updates

    * The `findLast()` and `findLastIndex()` array methods.
    * Improvements to the `Intl.Locale` API.
    * The `Intl.supportedValuesOf` function.
    * Improved performance of class fields and private class methods (the initialization of them is now as fast as ordinary property stores).
  * APIs now exposed on the global scope:

    * Blob - https://nodejs.org/api/buffer.html#class-blob
    * BroadcastChannel - https://nodejs.org/api/worker_threads.html#class-broadcastchannel-extends-eventtarget
  * Experimental

    * Fetch
    * Web Streams API
    * Test Runner
    * Experimental watch run mode (restarts the process)
* Changes due once Node.js v19 live

  * Web crypto: `globalThis.crypto` or `require('node:crypto').webcrypto`
  * `Intl.NumberFormat` v3 API is a new TC39 ECMA402 stage 3 proposal extending the pre-existing `Intl.NumberFormat`.
  * npm@8.19.2
* Changes due once Node.js v20 live

  * Consider the experimental permission model
  * Test Runner module
  * `String.prototype.isWellFormed` and `toWellFormed`
  * Methods that change Array and TypedArray by copy
  * Resizable ArrayBuffer and growable SharedArrayBuffer
  * RegExp v flag
  * Synchronous import.meta.resolve()
* Changes due once Node.js v21 live

  * Stable Fetch
  * Stable Webstreams
  * [Array grouping](https://github.com/tc39/proposal-array-grouping)
  * `ArrayBuffer.prototype.transfer`
  * Global `navigator` object.
  * Experimental

    * experimental browser-compatible WebSocket implementation
* Changes due once Node.js post v20

  * Diagnostic channels (experimental in v14)
  * AbortController and AbortSignal (experimental in v14)
  * Fetch (Experimental 16.15.0, 18.0.0)
  * Permission model (experimental in v20)
* Move the ui class to a separate *repo* so that it can be used independently.
* Consider moving all libs to separate repo to reduce number of direct dependencies. (probably requires node v16 for nested mono-repo modules)
* Restructure to a monorepo? With libs in 1, maybe nodes in their own and the front-end library in another? [ref](https://www.bing.com/search?pglt=161&q=what+is+a+monorepo&cvid=42b295dfc64143cfb64e4061114803fd&aqs=edge.0.0l9.7031j0j1&FORM=ANNTA1&PC=U531)
* Some way to visually expose a library of JavaScript functions with their args as inputs. Maybe make this a cmd that pulls a doc from Node-RED? (keeps client lib small)
* Using the above to visually show available uibuilder fns with inputs and outputs.
* Add optional TELEMETRY output (maybe linked to the log functions) - add mqtt endpoint to uibuilder settings.js (or maybe websocket?)
* Use `degit` to move default templates and maybe examples to their own repos - allowing more dynamic updates without needing a new version of uibuilder.
* Change ui.js to create global $ui object, change lib to match. Make sure it works in node.js as well as browser.

  In preparation for the ui library to be used stand-alone and have its own branding. Also allowing option for it to be managed as an independent library.

  Add a version and a version fn.

  Consider making available to Node-RED functions?

### Thoughts on JavaScript tabular data manipulation and visualisation

* An editable table widget for the browser where data changes are sent back to Node-RED.
* Some DataFrame style tools for manipulating 2d tabular JSON data.

  * Using msg._ui low-code - facilitating quick table updates from Node-RED.
  * In Node-RED functions - enabling simpler manipulation of 2d JSON data.
  * In the browser - as above.
* A live JavaScript interpreter in the browser that would let users do Jupyter notebook style interactions with browser data.

[Ref](https://discourse.nodered.org/t/noisecraft-anyone-heard-of-it/79813/19)

### General

* Consider creating a module that uses [gridstck.js](https://gridstackjs.com/#) where each grid entry gets a unique html ID. Needs a way to save the grid as HTML without the amend widgets but also as a gridstack object to allow re-editing.
* `uib-sender` node not really needed any more - consider putting a "deprecated" node.warn message prior to removing.
* Remove dependencies on fs-extra library - need to wait for node.js v16.7 to be minimum so that fs.cp/fs.cpSync is available

  * [X] libs/web.js
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
* Migrate from commonjs to [ES modules](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_commonjs_json_and_native_modules). (2) [JSON can&#39;t be imported directly in ESMs](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_json_modules), use createRequire.
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
* Revisit `elementIsVisible` - requires probably 2 fns at least. A monitor and a one-off check. One-off requires a separate observer function for each.

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

[Speculative entries](roadmap/readme) - May never happen.

---

## Rejected

[Rejected entries](roadmap/Rejected) - Don't repeat the mistakes!

## OLD

[Archived old entries](roadmap/Old)
