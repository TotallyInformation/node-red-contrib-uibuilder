---
title: Variables used in the modern client
description: >
   Details about the variables used in the uibuilder modern front-end client library.
   Some variables are available to your own custom code and some are hidden inside the `uibuilder` client object.
created: 2023-01-28 15:56:57
lastUpdated: 2023-01-28 15:57:02
---

## Read/write

Always use `uibuilder.set('varname', value)` to change these.

* `topic` - Sets a default `msg.topic` that will be added to all outbound messages if nothing takes preference.

* `logLevel` - Sets the current logging level. The default is `2` ('error' and 'warn'). Increase to see more detailed logging.
  
  NOTE: This is one of the few properties it is safe to change directly `uibuilder.logLevel = 5`. That is because it has a dedicated getter and setter in the Class.

* `originator` - Set to the node ID of a `uib-sender` node if you want any sent messages (back to Node-RED) to only go to that node. Normally, you would not set this manually but rather rely on the library to set it for you when it recieves a msg from a sender node. However, you might want to save and reconstitue it if you need to send general messages before returning a message to the sender node.
  
  NOTE: It is preferable to set this via the specific function `uibuilder.setOriginator(...)`.

## Read only

Always use `uibuilder.get('varname', value)` to obtain the value of these. You can also use `uibuilder.onChange('varname', (val)=>{})` to watch for changes to them. Or you can also use the custom `document` event `uibuilder:propertyChanged` if you really want to.

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

In addition, `uibuilder.logLevel` will automatically be retrieved via its own getter, use as `console.log(uibuilder.logLevel)`.

## Read only - unlikely to be required

* `httpNodeRoot` - The setting from Node-RED. May be useful if you need to manually create a Node-RED URL and have set this variable in Node-RED.
