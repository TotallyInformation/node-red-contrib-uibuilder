---
title: uib-markweb - Dynamic web sites using Markdown
description: ""
created: 2026-01-09 15:10:14
updated: 2026-01-30 18:17:34
status: Draft
since: v7.6.0
---

*(This document is a work-in-progress, it is not complete)*

Available from uibuilder v7.6.0.

The `uib-markweb` node allows you to create dynamic web sites using Markdown files.

## Configuration

* **URL**: The URL to use for this web site.
* **Folder**: The folder where your Markdown files are stored. The folder must already exist.
* **Name**: A name for the node.

> [!WARNING]
> Any folders or files starting with `_` or `.` are blocked for security reasons.
>
> Any folder not containing an `index.md` file is ignored. This file is used as the landing page for a folder.

## Special directives and variables

These are mostly available both in the HTML wrapper template and in the Markdown files. Though some will only work in one or the other.

While these are initially processed server-side so that only HTML is passed over to the browser clients, the special front-end client library has processes to further update them dynamically as updates are sent from the server (using internal control messages). This is controlled by a couple of HMTL data attributes added to the rendered HTML.

> [!TIP]
> Because `uib-markweb` is built on top of uibuilder, you can use uibuilder's existing features to send messages from Node-RED to the front-end to further update the page dynamically as needed.

### Directives

These provide more complex processing than simple variable replacement. They are enclosed in `%%...%%` tags. Attributes are generally optional and are specified inside square brackets `[...]` as comma-separated `attribute=value` pairs.

* `nav [attributes]` - Generates a navigation menu based on the folder structure. Attributes can be used to control depth, type (files/folders/both), orientation (horizontal/vertical), etc.

  `nav` uses the `index` directive internally to build the menu structure. So it accepts the same attributes as `index`, plus:

  * `orient` - The orientation of the menu: `horizontal` ~~or `vertical`~~ (default: `horizontal`). As of v7.6.0, only `horizontal` is implemented. You can use `index` to build vertical lists.

