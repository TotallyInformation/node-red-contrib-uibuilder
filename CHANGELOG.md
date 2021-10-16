# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

uibuilder adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v4.1.1...main)

<!-- Nothing currently. -->

**WARNING**: Though I've done some work on the security features, they are still not ready. Do please try them but **NOT IN PRODUCTION**.

### TODO

* FIXES NEEDED:
  * [ ] ERRORCHECK: Imported node with not default template had default template on first deploy
  * [ ] ERROR: Removing a module after install but without closing and reopening editor panel did nothing
  * [ ] When turning on idx, link won't work until node re-deployed - reflect in panel UI
  * [ ] On connection, send current uib version to client

* Move package management to a new singleton class
  * [x] Use execa promise-based calls to npm
  * [x] Allow any valid npm name spec in editor
  * [x] Use `uibRoot`s package.json file for package management and add custom `uibuilder` property to it for managing package metadata and other config.
  * [x] Add display of version & URL path on installed packages list
  * [x] Allow version spec on install
  * [x] Move package management out of web.js
  * [x] Remove uib.vendorPaths
  * [-] Allow installation of GitHub and local packages - Need to finish LOCAL installs
  * [ ] Check for new versions of installed packages when entering the library manager

* [x] Add uib-sender node
  * [x] Dropdown to choose uib URL
  * [x] Allow passthrough of msg
  * Future enhancements:
    * Allow multi-instance sending
    * _Maybe_ Include schema checks - filter on available schema's from uib compatible components
    
* FE Changes
  * [x] Add optional `originator` param to send fn
  * [x] Add `setOriginator` method to set default originator
  * [ ] How to add originator to the eventSend method? via an HTML data- attrib or use mapper?
  * [ ] Add mapper to map component id to originator & extend `eventSend` accordingly
  * [ ] Add version check

* uibuilder Panel
  * [x] Switch from hide/show interface to tabbed interface
  * Files tab
    * [x] Remove the close button
    * [ ] _Maybe_ Move folder management to a popup dialog (to save vertical space)
  * Libraries
    * [ ] Remove the close button
    * [ ] Show additional info for each package: installed version, (location), served folder
  * [ ] Show template (instance root) folder

* [ ] Add a new template and example to demonstrate the sender node.
* [ ] Allow changes to socket.io config. [issue](https://discourse.nodered.org/t/uibuilderfe-socket-disconnect-reason-transport-close-when-receiving-json-from-node-red/52288/4)

* Templates
  * [ ] **Add ability to specify library dependencies in package.json** - not using the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot. Will need matching code in the Editor panel & a suitable API.
  * [ ] Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?)
  * [ ] Add example flows - using the pluggable libraries feature of Node-RED v2.1


