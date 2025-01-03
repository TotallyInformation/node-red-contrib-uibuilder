---
title: How to create extension nodes that work with UIBUILDER
description: |
  Anyone can create Node-RED nodes that work with UIBUILDER. This page shows how to go about it.
created: 2024-06-27 15:55:18
updated: 2024-09-07 18:04:05
status: Incomplete
---

UIBUILDER extensions will be Node-RED nodes packaged and published in the normal way. Please see the Node-RED documentation for details of that process.

The most common UIBUILDER extension is likely to be a *no-code node* that converts relatively simple input data into uibuilder low-code output messages that can be sent direct to a uibuilder node. Connected clients will turn the descriptive data into HTML and display on-page without the need for front-end code. An example might be a node that takes an array of objects as a `msg.payload` and a title in `msg.topic` then outputs a configuration that results in a chart on your web page.

This has an additional advantage in that the resulting output is simply a data specification of a web element (or set of elements) that can be further enhanced or changed as needed by other nodes capable of manipulating JSON (pretty much everything in Node-RED therefore!).

> [!TIP]
> Low-code output data can also be converted into full HTML in Node-RED rather than at the client by using the `uib-html` node. The output can be saved to a static file with the `uib-save` node or used with the core `http-response` or Dashboard `ui-template` nodes.
>
> Use this for data-driven pages that only change periodically since the resulting static pages are easily cached by browsers and tend to be the most efficient. For example, a page containing charts that only update once or twice a day.

*These kinds of extensions should require little or no interaction with the technical side of uibuilder* since they only need to use Node-RED's standard wiring to communicate to/from uibuilder connected clients.

This approach is the rough equivalent of Dashboard's ui nodes. However, uibuilder extensions are much simpler since they only need to output JSON data using the [standardised data schema](client-docs/config-driven-ui.md). They also rarely, if ever need to handle specific return data from the clients or deal with caches of data (there is a separate `uib-cache` node for that).

The most likely additional interaction is likely to be automatically making front-end libraries or new web components available to clients. This is covered below.

> [!TIP]
> Custom nodes do not have to output low-code though - you can use them for any type of communication to/from uibuilder connected clients!

## Making new front-end libraries available to clients

If you are creating pre-defined elements for UIBUILDER users, you may need to provide access to some code libraries and possibly CSS files. For example, if providing an easy to use charting element, you may need to give access to Chart.js or uplot.js or some other library along with its formatting CSS.

