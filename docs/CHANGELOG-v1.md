## Changelog Archive for v1

Current major version changelog can be found in the root of this package: `../CHANGELOG.md`.

## v1.2.1

* **FIXED** File save wasn't working due to a parameter error, now fixed.

## v1.2.0

* **CHANGED** `url` property is now validated. It is required, it cannot be more than 20 characters long. It cannot be 'templates' (in preparation for a v2 improved template handling feature).
* **CHANGED** The admin API's `<adminurl>/uibfiles`, `<adminurl>/uibgetfile`, `<adminurl>/uibputfile` and `<adminurl>/uibindex` now have parameter validation.
* **CHANGED** Code for file/folder locations, e.g. `<userDir>/uibuilder` improved. Made to use a single variable. In preparation for better support of projects (probably in v2 as that may be a breaking change).
* **CHANGED** Code comments improved, more use of JSDoc.
* **CHANGED** Default file name to be edited is changed to `index.html` rather than `index.js` as it is more likely to exist.
* **CHANGED** Improved the `uibindex` admin API, added additional details. Use the type parameter set to 'json' or 'urls' (lists the urls in use by all of the instances of uibuilder, used by the admin interface to ensure unique). The default is to return a web page containing details. Admin ui help text also updated to include the admin API's.
* **CHANGED** Master template folder - files moved to sub-folder to allow for multiple master templates (e.g. VueJS as well as jQuery). In readiness for future changes.
* **CHANGED** General utility functions moved to a separate library, `tilib`.
* **CHANGED** New tilib function added `getNpmRunScripts`. Given a path, returns a list of available scripts from the package.json file in that path - or `undefined` if the file doesn't exist. If the optional 2nd parameter is supplied, looks for a matching script name and returns the script text - or `null` if the script isn't there. In preparation for adding npm processing (install, build, etc.).
* **CHANGED** Parametrised Master Template Folder. Preparation for more flexible template processing.
* **FIXED** ExpressJS app.use paths were not being removed on close processing.

**Current Version Limitations** 

* There are currently no checks to prevent you losing changes to edits if you close the admin window.
* If you create sub-folders in your `src` folder, you will not be able to edit the files there.

## v1.1.0

