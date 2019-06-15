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

Call uiblib.updVendorPaths. This calls uiblib.addPackage for each found package. addPackage attempts to create a staticServer path.

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

### `vendorPaths` {Object}

```json
{
    "<npm package name>": {
        "url": <vendorPath>, 
        "folder": <installFolder>,
        "homepage": <packageHomePage>,
        "version": <packageVersion>, 
        "main": <mainEntryScript>
    } 
}
```

Default: `{}`

*Object who's primary keys are each installed front-end vendor package. Also contains a sub-object showing the applied root URL for accessing the package resources from front-end (browser) code and the server filing system path to the root folder.*

Created when module is activated. Updated by `uiblib.updVendorPaths`.

All URI paths start `../uibuilder/vendor/<packageName>/` - starting with `..` automatically includes the correct scheme (http[s]), (sub)domain, port and `httpNodeRoot` prefix.

NB: socket.io is not included.

### `uib_rootFolder` {string} 

*The root folder that contains all of the folders for each instance of uibuilder nodes.*

Default: `<userDir>/<moduleName>` or `<userDir>/projects/<activeProject>/<moduleName>` if Node-RED projects are in use. 

`<moduleName>` = 'uibuilder'

### `masterTemplateFolder` {string} 

Default: `__dirname/templates`

*Holds a set of master templates to use. These are copied over to the instance src folder when needed.*

### `httpNodeRoot` {string} 

Default: `RED.settings.httpNodeRoot`

*The URL path Node-RED will prefix to all user urls (e.g. non-admin urls).*

### `module` {string} 

Default: `'uibuilder'`

*Name of the uibuilder module/node. Set at global module level.*

### instances {Object}

```json
{"node.id": <url>}
```

*Map of all instantiated instances of uibuilder along with their URLs.*

instances[node.id] = node.url

### `uib_GlobalSettings` {Object}

```json
{
    "packages":string[],
    "debug":string,
    "template":string
}
```

**_DEPRECATED in v2.0_**

Default (v2.0): `{packages:[vue,bootstrap,vue-bootstrap],debug:false,template='vue'}`

Default (v1.x): `{packages:[jquery,normalize.css],debug:false}`

Originally read from the Node-RED `settings.json` file. No longer required.

### `configFolder` {string}

Filing system path to the folder containing any global configuration files. `<uibRoot>/.config`.

Currently only contains:

* `packageList.json` which contains the array of installed packages by their npm package name. These are packages that will be added as URI paths to the server to make them accessible to your front-end code.

  Additional packages installed/removed via the admin ui package management section will update this file.

  It is read on Node-RED startup and again whenever the admin ui package management section opened or the details API called.

  If this file is not valid JSON, an error will be generated.

* `masterPackageList.json` an array of recognised packages useful as front-end modules. Initialised from a master template included with the uibuilder source. May be altered at will.

  Any packages in this list will be searched for on startup, when the admin ui/package management section is shown or the details API called. 

  Any found to be actually installed in `<userDir>/node_modules` will be added to the packageList and added as URI paths to the server.

  If this file is not valid JSON, an error will be generated.

### `commonFolder` {string}

Filing system path to the folder that is served to all instances as `./common/`

## Instance Variables

Each instance of the uibuilder node has the following variables that are configured via the admin ui.

* `node.name`
* `node.topic`
* `node.url` ['uibuilder']
* `node.fwdInMessages`
* `node.allowScripts`
* `node.allowStyles`
* `node.copyIndex`

And some additional, locally configured instance variables:

* `node.customFolder ` [path.join(uib_rootFolder, node.url)]
* `fullPath` [tilib.urlJoin( httpNodeRoot, node.url )] Same as `node.ioNamespace`



## Functions/Methods



## Admin API's

