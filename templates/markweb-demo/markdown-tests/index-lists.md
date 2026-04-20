---
author: Julian Knight (Totally Information)
created: 2026-03-22 15:38:21
updated: 2026-03-22 16:38:21
status: Draft
tags: 
  - markdown
  - features
  - directives
  - index
  - arguments
title: Index lists
description: >
  The index directive allows you to create lists of files and folders from the current website content.
  It supports various parameters to control the output, such as depth, type (files/folders), and more.
---

If an index link includes the currently shown page, it will be highlighted in the list. This is useful for navigation and showing the current location within the content structure.

See the [directives page](markdown-tests/directives.md) for details on how to use the index directive and its parameters.

When specifying the `start` and `end` parameters, note that numbering starts at 0 for the root level. So `start=0` means to start from the root, and `end=1` means to include up to and including level 1.

## Current level files & folders
`%%index [title="Current level files & folders", id=md-tests-current]%%` or just `%%index%%` to list files and folders in the current folder:

%%index [title="Current level files & folders", id=md-tests-current]%%

## Files & folders from level 0 to 1
```markdown
<!-- Start/end can be numbers or text. 0=root -->
%%index [start=0,end="1"]%%
```

%%index [start=0,end="1"]%%

## Folders only from level 0 to 3
`%%index [start=0,end="3",type=folders]%%`

%%index [start=0,end="3",type=folders]%%

## Depth parameter
We can also use the `depth` parameter instead of `end` to specify how many levels deep to go. For example, `depth=2` means to include the current level and 2 levels below it.

```markdown
%%index [start=0,depth=2,type=folders]%%
```

%%index [start=0,depth=2,type=folders]%%

## Date filtering
We can use the `from` and `to` parameters to filter files/folders based on their creation or update dates. For example, `from=2026-01-01` means to include only items created/updated after January 1, 2026. `to=now` means to include only items created/updated before the current date/time.

`%%index[from=2026-03-01, to=now]%%`

%%index[from=2026-03-01, to=now]%%

We can also use `duration` to specify a relative time range. For example, `duration=1w` means the last week from now.

`%%index[duration=1w]%%`:
%%index[duration=1w]%%

---

`%%index[from=2025-12-21, duration=1m]%%`:
%%index[from=2025-12-21, duration=1m]%%

---

`%%index[to=now, duration=1d]%%`:
%%index[to=now, duration=1d]%%

---

### Latest items
The `latest` parameter allows you to list the most recently created/updated items. For example, `latest=5` means to list the 5 most recent items.

`%%index[latest=3]%%`- The 3 most recently created/updated pages from this level down:
%%index[latest=3]%%
  
`%%index[latest=3, start=0]%%` - The 3 most recent pages from the whole site:
%%index[latest=3, start=0]%%
