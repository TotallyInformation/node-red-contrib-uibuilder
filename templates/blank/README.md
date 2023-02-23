# uibuilder Template: Blank

> NOTE: You can replace the contents of this README with text that describes your UI.

This is about the simplest template you can get for uibuilder. Is is also (as of uibuilder v5+), the default template.

It does not use any frameworks and has no other dependencies.

It demonstrates that you can use uibuilder purely with HTML/JavaScript or even just HTML and still easily build a simple, dynamic, data-driven user interface with the help of Node-RED.

All it does is start up uibuilder.

From uibuilder v6.1.0, it uses the new IIFE client library.

## Folders

The root folder contains this file. It can be used for other things **but** it will not be served up in the Node-RED web server. _Either_ the `src` or the `dist` folder are served up (along with all of their sub-folders). So the root and any other root sub-folders can be used mostly however you like.

One reserved item in the root folder however will be a `package.json` file. This will be used in the future to help with build/compile steps. You can still use it yourself, just bear in mind that a future version of uibuilder will make use it as well. If you need to have any development packages installed to build your UI, don't forget to tell `npm` to save them as development dependencies not normal dependencies.

Two sub-folders are included.

The template only has files in the `src` folder. That folder is the default used by uibuilder to serve up files to clients.

The `dist` folder should be used if you have a build step to convert your source code to something that browsers understand. So if you are using a build (compile) step to produce your production code, ensure that it is configured to use the `dist` folder as the output folder and that it creates at least an `index.html` file.

You can switch between the `src` and `dist` folders using the matching setting in the Editor. See uibuilder's advanced settings tab.

Also note that you can use **linked** folders and files in this folder structure. This can be handy if you want to maintain your code in a different folder somewhere or if your default build process needs to use sub-folders other than `src` and `dist`.(Though as of v6, you can specify any sub-folder to be served)

## Files in this template

* `package.json`: Defines the basic structure, name, description of the project and defines any local development dependencies if any.
* `README.md`: This file.
* `src/index.html`: Contains your basic HTML and will be the file loaded and displayed in the browser when going to the uibuilder defined URL.
* `src/index.js`: Contains all of the logic for your UI. It must be linked to in the html file. Optional.
* `src/index.css`: Contains your custom CSS for styling. It must be linked to in the html file. Optional.

Note that only the `package.json` and `index.html` files are actually _required_. uibuilder will not function as expected without them.

It is possible to use the index.html file simply as a link to other files but it must be present.

The other files are all optional. However, you will need to change the index.html file accordingly if you rename or remove them.

## Multiple HTML pages

uibuilder will happily serve up any number of web pages from a single instance. It will also make use of sub-folders. However, each folder should have an `index.html` file so that a URL that ends with the folder name will still work without error.

Note that each html file is a separate page and requires its own JavaScript and uibuilder library reference. When moving between pages, remember that every page is stand-alone, a new environment. You can share one `index.js` file between multiple pages if you prefer but each page will run a separate instance.

If multiple pages are connected to the same uibuilder instance, they will all get the same broadcast messages from Node-RED. So if you want to handle different messages on different pages, remember to filter them in your front-end JavaScript in `uibuilder.onChange('msg', ....)` function. Turn on the advanced flag for including a `msg._uib` property in output if you need to differentiate between pages and/or clients in Node-RED.
