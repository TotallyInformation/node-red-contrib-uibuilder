---
title: Change attributes and content of a UI element
description: |
  Various ways to easily change either the attributes or content of a UI element either from Node-RED or from front-end code.
created: 2023-12-09 14:03:57
lastUpdated: 2023-12-09 14:04:02
updated: 2023-12-30 17:01:41
---

When using frameworks such as Vue, REACT, etc. Including Node-RED's Dashboard, changable content is usually represented by a managed variable and included in the UI using something like `<p>{{varname}}</p>`. With UIBUILDER, this is unnecessary. HTML already has everything required to do easy updates.

The structure of a UI in HTML is defined using `elements` which are represented in HTML as `tags`. So a paragraph element is represented by `<p>...</p>` opening and closing tags. Attributes are properties added to tags to give visual or data hints to the element, e.g. `<p id="p001" class="myclass">` where `id` and `class` are both _attributes_ of the element.

So to be able to control and change both the content (the stuff between the opening and closing tag, often referred to as the "slot" content) or the attributes, we need to be able to get a reference to the element. Mostly, this is done using ["CSS Selectors"](how-to/change-element.md) and the simplest method is to ensure that the element has an `id` attribute from the outset. Example: `<p id="p001"></p>` has a unique CSS selector of `#p001`.

Now that we know _what_ to use and _how_ to get a reference to it, we know that we can use _any_ element in our UI and easily change both its content and attributes. Note that if you are using UIBUILDER's standard templates, they all have a `<div id="more"></div>` element, so you can always use that for playing with things.

In the following, we will use the `more` div as the example element.

## Adding elements

You can add an element to control in a variety of ways:

1. Node-RED coding
   1. No-code methods
      1. `uib-element` node will create many different types of compound elements. The required ID defines the outer wrapper of the element tree. This can sometimes make inner content difficult to remember.
      2. `uib-tag` lets you add a single element of any type. The element's content (slot) can be HTML or even Markdown.
   2. Low-code methods - create your own low-code JSON or amend the output of one or more no-code nodes. This lets you create any number of elements of any complexity.
2. Front-end coding
   1. Hard code in the `index.html` file. This is simple and gives you a decent visual picture of the hierarchy of the elements on the page but requires a little knowledge of HTML.
   2. Use native DOM or uibuilder UI (low-code) methods in a JavaScript script.

The safest "blank" elements to use are one of these:

* `div` - "division" is a block (multi-line) element like a paragraph but often with minimal formatting.
* `span` - A span is an in-line element and is great if you need dynamic variable text

UIBUILDER also includes its own custom element [`<uib-var>`](client-docs/custom-components#uib-var-include-a-managed-variable-in-the-page) if you prefer. It uses uibuilder's managed variables feature. See the linked documentation for details. It has a number of advantages: 

* You can use a simple command from Node-RED to make changes to the managed variable which updates the display automatically. Updates can also be done in front-end code with `uibuilder.set('myvarname', myvalue)`.
* Can let Node-RED know when the variable changes (great for allowing change from a number of different sources including front-end code).
* Can show HTML, plain text, Markdown (if the Markdown-IT library is loaded) or a formatted JSON object.
* Will sanitise any HTML updates if the DOMPurify library is loaded. Good if you are allowing HTML/Markdown content to be defined by user input.

## Amending elements

Now that you have something to work with, here are the ways you can make changes.

### From Node-RED

By far the simplest method is to use the `uib-update` node.

Alternatively, you can use the same kind of `msg._ui` output that the `uib-update` node produces in your own low-code flows.

If using the `<uib-var>` custom tag, you could instead simply update the value of the variable given to that tag as described in the previous section.

### From front-end code

The "traditional" way to do things is to use the `uibuilder.onChange('msg', (msg) => { ... })` function to capture and process messages from Node-RED, you can directly update the UI.

```javascript
uibuilder.onChange('msg', (msg) => {
    // Assuming msg.topic as a simplistic way to identify the element to change

    // Use the uibuilder $ shortcut to get a reference to the element
    const whatToChange = $(`#${msg.topic}`)

    // Give up if it wasn't found
    if (!whatToChange) return

    // If the msg says to change an attribute
    // - msg.attribute contains the attribute name, msg.payload the value
    if (msg.attribute) {
        whatToChange.setAttribute( msg.attribute, msg.payload)
    } else {
        // Otherwise, assume the content changes (allows HTML)
        whatToChange.innerHTML = msg.payload
        // Use this instead if you only want text content
        // whatToChange.innerText = msg.payload
    }
})
```

Now, send a message containing `{topic:'more', attribute:'class', payload:'myclassname'}` to change the elements class dynamically. Or send `{topic:'more', payload:'This is some <b>BOLD</b> text.'}` to change the content (with some simple HTML formatting in this case.)

Alternatively, use `uibuilder.ui(someJson)` to update things using the same low-code JSON as from Node-RED but this is only really useful for more complex changes.

Or, if using the `<uib-var>` custom element, simply update the linked variable with `uibuilder.set('myvarname', myvalue)`
