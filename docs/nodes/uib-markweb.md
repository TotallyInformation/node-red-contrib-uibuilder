---
title: uib-markweb - Dynamic web sites using Markdown
description: |
  The `uib-markweb` node allows you to create dynamic web sites using Markdown files.
created: 2026-01-09 15:10:14
updated: 2026-02-07 16:08:26
status: Release
since: v7.6.0
---

## Configuration (Node-RED Editor)

* **URL**: The URL to use for this web site.
* **Folder**: The folder where your Markdown files are stored. The folder must already exist.
* **Name**: A name for the node.

> [!WARNING]
> Any folders or files starting with `_` or `.` are blocked for security reasons.
>
> Any folder not containing an `index.md` file is ignored. This file is used as the landing page for a folder.

## Special processing directives and variables

These allow you to add dynamic content and functionality to your pages using simple tags.

They are mostly available both in the HTML wrapper template and in the Markdown files. Though some will only work in one or the other.

While these are initially processed server-side so that only HTML is passed over to the browser clients, the special front-end client library has processes to further update them dynamically as updates are sent from the server (using internal control messages). This is controlled by a couple of HMTL data attributes added to the rendered HTML.

> [!TIP]
> Because `uib-markweb` is built on top of uibuilder, you can use uibuilder's existing features to send messages from Node-RED to the front-end to further update the page dynamically as needed.
>
> Connected clients automatically receive page updates when the underlying markdown files change on the server. The client then automatically requests the updated page data and updates the display accordingly. This also allows you to do custom front-end processing of the updated data if desired.

### Directives

These provide more complex processing than simple variable replacement. They are enclosed in `%%...%%` tags. Attributes are generally optional and are specified inside square brackets `[...]` as comma-separated `attribute=value` pairs.

#### Copyright placeholder (`%%copyright%%`)

`%%copyright%%` - Placeholder for copyright information.

By default, it uses:

```html
Copyright © %%date [type=updated, format=YYYY]%% {{author}}. Updated %%date [type=updated, format=D_MMM_YYYY]%%
```

This is stored in the file `copyright-template.html` in the `templates/.markweb-defaults/` folder.

This directive has no attributes of its own. Alternative configurations use a custom template file (e.g., `copyright-template.html`) in the `configFolder` that defines how the copyright information should be displayed. The template can use other directives and variables to customize the output.

#### Date placeholder (`%%date%%`)

`%%date [attributes]%%` - Placeholder for a date. By default, it shows the current date. Attributes can be used to specify a different date and/or formatting.

Attributes:

* `type` - The type of date to show: Either a date from frontmatter (e.g. `created`, or `updated`), or `now` (default: `now`).
* `format` - The date format string (default: `YYYY-MM-DD`). Uses standard date formatting tokens. `_` is translated to a space.

#### Index list of files/folders (`%%index%%`)

`%%index [attributes]%%` - Generates an index list of files and/or folders. Attributes can be used to control depth, file types, sorting, etc.

Attributes:

