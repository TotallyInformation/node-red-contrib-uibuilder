---
title: Possible Future Features
description: |
  What is being worked on for the next release.
created: 2025-01-05 12:34:47
updated: 2025-05-17 16:22:46
author: Julian Knight (Totally Information)
---

## In Progress

* [ ] Move Vue/Svelte templates to separate repo's - keep in the templates list but link to the new repo. Use a monorepo. [Ref](https://chatgpt.com/share/67e94f7d-e054-8001-9976-c24cae872980).
* [ ] Remove remaining ~~5~~ 4 fsextra functions from fs lib. `ensureDirSync` is completed.
* Background rework
  * [ ] Move all nodes editor html to use modules. [Ref](https://discourse.nodered.org/t/text-javascript-vs-module-in-html/94215/4)
  * [ ] No need to pass uib var now it is in a module, can simply require it. (Except for libs/fs which is already used by the uib module).

## To Fix

* Failed rename of instance folder gets stuck.
* Form CSS: 
  * Input fields should not have a black background in light mode.

## To Do

* [ ] Allow standard templates to be loaded from a URL, not just external ones.
* [ ] Allow overriding of the JSON max upload size for the custom Express server. [Ref](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988)

* Documentation
  * [ ] Properly document file uploads and how to handle them. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] How-to for form handling.
  * [ ] Add thanks to the contributors in the readme.

#### Consider

* Replace all template eslint configs with new version (see actions example). Also add stylelint. And update pacage.json.
* Add fe dependencies install button to uibuilder node.
  * Add option for auto-install of dependencies when using an external template.
* Implement the `dom` (`tinyDOM`) FE library.
* Implement the `logger` FE library.
* Adding `hooks` to web.js to allow easier header overrides. `httpHeaders`.
* Add a link to the uibuilder help sidebar that has an `onclick` handler: `RED.actions.invoke('core:show-import-dialog')`
* New help doc re CORS. [Ref](https://discourse.nodered.org/t/allow-cors-for-ui-builder/94838).
* Get node-red to tell connected clients that it is closing/restarting. The client library should then close the connection and attempt to reconnect with a sensible delay. A reconnection should NOT trigger a cache replay. Maybe get the server to tell the client when to start reconnecting by sending a retry period - the client should slightly randomise that period to avoid all clients reconnecting at the same time.
* How to have a "live" feature. This would be a mix of http-in/-response and uibuilder nodes. It would create a live endpoint that would be pre-populated with the uibuilder default ESM template. Would allow server-side rendering.
* Move the uib-brand CSS to a separate package. Publish separately. Possibly as a sub-package of uibuilder.
* Move ti-base-component to a separate package. Publish separately. Include here.
* Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
* Live Request-Response capability. Mirroring core http-in/-response nodes but with uibuilder features. See [live.md](live.md).
* Check message sizes. If >limit, split into chunks and use standard msg.parts to allow reassembly - both on the server AND on the client. Allow auto-splitting of messages for large messages and use the msg.parts feature from node-red core to allow easy re-constitution.
* Allow http responses using transfer encoding chunked. [Ref](https://discourse.nodered.org/t/http-transfer-encoding-chunked/94332/6).
* Add a pwa builder. Generate a manifest and service worker. [Ref](https://discourse.nodered.org/t/pwa-support/94332/6).
* Add the `truthy` function to the RED.util uibuilder extension functions to allow use in function nodes.
* New possible node: `uib-events` - a node that listens for events from the uibuilder runtime.
* Create a [Gridstack](https://gridstackjs.com/) demo.
* For uibindex page: sort the url list.
* For templates, show the dependency list.


## Answers needed

## Ideas

* Move uib-brand.css to a new sub-package. Publish separately.
* Enhance CSS with ideas from [OpenProps](https://open-props.style).
* Move all runtime code to ESM's and rely on ESBUILD to build the runtime. This will allow us to use the latest JS features but retain backwards compatibility.

## New documentation

* A "Creating UI's" section - showing how to create different UI structures
  * Grid layouts
  * Dashboard layouts
  * Forms
  * Tables
  * Charts
  * Maps
  * Articles
  * Lists
  * Cards

## Videos

* uib-sidebar: How to use the new uib-sidebar node.
* Updates on how to have data-driven updates to the UI.