* *Maybe*
  * *Maybe* Add caching option to uibuilder - as a shared service so that other nodes could also use it - allow control via msg so that any msg could use/avoid the cache - may need additional option to say whether to cache by msg.topic or just cache all msgs. May also need persistance (use context vars, allow access to all store types) - offer option to limit the number of msgs retained
  * *Maybe* add in/out msg counts to status?
  * *Maybe* add prev/curr version and checks?
  * *Maybe* add alternate `uibDashboard` node that uses web components and data-driven composition.
  * _Maybe_ On change of URL - signal other nodes? As no map currently being maintained - probably not possible
  * [ ] _Maybe_ Add uib-receiver node
    * [ ] Status msg to show node-id
    * [ ] Have to manually send to by adding originator property
  * _Maybe_ Add experimental flag - use settings.js and have an object of true/false values against a set of text keys for each feature.
    * [ ] Update docs
    * [ ] Add processing to nodes to be able to mark them as experimental.
  * *Maybe* Find a way to support wildcard URL patterns which would automatically add structured data and make it available to uibuilder flows. Possibly by adding the param data to all output msg's.
  

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
  * Add note about [default msg size](https://github.com/socketio/socket.io/issues/3946#issuecomment-850704139)
  * FE
    * Variables:
      * self.security - flag: indicates if server has security turned on
      * self.storePrefix
    * Functions:
      * self.initSecurity
      * self.setStore

### BREAKING

* **Installation of packages** for use in your front-end code has been **moved** from the `userDir` to `uibRoot`.

  Note that _only_ packages installed into the `uibRoot` folder will be recognised.
  
  Unfortunately, this means that you will need to re-install your packages in the correct location. You should uninstall them from the userDir.

  By default: userDir = `~/.node-red/`, uibRoot = `~/.node-red/uibuilder/`. However, both can, of course, be moved elsewhere.

  uibuilder will automatically create a suitable `package.json` file in `uibRoot`. That file not only lists the installed packages but also has a custom property `uibuilder` that contains metadata for the uibuilder modules. Specifically, it lists all of the necessary detailed data for the installed packages.

  The files `<uibRoot>/.config/packageList.json` and `<uibRoot>/.config/masterPackageList.json` are no longer used and may be deleted.

  You can now install not only packages from npmjs.com but also from GitHub and even local development packages. @scopes are fully supported and versions, tags, and branches are supported for both npmjs and GitHub installs.

### New

* **New node `uib-sender`** - this node allows you to send a msg to any uibuilder instance's connected front-end clients.
  
  That means that it is pretty much the same as sending a message directly into a uibuilder node.

  You select the instance of uibuilder you want to use by selecting an existing uibuilder URL from the dropdown.

  You can also select whether you want input messages to go straight to the output port as well. 
  
  Or, more usefully, you can allow "return messages". This allows a front-end client to send a message to node-red with some pre-defined metadata added that will route the message back to the `uib-sender` node. In this way, the sender node can be used as a semi-independent component.

  Note that this same method can be used by ANY custom node, check out the code to see how it works. It requires the use of an external, shared event module [`@TotallyInformation/ti-common-event-handler`](https://github.com/TotallyInformation/ti-common-event-handler). The msg metadata looks like: `{ _uib: {originator: <sender_node_id>}, payload: ... }`. The sender node id is just that, the Node-RED node id for the sender node instance.

  The `uibuilderfe.js` library has been updated to allow easy use of the `originator` property for `uibuilder.send()`. See below for details.

* Package Management. You can now install not only packages from npmjs.com but also from GitHub and even local development packages. @scopes are fully supported and versions, tags, and branches are supported for both npmjs and GitHub installs.
  
  Note that _only_ packages installed into the `uibRoot` folder will be recognised.
  
* New layout for the Editor panel.

  This is a much cleaner and clearer layout. It also blocks access to parts of the config that don't work until a newly added node has been Deployed for the first time so that its server folder has been created.

  There are also some additional error and warning messages to make things clearer.
  
* Updated node status display. Any instance of uibuilder will now show additional information in the status. In addition to the existing text information, the status icon will be YELLOW if security is turned on (default is blue). In addition, if _Allow unauthorised msg traffic_ is on, the icon will show as a ring instead of a dot.

* Added a version checker that allows uibuilder to notify users if a node instance must be updated due to a change of version.

### Changed

* `uibuilderfe.js` client library updated to allow for the use of an `originator` metadata property. This facilitates routing of messages back to an alternative node instead of the main uibuilder node.

  There are three ways to make use of this:

  * Use the new `uibuilder.setOrigin('<sender_node_id>')` function. This will then route ALL messages from the client back to the specified node. This is of marginal use because the main use-case for the property is to automate routing of data to/from web components of which there are likely to be several on a web page.
  * Use the new override parameter for the send function. `uibuilder.send(msg, '<sender_node_id>')`. This will send this one message back to the specified node. It will override the `setOrigin`. The utility `uibuilder.eventSend()` method has also been updated to allow the originator parameter.
  * Manually add the metadata to the node `{ _uib: {originator: <sender_node_id>}, payload: ... }`. This is not generally recommended as it is error prone. However, if writing custom front-end components, you may want to include the origin property as an option to allow end-to-end automatic routing of messages to/from your component instances.

  See the new `uib-sender` node details above for an example of using the `originator` property. That node adds the property to its received msgs before sending to your connected clients.

  Note that at present, control messages from the front-end cannot be routed to a different originator node, they all go to the main uibuilder node. This will be reviewed in a future release. Let me know if you think that it is needed.

* Improvements to the Editor help panel. Should hopefully be clearer and includes all of the settings and custom msg properties. Now uses a tabbed interface.

* Improvements to the "uibuilder details" page should make it easier to read. The data for ExpressJS Routes is much improved.

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

### Internal and development improvements

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

* Package management rewritten. Should be faster and uses async/Promise functions.

* Editor changes

  * Added a version checker that allows uibuilder to notify users if a node instance must be updated due to a change of version.

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

### Fixed

* `uiblib.js` `logon()` - Fixed error that prevented logon from actually working due to misnamed JWT property.
* A number of hard to spot bugs in `uibuilder.html` thanks to better linting & disaggregation into component parts
* In `uibuilderfe.js`, security was being turned on even if the server set it to false.
* Fixed an issue when removing uibuilder nodes caused by the move to socket.io v4. Should fix the failure to remove unused uib instance root folders and fix renaming problems as well.
* URL rename failed if user updates template before committing url change. This is now blocked.
* File editor failed if the node hadn't been deployed yet. Blocked if instance folder hasn't yet been created.





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