---
title: Changing the uibuilder master root folder (uibRoot) in settings.js
description: >
   Describes how to change uibRoot and what happens when you do.
created: 2021-07-03 20:46:33
lastUpdated: 2021-07-03 22:21:56
---

## What is the uibRoot folder?

The `uibRoot` folder on your Node-RED server is where all of the front-end files live along with security middleware, common front-end resources, security settings and the lists of packages that are served to the front end (e.g. VueJS).

By default, uibuilder will create a folder for you under your userDir folder - typically `~/.node-red/uibuilder/`.

If you have Node-RED projects turned on, the default uibRoot folder will sit under your projects root folder instead.

?> Note that uibRoot will contain a sub-folder for every instance of uibuilder you have deployed. In addition, it will contain a `.config` and a `common` sub-folder.

Whenever Node-RED is started, the uibuilder module will check every instance (deployed node) of uibuilder and will ensure that a sub-folder named after the `url` configuration setting of the node exists within `uibRoot`.

If the uibuilder module has to create a missing sub-folder for a deployed node, it will use the configured Template to pre-populate the sub-folder.

!> If you change the uibRoot folder and restart Node-RED, **ALL** existing instances of uibuilder in your flow will get the appropriate templates copied. Any existing code **will not** be copied. However, it is not deleted either so you can manually copy the files and folders to the new location if you want to. <br><br>If you have never set a Template for an instance, the "Blank" template will be used. This does not use any front-end framework. This is a change in v4+ since previously, the Vue/bootstrap-vue template was the default. If you want a Vue/Bootstrap template, simply change the selected Template to Vue or simple Vue.

## Changing the uibRoot folder

To change the folder to a different location, edit the Node-RED `settings.js` file that is found in the userDir folder (normally `~/.node-redsettings.js`).

Add a new section to the exported object:

```js
    /** Custom settings for all uibuilder node instances */
    uibuilder: {
        /** Optional: Change location of uibRoot
         * If set, instead of something like `~/.node-red/uibuilder`, the uibRoot folder can be anywhere you like.
         */
        uibRoot: process.env.UIBROOT || path.join(os.homedir(), 'myuibroot'),
    },
```

You can, of course, set it to any folder path you like as long as Node-RED has access to it when running.

The example here shows how to be able to override it using an environment variable `UIBROOT` and to fall back to using a sub-folder in your users homedir folder (which will work for Windows, Linux, and MacOS).

Once you have changed the location, if you want to keep any existing front-end code, you should copy that to the new location _before restarting Node-RED_. That would prevent uibuilder from copying the selected template.

Similarly, if you have made any changes or additions to the `.config`  or `common` folders, you should also copy those over as well.

## Finding the uibRoot folder

There are several ways to find out which folder is the uibuilder root.

1. When Node-RED starts, uibuilder prints some information to the log including the "root folder".
2. The "uibuilder details" button available in any uibuilder node.
   
   The resulting page shows a list of all of the uibuilder instances that are deployed and includes the "Server Filing System Folder", the root of which is the uibuilder root folder.

   It also shows a "Configuration" section that contains "uib.rootFolder".

3. The "instance details" button available in any uibuilder node.

   Shows similar detail to #2 but just for the selected node.