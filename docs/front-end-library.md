---
title: Working with the uibuilderfe Front-End Library
description: >
   How to work with uibuilder's front-end library in your own UI code.
created: 2021-02-17 14:28:00
lastUpdated: 2021-06-27 17:51:09
---

`uibuildefe.js` is the library that lets you interact with your uibuilder nodes in Node-RED.

It manages the communications and provides a number of helper functions to make life easy.

The detailed documentation for the library is in the [uibuildefe developer documentation](uibuilderfe-js). If you don't find what you need here, please look there.

* [Startup](#startup)
  * [Startup Optional Parameters](#startup-optional-parameters)
  * [Examples](#examples)
  * [Errors](#errors)
* [Events](#events)
  * [Example onChange event handler](#example-onchange-event-handler)
  * [Currently available pre-defined events](#currently-available-pre-defined-events)
* [Variable Handling](#variable-handling)
* [Helper Methods (functions)](#helper-methods-functions)
  * [`autoSendReady` Turn on/off the ready for content control msg](#autosendready-turn-onoff-the-ready-for-content-control-msg)
  * [`debug` Turn on/off debugging console messages](#debug-turn-onoff-debugging-console-messages)
  * [`eventSend` Helper fn to send event data](#eventsend-helper-fn-to-send-event-data)
  * [`get` Get the value of a uibuilder variable](#get-get-the-value-of-a-uibuilder-variable)
  * [`logon` Send a logon (authentication) control request to Node-RED](#logon-send-a-logon-authentication-control-request-to-node-red)
  * [`logoff` Send a logoff control request to Node-RED](#logoff-send-a-logoff-control-request-to-node-red)
  * [`me` Return uibuilder info](#me-return-uibuilder-info)
  * [`msg` Convenience method to access the last standard msg from Node-RED](#msg-convenience-method-to-access-the-last-standard-msg-from-node-red)
  * [`onChange` Subscribe to a uibuilder variable change event](#onchange-subscribe-to-a-uibuilder-variable-change-event)
  * [`send` Send a standard msg to Node-RED](#send-send-a-standard-msg-to-node-red)
  * [`sendCtrl` Send a control msg to Node-RED](#sendctrl-send-a-control-msg-to-node-red)
  * [`set` Set the value of a uibuilder variable, creates subscribable event for changes](#set-set-the-value-of-a-uibuilder-variable-creates-subscribable-event-for-changes)
  * [`showComponentDetails` (VueJS only) Return a control msg contining details of a Vue component](#showcomponentdetails-vuejs-only-return-a-control-msg-contining-details-of-a-vue-component)
  * [`showToast` (VueJS only) Shows a popup message in the UI](#showtoast-vuejs-only-shows-a-popup-message-in-the-ui)
  * [`start` Start up the front-end library](#start-start-up-the-front-end-library)
  * [`uiDebug` Conditional debug output (controlled by debug setting)](#uidebug-conditional-debug-output-controlled-by-debug-setting)

## Startup

In order to use the front-end library for uibuilder, you must call the start function: `uibuilder.start()`.

This should be called once all of the page resources have loaded & the core DOM has rendered.

### Startup Optional Parameters

If initialising this library from a page that is _not in the root folder_ for the uibuilder instance (or indeed is from a different server), the library cannot work out the correct Socket.io path nor the actual root URL and so you have to supply this yourself. e.g.

In addition, if you are using VueJS, you can pass the Vue app instance to the `start` function to allow uibuilder to work some magic such as providing direct access to the toast popups code-free.

#### Parameters

* `namespace` {Object=|string=} Optional. One of:
  
  * Object containing ref to vueApp, 
  * Object containing settings using the property names given here, or 
  * IO Namespace override. Changes self.ioNamespace from the default.
    
    If you are not sure about the correct namespace, use the "Instance Details" button in the uibuilder node configuration panel (in the Node-RED Editor) and search for "ioNamespace" in the resulting page.

    The namespace to use here is that result prefixed with a leading `/`
  
* `ioPath` {string=} Optional. changes self.ioPath from the default

  The ioPath is a combination of:
  
  * A leading `/`,
  * `httpNodeRoot` - normally empty unless you have changed it in `settings.js`
  * "/uibuilder/vendor/socket.io"

* `vueApp` {Object=}  Optional. reference to the VueJS instance

### Examples

```javascript
//    Socket.io  Namespace,   IO path (no httpNodeRoot defined)
uibuilder.start('/uiburl',   '/uibuilder/vendor/socket.io')
```

```javascript
// Just passes the VueJS app object to enable Vue magic functions
uibuilder.start(this)
```

```javascript
// Pass a settings object
uibuilder.start({
    namespace: '/uib',
    ioPath: '/nr/uibuilder/vendor/socket.io', // httpNodeRoot defined as "nr" in settings.js
    vueApp: this
})
```

### Errors

If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages in your browser console, this is the most likely reason.

## Events

uibuilderfe has its own, simple, event handling system. This lets you "subscribe" to an event with a function that is exectuted automatically when the event fires.

Events are created automatically by the internal `self.set` function that is used to update variables. So any internal variable updated this way automatically gets an event named after the variable name. In addition, using `uibuilder.set('varname', newVal)` also creates an event.

Events are subscribed to using the `uibuilder.onChange(evtName, callback)` function. Where the callback is executed whenever anything triggers that event name.

Event processing is highly efficient since nothing actually happens if no `onChange` function has been registered against an event. Multiple `onChange` callbacks can be assigned to an event which is helpful if you have front-end code such as components. In general though, try to minimise the number of `onChange` entries.

Most commonly, the only `onChange` event handler you will define is the one that fires whenever a msg is received from Node-RED:

### Example onChange event handler

The most common event used is when the `msg` variable is updated by an incoming message from Node-RED.

```javascript
uibuilder.onChange('msg', function(msg){
    console.info('msg received from Node-RED server:', msg)
})
```

### Currently available pre-defined events

* `ctrlMsg` - triggered whenever the client receives a control message from the server.
* `ioConnected` - triggered whenever the client connects or disconnects from the server over Socket.IO.
* `isAuthorised` - triggered by successful logon or logoff (on receipt of confirmation from server).
* `msg` - triggered whenever the client receives a standard msg from the server. e.g. you send a msg into the input port of the node.
* `msgsCtrl` - triggered whenever the client receives a control message from the server. NOTE: This is superfluous and may be removed in a future release.
* `msgsReceived` - triggered whenever the client receives a standard msg from the server. Counts the number of messages received. NOTE: This is superfluous and may be removed in a future release.
* `msgsSent` - triggered whenever the client sends a standard message to the server. NOTE: This is superfluous and may be removed in a future release.
* `msgsSentCtrl` - triggered whenever the client sends a control message to the server. NOTE: This is superfluous and may be removed in a future release.
* `sentCtrlMsg` - triggered whenever the client sends a control message to the server.
* `sentMsg` - triggered whenever the client sends a standard message to the server.
* `serverShutdown` - triggered when the Node-RED server sends a shutdown control msg to the client. This happens before Node-RED actually shuts down. No data is returned to the callback in this case.
* `serverTimeOffset` - triggered when the Node-RED server sends the initial connection message to the client.
* `socketError` - triggered if the server sends a socket error to the client. Probably triggered by socket middleware. Returns the error as data to the callback.

## Variable Handling

All public variables must be accessed from your own code using the getter:

```javascript
var myvar = uibuilder.get('varName')
```

All public variables must be changed from your own code using the setter:

```javascript
uibuilder.set('varName',value)
```

You can use the setter to add your own variables to the uibuilder object. These will then have an event handler attached so that you can monitor for changes with `uibuilder.onChange('varName', function(varName) { ... })`

The list of accessible, pre-defined variables is provided on the [uibuildefe-js developer documentation page](uibuilderfe-js?id=public-variables).

## Helper Methods (functions)

uibuilderfe has a number of helper functions that are aimed at making life easier for the author of a web UI.

### `autoSendReady` Turn on/off the ready for content control msg

Turns on/off the "ready for content" control message that is normally sent back to Node-RED on window.load

Set to false early in the processing if you want to get control over when Node-RED sends you data.

### `debug` Turn on/off debugging console messages

Turns on/off debugging. See the output in your browser's developer console.

Example: `uibuilder.debug(true)`

Best used in the `created` section of Vue or similar frameworks.

### `eventSend` Helper fn to send event data

A simple helper function designed to be the target method for DOM events. Typically used for the click event handler for a button.

A msg will be sent back to Node-RED containing some information as shown in the example below

_Vue/bootstrap-vue example_:

In `index.html`

```html
<b-button id="myButton1" @click="doEvent" data-something="hello"></b-button>
```

Note that all `data-xxxx` attributes are 

In `index.js`

```javascript
// ...
methods: {
    doEvent: uibuilder.eventSend,
},
// ...
```

The msg returned to Node-RED will be:

```json
{
    "topic": "", // Optional. Will include the topic from the last inbound msg if it is available

    "uibDomEvent": {
        // The html id attribute. If that doesn't exist, the name attribute
        // is used. If that doesn't exist, the 1st 25 chars of the inner text is used
        "sourceId": "myButton1",
        // The DOM event that triggered the function
        "event": "click",
    },

    // Each `data-xxxx` attribute is added as a property
    // - this may be an empty Object if no data attributes defined
    "payload": {
        "something": "hello"
    }

}
```

### `get` Get the value of a uibuilder variable

Get the value of a variable inside the library.
  
Note that the get function protects private variables preventing easy access. This is not a security function since JavaScript has no mechanism for completely protecting private variables.

### `logon` Send a logon (authentication) control request to Node-RED

Sends a specially formatted control msg back to Node-RED (output port 2 of the node). This is processed internally by uibuilder. A response control msg is sent back that determines whether the logon request was successful. If it was, the `isAuthorised` variable is changed to either true or false.

Example of handling the `isAuthorised` change with VueJS (this goes in the `mounted` section):

```javascript
// If user is logged on/off
uibuilder.onChange('isAuthorised', function(isAuthorised){
    console.info('[indexjs:uibuilder.onChange:isAuthorised] isAuthorised changed. User logged on?:', isAuthorised)
    console.log('authData: ', uibuilder.get('authData'))
    vueApp.isLoggedOn = isAuthorised
})
```

The function **must** be passed the correct data structure. See the [security documentation for details](security).

The authentication data is retained internally to `uibuilderfe` in the `authData` object.

### `logoff` Send a logoff control request to Node-RED

Sends a specially formatted control msg back to Node-RED (output port 2 of the node). This is processed internally by uibuilder. 

A response msg is sent back that determines whether the logoff request was successful. If it was, the `isAuthorised` variable is changed to either true or false.

Once uibuilderfe recieves confirmation that the logoff was successful, it automatically clears the internal `authData` data object.

### `me` Return uibuilder info

Returns the front-end library version as a string unless debugging is turned on. In which case it returns the full `self` object - use with caution.

### `msg` Convenience method to access the last standard msg from Node-RED

A convenience method, returns the current value of the last received standard (not control) message.

### `onChange` Subscribe to a uibuilder variable change event

Subscribe to an event. Has two parameters. The first is the name of the event, the second is a callback function to be triggered when the event is fired.

Example:

```javascript
uibuilder.onChange('msg', function(msg){
    console.info('msg received from Node-RED server:', msg)
})
```

### `send` Send a standard msg to Node-RED

Send a standard message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.

The library will add some standard properties to the message so you only need to add your own data.

### `sendCtrl` Send a control msg to Node-RED

Send a control message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.
  
Note that you shouldn't really need to ever send a control msg since the library takes care of all of that. However, there may be rare occasions when you might want to do something like trigger a cache replay or cache clear.

The library will add some standard properties to the message so you only need to add your own data.

### `set` Set the value of a uibuilder variable, creates subscribable event for changes

Set a variables value inside the library. Also creates an event that can be subscribed to using the `onChange` function.
  
Note that the set function protects private variables and prevents the overwriting of internal function names.

### `showComponentDetails` (VueJS only) Return a control msg contining details of a Vue component

This sends a control msg back to Node-RED containing details of a specified VueJS Component.

See the [Working with Vue Components](vue-component-handling) documentation page for details.

Note that to use this, you **must** have an instance of the component in your HTML and that **must** have a `ref` attributed on it.

Note that you can trigger this automatically (without front-end code) by sending a msg from Node-RED in the form:

```
{
    "_uib": {
        "requestDetails": true,
        "componentRef": "tabOne",
        "options": {}
    }
}
```

The returned control message to Node-RED looks like:

```
{
    "uibuilderCtrl":"vue component details",
    "componentDetails": {
        "ref":"tabOne",
        "tag":"b-tab",
        "props": [
            "id","active","buttonId","disabled","lazy",
            "noBody","tag","title","titleItemClass",
            "titleLinkAttributes","titleLinkClass"
        ]
    },
    "topic":"uibuilder",
    "from":"client",
    "_socketId":"/extras#mw2GKTo7sLTn9Q-AAAAH",
    "_msgid":"ed7d78ba.ecfe88"
}
```

### `showToast` (VueJS only) Shows a popup message in the UI

Creates a popup message (a "Toast") that overlays your web UI.

See the [Working with Vue Components](vue-component-handling) documentation page for details.

Note that you can trigger this automatically (without front-end code) by sending a msg from Node-RED in the form:

```
{
    "_uib": {
        // This can actually be anything, if it doesn't exist, 
        // the toast will appear in the default location
        "componentRef": "globalNotification",
        // Note that most if not all of these are optional, 
        // they correspond to bootstrap-vue's b-toast props
        "options": {
            "title": "This is the <i>title</i>",
            "content": "This is content <span style=\"color:red;\">in addition to</span> the payload",
            "append": true,
            "autoHideDelay": 1500,
            "variant": "info",
            "solid": true,
            "href": "https://bbc.co.uk",
            "toaster": "b-toaster-top-center",
            "noAutoHide": true
        }
    }
}
```

### `start` Start up the front-end library

Start the uibuilderfe library. See the [Startup section](#startup) for details.

This is not automatic because if it were, it would not be possible to use this library with web pages that are not in the root URL folder. For example, if you have a uibuilder instance with a URL set to `myui`, your source code folder is probably in `~/.node-red/uibuilder/myui/src`. HTML files in that folder will be able to start uibuilderfe with a simple `uibuilder.start()`. But if you create a sub-folder, say `utils`, any HTML file there will pick up the wrong settings for the websocket connection and will need the override parameters in the start function.

Similarly, it is even possible to serve a uibuilderfe page from a different web server alltogether. In this case you would also need to specify the websocket connection parameters.

### `uiDebug` Conditional debug output (controlled by debug setting)

A convenience method for conditionally outputting debug messages to the browser console.

Two arguments, the first being the `type` which is one of log, error, info, or dir
The second being the data to show.

If uibuilder.debug is set to false, nothing will be output.
