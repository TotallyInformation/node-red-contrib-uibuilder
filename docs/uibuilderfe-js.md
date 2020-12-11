# Developer Documentation for `uibuilderfe.js`

This is the front-end library. It provides socket.io connectivity, simplified message handling and a simple event handler for monitoring for new messages.

## Startup

In order to use the front-end library for uibuilder, you must call the start function: `uibuilder.start()`.

This should be called once all of the page resources have loaded & the core DOM has rendered.

If initialising this library from a page that is _not in the root folder_ for the uibuilder instance (or indeed is from a different server), the library cannot work out the correct Socket.io path nor the actual root URL and so you have to supply this yourself. e.g.

```javascript
//    Socket.io  Namespace,   IO path   
uibuilder.start('/nr/uib',   '/nr/uibuilder/vendor/socket.io')
```

If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages in your browser console, this is the most likely reason.

* @param {String} namespace - is always the url parameter defined in the Editor for this instance of uibuilder
* @param {String} sioClientPath - is always '/uibuilder/vendor/socket.io' unless `httpNodeRoot` is defined in settings.js and then you need to add that as a prefix.

## Events

uibuilderfe has its own, simple, event handling system. This lets you "subscribe" to an event with a function that is exectuted automatically when the event fires.

Events are created automatically by the internal `self.set` function that is used to update variables. So any internal variable updated this way automatically gets an event named after the variable name. In addition, using `uibuilder.set('varname', newVal)` also creates an event.

Events are subscribed to using the `uibuilder.onChange(evtName, callback)` function. Where the callback is executed whenever anything triggers that event name.

Event processing is highly efficient since nothing actually happens if no `onchange` function has been registered against an event. Multiple `onChange` callbacks can be assigned to an event which is helpful if you have front-end code such as components. In general though, try to minimise the number of `onChange` entries.

### Example use

The most common event used is when the `msg` variable is updated by an incoming message from Node-RED.

```javascript
uibuilder.onChange('msg', function(msg){
    console.info('msg received from Node-RED server:', msg)
})
```

### Currently available events

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

* `set` - set a variable inside the library. Also creates an event that can be subscribed to.
  
  Note that the set function protects private variables and prevents the overwriting of internal function names.

* `get` - get the value of a variable inside the library.
  
  Note that the get function protects private variables preventing easy access. This is not a security function since JavaScript has no mechanism for completely protecting private variables.

* `onChange` - Subscribe to an event. Has two parameters. The first is the name of the event, the second is a callback function to be triggered when the event is fired.
  
* `msg` - a convenience method, returns the current value of the last received standard (not control) message.
  
* `send` - send a standard message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.

  The library will add some standard properties to the message so you only need to add your own data.
  
* `sendCtrl` - send a control message back to Node-RED. Requires an object as its single parameter. The object is the msg object to be sent.
  
  Note that you shouldn't really need to ever send a control msg since the library takes care of all of that. However, there may be rare occasions when you might want to do something like trigger a cache replay or cache clear.

  The library will add some standard properties to the message so you only need to add your own data.

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
