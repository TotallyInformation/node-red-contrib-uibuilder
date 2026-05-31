---
title: uib-sidebar - Creates a UI in the Node-RED Editor sidebar
description: |
  While it is best to avoid using the Node-RED Editor as a general UI or dashboard, this node allows you to quickly and easily create a simple UI in the sidebar of the Editor. The UI also allows inputs which are returned back to the source node as messages.
since: v7.2.0
author: Julian Knight (Totally Information)
created: 2025-03-29 13:16:09
updated: 2026-05-30 13:18:19
---

## Overview

The `uib-sidebar` node creates a sidebar UI in the Node-RED Editor. It uses the built-in ACE/Monaco editor with a default HTML template to create the main layout. The node automatically creates the sidebar when added to your flows.

> [!TIP]
> You don't specify a full HTML page in the node's configuration. Instead, you just specify the HTML that you want to have appear in the sidebar.

The node automatically sends any data from input HTML elements (`<input>`, `<textarea>`, `<select>`, `<button>`, etc) back to the node's output port as soon as the user changes a value.

> [!NOTE]
> A future enhancement will allow you to wrap inputs in a `<form>` element and only send the data when the form is submitted. At present, each input sends a message immediately it gets a new value.

You can have multiple `uib-sidebar` nodes in your flows. Each one will add its defined HTML to the sidebar. This allows you to easily modularise your sidebar content and have different nodes responsible for different parts of the sidebar. Each sidebar node has its own input and output so they can be updated and respond to messages independently. The content from each sidebar node is added to the sidebar in the order that the nodes are listed in the Node-RED editor. The ID of the node that created the content is returned as part of the message when an input element is changed. This allows you to easily identify which sidebar node the message came from.

## Configuring

The main configuration is simply the HTML content of the sidebar.

> [!NOTE]
> Changes to the HTML in the config are reflected in the sidebar immediately (e.g. before deploy is pressed). This allows easy prototyping of the sidebar UI. Changes are not saved until the flow is deployed.

> [!WARNING]
> Inputs of type `file` are not current supported in the sidebar. A message is sent back containing the file meta-data but currently the file is not. This may be added in a future release.

## Sending Data to the Node

The node supports using `msg.sidebar.<html-id>` message properties that will automatically update id'd HTML elements. For example, `msg.sidebar.div1.innerHTML` with a value of some HTML will change the HTML content of the div with an id of `div1`.

Each sub-property should be a valid HTML attribute for the element. The most common attributes are likely to be `innerHTML`, `innerText`, `style`, and `class` along with `value` for inputs. HTML attributes are always character strings. However, any attribute name will be added even if it makes no sense.

Given this example sidebar HTML:

```html
<p id="p1">{...waiting for input...}</p>
<input id="in1" type="number" />
```

Here is an example message content that updates the visible HTML of the paragraph, changes its visual style and sets the value of the input to "42".

```json
{
  "sidebar": {
    "p1": {
      "innerHTML": "<b>Woo!</b> This is great! 😁",
      "style": "color: red; background-color:yellow; border: 2px solid blue;",
      "data-mydata": "hello"
    },
    "in1": {
      "value": "42"
    }
  }
}
```

> [!NOTE]
> Only `msg.sidebar` properties are processed at present. Other properties are ignored.

## Output Messages
The node sends a message back to the output port whenever an input element changes. The value of the input is contained in both the msg.payload and msg.value (or msg.checked for checkbox inputs).

Each message contains a set of meta-data properties that describe the input element and its value.

```json
{
  "payload": "some value",
  "topic": "uib-sidebar/1234567890abcdef/input/in1",
  "from": "uib-sidebar",
  "sourceNode": "1234567890abcdef",
  "id": "in1",
  "name": "",
  "attributes": {
    "type": "text",
    "id": "in1",
    "class": "myclass",
    "data-fred": "jim"
  },
  "data": {
    "fred": "jim"
  },
  "willValidate": true,
  "type": "text",
  "value": "some value",
  "checked": false,
  "localName": "input",
  "modifierKeys": {},
  "_msgid": "edd4e756feec488e"
}
```

## Original requirements and motivation

The sidebar node was created in response to a request on the [GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/510) by [tanpau](https://github.com/tanpau). The user wanted a simple way to create a UI in the Node-RED Editor sidebar without having to use a full dashboard or custom UI framework. The `uib-sidebar` node provides a quick and easy way to create a simple UI in the sidebar of the Node-RED Editor.

* [x] New node to facilitate a sidebar UI.
* [x] Single node
* [x] Auto-creates sidebar when added to the page.
* [x] Node should use built-in ACE/Monaco editor with a HTML default template to create the main layout.
* [x] All input elements should automatically send data back to the node.
* [x] Input elements should automatically send data to the output port.
* [x] Check if DOMPurify is enabled in the Editor. It is.
* [x] Check if resources/editor-common.{js|css} are available to the tab. They are.
* [x] Incoming msg's should allow multiple `msg.sidebar.<html-id>` properties that will automatically update the props on the appropriate elements. E.g. `msg.sidebar.div1.innerHTML` with a value of some HTML should change the HTML content of the div with an id of `div1`.
* [x] Apply DOMPurify to incoming and edited HTML content. However, disabled for now as it is too agressive and needs a better configuration.
* [x] Documentation
* [x] Add an example flow.

## Future possible enhancements
See the [roadmap](roadmap/nodes/uib-sidebar.md) for the sidebar node for possible future enhancements.
