---
title: Front-End Build Steps and Tools
description: >
   Describes how to use a build step to transpile and optimise your front-end code.
created: 2021-04-22 09:53:00
lastUpdated: 2022-01-05 21:56:10
---

A build step is simply a way to take things that your browser wont understand directly (like .vue, .jsx files)
and convert them to somthing that they can understand.

Along the way, it will try to optimise everything to give the best possible performance.

- [Why have a build step (and why not)](#why-have-a-build-step-and-why-not)
- [Things to watch out for](#things-to-watch-out-for)
- [Using a build development server](#using-a-build-development-server)
- [Tools](#tools)
  - [Snowpack](#snowpack)
  - [Webpack](#webpack)
  - [Parcel](#parcel)
  - [Rollup](#rollup)
  - [Vite (by VueJS author Evan You)](#vite-by-vuejs-author-evan-you)

## Why have a build step (and why not)

If you want to make most use of the more complex features of a front-end library or if you want to write using the
latest language features but still need to support older browsers, then a build step will almost certainly be 
needed.

A build step may also be desirable if you need to squeeze more performance out or reduce the size of your web app.

Otherwise, you may wish to try and avoid the complexity of setting up your build environment, running dev servers
and so on. One of the reasons that uibuilder uses VueJS as its default template is that it is one of the best
front-end libraries for avoiding build steps. It even has a dynamic loader (3rd party extension) and an in-browser compiler.

## Things to watch out for

* The tooling is likely to have its own desired folder structure. You will most likely have to change the configuration
  to make it use the folders for uibuilder on the Node-RED server.
* If using the build-tool's development server, you will need to change some code. See the next section for details. The Svelte development server is the only known exception to this as it "just works" with Node-red/uibuilder.

## Using a build development server

Many build tools and some front-end frameworks have "live servers" to support development. These automatically reload the page being developed
whenever something changes. 

At present, only the Svelte development server will work correctly without you making some temporary changes to your front-end code.

For all other development servers, you will need to make the following changes:

1. In `index.html` - replace the default `./xxxx` and `../uibuilder/xxxx` URL's with ones that start with the correct Node-RED/uibuilder server. e.g. `http://localhost:1880/xxxx`.
2. In `indx.js` - replace the `uibuilder.start()` with `uibuilder.start('http://localhost:1880/aa')` (example) where the protocol, server name and port are your Node-RED/uibuilder server as above and `/aa` is the uibuilder node instances URL with a leading `/`. That is the Socket.io namespace.

   Note that if you have set the `httpNodeRoot` in Node-RED and you are not using uibuilder's custom ExpressJS server, you **must** also include the second parameter which overrides the Socket.IO path such that it includes the httpNodeRoot. Example: if httpNodeRoot='nr', the path parameter must be `/nr/uibuilder/vendor/socket.io`.

Don't forget to change these back when you are putting your code live. Though your live code will still work, it would be more fragile and would break if you change the server details.

It is also possible that you could automate these changes using the build tool. Using environment variables to tell the tool which url's to use. If not, you could automate the whole process using a tool such as [GulpJS](https://gulpjs.com/).

## Tools

There are many options when it comes to tooling for your build step, here are some of the main ones and some of the latest
tools that are a LOT simpler than the earlier ones

### [Snowpack](https://www.snowpack.dev/)

> "a lightning-fast frontend build tool, designed for the modern web"

See the [How-to configure and use a front-end build step using Snowpack](front-end-build-snowpack.md) page for more details.

### [Webpack](https://webpack.js.org/)

TBC

### [Parcel](https://parceljs.org/)

TBC

### [Rollup](https://rollupjs.org/)

TBC

### [Vite](https://vitejs.dev/) (by VueJS author Evan You)

> "an opinionated web dev build tool that serves your code via native ES Module imports during development and bundles it with Rollup for production."
  
While Vite was written by the author of VueJS, it is certainly not only for Vue projects. Out of the box, it supports REACT, JSX as well as various CSS pre-processors and templates. It uses Rollup under the skin.

It uses native browser ES imports to make everything fast.
