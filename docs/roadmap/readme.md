---
title: uibuilder Roadmap
description: >
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
updated: 2026-04-19 19:06:08
---

Is there something in this list you would like to see prioritised? Is there something you could help with? Please get in touch via the [Node-RED forum](https://discourse.nodered.org/). Alternatively, you can start a [discussion on GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) or [raise a GitHub issue](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues). Please note that I no longer have the time to monitor the #uibuilder channel in the Node-RED slack.

> [!NOTE]
>
> This page is in the process of being re-organised into multiple pages to make it easier to navigate and understand.

For more information about the future of UIBUILDER, please see the [Futures page](roadmap/Future.md)

## Detail pages
* Documentation improvements - [/roadmap/doc-improvements](/roadmap/doc-improvements)
* Site template improvements - [/roadmap/site-templates](/roadmap/site-templates)
* Videos to produce - [/roadmap/videos-to-produce](/roadmap/videos-to-produce)
* Speculative ideas, may never happen - [/roadmap/maybe](/roadmap/maybe)
### Front-end
* Built-in web components - [/roadmap/front-end/web-components](/roadmap/front-end/web-components)
* Main client library - [/roadmap/front-end/client-library](/roadmap/front-end/client-library)
* SPA router library - [/roadmap/front-end/router-library](/roadmap/front-end/router-library)
* UI library - [/roadmap/front-end/ui-library](/roadmap/front-end/ui-library)
* Styling (`uib-brand.css`) - [/roadmap/front-end/styling](/roadmap/front-end/styling)
### Libraries
* `libs/fs.cjs` and front-end - [/roadmap/libs/fs](/roadmap/libs/fs)
* `libs/package-mgt.cjs` and front-end - [/roadmap/libs/package-mgt](/roadmap/libs/package-mgt)
* `libs/socket.cjs` and front-end - [/roadmap/libs/socket](/roadmap/libs/socket)
* `libs/web.cjs` and front-end - [/roadmap/libs/web](/roadmap/libs/web)
### Nodes
* Caching with `uib-cache` - [/roadmap/nodes/caching](/roadmap/nodes/caching)
* No-code `uib-element` - [/roadmap/nodes/uib-element](/roadmap/nodes/uib-element)
* `uib-file-list` - [/roadmap/nodes/uib-file-list](/roadmap/nodes/uib-file-list)
* Server no-/low-code conversion`uib-html` - [/roadmap/nodes/uib-html](/roadmap/nodes/uib-html)
* Instance file save `uib-save` - [/roadmap/nodes/uib-save](/roadmap/nodes/uib-save)
* `uib-sender` - [/roadmap/nodes/uib-sender](/roadmap/nodes/uib-sender)
* No-code `uib-tag` - [/roadmap/nodes/uib-tag](/roadmap/nodes/uib-tag)
* No-code `uib-update` - [/roadmap/nodes/uib-update](/roadmap/nodes/uib-update)
* `uibuilder` - [/roadmap/nodes/uibuilder](/roadmap/nodes/uibuilder)

## Possible Future Nodes

These are just thoughts about possible future nodes. They may or may-not happen.

#### ⭐`uib-ctrl`

Route different types of control msgs to different output ports: `cache` ("client connect"), `network` ("client connect", "client disconnect"), `visibilty`, `routing` ("route change"). Maybe link to a uib instance so that it can be separate.

#### `uib-watch`

Watches a given uibuilder instance folder and reports changes. With option to auto-reload connected clients (remote command).

#### `uib-markdown`

Renders markdown to html using Markweb's markdown engine. Allow use of Markweb's templating features to allow dynamic content. Maybe with low-code output option as well as direct HTML output option.

#### `uib-file-change`

Watches for changes to files for a specific uibuilder instance. Allow folder choice, filtering (via fast-glob). Triggers an output on-change. Output can be a folder/file list OR a URL list (or maybe both). Could then be used to simply reload any connected clients automatically, trigger backups or something else entirely.

#### `photoweb`

In the same style as `markweb`, a single-node photo library viewer. See designs folder for details.

#### `uib-remote`

New node to simplify executing remote commands on the front-end

#### `uib-component` (or `uib-custom`?)

Like uib-element but auto-installs a web component library. Specify the library name, drop-down prefix for local (e.g. installed using library mgr) or jsdelivr CDN.

#### `uib-meta`

Links to a uibuilder node and returns the instance metadata including URL's and folder locations and other settings. (e.g. use with [node-red-cleanup-filesystem](https://discourse.nodered.org/t/announce-node-red-cleanup-filesystem-request-for-testing/88135) for example).

#### `uib-template`

New node to take a `msg._ui` template input and update parts of it before sending (e.g. parent, id, ...). Alt. name ideas: `uib-override` or `uib-config`? [Ref](https://discourse.nodered.org/t/an-idea-for-third-party-ui-in-ui-builder/83196/4?u=totallyinformation).

#### `uib-events`

Outputs uibuilder standard messages (or maybe both std and control) but is separate from the uibuilder instance node and can be filtered by user, client, page as well as the instance. May be helpful to some people to simplify flows without using lots of link nodes.

`uib-fe-events`

Captures actual front-end events (e.g. custom events) and forwards them to Node-RED either as std or ctrl (?) messages.

#### Maybe

##### `uib-file-read`

Reads a file for a specific uibuilder instance. Allows, for example, the file to be passed to the FE for editing.

##### `uib-parse`

Use Cheerio or DOMParser to convert HTML to low-code JSON. [Ref](https://blog.apify.com/javascript-parse-html/). Could be extended to form the basis of automated no-/low-code -> HTML -> and back testing. Or for accessibility testing.

##### `uib-extract`

A node that uses JSDom to select from HTML and return as html/text/attribs as needed (as per updated `$()` fn). [Ref 1]([GitHub - chishui/JSSoup: JavaScript + BeautifulSoup = JSSoup](https://github.com/chishui/JSSoup)), [Ref 2](https://www.npmjs.com/package/x-ray).

##### `uib-router`

This would connect a route handler flow to an existing `uibuilder` node. A bit like an `http-in` node but not needing an `http-out` because the out is via the `uibuilder` node. Would allow wildcard routing and ability to restrict by method. The defined path(s) would be added as a new router to the uibuilder routes. Consider whether this needs to be a `uib-router-in`/`uib-router-out` pair instead?

##### `uib-diagrams`

Consider implementing at Kroki diagram service node - https://kroki.io/ - enables delivery of diagrams from text descriptions using many different libraries.

##### `uib-read-all-front-matter`

Reads a folder recursively and compiles all YAML Front-Matter entries into a single return. Use with `uib-file-change` to update when files change. Probably not needed now that Markweb exists.


## Ideas or in-progress

To see what is currently being developed, please look at the "Unreleased" section of the [Changelog](changelog) for the `dev` branch.

### Misc

* Get node-red to tell connected clients that it is closing/restarting. The client library should then close the connection and attempt to reconnect with a sensible delay. A reconnection should NOT trigger a cache replay. Maybe get the server to tell the client when to start reconnecting by sending a retry period - the client should slightly randomise that period to avoid all clients reconnecting at the same time.
* Move log reference into the `uibGlobalConfig` object. Remove passed references.
* Create a [Gridstack](https://gridstackjs.com/) demo.
* Consider creating templates or examples from flows in my dev instance.
* Consider adding a `data-initVars` attribute to the client script load. This would automatically take `window.xxxx` variables and `set` them as uibuilder variables as early as possible. This would allow early setting of these variables for use in the client's reactive features. Would also need to be specified as a query parameter on the script src for processing in ESM.
* Move ti-base-component to a separate package. Publish separately. Include here.
* Move the uib-brand CSS to a separate package. Publish separately. Possibly as a sub-package of uibuilder.
* Some form of more direct RPC implementation between client and server. What functions might the server be able to do for the client? What might the server want to ask of or control on the client?
  * A latency test might be useful.
* Implement the `dom` (`tinyDOM`) FE library.
* Implement the `logger` FE library.
* **BIG** How to have a "live" feature. This would be a mix of http-in/-response and uibuilder nodes. It would create a live endpoint that would be pre-populated with the uibuilder default ESM template. Would allow server-side rendering. See [live.md](live.md)
* Check message sizes. If >limit, split into chunks and use standard msg.parts to allow reassembly - both on the server AND on the client. Allow auto-splitting of messages for large messages and use the msg.parts feature from node-red core to allow easy re-constitution.
* Allow http responses using transfer encoding chunked. [Ref](https://discourse.nodered.org/t/http-transfer-encoding-chunked/94332/6).
* Move all runtime code to ESM's and rely on ESBUILD to build the runtime. This will allow us to use the latest JS features but retain backwards compatibility.
* Consider adding some telemetry. Idea being to better understand how many instances are in use, which versions and what platforms. Perhaps also detecting which browser types are in use to help steer coding. Would need to be opt-out, transparent and documented. Might use a [non-reversible device id?](https://www.npmjs.com/package/node-machine-id).
  * An interesting pre-cursor to this might be to create an internal track of front-end client use. E.g. count the max # users connected to an instance and perhaps what browsers they are using (initially this would not be sent anywhere but would be accessible via the info page and written to a json file in each instance root folder).

### All nodes

* Incorporate ideas from: https://www.htmhell.dev/adventcalendar/2023/2/
* More flexible low-code class attribute handling.
  * In ui.js
    * [ ] Update the low-code schema's with add/remove/replace `classes` property
    * Update all fns to use the extra property   
  * In nodes - update to allow using array of classes and to have add/remove class arrays
    * In uib-update
    * In uib-element
    * In uib-tag

### Examples

* Update text update example to include new `uib-topic` html attributes

### New/Improved no-code elements

#### New

* `navigation menu` - to work with the router. Add nav menu example, working with `uib-file-*` nodes.

* Multi-state switch (AKA button row). [ref](https://discourse.nodered.org/t/dashboard-2-multi-state-switch/85168/14)

* Layout

  * Start with grid layout

* Buttons

  * All buttons should allow image (icon), main text and sub-text ([ref](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras))

  * [ ] Toggle/3-way
  * [ ]

* Individual Form Elements

  This is to enable additional form elements to be added to an existing form.

  * [ ] Select - https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html

  * [ ] Combo

  * [ ] Input

  * [ ] button (NB: add type="button" to avoid form submit issues, click=uibuilder.eventSend by default)

    * Types:

      * Basic: click only, text
      * Toggle: click on/off
      * Advanced: opens up overlay with an input field with selectable type (colour, value, slider, switch).
    * Parts: Icon, title (next to icon), (sub)text (below icon/title) - any of which can be optional.

  * [ ] iFrame

    As for [ui-iframe](https://flows.nodered.org/node/node-red-node-ui-iframe)

* [ ] Charts

  * [ ] Sparkline. Refs: [1](https://github.com/fnando/sparkline/blob/main/src/sparkline.js), [2](https://www.codedrome.com/sparklines-in-javascript/), [3](https://github.com/CodeDrome/sparklines-javascript/blob/master/sparklinedemo.htm), [4](https://github.com/rikukissa/node-red-contrib-image-output/blob/master/image/image.html), [5](https://github.com/mblackstock/node-red-contrib-data-view)

* [ ] Gauges

  Refs: [1](https://github.com/johnebgood/node-red-contrib-inline-gauge/blob/main/gauge/gauge.html)

* [ ] Editable List - [ref](https://github.com/mdn/web-components-examples/blob/main/editable-list)
* [ ] TTS text-to-speach output
* [ ] Status Box, Status Panel - [ref](https://discourse.nodered.org/t/web-endpoint-status-dashboard-uibuilder-zero-code-example/75740)
  A segmented vertical/horizontal status/progress panel. For things like battery displays, etc.
  Each status box has a coloured sidepanel to show the status.
* [ ] Toggle button, Toggle button panel (AKA Switch)
  Similar to the status box/panel but for buttons. https://www.w3.org/WAI/ARIA/apg/patterns/switch/
* [ ] Tab container and tabs
  Include events that trigger and send msgs back to Node-RED on tab change.
  What is the best way to hide/unload the non-current tabs?
* [ ] Layout: Grid/Flex-Grid
  Standardised layout. With option to turn on visible grid to help with layout.
* [ ] tbody
  Additional table body sections. [ref](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tbody#multiple_bodies)
* [ ] notify (globalNotification)
* [ ] Modal Dialogue
  `window.prompt`, `window.confirm`, `<dialog>`
* [ ] LED (on/off/colour/brightness), LED panel
  As for [ui-led](https://flows.nodered.org/node/node-red-contrib-ui-led)
* [ ] Status timeline
  Maybe uPlot with timeline plugin? [ref](https://github.com/hotNipi/node-red-contrib-ui-state-trail/blob/master/ui-state-trail.js)
* [ ] Image.
  Allowing for buffer->data-uri->img-tag, data-uri->img-tag, URL->img-tag. [ref](https://flows.nodered.org/node/node-red-contrib-image-tools)
* [ ] Container
  Standard layout. With option for drag/drop of contents. [ref](https://discourse.nodered.org/t/is-there-a-pallete-that-can-do-this/75143?u=totallyinformation)
* [ ] Style/Theme changer.
  Extended version of the one in my experimental W3C Components repo. Will let you change between light/dark mode, change base colours, etc. [Example component](https://github.com/TotallyInformation/web-components/blob/main/components/uib-theme-changer.js)
* [ ] Accordion
  [ref](https://css-tricks.com/quick-reminder-that-details-summary-is-the-easiest-way-ever-to-make-an-accordion/)
* [ ] Pill list, scrollable search - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/

#### Improvements

* [ ] "Text Box" type
  * [ ] Allow `msg.payload` to be an array with each entry being a new para.

* [ ] List (ol/ul/dl) - [Ref](https://flows.nodered.org/node/node-red-node-ui-list)
  * [ ] Custom icons
  * [ ] Drag & Drop rearrange
  * [ ] Action - Click, Button, checkbox, switch, drop (reorder)
  * [ ] Better validation of input data
  * [ ] list-style-type (add to outer) - several options plus text (incl emoji's)
  * [ ] Collapsable list style. [ref](https://github.com/mdn/web-components-examples/blob/main/expanding-list-web-component)
  * [ ] ? Optional list leading/trailing text ?
* [ ] Forms
  * [ ] Add hidden error div with suitable id.  [ref](https://discourse.nodered.org/t/dynamic-config-dashboard/84531/31)
  * [ ] Allow definition of error text.
  * [ ] Forms assume only 1 per page (actually probably all the elements do?) - form inputs should have really unique id's.

  * Check if textarea sizes can be changed - specifically the number of lines. Similarly for select-multiple.
  * Add option for blank line.
  * Add option for an info line (supporting HTML? Markdown?)
  * Add a "Simple Form Immediate" version where every element sends its own changes back to Node-RED and where send/reset buttons are not added.
  * **Improve range slider** - with min/max and current value indicator (possibly as a separate, linked number input box) - may need an `oninput` handler
  * Better validation of input data
  * Additional input types: file (need to process uploads to NR), combo, image.
  * Eventually add extended inputs such as HTML WYSIWYG/Markdown
  * Add Auto-complete for text inputs
  * If no button added, make each input send changes direct - or possibly add that as an optional setting.
  * Rich text edit (Markdown? HTML?)
* [ ] Card/Article

  * Better layout, more optional internal structure (footer, etc)
* [ ] Table

  * Add class names to body cells (`r1 c1`, etc) & body rows (`r1`).
  * Add id to table `${divId}-table`
  * Additional field definitions in input data
  * Better validation of input data
  * Caption
  * If named row comes from a field, make sure it is the 1st col and marked as a th
  * Add data-row-name to td's as well
  * See also: https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
  * Consider: https://github.com/tofsjonas/sortable - perhaps adopt data-sort attribs?

### General changes

* Consider adding an Editor plugin that adds a sidebar tab to show: All uibuilder instances (with links to the node AND the page), All library and other standard endpoint references.

* **Collapsible list**: Either built-in class/js or a web component. [Ref](https://chatgpt.com/share/e32ce7f8-7b86-45e7-ae9d-69d167c37a14). NB: Allow for nav menus as well as normal lists. Also consider collapsible para's.
* **FE: Drag/drop**: draggable class, drag-container class (to constrain drag area). Use `moveElement` fn. On drop, send change notice to Node-RED as control msg.

* Need to improve url change for dependent nodes. Currently have to reload the editor to get the new url. Should happen live (on save of uibuilder).
* Include source node data in `msg._ui` & an optional 2nd output on no-code nodes to allow interactions from elements to be routed direct to the source node.
* Allow control of browser html cache from Node-RED. Add an auto-restore on load option. (? Add send updates back to Node-RED option - control msg ?)
* Add automatic `search` handler for all uibuilder endpoints - [Ref](https://developer.mozilla.org/en-US/docs/Web/API/Window/location#example_5_send_a_string_of_data_to_the_server_by_modifying_the_search_property)
* Add endpoint creation APIs
* Change runtime parameter passes of `uib` to `globalThis['ti-uibuilder'].uib`
* Consider moving all handling of uib's package.json into a single lib. Only allow a single function to read/write/update
* Provide a common location and some standards to enable people to craft and share custom elements. Install using library mgr? Or as an NR plugin?
  * enableOnEdit (optional) If set to true, this tab will be accessible whilst the edit dialog is open. Default: false.
* Consider adding a uibuilder custom library - [ref](https://github.com/node-red/node-red-library-file-store).
* gauge tiles - web component or new element? [ref](https://discourse.nodered.org/t/dashboard-2-beta-development/83550/133?u=totallyinformation)
* **Example stand-alone node package as exemplar**

  * https://github.com/TotallyInformation/nr-uibuilder-uplot
  * probably chart
  * How to pass data through?

### NEW FEATURE: Create package.json template for Node-RED projects

[Reference](https://discourse.nodered.org/t/uibuilder-install-default-packages-when-creating-a-node-red-projects/88496/6?u=totallyinformation)

An optional template package.json in `<uibRoot>/.config/projectPackage.json` where the `dependencies` are pre-requisite modules for new Node-RED projects.

Initial thinking is that there will be a new but optional file in the <uibRoot>/.config/ folder, called something like projectPackage.json. It would be, I think a sub-set of a standard package.json A full package.json on 2nd thoughts so that it would be easy to copy/paste your current <uibRoot>/package.json. That will let you include a default version, description, etc if you wish along-side the dependencies.

I will attempt to also trap a new project create to run the install if I can. Otherwise, it will display a notification for the user to run that manually. Not certain whether Node-RED will have to be restarted, I will try to avoid that but it might not be possible. Will have to test.

## WIKI

* Update examples
* [Helmet Example](https://www.npmjs.com/package/helmet)

## Flows site

* https://flows.nodered.org/flow/bbe6803d9daebda5c991336cf4e5e3e0

## Examples

* Use of `msg._client`
* Add example for sending msg using function node
* `uib-sender` - remove ref to uibuilderfe and update flows.
* Navigation **menu** examples. 1x Router, 1x page.
* Extend SVG example to download and save the svg from the gist
* Add a "Quick Start" example.
* Update the uib-element example.
* Update the remote-commands example.
* Zero-code example needs better wording for UL/OL example. [ref](https://discourse.nodered.org/t/documents-6-1-0/74885/47)
* Reproduce the examples from the [pdfmaker website](http://pdfmake.org/playground.html) since that uses a similar-style config-driven approach to uibuilder's low-code, config-driven UI feature. See especially the _tables_ example.
* Add example for Vue sfc loader.
* Ticklist

  * Send a list
  * Attach click handler to switch list type from bullet to ticked & msg node-red
  * Save changes to cache on click
* Table

  * Weather example?
* Telegram web app. [ref1](https://github.com/revenkroz/telegram-web-app-bot-example)
* [Perspective](https://perspective.finos.org/) - interactive data dashboard


## Questions that need answers

* How best to allow other nodes to provide zero-code nodes - that allow auto feedback from the front-end? e.g. something like the [node-red-contrib-ui-time-scheduler](https://github.com/fellinga/node-red-contrib-ui-time-scheduler) node.
* How to provide a better log output? With a simple way to link to Node-RED log output (filtered) as well as a dedicated output node. That output's to a web page with highlighting and possibly page back/fwd through history.

## UIBUILDER v8 planned breaking changes

* [ ] None yet - Major version changes typically include a new baseline node.js version though.

## Ideas for releases further out

### Changes needed for future versions of node.js

* https://nodejs.org/en/about/releases/, https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V14.md, https://node.green/

#### Node.js v14 features - code updates to leverage the latest features

* [x] ~~Replace `||` default value tests with `??` . Replace checks for if a property exists with `?.` - [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), [Nullish Coalescing](https://wiki.developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_Coalescing_Operator)~~ - started using
* [x] ~~Object.fromEntries (helps make an object either from Map or from a key/value array)~~ - already in use
* [ ] **==Private Class methods==** (v14.5.1+)
* [ ] **==Optional catch binding==**
* [ ] [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DisplayNames)
* [ ] [calendar &amp; numberingSystem for Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
* [ ] WeakReferences (v14.5.1+)
* [ ] Array flat and flat map
* [ ] `fs.rm` (with recursive and force options)
* [ ] ``crypto.randomUUID()``
* Experimental diagnostic reports. https://developer.ibm.com/articles/introducing-report-toolkit-for-nodejs-diagnostic-reports/, https://github.com/IBM/report-toolkit

#### Changes due once Node.js v16 live:

* [x] Change style of requiring core node modules: `require('node:os')` instead of `require('os')` - started, ongoing
* [ ] JSON Modules (experimental in v14, full in 16.15.0)
* [ ] **==Object.hasOwn is a static alias for Object.prototype.hasOwnProperty.call (16.9.0)==**
* [ ] [Error cause](https://v8.dev/features/error-cause) (16.9.0)
* [ ] [Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) (16.6.0) - allows use of negative indexes.
* [ ] Stable Timers Promises API, RegExp Match Indices, which provide the start and end indices of the captured string (16.0.0)

Refs: [release notes](https://nodejs.org/en/blog/release/v16.0.0), [What&#39;s New In Node.js 16?](https://www.howtogeek.com/devops/whats-new-in-node-js-16/)

#### Changes due once Node.js v18 live (EOL Apr 2025)

* [ ] [Socket.IO with WebTransport](https://socket.io/get-started/webtransport) - requires https
* [ ] [`findLast` and `findLastIndex` array methods](https://v8.dev/features/finding-in-arrays) (18.0.0)
* [ ] Top-level await
* [ ] Improvements to the `Intl.Locale` API.

* [ ] The `Intl.supportedValuesOf` function.
* [ ] Improved performance of class fields and private class methods (the initialization of them is now as fast as ordinary property stores).
* APIs now exposed on the global scope:

  * [ ] Blob - https://nodejs.org/api/buffer.html#class-blob
  * [ ] BroadcastChannel - https://nodejs.org/api/worker_threads.html#class-broadcastchannel-extends-eventtarget
  * [ ] Fetch
* Experimental

  * Fetch
  * Web Streams API
  * Test Runner
  * watch run mode (restarts the process)

#### Changes due once Node.js v19 live

* [ ] Web crypto: `globalThis.crypto` or `require('node:crypto').webcrypto`
* [ ] `Intl.NumberFormat` v3 API is a new TC39 ECMA402 stage 3 proposal extending the pre-existing `Intl.NumberFormat`.
* npm@8.19.2

#### Changes due once Node.js v20 live

* Test Runner module
* `String.prototype.isWellFormed` and `toWellFormed`
* Methods that change Array and TypedArray by copy
* Resizable ArrayBuffer and growable SharedArrayBuffer
* RegExp v flag
* Synchronous import.meta.resolve()
* Consider the experimental permission model

#### Changes due once Node.js v21 live

* [ ] Stable Fetch
* [ ] Stable Webstreams
* [ ] [Array grouping](https://github.com/tc39/proposal-array-grouping)
* `ArrayBuffer.prototype.transfer`
* [ ] Global `navigator` object.

#### Changes in Node.js v22

* [ ] Migrate from commonjs to [ES modules](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_commonjs_json_and_native_modules). (2) [JSON can&#39;t be imported directly in ESMs](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_json_modules), Requires Node.js post v22.  [Ref1](https://discourse.nodered.org/t/new-structure-for-building-node-red-nodes/90538), [Ref2](https://github.com/AllanOricil/node-red-node-es-template), [Ref3](https://github.com/AllanOricil/node-red-node).
* [ ] `glob` and `globSync` - external glob package no longer required - `fs.glob()` and `fs.globSync()` functions
* [ ] Native WebSocket available
* [ ] Native watch mode `node --watch` - `node --watch-path=src --watch app.js`
* [ ] `util.styleText()` - instead of the chalk library

  ```javascript
  import { formatWithOptions, inspect } from 'node:util';
  console.log(formatWithOptions({ colors: true }, '%O', { key: 'value' }));
  ```

* [ ] `Array.fromAsync()` and new set-theoretic operations on `Set` objects
* [ ] `Promise.withResolvers()`, a static method that separates promise creation from its resolution mechanics.

  ```javascript
  const { promise, resolve, reject } = Promise.withResolvers();
  setTimeout(() => resolve('Done'), 1000);
  const result = await promise;
  ```

* `require()` Support for ES Modules - Ability to `require` ESM's synchronously
  
* Experimental
  
  * `node --run pkg-script` - run without `npm`


#### Changes due once Node.js post v20

  * Diagnostic channels (experimental in v14)

  * AbortController and AbortSignal (experimental in v14)

  * Permission model (experimental in v20)

  * `URLPattern` (experimental) - enables `new URLPattern({ pathname: '/users/:id' })`

#### v23

* experimental support for Web Storage APIs, including `localStorage` and `sessionStorage`
* `node --run 'console.log("Hello, Node.js 23!")'`
* Experimental
  * SQLlite support


#### v24

* `dirent.path` -> `dirent.parentPath`
* The `fs` module introduced a runtime deprecation for `F_OK`, `R_OK`, `W_OK`, and `X_OK` getters exposed directly on `node:fs`. Get them from `fs.constants` or `fs.promises.constants` instead.
* `process.assert` -> `node:assert` module.
* `Float16Array`: a typed array for 16-bit floating-point numbers, useful in performance-sensitive numerical computations.
* `RegExp.escape()`: a utility to safely escape strings for use within regular expressions.

* `Error.isError()`: a static method to determine if an object is an instance of an error.

* **WebAssembly Memory64 support**: enabling 64-bit memory addressing in WebAssembly modules.

* Support for `using` and `await using` declarations for deterministic resource management.

* Expanded **browser-native Web APIs**:

  * The `URLPattern` API is now globally accessible without import, allowing pattern matching on URL components according to standard URL pattern syntax:

    ```javascript
    const pattern = new URLPattern('/users/:id');
    const result = pattern.exec('/users/42');
    console.log(result.pathname.groups.id); // 42
    ```

  * Native implementations of `ReadableStream`, `WritableStream`, and `TransformStream` support the Web Streams specification, facilitating composable and interoperable stream processing.
  * The `structuredClone()` function is provided globally to perform deep cloning of complex data structures, consistent with the browser environment.
  * The introduction of `MessagePort` facilitates message passing and worker thread communication.


### Other Ideas

* PAGE CREATOR: Something that creates a new page file from template. Could be an extension to uib-save?

  * Maybe also a way to track pages? A catalogue? Maybe also an API to return all HTML file names as an array?
  * Consider scraping all .html files in each uibuilder instance and building an auto-list that can be added to the `../uibuilder/apps` page. Possibly with a manual override list option.
  * Add functions to not only reference page-names/urls but also to automatically create menus.
  * [Ref](https://discourse.nodered.org/t/why-would-i-want-to-use-uibuilder/81683/7?u=totallyinformation)

* THEME CONFGURATOR: Something that allows manipulation of theme settings from within Node-RED

* Consider using element setHTML() method if DOMsanitise is not available. [Ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)
* Change fixed text to use `RED._` for l8n. See: https://discourse.nodered.org/t/flexdash-alpha-release-a-dashboard-for-node-red/65861/48. [ref](https://discourse.nodered.org/t/question-on-internationalisation-can-i-have-1-json-file-for-several-nodes/76300/2)
* NEW NODE: `uib-room` - linked to a uibuilder node, creates a socket.io room. Will need a way to tell the connected clients to subscribe to the room (optional) and FE fns to connect/disconnect from rooms.
* UIB index page - new node? Default to root url. Show all instances by default, optional pages? Include descriptions. Selectable list of instances/pages. Allow for multiple instances of the node with different settings. CSS.
* ?For no-code nodes that might have class selectors - add a search button that searches the uib-brand.css?
* ?Have a toggled UI button that opens the Node-RED Editor to the correct location for the URL?
* Add custom internal store for any uibuilder nodes that want one - so that users don't have to manually configure a file store. Could be based on DuckDB.

* Some way to visually expose (to clients) a library of JavaScript functions with their args as inputs. Maybe make this a cmd that pulls a doc from Node-RED? (keeps client lib small)
  * Using the above to visually show available uibuilder fns with inputs and outputs.
* Add optional TELEMETRY output (maybe linked to the log functions) - add mqtt endpoint to uibuilder settings.js (or maybe websocket?)

* Consider creating a test install script that allows creation of a clean node-red install using the alt installer, adds uibuilder, asks for a port.



### Wacky Ideas?

* Using [Pyodide](https://pyodide.org/en/stable/index.html) to run Python natively in Node-RED.
* [RxDB](https://rxdb.info/) - new nodes including a db server attached to Node-RED using RxDB's http server?

### Thoughts on JavaScript tabular data manipulation and visualisation

* An editable table widget for the browser where data changes are sent back to Node-RED.
* Some DataFrame style tools for manipulating 2d tabular JSON data.

  * Using msg._ui low-code - facilitating quick table updates from Node-RED.
  * In Node-RED functions - enabling simpler manipulation of 2d JSON data.
  * In the browser - as above.
* A live JavaScript interpreter in the browser that would let users do Jupyter notebook style interactions with browser data.

[Ref](https://discourse.nodered.org/t/noisecraft-anyone-heard-of-it/79813/19)

### General

* Consider creating a module that uses [gridstck.js](https://gridstackjs.com/#) where each grid entry gets a unique html ID. Needs a way to save the grid as HTML without the amend widgets but also as a gridstack object to allow re-editing.
* Optimise runtime code using esbuild (see node-build.mjs). Reduce runtime dependencies by bundling and move deps to dev deps.
* Allow client id to be set externally.
* ~~Add client identifier chooser to cache node - allowing use of different msg props to identify a specific client~~ *No need for the complexity, can use a switch node to filter*.
* Add package.json `style` property to Instance details page and packages list if it exists.
* Add option to log http(s) requests to control output port
* Switch to [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) for require's with low probability of usage. [ref](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_import_expressions).
* Add settings.js options to use different paths/names for middleware files.
* Add socket.io instrumentation server. See https://socket.io/docs/v4/admin-ui/
* Consider the use of `RED.comms.publish('uibuilder:some-event-name', data, retainFlag)` to push data to the editor (using `RED.comms.subscribe` in the Editor)
* Consider allowing control msg for each request
* Revisit `elementIsVisible` - requires probably 2 fns at least. A monitor and a one-off check. One-off requires a separate observer function for each.

### Templates

* Serve instance package.json `dependencies` on `../uibuilder/vendor/` path

  * Or maybe on `./vendor/`? That might be more consistent and avoid other issues/changes?
  * Complexity: this would end up with packages installed locally - would the uib central packages be recognised? Maybe use `uibuilder.dependencies` instead?
  * Change '../../templates/template_dependencies' in api v3
  * Update built-in templates to use package.json
* watcher
* Add a new template and example to demonstrate the sender node.
* Template - Docsify CMS
* Add uibuilder property to template package.json files to define
  * uibuilder version checker - https://github.com/npm/node-semver
  * required fe packages
  * watch - dict of watches: `{'path':'scriptname'}` or `{['path1',...]:'scriptname'}`
  * add `dependencies` to `../uibuilder/vendor/` path

---

## Rejected & Why Not

[Rejected entries](roadmap/Rejected) - Don't repeat the mistakes!

### Why not?

* Use a config node to define uibuilder endpoints?

  Because the UX would be worse. When uibuilder and related nodes are pasted or imported, the URL has to be blanked to help ensure there are no duplicates. With this buried in a config node, it would likely be less visible and harder for people to understand.

## OLD

[Archived old entries](roadmap/Old)
