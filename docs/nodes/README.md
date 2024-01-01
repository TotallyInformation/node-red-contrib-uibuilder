---
title: Description of uibuilder's nodes
description: |
  Each node has a specific purpose. The main uibuilder node will always be needed. The other nodes play a supporting role.
created: 2023-08-23 10:44:10
lastUpdated: 2023-08-23 11:05:19
updated: 2023-12-30 17:01:41
---

* [`uibuilder`](nodes/uibuilder.md) - The main node. You need at least one of these in order to make full use of all of the features.

  It is this node that creates a custom web server. You can have many nodes if that best meets your needs. But each node can serve many pages.
  
  It also creates a set of filing system folders and files on the Node-RED server. These define the front-end UI you see in the browser as well as providing some important configuration.

  This node is also where you configure much of uibuilder's web server such as installing helper libraries that you may wish to use to support your interfaces (e.g. VueJS, jQuery, etc).
  
  You can also use it to edit your custom UI code.

* [`uib-cache`](nodes/uib-cache.md) - Provides a capability to temporarily or permanently save data sent to uibuilder (and hence to your browser) such that it can be automatically replayed to new clients that connect later.

  It uses Node-RED's native context variable stores and so can be configured flexibly to allow/block external access to the cache and to use persistent storage that will survive a Node-RED restart.

  By default, it caches by `msg.topic`, keeping the latest 1 message for each topic. If no topic is included in the msg, it will not be saved in the cache. However, you can use any other `msg` property to drive the cache and can keep multiple messages for each entry as well if desired.
  
  You can directly connect the port #2 (lower) output of a uibuilder node to the cache node and it will automatically replay the cache for a newly connected client. It also has a switch (on by default) that helps determine whether a connection is actually new or whether it is a client waking up from sleep.
  
* [`uib-element`](nodes/uib-element.md) - No-code conversion of raw data to UI configuration data.
  
  This is one of the zero-code capabilities of uibuilder.

  It allows your input data to be automatically converted to a UI description. That description data is "hydrated" by the uibuilder client library into actual HTML. The output of this node can also be further manipulated. The `uib-html` node uses the same code and can be used to hydrate the description into HTML in Node-RED flows.
  
  The UI configuration data is a documented and re-usable standard, other Node-RED nodes could be created to output or consume the same data.

* [`uib-html`](nodes/uib-html.md) - Converts (hydrates) low-code UI configuration data into HTML.

  Optionally wraps the output with full HTML document tags so that snippets of UI input data can be converted to full pages.

  Output can be saved to files using `uib-save`, this then allows you to have highly efficient "static" HTML created from data that perhaps is only occasionally updated.

  Output can also be used with other tools such as the `http-in`/`http-out` nodes or the Node-RED Dashboard.

* [`uib-save`](nodes/uib-save.md) - Save files to a specific uibuilder node instance.
  
  A convenience node that saves you needing to think about where in the servers filing system resources need to be saved.
  By specifying the name of an existing uibuilder node, it will work out the correct location for you.

  Can be used to save anything that can be "[serialised](https://developer.mozilla.org/en-US/docs/Glossary/Serialization)". Including code, data, images, etc.

* [`uib-sender`](nodes/uib-sender.md) - A link node specifically designed to work with uibuilder
  
  This node lets you send data to a uibuilder node without explicitly wiring it up. Generally, you will use Node-RED's core `link` nodes to do this. However, this node works in conjunction with uibuilder to return outputs directly to the sender node.

  You will rarely need to use this node.

* [`uib-tag`](nodes/uib-tag.md) - No-code creation of a single HTML element (tag)
  
  This is another zero-code node.
  
  It allows you to add **any** HTML tag element, including custom web components, to your web app.

* [`uib-update`](nodes/uib-update.md) - No-code updates of any HTML element in your front-end UI
  
  Another zero-code node.
  
  Use this to make dynamic changes to your UI by directly updating any element. Attributes and content can all be manipulated by this node. It works on custom web components as well as standard HTML elements.
