---
title: Updating web UI content and attributes dynamically from Node-RED
shortTitle: Easy UI Updates
description: |
  A quick FAQ explaining the different ways to include and dynamically change data on your web pages from Node-RED.
created: 2024-06-19 10:29:37
updated: 2026-11-14 20:11:47
---

> [!TIP]
> There is something for everyone here whether you can code or not. 😁

When using front-end frameworks such as Vue, REACT, etc, including Node-RED's Dashboard, changeable web content is usually represented by a *`managed variable`* and included in the UI using something like `<p>{{varname}}</p>`, with attributes managed like `:class="somevar"`. With UIBUILDER, this is unnecessary. HTML already has everything required to do easy updates. Instead and as usual, UIBUILDER aims to help without locking you out of native methods should you want to use them.

> **Terminology**
>
> The structure of a UI in HTML is defined using `elements` which are represented in HTML as `tags`. So a paragraph element is represented by `<p>...</p>` opening and closing tags.
>
> `Attributes` are properties added to tags to give visual or data hints to the element, e.g. `<p id="p001" class="myclass">` where `id` and `class` are both <i>attributes</i> of the element. Attributes are always strings.
>
> `Dataset` is a special property of elements that allows more complex data to be attached. A data property is represented in HTML as `data-mydata` which can only be a string. However, you can use JavaScript to set data properties to anything, e.g. `el.dataset.mydata = 42`. When retrieved by `const mydata = el.dataset.mydata`, the actual value is retieved rather than the string representation.

UIBUILDER has a number of easy methods for updating your web pages based on data from Node-RED or on processing in the browser. Some of these methods will require you to be able to identify an element based on a [`CSS Selector`](/how-to/css-selectors). Others allow updates based on a Node-RED message `topic` property or on a local variable managed by uibuilder (using `uibuilder.set()`).

