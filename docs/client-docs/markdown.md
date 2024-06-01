---
title: How to use Markdown with UIBUILDER
description: |
  The UIBUILDER client library supports the rendering of Markdown using the external Markdown-IT library. This document shows you how to make use of that.
created: 2024-04-06 12:23:16
updated: 2024-04-29 17:36:45
---

Markdown is a simple and effective way to write rich content without having to worry about HTML or other complex markup. It is easily edited using just a text editor or there are many tools that will provide a rich editing experience (such as VSCode, Typora, or Obsidian for example).

Markdown has a number of variations, Markdown-IT uses the popular [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) variation which is based on [Commonmark](https://commonmark.org). However, it does not include the GFM options such as standard callouts or checkboxes. See below for how to load Markdown-IT plugins to support these features if required.

## Using Markdown with the uibuilder IIFE client

To use Markdown, you first need to load the [`Markdown-IT` library](https://github.com/markdown-it/markdown-it#readme). You should generally load this in your `index.html` file before loading the uibuilder client library. In the example below, we are using the default uibuilder template but have added the Markdown-IT library **and** the syntax-highlight plugin that lets you produce code blocks like this. Note the order of loading, this is optimal.

```html
    <!-- Your own CSS (defaults to loading uibuilders css)-->
    <link type="text/css" rel="stylesheet" href="./index.css" media="all">
	<link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/styles/hybrid.min.css">

    <!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
	<script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/highlight.min.js"></script>
	<script defer src="https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js"></script>
        <!-- Markdown-IT plugins can also be loaded here -->
        <script defer src="https://cdn.jsdelivr.net/npm/markdown-it-task-lists@latest/dist/markdown-it-task-lists.min.js"></script>
    <script defer src="../uibuilder/uibuilder.iife.min.js"></script>
    <!-- <script defer src="./index.js">/* OPTIONAL: Put your custom code in that */</script> -->
    <!-- #endregion -->
```

> [!TIP]
>
> In the example, we have loaded Markdown-IT and the plugin from the `jsdelivr` CDN - straight from the Internet. If you don't want to have that external dependency, you can install the libraries using the uibuilder node's **library manager tab** (Install `markdown-it` and optionally `highlightjs`).
>
> In that case, the URL's to load would look like: `../uibuilder/vendor/markdown-it/dist/markdown-it.min.js`.

While pre-loading is the best approach, it _is_ possible to dynamically load the libraries at a later point if you really need to. See the "Markdown Passthrough" example flow that is part of the "No-code examples" entry in the Node-RED import library.

## Using with the uibuilder ESM client version

If you are using more modern ES Module code, you only load the `index.js` file direct from `index.html`. You then `import` other libraries in the `js` code:

```javascript
import * as markdownit from '../uibuilder/vendor/markdown-it/dist/markdown-it.min.js'
```

## Verifying 

If correctly loaded, `window.markdownit` will exist. That can be checked using your browser's Dev Tools Console when viewing the uibuilder page.

To check whether Markdown-IT is active, you can use this function in your front-end code: `if ( uibuilder.get('markdown') ) ....`. 

From Node-RED, you can send a msg containing: `{"_uib": {"command":"get","prop":"markdown"}}`.

## Optionally sanitising the HTML

If there are other people who might be able to make changes to the content, it is sensible to sanitise the input. UIBUILDER allows for this through the use of the `DOMPurify` 3rd-party library.

To automatically sanitise Markdown input, make sure that the DOMPurify library is loaded before Markdown-IT.

Details are given on the [Front-end client Introduction page](client-docs/readme).

## No-code Markdown

The `uib-element` node lets you send a Markdown payload to connected client pages simply by selecting the "Markdown" option and indicating where you want the rendered markdown to appear on the page.

An example flow for this approach is included in the Node-RED import examples library for uibuilder in the `no-code-examples` entry.

You can use a Node-RED core `template` node to define Markdown and integrate other data on the server should you wish to. This is demonstrated in the example flow.

It is also possible to use the [front-end router library](client-docs/fe-router) to load and render markdown from **files** as you can see [later in this document](#rendering-markdown-files).

## Low-code Markdown

You can simply examine the output from a `uib-element` node to see how to form your own low-code JSON that will let you load and render Markdown in your own pages.

> [!TIP]
>
> Remember that the UI library that powers uibuilder's low- and no-code features is also available as a stand-alone library for use elsewhere (such as with the core `http` `-in`/`-out` nodes).

Here is an example of a low-code msg that could be sent to a uibuilder node: 

```javascript
msg._ui = {
  "method":"replace",
  "components":[{
      "type":"div",
      "id":"md",
      "parent":"#more",
      "slotMarkdown":"## H2 - Markdown input\n\nSome text in a para\n\n* List #1\n* List #2\n"
  }]
}
```

You can also use the `uibuilder.ui()` function with the same data object if you wish to do the same from your own custom front-end code.

## Rendering Markdown files

UIBUILDER's [front-end router library](client-docs/fe-router) can be used to render Markdown files (`*.md`). As long as you have already loaded the `Markdown-IT` library, Markdown files will be automatically rendered as needed.

> [!TIP]
>
> This feature lets you create Markdown-based knowledge and content apps similar to Notion or Obsidian.

## Rendering Markdown in your own front-end JavaScript code

You can use the [`uibuilder.replaceSlotMarkdown()`](client-docs/functions#replaceslotmarkdownel-component-replace-or-add-an-html-element39s-slot-from-a-markdown-string) function in your own browser client code to render Markdown.

Or, you can use the [`uibuilder.ui()`](client-docs/functions#ui) function with low-code JSON data as shown above.

## Extending Markdown-IT with plugins

Markdown-IT has a very extensive set of plugins for code highlighting, diagrams and much more.

UIBUILDER already caters for code highlighting and you only need to load the library as shown earlier.

Most plugins should be searchable on `npm` using the [#markdown-it tag](https://www.npmjs.com/search?q=markdown-it).

To make use of other plugins, you need to both load the plugin using a `<script>` tag (or `import` if using ESM) **and** tell the uibuilder client library to use it and how to configure it. Configuration is done by giving the client library a configuration object that looks like this:

```json
[
    "<plugin-name1>", // If no configuration options needed
    { "<plugin-name2>": {/* ... options ... */} }, // If configuration options are needed
]
```

For example (in front-end JS code), using [markdown-it-task-lists](https://www.jsdelivr.com/package/npm/markdown-it-task-lists?path=dist):

```javascript
uibuilder.set('ui_md_plugins', [
    { 'markdownitTaskLists': {enabled: true} },
])
```

When looking at plugins, check how they define the `md.use()` entry. Each entry in the `uibuilder.ui_md_plugins` array variable corresponds to the name of the plugin to load (which must exist on the the browser global `window` variable, that generally happens automatically when you load the plugin library using `<script>` tags or an `import`). If the entry in the array is given as an object, the object key is the plugin name and the value must be an object defining the options.

### Commonly useful plugins

* Checkboxes/Task Lists - [markdown-it-task-lists](https://www.jsdelivr.com/package/npm/markdown-it-task-lists?path=dist)
  While you can enable the checkboxes, they will not, of course, do anything useful. However, a list containing checkboxes is given the class `contains-task-list` and each list item with a checkbox is given the class `task-list-item enabled` and contains a `<input class="task-list-item-checkbox" type="checkbox">`. So you could add your own event listener to every instance and listen for click or change events, sending the updates back to Node-RED.
  This front-end JS code will add an event listener to the browser that will report back when checkboxes have changed value. See the no-code example flow in Node-RED for a full example.

  ```javascript
  // Add to body element so that checkboxes added late are still picked up
  $('body').addEventListener('change', (event) => {
      const el = event.target
      if (el.classList.contains('task-list-item-checkbox')) {
          const changedList = el.closest('.contains-task-list')
          const changedListItem = el.closest('.task-list-item')
          const changedEntryNumber = Array.from(changedList.children).indexOf(changedListItem) + 1;
  
          uibuilder.send({
              'topic': 'markdown-checkbox-clicked',
              payload: {
                  'checked': el.checked,
                  'entryText': el.nextSibling.textContent,
                  'entryOffset': changedEntryNumber
              }
          })
      }
  })
  ```

* GitHub style callouts/alerts - [markdown-it-github-alert](https://www.npmjs.com/package/markdown-it-github-alert)

* Mermaid diagrams - [markdown-it-mermaid](https://www.jsdelivr.com/package/npm/@wekanteam/markdown-it-mermaid)



