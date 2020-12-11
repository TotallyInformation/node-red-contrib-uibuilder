# Pre-defined uibuilder messages

Documents the different types of uibuilder messages between a Node-RED uibuilder node and a uibuilder front-end.

* [Pre-defined uibuilder messages](#pre-defined-uibuilder-messages)
  * [Standard msg properties used by uibuilder](#standard-msg-properties-used-by-uibuilder)
    * [msg._auth `{Object}` (uibuilder v3+)](#msg_auth-object-uibuilder-v3)
    * [msg.script `{String}`](#msgscript-string)
    * [msg.style `{String}`](#msgstyle-string)
  * [From Node-RED uibuilder node to the front-end (browser)](#from-node-red-uibuilder-node-to-the-front-end-browser)
    * [Client (re)Connection (Control Message)](#client-reconnection-control-message)
    * [VueJS UI Notification [Toast] (Control Message)](#vuejs-ui-notification-toast-control-message)
  * [From the front-end (browser) to the Node-RED uibuilder node](#from-the-front-end-browser-to-the-node-red-uibuilder-node)
    * [Client Ready for Content (Control Message)](#client-ready-for-content-control-message)
  * [From either Node-RED or the client](#from-either-node-red-or-the-client)
    * [Clear Cache (Control Message)](#clear-cache-control-message)

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


## From Node-RED uibuilder node to the front-end (browser)

### Client (re)Connection (Control Message)

Is sent from Node-RED by uibuilder to the client whenever a new client connects or
when an existing client re-connects (by reloading their page).

```jsonc
{
    "uibuilderCtrl": "client connect",  // control message type
    "cacheControl": "REPLAY",           // Cache control request type: REPLAY or CLEAR
    "serverTimestamp": "2020-09-24T12:56:13.125Z",  // Can be used in client to work out their timezone or at least time offset from the server
    "from": "server",                   // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // ID of client (from Socket.IO)
    "_msgid": "8d4307ce.d5e428"         // Node-RED internal msg id
}
```

### VueJS UI Notification [Toast] (Control Message)

Sending this message (uibuilder v3+) to the client will pop-over a dynamic
message to the user in the browser. No code is required at the front-end.

#### Simple version

This would send a notification to all connected clients. May be injected to a uibuilder node.

```jsonc
{
    "_vue": {  // Required. VueJS Component data
        "componentRef": "globalNotification", // Required.
    },
    "payload": "This is a notification from Node-RED!", // Optional. Will be added to the notification message (content). May be HTML.       
}
```

#### More complex example

```jsonc
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
            // New message appears above old by default (false), change to true to add to the bottom instead.
            "append": true,
            // 5000 by default, how long the message stays on-screen. Hover over message to pause countdown.
            "autoHideDelay": 1500,
            // Bootstrap-vue colour variant. Primary, Secondary, Error, Warning, Info
            "variant": "info",
            // Default display is semi-transparent, set this to true to make the message solid colour.
            "solid": true,
            // If present, the whole message is turned into a link. Click takes the client to the URL.
            "href": "https://bbc.co.uk",
            // Controls where on the page the toast appears. Several standard locations are available.
            // default is top-right. Custom positions can be set by including a <toaster> element in your HTML.
            "toaster": "b-toaster-top-center",
            // Default false. If true stops auto-Hide. Click on the close button to remove the toast.
            "noAutoHide": true
            // More options are available. @see https://bootstrap-vue.org/docs/components/toast
        },
    },

    "payload": "<any>",      // Optional. Will be added to the notification message (content). May be HTML.       

    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // Optional. ID of client (from Socket.IO) - msg would only be sent to this client.
}
```

## From the front-end (browser) to the Node-RED uibuilder node

### Client Ready for Content (Control Message)

Is send by the client library (uibuilderfe) to Node-RED whenever the client connects by loading or reloading the page.

Any message that contains `"cacheControl": "REPLAY"` and is linked back to your cache node should trigger that node to replay all of the saved cache
to the uibuilder node. Make sure you include the `_socketId` if you want that replay to only go to a specific connected client.

```jsonc
{
    "uibuilderCtrl": "ready for content",   // control message type
    "cacheControl": "REPLAY",               // Cache control request type: REPLAY or CLEAR
    "from": "client",                       // NR->Client
    "_socketId": "/extras#sct0MeMrdeS5lwc0AAAB",    // ID of client (from Socket.IO)
}
```

## From either Node-RED or the client

### Clear Cache (Control Message)

This can be sent from anywhere. You will need to link the message to your caching node (e.g. a function node that handles caching).

Note that sending this into a uibuilder node, the msg will be dropped by uibuilder (to prevent control loops). Send it to your cache node.

```jsonc
{
    "uibuilderCtrl": "clear cache",   // Required. control message type
    "cacheControl": "CLEAR",          // Required. Cache control request type: REPLAY or CLEAR
}
