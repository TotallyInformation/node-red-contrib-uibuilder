# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

uibuilder adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.1.1...main)

<!-- Nothing currently. -->

**WARNING**: Though I've done some work on the security features, they are still not ready. Do please try them but **NOT IN PRODUCTION**.

### TODO

* FIXES NEEDED:
  * url rename fails if user updates template before committing url change
  * Don't allow access to file editor if the node hasn't been deployed yet. - what is different if a node instance hasn't been deployed yet?
  * ERRORCHECK: Imported node with not default template had default template on first deploy
  * ERROR: Removing a module after install but without closing and reopening editor panel did nothing

* Move package management to a new singleton class
  * [x] Use execa promise-based calls to npm
  * [x] Allow any valid npm name spec in editor
  * [ ] Add display of version and global on installed packages list
  * [ ] Allow version spec on install
  * [ ] Allow installation of GitHub and local packages - gh install partially works
  * [ ] Check for new versions of installed packages when entering the library manager
  * [ ] For globally installed packages - disable remove

* Add experimental flag - use settings.js and have an object of true/false values against a set of text keys for each feature.
  * [ ] Update docs
  * [ ] Add processing to nodes to be able to mark them as experimental.

* [x] Add uib-sender node
  * [x] Dropdown to choose uib URL
  * [x] Allow passthrough of msg
  * Future enhancements:
    * Allow multi-instance sending
    * _Maybe_ Include schema checks - filter on available schema's from uib compatible components
    
* [ ] _Maybe_ Add uib-receiver node
  * [ ] Status msg to show node-id
  * [ ] Have to manually send to by adding originator property

* FE Changes
  * [x] Add optional `originator` param to send fn
  * [x] Add `setOriginator` method to set default originator
  * [ ] How to add originator to the eventSend method? via an HTML data- attrib or use mapper?
  * [ ] Add mapper to map component id to originator & extend `eventSend` accordingly

* uibuilder Panel
  * [x] Switch from hide/show interface to tabbed interface
  * Files tab
    * [x] Remove the close button
    * [ ] _Maybe_ Move folder management to a popup dialog (to save vertical space)
  * Libraries
    * [ ] Remove the close button
  * [ ] Show template (instance root) folder

* [ ] Add a new template and example to demonstrate the sender node.
  
* Maybe Add caching option to uibuilder - as a shared service so that other nodes could also use it - allow control via msg so that any msg could use/avoid the cache - may need additional option to say whether to cache by msg.topic or just cache all msgs. May also need persistance (use context vars, allow access to all store types) - offer option to limit the number of msgs retained
* Maybe add in/out msg counts to status?
* Maybe add prev/curr version and checks?
* Maybe add alternate `uibDashboard` node that uses web components and data-driven composition.
  
* Templates
  * Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?)
  * **Make sure that templates have a way of signalling to uibuilder what libraries they need.**

* Security
  * Add roles/tags options to JWT? Or at least to the user session record
  * Editor
    * Make JWT IP address check optional `jwtCheckIp`
    * Add "copy local security.js template" button to security section to reset the local overrides.
    * Add ability to edit security.js code to the editor.
  * BE
    * **MAKE SURE THAT THE CLIENT ID IS IN THE JWT & CHECK _auth.id against JWT ID (`sub` - subject id)**
    * Add 2nd expiry length to the security settings: JWT ping (minutes), session expiry (days)
    * ~~Consider adding a client ID - to be built into the JWT~~
    * Add JWT even if user unauth - it is just a token and allows for unauth traffic
    * Add sec processing to incoming disconnect signal from socket.io
    * JWT extension processing - needs processing on client as well as server
    * security.js
      * move instance-specific load of .config/security.js up to instanceSetup()
    * ?? Add security to user API's ??
    * NB: May get a new connect without a disconnect
  * FE
    * Send cache request on server auth response - only if unauth msg flow enabled(?)
    * Make sure self.security is externally read-only
    * Make sure localStorage _auth is always updated after control msg from server
    * Make bootstrap-vue toasts optional, add auth change notices
* DOC UPDATES NEEDED:
  * FE
    * Variables:
      * self.security - flag: indicates if server has security turned on
      * self.storePrefix
    * Functions:
      * self.initSecurity
      * self.setStore

### New

