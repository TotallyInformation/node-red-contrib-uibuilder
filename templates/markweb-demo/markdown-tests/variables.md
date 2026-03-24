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

- `{{variable}}` syntax for variable substitution. Variables can come from page metadata (including front-matter and filing system attributes), global attributes, or system-provided data.

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

<show-meta></show-meta>

## Technical details
When `markweb` renders a markdown file, it processes the content and replaces any `{{variable}}` placeholders with a custom web component `<fm-var></fm-var>`. This component is responsible for looking up the variable name and rendering its value. It also listens for changes to the variable value and updates the rendered content automatically when the variable changes. This allows for dynamic content in markdown files that can react to changes in variables, whether they come from page metadata, global attributes, or system-provided data.

Available variables are stored in the uibuilder managed `pageData` object, which is accessible in client-side JavaScript code. This allows you to set and update variable values dynamically using `uibuilder.set('pageData.someVar', ...)`.

> [!TIP]
> You can also use UIBUILDER's `<uib-var>` custom web component and the `uib-var` custom HTML attribute to render variable values in your markdown content. The `<uib-var>` component is a more flexible way to render variables, as it allows you to specify formatting and other options directly in the HTML. The `uib-var` attribute can be used on any HTML element to render a variable value as the content of that element. Both of these options provide additional ways to work with variables in your markdown files, giving you more control over how dynamic content is rendered.
>
> To access a page variable this way, use `pageData.someVar` as the variable name. For example, `<uib-var name="pageData.title"></uib-var>` would render the page title.
>
> These features may be useful for rendering your own custom variables.