* `index [attributes]` - Generates an index list of files and/or folders. Attributes can be used to control depth, file types, sorting, etc.

  Attributes:
  * `start` - The starting depth level to include in the index list (default: the current page's depth).
  * `end` - The ending depth level (default: the current page's depth if `start` not provided, otherwise `5`).
  
    `start` and `end` are base 0, so the root folder is level 0.

  * `depth` - Shorthand to set the number of levels to include. Equivalent to `end = start + depth`.
  * `type` - The type of items to include: `files`, `folders`, or `both` (default: `both`).
  
  Not yet implemented:
  * `sort` - The sorting order: `name`, `date`, or `custom` (default: `name`).
  * `order` - The sorting direction: `asc` or `desc` (default: `asc`).
  * `exclude` - Comma-separated list of file or folder names to exclude (default: none).

* `search-results [attributes]` - Placeholder for search results.

* `...` - Other directives may be added in the future.

### Variables

These provide simple variable replacement from front-matter and global/system fields. They are enclosed in `{{...}}` tags.

All front-matter fields from the Markdown files can be used as variables. Some common ones are:

* `title` - The title of the page from front-matter.
* `description` - The description of the page from front-matter.
* `author` - The author of the page from front-matter.
* `created` - The creation date of the page from front-matter.
* `updated` - The last updated date of the page from front-matter.
* `status` - The status of the page from front-matter.
* `tags` - The tags of the page from front-matter.
* `category` - The category of the page from front-matter.

In addition, a few are added by a global JSON config file and the system:

* `status` - The default page status if pages don't provide one.

* From system data:
  * `depth` - How deep in the folder structure we are.
  * `path` - The current page path relative to the site root.
  * `toUrl` - The resource URL of the current page relative to the site root.

* Possible future globals:
  * `siteTitle` - The site title from global config.
  * `siteDescription` - The site description from global config.
  * `baseUrl` - The base URL of the site.

## Processes

### File/folder changes

The node watches the source folder for changes to files and folders. When a change is detected, the navigation and search indexes are rebuilt automatically. All connected clients are notified when the index is rebuilt and what changes occurred.

> [!NOTE]
> The file watcher only goes up to 9 levels deep to avoid performance issues.
>
> Sensibly, you should avoid going more than 3-4 levels deep in your folder structure for usability reasons.

After a file/folder change is detected, there is a debounce period (**default 1 second**) to allow for multiple rapid changes to be grouped together before rebuilding the indexes. Clients recieve a "_indexes-change" message followed by a "_file-change" message containing the list of changes detected (in `msg.changes`).

The client library looks to see if any of the changed files are currently being viewed. If so, it requests a resend of the page data (over socket.io).

> [!TIP]
> After a file/folder change, there is a 1 second delay before the indexes are rebuilt.

## Dependencies

> [!NOTE]
> All dependencies for this node are dealt with internally. You do not need to install any additional packages.
>
> The node uses 2 packages from separate workspaces:
> * `@totallyinformation/uib-fs-utils` - Chokidar for file watching.
> * `@totallyinformation/uib-md-utils` - Front-Matter, Markdown-IT & extensions.
>
> The original intent was to use the `marked` package as is already used and installed by Node-RED. However, it is not possible to access that library reliably from a custom node due to the way Node-RED manages its dependencies. In addition, it has some significant limitations. So `markdown-it` has been used instead.

## Requirements

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


### Search
* [x] Seach input box in the nav menu.
* [x] Search results rendered via `%%search-results%%` directive allowing flexibility in positioning.
* [x] Backend search index with auto-update on file changes.

### Templates

* [x] Support for a HTML wrapper template with `{{...}}` & `%%....%%` replacements.
* [x] HTML wrapper. `page-template.html` file in separate config folder to allow customisation of the HTML wrapper round the rendered markdown. With default backup in `templates/.markweb-defaults/`.
* [x] Global front matter fields. `global-attributes.json` file in separate config folder to allow customisation of the available front matter fields for the rendered markdown. With default backup in `templates/.markweb-defaults/`.
* [x] `{{...}}` gives simple variable replacement from front-matter (and global/system) fields.
* [x] `%%....%%` gives more complex processing such as navigation menus, search results, etc.
* [x] Allow `{{...}}` & `%%....%%` processing to have configuration attributes specified as `[attribute=value,...]` inside the tags.

### Front-end processing

* [x] Ensure that all links are intercepted for SPA navigation. But that external links (containing `:`) are not intercepted. **All relative links are relative to the BASE URL (not the current document).**

### Node Editor Configuration

* [x] Source folder path on server
* [x] URL path to serve the content
* [x] Allow markdown-it extensions to be specified - phase 1, fixed in code

### UIBUILDER changes needed

* [x] Change main uibuilder processing to allow separate specification of the source folder from the url.
* [x] Allow passing of a custom ExpressJS middleware function for a route.
* `nodes/libs/web.cjs`:
   * [x] Update uibuilder route add to allow different middleware per route. e.g. static or markdown.

### Markdown extensions wanted
* [x] Front-matter, including ability to include fields in Markdown text and HTML wrapper. Uses the [`front-matter`](https://www.npmjs.com/package/front-matter) package.
* [ ] Core CommonMark support. Provided by [`markdown-it`](https://www.npmjs.com/package/markdown-it) package.
  * [x] GFM Tables.
  * [x] GFM Strikethrough.
* Markdown-it extensions:
  * [x] Code syntax highlighting. Provided by [`markdown-it-highlightjs`](https://www.npmjs.com/package/markdown-it-highlightjs) extension.
  * [x] GFM Task Lists/checklists. Provided by custom extension.
  * [x] Custom heading IDs using `{#custom-id}`or `{id="custom-id"}` syntax. Provided by custom extension. Also allows custom attributes on other elements. Including custom classes with simple `{.classname}` syntax. Provided by [`markdown-it-attrs`](https://www.npmjs.com/package/markdown-it-attrs) extension.
  * [x] GFM-style Alert/Callout boxes. Provided by [`markdown-it-github-alerts`](https://github.com/antfu/markdown-it-github-alerts) extension.
  
  * [ ] GFM Footnotes. Provided by [`markdown-it-footnote`](https://www.npmjs.com/package/markdown-it-footnote) extension.

* [ ] Clickable page headings that update the URL hash.
* [ ] Mermaid diagrams.
* [ ] Page table-of-contents
* [ ] Navigation sidebar (both auto-generated and manual), possibly a horizontal version as well.
* [ ] Transclude other markdown files.
* [ ] Allow custom styling on Markdown elements via stdised syntax.
* [ ] Allow custom HTML attributes on Markdown elements via stdised syntax.
* [ ] Footnotes.
* [ ] details/summary wrappers for auto-collapsible headings sections (optional).
* [ ] Automated footer with last-modified date, copyright, author, etc.
* [x] Common front matter fields:
  * `title`
  * `description`
  * `author`
  * `created`/`updated` dates (need formatting)
  * `status` (draft/published/etc)
  * `tags` (list)
  * `category`
  * [ ] _`template` (for future use) external content templates_

* ~~Dynamic checklists (clickable checkboxes that update the display, fire an event and send to Node-RED).~~ Partly implemented but needs much more work. Deferred for now. Either needs to be able to update the source markdown or maintain state elsewhere.

## Possible future Requirements

* [ ] Add separate bundle of markdown-it and fm for front-end use.
* [ ] Allow additional markdown-it extensions to be specified via node config.
* [ ] Consider caching nav and search indexes.
* [ ] Add option to use the new Navigate web API for SPA navigation. (Safari from 2025-12, Chromium from 2022, Firefox not yet supported).
* [ ] Auto-generate a sidebar navigation from the folder structure. Allow for in-page section navigation using headings. Where present, have two tabs in the sidebar: "Contents" and "Sections" (ref Typora's layout).
* [ ] In Editor, if there is a url clash with another uibuilder instance, show a warning.
* [ ] Allow markdown-it extensions to be specified via settings.js uibuilder config.
* [ ] Mount client versions of markdown-it and extensions to front-end for use in std uibuilder front-ends.
* [ ] Update front-end uibuilder library to use markdown-it to render markdown content instead of just markdown-it.

## Future possible ideas

* Allow custom CSS to be specified?
* Use uibuilder front-end client library to handle dynamic updates?

## Default page template

```html
<!DOCTYPE html>
<!-- Everything like %%...%% and {{...}} gets replaced on first page load if attributes available.
  -- Everything that has a data-attribute="...." gets updated when navigating via SPA.
  -- %%body%% is where the main content goes. If you don't include it, you get no content!
  -- <base> is REQUIRED for SPA navigation to work properly.
  -->
<html lang="en"><head>
    <meta charset="UTF-8">
    <base href="%%url%%/">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" data-attribute="description" content="{{description}}">
    <title data-attribute="title">{{title}}</title>
    <link rel="icon" href="../uibuilder/images/node-blue.ico">

    <link type="text/css" rel="stylesheet" href="../uibuilder/uib-brand.min.css" media="all">
    <link type="text/css" rel="stylesheet" href="../uibuilder/utils/markweb.css" media="all">
    <!-- You can add your own stylesheets here -->
    <script type="module" src="../uibuilder/uibuilder.esm.min.js"></script>
    <!-- Base URL is REQUIRED by the module! The uibuilder client lib is loaded by this module -->
    <script type="module" src="../uibuilder/utils/markweb.mjs" data-base-url="%%url%%"></script>
    <!-- You can add your own scripts here -->
</head><body>
    <a class="skip-link" href="#main">Skip to main content</a>
    <header>
        %%nav [orient=horizontal,start=0,end=3,type=folder]%%
        <h1 data-attribute="title">{{title}}</h1>
        %%search-results%%
    </header>

    <main id="main">
        <div data-attribute="body">%%body%%</div>
    </main>

</body></html>
```

## Internal processes

### URLs & URL mapping

The URL specified in the node config is used as the base URL for the web site. It must be unique among all `uibuilder` and `uib-markweb` nodes in the Node-RED instance and must not clash with any other existing routes in Node-RED. The actual URL will depend on the Node-RED root URL configuration and/or the uibuilder custom web server if used. It is shown in the Editor UI for the node.

Any additional path segments after the base URL are used to identify the specific markdown file or folder being requested. For example, if the base URL is `/docs` and the request is for `/docs/getting-started`, the node will look for a `getting-started.md` file in the source folder.

### Server folder locations

The `source` folder specified in the node config is used as the root folder for the markdown files. If a relative path is provided, it is made relative to the Node-RED `userDir` folder.

The `configFolder` specified in the node config is used to store configuration files such as the HTML wrapper template and global attributes. If a relative path is provided, it is made relative to the Node-RED `userDir` folder.

### Template files

Template files must be stored in the `configFolder` specified in the node config. If a required template file is not found there, a default version from the package `templates/.markweb-defaults/` folder is used.

### Global attributes

These are read from a `global-attributes.json` file in the `configFolder`. If not found there, a default version from the package `templates/.markweb-defaults/` folder is used. They are merged with the front-matter attributes from each markdown file to provide the full set of available attributes for that file. They are merged before any page-specific front-matter, so page front-matter overrides global attributes.

### File watching

The node uses `chokidar` to watch the source folder for file and folder changes. When a change is detected, the navigation and search indexes are rebuilt after a debounce period (default 1 second). All connected clients are notified of the index rebuild and the specific changes detected. By default, the front-end library will check if the changed files are currently being viewed and request a resend of the page data if so which will update the display.

> [!NOTE]
> The file watcher only goes up to 9 levels deep to avoid performance issues.
> Sensibly, you should avoid going more than 3-4 levels deep in your folder structure for usability reasons.
>
> File/folder _renames_ appear as a deletion and an addition. This may happen in any order depending on how the OS reports the changes.

### Cached page metadata indexes

The node maintains cached indexes of page metadata for navigation and search purposes. These indexes are rebuilt whenever a file or folder change is detected in the source folder. The indexes are stored in memory for fast access.

The navigation index is a representation of the file and folder structure, including only folders and files that are valid markdown pages (i.e., those containing an `index.md` file for folders and nothing starting with `_`).

When a client initially loads a page, the node uses the cached indexes to quickly retrieve the necessary metadata for that page, including front-matter attributes and content snippets for search results.

When a client uses a link to navigate to a different "page", the node retrieves the metadata from the cached indexes and sends it to the client along with the rendered HTML content. The client library then updates the page display accordingly.

Client updates are controlled by updating HTML elements with specific `data-attribute="..."` attributes so that only the necessary parts of the page are updated without a full page reload. The `data-attribute` values correspond to front-matter attributes and special placeholders like `body` for the main content.
