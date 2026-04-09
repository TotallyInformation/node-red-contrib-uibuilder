---
title: markweb - Dynamic web sites using Markdown
description: |
  The `markweb` node gives you the ability to really simply create dynamic web sites using Markdown files.
created: 2026-01-09 15:10:14
updated: 2026-04-09 14:32:24
status: Release
since: v7.6.0
---

You simply define a source folder containing your Markdown files. An HTML template is used to create the overall layout. Everything else is automated for you.

Your site automatically updates itself when you make changes to the source markdown files. You can show page variables, lists of files/folders, search results and more using simple directives in your markdown files. You can also use UIBUILDER's client library features to further update the page dynamically as needed.

> [!TIP]
> Markweb provides a **lot** of features baked-in. Because of this, the more detailed documentation has been split into a demonstration web site that is built using Markweb itself. This allows you to see the features in action and also provides a reference and testbed for features as they are developed.
>
> To view the demo site, simply add a Markweb node to your Node-RED flow. Configure its "Source" to be "[DEMO]". And provide a suitable URL path.

> [!TIP]
> Because `markweb` is built on top of uibuilder, you can use uibuilder's existing features to send messages from Node-RED to the front-end to further update the page dynamically as needed. You could also, if desired, use your own custom front-end JavaScript to further manipulate the page content or add interactivity.

> [!NOTE]
>
> Connected clients automatically receive page updates when the underlying markdown files change on the server. The client then automatically requests the updated page data and updates the display accordingly. This also allows you to do custom front-end processing of the updated data if desired.
>
> A uibuilder managed variable called `pageData` holds all of the current page metadata **and** the HTML page content (in `pageData.content`). The content is rendered to HTML on the Node-RED server, not in the client. This currently happens on each request, future updates are likely to add content caching for performance improvement when large numbers of clients are connected.

## Page layout

The current default HTML template provides a 2 column layout. The left column is a sidebar that contains a search box and results, the main site navigation index, and the current pages table of contents. The sidebar can be toggled open/closed and resized by dragging its edge. The status of the sidebar and the open/closed state of the collapsible navigation list are remembered per user in localStorage. The current page is highlighted in the navigation index. The table of contents also highlights as you scroll through the page content.

The right column contains the page content. The page title is shown at the top, and the page content is rendered below it. The page content is generated from the Markdown files and can include dynamic content using special processing directives and variables as described below.

The left and right columns scroll independently.

In the main content, headings (h2-h6) are collapsible sections. Click on an empty part of the heading line to toggle closed/open the text and sub-headings for that section. Click on heading text to scroll the heading to the top, you will see the URL change to include the heading's anchor link (e.g. `#my-heading`) so that you can easily copy and share the URL to that specific section. Each heading level has a bottom border of varying thickness and color to visually indicate the heading level. Hovering over a heading also shows the level.

The content of the page and any navigation or index lists are automatically updated if the source Markdown folders or files change on the server.

Navigation and other index listings are collapsible and have a faint left-hand border that helps visually indicate the nesting level.

The search box allows you to search for pages by title, description, tags, and content. Search results are sorted by relevance and show a snippet of the matching content. Navigating to a search result retains the search query and results so that you can easily navigate to the next result if desired. Currently, search links only take you to the relavent page, future updates are likely to also scroll to the relevant section within the page. If a search result points to the current page, it is highlighted in the list.

## Styling
Markweb comes with its own CSS stylesheet (`../uibuilder/utils/markweb.css`) that extends the default uibuilder brand CSS. The styles are only configured for dark mode currently. But, of course, you can customise and change styles as needed.


> [!NOTE]
> Currently, the CSS and JavaScript for markweb uses features only suitable for fairly up-to-date browsers. You will need a browser updated no earlier than mid-2022 to ensure full functionality and styling. This may be improved in the future, if it is a problem for you, please get in touch so that I know and can prioritise it.
>
> The front-end CSS and JavaScript are also not yet minified, to make them easier to read and understand during development. Future updates are likely to add minified versions for improved performance.

## Configuration (Node-RED Editor)

- **URL** (required): The URL path where the Markweb instance will be served. This must be unique across all Markweb _and_ uibuilder instances.

  > [!NOTE]
  > The URL path _can_ contain sub-paths (e.g. `mysites/docs`). However, if it does, you will need to adjust the default page template for the `../uibuilder/` resource paths. Having a single sub-path would become `../uibuilder/` -> `../../uibuilder/`, two sub-paths would become `../../../uibuilder/`, and so on. Similarly, you should change the default favicon path in the global-attributes.json file.

  > [!WARNING]
  > Make sure that the URL path is unique across _**all**_ web endpoints in your Node-RED instance. This includes all `uibuilder` and `markweb` nodes as well as any other custom nodes that create web endpoints. If there is a clash, you will get unpredictable results.

