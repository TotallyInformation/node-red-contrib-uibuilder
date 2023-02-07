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

# node-red-contrib-uibuilder

A data-driven web page/web app utility for Node-RED. uibuilder aims to provide an easy to use way to create dynamic web interfaces using any (or no) front end libraries for convenience.

uibuilder is rather the opposite of Node-RED's Dashboard. Whereas Dashboard is designed to make it very easy to create a UI but trades that off with some limitations, uibuilder is designed to let you do anything you can think of with any framework (or none) but at the trade off of having to create more of the page structure yourself.

uibuilder should generally also be faster and more resource efficient in use than Dashboard, though that obviously depends on what front-end libraries and frameworks you choose to use.

uibuilder provides communication between the browser and Node-RED server and has many helper features that reduce or eliminate the need to write code to build data-driven web apps.

## Installation

uibuilder is best installed using Node-RED's Palette Manager.

<details><summary>Manual installs and other versions</summary>

To install manually, from a command line on your Node-RED server:

```bash
cd ~/.node-red
npm install node-red-contrib-uibuilder
```

To install old versions:

```bash
cd ~/.node-red
npm install node-red-contrib-uibuilder@v5.1.1
```

To install development branches, please install from [GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder):

```bash
cd ~/.node-red
npm install totallyinformation/node-red-contrib-uibuilder#branchname
```

You will need to restart Node-RED if installing manually.
</details>

## Updates

The current [CHANGELOG](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/CHANGELOG.md) contains all of the changes and requirement details for each version.

Older changes can be found in the previous change documents: [CHANGELOG-V5](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v5.md), [CHANGELOG-V3/V4]([/docs](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/)/CHANGELOG-v3-v4.md), [CHANGELOG-v2](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v2.md), and [CHANGELOG-v2](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v1.md)

## Getting started

Once installed, The following is a typical simple flow to get going.

Add a uibuilder node. Open its settings and give it a "URL" which is used as the identifying name. Close the settings and click on the Deploy button.

Then you can add an inject node for some simple input data and two debug nodes on the two output ports so that you can see everything that is going on. Deploy the flow.

Now re-open the uibuilder node's settings and click the "Open" button to see the resulting web page.

You are now ready to edit the front-end html/javascript/css if you wish and to add logic in Node-RED to provide inputs and handle outputs.

