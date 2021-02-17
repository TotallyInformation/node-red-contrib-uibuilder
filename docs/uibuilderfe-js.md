# Developer documentation for the `uibuilderfe.js` library

This is the uibuilder front-end library. It provides socket.io connectivity, simplified message handling and a simple event handler for monitoring for new messages.

For user documentation, please refer to the [Working with the uibuilderfe Library](front-end-library) page.

## ToC
* [Developer documentation for the `uibuilderfe.js` library](#developer-documentation-for-the-uibuilderfejs-library)
  * [ToC](#toc)
  * [Startup](#startup)
  * [Events](#events)
  * [Variable Handling](#variable-handling)
  * [Public Variables](#public-variables)
    * [Externally Writable (via .set method, read via .get method)](#externally-writable-via-set-method-read-via-get-method)
    * [Externally read-only (via .get method)](#externally-read-only-via-get-method)
  * [Private Variables](#private-variables)
  * [Public Methods](#public-methods)
  * [Private Methods](#private-methods)

## Startup

In order to use the front-end library for uibuilder, you must call the start function: `uibuilder.start()`.

Details are on the [Working with uibuilderfe](front-end-library) page.

## Events

uibuilderfe has its own, simple, event handling system. This lets you "subscribe" to an event with an `onChange` function that is executed automatically when the event fires.

The publicly available events are listed on the [Working with uibuilderfe](front-end-library) page.

## Variable Handling

All public variables must be accessed from front-end code using the `get` function.

All public variables must be changed from front-end code using the `set` function.

Internally to the library, all variable access should be via `self.get()` and `self.set()`. This is to ensure that the event system is triggered when setting.

## Public Variables

### Externally Writable (via .set method, read via .get method)

* `allowScript`  {boolean} [true] Allow incoming msg to contain msg.script with JavaScript that will be automatically executed
* `allowStyle`  {boolean} [true] Allow incoming msg to contain msg.style with CSS that will be automatically executed
* `removeScript` {boolean} [true] Delete msg.code after inserting to DOM if it exists on incoming msg
* `removeStyle`  {boolean} [true] Delete msg.style after inserting to DOM if it exists on incoming msg
* `autoSendReady` {boolean} [true] If true, a REPLAY control message is sent once the client receives a "client connected" control message from the server.

### Externally read-only (via .get method)

It is very rare, if ever, that you will need to manually `get` any of these apart from `authData`. It is better to use an `onChange` function that fires whenever they change.

* `authData` {Object} Standard object containing details of the (to be) authorised user id. uibuilder may add metadata to this object on logon. For example, an expiry timestamp or message-of-the-day

* `ctrlMsg` {Object} Copy of last control msg object received from sever

* `debug` {boolean} [false] Do not set directly.  Set using `uibuilder.debug(true/false)`. Query using `uibuilder.debug()`.

* `ioConnected` {boolean} [false] Whether or not Socket.IO is connected to Node-RED so that messages can be exchanged.
  
* `isAuthorised` {boolean} [false] Whether or not the client has been authenticated and authorised to send/receive data.

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

The public methods are detailed on the [Working with uibuilderfe](front-end-library?id=helper-methods-functions) page.

Note for `get` and `set` methods. These functions protect private variables and prevent the overwriting of internal function names.

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
