---
title: Custom document events used in the modern client
description: >
   Details about the custom `document` events used in the uibuilder modern front-end client library.
created: 2023-01-28 15:56:57
lastUpdated: 2023-03-02 20:28:34
---


Custom events are all attached to the DOM `document` object. Additional custom data may be added to the `detail` object of the event object.

Can be used as:

```javascript
document.addEventListener('uibuilder:socket:connected', (event) => { 
   console.log(event.detail)
})
```

## `uibuilder:constructorComplete`

When the uibuilder class constructor has completed

No data included.

## `uibuilder:startComplete`

When uibuilder initial start function has completed

No data included.

## `uibuilder:socket:connected`

When Socket.IO successfully connects to the matching uibuilder node in Node-RED

The connection count is provided on the events `detail` object.
This is likely to be the first event that is usable in your own front-end code, you can use it as an indicator that the uibuilder library is started and running correctly with a link back to Node-RED active. However, if using in your own code, note that it will fire again if the socket gets disconnected and then reconnects. So put in a flag if you only want to do something on initial startup.

## `uibuilder:socket:disconnected`

When Socket.IO disconnects from the matching uibuilder node in Node-RED

The disconnect reason is provided on the events `detail` object if available. May be a string or an error object.

## `uibuilder:propertyChanged`

When uibuilder.set is called (externally or internally)

Used internally be the `onChange` function but can also be used directly if preferred.

The new value of the property is provided on the events `detail` object.

## `uibuilder:stdMsgReceived`

When a non-control msg is received from Node-RED

The message content is provided on the events `detail` object.

## `uibuilder:msg:topic:${msg.topic}`

When a std msg with a msg.topic prop is received

The message content is provided on the events `detail` object.

## `uibuilder:msg:_ui`

When a std msg with a msg._ui property is received

The message content is provided on the events `detail` object.

## `uibuilder:msg:_ui:${action.method}${action.id ? `:${action.id}` : ''}`

Output for each action on receipt of a std msg with a msg._ui property

The action details are provided on the events `detail` object.
