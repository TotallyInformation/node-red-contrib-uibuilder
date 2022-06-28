---
title: uibuilder Technical Documentation
description: >
   uibuilder is a low-code solution for easily building data-driven web sites and web apps in conjunction with Node-RED.
created: 2019-06-16 16:16:00
lastUpdated: 2022-04-09 19:07:40
---

?> These are the docs for uibuilder v5. If you need the v4 or earlier docs, the easiest way is to set up a test instance of Node-RED and manually install the appropriate uibuilder version: `npm install node-red-contrib-uibuilder@4` then use the tech docs links from a uibuilder node.

All you need to start making use of uibuilder is a uibuilder node added to your flows. Select a suitable URL path and deploy. Then click on the "Open url" button to open the new page in a new tab.

Now you can edit the front-end html, JavaScript and CSS files. You can also send messages to your front end and send messages back to Node-RED.

uibuilder comes with some simple default *templates*, front-end code files that define your user interface (UI).
Load a different template if you like, use the editor to customise the UI or the library manager if you need any front-end libraries or frameworks (this adds the appropriate folders to the web server so that you can access them from your UI).

## Getting help and contributing

node-red-contrib-uibuilder is contained in a GitHub repository that you can get to using the icon at the top-right of this page.

Help is available in these documents, the help sidebar in Node-RED and the [GitHub WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki). If you get stuck, you can also create a new topic in the [Node-RED Discourse Forum](https://discourse.nodered.org/tag/node-red-contrib-uibuilder) or in the [GitHub discussion section](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions).

Issues occuring with uibuilder should be raised in the [GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues) but please feel free to discuss in the Node-RED forum first if you like.

WIKI, code (PR's), documentation, and examples are all welcome contributions and I always aim to give credit to contributors. Please see the [contribution guidelines](https://github.com/TotallyInformation/node-red-contrib-uibuilder/blob/main/.github/CONTRIBUTING.md).

## Using uibuilder

* [A first-timers walkthough of using uibuilder](walkthrough1.md)
* [Creating data-driven web apps with uibuilder and Node-RED](web-app-workflow.md)
* [Configuring uibuilder nodes](uib-node-configuration.md)
* [How to configure uibuilder](uib-configuration.md)
* [Changing the root folder (uibRoot)](changing-uibroot.md)
* [uibuilder messages](pre-defined-msgs.md "Catalogue of messages and properties")
* [How & why to use the sender node](sender-node.md)
* [How & why to use the list node](list-node.md)
* [How to use the cache node](cache-node.md)
* [How to define and use Instance API's](instance-apis.md)
* [Using the new ECMA Module front-end client](uibuilder.module.md)

## Developing UI's

Information on using the front-end uibuilderfe library in your own code. Information on using build processes if you need them.

* [The uibuilderfe Library](front-end-library.md)
* [Creating Templates](creating-templates)
* [Browser auto-refresh](browser-refresh.md)
* [Avoiding a build step](front-end-no-build.md)
* [Optimise & transpile (build)](front-end-builds.md)
* [Snowpack as build tool](front-end-build-snowpack.md)
* [Instance-specific API's](instance-apis.md)

## UI Frameworks

Working with uibuilder and specific front-end frameworks.

* [VueJS complexities](vue-complexities.md)
* [VueJS Components](vue-component-handling.md)
* [Svelte](svelte.md)
* W3C Web Components - TBC

## Security

* [Securing uib web apps](security.md "Overview of general web app security with some specifics for Node-RED and uibuilder")
* [Securing Data](securing-data.md "How to use flows and uibiulder middleware to secure your data")
* [Securing apps using NGINX](uib-security-nginx.md "How to use NGINX as a reverse proxy with TLS and identity authentication")

## Developer Documentation

Deep dives into the internals of uibuilder. This is where to go if you need to understand how things work. These documents may lag behind the actual code however, so it is always worth also referencing the current codebase.

* uibuilder node
  * [`nodes/uibuilder.js`](uibuilder-js.md) - Main node definition.
  * [`nodes/uibuilder.html`](uibuilder-html.md) - Node-RED Editor configuration panel for the main node.
    
    This is not developed directly. The actual code to edit is in `src/editor/uibuilder/` and is built using `gulp` scripts.
  
  * [`nodes/lib/uiblib.js`](uiblib-js.md) - A uibuilder-specific utility library.
  * [`nodes/lib/tilib.js`](tilib-js.md) - A generic Node.js utility library.
  * [`nodes/lib/web.js`](web-js.md) - Web interface library.
  * [`nodes/lib/socket.js`](socket-js.md) - Socket.IO communications library.
  * `nodes/lib/sec-lib.js` - Security library. TBC.
  * `nodes/lib/package-mgt.js` - Package management (npm) library. TBC.
  * `nodes/lib/admin-api-v2.js` - v2 Admin API library. TBC.
  * `nodes/lib/admin-api-v3.js` - v3 Admin API library. TBC.

* Front-end
  * [`front-end/uibuilderfe.js`](uibuilderfe-js.md) - Front end library.

    This is not developed directly. The actual code to edit is in `src/editor/front-end/` and is built using `gulp` scripts.
  
* uib-cache node - TBC
* uib-sender node - TBC
* Gulp scripts - TBC

## Testing

Some information on testing uibuilder. Unfortunately, I have no real clue about automated testing and TLD, if you would like to contribute something, please do!

* [Regression Tests](regression-tests.md)

## Other

* [Glossary of Terms](glossary.md)
* [Changelog](changelog) - What has changed between releases. What is currently in-progress/outstanding (the "unreleased" section)
* [Roadmap](roadmap) - All about where uibuilder is going in general, what I think needs doing next and some speculation about longer-term change.
* [Main Readme](uibhome) - This is what appears in [GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder), [npm](https://www.npmjs.com/package/node-red-contrib-uibuilder]) and the [Node-RED flows page](https://flows.nodered.org/node/node-red-contrib-uibuilder).

## Archives

* [v3/4 Changelog](archived/CHANGELOG-v3-v4)
* [v2 Breaking Changes](archived/v2-breaking-changes.md)
* [v2 Changelog](archived/CHANGELOG-v2.md)
* [v1 Changelog](archived/CHANGELOG-v1.md)