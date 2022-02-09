---
title: uibuilder Roadmap
description: >
  This page outlines the future direction of uibuilder. Including specific things that will almost certainly happen as well as more speculative ideas.
created: 2022-02-01 11:15:27
lastUpdated: 2022-02-01 11:31:35
---

Is there something in this list you would like to see prioritised? Is there something you could help with? Please get in touch via the [Node-RED forum](https://discourse.nodered.org/). Alternatively, you can start a [discussion on GitHub](https://github.com/TotallyInformation/node-red-contrib-uibuilder/discussions) or [raise a GitHub issue](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues).

Please note that I no longer have the time to monitor the #uibuilder channel in the Node-RED slack.

## Aims and the future

### uibuilder aims and overall direction

The purpose of uibuilder is to:

* Support an easy method for creating and delivering data-driven web apps.
* Be a conduit between Node-RED and a front-end (browser) UI web app.
* Be UI framework agnostic. While VueJS is often used with uibuilder, it isn't a necessary dependency. Indeed no framework will be needed to use uibuilder.
* Provide interface/data standards for exchanging data and controls with the UI.

The core features of uibuilder:

* Provide a 2-way communications channel between the Node-RED server (back-end) and front-end UI code.
* Provide a Node-RED node to act as the focus for communications.
* Provide a front-end library to do the complex parts of the communications.
* Provide templates for front-end code to enable people to get a quick start on creating web apps.
* Allow management and serving of npm packages that provide front-end libraries consumable easily by front-end code.
* Allow editing of front-end code (designed for small changes, use web development tools generally).

The general direction of uibuilder (or associated modules) is likely to include:

* An extensible security model.
* A set of extension front-end components with well defined (reusable) data schemas for doing common UI tasks. The defined data schema's would cover both the component content and configuration data so that both could be sent from Node-RED via uibuilder and any return data structures would similarly be well defined.
* A capability to have configuration-driven (data-driven) UI's. Creating a framework for describing a UI and translating to actual code.
* A UI designer allowing users without HTML/CSS/JS skills to create reasonable web apps without code.

### Focus for the near future

v5 is the next major release, currently shared as the `vNext` branch on GitHub. Check the [changelog file](changelog) in that branch to see what has already been achieved and what is likely to make it into the release.

The following is the immediate direction. These are not likely to be incuded in v5.0.0 but are likely to be added to v5.1 or maybe a little later.

Current focus (beyond what has already been developed) is on:

* Ensuring code quality continues to improve - supported by the split of the code into multiple source components & ever improving code linting and structure.
* Filling in some gaps and issues identified in various discussions.
* Continuing to improve the technical documentation. Updating details and changes, adding how-to's, moving some things from the WIKI. Improving language consistency.
* Maturing the 2 new nodes.
* Trying, yet again, to think about a sensible but robust approach to security.

Next immediate focus will be on:

* Possibility of turning on server-side rendering with the EJS template engine
* Enabling instance npm scripts to be run from the Editor.
* Displaying and enabling updatable packages in the package manager.
* Enable templates to provide examples to the Node-RED example library.
* Enabling security.
* Add *option* to auto-install npm dependencies on change of Template.

If you would like to contribute to any of these future features, please get in touch via the Node-RED forum or GitHub so that we can plan things out.

### Longer term focus

* Creating W3C web components to replace the VueJS ones - especially for the ones baked into the fe code. Noting that v5 already contains a non-Vue toast notification feature.
* Creating usable components that have standardised data interfaces. So that other developers can produce similar outputs with different frameworks but the data that is exchanged with Node-RED remains the same. These components should make things easy that flow designers might typically want to do (notifications, forms, charts, tables, drag-and-drop, etc.)
* Creating a visual layout generator to bridge the gap between uibuilder and Dashboard. Ideally this would be non-framework specific but this seems a very unlikely goal to hit. Would be happy for this to either use web components or VueJS. Svelte might also be acceptable.
* Possibly the addition of a `uib-dashboard` node that uses data-driven composition. As a half-way house between code-driven and visual-layout approaches.

---

## In Progress

To see what is currently being developed, please look at the "Unreleased" section of the [Changelog](changelog) and the GitHub [What's Next/In Progress Project](https://github.com/TotallyInformation/node-red-contrib-uibuilder/projects/1).


----

## Ideas based on v5/vNext development

### Editor (`uibuilder.html`)

* Extend folder/file management
  * Add the `common` folder to the file editor.
  * Allow renaming of files/folders.

* Editor Help: Change output msgs headers to include guidance to say that port 1 is the upper port and port 2 the lower port.

* Check for new versions of installed packages when entering the library manager.

* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.

* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?

* Allow custom locations for delivery folder (normally `src/` or `dist/`) and for api's folder (normally `api/`)

* Method to show output from npm package handling.

* Add all local package.json script entries as links/buttons so they can be run from the editor panel.

* Add a reminder to the Editor help about examples. Add an onclick to that <a> icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.

* If `dev` script discovered in local package.json scripts, enable a dev button so that a CI dev service can be spun up (e.g. Svelte). Will need debug output to be visible in Editor?

* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header

### Front-End Changes (`uibuilderfe.js`)

* How to add originator to the eventSend method? via an HTML data- attrib or use mapper?
* Add mapper to map component id to originator & extend `eventSend` accordingly

### General

* Publish `uibuilderfe` on `../uibuilder/` as well as on `./` for greater consistency with other paths.
* Allow client id to be set externally.
* Use [chokidar](https://github.com/paulmillr/chokidar) to send a control msg to the fe when files change. Change the front-end to allow the browser to automatically reload (location.reload()). Put everything behind an optional flag and don't load the chokidar library unless the flag is set. May want an auto-rebuild feature as well.
* Add package.json `style` property to Instance details page and packages list if it exists. Make sure that `browser` is prioritised over `main`.



## *Maybe*

These are some thoughts about possible future direction. They need further thought and design.

### Core (`uibuilder.js`)

* ~~Add caching option to uibuilder - as a shared service so that other nodes could also use it - allow control via msg so that any msg could use/avoid the cache - may need additional option to say whether to cache by msg.topic or just cache all msgs. May also need persistance (use context vars, allow access to all store types) - offer option to limit the number of msgs retained~~ See other nodes below. Probably best kept as a separate node.

* add in/out msg counts to status? Maybe as an option.

* Add option to turn on/off connect/disconnect control msgs

* On change of URL - signal other nodes? As no map currently being maintained - probably not possible

* Maybe switch from static to rendering to allow dynamic content:

  ```js
  var bodyParser = require('body-parser');
  var express = require('express');
  var app = express();

  app.use(express.static(__dirname + '/'));
  app.use(bodyParser.urlencoded({
    extend: true
  }));
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'ejs');
  app.set('views', __dirname);

  app.get('/', function(req, res) {
    res.render("index");
  });
  ```

  Maybe set as optional with flag? Allow choice of render engine? Only render .ejs files instead of .html?

* Create some [HTML Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to extend uib for modern browsers. Maybe replace Vue toast component for example?

* Trial use of [web-workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) since majority support goes back to 2014.
* 
* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's

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
  
### uib-sender Node

* Allow multi-instance sending - send to multiple uibuilder nodes.
* Include schema checks - filter on available schema's from uib compatible components
* Allow sending to a cache node rather than just a uibuilder node.

### uib-cache Node

* ? Option to constrain cache/cache-clear to socketid/clientid

### New Nodes

* add alternate `uib-dashboard` node that uses web components and data-driven composition.

### Security

* Add a signup() function to fe and a matching handler in security.js. Possibly add option to turn on/off signup processing to editor.

### General

* Add experimental flag - use settings.js and have an object of true/false values against a set of text keys for each feature.
  * Update docs
  * Add processing to nodes to be able to mark them as experimental.

* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's.

* Add client IP address to trace messages on connection.
  
* Add optional sidebar displaying list of all uib URLs (and link to nodes).

----

# OLD

**Update 2022-01-19**: These are the old entries from the WIKI To Do page. They need tidying up and consolidating into the newer structure.

## In Progress

- [ ] Add validation hints for users - started, url rename hints added

* [ ] Partially completed in v3. Create a security capable version - with built-in websocket security - logon/logoff/session management/user verification/token creation & refresh.

* [ ] Define msg.uib property as reserved. To allow for comms to specific component types and html ID's.

   * uibuilderfe: If msg.uib present on incoming normal msg, don't include in normal msg event. Will be used in
         dedicated uib components to allow a Dashboard-like experience.
   * ? May need new nodes to make comms easier ?

## Next

See also the [To Do Project](https://github.com/TotallyInformation/node-red-contrib-uibuilder/projects/1)

* [ ] Admin ui: In file editor, add rename button for both folders and files.
* [ ] Further improve notifications in the Editor
* [ ] File editor needs to handle common folder not just the instance folder.
- [ ] Add a file upload button to the file editor.
- [ ] Improve handling for when Node-RED changes projects.
- [ ] Add a package.json to the templates. On application of a template, have a script that adjusts the content of the file if needed (e.g. name). Include a "build" script example.

## Ideas

### Documentation

* [ ] Create end-to-end comprehensive security example. Including:

    - Login page
    - Logout button
    - Session timeout
    - Websocket security
    - Link to ExpressJS authentication schemes
    - Page authorisation (group & user level)

### Front End (`uibuilderfe.js`)

* [ ] Add ability to send msg that auto-updates a VueJS app data variable so no code is required.
* [ ] Add `react` function to uibuilderfe. To make it easier to for beginners to return a value to Node-RED on change or on click without needing any extra code. Really want to be able to return the source element ID if possible.
* [ ] Maybe retain last incoming msg.topic and automatically use when sending unless overwritten.

## Back End (`uibuilder.js`)

* [ ] Replace dummy middleware functions and instead test for whether the variable is a function - this saves adding ExpressJS paths where none are actually needed. (Partly completed)
* [ ] Add index web page for the `common` folder.
* [ ] Create a [Progressive Web App](https://web.dev/what-are-pwas/) (PWA) capable version with [Service Worker](https://developers.google.com/web/fundamentals/primers/service-workers) [Mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
  
  Enabling semi-offline use so speeding up the whole interface after the first load.
  Also makes more native app-like features available such as mobile content sharing & badges, background downloading, etc.

  Note that service workers don't have access to the DOM but they do act as a network proxy. Global state is not maintained but
  IndexedDB is available for persistence. They don't work on older browsers. See the [Mozilla Service Worker Cookbook](https://serviceworke.rs/)

  Websockets can't be used in a service worker but [Web Push](https://developers.google.com/web/fundamentals/push-notifications) 
  is available for notifications & might be an interesting additional node for uibuilder. 
  See the [push demo from Mozilla](https://serviceworke.rs/push-payload_demo.html). Push payloads can include JSON and binary.

  [Workbox](https://developers.google.com/web/tools/workbox) - library for adding offline support.

  [fxos-components/serviceworkerware](https://github.com/fxos-components/serviceworkerware#serviceworkerware): An Express-like layer on top of Service Workers to provide a way to easily plug functionality.

* [ ] Method to import/export front-end files. Needs ZIP/Unzip functions at the back-end.

* [ ] New node: allowing a socket.io "room" to be defined. Will need to pick a current main instance from a dropdown (using API)

   * Change FE to allow for rooms.

* [ ] New node: cache - see WIKI cache page for details.

### Admin UI (`uibuilder.html`)

- [ ] Admin ui/uiblib.checkInstalledPackages: Pass package file read errors back to admin ui. Currently only shows in Node-RED log. Partially complete - info is shown in browser dev console.

- [ ] Add option to allow new front-end code files to be input via inbound msg.

   Allows a flow to read a file and save to the server. Optional because it could be a security issue.
   Allow folder name as well as file name.

- [ ] Make the project, src and dist folders selectable so that they can be anywhere (advanced only).

- [ ] Add (advanced) flag to make use of project folder optional.

- [ ] Allow (advanced option) use of a NEW ExpressJS app (rather than reusing RED.httpNode) - 
  giving the ability to have extra control, use a different port and separate security.

- [ ] Add option to keep backups for edited files + button to reset to backup + hide backup files

- [ ] Add npm package delete confirmation - probably via std NR notifications

- [ ] When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.

- [ ] Add all instances endpoint folders

- [ ] Use `https://api.npms.io/v2/package/<packageName>` to highlight installed modules that have updates

* [ ] Deal with instance folders build script if found.
* [ ] Build script processing needs the ability to do npm handling for the instance folder not just for userDir.
- [ ] Add a "Build" button, disabled by default. uibuilder will check whether there is a `package.json` file in the `<uibRoot>/<uibUrl>` folder 
  and whether it contains a script called "build". If that exists, the build button will be enabled.

     This will need you to have followed the [build instructions in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Using-VueJS-with-Webpack). Or to have come up with some other build process.

    - Add example webpack build file.

- [ ] Provide template package.json file to go into `<uibRoot>/<uibUrl>` - provided automatically if user creates a file called package.json.


## Maybe

- FE - special control msg to create a new channel or room - to be used for components. Could be a separate node.
- FE - add function to reload the page - allow for a control msg to do so.

- BE - new node - "component" - Define a component to load {name, file/url, (schema)}. Trigger FE to lazy load the component on new (re)connection. Create socket.io channel

- Allow folder name to be independent of uibuilder.url?

- Consider option to expose both `src` and `dist` folders to the web server. Switchable.

    Not directly related to this feature set but probably quite useful anyway as it would allow admins to switch between them. 

- Add GIT processing?
   - Is git command available?
   - is front-end src folder a git repository?
   - git commit
   - git push

* [ ] Allow passing of code & css from the backend. This is live but only in a very simplistic way. Suggested enhancements:

  - Passed code should _replace_ the previous.

    Currently, it is always added. Needs an ID adding.

* [ ] Split loading of libraries (moon, etc) to limit the number of paths added to ExpressJS - allowing for lower overheads when using different libraries for different endpoints.

* Add build steps and devDependencies to allow for build steps when adding components.

* Standardise data schema for components. Provide an element ID. Allowing a msg to be sent to a specific instance of a component.
* Create some standard component names. Allowing for standards across multiple libraries.
* Create some standard components in one of the libraries. Probably VueJS now it has matured a lot.

* [ ] Review socket security - ensure that it works, provide example middleware.

* Split back-end code so that library/path loads are moved to a configuration node, allowing it to be used by multiple uibuilder node instances without having to re-run.

  Not sure about this now. I think that it may be better to stick to a single node per endpoint.

* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/)

- Add instance source folder location edit field to admin interface to allow it to go somewhere different. Thanks to @Thomseeen for raising this in [Issue 44](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/44).

- Extend middleware hook feature to allow for different middleware for each node instance
  instead of one for all instances.

- Add safety validation checks to `msg` before allowing it to be sent/received to/from front-end

  Started: script/style is removed if disallowed in settings, uibuilder control msgs dropped (since v1.0.0)

- See [Security Design in the WIKI](Security-Design). ~~Add integrated ExpressJS security to Socket.IO~~

- See [Security Design in the WIKI](Security-Design). ~~Process `httpNodeAuth`~~

- ~~Add ability to auto-install missing modules.~~ Added notifications instead.

- Use webpack to "compile" resources into distribution folders upon (re)deployment -
  allowing for the use of more resource types such as: less/scss; UI frameworks such as Bootstrap, Foundation, Material UI; jsx or other dynamic templating; front-end frameworks such as VueJS, Angular or REACT.

- If using `dist` code, Add a check for new file changes in local `src` folder

## Possibilities for further thought

These are random thoughts that might make it into the To Do list but really need more thought before committing to them.

- Rethink security - ensure both pages and sockets are secured. Allow for external authentication and authorisation. Allow for secure JWT-based approaches.

- Investigate replacement of Socket.IO with something lighter.

  Maybe SockJS though it would probably also need some plugins to that we get unique channels for each uibuilder instance (maybe)

- Add sender IP address when sending msg from browser - so that Node-RED can
  differentiate where things are coming from.

  The `_socketId` obviously already identifies the originator technically but additional info might be helpful.
  _Possibly make this optional. Maybe have other optional data too such as device_

- _(Maybe compile template resources to dist folder?)_

- _We might need to add some checks for updated master templates? Maybe issue a warning? Not sure._

- Layout creator

  Have something that allows layouts to be easily created direct from Node Red. Almost certainly would require tying to a specific library like VueJS. Something like [vue-grid-layout](https://jbaysolutions.github.io/vue-grid-layout/) might be a good starting point. More examples can be seen at [this list](https://vuejsexamples.com/tag/drag/).

- Enable tilib.findPackage to deal with meta-packages. e.g. @syncfusion/ej2-vue-schedule - This does not install a package called "ej2-vue-schedule" but in fact installs 17 other packages! [Issue #69](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/69). The workaround for this is to use a build step so this is the bottom of the pile unless someone wants to do a PR. Any "fix" would likely require a lot of code for very little, if any, reward.

* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/)