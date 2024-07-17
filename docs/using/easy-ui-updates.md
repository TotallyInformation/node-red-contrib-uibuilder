---
title: Updating web UI content and attributes dynamically from Node-RED
description: |
  A quick FAQ explaining the different ways to include and dynamically change data on your web pages from Node-RED.
created: 2024-06-19 10:29:37
updated: 2024-07-17 17:12:00
---

> [!TIP]
> There is something for everyone here whether you can code or not. 😁

When using front-end frameworks such as Vue, REACT, etc, including Node-RED's Dashboard, changeable web content is usually represented by a *managed variable* and included in the UI using something like `<p>{{varname}}</p>`. With UIBUILDER, this is unnecessary. HTML already has everything required to do easy updates. Instead and as usual, UIBUILDER aims to help without locking you out of native methods should you want to use them.

The structure of a UI in HTML is defined using `elements` which are represented in HTML as `tags`. So a paragraph element is represented by `<p>...</p>` opening and closing tags. *Attributes* are properties added to tags to give visual or data hints to the element, e.g. `<p id="p001" class="myclass">` where `id` and `class` are both _attributes_ of the element.

UIBUILDER has a number of easy methods for updating your web pages based on data from Node-RED or on processing in the browser. Some of these methods will require you to be able to identify an element based on a [CSS Selector](/how-to/css-selectors). Others allow updates based on a Node-RED message `topic` property or on a local variable managed by uibuilder.

There are basically 4 options for easy page content updates:

In HTML:

1. The custom `uib-topic` attribute on any HTML tag will auto-process incoming data.
2. The custom `<uib-var>` component also auto-processes data and has some additional rendering options: text, HTML, Markdown, json, table, and list.

In front-end JavaScript:

3. Front-end JavaScript code can listen for incoming data manually using the `uibuilder.onChange('msg', (msg)=>{...})` or `uibuilder.onTopic('topicname', (msg)=>{...})` functions. JavaScript code can easily update your web page using standard web API functions or uibuilder helper functions.

In Node-RED:

4. No-code and low-code nodes can directly update identifiable on-page elements.

Options 1 and 2 are described here. Option 3 is described in the client documentation [onChange](/client-docs/features#onchangecancelchange-functions)/[onTopic](/client-docs/features#ontopiccanceltopic-functions) and option 4 in [Dynamic, config-driven UI's](/client-docs/config-driven-ui)/[uib-update](/nodes/uib-update)

## 1) Using the `uib-topic` attribute :id=uibtopic

UIBUILDER introduces a custom attribute `uib-topic` (or `data-uib-topic` if you prefer) for any HTML element.

Using this attribute on *any* HTML tag, enables content and attributes to be updated automatically with a simple message from Node-RED. This is generally the easiest method for updating your web page based on data from Node-RED.

For example, including `<p uib-topic="mytopic">No message</p>` in your HTML and then, in Node-RED, sending a message to the uibuilder node containing a `msg.payload` of *"Hello from Node-RED"*, will replace the *"No message"* text with the hello message.

Include a `msg.attributes` property to automatically update the elements attributes. For example if `msg.attributes` contains `{class:"myclass", style:"color:red;"}`, the elements class and style attributes will be updated accordingly.

> [!NOTE]
> HTML element attributes are **always** text strings. If you use any other data type, it will be converted to a string.
>
> Using the `uib-topic` attribute allows text or HTML content in `msg.payload`, it does not allow Markdown content. However, content is still sanitised if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded.

## 2) Using the `uib-var` custom web component :id=uibvar

UIBUILDER also includes its own *custom* web element [`<uib-var>`](/client-docs/custom-components#uib-var). 

It is used by including its tag in your HTML. For example `<uib-var topic="mytopic"></uib-var>` or `<uib-var variable="myvarname"></uib-var>`.

It has a number of additional features over using the simpler `uib-topic` attribute: 

* You can use either a set `topic` or a managed variable. One that is updated using `uibuilder.set('varname', value)` locally or a command from Node-RED to update the content. You can even use a JavaScript function to generate or format output.
* It can show HTML, plain text, Markdown (if the [Markdown-IT library](/client-docs/readme#_2-markdown-it-converts-markdown-markup-into-html) is loaded) or a formatted JSON object as content.
* It can let Node-RED know when the variable changes (great for allowing change from a number of different sources including front-end code).
* It allows for _filters_ to be applied to the content to alter the display. Great for formatting numbers or dates for example.
* Will sanitise any HTML updates if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded. Good if you are allowing HTML/Markdown content to be defined by user input.

See the [custom components documentation](/client-docs/custom-components#uib-var) for further details.

> [!TIP]
> Variables managed by the uibuilder client library can be set from Node-RED as well as via `uibuilder.set` in front-end code.
> From Node-RED, send a msg containing `msg._uib` containing something like `{command: 'set', prop:'varname', value: 'some value'}`

> [!NOTE]
> Unlike using the `uib-topic` custom attribute, the `<uib-var>` web component does not include a direct feature for updating the element attributes from a Node-RED msg.
> Make sure that the tag has an `id` attribute and use a `uib-update` node in Node-RED if you need to be able to dynamically update attributes.
> This is likely to be added as a feature in the future.


So to be able to control and change both the content (the stuff between the opening and closing tag, often referred to as the "slot" content) or the attributes, we need to be able to get a reference to the element. Mostly, this is done using ["CSS Selectors"](https://totallyinformation.github.io/node-red-contrib-uibuilder/#/how-to/css-selectors) and the simplest method is to ensure that the element has an `id` attribute from the outset. Example: `<p id="p001"></p>` has a unique CSS selector of `#p001`.

Now that we know _what_ to use and _how_ to get a reference to it, we know that we can use _any_ element in our UI and easily change both its content and attributes. Note that if you are using UIBUILDER's standard templates, they all have a `<div id="more"></div>` element, so you can always use that for playing with things.

In the following, we will use the `more` div as the example element.

## Adding elements

You can *add an element* to control in a variety of ways:

1. Node-RED coding
   1. No-code methods
      1. `uib-element` node will create many different types of compound elements. The required ID property defines the outer wrapper of the element tree. This can sometimes make inner content difficult to remember.
      2. `uib-tag` lets you add a single element of any type. The element's content (slot) can be HTML or even Markdown.
   2. Low-code methods - create your own low-code JSON or amend the output of one or more no-code nodes. This lets you create any number of elements of any complexity.
2. Front-end coding
   1. Hard code in the `index.html` file. This is simple and gives you a decent visual picture of the hierarchy of the elements on the page but requires a little knowledge of HTML.
   2. Use native DOM or uibuilder UI (low-code) methods in a JavaScript script.

The safest "blank" elements to use are one of these:

* `div` - "division" is a block (multi-line) element like a paragraph but often with minimal formatting.
* `span` - A span is an in-line element and is great if you need dynamic variable text


## Amending elements

Now that you have something to work with, here are the ways you can make changes.

### From Node-RED

By far the simplest method is to use either the `uib-topic` custom attribute on any element, or the `<uib-var>` custom element. Both allow a simple message to be sent to a uibuilder node containing a specified `msg.topic` and the UI will be updated automatically.

...the `uib-update` node.

Alternatively, you can use the same kind of `msg._ui` output that the `uib-update` node produces in your own low-code flows.

If using the `<uib-var>` custom tag, you could instead simply update the value of the variable given to that tag as described in the previous section.

### From front-end code

synthetic msg
set managed var
listen for msg from Node-RED

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
