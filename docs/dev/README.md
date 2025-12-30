---
title: Developer Documentation
description: |
  Deep dives into the internals of UIBUILDER. This is where to go if you need to understand how things work. These documents may lag behind the actual code however, so it is always worth also referencing the current codebase.
created: 2019-06-16 16:16:00
updated: 2025-12-30 11:45:35
---

> [!NOTE]
> You can learn more about how UIBUILDER for Node-RED works by visiting the [DeepWiki](https://deepwiki.com/TotallyInformation/node-red-contrib-uibuilder) entry.
>
> DeepWiki is an AI-powered knowledge base that can help you find answers to your questions about UIBUILDER.

## Processes

* [Processes](processes/README.md)

## Dependencies

### Client library dependencies

Check `src/components/` and `src/front-end-module/` folders for the client library dependencies. Noting that the client library is built using ESBuild via Gulp tasks and bundles most dependencies into the final output file. All client dependencies are provided as minimised ESM and script (IIFE) files. Built output files are in the `front-end` folder.

* [Socket.IO Client](https://www.npmjs.com/package/socket.io-client) - **This is built into the client library** (you do not need to load it yourself) and kept in step with the Socket.IO server library. It is required to manage secure communications between the client and Node-RED server.

* [Built-in web components](client-docs/custom-components) - these are uibuilder client-specific web components that are built into the client library. They are not separate dependencies. They are in the `src/components/` folder. They use the `ti-base-component.mjs` library from [Totally Information's Web Components](https://wc.totallyinformation.net) as a base class.

  * `apply-template` - Applies HTML templates to the DOM. Useful for repeating structures.
  * `uib-control` - Allows users to manage uibuilder's default styling.
  * `uib-meta` - Displays metadata about the current web page (created/updated dates, size).
  * `uib-var` - Allows users to display variables from uibuilder's data model with the display automatically updating when the variable changes.

### Server dependencies

These are required to run UIBUILDER, they are installed automatically when you install uibuilder via npm or the Node-RED palette manager.

* [degit](https://www.npmjs.com/package/degit) - Used to enable external uibuilder templates to be utilised from Git repositories - notably GitHub or GitLab.
* [ExpressJS](https://www.npmjs.com/package/express) - Node.js standard web server. Also used by Node-RED.
* [fast-glob](https://www.npmjs.com/package/fast-glob) - Fast file find and traversal. Used in `libs/fs.js` only. **TO BE REMOVED IN THE FUTURE**
* [fs-extra](https://www.npmjs.com/package/fs-extra) - Additional filing system methods. Only now used in the `libs/fs.js` module. **IN THE PROCESS OF BEING REMOVED**
* [jsdom](https://www.npmjs.com/package/jsdom) - Industry standard Node.js module to simulate the browser DOM on the server. Used for the `uib-html` node to hydrate uibuilder's low-code JSON to HTML.
* [Socket.IO](https://www.npmjs.com/package/socket.io) - Enhanced websockets. Required for real-time communications between the client and Node-RED server.

Additionally, the following are provided by a workspace private package - these are updated and bundled when uibuilder is updated.

* `@totallyinformation/uib-md-utils` (`packages/uib-md-utils/`) - A private utility package for uibuilder that bundles libraries for Markdown processing.
  * [marked](https://www.npmjs.com/package/marked) - A fast, lightweight Markdown parser and compiler. Used to convert Markdown to HTML in the `uib-markweb` node.
  * [front-matter](https://www.npmjs.com/package/front-matter) - A library to parse YAML front-matter from text files. Used in the `uib-markweb` node to extract metadata from Markdown files.

These are optional peer dependencies

* [ejs](https://www.npmjs.com/package/ejs) - Embedded JavaScript Templates - an option in uibuilder that allows server-side templating. You should install it using the uibuilder library manager.

In addition, these are required for developing UIBUILDER, they are not required to run it

* [ESbuild]() - Used to build runtime IIFE & ESM versions of client libraries. Called from Gulp tasks.
* [ESLint]() - Used to validate and standardise code. Various extensions are used.
* [execa](https://www.npmjs.com/package/execa) - Process execution, used to run some scripts from Gulp.
* [Gulp]() - Task automation. A set of extensions are also used.


## Server Libraries

[Server Libraries](dev/server-libs/README.md) - Information on each of the custom server libraries. They are used by some or all of the uibuilder nodes. They contain the bulk of the runtime custom code.

* [`admin-api-v2.cjs`](dev/server-libs/admin-api-v2) - Older server admin API's. Called from the Node-RED Editor.
* [`admin-api-v3.cjs`](dev/server-libs/admin-api-v3) - Newer server admin API's. Called from the Node-RED Editor.
* [`fs.cjs`](dev/server-libs/fs) - Server filing system handling. All filing system access is being moved into this library.
* `low-code.cjs` - Library to generate low-code configurations. Not yet in use.
* [`package-mgt.cjs`](dev/server-libs/package-mgt) - npm package handling.
* [`socket.cjs`](dev/server-libs/socket) - Socket.IO (websocket) server handling.
* [`tilib.cjs`](dev/server-libs/tilib) - Various non-uibuilder-specific server functions.
* [`uiblib.cjs`](dev/server-libs/uiblib) - Generic uibuilder functions.
* [`ui.cjs`](dev/client-libs/ui) - A version of the front-end UI library that converts (hydrates) low-code configurations into HTML. Generated automatically via Gulp and ESbuild from the front-end `ui.js` library.
* `uibGlobalConfig.cjs` - UIBUILDER global configuration. Consumed by all uibuilder nodes and libraries.
* `user-apis.cjs` - User-facing (as opposed to admin-facing) API's. Not currently in use.
* [`web.cjs`](dev/server-libs/web) - ExpressJS web server handling.

## Client Libraries

* [Client Libraries](dev/client-libs/README.md) - Information on each of the front-end client libraries.

  These libraries support client (browser) HTML interactions with Node-RED.

  * [`uibrouter.mjs`](client-docs/fe-router) - The front-end router library for Single Page Apps (SPA's).
  * [`uibuilder.module.mjs`](dev/client-libs/uibuilder-module) - The main front-end client library.
  * [`ui.mjs`](dev/client-libs/ui) - Client and server low-code to HTML conversion. This is built into the main client library.
  
## Node-RED Editor Libraries

These libraries provide common Node-RED Editor data, functions and styling for all UIBUILDER nodes, they are loaded to the Editor via a plugin.

* [`/resources/editor-common.js`](dev/editor-libs/editor-common) - Common JavaScript library for the Editor.
* [`/resources/editor-common.css`](dev/editor-libs/editor-common-css) - Common style sheet library for the Editor.

## uibuilder front-end client library

For details, see the Client Libraries list above.

* `front-end/uibuilder.iife.min.js` & `front-end/uibuilder.esm.min.js` Modern library builds

  These are generated by a `gulp` script that uses `esbuild` from `src/front-end-module/uibuilder.module.js` and other built-in libraries and components.

* `front-end/ui.iife.min.js` & `front-end/ui.esm.min.js` Low-code to HTML library builds

  This is normally used via the built-in version in the main uibuilder client library. It is provided separately in case you want to use it standalone.

* `front-end/utils/uibrouter.iife.min.js` & `front-end/utils/uibrouter.esm.min.js` Front-end router library builds. Provides Single Page App (SPA) routing capabilities.

## Nodes

* uibuilder node
  * [`nodes/uibuilder.js`](dev/uibuilder-js.md) - Main node definition.
  * [`nodes/uibuilder.html`](dev/uibuilder-html.md) - Node-RED Editor configuration panel for the main node.
  * [Instance setup](processes/instance-setup) - How uibuilder creates a new  instance.
  * [Template handling](dev/instance-template.md) - How uibuilder instance templates are created and managed.
* [`uib-cache` node](nodes/uib-cache) - TBC
* [`uib-element` node](nodes/uib-element) - TBC
* [`uib-file-list` node](nodes/uib-file-list) - TBC
* [`uib-html` node](nodes/uib-html) - TBC
* [`uib-markweb` node](nodes/uib-markweb) - TBC
* [`uib-save` node](nodes/uib-save) - TBC
* [`uib-sender node`](nodes/uib-sender) - TBC
* [`uib-sidebar` node](nodes/uib-sidebar) - TBC
* [`uib-tag` node](nodes/uib-tag) - TBC
* [`uib-update node`](nodes/uib-update) - TBC
* Gulp scripts - `gulpfile.js` - Build and watch scripts - TBC

## Build steps

* [Using ESBUILD to control output formats](processes/build-steps.md).

## Deployment steps

* [How to release a new version of UIBUILDER](processes/release-steps.md).

## Testing

Some information on testing uibuilder. Unfortunately, I have no real clue about automated testing and TLD, if you would like to contribute something, please do!

* [Regression Tests](processes/regression-tests.md)

## Node edit panel global variable

* [uibuilder.html#Editor common global variable](dev/uibuilder-html#editor-common-global-variable)

## uibuilder runtime globals

See `typedefs.js` for details of the runtime global and other object schemas used by uibuilder.
