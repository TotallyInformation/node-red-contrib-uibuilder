---
title: Possible Future Features
description: |
  What is being worked on for the next release.
created: 2025-01-05 12:34:47
updated: 2025-03-26 11:30:08
author: Julian Knight (Totally Information)
---

## Fixes needed

* [ ] web.js - move json handler into the isCustom section - not in main. [Ref](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988)

## To Do

* [ ] Move all nodes editor html to use modules. [Ref](https://discourse.nodered.org/t/text-javascript-vs-module-in-html/94215/4)

* Forms
  * [ ] When a form is submitted, include the form's id/name in the message. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] Add the element id/name to a file upload message. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] When a form sends a file upload message, add a msg.parts property? [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] If inputs are part of a form, only send the form data when the form is submitted.

* Documentation
  * [ ] Properly document file uploads and how to handle them. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)

### New node: uib-sidebar

* [x] New node to facilitate a sidebar UI [ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/510).
* [x] Single node
* [x] Auto-creates sidebar when added to the page.
* [x] Node should use built-in ACE/Monaco editor with a HTML default template to create the main layout.
* [x] All input elements should automatically send data back to the node.
* [x] Input elements should automatically send data to the output port.
* [x] Check if DOMPurify is enabled in the Editor. It is.
* [x] Check if resources/editor-common.{js|css} are available to the tab. They are.
* [x] Incoming msg's should allow multiple `msg.sidebar.<html-id>` properties that will automatically update the props on the appropriate elements. E.g. `msg.sidebar.div1.innerHTML` with a value of some HTML should change the HTML content of the div with an id of `div1`.
* [x] Apply DOMPurify to incoming and edited HTML content.

* [ ] Documentation
* [ ] Create a node-red action to display the tab.
* [ ] Align forms/inputs to main processing.

* Future possible enhancements:
  * [ ] May want an alternative simpler input msg (as well as the full msg type) with just topic/payload that uses topic for html-id and payload for `value` if it exists on the element or innerText/HTML.
  * [ ] May want to have multiple tabs possible by adding a name setting to the node. Restricting to a single sidebar for now.
  * [ ] Might need a flag in the uibuilder setting.js prop that allows/disallows HTML content. Or maybe turns off DOMPurify.
  * [ ] Allow file uploads larger than the max message size by splitting the file into chunks and reassembling on the server.
  * [ ] Add a link to the help sidebar that has an `onclick` handler to show the uib sidebar.


#### Consider

* Implement the `dom` (`tinyDOM`) FE library.
* Implement the `logger` FE library.
* Adding `hooks` to web.js to allow easier header overrides. `httpHeaders`.
* Add a link to the uibuilder help sidebar that has an `onclick` handler: `RED.actions.invoke('core:show-import-dialog')`
* New help doc re CORS. [Ref](https://discourse.nodered.org/t/allow-cors-for-ui-builder/94838).
* Get node-red to tell connected clients that it is closing/restarting. The client library should then close the connection and attempt to reconnect with a sensible delay. A reconnection should NOT trigger a cache replay. Maybe get the server to tell the client when to start reconnecting by sending a retry period - the client should slightly randomise that period to avoid all clients reconnecting at the same time.
* Move Vue/Svelte templates to separate repo's - keep in the templates list but link to the new repo.
* How to have a "live" feature. This would be a mix of http-in/-response and uibuilder nodes. It would create a live endpoint that would be pre-populated with the uibuilder default ESM template. Would allow server-side rendering.
* Move the uib-brand CSS to a separate package. Publish separately. Possibly as a sub-package of uibuilder.
* Move ti-base-component to a separate package. Publish separately. Include here.
* Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
* Live Request-Response capability. Mirroring core http-in/-response nodes but with uibuilder features. See [live.md](live.md).


## Answers needed

## Ideas

* Move uib-brand.css to a new sub-package. Publish separately.

## Videos

* uib-sidebar: How to use the new uib-sidebar node.
* Updates on how to have data-driven updates to the UI.
