---
title: Functions available in the modern client
description: >
   Details about the functions/methods used in the uibuilder front-end client library.
   Some functions are available to your own custom code and some are hidden inside the `uibuilder` client object.
created: 2023-01-28 15:56:57
lastUpdated: 2023-03-04 18:08:18
---

Functions accessible in client-side user code.

- [`start(options)` - (Mostly no longer needed) Starts Socket.IO communications with Node-RED](#startoptions---mostly-no-longer-needed-starts-socketio-communications-with-node-red)
- [Message Handling](#message-handling)
  - [`send(msg, originator = '')` - Send a custom message back to Node-RED](#sendmsg-originator-----send-a-custom-message-back-to-node-red)
  - [`eventSend(domevent, originator = '')` - Send a standard message back to Node-RED in response to a DOM event](#eventsenddomevent-originator-----send-a-standard-message-back-to-node-red-in-response-to-a-dom-event)
  - [`setOriginator(originator = '')` - Set/clear the default originator](#setoriginatororiginator-----setclear-the-default-originator)
  - [`sendCtrl(msg)` - Send a custom control message back to Node-RED](#sendctrlmsg---send-a-custom-control-message-back-to-node-red)
  - [`beaconLog(txtToSend, logLevel)` - Send a short log message to Node-RED](#beaconlogtxttosend-loglevel---send-a-short-log-message-to-node-red)
  - [~~logToServer()~~ - Not yet available. Will cause the input to appear in Node-RED logs](#logtoserver---not-yet-available-will-cause-the-input-to-appear-in-node-red-logs)
- [Variable Handling](#variable-handling)
  - [`get(prop)` - Get a uibuilder property](#getprop---get-a-uibuilder-property)
      - [Example](#example)
  - [`set(prop, val)` - Set a uibuilder property and dispatch a change event](#setprop-val---set-a-uibuilder-property-and-dispatch-a-change-event)
      - [Example](#example-1)
  - [`getStore(id)` - Attempt to get and re-hydrate a key value from browser localStorage](#getstoreid---attempt-to-get-and-re-hydrate-a-key-value-from-browser-localstorage)
  - [`setStore(id, val)` - Attempt to save to the browsers localStorage](#setstoreid-val---attempt-to-save-to-the-browsers-localstorage)
  - [`removeStore(id)` - Attempt to remove a uibuilder key from browser localStorage](#removestoreid---attempt-to-remove-a-uibuilder-key-from-browser-localstorage)
  - [`setPing(ms)` - Set a repeating ping/keep-alive HTTP call to Node-RED](#setpingms---set-a-repeating-pingkeep-alive-http-call-to-node-red)
      - [Example](#example-2)
- [UI Handling](#ui-handling)
  - [`ui(json)` - Directly manage UI via JSON](#uijson---directly-manage-ui-via-json)
  - [`loadui(url)` - Load a dynamic UI from a JSON web reponse](#loaduiurl---load-a-dynamic-ui-from-a-json-web-reponse)
  - [`loadScriptSrc(url)` - Attach a new remote script to the end of HEAD synchronously](#loadscriptsrcurl---attach-a-new-remote-script-to-the-end-of-head-synchronously)
  - [`loadStyleSrc(url)` - Attach a new remote style to the end of HEAD synchronously](#loadstylesrcurl---attach-a-new-remote-style-to-the-end-of-head-synchronously)
  - [`loadScriptTxt(string)` - Attach a new text script to the end of HEAD synchronously](#loadscripttxtstring---attach-a-new-text-script-to-the-end-of-head-synchronously)
  - [`loadStyleTxt(string)` - Attach a new text style to the end of HEAD synchronously](#loadstyletxtstring---attach-a-new-text-style-to-the-end-of-head-synchronously)
  - [`replaceSlot(el, component)` - Attach a new text script to the end of HEAD synchronously](#replaceslotel-component---attach-a-new-text-script-to-the-end-of-head-synchronously)
  - [`replaceSlotMarkdown(el, component)` - Attach a new text script to the end of HEAD synchronously](#replaceslotmarkdownel-component---attach-a-new-text-script-to-the-end-of-head-synchronously)
  - [`showDialog(type, ui, msg)` - Attach a new text script to the end of HEAD synchronously](#showdialogtype-ui-msg---attach-a-new-text-script-to-the-end-of-head-synchronously)
  - [`showMsg(boolean, parent=body)` - Show/hide a card that automatically updates and shows the last incoming msg from Node-RED](#showmsgboolean-parentbody---showhide-a-card-that-automatically-updates-and-shows-the-last-incoming-msg-from-node-red)
  - [`showStatus(boolean, parent=body)` - Show/hide a card shows the current status of the uibuilder client library](#showstatusboolean-parentbody---showhide-a-card-shows-the-current-status-of-the-uibuilder-client-library)
  - [`syntaxHighlight(json)` - Takes a JavaScript object (or JSON) and outputs as HTML formatted](#syntaxhighlightjson---takes-a-javascript-object-or-json-and-outputs-as-html-formatted)
  - [`uiGet(cssSelector, propName=null)` - Get most useful information, or specific property from a DOM element](#uigetcssselector-propnamenull---get-most-useful-information-or-specific-property-from-a-dom-element)
- [HTML/DOM Cacheing](#htmldom-cacheing)
  - [`watchDom(startStop)` - Start/stop watching for DOM changes. Changes automatically saved to browser localStorage](#watchdomstartstop---startstop-watching-for-dom-changes-changes-automatically-saved-to-browser-localstorage)
  - [`clearHtmlCache()` - Clears the HTML previously saved to the browser localStorage](#clearhtmlcache---clears-the-html-previously-saved-to-the-browser-localstorage)
  - [`restoreHtmlFromCache()` - Swaps the currently displayed HTML to the version last saved in the browser localStorage](#restorehtmlfromcache---swaps-the-currently-displayed-html-to-the-version-last-saved-in-the-browser-localstorage)
  - [`saveHtmlCache()` - Manually saves the currently displayed HTML to the browser localStorage](#savehtmlcache---manually-saves-the-currently-displayed-html-to-the-browser-localstorage)
- [Event Handling](#event-handling)
  - [`onChange(prop, callbackFn)` - Register on-change event listeners for uibuilder tracked properties](#onchangeprop-callbackfn---register-on-change-event-listeners-for-uibuilder-tracked-properties)
      - [Example](#example-3)
  - [`cancelChange(prop, cbRef)` - remove all the onchange listeners for a given property](#cancelchangeprop-cbref---remove-all-the-onchange-listeners-for-a-given-property)
  - [`onTopic(topic, callbackFn)` - like onChange but directly listens for a specific topic](#ontopictopic-callbackfn---like-onchange-but-directly-listens-for-a-specific-topic)
  - [`cancelTopic(topic, cbRef)` - like cancelChange for for onTopic](#canceltopictopic-cbref---like-cancelchange-for-for-ontopic)
- [Other](#other)
  - [`$(css-selector)` - Simplistic jQuery-like document CSS query selector, returns an HTML Element](#css-selector---simplistic-jquery-like-document-css-query-selector-returns-an-html-element)
    - [Example](#example-4)
  - [`log` - output log messages like the library does](#log---output-log-messages-like-the-library-does)


## `start(options)` - (Mostly no longer needed) Starts Socket.IO communications with Node-RED

!> In most cases, you no longer need to call this yourself. The client startup is now more robust and should rarely need any help. The exception will be if you are loading a page from an external server instead of from Node-RED.

Unlike the original uibuilder client, this version:

* Rarely needs to be manually called. It should work for all page locations including in sub-folders as long as the client allows cookies.
* Only allows passing of a single options object.
* Allows being called again which will reset the Socket.IO connection and internal msg event handlers.

While multiple properties can be given in the options object, only the following are currently used:

* `ioNamespace` - This is normally calculated for you. However, if using an external server to serve the page, you may need to manually set this. Check the uibuilder node details page in the Node-RED Editor for what this should be set to.
* `ioPath` - As above.
* `loadStylesheet` - (default=true). Set to false if you don't want the uibuilder default stylesheet (`uib-brand.css`) to be loaded if you haven't loaded your own. Checks to see if any stylesheet has already been loaded and if it has, does not load.

## Message Handling

### `send(msg, originator = '')` - Send a custom message back to Node-RED

The `msg` format is the same as used in Node-RED. 

The `originator` is optional and if used, should match the id from a `uib-sender` node. That allows you to specifically return a message into a flow that uses one of those nodes. However, ensure that the `uib-sender` node has turned on the flag to allow returned messages.

### `eventSend(domevent, originator = '')` - Send a standard message back to Node-RED in response to a DOM event

This is a convenience function that is useful to attach as an event handler on an HTML DOM event (e.g. the click event of a button). Since it only requires the DOM event object that the DOM provides automatically.

In HTML code, use as `<button onclick="uibuilder.eventSend(event)">`. `onchange` and other event types will work as well.

The response includes some additional useful event data such as what modifier keys were active (e.g. shift, ctrl, etc) when the event happened.

If you want to add custom data to the response, you can add `data-xxxx` attributes to the originating HTML tag. These appear as named `msg.payload` properties.

If the source event is generated by a tag inside an HTML `<form>`, the values for all input elements inside the form are included in `msg._ui.form`.

If the source event type is `change` (e.g. a user changed an input field and then moved to a new field), a `msg._ui.newValue` property is added. If you want to report the old value as well, you need to add something like `onfocus="this.setAttribute('data-oldvalue', this.value)"` to the element's attributes. This would be included both in `msg.payload.oldvalue` and in `msg._ui.attribs.data-oldvalue`. Alternatively, `onfocus="this.uib_oldvalue = this.value"` would cause the previous value to be included as `msg._ui.props.uib_oldvalue`.

### `setOriginator(originator = '')` - Set/clear the default originator

Will automatically be used by `send` and `eventSend`.

Set to an empty string to remove.

### `sendCtrl(msg)` - Send a custom control message back to Node-RED

The message will be assessed by uibuilder and passed to its #2 (bottom) output port if considered acceptible.

This lets you create your own control custom messages should you wish to. Use with caution.

### `beaconLog(txtToSend, logLevel)` - Send a short log message to Node-RED

This has the advantage of working even if Socket.IO is not connected. It uses a logging API provided by uibuilder.

However, only text strings can be sent and messages need to be kept short. It only works with modern browsers that support the web beacon API.

The `logLevel` matches both Node-RED and uibuilder defined log levels (e.g. error, warn, info, debug, trace ).

### ~~logToServer()~~ - Not yet available. Will cause the input to appear in Node-RED logs

## Variable Handling

### `get(prop)` - Get a uibuilder property

This is the preferred method to get an exposed uibuilder variable or property. Do not try to access variables and properties directly unless explicitly shared in this documentation. This function can also be called from Node-RED via `msg._uib.command` - `get` with `msg._uib.prop` set to the variable name to get.

##### Example

```javascript
console.log( uibuilder.get('version') )
```

### `set(prop, val)` - Set a uibuilder property and dispatch a change event

This is the preferred method to set an exposed uibuilder variable or property. Do not try to set variables and properties directly.

When using set, the variable that is set becomes responsive. That is to say, that issuing a set triggers both the internal event handler (as used in `uibuilder.onChange('prop', ...)`) but also the DOM custom event `uibuilder:propertyChanged`. Normally, you will want to use the `onChange` handler.

Note that you can add additional custom data to the uibuilder object but care must be taken not to overwrite existing internal variables. This is useful if you want to be able to automatically process changes to your own variables using the `onChange` handler.

This function can also be called from Node-RED via `msg._uib.command` - `set` with `msg._uib.prop` set to the variable name to set. and `msg._uib.value` set to the new value.

##### Example

```javascript
uibuilder.set('logLevel', 3)
```

### `getStore(id)` - Attempt to get and re-hydrate a key value from browser localStorage

Note that browser localStorage is persisted even after a browser closes. It can be manually cleared from the browser's settings. You can also remove an item using the `removeStore` function.

If the `id` is not found in the store, `null` is returned. If the store is not available or some other error occurs, `undefined` is returned.

All `id`s have a pre-defined uibuilder prefix added to the key name to help ensure that the key being saved will be unique. This prefix is defined in the library and cannot be changed, it is set to `uib_`.

Because the browser storage API only allows strings as values, the data has to be serialised. This function attempts to unserialise (re-hydrate). It should be noted that sometimes, this process results in values that may differ from the original. For example, `uibuilder.setStore('mydate',new Date()); console.log( uibuilder.getStore('mydate') )` will return the saved date as an ISO8602 date string, not a JavaScript Date object.

### `setStore(id, val)` - Attempt to save to the browsers localStorage

Write a value to the given id to localStorage. Will fail if localStorage has been turned off or is full.

The value to save has to be serialisable. Some JavaScript objects cannot be serialised (using `JSON.stringify`). If this happens `false` is returned and an error output to the browser console. However, you can store any basic value (number, string, boolean) as well as array's and objects.

Browsers set a limit on the size of the store for a particular source. Typically this is 10MB but may be altered by the user. The user can turn off localStorage as well.

Returns `true` if the save was successful, otherwise returns false.

Errors are output to the browser console if saving fails but processing will continue.

### `removeStore(id)` - Attempt to remove a uibuilder key from browser localStorage

Does not return anything. Does not generate an error if the key does not exist.

### `setPing(ms)` - Set a repeating ping/keep-alive HTTP call to Node-RED

This uses an HTTP API call to a custom uibuilder API endpoint in Node-RED. So it works even if the Socket.IO connection is not working. It is used to check that the Node-RED server and the uibuilder instance are both still working.

##### Example

```javascript
uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.

// Optionally monitor responses
uibuilder.onChange('ping', function(data) {
   console.log('pinger', data)
})
```

## UI Handling

These are the new dynamic, configuration-driven UI features. They let you create your UI dynamically from simple data sent to the client.

In addition, internal message handling will recognise standard messages from node-red and process them. So these functions won't always be needed. You can also do `uibuilder.set('msg', {/*your object details*/})` which instructs the client to treat the object as though it had come from Node-RED.

For functions with no descriptions, please refer to the code. In general, these will not need to be used in your own code.

### `ui(json)` - Directly manage UI via JSON

Takes either an object containing `{_ui: {}}` or simply simple `{}` containing ui instructions. See [Config Driven UI](client-docs/config-driven-ui.md) for details of the required data.

### `loadui(url)` - Load a dynamic UI from a JSON web reponse

Requires a valid URL that returns correct _ui data. For example, a JSON file delivered via static web server or a dynamic API that returns JSON as the body response.

### `loadScriptSrc(url)` - Attach a new remote script to the end of HEAD synchronously
### `loadStyleSrc(url)` - Attach a new remote style to the end of HEAD synchronously
### `loadScriptTxt(string)` - Attach a new text script to the end of HEAD synchronously
### `loadStyleTxt(string)` - Attach a new text style to the end of HEAD synchronously
### `replaceSlot(el, component)` - Attach a new text script to the end of HEAD synchronously
### `replaceSlotMarkdown(el, component)` - Attach a new text script to the end of HEAD synchronously
### `showDialog(type, ui, msg)` - Attach a new text script to the end of HEAD synchronously

### `showMsg(boolean, parent=body)` - Show/hide a card that automatically updates and shows the last incoming msg from Node-RED

Simply add `uibuilder.showMsg(true)` early in your index.js custom code and a box will be added to the end of your page that will automatically show the last message sent from Node-RED. Use `uibuilder.showMsg()` to toggle the display.

`uibuilder.showMsg(false)` or `uibuilder.showMsg()` will remove the box and stop the updates.

You can also position the box in a different location by specifying a "parent". This is a CSS selector that, if found on the page, uibuilder will add the box to the end of. For example, `uibuilder.showMsg(true, 'h1')` would attach the box to the end of a heading level 1 element on the page. Don't forget that the box will inherit at least some of the CSS style from the parent, so attaching to an H1 element will make the text much bigger.

This function can also be called from Node-RED via `msg._uib.command` - `showMsg` with `msg._uib.value` set to `true`. Leave the value property off to toggle the display.

Adds/removes `<div id="uib_last_msg">` to/from the page.

### `showStatus(boolean, parent=body)` - Show/hide a card shows the current status of the uibuilder client library

Simply add `uibuilder.showStatus(true)` early in your index.js custom code and a box will be added to the end of your page that will show all of the important settings in the uibuilder client. Use `uibuilder.showStatus()` to toggle the display.

`uibuilder.showStatus(false)` or `uibuilder.showStatus()` will remove the box and stop the updates.

You can also position the box in a different location by specifying a "parent". This is a CSS selector that, if found on the page, uibuilder will add the box to the end of. For example, `uibuilder.showStatus(true, 'h1')` would attach the box to the end of a heading level 1 element on the page. Don't forget that the box will inherit at least some of the CSS style from the parent, so attaching to an H1 element will make the text much bigger.

This function can also be called from Node-RED via `msg._uib.command` - `showStatus` optionally with `msg._uib.value` set to `true`. Leave the value property off to toggle the display.

Adds/removes `<div id="uib_status">` to/from the page.

### `syntaxHighlight(json)` - Takes a JavaScript object (or JSON) and outputs as HTML formatted

Requires some CSS that is contained in both the `uib-brand.css` and older `uib-styles.css`. Feel free to copy to your own CSS if you don't want to reference those files.

Use as:

```javascript
const eMsg = $('#msg')    // or  document.getElementById('msg') if you prefer
if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
```

### `uiGet(cssSelector, propName=null)` - Get most useful information, or specific property from a DOM element

Will return an array of found elements with properties.

If no `propName` supplied, will return a selection of the most useful information about the selected element(s).

## HTML/DOM Cacheing

### `watchDom(startStop)` - Start/stop watching for DOM changes. Changes automatically saved to browser localStorage

`uibuilder.watchDom(true)` will start the browser watching for any changes to the displayed HTML. When it detects a change, it automatically saves the new HTML (the whole page) to the browser's `localStorage`. This persists across browser and device restarts.

You can ensure that the page display looks exactly like the last update upon page load simply by adding `uibuilder.restoreHtmlFromCache()` at the start of your index.js custom code.

> [!note]
> Browser `localStorage` capacity is set by the browser, not uibuilder. Very large pages might concevably fill the storage as might other things saved to it.
>
> You should be able to change the capacity in the browser settings but of course, this would have to be done on every client device.

### `clearHtmlCache()` - Clears the HTML previously saved to the browser localStorage
### `restoreHtmlFromCache()` - Swaps the currently displayed HTML to the version last saved in the browser localStorage
### `saveHtmlCache()` - Manually saves the currently displayed HTML to the browser localStorage

## Event Handling

### `onChange(prop, callbackFn)` - Register on-change event listeners for uibuilder tracked properties

Returns a reference to the callback so that it can be cancelled if needed.

Uses the `uibuilder:propertyChanged` event internally.

##### Example

```javascript
const msgChgEvt = uibuilder.onChange('msg', (msg) => {
    // Dump the msg as text to the html element with an id of "msg"
    const eMsg = $('#msg')
    if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
})
```

### `cancelChange(prop, cbRef)` - remove all the onchange listeners for a given property

Both arguments must be provided. With `cbRef` having been saved when the listener was set up.

```javascript
uibuilder.cancelChange('msg', msgChgEvt)
```

### `onTopic(topic, callbackFn)` - like onChange but directly listens for a specific topic

```javascript
const topicChgEvt = uibuilder.onTopic('my topic', (msg) => {
    // Do something when we get a message from Node-RED
    // with this specific msg.topic
})
```

### `cancelTopic(topic, cbRef)` - like cancelChange for for onTopic

Both arguments must be provided. With `cbRef` having been saved when the listener was set up.

```javascript
uibuilder.cancelTopic('my topic', topicChgEvt)
```

## Other

### `$(css-selector)` - Simplistic jQuery-like document CSS query selector, returns an HTML Element

This is a convenience method to help you select HTML DOM elements in your own custom code. All it does is use ` document.querySelector(css-selector)`. So any errors are the same as the native function.

As per the native function, it returns a single [HTML element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). If the CSS Selector provided is not unique (e.g. >1 element would be returned), only the first element found in the DOM is returned. Use `document.querySelectorAll(css-selector)` if you want to get back an array of selected elements.

If the uibuilder client finds an existing definition of `$` on startup, it will not make this global. However, it would still be usable as `uibuilder.$(...)`. This avoids clashes with libraries such as jQuery.

#### Example

```javascript
const eMsg = $('#msg')
if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
```

### `log` - output log messages like the library does

Use as `uibuilder.log(1, 'my:prefix', 'Some text', {some:'optional data'})` which produces:
![Example log output](../images/example-log-output.png)

First argument is the log level (0=Error, 1=Warn, 2=Info, 3=log, 4=debug, 5=trace). If the uibuilder logLevel variable is set to less than the requested level, the output will not be shown. The names can be used instead of the numbers.

The first 2 arguments are required. All remaining arguments are included in the output and may include array, objects, etc.

To set the log level to display in your code, use `uibuilder.logLevel = 5` or `uibuilder.logLevel = 'trace`. Set to your desired level.
