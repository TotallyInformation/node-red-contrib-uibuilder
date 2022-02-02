---
title: Using the Cache node
description: >
   Describes how and why to use the uib-cache node. How to cache and replay messages when a new uibuilder client loads
   or reloads a uibuilder supported page.
created: 2022-01-07 22:01:49
lastUpdated: 2022-01-07 22:29:59
---

The cache node was added in uibuilder v5. It provides an easy method of saving messages in a cache and replaying them
when needed. Typically when a client browser loads or reloads a uibuilder web page.

## Using the cache node

Note that you can use the `uib-cache` node independently of uibuilder if you wish. See the [pre-defined messages](pre-defined-msgs) page for details of the `REPLAY` and `CLEAR` cache control messages.

Otherwise, usage of the node is as simple as adding it to your flow. Typically before a uibuilder node.

Any message sent into the node will be cached according to the settings given.

If you connect the uibuilder node's #2 lower output port to the input, clients will automatically request a
replay of the cache whenever they connect or reconnect.

### Grouping

Typically you will provide a `msg` property such as the default `topic` (`msg.topic`) to group your cached messages by.

In this case and using the other defaults, the last message for each `msg.topic` value will be saved in the cache.
If a new message with the same topic arrives the old message will be removed and the new one saved.

If you change the number of messages to be retained to a higher number, say 4, then the last 4 messages for each
topic will be retained and replayed on request.

If you use a property that doesn't exist, you will get messages stored in the `undefined` category. 
This is also the case if you choose the option to cache each message individually.

If you set the number of messages to be cached to zero, the node will not remove any old messages from the cache, 
you will have to periodically empty the cache using a control message.

### Context Stores

The node uses Node-RED's built-in context storage library to retain the data.

By default, this retains data in memory. However, you can define alternative stores and define which store is
default in the `contextStorage` property in `settings.js`.

When you have more than one storage module set up, you can choose between them in the node.

If you switch to another storage method, you may want to delete the old version of the `uib_cache` context variable
manually as it will not be deleted automatically at present.

## Limitations

Memory is the biggest limitation, trying to cache too many entries **will** eventually crash Node-RED. This can 
be hard to predict as it depends on a lot of variables. Caution is advised.

There are a number of enhancements and improvements to this node that are on the backlog. The current changelog should
have the list.