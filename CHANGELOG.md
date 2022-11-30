---
typora-root-url: docs/images
---

# Changelog

## Known Issues

None

## To do/In-progress

Check the [roadmap](./docs/roadmap.md) for future developments.

Note that v5.1.1 had a number of new features that are not complete. They are included to allow people to start to experiment with them and provide feedback. Notably the new client library (`uibuilder.esm.min.js` or `uibuilder.iife.min.js`), the experimental `uib-list` node which is certainly not feature complete and the new `uib-brand.css` style library which needs quite a bit of additional work.

* Check [deepscan](https://deepscan.io/)

* `uib-list` node
  * **Add cache processing to .js file**
  
* `uibuilder` node
  * Editor:    
    * Update the `Advanced > Serve` dropdown list after creating a new top-level folder (to save having to exit and re-enter the panel).
    * settings.js option to allow _ files to show in editor. https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/190.
    * uibindex page
      * Add folders to Vendor Routes table (from `packageMgt.uibPackageJson.uibuilder.packages`).

    * Creating new folder - new folder should be selected after create.
    * Change fixed text to use `RED._` for l8n. See: https://discourse.nodered.org/t/flexdash-alpha-release-a-dashboard-for-node-red/65861/48.
    * Add visual error when changing advanced/Serve to a folder with no index.html.
    * Option for project folder storage.
    * Libraries tab
      * Add update indicator to Libraries tab.
      * Trigger indicator to Libraries to show if new major version available when switching to the tab.

* Old client library
  * **Fix page name processing**.
  * Check connections count https://discourse.nodered.org/t/uibuilder-amazing/40460/55.

* Client library
  * Consider adding a default `msg.topic` option.
  * Consider watching for a url change (e.g. from vue router) and send a ctrl msg if not sending a new connection (e.g. from an actual page change).
  * Fix start options load style sheet https://discourse.nodered.org/t/uibuilder-new-release-v5-1-1-some-nice-new-features-and-illustration-of-future-features/64479/16?u=totallyinformation

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v5.1.1...main)

<!-- Nothing currently. -->

### Breaking Changes

* Minimum Node-RED version is now v3
* Minimum Node.js version is now v14 LTS (in line with Node-RED v3) - note that the minimum minor version changes to the latest v14 LTS version whenever uibuilder is updated.
* Not sure if this is really breaking. However, `uib-cache` nodes were not properly handling cases where, when processing incoming msgs, the chosen "Cache by" msg property was an empty string in the input msg. Previously handling of that case was dependent on the store and type being used. It is now ignored. The common case is where the setting is `msg.topic` and using the default trigger node which has `msg.topic` set to an empty string. Previously that was _sometimes_ recorded and sometimes not. Now it is never recorded.

### Fixed

