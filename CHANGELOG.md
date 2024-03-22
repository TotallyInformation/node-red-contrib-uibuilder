---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2024-02-24 16:49:59
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version. Check the [roadmap](./docs/roadmap.md) for future developments.

## v7 Planned Potentially Breaking Changes

* [ ] **Switch to default of case sensitive URL's for ExpressJS**. Socket.IO is already case sensitive but ExpressJS is not. This can cause issues as shown in [Ref](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

  Will make both case sensitive in line with W3C recommendations. Will also add a case sensitivity flag to uibuilder node and allow setting of ExpressJS flags on routers. [Ref 1](https://stackoverflow.com/questions/21216523/nodejs-express-case-sensitive-urls), [Ref 2](http://expressjs.com/en/api.html). Also document in  uibuilder settings. [Ref 3](https://discourse.nodered.org/t/uibuilder-and-url-case-sensitivity/81019/6).

* [ ] In the client library, add checks to make sure the variable doesn't start with `_` or `#`.

* [ ] Remove Pollyfills from uibuilder editor code - shouldn't impact anyone using a browser from the last 5 years or so.

* [ ] Will consider removing the *css auto-load* in the next major release since at least 1 person has hit a race condition. [ref](https://discourse.nodered.org/t/uib-brand-css-sometimes-injected/78876).

  This automatically loads the `uib-brand.css` if no css is provided at all. Since all of the standard templates include some CSS and have for a long time, this should not impact anyone.

* [ ] Will remove `serve-index` dependency if the `uib-file-*` nodes have been delivered.

  I'm really not sure anyone uses this in any case and the new nodes will provide a richer and more controllable experience.


## To Do

* Update examples:
  * [ ] [started] Update text update example to include new `uib-topic` html attributes
  * [ ] Add to uib-save example: topic example.
  * [ ] Template Examples - remove old library example.
  * [ ] `uib-sender` - remove ref to uibuilderfe and update flows.
* [ ] `uib-tag` input fields not resizing correctly.
* [ ] uib-element forms need some serious TLC! checkbox, radio

### `uibrouter` FE library

* [ ] ? Option to load route config from a file ?
* [ ] Add md rendering to `loadOther`
* [ ] Allow config updates from Node-RED
* [ ] Allow Markdown-IT plugins ([list](https://www.npmjs.com/search?q=keywords:markdown-it-plugin)) & additional config. [ref](https://github.com/markdown-it/markdown-it?tab=readme-ov-file#plugins-load)

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

### FE library

* [ ] Document `hasUibRouter` new function
* [ ] Need std innerHTML process to account for MD and sanitize.
* [ ] eventSend: Add form file handling.
* [ ] [STARTED] uib-attr process
  * [ ] Add processors for classes, styles, _ui. Need std innerHTML process to account for MD and sanitize.
  * [ ] ? Add uib-var processor?
* `uib-topic` attribute processing
  * [ ] Allow msg.value - including for checkboxes (to avoid el.checked confusion)
  * [ ] MAYBE: Allow msg.classes
  * [ ] MAYBE: Allow msg.styles

### FE `ui` library

* [ ] Check unique ID logic - use the new returnElementId in the uibuilder library
* [ ] Handle `<script>` tags in passed HTML content - using the uibrouter code.
* [ ] Allow Markdown-IT plugins ([list](https://www.npmjs.com/search?q=keywords:markdown-it-plugin)) & additional config. [ref](https://github.com/markdown-it/markdown-it?tab=readme-ov-file#plugins-load)

### `<uib-var>` custom HTML component

* [ ] Amend to use same processors as the uib-attr process above

### `uib-cache` node

* [ ] Add option to send cache on "route change" control msg
* [ ] Add option to ONLY send cache on "route change" control msg
* [ ] Add processing for filters - use saved input on `_ui` or `_uib`, process if filter turned on
* [ ] Add flag & filter for `routerId`
* [ ] Add flag & filter for `clientId`
* [ ] Add flag & filter for `pageName`
* [ ] Add a msg property option to DELAY delivery on cache replay.

### `uib-element` node

* [ ] Forms
  * [ ] Add hidden error div with suitable id.  [ref](https://discourse.nodered.org/t/dynamic-config-dashboard/84531/31)
  * [ ] Allow definition of error text.
  * [ ] Forms assume only 1 per page (actually probably all the elements do?) - form inputs should have really unique id's.
  * [ ] 
* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.
* [ ] Add new type: `navigation menu` - to work with the router.

### `uib-tag` node

* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.

### `uibuilder` node

* [ ] ?? Filter `clientId` and `pageName` using socket.io rooms?
* [ ] Check that users cannot create url's starting with `.`, `_` or be the word `common`.

### `uib-brand.css` styles

* [x] Document new resets and --max-width.

## Issues

* [ ] `uibuilder` file Editor - sometimes on file change, we get:
  Uncaught Error: Illegal value for lineNumber
  Error: Illegal value for lineNumber
      at e.getLineMaxColumn (editor.js:5:1743420)
      at zo.getViewLineMaxColumn (editor.js:5:1161732)
      at Go.getViewLineMaxColumn (editor.js:5:1174931)
      at es.getLineMaxColumn (editor.js:5:1196932)
      at new yn (editor.js:5:1096427)
      at In._actualRender (editor.js:5:1110215)
      at editor.js:5:1109784
      at editor.js:5:1109747
      at In._renderNow (editor.js:5:1109773)
      at In._flushAccumulatedAndRenderNow (editor.js:5:1107153)
      at In._onRenderScheduled (editor.js:5:1109678)
      at y.execute (editor.js:2:180485)
      at o (editor.js:2:181412)
      at editor.js:5:161683

### "Outdated" dependencies

Unfortunately, for various reasons, some of the package dependencies that UIBUILDER relies on cannot be updated to their latest versions. These are documented, with the reason, here.

* `execa` - restricted to v5. Author sindresorhus decided that everyone HAS to use ESM even though his packages are widely used and he must know that it is often impossible to move from CommonJS without a complete rewrite. Node-RED is so complex, when would that be possible? Very annoying.
* `jsdom` - restricted to v21. Later versions require node.js >v14 but Node-RED is still baselined at v14. Requires update to Node-RED to release this.
* `nanoid` - restricted to v3. Another annoying sindresorhus node.

These are only used for developing UIBUILDER so somwhat less critical.

* `@types/node` - restricted to v14 to match Node-RED's current baseline.
* ~~`gulp-debug` - restricted to v4. Another annoying sindresorhus node.~~ Removed in v6.8

I will be trying to eliminate packages that have enforced structural changes. The author's arrogance is palpable.

## Ideas

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

* **Minimum node.js now v18** - in line with the release of Node-RED v4, the minimum node.js version has moved from v14 to v18.

  If you need to update your own servers, please remember to do an `npm rebuild` of all node.js packages afterwards.

* **Rewrite of the `uibuilder.eventSend(event)` function** in the client library.
  
  This might have an impact only if you were relying on some of the auto-naming features of form elements since the formula for that has been significantly improved.

  That function has been extensively re-written and should provide significantly better results now.

* **Removal of the uibuilderfe library**
  
  If you are still using this old library in your HTML code, please move to the module based library as it is far more feature rich and has many bugs removed.

* **Removal of the `uib-list` node**
  
  The `uib-element` node does everything that it did and more.

* **Move socket.io-client from dependencies to dev-dependencies**

  If using the module based client library, you should not be loading the Socket.IO client yourself since it is already built into the client library. If you are still using the old `uibuilderfe` client, you should replace that and remove the socket.io client library from your html files.

* `jsdom` (using in the `uib-html` node) now tracks the latest releases again
 
  Shouldn't be breaking at all but you might still want to review things since the new versions of `jsdom` are likely to have better available features. We were restricted to jsdom v21 previously as newer versions required node.js v18+.





### 📌 Highlights

* You can now add a `uib-topic="mytopic"` attribute to _ANY_ HTML element. Doing so sets up a message listener. A matching msg.payload will replace the inner HTML of the element and msg.attributes will update corresponding attributes. Making this now one of the easiest ways to define dynamic updates in your UI.

* Lots of extensions and improvements to the `uibrouter` front-end routing library in this release:

  * You can now define a set of external html files (that can include scripts and css just like routes) that are immediately loaded to the page. These can be defined in the initial router config when they will be loaded immediately (before routes) or can be manually loaded later. Use these for things like menu's or other fixed parts of the UI.
  
  * You can now define route content as Markdown instead of HTML. This makes Notion/Obsidian-like applications feasible using UIBUILDER.

* Wherever you can use no-/low-code features that accept HTML, you can now include `<script>` tags that will be executed on load.

* A new node is available. `uib-file-list` will produce a list of files from a uibuilder instance. It automatically adjusts to the currently served sub-folder and allows filtering. Use this for producing indexes and menus.

* Security of the UIBUILDER repository on GitHub has been improved.

* The old `uibuilderfe` client library will now issue a user and a console alert on every load. The alert warns that the library will be removed when UIBUILDER v7 is released (which should happen once Node-RED v4 is also released). If you are still using the old client, please switch to the current client library ASAP. The new library has been available for nearly 2 years now, so time to move on.

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

* **NEW FUNCTIONS**

  * `Element.prototype.query(cssSelector)` and `Element.prototype.queryAll(cssSelector)` Similar to `$(cssSelector)` and `$$(cssSelector)` respectively. However, instead of searching the whole document, they search a sub-set of the document within the given element.
  
    For example: `$('#mydiv').queryAll('div')` would return all of the child `div`s of the element with the id `mydiv`. This can be a lot more efficient with very large documents.

  * `Element.prototype.on(event, callback)` is a shortcut for `addEventListener` and is a bit easier to remember. `callback` is a function with a single argument `(event)`.
  
    Inside the callback, `this` refers to the `event.target`. Unlike `addEventListener`, the `on` method does not support additional options. Use with anything that returns an object derived from `Element`, for example `$('#custom-drag').on('wheel', (e) => console.log('wheel', e))`. The `on` alias is also added to the `window` and `document` objects for convenience.

    > [!NOTE]
    > Only available in the browser.
    >
    > Since they are attached to the HTML `Element` class, they cannot be used in `uib-html`.

  * `hasUibRouter()` Returns true if a uibrouter instance is loaded, otherwise returns false. Note that, because the router will be loaded in a page script, it is not available until AFTER the uibuilder library has loaded and socket.io initialised.

  * `returnElementId(el)` Returns the element's existing ID. Or, if not present, attempts to create a page unique id from the name attribute or the attribute type. The last 2 will use a page-unique number to enforce uniqueness.
  * `getElementClasses(el)` Checks for CSS Classes and return as array if found or undefined if not.
  * `getElementAttributes(el)` Returns an object containing attribute-name/value keypairs (or an empty object).
  * `getElementCustomProps(el)` Returns an object containing custom element properties/values (or an empty object). Custom element properties are those set using code that are not standard properties.
  * `getFormElementDetails(el)` Returns an object containing the key properties of a form element such as `value` and `checked`.

  * `arrayIntersect(a1, a2)` Returns a new array (which could be empty) of the intersection of the 2 input arrays.
  * `makeMeAnObject(thing, property)` in your own code. It returns a valid JavaScript object if given a null or string as an input. `property` defaults to "payload" so that `uibuilder.makeMeAnObject("mystring")` will output `{payload: "mystring"}`.

  * `urlJoin()` returns a string that joins all of the arguments with single `/` characters. The result will start with a leading `/` and end without one. If the arguments contain leading/trailing slashes, these are removed.

* Improved handling of stand-alone input changes in the `eventSend` function. Previously, these may not have sent their new values on change events.

* `eventSend()` extensively rewritten and refactored. Auto-naming of form elements has changed slightly. Now handles file, and checkbox inputs much better. Handles radio inputs a little better. Handling of inputs inside and outside of forms should now be a lot more consistent.
  
  File inputs still do not yet upload the file but they do return a special URL which could download the chosen file(s).

### `ui` library

* **FIXED** small inconsistency when handling a msg._ui who's top level was an object with a `mode` mode property instead of an array.
* Improved Markdown handling. Should now be more efficient. Also HighlightJS code highlights should be better: Some unnecessary whitespace removed, code brought into line with the latest releases of the HighlightJS library, language guessing now only used if the language is not provided.
* Slot HTML content can now contain `<script>` tags that will be executed on load.

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

* Refactored some of the router methods, now exposing:
  * `loadRoute(routeId, routeParentEl)` - Loads template content to the page. Will load an external template if not already loaded. Calls `ensureTemplate`. Async, throws errors.
  * `ensureTemplate(routeId)` - Ensures that a specific template has been loaded. Will attempt to load an external template. Async, throws errors.

* `loadRoute` method now has optional 2nd argument, `routeParentEl`, a reference to an HTML parent element. The route template will be added to this as a new child. If not provided, the master content container is used (which has already been defined and created at router startup). This allows specific routes to be loaded to a different parent, useful for having things like menu's defined as routes or for loading routes as sidebars, etc.

* Now enforces only 1 instance of a router on page (would need to change how uib vars work otherwise).
* Internally, a tracking flag is added to inbound messages from Node-RED to indicate if/where they have been processed by the library. This helps to avoid double-processing. This is important now that there are ever more auto-process features available.

### `uibuilderfe` old front-end library

**REMOVED** - this was deprecated in UIBUILDER v5, it has now been removed completely. Please use `uibuilder.iife.min.js` (for simple `<script>` loading) or `uibuilder.esm.min.js` for ESM module imports.

The `old-blank-client` template and all associated documentation has also been removed.

### `uibuilder` node

* **NEW** Previously, a link and button to edit front-end code using VScode would be shown if running on localhost. This has now been changed. There is a field on the Advanced tab that lets you set any URL for any IDE or Code Editor that supports them. In addition, as well as for localhost, uibuilder will try to give a reasonable guess for a remote VSCode edit session. Though there is a good chance you will need to set this up in VScode and adjust the link accordingly.

  Using a full code editor or IDE with your front-end code is MUCH easier than using uibuilder's built in Monaco (or ACE) web editor and also allows for extensions, better linting and automations.

* If router loaded (`uibuilder.uibrouterinstance` exists), Add routeId to control messages and to `msg._uib` for standard msgs. 
  
  NB: Cant send route id with initial connect msg since router instance is added later. So cache control must happen on route change messages.

### `uib-list` node

**REMOVED** - this node was deprecated in UIBUILDER v6. It has now been removed. Use the `uib-element` node with one of the list element types.

### `libs/socket.js` library

* If a client msg received with a msg._uib property but the `uibuilder` node hasn't requested that they are shown, delete it before sending on to flow.

### `libs/uiblib.js` library (uibuilder utilities)

* `nanoid` external library replaced with internal code based on [`foxid`](https://github.com/luavixen/foxid)

### `uib-brand.css` styles

* `header`, `footer`, and `section` given same basic reset as `main`. So they all have max width and are centered in window. However, the formatting is now restricted only to where they are direct children of `body`.
* `article` given a border with rounded corners and same max-width as above. It is also given the `--surface3` background colour instead of the default `--surface2`. `h2`-`h4` immediately inside the article have reduced margins and a bottom border. This lets you use `article` as a "card" style visual. `div > article` gets additional left/right margins, same as `div > p` - allows for indented nesting/grouping.
* New variable `--max-width` added & set to `64rem`. This is used in the above resets.
* Block elements (h2-4, div, p) inside a summary element are now rendered as inline-blocks. Because a summary already creates a block and you usually don't want the other tags to also create nested blocks.
* Input, button, textarea and select tags given a minimum width of 2em to allow for more flexible form layouts.
* Minor tweaks to forms for better vertical alignment for check and radio input labels. Also include `form fieldset` and `form output` along with inputs.

### Examples

* `no-code-examples` - Updated to include dynamic script and css in the HTML passthrough example.

----

Older changes can be found in the Archived section of the UIBUILDER documentation.
