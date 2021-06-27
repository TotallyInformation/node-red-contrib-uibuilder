---
title: Developer documentation for `uibuilder.js`
description: >
   `uibuilder.js` is the main file that defines the uibuilder node. It is this that is _required_ into Node-RED when it starts.
created: 2019-05-18 18:25:00
lastUpdated: 2021-06-27 21:18:53
---

Note that uibuilder [URI paths are documented in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths).

* [Key processing elements](#key-processing-elements)
  * [Installation](#installation)
  * [Global Initialisation](#global-initialisation)
  * [Instance Initialisation](#instance-initialisation)
  * [Adding staticServer paths for vendor packages](#adding-staticserver-paths-for-vendor-packages)
  * [Client Connection](#client-connection)
  * [Client Disconnection](#client-disconnection)
* [Global/Module Variables](#globalmodule-variables)
  * [`uib` {Object} [Module global]](#uib-object-module-global)
  * [Other variables](#other-variables)
* [uibuilder Node Instance Variables](#uibuilder-node-instance-variables)
  * [From the admin Editor ui](#from-the-admin-editor-ui)
  * [Locally configured (not set in Editor)](#locally-configured-not-set-in-editor)
  * [Internals & Typedef](#internals--typedef)
* [Functions/Methods](#functionsmethods)
  * [Module level](#module-level)
  * [Instance level](#instance-level)
  * [Utility Classes](#utility-classes)
  * [Utility Functions](#utility-functions)
* [Admin API's](#admin-apis)

## Key processing elements

### Installation

Installing the npm module will ensure that all dependent components are also installed. VueJS and bootstrap-vue (hence also bootstrap) will be installed.

### Global Initialisation

Once a uibuilder node is added to any flow, the uibuilder module will be initialised on Node-RED startup.

Everything in the `module.exports` function is run at this point. That creates all of the uibuilder "global" variables, functions and API's.

The runtime `RED` object is available from this point onwards.

The webserver, Socket.IO and other common variables are set up here. Admin and end-user API's are also defined at this level.

### Instance Initialisation

Each instance of uibuilder is initialised when flows start.

The global function `nodeInstance` is called for each instance.

### Adding staticServer paths for vendor packages

Call `uiblib.checkInstalledPackages`. Reads the packageList and masterPackageList, updates the package list file and uib.installedPackages. 

`tilib.findPackage` is called for each package to check. New packages result in a call to `uiblib.servePackage` which serves up the package folder. REmoved packages result in a call to `uiblib.unservePackage` which removes the folder from ExpressJS.

### Client Connection

A client connection is any browser tab that loads and starts the uibuilderfe.js code. So a single device/user can have many connections.

When a client loads and starts processing using `uibuilder.start()`, The client socket.io library handshakes with the server.

**Note**: that this process also happens when a client _**re**connects_.

The server sends back a message:

```json
{"uibuilderCtrl":"client connect","cacheControl":"REPLAY","debug":false,"_socketId":"/nr/uib#9qYqdW79Y7t9gvVtAAAA","from":"server","serverTimestamp":"2019-05-25T19:42:15.979Z","_msgid":"11547966.4e5bc7"}
```

The client then responds with a message:

```json
{"uibuilderCtrl":"ready for content","cacheControl":"REPLAY","from":"client","_socketId":"/nr/uib#9qYqdW79Y7t9gvVtAAAA","_msgid":"779d7aca.e2e904"}
```

Both of these messages will appear on port 2 of the uibuilder node. The `msg.from` property indicates which direction the message is coming from/to.

The second message may be fed into a caching function/node to trigger a data dump to the client.

### Client Disconnection

When a client disconnects for any reason (page reload, tab closed, browser crash, laptop closed, etc.), The _server_ issues a "client disconnect message" to port 2 of the uibuilder node:

```json
{"uibuilderCtrl":"client disconnect","reason":"transport close","_socketId":"/nr/uib#qWaT5gj1iMamw9OeAAAD","from":"server","_msgid":"783a6d61.408254"}
```

Note that if a client disconnects then reconnects it will have a different `_socketId` property.

## Global/Module Variables

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

* `masterStaticDistFolder` {String}: Default: `__dirname/../front-end/dist`. 
  Location of the distribution (built) versions of the core master static files.
  This folder is only used if it contains an `index.html` file otherwise, the `src` folder is used.

  Currently unused.

* `masterStaticSrcFolder` {String}: Default: `__dirname/../front-end/src`. 
  Location of the source version of the core master static files
  (e.g. the master library `uibuilderfe.js`).
  Only used if the `dist` folder is not used.

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

### Other variables

* `userDir` {String}: The current userDir folder. `RED.settings.userDir`.
  
## uibuilder Node Instance Variables

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

#### Security Related

* `node.useSecurity` {Boolean}: Default `false`. Whether to use uibuilder's security architecture.
* `node.tokenAutoExtend`: Whether to use client `ping` messages (every 25-30 sec) to automatically extend the token lifespan.
* `node.sessionLength` {Integer}: Default `1.8e6`. (1.8e6 milliseconds = 30*60000 = 30min). How long without the client sending a msg will it be until a login is automatically logged out.

#### Credentials

Credentials in Node-RED are node configuration settings that are stored encrypted in a separate json file from your flows. They are _not_ exported when you export a flow.

* `node.jwtSecret` {String}: The secret used to sign/verify the JWT token.

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
 * @property {String} uibNode.id Unique identifier for this instance
 * @property {String} uibNode.type What type of node is this an instance of? (uibuilder)
 * @property {String} uibNode.name Descriptive name, only used by Editor
 * @property {String} uibNode.topic msg.topic overrides incoming msg.topic
 * @property {String} uibNode.url The url path (and folder path) to be used by this instance
 * @property {String} uibNode.oldUrl The PREVIOUS url path (and folder path) after a url rename
 * @property {boolean} uibNode.fwdInMessages Forward input msgs to output #1?
 * @property {boolean} uibNode.allowScripts Allow scripts to be sent to front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.allowStyles Allow CSS to be sent to the front-end via msg? WARNING: can be a security issue.
 * @property {boolean} uibNode.copyIndex DEPRECATED Copy index.(html|js|css) files from templates if they don't exist? 
 * @property {String}  uibNode.templateFolder Folder name for the source of the chosen template
 * @property {String}  uibNode.extTemplate Degit url reference for an external template (e.g. from GitHub)
 * @property {boolean} uibNode.showfolder Provide a folder index web page?
 * @property {boolean} uibNode.useSecurity Use uibuilder's built-in security features?
 * @property {boolean} uibNode.tokenAutoExtend Extend token life when msg's received from client?
 * @property {Number} uibNode.sessionLength Lifespan of token (in seconds)
 * @property {boolean} uibNode.reload If true, notify all clients to reload on a change to any source file
 * @property {String} uibNode.jwtSecret Seed string for encryption of JWT
 * @property {String} uibNode.customFolder Name of the fs path used to hold custom files & folders for THIS INSTANCE
 * @property {Number} uibNode.ioClientsCount How many Socket clients connected to this instance?
 * @property {Number} uibNode.rcvMsgCount How many msg's received since last reset or redeploy?
 * @property {Object} uibNode.ioChannels The channel names for Socket.IO
 * @property {String} uibNode.ioChannels.control SIO Control channel name 'uiBuilderControl'
 * @property {String} uibNode.ioChannels.client SIO Client channel name 'uiBuilderClient'
 * @property {String} uibNode.ioChannels.server SIO Server channel name 'uiBuilder'
 * @property {String} uibNode.ioNamespace Make sure each node instance uses a separate Socket.IO namespace
 * @property {Function} uibNode.send Send a Node-RED msg to an output port
 * @property {Function=} uibNode.done Dummy done function for pre-Node-RED 1.0 servers
 * @property {Function=} uibNode.on Event handler
 * @property {Function=} uibNode.removeListener Event handling
 * @property {Object=} uibNode.credentials Optional secured credentials
 * @property {Object=} uibNode.z Internal
 * @property {Object=} uibNode.wires Internal. The wires attached to this node instance (uid's)
 * 
 * @property {boolean} uibNode.commonStaticLoaded Whether the common static folder has been added
 * @property {boolean} uibNode.initCopyDone Has the initial template copy been done?
 */
```

## Functions/Methods

### Module level

* `log`: Default `RED.log`. Logging functions.
* `app`: Default `RED.httpNode`. Reference to the ExpressJS app.
* `io`: Reference to the Socket.IO server.
* `nodeInstance`: The function passed to the node `registerType` function.

### Instance level

* `ioNs`: Reference to Socket.IO namespace used for the instance.
* `nodeInputHandler`: Function that handles incoming messages for a uibuilder instance.

### Utility Classes

* [UibWeb (`nodes/web.js`)](web-js.md) - A singleton class that manages the interactions with ExpressJS and so provides all of the web server capabilities.
* [UibSockets (`socket.js`)](sockets-js.md) - A singleton class that manages the interactions with Socket.IO and so provides all of the communications between Node-RED and front-end code.

?> Note that a singleton class is one that can only be instantiated once. Thanks to the way that Node.js's `require` function works, whenever a singleton class is required, the same instance will always be used.

### Utility Functions

* [`nodes/tilib.js`](tilib-js.md) - Contains generic utility functions that do not rely on Node-RED.
* [`nodes/uiblib.js`](uiblib-js.md) - Contains utility functions specific to uibuilder that require Node-RED and related classes, objects and data.

## Admin API's

TBC