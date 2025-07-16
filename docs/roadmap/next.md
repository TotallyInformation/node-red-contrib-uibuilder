---
title: Possible Future Features
description: |
  What is being worked on for the next release.
created: 2025-01-05 12:34:47
updated: 2025-07-16 21:29:42
author: Julian Knight (Totally Information)
---

## In Progress

* Router improvements
  * [ ] Auto-menu generation for menus.
* Background rework (may take several releases):
  * [ ] Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
  * [ ] Remove remaining ~~5~~ 4 fsextra functions from fs lib. `ensureDirSync` is completed.
  * [ ] Move all nodes editor html to use modules. [Ref](https://discourse.nodered.org/t/text-javascript-vs-module-in-html/94215/4)
  * [ ] Rename all .js node.js files to .cjs to avoid confusion with ESM modules.
  * [ ] No need to pass uib var now it is in a module, can simply require it. (Except for libs/fs which is already used by the uib module).

## To Fix

* Failed rename of instance folder may get stuck.
* Form CSS: 
  * Input fields should not have a black background in light mode.

## To Do

* [ ] Dialog
  * [ ] component(?) that can consume a template and display it as a dialog. [ref](https://discourse.nodered.org/t/uibuilder-help-in-developing-a-dashboard/97478/18)
* [ ] Reactivity - phase 1
  * [x] Create a reactive wrapper `uibuilder.reactive()`.
    * [x] Move to separate class file
    * [ ] Add `reactive` and `getReactiveClass` to function reference.
  * [ ] Create a MutationObserver for any DOM attributes that start with `:` (`uib-bind`) or `@` (`uib-on`).
    * [ ] Extend to allow `uib-show` (show/hide elements).
    * [ ] Extend to allow `uib-text` (innerText).
    * [ ] Extend to allow `uib-model` (two-way data binding for input elements).

* [ ] For the `uib-topic` attribute, allow msg.payload to be an array or object. Consider adding a `uib-fmt` attribute to allow output specification:
  * `uib-fmt="json"` - output as a syntax highlighted JSON object.
  * `uib-fmt="list"` - output as an HTML list.
  * `uib-fmt="table"` - output as an HTML table.

* [ ] Allow overriding of the JSON max upload size for the custom Express server. [Ref](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988)

* CSS
  * [ ] Make `form > label` use a variable for `align-self`. 

* Documentation
  * [ ] Add content to Lists, Maps, Tables, Dashboard Layouts, Cards, Articles.
  * [ ] Properly document file uploads and how to handle them. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] Add thanks to the contributors in the readme.

#### Consider

* Auto-generate a manifest web endpoint that delivers a manifest file for the current uibuilder instance. This would allow clients to have a faster startup. [ref](https://discourse.nodered.org/t/add-pwa-feature-to-uibuilder/97807/2)
* For onTopic and uib-topic, allow wildcards in the topic name.
* Move log reference into the `uibGlobalConfig` object. Remove passed references.
* Some form of more direct RPC implementation between client and server. What functions might the server be able to do for the client? What might the server want to ask of or control on the client?
  * A latency test might be useful.
* Having a different web icon for the docs pages from actual uibuilder instance pagess. This would allow the user to easily distinguish between the two.
* Implement the `dom` (`tinyDOM`) FE library.
* Implement the `logger` FE library.
* Adding `hooks` to web.js to allow easier header overrides. `httpHeaders`.
* Add a link to the uibuilder help sidebar that has an `onclick` handler: `RED.actions.invoke('core:show-import-dialog')`
* New help doc re CORS. [Ref](https://discourse.nodered.org/t/allow-cors-for-ui-builder/94838).
* Get node-red to tell connected clients that it is closing/restarting. The client library should then close the connection and attempt to reconnect with a sensible delay. A reconnection should NOT trigger a cache replay. Maybe get the server to tell the client when to start reconnecting by sending a retry period - the client should slightly randomise that period to avoid all clients reconnecting at the same time.
* **BIG** How to have a "live" feature. This would be a mix of http-in/-response and uibuilder nodes. It would create a live endpoint that would be pre-populated with the uibuilder default ESM template. Would allow server-side rendering. See [live.md](live.md)
* Move the uib-brand CSS to a separate package. Publish separately. Possibly as a sub-package of uibuilder.
* Move ti-base-component to a separate package. Publish separately. Include here.
* Check message sizes. If >limit, split into chunks and use standard msg.parts to allow reassembly - both on the server AND on the client. Allow auto-splitting of messages for large messages and use the msg.parts feature from node-red core to allow easy re-constitution.
* Allow http responses using transfer encoding chunked. [Ref](https://discourse.nodered.org/t/http-transfer-encoding-chunked/94332/6).
* Add a pwa builder. Generate a manifest and service worker. [Ref](https://discourse.nodered.org/t/pwa-support/94332/6).
* New possible node: `uib-events` - a node that listens for events from the uibuilder runtime.
* Create a [Gridstack](https://gridstackjs.com/) demo.
* For uibindex page: sort the url list.
* Consider creating templates or examples from flows in my dev instance.
* For templates:
  * Show template version in the uibuilder node.
  * Replace all template eslint configs with new version (see actions example). Also add stylelint. And update pacage.json.
  * Add fe dependencies install button to uibuilder node.
  * Add option for auto-install of dependencies when using an external template.
  * Show the dependency list.
  * Check for external template udpates.
  * Add std npm scripts: `build`, `createGit`, `commit`, `push`.
  * Maybe move dependecy list for external templates to its package.json?
  * New external templates? GRID and FLEX. (or just use examples?)
* Prepare for ExpressJS v5. Not likely to arrive before Node-RED v5 but quite a few breaking changes. [Ref](https://expressjs.com/en/guide/migrating-5.html)
  * `nodes/libs/admin-api-{v2,v3}.js`
  * `nodes/libs/web.js`
  * [Path route matching syntax has changed 😵‍💫](https://expressjs.com/en/guide/migrating-5.html#path-syntax)
* web worker support.
  *  Add a `uib-worker` endpoint (per instance) that serves a worker script.
  *  The worker should handle uibuilder comms. Would need a shared worker and that does not work with Safari.
  *  It should be created dynamically based on the instance. So that it is pre-defined with the correct Socket.IO namespace, etc.
* A manifest file for offline use.
  *  Requires a change to the templates.


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
