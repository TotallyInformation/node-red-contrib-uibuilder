---
title: Documentation for the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: >
   This is the new uibuilder front-end library initially introduced in v5.1. It provides socket.io message connectivity to and from Node-RED, simplified message handling and a simple event handler for monitoring for new messages along with some helper utility functions. It also allows data-/configuration-driven interfaces to be created from JSON or Node-RED messages. IIFE (UMD) and ESM builds of the client are provided.
created: 2022-06-11 14:15:26
lastUpdated: 2023-03-03 15:38:11
---

This is the next-generation front-end client for uibuilder. It has some nice new features but at the expense of only working with modern(ish) browsers since early 2019.

> [!attention]
> Note that this section refers only to the "new" front-end library for uibuilder, this is now the preferred library. If you are using the original library, please refer to [this page](front-end-library.md). The original library is now functionally stable (no further updates after uibuilder v5) and will eventually be deprecated.

> [!note]
> It is recommended NOT to compile/build the uibuilder client library into your own front-end build code. There are few, if any advantages on modern browsers. However, if you really want to do that, you may prefer to use the source-code version of the library which will be found at `~/.node-red/node_modules/node-red-contrib-uibuilder/src/front-end-module/uibuilder.module.js`.


The client (front-end) library provides the glue that enables Node-RED to talk to your browser dynamically. For many people, its built-in features are enough that you will need to write only a few lines of code to be able to communicate from/to Node-RED. The various examples and templates available will illustrate this. So while this documentation page is very long and, in places, quite technical, please don't be put off, you may never need to dip into those features. However, if you do, then the library tries to make things as simple as possible.

So for all of its initial simplicity, the library does enable a wealth of features both simple and advanced. Whether watching for and processing messages from Node-RED, sending messages back, watching for key variable changes, advanced console logging, building and changing UI visuals from Node-RED messages that use JSON configuration rather than complex HTML, working with _any_ front-end framework, supporting custom security configurations and more.

## Further Information

- [How to use](client-docs/how-to-use)
- [Feature Summary](client-docs/features.md)
- [Low-code dynamic, configuration-driven UI's](client-docs/config-driven-ui.md)
- [Controlling from Node-RED](client-docs/control-from-node-red.md)
- Technical Details
  - [Functions](client-docs/functions.md)
  - [Variables](client-docs/variables.md)
  - [Custom Events](client-docs/custom-events.md)
  - [Troubleshooting](client-docs/troubleshooting.md)

## Library size

If the library seems a little large, it is because it comes with the correct version of the Socket.IO client built-in.

## What was removed compared to the older, non-module version?

* VueJS specific features.
  
  This new modern version is completely framework agnostic. The UI automation features don't rely on any framework or external library. Please switch to using those features along with suitable web or framework components.

  These features were only ever a convenience and should hopefully no longer be needed in the future.

* Load JavaScript/CSS via a msg sent from Node-RED. _Replaced with new feature_.
  
  The old feature will not work with this library.

  However, you can load ECMA Modules (e.g. web components), and scripts from a URL.

  You can also load scripts from text in a message. These use the new style `msg._ui` data schema.

  Obviously care must always be taken with a feature like this since it may open your UI to security issues.

  See [Low-code dynamic, configuration-driven UI's](client-docs/config-driven-ui.md) and the [Dynamic Load Method](client-docs/config-driven-ui.md#method-load) for more details.
