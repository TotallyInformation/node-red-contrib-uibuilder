---
author: Julian Knight (Totally Information)
created: 2026-01-07 15:41:19
updated: 2026-03-26 18:08:33
status: In Progress
title: General Markdown Tests
shortTitle: General Tests
sortPriority: high
subtitle: Testing various Commonmark and other Markdown features in markdown files
description: Testing various Commonmark and other Markdown features in markdown files.
---

## Detailed Markdown Features

<!-- This produces an index listing of all files and folders in the current folder and subfolders, up to 5 levels deep.
     Parameters are available, check the docs for details.
 -->
%%index%%

## Supported Markdown Features

Rendering uses the Markdown-IT library, which supports Commonmark and some GitHub Flavored Markdown (GFM) extensions.

Embedded HTML is also supported. Note that no sanitization is currently performed, so be cautious when using untrusted content. This is likely to be improved in the future.

### HTML Template and Markdown Variables supported

The system supports substituting variables and special processing directives in both the HTML template and in markdown files.

#### Variables

See [Variables](markdown-tests/variables.md) for details on how to use variables in markdown files.

#### Special processing directives

See [Directives](markdown-tests/directives.md) for details on how to use special processing directives in markdown files.

### Markdown extensions supported

- Full [Commonmark](https://commonmark.org) support.
- [GitHub Flavored Markdown (GFM) extensions](https://github.github.com/gfm/).

- Automatic heading ID's using the heading text.
- Auto-generated heading anchor links for easy linking.
- [Custom element attributes](markdown-tests/attributes.md) using `{attrname="value"}` syntax. e.g. `* blah {style="list-style-type:decimal;"}`. {style="list-style-type:decimal;"}
  - Custom element ID's using `{#custom-id}` or `{id="custom-id"}` syntax.
  - Custom element classes using `{.class-name}` or `{class="class-name"}` syntax. e.g. `* blah {.success}`. {.success}
- [Task lists (checklists)](markdown-tests/lists.md) using `- [ ]` and `- [x]` syntax.
- Autolinks for URLs and email addresses. e.g. https://example.com
- [GFM-style tables](markdown-tests/tables.md).
- [GFM-style alert boxes (AKA callouts)](markdown-tests/gfm-alerts.md).
- Crossed-out text using `~~strikethrough~~` syntax.
- [Syntax highlighting in code blocks](markdown-tests/code-blocks.md) using triple backticks and language specifier via highlight.js.
- [Frontmatter values](markdown-tests/variables.md) via the `{{variable}}` syntax.
- Embedded HTML tags, including UIBUILDER's custom web components.

### Markdown extensions to be added in future

- [Footnotes](https://www.npmjs.com/package/marked-footnote).
- DL's (Definition Lists).
- Mermaid diagrams.

## Headings

Headings have:
* Automatically generated ID's based on their text for linking.
* Auto-generated anchor links for easy linking to that section.
* Auto-folding of the content under the heading. Toggled by clicking on the section header.

You can also set custom ID's using `## Heading {#custom-id}` or `## Heading {id="custom-id"}` syntax. This updates the anchor links as well.

> [!TIP]
> Do not use a level 1 heading in your markdown files as this is reserved for the page title which is automatically rendered by Markweb.

### Heading 3

#### Heading 4 with custom id {#custom-h4}

Try to avoid going beyond heading level 4 in your markdown files as this can become confusing for readers. However, Markweb supports up to level 6 headings, but it is recommended to use them judiciously and maintain a clear structure in your content.

##### Heading 5

###### Heading 6

Text under heading 6.

## Emphasis
```markdown
*Italic text* or _italic text_
**Bold text** or __bold text__
***Bold and italic*** or ___bold and italic___
~~strikethrough~~
```

*Italic text* or _italic text_

**Bold text** or __bold text__

***Bold and italic*** or ___bold and italic___

~~Strikethrough~~ (GFM Extension)

## Lists

See [Lists](markdown-tests/lists.md) for details on supported list features.
Unordered (bullet), ordered (numbered) and task lists (GFM extension) are supported. Nested lists are also supported.

Currently definition lists are not supported but should be added in the future.

## Links
See [Links](markdown-tests/links.md) for details on supported link features.

### Autolinks (GFM Extension)

www.example.com

user@example.com


## Images
See [Images](markdown-tests/images.md) for details on supported image features.

## Code

See [Code blocks](markdown-tests/code-blocks.md) for details on supported code block features.

## Blockquotes and GFM Alert Boxes (Callouts)

See [GFM Alerts](markdown-tests/gfm-alerts.md) for details on supported blockquote and alert box features. GFM Alerts are part of the GitHub Flavored Markdown extensions.

## Horizontal Rules
```markdown
---
***
___
```

---

***

___


## Line Breaks

This is a line with two spaces at the end.  
This creates a line break.

Alternatively, use a backslash `\` at the end.\
This also creates a line break.

Or use the HTML `<br>` tag for<br>a line break.

## Tables (GFM Extension)

See [Tables](markdown-tests/tables.md) for details on supported table features.

## Escaping Characters

\* Not italic \*

\# Not a heading

\[Not a link\](url)

```
\* Not italic \*
\# Not a heading
\[Not a link\](url)
```

## HTML in Markdown

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

> [!TIP]
> You also have access to UIBUILDER's custom web components as well.

## Paragraph

This is a paragraph with some text.
It continues on the next line but is part of the same paragraph.

This is a new paragraph separated by a blank line in the Markdown.