Unlike Node-RED nodes, front-end libraries are automatically made available to user-facing front-end clients via uibuilder and so, if wanting to locally install a library, it must be installed to the [`uibRoot`](how-to/changing-uibroot#what-is-the-uibroot-folder) folder rather than Node-RED's `userDir` folder.

In addition to the options outlined here, you *could* get users to install the library manually using uibuilder's library manager.

### Copy library to a static share

UIBUILDER creates a folder `<uibRoot>/common/`, anything placed in that folder will be automatically served under `../uibuilder/common/`. So your custom Node-RED module could have a post-install script that copies the actual library resources (e.g. *.js and perhaps *.css) into that folder.

### Attach a folder from your Node-RED module to web server

UIBUILDER makes use of Node-RED's ExpressJS module. It can either use Node-RED's default Express web server or can create a custom one with different settings. Either way, that server is used to make front-end resources available to clients. The resources are exposed as set endpoint URL's but uibuilder's web library. Adding a new set of resources is generally not trivial and requires a number of careful steps. UIBUILDER also needs to be able to unload some or all of the endpoints as well which is also not trivial.

So a uibuilder API is made available to 3rd party extension nodes to make this process easy.

**TBC** API description

### Dynamic npm installation

UIBUILDER has the capability to automatically add library resources by using Node.js's underlying package manager `npm` to install a library from its npm or GitHub repository, or a local folder. The uibuilder node's library manager is normally used for this. However, it may be advantageous for 3rd-party nodes to also use the library manager. This will expose the installed library in the library manager.

Advantages are:
* Users can see the probable load URL if needing to add a manual load.
* Users can choose a different version or to upgrade as needed.

Disadvantages are:
* It allows users to uninstall the library. Meaning that your nodes must check that the library is still loaded.

So this is best for optional libraries.

UIBUILDER provides a runtime API and an Editor API to allow the use of `npm` and ensure that any libraries are loaded into the correct location.

**TBC** API description

> [!TIP]
> Examine the `npm` documentation to see where packaged libraries can be installed from and how to specify versions and branches should that be required.

## Making new web components available to clients

Web components are defined by W3C standards and are extensions to HTML. They can be used by any modern browser and work well with UIBUILDER which already has some [built-in components](client-docs/custom-components).

To make one or a complete library available to uibuilder clients is much the same as making any other library available (see the previous section). However, to make life as easy as possible for users, you should package your components using both IIFE and ESM style modules and ensure that they can be used both in ES Module scripts as well as simply by linking them using `<link>` tags. One easy way to do this is to use the ESBUILD tool. You can see examples in the main uibuilder code, see the `gulpfile.js` file and search for `esbuild`. You will see that uibuilder packages all of its front-end code as minimised IIFE and ESM libraries.

> [!TIP]
> Don't forget to use the `browser` property in your `package.json` file to point to the sensible IIFE entrypoint. UIBUILDER's library manager will use that to help signpost users to the correct URL to load.


## Sending messages to connected clients

The preferred method is simply to output a message and connect your node to the appropriate uibuilder node(s) as usual. Use core link nodes for neatness and a link node in "return mode" should you need to get data back.

You can also use the `uib-sender` node if you prefer. That also has a return node.

You can also implement a direct tunnel from your node to uibuilder-connected clients. While this can be quite tempting and is certainly easy, it can be confusing for users as the flow of data may not be obvious. Use with caution.

See _[UIBUILDER events](dev/uib-event-comms.md)_ for details.


## Receiving messages from connected clients

As all client messages are output from the corresponding uibuilder node, you should use link return nodes or `uib-sender` in return mode.

However, you can also use uibuilder's event system to get messages returned to your node from clients. See _[UIBUILDER events](dev/uib-event-comms.md)_ for details. However, again, bear in mind that such tunnelling of messages may be confusing for flow authors.

## Interacting with uibuilder

### In the Node-RED Editor

#### uibuilder global variable

The `window['uibuilder']` global variable is available in the Editor if uibuilder is installed and configured.

This makes it easy to:

* See the basic configuration of uibuilder along with all instance nodes whether undeployed+deployed (editor instances) or just deployed.
* See whether a required front-end library has been installed.
* See whether uibuilder is using a custom ExpressJS server or Node-RED's built-in server.
* See what url prefix to use for uibuilder served endpoints.

```json
{
    "paletteCategory": "uibuilder",
    "typedInputWidth": "68.5%",
    // Is Node-RED running locally to the Editor?
    "localHost": true,
    // What is the Node-RED server IP/Name
    "nrServer": "127.0.0.1",
    // Do user-facing endpoints have a nodeRoot prefix?
    "nodeRoot": "",
    // Where will uibuilder pages be found?
    "urlPrefix": "http://127.0.0.1:3001/",
    "serverType": "a custom",
    "editorUibInstances": {
        "<nodeID>": "<nodeName>",
        // ...
    },
    "deployedUibInstances": {
        "<nodeID>": "<nodeName>",
        // ...
    },
    "packages": {
        // List of front-end packages installed via the library manager
        // Along with their install folder, version, estimated entry point, homepage, ...
    },
    "uibNodeTypes": [
        "uibuilder", "uib-cache", "uib-element", "uib-html",
        "uib-save", "uib-sender", "uib-tag", "uib-update"
    ],
    "debug": true
}
```

`window['uibuilder'].debug` can be set to true or false to turn on/off extended editor debugging for uibuilder.

> [!WARNING]
> Do not attempt to change any of the other properties or "BAD THINGS"™️ will happen!

The `window['uibuilder'].log()` function can be used to conditionally output console log entries. If `debug` is false, no output will be logged.

> [!NOTE]
> Other properties and/or functions may be added to this over time.

#### uibuilder API's

UIBUILDER has a wide set of administrative API's. These are mostly used by the Node-RED Editor with uibuilder nodes but they can also be called by other nodes from the Node-RED Editor.


### In the Node-RED runtime

#### Watching uibuilder runtime events

Use `RED.events.on` in your node(s).

Listening for `UIBUILDER/runtimeSetupComplete` will tell you that the uibuilder module has been added to Node-RED and is configured for use, it passes the core uibuilder configuration data.

Listening for `UIBUILDER/instanceSetupComplete` or `UIBUILDER/instanceSetupComplete/--url--` (where `--url--` is an instance url) will tell you when a specific instance has been initialised. They pass a reference to the complete node as data.

See _[UIBUILDER events](dev/uib-event-comms.md)_ for details.
