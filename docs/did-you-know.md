---
title: Did You Know?
description: >
  Things you might not know about uibuilder.
created: 2022-11-30 17:35:40
lastUpdated: 2022-11-30 17:35:46
---

* *There is a set of new client (front-end) libraries*
  
  `uibuilder.iife.min.js` and `uibuilder.esm.min.js`. These are the new standard client libraries, there are some examples that use them and I'll be updating all of the examples when time permits. How to use them is described [here](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/uibuilder.module).

* *You can create and update web page content and design direct from Node-RED!*
  
  Using both **no-code** (via the `uib-element` and `uib-update` nodes) and/or using **low-code** (via `msg._ui` configuration data) approaches. **Both approaches can also be used together**. This does not preclude you from using additional front-end frameworks either.
  
  See [here](client-docs/config-driven-ui.md) for details.

* *You can use uibuilder with any front-end framework*
  
  However, frameworks that need a build step can be somewhat intimidating to get started. [The front-end builds page](front-end-builds) gives more detail. A future version of uibuilder will add some additional helpers to make it easier.

  uibuilder is regularly tested with VueJS and Svelte but many other frameworks are known to work and some have examples in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).

* *uibuilder comes with example flows*
  
  See Node-RED's import function in the Editor.

* *uibuilder comes with some built-in templates*
  
  These set up your front-end code for you, demonstrating the basic requirements. But did you know that it also supports [_external_ templates](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue). Use these when you have a visual baseline that you want to reproduce or share with customers/colleagues. An external template is simply a preconfigured uibuilder instance folder that you put on GitHub. Why not showcase your external templates on the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue).

* *There is a [first-timers walkthrough](walkthrough1) for getting started with uibuilder*

* *There are some YouTube videos on how to use uibuilder*
  
  [Julian Knight's uibuilder playlist](https://www.youtube.com/playlist?list=PL9IEADRqAal3mG3RcF0cJaaxIgFh3GdRQ).

* *You don't have to use Node-RED's ExpressJS web server with uibuilder*
  
  If you want to have your own custom web server settings, a few changes in Node-RED's settings.js will let you do that. 
  
  That even lets you use server-side templating in your UI! [EJS templates](https://ejs.co/) can be turned on.

  See [Configuring uibuilder](uib-configuration.md) for details.

* *uibuilder provides data and middleware capabilities for custom security*
  
  While uibuilder does not provide any built-in security features, it does provide ExpressJS and Socket.IO middleware capabilities using external, shared files. These can be used for authentication and authorisation decisions.
  
  It also provides a stable client ID, client IP address, the source page nameg, and other client data in both control and standard messages. This can help with authentication and authorisation processing using Node-RED flows or the middleware as you prefer.

  This documentation also contains information specific to security both Node-RED and uibuilder. Specifically it documents how to use an external proxy server to handle authentication.

* *The default folder for all uibuilder content is `~/.node-red/uibuilder`*
  
  However, you don't _have_ to keep it there. You can make it any folder that is accessible to Node-RED.

  Each uibuilder node gets its own sub-folder named after the `url` name you specify in the node. The `url` value is also used as the `path` in the browser location. So a url named `test` would have a sub-folder `~/.node-red/uibuilder/test` and a browser location of `http://node-red.server:1880/test/`. These are simple examples and several Node-RED variables can change particularly the browser location.
