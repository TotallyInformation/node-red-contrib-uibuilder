# Developer documentation for `uibuilder.js`

`uibuilder.js` is the main file that defines the uibuilder node. It is this that is _required_ into Node-RED when it starts.

Note that uibuilder [URI paths are documented in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths).

## Global/Module Variables

### `vendorPaths` {'<npm package name>': {'url': <vendorPath>, 'path': <installFolder>, userDirRequired: bool} }

Default: `{}`

Object who's primary keys are each installed front-end vendor package. Also contains a sub-object showing the applied root URL for accessing the package resources from front-end (browser) code and the server filing system path to the root folder.

Created when module is activated. Updated by `uiblib.updVendorPaths`.

All URI paths start `../uibuilder/vendor/<packageName>/` - starting with `..` automatically includes the correct scheme (http[s]), (sub)domain, port and `httpNodeRoot` prefix.

### `uib_rootFolder` {string} 

Default: `<userDir>/<moduleName>` or `<userDir>/projects/<activeProject>/<moduleName>` if Node-RED projects are in use. `<moduleName>` = 'uibuilder'

The root folder that contains all of the folders for each instance of uibuilder nodes.

### `masterTemplateFolder` {string} 

Default: `__dirname/templates`

Holds a set of master templates to use. These are copied over to the instance src folder when needed.

### `httpNodeRoot` {string} 

Default: `RED.settings.httpNodeRoot`

The URL path Node-RED will prefix to all user urls (e.g. non-admin urls).

### `module` {string} 

Default: `'uibuilder'`

Name of the uibuilder module/node. Set at global module level.

### instances[node.id] = node.url


### `uib_GlobalSettings` {packages:string[],debug:string,template:string} _DEPRECATED in v2.0_

Default (v2.0): `{packages:[vue,bootstrap,vue-bootstrap],debug:false,template='vue'}`

Default (v1.x): `{packages:[jquery,normalize.css],debug:false}`

Originally read from the Node-RED `settings.json` file. No longer required.


## Instance Variables

* node.name          = config.name  || ''
* node.topic         = config.topic || ''
* node.url           = config.url   || 'uibuilder'
* node.fwdInMessages = config.fwdInMessages        // @since 2017-09-20 changed to remove default, || with boolean doesn't work properly
* node.allowScripts  = config.allowScripts
* node.allowStyles   = config.allowStyles
* node.debugFE       = config.debugFE
* node.debugBE       = config.debugBE
* node.copyIndex     = config.copyIndex
* node.customFolder  = path.join(uib_rootFolder, node.url)
  
* const fullPath = tilib.urlJoin( httpNodeRoot, node.url ) // same as node.ioNamespace
* const ioNs = io.of(node.ioNamespace)
 


## Functions/Methods
