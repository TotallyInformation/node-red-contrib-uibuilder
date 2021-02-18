# uibuilder Template: VueJS & bootstrap-vue

**NOTE**: This is the default template for uibuilder. You need to have installed `vue` v2 and `bootstrap-vue` v2 to use this template. uibuilder will warn you if you don't have them installed.

It demonstrates the various basic features you are likely to want in a simple, dynamic, data-driven user interface.

It includes display of control and standard messages to/from Node-RED as well as a simple form with submission back to Node-RED.

## Folders

The root folder contains this file. It can be used for other things **but** it will not be served up in the Node-RED web server.
_Either_ the `src` or the `dist` folder are served up (along with all of their sub-folders). So the root and any other root sub-folders
can be used mostly however you like.

One reserved item in the root folder however will be a `package.json` file. This will be used in the future to help with build/compile steps.
You can still use it yourself, just bear in mind that a future version of uibuilder will make use of the `scripts.build` script.

Two sub-folders are included. The template only has files in the `src` folder.

The `dist` folder will only be used by uibuilder if it contains an `index.html` file.
So if you are using a build (compile) step to produce your production code, ensure that it is configured to use the `dist` folder as the output folder and that it creates the `index.html` file.

Also note that you can use **linked** folders and files in this folder structure. This can be handy if you want to maintain your code in a different folder somewhere or if your default build process needs to use sub-folders other than `src` and `dist`.

## Files

* `index.html`: Contains your basic HTML and will be the file loaded and displayed in the browser when going to the uibuilder defined URL.
* `index.js`: Contains all of the logic for your UI. It must be linked to in the html file.
* `index.css`: Contains your custom CSS for styling. It must be linked to in the html file.

Note that only the `index.html` file is actually _required_. uibuilder will not function as expected without it.

It is possible to use the index.html file simply as a link to other files but it must be present.

The other files are all optional. However, you will need to change the index.html file accordingly if you rename or remove them.