* `start` - The starting depth level to include in the index list (default: the current page's depth).
* `end` - The ending depth level (default: the current page's depth if `start` not provided, otherwise `5`).
  
    `start` and `end` are base 0, so the root folder is level 0.

* `depth` - Shorthand to set the number of levels to include. Equivalent to `end = start + depth`.
* `type` - The type of items to include: `files`, `folders`, or `both` (default: `both`).
* `from` - Filter to include only items created/updated after this date/time.
* `to` - Filter to include only items created/updated before this date/time.

  Can be set to `now` to mean the current date/time at the time of index list creation.

  `%%index[from=2025-01-01, to=now]%%`


* `duration` - Filter to include only items created/updated offset from either `from` or `to`.
  
  E.g.:
  
  * `%%index[duration=1w]%%` Last week from now
  * `%%index[from=2025-06-01, duration=1m]%%`
  * `%%index[to=now, duration=2w]%%`
  * Duration can be negative to go backwards in time from `to`. E.g., `to=now, duration=-1m` for the month before now.

* `latest` - Lists the last `n` created/updated items. Overrides `start`, `end`, and `depth`.
  
  E.g.:
  
  * `%%index[latest=10]%%`- 10 most recently created/updated pages.
  * `%%index[latest=5, type=files]%%` - 5 most recent files only.
  * `%%index[latest=3, start=0, end=2]%%` - 3 most recent pages at depth 0-2.
  * `%%index[latest=10, from=2025-01-01]%%` - 10 most recent since Jan 2025.
  
*Not yet implemented*:

* `sort` - The sorting order: `name`, `date`, or `custom` (default: `name`).
* `order` - The sorting direction: `asc` or `desc` (default: `asc`).
* `exclude` - Comma-separated list of file or folder names to exclude (default: none).

#### Navigation menu (`%%nav%%`)

`%%nav [attributes]%%` - Generates a navigation menu based on the folder structure. Attributes can be used to control depth, type (files/folders/both), orientation (horizontal/vertical), etc.

`nav` uses the `%%index%%` directive internally to build the menu structure. So it accepts the same attributes as `index`, plus:

Attributes:

* `orient` - The orientation of the menu: `horizontal` ~~or `vertical`~~ (default: `horizontal`). As of v7.6.0, only `horizontal` is implemented. You can use `%%index%%` to build vertical lists.

#### Search results placeholder (`%%search-results%%`)

`%%search-results [attributes]%%` - Placeholder for search results.

Attributes:

* `head` - The header text to show above the search results. Default is "Search results for `<span id="search-query">N/A</span>" (<span id="search-count">N/A</span>)`. If set to `short`, it will just show `<span id="search-count">N/A</span> results`.

Search results are sorted by relevance to the search query. The score is available as a tooltip. Scoring is as follows:

* +10 points for a match in the title.
* +7 points for a match in the tags.
* +5 points for a match in the description.
* +1 point for a match in the body text.

Beneath the page title in the search result entry, a snippet of the top-scoring matching text is shown.

If one of the search results is the current page, it is highlighted.

Navigating to any of the search results retains the search query and results so that the user can easily navigate to the next result if desired.

Only one `%%search-results%%` directive is supported per page. It should be in the HTML wrapper template, rather than the Markdown files. If using the `%%sidebar%%` directive, the search results are automatically included in the sidebar. So this directive is really only needed when using a horizontal navigation menu in the page main header.

#### Sidebar (`%%sidebar%%`)

`%%sidebar [attributes]%%` - Generates a sidebar with navigation index and table of contents. The sidebar includes two tabs: one for the navigation index (generated from the page structure) and one for the page's table of contents (generated from page headings).

Features:

* **Navigation tab** - Shows a hierarchical navigation index of the site. Uses `%%index%%` internally to generate the list.
* **Table of contents tab** - Auto-generated from page headings (h2-h6). Updates dynamically when navigating.
* **Collapsible sections** - Uses `<details>`/`<summary>` elements. Collapsed/expanded state is remembered per user in localStorage.
* **Current page highlighting** - The current page is visually highlighted in the navigation.
* **Resizable** - The sidebar can be resized by dragging its edge. Width resets on page reload.
* **Toggle open/closed** - A toggle button allows the sidebar to be collapsed. State is remembered in localStorage.
* **Search box** - Optional search box above the tabs, with search results displayed below it.

Styling:

The sidebar is styled using CSS variables for easy customization. As of UIBUILDER v7.6.0, the UIBUILDER brand CSS is used and partially overridden, however, only dark mode is currently properly configured.

* `--sidebar-min-width: 5em;`, `--sidebar-max-width: 15em;` - these control the default sidebar width. They allow the sidebar to automatically adjust to different screen sizes while maintaining usability.
* `--sidebar-border-color: var(--text3);` - `--text3` is a standard uibuilder color variable that adapts to light/dark themes.

Attributes:

* `search` - Whether to include the search box: `true` or `false` (default: `true`).
* `width` - Set the sidebar width (default is set by stylesheet at `5em` to `20em`). Do not forget to include the CSS length unit (e.g., `20em`, `300px`, `25%`, etc.). If not specified, the CSS default is used. This sets both the `--sidebar-max-width` and `--sidebar-min-width` CSS variables to the same value to effectively fix the width. The sidebar is still resizable by dragging, but will reset to this width on page reload.
* `start` - Starting depth level for navigation index (default: `0`).
* `end` - Ending depth level for navigation index (default: `3` = 4 levels).

Example usage:

```html
%%sidebar [search=true, width=20em, start=0, end=3]%%
```

**Override with sidebar.json**

You can provide a manual `sidebar.json` file in your config folder to fully override the auto-generated navigation index. The file should contain an array of navigation items:

```json
[
    {
        "title": "Home",
        "shortTitle": "Home",
        "description": "Welcome page",
        "path": "/",
        "children": []
    },
    {
        "title": "Getting Started",
        "shortTitle": "Start",
        "description": "How to get started",
        "path": "/getting-started/",
        "children": [
            {
                "title": "Installation",
                "path": "/getting-started/installation"
            },
            {
                "title": "Configuration",
                "path": "/getting-started/configuration"
            }
        ]
    }
]
```

**Front-matter fields for sidebar:**

* `shortTitle` - Used in the sidebar instead of `title` if present. Useful for shorter navigation labels.
* `description` - Used as the HTML `title` attribute (tooltip) on navigation links.

#### Other directives

* `%%body%%` - Placeholder for the main content of the page. No attributes.
  
  > [!NOTE]
  > Note that the `body` directive is required in the HTML wrapper template to display the page content. It must be contained in a parent HTML element with a `data-attribute="body"` attribute for dynamic updates to work correctly.
  >
  > Should really only be used in the HTML wrapper template, not in Markdown files.

* `%%url%%` - The base URL of the web site. No attributes.

* `%%...%%` - Other directives may be added in the future.

### Variables

These provide simple variable replacement from front-matter and global/system fields. They are enclosed in `{{...}}` tags.

All front-matter fields from the Markdown files can be used as variables. Some common ones are listed here.

If not provided in the front-matter, the following default fields are always available, generated from the filing system information of the source Markdown files:

* `title` - The title of the page.
* `created` - The creation date of the page.
* `updated` - The last updated date of the page.

From system data and not overridable by front-matter:

* `depth` - How deep in the folder structure the page is.
* `path` - The current page path relative to the site root.
* `toUrl` - The resource URL of the current page relative to the site root.
* `fsMtimeMs` - The last modified time of the source file in milliseconds since epoch. (Used internally checking for file updates).
* `type` - The type of page: `file` or `folder`.

Provided by the default global config file but overridable by front-matter. Additional ones may be added in your own `global-attributes.json` file:

* `status` - The status of the page. E.g., `draft`, `published`, etc. *Default is `draft`.*

Other commonly used front-matter fields you may wish to include in your Markdown files:

* `description` - The description of the page.
* `author` - The author of the page.
* `tags` - The list of tags of the page.
* `category` - The category of the page.

* Possible future globals:

  * `template` - A different HTML template to the default to allow for different page layouts.
  * `siteTitle` - The site title from global config. (Read-only).
  * `siteDescription` - The site description from global config. (Read-only).

## Optional front-end web components

### show-meta

The optional `<show-meta></show-meta>` web component can be included in your HTML wrapper template to display the current page's metadata for debugging purposes. It shows all front-matter attributes and global/system attributes in a formatted table.

To load the component, include the following script tag in your HTML wrapper template's `<head>` section _before_ the `markweb.mjs` script tag:

```html
<script type="module" src="../uibuilder/utils/show-meta.mjs"></script>
```

## Processes

### File/folder changes

The node watches the source folder for changes to files and folders. When a change is detected, the navigation and search indexes are rebuilt automatically. All connected clients are notified when the index is rebuilt and what changes occurred.

If a connected client is currently viewing a page that has changed, it requests a resend of the page data to update the display.

> [!NOTE]
> The file watcher only goes up to 9 folder levels deep to avoid performance issues.
>
> Sensibly, you should avoid going more than 3-4 levels deep in your folder structure for usability reasons.

After a file/folder change is detected, there is a debounce period (**default 1 second**) to allow for multiple rapid changes to be grouped together before rebuilding the indexes. Clients recieve a "_indexes-change" message followed by a "_file-change" message containing the list of changes detected (in `msg.changes`).

> [!TIP]
> Connected clients will only recieve updates after the 1 second debounce period. If you make multiple changes within that period, they will be grouped together into a single update.

> [!NOTE]
> File/folder _renames_ appear as a deletion and an addition. This may happen in any order depending on how the OS reports the changes.

### URLs & URL mapping

The URL specified in the node config is used as the *base URL* for the web site. It must be unique among all `uibuilder` and `uib-markweb` nodes in the Node-RED instance and must not clash with any other existing routes in Node-RED. The actual URL will depend on the Node-RED root URL configuration and/or the uibuilder custom web server if used. It is shown in the Editor UI for the node.

Any additional path segments after the base URL are used to identify the specific markdown file or folder being requested.

For example, if the base URL is `/docs` and the request is for `/docs/getting-started`, the node will look for a `getting-started.md` file in the source folder.

However, if `getting-started` is a folder, the node will look for an `index.md` file inside that folder.

> [!TIP]
> All relative links in your markdown files are relative to the *base URL* of the site, *not the current document*. This is important for SPA navigation to work correctly.

### Server folder locations

The `source` folder specified in the node's Editor config is used as the root folder for the markdown files. If a relative path is provided, it is made relative to the Node-RED `userDir` folder.

> [!TIP]
> The source folder **must** already exist. The node will not create it for you.
> 
> It must have at least a single `index.md` file to serve any content.

The `configFolder` specified in the node config is used to store configuration files such as the HTML wrapper template and global attributes. If a relative path is provided, it is made relative to the Node-RED `userDir` folder.

> [!TIP]
> The config folder must already exist. The node will not create it for you.
>
> It is recommended _not_ to use a sub-folder of the source folder for the config folder to avoid accidental exposure of config files via the web server.
> 
> The system will automatically copy default versions of `page-template.html` and `global-attributes.json` to the config folder on Node-RED startup if they are not already present.



### Template files

Custom template files, if desired, must be stored in the `configFolder` specified in the node config. If a required template file is not found there, a default version from the package `templates/.markweb-defaults/` folder is used.

On Node-RED startup, the node checks for the presence of the following files in the `configFolder`: `page-template.html`, `global-attributes.json`. If any are missing, the default versions are copied from the package `templates/.markweb-defaults/` folder to the `configFolder` for easy customization.

> [!NOTE]
> In the first release (UIBUILDER v7.6.0), only `page-template.html` and `global-attributes.json` are supported. More will be added in the future.

#### HTML wrapper template

The HTML wrapper template is stored in the `page-template.html` file in the `configFolder`. If not found there, a default version from the package `templates/.markweb-defaults/` folder is used.

> [!NOTE]
> See [Default Template](#default-page-template) below for the default template and styling details.

This template is used to wrap the rendered HTML content from the markdown files. It can include `{{...}}` variable replacements and `%%...%%` directives as described above.

Requirements (see the default template for details):

* Any scripts should be treated as ES Modules.
* Must include a `%%body%%` directive to indicate where the main content should be inserted.
* The body must be wrapped in an HTML element with a `data-attribute="body"` attribute for dynamic updates to work correctly.
* Must include a `<base href="%%url%%/">` tag in the `<head>` section for proper SPA navigation.
* Must include the ESM version of the uibuilder client library and the `markweb.mjs` front-end processing library.
* The `markweb.mjs` script tag must include a `data-base-url="%%url%%"` attribute to specify the base URL of the site.
* The uibuilder client library script tag must be before the `markweb.mjs` script tag. It may include `?logLevel=1` (or some other level) on the URL to set the client debugging log level if desired.

> [!TIP]
> To get the default template back, simply rename your existing `page-template.html` file in the `configFolder` and restart Node-RED. The default version will be copied back into place. You may wish to keep a copy of it to hand for reference.

### Global attributes

These are read from the `global-attributes.json` file in the `configFolder`. If not found there, a default version from the package `templates/.markweb-defaults/` folder is used. They are merged with the front-matter attributes from each markdown file to provide the full set of available attributes for that file. They are merged before any page-specific front-matter, so page front-matter overrides global attributes.

> [!TIP]
> Global attributes can be used to define site-wide settings or metadata that should be available on every page and also to provide default values for common front-matter fields.

### Cached page metadata indexes

The node maintains cached indexes of page metadata for navigation and search purposes. These indexes are build at Node-RED starrtup and rebuilt whenever a file or folder change is detected in the source folder. The indexes are stored in memory for fast access.

> [!WARNING]
> For large sites with many markdown files, this could consume significant memory. Monitor your Node-RED instance for performance issues.
>
> Future releases will consider optimising memory use and options for persisting indexes to disk or using a database.

The index is a representation of the file and folder structure, including only folders and files that are valid markdown pages (i.e., those containing an `index.md` file for folders, `*.md` for files, and nothing starting with `_`).

When a client initially loads a page, the node uses the cached indexes to quickly retrieve the necessary metadata for that page, including front-matter attributes and content snippets for search results.

When a client uses a link to navigate to a different "page", the node retrieves the metadata from the cached indexes and sends it to the client along with the rendered HTML content. The client library then updates the page display accordingly.

Client updates are controlled by updating HTML elements with specific `data-attribute="..."` attributes so that only the necessary parts of the page are updated without a full page reload. The `data-attribute` values correspond to front-matter attributes and special placeholders like `body` for the main content.

> [!TIP]
> Use the `data-attribute` attributes in your _HTML wrapper template_ to control which parts of the page get updated during navigation & page updates. These are required as well as the `{{...}}` tags otherwise, the tags will only be processed on the initial page load.
>
> When using `{{...}}` tags in your _Markdown files_, you don't need to worry about `data-attribute` attributes.
>
> `%%...%%` special processing directives automatically add the necessary `data-attribute` attributes to their rendered HTML elements.

## Dependencies

> [!NOTE]
> All dependencies for this node are dealt with internally. You do not need to install any additional packages.

The node uses 2 packages from separate sub-workspaces:
* `@totallyinformation/uib-fs-utils` - Chokidar for file watching.
* `@totallyinformation/uib-md-utils` - Front-Matter, Markdown-IT & extensions.

  The original intent was to use the `marked` package as is already used and installed by Node-RED. However, it is not possible to access that library reliably from a custom node due to the way Node-RED manages its dependencies. In addition, it has some significant limitations. So `markdown-it` has been used instead.

## Requirements

This is a rough list of the original requirements for the `uib-markweb` node.

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

### Required features of the markdown processor

* [ ] Footnotes.
* [ ] Mermaid diagrams.
* [ ] Page table-of-contents
* [ ] Transclude other markdown files.
* [ ] Details/summary wrappers for auto-collapsible headings sections (optional).
* [ ] Automated footer with last-modified date, copyright, author, etc.
* [ ] Auto-generate a sidebar navigation from the folder structure. Allow for in-page section navigation using headings. Where present, have two tabs in the sidebar: "Contents" and "Sections" (ref Typora's layout).
* [ ] Partly implemented but needs much more work. ~~Dynamic checklists (clickable checkboxes that update the display, fire an event and send to Node-RED).~~  Deferred for now. Either needs to be able to update the source markdown or maintain state elsewhere.


## Possible future requirements

These may or may not be implemented in future releases depending on demand and complexity.

* [ ] Add separate bundle of markdown-it & extensions for front-end use.
* [ ] Allow additional markdown-it extensions to be specified via node config.
* [ ] Consider caching nav and search indexes. Possibly to disk or a database.
* [ ] More comprehensive search features. Possibly using a dedicated search library.
* [ ] In Editor, if there is a url clash with another uibuilder instance, show a warning.
* [ ] Allow markdown-it extensions to be specified - probably via `settings.js` uibuilder config.
* [ ] Mount client versions of markdown-it and extensions to front-end for use in std uibuilder front-ends.
* [ ] Add option to use the new Navigate web API for SPA navigation. (Safari from 2025-12, Chromium from 2022, Firefox not yet supported).

## Default page template

### Default styling

The default template first loads the standard UIBUILDER brand CSS. It then loads a `markweb.css` stylesheet which contains the default styling overrides for the default template. If you prefer, you can, of course, replace these styles with your own custom styles by loading a different stylesheet in the template.

Both the UIBUILDER and the `markweb` styles make extensive use of CSS variables for easy customization without needing to change the stylesheet necessarily.

> [!NOTE]
> As of UIBUILDER v7.6.0, the `markweb` stylesheet only configured correctly for dark mode.

### Default layout with sidebar

This layout uses a vertical navigation menu in a sidebar on the left, with the page content on the right. The sidebar includes the search box and tabs for navigation and page table of contents. Search results appear in the sidebar below the search input. The sidebar scrolls independently of the main content and can be hidden or resized.

```html
<!DOCTYPE html>
<!-- Everything like %%...%% and {{...}} gets replaced on first page load if attributes available.
  -- Everything that has a data-attribute="...." gets updated when navigating via SPA.
  -- % %body% % is where the main content goes. If you don't include it, you get no content!
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

    <script type="module" src="../uibuilder/uibuilder.esm.min.js?logLevel=1"></script>
    <!-- OPTIONAL show-meta component to display page metadata for debugging -->
    <script type="module" src="../uibuilder/utils/show-meta.mjs"></script>
    <!-- Base URL is REQUIRED by the module! The uibuilder client lib is loaded by this module -->
    <script type="module" src="../uibuilder/utils/markweb.mjs" data-base-url="%%url%%"></script>
    <!-- You can add your own scripts here -->

</head><body><div id="markweb">

    <!-- Adds resuzer column, Wraps sidebar in an aside tag -->
    %%sidebar%%

    <main><!-- Main content -->
        <a class="skip-link" href="#main">Skip to main content</a>
        <header>
            <!-- Nav not needed if sidebar is used (add/remove double %) -->
            <h1 data-attribute="title">{{title}}</h1>
            <!-- Results not needed if sidebar is used (add/remove double %) -->
            <!-- search-results -->
            <!-- Optional page status display -->
            <blockquote class="visible-status" data-attribute="status">Status: {{status}}</blockquote>
            <div data-attribute="description">{{description}}</div>
        </header>

        <!-- This is where the main content goes. It will be replaced on navigation. -->
        <section data-attribute="body">%%body%%</section>

        <!-- OPTIONAL show-meta component to display page metadata for debugging -->
        <!-- <show-meta></show-meta> -->

        <footer><!-- Common page footer -->
            %%copywrite%% Updated %%date [type=updated]%%. UIBUILDER MarkWeb.
        </footer>
    </main>
</div></body></html>
```

### Alternate layout with top navigation bar

Given as an example of how you can use the directives and variables to create a different layout. This layout uses a horizontal navigation menu in the header, search results appear below the visible title heading.

```html
<!DOCTYPE html>
<!-- Everything like %%...%% and {{...}} gets replaced on first page load if attributes available.
  -- Everything that has a data-attribute="...." gets updated when navigating via SPA.
  -- % %body% % is where the main content goes. If you don't include it, you get no content!
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

    <script type="module" src="../uibuilder/uibuilder.esm.min.js?logLevel=1"></script>
    <!-- Base URL is REQUIRED by the module! The uibuilder client lib is loaded by this module -->
    <script type="module" src="../uibuilder/utils/markweb.mjs" data-base-url="%%url%%"></script>
    <!-- You can add your own scripts here -->

</head><body>

    <a class="skip-link" href="#main">Skip to main content</a>
    <header>
        %%nav [orient=horizontal,start=0,end=3,type=both]%%
        <h1 data-attribute="title">{{title}}</h1>
        %%search-results%%
        <div class="visible-status" data-attribute="status">{{status}}</div>
    </header>

    <main id="main">
        <div data-attribute="body">%%body%%</div>
    </main>

</body></html>

```
