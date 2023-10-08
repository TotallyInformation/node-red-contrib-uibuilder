---
title: Custom web components
description: >
   Web components built into the UIBUILDER client and information about external web components.
created: 2023-10-08 13:44:56
lastUpdated: 2023-10-08 14:59:10
---

UIBUILDER can work with front-end frameworks such as REACT, VueJS, etc. However, it does not need them. But one thing that these frameworks often have are collections of components that you can add to your HTML. Each component will produce something useful in your web page such as an information card, tabbed interface, navigation menu, etc.

For more modern browsers though, there is an alternative to a framework and that is "[web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components)". These are a W3C international standard and they are defined using JavaScript.

The [`uib-var`](#uib-var-include-a-managed-variable-in-the-page) built-in component is an example of such a component.

To make use of a web component, all that is needed is to load it. Web components are written as ES Modules (ESM). In this form, you can only use them with the ESM version of the uibuilder client library and they will need loading as an `import` statement in your module `index.js` just like the client library itself. (`uib-var` is loaded for you, you don't have to do anything).

However, some components may also be built so that they can be loaded as a linked script. This is easily done using a build tool such as [`esbuild`](https://esbuild.github.io/). When built this way, they can be used with the standard IIFE version of the uibuilder client library. A well-crafted component will often include a version for loading this way but it is up to the author to make this available. Check the component's documentation for details.

> [!NOTE]
> UIBUILDER's no-code `uib-element` node currently sends out low-code JSON data that describes each element. While this is reasonably efficient since no actual HTML/JavaScript code is sent, it could be even more efficient by having a corresponding web component for each element. This is something that is likely to happen in a future release.

## Built-in components

### uib-var - include a managed variable in the page

A built-in web component `<uib-var>`, used in your HTML as `<uib-var variable="uibVarName"></uib-var>`.

Displays the *value* of the given variable name in your web page and *dynamically updates* as long as the variable is changed using `uibuilder.set()`; or from Node-RED using the appropriate uib set command, e.g. `msg = {"command":"set","prop":"myVar","value":"42"}`. By default, the tag inserts the variable value inline with other text. Class and Style attributes can be added as for any other HTML.

Other attributes are available on the component tag:

- `undefined`: If present or set to `on`, or `true`, the component will show even if the variable is undefined. If not present or set to anything else, an undefined variable will be blank.
- `report`: If present or set to `on`, or `true`, the component will return a standard message back to Node-RED when the variable changes value.
- `type`: Must be one of 'plain', 'html', 'markdown', or 'object'. `plain` and `html` simply insert the variable as-is. `markdown` allows the insertion of Markdown as long as the Markdown-IT library is loaded (it will also sanitise the resulting HTML if the DOMPurify library is loaded). `object` does some basic formatting to allow object or array variables to be more easily read.

This works with Markdown via the `uib-element` node as well and even works if DOMPurify is loaded as overrides to its filters are provided.

There is no need to load the component, that is done automatically in the uibuilder client library.

Examples: 

```html
<p>
    UIBUILDER client library version 
    "<uib-var variable="version"></uib-var>".
</p>
```

```html
<p>Last msg received: "<uib-var variable="sentMsg" type="object"></uib-var>".</p>
```

```html
<!-- Shows the value even if undefined. Sends a msg to Node-RED when myVar is changed -->
<p>The answer is <code><uib-var variable="myVar" undefined report></uib-var></code>.</p>
```

```markdown
## My Heading

The version of the uibuilder client library currently 
loaded is `<uib-var variable="version"></uib-var>`.
```

## External components

Web components can be challenging to build but are often fairly simple. There are plenty of web resources to get you started with development of them. However, there are also a lot of existing components that you can easily make use of with Node-RED and UIBUILDER.

### Totally Information experimental web components

Totally Information has a (so far experimental) set of web components that work with or without UIBUILDER though they will generally have extra features when used with. See the [TotallyInformation/web-components GitHub repo](https://github.com/TotallyInformation/web-components) for details. 

### HotNiPi Gauge component

A nice looking gauge was gifted to the community by Node-RED forum contributor HotNiPi and this also works with or without UIBUILDER. See [HotNipi Gauge Web Component](https://github.com/TotallyInformation/gauge-hotnipi) for details. In line with UIBUILDER standards, the gauge component is available in both ESM and IIFE formats for ease of use.

### Other components and libraries

There are many web components and web component libraries available. All should work with UIBUILDER.

- [Basic Material Design components](https://material-web.dev/about/intro/) - supported by Google designers and developers.
- [Elix components](https://component.kitchen/elix) - high-quality basic elements and composable mixins.
- [Webcomponents.org](https://www.webcomponents.org/) - elements, collections and how-to's.
- [Webcomponents.org libraries](https://www.webcomponents.org/libraries)
- [GitHub Components](https://github.com/orgs/github/repositories?q=component) - various components and tools written by GitHub devs.
- [Mozilla Developer Network (MDN) example components](https://github.com/mdn/web-components-examples) - example components, useful to get started on your own.
- [Open Web Components](https://open-wc.org/) - guides, tools and libraries for developing web components.
- [Open Web Components community libraries](https://open-wc.org/guides/community/component-libraries/) - list of potentially useful component libraries.
- "Awesome" lists
  - [obetomuniz/awesome-webcomponents](https://github.com/obetomuniz/awesome-webcomponents/blob/master/README.md)
  - [web-padawan/awesome-web-components](https://github.com/web-padawan/awesome-web-components/blob/main/README.md)

