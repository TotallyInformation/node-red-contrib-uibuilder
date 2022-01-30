---
title: Pre-defined uibuilder messages
description: >
   Documents the different types of uibuilder messages between a Node-RED uibuilder node and a uibuilder front-end.
created: 2020-09-24 18:14:00
lastUpdated: 2022-01-30 21:20:29
---

- [Standard msg properties used by uibuilder](#standard-msg-properties-used-by-uibuilder)
  - [msg._auth `{Object}` (uibuilder v3+)](#msg_auth-object-uibuilder-v3)
  - [msg.script `{String}`](#msgscript-string)
  - [msg.style `{String}`](#msgstyle-string)
  - [msg._uib `{Object}` (uibuilder v3+)](#msg_uib-object-uibuilder-v3)
  - [msg.uibDomEvent `{Object}` (uibuilder v3.2+)](#msguibdomevent-object-uibuilder-v32)
- [From Node-RED uibuilder node to the front-end (browser)](#from-node-red-uibuilder-node-to-the-front-end-browser)
  - [Client (re)Connection (Control Message)](#client-reconnection-control-message)
  - [Errors](#errors)
  - [UI Notification [Toast] (Control Message)](#ui-notification-toast-control-message)
    - [Simple version](#simple-version)
    - [More complex example](#more-complex-example)
  - [Browser client reload page](#browser-client-reload-page)
    - [Msg Schema](#msg-schema)
- [From the front-end (browser) to the Node-RED uibuilder node](#from-the-front-end-browser-to-the-node-red-uibuilder-node)
  - [Client Ready for Content (Control Message)](#client-ready-for-content-control-message)
  - [DOM Event (standard message from eventSend function)](#dom-event-standard-message-from-eventsend-function)
- [From either Node-RED or the client](#from-either-node-red-or-the-client)
  - [Clear Cache (Control Message)](#clear-cache-control-message)


## Standard msg properties used by uibuilder

### msg._auth `{Object}` (uibuilder v3+)

May be attached to any msg (control or standard) in either direction.

Contains authentication and authorisation information and/or user meta-data.
May also contain messages such as success or error messages on login.

See the [Security doc](./security.md) for details.

Ignored if the "Use uibuilder's security?" flag is not set.

### msg.script `{String}`

Only used if the "Scripts?" flag is set in uibuilder's Advanced Settings.

Text must be valid JavaScript and will be dynamically added to the client page DOM.

**WARNING** No checking is done and this could be quite dangerous.

### msg.style `{String}`

Only used if the "Styles?" flag is set in uibuilder's Advanced Settings.

Text must be valid CSS and will be dynamically added to the client page DOM.

**WARNING** No checking is done and this could be quite dangerous.

### msg._uib `{Object}` (uibuilder v3+)

Used by the [Browser client reload page](#browser-client-reload-page), [showToast](#vuejs-ui-notification-toast-control-message) and [showComponentDetails](./vue-component-handling?id=discover-a-vue-components-capabilities) functions and their equivalent messages from Node-RED.

Should be used in the future for any other standardised interactions with uibuilderfe.

### msg.uibDomEvent `{Object}` (uibuilder v3.2+)

Used by the [eventSend](front-end-library?id=eventsend-helper-fn-to-send-event-data) function.


## From Node-RED uibuilder node to the front-end (browser)

In addition to these messages, see also the [VueJS component handling page](./vue-component-handling).

### Client (re)Connection (Control Message)

Is sent from Node-RED by uibuilder to the client whenever a new client connects or
when an existing client re-connects (by reloading their page).

```json
{
    "uibuilderCtrl": "client connect",  // control message type
    "cacheControl": "REPLAY",           // Cache control request type: REPLAY or CLEAR
    "serverTimestamp": "2020-09-24T12:56:13.125Z",  // Can be used in client to work out their timezone or at least time offset from the server
    "security": false,                  // Tell the client whether security is turned on or not
    "from": "server",                   // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // ID of client (from Socket.IO)
    "_msgid": "8d4307ce.d5e428"         // Node-RED internal msg id
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


### UI Notification [Toast] (Control Message)

Sending this message (uibuilder v3+) to the client will pop-over a dynamic message to the user in the browser. No code is required at the front-end.

Prior to v5, this required VueJS and bootstrap-vue. If these are available, then bootstrap-vue's toast component will be used.

From v5, this works without VueJS as well. Just make sure that you include the default uibuilder stylesheet by putting `@import url("./uib-styles.css");` at the start of your `index.css` file. The toast will appear overlaid on all other content. Clicking on a notification will clear that one. Clicking on the background will clear all notifications.

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

## From the front-end (browser) to the Node-RED uibuilder node

Note that, if responding to a control msg, you **must** remove the `uibuilderCtrl` property otherwise, uibuilder will refuse to send the msg (to prevent msg loops).

### Client Ready for Content (Control Message)

Is send by the client library (uibuilderfe) to Node-RED whenever the client connects by loading or reloading the page.

Any message that contains `"cacheControl": "REPLAY"` and is linked back to your cache node should trigger that node to replay all of the saved cache
to the uibuilder node. Make sure you include the `_socketId` if you want that replay to only go to a specific connected client.

```json
{
    "uibuilderCtrl": "ready for content",   // control message type
    "cacheControl": "REPLAY",               // Cache control request type: REPLAY or CLEAR
    "from": "client",                       // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // ID of client (from Socket.IO)
}
```

### DOM Event (standard message from eventSend function)

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

## From either Node-RED or the client

### Clear Cache (Control Message)

This can be sent from anywhere. You will need to link the message to your caching node (e.g. a function node that handles caching).

Note that sending this into a uibuilder node, the msg will be dropped by uibuilder (to prevent control loops). Send it to your cache node.

```json
{
    "uibuilderCtrl": "clear cache",   // Required. control message type
    "cacheControl": "CLEAR",          // Required. Cache control request type: REPLAY or CLEAR
}
```