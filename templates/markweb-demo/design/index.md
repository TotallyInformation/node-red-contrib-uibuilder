---
author: Julian Knight (Totally Information)
title: 🌐🕸️ Markweb Design and Features
shortTitle: Design & Features
sortPriority: medium
description: Outlines the design principles and decisions behind Markweb. 
tags: 
  - uibuilder
  - Node-RED
  - demo
  - design
status: Published
created: 2026-04-09 16:16:08
updated: 2026-04-09 17:25:21
---

## Overview

The purpose of _Markweb_ is to provide a simple but flexible and powerful way to serve markdown content as a website from Node-RED.

It is designed to be easy to use for simple use cases, but also highly configurable and extensible for more complex use cases. It is not intended to be a full-featured CMS or static site generator, but rather a lightweight and flexible tool for serving markdown content.

It was always intended to be built on top of existing UIBUILDER capabilities. However, its purpose is specifically focused on servicing _information_ heavy websites rather than the _data-driven_ or _dashboard_ style web applications that UIBUILDER is often used for. It is designed to be a "content server" rather than an "app server".

It was also indended to have _no to minimal configuration_, you should be able to generate a nice looking website with just a few markdown files.

As a UIBUILDER node though, it still needed to support the same dynamic capabilities as other UIBUILDER nodes. This means that it needed to be able to send messages to the front-end to update the content dynamically, and also to receive messages from the front-end to allow for interactivity. This is a key differentiator from other markdown servers which are typically _either_ static or dynamic via heavy-duty front-end frameworks. As always with UIBUILDER, no front-end framework is required.

It was designed to convert extended Markdown text to HTML on the server and minimise processing on the browser client.

## Design Choices

A markdown processor was needed. Initially, `marked` was used as it was already used in Node-RED. However, not only was it difficult to implement all the required features, it was not actually possible to reuse the existing `marked` instance. So, instead, I switched to the more modern and extensible `markdown-it` library. This already had some support built into the UIBUILDER front-end library and so it was already familiar. It was decided to use npm workspaces to create a custom build of `markdown-it` along with the required extensions.

For layout and styling, the UIBUILDER brand styles were the initial base. This was extended with ideas from UIBUILDER's own documentation site. Then further extended with ideas from using other documentation sites. This resulted in a side-by-side layout with a sidebar for navigation and searching and a main content area for the rendered markdown.

For styling, it was decided to focus on a dark-mode only theme for the initial release.

## Requirements

This is a rough list of the original requirements for the `markweb` node.

