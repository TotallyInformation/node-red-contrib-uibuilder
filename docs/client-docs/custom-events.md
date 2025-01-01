---
title: Custom document events used in the modern client
description: |
  Details about the custom `document` events used in the uibuilder modern front-end client library.
created: 2023-01-28 15:56:57
updated: 2025-01-01 14:29:58
---


Custom events are all attached to the DOM `document` object. Additional custom data may be added to the `detail` object of the event object.

Can be used as in this example:

```javascript
document.addEventListener('uibuilder:socket:connected', (event) => { 
   console.log(event.detail)
})
```

## `uibuilder:constructorComplete`

When the uibuilder class constructor has completed

No data included.

## `uibuilder:domChange`

Triggered by `uiWatch` functions.

Details contain the same data as sent back to Node-RED in `msg._ui` by that function. `details.cssSelector` shows what watched element triggered the change.

## `uibuilder:msg:_ui`

When a std msg with a msg._ui property is received

The message content is provided on the events `detail` object.

## `uibuilder:msg:topic:${msg.topic}`

When a std msg with a msg.topic prop is received

The message content is provided on the events `detail` object.

## `uibuilder:propertyChanged`

When uibuilder.set is called (externally or internally).

Used internally by the `onChange` function but can also be used directly if preferred. One potential advantage of using this event over `onChange` is that it includes additional details such as the previous value and whether the variable is stored in browser local storage.

The new value of the property is provided on the events `detail` object. The details schema is:

```javascript
{ 
  'prop': propertyName,
  'value': newValue,
  'oldValue': oldValue,
  'store': store, // true if the property is stored in localStorage
  'autoload': autoload // true if the property is autoloaded from localStorage
}
```

## `uibuilder:propertyChanged:${propertyName}`

Same as the generic `propertyChanged` event but fired when the specific property is changed.

## `uibuilder:socket:connected`

When Socket.IO successfully connects to the matching `uibuilder` node in Node-RED

The connection count is provided on the events `detail` object.
This is likely to be the first event that is usable in your own front-end code, you can use it as an indicator that the uibuilder library is started and running correctly with a link back to Node-RED active. However, if using in your own code, note that it will fire again if the socket gets disconnected and then reconnects. So put in a flag if you only want to do something on initial startup.

## `uibuilder:socket:disconnected`

When Socket.IO disconnects from the matching `uibuilder` node in Node-RED

The disconnect reason is provided on the events `detail` object if available. May be a string or an error object.

## `uibuilder:startComplete`

When uibuilder initial start function has completed

No data included.

## `uibuilder:stdMsgReceived`

When a non-control msg is received from Node-RED

The message content is provided on the events `detail` object.

