---
title: Controlling uibuilder's client from Node-RED
description: >
   How to send specially formatted messages from Node-RED to the uibuilder node that
   get information from the client and control how it works.
created: 2023-02-23 11:59:44
lastUpdated: 2023-07-02 15:50:23
---

The uibuilder client library can be controlled in various ways from Node-RED to save you the bother of having to write front-end code.

These ways are all summarised here. They all use a pre-formatted message sent to the appropriate `uibuilder` node in Node-RED.

> [!INFO]
> This feature was introduced in uibuilder v6.1 with only the get/set commands. Other commands are introduced in later versions.

Please load the "remote-commands" example from the library to test all of these out.

## Responses

When a command is issued from Node-RED to the clients via a `msg._uib` command, the client library will respond with a standard message of its own.

The `msg._uib` block of the response will contain `msg._uib.command` showing what command was issued and `msg._uib.response` showing the client library's (or browsers) response to the command. `msg.payload` also contains a copy of the response.

If the uibuilder node has the "Include msg._uib in standard msg output" flag set, `msg._uib` will also contain all of the client details.

## UI control

A message containing a `msg._ui` property will be processed internally by the library with any UI configurations translated into HTML and the browser DOM updated accordingly.

Please see the [Dynamic, data-driven HTML content](config-driven-ui.md) content for details.

## Navigation control

Currently, only a page reload control is available. Set `msg._ui` to `{"method": "reload"}`.

## Getting UI information

### `uiGet`

Sending a message containing a `msg._uib` property set as follows will result in a returned message with standard details about the requested HTML element(s).

```json
{"command": "uiGet", "prop": "#more"}
```

Where `prop` has to be set to a valid CSS Selector.

Alternatively, you can ask for a specific property from the selected element like this:

```json
{"command":"uiGet","prop":"#eltest table", "value": "class"}
```

Which will return the class attribute value from a `<table>` tag within a tag having an id of `eltest`.

With this format, if you ask for the `value` attribute - `{"command":"uiGet","prop":"#eltest", "value": "value"}` - if the selected element is an `input` type, the input's value attribute will be returned. But if it is some other kind of element type, the element's inner text will be returned.

### `uiWatch`

To be automatically informed of changes to some part of the web page UI, you can send a message with `msg._uib` something like this:

```json
{"command":"uiWatch","prop":"#more"}
```

Which will watch the `<div id="more">...</div>` element for changes. Any changes to attributes or content will be reported back as standard messages.


## Getting client status information

Sending a message containing a `msg._uib` property set as follows will result in that property being updated with a `msg._uib.value` property.

```json
{"command": "get", "prop": "logLevel"}
```

See [Client Variables](variables.md) for details of what information you can get. In addition, uibuilder allows the setting of custom variables via its `set` function (see next section). This uses the `uibuilder.get(varName)` client function.

This command results in a standard message out of the top port of the uibuilder node that will contain `msg._uib.response`.

## Changing settings

The following client settings can be changed from Node-RED by sending a message containing a `msg._uib` property configured as shown.

> [!NOTE]
> The _case_ of the command string matters. It must match exactly the function name. The following command functions are currently allowed:
> 
> 'get', 'set', 'showMsg'

### Set variable

```json
{"command": "set", "prop": "logLevel", "value": 2}
```

Uses the `uibuilder.set(varName, value)` client function.

This command results in a standard message out of the top port of the uibuilder node that will contain `msg._uib.response`.

### Turn on/off visible last message from Node-RED

```json
{"command": "showMsg", "prop": "body", "value": true}
```

Where:

- `value` is *true* to turn on the message display, *false* turns it off. If not provided, toggles the display.
- `prop` is the CSS Selector under which the display will be shown. If omitted, 'body' is used which results in the display being added to the end of the visible page.

### Turn on/off visible current status of the uibuilder front-end client

```json
{"command": "showStatus", "prop": "body", "value": true}
```

Where:

- `value` is *true* to turn on the status display, *false* turns it off. If not provided, toggles the display.
- `prop` is the CSS Selector under which the display will be shown. If omitted, 'body' is used which results in the display being added to the end of the visible page.


## Get complete copy of the current web page

To get the current web page, complete with dynamic changes back to Node-RED as a string in `msg.payload`, send a message to the uibuilder node containing:

```json
{ "_uib": { "command": "sendHtml" } }
```

## Restricting to specific pages, users, tabs

Any of the `_ui` and `_uib` messages can be limited to operate only against specific page names, client ID's and browser tab ID's.

One or more of the following property names can be added to the `_ui` or `_uib` properties: `pageName`, `clientId`, `tabId` (noting that the character case needs to be exact).

You can find values for these from an inbound control msg such as the "client connect" control msg. They are also contained in the `_uib` property of standard messages if you have turned on the advanced feature "Include msg._uib in standard msg output".

You can, of course still use `msg._socketId`. If present, the msg being sent is only sent to the single browser tab matching that socket.io id. However, the socket id can change at any time, for example if the browser tab temporarily loses connection to the server - maybe because the tab went to sleep.

The client ID should remain constant while the browser stays open. The tab ID should remain until the tab or the browser is closed.

For the page name, note that the default name (e.g. when the browser address bar is only showing the folder and not a specific `xxxx.html`) is `index.html`. uibuilder allows you to have any number of pages defined under a single node however.
