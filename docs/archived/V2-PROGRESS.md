This is the design note for part 2 of enabling source file editing from the Node-RED admin ui.

The [main To Do list is now in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/To-Do).

**NOTES**: 

* Developer documentation is now included in the `docs` folder of this repository.
* Please refer to Issue #43 on GitHub for the part 1 design notes that show everything implemented in uibuilder v1.1.0.
* Since the URI's for uibuilder have changed between v1 and v2, I've created [a WIKI page summarising the new ones](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths).
* If using Node-RED's "projects" feature, each project now gets its own `uibuilder` folder. Without projects, this is located at `<userDir>/uibuilder/`. With projects, it will be located at `<userDir>/projects/<projectName>/uibuilder/`. **This location will now be referred to as `<uibRoot>`**.

----

### In Progress

Revamped full-screen editor

* [x] remove horizontal resize bar {panel.html #119}
* [x] Exchange arrow button (fa-expand/fa-compress) {panel.html #124}

### To Fix

Feedback from [this thread](https://discourse.nodered.org/t/uibuilder-v2-now-published-to-npm-under-the-next-tag/13998/13):

* [x] [Major] Default VueJS template Javascript contains some ES6 rather than ES5 (`const`,`let` replaced by `var`)
* [x] [Minor] Admin ui: Most links don't force target=_blank in panel and help.
* [x] [Minor] Admin ui: New file creation dialogue, button says "New", change to "Create".
* [x] [Minor] Admin ui: better documentation - esp. in regard to full-screen button. (Added to help panel)
* [x] [Minor] Documentation: Note about bootstrap warning (ignore)
* [x] [Major] Admin ui: Full-screen editor only uses Javascript language instead of inheriting the correct language (e.g. html)

Other (likely delayed to v2.1):

* [Minor] Admin ui/uiblib.checkInstalledPackages: Pass package file read errors back to admin ui. Currently only shows in Node-RED log.
* [Minor] Admin ui: In file editor, cannot currently edit files in sub-folders of src/dist. Also cannot create/delete/rename sub-folders.
* [Minor] Admin ui: In file editor, cannot currently rename files.
* [Minor] Admin ui: In file editor, none-text files cannot be handled but we want them so we can upload/rename/delete them.
* [Minor] Admin ui: Improve admin user notifications for install/remove packages
* [Minor] Use [Glob](https://www.npmjs.com/package/glob) to enhance the source files list.

* ~~Add new middleware processing~~
* ~~Admin ui: add close button~~
* [~~Major~~ Fixed] Admin ui: Deploy causes vendor paths (except socket.io) to disappear
  Bug introduced by moving vendor path processing to outside of the instance process. So we have to exclude the vendor paths when killing the instance paths during the close event.
* [~~Minor~~ Fixed] fe: server time offset not working even though the 'client connect' control message from the server includes `msg.serverTimestamp`
* [~~Minor~~ Fixed] Admin ui default text for advanced is "Path & Module Details", code sets it to "Path & Module Info"

## Moved to v2.1 (or above)

Please see the [To Do page in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/To-Do).

----

## The Details

### Improvements to front-end (`uibuilderfe.js` and templates)

- [x] Move socket.io client library path to include `httpNodeRoot`.
- [x] Move socket.io client library path to include `vendor`. Path is now `../uibuilder/vendor/socket.io/socket.io.js` to match other vendor paths.
- [x] Change default template from jquery + normalize.cs to VueJS + bootstrap-vue (much the same size)
   - [x] Needs to auto-install vue and boostrap-vue packages.
- [x] Fix regression bug preventing socket.io from communicating when `httpNodeRoot` not set. Add `urlJoin()` to fix.
- [x] FE: Ability to manually set the ioNamespace & ioPath so that uibuilderfe can be used from other servers and sub-paths without issues.
   Will need to have users start socket.io in their own code though since you cannot change the namespace/path once started.
   The alternative would be to create a new middleware path that returned the right data but that wouldn't allow cross-server use.
   We might have to enable CORS config?
   - [x] Add new user function uibuilder.start(namespace,ioPath) - where params are optional and will default to the existing settings
- [x] Default Vue template improvements
   - [x] Better syntax highlighting (css)
   - [x] Additional inputs: text & checkbox to augment the counter button + change button to bootstrap-vue button.
   - [x] Highlight message count numbers
   - [x] Add socket.io connection status and time offset from server
   - [x] Fix header image
   - [x] Shuffle layout
   - [x] Add more bootstrap-vue formatting to make things pretier.

### Improvements to back-end (`uibuilder.js`)

- [x] Move vendor file serving from instance level to module level so it is only ever done once. Also rationalise.
- [x] Move uibindex API from standard to admin web interfaces for better security.
- [x] Add `<adminurl>/uibvendorpackages` admin API.
- [x] Use `<adminurl>/uibvendorpackages` API to list available vendor package urls in admin ui.
- [x] Move socket.io client library path to include `httpNodeRoot` & `vendor`.
- [x] ~~Move active vendor package list from `settings.json` to `<uibRoot>/` to allow it to be updated by install handling.~~ No settings file now needed. (Breaking change - if uncommon library used, will need to add it using the admin ui, common libraries will be picked up automatically)
- [x] ~~Add initial process to move settings after migration from v1 to v2.~~ Settings no longer required.
- [x] Add Socket.IO path to the `<adminurl>/uibindex` API - in preparation for enabling other nodes to communicate with uibuilder front-end's.
- [x] ~~Fix the folder location lookup for front-end packages. New function `findPackage` added to `tilib.js`, replaces the `get-installed-path` 3rd party package.~~ Completely rewritten
- [x] ~~Add extra info to the `vendorPaths` variable. Including whether the package is include in the `<userDir>/package.json` dependencies & information from the packages own package.json file including homepage, main entry point and version string.~~ Completely rewritten.
- [x] Remove Winston ~~and replace with native `new Console()` instead? https://nodejs.org/docs/latest-v8.x/api/console.html#console_new_console_stdout_stderr~~
- [x] Integrate logging back into standard Node-RED log output. Set Node-RED's logging level to `debug` or `trace` to see details.
- [x] With move of npm package installations into the admin ui, settings are no longer required. Common front-end packages will be found and added to the vendor list automatically. Others have to be added via the admin ui. `vendorPaths` variable is now used to contain the list of available packages and their metadata. See docs for details.
- [x] Remove debug setting from initialised console output
- [x] Remove FE/BE debug flags from admin ui config
- [x] Update close processing to EXCLUDE vendorPaths. Because they are used across all instances.
- [x] Add/Remove/Update npm packages in userDir (for front-end library management).
- [x] Check url is free to use - using the uibindex api
- [x] Does not contain leading dots or underscores
- [x] Does not contain `/` or `\`

- [x] Add `<adminurl>/uibnpm` admin API. Enable npm commands to be called from the admin ui. Checks whether `package.json` is available. Work against `userDir` or `<uibRoot>/<url>` locations (optional `url` parameter).
    - ~~Handle npm restart scripts~~
    - ~~Use `POST /nodes` API instead of npm? https://nodered.org/docs/api/admin/methods/post/nodes/~~
    - [x] List all installed top-level packages
    - [x] Allow check if `package.json` and `node_modules` are present
    - [x] Allow creation of `package.json` in `userDir` or `<uibRoot>/<url>`.
    - [x] Allow package installations/updates/removals.
    - [x] Allow edit of `package.json` in `<uibRoot>/<url>`.

- [x] Use projects folder if projects are in use. See [PR #47](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/47) for details.
- [x] Allow for middleware to be loaded from files in `<uibRoot>/.config` both for http and for websockets


### Improvements to admin config ui (`uibuilder.html`)

- [x] Swap vendor path list to uibvendorpackages API
- [x] Cancel and Done buttons disabled if there are unsaved changes to a file. Either Save or reset the file to re-enable them.
- [x] Improved validation for url setting. It must not be more than 20 characters, must not equal 'template'. Must not contain '..', '/' or '\'. Must not start with '_', '.'. It must also be unique (e.g. not already in use). `instances` module variable now used to track all active instances of uibuilder.
- [x] Default/previously selected file opened for edit automatically.
- [x] Improved handling of reopening the ui - last file selection retained.
- [x] Add input parameter and path validation
- [x] ~~(uibuilder.html) Mark node as "dirty" if file not saved. (`RED.nodes.dirty(true)`).~~ Disable Done/Cancel buttons instead, a lot easier.
- [x] Hide path and module info by default and allow toggle to show
- [x] ~~Add server path to info panel `<userDir>/uibuilder/<url>` or `<userDir>/projects/<projectName>/uibuilder/<url>`.~~ Redirecting to the index page instead.
- [x] Remove edit button - swap file on file selection change.
- [x] Split uibuilder.html into 3 files for ease of editing. Add a build step to assemble. `npm run build`.
- [x] ~~Move back-end log files from `<userDir>` to `<uibRoot>/.logs`~~ Logging now integrated to Node-RED logs.
- [x] Remove FE/BE debug flags from admin ui config
- [x] Add new file button
- [x] Add file delete ~~(button is in place but disabled)~~ - needs a confirm dialogue
- [x] Add interface for npm operations. Using `<adminurl>/uibnpm` admin API.
- [x] Move Installed Packages editable list into the "Manage Front-End Libraries" section.
- [x] New _Advanced settings_ option (hidden by default)
- [x] Add notifications when installing/removing npm packages.
  
- [x] Add folder selector before file selector - enables files in different folders to be edited. Folders are pre-selected.
   - [x] Rebuild file list on change of folder
   - [x] Add all instance folders (`<uibRoot>/<url>/src|dist|root`)
   - ~~Add uibuilder root folder & config file~~ No, as this would require Node-RED to be reloaded anyway, decided not to do this. npm functions will manage content.
   - ~~How to rebuild list if the file list changes outside of Node-RED?~~ Just change to another folder and back.
- [x] Add option to create a web index showing full contents of node instances custom folder (including `src` and `dest` folders). Available to end user clients if flag is set.

### Docs

- [x] Update WIKI and examples for new paths
- [x] Add Doc view page using Docute or Docsify

## Next Release

These features are moved to the v2.1 release

### Admin UI

- New _Advanced settings_ option (hidden by default)
   - Add flag to make use of project folder optional.
   - Allow (advanced option) use of a NEW ExpressJS app (rather than reusing RED.httpNode) - 
     giving the ability to have extra control, use a different port and separate security.
      - Need to make use of Node-RED middleware optional.
      - Add option to keep backups for edited files + button to reset to backup + hide backup files

- Add npm package delete confirmation - probably via std NR notifications
- When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.

- Add subfolder support for dist and src, possible for root

- Add all instances endpoint folders

- ?? Can we add the current nodes URL to the info panel? ?? 
      [See 'Read node data from node-info panel'](https://discourse.nodered.org/t/read-node-data-from-node-info-pane/10210/5)
 
- Deleting one of the template files will reset it to the default if the copy flag is enabled in the main properties.
 
- Add validation hints for users

- Use `https://api.npms.io/v2/package/<packageName>` to highlight installed modules that have updates

- Add a "Build" button, disabled by default. uibuilder will check whether there is a `package.json` file in the `<uibRoot>/<uibUrl>` folder 
  and whether it contains a script called "build". If that exists, the build button will be enabled.

     This will need you to have followed the [build instructions in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/Using-VueJS-with-Webpack). Or to have come up with some other build process.

    - Add example webpack build file.

- Allow change of uibuilder.url to:
   - Copy (or rename?) current folder to new folder

- Provide template package.json file to go into `<uibRoot>/<uibUrl>` - provided automatically if user creates a file called package.json.

* File editor needs to handle file uploads.
* File editor needs to handle sub-folders for src & dist only.
* File editor needs to handle common folder not just the instance folder.
* Deal with instance folders build script if found.
* Build script processing needs the ability to do npm handling for the instance folder not just for userDir.

## New Ideas

* Expose the uibuilder's `docs` folder as a url so that the docs can be viewed in Node-RED
* Define msg.uib property as reserved. To allow for comms to specific component types and html ID's.
   * uibuilderfe: If msg.uib present on incoming normal msg, don't include in normal msg event. Will be used in
         dedicated uib components to allow a Dashboard-like experience.
   * ? May need new nodes to make comms easier ?
* New node: allowing a socket.io "room" to be defined. Will need to pick a current main instance from a dropdown (using API)
   * Change FE to allow for rooms.
* New node: cache - see WIKI cache page for details.
* Node(s) for specific web components. Possibly allowing the component to be pushed over ws. [Ref.1](https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/)


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


## References

* FE/BE API: [Serialport node](https://github.com/node-red/node-red-nodes/tree/master/io/serialport). [html](https://github.com/node-red/node-red-nodes/blob/master/io/serialport/25-serial.html#L333), [js](https://github.com/node-red/node-red-nodes/blob/master/io/serialport/25-serial.js#L424)
* Expand edit area: [Function node](https://github.com/node-red/node-red/blob/master/nodes/core/core/80-function.html)
* Switch editor type: [Template node](https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.html). [drop-down/select html](https://github.com/node-red/node-red/blob/master/nodes/core/core/80-template.html#L20)
* Admin ui button: [Google Authenticate config node](https://github.com/node-red/node-red-web-nodes/blob/master/google/google.html#L37)
* ACE [How-To](https://ace.c9.io/#nav=howto), [Configuring](https://github.com/ajaxorg/ace/wiki/Configuring-Ace)
* ExpressJS v4 [Docs](http://expressjs.com/en/api.html#res.sendFile)
* jQuery [Docs](https://api.jquery.com)
* [Official docs for creating nodes](https://nodered.org/docs/creating-nodes/)
* [How the deploy button works](https://github.com/node-red/node-red/blob/a6ef755139613a7261372c692189f21115b2d0c6/editor/js/ui/deploy.js#L260)
* [CORS failure when using jQuery POST](https://stackoverflow.com/questions/5584923/a-cors-post-request-works-from-plain-javascript-but-why-not-with-jquery))
* [Notifications in the admin ui (RED.notify(msg,type))](https://github.com/node-red/node-red/wiki/API-Reference#ui)
* [Read node data from node-info panel](https://discourse.nodered.org/t/read-node-data-from-node-info-pane/10210/5)
* Creating an eventlog display in the admin ui: See `RED.eventLog` in `red.js` - uses the ACE editor.
* [socketio-jwt-auth](https://www.npmjs.com/package/socketio-jwt-auth)
* [node-red-contrib-socketio](https://github.com/wperw/node-red-contrib-socketio)