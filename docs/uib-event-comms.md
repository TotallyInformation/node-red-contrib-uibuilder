---
title: Future multi-node communications
description: >
   Initially, uibuilder was a single node. However, there was always the intent to offer wider communications from other packages and nodes
   to uibuilder-based front-end's. This document lays out a proposal for how that may happen.
created: 2021-09-29 20:04:36
lastUpdated: 2021-09-29 21:17:01
---

Status: **Draft**

uibuilder v5 will use the Node.js package [ti-common-event-handler](https://github.com/TotallyInformation/ti-common-event-handler) to create a shareable event handler
that facilitates communications between 3rd-party Node-RED nodes and uibuilder node instances (and back again).

Each uibuilder instance will act as a hub for sending data to its connected web clients and receiving messages back and routing them back to the originating node.

Two pieces of data will be required to enable this:

1. The uibuilder URL
2. A component identifier

## How it works - the component node

A component node will need to:

* Use the same event handler package. The module in the package is defined as a singleton class instance so it doesn't matter which node require's the module. All require's get exactly the same instance.
* Use a standard event naming pattern (defined below).
* Define a component identifier that front-end code will use.
* Send events to the defined event name with a standard Node-RED msg object.
* Add pre-defined metadata to the msg so that uibuilder and front-end code know how to process it. See below for details.
* Register a return event handler with a specific naming convention (defined below).
  The uibuilder instance will maintain an internal map of component-id's to return event names so that messages back from the front-end can be automatically routed back to the originating node.
* Send an initial control msg on Node-RED startup that will allow uibuilder to create the return map.
* Send a final control msg on node removal, before re-deployment and on Node-RED closedown so that all event handlers are unregistered and the map is updated.

### Front-end web components

Note that the component node does not _need_ to define any front-end components. You could just write suitable code manually for your front-end. 
However, there _will_ be a set of standards that will allow a component node to make resources available to uibuilder-based front-ends. 

The important thing is that messages will be automatically routed both to and from the front-end.

It is likely that there will be a mechanism in the `uibuilderfe.js` front-end library that will enable it to auto-load defined resources. Details to be defined later.

## How it works - the uibuilder node

When a uibuilder node receives the first event from a component node as defined below, it creates an entry in a mapping table.

The table maps the links between the component nodes (based on the node's Node-RED id) and the component-id. 
This allows return messages from the front-end to be routed back to the correct originating node for any processing that node wishes to do. 
For example, it may choose to pass the returned message to its output port. This is likely to be the most common scenario.

## Event naming standards

Event names will use the following standard to allow component nodes to send data:

```
node-red-contrib-uibuilder/<uib_url>/<component_id>
```

To facilitate return messages, the following standard will be used:

```
node-red-contrib-uibuilder/<node_instance_id>/return
```

Where:

* `<uib_url>` - is the uibuilder URL which is set in the uibuilder node and is the unique identifier for uibuilder instances.
* `<component_id>` - is a string identifier that is unique to your front-end code. It can be arbitrary. Component nodes can define defaults if preferred.
* `<node_instance_id>` - is the Node-RED node id of the instance of the component node.

## Standard msg metadata

The message metadata will take two forms:

1. Firstly, some uibuilder standard data. This will define the root property to use so that we keep the pre-defined properties to a minimum which avoids name-clashes and avoids limiting how you can use a msg object.
   
   There is already a standard that uibuilder uses and it is likely that this would continue to be used and extended as needed.

   A component identifier string would certainly be required. As described above, this only needs to be unique within your front-end code.

   It is likely that a "component type" property would also be used to differentiate between data schema's. 

2. Secondly, some component-specific data. This would be defined by the component node's author.
   
   This would sit _under_ the uibuilder property so as to avoid polluting the namespace of the msg object.

   It is possible that a schema standard would be defined to help but the data would mostly be defined by the component author.

Note that uibuilder already pre-defines some metadata for some tasks including security.

## The future

Obviously, this design note only covers communication. 

The approach has the strong advantage of being open. Which is to say that it doesn't tie you down to a specific framework since it does not define how your
front-end code will process the data.

However, it _does_ lay a foundation that will let nodes be created that _will_ allow authors to create nodes with front-end components and _will_ enable such nodes to fully automate both the component code delivery and the communications between the node and the front-end (and back of course).

This means that this approach is the first step towards a low-/no-code, simple to use, node-based web ui builder.

And yet, despite that, it does not break the core design principal of uibuilder which is to be framework agnostic and unopinionated.