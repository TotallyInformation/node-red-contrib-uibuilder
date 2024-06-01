---
title: Insert Markdown into a web page
description: |
  The Markdown element type passes a Markdown string input to the output. No optional heading is allowed. The Markdown is converted to HTML in the client browser.
created: 2023-02-24 16:49:49
updated: 2024-04-30 14:49:17
---

No optional heading is allowed, headings can be defined in the Markdown. The inserted HTML is wrapped in a `<div>`.

>[!NOTE]
> No browser output will be rendered unless the [Markdown-IT library](https://markdown-it.github.io/) is loaded. [Details are documented here](client-docs/readme?id=_2-markdown-it-converts-markdown-markup-into-html).
>
> In addition, Markdown-IT plugins can also be loaded.

The input payload must contain the Markdown string to use.

If the _[DOMPurify](https://github.com/cure53/DOMPurify)_ library is loaded in the web page, inserted HTML will be checked and made safe.

Note that `msg.payload` as the data input can be changed to any msg property, a context variable, manually defined string or dynamic JSONata as desired in the node's settings.

>[!INFO]
> The Node-RED core `template` node can be used for easily writing Markdown in the Editor and for inserting dynamic data using Mustache tags.

