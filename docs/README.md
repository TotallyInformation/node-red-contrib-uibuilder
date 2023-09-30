---
title: UIBUILDER Documentation
description: >
  UIBUILDER provides a stand-alone web server that allows for interfacing with Node-RED, while giving you help and complete freedom to create custom web interfaces.
created: 2019-06-16 16:16:00
lastUpdated: 2023-09-30 13:06:56
---

It includes many helper features that can reduce or eliminate the need to write code for building data-driven web applications and user interfaces for Node-RED.

All you need to start making use of UIBUILDER is a `uibuilder` node added to your flows. Select a suitable URL path and deploy. Then click on the "Open url" button to open the new page in a new tab.

Now you can edit the front-end html, JavaScript and CSS files. You can also send messages to your front end and send messages back to Node-RED.

UIBUILDER comes with some *templates* to give you some front-end code to get you started. Load a different template if you like, use the editor to customise the UI. Use the library manager if you need any front-end libraries or frameworks (this adds the appropriate folders to the web server so that you can access them from your UI).

UIBUILDER also comes with a number of *example flows*. These are accessed from Node-RED's "hamburger" menu, import entry. They are fully working flows that demonstrate the use of UIBUILDER.

> [!TIP]
> These are the docs for UIBUILDER v6. If you need the v5 or earlier docs, the easiest way is to set up a test instance of Node-RED and manually install the appropriate UIBUILDER version: `npm install node-red-contrib-uibuilder@5` then use the documentation links from a `uibuilder` node.

## Getting help and contributing

node-red-contrib-uibuilder is contained in a [GitHub repository](https://github.com/TotallyInformation/node-red-contrib-uibuilder) and is [published on npmjs.org](https://www.npmjs.com/package/node-red-contrib-uibuilder) for ease of installation.

Help is available in this documentation, the help sidebar in Node-RED, and the [GitHub WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). If you get stuck, you can also create a new topic in the [Node-RED Discourse Forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder) or in the [GitHub discussion section](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions).

Issues occuring with UIBUILDER should be raised in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) but please feel free to discuss in the Node-RED forum first if you like.

WIKI, code (PR's), documentation, and examples are all welcome contributions and I always aim to give credit to contributors. Please see the [contribution guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/.github/CONTRIBUTING.md).

## Using UIBUILDER

* [A first-timers walkthough of using UIBUILDER](walkthrough1.md) - Let's get started!

* [Did you know?](did-you-know.md) - Things you might not know about UIBUILDER, hints and tips
* [Creating data-driven web apps with UIBUILDER and Node-RED](web-app-workflow.md) - Different styles and workflows you can use
* [Configuring UIBUILDER](uib-configuration.md) - Configure the UIBUILDER platform. Affects all `uibuilder` nodes
* [Standard messages](pre-defined-msgs.md) - A catalogue of messages and properties
* [Creating Templates](creating-templates) - Pre-defined and reusable front-end code, dependencies, and optional build steps
* [Browser auto-refresh](browser-refresh.md) - Automatically reload your page after a change
* [Zero-code UI creation](using/zero-code-ui.md) - Dynamically creating web UI's

## The nodes

[nodes](nodes/README.md ':include')

## Content Index

[index](-sidebar.md ':include')
