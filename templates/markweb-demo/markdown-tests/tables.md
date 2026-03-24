---
author: Julian Knight (Totally Information)
created: 2026-03-18 16:01:31
updated: 2026-03-22 15:31:08
status: Draft
title: Tables
description: Different table layouts in markdown.
---

Note that HTML tables in Markdown can be difficult to read and write. You may wish to use a WYSIWYG editor (e.g. Typora) to edit them.

## Basic

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## With alignment

Note that only full column alignment is supported, not per-cell alignment.

| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Data         | Data           | Data          |

```markdown
| Left aligned | Center aligned | Right aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Data         | Data           | Data          |
```

## With embedded markup

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| **Bold**  | *Italic*  | `Code`    |
| ~~Strikethrough~~ | [Link](https://example.com) | ![Image](https://via.placeholder.com/20) |
|With a <br>line break|Another cell|And another|
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| **Bold**  | *Italic*  | `Code`    |
| ~~Strikethrough~~ | [Link](https://example.com) | ![Image](https://via.placeholder.com/20) |
|With a <br>line break|Another cell|And another|
```
