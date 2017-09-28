# node-red-contrib-uibuilder

An EXPERIMENTAL Node-RED web user interface builder.

Designed as an *experimental* alternative to the Node-RED Dashboard. See the *[Known Issues](#known-issues)*
and *[To Do](#to-do)* sections below for what might still need some work.

The idea is to allow users to use their own html/css/js/etc code to define a UI on a specific URL that
 is defined in Node-RED by this node. Also to easily allow loading of external front-end libraries.

Eventually, you will be able to "compile" src files using webpack from a button in the nodes config.
That will let you using all manner of frameworks such as Vue, REACT, Foundation, etc.

The final evolution will be to provide configuration nodes to let you define framework or html/css/js
files in Node-RED itself so that you won't need access to the servers file system at all.

This is rather the opposite of Node-RED's Dashboard. Whereas that is designed to make it very easy to
create a UI but trades that off with some limitations, this is designed to let you do anything you can
think of with any framework but at the trade off of greater complexity and a need to write your own front-end code.

## Out of the box

Out of the box, you get a simple index.html template with matching css & JavaScript.
These are in the module's src folder (currently), copy them to the instance src folder if you want to override them.

JQuery is used in the default JavaScript to give dynamic updates to the web page. If all you need to do
is some simple dynamic updates of the page, JQuery is likely enough. Normalize.css is also provided to help you with
standard look and feel.

Any msg sent to the node is forwarded directly to the front-end and is available in the global `msg` variable
as it would be in Node-RED, use the `msgSend` function to send a message back to Node-RED that
will be passed downstream from the node.

You will want to change the front-end code to match your requirements since, by default, it displays some rough dynamic information using JQuery and reflects any received messages back to Node-RED (including control messages).

Just make a copy of the `index.html`, `index.js` and `manifest.json` files from the mast `src` folder to the local `src` folder. The file `manifest.json` allows Add to Homescreen to work correctly in Chrome on Android.
See the *[Preference Tree](#preference-tree)* and other sections below for how to find these.

## Design

- A single node is used to define an end-point (by its URL path).
- The node can be included in flows as many times as you like - but each instance **must** have a unique
  URL path name.
- Each node instance gets its own Socket.IO namespace matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.
- The node's module contains default html, JavaScript and CSS files that are used as master templates.
- On deployment of the *first* instance, a new folder is created within your Node-RED user directory
  (typically `~/.node-red`) with a fixed name of `uibuilder`.
- On deployment of any new instance, a new sub-folder within `uibuilder` is created. The name is the same
  as the URL path specified in the node instance's settings. (defaults to `uibuilder`). `src` and `dist` sub-folders are also created.
- If the `dist` folder contains an `index.html` file, the `dist` folder will be used, otherwise the `src`
  folder will be used.
- Any resource (html, css, js, image, etc) placed within the `dist`/`src` sub-folder is available to the
  browser client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above).
- Any resource in the `dist`/`src` sub-folder that has the same name as resources in other resource
  paths (such as the master resource path) will be given preference - see *Preference Tree* below.
- Any msg sent to a node instance is sent through to the UI via Socket.IO. If `topic` is set in settings
  and not in the `msg`, the version from settings will be added.
  NOTE that this may present security and/or performance issues. In particular, you should remove msg.res and msg.req objects as they are both very large and often contain circular references.
- Users can install front-end libraries using npm into their `userDir` folder. If using the `src`
  sub-folder, these can be accessed in front-end code via the "vendor" path, see below. The list of user libraries made available is given via Node-RED's settings.js file in `uibuilder.userVendorPackages` (Eventually, also via the nodes settings).
- Eventually, a link to webpack will be provided to enable packing/compiling of `src` code to `dist`.
  This will enable front-end code to use non-native libraries such as JSX, ES6, Foundation, etc.

You might like to try some lightweight front-end libraries (in addition to the included JQuery and Normalize.css):
- [RiotJS](http://riotjs.com/) is a lightweight UI library, REACT-like but only 10k
- [Tachyons.IO](http://tachyons.io) is a lightweight style library, responsive, accessible, modular, readable, performant, 14k

## Preference Tree

The uibuilder node adds a number of statically served web resource locations (physical file-system locations) to the URL path (default `/uibuilder`) defined. It is up to the user to ensure that file/folder names do not clash.

Note that if using the local folders (1 or 2 below), the default/master folders (3/4) are also still available. That means you can rely on files in the master folders and only need to overwrite local files as needed. For example, if you were happy with the master page & scripting but just want to change the CSS, all you need is a local copy of `index.css`

The order of preference is as follows:

1. The `dist` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/dist`)

   *only added if index.html exists in this folder*

2. The `src` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   In this case, an optional node configuration variable (`uibuilder.userVendorPackages`) is used to provide a list of package names that will be added to the `vendor` sub-path of the URL so that users can install their own front-end libraries. This is only added when not using the dist folder as that is expected to have all of the vendor code compiled together using webpack.

3. The node installations `dist` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/dist`)

   *only added if index.html exists in this folder*

4. The node installations `src` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   This folder contains the following example master files: `index.html`, `index.css`, `index.js`, `manifest.json`.

   There is also a sub-folder called `images` that contains: `logo-red.png`, `logo.png`, `node-red.ico`.

   Override these as needed using the local folders (1/2).

The `vendor` subpath will be always be available with some pre-installed vendor packages.
Currently `normalize.css` and `jquery` are always available.

In addition, this node uses the httpNodeMiddleware Node-RED setting allowing for ExpressJS middleware to be used. For example, implementing user security.

### Front-end path summary

Front-end files in `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src/` may use the
url paths:

- `[/<httpNodeRoot>]/<url>/` - for most things
  e.g. `<script src="index.js"></script>`
- `vendor` - for things like normalize.css & JQuery and other front-end libraries installed using
  npm either by this module or as packages in your `userDir`
  e.g. `<link rel="stylesheet" href="vendor/normalize.css/normalize.css">`
- `<script src="/uibuilder/socket.io/socket.io.js"></script>` - for socket.io
  The static /uibuilder prefix is used here to ensure all instances of clients for this node
  use the same, correct, instance of socket.io

### Physical file/folder location summary

Folders and files for resources on the device running Node-RED are:

- `<userDir>/uibuilder/<url>/src/` - local source files for front-end use (e.g. html, js, css)
- `<userDir>/uibuilder/<url>/dist/` - local compiled files for front-end use
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/src/` - this modules source files for front-end use (e.g. html, js, css)
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/dist/` - this modules compiled files for front-end use
- `<userDir>/node_modules/<package-name>` - when included via the `uibuilder.userVendorPackages` global
  setting (in `settings.js`).
  Note that each package will have its own folder structure that you will need to understand in order to use the package in the browser. These are often poorly documented.

## Known Issues

- **Socket.IO is not yet secured!** Do not use over the Internet unless you *really* don't care about
  the data you are passing back and forth. I would love some help with this so if you know how, please issue a pull request.
- Workaround applied: Client tries to reconnect with increasing timeouts. ~~On redeploy, existing
  clients do not reconnect, page has to be reloaded. Works if NR is restarted.~~
- Uniqueness of the URL is not validated for multiple instances, could cause some "interesting" effects!
- Currently, when you send a msg to a node instance, the msg is sent to **all** front-end clients
  connected to that url. There is, as yet, no way to send to a single front-end client. Once again, help to improve this would
  be welcome. Quite possibly, including the socket ID in the output msg would fix this.
- Currently, it doesn't appear possible to remove routes from Express v4 dynamically.
  Some get removed and some don't, it's about the best I can do unless someone has a better idea.
  This means that you get redundant routes when you redeploy the node instance. Doesn't affect running but probably uses memory.
- Winston logging always produces a log file. If `debug:true`, the log file is detailed, otherwise only `info`, `warn` and `error` messages are output.
  It would probably be better to use standard Node-RED logging for non-debug output. Note that some key messages *are* output to the NR log as well.
- Modules to be used for front-end code (e.g. JQuery) **must** be installed under `<userDir>`. Some installs don't seem to be doing this for some reason.
  See [Issue 2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/2)

## To Do

- Add validation to `url` setting
  Allow A-Z, a-z, 0-9, _, - and / only. Limit to 50 characters (maybe less)
- Allow websocket messages to an individual front-end instance by including the socket ID in the output msg
- Add safety validation checks to `msg` before allowing it to be sent/recieved to/from front-end
- Add integrated ExpressJS security to Socket.IO
- Process `httpNodeAuth`
- Add FE code to enable easier integration with user-supplied function on receipt of msg.
  Maybe a global fn name or msg.prototype?
- Tidy front-end JS code to make integration easier
- Add feature to send a refresh indicator to FE when switching local folder use on/off so that FE auto-reloads
- Use webpack to "compile" resources into distribution folders upon (re)deployment - allowing for the use
  of more resource types such as: less/scss; UI frameworks such as Bootstrap, Foundation, Material UI; jsx or other dynamic templating; front-end frameworks such as VueJS, Angular or REACT.
- Add ability to create resources from the Node-RED admin UI - currently all resources have to be created in
  the file system
- *Copy template files to local override folder if not already existing*?
- *(Maybe compile template resources to dist folder?)*
- Add a check for new file changes in local `src` folder
  For now, will rely on users creating `.recompile` flag file in
  local `src` folder. *(not yet implemented)*
- Add ability to auto-install missing modules.

## Changes

v0.3.7

- Fix for [Issue 2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/2) - not finding normalize.css & JQuery front-end libraries.
  Adds the `get-installed-path` module to find out where the modules are actually loaded from.
- An enhancement of the above fix that uses `require.resolve()` as a backup to try and find the front-end module location if `get-installed-path` fails.
  However, this can return a machine folder that is invalid for use as a source for adding as a static path for ExpressJS.
- Replace native Node-RED logging with Winston. If `debug: true` is added to the uibuilder section of NR's `settings.js`, a file called `uibuilder.log`
  is created in your userDir (`~./node-red` by default) containing detailed logging information.
- The flag for forwarding the incoming msg to output is now active. If not set, the only output from the node is when something is received from a
  connected front-end client browser. Note that the default front-end web page is quite "chatty" and sends control messages as well as anything you
  set up; this is easily disconnected. Also fixed bug, see [Issue 4](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/5)
- Option to *not* use the local folders was broken. Now fixed.
- Possible fix for loss of reconnection, see [Issue 3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/3)

v0.3.1

- Fixed issue when no config settings found. Added getProps() function

v0.3.0

- Fixed incorrect line endings. Updated front-end manifest.json. Fixed minor error in uibuilder.js. Updated dependency versions.
- Breaking changes due to new major version of Socket.IO ([v2](https://socket.io/blog/socket-io-2-0-0/)) and Webpack. Shouldn't impact anything since you need to restart Node-RED anyway.
  However, you might need to force a full reload of any active clients.

v0.2.1

- Tweak this readme as the node seems to work OK. Removing the _Alpha_ label.
  You should consider this suitable for general hobby use. Production use would need good testing before trying to rely on it.
  Remember, this has been written just by me, I'm afraid I can provide no guarantees.

See [CHANGELOG](CHANGELOG.md) for more detail.

## Dependencies

See the package.json file. Currently:

- [normalize.css](https://necolas.github.io/normalize.css/) - front-end only
- [JQuery](https://jquery.com/) - front-end only
- [Socket.IO](https://socket.io/) - front-end and server
- [serve.static](https://github.com/expressjs/serve-static) - server only
- [webpack v2](https://webpack.github.io/) - server only

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

### `url` (required, default = 'uibuilder')

The path used to access the user interface that this node builds.
So on `localhost`, if none of the port nor `https` nor `httpRoot` settings are defined (in Node-RED's `settings.js` file), the URL of the default interface would be `http://localhost:1880/uibuilder`

**It is up to the flow author to ensure that no duplicate names are used, the node
does not check or enforce uniqueness.**

### Forward received messages direct to output? (default = false)

Forwards a copy of every received message direct to the output.
Adds the topic from the above setting if one isn't present in the msg.

_Note_ that this may result in multiple output messages if your front-end code also auto-sends inbound messages.

### Use resources in custom folder? (default = true)

Will add the folders either from <code>&lt;userDir>/uibuilder/&lt;url>/dist</code> or
from <code>&lt;userDir>/uibuilder/&lt;url>/src</code>. Also adds any vendor modules
if specified in <code>settings.js</code> under the <code>uibuilder.userVendorPackages</code>
setting.

### `userVendorPackages` (optional)

A list of npm package names (as they appear in `node_modules`) that the node will make
available to front-end code under the `uibuilder/vendor` path.

All instances of this node will also use the `uibuilder.userVendorPackages` attribute of
`settings.js` unless defined in the node's settings.

### `debug` (optional, default=false)

Only available using the `uibuilder.debug` attribute of
`settings.js`. Set to `true` to output additional debugging information.

## Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

## Contributing

If you would like to contribute to this node, you can contact Totally Information via GitHub or raise a request in the GitHub issues log.

## Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)
- [Colin Law](https://github.com/colinl) - many thanks for testing and corrections
