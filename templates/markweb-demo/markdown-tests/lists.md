---
author: Julian Knight (Totally Information)
created: 2026-03-26 17:08:46
updated: 2026-03-26 18:08:51
status: In Progress
title: Lists
description: Markweb list features.
---

### Unordered Lists

* Item 1
* Item 2
    * Nested item 2.1
    * Nested item 2.2
* Item 3

- Alternative syntax
- Using dashes
- Works the same

### Ordered Lists

1. First item
2. Second item
    1. Nested item 2.1
    2. Nested item 2.2
3. Third item

### Task Lists (GFM Extension)

- [x] Completed task
- [ ] Incomplete task
  - [ ] Subtask 1
- [ ] Another incomplete task

> [!NOTE]
> Task lists are _not_ interactive checkboxes. They are rendered as static lists with checkboxes that are either checked or unchecked based on the markdown syntax.
>
> To create an interactive checklist, use a dynamic list from Node-RED using UIBUILDER features.

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
