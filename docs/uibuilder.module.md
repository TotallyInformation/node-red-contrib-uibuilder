---
title: Documentation for the modern, modular front-end client `uibuilder.esm.js` and `uibuilder.iife.js`
description: >
   This is the new uibuilder front-end library initially introduced in v5.1. It provides socket.io message connectivity to and from Node-RED, simplified message handling and a simple event handler for monitoring for new messages along with some helper utility functions. It also allows data-/configuration-driven interfaces to be created from JSON or Node-RED messages. IIFE (UMD) and ESM builds of the client are provided.
created: 2022-06-11 14:15:26
lastUpdated: 2023-01-04 16:27:19
---

This is the next-generation front-end client for uibuilder. It has some nice new features but at the expense of only working with modern(ish) browsers since early 2019.

> [!attention]
> Note that this page refers only to the "new" front-end library for uibuilder, this is now the preferred library. If you are using the original library, please refer to [this page](front-end-library.md). The original library is now functionally stable (no further updates after uibuilder v5) and will eventually be deprecated.

> [!note]
> It is recommended NOT to compile/build the uibuilder client library into your own front-end build code. There are few, if any advantages on modern browsers. However, if you really want to do that, you may prefer to use the source-code version of the library which will be found at `~/.node-red/node_modules/node-red-contrib-uibuilder/src/front-end-module/uibuilder.module.js`.

