---
title: How to load external files using uibuilder
description: >
   Include external HTML, styles, JavaScript and ECMA web components from external files.
created: 2023-01-04 20:27:33
lastUpdated: 2023-01-04 20:27:38
---

This can be done from Node-RED by sending a msg to the front-end with the appropriate msg._ui data.

It can also be done from front-end code by simulating a msg from Node-RED using the same data. 

In addition, external loads can be included in an initial UI load using  the `load` method from Node-RED or the `loadui` function in the front-end - `uibuilder.loadui('something.json')`.

## References

* [Method: Load](../client-docs/config-driven-ui.md#method-load)
* [Simulating a msg from Node-RED](../client-docs/features.md)

