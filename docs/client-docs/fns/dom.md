---
title: DOM - low-code page manipulation
description: |
  The dom object provides a simple way to manipulate the DOM of a web page.
created: 2025-02-03 18:06:48
updated: 2025-03-26 11:22:12
---

> [!WARNING]
> This feature is experimental and may change in future releases.
> It is not yet fully implemented.

The front-end `tinyDom.js` library is used by the uibuilder client library to expose a global `dom` object (also available as `uibuilder.dom`).

This low-code feature is simpler to use than the `_ui` low-code schema and matching `uibuilder.ui()` function. However, it requires slightly more familiarity with HTML.

This feature was inspired by the [TinyJS library](https://github.com/victorqribeiro/TinyJS) by [Victor Ribeiro](https://github.com/victorqribeiro).

## JavaScript code examples

```javascript
// Returns a div on the page with the id of 'myDiv' and the text 'Hello World!'
let el = dom.div({id: 'myDiv'}, 'Hello World!')
// Returns a custom element on page `<div id="myDiv"><span style="color:red;">Hello</span> World!</div>`
let el = dom['my-element']({id: 'myElement'}, '<span style="color:red;">Hello</span> World!')
// Returns a custom element on page `<my-element id="myElement">Hello World!</my-element>`
let el = dom.myElement({id: 'myElement'}, dom.p('<span style="color:red;">Hello</span> World!'))
// Add the element to the page as a child of the div with the id of 'more'
dom.add(('#more', el))
// Or alternatively
$('#more').appendChild(el)

// Update an existing element
dom.update('#more', { className: 'myClass', innerHTML: '<span style="color:red;">Hello</span> World!'} )

// Remove an existing element (and all children)
dom.remove('#more')
```

The function name is the tag name of the element you want to create. Any valid tag can be used including custom elements.

The first argument must either be a string (inner HTML) or an object with properties that are used to set attributes on the element. All properties of the element will be updated as properties if direct updates are possible or as attributes if not. No checking of properties is done.

Subsequent arguments are either strings (inner HTML) or other elements.

The function returns a reference to the created element if created. Or returns `undefined` if the tag name was unknown.

Special functions are:

* `dom.add(cssSelector, elements)` - Adds one or more elements to the page as a child of another element.
* `dom.update(cssSelector)` - Updates an existing element with new attributes and content.
* `dom.remove(cssSelector)` - Removes an existing element from the page.

To easily do the changes from Node-RED simply send a message containing a `_dom` property:

## Node-RED message examples
```json
{
    "_dom": [
        {
            "action": "add",
            "target": "#more",
            "element": {
                "tag": "div",
                "id": "myDiv",
                "innerHTML": "Hello World!"
            }
        }
    ]
}
```json
{
    "_dom": [
        {
            "action": "add",
            "target": "#more",
            "element": {
                "tag": "div",
                "id": "myDiv",
                "innerHTML": "Hello World!"
            }
        }
    ]
}

```json
{
    "_dom": {
        "action": "add",
        "target": "#more",
        "element": {
            "tag": "div",
            "id": "myDiv",
            "innerHTML": "Hello World!"
        }
    }
}
```