- [Introduction](#introduction)
- [How to use](#how-to-use)
  - [The quick guide](#the-quick-guide)
    - [IIFE version](#iife-version)
    - [ESM version](#esm-version)
  - [Where is it?](#where-is-it)
  - [More information](#more-information)
  - [More information on the ESM version](#more-information-on-the-esm-version)
- [Not yet completed](#not-yet-completed)
- [What has been removed compared to the non-module version?](#what-has-been-removed-compared-to-the-non-module-version)
- [Limitations](#limitations)
- [Features](#features)
- [Dynamic, configuration-driven HTML content (low-code)](#dynamic-configuration-driven-html-content-low-code)
- [Troubleshooting](#troubleshooting)
- [Technical Reference](#technical-reference)

## Introduction

The client (front-end) library provides the glue that enables Node-RED to talk to your browser dynamically. For many people, its built-in features are enough that you will need to write only a few lines of code to be able to communicate from/to Node-RED. The various examples and templates available will illustrate this. So while this documentation page is very long and, in places, quite technical, please don't be put off, you may never need to dip into those features. However, if you do, then the library tries to make things as simple as possible.

So for all of its initial simplicity, the library does enable a wealth of features both simple and advanced. Whether watching for and processing messages from Node-RED, sending messages back, watching for key variable changes, advanced console logging, building and changing UI visuals from Node-RED messages that use JSON configuration rather than complex HTML, working with _any_ front-end framework, supporting custom security configurations and more.

## How to use

This version of the library can either be used in the same style as the old `uibuilderfe.js` client (loading in a script link in the HTML) using the `uibuilder.iife.js` version or as a modern [ES Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) using the `uibuilder.esm.js` version. Both builds of the library have identical features but are called differently as show below.

### The quick guide

Note that you no longer need to load the socket.io client library separately since that is embedded in the client library.

There are two templates that you can use the will provide minimal, pre-configured front-end code. "No framework, modern IIFE client", "No framework, modern ESM client".

In addition, there is an example that you can access by doing an import in Node-RED and navigating to the uibuilder examples and selecting "uib-list". Importing that example will add a new "uib-list examples" tab in Node-RED with both IIFE and ESM examples.

#### IIFE version

In `index.html`:

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TotallyInformation - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - TotallyInformation">
    <link rel="icon" href="./images/node-blue.ico"> 

    <link type="text/css" rel="stylesheet" href="./uib-brand.css" media="all">

    <script defer src="../uibuilder/uibuilder.iife.min.js"></script>
    <script defer src="./index.js"></script>

</head><body class="uib">
    
    <!-- Your custom HTML -->
    
</body></html>
```

In `index.js`

```javascript
// ... your custom code, the uibuilder global object is available ...
// note that we almost certainly don't need the uibuilder.start() line any more.
// The only exception being if you are serving your html/js files from a different
// server to the one serving Node-RED/uibuilder. This might be the case if you
// are running the dev server of a framework or build process. In that case:
// uibuilder.start({ioNamespace: 'https://remote.server/uib-instance-url'})

window.onload = (evt) => {
    // Put code in here if you need to delay it until everything is really loaded and ready.
    // You probably won't need this most of the time.
}

```

#### ESM version

> [!note]
> [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) work quite differently to "traditional" JavaScript and you will find it _very_ beneficial to do some background reading on them if you are not familiar.

In `index.html`:

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TotallyInformation - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - TotallyInformation">
    <link rel="icon" href="./images/node-blue.ico"> 

    <link type="text/css" rel="stylesheet" href="./uib-brand.css" media="all">

    <script type="module" async src="./index.js"></script> 

</head><body class="uib">
    
    <!-- Your custom HTML -->
    
</body></html>
```

In `index.js`

```javascript
import '../uibuilder/uibuilder.esm.min.js'

// ... your custom code, the uibuilder global object is available ...
// note that we almost certainly don't need the uibuilder.start() line any more.
// The only exception being if you are serving your html/js files from a different
// server to the one serving Node-RED/uibuilder. This might be the case if you
// are running the dev server of a framework or build process. In that case:
// uibuilder.start({ioNamespace: 'https://remote.server/uib-instance-url'})

window.onload = (evt) => {
    // Put code in here if you need to delay it until everything is really loaded and ready.
    // You probably won't need this most of the time.
}

```

In some cases, your JavaScript code may be nothing more than the import statement. If that is the case, you don't need an `index.js` file at all, just use the following in your HTML.

```html
<script type="module" async src="./uibuilder.esm.min.js"></script>
```

However, note that the uibuilder object is not then available to another script. This is because *code inside ES modules is isolated* and they can't directly talk to each other.

Or, if you only need a few lines of JavaScript.

```html
<script type="module" async>
    import './uibuilder.esm.min.js'
    // -- more code, the uibuilder object is available here --
</script>
```

### Where is it?

You can access the client module from two different URL's. Which one you use depends on your coding needs.

The main location is `../uibuilder/uibuilder.esm.min.js`. This assumes that you are using the recommended relative URLs.

Alternatively, you can use the more "traditional" `./uibuilder.esm.min.js` which will be on the same URL path as your UI code. However, for consistency, the above location is preferred.

If, for some reason, you cannot use relative URLs, you need to take account of a number of Node-RED and uibuilder settings that can change the URLs. If you are using Node-RED's ExpressJS web server (normally on port 1880) you will need to take note whether Node-RED's `httpNode` setting has been changed. If it has, you will need to add that to the beggining of the URL. For example, if `httpNode` = `nr`, you would need to use `/nr/uibuilder/uibuilder.esm.min.js`. So the relative form is generally easier to use.

In addition to the main, compressed, file, uncompressed versions are available as `uibuilder.esm.js` and `uibuilder.iife.js`. It is not recommended to use these in normal use, even for development. The compressed versions have matching `.map` files that your browser will automatically used for debugging. Only use the uncompressed versions if you have your own build step and want to incorporate the library in your output bundle.

### More information

The library consists of a new class `Uib`. That class is auto-instanciated on load.

It also adds `window.$` as long as it doesn't already exist (e.g. if you already loaded jQuery). `$` is bound to `document.querySelector` which means that you can use it as a shortcut to easily reference HTML entities in a similar way to a very simplistic jQuery. e.g. `$('#button1').innerHTML = 'boo!'`.

!> Please note that this version requires a browser since early 2019. This is probably only an issue if you are stuck on Internet Explorer or on a version of Apple Safari <12.1.

### More information on the ESM version

Because the ESM version of the library has to be loaded as a module, it no longer needs an IIFE wrapper. Modules are already isolated. This has greatly simplified the code.

If loading via a script tag, the `window.uibuilder` global is set. However, it is best to load from your own module code using an import statement. In doing so, you have the option to load both the raw class as well as the `uibuilder` instance. `import {Uib, uibuilder} from '../uibuilder/uibuilder.esm.min.js'`

Because you should ideally be loading uibuilder in your own module code. For example `<script type="module" async src="./index.js"></script>` in your `index.html` `head` section and then `import {Uib, uibuilder} from '../uibuilder/uibuilder.esm.min.js'` in your `index.js` file. You can now choose to use a different name for the uibuilder library if you wish. For example `import {uibuilder as uib} from '../uibuilder/uibuilder.esm.min.js'` will give you a `uib` object instead. Use as `uib.start()`, etc. However, you should note that, at present, the global `uibuilder` object is actually still loaded so make sure that you only use one or the other copy. This is because it does not appear to be possible to detect whether a module has been loaded from a script tag in HTML or from an import statement in JavaScript. Really, only in the former case should the global be set and while `window.uibuilder` is checked for to ensure that it isn't loaded again, when using an `import`, you are in a different module context.

In addition, you could do just `import {Uib} from '../uibuilder/uibuilder.esm.min.js'` and then do `const uibuilder = new Uib()`. Not sure why you might want to do that but it is possible anyway.

## Not yet completed

Please see the main [roadmap](roadmap.md).

## What has been removed compared to the non-module version?

* VueJS specific features.
  
  This new modern version is completely framework agnostic. The UI automation features don't rely on any framework or external library. Please switch to using those features along with suitable web or framework components.

  These features were only ever a convenience and should hopefully no longer be needed in the future.

* Load JavaScript/CSS via a msg sent from Node-RED. _Replaced with new feature_.
  
  The old feature will not work with this library.

  However, you can load ECMA Modules (e.g. web components), and scripts from a URL.

  You can also load scripts from text in a message. These use the new style `msg._ui` data schema.

  Obviously care must always be taken with a feature like this since it may open your UI to security issues.

  See [Low-code dynamic, configuration-driven UI's](client-docs/config-driven-ui.md) and the [Dynamic Load Method](client-docs/config-driven-ui.md#method-load) for more details.

## Limitations

None at this time.

Please also refer to the section on dynamic content for its specific limitations.

---

## Features

For a list of all of the main features, see [Features](client-docs/features.md).

## Dynamic, configuration-driven HTML content (low-code)

See [Low-code dynamic, configuration-driven UI's](client-docs/config-driven-ui.md).

## Troubleshooting

See [Troubleshooting the front-end library](client-docs/troubleshooting.md).

---

## Technical Reference

See [Technical Reference](client-docs/technical-reference.md).
