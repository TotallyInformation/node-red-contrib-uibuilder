---
author: Julian Knight (Totally Information)
created: 2026-03-20 11:41:53
updated: 2026-03-22 14:24:16
status: Draft
title: Directives
description: >
    Showing how to use directives in markdown files.
    Directives allow server-generated content to be included dynamically.
---

Directives run code on the server to generate content. Some support additional parameters in square brackets `[]`.

Directives provide more complex processing than simple variable replacement. They are enclosed in `%%...%%` tags. Attributes are generally optional and are specified inside square brackets `[...]` as space-separated `attribute=value` pairs. Directives have to be pre-defined on the server.

## Available directives

### Body

- `%%body%%` (only in the HTML Template) directive to insert the main content body. Converted to HTML from the markdown file.

### Copyright placeholder (`%%copyright%%`)

`%%copyright%%` - Placeholder for copyright information.

By default, it uses:

```html
Copyright © %%date [type=updated, format=YYYY]%% {{author}}. Updated %%date [type=updated, format=D_MMM_YYYY]%%
```

This is stored in the file `copyright-template.html` in the `templates/.markweb-defaults/` folder.

This directive has no attributes of its own. Alternative configurations use a custom template file (e.g., `copyright-template.html`) in the `configFolder` that defines how the copyright information should be displayed. The template can use other directives and variables to customize the output.

### Date placeholder (`%%date%%`)

`%%date [attributes]%%` - Placeholder for a date. By default, it shows the current date. Attributes can be used to specify a different date and/or formatting.

Attributes:

* `type` - The type of date to show: Either a date from frontmatter (e.g. `created`, or `updated`), or `now` (default: `now`).
* `format` - The date format string (default: `YYYY-MM-DD`). Uses standard date formatting tokens. `_` is translated to a space.

### Index list of files/folders (`%%index%%`)

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

* `latest` - Lists the last `n` created/updated items. Without an explicit `start`, defaults to the current page's depth level.
  
  E.g:
  
  * `%%index[latest=10]%%`- 10 most recently created/updated pages from the current level down.
  * `%%index[latest=5, type=files]%%` - 5 most recent files only.
  * `%%index[latest=3, start=0, end=2]%%` - 3 most recent pages at depth 0-2.
  * `%%index[latest=10, from=2025-01-01]%%` - 10 most recent since Jan 2025.
  

*Not yet implemented*:

* `sort` - The sorting order: `name`, `date`, or `custom` (default: `name`).
* `order` - The sorting direction: `asc` or `desc` (default: `asc`).
* `exclude` - Comma-separated list of file or folder names to exclude (default: none).

### Navigation menu (`%%nav%%`)

`%%nav [attributes]%%` - Generates a navigation menu based on the folder structure. Attributes can be used to control depth, type (files/folders/both), orientation (horizontal/vertical), etc.

`nav` uses the `%%index%%` directive internally to build the menu structure. So it accepts the same attributes as `index`, plus:

Attributes:

* `orient` - The orientation of the menu: `horizontal` ~~or `vertical`~~ (default: `horizontal`). As of v7.6.0, only `horizontal` is implemented. You can use `%%index%%` to build vertical lists.

### Search results placeholder (`%%search-results%%`)

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

### Sidebar (`%%sidebar%%`)

`%%sidebar [attributes]%%` - Generates a sidebar with navigation index and page table of contents.

The sidebar includes two tabs: one for the navigation index (generated from the page structure) and one for the page's table of contents (generated from page headings).

Features:

* **Navigation tab** - Shows a hierarchical navigation index of the site. Uses `%%index%%` internally to generate the list.
* **Table of contents tab** - Auto-generated from page headings (h2-h6). Updates dynamically when navigating. The current heading is highlighted in the table of contents as you scroll through the page.
* **Collapsible sections** - Uses `<details>`/`<summary>` elements. Collapsed/expanded state is remembered per user in localStorage.
* **Current page highlighting** - The current page is visually highlighted in the navigation.
* **Resizable** - The sidebar can be resized by dragging its edge. Width resets on page reload.
* **Toggle open/closed** - A toggle button allows the sidebar to be collapsed. State is remembered in localStorage.
* **Search box** - Optional search box above the tabs, with search results displayed below it.

Styling:

The sidebar is styled using CSS variables for easy customization. As of UIBUILDER v7.6.0, the UIBUILDER brand CSS is used and partially overridden by markweb's own CSS. However, only dark mode is currently properly configured.

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

### Other directives

* `%%url%%` - The base URL of the web site. No attributes.
  
* `%%...%%` - Other directives may be added in the future.
