## Changelog Archive for v2

Current major version changelog can be found in the root of this package: `../CHANGELOG.md`.

----

## [2.0.8](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.7...v2.0.8)

### Fixed

- Allow for npm [Scoped Packages](https://docs.npmjs.com/using-npm/scope.html). e.g. those like `@riophae/vue-treeselect`.
  
  These can now be added and removed. Fixes [Issue #71](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/71). Thanks to Stephen McLaughlin.


## [2.0.7](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.6...v2.0.7)

### New

- Add a middleware JavaScript module file to allow use of `socket.use`. The new `<uibRoot>/.config/sioUse.js` file exports a single function.
  The function is called everytime the uibuilder node receives a message from a client. If the `next()` callback function is called with a `new Error('err message')`
  parameter, that is passed back to the client.

- uibuilderfe: Add socket.io `error` event handler - outputs a console warning message so switch on debug to see it. 
  
  The Socket.IO server will send an error message if the socket.use middleware (see above) calls `next( new Error('err message') )`

  Add your own event handler to do something useful with the message.

  Typical use is to handle data errors or even authorisation failures.

- Add `X-XSS-Protection: 1;mode=block` and `X-Content-Type-Options: nosniff` security headers.
  
  If you want to add your own headers, make use of the `uibMiddleware.js` (for ExpressJS) and `sioMiddleware.js` (for Socket.IO initial connection and polling connections) middleware files.

### Changed

- Further code tidy up.
- Move configuration template files from templates root to `templates/.config` and reduce copy processes down to just copying the folder with no overwrite
- Removed `httpRoot` from Socket.IO namespace. No longer required now that uniqueness checks are done on URL config. Simplifies configuration.

### Fixed

- [Issue #84](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/84) Proxy rewrites were messing with the Socket.IO namespace.
  Many thanks to [Vinay Kharecha](https://github.com/vinaykharecha) for reporting.

  
## [2.0.6](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.5...v2.0.6) - 2019-11-21

### Fixed

- Improved detection for projects. Previously if projects _had_ been in use and were then disabled, uibuilder would still think them active.

### Changed

- Add a new example to the library: cacheByTopic - A simple caching example that uses a function node to cache the last msg for each topic & replay them when a client connects.
- Improved initial debug msg in the front-end (if debug=true), shows versions and whether the minimised version of `uibuilderfe` is in use.
- Code safety improvements and tidy up.
- Slight tweak to the default template (VueJS). The button now has an ID and the increment function prints out the event object to console.

## [2.0.5](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.4...v2.0.5) - 2019-10-04

### Fixed

- [Issue #73](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/73) Cannot read property 'endsWith' of undefined in uibuilderfe.js - added extra zero-length checks. Thanks to [Scott Page - IndySoft](https://github.com/scottpageindysoft) for the fix.

### Changed

- Further improvements to changelog format & fixes to formatting.
- Switch round some properties in package.json to make it easier to read.
- uibuilderfe: Small tweak to debug output for better analysis. Also outputs both library version AND whether you are running the packed (minified) or unpacked version.

## [2.0.4](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.3...v2.0.4) - 2019-09-28

### Added
- uib icon (blue node-red icon) to the detailed information page (uibindex) & logo to README
- Look for the package.json `browser` property not just `main` and display it on the `uibuindex` page if available instead of main.

### Changed
- CHANGELOG.md changed to use "[Keep a Changelog](https://keepachangelog.com/en/1.0.0/)" recommended formatting which will facilitate the use of `gh-release` in the future. Also added link to list of commits between versions.
- `package.json` 
   - added `browser` property as per [this spec](https://github.com/defunctzombie/package-browser-field-spec) (also [here](https://github.com/stereobooster/package.json)) to give hints to bundlers. Changed `main` to point to the server-side js.
   - Added `directories.doc`, `directories.lib`  & `directories.test`
- Updated the detailed information page (`uibindex`). Improved layout and added some additional useful debugging information. Included the URL for the common resources.
- Dependent packages updated to latest

### Fixed
- Fixed detailed information page (uibindex) issues:
   - Error in link url's
   - Error in "Main Entry Point" column if package.json didn't contain a `main` property.
- Common folder was served as `/<httpRoot>/<uibUrl>/common` instead of `/<httpRoot>/uibuilder/common`. Added the 2nd form, note that the first form should not be used, it may be deprecated in a future release.
- Incorrect default values

### Removed
- Spurious `</a>` from the detailed information page (uibindex)
- Spurious console.log for oneditresize

[Commits](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.3...v2.0.4)


## [v2.0.3](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.2...v2.0.3)

* **UPDATE** bootstrap-vue has been updated to v2.0.1 from the dev version. Check out the [bootstrap-vue changelog](https://bootstrap-vue.js.org/docs/misc/changelog/) because there are a few breaking changes.
* **UPDATE** Fix formatting of links in the config panel in readiness for Node-RED v1.0
* **UPDATE** Add workaround for npm packages that don't define a `main` entrypoint. Fixes [Issue #67](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/67).

[Commits](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.2...v2.0.3)

## [v2.0.2](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.1...v2.0.2)

* **UPDATE** Update examples for uibuilder v2. Include new example of caching with a function node (many thanks to [@cflurin](https://discourse.nodered.org/u/cflurin))
  
Note that some of the WIKI examples have also been updated.

## [v2.0.1](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v2.0.0...v2.0.1)

Bugfix for [Issue #59](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/59)

## [v2.0.0 (live)](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v1.2.6...v2.0.1)

Welcome to v2 of uibuilder. 

This version is a significant rebuild from v1.x with many changes, some of which are breaking and will require you to make a few minor changes to existing code and settings I'm afraid. See below for details.

v2 provides a much stronger platform for further developments such as a front-end build step so that you can use Webpack, TypeScript, etc. The [main To Do list is now in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/To-Do).

---

## v2.0.0-beta3.5

**NOTE: This is the final planned beta.**

Final list of breaking changes between v1.2.2 and v2.0.0 - note that a complete list is [available in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/v2-Breaking-Changes). A copy is in the docs folder of this repository.

* Bug fixes in v2.0.0.beta3
  
  * [x] [Major] Admin ui: Full-screen editor only uses Javascript language instead of inheriting the correct language (e.g. html)
    
    You now get proper full-screen on all but the oldest of browsers. 
    
    To enter fullscreen, click the expand/compress button.

    Press <kbd>Esc</kbd> or click the expand/compress button to exit.
    
    Also note that the standard edit box auto-sizes to the available height as well now. So no more need for the bottom resize drag bar.

  * [x] [Major] Default VueJS template Javascript contains some ES6 rather than ES5 (`const`,`let` replaced by `var`)

  * [x] [Minor] Admin ui: Most links don't force target=_blank in panel and help.

  * [x] [Minor] Admin ui: New file creation dialogue, button says "New", change to "Create".

  * [x] [Minor] Admin ui: better documentation - esp. in regard to full-screen button. (Added to help panel)

  * [x] [Minor] Documentation: Note about bootstrap warning (ignore)

* The minimum supported version of Node.JS is now v8.6.

* Settings in `<userDir>/settings.js` are no longer used, you should probably remove them to save confusion.

* The folder used for configuration settings and your front-end code is found at `<userDir>/uibuilder/` (e.g. `~/.node-red/uibuilder/`) if projects are not being used. Alternatviely, it is at `<userDir>/projects/<projectName>/uibuilder` if using projects. This folder is refered to in the documentation as `<uibRoot>`
  
* Configuration files are found in `<uibRoot>/.config`
  
* **In your front-end `index.html` file, _all_ of the master vendor files (deployed to `<userDir>`) now use a common URL style `../uibuilder/vendor/---` rather than the previous `./vendor/---`. You MUST update your html accordingly.**

   Note that the socket.io client also now uses this pattern. This allows it to take into account your `httpNodeRoot` setting which wasn't possible previously.

   e.g. `<script src="../uibuilder/vendor/socket.io/socket.io.js"></script>`.

* There is now a folder you can use to make common front-end code available to all instances of uibuilder. It is found in `<uibRoot>/common/`. That folder is mounted to the `../uibuilder/common/` URL.
  
* ExpressJS and Socket.IO middleware can be added to the `<uibRoot>/.config` folder. Dummy template files are provided. Limitations are listed in the comments of the templates. Any middleware specified in `settings.js` is ignored. 
  
  If you want to use the same middleware as for `httpNodeMiddleware`, alter settings.js to read the uibuilder middleware file. 
  
  The ExpressJS middleware files are `<uibRoot>/.commonMiddleware.js` and/or `<uibRoot>/<instanceName>/.middleware.js`. The socket.io middleware files are  `<uibRoot>/.commonIoMiddleware.js` and/or `<uibRoot>/<instanceName>/.ioMiddleware.js`.

  This lets you have per-instance middleware as well. Both are loaded if present.

* Logging no longer uses Winston and you can delete any log files previously created. Logging is now integrated with Node-RED logs. To get more detailed uibuilder logs, change the Node-RED log settings in `settings.js`.
  
  This should generally no longer be necessary. If you are unsure about what uibuilder is doing (e.g. what URL's it is serving and from which source folders), please use the provided API at `http<s>:<server>:<port>/<httpAdminRoot>/uibindex`. All instances of the uibuilder Node have a link to this called "Detailed Information". Access to this page is secured with the same settings as the Node-RED Editor (admin ui).
  
* In the front-end library (`uibuilderfe.js`):

  * You now **MUST** initialise the library yourself by including the code `uibuilder.start()` as early as possible.
    
    e.g. (where your nodes URL is set to `myurl` and `httpNodeRoot` is set to `nr`) `<uibRoot>/myurl/src/myfolder`, in this case you would start the library with `uibuilder.start('/nr/myurl', '/nr/uibuilder/vendor/socket.io')`. 

    If you get continual `uibuilderfe:ioSetup: SOCKET CONNECT ERROR` error messages (see your browser's developer console), you probably got this wrong.

    This allows the socket.io namespace and ioPath to be overwritten which is important if you want to use code that is not in the instance root folder.     
    
    This also allows you to write front-end code to interact with uibuilder from a completely separate web server! Though you may have to mess with CORS settings.

  * The variable `sentMsg` now only contains a copy of the last standard message sent back to the Node-RED server. `sentCtrlMsg` is a new varible that contains a copy of the last control message sent. 
    
    If you want to track these in your front-end code, monitor them with `uibuilder.onChange('sentMsg', function(newVal){ ... })` and `uibuilder.onChange('sentCtrlMsg', function(newVal){ ... })`. See the default template for details. `msgsSent` and `msgsSentCtrl` are updated accordingly and contain the count of messages since the last page reload.

  * If you have a difference in timezones between your Node-RED server and your client browsers, you can track this with the `serverTimeOffset` variable which is the number of hours that the server is different to the client. 
    
    Use as `uibuilder.onChange('serverTimeOffset', function(newVal){ ... })`.

There is a [summary of the URL paths used by uibuilder v2 in the WIKI](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths).


## v2.0.0-beta1

* **BREAKING CHANGE** Two new files in `<uibRoot>/.config` control how front-end library packages are managed. You don't ever have to touch these since they will be managed for you. However, you can change them if you want to.
   
   `masterPackageList.json` is copied from a template and is used to search for common front-end packages. If any of the packages in this list are found to already be installed into `<userDir>`, they will automatically be added to the installed list.

   `packageList.json` is created from any FE packages actually installed. If you uninstall a package in the list manually, the list will automatically update. If you install a FE package manually, if it is in the master list, it will be added here automatically, otherwise you will have to add it manually.

   On first upgrade from v1 to v2, the packageList file will be updated from the uibuilder section of your `<userDir>/settings.js` file.
  
* **BREAKING CHANGE** Middleware for both ExpressJS and Socket.io is now loaded from js files in `<uibRoot>/.config`. Dummy template files are copied over if they don't exist.
  
* **NEW** Add configuration flag to allow a web page showing all served files for a specific uibilder instance. If set, the url `<url>/idx` will show an index listing of the `<uibRoot>/<url>/` folder (which includes the `src` and `dest` folders). The url is shown in the admin panel.
  
* **CHANGE** Code tidy, removal of deprecated functions and variables.

## v2.0.0-dev4

* **CHANGE** Installation and removal of npm packages from within the Admin UI now work correctly.

* **CHANGE** The docs folder of the uibuilder npm package contains some developer and testing documentation. It includes a simple web page that will display the documentation.

## v2.0.0-dev3

* **BREAKING CHANGE** In uibuilderfe.js. Previously, it was quite hard to trace incoming/outgoing messages, especially between control and standard messages. This change aims to improve that.

  The variable `sentMsg` now only contains a copy of the last standard message sent back to the Node-RED server. `sentCtrlMsg` is a new varible that contains a copy of the last control message sent.
  
  In addition, the variable `msgsSentCtrl` is now actually being updated.

  This has a knock-on impact to the default `index.js` file.

* **CHANGE** The front-end template files `index.html` and `index.js` have changed. Delete or rename your current ones, the new ones will be copied over unless you have turned off the copy flag in the admin ui. Alternateively, manually review the code changes.
  
* **CHANGE** Admin UI: Flag to control front-end library debugging has been removed as it wasn't very effective anyway. To turn on debug output for the front-end library (`uibuilderfe.js`), set `uibuilder.debug(true)` in your `index.js` file.

* **CHANGE** Admin UI - edit files: New files can now be created. Files can also be deleted.

* **CHANGE** uibuilderfe: `uibuilder.get('serverTimeOffset')` now returns the difference in hours between the servers time and the browser time. Useful if you need to process date/time values from the server.
  
* **CHANGE** Docs: Continuing to improve the in-repo technical documentation. Some coverage now for the two back-end helper libraries, the main uibuilder.js and uibuilderfe.js. In addition, a new regression-tests.md document. The v1 changelog and readme are also in the `./docs` folder for historical reference.
  
* **CHANGE** Templates: index.html, index.js and index.css have all been improved in this release. If you are using the default page & js, please delete them and allow uibuilder to create them.

* **FIXED** Deploy causes vendor paths (except socket.io) to disappear
  Bug introduced by moving vendor path processing to outside of the instance process. So we have to exclude the vendor paths when killing the instance paths during the close event.

* **FIXED** uibuilderfe: Issue with some browsers and the debugging function. See [Issue #49](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/49) for details.



## v2.0.0-dev2

This release has some breaking changes over the previous v2.0.0 so I've changed the version number.

Since the URI's for uibuilder have changed between v1 and v2, I've created [a WIKI page summarising the new ones](https://github.com/TotallyInformation/node-red-contrib-uibuilder/wiki/V2-URI-Paths). Note: `<uibRoot>` = `<userDir>/uibuilder` or `<userDir>/projects/<projectName>/uibuilder` if using projects.


* **BREAKING CHANGE** No more settings files! Neither the old settings in `<userDir>/settings.js` nor the "new" ones in `<uibRoot>/.settings.json` are needed any more. _This greatly simplifies configuration_.
  
* **BREAKING CHANGE** Socket.io client URL now matches the pattern for all other vendor libraries: `../uibuilder/vendor/socket.io/socket.io.js` (/vendor added). All vendor packages deployed to `userDir/node_modules` and made available by uibuilder are now served using the same pattern: `../uibuilder/vendor/<moduleName>/`.
  
* **BREAKING CHANGE** A new URI path is available `../uibuilder/common/`. This is used to serve your own common resources (available to all instances of uibuilder). It maps to the `<uibRoot>/common` folder which is created if it doesn't exist.

* **BREAKING CHANGE** You can no longer use Node-RED's middleware (`httpNodeMiddleware` in `<userDir>/settings.js`). See below. Middleware is mostly used for security processes to be added into the web server processing (e.g. JWT).

* **BROKEN FOR NOW** Security middleware - has to be moved to `<uibRoot>/.commonMiddleware.js` and/or `<uibRoot>/<instanceName>/.middleware.js`. 
  
  * Similarly, Socket.IO can have its own middleware defined in `<uibRoot>/.commonIoMiddleware.js` and/or `<uibRoot>/<instanceName>/.ioMiddleware.js`. **However** this is only called when a client connects - only once - so it doesn't give the same level of security.

* **CHANGE** Logging is simplified further. All logging is to Node-RED's stdout and errout. Reduced noise by default (instance details no longer logged by default). Turn on additional logging by setting debug flag in instance configuration. Then adjust Node-RED log level to see more detail.




## v2.0.0 (pre-dev)

* **BREAKING CHANGE** Vendor `app.use` paths moved from instance level to module level so only done once. This means that you have to change your `index.html` file. Where before you might have had something like `<link rel="stylesheet" href="./vendor/normalize.css/normalize.css">`, that must now change to `<link rel="stylesheet" href="../uibuilder/vendor/normalize.css/normalize.css">`. Any link that started like `./vendor` must be changed to `../uibuilder/vendor`.

* ~~**BREAKING CHANGE** The socket.io client library has moved path. Previously it didn't take into account `httpNodeRoot` but now it does. You will need to change the `script` tag in `index.html`, it was `<script src="/uibuilder/socket.io/socket.io.js"></script>`, now it must be `<script src="../uibuilder/socket.io/socket.io.js"></script>`.~~ Changed again in v2.0.0-dev, see above.

* **BREAKING CHANGE** If using Node-RED's "projects" feature, each project now gets its own `uibuilder` folder. Without projects, this is located at `<userDir>/uibuilder/`. With projects, it will not be located at `<userDir>/projects/<projectName>/uibuilder/`. **This location will now be referred to as `<uibRoot>`**. See below for other files and folders that have been moved to `<uibRoot>`.
  
* ~~**BREAKING CHANGE** Optional server logs moved from `<userDir>` to `<uibRoot>/.logs/`. Keeping things tidy. Each project (if in use) will have its own logs.~~ REMOVED in v2.0.0-dev

* **BREAKING CHANGE** Default templates changed from jQuery+normalize.css to VueJS+bootstrap-vue. Vue, bootstrap and bootstrap-vue are automatically installed.

* ~~**BREAKING CHANGE** The uibuilder global settings are no longer used from `<userDir>/settings.js`. They are now found in `<uibRoot>/.settings.json`. Existing settings are automatically migrated for you. When adding/removing vendor packages manually, you must make changes to the new file, `settings.js` is ignored after the first migration. This helps pave the way for package installs from within the admin ui.~~ Changed again in v2.0.0-dev, see above no settings files are needed any more.

* **CHANGE**: If using projects - each project now has its own `uibuilder` root folder.

* **BREAKING CHANGE** As a consequence of the above, it is no longer possible to load custom middleware via the uibuilder global settings. A newer, better approach will be reintroduced ~~in a future version. As a workaround~~ before release. ~~the standard Node-RED custom middleware `httpNodeMiddleware` can still be used as it is loaded by uibuilder - note, however, that this is also used by http-in nodes.~~

* **BREAKING CHANGE** The minimum supported version of Node.JS is now v8.5

* **BREAKING CHANGE** Settings for detailed logging have changed. `debug` must now be either `true` or `false`. If true, extended logging goes to Node-RED's log, there is no separate, dedicated uibuilder log file now. Set Node-RED's logging level to `debug` or `trace` to see detailed logging. Set `debug` to false if you want to use Node-RED's detailed logs but don't want the uibuilder stuff cluttering things up. Default is `false`.
  
* **FIX** In uibuilderfe.js, provide a polyfill for String.prototype.endsWith to be kind to folk who are forced to live with Microsoft Internet Explorer or other outdated browsers.

* **FIX** Sometimes, a package's location might affect the URL needed to access the front-end library. For example, jquery would sometimes require `dist/` in the URL and sometimes not. Turns out that there are some edge cases when trying to identify the physical location of packages. These have now all been dealt with by using custom code instead of a 3rd party package that didn't always work.

* **FIX** Small regression bug in `uibuilderfe.js`. Prevented socket.io from communicating when `httpNodeRoot` was not set. Added `urlJoin` function to prevent.

* **FIX** Moved examples folder to the right place so that Node-RED admin ui will pick it up.

* **NEW** Admin API `<adminurl>/uibvendorpackages` Returns list of available vendor packages with url and folder details.

* **DEPRECATED IN v2.0.0-dev1** replaced with `<adminurl>/uibnpmmanage` ~~**NEW** Admin API `<adminurl>/uibnpm` - run some npm commands from the admin ui. Will work against against `userDir` or `<uibRoot>/<url>` locations (optional `url` parameter). Checks whether `package.json` is available in the location. Option to return the installed npm packages in that location.~~

  * Commands supported - note that return output is JSON, you should always get something back.
    * `check`: Check whether `package.json` and `node_modules` exist
    * `packages`: Lists all of the top-level packages installed at this location.
    * `init`: Create a `package.json` file with default entries. You should ideally configure npm correctly on the server before running this if you want it to pick up your author details, etc.
    * `install`, `update`, `remove`: Requires the `package` parameter. Installs/updates/removes the given package if it can. Will be blocked if the chosen location does not contain a `package.json` file since this would potentially result in packages being installed in a parent folder which, in this case, is unlikely to be helpful.

* **CHANGED** Improved `<adminurl>/uibindex`: 
  * added `check` parameter, if provided will check if the value matches a uibuilder url in use. If so, returns true otherwise returns false. Used in the admin ui to check for url uniqueness. 
  * Moved from standard app server to admin server so that the start of the url path has to be the same as Node-RED's admin ui - for better security.
  * Expanded output. Included links to vendor homepages for each package, included link to "main" entrypoint.
  * Added package version.
  * Added bootstrap (2.3.2 used by Node-RED admin ui), improved layout

* **CHANGED** In uibuilder admin node configuration panel (`uibuilder.html`):

  * File editor improvements:
  
    * File switches automatically on selection change - no need for an edit button any more.
    * Cancel and Done buttons disabled if there are unsaved changes to a file. Either Save or reset the file to re-enable them.
    * Expander button added - similar to the function and other core nodes - expands the edit area to full screen.
    * Default/previously selected file opened for edit automatically.
    * Improved handling of reopening the ui - last file selection retained.
    * Added folder selector. Now you can edit files (and copy from) in the current instances `src`, `dist` and root folder.
  
  * Improved validation for url setting. It must not be more than 20 characters, must not equal 'template'. Must not contain '..', '/' or '\'. Must not start with '_', '.'. It must also be unique (e.g. not already in use).
  * Hide path and module info by default, click to toggle.
  * New *Advanced Settings* section, hidden by default, click to toggle. Move debug flags to it.
  
  * Swapped vendor path list to `<adminurl>/uibvendorpackages` API.
  * Path and module info section now simplified - added link to `<adminurl>/uibindex` for detailed information.
  * Now redirects to the uibuilder index admin page `<adminurl>/uibindex` instead of recreating its own detailed information.

* **CHANGED** Several instance config variables no longer needed: filename, format, template

* **CHANGED** In uibuilder admin help panel - help text simplified and improved. Added description of the parameters accepted by `<adminurl>/uibindex`.
  
* **CHANGED** In uibuilder helper library `tilib.js`:
  * New function `readPackageJson`: Returns an object of the package.json file in a given folder.
  * New function `findPackage`: Replaces 3rd party package to find the root folder of an installed package.
  * Improved `urlJoin` function: Handle arguments containing `undefined`

* **CHANGED** The nodes admin html file is now split in 3, see the `node-src` folder. A build script has been added `npm run build` to assemble the actual file from the components.
  
* **CHANGED** The following npm packages are no longer required and may be removed:
  
  *  `winston` is no longer required for logging. Logging now uses Node-RED's logger.
  *  `get-installed-path` wasn't working reliably, now replaced with custom code.
  
  
----

Because of the many changes in v2, the v1 changelog has been moved to a separate file: `./docs/CHANGELOG-v1.md`
