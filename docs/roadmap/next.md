---
title: Possible Future Features
description: |
  What is being worked on for the next release.
author: Julian Knight (Totally Information)
created: 2025-01-05 12:34:47
updated: 2026-05-23 16:37:38
---

## Possible issues/improvements
* [ ] Remove gulp dependencies once we are sure that the new build/watch script is working well and we have no need for the old gulp tasks. This will remove a bunch of audit failures.
* [ ] Code smells:
  * [ ] this.uib, this.log, this.RED - should be using the global config module instead.
  * [ ] (uib) - passing uib object instead of using the module.
  * [ ] check that hooks are in uib?
* [ ] Alter uibuilder where we have `JSON.stringify` to use saferSerialize instead.


### Markweb
* [ ] Add Markweb instances to the list of uibuilder apps/urls.
* [ ] Reduce the chattiness of the markweb client library.

### Documentation
* [ ] Document the CSP overrides and how to use them.
* [ ] Remove docsify-darklight-theme dependency as it is dated and not being used. Will remove a bunch of audit failures.

### uibuilder node
* [ ] Deploy of new uibuilder node sometimes results in `🌐⚠️[uibuilder:web:setupInstanceStatic:nojs-charts] Cannot show default page, index.html does not exist in D:\src\uibRoot\nojs-charts\src.`.  Likely because the reload option is on so as the default folders & files being created, the node tries to reload the page. Maybe suspend watcher for initial deployment somehow?
* [ ] Move the fs processing in the startup of the uibuilder node into the runtime plugin. Including the setup of the fslib.

### CSS
* [ ] Add `font-variant-numeric: tabular-nums` to the table CSS to make numbers line up better in tables. (NB: only affects numbers so can be for all cells).

### Other
* [ ] Telemetry
  * [ ] Cloudflare worker and D1
  * [ ] Privacy policy document
  * [ ] Function to create a node-red instance UUID if one doesn't already exist and store it in the local filesystem.
  * [ ] Telemetry function(s) in uiblib to locally store telemetry data
  * [ ] Function to periodically send telemetry data to the cloudflare worker & clear down local data. Run monthly only.
  * [ ] Record: node-red instance UUID, uibuilder version, node-red version, node-red environment (docker, local, etc), browser family and version (aggregated), number of uibuilder nodes, number of Markweb nodes, number of uibuilder instances, number of Markweb instances, date/time of first use, date/time of last use.

## In Progress

* Make sure that Markweb nodes remove web routes and socket.io namespaces when deleted.

### Ongoing work

* Document possible gotchas with Markweb and how to avoid them.
  * Deep url paths - need to adjust the page template's relative links.
  * Missing folder from navigation - must have at least a `index.md` page in the folder.
* Change docs bundle to use an npm workspace
* Force close socket.io connections on node-red close to prevent hanging connections and allow clean restarts.
* If using a custom Express server, force close it on node-red close to prevent hanging connections and allow clean restarts.

* [ ] Review all instances of `this.RED = RED` or `mod.RED = RED`. The reference is now created in the global config by the runtime plugin. It should not be needed anywhere else unless the global config cannot be required.

* Background rework (may take several releases):
  * [ ] Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
  * [ ] Rename all .js node.js files to .cjs to avoid confusion with ESM modules. (libs now all done).
  * [ ] No need to pass uib var now it is in a module, can simply require it. (Except for libs/fs which is already used by the uib module).

* Update library manager to use the same processes as the scripts tab.
  * [ ] More robust updates.
  * [ ] Show streamed output.

* Update admin-api-v3:
  * [ ] Remove dependencies on fg (use fs.cjs instead).
  * [ ] Make more use of AsyncLocalStorage to allow async functions to be wrapped in sync callers.

* [ ] Script run
  * [x]  Retain at least the link to the run id so that the panel can be exited and returned to and still allow cancelling the script. 
  * [ ]  Consider also retaining the complete xhr request and streamed output.

* Back-end
  * [ ] Failed rename of instance folder may get stuck.

  * [ ] Adjust gulp tasks to copy changed fe types file(s) (nb: src\front-end-module\tsconfig.json is different to templates\blank\tsconfig.json, don't copy it)
    * [ ] to `templates\blank\types`
    * [ ] to external template repo's
    * [ ] Find out how to create a uib fe @types package (and add to template devDependencies)
    * [ ] Find out how to automate updates to types when the fe module changes
  
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
* Build/Watch script:
  * Switch to new build/watch script from gulp.
  * Add github new tag process to new build script.
* Documentation:
  * The new build script and processes.
  * The CSP overrides and how to use them.
* Markweb:
  * Video.
  * Allow `readme.md` or `README.md` to be used as folder default pages as well as `index.md`, `.index.md`, and `_index.md`.
* Editor:
  * uib-sidebar - add markdown support.
## Communications

* Use IFTTT to cross-post:
  * New video - to Discord, Twitter
  * New Release - to Discord, Twitter, (NR Forum)

  Other possibles: Instagram, Blog, LinkedIn, NR Forum, BlueSky, Mastodon.

