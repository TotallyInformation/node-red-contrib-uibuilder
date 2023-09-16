---
title: uibuilder REST API's
description: >
  uibuilder exposes a number of REST API's. This is an index of them.
created: 2023-09-14 19:39:52
lastUpdated: 2023-09-16 12:36:36
---

Most of uibuilder's standard REST API's are common across all instances of uibuilder nodes added to your Node-RED flows. However, see below for the instance API's features.

In this section, "Admin API" refers to a web endpoint that is only accessible from Node-RED's admin web server, this is generally restricted therefore to the Node-RED Editor. "User API" refers to a web endppoint accessible to users of your uibuilder web app and therefore can be called from your front-end code as needed.

In all examples below, `<url>` refers to a uibuilder instance URL setting.

## v2 Admin API's

> [!NOTE]
> At some point, it is expected that these v2 API's will be folded into the v3 API's.

These are the oldest API's built into uibuilder. They are provided by `nodes/libs/admin-api-v3.js` which returns an ExpressJS router function. The router is added to Node-RED's admin ExpressJS server in `libs/web.js` in the function `_adminApiSetup` which is called from `setup` which, in turn is called as `web.setup(uib)` from the main uibuilder runtime setup function.

All of the endpoints are only accessible from the Node-RED Editor. Note that each API has a specified endpoint URL that is relative to the Editor's URL.

* GET `uibuilder/uibgetfile` - Returns the content of a file (`fname`) in the `<uibRoot>/<url>/<folder>` folder. Parameters: `url`, `fname`, `folder`

* GET `uibuilder/uibindex` - return web page with full details of the uibuilder configuration (for all instances) or JSON that lists all uibuilder endpoints

* GET `uibuilder/uibvendorpackages` - Check & update installed uibuilder front-end library packages, return list as JSON - this runs when NR Editor is loaded if a uib instance deployed

* GET `uibuilder/uibnpmmanage` - Run `npm` commands (install, remove, update). Parameters: `url`, `cmd`. If `url` not provided, uibPath = <userDir>, else uibPath = <uib.rootFolder>/<url>

* POST `uibuilder/uibputfile` - Create or update the a file (`fname`) in the `<uibRoot>/<url>/<folder>` folder. Parameters: `url`, `fname`, `folder`, `data`.

## v3 Admin API's

The newer v3 API's are provided by `nodes/libs/admin-api-v3.js` which returns an ExpressJS router function. The router is added to Node-RED's admin ExpressJS server in `libs/web.js` in the function `_adminApiSetup` which is called from `setup` which, in turn is called as `web.setup(uib)` from the main uibuilder runtime setup function.

Unlike the the v2 API's, the v3 are provided by a master set of `all`, `get`, `put`, `post`, and `delete` handlers.

All of these API endpoints are only accessible from the Node-RED Editor. The endpoint is simply defined as `/:url` which translates in Editor code to `./uibuilder/admin/<url>` which is relative to the Editor's URL.

Each of the v3 API's accepts a `cmd` parameter (either via URL query parameters or via JSON in the BODY for POST/PUT/etc). Alloed `cmd`s are shown below.

* ALL - this handles gathering of the GET/POST parameters into a common object. It is triggered first for all of the API endpoints. It passes control onto the specific handlers once finished.

* GET 
  * `listall` - List all folders and files for this uibuilder instance
  * `listfolders` - List all folders for this uibuilder instance
  * `checkurls` - Check if URL is already in use
  * `listinstances` - List all of the deployed instance urls
  * `listurls` - Return a list of all user urls in use by ExpressJS
  * `checkfolder` - See if a node's custom folder exists. Return true if it does, else false
* PUT
  * `deleteondelete` - tells uibuilder to delete the instance folder
  * `updatepackage` - *(Not currently in use)*
* POST
  * `replaceTemplate` - Replace instance files from a requested template
  * `newfolder` - create a new folder for the given instance
  * `newfile` - create a new file for the given instance
* DELETE
  * `deletefolder` - delete a folder for the given instance
  * `deletefile` = delete a file for the given instance

## Middleware User API's

uibuilder allows additional custom API's to be defined through the use of the `<uibRoot>/.config/uibMiddleware.js` file. This file allows any custom ExpressJS middleware to be added and can therefore be used to define additional common user API's or any other user-facing web endpoint.

An example template file is provided but authors should expect to need to understand ExpressJS middleware concepts and programming.

## Instance Admin API's

These are specific to each instance of a uibuilder node that you add to your flows.

uibuilder has one other admin API (accessible only from the Node-RED Editor). This should be moved into the admin v3 API's in some future release but currently exists in the uibuilder runtime at the end of the `nodeInstance` function.

* GET `/uibuilder/instance/<url>` - shows the instance details web page.

## Instance User API's

uibuilder also allows admins to create *custom* instance API's. This provides a powerful capability to define API's needed for a specific web app. See [How to use Instance API's](how-to/instance-apis?id=how-to-use-instance-api39s) for details.

Unlike the Admin API's, these API's are accessible to any client that can reach the `http(s)://<host>/<url>/api` URL path.
