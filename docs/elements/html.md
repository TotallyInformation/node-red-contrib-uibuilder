---
title: Insert raw HTML or Markdown into a web page
description: >
   .
created: 2023-02-24 16:49:49
lastUpdated: 2023-08-19 17:01:08
---

The HTML element type passes raw HTML string input to the output. No optional heading is allowed. The inserted HTML is wrapped in a `<div>`.

Inserted HTML cannot replace the whole HTML document (`<html>`) or the `<head>` at this time. Use the `uib-update` node to update existing parts of the `<head>`.

The input payload must contain the HTML string to use.

If the _[DOMPurify](https://github.com/cure53/DOMPurify)_ library is loaded in the web page, inserted HTML will be checked and made safe.

Note that `msg.payload` as the data input can be changed to any msg property, a context variable, manually defined string or dynamic JSONata as desired in the node's settings.
