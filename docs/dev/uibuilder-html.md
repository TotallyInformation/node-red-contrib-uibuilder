---
title: Developer documentation for `uibuilder.html`
description: >
   Documents the processing of the html file that defines the Node-RED admin UI panel for uibuilder. Shown when double-clicking on a uibuilder node in a flow.
created: 2019-06-15 14:26:00
lastUpdated: 2023-11-03 17:55:25
---

!> This document needs updating, it is incomplete.

- [Variables](#variables)
- [Package List](#package-list)
- [Editor common global variable](#editor-common-global-variable)

## Variables

### Properties

See the `node.` variables in [uibuilder-js](uibuilder-js.md).

### Pseudo Settings

These are passed as `settings` from `uibuilder.js` when `RED.nodes.registerType` is called. Access as `RED.settings.<varName>` from within the editor.

* `RED.settings.uibuilderNodeEnv` {String} - a copy of process.env.NODE_ENV environment variable from node.js. E.g. PRODUCTION or DEVELOPMENT.
  Used to show different warnings for security processing depending on whether mode is "development" or something else.

* `RED.settings.uibuilderTemplates` {Array} - List of available templates and details.

* `RED.settings.uibuilderCustomServer` {Object} - Custom server details.

* `RED.settings.uibuilderCurrentVersion` {String} - Current version of uibuilder.

* `RED.settings.uibuilderRedeployNeeded` {Boolean} - Should the editor tell the user that a redeploy is needed (based on uib versions)?

* `RED.settings.uibuilderInstances` {Array} - List of the deployed uib instances [{node_id: url}].

* `RED.settings.uibuilderRootFolder` {String} - uibRoot, the root folder used for uibuilder data.

## Package List

The package list is shown when the "Manage Front-End Libraries" button is clicked.

_NOTE: Managing packages does **not** require a Node-RED deploy or restart._

The list is a [Node-RED editable list widget](https://nodered.org/docs/api/ui/editableList/).

Setup of the list is done in `RED.nodes.registerType('uibuilder', { ... oneditprepare() ... }`

The list of packages is provided by the `packageList()` function.

### packageList Function

Calls the `uibvendorpackages` API which is defined in `uibuilder.js`.

For each package in the resulting object, the editable list `addItem` method is called with the package name. The addItem method calls the `addPackageRow` function.

This adds the package name to the list without further processing.

### Add button

When the add button (just under the package list) is clicked, the `addPackageRow()` function is called.

This creates a new row in the list with a text input box and a button marked "Install".

If text is typed into the input box and then the Install button pressed, the `addPackageRow` function is called.

This results in the `installPackage` API being called to attempt to install the package using an exec call to npm. If that succeeds, the package name is added to the list.

### addPackageRow(element,index,data) Function

If the length of `data` is zero, we know that the `add` button was pressed. This adds a row containing an input text box and an "Install" button.

If `data` is non-zero, the assumption is that we are adding known entries (probably via the `packageList()` function). The string in `data` is simply added to the list widget as a new row.

If the "Install" button is pressed, the uibuilder `installPackage` API is called with the package name.


## Editor common global variable

All uibuilder nodes load 2 resource files:

```html
<link type="text/css" rel="stylesheet" href="./resources/node-red-contrib-uibuilder/ti-common.css" media="all">
<script src="./resources/node-red-contrib-uibuilder/ti-common.js"></script>
```

These define some common styles and a global variable `window.uibuilder`.

The global can be accessed from the developer console on the Node-RED Editor page as `uibuilder`. It contains the following:

* `debug` - set to true to see more debugging information from the uibuilder nodes Editor components. Is set to true automatically if running/accessing Node-RED on `localhost`.
* `log` - Is set to `console.log` only if `debug` is true, otherwise is a null function.
* `packages` - The list of all installed front-end libraries (visible on a uibuilder node's Libraries tab) with their details.
* `urlsByNodeId` - These are all of the URL's defined in the editor - note that these can be different than the deployed list of URL's if something has not yet been deployed.
* `doTooltips` - A utility function used by uib nodes to give better tooltips. Uses jQueryUI tooltips and display's tooltips in the following order of preference: Image alt labels > Aria Labels > title attribute. Only applies to anything inside a div with an ID of `ti-edit-panel`. All uibuilder nodes wrap the entire configuration panel in a div with this id.