- **Source** (required): The folder where your Markweb source files are stored. This can be an absolute path or a path relative to the Node-RED user directory. The folder _**MUST EXIST**_.

   > [!TIP]
   > You can use the text `[DEMO]` as an alternative to an actual folder path. This will load the demo content that is included with uibuilder. This is a great way to quickly get started with Markweb, see how it works, and how you can use Markdown with it.

  > [!WARNING]
  > Any folders or files starting with `_` or `.` are blocked for security reasons.
  >
  > Any folder not containing an `index.md` file is ignored. This file is used as the landing page for a folder.

- **Configuration Folder** (optional): The folder where Markweb will find the override configuration files. This can be an absolute path or a path relative to the Node-RED user directory. If used, the folder _**MUST EXIST**_. See below for more details on the configuration override files.

- **Name** (optional): A name for the node. Used in the flow Editor. Has no other effect.

## Special processing directives and variables

These allow you to add dynamic content and functionality to your pages using simple tags.

They are mostly available both in the HTML wrapper template and in the Markdown files. Though some will only work in one or the other.

While these are initially processed server-side so that only HTML is passed over to the browser clients, the special front-end client library has processes to further update them dynamically as updates are sent from the server (using internal control messages). This is controlled by a couple of HMTL data attributes added to the rendered HTML.

### Directives

Directives provide more complex processing than simple variable replacement. They are enclosed in `%%...%%` tags. Attributes are generally optional and are specified inside square brackets `[...]` as comma-separated `attribute=value` pairs.

Directives are further documented in Markweb's `[DEMO]` website.

### Variables

Variables provide simple variable replacement from front-matter and global/system fields. They are enclosed in `{{...}}` tags. As with directives, attributes can also be provided inside square brackets `[...]` as comma-separated `attribute=value` pairs. Attributes can be used to show before/after text (or HTML), default values, or other variations on the output.

Variables are further documented in Markweb's `[DEMO]` website.

## Optional front-end web components

### show-meta

The optional `<show-meta></show-meta>` web component can be included in your HTML wrapper template or in your Markdown to display the current page's metadata for debugging purposes. It shows all front-matter attributes and global/system attributes in a formatted table.

To load the component, include the following script tag in your HTML wrapper template's `<head>` section _before_ the `markweb.mjs` script tag:

```html
<script type="module" src="../uibuilder/utils/show-meta.mjs"></script>
```

This is already included in Markweb's default HTML template.

## Processes

### File/folder changes

#### Back-end

The node watches the source folder for changes to files and folders. When a change is detected, the navigation and search indexes are rebuilt automatically. All connected clients are notified when the index is rebuilt and what changes occurred.

> [!NOTE]
> The file watcher only goes up to 9 folder levels deep to avoid performance issues.
>
> Sensibly, you should avoid going more than 3-4 levels deep in your folder structure for usability reasons.

After a file/folder change is detected, there is a debounce period (**default 1 second**) to allow for multiple rapid changes to be grouped together before rebuilding the indexes. Clients recieve a `_indexes-change` control message (no other data) followed by a `_source-change` control message containing the list of changes detected (in `msg.changes`).

#### Front-end

When a connected client receives an `_indexes-change` control message, it logs a message to the console but does nothing else currently.

