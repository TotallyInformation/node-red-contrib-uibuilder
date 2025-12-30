---
title: Possible Future Features
description: |
  What is being worked on for the next release.
author: Julian Knight (Totally Information)
created: 2025-01-05 12:34:47
updated: 2025-12-30 19:54:17
---

## To Fix

None

## In Progress

### New node: uib-markweb

A node that creates a website out of a folder of markdown content.

Requirements:
* Rework:
  1. [x] Change main uibuilder processing to allow separate specification of the source folder from the url.
  2. [x] Change new node to use uibuilder processing.
  3. [x] Include libs from `@totallyinformation/uib-md-utils` package.
  4. [x] Remove redundant chkLibs code.
  5. [x] Add new ExpressJS middleware to handle markdown rendering using marked.
  6. [ ] Add uibuilder namespace handling.
  7. [ ] Pass all discovered content attributes to the front end as a uibuilder managed variable.
  8. [ ] Improve HTML styling.
  9. [ ] lib/web
     1. [x] Update uibuilder route add to allow different middleware per route. e.g. static or markdown.
  10. [ ] uibuilder Editor common
     1. [ ] Include uib-markweb in url checks.
* Config:
  * [x] Source folder path on server
  * [x] URL path to serve the content
  * [x] Allow marked extensions to be specified - phase 1, fixed in code
  * [ ] Add separate setting for the config folder to allow separation of content and config. Better security.
    * [ ] Allow for a config folder in/or outside the source folder to hold config files (e.g. HTML wrapper, CSS, etc.)
  * [ ] Add button on folder inputs to allow creation of the folder.
  * [ ] Show full path and actual full url in the edit panel
  * [ ] Show marked errors/warnings in the edit panel
  * [ ] Show available marked extensions in the edit panel
  * [ ] If marked and other extensions are not installed, show an install button in the Editor.
  * [ ] Allow for a custom 404 page in the _config folder
* Functionality:
  * [x] Use uibuilder's web server to serve the content.
  * [x] Server-side rendering using ExpressJS middleware and marked.
  * [x] Include markdown libraries via npm private workspace and bundle via esbuild.
  * [x] Support for a HTML wrapper template with {{...}} replacements.
  * [ ] HTML wrapper. `_template.html` file in source folder to allow customisation of the HTML wrapper round the rendered markdown.
  * [ ] Block loading of CSS files. Or possibly auto-add them to the HTML wrapper?
  * [ ] In Editor, if source folder is inaccessible, show a warning, mark the node invalid.
  * [ ] Choose a better icon for the node.
  * [ ] Help panel.
  * [ ] Documentation.
* Markdown extensions
  * [x] Front-matter, including ability to include fields in Markdown text and HTML wrapper.
  * [x] GFM.
  * [ ] GFM-style callouts/alerts.
  * [ ] Checklists.
  * [ ] Code syntax highlighting.
  * [ ] Mermaid diagrams.
  * [ ] Page table-of-contents
  * [ ] Navigation sidebar (both auto-generated and manual), possibly a horizontal version as well.

