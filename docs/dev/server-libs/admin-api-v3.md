---
title: UIBUILDER's Newer Admin API Library
description: >
  Provides data to the Node-RED Editor from the uibuilder runtime.
created: 2023-09-30 15:58:31
lastUpdated: 2023-10-01 12:13:13
---

TBC

Exports a single object `adminRouterV3` which is an ExpressJS Route object with URL `/:url` containing routing actions (`all`, `get`, `post`, `put`, `delete`). This function requires 2 parameters: `uib` and `log`. `uib` is the master uibuilder node's module-level `uib` object which contains all of the core settings including a reference to RED.

The `all` action combines different passed parameter types (`req.query`, `req.body`, `req.params`) into a unified `res.allparams` object. It also checks the `url` parameter contains a valid uibuilder url (name). Requests cannot procede if a valid url is not passed.

Each of the other actions allow multiple commands to be specified. `res.allparams.cmd` contains the command parameter.

There are standard parameter validation functions for url, file name and folder parameters.

## Parameters

* `url` - The UIBUILDER instance url (name)
* `cmd` - The command to action
* `type` - The current action (get, post, put, delete)
* `fname` - File name
* `folder` - Folder name
* `template` - A built-in template name
* `extTemplate` - An external template URL
* `packageName` - Package name for check to see if it is installed into uibRoot

## API's

See the separate [API's](apis/readme.md) document for API details.
