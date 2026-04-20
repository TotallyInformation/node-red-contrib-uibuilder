---
title: Roadmap for improving uibuilder documentation
description: >
    This page is a working document to track the development of the uibuilder documentation. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 19:21:38
author: Julian Knight (Totally Information)
---

## To do
* [ ] Add a manual `[UIBUILDER]` Markdown extension to replace the former auto-colouring of the word "UIBUILDER".
* [ ] Add content to Lists, Maps, Tables, Dashboard Layouts, Cards, Articles.
* [ ] Properly document file uploads and how to handle them. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
* [ ] Add thanks to the contributors in the readme.
* [x] Setting up and using VS Code for front-end development with uibuilder
  * [x] Link in uibuilder nodes
  * [ ] Setting up remote VS Code
  * [ ] Useful extensions for front-end development
  * [ ] Configure browser dev tools (e.g. round-trip edits)

## Other
* [ ] Document `tblGetCellName` (ui) new FE function.
* [ ] Add a "Debugging" doc. [ref](https://dashboard.flowfuse.com/contributing/widgets/debugging.html#debugging-dashboard-2-0), [ref1](https://discourse.nodered.org/t/debugging-node-red-ui-base-js-and-understanding-websocket-behavior/91131/6)
* [ ] Document grid and flex layouts.
* [ ] Finish 3rd-party-extensions. Finish documenting Editor and runtime API's for new endpoint creation for 3rd-party extensions.
* [ ] Document `.config/uibMiddleware.js`, also update `docs\how-to\server-side-views.md`.

* Move page ToC to a 2nd sidebar tab.
* Make sidebar resizable.
* Reduce the size of the sidebar uib icon. Use SVG.

* Document the `.public` folder and how to use it with the custom web server.
* Create a comparison table of how to do things with VueJS vs Node-RED/uibuilder.
* **Need some documentation** to explain how to replicate framework-like features using the existing uibuilder features. How things like `if` and dynamic attributes can be replicated using `uib-topic`, `uib-var` and `uibuilder.set()`.
* Improve `[tips]`. Allow pause/start on rotation. Add an `all` option.
* New help doc re CORS. [Ref](https://discourse.nodered.org/t/allow-cors-for-ui-builder/94838).

* How to redirect un-auth web requests to login page (using `msg._client`).
* Update docs for ctrl msgs and `msg._uib` return data to say that anything set via the socket.io auth can only update when the client reconnects. 
* document clientTimeDifference
* New doc for using `ui.js` outside of uibuilder.
* `README.md`: Add more links to the Features section so that each feature points to appropriate documentation. Add a landing-page link to "includes many helper features" to signpost to relavent detailed documentation.
* Add message interaction diagram to "pre-defined-msgs.md"
* Add note to documentation for the library manager that you can install LOCAL folders.
* Add some notes about Node-RED's projects feature. It doesn't seem to add a correct .gitignore which should contain `**/node_modules`. Also add notes about the fact that projects creates a disconnect between the flows and the userDir folder.
* Add new doc to explain the HTML document hierarchy.
* Add [Giscus commenting to docs](https://github.com/docsify-note/docsify-giscus/)
* [ ] "Islands" concept. [Ref.](https://docs.astro.build/en/concepts/islands/#a-brief-history).

> The general idea of an “Islands” architecture is deceptively simple: render HTML pages on the server, and inject placeholders or slots around highly dynamic regions […] that can then be “hydrated” on the client into small self-contained widgets, reusing their server-rendered initial HTML.

* [ ] Highlight how the FE library uses the "Signals" pattern. [Ref](https://www.smashingmagazine.com/2018/01/deferring-lazy-loading-intersection-observer-api/).