* **New node `uib-sender`** - this node allows you to send a msg to any uibuilder instance's connected front-end clients.
  
  That means that it is pretty much the same as sending a message directly into a uibuilder node.

  You select the instance of uibuilder you want to use by selecting an existing uibuilder URL from the dropdown.

  You can also select whether you want input messages to go straight to the output port as well. 
  
  Or, more usefully, you can allow "return messages". This allows a front-end client to send a message to node-red with some pre-defined metadata added that will route the message back to the `uib-sender` node. In this way, the sender node can be used as a semi-independent component.

  Note that this same method can be used by ANY custom node, check out the code to see how it works. It requires the use of an external, shared event module [`@TotallyInformation/ti-common-event-handler`](https://github.com/TotallyInformation/ti-common-event-handler). The msg metadata looks like: `{ _uib: {originator: <sender_node_id>}, payload: ... }`. The sender node id is just that, the Node-RED node id for the sender node instance.

  The `uibuilderfe.js` library has been updated to allow easy use of the `originator` property for `uibuilder.send()`. See below for details.

* Updated node status display. Any instance of uibuilder will now show additional information in the status. In addition to the existing text information, the status icon will be YELLOW if security is turned on (default is blue). In addition, if _Allow unauthorised msg traffic_ is on, the icon will show as a ring instead of a dot.

* The master module list (of front-end modules uibuilder will serve to the front-end) now also searches global installs.

### Changed

* `uibuilderfe.js` client library updated to allow for the use of an `originator` metadata property. This facilitates routing of messages back to an alternative node instead of the main uibuilder node.

  There are three ways to make use of this:

  * Use the new `uibuilder.setOrigin('<sender_node_id>')` function. This will then route ALL messages from the client back to the specified node. This is of marginal use because the main use-case for the property is to automate routing of data to/from web components of which there are likely to be several on a web page.
  * Use the new override parameter for the send function. `uibuilder.send(msg, '<sender_node_id>')`. This will send this one message back to the specified node. It will override the `setOrigin`. The utility `uibuilder.eventSend()` method has also been updated to allow the originator parameter.
  * Manually add the metadata to the node `{ _uib: {originator: <sender_node_id>}, payload: ... }`. This is not generally recommended as it is error prone. However, if writing custom front-end components, you may want to include the origin property as an option to allow end-to-end automatic routing of messages to/from your component instances.

  See the new `uib-sender` node details above for an example of using the `originator` property. That node adds the property to its received msgs before sending to your connected clients.

  Note that at present, control messages from the front-end cannot be routed to a different originator node, they all go to the main uibuilder node. This will be reviewed in a future release. Let me know if you think that it is needed.

* Security improvements:

  * When security is active, a client that re-connects to Node-RED will attempt to reuse its existing authorisation (see the localStorage bullet below).
    
    This means that opening a new tab or window in the same browser profile will automatically connect without having to log in again.

    This process assumes that your local security tracks connected clients and is able to reconnect to them without needing the password to re-authenticate.

    To achieve this, the server sends the 'client connect' control msg to the client which responds with an 'auth' control msg containing the existing msg._auth recovered from localStorage. The server validates the JWT and then runs the customisable `userValidate` process.
  
  * JWT processing now includes more checks. In addition to expiry, subject, issuer and audience are validated. Optionally the client IP address can also be validated (see new flag in the security section of the config panel in the Editor).

    Also, returned errors and messages should be clearer to indicate what went wrong. Additional error information is shown in the Node-RED log.
  
  * When security is active, any uibuilder node in a flow will have a status with a yellow (instead of the normal blue) icon. If the icon is filled, no messages
    can flow unless a client is authenticated. If it is a ring, messages will flow regardless and it is up to the flow author to control things.

  * When security is active, pass flag to front-end. Use `uibuilder.get('security')` to get the current status. The flag is passed on the initial connection message from the server.
  
  * `uibuilderfe.js`
    
    * Added auth details to localStorage so that they are available on page reload and available from any browser window or tab on the same machine/browser profile.
    * Made sure that all updates to auth details use `self.set` to trigger update events.
  
  * Move core security functions from `/nodes/libs/uiblib.js` to `/nodes/libs/security.js` which is a singleton class instance to match the style of socket.js and web.js
  
  * `/front-end/src/uibuilderfe.js`

    * New security flag
    * Only run security related functions when security flag is active
    * Add some bootstrap_vue toast warnings to match the console output warnings (only does anything if you are using bootstrap-vue, otherwise does nothing)

  * `/nodes/libs/security.js`

    * Add security flag to initial control message to client
    * Prevent client from sending msgs if security is on but client not authorised (is dependent on keeping track of clients on the server)
  
  * `/nodes/libs/uiblib.js`

    * Start to work on blocking msgs from node-red to client when security is on but client not authorised. **WARNING: NOT WORKING YET** _messages will always get through_.
    * `sendControl()` - make Socket.ID optional.
    * `authCheck()` - change from `socket` parameter to `socketId` to make it easier to call from more places. Also add more extensive `_auth` and `_auth.id` checks.
    * `logon()` - change warnings to remove note about not permitted in production as this is no longer the case (see change notes for v4.1.1)

  * `/templates/.config/security.js`

    * Add new functions `jwtCreateCustom` and `jwtValidateCustom`. In readiness for more flexible and secure JWT handling.
    * Add new functions `captureUserAuth`, `removeUserAuth`, and `checkUserAuth`. These will support being able to restrict sending of msgs from Node-RED to clients.
      Without them, any msg input to a uibuilder node will be passed to clients regardless of whether they are logged in or not.
    * Add new function `userSignup`. This will (optionally) allow you to offer a self-service sign-up process.

  * Tech docs - some minor improvements to the security process docs and bring into line with current process.

* Improvements to the Editor help panel. Should hopefully be clearer and includes all of the settings and custom msg properties. Now uses a tabbed interface.

* Internal and development improvements:

  * Shared event handler implemented. This enables external nodes to send and receive data to/from uibuilder front-end clients.
  
  * Gulp implemented
    
    *  initially for composing the `uibuilder.html` from the contents of `src/editor`
    *  and to replace the previously manual minify step for `uibuilderfe.js`
    *  _other tasks likely to be added in the future to make more efficient code and ease the release/publish process_.
    
  * New eslint rulesets implemented & config restructured. Along with the .html file decomposition, this makes for a much more accurate linting process.
  
  * Massive number of minor code improvements to `uibuilder.html` and `uibuilder.js` & to the supporting libs and `uibuilderfe.js` thanks to the impoved linting.
  
  * Even more massive restructuring of `uibuilder.js`. 
  
    * Removing the need for the `node` object. This meant the use of some arrow functions to be able to retain the correct context in event handlers and callbacks.
    * Destructuring the big exported function into a series of smaller functions. Makes the code a lot clearer and easier to follow. Also helped identify a few bits of logic that were not quite sane or not needed at all (the result of evolutionary growth of the code).
    * Using named functions throughout should make future debugging a little easier.
    * npm package handling moved to a separate singleton class in `package-mgt.js`

  * Removed `inputHandler` function from `uiblib.js`. Code folded into the `inputMsgHandler` function in `uibuilder.js` which has been destructured so is small enough to have it as a single function.
  
  * New v3 API added to list all of the deployed instances of uibuilder. Issue a GET with `cmd=listinstances`. This allows other nodes to get a list of all of the uibuilder instance URL's and the ID's of the nodes that create them. See the `uib-sender` node's html file for details.
  
  * Package management rewritten. Should be faster and uses async/Promise functions.

### Fixed

* `uiblib.js` `logon()` - Fixed error that prevented logon from actually working due to misnamed JWT property.
* A number of hard to spot bugs in `uibuilder.html` thanks to better linting & disaggregation into component parts
* In `uibuilderfe.js`, security was being turned on even if the server set it to false.

## [4.1.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.1.0...v4.1.1)

### New

* [Issue #151](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/151)If the advanced option to "Show web view of source files" is selected, also show a link to the webpage.
### Changed

* [Issue #149](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/149) If security is turned on, you can now run without Node-RED using TLS even in production. This is because you may wish to provide TLS via a reverse proxy.

   You still get a warning in the editor though.

* Moved back-end libraries from `nodes` folder to `nodes/libs` to keep things tidier (especially if additional nodes added in the future)
* Add simple debug function to web.js to allow the ExpressJS routing stack to be dumped to stdout

### Fixed

* [Issue #150](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/150) Switching between src and dist folders now works without having to restart Node-RED. Existing routes are removed first then re-added.
* Common folder is only served once (previously it was been added to the ExpresJS router stack once for each node instance).

## [4.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.0.1...v4.1.0)

### New

* Add drop-down to adv settings that lets the served folder be changed between src and dist. [#147](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/147)

  - If the `<uibRoot>/<servedFolder>` folder does not exist, it will be silently created.
  - If the `<uibRoot>/<servedFolder>/index.html` file does not exist, a warning will be issued to the Node-RED log & the Node-RED debug panel.

* Allow front-end code to update the `msg`. [#146](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/146)

  This allows your front-end code to be its own test harness by pretending that a msg has been `sent` from Node-RED. It would also let you have a single processing method even if you wanted to use a non-Node-RED data input (e.g. a direct MQTT connection or some other API).

  ```js
  uibuilder.set( 'msg', { topic:'my/topic', payload: {a:1, b:'hello'} } )
  ```

  When using this feature, the `uibuilder.onChange('msg', function(msg) { ... })` function is still triggered as expected.

### Fixed

  * [#148](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/148) Editor node config cannot escape https check when not running in development mode

## [4.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.0.0...v4.0.1)

### Fixed

* Minor bug stopping the logoff msg processing from working.

### Updated

* All dependencies and dev-dependencies updated

## [4.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.3.1...v4.0.0)

### Major Changes

* Node.js v12+ is the minimum supported environment for Node-RED.
* Only "modern" browsers are now supported for both the Editor and the uibuilderfe front-end library as ES6 (ECMA2015) code is used. 

  Let me know if this is a problem and I can build a backwards compatible version.
  
#### Template handling is significantly changed in this major release
  
  New instances of uibuilder nodes will only be given the "blank" template which uses no front-end frameworks.

  You can load a different template using the "Template Settings" in the Editor.

  **Loading a new template WILL overwrite any files with the same name**. A warning is given though so even if you press the button, you can still back out.

  You can choose from the following internal templates:

  * _VueJS & bootstrap-vue_ - The previous default template.
  * _Simple VueJS_ - A minimal VueJS example.
  * _Blank_ - The new default.
  * _External_ - See below.
  
  **But**, you can now also chose an **EXTERNAL** template! This will let you choose from [any remote location supported by **degit**](https://github.com/Rich-Harris/degit#basics). You can use `TotallyInformation/uib-template-test` as an example (on [GitHub](https://github.com/TotallyInformation/uib-template-test)).

  **NOTE**: When using an external template, no check is currently done on dependencies, you must install these yourself. I will try to add this feature in the future.

#### Changing the `uibRoot` folder
  
  You can now set uibuilder's root folder - that stores configuration, common, security and each node's front-end code - to a different location. The default location is in your userDir folder in a sub-folder called `uibuilder`. If you are using projects, the sub-folder will be in your projects root folder. See [docs/changing-uibroot.md](docs/changing-uibroot.md) for more detail.

### Updated

* Update fs-extra to [v10](https://github.com/jprichardson/node-fs-extra/compare/9.1.0...10.0.0). No longer supports node.js v10, requires v12+.
* Make some class methods private in web.js and socket.js. Requires node.js v12 as a minimum as it uses an ECMA2018 feature.
* web.setup and socket.setup can only be called once.
* Socket.IO updated from v2 to v4.
* Added Admin API check for whether a url has a matching instance root folder. (Was an outstanding to-do)
* Reworked the info block that is printed to the log on startup. Much neater and with added info on the webserver being used.
* Technical Docs have been improved in line with some other work I did recently on enterprise standards.

  The docsify configuration has been greatly improved with a new theme and some automation for dates and document front-matter.

  Added a new page on changing the uibRoot folder.

  Updated the front page with links and explanations of the different sections.

### New

* In the technical documentation, you can now access and search the main README as well as the current and archive changelogs (v1 & v2) in addition to everything else.
  
  Don't forget that you can access the tech docs on the Internet from [GitHub](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/) AND locally from within Node-RED.

* `nodes/web.js` - Added web.isConfigured to allow a check to see whether web.setup has been called.
* `nodes/sockets.js` - Added socket.isConfigured to allow a check to see whether socket.setup has been called.
* Add a new icon to the main readme that allows editing of uibuilder code using VSCode either via a remote repository or via a Docker container.

### Fixed

* Node-RED edge-case for credentials was causing node to be marked as changed whenever "Done" button pressed even if no changes made. Turns out to be an issue if you don't give a password-type credential an actual value (e.g. leave it blank). Gave the `JWTsecret` a default value even when it isn't really needed.
* Instance details page - CSS now loads correctly even if using a customer server port. Some Socket.IO details that were missing now returned.
* web.js - specifying a custom server port caused uibuilder to crash. Now fixed.
* Lots of tidying up of log messages, especially TRACE level.
* Accidentally include a node.js v14+ issue, now removed.
* Additional try/catch blocks to force better reporting if there is an error in the uibuilder module files.


---

## [3.3.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.3.0...v3.3.1)

### Fixed

Added try/catch around Untrapped `JSON.stringify` in uiblib.js `showInstanceDetails()`. Prevent crash.

## [3.3.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.2.1...v3.3.0)

### New

* Add [new pre-defined msg](./docs/pre-defined-msgs.md) from Node-RED that will cause the front-end client (browser) to reload.
* Add auto-reload flag to file editor - if set, any connected clients will automatically reload when a file is saved. (Only from the file editor in Node-RED for now, later I'll extend this to work if you are editing files using external editors).
* Add new function to uibuilderfe.js - `uibuilder.clearEventListeners()` - Will forcably clear any `onChange` event listeners that have been created. Partial update for [Issue #134](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/134).
* Added initial documentation for front-end build tooling to technical documentation (general info and Snowpack).

### Fixed

* [Issue #126](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/126) - Security not turning on even if TLS is used.
* Update security.js template to remove simple false return if authentication fails - this is no longer valid.

### Updated

* Bump dependencies to latest
* Add collapsible summaries to README.md
* Various updates to technical documentation
* Update chkAuth validation function to make it more robust
* Improve auth process logging and msg._auth.info checks
* Remove simple true/false return from auth processing as this is no longer valid
* uibuilderfe
  
  * Added check for `uibuilder.start()` having already been called and prevent it being run more than once. Partial update for [Issue #134](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/134).
  * Add new function `uibuilder.clearEventListeners()` - see details in [New](#new) above.
  * Added initial code for a simple alert - not yet ready for use.

* Internal code refactoring
  
  * Prep for adding the ability for uibuilder to use its own independent ExpressJS server
  * Rename uibuilder.js's `nodeGo()` function to `nodeInstance()` for clarity
  * Add `dumpReq()` to tilib.js - returns the important bits of an ExpressJS REQ object
  * Begin to add Node-RED type definitions
  * Add ExpressJS type definitions
  * Other linting improvements
  * The refactoring has removed several hundred lines of code from the main js file and
    simplified quite a few function calls.
  
  * **Moved Socket.IO processing to its own Singleton class module.**
    
    This means that any Node-RED related module can potentially `require` the `socket.js` module and get
    access to the list of Socket.IO namespace's for all uibuilder node instances. All you need is the uibuilder URL name.

    It also means that any module can send messages to connected front-end clients simply by referencing the module and knowing
    the url.

    Note that this currently only works once the class has been instantiated **and** a setup method called. 
    That requires a number of objects to be passed to it. This happens when you have added and deployed a uibuilder
    node to your flows.

    But it does mean that, in theory at least, you could now write another custom node that could make use of the uibuilder communications
    channel. Of course, it also opens the way for new nodes to be added to uibuilder. However, a slight caveat to that would be that
    loading order would be important and you really must deploy uibuilder _before_ any other node that might want to use the module.

  * **Started moving ExpressJS web server handling to its own Singleton class module**

    Again, this will mean that any module running in Node-RED could potentially tie into the module
    and be able to access/influence uibuilders web server capability.

    Works similarly to the Socket.IO class above. So it has to be initialised using a number of properties
    from the core uibuilder node.

    Currently, only the core ExpressJS app and server references are handled by the class. More work
    is required to move other processing into it.

* Include PR #131 - add Socket.IO CORS support

## [3.2.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.2.0...v3.2.1)

### Fixed

- [Issue #121](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/121) - Thanks to Sergio Rius for reporting and for [PR #122](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/122)
- [Issue #123](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/123) - Allow for misuse of `browser` property in package.json for added libraries. Thanks to Steve McLaughlin for reporting and providing a potential fix.
- Technical Docs - Include favicon, expand search. Exclude missing file from search.

## [3.2.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.1.3...v3.2.0)

### New

- You can now choose between front-end templates. 
  
  Vue/Bootstrap-vue is still the default.

  Expand the "Advanced" settings to see the new dropdown. Note that uibuilder never overwrites your files so you either have to change the selection **before** the first deployment of the node or you have to delete the index.(html|js|css) and README.md files before changing the selection.

  Three templates are currently included, more may be added later:

  - An updated version of the existing default template that uses VueJS and bootstrap-vue. Contains an additional button demonstrating the new simple eventSend function.
  - A new "Blank" template. This does not contain any front-end libraries or frameworks. It uses just the uibuilderfe library with raw DOM commands.
  - A simplified Vue template. Contains the bare minimum to get you going.

  Templates are also now more comprehensive and flexible and contain README files for information.

  Templates will also warn you if you are missing a library that they depend on. Install them through the uibuilder library manager.


- The Editor will now tell you if you have missing dependencies for your chosen template.
  
  ![missing packages warning](docs/missing-packages-warning.png)

  Useful for people who forget to install vue and bootstrap-vue now that they have been removed from the default install.

- When changing an existing node's URL:
  
  - **The existing source folder is renamed**
    
    No more losing track of existing code!

  - Folders as well as instances are checked for duplicates
  - You are now warned to redeploy straight away, before doing anything else

- When deleting a uibuilder instance, you are offered the chance to delete the source folder
  
- In the `uibuilderfe` front-end library:

  - Added a new public method: `eventSend`. You can use this to attach to any HTML DOM event (e.g. a button click). 
    It will automatically send a msg back to Node-RED with details of the event.

    Details on how to use this are contained in the [technical docs](https://totallyinformation.github.io/node-red-contrib-uibuilder) in the `uibuilderfe-js` page.
    You can access these docs directly in Node-RED either using the button in the configuration panel or the link
    in the help panel.
    
    The updated default template also contains an example button that uses the new feature. 
    
    Note that you can use more than just button clicks. It will work with _any_ DOM event that you attach it to.

### Changed

- Better warning if you set/change a URL to one that already exists.
- When changing URL:
  - **The original folder (if it exists) will be renamed**
  - The uibuilder instance folders are also checked. The change is rejected if the folder exists.
  - You are warned that you need to redeploy before doing anything else.
  
  **NOTE**: You may have lots of old uibuilder folders lying around. If your url change is rejected and you can't think why, check the folders.

- Check for duplicate url moved to v3 Admin API. API Test file updated.
- Further improvements to the techical documentation. This is now available [online](https://totallyinformation.github.io/node-red-contrib-uibuilder) as well as from the uibuilder node configuration panel and the help panel in the Editor.
- Improved links from the Node-RED Editor's help panel, particularly on how to use the uibuilderfe front-end library.
- Extensive improvements to the 
  [documentation for working with the `uibuilderfe` library](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/front-end-library) in your front-end code.
- The default Vue template now defines the `data` section as a method instead of an object. This is recommended and prepares for Vue v3.

## [3.1.3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.1.1...v3.1.3)

### Fix (kind of)

[Issue #102](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/110)

It seems that npm is incapable of safely being called from within a preinstall or postinstall npm script.

Every effort at trying to achieve this in order to install `vue` and `bootstrap-vue` has failed.

So I have removed this processing completely.

The result of this is that you must install vue and bootstrap-vue yourself if they aren't already installed (and if you want to use them of course).

You should instal v2 versions however, not v3 since there are a lot of breaking changes in vue v3 that have not been tested with uibuilder.
The installation command is:

```bash
#cd <userDir>
npm install vue@"2.*" bootstrap-vue@"2.*"
```

## [3.1.2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.1.1...v3.1.2)

This is a tweak to 3.1.1 to enable a workaround for the npm install issues.

### Issue
- [Issue #102](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/110) The npm post install script has very unexpected and unwelcome side-effects that appear to be issues with npm itself. It seems that you cannot reliably run npm from within npm.
  
   There does not appear to be a reliable fix at this time. Set the environment variable `UIBNOPRE` to 'true' before installation to avoid the problem if you hit it. You should then install `vue` v2 and `bootstrap-vue` v2 manually if you need to:

   ```bash
   #cd <userDir>
   npm install vue@"2.*" bootstrap-vue@"2.*"
   ```

   I will attempt to find another way to install vue and bootstrap-vue since in uibuilder v1/v2 you could not remove either of them. Some people don't want these libraries and so want to be able to remove them.

### New
- Added environment variable `UIBNOPPRE` processing to the pre-install script
- Added environment variable `UIBDEBUG` processing to the pre-install script

### Changed
- Removed Vue and bootstrap-vue peer dependencies from this package since they are actually dependencies for the userDir folder. Gets rid of the warnings. Vue and bootstrap-vue are installed by the pre-install script unless you set an environment variable `UIBNOPRE` to 'true' before installation.
- Post-install script is now a pre-install script.

## [3.1.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.1.0...v3.1.1)

Emergency fix.

The permissions feature of the Node-RED Admin API does not seem to work as documented.

```
RED.httpAdmin.get('/uibgetfile', RED.auth.needsPermission('read'), function(req,res) {
    // .....
})
```

Should allow you to have a user defined with "read" permission and they would be allowed to access the API endpoint.
However, as far as I can tell, this does not work.

I have removed all permissions from the API endpoints until someone can work out how to do this correctly.

Until then, all you can do is to remove the default user in settings.js so that defined users have no access until they have logged in.

There is no longer a separation between read and write permissions I'm afraid.

## [3.1.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.0.1...v3.1.0)

### Fixed

- [Issue #106](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/106) Editor: When editing files, a filename with a leading dot did not set the filetype correctly.

- [Issue #105](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/105) Editor: Attempting to edit a hidden file (with a leading dot) resulted in an error and white screen.

### New

- [Issue #108](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/108) You can now view the uibuilder package docs (the ones in this package) by going to the url `<node-red-editor-url>/uibuilder/techdocs`. 
  
  The package docs use [Docsify](https://docsify.js.org/#/?id=docsify) for formatting. The docs include a search feature as well.

  The docs are linked to from both the uibuilder help information panel and from a new button in the configuration panel.

- The config editor has a new button <kbd>Instance Details</kbd>. clicking the button will show a new page in a new tab. The page contains debug details of the exact settings for the uibuilder instance. This should help people better understand all of the settings including folders and urls.


### Changed

#### Editor, "Edit Source Files" improvements:
  - **ALL** folders and files within the `<uibRoot>/<url>` folder can now be edited.
  
  - Soft- or Hard-linked folders and files can now be used. This lets you put your front-end resources wherever you like as long as you create a soft or hard link into the `<uibRoot>/<url>` folder.
  
  - Added better information toasts on file create/delete actions.
  
    Pop-up notifications are now given when you create/delete folders and files.

  - Made keyboard <kbd>enter</kbd> button do the default action in the create dialog windows.
  
  - Added more information to the create/delete dialog windows. (url, folder name, file name)
  
  - [Issue #102](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/102) Relaxed the file-type checks when editing files. Allows for use of more ACE file-types and prepares the way for the introduction of the Monaco editor in Node-RED v2.
  
  - [Issue #107](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/107) Allowed the selection of any folder or sub-folders in the file editor.

    The editor still constrains you to the folder for the instance but any folder within that root can be viewed. New sub-folders can be created and existing ones deleted.

  - [Issue #109](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/109) Persist the selection of folder and file when editing.

    This means that closing and reopening the editor will return to the last edited file.

    Uses browser local storage and so does not work with Internet Explorer (which hasn't been supported by uibuilder since v3.0.0).

  - Improved display when no file is available to edit or if the file cannot be opened.
  
  - Started moving to new v3 admin API's that are more consistent with less overheads.
  
  - Changed "Edit Source Files" button to say "Edit Files". Recognising the additional capabilities.
  
  - Changed button link names in the configuration panel to clarify and accommodate the 2 extra buttons for the instance details and technical docs links.

#### uibuilder.js: 
  - Started to simplify and rationalise API checks and reporting. Deprecated `/uibfiles`, `/uibnewfile`, `/uibdeletefile` API's, replaced with new v3 admin API `/uibuilder/admin/:url`. Simplifies the admin API's, makes them more consistent and reduces the number of URL's.
  - Added v3 admin API's to create new and delete files and folders
  - Added `/uibuilder/instance/<url>` admin API. Is created for each instance. Calling it will show a detailed information page for the given uibuilder instance.

#### Other

- Updated dependencies
- Installer: Improved the post-install console message (Post Install takes a while). Also forces VueJS to v2.x (not v3 as yet which will soon be the latest version because there are currently too many breaking changes).

## [3.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.0.0...v3.0.1)

### Changed

* Fix for [Issue #100](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/100) - Detection of whether Node-RED is currently using https.
* Fix for [Issue #93](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/93) - Full screen editor doesn't work correctly for mobile users. Replaced custom code with equivalent feature from core.
* Remove test code from `uibuilder.html`

## [3.0.0](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.8...v3.0.0)
### Summary

As this contains rather a lot of changes, here is a summary of the key changes for users of the node. The details are in the following sections.

- Breaking Changes
  
  - Minimum Node-RED version is now 1.0
  - Minimum Node.js version is 10
  - IE11 and other older browsers now no longer guaranteed to work. All modern browsers including mobile and Microsoft Edge (Chromium) should work.

- New feature in uibuilderfe to be able to transparently feed data and configuration to VueJS components written to be compatible.
- New feature in uibuilderfe to be able to transparently create notification popovers (toasts) by sending a msg from Node-RED (no code needed).
- New security documentation - still evolving for the experimental security features
- `vue` and `bootstrap-vue` packages can now be removed (NB: if uibuilder previously installed, you need to remove and reinstall for this to be possible)
- Scoped packages can now be added and removed
- Improved Editor configuration panel layout for Advanced Settings
- Some simplification of the default VueJS JavaScript template. Makes it a little easier to read.
- New template file `<uibRoot>/.config/security.js` - used to give you control over the security process, please read the caveats before attempting to use in this version. Do not use in a live environment, for development only right now.

### New

- By sending a msg from Node-RED with a pre-defined format, you can interact with VueJS with minimal or no front-end code

  - With no code at all, you can show a popover notification (toast) to the web page.
  - With as little as a single line of HTML, you can control and send values to a custom uibuilder compatible VueJS component.
    
    Suitable components are in development. See the experimental module [uibuilder-vuejs-component-extras](https://github.com/TotallyInformation/uibuilder-vuejs-component-extras) for some example components. Specifically the `<gauge>` component which is being developed as an exemplar and will be moved to a separate npm module at some point.

    The idea being to bridge some of the gap between the ease of use of Node-RED's Dashboard and the flexibility of uibuilder. Without needing to be a web development expert.

    This will be further enhanced in future releases

  - **NOTE** To use the Vue features, you need to pass a reference to your Vue app to uibuilder.
    This is normally as simple as changing `uibuilder.start()` to `uibuilder.start(this)`

  - _This feature does not currently work with all Vue components._ See the [docs](./docs/vue-component-handling.md) for an alternate low-code version.

- Moved pre-installed VueJS and bootstrap-vue to be installed into `<userDir>` instead of into the uibuilder package folder.
  
  This allows the `vue` and `bootstrap-vue` packages to be uninstalled like everything else and resolves Issue [#75](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/75).

  Note that, at present, I have not added any clever code to remove the old installations of vue and bootstrap-vue. If you want to get them into the right place, remove and re-add uibuilder. Note that you don't need to do anything unless you want to be able to remove `vue` and `bootstrap-vue`.
  
- uibuilderfe: Added msg._socketId to sent messages.
  
- Added security documentation (Work in progress).

  Read these to understand how to use uibuilder security and how it works (respectively).
  
  [uibuilder Security Documentation](./docs/security.md) and [security.js Technical Documentation](./docs/securityjs.md).

- Added new VueJS documentation [Vue Component Handling](./docs/vue-component-handling.md).

### Changed

- Documentation: Greatly improved documentation coverage in the `/docs` folder. This contains a lot of developer documentation which should make it easier to work on improvements to uibuilder in the future. Still a work in progress.
- Documentation now uses Docsify for presentation and easier reading. Open `./docs/index.html` in your browser.
- Editor: Tidy up the Advanced Settings section of the configuration panel.
- uibuilderfe: Internal improvements to get/set functions.
- uibuilderfe: Simplify default Vue templates.
- Further code tidy up.
- Add code isolation to Editor config code to prevent namespace clashes.
- Improve standardisation of output topic.
- Moved some serveStatic code back to instance level to allow caching to be changed by config.
- Changed palette category name from "UI Builder" to "uibuilder" and palette label to "uibuilder" from "UI Builder" for consistency with other nodes.
- Moved all front-end master code (e.g. `nodes/src` and `nodes/dist`) to new top-level folder `front-end` & refactored `uibuilder.js` accordingly. Folder references also changed to new properties in the `uib` variable.
- Moved the templates folder from `nodes` to its own top-level folder and refactored uibuilder.js accordingly. The folder reference is held in the `uib.masterTemplateFolder` variable.
- Change minify of uibuilderfe from uglify-js to bable-minify because uglify-js does not support ES6+

### Fixed

- Running behind a proxy was causing Socket.IO namespace issues (see [Issue #84](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/84)
  Removing `httpRoot` from the namespace should fix that. It is no longer required anyway since url uniqueness checks were added.

## Experimental and partially working new features

**WARNING**: _Consider these features **experimental**, some parts may not work and might even cause Node-RED to crash if used. Do not yet use on production._

**Leave the security flag OFF for production.**

### NOT YET FULLY WORKING

- Added configuration option to add browser/proxy caching control to all static assets - set the length of time before assets will be reloaded from the server. This may sometimes significantly improve performance in the browser. It depends on the performance of your server and the complexity of the UI.

  Added on options variable for serve-static to allow control of caching & other headers. `uib.staticOpts`.

  Some static folders are served at module level and so don't have access to instance settings. Would likely need to have different settings on global serves from instance ones. _Needs more thought_.

  This lets you control caching of your "static" assets like JavaScript, HTML, CSS, Images and any installed front-end library resources (Vue, etc).

  Note that this is **not** for caching the msg's coming through the node, see the caching examples in the WIKI for that.

- If you use Node-RED's projects feature, restart Node-RED after changing projects otherwise uibuilder will not recognise the new root folder location.
  
### New security features

#### Summary

_Security is mostly controlled via websocket messages, not by HTTP. The web UI itself is assumed to be non-sensitive. Only msg transfer is controlled. Read the security document for details._ **Don't put anything sensitive into your front-end code**.

- Security features can be turned on via a flag in the node configuration. They are off by default.
- If running in Production mode but without using TLS encryption, the security won't turn on. This is to stop you sending secure information in plain-text over the wire. In Development mode, you will get a warning.
  
- Added a new standardised property to uibuilder control msg's. `msg._auth`. This contains all the necessary data for logon and ongoing session maintenance. As a minimum, this must contain an `id` property which uniquely identifies the user. It will also contain the JWT token since websockets don't allow custom headers.
  
- Security _does_ use JWT but only as a convenience. JWT is _NOT_ a security feature (despite what much of the web would have you believe). _Session processing_ is _required_ if you want real security. Again, see the security doc for details.
- Logon/logoff processing is done from the front-end using new `logon()` and `logoff()` functions in uibuilderfe.
- Logon/logoff and logon failure events are reported via uibuilder's control port (output port #2).
- Added security headers to protect against XSS and content sniffing.
- All custom security processing (validating user details - including password - and session validation/extension) is done via standard functions in the new `<uibRoot>/.config/security.js` file. A simple template is provided for you to use as a starting point. You can also override this with custom processing for a single instance by using `<uibRoot>/<url>/security.js`.

#### Details

- uibuilderfe: Added `.logon(...)` and `.logoff()` functions.
  
  The `logon` function takes a single parameter which must be an Object (schema not yet finalised).
  At the least, it MUST contain an `id` property which will be used by the server to track sessions.
  
  Added new variables to the uibuilder object for use in your front-end code:
  
  - `isAuthorised` {boolean} - informs whether the current client connection is authenticated.
  - `authTokenExpiry` {Date|null} - when the authentication token expires.
  - `authData` {Object} - Additional data returned from logon/logoff requests. Can be used by front-end to display messages at logon/off or anything else desired.
  - _`authToken` {String}_ - this is not externally accessible. It is sent back to the server on every msg sent and validated by the server.
  
  Added new control message types:

  - **'authorised'** - received from server after a successful logon request. Returns the token, expiry and any optional additional data (into `authData`).
  - **'authorisation failure'** - received from server after an **un**successful logon request.
  - **'logged off'** - received from server after a successful logoff request. Returns optional additional data (into `authData`).

- Added `useSecurity` flag. If set, the uibuilder instance will apply security processes.

  Note that if not using TLS security to encrypt communications in Node-RED, you will get at least a warning (in development mode. In production mode, security will turn off as there is no point).

- Added `security.js` template module and added processing from `<uibRoot>/<url>/security.js` or `<uibRoot>/.config/security.js`.
  
  In non-development node.js modes, logon processing will not work unless you have used your own security.js file.

  See the template `security.js` file for more information about what functions you need to export and about data schema's required.

  It isn't very hard to use and you don't need to know very much JavaScript/Node.js unless you want to get complex with your authentication and authorisation schemes.

  This is the core of the security processing. uibuilder enforces some standards for you but **you have to validate users and sessions**, uibuilder cannot do this for you. Instead, uibuilder makes
  this as easy as it can so that you don't have to be a mega-coder to work with it. Your user validation for example could be as simple as a file-based lookup.

  I will add more examples as the code stabilises so that you should be able to copy & paste a solution if you want soething fairly simple.


----

Because of the many changes in v3, the v2 changelog has been moved to a separate file: [v2 Changelog](/docs/CHANGELOG-v2.md).
Similarly, v1 chanegs are now in the [v1 Changelog](/docs/CHANGELOG-v1.md).

----

## Types of changes

- **Added** for new features.
- **Changed** for changes in existing functionality.
- **Deprecated** for soon-to-be removed features.
- **Removed** for now removed features.
- **Fixed** for any bug fixes.
- **Security** in case of vulnerabilities.