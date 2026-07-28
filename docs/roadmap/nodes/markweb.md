---
title: Road map for the markweb node
description: |
  This page is a working document to track the development of the markweb node. It is not intended to be a comprehensive list of all features or changes, but rather a high-level overview of the main areas of development. It is expected that this page will be updated frequently as development progresses and new features are added or changed.
created: 2026-07-26 15:34:19
updated: 2026-07-28 19:49:32
author: Julian Knight (Totally Information)
---

* `%%index%%`
  * Rendered lists have too much vertical whitespace.
  * Rendered lists need better link colours
  * Need extra arg to allow a flat instead of tree list. Probably needs a completely new runtime fn

## Index listing process flow

* `indexListing`
  * `createTree`
    * `filteredIndex`
  * `renderTree`

## What calls `indexListing`?

* `createNav` - creates the navigation menu for the site
* `mdExtension` - handles the directives and variables in markdown via defined markdown-it extensions
  * `directiveHandlers`
    * `index`:
      * `indexListing`

## Index creaation process


## Index

```js
/** @type {MarkwebIndex}
{
  '/markdown-tests/' => {
    // REQUIRED, even for just errors:
    content: "....\n',
    description: 'Markweb supports various Markdown features and formatting options.',
    title: 'Markdown Formatting Supported by Markweb',

    author: 'Julian Knight (Totally Information)',
    category: '',
    created: 2026-01-01T21:35:51.000Z,
    depth: 1,
    file: 'index.md',
    from: undefined
    fsMtimeMs: 1780688813476.163,
    path: '/markdown-tests/',
    shortTitle: 'Formatting Checks',
    sortPriority: '',
    status: 'complete',
    tags: [ 'markdown', 'tests', 'formatting' ],
    toUrl: '/markdown-tests/index.md',
    type: 'folder',
    updated: 2026-06-02T13:52:43.000Z,

    // For errors only - true if an error output:
    // error: true,
  },
  '/exclusion-tests/no-index/no-index-file': {
    author: '',
    category: '',
    content: '....\n',
    created: '2026-06-05T19:46:53.463Z',
    depth: 2,
    description: '',
    file: 'no-index-file.md',
    from: undefined
    fsMtimeMs: 1780688813463.647,
    path: '/exclusion-tests/no-index/no-index-file',
    shortTitle: '',
    sortPriority: '',
    tags: [],
    title: 'No-index-file',
    toUrl: '/exclusion-tests/no-index/no-index-file.md',
    type: 'file',
    updated: '2026-06-05T19:46:53.463Z',
  }
}
```
