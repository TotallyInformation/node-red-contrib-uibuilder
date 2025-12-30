---
title: uibuilder instance setup processing
description: |
  The process to create a new uibuilder instance.
created: 2025-12-30 11:36:05
updated: 2025-12-30 14:41:08
---

A new instance is created when a new `uibuilder` or `uib-markweb` node is added to a Node-RED flow and deployed.

> [!NOTE]
> UIBUILDER either uses the existing Node-RED user-facing ExpressJS web server app or creates its own custom ExpressJS app to serve uibuilder content.
> This is determined by settings in Node-RED's `settings.js` file.
> 

> [!NOTE]
> All UIBUILDER nodes have a `nodeInstance(config)` method that is called when a new node instance is created.

## 00) Folder creation

Instance folder creation is only done for `uibuilder` nodes. `uib-markweb` nodes do not create instance folders.

When a new `uibuilder` node is created, the `nodeInstance(config)` method checks that the `<uibRoot>` folder exists and is writable, checks if the instance folder exists, and creates it if necessary, otherwise offers to adopt it. If a URL rename is detected, it offers to rename the folder.

## 01) web::instanceSetup()

`instanceSetup(node)` from the `libs/web.cjs` module is called to add the appropriate routes and processing to Node-RED's user-facing or UIBUILDER's custom ExpressJS web server.

See below for more details on what happens inside this method.

## 02) sockets::addNS()

`addNS(node)` from the `libs/sockets.cjs` module is called to create a new Socket.IO namespace for the instance. This ensures that messages sent to/from this instance are isolated from other instances.

## 03) Message handler

The message handler for the instance is created by calling `this.on('input', inputMsgHandler)`

## 04) External events

An "external" event handler is registered to handle cross-node events such as links from uib-sender nodes.

## 05) Close event handler

A close event handler is added for removal of nodes.

## Inside web::instanceSetup()

> [!NOTE]
> Because ExpressJS is very poor at tracking what routes have been added, uibuilder has to do this manually.
> This is done by keeping a record of what routes have been added for each instance.
> When an instance is removed, the routes are removed from the record.
>
> `this.routers.instances` is the object that holds the route records for each instance keyed by `node.url`.

Node properties referenced:
* _`node.id` - The unique Node-RED node ID for this instance. Added automatically by Node-RED._
* _`node.commonStaticLoaded` - Added in instanceSetup to track if common static route has already been added. Prevents multiple additions._
* _`node.send()` - The node's send method for sending messages. Automatically provided by Node-RED._
* _`node.type` - The node type, e.g. `uibuilder` or `uib-markweb`. Added automatically by Node-RED._
* `node.url` - The URL path for this instance.
* `node.instanceFolder` - The full path to the instance folder.
* `node.sourceFolder` - Usually `src` or `dist` within the instance folder.

> [!WARNING]
> Any changes to files that define middleware or routes (e.g. `uibMiddleware.js`, `api/*.js`, `routes/*.js`) will require a full Node-RED restart to take effect.

### 01) Startup

Clears any existing route records for this instance. `this.routers.instances[node.url]` and `this.instanceRouters[node.url]`.

Makes sure that setup hasn't already been done for this instance.

### 02) Create a new ExpressJS Router for this instance

Each instance gets its own ExpressJS Router. This is stored in `this.instanceRouters[node.url]`. Specific routes are then added to this router as needed.

This makes it much easier to manage the routes for each instance, especially when removing an instance.

### 03) Common middleware routes

Marked as `1)`, `1a)`, and `1b)` in the code. These middleware routes allow common functionality to be shared across all uibuilder instances.

1. Is a custom logging route for logging front-end HTTP "beacons" (sent via `navigator.sendBeacon('./_clientLog', '..some text..')` from the client browser). Beacon logs are output from the uibuilder node's control port (lower port) with `msg.uibuilderCtrl` set to 'client beacon log'.
2. If `<uibRoot>/.config/uibMiddleware.js` exists and exports a single default function, it is added here as Express middleware. This allows users to add custom middleware to all uibuilder instances. Make sure that any middleware added here calls `next()` to avoid blocking requests. If the middleware fails to load, no errors are output except to Node-RED's `trace` log level.
3. UIBUILDER's common "master" middleware route is added here. This currently adds some security headers and cookies to all responses.

### 04) Instance-specific middleware routes

Marked as `1c)`, and `1d)` in the code. These middleware routes are specific to this instance only.

1. If the instance root folder contains any `<instanceRoot>/api/*.js` files with valid ExpressJS middleware exports, they are added here. This allows an instance to add **custom API** middleware. Note that the `uibuilder.instanceApiAllowed` setting in `settings.js` must be set to `true` to allow this. If any middleware fails to load, an error is output to Node-RED's `error` or `warn` log levels.
2. If the instance root folder contains any `<instanceRoot>/routes/*.js` files with valid ExpressJS middleware exports, they are added here. This allows an instance to add custom route middleware. If any middleware fails to load, an error is output to Node-RED's `error` or `warn` log levels.

> [!TIP]
> Custom routes differ from API's in that they are used to serve web pages or content, whereas API's are used to provide data or services.
> 
> Custom routes allow full control over the response, including rendering HTML pages, serving files, etc. Useful if you want to do server-side rendering (SSR) or serve custom content only for this instance.

### 05) Instance server-side views rendering (DOES NOT ACCOUNT FOR markweb YET)

Marked as `2a)` in the code.

This allows for instance-specific server-side rendering of HTML pages using the optional `ejs` ExpressJS view engine. EJS must be installed as a peer dependency in Node-RED's main folder for this to work. Any `<instanceRoot>/views/*.ejs` files are rendered by this middleware on the Node-RED server.

### 06) Instance static content route (DOES NOT ACCOUNT FOR markweb YET)

Marked as `2b)` in the code.

Adds `<instanceRoot>/<node.sourceFolder>` as the static content folder for this instance url. This is where the static front-end files (HTML, JS, CSS, images, etc.) are served from.

### 07) Master static and common content routes

Marked as `3a)`, and `3b)` in the code.

1. Uses `uib.masterStaticFeFolder` (defined as the `front-end/` folder) as the common static content folder that is added to all instances. This folder contains common front-end files that are shared across all instances, such as the uibuilder client libraries, icons, etc. Adds these files under the instance URL path. As routes are *used in order of adding*, any instance file names that overlap with files in this folder will take preference.

  > [!TIP]
  > This content is also available under the URL path `../uibuilder/` which is the preferred way to access it.
  > This allows front-end code to access the common uibuilder client libraries without needing to know the instance URL.

2. Uses `uib.commonFolder` (defined as the `<uibRoot>/common/` folder) as the common static content folder that is added to all instances. This folder is intended for user-provided shared front-end files that are common to all instances, such as shared JS libraries, CSS files, images, etc. Adds these files under the instance URL path.

  > [!TIP]
  > This content is also available under the URL path `../uibuilder/common` which is the preferred way to access it.
  > This allows front-end code to access the common resources without needing to know the instance URL.

### 08) Add the instance router to the main uibuilder router

Finally, the instance router is added to the ExpressJS app under the instance URL path. It can then be used by clients as `<httpNodeRoot>/<url>/`.

> [!TIP]
> If using the default static content serving, any additional URL path segments after the instance URL will be treated as file paths within the instance folder.
