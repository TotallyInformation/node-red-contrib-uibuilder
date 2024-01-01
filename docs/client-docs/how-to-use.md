---
title: How to use the modern uibuilder front-end library
description: |
  This version of the library can either be used in the same style as the old `uibuilderfe.js` client (loading in a script link in the HTML) using the `uibuilder.iife.js` version or as a modern [ES Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) using the `uibuilder.esm.js` version. Both builds of the library have identical features but are called differently as shown below.
created: 2023-01-28 15:19:38
lastUpdated: 2023-07-02 13:48:04
updated: 2023-12-30 17:01:41
---


## The quick guide

> [!note]
> Note that you no longer need to load the socket.io client library separately since that is embedded in the client library.

The default template no longer loads `index.js` though it has the code for it commented out in `index.html`. This is because many people will no longer need front-end JavaScript code thanks to the zero-code and low-code features of uibuilder. The default template uses the IIFE version of the library, loads `uib-brand.css` and the HTML contains a heading, sub-heading and an empty `div` with an ID of `more` which can be used for any content and is used by the examples.

There are two additional templates that you can use the will provide minimal, pre-configured front-end code. "No framework, modern IIFE client", "No framework, modern ESM client". In addition, there is an example that you can access by doing an import in Node-RED and navigating to the uibuilder examples and selecting "uib-list". Importing that example will add a new "uib-list examples" tab in Node-RED with both IIFE and ESM examples. 

Further templates are available and should be self-explanatory.

### IIFE library version

This version will add `uibuilder`, `uib`, `$$` and `$` objects to the `window` (global) object so that they are available to all code in all `script`s. `$` will not be added if it has already been defined by a library loaded before uibuilder (e.g. jQuery). `uib` is a synonym of `uibuilder`.

In `index.html`:

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TotallyInformation - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - TotallyInformation">
    <link rel="icon" href="./images/node-blue.ico"> 

    <link type="text/css" rel="stylesheet" href="./uib-brand.min.css" media="all">

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
// uibuilder.start({ioNamespace: 'https://node-red.server/uib-instance-url'})

window.onload = (evt) => {
    // Put code in here if you need to delay it until everything is really loaded and ready.
    // You probably won't need this most of the time.
}

```

> [!note]
> As you can see, you don't really need any custom JavaScript to use uibuilder.
> uibuilder can now be entirely driven from Node-RED using the no-code (`uib-element` and `uib-update` nodes) and low-code (`msg._ui` configuration data) approaches if you prefer.
> Whilst this is not the most machine efficient approach, it allows you to get started very quickly. You can later convert gradually to custom code if you need more complexity or more
> efficiency.


### ESM library version

> [!note]
> [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) work quite differently to "traditional" JavaScript and you will find it _very_ beneficial to do some background reading on them if you are not familiar.

This version will add `uibuilder`, `uib`, `$$` and `$` objects to your custom module script's local namespace. `uib` is a synonym of `uibuilder`.

In `index.html`:

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TotallyInformation - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - TotallyInformation">
    <link rel="icon" href="./images/node-blue.ico"> 

    <link type="text/css" rel="stylesheet" href="./uib-brand.min.css" media="all">

    <script type="module" async src="./index.js"></script> 

</head><body class="uib">
    
    <!-- Your custom HTML -->
    
</body></html>
```

In `index.js`

```javascript
import '../uibuilder/uibuilder.esm.min.js'

// ... your custom code, the uibuilder object is available ...
// note that we almost certainly don't need the uibuilder.start() line any more.
// The only exception being if you are serving your html/js files from a different
// server to the one serving Node-RED/uibuilder. This might be the case if you
// are running the dev server of a framework or build process. In that case:
// uibuilder.start({ioNamespace: 'https://node-red.server/uib-instance-url'})

window.onload = (evt) => {
    // Put code in here if you need to delay it until everything is really loaded and ready.
    // You probably won't need this most of the time.
}

```

In some cases, your JavaScript code may be nothing more than the import statement. If that is the case, you don't need an `index.js` file at all, just use the following in your HTML, replacing the reference to `index.js`.

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

