---
title: How to load external files using uibuilder
description: >
   Include external HTML, styles, JavaScript and ECMA web components from external files.
created: 2023-01-04 20:27:33
lastUpdated: 2023-03-20 20:34:52
---

> [!NOTE]
> All of the methods listed here can be run either from Node-RED or from custom front-end code.
>
> This gives you control from both the server and the browser. Use one or the other, or use both, as the need arises.

## HTML

HTML fragments can be created/updated from Node-RED using the standard [dynamic UI methods]() by setting the `slot` property which accepts HTML. 

Those methods can also be invoked from custom front-end code either by [simulating a msg](client-docs/features#set-function) or by running the [`uibuilder.ui()` function](client-docs/functions#uijson-directly-manage-ui-via-json) directly. HTML fragments for passing on to the UI can be created in Node-RED using the core `template` node with its Mustache templating if desired.

Additionally, HTML fragments can be loaded from external files or API's in custom front-end code using [the `uibuilder.include(url, uiOptions)` function](client-docs/functions#includeurl-id-parentselector---insert-an-external-file-into-the-web-page).

## JavaScript and CSS

External loading of JavaScript (including ECMA Web Components) and CSS can be done using the [`load` method](client-docs/config-driven-ui.md#method-load) of uibuilder's UI functions. 

It can also be done from front-end code by [simulating a msg](client-docs/features#set-function) from Node-RED using the same data. Or by running one of these functions: `uibuilder.loadScriptSrc(url)`, `uibuilder.loadStyleSrc(url)`.

[ECMA Web Components allow new HTML tags to be created which can include their own logic and formatting](https://github.com/TotallyInformation/web-components).

## Complete dynamic UI

An initial complete dynamic UI can be loaded using the the [`loadui` function](client-docs/functions#loaduiurl-load-a-dynamic-ui-from-a-json-web-reponse) in the front-end - `uibuilder.loadui('./something.json')`.

## Other content types including images, video, PDF's, text

These can all be dynamically inserted using custom front-end code, using [the `uibuilder.include(url, uiOptions)` function](client-docs/functions#includeurl-id-parentselector---insert-an-external-file-into-the-web-page).
