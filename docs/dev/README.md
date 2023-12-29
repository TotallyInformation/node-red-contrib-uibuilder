---
title: Developer Documentation
description: >
  Deep dives into the internals of UIBUILDER. This is where to go if you need to understand how things work. These documents may lag behind the actual code however, so it is always worth also referencing the current codebase.
created: 2019-06-16 16:16:00
lastUpdated: 2023-10-08 15:12:02
---

## Processes

* [Processes](processes/README.md)

## Dependencies

Due to its complexity, UIBUILDER has a higher than Node-RED average of external dependencies. Over time, these are reduced (e.g. `nanoid` can be replaced by a native library from node.js v19).

### Client library dependencies

* [Socket.IO Client](https://www.npmjs.com/package/socket.io-client) - This is the only dependency for the client. It is built into the client library and kept in step with the Socket.IO server library. It is required to manage secure communications between the client and Node-RED server.

### Server dependencies

* [@totallyinformation/ti-common-event-handler](https://www.npmjs.com/package/@totallyinformation/ti-common-event-handler) - My own shared library for doing extended event handling in Node.js. Allows for wildcards and is faster than Node's native event handler.
* [degit](https://www.npmjs.com/package/degit) - Used to enable external uibuilder templates to be utilised from Git repositories - notably GitHub or GitLab.
* [ejs](https://www.npmjs.com/package/ejs) - Embedded JavaScript Templates - an option in uibuilder that allows server-side templating.
* [execa](https://www.npmjs.com/package/execa) - Process execution, used to run `npm` scripts/installs/updates/etc. Limited to v5 since later versions do not support CommonJS.
* [ExpressJS](https://www.npmjs.com/package/express) - Node.js standard web server. Also used by Node-RED.
* [fast-glob](https://www.npmjs.com/package/fast-glob) - Fast file find and traversal. Used in `libs/fs.js` only. **TO BE REMOVED IN THE FUTURE**
* [fs-extra](https://www.npmjs.com/package/fs-extra) - Additional filing system methods. Used in several modules but is being slowly moved to `libs/fs.js` only. **IN THE PROCESS OF BEING REMOVED**
* [jsdom](https://www.npmjs.com/package/jsdom) - Industry std Node.js module to simulate the browser DOM on the server. Used for the `uib-html` node to hydrate uibuilder's low-code JSON to HTML.
* [nanoid](https://www.npmjs.com/package/nanoid) - Generate a short UUID as a stable client ID. Currently limited to v3 as that was the last version to support CommonJS. **To be replaced with native crypto uuid after Node.js is baseline**
* [serve-index](https://www.npmjs.com/package/serve-index) - Simple module to enable serving of directory listings. Used in `libs/web.js`.
* [Socket.IO](https://www.npmjs.com/package/socket.io) - Enhanced websockets.

## Server Libraries

* [Server Libraries](dev/server-libs/README.md) - Information on each of the server libraries

  These libraries are used by some or all of the uibuilder nodes.

  * [`admin-api-v2.js`](dev/server-libs/admin-api-v2) - Older server admin API's. Called from the Node-RED Editor.
  * [`admin-api-v3.js`](dev/server-libs/admin-api-v3) - Newer server admin API's. Called from the Node-RED Editor.
  * [`fs.js`](dev/server-libs/fs) - Server filing system handling.
  * [`package-mgt.js`](dev/server-libs/package-mgt) - npm package handling.
  * [`socket.js`](dev/server-libs/socket) - Socket.IO server handling.
  * [`tilib.js`](dev/server-libs/tilib) - Various non-uibuilder specific server functions.
  * ~~[`tilogger.js`](dev/server-libs/tilogger)~~ - Custom server logger, not currently in use.
  * [`uiblib.js`](dev/server-libs/uiblib) - Generic uibuilder functions.
  * [`web.js`](dev/server-libs/web) - ExpressJS web server handling.

## Client Libraries

* [Client Libraries](dev/client-libs/README.md) - Information on each of the front-end client libraries.

  These libraries support client (browser) HTML interactions with Node-RED.

  * [`ui.js`](dev/client-libs/ui) - Client and server low-code to HTML conversion
  * [`uibuilder.module.js`](dev/client-libs/uibuilder-module) - The main, current front-end client library.
  * [`uibuilderfe.js`](dev/client-libs/uibuilderfe) - The older front-end client library, no longer being developed.

* uibuilder node
  * [`nodes/uibuilder.js`](dev/uibuilder-js.md) - Main node definition.
  * [`nodes/uibuilder.html`](dev/uibuilder-html.md) - Node-RED Editor configuration panel for the main node.
    
    This is not developed directly. The actual code to edit is in `src/editor/uibuilder/` and is built using `gulp` scripts.

## Node-RED Editor Libraries

These libraries provide common Node-RED Editor data, functions and styling for all UIBUILDER nodes.

* [`/resources/ti-common.js`](dev/editor-libs/ti-common) - Common JavaScript library for the Editor.
* [`/resources/ti-common.css`](dev/editor-libs/ti-common-css) - Common style sheet library for the Editor.

## uibuilder front-end client library

  For details, see the Client Libraries list above.

  * `front-end/uibuilder.iife.min.js` & `front-end/uibuilder.esm.min.js` Modern library builds
  
    These are generated by a `gulp` script that uses `esbuild` from `src/front-end-module/uibuilder.module.js`.

  * [`front-end/uibuilderfe.min.js`](dev/uibuilderfe-js.md) - Old `uibuilderfe` client library
    
    This is generated by a `gulp` script from `src/front-end/uibuilderfe.dev.js`.

## Other nodes

* uib-cache node - TBC
* uib-element node - TBC
* uib-update node - TBC
* uib-sender node - TBC
* Gulp scripts - TBC

## Build steps

* [Using ESBUILD to control output formats](dev/build-steps.md).

## Testing

Some information on testing uibuilder. Unfortunately, I have no real clue about automated testing and TLD, if you would like to contribute something, please do!

* [Regression Tests](dev/regression-tests.md)

## Node edit panel global variable

* [uibuilder.html#Editor common global variable](dev/uibuilder-html#editor-common-global-variable)
