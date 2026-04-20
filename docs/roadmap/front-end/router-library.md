---
title: Front-end SPA router library roadmap
description: >
    This page is a working document to track the development of the front-end SPA router library for uibuilder. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development.
    It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-04-19 14:45:25
updated: 2026-04-19 14:45:33
author: Julian Knight (Totally Information)
---

## To do
* [ ] Allow router settings to be created inside the uibuilder node's config panel. This would allow users to create routes without having to write code.
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

## Other
* Add `rotate` method to auto-rotate through routes. Needs ms and stop/start args.
* Add 1st show marker to route change to allow client to ask for cache update
* Update router example (code changes, remove remote cmd example).
* Make this.config.routes a SET to prevent duplicates. Or possibly an object. Needs some code changes.
* Methods needed:
  * [x] Delete route - need to update routeIds
  * Update/reload route
  * Shutdown - that removes all elements
  * Delete templates - unloads a list of (or all) templates
  * Reload templates - to facilitate updates of a list of (or all) templates
  * Auto-rotation of routes - uib..navigate(nextRoute)
  * Next/prev route navigation
* Additional options:
  * Add pre-load option early load of all routes instead of default lazy-load.
  * Unload templates after they are added to the route container. Only if hide=true. `unload: true`
  * Maybe: options to auto-load js and css files with the same name as a template file.
  * Maybe: Reset route to template option?


* Add optional attribute to `<script>` tags in routes. `runonce` or `data-runonce` will only ever be run once for a page load. Consider if `runload` and/or `runall` might also be useful.
* [ ] ? Option to load route config from a file ?
* [ ] Add md rendering to `loadOther`
* [ ] Allow config updates from Node-RED
* [ ] Add function that returns the route config schema

* [ ] Add external command listeners for:
  * [ ] `msg._uibRoute.load`. With the value being a route definition or an array of route definitions. (and update the eg flows)
  * [ ] `msg._uibRoute.loadOther`
  * [ ] `msg._uibRoute.rotate`
  * [ ] `msg._uibRoute.next`
  * [ ] `msg._uibRoute.previous`

* [ ] Add `defaultRouteOnLoad` flag (default=false) to allow for dynamically added routes to have been pre-selected on page load.
* [ ] Route menu added from Node-RED not auto-highlighting.

* [ ] Update documentation:
  * [ ] Document how to use `<instanceRoot>/routes/` properly. [Ref](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/changelog?id=new-features)
  * [ ] `templateUnload` and `templateLoadAll` flags.
  * [ ] Remove doc for `unload` flag.
  * [ ] Document the `unloadTemplate` and `deleteTemplates` methods.
  * [ ] Make [this](https://discourse.nodered.org/t/urgent-regression/84197/15) and [this](https://discourse.nodered.org/t/uibuilder-front-end-routing-example/83319/9?u=totallyinformation) into some use-cases.
  * [ ] Update router config docs with new mdPlugins prop
  * [ ] Noting that if config.mdPlugins not set, uibuilder.ui_md_plugins may be used

* Check against [router](https://github.com/beforesemicolon/router?tab=readme-ov-file#page-route) for ideas.
* Option to auto-unload external route templates after use - for example, use with a library of markdown files to produce something similar to Obsidian. Will need change to doRoute to reload the template when needed.
* Add option to auto scroll to a css selector on route change.
* Add a function to go to next/previous route.
* Update "FE Router Test" example with an auto-rotate flow.
* Add multi-level routes. [Ref](https://discourse.nodered.org/t/second-stage-of-navigation/86713/3?u=totallyinformation).
