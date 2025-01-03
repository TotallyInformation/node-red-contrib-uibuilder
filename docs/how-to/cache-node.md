---
title: Caching front-end data
description: |
  This details why you may want to cache data and how to use the cache.
created: 2022-01-07 22:01:49
updated: 2025-01-02 17:33:58
---

> [!NOTE]
> This page is still a work in progress

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

## Using caching with a front-end SPA router

To do:

  * [ ] How to send cache on "route change" control msg - use a switch node before the cache
  * [ ] How to ONLY send cache on "route change" control msg
