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

`fs (readFileSync)` - Synchronous file read.

`./socket.js` - uibuilder's socket.io handling library. Another singleton class library. Facilitates real-time comms including front-end and Node-RED message sending.

## Async methods

All return a promise.

`getInstanceLiveHtmlFiles(url)`

`getUibInstanceRootFolders()`

`getTemplateFile(template, fName)` - Gets a text file from uibuilder's master templates. Used by `uib-html` to optionally apply the blank template.

`writeInstanceFile(url, folder, fname, data, createFolder = false, reload = false)` - An async function to save a file to a uibuilder node instance's folder structure (used by the new `uib-save` node). 

## Synchronous methods

`readJSONSync(file)` - Read a file and return as parsed JSON or throw an error. May be used as an fs-extra replacement.

## Utility methods

`setup` - Configures the class instance with uibuilder instance information. e.g. references to `RED`, etc.

`walk(dir, ftype)` - Walk (sub)folders returning all files of the given extension.
