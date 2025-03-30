---
title: uib-sidebar - Creates a UI in the Node-RED Editor sidebar
description: |
  Usage and configuration.
created: 2025-03-29 13:16:09
updated: 2025-03-29 16:38:32
---

Available since uibuilder v7.2.

While it is best to avoid using the Node-RED Editor as a general UI or dashboard, this node allows you to quickly and easily create a simple UI in the sidebar of the Editor.

## Overview

The `uib-sidebar` node is a single node that creates a sidebar UI in the Node-RED Editor. It uses the built-in ACE/Monaco editor with a default HTML template to create the main layout. The node automatically creates the sidebar when added to your flows.

> [!NOTE]
> Only a single sidebar can be created. If you add multiple `uib-sidebar` nodes, they should all show the same HTML in the editor config.

The node automatically sends any data from input HTML elements (`<input>`, `<textarea>`, `<select>`, `<button>`, etc) back to the node's output port as soon as the user changes a value.

> [!NOTE]
> A future enhancement will allow you to wrap inputs in a `<form>` element and only send the data when the form is submitted. At present, each input sends a message immediately it gets a new value.

## Configuring

The main configuration is simply the HTML content of the sidebar.

> [!NOTE]
> Changes to the HTML in the config are reflected in the sidebar immediately (e.g. before deploy is pressed). This allows easy prototyping of the sidebar UI. Changes are not saved until the flow is deployed.

> [!WARNING]
> Inputs of type `file` are not current supported in the sidebar. A message is sent back containing the file meta-data but currently the file is not. This will be added in a future release.

## Sending Data to the Node

The node supports using `msg.sidebar.<html-id>` properties that will automatically update id'd HTML elements. For example, `msg.sidebar.div1.innerHTML` with a value of some HTML will change the HTML content of the div with an id of `div1`.

Each sub-property should be a valid HTML attribute for the element. The most common attributes are likely to be `innerHTML`, `innerText`, `style`, and `class` along with `value` for inputs. HTML attributes are always character strings. However, any attribute name will be added even if it makes no sense.

Here is an example message content that updates the visible HTML of a paragraph, changes its visual style. For an input element, it sets the value of the input to "42".

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
> Only `msg.sidebar` properties are processed at present. Other properties will be ignored.

## Output Messages
The node sends a message back to the output port whenever an input element changes. The value of the input is contained in both the msg.payload and msg.value (or msg.checked for checkbox inputs).

Each message contains a set of meta-data properties that describe the input element and its value.

```json
{
  "payload": "some value",
  "topic": "uib-sidebar/input/in1",
  "from": "uib-sidebar",
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

* Future possible enhancements:
  * [ ] Create a node-red action to display the tab.
  * [ ] If an input element is part of a form, only send the form data when the form is submitted rather than immediately. 
  * [ ] Add a link to the help sidebar that has an `onclick` handler to show the uib sidebar.
  * [ ] Add file-upload support to the sidebar. This is not currently supported in the sidebar. A message is sent back containing the file meta-data but currently the file is not.
  * [ ] Allow file uploads larger than the max message size by splitting the file into chunks and reassembling on the server.
  * [ ] Add processing for fieldsets/radiobuttons.
  * [ ] Allow processing of content editable divs.
  
  * [ ] May want an alternative simpler input msg (as well as the full msg type) with just topic/payload that uses topic for html-id and payload for `value` if it exists on the element or innerText/HTML.
  * [ ] May want to have multiple tabs possible by adding a name setting to the node. Restricting to a single sidebar for now.
  * [ ] Might need a flag in the uibuilder setting.js prop that allows/disallows HTML content. Or maybe turns off DOMPurify.
  * [ ] Maybe cross-check with my dom/tinyDOM library to see if it can be used to simplify the code.
