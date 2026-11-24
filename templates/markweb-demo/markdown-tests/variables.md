---
author: Julian Knight (Totally Information)
created: 2026-03-20 11:41:53
updated: 2026-11-23 20:36:22
status: complete
title: Variables
description: >
    Rendered variable values in markdown files.
    Variables come from page front-matter, global attributes, or system-provided data.
tags:
  - markdown
  - variables
  - front-matter
  - frontmatter
  - globals
  - global attributes
  - system variables
---

A variable is a placeholder that can be used in markdown files to insert dynamic content. Variables are defined in the page _front-matter_, _global attributes_, or provided by _the system_. They can be rendered in the markdown content using the `{{variable}}` syntax.

> [!TIP]
> If you edit the markdown file for a currently shown page, the changes will be reflected immediately (after a short delay to allow the server filing system to update), this includes updating the variables.
>
> You can also dynamically set variables using UIBUILDER's `uibuilder.set('pageData.someVar', ...)`{class="language-javascript"} function in your client-side JavaScript code. This allows you to update variable values in response to user interactions or other events, and have those changes reflected in the rendered markdown content. You can also set variables from Node-RED server-side code using the appropriate uibuilder remote command message.

## Common variables

These are often used in the Markdown page's front-matter:

- `{{title}}` - The page title {plain text}.
- `{{shortTitle}}` - Optional. Used in index/nav listings where provided {plain text}.
- `{{description}}` - The page description {plain text}.
- `{{sortPriority}}` - If present, overrides the default sorting of pages in index/nav listings. {plain text: high, medium, low}
- `{{status}}` - The current status of the page, e.g., `Draft` or `Published` {plain text}.
- `{{author}}` - The page author {plain text}.
- `{{created}}` - The page creation date/time {ISO 8601 text}.
- `{{updated}}` - The page last updated date/time {ISO 8601 text}. Note that without this, the filing system's last modified date/time is used instead, so this variable is not strictly required however, it is recommended as it is widely used by other markdown web tools.
- `{{category}}` - The page category {single value, plain text}.
- `{{tags}}` - The page tags {a list of values, plain text}.

Variables provided by the system, do not use these in your markdown front-matter as they will be overwritten:

- `{{path}}` - The current page path.
- `{{url}}` - The full URL of the current page.

Globals (some of these are added automatically, others can be set in the global attributes JSON override file):

- `{{favicon}}` - The default favicon for the site. (default: `../uibuilder/images/uib-world-green.svg`) {URL}.
- `{{title}}` - A page title used if a specific page title is set to an empty string. Having no title defaults to the file name, but this allows you to have a default title that is not the file name.
- `{{description}}` - A global page description used if a specific page description is not provided.

## Available variables for a page

You can show the current available page variables by using the `<show-meta></show-meta>` custom web component in your markdown file. This will render a table of all available variables and their current values for that page. This is useful for debugging and understanding what data you have available to work with in your markdown content.

<show-meta closed></show-meta>

## Variables processed by Markweb

Some of the variables available are used by Markweb to control various outputs and behaviours.

### Used in index and navigation listings

- `title` - Used as the display title for the page in listings.
- `shortTitle` - If provided, used instead of the title, useful if you like long page titles but want a shorter version in menus and the like.
- `file` - Used for the entry name if neither `title` nor `shortTitle` are provided.
- `description` - Added as an entry tooltip (via the HTML `title` attribute).
- `sortPriority` - Overrides the sorting order of entries, (`high`, `medium`, or `low`). If absent, priority is `medium`.
- `updated`/`created` - Used to sort entries by date when filtered by "latest".

### Used in the default page template

- `title` - Used as the page title in the HTML `<title>` tag and as the default heading on the page.
- `description` - Used as the content of the HTML `<meta name="description">` tag for SEO purposes. Also shown under the visible title when using the default page template.
- `status` - If present, shown in a callout box above the main text. Use to show the current status of the page. e.g. "Outdated", "Draft", etc.
- `since` - If present, shown in the same callout box as status. Use to indicate the minimum version or date when the page was implemented.

### Used in the default footer template

- `author` - Can be used to indicate the author of the page and can be rendered in the content to give credit to the author.
- `updated`/`created` - Year is used in the (c) statement. Date is used in the "Updated" statement.

### Future use

- `subtitle` - Could be useful for some types of page template.
- `category` - Perhaps shown in a page sub-heading. Will be used for additional sorting of index listings.
- `tags` - Perhaps shown in a page sub-heading. Will be used for additional sorting of index listings.

## Custom variable rendering with arguments

The `{{variable}}` syntax can also include optional arguments in square brackets `[...]` as comma-separated `attribute=value` pairs. These arguments are passed to the variable handler function and can be used to modify the rendered output of the variable value.

### Arguments

- `before` - (Text or HTML) prepended to the value.
- `after` - (Text or HTML) appended to the value. Only rendered when a value is present.
- `default` - (Text or HTML) fallback value used when the front-matter variable is absent.
- `output` - (one of 'html'|'text'|'plain'|'markdown'|'json'|'object'|'table'|'array'|'list', default is 'html') the output type of the variable content.

