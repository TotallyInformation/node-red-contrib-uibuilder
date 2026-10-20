---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2026-10-10 13:50:38
---

# Changelog

Please see the documentation for archived changelogs - a new archive is produced for each major version. Check the [roadmap](./docs/roadmap.md) for future developments.


## Server and browser compatibility

UIBUILDER aims to be compatible with the current major release of Node-RED. That is Node-RED v5 with a Node.js v22 LTS baseline.

On the browser side, UIBUILDER aims to be compatible with over 99% of browsers actively seen on the Internet. This includes Chrome, Firefox, Edge, Safari and Opera. It also includes current mobile browsers on Android and iOS. The target compatibility date is around 7 years (currently early 2019). [Minimum versions: 'chrome73', 'firefox66', 'opera60', 'safari12.1', 'ios12.2', 'edge79']

## v8.0.0

[Code commits since last release](https://github.com/TotallyInformation/node-red-contrib-uibuilder/compare/v7.7.4...v8.0.0).

### 📌 Highlights

* Potentially breaking changes - please make sure that you can meet the new baseline requirements before upgrading.:
  * Baselined to Node-RED v5+.
  * Baselined to Node.js v22.9+.

* The "basic-uib" example in the import examples library has been updated. It is now better labelled and will show the date/time on the web page when inject is triggered (demonstrating the use of the zero-code `uib-topic` HTML attribute for very simple page updates)

* The `uibuiler` node now has a button to open a web page (controlled by admin access) that shows _ALL_ uibuilder & Markweb instances with their type, title & description where provided (by the inputs on an instances advanced tab) and the link to the home page.

* DEGIT has been updated to the latest release now that the baseline node version is v20+. This should fix the git requirement bug and allow us to use the latest features and fixes in degit. It is also now wrapped into a local version which allows us to continue using as a CommonJS version (Degit v3 is ESM only). _For reference, DEGIT is used for installing front-end templates_.

### Potential breaking changes

* Baselined to Node-RED v5+ and Node.js v22.9+. Please make sure that you can meet these requirements before upgrading.

### Markweb

* Improved processing of `%%index%%` directive. Attributes now correctly work if the values surrounding quotes are missed off.
* Added page updated date to the title of index listing links.

### uibuilder

* Now has a button to open a web page (controlled by admin access) that shows _ALL_ uibuilder & Markweb instances with their type, title & description where provided (by the inputs on an instances advanced tab) and the link to the home page.
* When adding a new node, the Editor checks for an index.html file in the designated start folder. Previously, only a warning was given to the Editor browser console, there is now a notification with instructions on how to correct (reload the template or create the file). The check is delayed by 1 second to allow time for creation.

### Brand CSS styling

* Fixed an edge case for links that could use light mode colours in dark mode.

### Examples

* The "basic-uib" example in the import examples library has been updated. It is now better labelled and will show the date/time on the web page when inject is triggered (demonstrating the use of the zero-code `uib-topic` HTML attribute for very simple page updates).

### Development and maintenance

* Bump to v8.0.0, baseline to node.js v22.9, NR v5, degit 3.*. Remove gulp and dependencies, execa
* Browser Telemetry capture moved to uiblib from socket library for consistency.
* Browser telemetry data improved to eliminate more "Not a brand" issues.
* GULP is no longer used for build processes, there is now a unified custom node.js script that handles watches and builds. GULP dev-dependencies have been removed.
* The build script is updated to match requirements for Node.js v22 LTS.
* DEGIT external dependency has been moved to a separate `uib-degit` sub-package to allow the ESM-only latest versions to be used.

* `fs.cjs`
  * Async `remove(path)` function now returns true if the path was removed, false if it was not.
  * Async `removeSync(path)` function now returns true if the path was removed, false if it was not.
  * Async `replaceTemplate` function now uses new function `doDegit` for external template processing.
  * `doDegit` updated to use the uib-degit sub-package.

* `uiblib.cjs`
  * `instanceClose` function now uses a sync folder remove to ensure the folder is removed before Node-RED restarts the flows. This was previously occasionally causing issues. Log output also improved.
  * New function `sanitiseUrl(urlPath)` - matches the editor plugin function, see below. Used in API and npm processing.

* `web.cjs`
  * Many thanks to [ryanmurdoc](https://github.com/ryanmurdoc) for contributing 2 new methods: `appStack` and `layerRegexp` along with code to remove older ExpressJS v4 expressions, enabling this module and UIBUILDER to be ready for a switch to ExpressJS v5.

* Editor plugin (`editor-common.js`)
  * Added `uibuilder.sanitiseUrl(urlPath)` function to allow url paths (e.g. the "url" name of a uibuilder node) to be made safe for use in URLs. Returns `null` if path traversal, spaces, %, query params, # fragments, leading /, empty paths, absolute urls are included in the path. Else returns the path.

* `adminRouterV2.cjs`
  * New route GET `/apps` - returns a list of all installed apps with details. Used from button in uibuilder node.

* `adminRouterV3.cjs`
  * Additional safety/security checks on user input.

* New Module: `logger.mjs` - A custom logging class singleton with colourised output. Output is disabled by default. Setting the environment variable `TI_ENV` to "debug" before starting node-red will enable it. Otherwise control as shown below. Setting the environment variable `TI_LOGGER` not only enables output but also sets the output level, valid levels are error|warn|info|debug.
  
  Adds colour, timestamp and icons. Can be turned on/off. Gives correct traces. Passes through anything it doesn't enhance. Enhances 'log', 'info', 'warn', 'error', 'debug', and 'trace'. Can be set to _output to a file_ instead of stdout/stderr. Output levels can also be set to one of 'error', 'warn', 'info', 'debug'/'log' or 1-4 (default=4). Also has a level map function if needed in case you want to override a log level. This is used for internal logging.

  The enhanced methods have colorised output with a timestamp, level indicator and icons.

  Unlike Node-RED's native logging, this module allows multiple, complex outputs in a single log call.
  
  Default is for `enabled` to be false. But this can the `level` can be set in the uibuilder property of settings.js. e.g. `uibuilder{ logging: { enabled: true, level: 'debug'} },`. However, do note that the settings are loaded early in the runtime plugin and so output will not happen until after the settings are loaded. If needed earlier, set `log.enabled = true` manually.
  
  Manual settings are dynamic but they are global.

## Older changes

Older changes can be found in the Archived section of the UIBUILDER documentation.
