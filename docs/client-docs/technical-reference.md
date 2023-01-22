---
title: Technical details for the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: >
   More details on the technical aspects including available variables, functions, etc.
created: 2022-06-11 14:15:26
lastUpdated: 2023-01-15 17:21:47
---

- [Variables](#variables)
  - [Read/write](#readwrite)
  - [Read only](#read-only)
- [Read only - unlikely to be required](#read-only---unlikely-to-be-required)
- [Functions](#functions)
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
    - [`syntaxHighlight(json)` - Takes a JavaScript object (or JSON) and outputs as HTML formatted](#syntaxhighlightjson---takes-a-javascript-object-or-json-and-outputs-as-html-formatted)
- [Custom Events](#custom-events)
  - [`uibuilder:constructorComplete` - when the uibuilder class constructor has completed](#uibuilderconstructorcomplete---when-the-uibuilder-class-constructor-has-completed)
  - [`uibuilder:startComplete` - when uibuilder initial start function has completed](#uibuilderstartcomplete---when-uibuilder-initial-start-function-has-completed)
  - [`uibuilder:socket:connected` - when Socket.IO successfully connects to the matching uibuilder node in Node-RED](#uibuildersocketconnected---when-socketio-successfully-connects-to-the-matching-uibuilder-node-in-node-red)
  - [`uibuilder:socket:disconnected` - when Socket.IO disconnects from the matching uibuilder node in Node-RED](#uibuildersocketdisconnected---when-socketio-disconnects-from-the-matching-uibuilder-node-in-node-red)
  - [`uibuilder:propertyChanged` - when uibuilder.set is called (externally or internally)](#uibuilderpropertychanged---when-uibuilderset-is-called-externally-or-internally)
  - [`uibuilder:stdMsgReceived` - when a non-control msg is received from Node-RED](#uibuilderstdmsgreceived---when-a-non-control-msg-is-received-from-node-red)
  - [`uibuilder:msg:topic:${msg.topic}` - when a std msg with a msg.topic prop is received](#uibuildermsgtopicmsgtopic---when-a-std-msg-with-a-msgtopic-prop-is-received)
  - [`uibuilder:msg:_ui` - when a std msg with a msg.\_ui property is received](#uibuildermsg_ui---when-a-std-msg-with-a-msg_ui-property-is-received)
  - [`uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}` - output for each action on receipt of a std msg with a msg.\_ui property](#uibuildermsg_uiactionmethodactionid--actionid-----output-for-each-action-on-receipt-of-a-std-msg-with-a-msg_ui-property)


## Variables

### Read/write

Always use `uibuilder.set('varname', value)` to change these.

* `topic` - Sets a default `msg.topic` that will be added to all outbound messages if nothing takes preference.

* `logLevel` - Sets the current logging level. The default is `2` ('error' and 'warn'). Increase to see more detailed logging.
  
  NOTE: This is one of the few properties it is safe to change directly `uibuilder.logLevel = 5`. That is because it has a dedicated getter and setter in the Class.

* `originator` - Set to the node ID of a `uib-sender` node if you want any sent messages (back to Node-RED) to only go to that node. Normally, you would not set this manually but rather rely on the library to set it for you when it recieves a msg from a sender node. However, you might want to save and reconstitue it if you need to send general messages before returning a message to the sender node.
  
  NOTE: It is preferable to set this via the specific function `uibuilder.setOriginator(...)`.

### Read only

Always use `uibuilder.get('varname', value)` to obtain the value of these. You can also use `uibuilder.onChange('varname', (val)=>{})` to watch for changes to them. Or you can also use the custom event `uibuilder:propertyChanged` if you really want to.

* `clientId` - Client ID set by uibuilder on connect
* `cookies` - The collection of cookies provided by uibuilder
* `ctrlMsg` - Copy of last control msg object received from sever
* `ioConnected` - Is Socket.IO client connected to the server?
* `isVisible` - Whether or not, the current page is showing to the user
* `lastNavType` - Remember the last page (re)load/navigation type (navigate, reload, back_forward, prerender)
* `meta` - module metadata {version, type, displayName}
* `msg` - Last std msg received from Node-RED
* `msgsSent` - The number of messages sent to server since page load
* `msgsReceived` - The number of messages received from server since page load
* `msgsSentCtrl` - The number of control messages sent to server since page load
* `msgsCtrlReceived` - The number of control messages received from server since page load
* `online` - Is the client browser online (true) or offline (false)?
* `sentCtrlMsg` - The last control msg object sent via uibuilder.send()
* `sentMsg` - The last std msg object sent via uibuilder.send()
* `serverTimeOffset` - Time offset between browser clock and server clock
* `socketError` - Holds the details of the last socket error
* `tabId` - Identifier for the current browser tab

## Read only - unlikely to be required

* `httpNodeRoot` - The setting from Node-RED. May be useful if you need to manually create a Node-RED URL and have set this variable in Node-RED.

## Functions

Functions accessible in user code.

### `start(options)` - (Mostly no longer needed) Starts Socket.IO communications with Node-RED

!> In most cases, you no longer need to call this yourself. The client startup is now more robust and should rarely need any help. The exception will be if you are loading a page from an external server instead of from Node-RED.

Unlike the original uibuilder client, this version:

* Rarely needs to be manually called. It should work for all page locations including in sub-folders as long as the client allows cookies.
* Only allows passing of a single options object.
* Allows being called again which will reset the Socket.IO connection and internal msg event handlers.

While multiple properties can be given in the options object, only the following are currently used:

* `ioNamespace` - This is normally calculated for you. However, if using an external server to serve the page, you may need to manually set this. Check the uibuilder node details page in the Node-RED Editor for what this should be set to.
* `ioPath` - As above.
* `loadStylesheet` - (default=true). Set to false if you don't want the uibuilder default stylesheet (`uib-brand.css`) to be loaded if you haven't loaded your own. Checks to see if any stylesheet has already been loaded and if it has, does not load.

### Message Handling

#### `send(msg, originator = '')` - Send a custom message back to Node-RED

The `msg` format is the same as used in Node-RED. 

The `originator` is optional and if used, should match the id from a `uib-sender` node. That allows you to specifically return a message into a flow that uses one of those nodes. However, ensure that the `uib-sender` node has turned on the flag to allow returned messages.

#### `eventSend(domevent, originator = '')` - Send a standard message back to Node-RED in response to a DOM event

This is a convenience function that is useful to attach as an event handler on an HTML DOM event (e.g. the click event of a button). Since it only requires the DOM event object that the DOM provides automatically.

The response includes some additional useful event data such as what modifier keys were active (e.g. shift, ctrl, etc) when the event happened.

If you want to add custom data to the response, you can add `data-xxxx` attributes to the originating HTML tag.

#### `setOriginator(originator = '')` - Set/clear the default originator

Will automatically be used by `send` and `eventSend`.

Set to an empty string to remove.

#### `sendCtrl(msg)` - Send a custom control message back to Node-RED

The message will be assessed by uibuilder and passed to its #2 (bottom) output port if considered acceptible.

This lets you create your own control custom messages should you wish to. Use with caution.

#### `beaconLog(txtToSend, logLevel)` - Send a short log message to Node-RED

This has the advantage of working even if Socket.IO is not connected. It uses a logging API provided by uibuilder.

However, only text strings can be sent and messages need to be kept short. It only works with modern browsers that support the web beacon API.

The `logLevel` matches both Node-RED and uibuilder defined log levels (e.g. error, warn, info, debug, trace ).

#### ~~logToServer()~~ - Not yet available. Will cause the input to appear in Node-RED logs

### Variable Handling

#### `get(prop)` - Get a uibuilder property

This is the preferred method to get an exposed uibuilder variable or property. Do not try to access variables and properties directly unless explicitly shared in this documentation.

##### Example

```javascript
console.log( uibuilder.get('version') )
```

#### `set(prop, val)` - Set a uibuilder property and dispatch a change event

This is the preferred method to set an exposed uibuilder variable or property. Do not try to set variables and properties directly.

When using set, the variable that is set becomes responsive. That is to say, that issuing a set triggers both the internal event handler (as used in `uibuilder.onChange('prop', ...)`) but also the DOM custom event `uibuilder:propertyChanged`. Normally, you will want to use the `onChange` handler.

Note that you can add additional custom data to the uibuilder object but care must be taken not to overwrite existing internal variables. This is useful if you want to be able to automatically process changes to your own variables using the `onChange` handler.

##### Example

```javascript
uibuilder.set('logLevel', 3)
```

#### `getStore(id)` - Attempt to get and re-hydrate a key value from browser localStorage

Note that browser localStorage is persisted even after a browser closes. It can be manually cleared from the browser's settings. You can also remove an item using the `removeStore` function.

If the `id` is not found in the store, `null` is returned. If the store is not available or some other error occurs, `undefined` is returned.

All `id`s have a pre-defined uibuilder prefix added to the key name to help ensure that the key being saved will be unique. This prefix is defined in the library and cannot be changed, it is set to `uib_`.

Because the browser storage API only allows strings as values, the data has to be serialised. This function attempts to unserialise (re-hydrate). It should be noted that sometimes, this process results in values that may differ from the original. For example, `uibuilder.setStore('mydate',new Date()); console.log( uibuilder.getStore('mydate') )` will return the saved date as an ISO8602 date string, not a JavaScript Date object.

#### `setStore(id, val)` - Attempt to save to the browsers localStorage

Write a value to the given id to localStorage. Will fail if localStorage has been turned off or is full.

The value to save has to be serialisable. Some JavaScript objects cannot be serialised (using `JSON.stringify`). If this happens `false` is returned and an error output to the browser console. However, you can store any basic value (number, string, boolean) as well as array's and objects.

Browsers set a limit on the size of the store for a particular source. Typically this is 10MB but may be altered by the user. The user can turn off localStorage as well.

Returns `true` if the save was successful, otherwise returns false.

Errors are output to the browser console if saving fails but processing will continue.

#### `removeStore(id)` - Attempt to remove a uibuilder key from browser localStorage

Does not return anything. Does not generate an error if the key does not exist.

#### `setPing(ms)` - Set a repeating ping/keep-alive HTTP call to Node-RED

This uses an HTTP API call to a custom uibuilder API endpoint in Node-RED. So it works even if the Socket.IO connection is not working. It is used to check that the Node-RED server and the uibuilder instance are both still working.

##### Example

```javascript
uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.

// Optionally monitor responses
uibuilder.onChange('ping', function(data) {
   console.log('pinger', data)
})
```

### UI Handling

These are the new dynamic, configuration-driven UI features. They let you create your UI dynamically from simple data sent to the client.

In addition, internal message handling will recognise standard messages from node-red and process them. So these functions won't always be needed. You can also do `uibuilder.set('msg', {/*your object details*/})` which instructs the client to treat the object as though it had come from Node-RED.

For functions with no descriptions, please refer to the code. In general, these will not need to be used in your own code.

#### `ui(json)` - Directly manage UI via JSON

Takes either an object containing `{_ui: {}}` or simply simple `{}` containing ui instructions.

#### `loadui(url)` - Load a dynamic UI from a JSON web reponse

Requires a valid URL that returns correct _ui data. For example, a JSON file delivered via static web server or a dynamic API that returns JSON as the body response.

#### `loadScriptSrc(url)` - Attach a new remote script to the end of HEAD synchronously
#### `loadStyleSrc(url)` - Attach a new remote style to the end of HEAD synchronously
#### `loadScriptTxt(string)` - Attach a new text script to the end of HEAD synchronously
#### `loadStyleTxt(string)` - Attach a new text style to the end of HEAD synchronously
#### `replaceSlot(el, component)` - Attach a new text script to the end of HEAD synchronously
#### `replaceSlotMarkdown(el, component)` - Attach a new text script to the end of HEAD synchronously
#### `showDialog(type, ui, msg)` - Attach a new text script to the end of HEAD synchronously

### Event Handling

#### `onChange(prop, callbackFn)` - Register on-change event listeners for uibuilder tracked properties

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

#### `cancelChange(prop, cbRef)` - remove all the onchange listeners for a given property

Both arguments must be provided. With `cbRef` having been saved when the listener was set up.

```javascript
uibuilder.cancelChange('msg', msgChgEvt)
```

#### `onTopic(topic, callbackFn)` - like onChange but directly listens for a specific topic

```javascript
const topicChgEvt = uibuilder.onTopic('my topic', (msg) => {
    // Do something when we get a message from Node-RED
    // with this specific msg.topic
})
```

#### `cancelTopic(topic, cbRef)` - like cancelChange for for onTopic

Both arguments must be provided. With `cbRef` having been saved when the listener was set up.

```javascript
uibuilder.cancelTopic('my topic', topicChgEvt)
```

### Other

#### `$(css-selector)` - Simplistic jQuery-like document CSS query selector, returns an HTML Element

This is a convenience method to help you select HTML DOM elements in your own custom code. All it does is use ` document.querySelector(css-selector)`. So any errors are the same as the native function.

As per the native function, it returns a single [HTML element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement). If the CSS Selector provided is not unique (e.g. >1 element would be returned), only the first element found in the DOM is returned. Use `document.querySelectorAll(css-selector)` if you want to get back an array of selected elements.

If the uibuilder client finds an existing definition of `$` on startup, it will not make this global. However, it would still be usable as `uibuilder.$(...)`. This avoids clashes with libraries such as jQuery.

##### Example

```javascript
const eMsg = $('#msg')
if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
```

#### `log` - output log messages like the library does

Use as `uibuilder.log(1, 'my:prefix', 'Some text', {some:'optional data'})` which produces:
![Example log output](../images/example-log-output.png)

First argument is the log level (0=Error, 1=Warn, 2=Info, 3=log, 4=debug, 5=trace). If the uibuilder logLevel variable is set to less than the requested level, the output will not be shown. The names can be used instead of the numbers.

The first 2 arguments are required. All remaining arguments are included in the output and may include array, objects, etc.

#### `syntaxHighlight(json)` - Takes a JavaScript object (or JSON) and outputs as HTML formatted

Requires some CSS that is contained in both the `uib-brand.css` and older `uib-styles.css`. Feel free to copy to your own CSS if you don't want to reference those files.

Use as:

```javascript
const eMsg = $('#msg')    // or  document.getElementById('msg') if you prefer
if (eMsg) eMsg.innerHTML = uibuilder.syntaxHighlight(msg)
```


## Custom Events

Custom events are all attached to the DOM `document` object. Additional custom data may be added to the `detail` object of the event object.

Can be used as `document.addEventListener('uibuilder:socket:connected', (event) => { ... }`.

### `uibuilder:constructorComplete` - when the uibuilder class constructor has completed

No data included.

### `uibuilder:startComplete` - when uibuilder initial start function has completed

No data included.

### `uibuilder:socket:connected` - when Socket.IO successfully connects to the matching uibuilder node in Node-RED

The connection count is provided on the events `detail` object.
This is likely to be the first event that is usable in your own front-end code, you can use it as an indicator that the uibuilder library is started and running correctly with a link back to Node-RED active. However, if using in your own code, note that it will fire again if the socket gets disconnected and then reconnects. So put in a flag if you only want to do something on initial startup.

### `uibuilder:socket:disconnected` - when Socket.IO disconnects from the matching uibuilder node in Node-RED

The disconnect reason is provided on the events `detail` object if available. May be a string or an error object.

### `uibuilder:propertyChanged` - when uibuilder.set is called (externally or internally)

Used internally be the `onChange` function but can also be used directly if preferred.

The new value of the property is provided on the events `detail` object.

### `uibuilder:stdMsgReceived` - when a non-control msg is received from Node-RED

The message content is provided on the events `detail` object.

### `uibuilder:msg:topic:${msg.topic}` - when a std msg with a msg.topic prop is received

The message content is provided on the events `detail` object.

### `uibuilder:msg:_ui` - when a std msg with a msg._ui property is received

The message content is provided on the events `detail` object.

### `uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}` - output for each action on receipt of a std msg with a msg._ui property

The action details are provided on the events `detail` object.
