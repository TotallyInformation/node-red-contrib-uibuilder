---
title: uib-update - Update the attributes, properties or slot content of an existing element
description: >
   Usage and configuration.
created: 2023-02-05 16:31:39
lastUpdated: 2023-02-22 00:50:34
---

*(This document is a work-in-progress, it is not complete)*

Zero-code UI updates from Node-RED flows. Outputs msg._ui low-code config data that the uibuilder client library can turn into full HTML. (Same format as the `uib-element` node)

Can also delete (remove) existing elements. Note that in delete mode, this node will remove **ALL** element specified by the CSS Selector. e.g. if you specify a selector of "li", every list entry from every list on the page will be deleted. Use with caution.

In update mode (the default), any combination of attributes (e.g. class, style, etc) and inner content (the so-called "slot" content) can be updated. Slot content can be text, HTML or (if the `markdown-it` library is loaded) Markdown.
