---
title: Possible Future Features
description: |
  What is being worked on for the next release.
author: Julian Knight (Totally Information)
created: 2025-01-05 12:34:47
updated: 2026-11-06 11:51:53
---

## Possible issues/improvements

* [ ] If using a custom uibRoot folder with projects - add startup warning that the folder is SHARED.
* [ ] Add app type to nr admin index page to make it easier to identify uibuilder and markweb nodes.
* [ ] Add size trap to saferSerialize to prevent very large objects from being serialized and crashing the system.
* [ ] Replacing (not importing) a flow file containing an invalid uibuilder node (and when the node's folder doesn't yet exist) may prevent that node from being corrected in the Editor. The startup process will create the folder and then say that the node's URL is a duplicate. [Ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/646).
* [ ] Rationalise node descriptions (1st para of help).

* Code smells:
  * [ ] check that hooks are in uib?
  * [ ] Add `{ cause: err, }` when throwing new error in a catch

* Runtime plugin
  * [ ] uibRoot folder may not update fast enough when changing projects in the Node-RED editor. [Ref](https://github.com/TotallyInformation/node-red-contrib-uibuilder/issues/647)

* Client library
  * [ ] Ensure that route change control msg is sent by uibuilder client library not uib-router library.

* `uibuilder`
  * [ ] In uibuilder `this.oldUrl` check. If the move fails, check if the old folder is still there. If not, clear the oldUrl property. This will prevent the error message on a failed move from being repeated on every deploy.

* `uib-cache`
  * [ ] partial clearing of data.
  * [ ] changing data.

* `markweb`
  * [ ] Update Markweb docs for the new collapse marker and the new folder hiding behaviour.
  * [ ] Add ability to turn off collapsible prose. Needs to be an option in the Markweb node and will need to generate slightly different HTML on rendering Markdown.


## Next release requirements

* [x] v8.0.0 to recognise the node.js and node-red baseline version changes.
* [x] Bump Degit version - new versions fix the git requirement bug. Node.js v20 is now minimum versiion.
* [x] Update baseline to node-red v5 and node v22. pacakge.json, docs, eslint.
* [x] ~~Begin migration of runtime modules to ESM. Now supported by Node-RED v5.~~ Cancelled due to issues in Node-RED.
* [ ] Update docs to show that front-end code targets release-date - 7 years.


### Markweb

* [_] Add Markweb instances to the list of uibuilder apps/urls. Started, needs app index page and the listApps function node utility updating to show them along with the new `type` property.
* [ ] Reduce the chattiness of the markweb client library.
* [ ] Add open and vscode shortcuts to the config.
* [ ] Add option to turn off the collapsible prose feature.
* [ ] Add site title and icon to the sidebar.
* [ ] Allow `[[...]]` cross-page links. [Ref](https://discourse.nodered.org/t/uibuilder-markweb-too-dark/101168/38)
* [ ] Add copy button to code blocks. [Ref](https://discourse.nodered.org/t/uibuilder-markweb-too-dark/101305/4)
* [ ] Add schema.org option. Would add `<script type="application/ld+json">` to the page template.
* [ ] Wrap code blocks in details/summary to allow them to be collapsed/expanded.

### Documentation

* [ ] Document the CSP overrides and how to use them.
* [_] Remove docsify-darklight-theme dependency as it is dated and not being used. Will remove a bunch of audit failures. JS already not used, needs consolidation of the CSS.
* [ ] Document the new logger.mjs module including actual use (uib-runtime-plugin.js) and JSDoc.
* [ ] Find places in documentation (and maybe the readme) to document the Node-RED projects issues.

### uibuilder node

* [ ] Deploy of new uibuilder node sometimes results in `🌐⚠️[uibuilder:web:setupInstanceStatic:nojs-charts] Cannot show default page, index.html does not exist in D:\src\uibRoot\nojs-charts\src.`.  Likely because the reload option is on so as the default folders & files being created, the node tries to reload the page. Maybe suspend watcher for initial deployment somehow?
* [ ] Alter uibuilder where we have `JSON.stringify` to use saferSerialize instead.

### uibuilder library

* [ ] Add data-before and data-after attribute processing to the `uib-var` custom attribute. E.g. to extend ability of Markweb to add the site title to the browser title.
* [ ] Re-test running uibuilder.start() in index.js

## In Progress

* Make sure that Markweb nodes remove web routes and socket.io namespaces when deleted.

### Ongoing work

* Document possible gotchas with Markweb and how to avoid them.
  * Deep url paths - need to adjust the page template's relative links.
  * Missing folder from navigation - must have at least a `index.md` page in the folder.
* Change docs bundle to use an npm workspace
* Force close socket.io connections on node-red close to prevent hanging connections and allow clean restarts.
* If using a custom Express server, force close it on node-red close to prevent hanging connections and allow clean restarts.

* Background rework (may take several releases):
  * [ ] Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.

* Update library manager to use the same processes as the scripts tab.
  * [ ] More robust updates.
  * [ ] Show streamed output.

* [ ] Script run
  * [ ]  Consider retaining the complete xhr request and streamed output.

* Back-end
  * [ ] Failed rename of instance folder may get stuck.

  * [ ] Add either a link or at least a note to node help pointing to example flows.
  * [ ] Add example flows for each node.

  * [ ] Add remote command example flows.
  * [ ] Add `uib-var` example flows.

  * [ ] Add new example showing use of the TI Web Component library.
  * [ ] Add new classes for LAYOUTs.
  * [ ] Add SVGAnimate class to web components package.
  * [ ] `resources\uib-sidebar.js` - add markdown support using RED.utils.renderMarkdown().

## Next

* Client library:
  * Add `uibuilder.dataCheck(<time>)` function to the client library. If set, will check - when the browser indicated that the page is visible - whether data has been received from Node-RED within the specified time. If not, it will reload the page. This is to deal with computers going to sleep and then waking up with stale data.
* Documentation:
  * The new build script and processes.
  * The CSP overrides and how to use them.
* Markweb:
  * Video.
  * Allow `readme.md` or `README.md` to be used as folder default pages as well as `index.md`, `.index.md`, and `_index.md`.
  * Add an editor.
  * New `markweb-save` node to dynamically convert markdown to HTML and save to the filesystem. Listens for changes and automatically updates. Possibly connect to GIT and allow an upstream to be set for pushing changes to a remote repository. Would need an Internet-facing link to the Mermaid library. Might possibly offer some settings to enable the uibuilder library to connect back to the Node-RED server over the Internet.
  * Consider addint a meta-library feature allowing a parent folder to hold multiple Markweb folders. And/or, a meta-library JSON file that lists multiple Markweb folders and creates instances for each.
  * Edit mode
    * Add a new edit mode to the Markweb node. When enabled, the Markweb node will allow editing of the markdown files directly in the browser. This will require a new editor to be added to the Markweb node. The editor will need to support markdown syntax highlighting and possibly a preview mode. The editor will also need to support saving changes back to the filesystem and possibly pushing changes to a remote repository.
    * Add new folders with auto-generated `index.md` files.
    * Add new pages with auto-generated templates.
* uibuilder node
  * Add links to docs and default page to editor context menu [Ref](https://github.com/node-red/node-red/pull/5332).
* Editor:
  * uib-sidebar - add markdown support.
  * Consider reworking custom Monaco settings for the file editor. [ref](https://claude.ai/share/ca9c9a68-800d-46bf-b06f-c2fccd83f05a)
* router
  * Add icon support to the router menu system.
  * Add vertical support to the router menu system.
* Core
  * Consider use of env files (stable in node.js v22) - https://nodejs.org/docs/latest-v22.x/api/environment_variables.html#cli-options
  * Do we still need to maintain library metadata in `<uibRoot>/package.json`? It is re-created on each startup anyway so maybe just retain in memory?
  * Investigate use of `files` property in `package.json` to potentially make the deployed package smaller. [Ref](https://github.com/windkh/node-red-contrib-telegrambot/blob/master/package.json#L5-L10).
  * Add periodic checks for outdated packages and notify the user.

## Communications

* Use IFTTT to cross-post:
  * New video - to Discord, Twitter
  * New Release - to Discord, Twitter, (NR Forum)

  Other possibles: Instagram, Blog, LinkedIn, NR Forum, BlueSky, Mastodon.

## Other

Please see the [roadmap section of the UIBUILDER documentation](roadmap/readme.md) for the latest information on what is being worked on for the next release and beyond.