Please see [Issue #43](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/43) For the design details for this release.

**Current Version Limitations** ~~As yet there are no parameter checks on the API calls so the following URL's should **never** be exposed to potentially hostile environments (e.g. the Internet): `<adminurl>/uibfiles`, `<adminurl>/uibgetfile`, `<adminurl>/uibputfile`, `<adminurl>/uibindex`.~~ There are currently no checks to prevent you losing changes to edits if you close the admin window.

- **NEW** The node properties window in the admin UI now provides an "Edit Source Files" button. If clicked, the main properties are hidden and a file editor is shown. You can currently select any existing file in the `src` folder for the current instance and edit it. You can then save, reset or close the editor.

    * It is still a little too easy to lose changes by loading a different file or closing the properties window, reloading the interface, etc. More work is needed on the UI to help prevent this.
    * The delete button doesn't currently work.

- **NEW** Add admin API's and start of admin property ui for editing the front-end files in Node-RED.

    * File list API (get `/uiblistfiles`) gets all files in the instances src folder and populates a select drop-down. File list is rebuilt every time the properties admin ui window is opened. Requires user to have `uibuilder.read` permissions.
    * File read API (get `/uibgetfile`) reads the content of a file. Restricted to the node instances `src` folder. Requires user to have `uibuilder.read` permissions.
    * File write API (post `/uibputfile`) writes the updated content of a file. Restricted to the node instances `src` folder. Requires user to have `uibuilder.write` permissions.

- **NEW** The node now tracks how many instances of uibuilder have been added to your flows. It tracks by ID and retains the url used. In a future release, this will be used to ensure that unique URL's are used.
  
- **NEW** uibuilder index page (only prototype for now, not fully formed)
  
  * Index page API (get `/uibindex`) lists all of the main URL's served by all uibuilder node instances in the flows. Requires user to have `uibuilder.read` permissions.
  
- **CHANGED** Improved logging. Naming is more consistent, don't log to Node-RED log if Winston not used. Include instance url in Winston log line header for clarity. Increase Winston log file size. Logging also improved for debugging uibuilderfe.js.

- **DOCUMENTED** The front-end code for jQuery seems to move about randomly! It is in one of two places, if you get an error with the default location (the `dist` sub-path), remove `dist/` from the url.

- **CHANGED** `package.json` 'pack' script changed to 'packfe' to avoid clash with npm's native pack script.

## v1.0.12

- **FIX** Seems that the information given to me in [Issue 39]() wasn't quite correct. I should have done more investigation first!
  Reverting the location of JQuery in the template back to its original, correct, location.

  You won't notice unless you create a new node instance using the default jQuery `index.html` file.

## v1.0.11

- **NEW** Add some example flows to the example libary. 
  Use the Node-RED administration UI's menu `Import > Examples > uibuilder` to import them.
- **FIX** Bug in socket.io namespace if httpNodeRoot was set to something other than default. Also closes [Issue #30](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/30)

## v1.0.10

- **FIX** Fixed [Issue #39](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/39) - jQuery incorrect URL
  referenced in the html template file. Thanks to [Kevin Smets](https://github.com/kevin-smets) for reporting.

## v1.0.9

- **CHANGED** When a client connects, it receives a control message (`msg.uibuilderCtrl` = 'client connect'). That message now contains the property `msg.serverTimestamp`. This can be used in client code to work out the difference between the server time (which should always be in UTC) and the client browser time without needing any clever (and big) libraries such as MomentJS.

## v1.0.8

- **FIX** for [Issue 33](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/33). [Pull Request 38]() provided by [Ellie Lee](https://github.com/ellieejlee) - many thanks. Should fix the problem where double messages are output after a while.

## v1.0.7

- **CHANGED** Undo use of `RED.settings.get()` for properties in `settings.js` as this is apparently not correct. See [Node-RED issue #1543](https://github.com/node-red/node-red/issues/1543) for details.

## v1.0.6

- No changes, problem publishing to npm.

## v1.0.5

- **FIX** "TypeError: Cannot read property 'middleware' of undefined" - should now be fully resolved. You should _not_ require a `uibuilder` property in `settings.js`. If you do have the property, you should _not_ require a `uibuilder.middleware` property. Also switched to `RED.settings.get('prop')` instead of `RED.settings.prop`.

- **CHANGED** Split back-end code, utility functions now in uiblib.js

- **CHANGED** Minimum Node.JS version bumped up to 6.11

- **CHANGED** Improve documentation of the `settings.js` entries, provide better example code. Ensure everyone understands it is optional.

## v1.0.4

- **FIX** GitHub documentation path fixes

- **CHANGED** Moved To Do list to the [WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/To-Do)

## v1.0.3

- **FIX** `uibuilderfe.js` and `uibuilder.min.js` versions were different.

- **NEW** GitHub contributed and issues templates, EditorConfig file for consistent code submissions.

- **CHANGED** Update WIKI links in README and Further tidy up. Added new section on `settings.js`

- **CHANGED** Always force a pack of `uibuilderfe.js` before doing an `npm publish` using the `package.json` `prepublish` script.
  Ensures that we don't get another problem with mismatched builds.

- **NEW** Added optional ExpressJS middleware hook before the Node-RED one.

  _NOTE_: In this first implementation, there is only a single middleware function available. So ALL instances of uibuilder get the same middleware. Future versions will get one per node instance.

  This lets people have a different authentication/authorisation plugin to Node-RED's http-in/out nodes. If the uibuilder specific middleware is provided, the node-red middleware function is ignored.

  In `settings.js` `uibuilder.middleware` must be a function such as:

  ```javascript
    middleware: function(req,res,next) {
        console.log('I am run whenever a request is made to ANY of the uibuilder instances')
        next()
    },
  ```


## v1.0.2

- **CHANGED** Improved logging, custom format for log to file, some debug msgs swapped to verbose.
  Log files now rotate once they reach 50kb in size. Only 10 files are kept.
  You can now specify the back-end logging level you want in `settings.js`.

  Log levels are: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'. You can also use _true_ as before, that is equivalent to 'silly'

## v1.0.1

- **CHANGED** _uibuilderfe_: Socket namespace now derived from cookie first. Still uses URL as a backup.
  Allows the use of any html pages in the front end, even from sub-directories. As long as you don't have clashing URL's. Previously, trying to use a web page from a folder would break the Socket (which will still happen if the cookie can't be read).

  **WARNING**: All pages derived from a single uibuilder node instance share the _same_ Socket. It is up to you to filter out the msg's you need for any specific page.

  **Note**: If using an html file in a sub-folder, don't forget to adjust the relative URL's for resource loading.

- **CHANGED** _index.html_ Template and default. Made the relative URL's more obvious.
  `./rel-url-...` for things relative to the current folder. So if creating a page in a sub-folder, you need to use `../rel-url-...` (2 leading dots) to reach up a level to find the other JS and image resources.

## v1.0.0

All of the basic features are now complete and tested sufficiently to make this v1. Thanks to everyone that helped get this far. Watch out for node-red-contrib-infocache which will be coming shortly as a companion to handle message caching.

- **CHANGED** control message property "cache-control" now changed to "cacheControl" to make it easier to use.
- **CHANGED** _uibuilderfe_: Version bump
- **CHANGED** _uibuilderfe_: control message property "cache-control" now changed
  to "cacheControl" to make it easier to use.
- **CHANGED** _uibuilderfe_: Ensure control msgs have a "uibuilderCtrl" property
  set (defaults to "manual send" if not set)
- **CHANGED** _index.js master template_: Instructions updated and a manual cacheControl msg added

## v0.4.9

- **CHANGED** Rationalised control messages:
  "client connect", "client disconnect", "socket error", "ready for content"* (instead of "server connect", "client disconnected", ...) - those marked with * come from the client, everything else from the server.
- **CHANGED** Improved topic handling on control messages. Topic property only added if it is not blank.
- **CHANGED** Added "from" property to control messages. "server" or "client". Helps understand what is generating them.
- **CHANGED** Prevent msg loops by blocking any control messages from the node's input port.
- **CHANGED** _uibuilderfe v0.4.9_: Version bump and control messages rationalised as above.

## v0.4.8

- **NEW** A second output port has been added that gives access to some control messages.
  This allows additional processing when a client connects or disconnects, an instance is (re)deployed or there is a socket error. You could, for example, output some standard information when a new client connects. Or you could use the information for utilisation metrics.
- **NEW** Exposed server control messages:
  'server connect' (when a client connects), 'client disconnect', 'shutdown' (when Node-RED shuts down or the node is (re)deployed), 'socket error'.
  See the [Control Message Structure](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Control-Message-Structure) page in the WIKI for details.
- **NEW** Added flag to block copy of index.(css|js).
  See [GitHub Issue #21](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/21)
  **WARNING**: For existing instances, this flag is not set even though it is the default. This appears to be an issue with Node-RED.
- **NEW** _uibuilderfe_: You can now send control messages from the front-end to the server using `uibuilder.sendCtrl(msg)`
- **NEW** _uibuilderfe_: Added ability to send a control message of type 'ready for content'.
  This is meant to be used to trigger sending of cached messages from the server so that new or reloaded pages receive the last message(s) from the server. By default, this is triggered from the window.load event (e.g. after the DOM and external resources have been loaded). If you are using a front-end library such as MoonJS/Riot/Vue/etc, this may be too early. In which case, use `uibuilder.autoSendReady(false)` and then use ~~`uibuilder.sendCtrl({'type':'ready for content'})`~~ `uibuilder.sendCtrl({'uibuilderCtrl':'ready for content', 'cache-control':'REPLAY'})` when your app is ready for content (e.g. perhaps at the end of the `app.mounted` event).
- **CHANGED** _uibuilderfe v0.4.8c_: cache-control property added in readiness for integration with
  [node-red-contrib-infocache](https://github.com/TotallyInformation/node-red-contrib-infocache).
  Manual cache replay requires `uibuilder.sendCtrl({'uibuilderCtrl':'ready for content', 'cache-control':'REPLAY'})`
- **CHANGED** _uibuilderfe v0.4.8d_: Renamed control property `'type'` to `'uibuilderCtrl'`.
  See [Issue #22](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/22).
- **CHANGED** `_socketId` properties now consistent for all control messages.
  This allows Node-RED to do something and then return a msg to the originating client. If you need to broadcast to all clients, simply delete the `_socketId` property before sending.
- **CHANGED** _uibuilderfe_: All instances of "attribute" replaced with "property".
- **CHANGED** _index.js_: The `index.js` template file has been updated
  with clarified information on available `uibuilder` methods and properties. Temporarily rename your local copy and redeploy node instances to get the latest and then swap over.
- **CHANGED** _GitHub WIKI_: Restructured the
  [home page](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/), created a new [Getting Started](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Getting-Started) page. Updated the [page on caching and replay of messages](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Message-Caching)

## v0.4.7

- CL: Added check and load Socket.IO for running via webpack.
- CL: Reinstate missing force (re)connection to Socket.IO check on initialisation.
- Fix typo in readme.
- Added available URL paths and the global uibuilder settings to the admin settings ui.
  So that you can see what modules have been loaded and made available to your front-end code.
- FIX: Incorrectly derived Socket.IO namespace in `uibuilderfe.js`.
  Didn't work if the web page was on a sub-path such as `/uibuilder/vega` - thanks to Steve Rickus
- FIX: Incorrectly derived Socket.IO namespace in `uibuilder.js`.
  Didn't work if `settings.js` `httpNodeRoot` was set to anything other than `/`
- To Do's moved to [separate file](TODO.md)
- Additional tidy up and clarity in README

## v0.4.6

- Added ability to include `msg.script` and `msg.style` in messages sent to the front-end from Node-RED (over Socket.IO).
  These must contain valid javascript and CSS respectively in the form of strings or arrays of strings. Currently there is minimal validation so some caution should be used. I will be adding configuration flags to allow admins to block this.
- Added new node configuration flags to (dis-)allow scripts or styles to be input via incoming msg's.
- Added new node configuration flag to easily turn on/off debugging information in the front-end -
  check the browser developer console for the additional output if turned on. You can still override in `index.js` or at the browser developer console by using `uibuilder.debug(true)` etc.
- FIX: Bug that didn't correctly remove/re-apply Express static routes on (re)deploy has been fixed.

## v0.4.5

**Note:** The master front-end template files have changed again. Specifically, they now use a minimised version of `uibuilderfe.min.js` & that code is better isolated, only the `uibuilder` function is exposed.

- Minimised and better isolated the front-end code.
- Some minor issues dealt with in the FE code.
- New FE function: `uibuilder.me()` that either returns the code version (if debug not set) or the complete function object for better debugging.
- `uibuilder.debug()` now returns the current debug state if no boolean parameter given. Parameter validated as boolean|undefined.
- Fixes for changes in new version of `get-installed-path`.
- Begun to add JSDoc throughout and added `// @ts-check` to better validate code.
- Update dependencies to latest.

## v0.4.2

**Note:** The master front-end template files have changed significantly in this release. It is suggested that you rename your local folder (`~/.node-red/uibuilder/uibuilder`) - and let the node rebuild it for you with the latest template. Most of the message handling code is now hidden away in a JavaScript file that you don't need to deal with `uibuilderfe.js`. The new `index.html` automatically loads that for you and the new `index.js` shows you how to use it. The old templates still work but aren't as nice and may stop working correctly in the future.

- Restructure the front-end JavaScript.
  A single global object is created by `uibuilderfe.js` called `uibuilder`. This encapsulates all of the core logic. It has an `onChange` method that lets you monitor its attributes for changes and take action as appropriate.
  Debugging is also easier to turn on/off by the function `uibuilder.debug(true)`. It has `set` and `get` methods for writing/reading attributes; `set` disallows setting of core attributes.
  There is also a `uibuilder.send` method that sends a message back to Node-RED - e.g. `uibuilder.send({topic:'uibuilder',payload:'Smashing!'})`
- Fix for using `dist` folders instead of `src` ([Issue 13](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/13)). Also improved debug logs
- Changed logging so that, if not using the debug setting,
  produces only minimal output and that goes to the standard Node-RED log instead of the log file. Turning on debugging using the setting in `settings.js` will output to the log file `~/.node-red/uibuilder.log`
- Added default master src/index.html which covers the situation where you delete your live, local index.html from dist or src. You get a page that tells you how to fix it.
- Page icon changed from red to blue to help visual identification of the page amongst other Node-RED tabs
- More tidying of the documentation. Making sure it is consistent and removing to do entries now completed

## v0.4.0

*Breaking Change*: You must have at least `index.html` in your local override folder. For Socket.IO, you will also need to have `index.js`.

- Copy template files to local override folder if not already existing - this will
  save users having to hunt down the template files which exist in this module.
- Move master front-end files from `src` to `templates` folder.
- Tweak front-end `index.js`, better Socket.IO reconnect logic
  (thanks to [Colin Law](https://github.com/colinl), [Issue 9](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/9), [Pull request #11)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/11).
  Also tidy code and start to extract JQuery specifics from core logic in preparation for a complete separation to make coding easier for users.
- Enable msg's to be sent from server to a specific client instance by adding `_socketId`
  attribute to the `msg`. The ID must match the appropriate client ID of course.
- Links to WIKI and table of contents added to README.
- Switch from using fs to use fs-extra node.js module. Initially for copying the template files but later on for refactoring all fs code.
- Remove config switch for "Use reproduces in custom folder" as this is always done now.
- Add connected state to default page template
  (thanks to [Colin Law](https://github.com/colinl), [Pull request #12](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/12))

## v0.3.8

- Fix for [Issue 2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/2) - not finding normalize.css & JQuery front-end libraries.
  Adds the `get-installed-path` module to find out where the modules are actually loaded from.
- An enhancement of the above fix that uses `require.resolve()` as a backup to try and find the front-end module location if `get-installed-path` fails.
  However, this can return a machine folder that is invalid for use as a source for adding as a static path for ExpressJS.
- Additional fix for the above - force the current working folder to be the NR `userDir` for get-installed-path as some installations of NR leave
  the cwd point at the home folder not the userDir.
- Replace native Node-RED logging with Winston. If `debug: true` is added to the uibuilder section of NR's `settings.js`, a file called `uibuilder.log`
  is created in your userDir (`~./node-red` by default) containing detailed logging information.
- The flag for forwarding the incoming msg to output is now active. If not set, the only output from the node is when something is received from a
  connected front-end client browser. Note that the default front-end web page is quite "chatty" and sends control messages as well as anything you
  set up; this is easily disconnected. Also fixed bug, see [Issue 4](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/5)
- Option to *not* use the local folders was broken. Now fixed.
- Possible fix for loss of reconnection, see [Issue 3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/3)

## v0.3.1

- Fixed issue when no config settings found. Added getProps() function
  Error prevented anything from working. Changed to use getProps to prevent.

## v0.3.0

- Fixed incorrect line endings. Updated front-end manifest.json. Fixed minor error in uibuilder.js. Updated dependency versions.
- Breaking changes due to new major version of Socket.IO ([v2](https://socket.io/blog/socket-io-2-0-0/)) and Webpack. Shouldn't impact anything since you need to restart Node-RED anyway.
  However, you might need to force a full reload of any active clients.

## v0.2.1

- Tweak this readme as the node seems to work OK. Removing the _Alpha_ label.
  You should consider this suitable for general hobby use. Production use would need good testing before trying to rely on it.
  Remember, this has been written just by me, I'm afraid I can provide no guarantees.

## v0.2.0

- Fixed incorrect app.use logic which meant that the tree order was incorrect. Also improved app.use removal though still not perfect, seems to be a limitation of ExpressJS v4

## v0.1.4

- Add logic to client to start retrying to connect after server closedown
- Final code and text tidying ready for wider use

## v0.1.3

- Add control msgs from server to client on closedown of server (e.g. for redeploy)
- Add topic to node config
- Add userVendorPackages to node config

## v0.1.2

- Simply dynamic front-end code using JQuery. Fixed typo's in docs. Fixed auto-respond test messages. Add path to Socket.IO to make sure the client loads the right version from the server.

## v0.1.0

- Initial release to npm. Socket.IO namespace working, src/dist folders available and working. Only the most basic front-end template included.
