---
title: Road map for the main uibuilder node
description: >
    This page is a working document to track the development of the main uibuilder node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

## To fix

* [ ] **FIX NEEDED** On first setup, after typing in a url, the folder name shows an `undefined` folder name. That needs to update or not be shown.
* [ ] **FIX NEEDED** Loading template - if it fails due to a missing dependency, the template isn't loaded but the Template shows the new one. Need to revert the name if loading fails.

## To improve

* [ ] **IMPROVEMENT NEEDED** in code editor. Needs bringing up to latest Node-RED code standards. [Ref](https://discourse.nodered.org/t/json-typed-into-with-schema-validation/84499/11?u=totallyinformation).
* [ ] **IMPROVEMENT NEEDED** - If user types in a full url (e.g. with `http:` or a domain/ip), give a better warning and disallow.
* **IMPROVEMENT NEEDED** uibuilder.packages after an update does not contain the `outdated` prop for each package because the server only does a quick update and so does not call `npmOutdated` (from packge-mgt.js) on each package because it is async and quite slow. This may mean that update flags are not updated until the Editor is next reloaded which isn't ideal. Probably need to fix at some point.
* **IMPROVEMENT NEEDED** Further simplifications of the url change handling. Converge to live url element change or the validation check. Stop saving props that don't need to be (that means that re-opening after a deployment results in  an update that needs re-deploying).
* **IMPROVEMENT NEEDED** Gracefully handle when rename cannot (re)move original folder (e.g. held open by browser).
  * Improve checks for rename failures. `[uibuilder:nodeInstance] RENAME OF INSTANCE FOLDER FAILED. Fatal.` - these should clear after restart but sometimes don't.
* Ensure that uibRoot is set to a project folder if projects in use. See [PR#47](https://github.com/TotallyInformation/node-red-contrib-uibuilder/pull/47) and [Issue #44](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/44)
* Improve handling for when Node-RED changes projects.

## To do
* [ ] Library manager updates
  * [ ] Capture streamed command output as per the scripts tab.
  * [ ] Check where an "error" property in package.json might come from [ref](https://discourse.nodered.org/t/uibuilder-package-json-error/98691).
* [ ] On the build tab, check if instance folder has outstanding git changes. If so, show a commit button with auto msg of today's date and time.

  
## Other

* For uibindex page: sort the url list.
* Add a link to the uibuilder help sidebar that has an `onclick` handler: `RED.actions.invoke('core:show-import-dialog')` to help users find the example flows.
* uibuilder node scripts feature - capture running script output even if the config panel has been closed. Restore on re-open.
* [Issue #94](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/94) - Detect when Node-RED switches projects and see if the uibRoot folder can be dynamically changed.

* Mount instance dependencies (e.g. libraries listed in the instances package.json). This would allow the instance to use the libraries without having to install them in the global node_modules. Would need extension to editor libraries tab to differentiate the locations.
* Add a button to the uibuilder node's config panel to generate a manifest web endpoint that delivers a manifest file for the current uibuilder instance. This would allow clients to have a faster startup. [ref](https://discourse.nodered.org/t/add-pwa-feature-to-uibuilder/97807/2)

* ?? Filter `clientId` and `pageName` using socket.io rooms?
* Use alt logging for websocket disconnects, sleep, error, etc

* Runtime API's - a new set of runtime API's
  * List all *.html files for instance serve folder
  * List all *.html for all URL's
  * _started_ Add api to query if a specific uib library is installed and return version. Optionally return estimated base path. Allow calling from front-end.

* Add option to process a crafted msg from the FE that returns a JSON list of all files/folders (optionally recursive) - needs change to FE library & editor.
  * In Editor, set the top-level permitted folder - relative to the `Serve` folder (e.g. If serving `<instanceRoot>/src`, that would be the default root but allow a sub-folder to be set, e.g. `content` so that only `<instanceRoot>/src/content` and below could be queried). This is to facilitate the creation of content management systems.
  * Possibly also needs option as to whether data can be written back. Including options to create/delete as well as amend. To begin with, just output any changed data to port 1 and let people create their own write-back logic.

* Centralise the list of control messages in use.

* Add occasional check for new version of uib being available and give single prompt in editor.

* Trace report for not loading uibMiddleware.js but not for other middleware files. Doesn't need a stack trace if the file isn't found and probably not at all. Make everything consistent. "uibuilder common Middleware file failed to load. Path: \src\uibRoot\.config\uibMiddleware.js, Reason: Cannot find module '\src\uibRoot\.config\uibMiddleware.js'". "sioUse middleware failed to load for NS" - make sure that middleware does not log warnings if no file is present. [ref](https://discourse.nodered.org/t/uibuilder-question-on-siouse-middleware/75199?u=totallyinformation).

* Introduce standard events: url-change (so that all uib related nodes can be notified if a uib endpoint changes url).

* Add actions: open page? open docs? using RED.actions editor API. [ref](https://nodered.org/docs/api/ui/actions/), [ref2](https://discourse.nodered.org/t/call-link-from-node-red-editor-ctrl-shift-d/73388/4)

* **[STARTED]** Provide option to switch from static to rendering to allow dynamic content using ExpressJS Views. Currently available by adding the appropriate ExpressJS option in settings.js.


##### Editor Panel

* Inputs on Files tab don't expand correctly.
* Text in Template settings fieldset is fixed width.
* Server info box doesn't update if nr restarts with different setting but editor not reloaded. Need to switch to an API call.
* When a template changes, optionally install required front-end packages. Probably use a new property in package.json - note, don't use the dependencies property as these are for local dependencies not for packages that uibuilder will make available to the front-end via ExpressJS. Or possibly make this a button for easy install?
* Method to show output from npm package handling.
* Add optional plugin displaying drop-down in Editors header bar - listing links to all deployed uib URLs. See example: https://github.com/kazuhitoyokoi/node-red-contrib-plugin-header
* If instance folder doesn't exist - need to mark node as changed to force deploy.
* Admin API enhancements

  * List of All uib endpoints as a menu page.
* Add case sensitivity flag
* Rationalise the file editor. [Ref](https://discourse.nodered.org/t/code-editor-isnt-saving-text/80836)

##### Templates

* Add eslint dev dependencies to package.json

    * .eslintrc.js: 	Configuration for rule "sonarjs/no-duplicate-string" is invalid: 	Value 6 should be object.

* Add template description to display.
* Add dependency version handling to templates (e.g. vue 2/3)
* Allow templates to provide example flows via a `uibuilder` Node-RED library plugin - will library update though?
  
    Check for examples folder, if present load all *.json files to library.
    [saveLibraryEntry](https://nodered.org/docs/api/storage/methods/#storagesavelibraryentrytypenamemetabody)
    ([ref1](https://discourse.nodered.org/t/red-library-without-red-editor/61247), [ref2](https://nodered.org/docs/api/library/), [ref3](https://github.com/node-red/node-red-library-file-store/blob/main/index.js))
    
* Add group/category to `template_dependencies.js`. Add grouping to drop-down in editor. Allow for no group specified (for backwards compatibility).
* Add option for external templates in `template_dependencies.js`.
* Consider allowing a local version of `template_dependencies.js`.
* Add descriptions when chosen.
* Maybe add as external templates.
  
  * Vue v3 (build)
  * Vue v3 + Quasar
  * REACT (no-build)
  * REACT (build)
  * jQuery + jQuery UI (maybe + some add-ons?)

* ~~Add `class="dark"` to all template html file `html` tags. Remove `class="uib"` from body tag.~~ Maybe not such a good idea
* Add ability to load an example flow from a template (add list to package.json and create a drop-down in the editor?) - using the pluggable libraries feature of Node-RED v2.1+?
* Add option to auto-load npm dependencies on change of Template. [Issue #165](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/165)
* Maybe move dependencies and other template meta-data into the template package.json file.

  Would require making sure that package.json always exists (e.g. after template change). May need to be able to reload package.json file as well.
  Couldn't use the dependencies prop because we dont want to install libraries in the instance root but rather the uibRoot.
  Will need matching code in the Editor panel & a suitable API.

##### Files tab

* Change getFileList to only return files, use the separate folder list for folders. No need to run it multiple times then.
* Creating new folder - new folder should be selected after create.
* settings.js option to allow _ files to show in editor. https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/190.
* Move folder management to a popup dialog (to save vertical space)
* Extend folder/file management

  * Allow renaming of files/folders.
  * Add the `common` folder to the file editor.
  * Allow editing in the `common` folder not just the instance folder.
  * Add a file upload button.
  * Method to import/export front-end files. Needs ZIP/Unzip functions at the back-end.
  * Add a reminder to the Editor help about examples. Add an onclick to that `<a>` icon that calls RED.actions.invoke('core:show-import-dialog'); as a quick action to get the user to the import dialog. See [here](https://discourse.nodered.org/t/documentation-example-flows-for-contributed-nodes/44198/2?u=totallyinformation) for more info.
  * Add option to keep backups for edited files + button to reset to backup + hide backup files

##### Build tab

* Add GIT processing? Or maybe just handle via npm scripts?

  * Is git command available?
  * is front-end src folder a git repository?
  * git commit
  * git push

##### Libraries tab

* [ ] Major version updates are not listed - because of package.json version spec - need to update docs?

* Show warning if `node_modules` is empty, offer to run `npm install` & warn to restart Node-RED. Any way to extend that for missing installs?
* Trigger indicator to Libraries to show if new major version available when switching to the tab.
* Add npm package delete confirmation - probably via std NR notifications.
* When adding a package, make sure that the input field gets focus & add <keyb>Enter</keyb> & <keyb>Esc</keyb> key processing.

##### Advanced tab

* Update the `Advanced > Serve` dropdown list after creating a new top-level folder (to save having to exit and re-enter the panel).
* Add visual error when changing advanced/Serve to a folder with no index.html.
* Add (advanced) flag to make use of project folder optional.
* Improve help box for _uib switch
* Option for project folder storage.
* Show Socket.io server & client versions

##### Other

* Add optional sidebar (or drop-down menu on NR header bar) displaying list of all uib URLs (and link to nodes).
