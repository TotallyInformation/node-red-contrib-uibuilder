---
typora-root-url: docs/images
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version.

## To do/In-progress

Check the [roadmap](./docs/roadmap.md) for future developments.

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.2.0...main)

Nothing currently.

## [v6.3.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.3.0...v6.2.0)

### Client library changes

* `_ui` handling extended to support dynamic creation of SVG images.
* Changed `_uiUpdate()` to use `_uiComposeComponent()` for consistency & code reduction.

### `uib-brand.css`

* Adjusted img, picture, video, canvas, svg background colours to match the html background colour `--surface2`.

### Examples

* zero-code: Minor correction to form example (1st input had changed id)



## [v6.2.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.2.0...v6.1.1)

### General

* `locales` folder with `en-US` subfolder. Ready for l8n.

### Client library changes

* **Bug Fix**: [Issue #201](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/201) - Incorrect logic in stylesheet load causing an error. Fixed.

* New functions - can be run from Node-RED as well as front-end code:
  * `htmlSend()` - sends the current web page back to Node-RED.
  * `uiWatch(cssSelector, startStop=true/false/'toggle', send=true, showLog=true)` - watches for any changes to the selected page elements and uses `uiGet` to send useful data back to Node-RED automatically. It should also trigger a custom event to allow front-end processing too. If `startStop` is undefined, null or 'toggle', the watch will be toggled.
  * `include(url, uiOptions)` - include external files. Includes HTML, Images, Video, PDF's and more.

* New internal functions:
  * `nodeGet(domNode)` - gets standard data from a DOM node (used internally by uiGet and uiWatch for consistency).

* Updated functions:
  * `uiGet` - now uses `nodeGet` for consistency with `uiWatch`.
  * `$` - now returns first child if selector returns a `<template>` tag. Warn/Error logging added.

### `uib-element` node changes

* **Bug Fix**: Updating the page title (with no html id set) was setting the mode to "add" which upset chained outputs. Now corrected.
* "Form" type - improvements:
  * Where `required` property is true in the input, add `class="required"` to the div that wraps the label and input. Add `div.required label::after` styling to `uib-brand.css`. This will add an "*" after the label text for required inputs. See the `uib-brand.css` updates for more formatting improvements.
  * Allow `title` property to be set in input data. Also add "Required. " to start of title. If no title property specified, make it `Type: ${type}`.
  * If no button included in the input data, add default send and reset buttons with an id of `${elementId}-btn-send` & `${elementId}-btn-reset`. The Send button uses the standard `eventSend` function. The Reset button returns all form inputs back to their defaults.
  * Formatting improvements: Inputs are outlined with `--success` if they pass validation and with `--failure` if they do not. Any buttons on the form are given `--warning` colour if the form does not validate. The buttons still work however.
  * Form data improvements: Using the `eventSend` within a form element includes data saying whether the form validates. The details for each input also say whether they validate and if they don't, why.
  * The documentation for "Zero-code element types" > "Forms" completed.

### `uib-sender` node changes

* Add the uibuilder node link node id to config data & expand editor checks for url changes. Will mark the node instance as needing re-deployment if the linked uibuilder node changed its URL. This is done by also tracking and recording the node id of the linked uibuilder node.

### `uib-brand.css` updates

* Added intense (more saturated) versions of info, success, warning/warn, failure/error/danger.
* Added `center` as a synonym of `centre`.
* Added `surface5` which has higher lightness than 4.
* Forms formatting extended.
  * Form labels are shown in Title Text (first letter of each word capitalised). If attached to a required input, an "*" is shown after the label.
  * Input valid/invalid formatting added. Borders set to `--success`, `--failure` collours accordingly
  * Buttons on an invalid form set to `--warning` colour.

### Standard Templates

* **Bug Fix**: [Issue #204](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/204) - change to `rollup.config.js` caused issues with bundled css. Fixed.

### Examples

* **zero-code**: Improved Forms example shows off more options. Example for light/dark mode added. On-(re)load flow attached to the control output of the uibuilder node; automatically changes the page title (an alternative to using a cache node).
* **New Example**: _Remote-Commands_ - Demonstrates all of the uibuilder client library functions that can be called from Node-RED.

## [v6.1.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.1.1...v6.1.0)

Bug Fix: The zero-code example only had a single node in it. Now corrected to have the full example set demonstrating most aspects of the zero-code uib-sender node with some examples of the zero-code uib-update node.

## [v6.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v6.1.0...v6.0.0)

v6.1.0 makes the new client libraries (`uibuilder.esm.min.js` and `uibuilder.iife.min.js`) current and the old client library (`uibuilderfe.js`) is now no longer recommended and is not being updated, it is on the road to being deprecated (it will remain until at least v7, mahbe v8 but probably not longer unless someone calls for it). 

The experimental `uib-list` node is now deprecated, the features are moved to the new `uib-element` node. It will be removed certainly by v7.

The new `uib-brand.css` style library is not yet feature complete - if you find something missing or wrong, please raise an issue. It does, however, continue to develop.

Dynamic content does not currently work fully with VueJS (and probably not other frameworks that rely on pre-building components). It is possible though to combine the vanilla HTML from the low-/no-code features with front-end frameworks. Such frameworks _require_ both the components and the structure to be pre-defined _before_ the DOM is fully loaded. They have their own methods to provide dynamic includes, lazy loading, etc that are very different (and generally much more complex) than uibuilder's simple to use feature. **However**, dynamic content _DOES_ work with HTML components and any frameworks that are compatible with them such as _Svelte_. The component definitions have to be loaded before you use them (that can be dynamic too!) and you _must_ use the ESM build of the uibuilder client library since HTML Components are ES Module only. 

### Summary of notable changes

Just a quick summary here. See the main sections for more details.

> Please remember that no changes are being made to the old `uibuilderfe.js` client. Nothing listed here applies to that.

* New zero-code nodes `uib-element` and `uib-update` let you use simple data to create dynamic web UI's. Including in this release: tables, forms, lists, raw HTML and page title. More to come.

* The client library has a number of fixes and new features
  
  * Extensions to the `eventSend` function to include **form data** and **value changes**. Should greatly simplify creating and using FORMs and providing quick inputs for Node-RED flows. Used by `uib-element` to create zero-code input forms.

  * New function: `uibuilder.showMsg()` Displays/hides an on-screen card that automatically updates with the last msg received from Node-RED. 
  
  * New function: `uibuilder.showStatus()` Displays/hides an on-screen card that shows the current status of the uibuilder client. Use for debugging where console output is not available or not desirable (e.g. debugging pages on mobile devices).
  
  * Some client functions can now be controlled direct from Node-RED via simple messages. Changing log levels, show/hide message and status displays, getting uibuilder client variable values join the ability to reload the page. More to come in the next release.
  
  * New function: `uibuilder.uiGet(cssSelector)` Gets useful data about an HTML element direct from the DOM. Saves lots of faffing when digging through DOM details.

  * New function: `uibuilder.watchDom(true)` Starts watching the content of the page and saves it to browser localStorage so that it can be recovered at any time. Use `uibuilder.restoreHtmlFromCache()` to recover the stored HTML (e.g. on page load). Use `uibuilder.watchDom(false)` to turn off and `uibuilder.clearHtmlCache()` to remove the saved HTML. If desired, you can manually save the HTML at any point using `uibuilder.saveHtmlCache()`.
  
  * The uibuilder client now reports changes of **visibility** of pages back to node-red via a new control msg.
  
  * When using the `_ui` low-code features, you can now position a new element anywhere within its parent. Either first/last or a position number can be used.
  
  * There is a new mode for the `_ui` low-code features - "removeAll". This allows a selection of elements to be the target of a remove - for example, all list entries could be removed with a single command.
  
  * Creates a browser `tabId` which is reported back to node-red when messages are sent. Helps identify the origin. Future uibuilder versions will let you send messages to a specific tab id which does not change even if the page is reloaded (only if the tab is closed).
  
  * Messages sent from the client either inherit the topic from the last inbound msg or from a default set using `uibuilder.set('topic', 'my topic string')`. The default will take preference. Reset by setting to an empty string.

* If you turn on the advanced option "*Include msg._uib in standard msg output*", messages from the client now include client details for you to use in your own security processing or just to identify where things have come from (e.g. what page name as well as what client).

* uibuilder now makes a copy of its main `<uibRoot>/package.json` file to `package.json.bak` before it updates it. Trace and error messages have been added to the process.

* All of the templates and example flows have been refreshed with the latest standards.

* The default style-sheet `uib-brand.css` has various updates and improvements.

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
  * Icon changed.


* `socket.js`
  * When asked to add msg._uib to std output msgs, Standardised on the same client details as for control msgs to make downstream processing easier.
  * Added visibility-change control msg. Sent by FE client. Fires when the open page changes from hidden-to-visible or visa versa.
  * New functions: sendCtrlMsg, getClientDetails. Standardise/simplify client details shown on control msgs.

* `web.js`
  * Added new `addBeaconRoute` function that sets up the `./_clientLog` instance endpoint. Use the new client `uibuilder.beaconLog(txtToSend, logLevel)` function to send a simple text log back to Node-RED even if socket.io isn't working.

* `package-mgt.js`
  * A backup copy of `package.json` to `package.json.bak` is now made on each write.
  * Trace/Error log messages added to `writePackageJson`.

### IIFE/ESM/Module client library

* Bug fixes
  * Fixed issue where method:update for msg._ui handling would cause a loop and console error. An assign by reference error fixed by forcing a shallow copy at the start of `_uiUpdate`.
  * Fixed bug where the library was loading `uib-brand.css` even when it didn't need to. It now doesn't load automatically even if there is a single stylesheet loaded on startup.

* `uibuilder.eventSend(event)` function improved. 
  
  * Now prevents the default event action from happening.
  
  * If the element that triggers the event is part of an HTML **form**, the names and values for all input elements in the form at the time of sending will be attached as `msg.payload` properties. Extended data for all input elements inside the form are included in `msg._ui.form`.
  
  * If the event type is `change`(e.g. a user changed an input field and then moved to a new field), a `msg._ui.newValue` property is generated. 
  
    If you want to report the old value as well, you need to add something like `onfocus="this.setAttribute('data-oldvalue', this.value)"` to the element's attributes. This would be included both in `msg.payload.oldvalue` and in `msg._ui.attribs.data-oldvalue`.

    Alternatively, `onfocus="this.uib_oldvalue = this.value"` would cause the previous value to be included as `msg._ui.props.uib_oldvalue`.

* Added a default `msg.topic` option. `uibuilder.set('topic', '....')` Will be used in msgs sent back to node-red if no topic specified. Note that if the default topic is not set, messages will inherit the topic from the _previous inbound message_ if that had a topic. Reset by setting to an empty string.

* The following client functions can now be called direct from Node-RED via a msg like: `{_uib: {command:"showMsg", value:true}}`. get, set, showMsg, showStatus. More will follow in the next release.

* Added **new functions**

  * `uibuilder.showMsg(true, selector=body)` - Adds a visual display of incoming messages from Node-RED to the web page. Use `uibuilder.showMsg(false)` to remove it. `selector` is a CSS selector to use as the parent position. Will always show the last incoming standard msg from Node-RED.

  * `uibuilder.showStatus(true, selector=body)` - Adds a visual display of the current status of the client library. Use `uibuilder.showMsg(false)` to remove it.`selector` is a CSS selector to use as the parent position. May be helpful when trying to debug pages and connectivity, especially from mobile devices.

  * `uibuilder.syntaxHighlight(json)` - Converts JSON/JavaScript object into highlighted HTML. Useful for debugging messages sent from/to Node-RED. This used to be in each template so you don't need it there any more.

  * `uibuilder.uiGet(cssSelector, propName=null)` - Get data from the DOM. Returns selection of useful properties unless a specific property requested.

    Data can be sent straight back to Node-RED: `uibuilder.send( uibuilder.uiGet('input') )` (gets all useful properties from all `input` fields on the page).
  
  * `uibuilder.watchDom(true)` - Starts watching the content of the page and saves it to browser localStorage so that it can be recovered at any time. Use `uibuilder.restoreHtmlFromCache()` to recover the stored HTML (e.g. on page load). Use `uibuilder.watchDom(false)` to turn off and `uibuilder.clearHtmlCache()` to remove the saved HTML. If desired, you can also manually save the HTML at any point using `uibuilder.saveHtmlCache()`.

  * `uibuilder.beaconLog(txtToSend, logLevel)` which allows sending a simple, short log message back to Node-RED even if socket.io is not connected. In Node-RED, outputs to the Node-RED log and sends a uibuilder control message where `msg.uibuilderCtrl` = "client beacon log". _Still somewhat experimental and may not always work reliably_.

  * `uibuilder.logToServer()` which will take any number and type of arguments and send them all back to Node-RED in the msg.payload of a _control_ message (out of port #2) where `msg.uibuilderCtrl` = "client log message". Client details are added to the message. _Still somewhat experimental and may not always work reliably_.


* Added a unique tab identifier `uibuilder.tabId` that remains while the tab does. Is include in std outputs. Based on [this](https://stackoverflow.com/questions/11896160/any-way-to-identify-browser-tab-in-javascript). NOTE however, that duplicating the browser tab will result in a duplicate tab id.

* Added `uibuilder.isVisible` property. Is true when the browser tab containing the page is actually visible. On visibility change, sends a new control msg `msg.uibuilderCtrl` = "visibility" with the property `isVisible` true or false. Does not send this when the page loads but does set the property. Uses the document `visibilitychange` event.

* Added flag `uibuilder.isVue` if VueJS is loaded. To be used for dynamic UI processing. Also added `uibuilder.vueVersion` though this may not be always populated due to differences between VueJS versions.

* `_ui` handler updates

  * When triggering `showDialog()` either in the FE or by sending a toast notification from node-red, setting "variant" now allows any CSS class name to be used. Not just the previous list of names ('primary', 'secondary', 'success', 'info', 'warn', 'warning', 'failure', 'error', 'danger') though since they are all included as classes in uib-brand.css, they all still work.

  * Extended the standards for `msg._ui` with `mode=update` to include the properties `selector` or `select`. These take CSS selectors as their value (as does the `type` property) and take preference over a `name` or `type` property but not over an `id` property. Mostly for convenience and just easier to remember. Documentation also updated.

  * Added a `position` property to the `add` _ui mode. "first"/"last": Adds start/end of parent's children respectively. An integer will add the element after the nth child.

  * Added a **new ui handler** `removeAll` and updated the handler function with an optional 2nd parameter to remove all (rather than the 1st) matching elements.

* Added 2 new events: `uibuilder:constructorComplete` and `uibuilder:startComplete`. Mostly for potential internal use.



### `uib-cache` node

* Added filter to remove msg.res and msg.req which come from ExpressJS and cannot be serialised so create errors.

### **NEW** `uib-element` node

This node lets you easily create new front-end UI elements from within Node-RED. It has a selection of element types ranging from simple text structures, through different types of list and full tables. It is a much more comprehensive node than the previous, experimental, `uib-list` node. This node is classed as _zero-code_ since no coding is required in order to produce a web user interface.

**Note that this generates pure HTML - no frameworks are used**.

It creates configuration-driven dynamic additions to your front-end UI while letting you send fairly simple data to dynamically create the structure. For example, sending an array of objects with the `Table` type will create/replace a complete table in your front-end.

Has a single output. Outputs can be chained to more `uib-element` nodes. At the end of the chain, simply send to a uibuilder node input. Optionally, make sure each chain has a unique topic and send to a `uib-cache` node so that new and reloaded browser clients get the last output.

> **Note**: The range of options built into the node for each element type is deliberately fairly restricted. If you want more complex layouts, you should either craft the JSON yourself. This node can output the raw JSON if you want so that you can save it and enhance it yourself. Also, this initial release is mostly driven by the input data; in future releases some options will be capable of override using configuration inputs in the node.
> 
> This is NOT meant as a *Dashboard* replacement. It is mostly meant for people who need a quick and simple method of dynamically creating UI elements's within a pre-defined HTML design. The element content is rebuilt every time you send data so this is certainly not the most efficient method of working with data-driven UI's. However, it will often be good-enough for relatively simple requirements.

Element types included in this release:

* **Simple Table** - Generates a simple HTML table from an input array of objects where the first element of the data array will define the columns. Future enhancements will allow more control over the columns. Future types will be added to allow add/update/remove of individual rows and/or cells.
* **Simple Form** - Generate a simple but accessible input form from an array of objects where each object in the array defines the attributes and label.
* **Unordered List (ul)**/**Ordered List (ol)** - Generates a bullet or number list from a simple input array or object.
* **Description List (dl)** - Generates a description list from a simple input array of objects.
* **Text box** - A simple "card" like article element with a border.
* **HTML** - Pass-though HTML (e.g. from a Node-RED Template node) wrapped in a `div`.
* **Page Title** - Change the page HTML title, description and the first H1 tag on the page to all be the same input text. Also add sub-heading if input is an array.

Where an *ID* is specified in the config, each of the above will attempt to *replace* an existing instance when called again. If *no ID* is specified, they will *always add* a new element.

Each element except the page title is wrapped in a `<div>` tag which has the specified HTML ID applied to it. Where possible, rows and columns are given their own identifiers to make updates and styling easier. Attempts are made to ensure that the resulting HTML is accessible.

Each element can have an optional heading. If used, a aria-labelledby attribute is added to the `div` tag for accessibility.

The following element types are also available but behave slightly differently in that they will **always** add a new row regardless of the ID setting, they are not wrapped in a div and you cannot add a heading:

* **Add row to existing table** - Adds a single row, must provide the _Parent_ of the table to update, can insert the row anywhere via the _Position_ input.
* **Add row to existing unordered or ordered list** - Adds a single row, must provide the _Parent_ of the list to update, can insert the row anywhere via the _Position_ input.

In addition, a special msg may be sent to this node: `msg.mode` where `mode` = "remove". In this case, as long as an HTML ID has been provided, the element will be removed from the UI.

> Unfortunately, many front-end frameworks such as REACT and VueJS require the UI page structure to be pre-defined at load time. Because of this, many of the features in this node are of limited use when working with those frameworks.
>
> Oher frameworks though are better behaved (e.g. Svelte) and will work well with this node.

### **NEW** `uib-update` node

Zero-code UI updates from Node-RED flows. Outputs msg._ui low-code config data that the uibuilder client library can turn into full HTML. (Same format as the `uib-element` node)

Can also delete (remove) existing elements. Note that in delete mode, this node will remove **ALL** element specified by the CSS Selector. e.g. if you specify a selector of "li", every list entry from every list on the page will be deleted. Use with caution.

In update mode (the default), any combination of attributes (e.g. class, style, etc) and inner content (the so-called "slot" content) can be updated. Slot content can be text, HTML or (if the `markdown-it` library is loaded) Markdown.

### `uib-list` node - **NOW DEPRECATED**

Please switch to using the `uib-element` node. This node will be removed in the next major release of uibuilder (v7).

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
  * [x] blank - now truly blank, a clean canvas.
  * [x] blank-iife-client
  * [x] blank-esm-client
  * [ ] svelte-basic
  * [ ] iife-vue3-nobuild
  * [ ] vue v2 + bootstrap-vue
  * [ ] vue v2 + bootstrap-vue - simple
  * [ ] blank-old-client


### Examples

* Report Builder. Create HTML reports direct from Node-RED. See [Forum thread](https://discourse.nodered.org/t/creating-reports-using-node-red/73664), [Flow site](https://flows.nodered.org/flow/99e1e6169b5e93b460bcbcc8f493d011#).
* Updated/New - all should have descriptive comments throughout
  * [x] ~~jQuery~~ - removed. No longer needed.
  * [x] ~~logging~~ - removed. Old code, superceded by newer features.
  * [x] low-code-report-builder - **NEW** Replicates pdfmaker's tables example using uibuilder to demonstrate how easy it is to build complex documents using uibuilder.
  * [x] simple - Implements a very simple Quote of the Day display using vanilla HTML.
  * [x] ~~svelte-basic~~ - removed. See "templates" example instead.
  * [x] templates - **NEW** "Template Tests" tab
  * [x] ~~toast-notifications~~ - removed. Needs rework in next release to use `_ui`.
  * [x] uib-cache - "uib-cache" tab. Examples of using `uib-cache` with and without uibuilder.
  * [x] ~~uib-list~~ - removed. Node is deprecated, See the "zero-code" examples instead.
  * [x] uib-sender - "uib-sender" tab.
  * [x] ~~vue~~ - removed. See the "templates" examples instead.
  * [x] zero-code - **NEW** "uib-element tests" tab

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
