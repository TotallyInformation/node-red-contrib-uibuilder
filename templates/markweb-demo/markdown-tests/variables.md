---
author: Julian Knight (Totally Information)
created: 2026-03-20 11:41:53
updated: 2026-04-09 14:05:23
status: Complete
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

> [!NOTE]
> When using the `{{variable}}` syntax, you cannot use local JavaScript processing to modify the visible values.
>
> This is because the `{{variable}}` syntax is processed by a markdown-it plugin on the server side before the content is sent to the client. The rendered output is static HTML with the variable values already inserted, so there is no opportunity for client-side JavaScript to modify those values after rendering.
>
> This may be changed in the future. The workaround is to use the `<uib-var>` component or `uib-var` attribute in your markdown as [detailed below](#technical-details) for any variables that you want to be able to modify with client-side JavaScript.

## Common variables
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
* `title` - Used as the display title for the page in listings.
* `shortTitle` - If provided, used instead of the title, useful if you like long page titles.
* `file` - Used for the entry name if neither `title` nor `shortTitle` are provided.
* `description` - Added as an entry tooltip (via the HTML `title` attribute).
* `sortPriority` - Overrides the sorting order of entries, (`high`, `medium`, or `low`). If absent, priority is `medium`.
* `updated`/`created` - Used to sort entries by date when filtered by "latest".

### Used in the default page template
* `title` - Used as the page title in the HTML `<title>` tag and as the default heading on the page.
* `description` - Used as the content of the HTML `<meta name="description">` tag for SEO purposes.

### Used in the default footer template

* `author` - Can be used to indicate the author of the page and can be rendered in the content to give credit to the author.
* `updated`/`created` - Year is used in the (c) statement. Date is used in the "Updated" statement.

### Future use

* `status` - Perhaps in a `%%status%%` directive to show the current status of the page. Or possible in a sub-heading on the page.
* `category` - Perhaps shown in a page sub-heading. Will be used for additional sorting of index listings.
* `tags` - Perhaps shown in a page sub-heading. Will be used for additional sorting of index listings.

## Custom variable rendering with arguments

The `{{variable}}` syntax can also include optional arguments in square brackets `[...]` as comma-separated `attribute=value` pairs. These arguments are passed to the variable handler function and can be used to modify the rendered output of the variable value.

### Arguments

* `before` (AKA `prefix`) - (Text or HTML) prepended to the value.
* `after` - (Text or HTML) appended to the value. Only rendered when a value is present.
* `default` - (Text or HTML) fallback value used when the front-matter variable is absent.

> [!NOTE]
> Text/HTML values are just that and cannot contain Markdown.

## Technical details
When `markweb` renders a markdown file, it processes the content and replaces any `{{variable}}` placeholders with a _dummy_ web component `<fm-var></fm-var>`.

There are however, actually 3 technical methods for rendering variables in markdown content. Each of these methods has its own use cases and advantages, and you can choose the one that best fits your needs for rendering variable values.

1. The default `{{variable}}` syntax which is processed by Markweb. This is the simplest and most straightforward way to render variables and is generally the most useful in Markdown content.

   CSS Classes are added to the rendered variable content which allows you to style them using CSS. The appropriate `fm-varname` classes are added regardless. The `fm-error` class is added if there is an error rendering the variable. The `fm-unknown` class is added if the variable name is not recognized. You can use these classes in your CSS to style the rendered variables as desired. Default classes are provided.

   These capabilities are provided by a custom Markdown-IT plugin and loaded automatically by the markweb client library.


2. The `<uib-var>` custom web component from uibuilder can be used directly in markdown content for more flexible variable rendering. This allows different output formats and filter functions to be applied before rendering. Variable names have to be prefixed with `pageData.` to access page variables, e.g., `<uib-var name="pageData.title"></uib-var>`. Great for rendering variables in more complex ways, e.g. as tables, lists, or with custom formatting.

3. The `uib-var` custom HTML attribute, also from uibuilder, can be added to any HTML element to render a variable value as the content of that element.

   Check out the uibuilder documentation for more details on using the `<uib-var>` component and `uib-var` attribute, as well as the available formatting options and filter functions that can be applied to variable values before rendering.

   These capabilities are provided by the uibuilder client library and are loaded automatically when using Markweb or uibuilder nodes.

Use option 2 or 3 if you want to be able to modify the rendered variable values with client-side JavaScript after the markdown content has been rendered.

### Variable access

Available variables are stored in the uibuilder managed `pageData` object, which is accessible in client-side JavaScript code. This allows you to set and update variable values dynamically using `uibuilder.set('pageData.someVar', ...)`.

## Examples

```markdown
{{title}}
{{title [before="<b>Page Title</b>: " after=" <code>(with HTML)</code>"]}}
{{title [after="<span class='warning'> - End of Title </span>"]}}
{{title [prefix="Title: "]}}
{{missing1 [default="Missing variable fallback"]}}
{{missing2 [default="<i>Default Title</i>", before=">> ", after=" <<"]}}
```

{{title}}

{{title [before="<b>Page Title</b>: " after=" <code>(with HTML)</code>"]}}

{{title [after="<span class='warning'> - End of Title </span>"]}}

{{title [prefix="Title: "]}}

{{missing1 [default="Missing variable fallback"]}}

{{missing2 [default="<i>Missing variable fallback</i>", before=">> ", after=" <<"]}}
