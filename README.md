[![NPM Version](https://img.shields.io/npm/v/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Total Downloads](https://img.shields.io/npm/dt/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Downloads per month](https://img.shields.io/npm/dm/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![GitHub last commit](https://img.shields.io/github/last-commit/totallyinformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![GitHub stars](https://img.shields.io/github/stars/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/watchers)
[![GitHub watchers](https://img.shields.io/github/watchers/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/stargazers)
[![GitHub license](https://img.shields.io/github/license/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/LICENSE)
[![Min Node Version](https://img.shields.io/node/v/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-uibuilder.png)](http://packagequality.com/#?package=node-red-contrib-uibuilder)
[![Dependencies](https://img.shields.io/david/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![Open Issues](https://img.shields.io/github/issues-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues?q=is%3Aissue+is%3Aclosed)

<img class="dhide" align="right" src="/docs/node-blue-192x192.png" title="uibuilder icon" />

**Please Note** that:

* v3+ no longer supports Internet Explorer, it requires Node.js v10+ and Node-RED v1+
* v3+ includes breaking changes from v2, please see the [CHANGELOG](CHANGELOG.md) for details.
* v2+ includes breaking changes from v1, please see the [CHANGELOG-v2](/docs/CHANGELOG-v2.md) for details.

# node-red-contrib-uibuilder

A Node-RED web user interface builder. uibuilder aims to provide an easy to use way to create dynamic web interfaces using any (or no) front end libraries for convenience.

The key features and benefits are:

* Designed as an alternative to the Node-RED official Dashboard. Without the overheads and restrictions.
* Control everything from the Node-RED admin ui. Edit your front-end resource files, manage front-end packages. No need to access the servers command line.
* Installs VueJS and bootstrap-vue by default giving you a very easy start with minimal boiler-plate.
* Have as many custom user interfaces as you want. Just 1 node is needed for each entry point. Use link nodes to send data from other parts of your flows.
* Has a control interface separate to the message interface. Know when a browser connects or disconnects, send cached data.
* Much lighter in weight and more mobile friendly than the Node-RED official Dashboard (assuming you don't use Angular as your framework).
* Finds these front-end framework packages automatically and makes them available:  vue, bootstrap, bootstrap-vue, jquery, moonjs, reactjs, riot, angular, picnic, umbrellajs (note this list may expand).
* Use **any** front-end framework you like. Tested with at least [JQuery](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-JQuery), [VueJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Simple-Example-using-VueJS), [MoonJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example,-MoonJS-with-Mini.CSS), [REACT](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-ReactJS), [UmbrellaJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example-Umbrella-JS-and-Picnic-CSS) and [Riot](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Basic-uibuilder-RIOT-example-displaying-values,-switch-and-select-box).
* Use without any front-end framework if you like. Keep it light and simple.
* The included front-end library provides connectivity to Node-RED and msg event handling.
* Write your own HTML, CSS and JavaScript to define the perfect front-end user interface for your needs.
* Edit your custom front-end code from within the Node-RED Editor, little to no need for access to the server's filing system.
* Needs almost no boilerplate in your front-end code in order to work.
* Simple included example works out-of-the-box, no need to install anything other than the node.
* VueJS, MoonJS extended and caching example flows included.
* Optional index web page listing of available files.

Current limitations are:

* You have to write your own HTML, uibuilder doesn't (yet) do it for you. *This is by design. I hope to have a component design available at some point which will give additional options and make the UI building easier.*
* You have to know the front-end library locations for installed libraries and edit your HTML accordingly. The `uibindex` admin API (accessible from any node's admin ui) shows you all of the root folders and what the package authors report as the main entry point for all active packages. There is now also a simplified information page for the currently viewed uibuilder node instance, this is access from a button in the configuration panel.
* You cannot yet compile/compress your custom front-end code (HMTL, JS, SCSS, etc.) for efficiency. *This will be added soon.*


uibuilder is rather the opposite of Node-RED's Dashboard. Whereas that is designed to make it very easy to create a UI but trades that off with some limitations, this is designed to let you do anything you can think of with any framework (or none) but at the trade off of having to write your own front-end code. This node should also be a **lot** faster and more resource efficient in use than Dashboard though that obviously depends on what front-end libraries and frameworks you choose to use.

## Contents
<!-- TOC -->

* [node-red-contrib-uibuilder](#node-red-contrib-uibuilder)
  * [Contents](#contents)
  * [1. Additional Documentation](#1-additional-documentation)
  * [2. Getting Started](#2-getting-started)
    * [2.1. Install](#21-install)
    * [2.2. Simple flow](#22-simple-flow)
    * [2.3. Edit the source files](#23-edit-the-source-files)
    * [2.4. Install additional front-end libraries](#24-install-additional-front-end-libraries)
    * [2.5. Additional Documentation in the WIKI](#25-additional-documentation-in-the-wiki)
  * [3. Features](#3-features)
  * [4. Known Issues](#4-known-issues)
  * [5. Discussions and suggestions](#5-discussions-and-suggestions)
  * [6. Contributing](#6-contributing)
  * [7. Developers/Contributors](#7-developerscontributors)

<!-- /TOC -->

---- 
## 1. Additional Documentation

There is a lot more information available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). In addition, there is more technical and developer documentation in the [docs](/docs) folder that is also available, once you have added uibuilder to your Node-RED palette, as a documentation web site at `<node-red-editor-url>/uibdocs`. There is a button to that in the configuration panel.

## 2. Getting Started

### 2.1. Install

To install the current live version, please use Node-RED's Palette Manager.

To install a specific development or test branch from GitHub, use `npm install TotallyInformation/node-red-contrib-uibuilder#<BRANCH-NAME> --save` from the command line on the server, having first changed to the `userDir` folder (normally `~/.node-red`).

To install a specific release from npm, use `npm install node-red-contrib-uibuilder@<VERSION>`. In addition to release versions (e.g. 1.2.2), you can also use `latest` and `v1-last`. Sometimes, `next` may also be available. Check out the [Versions tab](https://www.npmjs.com/package/node-red-contrib-uibuilder?activeTab=versions) on the npm site for available versions.

**NOTE**: When installing v2.x, you may get a warning from the install:

> `npm WARN bootstrap@4.3.1 requires a peer of jquery@1.9.1 - 3 but none is installed. You must install peer dependencies yourself`

It is safe to ignore that warning unless you want to take control of bootstrap yourself since vue-bootstrap doesn't actually need it.

### 2.2. Simple flow

Once installed, add a simple flow consisting of a trigger, a uibuilder and a debug node all connected in order. Deploy the changes then double click on the uibuilder node, click on the web page url.

That will show you a simple page that makes use of [VueJS](https://github.com/vuejs/vue#readme) and [bootstrap-vue](https://bootstrap-vue.js.org/). It shows the messages being sent and recieved and has a button that inrements a counter while sending the updated count back to Node-RED.

### 2.3. Edit the source files

From the node's configuration panel in the Editor, click on "Edit Source Files" to see the front-end code. Make some changes to see what happens.

If you need more space for the editor, click on the <kbd>&#x2921;</kbd> button underneath the text editor. To get back, press the same button (which is now highlighted) or the <kbd>Esc</kbd> key.

Click on the <kbd>Save</kbd> button to save changes, <kbd>Reset</kbd> to revert to the saved file, <kbd>Close</kbd> to exit the editor. Note that the close button isn't available while there are outstanding changes, press Save or Reset first. The Editor's red Done button is also disabled while there are still outstanding changes.

You can create a new file and delete files and folders as well with the appropriate buttons. If you delete one of the default `index.(html|css|js)` files and have the _Copy Index_ flag set (in advanced settings), the file will be replaced automatically with the default template file. Useful if you get into a complete mess.

The default included [VueJS](https://github.com/vuejs/vue#readme), [bootstrap](https://getbootstrap.com/) and [bootstrap-vue](https://bootstrap-vue.js.org/) packages make for a really easy to use initial setup that is very easy to use but powerful to build any kind of web user interface. The default template files should give you some ideas on how to use everything.

### 2.4. Install additional front-end libraries

If the default [VueJS](https://github.com/vuejs/vue#readme), [bootstrap](https://getbootstrap.com/) and [bootstrap-vue](https://bootstrap-vue.js.org/) libraries are either not enough for you or you want to use a different framework, click the "Manage front-end libraries" button. Then click the <kbd>+ add</kbd> button and type in the name of the package as it is defined in npm.

You can also remove installed libraries from here.

The uibuilder _Detailed Information_ API page (link in the configuration panel) shows details of all packages installed, their URL for your html pages and their physical location on the server (so that you can track down the right file to include in your HTML).

### 2.5. Additional Documentation in the WIKI

Check out the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki) for more information, help and examples.

In addition to various examples, the WIKI includes:

* [v2 URL Paths](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths)
* [v2 Breaking Changes](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/v2-Breaking-Changes)
* [Structure & type of control messages](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Control-Message-Structure)
* [Front-end library available properties & methods](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Front-End-Library---available-properties-and-methods)
* [How to cache and replay messages](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Cache-and-Replay-Messages-without-using-node-red-contrib-infocache)
* [Creating pages in sub-folders](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Create-a-web-page-in-a-sub-path)
* [Getting Started with VueJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Getting-Started-with-VueJS)

_[back to top](#contents)_

## 3. Features

- A single node is used to define an end-point (by its URL path).
  The node can be included in flows as many times as you like - but each instance **must** have a unique URL path name.

- Each node instance gets its own Socket.IO *namespace* matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.

  The namespace is the uibuilder url (defined in the Editor) with a preceding "/".

- There is a front-end library `uibuilderfe.min.js` or `uibuilderfe.js` that hides all the complexities of using Socket.IO
  so that your own FE code is easy to write. It provides a simple event handling system so that you can subscribe to changes and process them as they happen. The default `index.js` file has details and examples of use. The library is written so that it can be sourced via html or included via a build step (e.g. webpack).

  Handling incoming messages from Node-RED is as simple as:

  ```javascript
  uibuilder.onChange('msg', function(msg){
      console.info('[uibuilder.onChange] property msg changed!', msg)
  })
  ```

  Sending a message back to Node-RED is a simple as:

  ```javascript
  uibuilder.send( { 'topic': 'from-the-front', 'payload': 42 } )
  ```

- npm packages can be installed (or removed or updated) using the node's admin ui in Node-RED. This allows you to manage the availability of front-end libraries very easily. No need to have access to the servers command line. Any front-end library that is available as an npm package can be managed this way. Installed packages will be made available to your web app.

- The node's module contains default html, JavaScript and CSS master template files that are copied to your local src folder for you to edit as required. This can be turned off via a flag. It gives you a simple to follow template that kick-starts your web app development.

- Messages sent from Node-RED to your web app can have a `msg.script` and `msg.style` property that will dynamically add that code to the web page - if allowed by the settings (default is off).

- Including a `_socketId` attribute on messages sent from Node-RED will send to that ID only.

  Note that an ID is associated with a specific browser tab and is reset when the page is reloaded.

  The `_socketId` attribute is added to any msg sent from the client to Node-RED.
  See [the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances) for more information.

- A second output port gives access to some control messages.
  
  This allows additional processing when a client connects or disconnects, an instance is (re)deployed or there is a socket error.

  A common use for this is to send cached information back to a newly connected client (or one that has had the page reloaded).

  Other uses could include outputing some standard information when a new client connects. Or you could use the information to keep utilisation metrics.
  See the [Control Message Structure](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Control-Message-Structure) page in the WIKI for details.

- On deployment of the *first* instance of uibuilder,
  a new folder is created within your Node-RED user directory (typically `~/.node-red`) with a fixed name of `uibuilder`. 
  
  If you are using Node-RED's projects feature, the folder will be created within your project folder instead.

- On deployment of any new instance, a new sub-folder within `uibuilder` is created.
  
  The name is the same as the URL path specified in the node instance's settings. (defaults to `uibuilder`). `src` and `dist` sub-folders are also created. The `url` name is limited to a maximum of 20 characters and cannot be `templates` as this is reserved.

  The files in these folders can be edited from within the node's configuration panel in Node-RED's Editor. No need for command line or other file access on the server.

- If the local `dist` folder contains an `index.html` file, the `dist` folder will be served,
  otherwise the `src` folder will be served. This allows you to run a build step (e.g. webpack/babel). The WIKI has instructions on how to do a build step.

- Any resource (html, css, js, image, etc) placed within the `dist`/`src` sub-folder
  is available to the browser client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above). That URL will load `index.html`. Resource URL's take the `httpNodeRoot` Node-RED setting into account.

- An additional "common" folder is created in the uibuilder root folder (e.g. `~/.node-red/uibuilder/common`)

  This is made available to each node instance and is used to make common resources available to multiple web apps.

  See the [URI Paths page in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths) for details of all URI's available to your web apps.

  Better still, see the <kbd>uibuilder details</kbd> and <kbd>instance details</kbd> buttons in the uibuilder configuration panel in the Node-RED Editor, these will show pages of more detailed information.

- Some VueJS helper functions are now included with the front-end library. The idea being to bridge the complexity gap between the Node-RED Dashboard and uibuilder for novice 
  front-end programmers. See the technical docs for details.

_[back to top](#contents)_

## 4. Known Issues

These are things to be aware of & that I'd like to tidy up at some point.

- v3.0.0 does not have a completely working security model. It is not fully tested and may not work. Do not use this part in production. Everything else is fine.
  
- Some of the VueJS helpers in the front-end library have edge-cases where they don't work.
  
- **Socket.IO isn't secured by default** Use uibuilder's ExpressJS and socket middleware feature to secure things properly before considering use over the Internet.

  Note, however that the socket middleware is only called on initial socket connection. Once the connection upgrades to websocket, this is no longer called.

  I hope to improve this in a future release.

  You could also work around this by using a proxy such as NGINX or HAproxy to be the TLS endpoint. Just make sure you proxy the websocket traffic as well as the standard web traffic.

_[back to top](#contents)_

## 5. Discussions and suggestions

Use the `Dashboard` category in the [Node-RED Discourse forum](https://discourse.nodered.org/c/dashboard) 

Or use the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements.

Please note that I rarely have time to monitor the [#uibuilder channel](https://node-red.slack.com/messages/C7K77MG06) in Slack any more, it is best to use Discourse or raise an issue.


## 6. Contributing

If you would like to contribute to this node, you can contact [Totally Information via GitHub](https://github.com/TotallyInformation) or raise a request in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Please refer to the [contributing guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/.github/CONTRIBUTING.md) for more information.

## 7. Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation) - the designer and main author.
- [Colin Law](https://github.com/colinl) - many thanks for testing, corrections and pull requests.
- [Steve Rickus](https://github.com/shrickus) - many thanks for testing, corrections and contributed code.
- [Ellie Lee](https://github.com/ellieejlee) - many thanks for the PR fixing duplicate msgs.
- [Thomas Wagner](https://github.com/Thomseeen) - thanks for the steer and PR on using projects folder if active.
- [Arlena Derksen](https://github.com/boisei0) - thanks for suggestions, bug checks and Issue #59/PR #60.
- [cflurin](https://discourse.nodered.org/u/cflurin) - thanks for the cache example.
- [Scott Page - IndySoft](https://github.com/scottpageindysoft) - thanks for Issue #73/PR #74.
- [Stephen McLaughlin - Steve-Mcl](https://discourse.nodered.org/u/Steve-Mcl) - thanks for the fix for [Issue #71](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/71) and for the enhancement idea [Issue #102](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/102).


<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>

Please also check out my blog, [Much Ado About IT](https://it.knightnet.org.uk), it has information about all sorts of topics, mainly IT related, including Node-RED.


_[back to top](#contents)_
