[![NPM Version](https://img.shields.io/npm/v/node-red-contrib-uibuilder.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Total Downloads](https://img.shields.io/npm/dt/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Downloads per month](https://img.shields.io/npm/dm/node-red-contrib-uibuilder.svg?style=flat-square)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/badges/shields.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![GitHub last commit](https://img.shields.io/github/last-commit/totallyinformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![GitHub stars](https://img.shields.io/github/stars/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/watchers)
[![GitHub watchers](https://img.shields.io/github/watchers/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/stargazers)
[![GitHub license](https://img.shields.io/github/license/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/LICENSE)
[![Min Node Version](https://img.shields.io/node/v/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-uibuilder.png)](http://packagequality.com/#?package=node-red-contrib-uibuilder)
[![Dependencies](https://img.shields.io/david/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![Open Issues](https://img.shields.io/github/issues-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues?q=is%3Aissue+is%3Aclosed)


# 1. node-red-contrib-uibuilder

A Node-RED web user interface builder. Aims to Provide an easy to use way to create dynamic web interfaces using any (or no) front end libraries for convenience.

Designed as an alternative to the Node-RED Dashboard. See the *[Known Issues](#known-issues)* section below and the *[To Do](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/To-Do)* WIKI page  for what might still need some work.

This module should minimise any boilerplate that you (as a user) are forced to create, it should be lightweight and should be usable on any device (though obviously depending on what libraries you add). You shouldn't need to have in-depth knowledge of Node.JS nor npm, nor should you need access to the underlying file system. (Those last two points are aims for the future, we aren't there yet I'm afraid). More information is available in the [GitHub WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki)

Currently, this module allow users to use their own html/css/js/etc code to define a UI on a specific URL (end-point) that is defined in Node-RED by this node. Also to easily allow loading of external front-end libraries.

*Breaking Change in 0.4.0*: You must have at least `index.html` in your local override folder.

*Front-end changes in 0.4.2 & 0.4.5*: You will want the new master template files as they use a new library that makes your own custom code very much easier.

Eventually, you will be able to "compile" src files using webpack from a button in the nodes config. That will let you using all manner of frameworks such as Vue, REACT, Foundation, etc.

The final evolution will be to provide configuration nodes to let you define framework or html/css/js files in Node-RED itself so that you won't need access to the servers file system at all.

This is rather the opposite of Node-RED's Dashboard. Whereas that is designed to make it very easy to create a UI but trades that off with some limitations, this is designed to let you do anything you can think of with any framework but at the trade off of greater complexity and a need to write your own front-end code. This node should also be a **lot** faster and more resource efficient in use than Dashboard though that obviously depends on what front-end libraries and frameworks you choose to use.

## 1.1. Contents
<!-- TOC -->

* [1. node-red-contrib-uibuilder](#1-node-red-contrib-uibuilder)
    * [1.1. Contents](#11-contents)
    * [1.2. Additional Documentation](#12-additional-documentation)
    * [1.3. Out of the box](#13-out-of-the-box)
    * [1.4. Features](#14-features)
    * [1.5. Known Issues](#15-known-issues)
    * [1.6. Dependencies](#16-dependencies)
    * [1.7. Install](#17-install)
    * [1.8. Node Instance Settings](#18-node-instance-settings)
    * [1.9. uibuilder settings.js configuration](#19-uibuilder-settingsjs-configuration)
    * [1.10. Discussions and suggestions](#110-discussions-and-suggestions)
    * [1.11. Contributing](#111-contributing)
    * [1.12. Developers/Contributors](#112-developerscontributors)
    * [1.13. Preference Tree](#113-preference-tree)
        * [1.13.1. Front-end path summary](#1131-front-end-path-summary)
        * [1.13.2. Physical file/folder location summary](#1132-physical-filefolder-location-summary)

<!-- /TOC -->

## 1.2. Additional Documentation

There is more information available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).
- [Getting Started](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Getting-Started)
- [In Progress](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Currently-In-Development)
- [To Do](/TotallyInformation/node-red-contrib-uibuilder/blob/master/TODO.md) What's coming up for uibuilder?
- [Latest Changes](/TotallyInformation/node-red-contrib-uibuilder/blob/master/CHANGELOG.md)
- [Structure and types of control messages](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Control-Message-Structure)
- Examples
  - [Basic JQuery app](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-JQuery) - Uses the built-in JQuery and Normalize.CSS libraries
  - [Basic Riot app](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-RiotJS)
  - [Slightly extended Riot app](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Basic-uibuilder-RIOT-example-displaying-values,-switch-and-select-box)
  - [Basic MoonJS app](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-MoonJS)
  - [Slightly extended MoonJS example](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example,-MoonJS-with-Mini.CSS)
  - [Umbrella JS and Picnic CSS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example-Umbrella-JS-and-Picnic-CSS)
  - [Example Show MQTT device info using Moon with caching](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example-Show-MQTT-device-info-using-Moon-with-caching)
- How To
  - [Send messages to a specific client](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances)
  - [Cache & Replay Messages](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Message-Caching)
  - [Cache without a helper node](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Cache-and-Replay-Messages-without-using-node-red-contrib-infocache)
  - [Use with mobile browsers](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Use-on-Mobile-Browsers)
  - [Create a web page on a sub-path](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Create-a-web-page-in-a-sub-path)
  - [Use webpack to optimise front-end libraries and code](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Building-app-into-dist-folder-using-webpack)
  - [How to contribute & coding standards](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/How-to-Contribute-and-Coding-Standards)


## 1.3. Out of the box

Out of the box, you get a simple `index.html` template with matching `index.css` & `index.js` JavaScript.
These are automatically copied over from the module's master template folder to the instance's src folder when you first deploy so that you can override them.
If you want to reset them, you can simply delete your local copies and the master templates will be copied back _when you restart Node-RED_.

JQuery is used in the default JavaScript to give dynamic updates to the web page. If all you need to do
is some simple dynamic updates of the page, JQuery is likely enough. Normalize.css is also provided to help you with
standard look and feel. Just remove the references in index.html and the code from index.js if you don't want them.

Any msg sent to the node is forwarded directly to the front-end and is available in the global `msg` variable
as it would be in Node-RED, use the `msgSend` function to send a message back to Node-RED that
will be passed downstream from the node.
The msg can contain script and style information that will be dynamically added to the web page if allowed by the settings.

You will want to change the front-end code to match your requirements since, by default, it displays some rough dynamic information using JQuery and reflects any received messages back to Node-RED (including control messages). You can find this in `~/.node-red/uibuilder/<url>` by default. As a minimum, you need an `index.html` file. But you need the `index.js` file as well if you want Socket.IO communications to work. You will also need `manifest.json` for mobile use.

The local `index.(html|js)` files are well documented and should show you how to get started with your own customisations. There are also some examples, with code, on the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).

The node also has a second output port. This is used exclusively for control messages. Control messages are sent by the server when a client connects or disconnects and by the front-end client when the websocket has connected and when the client is ready to receive messages (after window.load by default). The connect and ready messages have a `"cacheControl": "REPLAY"` property which is designed to be used with [node-red-contrib-infocache](https://github.com/TotallyInformation/node-red-contrib-infocache) or your own message cache ([example](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Cache-and-Replay-Messages-without-using-node-red-contrib-infocache)) so that new or reconnecting clients can receive cached information (similar to Dashboard widgets).

_[back to top](#contents)_

## 1.4. Features

- A single node is used to define an end-point (by its URL path).
  The node can be included in flows as many times as you like - but each instance **must** have a unique URL path name.

- Each node instance gets its own Socket.IO namespace matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.

- There is a front-end library `uibuilderfe.min.js` or `uibuilderfe.js` that hides all the complexities of using Socket.IO
  so that your own FE code is easy to write. It provides a simple event handling system so that you can subscribe to changes and process them as they happen. The default `index.js` file has details and examples of use.

- Users can install front-end libraries using npm into their `userDir` folder.
  If using the `src` sub-folder, these can be accessed in front-end code via the "vendor" path, see below. The list of user libraries made available is given via Node-RED's settings.js file in `uibuilder.userVendorPackages` (Eventually, also via the nodes settings).

- The node's module contains default html, JavaScript and CSS master template files that are
  copied to your local src folder for you to edit as required.

- Any msg sent to a node instance is sent through to the UI via Socket.IO.
  If `topic` is set in settings and not in the `msg`, the version from settings will be added.
  NOTE that this may present security and/or performance issues. In particular, you should remove msg.res and msg.req objects as they are both very large and often contain circular references.

- Sent msg's can have a `msg.script` and `msg.style` property that will dynamically
  add that code to the web page - if allowed by the settings (default is off)

- Including a `_socketId` attribute on messages sent from Node-RED will send to that ID only.
  An ID is associated with a specific browser tab and is reset when the page is reloaded so this isn't too easy to use as yet (see [To Do list](to-do)).
  The `_socketId` attribute is added to any msg sent from the client to Node-RED.
  See [the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances) for more information.

- A second output port gives access to some control messages.
  This allows additional processing when a client connects or disconnects, an instance is (re)deployed or there is a socket error.
  You could, for example, output some standard information when a new client connects. Or you could use the information to keep utilisation metrics.
  See the [Control Message Structure](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Control-Message-Structure) page in the WIKI for details.

- On deployment of the *first* instance of uibuilder,
  a new folder is created within your Node-RED user directory (typically `~/.node-red`) with a fixed name of `uibuilder`.

- On deployment of any new instance, a new sub-folder within `uibuilder` is created.
  The name is the same as the URL path specified in the node instance's settings. (defaults to `uibuilder`). `src` and `dist` sub-folders are also created.

- If the local `dist` folder contains an `index.html` file, the `dist` folder will be used,
  otherwise the `src` folder will be used.

- Any resource (html, css, js, image, etc) placed within the `dist`/`src` sub-folder
  is available to the browser client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above). That URL will load `index.html`.

- You have access to ExpressJS middleware simply by providing a function definition in `settings.js`.
  This lets you, for example, have custom authentication/authorisation.

- Eventually, a link to webpack will be provided to enable packing/compiling
  of `src` code to `dist`.
  This will enable front-end code to use non-native libraries such as JSX, ES6, Foundation, etc.

You might like to try some lightweight front-end libraries (in addition to or instead of the included JQuery and Normalize.css):
- [MoonJS](http://moonjs.ga) is a minimal, blazing fast user interface library. Only 7kb.
  Based originally on the Vue API, uses a virtual DOM, possibly the simplest UI library to use. You can remove JQuery if you use this, it isn't needed.
- [RiotJS](http://riotjs.com/) is a lightweight UI library, REACT-like but only 10k.
- [Ractive.js](https://ractive.js.org) is a template-driven UI library. Very simple to use
- [Mini.CSS](http://minicss.org/index) is a minimal, responsive, style-agnostic CSS framework. Only 7kb. You can remove Normalize.css if you use this, it is built in.

Examples for using some of these are available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki)

_[back to top](#contents)_

## 1.5. Known Issues

I don't believe any of the current issues make the node unusable. They are mainly things to be aware of & that I'd like to tidy up at some point.

- It is common to need to send a number of messages from Node-RED to the front-end,
  specifically when a new client is loaded or a user refreshes the client browser. This is not catered for natively by this node. You can either handle this manually or use the companion node [node-red-contrib-infocache](https://github.com/TotallyInformation/node-red-contrib-infocache). Simply send the control messages to an infocache node (or manual equivalent - see the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Cache-and-Replay-Messages-without-using-node-red-contrib-infocache)) and it will resend all cached messages back to the individual client.

- **Socket.IO is not yet secured!** Do not use over the Internet unless you *really* don't care
  about the data you are passing back and forth. I would love some help with this so if you know how, please issue a pull request. It should use TLS encryption if your Node-RED site uses it but this has not yet been tested.

  You can work around this by using a proxy such as NGINX or HAproxy to be the TLS endpoint. Just make sure you proxy the websocket traffic as well as the standard web traffic.

- Uniqueness of the URL is not yet being validated for multiple instances, could cause
  some "interesting" effects!

- Modules to be used for front-end code (e.g. JQuery) **must** be installed under `<userDir>`.
  Some installs don't seem to be doing this for some reason. See [Issue 2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/2). Added some extra code to try and deal with this but it may not be 100% reliable.

_[back to top](#contents)_

## 1.6. Dependencies

See the [package.json](package.json) file, these should all be installed for you. Currently:

- [normalize.css](https://necolas.github.io/normalize.css/) - front-end only
- [JQuery](https://jquery.com/) - front-end only
- [Socket.IO](https://socket.io/) - front-end and server
- [serve.static](https://github.com/expressjs/serve-static) - server only
- [winston](https://github.com/winstonjs/winston) - server only

Any packages that you define in `settings.js` must currently be installed by you under your `userDir` folder prior to use.

## 1.7. Install

It is now best to install Node-RED nodes using the Node-RED admin interface. Look for the "Manage Palette" menu item. Alternatively, Run the following command in your Node-RED user directory (typically `~/.node-red`) `npm install node-red-contrib-uibuilder`.

Run Node-RED and add an instance of the UI Builder node. Set the required URL path and deploy.

The UI should then be available at the chosen path. The default would normally be <http://localhost:1880/uibuilder>
(if default Node-RED and node settings are used).

For information on what to do next, see the [Getting Started](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Getting-Started) WIKI page.

_[back to top](#contents)_

## 1.8. Node Instance Settings

Each instance of the uibuilder node has the following settings available.

**`name` (optional)**

Only used in the Node-RED admin UI.

**`topic` (optional)**

Only used if an inbound msg does not contain a topic attribute. Passed on to client UI upon receipt of a msg.

**`url` (required, default = 'uibuilder')**

The path used to access the user interface that this node builds.
So on `localhost`, if none of the port nor `https` nor `httpRoot` settings are defined (in Node-RED's `settings.js` file), the URL of the default interface would be `http://localhost:1880/uibuilder`

**It is up to the flow author to ensure that no duplicate names are used, the node
does not check or enforce uniqueness.**

**Forward received messages direct to output? (default = false)**

Forwards a copy of every received message direct to the output.
Adds the topic from the above setting if one isn't present in the msg.

_Note_ that this may result in multiple output messages if your front-end code also auto-sends inbound messages.

**`userVendorPackages` (optional)**

A list of npm package names (as they appear in `node_modules`) that the node will make
available to front-end code under the `uibuilder/vendor` path.

All instances of this node will also use the `uibuilder.userVendorPackages` attribute of
`settings.js` unless defined in the node's settings.

**`debug` (optional, default=false)**

Only available using the `uibuilder.debug` attribute of
`settings.js`. Set to `true` to output additional debugging information.

_[back to top](#contents)_

## 1.9. uibuilder settings.js configuration

uibuilder has some global configuration settings available in Node-RED's `settings.js` file, typically found in `userDir` (normally `~/.node-red`).

Note that you do not _have_ to have this set in `settings.js` _if_ you are not using any of the entries. Also, _none_ of the properties are required and so can be missed off if you don't need them. The Vendor Package list defaults to an empty array, Debug defaults to `false`, Middleware entries default to nothing.

```javascript
    uibuilder: {
        // List of npm modules to be made available to any uibuilder instance.
        //   The modules MUST be manually preinstalled at present. e.g. `npm install slim-js` in ~/.node-red folder.
        userVendorPackages: ['riot', 'moonjs', 'slim-js', 'ractive', 'picnic', 'accounting', 'date-format-lite'],
        // Controls the amount of debug output to ~/.node-red/uibuilder.js
        debug: 'verbose',  // error, warn, info, verbose, debug, silly; true = silly, false = none
        // Provides an ExpressJS middleware hook. This can be used for custom authentication/authorisation
        //   or anything else you like. If NOT provided, uibuilder instances will also check if
        //   httpNodeMiddleware available.
        // @see https://expressjs.com/en/guide/using-middleware.html
        // middleware: function(req,res,next) {
        //     console.log('I am run whenever a web request is made to ANY of the uibuilder instances')
        //     // ... do some user auth checks ...
        //     // if auth checks fail: next(new Error('Authentication error')) otherwise:
        //     next()
        // },
        // Provides a Socket.IO middleware hook. This can be used for custom authentication/authorisation or anything else you like.
        // socketmiddleware: function(socket, next) {
        //     /* Some SIO related info that might be useful in security checks
        //         //console.log('--socket.request.connection.remoteAddress--', socket.request.connection.remoteAddress)
        //         //console.log('--socket.handshake.address--', socket.handshake.address)
        //         //console.dir('-- Sockets connected --', io.sockets.connected)
        //     */
        //     console.log('Socket.IO middleware: I am only run when a client FIRST connects')
        //     console.log('Socket Middleware. ID:', socket.conn.id, ' Remote Addr:', socket.conn.remoteAddress)
        //     // ... do some user auth checks ...
        //     // if auth checks fail: next(new Error('Authentication error')) otherwise:
        //     next()
        // },
    },
```

You can miss any settings out that you don't need.

_[back to top](#contents)_

## 1.10. Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) or the [#uibuilder](https://node-red.slack.com/messages/C7K77MG06) channel in the [Node-RED Slack](https://node-red.slack.com) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

## 1.11. Contributing

If you would like to contribute to this node, you can contact [Totally Information via GitHub](https://github.com/TotallyInformation) or raise a request in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Please refer to the [contributing guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/.github/CONTRIBUTING.md) for more information.

## 1.12. Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)1
- [Colin Law](https://github.com/colinl) - many thanks for testing, corrections and pull requests.
- [Steve Rickus](https://github.com/shrickus) - many thanks for testing, corrections and contributed code.
- [Ellie Lee](https://github.com/ellieejlee) - many thanks for the PR fixing duplicate msgs.


<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>


_[back to top](#contents)_

## 1.13. Preference Tree

The uibuilder node adds a number of statically served web resource locations (physical file-system locations) to the URL path (default `/uibuilder`) defined. It is up to the user to ensure that file/folder names do not clash.

Note that if using the local folders (1 or 2 below), the default/master folders (3/4) are also still available.

The order of preference is as follows:

1. The `dist` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/dist`)

   *only added if index.html exists in this folder*

2. The `src` folder within the node instance URL setting (default: `uibuilder`, default physical location: `~/.node-red/uibuilder/uibuilder/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   In this case, an optional node configuration variable (`uibuilder.userVendorPackages`) is used to provide a list of package names that will be added to the `vendor` sub-path of the URL so that users can install their own front-end libraries. This is only added when not using the dist folder as that is expected to have all of the vendor code compiled together using webpack.

   If you want to *reset* any of the front-end files back to the master template, simply delete one or more of them from this folder. They will be copied back from the master _when you restart Node-RED_.

3. The node installations `dist` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/dist`)

   *only added if index.html exists in this folder*

4. The node installations `src` folder (default physical location: `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src`)

   *only added if index.html DOES NOT exist in the dist folder*

   This folder currently only contains am `images` folder that contains: `logo-red.png`, `logo.png`, `node-red.ico`.

   Override these as needed using the local folders (1/2).

The `vendor` subpath will be always be available with some pre-installed vendor packages.
Currently `normalize.css` and `jquery` are always available.

In addition, this node uses the httpNodeMiddleware Node-RED setting allowing for ExpressJS middleware to be used. For example, implementing user security.

_[back to top](#contents)_

### 1.13.1. Front-end path summary

Front-end files in `~/.node-red/node_modules/node-red-contrib-uibuilder/nodes/src/` may use the url paths:

- `[/<httpNodeRoot>]/<url>/` - for most things
  e.g. `<script src="index.js"></script>`

- `vendor` - for things like normalize.css & JQuery and other front-end libraries installed using
  npm either by this module or as packages in your `userDir` e.g. `<link rel="stylesheet" href="vendor/normalize.css/normalize.css">`

- `<script src="/uibuilder/socket.io/socket.io.js"></script>` - for socket.io
  The static /uibuilder prefix is used here to ensure all instances of clients for this node use the same, correct, instance of socket.io

### 1.13.2. Physical file/folder location summary

Folders and files for resources on the device running Node-RED are:

- `<userDir>/uibuilder/<url>/src/` - local source files for front-end use (e.g. html, js, css)
- `<userDir>/uibuilder/<url>/dist/` - local compiled files for front-end use
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/template/` -
  this modules master template source files for front-end use - copied to local folders on deployment
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/src/` -
  this modules source files for front-end use (e.g. html, js, css)
- `<userDir>/node_modules/node-red-contrib-uibuilder/nodes/dist/` - this modules compiled files for front-end use
- `<userDir>/node_modules/<package-name>` - when included via the `uibuilder.userVendorPackages` global
  setting (in `settings.js`). Note that each package will have its own folder structure that you will need to understand in order to use the package in the browser. These are often poorly documented.

_[back to top](#contents)_
