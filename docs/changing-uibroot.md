---
title: Changing the uibuilder master root folder (uibRoot) in settings.js
description: >
   Describes how to change uibRoot and what happens when you do.
created: 2021-07-03 20:46:33
lastUpdated: 2021-07-03 20:46:38
---

Status: **Incomplete**

The `uibRoot` folder on your Node-RED server is where all of the front-end files live along with security middleware, common front-end resources, security settings and the lists of packages that are served to the front end (e.g. VueJS).

By default, uibuilder will create a folder for you under your userDir folder - typically `~/.node-red/uibuilder/`.

If you have Node-RED projects turned on, the default uibRoot folder will sit under your projects root folder instead.

?> Note that uibRoot will contain a sub-folder for every instance of uibuilder you have deployed. In addition, it will contain a `.config` and a `common` sub-folder.

Whenever Node-RED is started, the uibuilder module will check every instance (deployed node) of uibuilder and will ensure that a sub-folder named after the `url` configuration setting of the node exists within `uibRoot`.

If the uibuilder module has to create a missing sub-folder for a deployed node, it will use the configured Template to pre-populate the sub-folder.

!> If you change the uibRoot folder and restart Node-RED, **ALL** instances will get the appropriate templates copied. Any existing code **will not** be copied. However, it is not deleted either so you can manually copy the files and folders to the new location if you want to. 
!> If you have never set a Template for an instance, the "Blank" template will be used. This does not use any front-end framework. This is a change in v4+ since previously, the Vue/bootstrap-vue template was the default. If you want a Vue/Bootstrap template, simply change the selected Template to Vue or simple Vue.