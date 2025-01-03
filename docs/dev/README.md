---
title: Developer Documentation
description: |
  Deep dives into the internals of UIBUILDER. This is where to go if you need to understand how things work. These documents may lag behind the actual code however, so it is always worth also referencing the current codebase.
created: 2019-06-16 16:16:00
updated: 2025-01-01 21:48:55
---

## Processes

* [Processes](processes/README.md)

## Dependencies

Due to its complexity, UIBUILDER has a higher than Node-RED average of external dependencies. Over time, these are reduced (e.g. `nanoid` can be replaced by a native library from node.js v19).

### Client library dependencies

* [Socket.IO Client](https://www.npmjs.com/package/socket.io-client) - This is the only dependency for the client. **It is built into the client library** (you do not need to load it yourself) and kept in step with the Socket.IO server library. It is required to manage secure communications between the client and Node-RED server.

### Server dependencies

These are required to run UIBUILDER

* [degit](https://www.npmjs.com/package/degit) - Used to enable external uibuilder templates to be utilised from Git repositories - notably GitHub or GitLab.
* [ExpressJS](https://www.npmjs.com/package/express) - Node.js standard web server. Also used by Node-RED.
* [fast-glob](https://www.npmjs.com/package/fast-glob) - Fast file find and traversal. Used in `libs/fs.js` only. **TO BE REMOVED IN THE FUTURE**
* [fs-extra](https://www.npmjs.com/package/fs-extra) - Additional filing system methods. Only now used in the `libs/fs.js` module. **IN THE PROCESS OF BEING REMOVED**
* [jsdom](https://www.npmjs.com/package/jsdom) - Industry standard Node.js module to simulate the browser DOM on the server. Used for the `uib-html` node to hydrate uibuilder's low-code JSON to HTML.
* [Socket.IO](https://www.npmjs.com/package/socket.io) - Enhanced websockets.

These are optional peer dependencies

* [ejs](https://www.npmjs.com/package/ejs) - Embedded JavaScript Templates - an option in uibuilder that allows server-side templating. You should install it using the uibuilder library manager.

In addition, these are required for developing UIBUILDER, they are not required to run it

* [ESbuild]() - Used to build runtime IIFE & ESM versions of client libraries. Called from Gulp tasks.
* [ESLint]() - Used to validate and standardise code. Various extensions are used. The core configuration is based on "JavaScript Standard" with some tweaks for ease of use.
* [execa](https://www.npmjs.com/package/execa) - Process execution, used to run some scripts from Gulp.
* [Gulp]() - Task automation. A set of extensions are also used.


## Server Libraries

[Server Libraries](dev/server-libs/README.md) - Information on each of the custom server libraries. They are used by some or all of the uibuilder nodes. They contain the bulk of the runtime custom code.

* [`admin-api-v2.js`](dev/server-libs/admin-api-v2) - Older server admin API's. Called from the Node-RED Editor.
* [`admin-api-v3.js`](dev/server-libs/admin-api-v3) - Newer server admin API's. Called from the Node-RED Editor.
* [`fs.js`](dev/server-libs/fs) - Server filing system handling. All filing system access is being moved into this library.
* [`package-mgt.js`](dev/server-libs/package-mgt) - npm package handling.
* [`socket.js`](dev/server-libs/socket) - Socket.IO (websocket) server handling.
* [`tilib.js`](dev/server-libs/tilib) - Various non-uibuilder-specific server functions.
* [`uiblib.js`](dev/server-libs/uiblib) - Generic uibuilder functions.
* [`ui.js`](dev/client-libs/ui) - A version of the front-end UI library that converts (hydrates) low-code configurations into HTML. Generated automatically via Gulp and ESbuild from the front-end `ui.js` library.
* [`web.js`](dev/server-libs/web) - ExpressJS web server handling.
* `low-code.js` - Library to generate low-code configurations. Not yet in use.
* `user-apis.js` - User-facing (as opposed to admin-facing) API's. Not currently in use.

## Client Libraries

* [Client Libraries](dev/client-libs/README.md) - Information on each of the front-end client libraries.

  These libraries support client (browser) HTML interactions with Node-RED.

  * [`ui.js`](dev/client-libs/ui) - Client and server low-code to HTML conversion.
  * `uibrouter.js` - The front-end router library for Single Page Apps (SPA's).
  * [`uibuilder.module.js`](dev/client-libs/uibuilder-module) - The main front-end client library.

## Node-RED Editor Libraries

These libraries provide common Node-RED Editor data, functions and styling for all UIBUILDER nodes, they are loaded to the Editor via a plugin.

* [`/resources/editor-common.js`](dev/editor-libs/editor-common) - Common JavaScript library for the Editor.
* [`/resources/editor-common.css`](dev/editor-libs/editor-common-css) - Common style sheet library for the Editor.

## uibuilder front-end client library

  For details, see the Client Libraries list above.

  * `front-end/uibuilder.iife.min.js` & `front-end/uibuilder.esm.min.js` Modern library builds
  
    These are generated by a `gulp` script that uses `esbuild` from `src/front-end-module/uibuilder.module.js`.

## Nodes

* uibuilder node
  * [`nodes/uibuilder.js`](dev/uibuilder-js.md) - Main node definition.
  * [`nodes/uibuilder.html`](dev/uibuilder-html.md) - Node-RED Editor configuration panel for the main node.
* [`uib-cache` node](nodes/uib-cache) - TBC
* [`uib-element` node](nodes/uib-element) - TBC
* [`uib-update node`](nodes/uib-update) - TBC
* [`uib-sender node`](nodes/uib-sender) - TBC
* Gulp scripts - TBC

## Build steps

* [Using ESBUILD to control output formats](dev/build-steps.md).

## Deployment steps

* [How to release a new version of UIBUILDER](dev/release-steps.md).

## Testing

Some information on testing uibuilder. Unfortunately, I have no real clue about automated testing and TLD, if you would like to contribute something, please do!

* [Regression Tests](dev/regression-tests.md)

## Node edit panel global variable

* [uibuilder.html#Editor common global variable](dev/uibuilder-html#editor-common-global-variable)
