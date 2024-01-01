---
title: uib-element - Zero-code web UI creation
description: |
  Create `msg._ui` configuration data from simple inputs. This can be easily turned into HTML by the uibuilder client library. All that is needed is to send the data to a uibuilder node and the UI will be built dynamically.
created: 2023-02-05 16:31:39
lastUpdated: 2023-02-22 09:01:47
updated: 2023-12-30 17:01:41
---

*(This document is a work-in-progress, it is not complete)*

This node lets you easily create new front-end UI elements from within Node-RED. It has a selection of element types ranging from simple text structures, through different types of list and full tables. It is a much more comprehensive node than the previous, experimental, `uib-list` node. This node is classed as _zero-code_ since no coding is required in order to produce a web user interface.

**Note that this generates pure HTML - no frameworks are used**.

It creates configuration-driven dynamic additions to your front-end UI while letting you send fairly simple data to dynamically create the structure. For example, sending an array of objects with the `Table` type will create/replace a complete table in your front-end.

Has a single output. Outputs can be chained to more `uib-element` nodes. At the end of the chain, simply send to a uibuilder node input. Optionally, make sure each chain has a unique topic and send to a `uib-cache` node so that new and reloaded browser clients get the last output.

> **Note**: The range of options built into the node for each element type is deliberately fairly restricted. If you want more complex layouts, you should either craft the JSON yourself (this node can output the raw JSON if you want so that you can save it and enhance it yourself. Also, this initial release is mostly driven by the input data; in future releases some options will be capable of override using configuration inputs in the node.
> 
> This is NOT meant as a *Dashboard* replacement. It is mostly meant for people who need a quick and simple method of dynamically creating UI elements's within a pre-defined HTML design. The element content is rebuilt every time you send data so this is certainly not the most efficient method of working with data-driven UI's. However, it will often be good-enough for relatively simple requirements.

Element types included in this release:

* [**Simple Table**](elements/tables.md) - Generates a simple HTML table from an input array of objects where the first element of the data array will define the columns. Future enhancements will allow more control over the columns. Future types will be added to allow add/update/remove of individual rows and/or cells.
* [**Simple Form**](elements/forms.md) - Generate a simple but accessible input form from an array of objects where each object in the array defines the attributes and label.
* [**Unordered List (ul)**/**Ordered List (ol)**](elements/lists.md) - Generates a bullet or number list from a simple input array or object.
* [**Description List (dl)**](elements/lists.md) - Generates a description list from a simple input array of objects.
* [**Text box**](elements/other.md) - A simple "card" like article element.
* [**HTML**](elements/html.md) - Pass-though HTML (e.g. from a Node-RED Template node).
* [**Page Title**](elements/other.md) - Change the page HTML title, description and the first H1 tag on the page to all be the same input text. If no H1 tag exists on the page, it will be added. (Note that only 1 H1 tag should ever be on a page)

Where an *ID* is specified in the config, each of the above will attempt to *replace* an existing instance when called again. If *no ID* is specified, they will *always add* a new element.

Each element except the page title is wrapped in a `<div>` tag which has the specified HTML ID applied to it. Where possible, rows and columns are given their own identifiers to make updates and styling easier. Attempts are made to ensure that the resulting HTML is accessible.

Each element can have an optional heading. If used, a aria-labelledby attribute is added to the `div` tag for accessibility.

The following element types are also available but behave slightly differently in that they will **always** add a new row regardless of the ID setting, they are not wrapped in a div and you cannot add a heading:

* [**Add row to existing table**](elements/tables.md) - Adds a single row, must provide the _Parent_ of the table to update, can insert the row anywhere via the _Position_ input.
* [**Add row to existing unordered or ordered list**](elements/lists.md) - Adds a single row, must provide the _Parent_ of the list to update, can insert the row anywhere via the _Position_ input.

In addition, a special msg may be sent to this node: `msg.mode` where `mode` = "remove". In this case, as long as an HTML ID has been provided, the element will be removed from the UI.

> Unfortunately, many front-end frameworks such as REACT and VueJS require the UI page structure to be pre-defined at load time. Because of this, many of the features in this node are of limited use when working with those frameworks.
>
> Oher frameworks though are better behaved (e.g. Svelte) and will work well with this node.

## Tips

### Getting to know your browser's developer tools
### Understanding HTML hierarchy
### Understanding CSS Selectors
### Always specify an HTML ID
### Chain together to make more complex UI's
### Use pre-defined CSS to style elements
### Saving output for future use
### It's just data - understanding the output
