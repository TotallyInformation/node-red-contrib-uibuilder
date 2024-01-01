---
title: CSS Selectors
description: |
  How to make use of them with uibuilder and some typical examples.
created: 2023-04-02 17:34:58
lastUpdated: 2023-04-02 18:47:50
updated: 2023-12-30 17:01:41
---

[CSS Selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors) are now the main generic way of selecting one or more specific elements on a web page.
They originated with CSS as a way of identifying elements to apply styles to but are now also used by JavaScript.

uibuilder also makes extensive use of CSS Selectors. Specifically, any zero-code or low-code updates to elements needs to identify the original element and CSS selectors are the generic way to do this. You will see the term CSS Selector in a number of places in the `uib-element` and `uib-update` nodes as well as in the uibuilder documentation.

## How to find a selector

You can use your browser's `DevTools` to find and copy a selector. The "Elements" tab in dev tools shows you the browser's internal interpretation of your HTML page. Work down to the element you want to select, click on it. Then use the right-hand mouse button and choose "Copy" > "Copy Selector". Noting that it is very often possible to greatly simplify the result.

## Simplifying selectors

The main method to simplify selectors for single selections is to add more ID's. For example, in a table, when using `uib-element`, you can get row id's but using an object of objects as input instead of an array of objects. See the zero-code example flow for specific examples.

To simplify selections of multiple elements, the easiest method is to use classes or a named `data-*` attribute.

## Common examples

### Identify a single element to update or style

An HTML id is prefixed by a `#` symbol.

```html
<div id="more">...</div>
```

Selector: `#more`

```CSS
#more {
    background-color: yellow;
}
```

```javascript
// Returns the first element with the ID `more`, ID's should be unique on the page
const el = $('#more')  // Or: document.querySelector('#more')
el.innerHTML = '<p><b>Ohh! Some formatted text.</b></p>'
```

### Identify all of the elements having a given CSS class name

An element may have multiple classes and any of them can be selected for by name. A class name is prefixed by a `.`.

```html
<ul>
    <li>#1</li>
    <li class="big pink elephant">#2</li>
    <li>#3</li>
    <li class="small elephant green">#2</li>
</ul>
```

Selector: `.elephant`

```CSS
.elephant::before {
    content: "🐘"
}
```

```javascript
const allElephants = document.querySelectorAll('.elephant')
allElephants.innerText = 'Elephants are smelly!'
```

### Select all elements of a specific type

Selector: `div` (or any other tag name)

### Identify all elements having a title attribute

HTML Attributes can also be selected

```html
<div title="This is a title">...</div>
```

Selector: `*[title]` or more specifically `div[title]`

### Identify all elements having a specific attribute value

HTML elements have attributes and those attributes have text values. We can identify based on that.

This example uses a `data-*` attribute. Data attributes are for adding custom data to an element.

```hmtl
<p data-isItImportant="true">...</p>
```

Selector: `p[data-isItImportant="true"]`

### Identify the N-th row of a table or list

Likely to be a common need when working with tables or lists and uibuilder. For example, when you want to only change the bullet or text of a specific list row.

Also note that `uib-element` creates outputs that are generally wrapped in an outer `div` tag which has the ID on it and may also have a heading tag as the first child. Allow for that in the selector. The examples below all allow for that by using a non-specific child selector prefix like `#eltest-ul-ol li` which will select a list item even if it is several layers down. The `nth-child` selector applies to that child's parent. so that `#eltest-ul-ol  li:nth-child(2)` selects the 2nd `li` under the `ol` parent tag whether or not the ID was applied to that parent or some higher ancestor.

It is advisable to do some playing with selectors like these in order to get the hang of them. Typically, you will only need to learn a few patterns to get to everything you need.

### Lists

Select the 2nd row of the unordered (ul) or ordered (ol) list with the ID `eltest-ul-ol` (or the list's parent `div` might have that ID):

Selector: `#eltest-ul-ol  li:nth-child(2)`

Note that Description Lists (dl) have a much more complex structure. When defining them, it is best to wrap the matching `dt` and `dd` elements that make up each entry in a `<div>` tag, the specific entry can then be selected with `#myDl div:nth-child(2)`. The `uib-element` node does this for Description Lists.

### Tables

Tables have a very complex element structure. To select the correct data row, you need to know that the data rows are wrapped in a `<tbody>` tag and each row is a `tr` tag with multiple `td` or `th` tags that denote the actual cells (columns) in the row. Use the table example from the zero-code example available in the uibuilder part of Node-RED's examples library to see a best-practice table layout.

To select the second row, second column of a table with the ID `eltest-tbl`:

Selector: `#eltest-tbl tbody > tr:nth-child(2) > td:nth-child(2)`

This assumes a well-formed table using best practices.

If you need to account for more than a single `tbody` (which is allowed), use: `#eltest-tbl tbody:nth-child(2) > tr:nth-child(2) > td:nth-child(2)`.
It is the 2nd child because the table typically has a first child of `thead` where the headings live.

Because tables can also have spanning rows and columns, specific selections can get quite complex. However the dev tools will help identify the correct selector.
