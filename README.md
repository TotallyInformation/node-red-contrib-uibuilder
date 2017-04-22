# node-red-contrib-uibuilder

An EXPERIMENTAL Node-RED web user interface builder.

Designed as an *experimental* alternative to the Node-RED Dashboard. Be warned that this project is
currently very much **alpha** quality. It should pretty much work but only in a limited way.

## Design

- A single node is used to define an end-point (by its URL path)
- The node can be included as many times as you like - but each **must** have a unique URL path name
- Each node instance will have its own, dedicated Socket.IO connection (using Socket.IO namespacing)
- The node's module contains default html, JavaScript and CSS files that are used as master templates
- On deployment of the first instance, a new folder is created within your Node-RED user directory 
  (typically `~/.node-red`) with a fixed name of `uibuilder`
- On deployment of any new instance, a new sub-folder within `uibuilder` is created. The name is the same as the
  URL path specified in the node instance's settings. (defaults to `uibuilder`)
- Any resource (html, css, js, image, etc) placed within this sub-folder is available to the browser
  client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above)
- Any resource in this sub-folder that has the same name as resources in other resource paths will be
  given preference - see *Preference Tree* below.
- Each node instance gets its own Socket.IO namespace matching the URL path setting. Note that Socket.IO
  will efficiently share sockets while keeping traffic separated by namespace
- Any msg sent to a node instance is sent through unchanged to the UI via Socket.IO. NOTE that this may present
  security and/or performance issues. In particular, you should remove msg.res and msg.req objects as they
  are both very large and often contain circular references
- Users can install front-end libraries using npm, these can be access in front-end code
  via the "vendor" path, see below. The list of libraries made available is set via
  Node-RED's settings.js file in `uibuilder.userVendorPackages`

## Preference Tree

This node adds a number of resource locations (physical file-system locations) to the URL path (default `/uibuilder`) defined. It is up to the user to ensure that file/folder names do not clash. 

The order of preference is as follows:

1. The `dist` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red\uibuilder\uibuilder\dist`)

   *only added if index.html exists in this folder*
2. The `src` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red\uibuilder\uibuilder\src`)

   *only added if index.html DOES NOT exist in the dist folder*

   In this case, an optional node configuration variable is used to provide a list of package names
   that will be added to the `vendor` sub-path of the URL so that users can install their own
   front-end libraries. This is only added when not using the dist folder as that is expected to have
   all of the vendor code compiled together using webpack. 
3. The node installations `dist` folder (default physical location: `~/.node-red\node_modules\node-red-contrib-uibuilder\nodes\dist`)

   *only added if index.html exists in this folder*
4. The node installations `src` folder (default physical location: `~/.node-red\node_modules\node-red-contrib-uibuilder\nodes\src`)

   *only added if index.html DOES NOT exist in the dist folder*

   In this case, the `vendor` subpath will be available with some pre-installed vendor packages.
   Currently `normalize.css`.
In addition, this node uses the httpNodeMiddleware Node-RED setting allowing for ExpressJS middleware to be used.
For example, for implementing user security.

### Front-end path summary

Front-end files in `~/.node-red\node_modules\node-red-contrib-uibuilder\nodes\src` may use the
url paths:

- `[/<httpNodeRoot>]/<url>/` - for most things (e.g. `<script src="index.js"></script>`)
- `vendor` - for things like normalize.css (e.g. `<link rel="stylesheet" href="vendor/normalize.css/normalize.css">`)
- `<script src="/socket.io/socket.io.js"></script>` for socket.io

### Physical file/folder location summary

Folders and files for resources on the device running Node-RED are:

- `<userDir>\uibuilder\<url>\src\` - local source files for front-end use (e.g. html, js, css)
- `<userDir>\uibuilder\<url>\dist\` - local compiled files for front-end use
- `<userDir>\node_modules\node-red-contrib-uibuilder\nodes\src\` - this modules source files for front-end use (e.g. html, js, css)
- `<userDir>\node_modules\node-red-contrib-uibuilder\nodes\dist\` - this modules compiled files for front-end use

## Known Issues

- ws: protocol failing on Windows 10 dev - Socket.IO issue?
- On redeploy or NR restart, existing clients do not reconnect, page as to be reloaded.

## To Do

- Add topic to node config
- Copy template files to local override folder if not already existing
- Add edit options: 
- Use webpack to "compile" resources into distribution folders upon (re)deployment - allowing for the use
  of more resource types such as: less/scss; UI frameworks such as Bootstrap, Foundation, Material UI; jsx or other dynamic templating; front-end frameworks such as VueJS, Angular or REACT.
- Add ability to create resources from the Node-RED admin UI - currently all resources have to be created in
  the file system
- Add integrated ExpressJS security to Socket.IO
- Check code for [Dashboard node](https://github.com/node-red/node-red-dashboard/blob/master/ui.js) to see if 
  there is anything useful we can include here
- Check code for [http in node](https://github.com/node-red/node-red/blob/master/nodes/core/io/21-httpin.js) to see if 
  there is anything useful we can include here
- Process `httpNodeAuth`
- *(Maybe compile template resources to dist folder?)*
- Add a check for new file changes in local `src` folder.

  For now, will rely on users creating `.recompile` flag file in
  local `src` folder. 

## Changes

v0.0.1 

- 

## Pre-requisites

See the package.json file. Currently Socket.IO, normalize.css, serve.static and webpack are installed along
with the node.

## Install

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```
npm install node-red-contrib-uibuilder
```

Run Node-RED and add an instance of the UI Builder node. Set the required URL path and deploy.

The UI should then be available at the chosen path. The default would normally be <http://localhost:1880/uibuilder> 
(if default Node-RED and node settings are used).

## Node Instance Settings

Each instance of the uibuilder node has the following settings available.

### `name` (optional)

Only used in the Node-RED admin UI.

### `topic` (optional)

Only used if an inbound msg does not contain a topic attribute. Passed on to client UI upon receipt of a msg.

### `url` (required)

The path used to access the user interface that this node builds. Defaults to `uibuilder`.
So on `localhost`, if none of the port nor `https` nor `httpRoot` settings are defined (in Node-RED's `settings.js` file), the URL of the default interface would be `http://localhost:1880/uibuilder`

**It is up to the flow author to ensure that no duplicate names are used, the node
does not check or enforce uniqueness.**

### `userVendorPackages` (optional)

A list of npm package names (as they appear in `node_modules`) that the node will make
available to front-end code under the `uibuilder/vendor` path.

All instances of this node will also use the `uibuilder.userVendorPackages` attribute of
`settings.js` unless defined in the node's settings.

### `debug` (optional, defalt=false)

Only available using the `uibuilder.debug` attribute of
`settings.js`. Set to `true` to output additional debugging information.

## Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

## Contributing

If you would like to contribute to this node, you can contact Totally Information via GitHub or raise a request in the GitHub issues log.

## Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)