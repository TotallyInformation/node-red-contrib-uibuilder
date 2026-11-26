# uibuilder Template: Blank (ESM)

> NOTE: You can replace the contents of this README with text that describes your UI.

This is a simple template for uibuilder. It uses the ES Module (ESM) version of the uibuilder client and so demonstrates the use of the latest standards for web development.

It does not use any frameworks and has no other dependencies. It demonstrates that you can use uibuilder purely with HTML/JavaScript or even just HTML and still easily build a simple, dynamic, data-driven user interface with the help of Node-RED.

It loads the brand CSS Styling and a JavaScript Module that imports the uibuilder client.

It also makes use of the `pageData` data object that the uibuilder node sends to the client on load. This may contain various data but namely the `title` and `description` properties if you set them on the advanced page of the uibuilder node. These will automatically update the title and description fields in the HTML.

It contains a `<div>` with the id "`more`" and the `uib-topic="more"` attribute which is used by many of the examples in the Node-RED import library. Simply send a message to the node with the topic set to "more" and the payload will become the inner HTML of the div element. You can also send `msg.attributes` and/or `msg.dataset` properties that will be added to the div. Details are in the UIBUILDER documentation.

## Folders

* `/` - The root folder contains this file. It can be used for other things **but** it will not be served up in the Node-RED web server.
* `/src/` - the default folder that serves files as web resources. However, this can be changed to a different folder if desired.
* `/dist/` - the default folder for serving files as web resources where a _build step_ is used. In that case, the `/src` folder is the source used by the build tool and `/dist` is the destination for the build (the "distribution" folder).
* `/types/` - Contains typescript definition files (`*.d.ts`) for the uibuilder client library. This is not used by uibuilder but can be used by your IDE to provide type checking and auto-completion for the uibuilder client library. This is useful if you are using TypeScript or JavaScript with type checking enabled. Remember to update these for new uibuilder versions.

Optionally, the following can also be used:

* `/routes/` - This folder can contain `.js` files defining routing middleware for uibuilder's ExpressJS web server.
* `/api/` - This folder can contain JavaScript files defining REST API's specific to this uibuilder instance.

One reserved file in the root folder is `package.json`. This may be used to help with build/compile or other scripts. Those scripts can then be run from within the uibuilder node.

If you need to have any development packages installed to build your UI, don't forget to tell `npm` to save them as development dependencies not normal dependencies.

The `dist` folder should be used if you have a build step to convert your source code to something that browsers understand. So if you are using a build (compile) step to produce your production code, ensure that it is configured to use the `dist` folder as the output folder and that it creates at least an `index.html` file.

You can switch between the `src` and `dist` (or other) folders for serving the web resources by using the matching setting in the Editor. See uibuilder's advanced settings tab.

## Files in this template

* `package.json`: REQUIRED. Defines the basic structure, name, description of the project and defines any local development dependencies if any. Also works with `npm` allowing the installation of dev packages (such as build or linting tools).
* `README.md`: This file. Change this to describe your web app and provide documentation for it.
* `LICENSE`: A copy of the Apache 2.0 license. Replace with a different license if needed. Always license your code. Apache 2.0 matches the licensing of uibuilder.
* `src/index.html`: REQUIRED if using default settings. Contains your basic HTML and will be the file loaded and displayed in the browser when going to the uibuilder defined URL.
* `src/index.mjs`: REQUIRED if using default settings. Loads the uibuilder client library. Also contains custom logic for your UI. It must be linked to in the html file.
* `src/index.css`: Contains your custom CSS for styling. It must be linked to in the html file.
* `tsconfig.json`: A configuration file for TypeScript. This can be used by your IDE to provide descriptions, type checking and auto-completion for the uibuilder client library. This is useful if you are using TypeScript or JavaScript with type checking enabled. Uses the typescript definition files in the `/types` folder, remember to update these for new uibuilder versions.

Note that only the `package.json` and `index.html` files are actually _required_. uibuilder will not function as expected without them.

## Multiple HTML pages

uibuilder will happily serve up any number of web pages from a single instance. It will also make use of sub-folders. However, each folder should have an `index.html` file so that a URL that ends with the folder name will still work without error.

Note that each html file is a separate page and requires its own JavaScript and uibuilder library reference. When moving between pages, remember that every page is stand-alone, a new environment. You can share one `index.js` file between multiple pages if you prefer but each page will run a separate instance.

> **Note**: HTML files in sub-folders will require the CSS/JS and other standard links adjusting according to the folder depth.

If multiple pages are connected to the same uibuilder instance, they will all get the same broadcast messages from Node-RED. However, you can filter messages by page name by including `msg._ui.pageName` or `msg._uib.pageName` in messages. Similarly, if you turn on the advanced "Include msg._uib in standard msg output." checkbox in the uibuilder node, you will get `msg._uib` properties in output messages that identify client details including the page name.

## URL endpoints

When specifying links in your HTML, CSS and JavaScript files, you should use relative URLs. e.g. `./index.mjs` will load that file from the `src` folder or wherever else you have told uibuilder to use.

When using uibuilder's server-side resources, you will generally use `../uibuilder/....`, for example `../uibuilder/uib-brand.min.css` as seen in the default `index.css` file. When accessing a front-end library being served by uibuilder, you can use the form `../uibuilder/vendor/....`. Use the "Full details" button in the uibuilder node to see all of the possible endpoints you may want to use.


## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

This template may be used however you like. It is provided as a test template for uibuilder and is not intended to be a full template. You are free to use it as a starting point for your own template or to use it as-is if you find it useful.

