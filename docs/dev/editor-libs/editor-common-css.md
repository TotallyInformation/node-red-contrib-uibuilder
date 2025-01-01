---
title: UIBUILDER's Common Node-RED Editor style library
description: |
  Provides common, standard, styling to all UIBUILDER nodes in the Node-RED Editor.
created: 2023-12-19 16:22:27
lastUpdated: 2023-12-19 16:22:32
updated: 2025-01-01 21:51:39
---

Location: `/resources/editor-common.css`
URL: `<link type="text/css" rel="stylesheet" href="./resources/node-red-contrib-uibuilder/editor-common.css" media="all">
`

## Useage

Wrap the whole node config panel in `<div id="ti-edit-panel"></div>`.

## Variables

```css
--uib-node-colour: hsl(248 100% 91%);
--uib-blue: hsl(204 89% 55% / 70%); 
--uib-red: hsl(0 100% 45% / 70%); /* #8f0000; */
```

## Classes

* `.uib-name`
* `.uib-red`
* `.emoji`

### Amended Node-RED Classes

* `.ui-tooltip`

## ID's

* `#uib-el .red-ui-typedInput-container`
* `#ti-edit-panel fieldset`
* `#ti-edit-panel legend`