Please see the [First-timers walkthrough](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/walkthrough1) in the documentation the [Introduction Video](https://www.youtube.com/watch?v=IVWR_3cx05A) for more help to get started. Also try out the built-in example flows.

## Examples

Within Node-RED, use the hamburger menu. Click Import. Click Examples. Select the node-red-contrib-uibuilder folder and choose an example.

The templates feature in uibuilder provides working front-end code of various configurations.

Other examples can be found on the [Node-RED Flows site](https://flows.nodered.org/search?term=uibuilder) and the [uibuilder WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). Also see the FAQ's and answered questions on the [Node-RED Forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder).

## Documentation

Please refer to the [Documentation website](https://totallyinformation.github.io/node-red-contrib-uibuilder). This can also be accessed from within uibuilder nodes.

There is a library of "official" [video tutorials on YouTube](https://www.youtube.com/playlist?list=PL9IEADRqAal3mG3RcF0cJaaxIgFh3GdRQ). Other folk have also produced [uibuilder-related content](https://www.youtube.com/results?search_query=uibuilder+node-red).

## Purpose

The purpose of uibuilder is to:

* Support easy methods for creating and delivering data-driven web apps and web pages (also known as web User-Interfaces).
* Be a conduit between Node-RED and a front-end (browser) UI web app.
* Be UI framework agnostic. While VueJS is often used with uibuilder, it isn't a necessary dependency. Indeed no framework is needed to use uibuilder.
* Provide interface/data standards for exchanging data and controls between Node-RED and the web pages.
* Reduce the amount of front-end code (HTML/JavaScript) needed to create and manage a web app.
* Reduce the knowledge required for creating reliable, accessible web apps by providing low-code and no-code features.
* Make it easy to install and serve front-end libraries to support the development of more complex web apps.

## Features

<details><summary>No-code UI's</summary>

uibuilder is still growing towards offering more no-code capabilities like Node-RED's Dashboard extension does. However, it is starting to offer these features via the "new" client available since v5. V6.1 introduced the new `uib-element` and `uib-update` nodes that offer the first usable no-code features.

`uib-element` takes in simple data and outputs configuration data. This can then be sent to the front-end via the uibuilder node. Alternatively, it can be saved and the result used in an initial load. Several simple options such as tables and lists are available in uibuilder v6.1, additional elements and structures will be made available in future versions. The uibuilder front-end client takes the configuration information and dynamically builds HTML elements and inserts them to the web page (or removes/updates as needed).

While this is not the most efficient processing approach (since updates are mostly replacing the whole element which could be quite large for things like big tables), it is very efficient from an authoring perspective. So the `uib-update` node provides a more targetted approach to updating and changing specific attributes and "slot" content for elements.

It is important to note that no front-end, 3rd-party frameworks such as VueJS or REACT are needed for this approach! Everything uses vanilla HTML, JavaScript and CSS under the skin and so is **compatible with current and future web standards**.
</details>

<details><summary>Low-code UI's</summary>

The data that `uib-element` outputs is a format that you can use in your own flows in Node-RED and even in front-end code if desired. It describes a set of HTML UI elements but does not need you to actually write HTML code. The configuration schema is very flexible and even allows you to load configuration data, HTML, scripts, and new ECMA Modules/Components from external files.

The schema and the UI creator functions built into the front-end client are specifically designed to work with current and future HTML standards in order to avoid the kinds of issues commonly encountered when using 3rd-party front-end frameworks (e.g. major version changes forcing rewrites of all of your tooling). So ES Modules, ECMA Components, and future ECMA versions should all be supported.
</details>

<details><summary>Core features</summary>

* Provides a Node-RED node to act as the focus for communications and installation of front-end packages for use in your code.
* Allows as many uibuilder node instances as you like. Each instance allows the creation of many web pages and sub-folders for easy management.
* Each uibuilder node instance provides a private 2-way communications channel between the Node-RED server (back-end) and browser (front-end) UI code.
* Provides a front-end library to do the complex parts of the communications and to help standardise interactions with the Node-RED server.
* Provides templates for front-end code to enable people to get a quick start on creating web apps.
* Allows management and serving of npm packages that provide front-end libraries, consumable easily by front-end code.
* Allows editing of front-end code (designed for small changes, use web development tools generally).
* Supports the use of standard web development workflows.
* Provides a capability to have low-code, configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code without you needing to write code.
* Provides nodes to enable zero-code translation of input data to usable and accessible web elements.
* Allows the creation of a dedicated web service to facilitate independent security.
* Provides a caching capability allowing newly joining clients to receive the latest data and configurations. Joining/leaving clients create notifications in Node-RED.
</details>

<details><summary>Future direction</summary>

The general direction of uibuilder (or associated modules) is likely to include:

* Provide more no-code and low-code UI creation and update capabilities. As of v6.1, these are now starting to be delivered.
* The ability within Node-RED to, for each uibuilder node, run npm scripts such as build processes and to manage instance-level npm packages.
* Be able to install/update/remove instance-level npm packages as can already be done for uibuilder-level packages.
* Provide a "development server" capability that auto-reloads connected clients when code changes are made.
* A UI designer allowing users without HTML/CSS/JS skills to create reasonable web apps without code.
</details>

<details><summary>Feature details and benefits</summary>

* Designed as an alternative to the Node-RED official Dashboard. Without the overheads and restrictions.
* Control everything from the Node-RED admin ui. Edit your front-end resource files, manage front-end packages. No need to access the servers command line.
* Manage startup templates. Internal templates for vanilla HTML, Svelte, VueJS (v2 & v3), and VueJS/bootstrap-vue are provided. Load templates from other repositories via _degit_. Makes it easy to share templates that provide a whole app or just deal with boilerplate.
* Have as many custom user interfaces as you want. Just 1 node is needed for each entry point. Use link nodes to send data from other parts of your flows. An entry point can be contain multiple web pages.
* Has a control interface separate to the message interface. Know when a browser tab connects or disconnects, send cached data, and more.
* Provide a stable _client id_ that identifies a specific browser profile until it is restarted. A _tabId_ is provided that identifies a specific browser tab on a client device.
* Provide information to Node-RED about the client that is sending a msg so that security and other processing can identify the client, the user, and so on.
* Can be a lot lighter in weight and more mobile friendly than the Node-RED official Dashboard.
* Use **any** front-end framework you like. Simply install via the built-in library manager.
* Use without any front-end framework if you prefer. Keep it light and simple. Try this out with the "Blank" template and the `uib-element` node.
* The included front-end libraries (`uibuilder.iife.js`, `uibuilder.esm.js`) provide connectivity to Node-RED and msg event handling along with some helper utility functions.
* Write your own HTML, CSS and JavaScript to define the perfect front-end user interface for your needs. Or define it using a JSON config description.
* Edit your custom front-end code from within the Node-RED Editor. Auto-reload your clients on changes to the code. Great for rapid development. *Note* that this is designed for quick edits, it is recommended to use your normal web development toolchain for larger edits.
* Needs almost no boilerplate in your front-end code in order to work.
* Optional index web page listing of available files.
* Two detailed admin info web pages are included to help authors understand where everything is and what is available.
* Uses Node-RED's own ExpressJS webservers by default. Switch to a custom ExpressJS server if desired. When using a custom server, pages can also include EJB server-side templating.
* Has middleware for ExpressJS (for web services) and Socket.IO (for communications, both at initial connection and per-message) so that you can add your own custom features including security.
* Can create custom API's for each uibuilder instance.
</details>

<details><summary>Current limitations</summary>

* You may need to write some of your own HTML.
* You have to know the front-end library locations for installed 3rd-party packages and edit your HTML accordingly. The `uibindex` admin API (accessible from any node's admin ui) shows you all of the root folders and what the package authors report as the main entry point for all active packages. There is now also a simplified information page for the currently viewed uibuilder node instance, this is access from a button in the configuration panel.

  Note that this is a limitation of `npm` and module authors, not of uibuilder. Unless module authors correctly identify the browser entrypoint for their libraries, uibuilder can only guess.
  
* You cannot yet compile/compress your custom front-end code (HMTL, JS, SCSS, etc.) for efficiency. *This will be added soon.*

  This will use a local package.json file that contains a "build" script. If it exists, uibuilder will expose a build button that will run the script.
</details>

## Questions, issues and suggestions

The best place to ask questions or discuss possible enhancements is the [Node-RED Forum](https://discourse.nodered.org/).

Alternatively, use the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements and the [GitHub Discussions page](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) for general questions, suggestions, etc.

## Contributing

If you would like to contribute to this node, you can contact [Totally Information via GitHub](https://github.com/TotallyInformation) or raise a request in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Pull Requests both for code and documentation are welcomed and the WIKI is open to new entries and corrections (but please let me know if you make a change).

Please refer to the [contributing guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/.github/CONTRIBUTING.md) for more information.

## Developers/Contributors

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
