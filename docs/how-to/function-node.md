---
title: Manipulating msg._ui using a Node-RED function node
description: |
  How to make changes to msg._ui "manually" in a function node. Particularly useful to be able to make tweaks to the output of the zero-code nodes.
created: 2023-08-23 09:33:45
lastUpdated: 2023-08-23 11:12:24
updated: 2024-06-14 20:52:52
---

The `msg._ui` property is the low-code configuration standard that UIBUILDER uses to automatically create browser UI's

[Docs: Manipulating `msg._ui`](client-docs/config-driven-ui?id=manipulating-msg_ui)

UIBUILDER adds two supporting functions to `RED.util.uib` which you can use in function nodes:

* `RED.util.uib.deepObjFind(msg._ui, matcher, cb)` - where `matcher` is a function that, if returns it true, will result in `cb(obj)` function being called. An example is in the document referenced above.

* `RED.util.uib.listAllApps()` - returns a list of all of the uibuilder nodes and some details about them:
  
  ```json
  {
    "uib-element-test": {
      "node":"90794d03f65a40d4",
      "url":"uib-element-test",
      "title":"Zero-code examples",
      "descr":"A collection of flows that demonstrate and test all of the uib-element node's output types."
    },
    // ...
  }
  ```

## References

* [Zero-code UI's](using/zero-code-ui)
