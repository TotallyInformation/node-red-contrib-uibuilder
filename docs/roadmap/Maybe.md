---
created: 2023-12-30 20:23:50
updated: 2023-12-31 14:03:25
title: Possible Future Features
author: Julian Knight (Totally Information)
---

These are some thoughts about possible future direction. They need further thought and design.

## Front-End library

* Add msg # to outgoing messages to act as a sequence number
* Option to allow log msgs to be returned to Node-RED as uibuilder control messages
* Option to allow custom events to be returned to Node-RED as uibuilder control messages
* Do we need a confirmation (ctrl?) msg back to node-red?

## General

* Add `uibuilder` prop to `<uibInstanceRoot>/package.json`

  * `uibuilder.loader` - an array of folder paths - relative to `<uibInstanceRoot>` that would be served using uibuilder's ExpressJS web server. Allowing instance-specific front-end resources. To be used by things like components.
  * `uibuilder.scripts.deploy` - pointing to node.js file to run when the template is deployed.
* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's.
* Trial use of [web-workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) since majority support goes back to 2014.

  * Create a [Progressive Web App](https://web.dev/what-are-pwas/) (PWA) capable version with [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers) [Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

  Enabling semi-offline use so speeding up the whole interface after the first load.
  Also makes more native app-like features available such as mobile content sharing & badges, background downloading, etc.

  Note that service workers don't have access to the DOM but they do act as a network proxy. Global state is not maintained but
  IndexedDB is available for persistence. They don't work on older browsers. See the [Mozilla Service Worker Cookbook](https://serviceworke.rs/)

  Websockets can't be used in a service worker but [Web Push](https://developers.google.com/web/fundamentals/push-notifications)
  is available for notifications & might be an interesting additional node for uibuilder.
  See the [push demo from Mozilla](https://serviceworke.rs/push-payload_demo.html). Push payloads can include JSON and binary.

  [Workbox](https://developers.google.com/web/tools/workbox) - library for adding offline support.

  [fxos-components/serviceworkerware](https://github.com/fxos-components/serviceworkerware#serviceworkerware): An Express-like layer on top of Service Workers to provide a way to easily plug functionality.
* Add support for HTTP/2 with auto-push. See [http2-express-autopush - npm](https://www.npmjs.com/package/http2-express-autopush)
* Add support for HTTP/3 and QUIC (available in Node.js v14, in preview with NGINX as at June 2022, websockets over http/3 is defined in RFC9220 in draft at June 2022). https://www.f5.com/company/blog/quic-will-eat-the-internet
* Allow transfer of files via Socket.IO. https://stackoverflow.com/a/59224495/1309986
* Allow switch of log.trace to log.info for advanced debugging (would need new switch in Editor or setting in settings.js:uibuilder)
* New node: allowing a socket.io "room" to be defined. Will need to pick a current main instance from a dropdown (using API)

  * Change FE to allow for rooms.
* uibuilder "Knowledge Garden"

  * Requirements

    - Get a partial or full list of folders and/or files
    - Display data in resizable panels
    - Tree view for folders/files
    - Markdown render and WYSIWYG/WYSIWFM editing - [mdxeditor](https://mdxeditor.dev/editor/demo), or vditor
  * References

    - [kajero/src at master · JoelOtter/kajero (github.com)](https://github.com/JoelOtter/kajero/tree/master/src) - interactive notebook
    - [vditor/README_en_US.md at master · Vanessa219/vditor (github.com)](https://github.com/Vanessa219/vditor/blob/master/README_en_US.md), [Demo example - Vditor (b3log.org)](https://b3log.org/vditor/demo/index.html)
    - [How to make a resizable panel control with Web Components - DEV Community 👩‍💻👨‍💻](https://dev.to/ndesmic/how-to-make-a-resizable-panel-control-with-web-components-2cpa)
    - [Draggable &amp; Resizable Panel Component For Vue 3 - Vue Script](https://www.vuescript.com/draggable-resizable-panel/)

## Testing

* Look at the possibility of using https://www.cypress.io/ to automate some front-end and Editor testing.
