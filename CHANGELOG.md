---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2024-06-20 17:01:00
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version. Check the [roadmap](./docs/roadmap.md) for future developments.

## Can Wait

* [ ] Add Docsify external libraries to `/docs/.config` to allow true offline use of docs. Add new gulp process to update them, possibly pack them all.
* [ ] Add instance descriptions to the index pages
* [ ] Add automatic `search` handler for all uibuilder endpoints - [Ref](https://developer.mozilla.org/en-US/docs/Web/API/Window/location#example_5_send_a_string_of_data_to_the_server_by_modifying_the_search_property)
* [ ] New Node Idea: `uib-meta` - links to a uibuilder node and returns the instance metadata including URL's and folder locations and other settings. (e.g. use with [node-red-cleanup-filesystem](https://discourse.nodered.org/t/announce-node-red-cleanup-filesystem-request-for-testing/88135))
* [ ] uibuilder editor panel
  * [ ] Text in fieldset is fixed width
* [ ] uib-cache editor panel
  * [ ] Some inputs width not consistent
* [ ] uib-save & uib-file-list editor panels
  * [ ] URL drop-down width not consistent (check uib-update as this is correct)

### `uibuilder` node

* [ ] ?? Filter `clientId` and `pageName` using socket.io rooms?
* [ ] On uibuilder Libraries tab: Major version updates are not listed - because of package.json version spec - need to update docs?
* [ ] uibuilder.packages after an update does not contain the `outdated` prop for each package because the server only does a quick update and so does not call `npmOutdated` (from packge-mgt.js) on each package because it is async and quite slow. This may mean that update flags are not updated until the Editor is next reloaded which isn't ideal. Probably need to fix at some point.

### `<uib-var>` custom HTML component

* [ ] Amend to use same processors as the uib-topic?
* [ ] Add ability to directly amend the tag's attributes.

### **NEW FEATURE** Create package.json template for Node-RED projects

[Reference](https://discourse.nodered.org/t/uibuilder-install-default-packages-when-creating-a-node-red-projects/88496/6?u=totallyinformation)

An optional template package.json in `<uibRoot>/.config/projectPackage.json` where the `dependencies` are pre-requisite modules for new Node-RED projects.

Initial thinking is that there will be a new but optional file in the <uibRoot>/.config/ folder, called something like projectPackage.json. It would be, I think a sub-set of a standard package.json A full package.json on 2nd thoughts so that it would be easy to copy/paste your current <uibRoot>/package.json. That will let you include a default version, description, etc if you wish along-side the dependencies.

I will attempt to also trap a new project create to run the install if I can. Otherwise, it will display a notification for the user to run that manually. Not certain whether Node-RED will have to be restarted, I will try to avoid that but it might not be possible. Will have to test.

## To Do

* Update examples:
  * [ ] [started] Update text update example to include new `uib-topic` html attributes
  * [ ] **REMOVE** old client library example
  * [ ] Add to uib-save example: topic example.
  * [ ] Template Examples - remove old library example.
  * [ ] `uib-sender` - remove ref to uibuilderfe and update flows.
  * [ ] Navigation menu examples. 1x Router, 1x page.
* [ ] `uib-tag` input fields not resizing correctly.
* [ ] uib-element forms need some serious TLC! checkbox, radio
* [ ] Docs
  * [ ] Document new `globalThis['ti-uibuilder']` that contains `libs.tiEvents` and `uib`
  * [ ] Document `.config/uibMiddleware.js`, also update `docs\how-to\server-side-views.md`.
  * [ ] Document a dashboard-like grid layout.
  * [ ] Document how to use `<instanceRoot>/routes/` properly. [Ref](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/changelog?id=new-features)
  * [ ] Are all common event handler events documented?
  * [ ] Finish documenting Editor and runtime API's for new endpoint creation for 3rd-party extensions.
* [ ] Add endpoint creation apis
* [ ] Remove `writeJson` from package.mgt.js then remove `fs-extra` dependency
* [ ] Remove all tiEvents - swap to RED.events.
  * [ ] uibuilder: function externalEvents
  * [ ] uibuilder: this.on('close'
  * [ ] uib-sender
  * [ ] package.json

### `uibrouter` FE library

* [ ] ? Option to load route config from a file ?
* [ ] Add md rendering to `loadOther`
* [ ] Allow config updates from Node-RED

* [ ] Add external command listeners for:
  * [ ] `msg._uibRoute.load`. With the value being a route definition or an array of route definitions. (and update the eg flows)
  * [ ] `msg._uibRoute.loadOther`
  * [ ] `msg._uibRoute.rotate`
  * [ ] `msg._uibRoute.next`
  * [ ] `msg._uibRoute.previous`

* [ ] Add `defaultRouteOnLoad` flag (default=false) to allow for dynamically added routes to have been pre-selected on page load.
* [ ] Find a way to include a first-show marker if not unloading routes
* [ ] Update router example (code changes, remove remote cmd example).
* [ ] Route menu added from Node-RED not auto-highlighting.

* [ ] Update documentation:

  * [ ] `templateUnload` and `templateLoadAll` flags.
  * [ ] Remove doc for `unload` flag.
  * [ ] Document the `unloadTemplate` and `deleteTemplates` methods.
  * [ ] Make [this](https://discourse.nodered.org/t/urgent-regression/84197/15) and [this](https://discourse.nodered.org/t/uibuilder-front-end-routing-example/83319/9?u=totallyinformation) into some use-cases.
  * [ ] Update router config docs with new mdPlugins prop
  * [ ] Noting that if config.mdPlugins not set, uibuilder.ui_md_plugins may be used
  * [ ] document `ui-md-plugins` router variable


### FE Client library

* [ ] Document `hasUibRouter` and other new functions.
* [ ] document `ui-md-plugins` managed uib variable
* [ ] eventSend: Add form file handling. Not sure how as yet, will delay.
* [ ] [STARTED] uib-attr process
  * [ ] Add processors for classes, styles, _ui. Need std innerHTML process to account for MD and sanitize.
  * [ ] ? Add uib-var processor?
* `uib-topic` attribute processing
  * [ ] Allow msg.value - including for checkboxes (to avoid el.checked confusion)
  * [ ] MAYBE: Allow msg.classes
  * [ ] MAYBE: Allow msg.styles

### FE `ui` library

* [ ] document `ui-md-plugins` ui variable

### `uib-cache` node

* [ ] Document
  * [ ] How to send cache on "route change" control msg - use a switch node before the cache
  * [ ] How to ONLY send cache on "route change" control msg
* [ ] Add processing for filters - use saved input on `_ui` or `_uib`, process if filter turned on
* [ ] Add flag & filter for `routerId`
* [ ] Add flag & filter for `clientId`
* [ ] Add flag & filter for `pageName`
* [ ] Add a msg property option to DELAY delivery on cache replay. Or maybe an option to output replay to 2nd port which would be more flexible. 2nd port could also avoid all the extra options since they could simply be a change node that adds the appropriate `msg._uib` property.

### `uib-element` node

* [ ] Forms
  * [ ] Add hidden error div with suitable id.  [ref](https://discourse.nodered.org/t/dynamic-config-dashboard/84531/31)
  * [ ] Allow definition of error text.
  * [ ] Forms assume only 1 per page (actually probably all the elements do?) - form inputs should have really unique id's.
* [ ] Enhance List - [Ref](https://flows.nodered.org/node/node-red-node-ui-list)
  * [ ] Custom icons
  * [ ] Drag & Drop rearrange
  * [ ] Action - Click, Button, checkbox, switch, drop (reorder)
* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.
* [ ] Add new type: `navigation menu` - to work with the router.
* [ ] Add nav menu example, working with `uib-file-*` nodes.

### `uib-tag` node

* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.


## Issues

### "Outdated" dependencies

As of v7, all outdated dependencies have been removed or limited to uibuilder development only, not production use.

The following are only used for _**developing**_ UIBUILDER:

* `execa` - restricted to v5. Author sindresorhus decided that everyone HAS to use ESM even though his packages are widely used and he must know that it is often impossible to move from CommonJS without a complete rewrite. Node-RED is so complex, when would that be possible? Very annoying.
* `@types/node` - restricted to v18 to match Node-RED's current baseline.

## Ideas

* Change runtime parameter passes of `uib` to `globalThis['ti-uibuilder'].uib`
* Consider moving all handling of uib's package.json into a single lib. Only allow a single function to read/write/update
* ?New web component? - `<template-to template="templateId">` Similar to Vue's Teleport feature auto-insert a template.
* Add Vue-style dynamic attributes: [ref1](https://claude.ai/chat/0c494f54-758c-4f14-a8c7-90dbe6b2c5d7), [ref2](https://chatgpt.com/c/7b797547-4e7e-455d-927b-926de42171aa).
* Provide a common location and some standards to enable people to craft and share custom elements. Install using library mgr? Or as an NR plugin?
* Consider adding an Editor plugin that adds a sidebar tab to show: All uibuilder instances (with links to the node AND the page), All library and other standard endpoint references.
  * enableOnEdit (optional) If set to true, this tab will be accessible whilst the edit dialog is open. Default: false.
* Consider adding a uibuilder custom library - [ref](https://github.com/node-red/node-red-library-file-store)


### `uibrouter` FE library

* Add function that returns the route config schema

### `uib-cache` node

  * Add cache replay filtering. Option flags need adding for control. Filter by:
    * `routeId`
    * `clientId`
    * `pageName`

### Other

* gauge tiles - web component or new element? [ref](https://discourse.nodered.org/t/dashboard-2-beta-development/83550/133?u=totallyinformation)

------------

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.8.2...main)

<!-- Nothing currently. -->

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

### 📌 Highlights

* Some tweaks to the documentation should make it a little easier to get started with. The menu and UX has also been tweeked. There are new pages covering easy UI updates, common design patterns, creating well-structured HTML pages, and troubleshooting.

* You can now add a `uib-topic="mytopic"` attribute to _ANY_ HTML element. Doing so makes that element responsive to messages from Node-RED.
  
  For a message with the correct `msg.topic`. The `msg.payload` will replace the inner HTML of the element. `msg.attributes` will update corresponding element attributes. Making this now one of the easiest ways to define dynamic updates in your UI.

* The new node `uib-file-list` will produce a list of files from a uibuilder instance. It automatically adjusts to the currently served sub-folder and allows filtering. Use this for producing indexes and menus.

* The new built in `<uib-meta>` web component can be used in your HTML to display facts about the current page such as its file size, when it was created and when it was last updated.

* Lots of extensions and improvements to the `uibrouter` front-end routing library in this release:

  * You can now define a set of external html files (that can include scripts and css just like routes) that are immediately loaded to the page. These can be defined in the initial router config when they will be loaded immediately (before routes) or can be manually loaded later. Use these for things like menu's or other fixed parts of the UI.
  
  * You can now define route content as Markdown instead of HTML. This makes Notion/Obsidian-like applications feasible using UIBUILDER.
  
  * You can now use Markdown-IT plugins to enhance your Markdown content.
  
  * You can start with an empty routing list to allow dynamic creation of routes later on.

* Markdown improvements.
  
  Both the main uibuilder node (via the `ui.js` library) and the `uibrouter` library both accept markdown content (via the external Markdown-IT library) and now they both support *Markdown-IT plugins* so that you can add features such as checkbox lists, GitHub style callouts, Mermaid diagrams and much more. 
  
  There is also a new documentation page dedicated to using Markdown.

  And, the no-code example flow has been extended to demonstrate how to dynamically load all of the libraries, plugins and even how to set up responses back to Node-RED - for example when a checkbox is clicked.

* Wherever you can use no-/low-code features that accept HTML, you can now include `<script>` tags that will be executed on load.

* Handling of forms and inputs continue to improve.
  
  * Programmatic changes to input values or checked properties now trigger both the `input` and `changed` events - something that HTML normally doesn't do but can be important for data-driven web apps. For example, if using an `<output>` tag to show a combined or calculated input, changes via Node-RED will still update the values.
  * When using the `eventSend(event)` function on inputs whether inside or outside of a form, the returned values have been improved, especially for checkboxes and radio buttons.

* Security of the UIBUILDER repository on GitHub has been improved.

* On the `uibuilder` node's "Core" tab, the info buttons bar has changed slightly.
  
  The "Docs" button has gone (it is still on the top of panel bar anyway) and been replaced by a new "Apps" button which shows a page *listing ALL uibuilder node instances along with their descriptions where provided*.

  Most of the UIBUILDER nodes have be given a bit of a refresh of their Editor configuration panels. This work is ongoing but should give a more consistent look and feel and make the panels rather more responsive. The layouts are starting to use more modern CSS features. The work isn't complete yet so there are still a few inconsistencies - for example, when you make the panel wider - but we are getting there.

* For front-end developers, there are many new functions added to the `uibuilder` front-end library. Some are standard utility functions such as fast but accurate number rounding or conversion of primitives into objects. Others simplify the use of the DOM.

* For node developers. New events are now available using `RED.events` that track the setup of uibuilder, the setup of each uibuilder node instance and node instance url renames.

  This allows 3rd-party extensions to UIBUILDER to be more easily created. The events pass references to all of the information you might need. [New documentation also now available for contributors](dev/3rd-party-extensions.md) showing the various ways to easily build new content and features through custom nodes and web components.

* Connection headers have been added to the client details that are shown on control messages and on standard messages if the uibuilder "Include msg._uib in standard msg output." advanced flag is turned on. These may be particularly useful if using 3rd-party identity (authentication and authorisation) tooling which may put validated data into custom headings. Note however that these are "connection" headers, ongoing communications between the clients and the server do not update the headers (not possible over websockets) but will be updated if the client reconnects or reloads.

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

* Documentation
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

* **NEW FEATURE** - The library now actively monitors for `uib-topic` and `data-uib-topic` attributes on **ANY** HTML tag. Where present, a message listener is set up. Messages from Node-RED that match the topic will have their `msg.payload` inserted as the content of the tag (replacing any previous content) and any `msg.attributes` (key/value object) will add/replace attributes on the tag.
  
  Note however, that this uses the native HTML Mutation Observer API, when used on very large, complex pages and on a limited performance client device, this might occassionally cause performance issues. Therefore it will be made optional (but on by default as the code is quite efficient and should be unnoticeable in most cases).

  Use this feature as an alternative to using the `<uib-var>` custom web component.

* **NEW Web Component** - `<uib-meta>` - display's the page's file created/updated timestamps and file size.

* **NEW FUNCTIONS**

  * `Element.prototype.query(cssSelector)` and `Element.prototype.queryAll(cssSelector)` Similar to `$(cssSelector)` and `$$(cssSelector)` respectively. However, instead of searching the whole document, they search a sub-set of the document within the given element.
  
    For example: `$('#mydiv').queryAll('div')` would return all of the child `div`s of the element with the id `mydiv`. This can be a lot more efficient with very large documents.

  * `Element.prototype.on(event, callback)` is a shortcut for `addEventListener` and is a bit easier to remember. `callback` is a function with a single argument `(event)`.
  
    Inside the callback, `this` refers to the `event.target`. Unlike `addEventListener`, the `on` method does not support additional options. Use with anything that returns an object derived from `Element`, for example `$('#custom-drag').on('wheel', (e) => console.log('wheel', e))`. The `on` alias is also added to the `window` and `document` objects for convenience.

    > [!NOTE]
    > Only available in the browser.
    >
    > Since they are attached to the HTML `Element` class, they cannot be used in `uib-html`.

  * `arrayIntersect(a1, a2)` Returns a new array (which could be empty) of the intersection of the 2 input arrays.
  * `getElementAttributes(el)` Returns an object containing attribute-name/value keypairs (or an empty object).
  * `getElementClasses(el)` Checks for CSS Classes and return as array if found or undefined if not.
  * `getElementCustomProps(el)` Returns an object containing custom element properties/values (or an empty object). Custom element properties are those set using code that are not standard properties.
  * `getFormElementDetails(el)` Returns an object containing the key properties of a form element such as `value` and `checked`.
  * `getPageMeta()` Asks the server for the created/update timestamps and size (in bytes) of the current page. The result from the server is set into the managed `pageMeta` variable. Also used by the new `<uib-meta>` web component.
  * `hasUibRouter()` Returns true if a uibrouter instance is loaded, otherwise returns false. Note that, because the router will be loaded in a page script, it is not available until AFTER the uibuilder library has loaded and socket.io initialised.
  * `makeMeAnObject(thing, property)` returns a valid JavaScript object if given a null or string as an input. `property` defaults to "payload" so that `uibuilder.makeMeAnObject("mystring")` will output `{payload: "mystring"}`.
  * `returnElementId(el)` Returns the element's existing ID. Or, if not present, attempts to create a page unique id from the name attribute or the attribute type. The last 2 will use a page-unique number to enforce uniqueness.
  * `round(num, dp)` rounds a number to a set number of decimal places using a fast but accurate "commercial" format.
  * `urlJoin()` returns a string that joins all of the arguments with single `/` characters. The result will start with a leading `/` and end without one. If the arguments contain leading/trailing slashes, these are removed.

* Improved handling of stand-alone input changes in the `eventSend` function. Previously, these may not have sent their new values on change events.

* `eventSend()` extensively rewritten and refactored. Auto-naming of form elements has changed slightly. Now handles file, and checkbox inputs much better. Handles radio inputs a little better. Handling of inputs inside and outside of forms should now be a lot more consistent.
  
  File inputs still do not yet upload the file but they do return a special URL which could download the chosen file(s).

* Auto-load of the brand css (when no other CSS was loaded) has been removed. This could occasionally suffer from a race condition.
* Markdown-IT plugins can now be used when using Markdown. See the new "Using Markdown" documentation page for details.

### `ui` library

* **FIXED** small inconsistency when handling a msg._ui who's top level was an object with a `mode` mode property instead of an array.
* **NEW** Markdown-IT plugins can now be used. See the new "Using Markdown" documentation page for details.

* Improved Markdown handling.
  
  Should now be more efficient. Also HighlightJS code highlights should be better: Some unnecessary whitespace removed, code brought into line with the latest releases of the HighlightJS library, language guessing now only used if the language is not provided.

* Slot HTML content can now contain `<script>` tags that will be executed on load.

* Programmatic changes to input values or checked properties now trigger both `input` and `changed` events. By default, the DOM will not trigger events except for actual user input. This makes it easy to use `<output>` tags for example that automatically update when inputs change.

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

### `uib-list` node

**REMOVED** - this node was deprecated in UIBUILDER v6. It has now been removed. Use the `uib-element` node with one of the list element types.

### `uib-sender` node

* Changed custom event hander to `RED.events`.

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
