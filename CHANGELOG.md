---
typora-root-url: docs/images
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version.

## Notes for the current version

v6.1.0 makes the new client libraries (`uibuilder.esm.min.js` and `uibuilder.iife.min.js`) current and the old client library (`uibuilderfe.js`) is now no longer recommended and is not being updated, it is on the road to being deprecated. 

The experimental `uib-list` node will now be deprecated, the features are moved to the new `uib-element` node.

The new `uib-brand.css` style library is not yet feature complete - if you find something missing or wrong, please raise an issue.

Dynamic content does not currently work with VueJS (and probably not other frameworks that rely on pre-building components). Such frameworks _require_ both the components and the structure to be pre-defined _before_ the DOM is fully loaded. They have their own methods to provide dynamic includes, lazy loading, etc that are very different (and generally much more complex) than uibuilder's simple to use feature. **However**, dynamic content _DOES_ work with HTML components. The component definitions have to be loaded before you use them (that can be dynamic too!) and you _must_ use the ESM build of the uibuilder client library since HTML Components are ES Module only. And of course, it is possible - but probably less useful - to combine the vanilla HTML from the low-/no-code features with front-end frameworks such as Vue.

### Needs Fixing

```
[error] [uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal. url=aa, oldUrl=cache-test, Fldr=\src\uibRoot\aa. Error=dest already exists.
```

element - update mode - change to replace mode? Replace mode looks for root id, if found, replace outerHTML, if not found add.

Trace report for not loading uibMiddleware.js but not for other middleware files. Doesn't need a stack trace if the file isn't found and probably not at all. Make everything consistent. "uibuilder common Middleware file failed to load. Path: \src\uibRoot\.config\uibMiddleware.js, Reason: Cannot find module '\src\uibRoot\.config\uibMiddleware.js'"

## To do/In-progress

Check the [roadmap](./docs/roadmap.md) for future developments.

### uibuilder node

* Editor: Improve help box for _uib switch 

### uib-list node

* Add deprecation warning

### New `uib-element` node

