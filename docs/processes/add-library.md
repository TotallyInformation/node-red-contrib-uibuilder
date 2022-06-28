---
title: Add new library process
description: >
  The process to add a new library package.
created: 2022-06-26
lastUpdated: 2022-06-27 10:28:19
---

## Editor (`nodes/uibuilder.html`, `src/editor/uibuilder/editor.js`)

* Select Library tab
  * `tabLibraries()`
* Click add button
  * `addPackageRow(node, element, index, data)`
  * GET `uibuilder/uibnpmmanage?cmd=install&package=${packageName}&url=${node.url}&tag=${packageTag}`

## API's v2 (`nodes/libs/admin-api-v2.js`)

* `uibnpmmanage`:install
  * `packageMgt.npmInstallPackage(params.url, params.package, params.tag)`

## Package Management (`nodes/libs/packageMgt.js`)

* `npmInstallPackage` => npm install (returns install log text)

## API's v2 (`nodes/libs/admin-api-v2.js`)

* `uibnpmmanage`:install (cont)
  * `web.serveVendorPackages()`

## Web (`nodes/libs/web.js`)

* `serveVendorPackages`
  * `packageMgt.getUibRootPackageJson(pj)`

## Package Management (`nodes/libs/packageMgt.js`)

* `getUibRootPackageJson`
  * If uibRoot package.json doesn't exist, create a clean one
  * If one exists, make sure it contains `dependencies`, `uibuilder` properties
  * Empty and rebuild `uibuilder.packages` object in case a manual npm install was done

## Web (`nodes/libs/web.js`)

* `serveVendorPackages` (cont)
  * Removes `this.vendorRouter` entries
  * Updates `packageMgt.uibPackageJson.uibuilder.packages` object
  * Adds package folders to `../uibuilder/vendor/` paths & adds to router
