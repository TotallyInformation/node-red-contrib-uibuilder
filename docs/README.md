---
title: uibuilder Technical Documentation
description: >
   uibuilder is a low-code solution for easily building data-driven web sites and web apps in conjunction with Node-RED.
created: 2019-06-16 16:16:00
lastUpdated: 2021-07-03 21:48:29
---

All you need is a uibuilder node added to your flows. Select a suitable URL path and deploy.
Now you can send messages to your front end.

uibuilder comes with a default template set of front-end files that define your user interface (UI).
Open the uibuilder node and click on the button to open your web app in a new tab.

## Using uibuilder

* [Changing the root folder (uibRoot)](changing-uibroot.md)
* [uibuilder messages](pre-defined-msgs.md "Catalogue of messages and properties")

## Developing UI's

Information on using the front-end uibuilderfe library in your own code. Information on using build processes if you need them.

* [The uibuilderfe Library](front-end-library.md)
* [Optimise & Transpile](front-end-builds.md)
* [Snowpack as build tool](front-end-build-snowpack.md)

## UI Frameworks

Working with uibuilder and specific front-end frameworks.

* [Vue Components](vue-component-handling.md)

## Security

How to use uibuilder's built-in security features. 

* [General Security](security.md)
* [Local Security: security.js](securityjs.md)

## Developer Documentation

Deep dives into the internals of uibuilder. This is where to go if you need to understand how things work. These documents may lag behind the actual code however, so it is always worth also referencing the current codebase.

* [`front-end/src/uibuilderfe.js`](uibuilderfe-js.md)
* [`nodes/uibuilder.js`](uibuilder-js.md)
* [`nodes/uibuilder.html`](uibuilder-html.md)
* [`nodes/uiblib.js`](uiblib-js.md)
* [`nodes/tilib.js`](tilib-js.md)
* [`nodes/web.js`](web-js.md)
* [`nodes/sockets.js`](sockets-js.md)

## Testing

Some information on testing uibuilder

* [Regression Tests](regression-tests.md)

## Other

* [Glossary of Terms](glossary.md)
* [Changelog](changelog)
* [Main Readme](uibhome)

## Archives

  * [v2 Breaking Changes](v2-breaking-changes.md)
  * [v2 Changelog](CHANGELOG-v2.md)
  * [v1 Changelog](CHANGELOG-v1.md)