## Where is it?

You can access the client module from two different URL's. Which one you use depends on your coding needs.

The main location is `../uibuilder/uibuilder.esm.min.js`. This assumes that you are using the recommended relative URLs.

Alternatively, you can use the more "traditional" `./uibuilder.esm.min.js` which will be on the same URL path as your UI code. However, for consistency, the above location is preferred.

If, for some reason, you cannot use relative URLs, you need to take account of a number of Node-RED and uibuilder settings that can change the URLs. If you are using Node-RED's ExpressJS web server (normally on port 1880) you will need to take note whether Node-RED's `httpNode` setting has been changed. If it has, you will need to add that to the beggining of the URL. For example, if `httpNode` = `nr`, you would need to use `/nr/uibuilder/uibuilder.esm.min.js`. So the relative form is generally easier to use.

In addition to the main, compressed, file, uncompressed versions are available as `uibuilder.esm.js` and `uibuilder.iife.js`. It is not recommended to use these in normal use, even for development. The compressed versions have matching `.map` files that your browser will automatically used for debugging. Only use the uncompressed versions if you have your own build step and want to incorporate the library in your output bundle.

## More information

The library consists of a new class `Uib`. That class is auto-instanciated globally as `uibuilder` on load. `uib` is also created as a shortcut to `uibuilder`.

It also adds the global `$` as long as it doesn't already exist (e.g. if you already loaded jQuery). `$` is bound to `document.querySelector` which means that you can use it as a shortcut to easily reference HTML entities in a similar way to a very simplistic jQuery. e.g. `$('#button1').innerHTML = 'boo!'`. [Ref.](client-docs/functions#cssselector---simplistic-jquery-like-document-css-query-selector-returns-an-html-element). This is also available as `uibuilder.$` in case the global `$` is already defined.

`$$` is added and is bound to `Array.from(document.querySelectorAll(cssSelector))` so that it returns the properties of all elements discovered by the selector. [Ref.](client-docs/functions#cssselector---returns-an-array-of-html-elements-properties). This is also available as `uibuilder.$$` in case the global `$$` is already defined.

> [!attention]
> Please note that this version requires a browser since early 2019. This is probably only an issue if you are stuck on Internet Explorer or on a version of Apple Safari <12.1.
>
> If you really must support outdated browsers, you should run the uibuilder library through a build step using `esbuild`, `babel`, or a similar tool that can convert modern JavaScript to older formats (possibly including polyfill libraries if necessary).

## More information on the ESM version

Because the ESM version of the library has to be loaded as a module, it no longer needs an IIFE wrapper. Modules are already isolated. This has greatly simplified the code.

If loading via a script tag, the `window.uibuilder` global is set. However, it is best to load from your own module code using an import statement. In doing so, you have the option to load both the raw class as well as the `uibuilder` instance. `import {Uib, uibuilder} from '../uibuilder/uibuilder.esm.min.js'`

Because you should ideally be loading uibuilder in your own module code. For example `<script type="module" async src="./index.js"></script>` in your `index.html` `head` section and then `import {Uib, uibuilder} from '../uibuilder/uibuilder.esm.min.js'` in your `index.js` file. You can now choose to use a different name for the uibuilder library if you wish. For example `import {uibuilder as uib} from '../uibuilder/uibuilder.esm.min.js'` will give you a `uib` object instead. Use as `uib.start()`, etc. However, you should note that, at present, the global `uibuilder` object is actually still loaded so make sure that you only use one or the other copy. This is because it does not appear to be possible to detect whether a module has been loaded from a script tag in HTML or from an import statement in JavaScript. Really, only in the former case should the global be set and while `window.uibuilder` is checked for to ensure that it isn't loaded again, when using an `import`, you are in a different module context.

In addition, you could do just `import {Uib} from '../uibuilder/uibuilder.esm.min.js'` and then do `const uibuilder = new Uib()`. Not sure why you might want to do that but it is possible anyway.

