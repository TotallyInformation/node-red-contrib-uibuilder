---
title: Reactivity - dynamic HTML attributes & custom web components
description: |
  Make your web page react without code to changes to data or messages from Node-RED. UIBUILDER for Node-RED has two types of reactivity for your HTML pages over-and-above HTML/JavaScript native capabilities. These special additions enhance HTML without the need for JavaScript programming knowledge.
created: 2025-06-14 12:53:20
updated: 2026-11-14 12:09:47
since: v7.5.0
author: Julian Knight (Totally Information)
---

1. [Custom _attributes_](custom-attributes) that are added to standard HTML elements/tags. These can replace the inner HTML of the element and manipulate other attributes.
1. [Custom _web components_](custom-web-components) that add new HTML elements.

## Custom Attributes

Front-end reactive attributes are like a very simplified version of VueJS, REACT, etc reactive attributes (e.g. VueJS's `:styles="..."`). They are (very) loosely modelled on AlpineJS.

> [!NOTE]
> UIBUILDER's reactive attributes are not a full implementation of a reactive framework. They are intended to be simple and easy to use, without the need for a build step or complex configuration.
>
> The reactive attributes should work on virtually all HTML elements, including those in the `<head>` section. This is unlike the [`<uib-var>` web component](client-docs/custom-components#uib-var) which will only work inside HTML elements that allow other elements inside.
>
> They are not optimised for _extremely_ large applications (with many thousands of reactive elements). For those, you should consider using a full framework such as VueJS, REACT, Svelte, etc. However, for most UI's you are likely to create with Node-RED, the reactive attributes should be more than sufficiently performant and easy to use.
>

> [!TIP]
> See [Easy UI Updates](/using/easy-ui-updates.md) for more ideas on how to update your UI dynamically from Node-RED using UIBUILDER.

### Attribute summary

The following attributes are available to make HTML elements reactive. They can be used in any HTML element, including custom components.

| Attribute | Description |
| ----------- | ------------- |
| [`uib-topic`](#uib-topic) | This attribute enables very easy updates of any HTML element by creating a background listener for Node-RED messages having a matching `msg.topic`. |
| [`uib-var`](#uib-var) | This is somewhat similar to the [`<uib-var>` web component](client-docs/custom-components#uib-var) . It allows you to specify any uibuilder-managed variable name with or without properties. |
| [`uib-if`](#uib-if) | Specify a uibuilder-managed variable name with or without properties. When the variable is thruthy, the innerHTML of the element will be visible, otherwise it is hidden. |

### uib-topic attribute (since v7.5) :id=uib-topic

The `uib-topic` (or `data-uib-topic` if preferred) attribute enables very easy updates of any HTML element by creating a background listener for Node-RED messages having a matching `msg.topic`.

Using this _attribute_ on *any* HTML tag, enables content and attributes to be updated automatically with a simple message from Node-RED. This is generally the easiest method for updating your web page based on data from Node-RED.

For example, including `<p uib-topic="mytopic">No message</p>` in your HTML and then, in Node-RED, sending a message to the uibuilder node containing a `msg.payload` of *"Hello from Node-RED"* and a topic of `mytopic`, will replace the *"No message"* text with the hello message.

Include a `msg.attributes` property to automatically update the elements attributes. For example if `msg.attributes` contains `{class:"myclass", style:"color:red;"}`, the elements class and style attributes will be updated accordingly.

> [!NOTE]
> HTML element attributes are **always** text strings. If you use any other data type, it will be converted to a string.
>
> Using the `uib-topic` attribute allows text or HTML content in `msg.payload`, it does *not* allow Markdown content. However, content is still sanitised if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded.
>
> If you need more control, see the [`<uib-var>` web component](client-docs/custom-components#uib-var) with the `topic` attribute which does similar processing but has a lot more control such as allowing different types out output, including Markdown translation. That can only be used with HTML elements that allow HTML tags inside their content slot whereas this attribute can be used in most places including in the HTML `<head>` for tags like `<meta>` or `<link>`.

> [!TIP]
> The UIBUILDER templates all include an empty `div` element with the `uib-topic` attribute set to `more` (to match its `id`).

This attribute can be used anywhere in your HTML, including the `<head>` such as with `<title>` or `<meta>` tags.

#### Supported message properties

Property names other than those listed here are ignored.

* `topic` - _Required_. The topic to listen for. This must be a string.
* `payload` - the payload to set the element's inner HTML to. This can be a string, number, or boolean. If it is a string, it will be set as the inner HTML of the element. If it is a number or boolean, it will be converted to a string and set as the inner HTML of the element.
* `attributes` - an object containing additional attributes to set on the element. The keys of the object are the attribute names and the values are the attribute values. This can be used to set any HTML attribute on the element, including custom attributes.
* `checked` - The value for an HTML checkbox or radio button element
* `value` - The value for any other input HTML element
* `dataset` - an object containing additional data attributes to set on the element. The keys of the object are the data attribute names (prefixed with `data-`) and the values are the attribute values. This can be used to set any data attribute on the element, including custom attributes.

    > [!NOTE]
    > Using camelCase or PascalCase names (e.g. `myData`)in the dataset object will result in both a lower cased and a kebab-cased data-* attribute being added to the HTML element. However, when accessed from JavaScript via `el.dataset`, they have the correct casing. Just another confusing aspect of HTML 🤷.
    >
    > Use `dataset.before` and/or `dataset.after` to add pre and post text (or HTML) to the output. Alternatively, add `data-before` or `data-after` to the general attributes. Either form will work.


#### Examples

```html
<div uib-topic="some/useful/topic/name">
    No input yet received
</div>
<div uib-topic="dev001/temperature" data-after="℃">--</div>
```

#### Technical notes

Most people will not need these notes.

This custom attribute adds a `uib.topicWatch` property to the target HTML element. This can be viewed in the browser developer tools. It is used to retain the uibuilder topic change watcher so that it can be cancelled/replaced as needed.

### uib-var attribute (since v7.6) :id=uib-var

Since v8.0.0, the processing for this attribute is identical to that of the `uib-topic` attribute excepting that this takes a uibuilder managed variable instead of a message with a specific topic.

> [!CAUTION]
>
> Variables referenced in this attribute **must** be UIBUILDER-managed. e.g. set with `uibuilder.set('varName', value)`.  Managed variables can also be set remotely from Node-RED (see [Controlling from Node-RED](client-docs/control-from-node-red)), however, note the potential delay in receiving remote updates as the variable might not be set when the page loads and so users may get a flash of the default content.
>
> If the client fails to find the variable when processing the attribute, it will log a warning to the console and try again after a short delay. This is to allow for the variable to be set after the page loads, which is common when variables are set remotely from Node-RED. If the variable is still not found after several attempts, it will give up and log an error to the console.

> [!TIP]
>
> The `uib-var` attribute is not as powerful as the [`<uib-var>` web component](client-docs/custom-components#uib-var). However, unlike the component, this attribute can be used pretty much anywhere in your HTML, including tags in the `<head>` section such as `<title>`,  `<meta>` and `<link>`.

#### Supported Variable Properties

If the variable's value is _not an object_, the content will be treated as the inner HTML of the host element (e.g. the `payload`). If the value is an _object_, the same properties as for [`uib-topic`  above](#supported-message-properties) are supported.

#### Examples

```html
<!-- If using ESM, the JS script code must be in index.mjs -->
<script>uibuilder.set('myvar', 'Well hello there!')</script>
<div uib-var="myvar"></div>
```

```html
<script>
    // Simple string or data and attributes
    // Note that, to set attributes/dataset with a nested property, the nested prop has to be an object
    uibuilder.set('myvar', { aprop: 'Hi' }, bprop: { payload: 'Hi', attributes: { style: 'color: red;' } } )
</script>
<span uib-var="myvar.aprop"></span>
<!-- Dot and [] styles supported -->
<span uib-var="myvar['bprop']"></span>
```

```html
<!-- Example from Markweb page template -->
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <!-- When used with meta, payload replaces the `content` attribute -->
        <meta name="description"
              uib-var="pageData.description"
              content="No description for this page."
        >
        <title uib-var="pageData.title">No title</title>
        ...
    </head>
    <body>
       ... 
    </body>
</html>
```

#### Technical notes

Most people will not need these notes.

This custom attribute adds a `uib.varWatch` property to the target HTML element. This can be viewed in the browser developer tools. It is used to retain the uibuilder managed variable change watcher so that it can be cancelled/replaced as needed.

### uib-if (v8.0.0) :id=uib-if

This adds a simplistic conditional display.

Unlike the other custom attributes, the content of the attribute can be simple JavaScript but it must return true or false. Any variables must be uibuilder managed.

> [!NOTE]
>
> This does not _remove_ HTML from the DOM, it only makes it invisible to the user, it still exists in the HTML and can be viewed via the browser developer tools.

The value of the attribute must be a uibuilder managed variable that returns a Boolean (true or false).

> [!TIP]
> As with all of the reactive HTML attributes, processing starts shortly after the page loads the uibuilder client library. If your statement isn't working as expected, first check that your variables are updating soon enough. If you get a flash of content that should be hidden (the default is hidden), you may need to apply a class override `class="hidden"` or a style override `style="display: none"` in your HTML. `uib-if` will replace the display class override, since this is more specific than a class, it still works.

#### Examples

Hide from page load:

```html
<div uib-if="hideme" class="hidden">Hidden until the "hideme" var is set to true, hides again when false</div>
```

Only show the blockquote if one or the other uibuilder managed variable property is present. Uses some simple JavaScript that evaluates to true or false. The execution is wrapped in a safe wrapper to prevent security problems. Variables must be uibuilder-managed.

```html
<!-- Using Markweb's pageData managed variable -->
<blockquote class="visible-status"
    uib-if="pageData.status !== undefined || pageData.since !== undefined"
>
    <uib-var
        variable="pageData.status"
        data-before="Status: "
        data-after=". "
 ></uib-var>
    <uib-var
        variable="pageData.since"
        data-before="Since: "
        data-after=". "
    ></uib-var>
</blockquote>
```

### Experimental attributes

#### `uib-bind` (Not yet released) :id=uib-bind

<b>Not yet available</b>

Similar to VueJS's bind feature, e.g. `<div :style="some js">`. However, this will only likely suport the use of a single uibuilder managed variable set using `uibuilder.set('varname', value)` rather than a JavaScript expression.This allows you to decouple the actual HTML attribute value and makes it dynamically settable from JavaScript without needing to know the appropriate HTML API.

## Custom web components

### `<uib-var>` :id=uib-var-component

This is described in detail on the [Custom Components page](client-docs/custom-components#uib-var).

This custom component performs a super-set of the custom attributes and so may be preferred for more complex tasks. However, as a custom HTML component, it can only be used in the page's `<body>` section. Unlike the custom attributes which can be used in the `<head>` section as well.
