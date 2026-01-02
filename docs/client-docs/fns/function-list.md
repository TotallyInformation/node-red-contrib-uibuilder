---
created: 2026-01-02 13:03:58
updated: 2026-01-02 13:07:11
---
Those marked with `*` can be triggered with a command message from Node-RED flows. Those marked with `§` are low-code _ui functions and so can be triggered from Node-RED using messages containing [suitable `_ui` properties](client-docs/config-driven-ui).

If examining the library code, please remember that functions starting with `_` are for *internal* use.

### `uibuilder` functions :id=uibuilder-fns

Available in front-end JavaScript as `uibuilder.xxxxx` or `uib.xxxxx`.

* [`$`](#dollar) - Alias of `document.querySelect`.
* [`$$`](#dollar2) - Alias of `document.querySelectAll`.
* `$ui`§ - Reference to the ui.js library, not a function.
* [`addClass`](#addClass)§ - Adds a class name to an HTML element.
* [`applyTemplate`](#applyTemplate)§ - Applies `<template>` tag contents as appended children of the target.
* [`arrayIntersect`](#arrayIntersect) - Return new array of the intersection of the 2 input arrays.
* [`beaconLog`](#beaconLog)
* [`buildHtmlTable`](#buildHtmlTable) - Create an HTML table from an array/object input.
* [`cancelChange`](#cancelChange) - Cancel a managed variable event watcher.
* [`cancelTopic`](#cancelTopic) - Cancel a topic event watcher.
* [`clearHtmlCache`](#clearHtmlCache)
* [`connect()`]() - Manually (re)connect Socket.IO communications between the browser and Node-RED.
* [`convertMarkdown`](#convertMarkdown) - Convert a Markdown string to HTML.
* [`copyToClipboard`](#copyToClipboard)
* [`createHtmlTable`](#createHtmlTable) - Create an HTML table from an array/object input & insert to the page.
* [`elementExists`](#elementExists)*
* ~~[`elementIsVisible`](#elementIsVisible)~~ - Temporarily deprecated.
* [`eventSend`](#eventSend) - Returns standardised data to Node-RED. For form inputs or other events.
* [`formatDate`](#formatDate) - Outputs a date/time as a formatted string.
* [`formatNumber`](#formatNumber) - Outputs a number as a formatted string.
* [`get`](#get)* - Return the value of a managed variable.
* [`getElementAttributes`](#getElementAttributes) - Return object containing attribute-name/value keypairs (or an empty object).
* [`getElementClasses`](#getElementClasses) - Checks for CSS Classes and return as array if found or undefined if not.
* [`getElementCustomProps`](#getElementCustomProps) - Return object containing an elements custom property/value pairs.
* [`getFormElementDetails`](#getFormElementDetails) - Return object containing the key properties of a form element.
* [`getFormElementValue`](#getFormElementValue) - Check for el.value and el.checked, return as an object.
* [`getManagedVarList`](#getManagedVarList)* - Returns list of all managed variables.
* [`getPageMeta`](#getPageMeta) - Asks the server for the created/update timestamps and size (in bytes) of the current page.
* [`getStore`](#getStore)
* [`getWatchedVars`](#getWatchedVars)* - Returns list of all managed variables.
* [`hasUibRouter`](#hasUibRouter)
* [`htmlSend`](#htmlSend)* - Sends the current page's full HTML back to Node-RED.
* [`include`](#include)*
* [`joinRoom(room)`](#joinRoom) - join an arbitrary socket.io room to receive messages from it.
* [`keepHashFromUrl`](#keepHashFromUrl)
* [`leaveRoom(room)`](#leaveRoom) - leave an arbitrary socket.io room to stop receiving messages from it.
* [`loadScriptSrc`](#load)§
* [`loadScriptTxt`](#load)§
* [`loadStyleSrc`](#load)§
* [`loadStyleTxt`](#load)§
* [`loadui`](#loadui)§
* [`log`](#log)
* [`logToServer`](#logToServer)
* [`makeMeAnObject`](#makeMeAnObject) - Returns the input as an object.
* [`navigate`](#navigate)* - Forces the browser to change URL.
* [`notify`](#notify)
* [`onChange`](#onChange)
* [`onTopic`](#onTopic)
* [`removeClass`](#removeClass)§
* [`removeStore`](#removeStore)
* [`replaceSlot`](#replaceSlot)§
* [`replaceSlotMarkdown`](#replaceSlotMarkdown)§
* [`restoreHtmlFromCache`](#restoreHtmlFromCache)
* [`returnElementId`](#returnElementId) - Return elements existing ID or, add a new unique id to the element and return it.
* [`round`](#round) - Rounds the input number to a given set of decimal places.
* [`sanitiseHTML`](#sanitiseHTML) - Ensures that the input HTML is safe.
* [`saveHtmlCache`](#savehtmlcache)
* [`scrollTo`](#scrollTo)*
* [`send`](#send) - Sends a custom message back to Node-RED.
* [`sendCtrl`](#sendCtrl) - Sends a control message back to Node-RED.
* [`sendCustom`](#sendcustom) - Sends a message to a specified Socket.IO channel.
* [`sendRoom(room, msg)`](#sendRoom) - Send a message to an arbitrary socket.io room.
* [`set`](#set)* - Create/update a uibuilder managed variable.
* [`setOriginator`](#setOriginator)
* [`setPing`](#setPing)
* [`setStore`](#setStore)
* [`showDialog`](#showDialog)
* [`showMsg`](#showMsg)*
* [`showOverlay`](#showOverlay)* - Displays an overlay window with customizable content and behavior.
* [`showStatus`](#showStatus)*
* [`start`](#start)
* [`syntaxHighlight`](#syntaxHighlight)
* [`tblAddRow`](#tblAddRow)§ - Add a new row to a table.
* [`tblAddListener`](#tblAddListener)§ - Add an event listener to a table row or cell.
* [`tblRemoveRow`](#tblRemoveRow)§ - Remove a row from a table.
* [`truthy`](#truthy)
* [`ui`](#ui)
* [`uiEnhanceElement`](#uiEnhanceElement)
* [`uiGet`](#uiGet)*
* [`uiWatch`](#uiWatch)*
* ['uploadFile'](#uploadFile)
* [`urlJoin`](#urlJoin) - Join arguments as a valid URL path string.
* [`watchDom`](#watchDom)
* [`watchUrlHash`](#watchUrlHash)*

### Global (`window`) functions :id=global-fns

These are attached to the `window` (AKA `globalThis`) object if they can be.

They will not be attached if there is a name clash to avoid issues with other libraries. The `$` and `$$` definitions in particular are widely used by other libraries and frameworks, this will generally not cause any issues since their use should be the same (jQuery use is slightly different but should generally still work). `$ui` is not likely to be used by another library but if it is, this may be slightly more problematic - however, it is rare that you will use this directly anyway.

* [`$`](#dollar) - Alias of `document.querySelect`
* [`$$`](#dollar2) - Alias of `document.querySelectAll`
* `$ui`§ - Reference to the ui.js library, not a function.
* `on` - Alias of `window.addEventListener`
* `uib` - Alias of `uibuilder`.
* `uibuilder` - the loaded instance of the client library.

### Extended HTML `Element` class methods :id=element-class-methods

These are added to the prototype of the [`Element` built-in HTML class](https://developer.mozilla.org/en-US/docs/Web/API/Element). This enables them to be used in any case that returns an HTML object based on the `Element` class. For example, the `$(cssSelector)` function will return something useful such that `$('#custom-drag').on('wheel', (e) => console.log('wheel', e))` will add an event listener to the HTML element with an id of `custom-drag`. `$$(cssSelector)` will return an array of elements.

> [!TIP]
> SVG's and MathML elements also inherit from this class and so these utility functions will work on them as well.

As with the global functions, these are only attached if they don't already exist. Some other libraries or frameworks might also define them which should not be an issue as it is anticipated they will behave in the same way.

* `on` - Alias of `<element>.addEventListener`. [[Reference](https://developer.mozilla.org/en-US/docs/Web/API/element#events)]
* `query` - Alias of `<element>.querySelect`
* `queryAll` - Alias of `<element>.querySelectAll`

### Extended HTML `document` object methods :id=html-document-methods

* `on` - Alias of `document.addEventListener`
