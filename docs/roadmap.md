---
title: uibuilder Roadmap
description: >
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
lastUpdated: 2022-06-28 21:01:54
---

Is there something in this list you would like to see prioritised? Is there something you could help with? Please get in touch via the [Node-RED forum](https://discourse.nodered.org/). Alternatively, you can start a [discussion on GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) or [raise a GitHub issue](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Please note that I no longer have the time to monitor the #uibuilder channel in the Node-RED slack.

## Aims and the future

### uibuilder aims and overall direction

The purpose of uibuilder is to:

* Support an easy method for creating and delivering data-driven web apps.
* Be a conduit between Node-RED and front-end (browser) UI web apps.
* Be UI framework agnostic. While VueJS is often used with uibuilder, it isn't a necessary dependency. Indeed no framework will be needed to use uibuilder.
* Provide interface/data standards for exchanging data and controls with the UI.
* Enable the creation and management of multiple web apps from a single Node-RED instance.

The core features of uibuilder:

* Provide a 2-way communications channel between the Node-RED server (back-end) and front-end UI code.
* Provide a Node-RED node to act as the focus for communications.
* Provide a front-end library to do the complex parts of the communications in the client browser.
* Provide easy to use templates for front-end code to enable people to get a quick start on creating web apps.
* Allow management and serving of npm packages that provide front-end libraries consumable easily by front-end code.
* Allow editing of front-end code (designed for small changes, use web development tools generally).
* Enable the use of external authentication and authorisation methods and services to control multi-user access to web apps.

The general direction of uibuilder (or associated modules) that I would like to see includes:

* _STARTED_, see [node-red-experimental-nodes](https://github.com/TotallyInformation/node-red-experimental-nodes). A set of extension front-end components with well defined (reusable) data schemas for doing common UI tasks. The defined data schema's would cover both the component content and configuration data so that both could be sent from Node-RED via uibuilder and any return data structures would similarly be well defined.
* _STARTED_, see the new front-end library in the above module. A capability to have configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code.
* A UI designer allowing users without HTML/CSS/JS skills to create reasonable web apps without code.

Information also needs to be provided to enable people to build security, identity, authentication and authorisation. As at v5, the experimental security features in uibuilder have been removed as they were never complete and were holding back other development. Security of web apps is best done using a dedicated service anyway. Typically a reverse-proxy using a web server can be used to provided integrated security and authentication.

### Focus for the near future

The following is the immediate direction. These are not likely to be incuded in v5.0.0 but are likely to be added to v5.1 or maybe a little later.

Current focus (beyond what has already been developed) is on:

* _STARTED_. Demonstrate how nodes can be build that manipulate a web front-end (in similar fashion to Dashboard).
* _STARTED_. Creating a new front-end library. Simplified and more robust, using ES2019 and supporting configuration-driven web interfaces.
* _STARTED_, see [web-components](https://github.com/TotallyInformation/web-components). Creating W3C web components to replace the VueJS ones - especially for the ones baked into the fe code. Noting that v5 already contains a non-Vue toast notification feature.
* _STARTED_. Displaying and enabling updatable packages in the package manager. The data is now in place, the Editor panel needs updating.
* Continuing to improve the technical documentation. Updating details and changes, adding how-to's, moving some things from the WIKI. Improving language consistency.
* Start moving towards ECMA Modules rather than CommonJS.

Next immediate focus will be on:

* Enabling instance npm scripts to be run from the Editor.
* Enable templates to provide examples to the Node-RED example library. Still not sure how this will work.
* Add *option* to auto-install npm dependencies on change of Template (and possibly run an install script).

If you would like to contribute to any of these future features, please get in touch via the Node-RED forum or GitHub so that we can plan things out.

### Longer term focus

* Creating usable components that have standardised data interfaces. So that other developers can produce similar outputs with different frameworks but the data that is exchanged with Node-RED remains the same. These components should make things easy that flow designers might typically want to do (notifications, forms, charts, tables, drag-and-drop, etc.)
* Creating a visual layout generator to bridge the gap between uibuilder and Dashboard. Ideally this would be non-framework specific but this seems a very unlikely goal to hit. Would be happy for this to either use web components, Svelte or VueJS.
* Possibly the addition of a `uib-dashboard` node that uses data-driven composition. As a half-way house between code-driven and visual-layout approaches.

---

## In Progress

To see what is currently being developed, please look at the "Unreleased" section of the [Changelog](changelog)

----

## Next - these are things that need to be done

* Change min node.js version to v14 LTS (in line with Node-RED v3)
  * Node.js v14 features - code updates to leverage the latest features
    * https://nodejs.org/en/about/releases/, https://github.com/nodejs/node/blob/main/doc/changelogs/CHANGELOG_V14.md, https://node.green/
    * [Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
    * [Nullish Coalescing](https://wiki.developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_Coalescing_Operator)
    * [Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DisplayNames)
    * [calendar & numberingSystem for Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
    * Private Class methods (v14.5.1+)
    * WeakReferences (v14.5.1+)
    * Array flat and flat map
    * Optional catch binding
    * Object.fromEntries (helps make an object either from Map or from a key/value array)
    * **ESM IS STILL EXPERIMENTAL**
    * Corepack https://nodejs.org/dist/latest-v14.x/docs/api/corepack.html
    * Diagnostic reports. https://developer.ibm.com/articles/introducing-report-toolkit-for-nodejs-diagnostic-reports/, https://github.com/IBM/report-toolkit
    * Future changes to watch:
      * Top-level await (experimental in v14 - behind flag, full in v18)
      * Diagnostic channels (experimental in v14)
      * AbortController and AbortSignal (experimental in v14)
      * JSON Modules (experimental in v14, full in 16.15.0)
      * Fetch (Experimental 16.15.0, 18.0.0)
      * Object.hasOwn is a static alias for Object.prototype.hasOwnProperty.call (16.9.0)
      * [Error cause](https://v8.dev/features/error-cause) (16.9.0)
      * [Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) (16.6.0)
      * Stable Timers Promises API, RegExp Match Indices, which provide the start and end indices of the captured string (16.0.0)
      * Test Runner module (experimental 18.0.0)
      * [`findLast` and `findLastIndex` array methods](https://v8.dev/features/finding-in-arrays) (18.0.0)

* Improvements to `uib-cache` node
  * Add optional page filter - a cache with a page filter will only send the cache if the replay request is from that page. Page filters need to allow a list of pages and ideally wildcards.

* Extensions to experimental `uib-list` node
  * Add optional page filter
  * Optional cache switch
  * Cope with parent uibuilder node renaming url
  * Switch to use same caching methods as `uib-cache`
  * Removing node sends remove to clients
  * Allow additional attributes
  * Add return msg handling like uib-sender.
  * Move retained data to same mechanism as uib-cache
  * Add help panel
  * Updates should update the original add which should be saved for replay but should instantly output an update
  * Change drop-downs to typed input

* Continue to improve the new `uib-brand.css`
  * Parameterise other aspects such as font-size, typeface, varient colours, flexbox spacing. `
  * Create min version of css.
  * Add syntax highlight properties

* Extensions to new FE Library
  * Add optional page filter to _ui - if `msg._ui.pageName` not matching current page, don't process - probably needs list and wildcard though.
  * Add handling for `_ui.components[n].slots` where slots is an object of named slots with the special name of `default` for the default slot (default must be handled first since it overwrites all existing slots)
  * Option for a pop-over notification to manually reconnect the websocket.
  * Add check to uibuilder.module.js to prevent adding of multiple entries with same ID
  * Add HTML loader capability to _ui handling (see html-loader web component)
  * Allow adding to more locations: 1st child rather than last, next/previous sibling

* Updates to old FE library
  * Add client ID, client version & connections # to initial "ready for content" msg from client->NR
  * Add `msg._ui` processing if possible.
  * Build in socket.io client (as for new fe)

* Updates to uibuilder node
  * Ensure that uibRoot is set to a project folder if projects in use. See [PR#47](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/47) and [Issue #44](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/44)
  * Client connect msg: on port#2 doesn't need server version. Should have client version. Also remove server timestamp.
  * Client connect msg to client doesnt need ip, clientid, connections
  * Use new `uib-brand.css` style library on details pages.
  * Add api to query if a specific uib library is installed (and return version)
  * Add 4th cookie to record the Node-RED web URL (e.g. `http://x.x.x.x:1800/`) since uibuilder can now use a different server, it is helpful if the front-end knows the location of Node-RED itself.
  * Editor:
    * New editor option: Add _uib.clientId|ip to standard messages (off by default)
    * Change drop-downs to typed input
    * Add outdated markers to Editor Library tab. 
      (??Use `https://api.npms.io/v2/package/<packageName>` to highlight installed modules that have updates??)
    * Creating new folder - new folder should be selected after create.
    * Add link to [Configuring uibuilder nodes](uib-node-configuration.md) page.
    * Show installed uibuilder version.
    * Remove scripts/css flags from uibuilder panel, no longer in use (not while old client library still in use)

* Updates to Documentation
  * Tech Docs: Update glossary with ESM, ECMA, UMD, IIFE
  * Split the new client library, move _ui features to separate page.
  * Add message interaction diagram to "pre-defined-msgs.md"
  * Add note to documentation for the library manager that you can install LOCAL folders.
  * Finish [Configuring uibuilder](uib-configuration?id=ltuibrootgtltinstance-urlgt) and [Configuring uibuilder nodes](uib-node-configuration.md) pages.
  * Add some notes about Node-RED's projects feature. It doesn't seem to add a correct .gitignore which should contain `**/node_modules`. Also add notes about the fact that projects creates a disconnect between the flows and the userDir folder.

* New nodes: 
  * `uib-table` - using same template as `uib-list`

* **[STARTED]** Provide option to switch from static to rendering to allow dynamic content using ExpressJS Views.

  Currently available by adding the appropriate ExpressJS option in settings.js.


## Ideas for releases further out

### General

* Allow client id to be set externally. Add Editor option to turn on client id and/or client IP address in standard msgs not just control msgs.
* ? Add client identifier chooser to cache node - allowing use of different msg props to identify a specific client
* Change cache & main nodes to use client id rather than socket id where available. Since that is less likely to change.

* Use [chokidar](https://github.com/paulmillr/chokidar) to send a control msg to the fe when files change. Change the front-end to allow the browser to automatically reload (location.reload()). Put everything behind an optional flag and don't load the chokidar library unless the flag is set. May want an auto-rebuild feature as well.

* Add package.json `style` property to Instance details page and packages list if it exists.

* Add Web Reporting API endpoint(s). Set a header to tell the client where to report to. Reports are JSON and so could be directed out of port 2 as a new control msg type. See https://web.dev/reporting-api/ & https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API.

* Add Notifications API support. See https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API & https://developer.mozilla.org/en-US/docs/Web/API/notification.

* Add option to log http(s) requests to control output port

* See if typedefs.js can be migrated to index.d.ts.

* Switch to [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) for require's with low probability of usage. [ref](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_import_expressions).

* Migrate from commonjs to [ES modules](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_commonjs_json_and_native_modules). (2) [JSON can't be imported directly in ESMs](https://nodejs.org/dist/latest-v12.x/docs/api/esm.html#esm_experimental_json_modules), use createRequire.

* Add funding link to package.json (see `man 5 package.json`)

* Maybe switch package.json reads to [npm/read-package-json: The thing npm uses to read package.json files with semantics and defaults and validation and stuff (github.com)](https://github.com/npm/read-package-json)?

* Introduce standard events: url-change (so that all uib related nodes can be notified if a uib endpoint changes url).

* uibindex change "User-Facing Routes" to "Client-Facing Routes".
  
* Add settings.js options to use different paths/names for middleware files.

* Add socket.io instrumentation server. See https://socket.io/docs/v4/admin-ui/

* Once Node-RED's baseline node.js version has moved passed v12.20, can update `execa` and use dynamic imports (and change README notes on scorecard). Once it has moved into v14, can simplify the socket.js class by reinstating the optional chaining.

* Move socket.io client to dev deps and remove serve from web.js (new library builds it in) - can't do until uibuilderfe is deprecated? Or updated to include (breaking chg)

### Editor (`uibuilder.html`)

* Add all local package.json script entries as links/buttons so they can be run from the editor panel.
  * If `dev` script discovered in local package.json scripts, enable a dev button so that a CI dev service can be spun up (e.g. Svelte). Will need debug output to be visible in Editor?
* Show Socket.io server & client versions
* Show template (instance root) folder
* Extend folder/file management
  * Add the `common` folder to the file editor.
  * Allow renaming of files/folders.
  * Allow editing in the `common` folder not just the instance folder.
  * Add a file upload button.
  * Method to import/export front-end files. Needs ZIP/Unzip functions at the back-end.
* Editor Help: Change output msgs headers to include guidance to say that port 1 is the upper port and port 2 the lower port.
* Check for new versions of installed packages when entering the library manager.
* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.
* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?
* Allow custom locations for delivery folder (normally `src/` or `dist/`) and for api's folder (normally `api/`)
  * Allow the use of `public` as well as `src` and `dist`. Svelte outputs to the public folder by default. Also add warnings if no index.html file exists in the folder in use.
* Method to show output from npm package handling.
* Add a reminder to the Editor help about examples. Add an onclick to that <a> icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.
* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header
* If instance folder doesn't exist - need to mark node as changed to force deploy.
* Introduce standard events: url-change
* Prevent removal of socket.io and uibuilder client modules in the libraries manager.

### Front-End library (`uibuilderfe.js`)

* How to add originator to the eventSend method? via an HTML data- attrib or use mapper?
* Add mapper to map component id to originator & extend `eventSend` accordingly
* Add `onMsg` convenience handler (maybe allow wildcard topics?)
* Add a visual warning/alert if uib cannot connect over websockets. Use toast.
* Move client libraries to separate package `@totallyinformation/node-red-uibuilder-client` - allowing a better package.json definition (see socket.io-client for reference). And more flexible use. Will need to be a dependency of the uibuilder package and needs some changes to load to the correct path. Also allows different versions to be built for different purposes. And map files for min versions.
* Add a standard logging fn to uibuilderfe - allow that to return log statements back to Node-RED via control msgs.

### Front-End new ESM library (`uibuilder.esm.js`/`uibuilder.module.js`)

* Allow add/change to use a.b prop names
* Document `loadScriptSrc` and `loadScriptTxt`
* Add markdown render function
* UI
  * Add prop validation
  * keep track of added ids?
  * Handle script and style types
  * Swap from marked to markdown-it
* ?? Maybe:
  * Add msg # to outgoing messages to act as a sequence number
  * Option to allow log msgs to be returned to Node-RED as uibuilder control messages
  * Option to allow custom events to be returned to Node-RED as uibuilder control messages
  * Do we need a confirmation (ctrl?) msg back to node-red?

### Package Manager Class

* Output npm log to NR log debug level (or maybe trace?)
* When checking for URL to use - scan for a `dist` folder.

### Templates

* Serve instance package.json `dependencies` on `../uibuilder/vendor/` path

  * Or maybe on `./vendor/`? That might be more consistent and avoid other issues/changes?
  
  * Complexity: this would end up with packages installed locally - would the uib central packages be recognised? Maybe use `uibuilder.dependencies` instead?

  * Change '../../templates/template_dependencies' in api v3

  * Update built-in templates to use package.json

* uibuilder version checker - https://github.com/npm/node-semver
* watcher
* Add a new template and example to demonstrate the sender node.
* Template - Docsify CMS
* Allow templates to provide example flows via a uibuilder Node-RED library plugin ([ref1](https://discourse.nodered.org/t/red-library-without-red-editor/61247), [ref2](https://nodered.org/docs/api/library/), [ref3](https://github.com/node-red/node-red-library-file-store/blob/main/index.js))
* Add uibuilder property to package.json - define
  * uibuilder version checker - https://github.com/npm/node-semver
  * required fe packages
  * watch - dict of watches: `{'path':'scriptname'}` or `{['path1',...]:'scriptname'}`
  * add `dependencies` to `../uibuilder/vendor/` path

### uib-sender node

* Track undeployed uib nodes via RED.events
* Store links by node.id not url since url may change
* Bind ctrl-s to save button

### uib-cache node

* On close, delete cache


## *Maybe*

These are some thoughts about possible future direction. They need further thought and design.

### General

* Add HTML loader & Syntax Highlight web components to main package?
* Add `uibuilder` prop to `<uibInstanceRoot>/package.json`
  * `uibuilder.loader` - an array of folder paths - relative to `<uibInstanceRoot>` that would be served using uibuilder's ExpressJS web server. Allowing instance-specific front-end resources. To be used by things like components.
  * `uibuilder.scripts.deploy` - pointing to node.js file to run when the template is deployed.
* _[Superceded by the new config-UI features]_. ~~Add new node to specify component instances to add to the UI. Would need to auto-cache. Will need a way to specify settings - as these will be different for different components - sucggest making this JSON to begin with. Needs a way to know what components are available for a uib instance. Components should specify their settings and provide a default json settings file. Might be able to use JSON Schema? See New Nodes section below.~~
* Add experimental flag - use settings.js and have an object of true/false values against a set of text keys for each feature.
  * Update docs
  * Add processing to nodes to be able to mark them as experimental.
* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's.
* Add client IP address to trace messages on connection.
* Add optional sidebar (or drop-down menu on NR header bar) displaying list of all uib URLs (and link to nodes).
* Improve handling for when Node-RED changes projects.

* Trial use of [web-workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) since majority support goes back to 2014.
  * Create a [Progressive Web App](https://web.dev/what-are-pwas/) (PWA) capable version with [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers) [Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
  
  Enabling semi-offline use so speeding up the whole interface after the first load.
  Also makes more native app-like features available such as mobile content sharing & badges, background downloading, etc.

  Note that service workers don't have access to the DOM but they do act as a network proxy. Global state is not maintained but
  IndexedDB is available for persistence. They don't work on older browsers. See the [Mozilla Service Worker Cookbook](https://serviceworke.rs/)

  Websockets can't be used in a service worker but [Web Push](https://developers.google.com/web/fundamentals/push-notifications) 
  is available for notifications & might be an interesting additional node for uibuilder. 
  See the [push demo from Mozilla](https://serviceworke.rs/push-payload_demo.html). Push payloads can include JSON and binary.

  [Workbox](https://developers.google.com/web/tools/workbox) - library for adding offline support.

  [fxos-components/serviceworkerware](https://github.com/fxos-components/serviceworkerware#serviceworkerware): An Express-like layer on top of Service Workers to provide a way to easily plug functionality.

* Add support for HTTP/2 with auto-push. See [http2-express-autopush - npm](https://www.npmjs.com/package/http2-express-autopush)
* Add support for HTTP/3 and QUIC (available in Node.js v14, in preview with NGINX as at June 2022, websockets over http/3 is defined in RFC9220 in draft at June 2022). https://www.f5.com/company/blog/quic-will-eat-the-internet
* _[Implemented in the new ESM client library]_ ~~Consider changing my custom event handler in uibuilderfe.js to use the `document` DOM element. This then inherits the JS event hander capabilities.~~
* Allow transfer of files via Socket.IO. https://stackoverflow.com/a/59224495/1309986
* Allow switch of log.trace to log.info for advanced debugging (would need new switch in Editor or setting in settings.js:uibuilder)
* New node: allowing a socket.io "room" to be defined. Will need to pick a current main instance from a dropdown (using API)

   * Change FE to allow for rooms.


### Core (`uibuilder.js`)

* _[Implemented as `uib-cache` node]_ ~~Add caching option to uibuilder - as a shared service so that other nodes could also use it - allow control via msg so that any msg could use/avoid the cache - may need additional option to say whether to cache by msg.topic or just cache all msgs. May also need persistance (use context vars, allow access to all store types) - offer option to limit the number of msgs retained~~
* add in/out msg counts to status? Maybe as an option.
* Add option to turn on/off connect/disconnect control msgs
* Add index web page for the `common` folder.

### Templates

* Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?)

* Add option to auto-load npm dependencies on change of Template. [Issue #165](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/165)

* Add example flows - using the pluggable libraries feature of Node-RED v2.1

* Maybe move dependencies and other template meta-data into the template package.json file.
  
  Would require making sure that package.json always exists (e.g. after template change). May need to be able to reload package.json file as well.
  
  Couldn't use the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot. 
  
  Will need matching code in the Editor panel & a suitable API.


### Editor (`uibuilder.html`)

* Move folder management to a popup dialog (to save vertical space)
* Add option to allow new front-end code files to be input via inbound msg.
  Allows a flow to read a file and save to the server. Optional because it could be a security issue. Allow folder name as well as file name.
* Add (advanced) flag to make use of project folder optional.
* Add option to keep backups for edited files + button to reset to backup + hide backup files
* Add npm package delete confirmation - probably via std NR notifications
* When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.
* If `uibRoot` and the browser are on the same client, add an "Edit with VSCode" link to the Files tab
* Add GIT processing? Or maybe just handle via npm scripts?
   * Is git command available?
   * is front-end src folder a git repository?
   * git commit
   * git push

### uib-sender Node

* Allow multi-instance sending - send to multiple uibuilder nodes.
* Include schema checks - filter on available schema's from uib compatible components
* Allow sending to a cache node rather than just a uibuilder node.

### uib-cache Node

* ? Option to constrain cache/cache-clear to socketid/clientid

### New Nodes

* add alternate `uib-dashboard` node that uses web components and data-driven composition.

### Testing

* Look at the possibility of using https://www.cypress.io/ to automate some front-end and Editor testing.


----

# OLD

**Update 2022-01-19**: These are the old entries from the WIKI To Do page. They need tidying up and consolidating into the newer structure.
**Update 2022-06-18**: Now mostly tidied and consolidated. Just a few left that I want to keep for reference.

## Ideas

* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/) - _[Keep for reference]_

* Extend middleware hook feature to allow for different middleware for each node instance
  instead of one for all instances.

* Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end

  Started: script/style is removed if disallowed in settings, uibuilder control msgs dropped (since v1.0.0)





* _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._
