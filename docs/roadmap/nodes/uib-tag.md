---
title: Road map for the uib-tag node
description: >
    This page is a working document to track the development of the uib-tag node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

* [ ] Add option for `routerId` - would ensure that the output only goes to the appropriate route.
* [ ] Add option for `clientId` - would ensure that the output only goes to the appropriate client.
* [ ] Add option for `pageName` - would ensure that the output only goes to the appropriate page.

* Add input to allow restriction by pageName/clientId/tabId. `_ui.pageName`, `_ui.clientId`, and/or `_ui.tabId`
* Add individual class handling to _ui processing. [ref](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
