# Developer Documentation for `uibuilderfe.js`

This is the front-end library. It provides socket.io connectivity, simplified message handling and a simple event handler for monitoring for new messages.

## ToC
* [Developer Documentation for `uibuilderfe.js`](#developer-documentation-for-uibuilderfejs)
  * [ToC](#toc)
  * [Startup](#startup)
    * [Startup Optional Parameters](#startup-optional-parameters)
    * [Parameters](#parameters)
    * [Examples](#examples)
    * [Errors](#errors)
  * [Events](#events)
    * [Example onChange event handler](#example-onchange-event-handler)
    * [Currently available pre-defined events](#currently-available-pre-defined-events)
  * [Variable Handling](#variable-handling)
  * [Public Variables](#public-variables)
    * [Externally Writable (via .set method, read via .get method)](#externally-writable-via-set-method-read-via-get-method)
    * [Externally read-only (via .get method)](#externally-read-only-via-get-method)
  * [Private Variables](#private-variables)
  * [Public Methods](#public-methods)
    * [autoSendReady](#autosendready)
    * [debug](#debug)
    * [eventSend](#eventsend)
    * [get](#get)
    * [logon](#logon)
    * [logoff](#logoff)
    * [me](#me)
    * [msg](#msg)
    * [onChange](#onchange)
    * [send](#send)
    * [sendCtrl](#sendctrl)
    * [set](#set)
    * [showComponentDetails](#showcomponentdetails)
    * [showToast](#showtoast)
    * [start](#start)
    * [uiDebug](#uidebug)
  * [Private Methods](#private-methods)

## Startup

In order to use the front-end library for uibuilder, you must call the start function: `uibuilder.start()`.

This should be called once all of the page resources have loaded & the core DOM has rendered.

### Startup Optional Parameters

If initialising this library from a page that is _not in the root folder_ for the uibuilder instance (or indeed is from a different server), the library cannot work out the correct Socket.io path nor the actual root URL and so you have to supply this yourself. e.g.

In addition, if you are using VueJS, you can pass the Vue app instance to the `start` function to allow uibuilder to work some magic such as providing direct access to the toast popups code-free.

### Parameters

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

Internally to the library, all variable access should be via `self.get()` and `self.set()`. This is to ensure that the event system is triggered when setting.

## Public Variables

### Externally Writable (via .set method, read via .get method)

* `allowScript`  {boolean} [true] Allow incoming msg to contain msg.script with JavaScript that will be automatically executed
* `allowStyle`  {boolean} [true] Allow incoming msg to contain msg.style with CSS that will be automatically executed
* `removeScript` {boolean} [true] Delete msg.code after inserting to DOM if it exists on incoming msg
* `removeStyle`  {boolean} [true] Delete msg.style after inserting to DOM if it exists on incoming msg
* `autoSendReady` {boolean} [true] If true, a REPLAY control message is sent once the client receives a "client connected" control message from the server.

### Externally read-only (via .get method)

It is very rare, if ever, that you will need to manually `get` any of these. It is better to use an `onChange` function that fires whenever they change.

* `ctrlMsg` {Object} Copy of last control msg object received from sever

* `debug` {boolean} [false] Do not set directly.  Set using `uibuilder.debug(true/false)`. Query using `uibuilder.debug()`.

* `ioConnected` {boolean} [false]

* `moduleName` {string} ['uibuilder'] The module name in use, `uibuilder`. Must match the module name in use on the server node.

* `msg` {Object} Copy of the last standard message received from the server

* `msgsCtrl` {integer} Track number of control messages received from server since page load

* `msgsCtrlSent` {integer} Number of control messages sent to server since page load

* `msgsReceived` {integer} Number of messages received from server since page load

* `msgsSent` {integer} Number of messages sent to server since page load

* `sentCtrlMsg` {Object} Copy of the last control message sent via `uibuilder.send()`

* `sentMsg` {Object} Copy of last standard msg object sent via `uibuilder.send()`

* `serverTimeOffset` {null|number} [null] Difference in hours between the Node-RED servers time and the browser time. Useful if you need to process date/time values from the server. The uibuilder node sends a timestamp in control messages so just reloading the page will force an update.

* `version` {string} The version number of the uibuilderfe library.

These are unlikely to be needed externally but can be accessed:

* `ioChannels` [{control: 'uiBuilderControl', client:'uiBuilderClient', server:'uiBuilder' }]
* `ioNamespace` [calculated] The socket.io namespace. Must match that of the node instance you want to talk to. Tries to calculate automatically based on the hosting web pages URL. However, can be overridden using the options object in `uibuilder.start()`
* `ioTransport` [['polling', 'websocket']]
* `loaded` {boolean} Are all browser resources loaded?
* `retryFactor` [1.5] Starting delay factor for subsequent reconnect attempts
* `retryMs` [2000] Starting retry ms period for manual socket reconnections workaround
* `timerid` [null] Holder for the socket reconnection timer

## Private Variables

These are only accessible from within the library.

* `events` Holds an array of event callbacks for the event management system

## Public Methods

These are are available from user code via `uibuilder.xxxx()`. Many also have private equivalents.

### autoSendReady
### debug

Turns on/off debugging. See the output in your browser's developer console.

Example: `uibuilder.debug(true)`

Best used in the `created` section of Vue or similar frameworks.

### eventSend

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

```jsonc
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

### get

`get` - get the value of a variable inside the library.
  
  Note that the get function protects private variables preventing easy access. This is not a security function since JavaScript has no mechanism for completely protecting private variables.

### logon
### logoff
### me

Returns the front-end library version as a string unless debugging is turned on. In which case it returns the full `self` object - use with caution.

### msg

`msg` - a convenience method, returns the current value of the last received standard (not control) message.

### onChange

`onChange` - Subscribe to an event. Has two parameters. The first is the name of the event, the second is a callback function to be triggered when the event is fired.

### send

`send` - send a standard message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.

The library will add some standard properties to the message so you only need to add your own data.

### sendCtrl

`sendCtrl` - send a control message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.
  
Note that you shouldn't really need to ever send a control msg since the library takes care of all of that. However, there may be rare occasions when you might want to do something like trigger a cache replay or cache clear.

The library will add some standard properties to the message so you only need to add your own data.

### set

`set` - set a variable inside the library. Also creates an event that can be subscribed to.
  
Note that the set function protects private variables and prevents the overwriting of internal function names.

### showComponentDetails
### showToast
### start
### uiDebug

## Private Methods

These are not available to users via `uibuilder.xxxx()`. They can only be accessed from within the library. They are included here for library developers only.

* `checkConnect` Checks whether socket.io is connected to the socket server. If not, waits for a period and tries again. The wait period is controlled by 2 variables: `retryMs` and `retryFactor`. The wait period extends by the `retryFactor` for each attempt.

* `emit` Trigger an event

* `ioSetup` Sets up the Socket.io connection - called from the `start` public method. This allows user code to correct the auto-calculated socket.io namespace and path if the containing page is in a sub-folder or even on a different server.

* `me`

* `newScript` Handle incoming script attached to a message from Node-RED. Inserts to the DOM dynamically at the end of the `<body>`.

* `newStyle` Handle incoming styles (CSS) attached to a message from Node-RED. Inserts to the DOM dynamically at the end of the `<head>`.

* `send` Send a message back to the Node-RED server.

* `set` Set any internal variable. Also updates the event system.

* `setIOnamespace` Attempt to work out the correct socket.io namespace based on the current URL. Only works if the containing HTML page is in the root URI for the uibuilder instance. Otherwise, you have to override this manually - see the `start` public variable.

* `uiDebug` Controllable console output. If the debug variable is true, this will output to console.

* `uiReturn` Defines a set of callback style functions that are made available as external methods. See [Public Methods](#public-methods) above.