* `uib-cache`: Custom variable name was being ignored
* `uibuilder`: Library tab might occasionally list a package that wasn't a direct installed dependency. Now resolved. Only packages listed in `<uibRoot>/package.json` dependencies property will be listed.
* `nodes/libs/package-msg.js` `updateInstalledPackageDetails()`: Installations with a large number of installed libraries not correctly reporting their details. Resolved (hopefully) async issue. Was using `async` with `.forEach()` which doesn't work. Changed to use `Promise.all` with a map. Thanks to [dczysz](https://github.com/dczysz) for reporting. Issue [#186](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/186). Issue more complex than originally thought. Ended up doing a 2-stage update of the installed libraries data. First stage is quick and synchronous to allow the appropriate vendor folders to be added to the ExpressJS vendor routes. 2nd stage uses npm to get additional library information.
* Can now stop auto-loading of uibuilder default stylesheet using `uibuilder.start({loadStylesheet: false})`. Issue [#184](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/184).
* Fixed deepscan issues.


### New

* New example: Demonstrating logging methods of messages passed both into and from a uibulder node, to both the Node-RED debug panel and the Web Dev console. Many thanks to [Harold Peters Inskipp](https://github.com/HaroldPetersInskipp) for the contribution.
* New Template: Basic Vue v3 example with no build step required.
* New editor option: Add `msg._uib` to standard messages (off by default). Can be used to help with authentication/authorisation & session management within Node-RED flows. Contains `clientId` & `remoteAddress` and `pageName` properties.


### Changed

* New client (`uibuilder.iife.js` and `uibuilder.esm.js`) improvements
  
  Note that the new clients are now the preferred client libraries. It is best to use one of these rather than the older `uibuilderfe.js` client library. Please note that a couple of features were dropped, namely the VueJS versions of the Toast and alert functions. The same input msgs still work to allow for backward compatibility but they will not trigger bootstrap-vue even if that is installed. Use the [new Dynamic, data-driven content features](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/uibuilder.module?id=dynamic-data-driven-html-content-1) instead.

  * Client now knows whether the browser is online or offline. If offline, it no longer keeps outputing socket.io error messages or warnings. A console warn is given whenever the browser goes online or offline. Going online reconnects the socket.io connection to Node-RED.
  * Client now tracks what the last navigation type was (navigate, reload, back_forward, prerender). Enables the client to know whether the page was a new navigation or simply reloaded. Can be accessed in the client using `uibuilder.lastNavType`.


* `uibuilder` node
  
  * uibuilder can now select any existing folder to serve as the root of your web app. The selector on the advanced tab is now populated with all folders. The folder must, however, contain at least an `index.html` page otherwise an error is logged and no web page will be shown unless you manually include the page name in your browser address bar.
  * The uibuilder node will now create the required `<uibRoot>/package.json` file if it does not exist. Removes some unnecessary warning messages.
  * uibRoot added to settings passed to Editor so that the editor can display and link to server folders (links only work when server is local of course).
  * If running in debug mode, key settings dumped to Editor console.
  * Editor panel improvements:
  
    * The currently installed uibuilder version is now shown on the Advanced tab.
    * The server's `instanceRoot` filing system folder is shown on the Core tab. This is the configuration and front-end code for this instance of uibuilder.
    * The info showing the current web server is now a link to the instance page (same as the Open button above it).
    * The "Server folder" information now shows the currently used serve folder (e.g. src or dist).
    * The `Advanced > Serve` dropdown now shows ALL top-level folders. Note that you have to close and re-open the panel to pick up the new folder.
    * In the help panel: Added a link to the [Configuring uibuilder nodes](uib-node-configuration.md) page. Added link to the new client library page and a note about deprecation of the old client library.
    * Library tab
  
      * Package outdated markers added to Editor Library tab. (_Currently only on Node-RED startup_. Will be improved later.)
      * Package outdated markers are buttons that will update the installation of the package.

* `uib-cache` node

  * More compact context variable settings in Editor panel.
  * Flow/global cache context has node id appended to variable name for safety, can be changed but obviously must be unique.


* `uib-list` node

  * Now uses same context variable settins as `uib-cache` for greater flexibility.
  * Flow/global cache context has node id appended to variable name for safety, can be changed but obviously much be unique.
  * Change drop-downs to typed input

* Various library improvements including some trace and info log msg improvements.
* Tech docs - updated to indicate the the old client library is now functionally stabilised and will eventually be deprecated.


## [v5.1.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v5.1.0...v5.1.1)

### Fixed

* Fixed bug in package management. Thanks to Steve & Andy for reporting. Fixes [#181](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/181)


## [v5.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v5.0.2...v5.1.0)

### Fixed

* Improved module path search to allow an array of locations. Removes spurious warning about socket.io client not being found.
* `/uibuilder/ping` now correctly returns 204 (no content) status not 201.
* `web.js`::`buildHtmlTable` - over-optimised regex broke the table cells, now fixed.
* Connected control message now correctly contains the client id and client IP address. The client id does not change as much as the _socketId, it is saved in browser local storage so will be the same across sessions and multiple windows/tabs.
* `uib-sender` was not using topic defined in settings. If present, that overrides msg.topic.
* `uibuilder` node - Editor: Add library had been over-optimised and wasn't working in the right order. Now fixed. This also fixed a problem with url rename.

### Changed

* `clientId` is now session stable. That means that it does not change unless the client browser is restarted. It is now also included in more messages. For control messages, it will be found as a msg property. For `_ui` related messages, it will be a property under `msg._ui`. Any other uses will appear under `msg._uib`.
* All code now Linted to "Standard JavaScript" with node.js v12 and front-end to ECMA2019. Null/undefined guards put in place.
* Package.json: Changed homepage to point to Tech Docs on github.io.
* Client libraries and css available on `../uibuilder/` path as well as on `./` path for consistency with other server paths.
* Client connect, disconnect and error control messages (uibulder node output port #2) now contain more information. Includes: client version, clientId, Client IP address, page name, number of (re)connections.
* `express-session` and `jsonwebtoken` dependencies removed as no longer in use.

* Editor:
  * Added stylesheet containing a class of `emoji` which provides nicer, cross-platform, colour emojis.
  * Libraries tab: 
    * Change "URL to use:" to "Estimated link:" on the Libraries tab to make it clear that it might not be correct (down to the library author).
    * Added info emoji to package name (links to package homepage).
    * Added url link to estimated library to make it easier to find out if it actually exists and exactly where.

* `uib-cache` node
  * Added option to not replay the cache if the client connection isn't actually new (e.g. if the client is a reconnection after restarting Node-RED).If the control msg recieved contains `msg.connected` and it is >0, that means that the client is reconnecting and this isn't a client page load. _Note that currently, only the new ES module client library populates the `msg.connected` value_. This option is selected by default.
  * The context store type (node, flow, global) can now be selected (only node was previously used).
  * The variable name can now be changed. May be needed if using flow/global stores with multiple cache nodes.

* `package-mgt.js`:
  * Rewrite root package.json and package details processing for more efficiency + prettify package.json output
  * Add outdated (current/wanted/latest) to uibRoot/package.json>uibuilder.packages in prep for update display in Editor

* Old client library `uibuilderfe.js`
  * Connection count, and page name added to initial "client connect" message in line with the new client.
  * The old `uibuilderfe.js` client library is now "functionally stable". It will no longer be updated. Please consider moving to the new library (see below). When v6 is released, the old client library will be deprecated.

### New

* `uib-brand.css` - will eventually be the new default uibuilder CSS. It is light/dark switchable both manually and by browser preference. Still under development, this **WILL CHANGE**, probably quite a bit. There are still some variables that are needed in order to be able to sensible control things like spacing and sizing.

* **New ES Module front-end client library** (`uibuilder.esm.min.js`)

  The new library will only work with web browsers from early 2019 or later (only really impacts if you are stuck on IE11 or on an Apple device that doesn't support iOS 12 or later). It uses the new brand CSS by default.

  Key differences from the old library:
  
  * Supports the new configuration/message-driven features that let you both build and modify web pages dynamically.
  * Can load an entire UI from a JSON file (or JSON response from a web server). Can also do incremental loads and dynamic changes.
  * Incorporates the socket.io client library so you don't need to worry about it ever again!
  * Requires a modern(ish) browser.
  * Has to be loaded as an ES Module.
  * No built-in VueJS features, use the new msg._ui features instead.
  * No need for `uibuilder.start()` in your code any more (nearly always). Often no code needed at all in fact! (Other than loading the library of course).
  * `uibuilder.eventSend()` now has a lot more information attached. It also now uses the `msg._ui` property to hold all of the information (except for the payload which is as-before). This brings it into line with the other _ui handling. Attributes, classes, clientId and custom properties are all now included.
  * New function `uibuilder.ui({...})` allows passing the same data as `msg._ui` from front-end code.
  * The "client connect" uibuilder control msg that is output on port #2 when a client (re)connects, now has additional details from the client: client `version`, `clientId`, client `ip`, number of `connections` since the client last (re)loaded the page. Use to work out whether the client is new or a reconnection. Used by the updated `uib-cache` node.

  See the `uibuilder.module.md` page in the tech docs for all of the features and details for the new library.

  * Clients now report how many times they have connected since last page load. This lets uibuilder know whether the client is reconnecting or connecting for the first time.

  Please use the `uibuilder.esm.min.js` in preference to the `uibuilder.esm.js` version which is only for people needing to do their own bundling. The `min` version includes a `map` so that debugging is as good as (actually better than) using the non-min version.

* **New IIFE Module front-end client library** (`uibuilder.iife.min.js`)

  This is the same as the ES Module client version above but is wrapped as as a standard JavaScript IIFE function which means that it can simply be loaded as a script link (as per the orgiginal `uibuilderfe.js` client library). You should not attempt to load this version of the new library as an ES Module.

  As with the module version above, when using this version, you should no longer manually load the Socket.IO client library and should hardly ever need to call `uibuilder.start`.

  All of the features of the ESM version should work as expected but please note that testing on this client has been limited so far. Please report any errors so that they can be corrected.

* **New Node** - `uib-list`
  
  Consider this to be the first *experimental* node in what will hopefully be a series. It can be sent a message who's payload is an array of strings or an array of an array of strings.

  The node creates a new `<ul>`, `<ol>`, or `<dl>` HTML list according to the settings. In the case of it being sent an array of arrays, the outer array creates a new list entry and the inner array is joined as a comma-separated list. A `<dl>` list however must be given an array of arrays and the first entry in the inner array becomes the `<dt>` entry with the 2nd becoming the `<dd>` entry.

  The node also requires you specify the uibuilder URL that the node links to along with a required HTML element id that is used to identify the element. Optionally, you can also set a parent element by specifying a CSS selector, the list will be attached ot the end of that parent as a new child. Note that if the selector is not unique, only the first found element will be used.

  Instead of outputting to the uibuilder node, you can instead output a message that contains the appropriate `msg._ui` configuration used by the new front-end ES Module library. You can use this to help you build larger and more complex UI's and to help learn about how the configuration-driven UI features work. Such a message could be further processed and then sent to an appropriate uibuilder node.

  One additional feature is that the configuration is retained in the node (until Node-RED is restarted or you re-deploy the node/flow) and whenever a new client connects to the matching uibuilder instance, it will send the complete configuration to the new client. This ensures that client browsers connecting after you have created the configuration will all receive it and so will have matching UI's.

* Runtime
  
  * Each uibuilder node instance issues a tiEvent when:
  
    * Instance setup is completed (`node-red-contrib-uibuilder/${url}/instanceSetupComplete`). The node object is passed as data.
    * A client (re)connects (`node-red-contrib-uibuilder/${url}/clientConnect`). The control msg is passed as data.
    * When a client disconnects (`node-red-contrib-uibuilder/${url}/clientDisconnect`). The control msg is passed as data.
    
    These can be used by any other node that uses the `@totallyinformation/ti-common-events` module. Such as the experimental `uib-list` node.


## [v5.0.2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v5.0.1...v5.0.2)

### Fixed

* Loading pages from sub-folders without adjusting the `uibuilder.start()` parameters was failing. Now fixed. See also [FAQ: uibuilder - multiple pages from 1 node](https://discourse.nodered.org/t/faq-uibuilder-multiple-pages-from-1-node/61031).
* Accidentally made use of a node.js v14 feature (Optional Chaining) but base version is specified as v12. Changed code to v12 compatible until v14 becomes the base.

### Changes

* Tech Docs sidebar menu:
  * Link to beginners walkthrough document added to Tech Docs sidebar.
  * Add link icons to external pages.
  * Remove redundant link to GitHub project page.

* uibindex page: 
  * Changed to use new CSS (light/dark enabled).
  * Configuration Files section needs updating.
  * Further improvements and tweaks.

* Tech Docs updates
  * NEW PAGE: Configuring uibuilder nodes [incomplete]
  * NEW PAGE: Creating Templates [incomplete]
  * Updates for Configuring uibuilder page


## [v5.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v5.0.0...v5.0.1)

Bug fixes only.

### Fixed

* When no settings.js:uibuilder property exists, initial report doesn't have ip/port. Also get `(node:2888) [DEP0118] DeprecationWarning: The provided hostname "undefined" is not a valid hostname, and is supported in the dns module solely for compatibility.` as well as `http://null:undefined or http://localhost:undefined/`
  
  Fixes applied to uibuilder.js and web.js


## [v5.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.1.1...v5.0.0)

**WARNING**: v5 is a very major release and WILL break some deployments. Please check through the changes before deploying. In most cases, opening each uibuilder node in the Node-RED Editor, clicking Done and re-deploying will be enough.

### BREAKING

* **Clear client cookies** - You may get some odd results if you don't because cookie handling as been significantly reworked.

* **Installation of packages** for use in your front-end code has been **moved** from the `userDir` to `uibRoot`.

  Note that _only_ packages installed into the `uibRoot` folder will be recognised.
  
  Unfortunately, this means that you will need to re-install your packages in the correct location. You should uninstall them from the userDir.

  By default: userDir = `~/.node-red/`, uibRoot = `~/.node-red/uibuilder/`. However, both can, of course, be moved elsewhere.

  uibuilder will automatically create a suitable `package.json` file in `uibRoot`. That file not only lists the installed packages but also has a custom property `uibuilder` that contains metadata for the uibuilder modules. Specifically, it lists all of the necessary detailed data for the installed packages.

  The files `<uibRoot>/.config/packageList.json` and `<uibRoot>/.config/masterPackageList.json` are no longer used and may be deleted.

  You can now install not only packages from npmjs.com but also from GitHub and even local development packages. @scopes are fully supported and versions, tags, and branches are supported for both npmjs and GitHub installs.

* **Removal of Security Processing** - The built-in security features of uibuilder have now been removed.

  This is because I was not getting any closer to a design that was robust and safe and it was having a serious impact on development.

  The recommendation is that you use _external_ security processing via a reverse proxy service (e.g. NGINX). I will be trying to provide some documentation for this.

  Alternatively, you can still provide security processing by making use of the various middleware features - see the `<uibRoot>/.config` folder for templates.

  Because of this, the security settings part of the Editor config panel has been removed. This included the use security flag, session length, JWT secret and auto-extend flag. If you have been using the `vNext` development branch, the Security tab has been removed.

* **Peer installation of VueJS and bootstrap-vue yet again removed**. Since these now need to be in the `uibRoot` folder which
  we don't necessarily know at preinstall time.

  We will be looking at another alternative method. Now that template switching is even more powerful and so is 
  package management, it is likely that we will build something into the template installation process.

  Until then, please install the `vue` and `bootstrap-vue` packages via the uibuilder library manager if you need them.

* **.config folder templates** - In previous versions, any files in the master templates for the `<uibRoot>/.config` folder would be copied when Node-RED (re)starts - however, they would not overwrite existing files. From v5, the master .config templates have been renamed to end with `.js-template` and these will now ALWAYS overwrite whatever is in the `<uibRoot>/.config` folder whenever Node-RED (re)starts. That way, you always have easy access to the latest templates.

  In addition, some of these templates have significant changes and you should review the new templates before going live with uibuilder v5. You can (and should) also safely delete any `.config/*` files you are not using.

  In particular, the `masterPackageList.json` and `packageList.json` files are no longer needed or used and should be deleted.

* **URL cannot be "uibuilder"** - As this url is now used by various services, allowing it would potentially create name clashes and hard to debug errors. If you have an endpoint named "uibuilder", please rename it to prevent problems.

* **Clear any old cookies** - Cookie handling has changed for v5 (see the details below). New cookies are clearer and last only for the current browser tab session. You should clear out any old cookies that have been saved by your browser for each uibuilder app URL.

* **Minimum Node.js version supported is now v12.20**. Minimum browser version remains the same and must be one that supports ES6.

* **New Dependency** - I've finally given in and included the socket.io-client package in the dependencies. The reason for this is that the server does not correctly include the client package as expected. While it works if you are including the client using a `<script src="...">` line in your `index.html`, it _does not work_ if you are using web components or a build step with an import statement. So in that instance, you should use.

   Note the change of path when writing your HTML:

   ```html
   <script src="../uibuilder/vendor/socket.io-client/socket.io.min.js"></script>
   ```

   Though the old path works as well.

   However, if you want to use uibuilder with web modules or with a build step and wish to `import` socket.io client, you **must not** load via a script tag. Instead, in your JavaScript or framework code:

   ```js
   import { io } from '../uibuilder/vendor/socket.io-client/socket.io.esm.min.js'
   ```

   Better still, use the module compatible version of the uibuilderfe client `uibuiderfe.mod.min.js` or `uibuiderfe.mod.js` which will import the correct socket.io client for you.


### New

* **New layout for the Editor panel**

  This is a much cleaner and clearer layout. It also blocks access to parts of the config that don't work until a newly added node has been Deployed for the first time so that its server folder has been created.

  There are also some additional error and warning messages to make things clearer.

* **New node `uib-sender`** - this node allows you to send a msg to any uibuilder instance's connected front-end clients.

  That means that it is pretty much the same as sending a message directly into a uibuilder node.

  You select the instance of uibuilder you want to use by selecting an existing uibuilder URL from the dropdown.

  You can also select whether you want input messages to go straight to the output port as well. 

  Or, more usefully, you can allow "return messages". This allows a front-end client to send a message to node-red with some pre-defined metadata added that will route the message back to the `uib-sender` node. In this way, the sender node can be used as a semi-independent component.

  Note that this same method can be used by ANY custom node, check out the code to see how it works. It requires the use of an external, shared event module [`@TotallyInformation/ti-common-event-handler`](https://github.com/TotallyInformation/ti-common-event-handler). The msg metadata looks like: `{ _uib: {originator: <sender_node_id>}, payload: ... }`. The sender node id is just that, the Node-RED node id for the sender node instance.

  The `uibuilderfe.js` library has been updated to allow easy use of the `originator` property for `uibuilder.send()`. See below for details.

  There is a new page in the Tech Docs on using the sender node.

* **New node** `uib-cache` - this node allows you to cache input messages in various ways and recognises uibuilder's 
  cache control messages so that a client browser (re)connecting to a web page will automatically get a copy of the cached pages.
  See the Tech Docs for details. An example flow is included in the uibuilder examples library.

  Note that you can use this node without uibuilder if you want to.

  There is a new example flow demonstrating the use of the cache node.

* **New Feature** _Msg send middleware_. You can now add a custom middleware file `<uibRoot>/.config/sioMsgOut.js`. The exported function in it will be called every time any msg is sent from any uibuilder node to any connected client. Please see the template file for more details. This rounds out the ExpressJS and other socket.io middleware (connect and on msg receipt) and helps make up for the removal of the uibuilder security features by allowing you to create your own bespoke identity and authorisation processing.
  
* **New Feature** _Instance API's_. You can now define your own API's to support your front-end UI. These run as part of the Node-RED server and can be called
  from your UI, or indeed from anywhere with access to the Node-RED server's user endpoints.

  You can add any number of `*.js` files to a folder `<uibInstanceRoot>/api/`. Each file will be loaded into the uibuilder instance and tested to make sure that it contains either a single function or an object containing functions who's property names match either an HTTP method name (`get`,  `put`, etc) or the generic `use`.

  Such functions are added to the instances router. See the Tech Docs for more information on how to use the instance API's.

  *Note that, because such API definitions reside in a potentially user-facing folder and may be significant security risks, their use is controlled by a flag in Node-RED's settings.js file `uibuilder.instanceApiAllowed`. This must be set to `true` for API's to be loaded.*

* **New Feature** - Added a version checker that allows uibuilder to notify users if a node instance must be updated due to a change of version.

* **New Feature** - A default CSS style sheet has been introduced. Either include in your `index.css` file as `@import url("./uib-styles.css");`. Or in your `index.html before the reference to `./index.css` as `<link type="text/css" rel="stylesheet" href="./uib-styles.css" media="all">`.

  Currently this contains some `:root` classes defining colours and a switcher that picks up whether your browser is set to light or dark themes. 

  It also has a number of classes that style the toast notifications if you are not using `bootstrap-vue`.

  Add the `uib` class to your `<body>` tag in `index.html` to pick up the full styles for your page. If you use this, your page will switch between light and dark modes depending on your browser settings. Note that, when using bootstrap-vue, these styles are ignored.

  The style sheet file may be found in the `front-end/src/uib-styles.css` package folder.

* **New Feature** - HTTP Ping. The uibuilder server now has a new endpoint `../uibuilder/ping` that will return a 201 status code (No Content). The client has a new function `uibuilder.setPing(ms)` that will call that endpoint either once (`ping(0)`) or every n milliseconds (`ping(n)`). You can use this to check whether the server is responding. But more usefully, you can use it to help keep alive a security session.

  The function also fires an event that you can listen for:

  ```javascript
  uibuilder.setPing(3600000) // Once an hour
  uibuilder.onChange('ping', function(data) {
    console.log('pinger', data)
  })
  ```
  
* **Extended Feature** _Package Management_ - You can now install not only packages from npmjs.com but also from GitHub and even local development packages. @scopes are fully supported and versions, tags, and branches are supported for both npmjs and GitHub installs.

  Note that _only_ packages installed into the `uibRoot` folder will be recognised.

  Also note that if you manually install a package rather than using the library manager, you will need to restart Node-RED.

* **Extended Feature** - Added uib version to the connect msg to clients and a warning in the client console if the client version not the same as the server.

* **Extended Feature** - Now allows socket.io options to be specified via a new property in `settings.js` - `uibuilder.socketOptions`. See the [discussion here](https://discourse.nodered.org/t/uibuilderfe-socket-disconnect-reason-transport-close-when-receiving-json-from-node-red/52288/4). The Tech Docs have also been updated.

* **Extended Feature** -  If using a custom ExpressJS server for uibuilder, allow different https settings (key and cert files) from Node-RED itself. Uses a new property  in `settings.js` - `uibuilder.https`.

* **uibuilderfe library**

  * **New Feature** - Received cookies are now available as an object variable key'd on cookie name. `uibuilder.get('cookies')`.

  * **New Feature** - A new unique client id set by uibuilder is available as a string variable. `uibuilder.get('clientId')`. This changes if the page is reloaded but not if the client loses then regains a Socket.IO connection (where the socket id will change). It is passed to the client as a cookie. The client sends it to the server as a custom header but only on Socket.IO polling requests since custom headers are not available on websocket connections). It also adds it to the `socket.handshake.auth.clientId` property which should always be available to the server event handlers. _Caution should be used if making use of this feature since it is likely to change in the future_. See the updated `sioMiddleware.js` for an example of use. The client id is also included in the uibuilder control msgs output to port #2 on a client connect and disconnect. The ID is created using the `nanoid` package.

  * **Extended Feature** - Toast notifications (notifications that overlay the UI) are now available even without VueJS and bootstrap-vue. They can be styled using the `uib-toaster`, `uib-toast`, and `uib-toast-head` classes when not using bootstrap-vue. Toast notifications can be set either by a standard msg from Node-RED or by calling `uibuilder.setToast(msg)` (where the msg matches the same format used from Node-RED). Internal uibuilder visual notifications will also use this mechanism. Notifications auto-clear after 10s (used to 5) unless otherwise controlled via the options.

    There is a new example flow to illustrate the use of toasts.

* **New Example Flows**

  * *uib-sender* - How to use the uib-sender node. A new flow tab. Based on the blank template so does not need any libraries installing.
  * *uib-cache* - How to use the uib-cache node. A new flow tab containing two examples, one with and one without uibuilder. The uibuilder example is based on the blank template so does not need any libraries installing.
  * *toast-notifcations* - A group containing 2 uibuilder nodes (with empty URL's) and a bunch of inputs for testing Toast notifications. One of the uibuilder nodes uses the blank template (so no libraries needed), the other uses VueJS and bootstrap-vue.
  * Other example flows have been updated to remove the default URL to ensure that duplicate folders are not accidentally created on import. In addition, the MoonJS example has been removed as it was out-of-date.

### Changed

* Cookie handling has changed for the better. There are 3 cookies set by uibuilder: `uibuilder-namespace` (what SockeT.IO needs to communicate), `uibuilder-client-id` (see new features above), and `uibuilder-webRoot` (if you are using `httpNodeRoot` in settings.js). Each is set as a session cookie which means that if you close the window/tab showing your UI, the cookies are deleted. However, if you are being super-strict about EU and California law, you should inform your users that they exist. The cookies are limited to the exact path for the uibuilder instance they come from so there shouldn't be any cross-contamination. However, you should clear any old cookies when upgrading to uibuilder v5 from v4 or before. The cookies do not capture or share any client data and they cannot be used for tracking.

  Custom headers are also added by uibuilder. These are only accessible via XHR API calls, not by uibuilderfe itself. `x-powered-by` (set to `uibuilder`), `uibuilder-namespace`, and `uibuilder-node` (the node id of the uibuilder node). In addition, uibuilder sets `X-XSS-Protection` to `1;mode=block` and `X-Content-Type-Options` to `nosniff` for added security. You can, of course, override all of these using custom middleware.

  The addition of the `uibuilder-webRoot` cookie should now mean that you very rarely need to pass startup parameters (except for the Vue app) to `uibuilder.start()` as the library should now be able to work everything out for itself.

* uibuilder nodes now show the url in angle-brackets. If the url is not defined, `<no url>` shows. If the node has a name, this is shown before the url. e.g. `My UI <myui>`. If you want to have the url show on a different line to the name, add ` \n ` to the end of the name.

* When adding a new uibuilder node, the url is now blank. This helps prevent accidentally creating two nodes with the same url which is confusing to recover from. As a blank url is not a valid configuration, the red triangle will show.

* When copying and pasting a uibuilder node, the pasted node(s) will have their URL changed to blank to prevent nodes with duplicate url's being deployed.

* Improvements to the "uibuilder details" page should make it easier to read. The data for ExpressJS Routes is much improved.

* Improvements to the "instance details" page. Now includes the ExpressJS routes for that instance.

* Improved uibuilder logo, many thanks to [Calum Knott](https://github.com/calumk).

* Editor panel

  * Improvements to the Editor help panel. Should hopefully be clearer and includes all of the settings and custom msg properties. Now uses a tabbed interface.
  * File editor now excludes `.git/**`, `.vscode/**`, `node_modules/**` and `_*`.
  * When editing the configuration for a uibuilder node, if the URL is invalid or the server folder hasn't yet been created, you cannot access various parts of the panel.
  * **ctrl-s** - in the file editor, pressing <kbd>ctrl</kbd>-<kbd>s</kbd> will save the file rather than trying to save the web page. If, like me, you have a strong muscle memory for saving using ctrl-s, this should save you a LOT of annoyances. 😁

* `uibuilderfe.js` client library updated to allow for the use of an `originator` metadata property. This facilitates routing of messages back to an alternative node instead of the main uibuilder node.

  There are three ways to make use of this:

  * Use the new `uibuilder.setOrigin('<sender_node_id>')` function. This will then route ALL messages from the client back to the specified node. This is of marginal use because the main use-case for the property is to automate routing of data to/from web components of which there are likely to be several on a web page.
  * Use the new optional override parameter for the send function. `uibuilder.send(msg, '<sender_node_id>')`. This will send this one message back to the specified node. It will override the `setOrigin`. The utility `uibuilder.eventSend()` method (that lets you easily send a msg back to Node-RED from a DOM event) has also been updated to allow the originator parameter.
  * Manually add the metadata to the node `{ _uib: {originator: <sender_node_id>}, payload: ... }`. This is not generally recommended as it is error prone. However, if writing custom front-end components, you may want to include the origin property as an option to allow end-to-end automatic routing of messages to/from your component instances.

  See the new `uib-sender` node details above for an example of using the `originator` property. That node adds the property to its received msgs before sending to your connected clients.

  Note that at present, control messages from the front-end cannot be routed to a different originator node, they all go to the main uibuilder node. This will be reviewed in a future release. Let me know if you think that it is needed.


* Added documentation for Socket.IO middleware and error handling.

* Added socket.io-client as a dependency and use it where possible - this simplifies access to the client library, especially when using uibuilderfe as a module. It will also help people doing their own build step and wanting to bundle the socket.io client and uibuilderfe library.

* Minor improvements to the  `.config` middleware templates.

* Improved logging for npm commands in library manager.

* Added client IP address to client connect & client disconnect control msgs

* **Removed Features** - all security processing has been removed from uibuilder along with the appropriate settings. Please use the ExpressJS and Socket.IO custom middleware features instead. These can be combined with external authentication and authorisation services such as a reverse proxy.


### Internal and development improvements

* Shared event handler implemented. This enables external nodes to send and receive data to/from uibuilder front-end clients.

* Gulp implemented

  *  initially for composing the `uibuilder.html` from the contents of `src/editor`
  *  and to replace the previously manual minify step for `uibuilderfe.js`
  *  _other tasks likely to be added in the future to make more efficient code and ease the release/publish process_.

* New eslint rulesets implemented & config restructured. Along with the .html file decomposition, this makes for a much more accurate linting process.

* Massive number of minor code improvements to `uibuilder.html` and `uibuilder.js` & to the supporting libs and `uibuilderfe.js` thanks to the impoved linting.

* Removed deprecated functions.

* Remove old console.log statements used for testing and no longer required.

* Even more massive restructuring of `uibuilder.js`. 

  * A lot of the core logic now moved into dedicated modules, each containing a singleton class.
  * Removing the need for the `node` object. This meant the use of some arrow functions to be able to retain the correct context in event handlers and callbacks.
  * Destructuring the big exported function into a series of smaller functions. Makes the code a lot clearer and easier to follow. Also helped identify a few bits of logic that were not quite sane or not needed at all (the result of evolutionary growth of the code).
  * Using named functions throughout should make future debugging a little easier.
  * npm package handling moved to a separate singleton class in `package-mgt.js`

* Removed `inputHandler` function from `uiblib.js`. Code folded into the `inputMsgHandler` function in `uibuilder.js` which has been destructured so is small enough to have it as a single function.

* Package management rewritten. Should be faster and uses async/Promise functions.

* Removed `uib.masterStaticDistFolder` and `uib.masterStaticSrcFolder`, no longer required. Only a distribution folder now gets served. Source folder will never be served. This is defined in `uib.masterStaticFeFolder`. If the folder cannot be accessed, uibuilder throws an error.

* Editor changes

  * Added a version checker that allows uibuilder to notify users if a node instance must be updated due to a change of version.
  * Minified the Editor panel html file (using Gulp) - should load faster now.

* v3 admin API changes

  * Moved v3 admin API to its own module (`libs/admin-api-v3.js`) and changed to be an ExpressJS router instance.
  * Moved the setup from uibuilder.js to web.js
  * New v3 admin API command added to list all of the deployed instances of uibuilder. Issue a GET with `cmd=listinstances`. This allows other nodes to get a list of all of the uibuilder instance URL's and the ID's of the nodes that create them. See the `uib-sender` node's html file for details.

* v2 admin API changes

  * Moved v2 admin API to its own module (`libs/admin-api-v2.js`) and changed to be an ExpressJS router instance.
  * Moved the setup from uibuilder.js to web.js

* `web.js` changes

   * Both admin and user routes restructured, making use of Express.Router's to improve layout and control.
   * Setup of v3 admin API moved to `web.js` class module (out of uibuilder.js).
   * Setup of v2 admin API moved to `web.js` class module (out of uibuilder.js).
   * New `web.dumpRoutes(print=true)` method added to `web.js` - dumpRoutes outputs a summary of all the relevant ExpressJS routes both for uib user facing web and Node-RED admin web servers. Also added individual methods: `web.dumpUserRoutes(print=true)`, `web.dumpAdminRoutes(print=true)`, and `web.dumpInstanceRoutes(print=true, url=null)` (where passing a uib url will just dump that one set of routes).
   * Removed the separate `serve-static` npm package. This is now built into ExpressJS and not required separately.
   * Removed the separate `body-parser` npm package. This is now built into ExpressJS and not required separately.
   * Moved the user-facing API's to web.js from uibuilder.js and moved to their own Express.Router on `../uibuilder/...`.
   * Added a new `this.routers` object - this helps with uibuilder live configuration documentation as it records all of the ExpressJS Routes that uibuilder adds.

* Redundant security code files moved to an `archive` folder.

### Fixed

* URL validation should now work as expected for all edge-cases.
* Fixed the problem that required a restart of Node-RED to switch between `src` and `dist` folder serving.
* Fixed Issue [#159](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/159) where sioMiddlware.js wasn't working due to the move to Socket.Io v4.
* Fix issue reported in Discourse of an error in masterMiddleware when setting headings. Corrected heading syntax for ExpressJS v4.
* Client connect and disconnect msgs not being sent to uibuilder control port (#2). NOTE: As of Socket.io v4, it appears as though the disconnect event is received _after_ the connect when a client is reconnecting. You cannot rely on the order.
* Fixed CORS problems after move to Socket.IO v4. (NB: CORS is defaulted to allow requests from ANY source, override with the `uibuilder.socketOptions` overrides available in settings.js).
* A number of hard to spot bugs in `uibuilder.html` thanks to better linting & disaggregation into component parts
* Fixed an issue when removing uibuilder nodes caused by the move to socket.io v4. Should fix the failure to remove unused uib instance root folders and fix renaming problems as well.
* URL rename failed if user updates template before committing url change. This is now blocked.
* File editor failed if the node hadn't been deployed yet. Blocked if instance folder hasn't yet been created.
* Change degit call to turn off cache which was producing a `could not find commit hash for HEAD` error. See [degit Issue #37](https://github.com/Rich-Harris/degit/issues/37). Partial fix for [Issue #155](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/155).
* If deleting a node that hasn't been deployed, a delete folder warning is given - add check to see if the folder actually exists before giving the error.
* If using Node-RED Docker with recommended install, uib couldn't find the Socket.IO client folder to serve. [Issue](https://discourse.nodered.org/t/uibuilder-the-next-step-3rd-party-comms-with-a-uibuilder-front-end/51684/19?u=totallyinformation). Extra check and cleared warnings added.
* Spurious instance folder rename when it wasn't needed.
* Bad cookie handling!
* Copy/paste of uib nodes detected correctly, url forced to blank and url change process surpressed - prevents several bugs
* Correct template now loaded when new instance deployed - fixes copy/paste where copied node had non-default template
* Fixed folder not deleted when new deploy is followed by delete of node







## Experimental and partially working new features

**WARNING**: _Consider these features **experimental**, some parts may not work and might even cause Node-RED to crash if used. Do not yet use on production._

### NOT YET FULLY WORKING

- Added configuration option to add browser/proxy caching control to all static assets - set the length of time before assets will be reloaded from the server. This may sometimes significantly improve performance in the browser. It depends on the performance of your server and the complexity of the UI.

  Added on options variable for serve-static to allow control of caching & other headers. `uib.staticOpts`.

  Some static folders are served at module level and so don't have access to instance settings. Would likely need to have different settings on global serves from instance ones. _Needs more thought_.

  This lets you control caching of your "static" assets like JavaScript, HTML, CSS, Images and any installed front-end library resources (Vue, etc).

  Note that this is **not** for caching the msg's coming through the node, see the caching examples in the WIKI for that.

- If you use Node-RED's projects feature, restart Node-RED after changing projects otherwise uibuilder will not recognise the new root folder location.
  
----

Because of the many changes in v5, the v3/v4 changelog has been moved to a separate file: [v3/v4 Changelog](/docs/CHANGELOG-v3-v4.md).
Similarly, older chanegs are in: [v1 Changelog](/docs/CHANGELOG-v1.md), [v2 Changelog](/docs/CHANGELOG-v2.md).

----

## Types of changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.
