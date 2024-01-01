---
title: Using the List node
description: |
  Describes how and why to use the uib-list node and how to create a list in your web page from an array.
created: 2022-06-28
lastUpdated: 2022-06-28 15:53:13
updated: 2023-12-30 17:01:41
---

The `uib-list` node was added in uibuilder v5.1 as an experimental version. 

It provides an easy, no-code method from within your flows of creating an HTML list in your web pages based on a simple array or JavaScript object.

It uses the new configuration-driven UI capabilities of the new client library (it doesn't work with the old `uibuilderfe.js` client).

## Using the list node

Make sure you have at least one uibuilder node set up and deployed.

Add a `uib-list` node with an input flow. Connect it to the uibuilder node and configure as shown in the next section.

Then a suitable input message can be sent. 

A simple message might have a JSON payload of `["LI One", "LI Two", "LI Three", "LI Four"]` for example which would produce a list containing 3 lines (if you selected an OL or UL list).

For a DL list, the minimal data might look like `[["Entry 1","Definition 1"],["Entry 2","Definition 2"],["Entry 3","Definition 3"],["Entry 4","Definition 4"]]` (an array of array's), or `[{"Entry 1":"Definition 1"},{"Entry 2":"Definition 2"},{"Entry 3":"Definition 3"},{"Entry 4":"Definition 4"}]` (an array of objects). That creates an 8 line output in the UI.

Obviously, the exact look and feel and number of output lines is also dependent on what CSS styling you use.

## Configuration

* Select the appropriate parent uibuilder node to send to.

* Provide an HTML element ID. This needs to be unique on your target web page(s) otherwise you may get hard to analyse issues.

* Select the type of list to create:

  * Unordered (ul) - a bullet list
  * Ordered (ol) - a numbered list
  * Definition (dl) - a term/definition list

* Provide a parent CSS selector

  E.g. "div#myid" or just "#myid" would attach the list as a child of a DIV tag with an id of `myid`.
  "p.myclass" would attach the list as a child of a P tag that has a class including `myclass`.

  If a parent is not specified, the list will be added as a new child of the <code>body</code> tag. (e.g. the end of the UI)

## Optional output message

By selecting to "Output instead of send?", the configuration is not send to connected clients but instead is output as a msg.

That msg contains a `msg._ui` property containing the UI configuration object. Here is a simple example.

Given a msg.payload input of:

```json
[
    "LI One",
    "LI Two",
    "LI Three",
    "LI Four"
]
```

The output msg looks like:

```json
{
    "_msgid": "568941796a27db2c",
    "topic": "auto-create-list",
    "_uib": {
        "originator": "ee38039276e446bb"
    },
    "_ui": [
        {
            "method": "remove",
            "components": [ "#li1" ]
        },
        {
            "method": "add",
            "components": [
                {
                    "type": "ol",
                    "id": "li1",
                    "attributes": {},
                    "components": [
                        { "type":"li", "slot": "LI One" },
                        { "type":"li", "slot": "LI Two" },
                        { "type":"li", "slot": "LI Three" },
                        { "type":"li", "slot": "LI Four" }
                    ],
                    "parent": "#aparent"
                }
            ]
        }
    ]
}
```

## Troubleshooting

If you get some output in your UI that looks like `THREE,C,[object Object]`, you have accidentally sent an object that is too complex for the node to render. If this becomes an ongoing issue, maybe pester me to add support for deeper object resolution.

List appears on all pages in a multi-page uibuilder configuration (multiple pages/folders under a single uibuilder node). Currently, the only way to prevent this is to use the output message option of the node to get the configuration object that you can use in your own flows. The originating page-name is now available in the "client connect" control message from uibuilder but this is not yet incorporated into this node. It is on the backlog for a future update.