* OPTIONS to add
  * ALL
    * Wire up classes, styles and heading settings
    * Allow msg overrides of settings. Props to allow: heading, classes, styles
  * TABLE
    * Caption
    * If named row comes from a field, make sure it is the 1st col and marked as a th
    * Add data-row-name to td's as well
  * LIST
    * list-style-type (add to outer) - several options plus text (incl emoji's)
    * Add div's around dt/dd pairs
    * ? Optional leading/trailing text ?
* ? Have JSON input msg templates for each type with links to copy to clipboard ?
* Docs
  * Parent: `#eltest-ul-ol > li:nth-child(3)` or `#eltest-ul-ol *[data-row-index="3"]`
  * Chaining
  * JSON msg templates for each type

### NEW node: `uib-update`

Send updates to an existing HTML element (using a selector). Uses _ui mode `update`

### Examples

* Update all to use new libs and updated templates
* Add example for Vue sfc loader.
* Update/add examples for each template
  * Add global Notification/Toast input
  * Add dynamic HTML input

### Templates
* Make the blank template truly blank
* Remove all msg displays. Add comment for showMsg, commented out for blank, in for others.
* [TotallyInformation/uib-template-svelte-simple](https://github.com/TotallyInformation/uib-template-svelte-simple), [TotallyInformation/uib-template-test](https://github.com/TotallyInformation/uib-template-test),

### Doc updates

* `isVisible`, `tabId` in new client builds.
* Updated `msg._uib` optional in standard msgs
* Notes on limitation of dynamic UI for Vue, etc.
* WIKI
  * Update examples
* Flows site
  * https://flows.nodered.org/flow/bbe6803d9daebda5c991336cf4e5e3e0
* Update caching info to include info on html cache.

* HTML
  *     --heading-h2-border-color: var(--mono-tint2);
  * Set `.markdown-section h2 {border-bottom-width: thick;}`
  * Set `.markdown-section h3 {border-bottom-width: thin;}`
  * Set `--heading-h3-border-color: var(--mono-tint2)`


----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.1.0...main)

<!-- Nothing currently. -->

### Summary of notable changes

> Please remember that no changes are being made to the old `uibuilderfe.js` client. Nothing listed here applies to that.

* New zero-code nodes `uib-element` and `uib-update` let you use simple data to create dynamic web UI's.

* The client library has a number of fixes and new features
  * Extensions to the `eventSend` function to include **form data** and **value changes**. Should greatly simplify creating and using FORMs and providing quick inputs for Node-RED flows.

  * New function: `uibuilder.showMsg(true)` Displays an on-screen card at the end of the current display that automatically updates with the last msg received from Node-RED. `uibuilder.showMsg(false)` turns it off.
  * New function: `uibuilder.watchDom(true)` Starts watching the content of the page and saves it to browser localStorage so that it can be recovered at any time. Use `uibuilder.restoreHtmlFromCache()` to recover the stored HTML (e.g. on page load). Use `uibuilder.watchDom(false)` to turn off and `uibuilder.clearHtmlCache()` to remove the saved HTML. If desired, you can also manually save the HTML at any point using `uibuilder.saveHtmlCache()`.
  * New functions: `uibuilder.syntaxHighlight(json)`, `uibuilder.logToServer(...)`, `uibuilder.beaconLog('text')`.

  * Reports changes of **visibility** of the page back to node-red via a new control msg.
  * Creates a browser `tabId` which is reported back to node-red when messages are sent. Helps identify the origin. Future uibuilder versions will let you send messages to a specific tab id which does not change even if the page is reloaded (only if the tab is closed).
  * Messages sent from the client either inherit the topic from the last inbound msg or from a default set using `uibuilder.set('topic', 'my topic string')`. The default will take preference. Reset by setting to an empty string.
* If you turn on the advanced option "Include msg._uib in standard msg output.", messages from the client now include client details for you to use in your own security processing or just to identify where things have come from (e.g. what page name as well as what client).
* All of the templates and example flows have been refreshed with the latest standards.
* Plenty of documentation updates and additions.

### `uibuilder` node

* Added JSON and Form encoded body processing to all user instance routes to allow for processing POST requests

* Added new user web endpoint `./_clientLog` (`web.js`::`addLogRoute()`). This can only be POSTed to and should only be used for `navigator.sendBeacon` text messages (the body of the POST has to be plain text).

* Updated optional `msg._uib` properties on standard output messages, additional metadata added:

  ```javascript
  msg._uib = {
    "clientId":"0yB8nqLSbhWAEyEpEuPYa",
    "remoteAddress":"::1",
    "pageName":"index.html",
    // The uibuilder URL setting
    "url":"uibUrl",
    // ID of the client tab - NOTE: If a tab is duplicated, it will have the same ID
    "tabId":"t568878"
  }
  ```
  
  This data should help when working out identities for authentication and authorisation as well as enabling specific page/tab/user processing.

* Updated connect, disconnect and error control messages. They now show more details about the originating client and page.

  In particular, the connect msg now has `msg.lastNavType` which shows what the browser reported about the last time the originating page loaded. e.g. "navigate", "reload", "back_forward", "prerender". This comes from the [Performance browser API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming).

* Reinstated ability for client to send uibuilder control messages.
  * New "visibility" control msg now added which uses the document `visibilitychange` event.

* Editor
  * Added Open button to top button bar next to Delete. Add globe icon to open buttons.
  * Added Docs button next to new Open button. Add book icon to docs buttons.
  * Disable the new Open button along with other disabled things when new or url has changed.


* `socket.js`
  * When asked to add msg._uib to std output msgs, Standardised on the same client details as for control msgs to make downstream processing easier.
  * Added visibility-change control msg. Sent by FE client. Fires when the open page changes from hidden-to-visible or visa versa.
  * New functions: sendCtrlMsg, getClientDetails. Standardise/simplify client details shown on control msgs.

* `web.js`
  * Added new `addBeaconRoute` function that sets up the `./_clientLog` instance endpoint. Use the new client `uibuilder.beaconLog(txtToSend, logLevel)` function to send a simple text log back to Node-RED even if socket.io isn't working.

### IIFE/ESM/Module client library

* Bug fixes
  * Fixed issue where method:update for msg._ui handling would cause a loop and console error. An assign by reference error fixed by forcing a shallow copy at the start of `_uiUpdate`.
  * Fixed bug where the library was loading `uib-brand.css` even when it didn't need to. It now doesn't load automatically even if there is a single stylesheet loaded on startup.

* `uibuilder.eventSend(event)` function improved. 
  
  * Now prevents the default event action from happening.
  
  * If the element that triggers the event is part of an HTML **form**, all of the form input values are included in `msg._ui.form`.
  
  * If the event type is `change`(e.g. a user changed an input field and then moved to a new field), a `msg._ui.newValue` property is generated. 
  
    If you want to report the old value as well, you need to add something like `onfocus="this.setAttribute('data-oldvalue', this.value)"` to the element's attributes. This would be included both in `msg.payload.oldvalue` and in `msg._ui.attribs.data-oldvalue`.

    Alternatively, `onfocus="this.uib_oldvalue = this.value"` would cause the previous value to be included as `msg._ui.props.uib_oldvalue`.

* Added a default `msg.topic` option. `uibuilder.set('topic', '....')` Will be used in msgs sent back to node-red if no topic specified. Note that if the default topic is not set, messages will inherit the topic from the _previous inbound message_ if that had a topic. Reset by setting to an empty string.

* Added **new function** `uibuilder.syntaxHighlight(json)` - Converts JSON/JavaScript object into highlighted HTML. Useful for debugging messages sent from/to Node-RED. This used to be in each template so you don't need it there any more.

* Added **new function** `uibuilder.showMsg(true)` - Adds a visual display of incoming messages from Node-RED to the web page. Use `uibuilder.showMsg(false)` to remove it.

* Added a unique tab identifier `uibuilder.tabId` that remains while the tab does. Is include in std outputs. Based on [this](https://stackoverflow.com/questions/11896160/any-way-to-identify-browser-tab-in-javascript). NOTE however, that duplicating the browser tab will result in a duplicate tab id.

* Added `uibuilder.isVisible` property. Is true when the browser tab containing the page is actually visible. On visibility change, sends a new control msg `msg.uibuilderCtrl` = "visibility" with the property `isVisible` true or false. Does not send this when the page loads but does set the property. Uses the document `visibilitychange` event.

* When triggering `showDialog()` either in the FE or by sending a toast notification from node-red, setting "variant" now allows any CSS class name to be used. Not just the previous list of names ('primary', 'secondary', 'success', 'info', 'warn', 'warning', 'failure', 'error', 'danger') though since they are all included as classes in uib-brand.css, they all still work.

* Added internal flag if VueJS is loaded. To be used for dynamic UI processing.

* Extended the standards for `msg._ui` with mode=update to include the properties `selector` or `select`. These take CSS selectors as their value (as does the `type` property) and take preference over a `name` or `type` property but not over an `id` property. Mostly for convenience and just easier to remember. Documentation also updated.

* Added a `position` property to the `add` _ui mode. "first"/"last": Adds start/end of parent's children respectively.

* Added **new function** `uibuilder.beaconLog(txtToSend, logLevel)` which allows sending a simple, short log message back to Node-RED even if socket.io is not connected. In Node-RED, outputs to the Node-RED log and sends a uibuilder control message where `msg.uibuilderCtrl` = "client beacon log".

* Added **new function** `uibuilder.logToServer()` which will take any number and type of arguments and send them all back to Node-RED in the msg.payload of a _control_ message (out of port #2) where `msg.uibuilderCtrl` = "client log message". Client details are added to the message.

* Added **new function** `uibuilder.watchDom(true)` - Starts watching the content of the page and saves it to browser localStorage so that it can be recovered at any time. Use `uibuilder.restoreHtmlFromCache()` to recover the stored HTML (e.g. on page load). Use `uibuilder.watchDom(false)` to turn off and `uibuilder.clearHtmlCache()` to remove the saved HTML. If desired, you can also manually save the HTML at any point using `uibuilder.saveHtmlCache()`.

* Added 2 new events: `uibuilder:constructorComplete` and `uibuilder:startComplete`. Mostly for potential internal use.

### `uib-cache` node

* Added filter to remove msg.res and msg.req which come from ExpressJS and cannot be serialised so create errors.

### **NEW** `uib-element` node

This node lets you easily create new front-end UI elements from within Node-RED. It has a selection of element types ranging from simple text structures, through different types of list and full tables. It is a much more comprehensive node than the previous, experimental, `uib-list` node.

**Note that this generates pure HTML - no frameworks are used**.

It creates configuration-driven dynamic additions to your front-end UI while letting you send fairly simple data to dynamically create the structure. For example, sending an array of objects with the `Table` type will create/replace a complete table in your front-end.

Has a single output. Outputs can be chained to more `uib-element` nodes. At the end of the chain, simply send to a uibuilder node input. Optionally, make sure each chain has a unique topic and send to a `uib-cache` node so that new and reloaded browser clients get the last output.

> **Note**: The range of options built into the node for each element type is deliberately fairly restricted. If you want more complex layouts, you should either craft the JSON yourself (this node can output the raw JSON if you want so that you can save it and enhance it yourself. Also, this initial release is mostly driven by the input data; in future releases some options will be capable of override using configuration inputs in the node.
> 
> This is NOT meant as a *Dashboard* replacement. It is mostly meant for people who need a quick and simple method of dynamically creating UI elements's within a pre-defined HTML design. The element content is rebuilt every time you send data so this is certainly not the most efficient method of working with data-driven UI's. However, it will often be good-enough for relatively simple requirements.

Element types included in this release:
* **Simple Table** - Generates a simple HTML table from an input array of objects where the first element of the data array will define the columns. Future enhancements will allow more control over the columns. Future types will be added to allow add/update/remove of individual rows and/or cells.
* **Unordered List (ul)**/**Ordered List (ol)** - Generates a bullet or number list from a simple input array or object.
* **Description List (dl)** - Generates a description list from a simple input array of objects.
* **Text box with optional heading** - A simple "card" like element.
* **HTML** - Pass-though HTML (e.g. from a Node-RED Template node).
* **Page Title** - Change the page HTML title, description and the first H1 tag on the page to all be the same input text.

Each element except the page title is wrapped in a `<div>` tag which has the specified HTML ID applied to it. Where possible, rows and columns are given their own identifiers to make updates and styling easier. Attempts are made to ensure that the resulting HTML is accessible.

Each element can have an optional heading. If used, a aria-labelledby attribute is added to the `div` tag for accessibility.

> [!warning]
> 1) Each HTML ID **must** be unique on the page otherwise updates and replacements will almost certainly not work as expected.
>
> 2) Only the `msg.topic` can currently override any of the settings. This will be improved in future releases.

### `uib-brand.css`

* Is now the default CSS for all of the templates.
* Added JSON syntax highlight rules from `uib-styles.css`. Also improved the layout and features.

### Templates

* All of the templates have been updated to the latest uibuilder standards for v6. 
* The default blank template and any others that don't specify which client build is used now use the new `uibuilder.IIFE.min.js` build.
* All templates using the new clients have a `<div id="more"><!-- '#more' is used as a parent for dynamic content in examples --></div>` line in the HTML which is a useful target for adding dynamic content from Node-RED.
* All templates have updated and rationalised README.md and package.json files in the root folder.
* All templates have .eslintrc.js files in the root folder. You may need to install eslint extensions to match. If this file gets in the way, it can be safely deleted. It helps maintain standard coding practices and helps avoid the use of JavaScript which is too new.
* Removed the (c) from the remaining templates. There is no (c) on any of them. They all fall under MIT license. Use as you will, there are no intellectual property restraints on the template code.
* Change all to load client from `../uibuilder/uibuilder.xxx.min.js` instead of `./uibuilder.xxx.min.js` for consistency with other standard and installed library loads. Note that both locations remain valid.
* Moved all scripts to head with defer now we no longer expect IE. Much cleaner code.
* Changed templates to use CSS from `../uibuilder/uib-brand.css` rather than `./uib-brand.css` for better consistency.
* Updated:
  * [x] blank
  * [x] blank-iife-client
  * [x] blank-old-client
  * [x] blank-esm-client
  * [x] iife-vue3-nobuild
  * [x] vue v2 + bootstrap-vue
  * [x] vue v2 + bootstrap-vue - simple
  * [x] svelte-basic


### Examples

* Report Builder. Create HTML reports direct from Node-RED. See [Forum thread](https://discourse.nodered.org/t/creating-reports-using-node-red/73664), [Flow site](https://flows.nodered.org/flow/99e1e6169b5e93b460bcbcc8f493d011#).
* Update to use modern client
  * [x] jQuery
  * [ ] logging
  * [x] simple - No longer uses VueJS since it really isn't needed!
  * [ ] toast-notifications
  * [ ] uib-cache
  * [ ] uib-sender
  * [ ] vue
* New for v6.1.0
  * [x] low-code-report-builder (new for v6.1.0)
  * [x] Svelte-basic
  * [ ] ESM
* Examples matching templates:
  * Added node descriptions throughout.
  * Added notification inputs to all and new card (dynamic UI creation) & reload inputs where appropriate.

### Documentation

* Improvements to h1-h5 headings to make them stand out more clearly.
* Split the "The modern front-end client" into multiple pages for easier reading and navigation.
* Updated the modern front-end client docs with the latest client updates.
* Renamed "Tech Docs" to "Docs" throughout.

## [v6.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.0.0...v5.1.1)

### Breaking Changes

* Minimum Node-RED version is now v3
* Minimum Node.js version is now v14 LTS (in line with Node-RED v3) - note that the minimum minor version changes to the latest v14 LTS version whenever uibuilder is updated.
* Not sure if this is really breaking. However, `uib-cache` nodes were not properly handling cases where, when processing incoming msgs, the chosen "Cache by" msg property was an empty string in the input msg. Previously handling of that case was dependent on the store and type being used. It is now ignored. The common case is where the setting is `msg.topic` and using the default trigger node which has `msg.topic` set to an empty string. Previously that was _sometimes_ recorded and sometimes not. Now it is never recorded.

### Fixed

* `uib-cache`: Custom variable name was being ignored - cache processing rewritten
* `uibuilder`: Library tab might occasionally list a package that wasn't a direct installed dependency. Now resolved. Only packages listed in `<uibRoot>/package.json` dependencies property will be listed.
* `nodes/libs/package-msg.js` `updateInstalledPackageDetails()`: Installations with a large number of installed libraries not correctly reporting their details. Resolved (hopefully) async issue. Was using `async` with `.forEach()` which doesn't work. Changed to use `Promise.all` with a map. Thanks to [dczysz](https://github.com/dczysz) for reporting. Issue [#186](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/186). Issue more complex than originally thought. Ended up doing a 2-stage update of the installed libraries data. First stage is quick and synchronous to allow the appropriate vendor folders to be added to the ExpressJS vendor routes. 2nd stage uses npm to get additional library information.
* Can now stop auto-loading of uibuilder default stylesheet using `uibuilder.start({loadStylesheet: false})`. Issue [#184](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/184).
* Fixed deepscan issues.
* Old client library was reporting mismatch client version unnecessarily
* Old client library was not reporting client `pageName` correctly


### New

* New example: Demonstrating logging methods of messages passed both into and from a uibulder node, to both the Node-RED debug panel and the Web Dev console. Many thanks to [Harold Peters Inskipp](https://github.com/HaroldPetersInskipp) for the contribution.
* New Template: Basic Vue v3 example with no build step required.
* New editor option: Add `msg._uib` to standard messages (off by default). Can be used to help with authentication/authorisation & session management within Node-RED flows. Contains `clientId` & `remoteAddress` and `pageName` properties.


### Changed

* New client (`uibuilder.iife.js` and `uibuilder.esm.js`) improvements
  
  Note that the new clients are now the preferred client libraries. It is best to use one of these rather than the older `uibuilderfe.js` client library. Please note that a couple of features were dropped, namely the VueJS versions of the Toast and alert functions. The same input msgs still work to allow for backward compatibility but they will not trigger bootstrap-vue even if that is installed. Use the [new Dynamic, data-driven content features](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/uibuilder.module?id=dynamic-data-driven-html-content-1) instead.

  * Client now knows whether the browser is online or offline. If offline, it no longer keeps outputing socket.io error messages or warnings. A console warn is given whenever the browser goes online or offline. Going online reconnects the socket.io connection to Node-RED.
  * Client now tracks what the last navigation type was (navigate, reload, back_forward, prerender). Enables the client to know whether the page was a new navigation or simply reloaded. Can be accessed in the client using `uibuilder.lastNavType`.


* `uibuilder` node
  
  * uibuilder can now select any existing folder to serve as the root of your web app. The selector on the advanced tab is now populated with all folders. The folder must, however, contain at least an `index.html` page otherwise an error is logged and no web page will be shown unless you manually include the page name in your browser address bar.
  * The uibuilder node will now create the required `<uibRoot>/package.json` file if it does not exist. Removes some unnecessary warning messages.
  * uibRoot added to settings passed to Editor so that the editor can display and link to server folders (links only work when server is local of course).
  * If running in debug mode, key settings dumped to Editor console.
  * Editor panel improvements:
  
    * The currently installed uibuilder version is now shown on the Advanced tab.
    * The server's `instanceRoot` filing system folder is shown on the Core tab. This is the configuration and front-end code for this instance of uibuilder.
    * The info showing the current web server is now a link to the instance page (same as the Open button above it).
    * The "Server folder" information now shows the currently used serve folder (e.g. src or dist).
    * The `Advanced > Serve` dropdown now shows ALL top-level folders. Note that you have to close and re-open the panel to pick up the new folder.
    * In the help panel: Added a link to the [Configuring uibuilder nodes](uib-node-configuration.md) page. Added link to the new client library page and a note about deprecation of the old client library.
    * Library tab  
      * Package outdated markers added to Editor Library tab. (_Currently only on Node-RED startup_. Will be improved later.)
      * Package outdated markers are buttons that will update the installation of the package.

* `uib-cache` node

  * More compact context variable settings in Editor panel.
  * Flow/global cache context has node id appended to variable name for safety, can be changed but obviously must be unique.


* `uib-list` node

  * Now uses same context variable settins as `uib-cache` for greater flexibility.
  * Flow/global cache context has node id appended to variable name for safety, can be changed but obviously much be unique.
  * Change drop-downs to typed input
  * In editor, disable cache settings if cache turned off
  * Add uib url to name display

* Various library improvements including some trace and info log msg improvements.
* Documentation - updated to indicate the the old client library is now functionally stabilised and will eventually be deprecated.
* uibindex page (adminapiv2.js) - Add folders to Vendor Routes table (from `packageMgt.uibPackageJson.uibuilder.packages`).
