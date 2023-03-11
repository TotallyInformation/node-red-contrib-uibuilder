---
title: Controlling uibuilder's client from Node-RED
description: >
   How to send specially formatted messages from Node-RED to the uibuilder node that
   get information from the client and control how it works.
created: 2023-02-23 11:59:44
lastUpdated: 2023-03-04 18:08:46
---

The uibuilder client library can be controlled in various ways from Node-RED to save you the bother of having to write front-end code.

These ways are all summarised here. They all use a pre-formatted message sent to the appropriate `uibuilder` node in Node-RED.

> [!INFO]
> This feature was introduced in uibuilder v6.1 with only the get/set commands. Other commands will be introduced in future versions.

## UI Control

A message containing a `msg._ui` property will be processed internally by the library with any UI configurations translated into HTML and the browser DOM updated accordingly.

Please see the [Dynamic, data-driven HTML content](config-driven-ui.md) content for details.

## Navigation Control

Currently, only a page reload control is available. Set `msg._ui` to `{"method": "reload"}`.

## Getting UI Information

Sending a message containing a `msg._uib` property set as follows will result in a returned message with standard details about the requested HTML element(s).

```json
{"command": "uiGet", "prop": "#more"}
```

Where `prop` has to be set to a valid CSS Selector.


## Getting Client Status Information

Sending a message containing a `msg._uib` property set as follows will result in that property being updated with a `msg._uib.value` property.

```json
{"command": "get", "prop": "logLevel"}
```

See [Client Variables](variables.md) for details of what information you can get. In addition, uibuilder allows the setting of custom variables via its `set` function (see next section). This uses the `uibuilder.get(varName)` client function.

This command results in a standard message out of the top port of the uibuilder node that will contain `msg._uib.response`.

## Changing Settings

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


## Get Complete Copy of the Current Web Page

To get the current web page, complete with dynamic changes back to Node-RED as a string in `msg.payload`, send a message to the uibuilder node containing:

```json
{ "_uib": { "command": "sendHtml" } }
```


## Other Controls
