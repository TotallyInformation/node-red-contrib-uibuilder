# Developer documentation for `uibuilder.js`

`uibuilder.js` is the main file that defines the uibuilder node. It is this that is _required_ into Node-RED when it starts.

Note that uibuilder [URI paths are documented in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths).

## Key processing elements

### Installation



### Global Initialisation

Once a uibuilder node is added to any flow, the uibuilder module will be initialised on Node-RED startup.

Everything in the `module.exports` function is run at this point. That creates all of the uibuilder "global" variables, functions and API's.

### Instance Initialisation

Each instance of uibuilder is initialised when flows start.

The global function `nodeGo` is called for each instance. It 

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

* `masterTemplate` {String}: 'vue'. What template to use as master? Must match a folder in the masterTemplateFolder.
  
* `masterTemplateFolder` {String}: Default: `__dirname/templates`. 
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
  
* `version` {String}: Current uibuilder module version (taken from package.json).

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
* `node.copyIndex` {Boolean}: Default `true`. Whether uibuilder will automatically
  copy the template `index.[html|js|css] files to the source folder if they don't exist.
* `node.showfolder` {Boolean}: Default `false`. Whether uibuilder will automatically create
  an index page view showing the source files available. Turning this on in production would be
  unwise as it would be a security issue. If turned on, resulting URL is `<httpNodeRoot>/<node.url>/idx`.

#### Security Related

* `node.useSecurity` {Boolean}: Default `false`. Whether to use uibuilder's security architecture.
* `node.sessionLength` {Integer}: Default `1.8e6`. (1.8e6 = 30*60000 = 30min).

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

## Functions/Methods

### Module level

* `log`: Default `RED.log`. Logging functions.
* `app`: Default `RED.httpNode`. Reference to the ExpressJS app.
* `io`: Reference to the Socket.IO server.
* `nodeGo`: The function passed to the node `registerType` function.

### Instance level

* `ioNs`: Reference to Socket.IO namespace used for the instance.
* `nodeInputHandler`: Function that handles incoming messages for a uibuilder instance.

## Admin API's