### Core
* [x] Support Commonmark and GFM standards.
* [x] Support front-matter in markdown files.
* [x] Process Markdown server-side to HTML.
* [x] SPA style "page" serving. Single page app style serving.
* [x] SPA Navigation to use uibuilder messages instead of fetch. To allow for more dynamic updates.
* [x] Use existing UIBUILDER processing (web and sockets libraries, etc).
* [x] Require markdown server libs from a workspace `@totallyinformation/uib-md-utils` package to avoid additional packages in main uibuilder package. Bundled via esbuild.
* [x] Server-side rendering using new ExpressJS middleware. Using the existing `nodes/libs/web.cjs` class.
* [x] Folders or files starting with `_` or `.` are blocked.
* [x] Cached indexes for nav and search. Rebuilt on file changes.
* [x] Navigation menu generation from folder structure.
* [x] Automated index lists of folders/files. With parameters to control depth, file types, sorting, etc.
* [x] Pass all discovered content attributes to the front end as a uibuilder managed variable.
* [x] `%%index%%` placeholder to generate a list of pages with links. Should use a template for each entry. Allow sorting options (e.g. by created date, updated date, title, etc.). Templates should allow metadata fields to be used. Index must allow pagination. Must have a filter option (e.g. by tag, category, author, date range, etc.)
* [x] Live reload of changed markdown files. [ref](https://www.npmjs.com/package/markserv)
* [x] Generate title, created, updated page attributes from file details if not in front-matter.
* [x] Watch the config folder for changes. Signal all connected clients to reload page if config files change.

### Search
* [x] Seach input box in the nav menu.
* [x] Search results rendered via `%%search-results%%` directive allowing flexibility in positioning.
* [x] Backend search index with auto-update on file changes.
* [x] Search results retained on SPA navigation.
* [x] Searches include: Front-matter fields, and body text.
* [x] Search result highlighted if matching the current page.

### Page templates

* [x] Support for a HTML wrapper template with `{{...}}` & `%%....%%` replacements.
* [x] HTML wrapper. `page-template.html` file in separate config folder to allow customisation of the HTML wrapper round the rendered markdown. With default backup in `templates/.markweb-defaults/`.
* [x] Global front matter fields. `global-attributes.json` file in separate config folder to allow customisation of the available front matter fields for the rendered markdown. With default backup in `templates/.markweb-defaults/`.
* [x] `{{...}}` gives simple variable replacement from front-matter (and global/system) fields.
* [x] `%%....%%` gives more complex processing such as navigation menus, search results, etc.
* [x] Allow `{{...}}` & `%%....%%` processing to have configuration attributes specified as `[attribute=value,...]` inside the tags.

### Front-end processing

* [x] Ensure that all links are intercepted for SPA navigation. But that external links (containing `:`) are not intercepted. **All relative links are relative to the BASE URL (not the current document).**
* [x] Ensure that any links containing hash fragments (`#...`) are handled correctly for in-page navigation.

### Node Editor Configuration

* [x] Source folder path on server.
* [x] URL path to serve the content.
* [x] Allow markdown-it extensions to be specified - phase 1, fixed in code.

### UIBUILDER changes needed

* [x] Change main uibuilder processing to allow separate specification of the source folder from the url. (Previously, uibuilder assumed a 1:1 mapping of folder to url names).
* [x] Allow passing of a custom ExpressJS middleware function for a route. (Wasn't previously needed as uibuilder only served static content, now needed so that nodes can have their own custom middleware).

### Required features of the markdown processor

* [x] Full [Commonmark](https://commonmark.org) support.
* [x] Standard heading ID's using the heading text.
* [x] Headings have auto-generated anchor links for easy linking.
* [x] Custom element ID's using `{#custom-id}` or `{id="custom-id"}` syntax.
* [x] Custom element classes using `{.class-name}` or `{class="class-name"}` syntax.
* [x] Custom element attributes using `{attrname="value"}` syntax.
* [x] Task lists (checklists) using `* [ ]` and `* [x]` syntax.
* [x] Autolinks for raw URLs and email addresses.
* [x] GFM-style tables. Including left, center and right alignments.
* [x] GFM-style alert boxes (AKA callouts).
* [x] Crossed-out text using `~~strikethrough~~` syntax.
* [x] Syntax highlighting in code blocks using triple backticks and language specifier (`highlight.js`).
* [x] Access to YAML front-matter fields, including ability to include fields in Markdown text and HTML wrapper.

## Requirements yet to be implemented

These are considered useful enough to be implemented but may not make the initial release.

* [ ] Footnotes.
* [ ] Mermaid diagrams.
* [ ] Transclude other markdown files.
* [ ] Partly implemented but needs much more work. ~~Dynamic checklists (clickable checkboxes that update the display, fire an event and send to Node-RED).~~  Deferred for now. Either needs to be able to update the source markdown or maintain state elsewhere.

## Possible future requirements

These may or may not be implemented in future releases depending on demand and complexity.

* [ ] sidebar.json - may want to add include/exclude options so that particular folders can be included as-is or excluded.
* [ ] Cache the default config folder files to avoid re-reading on every page load.
* [ ] Add separate bundle of markdown-it & extensions for front-end use.
* [ ] Allow additional markdown-it extensions to be specified via node config.
* [ ] Consider caching nav and search indexes. Possibly to disk or a database.
* [ ] More comprehensive search features. Possibly using a dedicated search library.
* [ ] In Editor, if there is a url clash with another uibuilder instance, show a warning.
* [ ] Mount client versions of markdown-it and extensions to front-end for use in std uibuilder front-ends.
* [ ] Add option to use the new Navigate web API for SPA navigation. (Safari from 2025-12, Chromium from 2022, Firefox not yet supported).
* [ ] *How to deal with category/tag listing pages?*
* [ ] Allow for folders with no index.md file or `_index.md`. Increases compatibility with other content sources (e.g. Astro, Obsidian, etc.). If a folder does not have an index.md file, then it should still be shown in the listing if it contains other folders or files that are being shown in the listing.
* [ ] ~~Check if return msgs get clientId, etc.~~ They don't, should they?
* [ ] Remove web router on node close.
* [ ] Consider allowing URL parameters to be passed as front-matter variables? (but not allowing overwriting of existing front-matter variables).
* [ ] Allow an `edit-link` directive (or web component?) With a link pattern defined in the node's Editor panel. When configured, clicking the link should open the file in an editor. The link should be in the HTML wrapper or sidebar. However, it should also be available to the index listings.
* [ ] Move sidebar HTML to a template file.

### Config:
  * [ ] **TEST** Allow for a config folder in/or outside the source folder to hold config files (e.g. HTML wrapper, CSS, etc.)
  * [ ] Add button on folder inputs to allow creation of the folder.
  * [ ] Show full path and actual full url in the edit panel

### Markdown extensions:
  * [ ] Code blocks should be collapsible.
  * [ ] Enhanced markdown-it plugin allowing wide range of `[?]` syntax. (ref Obsidian Tasks Plugin)
  * [ ] Allow transclusions (e.g. `[logStack](fns/logStack.md ':include')`)
  * [ ] Include Mermaid diagrams support.

### Front-matter:
  * [ ] Allow for custom front-matter fields to be added to the index and used in the `%%index%%` output. E.g. `tags`, `category`, `author`, etc. This would allow for more powerful filtering and categorisation of pages in the index listings. Also add sorting.
  * [ ] Page aliases. Allow front-matter `alias` field to specify alternative url paths for a page. Also have a master map.
  * [ ] Page templates. Allow front-matter `template` field to specify a template file to use for the page.

### uibuilder Editor:
  * [ ] Add checks for duplicate URLs.
  * [ ] Include markweb in common url checks.
  * [ ] Show actual folders as hints.
  * [ ] If source folder is inaccessible, show a warning, mark the node invalid.
  * [ ] Add manual index-rebuild button to Editor.
  * [ ] Some kind of flag to allow an auto-heading box showing things like page status.

### Additional search functionality:
  * [ ] Allow `%%search%%` placeholder in template.
  * [ ] Support keyword search (using front-matter fields).

### Hugo Compatibility:
  * [ ] ❓Support for `%%...%%` template placeholders.
  * [ ] ❓Support for Hugo `_index.md` files.
  * [ ] ❓Support for Hugo-style front-matter fields.
  * [ ] ❓Support for Hugo-style content organisation (e.g. `content/`, `static/`, etc.)
  * [ ] ❓Support for Hugo shortcodes.
  * [ ] ❓Support for Hugo taxonomies (tags, categories, etc.)
  * [ ] ❓Support for Hugo archetypes (content templates).
  * [ ] ❓Support for Hugo data files (e.g. YAML, JSON, TOML files in `data/` folder).
  * [ ] ❓Support for Hugo multilingual content.
  * [ ] ❓Support for Hugo pagination.
  * [ ] ❓Support for Hugo custom output formats (e.g. RSS, JSON, etc.)
  * [ ] ❓Support for Hugo image processing (e.g. resizing, cropping, etc.)
  * [ ] ❓Support for Hugo content types (e.g. pages, posts, etc.)
  * [ ] ❓Support for Hugo menus (e.g. main menu, footer menu, etc.)
  * [ ] ❓Support for Hugo site configuration (e.g. `config.toml`, `config.yaml`, etc.)
### Astro compatibility:
  * [ ] ❓Support for Astro front-matter fields.
  * [ ] ❓Support for Astro layouts.
  * [ ] ❓Support for Astro data fetching (e.g. from APIs, databases, etc.)
  * [ ] ❓Support for Astro image optimization.
  * [ ] ❓Support for Astro routing (e.g. dynamic routes, nested routes, etc.)

## Completed

These are features that have been implemented and are working in the current version.

* [x] Level specifier on nav element to limit depth and start level.
* [x] On scroll, when nav menu scrolls offscreen, collapse it to a burger menu and keep it visible.
* [x] Use server fs watch to provide live updates to pages. Send msg to ALL connected clients when a file changes. Clients can then decide what to do (e.g. reload if they are viewing that page).
* [x] Allow source folder to be outside the userDir folder.
* [x] Page icon overrides. Allow front-matter `favicon` field to specify an icon for the page that overrides the default favicon.
* [x] ~~Add a "recent" page listing. Available as `{{recent}}`. Needs some directives to specify how many, from where (folder, tags, category), etc.~~ Added to `%%index%%` as `latest` option instead.
* [x] Update the navigation index from the watcher. Include metadata (`folder`, `created`, `updated`, `tags`, `category`)
* [x] Add separate setting for the config folder to allow separation of content and config. Better security.
* [x] Move search to realtime comms instead of fetch.
* [x] Collapsible sections in the main content.
* [x] Notify connected clients when watch is triggered.
* [x] Search not finding in other attributes?
* [x] Hash link returns are losing the path.
* [x] Make sure that `%%search%%` adds a `<search>` element wrapper.
* [x] Generate title, created, updated from file details if not in front-matter.
* [x] Watcher for config folder.
* [x] Make sure index is rebuilt on file changes.
* [x] Add date/time range filter to `%%index%%`. `from`, `to` and `duration` options.
* [x] Add `latest` option to `%%index%%` to show most recently updated/created pages.
* [x] Sidebar collapse state is not remembered.
* [x] On index changes, client should simply re-nav to the same page
* [x] On client reconnect socket.io, client should also re-nav to the same page. This will ensure that the client always has the latest index and content. It will also ensure that if the client was viewing a page that has been deleted, then it will be taken to the 404 page instead of being stuck on a broken page.
* [x] Nav entries no longer need to do anything clever to update when the index changes since the client will simply re-nav to the same page. This will simplify the implementation and avoid potential issues with trying to update the nav entries in place.
* [x] Highlight the current page in the index and nav listings.
* [x] Index rebuild is not removing pages that have been renamed.
* [x] Need to stop `%%...%%` and `{{...}}` from being processed in code blocks.
* [x] Code blocks going too wide. Restrict width.
* [x] Indexes cannot currently deal with rename or delete events*
* [x] Nav menus do not update when the index updates.
* [x] Make sure nav is rebuilt on file changes.
* [x] Add a `closed` attribute to `<show-meta>`.
* [x] Don't reindex on file/folder changes if folder/file starts with `_` or `.`. But do remove if part of rename.
* [x] Change the custom `{{...}}` md plugin to wrap the content in `<fm-var class="fm-...">` dummy component. (reactivity not wanted here).
* [x] Allow defaults for variables and directives. Allow filter fns for formatting, etc.

* [x] Sidebar
  * [x] Uses `%%sidebar%%` placeholder in template.
  * [x] Uses `%%index%%` internally to generate nav index.
  * [x] Highlight current page in sidebar.
  * [x] 2 "tabs" - one for the navigation index and one for the page's table of contents. (Similar to Typora's sidebar). The navigation index must update when the server's index object updates. The TOC must update when the page content changes or navigation happens.
  * [x] Uses collapsible sections (for both tabs). Remembered per user (localStorage). Using details/summary elements.
  * [x] Search box above the tabs. Included by default but can be turned off using `%%sidebar [search=false]%%`.
  * [x] Search results below the search box but above the tabs. Only if searchbox is present.
  * [x] Allow sidebar to be toggled open/closed. Browser should remember state (localStorage). Default open. Allow override in `%%sidebar [open=false]%%`.
  * [x] Allow sidebar width to be resized by user by making the border draggable. Browser should remember state (localStorage). Default width 20em. Allow override in `%%sidebar [width=25em]%%`.
  * [x] Allow selection of start/end depth for the sidebar nav index. E.g. start=2, end=4 would show levels 2, 3 and 4 only. Same syntax as `%%index%%`.
  * [x] Override of nav index titles (front-matter `title` field) with front-matter `shortTitle` field if present.
  * [x] Use front-matter `description` field for nav index item HTML `title` attribute so that the description shows as a tooltip.
  * [x] Allow full override of index content with manual `sidebar.json` file in config folder.
  * [x] Sidebar must be full height of viewport and scroll independently of main content.
  * [x] ~~Allow sidebar to be docked left/right. Browser should remember state (localStorage). Default left. Allow override in `%%sidebar [position=right]%%`.~~ Use CSS to do this instead. Change grid areas.
* [x] Additional templates
  * [x] Page footer

