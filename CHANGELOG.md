# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

uibuilder adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.6...master)

### Summary

As this contains rather a lot of changes, here is a summary of the key changes for users of the node. The details are in the following sections.

- New security features
  
  - Security features can be turned on via a flag in the node configuration. They are off by default.
  - Security is mostly controlled via websocket messages, not by HTTP. The web UI itself is assumed to be non-sensitive. Only msg transfer is controlled. Read the security document for details.
  - Security does use JWT as a convenience. JWT is _NOT_ a security feature though (despite what much of the web would have you believe). Session processing is required if you want real security. Again, see the security doc for details.
  - Logon/logoff processing is done from the front-end using new `logon()` and `logoff()` functions in uibuilderfe.
  - Logon/logoff and logon failure events are reported via uibuilder's control port (output port #2).
  - Added a new standardised property to uibuilder control msg's. `msg._auth`. This contains all the necessary data for logon and ongoing session maintenance. As a minimum, this must contain an `id` property which uniquely identifies the user. It will also contain the JWT token since websockets don't allow custom headers.
  - Added security headers to protect against XSS and content sniffing.
  - All custom security processing (validating user details - including password - and session validation/extension) is done via standard functions in the new `<uibRoot>/.config/security.js` file. A simple template is provided for you to use as a starting point. You can also override this with custom processing for a single instance by using `<uibRoot>/<url>/security.js`.
  - If running in Production mode but without using TLS encryption, the security won't turn on. This is to stop you sending secure information in plain-text over the wire. In Development mode, you will get a warning.
  
- New security documentation
- `vue` and `bootstrap-vue` packages can now be removed (NB: if uibuilder previously installed, you need to remove and reinstall for this to be possible)
- Scoped packages can now be added and removed
- Improved Editor configuration panel layout for Advanced Settings
- Some simplification of the default VueJS JavaScript template. Makes it a little easier to read.
- **NOT YET WORKING** Added configuration option to add browser/proxy caching control to all static assets - set the length of time before assets will be reloaded from the server. This may sometimes significantly improve performance in the browser. It depends on the performance of your server and the complexity of the UI.

### New

