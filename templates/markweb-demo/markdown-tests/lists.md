---
author: Julian Knight (Totally Information)
created: 2026-03-26 17:08:46
updated: 2026-03-26 18:08:51
status: In Progress
title: Lists
description: Markweb list features.
---

### Unordered Lists

This is a plain bulleted list using leading asterisks or dashes. Nested lists are supported.

* Item 1
* Item 2
    * Nested item 2.1
    * Nested item 2.2
* Item 3

- Alternative syntax
- Using dashes
- Works the same

### Ordered Lists

This is a numbered list using leading numbers followed by a period. Nested lists are supported and can use any numbering scheme.

1. First item
    * Nested item 1.1
    * Nested item 1.2
2. Second item
   
   100. Nested item 2.1
   101. Nested item 2.2
   102. Nested item 2.3
3. Third item
    1. Nested item 3.1
    2. Nested item 3.2

### Task Lists (GFM Extension)

- [x] Completed task
- [ ] Incomplete task
  - [ ] Subtask 1
- [ ] Another incomplete task

> [!NOTE]
> Task lists are _not_ interactive checkboxes. They are rendered as static lists with checkboxes that are either checked or unchecked based on the markdown syntax.
>
> To create an interactive checklist, use a dynamic list from Node-RED using UIBUILDER features.

### Custom list styles

You can create custom styled lists using standard HTML
```html
<ul style="list-style-type: '🤔';">
    <li>Emoji bullets</li>
    <li>Another item</li>
</ul>
<ol style="list-style-type: upper-roman;">
    <li>Upper Roman numerals</li>
    <li>Another item</li>
</ol>
```

<ul style="list-style-type: '🤔';">
    <li>Emoji bullets</li>
    <li>Another item</li>
</ul>
<ol style="list-style-type: upper-roman;">
    <li>Upper Roman numerals</li>
    <li>Another item</li>
</ol>

### Definition Lists (not currently implemented)
```
Term 1
:   Definition 1

Term 2
:   Definition 2a
:   Definition 2b
```

Term 1
:   Definition 1

Term 2
:   Definition 2a
:   Definition 2b
