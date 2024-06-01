---
title: About UIBUILDER for Node-RED
description: |
  UIBUILDER provides tools for easily creating data-driven web applications using the Node-RED low-code programming platform.
created: 2024-05-02 11:17:20
updated: 2024-05-02 19:49:46
---

## What is UIBUILDER?

Node-RED's Dashboard and UIBUILDER are both different approaches to the same use-case. How to present data to users in a web browser tab and get information back from them into Node-RED. Remembering that the users browser and the Node-RED server are completely different environments and may be on different devices.

We refer to this as a "data-driven web application".

UIBUILDER was created in order to provide Node-RED users with a flexible alternative to the Dashboard.

Dashboard is extremely simple to start using and great for doing relatively straight-forward UI's very quickly. However, if you want to do more complex things, you quickly hit the brick-wall that is common with many frameworks. Suddenly things go from being simple to very complex.

UIBUILDER takes the opposite approach to Dashboard. Its main purpose is to be a foundation on which you can build whatever you like, however you like.

It does the complex background tasks for you and then gets out of the way.

Better still, it requires no complex frameworks, though it will work with them if required, but instead simple enhances native browser HTML, CSS and JavaScript capabilities.

UIBUILDER is a bridge between the Node-RED server and any connected clients (web browser tabs). Each browser tab pointing at the same uibuilder instance is a client and you can have many clients running from 1 browser, 1 device/many browsers or different devices - however you like.

It includes many helper features that can reduce or eliminate the need to write code for building data-driven web applications and user interfaces. It utilises standard HTML/CSS and is not a framework. You can use it with a front-end framework if you like, but in many cases you won't need one.

## What are UIBUILDER's main features?

* Easily send data real-time between Node-RED and any connected browser client, and send the other way as well.
* Easily add any number of web pages and other resources to each uibuilder instance.
* Use simple HTML attributes to enable dynamically updated web elements (eliminating one of the key reasons to use a framework).
* Option to use standard web development tools when developing your own front-end code.
* Manage additional front-end libraries from within the Node-RED Editor, all of which will be made available to client connections.
* Apply custom middleware to the web server and/or real-time communications server. Allowing you to build your own security or other processing.
* Dynamically create web UI's using standardised data-configuration instead of code (so-called "low-code") - simplifies HTML coding while staying close enough that learning is enhanced.
* Dynamically create web UI's using only Node-RED nodes (so-called "no-code").
  
  > [!TIP]
  > The no-code nodes actually output low-code configuration data. While this will normally be sent direct to the client and turned into HTML automatically, you can also examine the output and make your own changes and enhancements before sending it.

* Option to use the no-/low-code outputs to create HTML within Node-RED. Allowing you to use uibuilder to support other nodes such as http-in/-out and Dashboard as well as writing to storage to use as static web pages.
* Option to use uibuilder's [front-end "router"](client-docs/fe-router.md). This enables the creation of Single Page Apps (SPA's) from single or multiple source files. Making complex interfaces much easier to manage.
* Option to use Markdown for content. Making the creation of web content much simpler and enabling re-use of content from other common sources such as [Obsidian](https://obsidian.md) or [Typora](https://typora.io).

## What does UIBUILDER depend on?

### Node-RED

[Node-RED](https://nodered.org/) is a flow-based programming tool, originally developed by IBM's Emerging Technology Services team and now a part of the JS Foundation. It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single-click.

### ExpressJS

[Express](https://expressjs.com) is a fast, unopinionated, minimalist web framework for Node.js.

It is already built into Node-RED and is also used by UIBUILDER to provide all of the web server tooling.

### Socket.IO

[Socket.IO](https://socket.io/) enables real-time, bidirectional and event-based communication. It works on every platform, browser or device, focusing equally on reliability and performance.

UIBUILDER uses Socket.IO to provide real-time communications between Node-RED and the browser clients.

### Degit

[degit](https://github.com/Rich-Harris/degit) is a small tool for making fast, efficient copies of git repositories.

UIBUILDER uses it to enable the use of external templates.

### JSDOM

[jsdom](https://github.com/jsdom/jsdom) is a pure-JavaScript implementation of many web standards, notably the WHATWG DOM and HTML Standards, for use with Node.js. In general, the goal of the project is to emulate enough of a subset of a web browser to be useful for testing and scraping real-world web applications.

It is used by the `uib-html` node to hydrate low-code configuration data into full HTML within Node-RED in the same way that the uibuilder client library does in the browser.

### Other

A few other dependencies are used to support the development of UIBUILDER but are not required for its use. They include:

* ESLINT is used to help eliminate many JavaScript, HTML and CSS coding errors and ensure a consistent code style throughout.
* GULP is used to automate build and deploy tasks.
* VSCode is used to do all code editing.

## Getting help and contributing

node-red-contrib-uibuilder is contained in a [GitHub repository](https://github.com/TotallyInformation/node-red-contrib-uibuilder) and is [published on npmjs.org](https://www.npmjs.com/package/node-red-contrib-uibuilder) for ease of installation.

Help is available in this documentation, the help sidebar in Node-RED, and the [GitHub WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). If you get stuck, you can also create a new topic in the [Node-RED Discourse Forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder) or in the [GitHub discussion section](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions).

This documentation is accessible from within Node-RED, simply open a uibuilder node and click on the "Docs" button. Alternatively, you can access the docs for the current release via GitHub at: https://totallyinformation.github.io/node-red-contrib-uibuilder/

Issues occuring with UIBUILDER should be raised in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) but please feel free to discuss in the Node-RED forum first if you like.

WIKI, code (PR's), documentation, and examples are all welcome contributions and I always aim to give credit to contributors. Please see the [contribution guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/.github/CONTRIBUTING.md).

[version](.config/docs-version.md ':include')

## The nodes

These are the nodes available as part of UIBUILDER.

[nodes](nodes/README.md ':include')

## Additional Information

[Additional Info](.config/links.md ':include')
