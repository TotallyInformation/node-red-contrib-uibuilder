---
typora-root-url: docs/images
created: 2017-04-18 16:53:00
updated: 2026-10-09 12:12:36
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
* DEGIT has been updated to the latest release now that the baseline node version is v20+. This should fix the git requirement bug and allow us to use the latest features and fixes in degit. For reference, DEGIT is used for installing front-end templates.

### Potential breaking changes

* Baselined to Node-RED v5+ and Node.js v22.9+. Please make sure that you can meet these requirements before upgrading.

### Markweb

* Improved processing of `%%index%%` directive. Attributes now correctly work if the values surrounding quotes are missed off.
* Added page updated date to the title of index listing links.

## uibuilder

* When adding a new node, the Editor checks for an index.html file in the designated start folder. Previously, only a warning was given to the Editor browser console, there is now a notification with instructions on how to correct (reload the template or create the file)

### Development and maintenance

* Bump to v8.0.0, baseline to node.js v22.9, NR v5, degit 3.*. Remove gulp and dependencies, execa
* Browser Telemetry capture moved to uiblib from socket library for consistency.
* Browser telemetry data improved to eliminate more "Not a brand" issues.
* GULP is no longer used for build processes, there is now a unified custom node.js script that handles watches and builds. GULP dev-dependencies have been removed.
* The build script is updated to match requirements for Node.js v22 LTS.

* `fs.cjs`
  * Async `remove(path)` function now returns true if the path was removed, false if it was not.
  * Async `replaceTemplate` function now uses new function `doDegit` for external template processing.


## Older changes

Older changes can be found in the Archived section of the UIBUILDER documentation.
