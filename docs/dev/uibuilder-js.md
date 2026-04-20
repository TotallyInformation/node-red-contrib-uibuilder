---
title: Developer documentation for `uibuilder.js`
description: |
  `uibuilder.js` is the main file that defines the uibuilder node. It is this that is _required_ into Node-RED when it starts.
created: 2019-05-18 18:25:00
updated: 2025-12-20 16:50:25
---

## Key processing elements

### Installation

Installing the npm module will ensure that all dependent components are also installed. VueJS and bootstrap-vue (hence also bootstrap) will be installed.

### Global Initialisation

Once a uibuilder node is added to any flow, the uibuilder module will be initialised on Node-RED startup.

Everything here is "global" in the sense that it is the same for all uibuilder instances.

Prior to the actual setup functions, a number of "global" variables and functions are created including uibuilder's `log` function and the `uib` cross-module global configuration variable.

Everything in the `Uib` and `runtimeSetup` functions is run at this point. They:

1. Grab a reference to the Node-RED `RED` object for ease of access.
2. Run the `runtimeSetup` function:
   1. Checks that the `userDir` Node-RED folder is writable. The whole node setup will fail if not.
   2. Adds an event handler that outputs a summary of uibuilder's configuration on Node-RED startup.
   3. Creates all of the uibuilder "global" variables, functions and API's. These are added to the `uib` variable which is referenced to `uibGlobalConfig` which is actually a separate library `nodes/libs/uibGlobalConfig.cjs`, a singleton class library that is either referenced by or passed to other libraries and nodes as needed.
3. Register the node-type. This also links a number of variables to the Editor, they all start with `uibuilder....` and are accessible in Editor code as `RED.settings.uibuilder....`.

The runtime `RED` object is available from this point onwards.

The webserver, Socket.IO and other common variables are set up here. Admin and end-user API's are also defined at this level.

### Instance Initialisation

Every `uibuilder` node added to a flow creates a new instance. Each instance of uibuilder is initialised when flows start.

The global function `nodeInstance` is called for each instance.

1. A check is done to make sure that a valid URL setting is available. Initialisation fails if not.
2. The node instance is created using Node-RED's standard `RED.nodes.createNode(this, config)` function. At this point, the `nodeInstance` function gets its own `this` object that contains the node's definition.
   1. If the folder is being created, `fslib.replaceTemplate()` is run asynchronously in order to copy over the appropriate template folder/file structure. The instance setup does not wait for this to complete, though an error will be logged if it fails.
3. The instances server filing system folder is created if needed. If it already exists, either a notification is given to the user to accept or reject, or this is a url name change and the folder must be renamed. Various checks are done to make sure that the folder exists and is writable.
4. `web.instanceSetup(this)` is now run in order to set up all of the various ExpressJS routes for the instance.
5. `sockets.addNS(this)` is now run in order to set up the Socket.IO connections (Name Space) for his instance. *A reference to the namespace is added to the instance object to allow easy future comms*. A reference to the name-spaced `sendToFe` is also added to make it easier to send instance messages to the front-end.
6. A message input handler is defined `this.on('input', inputMsgHandler)`.
7. An "external" event handler is registered to handle cross-node events such as links from `uib-sender` nodes.
8. A close event handler is added for removal of nodes.

### Inbound message handler `inputMsgHandler`

> [!NOTE]
>
> If either the message is null or contains `msg.uibuilderCtrl`, the message will not be processed. In particular, uibuilder control messages must not be processed since this would create a message loop.
>
> If the msg has a `_ui` property that has `_ui.from` = "client", then `_ui` is removed to prevent front-end processing loops.

1. The inbound msg is forwarded to any connected clients using `sockets.sendToFe( msg, this, uib.ioChannels.server )`.
2. If the advanced option to forward in Node-RED has also been selected for this instance, the msg is output to port #1 (the top output port).

### Adding `staticServer` paths for vendor packages

> [!WARNING]
> This section needs updating, it is incomplete, especially for UIBUILDER v7.

Call `uiblib.checkInstalledPackages`. Reads the packageList and masterPackageList, updates the package list file and uib.installedPackages. 

`tilib.findPackage` is called for each package to check. New packages result in a call to `uiblib.servePackage` which serves up the package folder. REmoved packages result in a call to `uiblib.unservePackage` which removes the folder from ExpressJS.

