---
author: Julian Knight (Totally Information)
created: 2026-01-07 15:41:19
updated: 2026-02-12 15:39:28
status: In Progress
title: General Markdown Tests
subtitle: Testing various Commonmark and other Markdown features in markdown files
description: Testing various Commonmark and other Markdown features in markdown files.
---

## Detailed Markdown Features

<!-- This produces an index listing of all files and folders in the current folder and subfolders, up to 5 levels deep.
     Parameters are available, check the docs for details.
 -->
%%index%%

## Supported Markdown Features

Rendering uses the MarkdownIT library, which supports Commonmark and some GitHub Flavored Markdown (GFM) extensions.

This supports embedded HTML. Note that no sanitization is currently performed, so be cautious when using untrusted content. This is likely to be improved in the future.

### HTML Template and Markdown Variables supported

The system supports substituting variables and special processing directives in both the HTML template and in markdown files.

#### Variables

See [Variables](markdown-tests/variables.md) for details on how to use variables in markdown files.

#### Special processing directives

See [Directives](markdown-tests/directives.md) for details on how to use special processing directives in markdown files.

### Markdown extensions supported

- Full [Commonmark](https://commonmark.org) support.
- Standard heading ID's using the heading text.
- Headings have auto-generated anchor links for easy linking.
- Custom element ID's using `{#custom-id}` or `{id="custom-id"}` syntax.
- Custom element classes using `{.class-name}` or `{class="class-name"}` syntax. e.g. `* blah {.success}`. {.success}
- Custom element attributes using `{attrname="value"}` syntax. e.g. `* blah {style="list-style-type:decimal;"}`. {style="list-style-type:decimal;"}
- Task lists (checklists) using `- [ ]` and `- [x]` syntax.
- Autolinks for URLs and email addresses. e.g. https://example.com
- GFM-style tables.
- GFM-style alert boxes (AKA callouts).
- Crossed-out text using `~~strikethrough~~` syntax.
- Syntax highlighting in code blocks using triple backticks and language specifier via highlight.js.

### Markdown extensions to be added in future

- [Footnotes](https://www.npmjs.com/package/marked-footnote).
- DL's (Definition Lists).
- Mermaid diagrams.

## Markdown syntax examples

### Headings

Headings automatically get ID's based on their text for linking.

You can also set custom ID's using `{#custom-id}` or `{id="custom-id"}` syntax:

```markdown
### Heading 4 {#custom-id}
```

#### Heading 4 with custom id {id="custom-id"}

##### Heading 5

###### Heading 6

Text under heading 6.

### Emphasis {#emph}

*Italic text* or _italic text_

**Bold text** or __bold text__

***Bold and italic*** or ___bold and italic___

~~Strikethrough~~ (GFM Extension)

```markdown
*Italic text* or _italic text_
**Bold text** or __bold text__
***Bold and italic*** or ___bold and italic___
~~strikethrough~~
```

### Lists

#### Unordered Lists

* Item 1
* Item 2
    * Nested item 2.1
    * Nested item 2.2
* Item 3

- Alternative syntax
- Using dashes
- Works the same

#### Ordered Lists

1. First item
2. Second item
    1. Nested item 2.1
    2. Nested item 2.2
3. Third item

#### Task Lists (GFM Extension)

> [!NOTE]
> Tasks lists are _not_ interactive checkboxes. They are rendered as static lists with checkboxes that are either checked or unchecked based on the markdown syntax.
>
> To create an interactive checklist, use a dynamic list from Node-RED using UIBUILDER features.

- [x] Completed task
- [ ] Incomplete task
  - [ ] Subtask 1
- [ ] Another incomplete task

### Links

> [!NOTE]
> When using links to other content within the Markweb system, use relative links to the markdown file, without the .md extension. e.g. `[Footnotes Test Page](./markdown-tests/footnotes)`
>
> Internal links are always relative to the markweb root folder.
> They start with a `./` prefix or _without any_ `/` prefix.

[Footnotes Test Page](./markdown-tests/footnotes) `[Footnotes Test Page](./markdown-tests/footnotes)`

[Link text](https://example.com) `[Link text](https://example.com)`

[Link with title](https://example.com "Link Title") `[Link with title](https://example.com "Link Title")`

<https://example.com> `<https://example.com>`

[Reference link][ref] `[Reference link][ref]`

[ref]: https://example.com "Reference Link" `[ref]: https://example.com "Reference Link"`


#### Autolinks (GFM Extension)

www.example.com

user@example.com


### Images

![Alt text](../uibuilder/images/maskable_icon_x48.png) some text after.

![Alt text with title](../uibuilder/images/maskable_icon_x48.png "maskable_icon_x48")
 some text after.

```markdown
![Alt text](blah.png) some text after.
![Alt text with title](blah.png "maskable_icon_x48")
 some text after.
```

To set images sizing, wrap, etc.

* Use custom attributes with the `{attrname="value"}` syntax:

  ![Alt text](../uibuilder/images/uib-world.svg){style="width:25px;"} `![Alt text](blah.png){style="width:25px;"}`

* Or use HTML:

  <img src="../uibuilder/images/uib-world.svg" alt="Alt text" title="uib-world" style="width:25px;" />

  ```html
  <img src="blah.svg" alt="Alt text"
      title="uib-world" style="width:25px;" />
  ```


### Code

See [Code blocks](markdown-tests/code-blocks.md) for details on supported code block features.

### Blockquotes and GFM Alert Boxes (Callouts)

See [GFM Alerts](markdown-tests/gfm-alerts.md) for details on supported blockquote and alert box features. GFM Alerts are part of the GitHub Flavored Markdown extensions.

### Horizontal Rules

---

***

___

```
---
***
___
```

### Line Breaks

This is a line with two spaces at the end.  
This creates a line break.

Alternatively, use a backslash `\` at the end.\
This also creates a line break.

Or use the HTML `<br>` tag for a line break.

### Tables (GFM Extension)

See [Tables](markdown-tests/tables.md) for details on supported table features.

### Escaping Characters

\* Not italic \*

\# Not a heading

\[Not a link\](url)

```
\* Not italic \*
\# Not a heading
\[Not a link\](url)
```

### HTML in Markdown

Embedded HTML can be dangerous if the content is not trusted, as no sanitization is currently performed. This may change in the future.

<strong>HTML bold text using `<strong></strong>` tags.</strong>

This is <span style="color: red;">red text</span> using HTML.

Source:
```html
<strong>HTML bold text</strong>

This is
 <span style="color: red;">red text</span>
 using HTML.
```

### Definition Lists (not currently implemented)

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
```

### Hard Line Breaks

First line\
Second line

### Paragraph

This is a paragraph with some text.
It continues on the next line but is part of the same paragraph.

This is a new paragraph separated by a blank line.

