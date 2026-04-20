---
title: Roadmap for web.cjs ExpressJS and related features
description: >
  This page is a working document to track the development of the web.cjs module and related front-end communication features. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
  It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 15:23:28
author: Julian Knight (Totally Information)
---

## To do
  * [ ] Allow overriding of the JSON max upload size for the custom Express server. [Ref](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988)

## Other
* Add `hooks` to web.js to allow easier header overrides. `httpHeaders`.
* Add instance descriptions to the index pages
* Prepare for ExpressJS v5. Not likely to arrive before Node-RED v5 but quite a few breaking changes. [Ref](https://expressjs.com/en/guide/migrating-5.html)
  * `nodes/libs/admin-api-{v2,v3}.js`
  * `nodes/libs/web.js`
  * [Path route matching syntax has changed 😵‍💫](https://expressjs.com/en/guide/migrating-5.html#path-syntax)
* web worker support.
  *  Add a `uib-worker` endpoint (per instance) that serves a worker script.
  *  The worker should handle uibuilder comms. Would need a shared worker and that does not work with Safari.
  *  It should be created dynamically based on the instance. So that it is pre-defined with the correct Socket.IO namespace, etc.
  *  shared websocket that allows retained connection on page reload and between pages in the same `uibuilder` node. [ref1](https://crossbario.com/blog/Websocket-Persistent-Connections/), [ref2](https://stackoverflow.com/questions/10886910/how-to-maintain-a-websockets-connection-between-pages).