### Client Connection

A client connection is any browser tab that loads and starts the uibuilder client library code. So a single user device can have many connections.

When a client loads, it automatically starts processing using the client `start()` function. The client socket.io library handshakes with the server.

> [!NOTE]
> This process also happens when a client _**re**connects_. Which will happen if the client browser has disconnected for any reason (e.g. the device went to sleep or there was a transient network issue). For this reason, the `_socketId` should not be considered a safe measure of a single client connection.

The server sends back a message:

```json
{
  "uibuilderCtrl":"client connect",
  "cacheControl":"REPLAY",
  "debug":false,
  "_socketId":"/nr/uib#9qYqdW79Y7t9gvVtAAAA",
  "from":"server",
  "serverTimestamp":"2019-05-25T19:42:15.979Z",
  "_msgid":"11547966.4e5bc7"
}
```

This message will appear on port 2 of the uibuilder node. The `msg.from` property indicates which direction the message is coming from/to.

The message may be fed into a caching function/node to trigger a data dump to the client.

<img src="dev/image-20251220131214160.png" alt="Example caching flow" style="zoom:80%;" />

### Client Disconnection

When a client disconnects for any reason (page reload, tab closed, browser crash, laptop closed, etc.), The _server_ issues a "client disconnect message" to port 2 of the uibuilder node:

```json
{
    "uibuilderCtrl":"client disconnect",
    "reason":"transport close",
    "_socketId":"/nr/uib#qWaT5gj1iMamw9OeAAAD",
    "from":"server", "_msgid":"783a6d61.408254"
}
```

Note that if a client disconnects then reconnects it will have a different `_socketId` property.

## Global/Module properties

> [!WARNING]
> This section needs updating, it is incomplete, especially for UIBUILDER v7.

### `uib` {Object} [Module global]

* `commonFolder` {String}: Default `./common/`. URL for uib common folder.
  The common folder contains resources made available to all instances of uibuilder.

* `commonFolderName` {String}: Default `<uibRoot>/common`. Filing system folder name of the `common` folder for shared resources.
  
* `configFolder` {String}: Default `<uibRoot>/.config`. 
  Filing system path to the folder containing any uibuilder global configuration files.
  e.g. package lists, security and middleware modules.

* `configFolderName` {String}: Default `<uibRoot>/.config`. Filing system folder name of the config folder.
  
* `deployments` {Object}: Track across redeployments.
  
* `installedPackages` {Object}: Track the vendor packages installed and their paths - updated by uiblib.checkInstalledPackages(). 
  Populated initially from packageList file once the configFolder is known & master list has been copied. 

  Schema: 
  
  ```json
  {
    "<npm package name>": {
        "url": vendorPath, 
        "path": installFolder, 
        "version": packageVersion, 
        "main": mainEntryScript
    } 
  }
  ```

* `instances` {Object}: When nodeGo is run, the node.id is added as a key with the value being the url. 
  
  Schema: 
  
  ```json
  {"<node.id>": "<url>"}
  ```

* `masterPackageListFilename` {String}: Default `masterPackageList.json`. 
  File name of the master package list used to check for commonly installed FE libraries.

* `masterStaticFeFolder` {String}: Default: `__dirname/../front-end`. 
  Location of the distribution (built) versions of the core master static files.

  Contains `uibuilderfe.js`, `uibuilderfe.min.js`, `uib-styles.css` and an `images` folder containing some standard uibuilder images and `ico` files. Also a fallback `index.html` which will be served if your custom index.html page cannot be found.

  Anything in the `masterStaticFeFolder` folder will be served on the `./` URL path.

* `masterTemplateFolder` {String}: Default: `__dirname/../templates`. 
  Location of master template folders (containing default front-end code).
  Holds a set of master templates to use. These are copied over to the instance src folder when needed.

* `me` {Object}: Contents of uibuilder's package.json file
  
* `moduleName` {String}: Default `uibuilder`. Module name must match this nodes html file.
  
* `nodeRoot` {String}: Default: `RED.settings.httpNodeRoot`. URL path prefix set in settings.js - prefixes all non-admin URL's.
  
* `nodeVersion` {String}: What version of Node.JS are we running under? Impacts some file processing.
  
* `packageListFilename` {String}: Default `packageList.json`. File name of the installed package list.
  
