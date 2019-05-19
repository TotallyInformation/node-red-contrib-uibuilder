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




## v2.0.0

* **BREAKING CHANGE** Vendor `app.use` paths moved from instance level to module level so only done once. This means that you have to change your `index.html` file. Where before you might have had something like `<link rel="stylesheet" href="./vendor/normalize.css/normalize.css">`, that must now change to `<link rel="stylesheet" href="../uibuilder/vendor/normalize.css/normalize.css">`. Any link that started like `./vendor` must be changed to `../uibuilder/vendor`.

* ~~**BREAKING CHANGE** The socket.io client library has moved path. Previously it didn't take into account `httpNodeRoot` but now it does. You will need to change the `script` tag in `index.html`, it was `<script src="/uibuilder/socket.io/socket.io.js"></script>`, now it must be `<script src="../uibuilder/socket.io/socket.io.js"></script>`.~~ Changed again in v2.0.0-dev, see above.

* **BREAKING CHANGE** If using Node-RED's "projects" feature, each project now gets its own `uibuilder` folder. Without projects, this is located at `<userDir>/uibuilder/`. With projects, it will not be located at `<userDir>/projects/<projectName>/uibuilder/`. **This location will now be referred to as `<uibRoot>`**. See below for other files and folders that have been moved to `<uibRoot>`.
  
* ~~**BREAKING CHANGE** Optional server logs moved from `<userDir>` to `<uibRoot>/.logs/`. Keeping things tidy. Each project (if in use) will have its own logs.~~ REMOVED in v2.0.0-dev

* **BREAKING CHANGE** Default templates changed from jQuery+normalize.css to VueJS+bootstrap-vue. Vue, bootstrap and bootstrap-vue are automatically installed.

* ~~**BREAKING CHANGE** The uibuilder global settings are no longer used from `<userDir>/settings.js`. They are now found in `<uibRoot>/.settings.json`. Existing settings are automatically migrated for you. When adding/removing vendor packages manually, you must make changes to the new file, `settings.js` is ignored after the first migration. This helps pave the way for package installs from within the admin ui.~~ Changed again in v2.0.0-dev, see above no settings files are needed any more.

* **CHANGE**: If using projects - each project now has its own `uibuilder` root folder. That means that each project has its own global settings

* **BREAKING CHANGE** As a consequence of the above, it is no longer possible to load custom middleware via the uibuilder global settings. A newer, better approach will be reintroduced in a future version. As a workaround, the standard Node-RED custom middleware `httpNodeMiddleware` can still be used as it is loaded by uibuilder - note, however, that this is also used by http-in nodes. **Please raise an issue if you need this capability**.

* **BREAKING CHANGE** The minimum supported version of Node.JS is now v8.5

* **BREAKING CHANGE** Settings for detailed logging have changed. `debug` must now be either `true` or `false`. If true, extended logging goes to Node-RED's log, there is no separate, dedicated uibuilder log file now. Set Node-RED's logging level to `debug` or `trace` to see detailed logging. Set `debug` to false if you want to use Node-RED's detailed logs but don't want the uibuilder stuff cluttering things up. Default is `false`.
  
* **FIX** In uibuilderfe.js, provide a polyfill for String.prototype.endsWith to be kind to folk who are forced to live with Microsoft Internet Explorer or other outdated browsers.

* **FIX** Sometimes, a package's location might affect the URL needed to access the front-end library. For example, jquery would sometimes require `dist/` in the URL and sometimes not. Turns out that there are some edge cases when trying to identify the physical location of packages. These have now all been dealt with by using custom code instead of a 3rd party package that didn't always work.

* **FIX** Small regression bug in `uibuilderfe.js`. Prevented socket.io from communicating when `httpNodeRoot` was not set. Added `urlJoin` function to prevent.

* **FIX** Moved examples folder to the right place so that Node-RED admin ui will pick it up.

* **NEW** Admin API `<adminurl>/uibvendorpackages` Returns list of available vendor packages with url and folder details.

* **NEW** Admin API `<adminurl>/uibnpm` - run some npm commands from the admin ui. Will work against against `userDir` or `<uibRoot>/<url>` locations (optional `url` parameter). Checks whether `package.json` is available in the location. Option to return the installed npm packages in that location.

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
