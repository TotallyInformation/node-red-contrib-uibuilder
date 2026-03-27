---
author: Julian Knight (Totally Information)
created: 2026-03-20 11:41:53
updated: 2026-03-22 13:53:41
status: Complete
title: Variables
description: >
    Rendered variable values in markdown files.
    Variables come from page front-matter, global attributes, or system-provided data.
tags:
  - markdown
  - variables
---

A variable is a placeholder that can be used in markdown files to insert dynamic content. Variables are defined in the page _front-matter_, _global attributes_, or provided by _the system_. They can be rendered in the markdown content using the `{{variable}}` syntax.

> [!TIP]
> If you edit the markdown file for a currently shown page, the changes will be reflected immediately (after a short delay to allow the server filing system to update), this includes updating the variables.
>
> You can also dynamically set variables using UIBUILDER's `uibuilder.set('pageData.someVar', ...)`{class="language-javascript"} function in your client-side JavaScript code. This allows you to update variable values in response to user interactions or other events, and have those changes reflected in the rendered markdown content. You can also set variables from Node-RED server-side code using the appropriate uibuilder remote command message.

## Common variables
- `{{title}}` - The page title {plain text}.
- `{{description}}` - The page description {plain text}.
- `{{status}}` - The current status of the page, e.g., `Draft` or `Published` {plain text}.
- `{{author}}` - The page author {plain text}.
- `{{created}}` - The page creation date/time {ISO 8601 text}.
- `{{updated}}` - The page last updated date/time {ISO 8601 text}.
- `{{category}}` - The page category {plain text}.
- `{{tags}}` - The page tags {a list}.

Variables provided by the system, do not use these in your markdown front-matter as they will be overwritten:
- `{{path}}` - The current page path.
- `{{url}}` - The full URL of the current page.

Globals (some of these are added automatically, others can be set in the global attributes JSON file):
- No defaults currently defined.

## Available variables for a page
You can show the current available page variables by using the `<show-meta></show-meta>` custom web component in your markdown file. This will render a table of all available variables and their current values for that page. This is useful for debugging and understanding what data you have available to work with in your markdown content.

<show-meta closed></show-meta>

## Technical details
When `markweb` renders a markdown file, it processes the content and replaces any `{{variable}}` placeholders with a custom web component `<fm-var></fm-var>`.

There are however, actually 4 technical methods for rendering variables in markdown content. Each of these methods has its own use cases and advantages, and you can choose the one that best fits your needs for rendering variable values.

1. The default `{{variable}}` syntax which is processed by Markweb and replaced with the `<fm-var>` component. This is the simplest and most straightforward way to render variables and is generally the most useful in Markdown content.

2. The `<fm-var>` component which is used internally by Markweb to render variables when using the `{{variable}}` syntax, but can also be used directly in markdown content if desired but there is no real advantage.

   Both the `{{variable}}` syntax and the `<fm-var>` component apply CSS Classes to the rendered variable content which allows you to style them using CSS. The appropriate `fm-varname` classes are added regardless. The `fm-error` class is added if there is an error rendering the variable. The `fm-unknown` class is added if the variable name is not recognized. You can use these classes in your CSS to style the rendered variables as desired. Default classes are provided.

   These capabilities are provided by a custom Markdown-IT plugin and loaded automatically by the markweb client library.

3. The `<uib-var>` custom web component from uibuilder can be used directly in markdown content for more flexible variable rendering. This allows different output formats and filter functions to be applied before rendering. Variable names have to be prefixed with `pageData.` to access page variables, e.g., `<uib-var name="pageData.title"></uib-var>`. Great for rendering variables in more complex ways, e.g. as tables, lists, or with custom formatting.

4. The `uib-var` custom HTML attribute, also from uibuilder, can be added to any HTML element to render a variable value as the content of that element.

   Check out the uibuilder documentation for more details on using the `<uib-var>` component and `uib-var` attribute, as well as the available formatting options and filter functions that can be applied to variable values before rendering.

   These capabilities are provided by the uibuilder client library and are loaded automatically when using Markweb.

### Variable access

Available variables are stored in the uibuilder managed `pageData` object, which is accessible in client-side JavaScript code. This allows you to set and update variable values dynamically using `uibuilder.set('pageData.someVar', ...)`.

