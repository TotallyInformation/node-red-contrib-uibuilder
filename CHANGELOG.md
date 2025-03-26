---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2025-01-17 20:14:34
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version. Check the [roadmap](./docs/roadmap.md) for future developments.

Please see the roadmap in the docs for the backlog of future planned developments.

## Compatibility of current release

* Servers:
  * Node-RED: v4+
  * Node.js: v18+ LTS
  * Platforms: Linux, Windows, MacOS, Raspberry Pi, Docker, etc.
* Browsers: 
  * CSS - 0.12% or above of global usage but not Internet Explorer ([ref.](https://browserslist.dev/?q=Pj0wLjEyJSwgbm90IGllID4gMA%3D%3D)). The uncompiled CSS should work in all current mainstream browsers. The compiled CSS (`uib-brand.min.css`) should work in browsers back to early 2019, possibly before. Enforced by [LightningCSS](https://lightningcss.com/).
  * JavaScript - ES6+ so should work in all current mainstream browsers. The compiled JS (`uibuilder.min.js`) should work in browsers back to early 2019, possibly before. Enforced by [ESBuild](https://esbuild.github.io/).

------------

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.1.0...main)

<!-- Nothing currently. -->

### 📌 Highlights

* **NEW NODE** `uib-sidebar` - Creates a simple sidebar in the Node-RED Editor page. HTML for the sidebar is edited in the node. Messages sent to the node are passed to the sidebar. Any input HTML elements automatically send changes back to the output of the node.

* **NEW FEATURE** `dom` - This is both a client-side new feature and a new message schema that facilitates data-driven DOM updates (e.g. web page updates) from both Node-RED and client code. It is a much simplified low-code feature. With it, you can easily create new content and update existing content on your web pages. It does, however, require some familiarity with HTML.

* Updated `applyTemplate` function in the ui/uibuilder client libraries, gives a lot more flexibility.

### **NEW** Node: `uib-sidebar`

Creates a simple sidebar in the Node-RED Editor page. HTML for the sidebar is edited in the node. Messages sent to the node are passed to the sidebar. Any input HTML elements automatically send changes back to the output of the node.


## **NEW/UPDATED BUILT-IN WEB COMPONENTS** (AKA "Widgets")

These are pre-built into the uibuilder client library and can be used in your HTML without the need for writing JavaScript.

* All of the components built into the uibuilder client library have been updated to match the latest standards used in my [independent web components](https://wc.totallyinformation.net/) as these represent the latest HTML standards and best practices.

* `<apply-template>` - Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed. Any existing content between the `<apply-template>` tags is replaced. However, if the template has a slot, the existing content is placed back into the slot. This allows you to wrap existing content with a template.

* `<uib-meta>` - Display's facts about the current page such as its file size, when it was created and when it was last updated. Obtains the data from Node-RED. The `type` attribute updated for ease of use.

* `<uib-var>` - A web component that can be used to display dynamic content. It can be used to display simple text, HTML, lists, tables, and more. It can also be used to send data back to Node-RED.

## **NEW** Front-end library: `tinyDom.js`

When used with UIBUILDER, exposes a new global object `dom`. Enables easy changes to your uibuilder-enhanced web pages by providing easy functions to add to, remove or update the existing page.

Also includes a new message schema that allows you to send messages from Node-RED to the client to update the DOM. This is a much simplified low-code feature.

See the [documentation](client-docs/fns/dom.md) for more information.

## Front-end library: `ui.js`

NB: Updates to this, also update the main uibuilder client library.

* **UPDATED FUNCTIONS**

  * `applyTemplate` - Now has 3 modes of operation. `insert` appends the template as the 1ST CHILD of the target. `replace` replaces all of the child content of the target. `wrap` puts the targets previous content into the 1ST SLOT of the template (if present), this allows you to wrap existing content with a template. Also improved error handling and did some code cleanup.
  * `$` - Now has an optional 3rd parameter to allow specifying the search root context. Defaults to `document` which was previously the only option. If used, must be a valid HTML element. Brings it further into line with similar functions in other libraries.
  * `$$` - Now has an optional 2nd parameter to allow specifying the search root context. Defaults to `document` which was previously the only option. If used, must be a valid HTML element. Brings it further into line with similar functions in other libraries.

## Documentation

* Docsify configuration updated so that the description for the currently shown page is reflected in the browser's meta description tag. This should help with search engine optimisation and when pasting a link from the GitHub version of the documentation into social media.

## Other changes

* Runtime log messages now all start with `🌐` to help them stand out from other log entries. All log output should then have `[....]` after the icon but before the information and data. The content of the braces being `uibuilder:` followed by additional information of what code module/function generated the log entry.
* Runtime warning log messages now all start with `🌐⚠️` to help them stand out from other log entries.
* Runtime error log messages now all start with `🌐🛑` to help them stand out from other log entries.
* Much previously deprecated code has been removed.
* Code linting has move from ESLINT v6 to v9. This was horrid work! And resulted in me raising 2 bugs with the ESLINT team. The new version of ESLINT is much more strict and has found a number of issues that were previously missed. This should result in better code quality.

## [v7.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.1.0...v7.0.4)

### 📌 Highlights

* **Any** *Node-RED custom node* can now send a message to a uibuilder client! In your runtime code, add `RED.events.emit('uibuilder/send/<url-name>', {payload: 'Hi from my custom node!'})` where `<url-name>` is the URL set in a deployed uibuilder node. The data will be sent to all browser tabs connected to that uibuilder endpoint. Note though that this bypasses any uib-cache node.

* You can now send a message from Node-RED to a connected client from a Function Node! Simply add `RED.util.uib.send('uibname', {....})` to your function code. This will send a message to all connected clients for that uibuilder instance.

* For front-end coders, you now have access to a number of table manipulation functions. Making it very easy to create and manipulate tables in your web pages from simple input data. You can add and remove tables, table rows and add event handlers (e.g. click) to rows or cells.

### General changes

* Added ability to send messages from Node-RED to a connected client from a Function Node. Simply add `RED.util.uib.send('uibname', {....})` to your function code. This will send a message to all connected clients for that uibuilder instance.

* References to `fs-extra` 3rd-party library removed from all nodes & libraries except `libs/fs.js`.

* [Socket](https://docs.socket.dev/docs/socket-for-github) security check tool added to all TotallyInformation GitHub repositories including UIBUILDER. Provides significant supply-chain security and privacy checks.

* All references to node.js's `fs` library now restricted to `libs/fs.js`.

* To help further improve the development of the brand css, [LightningCSS](https://lightningcss.com/) is now used to compile the source CSS. This ensures that the CSS is not using too new CSS options and improves the performance of the CSS. Additionally, stylelint is now used to check the CSS for errors and warnings.
* Now using LightningCSS to compile source CSS and ensure not using too new CSS options.

* Some unused NodeJS files have been removed.

* `@totallyinformation/ti-common-event-handler` dependency package now removed completely. `RED.events` is used throughout, all uibuilder events start with `UIBUILDER/`.

* To make it easier to create new elements in the future. Moved no-code element runtime processing to a common folder, `nodes/elements`. Added Editor API's and moved processing out of the `uib-element` runtime to separate module. Also moved element description and advanced options HTML to `nodes/elements/en-US`.

* The common code and css files in the `resources` folder (`ti-common.js` and `ti-common.css`) have been renamed to `editor-common.js` and `editor-common.css` respectively. This is to make it clearer that these are used in the Node-RED editor only.

* The `uib-plugin` library now renamed to `uib-editor-plugin` for clarity.

* New `uib-runtime-plugin` library added. Now manages most of the additions to `RED.util.uib` which contains functions made available to Node-RED function nodes.

* 1st phase of standardising event id's. All now start with `uibuilder/`.

* 1st phase of standardising log outputs. All will eventually start with `🌐` to help them stand out from other log entries.

### `uib-brand.css` styles & variables

* **NEW** Utility classes
  * `square` - Make something square or rectangular.
  * `round` - Make something circular, oval or pill-shaped
  
    Each of these are controlled by simple CSS variable overrides. See the [live file](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/front-end/uib-brand.css) for details on use.

* Core font now changed to match the uib-brand.css. No more Google fonts! This should make the UI more consistent and faster to load.
* Now using LightningCSS to compile source CSS and ensure not using too new CSS options.
* Added `text-wrap: balance` to `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `heading` and added `text-wrap: pretty` to `p`, `li`, `figcaption` - these make the elements look a little nicer when text is wrapping.
* Added `container-type: inline-size` to `header`, `footer`, `main`, `section`, `article`. This is in preparation for the future use of [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) which are a much more flexible alternative to [Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries) for controlling responsive layout breakpoints. Container Queries are still very new and not yet supported widely enough to use.
* Added some additional "reset" tweaks for improved visual style.

### Node: `uibuilder`

* Node-RED Editor:
  * **FIXED** When a URL is changed, the IDE editor url is now updated automatically. This is particularly important when copying/pasting a uibuilder node.

#### Front-end code templates

* Removed optional link to legacy CSS style library.

### Front-end library: `uibuilder.js`

* **NEW FUNCTIONS**

  * `buildHtmlTable` - Returns HTML of a table created from the input data.
  * `createTable` - Uses `buildTable` to create a new table and attaches to a parent element in the DOM.
  * `tblAddRow` - adds a new row to an existing table.
  * `tblRemoveRow` - removes a row from an existing table.
  * `tblAddListener` - adds row/cell listeners to the 1st tbody of a table. Will send a msg back to Node-RED when used with uibuilder.

* **Updated the front-end `index.html` templates to highlight that the uibuilder client library MUST be included.** After seeing several people take it out.

* Added `uibuilder:propertyChanged:${prop}` custom event when a managed variable changed. Has the same event.details as the 'uibuilder:propertyChanged' event. This event can be used instead of the `uibuilder.onChange('prop', ....)` function if preferred.

* Updated `uibuilder:propertyChanged` and `uibuilder:propertyChanged:${prop}` custom events to include `oldValue` as one of the event details. Will be `undefined` if the property is new.

* Updated `uibuilder.eventSend` function to include `msg._ui.dataset` which contains any `data-*` attributes from the element that triggered the event.

### Front-end library: `ui.js`

* **NEW METHODS**
  * `buildHtmlTable` - Returns HTML of a table created from the input data.
  * `createTable` - Uses `buildTable` to create a new table and attaches to a parent element in the DOM.
  * `tblAddDataRow` - adds a new row to an existing table.
  * `tblRemoveRow` - removes a row from an existing table.
  * `tblAddListener` - adds row/cell listeners to the 1st tbody of a table. Will send a msg back to Node-RED when used with uibuilder. Defaults to adding a `click` listener.
  * `tblGetCellName` - Returns a standardised table cell name. Either from a `data-col-name` attribute or a numeric reference like `C003`.
* Added `data-col-reference` attribute to created tables - on the `thead` row that actually defines the columns. Making it easier to get a reliable column reference later.

### Front-end components: `uib-var`

* Re-engineered to match the latest standards in the [TotallyInformation web-components library](https://wc.totallyinformation.net).
* Added `ready` event
* Removed shadow dom
* Error messages improved
* Add `source` prop when reporting change back to Node-RED

### Documentation changes

* Improved documentation for uibuilder's event handling and better linked that to how to create custom nodes that work with uibuilder.
* Improved documentation of the uibuilder extensions for the `RED.util.uib` object for use in Function nodes.
* Documentation for the new table handing functions in the client library.

### Example flow updates

* All examples showing the use of the old `uibuilderfe` client library have been removed.
* Several of the example flows have been updated to show the latest features.

### Runtime library changes

#### `web.js`

* Improved error checking and reporting in `serveVendorPackages` when mounting installed libraries. [Issue #428](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/428).

## [v7.0.4](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.4...v7.0.3)

Bug fix only. Missing originator on messages from clients.

## [v7.0.3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.3...v7.0.2)

Bug fix only. Issue for new UIBUILDER installations that would get the error `[node-red-contrib-uibuilder/uibuilder] TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received an instance of Array (line:393)`.

## [v7.0.2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.2...v7.0.1)

Bug fix only. Minor issue in `nodes/libs/uiblib.js` regarding the new `nanoId` client id creator.

## [v7.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.1...v7.0.0)

Bug fix only. New optional hooks failing if not present in settings.js.

## [v7.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.0.0...v6.8.2)

### ⚠️ Potentially Breaking Changes

Note that potentially breaking changes are only introduced in major version releases such as this one. It has been a couple of years now since the last, v6, major version.

Most of these changes will *not* impact most people but you should check through them just in case.

* If using UIBUILDER's custom ExpressJS server feature (instead of the Node-RED built-in one), **URL's are now case sensitive**
  
  This brings them into line not only with W3C guidance but also with the Socket.IO library. It can be turned off in `settings.js` using property `uibuilder.serverOptions['case sensitive routing']` set to false.

  Note that when using Node-RED's internal ExpressJS web engine (the default), URLs are still case-insensitive because that's how core Node-RED has been configured.

* **Minimum node.js now v18** - in line with the release of Node-RED v4, the minimum node.js version has moved from v14 to v18.

  If you need to update your own servers, please remember to do an `npm rebuild` of all node.js packages afterwards.

* **Rewrite of the `uibuilder.eventSend(event)` function** in the client library.
  
  This might have an impact only if you were relying on some of the auto-naming features of form elements since the formula for that has been significantly improved.

  That function has been extensively re-written and should provide significantly better results now.

* **Removal of the uibuilderfe library**
  
  If you are still using this old library in your HTML code, please move to the module based library as it is far more feature rich and has many bugs removed.

* **Removal of the `uib-list` node**
  
  The `uib-element` node does everything that it did and more.

* **Moved socket.io-client from dependencies to dev-dependencies**

  If using the module based client library, you should not be loading the Socket.IO client yourself since it is already built into the client library. If you are still using the old `uibuilderfe` client, you should replace that and remove the socket.io client library from your html files.

* **Removed the *css auto-load* from the client library** 
  
  This automatically loads the `uib-brand.css` if no css is provided at all. Since all of the standard templates include some CSS and have for a long time, this should not impact anyone.

  At least 1 person hit a race condition. [ref](https://discourse.nodered.org/t/uib-brand-css-sometimes-injected/78876). So this is best removed.

* `jsdom` (using in the `uib-html` node) now tracks the latest releases again

  Shouldn't be breaking at all but you might still want to review things since the new versions of `jsdom` are likely to have better available features. We were restricted to jsdom v21 previously as newer versions required node.js v18+.

* `ejs` package removed

  This should not impact anyone. `ejs` is an ExpressJS server-side templating library and what instructions exist (minimal) say that you need to install it manually. A new [How-to: Server-side Rendered Views](docs\how-to\server-side-views) has been created to help understand how to use server-side templating. It is far from complete however.

* Removed Pollyfills from uibuilder editor code - shouldn't impact anyone using a browser from the last 5 years or so.

* A `uibuilder` node cannot be given a URL name of `common` as this would clash with the built-in folder of the same name that holds resources that can be shared with all instances. This was an oversight in previous releases I'm afraid, now fixed.

* The `uibuilder` node, no longer has the "*Show web view of source files (deploy before you can use it)*" option. The supporting external library was also removed. It never looked that good anyway. Please use the new `uib-file-list` node to produce a custom folder/file list and send to your own custom page.

* Not really a breaking change but worth noting - if you use the Svelte template, that has been updated to use the latest versions of Svelte and Rollup. Those are both at least 2 major versions newer. In doing so, I had to replace a dev dependency and make changes to the config and npm scripts.

### 📌 Highlights

* Some tweaks to the documentation should make it a little easier to get started with. The menu and UX has also been tweeked. There are new pages covering easy UI updates, common design patterns, creating well-structured HTML pages, and troubleshooting.

* The new node `uib-file-list` will produce a list of files from a uibuilder instance. It automatically adjusts to the currently served sub-folder and allows filtering. Use this for producing indexes and menus.

* Markdown improvements.
  
  Both the main uibuilder node (via the `ui.js` library) and the `uibrouter` library both accept markdown content (via the external Markdown-IT library) and now they both support *Markdown-IT plugins* so that you can add features such as checkbox lists, GitHub style callouts, Mermaid diagrams and much more. 
  
  There is also a new documentation page dedicated to using Markdown.

  And, the no-code example flow has been extended to demonstrate how to dynamically load all of the libraries, plugins and even how to set up responses back to Node-RED - for example when a checkbox is clicked.

* Wherever you can use no-/low-code features that accept HTML, you can now include `<script>` tags that will be executed on load.

* Handling of forms and inputs continue to improve.
  
  * Programmatic changes to input values or checked properties now trigger both the `input` and `changed` events - something that HTML normally doesn't do but can be important for data-driven web apps. For example, if using an `<output>` tag to show a combined or calculated input, changes via Node-RED will still update the values.
  * When using the `eventSend(event)` function on inputs whether inside or outside of a form, the returned values have been improved, especially for checkboxes and radio buttons.

* File uploads from client browser to Node-RED are now enabled.
  
  When using a form on a page and using `<input type="file">`, if a file is selected by the client and the file is less than the size of the maximum message size, the file will be automatically uploaded to Node-RED when the form is submitted (assuming you use `uibuilder.eventSend(event)` to submit the form). The upload is a message with file details and the file itself as a buffer in `msg.payload`.

* Security of the UIBUILDER repository on GitHub has been improved.

* On the `uibuilder` node's "Core" tab, the info buttons bar has changed slightly.
  
  The "Docs" button has gone (it is still on the top of panel bar anyway) and been replaced by a new "Apps" button which shows a page *listing ALL uibuilder node instances along with their descriptions where provided*.

  Most of the UIBUILDER nodes have be given a bit of a refresh of their Editor configuration panels. This work is ongoing but should give a more consistent look and feel and make the panels rather more responsive. The layouts are starting to use more modern CSS features. The work isn't complete yet so there are still a few inconsistencies - for example, when you make the panel wider - but we are getting there.

* UIBUILDER now has its own "hooks" feature. For now, these can be used for allowing/blocking or debugging messages. More hooks may be added.

  By adding `uibuilder.hooks(...)` to Node-RED's `settings.js` and adding either of the functions `msgReceived` or `msgSending`, those functions will run when msgs are received from the client or about to be sent to the client respectively. Both functions need a return value of either `true` or `false`. `true` allows the msg through, `false` blocks the msg. You can also use the functions to alter the msg and, of course, to report on it to the Node-RED log. The functions receive `msg` and `node` as the arguments. So you can filter on the node's URL, socket id, client id, page name, etc.

  As well as debugging or msg altering, you can use these to help with message filtering, especially useful as part of authentication and authorisation processes. And somewhat simpler to use than Socket.IO middleware (which is still available).

* Connection headers have been added to the client details that are shown on control messages and on standard messages if the uibuilder "Include msg._uib in standard msg output." advanced flag is turned on. These may be particularly useful if using 3rd-party identity (authentication and authorisation) tooling which may put validated data into custom headings. Note however that these are "connection" headers, ongoing communications between the clients and the server do not update the headers (not possible over websockets) but will be updated if the client reconnects or reloads.

* UIBUILDER now recognises common external user authentications. See [Standardised msg._client properties for authenticated clients](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/security/authenticated-client-properties) in the docs for details. FlowFuse, Cloudflare Access, Keycloak, Authelia and Authentik as well as ones that use standard proxy headers should all be recognised.

* Documentation improvements
  * Access to the documentation inside Node-RED is now available fully offline, no Internet needed.
  * There are lots of new and update pages to explore.

* New example flows: (1) client-side code/Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED. (2) Blog/content grid layout. (3) Dashboard grid layout.

* Updated example flows: Various examples have been updated to simplify or improve them, including (1) Simple Flow - index.(html|js|css) can now be populated from a flow that uses uib-save. low-code/report-builder - The required Markdown-IT library is now auto-loaded from the Internet.

* For anyone even vaguely comfortable with HTML or front-end development:
  
  * You can now add a `uib-topic="mytopic"` attribute to _ANY_ HTML element. Doing so makes that element responsive to messages from Node-RED.
    
    For a message with the correct `msg.topic`. The `msg.payload` will replace the inner HTML of the element. `msg.attributes` will update corresponding element attributes. Making this now one of the easiest ways to define dynamic updates in your UI.

  * The built-in `<uib-var>` web component has been updated to be able to directly output HTML _tables_ and _lists_, simply send the appropriate data & set the `type` attribute.
  
  * A new library example has been added to illustrate the different ways to easily update your web pages using this component and the `uib-topic` attribute.

  * New built in *web components* which can be used in your HTML without the need for writing JavaScript
    
    *  `<uib-meta>` Display's facts about the current page such as its file size, when it was created and when it was last updated.
    *  `<apply-template>` Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed.

  * The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`. Remember though that `$()` returns a DOM element by default so all DOM element API's are available, e.g. `$('#myid').dataset` will return all `data-*` attributes.
  
  * Lots of extensions and improvements to the `uibrouter` front-end routing library in this release:

    * You can now define a set of external html files (that can include scripts and css just like routes) that are immediately loaded to the page. These can be defined in the initial router config when they will be loaded immediately (before routes) or can be manually loaded later. Use these for things like menu's or other fixed parts of the UI.
    
    * You can now define route content as Markdown instead of HTML. This makes Notion/Obsidian-like applications feasible using UIBUILDER.
    
    * You can now use Markdown-IT plugins to enhance your Markdown content.
    
    * You can start with an empty routing list to allow dynamic creation of routes later on.

  * There are many new functions added to the `uibuilder` front-end library. Some are standard utility functions such as fast but accurate number rounding or conversion of primitives into objects. Others simplify the use of the DOM.

  * Console logging level can now be set when loading the uibuilder client library. This allows the startup configuration of the library to be debugged.

* For node developers
  * New events are now available using `RED.events` that track the setup of uibuilder, the setup of each uibuilder node instance and node instance url renames.

  This allows 3rd-party extensions to UIBUILDER to be more easily created. The events pass references to all of the information you might need. [New documentation also now available for contributors](dev/3rd-party-extensions.md) showing the various ways to easily build new content and features through custom nodes and web components.

### "Outdated" dependencies (Resolved)

As of v7, all outdated dependencies have been removed or limited to uibuilder development only, not production use.

The following are only used for _**developing**_ UIBUILDER:

* `execa` - restricted to v5. Author sindresorhus decided that everyone HAS to use ESM even though his packages are widely used and he must know that it is often impossible to move from CommonJS without a complete rewrite. Node-RED is so complex, when would that be possible? Very annoying.
* `@types/node` - restricted to v18 to match Node-RED's current baseline.

### General Changes

* The minimum supported version of Node.JS is now v18.
* Additional security checks added to the public repository. Checks are now locked. OSSF Scorecard checks added. Checks are applied to `main` branch whenever updated.
* stepsecurity.io recommendations applied to the repository.
* Added a `SECURITY.md` policy document.
* Security issues in UIBUILDER can now be reported using GitHub's security advisory service using this link: https://github.com/totallyinformation/node-red-contrib-uibuilder/security/advisories/new
* Moved node definition files for uibuilder, uib-sender and uib-cache into their own sub-folders to match the other nodes. package.json and gulpfile updated accordingly. Also `locale/en-US` sub-folders created in readiness for moving help html. Some help files already moved.
* Removed all `> [!ATTENTION]` callouts from the documentation as it is not used in GitHub.
* The `socket.io-client` package is no longer a dependency. It is now only a dev-dependency thanks to the removal of the `uibuilderfe` client library. The current client library versions have it pre-built.
* The `nanoid` package is no longer a dependency. UIBUILDER now has its own UUID generator function. The nanoid package stopped being useful since it moved to only an ESM release.
* The `jsdom` package now tracks the current release again thanks to UIBUILDER moving to a node.js baseline in line with Node-RED v4 (Node.js v18)
* External module `execa` no longer a dependency.
* On the Detailed Information Page (uibindex) "User-Facing Routes" is changed to "Client-Facing Routes" to make it clearer.
* The Node-RED Editor utility resources `ti-common.css` and `ti-common.js` are now loaded only once using a new utility plugin. Previously they were loaded multiple times by each node.
* New example flows: client-side code/Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED.
* Updated example flows: Simple Flow - index.(html|js|css) can now be populated from a flow that uses uib-save. low-code/report-builder - The required Markdown-IT library is now auto-loaded from the Internet.
* For nodes that link direct to a uibuilder instance (`uib-save`, `uib-file-list`, `uib-sender`), changed the default label to 'choose uibuilder node' to better indicate what needs to be done before re-deployment.

* Documentation
  * **Now available fully offline** in Node-RED. Library code also now bundled for improved performance.
  * New How-To: Creating a well-structured HTML page.
  * New page: Easy UI updates - explaining the different ways you can easily and dynamically update content.
  * New page: Common design patterns - the most common ways of working with Node-RED and UIBUILDER.
  * New page: Troubleshooting - some thoughts on issues that might happen, how to spot them and fix them.
  * New page: Comparision between UIBUILDER and Dashboard 2.
  * Mustache plugin removed from Docksify load. Not used and not required since Docsify supports easy loading of custom Vue components which can do the same work.
  * Additional uibuilder web path added `./docs/resources` which is mapped to the `/front-end` package folder. Allowing the docs to use the images, router, branding, etc in the future.
  * The Docsify JS and CSS now split from the main html file for ease of management.
  * Tweaks to Docsify layout and UX for improved readability. A Table of Contents sidebar added that lists h2/h3 headings. The menu is simplified and only shows h1 entries.
  * Lots of minor updates and standardisation.

* URL's are now _case sensitive_ when using the custom ExpressJS server feature. 
  
  This can be [turned off in `settings.js`](uib-configuration#settingsjs) using property `uibuilder.serverOptions['case sensitive routing']` set to `false`.
  
  Socket.IO is already case sensitive but ExpressJS is not. This can cause issues as shown in [Ref](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

  [Ref 1](https://stackoverflow.com/questions/21216523/nodejs-express-case-sensitive-urls), [Ref 2](http://expressjs.com/en/api.html). [Ref 3](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

* Node-RED's admin optional auth token is now added to all admin API calls. [Ref](https://github.com/victronenergy/node-red-contrib-victron/blob/ac5e383b727a13d7f613cb02c183f5b205408c1b/src/nodes/victron-nodes.html#L233-L238). This should ensure that, if you are using tokens in your Node-RED authentication, all the UIBUILDER admin API calls should work consistently.


### NEW node - `uib-file-list`

Returns a list of files with their folders from the active source folder of the chosen uibuilder instance. The searches are constrained to that folder or below and may not escape for security purposes. In addition, any file or folder name starting with a `.` dot will not be searched. Any files or folders that are links, will be followed.

The optional `folder` setting lets you change the search root to a sub-folder. This does not allow a wildcard.

The `filter` and `exclude` settings use simple or advanced search specifications from the [fast-glob](https://www.npmjs.com/package/fast-glob) library.

The `URL Output?` setting will change the output from a folder/file list to a relative URL list (with all entries prefixed with `./` and any `index.html` file names hidden - this allows you to use them in an index or menu listing in the browser).

> [!TIP]
> 
> Use with the front-end router library. Use this node to dynamically create a navigation menu or sidebar index for example.

### uibuilder front-end library

* The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`

* **BUG FIX** - `uib-topic` attribute processing was not working for routes added with `uib-router`. Now fixed.

* **NEW FEATURE** - The library now actively monitors for `uib-topic` or `data-uib-topic` attributes on **ANY** HTML tag. Where present, a message listener is set up. Messages from Node-RED that match the topic will have their `msg.payload` inserted as the content of the tag (replacing any previous content) and any `msg.attributes` (key/value object) will add/replace attributes on the tag.
  
  Note however, that this uses the native HTML Mutation Observer API, when used on very large, complex pages and on a limited performance client device, this might occassionally cause performance issues. Therefore it will be made optional (but on by default as the code is quite efficient and should be unnoticeable in most cases).

  Use this feature as an alternative to using the `<uib-var>` custom web component.

* **NEW FEATURE** - You can now set the library's `logLevel` using an attribute on the script link itself. This lets you see what is happening in the library much earlier than previously possible. Particularly useful for debugging library config and startup.
  
  For the IIFE library: `<script defer src="../uibuilder/uibuilder.iife.min.js" logLevel="2"></script>`
  For the ESM library: `import '../uibuilder/uibuilder.iife.min.js?logLevel=2'`

* **NEW Web Component** - `<uib-meta>` - display's the page's file created/updated timestamps and file size.

* **NEW Web Component** - `<apply-template>` Takes the content of a `<template>` HTML tag and appends that content as children of itself. Allowing you to re-use standard, repeatable HTML without the need for JavaScript coding and without the need of sending potentially lengthy HTML from Node-RED every time it is needed.

* **UPDATED Web Component** - `<uib-var>` now "table" and "list" output types to go with the existing "text", "html" and "markdown" types.

* **NEW FUNCTIONS**

  * `Element.prototype.query(cssSelector)` and `Element.prototype.queryAll(cssSelector)` Similar to `$(cssSelector)` and `$$(cssSelector)` respectively. However, instead of searching the whole document, they search a sub-set of the document within the given element.
  
    For example: `$('#mydiv').queryAll('div')` would return all of the child `div`s of the element with the id `mydiv`. This can be a lot more efficient with very large documents.

  * `Element.prototype.on(event, callback)` is a shortcut for `addEventListener` and is a bit easier to remember. `callback` is a function with a single argument `(event)`.
  
    Inside the callback, `this` refers to the `event.target`. Unlike `addEventListener`, the `on` method does not support additional options. Use with anything that returns an object derived from `Element`, for example `$('#custom-drag').on('wheel', (e) => console.log('wheel', e))`. The `on` alias is also added to the `window` and `document` objects for convenience.

    > [!NOTE]
    > Only available in the browser.
    >
    > Since they are attached to the HTML `Element` class, they cannot be used in `uib-html`.

  * `applyTemplate(sourceId, targetId, onceOnly)` Applies `<template>` tag contents as appended children of the target. Similar to the new `<apply-template>` web component so that you can do the same thing from both JavaScript and HTML.
  * `arrayIntersect(a1, a2)` Returns a new array (which could be empty) of the intersection of the 2 input arrays.
  * `getElementAttributes(el)` Returns an object containing attribute-name/value keypairs (or an empty object).
  * `getElementClasses(el)` Checks for CSS Classes and return as array if found or undefined if not.
  * `getElementCustomProps(el)` Returns an object containing custom element properties/values (or an empty object). Custom element properties are those set using code that are not standard properties.
  * `getFormElementDetails(el)` Returns an object containing the key properties of a form element such as `value` and `checked`.
  * `getFormElementValue(el)` Check for el.value and el.checked. el.checked will also set the value return for ease of use.
  * `getPageMeta()` Asks the server for the created/update timestamps and size (in bytes) of the current page. The result from the server is set into the managed `pageMeta` variable. Also used by the new `<uib-meta>` web component.
  * `hasUibRouter()` Returns true if a uibrouter instance is loaded, otherwise returns false. Note that, because the router will be loaded in a page script, it is not available until AFTER the uibuilder library has loaded and socket.io initialised.
  * `makeMeAnObject(thing, property)` returns a valid JavaScript object if given a null or string as an input. `property` defaults to "payload" so that `uibuilder.makeMeAnObject("mystring")` will output `{payload: "mystring"}`.
  * `returnElementId(el)` Returns the element's existing ID. Or, if not present, attempts to create a page unique id from the name attribute or the attribute type. The last 2 will use a page-unique number to enforce uniqueness.
  * `round(num, dp)` rounds a number to a set number of decimal places using a fast but accurate "commercial" format.
  * `urlJoin()` returns a string that joins all of the arguments with single `/` characters. The result will start with a leading `/` and end without one. If the arguments contain leading/trailing slashes, these are removed.

* Improvements to the `eventSend()` function:
  * It has been extensively rewritten and refactored.
  * Auto-id'ing of form elements has changed slightly.
  * Handling of input values inside and outside of forms should now be a lot more consistent. Previously, these may not have sent their new values on change events & sometimes they didn't pick up a value at all.
  * **File inputs are auto-uploaded to Node-RED in separate messages** (if they aren't too large, change the Socket.IO buffer size in settings.js if needed).
  * Handles radio and checkbox inputs better. Will return both `value` and `checked` properties.
  * Multi-select inputs now always return an array containing the selected options (could be an empty array).
  
* Auto-load of the brand css (when no other CSS was loaded) has been removed. This could occasionally suffer from a race condition.
* **Markdown-IT plugins** can now be used when using Markdown. See the new "Using Markdown" documentation page for details.
* On first connection, Node-RED informs the client of the maximum allowed message size. This can be altered with the `uibuilder.socketOptions.maxHttpBufferSize` property in Node-RED's `settings.js` file.

### `ui` library

* **FIXED** small inconsistency when handling a msg._ui who's top level was an object with a `mode` mode property instead of an array.
* **NEW** Markdown-IT plugins can now be used. See the new "Using Markdown" documentation page for details.

* Improved Markdown handling.
  
  Should now be more efficient. Also HighlightJS code highlights should be better: Some unnecessary whitespace removed, code brought into line with the latest releases of the HighlightJS library, language guessing now only used if the language is not provided.

* Slot HTML content can now contain `<script>` tags that will be executed on load.

* Programmatic changes to input values or checked properties now trigger both `input` and `changed` events. By default, the DOM will not trigger events except for actual user input. This makes it easy to use `<output>` tags for example that automatically update when inputs change.

* The `$` function now allows a second parameter to change the output. Previously the output would always be the DOM Element. Now you can return the inner text, inner HTML or a list of attributes of the element. e.g. `$('.myelement', 'text')`.

### `uibrouter` front-end library

> Notes:
>
> 1. While it has various uibuilder integrations and is only currently published with UIBUILDER, the router library is not dependent on uibuilder and could be used separately if you like. Might be especially useful for Dashboard or http-in/-out flows.
> 2. To remote-control the current route from Node-RED, use uibuilder's `navigate` command: `msg._uib = {"command":"navigate","prop":"#route07"}`.

* **FIXED** Default route was always being set on load. Now correctly takes the current URL hash into account first.
* **FIXED** Routes loaded via script, if pre-selected on page load (e.g. in URL hash), were crashing. Now will automatically revert to the default route and just print an error to the console.

* **NEW** Router config property `otherLoad` and router function `loadOther` added. These let you load other external HTML template files on startup or manually (respectively). Used for external menu definitions and other fixed parts of the UI.
* **NEW** *External route content can now be Markdown instead of HTML*. The router route config property `format` has been added. By default the content for route templates is HTML, this property lets you optionally define template content as Markdown. In that case, if you have the *Markdown-IT* library pre-loaded, the Markdown template will be rendered as HTML automatically. This allows you to define route content using Markdown instead of writing HTML. If the *HighlightJS* library and CSS is also pre-loaded, code blocks will be nicely rendered.
* **NEW** If using uibuilder, added a new uibuilder managed variable `uibrouterinstance` which has a reference to the router instance. Will alow the uibuilder client library to auto-update things & will allow easier remote control from Node-RED.
* **NEW** Markdown-IT plugins can now be used if using Markdown. See the new "Using Markdown" documentation page for details.

* Refactored some of the router methods, now exposing:
  * `loadRoute(routeId, routeParentEl)` - Loads template content to the page. Will load an external template if not already loaded. Calls `ensureTemplate`. Async, throws errors.
  * `ensureTemplate(routeId)` - Ensures that a specific template has been loaded. Will attempt to load an external template. Async, throws errors.

* `loadRoute` method now has optional 2nd argument, `routeParentEl`, a reference to an HTML parent element. The route template will be added to this as a new child. If not provided, the master content container is used (which has already been defined and created at router startup). This allows specific routes to be loaded to a different parent, useful for having things like menu's defined as routes or for loading routes as sidebars, etc.

* Now enforces only 1 instance of a router on page (would need to change how uib vars work otherwise).
* Internally, a tracking flag is added to inbound messages from Node-RED to indicate if/where they have been processed by the library. This helps to avoid double-processing. This is important now that there are ever more auto-process features available.

### **REMOVED** `uibuilderfe` old front-end library

**REMOVED** - this was deprecated in UIBUILDER v5, it has now been removed completely. Please use `uibuilder.iife.min.js` (for simple `<script>` loading) or `uibuilder.esm.min.js` for ESM module imports.

The `old-blank-client` template and all associated documentation has also been removed.

### `uib-brand.css` styles & variables

* **NEW** Variables
  * `--max-width` added & set to `64rem`. This is used in the above resets.

* **NEW** Styles
  * `::file-selector-button` added to the list of formatted buttons.
  * `header`, `footer`, and `section` given same basic reset as `main`. So they all have max width and are centered in window. However, the formatting is now restricted only to where they are direct children of `body`.
  * `article > h1::before` Adds a warning not to use H1 tags in articles - only a single H1 tag should be used on a web page. Use H2, 3, or 4.
  * `td hr` reduced margin for when you want to use an hr inside a table cell (mostly markdown).
  * `td br` & `th br` increased top margin/line height. Mostly for Markdown tables where using paras might be difficult.

* Amended Styles
  * `body` has been given a slightly darker/lighter background. `--surface1` instead of `--surface2` to improve general contrast slightly.
  * `body > main` is now defined as a grid.
  * `main > article` and `main .left` are set to grid column 1. `main > aside` and `main .right` are set to grid column 2.
  * `article` given a border with rounded corners and same max-width as above.
    
    It is also given the `--surface3` background colour instead of the default `--surface2`. `h2`-`h4` immediately inside the article have reduced margins and a bottom border. This lets you use `article` as a "card" style visual. `div > article` gets additional left/right margins, same as `div > p` - allows for indented nesting/grouping.
    
  * Block elements (h2-4, div, p) inside a summary element are now rendered as inline-blocks. Because a summary already creates a block and you usually don't want the other tags to also create nested blocks.
  * Input, button, textarea and select tags given a minimum width of 2em to allow for more flexible form layouts.
  * Minor tweaks to forms for better vertical alignment for check and radio input labels. Also include `form fieldset` and `form output` along with inputs.
  * `*:focus` & `*:focus-visible` given `--secondary-fg` colour variable `:focus` is used as a fallback if `:focus-visible` not supported by the browser.
  * Major improvements to the `nav` menus. Especially `nav.horizontal`.
    
    `nav` menus now use `flex` for layouts.
    
    Horizontal menus now have the option of including a form for things like search boxes. They also collapse to vertical on screens smaller than 600px wide.

### Example Flows

* **NEW** - Dynamic SVG - A rework of an example from the flows library showing how to overlay interactive lamp icons on an SVG plan backdrop. Turn on/off lights from the web and from Node-RED.
* **NEW** - Content-grid (blog-style) layout example.
* **NEW** - Dashboard-grid layout example.
* `no-code-examples` - Updated to include dynamic script and css in the HTML passthrough example.

### `uibuilder` node

* **NEW** Previously, a link and button to edit front-end code using VScode would be shown if running on localhost. This has now been changed. There is a field on the Advanced tab that lets you set any URL for any IDE or Code Editor that supports them. In addition, as well as for localhost, uibuilder will try to give a reasonable guess for a remote VSCode edit session. Though there is a good chance you will need to set this up in VScode and adjust the link accordingly.

  Using a full code editor or IDE with your front-end code is MUCH easier than using uibuilder's built in Monaco (or ACE) web editor and also allows for extensions, better linting and automations.

* If router loaded (`uibuilder.uibrouterinstance` exists), Add routeId to control messages and to `msg._uib` for standard msgs. 
  
  NB: Cant send route id with initial connect msg since router instance is added later. So cache control must happen on route change messages.

* Removed Pollyfills from uibuilder editor code - shouldn't impact anyone using a browser from the last 5 years or so.

* **FIXED** A `uibuilder` node cannot be given a URL name of `common` as this would clash with the built-in folder of the same name that holds resources that can be shared with all instances. This was an oversight in previous releases I'm afraid, now fixed.

* Template settings made clearer. Now more obvious what is part of the template settings.

* The advanced option "Show web view of source files (deploy before you can use it)" has been removed. The supporting external library was also removed. It never looked that good anyway. Please use the `uib-file-list` node to produce a custom folder/file list and send to your own custom page.

* On the "Core" tab, the info buttons bar has changed slightly. The "Docs" button has gone (it is still on the top of panel bar anyway) and been replaced by a new "Apps" button which shows a page listing ALL uibuilder node instances along with their descriptions where provided. Also the "Full details" button has swapped position with the "Node details" button so that the instance-related buttons are on the left and the all-instances buttons are on the right.

* The help panel has been updated to better reflect the current configurations. Also some additional links added.

* The list of installed libraries now has more reliable behaviour for updates. If there are >1 updates waiting, updating 1 library no longer looses the other indicators.

* Connection headers have been added to the client details that are shown on control messages and on standard messages if the uibuilder "Include msg._uib in standard msg output." advanced flag is turned on. These may be particularly useful if using 3rd-party identity (authentication and authorisation) tooling which may put validated data into custom headings. Note however that these are "connection" headers, ongoing communications between the clients and the server do not update the headers (not possible over websockets) but will be updated if the client reconnects or reloads.

* Replaced custom event handlers with `RED.events`. All uibuilder events are prefixed with `node-red-contrib-uibuilder/` to ensure that there are no name clashes with other nodes or Node-RED core.

### `uib-element` node

* Form element enhanced:

  * File input type now sends a separate message containing each selected file as a buffer that can be given directly to the `uib-save` node or to any other node that accepts a file buffer. Includes additional details, file name, size, last updated, and file (mime) type.

* Table element enhanced:
  
  * Added class names to body cells (`r1 c1`, etc) & body rows (`r1`). Note that these class identifiers will get out of step if dynamic updates are made to the table.
  * Added `id` to table `${divId}-table`

* **FIXED** Markdown output was being wrapped in a `<markdown>` tag which should have been a `<div>` tag. Now fixed.

### `uib-save` node

* Message inputs now allow `msg.fname`, `msg.filename` or `msg.fileName` instead of just `msg.fname`. Makes it compatible with file type inputs and the `eventSend` function.

### `uib-list` node

**REMOVED** - this node was deprecated in UIBUILDER v6. It has now been removed. Use the `uib-element` node with one of the list element types.

### `uib-sender` node

* Changed custom event hander to `RED.events`.

### uibuilder templates

* Svelte template - Has been updated to use the latest versions of Svelte and Rollup. Those are both at least 2 major versions newer. In doing so, I had to replace a dev dependency and make changes to the config and npm scripts.

### `libs/socket.js` library

* If a client msg received with a msg._uib property but the `uibuilder` node hasn't requested that they are shown, delete it before sending on to flow.
* Removed serving of the socket.io client library as this is no longer required (client library is pre-built into the uibuilder library).
* Amended `listenFromClientCtrl`, now listens for a control msg `get page meta`, calls `fs.getFileMeta`, sends the output to the FE using the same control msg. Does not output to uibuilder node port #2.
* Connection headers have been added to the client details.

### `libs/uiblib.js` library (uibuilder utilities)

* **NEW FUNCTIONS** `runOsCmd(cmd, args, opts)` & `runOsCmdSync(cmd, args, opts)` - Run an OS Command. Used for running `npm` commands, replaces the external `execa` library.
* `nanoid` external library replaced with internal code based on [`foxid`](https://github.com/luavixen/foxid)
* `replaceTemplate` moved to `libs/fs.js` & fs-extra/cpySync replaced with node:fs/promises/cp

### `libs/fs.js` library (filing system handling)

* **NEW FUNCTION** `getFileMeta` - Returns at least created & updated timestamps and file size.
* `replaceTemplate` moved from `libs/uiblib.js` & fs-extra/cpySync replaced with node:fs/promises/cp
* Added sync and async copy fns

### `libs/package-mgt.js` library

* Replaced `execa` with `uiblib`.`runOsCmd`. `execa` no longer a dependency.
* Extensive re-write of the code, especially startup and install/remove. 2 new fns added, 6 old fns removed.

### `libs/web.js` library

* Removed Socket.IO client server - no longer required now that the old FE client has gone.
* Added new route `./docs/resources` mapped to the `/front-end/` folder to allow use of uib FE images, brand, router, etc in the docs.
* All filing system access moved to `libs/fs.js`

### All nodes Editor common JS/CSS

* All nodes now use the common `resources/ti-common.js` and `resources/ti-common.css` resource files in the Node-RED editor.
* Moved node-specific styling in HTML to the common CSS.
* Standardised styling to make it consistent across nodes.
* Added optional Node-RED auth token to admin API calls.

## Older changes

Older changes can be found in the Archived section of the UIBUILDER documentation.
