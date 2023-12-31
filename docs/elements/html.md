---
title: Insert raw HTML into a web page
description: |
  The HTML element type passes raw HTML string input to the output.
created: 2023-02-24 16:49:49
lastUpdated: 2023-09-01 17:02:44
updated: 2023-12-30 17:01:41
---

No optional heading is allowed, headings can be defined in the HTML. The inserted HTML is wrapped in a `<div>`.

Inserted HTML cannot replace the whole HTML document (`<html>`) or the `<head>` at this time. Use the `uib-update` node to update existing parts of the `<head>`.

The input payload must contain the HTML string to use.

If the _[DOMPurify](https://github.com/cure53/DOMPurify)_ library is loaded in the web page, inserted HTML will be checked and made safe.

Note that `msg.payload` as the data input can be changed to any msg property, a context variable, manually defined string or dynamic JSONata as desired in the node's settings.

>[!INFO]
> The Node-RED core `template` node can be used for easily writing HTML in the Editor and for inserting dynamic data using Mustache tags.
