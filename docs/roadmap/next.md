---
title: Possible Future Features
description: |
  What is being worked on for the next release.
created: 2025-01-05 12:34:47
updated: 2025-01-18 17:51:31
author: Julian Knight (Totally Information)
---

## To Do

* [ ] Move all nodes editor html to use modules. [Ref](https://discourse.nodered.org/t/text-javascript-vs-module-in-html/94215/4)
* [ ] Add 🌐 to all uibuilder log messages, before the `[....]`.

### New node: uib-sidebar

* [x] New node to facilitate a sidebar UI [ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/510).
* [x] Single node
* [x] Auto-creates sidebar when added to the page.
* [x] Node should use built-in ACE/Monaco editor with a HTML default template to create the main layout.
* [x] All input elements should automatically send data back to the node.
* [x] Input elements should automatically send data to the output port.
* [x] Check if DOMPurify is enabled in the Editor. It is.
* [x] Check if resources/editor-common.{js|css} are available to the tab. They are.
* [ ] If inputs are part of a form, only send the form data when the form is submitted.
* [ ] Incoming msg's should allow multiple `msg.<html-id>` properties that will automatically update the props on the appropriate elements. E.g. `msg.div1.innerHTML` with a value of some HTML should change the HTML content of the div with an id of `div1`.
* [ ] Create a node-red action to display the tab.
* [ ] Apply DOMPurify to incoming HTML content.

#### Consider

* May want to have multiple tabs possible by adding a name setting to the node.
* Might need a flag in the uibuilder setting.js prop that allows/disallows HTML content. Or maybe turns off DOMPurify.
* May want an alternative simpler input msg (as well as the full msg type) with just topic/payload that uses topic for html-id and payload for `value` if it exists on the element or innerText/HTML.

## Answers needed

## Ideas

* Move uib-brand.css to a new sub-package. Publish separately.
