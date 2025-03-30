---
title: Live Request-Response capability
description: |
  Design notes for a uibuilder "live" request/response feature. Mirroring core http-in/-response nodes but with uibuilder features.
created: 2025-02-17 11:15:27
updated: 2025-03-26 11:19:01
---

## Thoughts/Ideas for consideration

* Perhaps should simply be an extension to the uibuilder main node?
  Probably prefer not. Most of the uib processing is already in common libraries (allowing reuse). Most of the uibuilder node covers delivery of physical (file-based) endpoints. Would make the main node even more complex.
* If not the main node, how to integrate. Should at least be linked to a main node.

## Requirements

### MUST

* Response must include standard uibuilder page structure (only where returning a page) & include 2-way comms, same as main uibuilder node.
* Allow wildcard captured URL components and parameters.
* Allow server-side rendering

### SHOULD

* Be able to return JSON

### MIGHT

* Be able to return binary (image, video, ...)
