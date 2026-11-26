---
title: Caching front-end data
description: |
  This details why you may want to cache data and how to use the cache.
created: 2022-01-07 22:01:49
updated: 2026-11-26 12:05:58
---

> [!TIP]
> If you want to know how to configure the `uib-cache` node, please see the [uib-cache](nodes/uib-cache.md) documentation.

When using Node-RED to deliver a user-facing UI, it needs to be remembered that *what happens in the client browser is very much separate from what happens on the Node-RED server*. One of the key design principals of UIBUILDER is to provide the networking links between the server and all clients. There are 2 connections, HTTP(S) web and Socket.IO realtime communications.

Caching of data for HTTP(S) happens naturally via the web server (ExpressJS) and the users browser. There can also be independent proxy servers that can help. This type of caching is mostly about performance, reducing the impact on Node-RED and reducing network traffic. *No special design or flow is needed to account for this* (unless you want a proxy), it is already integral to how Node-RED works.

However, one of the main reasons for using Node-RED is to enable *realtime communications* between the server and connected clients. It is here that we need to think about data caching. The flows in Node-RED will be happening in the background regardless of whether a client is connected or not. And so when a new client connects or if an existing client has been temporarily offline (e.g. PC or mobile in power saving mode), it often needs the latest Node-RED data. *Unless that data has been cached, it will not be available* and the client will be out of step with current "reality".

Because not all web UI's will need caching and others may need multiple data caching strategies, UIBUILDER provides the capability as a separate node, `uib-cache`. Developers do not _have_ to use this node, they can also roll their own caching flow.

> [!TIP]
> While these examples show a single `uib-cache` node, you can use multiple nodes to provide different caching strategies.

<figure>
  <img src="./how-to/cache-reference-flow.png" alt="Cache reference flow" title="Typical flow for uibuilder with cache">
  <figcaption>Typical flow for uibuilder with a single cache</figcaption>
</figure>

> [!TIP]
> As of v7, clients automatically _filter_ incoming messages based on `pageName`, `clientId`, and `tabId` properties either in `msg._ui` or `msg._uib`. This means that you can send messages to specific clients or pages without needing to filter them in your flows. This is particularly useful when you have multiple clients connected to the same Node-RED instance.
>
> If your cached messages include these properties, any cache replay events will automatically target the correct client or page.

> [!TIP]
> As of v8.0, There are 2 methods to allow delayed cache replay. This is very useful when dynamically creating a page's UI and wanting to send data to that UI page.
>
> The `uib-cache` node has a delay property you can set in the Editor, this delays all messages when replaying the cache by a set amount. Using this along with multiple cache nodes gives you fine-grained control over replay strategies.
>
> You can also include a `_uibCacheDelay` property in any cached message, this overrides any node delay. Use this if you want to keep to a single cache node but need to delay some messages on replay.

## Using caching with a front-end SPA router

Normally, a uibuilder node will loop its control output port to the cache node which reacts automatically when a client connects to the server by replaying the cache.

When using uibuilder's front-end router to create a single-page app (SPA), you may need to also react to route changes. This would be needed if you have configured the router to unload a route when changing to a new one (to save client resources). But you may also want to simply get the latest set of data when a route becomes active.

The SPA router library sents a "route change" control message back to Node-RED automatically, as with a client connect message, this appears on the 2nd output port of the uibuilder node.

To cause this to do a cache replay, use a `switch` node to look at `msg.uibuilderCtrl` and switch on "route change". Use that to create a new message using a `change` node with `msg.uibuilderCtrl` set to "cache replay" and `msg.cacheControl` set to "REPLAY".

Alternatively, you can simply direct "route change" controls to another switch that separates out the possible route names and directs them to flows that refresh the data.
