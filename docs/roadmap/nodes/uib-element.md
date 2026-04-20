---
title: Road map for the uib-element node
description: >
    This page is a working document to track the development of the uib-element node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---


* Make the outer div optional (at least for html/markdown) - needed for the `<collapsible-headings>` component.

* Use the new tbl* functions

* Allow option to add `tblAddClickListener` to tables

* ~~For tables, add `data-row-index` to each tbody row.~~ NO! Because adding/removing rows throws out the numbering. Use the `rowIndex` property of the DOM element instead.

* [ ] Allow the outer tag to be anything, not just `div` (or maybe just have a simpler list: `div`, `article`, `section`), also allow attributes to be set. [ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions/210)
* [ ] Consider making the editor icon responsive to the selected element type by using a function and include svg files in resources.
* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.
* [ ] uib-element forms need some serious TLC! checkbox, radio

* Add width setting
* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
* New Types for CSS and JS files?
* New type "Clone" - use a template or other element already in the HTML and copy it to a new position in the DOM. Applies attribs/slot changes if specified. Templates themselves are invisible.
* Disable or hide inputs when unused for a specific type.
* As more element types are added, group into types: main, add, form, etc
* ? Have JSON input msg templates for each type with links to copy to clipboard ?
* Check out: https://www.w3.org/WAI/ARIA/apg/patterns/
* Think about having a `linkInputs([idList])` fn that allows easy linking of different inputs?
* ??? How to allow EXTERNAL element definitions ??? e.g. Someone else's contributed package.
