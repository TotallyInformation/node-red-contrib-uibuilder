---
created: 2025-12-15 15:00:36
updated: 2026-03-18 13:25:18
version: 7.6.0
---
### Welcome to UIBUILDER v7.6.0
This is a relatively minor feature release.

This highlight changes popover is now included. It will only be shown once after an update.

#### NEW NODE: uib-markweb
Enables simple creation of dynamic web sites using Markdown files. It supports navigation menus, search, front-matter placeholders, custom templates and much more.

#### Documentation
Some usability improvements to the side menu. Including the ability to collapse sections. The expand/collapse state is remembered. The currently shown page is also scrolled into view in the menu.

#### Example flows
Two new example flows. "Built-in Web Components" and "Easy UI Updates".

#### uib-cache node
Performance greatly improved to handle rapid influx of messages.

#### uib-brand CSS
New `.visually-hidden` class added to support accessibility best practices.

#### Front-end client library
New function `uibuilder.asyncSend()` allows you to send a message to the server and wait for a response. It returns a promise that resolves with the response message. This is useful for request/response patterns where you need to get data from the server before proceeding.

`uibuilder.onTopic()` now processes _**control messages**_ as well as standard ones. Added so that the `<uib-var topic="...">` component and `uib-topic` attribute can listen for control messages.

All incoming messages now have a `_receivedHRtime` property added. This is a high-resolution timestamp. It can be used to measure message transit times accurately.

Thanks to Firefox stupidity around cookies, the front-end client library now fetches the HTTP headers on initial load to get the namespace and Node-RED web root. Has to be done asynchronously, the `start()` function is now not called until headers available. This delays uibuilder startup very slightly but is far more reliable.

`<uib-var>` component now recognizes `data-before` and `data-after` attributes. These allow you to specify text to show before and after the variable value. This is useful for adding units, labels, or other contextual information around the variable value without needing extra HTML elements.

There is now a new `uib-var` custom _reactive_HTML attribute. Complements the existing `uib-topic` attribute. Supports var properties (e.g. `myvar`, or `myvar.prop`). May be of use on HTML elements that don't allow HTML content.

All HTML custom elements and reactive attributes also now support nested object paths. e.g. `<uib-var topic="myvar.myprop">` or `<div uib-var="myvar.myprop.subprop">`. This allows you to directly bind to nested properties of reactive variables without needing to replace the entire variable.

`uibuilder.get()` and `uibuilder.set()` functions now support deep object paths. This allows you to get and set nested properties of reactive variables without needing to replace the entire variable. e.g. `myvar.myprop`, `myvar.myprop.subprop` or `myvar[5]`.

New `stack` and `logStack` functions. These can be useful for debugging and understanding the flow of your code especially with complex and deeply nested functions.

#### Other
Various bug fixes, performance improvements and security enhancements as always.
