---
title: Possible Future Features
description: |
  What is being worked on for the next release.
author: Julian Knight (Totally Information)
created: 2025-01-05 12:34:47
updated: 2026-04-19 20:05:36
---

## To Fix

* [ ] Deploy of new uibuilder node sometimes results in `Cannot show default page, index.html does not exist in `

## In Progress


### Ongoing work

* Background rework (may take several releases):
  * [ ] Changing `uib-brand.css` to use more modern CSS, leaving it up to LightningCSS to build for older browsers. In particular, using nested definitions.
  * [ ] Remove remaining ~~5~~ 4 fsextra functions from fs lib. `ensureDirSync` is completed.
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


## Communications

* Use IFTTT to cross-post:
  * New video - to Discord, Twitter
  * New Release - to Discord, Twitter, (NR Forum)

  Other possibles: Instagram, Blog, LinkedIn, NR Forum, BlueSky, Mastodon.

