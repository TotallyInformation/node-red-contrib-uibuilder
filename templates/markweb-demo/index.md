---
author: Julian Knight (Totally Information)
title: 🌐🕸️ Markweb Demo Site
sortPriority: high
description: A demonstration of Markweb features. Demonstrates the features of Markweb in a variety of markdown files.
tags: 
  - uibuilder
  - Node-RED
  - demo
  - testing
status: Published
created: 2026-03-23 17:04:49
updated: 2026-04-07 16:03:34
---

The main purpose of this demo site is to demonstrate the features of UIBUILDER for Node-RED's _MarkWeb_ features in a variety of markdown files. It serves as a testbed for features and as a reference.

> [!NOTE]
> The word "Markweb" is effectively the "brand" for this UIBUILDER feature. It is the name of the Node-RED node and is used throughout the documentation.
>
> You may also see a pair of Emoji's used, especially in logs and debugging. 🌐🕸️ - These are used to help highlight outputs specific to Markweb. (🌐 on its own in logs indicates a uibuilder related output).

## What is Markweb?
Markweb is a single-node, easy-to-configure website solution for Node-RED.

It allows you to create a website using simple markdown files as the source content.

Markweb takes care of rendering the markdown into HTML and serving it as a website. It also provides features like search, navigation, and dynamic content through variables and directives.

## Page structure
The site uses Markweb's default HTML template. It has search, navigation and page table of contents in the left sidebar. The sidebar can be hidden and resized as desired. The main content area automatically shows the page title as a heading, the page description as the first paragraph, the Markdown content of the source file and finally a footer paragraph with the last updated date.

You can override the default template for your own sites by specifying a _Configuration folder_ in the Markweb node configuration and placing your own `page-template.html` file in that folder. This allows you to create your own custom page layouts and designs while still using Markweb's markdown rendering capabilities.

## Page structure details

### Sidebar (Left column)

* _Search box_ - allows you to search for content across all pages in the site. The search is performed on the markdown source files and the results are displayed in a list with links to the relevant pages.

* _Navigation_ - shows a tree list of all pages in the site. The navigation is generated on the server from the markdown source files and their frontmatter metadata. It can be configured to show a hierarchical structure based on the URL paths of the pages. The list is limited to no more than 5 sub-levels for performance and ease of use. Avoid having too many sub-folders in your source content.

  The navigation list is interactive and allows you to expand and collapse sections of the navigation tree. It also highlights the current page you are viewing in the main content area.

  The list is automatically updated when changes happen on the server.

* _Table of contents_ - shows a list of the headings in the current page. This allows you to quickly navigate to different sections of the page. The table of contents is generated from the headings in the markdown source file. It highlights the current section you are viewing in the main content area.

  The list is automatically updated when the page content is changed on the server.

### Centre margin

Between the 2 columns is a margin area that lets you resize the columns. There is also a "hamburger" button that toggles the visibility of the left-hand sidebar.

### Main content (Right column)

* _Header_ - Displays the page title and description.

  The header gets smaller as you scroll down the page to give more space for the main content. The heading text can be clicked to scroll back to the top of the page. The heading text comes from the "title" field in the frontmatter or the file name if the title field is not specified. The description comes from the "description" field in the frontmatter or is left blank if not specified.

* _Centre section_ - Contains the main content of the page, rendered from the markdown file.

  Shows the main markdown content of the page converted to HTML.

  Headings are sized and underlined according to the heading level. They are automatically made collapsible to allow you to hide and show sections of content.

  The content is automatically updated when the page content is changed on the server.

* _Footer_ - Displays the last updated date and other optional information.

  It gets slightly smaller as you scroll down the page to give more space for the main content. The last updated date is taken from page frontmatter (updated field) or the file system's last modified date for the markdown source file.

## Markdown "frontmatter"
The markdown source files support a "frontmatter" section at the top of the file which uses YAML syntax to specify metadata about the page. This is used to set the page title, description and other attributes. The content of the markdown file is then rendered as HTML and displayed in the main content area. See the page on [Variables](markdown-tests/variables.md) for more details on how to use frontmatter and the variables it provides.

## Variables & directives
Markweb also has its own dynamic features in the form of "variables" and "directives" that can be used in markdown files to create dynamic content. See the [Variables](markdown-tests/variables.md) and [Directives](markdown-tests/directives.md) pages for more details on how to use these features. Each markdown file allows "frontmatter" data to be specified, this translates into variables that can be used in the markdown content. For example, the `title` and `description` fields in the frontmatter of a markdown file become available as variables that can be used in the content of that file.

## UIBUILDER features in Markweb
Markweb makes use of UIBUILDER's client library and many of its server features as well. This allows you to use UIBUILDER's data-driven, dynamic, reactive features in your markdown content should you wish to. You can use variables, directives and other features to create dynamic content that responds to user interactions or data changes.


## Collapsible headings

> [!TIP]
> If you click outside the wording on a section header it will toggle the visibility of the content.
>
> If you click on the wording of the section header, it will change the browser URL hash to the ID of that section, allowing you to link directly to that section from elsewhere. You can also use the "Copy link" option in the section header menu to copy a link to that section to your clipboard.
>
> Hovering over the section header will show what level of heading it is.
>
> _Try this out below_.

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
