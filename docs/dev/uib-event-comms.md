---
title: UIBUILDER events
description: |
  This document details the Node-RED runtime and Editor events produced and consumed by UIBUILDER.
created: 2021-09-29 20:04:36
updated: 2025-01-17 16:21:27
---

Node-RED's `RED.events` node.js-based event handlers are used to enable decoupled communications, even between different nodes.

Each UIBUILDER instance acts as a hub for sending data to its connected web clients and receiving messages back and routing them back to the originating component node.

Two pieces of data will be required to enable this:

1. The uibuilder URL - determines which client(s) to send messages to.
2. A node identifier - to determine how to return client messages back to the originating node.

## How it works

A custom node wishing to send a message to a uibuilder connected client must add the message object as the output to an emit function:

```js
RED.events.emit( `uibuilder/send/${targetUibURL}`, {
  "payload": 'Hi from my custom node!',
  "_uib": {
    "originator": node.id
  }
} )
```

In order for any messages to be returned from clients to the originating node, the `_uib.originator` property must be added to the outbound message.

The custom node also requires an event handler to process any returned messages.

Somewhere in the function that defines each node instance:

```js
const inboundHandler = (msg) => {
  // Do something with the msg from the client ...
  // Such as send it to the nodes output port:
  node.send(msg)
}
RED.events.on(`UIBUILDER/return-to-sender/${targetUibURL}`, inboundHandler)

this.on('close', (removed, done) => {
  // Disconnect the handler if the node is removed from the flow
  RED.events.off(`UIBUILDER/return-to-sender/${targetUibURL}`, inboundHandler)

  done()
})
```

Obviously, this only covers communication. Other runtime events are created and used by UIBUILDER as shown below.

The approach has the strong advantage of being open. Which is to say that it doesn't tie you down to a specific framework since it does not define how your front-end code will process the data.

The primary use-case for this is for anyone to be able to very easily create their own node packages that will build/amend web UI's. But of course, it also lets anyone build nodes that control any aspect of data communications with UIBUILDER clients.

And yet, despite that, it does not break the core design principal of uibuilder which is to be framework agnostic and unopinionated.

See "[How to create extension nodes that work with UIBUILDER](dev/3rd-party-extensions.md)" for more information on creating custom nodes that work with UIBUILDER.

## uibuilder runtime standard events

### Emitters

#### uibuilder master runtime setup completed
  
  ```js
  RED.events.emit('uibuilder/runtimeSetupComplete', uib)
  ```
  
  Emitted when the uibuilder module completes runtime setup which means that all of the core settings, methods and classes are now available. But **not** yet any instance data.

  The passed `uib` data is a reference to the global uibuilder settings. This includes references to master folder locations, the uibuilder package.json, standard file names, socket.io channels, custom ExpressJS server settings, etc.

  This can be used by non-uibuilder contributed nodes to ensure that the uibuilder runtime is installed and configured and to obtain a reference to the key settings.
  

#### uibuilder instance runtime setup completed
  
  ```js
  RED.events.emit(`uibuilder/instanceSetupComplete/${node.url}`, node)
  ```
  
  and
  
  ```js
  RED.events.emit('uibuilder/instanceSetupComplete', node)
  ```
  
  Emitted when each instance (uibuilder node) completes its setup. At this point, data for this instance is fully available. The passed `this` is a reference to the defined node with all settings and methods.

  The first variation allows for monitoring of ANY instance, the second allows for monitoring of a specific instance.

  This can be used by _any_ node (part of uibuilder or non-uibuilder contributed nodes) to know when a specific uibuilder node instance runtime is installed and configured and to obtain a reference to the node.

  > [!NOTE]
  > Due to the way that Node-RED works, it is not possible to have an event that fires when all instances are completed.


#### uibuilder instance url name change

  ```js
  RED.events.emit(`uibuilder/URL-change`, { 
    "oldURL": node.oldUrl,
    "newURL": node.url,
    "folder": node.customFolder
  } )
  ```
  
  and
  
  ```js
  RED.events.emit(`uibuilder/URL-change/${node.oldUrl}`, {
    "oldURL": node.oldUrl,
    "newURL": node.url,
    "folder": node.customFolder
  } )
  ```
  
  Emitted if a uibuilder node instance is renamed. e.g. its URL property is changed which also results in the instance folder changing names.

### Server events about clients

### Client Socket.IO connection

```js
this.RED.events.emit(`uibuilder/${node.url}/clientConnect`, ctrlMsg)
```

#### Client Socket.IO disconnection

```js
this.RED.events.emit(`uibuilder/${node.url}/clientDisconnect`, ctrlMsg)
```

### Between server and clients

#### Send from a node to clients
  
  ```js
  RED.events.emit( `uibuilder/send/${node.url}`, { 
    "payload": "something",
    "_uib": {
      "originator": node.id
    }
  } )
  ```

  If an event is emitted targetted at a specific instance (url), the event is automatically forwarded to connected clients. The forwarded message contains the data attached to the event.

  This event is emitted by the `uib-sender` node but may also be emitted by _any_ custom node.

#### From clients back to originating node
  
  ```js
  RED.events.on(`UIBUILDER/return-to-sender/${node.id}`, (msg) => { node.send(msg) })
  ```
  
  If the `uib-sender` node has been used to tunnel messages to clients and if the "return" flag is set, this is the listener that will process returned messages.

## uibuilder Node-RED Editor events

TBC

UIBUILDER Editor events are all prefixed with `uibuilder:`.

### Common library (plugin)

While these events are emitted, currently no nodes make use of them. They are free for 3rd-party nodes to use though.

`resources/editor-common.js`

```js
// Inform interested functions that a uibuilder-related node was added (and why)
RED.events.emit('uibuilder/node-added', node)
```

```js
// Inform interested functions that a uibuilder-related node was changed
RED.events.emit('uibuilder/node-changed', node)
```

```js
// Inform interested functions that a uibuilder-related node was deleted
RED.events.emit('uibuilder/node-deleted', node)
```

"a uibuilder-related node" means any of the nodes in the UIBUILDER package.
