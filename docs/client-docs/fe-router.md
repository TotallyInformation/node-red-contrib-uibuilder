---
title: UIBUILDER Front-End Router Library for SPAs
description: |
  Details on the configuration and use of UIBUILDER's front-end router used to create Single-Page Applications (SPA's).
created: 2022-02-01 11:15:27
updated: 2025-08-18 17:57:03
---

> [!TIP]
> See the full SPA/router example in Node-RED's import feature.
> `examples > uibuilder > Client-side code > SPA FE Router Test`
>
> This will help you understand the structure and provides a fully working example.

The `uibrouter` front-end library defines a `UibRouter` class. This allows both internal and external content to be dynamically shown, allowing the creation of ["Single-Page Applications" (SPA's)](https://developer.mozilla.org/en-US/docs/Glossary/SPA) or simply keeping parts of the UI hidden from the users until they need them.

The configuration of your router - that defines all of the routes and their behavior - is done through a JavaScript object and then passed to the `UibRouter` constructor. E.g. `const routerConfig = { ... }; const router = new UibRouter(routerConfig);`

"Internal" route *content* is defined in `<template>` element *tags* in your HTML. Each must have an `id` attribute that matches the route id specified in the router config.

"External" route *content* is defined in additional HTML *files* in the same location as your index.html/index.js (or in a convenient sub-folder as desired) so that they are served up by Node-RED/uibuilder as per your other front-end web assets.

New routes can be added from Node-RED if needed.

> [!WARNING]
> (v7.5.0) In your router template HTML, do not use an element `id` attribute of the same name as the route ID defined in your router config. If you do, its content gets deleted when you change routes. We will try to fix this in a future release.

## Creating a front-end router

Add the router library url to a script link in your HTML file. Add it **after** the uibuilder library if using with UIBUILDER.

Create a new router instance in code - see the Example at the end of the page or load the example from Node-RED's example library.

Create internal and external route templates as needed and define in the router config.

The router class library is available in the uibuilder front-end resources in several formats. However, it is not dependent on UIBUILDER and can be extracted and used elsewhere as desired noting the license and copyright information embedded in the source.

The easiest way to include the router is to use the `../uibuilder/utils/uibrouter.iife.min.js` version in a script link in your HTML. This loads the `UibRouter` class as a global reference. If, however, you are loading your scripts as ES Modules, you should use `../uibuilder/utils/uibrouter.esm.min.js` in your import. Both versions have `.map` files which makes debugging easier.

> [!NOTE]
> At this time, only a single instance of the router is supported on a page.

## Triggering a route change

Routes are triggered using the browser's native "hash" URL mechanism. So any method of changing the browser's URL can be used to change routes. This means that the browser history and forward/back navigation will work as expected.

Hash URL navigation does not cause a full page reload, making it ideal for SPAs as all of the content, including dynamic content, is retained.

### From Node-RED

Route changes can be triggered from Node-RED flows by sending a message to the uibuilder node with msg content such as:

```json
{"_uib": {"command":"navigate","prop":"#newroute"}}
```

See [Client Functions (navigate)](client-docs/functions#navigate) for details.

Don't forget that there is also a `watchUrlHash` function, also callable as a command. That will send a message to Node-RED on every route change.

### In the browser

There are three ways to trigger a route change from the browser:

* User manually changing the URL, adding `#routeid` to the end of the page URL.
* Link tags with a hash url only, `<a href="#routeid">`
* Javascript using `router.doRoute('routeid')`

They all do the same thing.

Here is an example of a very simplistic menu that uses URL links:

```html
<ul id="routemenu">Route Menu
    <li><a href="#route01">#1 (Internal template)</a></li>
    <!-- The queryparameters do not effect the routing -->
    <li><a href="#route02?doh=rei">#2 (Internal template)</a></li>
    <li><a href="#route03">#3 (External template)</a></li>
</ul>
```

And an example of triggering a route change in code:

```javascript
router.doRoute('route02')
```

Or even from a click event on a random HTML element:

```html
<div href="#route01" onclick="router.doRoute(event)">Go to route #1 via click event handler.</div>
```

## Operational modes

The router can act in one of two ways.

The default load/unload mode deletes a route's HTML when a route change occurs and duplicates the route template into the route container each time a route is activated.

The hide/show alternate mode, only duplicates the route template once, on first access. Subsequent route changes just set the route container to CSS `display: none` before either duplicating a new template into place or removing (unhiding) the `display: none` if that route had previously been selected.

The Load/Unload mode is the default. To use Show/Hide mode, set the `hide` option in the router config to `true`.

All route content is lazy-loaded on first access of the route. For external, file-based routes, this means that the file is only fetched when the route is first accessed. Since that might occasionally lead to a minor delay for the content to be rendered, you can set the `templateLoadAll` option in the router config to `true`. This will cause all external route templates to be loaded when the router is instantiated. Note that this does not apply to internal templates which are always loaded on first access.

You can also use the `templateUnload` option to control when external templates are removed from memory. The default `true` value means that external templates are removed from memory once their content has been rendered. For external templates, it might occasionally be better to use `false` if your network connection is slow or unreliable.

| Mode      | Advantages                                                   | Disadvantages                                                |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Load/Unload | Keeps `<body>` code as simple as possible.<br /><br />The visible clone is reset back to the template on every access. | Any `script` tags are re-executed. So requires code that should not be re-executed (such as code that creates global variables or functions) to be wrapped with a flag preventing re-execution.<br /><br />Internal templates must be retained in memory, external templates have to be reloaded each time. |
| Show/Hide | `script` tags in routes are only executed once.<br /><br />Internal templates can be unloaded after use, external templates do not have to be reloaded. | `script`s cannot be run multiple times, define a function that can be called instead.<br /><br />The visible clone cannot be reset back to the default. Once accessed, the template is never used again.<br /><br />Clutters up `body` code, potentially keeps duplicate code in memory (the template and the visible clone) unless you forcibly unload the template after access. |

Which mode you use will be dependent on what you want to achieve.

## Configuration

See the example below for configuration settings.

### Configuration Schema

This provides the formal description for the configuration object.

```js
/** Type definitions
 * routeDefinition
 * @typedef {object} routeDefinition Single route configuration
 * @property {string} id REQUIRED. Route ID
 * @property {string} src REQUIRED for external, optional for internal (default=route id). CSS Selector for template tag routes, url for external routes
 * @property {"url"|undefined} [type] OPTIONAL, default=internal route. "url" for external routes
 * @property {string} [title] OPTIONAL, default=route id. Text to use as a short title for the route
 * @property {string} [description] OPTIONAL, default=route id. Text to use as a long description for the route
 * @property {"html"|"md"|"markdown"} [format] OPTIONAL, default=html. Route content format, HTML or Markdown (md). Markdown requires the Markdown-IT library to have been loaded.
 *
 * otherLoadDefinition
 * @typedef {object} otherLoadDefinition Single external load configuration
 * @property {string} id REQUIRED. Unique (to page) ID. Will be applied to loaded content.
 * @property {string} src REQUIRED. url of external template to load
 * @property {string} container REQUIRED. CSS Selector defining the parent element that this will become the child of. If it doesn't exist on page, content will not be loaded.
 *
 * @typedef {object} routeMenu Single navigation menu configuration
 * @property {string} id REQUIRED. Unique (to page) ID. Used as the menu container
 * @property {"horizontal"|"vertical"} [menuType] OPTIONAL. Type of menu to create. Default is "horizontal", "vertical" is not yet supported
 * @property {string} [label] OPTIONAL. Text to use as an accessible label for the nav element
 *
 * UibRouterConfig
 * @typedef {object} UibRouterConfig UiBRouter router configuration
 * @property {routeDefinition[]} routes REQUIRED. Array of route definitions
 * @property {Array<string|object>} [mdPlugins] OPTIONAL. Array of Markdown-IT plugins
 * @property {string} [defaultRoute] OPTIONAL, default=1st route. If set to a route id, that route will be automatically shown on load
 * @property {string} [routeContainer] OPTIONAL, default='#uibroutecontainer'. CSS Selector for an HTML Element containing routes
 * @property {boolean} [hide] OPTIONAL, default=false. If TRUE, routes will be hidden/shown on change instead of removed/added
 * @property {boolean} [templateLoadAll] OPTIONAL, default=false. If TRUE, all external route templates will be loaded when the router is instanciated. Default is to lazy-load external templates
 * @property {boolean} [templateUnload] OPTIONAL, default=true. If TRUE, route templates will be unloaded from DOM after access.
 * @property {otherLoadDefinition[]} [otherLoad] OPTIONAL, default=none. If present, router start will pre-load other external templates direct to the DOM. Use for menu's, etc.
 * @property {routeMenu[]} [routeMenus] OPTIONAL, default=none. If present, router will create navigation menus for each entry defined in this array.
 *
*/
```

## Defining route templates

Internal route templates are simply valid HTML wrapped in a `<template>` tag. They may contain `<style>` and `<script>` tags if needed though note the potential issues listed below. Internal templates can go into the `<head>` section of your HTML if you want to keep the `<body>` clear. Template tags are standard HTML and are not loaded into the DOM.

External route templates are simply HTML files with the same format as the internal route templates shown (without the `<template>` tags). They should be HTML document fragments and so should not have `<!doctype html>`, `<html>`, `<head>`, or `<body>` tags. The router will automatically load the templates on startup. The external templates are loaded to the end of the `<head>` section of the page HTML.

## Defining navigation menus

There are many different ways to define navigation menus in HTML, the library will auto-create simple menu's for you and provide you with the information needed to generate your own custom menu's. But, of course, you can manually create your own menu's if you prefer.

### Automatically generated menus

If you wish to automatically generate menus, simply provide the `routeMenus` property to the router config and add a parent element to your HTML:
```javascript
// Auto-navigation menu - create an element menu1 to act as parent
routeMenus: [
    {
        id: 'menu1',
        menuType: 'horizontal',
        label: 'Main Menu',
    },
],
```
This lets you create any number of menus anywhere on your page.

> [!NOTE]
> As of v7.5.0, auto-menus are limited to being horizontal nav menu's a single level deep. There is a single entry for each defined route.

Alternatively, you can use the `routeList()` method of the router library. This returns an array of information that will let you generate your own menu's using your own custom code.

### Manual menu definitions

To enable the router library to mark the current route in a menu, all you need to do is to use an HTML list where list items are marked with `<li data-route="routeid">`. Wherever `routeid` matches the new current route, the router will automatically add attributes `<li data-route="routeid" class="currentRoute" aria-current="page">`. Removing them from all other `li` tags having a `data-route` attribute.

This means that you can have multiple menu's on-page and each can be styled differently.

#### Example

```html
<header>
    <h1 class="with-subtitle">Home Panel: <uib-var variable="uibrouter_CurrentTitle"></uib-var></h1>
    <div role="doc-subtitle">Using the UIBUILDER IIFE &amp; router libraries</div>
    
    <nav id="main-menu" class="horizontal" aria-labelledby="primary-navigation">
        <h2 id="primary-navigation">Menu</h2>:
        <ul id="routemenu" role="menubar" aria-describedby="main-menu">
            <li data-route="route01" tabindex="0" role="menuitem"><a href="#route01">Home Summary</a></li>
            <li data-route="lights" tabindex="0" role="menuitem"><a href="#lights">Lighting</a></li>
            <li data-route="status01" tabindex="0" role="menuitem"><a href="#status01">System Status</a></li>
            <li data-route="wanted" tabindex="0" role="menuitem"><a href="#wanted">To Do List</a></li>
        </ul>
    </nav>
</header>
```

![screenshot of example menu](image-1.png)

## Events

These are the custom `document` events used by the router class. Listen for them using `document.addEventListener('eventname', callbackFn)`. The callback function may receive additional data as an argument where shown below.

* `uibrouter:loaded` - When all internal and external routes have loaded.
* `uibrouter:route-changed` - when a route change is successful. Details contain new and old route id's.
* `uibrouter:route-change-failed` - when a route change fails and is rolled back. Details contain new and old route id's.
* `uibrouter:routes-added` - When new routes added (via `router.addRoutes()`).

Note that, when used with UIBUILDER, several managed uibuilder variables are also set - see the [section on UIBUILDER below](#using-with-uibuilder). These generate their own events that can be monitored via `uibuilder.onChange` (in JavaScript) or via `<uib-var variable="...."></uib-var>` (in HTML).

## Variables

* `config` - A copy of the input configuration used to create the router.
* `currentRouteId` - The route id of the currently showing route.
* `previousRouteId` - The route if of the previously showing route.
* `routeContainerEl` - A reference to the DOM (HTML) element containing the displayed route(s)
* `routeIds` - An array of route IDs
* `version` - The version of the router class being used

Note that, when used with UIBUILDER, several managed uibuilder variables are also set - see the [section on UIBUILDER below](#using-with-uibuilder).

## Methods

* `addRoutes(routeConfig)` - Add a single or an array of route config objects which adds new routes to the router.
  
  External routes will be loaded to template tags as per class startup. Note that external templates are loaded asynchronously. Check for the `uibrouter:routes-added` custom event to have fired or listen for the uibuilder `uibrouter` managed variable to be set to `routes added` to detect when all new external routes have been loaded.

* `addRoutes(routeDefinition)` - Add a new route to the configuration.
* `currentRoute()` - Returns the configuration data `{id, src, type, title, description}` of the current route as a JavaScript object.
* `defaultRoute()` - Show the default route if it has been defined in the config.
* `deleteTemplates(templateIds=all, externalOnlyFlag=true)` - Delete some or all templates from the browser. Optionally restricting to only external templates.
* `doRoute(routeSource)` - Manually show a specific route id.
* `ensureTemplate(routeId)` - Async method to ensure that a template element exists for a given route id. If route is external, will try to load if it doesn't exist. Throws an error if no template possible.
* `getRouteConfigById(routeId)` - Gets route configuration details for a given route id.
* `isRouteExternal(routeId)` - Returns true if the given route id is an external route.
* `keepHashFromUrl(url)` - Given a URL, extracts and returns a route id.
* `loadExternal(routeDefinition)` - Loads an external route template given a valid route definition.
* `loadOther(extOther)` - Load other (non-route) external files and apply to specific parents (mostly used for externally defined menus).
* `loadRoute(routeId, routeParentElement)` - Async method to create DOM route content from a route template (internal or external) - loads external templates if not already loaded. Route templates have to be a `<template>` tag with an ID that matches the route id. Scripts in the template are run at this point. All errors throw so make sure to try/catch calls to this method. Can also load and render Markdown route templates if the Markdown-IT library is pre-loaded.
* `noRoute()` - Removes/hides the current route content and removes the route ID from the browser URL leaving no route showing. NOTE that this will ***NOT*** trigger *route or hash change events*.
* `removeHash()` - Removes the hash from the browser URL.
* `renderMarkdown(mdText)` - Converts a string of Markdown to HTML if the Markdown-IT library is pre-loaded.
* `routeDescription()` - Returns the description of the current route or its ID if the `description` property not set.
* `routeList(returnHash)` - Return an array of route id's. Useful for creating routing menu's. If the optional `returnHash` is set to true, returns id's prefixed with a `#` for direct use in `href` attributes.
* `routeTitle` - Returns the title of the current route or its ID if the `title` property not set.
* `setCurrentMenuItems()` - Updates any on-page menu's so that the currently selected route can be highlighted. Adds `class="currentRoute" aria-current="page"` to the current route item in the list and removes them from all other items. Assumes that you are using an HTML list where the list items are marked with `<li data-route="routeid"`. Wherever `routeid` matches the new current route, the above attributes are added.
* `unloadTemplate(routeId, externalOnlyFlag=true)` - Unloads a single route template. Optionally restricting to only external.

> [!NOTE]
> Any class methods starting with `_` are for internal use only and must not be used in your own code.

## Errors

TBC

## Including styles and scripts in route content

TBC

### Notes

* If using the router's "Load/Unload" mode (default), remember that scripts in the template are _run every time the route is activated_. So make sure to put a gate test in the script if you want it to only run once. See the `route03.html` file in the built-in example for how to do this. Particularly bear this in mind when adding things like uibuilder.onChange or other event handlers, as these accumulate rather than replace when redefined.

* You can reference elements added in the template from the script in the template (the addEventListener for example).

* Because of the way that scripts from the templates have to be applied, any code is effectively global to the page. Bear that in mind as it is likely different to some frameworks. 

* Similarly with styles, styles defined in a template will end up applied to the whole page. Prefix class names with template names to avoid conflicts if needed. However, in "Load/Unload" mode, styles will not exist until the route as been activated at least once unless the `templateLoadAll` option is set to `true`. In "Show/Hide" mode, styles are always applied as they are loaded into the DOM.

* In HTML, scripts are not really meant to be dynamically added/removed so use scripts embedded in external route files with caution.

* Remember that styles in external templates, when using "Load/Unload" mode, only exist while that route is loaded. While you can reference that style anywhere on page, it will only apply when the route is loaded. This could be used to get some interesting effects such as having page styles change outside the route display based on the current route (though it would require the route to be unloaded when not in use).


## Using with uibuilder

While not dependent specifically on UIBUILDER to work, the router class does work nicely with it and is enhanced by it.

### Monitoring for route changes

#### In front-end HTML

As the router will generate managed variable updates (see below), you can use the `<uib-var>` component in your HTML. The content will automatically update as things change.

```html
Current route ID: <uib-var variable="uibrouter_CurrentRoute"></uib-var>.
Route title: <uib-var variable="uibrouter_CurrentTitle"></uib-var>.
Route description: <uib-var variable="uibrouter_CurrentDescription"></uib-var>.
```

Note that the title and description are optional properties, where not present, the route ID will be shown instead.

#### In front-end JavaScript code

You can either use the uibuilder managed variables and `uibuilder.onChange` or the custom events (see the [events](#events) section above) with a JavaScript event handler.

```javascript
// Assumes use of uibuilder and assumes `const router = new uibrouter(config)`
uibuilder.onChange('uibrouter', (eventname) => {
    if (eventname === 'route changed') {
        // Uses 2 of the router variables - see below for the full list
        console.log(`ROUTE CHANGED. New Route: ${router.currentRouteId}, Old Route: ${router.previousRouteId}`)
    }
})
// OR
uibuilder.onChange('uibrouter_CurrentRoute', (routeId) => {
    console.log(`ROUTE CHANGED. New Route: ${routeId}`)
})
```


#### In Node-RED

The simplest way to report route changes back to Node-RED is to use uibuilder's `watchUrlHash()` function or monitor changes on the managed variable `urlHash`.

The `watchUrlHash()` function will send a message back to Node-RED with the following format:

```json
{
    "topic": "hashChange",
    "payload": "#route02",
    "newHash": "#route02",
    "oldHash": "#route01",
    "_socketId": "sXQLk3yJw-8AkMg6AAH6",
    // "_uib": { ... }, // Shown if `Include msg._uib in standard msg output.` turned on in uibuilder node
    "_msgid": "7304ef8d00bee8b4"
}
```

You will probably want the "Include msg._uib in standard msg output" flag turned on in the uibuilder node so that you can know which client id and page the notification came from.

This feature can be turned on in your front-end code with `uibuilder.watchUrlHash()` or from Node-RED by sending a uibuilder command message with `msg._ui` set to `{"command": "watchUrlHash"}` (which toggles the watch on/off). See [Control from Node-RED](client-docs/control-from-node-red#watchurlhash-watch-for-url-hash-changes) in the docs for more details.

### Managed variables

The router also sets some uibuilder managed variables:

* `uibrouter`: Set to `loaded`, `route changed`, `route change failed`, or `routes added` at appropriate times.
* `uibrouter_CurrentRoute`: The ID of the current route.
* `uibrouter_CurrentTitle`: The route title. Will show the ID if the route's `title` property not set.
* `uibrouter_CurrentDescription`: The route description. Will show the ID if the route's `description` property not set.
* `uibrouter_CurrentDetails`: The route configuration object for the current route.

Managed uibuilder variables can be monitored via `uibuilder.onChange` (in JavaScript) or via `<uib-var variable="...."></uib-var>` (in [HTML](#in-front-end-html)).


## Rendering Markdown routes

The router library supports having route content defined as Markdown rather than HTML. To render the Markdown into HTML, the [Markdown-IT](https://www.npmjs.com/package/markdown-it) library needs to have been loaded either from a CDN (Internet required) or by pre-installing in Node-RED via the UIBUILDER library manager.

Load the Markdown-IT library in your HTML head section BEFORE you load the router library (and before loading the uibuilder library):

Markdown-IT supports the CommonMark spec with some extensions to support things like GitHub Flavored Markdown, Autolinking and typography. It is configured to be secure by default.

The Markdown renderer supports additional Markdown-IT addins. You must pre-load the addin library and configure Markdown-IT using the `mdPlugins` property in the router config. See the Markdown-IT documentation for how to do this.

Markdown-IT has been pre-configured for you to allow the use of basic syntax highlighting using [HighlightJS](https://highlightjs.org) for code blocks (in triple backslashes). To make use of it, all you need to do is to pre-load the library and CSS:

```html
<!-- Your own CSS (defaults to loading uibuilders css)-->
<link type="text/css" rel="stylesheet" href="./index.css" media="all">
<!-- Optional CSS for Markdown code highlighting, see https://highlightjs.org/demo for other themes -->
<link type="text/css" rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/styles/hybrid.min.css">

<!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
<!-- Optional library for highlighting Markdown code blocks -->
<script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/highlight.min.js"></script>
<!-- Optional Markdown-IT library - needed for Markdown content routes -->
<script defer src="https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js"></script>
<script defer src="../uibuilder/uibuilder.iife.min.js"></script>
<script defer src="../uibuilder/utils/uibrouter.iife.min.js"></script>
<script defer src="./index.js"></script>
<!-- #endregion -->
```

Some HTML is also allowed in the markdown content. In particular, you can use things like `<uib-var variable="uibrouter_CurrentTitle"></uib-var>` to render uibuilder variables.

## Other Notes

* Your routes can be a mix of external HTML fragment files and internal `<template>` tags.
* An incorrect URL for an external template will give a console error but everything else will still work but the route is ignored.
* You can define a container that the output route goes into but if you don't give your own, one is added at the end of the `body`.
* If you give a route container id that doesn't actually exist, an error is generated and the router won't work.
* Manually added templates can go anywhere in the HTML but I put them in the `<head>` out of the way. External templates are added to the end of the head.
* The exact order of the templates in the HTML is not guaranteed because they are all loaded in parallel. This should not matter.
* The external templates are lazy loaded into the page when the rout is first displayed. You can override this by setting the `templateLoadAll` option in the router config to `true`. This will load all external templates when the router is created on page load.
* For the default mode (`hide:false`), a script defined in an external template is run EVERY time the route is loaded. Bear this in mind when adding things like `uibuilder.onChange` handlers, as these accumulate rather than replace. Wrap code that should only run once in a check using a flag you set at the end of the code.
* Any change of route is entirely up to you. You can use a menu, "tabs" or anything else to control route changes. You can do them from code with `router.doRoute('routeid')` or a navigation event as well as from Node-RED. You just need to ensure that the element that triggers the change has an href that matches a route. It is best and safest to always use `<a href="#routeid">` tags because they also trigger the browser's URL Hash change processing. UIBUILDER has functions for monitoring that should you need them, or you can add your own event listener.

## Example

There is a more complete example flow available in the uibuilder examples library.

```javascript
const routerConfig = {
    // Router templates created inside the routeContainer, specify an CSS selector
    // If not provided, defaults to '#uibdefaultroutecontainer' which is added as the last element of the body.
    // If provided but does not exist, will error and the router won't work
    routeContainer: '#uibroutecontainer',

    // Optionally, chose a default route id to be displayed on load
    // If not given, the first defined route is used.
    defaultRoute: 'route03',

    // Optional, default=false. False unloads route content when going to a new route.
    // Set to true to hide/unhide rather than unload/load the actual route elements.
    // When false:
    //  - Scripts in the templates execute every visit to the route.
    //  - Template content completely removed from browser when leaving the route.
    //  - Ensures latest template content is loaded on each visit.
    // When true, scripts only run the first time. Content is retained & template not updated
    hide: false,

    // Optional, default=false. False loads external templates on first use.
    // Set to `true` to pre-load all external templates
    // templateLoadAll: true,

    // Optional, default=true. If true, templates are unloaded after use.
    // Only set to false if your network is slow to load the templates.
    // templateUnload: true,

    // Define the possible routes type=url for externals
    // Can be an object or an array but each entry must be an object containing {id,src,type}
    //   type can be anything but only `url` will be treated as an external template file.
    //   src is either a CSS selector for a <template> or a URL of an HTML file.
    //   id must match the href="#routeid" in any menu/link. and `<template id="routeid">` on any loaded template
    //      must be unique on the page
    routes: [
        {
            id: 'route01', src: '#route01', // internal template
            title: 'Route 1', description: 'My first route',
        }, {
            id: 'route02', src: '#route02', // internal template
            title: 'Route 2', description: 'My second route',
        }, {
            id: 'route03', src: './fe-routes/route03.html', type: 'url', // external template
            title: 'Route 3', description: 'My third route',
        },
        // Testing Markdown template - Markdown-IT Library must be loaded
        {
            id: 'route-md-01', src: './fe-routes/route-md-01.md', type: 'url',
            title: 'Markdown Route 1', format: 'markdown',
            description: 'A route defined using markdown #1',
        },
    ],

    // Optional. Auto-navigation menu - create an element menu1 to act as parent
    routeMenus: [
        {
            id: 'menu1',
            menuType: 'horizontal',
            label: 'Main Menu',
        },
    ],

    // OPTIONAL. If present, external html is loaded direct to DOM
    // Templates that fail to load are ignored
    otherLoad: [
        {
            id: 'external-content',
            src: './fe-routes/other-content.html',
            container: '#common-content', // CSS Selector for parent
        }
    ],
}
const router = new UibRouter(routerConfig)
```

With a simple HTML Menu (use the auto-menu for a more comprehensive solution):

```html
<ul id="routemenu">Route Menu
    <li><a href="#route01">#1 (Internal template)</a></li>
    <li><a href="#route02?doh=rei">#2 (Internal template)</a></li>
    <li><a href="#route03">#3 (External template)</a></li>
</ul>
```

To load the library when using with UIBUILDER (based on the "Blank" uibuilder template):

```html
<!doctype html>
<html lang="en"><head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="../uibuilder/images/node-blue.ico">

    <title>FE Router - Node-RED uibuilder</title>
    <meta name="description" content="Node-RED uibuilder - FE Router">

    <!-- Your own CSS (defaults to loading uibuilders css)-->
    <link type="text/css" rel="stylesheet" href="./index.css" media="all">
    <!-- Optional CSS for Markdown code highlighting -->
    <link type="text/css" rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/styles/hybrid.min.css">
    
    <!-- #region Supporting Scripts. These MUST be in the right order. Note no leading / -->
    <!-- Optional library for highlighting Markdown code blocks -->
    <script defer src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@latest/build/highlight.min.js"></script>
    <!-- Optional Markdown-IT library - needed for Markdown content routes -->
    <script defer src="https://cdn.jsdelivr.net/npm/markdown-it@latest/dist/markdown-it.min.js"></script>
    <script defer src="../uibuilder/uibuilder.iife.min.js"></script>
    <script defer src="../uibuilder/utils/uibrouter.iife.min.js"></script>
    <script defer src="./index.js"></script>
    <!-- #endregion -->

    <template id="route01">
        <h2>This comes from an internal <code class="r01style">&lt;template></code> tag</h2>
        <div>
            Route 1
        </div>
        <script>
            console.info('I was produced by a script in Route 1')
        </script>
        <style>
            .r01style {
                background-color: yellow;
                color: blue;
                font-weight: 900;
            }
        </style>
    </template>
    <template id="route02">
        <h2>This also comes from an internal <code>&lt;template></code> tag</h2>
        <div class="extraclass">
            Route 2
        </div>
    </template>
    <!-- NB: Markdown cannot be defined in a template, must be external -->
</head><body>
    <header>
        <h1 class="with-subtitle">An example of a framework-less front-end router</h1>
        <div role="doc-subtitle">Using the UIBUILDER IIFE library for Node-RED.</div>

        <div id="menu1"><!-- Used by the router's auto-menu --></div>

        <!-- Using internal router variables to show the current route's title and id -->
        <div style="background-color: dimgrey;">
            <h2 class="with-subtitle">Current Route Title: <uib-var variable="uibrouter_CurrentTitle"></uib-var></h2>
            <div role="doc-subtitle"><uib-var variable="uibrouter_CurrentDescription"></uib-var></div>
        </div>
    </header>

    <main>
        <!-- We can manually load a route using this if you want to
             But you may prefer a menu (see config and menu1 id in header) -->
        <!-- <div href="#route01" onclick="router.doRoute(event)" class="border" style="cursor: pointer;">Goto route #1 via click event handler</div> -->

        <div id="more"><!-- '#more' is used as a parent for dynamic HTML content in examples --></div>
    
        <div id="uibroutecontainer"><!-- router content will appear here --></div>
    </main>

    <section id="common-content"><!-- from external content --></section>

    <footer uib-topic="footer" style="border: 1px dashed silver;">
        <!-- Set dynamically from Node-RED -->
        Pre-defined footer
    </footer>
</body></html>
```
