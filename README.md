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
[![CodeQL](https://github.com/TotallyInformation/node-red-contrib-uibuilder/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/actions/workflows/codeql-analysis.yml)
[![Open Issues](https://img.shields.io/github/issues-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/TotallyInformation/node-red-contrib-uibuilder.svg)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues?q=is%3Aissue+is%3Aclosed)

<img class="dhide" align="right" src="docs/images/node-blue-125x125.png" title="uibuilder icon" />

**Please Note** that:

* For v6.0.0, the minimum Node-RED version is now v3. The minimum Node.js version is now v14 LTS (in line with Node-RED v3) - note that the minimum minor version may change to the latest v14 LTS version whenever uibuilder is updated.
* v5.0.0 was a very large change and had breaking changes from v4.1.4, please see the [CHANGELOG](CHANGELOG.md) for details.
* uibuilder follows [semantic version numbering](https://docs.npmjs.com/about-semantic-versioning) - as such, each major number change indicates breaking changes and you should review them carefully before installation.

Older changes can be found in the previous change documents: [CHANGELOG-V3/V4](/docs/CHANGELOG-v3-v4.md), [CHANGELOG-v2](/docs/CHANGELOG-v2.md), and [CHANGELOG-v2](/docs/CHANGELOG-v1.md)

# node-red-contrib-uibuilder

A Node-RED web user interface builder. uibuilder aims to provide an easy to use way to create dynamic web interfaces using any (or no) front end libraries for convenience.

uibuilder is rather the opposite of Node-RED's Dashboard. Whereas Dashboard is designed to make it very easy to create a UI but trades that off with some limitations, uibuilder is designed to let you do anything you can think of with any framework (or none) but at the trade off of having to write your own front-end code.

uibuilder should generally also be a **lot** faster and more resource efficient in use than Dashboard though that obviously depends on what front-end libraries and frameworks you choose to use.

## Purpose

The purpose of uibuilder is to:

* Support an easy method for creating and delivering data-driven web apps.
* Be a conduit between Node-RED and a front-end (browser) UI web app.
* Be UI framework agnostic. While VueJS is often used with uibuilder, it isn't a necessary dependency. Indeed no framework is needed to use uibuilder.
* Provide interface/data standards for exchanging data and controls with the UI.

## Core features

* Provide a 2-way communications channel between the Node-RED server (back-end) and front-end UI code.
* Provide a Node-RED node to act as the focus for communications and installation of front-end packages for use in your code.
* Provide a front-end library to do the complex parts of the communications and to help standardise interactions with the Node-RED server.
* Provide templates for front-end code to enable people to get a quick start on creating web apps.
* Allow management and serving of npm packages that provide front-end libraries consumable easily by front-end code.
* Allow editing of front-end code (designed for small changes, use web development tools generally).
* Provide a capability to have configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code without you needing to write code.

## Future direction

The general direction of uibuilder (or associated modules) is likely to include:

* The ability within Node-RED to, for each uibuilder node, run npm scripts such as build processes and to manage instance-level npm packages.
* Be able to install/update/remove instance-level npm packages as can already be done for uibuilder-level packages.
* Provide a "development server" capability that auto-reloads connected clients when code changes are made.
* A set of extension front-end components with well defined (reusable) data schemas for doing common UI tasks. The defined data schema's would cover both the component content and configuration data so that both could be sent from Node-RED via uibuilder and any return data structures would similarly be well defined.
* A UI designer allowing users without HTML/CSS/JS skills to create reasonable web apps without code.

## Feature details

<details><summary>The key features and benefits are: (Click to show/hide)</summary>

* Designed as an alternative to the Node-RED official Dashboard. Without the overheads and restrictions.
* Control everything from the Node-RED admin ui. Edit your front-end resource files, manage front-end packages. No need to access the servers command line.
* Manage startup templates. Internal templates for VueJS and bootstrap-vue in addition to a plain template are available. Load templates from other repositories via _degit_. Makes it easy to share templates that provide a whole app or just deal with boilerplate.
* Have as many custom user interfaces as you want. Just 1 node is needed for each entry point. Use link nodes to send data from other parts of your flows. An entry point can be contain multiple web pages.
* Has a control interface separate to the message interface. Know when a browser tab connects or disconnects, send cached data.
* Provide a stable _client id__ that identifies a specific browser profile until it is restarted.
* Can be a lot lighter in weight and more mobile friendly than the Node-RED official Dashboard.
* Use **any** front-end framework you like. Simply install via the built-in library manager.
* Use without any front-end framework if you prefer. Keep it light and simple. Try this out with the "Blank" template and the `uib-list` node.
* The included front-end libraries (`uibuilder.iife.js`, `uibuilder.esm.js` or the older `uibuilderfe.js`) provide connectivity to Node-RED and msg event handling along with some helper utility functions.
* Write your own HTML, CSS and JavaScript to define the perfect front-end user interface for your needs. Or define it using a JSON config description.
* Edit your custom front-end code from within the Node-RED Editor. Auto-reload your clients on changes to the code. Great for rapid development. *Note* that this is designed for quick edits, it is recommended to use your normal web development toolchain for larger edits.
* Needs almost no boilerplate in your front-end code in order to work.
* Optional index web page listing of available files.
* Two detailed admin info web pages are included to help authors understand where everything is and what is available.
* Uses Node-RED's own ExpressJS webservers by default. Switch to a custom ExpressJS server if desired.
* Has middleware for ExpressJS (for web services) and Socket.IO (for communications, both at initial connection and per-message) so that you can add your own custom features including security.
* Can create custom API's for each uibuilder instance.

</details>

<details><summary>Current limitations are: </summary>

* You may need to write some of your own HTML.
* You have to know the front-end library locations for installed 3rd-party packages and edit your HTML accordingly. The `uibindex` admin API (accessible from any node's admin ui) shows you all of the root folders and what the package authors report as the main entry point for all active packages. There is now also a simplified information page for the currently viewed uibuilder node instance, this is access from a button in the configuration panel.

  Note that this is a limitation of `npm` and module authors, not of uibuilder. Unless module authors correctly identify the browser entrypoint for their libraries, uibuilder can only guess.
* You cannot yet compile/compress your custom front-end code (HMTL, JS, SCSS, etc.) for efficiency. *This will be added soon.*

  This will use a local package.json file that contains a "build" script. If it exists, uibuilder will expose a build button that will run the script.

</details>

## Contents

<!-- TOC -->

- [node-red-contrib-uibuilder](#node-red-contrib-uibuilder)
  - [Purpose](#purpose)
  - [Core features](#core-features)
  - [Future direction](#future-direction)
  - [Feature details](#feature-details)
  - [Contents](#contents)
  - [1. Additional Documentation](#1-additional-documentation)
  - [2. Getting Started](#2-getting-started)
    - [2.1. Install](#21-install)
      - [2.1.1 Installing front-end libraries](#211-installing-front-end-libraries)
    - [2.2. Simple flow](#22-simple-flow)
    - [2.3. Edit the source files](#23-edit-the-source-files)
    - [2.4. Install additional front-end libraries](#24-install-additional-front-end-libraries)
      - [2.4.1 Using VueJS](#241-using-vuejs)
  - [3. Features](#3-features)
  - [4. Known Issues](#4-known-issues)
    - [Node-RED Flows Library Scorecard](#node-red-flows-library-scorecard)
  - [5. Discussions and suggestions](#5-discussions-and-suggestions)
  - [6. Contributing](#6-contributing)
  - [7. Developers/Contributors](#7-developerscontributors)

<!-- /TOC -->

---

## 1. Additional Documentation

Most of the detailed documentation is moving into the Technical Documentation. This can be accessed on the [GitHub pages site](https://totallyinformation.github.io/node-red-contrib-uibuilder). Or from the button in the Node-RED Editor's configuration panel for any instance of the uibuilder node (url `<node-red-editor-url>/uibdocs/`). You will find the raw versions in the [docs](/docs) folder of this package.

There is some more information and some examples available in the [GitHub WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki).

Also, don't forget that there are example flows built into the Node-RED library that you can import into your flows. And uibuilder has its template feature that lets you load example front-end code.

## 2. Getting Started

If this is all new to you, please do take a look at the *[first-timers walkthough of using uibuilder](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/walkthrough1)*. It aims to take you through, step-by-step, installing uibuilder and creating your first simple web app. If you have any difficulties, please feel free to ask questions on the [Node-RED forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder).

### 2.1. Install

To install the current live version, please use Node-RED's _Palette Manager_.

To install a specific uibuilder development or test branch from GitHub, use `npm install TotallyInformation/node-red-contrib-uibuilder#<BRANCH-NAME>` from the command line on the server, having first changed to the `userDir` folder (normally `~/.node-red`). If you just want the `main` branch which contains the latest development build, you can do `npm install TotallyInformation/node-red-contrib-uibuilder`

To install a specific release from npm, use `npm install node-red-contrib-uibuilder@<VERSION>`. In addition to release versions (e.g. 1.2.2), you can also use `latest` and `v1-last`. Sometimes, `next` may also be available. Check out the [Versions tab](https://www.npmjs.com/package/node-red-contrib-uibuilder?activeTab=versions) on the npm site for available versions.

#### 2.1.1 Installing front-end libraries

You may also want to install some front-end libraries. In particular, you will need to install VueJS and bootstrap-vue if you want to use the various VueJS templates. You should do this using uibuilder's **library manager**.

As of v5, front-end libraries will be installed into the `<uibRoot>` folder. By default, this will be `~/.node-red/uibuilder/`. If migrating from v4 to v5, you will need to reinstall libraries. You can then remove the previous versions from your `<userDir>` folder. It is possible to manually install front-end libraries if you wish. The `<uibRoot>/package.json` file contains additional details regarding the packages that are installed, this is updated automatically.

If installing manually, you will need to restart Node-RED before being able to use the new packages.

### 2.2. Simple flow

Once installed,

1) add a simple flow consisting of a trigger, a uibuilder and a debug node all connected in order.
2) Change the `url` setting of the uibuilder node to something valid.
3) Deploy the changes then
4) double click on the uibuilder node,
5) click on the web page url.

That will show you a simple page that will show you a formatted view of any msg send from Node-RED into the node. No additional libraries or frameworks are needed for that. The only dependencies are to load the `uibuilderfe.js` library, start the library using `uibuilder.start()` and then create a listener for incoming messages. This uses the default `Blank` template.

### 2.3. Edit the source files

From the node's configuration panel in the Editor, click on "Edit Source Files" to see the front-end code. Make some changes to see what happens.

If you need more space for the editor, click on the <kbd>&#x2921;</kbd> button underneath the text editor. To get back, press the same button (which is now highlighted) or the <kbd>Esc</kbd> key.

Click on the <kbd>Save</kbd> button to save changes, <kbd>Reset </kbd> to revert to the saved file, <kbd>Close</kbd> to exit the editor. Note that the close button isn't available while there are outstanding changes, press Save or Reset first. The Editor's red Done button is also disabled while there are still outstanding changes.

You can create a new file and delete files and folders as well with the appropriate buttons. If you delete one of the default `index.(html|css|js)` files and have the _Copy Index_ flag set (in advanced settings), the file will be replaced automatically with the default template file. Useful if you get into a complete mess.

### 2.4. Install additional front-end libraries

Click the "Manage front-end libraries" button. Then click the <kbd>+ add</kbd> button and type in the name of the package as it is defined in npm.

You can also remove installed libraries from here.

The uibuilder _Detailed Information_ API page (link in the configuration panel) shows details of all packages installed, their URL for your html pages and their physical location on the server (so that you can track down the right file to include in your HTML).

#### 2.4.1 Using VueJS

If you want to use the VueJS based templates, you will need to install `vue` and `bootstrap-vue` libraries.

The included [VueJS](https://github.com/vuejs/vue#readme), [bootstrap](https://getbootstrap.com/) and [bootstrap-vue](https://bootstrap-vue.js.org/) templates make for a really easy to use initial setup that is very easy to use but powerful to build any kind of web user interface. The template files should give you some ideas on how to use everything.

_[back to top](#contents)_

## 3. Features

- A single node is used to define an end-point (by its URL path).
  The node can be included in flows as many times as you like - but each instance **must** have a unique URL path name.
- Each node instance gets its own Socket.IO *namespace* matching the URL path setting.
  Note that Socket.IO will efficiently share sockets while keeping traffic separated by namespace.

  The namespace is the uibuilder url (defined in the Editor) with a preceding "/".
- The front-end libraries hide all the complexities of using Socket.IO so that your own FE code is easy to write. It provides a simple event handling system so that you can subscribe to changes and process them as they happen. The default `index.js` file has details and examples of use. The libraries are written so that they can be sourced via html or included via a build step (e.g. webpack).

  Generally, the library will no longer need to be separately initialised. A `uibuilder.start()` function is still available though in case an override is needed.

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

  The content of the message is the same as messages in Node-RED itself. uibuilder can, optionally, add some internal metadata to each msg which can be useful when handling multiple users and dealing with security.
- npm packages can be installed (or removed or updated) using the uibuilder node's Editor ui in Node-RED. This allows you to manage the availability of front-end libraries very easily. No need to have access to the servers command line. Any front-end library that is available as an npm package can be managed this way. Installed packages will be made available to your web app.
- Typically, very little code is needed to create a simple, data-driven web UI. The node's module contains default html, JavaScript and CSS master template files that are copied to your local src folder for you to edit as required. It gives you a simple to follow template that kick-starts your web app development. Additional templates are available (even external ones can be used) that help kickstart your development. You can now also send a configuration message from Node-RED that will create/replace/remove UI elements in your web page. The `uib-list` node is an example node that makes this easier. Additional similar nodes will be added in the future.
- Including a `_socketId` attribute on messages sent from Node-RED will send to that ID only.

  Note that an ID is associated with a specific browser tab and is reset when the page is reloaded or if the page temporarily looses connection.

  The `_socketId` attribute is added to any msg sent from the client to Node-RED.
  See [the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Sending-Messages-to-Specific-Client-Instances) for more information.
- A second output port on the uibuilder node gives access to some control messages.

  This allows additional processing when a client connects or disconnects, an instance is (re)deployed or there is a socket error.

  A common use for this is to send cached information back to a newly connected client (or one that has had the page reloaded). The `uib-cache` node is useful for this.

  Other uses could include outputing some standard information when a new client connects. Or you could use the information to keep utilisation metrics.

  See the _Pre-defined Messages_ page in the Tech Docs for details.
- On installation of uibuilder, a new folder is created within your Node-RED user directory (typically `~/.node-red`) with a fixed name of `uibuilder`.

  If you are using Node-RED's projects feature, the folder will be created within your project folder instead.

  From v4.0.0, you can change the location of this `<uibRoot>` folder by specifying a location in Node-RED's `settings.js` file.

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
- You can serve your front-end files from any subfolder within your `<uibRoot>/<url>/` instance folder. Normally, either the `src` or `dist` sub-folders. Mostly you will stick with the default `src` folder and write your code there. However, if you need a "build" step for any reason, you will probably want to switch to the `dist` sub-folder which should be the target of your build process. If needed, you can use any other sub-folder.
- Any resource (html, css, js, image, etc) placed within the appropriate sub-folder is made available to the browser client. The default URL would be `http://localhost:1880/<url>` (where the path is set as per the point above). Without specifying a specific file name, that URL would load `index.html`. Note that resource URL's take Node-RED's `httpNodeRoot` Node-RED setting into account.
- An additional "common" folder is created in the uibuilder root folder (e.g. `~/.node-red/uibuilder/common`)

  This is made available to every node instance and is used to make common resources available to multiple web apps.

  See the [URI Paths page in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths) for details of all URI's available to your web apps.

  Better still, see the <kbd>uibuilder details</kbd> and <kbd>instance details</kbd> buttons in the uibuilder configuration panel in the Node-RED Editor, these will show pages of more detailed information.
- You can use a separate webserver from the Node-RED internal webserver by specifying a port in `settings.js`

  **The main purpose of this is that it lets you use a reverse proxy to securely expose _only_ uibuilder's endpoints without exposing Node-RED itself.** It also gives you more control over headers and other settings.

  It will still use Node-RED's Admin server but your own front-end code and all of the installed vendor packages and middleware (including Socket.IO) will now use a separate http(s) server and ExpressJS app.

  If you specify https for Node-RED, your custom server will also use https and will automatically pick up the certificate and key files from settings.js. You can override this using the uibuilder settings in settings.js.

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
- Some visual helper functions are now included with the front-end library. The idea being to bridge the complexity gap between the Node-RED Dashboard and uibuilder for novice front-end programmers. See the technical docs for details.

  Initially there is a "toast" feature which overlays notifications on your UI. You can trigger from within your front-end code or you can send a specifically crafted message from Node-RED to trigger toasts.

_[back to top](#contents)_

## 4. Known Issues

These are things to be aware of.

- As of uibuilder v5 and above, it no longer includes its own security processing. Trying to get that right and to cover all of the possible use-cases was stopping further improvements and so was removed. The middleware features and stable client id provide all of the features needed for you to add security that meets your own needs. You are also strongly recommended to use external authentication and authorisation via a reverse proxy service or similar. See the security documentation for more information.

### Node-RED Flows Library Scorecard

The [scorecard for uibuilder](https://flows.nodered.org/node/node-red-contrib-uibuilder/scorecard#) shows a number of minus points. However, it should be noted that these are somewhat spurious.

* **Node.js Version** - the scorecard generally warns that uibuilder does not have the same node.js version requirement of Node-RED itself. This is somewhat misleading since uibuilder generally uses the **current** LTS version of node.js at the time of its update. Since Node-RED updates may happen on a different schedule, it is inevitable that there will be a minor version mismatch. This is a failing of the scorecard.
* **Number of Dependencies** - Scorecard marks this as a warning. However, uibuilder does a LOT for you and so has a higher than average dependency on external modules. At 14, this is still less than some other Nodes. For example, node-red-dashboard shows as only 4 dependencies but really has 28! They don't show because they have been compiled in so only appear as dev dependencies.
* **Dependencies use latest versions** - uibuilder has two dependencies that do not track current releases. These are `execa` and `nanoid`. The latest releases of which only work as a node.js ECMA module. To use this would require significant rewrites of most of uibuilder which isn't feasible. The latest non-ECMA module versions are used.

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
- [Steve Rickus](https://github.com/shrickus) - many thanks for testing, corrections, contributed code and design ideas.
- [Ellie Lee](https://github.com/ellieejlee) - many thanks for the PR fixing duplicate msgs.
- [Thomas Wagner](https://github.com/Thomseeen) - thanks for the steer and PR on using projects folder if active.
- [Arlena Derksen](https://github.com/boisei0) - thanks for suggestions, bug checks and Issue #59/PR #60.
- [cflurin](https://discourse.nodered.org/u/cflurin) - thanks for the cache example.
- [Scott Page - IndySoft](https://github.com/scottpageindysoft) - thanks for Issue #73/PR #74.
- [Stephen McLaughlin - Steve-Mcl](https://discourse.nodered.org/u/Steve-Mcl) - thanks for the fix for [Issue #71](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/71) and for the enhancement idea [Issue #102](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/102).
- [Sergio Rius](https://github.com/SergioRius) - thanks for reporting [Issue #121](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/121) and providing [PR #122](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/122) as a fix.
- [Thorsten von Eicken](https://github.com/tve) - thanks for providing [PR #131](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/131) to improve CORS handling for Socket.IO.
- [meeki007](https://github.com/meeki007) - thanks for supplying various documentation improvements and code fixes.
- [Scott - talltechdude](https://github.com/talltechdude) - thanks for supplying PR #170.
- [Calum Knott](https://github.com/calumk) - Thanks for the tidied up node-blue logo.
- [Harold Peters Inskipp](https://github.com/HaroldPetersInskipp) - Thanks for the logging examples.
- [dczysz](https://github.com/dczysz) - Thanks for reporting [Issue #186](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/186) and helping work through the complex async bug.

Many other people have contributed ideas and suggestions, thanks to everyone who does, they are most welcome.

<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>

Please also check out my blog, [Much Ado About IT](https://it.knightnet.org.uk), it has information about all sorts of topics, mainly IT related, including Node-RED.

_[back to top](#contents)_