Requirements future:
* [ ] Add separate bundle of marked and fm for front-end use.
* [ ] Auto-generate a sidebar navigation from the folder structure. Allow for in-page section navigation using headings. Where present, have two tabs in the sidebar: "Contents" and "Sections" (ref Typora's layout).
* [ ] In Editor, if there is a url clash with another uibuilder instance, show a warning.
* [ ] Allow marked extensions to be specified via settings.js uibuilder config.
* [ ] Mount client versions of marked and extensions to front-end for use in std uibuilder front-ends.
* [ ] Update front-end uibuilder library to use marked to render markdown content instead of just markdown-it.

Future possible ideas:
* Allow custom CSS to be specified?
* Use uibuilder front-end client library to handle dynamic updates?


### Ongoing work

* Background rework (may take several releases):
  * [ ] Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
  * [ ] Remove remaining ~~5~~ 4 fsextra functions from fs lib. `ensureDirSync` is completed.
  * [ ] Move all nodes editor html to use modules. [Ref](https://discourse.nodered.org/t/text-javascript-vs-module-in-html/94215/4)
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

## To Do

(See the roadmap for lots more, these are just the current thoughts)

* Router improvements
  * [ ] Add experimental rective menu updates to router library.
  * [ ] Auto-menu generation for menus.
    * [ ] Update router auto-menu with improvements from home site.
    * [ ] Add search option. `<search>`/`<div role="search">` element that can be used to search the menu.
    * [ ] Add nestable menu support.
    * [ ] Add vertical menu support.
    * [ ] ? Add tabbed menu support ?
    * [ ] SPA documentation.
  * [ ] Add route description to automenu. Either as title or as an aria-label attribute.
  * [ ] Content wrongly removed from route if an element has an id matching the route id. [ref](https://discourse.nodered.org/t/uibuilder-novice-coding/98693/5).
  * [x] Rename the example to include "SPA" for clarity.
  * [ ] Make sure new routes added from node-red (or addRoutes) only appear once.
  * [ ] Add position option to auto-menu (add numeric `position` prop, cope with multiple of the same number, allow 'first', 'last' options).
  * [ ] Investigate and implement best no-code/low-code way to auto-create the SPA from Node-RED. [ref](https://discourse.nodered.org/t/uibuilder-button/98970/13?u=totallyinformation).

* Back-end
  * [ ] In web.js, add marked browser libary to the list of served static files.
  * [ ] Failed rename of instance folder may get stuck.

  * [ ] Library manager updates
    * [ ] Capture streamed command output as per the scripts tab.
    * [ ] Check where an "error" property in package.json might come from [ref](https://discourse.nodered.org/t/uibuilder-package-json-error/98691).

  * [ ] Adjust gulp tasks to copy changed fe types file(s) (nb: src\front-end-module\tsconfig.json is different to templates\blank\tsconfig.json, don't copy it)
    * [ ] to `templates\blank\types`
    * [ ] to external template repo's
    * [ ] Find out how to create a uib fe @types package (and add to template devDependencies)
    * [ ] Find out how to automate updates to types when the fe module changes
  
  * [ ] On the build tab, check if instance folder has outstanding git changes. If so, show a commit button with auto msg of today's date and time.

  * [ ] Add either a link or at least a note to node help pointing to example flows.
  * [ ] Add example flows for each node.

  * [ ] Add remote command example flows.
  * [ ] Add `uib-var` example flows.

  * [ ] Allow overriding of the JSON max upload size for the custom Express server. [Ref](https://discourse.nodered.org/t/json-payloads-larger-than-100kb-are-refused-when-using-ui-builder/95988)

  * [ ] Add new example showing use of the TI Web Component library.
  * [ ] Add new classes for LAYOUTs.
  * [ ] Add SVGAnimate class to web components package.
  * [ ] `resources\uib-sidebar.js` - add markdown support using RED.utils.renderMarkdown().

* Front-end

  * [ ] Add support for marked.

  * [ ] When handling attribute updates from msg, if msg.attributes is a string, attempt to parse it as JSON before giving up. [ref](https://discourse.nodered.org/t/what-am-i-doing-wrong-or-help/99960/3)

  * [ ] Check that FE updates allow attributes to be set to `null` to unset them.

  * [ ] Dialog (modal/non-modal overlay)
    * [ ] component(?) that can consume a template and display it as a dialog. [ref](https://discourse.nodered.org/t/uibuilder-help-in-developing-a-dashboard/97478/18)

  * [ ] For the `uib-topic` attribute, allow msg.payload to be an array or object. Consider adding a `uib-fmt` attribute to allow output specification:
    * `uib-fmt="json"` - output as a syntax highlighted JSON object.
    * `uib-fmt="list"` - output as an HTML list.
    * `uib-fmt="table"` - output as an HTML table.

  * [ ] Reactivity - phase 1
    * [x] Create a reactive wrapper `uibuilder.reactive()`.
      * [x] Move to separate class file
      * [ ] Add `reactive` and `getReactiveClass` to function reference.
    * [ ] Create a MutationObserver for any DOM attributes that start with `:` (`uib-bind` - binds an attribute to a variable) or `@` (`uib-on` - binds an event to a function).
      * [ ] Extend to allow `uib-show` (show/hide elements).
      * [ ] Extend to allow `uib-text` (innerText).
      * [ ] Extend to allow `uib-model` (two-way data binding for input elements).

  * Toaster improvements
    * [x] Initial rework
    * [ ] More work needed - probably delayed now that new showOverlay is available.
    * [ ] Test

* Templates
  * [ ] Add template docs folder and auto-link to the template docs from the template description.
  * [ ] Add an example flow feature to templates. An examples folder. A button in the template description to import the example flow(s) to the clipboard for import (auto-import if possible.)

* CSS
  * [ ] Make `form > label` use a variable for `align-self`.
  * [ ] Add more css vars for styling buttons. [Ref](https://discourse.nodered.org/t/uibuilder-button/98970/21)

* Documentation
  * [ ] Add a manual `[UIBUILDER]` Markdown extension to replace the former auto-colouring of the word "UIBUILDER".
  * [ ] Add content to Lists, Maps, Tables, Dashboard Layouts, Cards, Articles.
  * [ ] Properly document file uploads and how to handle them. [Ref](https://discourse.nodered.org/t/input-file-in-uibuilder-v7/96196)
  * [ ] Add thanks to the contributors in the readme.
  * [x] Setting up and using VS Code for front-end development with uibuilder
    * [x] Link in uibuilder nodes
    * [ ] Setting up remote VS Code
    * [ ] Useful extensions for front-end development
    * [ ] Configure browser dev tools (e.g. round-trip edits)


## Experiments (See experimental library)

* [x] reactive-binding
* [x] enhanced-dialogs
* [x] auto-layout
* [x] template-engine
* [ ] Uibuilder visual theme config. [Inspiration](https://tweakpane.github.io/)

## Consider

* New node? `uib-markdown` - a node that converts markdown to HTML.
* Move table handling to use older HTMLTableElement API. [ref1](https://christianheilmann.com/2025/10/08/abandonware-of-the-web-do-you-know-that-there-is-an-html-tables-api/), [ref2](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement)
* ~~Auto-~~ Add a button to the uibuilder node's config panel to generate a manifest web endpoint that delivers a manifest file for the current uibuilder instance. This would allow clients to have a faster startup. [ref](https://discourse.nodered.org/t/add-pwa-feature-to-uibuilder/97807/2)
* For onTopic and uib-topic, allow wildcards in the topic name.
* Move log reference into the `uibGlobalConfig` object. Remove passed references.
* Some form of more direct RPC implementation between client and server. What functions might the server be able to do for the client? What might the server want to ask of or control on the client?
  * A latency test might be useful.
* Having a different web icon for the docs pages from actual uibuilder instance pagess. This would allow the user to easily distinguish between the two.
* Implement the `dom` (`tinyDOM`) FE library.
* Implement the `logger` FE library.
* Adding `hooks` to web.js to allow easier header overrides. `httpHeaders`.
* Add a link to the uibuilder help sidebar that has an `onclick` handler: `RED.actions.invoke('core:show-import-dialog')`
* New help doc re CORS. [Ref](https://discourse.nodered.org/t/allow-cors-for-ui-builder/94838).
* Get node-red to tell connected clients that it is closing/restarting. The client library should then close the connection and attempt to reconnect with a sensible delay. A reconnection should NOT trigger a cache replay. Maybe get the server to tell the client when to start reconnecting by sending a retry period - the client should slightly randomise that period to avoid all clients reconnecting at the same time.
* **BIG** How to have a "live" feature. This would be a mix of http-in/-response and uibuilder nodes. It would create a live endpoint that would be pre-populated with the uibuilder default ESM template. Would allow server-side rendering. See [live.md](live.md)
* Move the uib-brand CSS to a separate package. Publish separately. Possibly as a sub-package of uibuilder.
* Move ti-base-component to a separate package. Publish separately. Include here.
* Check message sizes. If >limit, split into chunks and use standard msg.parts to allow reassembly - both on the server AND on the client. Allow auto-splitting of messages for large messages and use the msg.parts feature from node-red core to allow easy re-constitution.
* Allow http responses using transfer encoding chunked. [Ref](https://discourse.nodered.org/t/http-transfer-encoding-chunked/94332/6).
* Add a pwa builder. Generate a manifest and service worker. [Ref](https://discourse.nodered.org/t/pwa-support/94332/6).
* New possible node: `uib-events` - a node that listens for events from the uibuilder runtime.
* Create a [Gridstack](https://gridstackjs.com/) demo.
* For uibindex page: sort the url list.
* Consider creating templates or examples from flows in my dev instance.
* For templates:
  * Show template version in the uibuilder node.
  * Replace all template eslint configs with new version (see actions example). Also add stylelint. And update pacage.json.
  * Add fe dependencies install button to uibuilder node.
  * Add option for auto-install of dependencies when using an external template.
  * Show the dependency list.
  * Check for external template udpates.
  * Add std npm scripts: `build`, `createGit`, `commit`, `push`.
  * Maybe move dependecy list for external templates to its package.json?
  * New external templates? GRID and FLEX. (or just use examples?)
* Prepare for ExpressJS v5. Not likely to arrive before Node-RED v5 but quite a few breaking changes. [Ref](https://expressjs.com/en/guide/migrating-5.html)
  * `nodes/libs/admin-api-{v2,v3}.js`
  * `nodes/libs/web.js`
  * [Path route matching syntax has changed 😵‍💫](https://expressjs.com/en/guide/migrating-5.html#path-syntax)
* web worker support.
  *  Add a `uib-worker` endpoint (per instance) that serves a worker script.
  *  The worker should handle uibuilder comms. Would need a shared worker and that does not work with Safari.
  *  It should be created dynamically based on the instance. So that it is pre-defined with the correct Socket.IO namespace, etc.
* A manifest file for offline use.
  *  Requires a change to the templates.
* Mount instance dependencies (e.g. libraries listed in the instances package.json). This would allow the instance to use the libraries without having to install them in the global node_modules.
* uibuilder node scripts feature - capture running script output even if the config panel has been closed. Restore on re-open.
* uib-watch node - with reload and notify options.


## Ideas

* Improve `[tips]`. Allow pause/start on rotation. Add an `all` option.
* Move uib-brand.css to a new sub-package. Publish separately.
* Enhance CSS with ideas from [OpenProps](https://open-props.style).
* Move all runtime code to ESM's and rely on ESBUILD to build the runtime. This will allow us to use the latest JS features but retain backwards compatibility.
* Maybe think about having a control msg from NR to clients that will re-arrange elements on the page. Possibly an array (map?) of element selectors in a set order. Would probably need a "root" element that is the parent of all the elements to be re-arranged. Could also be used to show/hide elements.
* Sending events from client to server using beacons.
* FE: Write a template parser capable of parsing `<b>{{myvar}}</b>` into `<b><uib-var variable="myvar"></uib-var></b>`.
* Consider adding some telemetry. Idea being to better understand how many instances are in use, which versions and what platforms. Perhaps also detecting which browser types are in use to help steer coding. Would need to be opt-out, transparent and documented. Might use a [non-reversible device id?](https://www.npmjs.com/package/node-machine-id).
  * An interesting pre-cursor to this might be to create an internal track of front-end client use. E.g. count the max # users connected to an instance and perhaps what browsers they are using (initially this would not be sent anywhere but would be accessible via the info page and written to a json file in each instance root folder).

### Wacky?

* Using [Pyodide](https://pyodide.org/en/stable/index.html) to run Python natively in Node-RED.
* [RxDB](https://rxdb.info/) - new nodes including a db server attached to Node-RED using RxDB's http server?

## New documentation

* Document the `.public` folder and how to use it with the custom web server.

## Videos

* uibuilder's folders.
* SPA (Single Page Application) vs MPA (Multi Page Application) and how to use uibuilder with both.
* SPA/Router details
  * Noting timings and when to load libraries, filter fns, etc.
  * Common elements vs route "pages".
  * Menu's.
* uib-sidebar: How to use the new uib-sidebar node.
* Updates on how to have data-driven updates to the UI.
* Differences between IIFE and ESM module use.
* UIBUILDER URL paths.
* Custom web server and the `.public` folder.
* SSR (Server-Side Rendering)
* Middleware & Hooks
* New uibuilder experimental library.
* Instance API's.
* Using a separate user-facing web server (separate from Node-RED's defaults that server up the Dashboards and http-in/-response nodes)
* HTML structure/hierarchy.
* The DOM.
* Setting up and using VS Code for front-end development with uibuilder.
* Web component library.
* Easy layouts using grid areas.
* Markdown.

### Shorts

* Using CSS variables with uib-brand (e.g. using --max-width)

## Communications

* Use IFTTT to cross-post:
  * New video - to Discord, Twitter
  * New Release - to Discord, Twitter, (NR Forum)

  Other possibles: Instagram, Blog, LinkedIn, NR Forum, BlueSky, Mastodon.


## Thoughts

Do we actually NEED the `uib-*` dynamic attributes? With `uib-topic`, we can already control any content/attributes/properties simply by sending a msg. We can also use `uibuilder.set('msg', ....)` from front-end code so really we don't need anything else? `uib-show` could simply be adding/removing a class. Inputs might be dealt with by simply using the `set` method. Not true 2-way binding but is that really needed?

Even `uib-on` isn't really needed since we can just use the HTML `onchange`, `onclick`, etc. attributes.

NB: `uib-var` can already bind to a variable other than `msg`.

**Need some documentation** to explain the above and how to replicate framework-like features using the existing uibuilder features. And a video.
Create a comparison table of how to do things with VueJS vs Node-RED/uibuilder.

**Consider** creating a `topicMsg` or similar uibuilder function that makes data-binding easy. Use data-topic/name/id (in that order) on the input to define the topic.

Still need more thought on this because it does not quite allow for the simple linking of an input to an output. How, for example, could we link the value of an input to the value of an attribute without any need for code? This is probably less important when working with Node-RED however, since round-tripping the data generally has minimal overhead and has the advantage of being able to share one users inputs with some/all users outputs.