* `rootFolder` {String}: Root folder (on the server FS) for all uibuilder front-end data. 
  Name of the fs path used to hold custom files & folders for all uib.instances of uibuilder.
  Default: `<userDir>/<uib.moduleName>` or `<userDir>/projects/<activeProjectName>/<uib.moduleName>` if Node-RED projects are in use.

* `sioUseMwName` {String}: Default `sioUse.js`. Name of the Socket.IO Use Middleware.

* `staticOpts` {Object}: Default empty. Options to pass to static-serve. See [ExpressJS docs for details](https://expressjs.com/en/resources/middleware/serve-static.html).
  
* `version` {String}: Current uibuilder module version (taken from package.json).

* `deleteOnDelete` {Object}: Array of instances that have requested their local instance folders be deleted on deploy - see html file oneditdelete, updated by admin api

* `customServer` {Object}: Definition for the optional custom ExpressJS server. Not used if the built-in Node-RED ExpressJS server is used.

    ```js
    /** Parameters for custom webserver if required. Port is undefined if using Node-RED's webserver. */
    customServer: {
        /** Optional TCP/IP port number. If defined, uibuilder will use its own ExpressJS server/app
         * If undefined, uibuilder will use the Node-RED user-facing ExpressJS server
         * @type {undefined|number} If undefined, means that uibuilder is using Node-RED's webserver
         */
        port: undefined,
        /** @type {string} Node.js server type. ['http', 'https', 'http2']  */
        type: 'http',
        /** @type {undefined|string} uibuilder Host. sub(domain) name or IP Address */
        host: undefined,
    },
    ```

* `degitEmitter` {Function}: Event emitter for degit, populated on 1st use. See POST admin API. Only used if an external template is loaded.

### Other properties

* `userDir` {String}: The current userDir folder. `RED.settings.userDir`.
  
## uibuilder Node Instance properties

> [!WARNING]
> This document needs updating, it is incomplete, especially for UIBUILDER v7.

Each instance of the uibuilder node has the following variables.

### From the admin Editor ui

* `node.name` {String}:
* `node.topic` {String}:
* `node.url` {String}: Default `uibuilder`. Used for both the URL of this instance and for
  the filing system location of instance resources.

#### Advanced Settings

* `node.fwdInMessages` {Boolean}: Default `false`. Whether input messages will be automatically forwarded
  to the output.

* `node.allowScripts` {Boolean}: Default `false`. Whether uibuilder will allow
  input messages to send custom JavaScript code to the front-end. This could be
  a potential security hole unless well controlled.

* `node.allowStyles` {Boolean}: Default `false`. Whether uibuilder will allow
  input messages to send custom CSS style information to the front-end. This could be
  a potential security hole unless well controlled.

* `node.maxAge` {Integer}: Default 0. How long (in seconds) should resources be cached for?
  
  It is not advisable to go above 31536000 seconds (nominally a year) since browsers may not treat that consistently.

* `node.copyIndex` {Boolean}: Default `true`. Whether uibuilder will automatically
  copy the template `index.[html|js|css] files to the source folder if they don't exist.

* `node.showfolder` {Boolean}: Default `false`. Whether uibuilder will automatically create
  an index page view showing the source files available. Turning this on in production would be
  unwise as it would be a security issue. If turned on, resulting URL is `<httpNodeRoot>/<node.url>/idx`.

### Locally configured (not set in Editor)

* `node.customFolder` {String}: Default `<uib.rootFolder>/<node.url>`. 
  Name of the fs path used to hold custom files & folders for THIS INSTANCE of uibuilder.
  Files in either the `src` or `dist` sub-folders are also served to the instance's URL. 
  The `dist` folder will only be used if `index.html` exists in that folder.
  Any resource names that clash with files in the `<uib.rootFolder>/common/` or 
  `./nodes/src/` folders will take preference ensuring local control is available.

* `node.ioClientsCount` {Integer}: How many Socket clients connected to this instance?

* `node.rcvMsgCount` {Integer}: How many msg's received since last reset or redeploy?

* `node.ioChannels` {Object}: The channel names used for Socket.IO.
  Default `{control: 'uiBuilderControl', client: 'uiBuilderClient', server: 'uiBuilder'}`.

* `node.ioNamespace` {String}: Default `<httpNodeRoot>/<node.url>`.
  Make sure each node instance uses a separate Socket.IO namespace.
  WARNING: This HAS to match the one derived in uibuilderfe.js.

### Internals & Typedef

In addition, the `node` object has a number of other useful functions and properties.

Note that the file `typedefs.js` may have a more up-to-date version of this.

```javascript
/** uibNode
 * @typedef {object} uibNode Local copy of the node instance config + other info
 * @property {string} id Unique identifier for this instance
 * @property {string} type What type of node is this an instance of? (uibuilder)
 *
 * @property {string} name Descriptive name, only used by Editor
 * @property {string} topic msg.topic overrides incoming msg.topic
 * @property {string} url The url path (and folder path) to be used by this instance
 * @property {string} oldUrl The PREVIOUS url path (and folder path) after a url rename
 * @property {boolean} fwdInMessages Forward input msgs to output #1?
 * @property {boolean} allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} copyIndex DEPRECATED Copy index.(html|js|css) files from templates if they don't exist?
 * @property {string}  templateFolder Folder name for the source of the chosen template
 * @property {string}  extTemplate Degit url reference for an external template (e.g. from GitHub)
 * @property {boolean} showfolder Provide a folder index web page?
 * @property {boolean} reload If true, notify all clients to reload on a change to any source file
 * @property {string} sourceFolder (src or dist) the instance FE code folder to be served by ExpressJS
 * @property {string} deployedVersion The version of uibuilder when this node was last deployed
 * @property {boolean} showMsgUib Whether to include msg._uib (clientId/real IP/page name) in std output msgs
 *
 * @property {string} customFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {number} ioClientsCount How many Socket clients connected to this instance?
 * @property {number} rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {object} ioChannels The channel names for Socket.IO
 * @property {string} ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {string} ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {string} ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {string} ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 *
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function=} done Dummy done Function for pre-Node-RED 1.0 servers
 * @property {Function=} on Event handler
 * @property {Function=} removeListener Event handling
 * @property {Function=} context Function that accesses the nodes context vars or the flow/global vars
 * @property {Function=} emit Function that emits an event
 * @property {Function=} receive Function that ???
 * @property {object=} credentials Optional secured credentials
 * @property {object=} z Internal
 * @property {object=} wires Internal. The wires attached to this node instance (uid's)
 *
 * @property {boolean} commonStaticLoaded Whether the common static folder has been added
 * @property {boolean} initCopyDone Has the initial template copy been done?
 *
 * @property {Function} warn Output warn level info to node-red console and to editor debug
 *
 * @property {object} statusDisplay Settings for the uibuilder node status
 * @property {string} statusDisplay.text Text to display
 * @property {string} statusDisplay.fill Fill colour: black, blue, red, yellow, ...
 * @property {string} statusDisplay.shape dot or ring
 *
 * @property {string} title Short descriptive title for the instance
 * @property {string} descr Longer description for the instance
 *
 * @property {Function} sendToFe Ref to sockets.sendToFe
 */
```

## Functions/Methods

> [!WARNING]
> This document needs updating, it is incomplete, especially for UIBUILDER v7.

### Module level

* `log`: Default `RED.log`. Logging functions.
* `app`: Default `RED.httpNode`. Reference to the ExpressJS app.
* `io`: Reference to the Socket.IO server.
* `nodeInstance`: The function passed to the node `registerType` function.

### Instance level

* `ioNs`: Reference to Socket.IO namespace used for the instance.
* `nodeInputHandler`: Function that handles incoming messages for a uibuilder instance.
* `sendToFe`: A reference to sockets.sendToFe which allows a msg to be sent directly to attached clients.

### Utility Classes

* [UibWeb (`nodes/web.js`)](web-js.md) - A singleton class that manages the interactions with ExpressJS and so provides all of the web server capabilities.
* [UibSockets (`socket.js`)](socket-js.md) - A singleton class that manages the interactions with Socket.IO and so provides all of the communications between Node-RED and front-end code.

> [!NOTE]
> A singleton class is one that can only be instantiated once. Thanks to the way that Node.js's `require` function works, whenever a singleton class is required, the same instance will always be used.

### Utility Functions

* [`nodes/tilib.js`](tilib-js.md) - Contains generic utility functions that do not rely on Node-RED.
* [`nodes/uiblib.js`](uiblib-js.md) - Contains utility functions specific to uibuilder that require Node-RED and related classes, objects and data.

## Admin API's

TBC
