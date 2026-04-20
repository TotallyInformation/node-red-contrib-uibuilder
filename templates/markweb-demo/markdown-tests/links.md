---
author: Julian Knight (Totally Information)
created: 2026-03-26 13:19:58
updated: 2026-04-09 19:17:41
status: Published
title: URL Links
description: >
    How to include images in markdown files.
    Images can be referenced from local files or external URLs.
tags:
  - markdown
  - links
  - urls
  - url
---

## Markdown Links
There are 2 types of links in markdown standard and image.

### Standard Links
Standard links use the syntax `[link text](url)`, where `link text` is the text that will be displayed as the clickable link, and `url` is the destination URL that the link points to.

For example, `[Google](https://www.google.com)` will create a link that says "Google" and points to `https://www.google.com`.

### Image Links
Image links use the syntax `![alt text](image-url)`, where `alt text` is a description of the image for accessibility purposes, and `image-url` is the URL of the image.

For example, `![Example Image](https://example.com/image.jpg)` will display the image located at `https://example.com/image.jpg` with the alt text "Example Image".

See the [Images](./images.md) page for more information on how to include images in markdown files, as the same principles apply to referencing local files, uibuilder paths, and external URLs.

### Additional attributes

You can add an HTML `title` attribute by placing text after the URL: `[Example](https://www.example.com "Example link to an external site")`

Markweb also allows additional arbitrary HTML attributes to be added to links using the `{}` syntax after the link. See the [Custom attributes](markdown-tests/custom-attributes.md) page for more details.

## URL Types
When specifying URL links in Markweb, there are several types you can use.

> [!NOTE]
> While Markweb refuses access to Markdown files starting with `_` or `.` or in folders starting with those, it _**does**_ permit non-Markdown files with those prefixes to be linked to.

### Local to the Markweb root folder
Since Markweb mounts the Markweb root folder as the base for all URL paths, you can reference any file that is located within that folder or its subfolders using a relative path.

For example, if your Markweb root folder is located at `/homes/node-red/.node-red/myweb/` and you have a file located at `/homes/node-red/.node-red/myweb/files/document.pdf`, you can reference it in your links using the following syntaxes: 

* `files/document.pdf` or
* `./files/document.pdf` or
* `/files/document.pdf`

#### Markdown files
When linking to another markdown file, you can use the same relative path syntax. However, you can omit the `.md` extension in the link if you prefer.

```markdown
[Variables](markdown-tests/variables)
```
[Variables](markdown-tests/variables)

#### Markdown folders
You can also reference a folder's default page by omiting the default `index.md`/`_index.md`/`<foldername>.md` name. Additionally, you can include or omit a trailing slash.
```markdown
[Markdown Tests](markdown-tests/)
```
[Markdown Tests](markdown-tests/)

#### Anchor links (AKA Deep links)

You can also link direct to a header for a section of a page's main content using an anchor link.
```markdown
[Variables: Technical Details](markdown-tests/variables#technical-details)
```
[Variables: Technical Details](markdown-tests/variables#technical-details)

And link to elsewhere on the same page:
```markdown
[Additional Attributes](#additional-attributes)
```
[Additional Attributes](#additional-attributes)

> [!TIP]
> Markweb automatically generates IDs for each section header based on the text of the header.
> For example, a header with the text "Technical Details" will have an ID of `technical-details`.
> However, sometimes sane auto-ID's cannot be generated, for example if the header text contains special characters. In that case, you should add a custom ID to the header using the `{#custom-id}` syntax.
>
> For example: `> ## Copyright placeholder (`%%copyright%%`){#copyright-placeholder}`

### UIBUILDER paths
UIBUILDER has a set of accessible resources mounted at the virtual URL path `/uibuilder/`. This means you can reference resources that are accessible via that path. That includes files in vendor libraries that you've added via a uibuilder node's Library Manager at `/uibuilder/vendor/`.

```markdown
![UIBUILDER Image](uibuilder/images/uib-world.svg){style="width:4em;"}
```
![UIBUILDER Image](uibuilder/images/uib-world.svg){style="width:4em;"}


### External URLs
You can reference external URLs in your markdown files as long as they are accessible from the client and allowed by CORS policies. This includes links to external websites, APIs, and resources.

```markdown
[Brave Search](https://search.brave.com/search)
```
[Brave Search](https://search.brave.com/search)
