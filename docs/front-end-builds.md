---
title: Front-End Build Steps and Tools
description: >
   Describes how to use a build step to transpile and optimise your front-end code.
created: 2021-04-22 09:53:00
lastUpdated: 2021-06-27 17:47:31
---

A build step is simply a way to take things that your browser wont understand directly (like .vue, .jsx files)
and convert them to somthing that they can understand.

Along the way, it will try to optimise everything to give the best possible performance.

If you want to skip the rest of the blurb, please feel free to go straight to one of the how-to pages:

* [Snowpack](./front-end-build-snowpack.md)
* [Webpack] TBC

## Why have a build step (and why not)

If you want to make most use of the more complex features of a front-end library or if you want to write using the
latest language features but still need to support older browsers, then a build step will almost certainly be 
needed.

A build step may also be desirable if you need to squeeze more performance out or reduce the size of your web app.

Otherwise, you may wish to try and avoid the complexity of setting up your build environment, running dev servers
and so on. One of the reasons that uibuilder uses VueJS as its default template is that it is one of the best
front-end libraries for avoiding build steps. It even has a dynamic loader (3rd party extension) and a front-end compiler.

Build tools also include a development server, these watch for changes to your source files and dynamically update your browser.
I indicate below when I know that these tools work directly with Node-RED and uibuilder rather than just the native development
server - which of course, won't have the websocket interaction with Node-RED.

## Things to watch out for

* The tooling is likely to have its own desired folder structure. You will most likely have to change the configuration
  to make it use the folders for uibuilder on the Node-RED server.
* The development server may not work with Node-RED and uibuilder. The server is a separate webserver whereas uibuilder
  front-end really need files served by Node-RED. However, some dev servers may dynamically update the output files
  and signal the browser to update (as happens with the Svelte development server). If the dev server doesn't work,
  you have to do a "production" build each time and manually reload your front-end page.

## Tools

There are many options when it comes to tooling for your build step, here are some of the main ones and some of the latest
tools that are a LOT simpler than the earlier ones

### [Snowpack](https://www.snowpack.dev/)

> "a lightning-fast frontend build tool, designed for the modern web"

This can be used to build code for uibuilder but the development server does not dynamically update the build directory and so doesn't directly integrate with uibuilder.

### Webpack

### Parcel

### Rollup

### [Vite](https://vitejs.dev/) (by VueJS author Evan You)

> "an opinionated web dev build tool that serves your code via native ES Module imports during development and bundles it with Rollup for production."
  
While this was written by the author of VueJS, it is certainly not only for Vue projects. Out of the box, it supports REACT, JSX as well as various CSS pre-processors and templates. It uses Rollup under the skin.

It uses native browser ES imports to make everything fast.

This can be used to build code for uibuilder but the development server does not dynamically update the build directory and so doesn't directly integrate with uibuilder.