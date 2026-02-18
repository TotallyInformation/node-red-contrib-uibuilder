---
title: Reactivity - dynamic HTML attributes
description: |
  UIBUILDER introduces various reactive attributes to HTML that make it easier to create dynamic web pages using data from Node-RED with minimal code.
created: 2025-06-14 12:53:20
updated: 2026-02-17 20:45:48
since: v7.5.0
author: Julian Knight (Totally Information)
---

Front-end reactive attributes are like a very simplified version of VueJS, REACT, etc reactive attributes. They are (very) loosely modelled on AlpineJS.

> [!NOTE]
> UIBUILDER's reactive attributes are not a full implementation of a reactive framework. They are intended to be simple and easy to use, without the need for a build step or complex configuration.
>
> In particular, they are not optimised for extremely large applications (with many thousands of reactive elements). For those, you should consider using a full framework such as VueJS, REACT, Svelte, etc. However, for most UI's you are likely to create with Node-RED, the reactive attributes should be more than sufficiently performant and easy to use.
>
> The reactive attributes should work on virtually all HTML elements, including those in the `<head>` section. This is unlike the `<uib-var>` web component which will only work inside HTML elements that allow other elements inside.

> [!TIP]
> See [Easy UI Updates](/using/easy-ui-updates.md) for more ideas on how to update your UI dynamically from Node-RED using UIBUILDER.

## Attribute summary

The following attributes are available to make HTML elements reactive. They can be used in any HTML element, including custom components.

| Attribute | Description |
|-----------|-------------|
| [`uib-topic`](#uib-topic) | This attribute enables very easy updates of any HTML element by creating a background listener for Node-RED messages having a matching `msg.topic`.  |
| `uib-var` | This is somewhat similar to the [`<uib-var>` web component](client-docs/custom-components#uib-var) . It allows you to specify any uibuilder-managed variable name with or without properties. |

## uib-topic (since v7.5) :id=uib-topic

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

### Supported message properties

* `topic` - _Required_. The topic to listen for. This must be a string.
* `payload` - the payload to set the element's inner HTML to. This can be a string, number, or boolean. If it is a string, it will be set as the inner HTML of the element. If it is a number or boolean, it will be converted to a string and set as the inner HTML of the element.
* `attributes` - an object containing additional attributes to set on the element. The keys of the object are the attribute names and the values are the attribute values. This can be used to set any HTML attribute on the element, including custom attributes.
* `dataset` - an object containing additional data attributes to set on the element. The keys of the object are the data attribute names (prefixed with `data-`) and the values are the attribute values. This can be used to set any data attribute on the element, including custom attributes.

### Examples

```html
<div uib-topic="some/useful/topic/name">
    No input yet received
</div>
```



## uib-var (since v7.6) :id=uib-var

> [!CAUTION]
>
> Variables referenced in this attribute **must** be UIBUILDER-managed. e.g. set with `uibuilder.set('varName', value)`.  Managed variables can also be set remotely from Node-RED (see [Controlling from Node-RED](client-docs/control-from-node-red)), however, note the potential delay in receiving remote updates as the variable might not be set when the page loads and so users may get a flash of the default content.

> [!TIP]
>
> The `uib-var` attribute is not as powerful as the `<uib-var>` web component. However, unlike the component, this attribute can be used pretty much anywhere in your HTML, including tags in the `<head>` section such as `<title>`,  `<meta>` and `<link>`.

### Supported Variable Properties

If the variable's value is not an object, the content will be treated as the inner HTML of the host element.

If the value is an object, the same properties as for [`uib-topic`  above](#supported-message-properties) are supported.

### Examples

```html
<div uib-var="myvar"></div>
```

```html
<span uib-var="myvar.aprop"></span>
```

```html
<span uib-var="myvar['bprop']"></span>
```

```html
<html lang="en">
    <head>
    	<meta charset="UTF-8">
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

## Experimental attributes

### uib-if (v7.6) :id=uib-if

This adds simplistic conditional display.

> [!NOTE]
>
> This does not _remove_ HTML from the DOM, it only makes it invisible to the user, it still exists in the HTML and can be viewed via the browser developer tools.

The value of the attribute must be a simple JavaScript statement that returns a Boolean (true or false). The statement can reference any uibuilder managed variable.

> [!WARNING]
>
> This really is experimental, use at your own risk. Processing may change in future releases.

> [!TIP]
>
> As with all of the reactive HMTL attributes, processing starts shortly after the page loads. If your statement isn't working as expected, first check that your variables are updating soon enough.

#### Examples

This will only show the blockquote if one or the other uibuilder managed variable property is present.

```html
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

