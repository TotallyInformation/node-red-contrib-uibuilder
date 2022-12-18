---
title: Did You Know?
description: >
  Things you might not know about uibuilder.
created: 2022-11-30 17:35:40
lastUpdated: 2022-11-30 17:35:46
---

* There is a set of new client (front-end) libraries: `uibuilder.iife.js` and `uibuilder.esm.js` (along with matching `.min.js` versions). These are the new standard client libraries, there are some examples that use them and I'll be updating all of the examples when time permits. How to use them is described [here](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/uibuilder.module).

* You can create and update web page content and design direct from Node-RED! This works with ANY FRAMEWORK!! See [here](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/uibuilder.module?id=dynamic-data-driven-html-content-1) for details.

* You can use uibuilder with any framework (hopefully you already new that!). However, frameworks that need a build step can be somewhat intimidating to get started. [This page](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/front-end-builds) gives more detail. A future version of uibuilder will add some additional helpers to make it easier.

* uibuilder comes with some examples. See Node-RED's import function.

* uibuilder comes with some built-in templates. These set up your front-end code for you, demonstrating the basic requirements. But did you know that it also supports [_external_ templates](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue). Use these when you have a visual baseline that you want to reproduce or share with customers/colleagues. An external template is simply a preconfigured uibuilder instance folder that you put on GitHub. Why not showcase your external templates on the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/External-Templates-Catalogue).

* There is a [first-timers walkthrough](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/walkthrough1) for getting started with uibuilder.

* You don't have to use Node-RED's ExpressJS web server with uibuilder. If you want to have your own custom web server settings, a few changes in Node-RED's settings.js will let you do that. That even lets you use server-side templating in your front-end code! 

* While uibuilder does not provide any built-in security features, it does provide ExpressJS and Socket.IO middleware capabilities. It also provides a stable client ID, client IP address and the page name the client is using. These can help with authentication and authorisation processing.

* The default folder for all uibuilder content is `~/.node-red/uibuilder`. However, you don't _have_ to keep it there. You can make it any folder accessible to Node-RED.
