# node-red-contrib-uibuilder

A Node-RED UI web user interface builder.

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

## Preference Tree

This node adds a number of resource locations (physical file-system locations) to the URL path defined.
The order of preference is as follows:

1. The node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red\uibuilder\uibuilder`)
2. The node installations `dist` folder (default physical location: `~/.node-red\node_modules\node-red-contrib-uibuilder\nodes\dist`)
   *only added if index.html exists in this folder*
3. The node installations `src` folder (default physical location: `~/.node-red\node_modules\node-red-contrib-uibuilder\nodes\src`)
   *only added if index.html DOES NOT exist in the dist folder*

In addition, this node uses the httpNodeMiddleware Node-RED setting allowing for ExpressJS middleware to be used.
For example, for implementing user security.

## To Do

- Add ability to create resources from the Node-RED admin UI - currently all resources have to be created in
  the file system

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

## Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

## Contributing

If you would like to contribute to this node, you can contact Totally Information via GitHub or raise a request in the GitHub issues log.

## Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)