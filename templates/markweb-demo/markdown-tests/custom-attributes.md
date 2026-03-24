---
author: Julian Knight (Totally Information)
created: 2026-03-22 14:10:53
updated: 2026-03-22 14:15:40
status: In Progress
title: Custom HTML Attributes
description: >
    Markweb supports custom attributes on markdown elements. This allows you to add any valid HTML attribute to the rendered HTML elements generated from your markdown content. This can be used to add classes, styles, data attributes, or any other attributes that are supported by HTML.
tags:
  - markdown
  - HTML
  - attributes
---

## Custom attributes syntax
You can add custom attributes to markdown elements using one of these syntaxes:
* `{attrname="value"}` - value with quotes.
* `{attrname=value}` - value without quotes, only if it does not contain spaces or special characters.
* `{#html-id}` - to apply a custom HTML ID to the element.
* `{.class-name}` - to apply a custom CSS class to the element.

Multiple attributes can be added by separating them with spaces. As in the first example below.

This can be used on any markdown element, such as headings, paragraphs, lists, etc. For example:

```markdown
## Heading with custom ID and class {#custom-id .custom-class}

A paragraph with a custom style {style="color: red;"}

- List item with a custom data attribute {data-info="some info"}
```
