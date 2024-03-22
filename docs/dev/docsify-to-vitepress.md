---
title: Migrating from Docsify to VitePress
description: ""
created: 2024-03-19 18:10:11
updated: 2024-03-22 17:56:01
---

> [!NOTE]
> This is a speculative document comparing the two documentation tools. Thought at one point I might migrate but this seems unlikely at this point.

## Questions to answer

* [ ] Hero image/page?
* [x] GitHub style callouts?
* [ ] MD->HTML file conversion - where are the live files kept? Should the MD files even be in the repo?
* [ ] Will the default url's work with Node-RED's dynamic base url?

## Callouts

Both support GitHub style callouts.

Docsify: Requires an extension.

VitePress: Native.

## Embedding (transpiling) content

Docsify: `[filename](_media/example.md ':include :type=atype')` (Types: iframe, markdown, audio, video, code)

VitePress: `<!--@include: ./parts/basics.md-->` - also supports line limits with `{4,}` etc on end of file name

## Custom heading links

Docsify: `## Using custom anchors :id=my-anchor`

VitePress: `## Using custom anchors {#my-anchor}`

## What can VitePress do that Docsify cannot

* Uses Markdown-IT and [supports Markdown-IT plugins](https://vitepress.dev/guide/markdown#advanced-configuration).
* [Image lazy loading](https://vitepress.dev/guide/markdown#image-lazy-loading).
* [TOC](https://vitepress.dev/guide/markdown#table-of-contents)'s - don't require doing with VScode
* [Details block using custom containers](https://vitepress.dev/guide/markdown#custom-containers) - no HTML needed
* [Extended code block formatting](https://vitepress.dev/guide/markdown#syntax-highlighting-in-code-blocks) - including line numbers, line highlights, code groups, ....
* Build-time data loading - can be used to create indexes, etc. MD files with frontmatter (and optionally src/html/excerpt) supported via the `createContentLoader` fn.

## Downsites of VitePress over Docsify

* Have to re-build on change whereas, for Docsify, you only need to reload the page