When a connected client receives a `_source-change` control message, it checks if the currently viewed page is affected by any of the changes. If so, it requests a resend of the page data from the server to update the display (using the client's `navigate` function) without updating the browser history cache. That triggers a `navigate` control message back to Node-RED which, in turn, triggers a `_page-navigation-result` control message back to the client with the updated page data and rendered HTML content. The client then updates the page display accordingly.

```mermaid
---
title: When a source page or template changes
config:
  theme: base
  themeVariables:
    primaryColor: 'hsl(182, 57%, 11%)'
    primaryTextColor: 'hsl(55, 19%, 87%)'
    primaryBorderColor: 'hsl(182, 19%, 42%)'
    lineColor: 'hsl(40, 94%, 57%)'
    secondaryColor: 'hsl(120, 100%, 19%)'
    tertiaryColor: 'hsl(304, 78%, 56%)'
---
sequenceDiagram
  box hsla(0, 33%, 19%, 0.50) Node-RED Server
    participant markweb
  end
  box hsla(210, 50%, 26%, 0.50) Client Browser
    participant Client
    participant navigate()
    participant Page Updates
  end

  markweb->>+Client: Ctrl: _source-change
  Client->>+navigate(): toUrl
  navigate()->>+markweb: Ctrl: navigate
  markweb->>Client: Ctrl: _page-navigation-result
  Client->>+Page Updates: ctrlMsg.attributes

```

```mermaid
---
title: Client Receives _page-navigation-result Control Msg
displayMode: compact
config:
  themeCSS: '.messageText:nth-of-type(3), .messageText:nth-of-type(4) {transform: translate(6em, 2em);};'
  layout: elk
  theme: base
  themeVariables:
    primaryColor: 'hsl(182, 57%, 11%)'
    primaryTextColor: 'hsl(55, 19%, 87%)'
    primaryBorderColor: 'hsl(182, 19%, 42%)'
    lineColor: 'hsl(40, 94%, 57%)'
    secondaryColor: 'hsl(120, 100%, 19%)'
    tertiaryColor: 'hsl(304, 78%, 56%)'
---
sequenceDiagram
  %%box rgba(66,33,33,0.5) Node-RED Server
  %%  participant markweb
  %%end
  box hsla(210, 50%, 26%, 0.50) Client Browser
    participant _page-navigation-result
    participant updatePageData()
    participant updateSearchResultHighlight()
  end

  _page-navigation-result->>+updatePageData(): data
  updatePageData()-->>+_page-navigation-result:
  _page-navigation-result->>+_page-navigation-result: innerHTML
  _page-navigation-result->>+_page-navigation-result: handle hash
  _page-navigation-result->>+updateSearchResultHighlight():

```

```mermaid
---
title: Initial Page Load
displayMode: compact
config:
  theme: base
  themeVariables:
    primaryColor: 'hsl(182, 57%, 11%)'
    primaryTextColor: 'hsl(55, 19%, 87%)'
    primaryBorderColor: 'hsl(182, 19%, 42%)'
    lineColor: 'hsl(40, 94%, 57%)'
    secondaryColor: 'hsl(120, 100%, 19%)'
    tertiaryColor: 'hsl(304, 78%, 56%)'
---
sequenceDiagram
  box rgba(66,33,33,0.5) Node-RED Server
    participant htmlTemplate()
    participant getMarkdownFile()
    participant markweb
  end
  box rgba(33,66,99,0.5) Client Browser
    participant Client
    participant navHorizontalInit()
    participant SIO-client-connect
    participant updatePageData()
  end

  Client->>+markweb: HTTP GET
  markweb->>+getMarkdownFile(): 
  markweb->>+htmlTemplate(): 
  markweb->>+Client: HTTP Response
  Client->>+navHorizontalInit(): 
  Client->>+SIO-client-connect: 
  SIO-client-connect-->>+Client:
  Client->>+markweb: Ctrl: getMetaData
  markweb->>+Client: _page-metadata
  Client->>+updatePageData(): 

```

> [!NOTE]
> When processing a file-change, the main Markdown content is rendered to HTML **on the server**. So all fm variables and directives are processed server-side.
>
> Variables are referenced in the template HTML using standard uibuilder reactive web components or HMTL attributes and so are automatically updated upon receipt of the new page data. 

> [!TIP]
> Connected clients will only receive updates after the 1 second debounce period. If you make multiple changes within that period, they will be grouped together into a single update.

> [!WARNING]
> File/folder _renames_ appear as a deletion and an addition. This may happen in any order depending on how the OS reports the changes.

### URLs & URL mapping

The URL specified in the node config is used as the *base URL* for the web site. It must be unique among all `uibuilder` and `markweb` nodes in the Node-RED instance and must not clash with any other existing routes in Node-RED. The actual URL will depend on the Node-RED root URL configuration and/or the uibuilder custom web server if used. It is shown in the Editor UI for the node.

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

This template is used to wrap the rendered HTML content from the markdown files. Variables are referenced in the template HTML using standard uibuilder reactive web components (`<uib-var>`) or HTML reactive attributes (`uib-var`) and so are automatically updated upon receipt of the new page data. 

Requirements (see the default template for details):

* Any scripts should be treated as ES Modules.
* Must include `<uib-var variable="pageData.content" type="html">No content</uib-var>` to indicate where the main content should be inserted.
* Must include a `<base href="%%url%%/">` tag in the `<head>` section for proper SPA navigation.
* Must include a `%%prescript%%` before the line that loads the uibuilder client library. This silently inserts a pre-script that sets `window.pageData` to the loaded page's metadata so that it can be processed early in the page display lifecycle.
* Must include the ESM version of the uibuilder client library. It may include `?logLevel=1` (or some other level) on the URL to set the uibuilder client debugging log level if desired.
* Must include the `markweb.mjs` front-end processing library _after_ uibuilder client library.

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

> [!NOTE]
>
> The index cache stores the Markdown for each page, this is included for searching, The Markdown is rendered to HTML just before sending the page data to the requesting client.

> [!TIP]
> When using `{{...}}` tags in your _Markdown files_, the rendered content is silently wrapped in `<uib-var variable="...">....</uib-var>` tags. This enables you to both easily style any of the content by variable name as well as use custom front-end JavaScript code to further change them if desired.
>
> `%%...%%` special processing directives automatically add the necessary wrappers to their rendered HTML elements.

## Dependencies

> [!NOTE]
> All dependencies for this node are dealt with internally. You do not need to install any additional packages.

The node uses 2 packages from separate sub-workspaces:
* `@totallyinformation/uib-fs-utils` - Chokidar for file watching.
* `@totallyinformation/uib-md-utils` - Front-Matter, Markdown-IT & extensions.

  The original intent was to use the `marked` package as is already used and installed by Node-RED. However, it is not possible to access that library reliably from a custom node due to the way Node-RED manages its dependencies. In addition, it has some significant limitations. So `markdown-it` has been used instead.

## Requirements

This is a rough list of the original requirements for the `markweb` node.

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
