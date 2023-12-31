---
title: Check all libraries on node-red startup process
description: |
  The process to check for manually installed libraries and check for updates when node-red starts up
created: 2022-09-17 16:05:22
lastUpdated: 2022-09-17 16:05:28
updated: 2023-12-30 17:01:41
---

## Overview

1. Check for `<uibRoot>/package.json` - if not exists, create.
2. Check structure of `<uibRoot>/package.json` - apply template if needed.
3. For each dependency, 
   1. check that `uibuilder.packages.<pkg-name>` contains correct template.
   2. check that `uibuilder.packages.<pkg-name>` contains correct details.


## uibuilder

* runtimeSetup()
  * packageMgt.setup(uib)

## Package Management (`nodes/libs/package-mgt.js`)



---

readPackageJson
    getUibRootPJ
        setup
    getUibRootPackageJson
        ~~web:serveVendorPackages~~
    getPackageDetails2
