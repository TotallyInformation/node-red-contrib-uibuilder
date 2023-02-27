---
title: Generate input forms from simple input data
description: >
   Turns an array/object of objects into a simple, accessible form.
created: 2023-02-24 16:49:49
lastUpdated: 2023-02-24 16:49:54
---

*(This document is a work-in-progress, it is not complete)*

A simple but accessible Form with inputs and buttons. Docs.

Set the incoming msg.payload to an Array of Objects. Each array entry will be a new form input or button. An Object of Objects can also be used where the outer object is key'd by the ID of the entry.

Currently supported properties in the inner objects are: `type=`One of the input types listed below, `id=`Unique HTML identifier, `label=`Label text of the input field or button, `required=`true/false whether a value is required, `value=`Optional starting value.

Other properties can be provided. These only work with the appropriate input types and are otherwise ignored

Available input types are: `button`, `checkbox`, [`color`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color), `date`, `detetime-local`, `email`, `hidden`, `month`, `number`, `password`, `radio`, [`range`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range), `tel`, `text`, `time`, `url`, `week`. See this explanation of the types and properties.

Some additional types will be made available in the future: `select`, `combo`, `file`, `image`, `textarea`. Auto-complete will also be added eventually.

If a button is included, pressing the button will automatically send a message from the client back to Node-RED All of the form data will be included in that message in `msg._ui.form`.

Input types and possible attributes cna be found on the [MDN Input page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input).

## Example input message

```json
[
    {
        "id": "r1",
        "type": "text",
        "required": false,
        "label": "Label for form row 1",
        "value": "Foo"
    },
    {
        "id": "r2",
        "type": "range",
        "required": false,
        "label": "Label for form row 1",
        "value": "Foo"
    },
    {
        "id": "r3",
        "type": "button",
        "label": "Label for form row 1",
        "value": "Buttons can have values as well"
    }
]
```
