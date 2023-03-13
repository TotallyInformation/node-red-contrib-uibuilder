---
title: Pre-defined uibuilder messages
description: >
   Documents the different types of uibuilder messages between a Node-RED uibuilder node and a uibuilder front-end.
created: 2020-09-24 18:14:00
lastUpdated: 2022-06-18 17:17:42
---

- [Message types](#message-types)
  - [Control message overview](#control-message-overview)
- [Standard msg properties used by uibuilder](#standard-msg-properties-used-by-uibuilder)
  - [msg.\_ui `{Object}` (uibuilder v5.1+)](#msg_ui-object-uibuilder-v51)
  - [msg.\_uib `{Object}` (uibuilder v3+)](#msg_uib-object-uibuilder-v3)
  - [msg.uibDomEvent `{Object}` (uibuilder v3.2+, PARTIALLY REPLACED WITH msg.\_ui in v5.1)](#msguibdomevent-object-uibuilder-v32-partially-replaced-with-msg_ui-in-v51)
  - [msg.script `{String}` (PARTIALLY DEPRECATED IN v5.1)](#msgscript-string-partially-deprecated-in-v51)
  - [msg.style `{String}` (PARTIALLY DEPRECATED IN v5.1)](#msgstyle-string-partially-deprecated-in-v51)
  - [msg.\_auth `{Object}` (~~uibuilder v3+~~ DEPRECATED IN v5.0)](#msg_auth-object-uibuilder-v3-deprecated-in-v50)
- [Messages out of uibuilder's 2nd output port](#messages-out-of-uibuilders-2nd-output-port)
  - [On client (re)connection](#on-client-reconnection)
  - [On client disconnection](#on-client-disconnection)
- [Messages from Node-RED uibuilder node to the front-end (browser)](#messages-from-node-red-uibuilder-node-to-the-front-end-browser)
  - [Client (re)Connection (Control Message)](#client-reconnection-control-message)
  - [Errors](#errors)
  - [UI Notification \[Toast\] (Control Message, PARTIALLY DEPRECATED in v5.1)](#ui-notification-toast-control-message-partially-deprecated-in-v51)
    - [Simple version](#simple-version)
    - [More complex example](#more-complex-example)
  - [Browser client reload page](#browser-client-reload-page)
    - [Msg Schema](#msg-schema)
- [Messages From the front-end (browser) to the Node-RED uibuilder node](#messages-from-the-front-end-browser-to-the-node-red-uibuilder-node)
  - [Client Ready for Content (Control Message)](#client-ready-for-content-control-message)
  - [DOM Event (standard message from eventSend function. PARTIALLY DEPRECATED IN v5.1)](#dom-event-standard-message-from-eventsend-function-partially-deprecated-in-v51)
- [Messages From either Node-RED or the client](#messages-from-either-node-red-or-the-client)
  - [Clear Cache (Control Message)](#clear-cache-control-message)

## Message types

uibuilder has three general types of pre-defined message. 

- Input UI configuration messages 
  
  Input messages containing a `msg._ui` property are pre-processed by the client's UI building functions and will "hydrate" the configuration data into HTML that is inserted into the browsers DOM (e.g. it updates the UI).

  Such messages do not trigger the `onChange('msg', ...)` or `onTopic(topic, ...)` functions.

- Input command messages

  Input messages containing a `msg._uib` property are pre-processed by the client's command handler. This lets you control the client and change its settings from Node-RED.

  Such messages do not trigger the `onChange('msg', ...)` or `onTopic(topic, ...)` functions.
  
- Output control messages

  A number of standard control messages may be output from the lower output port of the uibuilder node. These may be informational, control caching, notify of errors

It also has some standard message property names that are used throughout. These are described in the [next section below](#standard-msg-properties-used-by-uibuilder).

### Control message overview

This is a list of the possible control messages. They are described in more detail in the following sections of this page.

Created by the uibuilder node:

- "client connect" - When a new client connects or an existing client reloads the page or reconnects after a temporary disconnect. Contains a counter that allows discrimination between a new connection and a reconnection.
- "client disconnect" - When an existing client disconnects or goes away.
- "socket error" - when Socket.IO receives information that a client connection is in error.
- "shutdown" - from server to client when Node-RED is shutting down. (Not well tested).

Send by the uibuilder client library to the uibuilder node:

- "cache control" - the client manually instructing a connected `uib-cache` node to either clear or replay its cache. Clear will impact all connected clients. Replay will only update the requestor.
- "client log message" - a client can send a log message that is processed by the server. Initial implementation in v6.1, will be enhanced in future versions.
- "visibility" - the client informs the server when the currently loaded page becomes visible or hidden.

## Standard msg properties used by uibuilder

### msg._ui `{Object}` (uibuilder v5.1+)

The contents of this property are used by the uibuilder front-end client library (only by the new ES Module version `uibuiler.esm.js` at the time of writing) to dynamically create or change a web page UI.

The property name `_ui` was deliberately chosen because it does not need to be uibuilder specific, other nodes might also use the same feature as might other front-end libraries.

The dynamic ui features are very powerful but extremely simple to use and they work (via the uibuilder client library) with _any_ or no framework in the standard uibuilder style.

You can use the feature with standard HTML tags or tags from any other framework and from web components.

Please see the [documentation for the new client library](uibuilder.module.md) for details.

### msg._uib `{Object}` (uibuilder v3+)

Used by the [Browser client reload page](#browser-client-reload-page), [showToast](#vuejs-ui-notification-toast-control-message) and [showComponentDetails](./vue-component-handling?id=discover-a-vue-components-capabilities) functions and their equivalent messages from Node-RED.

Should be used in the future for any other standardised uibuilder-specific interactions with the client libraries.

### msg.uibDomEvent `{Object}` (uibuilder v3.2+, PARTIALLY REPLACED WITH msg._ui in v5.1)

Used by the [eventSend](front-end-library?id=eventsend-helper-fn-to-send-event-data) function.

Replaced with the new `msg._ui` features in v5.1 with the ESM client library. The new version provides much more information back from the client browser. It is also standardised with the rest of the config-driven UI features.

### msg.script `{String}` (PARTIALLY DEPRECATED IN v5.1)

Only used if the "Scripts?" flag is set in uibuilder's Advanced Settings.

Text must be valid JavaScript and will be dynamically added to the client page DOM.

**WARNING** No checking is done and this could be quite dangerous.

From v5.1, if using the new ESM client library, this property is no longer respected. Please use the new `msg._ui` features with the `load` mode.

### msg.style `{String}` (PARTIALLY DEPRECATED IN v5.1)

Only used if the "Styles?" flag is set in uibuilder's Advanced Settings.

Text must be valid CSS and will be dynamically added to the client page DOM.

**WARNING** No checking is done and this could be quite dangerous.

From v5.1, if using the new ESM client library, this property is no longer respected. Please use the new `msg._ui` features with the `load` mode.

### msg._auth `{Object}` (~~uibuilder v3+~~ DEPRECATED IN v5.0)

The intent of this property is to have a unified data exchange between Node-RED and the client browser. It should facilitate authentication and authorisation activities.

The built-in uibuilder security features were removed in v5 since they were seriously hampering development without resolving to a stable, workable solution.

It is possible and even likely that this will re-appear in a future release.


## Messages out of uibuilder's 2nd output port

These messages are all control messages. They let your flows know whether a client as (re)connected, disconnected, had an error, etc. They are used to control cache replays and clears.

### On client (re)connection

Note that a similar version of this same msg goes to the client as the initial connection from the server

```jsonc
{
    "uibuilderCtrl": "client connect",  // control message type
    "from": "server",                   // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB", // Socket.IO client id (changes on reconnection)
    "_msgid": "8d4307ce.d5e428",        // Node-RED internal msg id
    
    // These are new as of v5.1
    "clientId":"nqfzLy4SXju3hPRVD3UMq", // The stable client ID
    "ip":"::ffff:127.0.0.1",            // The client IP address
    "connections":0,                    // How many times the client connected since the last page load
    "srcPage": "pagename",              // To allow page-specific cache and processing

    // DEPRECATED properties
    //"cacheControl": "REPLAY",         // Redundant - REMOVED as of v5.1
}
```

### On client disconnection

May be from the client reloading the page or some other reason.

Note that the disconnction message may be output AFTER the reconnection message. This is down to Socket.io and not under our control.

```jsonc
{
    "uibuilderCtrl":"client disconnect",
    "reason":"transport close",
    "_socketId":"__AhN_nRVgxMSdeHAAAC",
    "from":"server",
    "ip":"::ffff:127.0.0.1",
    "clientId":"nqfzLy4SXju3hPRVD3UMq",
    "_msgid":"d97ca68d19541dac"
}
```

## Messages from Node-RED uibuilder node to the front-end (browser)

In addition to these messages, see also the [VueJS component handling page](./vue-component-handling).

### Client (re)Connection (Control Message)

Is sent from Node-RED by uibuilder to the client whenever a new client connects or
when an existing client re-connects (by reloading their page).

Note that, as of uibuilder v5.1, the REPLAY cacheControl is no longer included in the "client connect" message. The `uib-cache` node has been updated accordingly. The replay message still works but is removed from this since other properties needed to be added.

Note also that this is very similar to the message that is output from uibuider's output port #2 on connection. This is the version that goes to the client though and so has slightly different properties.

```jsonc
{
    "uibuilderCtrl": "client connect",  // control message type
    "serverTimestamp": "2020-09-24T12:56:13.125Z",  // Can be used in client to work out their timezone or at least time offset from the server
    "from": "server",                   // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // ID of client (from Socket.IO)
    "_msgid": "8d4307ce.d5e428",        // Node-RED internal msg id
    
    // These are new as of v5.1
    "version":"5.0.3-dev",              // The Server version

    // DEPRECATED properties
    //"cacheControl": "REPLAY",         // Redundant - REMOVED as of v5.1
    //"security": false,                // No longer in use - REMOVED as of v5.0
}
```

### Errors

On an untrapped Socket.IO error, uibuilder attempts to let the client(s) know that something has happened. uibuilder sends a
control msg to the client(s) such as the following example.

```json
{
    "uibuilderCtrl": "socket error",
    "error": "Oops! Some kind of error happened",
    "_socketId": "I02mCJZ1oKGGYiK8AAAu",
    "from": "server"
}
```

If an error is raised in `<uibRoot>/.config/sioUse.js` for example, this kind of message might be sent. See the default template for that file for an example.

See the [Developer documentation for `socket.js`](socket-js.md) for more information.


### UI Notification [Toast] (Control Message, PARTIALLY DEPRECATED in v5.1)

Sending this message (uibuilder v3+) to the client will pop-over a dynamic message to the user in the browser. No code is required at the front-end.

Prior to v5, this required VueJS and bootstrap-vue. If these are available, then bootstrap-vue's toast component will be used.

From v5, this works without VueJS as well. Just make sure that you include the default uibuilder stylesheet by putting `@import url("./uib-styles.css");` at the start of your `index.css` file. The toast will appear overlaid on all other content. Clicking on a notification will clear that one. Clicking on the background will clear all notifications.

!> From v5.1 but only if using the new ESM version of the client library, this is replaced by the standardised `msg._ui` features detailed elsewhere.

#### Simple version

This would send a notification to all connected clients. May be injected to a uibuilder node.

```json
{
    "_uib": {  // Required. VueJS Component data
        "componentRef": "globalNotification", // Required.
    },
    "payload": "This is a notification from Node-RED!", // Optional. Will be added to the notification message (content). May be HTML.       
}
```

#### More complex example

Note: `BV` means `bootstrap-vue`

```json
{
    "_uib": {  // Required. VueJS Component data    
        "componentRef": "globalNotification", // Required.
        // options object is optional. Options are passed directly to the bootstra-vue `<toast>` component.
        // These are examples only.
        "options": { // all of the entries are optional.
            // Creates a title section above the content that is highlighted
            "title": "This is the <i>title</i>",
            // Main message content (appears after any payload). May contain HTML.
            "content": "This is content <span style=\"color:red;\">in addition to</span> the payload",
            // Default false. If true stops auto-Hide. 
            // Click on the close button (BV) to remove the toast.
            // For non-BV, click on box to clear it or on background to clear all.
            "noAutoHide": true,
            // 5000 by default, how long the message stays on-screen. Hover over message to pause countdown.
            "autoHideDelay": 1500,
            // Optional colour variant. error, warning, info, primary, secondary, success
            "variant": "info",
            // Default display is semi-transparent (BV only), set this to true to make the message solid colour.
            "solid": true,

            // BV Only. New message appears above old by default (false), change to true to add to the bottom instead.
            "append": true,
            // BV Only. If present, the whole message is turned into a link. Click takes the client to the URL.
            "href": "https://bbc.co.uk",
            // BV Only. Controls where on the page the toast appears. Several standard locations are available.
            // default is top-right. Custom positions can be set by including a <toaster> element in your HTML.
            "toaster": "b-toaster-top-center",
            // For BV, more options are available. @see https://bootstrap-vue.org/docs/components/toast
        },
    },

    // Optional. Will be added to the notification message (content). May be HTML.
    "payload": "<any>",

    // Optional. ID of client (from Socket.IO) - msg would only be sent to this client.
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",
}
```

### Browser client reload page

Sending this message (uibuilder v3.3+) to the client will cause the client to reload the page.

#### Msg Schema

```json
{
    "_uib": {  // Required. VueJS Component data
        "reload": true, // Required.
    }
    // Everything else is ignored       
}
```

Note that, as of v5.1 with the ESM client library, this can also be achieved using the standardised `msg._ui` features.

## Messages From the front-end (browser) to the Node-RED uibuilder node

Note that, if responding to a control msg (sending back to uibuilder's input), you **must** remove the `uibuilderCtrl` property otherwise, uibuilder will refuse to send the msg (to prevent msg loops).

### Client Ready for Content (Control Message)

Is send by the client library (uibuilderfe) to Node-RED whenever the client connects by loading or reloading the page.

Any message that contains `"cacheControl": "REPLAY"` and is linked back to your cache node should trigger that node to replay all of the saved cache
to the uibuilder node. Make sure you include the `_socketId` if you want that replay to only go to a specific connected client.

```json
{
    "uibuilderCtrl": "ready for content",   // control message type
    "cacheControl": "REPLAY",               // Cache control request type: REPLAY or CLEAR
    "from": "client",                       // Client->NR
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB", // Socket.IO ID of client (changes on reconnect)
}
```

### DOM Event (standard message from eventSend function. PARTIALLY DEPRECATED IN v5.1)

!> Note that from v5.1 with the ESM client library, this is replaced by the standardised `msg._ui` features.

Is sent whenever the eventSend function is called.

Example output:

```json
{
    "topic": "mytopic",  // Optional. Repeats the topic from the last inbound msg if it exists

    "uibDomEvent": {
        // The HTML id attribute where the event occured
        // If no id present, will try to use `name`, if
        // that isn't present, will use the first 25 chars of the inner text.
        "sourceId": "mytagid",
        // The DOM event type
        "event": "click",
    },

    // Each `data-xxxx` attribute in the HTML is added as a property
    // - this may be an empty Object if no data attributes defined
    "payload": { ... },
}
```

## Messages From either Node-RED or the client

### Clear Cache (Control Message)

This can be sent from anywhere. You will need to link the message to your caching node (e.g. a function node that handles caching).

Note that sending this into a uibuilder node, the msg will be dropped by uibuilder (to prevent control loops). Send it to your cache node.

```json
{
    "uibuilderCtrl": "clear cache",   // Required. control message type
    "cacheControl": "CLEAR",          // Required. Cache control request type: REPLAY or CLEAR
}
```