> [!NOTE]
> Text/HTML values are just that and cannot contain Markdown.

## Potentially useful uibuilder variables

The uibuilder front-end client maintains a number of variables that may be useful to render in your markdown content.

They can be accessed using the uibuilder custom web component `<uib-var>` or the `uib-var` custom HTML attribute in your markdown content, as detailed in the [technical details](#technical-details) section below. They can also be accessed in your own custom client-side JavaScript code using `uibuilder.get('variableName')` or using the `uibuilder.onChange('variableName', callback)` function to react to changes in variable values.

Use this in Markdown: `<uib-var variable="markwebEvent"></uib-var>`, you can also use the `output` attribute for different format outputs.

Variable names include:

- `markwebEvent` - An object containing details of the most recent Markweb event, such as page navigation or content update events. This can be useful for triggering custom behaviors in response to these events, e.g., updating the page layout or content based on the new page data after a navigation event.

  <uib-var variable="markwebEvent" data-before="Last event: <code>" data-after="</code>"></uib-var>

  Possible event names:

  - `page-navigation` - Triggered when the server responds to a page navigation request from the client, or when the server detects that a page refresh is needed (e.g., after a configuration change). The event object includes details such as the old and new URLs.

     ```json
     { "type": "page-navigation", "oldUrl": "<previousPageUrl>", "newUrl": "<newUrl>" }
     ```

- `clientId` - The unique client ID for the current client session.
- `logLevel` - The current log level of the uibuilder client library, which can be useful for debugging purposes. Can also be _set_.
- `online` - Whether the client is currently connected to the server.
- `pageData` - All the current page variables, including those defined in the page front-matter and any global attributes. This can be useful for rendering multiple variables in a more complex way, e.g., as a table or list, or for applying custom formatting to variable values before rendering.
- `serverTimeOffset` - The difference between the browser's local time and the current server time, which can be useful for displaying timestamps or calculating time differences.
- `tabId` - The ID of the current browser tab, which can be useful for tracking user sessions or implementing tab-specific functionality.
- `version` - The current version of the uibuilder client library.

## Technical details

When `markweb` renders a markdown file, it processes the content and replaces any `{{variable}}` placeholders with a `<uib-var variable="..."></uib-var>` web component.

There are however, actually 3 technical methods for rendering variables in markdown content. Each of these methods has its own use cases and advantages, and you can choose the one that best fits your needs for rendering variable values.

1. The default `{{fmvarname}}` syntax which is processed by Markweb. This is the simplest and most straightforward way to render variables and is generally the most useful in Markdown content.

   An `fm-fmvarname` class is added to the wrapper to enable you to easily style any specific variable consistently across your site or individually.


2. The `<uib-var>` [custom web component from uibuilder](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/client-docs/custom-components?id=uib-var) can be used directly in markdown content for more flexible variable rendering. This allows different output formats and filter functions to be applied before rendering. Variable names have to be prefixed with `pageData.` to access page variables, e.g., `<uib-var variable="pageData.title"></uib-var>`. Great for rendering variables in more complex ways, e.g. as tables, lists, or with custom formatting. The variable name must be a uibuilder-managed variable so that it remains responsive to changes. You can also use `topic` instead of `variable` and then the output is responsive to messages from Node-RED with the appropriate topic.

3. The `uib-var`/`uib-topic` [custom HTML attributes, also from uibuilder](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/client-docs/reactive), can be added to any HTML element to render a variable value as the content of that element.

   Check out the uibuilder documentation for more details on using the `<uib-var>` component and `uib-var`/`uib-topic` attributes, as well as the available formatting options and filter functions that can be applied to variable values before rendering.

   These capabilities are provided by the uibuilder client library and are loaded automatically when using Markweb or uibuilder nodes.

Use option 2 or 3 if you want to be able to modify the rendered variable values with client-side JavaScript after the markdown content has been rendered. Or want to update something direct from Node-RED.

## Examples

```markdown
{{title}}
```

{{title}}

```markdown
{{title [before="<b>Page Title</b>: " after=" <code>(with HTML)</code>"]}}
```

{{title [before="<b>Page Title</b>: " after=" <code>(with HTML)</code>"]}}

```markdown
{{title [after="<span class='warning'> - End of Title </span>"]}}
```

{{title [after="<span class='warning'> - End of Title </span>"]}}

```markdown
{{title [prefix="Title: "]}}
```

{{title [prefix="Title: "]}}

```markdown
{{tags [output="list" before="This page has a list of 'tags' in the frontmatter:"]}}
```

{{tags [output="list" before="This page has a list of 'tags' in the frontmatter:"]}}

```markdown
{{missing1 [default="Missing variable fallback"]}}
```

{{missing1 [default="Missing variable fallback"]}}

```markdown
{{missing2 [default="<i>Default Title</i>", before=">> ", after=" <<"]}}
```

{{missing2 [default="<i>Default Title</i>", before=">> ", after=" <<"]}}
