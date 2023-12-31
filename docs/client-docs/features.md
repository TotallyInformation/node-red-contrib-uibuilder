---
title: Features of the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: |
  Description of the main features.
created: 2022-06-11 14:15:26
lastUpdated: 2023-10-08 13:39:09
updated: 2023-12-30 17:01:41
---

- [Dynamic, data-driven HTML content](#dynamic-data-driven-html-content)
- [Exposes global uibuilder, uib, $, and $$](#exposes-global-uibuilder-uib--and-)
- [$ and $$ functions](#-and--functions)
- [onChange/cancelChange functions](#onchangecancelchange-functions)
- [onTopic/cancelTopic functions](#ontopiccanceltopic-functions)
- [send function](#send-function)
- [eventSend function](#eventsend-function)
- [uib-var custom HTML tag (include managed variables in the UI)](#uib-var-custom-html-tag-include-managed-variables-in-the-ui)
- [set function (Managed variables)](#set-function-managed-variables)
- [Auto-loading of the uibuilder default stylesheet](#auto-loading-of-the-uibuilder-default-stylesheet)
- [Conditional logging](#conditional-logging)
- [document-level events](#document-level-events)
- [setPing function](#setping-function)
- [Page auto-reload](#page-auto-reload)
- [setStore, getStore, removeStore functions](#setstore-getstore-removestore-functions)
- [Initial connection message now shows whether the page is newly loaded or not](#initial-connection-message-now-shows-whether-the-page-is-newly-loaded-or-not)
- [Stable client identifier](#stable-client-identifier)
- [Number of connections is tracked and sent to server on (re)connect](#number-of-connections-is-tracked-and-sent-to-server-on-reconnect)
- [Client connection/disconnection control messages](#client-connectiondisconnection-control-messages)
- [ui function](#ui-function)
- [Controlling from Node-RED](#controlling-from-node-red)
- [Includes the Socket.IO client library](#includes-the-socketio-client-library)
- [start function (now rarely needed)](#start-function-now-rarely-needed)

## Dynamic, data-driven HTML content

This feature allows you to dynamically create a UI or part of a UI using just configuration information either send in messages from Node-RED or loaded from a JSON file (or a combination of both).

See the [Dynamic, data-driven HTML content](client-docs/config-driven-ui.md) page for details.

## Exposes global uibuilder, uib, $, and $$

For ease of use, both `uibuilder`, `$`, and `$$` objects are added to the global `window` context unless they already exist there. `uib` is a global alias for `uibuilder` for brevity.

## $ and $$ functions

uibuilder adds the global `$` and `$$` functions when loaded if it can (it won't do it if there is a name clash, such as if jQuery has been loaded before uibuilder). This is for convenience.

The `$` function acts in a similar way to the version provided by jQuery and the same as in your browser dev console. It is actually bound to [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) which lets you get a reference to an HTML element using a CSS selector. If multiple elements match the selection, the element returned will be the first one found.

!> Note that this function will only ever return a **single** element which is different to jQuery but the same as the dev console.

Example. With the HTML `<button id="button1">Press me</button>` and the JavaScript `$('#button1').innerHTML = 'boo!'`. The label on the button will change from "Press me" to "Boo!".

The `$$` function is the same as in the browser dev console,  it is a reference to `querySelectorAll`. So it returns an array containing all found DOM elements.

Should either of these globals already be defined, you can still access them as `uibuilder.$` and `uibuilder.$$` (noting that `uib` is also a global alias for `uibuilder` for us lazy folk).

See the [MDN documentation on CSS query selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/Locating_DOM_elements_using_selectors) for details on selecting elements.

## onChange/cancelChange functions

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

## onTopic/cancelTopic functions

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

## send function

The send function sends a message from the browser to the Node-RED server via uibuilder.

```javascript
uibuilder.send({payload:'Hello'})
```

There is an optional second parameter that specifies an originating uib-send node. Where present, it will return a message back to the originating `uib-sender` node. To make use of the sender id, capture it from an incoming message.

## eventSend function

Takes an suitable event object as an argument and returns a message to Node-RED containing the event details along with any data that was included in `data-*` attributes and any custom properties on the source element.

`data-*` attributes are all automatically added as a collection object to `msg.payload`.

The returned msg has an expanded set of data over the old client libraries eventSend function. All of the relevant data other than the payload is under the `msg._ui` property. The data comes from the "target" element which is the HTML element that was the target of the event. E.g. a button element.

msg._ui contains:

* `id`: The element id if it exists.
* `name`: The element's name attribute if it exists.
* `slotText`: The text of the slot if there is any. Max 255 characters.
* `props`: An object of property name/value pairs. Only contains custom properties which can be set when using this library to add/change elements or might be set when using web or other framework component tags. Element properties who's name starts with `_` are excluded since these are assumed to be private.
* `attribs`: List of attributes on the target element (without id, name, class attributes). Excludes id, name and class attributes.
* `classes`: Array of class names applied to the target element when the event fired.
* `event`: The type of event (e.g. "click").
* Key modifiers: `altKey`, `ctrlKey`, `shiftKey`, `metaKey`. Any keyboard modifiers that were present when the event fired.
* `pointerType`: The type of pointer that triggered the event (e.g. "mouse" or "touch")
* `nodeName`: The name of the tag that triggered the event (e.g. "BUTTON"). Note that this may not be the same as the tag in your HTML - for example when using `<b-button>` from bootstrap-vue, the node is still called "BUTTON".
* `clientId`: The uibuilder client ID. This is set in a session cookie for the client browser profile/URL combination for that browser's current session (e.g. changes if the browser closes and reopens but otherwise stays the same).
* `pageName`: The url fragment of the page that contained the event (for multi-page apps).

This function is especially useful for config driven UI's since you can simply send a message with something like:

```json
_ui: {
    "method": "add",
    "parent": "#start",
    "components": [
        {
            "type": "button",
            "parent": "div#container",
            "slot": "Press Me!",
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

### Plain html/javascript example.

In index.html

```html
<button id="button1" data-life="42"></button>
```

In index.js 

```javascript
$('#button1').onclick = (evt) => { uibuilder.eventSend(evt) }
```

Or, using HTML only (note the need to add the event argument):

```html
<button id="button2" onClick="uibuilder.eventSend(event)" data-life="42"></button>
```

### VueJS/bootstrap-vue example

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

Alternatively, you can use the simpler form (noting the use of the `event` argument):

```html
<b-button id="myButton1" @click="uibuilder.eventSend(event)" data-something="hello"></b-button>
```

## uib-var custom HTML tag (include managed variables in the UI)

The `<uib-var>` custom component lets you include a uibuilder managed variable in your web page.

See [Custom Components](client-docs/custom-components) for details.

## set function (Managed variables)

the `uibuilder.set()` function is now more flexible than in `uibuilderfe.js`. You can now set anything that doesn't start with `_` or `#`.

!> Please note that there may be some rough edges still in regard to what should and shouldn't be `set`. Please try to avoid setting an internal variable or function or bad things may happen 😲

This means that you can simulate an incoming message from Node-RED with something like `uibuilder.set('msg', {topic:'uibuilder', payload:42})` in your front-end JavaScript.

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

Note that `uibuilder.get()` will do a one-off get of a managed variable including the client libraries own internal variables and constants.

## Auto-loading of the uibuilder default stylesheet

In previous versions of the front-end library, you had to provide your own CSS code and had to make sure that you imported (or loaded) the uibuilder default stylesheet (`uib-styles.css`).

In this version, if you haven't loaded any other stylesheets, the library will automatically load the new default stylesheet (`uib-brand.css`).

!> Note that using this auto-load feature may result in a flash of an unformatted page before the styles are loaded and applied. So it is still recommended to load the stylesheet manually in the head section of your HTML. That will avoid the unstyled flash.

If you are trying to load the default CSS and can't find the correct URL, try removing the style link from your HTML and check what the client loads in the browsers dev tools network tab.

## Conditional logging

Internal logging is much improved over previous versions of this library. There is now a dedicated internal `log` function which adds colour highlighting to browsers that support it in the dev tools console. That includes all Chromium-based browsers and Firefox.

You can alter the amount of information that the uibuilder library outputs to the console by changing the `logLevel` with `uibuilder.logLevel = 4` where the number should be between 0 and 5. you can set that at any time in your code, however it will generally be most useful set _before_ calling `uibuilder.start()`.

The default level is set to 1 (warn). The levels are: 0 'error', 1 'warn', 2 'info', 3 'log', 4 'debug', 5 'trace'.

Changing the log level outputs an info note to the console telling you what the level is.

The log function is also available to your own code as `uibuilder.log(level, prefix, ...outputs)`.

## document-level events

In previous versions of the library, a custom event feature was used. In this version, we make use of custom DOM events on the `document` global object. DOM events are especially useful when working with ESM modules since module code isolation can prohibit some other forms of cross-module sharing.

Each event name starts with `uibuilder:` to avoid name clashes.

See the [Custom Events](#custom-events) below for details.

The main current events are (other events may be added later):

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

## setPing function

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

## Page auto-reload

By sending a message such as `{_uib:{reload:true}}` from Node-RED, you can make your page reload itself. This is already used by the uibuilder file editor. But you can add a flow in Node-RED that consists of a watch node followed by a set node that will create this message and send it into your uibuilder node. This will get your page to auto-reload when you make changes to the front-end code using an editor such as VSCode. This is what a dev server does in one of the many front-end frameworks that have build steps. You don't need a build step though and you don't need a dev server! 😎

## setStore, getStore, removeStore functions

Stores & retrieves information in the browser's localStorage if allowed. localStorage will survive page reloads as well as tab, window, browser, and machine restarts. However, whether storage is allowed and how much is decided by the browser (the user) and so it may not be available or may be full.

Applies an internal prefix of 'uib_'. Returns `true` if it succeded, otherwise returns `false`. If the data to store is an object or array, it will stringify the data.

Example

```javascript
uibuilder.setStore('fred', 42)
console.log(uibuilder.getStore('fred'))
```

To remove an item from local storage, use `removeStore('fred')`.

## Initial connection message now shows whether the page is newly loaded or not

In previous versions, it was not possible for Node-RED to know whether the client was a freshly loaded page (or a page reload) or whether it was simply reconnecting after a Node-RED restart or lost websocket connection.

Now, the initial control message that is sent out of port #2 of a uibuilder node contains more information about the client. Including the `conections` property that is zero for a new connection or reloaded page. If that number is >0, it indicates that the client has reconnected and still has all of its original context and data.

This is particularly useful as if the number is >0, you don't need to resend any cached data.

```json
{
    "uibuilderCtrl": "client connect",
    "_msgid": "5b76892838dd47e3",
    "_socketId": "k2hSBp3GPzviHfcQAAAk",

    "version": "5.1.0-iife.min",
    "ip": "::ffff:127.0.0.1",
    "clientId": "xeXBgHDfAEdqwy13P6gJY",
    "pageName": "index.html",
    "connections": 0
}
```

As can be seen from the example message above, the source page, client version, client IP address and client id (see below) are also added to the connection message.

This feature is already used in the `uib-cache` node and will be added to other nodes that do caching.

## Stable client identifier

When a new browser connects to a uibuilder endpoint for the first time in a browser session, uibuilder will attempt to provide a new clientID. The uibuilder front-end library stores that ID in session cookie so any future connections from that browser profile to the same server address will reuse the same client id until the browser is restarted. The ID is a random UUID and so should always be unique.

Because the client id is stable, it can be used for things like session management and security checks on the server.

## Number of connections is tracked and sent to server on (re)connect

When the client connects to the Node-RED server over Socket.IO, it sends a message out of port #2 that looks like the following. This has always been the case but now some additional information is included in the msg. The client IP address (`msg.ip`) is added by the server on receipt. The stable client identifier (`msg.clientId`), client version (`msg.version`), and the number of connections (`msg.connections`) are added by the client.

The client increments the `connections` value each time it has to connect or re-connect to the server.

This is useful because the server now knows that if `msg.connections` is zero, this is a new connection not a reconnection. A new connection is when the page is loaded or re-loaded.

This information is also built into the `uib-cache` node from v5.1 to reduce unnecessary sending of the cache.

### Example client connect control msg

```jsonc
{
    "uibuilderCtrl": "client connect",
    "from": "server",
    "_socketId": "D2ynn6nsx7sIQkijAAAF",
    "version": "6.5.0-iife.min",
    "ip": "::ffff:127.0.0.1",
    "clientId": "Vui4PXZvq9T7AVlAumIwD",
    "tabId": "t97382",
    "url": "hp_apcc",
    "pageName": "index.html",
    "urlParams": {
        "foo": "bah",
        "life": "42"
    },
    "connections": 0,
    "lastNavType": "reload",
    "tls": false,
    "connectedTimestamp": "2023-07-05T20:52:18.149Z",
    "referer": "http://127.0.0.1:3001/hp_apcc/?fred=jim&life=42",
    "recovered": false,
    "_msgid": "dc53a764480cfd16"
}
```

## Client connection/disconnection control messages

When a client (a browser tab) connects or disconnects, the uibuilder node outputs a control message from the 2nd output port.

These messages can be used for cache control and for user session management.

The client also receives an initial message from the server.

See [Pre-defined UIBUILDER messages](pre-defined-msgs) for details.

### Client Connect message

```jsonc
{
    "uibuilderCtrl": "client connect",
    "from": "server",
    "_socketId": "D2ynn6nsx7sIQkijAAAF",
    "version": "6.5.0-iife.min",
    "ip": "::ffff:127.0.0.1",
    "clientId": "Vui4PXZvq9T7AVlAumIwD",
    "tabId": "t97382",
    "url": "hp_apcc",
    "pageName": "index.html",
    "urlParams": {
        "foo": "bah",
        "life": "42"
    },
    "connections": 0,
    "lastNavType": "reload",
    "tls": false,
    "connectedTimestamp": "2023-07-05T20:52:18.149Z",
    "referer": "http://127.0.0.1:3001/hp_apcc/?fred=jim&life=42",
    "recovered": false,
    "_msgid": "dc53a764480cfd16"
}
```

### Client Disconnect (and error) message

Unfortunately, due to the asynchronous nature of the Socket.IO client and server, the disconnect message may be output **AFTER** the connection message if the disconnection is momentary such as with a page reload initiated by a user.

```jsonc
{
    "uibuilderCtrl": "client disconnect",
    "reason": "transport close",
    "from": "server",
    "_socketId": "xmfdqRE3gv1MsOnXAAAC",
    "version": "6.5.0-mod1",
    "ip": "::ffff:127.0.0.1",
    "clientId": "Vui4PXZvq9T7AVlAumIwD",
    "tabId": "t97382",
    "url": "hp_apcc",
    "pageName": "index.html",
    "urlParams": {
        "fred": "jim",
        "life": "42"
    },
    "connections": 18,
    "lastNavType": "reload",
    "tls": false,
    "connectedTimestamp": "2023-07-05T20:41:48.541Z",
    "referer": "http://127.0.0.1:3001/hp_apcc/?fred=jim&life=42",
    "recovered": false,
    "_msgid": "cd4702e7ab242b67"
}
```

### Message from server to client

```jsonc
{
    "uibuilderCtrl": "client connect",
    "_socketId": "RV1Zo5NKm2vNOSdsAAA2",
    "from": "server",
    "serverTimestamp": "2022-06-28T17:04:34.491Z",

    // New for v5.1 - the server uibuilder version
    "version": "5.1.0-prerelease"
}
```

Once the client receives this message, it replies with a "ready for content" control message with `msg.cacheControl` set to "REPLAY" so that cache replay can be triggered if required.

## ui function

This new function allows passing the same data as `msg._ui` from within your front-end code. It allows front-end scripts to be able to dynamically generate and update UI's using simple configuration JSON.

See [Dynamic, configuration-driven UI's (low-code)](client-docs/config-driven-ui) for details.

## Controlling from Node-RED

A number of the uibuilder client's functions can be controlled from Node-RED via specially formatted messages. See [Controlling from Node-RED](client-docs/control-from-node-red) for details.

## Includes the Socket.IO client library

There is no longer a need to load this library, which sometimes caused confusion in the past. The correct version of the library is included.

## start function (now rarely needed)

!> You should hardly ever need to manually run this now. Try without first. See the details below.

The start function is what kick-starts the uibuilder front-end library into action. It attempts to make a connection to Node-RED and exchanges the initial control messages.

It:

* Attempts to use some cookie values passed from Node-RED by uibuilder in order to work out how to connect the websocket (actually uses Socket.IO).
* Starts the communications with Node-RED/uibuilder node using Socket.IO. This also issues 1 or more document custom events (see [Event Handling](#event-handling) below).
* An event handler is created for incoming messages from Node-RED. It checks for reload and UI requests and deals with them automatically.
* Automatically loads the default stylesheet if you haven't loaded your own.

Normally, you will not have to pass any options to this function (unlike the equivalent function in the older `uibuilderfe.js` library before uibuilder v5). However, see the troubleshooting section if you are having problems connecting correctly.

If you do need the options, there is now only a single object argument with only two possible properties:

```javascript
uibuilder.start({
    ioNamespace: '/components-html', // Will be the uibuilder instance URL prefixed with a leading /
    ioPath: '/uibuilder/vendor/socket.io', // Actual path may be altered if httpNodeRoot is set in Node-RED settings
})
```

Note that if the Node-RED/uibuilder server is different to the one serving up your html and/or js files (as when using a framework dev server for example), you will need to pass the remote server and uibuilder URL as the ioNamespace: `uibuilder.start({ioNamespace: 'https://remote.server/uib-instance-url'})`

