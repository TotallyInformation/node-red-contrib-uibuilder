---
title: uib-tag - Zero-code web UI creation of a single HTML tag
description: |
  Create `msg._ui` configuration data that adds a single HTML or web component element (tag) to the browser UI.
created: 2023-08-23 09:30:13
lastUpdated: 2023-11-10 15:05:05
updated: 2023-12-30 17:01:41
---

*(This document is a work-in-progress, it is not complete)*

Available from uibuilder v6.5.0.

With the `uib-tag` node, you can add ANY HTML or custom web component tag to your web page with zero-code.

![Examples of uib-tag in the Editor](image.png)

With this node configuration: ![uib-tag eg config](image-2.png)

You get a simple button that, when clicked, will send a standard message back to Node-RED immediately.

The node's configuration fields are the same as the other zero-code nodes.

This node has an example flow. See Node-RED's import flow library.

>[!NOTE]
> - The output does not get wrapped in a `div` unlike most of the `uib-element` outputs.
>
> - For Markdown to be rendered, you have to have loaded the [Markdown-IT library](https://markdown-it.github.io/). [Details are documented here](client-docs/readme?id=_2-markdown-it-converts-markdown-markup-into-html).
