---
title: Reactivity - dynamic HTML attributes
description: |
  UIBUILDER introduces various reactive attributes to HTML that make it easier to create dynamic web pages using data from Node-RED with minimal code.
created: 2025-06-14 12:53:20
updated: 2025-06-14 13:27:48
status: draft
since: v7.5.0
author: Julian Knight (Totally Information)
---

Front-end reactive attributes are like a very simplified version of VueJS, REACT, etc reactive attributes. They are loosely modelled on AlpineJS.

> [!NOTE]
> UIBUILDER's reactive attributes are not a full implementation of a reactive framework. They are intended to be simple and easy to use, without the need for a build step or complex configuration.
> 
> In particular, they are not optimised for very large or complex applications. For those, you should consider using a full framework such as VueJS, REACT, Svelte, etc. However, for most UI's you are likely to create with Node-RED, the reactive attributes should be more than sufficiently performant and easy to use.

> [!TIP]
> See [Easy UI Updates](/using/easy-ui-updates.md) for more ideas on how to update your UI dynamically from Node-RED using UIBUILDER.

## Attribute summary

The following attributes are available to make HTML elements reactive. They can be used in any HTML element, including custom components.

| Attribute | Description |
|-----------|-------------|
| [`uib-topic`](#uib-topic) | This attribute enables very easy updates of any HTML element by creating a background listener for Node-RED messages having a matching `msg.topic`.  |

## uib-topic

The `uib-topic` (or `data-uib-topic` if preferred) attribute enables very easy updates of any HTML element by creating a background listener for Node-RED messages having a matching `msg.topic`. 

Using this _attribute_ on *any* HTML tag, enables content and attributes to be updated automatically with a simple message from Node-RED. This is generally the easiest method for updating your web page based on data from Node-RED.

For example, including `<p uib-topic="mytopic">No message</p>` in your HTML and then, in Node-RED, sending a message to the uibuilder node containing a `msg.payload` of *"Hello from Node-RED"* and a topic of `mytopic`, will replace the *"No message"* text with the hello message.

Include a `msg.attributes` property to automatically update the elements attributes. For example if `msg.attributes` contains `{class:"myclass", style:"color:red;"}`, the elements class and style attributes will be updated accordingly.

> [!NOTE]
> HTML element attributes are **always** text strings. If you use any other data type, it will be converted to a string.
>
> Using the `uib-topic` attribute allows text or HTML content in `msg.payload`, it does *not* allow Markdown content. However, content is still sanitised if the [DOMPurify library](/client-docs/readme#_1-dompurify-sanitises-html-to-ensure-safety-and-security) is loaded.

> [!TIP]
> The UIBUILDER templates all include an empty `div` element with the `uib-topic` attribute set to `more` (to match its `id`).

### Supported message properties

* `topic` - the topic to listen for. This must be a string.
* `payload` - the payload to set the element's inner HTML to. This can be a string, number, or boolean. If it is a string, it will be set as the inner HTML of the element. If it is a number or boolean, it will be converted to a string and set as the inner HTML of the element.
* `attributes` - an object containing additional attributes to set on the element. The keys of the object are the attribute names and the values are the attribute values. This can be used to set any HTML attribute on the element, including custom attributes.
* `dataset` - an object containing additional data attributes to set on the element. The keys of the object are the data attribute names (prefixed with `data-`) and the values are the attribute values. This can be used to set any data attribute on the element, including custom attributes.
