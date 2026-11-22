---
title: Creating a web app using uibuilder and Node-RED
description: |
  Some recommendations on how to use uibuilder to create data-driven web applications.
created: 2022-01-05 14:36:24
updated: 2026-11-14 15:41:34
---

While it does a few other things to help as well, uibuilder primarily provides these services:

1. An easy way to manage and serve up front-end web pages and supporting libraries (e.g. VueJS or REACT).
2. An easy way to exchange structured data between Node-RED and your front-end app.
3. Easy ways to deliver web pages by creating, removing and amending HTML elements on your web page based on data from Node-RED or other code.
4. Easy ways to get user input from your web pages back to Node-RED.
5. Ability to manage static web resources, including pages, images, code, etc. using traditional web development tools or direct from the Node-RED Editor. Provides extensions to standard HTML to support the other services.

It allows you to use any (or no) front-end libraries and whatever tooling you like.

## Driving a dynamic, data-driven UI - no frameworks needed

UIBUILDER reduces or even removes the need to use a front-end framework such as Vue or REACT. These _are_ still useful for really complex UI's and processing or working in large development teams, but for the majority of uses, they can be just a millstone that you end up fighting more than they help. HTML is now more than capable of doing a lot natively and UIBUILDER simplifies and extends those native features.

One important thing to learn in order to be able to ditch heavy frameworks is how to select HTML elements using [CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). UIBUILDER provides a very easy way to grab a reference to any HTML element via a selector ([`${'selector'}`](client-docs/functions#dollar), or [`$$('selector')`](client-docs/functions#dollar2) for multiple elements).

UIBUILDER provides tools to dynamically create, amend, and remove HTML elements direct from node-red (the [`uib-element` node](nodes/uib-element) available from uibuilder v6.1+ and [configuration-driven UI descriptor messages](client-docs/config-driven-ui.md). Configuration data can even be loaded from an external JSON file and the same data can be used in your front-end code if you need to.

It also provides simple ways to change any element's content and attributes. Either from the no-code [`uib-update` node](nodes/uib-update) or [via custom attributes and components](using/easy-ui-updates) in your HTML. Also see the [Reactive UI's page](client-docs/reactive).

### Where a front-end framework can still help

The main reason for still wanting a front-end framework such as Vue or REACT is to access the myriad of features, extensions and add-on's that people have developed over the years. They might also be needed when large development teams are used or with in-house development standards.

## Where the static front-end code and resources live

The code and other static resources for your uibuilder web app live in and under a specific folder on your Node-RED server. You will need to understand where this lives if you want to use anything other than the Node-RED Editor panel for managing and editing your code and for sharing other resources.

Most things for UIBUILDER live under something we refer to as the `uibRoot` folder. This folder, by default, lives at `<userDir>/uibuilder`. Where `<userDir>` is normally `~/.node-red` for default installations of Node-RED. The uibRoot folder can, however, be moved by changing the `uibuilder.uibRoot` property in your Node-RED `settings.js` file.

Each `uibuilder` node that you deploy, gets a sub-folder under uibRoot. That folder is named the same as the `URL` setting in the Editor panel. So a `uibuilder` node with a URL set to `mytest` will have its code folder at `~/.node-red/uibuilder/mytest` for a default installation.

> [!NOTE]
> If you are using Node-RED's Projects feature, the default location will be under the project folder.
> e.g. a project named "myproject" would have the default root folder of `~/.node-red/projects/myproject/uibuilder`.

Within that instance root folder there will always be at least 3 things:

1. A `package.json` file. This gives some basic meta-data for your app and also will hold references to any development libraries (see below for details).
2. A `src` sub-folder. This holds the source code for your app. This is also the default location used to serve up your front-end code.
3. A `dist` sub-folder. This is ignored unless you swap to it using the advanced setting in the uibuilder Editor panel.
   You will use this folder if you need to "compile" or "build" your source code into something that the browser can understand (or for efficiency).

UIBUILDER from v5.1+ is able to serve up your front-end code from any sub-folder of the instance root folder.

Other folders you might see or use are:

* `node_modules` - this is the standard npm package folder and will be present if your instance needs any supporting packages for development.
* `api` - this will be present if you are defining an instance-level API to use with your code. API's run on the Node-RED server. See the [How to use Instance API's](instance-apis) page for details.
* `routes` - these are server-side ExpressJS web app routes. These might be used to provide web content that is rendered on the server rather than the client.
* `scripts` - A convenient folder to keep utility scripts that you may wish to run to get things done. Typically accessed by adding to the `scripts` property of the package.json file.

> [!TIP]
> UIBUILDER's _Templates_ feature allows front end folders and code to be easily replaced by a standard or custom template. Several templates are provided but you can create custom templates locally or in the cloud (e.g. GitHub). Templates are loaded via the `uibuilder` node.

## Code Editing

While you _can_ edit code within the Node-RED Editor using the uibuilder configuration panel, this is only really useful for relatively simple editing tasks. Generally,
you will want to use standard web development tooling if your front-end code starts to get bigger.

My recommendation here is to use [Visual Studio Code](https://code.visualstudio.com/) (VScode). Originally developed by Microsoft but now a fully open source community effort. It is free and very fully featured with many extensions to further help. If you prefer true open source, try VSCodium which is VSCode with the Microsoft specific parts stripped out.

Even where your front-end code is on a remote server, VScode can help as Microsoft have provided some remote editing extensions.

### Recommended Extensions

* **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** - This integrates the ESLint JavaScript linting (code checking) tool and is a MUST for good quality code. I
  recommend using the "Standard JavaScript" configuration which is a set of very widely used standards for writing readable JS code.
* **[Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)** - a small set of extensions that enable remote editing. (VSCode only. I no longer use this and instead mount the remote folder locally.)
* **Zoo Code** with OpenRouter - this provides Microsoft-free AI integration for AI assisted coding.

It is also recommended, if you choose to use a front-end framework, to install an extension or pack dedicated to that framework. Such as the **[Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur)** extension for VueJS development.

## Build Processes

If you want to use some code that browsers cannot natively understand or you want to make your code more efficient, you may want
to use a "build" process (occassionally and mistakenly called "compiling").

To do this, you need a build tool. Common build tools are [webpack](https://webpack.js.org/), [Parcel](https://parceljs.org/) and [Rollup](https://rollupjs.org/) though there are many others as well. Some front-end frameworks such as [Svelte](https://svelte.dev/) also have their own tools.

You will need to configure your build tool to use the `src` folder as input and the `dist` folder as output. The `dist` folder must contain at least an `index.html` file that uibuilder uses as the default page to serve up.

> [!TIP]
> Since UIBUILDER v6+, you can configure uibuilder to use any instance root sub-folder, not just `src` and `dist`.

To run a build step, you need to have installed and configured the appropriate tools. These should either be installed on your server as global (e.g. `npm install -g xxxx`), or they must be installed into the instance folder (e.g. `cd ~/.node-red/uibuilder/mytest && npm install -d xxxx`).

Please see the [Front-End Build Steps and Tools](front-end-builds.md) page for more details. Including a longer list of tools and some information on how to configure them.

> [!TIP]
> If you configure the `scripts` section of the instance `package.json` file with a `build` script, you can run the build from within the Node-RED Editor. The "Scripts" tab in the uibuilder node shows you all the available scripts you can run. Install, Remove and Update are automatically added and run the equivalent `npm` scripts so that you can update any installed dev tools.

Some additional information on build processes can be found on the [Optimise & transpile (build)](front-end-builds) page.

### Using a build development server

Many build tools and some front-end frameworks have "live servers" to support development. These automatically reload the page being developed
whenever something changes. 

At present, only the Svelte development server will work correctly without you making some temporary changes to your front-end code.

For all other development servers, you will need to make the following changes:

1. In `index.html` - replace the default `./xxxx` and `../uibuilder/xxxx` URL's with ones that start with the correct Node-RED/uibuilder server. e.g. `http://localhost:1880/xxxx`.
2. In `index.js` - If the uibuilder client cannot connect back to Node-RED, add `uibuilder.start({ioNamespace: 'http://localhost:1880/aa'})` (example, correct for your own locations) where the protocol, server name, and port are your Node-RED/uibuilder server as above and `/aa` is the `uibuilder` node instances URL with a leading `/`. That is the Socket.io communications namespace.

Don't forget to change these back when you are putting your code live. Though your live code would still work, it would be more fragile and would break if you change the server details.

It is also possible that you could automate these changes using the build tool. Using environment variables to tell the tool which url's to use. If not, you could automate the whole process using a tool such as [GulpJS](https://gulpjs.com/).
