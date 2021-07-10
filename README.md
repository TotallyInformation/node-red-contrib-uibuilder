[![NPM Version](https://img.shields.io/npm/v/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Total Downloads](https://img.shields.io/npm/dt/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![NPM Downloads per month](https://img.shields.io/npm/dm/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![GitHub last commit](https://img.shields.io/github/last-commit/totallyinformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![GitHub stars](https://img.shields.io/github/stars/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/watchers)
[![GitHub watchers](https://img.shields.io/github/watchers/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/stargazers)
[![GitHub license](https://img.shields.io/github/license/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/LICENSE)
[![Min Node Version](https://img.shields.io/node/v/node-red-contrib-uibuilder.svg)](https://www.npmjs.com/package/node-red-contrib-uibuilder)
[![Package Quality](http://npm.packagequality.com/shield/node-red-contrib-uibuilder.png)](http://packagequality.com/#?package=node-red-contrib-uibuilder)
[![DeepScan grade](https://deepscan.io/api/teams/13157/projects/16160/branches/340901/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=13157&pid=16160&bid=340901)
[![Dependencies](https://img.shields.io/david/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
[![Open Issues](https://img.shields.io/github/issues-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues?q=is%3Aissue+is%3Aclosed)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/TotallyInformation/node-red-contrib-uibuilder)

<img class="dhide" align="right" src="/docs/node-blue-192x192.png" title="uibuilder icon" />

**Please Note** that:

* v4.0.0 has breaking changes from v3.3.1, please see the [CHANGELOG](CHANGELOG.md) for details.
* v3.3.1 was the last version compatible with Node.js v10 due to upstream dependencies.
* v3.1.3+ no longer installs vue and bootstrap-vue, if you want to use those, install them separately.
* v3+ no longer supports Internet Explorer, it requires Node.js v10+ and Node-RED v1+
* v3+ includes breaking changes from v2, please see the [CHANGELOG](CHANGELOG.md) for details.
* v2+ includes breaking changes from v1, please see the [CHANGELOG-v2](/docs/CHANGELOG-v2.md) for details.

# node-red-contrib-uibuilder

A Node-RED web user interface builder. uibuilder aims to provide an easy to use way to create dynamic web interfaces using any (or no) front end libraries for convenience.

<details open><summary>The key features and benefits are: (Click to show/hide)</summary>

* Designed as an alternative to the Node-RED official Dashboard. Without the overheads and restrictions.
* Control everything from the Node-RED admin ui. Edit your front-end resource files, manage front-end packages. No need to access the servers command line.
* Manage startup templates. Internal templates for VueJS and bootstrap-vue available. Load templates from other repositories via _degit_. Makes it easy to share templates that provide a whole app or just deal with boilerplate.
* Have as many custom user interfaces as you want. Just 1 node is needed for each entry point. Use link nodes to send data from other parts of your flows.
* Has a control interface separate to the message interface. Know when a browser connects or disconnects, send cached data.
* Can be a lot lighter in weight and more mobile friendly than the Node-RED official Dashboard.
* Finds these front-end framework packages automatically if installed to your `userDir` folder. Makes them available via the built-in Node-RED web server: vue, bootstrap, bootstrap-vue, Svelte, jquery, moonjs, reactjs, riot, angular, picnic, umbrellajs (note this list may expand).
* Use **any** front-end framework you like. Tested with at least [JQuery](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-JQuery), [VueJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Simple-Example-using-VueJS), [MoonJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example,-MoonJS-with-Mini.CSS), [REACT](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example:-ReactJS), [UmbrellaJS](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Example-Umbrella-JS-and-Picnic-CSS) and [Riot](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Basic-uibuilder-RIOT-example-displaying-values,-switch-and-select-box). Simply install via the built-in library manager.
* Use without any front-end framework if you like. Keep it light and simple. Try this out with the "Blank" template.
* The included front-end library (uibuilderfe) provides connectivity to Node-RED and msg event handling.
* Write your own HTML, CSS and JavaScript to define the perfect front-end user interface for your needs.
* Edit your custom front-end code from within the Node-RED Editor, little to no need for access to the server's filing system. Auto-reload your clients on changes to the code. Great for rapid development.
* Needs almost no boilerplate in your front-end code in order to work.
* VueJS, MoonJS extended and caching example flows included.
* Optional index web page listing of available files.
* Two detailed admin info web pages are included to help authors understand where everything is and what is available.
* Uses Node-RED's own webservers by default. (Will soon gain ability to its own on a separate port if desired).

</details>

<details open><summary>Current limitations are: </summary>

* You have to write your own HTML, uibuilder doesn't (yet) do it for you. *This is by design. I hope to have a component design available at some point which will give additional options and make the UI building easier.*
* You have to know the front-end library locations for installed libraries and edit your HTML accordingly. The `uibindex` admin API (accessible from any node's admin ui) shows you all of the root folders and what the package authors report as the main entry point for all active packages. There is now also a simplified information page for the currently viewed uibuilder node instance, this is access from a button in the configuration panel.
  
  Note that this is a limitation of `npm` and module authors, not of uibuilder. Unless module authors correctly identify the browser entrypoint for their libraries, uibuilder can only guess.

* You cannot yet compile/compress your custom front-end code (HMTL, JS, SCSS, etc.) for efficiency. *This will be added soon.*
  
  This will use a local package.json file that contains a "build" script. If it exists, uibuilder will expose a build button that will run the script.

</details>

uibuilder is rather the opposite of Node-RED's Dashboard. Whereas Dashboard is designed to make it very easy to create a UI but trades that off with some limitations, uibuilder is designed to let you do anything you can think of with any framework (or none) but at the trade off of having to write your own front-end code. 

uibuilder should generally also be a **lot** faster and more resource efficient in use than Dashboard though that obviously depends on what front-end libraries and frameworks you choose to use.



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
    * [2.5. Additional Documentation](#25-additional-documentation)
  * [3. Features](#3-features)
  * [4. Known Issues](#4-known-issues)
  * [5. Discussions and suggestions](#5-discussions-and-suggestions)
  * [6. Contributing](#6-contributing)
  * [7. Developers/Contributors](#7-developerscontributors)

<!-- /TOC -->

---- 
## 1. Additional Documentation

There is a lot more information available in the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). In addition, there is more technical and developer documentation in the [docs](/docs) folder that is also available, once you have added uibuilder to your Node-RED palette, as a documentation web site at `<node-red-editor-url>/uibdocs`. There is a button to that in the configuration panel. You can also access that documentation [here](https://totallyinformation.github.io/node-red-contrib-uibuilder).

## 2. Getting Started

### 2.1. Install

To install the current live version, please use Node-RED's Palette Manager.

**NOTE**: As of v3.1.3, npm cannot safely install the VueJS and bootstrap-vue default dependencies. If you want to use the provided VueJS templates, you must install these yourself. Either use uibuilder's library manager or manually install from the command line:

```bash
#cd <userDir>
npm install vue@"2.*" bootstrap-vue@"2.*"
```

To install a specific uibuilder development or test branch from GitHub, use `npm install TotallyInformation/node-red-contrib-uibuilder#<BRANCH-NAME>` from the command line on the server, having first changed to the `userDir` folder (normally `~/.node-red`). If you just want the `main` branch which contains the latest development build, you can do `npm install TotallyInformation/node-red-contrib-uibuilder`

To install a specific release from npm, use `npm install node-red-contrib-uibuilder@<VERSION>`. In addition to release versions (e.g. 1.2.2), you can also use `latest` and `v1-last`. Sometimes, `next` may also be available. Check out the [Versions tab](https://www.npmjs.com/package/node-red-contrib-uibuilder?activeTab=versions) on the npm site for available versions.

**NOTE**: When installing uibuilder v2+, you may get a warning from the install:

> `npm WARN bootstrap@4.3.1 requires a peer of jquery@1.9.1 - 3 but none is installed. You must install peer dependencies yourself`

It is safe to ignore that warning unless you want to take control of bootstrap yourself since vue-bootstrap doesn't actually need it.

### 2.2. Simple flow

Once installed, 

1) add a simple flow consisting of a trigger, a uibuilder and a debug node all connected in order. 
2) Deploy the changes then 
3) double click on the uibuilder node, 
4) click on the web page url.

That will show you a simple page that will show you a formatted view of any msg send from Node-RED into the node. No additional libraries or frameworks are needed for that & the only dependencies are to load the `uibuilderfe.js` library, start the library using `uibuilder.start()` and then create a listener for incoming messages.

### 2.3. Edit the source files

From the node's configuration panel in the Editor, click on "Edit Source Files" to see the front-end code. Make some changes to see what happens.

If you need more space for the editor, click on the <kbd>&#x2921;</kbd> button underneath the text editor. To get back, press the same button (which is now highlighted) or the <kbd>Esc</kbd> key.

Click on the <kbd>Save</kbd> button to save changes, <kbd>Reset</kbd> to revert to the saved file, <kbd>Close</kbd> to exit the editor. Note that the close button isn't available while there are outstanding changes, press Save or Reset first. The Editor's red Done button is also disabled while there are still outstanding changes.

You can create a new file and delete files and folders as well with the appropriate buttons. If you delete one of the default `index.(html|css|js)` files and have the _Copy Index_ flag set (in advanced settings), the file will be replaced automatically with the default template file. Useful if you get into a complete mess.

### 2.4. Install additional front-end libraries

Click the "Manage front-end libraries" button. Then click the <kbd>+ add</kbd> button and type in the name of the package as it is defined in npm.

You can also remove installed libraries from here.

The uibuilder _Detailed Information_ API page (link in the configuration panel) shows details of all packages installed, their URL for your html pages and their physical location on the server (so that you can track down the right file to include in your HTML).

#### 2.4.a Using VueJS

If you want to use the VueJS based templates, you will need to install `vue` and `bootstrap-vue` libraries.

The included [VueJS](https://github.com/vuejs/vue#readme), [bootstrap](https://getbootstrap.com/) and [bootstrap-vue](https://bootstrap-vue.js.org/) templates make for a really easy to use initial setup that is very easy to use but powerful to build any kind of web user interface. The template files should give you some ideas on how to use everything.

### 2.5. Additional Documentation

Check out the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki) for more information, help and examples.

Also check out the [technical documentation](https://totallyinformation.github.io/node-red-contrib-uibuilder) site. This is also available from within the Node-RED Editor by selecting a uibuilder node and clicking on the link in the help sidebar or by opening the configuration for a uibuilder node and clicking on the "Tech Docs" button.

_[back to top](#contents)_

## 3. Features

- A single node is used to define an end-point (by its URL path).
  The node can be included in flows as many times as you like - but each instance **must** have a unique URL path name.

- Each node instance gets its own Socket.IO *namespace* matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.

  The namespace is the uibuilder url (defined in the Editor) with a preceding "/".

- There is a front-end library `uibuilderfe.min.js` or `uibuilderfe.js` that hides all the complexities of using Socket.IO
  so that your own FE code is easy to write. It provides a simple event handling system so that you can subscribe to changes and process them as they happen. The default `index.js` file has details and examples of use. The library is written so that it can be sourced via html or included via a build step (e.g. webpack).

  Initialise the library with:

  ```javascript
  uibuilder.start()
  ```

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

- Typically, very little code is needed to create a simple, data-driven web UI. The node's module contains default html, JavaScript and CSS master template files that are copied to your local src folder for you to edit as required. It gives you a simple to follow template that kick-starts your web app development. Additional templates are available (even external ones can be used) that help kickstart your development.

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

  From v4.0.0, you can change the location of this root folder by specifying a location in Node-RED's `settings.js` file.

```javascript
    /** Custom settings for all uibuilder node instances */
    uibuilder: {
        /** Optional uibRoot folder. 
         * By default, uibuilder will use `<userDir>/uibuilder`
         * Use this setting to change that.
         */
        uibRoot: process.env.UIBROOT || '/where/i/want/it',
    },
  ```

- On deployment of any new instance, a new sub-folder within `uibuilder` is created.
  
  The name is the same as the URL path specified in the node instance's settings. (defaults to `uibuilder`). `src` and `dist` sub-folders are also created. The `url` name is limited to a maximum of 20 characters and cannot be `templates` as this is reserved.

  The files in these folders can be edited from within the node's configuration panel in Node-RED's Editor. No need for command line or other file access on the server.

  If you remove the node from your flows, Node-RED will offer to delete the folder as well. If you change the `url`, Node-RED will try to rename the folder.

- If the local `dist` folder contains an `index.html` file, the `dist` folder will be served,
  otherwise the `src` folder will be served. This allows you to run a build step (e.g. webpack/babel). The WIKI has instructions on how to do a build step.

- Any resource (html, css, js, image, etc) placed within the `dist`/`src` sub-folder
  is available to the browser client. The default URL would be `http://localhost:1880/uibuilder` (where the path is set as per the point above). That URL will load `index.html`. Resource URL's take the `httpNodeRoot` Node-RED setting into account.

- An additional "common" folder is created in the uibuilder root folder (e.g. `~/.node-red/uibuilder/common`)

  This is made available to each node instance and is used to make common resources available to multiple web apps.

  See the [URI Paths page in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths) for details of all URI's available to your web apps.

  Better still, see the <kbd>uibuilder details</kbd> and <kbd>instance details</kbd> buttons in the uibuilder configuration panel in the Node-RED Editor, these will show pages of more detailed information.

- You can use a separate webserver from the Node-RED internal webserver by specifying a port in `settings.js`

  ** The main purpose of this is that it lets you use a reverse proxy to securely expose _only_ uibuilder's endpoints without exposing Node-RED itself.** It also gives you more control over headers and other settings.

  It will still use Node-RED's Admin server but your own front-end code and all of the installed vendor packages and middleware (including Socket.IO) will now use a separate http(s) server and ExpressJS app.

  If you specify https for Node-RED, your custom server will also use https and will automatically pick up the certificate and key files from settings.js.

  **NOTE**: That _all_ instances of uibuilder nodes will all use the same webserver. Allowing multiple servers requires a significant development effort but is on the backlog (just a very long way down).

  To use a different webserver, you have to add the following into the `module.exports` part of your `settings.js` file:

  ```javascript
    /** Custom settings for all uibuilder node instances */
    uibuilder: {
        /** Optional HTTP PORT. 
         * If set and different to Node-RED's uiPort, uibuilder will create
         * a separate webserver for its own use.
         */
        port: process.env.UIBPORT || 3000,
    },
  ```

  Note that the above will let you use an environment variable called `UIBPORT` to set the port. This must be done before starting Node-RED. The port setting is not dynamic.

- Some VueJS helper functions are now included with the front-end library. The idea being to bridge the complexity gap between the Node-RED Dashboard and uibuilder for novice 
  front-end programmers. See the technical docs for details.

_[back to top](#contents)_

## 4. Known Issues

These are things to be aware of & that I'd like to tidy up at some point.

- v4.0.0 does not have a completely working security model. It is not fully tested and may not work. Do not use this part in production. Everything else is fine.
  
- Some of the VueJS helpers in the front-end library have edge-cases where they don't work.
  
- **Socket.IO isn't secured by default** Use uibuilder's ExpressJS and socket middleware feature to secure things properly before considering use over the Internet. **ALWAYS** configure TLS before configuring authentication. If Node-RED is using HTTPS, Socket.IO will also use HTTPS/WSS encryption of traffic.

  Note, however that the socket middleware is only called on initial socket connection. Once the connection upgrades to websocket, this is no longer called.

  I hope to improve this in a future release.

  You could also work around this by using a proxy such as NGINX or HAproxy to be the TLS endpoint. Just make sure you proxy the websocket traffic as well as the standard web traffic.

  See the security documentation for more information.

_[back to top](#contents)_

## 5. Discussions and suggestions

The best place to ask questions about uibuilder is the [Node-RED Forum](https://discourse.nodered.org/).

Alternatively, use the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements and the [GitHub Discussions page](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) for general questions, suggestions, etc.

Please note that I rarely have time to monitor the [#uibuilder channel](https://node-red.slack.com/messages/C7K77MG06) in Slack any more, it is best to use Discourse or raise an issue.

I do occasionally try to look out for [uibuilder related questions on Stack Overflow](https://stackoverflow.com/search?tab=newest&q=%5bnode-red%5d%20uibuilder) but again, time does not always let me do this.


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
- [Sergio Rius](https://github.com/SergioRius) - thanks for reporting [Issue #121](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/121) and providing [PR #122](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/122) as a fix.
- [Thorsten von Eicken](https://github.com/tve) - thanks for providing [PR #131](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/131) to improve CORS handling for Socket.IO.

Many other people have contributed ideas and suggestions, thanks to everyone who does, they are most welcome.


<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>

Please also check out my blog, [Much Ado About IT](https://it.knightnet.org.uk), it has information about all sorts of topics, mainly IT related, including Node-RED.


_[back to top](#contents)_
