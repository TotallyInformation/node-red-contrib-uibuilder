---
title: Manipulating msg._ui using a Node-RED function node
description: |
  How to make changes to msg._ui "manually" in a function node. Particularly useful to be able to make tweaks to the output of the zero-code nodes.
created: 2023-08-23 09:33:45
lastUpdated: 2023-08-23 11:12:24
updated: 2023-12-30 17:01:41
---

**_TO-DO_**

The `msg._ui` property that is the low-code configuration standard that uibuilder uses to automatically create browser UI's

[Docs: Manipulating `msg._ui](client-docs/config-driven-ui?id=manipulating-msg_ui)

[CHANGELOG](changelog?id=changes-to-uibuilder-main-node)

`RED.util.uib.deepObjFind(msg._ui, matcher, cb)`

`RED.util.uib.listAllApps()`

## References

* [Zero-code UI's](using/zero-code-ui)
