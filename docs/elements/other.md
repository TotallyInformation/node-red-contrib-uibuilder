---
title: Generate miscelaneous HTML elements from simple input data
description: |
  Page headings, text boxes, etc.
created: 2023-02-24 16:49:49
lastUpdated: 2023-08-19 17:00:55
updated: 2023-12-30 17:01:41
---

Note that `msg.payload` as the data input can be changed to any msg property, a context variable, manually defined string, number, or JSON or dynamic JSONata as desired in the node's settings.

## Text Box

Inserts a bordered box. Use the heading setting to add a heading. Both heading and content must be text or HTML strings.

Uses the `.box` class. This class reduces the top margin of `<h2>`-`<h6>` headings to 0.5rem.

### Example minimum input message

```json
{
   "payload": "Some <b>HTML</b> inserted dynamically."
}
```

## Page Title

Changes the page's meta head data. Both the meta title and description are changed to the message payload.

Additionall, updates the first `<h1>` heading if present, if not present, adds a new `<h1>` at the top of the `<body>` (top of the visible page). Note that the *Parent* and *Position* inputs are ignored. Also note that there should only ever be a single `<h1>` tag on a page in accordance with W3C and WCAG standards.

The input payload should be plain text, not HTML. If the input payload is an array, the first entry will be the `<h1>` heading and the last entry will be a _sub-heading_ which renders in smaller text and in *italic*.

### Example input message with sub-heading

```json
{
   "payload": [
      "Text-Only Heading",
      "A text-only sub-heading"
   ]
}
```
