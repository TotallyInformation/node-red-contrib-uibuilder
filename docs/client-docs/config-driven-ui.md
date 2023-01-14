---
title: Dynamic, configuration-driven UI's (low-code)
description: >
   This version of the uibuilder front-end library supports the dynamic manipulation of your web pages. This is achieved either by loading a JSON file describing the layout and/or by sending messages from Node-RED via a uibuilder node where the messages contain a `msg._ui` property.
   This is known as "configuration-driven" design since you send the configuration information and not the actual HTML. It is considered a low-code approach.
created: 2022-06-11 14:15:26
lastUpdated: 2023-01-14 17:08:48
---

- [Dynamic content limitations](#dynamic-content-limitations)
  - [Positioning new elements before existing ones rather than after](#positioning-new-elements-before-existing-ones-rather-than-after)
  - [Updates and sub-components](#updates-and-sub-components)
- [Dynamic content details](#dynamic-content-details)
- [Initial load from JSON URL](#initial-load-from-json-url)
- [Dynamic changes via messages from Node-RED (or local set)](#dynamic-changes-via-messages-from-node-red-or-local-set)
- [Available methods](#available-methods)
- [Method: load](#method-load)
  - [Caveats and limitations](#caveats-and-limitations)
  - [Msg schema \& example](#msg-schema--example)
  - [Example showing load in your own index.js](#example-showing-load-in-your-own-indexjs)
- [Method: add](#method-add)
  - [Msg schema](#msg-schema)
  - [Example msgs for nested components](#example-msgs-for-nested-components)
- [Method: remove](#method-remove)
- [Method: update](#method-update)
  - [Msg schema](#msg-schema-1)
- [Method: reload - Reloads the current page](#method-reload---reloads-the-current-page)
- [Method: notify](#method-notify)
  - [HTML Tags](#html-tags)
    - [Schema](#schema)
- [Method: alert](#method-alert)
- [References \& examples](#references--examples)

## Dynamic content limitations

There are currently a small number of limitations of this approach that you should be aware of.

### Positioning new elements before existing ones rather than after

If you want to add something new before siblings rather than at the end, this is not yet handled.

For example, if you wanted to add a new list entry at the start of the list, you would need to `remove` then `add` the whole list.

### Updates and sub-components

If you want to `update` an existing element and update a sub-component (such as a specific list entry), the sub-components MUST already exist (because this is an update action). If that is not the case and instead you want to add a new sub-component, you must have a separate `add` action and select the parent component.


## Dynamic content details

Dynamic, data-driven UI manipulation is supported directly by this uibuilder front-end library. You can either control the UI via messages sent from Node-RED as shown in the next section, or you can also load a UI from a web URL that returns JSON content in a similar format.

You can also manipulate the UI from within your own front-end code by simulating the receipt of node-red messages (`uibuilder.set('msg', {_ui: [{ ... }]})`).

It is best practice to always include a method-level parent (`_ui[n].parent`) even if you want to attach everything to the `<body>` tag (CSS Selector `body`).

## Initial load from JSON URL

This is optional but may be useful to pre-populate the dynamic UI.

It is triggered using the command `uibuilder.loadui(<URL>)` where `<URL>` is the URL that will return JSON formatted content in the format described here.

`uibuilder.loadui` can run before `uibuilder.start`. It is best to run it as early as possible after loading this library.

A common way to provide an initial UI would be to create an `index.json` file in the same folder as your `index.html` file. You can then use `uibuilder.loadui('./index.json')` to get your initial UI on the page. A possible alternative might be to use uibuilder's instance API feature to dynamically create an API URL that returns the JSON. More commonly though, if wanting to dynamically generate the initial layout, would be to use a Node-RED flow that is triggered by a uibuilder client connection control message.

It is best practice to try and always include `id` attributes at least on every top-level component. That will enable you to easily and safely

## Dynamic changes via messages from Node-RED (or local set)

The receipt from Node-RED or local setting (`uibuilder.set('msg', {_ui: { ... }})`) of a `msg` object containing a `msg._ui` property object will trigger the uibuilder front-end library to make changes to the web page if it can.

?> Note that `msg._ui` can be either an Object (which only allows a single method call in the msg) or it can be an Array (which allows multiple method calls in a single msg).

Each method object may contain any number of component descriptors. Component descriptors can contain any number of sub-component descriptors. There is no theoretical limit to the nesting, however expect things to break spectacularly if you try to take things to extremes. If top-level components have no parent defined, they will use the parent at the method level, if that isn't defined, everything will be added to the `<body>` tag and a warning is issued. Sub-components will always be added to the parent component.

All methods and components are processed in the order they appear in the message.

## Available methods

```js
msg._ui.method = 'load' || 'add' || 'remove' || 'update' || 'reload' || 'notify' || 'alert'
```

* `load`: Load a new UI component using `import()` so that it can be used. Used, for example, to dynamically load web components or other modules. It can also load plain JS and CSS.
* `add`: Add a UI component instance to the web page dynamically.
* `remove`: Remove a UI component instance from the web page dynamically.
* `update`: Update the settings/data of a UI component instance on the web page.
* `reload`: Triggers the page to automatically reload
* `notify`: Shows an overlayed notification message (toast)
* `alert`: Shows an overlayed alert notification

Other future possibilities: `reset`

## Method: load

The load method allows you to dynamically load external web components, ECMA modules, plain JavaScript, and CSS stylesheets. It also allows loading of JavaScript and CSS Styles from given text input.

!> Please take note of the limitations and caveats of the load method. It works well for loading web components before adding them dynamically to your UI. Also works well for dynamic changes to scripts and css. However, there are a lot of things that can catch you out. If having issues, use an import statement or a script tag in your front-end code instead.

### Caveats and limitations

* **WARNING**: Passing code dynamically **IS** a potential security issue. Make sure that only safe code is permitted to be passed. There is no way for the front-end library to check the validity or safety of the code.

* If using a relative url, it is relative to the uibuilder client library and NOT relative to your code.

* For the `components` array

  * You cannot use this feature to load web components that you manually put into your index.html file. That is because they will load too late. Only use this where you will dynamically add a component to the page using the UI methods shown here.

  * At present, only ES modules (that use `export` not `exports`) can be dynamically loaded since this feature is primarily aimed at loading [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components). This feature requires browser support for [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports).

  * Dynamic Imports happen asynchronously. While this isn't usually a problem, the load does not wait to complete so very occasionally with a particularly complex component or on a particularly slow network, it is possible that the load will not complete before its use. In that case, simply delay the components use or move the load to earlier in the processing.

* For the `srcScripts` and `txtScripts` arrays
  
  * Scripts attached these ways generally finish loading too slowly. This means that you cannot use the load method and then use the script in an add method straight away. You would have to load the script in your HTML for that. However, you can load them, for example, in the `loadui` function and then use them later when sending `_ui` msgs from Node-RED. Typically, you will need a second or two before the script will have fully loaded.
  
  * `txtScripts` entries must be text, you cannot pass an actual JavaScript function. This is normally OK since Node-RED should convert a function to text as it pushes the data through Socket.IO.

* For the `srcStyles` and `txtStyles` arrays
  
  * Styles loaded this way are added to the end of the HTML `head`. As such, if you try to redefine a style that an already loaded stylesheet has set, you may need to add ` !important` to the definition due to CSS specificity rules.

### Msg schema & example

```jsonc
{
    "_ui": {
        "method": "load",
        "components": [
            "url1", "url2" // as needed
        ],
        // Styles are added to the end of the HEAD
        "srcStyles": [
            "https://example.com/libs/my-styles.css"
        ],
        "txtStyles": [
            // Example of overwriting a brand stylesheet entry
            ":root { --info-hue: 90 !important; }",
            // We can try to change anything - but will need !important if the pre-loaded sheet already defines it
            "code { font-size: 120% !important; font-family: fantasy; }"
        ],
        // Note that scripts finish loading too slowly which means that you cannot use the load
        // method and then use the script in an add method. You have to load the script in your HTML for that.
        // Typically, you will need a second or two before the script will have fully loaded.
        "srcScripts": [
            "https://example.com/some/script.js"
        ],
        "txtScripts": [
            // Will be able to do `fred()` in the browser dev console.
            "function fred() { console.log('HEY! This script loaded dynamically.') }",
            // But of course, we can execute immediately as well.
            "fred()"
        ]
    }
}
```

### Example showing load in your own index.js

Note how this can and usually *should* be done immediately after importing the uibuilder library.

```javascript
uibuilder.set('msg', {
    _ui: {
            "method": "load",
            "components": [
                "../uibuilder/vendor/@totallyinformation/web-components/components/definition-list.js",
                "../uibuilder/vendor/@totallyinformation/web-components/components/data-list.js",
            ]
    }
})

// We don't need this normally any more but just to show
// you can run a load before running start.
//uibuilder.start()
```

## Method: add

The `add` method will add one or more HTML elements (components) to the page. Components are loaded in order and a component may also have nested components (which in turn can also do so, ...). 

Each component can:

* *Be attached to a specified parent element* selected via a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) statement (e.g. `#myelementid`, `.myclass`, `li.myclass`, `div[attr|=value]`, etc). 
  
  If the selector results in multiple elements being returned, only the _first_ found element is used.

  Each component is added as a _child_ of the parent.

* *Have HTML attributes set*.
  
  Remember that HTML attributes can only contain string data.

* *Have custom properties set*. This can contain any data that can be passed via JSON. 
  
  !> Note that, because the library adds any custom property direct to the element, you need to take care not to use an existing name (such as internal DOM API names). Doing so will either fail or will have unintended side-effects.

  This allows you to pass complex data into an element, including custom web components.

* *Have the slot content filled with text or HTML*. 
  
  Slot content is what is inserted between the opening and closing tag of an element. 
  
  Slots can be specified for each individual component but if not specified and a `msg.payload` is provided, that will be used instead. This enables you to have multiple components with the same slot content if desired. The payload is not passed down to sub-components however to prevent unexpected bleed when defining tables, etc.

  Slot content set to `undefined`, `null` or `""` (empty string) is ignored.

* *Specify functions to be called for specific HTML events* (e.g. on click, mouseover, etc). 
  
  Do not include trailing `()` when specifying the function name. This also means that arguments cannot be passed.
  
  Any function names used must be in a context accessible to the uibuilder library. Typically, where the library is loaded as a module, it means that the function must existing in the window (global) context. You may need to specify this in the name (e.g. `window.myfunction`). 
  
  The `uibuilder.eventSend` built-in function can also be specified. This is designed to automatically send `data-*` attributes and custom properties of the element back to Node-RED without any coding required. All of the `data-*` attributes are attached as a collection to the `msg.payload`, all of the custom properties are attached to `msg.props`.

* _Make use of [DOMPurify](https://github.com/cure53/DOMPurify)_. To sanitise `slot` HTML entries.
  
  Feeding HTML into a web page can be a security issue. However, these features absolutely need to do just that. Because you are sending data from Node-RED for the most part, there is a good chance that you have control over the data being sent and therefore the risk should be low. However, if you need/want to reduce the risk further, you can simply load the [DOMPurify](https://github.com/cure53/DOMPurify) library before you load this uibuilder front-end library. If available to the library, it will be automatically used, you don't need to do anything.

  Simply add this to your HTML before you load your uibuilder/index.js file `<script defer src="https://cdn.jsdelivr.net/npm/dompurify@2.3.6/dist/purify.min.js"></script>`. DOMPurify cannot be loaded as an ECMA module. Make sure, therefore that it loads before you load the uibuilder library.

* _Make use of the [Markdown-IT](https://markdown-it.github.io/) library_. To convert Markdown to HTML dynamically.
  
  By loading the `markdown-it` library into your index.html head `<script defer src="https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js"></script>`, uibuilder client will let you specify a `slotMarkdown` in addition to the `slot`. 

  `slotMarkdown` will be rendered into HTML as the element is rendered dynamically. The rendered HTML is inserted after any `slot` HTML.

  Notes
  
  * Little work has been done on this feature as yet so while it works, it does not have all of the highlighting and extra features you might expect from something like Docsify.
  * If available, `DOMPurify` will be used to sanitise the resulting HTML.
  * You can also make use of [HighlightJS](https://highlightjs.org/) to add code highlighting inside the usual back-tick blocks. Add a reference to the library AND an appropriate CSS file in your index.js file.

### Msg schema

```jsonc
{
    "_ui": {
        // REQUIRED
        "method": "add",

        // Optional. All components will be added to this in order. Ignored if component provides a parent.
        "parent": "html selector",
        
        // List of component instances to add to the page - results in 1 or more HTML custom elements being added.
        "components": [
            {
                // REQUIRED. The reference name of the component (TBD: May need to be Class name rather than the element name. e.g. SyntaxHighlight rather than syntax-highlight)
                "type": "...",

                // Supplying this will make further updates or removals easier. 
                // MUST be unique for the page. MUST be a valid HTML element id.
                // The uibuilder FE library will attempt to create an id if not provided but it will be difficult
                // to do updates if you do not set this.
                "id": "uniqueid",
                
                // Optional. Overrides master parent. If no parent given here or in outer, will be added to <body> element
                "parent": "html selector",
                
                // Optional. HTML to add to slot - if not present, the contents of msg.payload will be used. 
                // This allows multi-components to have their own slot content. 
                // However, the payload is not passed on to sub-components
                "slot": "HTML to <i>add</i> to <sup>slot</sup> instead of <code>msg.payload</code>",

                // Optional. Markdown to add to the slot. Converted Markdown is added after the standard slot.
                "slotMarkdown": "## A heading 2\n\nRendered by **marked** <sub>if loaded</sub>.\n\n```javascript\nvar x = alert('Hey Jim')\n```\n",
                
                // Optional. Each property will be applied to the element attributes
                "attributes": {
                    // Most attributes can be set however not recommended to include `onClick or similar event handlers, 
                    // specify those in the events property below ...
                },

                // Optional. properties to be added to the element. Unlike attributes, these can contain any data.
                // Take care to avoid name clashes with internal properties or bad things are likely to happen!
                "properties": {
                    // ...
                },

                // Optional. DOM Events to be added to the element
                "events": {
                    // Handler functions must already exist and be in a context reachable by the uibuilder library (e.g. window)
                    // This means that functions defined in index.js, if loaded as a module, will NOT be usable.
                    // If dynamically loading a script in the same msg, make sure it is specified first in the components list.
                    // If defining in index.js when loaded as a module, add a single window.xxxx object containing all of your callback fns
                    // All callback functions are passed a single event argument but an undeclared `event` variable is also
                    //   available inside the callback functions.
                    "click": "uibuilder.eventSend"
                    // "click": "window.myCallbacks.buttonClick1"
                }

                // Optional. You can also NEST components which allows you to easily create lists and tables
                // "components": [ ... ]
            }

            // and others as desired. Each will be added in order.
        ]
    }
}
```

### Example msgs for nested components

```jsonc
{
    "payload": "This was dynamically added 😁",
    "_ui": {
        "method": "add",
        "parent": "#start",
        "components": [
            {
                "type": "ol",
                "parent": "#start",
                "slot": "A list",
                "attributes": {
                    "id": "ol1",
                    "style": "display:block;margin:1em;border:1px solid silver;"
                },
                "components": [
                    {
                        "type": "li",
                        "slot": "A list entry"
                    },
                    {
                        "type": "li",
                        "slot": "Another list entry"
                    }
                ]
            }
        ]
    },
    "topic": "addme"
}
```

```jsonc
{
    "_ui": [
        {
            "method": "add",
            "components": [
                {
                    "type": "table",
                    "parent": "#start",
                    "attributes": {
                        "id": "t1"
                    },
                    "components": [
                        { // heading row
                            "type": "tr",
                            "components": [
                                { "type": "th", "slot": "Col 1" },
                                { "type": "th", "slot": "Col 2" },
                            ]
                        },
                        { // 1st data row
                            "type": "tr",
                            "components": [
                                { "type": "td", "slot": "Cell 1.1" },
                                { "type": "td", "slot": "Cell 1.2" },
                            ]
                        },
                        { // 2nd data row
                            "type": "tr",
                            "components": [
                                { "type": "td", "slot": "Cell 2.1" },
                                { "type": "td", "slot": "Cell 2.2" },
                            ]
                        },
                        { // a friendly caption heading
                            "type": "caption",
                            "slot": "A <b>simple</b> table example"
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Method: remove

The remove method will remove the listed HTML elements from the page assuming they can be found. The search specifier is a [CSS Selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) statement.

```jsonc
{
    "_ui": {
        "method": "remove",

        // List of component instances to remove from the page - use CSS Selector
        // - will remove the 1st match found so specify multiple times to remove more than one of same selector
        "components": [
            "selector1",
            "selector2"
            // and others as desired. Each will be removed in order.
        ]
    }
}
```

## Method: update

The update method will update the referenced HTML elements (whether native HTML, or ECMA web components). Most of the same properties as for the `add` method are available for updates.

Obviously, to update something, you must identify it. You can identify the thing(s) to update by: The HTML ID attribute, a CSS selector, an HTML name attribute or the HTML tag (type). If multiple of those identifies are provided, the priority is in that order

Unlike the other methods, the update method will find **ALL** matching elements and update them. This means that you could, for example, change the text colour of all list entries on the page with a single update.

### Msg schema

```jsonc
{
    "_ui": {
        // REQUIRED
        "method": "update",

        // List of component instances to update on the page - results in 1 or more HTML custom elements being selected and updated
        "components": [
            {
                // Only 1 of these four properties will be used to search. 
                // In the order of preference id > selector > name > type

                // The most direct way to select a single element
                "id": "...",
                // The most comprehensive and flexible way to select 1 or many elements via a CSS selector
                "selector": "...",
                // The element's name can be used instead of id - note that names might not be unique and so multiple elements may be updated
                "name": "...",
                // A generic CSS selector can be specified here as well. e.g. "div" or "p#classname", etc.
                "type": "...",
                
                // Optional. Text or HTML to add to slot - if not present, the contents of msg.payload will be used. 
                // This allows multi-components to have their own slot content. 
                // However, the payload is not passed on to sub-components
                "slot": "HTML to <i>add</i> to <sup>slot</sup> instead of <code>msg.payload</code>",

                // Optional. Markdown to add to the slot. Converted Markdown is added after the standard slot. Requires a markdown library of course.
                "slotMarkdown": "## A heading 2\n\nRendered by **marked** <sub>if loaded</sub>.\n\n```javascript\nvar x = alert('Hey Jim')\n```\n"
                
                // Optional. Each property will be applied to the element attributes
                "attributes": {
                    // Any attrib can be set but some don't make sense. Be careful when changing the id or name attrib for example.
                    "data-myattrib": "Data driven!"
                    // ... not recommended to include `onClick or similar event handlers, specify those in the events property below ...
                },

                // Optional. properties to be added to/replaced on the element. Unlike attributes, these can contain any data.
                // Take care to avoid name clashes with internal properties or bad things are likely to happen!
                // Most useful when working with ECMA Components though will work with custom front-end code as well.
                "properties": {
                    // ...
                },

                // Optional. DOM Events to be added to/replaced on the element
                "events": {
                    // Handler functions must already exist and be in a context reachable by the uibuilder library (e.g. window)
                    // This means that functions defined in index.js, if loaded as a module, will NOT be usable.
                    // If dynamically loading a script in the same msg, make sure it is specified first in the components list.
                    // If defining in index.js when loaded as a module, add a single window.xxxx object containing all of your callback fns
                    // All callback functions are passed a single event argument but an undeclared `event` variable is also
                    //   available inside the callback functions.
                    "click": "uibuilder.eventSend"
                    // "click": "window.myCallbacks.buttonClick1"
                }

                // Optional. You can also NEST components which allows you to easily create lists and tables
                // "components": [ ... ]
            }

            // and others as desired. Each will be added in order.
        ]
    }
}
```

## Method: reload - Reloads the current page

No additional data is needed.

Same as sending `msg._uib.reload`. But this method is preferred.

## Method: notify

Overlay a pop-over notification.

Old-style `msg._uib.componentRef = 'globalNotification'` also works. But this method is preferred.

Defaults to auto-timeout.

### HTML Tags

Will attach to any HTML tag/element with an ID of `toaster`. If one doesn't exist on the page, it will create a `<div id="toaster">` just after the opening `<body>` tag. The `toaster` tag will be given CSS classes of `toaster` and the `variant` if provided in `msg._ui.variant`.

A new `<div id="toast">` element is added to `toaster`.

#### Schema

variant, title/topic, payload/content, autohide, noAutoHide/autohide, autoHideDelay/delay, appendToast, modal

## Method: alert

Overlay an alert notification

Old-style `msg._uib.componentRef = 'globalAlert'` also works. But this method is preferred.

Uses the same schema and styles as the `notify` method. Except that autohide is set to false, modal is set to true and the content is prefixed by an alert symbol.

---

## References & examples

* A flow that reproduces the TABLES example from [pdfmake](http://pdfmake.org/index.html#/) (which works in a similar way to this to produce PDF reports) using uibuilder and data sent direct from Node-RED is available on the [Node-RED Flows site](https://flows.nodered.org/flow/99e1e6169b5e93b460bcbcc8f493d011#).