- Moved pre-installed VueJS and bootstrap-vue to be installed into `<userDir>` instead of into the uibuilder package folder.
  
  This allows the `vue` and `bootstrap-vue` packages to be uninstalled like everything else and resolves Issue [#75](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/75).

  Note that, at present, I have not added any clever code to remove the old installations of vue and bootstrap-vue. If you want to get them into the right place, shut down Node-RED, manually remove and re-add uibuilder from the security branch. Note that you don't need to do anything unless you want to be able to remove `vue` and `bootstrap-vue`.
  
- Add a middleware JavaScript module file to allow use of `socket.use`. 
  
  The new `<uibRoot>/.config/sioUse.js` file exports a single function.

  The function is called everytime the uibuilder node receives a message from a client. If the `next()` callback function is called with a `new Error('err message')` parameter, that is passed back to the client.

- uibuilderfe: Add socket.io `error` event handler - 
  outputs a console warning message so switch on debug to see it. 
  
  The Socket.IO server will send an error message if the socket.use middleware (see above) calls `next( new Error('err message') )`

  Add your own event handler to do something useful with the message.

  Typical use is to handle data errors or even authorisation failures.

- uibuilderfe: Added msg._socketId to sent messages.
  
- uibuilderfe: Added `.logon(...)` and `.logoff()` functions.
  
  The `logon` function takes a single parameter which must be an Object (schema not yet finalised).
  At the least, it MUST contain an `id` property which will be used by the server to track sessions.
  
  Added new variables:
  
  - `isAuthorised` {boolean} - informs whether the current client connection is authenticated.
  - `authTokenExpiry` {Date|null} - when the authentication token expires.
  - `authData` {Object} - Additional data returned from logon/logoff requests. Can be used by front-end to display messages at logon/off or anything else desired.
  - _`authToken` {String}_ - this is not externally accessible. It is sent back to the server on every msg sent and validated by the server.
  
  Added new control message types:

  - 'authorised' - received from server after a successful logon request. Returns the token, expiry and any optional additional data (into `authData`).
  - 'authorisation failure' - received from server after an **un**successful logon request.
  - 'logged off' - received from server after a successful logoff request. Returns optional additional data (into `authData`).

- uibuilderfe: Add logon/logoff example UI and processing.
  
- Added `X-XSS-Protection: 1;mode=block`, `X-Content-Type-Options: nosniff` and `'x-powered-by: uibuilder` security headers.
  
  If you want to add your own headers, make use of the `uibMiddleware.js` (for ExpressJS) and `sioMiddleware.js` (for Socket.IO initial connection and polling connections) middleware files.

- Added security documentation.

  Read these to understand how to use uibuilder security and how it works (respectively).
  
  [uibuilder Security Documentation](./docs/security.md) and [security.js Technical Documentation](./docs/securityjs.md).

- Added `useSecurity` flag. If set, the uibuilder instance will apply security processes.

  Note that if not using TLS security to encrypt communications in Node-RED, you will get at least a warning (in development mode. In production mode, security will turn off as there is no point).

- Added `security.js` template module and added processing from `<uibRoot>/<url>/` or `<uibRoot>/.config/`.
  
  In non-development node.js modes, logon processing will not work unless you have used your own security.js file.

  See the template file for more information about what functions you need to export and about data schema's required.
  It isn't very hard to use.

  This is the core of the security processing. uibuilder enforces some standards for you but you have to validate users and sessions. uibuilder makes
  this as easy as it can so that you don't have to be a mega-coder to work with it. Your user validation for example could be as simple as a file-based lookup.
  I will add more examples as the code stabilised so that you should be able to copy & paste a solution if you want soething fairly simple.

- **NOT YET WORKING** Added on options variable for serve-static to allow control of caching & other headers. `uib.staticOpts`.

  Some static folders are served at module level and so don't have access to instance settings. Would likely need to have different settings on global serves from instance ones. _Needs more thought_.

  This lets you control caching of your "static" assets like JavaScript, HTML, CSS, Images and any installed front-end library resources (Vue, etc).

  Note that this is **not** for caching the msg's coming through the node, see the caching examples in the WIKI for that.

### Changed

- Documentation: Greatly improved documentation coverage in the `/docs` folder. This contains a lot of developer documentation which should make it easier to work on improvements to uibuilder in the future.
- Editor: Tidy up the Advanced Settings section of the configuration panel.
- uibuilderfe: Internal improvements to get/set functions.
- uibuilderfe: Simplify default Vue templates.
- Further code tidy up.
- Move configuration template files from templates root to `templates/.config` and reduce copy processes down to just copying the folder with no overwrite.
- Add code isolation to Editor config code.
- Improve standardisation of output topic.
- Moved some serveStatic code back to instance level to allow caching to be changed by config.
- Changed palette category name from "UI Builder" to "uibuilder" and palette label to "uibuilder" from "UI Builder" for consistency with other nodes.
- Removed `httpRoot` from the Socket.IO namespace. It is no longer required anyway since url uniqueness checks were added.
- Moved all front-end master code (e.g. `nodes/src` and `nodes/dist`) to new top-level folder `front-end` & refactored `uibuilder.js` accordingly. Folder references also changed to new properties in the `uib` variable.
- Moved the templates folder from `nodes` to its own top-level folder and refactored uibuilder.js accordingly. The folder reference is held in the `uib.masterTemplateFolder` variable.

### Fixed

- Allow for npm [Scoped Packages](https://docs.npmjs.com/using-npm/scope.html). e.g. those like `@riophae/vue-treeselect`.
  
  These can now be added and removed.

- Running behind a proxy was causing Socket.IO namespace issues (see [Issue #84](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/84)
  Removing `httpRoot` from the namespace should fix that. It is no longer required anyway since url uniqueness checks were added.

----

----

Because of the many changes in v3, the v2 changelog has been moved to a separate file: [v2 Changelog](/docs/CHANGELOG-v2.md).
Similarly, v1 chanegs are now in the [v1 Changelog](/docs/CHANGELOG-v1.md).

----

Types of changes
Added for new features.
Changed for changes in existing functionality.
Deprecated for soon-to-be removed features.
Removed for now removed features.
Fixed for any bug fixes.
Security in case of vulnerabilities.