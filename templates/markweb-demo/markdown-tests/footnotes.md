---
title: Footnotes
description: Different footnote scenarios in markdown.
author: Julian Knight (Totally Information)
created: 2026-01-01 21:35:51
updated: 2026-05-07 16:26:59
status: Complete
since: "v7.7.0, 2026-05-07"
---

## Normal footnote

Here is a footnote reference,[^1] and another.[^longnote]

[^1]: Here is the footnote.

[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented (4 spaces) to show that they
    belong to the previous footnote.

## Inline footnote

Here is an inline note.^[Inlines notes are easier to write, since
you don't have to pick an identifier and move down to type the
note.]

## More tests

[^1]: This is a footnote content.

Here is a simple footnote[^1]. With some additional text after it[^@#$%] and without disrupting the blocks[^bignote].

[^bignote]: The first paragraph of the definition.

    Paragraph two of the definition.

    > A blockquote with
    > multiple lines.

    ~~~
    a code block
    ~~~

    | Header 1 | Header 2 |
    | -------- | -------- |
    | Cell 1   | Cell 2   |

    A \`final\` paragraph before list.

    - Item 1
    - Item 2
      - Subitem 1
      - Subitem 2

[^@#$%]: A footnote on the label: "@#$%".
