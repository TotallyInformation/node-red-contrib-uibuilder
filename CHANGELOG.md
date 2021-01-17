# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

uibuilder adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

----

## [Unreleased](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v3.0.1...master)

Nothing right now.

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