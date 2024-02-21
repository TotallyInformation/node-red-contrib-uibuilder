---
title: uib-file-list - Output a list of files or url's based on filtering a given uibuilder instance source folder
description: ""
created: 2024-02-20 16:36:25
updated: 2024-02-20 18:27:48
---

*(This document is a work-in-progress, it is not complete)*

Available from uibuilder v6.9.0.

This node lets you reference a uibuilder node and then get a list of files that are being served by that node. Optionally applying include/exclude filters.

You can return the list of files either as a local file list for processing inside Node-RED or some other server tool. Or (default) as a list of URL's relative to the root URL to use in front-end code such as a menu of links or an index list of pages (or routes with the optional uibRouter library).

> [!NOTE]
> As at v6.9.0, the settings cannot be overridden by a input message, this will be a future enhancement.

## Default settings

* URL: No default, select a configured uibuilder instance.

  Note that the top-most folder you can search is set to either the live serve folder for the uibuilder instance (default) or the instance root folder. So if you have a uibuilder instance with the name `myweb` and are serving files from the default `src` folder with a default Node-RED and UIBUILDER install, the root folder will be `~/.node-red/uibuilder/myweb/src`.

  If the _Use live served folder?_ is NOT set, then the root folder would be `~/.node-red/uibuilder/myweb`. In this case, caution should be used since it is possible to destroy the uibuilder instance when used with file/folder output. That output might also contain sensitive information.
  
  You cannot escape that root folder (to ensure basic security).

* Filter: `**/.html`

  Filters and excludes use the [`fast-glob`](https://www.npmjs.com/package/fast-glob) library. The default will return all HTML files from the root folder and any sub-folders.

* Exclude: (empty)

* URL Output?: `TRUE`

  If set, the output will be a list of relative URL's instead of a list of files/folders. In addition, any HTML file called `index.html` will be returned as just the relative URL path since that file is the default for each path.

* Use live served folder?: `TRUE`

  If set, the live folder (e.g. `src` by default) will be set as the root folder. If not set, the instance root folder will be used.

* Use full prefix?: `TRUE`

  If set, .... (TBC)

* Topic: (None)
* Name: (None)

