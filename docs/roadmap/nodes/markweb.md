---
title: Road map for the markweb node
description: |
  This page is a working document to track the development of the markweb node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development. It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-07-26 15:34:19
updated: 2026-11-26 12:01:52
author: Julian Knight (Totally Information)
---

* Allow `readme.md` or `README.md` to be used as folder default pages as well as `index.md`, `.index.md`, and `_index.md`.

* Improve indexing - see [[/dev/nodes/markweb]] for details.
  * Consider moving indexing processes to a worker thread.

* `%%index%%`
  * Rendered lists have too much vertical whitespace.
  * Rendered lists need better link colours
  * Need extra arg to allow a flat instead of tree list. Probably needs a completely new runtime fn

* Video.

* New `markweb-save` node to dynamically convert markdown to HTML and save to the filesystem. Listens for changes and automatically updates. Possibly connect to GIT and allow an upstream to be set for pushing changes to a remote repository. Would need an Internet-facing link to the Mermaid library. Might possibly offer some settings to enable the uibuilder library to connect back to the Node-RED server over the Internet.

* Consider adding a meta-library feature allowing a parent folder to hold multiple Markweb folders. And/or, a meta-library JSON file that lists multiple Markweb folders and creates instances for each.

* Edit mode
  * Add a new edit mode to the Markweb node. When enabled, the Markweb node will allow editing of the markdown files directly in the browser. This will require a new editor to be added to the Markweb node. The editor will need to support markdown syntax highlighting and possibly a preview mode. The editor will also need to support saving changes back to the filesystem and possibly pushing changes to a remote repository.
  * Add new folders with auto-generated `index.md` files.
  * Add new pages with auto-generated templates.
