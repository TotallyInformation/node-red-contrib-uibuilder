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
updated: 2026-03-24 17:53:31
---

The main purpose of this demo site is to demonstrate the features of UIBUILDER for Node-RED's _MarkWeb_ features in a variety of markdown files. It serves as a testbed for features and as a reference.

The site uses Markweb's default HTML template. It has search, navigation and page table of contents in the left sidebar. The sidebar can be hidden and resized as desired. The main content area automatically shows the page title as a heading, the page description as the first paragraph, the Markdown content of the source file and finally a footer paragraph with the last updated date.

The markdown source files support a "frontmatter" section at the top of the file which uses YAML syntax to specify metadata about the page. This is used to set the page title, description and other attributes. The content of the markdown file is then rendered as HTML and displayed in the main content area.

Markweb makes use of UIBUILDER's client library and many of its server features as well. This allows you to use UIBUILDER's data-driven, dynamic, reactive features in your markdown content should you wish to. You can use variables, directives and other features to create dynamic content that responds to user interactions or data changes.

Markweb also has its own dynamic features in the form of "variables" and "directives" that can be used in markdown files to create dynamic content. See the [Variables](markdown-tests/variables.md) and [Directives](markdown-tests/directives.md) pages for more details on how to use these features. Each markdown file allows "frontmatter" data to be specified, this translates into variables that can be used in the markdown content. For example, the `title` and `description` fields in the frontmatter of a markdown file become available as variables that can be used in the content of that file.
