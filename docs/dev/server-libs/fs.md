---
title: UIBUILDER's Filing System Library
description: >
  Manages everything to do with the server filing system.
created: 2023-09-30 15:58:31
lastUpdated: 2023-09-30 18:13:43
---

TBC

A singleton class. `UibFs`, exports `uibFs`.

Aim is to use this for all server file/folder handling eventually, helping facilitate the elimination of the `fs-extra` external library.

## Library references

`path` - Core node.js
`fs/promises` - Async, promises only version of Node.js's `fs` library. Core node.js.
`./socket.js` - uibuilder's socket.io handling library. Another singleton class library. Facilitates real-time comms including front-end and Node-RED message sending.

## Methods

`setup` - Configures the class instance with uibuilder instance information. e.g. references to `RED`, etc.

`writeInstanceFile` - An async function to save a file to a uibuilder node instance's folder structure (used by the new `uib-save` node). 
