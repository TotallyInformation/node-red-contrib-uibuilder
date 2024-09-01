---
title: Documentation for the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: |
  This is the uibuilder front-end library. It provides socket.io message connectivity to and from Node-RED, simplified message handling and a simple event handler for monitoring for new messages along with some helper utility functions. It also allows data-/configuration-driven interfaces to be created from JSON or Node-RED messages. IIFE (UMD) and ESM builds of the client are provided.
created: 2022-06-11 14:15:26
updated: 2024-04-29 17:30:02
---

This is the front-end (browser) client for uibuilder. The client library provides the glue that enables Node-RED to talk to your browser dynamically. For many people, its built-in features are enough that you will need to write only a few lines of code to be able to communicate from/to Node-RED. The various examples and templates available will illustrate this. So while this documentation page is very long and, in places, quite technical, please don't be put off, you may never need to dip into those features. However, if you do, then the library tries to make things as simple as possible.

So for all of its initial simplicity, the library does enable a wealth of features both simple and advanced. Whether watching for and processing messages from Node-RED, sending messages back, watching for key variable changes, advanced console logging, building and changing UI visuals from Node-RED messages that use JSON configuration rather than complex HTML, working with _any_ front-end framework, supporting custom security configurations and more.

> [!TIP]
> It is recommended NOT to compile/build the uibuilder client library into your own front-end build code. There are few, if any advantages on modern browsers. However, if you really want to do that, you may prefer to use the source-code version of the library which will be found at `~/.node-red/node_modules/node-red-contrib-uibuilder/src/front-end-module/uibuilder.module.js`.

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
  - [Using Markdown](client-docs/markdown.md)

## Optional helper libraries

While the uibuilder client library is node dependent on any other libraries, it can optionally make use of the following additional libraries if desired.

### 1. DOMPurify - Sanitises HTML to ensure safety and security

The [DOMPurify library](https://github.com/cure53/DOMPurify) is an HTML (and MathML, SVG) sanitser that helps prevent things like cross-site scripting attacks. It is therefore especially useful to use with uibuilder where you are dynamically building content, particularly where that content may be guided by end-users.

Once added, the library will be automatically used by the `_ui` processes and functions to ensure that the resulting HTML and SVG is safe. Obviously, you can also use the library directly in your own custom front-end code. The client functions [`replaceSlot()`](client-docs/functions#replaceslotel-component-replace-or-add-an-html-element39s-slot-from-text-or-an-html-string) and [`replaceSlotMarkdown()`](client-docs/functions#replaceslotmarkdownel-component-replace-or-add-an-html-element39s-slot-from-a-markdown-string) are used internally for this and can be called directly if desired.

Simply add the following to your `index.html` file if you have added the library to uibuilder using the *Library manager tab* (add `dompurify`). Then add the script tag to your HTML before the tag that loads the uibuilder library (so that the uibuilder client library can discover it).

For the IIFE version of the uibuilder client:

```html
<script defer src="../uibuilder/vendor/dompurify/dist/purify.min.js"></script>
```

For the ESM version of the uibuilder client, you need to load the library in your `index.js` file instead of `index.html`. Again, before the uibuilder client import:

```javascript
import * as DOMPurify from '../uibuilder/vendor/dompurify/dist/purify.min.js'
```

If you prefer to use the library from a cloud download (instead of installing via the uibuilder node), replace the location with `https://cdn.jsdelivr.net/npm/dompurify@latest/dist/purify.min.js`.

If correctly loaded, `window.DOMPurify` will exist.

To check whether DOMPurify is active, you can use this function in your front-end code: `if ( uibuilder.get('purify') ) ....`. From Node-RED, you can send a msg containing: `{"_uib": {"command":"get","prop":"purify"}`.

### 2. Markdown-IT - Converts Markdown markup into HTML

The [Markdown-IT](https://markdown-it.github.io/) library enables [Markdown](https://en.wikipedia.org/wiki/Markdown), a lightweight, text-based markup, to be translated into rich HTML. The uibuilder client supports the use of the Markdown-IT library for that purpose. Once loaded, the uibuilder client will recognise its presence and automatically use it whenever Markdown is used in the `markdownSlot` property of `ui` processing or when using the [`replaceSlotMarkdown()`](client-docs/functions#replaceslotmarkdown) function.

As of v7, uibuilder clients also support the use of Markdown-IT plugins.

This is documented more fully in the separate [Using Markdown page](client-docs/markdown).

### 3. VueJS - Front-end framework

uibuilder has long had an affinity with VueJS and for a long time, it was the preferred framework for front-end development. With the ongoing maturity of uibuilder and HTML, such frameworks are needed less and less. As such, most of the special VueJS handling functions have been removed from the client library.

However, as it is still commonly used in conjunction with uibuilder and can be useful for more complex apps, the client library does have a check to see if it is loaded. This code in your custom front-end JavaScript will detect if Vue is loaded: `if ( uibuilder.get('isVue') ) ....`. To discover that from Node-RED, send a msg containing: `{"_uib": {"command":"get","prop":"isVue"}`.

Because the VueJS project forced an early default version change from v2 to v3 while many of its extension libraries had not had a chance to migrate, a lot of people can get caught out accidentally loading the wrong version of Vue. Because of this, if the uibuilder client library discovers that Vue is loaded, it will note the version. To get the version from your front-end code: `uibuilder.get('vueVersion')`. Or from Node-RED, send a msg containing: `{"_uib": {"command":"get","prop":"vueVersion"}`.

> [!NOTE]
> 
> Typically, the no-/low-code capabilities of UIBUILDER will not interact easily with VueJS (or any of the other large frameworks) because those frameworks assume that the whole UI is loaded up-front rather than delivered later. However, that does not prevent you making use of these facilities, you will just need to think about the potential separation between approaches. Of course, you can use the communications and server capabilities of UIBUILDER in your VueJS code.

## Library size

If the library seems a little large, it is because it comes with the following libraries built in: The Socket.IO client. The low-/no-code ui.js library. The `<uib=var>` web component.

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
