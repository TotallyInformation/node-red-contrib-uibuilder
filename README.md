[![Discussion](https://img.shields.io/static/v1.svg?label=Discussion&message=Node-RED%20Forum&color=green)](https://discourse.nodered.org/tag/node-red-contrib-uibuilder)
[![Static Badge](https://img.shields.io/badge/UIBUILDER_Homepage-0d85d7)](https://totallyinformation.github.io/node-red-contrib-uibuilder)
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

<img class="dhide" align="right"  style="width:124px;" src="front-end/images/node-blue.svg" title="uibuilder icon" />

# node-red-contrib-uibuilder

UIBUILDER for Node-RED allows the easy creation of data-driven front-end web applications.

It includes many helper features that can reduce or eliminate the need to write code for building data-driven web applications and user interfaces integrated with Node-RED.

> [!NOTE]
> UIBUILDER triggers a quality warning in the [Flows scorecard entry](https://flows.nodered.org/node/node-red-contrib-uibuilder/scorecard).
> 
> "Number of Dependencies" is >6 - this is due to the large number of features in UIBUILDER and is expected. Even so, v7 only has 7 dependencies. 1 more is due to be removed in a future release.

## Installation

UIBUILDER is best installed using Node-RED's Palette Manager.

<details><summary>Manual installs and other versions</summary>

To install manually, from a command line on your Node-RED server:

```bash
cd ~/.node-red
npm install node-red-contrib-uibuilder
```

To install old versions, provide the major version number:

```bash
cd ~/.node-red
npm install node-red-contrib-uibuilder@v5
```

To install development branches, please install from [GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder). Branchnames are future version numbers, check GitHub for available branches:

```bash
cd ~/.node-red
npm install totallyinformation/node-red-contrib-uibuilder#v7.1.0
```

You will need to restart Node-RED if installing manually.
</details>

## Compatibility of current release

* Servers:
  * Node-RED: v4+
  * Node.js: v18+ LTS
  * Platforms: Linux, Windows, MacOS, Raspberry Pi, Docker, etc.
* Browsers: 
  * CSS - 0.12% or above of global usage but not Internet Explorer ([ref.](https://browserslist.dev/?q=Pj0wLjEyJSwgbm90IGllID4gMA%3D%3D)). The uncompiled CSS should work in all current mainstream browsers. The compiled CSS (`uib-brand.min.css`) should work in browsers back to early 2019, possibly before. Enforced by [LightningCSS](https://lightningcss.com/).
  * JavaScript - ES6+ so should work in all current mainstream browsers. The compiled JS (`uibuilder.min.js`) should work in browsers back to early 2019, possibly before. Enforced by [ESBuild](https://esbuild.github.io/).

## Updates

The current [CHANGELOG](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/CHANGELOG.md) contains all of the changes and requirement details for each version.

Older changes can be found in the previous change documents: [CHANGELOG-V5](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v6.md), [CHANGELOG-V5](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v5.md), [CHANGELOG-V3/V4]([/docs](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/)/CHANGELOG-v3-v4.md), [CHANGELOG-v2](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v2.md), and [CHANGELOG-v2](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/archived/CHANGELOG-v1.md).

## Getting started

Once installed, The following is a typical simple flow to get going.

1. Add a `uibuilder` node. Open its settings and give it a "URL" which is used as the identifying name. Close the settings and click on the Deploy button.
2. Re-open the `uibuilder` node's settings and click the "Open" button to see the resulting web page.

You are now ready to edit the front-end html/javascript/css if you wish and to add logic in Node-RED to provide inputs and handle outputs. You can also use UIBUILDER's no-code features to create your UI as well or instead.

Please see the [First-timers walkthrough](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/walkthrough1) in the documentation and the [Introduction Video](https://www.youtube.com/watch?v=IVWR_3cx05A) for more help to get started. Also try out the built-in example flows.

## Examples

Within Node-RED, use the hamburger menu. Click Import. Click Examples. Select the node-red-contrib-uibuilder folder and choose an example.

The templates feature in UIBUILDER provides working front-end code of various configurations.

Other examples can be found on the [Node-RED Flows site](https://flows.nodered.org/search?term=uibuilder) and the [UIBUILDER WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). Also see the FAQ's and answered questions on the [Node-RED Forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder).

## Documentation and other links

Please refer to the [Documentation web site](https://totallyinformation.github.io/node-red-contrib-uibuilder). This can also be accessed from within UIBUILDER nodes even without an Internet connection.

There is a library of "official" [video tutorials on YouTube](https://www.youtube.com/playlist?list=PL9IEADRqAal3mG3RcF0cJaaxIgFh3GdRQ). Other folk have also produced [UIBUILDER-related content](https://www.youtube.com/results?search_query=UIBUILDER+node-red).

### Questions, issues and suggestions

The best place to ask questions or discuss possible enhancements is the [Node-RED Forum](https://discourse.nodered.org/).

Alternatively, use the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) for raising issues or contributing suggestions and enhancements and the [GitHub Discussions page](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) for general questions, suggestions, etc.

### Other links

- ![uib](https://github.com/TotallyInformation/node-red-contrib-uibuilder/raw/main/front-end/images/node-blue.ico) [UIBUILDER for Node-RED](https://github.com/TotallyInformation/node-red-contrib-uibuilder)
  - ❓ [Ideas, questions & general help](https://discourse.nodered.org/tag/node-red-contrib-uibuilder) - Ask your question on the Node-RED forum using the node-red-contrib-uibuilder tag.
  - 📁 [Documentation](https://totallyinformation.github.io/node-red-contrib-uibuilder) - Go to the latest documentation.
  - 🧑‍💻 [Flows](https://flows.nodered.org/search?term=uibuilder) - Example flows, nodes and collections related to UIBUILDER.
  - ℹ️ [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki) - More documentation and examples.
  - 📂 [Example Svelte External Template](https://github.com/TotallyInformation/uib-template-svelte-simple) - In case you want to build your own svelte app.
  - 📂 [Example Simple External Template](https://github.com/TotallyInformation/uib-template-test) - In case you want to build your own external template.
  - 📊 [uPlot UIBUILDER extension](https://github.com/TotallyInformation/nr-uibuilder-uplot) - Useful charts but also demonstrates how to build your own extension.
  - 🔨 [Event Handler module used by UIBUILDER](https://github.com/TotallyInformation/ti-common-event-handler) - So you can see some of the inner workings.

- 🔨 [ui library module used by UIBUILDER](https://github.com/TotallyInformation/ui.js) - Can be used stand-alone for turning UI standard config JSON into HTML.

- 🕜 [node-red-contrib-moment](https://github.com/TotallyInformation/node-red-contrib-moment) - Nodes to make use of the MomentJS date/time handling library in Node-RED.

- 🧙 [Alternate Node-RED installer](https://github.com/TotallyInformation/alternate-node-red-installer) - Some scripts and example configs for running Node-RED locally instead of globally and having the userDir as a child folder so that everything can be easily backed up and restored from a single project folder.

- 🧪 [Testbed for Node-RED custom nodes](https://github.com/TotallyInformation/Node-RED-Testbed) - Embodying more up-to-date thinking than the test nodes, a blank playground.
- 🧪 [Test Nodes for Node-RED](https://github.com/TotallyInformation/uib-template-test) - Some test nodes for Node-RED that help you understand how everything works.

- 🚤 [HotNipi Gauge Web Component](https://github.com/TotallyInformation/gauge-hotnipi) - A really nice looking gauge component. Works with Node-RED, UIBUILDER, or stand-alone.

- 🧪 [Web Components Library](https://github.com/TotallyInformation/web-components) - A growing library of useful HTML Web Components. Useable with or without Node-RED & UIBUILDER. Some having specific enhancements for Node-RED but will still work well stand-alone.

- 🧪 [Array Grouper](https://github.com/TotallyInformation/groupit) - Stand-alone function to reshape an array of objects.

## Purpose

The purpose of UIBUILDER is to:

* Support easy methods for creating and delivering data-driven web apps and web pages (also known as web User-Interfaces).
* Be a conduit between Node-RED and front-end (browser) UI web apps.
* Be UI framework agnostic. No framework is needed to use UIBUILDER but it will work with them where desired. UIBUILDER aims to reduce the requirement for a framework by making it easier to work with vanilla HTML/CSS.
* Provide interface/data standards for exchanging data and controls between Node-RED and the web pages.
* Enable the creation and management of multiple web apps from a single Node-RED instance.
* Reduce the amount of front-end code (HTML/JavaScript) needed to create and manage a web app.
* Reduce the knowledge required for creating reliable, accessible web apps by providing low-code and no-code features.
* Make it easy to install and serve front-end libraries to support the development of more complex web apps.

## Features

The core features of UIBUILDER:

* As far as possible, uses only vanilla, native HTML, CSS and JavaScript. Other than the Socket.IO client for communications (which is baked into the front-end library), no other front-end libraries are needed. UIBUILDER stays as close as possible to native HTML to avoid future compatibility issues. However, it does aim to make interaction with native HTML easier.
* Nodes to enable zero-code translation of input data to usable and accessible web elements.
* Capability for low-code, configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code without having to write code.
* 2-way communications channel between the Node-RED server (back-end) and front-end UI.
* A Node-RED node to act as the focus for communications with other nodes for additional ease of use.
* Front-end library to: do the complex parts of the communications in the client browser; make manipulation of the UI easier and more consistent; make it easy to get data back to Node-RED as needed (both automatically and manually).
* Easy to use templates and examples for front-end code to enable people to get a quick start on creating web apps.
* Management and serving of npm packages that provide front-end libraries consumable easily by front-end code.
* Editing of front-end code from the Node-RED Editor (designed for small changes, use web development tools generally).
* Various server middleware and API options for additional custom capabilities.
* A caching capability allowing newly joining clients to receive the latest data and configurations. Joining/leaving clients create notifications in Node-RED.
* A front-end lightweight router for creating Single-Page Apps.
* Have as many `uibuilder` node instances as you like. Each instance allows the creation of many web pages and sub-folders for easy management.
* Each `uibuilder` node instance provides a private 2-way communications channel between the Node-RED server (back-end) and browser (front-end) UI code.
* Supports the use of standard web development workflows.
* Allows the creation of a dedicated web service to facilitate independent security.

<details><summary>No-code UI's</summary>

UIBUILDER continues to expand its no-code capabilities. THe `uib-element`, `uib-tag`, and `uib-update` nodes offer no-code methods for creating and updating data-driven web UI's.

`uib-element` takes in simple data and outputs configuration data. This can then be sent to the front-end via the `uibuilder` node. Alternatively, it can be saved and the result used in an initial load. Several simple options such as tables and lists are available in UIBUILDER v6.1, additional elements and structures will be made available in future versions. The UIBUILDER front-end client takes the configuration information and dynamically builds HTML elements and inserts them to the web page (or removes/updates as needed).

While this is not the most efficient processing approach (since updates are mostly replacing the whole element which could be quite large for things like big tables), it is very efficient from an authoring perspective. So the `uib-update` node provides a more targetted approach to updating and changing specific attributes and "slot" content for elements.

The `uib-tag` node then lets you create ANY single HTML element and so covers all the many things that `uib-element` might not (yet) cover. This even works with web components which are vanilla HTML/JavaScript native enhancements to HTML.

It is important to note that no front-end, 3rd-party frameworks such as VueJS or REACT are needed for this approach! Everything uses vanilla HTML, JavaScript and CSS under the skin and so is **compatible with current and future web standards**.
</details>

<details><summary>Low-code UI's</summary>

The data that `uib-element` outputs is a format that you can use in your own flows in Node-RED and even in front-end code if desired. It describes a set of HTML UI elements but does not need you to actually write HTML code. The configuration schema is very flexible and even allows you to load configuration data, HTML, scripts, and new ECMA Modules/Components from external files.

The schema and the UI creator functions built into the front-end client are specifically designed to work with current and future HTML standards in order to avoid the kinds of issues commonly encountered when using 3rd-party front-end frameworks (e.g. major version changes forcing rewrites of all of your tooling). So ES Modules, ECMA Components, and future ECMA versions should all be supported.

The `ui.js` library is now also available for anyone to use in their own projects and works fully stand-alone without UIBUILDER. It is also baked into the `uib-html` node which turns low-code configurations into HTML from within Node-RED.
</details>


<details><summary>Future direction</summary>

UIBUILDER will continue to be independent of front-end frameworks though it will also continue to be as compatible as possible so that any desired framework can be used with it.

* It will continue to gain more zero-code pre-built elements.
* It will gain improved control over the instance root folder structure and the ability to execute `npm run` scripts defined in the `package.json`.
* More videos!

### Longer term focus

There remains a desire to build a page-builder feature so that people with no coding skills can build great data-driven web apps.

* The documentation quality will continue to improve.
* The number of 3rd-party module dependencies will be reduced. Starting with the eventual removal of `fs-extra` in favour of the native promisified fs library. Followed most likely by `arun`.
* Once Node.js v18 or 20 is the base, the code is likely to be refactored into multiple sub-packages in a mono-repo.

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
* Can create custom API's for each UIBUILDER instance.
* Use the `ui.js` library in your own projects!
</details>

## Contributing

If you would like to contribute to this node, you can contact [Totally Information via GitHub](https://github.com/TotallyInformation) or raise a request in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Pull Requests both for code and documentation are welcomed and the WIKI is open to new entries and corrections (but please let me know if you make a change).

Please refer to the [contributing guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/master/.github/CONTRIBUTING.md) for more information.

You can also support the development of UIBUILDER by sponsoring the development.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/A0A3PPMRJ)

[GitHub Sponsorship](https://github.com/sponsors/TotallyInformation), 
[PayPal Sponsorship](https://paypal.me/TotallyInformation)

## Sponsors

- [@MagicJF](https://github.com/MagicJF)

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
- [Colin J (mudwalkercj)](https://github.com/mudwalkercj) - Thanks for helping with the documentation.
- [Marcus Davies](https://discourse.nodered.org/u/marcus-j-davies) - Many thanks for the encouragement and for the 3d logo.
- [Fabio Marzocca (fmarzocca)](https://discourse.nodered.org/u/fmarzocca)) - Many thanks for help with the design and testing of the uibrouter front-end router library.

Many other people have contributed ideas and suggestions, thanks to everyone who does, they are most welcome.

<a href="https://stackexchange.com/users/1375993/julian-knight"><img src="https://stackexchange.com/users/flair/1375993.png" width="208" height="58" alt="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for Julian Knight on Stack Exchange, a network of free, community-driven Q&amp;A sites" /></a>

Please also check out my blog, [Much Ado About IT](https://it.knightnet.org.uk), it has information about all sorts of topics, mainly IT related, including Node-RED.
