---
author: Julian Knight (Totally Information)
title: 🌐🕸️ Markweb Demo Site
description: A demonstration of Markweb features. Demonstrates the features of Markweb in a variety of markdown files.
tags: 
  - uibuilder
  - Node-RED
  - demo
  - testing
status: Published
created: 2026-03-23 17:04:49
updated: 2026-03-25 11:54:57
---

The main purpose of this demo site is to demonstrate the features of UIBUILDER for Node-RED's _MarkWeb_ features in a variety of markdown files. It serves as a testbed for features and as a reference.

> [!NOTE]
> The word "Markweb" is effectively the "brand" for this UIBUILDER feature. It is the name of the Node-RED node and is used throughout the documentation.
>
> You may also see a pair of Emoji's used, especially in logs and debugging. 🌐🕸️ - These are used to help highlight outputs specific to Markweb. (🌐 on its own in logs indicates a uibuilder related output).

The site uses Markweb's default HTML template. It has search, navigation and page table of contents in the left sidebar. The sidebar can be hidden and resized as desired. The main content area automatically shows the page title as a heading, the page description as the first paragraph, the Markdown content of the source file and finally a footer paragraph with the last updated date.

The markdown source files support a "frontmatter" section at the top of the file which uses YAML syntax to specify metadata about the page. This is used to set the page title, description and other attributes. The content of the markdown file is then rendered as HTML and displayed in the main content area.

Markweb makes use of UIBUILDER's client library and many of its server features as well. This allows you to use UIBUILDER's data-driven, dynamic, reactive features in your markdown content should you wish to. You can use variables, directives and other features to create dynamic content that responds to user interactions or data changes.

Markweb also has its own dynamic features in the form of "variables" and "directives" that can be used in markdown files to create dynamic content. See the [Variables](markdown-tests/variables.md) and [Directives](markdown-tests/directives.md) pages for more details on how to use these features. Each markdown file allows "frontmatter" data to be specified, this translates into variables that can be used in the markdown content. For example, the `title` and `description` fields in the frontmatter of a markdown file become available as variables that can be used in the content of that file.

> [!TIP]
> If you click outside the wording on a section header it will toggle the visibility of the content.
>
> If you click on the wording of the section header, it will change the browser URL hash to the ID of that section, allowing you to link directly to that section from elsewhere. You can also use the "Copy link" option in the section header menu to copy a link to that section to your clipboard.
>
> Hovering over the section header will show what level of heading it is.
>
> _Try this out below_.

## A collapsible level 2 heading

Headings and the content they encapsulate are automatically made "foldable" by Markweb. This allows you to easily hide and show sections of content, which is especially useful for long pages. You can click on the section header to toggle the visibility of the content. This is a built-in feature of Markweb and does not require any special markup in your markdown files.

> [!TIP]
> Do not use a level 1 heading in your markdown files as this is reserved for the page title which is automatically rendered by Markweb. Instead, start with level 2 headings for the main sections of your content. For accessibility, only 1 heading level 1 should be used per page.
>
> In addition, you should try to maintain a logical hierarchy of headings. For example, if you have a level 2 heading for a section, any subsections within that section should use level 3 headings, and so on. This helps to create a clear structure for your content and makes it easier for readers to navigate and understand the information presented.

### A level 3 heading
This is a paragraph under a level 3 heading. 
#### A level 4 heading
This is a paragraph under a level 4 heading.

Generally, you should not go beyond level 4 headings in your markdown files as this can become confusing for readers. However, Markweb supports up to level 6 headings, but it is recommended to use them judiciously and maintain a clear structure in your content.

### Another level 3 heading
This is another paragraph under a different level 3 heading.