> [!TIP]
> In v7.3.0, all of the templates for uibuilder were updated to include a `<div id="more" uib-topic="more"></div>` element. This lets you send a message like `{topic:'more', payload:'This is some text'}` to update the content of that element. This is a great way to get started with dynamic updates without needing to know any front-end code. The payload can be simple text or HTML. More details about `uib-topic` are given in [option 1](#uibtopic) below.

> **Summary**
>
> There are basically 6 options for easy page content updates:
>
> In HTML:
>
> 1. (<i>The easiest</i>) The custom `uib-topic` *attribute* on any HTML tag will auto-process incoming data. `msg.payload` becomes the inner HTML of the element. `attributes` and `dataset` properties are also handled.
> 2. The custom `uib-var` *attribute* on any HTML tag will auto-process a managed variable of that name. If it contains a string, that becomes the inner HTML. If it is an object, `payload`, `attributes` and `dataset` properties are also handled as for `uib-topic`. While not as flexible as the web component shown next, this can be used in your HTML `<head>` section.
> 3. (<i>The most flexible</i>) The custom `<uib-var>` *component* also auto-processes data and has some additional rendering options: `text`, `html`, `markdown`, `json`, `table`, and `list`. Use this if you need more than a simple payload.
>
> In front-end JavaScript:
>
> 4. Front-end JavaScript code can listen for incoming data manually using the `uibuilder.onChange('msg', (msg)=>{...})` or `uibuilder.onTopic('topicname', (msg)=>{...})` functions.
>
> 5. JavaScript code can easily update your web page using standard web API functions or uibuilder helper functions.
>
>   e.g. `document.getElementById('p001').innerHTML = msg.payload;`
>
>   or `$('#p001').innerHTML = msg.payload;` (uses a [uibuilder helper similar to JQuery](client-docs/functions#dollar))
>
> In Node-RED:
>
> 6. No-code and low-code _nodes_ such as `uib-element` and `uib-update` can directly update identifiable on-page elements. Make sure you add HTML ID attributes to any element you want to control (`uib-element` does this by default).
>
> Options 1, 2, and 3 are described below. Option 4 is described in the client documentation [onChange](/client-docs/features#onchangecancelchange-functions)/[onTopic](/client-docs/features#ontopiccanceltopic-functions), option 5 is vanilla HTML and option 6 is described in [Dynamic, config-driven UI's](/client-docs/config-driven-ui) and [uib-update](/nodes/uib-update).

> [!TIP]
> As of v7, clients automatically _filter_ incoming messages based on `pageName`, `clientId`, and `tabId` properties either in `msg._ui` or `msg._uib`. This means that you can send messages to specific clients or pages without needing to filter them in your flows. This is particularly useful when you have multiple clients connected to the same Node-RED instance. You can get the properties from the control message received in Node-RED when a client connects. You can also see them in all received messages if you turn on the `msg._uib` option in the advanced tab of the uibuilder node.

> [!NOTE]
> See [Reactive UI's](/client-docs/reactive.md) for additional information on these and other supported reactive attributes.

## 1) Using the `uib-topic` custom HTML _attribute_ :id=uibtopic

UIBUILDER introduces a custom _attribute_ `uib-topic` (or `data-uib-topic` if you prefer) for any HTML element.

Using this _attribute_ on *any* HTML tag, enables content and attributes to be updated automatically with a simple message from Node-RED. This is generally **the easiest method for updating your web page based on data from Node-RED**.

For example, including `<p uib-topic="mytopic">No message</p>` in your HTML and then, in Node-RED, sending a message to the uibuilder node containing a `msg.payload` of *"Hello from Node-RED"* and a topic of *"mytopic"*, will replace the *"No message"* text with the hello message.

Include a `msg.attributes` property to automatically update the elements attributes. For example if `msg.attributes` contains `{class:"myclass", style:"color:red;"}`, the elements class and style attributes will be updated accordingly. `msg.attributes.class` can be a string (replaces all classes) or an Array (adds the classes). `msg.attributes.style` can be a string (replaces all styles) or an Array or Object (adds styles).

Any of these msg properties will be processed: `attributes`, `dataset`, `checked`, and `value`. `dataset` allows data other than a string to be attached to the element. `checked` only applies to checkbox and radio button inputs, `value` only applies to other inputs.

You may also use the `data-before` and `data-after` attributes on the element. These provide text/html to display before/after the content. They are of particular use when used in the HTML `<head>` section on `<meta>`, `<title>`, etc. tags. E.g. `<div uib-topic="myTemperature" data-before="Temp: " data-after="℃">`. HTML text can be included but is generally best avoided if possible as it can get confusing.

> [!NOTE]
> HTML element individual attributes are **always** text strings. If you use any other data type, it will be converted to a string. `msg.attributes` itself MUST be an object. `dataset` applies `data-*` string equivalent attributes but the actual data is available to JavaScript using `el.dataset`.
>
> Using the `uib-topic` attribute allows text or HTML content in `msg.payload`, it does *not* allow Markdown content (use the [`<uib-var>`](#uibvarcomponent) custom component for that). However, content is still sanitised if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded.

> [!WARNING]
> When processing inner HTML (e.g. from `msg.payload`), the content is processed as an HTML _inclusion_. This means that `<script>` elements _will_ also be processed and the script will be executed.
>
> To avoid security issues, it is advisable to include the `DOMPurify` 3rd-party library before loading the `uibuilder` client library. Any content will then be purified by that library.

More detail on this attribute can be found on the [Reactive UI's](client-docs/reactive#uib-topic) page.

## 2) Using the `uib-var` custom HTML _attribute_ :id=uibvar

This performs the same processing as the `uib-topic` _attribute_ except that it takes a uibuilder managed _variable_ instead of a message topic. The variable's value can be a simple string which will replace the inner HTML content of the element or it can be an object where the payload property will be the inner HTML (if present) and any `attributes`, `dataset`, `checked`, and `value` properties are also processed in the same way as for `uib-topic`.

Properties of a larger object may be used, e.g. `uib-var="myvar.prop1"` or `uib-var="myvar['prop1']"`. If so and if additional attributes, etc. are desired, they must be set on that property, not on the parent, e.g. `myvar.prop1.payload`, etc.

Note the warning above about script element processing.

> [!TIP]
> You can set managed variables directly from Node-RED if you don't want to use any front-end JavaScript. Send a message to the uibuilder node like this: `{"command": "set", "prop": "myvar", "value": 'Hello'}` or `{"command": "set", "prop": "myvar", "value": {payload:'Hello', attributes:{style:"color:yellow;"}}}`. Generally though, it is easier to use the `uib-topic` attribute and then you can send an ordinary message with the appropriate topic.

More detail on this attribute can be found on the [Reactive UI's](client-docs/reactive#uib-var) page.

## 3) Using the `<uib-var>` custom _web component_ :id=uibvarcomponent

UIBUILDER also includes its own *custom* web element [`<uib-var>`](/client-docs/custom-components#uib-var). Detailed on the [Custom Compontents](client-docs/custom-components#uib-var) page.

It is used by including its tag in your HTML. For example `<uib-var topic="mytopic"></uib-var>` or `<uib-var variable="myvarname"></uib-var>`.

It has a number of additional features over using the simpler `uib-topic` attribute:

* You can use either a set `topic` or a managed variable. One that is updated using `uibuilder.set('varname', value)` locally or a command from Node-RED to update the content.
* You can use the `filter` attribute to get a JavaScript function to generate, alter, or format output. Great for formatting numbers or dates or to add ℃ to temperature outputs, etc.
* It can show HTML, plain text, Markdown (if the [Markdown-IT library](/client-docs/readme#_2-markdown-it-converts-markdown-markup-into-html) is loaded) or a formatted JSON object as content. It can also display a _table_ or _list_ of items from an array or object.
* It can let Node-RED know when the variable changes (great for allowing change from a number of different sources including front-end code).
* Will sanitise any HTML updates if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded. Good if you are allowing HTML/Markdown content to be defined by user input.

See the [custom components documentation](/client-docs/custom-components#uib-var) for further details.

> [!TIP]
> Variables managed by the uibuilder client library can be set from Node-RED as well as via `uibuilder.set` in front-end code.
> From Node-RED, send a msg containing `msg._uib` containing something like `{command: 'set', prop:'varname', value: 'some value'}`

> [!NOTE]
> Unlike using the `uib-topic` custom attribute, the `<uib-var>` web component does not include a direct feature for updating the element attributes from a Node-RED msg.
> Make sure that the tag has an `id` attribute and use a `uib-update` node in Node-RED if you need to be able to dynamically update attributes.
> This is likely to be added as a feature in the future.


## Adding elements

You can *add an element* to a page in a variety of ways:

1. Node-RED coding
   1. No-code methods
      1. The `uib-element` node will create many different types of compound elements. The required ID property defines the outer wrapper of the element tree. This can sometimes make inner content difficult to remember, use the browser's Dev Tools to view the delivered structure of the page.
      2. The `uib-tag` node lets you add a single element of any type. The element's content (slot) can be HTML or even Markdown (which is rendered to HTML on the server).
   2. Low-code methods - create your own low-code JSON or amend the output of one or more no-code nodes. This lets you create any number of elements of any complexity. Use one of the no-code nodes temporarily to get some example JSON to follow.
2. Front-end coding
   1. Add HTML in the `index.html` file. This is simple and gives you a decent visual picture of the hierarchy of the elements on the page but requires a little knowledge of HTML.
   2. Use native DOM or uibuilder UI (low-code) methods in a JavaScript script.

The safest "blank" elements to use should you need something are one of these:

* `div` - "division" is a block (multi-line) element like a paragraph but often with minimal formatting.
* `p` - Like a `div`, it creates a block. However, it has a little more formatting than a `div`.
* `span` - A span is an in-line element and is great if you need dynamic variable text

Some other useful structural elements are:

* `article` - the default uibuilder styling makes this into a "card" style block. You can put pretty much anything else inside it though an `<h2>`, or other heading level will be given some additional styling to fit in with the card style.
* `<header>`, `<main>`, `<footer>` - Using these will center content on the page and limit the width to something easy to read.

If you want to create an easy grid layout (similar to the Node-RED Dashboard extensions), read the [Grid Layouts](creating-uis/grid-layouts) page. There are also Grid (Dashboard style) and Content (news or blog style) layout example flows in the Node-RED Examples library.

> [!TIP]
> When creating a web page, make sure to create a logical nested hierarchy of elements, especially for `<h2>`-`<h6>` paragraph heading tags. UIBUILDER generally creates the single allowed `<h1>` and good practice is not to go below `<h4>` generally. Creating logical hierarchies is important for accessibility and dynamic processing.

## Amending elements

### From Node-RED

In order of ease of use:

* By far the simplest method is to use either the `uib-topic` custom attribute on any element, or the `<uib-var topic="mytopic">` custom element. Both allow a simple message to be sent to a uibuilder node containing a specified `msg.topic` and the UI will be updated automatically.

* The `uib-var` custom attribute, or the `<uib-var variable="myvar">` custom element. To use this from Node-RED, you have to use remote "set" commands from Node-RED.

* The `uib-update` node. This requires that you know how to _select_ something on your page using CSS Selectors. The browser Dev Tools can help identify selectors. Ideally, add an HTML ID to any element you want to change, the selector then becomes `#myid`.

* Use the same kind of `msg._ui` output that the `uib-update` node produces in your own low-code flows. Or even use `uib-update` and then make custom changes to the JSON.

### From front-end code

* Using `uib-topic` custom attribute, or `<uib-var topic="mytopic">`, create a synthetic `msg`. e.g. `uibuilder.set('msg', {topic: mytopic, payload: 'Hello'})`

* Using `uib-var` custom attribute, or `<uib-var variable="myvar">` set a uibuilder managed variable. e.g. `uibuilder.set('myvar', 'Hello')`

* Listen for msg from Node-RED (`uibuilder.onChange('msg', ...)` or `uibuilder.onTopic()` and either update directly using HTML API's or using the methods above.

  The "traditional" way to do things is to use the `uibuilder.onChange('msg', (msg) => { ... })` function to capture and process messages from Node-RED, you can directly update the UI. But as you can see, there are now much easier methods as well.

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

* Use uibuilder's low-code JSON with `uibuilder.ui(someJson)` to update things using the same low-code JSON as from Node-RED but this is only really useful for more complex changes. Use a temporary `uib-element` node to generate some example JSON to get you started. This allows any additions, changes and removals to the page so is very powerful wihout needing to fully learn HTML but you do need to learn how to structure the JSON. The JSON schema used closely mirrors HTML but avoids many of the complexities and inconsistencies.
