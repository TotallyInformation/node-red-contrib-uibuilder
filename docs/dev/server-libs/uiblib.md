---
title: General, non-uibuilder-specific function Library
description: |
  Utility library containing methods that support UIBUILDER. The methods it contains are not generic and will require references to Node-RED objects to be passed.
created: 2021-06-27 21:35:00
updated: 2026-05-04 17:16:05
---

`nodes/libs/uiblib.js`

## Dependencies

* node:path
* node:util
* node:crypto
* node:child_process
* ./fs.cjs

## Variables

None

## Functions/Methods

### getProps
### getSource - Updates a node with the actual value of a typed input field (async)
### inputHandler
### processClose
### runOsCmd
### sendControl
### setNodeStatus
### sortInstances

Sort a uibuilder instances object by url instead of the natural order added

### readGlobalSettings - DEPRECATED in v2.0

### updGlobalSettings  - DEPRECATED in v2.0

### addVendorPath - TO RENAME to addPackage

