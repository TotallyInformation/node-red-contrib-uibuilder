---
title: Documentation for the ECMA module front-end client `uibuilder.esm.js`
description: >
   This is the new uibuilder front-end library initially introduced in v5.1. It provides socket.io connectivity, simplified message handling and a simple event handler for monitoring for new messages along with some helper utility functions. It also allows data-/configuration-driven interfaces to be created from JSON or Node-RED messages.
created: 2022-06-11 14:15:26
lastUpdated: 2022-06-18 17:04:36
---

This is the next-generation front-end client for uibuilder. It has some nice new features but at the expense of only working with modern(ish) browsers since early 2019.

- [To Do](#to-do)
- [How to use](#how-to-use)
  - [The quick guide](#the-quick-guide)
  - [Where is it?](#where-is-it)
  - [More information](#more-information)
- [What has been removed compared to the non-module version?](#what-has-been-removed-compared-to-the-non-module-version)
- [Limitations](#limitations)
- [Features](#features)
  - [Dynamic, data-driven HTML content](#dynamic-data-driven-html-content)
  - [Exposes global uibuilder and $](#exposes-global-uibuilder-and-)
  - [Includes the Socket.IO client library](#includes-the-socketio-client-library)
  - [start function (now rarely needed)](#start-function-now-rarely-needed)
  - [$ function](#-function)
  - [onChange/cancelChange functions](#onchangecancelchange-functions)
  - [onTopic/cancelTopic functions](#ontopiccanceltopic-functions)
  - [Conditional logging](#conditional-logging)
  - [document-level events](#document-level-events)
  - [setPing function](#setping-function)
  - [set function](#set-function)
  - [Page auto-reload](#page-auto-reload)
  - [setStore, getStore, removeStore functions](#setstore-getstore-removestore-functions)
  - [send function](#send-function)
  - [eventSend function](#eventsend-function)
    - [Plain html/javascript example.](#plain-htmljavascript-example)
    - [VueJS/bootstrap-vue example](#vuejsbootstrap-vue-example)
  - [Auto-loading of the uibuilder default stylesheet](#auto-loading-of-the-uibuilder-default-stylesheet)
  - [Initial connection message now shows whether the page is newly loaded or not](#initial-connection-message-now-shows-whether-the-page-is-newly-loaded-or-not)
  - [Stable client identifier](#stable-client-identifier)
  - [Number of connections is tracked and sent to server on (re)connect](#number-of-connections-is-tracked-and-sent-to-server-on-reconnect)
    - [Example client connect control msg](#example-client-connect-control-msg)
  - [ui function](#ui-function)
- [Dynamic, data-driven HTML content](#dynamic-data-driven-html-content-1)
  - [Dynamic content details](#dynamic-content-details)
  - [Initial load from JSON URL](#initial-load-from-json-url)
  - [Dynamic changes via messages from Node-RED (or local set)](#dynamic-changes-via-messages-from-node-red-or-local-set)
  - [Available methods](#available-methods)
  - [Method: load](#method-load)
    - [Caveats and limitations](#caveats-and-limitations)
    - [Msg schema & example](#msg-schema--example)
    - [Example showing load in your own index.js](#example-showing-load-in-your-own-indexjs)
  - [Method: add](#method-add)
    - [Msg schema](#msg-schema)
    - [Example msgs for nested components](#example-msgs-for-nested-components)
  - [Method: remove](#method-remove)
  - [Method: update](#method-update)
    - [Msg schema](#msg-schema-1)
  - [Method: reload - Reloads the current page](#method-reload---reloads-the-current-page)
  - [Method: notify](#method-notify)
    - [HTML Tags](#html-tags)
      - [Schema](#schema)
  - [Method: alert](#method-alert)
- [Troubleshooting](#troubleshooting)
  - [Vendor files are not loading](#vendor-files-are-not-loading)
  - [Socket.IO refuses to connect](#socketio-refuses-to-connect)
  - [Socket.IO repeatedly disconnects](#socketio-repeatedly-disconnects)
  - [Event/onChange/onTopic callbacks don't fire](#eventonchangeontopic-callbacks-dont-fire)
  - [The `uibuilder` JavaScript object does not seem to be loaded](#the-uibuilder-javascript-object-does-not-seem-to-be-loaded)
- [Technical Reference](#technical-reference)
  - [Variables](#variables)
    - [Read/write](#readwrite)
    - [Read only](#read-only)
  - [Functions](#functions)
    - [`start(options)` - Starts Socket.IO communications with Node-RED](#startoptions---starts-socketio-communications-with-node-red)
    - [Message Handling](#message-handling)
      - [`send`](#send)
      - [`sendCtrl`](#sendctrl)
      - [`eventSend`](#eventsend)
    - [Variable Handling](#variable-handling)
      - [`get`](#get)
      - [`set`](#set)
      - [`getStore`](#getstore)
      - [`setStore`](#setstore)
      - [`removeStore`](#removestore)
      - [`setPing`](#setping)
    - [UI Handling](#ui-handling)
      - [`loadScriptSrc` - Attach a new remote script to the end of HEAD synchronously](#loadscriptsrc---attach-a-new-remote-script-to-the-end-of-head-synchronously)
      - [`loadScriptTxt` - Attach a new text script to the end of HEAD synchronously](#loadscripttxt---attach-a-new-text-script-to-the-end-of-head-synchronously)
      - [`loadui` - Load a dynamic UI from a JSON web reponse](#loadui---load-a-dynamic-ui-from-a-json-web-reponse)
    - [Event Handling](#event-handling)
      - [`onChange` - Register on-change event listeners for uibuilder tracked properties](#onchange---register-on-change-event-listeners-for-uibuilder-tracked-properties)
      - [`cancelChange` - remove all the onchange listeners for a given property](#cancelchange---remove-all-the-onchange-listeners-for-a-given-property)
      - [`onTopic` - like onChange but directly listens for a specific topic](#ontopic---like-onchange-but-directly-listens-for-a-specific-topic)
      - [`cancelTopic` - like cancelChange for for onTopic](#canceltopic---like-cancelchange-for-for-ontopic)
    - [Other](#other)
      - [`$` - Simplistic jQuery-like document CSS query selector, returns an HTML Element](#---simplistic-jquery-like-document-css-query-selector-returns-an-html-element)
      - [`setOriginator`](#setoriginator)
      - [`log` - output log messages like the library does](#log---output-log-messages-like-the-library-does)
  - [Custom Events](#custom-events)
    - [`uibuilder:propertyChanged` - when uibuilder.set is called (externally or internally)](#uibuilderpropertychanged---when-uibuilderset-is-called-externally-or-internally)
    - [`uibuilder:stdMsgReceived` - when a non-control msg is received from Node-RED](#uibuilderstdmsgreceived---when-a-non-control-msg-is-received-from-node-red)
    - [`uibuilder:msg:topic:${msg.topic}` - when a std msg with a msg.topic prop is received](#uibuildermsgtopicmsgtopic---when-a-std-msg-with-a-msgtopic-prop-is-received)
    - [`uibuilder:msg:_ui` - when a std msg with a msg._ui property is received](#uibuildermsg_ui---when-a-std-msg-with-a-msg_ui-property-is-received)
    - [`uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}` - output for each action on receipt of a std msg with a msg._ui property](#uibuildermsg_uiactionmethodactionid--actionid-----output-for-each-action-on-receipt-of-a-std-msg-with-a-msg_ui-property)
    - [`uibuilder:socket:connected` - when Socket.IO successfully connects to the matching uibuilder node in Node-RED](#uibuildersocketconnected---when-socketio-successfully-connects-to-the-matching-uibuilder-node-in-node-red)
    - [`uibuilder:socket:disconnected` - when Socket.IO disconnects from the matching uibuilder node in Node-RED](#uibuildersocketdisconnected---when-socketio-disconnects-from-the-matching-uibuilder-node-in-node-red)

## To Do

Please see the main [roadmap](roadmap.md).

## How to use

This version of the library _has_ to be used as an ES Module.

### The quick guide

In `index.html`:

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TotallyInformation - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - TotallyInformation">
    <link rel="icon" href="./images/node-blue.ico"> 

    <link type="text/css" rel="stylesheet" href="./uib-brand.css" media="all">

    <script type="module" async src="./index.js"></script> 

</head><body class="uib">
    
    <!-- Your custom HTML -->
    
</body></html>
```

In `index.js`

```javascript
import './uibuilder.esm.min.js'

// ... your custom code, the uibuilder global object is available ...
// note that we almost certainly don't need the uibuilder.start() line any more

window.onload = (evt) => {
    // Put code in here if you need to delay it until everything is really loaded and ready.
    // You probably won't need this most of the time.
}

```

In some cases, your JavaScript code may be nothing more than the import statement. If that is the case, you don't need an `index.js` file at all, just use the following in your HTML.

```html
<script type="module" async src="./uibuilder.esm.min.js"></script>
```

However, note that the uibuilder object is not then available to another script. This is because code inside ES modules is isolated and they can't directly talk to each other.

Or, if you only need a few lines of JavaScript.

```html
<script type="module" async>
    import './uibuilder.esm.min.js'
    // -- more code, the uibuilder object is available here --
</script>
```

### Where is it?

You can access the client module from two different URL's. Which one you use depends on your coding needs.

The main location is given as `./uibuilder.esm.js` which will be on the same URL path as your UI code. 

Alternatively, you can use `/uibuilder/uibuilder.esm.js` although if you are using Node-RED's ExpressJS web server (normally on port 1880) you will need to take note whether Node-RED's `httpNode` setting has been changed. If it has, you will need to add that to the beggining of the URL. For example, if `httpNod` = `nr`, you would need to use `/nr/uibuilder/uibuilder.esm.js`. So the first form is generally easier to use.

In addition to the main, uncompressed, file, a more compact minified version is available called `uibuilder.esm.min.js`. This also has a `.map` file which can be useful for debugging, you don't need to load that manually.

### More information

Because the library has to be loaded as a module, it no longer needs an IIFE wrapper. Modules are already isolated. This has greatly simplified the code.

The library consists of a new class `Uib`. That class is auto-instanciated on load. If loading via a script tag, the `window.uibuilder` global is set. However, it is best to load from your own module code. In doing so, you have the option to load both the raw class as well as the `uibuilder` instance. `import {Uib, uibuilder} from './uibuilder.esm.js'`

It also adds `window.$` as long as it doesn't already exist (e.g. if you already loaded jQuery). `$` is bound to `document.querySelector` which means that you can use it as a shortcut to easily reference HTML entities in a similar way to a very simplistic jQuery. e.g. `$('#button1').innerHTML = 'boo!'`.

!> Please note that this version requires a browser since early 2019. This is probably only an issue if you are stuck on Internet Explorer or on a version of Apple Safari <12.1.

Because you should ideally be loading uibuilder in your own module code. For example `<script type="module" async src="./index.js"></script>` in your `index.html` `head` section and then `import {Uib, uibuilder} from './uibuilder.esm.js'` in your `index.js` file. You can now choose to use a different name for the uibuilder library if you wish. For example `import {uibuilder as uib} from './uibuilder.esm.js'` will give you a `uib` object instead. Use as `uib.start()`, etc. However, you should note that, at present, the global `uibuilder` object is actually still loaded so make sure that you only use one or the other copy. This is because it does not appear to be possible to detect whether a module has been loaded from a script tag in HTML or from an import statement in JavaScript. Really, only in the former case should the global be set and while `window.uibuilder` is checked for to ensure that it isn't loaded again, when using an `import`, you are in a different module context.

In addition, you could do just `import {Uib} from './uibuilder.esm.js'` and then do `const uibuilder = new Uib()`. Not sure why you might want to do that but it is possible anyway.


## What has been removed compared to the non-module version?

* VueJS specific features.
  
  This new ECMA Module version is completely framework agnostic. The UI automation features don't rely on any framework or external library. Please switch to using those features along with suitable web or framework components.

  These features were only ever a convenience and should hopefully no longer be needed in the future.

* Load JavaScript/CSS via a msg sent from Node-RED. _Replaced with new feature_.
  
  The old feature will not work with this library.

  However, you can load ECMA Modules (e.g. web components), and scripts from a URL.

  You can also load scripts from text in a message. These use the new style `msg._ui` data schema.

  Obviously care must always be taken with a feature like this since it may open your UI to security issues.

  See [Dynamic Load](#method-load) below.

## Limitations

The main limitation of this new, ESM version of the library is that it can only be used as an ESM module. I've investigated whether it is possible to do a translation to an ES6, IIFE version to more closely match the older `uibuilderfe` library, this does not appear to be possible at this time because there are no tools that will allow it.

---

## Features

### Dynamic, data-driven HTML content

This feature allows you to dynamically create a UI or part of a UI using just configuration information either send in messages from Node-RED or loaded from a JSON file (or a combination of both).

See the detail section on [Dynamic, data-driven HTML content](#dynamic-data-driven-html-content) for details.

### Exposes global uibuilder and $

For ease of use, both `uibuilder` and `$` objects are added to the global `window` context unless they already exist there.

### Includes the Socket.IO client library

There is no longer a need to load this library, which sometimes caused confusion in the past. The correct version of the library is included.

### start function (now rarely needed)

!> You should hardly ever need to manually run this now. Try without first. See the details below.

The start function is what kick-starts the uibuilder front-end library into action. It attempts to make a connection to Node-RED and exchanges the initial control messages.

It:

* Attempts to use some cookie values passed from Node-RED by uibuilder in order to work out how to connect the websocket (actually uses Socket.IO).
* Starts the communications with Node-RED/uibuilder node using Socket.IO. This also issues 1 or more document custom events (see [Event Handling](#event-handling) below).
* An event handler is created for incoming messages from Node-RED. It checks for reload and UI requests and deals with them automatically.
* Automatically loads the default stylesheet if you haven't loaded your own.

Normally, you will not have to pass any options to this function (unlike the equivalent function in the older `uibuilderfe.js` library before uibuilder v5). However, see the troubleshooting section if you are having problems connecting correctly.

If you do need the options, there is now only a single argument with only two possible properties:

```javascript
uibuilder.start({
    ioNamespace: '/components-html', // Will be the uibuilder instance URL prefixed with a leading /
    ioPath: '/uibuilder/vendor/socket.io', // Actual path may be altered if httpNodeRoot is set in Node-RED settings
})
```

### $ function

uibuilder adds the global `$` function when loaded if it can (it won't do it if `$` is already present, such as if jQuery has been loaded before uibuilder). This is for convenience.

The `$` function acts in a similar way to the version provided by jQuery. It is actually bound to [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) which lets you get a reference to an HTML element using a CSS selector.

!> Note that this function will only ever return a **single** element which is differnt to jQuery. You can always redefine it to `querySelectorAll` using `window.$ = document.querySelectorAll.bind(document)` should you need to.

If multiple elements match the selection, the element returned will be the first one found.

Example. With the HTML `<button id="button1">Press me</button>` and the JavaScript `$('#button1').innerHTML = 'boo!'`. The label on the button will change from "Press me" to "Boo!".

See the [MDN documentation on CSS query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for details on selecting elements.

### onChange/cancelChange functions

The `onChange` function will be familiar if you have used previous versions of the `uibuilderfe.js` library. However, it works in a very different way now. The most important change is that it now returns a reference value that can be used to cancel the listener if you need to.

Here are some useful examples:

```javascript
let ocRef = uibuilder.onChange('msg', function(msg) {
    console.log('>> onChange `msg` >>', this, msg)
    // ... do something useful with the msg here ...
})
let ocRefPing = uibuilder.onChange('ping', function(data) {
    console.log('>> onChange `ping` >>', data)
    // ... do something useful with the msg here ...
})
uibuilder.onChange('ioConnected', function(isConnected) {
    console.log('>> onChange `ioConnected` >>', isConnected)
    // ... do something useful with the msg here ...
})
// ... or anything else that is changed using the `set` function ...
```

The `cancelChange` function lets you turn off the event responders:

```javascript
uibuilder.cancelChange('msg', ocRef)
uibuilder.cancelChange('ping', ocRefPing)
```

### onTopic/cancelTopic functions

This is a convenience function pair that lets you take action when a message from Node-RED contains a specific topic. It may save you some awkward coding where you find yourself using `onChange` to listen for `msg` changes but then have to have a long-winded `if` or `switch` statement around the `msg.topic`. That is no longer necessary. Instead just use several different `onTopic` functions.

For example, a message from Node-RED such as `{topic: 'mytopic', payload: 42}` could be actioned using the following code:

```javascript
let otRef = uibuilder.onTopic('mytopic', function(msg) {
    console.log('>> onTopic `mytopic` >>', this, msg)
    // ... do something useful with the msg here ...
})
```

Note that the `onTopic` function returns a reference value. For the most part, this is not required. However, if for some reason, you need to be able to cancel the listener, you can do so with:

```javascript
uibuilder.cancelTopic('mytopic', otRef)
```

It is also worth noting that, as written above, you will see that the console message shows 2 copies of the msg. That is because the value of `this` within the callback function is also set to the `msg`. Obviously, this is not accessible if you use an arrow function as with:

```javascript
let otRef = uibuilder.onTopic('mytopic', (msg) => {
    console.log('>> onTopic `mytopic` >>', this, msg)
    // ... do something useful with the msg here ...
})
```

Because `this` now points to the parent and not to the callback function. You could use a bound function if you really wanted the correct `this` when using an arrow function but at present, there is no real value in doing that as the content of `this` is identical to the `msg` argument. That may change in future releases.

### Conditional logging

Internal logging is much improved over previous versions of this library. There is now a dedicated internal `log` function which adds colour highlighting to browsers that support it in the dev tools console. That includes all Chromium-based browsers and Firefox.

You can alter the amount of information that the uibuilder library outputs to the console by changing the `logLevel` with `uibuilder.logLevel = 4` where the number should be between 0 and 5. you can set that at any time in your code, however it will generally be most useful set _before_ calling `uibuilder.start()`.

The default level is set to 1 (warn). The levels are: 0 'error', 1 'warn', 2 'info', 3 'log', 4 'debug', 5 'trace'.

Changing the log level outputs an info note to the console telling you what the level is.

The log function is also available to your own code as `uibuilder.log(level, prefix, ...outputs)`.

### document-level events

In previous versions of the library, a custom event feature was used. In this version, we make use of custom DOM events on the `document` global object.

Each event name starts with `uibuilder:` to avoid name clashes.

See the [Custom Events](#custom-events) below for details.

The current events are (other events may be added later):

* `uibuilder:stdMsgReceived` - triggered when a non-control msg arrives from Node-RED
* `uibuilder:propertyChanged` - triggered when any uibuilder managed property is changed
* `uibuilder:msg:topic:${msg.topic}` - triggered when an incoming msg contains a `msg.topic` property allowing specific topics to be monitored
* `uibuilder:msg:_ui` - triggered when an incoming msg contains a `msg._ui` property (used for UI automation using web components)
* `uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}` - triggered when the incoming msg contains `msg._ui.add`, `msg._ui.update`, or `msg._ui.remove` for UI automation. For the update action, the `msg._ui.id` property links the msg to a specific on-page element by its HTML id attribute.
* `uibuilder:socket:connected` - when Socket.IO successfully connects to the matching uibuilder node in Node-RED
* `uibuilder:socket:disconnected` - when Socket.IO disconnects from the matching uibuilder node in Node-RED

You can watch for these events in your own code using something like:

```javascript
document.addEventListener('uibuilder:propertyChanged', function (evt) {
    console.log('>> EVENT uibuilder:propertyChanged >>', evt.detail)
})
```

In each case, `evt.detail` contains the relevant custom data.

In general, you should not need to use these events. There are more focused features that are easier to use such as `onChange` and `onTopic`.

Of particular note are the `_ui` events. These are used by uibuilder-aware web components for UI automation.

### setPing function

`setPing` accesses a special endpoint (URL) provided by uibuilder. That endpoint returns a single value which really isn't of any use to your code. However, it _does_ do several useful things:

1. It tells the server that your browser tab is alive. 
   
   This may be useful when working either with a reverse Proxy server or with uibuilder's ExpressJS middleware for authentication and/or authorisation.

   Because most communication with uibuilder happens over websockets, telling the server whether a client is still active or whether the client's session has expired is challenging. A ping such as this may be sufficient for the proxy or your custom middleware code to continue to refresh any required security tokens, etc.

2. It returns the timespan (in milliseconds) of the round-trip time.

   This can help with understanding networking and client device or Node-RED issues.

3. It returns the uibuilder/Node-RED HTTP headers.

   Normally, the web server headers cannot be accessed by your custom JavaScript code. However, the ping function uses the `Fetch` feature available to modern browsers which does return the headers.

   You can watch for ping responses as follows:

   ```javascript
    uibuilder.setPing(2000) // repeat every 2 sec. Re-issue with ping(0) to turn off repeat.
    uibuilder.onChange('ping', function(data) {
        console.log('>> PING RESPONSE >>', data)
    })
    // Output:
    //    pinger {success: true, status: 201, headers: Array(6)}

    // Turn off the repeating ping with
    uibuilder.setPing(0)
   ```

   The headers are included in the data object.

4. It returns the full originating URL.

   While not normally needed, it can be useful in order to work out whether Node-RED's httpNode URL path has been changed.

### set function

the `uibuilder.set()` function is now more flexible than in `uibuilderfe.js`. You can now set anything that doesn't start with `_` or `#`.

!> Please note that there may be some rough edges still in regard to what should and shouldn't be `set`. Please try to avoid setting an internal variable or function or bad things may happen 😲

This means that you can simulate an incoming message from Node-RED with something like `uibuilder.set('msg', {topic:'uibuilder', payload:42})`.

One interesting possibility is getting your page to auto-reload using `uibuilder.set('msg', {_uib:{reload:true}})`. Perhaps even more useful is the ability to very easily alter your UI on the page by using the dynamic UI feature (detailed below) `uibuilder.set('msg', {_ui:[{method:'add', ...}, {method:'remove', ....}]})`.

Using the `set` function triggers an event `uibuilder:propertyChanged` which is attached to the `document` object. This means that you have two different ways to watch for variables changing.

This will listen for a specific variable changing:

```javascript
uibuilder.onChange('myvar', (myvar) => {
    console.log('>> MYVAR HAS CHANGED >>', myvar)
})
// ...
uibuilder.set('myvar', 42)
// Outputs:
//     >> MYVAR HAS CHANGED >> 42
```

Whereas this will listen for anything changing:

```javascript
document.addEventListener('uibuilder:propertyChanged', function (evt) {
    // evt.detail contains the information on what has changed and what the new value is
    console.log('>> EVENT uibuilder:propertyChanged >>', evt.detail)
})
// ...
uibuilder.set('myvar', 42)
// Outputs:
//     >> EVENT uibuilder:propertyChanged >> {prop: 'myvar', value: 42}
```

### Page auto-reload

By sending a message such as `{_uib:{reload:true}}` from Node-RED, you can make your page reload itself. This is already used by the uibuilder file editor. But you can add a flow in Node-RED that consists of a watch node followed by a set node that will create this message and send it into your uibuilder node. This will get your page to auto-reload when you make changes to the front-end code using an editor such as VSCode. This is what a dev server does in one of the many front-end frameworks that have build steps. You don't need a build step though and you don't need a dev server! 😎

### setStore, getStore, removeStore functions

Stores & retrieves information in the browser's localStorage if allowed. localStorage will survive page reloads as well as tab, window, browser, and machine restarts. However, whether storage is allowed and how much is decided by the browser (the user) and so it may not be available or may be full.

Applies an internal prefix of 'uib_'. Returns `true` if it succeded, otherwise returns `false`. If the data to store is an object or array, it will stringify the data.

Example

```javascript
uibuilder.setStore('fred', 42)
console.log(uibuilder.getStore('fred'))
```

To remove an item from local storage, use `removeStore('fred')`.

### send function

The send function sends a message from the browser to the Node-RED server via uibuilder.

```javascript
uibuilder.send({payload:'Hello'})
```

There is an optional second parameter that specifies an originating uib-send node. Where present, it will return a message back to the originating `uib-sender` node. To make use of the sender id, capture it from an incoming message.

### eventSend function

Takes an suitable event object as an argument and returns a message to Node-RED containing the event details along with any data that was included in `data-*` attributes and any custom properties on the source element.

`data-*` attributes are all automatically added as a collection object to `msg.payload`.

The returned msg has an expanded set of data over the old client libraries eventSend function. All of the relevant data other than the payload is under the `msg._ui` property. The data comes from the "target" element which is the HTML element that was the target of the event. E.g. a button element.

msg._ui contains:

* `id`: The element id if it exists.
* `name`: The element's name attribute if it exists.
* `slotText`: The text of the slot if there is any. Max 255 characters.
* `props`: An object of property name/value pairs. Only contains custom properties which can be set when using this library to add/change elements or might be set when using web or other framework component tags.
* `attribs`: List of attributes on the target element (without id, name, class attributes).
* `classes`: Array of class names applied to the target element when the event fired.
* `event`: The type of event (e.g. "click").
* Key modifiers: `altKey`, `ctrlKey`, `shiftKey`, `metaKey`. Any keyboard modifiers that were present when the event fired.
* `pointerType`: The type of pointer that triggered the event (e.g. "mouse" or "touch")
* `nodeName`: The name of the tag that triggered the event (e.g. "BUTTON")
* `clientId`: The uibuilder client ID. This is set in a session cookie for the client browser profile/URL combination for that browser's current session (e.g. changes if the browser closes and reopens but otherwise stays the same).

This function is especially useful for config driven UI's since you can simply send a message with something like:

```json
_ui: {
    "method": "add",
    "parent": "#start",
    "components": [
        {
            "type": "button",
            "xparent": "#start",
            "attributes": {
                "id": "fred",
                "style": "margin:1em;",
                "name": "Freddy",
                "data-return": "wow!",
                "type": "button"
            },
            "properties": {
                "nice": {
                    "lets": "have",
                    "a": "property"
                }
            },
            "events": {
                "click": "uibuilder.eventSend"
            }
        }
    ]
}
```

And the button will immediately be able to send data back to Node-RED without the need for any coding.

#### Plain html/javascript example.

In index.html

```html
<button id="button1" data-life="42"></button>
```

In index.js 

```javascript
$('#button1').onclick = (evt) => { uibuilder.eventSend(evt) }
```

#### VueJS/bootstrap-vue example

In index.html

```html
<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>
```

In index.js VueJS app `methods` section

```javascript
    // ...
    methods: {
        doEvent: uibuilder.eventSend,
    },
    // ...
```

### Auto-loading of the uibuilder default stylesheet

In previous versions of the front-end library, you had to provide your own CSS code and had to make sure that you imported (or loaded) the uibuilder default stylesheet (`uib-styles.css`).

In this version, if you haven't loaded any other stylesheets, the library will automatically load the new default stylesheet (`uib-brand.css`).

!> Note that using this auto-load feature will result in a flash of an unformated page before the styles are loaded and applied. So it is still recommended to load the stylesheet manually in the head section of your HTML. That will avoid the unstyled flash.

If you are trying to load the default CSS and can't find the correct URL, try removing the style link from your HTML and check what the client loads in the browsers dev tools network tab.

### Initial connection message now shows whether the page is newly loaded or not

In previous versions, it was not possible for Node-RED to know whether the client was a freshly loaded page (or a page reload) or whether it was simply reconnecting after a Node-RED restart or lost websocket connection.

Now, the initial control message that is sent out of port #2 of a uibuilder node contains more information about the client. Including the `conections` property that is zero for a new connection or reloaded page. If that number is >0, it indicates that the client has reconnected and still has all of its original context and data.

This is particularly useful as if the number is >0, you don't need to resend any cached data.

```json
{"uibuilderCtrl":"client connect","serverTimestamp":"2022-06-11T20:17:09.112Z","version":"5.0.3-dev","_socketId":"UVYHvYXgdtXvAglvAAA2","ip":"::ffff:127.0.0.1","clientId":"Gc8RjdGfq92TurmEXC6G3","connections":1,"from":"server","_msgid":"c8d90727e3b93299"}
```

As can be seen from the example message above, the client IP address and client id (see below) are also added to the connection message.

### Stable client identifier

When a new browser connects to a uibuilder endpoint for the first time in a browser session, uibuilder will attempt to provide a new clientID. The uibuilder front-end library stores that ID in session cookie so any future connections from that browser profile to the same server address will reuse the same client id until the browser is restarted. The ID is a random UUID and so should always be unique.

Because the client id is stable, it can be used for things like session management and security checks on the server.

### Number of connections is tracked and sent to server on (re)connect

When the client connects to the Node-RED server over Socket.IO, it sends a message out of port #2 that looks like the following. This has always been the case but now some additional information is included in the msg. The client IP address (`msg.ip`) is added by the server on receipt. The stable client identifier (`msg.clientId`), client version (`msg.version`), and the number of connections (`msg.connections`) are added by the client.

The client increments the `connections` value each time it has to connect or re-connect to the server.

This is useful because the server now knows that if `msg.connections` is zero, this is a new connection not a reconnection. A new connection is when the page is loaded or re-loaded.

This information is also built into the `uib-cache` node from v5.1 to reduce unnecessary sending of the cache.

#### Example client connect control msg

```jsonc
{
    "uibuilderCtrl":"client connect",
    "_socketId":"TL6xrKrQtmyHsEKEAAAD",
    "from":"server",
    "_msgid":"3fc0e6b9ce82a95d",
    // These are new as of v5.1
    "clientId":"nqfzLy4SXju3hPRVD3UMq",
    "ip":"::ffff:127.0.0.1",
    "connections":0,
}
```

### ui function

This new function allows passing the same data as `msg._ui` from within your front-end code. It allows front-end scripts to be able to dynamically generate and update UI's using simple configuration JSON.

See the next section for details.

---

## Dynamic, data-driven HTML content

This version of the uibuilder front-end library supports the dynamic manipulation of your web pages. This is achieved either by loading a JSON file describing the layout and/or by sending messages from Node-RED via a uibuilder node where the messages contain a `msg._ui` property.

Please see the next section for details.

### Dynamic content details

Dynamic, data-driven UI manipulation is supported directly by this uibuilder front-end library. You can either control the UI via messages sent from Node-RED as shown in the next section, or you can also load a UI from a web URL that returns JSON content in a similar format.

You can also manipulate the UI from within your own front-end code by simulating the receipt of node-red messages (`uibuilder.set('msg', {_ui: [{ ... }]})`).

It is best practice to always include a method-level parent (`_ui[n].parent`) even if you want to attach everything to the `<body>` tag (CSS Selector `body`).

### Initial load from JSON URL

This is optional but may be useful to pre-populate the dynamic UI.

It is triggered using the command `uibuilder.loadui(<URL>)` where `<URL>` is the URL that will return JSON formatted content in the format described here.

`uibuilder.loadui` can run before `uibuilder.start`. It is best to run it as early as possible after loading this library.

A common way to provide an initial UI would be to create an `index.json` file in the same folder as your `index.html` file. You can then use `uibuilder.loadui('./index.json')` to get your initial UI on the page. A possible alternative might be to use uibuilder's instance API feature to dynamically create an API URL that returns the JSON. More commonly though, if wanting to dynamically generate the initial layout, would be to use a Node-RED flow that is triggered by a uibuilder client connection control message.

It is best practice to try and always include `id` attributes at least on every top-level component. That will enable you to easily and safely

### Dynamic changes via messages from Node-RED (or local set)

The receipt from Node-RED or local setting (`uibuilder.set('msg', {_ui: { ... }})`) of a `msg` object containing a `msg._ui` property object will trigger the uibuilder front-end library to make changes to the web page if it can.

?> Note that `msg._ui` can be either an Object (which only allows a single method call in the msg) or it can be an Array (which allows multiple method calls in a single msg).

Each method object may contain any number of component descriptors. Component descriptors can contain any number of sub-component descriptors. There is no theoretical limit to the nesting, however expect things to break spectacularly if you try to take things to extremes. If top-level components have no parent defined, they will use the parent at the method level, if that isn't defined, everything will be added to the `<body>` tag and a warning is issued. Sub-components will always be added to the parent component.

All methods and components are processed in the order they appear in the message.

### Available methods

```js
msg._ui.method = 'load' || 'add' || 'remove' || 'update' || 'reload' || 'notify' || 'alert'
```

* `load`: Load a new UI component using `import()` so that it can be used. Used, for example, to dynamically load web components or other modules. It can also load plain JS and CSS.
* `add`: Add a UI component instance to the web page dynamically.
* `remove`: Remove a UI component instance from the web page dynamically.
* `update`: Update the settings/data of a UI component instance on the web page.
* `reload`: Triggers the page to automatically reload
* `notify`: Shows an overlayed notification message (toast)
* `alert`: Shows an overlayed alert notification

Other future possibilities: `reset`

### Method: load

The load method allows you to dynamically load external web components, ECMA modules, plain JavaScript, and CSS stylesheets. It also allows loading of JavaScript and CSS Styles from given text input.

!> Please take note of the limitations and caveats of the load method. It works well for loading web components before adding them dynamically to your UI. Also works well for dynamic changes to scripts and css. However, there are a lot of things that can catch you out. If having issues, use an import statement or a script tag in your front-end code instead.

#### Caveats and limitations

* **WARNING**: Passing code dynamically **IS** a potential security issue. Make sure that only safe code is permitted to be passed. There is no way for the front-end library to check the validity or safety of the code.

* If using a relative url, it is relative to the uibuilder client library and NOT relative to your code.

* For the `components` array

  * You cannot use this feature to load web components that you manually put into your index.html file. That is because they will load too late. Only use this where you will dynamically add a component to the page using the UI methods shown here.

  * At present, only ES modules (that use `export` not `exports`) can be dynamically loaded since this feature is primarily aimed at loading [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). This feature requires browser support for [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports).

  * Dynamic Imports happen asynchronously. While this isn't usually a problem, the load does not wait to complete so very occasionally with a particularly complex component or on a particularly slow network, it is possible that the load will not complete before its use. In that case, simply delay the components use or move the load to earlier in the processing.

* For the `srcScripts` and `txtScripts` arrays
  
  * Scripts attached these ways generally finish loading too slowly. This means that you cannot use the load method and then use the script in an add method straight away. You would have to load the script in your HTML for that. However, you can load them, for example, in the `loadui` function and then use them later when sending `_ui` msgs from Node-RED. Typically, you will need a second or two before the script will have fully loaded.
  
  * `txtScripts` entries must be text, you cannot pass an actual JavaScript function. This is normally OK since Node-RED should convert a function to text as it pushes the data through Socket.IO.

* For the `srcStyles` and `txtStyles` arrays
  
  * Styles loaded this way are added to the end of the HTML `head`. As such, if you try to redefine a style that an already loaded stylesheet has set, you may need to add ` !important` to the definition due to CSS specificity rules.

#### Msg schema & example

```jsonc
{
    "_ui": {
        "method": "load",
        "components": [
            "url1", "url2" // as needed
        ],
        // Styles are added to the end of the HEAD
        "srcStyles": [
            "https://example.com/libs/my-styles.css"
        ],
        "txtStyles": [
            // Example of overwriting a brand stylesheet entry
            ":root { --info-hue: 90 !important; }",
            // We can try to change anything - but will need !important if the pre-loaded sheet already defines it
            "code { font-size: 120% !important; font-family: fantasy; }"
        ],
        // Note that scripts finish loading too slowly which means that you cannot use the load
        // method and then use the script in an add method. You have to load the script in your HTML for that.
        // Typically, you will need a second or two before the script will have fully loaded.
        "srcScripts": [
            "https://example.com/some/script.js"
        ],
        "txtScripts": [
            // Will be able to do `fred()` in the browser dev console.
            "function fred() { console.log('HEY! This script loaded dynamically.') }",
            // But of course, we can execute immediately as well.
            "fred()"
        ]
    }
}
```

#### Example showing load in your own index.js

Note how this can and usually *should* be done immediately after importing the uibuilder library.

```javascript
uibuilder.set('msg', {
    _ui: {
            "method": "load",
            "components": [
                "../uibuilder/vendor/@totallyinformation/web-components/components/definition-list.js",
                "../uibuilder/vendor/@totallyinformation/web-components/components/data-list.js",
            ]
    }
})

// We don't need this normally any more but just to show
// you can run a load before running start.
//uibuilder.start()
```

### Method: add

The `add` method will add one or more HTML elements (components) to the page. Components are loaded in order and a component may also have nested components (which in turn can also do so, ...). 

Each component can:

* *Be attached to a specified parent element* selected via a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) statement (e.g. `#myelementid`, `.myclass`, `li.myclass`, `div[attr|=value]`, etc). 
  
  If the selector results in multiple elements being returned, only the _first_ found element is used.

  Each component is added as a _child_ of the parent.

* *Have HTML attributes set*.
  
  Remember that HTML attributes can only contain string data.

* *Have custom properties set*. This can contain any data that can be passed via JSON. 
  
  !> Note that, because the library adds any custom property direct to the element, you need to take care not to use an existing name (such as internal DOM API names). Doing so will either fail or will have unintended side-effects.

  This allows you to pass complex data into an element, including custom web components.

* *Have the slot content filled with text or HTML*. 
  
  Slot content is what is inserted between the opening and closing tag of an element. 
  
  Slots can be specified for each individual component but if not specified and a `msg.payload` is provided, that will be used instead. This enables you to have multiple components with the same slot content if desired. The payload is not passed down to sub-components however to prevent unexpected bleed when defining tables, etc.

  Slot content set to `undefined`, `null` or `""` (empty string) is ignored.

* *Specify functions to be called for specific HTML events* (e.g. on click, mouseover, etc). 
  
  Do not include trailing `()` when specifying the function name. This also means that arguments cannot be passed.
  
  Any function names used must be in a context accessible to the uibuilder library. Typically, where the library is loaded as a module, it means that the function must existing in the window (global) context. You may need to specify this in the name (e.g. `window.myfunction`). 
  
  The `uibuilder.eventSend` built-in function can also be specified. This is designed to automatically send `data-*` attributes and custom properties of the element back to Node-RED without any coding required. All of the `data-*` attributes are attached as a collection to the `msg.payload`, all of the custom properties are attached to `msg.props`.

* _Make use of [DOMPurify](https://github.com/cure53/DOMPurify)_. To sanitise `slot` HTML entries.
  
  Feeding HTML into a web page can be a security issue. However, these features absolutely need to do just that. Because you are sending data from Node-RED for the most part, there is a good chance that you have control over the data being sent and therefore the risk should be low. However, if you need/want to reduce the risk further, you can simply load the [DOMPurify](https://github.com/cure53/DOMPurify) library before you load this uibuilder front-end library. If available to the library, it will be automatically used, you don't need to do anything.

  Simply add this to your HTML before you load your uibuilder/index.js file `<script defer src="https://cdn.jsdelivr.net/npm/dompurify@2.3.6/dist/purify.min.js"></script>`. DOMPurify cannot be loaded as an ECMA module. Make sure, therefore that it loads before you load the uibuilder library.

* _Make use of the [Markdown-IT](https://markdown-it.github.io/) library_. To convert Markdown to HTML dynamically.
  
  By loading the `markdown-it` library into your index.html head `<script defer src="https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js"></script>`, uibuilder client will let you specify a `slotMarkdown` in addition to the `slot`. 

  `slotMarkdown` will be rendered into HTML as the element is rendered dynamically. The rendered HTML is inserted after any `slot` HTML.

  Notes
  
  * Little work has been done on this feature as yet so while it works, it does not have all of the highlighting and extra features you might expect from something like Docsify.
  * If available, `DOMPurify` will be used to sanitise the resulting HTML.
  * You can also make use of [HighlightJS](https://highlightjs.org/) to add code highlighting inside the usual back-tick blocks. Add a reference to the library AND an appropriate CSS file in your index.js file.

#### Msg schema

```jsonc
{
    "_ui": {
        // REQUIRED
        "method": "add",

        // Optional. All components will be added to this in order. Ignored if component provides a parent.
        "parent": "html selector",
        
        // List of component instances to add to the page - results in 1 or more HTML custom elements being added.
        "components": [
            {
                // REQUIRED. The reference name of the component (TBD: May need to be Class name rather than the element name. e.g. SyntaxHighlight rather than syntax-highlight)
                "type": "...",

                // Supplying this will make further updates or removals easier. 
                // MUST be unique for the page. MUST be a valid HTML element id.
                // The uibuilder FE library will attempt to create an id if not provided but it will be difficult
                // to do updates if you do not set this.
                "id": "uniqueid",
                
                // Optional. Overrides master parent. If no parent given here or in outer, will be added to <body> element
                "parent": "html selector",
                
                // Optional. HTML to add to slot - if not present, the contents of msg.payload will be used. 
                // This allows multi-components to have their own slot content. 
                // However, the payload is not passed on to sub-components
                "slot": "HTML to <i>add</i> to <sup>slot</sup> instead of <code>msg.payload</code>",

                // Optional. Markdown to add to the slot. Converted Markdown is added after the standard slot.
                "slotMarkdown": "## A heading 2\n\nRendered by **marked** <sub>if loaded</sub>.\n\n```javascript\nvar x = alert('Hey Jim')\n```\n",
                
                // Optional. Each property will be applied to the element attributes
                "attributes": {
                    // Most attributes can be set however not recommended to include `onClick or similar event handlers, 
                    // specify those in the events property below ...
                },

                // Optional. properties to be added to the element. Unlike attributes, these can contain any data.
                // Take care to avoid name clashes with internal properties or bad things are likely to happen!
                "properties": {
                    // ...
                },

                // Optional. DOM Events to be added to the element
                "events": {
                    // Handler functions must already exist and be in a context reachable by the uibuilder library (e.g. window)
                    // This means that functions defined in index.js, if loaded as a module, will NOT be usable.
                    // If dynamically loading a script in the same msg, make sure it is specified first in the components list.
                    // If defining in index.js when loaded as a module, add a single window.xxxx object containing all of your callback fns
                    // All callback functions are passed a single event argument but an undeclared `event` variable is also
                    //   available inside the callback functions.
                    "click": "uibuilder.eventSend"
                    // "click": "window.myCallbacks.buttonClick1"
                }

                // Optional. You can also NEST components which allows you to easily create lists and tables
                // "components": [ ... ]
            }

            // and others as desired. Each will be added in order.
        ]
    }
}
```

#### Example msgs for nested components

```jsonc
{
    "payload": "This was dynamically added 😁",
    "_ui": {
        "method": "add",
        "parent": "#start",
        "components": [
            {
                "type": "ol",
                "parent": "#start",
                "slot": "A list",
                "attributes": {
                    "id": "ol1",
                    "style": "display:block;margin:1em;border:1px solid silver;"
                },
                "components": [
                    {
                        "type": "li",
                        "slot": "A list entry"
                    },
                    {
                        "type": "li",
                        "slot": "Another list entry"
                    }
                ]
            }
        ]
    },
    "topic": "addme"
}
```

```jsonc
{
    "_ui": [
        {
            "method": "add",
            "components": [
                {
                    "type": "table",
                    "parent": "#start",
                    "attributes": {
                        "id": "t1"
                    },
                    "components": [
                        { // heading row
                            "type": "tr",
                            "components": [
                                { "type": "th", "slot": "Col 1" },
                                { "type": "th", "slot": "Col 2" },
                            ]
                        },
                        { // 1st data row
                            "type": "tr",
                            "components": [
                                { "type": "td", "slot": "Cell 1.1" },
                                { "type": "td", "slot": "Cell 1.2" },
                            ]
                        },
                        { // 2nd data row
                            "type": "tr",
                            "components": [
                                { "type": "td", "slot": "Cell 2.1" },
                                { "type": "td", "slot": "Cell 2.2" },
                            ]
                        },
                        { // a friendly caption heading
                            "type": "caption",
                            "slot": "A <b>simple</b> table example"
                        }
                    ]
                }
            ]
        }
    ]
}
```

### Method: remove

The remove method will remove the listed HTML elements from the page assuming they can be found. The search specifier is a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) statement.

```jsonc
{
    "_ui": {
        "method": "remove",

        // List of component instances to remove from the page - use CSS Selector
        // - will remove the 1st match found so specify multiple times to remove more than one of same selector
        "components": [
            "selector1",
            "selector2"
            // and others as desired. Each will be removed in order.
        ]
    }
}
```

### Method: update

The update method will update the referenced HTML elements (whether native HTML, web components or framework components). Most of the same properties as for the `add` method are available for updates.

Obviously, to update something, you must identify it. CSS selectors are used to identify the elements to update.

Unlike the other methods, the update method will find **ALL** matching elements and update them. This means that you could, for example, change the text colour of all list entries on the page with a single update.

#### Msg schema

```jsonc
{
    "_ui": {
        // REQUIRED
        "method": "update",

        // List of component instances to update on the page - results in 1 or more HTML custom elements being selected and updated
        "components": [
            {
                // Only 1 of these three properties will be used to search. 
                // In the order of preference id > name > type

                // The most direct way to select a single element
                "id": "...",
                // The element's name can be used instead of id - note that names may not be unique
                "name": "...",
                // A generic CSS selector can be specified here. e.g. "div" or "p#classname", etc.
                "type": "...",
                
                // Optional. HTML to add to slot - if not present, the contents of msg.payload will be used. 
                // This allows multi-components to have their own slot content. 
                // However, the payload is not passed on to sub-components
                "slot": "HTML to <i>add</i> to <sup>slot</sup> instead of <code>msg.payload</code>",

                // Optional. Markdown to add to the slot. Converted Markdown is added after the standard slot.
                "slotMarkdown": "## A heading 2\n\nRendered by **marked** <sub>if loaded</sub>.\n\n```javascript\nvar x = alert('Hey Jim')\n```\n"
                
                // Optional. Each property will be applied to the element attributes
                "attributes": {
                    // Any attrib can be set but some don't make sense. Be careful when changing the id or name attrib for example.
                    "data-myattrib": "Data driven!"
                    // ... not recommended to include `onClick or similar event handlers, specify those in the events property below ...
                },

                // Optional. properties to be added to/replaced on the element. Unlike attributes, these can contain any data.
                // Take care to avoid name clashes with internal properties or bad things are likely to happen!
                "properties": {
                    // ...
                },

                // Optional. DOM Events to be added to/replaced on the element
                "events": {
                    // Handler functions must already exist and be in a context reachable by the uibuilder library (e.g. window)
                    // This means that functions defined in index.js, if loaded as a module, will NOT be usable.
                    // If dynamically loading a script in the same msg, make sure it is specified first in the components list.
                    // If defining in index.js when loaded as a module, add a single window.xxxx object containing all of your callback fns
                    // All callback functions are passed a single event argument but an undeclared `event` variable is also
                    //   available inside the callback functions.
                    "click": "uibuilder.eventSend"
                    // "click": "window.myCallbacks.buttonClick1"
                }

                // Optional. You can also NEST components which allows you to easily create lists and tables
                // "components": [ ... ]
            }

            // and others as desired. Each will be added in order.
        ]
    }
}
```

### Method: reload - Reloads the current page

No additional data is needed.

Same as sending `msg._uib.reload`. But this method is preferred.

### Method: notify

Overlay a pop-over notification.

Old-style `msg._uib.componentRef = 'globalNotification'` also works. But this method is preferred.

Defaults to auto-timeout.

#### HTML Tags

Will attach to any HTML tag/element with an ID of `toaster`. If one doesn't exist on the page, it will create a `<div id="toaster">` just after the opening `<body>` tag. The `toaster` tag will be given CSS classes of `toaster` and the `variant` if provided in `msg._ui.variant`.

A new `<div id="toast">` element is added to `toaster`.

##### Schema

variant, title/topic, payload/content, autohide, noAutoHide/autohide, autoHideDelay/delay, appendToast, modal

### Method: alert

Overlay an alert notification

Old-style `msg._uib.componentRef = 'globalAlert'` also works. But this method is preferred.

Uses the same schema and styles as the `notify` method. Except that autohide is set to false, modal is set to true and the content is prefixed by an alert symbol.

---

## Troubleshooting

In general, uibuilder is very robust and will rarely give any problems. However, here are a few issues that have been seen in the past.

### Vendor files are not loading

If you are getting 404 errors on your vendor files (such as vue or some other front-end library), it is possible that your source file is in a sub-folder. For example, in many cases you will only have source files in `<uibRoot>/<url>/src`. However, if you try to use files in a sub-folder such as `<uibRoot>/<url>/src/myfolder/index.html`, you will need to adjust the URL references. 

As standard, it is recommended to access files using a relative URL as in `<script type="module" async src="../uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>` but this is incorrect for a file served from a sub-folder. In the previous example, you would need `<script type="module" async src="../../uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>` - note the extra level of `../`. This would need to be added to all relative URL's. 

Alternatively, you can, of course, use absolute URLs such as `<script type="module" async src="http://localhost:1880/uibuilder/vendor/@totallyinformation/web-components/components/syntax-highlight.js"></script>`, however *this isn't recommended* since it can make your code rather fragile. If you make any changes to your Node-RED environment, you might have to make changes to all of your URL's as well.

### Socket.IO refuses to connect

Assuming that the Socket.IO client library has actually loaded (check your browser's dev tools networks tab and make sure it isn't returning a 404 error), this is usually because the library cannot work out the correct path or namespace to use.

This version of the library is much better than previous versions. However, it does rely on your browser allowing first-party cookies.

This version of the library uses a simplified `options` object passed to `uibuilder.start()` should you need to pass either of these settings.

### Socket.IO repeatedly disconnects

This is usually due to you trying to pass too large a message. Socket.IO, by default, only allows messages up to 1Mb. If this is insufficient, you can change the default in `settings.js` using the `uibuilder` property:

```javascript
    // ...
    uibuilder: {
        /** Optional: Socket.IO Server options
         * See https://socket.io/docs/v4/server-options/
         * Note that the `path` property will be ignored, it is set by uibuilder itself.
         * You can set anything else though you might break uibuilder unless you know what you are doing.
         * @type {Object}
         */
        socketOptions: {
            // Make the default buffer larger (default=1MB)
            maxHttpBufferSize: 1e8 // 100 MB
        },
    },
    // ...
```

Other similar issues may occur when using a slow network or one with excessive latency. In that case, you may need to adjust the Socket.IO server's timeout value.

### Event/onChange/onTopic callbacks don't fire

Because a lot of things happen asynchronously in JavaScript, it is possible that occasionally an event handler isn't fully registed by the time that an event fires (for example on an incoming msg or a `uibuilder.set`). In these cases, you may need to put your change code into `window.onload = (evt) => { ... }`. That ensures that everything is fully loaded before your code will run.

An alternative way to work would be to load the uibuilder library using a dynamic import as in `import('./uibuilder.esm.js').then( ... )` and do all of your custom processing from within the `then` callback. If your browser supports top-level async/await, you could also do `const uibuilder = await import('./uibuilder.esm.js')` which will pause until uibuilder is completely loaded and ready.

### The `uibuilder` JavaScript object does not seem to be loaded

Firstly check in your browser's dev tools, network tab, whether the library is actually loaded. See [Where is it?](#where-is-it) for more information.

If it is loaded, you have probably forgotten that, when using ECMA JavaScript Modules, each module script is _isolated_. That means that you need to `include` the uibuilder client in the module script you want to work in.

Alternatively, you may no longer need to work directly with uibuilder client object at all! That is because the client now issues custom messages on the DOM `document` object for all important actions. So if you don't need to send anything back to Node-RED, you can just use those. They will work in other modules and scripts. as in:

```javascript
document.addEventListener('uibuilder:stdMsgReceived', evt => {
    // evt.detail contains the msg received
    console.log('>> (document) EVENT uibuilder:stdMsgReceived >>', evt.detail)
})
```

See [Custom Events](#custom-events) for details.

---

## Technical Reference

### Variables

#### Read/write

* `logLevel` - Sets the current logging level. The default is `2` ('error' and 'warn'). Increase to see more detailed logging.

#### Read only

* `meta` - module metadata (version, type, displayName)
* `clientId` - Client ID set by uibuilder on connect
* `cookies` - The collection of cookies provided by uibuilder
* `ctrlMsg` - Copy of last control msg object received from sever
* `ioConnected` - Is Socket.IO client connected to the server?
* `msg` - Last std msg received from Node-RED
* `msgsSent` - The number of messages sent to server since page load
* `msgsReceived` - The number of messages received from server since page load
* `msgsSentCtrl` - The number of control messages sent to server since page load
* `msgsCtrlReceived` - The number of control messages received from server since page load
* `sentCtrlMsg` - The last control msg object sent via uibuilder.send()
* `sentMsg` - The last std msg object sent via uibuilder.send()
* `serverTimeOffset` - Time offset between browser clock and server clock

### Functions

Functions accessible in user code.

#### `start(options)` - Starts Socket.IO communications with Node-RED

!> In most cases, you no longer need to call this yourself. The client startup is now more robust and should rarely need any help. The exception will be if you are loading a page from an external server instead of from Node-RED.

Unlike the original uibuilder client, this version:

* Rarely needs to be manually called. It should work for all page locations including in sub-folders as long as the client allows cookies.
* Only allows passing of a single options object.
* Allows being called again which will reset the Socket.IO connection and internal msg event handlers.

While multiple properties can be given in the options object, only the following are currently used:

* `ioNamespace` - This is normally calculated for you. However, if using an external server to serve the page, you may need to manually set this. Check the uibuilder node details page in the Node-RED Editor for what this should be set to.
* `ioPath` - As above.
* `loadStylesheet` - (default=true). Set to false if you don't want the uibuilder default stylesheet (`uib-brand.css`) to be loaded if you haven't loaded your own. Checks to see if any stylesheet has already been loaded and if it has, does not load.

#### Message Handling
##### `send`
##### `sendCtrl`
##### `eventSend`

#### Variable Handling
##### `get`
##### `set`
##### `getStore`
##### `setStore`
##### `removeStore`
##### `setPing`

#### UI Handling

These are the new dynamic, configuration-driven UI features. They let you create your UI dynamically from simple data sent to the client.

In addition, internal message handling will recognise standard messages from node-red and process them. So these functions won't always be needed.

##### `loadScriptSrc` - Attach a new remote script to the end of HEAD synchronously
##### `loadScriptTxt` - Attach a new text script to the end of HEAD synchronously
##### `loadui` - Load a dynamic UI from a JSON web reponse

#### Event Handling

##### `onChange` - Register on-change event listeners for uibuilder tracked properties

Returns a reference to the callback so that it can be cancelled if needed.

Uses the `uibuilder:propertyChanged` event internally.

##### `cancelChange` - remove all the onchange listeners for a given property
##### `onTopic` - like onChange but directly listens for a specific topic
##### `cancelTopic` - like cancelChange for for onTopic

#### Other

##### `$` - Simplistic jQuery-like document CSS query selector, returns an HTML Element

##### `setOriginator`
Set the default originator. Set to '' to ignore. Used with uib-sender.

##### `log` - output log messages like the library does

Use as `uibuilder.log(1, 'my:prefix', 'Some text', {some:'optional data'})` which produces:
![Example log output](example-log-output.png)

First argument is the log level (0=Error, 1=Warn, 2=Info, 3=log, 4=debug, 5=trace). If the uibuilder logLevel variable is set to less than the requested level, the output will not be shown. The names can be used instead of the numbers.



### Custom Events

Custom events are all attached to the DOM `document` object. Additional custom data may be added to the `detail` object of the event object.

#### `uibuilder:propertyChanged` - when uibuilder.set is called (externally or internally)

Used internally be the `onChange` function but can also be used directly if preferred.

The new value of the property is provided on the events `detail` object.

#### `uibuilder:stdMsgReceived` - when a non-control msg is received from Node-RED

The message content is provided on the events `detail` object.

#### `uibuilder:msg:topic:${msg.topic}` - when a std msg with a msg.topic prop is received

The message content is provided on the events `detail` object.

#### `uibuilder:msg:_ui` - when a std msg with a msg._ui property is received

The message content is provided on the events `detail` object.

#### `uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}` - output for each action on receipt of a std msg with a msg._ui property

The action details are provided on the events `detail` object.

#### `uibuilder:socket:connected` - when Socket.IO successfully connects to the matching uibuilder node in Node-RED

The connection count is provided on the events `detail` object.

#### `uibuilder:socket:disconnected` - when Socket.IO disconnects from the matching uibuilder node in Node-RED

The disconnect reason is provided on the events `detail` object if available. May be a string or an error object.