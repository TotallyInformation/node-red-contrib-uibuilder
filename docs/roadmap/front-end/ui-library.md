---
title: Front-end client library roadmap
description: >
    This page is a working document to track the development of the front-end client library for uibuilder. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

> [!NOTE]
> Functions in this library are typically reflected to the main client library for easy access.
>
> This library has a node.js library version in `/nodes/libs/ui.cjs` as well as the fron-end version.


* [ ] uib-element/client - allow loading of data to the ROOT to allow for full HTML replacement

* [ ] [**Started**] Add optional page filter to _ui - if `msg._ui.pageName` not matching current page, don't process - *needs list and wildcard capabilities*.

* Filter on `msg._ui.routeId` (If using router).

* Content editor capability - to set editable content blocks. [ref 1](https://editorjs.io/)

* Add handling for `_ui.components[n].slots` where slots is an object of named slots with the special
  name of `default` for the default slot (default must be handled first since it overwrites all existing slots)
  
* Add check to uibuilder.module.js to prevent adding of multiple entries with same ID

* Allow adding to more locations: next/previous sibling

* Add click coordinates to return msgs where appropriate. See https://discourse.nodered.org/t/contextmenu-location/22780/51

* **New functions**

  * [**STARTED**] `moveElement` function that moves an element from 1 place to another. [Ref](https://chatgpt.com/share/872cede6-2fd6-44b2-891b-a152a0798c77).

    * [ ] Finish coding in ui.js

    * [ ] Add reference to client library

    * [ ] Document

