---
title: Zero-code UI's
description: >
   Using uibuilder to create web pages and data-driven web apps without writing code
created: 2023-02-22 01:06:09
lastUpdated: 2023-02-22 01:06:15
---

*(This document is a work-in-progress, it is not complete)*

> "Zero-code" - the ability to process information without the need to write computer code.

> "Element" - Something on a web page. Defined by one or more HTML "tags" such as `<div>...</div>`.

As of v6.1 of uibuilder, its zero-code capabilities consist of two Node-RED nodes (`uib-element` and `uib-update`) that output data in an [intermediate data format](client-docs/config-driven-ui.md) that is well documented on this site. That data format can be consumed by the uibuilder client library and turned dynamically into HTML that is inserted into your uibuilder-driven web pages.

> [!TIP]
> Use Node-RED's *import > examples* feature to see fully working examples for uibuilder's zero-code features.

To get started with uibuilder zero-code, you will need a `uibuilder` node configured and deployed in your flow. You can then add `uib-element` and/or `uib-update` nodes and feed them with data via input messages and the output sent to the uibuilder node.

## `uib-element`

This node creates complex web UI elements such as tables and lists from relatively simple input data such as an array or object.

Where a node specifies a unique HTML ID, most of the element types will either add a new element or will update the element if it already exists (replace mode). If no ID is provided, a new element will always be added.

Some of the element types however, will always add. For example the list and table row elements.

## `uib-update`

This node updates or deletes an existing element on one or more of your uibuilder web pages. Elements are identified using a [CSS Selector](https://developer.mozilla.org/en-US/docs/web/css/css_selectors). All elements identified by the selector will be updated/deleted. This means that, for example, all of the entries in a bullet list can be updated with a single node, or all of the rows of a table could be removed.

----

> [!TIP]
> The intermediate data format that these nodes produce is an open format that other nodes and client libraries can use.
> 
> From v6.2+, the `uib-html` node will allow conversion to HTML ("hydration") within Node-RED not just in the client front-end. This will mean that uibuilder's zero-code capabilities could be used with Dashboard, http-in/-out and other features). It will also make it possible to update static HTML files which is useful where large HTML pages are occasionally updated since static loading of pages tends to be a lot more efficient. The future `uib-save` node will facilitate saving HTML (and other file types) to a uibuilder instance's live folders.
