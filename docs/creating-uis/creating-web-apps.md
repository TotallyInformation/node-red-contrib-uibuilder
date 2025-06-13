---
title: How to create data-driven web applications using UIBUILDER
description: |
  Using UIBUILDER with the Node-RED server enables anyone to easily create data-driven web applications. This guide shows how to use the uibuilder nodes to create a basic web app that can be extended to create more complex applications.
created: 2025-05-26 12:07:24
updated: 2025-06-13 12:55:55
author: Julian Knight (Totally Information)
status: Draft
---

Node-RED is a powerful server tool that allows you to easily manage data and integrate with other systems. While it has a built-in method for creating web endpoints (`http-in` and `http-response` nodes), using that to create a full web application can be complex and time-consuming.

UIBUILDER simplifies this process by providing a set of nodes that allow you to create web applications that have dynamic, 2-way communications between the browser and Node-RED server. All with minimal coding. It allows you to create dynamic, data-driven web applications that can be easily extended and modified.

Node-RED also has 2 contributed *Dashboard's*. The create grid layouts and have numerous pre-built widgets. However, you are mostly limited to using the widgets. Going beyond that suddenly becomes very complex. In addition, the resulting dashboards are quite resource heavy which can be a problem on limited end-user devices. The Dashboards are also build on specific versions of specific front-end frameworks which can make it difficult to upgrade or change the underlying technology.

UIBUILDER is designed to be lightweight and flexible, allowing you to create custom web applications that can be tailored to your specific needs. It is also designed to be easy to use, even for those with limited coding experience. It also follows modern web standards and practices, so time and effort spent on UIBUILDER will continue to be useful far into the future.

## Creating a basic web app

A basic web app using UIBUILDER can be created in just a few minutes. All that is needed is a `uibuilder` node. Give the node a `url` name, e.g. `myapp`, and then deploy the flow. The node will create a new folder in the Node-RED user directory called `uibuilder/myapp`. This folder will contain all of the files needed for your web app. The app can now be opened in a web browser, simply use the "Open" button in the Node-RED editor or navigate to `http://<your-node-red-server>:1880/uibuilder/myapp`.

You will note, however, that the app is very basic. It has no content but does have styling. It provides a blank canvas for you to build your own web app.

Any message that you send to the `uibuilder` node will be sent direct to the web app. Any message that the web app sends will be received by the `uibuilder` node.

Your next decision will be whether to write your own HTML, CSS and JavaScript or to use UIBUILDER's no-code or low-code nodes to create the UI.

## Using the no-code/low-code nodes

> [!TIP]
> See the example flows in Node-RED's import library for examples of how to use the no-code/low-code nodes. The `uibuilder` node has a number of example flows that can be imported into your Node-RED instance. These examples show how to use the `uib-element`, `uib-html`, `uib-update`, and other nodes to create a web app without writing any code.

## Custom web development

UIBUILDER is designed to allow you to easily use your preferred web development tools. By default, the `uibuilder` node has a link that is configured to open the folder containing your web app files in Microsoft's Visual Studio Code editor. This is the recommended editor for working with UIBUILDER web apps. However, you can use any text editor or IDE that you prefer.

If you are using the default uibuilder template created by at least v7.3.0, you will find that it contains configuration files for TypeScript and ESLINT. If you run `npm install` in the instance folder, it will install the ESLINT dependencies. Between them, these configurations will help you use the uibuilder front-end library and create a well-structured web app.

By default, the blank template uses script-style libraries but you can use ES Modules (ESM) if you prefer. The uibuilder client library has 2 versions.

If you want to use other 3rd-party libraries, including front-end frameworks, you will either load them from a CDN or install them using the `uibuilder` node's Library Manager tab. The uibuilder client library is designed to work with any front-end framework or library that you choose to use.

If you use a library that requires a build step, such as REACT or Svelte, you will need to set up a build process. 

## Using web components

Each of UIBUILDER's templates contain a `<div>` with the id "`more`" which is used as a parent element by many of the examples in the Node-RED import library.

In addition, the `more` div uses uibuilder's `uib-topic` special attribute which allows it to be used as a target for messages sent from Node-RED. This is a useful feature that allows you to easily update the content of the page without having to write any JavaScript code. Send a message containing `{ topic: 'more', payload: 'Hello World' }` to the `uibuilder` node and the content of the `more` div will be updated with "Hello World". Note that the payload can contain HTML. As an example, use an inject node with `msg.payload` set to use a JSONata expression like `"<b style='background-color:var(--error)'>Hello!</b> This is a message from Node-RED at " & $moment()`. Don't forget to set `msg.topic` to `more` so that the uibuilder client library knows where to send the message.

> [!TIP]
> Using the "more" topic completely overwrites the contents of the `more` div.
