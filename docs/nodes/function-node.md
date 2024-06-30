---
title: Enhancements to the Node-RED function node
description: |
  Some extensions to the Node-RED function node by the UIBUILDER package.
created: 2024-06-14 20:53:10
updated: 2024-06-29 11:01:55
---

* `RED.util.uib.deepObjFind(msg._ui, matcher, cb)` - where `matcher` is a function that, if returns it true, will result in `cb(obj)` function being called. An example is provided in [Manipulating msg._ui](client-docs/config-driven-ui?id=manipulating-msg_ui).

* `RED.util.uib.dp(inp, dp, int)` - returns a string representation of an input number formatted to the given number of decimal places and locale. `dp` defaults to 1 decimal place. `int` defaults to `en-GB` locale.

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
